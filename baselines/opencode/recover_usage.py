#!/usr/bin/env python3
"""Recover OpenCode session usage from its persistent SQLite database.

OpenCode stores one token record per ``step-finish`` part.  The old collector
kept only the final step.  This script maps archived transcripts to sessions by
workspace directory and sums every stored step.  Canonical result files are
never modified; recovered copies are written as ``*.usage_recovered.jsonl``.
"""

from __future__ import annotations

import argparse
import json
import sqlite3
from pathlib import Path


HERE = Path(__file__).resolve().parent
PROJECT_ROOT = HERE.parents[1]
DEFAULT_RESULTS = PROJECT_ROOT / "results" / "opencode_results"
DEFAULT_DATABASE = Path(
    "/tmp/adb-opencode-home/.local/share/opencode/opencode.db")


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
    for root in (
        dataset / "transcripts",
        dataset / "_archive" / "transcripts",
    ):
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
            previous = indexed.get(build_id)
            if previous is None or mtime >= previous["_mtime"]:
                indexed[build_id] = {
                    "_mtime": mtime,
                    "_path": str(path),
                    "workspace": workspace,
                }
    return indexed


def number(value) -> int:
    return int(value) if isinstance(value, (int, float)) else 0


def usage_for_workspace(connection, workspace: str) -> dict:
    session_ids = [
        row[0]
        for row in connection.execute(
            "select id from session where directory = ? order by time_created",
            (workspace,),
        )
    ]
    usage = {
        "prompt_tokens": 0,
        "completion_tokens": 0,
        "reasoning_tokens": 0,
        "cache_read_tokens": 0,
        "cache_write_tokens": 0,
        "total_tokens": 0,
    }
    steps = 0
    total_mismatches = 0
    for session_id in session_ids:
        rows = connection.execute(
            """
            select data
            from part
            where session_id = ?
              and json_extract(data, '$.type') = 'step-finish'
            order by time_created
            """,
            (session_id,),
        )
        for (raw,) in rows:
            try:
                part = json.loads(raw)
            except (ValueError, TypeError):
                continue
            tokens = part.get("tokens") or {}
            if not isinstance(tokens, dict):
                continue
            cache = tokens.get("cache") or {}
            if not isinstance(cache, dict):
                cache = {}
            prompt = number(tokens.get("input"))
            completion = number(tokens.get("output"))
            reasoning = number(tokens.get("reasoning"))
            cache_read = number(cache.get("read"))
            cache_write = number(cache.get("write"))
            component_total = prompt + completion + cache_read + cache_write
            reported_total = number(tokens.get("total"))
            if reported_total and reported_total != component_total:
                total_mismatches += 1
            usage["prompt_tokens"] += prompt
            usage["completion_tokens"] += completion
            usage["reasoning_tokens"] += reasoning
            usage["cache_read_tokens"] += cache_read
            usage["cache_write_tokens"] += cache_write
            usage["total_tokens"] += reported_total or component_total
            steps += 1
    return {
        "usage": usage,
        "session_count": len(session_ids),
        "steps": steps,
        "total_mismatches": total_mismatches,
    }


def recover_rows(rows: list[dict], transcripts: dict, connection) -> tuple[list[dict], dict]:
    output = []
    statuses = {}
    unresolved = []
    original_total = 0
    recovered_total = 0
    recovered_steps = 0
    mismatch_steps = 0
    for original in rows:
        row = json.loads(json.dumps(original))
        cost = row.setdefault("cost", {})
        build_id = row.get("build_id")
        indexed = transcripts.get(build_id)
        status = "exact"
        recovered = None
        if indexed is None:
            status = "transcript_missing"
        else:
            recovered = usage_for_workspace(
                connection, indexed["workspace"])
            if recovered["session_count"] == 0:
                status = "session_missing"
            elif recovered["steps"] == 0:
                status = "step_usage_missing"

        if status == "exact":
            old = cost.get("total_tokens")
            if isinstance(old, (int, float)):
                original_total += int(old)
            usage = recovered["usage"]
            for key, value in usage.items():
                cost[key] = value
            cost["agent_steps"] = recovered["steps"]
            cost["usage_session_count"] = recovered["session_count"]
            cost["usage_source"] = "opencode.sqlite.step-finish"
            cost["usage_recovery_status"] = status
            recovered_total += usage["total_tokens"]
            recovered_steps += recovered["steps"]
            mismatch_steps += recovered["total_mismatches"]
        else:
            cost["usage_recovery_status"] = status
            unresolved.append(build_id)
        statuses[status] = statuses.get(status, 0) + 1
        output.append(row)
    return output, {
        "records": len(rows),
        "statuses": statuses,
        "unresolved_build_ids": unresolved,
        "original_last_step_total_tokens": original_total,
        "recovered_total_tokens": recovered_total,
        "recovered_steps": recovered_steps,
        "step_total_component_mismatches": mismatch_steps,
    }


def recover_dataset(dataset: Path, connection) -> dict:
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
            read_jsonl(source), transcripts, connection)
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
        help="directory containing jsob/ and vm/ OpenCode results",
    )
    parser.add_argument(
        "--database", type=Path, default=DEFAULT_DATABASE,
        help="OpenCode opencode.db path",
    )
    args = parser.parse_args()
    if not args.database.is_file():
        raise SystemExit("OpenCode database not found: %s" % args.database)
    connection = sqlite3.connect(
        "file:%s?mode=ro" % args.database, uri=True)
    try:
        reports = []
        for name in ("jsob", "vm"):
            dataset = args.results_root / name
            if dataset.is_dir():
                reports.append(recover_dataset(dataset, connection))
    finally:
        connection.close()
    print(json.dumps(reports, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
