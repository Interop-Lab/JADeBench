#!/usr/bin/env python3
"""Run the L0 static-prompting baseline.

The L0 contract is intentionally small: the model receives only the
obfuscated source and a fixed task statement, then returns one JavaScript
program.  There is no execution, debugger, preprocessing, or candidate
verification in this driver.  The output follows the evaluator's
``predictions.jsonl`` contract and every request/response is archived as a
per-build transcript.

The HTTP client uses an OpenAI-compatible Chat Completions endpoint and the
standard library only.  Two first-class gateways are wired in:
OpenRouter (``config.example.json``) and Sophnet
(``config.sophnet.example.json``).  Any other OpenAI-compatible server still
works by setting ``base_url`` / ``api_key_env`` directly.  Credentials stay
out of the repository.
"""

from __future__ import print_function

import argparse
import concurrent.futures
import hashlib
import json
import os
import re
import sys
import threading
import time
import urllib.error
import urllib.request
from pathlib import Path


HERE = Path(__file__).resolve().parent
if HERE.parent.parent.name == "artifacts":
    ARTIFACTS_ROOT = HERE.parent.parent
    PROJECT_ROOT = ARTIFACTS_ROOT.parent
else:
    PROJECT_ROOT = HERE.parent.parent
    ARTIFACTS_ROOT = PROJECT_ROOT
DEFAULT_BUILDS = (
    ARTIFACTS_ROOT
    / "samples"
    / "diverse6"
    / "corpus"
    / "jsob"
    / "manifest.jsonl"
)
DEFAULT_CONFIG = HERE / "config.example.json"
DEFAULT_PROMPT = HERE / "prompt.txt"
# HTTP gateways that L0 can fill in from ``provider`` (or a ``provider/model``
# prefix).  OpenRouter model ids keep their vendor path (``anthropic/...``);
# Sophnet wants the bare project model name.
PROVIDERS = {
    "sophnet": {
        "base_url": "https://www.sophnet.com/api/open-apis/v1",
        "api_key_env": "SOPHNET_API_KEY",
        "default_model": "DeepSeek-V4-Pro-0813",
    },
    "openrouter": {
        "base_url": "https://openrouter.ai/api/v1",
        "api_key_env": "OPENROUTER_API_KEY",
    },
    "openai": {
        "base_url": "https://api.openai.com/v1",
        "api_key_env": "OPENAI_API_KEY",
    },
    "soleapi": {
        "base_url": "https://api.soleapi.com/v1",
        "api_key_env": "SOLEAPI_API_KEY",
        "default_model": "claude-opus-5",
        # Native Anthropic Messages; Chat Completions is unofficial and
        # times out or returns empty completions on real L0 payloads.
        "api_style": "anthropic",
    },
}

_FENCE_RE = re.compile(
    r"```(?:javascript|js|node|cjs|mjs|typescript|ts)?\s*\n?(.*?)```",
    re.IGNORECASE | re.DOTALL,
)
_CODE_START_RE = re.compile(
    r"^\s*(?:import\b|export\b|(?:var|let|const|function|class)\b|"
    r"module\.exports\b|exports\.|Object\.defineProperty\b|['\"]use strict['\"]|"
    r"/\*|//)"
)
_SAFE_RE = re.compile(r"[^A-Za-z0-9_.-]+")
_write_lock = threading.Lock()


def read_json(path):
    with Path(path).open(encoding="utf-8") as fh:
        return json.load(fh)


def write_json(path, value):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n",
                    encoding="utf-8")


def read_jsonl(path):
    path = Path(path)
    if not path.exists():
        return []
    rows = []
    with path.open(encoding="utf-8") as fh:
        for line in fh:
            if line.strip():
                rows.append(json.loads(line))
    return rows


def build_source_path(manifest, build):
    """Resolve current and historical build-manifest source fields."""
    relative = build.get("path") or build.get("jsob_file") or build.get("vm_file")
    if not relative:
        raise ValueError(
            "build %s has no path, jsob_file, or vm_file"
            % (build.get("build_id") or "<unknown>")
        )
    path = Path(relative).expanduser()
    if not path.is_absolute():
        path = Path(manifest).parent / path
    return path.resolve()


