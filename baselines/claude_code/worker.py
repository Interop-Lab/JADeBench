#!/usr/bin/env python3
"""Claude Code worker: run the upstream CLI in an isolated agent sandbox.

Same idea as the OpenCode / Codex baselines: copy a workspace, pass a
natural-language task to ``claude --print``, then collect ``answer.js``.

Default route is OpenRouter's Anthropic-compatible root
``https://openrouter.ai/api``. Sophnet uses the Anthropic Messages gateway
``https://www.sophnet.com/api/open-apis/anthropic`` (not Chat Completions).
Claude Code appends ``/v1/messages``. Isolate ``HOME`` so the user's
``~/.claude/settings.json`` is not inherited.
"""

from __future__ import print_function

import http.client
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
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse


ANSWER_NAME = "answer.js"
ANSWER_STUB = "// Replace this file with the recovered JavaScript program.\n"
CHECKPOINT_MANIFEST = "manifest.json"
CHECKPOINT_BEST = "best_answer.js"
CHECKPOINT_MAX_BYTES = 2 * 1024 * 1024
NODE_TIMEOUT_HINT = (
    "TIMEOUT after %ss: Node hung. Running the obfuscated file or eval'ing "
    "its string-table function is an infinite anti-debug loop. Do not retry "
    "this command; it will hang again. Change approach: write _decode.mjs, "
    "do not import/execute subject.mjs, write decoded.json, keep stdout small."
)
NODE_EVAL_BLOCK = (
    "BLOCKED: node -e / --eval is not allowed. Inline eval of obfuscated "
    "functions is an infinite anti-debug loop. Do not retry node -e. "
    "Write _decode.mjs and run: node _decode.mjs. Write decoded.json and "
    "keep stdout small."
)
NODE_SUBJECT_BLOCK = (
    "BLOCKED: do not execute subject.mjs. That file infinite-loops. "
    "Write _decode.mjs; run node _decode.mjs instead."
)
FIND_ROOT_BLOCK = (
    "BLOCKED: do not run find / or scan the filesystem. Stay in this "
    "directory: find . ...  Do not retry find with /."
)
DEFAULT_MODEL = "opus[1m]"
DEFAULT_BASE_URL = "https://openrouter.ai/api"
DEFAULT_API_KEY_ENV = "OPENROUTER_API_KEY"
SOPHNET_ANTHROPIC_BASE_URL = (
    "https://www.sophnet.com/api/open-apis/anthropic")
SOPHNET_PUBLIC_BASE_URL = "https://api.sophnet.com"
SOPHNET_DEFAULT_MODEL = "DeepSeek-V4-Flash-0731"
DEFAULT_MODEL_ALIASES = {
    "ANTHROPIC_DEFAULT_FABLE_MODEL": "anthropic/claude-opus-4.8",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "anthropic/claude-opus-4.8",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "anthropic/claude-opus-4.8",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "anthropic/claude-opus-4.8",
    "CLAUDE_CODE_SUBAGENT_MODEL": "anthropic/claude-opus-4.8",
}
PROVIDERS = {
    "sophnet": {
        "base_url": SOPHNET_ANTHROPIC_BASE_URL,
        "api_key_env": "SOPHNET_API_KEY",
        "default_model": SOPHNET_DEFAULT_MODEL,
    },
    "openrouter": {
        "base_url": DEFAULT_BASE_URL,
        "api_key_env": DEFAULT_API_KEY_ENV,
        "default_model": DEFAULT_MODEL,
    },
}
SHARED_HOME = Path(
    os.environ.get("ADB_CLAUDE_HOME")
    or str(Path.home() / ".cache" / "adb-claude-home"))
ALLOWED_TOOLS = ("Read", "Glob", "Grep", "Edit", "Write", "Bash")
DENIED_TOOLS = ("WebFetch", "WebSearch")


def provider_id(value):
    return str(value or "").strip().lower()


def is_claude_native_model(value):
    """True for Claude Code / Anthropic ids that Sophnet will not serve."""
    text = str(value or "").strip()
    if not text:
        return False
    lower = text.lower()
    if lower.startswith("anthropic/") or lower.startswith("claude"):
        return True
    head = lower.split("[", 1)[0]
    return head in ("opus", "sonnet", "haiku", "fable")


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
    if not preset:
        return config
    if replace_endpoint or not config.get("base_url"):
        config["base_url"] = preset["base_url"]
    if replace_endpoint or not config.get("api_key_env"):
        config["api_key_env"] = preset["api_key_env"]
    if not config.get("model") and preset.get("default_model"):
        config["model"] = preset["default_model"]
    if provider == "sophnet":
        if is_claude_native_model(config.get("model")) or not config.get("model"):
            config["model"] = preset["default_model"]
        target = config["model"]
        aliases = config.get("model_aliases")
        rewritten = dict((key, target) for key in DEFAULT_MODEL_ALIASES)
        if isinstance(aliases, dict):
            for key, value in aliases.items():
                if key not in DEFAULT_MODEL_ALIASES and value:
                    rewritten[str(key)] = str(value)
        config["model_aliases"] = rewritten
    return config


