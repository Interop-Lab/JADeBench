# Final-paper result records

`ja93.jsonl` contains all 2,046 JADeBench system–protection–module cells; `jsdeobsbench93.jsonl` contains the separate 651 RQ1 cells. Values were assembled from the fixed 93-subject analysis records and the DeepSeek-V4-Pro-0813 single-rating archive in the author's replication workspace. Source file SHA-256 values are frozen in `manifest.json`.

`rq4_cost.json` transcribes the final manuscript's Table RQ4 for nine model-based systems under both protections. `rq4_attempts.jsonl` contains all 1,674 source attempt resource records, and `rq4_sources.json` pins the source archive hashes. Run `python3 scripts/audit_rq4_cost.py` to recompute all 18 table rows from those records; add `--check-workspace /path/to/FSE` to verify the original source archive digests.

The reported token means for agents use subjects with complete token usage across all five agents: 76 JSO/full and 74 VM modules. Static GPT-5.6-sol has 92 JSO/full token records; the other static token groups have 93. Runtime uses 93 attempts except Codex JSO/full, which has 76 recorded durations. `rq4_cost.json` gives `attempt_n`, `token_n`, and `runtime_n` for every row. The manuscript's RQ4 caption says all summaries use 93 modules, but that statement does not describe the denominators of the printed numbers; the repository gives the exact sample counts.

All 2,046 JADeBench candidate hashes are checked against `results/runs`, and all 651 RQ1 candidate hashes against the matching `results/codenet100/runs` output. The 2,037 JADeBench candidates with a source readability rating also matched the judge archive's candidate hash. The remaining nine ratings were unavailable. Syntax, execution, CodeBLEU-R, and ROUGE-L have numeric values for every candidate and use all 93 cases per group.

## Aggregate reproduction

`scripts/reproduce_results.py` checks all 2,046 JADeBench output records and verifies that every per-output metric mean rounds to the value printed in the final manuscript's Table RQ2. The displayed aggregates use the paper's precision; the individual scores remain in `ja93.jsonl`.

The source CodeBLEU-R audit had applied the broader Syntax-axis verdict as a zero-score gate. Its `codebleu_status` shows that 69 candidates were actually parser-valid and scored by the underlying CodeBLEU pipeline, despite failing the broader Syntax check (Node loading and/or export preservation). Recomputing those 69 candidates from the released program and original module restores all eleven affected three-decimal paper means. `codebleu_scoring_status` preserves this source classification for each row. Empty or parser-invalid candidates remain zero. Run `PYTHONHASHSEED=0 python3 scripts/audit_codebleu_r.py` to verify the 69 scores and the JSX exception against the released programs; add `--all` for every JADeBench CodeBLEU-R score.

Readability follows the paper's paired-condition comparison: for each system, its JSO/full and VM means use the intersection of subjects with valid ratings in both conditions. `readability_n` is that paired denominator; `readability_rated_n` preserves each protection's complete rating count. For static Kimi, the VM archive contains 93 ratings, including a valid score of 4 for `spite__ccapture.js::src/createMotionBlur.js`. That subject lacks a valid JSO/full rating, so the paired VM mean is 1,638/92 = 17.8043, printed as 17.8. All 93 VM ratings remain in the per-output archive.

`results/runs/*/*/scores.jsonl` records were computed with an earlier scoring policy. Their trace and cost fields can be inspected as historical diagnostics, but the paper's binary complete-workload Execution scores are in `ja93.jsonl`.
