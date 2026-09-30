#!/usr/bin/env bash
# Corpus pipeline driver. Stages are independent and resumable: each reads the
# previous stage's JSONL and rewrites its own, so a stage can be re-run after a
# threshold change without repeating the expensive ones before it.
#
#   ./run_all.sh                 run every stage
#   ./run_all.sh 3               run from stage 3 onward
#   PILOT=1 ./run_all.sh         small run: 12 projects, for validating the pipeline
set -euo pipefail
cd "$(dirname "$0")"

FROM="${1:-1}"
LIMIT=""
[ "${PILOT:-0}" = "1" ] && LIMIT="--limit 12"

if [ -z "${GITHUB_TOKEN:-}" ]; then
  echo "!! GITHUB_TOKEN is not set: discovery is capped at 60 requests/hour."
  echo "   Export a token before running at full corpus scale."
fi

step() { echo; echo "=== Stage $1: $2 ==="; }

[ "$FROM" -le 1 ] && { step 1 "Collection (discover candidate projects)";      python3 scripts/01_discover.py; }
[ "$FROM" -le 2 ] && { step 2 "Filtering (clone, install, run project tests)"; python3 scripts/02_build_verify.py $LIMIT --jobs 4; }
[ "$FROM" -le 3 ] && { step 3 "Subject extraction and realism screening";      python3 scripts/03_extract_subjects.py --jobs 4; }
[ "$FROM" -le 4 ] && { step 4 "Deduplication";                                 python3 scripts/04_dedup.py; }
[ "$FROM" -le 5 ] && { step 5 "Workload and coverage";                         python3 scripts/05_coverage.py --jobs 3; }
[ "$FROM" -le 6 ] && { step 6 "Manifest, statistics, threshold sensitivity";   python3 scripts/06_manifest.py; }

echo
echo "Done. manifest.jsonl, stats/summary.json, stats/attrition_summary.json"
