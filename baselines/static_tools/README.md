# S1 traditional static-tool baselines

This directory implements the paper's **S1 traditional deobfuscators**:

- `webcrack` **2.16.0** (`webcrack@S1`)
- Synchrony, distributed as `deobfuscator`, **2.4.6** (`synchrony@S1`)

Each system receives only an admitted obfuscated build and returns one complete
JavaScript replacement program. It does not use an LLM, execute the subject,
read the sandbox or oracle, or retry based on output quality. The output is the
same `predictions.jsonl` contract consumed by `evaluators/score.py`.

## Install and verify

webcrack 2.16.0 requires Node.js 22/24/26. Install the exact versions recorded
in `package-lock.json`, then run both tiny file-to-file smoke tests:

```bash
cd baselines/static_tools
npm ci
npm run versions
npm run smoke
```

The licenses differ: webcrack is MIT; Synchrony/deobfuscator is GPL-3.0-only.
The packages are dependencies and are not copied into benchmark outputs.

## Run

Dry-run the full retained build manifest without invoking either package:

```bash
python3 baselines/static_tools/run.py --dry-run
```

Run both tools on the current JS-OB corpus:

```bash
python3 baselines/static_tools/run.py \
  --builds samples/diverse6/corpus/jsob/manifest.jsonl \
  --run-root results/runs/static_tools/jsob \
  --tool all --workers 4
```

Run all 203 retained builds, or resume an interrupted run:

```bash
python3 baselines/static_tools/run.py --tool all --workers 4
python3 baselines/static_tools/run.py --tool all --workers 4 --resume
```

Useful selectors:

```bash
python3 baselines/static_tools/run.py --tool webcrack --limit 1
python3 baselines/static_tools/run.py --tool synchrony \
  --subject 'project::path/to/module.js'
```

Each tool gets its own movable run directory:

```text
runs/<scope>/<tool>/
├── predictions.jsonl
├── outputs/<build_id>.{cjs,mjs}
└── logs/<build_id>.json
```

A tool error produces an empty output file and a prediction with
`tool_ok: false` and `tool_error`. The driver deliberately does **not** copy the
obfuscated input as a fallback: identity fallback would give an infrastructure
failure falsely perfect execution correctness.

### Synchrony and ESM

Synchrony 2.4.6 succeeds on the CommonJS builds exercised by the smoke and
artifact tests. On ESM builds containing `ImportDeclaration`, the published
package can raise an internal `eslint-scope` assertion even when invoked with
`--sourceType module`. The runner passes the correct parser mode explicitly,
but does not patch the package or transpile the input, because either would
change the pinned, recommended-configuration baseline. Such builds are retained
as predictions with `tool_ok: false`; report the failure/coverage rate alongside
Synchrony's scores. Tool failures do not make the batch driver exit nonzero by
default; use `--fail-on-tool-error` when validating the adapter in CI.

## Score

```bash
python3 evaluators/score.py \
  --predictions results/runs/static_tools/jsob/webcrack/predictions.jsonl \
  --builds samples/diverse6/corpus/jsob/manifest.jsonl \
  --out results/runs/static_tools/jsob/webcrack/scores.jsonl \
  --jobs 4

python3 evaluators/score.py \
  --predictions results/runs/static_tools/jsob/synchrony/predictions.jsonl \
  --builds samples/diverse6/corpus/jsob/manifest.jsonl \
  --out results/runs/static_tools/jsob/synchrony/scores.jsonl \
  --jobs 4
```

For static-only validation, add `--no-execution`. As required by the paper,
the tools use their documented recommended/default transformation settings and
all returned programs are scored by the same evaluator as the other baselines.
