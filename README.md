# AgentDeobfBench

AgentDeobfBench is an executable benchmark for evaluating JavaScript
deobfuscation systems on real-world application code. The repository ships the
benchmark programs, ground truth, released system outputs, fixed evaluators,
baseline adapters, and machine-readable scores.

## At a glance

- **93** aligned real-world JavaScript subjects from **33** projects.
- **2** protection families: JavaScript Obfuscator full-minus-protect and VM L1.
- **12** evaluated systems and **24** released runs.
- **2,232** final deobfuscated programs with per-subject evaluator records.
- A separate **CodeNet100** reference benchmark with **13** historical runs and
  **1,269** released outputs for comparison with JsDeObsBench.
- Execution correctness as the primary metric, plus syntax, simplification,
  similarity, exact behavioral agreement, and cost metadata.

The public performance benchmark is exactly `adb-001` through `adb-093`.
The release metadata is screened to the same 93 subjects; 805 admitted
construction records cover 85 of them. The six-subject `diverse6` fixture is
only for CI.

## Released results

Selected execution-correctness means over the public 93-subject set:

| System | Access | JS-OB | VM L1 |
| --- | --- | ---: | ---: |
| webcrack | traditional | 1.0000 | 1.0000 |
| OpenHands | shipped agent | 0.9411 | 0.8484 |
| Claude Code | shipped agent | 0.8439 | 0.6861 |
| OpenCode | shipped agent | 0.8377 | 0.7054 |
| Kimi Code | shipped agent | 0.8099 | 0.7172 |
| Codex | shipped agent | 0.7285 | 0.7597 |
| GPT-sol | static L0 | 0.5946 | 0.4128 |

See the complete, denominator-aware
[`results/leaderboard.md`](results/leaderboard.md) and machine-readable
[`results/leaderboard.json`](results/leaderboard.json). Regenerate both from
the released `scores.jsonl` files:

```bash
python3 scripts/reproduce_results.py --check
```

The shipped-agent rows are product-defined toolchains, not a controlled
model-only comparison. Null execution records are excluded with the
denominator reported, never converted to zero.

The paper's CodeNet comparison is also released, not just described. Its
independent [CodeNet100 leaderboard](results/codenet100/leaderboard.md) includes
full-protection and C77-0 results. For example, OpenCode scores 0.8800 execution
on the 100-program full set, while the historical GPT-sol C77-0 run scores
0.9565 over its 69-program subset. These values must not be merged with the
realworld93 leaderboard because the data and evaluator schemas differ.

## Five-minute verification

Python 3.9 or newer is sufficient to validate the dataset and published
results:

```bash
python3 scripts/benchmark.py check
python3 scripts/check_repository.py
python3 scripts/check_release_safety.py
python3 scripts/reproduce_results.py --check
python3 scripts/reproduce_codenet_results.py --check
```

For evaluator development, install Node.js 22 and the metric dependencies:

```bash
python3 -m venv .venv
source .venv/bin/activate
python3 -m pip install -r evaluators/requirements.txt
npm ci --prefix corpus/tools
```

Run the deterministic six-subject evaluator smoke test:

```bash
ADB_CORPUS="$PWD/samples/diverse6/corpus" \
python3 evaluators/score.py \
  --manifest samples/diverse6/corpus/manifest.jsonl \
  --builds samples/diverse6/builds.jsonl \
  --predictions samples/diverse6/predictions/identity.jsonl \
  --out /tmp/agentdeobfbench-smoke.jsonl \
  --no-execution
```

## Benchmark data

[`benchmark/realworld93`](benchmark/realworld93/) is self-contained for
static evaluation. The collection protocol, intended use, composition, and
limitations are summarized in [`DATASET_CARD.md`](DATASET_CARD.md).

[`benchmark/codenet100`](benchmark/codenet100/) contains the 100 Project
CodeNet programs, stdin/stdout test cases, JS-OB/full and C77-0 protected
inputs used by the paper's reference comparison. It has its own stable IDs,
results, and leaderboard.

```text
benchmark/realworld93/
├── original/             93 reference programs
├── jsob_corpus_full/     93 JavaScript Obfuscator programs
├── vm_corpus/            93 VM-protected programs
├── manifest.jsonl        evaluator-ready subject records
├── builds-jsob.jsonl     JS-OB build records
├── builds-vm.jsonl       VM build records
├── sample_ids.jsonl      adb-001 ... adb-093 mapping
└── licenses/             upstream license texts
```

Score a new JS-OB prediction set with the static evaluators:

```bash
ADB_CORPUS="$PWD/benchmark/realworld93" \
python3 evaluators/score.py \
  --manifest benchmark/realworld93/manifest.jsonl \
  --builds benchmark/realworld93/builds-jsob.jsonl \
  --predictions path/to/predictions.jsonl \
  --out path/to/scores.jsonl \
  --no-execution
```

Full execution scoring additionally needs project test environments. See
[`docs/REPRODUCING.md`](docs/REPRODUCING.md) and
[`docs/DATA_RELEASE.md`](docs/DATA_RELEASE.md).

## Repository layout

```text
benchmark/       versioned public benchmark programs and provenance
results/         released outputs, scores, and generated leaderboard
baselines/       static, model, and shipped-agent adapters
evaluators/      syntax, execution, simplification, and similarity scoring
corpus/          screened 93-subject construction metadata and tooling
obfuscators/     transformation pipeline and 805-build metadata registry
sandbox/         isolated execution harness and construction code
samples/         small redistributable CI fixture
scripts/         validation and result-reproduction entry points
```

## Scope and current limitations

Version 0.1 reports the materialized 93-subject JS-OB/VM study and existing L0,
traditional, and shipped-agent runs. It does **not** claim completed controlled
L1/L2 capability-ladder experiments, commercial-obfuscator experiments, or
model-generated-obfuscation experiments. Those interfaces remain research
scaffolding until corresponding results are released.

No prompts, transcripts, checkpoints, logs, credentials, package environments,
provider request identifiers, or private workspaces are part of this release.

## Data and licensing

The root MIT license covers repository-authored code and documentation only.
Benchmark programs and generated derivatives retain the licenses of their 33
upstream projects. Subject-level provenance, pinned revisions, and copied
license texts are in
[`benchmark/realworld93/THIRD_PARTY_NOTICES.md`](benchmark/realworld93/THIRD_PARTY_NOTICES.md).

Model and agent outputs may also be subject to provider terms. See
[`docs/DATA_AND_RESULTS.md`](docs/DATA_AND_RESULTS.md) and
[`third_party/THIRD_PARTY_NOTICES.md`](third_party/THIRD_PARTY_NOTICES.md).

## Citation and contributing

Citation metadata is provided in [`CITATION.cff`](CITATION.cff). Replace the
placeholder contributor entry with the archival paper authors and DOI before
the final non-anonymous publication.

Contributions are welcome; read [`CONTRIBUTING.md`](CONTRIBUTING.md) and run
the three verification commands above before opening a pull request.
