#!/usr/bin/env python3
"""OpenHands worker: run the upstream CLI in an isolated agent sandbox.

Same idea as the Claude Code / Codex / OpenCode baselines: copy a workspace,
pass a natural-language task to ``openhands --headless`` (the same text as
``TASK.md`` / ``AGENTS.md``), then collect ``answer.js``.

OpenHands speaks LiteLLM. Default route is OpenRouter Chat Completions
(``https://openrouter.ai/api/v1``, model ``openrouter/openai/gpt-5.6-sol``).
``--override-with-envs`` is required so ``LLM_*`` wins over any stored
settings. Isolate ``HOME`` so the user's ``~/.openhands`` is not inherited.
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
    },
    "sophnet": {
        "base_url": SOPHNET_CHAT_BASE,
        "api_key_env": "SOPHNET_API_KEY",
        "default_model": "DeepSeek-V4-Pro-0813",
    },
}
SHARED_HOME = Path(
    os.environ.get("ADB_OPENHANDS_HOME")
    or str(Path.home() / ".cache" / "adb-openhands-home"))
_PROVIDER_RE = re.compile(r"[^a-z0-9_-]+")
_HEX_ID_RE = re.compile(r"\b_0x[0-9a-fA-F]+\b")


def sdk_base_url(value):
    """Normalize a Chat Completions root for LiteLLM ``LLM_BASE_URL``.

    Claude Code configs use the Anthropic Messages root
    (``https://openrouter.ai/api``). OpenHands / LiteLLM speak Chat
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
            return normalized[: idx + len(marker)] + "/v1"
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

    Same CLI contract as Claude Code / OpenCode: ``--provider`` rewrites
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
    return config


def litellm_model(task_data):
    """LiteLLM slug for the pinned OpenRouter model.

    ``openrouter/openai/gpt-5.6-sol`` is the route. A leading ``~`` on a
    rolling alias is part of that id; stripping it yields a 400.
    """
    provider = provider_id(task_data.get("provider") or DEFAULT_PROVIDER)
    model = str(task_data.get("model") or DEFAULT_MODEL).strip()
    if model.startswith("openrouter/"):
        return model
    if provider == "openrouter":
        return "openrouter/%s" % model
    if provider == "sophnet":
        if model.startswith("openai/"):
            return model
        return "openai/%s" % model
    return model


def build_agent_settings(task_data):
    """Isolated ``agent_settings.json`` so first-run setup does not hang."""
    return {
        "llm": {
            "model": litellm_model(task_data),
            "base_url": sdk_base_url(task_data.get("base_url") or DEFAULT_BASE_URL),
            "api_key": "env",
        },
        "agent": {
            "enable_browsing": bool(task_data.get("enable_browsing")),
        },
    }


def load_auth_key(task_data=None):
    task_data = task_data or {}
    env_name = task_data.get("api_key_env") or DEFAULT_API_KEY_ENV
    key = task_data.get("api_key") or os.environ.get(env_name)
    if key:
        return env_name, key
    return env_name, None


def isolate_home(task_data):
    """Write an isolated OpenHands home away from the user's ``~/.openhands``."""
    SHARED_HOME.mkdir(parents=True, exist_ok=True)
    oh_dir = SHARED_HOME / ".openhands"
    oh_dir.mkdir(parents=True, exist_ok=True)
    settings = build_agent_settings(task_data)
    (oh_dir / "agent_settings.json").write_text(
        json.dumps(settings, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8")
    (oh_dir / "settings.json").write_text(
        json.dumps(settings, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8")
    (oh_dir / "mcp.json").write_text("{}\n", encoding="utf-8")
    (oh_dir / "cli_config.json").write_text(
        json.dumps({"critic": False}, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8")
    return SHARED_HOME


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
    """``openhands --headless --json`` in the workspace."""
    del workspace
    executable = task_data.get("openhands_executable") or "openhands"
    return [
        executable,
        "--headless",
        "--json",
        "--override-with-envs",
        "--exit-without-confirmation",
        "--always-approve",
        "-t", prompt,
    ]


def write_workspace_files(workspace, task_data):
    """Materialize TASK.md and AGENTS.md (OpenHands reads repo agents files)."""
    workspace = Path(workspace)
    prompt = build_prompt(task_data)
    (workspace / "TASK.md").write_text(prompt, encoding="utf-8")
    (workspace / "AGENTS.md").write_text(prompt, encoding="utf-8")
    return prompt


def git_init_workspace(workspace):
    workspace = Path(workspace)
    gitignore = workspace / ".gitignore"
    if not gitignore.exists():
        gitignore.write_text("node_modules/\n.openhands/\n", encoding="utf-8")
    kwargs = dict(cwd=str(workspace), capture_output=True, text=True, timeout=30)
    subprocess.run(["git", "init"], check=False, **kwargs)
    subprocess.run(["git", "add", "-A"], check=False, **kwargs)
    subprocess.run(
        ["git", "-c", "user.email=adb@local", "-c", "user.name=adb",
         "commit", "-m", "sandbox"],
        check=False, **kwargs)


def has_openhands_auth(task_data=None):
    _, key = load_auth_key(task_data)
    return bool(key)


def summarize_event(line):
    """Compact progress line from an OpenHands ``--json`` event."""
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
    action = event.get("action") or event.get("tool") or ""
    title = (
        event.get("command")
        or event.get("path")
        or event.get("content")
        or event.get("message")
        or ""
    )
    extras = event.get("args") or event.get("parameters") or {}
    if not title and isinstance(extras, dict):
        title = (
            extras.get("command")
            or extras.get("path")
            or extras.get("file_path")
            or extras.get("code")
            or ""
        )
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
        for key in ("content", "message", "thought"):
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


def _finalize_usage(usage, prompt_includes_cache=False):
    """Fill total_tokens. Empty / all-zero maps become {}.

    LiteLLM's ``prompt_tokens`` already includes cache reads. Split them
    so ``prompt_tokens`` is uncached input, matching Claude Code's cost
    fields; ``total_tokens`` stays billed input (with cache) + output.
    """
    if not usage:
        return {}
    prompt = int(usage.get("prompt_tokens") or 0)
    completion = int(usage.get("completion_tokens") or 0)
    cache_read = int(usage.get("cache_read_tokens") or 0)
    cache_write = int(usage.get("cache_write_tokens") or 0)
    if prompt_includes_cache and cache_read:
        billed_prompt = prompt
        usage["prompt_tokens"] = max(0, prompt - cache_read)
        if usage.get("total_tokens") is None:
            usage["total_tokens"] = billed_prompt + completion
    elif usage.get("total_tokens") is None:
        usage["total_tokens"] = prompt + completion + cache_read + cache_write
    if not any(int(usage.get(key) or 0) for key in (
            "prompt_tokens", "completion_tokens", "cache_read_tokens",
            "cache_write_tokens", "total_tokens")):
        return {}
    return usage


def usage_from_output(stdout):
    """Harvest token counts from ``--json`` lines if the CLI prints them.

    OpenHands 1.21 headless JSON is ActionEvent / ObservationEvent and has
    no usage fields. The ledger lives in ``base_state.json``; see
    ``usage_from_openhands_home``. This parser still accepts a result /
    metrics line if a future CLI version starts printing one.
    """
    usage = {}
    for event in iter_events(stdout):
        payload = (
            event.get("usage") or event.get("metrics")
            or event.get("stats") or event)
        if not isinstance(payload, dict):
            continue
        tokens = payload.get("usage") or payload.get("tokens") or payload
        if not isinstance(tokens, dict):
            continue
        acc = tokens.get("accumulated_token_usage")
        if isinstance(acc, dict):
            tokens = acc
        found = False
        for src, dst in (
            ("input_tokens", "prompt_tokens"),
            ("output_tokens", "completion_tokens"),
            ("total_tokens", "total_tokens"),
            ("prompt_tokens", "prompt_tokens"),
            ("completion_tokens", "completion_tokens"),
            ("accumulated_prompt_tokens", "prompt_tokens"),
            ("accumulated_completion_tokens", "completion_tokens"),
            ("cache_read_tokens", "cache_read_tokens"),
            ("cache_write_tokens", "cache_write_tokens"),
        ):
            value = tokens.get(src)
            if isinstance(value, (int, float)):
                usage[dst] = int(value)
                found = True
        if not found:
            continue
    return _finalize_usage(usage)


def _conversation_workspace(state):
    workspace = (state or {}).get("workspace")
    if isinstance(workspace, str):
        return workspace
    if isinstance(workspace, dict):
        return (
            workspace.get("working_dir")
            or workspace.get("path")
            or workspace.get("directory")
            or "")
    return ""


def _usage_from_metrics_map(metrics_map):
    usage = {}
    if not isinstance(metrics_map, dict):
        return usage
    for metrics in metrics_map.values():
        if not isinstance(metrics, dict):
            continue
        acc = metrics.get("accumulated_token_usage") or {}
        if not isinstance(acc, dict):
            continue
        for src, dst in (
            ("prompt_tokens", "prompt_tokens"),
            ("completion_tokens", "completion_tokens"),
            ("cache_read_tokens", "cache_read_tokens"),
            ("cache_write_tokens", "cache_write_tokens"),
            ("reasoning_tokens", "reasoning_tokens"),
        ):
            _add_int(usage, dst, acc.get(src))
    return usage


def usage_from_openhands_home(home, workspace):
    """Read combined LLM metrics for this workspace from persistence.

    Concurrent workers share ``~/.cache/adb-openhands-home``. Match the
    conversation whose ``workspace.working_dir`` is this sandbox, not
    whichever conversation was written last. Parent ``base_state.json``
    already folds subagent ``task:*`` metrics into ``usage_to_metrics``.
    """
    root = Path(home) / ".openhands" / "conversations"
    if not root.is_dir():
        return {}
    try:
        wanted = str(Path(workspace).resolve())
    except (OSError, TypeError):
        wanted = str(workspace or "")
    matched = []
    for conv in root.iterdir():
        state_path = conv / "base_state.json"
        if not state_path.is_file():
            continue
        try:
            state = json.loads(state_path.read_text(encoding="utf-8"))
        except (OSError, ValueError, TypeError):
            continue
        if not isinstance(state, dict):
            continue
        listed = _conversation_workspace(state)
        try:
            listed_res = str(Path(listed).resolve()) if listed else ""
        except (OSError, TypeError):
            listed_res = listed
        if listed_res != wanted and listed != wanted:
            continue
        try:
            mtime = state_path.stat().st_mtime
        except OSError:
            mtime = 0
        matched.append((mtime, state))
    if not matched:
        return {}
    matched.sort(key=lambda item: item[0])
    combined = {}
    for _mtime, state in matched:
        stats = state.get("stats") or {}
        metrics_map = (
            stats.get("usage_to_metrics") if isinstance(stats, dict) else {})
        for key, value in _usage_from_metrics_map(metrics_map).items():
            _add_int(combined, key, value)
    return _finalize_usage(combined, prompt_includes_cache=True)


def collect_usage(stdout, home=None, workspace=None):
    """Prefer the conversation ledger; fall back to stdout if it carried usage."""
    disk = usage_from_openhands_home(home, workspace) if home and workspace else {}
    if disk:
        return disk, "openhands_conversation"
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
        suffix=syntax_suffix(code), prefix="adb-openhands-", delete=False,
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
        msg = event.get("message") or event.get("content")
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


def run_openhands(workspace, prompt, task_data):
    timeout = float(task_data.get("timeout") or 1200)
    env = os.environ.copy()
    env_name, api_key = load_auth_key(task_data)
    if api_key:
        env[env_name] = api_key
        env["LLM_API_KEY"] = api_key
        env.setdefault("OPENAI_API_KEY", api_key)
    home = isolate_home(task_data)
    env["HOME"] = str(home)
    env["OH_PERSISTENCE_DIR"] = str(home / ".openhands")
    env["LLM_MODEL"] = litellm_model(task_data)
    env["LLM_BASE_URL"] = sdk_base_url(task_data.get("base_url") or DEFAULT_BASE_URL)
    env["CI"] = "1"
    env["NO_BROWSER"] = "1"
    build_id = task_data.get("build_id") or "deobfuscate"
    snapshot = litellm_model(task_data)
    cmd = build_cli(workspace, prompt, task_data)
    print("[openhands] launching %s model=%s timeout=%ss" %
          (build_id, snapshot, int(timeout)),
          file=sys.stderr, flush=True)
    started = time.time()
    last_event = {"t": started}
    last_checkpoint = started
    try:
        proc = subprocess.Popen(
            cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True,
            env=env, cwd=str(workspace), bufsize=1, start_new_session=True)
    except FileNotFoundError:
        return "", "", -1, "openhands executable not found: %s" % cmd[0]

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
                    print("[openhands] %s" % summary, file=sys.stderr, flush=True)
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
            print("[openhands] killing %s: wall timeout %ss" %
                  (build_id, int(timeout)), file=sys.stderr, flush=True)
            _kill_process_tree(proc)
            break
        try:
            proc.wait(timeout=10)
        except subprocess.TimeoutExpired:
            now = time.time()
            elapsed = now - started
            quiet = now - last_event["t"]
            print("[openhands] %s still running %.0fs / %ss (quiet %.0fs)" %
                  (build_id, elapsed, int(timeout), quiet),
                  file=sys.stderr, flush=True)
            if now - last_checkpoint >= 10:
                saved = save_checkpoint(
                    workspace, task_data.get("checkpoint_dir"),
                    task_data.get("source") or "")
                last_checkpoint = now
                if saved.get("saved"):
                    print("[openhands] checkpoint saved: %s" %
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
            print("[openhands] continuation pass %d/%d %s hex_ids=%d" %
                  (pass_index, passes, task_data.get("build_id") or "",
                   remaining),
                  file=sys.stderr, flush=True)
        stdout, stderr, returncode, error = run_openhands(
            workspace, run_message, active)
        save_checkpoint(workspace, checkpoint_dir, original)
        code, source = collect_answer(
            workspace, original_source=original, checkpoint_dir=checkpoint_dir)
        if source != "under_deobfuscated":
            break
        if error and str(error).startswith("Timeout"):
            break
    if error is None and returncode not in (0, None) and not code.strip():
        error = (cli_error_from_events(stdout)
                 or cli_error_from_stderr(stderr)
                 or "openhands exited %s" % returncode)
    ok, detail = syntax_check(code) if code.strip() else (False, "empty candidate")
    texts = event_text_parts(stdout)
    home = isolate_home(active)
    usage, usage_source = collect_usage(stdout, home=home, workspace=workspace)
    return {
        "build_id": task_data.get("build_id"),
        "prompt": prompt,
        "openhands_cli": build_cli(workspace, run_message, active),
        "openhands_settings": build_agent_settings(active),
        "litellm_model": litellm_model(active),
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
