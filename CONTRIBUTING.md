# Contributing

Keep source, generated artifacts, and third-party material separate.

## Before opening a change

```bash
python3 scripts/check_repository.py
python3 scripts/check_release_safety.py
python3 scripts/reproduce_results.py --check
python3 evaluators/tests/test_metrics.py
python3 evaluators/tests/test_suite_recall.py
python3 evaluators/tests/test_trace_mask.py
```

Do not commit credentials, local configuration, logs, transcripts, package
environments, or downloaded repositories. Canonical released result trees are
versioned under `results/runs`; local experiments belong outside that tree.
New benchmark programs require a pinned upstream revision, a redistributable
license, copied license text, and an entry in the attribution files.

Changes to evaluator thresholds or semantics must increment the schema version
in `evaluators/config/eval.json` and document score compatibility.

The public `realworld93` benchmark, screened construction metadata,
and six-subject CI fixture serve different purposes. Never silently replace one
population with another in reported results.
