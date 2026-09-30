# Claude Code deobfuscation baseline

Same construction as `baselines/opencode/` and `baselines/codex/`: copy the
agent-visible sandbox, write `TASK.md` / `CLAUDE.md`, run the upstream CLI
non-interactively, collect `answer.js`. The CLI is `claude --print`.

Two gateway configs ship in-tree. Keep credentials out of the repository
and export the environment variable named by `api_key_env`:

| Config | Provider | Default model | Key |
| --- | --- | --- | --- |
| `config.example.json` | OpenRouter | `opus[1m]` → `anthropic/claude-opus-4.8` | `OPENROUTER_API_KEY` |
| `config.sophnet.example.json` | Sophnet | `DeepSeek-V4-Flash-0731` | `SOPHNET_API_KEY` |
| `config.claude_4_5.json` | OpenRouter | `opus[1m]` → `anthropic/claude-haiku-4.5` | `OPENROUTER_API_KEY` |

The default route is OpenRouter's **Anthropic Messages** gateway:

`https://openrouter.ai/api` (Claude Code appends `/v1/messages`)

CLI model `opus[1m]`. Alias env vars map Opus / Sonnet / Haiku / Fable /
subagent onto `anthropic/claude-opus-4.8`. Key `OPENROUTER_API_KEY` is
injected as `ANTHROPIC_AUTH_TOKEN`. Each run uses an isolated `HOME`
(`~/.cache/adb-claude-home`) so Claude does not inherit the user's
`~/.claude/settings.json`.

Sophnet is also first-class. Claude Code speaks Anthropic Messages, not
OpenAI Chat Completions, so the driver rewrites the project Chat Completions
URL `https://www.sophnet.com/api/open-apis/v1` onto

`https://www.sophnet.com/api/open-apis/anthropic`

(Claude Code then appends `/v1/messages`). The public
`https://api.sophnet.com/v1` host becomes `https://api.sophnet.com`.
`--provider sophnet` (or `openrouter`) fills `base_url` and `api_key_env`
from the built-in presets. Model names must match a service enabled in the
Sophnet project (`DeepSeek-V4-Flash-0731`, `DeepSeek-V4-Pro-0813`, …), not
`sophnet/...` prefixes. All Claude Code model aliases are pinned to that
same id so hidden Haiku/Sonnet/subagent calls stay on Sophnet.

WebFetch / WebSearch are denied. Bash commands are killed after
`bash_timeout_ms` (default 20s) so anti-debug infinite loops return an
error instead of eating the wall clock (default 600s). A PATH wrapper also caps
agent `node` processes; the Claude CLI itself is launched with the real
node binary so the wrapper cannot kill the session (exit 124). HTTP
completions abort after `api_timeout_ms` (default 90s). Hung agent
`node` processes are killed by a PATH wrapper; the Claude CLI is not.
Do not set `max_thinking_tokens`:
Claude Code also sends that budget to a hidden Bash preflight API, which
is how a 16k thinking run can sit quiet for minutes and never write
`answer.js`. Bash stdout is
capped (`BASH_MAX_OUTPUT_LENGTH`, default 8000 chars) so dumping the
string table cannot stall the next model request. Stream JSON
includes partial messages so a stalled gateway is distinguishable from
a long generation. No L0 Chat Completions finalizer.

```bash
export OPENROUTER_API_KEY='…'
export ANTHROPIC_BASE_URL='https://openrouter.ai/api'
export ANTHROPIC_AUTH_TOKEN="$OPENROUTER_API_KEY"
export ANTHROPIC_DEFAULT_OPUS_MODEL='anthropic/claude-opus-4.8'
export ANTHROPIC_DEFAULT_SONNET_MODEL='anthropic/claude-opus-4.8'
export ANTHROPIC_DEFAULT_HAIKU_MODEL='anthropic/claude-opus-4.8'
export ANTHROPIC_DEFAULT_FABLE_MODEL='anthropic/claude-opus-4.8'
export CLAUDE_CODE_SUBAGENT_MODEL='anthropic/claude-opus-4.8'
claude --print --output-format stream-json --verbose \
  --model 'opus[1m]' \
  --permission-mode bypassPermissions \
  -- "Read TASK.md. Deobfuscate subject.mjs. Write answer.js."
```

Sophnet (Anthropic Messages root; the OpenAI SDK `.../open-apis/v1` URL is rewritten here):

