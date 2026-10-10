# Reproducing JADeBench results

## Verify the final paper archive

```bash
python3 scripts/reproduce_results.py --check
python3 scripts/audit_rq4_cost.py
python3 scripts/check_repository.py
python3 scripts/check_release_safety.py
```

The first command validates 2,046 JADeBench result records (93 modules × 11 systems × two protections), checks every released candidate's SHA-256, validates the separate 651-cell RQ1 comparison, and verifies the generated leaderboards. Remove `--check` to regenerate `results/leaderboard.{json,md}` and the RQ1 table. All released per-output means must round to the final manuscript's Table RQ2 values in `results/paper/manuscript_table.json`. Run `PYTHONHASHSEED=0 python3 scripts/audit_codebleu_r.py` to recompute the 69 parser-valid outputs that fail the broader Syntax axis, or add `--all` to recompute every JADeBench CodeBLEU-R value.

Run `python3 scripts/audit_rq4_cost.py` to recompute all 18 RQ4 rows from 1,674 released attempt records; pass `--check-workspace /path/to/FSE` to verify the original source archive hashes. Agent token means use 76 JSO/full and 74 VM subjects with complete usage across all five agents, while runtime denominators are recorded separately. The final-paper scores are frozen observations. The 24 older `results/runs` directories contain candidate outputs and historical diagnostic `scores.jsonl` records, but their earlier execution and CodeBLEU metrics are not the final paper results. The separate 100-program CodeNet archive can be checked with `python3 scripts/reproduce_codenet_results.py --check`; its leaderboard is not the paper's 93-program RQ1 comparison.

## Score a new prediction

Install Node.js 22 and the pinned Python packages from `evaluators/requirements.txt`. Use `PYTHONHASHSEED=0` for deterministic CodeBLEU-R data-flow normalization:

```bash
ADB_CORPUS="$PWD/benchmark/realworld93" PYTHONHASHSEED=0 \
python3 evaluators/score.py \
  --manifest benchmark/realworld93/manifest.jsonl \
  --builds benchmark/realworld93/builds-jsob.jsonl \
  --predictions path/to/predictions.jsonl \
  --out path/to/scores.jsonl \
  --no-execution
```

Use `builds-vm.jsonl` for VM candidates. Static scoring needs only the materialized 93-module benchmark. Full execution scoring additionally needs the original project test environments and generated oracle sandboxes. The system view receives the protected module and a public harness; the original and test assertions remain in the oracle view. See `sandbox/README.md` for setup and isolation checks.

## Bundled integration fixture

```bash
ADB_CORPUS="$PWD/samples/diverse6/corpus" PYTHONHASHSEED=0 \
python3 evaluators/score.py \
  --manifest samples/diverse6/corpus/manifest.jsonl \
  --builds samples/diverse6/builds.jsonl \
  --predictions samples/diverse6/predictions/identity.jsonl \
  --out /tmp/jadebench-smoke.jsonl \
  --no-execution
```

The six subjects are a smoke fixture and are not included in paper percentages.
