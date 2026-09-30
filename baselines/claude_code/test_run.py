#!/usr/bin/env python3
"""Deterministic tests for the Claude Code deobfuscation driver."""

import http.client
import importlib.util
import json
import os
import shutil
import stat
import subprocess
import tempfile
import threading
import time
import unittest
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


HERE = Path(__file__).resolve().parent
WORKER_SPEC = importlib.util.spec_from_file_location(
    "_adb_claude_worker_tested", HERE / "worker.py")
worker = importlib.util.module_from_spec(WORKER_SPEC)
WORKER_SPEC.loader.exec_module(worker)
RUN_SPEC = importlib.util.spec_from_file_location(
    "_adb_claude_run_tested", HERE / "run.py")
claude = importlib.util.module_from_spec(RUN_SPEC)
RUN_SPEC.loader.exec_module(claude)


class ClaudeWorkerTests(unittest.TestCase):
    def test_prompt_names_entry_and_answer(self):
        source = "var _0xabc = '" + ("x" * 500) + "';"
        prompt = worker.build_prompt({
            "entry": "subject.mjs",
            "source": source,
            "prompt": Path(HERE / "prompt.txt").read_text(encoding="utf-8"),
        })
        self.assertIn("answer.js", prompt)
        self.assertIn("GitHub", prompt)
        self.assertIn("anti-debug", prompt)
        self.assertIn("Read tool", prompt)
        self.assertIn("on disk", prompt)
        self.assertIn("head -c", prompt)
        self.assertIn("decoded.json", prompt)
        self.assertIn("node -e", prompt)
        self.assertIn("programmer", prompt)
        self.assertIn("timeout_ms", prompt)
        self.assertIn("120000", prompt)
        self.assertNotIn("few seconds", prompt)
        self.assertNotIn("{bash_timeout_ms}", prompt)
        self.assertNotIn("{source}", prompt)
        self.assertNotIn("{entry}", prompt)
        self.assertIn("subject.mjs", prompt)
        self.assertNotIn(source, prompt)
        self.assertNotIn("OpenCode", prompt)
        self.assertNotIn("Codex", prompt)

    def test_run_message_asks_to_read_task(self):
        message = worker.build_run_message({"entry": "subject.mjs"})
        self.assertIn("Start from the safety draft", message)
        self.assertIn("Read TASK.md", message)
        self.assertIn("Improve answer.js early", message)
        self.assertIn("CHECKPOINT.md", message)
        resumed = worker.build_run_message({
            "entry": "subject.mjs", "checkpoint_restored": True})
        self.assertIn("Resume from the restored checkpoint files", resumed)

    def test_cli_is_claude_print_not_opencode_or_codex(self):
        cmd = worker.build_cli("/tmp/ws", "write answer.js", {
            "model": "opus[1m]",
            "entry": "subject.mjs",
        })
        self.assertEqual(cmd[0], "claude")
        self.assertIn("--print", cmd)
        self.assertEqual(cmd[cmd.index("--output-format") + 1], "stream-json")
        self.assertEqual(cmd[cmd.index("--model") + 1], "opus[1m]")
        self.assertEqual(cmd[-1], "write answer.js")
        self.assertIn("--", cmd)
        self.assertEqual(cmd[cmd.index("--") + 1], "write answer.js")
        self.assertNotIn("opencode", cmd)
        self.assertNotIn("codex", cmd)
        self.assertIn("--include-partial-messages", cmd)
        self.assertIn("WebFetch,WebSearch", cmd)
        self.assertIn("bypassPermissions", cmd)

    def test_settings_use_openrouter_anthropic_not_chat_completions(self):
        settings = worker.build_settings({
            "base_url": "https://openrouter.ai/api",
            "model": "opus[1m]",
        })
        self.assertEqual(
            settings["env"]["ANTHROPIC_BASE_URL"],
            "https://openrouter.ai/api")
        self.assertEqual(settings["env"]["ANTHROPIC_MODEL"], "opus[1m]")
        self.assertEqual(
            settings["env"]["ANTHROPIC_DEFAULT_OPUS_MODEL"],
            "anthropic/claude-opus-4.8")
        self.assertEqual(
            settings["env"]["ANTHROPIC_DEFAULT_SONNET_MODEL"],
            "anthropic/claude-opus-4.8")
        self.assertEqual(
            settings["env"]["ANTHROPIC_DEFAULT_HAIKU_MODEL"],
            "anthropic/claude-opus-4.8")
        self.assertEqual(
            settings["env"]["ANTHROPIC_DEFAULT_FABLE_MODEL"],
            "anthropic/claude-opus-4.8")
        self.assertEqual(
            settings["env"]["CLAUDE_CODE_SUBAGENT_MODEL"],
            "anthropic/claude-opus-4.8")
        self.assertIn("WebFetch", settings["permissions"]["deny"])
        self.assertNotIn("open-apis/v1", settings["env"]["ANTHROPIC_BASE_URL"])
        self.assertEqual(settings["env"]["BASH_DEFAULT_TIMEOUT_MS"], "120000")
        self.assertEqual(settings["env"]["BASH_MAX_TIMEOUT_MS"], "120000")
        self.assertEqual(settings["env"]["API_TIMEOUT_MS"], "90000")
        self.assertEqual(settings["env"]["BASH_MAX_OUTPUT_LENGTH"], "8000")
        self.assertNotIn("MAX_THINKING_TOKENS", settings["env"])
        self.assertNotIn("alwaysThinkingEnabled", settings)
        self.assertEqual(
            settings["env"]["CLAUDE_CODE_DISABLE_COMMAND_INJECTION_CHECK"], "1")

    def test_thinking_budget_is_opt_in_and_clamped(self):
        self.assertEqual(worker.max_thinking_tokens({}), 0)
        self.assertEqual(worker.max_thinking_tokens({"max_thinking_tokens": -1}), 0)
        self.assertEqual(worker.max_thinking_tokens({"max_thinking_tokens": 999999}), 65536)
        settings = worker.build_settings({"max_thinking_tokens": 16384})
        self.assertEqual(settings["env"]["MAX_THINKING_TOKENS"], "16384")
        self.assertTrue(settings["alwaysThinkingEnabled"])
        off = worker.build_settings({"max_thinking_tokens": 0})
        self.assertNotIn("MAX_THINKING_TOKENS", off["env"])
        self.assertNotIn("alwaysThinkingEnabled", off)
        thought = worker.summarize_event(json.dumps({
            "type": "assistant",
            "message": {"content": [{"type": "thinking", "thinking": "plan next tool"}]},
        }))
        self.assertEqual(thought, "thinking plan next tool")
        self.assertEqual(worker.wait_state("thinking_delta", 0, 20000), "thinking")
        self.assertEqual(worker.wait_state("thinking_delta", 20, 20000), "model")
        self.assertEqual(worker.wait_state("bash_preflight", 40, 20000), "preflight")
        self.assertEqual(worker.wait_state("tool_use Bash ls", 5, 20000), "bash")
        self.assertEqual(worker.wait_state("tool_use Bash ls", 40, 20000), "model")
        self.assertEqual(worker.stream_activity_kind(
            '{"type":"stream_event","event":{"delta":{"type":"thinking_delta"}}}'),
            "thinking_delta")
        self.assertEqual(
            worker.stream_activity_kind("⚠️  [BashTool] Pre-flight check is taking longer"),
            "bash_preflight")

    def test_bash_timeout_clamps_to_a_short_kill_window(self):
        self.assertEqual(worker.bash_timeout_ms({}), 120000)
        self.assertEqual(worker.bash_timeout_ms({"bash_timeout_ms": 1000}), 5000)
        self.assertEqual(worker.bash_timeout_ms({"bash_timeout_ms": 999999}), 300000)
        self.assertEqual(worker.api_timeout_ms({}), 90000)
        self.assertEqual(worker.api_timeout_ms({"api_timeout_ms": 1000}), 30000)
        self.assertEqual(worker.api_timeout_ms({"api_timeout_ms": 999999}), 300000)
        self.assertEqual(worker.bash_max_output_length({}), 8000)
        self.assertEqual(worker.bash_max_output_length({"bash_max_output_length": 100}), 2000)
        settings = worker.build_settings({
            "bash_timeout_ms": 8000,
            "api_timeout_ms": 45000,
            "bash_max_output_length": 4000,
        })
        self.assertEqual(settings["env"]["BASH_DEFAULT_TIMEOUT_MS"], "8000")
        self.assertEqual(settings["env"]["BASH_MAX_TIMEOUT_MS"], "8000")
        self.assertEqual(settings["env"]["API_TIMEOUT_MS"], "45000")
        self.assertEqual(settings["env"]["BASH_MAX_OUTPUT_LENGTH"], "4000")

    def test_node_timeout_wrapper_uses_coreutils_timeout(self):
        with tempfile.TemporaryDirectory() as directory:
            bin_dir = worker.install_node_timeout_wrapper(directory, 20000)
            if bin_dir is None:
                self.skipTest("timeout or node is not on PATH")
            script = (bin_dir / "node").read_text(encoding="utf-8")
            self.assertIn("timeout", script)
            self.assertIn(" --kill-after=2 20 ", script)
            self.assertIn("Do not retry", script)
            self.assertIn("infinite anti-debug loop", script)
            self.assertIn("-e|--eval)", script)
            self.assertIn("node -e", script)
            self.assertTrue(os.access(str(bin_dir / "node"), os.X_OK))
            find_wrap = bin_dir / "find"
            self.assertTrue(find_wrap.is_file())
            blocked = subprocess.run(
                [str(find_wrap), "/", "-maxdepth", "1"],
                capture_output=True, text=True)
            self.assertEqual(blocked.returncode, 2)
            self.assertIn("do not run find /", blocked.stderr)

    def test_launch_argv_runs_claude_script_with_real_node(self):
        real = worker.system_node()
        if not real:
            self.skipTest("node is not on PATH")
        with tempfile.TemporaryDirectory() as directory:
            script = Path(directory) / "claude"
            script.write_text("#!/usr/bin/env node\nconsole.log(1)\n", encoding="utf-8")
            script.chmod(0o755)
            argv = worker.launch_argv([str(script), "--print"], real)
            self.assertEqual(argv[0], real)
            self.assertEqual(Path(argv[1]).resolve(), script.resolve())
            self.assertEqual(argv[2], "--print")

    def test_node_wrapper_does_not_kill_claude_entrypoint(self):
        with tempfile.TemporaryDirectory() as directory:
            bin_dir = worker.install_node_timeout_wrapper(directory, 5000)
            if bin_dir is None:
                self.skipTest("timeout or node is not on PATH")
            fake = Path(directory) / "claude"
            fake.write_text(
                "console.log('ok');\nsetTimeout(function () {}, 8000);\n",
                encoding="utf-8")
            env = os.environ.copy()
            env["PATH"] = str(bin_dir) + os.pathsep + env.get("PATH", "")
            started = time.time()
            completed = subprocess.run(
                [str(bin_dir / "node"), str(fake)],
                env=env, capture_output=True, timeout=20)
            elapsed = time.time() - started
            self.assertEqual(completed.returncode, 0)
            self.assertGreaterEqual(elapsed, 7)
            self.assertLess(elapsed, 16)

    def test_node_timeout_wrapper_kills_a_hung_process(self):
        with tempfile.TemporaryDirectory() as directory:
            bin_dir = worker.install_node_timeout_wrapper(directory, 5000)
            if bin_dir is None:
                self.skipTest("timeout or node is not on PATH")
            loop = Path(directory) / "loop.mjs"
            loop.write_text("while (true) {}\n", encoding="utf-8")
            env = os.environ.copy()
            env["PATH"] = str(bin_dir) + os.pathsep + env.get("PATH", "")
            started = time.time()
            completed = subprocess.run(
                ["node", str(loop)],
                env=env, capture_output=True, text=True, timeout=20)
            elapsed = time.time() - started
            self.assertNotEqual(completed.returncode, 0)
            self.assertGreaterEqual(elapsed, 4)
            self.assertLess(elapsed, 12)
            err = completed.stderr or ""
            self.assertIn("TIMEOUT", err)
            self.assertIn("Do not retry", err)
            self.assertIn("infinite anti-debug loop", err)

    def test_node_wrapper_blocks_inline_eval(self):
        with tempfile.TemporaryDirectory() as directory:
            bin_dir = worker.install_node_timeout_wrapper(directory, 20000)
            if bin_dir is None:
                self.skipTest("timeout or node is not on PATH")
            env = os.environ.copy()
            env["PATH"] = str(bin_dir) + os.pathsep + env.get("PATH", "")
            started = time.time()
            completed = subprocess.run(
                ["node", "-e", "console.log(1)"],
                env=env, capture_output=True, text=True, timeout=10)
            self.assertNotEqual(completed.returncode, 0)
            self.assertLess(time.time() - started, 3)
            err = completed.stderr or ""
            self.assertIn("BLOCKED", err)
            self.assertIn("node -e", err)
            self.assertIn("_decode.mjs", err)

    def test_anthropic_base_url_strips_messages_suffix(self):
        url = worker.anthropic_base_url(
            "https://www.sophnet.com/api/open-apis/anthropic/v1/messages")
        self.assertEqual(url, "https://www.sophnet.com/api/open-apis/anthropic")

    def test_openai_chat_completions_url_rewrites_to_sophnet_anthropic(self):
        for raw, expected in (
            ("https://www.sophnet.com/api/open-apis/v1",
             "https://www.sophnet.com/api/open-apis/anthropic"),
            ("https://www.sophnet.com/api/open-apis/v1/chat/completions",
             "https://www.sophnet.com/api/open-apis/anthropic"),
            ("https://www.sophnet.com/api/open-apis",
             "https://www.sophnet.com/api/open-apis/anthropic"),
            ("https://api.sophnet.com/v1", "https://api.sophnet.com"),
            ("https://api.sophnet.com/v1/chat/completions",
             "https://api.sophnet.com"),
        ):
            self.assertEqual(worker.anthropic_base_url(raw), expected)
        settings = worker.build_settings({
            "provider": "sophnet",
            "base_url": "https://www.sophnet.com/api/open-apis/v1",
            "model": "DeepSeek-V4-Flash-0731",
        })
        self.assertEqual(
            settings["env"]["ANTHROPIC_BASE_URL"],
            "https://www.sophnet.com/api/open-apis/anthropic")
        self.assertEqual(
            settings["env"]["ANTHROPIC_MODEL"], "DeepSeek-V4-Flash-0731")
        self.assertEqual(
            settings["env"]["ANTHROPIC_DEFAULT_OPUS_MODEL"],
            "DeepSeek-V4-Flash-0731")
        self.assertEqual(
            settings["env"]["CLAUDE_CODE_SUBAGENT_MODEL"],
            "DeepSeek-V4-Flash-0731")

    def test_sophnet_example_resolves_anthropic_gateway(self):
        cfg = json.loads(
            (HERE / "config.sophnet.example.json").read_text(encoding="utf-8"))
        resolved = worker.apply_provider(cfg)
        self.assertEqual(resolved["provider"], "sophnet")
        self.assertEqual(resolved["model"], cfg["model"])
        self.assertEqual(resolved["api_key_env"], "SOPHNET_API_KEY")
        self.assertEqual(
            worker.anthropic_base_url(resolved["base_url"]),
            "https://www.sophnet.com/api/open-apis/anthropic")
        self.assertEqual(
            resolved["model_aliases"]["ANTHROPIC_DEFAULT_OPUS_MODEL"],
            cfg["model"])

    def test_cli_provider_switches_openrouter_config_to_sophnet(self):
        cfg = json.loads(
            (HERE / "config.example.json").read_text(encoding="utf-8"))
        cfg["provider"] = "sophnet"
        resolved = worker.apply_provider(cfg, replace_endpoint=True)
        self.assertEqual(
            resolved["base_url"],
            "https://www.sophnet.com/api/open-apis/anthropic")
        self.assertEqual(resolved["api_key_env"], "SOPHNET_API_KEY")
        self.assertEqual(resolved["model"], "DeepSeek-V4-Flash-0731")
        self.assertEqual(
            resolved["model_aliases"]["ANTHROPIC_DEFAULT_SONNET_MODEL"],
            "DeepSeek-V4-Flash-0731")

    def test_sophnet_prefix_is_stripped_from_model(self):
        provider, model = worker.split_provider_model({
            "model": "sophnet/DeepSeek-V4-Flash-0731",
        })
        self.assertEqual(provider, "sophnet")
        self.assertEqual(model, "DeepSeek-V4-Flash-0731")

    def test_sophnet_model_override_rewrites_aliases(self):
        cfg = json.loads(
            (HERE / "config.sophnet.example.json").read_text(encoding="utf-8"))
        cfg["model"] = "DeepSeek-V4-Pro-0813"
        resolved = worker.apply_provider(cfg)
        self.assertEqual(resolved["model"], "DeepSeek-V4-Pro-0813")
        self.assertEqual(
            resolved["model_aliases"]["ANTHROPIC_DEFAULT_OPUS_MODEL"],
            "DeepSeek-V4-Pro-0813")
        self.assertEqual(
            resolved["model_aliases"]["CLAUDE_CODE_SUBAGENT_MODEL"],
            "DeepSeek-V4-Pro-0813")

    def test_disable_thinking_payload_strips_effort(self):
        out = worker.disable_thinking_payload({
            "model": "DeepSeek-V4-Flash-0731",
            "thinking": {"type": "enabled"},
            "reasoning_effort": "high",
            "output_config": {"effort": "medium"},
            "messages": [],
        })
        self.assertEqual(out["thinking"], {"type": "disabled"})
        self.assertFalse(out["enable_thinking"])
        self.assertNotIn("reasoning_effort", out)
        self.assertNotIn("output_config", out)
        self.assertTrue(worker.uses_thinking_off_proxy({
            "provider": "sophnet", "max_thinking_tokens": 0}))
        self.assertFalse(worker.uses_thinking_off_proxy({
            "provider": "sophnet", "max_thinking_tokens": 1024}))
        self.assertFalse(worker.uses_thinking_off_proxy({
            "provider": "openrouter"}))
        self.assertFalse(worker.uses_thinking_off_proxy({
            "provider": "sophnet", "model": "GLM-5.3", "max_thinking_tokens": 0}))

    def test_thinking_off_proxy_terminates_a_streamed_response(self):
        """A chunked SSE upstream must still reach end-of-body downstream.

        Relaying raw bytes drops the chunked framing, so without a
        ``Connection: close`` the client waits for more data until
        ``API_TIMEOUT_MS`` on every single completion.
        """
        seen = {}

        class Upstream(BaseHTTPRequestHandler):
            protocol_version = "HTTP/1.1"

            def log_message(self, *_args):
                return

            def do_POST(self):
                length = int(self.headers.get("Content-Length") or 0)
                seen[self.path] = json.loads(self.rfile.read(length))
                self.send_response(200)
                self.send_header("Content-Type", "text/event-stream")
                self.send_header("Transfer-Encoding", "chunked")
                self.end_headers()
                for event in ("message_start", "message_stop"):
                    body = ('event: %s\ndata: {"type":"%s"}\n\n'
                            % (event, event)).encode("utf-8")
                    self.wfile.write(b"%x\r\n%s\r\n" % (len(body), body))
                self.wfile.write(b"0\r\n\r\n")
                self.wfile.flush()

        upstream = ThreadingHTTPServer(("127.0.0.1", 0), Upstream)
        thread = threading.Thread(
            target=upstream.serve_forever, kwargs={"poll_interval": 0.05})
        thread.daemon = True
        thread.start()
        proxy = worker.start_thinking_off_proxy(
            "http://127.0.0.1:%s" % upstream.server_address[1],
            timeout_seconds=30, max_output_tokens=8192)
        try:
            host, port = proxy["base_url"].split("//", 1)[1].split(":")
            conn = http.client.HTTPConnection(host, int(port), timeout=10)
            conn.request(
                "POST", "/v1/messages",
                body=json.dumps({"model": "x", "stream": True,
                                 "max_tokens": 32000, "messages": []}),
                headers={"Content-Type": "application/json"})
            response = conn.getresponse()
            self.assertEqual(response.status, 200)
            # Would raise socket.timeout before the framing fix.
            self.assertIn(b"message_stop", response.read())
            conn.close()
            conn = http.client.HTTPConnection(host, int(port), timeout=10)
            conn.request(
                "POST", "/v1/messages/count_tokens",
                body=json.dumps({"model": "x", "messages": []}),
                headers={"Content-Type": "application/json"})
            conn.getresponse().read()
            conn.close()
        finally:
            proxy["stop"]()
            upstream.shutdown()
            upstream.server_close()
        sent = seen["/v1/messages"]
        self.assertEqual(sent["thinking"], {"type": "disabled"})
        self.assertEqual(sent["max_tokens"], 8192)
        counted = seen["/v1/messages/count_tokens"]
        self.assertNotIn("thinking", counted)
        self.assertNotIn("max_tokens", counted)

    def test_max_output_tokens_reaches_the_cli_env(self):
        self.assertEqual(worker.max_output_tokens({}), 0)
        self.assertNotIn(
            "CLAUDE_CODE_MAX_OUTPUT_TOKENS", worker.build_settings({})["env"])
        env = worker.build_settings({"max_output_tokens": 8192})["env"]
        self.assertEqual(env["CLAUDE_CODE_MAX_OUTPUT_TOKENS"], "8192")

    def test_collect_answer_ignores_chat(self):
        stdout = json.dumps({
            "type": "assistant",
            "message": {"content": [{"type": "text", "text": "```javascript\nexport default 1;\n```"}]},
        })
        with tempfile.TemporaryDirectory() as directory:
            directory = Path(directory)
            (directory / "subject.mjs").write_text("var _0x = 1;\n", encoding="utf-8")
            code, source = worker.collect_answer(directory, stdout=stdout)
            self.assertEqual(source, "none")
            self.assertEqual(code, "")
            (directory / "answer.js").write_text(
                "export default function recovered() { return 1; }\n",
                encoding="utf-8")
            code, source = worker.collect_answer(directory)
            self.assertEqual(source, "answer.js")
            self.assertIn("function recovered", code)

    def test_under_deobfuscated_detects_comment_only_copy(self):
        ids = ", ".join("_0x%x" % i for i in range(40))
        original = "var x = [%s];\nexport default x;\n" % ids
        commented = (
            "/* Safety draft / WIP — decode next */\n"
            "// next steps: rewrite answer.js\n"
            + original)
        recovered = (
            "export default function MarkdownSourceCode() {\n"
            "  return 'ok';\n"
            "}\n")
        self.assertTrue(worker.under_deobfuscated(original, original))
        self.assertTrue(worker.under_deobfuscated(commented, original))
        self.assertFalse(worker.under_deobfuscated(recovered, original))
        partial = "var y = [%s];\n" % ", ".join("_0x%x" % i for i in range(30))
        self.assertTrue(worker.under_deobfuscated(partial, original))
        with tempfile.TemporaryDirectory() as directory:
            directory = Path(directory)
            (directory / "answer.js").write_text(commented, encoding="utf-8")
            code, source = worker.collect_answer(
                directory, original_source=original)
            self.assertEqual(code, commented)
            self.assertEqual(source, "under_deobfuscated")
            (directory / "answer.js").write_text(recovered, encoding="utf-8")
            code, source = worker.collect_answer(
                directory, original_source=original)
            self.assertEqual(source, "answer.js")
            self.assertIn("MarkdownSourceCode", code)

    def test_checkpoint_restores_last_valid_answer_and_helpers(self):
        original = "export default function original() { return 1; }\n"
        improved = "export default function recovered() { return 2; }\n"
        with tempfile.TemporaryDirectory() as root:
            root = Path(root)
            workspace = root / "workspace"
            checkpoint = root / "checkpoint"
            workspace.mkdir()
            (workspace / "answer.js").write_text(original, encoding="utf-8")
            (workspace / "_decode.mjs").write_text(
                "export const decoded = true;\n", encoding="utf-8")
            first = worker.save_checkpoint(workspace, checkpoint, original)
            self.assertTrue(first["best_answer"])
            (workspace / "answer.js").write_text(improved, encoding="utf-8")
            worker.save_checkpoint(workspace, checkpoint, original)
            (workspace / "answer.js").write_text(
                "export default {\n", encoding="utf-8")
            worker.save_checkpoint(workspace, checkpoint, original)

            restored_workspace = root / "restored"
            restored_workspace.mkdir()
            restored = worker.restore_checkpoint(
                restored_workspace, checkpoint)
            self.assertIn("answer.js", restored)
            self.assertIn("_decode.mjs", restored)
            self.assertEqual(
                (restored_workspace / "answer.js").read_text(encoding="utf-8"),
                improved)
            code, source = worker.collect_answer(
                restored_workspace, original_source=original,
                checkpoint_dir=checkpoint)
            self.assertEqual(code, improved)
            self.assertEqual(source, "answer.js")

    def test_summarize_event_keeps_bash(self):
        line = json.dumps({
            "type": "assistant",
            "message": {
                "content": [{
                    "type": "tool_use",
                    "name": "Bash",
                    "input": {"command": "cat subject.mjs"},
                }],
            },
        })
        summary = worker.summarize_event(line)
        self.assertIn("tool_use", summary)
        self.assertIn("cat subject.mjs", summary)

    def test_usage_from_result_event(self):
        stdout = json.dumps({
            "type": "result",
            "subtype": "success",
            "usage": {"input_tokens": 10, "output_tokens": 4},
        })
        usage = worker.usage_from_output(stdout)
        self.assertEqual(usage["prompt_tokens"], 10)
        self.assertEqual(usage["completion_tokens"], 4)
        self.assertEqual(usage["total_tokens"], 14)

    def test_usage_prefers_final_model_aggregate_and_includes_cache(self):
        stdout = "\n".join([
            json.dumps({
                "type": "assistant",
                "message": {
                    "usage": {
                        "input_tokens": 0,
                        "output_tokens": 0,
                    },
                },
            }),
            json.dumps({
                "type": "result",
                "usage": {
                    "input_tokens": 3,
                    "output_tokens": 4,
                    "cache_creation_input_tokens": 5,
                    "cache_read_input_tokens": 6,
                },
                "modelUsage": {
                    "model-a": {
                        "inputTokens": 10,
                        "outputTokens": 4,
                        "cacheReadInputTokens": 20,
                        "cacheCreationInputTokens": 3,
                    },
                    "model-b": {
                        "inputTokens": 2,
                        "outputTokens": 1,
                        "cacheReadInputTokens": 5,
                        "cacheCreationInputTokens": 1,
                    },
                },
            }),
        ])
        usage = worker.usage_from_output(stdout)
        self.assertEqual(usage["prompt_tokens"], 12)
        self.assertEqual(usage["completion_tokens"], 5)
        self.assertEqual(usage["cache_read_tokens"], 25)
        self.assertEqual(usage["cache_write_tokens"], 4)
        self.assertEqual(usage["total_tokens"], 46)

    def test_usage_recomputes_zero_total_from_result_usage(self):
        stdout = "\n".join([
            json.dumps({
                "type": "assistant",
                "message": {
                    "usage": {
                        "input_tokens": 0,
                        "output_tokens": 0,
                        "total_tokens": 0,
                    },
                },
            }),
            json.dumps({
                "type": "result",
                "usage": {
                    "input_tokens": 10,
                    "output_tokens": 4,
                    "cache_creation_input_tokens": 2,
                    "cache_read_input_tokens": 20,
                },
            }),
        ])
        usage = worker.usage_from_output(stdout)
        self.assertEqual(usage["total_tokens"], 36)

    def test_syntax_check_accepts_valid_javascript(self):
        ok, detail = worker.syntax_check(
            "export default function f() { return 1; }\n")
        self.assertNotEqual(ok, False)
        if ok is True:
            self.assertEqual(detail, "")


