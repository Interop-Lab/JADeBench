#!/usr/bin/env python3
"""Deterministic tests for the Kimi Code deobfuscation driver."""

import importlib.util
import json
import os
import shutil
import stat
import tempfile
import time
import unittest
from pathlib import Path


HERE = Path(__file__).resolve().parent
WORKER_SPEC = importlib.util.spec_from_file_location(
    "_adb_kimi_worker_tested", HERE / "worker.py")
worker = importlib.util.module_from_spec(WORKER_SPEC)
WORKER_SPEC.loader.exec_module(worker)
RUN_SPEC = importlib.util.spec_from_file_location(
    "_adb_kimi_run_tested", HERE / "run.py")
kimi = importlib.util.module_from_spec(RUN_SPEC)
RUN_SPEC.loader.exec_module(kimi)


class KimiWorkerTests(unittest.TestCase):
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
        self.assertIn("safety draft", prompt)
        self.assertIn("CHECKPOINT.md", prompt)
        self.assertNotIn("{source}", prompt)
        self.assertNotIn("{entry}", prompt)
        self.assertIn("subject.mjs", prompt)
        self.assertNotIn(source, prompt)
        self.assertNotIn("OpenCode", prompt)
        self.assertNotIn("Claude Code", prompt)
        self.assertIn("AGENTS.md", prompt)

    def test_run_message_asks_to_read_task(self):
        message = worker.build_run_message({"entry": "subject.mjs"})
        self.assertIn("Start from the safety draft", message)
        self.assertIn("Read TASK.md", message)
        self.assertIn("CHECKPOINT.md", message)
        resumed = worker.build_run_message({
            "entry": "subject.mjs", "checkpoint_restored": True})
        self.assertIn("Resume from the restored checkpoint files", resumed)

    def test_cli_is_kimi_print_not_claude(self):
        with tempfile.TemporaryDirectory() as directory:
            workspace = Path(directory)
            cmd = worker.build_cli(workspace, "write answer.js", {
                "model": "openai/gpt-5.6-sol",
                "provider": "openrouter",
            })
            self.assertEqual(cmd[0], "kimi")
            self.assertIn("-p", cmd)
            self.assertEqual(cmd[cmd.index("-p") + 1], "write answer.js")
            self.assertEqual(cmd[cmd.index("--output-format") + 1], "stream-json")
            self.assertEqual(cmd[cmd.index("-m") + 1], "bench")
            self.assertNotIn("--yolo", cmd)
            self.assertNotIn("--auto", cmd)
            self.assertNotIn("--headless", cmd)
            self.assertNotIn("claude", cmd)
            self.assertNotIn("openhands", cmd)
            self.assertNotIn("codex", cmd)

    def test_config_toml_keeps_openrouter_tilde(self):
        blob = worker.build_config_toml({
            "provider": "openrouter",
            "model": "openai/gpt-5.6-sol",
            "base_url": "https://openrouter.ai/api/v1",
        }, api_key="sk-test")
        self.assertIn('type = "openai"', blob)
        self.assertIn('model = "openai/gpt-5.6-sol"', blob)
        self.assertIn("max_context_size = 262144", blob)
        self.assertIn("openai/gpt-5.6-sol", blob)
        self.assertIn("openrouter.ai/api/v1", blob)
        self.assertIn('disabled = ["WebSearch", "FetchURL"]', blob)
        self.assertIn("[thinking]", blob)
        self.assertIn("enabled = false", blob)
        self.assertNotIn("openai_legacy", blob)
        self.assertNotIn("sophnet", blob)
        redacted = worker.redact_config_toml(blob)
        self.assertIn('api_key = "redacted"', redacted)
        self.assertNotIn("sk-test", redacted)

    def test_apply_provider_rewrites_claude_code_openrouter_root(self):
        resolved = worker.apply_provider({
            "model": "opus[1m]",
            "provider": "openrouter",
            "base_url": "https://openrouter.ai/api",
            "api_key_env": "OPENROUTER_API_KEY",
        })
        self.assertEqual(resolved["provider"], "openrouter")
        self.assertEqual(resolved["model"], "openai/gpt-5.6-sol")
        self.assertEqual(resolved["base_url"], "https://openrouter.ai/api/v1")
        self.assertEqual(resolved["api_key_env"], "OPENROUTER_API_KEY")
        self.assertEqual(resolved["provider_type"], "openai")

    def test_cli_provider_switches_openrouter_config_to_sophnet(self):
        cfg = json.loads(
            (HERE / "config.example.json").read_text(encoding="utf-8"))
        cfg["provider"] = "sophnet"
        resolved = worker.apply_provider(cfg, replace_endpoint=True)
        self.assertEqual(resolved["provider"], "sophnet")
        self.assertEqual(
            resolved["base_url"],
            "https://www.sophnet.com/api/open-apis/v1")
        self.assertEqual(resolved["api_key_env"], "SOPHNET_API_KEY")
        self.assertEqual(resolved["model"], "DeepSeek-V4-Pro-0813")
        blob = worker.build_config_toml(resolved)
        self.assertIn('model = "DeepSeek-V4-Pro-0813"', blob)
        self.assertIn("[providers.sophnet]", blob)
        self.assertNotIn("~openai/", blob)

    def test_collect_answer_ignores_entry_and_chat(self):
        stdout = json.dumps({
            "type": "assistant",
            "content": "```javascript\nexport default 1;\n```",
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

    def test_summarize_event_keeps_command(self):
        line = json.dumps({
            "type": "tool",
            "name": "Bash",
            "input": {"command": "cat subject.mjs"},
        })
        summary = worker.summarize_event(line)
        self.assertIn("tool", summary)
        self.assertIn("cat subject.mjs", summary)

    def test_stream_phase_treats_tool_free_assistant_as_final(self):
        self.assertEqual(worker.stream_phase({
            "role": "assistant",
            "content": "Deobfuscation completed.",
        }), "assistant_final")
        self.assertEqual(worker.stream_phase({
            "role": "assistant",
            "content": "working",
            "tool_calls": [{"type": "function", "id": "c1"}],
        }), "assistant_tools")
        self.assertEqual(worker.stream_phase({
            "role": "tool",
            "tool_call_id": "c1",
            "content": "ok",
        }), "tool")
        self.assertEqual(worker.stream_phase({
            "role": "meta",
            "type": "session.resume_hint",
            "session_id": "session_1",
        }), "resume_hint")
        self.assertNotIn(worker.stream_phase({
            "role": "assistant",
            "content": "working",
            "tool_calls": [{"type": "function"}],
        }), worker.DONE_PHASES)

    def test_usage_from_stream_json(self):
        stdout = json.dumps({
            "type": "result",
            "usage": {"input_tokens": 10, "output_tokens": 4},
        })
        usage = worker.usage_from_output(stdout)
        self.assertEqual(usage["prompt_tokens"], 10)
        self.assertEqual(usage["completion_tokens"], 4)
        self.assertEqual(usage["total_tokens"], 14)

    def test_usage_from_kimi_session_wires(self):
        with tempfile.TemporaryDirectory() as directory:
            home = Path(directory)
            wire_dir = (
                home / "sessions" / "wd_agent_test"
                / "session_abc" / "agents")
            (wire_dir / "main").mkdir(parents=True)
            (wire_dir / "agent-0").mkdir(parents=True)
            (wire_dir / "main" / "wire.jsonl").write_text(
                json.dumps({
                    "type": "usage.record",
                    "agentId": "main",
                    "usage": {
                        "inputOther": 10,
                        "output": 4,
                        "inputCacheRead": 20,
                        "inputCacheCreation": 0,
                    },
                    "usageScope": "turn",
                }) + "\n" + json.dumps({
                    "type": "usage.record",
                    "agentId": "main",
                    "usage": {
                        "inputOther": 100,
                        "output": 1,
                        "inputCacheRead": 0,
                        "inputCacheCreation": 0,
                    },
                    "usageScope": "session",
                }) + "\n" + json.dumps({
                    "type": "token_counting.turn_recorded",
                    "tokens": 99999,
                }) + "\n",
                encoding="utf-8")
            (wire_dir / "agent-0" / "wire.jsonl").write_text(
                json.dumps({
                    "type": "usage.record",
                    "agentId": "agent-0",
                    "usage": {
                        "inputOther": 3,
                        "output": 2,
                        "inputCacheRead": 7,
                        "inputCacheCreation": 1,
                    },
                    "usageScope": "turn",
                }) + "\n",
                encoding="utf-8")
            usage = worker.usage_from_kimi_home(home)
            self.assertEqual(usage["prompt_tokens"], 13)
            self.assertEqual(usage["completion_tokens"], 6)
            self.assertEqual(usage["cache_read_tokens"], 27)
            self.assertEqual(usage["cache_write_tokens"], 1)
            self.assertEqual(usage["total_tokens"], 47)
            collected, source = worker.collect_usage("", home)
            self.assertEqual(collected, usage)
            self.assertEqual(source, "kimi_session")

    def test_syntax_check_accepts_valid_javascript(self):
        ok, detail = worker.syntax_check("export default function f() { return 1; }\n")
        self.assertNotEqual(ok, False)
        if ok is True:
            self.assertEqual(detail, "")

    def test_isolate_home_writes_config_under_kimi_code_home(self):
        with tempfile.TemporaryDirectory() as directory:
            os.environ["ADB_KIMI_HOME"] = directory
            try:
                home, kimi_home = worker.isolate_home({
                    "provider": "openrouter",
                    "model": "openai/gpt-5.6-sol",
                    "base_url": "https://openrouter.ai/api/v1",
                    "api_key": "sk-isolated",
                    "prompt": Path(HERE / "prompt.txt").read_text(encoding="utf-8"),
                    "entry": "subject.mjs",
                })
                self.assertEqual(Path(home), Path(directory) / "runs" / "default")
                config = (kimi_home / "config.toml").read_text(encoding="utf-8")
                self.assertIn("openai/gpt-5.6-sol", config)
                self.assertIn("sk-isolated", config)
                self.assertTrue((kimi_home / "AGENTS.md").is_file())
            finally:
                os.environ.pop("ADB_KIMI_HOME", None)


class KimiDriverTests(unittest.TestCase):
    def test_dry_run_writes_prediction_without_launching(self):
        builds = kimi.DEFAULT_BUILDS
        with tempfile.TemporaryDirectory() as directory:
            directory = Path(directory)
            output = directory / "predictions.jsonl"
            code = kimi.main([
                "--dry-run", "--limit", "1",
                "--builds", str(builds),
                "--output", str(output),
                "--output-dir", str(directory / "outputs"),
                "--transcript-dir", str(directory / "transcripts"),
                "--system", "test@kimi_code",
            ])
            self.assertEqual(code, 0)
            rows = [json.loads(line) for line in output.read_text(
                encoding="utf-8").splitlines() if line.strip()]
            self.assertEqual(len(rows), 1)
            self.assertEqual(rows[0]["status"], "dry_run")
            self.assertEqual(rows[0]["level"], "kimi_code")
            transcript = json.loads(
                (directory / rows[0]["transcript_path"]).read_text(encoding="utf-8"))
            self.assertIn("answer.js", transcript["prompt"])
            self.assertNotIn("```javascript", transcript["prompt"])
            self.assertEqual(transcript["kimi_cli"][0], "kimi")
            self.assertIn("-p", transcript["kimi_cli"])
            self.assertNotIn("--yolo", transcript["kimi_cli"])
            self.assertEqual(
                transcript["gateway_model"], "openai/gpt-5.6-sol")
            self.assertIn("openai/gpt-5.6-sol", transcript["kimi_config"])
            self.assertIn("openrouter.ai/api/v1", transcript["kimi_config"])
            self.assertIn("WebSearch", transcript["kimi_config"])
            self.assertIn("safety draft", transcript["prompt"])
            self.assertNotIn("DeepSeek", transcript["kimi_config"])
            self.assertIn(transcript["entry"], transcript["prompt"])

    def test_stub_cli_writes_answer_through_full_driver(self):
        builds = kimi.DEFAULT_BUILDS
        with tempfile.TemporaryDirectory() as directory:
            directory = Path(directory)
            stub = directory / "fake-kimi"
            stub.write_text(
                "#!/bin/sh\n"
                "printf '%s\\n' 'export default function recovered() { return 1; }'"
                " > answer.js\n"
                "echo '{\"type\":\"result\",\"status\":\"success\"}'\n",
                encoding="utf-8")
            stub.chmod(stat.S_IRWXU)
            cfg = json.loads((HERE / "config.example.json").read_text(encoding="utf-8"))
            env_name = "ADB_KIMI_TEST_KEY"
            cfg["api_key_env"] = env_name
            cfg_path = directory / "config.json"
            cfg_path.write_text(json.dumps(cfg, indent=2) + "\n", encoding="utf-8")
            output = directory / "predictions.jsonl"
            os.environ[env_name] = "test-key"
            os.environ["ADB_KIMI_HOME"] = str(directory / "home")
            try:
                code = kimi.main([
                    "--limit", "1",
                    "--builds", str(builds),
                    "--config", str(cfg_path),
                    "--kimi-executable", str(stub),
                    "--output", str(output),
                    "--output-dir", str(directory / "outputs"),
                    "--transcript-dir", str(directory / "transcripts"),
                    "--system", "test@kimi_code",
                    "--timeout", "15",
                ])
            finally:
                os.environ.pop(env_name, None)
                os.environ.pop("ADB_KIMI_HOME", None)
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
        builds = kimi.DEFAULT_BUILDS
        with tempfile.TemporaryDirectory() as directory:
            directory = Path(directory)
            stub = directory / "fake-kimi"
            stub.write_text(
                "#!/bin/sh\necho '{\"type\":\"result\",\"status\":\"success\"}'\n",
                encoding="utf-8")
            stub.chmod(stat.S_IRWXU)
            cfg = json.loads((HERE / "config.example.json").read_text(encoding="utf-8"))
            env_name = "ADB_KIMI_TEST_KEY_EMPTY"
            cfg["api_key_env"] = env_name
            cfg_path = directory / "config.json"
            cfg_path.write_text(json.dumps(cfg, indent=2) + "\n", encoding="utf-8")
            output = directory / "predictions.jsonl"
            os.environ[env_name] = "test-key"
            os.environ["ADB_KIMI_HOME"] = str(directory / "home")
            try:
                code = kimi.main([
                    "--limit", "1",
                    "--builds", str(builds),
                    "--config", str(cfg_path),
                    "--kimi-executable", str(stub),
                    "--output", str(output),
                    "--output-dir", str(directory / "outputs"),
                    "--transcript-dir", str(directory / "transcripts"),
                    "--system", "test@kimi_code",
                    "--timeout", "15",
                ])
            finally:
                os.environ.pop(env_name, None)
                os.environ.pop("ADB_KIMI_HOME", None)
            self.assertEqual(code, 0)
            rows = [json.loads(line) for line in output.read_text(
                encoding="utf-8").splitlines() if line.strip()]
            self.assertEqual(rows[0]["status"], "empty_response")
            self.assertEqual(rows[0]["cost"]["answer_source"], "input_fallback")
            program = (directory / rows[0]["path"]).read_text(encoding="utf-8")
            self.assertTrue(program.strip())

    def test_stub_cli_hangs_after_final_assistant_is_killed(self):
        builds = kimi.DEFAULT_BUILDS
        with tempfile.TemporaryDirectory() as directory:
            directory = Path(directory)
            stub = directory / "fake-kimi"
            stub.write_text(
                "#!/usr/bin/env python3\n"
                "import json, pathlib, time\n"
                "pathlib.Path('answer.js').write_text(\n"
                "    'export default function recovered() { return 1; }\\n')\n"
                "print(json.dumps({\n"
                "    'role': 'assistant',\n"
                "    'content': 'Deobfuscation completed.',\n"
                "}), flush=True)\n"
                "time.sleep(600)\n",
                encoding="utf-8")
            stub.chmod(stat.S_IRWXU)
            cfg = json.loads((HERE / "config.example.json").read_text(encoding="utf-8"))
            env_name = "ADB_KIMI_TEST_KEY_HANG"
            cfg["api_key_env"] = env_name
            cfg["idle_after_final_seconds"] = 5
            cfg_path = directory / "config.json"
            cfg_path.write_text(json.dumps(cfg, indent=2) + "\n", encoding="utf-8")
            output = directory / "predictions.jsonl"
            os.environ[env_name] = "test-key"
            os.environ["ADB_KIMI_HOME"] = str(directory / "home")
            started = time.time()
            try:
                code = kimi.main([
                    "--limit", "1",
                    "--builds", str(builds),
                    "--config", str(cfg_path),
                    "--kimi-executable", str(stub),
                    "--output", str(output),
                    "--output-dir", str(directory / "outputs"),
                    "--transcript-dir", str(directory / "transcripts"),
                    "--system", "test@kimi_code",
                    "--timeout", "40",
                ])
            finally:
                os.environ.pop(env_name, None)
                os.environ.pop("ADB_KIMI_HOME", None)
            elapsed = time.time() - started
            self.assertEqual(code, 0)
            self.assertLess(elapsed, 25, "idle kill should not wait out the wall timeout")
            rows = [json.loads(line) for line in output.read_text(
                encoding="utf-8").splitlines() if line.strip()]
            self.assertEqual(rows[0]["status"], "ok")
            transcript = json.loads(
                (directory / rows[0]["transcript_path"]).read_text(encoding="utf-8"))
            self.assertTrue(transcript["metadata"]["hung_after_final"])
            self.assertEqual(
                transcript["metadata"]["hung_after_final_phase"], "assistant_final")
            program = (directory / rows[0]["path"]).read_text(encoding="utf-8")
            self.assertIn("function recovered", program)

    def test_workspace_writes_agents_md_and_valid_entry(self):
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
                (workspace / "AGENTS.md").read_text(encoding="utf-8"), prompt)
            self.assertNotIn(source.strip(), prompt)

        with tempfile.TemporaryDirectory() as directory:
            agent = Path(directory) / "agent"
            agent.mkdir()
            (agent / "subject.mjs").write_text("old\n", encoding="utf-8")
            (agent / "package.json").write_text("{}\n", encoding="utf-8")
            (agent / "cassette.json").write_text("{}\n", encoding="utf-8")
            (agent / "harness").mkdir()
            (agent / "harness" / "execute.mjs").write_text("export {}\n", encoding="utf-8")
            long_source = "var _0x = '" + ("x" * 2500) + "';"
            tmp, workspace = kimi.make_agent_workspace(
                agent, "subject.mjs", long_source)
            try:
                self.assertEqual(
                    (workspace / "subject.mjs").read_text(encoding="utf-8"),
                    long_source)
                self.assertFalse((workspace / "harness").exists())
                self.assertFalse((workspace / "cassette.json").exists())
                self.assertFalse((workspace / "SOURCE.txt").exists())
            finally:
                shutil.rmtree(str(tmp), ignore_errors=True)


if __name__ == "__main__":
    unittest.main()
