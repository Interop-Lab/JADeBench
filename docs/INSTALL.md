# Installation

## Core evaluator

Use Python 3.9 or newer and Node.js 22:

```bash
python3 -m venv .venv
source .venv/bin/activate
python3 -m pip install -r evaluators/requirements.txt
npm ci --prefix corpus/tools
```

The Python requirements pin tree-sitter versions used by the released
evaluator schema. `corpus/tools` supplies esbuild for execution instrumentation.

## Optional components

```bash
npm ci --prefix obfuscators/tools
npm ci --prefix baselines/static_tools
python3 scripts/setup_sample.py --execute
```

Install only the components needed for a run. The sample setup command installs
dependencies inside ignored `node_modules` directories.

Model and shipped-agent baselines have separate product requirements. Their
example configurations name environment variables; they do not contain
credentials. Review a command in preview mode before adding `--execute`.

JSIMPLIFIER is not vendored. Obtain and license-review it separately, install
its dependencies, then set:

```bash
export ADB_JSIMPLIFIER=/absolute/path/to/JSIMPLIFIER
```

The 93-subject paired benchmark and released results are part of the Git
checkout. Project-specific dependency trees and full execution sandboxes are
separate; see `DATA_RELEASE.md`.
