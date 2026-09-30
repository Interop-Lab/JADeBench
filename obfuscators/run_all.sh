#!/usr/bin/env bash
# Open-source obfuscation tier driver (paper §3.4). Stages are independent and
# resumable: each reads the previous stage's JSONL and rewrites its own, so a
# stage can be re-run after a config change without repeating the ones before.
#
#   ./run_all.sh                 run every stage
#   ./run_all.sh 2               run from stage 2 onward (reuse obfuscated builds)
#   PILOT=1 ./run_all.sh         small run: 6 subjects, for validating the pipeline
#
# The other two tiers are separate, runnable-but-not-run scaffolding:
#   python3 scripts/modelgen.py   --help    # model-generated tier (needs an API key)
#   python3 scripts/commercial.py --help    # commercial tier (needs licensed tools)
set -euo pipefail
cd "$(dirname "$0")"

FROM="${1:-1}"
LIMIT=""; NOSWEEP=""
if [ "${PILOT:-0}" = "1" ]; then LIMIT="--limit 6"; NOSWEEP="--no-sweep"; fi

step() { echo; echo "=== Stage $1: $2 ==="; }

[ "$FROM" -le 1 ] && { step 1 "Build (obfuscate across the ladder)"; python3 scripts/01_build_opensource.py $LIMIT $NOSWEEP --jobs 8; }
[ "$FROM" -le 2 ] && { step 2 "Admit (differential test each build)";  python3 scripts/02_admit.py --jobs 6; }
[ "$FROM" -le 3 ] && { step 3 "Metrics (size inflation, complexity)";   python3 scripts/03_metrics.py --jobs 8; }
[ "$FROM" -le 4 ] && { step 4 "Manifest and statistics";                python3 scripts/04_manifest.py; }

echo; echo "Done. builds/builds.jsonl, stats/{summary,admission,strength,sweep}.json"
