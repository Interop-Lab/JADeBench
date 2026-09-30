# JavaScript Deobfuscation Baselines

The source release defaults baseline drivers to the bundled
`samples/diverse6/corpus/jsob/manifest.jsonl`. Full-scale runs require the
separately distributed artifacts described in `docs/DATA_RELEASE.md`.
Credentials must be supplied through environment variables.

This directory contains the baselines used by the current experiments:

- `L0/`: one-shot static prompting. The model sees only the obfuscated source.
- `opencode/`: the same isolated-sandbox construction as `claude_code/`, but `opencode run` on OpenRouter Chat Completions (`openai/gpt-5.6-sol`) or Sophnet Chat Completions. The artifact is `answer.js`.
- `codex/`: the same isolated-sandbox construction as `claude_code/`, but `codex exec` on OpenRouter Responses (`openai/gpt-5.6-sol`). The artifact is `answer.js`.
- `openhands/`: the same isolated-sandbox construction, but `openhands --headless` on OpenRouter via LiteLLM (`openrouter/openai/gpt-5.6-sol`) or Sophnet Chat Completions. The artifact is `answer.js`.
- `kimi_code/`: the same isolated-sandbox construction, but `kimi -p` on OpenRouter Chat Completions (`openai/gpt-5.6-sol`) or Sophnet Chat Completions. Credentials are written into an isolated `KIMI_CODE_HOME/config.toml`. The artifact is `answer.js`.
- `claude_code/`: the same construction, `claude --print` on OpenRouter's Anthropic Messages gateway (`opus[1m]` → `anthropic/claude-opus-4.8`) or Sophnet's Anthropic Messages gateway (`DeepSeek-V4-Flash-0731`).
- `static_tools/`: deterministic webcrack/deobfuscator baselines.
- `jsimplifier/`: JSimplifier's AST pipeline in `--model=none` mode.

The clean source, project tests, oracle view, and evaluator scores are never
available to the model. The shipped coding-agent runners remove the execution
and debugger harness from each copied workspace before launching the CLI.

## Configuration

Each LLM baseline has a `config.example.json`. Keep credentials out of the
repository and set the environment variable named by `api_key_env`:

```bash
export OPENROUTER_API_KEY='...'
# or, for the Sophnet example configs:
export SOPHNET_API_KEY='...'
```

## Quick checks

```bash
python3 baselines/L0/run.py --dry-run
python3 baselines/opencode/run.py --dry-run --limit 1
python3 baselines/opencode/test_run.py
python3 baselines/codex/run.py --dry-run --limit 1
python3 baselines/codex/test_run.py
python3 baselines/openhands/run.py --dry-run --limit 1
python3 baselines/openhands/test_run.py
python3 baselines/kimi_code/run.py --dry-run --limit 1
python3 baselines/kimi_code/test_run.py
python3 baselines/claude_code/run.py --dry-run --limit 1
python3 baselines/claude_code/test_run.py
python3 baselines/static_tools/run.py --dry-run
```

See each baseline's README and
[`../docs/BASELINE_AGENT_EXECUTION.md`](../docs/BASELINE_AGENT_EXECUTION.md)
for full command lines, protocol details, and budget controls.
