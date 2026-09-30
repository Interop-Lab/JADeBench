# Corpus metadata and tooling

This directory contains corpus-construction code and release metadata for the
screened `realworld93` benchmark.

## Released manifests

- `manifest.jsonl`: the 93 retained subjects, in stable public-ID order.
- `manifest.execution_ready.jsonl`: 63 retained subjects that passed the older
  sandbox execution-readiness snapshot. This is diagnostic metadata, not the
  public benchmark denominator.
- `tools/` and `scripts/`: extraction, bundling, and validation utilities.

The authoritative publication dataset is
[`../benchmark/realworld93`](../benchmark/realworld93/). Its
`subject_paths.txt` records the final screen, and its manifests point only to
files included in the release.

Historical aggregate statistics from the pre-screen construction population
are intentionally omitted: mixing them with the final 93-subject release would
make denominators ambiguous. Re-run the construction scripts to produce new
statistics for a modified corpus.

Project checkouts, dependency trees, caches, generated sandboxes, credentials,
and machine-specific paths are not distributed.