def select_builds(builds, tool=None, config_id=None):
    """Choose builds from a manifest.

    Dedicated experiment files (for example VM or LLM inputs) contain one
    tool/config and are used as-is. The full open-source ladder is mixed, so the
    historical default remains javascript-obfuscator/full unless the caller
    sets tool/config_id.
    """
    if not builds:
        return []
    if tool or config_id:
        return [b for b in builds
                if (not tool or b.get("tool") == tool)
                and (not config_id or b.get("config_id") == config_id)]
    tools = {b.get("tool") for b in builds}
    configs = {b.get("config_id") for b in builds}
    if len(tools) == 1 and len(configs) == 1:
        return list(builds)
    return [b for b in builds
            if b.get("tool") == "javascript-obfuscator"
            and b.get("config_id") == "full"]


def append_jsonl(path, row):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    line = json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n"
    # The main thread writes today, but keeping this atomic makes the helper
    # safe if a caller later chooses to emit from workers.
    with _write_lock:
        with path.open("a", encoding="utf-8") as fh:
            fh.write(line)


def slug(value):
    value = _SAFE_RE.sub("_", value).strip("._")
    return (value or "build")[:180]


def estimated_tokens(text):
    """Conservative, tokenizer-independent estimate used for accounting."""
    return (len(text.encode("utf-8")) + 3) // 4


def truncate_source(source, max_tokens):
    """Keep a valid, explicit head/tail slice when L0 cannot fit the context.

    L0 has no paging tool.  Silently dropping a large input would make a model
    failure look like a deobfuscation failure, so the marker and all size
    fields are recorded in the prediction and transcript.
    """
    if not max_tokens or estimated_tokens(source) <= max_tokens:
        return source, False
    # Leave room for the marker and split by characters.  The marker is a JS
    # comment so the model still sees syntactically recognizable boundaries.
    marker = "\n/* [L0 input truncated: middle omitted by the driver] */\n"
    budget_chars = max(256, max_tokens * 4 - len(marker))
    head = int(budget_chars * 0.70)
    tail = budget_chars - head
    return source[:head] + marker + source[-tail:], True


def load_prompt(path):
    text = Path(path).read_text(encoding="utf-8")
    if not text.strip():
        raise ValueError("L0 prompt is empty: %s" % path)
    return text.rstrip() + "\n"


def build_messages(system_prompt, source):
    # Do not put subject_id, project, tool, or runner metadata in the prompt:
    # L0 is static access to the program, not metadata-assisted analysis.
    user = (
        "<obfuscated-javascript>\n"
        + source
        + "\n</obfuscated-javascript>\n\n"
        "Return the single deobfuscated JavaScript program now."
    )
    return [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user},
    ]


def provider_id(value):
    return str(value or "").strip().lower()


def split_provider_model(config):
    """Return (provider, model) without rewriting OpenRouter vendor paths."""
    raw = str(config.get("model") or "").strip()
    provider = provider_id(config.get("provider"))
    model = raw
    if "/" in raw:
        head, rest = raw.split("/", 1)
        head_id = provider_id(head)
        if head_id in PROVIDERS:
            if not provider:
                provider = head_id
            if provider == head_id:
                model = rest
    return provider, model


def apply_provider(config, replace_endpoint=False):
    """Fill gateway URL, key env, and model from a known ``provider``.

    ``replace_endpoint`` is for ``--provider`` on the CLI: switching the
    named gateway should also switch ``base_url`` / ``api_key_env`` unless
    the caller already passed ``--base-url``.
    """
    config = dict(config)
    provider, model = split_provider_model(config)
    if provider:
        config["provider"] = provider
    if model:
        config["model"] = model
    preset = PROVIDERS.get(provider) or {}
    if preset:
        if replace_endpoint or not config.get("base_url"):
            config["base_url"] = preset["base_url"]
        if replace_endpoint or not config.get("api_key_env"):
            config["api_key_env"] = preset["api_key_env"]
        if not config.get("model") and preset.get("default_model"):
            config["model"] = preset["default_model"]
        if preset.get("api_style") and (replace_endpoint or not config.get("api_style")):
            config["api_style"] = preset["api_style"]
    return config


