# diverse6 sample

`diverse6` is a compact integration sample, not the population used for
headline benchmark results. It contains six subjects selected from the
93-subject paired dataset to cover multiple domains, runtimes, and module
formats.

## Contents

```text
builds.jsonl             12 inputs: JS-OB full and VM L1 for each subject
corpus/manifest.jsonl    six subject records with local bundle paths
corpus/subjects/         clean reference bundles
corpus/jsob/             JavaScript Obfuscator inputs
corpus/vm/               VM-obfuscated inputs
corpus/work/             only the source modules needed for evaluator metadata
sandbox/                 six generated agent/oracle views and indexes
predictions/identity.jsonl
licenses/                copied upstream MIT license texts
```

The identity predictions return each obfuscated build unchanged. They exist
only to verify the evaluator pipeline.

## Static smoke test

From the repository root:

```bash
ADB_CORPUS="$PWD/samples/diverse6/corpus" \
python3 evaluators/score.py \
  --manifest samples/diverse6/corpus/manifest.jsonl \
  --builds samples/diverse6/builds.jsonl \
  --predictions samples/diverse6/predictions/identity.jsonl \
  --out /tmp/agentdeobfbench-smoke.jsonl \
  --no-execution
```

## Execution setup

The tracked sandboxes exclude `node_modules`. Install their locked dependency
trees with:

```bash
python3 scripts/setup_sample.py --execute
```

The release adds a generated lock file for the one selected upstream project
that did not ship one. Static scoring remains the reproducible default because
the optional upstream test trees contain old dependencies and may emit npm
audit findings; run execution scoring only in an isolated environment.

Set both roots when using the execution evaluator:

```bash
export ADB_CORPUS="$PWD/samples/diverse6/corpus"
export ADB_SANDBOX="$PWD/samples/diverse6/sandbox"
```

The sample preserves transformed upstream code and tests. Its copied MIT
licenses and pinned revisions are listed in `THIRD_PARTY_NOTICES.md`.
License texts are also placed beside each retained source module under
`corpus/work/<project>/LICENSE`.

`adb-086` (`spite/ccapture.js`) has a red reference suite: the recorded
reference exits non-zero. It remains usable because admission and execution
scoring use a differential oracle—the transformed program must match the same
reference outcome. Do not reinterpret `suite_green: false` as a missing oracle
or as a deobfuscation-system failure.

For this paired sample, `builds.jsonl` and the manifests under `corpus/jsob`
and `corpus/vm` are authoritative. Two selected JS-OB full builds were not
registered in the separate 805-row open-source ladder manifest, so consumers
must not reconstruct diverse6 membership by filtering that full registry.
