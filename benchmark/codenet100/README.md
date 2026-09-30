# CodeNet100 reference benchmark

This directory releases the 100-program Project CodeNet reference set used for
comparison with JsDeObsBench. It is intentionally separate from the primary
`realworld104` benchmark: CodeNet100 contains competitive-programming solutions,
uses stdin/stdout test cases, and retains the legacy JsDeObsBench-compatible
score schema.

## Contents

```text
originals/                100 original CodeNet JavaScript programs
test_cases/               stdin/stdout test cases for each program
jsob-full/                100 JavaScript Obfuscator 5.5.0 full builds
c77-0/                    100 C77-0 builds
sample_ids.jsonl          codenet-001 ... codenet-100 mapping
manifest.jsonl            program and test-case metadata
builds-jsob-full.jsonl    full-protection build index
builds-c77-0.jsonl        C77-0 build index
selection.json            source selection record
NOTICE                    data provenance and license notice
```

The 100 IDs comprise the original 69-program comparison set plus the documented
31-program extension. `sample_ids.jsonl` is the canonical join table for data,
predictions, and scores.

## Released results

The repository includes 13 historical runs with 1,269 final programs and score
records under `results/codenet100`. Nine systems have a canonical 100-program
full-protection run; two L0 systems also have repeated runs, and two C77-0 runs
are retained. The historical GPT-sol C77-0 run covers 69 programs.

Regenerate the independent CodeNet100 leaderboard with:

```bash
python3 scripts/reproduce_codenet_results.py --check
```

Do not compare its aggregate values directly with `realworld104`: the program
distribution, protection configurations, tests, and evaluator schema differ.

## Provenance and licensing

Program text and test cases originate from IBM Project CodeNet and are provided
under CDLA-Permissive-2.0. Generated protected programs retain those terms. See
`NOTICE` for attribution and source links.

No JsDeObsBench implementation code is vendored. The selection and score schema
are cited for reproducibility; the protected programs and released system
outputs were generated as research artifacts for this benchmark release.