def api_style(config):
    style = str(config.get("api_style") or "").strip().lower()
    if style:
        return style
    provider = provider_id(config.get("provider"))
    return (PROVIDERS.get(provider) or {}).get("api_style") or "chat"


def endpoint_url(config):
    endpoint = config.get("endpoint") or config.get("base_url")
    if not endpoint:
        raise ValueError("config needs endpoint or base_url")
    endpoint = endpoint.rstrip("/")
    style = api_style(config)
    if style == "anthropic":
        if endpoint.endswith("/messages"):
            return endpoint
        if endpoint.endswith("/chat/completions"):
            endpoint = endpoint[:-len("/chat/completions")]
        return endpoint + "/messages"
    if style == "responses":
        if endpoint.endswith("/responses"):
            return endpoint
        if endpoint.endswith("/chat/completions"):
            endpoint = endpoint[:-len("/chat/completions")]
        if endpoint.endswith("/messages"):
            endpoint = endpoint[:-len("/messages")]
        return endpoint + "/responses"
    if endpoint.endswith("/chat/completions"):
        return endpoint
    return endpoint + "/chat/completions"


def _text_from_content_blocks(content):
    if isinstance(content, str):
        return content
    if not isinstance(content, list):
        return ""
    parts = []
    for item in content:
        if isinstance(item, str):
            parts.append(item)
        elif isinstance(item, dict):
            if item.get("type") in (None, "text", "output_text") and item.get("text"):
                parts.append(str(item["text"]))
    return "".join(parts)


def response_text(payload):
    """Read common OpenAI-compatible, Anthropic Messages, and GLM shapes."""
    content = payload.get("content")
    text = _text_from_content_blocks(content)
    if text:
        return text
    choices = payload.get("choices") or []
    if choices:
        message = choices[0].get("message") or {}
        content = message.get("content")
        if isinstance(content, str):
            return content
        if isinstance(content, list):
            parts = []
            for item in content:
                if isinstance(item, str):
                    parts.append(item)
                elif isinstance(item, dict) and item.get("text"):
                    parts.append(str(item["text"]))
            return "".join(parts)
        if choices[0].get("text"):
            return str(choices[0]["text"])
    # A few gateways expose a Responses-like output while retaining a chat
    # endpoint.  Supporting it costs little and makes the transcript useful.
    output = payload.get("output")
    if isinstance(output, str):
        return output
    if isinstance(output, list):
        parts = []
        for item in output:
            if not isinstance(item, dict):
                continue
            content = item.get("content")
            if isinstance(content, str):
                parts.append(content)
            elif isinstance(content, list):
                for block in content:
                    if isinstance(block, dict) and block.get("text"):
                        parts.append(str(block["text"]))
        return "".join(parts)
    return ""


def extract_code(text):
    """Remove optional markdown wrapping without rewriting model code."""
    text = (text or "").strip()
    if not text:
        return ""
    blocks = _FENCE_RE.findall(text)
    if blocks:
        # A reasoning response can contain several snippets; the final program
        # is normally the largest fenced block.  Never concatenate snippets.
        return max(blocks, key=len).strip() + "\n"
    # Models occasionally prepend a short `FINAL:` label despite the prompt.
    for marker in ("FINAL:", "Final answer:", "Here is the code:"):
        if text.lower().startswith(marker.lower()):
            text = text[len(marker):].lstrip()
            break
    # If the model ignored the output-only instruction and did not use a
    # Markdown fence, discard a prose preamble at the first plausible
    # top-level JavaScript declaration.  This is deliberately conservative:
    # it does not rewrite or beautify the returned program.
    lines = text.splitlines()
    starts = [i for i, line in enumerate(lines) if _CODE_START_RE.match(line)]
    if starts and starts[0] > 0:
        text = "\n".join(lines[starts[0]:]).lstrip()
    return text + "\n"


def retryable_http(code):
    return code in (408, 409, 425, 429) or code >= 500


def payload_error_message(payload):
    error = (payload or {}).get("error") if isinstance(payload, dict) else None
    if isinstance(error, dict):
        return str(error.get("message") or error.get("code") or error)
    if error:
        return str(error)
    return ""


