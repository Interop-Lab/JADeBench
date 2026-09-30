#!/usr/bin/env python3
"""Kimi Code worker: run the upstream CLI in an isolated agent sandbox.

Same idea as the Claude Code / OpenHands / Codex baselines: copy a
workspace, pass a natural-language task to ``kimi -p`` (the same text as
``TASK.md`` / ``AGENTS.md``), then collect ``answer.js``.

Kimi Code reads credentials only from ``$KIMI_CODE_HOME/config.toml``.
Default route is OpenRouter Chat Completions
(``https://openrouter.ai/api/v1``, model ``openai/gpt-5.6-sol``).
The leading ``~`` is part of OpenRouter's id and must not be stripped.
Isolate ``HOME`` / ``KIMI_CODE_HOME`` so the user's ``~/.kimi-code`` is
not inherited. After a tool-free assistant message, print mode should
exit; if the CLI hangs in session teardown, the driver kills it after
``idle_after_final_seconds`` instead of waiting out the wall timeout.
"""

from __future__ import print_function

import json
import os
import re
import shutil
import signal
import subprocess
import sys
import tempfile
import threading
import time
from pathlib import Path


ANSWER_NAME = "answer.js"
ANSWER_STUB = "// Replace this file with the recovered JavaScript program.\n"
CHECKPOINT_MANIFEST = "manifest.json"
CHECKPOINT_BEST = "best_answer.js"
CHECKPOINT_MAX_BYTES = 2 * 1024 * 1024
DEFAULT_MODEL = "openai/gpt-5.6-sol"
DEFAULT_PROVIDER = "openrouter"
DEFAULT_PROVIDER_TYPE = "openai"
DEFAULT_MODEL_ALIAS = "bench"
DEFAULT_BASE_URL = "https://openrouter.ai/api/v1"
DEFAULT_API_KEY_ENV = "OPENROUTER_API_KEY"
OPENROUTER_CHAT_BASE = DEFAULT_BASE_URL
SOPHNET_CHAT_BASE = "https://www.sophnet.com/api/open-apis/v1"
SOPHNET_PUBLIC_BASE = "https://api.sophnet.com/v1"
PROVIDERS = {
    "openrouter": {
        "base_url": OPENROUTER_CHAT_BASE,
        "api_key_env": DEFAULT_API_KEY_ENV,
        "default_model": DEFAULT_MODEL,
        "provider_type": "openai",
    },
    "sophnet": {
        "base_url": SOPHNET_CHAT_BASE,
        "api_key_env": "SOPHNET_API_KEY",
        "default_model": "DeepSeek-V4-Pro-0813",
        "provider_type": "openai",
    },
}
DEFAULT_SHARED_HOME = Path.home() / ".cache" / "adb-kimi-home"
# After a tool-free assistant turn, print mode should emit
# session.resume_hint and exit. The CLI can hang in file-history
# drain instead; kill that idle teardown instead of waiting out
# the wall clock.
DEFAULT_IDLE_AFTER_FINAL = 45
DONE_PHASES = ("assistant_final", "resume_hint")
_PROVIDER_RE = re.compile(r"[^a-z0-9_-]+")
_HEX_ID_RE = re.compile(r"\b_0x[0-9a-fA-F]+\b")


def shared_home():
    return Path(os.environ.get("ADB_KIMI_HOME") or str(DEFAULT_SHARED_HOME))


def toml_string(value):
    return '"%s"' % str(value).replace("\\", "\\\\").replace('"', '\\"')


def sdk_base_url(value):
    """Normalize a Chat Completions root for Kimi ``type = "openai"``.

    Claude Code configs use the Anthropic Messages root
    (``https://openrouter.ai/api``). Kimi's OpenAI provider speaks Chat
    Completions, so those roots are rewritten to ``/api/v1``.
    """
    normalized = str(value or DEFAULT_BASE_URL).rstrip("/")
    for suffix in ("/chat/completions", "/v1/messages", "/messages"):
        if normalized.endswith(suffix):
            normalized = normalized[:-len(suffix)].rstrip("/")
    lower = normalized.lower()
    if "openrouter.ai" in lower:
        if normalized.endswith("/api/v1"):
            return normalized
        if normalized.endswith("/api"):
            return normalized + "/v1"
        return OPENROUTER_CHAT_BASE
    if "sophnet.com" in lower:
        if "://api.sophnet.com" in lower or lower.startswith("api.sophnet.com"):
            return SOPHNET_PUBLIC_BASE
        marker = "/api/open-apis"
        idx = normalized.find(marker)
        if idx >= 0:
            rest = normalized[idx + len(marker):].strip("/")
            parts = [part for part in rest.split("/") if part and part != "anthropic"]
            if parts and parts[0] == "v1":
                return normalized[: idx + len(marker)] + "/v1"
            return SOPHNET_CHAT_BASE
        return SOPHNET_CHAT_BASE
    if normalized.endswith("/anthropic"):
        return normalized[:-len("/anthropic")] + "/v1"
    return normalized or DEFAULT_BASE_URL


