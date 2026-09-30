# OpenCode deobfuscation baseline

Same isolated-sandbox construction as `baselines/claude_code/`: copy the
agent-visible workspace, write `TASK.md` / `opencode.json`, run the
upstream CLI non-interactively, collect `answer.js`.

OpenCode speaks **OpenAI Chat Completions**, not Anthropic Messages. The
default gateway is therefore OpenRouter's `/api/v1` root (the SDK appends
`/chat/completions`). Claude Code's Anthropic root
(`https://openrouter.ai/api`) is rewritten automatically if it appears in
the config. CLI model ids such as `opus[1m]` are mapped onto
`openai/gpt-5.6-sol`, matching the current Claude Code aliases.

| Config | Provider | Default model | Key |
| --- | --- | --- | --- |
| `config.example.json` | OpenRouter | `openai/gpt-5.6-sol` | `OPENROUTER_API_KEY` |
| `config.sophnet.example.json` | Sophnet | `DeepSeek-V4-Pro-0813` | `SOPHNET_API_KEY` |
| `config.soleapi.example.json` | SoleAPI | `gpt-5.6-sol` | `SOLEAPI_API_KEY` |

OpenCode **always** speaks **OpenAI Chat Completions** (`/v1/chat/completions`).
The `@ai-sdk/openai-compatible` provider takes a `/v1` root in `base_url` and
appends `/chat/completions` itself. It does **not** use Codex's Responses wire
(`/v1/responses`).

`--provider sophnet` (or `openrouter` / `soleapi`) fills `base_url` and
`api_key_env` from the built-in presets. Per-instance wall timeout defaults to
**600s** in the gpt-5.6-sol configs (observed OpenCode runs finish in 2–7 min).

OpenCode's Read tool truncates every line at 2000 characters. This
baseline keeps `{entry}` as valid JavaScript and tells the agent to load
it with `cat` (or Node `readFileSync`), not Read.

```bash
opencode run --dir <workspace> --model 'openrouter/openai/gpt-5.6-sol' \
  --file=subject.mjs -- "Read TASK.md. Load subject.mjs with cat. Write answer.js."
```

## Quick start

```bash
export OPENROUTER_API_KEY='…'
python3 baselines/opencode/test_run.py
rm -f results/runs/opencode/predictions.jsonl
python3 baselines/opencode/run.py \
  --config baselines/opencode/config.example.json \
  --builds samples/diverse6/corpus/jsob/manifest.jsonl \
  --output results/runs/opencode/predictions.jsonl \
  --output-dir results/runs/opencode/outputs \
  --transcript-dir results/runs/opencode/transcripts \
  --workers 1 --limit 1 --show-response
```

Sophnet:

```bash
export SOPHNET_API_KEY='…'
python3 baselines/opencode/run.py \
  --config baselines/opencode/config.sophnet.example.json \
  --system DeepSeek-V4-Pro-0813@opencode \
  --builds samples/diverse6/corpus/jsob/manifest.jsonl \
  --output results/runs/opencode/predictions.jsonl \
  --output-dir results/runs/opencode/outputs \
  --transcript-dir results/runs/opencode/transcripts \
  --workers 1 --limit 1 --show-response
```

SoleAPI (`gpt-5.6-sol`, Chat Completions at `https://soleapi.com/v1/chat/completions`):

```bash
export SOLEAPI_API_KEY='…'
python3 baselines/opencode/run.py \
  --config baselines/opencode/config.soleapi.example.json \
  --system 'gpt-5.6-sol@opencode' \
  --builds samples/diverse6/corpus/jsob/manifest.jsonl \
  --output results/runs/opencode/predictions.jsonl \
  --output-dir results/runs/opencode/outputs \
  --transcript-dir results/runs/opencode/transcripts \
  --workers 1 --limit 1 --show-response
```

Full corpus example (resume skips finished builds):

```bash
export SOLEAPI_API_KEY='…'
python3 baselines/opencode/run.py \
  --config baselines/opencode/config.soleapi.example.json \
  --system 'gpt-5.6-sol@opencode' \
  --builds results/results_gpt_sol/jsob/opencode_gpt_sol/builds.jsonl \
  --output results/results_gpt_sol/jsob/opencode_gpt_sol/predictions.jsonl \
  --output-dir results/results_gpt_sol/jsob/opencode_gpt_sol/outputs \
  --transcript-dir results/results_gpt_sol/jsob/opencode_gpt_sol/transcripts \
  --workers 3 --resume --timeout 600
```

Switch an OpenRouter config on the command line with `--provider sophnet`.
