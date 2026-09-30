#!/usr/bin/env python3
"""Recover Claude Code token usage from archived transcript result events.

The canonical result files are never modified.  Recovered copies are written
next to them as ``*.usage_recovered.jsonl``.  Only single-pass records with a
final ``result.modelUsage`` object are replaced; multi-pass records cannot be
reconstructed exactly because transcripts retain stdout for the last pass.
"""

from __future__ import annotations

import argparse
import importlib.util
import json
from pathlib import Path


HERE = Path(__file__).resolve().parent
PROJECT_ROOT = HERE.parents[1]
DEFAULT_RESULTS = PROJECT_ROOT / "results" / "claude_code_results"

_WORKER_SPEC = importlib.util.spec_from_file_location(
    "_adb_claude_usage_worker", HERE / "worker.py")
worker = importlib.util.module_from_spec(_WORKER_SPEC)
_WORKER_SPEC.loader.exec_module(worker)


def read_jsonl(path: Path) -> list[dict]:
    return [
        json.loads(line)
        for line in path.read_text(encoding="utf-8").splitlines()
        if line.strip()
    ]


def write_jsonl(path: Path, rows: list[dict]) -> None:
    path.write_text(
        "".join(json.dumps(row, ensure_ascii=False) + "\n" for row in rows),
        encoding="utf-8",
    )


def transcript_index(dataset: Path) -> dict[str, dict]:
    indexed = {}
    roots = (
        dataset / "transcripts",
        dataset / "_archive" / "transcripts",
    )
    for root in roots:
        if not root.is_dir():
            continue
        for path in root.rglob("*.json"):
            try:
                transcript = json.loads(path.read_text(encoding="utf-8"))
            except (OSError, ValueError, TypeError):
                continue
            build_id = transcript.get("build_id")
            if not isinstance(build_id, str):
                continue
            try:
                mtime = path.stat().st_mtime
            except OSError:
                mtime = 0
            previous = indexed.get(build_id)
            if previous is None or mtime >= previous["_mtime"]:
                indexed[build_id] = {
                    "_mtime": mtime,
                    "_path": str(path),
                    "transcript": transcript,
                }
    return indexed


def final_model_usage(transcript: dict) -> dict:
    tail = ((transcript.get("metadata") or {}).get("stdout_tail") or "")
    recovered = {}
    for line in tail.splitlines():
        try:
            event = json.loads(line)
        except (ValueError, TypeError):
            continue
        if event.get("type") != "result":
            continue
        usage = worker._usage_from_model_map(event.get("modelUsage"))
        if usage:
            recovered = usage
    return recovered


def recover_rows(rows: list[dict], transcripts: dict) -> tuple[list[dict], dict]:
    output = []
    statuses = {}
    unresolved = []
    old_total = 0
    new_total = 0
    for original in rows:
        row = json.loads(json.dumps(original))
        cost = row.setdefault("cost", {})
        build_id = row.get("build_id")
        passes = int(cost.get("passes") or 1)
        status = "exact"
        usage = {}
        indexed = transcripts.get(build_id)
        if passes != 1:
            status = "multi_pass_not_exactly_recoverable"
        elif indexed is None:
            status = "transcript_missing"
        else:
            usage = final_model_usage(indexed["transcript"])
            if not usage:
                status = "final_model_usage_missing"

        if status == "exact":
            if isinstance(cost.get("total_tokens"), (int, float)):
                old_total += int(cost["total_tokens"])
            new_total += int(usage["total_tokens"])
            for key in (
                "prompt_tokens",
                "completion_tokens",
                "cache_read_tokens",
                "cache_write_tokens",
                "total_tokens",
            ):
                cost[key] = usage[key]
            cost["usage_source"] = "claude_result.modelUsage"
            cost["usage_recovery_status"] = status
        else:
            cost["usage_recovery_status"] = status
            unresolved.append(build_id)
        statuses[status] = statuses.get(status, 0) + 1
        output.append(row)
    return output, {
        "records": len(rows),
        "statuses": statuses,
        "unresolved_build_ids": unresolved,
        "original_total_tokens_on_recovered_records": old_total,
        "recovered_total_tokens": new_total,
    }


def recover_dataset(dataset: Path) -> dict:
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
        encoding="utf-8",
    )
    report["report_path"] = str(report_path)
    return report


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--results-root", type=Path, default=DEFAULT_RESULTS,
        help="directory containing jsob/ and vm/ Claude Code results",
    )
    args = parser.parse_args()
    reports = []
    for name in ("jsob", "vm"):
        dataset = args.results_root / name
        if dataset.is_dir():
            reports.append(recover_dataset(dataset))
    print(json.dumps(reports, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