def provider_id(value):
    ident = _PROVIDER_RE.sub("-", str(value or "").lower()).strip("-")
    return ident or DEFAULT_PROVIDER


def is_claude_cli_model(value):
    text = str(value or "").strip()
    if not text or "/" in text:
        return False
    lower = text.lower()
    if lower.startswith("claude"):
        return True
    head = lower.split("[", 1)[0]
    return head in ("opus", "sonnet", "haiku", "fable")


def apply_provider(config, replace_endpoint=False):
    """Fill gateway URL, key env, and model from a known ``provider``.

    Same CLI contract as Claude Code / OpenHands: ``--provider`` rewrites
    ``base_url`` / ``api_key_env`` unless ``--base-url`` was also passed.
    """
    config = dict(config)
    raw_model = str(config.get("model") or "").strip()
    explicit_provider = provider_id(config.get("provider"))
    if raw_model.startswith("openrouter/"):
        if not explicit_provider:
            config["provider"] = "openrouter"
        if provider_id(config.get("provider")) == "openrouter":
            config["model"] = raw_model[len("openrouter/"):]
    elif "/" in raw_model:
        head, rest = raw_model.split("/", 1)
        head_id = provider_id(head)
        if head_id in PROVIDERS:
            if not explicit_provider:
                config["provider"] = head_id
            if provider_id(config.get("provider")) == head_id:
                config["model"] = rest
    provider = provider_id(config.get("provider"))
    if provider:
        config["provider"] = provider
    preset = PROVIDERS.get(provider) or {}
    if preset:
        if replace_endpoint or not config.get("base_url"):
            config["base_url"] = preset["base_url"]
        if replace_endpoint or not config.get("api_key_env"):
            config["api_key_env"] = preset["api_key_env"]
        if replace_endpoint or not config.get("provider_type"):
            config["provider_type"] = preset.get(
                "provider_type", DEFAULT_PROVIDER_TYPE)
        if not config.get("model") and preset.get("default_model"):
            config["model"] = preset["default_model"]
        if provider == "openrouter" and is_claude_cli_model(config.get("model")):
            config["model"] = preset["default_model"]
        elif provider == "sophnet":
            model = str(config.get("model") or "")
            if (is_claude_cli_model(model)
                    or model.startswith("openai/")
                    or model.startswith("anthropic/")
                    or model.startswith("~openai/")
                    or model.startswith("~anthropic/")
                    or not model):
                config["model"] = preset["default_model"]
    if config.get("base_url"):
        config["base_url"] = sdk_base_url(config.get("base_url"))
    if not config.get("provider_type"):
        config["provider_type"] = DEFAULT_PROVIDER_TYPE
    if not config.get("model_alias"):
        config["model_alias"] = DEFAULT_MODEL_ALIAS
    return config


def gateway_model(task_data):
    """Upstream model id. OpenRouter ids keep the leading ``~``."""
    model = str(task_data.get("model") or DEFAULT_MODEL).strip()
    if model.startswith("openrouter/"):
        return model[len("openrouter/"):]
    return model or DEFAULT_MODEL


def model_alias(task_data):
    alias = str(task_data.get("model_alias") or DEFAULT_MODEL_ALIAS).strip()
    return alias or DEFAULT_MODEL_ALIAS


def provider_type(task_data):
    value = str(task_data.get("provider_type") or DEFAULT_PROVIDER_TYPE).strip()
    if value in ("openai_legacy", "openai-compatible"):
        return "openai"
    return value or DEFAULT_PROVIDER_TYPE


def load_auth_key(task_data=None):
    task_data = task_data or {}
    env_name = task_data.get("api_key_env") or DEFAULT_API_KEY_ENV
    key = task_data.get("api_key") or os.environ.get(env_name)
    if key:
        return env_name, key
    return env_name, None


def has_kimi_auth(task_data=None):
    _, key = load_auth_key(task_data)
    return bool(key)


def build_config_toml(task_data, api_key=""):
    """Isolated ``config.toml``. Credentials live here, not in the shell."""
    provider = provider_id(task_data.get("provider") or DEFAULT_PROVIDER)
    alias = model_alias(task_data)
    model = gateway_model(task_data)
    base_url = sdk_base_url(task_data.get("base_url") or DEFAULT_BASE_URL)
    ptype = provider_type(task_data)
    steps = int(task_data.get("max_steps_per_turn") or 64)
    browsing = bool(task_data.get("enable_browsing"))
    disabled = [] if browsing else ["WebSearch", "FetchURL"]
    lines = [
        "default_model = %s" % toml_string(alias),
        'default_permission_mode = "auto"',
        "default_plan_mode = false",
        "telemetry = false",
        "",
        "[providers.%s]" % provider,
        "type = %s" % toml_string(ptype),
        "base_url = %s" % toml_string(base_url),
        "api_key = %s" % toml_string(api_key or ""),
        "",
        "[models.%s]" % alias,
        "provider = %s" % toml_string(provider),
        "model = %s" % toml_string(model),
        "max_context_size = 262144",
        "capabilities = [\"tool_use\"]",
        "",
        "[thinking]",
        "enabled = false",
        "",
        "[tools]",
        "disabled = [%s]" % ", ".join(toml_string(name) for name in disabled),
        "",
        "[loop_control]",
        "max_steps_per_turn = %d" % max(1, steps),
        "",
        "[permission]",
        "dangerous_command_guard = false",
        "",
    ]
    return "\n".join(lines)


