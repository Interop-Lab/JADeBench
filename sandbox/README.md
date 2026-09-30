# Execution sandboxes

This directory contains the code used to construct and validate isolated test
environments for execution-correctness scoring.

Generated project sandboxes are not committed. They contain installed
dependencies, are platform-dependent, and execute untrusted JavaScript. The
release instead provides:

- canonical per-subject execution scores under `results/runs/`;
- six small checked-in fixtures under `samples/diverse6/sandbox/`;
- construction and validation scripts in this directory.

The primary public denominator is the 93 screened subjects in
`benchmark/realworld93`. Historical sandbox summaries for larger construction
populations are intentionally omitted to prevent denominator confusion.

For full execution reproduction, build isolated environments from pinned
project revisions and verify their checksums before running candidates. See
[`../docs/REPRODUCING.md`](../docs/REPRODUCING.md) and
[`../docs/DATA_RELEASE.md`](../docs/DATA_RELEASE.md).

Never execute released predictions directly on a host workstation.