def _sophnet_anthropic_root(normalized):
    """Map Sophnet Chat Completions URLs onto the Anthropic Messages root."""
    lower = normalized.lower()
    if "sophnet.com" not in lower:
        return None
    if "://api.sophnet.com" in lower or lower.startswith("api.sophnet.com"):
        return SOPHNET_PUBLIC_BASE_URL
    marker = "/api/open-apis"
    idx = normalized.find(marker)
    if idx < 0:
        return None
    prefix = normalized[: idx + len(marker)]
    rest = normalized[idx + len(marker):].strip("/")
    parts = [part for part in rest.split("/") if part and part != "v1"]
    if parts and parts[-1] == "anthropic":
        return prefix + "/" + "/".join(parts)
    if parts:
        return prefix + "/" + "/".join(parts + ["anthropic"])
    return prefix + "/anthropic"


def anthropic_base_url(value):
    """Root URL. Claude Code appends ``/v1/messages``.

    Sophnet's OpenAI Chat Completions root (``.../open-apis/v1``) is rewritten
    to the Anthropic Messages root (``.../open-apis/anthropic``). The public
    ``https://api.sophnet.com/v1`` host becomes ``https://api.sophnet.com``.
    """
    normalized = str(value or DEFAULT_BASE_URL).rstrip("/")
    for suffix in ("/v1/messages", "/messages", "/chat/completions"):
        if normalized.endswith(suffix):
            normalized = normalized[:-len(suffix)].rstrip("/")
    rewritten = _sophnet_anthropic_root(normalized)
    if rewritten:
        return rewritten
    if normalized.endswith("/v1"):
        return normalized[:-3].rstrip("/")
    return normalized or DEFAULT_BASE_URL


def disable_thinking_payload(payload, max_output_tokens=0):
    """Force DeepSeek/Sophnet thinking off; drop conflicting effort fields.

    ``max_output_tokens`` clamps ``max_tokens`` as well: Claude Code asks for
    a Claude-sized budget (32k) and a DeepSeek deployment that caps lower
    rejects the whole request.
    """
    if not isinstance(payload, dict):
        return payload
    payload = dict(payload)
    payload["thinking"] = {"type": "disabled"}
    payload["enable_thinking"] = False
    payload.pop("reasoning_effort", None)
    payload.pop("output_config", None)
    cap = int(max_output_tokens or 0)
    if cap > 0:
        try:
            current = int(payload.get("max_tokens") or 0)
        except (TypeError, ValueError):
            current = 0
        if current <= 0 or current > cap:
            payload["max_tokens"] = cap
    return payload


def is_messages_endpoint(path):
    """True only for the Messages completion path.

    ``/v1/messages/count_tokens`` must not receive ``thinking`` /
    ``max_tokens`` edits: it is a different schema and a strict gateway
    400s on the extra fields.
    """
    route = str(path or "").split("?", 1)[0].rstrip("/")
    return route.endswith("/messages")


def uses_thinking_off_proxy(task_data):
    """Sophnet DeepSeek thinks by default; proxy injects thinking.disabled.

    Some Sophnet-hosted models (e.g. GLM) always think and reject an
    explicit ``thinking: disabled`` payload with a 400, so they must not
    be routed through this proxy.
    """
    if max_thinking_tokens(task_data):
        return False
    provider, model = split_provider_model(task_data)
    if "glm" in str(model).lower():
        return False
    url = str(task_data.get("base_url") or "")
    return provider == "sophnet" or "sophnet.com" in url.lower()


