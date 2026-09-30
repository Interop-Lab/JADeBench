# Obfuscation pipeline

This directory contains the transformation configurations and scripts used to
construct protected JavaScript inputs.

## Public release boundary

The evaluated, materialized inputs are:

- `benchmark/realworld93/jsob_corpus_full/`: 93 JavaScript Obfuscator
  full-minus-protect programs;
- `benchmark/realworld93/vm_corpus/`: 93 aligned VM L1 programs;
- `benchmark/codenet100/jsob-full/` and `c77-0/`: the independent CodeNet
  reference inputs.

`builds/builds.jsonl` retains 805 admitted construction records for 85 of the
93 screened real-world subjects. It documents additional configurations but
does not define the leaderboard denominator and does not imply that every
referenced generated file is shipped.

Historical aggregate statistics from the larger pre-screen population are not
published. The canonical public build indexes are
`benchmark/realworld93/builds-jsob.jsonl` and
`benchmark/realworld93/builds-vm.jsonl`.

## Rebuilding

Configuration files under `config/` and pipeline stages under `scripts/`
describe the transformation process. Rebuilding requires the corresponding
corpus workspaces, tool dependencies, and execution sandboxes; those generated
environments are intentionally excluded from Git.

JavaScript Obfuscator builds used for the primary benchmark disable
`selfDefending` and `debugProtection`, because source-rewriting test runners
would otherwise measure defense activation rather than semantic preservation.