def consume_chat_stream(response):
    """Assemble one Chat Completions payload from an OpenAI-style SSE stream."""
    text_parts = []
    usage = {}
    finish_reason = None
    meta = {}
    for raw_line in response:
        line = raw_line.decode("utf-8", errors="replace").strip()
        if not line or not line.startswith("data:"):
            continue
        data = line[5:].strip()
        if data == "[DONE]":
            break
        try:
            obj = json.loads(data)
        except ValueError:
            continue
        if not isinstance(obj, dict):
            continue
        if obj.get("error"):
            return obj
        if obj.get("id") and "id" not in meta:
            meta["id"] = obj.get("id")
        if obj.get("model") and "model" not in meta:
            meta["model"] = obj.get("model")
        if obj.get("usage"):
            usage = obj["usage"]
        for choice in obj.get("choices") or []:
            if not isinstance(choice, dict):
                continue
            finish_reason = choice.get("finish_reason") or finish_reason
            delta = choice.get("delta") or {}
            piece = delta.get("content") if isinstance(delta, dict) else None
            if isinstance(piece, str):
                text_parts.append(piece)
            elif isinstance(piece, list):
                for item in piece:
                    if isinstance(item, dict) and item.get("text"):
                        text_parts.append(str(item["text"]))
                    elif isinstance(item, str):
                        text_parts.append(item)
            message = choice.get("message") or {}
            if isinstance(message, dict) and isinstance(message.get("content"), str) and not piece:
                text_parts.append(message["content"])
    return {
        "id": meta.get("id"),
        "object": "chat.completion",
        "model": meta.get("model"),
        "choices": [{
            "index": 0,
            "finish_reason": finish_reason,
            "message": {"role": "assistant", "content": "".join(text_parts)},
        }],
        "usage": usage,
        "stream": True,
    }


def consume_responses_stream(response):
    """Assemble one OpenAI Responses payload from an SSE stream.

    Codex talks to SoleAPI on this wire (``/v1/responses``, stream=true).
    Chat Completions on the same gateway can idle until a 60s 503.
    """
    text_parts = []
    usage = {}
    meta = {}
    completed = None
    for raw_line in response:
        line = raw_line.decode("utf-8", errors="replace").rstrip("\r\n")
        if not line.startswith("data:"):
            continue
        data = line[5:].strip()
        if not data:
            continue
        if data == "[DONE]":
            break
        try:
            obj = json.loads(data)
        except ValueError:
            continue
        if not isinstance(obj, dict):
            continue
        if obj.get("error"):
            return obj
        kind = obj.get("type")
        if kind == "error":
            return obj
        resp = obj.get("response") if isinstance(obj.get("response"), dict) else None
        if resp:
            if resp.get("id"):
                meta["id"] = resp.get("id")
            if resp.get("model"):
                meta["model"] = resp.get("model")
            if resp.get("usage"):
                usage = resp["usage"]
            if resp.get("error"):
                return {"error": resp["error"]}
            if kind == "response.completed":
                completed = resp
        if kind == "response.output_text.delta":
            delta = obj.get("delta")
            if isinstance(delta, str) and delta:
                text_parts.append(delta)
        for choice in obj.get("choices") or []:
            if not isinstance(choice, dict):
                continue
            delta = choice.get("delta") or {}
            piece = delta.get("content") if isinstance(delta, dict) else None
            if isinstance(piece, str):
                text_parts.append(piece)
    text = "".join(text_parts)
    if not text and completed:
        text = response_text(completed)
    return {
        "id": meta.get("id"),
        "object": "response",
        "model": meta.get("model"),
        "output": [{
            "type": "message",
            "role": "assistant",
            "content": [{"type": "output_text", "text": text}],
        }],
        "usage": usage,
        "stream": True,
        "response": completed,
    }


