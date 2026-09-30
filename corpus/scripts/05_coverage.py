#!/usr/bin/env python3
"""Stage 5 — Workload and coverage, and the oracle gate.

Runs *only the subject's own test file* under c8, requires it to pass, and
records coverage of the subject module.

Running the single relevant test file rather than the whole project suite is
deliberate. The oracle a subject needs is its own test file, and a stale
snapshot in an unrelated module says nothing about it; gating on the whole
suite would discard healthy subjects for their neighbours' failures. Stage 2
already established that the project's toolchain assembles correctly.

Coverage bounds what dynamic evidence can supply: a region no workload reaches
stays as opaque to an executing agent as it was statically, so a subject whose
tests barely touch it cannot separate "the agent failed to recover this" from
"the agent never saw it".

Usage:
    python3 scripts/05_coverage.py [--jobs 4]
"""
import argparse
import json
import os
import re
import shlex
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from lib import (RAW, Attrition, load_config, log, read_jsonl, specialize,
                 write_jsonl)

STAGE = "05_coverage"

def pct(covered, total):
    return round(covered / total, 4) if total else 0.0


def coverage_one(sub, cfg):
    proj_dir = Path(sub["bundle_path"]).parent
    # locate the checkout for this subject's project
    from lib import WORK
    root = WORK / sub["project"].replace("/", "__")
    if not root.exists():
        return sub["subject_id"], None, "project_checkout_missing"

    out_dir = root / ".adb-coverage" / sub["subject_id"].replace("/", "_")[-80:]
    env_prefix, inner = specialize(sub.get("runner_invocation"),
                                   sub.get("test_runner"), sub["test_file"])
    # Env assignments must lead the whole command, ahead of the coverage wrapper.
    cmd = (f"{env_prefix} npx --yes c8 --reporter=json-summary --reporter=none "
           f"--report-dir={shlex.quote(str(out_dir))} "
           f"--include {shlex.quote(sub['module'])} {inner}").strip()

    # npm puts the project's node_modules/.bin on PATH when it runs a script.
    # Invoking the command directly skips that step, so a bare `mocha` or
    # `jest` would not resolve; reproduce it here.
    env = {**os.environ, "CI": "1",
           "PATH": f"{root / 'node_modules' / '.bin'}{os.pathsep}{os.environ.get('PATH', '')}"}
    try:
        p = subprocess.run(cmd, cwd=root, shell=True, capture_output=True,
                           text=True, timeout=cfg.get("timeout_sec", 900), env=env)
    except subprocess.TimeoutExpired:
        return sub["subject_id"], None, "coverage_timeout"
    except Exception as exc:  # noqa: BLE001
        return sub["subject_id"], None, f"coverage_error:{exc}"[:200]

    summary = out_dir / "coverage-summary.json"
    if not summary.exists():
        return sub["subject_id"], None, "no_coverage_report"
    try:
        data = json.loads(summary.read_text(encoding="utf-8"))
    except Exception:  # noqa: BLE001
        return sub["subject_id"], None, "bad_coverage_report"

    entry = None
    for key, val in data.items():
        if key == "total":
            continue
        if sub["module"].split("/")[-1] in key:
            entry = val
            break
    entry = entry or data.get("total")
    if not entry:
        return sub["subject_id"], None, "module_not_in_report"

    if cfg.get("require_subject_tests_green", True) and p.returncode != 0:
        return sub["subject_id"], None, "subject_tests_failed"

    cov = {
        "statement": pct(entry["statements"]["covered"], entry["statements"]["total"]),
        "branch": pct(entry["branches"]["covered"], entry["branches"]["total"]),
        "function": pct(entry["functions"]["covered"], entry["functions"]["total"]),
        "line": pct(entry["lines"]["covered"], entry["lines"]["total"]),
        "tests_exit_code": p.returncode,
    }
    return sub["subject_id"], cov, None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--jobs", type=int, default=3)
    args = ap.parse_args()

    cfg = load_config("thresholds.json")["coverage"]
    subs = read_jsonl(RAW / "subjects_deduped.jsonl")
    if not subs:
        log(STAGE, "no deduped subjects — run 04_dedup.py first")
        return

    att = Attrition(STAGE)
    by_id = {s["subject_id"]: s for s in subs}
    kept = []

    log(STAGE, f"measuring coverage for {len(subs)} subjects")
    with ThreadPoolExecutor(max_workers=args.jobs) as pool:
        futs = [pool.submit(coverage_one, s, cfg) for s in subs]
        for fut in as_completed(futs):
            sid, cov, err = fut.result()
            if err:
                att.drop(sid, err)
                continue
            if cov["statement"] < cfg["min_statement_coverage"]:
                att.drop(sid, "coverage_below_threshold", cov["statement"])
                continue
            s = dict(by_id[sid])
            s["coverage"] = cov
            kept.append(s)

    write_jsonl(RAW / "subjects_with_coverage.jsonl", kept)
    att.save()
    if kept:
        med = sorted(s["coverage"]["statement"] for s in kept)[len(kept) // 2]
        log(STAGE, f"{len(kept)} subjects with coverage, median statement {med:.1%}")


if __name__ == "__main__":
    main()
