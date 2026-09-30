#!/usr/bin/env python3
"""OpenCode worker: run the upstream CLI in an isolated agent sandbox.

Mirrors OH-Bench: copy a workspace, pass a natural-language task to
``opencode run`` (the same text as ``TASK.md``), then collect ``answer.js``.
Default OpenCode tools stay enabled.
"""

from __future__ import print_function

import json
import os
import re
import signal
import subprocess
import sys
import tempfile
import threading
import time
from pathlib import Path


ANSWER_NAME = "answer.js"
ANSWER_STUB = "// Replace this file with the recovered JavaScript program.\n"
SHARED_HOME = Path(os.environ.get("ADB_OPENCODE_HOME") or "/tmp/adb-opencode-home")
_PROVIDER_RE = re.compile(r"[^a-z0-9_-]+")
OPENROUTER_CHAT_BASE = "https://openrouter.ai/api/v1"
SOPHNET_CHAT_BASE = "https://www.sophnet.com/api/open-apis/v1"
SOPHNET_PUBLIC_BASE = "https://api.sophnet.com/v1"
SOLEAPI_CHAT_BASE = "https://soleapi.com/v1"
DEFAULT_OPENROUTER_MODEL = "openai/gpt-5.6-sol"
PROVIDERS = {
    "sophnet": {
        "base_url": SOPHNET_CHAT_BASE,
        "api_key_env": "SOPHNET_API_KEY",
        "default_model": "DeepSeek-V4-Pro-0813",
    },
    "openrouter": {
        "base_url": OPENROUTER_CHAT_BASE,
        "api_key_env": "OPENROUTER_API_KEY",
        "default_model": DEFAULT_OPENROUTER_MODEL,
    },
    "soleapi": {
        "base_url": SOLEAPI_CHAT_BASE,
        "api_key_env": "SOLEAPI_API_KEY",
        "default_model": "gpt-5.6-sol",
    },
}


def sdk_base_url(value):
    """Normalize a Chat Completions URL for SDKs that append the route.

    Claude Code configs use the Anthropic Messages root
    (``https://openrouter.ai/api`` or Sophnet ``.../anthropic``). OpenCode
    speaks OpenAI Chat Completions, so those roots are rewritten here.
    """
    normalized = str(value or "").rstrip("/")
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
    if "soleapi.com" in lower:
        if normalized.endswith("/v1"):
            return normalized
        return normalized + "/v1"
    if normalized.endswith("/anthropic"):
        return normalized[:-len("/anthropic")] + "/v1"
    return normalized or OPENROUTER_CHAT_BASE


def provider_id(value):
    ident = _PROVIDER_RE.sub("-", str(value or "").lower()).strip("-")
    return ident or "openai"


def is_claude_cli_model(value):
    """True for Claude Code CLI ids that are not OpenRouter model paths."""
    text = str(value or "").strip()
    if not text or "/" in text:
        return False
    lower = text.lower()
    if lower.startswith("claude"):
        return True
    head = lower.split("[", 1)[0]
    return head in ("opus", "sonnet", "haiku", "fable")


def resolve_openrouter_model(config):
    """Map Claude Code CLI aliases onto an OpenRouter Chat Completions id.

    OpenRouter's pinned id is ``openai/gpt-5.6-sol``. A leading ``~`` is
    part of a rolling alias, not decoration — stripping it yields a 400.
    """
    model = str(config.get("model") or "").strip()
    aliases = config.get("model_aliases") or {}
    if is_claude_cli_model(model):
        alias = (aliases.get("ANTHROPIC_DEFAULT_OPUS_MODEL")
                 or aliases.get("CLAUDE_CODE_SUBAGENT_MODEL")
                 or DEFAULT_OPENROUTER_MODEL)
        return str(alias).strip() or DEFAULT_OPENROUTER_MODEL
    return model or DEFAULT_OPENROUTER_MODEL