def redact_config_toml(text):
    return re.sub(
        r'(?m)^(api_key\s*=\s*)".*"$',
        r'\1"redacted"',
        text or "")


def isolate_home(task_data):
    """Write an isolated Kimi home away from the user's ``~/.kimi-code``.

    Concurrent workers each get ``runs/<build_id>/`` so session files and
    logs do not collide.
    """
    home = shared_home()
    build_id = str(task_data.get("build_id") or "default")
    slug = re.sub(r"[^A-Za-z0-9._-]+", "_", build_id).strip("._") or "default"
    home = home / "runs" / slug[:120]
    home.mkdir(parents=True, exist_ok=True)
    kimi_home = home / "kimi-code-home"
    kimi_home.mkdir(parents=True, exist_ok=True)
    _, api_key = load_auth_key(task_data)
    (kimi_home / "config.toml").write_text(
        build_config_toml(task_data, api_key=api_key or ""),
        encoding="utf-8")
    prompt = build_prompt(task_data)
    (kimi_home / "AGENTS.md").write_text(prompt, encoding="utf-8")
    (kimi_home / "tui.toml").write_text("", encoding="utf-8")
    return home, kimi_home


def bash_timeout_ms(task_data):
    try:
        value = int(task_data.get("bash_timeout_ms") or 120000)
    except (TypeError, ValueError):
        value = 120000
    return max(5000, min(value, 300000))


def build_prompt(task_data):
    """Instructions only. The program lives in the workspace as ``entry``."""
    template = task_data.get("prompt") or ""
    entry = task_data.get("entry") or "subject.mjs"
    return (
        template.replace("{entry}", entry)
        .replace("{source}", "")
        .replace("{bash_timeout_ms}", str(bash_timeout_ms(task_data)))
        .rstrip() + "\n"
    )


def build_run_message(task_data):
    entry = task_data.get("entry") or "subject.mjs"
    note = str(task_data.get("continuation_note") or "").strip()
    if note:
        prefix = note + " "
    elif task_data.get("checkpoint_restored"):
        prefix = "Resume from the restored checkpoint files. "
    else:
        prefix = "Start from the safety draft already present in answer.js. "
    return (
        "%sRead TASK.md. The program is %s on disk. Load slices with "
        "bash/Node; keep stdout small. Do not execute %s. "
        "On decoder and rewrite scripts set timeout_ms to %d. "
        "Do not wrap those scripts in a 2-5s timeout. "
        "Improve answer.js early and keep it syntactically valid. "
        "Do not finish until answer.js is source a programmer could read "
        "and change. "
        "Record concise progress in CHECKPOINT.md. Do not fetch the web.\n"
        % (prefix, entry, entry, bash_timeout_ms(task_data))
    )


def build_cli(workspace, prompt, task_data):
    """``kimi -p`` in print mode. Do not pass ``--yolo``: it conflicts."""
    del workspace
    executable = task_data.get("kimi_executable") or "kimi"
    return [
        executable,
        "-p", prompt,
        "--output-format", "stream-json",
        "-m", model_alias(task_data),
    ]


def write_workspace_files(workspace, task_data):
    """Materialize TASK.md and AGENTS.md (Kimi reads repo agents files)."""
    workspace = Path(workspace)
    prompt = build_prompt(task_data)
    (workspace / "TASK.md").write_text(prompt, encoding="utf-8")
    (workspace / "AGENTS.md").write_text(prompt, encoding="utf-8")
    return prompt


def git_init_workspace(workspace):
    workspace = Path(workspace)
    gitignore = workspace / ".gitignore"
    if not gitignore.exists():
        gitignore.write_text("node_modules/\n.kimi-code/\n", encoding="utf-8")
    kwargs = dict(cwd=str(workspace), capture_output=True, text=True, timeout=30)
    subprocess.run(["git", "init"], check=False, **kwargs)
    subprocess.run(["git", "add", "-A"], check=False, **kwargs)
    subprocess.run(
        ["git", "-c", "user.email=adb@local", "-c", "user.name=adb",
         "commit", "-m", "sandbox"],
        check=False, **kwargs)


def idle_after_final_seconds(task_data):
    raw = DEFAULT_IDLE_AFTER_FINAL
    if task_data is not None and task_data.get("idle_after_final_seconds") is not None:
        raw = task_data.get("idle_after_final_seconds")
    try:
        value = float(raw)
    except (TypeError, ValueError):
        value = float(DEFAULT_IDLE_AFTER_FINAL)
    return max(5.0, min(value, 600.0))


def parse_stream_event(line):
    line = (line or "").strip()
    if not line.startswith("{"):
        return None
    try:
        event = json.loads(line)
    except ValueError:
        return None
    if isinstance(event, dict):
        return event
    return None


