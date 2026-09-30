#!/usr/bin/env python3
"""Deterministic tests for the Codex deobfuscation driver."""

import importlib.util
import json
import os
import shutil
import stat
import tempfile
import unittest
from pathlib import Path


HERE = Path(__file__).resolve().parent
WORKER_SPEC = importlib.util.spec_from_file_location(
    "_adb_codex_worker_tested", HERE / "worker.py")
worker = importlib.util.module_from_spec(WORKER_SPEC)
WORKER_SPEC.loader.exec_module(worker)
RUN_SPEC = importlib.util.spec_from_file_location(
    "_adb_codex_run_tested", HERE / "run.py")
codex = importlib.util.module_from_spec(RUN_SPEC)
RUN_SPEC.loader.exec_module(codex)


class CodexWorkerTests(unittest.TestCase):
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
        self.assertIn("120000", prompt)
        self.assertIn("programmer", prompt)
        self.assertNotIn("few seconds", prompt)
        self.assertNotIn("{bash_timeout_ms}", prompt)
        self.assertNotIn("{source}", prompt)
        self.assertNotIn("{entry}", prompt)
        self.assertIn("subject.mjs", prompt)
        self.assertNotIn(source, prompt)
        self.assertNotIn("OpenCode", prompt)
        self.assertNotIn("Claude Code", prompt)

    def test_partial_hex_mass_is_under_deobfuscated(self):
        names = ["_0x%04x" % i for i in range(40)]
        original = "var " + ",".join("%s=1" % name for name in names) + ";"
        partial = "var " + ",".join("%s=1" % name for name in names[:30]) + ";"
        cleaned = "var value = 1;\n"
        self.assertTrue(worker.under_deobfuscated(partial, original))
        self.assertFalse(worker.under_deobfuscated(cleaned, original))
        almost = "var " + ",".join("%s=1" % name for name in names[:29]) + ";"
        self.assertFalse(worker.under_deobfuscated(almost, original))

    def test_run_message_asks_to_read_task(self):
        message = worker.build_run_message({"entry": "subject.mjs"})
        self.assertIn("Start from the safety draft", message)
        self.assertIn("Read TASK.md", message)
        self.assertIn("CHECKPOINT.md", message)
        self.assertIn("timeout_ms to 120000", message)
        self.assertIn("programmer could read", message)
        resumed = worker.build_run_message({
            "entry": "subject.mjs", "checkpoint_restored": True})
        self.assertIn("Resume from the restored checkpoint files", resumed)

    def test_cli_is_codex_exec_not_opencode(self):
        with tempfile.TemporaryDirectory() as directory:
            workspace = Path(directory)
            cmd = worker.build_cli(workspace, "write answer.js", {
                "model": "gpt-5.3-codex",
                "provider": "codex",
                "entry": "subject.mjs",
            })
            self.assertEqual(cmd[0], "codex")
            self.assertEqual(cmd[1], "exec")
            self.assertIn("--json", cmd)
            self.assertEqual(cmd[cmd.index("--sandbox") + 1], "workspace-write")
            self.assertEqual(cmd[cmd.index("-C") + 1], str(workspace))
            self.assertEqual(cmd[cmd.index("-m") + 1], "gpt-5.3-codex")
            self.assertIn("--", cmd)
            self.assertEqual(cmd[-1], "write answer.js")
            self.assertNotIn("opencode", cmd)
            self.assertIn("browser_use", cmd)
            joined = " ".join(cmd)
            self.assertIn("network_access=false", joined)
            self.assertIn("model_provider=\"codex\"", joined)
            self.assertIn("approval_policy=\"never\"", joined)
            self.assertIn('web_search="disabled"', joined)

    def test_codex_config_uses_openrouter_responses(self):
        text = worker.build_codex_config({})
        self.assertIn('model = "openai/gpt-5.6-sol"', text)
        self.assertIn('model_provider = "openrouter"', text)
        self.assertIn("openrouter.ai/api/v1", text)
        self.assertIn('env_key = "OPENROUTER_API_KEY"', text)
        self.assertIn("requires_openai_auth = false", text)
        self.assertIn('wire_api = "responses"', text)
        self.assertIn('web_search = "disabled"', text)
        self.assertLess(text.index('web_search = "disabled"'), text.index("["))
        self.assertNotIn("sophnet", text)
        self.assertNotIn("DeepSeek", text)

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

    def test_codex_config_can_override_to_other_provider(self):
        text = worker.build_codex_config({
            "model": "DeepSeek-V4-Pro-0813",
            "provider": "sophnet",
            "base_url": "https://www.sophnet.com/api/open-apis/v1",
            "api_key_env": "SOPHNET_API_KEY",
            "requires_openai_auth": False,
        })
        self.assertIn("www.sophnet.com", text)
        self.assertIn('env_key = "SOPHNET_API_KEY"', text)
        self.assertIn("requires_openai_auth = false", text)

    def test_apply_provider_rewrites_openrouter_config_to_requesty(self):
        cfg = json.loads(
            (HERE / "config.example.json").read_text(encoding="utf-8"))
        cfg["provider"] = "requesty"
        resolved = worker.apply_provider(cfg, replace_endpoint=True)
        self.assertEqual(resolved["provider"], "requesty")
        self.assertEqual(resolved["base_url"], "https://router.requesty.ai/v1")
        self.assertEqual(resolved["api_key_env"], "REQUESTY_API_KEY")
        self.assertEqual(resolved["model"], "openai-responses/gpt-5.6-sol")

    def test_requesty_chat_slug_becomes_responses_prefix(self):
        resolved = worker.apply_provider({
            "provider": "requesty",
            "model": "openai/gpt-5.6-sol",
        }, replace_endpoint=True)
        self.assertEqual(resolved["model"], "openai-responses/gpt-5.6-sol")
        self.assertEqual(resolved["base_url"], "https://router.requesty.ai/v1")

    def test_codex_config_requesty_disables_reasoning_summaries(self):
        text = worker.build_codex_config({
            "model": "openai-responses/gpt-5.6-sol",
            "provider": "requesty",
            "base_url": "https://router.requesty.ai/v1",
            "api_key_env": "REQUESTY_API_KEY",
            "requires_openai_auth": False,
        })
        self.assertIn('model = "openai-responses/gpt-5.6-sol"', text)
        self.assertIn('model_provider = "requesty"', text)
        self.assertIn("router.requesty.ai/v1", text)
        self.assertIn('env_key = "REQUESTY_API_KEY"', text)
        self.assertIn("model_supports_reasoning_summaries = false", text)
        self.assertLess(
            text.index("model_supports_reasoning_summaries = false"),
            text.index("["))
        self.assertIn("requires_openai_auth = false", text)
        self.assertIn('wire_api = "responses"', text)

    def test_apply_provider_rewrites_to_soleapi(self):
        resolved = worker.apply_provider({
            "provider": "soleapi",
            "model": "openai/gpt-5.6-sol",
        }, replace_endpoint=True)
        self.assertEqual(resolved["provider"], "soleapi")
        self.assertEqual(resolved["base_url"], "https://soleapi.com/v1")
        self.assertEqual(resolved["api_key_env"], "SOLEAPI_API_KEY")
        self.assertEqual(resolved["model"], "gpt-5.6-sol")

    def test_codex_config_soleapi_keeps_reasoning_summaries(self):
        text = worker.build_codex_config({
            "model": "gpt-5.6-sol",
            "provider": "soleapi",
            "base_url": "https://soleapi.com/v1",
            "api_key_env": "SOLEAPI_API_KEY",
            "requires_openai_auth": False,
        })
        self.assertIn('model = "gpt-5.6-sol"', text)
        self.assertIn('model_provider = "soleapi"', text)
        self.assertIn("soleapi.com/v1", text)
        self.assertIn('env_key = "SOLEAPI_API_KEY"', text)
        self.assertNotIn("model_supports_reasoning_summaries = false", text)
        self.assertIn('wire_api = "responses"', text)

    def test_unwraps_sophnet_tool_schema_error(self):
        inner = json.dumps({
            "error": {"message": 'unknown field "external_web_access"'},
        })
        outer = json.dumps({"status": 400, "message": inner})
        stdout = json.dumps({"type": "error", "message": outer}) + "\n"
        err = worker.cli_error_from_events(stdout)
        self.assertIn("external_web_access", err)

    def test_cli_can_allow_network(self):
        cmd = worker.build_cli("/tmp/ws", "go", {"network_access": True})
        self.assertNotIn("network_access=false", " ".join(cmd))

    def test_collect_answer_ignores_entry_and_chat(self):
        stdout = json.dumps({
            "type": "agent_message",
            "item": {"text": "```javascript\nexport default 1;\n```"},
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
            "type": "item.started",
            "item": {"type": "command_execution", "command": "cat subject.mjs"},
        })
        summary = worker.summarize_event(line)
        self.assertIn("item.started", summary)
        self.assertIn("cat subject.mjs", summary)

    def test_summarize_event_unwraps_gateway_error(self):
        inner = json.dumps({
            "error": {"message": "shell_api_error", "type": "shell_api_error"},
        })
        line = json.dumps({"type": "error", "message": inner})
        summary = worker.summarize_event(line)
        self.assertIn("error", summary)
        self.assertIn("shell_api_error", summary)

    def test_usage_from_codex_turn(self):
        stdout = json.dumps({
            "type": "turn.completed",
            "usage": {"input_tokens": 10, "output_tokens": 4, "total_tokens": 14},
        })
        usage = worker.usage_from_output(stdout)
        self.assertEqual(usage["prompt_tokens"], 10)
        self.assertEqual(usage["completion_tokens"], 4)
        self.assertEqual(usage["total_tokens"], 14)

    def test_usage_splits_cached_input_and_keeps_reasoning_as_subset(self):
        stdout = json.dumps({
            "type": "turn.completed",
            "usage": {
                "input_tokens": 100,
                "cached_input_tokens": 80,
                "output_tokens": 20,
                "reasoning_output_tokens": 7,
            },
        })
        usage = worker.usage_from_output(stdout)
        self.assertEqual(usage["prompt_tokens"], 20)
        self.assertEqual(usage["cache_read_tokens"], 80)
        self.assertEqual(usage["completion_tokens"], 20)
        self.assertEqual(usage["reasoning_tokens"], 7)
        self.assertEqual(usage["total_tokens"], 120)

    def test_syntax_check_accepts_valid_javascript(self):
        ok, detail = worker.syntax_check("export default function f() { return 1; }\n")
        self.assertNotEqual(ok, False)
        if ok is True:
            self.assertEqual(detail, "")


