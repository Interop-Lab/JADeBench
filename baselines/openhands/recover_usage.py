#!/usr/bin/env python3
"""Recover OpenHands usage from persisted conversation state ledgers."""

from __future__ import annotations

import argparse
import importlib.util
import json
from pathlib import Path


HERE = Path(__file__).resolve().parent
PROJECT_ROOT = HERE.parents[1]
DEFAULT_RESULTS = PROJECT_ROOT / "results" / "openhands_results"
DEFAULT_HOME = Path.home() / ".cache" / "adb-openhands-home"

_SPEC = importlib.util.spec_from_file_location(
    "_adb_openhands_usage_worker", HERE / "worker.py")
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
            workspace = transcript.get("workspace")
            if not isinstance(build_id, str) or not isinstance(workspace, str):
                continue
            if build_id not in indexed or mtime >= indexed[build_id][0]:
                indexed[build_id] = (mtime, workspace)
    return {key: value[1] for key, value in indexed.items()}


def ledger_index(home):
    indexed = {}
    root = home / ".openhands" / "conversations"
    if not root.is_dir():
        return indexed
    for state_path in root.glob("*/base_state.json"):
        try:
            state = json.loads(state_path.read_text(encoding="utf-8"))
        except (OSError, ValueError, TypeError):
            continue
        workspace = worker._conversation_workspace(state)
        if not workspace:
            continue
        try:
            workspace = str(Path(workspace).resolve())
        except (OSError, TypeError):
            workspace = str(workspace)
        stats = state.get("stats") or {}
        metrics = (
            stats.get("usage_to_metrics") if isinstance(stats, dict) else {})
        piece = worker._usage_from_metrics_map(metrics)
        if not piece:
            continue
        combined = indexed.setdefault(workspace, {})
        for key, value in piece.items():
            worker._add_int(combined, key, value)
    return {
        workspace: worker._finalize_usage(
            usage, prompt_includes_cache=True)
        for workspace, usage in indexed.items()
    }


def recover_rows(rows, transcripts, ledgers):
    output = []
    statuses = {}
    for original in rows:
        row = json.loads(json.dumps(original))
        cost = row.setdefault("cost", {})
        workspace = transcripts.get(row.get("build_id"))
        try:
            resolved = str(Path(workspace).resolve()) if workspace else ""
        except (OSError, TypeError):
            resolved = str(workspace or "")
        usage = ledgers.get(resolved)
        if usage:
            cost.update(usage)
            cost["usage_source"] = "openhands_conversation"
            status = "exact_from_persisted_ledger"
        elif isinstance(cost.get("total_tokens"), (int, float)):
            status = "preserved_existing_exact"
        else:
            status = "usage_unavailable"
        cost["usage_recovery_status"] = status
        statuses[status] = statuses.get(status, 0) + 1
        output.append(row)
    return output, {"records": len(rows), "statuses": statuses}


def recover_dataset(dataset, ledgers):
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
        rows, summary = recover_rows(
            read_jsonl(source), transcripts, ledgers)
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
    parser.add_argument("--home", type=Path, default=DEFAULT_HOME)
    args = parser.parse_args()
    ledgers = ledger_index(args.home)
    reports = [
        recover_dataset(args.results_root / name, ledgers)
        for name in ("jsob", "vm")
        if (args.results_root / name).is_dir()
    ]
    print(json.dumps(reports, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