def stream_phase(event):
    """Classify a Kimi stream-json object for print-session teardown.

    A tool-free assistant message is the end of the model turn. The CLI
    should then write ``session.resume_hint`` and exit. Anything else is
    still in the tool loop or mid-stream.
    """
    if not isinstance(event, dict):
        return "other"
    etype = str(event.get("type") or event.get("event") or event.get("kind") or "")
    role = str(event.get("role") or "")
    if etype.endswith(".delta") or "delta" in etype:
        return "delta"
    if etype == "session.resume_hint" or (
            role == "meta" and "resume" in etype):
        return "resume_hint"
    if role == "assistant" or etype == "assistant":
        tools = event.get("tool_calls")
        if tools:
            return "assistant_tools"
        if event.get("content"):
            return "assistant_final"
        return "assistant"
    if role == "tool" or etype == "tool":
        return "tool"
    return "other"


def summarize_event(line):
    """Compact progress line from a Kimi ``stream-json`` event."""
    event = parse_stream_event(line)
    if event is None:
        return None
    etype = str(event.get("type") or event.get("event") or event.get("kind") or "")
    if etype.endswith(".delta") or "delta" in etype:
        return None
    action = event.get("action") or event.get("tool") or event.get("name") or ""
    title = (
        event.get("command")
        or event.get("path")
        or event.get("content")
        or event.get("message")
        or event.get("text")
        or ""
    )
    extras = event.get("args") or event.get("parameters") or event.get("input") or {}
    if not title and isinstance(extras, dict):
        title = (
            extras.get("command")
            or extras.get("path")
            or extras.get("file_path")
            or extras.get("query")
            or extras.get("code")
            or ""
        )
    if isinstance(title, dict):
        title = title.get("text") or title.get("content") or ""
    if isinstance(title, list):
        bits = []
        for item in title:
            if isinstance(item, dict):
                bits.append(str(item.get("text") or item.get("content") or ""))
            else:
                bits.append(str(item))
        title = " ".join(bit for bit in bits if bit)
    title = str(title).replace("\n", " ").strip()[:240]
    bits = [part for part in (etype, action, title) if part]
    if not bits:
        return None
    return " ".join(str(bit) for bit in bits)


def iter_events(stdout):
    found = False
    for line in (stdout or "").splitlines():
        line = line.strip()
        if not line.startswith("{"):
            continue
        try:
            event = json.loads(line)
        except ValueError:
            continue
        if isinstance(event, dict):
            found = True
            yield event
    if found:
        return
    text = (stdout or "").strip()
    if not text.startswith("{"):
        return
    try:
        event = json.loads(text)
    except ValueError:
        return
    if isinstance(event, dict):
        yield event


def event_text_parts(stdout):
    texts = []
    for event in iter_events(stdout):
        for key in ("content", "message", "text", "thought"):
            value = event.get(key)
            if isinstance(value, str) and value.strip():
                texts.append(value)
                break
    return texts


def _coerce_int(value):
    if isinstance(value, bool) or value is None:
        return None
    if isinstance(value, (int, float)):
        return int(value)
    return None


def _add_int(usage, key, value):
    number = _coerce_int(value)
    if number is None:
        return
    usage[key] = int(usage.get(key) or 0) + number


def _finalize_usage(usage):
    """Fill total_tokens. Empty / all-zero maps become {}."""
    if not usage:
        return {}
    prompt = int(usage.get("prompt_tokens") or 0)
    completion = int(usage.get("completion_tokens") or 0)
    cache_read = int(usage.get("cache_read_tokens") or 0)
    cache_write = int(usage.get("cache_write_tokens") or 0)
    if usage.get("total_tokens") is None:
        usage["total_tokens"] = prompt + completion + cache_read + cache_write
    if not any(int(usage.get(key) or 0) for key in (
            "prompt_tokens", "completion_tokens", "cache_read_tokens",
            "cache_write_tokens", "total_tokens")):
        return {}
    return usage


def _usage_from_kimi_record(record):
    """One ``usage.record`` object from stream-json or session wire.jsonl."""
    if not isinstance(record, dict):
        return {}
    payload = record.get("usage") if isinstance(record.get("usage"), dict) else record
    usage = {}
    other = _coerce_int(payload.get("inputOther"))
    if other is not None:
        _add_int(usage, "prompt_tokens", other)
    else:
        for key in ("input_tokens", "prompt_tokens", "input"):
            if payload.get(key) is not None:
                _add_int(usage, "prompt_tokens", payload.get(key))
                break
    for src, dst in (
        ("output", "completion_tokens"),
        ("output_tokens", "completion_tokens"),
        ("completion_tokens", "completion_tokens"),
        ("inputCacheRead", "cache_read_tokens"),
        ("cache_read_tokens", "cache_read_tokens"),
        ("inputCacheCreation", "cache_write_tokens"),
        ("cache_write_tokens", "cache_write_tokens"),
        ("total_tokens", "total_tokens"),
    ):
        if payload.get(src) is not None:
            _add_int(usage, dst, payload.get(src))
    return usage


