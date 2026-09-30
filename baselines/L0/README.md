# L0 static baseline

This directory implements the paper's L0 condition: one static prompt, the
obfuscated source, and no execution, preprocessing, debugger, tests, or
verification. It uses an OpenAI-compatible Chat Completions endpoint and
writes the common `predictions.jsonl` contract consumed by
`evaluators/score.py`.

Two gateway configs ship in-tree. Keep credentials out of the repository
and export the environment variable named by `api_key_env`:

| Config | Provider | Default model | Key |
| --- | --- | --- | --- |
| `config.example.json` | OpenRouter | `anthropic/claude-opus-4.8` | `OPENROUTER_API_KEY` |
| `config.sophnet.example.json` | Sophnet | `DeepSeek-V4-Pro-0813` | `SOPHNET_API_KEY` |

Sophnet's Chat Completions URL is
`https://www.sophnet.com/api/open-apis/v1` (same project API as the
OpenCode/Codex baselines). The public `https://api.sophnet.com/v1` endpoint
also works if you set `base_url` or `--base-url`. Model names must match a
service enabled in the Sophnet project; they are bare ids such as
`DeepSeek-V4-Pro-0813`, not `sophnet/...` prefixes.

`--provider sophnet` (or `openrouter` / `openai`) fills `base_url` and
`api_key_env` from the built-in presets when those fields are omitted.

## Quick start

1. Copy one of the example configs to a private file if you need to change
   the model. Do not commit credentials.
2. Run a no-network smoke test:

   ```bash
   python3 baselines/L0/run.py --dry-run \
     --builds samples/diverse6/corpus/jsob/manifest.jsonl \
     --output results/runs/L0/predictions.jsonl
   python3 baselines/L0/test_run.py
   ```

3. OpenRouter:

   ```bash
   export OPENROUTER_API_KEY='…'
   python3 baselines/L0/run.py \
     --config baselines/L0/config.example.json \
     --builds samples/diverse6/corpus/jsob/manifest.jsonl \
     --output results/runs/L0/predictions.jsonl \
     --workers 4 --show-response
   ```

4. Sophnet:

   ```bash
   export SOPHNET_API_KEY='…'
   python3 baselines/L0/run.py \
     --config baselines/L0/config.sophnet.example.json \
     --system DeepSeek-V4-Pro-0813@L0 \
     --builds samples/diverse6/corpus/jsob/manifest.jsonl \
     --output results/runs/L0/predictions.jsonl \
     --workers 4 --show-response
   ```

Use `--resume` after an interrupted run. Retries apply only to transport and
server errors; a completed model answer is never retried. `--dry-run` stores
the exact prompts and empty output files but does not contact the gateway.

## Outputs and accounting

- `outputs/*.js` contains one returned program per build. A failed request still
  gets an empty file and a prediction record, so failures are not silently
  dropped.
- `transcripts/*.json` stores the exact prompt, raw response, usage, retry
  count, and error. The transcript does not contain hidden corpus metadata in
  the prompt.
- `input_truncated` is true when the source exceeds `--max-input-tokens`.
  L0 has no paging tool, so the driver keeps a marked head/tail slice and
  records both original and visible sizes. Set the flag to `0` only when the
  configured model context can actually hold the complete source.
- `tool_ok` is false by design: L0 has no tools. The field is retained for the
  evaluator's shared diagnostics schema.

The default input is `samples/diverse6/corpus/jsob/manifest.jsonl`.
The model sees only the
source text and the fixed `prompt.txt`, not `subject_id`, project name, runner,
admission mode, or clean source.

## Scoring

After a real run, score syntax/simplification/similarity (and execution where
the sandbox oracle is available) with:

```bash
python3 evaluators/score.py \
  --predictions results/runs/L0/predictions.jsonl \
  --builds samples/diverse6/corpus/jsob/manifest.jsonl \
  --out results/runs/L0/scores.jsonl \
  --jobs 4
```

The three `L1_exports` sample builds should be reported separately from the
seven oracle-admitted builds because their behavior was not established at
obfuscation time.
