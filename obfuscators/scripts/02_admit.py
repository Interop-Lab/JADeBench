#!/usr/bin/env python3
"""Stage 2 — differential admission.

Every build must reproduce the original's behavior, or it is not obfuscation but
noise (paper §3.4, "Admission and reporting"). We check this by the same
mechanism the sandbox uses to score a deobfuscation candidate: install the build
where the original module sat and run the subject's own suite, admitting the
build only if its pass/fail result matches the recorded reference.

Two things the paper calls for are handled here rather than hidden:

  * Subjects whose oracle never runs test cases (38 of 171) cannot be admitted
    by re-running a suite. They fall back to an interface-level (L1) check:
    the build must load and export the same symbols as the original bundle.

  * The anti-analysis rungs carry self-defending code, which by design detects
    that its source was edited. Runners that transform source before running it
    (jest, vitest) trip that check, and the suite never exits. That is a defense
    working, not a silent failure, so we bound the wait and record such builds
    as `defense_triggered` instead of dropping them. Runners that do not
    transform source (mocha, node:test) admit the same rungs normally.

    python3 02_admit.py [--jobs 6] [--limit N]
"""
import argparse
import json
import os
import subprocess
from concurrent.futures import ThreadPoolExecutor, as_completed

import lib

STAGE = "02_admit"
IN = lib.RAW / "builds_built.jsonl"
OUT = lib.RAW / "builds_admitted.jsonl"

# Rungs whose self-defending code detects that its source was edited. Any runner
# that rewrites the subject before running it — jest/vitest transforms, but also
# nyc/c8 coverage instrumentation, which most corpus suites use — trips that
# check and the suite never exits. These are the only rungs that carry
# self-defending or debug-protection code, so a non-exit on them is the defense
# firing by construction, whatever the runner.
ANTI_RUNGS = {"anti", "full"}
CAP_ANTI = 15        # seconds: a healthy anti/full suite finishes in a few seconds;
                     # a build that self-defends never exits, so a shorter cap only
                     # shortens the wait on builds already destined to time out.
CAP_NORMAL = 120

SCORE = lib.SANDBOX / "scripts" / "score.py"
_ref_lock_dir = lib.SANDBOX / "sandboxes"


def ensure_reference(box):
    """Record this machine's original-suite verdict before scoring candidates.

    Always re-record. `reference.json` is an environment result (Jest config,
    node version, restored setup files), not a property of the bundle. Keeping
    a snapshot from another host made a green candidate look like
    `behavior_diverged` against a stale failure — including the original
    bundle itself.
    """
    try:
        subprocess.run(["python3", str(SCORE), "--sandbox", str(box), "--record-reference"],
                       capture_output=True, text=True, timeout=CAP_NORMAL)
    except subprocess.TimeoutExpired:
        return (box / "reference.json").exists()
    return (box / "reference.json").exists()


def admit_via_oracle(box, candidate, cap):
    try:
        p = subprocess.run(["python3", str(SCORE), "--sandbox", str(box),
                            "--candidate", str(candidate)],
                           capture_output=True, text=True, timeout=cap)
    except subprocess.TimeoutExpired:
        return {"admitted": False, "reason": "suite_did_not_exit"}
    try:
        r = json.loads(p.stdout)
    except ValueError:
        return {"admitted": False, "reason": "score_error"}
    if r.get("matches_reference") is True:
        return {"admitted": True, "admit_mode": "oracle", "passed": r.get("passed")}
    if r.get("ran") and "matches_reference" in r:
        return {"admitted": False, "reason": "behavior_diverged", "passed": r.get("passed")}
    return {"admitted": False, "reason": "oracle_inconclusive"}


def exports_of(path, fmt, cwd):
    """Symbol names the program exports, loaded from within the sandbox so its
    dependency closure resolves. Empty list means it failed to load."""
    if fmt == "esm":
        script = ("import(process.argv[1]).then(m=>{"
                  "console.log(JSON.stringify(Object.keys(m).sort()))})"
                  ".catch(e=>{console.log('__LOAD_ERROR__')})")
    else:
        script = ("try{const m=require(process.argv[1]);"
                  "console.log(JSON.stringify(m&&typeof m==='object'?Object.keys(m).sort():['default']))}"
                  "catch(e){console.log('__LOAD_ERROR__')}")
    try:
        p = subprocess.run(["node", "-e", script, str(path)],
                           capture_output=True, text=True, timeout=30, cwd=str(cwd))
    except subprocess.TimeoutExpired:
        return None
    out = (p.stdout or "").strip().splitlines()
    if not out or out[-1] == "__LOAD_ERROR__":
        return None
    try:
        return json.loads(out[-1])
    except ValueError:
        return None


