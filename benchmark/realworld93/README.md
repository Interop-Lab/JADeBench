# realworld93

`realworld93` is the complete screened dataset used by the released
AgentDeobfBench v0.1 results. It contains 93 executable JavaScript subjects
from 33 open-source projects.

## Contents

- `original/`: developer-authored, dependency-bundled reference programs.
- `jsob_corpus_full/`: JavaScript Obfuscator 5.5.0 full-minus-protect builds.
- `vm_corpus/`: aligned VM L1 builds.
- `sample_ids.jsonl`: stable `adb-001` through `adb-093` mapping.
- `subject_paths.txt`: canonical screened subject list in public ID order.
- `manifest.jsonl`: evaluator-ready subject manifest.
- `builds-jsob.jsonl`, `builds-vm.jsonl`: evaluator-ready build manifests.
- `builds.jsonl`: both protection families in one 186-row file.
- `attributions.jsonl`, `THIRD_PARTY_NOTICES.md`, `licenses/`: provenance and
  upstream license texts.

All three program directories contain exactly the same 93 subjects. The
mapping must be resolved by `subject_id` and `sample_id`, not by guessing from
flattened filenames.

## Evaluate a prediction set

A prediction file contains one JSON object per line with `prediction_id`,
`sample_id`, `subject_id`, `build_id`, and either `path` or inline `code`.
Static scoring does not require project checkouts or sandboxes:

```bash
ADB_CORPUS="$PWD/benchmark/realworld93" \
python3 evaluators/score.py \
  --manifest benchmark/realworld93/manifest.jsonl \
  --builds benchmark/realworld93/builds-jsob.jsonl \
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