class CodexDriverTests(unittest.TestCase):
    def test_dry_run_writes_prediction_without_launching(self):
        builds = codex.DEFAULT_BUILDS
        with tempfile.TemporaryDirectory() as directory:
            directory = Path(directory)
            output = directory / "predictions.jsonl"
            code = codex.main([
                "--dry-run", "--limit", "1",
                "--builds", str(builds),
                "--output", str(output),
                "--output-dir", str(directory / "outputs"),
                "--transcript-dir", str(directory / "transcripts"),
                "--system", "test@codex",
            ])
            self.assertEqual(code, 0)
            rows = [json.loads(line) for line in output.read_text(
                encoding="utf-8").splitlines() if line.strip()]
            self.assertEqual(len(rows), 1)
            self.assertEqual(rows[0]["status"], "dry_run")
            self.assertEqual(rows[0]["level"], "codex")
            transcript = json.loads(
                (directory / rows[0]["transcript_path"]).read_text(encoding="utf-8"))
            self.assertIn("answer.js", transcript["prompt"])
            self.assertNotIn("```javascript", transcript["prompt"])
            self.assertEqual(transcript["codex_cli"][0], "codex")
            self.assertEqual(transcript["codex_cli"][1], "exec")
            self.assertIn("openai/gpt-5.6-sol", transcript["codex_cli"])
            self.assertIn("openrouter.ai/api/v1", transcript["codex_config"])
            self.assertIn('web_search = "disabled"', transcript["codex_config"])
            self.assertIn("safety draft", transcript["prompt"])
            self.assertNotIn("DeepSeek", transcript["codex_config"])
            self.assertNotIn("sophnet", transcript["codex_config"])
            self.assertIn(transcript["entry"], transcript["prompt"])

    def test_stub_cli_writes_answer_through_full_driver(self):
        builds = codex.DEFAULT_BUILDS
        with tempfile.TemporaryDirectory() as directory:
            directory = Path(directory)
            stub = directory / "fake-codex"
            stub.write_text(
                "#!/bin/sh\n"
                "printf '%s\\n' 'export default function recovered() { return 1; }'"
                " > answer.js\n"
                "echo '{\"type\":\"done\"}'\n",
                encoding="utf-8")
            stub.chmod(stat.S_IRWXU)
            cfg = json.loads((HERE / "config.example.json").read_text(encoding="utf-8"))
            env_name = "ADB_CODEX_TEST_KEY"
            cfg["api_key_env"] = env_name
            cfg_path = directory / "config.json"
            cfg_path.write_text(json.dumps(cfg, indent=2) + "\n", encoding="utf-8")
            output = directory / "predictions.jsonl"
            os.environ[env_name] = "test-key"
            try:
                code = codex.main([
                    "--limit", "1",
                    "--builds", str(builds),
                    "--config", str(cfg_path),
                    "--codex-executable", str(stub),
                    "--output", str(output),
                    "--output-dir", str(directory / "outputs"),
                    "--transcript-dir", str(directory / "transcripts"),
                    "--system", "test@codex",
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
        builds = codex.DEFAULT_BUILDS
        with tempfile.TemporaryDirectory() as directory:
            directory = Path(directory)
            stub = directory / "fake-codex"
            stub.write_text(
                "#!/bin/sh\necho '{\"type\":\"done\"}'\n", encoding="utf-8")
            stub.chmod(stat.S_IRWXU)
            cfg = json.loads((HERE / "config.example.json").read_text(encoding="utf-8"))
            env_name = "ADB_CODEX_TEST_KEY_EMPTY"
            cfg["api_key_env"] = env_name
            cfg_path = directory / "config.json"
            cfg_path.write_text(json.dumps(cfg, indent=2) + "\n", encoding="utf-8")
            output = directory / "predictions.jsonl"
            os.environ[env_name] = "test-key"
            try:
                code = codex.main([
                    "--limit", "1",
                    "--builds", str(builds),
                    "--config", str(cfg_path),
                    "--codex-executable", str(stub),
                    "--output", str(output),
                    "--output-dir", str(directory / "outputs"),
                    "--transcript-dir", str(directory / "transcripts"),
                    "--system", "test@codex",
                    "--timeout", "15",
                ])
            finally:
                os.environ.pop(env_name, None)
            self.assertEqual(code, 0)
            rows = [json.loads(line) for line in output.read_text(
                encoding="utf-8").splitlines() if line.strip()]
            self.assertEqual(rows[0]["status"], "empty_response")
            self.assertEqual(rows[0]["cost"]["answer_source"], "input_fallback")
            self.assertTrue(rows[0]["cost"]["rejected_obfuscated"])
            program = (directory / rows[0]["path"]).read_text(encoding="utf-8")
            self.assertNotIn("DEOBFUSCATION_INCOMPLETE", program)
            self.assertTrue(program.strip())

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
            tmp, workspace = codex.make_agent_workspace(
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
