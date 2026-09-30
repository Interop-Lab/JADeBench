#!/usr/bin/env python3
"""Stage 3 — Subject extraction and realism screening.

Drives tools/subjectgen.mjs over every verified project. That tool builds each
module-rooted bundle and measures it; this script collects the results, applies
the per-project cap, and records why each candidate subject was dropped.

Usage:
    python3 scripts/03_extract_subjects.py [--jobs 4]
"""
import argparse
import json
import subprocess
import sys
import tempfile
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from lib import (RAW, SUBJECTS, TOOLS, Attrition, load_config, log, read_jsonl,
                 write_jsonl)

STAGE = "03_extract_subjects"


def extract_one(proj, domains_by_id):
    """Run the Node extractor for one project, returning its candidate subjects."""
    dom = domains_by_id.get(proj["domain"], {})
    payload = {**proj, "host_api_hints": dom.get("host_api_hints", [])}
    with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False,
                                     encoding="utf-8") as fh:
        json.dump(payload, fh)
        tmp = fh.name
    try:
        p = subprocess.run(
            ["node", str(TOOLS / "subjectgen.mjs"), tmp, str(SUBJECTS)],
            capture_output=True, text=True, timeout=900, cwd=str(TOOLS))
        if p.returncode != 0:
            return proj["id"], [], (p.stderr or "")[-300:]
        rows = [json.loads(l) for l in p.stdout.splitlines() if l.strip()]
        return proj["id"], rows, None
    except subprocess.TimeoutExpired:
        return proj["id"], [], "extractor timeout"
    except Exception as exc:  # noqa: BLE001
        return proj["id"], [], str(exc)[:300]
    finally:
        Path(tmp).unlink(missing_ok=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--jobs", type=int, default=4)
    args = ap.parse_args()

    cfg = load_config("thresholds.json")
    domains = {d["id"]: d for d in load_config("domains.json")["domains"]}
    projects = read_jsonl(RAW / "projects_verified.jsonl")
    if not projects:
        log(STAGE, "no verified projects — run 02_build_verify.py first")
        return

    att = Attrition(STAGE)
    accepted, all_rows = [], []

    log(STAGE, f"extracting subjects from {len(projects)} projects")
    with ThreadPoolExecutor(max_workers=args.jobs) as pool:
        futs = {pool.submit(extract_one, p, domains): p for p in projects}
        for fut in as_completed(futs):
            pid, rows, err = fut.result()
            if err:
                att.drop(pid, "extractor_failed", err)
                continue
            all_rows.extend(rows)
            ok = [r for r in rows if not r.get("rejected")]
            for r in rows:
                if r.get("rejected"):
                    att.drop(r["subject_id"], r["rejected"], r.get("detail"))
            accepted.extend(ok)
            log(STAGE, f"{pid}: {len(ok)} accepted / {len(rows)} candidates")

    write_jsonl(RAW / "subjects_screened.jsonl", accepted)
    write_jsonl(RAW / "subjects_all_candidates.jsonl", all_rows)
    att.save()

    by_dom = {}
    for r in accepted:
        by_dom[r["domain"]] = by_dom.get(r["domain"], 0) + 1
    log(STAGE, f"{len(accepted)} subjects pass the realism screen")
    for d, n in sorted(by_dom.items()):
        log(STAGE, f"  {d:16s} {n:4d}")


if __name__ == "__main__":
    main()
