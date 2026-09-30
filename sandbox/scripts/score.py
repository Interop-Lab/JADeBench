#!/usr/bin/env python3
"""Score a candidate program against a subject's oracle.

The oracle is never placed where the agent works. Scoring instead mounts a
candidate into the oracle view from outside, runs the project's own tests
against it, and compares the result with the reference run of the original.

This direction matters. A developer-written test is at once a driver and a
definition of correctness, written in the developer's own vocabulary, so
showing it to the agent hands over the identifiers it is supposed to recover.
Mounting inward keeps the test usable as an oracle while keeping it secret.

Usage:
    # establish the reference: run the oracle against the original subject
    python3 scripts/score.py --sandbox <dir> --record-reference

    # score a candidate the agent produced
    python3 scripts/score.py --sandbox <dir> --candidate path/to/deobfuscated.js

    # score every sandbox's current agent/ subject (e.g. after obfuscation)
    python3 scripts/score.py --all --jobs 6
"""
import argparse
import json
import os
import re
import shutil
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BOXES = ROOT / "sandboxes"
STATS = ROOT / "stats"

FILE_ARG_RE = re.compile(r"^[^-].*(\*|\.[cm]?[jt]sx?$)|^(test|tests|spec|__tests__)/")

# The project's own test command, narrowed to one file, is assembled by the
# corpus pipeline's implementation rather than a copy of it. This file used to
# carry its own, and the two had already drifted: the copy did not re-quote a
# non-file token containing a space. They agreed on the reviewed corpus snapshot,
# which is exactly why the drift would have gone unnoticed until a project's
# invocation contained one.
def _corpus_specialize():
    path = ROOT.parent / "corpus" / "scripts"
    if str(path) not in sys.path:
        sys.path.insert(0, str(path))
    from lib import specialize as _s
    return _s


specialize = _corpus_specialize()


def run_oracle(box, subject_source, meta):
    """Install `subject_source` into the oracle view and run the tests.

    The oracle view is restored afterwards, so scoring one candidate never
    disturbs the next.
    """
    oracle = box / meta.get("oracle_dir", "oracle")
    # The candidate takes the original module's place, so the project's tests,
    # runner config, and setup files all resolve it without modification.
    entry = meta["oracle"].get("entry") or meta["entry"]
    target = oracle / entry
    target.parent.mkdir(parents=True, exist_ok=True)
    backup = target.with_suffix(target.suffix + ".reference")

    if not meta.get("oracle", {}).get("available"):
        return {"ran": False, "reason": "no_oracle"}

    test_path = meta["oracle"]["test_file"]
    if not (oracle / test_path).exists():
        return {"ran": False, "reason": "oracle_test_missing"}

    had_previous = target.exists()
    if had_previous and not backup.exists():
        shutil.copy2(target, backup)
    target.write_text(subject_source, encoding="utf-8")

    env_prefix, inner = specialize(meta["oracle"].get("invocation"),
                                   meta["oracle"].get("runner"), test_path)
    cmd = f"{env_prefix} {inner}".strip()
    env = {**os.environ, "CI": "1",
           "PATH": f"{oracle / 'node_modules' / '.bin'}{os.pathsep}"
                   f"{ROOT / 'shared' / 'node_modules' / '.bin'}{os.pathsep}"
                   f"{os.environ.get('PATH', '')}"}
    try:
        p = subprocess.run(cmd, cwd=oracle, shell=True, capture_output=True,
                           text=True, timeout=300, env=env)
        out = (p.stdout or "") + "\n" + (p.stderr or "")
        # Decide "suite started" on the full log. output_tail is only a
        # display slice; nyc/istanbul coverage tables at the end can push
        # "Tests:" / "N passing" out of the last 1200 chars and falsely
        # mark a green run as oracle_inconclusive.
        return {"ran": True, "exit_code": p.returncode,
                "passed": p.returncode == 0, "output_tail": out[-1200:],
                "suite_started": suite_started(out)}
    except subprocess.TimeoutExpired:
        return {"ran": True, "exit_code": -1, "passed": False, "reason": "timeout"}
    finally:
        if backup.exists():
            shutil.copy2(backup, target)


SUITE_RAN_RE = re.compile(
    r"#\s*(tests|pass|fail)|\d+\s+(passing|failing)"
    r"|Tests:\s+\d+|Test Files\s+\d+|[✓✗√×]"
    r"|%\s*Stmts|All files\s+\|"
)


def suite_started(output):
    """Did the runner actually execute test cases?

    The distinction decides whether a failing reference run is usable. A suite
    that ran and reported failures still defines behavior: the candidate has to
    reproduce the same outcome. A suite that never started defines nothing, and
    scoring against it would compare two environment errors.
    """
    return bool(SUITE_RAN_RE.search(output or ""))


