# realworld104

`realworld104` is the complete paired dataset used by the released
AgentDeobfBench v0.1 results. It contains 104 executable JavaScript subjects
from 34 open-source projects.

## Contents

- `original/`: developer-authored, dependency-bundled reference programs.
- `jsob_corpus_full/`: JavaScript Obfuscator 5.5.0 full-minus-protect builds.
- `vm_corpus/`: aligned VM L1 builds.
- `sample_ids.jsonl`: stable `adb-001` through `adb-104` mapping.
- `manifest.jsonl`: evaluator-ready subject manifest.
- `builds-jsob.jsonl`, `builds-vm.jsonl`: evaluator-ready build manifests.
- `builds.jsonl`: both protection families in one 208-row file.
- `attributions.jsonl`, `THIRD_PARTY_NOTICES.md`, `licenses/`: provenance and
  upstream license texts.

All three program directories contain exactly the same 104 subjects. The
mapping must be resolved by `subject_id` and `sample_id`, not by guessing from
flattened filenames.

## Evaluate a prediction set

A prediction file contains one JSON object per line with `prediction_id`,
`sample_id`, `subject_id`, `build_id`, and either `path` or inline `code`.
Static scoring does not require project checkouts or sandboxes:

```bash
ADB_CORPUS="$PWD/benchmark/realworld104" \
python3 evaluators/score.py \
  --manifest benchmark/realworld104/manifest.jsonl \
  --builds benchmark/realworld104/builds-jsob.jsonl \
  --predictions path/to/predictions.jsonl \
  --out path/to/scores.jsonl \
  --no-execution
```

Full execution scoring additionally requires the separately prepared project
test environments described in [`../../docs/DATA_RELEASE.md`](../../docs/DATA_RELEASE.md).
Released execution scores and final system outputs are already available under
[`../../results/runs`](../../results/runs).

## Scope

The JS-OB build disables `selfDefending` and `debugProtection`; otherwise test
runners that rewrite source would measure defense activation instead of
deobfuscation quality. VM L1 is a separate protected representation aligned to
the same original programs.

This directory does not include API transcripts, prompts, checkpoints, logs,
package environments, or provider request identifiers.