def start_thinking_off_proxy(upstream, timeout_seconds=300,
                             max_output_tokens=0):
    """Local Anthropic proxy that injects ``thinking: {type: disabled}``."""
    parsed = urlparse(anthropic_base_url(upstream))
    scheme = parsed.scheme or "https"
    host = parsed.hostname or parsed.netloc
    port = parsed.port or (443 if scheme == "https" else 80)
    prefix = (parsed.path or "").rstrip("/")
    timeout_seconds = max(30, int(timeout_seconds))
    conn_cls = http.client.HTTPSConnection if scheme == "https" else http.client.HTTPConnection

    class Handler(BaseHTTPRequestHandler):
        protocol_version = "HTTP/1.1"

        def log_message(self, *_args):
            return

        def _proxy(self):
            length = int(self.headers.get("Content-Length") or 0)
            raw = self.rfile.read(length) if length else b""
            path = str(self.path or "")
            if raw and is_messages_endpoint(path):
                try:
                    payload = json.loads(raw.decode("utf-8"))
                except ValueError:
                    payload = None
                if isinstance(payload, dict):
                    raw = json.dumps(disable_thinking_payload(
                        payload, max_output_tokens)).encode("utf-8")
            headers = {}
            for key, value in self.headers.items():
                if key.lower() in ("host", "content-length", "transfer-encoding", "connection"):
                    continue
                headers[key] = value
            headers["Content-Length"] = str(len(raw))
            headers["Host"] = parsed.netloc
            conn = conn_cls(host, port=port, timeout=timeout_seconds)
            try:
                try:
                    conn.request(self.command, prefix + path, body=raw or None,
                                 headers=headers)
                    resp = conn.getresponse()
                except Exception as exc:  # upstream unreachable / TLS / timeout
                    body = json.dumps({"type": "error", "error": {
                        "type": "api_error",
                        "message": "upstream %s: %s" % (
                            type(exc).__name__, exc)}}).encode("utf-8")
                    self.send_response(502, "Bad Gateway")
                    self.send_header("Content-Type", "application/json")
                    self.send_header("Content-Length", str(len(body)))
                    self.send_header("Connection", "close")
                    self.close_connection = True
                    self.end_headers()
                    self.wfile.write(body)
                    self.wfile.flush()
                    return
                self.send_response(resp.status, resp.reason)
                # Upstream SSE arrives chunked. We relay raw bytes, so the
                # framing has to be replaced: without Content-Length the only
                # end-of-body signal left is closing the connection. Omitting
                # both made every streamed completion hang until
                # API_TIMEOUT_MS.
                streamed = resp.getheader("Content-Length") is None
                for key, value in resp.getheaders():
                    if key.lower() in ("transfer-encoding", "connection"):
                        continue
                    self.send_header(key, value)
                if streamed:
                    self.send_header("Connection", "close")
                    self.close_connection = True
                self.end_headers()
                while True:
                    chunk = resp.read(8192)
                    if not chunk:
                        break
                    self.wfile.write(chunk)
                    self.wfile.flush()
                self.wfile.flush()
            finally:
                conn.close()

        def do_GET(self):
            self._proxy()

        def do_POST(self):
            self._proxy()

        def do_PUT(self):
            self._proxy()

    httpd = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
    thread = threading.Thread(target=httpd.serve_forever, kwargs={"poll_interval": 0.2})
    thread.daemon = True
    thread.start()
    local = "http://127.0.0.1:%s" % httpd.server_address[1]

    def stop():
        try:
            httpd.shutdown()
        except Exception:
            pass
        try:
            httpd.server_close()
        except Exception:
            pass

    return {"base_url": local, "stop": stop}


def api_timeout_ms(task_data):
    """Abort a hung model HTTP call instead of sitting silent until wall clock."""
    try:
        value = int(task_data.get("api_timeout_ms") or 90000)
    except (TypeError, ValueError):
        value = 90000
    return max(30000, min(value, 300000))


def max_output_tokens(task_data):
    """Per-response token cap. 0 leaves Claude Code's own default in place.

    Claude Code sizes ``max_tokens`` for Claude. A non-Claude deployment
    behind an Anthropic-compatible gateway often caps lower and rejects the
    whole request, so the value is configurable per provider.
    """
    try:
        value = int(task_data.get("max_output_tokens") or 0)
    except (TypeError, ValueError):
        value = 0
    return max(0, min(value, 200000))


def bash_max_output_length(task_data):
    """Cap bash stdout so huge dumps are not pasted into the next API call."""
    try:
        value = int(task_data.get("bash_max_output_length") or 8000)
    except (TypeError, ValueError):
        value = 8000
    return max(2000, min(value, 32000))


def bash_timeout_ms(task_data):
    """Kill hung shells and return the error instead of eating the wall clock."""
    try:
        value = int(task_data.get("bash_timeout_ms") or 120000)
    except (TypeError, ValueError):
        value = 120000
    return max(5000, min(value, 300000))


def wait_state(kind, quiet, shell_ms):
    """What the heartbeat claims we are waiting on."""
    kind = str(kind or "")
    bash_grace = (float(shell_ms) / 1000.0) + 5
    if kind == "bash_preflight":
        return "preflight"
    if kind == "thinking_delta" or kind.startswith("thinking"):
        return "thinking" if float(quiet) < 5 else "model"
    if kind.startswith("tool_use Bash") and float(quiet) < bash_grace:
        return "bash"
    if kind.startswith("tool_use") and not kind.startswith("tool_use Bash"):
        return "tool"
    return "model"


def max_thinking_tokens(task_data):
    """Claude Code extended thinking budget. 0 leaves thinking off."""
    try:
        value = int(task_data.get("max_thinking_tokens") or 0)
    except (TypeError, ValueError):
        value = 0
    return max(0, min(value, 65536))