def write_reference(box, result):
    """Persist this machine's original-suite verdict.

    The snapshot is an environment result, not a property of the bundle: a
    Jest config that failed on one host can pass on another. Admission that
    compared a green candidate to a stale red snapshot would report
    `behavior_diverged` for the original itself.
    """
    started = result.get("suite_started")
    if started is None:
        started = suite_started(result.get("output_tail", ""))
    ref = {
        "passed": result["passed"],
        "exit_code": result["exit_code"],
        "suite_started": started,
        # An oracle is usable when the suite runs, whatever its verdict.
        # Otherwise this subject cannot score anything and is excluded.
        "usable": started,
    }
    (box / "reference.json").write_text(json.dumps(ref, indent=2), encoding="utf-8")
    return ref


def score_one(box, candidate_path=None, record_reference=False):
    meta = json.loads((box / "sandbox.json").read_text(encoding="utf-8"))
    agent = box / meta.get("agent_dir", "agent")
    entry = meta["entry"]

    if candidate_path:
        source = Path(candidate_path).read_text(encoding="utf-8", errors="ignore")
    else:
        src = agent / entry
        if not src.exists():
            return {"subject_id": meta["subject_id"], "error": "agent_subject_missing"}
        source = src.read_text(encoding="utf-8", errors="ignore")

    result = run_oracle(box, source, meta)
    row = {"subject_id": meta["subject_id"], "runtime": meta["runtime"], **result}

    if record_reference and result.get("ran"):
        ref = write_reference(box, result)
        row["suite_started"] = ref["suite_started"]
        row["oracle_usable"] = ref["usable"]
        row["reference_recorded"] = True
    else:
        ref_file = box / "reference.json"
        if ref_file.exists() and result.get("ran"):
            ref = json.loads(ref_file.read_text(encoding="utf-8"))
            row["oracle_usable"] = ref.get("usable", True)
            if ref.get("usable", True):
                # Behavioral equivalence is judged against the original's own
                # result, not against an absolute pass: a subject whose
                # reference run already fails cannot condemn a candidate.
                row["matches_reference"] = result["passed"] == ref["passed"]
                # A snapshot from another machine / older env is not behaviour.
                # If it disagrees with the candidate, re-run the original here
                # and replace the snapshot; only then is a mismatch real.
                if (candidate_path
                        and row["matches_reference"] is False
                        and (agent / entry).exists()):
                    orig = run_oracle(
                        box, (agent / entry).read_text(encoding="utf-8",
                                                       errors="ignore"),
                        meta)
                    if orig.get("ran"):
                        ref = write_reference(box, orig)
                        row["oracle_usable"] = ref.get("usable", True)
                        row["matches_reference"] = (
                            result["passed"] == orig["passed"])
                        row["reference_refreshed"] = True
    return row


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--sandbox", type=str, default="")
    ap.add_argument("--candidate", type=str, default="")
    ap.add_argument("--record-reference", action="store_true")
    ap.add_argument("--all", action="store_true")
    ap.add_argument("--jobs", type=int, default=6)
    ap.add_argument("--limit", type=int, default=0)
    args = ap.parse_args()

    if args.sandbox:
        box = Path(args.sandbox)
        if not box.is_absolute():
            box = BOXES / args.sandbox if not (ROOT / args.sandbox).exists() else ROOT / args.sandbox
        print(json.dumps(score_one(box, args.candidate or None, args.record_reference),
                         indent=2, ensure_ascii=False))
        return

    if not args.all:
        ap.error("give --sandbox <dir> or --all")

    boxes = sorted(d for d in BOXES.iterdir() if (d / "sandbox.json").exists())
    if args.limit:
        boxes = boxes[:args.limit]
    label = "recording references" if args.record_reference else "scoring"
    print(f"{label} for {len(boxes)} sandboxes")

    rows = []
    with ThreadPoolExecutor(max_workers=args.jobs) as pool:
        futs = [pool.submit(score_one, b, None, args.record_reference) for b in boxes]
        for fut in as_completed(futs):
            try:
                rows.append(fut.result())
            except Exception as exc:  # noqa: BLE001
                rows.append({"error": str(exc)[:120]})

    STATS.mkdir(exist_ok=True)
    name = "reference.json" if args.record_reference else "scores.json"
    with open(STATS / name, "w", encoding="utf-8") as fh:
        json.dump(sorted(rows, key=lambda r: r.get("subject_id", "")), fh,
                  indent=2, ensure_ascii=False)

    ran = [r for r in rows if r.get("ran")]
    passed = [r for r in ran if r.get("passed")]
    usable = [r for r in rows if r.get("oracle_usable")]
    print(f"  oracle ran:    {len(ran)}/{len(rows)}")
    print(f"  suite started: {len(usable)}/{len(rows)}   <- usable as an oracle")
    print(f"  reference green:{len(passed)}/{len(ran)}")
    if not args.record_reference:
        m = [r for r in rows if "matches_reference" in r]
        if m:
            print(f"  matches reference: {sum(1 for r in m if r['matches_reference'])}/{len(m)}")
    from collections import Counter
    bad = Counter(r.get("reason", "") for r in rows if not r.get("ran"))
    for reason, n in bad.most_common(5):
        if reason:
            print(f"    {reason}: {n}")


if __name__ == "__main__":
    main()
