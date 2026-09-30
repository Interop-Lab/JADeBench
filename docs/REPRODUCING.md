# Reproducing benchmark operations

## Verify the released results

The fastest reproduction starts from the committed per-subject scores rather
than rerunning model APIs:

```bash
python3 scripts/reproduce_results.py --check
python3 scripts/reproduce_codenet_results.py --check
```

This validates all 24 run directories, checks that every prediction maps to
`adb-001` through `adb-104`, verifies output files, and regenerates the
leaderboard in memory. Remove `--check` to rewrite the generated JSON and
Markdown summaries.

The second command validates all 13 CodeNet100 reference runs, 1,269 released
outputs, stable IDs, and the separate legacy-schema leaderboard.

## Validate this source release

```bash
python3 scripts/check_repository.py
python3 scripts/check_release_safety.py
python3 evaluators/tests/test_metrics.py
python3 evaluators/tests/test_suite_recall.py
python3 evaluators/tests/test_trace_mask.py
```

## Run the bundled sample

The deterministic identity smoke test exercises all static evaluators:

```bash
ADB_CORPUS="$PWD/samples/diverse6/corpus" \
python3 evaluators/score.py \
  --manifest samples/diverse6/corpus/manifest.jsonl \
  --builds samples/diverse6/builds.jsonl \
  --predictions samples/diverse6/predictions/identity.jsonl \
  --out /tmp/agentdeobfbench-smoke.jsonl \
  --no-execution
```

For execution scoring, first run
`python3 scripts/setup_sample.py --execute`, then set `ADB_CORPUS` and
`ADB_SANDBOX` to the sample roots. Execution is optional because one upstream
sample lacks a dependency lock file.

## Run a baseline on the sample

Install the static tools and preview the command:

```bash
npm ci --prefix baselines/static_tools
python3 scripts/benchmark.py baseline static_tools -- \
  --builds samples/diverse6/corpus/jsob/manifest.jsonl \
  --run-root /tmp/adb-static --dry-run
```

Remove `--dry-run` only after reviewing the selected inputs and output path.
Model baselines can consume paid quota and must receive credentials only through
environment variables.

## Score the 104-subject benchmark

The original, JS-OB, and VM programs are included in
`benchmark/realworld104`. Static evaluation is immediately reproducible:

```bash
ADB_CORPUS="$PWD/benchmark/realworld104" \
python3 evaluators/score.py \
  --manifest benchmark/realworld104/manifest.jsonl \
  --builds benchmark/realworld104/builds-jsob.jsonl \
  --predictions path/to/predictions.jsonl \
  --out path/to/scores.jsonl \
  --no-execution
```

Use `builds-vm.jsonl` for VM predictions. Prediction records must use the
released `subject_id` and `build_id` values; `sample_id` is recommended for
analysis but ignored by the evaluator.

## Inspect the CodeNet100 reference benchmark

`benchmark/codenet100` includes 100 originals, stdin/stdout test cases,
JS-OB/full inputs, and C77-0 inputs. Released final programs and historical
JsDeObsBench-compatible score records are under `results/codenet100/runs`.

```bash
python3 scripts/reproduce_codenet_results.py --check
```

Remove `--check` to regenerate
`results/codenet100/leaderboard.{json,md}`. This aggregation uses the legacy
`syntax_pass`, `exe_pass`, and `codebleu` fields and remains separate from the
realworld104 evaluator.

## Execution reproduction

Released execution scores and final returned programs are committed under
`results/runs`. Re-running execution additionally needs project-specific test
environments and generated sandboxes. Their archive status and limitations are
documented in `DATA_RELEASE.md`.

## Broader construction metadata

The full manifests remain in `corpus/manifest.jsonl` and
`obfuscators/builds/builds.jsonl`. They describe 171 construction subjects and
1,295 admitted builds across configurations; they are not the denominator of
the public 104-subject leaderboard.

Every reported result should record the repository revision, evaluator schema,
manifest checksums, selected subject/build IDs, model or tool version, and raw
per-build score records. Do not report only an aggregate.
