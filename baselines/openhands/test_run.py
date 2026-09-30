#!/usr/bin/env python3
"""Deterministic tests for the OpenHands deobfuscation driver."""

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
    "_adb_openhands_worker_tested", HERE / "worker.py")
worker = importlib.util.module_from_spec(WORKER_SPEC)
WORKER_SPEC.loader.exec_module(worker)
RUN_SPEC = importlib.util.spec_from_file_location(
    "_adb_openhands_run_tested", HERE / "run.py")
openhands = importlib.util.module_from_spec(RUN_SPEC)
RUN_SPEC.loader.exec_module(openhands)


class OpenHandsWorkerTests(unittest.TestCase):
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

    def test_cli_is_openhands_headless_not_codex(self):
        with tempfile.TemporaryDirectory() as directory:
            workspace = Path(directory)
            cmd = worker.build_cli(workspace, "write answer.js", {
                "model": "openai/gpt-5.6-sol",
                "provider": "openrouter",
            })
            self.assertEqual(cmd[0], "openhands")
            self.assertIn("--headless", cmd)
            self.assertIn("--json", cmd)
            self.assertIn("--override-with-envs", cmd)
            self.assertIn("--exit-without-confirmation", cmd)
            self.assertIn("--always-approve", cmd)
            self.assertEqual(cmd[cmd.index("-t") + 1], "write answer.js")
            self.assertNotIn("codex", cmd)
            self.assertNotIn("opencode", cmd)
            self.assertNotIn("claude", cmd)
            self.assertNotIn("gemini", cmd)

    def test_litellm_model_keeps_openrouter_tilde(self):
        slug = worker.litellm_model({
            "provider": "openrouter",
            "model": "openai/gpt-5.6-sol",
        })
        self.assertEqual(slug, "openrouter/openai/gpt-5.6-sol")
        already = worker.litellm_model({
            "provider": "openrouter",
            "model": "openrouter/openai/gpt-5.6-sol",
        })
        self.assertEqual(already, "openrouter/openai/gpt-5.6-sol")

    def test_settings_use_openrouter_and_disable_browsing(self):
        settings = worker.build_agent_settings({
            "provider": "openrouter",
            "model": "openai/gpt-5.6-sol",
            "base_url": "https://openrouter.ai/api/v1",
        })
        self.assertEqual(
            settings["llm"]["model"], "openrouter/openai/gpt-5.6-sol")
        self.assertIn("openrouter.ai/api/v1", settings["llm"]["base_url"])
        self.assertFalse(settings["agent"]["enable_browsing"])
        blob = json.dumps(settings)
        self.assertNotIn("sophnet", blob)
        self.assertNotIn("DeepSeek", blob)

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
        self.assertEqual(
            worker.litellm_model(resolved), "openai/DeepSeek-V4-Pro-0813")

    def test_collect_answer_ignores_entry_and_chat(self):
        stdout = json.dumps({
            "type": "action",
            "action": "think",
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
            "type": "action",
            "action": "run",
            "command": "cat subject.mjs",
        })
        summary = worker.summarize_event(line)
        self.assertIn("action", summary)
        self.assertIn("cat subject.mjs", summary)

    def test_usage_from_openhands_metrics(self):
        stdout = json.dumps({
            "type": "result",
            "metrics": {
                "accumulated_prompt_tokens": 10,
                "accumulated_completion_tokens": 4,
            },
        })
        usage = worker.usage_from_output(stdout)
        self.assertEqual(usage["prompt_tokens"], 10)
        self.assertEqual(usage["completion_tokens"], 4)
        self.assertEqual(usage["total_tokens"], 14)

    def test_usage_from_openhands_conversation_state(self):
        with tempfile.TemporaryDirectory() as directory:
            directory = Path(directory)
            workspace = directory / "agent"
            workspace.mkdir()
            other = directory / "other-agent"
            other.mkdir()
            convs = directory / ".openhands" / "conversations"
            mine = convs / "aaa"
            stale = convs / "bbb"
            continuation = convs / "ccc"
            mine.mkdir(parents=True)
            stale.mkdir(parents=True)
            continuation.mkdir(parents=True)
            (stale / "base_state.json").write_text(json.dumps({
                "workspace": {"working_dir": str(other), "kind": "LocalWorkspace"},
                "stats": {"usage_to_metrics": {"default": {
                    "accumulated_token_usage": {
                        "prompt_tokens": 999,
                        "completion_tokens": 999,
                        "cache_read_tokens": 0,
                    }
                }}},
            }), encoding="utf-8")
            (mine / "base_state.json").write_text(json.dumps({
                "workspace": {
                    "working_dir": str(workspace),
                    "kind": "LocalWorkspace",
                },
                "stats": {"usage_to_metrics": {
                    "default": {"accumulated_token_usage": {
                        "prompt_tokens": 100,
                        "completion_tokens": 10,
                        "cache_read_tokens": 40,
                        "cache_write_tokens": 0,
                    }},
                    "task:task_00000001": {"accumulated_token_usage": {
                        "prompt_tokens": 50,
                        "completion_tokens": 5,
                        "cache_read_tokens": 20,
                        "cache_write_tokens": 0,
                    }},
                }},
            }), encoding="utf-8")
            (continuation / "base_state.json").write_text(json.dumps({
                "workspace": {
                    "working_dir": str(workspace),
                    "kind": "LocalWorkspace",
                },
                "stats": {"usage_to_metrics": {
                    "default": {"accumulated_token_usage": {
                        "prompt_tokens": 30,
                        "completion_tokens": 3,
                        "cache_read_tokens": 10,
                        "cache_write_tokens": 0,
                    }},
                }},
            }), encoding="utf-8")
            usage = worker.usage_from_openhands_home(directory, workspace)
            # LiteLLM prompt includes cache; split so prompt is uncached.
            self.assertEqual(usage["prompt_tokens"], 110)
            self.assertEqual(usage["completion_tokens"], 18)
            self.assertEqual(usage["cache_read_tokens"], 70)
            self.assertEqual(usage["total_tokens"], 198)
            collected, source = worker.collect_usage(
                "", home=directory, workspace=workspace)
            self.assertEqual(collected, usage)
            self.assertEqual(source, "openhands_conversation")

    def test_syntax_check_accepts_valid_javascript(self):
        ok, detail = worker.syntax_check("export default function f() { return 1; }\n")
        self.assertNotEqual(ok, False)
        if ok is True:
            self.assertEqual(detail, "")