def consume_anthropic_stream(response):
    """Assemble one Anthropic Messages payload from an SSE stream."""
    text_parts = []
    usage = {}
    stop_reason = None
    meta = {}
    for raw_line in response:
        line = raw_line.decode("utf-8", errors="replace").rstrip("\r\n")
        if line.startswith("event:") or not line.startswith("data:"):
            continue
        data = line[5:].strip()
        if not data or data == "[DONE]":
            if data == "[DONE]":
                break
            continue
        try:
            obj = json.loads(data)
        except ValueError:
            continue
        if not isinstance(obj, dict):
            continue
        if obj.get("error"):
            return obj
        kind = obj.get("type")
        if kind == "error":
            return obj
        if kind == "message_start":
            message = obj.get("message") or {}
            if message.get("id"):
                meta["id"] = message.get("id")
            if message.get("model"):
                meta["model"] = message.get("model")
            if message.get("usage"):
                usage.update(message["usage"])
            continue
        if kind == "content_block_delta":
            delta = obj.get("delta") or {}
            if delta.get("type") == "text_delta" and delta.get("text"):
                text_parts.append(delta["text"])
            continue
        if kind == "message_delta":
            delta = obj.get("delta") or {}
            stop_reason = delta.get("stop_reason") or stop_reason
            if obj.get("usage"):
                usage.update(obj["usage"])
    return {
        "id": meta.get("id"),
        "type": "message",
        "role": "assistant",
        "model": meta.get("model"),
        "content": [{"type": "text", "text": "".join(text_parts)}],
        "stop_reason": stop_reason,
        "usage": usage,
        "stream": True,
    }


def _anthropic_body(config, messages, thinking, enable_thinking, use_stream):
    system_parts = []
    user_messages = []
    for msg in messages:
        role = msg.get("role")
        content = msg.get("content")
        if role == "system":
            if isinstance(content, str):
                system_parts.append(content)
            elif content:
                system_parts.append(json.dumps(content, ensure_ascii=False))
        else:
            user_messages.append({"role": role, "content": content})
    body = {
        "model": config["model"],
        "max_tokens": config.get("max_output_tokens", 16000),
        "messages": user_messages,
        "stream": use_stream,
    }
    if system_parts:
        body["system"] = "\n\n".join(system_parts)
    if config.get("temperature") is not None:
        body["temperature"] = config.get("temperature")
    if thinking is not None:
        body["thinking"] = thinking
    if enable_thinking is not None:
        body["enable_thinking"] = enable_thinking
    if config.get("top_p") is not None:
        body["top_p"] = config["top_p"]
    return body


def _responses_body(config, messages, use_stream):
    """Codex-compatible Responses body: instructions + input items."""
    instructions = []
    inputs = []
    for msg in messages:
        role = msg.get("role")
        content = msg.get("content")
        if role == "system":
            if isinstance(content, str):
                instructions.append(content)
            elif content:
                instructions.append(json.dumps(content, ensure_ascii=False))
        else:
            inputs.append({"role": role or "user", "content": content})
    body = {
        "model": config["model"],
        "input": inputs,
        "stream": use_stream,
        "max_output_tokens": config.get("max_output_tokens", 16000),
    }
    if instructions:
        body["instructions"] = "\n\n".join(instructions)
    if config.get("temperature") is not None:
        body["temperature"] = config.get("temperature")
    if config.get("top_p") is not None:
        body["top_p"] = config["top_p"]
    return body


def open_http(request, timeout, config):
    if config.get("no_proxy"):
        opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
        return opener.open(request, timeout=timeout)
    return urllib.request.urlopen(request, timeout=timeout)


