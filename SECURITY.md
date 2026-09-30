# Security

Report suspected credential exposure privately to the maintainers before
opening a public issue.

All provider credentials must be supplied through environment variables.
Configuration examples may name an environment variable but must not contain a
token. Run `python3 scripts/check_release_safety.py` before publishing a branch
or archive.

Benchmark programs and agent outputs are untrusted code. Run execution scoring
only in the documented isolated environment, review commands before adding
`--execute`, and never expose credentials to a subject workspace.

## Pinned research dependencies

The frozen evaluator toolchain uses esbuild 0.24.x. npm reports
GHSA-67mh-4wv8-2f99 against that line; the advisory concerns esbuild's
development server accepting cross-origin requests. AgentDeobfBench invokes
the local transform/build CLI and does not start that server. Do not add
`esbuild.serve` or expose a development server from this environment.

Optional diverse6 execution installs the pinned test dependencies of upstream
projects. Some are old and produce npm audit findings. Treat those sandboxes as
untrusted, disposable environments with no credentials or network access.
Static scoring and the default CI do not install those upstream test trees.