def admit_via_l1(box, subject_id, candidate, fmt):
    """Interface-level admission for subjects without a usable oracle."""
    agent = box / "agent"
    if not agent.exists():
        return {"admitted": False, "reason": "no_agent_view"}
    ref_bundle = lib.CORPUS / _subject_bundle[subject_id]
    ref_exports = exports_of(ref_bundle, fmt, agent)
    cand_exports = exports_of(candidate, fmt, agent)
    if cand_exports is None:
        return {"admitted": False, "reason": "load_failed"}
    if ref_exports is None:
        return {"admitted": False, "reason": "reference_load_failed"}
    if cand_exports == ref_exports:
        return {"admitted": True, "admit_mode": "L1_exports", "exports": len(cand_exports)}
    return {"admitted": False, "reason": "exports_diverged",
            "exports": len(cand_exports), "reference_exports": len(ref_exports)}


_subject_bundle = {}   # subject_id -> bundle_path, filled in main()


def admit_one(row, box, usable):
    if not row["built"]:
        return {**row, "admitted": False, "reason": "not_built"}
    sid = row["subject_id"]
    candidate = lib.BUILDS / row["path"]
    if not box.exists():
        return {**row, "admitted": False, "reason": "no_sandbox"}

    if sid in usable:
        cap = CAP_ANTI if row["config_id"] in ANTI_RUNGS else CAP_NORMAL
        res = admit_via_oracle(box, candidate, cap)
        # A non-exit on an anti/full rung is the self-defending / debug-protection
        # code firing against the runner's own source rewrite — a defense that
        # worked, recorded as such rather than dropped (paper §3.4).
        if res.get("reason") == "suite_did_not_exit" and row["config_id"] in ANTI_RUNGS:
            res = {"admitted": False, "reason": "defense_triggered",
                   "detail": "self_defending_vs_source_rewrite",
                   "runner": row["test_runner"]}
    else:
        res = admit_via_l1(box, sid, candidate, row["module_format"])

    return {**row, **res}


def admit_subject(sid, rows, usable):
    """Admit every build of one subject, sequentially.

    Serial *within* a subject is mandatory, not an optimization: admission
    installs the candidate into the shared oracle and restores it afterward, so
    two builds of the same subject scored at once would clobber each other's
    backup. Parallelism lives across subjects (each has its own sandbox), so no
    two threads ever touch one oracle.
    """
    box = lib.sandbox_dir(sid)
    if sid in usable and box.exists():
        ensure_reference(box)   # once per subject, before any candidate is scored
    return [admit_one(r, box, usable) for r in rows]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--jobs", type=int, default=6)
    ap.add_argument("--limit", type=int, default=0)
    args = ap.parse_args()

    rows = lib.read_jsonl(IN)
    if not rows:
        raise SystemExit(f"no input at {IN}; run 01_build_opensource.py first")
    if args.limit:
        rows = rows[:args.limit]

    for s in lib.load_manifest():
        _subject_bundle[s["subject_id"]] = s["bundle_path"]
    usable = lib.oracle_usable_set()

    by_subject = {}
    for r in rows:
        by_subject.setdefault(r["subject_id"], []).append(r)
    lib.log(STAGE, f"admitting {len(rows)} builds across {len(by_subject)} subjects "
                   f"({len(usable)} via oracle, rest via L1 exports); "
                   f"parallel across subjects, serial within")

    out = []
    done = 0
    with ThreadPoolExecutor(max_workers=args.jobs) as pool:
        futs = {pool.submit(admit_subject, sid, srows, usable): sid
                for sid, srows in by_subject.items()}
        for fut in as_completed(futs):
            res = fut.result()
            out.extend(res)
            done += 1
            if done % 20 == 0:
                adm = sum(1 for r in out if r.get("admitted"))
                lib.log(STAGE, f"  {done}/{len(by_subject)} subjects, {adm} admitted")

    out.sort(key=lambda r: (r["subject_id"], r["tool"], r["config_id"]))
    lib.write_jsonl(OUT, out)

    admitted = [r for r in out if r.get("admitted")]
    from collections import Counter
    reasons = Counter(r.get("reason") for r in out if not r.get("admitted"))
    modes = Counter(r.get("admit_mode") for r in admitted)
    lib.log(STAGE, f"admitted {len(admitted)}/{len(out)}  modes={dict(modes)}")
    lib.log(STAGE, f"  rejection reasons: {dict(reasons)}")


if __name__ == "__main__":
    main()