def call_model(config, messages, timeout, max_retries):
    # Some GLM gateways changed from accepting ``thinking: disabled`` to
    # requiring a low/high/max level.  Keep the repository config untouched,
    # but allow a request-local downgrade after that explicit 400 response.
    thinking = config.get("thinking")
    enable_thinking = config.get("enable_thinking")
    thinking_fallbacks = [{"type": "low"}, {"type": "enabled"},
                          {"type": "auto"}]
    thinking_fallback_index = 0
    api_key = config.get("api_key")
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        # SoleAPI (and some other Cloudflare-fronted gateways) reject the
        # default Python-urllib User-Agent with HTTP 403 / error 1010.
        "User-Agent": "jsdeob-bench-L0/1.0",
    }
    extra_headers = config.get("headers") or {}
    if isinstance(extra_headers, dict):
        headers.update((str(k), str(v)) for k, v in extra_headers.items()
                       if v is not None)
    style = api_style(config)
    if api_key:
        headers["Authorization"] = "Bearer " + api_key
        if style == "anthropic":
            headers["x-api-key"] = api_key
            headers.setdefault("anthropic-version", "2023-06-01")
    attempts = 0
    use_stream = bool(config.get("stream"))
    while True:
        if style == "anthropic":
            body = _anthropic_body(config, messages, thinking, enable_thinking,
                                   use_stream)
        elif style == "responses":
            body = _responses_body(config, messages, use_stream)
        else:
            body = {
                "model": config["model"],
                "messages": messages,
                "temperature": config.get("temperature", 0.2),
                "max_tokens": config.get("max_output_tokens", 16000),
                "stream": use_stream,
            }
            if thinking is not None:
                body["thinking"] = thinking
            if enable_thinking is not None:
                body["enable_thinking"] = enable_thinking
            if config.get("top_p") is not None:
                body["top_p"] = config["top_p"]
        req_headers = dict(headers)
        if use_stream:
            req_headers["Accept"] = "text/event-stream"
        data = json.dumps(body, ensure_ascii=False).encode("utf-8")
        request = urllib.request.Request(endpoint_url(config), data=data,
                                         headers=req_headers, method="POST")
        attempts += 1
        started = time.time()
        try:
            with open_http(request, timeout, config) as response:
                if use_stream:
                    if style == "anthropic":
                        payload = consume_anthropic_stream(response)
                    elif style == "responses":
                        payload = consume_responses_stream(response)
                    else:
                        payload = consume_chat_stream(response)
                else:
                    raw = response.read().decode("utf-8", errors="replace")
                    payload = json.loads(raw)
            error_text = payload_error_message(payload)
            if error_text:
                lowered = error_text.lower()
                if (not use_stream and "stream=true" in lowered
                        and attempts <= max_retries):
                    use_stream = True
                    continue
                if (("unavailable" in lowered or "empty response" in lowered
                     or "请稍后重试" in error_text or "上游响应超时" in error_text)
                        and attempts <= max_retries):
                    time.sleep(min(30.0, 1.5 ** (attempts - 1)))
                    continue
                return payload, attempts, error_text[:1000], time.time() - started
            return payload, attempts, None, time.time() - started
        except urllib.error.HTTPError as exc:
            raw = exc.read().decode("utf-8", errors="replace")
            message = "HTTP %s: %s" % (exc.code, raw[:1000])
            thinking_error = ("不支持关闭思考" in raw or
                              "always think" in raw.lower() or
                              "thinking" in raw.lower() and
                              "disabled" in raw.lower() or
                              "must be in" in raw.lower() and
                              "type" in raw.lower() or
                              "invalid value" in raw.lower() and
                              "type" in raw.lower())
            if (exc.code == 400 and thinking_error and
                    isinstance(thinking, dict) and
                    thinking_fallback_index < len(thinking_fallbacks)):
                thinking = thinking_fallbacks[thinking_fallback_index]
                thinking_fallback_index += 1
                enable_thinking = None
                continue
            if not retryable_http(exc.code) or attempts > max_retries:
                return None, attempts, message, time.time() - started
        except (urllib.error.URLError, TimeoutError, OSError, ValueError) as exc:
            message = "%s: %s" % (type(exc).__name__, exc)
            if attempts > max_retries:
                return None, attempts, message, time.time() - started
        # Transport retries only.  We never retry a completed model answer.
        time.sleep(min(30.0, 1.5 ** (attempts - 1)))


def usage_from(payload):
    usage = (payload or {}).get("usage") or {}
    return {
        "prompt_tokens": usage.get("prompt_tokens", usage.get("input_tokens")),
        "completion_tokens": usage.get("completion_tokens", usage.get("output_tokens")),
        "total_tokens": usage.get("total_tokens"),
    }


