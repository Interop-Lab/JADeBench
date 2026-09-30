# OpenHands deobfuscation baseline

Same construction as `baselines/claude_code/`, `baselines/codex/`, and
`baselines/opencode/`: copy the agent-visible sandbox, write `TASK.md` /
`AGENTS.md`, run the upstream CLI non-interactively, collect `answer.js`.
The CLI is `openhands --headless`.

OpenHands speaks **LiteLLM**. The default gateway is OpenRouter Chat
Completions (`https://openrouter.ai/api/v1`). Claude Code's Anthropic
root (`https://openrouter.ai/api`) is rewritten automatically if it
appears in the config. The LiteLLM model id is
`openrouter/openai/gpt-5.6-sol`.

`--override-with-envs` is always passed. Without it, OpenHands ignores
`LLM_API_KEY` / `LLM_MODEL` / `LLM_BASE_URL` and reads
`~/.openhands/settings.json`.

| Config | Provider | Default model | Key |
| --- | --- | --- | --- |
| `config.example.json` | OpenRouter | `openai/gpt-5.6-sol` | `OPENROUTER_API_KEY` |
| `config.sophnet.example.json` | Sophnet | `DeepSeek-V4-Pro-0813` | `SOPHNET_API_KEY` |

`--provider sophnet` (or `openrouter`) fills `base_url` and `api_key_env`
from the built-in presets. Each run uses an isolated `HOME`
(`~/.cache/adb-openhands-home`) so the user's interactive
`~/.openhands` is not inherited.

Token counts are read from `.openhands/conversations/<id>/base_state.json`
(`stats.usage_to_metrics`, including `task:*` subagents), matched to this
sandbox's `working_dir`. `openhands --headless --json` does not print usage,
so stdout harvesting alone stays empty. LiteLLM's `prompt_tokens` includes
cache reads; the driver splits them so `prompt_tokens` is uncached input
and `cache_read_tokens` is stored separately, same shape as Claude Code.

Browsing is off (`enable_browsing=false`). A syntax-valid copy of the
obfuscated input is written to `answer.js` as a safety draft; leaving
that draft unchanged is scored as `input_fallback`, not `ok`.

```bash
openhands --headless --json --override-with-envs \
  --exit-without-confirmation --always-approve \
  -t "Read TASK.md. Deobfuscate subject.mjs. Write answer.js."
```

## Quick start

```bash
pip install openhands   # or: uv tool install openhands
export OPENROUTER_API_KEY='…'
python3 baselines/openhands/test_run.py
python3 baselines/openhands/run.py --dry-run --limit 1
rm -f results/runs/openhands/predictions.jsonl
python3 baselines/openhands/run.py \
  --config baselines/openhands/config.example.json \
  --builds samples/diverse6/corpus/jsob/manifest.jsonl \
  --output results/runs/openhands/predictions.jsonl \
  --output-dir results/runs/openhands/outputs \
  --transcript-dir results/runs/openhands/transcripts \
  --workers 1 --limit 1 --show-response
```

Sophnet:

```bash
export SOPHNET_API_KEY='…'
python3 baselines/openhands/run.py \
  --config baselines/openhands/config.sophnet.example.json \
  --system DeepSeek-V4-Pro-0813@openhands \
  --builds samples/diverse6/corpus/jsob/manifest.jsonl \
  --output results/runs/openhands/predictions.jsonl \
  --output-dir results/runs/openhands/outputs \
  --transcript-dir results/runs/openhands/transcripts \
  --workers 1 --limit 1 --show-response
```

Score with the same evaluator as L0 / OpenCode / Claude Code / Codex:

```bash
python3 evaluators/score.py \
  --predictions results/runs/openhands/predictions.jsonl \
  --builds samples/diverse6/corpus/jsob/manifest.jsonl \
  --out results/runs/openhands/scores.jsonl
```
