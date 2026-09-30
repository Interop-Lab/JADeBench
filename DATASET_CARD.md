# AgentDeobfBench dataset card

## Dataset summary

AgentDeobfBench `realworld93` is a screened, paired JavaScript deobfuscation
benchmark containing 93 executable application modules from 33 open-source
projects.
Each subject has three aligned forms:

1. the original dependency-bundled program;
2. a JavaScript Obfuscator 5.5.0 full-minus-protect program;
3. a VM L1 protected program.

Stable identifiers `adb-001` through `adb-093` join programs, predictions, and
scores across the repository.

The release also contains `codenet100`, a distinct 100-program Project CodeNet
reference set used for comparison with JsDeObsBench. Stable IDs
`codenet-001` through `codenet-100` join its original programs, stdin/stdout
tests, two protected variants, predictions, and legacy score records.

## Intended use

The dataset supports evaluation of systems that return one
behavior-preserving, readable JavaScript program for each protected input.
Execution correctness is the primary metric. Syntax, simplification,
similarity, exact behavioral agreement, and resource usage provide diagnostic
signals.

The dataset is intended for research on deobfuscation, program understanding,
software-engineering agents, and program-analysis tooling. It is not a security
certification and does not show that any protection resists every analyst.

## Data composition

- Subjects: 93
- Projects: 33
- Protection families: 2
- Protected programs: 186
- Released evaluated runs: 24
- Released final system outputs: 2,232
- Upstream subject licenses: 86 MIT, 6 ISC, 1 BSD-3-Clause

CodeNet100 adds 100 original programs, 200 protected programs, 13 historical
runs, and 1,269 outputs/scores. It is not included in any realworld93 count or
aggregate. CodeNet program text and tests retain CDLA-Permissive-2.0 terms.

The construction metadata has been screened to the same 93 subjects. The
six-subject CI fixture is separate and is not a performance denominator.

## Data fields

`benchmark/realworld93/sample_ids.jsonl` is the canonical join table. Important
fields include:

- `sample_id`: stable public identifier;
- `subject_id`: project and module identity;
- `original_file`: reference bundle;
- `jsob_file`, `jsob_build_id`: JS-OB input identity;
- `vm_file`, `vm_build_id`: VM input identity.

Evaluator-ready records are in `manifest.jsonl`, `builds-jsob.jsonl`, and
`builds-vm.jsonl`. Released prediction and score schemas are documented in
`evaluators/evallib/schema.py`.

For CodeNet100, `benchmark/codenet100/sample_ids.jsonl` is the join table;
`manifest.jsonl`, `builds-jsob-full.jsonl`, and `builds-c77-0.jsonl` describe
programs and inputs. Its historical scores use `syntax_pass`, `exe_pass`, and
`codebleu` fields and have a separate leaderboard.

## Collection and processing

Subjects were selected from real-world open-source JavaScript projects, pinned
to repository commits, bundled with first-party dependencies, protected, and
admitted only after alignment and execution-gate checks. JS-OB programs disable
self-defense and debug protection because source-rewriting test runners would
otherwise measure defense activation instead of semantic preservation.

The final publication screen retained 93 of 104 materialized candidates. The
canonical retained paths and order are recorded in
`benchmark/realworld93/subject_paths.txt`; excluded candidates and their results
are not part of this release.

## Limitations

- The dataset contains open-source projects and may not represent proprietary
  production JavaScript.
- Project size, domain, runtime, and test quality vary.
- Released runs use different tool interfaces and budgets; leaderboard values
  are not automatically controlled model comparisons.
- Two JSIMPLIFIER outputs per protection family lack historical score records.
- Full execution re-scoring requires project test environments not committed to
  Git.
- Controlled L1/L2, commercial, and model-generated protection studies are not
  part of v0.1.
- CodeNet100 and realworld93 have different task distributions, protection
  configurations, test harnesses, and evaluator schemas; cross-dataset rank
  comparisons are not controlled.

## Licensing and sensitive information

Repository-authored code is MIT licensed. Subject programs and their generated
derivatives retain upstream terms. Pinned revisions and license texts are in
`benchmark/realworld93/THIRD_PARTY_NOTICES.md`.
Project CodeNet artifacts are separately attributed in
`benchmark/codenet100/NOTICE`.

The release excludes credentials, prompts, transcripts, logs, checkpoints,
provider request identifiers, installed dependencies, and absolute workstation
paths. Released outputs should still be treated as untrusted code.
