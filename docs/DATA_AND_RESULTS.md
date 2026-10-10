# Data and result boundaries

JADeBench separates repository-authored source, upstream benchmark
subjects, generated transformations, and system outputs.

## Repository-authored source

The root MIT license covers the orchestration, harness, evaluator, integration,
configuration, and documentation authored for this project. A file with its
own notice follows that notice.

## Full metadata

`corpus/manifest.jsonl` indexes the 93 screened subjects. It records upstream projects,
commits, detected licenses, module/test paths, and bundle metadata.
`obfuscators/builds/builds.jsonl` indexes 805 admitted construction records for
85 of those subjects.

The files referenced by those full manifests are not all present in Git.
Metadata inclusion is not a claim that upstream source has been relicensed or
that the complete benchmark is downloadable before `DATA_RELEASE.md` contains
archive URLs and checksums.

## Public performance benchmark

`benchmark/realworld93` is the materialized, screened v0.1 evaluation dataset.
It includes 93 original programs, 93 JS-OB programs, 93 VM programs, pinned
provenance, and copied upstream license texts. Unlike the broader construction
metadata, every path referenced by its manifests is present in this checkout.

`results/runs` contains the submitted final programs and historical diagnostic
scores. `results/paper/ja93.jsonl` contains the final-paper per-output metrics;
`results/leaderboard.json` reports manuscript Table RQ2 values. Its
CodeBLEU-R means are verified against the complete per-output scores;
Readability uses each system's paired set of rated JSO/full and VM subjects.
The RQ4 attempt-level resource archive in `results/paper/rq4_attempts.jsonl`
reproduces the printed resource table with metric-specific denominators given in
`results/paper/rq4_cost.json`.

## CodeNet100 reference benchmark

`benchmark/codenet100` materializes a historical Project CodeNet
reference set: 100 original programs and test sets, 100 JS-OB/full builds, and 100
C77-0 builds. Project CodeNet data remains under CDLA-Permissive-2.0; no
JsDeObsBench implementation code is included.

`results/codenet100` contains 13 historical runs and 1,269 outputs. The final
paper instead uses a fixed separate 93-program JsDeObsBench subset, recorded
in `results/paper/jsdeobsbench93.jsonl`. The cohorts and scoring schemas must
not be pooled.

## Bundled diverse6 sample

`samples/diverse6` contains six selected subjects and 12 transformed builds.
Each project is pinned to a commit and includes copied MIT license text. The
sample is intended for integration checks and examples, not performance
claims.

The identity prediction set is mechanically derived from the sample inputs. It
contains no model output and is not a baseline result.

## Generated and external material

Do not commit:

- project checkouts, package environments, caches, or generated sandboxes;
- model transcripts, prompts, raw responses, checkpoints, or provider identifiers;
- local absolute paths, credentials, authorization headers, or private URLs;
- commercial binaries or output without explicit redistribution permission;
- external research repositories whose redistribution terms are unresolved.

Canonical final predictions and transformed programs may be published only
with their subject attribution and after upstream and provider terms have been
reviewed. Intermediate responses and reasoning traces are not release results.

## Minimum provenance for a result

Record the source revision, evaluator schema, manifest checksums, selected IDs,
tool/model version, configuration, non-secret command line, and raw per-build
scores. Preserve null and unsupported statuses so infrastructure limits are not
reported as system failures.