def usage_from_output(stdout):
    """Harvest token counts from ``--output-format stream-json`` if present.

    Print mode does not emit usage. The real ledger is ``wire.jsonl`` under
    ``KIMI_CODE_HOME``; ``usage_from_kimi_home`` reads that after the CLI
    exits. This parser still accepts a ``usage.record`` / ``result.usage``
    line if a future CLI version starts printing one.
    """
    usage = {}
    for event in iter_events(stdout):
        etype = str(event.get("type") or event.get("event") or "")
        if etype in ("token_counting.measured", "token_counting.turn_recorded"):
            continue
        scope = event.get("usageScope")
        if scope == "session":
            continue
        if etype == "usage.record" or isinstance(event.get("usage"), dict):
            piece = _usage_from_kimi_record(event)
        else:
            payload = (
                event.get("usage") or event.get("metrics")
                or event.get("stats") or event)
            if not isinstance(payload, dict):
                continue
            tokens = payload.get("usage") or payload.get("tokens") or payload
            if not isinstance(tokens, dict):
                continue
            if not any(key in tokens for key in (
                    "input_tokens", "output_tokens", "prompt_tokens",
                    "completion_tokens", "inputOther", "output",
                    "accumulated_prompt_tokens",
                    "accumulated_completion_tokens")):
                continue
            piece = _usage_from_kimi_record(
                tokens if "inputOther" in tokens or "output" in tokens
                else {"usage": tokens})
            if not piece:
                piece = {}
                for src, dst in (
                    ("input_tokens", "prompt_tokens"),
                    ("output_tokens", "completion_tokens"),
                    ("total_tokens", "total_tokens"),
                    ("prompt_tokens", "prompt_tokens"),
                    ("completion_tokens", "completion_tokens"),
                    ("accumulated_prompt_tokens", "prompt_tokens"),
                    ("accumulated_completion_tokens", "completion_tokens"),
                ):
                    value = tokens.get(src)
                    if isinstance(value, (int, float)):
                        piece[dst] = int(value)
        for key, value in piece.items():
            _add_int(usage, key, value)
    return _finalize_usage(usage)


def usage_from_kimi_home(kimi_home):
    """Sum per-turn ``usage.record`` events from every agent wire log.

    ``stream-json`` stdout has no token fields. Kimi writes the billed
    ledger to ``sessions/*/session_*/agents/*/wire.jsonl``. Session-scoped
    records are skipped so a roll-up line is not added on top of turns.
    Subagents are included: their wires sit next to ``main``.
    """
    root = Path(kimi_home) if kimi_home else None
    if root is None or not root.is_dir():
        return {}
    usage = {}
    for wire in root.glob("sessions/*/session_*/agents/*/wire.jsonl"):
        try:
            handle = wire.open(encoding="utf-8", errors="replace")
        except OSError:
            continue
        with handle:
            for line in handle:
                if "usage.record" not in line:
                    continue
                try:
                    event = json.loads(line)
                except ValueError:
                    continue
                if not isinstance(event, dict):
                    continue
                if event.get("type") != "usage.record":
                    continue
                if event.get("usageScope") == "session":
                    continue
                for key, value in _usage_from_kimi_record(event).items():
                    _add_int(usage, key, value)
    return _finalize_usage(usage)


def collect_usage(stdout, kimi_home=None):
    """Prefer the session ledger; fall back to stdout if it carried usage."""
    disk = usage_from_kimi_home(kimi_home)
    if disk:
        return disk, "kimi_session"
    streamed = usage_from_output(stdout)
    if streamed:
        return streamed, "stdout"
    return {}, None


def _read_text(path):
    try:
        return Path(path).read_text(encoding="utf-8", errors="replace")
    except OSError:
        return ""


def _checkpoint_artifact(path):
    name = Path(path).name
    if name in (ANSWER_NAME, "CHECKPOINT.md"):
        return True
    if name.startswith("decoded") and Path(name).suffix in (".json", ".js", ".mjs"):
        return True
    return name.startswith("_") and Path(name).suffix in (
        ".json", ".js", ".mjs", ".txt")


