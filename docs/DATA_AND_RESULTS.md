# Data and result boundaries

AgentDeobfBench separates repository-authored source, upstream benchmark
subjects, generated transformations, and system outputs.

## Repository-authored source

The root MIT license covers the orchestration, harness, evaluator, integration,
configuration, and documentation authored for this project. A file with its
own notice follows that notice.

## Full metadata

`corpus/manifest.jsonl` indexes 171 subjects. It records upstream projects,
commits, detected licenses, module/test paths, and bundle metadata.
`obfuscators/builds/builds.jsonl` indexes 1,295 generated open-source builds.

The files referenced by those full manifests are not all present in Git.
Metadata inclusion is not a claim that upstream source has been relicensed or
that the complete benchmark is downloadable before `DATA_RELEASE.md` contains
archive URLs and checksums.

## Public performance benchmark

`benchmark/realworld104` is the materialized, paired v0.1 evaluation dataset.
It includes 104 original programs, 104 JS-OB programs, 104 VM programs, pinned
provenance, and copied upstream license texts. Unlike the broader construction
metadata, every path referenced by its manifests is present in this checkout.

`results/runs` contains the corresponding released prediction indexes, final
programs, and evaluator records. `results/leaderboard.json` is generated from
those records and is not an independent source of truth.

## CodeNet100 reference benchmark

`benchmark/codenet100` materializes the paper's separate Project CodeNet
comparison: 100 original programs and test sets, 100 JS-OB/full builds, and 100
C77-0 builds. Project CodeNet data remains under CDLA-Permissive-2.0; no
JsDeObsBench implementation code is included.

`results/codenet100` contains 13 historical runs and 1,269 final outputs with
legacy JsDeObsBench-compatible score records. Its generated leaderboard is
independent from realworld104 because the data distribution, tests, protection
configurations, and metric schema differ.

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
