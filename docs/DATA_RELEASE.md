# Data release

## Included in this repository

The complete v0.1 performance benchmark is versioned directly in Git:

- 104 original bundles: `benchmark/realworld104/original/`
- 104 JavaScript Obfuscator builds: `benchmark/realworld104/jsob_corpus_full/`
- 104 VM L1 builds: `benchmark/realworld104/vm_corpus/`
- 24 released runs, 2,496 final outputs, and per-subject scores: `results/`
- subject provenance and 34 upstream license texts:
  `benchmark/realworld104/THIRD_PARTY_NOTICES.md`
- CodeNet100 reference data: 100 originals, 100 JS-OB/full builds, 100 C77-0
  builds, and stdin/stdout tests under `benchmark/codenet100/`
- 13 CodeNet100 historical runs with 1,269 outputs and scores under
  `results/codenet100/`

No download is required to inspect the benchmark, reproduce the leaderboard, or
run static scoring.

## Execution environments

Full execution re-scoring requires project test environments and generated
sandboxes. They are not committed because installed dependency trees are large,
platform-dependent, and unsafe to execute without isolation.

An immutable execution-environment archive has not yet been published. Until a
URL and checksum are added here, users can inspect the released execution
records but cannot reproduce every execution score from a clean clone alone.

A future archive must provide:

1. A stable URL and version or DOI.
2. SHA-256 checksums.
3. The source repository revision.
4. The `realworld104` manifest checksum and evaluator schema version.
5. License notes for bundled project tests and dependencies.

## Broader construction artifacts

`corpus/manifest.jsonl` describes a 171-subject construction population and
`obfuscators/builds/builds.jsonl` describes 1,295 admitted open-source builds
across configurations. The generated programs referenced by that broader
registry are not the v0.1 leaderboard dataset and are not all present.

The canonical publishable performance denominator is the materialized,
license-attributed 104-subject paired dataset under `benchmark/realworld104`.
The fully materialized CodeNet100 data is a separately reported reference
benchmark, not an addition to that denominator.

Never publish credentials, logs, transcripts, temporary checkpoints, package
environments, provider request identifiers, or machine-specific absolute paths
as an artifact.