class OpenHandsDriverTests(unittest.TestCase):
    def test_dry_run_writes_prediction_without_launching(self):
        builds = openhands.DEFAULT_BUILDS
        with tempfile.TemporaryDirectory() as directory:
            directory = Path(directory)
            output = directory / "predictions.jsonl"
            code = openhands.main([
                "--dry-run", "--limit", "1",
                "--builds", str(builds),
                "--output", str(output),
                "--output-dir", str(directory / "outputs"),
                "--transcript-dir", str(directory / "transcripts"),
                "--system", "test@openhands",
            ])
            self.assertEqual(code, 0)
            rows = [json.loads(line) for line in output.read_text(
                encoding="utf-8").splitlines() if line.strip()]
            self.assertEqual(len(rows), 1)
            self.assertEqual(rows[0]["status"], "dry_run")
            self.assertEqual(rows[0]["level"], "openhands")
            transcript = json.loads(
                (directory / rows[0]["transcript_path"]).read_text(encoding="utf-8"))
            self.assertIn("answer.js", transcript["prompt"])
            self.assertNotIn("```javascript", transcript["prompt"])
            self.assertEqual(transcript["openhands_cli"][0], "openhands")
            self.assertIn("--headless", transcript["openhands_cli"])
            self.assertIn("--json", transcript["openhands_cli"])
            self.assertIn("--override-with-envs", transcript["openhands_cli"])
            self.assertEqual(
                transcript["litellm_model"],
                "openrouter/openai/gpt-5.6-sol")
            self.assertIn(
                "openrouter.ai/api/v1",
                transcript["openhands_settings"]["llm"]["base_url"])
            self.assertFalse(
                transcript["openhands_settings"]["agent"]["enable_browsing"])
            self.assertIn("safety draft", transcript["prompt"])
            self.assertNotIn("DeepSeek", json.dumps(transcript["openhands_settings"]))
            self.assertIn(transcript["entry"], transcript["prompt"])

    def test_stub_cli_writes_answer_through_full_driver(self):
        builds = openhands.DEFAULT_BUILDS
        with tempfile.TemporaryDirectory() as directory:
            directory = Path(directory)
            stub = directory / "fake-openhands"
            stub.write_text(
                "#!/bin/sh\n"
                "printf '%s\\n' 'export default function recovered() { return 1; }'"
                " > answer.js\n"
                "echo '{\"type\":\"result\",\"status\":\"success\"}'\n",
                encoding="utf-8")
            stub.chmod(stat.S_IRWXU)
            cfg = json.loads((HERE / "config.example.json").read_text(encoding="utf-8"))
            env_name = "ADB_OPENHANDS_TEST_KEY"
            cfg["api_key_env"] = env_name
            cfg_path = directory / "config.json"
            cfg_path.write_text(json.dumps(cfg, indent=2) + "\n", encoding="utf-8")
            output = directory / "predictions.jsonl"
            os.environ[env_name] = "test-key"
            try:
                code = openhands.main([
                    "--limit", "1",
                    "--builds", str(builds),
                    "--config", str(cfg_path),
                    "--openhands-executable", str(stub),
                    "--output", str(output),
                    "--output-dir", str(directory / "outputs"),
                    "--transcript-dir", str(directory / "transcripts"),
                    "--system", "test@openhands",
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
        builds = openhands.DEFAULT_BUILDS
        with tempfile.TemporaryDirectory() as directory:
            directory = Path(directory)
            stub = directory / "fake-openhands"
            stub.write_text(
                "#!/bin/sh\necho '{\"type\":\"result\",\"status\":\"success\"}'\n",
                encoding="utf-8")
            stub.chmod(stat.S_IRWXU)
            cfg = json.loads((HERE / "config.example.json").read_text(encoding="utf-8"))
            env_name = "ADB_OPENHANDS_TEST_KEY_EMPTY"
            cfg["api_key_env"] = env_name
            cfg_path = directory / "config.json"
            cfg_path.write_text(json.dumps(cfg, indent=2) + "\n", encoding="utf-8")
            output = directory / "predictions.jsonl"
            os.environ[env_name] = "test-key"
            try:
                code = openhands.main([
                    "--limit", "1",
                    "--builds", str(builds),
                    "--config", str(cfg_path),
                    "--openhands-executable", str(stub),
                    "--output", str(output),
                    "--output-dir", str(directory / "outputs"),
                    "--transcript-dir", str(directory / "transcripts"),
                    "--system", "test@openhands",
                    "--timeout", "15",
                ])
            finally:
                os.environ.pop(env_name, None)
            self.assertEqual(code, 0)
            rows = [json.loads(line) for line in output.read_text(
                encoding="utf-8").splitlines() if line.strip()]
            self.assertEqual(rows[0]["status"], "empty_response")
            self.assertEqual(rows[0]["cost"]["answer_source"], "input_fallback")
            program = (directory / rows[0]["path"]).read_text(encoding="utf-8")
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
            tmp, workspace = openhands.make_agent_workspace(
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