def run_one(job):
    index, build, args, config, system_prompt = job
    started = time.time()
    build_id = build["build_id"]
    source_path = build_source_path(args.builds, build)
    output_name = slug(build_id) + ".js"
    transcript_name = slug(build_id) + ".json"
    output_path = args.output_dir / output_name
    transcript_path = args.transcript_dir / transcript_name
    source = source_path.read_text(encoding="utf-8", errors="replace")
    original_chars = len(source)
    visible_source, truncated = truncate_source(source, args.max_input_tokens)
    messages = build_messages(system_prompt, visible_source)
    prompt_hash = hashlib.sha256(
        json.dumps(messages, ensure_ascii=False, sort_keys=True).encode("utf-8")
    ).hexdigest()
    payload = None
    raw_text = ""
    error = None
    attempts = 0
    elapsed_request = 0.0
    if args.dry_run:
        status = "dry_run"
        error = "dry_run: request not sent"
        code = ""
        usage = {}
    else:
        payload, attempts, error, elapsed_request = call_model(
            config, messages, args.request_timeout, args.max_retries)
        if payload is not None:
            raw_text = response_text(payload)
            code = extract_code(raw_text)
            status = "ok" if code.strip() else "empty_response"
            usage = usage_from(payload)
        else:
            code = ""
            status = "request_error"
            usage = {}

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(code, encoding="utf-8")
    transcript = {
        "build_id": build_id,
        "subject_id": build.get("subject_id"),
        "system": args.system,
        "level": "L0",
        "model": config.get("model"),
        "provider": config.get("provider"),
        "status": status,
        "request_attempts": attempts,
        "request_seconds": round(elapsed_request, 4),
        "source_path": str(source_path),
        "source_chars": original_chars,
        "visible_source_chars": len(visible_source),
        "estimated_input_tokens": estimated_tokens(visible_source),
        "input_truncated": truncated,
        "prompt_sha256": prompt_hash,
        "messages": messages,
        "response": payload,
        "response_text": raw_text,
        "error": error,
    }
    write_json(transcript_path, transcript)
    prediction = {
        "prediction_id": "%s.%s" % (args.system, build_id),
        "build_id": build_id,
        "subject_id": build["subject_id"],
        "system": args.system,
        "level": "L0",
        "model": config.get("model"),
        "provider": config.get("provider"),
        # Paths in predictions.jsonl are resolved relative to that JSONL file,
        # just like paths in builds.jsonl.  This keeps --output relocatable.
        "path": os.path.relpath(str(output_path), str(args.output.parent)),
        "status": status,
        "input_truncated": truncated,
        "tool_ok": False,
        "transcript_path": os.path.relpath(str(transcript_path),
                                            str(args.output.parent)),
        "cost": dict(usage, seconds=round(time.time() - started, 4),
                      request_attempts=attempts,
                      input_chars=len(visible_source)),
    }
    if error:
        prediction["driver_error"] = error
    if args.show_response and raw_text:
        preview = raw_text.replace("\n", " ")
        print("[L0 %02d] %s response=%s" % (index, build_id, preview[:240]),
              file=sys.stderr, flush=True)
    return index, prediction


def parse_args(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--builds", type=Path, default=DEFAULT_BUILDS,
                        help="builds.jsonl; paths resolve relative to this file")
    parser.add_argument("--config", type=Path, default=DEFAULT_CONFIG,
                        help="JSON API/model configuration")
    parser.add_argument("--model", help="override config model")
    parser.add_argument("--provider",
                        help="LLM gateway: sophnet, openrouter, openai, or soleapi")
    parser.add_argument("--base-url", help="override config endpoint/base_url")
    parser.add_argument("--prompt", type=Path, default=DEFAULT_PROMPT,
                        help="fixed L0 system prompt")
    parser.add_argument("--output", type=Path, default=HERE / "predictions.jsonl",
                        help="prediction JSONL (default: L0/predictions.jsonl)")
    parser.add_argument("--output-dir", type=Path, default=HERE / "outputs")
    parser.add_argument("--transcript-dir", type=Path, default=HERE / "transcripts")
    parser.add_argument("--system", default="GLM-5.2@L0")
    parser.add_argument("--workers", type=int, default=4)
    parser.add_argument("--request-timeout", type=float, default=180.0)
    parser.add_argument("--max-retries", type=int, default=3,
                        help="transport retries; completed answers are never retried")
    parser.add_argument("--max-input-tokens", type=int, default=None,
                        help="0 disables truncation; estimate is UTF-8 chars/4")
    parser.add_argument("--max-output-tokens", type=int,
                        help="override config max_output_tokens")
    parser.add_argument("--disable-thinking", action="store_true",
                        help="request GLM-style thinking={type:disabled}")
    parser.add_argument("--dry-run", action="store_true",
                        help="write prompts/transcripts without calling the gateway")
    parser.add_argument("--show-response", action="store_true",
                        help="print a short response preview as each request completes")
    parser.add_argument("--resume", action="store_true",
                        help="skip build_ids already present in --output")
    parser.add_argument("--tool",
                        help="keep only this obfuscator tool; default: auto")
    parser.add_argument("--config-id",
                        help="keep only this config_id; default: auto")
    return parser.parse_args(argv)