def save_checkpoint(workspace, checkpoint_dir, original_source=""):
    if not checkpoint_dir:
        return {"saved": [], "best_answer": False}
    workspace = Path(workspace)
    checkpoint_dir = Path(checkpoint_dir)
    checkpoint_dir.mkdir(parents=True, exist_ok=True)
    old = {}
    manifest_path = checkpoint_dir / CHECKPOINT_MANIFEST
    try:
        old = json.loads(manifest_path.read_text(encoding="utf-8"))
    except (OSError, ValueError, TypeError):
        old = {}
    old_files = old.get("files") if isinstance(old.get("files"), dict) else {}
    files = {}
    saved = []
    for source in workspace.iterdir():
        if not source.is_file() or not _checkpoint_artifact(source):
            continue
        try:
            stat = source.stat()
        except OSError:
            continue
        if stat.st_size > CHECKPOINT_MAX_BYTES:
            continue
        signature = "%s:%s" % (stat.st_size, stat.st_mtime_ns)
        target = checkpoint_dir / source.name
        files[source.name] = signature
        if old_files.get(source.name) != signature or not target.is_file():
            shutil.copy2(str(source), str(target))
            saved.append(source.name)

    answer = _read_text(workspace / ANSWER_NAME)
    best = checkpoint_dir / CHECKPOINT_BEST
    answer_signature = files.get(ANSWER_NAME)
    if answer.strip() and (
            answer_signature != old.get("checked_answer_signature")
            or not best.is_file()):
        ok, _detail = syntax_check(answer)
        if ok is not False:
            best.write_text(answer, encoding="utf-8")
    manifest = {
        "files": files,
        "checked_answer_signature": answer_signature,
        "best_answer": best.is_file(),
        "best_is_input_fallback": (
            best.is_file()
            and bool(original_source)
            and _read_text(best) == original_source),
        "updated_at": time.time(),
    }
    temp_manifest = checkpoint_dir / (CHECKPOINT_MANIFEST + ".tmp")
    temp_manifest.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8")
    os.replace(str(temp_manifest), str(manifest_path))
    return {"saved": saved, "best_answer": best.is_file()}


def restore_checkpoint(workspace, checkpoint_dir):
    if not checkpoint_dir:
        return []
    workspace = Path(workspace)
    checkpoint_dir = Path(checkpoint_dir)
    if not checkpoint_dir.is_dir():
        return []
    restored = []
    for source in checkpoint_dir.iterdir():
        if not source.is_file():
            continue
        name = source.name
        if name in (CHECKPOINT_BEST, ANSWER_NAME):
            continue
        if _checkpoint_artifact(source):
            target = workspace / name
        else:
            continue
        try:
            if source.stat().st_size > CHECKPOINT_MAX_BYTES:
                continue
            shutil.copy2(str(source), str(target))
            restored.append(target.name)
        except OSError:
            continue
    best = checkpoint_dir / CHECKPOINT_BEST
    if best.is_file() and best.stat().st_size <= CHECKPOINT_MAX_BYTES:
        shutil.copy2(str(best), str(workspace / ANSWER_NAME))
        restored.append(ANSWER_NAME)
    return sorted(set(restored))


def _strip_leading_noise(text):
    text = text or ""
    while True:
        stripped = text.lstrip()
        if stripped.startswith("/*"):
            end = stripped.find("*/")
            if end < 0:
                return stripped
            text = stripped[end + 2:]
            continue
        if stripped.startswith("//"):
            nl = stripped.find("\n")
            if nl < 0:
                return ""
            text = stripped[nl + 1:]
            continue
        return stripped


def under_deobfuscated(answer, original):
    if not original or not answer:
        return False
    if answer == original or answer.strip() == original.strip():
        return True
    a_body = _strip_leading_noise(answer)
    o_body = _strip_leading_noise(original)
    if a_body and a_body == o_body:
        return True
    if o_body and o_body in a_body and len(a_body) - len(o_body) < max(
            400, int(0.05 * len(o_body))):
        return True
    if len(_HEX_ID_RE.findall(original)) < 30:
        return False
    return len(_HEX_ID_RE.findall(answer)) >= 30


def answer_source_label(answer, original_source, default="answer.js"):
    if not original_source:
        return default
    if answer == original_source or answer.strip() == original_source.strip():
        return "input_fallback"
    if under_deobfuscated(answer, original_source):
        return "under_deobfuscated"
    return default


def collect_answer(workspace, entry=None, original_source=None, stdout="",
                   stderr="", checkpoint_dir=None):
    del entry, stdout, stderr
    workspace = Path(workspace)
    answer_path = workspace / ANSWER_NAME
    answer = _read_text(answer_path) if answer_path.is_file() else ""
    if answer.strip() and answer != ANSWER_STUB:
        if original_source and (
                answer == original_source
                or answer.strip() == original_source.strip()):
            return answer, "input_fallback"
        ok, _detail = syntax_check(answer)
        if ok is not False:
            return answer, answer_source_label(
                answer, original_source, "answer.js")
    if checkpoint_dir:
        best = _read_text(Path(checkpoint_dir) / CHECKPOINT_BEST)
        if best.strip():
            return best, answer_source_label(
                best, original_source, "checkpoint")
    return "", "none"


def syntax_suffix(code):
    text = code or ""
    if re.search(r"(?:^|[;{}])\s*(?:import\b|export\b)", text):
        return ".mjs"
    return ".cjs"


def syntax_check(code, timeout=15):
    if not (code or "").strip():
        return False, "empty candidate"
    handle = tempfile.NamedTemporaryFile(
        suffix=syntax_suffix(code), prefix="adb-kimi-", delete=False,
        mode="w", encoding="utf-8")
    try:
        handle.write(code)
        handle.close()
        completed = subprocess.run(
            ["node", "--check", handle.name],
            capture_output=True, text=True, timeout=timeout)
        detail = (completed.stderr or completed.stdout or "").strip()
        return completed.returncode == 0, detail[:2000]
    except FileNotFoundError:
        return None, "node executable not found"
    except (subprocess.TimeoutExpired, OSError) as exc:
        return False, "%s: %s" % (type(exc).__name__, exc)
    finally:
        try:
            os.unlink(handle.name)
        except OSError:
            pass


