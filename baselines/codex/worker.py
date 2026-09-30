#!/usr/bin/env python3
"""Codex worker: run the upstream CLI in an isolated agent sandbox.

Same idea as the Claude Code / OpenCode baselines: copy a workspace, pass
a natural-language task to ``codex exec`` (the same text as ``TASK.md`` /
``AGENTS.md``), then collect ``answer.js``.

Default route is OpenRouter's Responses-compatible root
``https://openrouter.ai/api/v1`` (model ``openai/gpt-5.6-sol``).
Isolate ``CODEX_HOME`` so the user's interactive ``~/.codex`` settings
are not inherited.
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
DEFAULT_BASH_TIMEOUT_MS = 120000
DEFAULT_MAX_PASSES = 2
CHECKPOINT_MANIFEST = "manifest.json"
CHECKPOINT_BEST = "best_answer.js"
CHECKPOINT_MAX_BYTES = 2 * 1024 * 1024
DEFAULT_MODEL = "openai/gpt-5.6-sol"
DEFAULT_PROVIDER = "openrouter"
DEFAULT_BASE_URL = "https://openrouter.ai/api/v1"
DEFAULT_API_KEY_ENV = "OPENROUTER_API_KEY"
DEFAULT_SANDBOX = "workspace-write"
OPENROUTER_CHAT_BASE = DEFAULT_BASE_URL
SOPHNET_CHAT_BASE = "https://www.sophnet.com/api/open-apis/v1"
SOPHNET_PUBLIC_BASE = "https://api.sophnet.com/v1"
REQUESTY_CHAT_BASE = "https://router.requesty.ai/v1"
REQUESTY_DEFAULT_MODEL = "openai-responses/gpt-5.6-sol"
PROVIDERS = {
    "openrouter": {
        "base_url": OPENROUTER_CHAT_BASE,
        "api_key_env": DEFAULT_API_KEY_ENV,
        "default_model": DEFAULT_MODEL,
        "requires_openai_auth": False,
    },
    "sophnet": {
        "base_url": SOPHNET_CHAT_BASE,
        "api_key_env": "SOPHNET_API_KEY",
        "default_model": "DeepSeek-V4-Pro-0813",
        "requires_openai_auth": False,
    },
    "requesty": {
        "base_url": REQUESTY_CHAT_BASE,
        "api_key_env": "REQUESTY_API_KEY",
        "default_model": REQUESTY_DEFAULT_MODEL,
        "requires_openai_auth": False,
    },
    "routerone": {
        "base_url": "https://api.router.one/v1",
        "api_key_env": "ROUTER_ONE_API_KEY",
        "default_model": "openai/gpt-5.6-sol",
        "requires_openai_auth": False,
    },
    "soleapi": {
        "base_url": "https://soleapi.com/v1",
        "api_key_env": "SOLEAPI_API_KEY",
        "default_model": "gpt-5.6-sol",
        "requires_openai_auth": False,
    },
    "codex": {
        "base_url": "https://new.aicode.us.com/v1",
        "api_key_env": "OPENAI_API_KEY",
        "default_model": "gpt-5.3-codex",
        "requires_openai_auth": True,
    },
}
SHARED_HOME = Path(
    os.environ.get("ADB_CODEX_HOME")
    or str(Path.home() / ".cache" / "adb-codex-home"))
DISABLED_FEATURES = (
    "browser_use",
    "browser_use_external",
    "computer_use",
)
_PROVIDER_RE = re.compile(r"[^a-z0-9_-]+")
_HEX_ID_RE = re.compile(r"\b_0x[0-9a-fA-F]+\b")


def sdk_base_url(value):
    """Normalize a Responses/Chat Completions root for Codex ``base_url``.

    Claude Code configs use the Anthropic Messages root
    (``https://openrouter.ai/api``). Codex speaks Responses, so those
    roots are rewritten to ``/api/v1``.
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
            return normalized[: idx + len(marker)] + "/v1"
        return SOPHNET_CHAT_BASE
    if "requesty.ai" in lower or "router.one" in lower or "soleapi.com" in lower:
        if normalized.endswith("/v1"):
            return normalized
        return normalized + "/v1"
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

    Same CLI contract as Claude Code / OpenCode: ``--provider`` rewrites
    ``base_url`` / ``api_key_env`` unless ``--base-url`` was also passed.
    """
    config = dict(config)
    raw_model = str(config.get("model") or "").strip()
    explicit_provider = provider_id(config.get("provider"))
    if "/" in raw_model:
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
        if "requires_openai_auth" not in config or replace_endpoint:
            config["requires_openai_auth"] = preset.get(
                "requires_openai_auth", False)
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
        elif provider == "requesty":
            model = str(config.get("model") or "")
            if (not model or is_claude_cli_model(model)
                    or model.startswith("~openai/")
                    or model.startswith("~anthropic/")):
                config["model"] = preset["default_model"]
            elif (model.startswith("openai/")
                  and not model.startswith("openai-responses/")):
                # Codex on Requesty must use the native Responses prefix.
                config["model"] = "openai-responses/" + model[len("openai/"):]
        elif provider == "soleapi":
            model = str(config.get("model") or "")
            if (not model or is_claude_cli_model(model)
                    or model.startswith("~openai/")
                    or model.startswith("~anthropic/")
                    or model.startswith("openai/")
                    or model.startswith("openai-responses/")):
                config["model"] = preset["default_model"]
    if config.get("base_url"):
        config["base_url"] = sdk_base_url(config.get("base_url"))
    return config


def toml_string(value):
    return json.dumps(str(value or ""), ensure_ascii=False)


def build_codex_config(task_data):
    """Isolated config.toml pointing at a Codex-compatible Responses gateway."""
    model = task_data.get("model") or DEFAULT_MODEL
    provider = provider_id(task_data.get("provider") or DEFAULT_PROVIDER)
    base_url = sdk_base_url(task_data.get("base_url") or DEFAULT_BASE_URL)
    env_name = task_data.get("api_key_env") or DEFAULT_API_KEY_ENV
    sandbox = task_data.get("sandbox") or DEFAULT_SANDBOX
    policy = task_data.get("approval_policy") or "never"
    network = "true" if task_data.get("network_access") else "false"
    requires_auth = task_data.get("requires_openai_auth")
    if requires_auth is None:
        requires_auth = provider == "codex"
    lines = [
        "model = %s" % toml_string(model),
        "model_provider = %s" % toml_string(provider),
        "approval_policy = %s" % toml_string(policy),
        "sandbox_mode = %s" % toml_string(sandbox),
        "disable_response_storage = true",
        # Keep this above [tables]. Off so the agent cannot fetch the original
        # repository; the compatible gateway still accepts the rest of the
        # Codex tool schema.
        "web_search = \"disabled\"",
    ]
    if provider in ("requesty", "routerone"):
        # These gateways reject Codex's default reasoning-summary field.
        lines.append("model_supports_reasoning_summaries = false")
    lines.extend([
        "",
        "[sandbox_workspace_write]",
        "network_access = %s" % network,
        "",
        "[model_providers.%s]" % provider,
        "name = %s" % toml_string(provider),
        "base_url = %s" % toml_string(base_url),
        "env_key = %s" % toml_string(env_name),
        "wire_api = \"responses\"",
        "requires_openai_auth = %s" % ("true" if requires_auth else "false"),
    ])
    return "\n".join(lines) + "\n"


def user_auth_path():
    return Path.home() / ".codex" / "auth.json"


def load_auth_key(task_data=None):
    """Return (env_name, api_key) from config, the environment, or auth.json."""
    task_data = task_data or {}
    env_name = task_data.get("api_key_env") or DEFAULT_API_KEY_ENV
    key = task_data.get("api_key") or os.environ.get(env_name)
    if key:
        return env_name, key
    try:
        data = json.loads(user_auth_path().read_text(encoding="utf-8"))
    except (OSError, ValueError, TypeError):
        data = {}
    if isinstance(data, dict):
        key = data.get(env_name) or data.get("OPENAI_API_KEY")
        if key:
            return env_name, key
    return env_name, None


def _replace_file(path, write):
    """Replace ``path`` atomically so concurrent readers never see a partial file."""
    path = Path(path)
    temp = path.with_name("%s.tmp.%s.%s" % (path.name, os.getpid(), threading.get_ident()))
    write(temp)
    os.replace(str(temp), str(path))


def isolate_home(task_data):
    """Write an isolated Codex home, copying ~/.codex/auth.json for the gateway."""
    SHARED_HOME.mkdir(parents=True, exist_ok=True)
    config = build_codex_config(task_data)
    _replace_file(
        SHARED_HOME / "config.toml",
        lambda temp: temp.write_text(config, encoding="utf-8"))
    dst = SHARED_HOME / "auth.json"
    src = user_auth_path()
    if src.is_file():
        payload = src.read_bytes()
        _replace_file(dst, lambda temp: temp.write_bytes(payload))
    else:
        env_name, key = load_auth_key(task_data)
        if key:
            body = json.dumps({env_name: key}, ensure_ascii=False) + "\n"
            _replace_file(
                dst, lambda temp: temp.write_text(body, encoding="utf-8"))
    if dst.is_file():
        os.chmod(str(dst), 0o600)
    return SHARED_HOME


def bash_timeout_ms(task_data):
    try:
        value = int(task_data.get("bash_timeout_ms") or DEFAULT_BASH_TIMEOUT_MS)
    except (TypeError, ValueError):
        value = DEFAULT_BASH_TIMEOUT_MS
    return max(1000, value)


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
    """``codex exec`` in the workspace. ``--`` keeps the task text as the prompt."""
    executable = task_data.get("codex_executable") or "codex"
    model = task_data.get("model") or DEFAULT_MODEL
    provider = provider_id(task_data.get("provider") or DEFAULT_PROVIDER)
    sandbox = task_data.get("sandbox") or DEFAULT_SANDBOX
    policy = task_data.get("approval_policy") or "never"
    cmd = [
        executable, "exec",
        "--json",
        "--color", "never",
        "--sandbox", sandbox,
        "--skip-git-repo-check",
        "--ephemeral",
        "-C", str(workspace),
        "-m", model,
        "-c", "model_provider=%s" % toml_string(provider),
        "-c", "approval_policy=%s" % toml_string(policy),
        "-c", 'web_search="disabled"',
    ]
    if not task_data.get("network_access"):
        cmd.extend(["-c", "sandbox_workspace_write.network_access=false"])
    for feature in DISABLED_FEATURES:
        cmd.extend(["--disable", feature])
    cmd.extend(["--", prompt])
    return cmd


def write_workspace_files(workspace, task_data):
    """Materialize TASK.md and AGENTS.md (Codex reads the latter)."""
    workspace = Path(workspace)
    prompt = build_prompt(task_data)
    (workspace / "TASK.md").write_text(prompt, encoding="utf-8")
    (workspace / "AGENTS.md").write_text(prompt, encoding="utf-8")
    return prompt


def git_init_workspace(workspace):
    workspace = Path(workspace)
    gitignore = workspace / ".gitignore"
    if not gitignore.exists():
        gitignore.write_text("node_modules/\n", encoding="utf-8")
    kwargs = dict(cwd=str(workspace), capture_output=True, text=True, timeout=30)
    subprocess.run(["git", "init"], check=False, **kwargs)
    subprocess.run(["git", "add", "-A"], check=False, **kwargs)
    subprocess.run(
        ["git", "-c", "user.email=adb@local", "-c", "user.name=adb",
         "commit", "-m", "sandbox"],
        check=False, **kwargs)


def has_codex_auth(task_data=None):
    """True when the Responses gateway key is in env, config, or auth.json."""
    _, key = load_auth_key(task_data)
    if key:
        return True
    return user_auth_path().is_file()


def summarize_event(line):
    """Compact progress line from a Codex ``--json`` event."""
    line = (line or "").strip()
    if not line.startswith("{"):
        return None
    try:
        event = json.loads(line)
    except ValueError:
        return None
    if not isinstance(event, dict):
        return None
    etype = str(event.get("type") or event.get("event") or "")
    if etype.endswith(".delta") or "delta" in etype:
        return None
    item = event.get("item") or event.get("payload") or {}
    if not isinstance(item, dict):
        item = {}
    title = (
        item.get("command")
        or item.get("text")
        or item.get("prompt")
        or event.get("command")
        or ""
    )
    if not title and isinstance(item.get("content"), str):
        title = item["content"]
    if not title and etype in ("error", "turn.failed"):
        msg = event.get("message")
        nested = event.get("error")
        if msg is None and isinstance(nested, dict):
            msg = nested.get("message")
        if isinstance(msg, str) and msg.strip():
            title = unwrap_error_message(msg)
    title = str(title).replace("\n", " ").strip()[:240]
    tool = item.get("type") or item.get("name") or ""
    bits = [part for part in (etype, tool, title) if part]
    if not bits:
        return None
    return " ".join(str(bit) for bit in bits)


def iter_events(stdout):
    for line in (stdout or "").splitlines():
        line = line.strip()
        if not line.startswith("{"):
            continue
        try:
            event = json.loads(line)
        except ValueError:
            continue
        if isinstance(event, dict):
            yield event


def event_text_parts(stdout):
    texts = []
    for event in iter_events(stdout):
        item = event.get("item") or {}
        for key in ("text", "content", "message"):
            value = item.get(key) if isinstance(item, dict) else None
            if isinstance(value, str) and value.strip():
                texts.append(value)
                break
        else:
            text = event.get("text") or event.get("message")
            if isinstance(text, str) and text.strip():
                texts.append(text)
    return texts


def usage_from_output(stdout):
    usage = {}
    for event in iter_events(stdout):
        payload = event.get("usage") or event.get("item") or event
        if not isinstance(payload, dict):
            continue
        tokens = payload.get("usage") or payload.get("tokens") or payload
        if not isinstance(tokens, dict):
            continue

        def first_number(*keys):
            for key in keys:
                value = tokens.get(key)
                if isinstance(value, (int, float)):
                    return int(value)
            return 0

        billed_input = first_number(
            "input_tokens", "input", "prompt_tokens")
        completion = first_number(
            "output_tokens", "output", "completion_tokens")
        cache_read = first_number(
            "cached_input_tokens", "cache_read_tokens")
        reasoning = first_number(
            "reasoning_output_tokens", "reasoning_tokens")
        reported_total = first_number("total_tokens")
        if billed_input or completion or reported_total:
            usage = {
                "prompt_tokens": max(0, billed_input - cache_read),
                "completion_tokens": completion,
                "cache_read_tokens": cache_read,
                "reasoning_tokens": reasoning,
                "total_tokens": reported_total or (
                    billed_input + completion),
            }
    return usage


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
    """Persist bounded agent artifacts and the latest valid answer."""
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
    """Restore prior helper files and the last syntax-valid answer."""
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
    """True when the file is still the obfuscated program.

    This only catches a near-copy, or a mass of the obfuscator's own
    ``_0x`` names. Readability is the agent's job, stated in the prompt.
    """
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
    """Return the current valid answer, or the last valid checkpoint."""
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
        suffix=syntax_suffix(code), prefix="adb-codex-", delete=False,
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
        msg = event.get("message")
        nested = event.get("error")
        if msg is None and isinstance(nested, dict):
            msg = nested.get("message")
        if not isinstance(msg, str) or not msg.strip():
            continue
        if etype in ("error", "turn.failed") or etype.endswith(".failed"):
            return unwrap_error_message(msg)
    return None


def cli_error_from_stderr(stderr):
    text = re.sub(r"\x1b\[[0-9;]*m", "", stderr or "")
    for line in text.splitlines():
        stripped = line.strip()
        if stripped.startswith("Error:") or stripped.startswith("ERROR"):
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


def run_codex(workspace, prompt, task_data):
    timeout = float(task_data.get("timeout") or 1200)
    env = os.environ.copy()
    env_name, api_key = load_auth_key(task_data)
    if api_key:
        env[env_name] = api_key
        env.setdefault("OPENAI_API_KEY", api_key)
    home = isolate_home(task_data)
    env["CODEX_HOME"] = str(home)
    build_id = task_data.get("build_id") or "deobfuscate"
    model = task_data.get("model") or DEFAULT_MODEL
    cmd = build_cli(workspace, prompt, task_data)
    print("[codex] launching %s model=%s timeout=%ss" %
          (build_id, model, int(timeout)),
          file=sys.stderr, flush=True)
    started = time.time()
    last_event = {"t": started}
    last_checkpoint = started
    try:
        proc = subprocess.Popen(
            cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True,
            env=env, cwd=str(workspace), bufsize=1, start_new_session=True)
    except FileNotFoundError:
        return "", "", -1, "codex executable not found: %s" % cmd[0]

    stdout_chunks = []
    stderr_chunks = []

    def pump(stream, sink, kind):
        try:
            for line in iter(stream.readline, ""):
                last_event["t"] = time.time()
                sink.append(line)
                if kind != "out":
                    continue
                summary = summarize_event(line)
                if summary:
                    print("[codex] %s" % summary, file=sys.stderr, flush=True)
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
    while proc.poll() is None:
        now = time.time()
        elapsed = now - started
        if elapsed >= timeout:
            timed_out = True
            print("[codex] killing %s: wall timeout %ss" %
                  (build_id, int(timeout)), file=sys.stderr, flush=True)
            _kill_process_tree(proc)
            break
        try:
            proc.wait(timeout=10)
        except subprocess.TimeoutExpired:
            now = time.time()
            elapsed = now - started
            quiet = now - last_event["t"]
            print("[codex] %s still running %.0fs / %ss (quiet %.0fs)" %
                  (build_id, elapsed, int(timeout), quiet),
                  file=sys.stderr, flush=True)
            if now - last_checkpoint >= 10:
                saved = save_checkpoint(
                    workspace, task_data.get("checkpoint_dir"),
                    task_data.get("source") or "")
                last_checkpoint = now
                if saved.get("saved"):
                    print("[codex] checkpoint saved: %s" %
                          ",".join(saved["saved"][:8]),
                          file=sys.stderr, flush=True)
    for thread in readers:
        thread.join(timeout=5)
    stdout = "".join(stdout_chunks)
    stderr = "".join(stderr_chunks)
    if timed_out:
        return stdout, stderr, -1, "Timeout after %ss" % int(timeout)
    return stdout, stderr, proc.returncode, None


def max_passes(task_data):
    try:
        value = int(task_data.get("max_passes") or DEFAULT_MAX_PASSES)
    except (TypeError, ValueError):
        value = DEFAULT_MAX_PASSES
    return max(1, value)


def _merge_usage(total, extra):
    if not isinstance(extra, dict):
        return total
    for key, value in extra.items():
        if isinstance(value, (int, float)):
            total[key] = int(total.get(key, 0) + value)
    return total


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
    code, source = "", "none"
    usage = {}
    run_message = build_run_message(task_data)
    active = task_data
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
            print("[codex] continuation pass %d/%d %s hex_ids=%d" %
                  (pass_index, passes, task_data.get("build_id") or "",
                   remaining),
                  file=sys.stderr, flush=True)
        stdout, stderr, returncode, error = run_codex(
            workspace, run_message, active)
        _merge_usage(usage, usage_from_output(stdout))
        save_checkpoint(workspace, checkpoint_dir, original)
        code, source = collect_answer(
            workspace, original_source=original, checkpoint_dir=checkpoint_dir)
        if source != "under_deobfuscated":
            break
        if error and str(error).startswith("Timeout"):
            break
    # A restored answer.js must not count as success when Codex never started.
    if error is None and returncode not in (0, None) and (
            not code.strip() or not (stdout or "").strip()):
        error = (cli_error_from_events(stdout)
                 or cli_error_from_stderr(stderr)
                 or "codex exited %s" % returncode)
    ok, detail = syntax_check(code) if code.strip() else (False, "empty candidate")
    texts = event_text_parts(stdout)
    return {
        "build_id": task_data.get("build_id"),
        "prompt": prompt,
        "codex_cli": build_cli(workspace, run_message, active),
        "codex_config": build_codex_config(active),
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
            "last_text": (texts[-1] if texts else "")[:20000],
            "stdout_tail": (stdout or "")[-8000:],
            "stderr_tail": (stderr or "")[-4000:],
        },
    }


def main(argv=None):
    import argparse
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--task", required=True, help="task JSON file")
    parser.add_argument("--output", required=True, help="result JSON file")
    args = parser.parse_args(argv)
    task_data = json.loads(Path(args.task).read_text(encoding="utf-8"))
    result = process_task(task_data)
    Path(args.output).write_text(
        json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return 0 if (result.get("patch") or "").strip() else 1


if __name__ == "__main__":
    raise SystemExit(main())