def model_alias_env(task_data):
    """Map Claude Code alias env vars onto the provider model IDs."""
    provider, model = split_provider_model(task_data)
    if provider == "sophnet":
        aliases = dict(
            (key, model or SOPHNET_DEFAULT_MODEL)
            for key in DEFAULT_MODEL_ALIASES)
    else:
        aliases = dict(DEFAULT_MODEL_ALIASES)
    custom = task_data.get("model_aliases")
    if isinstance(custom, dict):
        for key, value in custom.items():
            if value:
                aliases[str(key)] = str(value)
    return aliases


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
        "%sRead TASK.md. The program is %s on disk. Do not use the Read tool on "
        "that one-liner; load slices with bash/Node. Keep bash stdout small. "
        "Do not execute %s. The harness blocks node -e. "
        "On decoder and rewrite scripts set timeout_ms to %d. "
        "Do not wrap those scripts in a 2-5s timeout. "
        "Improve answer.js early and keep it syntactically valid. "
        "Do not finish until answer.js is source a programmer could read "
        "and change. "
        "Record concise progress in CHECKPOINT.md. Do not fetch the web.\n"
        % (prefix, entry, entry, bash_timeout_ms(task_data))
    )


def build_settings(task_data):
    """Project/user settings written into the isolated Claude home."""
    shell_ms = bash_timeout_ms(task_data)
    http_ms = api_timeout_ms(task_data)
    out_len = bash_max_output_length(task_data)
    think = max_thinking_tokens(task_data)
    model = task_data.get("model") or DEFAULT_MODEL
    env = {
        "ANTHROPIC_BASE_URL": anthropic_base_url(task_data.get("base_url")),
        "ANTHROPIC_MODEL": model,
        "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC": "1",
        "DISABLE_AUTOUPDATER": "1",
        # Default Claude bash timeout is 120s; anti-debug loops eat that.
        "BASH_DEFAULT_TIMEOUT_MS": str(shell_ms),
        "BASH_MAX_TIMEOUT_MS": str(shell_ms),
        # Huge stdout (string table dumps) is pasted into the next request.
        "BASH_MAX_OUTPUT_LENGTH": str(out_len),
        # Default API timeout is 600s; a stalled completion looks idle.
        "API_TIMEOUT_MS": str(http_ms),
        # Skip the local injection classifier. The hidden bash-prefix API
        # still runs; do not also set MAX_THINKING_TOKENS or that extra
        # call inherits a 16k thinking budget and can stall for minutes.
        "CLAUDE_CODE_DISABLE_COMMAND_INJECTION_CHECK": "1",
    }
    env.update(model_alias_env(task_data))
    if think:
        env["MAX_THINKING_TOKENS"] = str(think)
    out_tokens = max_output_tokens(task_data)
    if out_tokens:
        env["CLAUDE_CODE_MAX_OUTPUT_TOKENS"] = str(out_tokens)
    settings = {
        "env": env,
        "permissions": {
            "allow": list(ALLOWED_TOOLS),
            "deny": list(DENIED_TOOLS),
        },
    }
    if think:
        settings["alwaysThinkingEnabled"] = True
    return settings


def system_node(wrapper_dirs=None):
    """The real ``node`` binary, skipping timeout wrappers on PATH."""
    skip = set()
    for item in list(wrapper_dirs or ()) + [SHARED_HOME / ".adb-bin"]:
        try:
            skip.add(str(Path(item).resolve()))
        except OSError:
            continue
    for directory in os.environ.get("PATH", "").split(os.pathsep):
        if not directory:
            continue
        try:
            resolved_dir = str(Path(directory).resolve())
        except OSError:
            resolved_dir = directory
        if resolved_dir in skip:
            continue
        candidate = Path(directory) / "node"
        if candidate.is_file() and os.access(str(candidate), os.X_OK):
            try:
                return str(candidate.resolve())
            except OSError:
                return str(candidate)
    return None


def is_env_node_script(path):
    try:
        with open(path, "r", encoding="utf-8", errors="replace") as handle:
            first = handle.readline()
    except OSError:
        return False
    return first.startswith("#!") and "node" in first.lower()


def launch_argv(cmd, real_node=None):
    """Start Claude with the real node binary, not the PATH timeout wrapper.

    ``/usr/bin/claude`` is ``#!/usr/bin/env node``. If PATH puts the wrapper
    first, GNU timeout kills the whole CLI (exit 124) after bash_timeout_ms.
    """
    if not cmd:
        return list(cmd)
    exe = cmd[0]
    if os.path.isabs(str(exe)) and os.path.isfile(str(exe)):
        resolved = str(exe)
    else:
        resolved = shutil.which(str(exe)) or str(exe)
    try:
        resolved = str(Path(resolved).resolve())
    except OSError:
        pass
    node = real_node or system_node()
    if node and is_env_node_script(resolved):
        return [node, resolved] + list(cmd[1:])
    return [resolved] + list(cmd[1:])


