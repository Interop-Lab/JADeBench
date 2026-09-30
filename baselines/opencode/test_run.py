#!/usr/bin/env python3
"""Deterministic tests for the OpenCode deobfuscation driver."""

import importlib.util
import json
import os
import shutil
import stat
import subprocess
import tempfile
import unittest
from pathlib import Path


HERE = Path(__file__).resolve().parent
WORKER_SPEC = importlib.util.spec_from_file_location(
    "_adb_opencode_worker_tested", HERE / "worker.py")
worker = importlib.util.module_from_spec(WORKER_SPEC)
WORKER_SPEC.loader.exec_module(worker)
RUN_SPEC = importlib.util.spec_from_file_location(
    "_adb_opencode_run_tested", HERE / "run.py")
opencode = importlib.util.module_from_spec(RUN_SPEC)
RUN_SPEC.loader.exec_module(opencode)


class OpenCodeWorkerTests(unittest.TestCase):
    def test_split_model_uses_provider_prefix(self):
        provider, model, snapshot = worker.split_model({
            "model": "DeepSeek-V4-Pro-0813",
            "provider": "sophnet",
        })
        self.assertEqual(provider, "sophnet")
        self.assertEqual(model, "DeepSeek-V4-Pro-0813")
        self.assertEqual(snapshot, "sophnet/DeepSeek-V4-Pro-0813")

    def test_split_model_keeps_openrouter_style_path(self):
        provider, model, snapshot = worker.split_model({
            "model": "openrouter/anthropic/claude-sonnet-4.5",
        })
        self.assertEqual(provider, "openrouter")
        self.assertEqual(model, "anthropic/claude-sonnet-4.5")
        self.assertEqual(snapshot, "openrouter/anthropic/claude-sonnet-4.5")

    def test_split_model_keeps_openrouter_vendor_path(self):
        provider, model, snapshot = worker.split_model({
            "model": "openai/gpt-5.6-sol",
            "provider": "openrouter",
        })
        self.assertEqual(provider, "openrouter")
        self.assertEqual(model, "openai/gpt-5.6-sol")
        self.assertEqual(snapshot, "openrouter/openai/gpt-5.6-sol")

    def test_apply_provider_rewrites_claude_code_openrouter_root(self):
        resolved = worker.apply_provider({
            "model": "opus[1m]",
            "provider": "openrouter",
            "base_url": "https://openrouter.ai/api",
            "api_key_env": "OPENROUTER_API_KEY",
            "model_aliases": {
                "ANTHROPIC_DEFAULT_OPUS_MODEL": "openai/gpt-5.6-sol",
            },
        })
        self.assertEqual(resolved["provider"], "openrouter")
        self.assertEqual(resolved["model"], "openai/gpt-5.6-sol")
        self.assertEqual(resolved["base_url"], "https://openrouter.ai/api/v1")
        self.assertEqual(resolved["api_key_env"], "OPENROUTER_API_KEY")

    def test_apply_provider_keeps_openrouter_vendor_model(self):
        resolved = worker.apply_provider({
            "model": "anthropic/claude-opus-4.8",
            "provider": "openrouter",
            "base_url": "https://openrouter.ai/api/v1",
        })
        self.assertEqual(resolved["model"], "anthropic/claude-opus-4.8")
        self.assertEqual(resolved["base_url"], "https://openrouter.ai/api/v1")

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

    def test_apply_provider_rewrites_to_soleapi(self):
        resolved = worker.apply_provider({
            "provider": "soleapi",
            "model": "openai/gpt-5.6-sol",
        }, replace_endpoint=True)
        self.assertEqual(resolved["provider"], "soleapi")
        self.assertEqual(resolved["base_url"], "https://soleapi.com/v1")
        self.assertEqual(resolved["api_key_env"], "SOLEAPI_API_KEY")
        self.assertEqual(resolved["model"], "gpt-5.6-sol")

    def test_split_model_uses_soleapi_prefix(self):
        provider, model, snapshot = worker.split_model({
            "model": "gpt-5.6-sol",
            "provider": "soleapi",
        })
        self.assertEqual(provider, "soleapi")
        self.assertEqual(model, "gpt-5.6-sol")
        self.assertEqual(snapshot, "soleapi/gpt-5.6-sol")

    def test_sdk_base_url_rewrites_anthropic_roots(self):
        self.assertEqual(
            worker.sdk_base_url("https://openrouter.ai/api"),
            "https://openrouter.ai/api/v1")
        self.assertEqual(
            worker.sdk_base_url("https://www.sophnet.com/api/open-apis/anthropic"),
            "https://www.sophnet.com/api/open-apis/v1")
        self.assertEqual(
            worker.sdk_base_url(
                "https://www.sophnet.com/api/open-apis/v1/chat/completions"),
            "https://www.sophnet.com/api/open-apis/v1")
        self.assertEqual(
            worker.sdk_base_url("https://soleapi.com/v1"),
            "https://soleapi.com/v1")
        self.assertEqual(
            worker.sdk_base_url("https://soleapi.com/v1/chat/completions"),
            "https://soleapi.com/v1")
        self.assertEqual(
            worker.sdk_base_url("https://api.soleapi.com"),
            "https://api.soleapi.com/v1")

    def test_prompt_names_entry_and_answer(self):
        source = "var _0xabc = '" + ("x" * 500) + "';"
        prompt = worker.build_prompt({
            "entry": "subject.mjs",
            "source": source,
            "prompt": Path(HERE / "prompt.txt").read_text(encoding="utf-8"),
        })
        self.assertIn("answer.js", prompt)
        self.assertIn("2000 characters", prompt)
        self.assertIn("head -c", prompt)
        self.assertIn("programmer", prompt)
        self.assertIn("120000", prompt)
        self.assertNotIn("{bash_timeout_ms}", prompt)
        self.assertIn("GitHub", prompt)
        self.assertIn("anti-debug", prompt)
        self.assertNotIn("SOURCE.txt", prompt)
        self.assertNotIn("{source}", prompt)
        self.assertNotIn("{entry}", prompt)
        self.assertIn("subject.mjs", prompt)
        self.assertNotIn("var _0xabc", prompt)
        self.assertNotIn(source, prompt)

    def test_run_message_asks_to_read_task(self):
        message = worker.build_run_message({
            "entry": "subject.mjs",
            "source": "var _0x = 1;",
            "prompt": Path(HERE / "prompt.txt").read_text(encoding="utf-8"),
        })
        self.assertIn("Start from the safety draft", message)
        self.assertIn("2000 characters", message)
        self.assertIn("timeout_ms to 120000", message)
        self.assertIn("programmer could read", message)
        self.assertNotIn("var _0x", message)

    def test_bash_timeout_clamps_to_a_short_kill_window(self):
        self.assertEqual(worker.bash_timeout_ms({}), 120000)
        self.assertEqual(worker.bash_timeout_ms({"bash_timeout_ms": 1000}), 5000)
        self.assertEqual(worker.bash_timeout_ms({"bash_timeout_ms": 999999}), 300000)

    def test_product_config_denies_network_and_uses_env_key(self):
        product = worker.build_opencode_config({
            "model": "DeepSeek-V4-Pro-0813",
            "provider": "sophnet",
            "base_url": "https://www.sophnet.com/api/open-apis/v1",
            "api_key_env": "SOPHNET_API_KEY",
            "max_steps": 40,
        })
        self.assertEqual(product["permission"]["external_directory"], "deny")
        self.assertEqual(product["permission"]["bash"], "allow")
        self.assertEqual(product["permission"]["task"], "deny")
        self.assertEqual(product["permission"]["webfetch"], "deny")
        self.assertEqual(product["permission"]["websearch"], "deny")
        self.assertEqual(product["permission"]["codesearch"], "deny")
        self.assertNotIn("tools", product)
        self.assertEqual(product["agent"]["build"]["steps"], 40)
        self.assertIn("answer.js", product["agent"]["build"]["prompt"])
        self.assertIn("GitHub", product["agent"]["build"]["prompt"])
        self.assertIn("Anti-debug", product["agent"]["build"]["prompt"])
        self.assertIn("2000 characters", product["agent"]["build"]["prompt"])
        self.assertIn("timeout_ms", product["agent"]["build"]["prompt"])
        self.assertIn("programmer", product["agent"]["build"]["prompt"])
        self.assertNotIn("SOURCE.txt", product["agent"]["build"]["prompt"])
        self.assertIn("subject.mjs", product["agent"]["build"]["prompt"])
        self.assertEqual(product["enabled_providers"], ["sophnet"])
        self.assertEqual(
            product["provider"]["sophnet"]["options"]["apiKey"],
            "{env:SOPHNET_API_KEY}")
        self.assertEqual(
            product["provider"]["sophnet"]["options"]["baseURL"],
            "https://www.sophnet.com/api/open-apis/v1")
        self.assertEqual(
            product["provider"]["sophnet"]["models"]["DeepSeek-V4-Pro-0813"]["limit"]["output"],
            32768)
        self.assertEqual(
            product["provider"]["sophnet"]["models"]["DeepSeek-V4-Pro-0813"]["options"]["thinking"],
            {"type": "disabled"})

    def test_product_config_uses_soleapi_chat_root(self):
        product = worker.build_opencode_config({
            "model": "gpt-5.6-sol",
            "provider": "soleapi",
            "base_url": "https://soleapi.com/v1",
            "api_key_env": "SOLEAPI_API_KEY",
            "max_steps": 40,
        })
        self.assertEqual(product["model"], "soleapi/gpt-5.6-sol")
        self.assertEqual(product["enabled_providers"], ["soleapi"])
        self.assertEqual(
            product["provider"]["soleapi"]["options"]["apiKey"],
            "{env:SOLEAPI_API_KEY}")
        self.assertEqual(
            product["provider"]["soleapi"]["options"]["baseURL"],
            "https://soleapi.com/v1")
        self.assertEqual(
            product["provider"]["soleapi"]["npm"],
            "@ai-sdk/openai-compatible")
        self.assertIn("gpt-5.6-sol", product["provider"]["soleapi"]["models"])

    def test_cli_error_from_stderr_extracts_file_not_found(self):
        stderr = (
            "INFO  2026-09-07T09:01:30 args=[\"run\",\"--file\"]\n"
            "\x1b[91m\x1b[1mError: \x1b[0mFile not found: Read TASK.md and complete the task.\n"
        )
        self.assertEqual(
            worker.cli_error_from_stderr(stderr),
            "Error: File not found: Read TASK.md and complete the task.")
        with tempfile.TemporaryDirectory() as directory:
            workspace = Path(directory)
            cmd = worker.build_cli(workspace, "write answer.js", {
                "model": "DeepSeek-V4-Pro-0813",
                "provider": "sophnet",
                "entry": "subject.mjs",
                "build_id": "sample",
            })
            self.assertEqual(cmd[1], "run")
            self.assertEqual(cmd[cmd.index("--dir") + 1], str(workspace))
            self.assertEqual(cmd[cmd.index("--model") + 1], "sophnet/DeepSeek-V4-Pro-0813")
            self.assertEqual(cmd[-1], "write answer.js")
            self.assertIn("--", cmd)
            self.assertTrue(any(item.startswith("--file=") for item in cmd))
            self.assertEqual(
                [item for item in cmd if item.startswith("--file=")][0],
                "--file=" + str(workspace / "subject.mjs"))
            self.assertLess(cmd.index("--file=" + str(workspace / "subject.mjs")),
                            cmd.index("--"))
            self.assertIn("--print-logs", cmd)
            self.assertNotIn("--agent", cmd)

    def test_collect_answer_ignores_entry_file(self):
        original = "var _0x = '" + ("x" * 400) + "';"
        with tempfile.TemporaryDirectory() as directory:
            directory = Path(directory)
            (directory / "subject.mjs").write_text(original, encoding="utf-8")
            code, source = worker.collect_answer(
                directory, "subject.mjs", original, "")
            self.assertEqual(source, "none")
            self.assertEqual(code, "")
        with tempfile.TemporaryDirectory() as directory:
            directory = Path(directory)
            (directory / "answer.js").write_text(worker.ANSWER_STUB, encoding="utf-8")
            (directory / "subject.mjs").write_text("var _0x = 1;\n", encoding="utf-8")
            code, source = worker.collect_answer(
                directory, "subject.mjs", "var _0x = 1;\n", "")
            self.assertEqual(source, "none")
            self.assertEqual(code, "")

    def test_hex_mass_is_under_deobfuscated(self):
        names = ["_0x%04x" % i for i in range(40)]
        original = "var " + ",".join("%s=1" % name for name in names) + ";"
        partial = "var " + ",".join("%s=1" % name for name in names[:30]) + ";"
        cleaned = "export default function recovered() { return 1; }\n"
        self.assertTrue(worker.under_deobfuscated(partial, original))
        self.assertFalse(worker.under_deobfuscated(cleaned, original))
        with tempfile.TemporaryDirectory() as directory:
            directory = Path(directory)
            (directory / "answer.js").write_text(partial, encoding="utf-8")
            code, source = worker.collect_answer(
                directory, "subject.mjs", original, "")
            self.assertEqual(code, partial)
            self.assertEqual(source, "under_deobfuscated")

    def test_collect_answer_prefers_answer_js(self):
        with tempfile.TemporaryDirectory() as directory:
            directory = Path(directory)
            (directory / "answer.js").write_text(
                "export default function f() { return 1; }\n", encoding="utf-8")
            (directory / "subject.mjs").write_text("var _0x = 1;\n", encoding="utf-8")
            code, source = worker.collect_answer(
                directory, "subject.mjs", "var _0x = 1;\n", "ignored")
            self.assertEqual(source, "answer.js")
            self.assertIn("export default function f()", code)

    def test_collect_answer_ignores_scratch_decoder(self):
        with tempfile.TemporaryDirectory() as directory:
            directory = Path(directory)
            (directory / "dec.js").write_text(
                "const arr = []; console.log(arr);\n", encoding="utf-8")
            code, source = worker.collect_answer(
                directory, "subject.mjs", "var _0x = 1;\n", "")
            self.assertEqual(source, "none")
            self.assertEqual(code, "")

    def test_collect_answer_ignores_chat_and_write_events(self):
        stdout = "\n".join((
            json.dumps({
                "type": "text",
                "part": {"text": "Here it is:\n```javascript\nexport default 4;\n```\n"},
            }),
            json.dumps({
                "type": "tool_use",
                "part": {
                    "tool": "write",
                    "input": {
                        "path": "answer.js",
                        "content": "export default function recovered() { return 1; }\n",
                    },
                },
            }),
            "notes\n```javascript\nexport default 3;\n```\n",
        ))
        with tempfile.TemporaryDirectory() as directory:
            directory = Path(directory)
            (directory / "subject.mjs").write_text("var _0x = 1;\n", encoding="utf-8")
            code, source = worker.collect_answer(
                directory, "subject.mjs", "var _0x = 1;\n", stdout)
            self.assertEqual(source, "none")
            self.assertEqual(code, "")

    def test_collect_answer_ignores_timeout_method_fragment(self):
        stdout = json.dumps({
            "type": "text",
            "part": {
                "text": "static async[_0x23c75a('&#Aw',0x13d)](_0x5e7206,_0x50b410){\n"
                        "  await _0x394c11.writeFile(_0x50b410,_0x5e7206);\n"
                        "}\n",
            },
        })
        with tempfile.TemporaryDirectory() as directory:
            directory = Path(directory)
            (directory / "dec.js").write_text("const arr = [];\n", encoding="utf-8")
            code, source = worker.collect_answer(
                directory, "subject.mjs", "var _0x = 1;\n", stdout)
            self.assertEqual(source, "none")
            self.assertEqual(code, "")

    def test_collect_answer_ignores_prose_text_event(self):
        with tempfile.TemporaryDirectory() as directory:
            directory = Path(directory)
            (directory / "subject.mjs").write_text("var _0x = 1;\n", encoding="utf-8")
            stdout = json.dumps({
                "type": "text",
                "part": {"text": "I have hit my maximum step count and cannot write answer.js."},
            })
            code, source = worker.collect_answer(
                directory, "subject.mjs", "var _0x = 1;\n", stdout)
            self.assertEqual(source, "none")
            self.assertEqual(code, "")

    def test_summarize_event_skips_token_deltas(self):
        self.assertIsNone(worker.summarize_event(
            '{"type":"message.part.delta","part":{"text":"x"}}'))

    def test_summarize_event_keeps_tool_and_step(self):
        line = json.dumps({
            "type": "tool_use",
            "step": 19,
            "part": {"tool": "bash", "input": {"command": "node harness/execute.mjs"}},
        })
        summary = worker.summarize_event(line)
        self.assertIn("step 19", summary)
        self.assertIn("bash", summary)
        self.assertIn("execute.mjs", summary)

    def test_usage_sums_step_finish_parts_and_cache(self):
        first = {
            "type": "step_finish",
            "part": {
                "id": "part-1",
                "type": "step-finish",
                "tokens": {
                    "total": 130,
                    "input": 100,
                    "output": 10,
                    "reasoning": 4,
                    "cache": {"read": 20, "write": 0},
                },
            },
        }
        second = {
            "type": "step_finish",
            "part": {
                "id": "part-2",
                "type": "step-finish",
                "tokens": {
                    "total": 75,
                    "input": 5,
                    "output": 10,
                    "reasoning": 2,
                    "cache": {"read": 50, "write": 10},
                },
            },
        }
        stdout = "\n".join([
            json.dumps(first),
            json.dumps(first),  # repeated updates must not double count
            json.dumps({"type": "text", "part": {"tokens": {"total": 999}}}),
            json.dumps(second),
        ])
        usage = worker.usage_from_output(stdout)
        self.assertEqual(usage["prompt_tokens"], 105)
        self.assertEqual(usage["completion_tokens"], 20)
        self.assertEqual(usage["reasoning_tokens"], 6)
        self.assertEqual(usage["cache_read_tokens"], 70)
        self.assertEqual(usage["cache_write_tokens"], 10)
        self.assertEqual(usage["total_tokens"], 205)

    def test_syntax_check_accepts_valid_javascript(self):
        ok, detail = worker.syntax_check("export default function f() { return 1; }\n")
        self.assertNotEqual(ok, False)
        if ok is True:
            self.assertEqual(detail, "")


