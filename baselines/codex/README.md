# Codex deobfuscation baseline

Same construction as `baselines/claude_code/` and `baselines/opencode/`:
copy the agent-visible sandbox, write `TASK.md` / `AGENTS.md`, run the
upstream CLI non-interactively, collect `answer.js`. The CLI is
`codex exec`.

Codex speaks the **OpenAI Responses** wire API. The default gateway is
therefore OpenRouter's `/api/v1` root (the same key and model as Claude
Code / OpenCode). Claude Code's Anthropic root (`https://openrouter.ai/api`)
is rewritten automatically if it appears in the config.

| Config | Provider | Default model | Key |
| --- | --- | --- | --- |
| `config.example.json` | OpenRouter | `openai/gpt-5.6-sol` | `OPENROUTER_API_KEY` |
| `config.requesty.example.json` | Requesty | `openai-responses/gpt-5.6-sol` | `REQUESTY_API_KEY` |
| `config.soleapi.example.json` | SoleAPI | `gpt-5.6-sol` | `SOLEAPI_API_KEY` |
| `config.sophnet.example.json` | Sophnet | `DeepSeek-V4-Pro-0813` | `SOPHNET_API_KEY` |

`--provider requesty` (or `openrouter` / `sophnet` / `soleapi` / `codex`) fills `base_url`
and `api_key_env` from the built-in presets. Requesty must use the
`openai-responses/` model prefix because Codex speaks the Responses wire API.
Each run uses an isolated
`CODEX_HOME` (`~/.cache/adb-codex-home`) so sandbox / `web_search`
settings do not inherit the interactive TUI config.

Web/browser features are disabled; workspace network access is off.
`web_search` is `disabled` so the agent cannot fetch the original
repository. A syntax-valid copy of the obfuscated input is written to
`answer.js` as a safety draft; leaving that draft unchanged is scored as
`input_fallback`, not `ok`.

```bash
codex exec --json --sandbox workspace-write --skip-git-repo-check \
  --ephemeral -C <workspace> -m 'openai/gpt-5.6-sol' \
  -- "Read TASK.md. Deobfuscate subject.mjs. Write answer.js."
```

## Quick start

```bash
export OPENROUTER_API_KEY='…'
python3 baselines/codex/test_run.py
python3 baselines/codex/run.py --dry-run --limit 1
rm -f results/runs/codex/predictions.jsonl
python3 baselines/codex/run.py \
  --config baselines/codex/config.example.json \
  --builds samples/diverse6/corpus/jsob/manifest.jsonl \
  --output results/runs/codex/predictions.jsonl \
  --output-dir results/runs/codex/outputs \
  --transcript-dir results/runs/codex/transcripts \
  --workers 1 --limit 1 --show-response
```

Requesty (GPT Sol 5.6 on the native Responses path):

```bash
export REQUESTY_API_KEY='…'
python3 baselines/codex/run.py \
  --config baselines/codex/config.requesty.example.json \
  --system 'openai-responses/gpt-5.6-sol@codex' \
  --builds samples/diverse6/corpus/jsob/manifest.jsonl \
  --output results/runs/codex/predictions.jsonl \
  --output-dir results/runs/codex/outputs \
  --transcript-dir results/runs/codex/transcripts \
  --workers 1 --limit 1 --show-response
```

SoleAPI (native OpenAI Responses, model `gpt-5.6-sol`):

```bash
export SOLEAPI_API_KEY='…'
python3 baselines/codex/run.py \
  --config baselines/codex/config.soleapi.example.json \
  --system 'gpt-5.6-sol@codex' \
  --builds samples/diverse6/corpus/jsob/manifest.jsonl \
  --output results/runs/codex/predictions.jsonl \
  --output-dir results/runs/codex/outputs \
  --transcript-dir results/runs/codex/transcripts \
  --workers 1 --limit 1 --show-response
```

Sophnet (Responses against Chat Completions may fail; prefer OpenRouter):

```bash
export SOPHNET_API_KEY='…'
python3 baselines/codex/run.py \
  --config baselines/codex/config.sophnet.example.json \
  --system DeepSeek-V4-Pro-0813@codex \
  --builds samples/diverse6/corpus/jsob/manifest.jsonl \
  --output results/runs/codex/predictions.jsonl \
  --output-dir results/runs/codex/outputs \
  --transcript-dir results/runs/codex/transcripts \
  --workers 1 --limit 1 --show-response
```

Score with the same evaluator as L0 / OpenCode / Claude Code:

```bash
python3 evaluators/score.py \
  --predictions results/runs/codex/predictions.jsonl \
  --builds samples/diverse6/corpus/jsob/manifest.jsonl \
  --out results/runs/codex/scores.jsonl
```