def install_node_timeout_wrapper(home, shell_ms):
    """PATH wrapper so hung ``node`` dies even if Claude ignores BASH_*_MS.

    Some Claude Code builds do not honor ``BASH_DEFAULT_TIMEOUT_MS``. The
    anti-debug trap is almost always a ``node`` process, so wrapping that
    binary is enough. The Claude CLI itself must not go through this wrapper.
    """
    timeout_bin = shutil.which("timeout")
    bin_dir = Path(home) / ".adb-bin"
    real_node = system_node(wrapper_dirs=(bin_dir,))
    if not timeout_bin or not real_node:
        return None
    if Path(real_node).parent == bin_dir.resolve():
        return bin_dir
    bin_dir.mkdir(parents=True, exist_ok=True)
    seconds = max(1, int(round(float(shell_ms) / 1000.0)))
    node_q = json.dumps(real_node)
    timeout_q = json.dumps(timeout_bin)
    hint_q = json.dumps(NODE_TIMEOUT_HINT % seconds)
    eval_q = json.dumps(NODE_EVAL_BLOCK)
    subject_q = json.dumps(NODE_SUBJECT_BLOCK)
    wrapper = bin_dir / "node"
    wrapper.write_text(
        "#!/bin/sh\n"
        "script=\"\"\n"
        "for arg in \"$@\"; do\n"
        "  case \"$arg\" in\n"
        "    -e|--eval)\n"
        "      printf '%%s\\n' %s >&2\n"
        "      exit 2\n"
        "      ;;\n"
        "    -*) continue ;;\n"
        "    *) script=\"$arg\"; break ;;\n"
        "  esac\n"
        "done\n"
        "case \"$script\" in\n"
        "  */claude|*/claude.js|*claude-code*)\n"
        "    exec %s \"$@\"\n"
        "    ;;\n"
        "  *subject.mjs|*subject.js)\n"
        "    printf '%%s\\n' %s >&2\n"
        "    exit 2\n"
        "    ;;\n"
        "esac\n"
        "%s --kill-after=2 %s %s \"$@\"\n"
        "status=$?\n"
        "if [ \"$status\" -eq 124 ] || [ \"$status\" -eq 137 ] "
        "|| [ \"$status\" -eq 143 ]; then\n"
        "  printf '%%s\\n' %s >&2\n"
        "  exit 124\n"
        "fi\n"
        "exit \"$status\"\n"
        % (eval_q, node_q, subject_q, timeout_q, seconds, node_q, hint_q),
        encoding="utf-8")
    wrapper.chmod(0o755)
    install_find_root_wrapper(bin_dir)
    return bin_dir


def install_find_root_wrapper(bin_dir):
    """Block ``find /`` so the agent cannot scan the whole machine."""
    real = shutil.which("find")
    if not real:
        return None
    bin_dir = Path(bin_dir)
    try:
        if Path(real).resolve().parent == bin_dir.resolve():
            return bin_dir
    except OSError:
        pass
    bin_dir.mkdir(parents=True, exist_ok=True)
    wrapper = bin_dir / "find"
    wrapper.write_text(
        "#!/bin/sh\n"
        "for arg in \"$@\"; do\n"
        "  case \"$arg\" in\n"
        "    /)\n"
        "      printf '%%s\\n' %s >&2\n"
        "      exit 2\n"
        "      ;;\n"
        "  esac\n"
        "done\n"
        "exec %s \"$@\"\n"
        % (json.dumps(FIND_ROOT_BLOCK), json.dumps(real)),
        encoding="utf-8")
    wrapper.chmod(0o755)
    return bin_dir


def isolate_home(task_data):
    """Persistent Claude home away from the user's personal ~/.claude."""
    home = SHARED_HOME
    claude_dir = home / ".claude"
    claude_dir.mkdir(parents=True, exist_ok=True)
    (claude_dir / "settings.json").write_text(
        json.dumps(build_settings(task_data), ensure_ascii=False, indent=2)
        + "\n",
        encoding="utf-8")
    install_node_timeout_wrapper(home, bash_timeout_ms(task_data))
    install_find_root_wrapper(home / ".adb-bin")
    return home, claude_dir


def build_cli(workspace, prompt, task_data):
    """``claude --print`` in the workspace. Prompt is a positional argument."""
    executable = task_data.get("claude_executable") or "claude"
    model = task_data.get("model") or DEFAULT_MODEL
    mode = task_data.get("permission_mode") or "bypassPermissions"
    cmd = [
        executable,
        "--print",
        "--output-format", "stream-json",
        "--verbose",
        "--model", model,
        "--permission-mode", mode,
        "--dangerously-skip-permissions",
        "--no-chrome",
        "--no-session-persistence",
        "--disable-slash-commands",
        "--include-partial-messages",
        "--setting-sources", "user",
        "--tools", ",".join(ALLOWED_TOOLS),
        "--disallowedTools", ",".join(DENIED_TOOLS),
        "--",
        prompt,
    ]
    del workspace
    return cmd


