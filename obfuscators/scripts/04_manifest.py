#!/usr/bin/env python3
"""Stage 4 — the tier's deliverable: builds.jsonl and statistics.

builds/builds.jsonl is the interface the evaluators consume (one line per
admitted build, in the flat schema evallib/schema.py expects). Only admitted
builds go in it: a build that does not preserve behavior is not a valid input to
a deobfuscation system. Everything produced — admitted or not — is summarized in
stats/, so the reporting the paper asks for (admission rate per tier, size
inflation and complexity distributions, the threshold-sensitivity curve) is a
by-product of the run rather than a separate accounting.

    python3 04_manifest.py
"""
import json
import re
from collections import Counter, defaultdict

import lib

STAGE = "04_manifest"
IN = lib.RAW / "builds_measured.jsonl"
BUILDS_JSONL = lib.BUILDS / "builds.jsonl"


def pct(xs, p):
    xs = sorted(v for v in xs if v is not None)
    if not xs:
        return None
    k = (len(xs) - 1) * p
    lo, hi = int(k), min(int(k) + 1, len(xs) - 1)
    return round(xs[lo] + (xs[hi] - xs[lo]) * (k - lo), 4)


def dist(xs):
    xs = [v for v in xs if v is not None]
    if not xs:
        return None
    return {"n": len(xs), "median": pct(xs, .5), "p25": pct(xs, .25),
            "p75": pct(xs, .75), "min": round(min(xs), 4), "max": round(max(xs), 4)}


def main():
    rows = lib.read_jsonl(IN)
    if not rows:
        raise SystemExit(f"no input at {IN}; run 03_metrics.py first")

    ladder = list(lib.opensource_config()["tools"]["javascript-obfuscator"]["ladder"])
    admitted = [r for r in rows if r.get("admitted")]

    # --- builds.jsonl: the evaluators' input --------------------------------
    build_records = []
    for r in admitted:
        build_records.append({
            "build_id": r["build_id"], "subject_id": r["subject_id"],
            "tier": r["tier"], "tool": r["tool"], "config_id": r["config_id"],
            "seed": r["seed"], "path": r["path"],
            "module_format": r["module_format"],
            "admit_mode": r.get("admit_mode"),
            "size_inflation": r.get("size_inflation"),
            "complexity": r.get("complexity"),
            "options": r["options"],
        })
    build_records.sort(key=lambda r: (r["subject_id"], r["tool"], r["config_id"]))
    lib.write_jsonl(BUILDS_JSONL, build_records)

    # --- admission: rates and reasons per tool × rung -----------------------
    is_sweep = lambda cid: cid.startswith("sweep:")
    ladder_rows = [r for r in rows if not is_sweep(r["config_id"])]
    admission = {}
    for tool in sorted({r["tool"] for r in ladder_rows}):
        admission[tool] = {}
        for cid in ladder:
            sub = [r for r in ladder_rows if r["tool"] == tool and r["config_id"] == cid]
            if not sub:
                continue
            adm = [r for r in sub if r.get("admitted")]
            admission[tool][cid] = {
                "built": sum(1 for r in sub if r["built"]),
                "admitted": len(adm),
                "admit_rate": round(len(adm) / len(sub), 4),
                "modes": dict(Counter(r.get("admit_mode") for r in adm)),
                "rejections": dict(Counter(r.get("reason") for r in sub if not r.get("admitted"))),
            }

    # Admission broken out by whether the runner transforms source — the
    # dimension the anti rungs turn on.
    by_runner = defaultdict(lambda: {"anti_full_built": 0, "anti_full_admitted": 0})
    for r in ladder_rows:
        if r["config_id"] in ("anti", "full") and r["built"]:
            b = by_runner[r["test_runner"]]
            b["anti_full_built"] += 1
            b["anti_full_admitted"] += 1 if r.get("admitted") else 0

    # --- strength distributions per tool × rung (admitted only) -------------
    strength = {}
    for tool in sorted({r["tool"] for r in admitted}):
        strength[tool] = {}
        for cid in ladder:
            sub = [r for r in admitted if r["tool"] == tool and r["config_id"] == cid]
            if not sub:
                continue
            strength[tool][cid] = {
                "size_inflation": dist([r.get("size_inflation") for r in sub]),
                "complexity": dist([r.get("complexity") for r in sub]),
            }

    # --- threshold sweep curve ---------------------------------------------
    sweep = defaultdict(lambda: defaultdict(lambda: {"inflation": [], "complexity": [], "admitted": 0, "n": 0}))
    for r in rows:
        m = re.match(r"sweep:(\w+)=([0-9.]+)", r["config_id"])
        if not m:
            continue
        axis, pt = m.group(1), float(m.group(2))
        cell = sweep[axis][pt]
        cell["n"] += 1
        if r.get("admitted"):
            cell["admitted"] += 1
            cell["inflation"].append(r.get("size_inflation"))
            cell["complexity"].append(r.get("complexity"))
    sweep_out = {}
    for axis, pts in sweep.items():
        sweep_out[axis] = {}
        for pt in sorted(pts):
            c = pts[pt]
            sweep_out[axis][str(pt)] = {
                "builds": c["n"], "admitted": c["admitted"],
                "size_inflation_median": pct(c["inflation"], .5),
                "complexity_median": pct(c["complexity"], .5),
            }

    summary = {
        "tier": "open-source",
        "tools": {t: lib.opensource_config()["tools"][t]["version"]
                  for t in ("javascript-obfuscator", "js-confuser")},
        "seed": lib.opensource_config()["seed"],
        "subjects": len({r["subject_id"] for r in rows}),
        "builds_total": len(rows),
        "builds_admitted": len(admitted),
        "builds_in_manifest": len(build_records),
        "admit_rate_overall": round(len(admitted) / len(rows), 4),
        "by_tool": {t: sum(1 for r in admitted if r["tool"] == t)
                    for t in sorted({r["tool"] for r in rows})},
        "by_config": {c: sum(1 for r in admitted if r["config_id"] == c)
                      for c in ladder},
        "admit_mode": dict(Counter(r.get("admit_mode") for r in admitted)),
    }

    (lib.STATS / "summary.json").write_text(json.dumps(summary, indent=2, ensure_ascii=False), encoding="utf-8")
    (lib.STATS / "admission.json").write_text(
        json.dumps({"per_tool_config": admission,
                    "anti_full_by_runner": dict(by_runner)}, indent=2, ensure_ascii=False),
        encoding="utf-8")
    (lib.STATS / "strength.json").write_text(json.dumps(strength, indent=2, ensure_ascii=False), encoding="utf-8")
    (lib.STATS / "sweep.json").write_text(json.dumps(sweep_out, indent=2, ensure_ascii=False), encoding="utf-8")

    lib.log(STAGE, f"builds.jsonl: {len(build_records)} admitted builds")
    lib.log(STAGE, f"overall admission {summary['admit_rate_overall']:.1%}; "
                   f"by config: " + ", ".join(f"{c} {summary['by_config'][c]}" for c in ladder))
    lib.log(STAGE, "stats/: summary.json, admission.json, strength.json, sweep.json")


if __name__ == "__main__":
    main()
