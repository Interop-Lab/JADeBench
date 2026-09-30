#!/usr/bin/env python3
"""Stage 3 — strength metrics: size inflation and structural complexity.

The paper reports, for every admitted build, "size inflation and a structural
complexity score, so tiers can be compared on measured strength rather than on
the names of the tools that produced them" (§3.4). This stage computes both from
the AST (tools/complexity.mjs), against the clean original as the baseline.

Only admitted builds are measured: a build that does not preserve behavior is
not part of the tier, so its complexity is not a property of the tier. The
per-build feature vectors are retained so the model-generated tier's novelty
audit and strength calibration (its Stage 3 counterparts) can compare against
this distribution.

    python3 03_metrics.py [--jobs 8] [--all]   # --all also measures rejected builds
"""
import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed

import lib

STAGE = "03_metrics"
IN = lib.RAW / "builds_admitted.jsonl"
OUT = lib.RAW / "builds_measured.jsonl"

_baseline = {}   # subject_id -> complexity metrics of the clean bundle


def baseline_for(subject):
    sid = subject["subject_id"]
    if sid not in _baseline:
        _baseline[sid] = lib.complexity(lib.CORPUS / subject["bundle_path"],
                                        subject["module_format"])
    return _baseline[sid]


def measure_one(row, base):
    path = lib.BUILDS / row["path"]
    m = lib.complexity(path, row["module_format"])
    if m.get("error"):
        return {**row, "metrics_error": m["error"]}
    inflation = None
    if base and not base.get("error") and base.get("bytes"):
        inflation = round(m["bytes"] / base["bytes"], 4)
    return {**row,
            "size_inflation": inflation,
            "complexity": m.get("complexity"),
            "complexity_delta": (round(m["complexity"] - base["complexity"], 4)
                                 if base and not base.get("error") else None),
            "metrics": {k: m[k] for k in
                        ("bytes", "loc", "ast_nodes", "cyclomatic", "max_depth",
                         "string_literals", "hex_identifiers", "identifiers",
                         "call_expressions", "member_expr", "fn_count")},
            "features": m.get("features")}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--jobs", type=int, default=8)
    ap.add_argument("--all", action="store_true",
                    help="measure rejected builds too (default: admitted only)")
    args = ap.parse_args()

    rows = lib.read_jsonl(IN)
    if not rows:
        raise SystemExit(f"no input at {IN}; run 02_admit.py first")
    subjects = {s["subject_id"]: s for s in lib.load_manifest()}

    targets = [r for r in rows if r.get("admitted") or args.all]
    # Warm the baseline cache single-threaded so the AST of each clean bundle is
    # parsed once, not once per build.
    for sid in {r["subject_id"] for r in targets}:
        baseline_for(subjects[sid])
    lib.log(STAGE, f"measuring {len(targets)} builds "
                   f"({'all' if args.all else 'admitted only'}) "
                   f"against {len(_baseline)} baselines")

    measured = {}
    with ThreadPoolExecutor(max_workers=args.jobs) as pool:
        futs = {pool.submit(measure_one, r, _baseline[r["subject_id"]]): r["build_id"]
                for r in targets}
        for i, fut in enumerate(as_completed(futs), 1):
            res = fut.result()
            measured[res["build_id"]] = res
            if i % 300 == 0:
                lib.log(STAGE, f"  {i}/{len(targets)} measured")

    out = [measured.get(r["build_id"], r) for r in rows]
    lib.write_jsonl(OUT, out)
    ok = sum(1 for r in out if r.get("complexity") is not None)
    lib.log(STAGE, f"measured {ok} builds → {OUT.relative_to(lib.OBF_ROOT)}")


if __name__ == "__main__":
    main()
