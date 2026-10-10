# Results

`paper/ja93.jsonl` is the per-output release for the final manuscript: 93 modules × 11 systems × JSO/full and VM = 2,046 records. `paper/jsdeobsbench93.jsonl` holds the separate 93-program, seven-system RQ1 comparison. Each record contains binary Syntax and complete-workload Execution correctness, CodeBLEU-R, ROUGE-L, and an optional Readability rating. The candidate SHA-256 joins each JADeBench record to its program in `runs/`.

Run `python3 scripts/reproduce_results.py --check` to validate the cohorts, verify all 2,046 candidate hashes, and check the generated [leaderboard](leaderboard.md). Remove `--check` to regenerate it. Readability covers 2,037/2,046 JADeBench cells and 651/651 RQ1 cells; missing ratings are null, never zero.

The `runs/*/*/scores.jsonl`, `manifest.json`, and `codenet100/` files remain historical archives from an earlier evaluator and larger 100-program reference set. Their execution score and CodeBLEU3/standard-CodeBLEU values must not be presented as final-paper measurements.

The public leaderboard follows the final manuscript table, and the per-output scores reproduce every reported RQ2 mean at its published precision. RQ4's 1,674 attempt records and exact token/runtime denominators are in `paper/rq4_attempts.jsonl` and `paper/rq4_cost.json`. See [paper/README.md](paper/README.md) for scoring provenance.
