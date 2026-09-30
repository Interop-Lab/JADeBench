#!/usr/bin/env python3
"""Deterministic tests for the L0 static driver, including Sophnet presets."""

import importlib.util
import json
import unittest
from pathlib import Path


HERE = Path(__file__).resolve().parent
SPEC = importlib.util.spec_from_file_location("_adb_l0_tested", HERE / "run.py")
l0 = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(l0)


class L0ProviderTests(unittest.TestCase):
    def test_sophnet_example_resolves_chat_completions(self):
        cfg = json.loads(
            (HERE / "config.sophnet.example.json").read_text(encoding="utf-8"))
        resolved = l0.apply_provider(cfg)
        self.assertEqual(resolved["provider"], "sophnet")
        self.assertEqual(resolved["model"], "GLM-5.3")
        self.assertEqual(resolved["api_key_env"], "SOPHNET_API_KEY")
        self.assertEqual(
            l0.endpoint_url(resolved),
            "https://www.sophnet.com/api/open-apis/v1/chat/completions")

    def test_openrouter_example_keeps_vendor_model_path(self):
        cfg = json.loads(
            (HERE / "config.example.json").read_text(encoding="utf-8"))
        resolved = l0.apply_provider(cfg)
        self.assertEqual(resolved["provider"], "openrouter")
        self.assertEqual(resolved["model"], "anthropic/claude-opus-4.8")
        self.assertEqual(
            l0.endpoint_url(resolved),
            "https://openrouter.ai/api/v1/chat/completions")

    def test_sophnet_prefix_is_stripped_from_model(self):
        provider, model = l0.split_provider_model({
            "model": "sophnet/DeepSeek-V4-Pro-0813",
        })
        self.assertEqual(provider, "sophnet")
        self.assertEqual(model, "DeepSeek-V4-Pro-0813")

    def test_cli_provider_switches_openrouter_config_to_sophnet(self):
        cfg = json.loads(
            (HERE / "config.example.json").read_text(encoding="utf-8"))
        cfg["provider"] = "sophnet"
        cfg["model"] = "DeepSeek-V4-Pro-0813"
        resolved = l0.apply_provider(cfg, replace_endpoint=True)
        self.assertEqual(resolved["base_url"],
                         "https://www.sophnet.com/api/open-apis/v1")
        self.assertEqual(resolved["api_key_env"], "SOPHNET_API_KEY")
        self.assertEqual(resolved["model"], "DeepSeek-V4-Pro-0813")

    def test_provider_preset_fills_missing_endpoint(self):
        resolved = l0.apply_provider({"provider": "sophnet"})
        self.assertEqual(resolved["base_url"],
                         "https://www.sophnet.com/api/open-apis/v1")
        self.assertEqual(resolved["model"], "DeepSeek-V4-Pro-0813")
        self.assertEqual(resolved["api_key_env"], "SOPHNET_API_KEY")

    def test_explicit_sophnet_base_url_is_kept(self):
        resolved = l0.apply_provider({
            "provider": "sophnet",
            "model": "GLM-5.2",
            "base_url": "https://api.sophnet.com/v1",
            "api_key_env": "SOPHNET_API_KEY",
        })
        self.assertEqual(resolved["base_url"], "https://api.sophnet.com/v1")
        self.assertEqual(
            l0.endpoint_url(resolved),
            "https://api.sophnet.com/v1/chat/completions")

    def test_soleapi_gpt_uses_responses_wire(self):
        resolved = l0.apply_provider({
            "provider": "soleapi",
            "model": "gpt-5.6-sol",
            "base_url": "https://soleapi.com/v1",
            "api_key_env": "SOLEAPI_API_KEY",
            "api_style": "responses",
        })
        self.assertEqual(resolved["api_style"], "responses")
        self.assertEqual(
            l0.endpoint_url(resolved),
            "https://soleapi.com/v1/responses")


if __name__ == "__main__":
    unittest.main()
