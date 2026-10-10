# Benchmark data

The versioned public benchmark is [`realworld93`](realworld93/): 93 aligned
real-world JavaScript subjects, each released as an original bundle, a
JavaScript Obfuscator build, and a VM-protected build.

The historical [`codenet100`](codenet100/) reference benchmark is also included:
100 IBM Project CodeNet programs with test cases, JavaScript Obfuscator full
builds, C77-0 builds, and an earlier selection record. The final paper's RQ1
comparison instead uses a separate fixed 93-program JsDeObsBench cohort in
`results/paper/jsdeobsbench93.jsonl`.

`samples/diverse6` remains the small integration fixture used by CI. It is not
the dataset used for the released performance results.

The construction metadata under `corpus/` is screened to these same 93
subjects. The `obfuscators/` registry retains 805 admitted configuration records
for 85 of them, but it is not the denominator of the v0.1 leaderboard:

- **93 subjects**: screened, paired, fully materialized public evaluation dataset;
- **100 CodeNet subjects**: fully materialized legacy/reference comparison;
- **93 subjects**: screened corpus-construction population;
- **805 builds**: admitted open-source transformation registry across
  configurations, retained as metadata for construction analysis;
- **6 subjects**: fast smoke-test fixture only.

See [`realworld93/README.md`](realworld93/README.md) and
[`codenet100/README.md`](codenet100/README.md) for their distinct schemas,
results, and intended comparisons.