def unwrap_error_message(text):
    current = text
    for _ in range(4):
        if not isinstance(current, str):
            break
        stripped = current.strip()
        if not stripped.startswith("{"):
            return stripped[:2000]
        try:
            parsed = json.loads(stripped)
        except ValueError:
            return stripped[:2000]
        if not isinstance(parsed, dict):
            return stripped[:2000]
        inner = parsed.get("message")
        nested = parsed.get("error")
        if inner is None and isinstance(nested, dict):
            inner = nested.get("message")
        if isinstance(inner, str) and inner and inner != current:
            current = inner
            continue
        return stripped[:2000]
    return str(current)[:2000]


def cli_error_from_events(stdout):
    for event in iter_events(stdout):
        etype = str(event.get("type") or "")
        if etype not in ("error", "failed", "agent_error"):
            continue
        msg = event.get("message") or event.get("content") or event.get("text")
        nested = event.get("error")
        if msg is None and isinstance(nested, dict):
            msg = nested.get("message")
        if isinstance(msg, str) and msg.strip():
            return unwrap_error_message(msg)
    return None


def cli_error_from_stderr(stderr):
    text = re.sub(r"\x1b\[[0-9;]*m", "", stderr or "")
    for line in text.splitlines():
        stripped = line.strip()
        if stripped.lower().startswith("error:") or stripped.startswith("ERROR"):
            return stripped[:2000]
    return None


def _kill_process_tree(proc):
    if proc.poll() is not None:
        return
    try:
        os.killpg(proc.pid, signal.SIGKILL)
    except OSError:
        try:
            proc.kill()
        except OSError:
            pass
    try:
        proc.wait(timeout=10)
    except subprocess.TimeoutExpired:
        pass


def run_kimi(workspace, prompt, task_data):
    timeout = float(task_data.get("timeout") or 1200)
    idle_limit = idle_after_final_seconds(task_data)
    env = os.environ.copy()
    env_name, api_key = load_auth_key(task_data)
    if api_key:
        env[env_name] = api_key
    home, kimi_home = isolate_home(task_data)
    env["HOME"] = str(home)
    env["KIMI_CODE_HOME"] = str(kimi_home)
    env["CI"] = "1"
    env["NO_BROWSER"] = "1"
    env["KIMI_DISABLE_TELEMETRY"] = "1"
    build_id = task_data.get("build_id") or "deobfuscate"
    snapshot = gateway_model(task_data)
    cmd = build_cli(workspace, prompt, task_data)
    print("[kimi] launching %s model=%s alias=%s timeout=%ss" %
          (build_id, snapshot, model_alias(task_data), int(timeout)),
          file=sys.stderr, flush=True)
    started = time.time()
    last_event = {"t": started, "phase": "start"}
    last_checkpoint = started
    try:
        proc = subprocess.Popen(
            cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True,
            env=env, cwd=str(workspace), bufsize=1, start_new_session=True)
    except FileNotFoundError:
        return "", "", -1, "kimi executable not found: %s" % cmd[0], {}

    stdout_chunks = []
    stderr_chunks = []

    def pump(stream, sink, kind):
        try:
            for line in iter(stream.readline, ""):
                last_event["t"] = time.time()
                sink.append(line)
                if kind != "out":
                    continue
                event = parse_stream_event(line)
                phase = stream_phase(event) if event is not None else "other"
                if phase != "delta":
                    last_event["phase"] = phase
                summary = summarize_event(line)
                if summary:
                    print("[kimi] %s" % summary, file=sys.stderr, flush=True)
        finally:
            stream.close()

    readers = [
        threading.Thread(target=pump, args=(proc.stdout, stdout_chunks, "out")),
        threading.Thread(target=pump, args=(proc.stderr, stderr_chunks, "err")),
    ]
    for thread in readers:
        thread.daemon = True
        thread.start()

    timed_out = False
    hung_after_final = False
    while proc.poll() is None:
        now = time.time()
        elapsed = now - started
        quiet = now - last_event["t"]
        phase = last_event.get("phase")
        if elapsed >= timeout:
            timed_out = True
            print("[kimi] killing %s: wall timeout %ss" %
                  (build_id, int(timeout)), file=sys.stderr, flush=True)
            _kill_process_tree(proc)
            break
        if phase in DONE_PHASES and quiet >= idle_limit:
            hung_after_final = True
            print("[kimi] killing %s: print session hung after %s "
                  "(quiet %.0fs, idle_limit %.0fs)" %
                  (build_id, phase, quiet, idle_limit),
                  file=sys.stderr, flush=True)
            _kill_process_tree(proc)
            break
        wait_for = 10.0
        if phase in DONE_PHASES:
            wait_for = min(10.0, max(0.1, idle_limit - quiet))
        try:
            proc.wait(timeout=wait_for)
        except subprocess.TimeoutExpired:
            now = time.time()
            elapsed = now - started
            quiet = now - last_event["t"]
            print("[kimi] %s still running %.0fs / %ss (quiet %.0fs, last %s)" %
                  (build_id, elapsed, int(timeout), quiet,
                   last_event.get("phase") or "start"),
                  file=sys.stderr, flush=True)
            if now - last_checkpoint >= 10:
                saved = save_checkpoint(
                    workspace, task_data.get("checkpoint_dir"),
                    task_data.get("source") or "")
                last_checkpoint = now
                if saved.get("saved"):
                    print("[kimi] checkpoint saved: %s" %
                          ",".join(saved["saved"][:8]),
                          file=sys.stderr, flush=True)
    for thread in readers:
        thread.join(timeout=5)
    stdout = "".join(stdout_chunks)
    stderr = "".join(stderr_chunks)
    extra = {}
    if hung_after_final:
        extra["hung_after_final"] = True
        extra["hung_after_final_phase"] = last_event.get("phase")
        return stdout, stderr, 0, None, extra
    if timed_out:
        return stdout, stderr, -1, "Timeout after %ss" % int(timeout), extra
    return stdout, stderr, proc.returncode, None, extra


