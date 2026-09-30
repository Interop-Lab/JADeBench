#!/usr/bin/env python3
"""Recover Kimi Code usage from persisted per-build wire ledgers."""

from __future__ import annotations

import argparse
import importlib.util
import json
import re
from pathlib import Path


HERE = Path(__file__).resolve().parent
PROJECT_ROOT = HERE.parents[1]
DEFAULT_RESULTS = PROJECT_ROOT / "results" / "kimi_code_results"
DEFAULT_HOME = Path.home() / ".cache" / "adb-kimi-home"

_SPEC = importlib.util.spec_from_file_location(
    "_adb_kimi_usage_worker", HERE / "worker.py")
worker = importlib.util.module_from_spec(_SPEC)
_SPEC.loader.exec_module(worker)


def read_jsonl(path):
    return [json.loads(line) for line in path.read_text(
        encoding="utf-8").splitlines() if line.strip()]


def write_jsonl(path, rows):
    path.write_text("".join(
        json.dumps(row, ensure_ascii=False) + "\n" for row in rows),
        encoding="utf-8")


def kimi_home(shared_home, build_id):
    slug = re.sub(
        r"[^A-Za-z0-9._-]+", "_", str(build_id)).strip("._") or "default"
    return shared_home / "runs" / slug[:120] / "kimi-code-home"


def recover_rows(rows, shared_home):
    output = []
    statuses = {}
    for original in rows:
        row = json.loads(json.dumps(original))
        cost = row.setdefault("cost", {})
        usage = worker.usage_from_kimi_home(
            kimi_home(shared_home, row.get("build_id")))
        if usage:
            cost.update(usage)
            cost["usage_source"] = "kimi_session"
            status = "exact"
        else:
            status = "usage_unavailable"
        cost["usage_recovery_status"] = status
        statuses[status] = statuses.get(status, 0) + 1
        output.append(row)
    return output, {"records": len(rows), "statuses": statuses}


def recover_dataset(dataset, shared_home):
    report = {"dataset": str(dataset), "outputs": {}}
    for name in ("predictions.jsonl", "scores.jsonl"):
        source = dataset / name
        if not source.is_file():
            continue
        rows, summary = recover_rows(read_jsonl(source), shared_home)
        target = source.with_name(source.stem + ".usage_recovered.jsonl")
        write_jsonl(target, rows)
        summary["path"] = str(target)
        report["outputs"][name] = summary
    report_path = dataset / "usage_recovery_report.json"
    report_path.write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8")
    report["report_path"] = str(report_path)
    return report


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--results-root", type=Path, default=DEFAULT_RESULTS)
    parser.add_argument("--shared-home", type=Path, default=DEFAULT_HOME)
    args = parser.parse_args()
    reports = [
        recover_dataset(args.results_root / name, args.shared_home)
        for name in ("jsob", "vm")
        if (args.results_root / name).is_dir()
    ]
    print(json.dumps(reports, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
