# Released system results

This directory contains final programs and evaluator records for 24 runs over
the 93-subject public benchmark:

- four static LLM runs: DeepSeek, GLM, GPT-sol, and Kimi;
- five shipped coding agents: Claude Code, Codex, Kimi Code, OpenCode, and
  OpenHands;
- three traditional tools: JSIMPLIFIER, Synchrony, and webcrack;
- two protection families per system: JS-OB/full-minus-protect and VM/L1.

Together these runs contain 2,232 final programs and 2,228 score records.

It also contains the paper's independent CodeNet100 reference results:
13 historical runs, 1,269 outputs, and JsDeObsBench-compatible scores under
[`codenet100/`](codenet100/). Nine systems have canonical 100-program
full-protection runs; repeated L0 runs and C77-0 results are retained with
distinct run IDs.

Every run directory contains:

- `run.json`: system, protection, coverage, and evaluator provenance;
- `predictions.jsonl`: sanitized prediction index;
- `scores.jsonl`: canonical per-subject evaluator output;
- `outputs/`: the final returned JavaScript programs.

No prompts, transcripts, checkpoints, logs, API keys, provider request IDs, or
absolute workstation paths are included.

## Reproduce the leaderboard

```bash
python3 scripts/reproduce_results.py --check
python3 scripts/reproduce_codenet_results.py --check
```

Remove `--check` to regenerate [`leaderboard.json`](leaderboard.json) and
[`leaderboard.md`](leaderboard.md) from the per-run scores. The generated
leaderboard reports syntax, execution, exact behavioral agreement,
simplification, and CodeBLEU. Execution correctness is the primary metric.

Null execution values are excluded with their denominator reported explicitly;
they are never silently converted to zero. JSIMPLIFIER has 91 scored records
per protection family because two historical outputs were not evaluated. The
prediction outputs for all 93 subjects are still preserved.

CodeNet100 generates its own
[`codenet100/leaderboard.md`](codenet100/leaderboard.md) and
[`codenet100/leaderboard.json`](codenet100/leaderboard.json). Its execution
and CodeBLEU values use the legacy reference schema and must not be pooled with
the realworld93 leaderboard.

## Interpretation

These runs are released evidence, not a controlled all-else-equal model
comparison. Shipped agents have product-defined tool interfaces and budgets,
while L0 systems receive source only. Use `level`, `model`, `cost`,
`diagnostics`, and status fields when making comparisons.

The manuscript's smaller 10-, 28-, and 69-subject analysis subsets are not
separate benchmark versions. The public leaderboard denominator is always the
stable `adb-001` through `adb-093` mapping.