def apply_provider(config, replace_endpoint=False):
    """Fill gateway URL, key env, and model from a known ``provider``.

    Same CLI contract as Claude Code / L0: ``--provider`` rewrites
    ``base_url`` / ``api_key_env`` unless ``--base-url`` was also passed.
    OpenCode always gets a Chat Completions root, even when the config
    still has Claude Code's Anthropic Messages URL.
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
        if not config.get("model") and preset.get("default_model"):
            config["model"] = preset["default_model"]
        if provider == "openrouter":
            config["model"] = resolve_openrouter_model(config)
        elif provider == "sophnet":
            model = str(config.get("model") or "")
            if (is_claude_cli_model(model)
                    or model.startswith("openai/")
                    or model.startswith("anthropic/")
                    or model.startswith("~openai/")
                    or model.startswith("~anthropic/")
                    or not model):
                config["model"] = preset["default_model"]
        elif provider == "soleapi":
            model = str(config.get("model") or "")
            if (not model or is_claude_cli_model(model)
                    or model.startswith("~openai/")
                    or model.startswith("~anthropic/")
                    or model.startswith("openai/")
                    or model.startswith("openai-responses/")
                    or model.startswith("anthropic/")):
                config["model"] = preset["default_model"]
    if config.get("base_url"):
        config["base_url"] = sdk_base_url(config.get("base_url"))
    return config


def split_model(config):
    """Return (provider, model, opencode --model argument)."""
    raw = str(config.get("model") or "")
    explicit_provider = config.get("provider")
    if "/" in raw and not explicit_provider:
        provider, model = raw.split("/", 1)
    elif "/" in raw and explicit_provider:
        provider, model = raw.split("/", 1)
        if provider_id(explicit_provider) != provider_id(provider):
            provider = explicit_provider
            model = raw
    else:
        provider = explicit_provider or "openai"
        model = raw
    provider = provider_id(provider)
    return provider, model, "%s/%s" % (provider, model)


def bash_timeout_ms(task_data):
    """Kill hung shells and return the error instead of eating the wall clock."""
    try:
        value = int(task_data.get("bash_timeout_ms") or 120000)
    except (TypeError, ValueError):
        value = 120000
    return max(5000, min(value, 300000))


def build_prompt(task_data):
    """Instructions only. The program lives in the workspace as ``entry``."""
    template = task_data.get("prompt") or ""
    entry = task_data.get("entry") or "subject.mjs"
    # Never paste the obfuscated program into TASK.md or the user message.
    # It crowds out OpenCode's agent prompt; the file is in the repo instead.
    return (
        template.replace("{entry}", entry)
        .replace("{source}", "")
        .replace("{bash_timeout_ms}", str(bash_timeout_ms(task_data)))
        .rstrip() + "\n"
    )


def build_run_message(task_data):
    """Ask OpenCode to complete TASK.md from the legal entry file."""
    entry = task_data.get("entry") or "subject.mjs"
    note = str(task_data.get("continuation_note") or "").strip()
    if note:
        prefix = note + " "
    elif task_data.get("checkpoint_restored"):
        prefix = "Resume from the restored checkpoint files. "
    else:
        prefix = "Start from the safety draft already present in answer.js. "
    return (
        "%sRead TASK.md. The program is %s on disk. Do not Read that "
        "one-liner; Read truncates each line at 2000 characters. Load slices "
        "with bash/Node; keep stdout small. Do not execute %s. "
        "On decoder and rewrite scripts set timeout_ms to %d. "
        "Do not wrap those scripts in a 2-5s timeout. "
        "Improve answer.js early and keep it syntactically valid. "
        "Do not finish until answer.js is source a programmer could read "
        "and change. "
        "Record concise progress in CHECKPOINT.md. Do not fetch the web.\n"
        % (prefix, entry, entry, bash_timeout_ms(task_data))
    )


def build_opencode_config(task_data):
    """Sophnet gateway plus a deobfuscation-focused build agent.

    Tools stay enabled. The default OpenCode ``build`` prompt is a software-
    engineering loop; that is what spent 240s writing RC4 harnesses instead of
    ``answer.js``. Override the agent prompt so the job is the recovered
    program. ``steps`` bounds tool iterations (token burn), not wall clock.
    """
    provider, model, snapshot = split_model(task_data)
    env_name = task_data.get("api_key_env") or "OPENAI_API_KEY"
    step_output = min(int(task_data.get("max_output_tokens") or 32768), 65536)
    step_output = max(step_output, 16384)
    thinking = task_data.get("thinking")
    if thinking is None:
        thinking = {"type": "disabled"}
    steps = int(task_data.get("max_steps") or 24)
    steps = max(4, min(steps, 64))
    entry = task_data.get("entry") or "subject.mjs"
    model_entry = {
        "name": model,
        "limit": {
            "context": int(task_data.get("max_input_tokens") or 131072),
            "output": step_output,
        },
        "options": {"thinking": thinking},
    }
    return {
        "$schema": "https://opencode.ai/config.json",
        "model": snapshot,
        "enabled_providers": [provider],
        "permission": {
            "external_directory": "deny",
            "bash": "allow",
            "task": "deny",
            "webfetch": "deny",
            "websearch": "deny",
            "codesearch": "deny",
        },
        "agent": {
            "build": {
                "mode": "primary",
                "steps": steps,
                "prompt": (
                    "You are completing a JavaScript deobfuscation task. "
                    "Read TASK.md and follow it. The program is %s: valid "
                    "JavaScript, often one minified line. Do not Read it — "
                    "Read truncates each line at 2000 characters. Load slices "
                    "with bash and keep stdout small; do not cat the whole "
                    "file into the next request. answer.js already holds a "
                    "safety draft and is not an acceptable final answer. "
                    "Write ordinary source a programmer could read and change. "
                    "Keep runtime behavior and public exports. On decoder and "
                    "rewrite scripts set timeout_ms to %d. Do not wrap them in "
                    "a 2-5s timeout. Anti-debug / infinite-loop traps: do not "
                    "run the full file first. Skip package.json, opencode.json, "
                    "and sandbox.json. Do not search the web, GitHub, npm, or "
                    "any upstream repository. Do not finish while a decoder, "
                    "string table, or obfuscated names remain. node --check "
                    "does not make an unreadable program done."
                    % (entry, bash_timeout_ms(task_data))
                ),
            }
        },
        "provider": {
            provider: {
                "npm": "@ai-sdk/openai-compatible",
                "name": provider,
                "options": {
                    "baseURL": sdk_base_url(task_data.get("base_url")),
                    "apiKey": "{env:%s}" % env_name,
                },
                "models": {
                    model: model_entry,
                },
            }
        },
    }


def build_cli(workspace, prompt, task_data):
    """Attach the entry with ``--file=path``. ``--file`` is an array flag.

    ``--file path MESSAGE`` makes OpenCode treat MESSAGE as another file
    (``File not found: Read TASK.md...``). Use ``--file=`` and ``--`` so the
    task text stays the run message.
    """
    executable = task_data.get("opencode_executable") or "opencode"
    _, _, snapshot = split_model(task_data)
    entry = task_data.get("entry") or "subject.mjs"
    attached = Path(workspace) / entry
    return [
        executable, "run",
        "--dir", str(workspace),
        "--model", snapshot,
        "--format", "json",
        "--print-logs",
        "--file=" + str(attached),
        "--",
        prompt,
    ]


def write_workspace_files(workspace, task_data):
    """Materialize TASK.md and opencode.json inside the isolated sandbox copy."""
    workspace = Path(workspace)
    prompt = build_prompt(task_data)
    (workspace / "TASK.md").write_text(prompt, encoding="utf-8")
    config = build_opencode_config(task_data)
    (workspace / "opencode.json").write_text(
        json.dumps(config, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return prompt, config


def git_init_workspace(workspace):
    """Snapshot the copied sandbox so in-place edits can be recovered."""
    workspace = Path(workspace)
    gitignore = workspace / ".gitignore"
    if not gitignore.exists():
        gitignore.write_text("node_modules/\n.adb-home/\n", encoding="utf-8")
    kwargs = dict(cwd=str(workspace), capture_output=True, text=True, timeout=30)
    subprocess.run(["git", "init"], check=False, **kwargs)
    subprocess.run(["git", "add", "-A"], check=False, **kwargs)
    subprocess.run(
        ["git", "-c", "user.email=adb@local", "-c", "user.name=adb",
         "commit", "-m", "sandbox"],
        check=False, **kwargs)


def isolate_home(workspace=None):
    """Reuse one OpenCode home so each instance does not reinstall providers.

    Isolating HOME under the per-build tempdir made OpenCode run
    ``install --no-cache`` on every sample. Keep the product cache persistent
    and still away from the user's personal ``~/.config/opencode``. The
    mutable XDG data directory is isolated separately in ``run_opencode`` so
    concurrent OpenCode processes do not contend on the same SQLite database.
    """
    del workspace
    SHARED_HOME.mkdir(parents=True, exist_ok=True)
    (SHARED_HOME / ".config").mkdir(exist_ok=True)
    (SHARED_HOME / ".local" / "share").mkdir(parents=True, exist_ok=True)
    return SHARED_HOME


def summarize_event(line):
    """Compact progress line from an OpenCode ``--format json`` event."""
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
    if etype.endswith(".delta") or etype in ("token", "message.part.delta"):
        return None
    part = event.get("part") or event.get("properties") or event.get("data") or {}
    if not isinstance(part, dict):
        part = {}
    tool = part.get("tool") or part.get("name") or event.get("tool") or ""
    title = part.get("title") or part.get("command") or ""
    if not title and isinstance(part.get("input"), dict):
        payload = part["input"]
        title = payload.get("command") or payload.get("path") or payload.get("filePath") or payload.get("file") or ""
    if not title and isinstance(part.get("state"), dict):
        state_in = part["state"].get("input") or {}
        if isinstance(state_in, dict):
            title = state_in.get("path") or state_in.get("filePath") or state_in.get("command") or ""
    title = str(title).replace("\n", " ").strip()[:100]
    if etype == "text" and not title:
        preview = str(part.get("text") or event.get("text") or "")
        preview = preview.replace("\n", " ").strip()
        if preview:
            title = preview[:160]
    step = event.get("step") or part.get("step")
    bits = [item for item in (etype, tool, title) if item]
    if step is not None:
        bits.insert(0, "step %s" % step)
    if not bits:
        return None
    return " ".join(str(bit) for bit in bits)


def event_type(line):
    line = (line or "").strip()
    if not line.startswith("{"):
        return ""
    try:
        event = json.loads(line)
    except ValueError:
        return ""
    if not isinstance(event, dict):
        return ""
    return str(event.get("type") or event.get("event") or "")


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


def run_opencode(workspace, prompt, task_data):
    """Run ``opencode run`` non-interactively in the isolated workspace."""
    timeout = float(task_data.get("timeout") or 600)
    env = os.environ.copy()
    env_name = task_data.get("api_key_env") or "OPENAI_API_KEY"
    api_key = task_data.get("api_key") or os.environ.get(env_name)
    if api_key:
        env[env_name] = api_key
        env.setdefault("OPENAI_API_KEY", api_key)
    home = isolate_home(workspace)
    data_home = Path(workspace) / ".adb-home" / ".local" / "share"
    data_home.mkdir(parents=True, exist_ok=True)
    env["HOME"] = str(home)
    env["XDG_CONFIG_HOME"] = str(home / ".config")
    env["XDG_DATA_HOME"] = str(data_home)
    env["OPENCODE_DISABLE_AUTOUPDATE"] = "1"
    # Kill anti-debug infinite loops and return the timeout error to the agent.
    # The same budget is written into TASK.md. Decoder scripts should use it,
    # not a 2-5s wrapper.
    shell_ms = bash_timeout_ms(task_data)
    env["OPENCODE_EXPERIMENTAL_BASH_DEFAULT_TIMEOUT_MS"] = str(shell_ms)
    env["OPENCODE_BASH_TIMEOUT"] = str(shell_ms)
    build_id = task_data.get("build_id") or "deobfuscate"
    _, _, snapshot = split_model(task_data)
    cmd = build_cli(workspace, prompt, task_data)
    print("[opencode] launching %s model=%s timeout=%ss" %
          (build_id, snapshot, int(timeout)),
          file=sys.stderr, flush=True)
    started = time.time()
    last_event = {"t": started}
    try:
        proc = subprocess.Popen(
            cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True,
            env=env, cwd=str(workspace), bufsize=1, start_new_session=True)
    except FileNotFoundError:
        return "", "", -1, "opencode executable not found: %s" % cmd[0]

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
                    print("[opencode] %s" % summary, file=sys.stderr, flush=True)
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
            print("[opencode] killing %s: wall timeout %ss" %
                  (build_id, int(timeout)), file=sys.stderr, flush=True)
            _kill_process_tree(proc)
            break
        try:
            proc.wait(timeout=10)
        except subprocess.TimeoutExpired:
            now = time.time()
            elapsed = now - started
            quiet = now - last_event["t"]
            print("[opencode] %s still running %.0fs / %ss (quiet %.0fs; "
                  "JSON is flushed only after a tool/text part finishes)" %
                  (build_id, elapsed, int(timeout), quiet),
                  file=sys.stderr, flush=True)
    for thread in readers:
        thread.join(timeout=5)
    stdout = "".join(stdout_chunks)
    stderr = "".join(stderr_chunks)
    if timed_out:
        return stdout, stderr, -1, "Timeout after %ss" % int(timeout)
    return stdout, stderr, proc.returncode, None


def iter_events(stdout):
    """Yield JSON objects from OpenCode ``--format json`` stdout."""
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
        if str(event.get("type") or "") != "text":
            continue
        part = event.get("part") or {}
        text = part.get("text") if isinstance(part, dict) else None
        if isinstance(text, str) and text.strip():
            texts.append(text)
    return texts


def _read_text(path):
    try:
        return Path(path).read_text(encoding="utf-8", errors="replace")
    except OSError:
        return ""


_HEX_ID_RE = re.compile(r"\b_0x[0-9a-fA-F]+\b")


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

    Same rule as the Codex baseline: a near-copy, or at least 30 of the
    obfuscator's own ``_0x`` names still present.
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


def collect_answer(workspace, entry, original_source, stdout, stderr=""):
    """Return only the artifact that OpenCode actually wrote to ``answer.js``.

    Chat text is progress, not a submission. In particular, never turn a code
    fragment from an interrupted analysis into a benchmark prediction.
    """
    del entry, stdout, stderr
    workspace = Path(workspace)
    answer_path = workspace / ANSWER_NAME
    answer = _read_text(answer_path) if answer_path.is_file() else ""
    if answer.strip() and answer != ANSWER_STUB:
        return answer, answer_source_label(answer, original_source, "answer.js")
    return "", "none"


def usage_from_output(stdout):
    """Sum per-step token accounting from ``--format json`` event lines.

    OpenCode emits one token record per ``step-finish``.  Its ``total`` is
    the total for that step (including cache), not a session cumulative.
    """
    usage = {}
    seen_parts = set()
    for line in (stdout or "").splitlines():
        line = line.strip()
        if not line.startswith("{"):
            continue
        try:
            event = json.loads(line)
        except ValueError:
            continue
        if not isinstance(event, dict):
            continue
        payload = event.get("part") or event.get("data") or event
        if not isinstance(payload, dict):
            continue
        part_type = str(payload.get("type") or event.get("type") or "")
        normalized_type = part_type.replace("_", "-")
        if normalized_type and normalized_type != "step-finish":
            continue
        tokens = payload.get("tokens") or payload.get("usage") or {}
        if not isinstance(tokens, dict):
            continue
        part_id = payload.get("id")
        if part_id is not None:
            identity = (
                payload.get("sessionID") or event.get("sessionID"),
                payload.get("messageID") or event.get("messageID"),
                part_id,
            )
            if identity in seen_parts:
                continue
            seen_parts.add(identity)

        def first_number(*keys):
            for key in keys:
                value = tokens.get(key)
                if isinstance(value, (int, float)):
                    return int(value)
            return 0

        prompt = first_number("input", "prompt_tokens")
        completion = first_number("output", "completion_tokens")
        reasoning = first_number("reasoning", "reasoning_tokens")
        cache = tokens.get("cache") or {}
        if not isinstance(cache, dict):
            cache = {}
        cache_read = int(cache.get("read") or tokens.get("cache_read_tokens") or 0)
        cache_write = int(cache.get("write") or tokens.get("cache_write_tokens") or 0)
        reported_total = first_number("total", "total_tokens")
        step_total = reported_total or (
            prompt + completion + cache_read + cache_write)
        for key, value in (
            ("prompt_tokens", prompt),
            ("completion_tokens", completion),
            ("reasoning_tokens", reasoning),
            ("cache_read_tokens", cache_read),
            ("cache_write_tokens", cache_write),
            ("total_tokens", step_total),
        ):
            usage[key] = int(usage.get(key, 0) + value)
    return usage


def syntax_suffix(code):
    text = code or ""
    if re.search(r"(?m)^\s*(?:import\b|export\b)", text):
        return ".mjs"
    return ".cjs"


def syntax_check(code, timeout=15):
    """Return (ok, detail). ok is None when Node is unavailable."""
    if not (code or "").strip():
        return False, "empty candidate"
    handle = tempfile.NamedTemporaryFile(
        suffix=syntax_suffix(code), prefix="adb-opencode-", delete=False,
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


def cli_error_from_stderr(stderr):
    """Pull OpenCode's fatal CLI line out of ``--print-logs`` noise."""
    text = re.sub(r"\x1b\[[0-9;]*m", "", stderr or "")
    for line in text.splitlines():
        stripped = line.strip()
        if stripped.startswith("Error:") or "File not found:" in stripped:
            return stripped[:2000]
    return None