def max_passes(task_data):
    try:
        value = int(task_data.get("max_passes") or 2)
    except (TypeError, ValueError):
        value = 2
    return max(1, value)


def process_task(task_data):
    workspace = Path(task_data["repo_path"])
    prompt = write_workspace_files(workspace, task_data)
    git_init_workspace(workspace)
    checkpoint_dir = task_data.get("checkpoint_dir")
    original = task_data.get("source") or ""
    save_checkpoint(workspace, checkpoint_dir, original)
    passes = max_passes(task_data)
    stdout = stderr = ""
    returncode = None
    error = None
    extra = {}
    code, source = "", "none"
    run_message = build_run_message(task_data)
    active = task_data
    pass_index = 1
    for pass_index in range(1, passes + 1):
        if pass_index > 1:
            current = _read_text(workspace / ANSWER_NAME)
            remaining = len(_HEX_ID_RE.findall(current))
            active = dict(task_data)
            active["checkpoint_restored"] = True
            active["continuation_note"] = (
                "The previous pass left answer.js in a form a programmer "
                "would not maintain (%d _0x names remain). Continue from "
                "the decoder scripts and CHECKPOINT.md already in this "
                "workspace. Finish only when the file is ordinary source "
                "someone could read and change."
                % remaining
            )
            run_message = build_run_message(active)
            print("[kimi] continuation pass %d/%d %s hex_ids=%d" %
                  (pass_index, passes, task_data.get("build_id") or "",
                   remaining),
                  file=sys.stderr, flush=True)
        stdout, stderr, returncode, error, extra = run_kimi(
            workspace, run_message, active)
        extra = extra or {}
        if extra.get("hung_after_final"):
            error = None
            returncode = 0
        save_checkpoint(workspace, checkpoint_dir, original)
        code, source = collect_answer(
            workspace, original_source=original, checkpoint_dir=checkpoint_dir)
        if source != "under_deobfuscated":
            break
        if error and str(error).startswith("Timeout"):
            break
    if error is None and returncode not in (0, None):
        error = (cli_error_from_events(stdout)
                 or cli_error_from_stderr(stderr)
                 or "kimi exited %s" % returncode)
    ok, detail = syntax_check(code) if code.strip() else (False, "empty candidate")
    texts = event_text_parts(stdout)
    _, api_key = load_auth_key(active)
    _, kimi_home = isolate_home(active)
    usage, usage_source = collect_usage(stdout, kimi_home)
    return {
        "build_id": task_data.get("build_id"),
        "prompt": prompt,
        "kimi_cli": build_cli(workspace, run_message, active),
        "kimi_config": redact_config_toml(
            build_config_toml(active, api_key=api_key or "")),
        "gateway_model": gateway_model(active),
        "model_alias": model_alias(active),
        "patch": code,
        "answer_source": source,
        "syntax_ok": ok,
        "syntax_detail": detail,
        "metadata": {
            "returncode": returncode,
            "error": error,
            "passes": pass_index,
            "stdout_length": len(stdout or ""),
            "stderr_length": len(stderr or ""),
            "usage": usage,
            "usage_source": usage_source,
            "kimi_home": str(kimi_home),
            "last_text": (texts[-1] if texts else "")[:20000],
            "stdout_tail": (stdout or "")[-8000:],
            "stderr_tail": (stderr or "")[-4000:],
            "hung_after_final": bool(extra.get("hung_after_final")),
            "hung_after_final_phase": extra.get("hung_after_final_phase"),
            "idle_after_final_seconds": idle_after_final_seconds(active),
        },
    }


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--task", required=True, help="task JSON file")
    parser.add_argument("--output", required=True, help="result JSON file")
    args = parser.parse_args()
    task = json.loads(Path(args.task).read_text(encoding="utf-8"))
    Path(args.output).write_text(
        json.dumps(process_task(task), ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8")