def main(argv=None):
    args = parse_args(argv)
    args.builds = args.builds.resolve()
    args.config = args.config.resolve()
    args.prompt = args.prompt.resolve()
    args.output = args.output.resolve()
    args.output_dir = args.output_dir.resolve()
    args.transcript_dir = args.transcript_dir.resolve()
    if not args.builds.exists():
        raise SystemExit("build manifest not found: %s" % args.builds)
    config = read_json(args.config)
    if args.model:
        config["model"] = args.model
    if args.provider:
        config["provider"] = args.provider
    if args.base_url:
        config["base_url"] = args.base_url
    config = apply_provider(config, replace_endpoint=bool(args.provider)
                            and not args.base_url)
    if args.max_output_tokens is not None:
        config["max_output_tokens"] = args.max_output_tokens
    if args.max_input_tokens is None:
        args.max_input_tokens = config.get("max_input_tokens", 114000)
    if args.disable_thinking:
        config["thinking"] = {"type": "disabled"}
        config.pop("enable_thinking", None)
    if not config.get("model"):
        config["model"] = os.environ.get("LLM_MODEL", "GLM-5.2")
    if not config.get("base_url"):
        config["base_url"] = os.environ.get("LLM_BASE_URL")
    if not config.get("base_url") and not args.dry_run:
        raise SystemExit("missing endpoint: set config base_url, "
                         "--provider sophnet|openrouter|openai|soleapi, or LLM_BASE_URL")
    env_name = config.get("api_key_env") or "OPENAI_API_KEY"
    if not config.get("api_key"):
        config["api_key"] = os.environ.get(env_name)
    if not args.dry_run and not config.get("api_key"):
        raise SystemExit("missing API key: set %s or use --dry-run" % env_name)
    system_prompt = load_prompt(args.prompt)
    builds = select_builds(read_jsonl(args.builds),
                           tool=args.tool, config_id=args.config_id)
    if not builds:
        raise SystemExit("no matching builds in %s" % args.builds)
    done = set()
    if args.resume and args.output.exists():
        done = set(r.get("build_id") for r in read_jsonl(args.output))
    jobs = [(i, b, args, config, system_prompt)
            for i, b in enumerate(builds, 1) if b.get("build_id") not in done]
    print("L0: %d builds, %d pending, workers=%d, provider=%s, model=%s, dry_run=%s" %
          (len(builds), len(jobs), max(1, args.workers),
           config.get("provider") or "-", config.get("model") or "-",
           args.dry_run), flush=True)
    if not jobs:
        return 0
    written = 0
    args.output.parent.mkdir(parents=True, exist_ok=True)
    with concurrent.futures.ThreadPoolExecutor(max_workers=max(1, args.workers)) as pool:
        futures = [pool.submit(run_one, job) for job in jobs]
        for future in concurrent.futures.as_completed(futures):
            index, prediction = future.result()
            append_jsonl(args.output, prediction)
            written += 1
            print("[L0 %d/%d] #%d %s status=%s truncated=%s" %
                  (written, len(jobs), index, prediction["build_id"],
                   prediction["status"], prediction["input_truncated"]),
                  flush=True)
    print("L0 complete: wrote %d prediction(s) to %s" % (written, args.output),
          flush=True)
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except KeyboardInterrupt:
        print("interrupted", file=sys.stderr)
        raise SystemExit(130)