def max_passes(task_data):
    try:
        value = int(task_data.get("max_passes") or 2)
    except (TypeError, ValueError):
        value = 2
    return max(1, value)


def _merge_usage(total, extra):
    if not isinstance(extra, dict):
        return total
    for key, value in extra.items():
        if isinstance(value, (int, float)):
            total[key] = int(total.get(key, 0) + value)
    return total


def process_task(task_data):
    """Run OpenCode on one materialized workspace and return a result dict."""
    workspace = Path(task_data["repo_path"])
    prompt, product = write_workspace_files(workspace, task_data)
    original = task_data.get("source") or ""
    passes = max_passes(task_data)
    stdout = stderr = ""
    returncode = None
    error = None
    code, source = "", "none"
    usage = {}
    run_message = build_run_message(task_data)
    active = task_data
    pass_index = 1
    for pass_index in range(1, passes + 1):
        if pass_index > 1:
            current = _read_text(workspace / ANSWER_NAME)
            remaining = len(_HEX_ID_RE.findall(current))
            active = dict(task_data)
            active["continuation_note"] = (
                "The previous pass left answer.js in a form a programmer "
                "would not maintain (%d _0x names remain). Continue from "
                "the decoder scripts and CHECKPOINT.md already in this "
                "workspace. Finish only when the file is ordinary source "
                "someone could read and change."
                % remaining
            )
            run_message = build_run_message(active)
            print("[opencode] continuation pass %d/%d %s hex_ids=%d" %
                  (pass_index, passes, task_data.get("build_id") or "",
                   remaining),
                  file=sys.stderr, flush=True)
        stdout, stderr, returncode, error = run_opencode(
            workspace, run_message, active)
        _merge_usage(usage, usage_from_output(stdout))
        code, source = collect_answer(
            workspace, task_data.get("entry"), original, stdout, stderr)
        if source != "under_deobfuscated":
            break
        if error and str(error).startswith("Timeout"):
            break
    if error is None and returncode not in (0, None) and not code.strip():
        error = (cli_error_from_stderr(stderr)
                 or "opencode exited %s" % returncode)
    ok, detail = syntax_check(code) if code.strip() else (False, "empty candidate")
    texts = event_text_parts(stdout)
    truncated_stdout = (stdout or "")[:200000]
    truncated_stderr = (stderr or "")[:50000]
    return {
        "build_id": task_data.get("build_id"),
        "prompt": prompt,
        "opencode_config": product,
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
            "stdout_tail": truncated_stdout[-8000:],
            "stderr_tail": truncated_stderr[-4000:],
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