```bash
export SOPHNET_API_KEY='…'
export ANTHROPIC_BASE_URL='https://www.sophnet.com/api/open-apis/anthropic'
export ANTHROPIC_AUTH_TOKEN="$SOPHNET_API_KEY"
unset ANTHROPIC_API_KEY
export ANTHROPIC_MODEL='DeepSeek-V4-Flash-0731'
export ANTHROPIC_DEFAULT_OPUS_MODEL='DeepSeek-V4-Flash-0731'
export ANTHROPIC_DEFAULT_SONNET_MODEL='DeepSeek-V4-Flash-0731'
export ANTHROPIC_DEFAULT_HAIKU_MODEL='DeepSeek-V4-Flash-0731'
export ANTHROPIC_DEFAULT_FABLE_MODEL='DeepSeek-V4-Flash-0731'
export CLAUDE_CODE_SUBAGENT_MODEL='DeepSeek-V4-Flash-0731'
claude --print --output-format stream-json --verbose \
  --model 'DeepSeek-V4-Flash-0731' \
  --permission-mode bypassPermissions \
  -- "Read TASK.md. Deobfuscate subject.mjs. Write answer.js."
```

A simple `messages.create` succeeding does not guarantee Claude Code's tool
loop will finish this task. Score only from disk `answer.js`.

## Non-Claude kernels (Sophnet / DeepSeek)

DeepSeek thinks by default and the Anthropic Messages schema has no way to
turn that off from the CLI, so the driver starts a loopback Anthropic proxy
and injects `thinking: {"type": "disabled"}` into `/v1/messages`.
`/v1/messages/count_tokens` is deliberately left untouched — it is a
different schema and a strict gateway rejects the extra fields.

The proxy relays raw response bytes, which drops the upstream chunked
framing, so a streamed completion **must** be terminated with
`Connection: close`. Sending neither that nor a `Content-Length` makes every
completion look like it is still generating until `api_timeout_ms` expires,
which reads as "the model thinks for minutes and then fails".
`test_thinking_off_proxy_terminates_a_streamed_response` pins this.

`max_output_tokens` caps `max_tokens` per response. It is exported as
`CLAUDE_CODE_MAX_OUTPUT_TOKENS` and, on the Sophnet route, also clamped
inside the proxy. Claude Code sizes this budget for Claude; if the gateway
answers `400` on `max_tokens`, lower it (8192 is a safe first try) rather
than raising the wall timeout. `0` leaves Claude Code's own default alone.

The proxy's upstream connection does not honour `http_proxy` /
`https_proxy`. On a network where the gateway is only reachable through a
forward proxy, the run fails fast with `502 upstream …` in the stream.

## Checkpoints and retries

Each workspace starts with the obfuscated input copied to `answer.js` as a
syntax-valid safety draft. This fallback is reported as `input_fallback` and
never promoted to `status=ok`; it only prevents an empty artifact.

Every 10 seconds the driver saves bounded helper artifacts (`_*.mjs`,
`decoded*.json`, `CHECKPOINT.md`) and the latest syntax-valid `answer.js` under
`<prediction-dir>/checkpoints/<build-id>/`. A later run restores those files
automatically. Use `--resume` to keep successful rows and retry failed rows
from their checkpoints; stale failed rows are removed before retrying.

## Quick start

```bash
python3 baselines/claude_code/test_run.py
python3 baselines/claude_code/run.py --dry-run --limit 1
```

OpenRouter:

```bash
export OPENROUTER_API_KEY='…'
rm -f results/runs/claude_code/predictions.jsonl
python3 baselines/claude_code/run.py \
  --config baselines/claude_code/config.example.json \
  --builds samples/diverse6/corpus/jsob/manifest.jsonl \
  --output results/runs/claude_code/predictions.jsonl \
  --output-dir results/runs/claude_code/outputs \
  --transcript-dir results/runs/claude_code/transcripts \
  --workers 1 --limit 1 --show-response
```

Sophnet (same `SOPHNET_API_KEY` as L0 / OpenCode). Claude Code still uses
`ANTHROPIC_AUTH_TOKEN` against the Anthropic Messages root, not the OpenAI
Python SDK `chat.completions` path:

```bash
export SOPHNET_API_KEY='…'
python3 baselines/claude_code/run.py \
  --config baselines/claude_code/config.sophnet.example.json \
  --system DeepSeek-V4-Flash-0731@claude_code \
  --builds samples/diverse6/corpus/jsob/manifest.jsonl \
  --output results/runs/claude_code/predictions.jsonl \
  --output-dir results/runs/claude_code/outputs \
  --transcript-dir results/runs/claude_code/transcripts \
  --workers 1 --limit 1 --show-response
```

Switch an OpenRouter config on the command line with `--provider sophnet`
(and optionally `--model DeepSeek-V4-Pro-0813`). The OpenAI-compatible
`base_url` from the Sophnet SDK example is accepted and rewritten.

Score with the same evaluator as L0/OpenCode:

```bash
python3 evaluators/score.py \
  --predictions results/runs/claude_code/predictions.jsonl \
  --builds samples/diverse6/corpus/jsob/manifest.jsonl \
  --out results/runs/claude_code/scores.jsonl
```
