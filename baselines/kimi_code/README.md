# Kimi Code deobfuscation baseline

Same construction as `baselines/claude_code/`, `baselines/openhands/`, and
`baselines/codex/`: copy the agent-visible sandbox, write `TASK.md` /
`AGENTS.md`, run the upstream CLI non-interactively, collect `answer.js`.
The CLI is `kimi -p`.

Kimi Code reads **`config.toml` only** for provider credentials. Shell
`OPENROUTER_API_KEY` is not a fallback. The driver writes an isolated
`$KIMI_CODE_HOME/config.toml` so the user's `~/.kimi-code` is never
inherited. Default gateway is OpenRouter Chat Completions
(`https://openrouter.ai/api/v1`). Claude Code's Anthropic root
(`https://openrouter.ai/api`) is rewritten automatically if it appears
in the config. The OpenRouter model id is `openai/gpt-5.6-sol`.

Print mode (`-p`) already uses `auto` permission. Official docs reject
combining `-p` with `--yolo` / `--auto` / `--plan`, so those flags are
not passed.

After the last assistant message with no `tool_calls`, the CLI is
supposed to emit `session.resume_hint` and exit. A Kimi Code bug can
leave `-p` parked in `AgentFileHistoryService.endCheckpoint` instead
(`workspace wd_agent_* is not materialized`). The driver then kills the
process after `idle_after_final_seconds` (default 45) of silence on
that final turn, collects `answer.js`, and does not wait out the wall
timeout. Set `idle_after_final_seconds` in the JSON config to change
the grace period.

| Config | Provider | Default model | Key |
| --- | --- | --- | --- |
| `config.example.json` | OpenRouter | `openai/gpt-5.6-sol` | `OPENROUTER_API_KEY` |
| `config.sophnet.example.json` | Sophnet | `DeepSeek-V4-Pro-0813` | `SOPHNET_API_KEY` |

`--provider sophnet` (or `openrouter`) fills `base_url` and `api_key_env`
from the built-in presets. Each run uses an isolated `HOME` /
`KIMI_CODE_HOME` (`~/.cache/adb-kimi-home`).

WebSearch / FetchURL are disabled in `config.toml`. A syntax-valid copy
of the obfuscated input is written to `answer.js` as a safety draft;
leaving that draft unchanged is scored as `input_fallback`, not `ok`.

Token counts are read from `$KIMI_CODE_HOME/sessions/*/session_*/agents/*/wire.jsonl`
(`usage.record` per turn, including subagents). `kimi -p --output-format stream-json`
does not print usage, so stdout harvesting alone stays empty.

```bash
KIMI_CODE_HOME=/tmp/adb-kimi-home \
kimi -p "Read TASK.md. Deobfuscate subject.mjs. Write answer.js." \
  --output-format stream-json -m bench
```

## Quick start

```bash
# Official installer: https://www.kimi.com/code/docs
export OPENROUTER_API_KEY='…'
python3 baselines/kimi_code/test_run.py
python3 baselines/kimi_code/run.py --dry-run --limit 1
rm -f results/runs/kimi_code/predictions.jsonl
python3 baselines/kimi_code/run.py \
  --config baselines/kimi_code/config.example.json \
  --builds samples/diverse6/corpus/jsob/manifest.jsonl \
  --output results/runs/kimi_code/predictions.jsonl \
  --output-dir results/runs/kimi_code/outputs \
  --transcript-dir results/runs/kimi_code/transcripts \
  --workers 1 --limit 1 --show-response
```

Sophnet:

```bash
export SOPHNET_API_KEY='…'
python3 baselines/kimi_code/run.py \
  --config baselines/kimi_code/config.sophnet.example.json \
  --system DeepSeek-V4-Pro-0813@kimi_code \
  --builds samples/diverse6/corpus/jsob/manifest.jsonl \
  --output results/runs/kimi_code/predictions.jsonl \
  --output-dir results/runs/kimi_code/outputs \
  --transcript-dir results/runs/kimi_code/transcripts \
  --workers 1 --limit 1 --show-response
```

Score with the same evaluator as L0 / OpenHands / Claude Code / Codex:

```bash
python3 evaluators/score.py \
  --predictions results/runs/kimi_code/predictions.jsonl \
  --builds samples/diverse6/corpus/jsob/manifest.jsonl \
  --out results/runs/kimi_code/scores.jsonl
```