def write_workspace_files(workspace, task_data):
    """Materialize TASK.md and CLAUDE.md (Claude Code reads the latter)."""
    workspace = Path(workspace)
    prompt = build_prompt(task_data)
    (workspace / "TASK.md").write_text(prompt, encoding="utf-8")
    (workspace / "CLAUDE.md").write_text(prompt, encoding="utf-8")
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


def has_claude_auth(task_data=None):
    task_data = task_data or {}
    env_name = task_data.get("api_key_env") or DEFAULT_API_KEY_ENV
    return bool(task_data.get("api_key") or os.environ.get(env_name))


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


def _tool_preview(block):
    name = block.get("name") or ""
    payload = block.get("input") or {}
    title = ""
    if isinstance(payload, dict):
        title = (
            payload.get("command")
            or payload.get("file_path")
            or payload.get("path")
            or payload.get("pattern")
            or ""
        )
    return "%s %s" % (name, str(title).replace("\n", " ").strip()[:120])


def stream_activity_kind(line):
    """Heartbeat kind for stream lines that summarize_event skips."""
    text = line or ""
    if "Pre-flight check" in text:
        return "bash_preflight"
    if "thinking_delta" in text:
        return "thinking_delta"
    return None


def summarize_event(line):
    """Compact progress line from Claude ``stream-json``."""
    line = (line or "").strip()
    if not line.startswith("{"):
        return None
    try:
        event = json.loads(line)
    except ValueError:
        return None
    if not isinstance(event, dict):
        return None
    etype = str(event.get("type") or "")
    if etype in ("stream_event",) or etype.endswith("_delta") or "delta" in etype:
        return None
    if etype == "assistant":
        message = event.get("message") or {}
        content = message.get("content") or []
        if isinstance(content, str) and content.strip():
            return "text " + content.replace("\n", " ").strip()[:160]
        if isinstance(content, list):
            for block in content:
                if not isinstance(block, dict):
                    continue
                btype = block.get("type")
                if btype == "tool_use":
                    return "tool_use " + _tool_preview(block).strip()
                if btype in ("thinking", "redacted_thinking"):
                    thought = block.get("thinking") or block.get("text") or ""
                    preview = str(thought).replace("\n", " ").strip()[:160]
                    return ("thinking " + preview).rstrip()
                if btype == "text" and block.get("text"):
                    return "text " + str(block["text"]).replace("\n", " ").strip()[:160]
        return None
    if etype == "result":
        subtype = event.get("subtype") or ""
        err = event.get("is_error") or event.get("error")
        bits = ["result", subtype]
        if err:
            bits.append(str(err)[:200])
        return " ".join(str(bit) for bit in bits if bit)
    if etype in ("error", "system"):
        msg = event.get("message") or event.get("error") or event.get("subtype") or ""
        if etype == "system" and event.get("subtype") == "init":
            return "system init"
        if not msg:
            return None
        return "%s %s" % (etype, str(msg).replace("\n", " ").strip()[:240])
    return etype or None


def event_text_parts(stdout):
    texts = []
    for event in iter_events(stdout):
        if event.get("type") == "assistant":
            message = event.get("message") or {}
            content = message.get("content")
            if isinstance(content, str) and content.strip():
                texts.append(content)
            elif isinstance(content, list):
                for block in content:
                    if isinstance(block, dict) and block.get("type") == "text":
                        text = block.get("text")
                        if isinstance(text, str) and text.strip():
                            texts.append(text)
        elif event.get("type") == "result":
            result = event.get("result")
            if isinstance(result, str) and result.strip():
                texts.append(result)
    return texts


def _usage_from_model_map(model_usage):
    """Normalize Claude Code's final per-model aggregate.

    ``result.modelUsage`` includes subagents and separates uncached input,
    cache creation, cache reads, and output.  It is more complete than the
    legacy top-level ``result.usage`` object.
    """
    usage = {}
    if not isinstance(model_usage, dict):
        return usage
    for metrics in model_usage.values():
        if not isinstance(metrics, dict):
            continue
        for src, dst in (
            ("inputTokens", "prompt_tokens"),
            ("outputTokens", "completion_tokens"),
            ("cacheReadInputTokens", "cache_read_tokens"),
            ("cacheCreationInputTokens", "cache_write_tokens"),
        ):
            value = metrics.get(src)
            if isinstance(value, (int, float)):
                usage[dst] = int(usage.get(dst, 0) + value)
    if usage:
        usage["total_tokens"] = sum(
            int(usage.get(key) or 0) for key in (
                "prompt_tokens", "completion_tokens",
                "cache_read_tokens", "cache_write_tokens"))
    return usage


