# Evaluators

AgentDeobfBench scores one returned JavaScript program per protected input.
Execution correctness is the primary metric; syntax, simplification,
similarity, exact behavioral agreement, and cost fields provide diagnostics.

## Score realworld93

```bash
ADB_CORPUS="$PWD/benchmark/realworld93" \
python3 evaluators/score.py \
  --manifest benchmark/realworld93/manifest.jsonl \
  --builds benchmark/realworld93/builds-jsob.jsonl \
  --predictions path/to/predictions.jsonl \
  --out path/to/scores.jsonl \
  --no-execution
```

Use `builds-vm.jsonl` for VM L1 predictions. Full execution scoring additionally
requires isolated project test environments.

## Data contract

Prediction records identify `sample_id`, `subject_id`, `build_id`, and either a
relative `path` or inline `code`. Score records preserve the same identifiers
and include:

- `syntax`: parsing and export-surface checks;
- `execution`: test and trace-based behavioral evidence;
- `simplification`: complexity reduction relative to protected and original
  programs;
- `similarity`: token, AST, and CodeBLEU-style signals;
- `status`, `diagnostics`, and `cost`: failure and resource metadata.

See `evallib/schema.py` and `config/eval.json` for the canonical schema and
thresholds.

## Validation

```bash
python3 evaluators/tests/test_metrics.py
python3 evaluators/tests/test_suite_recall.py
python3 evaluators/tests/test_trace_mask.py
```

The CodeNet100 reference results use a separate legacy score schema and are
aggregated by `scripts/reproduce_codenet_results.py`; do not mix those values
with the realworld93 leaderboard.
