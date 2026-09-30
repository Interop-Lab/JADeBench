# Benchmark data

The versioned public benchmark is [`realworld104`](realworld104/): 104 aligned
real-world JavaScript subjects, each released as an original bundle, a
JavaScript Obfuscator build, and a VM-protected build.

The paper's [`codenet100`](codenet100/) reference benchmark is also included:
100 IBM Project CodeNet programs with test cases, JavaScript Obfuscator full
builds, C77-0 builds, and the selection record used for comparison with
JsDeObsBench. It is reported separately because it uses competitive-programming
tasks and a legacy evaluator schema.

`samples/diverse6` remains the small integration fixture used by CI. It is not
the dataset used for the released performance results.

The larger 171-subject construction corpus and 1,295-build registry under
`corpus/` and `obfuscators/` document how the benchmark was constructed. They
are not the denominator of the v0.1 leaderboard. This distinction is deliberate:

- **104 subjects**: paired, fully materialized public evaluation dataset;
- **100 CodeNet subjects**: fully materialized legacy/reference comparison;
- **171 subjects**: corpus-construction population;
- **1,295 builds**: admitted open-source transformation registry across
  configurations, retained as metadata for construction analysis;
- **6 subjects**: fast smoke-test fixture only.

See [`realworld104/README.md`](realworld104/README.md) and
[`codenet100/README.md`](codenet100/README.md) for their distinct schemas,
results, and intended comparisons.