def usage_from_output(stdout):
    usage = {}
    final_usage = {}
    for event in iter_events(stdout):
        if event.get("type") == "result":
            model_usage = _usage_from_model_map(event.get("modelUsage"))
            if model_usage:
                final_usage = model_usage
                continue
        payload = event.get("usage") or {}
        if event.get("type") == "result" and isinstance(payload, dict):
            tokens = payload
        else:
            message = event.get("message") or {}
            tokens = message.get("usage") if isinstance(message, dict) else {}
        if not isinstance(tokens, dict):
            continue
        for src, dst in (
            ("input_tokens", "prompt_tokens"),
            ("output_tokens", "completion_tokens"),
            ("cache_read_input_tokens", "cache_read_tokens"),
            ("cache_creation_input_tokens", "cache_write_tokens"),
            ("prompt_tokens", "prompt_tokens"),
            ("completion_tokens", "completion_tokens"),
            ("total_tokens", "total_tokens"),
        ):
            value = tokens.get(src)
            if isinstance(value, (int, float)):
                usage[dst] = int(value)
        if "prompt_tokens" in usage and "completion_tokens" in usage:
            usage["total_tokens"] = sum(
                int(usage.get(key) or 0) for key in (
                    "prompt_tokens", "completion_tokens",
                    "cache_read_tokens", "cache_write_tokens"))
    return final_usage or usage


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


_HEX_ID_RE = re.compile(r"\b_0x[0-9a-fA-F]+\b")


def _strip_leading_noise(text):
    """Drop leading comments/blank lines so comment-only edits compare equal."""
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
    # Obfuscated modules are often one line, so import/export need not begin
    # a physical line.
    if re.search(r"(?:^|[;{}])\s*(?:import\b|export\b)", text):
        return ".mjs"
    return ".cjs"


