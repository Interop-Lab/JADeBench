#!/usr/bin/env python3
"""Check that every sandbox can execute its subject, and that it leaks nothing.

Two properties, both of which the benchmark depends on and neither of which
holds by construction:

  Executability — a sandbox that cannot run the code is worthless here, since
  the execution and debugging levels are defined by what a running program
  reveals.

  Isolation — the agent view must not contain the original module, the
  developer's identifiers, the project's tests, or the reference outputs. This
  check exists because an earlier build silently violated it: every sandbox
  carried the oracle test inside the agent's working directory, leaking at
  least three original identifiers each and the original module path in 74% of
  cases. Nothing failed; the corpus was simply invalid. A property with no
  check is a property that does not hold.

Usage:
    python3 scripts/validate.py [--jobs 8] [--limit N] [--debug]
"""
import argparse
import json
import re
import subprocess
import sys
from collections import Counter
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from isolation import check_isolation  # noqa: E402


ROOT = Path(__file__).resolve().parent.parent
BOXES = ROOT / "sandboxes"
STATS = ROOT / "stats"


def classify(err):
    """Group a load failure into an actionable class."""
    if not err:
        return "unknown"
    msg = err.get("message", "") or ""
    code = err.get("code", "") or ""
    if "Dynamic require of" in msg:
        return "cjs_bundled_as_esm"
    if code == "ERR_MODULE_NOT_FOUND" or "Cannot find package" in msg or "Cannot find module" in msg:
        return "missing_dependency"
    if "is not defined" in msg:
        return f"missing_global:{msg.split(' is not defined')[0].strip()}"
    if "Unexpected" in msg or "SyntaxError" in err.get("name", ""):
        return "syntax_error"
    if "jsdom is required" in msg:
        return "jsdom_not_linked"
    return f"other:{msg[:60]}"


def check(box, want_debug):
    meta = json.loads((box / "sandbox.json").read_text(encoding="utf-8"))
    row = {"subject_id": meta["subject_id"], "runtime": meta["runtime"],
           "path": box.name}

    row["isolation_findings"] = check_isolation(box, meta)
    row["isolated"] = not row["isolation_findings"]

    agent = box / meta.get("agent_dir", "agent")
    try:
        p = subprocess.run(["node", "harness/execute.mjs"], cwd=agent,
                           capture_output=True, text=True, timeout=90)
        data = json.loads(p.stdout or "{}")
    except subprocess.TimeoutExpired:
        row.update(loaded=False, failure="timeout")
        return row
    except Exception as exc:  # noqa: BLE001
        row.update(loaded=False, failure=f"harness_crash:{exc}"[:80])
        return row

    if "harness_error" in data:
        row.update(loaded=False, failure=f"harness:{data['harness_error'][:70]}")
        return row

    row["loaded"] = bool(data.get("loaded"))
    row["exports"] = data.get("exports", [])
    row["callable_exports"] = [k for k, v in (data.get("export_kinds") or {}).items()
                               if v == "function"]
    row["events"] = len(data.get("events", []))
    if not row["loaded"]:
        row["failure"] = classify(data.get("load_error"))
        row["error_message"] = (data.get("load_error") or {}).get("message", "")[:160]

    if want_debug and row["loaded"]:
        try:
            d = subprocess.run(["node", "harness/debug.mjs", "--trace-calls", "--max-hits", "1"],
                               cwd=agent, capture_output=True, text=True, timeout=90)
            dd = json.loads(d.stdout or "{}")
            row["debug_ok"] = "harness_error" not in dd
            row["executed_functions"] = len(dd.get("executed_functions", []))
        except Exception:  # noqa: BLE001
            row["debug_ok"] = False
    return row


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--jobs", type=int, default=8)
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--debug", action="store_true",
                    help="also exercise the debugging harness")
    args = ap.parse_args()

    boxes = sorted(d for d in BOXES.iterdir() if (d / "sandbox.json").exists())
    if args.limit:
        boxes = boxes[:args.limit]
    print(f"validating {len(boxes)} sandboxes")

    rows = []
    with ThreadPoolExecutor(max_workers=args.jobs) as pool:
        futs = [pool.submit(check, b, args.debug) for b in boxes]
        for fut in as_completed(futs):
            rows.append(fut.result())

    ok = [r for r in rows if r.get("loaded")]
    bad = [r for r in rows if not r.get("loaded")]
    STATS.mkdir(exist_ok=True)
    with open(STATS / "validation.json", "w", encoding="utf-8") as fh:
        json.dump(sorted(rows, key=lambda r: r["subject_id"]), fh,
                  indent=2, ensure_ascii=False)

    isolated = [r for r in rows if r.get("isolated")]
    print(f"\nisolated: {len(isolated)}/{len(rows)} "
          f"({len(isolated)/max(1,len(rows))*100:.0f}%)")
    if len(isolated) != len(rows):
        leaks = Counter(f.split(":")[0]
                        for r in rows for f in r.get("isolation_findings", []))
        for kind, n in leaks.most_common(6):
            print(f"    {kind}: {n}")
    print(f"loads: {len(ok)}/{len(rows)} ({len(ok)/max(1,len(rows))*100:.0f}%)")
    by_rt = Counter((r["runtime"], bool(r.get("loaded"))) for r in rows)
    for rt in ("node", "browser", "agnostic"):
        t = by_rt[(rt, True)] + by_rt[(rt, False)]
        if t:
            print(f"  {rt:10s} {by_rt[(rt, True)]:3d}/{t:3d}")
    if ok:
        print(f"  with callable exports: {sum(1 for r in ok if r['callable_exports'])}")
    if args.debug:
        print(f"  debugging harness ok:  {sum(1 for r in ok if r.get('debug_ok'))}")
    if bad:
        print(f"\nfailure classes ({len(bad)}):")
        for cls, n in Counter(r.get("failure", "?") for r in bad).most_common(10):
            print(f"  {n:4d}  {cls}")

    # A leak makes every measurement taken from these sandboxes invalid, so it
    # has to fail the run rather than sit in a report nobody reads.
    if len(isolated) != len(rows):
        print("\nFAIL: ground truth is reachable from the agent view")
        sys.exit(1)


if __name__ == "__main__":
    main()
