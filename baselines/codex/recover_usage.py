#!/usr/bin/env python3
"""Recover and normalize Codex token usage from archived transcripts."""

from __future__ import annotations

import argparse
import importlib.util
import json
from pathlib import Path


HERE = Path(__file__).resolve().parent
PROJECT_ROOT = HERE.parents[1]
DEFAULT_RESULTS = PROJECT_ROOT / "results" / "codex_results"

_SPEC = importlib.util.spec_from_file_location(
    "_adb_codex_usage_worker", HERE / "worker.py")
worker = importlib.util.module_from_spec(_SPEC)
_SPEC.loader.exec_module(worker)


def read_jsonl(path):
    return [json.loads(line) for line in path.read_text(
        encoding="utf-8").splitlines() if line.strip()]


def write_jsonl(path, rows):
    path.write_text("".join(
        json.dumps(row, ensure_ascii=False) + "\n" for row in rows),
        encoding="utf-8")


def transcript_index(dataset):
    indexed = {}
    for root in (dataset / "transcripts", dataset / "_archive" / "transcripts"):
        if not root.is_dir():
            continue
        for path in root.rglob("*.json"):
            try:
                transcript = json.loads(path.read_text(encoding="utf-8"))
                mtime = path.stat().st_mtime
            except (OSError, ValueError, TypeError):
                continue
            build_id = transcript.get("build_id")
            if not isinstance(build_id, str):
                continue
            if build_id not in indexed or mtime >= indexed[build_id][0]:
                indexed[build_id] = (mtime, transcript)
    return {key: value[1] for key, value in indexed.items()}


def recover_rows(rows, transcripts):
    output = []
    statuses = {}
    for original in rows:
        row = json.loads(json.dumps(original))
        cost = row.setdefault("cost", {})
        transcript = transcripts.get(row.get("build_id"))
        passes = int(cost.get("passes") or 1)
        usage = {}
        if transcript:
            tail = ((transcript.get("metadata") or {}).get("stdout_tail") or "")
            usage = worker.usage_from_output(tail)
        if passes == 1 and usage:
            cost.update(usage)
            cost["usage_source"] = "codex.turn.completed"
            status = "exact"
        elif all(isinstance(cost.get(key), (int, float))
                 for key in ("prompt_tokens", "completion_tokens")):
            # Historical prompt_tokens is billed input including cache.
            cost["total_tokens"] = int(
                cost["prompt_tokens"] + cost["completion_tokens"])
            status = (
                "total_exact_cache_split_unavailable"
                if passes > 1 else "total_exact_details_missing")
        else:
            status = "usage_unavailable"
        cost["usage_recovery_status"] = status
        statuses[status] = statuses.get(status, 0) + 1
        output.append(row)
    return output, {"records": len(rows), "statuses": statuses}


def recover_dataset(dataset):
    transcripts = transcript_index(dataset)
    report = {
        "dataset": str(dataset),
        "transcripts_indexed": len(transcripts),
        "outputs": {},
    }
    for name in ("predictions.jsonl", "scores.jsonl"):
        source = dataset / name
        if not source.is_file():
            continue
        rows, summary = recover_rows(read_jsonl(source), transcripts)
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
    args = parser.parse_args()
    reports = [
        recover_dataset(args.results_root / name)
        for name in ("jsob", "vm")
        if (args.results_root / name).is_dir()
    ]
    print(json.dumps(reports, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