class ClaudeDriverTests(unittest.TestCase):
    def test_dry_run_writes_prediction_without_launching(self):
        builds = claude.DEFAULT_BUILDS
        with tempfile.TemporaryDirectory() as directory:
            directory = Path(directory)
            output = directory / "predictions.jsonl"
            code = claude.main([
                "--dry-run", "--limit", "1",
                "--builds", str(builds),
                "--output", str(output),
                "--output-dir", str(directory / "outputs"),
                "--transcript-dir", str(directory / "transcripts"),
                "--system", "test@claude_code",
            ])
            self.assertEqual(code, 0)
            rows = [json.loads(line) for line in output.read_text(
                encoding="utf-8").splitlines() if line.strip()]
            self.assertEqual(len(rows), 1)
            self.assertEqual(rows[0]["status"], "dry_run")
            self.assertEqual(rows[0]["level"], "claude_code")
            transcript = json.loads(
                (directory / rows[0]["transcript_path"]).read_text(encoding="utf-8"))
            self.assertIn("answer.js", transcript["prompt"])
            self.assertEqual(transcript["claude_cli"][0], "claude")
            self.assertIn("--print", transcript["claude_cli"])
            self.assertIn("--", transcript["claude_cli"])
            self.assertIn("opus[1m]", transcript["claude_cli"])
            self.assertIn(
                "openrouter.ai/api",
                transcript["claude_settings"]["env"]["ANTHROPIC_BASE_URL"])
            example = json.loads(
                (HERE / "config.example.json").read_text(encoding="utf-8"))
            aliases = example.get("model_aliases") or {}
            self.assertEqual(
                transcript["claude_settings"]["env"]["ANTHROPIC_DEFAULT_OPUS_MODEL"],
                aliases.get("ANTHROPIC_DEFAULT_OPUS_MODEL"))
            self.assertEqual(
                transcript["claude_settings"]["env"]["CLAUDE_CODE_SUBAGENT_MODEL"],
                aliases.get("CLAUDE_CODE_SUBAGENT_MODEL"))
            self.assertEqual(
                transcript["claude_settings"]["env"]["BASH_DEFAULT_TIMEOUT_MS"],
                "120000")
            self.assertEqual(
                transcript["claude_settings"]["env"]["API_TIMEOUT_MS"],
                "180000")
            self.assertEqual(
                transcript["claude_settings"]["env"]["BASH_MAX_OUTPUT_LENGTH"],
                "8000")
            self.assertNotIn(
                "MAX_THINKING_TOKENS",
                transcript["claude_settings"]["env"])
            self.assertEqual(
                transcript["claude_settings"]["env"][
                    "CLAUDE_CODE_DISABLE_COMMAND_INJECTION_CHECK"],
                "1")
            self.assertIn("--include-partial-messages", transcript["claude_cli"])
            self.assertNotIn("codex", " ".join(transcript["claude_cli"]))
            self.assertIn(transcript["entry"], transcript["prompt"])
            self.assertIn("Read tool", transcript["prompt"])
            self.assertIn("NOT an acceptable final answer", transcript["prompt"])
            self.assertIn("near-copies of the input", transcript["prompt"])

    def test_sophnet_dry_run_uses_anthropic_gateway_not_chat_completions(self):
        builds = claude.DEFAULT_BUILDS
        with tempfile.TemporaryDirectory() as directory:
            directory = Path(directory)
            output = directory / "predictions.jsonl"
            code = claude.main([
                "--dry-run", "--limit", "1",
                "--config", str(HERE / "config.sophnet.example.json"),
                "--builds", str(builds),
                "--output", str(output),
                "--output-dir", str(directory / "outputs"),
                "--transcript-dir", str(directory / "transcripts"),
                "--system", "DeepSeek-V4-Flash-0731@claude_code",
            ])
            self.assertEqual(code, 0)
            rows = [json.loads(line) for line in output.read_text(
                encoding="utf-8").splitlines() if line.strip()]
            self.assertEqual(len(rows), 1)
            self.assertEqual(rows[0]["status"], "dry_run")
            sophnet = json.loads(
                (HERE / "config.sophnet.example.json").read_text(encoding="utf-8"))
            self.assertEqual(rows[0]["model"], sophnet["model"])
            transcript = json.loads(
                (directory / rows[0]["transcript_path"]).read_text(encoding="utf-8"))
            self.assertEqual(
                transcript["claude_settings"]["env"]["ANTHROPIC_BASE_URL"],
                "https://www.sophnet.com/api/open-apis/anthropic")
            self.assertNotIn(
                "/chat/completions",
                transcript["claude_settings"]["env"]["ANTHROPIC_BASE_URL"])
            self.assertNotIn(
                "open-apis/v1",
                transcript["claude_settings"]["env"]["ANTHROPIC_BASE_URL"])
            self.assertEqual(
                transcript["claude_cli"][transcript["claude_cli"].index("--model") + 1],
                sophnet["model"])
            self.assertEqual(
                transcript["claude_settings"]["env"]["ANTHROPIC_MODEL"],
                sophnet["model"])
            self.assertEqual(
                transcript["claude_settings"]["env"]["ANTHROPIC_DEFAULT_OPUS_MODEL"],
                sophnet["model"])

    def test_stub_cli_writes_answer_through_full_driver(self):
        builds = claude.DEFAULT_BUILDS
        with tempfile.TemporaryDirectory() as directory:
            directory = Path(directory)
            stub = directory / "fake-claude"
            stub.write_text(
                "#!/bin/sh\n"
                "printf '%s\\n' 'export default function recovered() { return 1; }'"
                " > answer.js\n"
                "echo '{\"type\":\"result\",\"subtype\":\"success\"}'\n",
                encoding="utf-8")
            stub.chmod(stat.S_IRWXU)
            cfg = json.loads((HERE / "config.example.json").read_text(encoding="utf-8"))
            env_name = "ADB_CLAUDE_TEST_KEY"
            cfg["api_key_env"] = env_name
            cfg_path = directory / "config.json"
            cfg_path.write_text(json.dumps(cfg, indent=2) + "\n", encoding="utf-8")
            output = directory / "predictions.jsonl"
            os.environ[env_name] = "test-key"
            try:
                code = claude.main([
                    "--limit", "1",
                    "--builds", str(builds),
                    "--config", str(cfg_path),
                    "--claude-executable", str(stub),
                    "--output", str(output),
                    "--output-dir", str(directory / "outputs"),
                    "--transcript-dir", str(directory / "transcripts"),
                    "--system", "test@claude_code",
                    "--timeout", "15",
                ])
            finally:
                os.environ.pop(env_name, None)
            self.assertEqual(code, 0)
            rows = [json.loads(line) for line in output.read_text(
                encoding="utf-8").splitlines() if line.strip()]
            self.assertEqual(len(rows), 1)
            self.assertEqual(rows[0]["status"], "ok")
            self.assertTrue(rows[0]["tool_ok"])
            program = (directory / rows[0]["path"]).read_text(encoding="utf-8")
            self.assertIn("function recovered", program)
            self.assertEqual(rows[0]["cost"]["answer_source"], "answer.js")

    def test_stub_cli_empty_answer_is_empty_response(self):
        builds = claude.DEFAULT_BUILDS
        with tempfile.TemporaryDirectory() as directory:
            directory = Path(directory)
            stub = directory / "fake-claude"
            stub.write_text(
                "#!/bin/sh\necho '{\"type\":\"result\",\"subtype\":\"success\"}'\n",
                encoding="utf-8")
            stub.chmod(stat.S_IRWXU)
            cfg = json.loads((HERE / "config.example.json").read_text(encoding="utf-8"))
            env_name = "ADB_CLAUDE_TEST_KEY_EMPTY"
            cfg["api_key_env"] = env_name
            cfg_path = directory / "config.json"
            cfg_path.write_text(json.dumps(cfg, indent=2) + "\n", encoding="utf-8")
            output = directory / "predictions.jsonl"
            os.environ[env_name] = "test-key"
            try:
                code = claude.main([
                    "--limit", "1",
                    "--builds", str(builds),
                    "--config", str(cfg_path),
                    "--claude-executable", str(stub),
                    "--output", str(output),
                    "--output-dir", str(directory / "outputs"),
                    "--transcript-dir", str(directory / "transcripts"),
                    "--system", "test@claude_code",
                    "--timeout", "15",
                ])
            finally:
                os.environ.pop(env_name, None)
            self.assertEqual(code, 0)
            rows = [json.loads(line) for line in output.read_text(
                encoding="utf-8").splitlines() if line.strip()]
            self.assertEqual(rows[0]["status"], "empty_response")
            self.assertEqual(
                rows[0]["cost"]["answer_source"], "input_fallback")
            program = (directory / rows[0]["path"]).read_text(encoding="utf-8")
            self.assertIn("function", program)

    def test_resume_retries_failed_row_from_checkpoint(self):
        builds = claude.DEFAULT_BUILDS
        with tempfile.TemporaryDirectory() as directory:
            directory = Path(directory)
            stub = directory / "fake-claude"
            stub.write_text(
                "#!/bin/sh\necho '{\"type\":\"result\",\"subtype\":\"success\"}'\n",
                encoding="utf-8")
            stub.chmod(stat.S_IRWXU)
            cfg = json.loads(
                (HERE / "config.example.json").read_text(encoding="utf-8"))
            env_name = "ADB_CLAUDE_TEST_KEY_RESUME"
            cfg["api_key_env"] = env_name
            cfg_path = directory / "config.json"
            cfg_path.write_text(json.dumps(cfg) + "\n", encoding="utf-8")
            output = directory / "predictions.jsonl"
            common = [
                "--limit", "1",
                "--builds", str(builds),
                "--config", str(cfg_path),
                "--claude-executable", str(stub),
                "--output", str(output),
                "--output-dir", str(directory / "outputs"),
                "--transcript-dir", str(directory / "transcripts"),
                "--timeout", "15",
            ]
            os.environ[env_name] = "test-key"
            try:
                claude.main(common)
                first = [json.loads(line) for line in
                         output.read_text(encoding="utf-8").splitlines()]
                self.assertEqual(first[0]["status"], "empty_response")
                stub.write_text(
                    "#!/bin/sh\n"
                    "printf '%s\\n' 'export default function resumed() { return 3; }'"
                    " > answer.js\n"
                    "echo '{\"type\":\"result\",\"subtype\":\"success\"}'\n",
                    encoding="utf-8")
                claude.main(common + ["--resume"])
            finally:
                os.environ.pop(env_name, None)
            rows = [json.loads(line) for line in
                    output.read_text(encoding="utf-8").splitlines()]
            self.assertEqual(len(rows), 1)
            self.assertEqual(rows[0]["status"], "ok")
            self.assertEqual(rows[0]["cost"]["answer_source"], "answer.js")
            self.assertTrue((directory / "checkpoints").is_dir())

    def test_wall_timeout_returns_input_fallback_not_empty_file(self):
        builds = claude.DEFAULT_BUILDS
        with tempfile.TemporaryDirectory() as directory:
            directory = Path(directory)
            stub = directory / "fake-claude"
            stub.write_text("#!/bin/sh\nsleep 30\n", encoding="utf-8")
            stub.chmod(stat.S_IRWXU)
            cfg = json.loads(
                (HERE / "config.example.json").read_text(encoding="utf-8"))
            env_name = "ADB_CLAUDE_TEST_KEY_TIMEOUT"
            cfg["api_key_env"] = env_name
            cfg_path = directory / "config.json"
            cfg_path.write_text(json.dumps(cfg) + "\n", encoding="utf-8")
            output = directory / "predictions.jsonl"
            os.environ[env_name] = "test-key"
            try:
                claude.main([
                    "--limit", "1",
                    "--builds", str(builds),
                    "--config", str(cfg_path),
                    "--claude-executable", str(stub),
                    "--output", str(output),
                    "--output-dir", str(directory / "outputs"),
                    "--transcript-dir", str(directory / "transcripts"),
                    "--timeout", "1",
                ])
            finally:
                os.environ.pop(env_name, None)
            row = json.loads(output.read_text(encoding="utf-8"))
            self.assertEqual(row["status"], "timeout")
            self.assertEqual(row["cost"]["answer_source"], "input_fallback")
            candidate = (directory / row["path"]).read_text(encoding="utf-8")
            self.assertTrue(candidate.strip())
            self.assertTrue((directory / "checkpoints").is_dir())

    def test_workspace_writes_claude_md_and_valid_entry(self):
        source = "var _0xdead = 1;\n"
        with tempfile.TemporaryDirectory() as directory:
            workspace = Path(directory)
            (workspace / "subject.mjs").write_text(source, encoding="utf-8")
            prompt = worker.write_workspace_files(workspace, {
                "entry": "subject.mjs",
                "source": source,
                "prompt": Path(HERE / "prompt.txt").read_text(encoding="utf-8"),
            })
            self.assertEqual(
                (workspace / "TASK.md").read_text(encoding="utf-8"), prompt)
            self.assertEqual(
                (workspace / "CLAUDE.md").read_text(encoding="utf-8"), prompt)
            self.assertNotIn(source.strip(), prompt)
            self.assertIn("safety draft", prompt)
            self.assertIn("CHECKPOINT.md", prompt)

        with tempfile.TemporaryDirectory() as directory:
            agent = Path(directory) / "agent"
            agent.mkdir()
            (agent / "subject.mjs").write_text("old\n", encoding="utf-8")
            (agent / "package.json").write_text("{}\n", encoding="utf-8")
            (agent / "cassette.json").write_text("{}\n", encoding="utf-8")
            (agent / "harness").mkdir()
            (agent / "harness" / "execute.mjs").write_text("export {}\n", encoding="utf-8")
            long_source = "var _0x = '" + ("x" * 2500) + "';"
            tmp, workspace = claude.make_agent_workspace(
                agent, "subject.mjs", long_source)
            try:
                self.assertEqual(
                    (workspace / "subject.mjs").read_text(encoding="utf-8"),
                    long_source)
                self.assertFalse((workspace / "harness").exists())
                self.assertFalse((workspace / "cassette.json").exists())
            finally:
                shutil.rmtree(str(tmp), ignore_errors=True)


if __name__ == "__main__":
    unittest.main()