def syntax_check(code, timeout=15):
    if not (code or "").strip():
        return False, "empty candidate"
    handle = tempfile.NamedTemporaryFile(
        suffix=syntax_suffix(code), prefix="adb-claude-", delete=False,
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


def cli_error_from_events(stdout):
    for event in iter_events(stdout):
        etype = str(event.get("type") or "")
        if etype == "result" and (
                event.get("is_error") or event.get("subtype") == "error"):
            msg = event.get("error") or event.get("result") or event.get("errors")
            if isinstance(msg, str) and msg.strip():
                return msg.strip()[:2000]
            return "claude result error"
        if etype == "error":
            msg = event.get("message") or event.get("error") or ""
            if isinstance(msg, str) and msg.strip():
                return msg.strip()[:2000]
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


def run_claude(workspace, prompt, task_data):
    timeout = float(task_data.get("timeout") or 600)
    env = os.environ.copy()
    env_name = task_data.get("api_key_env") or DEFAULT_API_KEY_ENV
    api_key = task_data.get("api_key") or os.environ.get(env_name)
    real_node = system_node()
    proxy = None
    task_data = dict(task_data)
    if uses_thinking_off_proxy(task_data):
        proxy = start_thinking_off_proxy(
            anthropic_base_url(task_data.get("base_url")),
            timeout_seconds=max(60, api_timeout_ms(task_data) // 1000 + 30),
            max_output_tokens=max_output_tokens(task_data),
        )
        task_data["base_url"] = proxy["base_url"]
        print("[claude] thinking-off proxy %s -> sophnet" % proxy["base_url"],
              file=sys.stderr, flush=True)
    try:
        return _run_claude_process(
            workspace, prompt, task_data, env, env_name, api_key, real_node,
            timeout)
    finally:
        if proxy:
            proxy["stop"]()


def _run_claude_process(workspace, prompt, task_data, env, env_name, api_key,
                        real_node, timeout):
    home, claude_dir = isolate_home(task_data)
    shell_ms = bash_timeout_ms(task_data)
    env["HOME"] = str(home)
    env["CLAUDE_CONFIG_DIR"] = str(claude_dir)
    env["ANTHROPIC_BASE_URL"] = anthropic_base_url(task_data.get("base_url"))
    env["BASH_DEFAULT_TIMEOUT_MS"] = str(shell_ms)
    env["BASH_MAX_TIMEOUT_MS"] = str(shell_ms)
    env["BASH_MAX_OUTPUT_LENGTH"] = str(bash_max_output_length(task_data))
    env["API_TIMEOUT_MS"] = str(api_timeout_ms(task_data))
    env["CLAUDE_CODE_DISABLE_COMMAND_INJECTION_CHECK"] = "1"
    think = max_thinking_tokens(task_data)
    if think:
        env["MAX_THINKING_TOKENS"] = str(think)
    else:
        env.pop("MAX_THINKING_TOKENS", None)
    out_tokens = max_output_tokens(task_data)
    if out_tokens:
        env["CLAUDE_CODE_MAX_OUTPUT_TOKENS"] = str(out_tokens)
    else:
        env.pop("CLAUDE_CODE_MAX_OUTPUT_TOKENS", None)
    wrapper_dir = home / ".adb-bin"
    if wrapper_dir.is_dir():
        env["PATH"] = str(wrapper_dir) + os.pathsep + env.get("PATH", "")
    model = task_data.get("model") or DEFAULT_MODEL
    env["ANTHROPIC_MODEL"] = model
    env.update(model_alias_env(task_data))
    env["CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC"] = "1"
    env["DISABLE_AUTOUPDATER"] = "1"
    # AUTH_TOKEN is what Claude Code sends to third-party Anthropic gateways.
    # Clear API_KEY so a leftover Anthropic key does not win.
    env.pop("ANTHROPIC_API_KEY", None)
    if api_key:
        env[env_name] = api_key
        env["ANTHROPIC_AUTH_TOKEN"] = api_key
    build_id = task_data.get("build_id") or "deobfuscate"
    cmd = launch_argv(build_cli(workspace, prompt, task_data), real_node)
    print("[claude] launching %s model=%s timeout=%ss bash=%sms thinking=%s" %
          (build_id, model, int(timeout), shell_ms, think),
          file=sys.stderr, flush=True)
    started = time.time()
    last_event = {"t": started, "kind": "start"}
    last_checkpoint = started
    try:
        proc = subprocess.Popen(
            cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True,
            env=env, cwd=str(workspace), bufsize=1, start_new_session=True)
    except FileNotFoundError:
        return "", "", -1, "claude executable not found: %s" % cmd[0]

    stdout_chunks = []
    stderr_chunks = []

    def pump(stream, sink, kind):
        try:
            for line in iter(stream.readline, ""):
                last_event["t"] = time.time()
                sink.append(line)
                activity = stream_activity_kind(line)
                if activity:
                    last_event["kind"] = activity
                    if activity == "bash_preflight":
                        print("[claude] bash_preflight extra API still running",
                              file=sys.stderr, flush=True)
                if kind != "out":
                    continue
                summary = summarize_event(line)
                if summary:
                    last_event["kind"] = summary
                    print("[claude] %s" % summary, file=sys.stderr, flush=True)
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
    timeout_error = None
    while proc.poll() is None:
        now = time.time()
        elapsed = now - started
        if now - last_checkpoint >= 10:
            saved = save_checkpoint(
                workspace, task_data.get("checkpoint_dir"),
                task_data.get("source") or "")
            last_checkpoint = now
            if saved.get("saved"):
                print("[claude] checkpoint saved: %s" %
                      ",".join(saved["saved"][:8]),
                      file=sys.stderr, flush=True)
        if elapsed >= timeout:
            timed_out = True
            timeout_error = "Timeout after %ss" % int(timeout)
            print("[claude] killing %s: wall timeout %ss" %
                  (build_id, int(timeout)), file=sys.stderr, flush=True)
            _kill_process_tree(proc)
            break
        try:
            proc.wait(timeout=min(10, max(0.1, timeout - elapsed)))
        except subprocess.TimeoutExpired:
            now = time.time()
            elapsed = now - started
            quiet = now - last_event["t"]
            kind = last_event.get("kind")
            wait = wait_state(kind, quiet, shell_ms)
            print("[claude] %s still running %.0fs / %ss (quiet %.0fs, waiting %s)" %
                  (build_id, elapsed, int(timeout), quiet, wait),
                  file=sys.stderr, flush=True)
    for thread in readers:
        thread.join(timeout=5)
    stdout = "".join(stdout_chunks)
    stderr = "".join(stderr_chunks)
    if timed_out:
        return stdout, stderr, -1, timeout_error or (
            "Timeout after %ss" % int(timeout))
    return stdout, stderr, proc.returncode, None


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
            print("[claude] continuation pass %d/%d %s hex_ids=%d" %
                  (pass_index, passes, task_data.get("build_id") or "",
                   remaining),
                  file=sys.stderr, flush=True)
        stdout, stderr, returncode, error = run_claude(
            workspace, run_message, active)
        _merge_usage(usage, usage_from_output(stdout))
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
                 or "claude exited %s" % returncode)
    ok, detail = syntax_check(code) if code.strip() else (False, "empty candidate")
    texts = event_text_parts(stdout)
    return {
        "build_id": task_data.get("build_id"),
        "prompt": prompt,
        "claude_cli": build_cli(workspace, run_message, active),
        "claude_settings": build_settings(active),
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