class OpenCodeDriverTests(unittest.TestCase):
    def test_dry_run_writes_prediction_without_launching(self):
        builds = opencode.DEFAULT_BUILDS
        with tempfile.TemporaryDirectory() as directory:
            directory = Path(directory)
            output = directory / "predictions.jsonl"
            code = opencode.main([
                "--dry-run", "--limit", "1",
                "--builds", str(builds),
                "--output", str(output),
                "--output-dir", str(directory / "outputs"),
                "--transcript-dir", str(directory / "transcripts"),
                "--system", "test@opencode",
            ])
            self.assertEqual(code, 0)
            rows = [json.loads(line) for line in output.read_text(
                encoding="utf-8").splitlines() if line.strip()]
            self.assertEqual(len(rows), 1)
            self.assertEqual(rows[0]["status"], "dry_run")
            self.assertEqual(rows[0]["level"], "opencode")
            self.assertFalse(rows[0]["tool_ok"])
            transcript = json.loads(
                (directory / rows[0]["transcript_path"]).read_text(encoding="utf-8"))
            self.assertIn("2000 characters", transcript["prompt"])
            self.assertNotIn("SOURCE.txt", transcript["prompt"])
            self.assertEqual(
                transcript["opencode_config"]["permission"]["task"], "deny")
            self.assertNotIn("```javascript", transcript["prompt"])
            self.assertLess(len(transcript["prompt"]), 8000)
            self.assertEqual(
                transcript["opencode_config"]["permission"]["external_directory"],
                "deny")
            self.assertEqual(
                transcript["opencode_config"]["permission"]["bash"], "allow")
            self.assertEqual(
                transcript["opencode_config"]["permission"]["webfetch"], "deny")
            self.assertEqual(
                transcript["opencode_config"]["permission"]["websearch"], "deny")
            self.assertEqual(
                transcript["opencode_config"]["permission"]["codesearch"], "deny")
            self.assertIn("GitHub", transcript["prompt"])
            self.assertNotIn("tools", transcript["opencode_config"])
            self.assertEqual(
                transcript["opencode_config"]["agent"]["build"]["steps"], 64)
            self.assertEqual(
                transcript["opencode_config"]["enabled_providers"], ["openrouter"])
            self.assertEqual(
                transcript["opencode_config"]["provider"]["openrouter"]["options"]["baseURL"],
                "https://openrouter.ai/api/v1")
            self.assertEqual(
                transcript["opencode_config"]["provider"]["openrouter"]["options"]["apiKey"],
                "{env:OPENROUTER_API_KEY}")
            self.assertIn(
                "answer.js",
                transcript["opencode_config"]["agent"]["build"]["prompt"])

    def test_stub_cli_writes_answer_through_full_driver(self):
        builds = opencode.DEFAULT_BUILDS
        with tempfile.TemporaryDirectory() as directory:
            directory = Path(directory)
            stub = directory / "fake-opencode"
            stub.write_text(
                "#!/bin/sh\n"
                "printf '%s\\n' 'export default function recovered() { return 1; }'"
                " > answer.js\n"
                "echo '{\"type\":\"done\"}'\n",
                encoding="utf-8")
            stub.chmod(stat.S_IRWXU)
            cfg = json.loads((HERE / "config.example.json").read_text(encoding="utf-8"))
            env_name = "ADB_OPENCODE_TEST_KEY"
            cfg["api_key_env"] = env_name
            cfg_path = directory / "config.json"
            cfg_path.write_text(json.dumps(cfg, indent=2) + "\n", encoding="utf-8")
            output = directory / "predictions.jsonl"
            os.environ[env_name] = "test-key"
            try:
                code = opencode.main([
                    "--limit", "1",
                    "--builds", str(builds),
                    "--config", str(cfg_path),
                    "--opencode-executable", str(stub),
                    "--output", str(output),
                    "--output-dir", str(directory / "outputs"),
                    "--transcript-dir", str(directory / "transcripts"),
                    "--system", "test@opencode",
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

    def test_stub_cli_does_not_collect_chat_fragments(self):
        builds = opencode.DEFAULT_BUILDS
        with tempfile.TemporaryDirectory() as directory:
            directory = Path(directory)
            stub = directory / "fake-opencode"
            fragment = (
                "static async[_0x23c75a('&#Aw',0x13d)](_0x5e7206,_0x50b410){"
                " await fs.writeFile(_0x50b410,_0x5e7206); }"
            )
            stub.write_text(
                "#!/bin/sh\n"
                "printf '%s\\n' '"
                + json.dumps({"type": "text", "part": {"text": fragment}})
                + "'\n",
                encoding="utf-8")
            stub.chmod(stat.S_IRWXU)
            cfg = json.loads((HERE / "config.example.json").read_text(encoding="utf-8"))
            env_name = "ADB_OPENCODE_TEST_KEY"
            cfg["api_key_env"] = env_name
            cfg_path = directory / "config.json"
            cfg_path.write_text(json.dumps(cfg, indent=2) + "\n", encoding="utf-8")
            output = directory / "predictions.jsonl"
            os.environ[env_name] = "test-key"
            try:
                code = opencode.main([
                    "--limit", "1",
                    "--builds", str(builds),
                    "--config", str(cfg_path),
                    "--opencode-executable", str(stub),
                    "--output", str(output),
                    "--output-dir", str(directory / "outputs"),
                    "--transcript-dir", str(directory / "transcripts"),
                    "--system", "test@opencode",
                    "--timeout", "15",
                ])
            finally:
                os.environ.pop(env_name, None)
            self.assertEqual(code, 0)
            rows = [json.loads(line) for line in output.read_text(
                encoding="utf-8").splitlines() if line.strip()]
            self.assertEqual(len(rows), 1)
            self.assertEqual(rows[0]["status"], "empty_response")
            self.assertEqual(rows[0]["cost"]["answer_source"], "input_fallback")
            program = (directory / rows[0]["path"]).read_text(encoding="utf-8")
            self.assertNotIn(fragment, program)
            self.assertTrue(program.strip())

    def test_workspace_files_leave_source_in_entry_not_task(self):
        source = "var _0xdead = 1;\n"
        with tempfile.TemporaryDirectory() as directory:
            workspace = Path(directory)
            (workspace / "subject.mjs").write_text(source, encoding="utf-8")
            prompt, _config = worker.write_workspace_files(workspace, {
                "entry": "subject.mjs",
                "source": source,
                "prompt": Path(HERE / "prompt.txt").read_text(encoding="utf-8"),
                "model": "DeepSeek-V4-Pro-0813",
                "provider": "sophnet",
                "base_url": "https://example.test/v1",
                "api_key_env": "SOPHNET_API_KEY",
            })
            task_md = (workspace / "TASK.md").read_text(encoding="utf-8")
            self.assertEqual(task_md, prompt)
            self.assertIn("2000 characters", task_md)
            self.assertIn("head -c", task_md)
            self.assertNotIn("SOURCE.txt", task_md)
            self.assertNotIn(source.strip(), task_md)
            self.assertEqual(
                (workspace / "subject.mjs").read_text(encoding="utf-8"), source)

    def test_workspace_copies_sandbox_entry(self):
        with tempfile.TemporaryDirectory() as directory:
            agent = Path(directory) / "agent"
            agent.mkdir()
            (agent / "subject.mjs").write_text("old program\n", encoding="utf-8")
            (agent / "package.json").write_text("{}\n", encoding="utf-8")
            (agent / "cassette.json").write_text("{}\n", encoding="utf-8")
            (agent / "harness").mkdir()
            (agent / "harness" / "execute.mjs").write_text("export {}\n", encoding="utf-8")
            long_source = "var _0x = '" + ("x" * 2500) + "';"
            tmp, workspace = opencode.make_agent_workspace(
                agent, "subject.mjs", long_source)
            try:
                on_disk = (workspace / "subject.mjs").read_text(encoding="utf-8")
                self.assertEqual(on_disk, long_source)
                self.assertFalse((workspace / "SOURCE.txt").exists())
                self.assertFalse((workspace / "harness").exists())
                self.assertFalse((workspace / "cassette.json").exists())
                self.assertTrue((workspace / "package.json").is_file())
                self.assertFalse((workspace / "answer.js").exists())
            finally:
                shutil.rmtree(str(tmp), ignore_errors=True)

    def test_real_sample_workspace_is_valid_javascript(self):
        builds = opencode.DEFAULT_BUILDS
        rows = opencode.l0.read_jsonl(builds)
        sample_row = next(
            row for row in rows
            if row.get("build_id") == (
                "0xranx__OpenContext_src_core_config.js"
                "__javascript__full__377df28cf2"
            )
        )
        sample = opencode.l0.build_source_path(builds, sample_row)
        source = sample.read_text(encoding="utf-8")
        with tempfile.TemporaryDirectory() as directory:
            agent = Path(directory) / "agent"
            agent.mkdir()
            (agent / "subject.mjs").write_text("old\n", encoding="utf-8")
            tmp, workspace = opencode.make_agent_workspace(
                agent, "subject.mjs", source)
            try:
                entry = workspace / "subject.mjs"
                self.assertEqual(entry.read_text(encoding="utf-8"), source)
                checked = subprocess.run(
                    ["node", "--check", str(entry)],
                    capture_output=True, text=True, timeout=15)
                self.assertEqual(checked.returncode, 0, checked.stderr)
                self.assertFalse((workspace / "SOURCE.txt").exists())
                self.assertFalse((workspace / "harness").exists())
                task = {
                    "entry": "subject.mjs",
                    "source": source,
                    "prompt": Path(HERE / "prompt.txt").read_text(encoding="utf-8"),
                    "model": "DeepSeek-V4-Pro-0813",
                    "provider": "sophnet",
                    "base_url": "https://example.test/v1",
                    "api_key_env": "SOPHNET_API_KEY",
                }
                prompt, product = worker.write_workspace_files(workspace, task)
                self.assertNotIn(source[:80], prompt)
                self.assertIn("2000 characters", prompt)
                self.assertEqual(product["permission"]["bash"], "allow")
                self.assertEqual(product["permission"]["task"], "deny")
                self.assertEqual(product["permission"]["webfetch"], "deny")
                self.assertEqual(product["permission"]["websearch"], "deny")
                self.assertEqual(product["permission"]["codesearch"], "deny")
                cmd = worker.build_cli(workspace, worker.build_run_message(task), task)
                self.assertEqual(
                    [item for item in cmd if item.startswith("--file=")][0],
                    "--file=" + str(entry))
                self.assertEqual(cmd[-2], "--")
                self.assertEqual(cmd[-1], worker.build_run_message(task))
            finally:
                shutil.rmtree(str(tmp), ignore_errors=True)


if __name__ == "__main__":
    unittest.main()
