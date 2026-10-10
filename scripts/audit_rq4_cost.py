#!/usr/bin/env python3
"""Import and audit the attempt-level resource records behind paper Table RQ4.

Use --import-workspace /path/to/FSE once to copy the measured cost fields from
the final local archives. The default mode checks the released compact records
against Table RQ4 without requiring those large archives.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import math
import statistics
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PAPER = ROOT / "results/paper"
ATTEMPTS = PAPER / "rq4_attempts.jsonl"
SOURCES = PAPER / "rq4_sources.json"
RUNS = {
    "l0-gpt-sol": "L0_result/L0_gpt_sol",
    "l0-glm": "L0_result/L0_glm",
    "l0-deepseek": "L0_result/L0_deepseek",
    "l0-kimi": "L0_result/L0_kimi",
    "openhands": "openhands_results",
    "claude-code": "claude_code_results",
    "opencode": "opencode_results",
    "kimi-code": "kimi_code_results",
    "codex": "codex_results",
}
AGENTS = {"openhands", "claude-code", "opencode", "kimi-code", "codex"}
CONDITIONS = {"jsob-full": "jsob", "vm-l1": "vm"}
TOKEN_FIELDS = ("prompt_tokens", "cache_read_tokens", "cache_write_tokens",
                "completion_tokens", "total_tokens")


def jsonl(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines()
            if line.strip()]


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def index(rows: list[dict], label: str) -> dict[str, dict]:
    result = {}
    for row in rows:
        sid = row["subject_id"]
        if sid in result:
            raise ValueError(f"duplicate subject in {label}: {sid}")
        result[sid] = row
    return result


def run_source(workspace: Path, system: str, protection: str) -> Path:
    family = CONDITIONS[protection]
    base = RUNS[system]
    if system in AGENTS:
        return workspace / "result/results" / base / family
    return workspace / "result/results" / (base + ("_vm" if family == "vm" else ""))


def import_workspace(workspace: Path) -> None:
    """Copy measured cost fields; reject outputs that differ from the release."""
    canonical = {(r["system"], r["protection"], r["subject_id"]): r
                 for r in jsonl(PAPER / "ja93.jsonl")}
    if len(canonical) != 2046:
        raise ValueError("expected 2,046 unique JADeBench candidates")
    attempts, source_files = [], []
    for protection in CONDITIONS:
        for system in RUNS:
            source = run_source(workspace, system, protection)
            score_path = source / ("scores.usage_recovered.jsonl" if system in AGENTS
                                   else "scores.jsonl")
            prediction_path = source / ("predictions.usage_recovered.jsonl"
                                        if (source / "predictions.usage_recovered.jsonl").is_file()
                                        else "predictions.jsonl")
            scores = index(jsonl(score_path), str(score_path))
            predictions = index(jsonl(prediction_path), str(prediction_path))
            repo_run = ROOT / "results/runs" / system / protection
            released_predictions = index(jsonl(repo_run / "predictions.jsonl"),
                                         str(repo_run / "predictions.jsonl"))
            if len(scores) != 93 or set(scores) != set(predictions) or set(scores) != set(released_predictions):
                raise ValueError(f"incomplete or misaligned cost source: {system}/{protection}")
            normalized_count = 0
            for line_number, score in enumerate(jsonl(score_path), 1):
                sid = score["subject_id"]
                prediction = predictions[sid]
                released = released_predictions[sid]
                if score["build_id"] != prediction["build_id"] or score["build_id"] != released["build_id"]:
                    raise ValueError(f"build differs: {system}/{protection}/{sid}")
                original = (source / prediction["path"]).read_bytes()
                released_bytes = (repo_run / released["path"]).read_bytes()
                expected_hash = canonical[system, protection, sid]["candidate_sha256"]
                if hashlib.sha256(released_bytes).hexdigest() != expected_hash:
                    raise ValueError(f"released candidate hash differs: {system}/{protection}/{sid}")
                if original != released_bytes:
                    if original.replace(b"\r\n", b"\n") != released_bytes:
                        raise ValueError(f"source candidate differs: {system}/{protection}/{sid}")
                    normalized_count += 1
                cost = score["cost"]
                values = {field: cost.get(field) for field in TOKEN_FIELDS}
                for field, value in values.items():
                    if value is not None and (not isinstance(value, int) or value < 0):
                        raise ValueError(f"invalid {field}: {system}/{protection}/{sid}")
                seconds = cost.get("seconds")
                if seconds is not None and (not isinstance(seconds, (float, int)) or seconds < 0):
                    raise ValueError(f"invalid seconds: {system}/{protection}/{sid}")
                attempts.append({
                    "subject_id": sid, "system": system, "protection": protection,
                    "candidate_sha256": expected_hash,
                    **values, "runtime_seconds": seconds,
                    "usage_source": cost.get("usage_source"),
                    "usage_recovery_status": cost.get("usage_recovery_status"),
                    "source_scores_file": str(score_path.relative_to(workspace)),
                    "source_line": line_number,
                })
            source_files.append({
                "system": system, "protection": protection,
                "scores_file": str(score_path.relative_to(workspace)),
                "scores_sha256": sha256(score_path),
                "predictions_file": str(prediction_path.relative_to(workspace)),
                "predictions_sha256": sha256(prediction_path),
                "candidates_with_crlf_normalized_by_git": normalized_count,
            })
    ATTEMPTS.write_text("".join(json.dumps(row, sort_keys=True) + "\n" for row in attempts),
                        encoding="utf-8")
    SOURCES.write_text(json.dumps({"schema_version": 1,
                                   "workspace_relative_to": "FSE",
                                   "attempts_sha256": sha256(ATTEMPTS),
                                   "entries": source_files}, indent=2) + "\n", encoding="utf-8")
    print(f"imported {len(attempts)} measured attempts from {workspace}")


def quantile(values: list[float], fraction: float) -> float:
    """Linear sample quantile, matching numpy's default method."""
    ordered = sorted(values)
    position = (len(ordered) - 1) * fraction
    lower = math.floor(position)
    return ordered[lower] + (ordered[min(lower + 1, len(ordered) - 1)]
                             - ordered[lower]) * (position - lower)


def check(workspace: Path | None = None) -> None:
    attempts = jsonl(ATTEMPTS)
    if len(attempts) != 18 * 93:
        raise ValueError(f"expected 1,674 RQ4 attempts, found {len(attempts)}")
    canonical = {(r["system"], r["protection"], r["subject_id"]): r["candidate_sha256"]
                 for r in jsonl(PAPER / "ja93.jsonl")}
    groups: dict[tuple[str, str], list[dict]] = defaultdict(list)
    seen = set()
    for row in attempts:
        key = row["system"], row["protection"], row["subject_id"]
        if key in seen or row["candidate_sha256"] != canonical.get(key):
            raise ValueError(f"duplicate or mismatched candidate: {key}")
        seen.add(key)
        groups[key[:2]].append(row)
    if set(groups) != {(system, protection) for system in RUNS for protection in CONDITIONS}:
        raise ValueError("RQ4 system/protection coverage differs")
    source_manifest = json.loads(SOURCES.read_text(encoding="utf-8"))
    if len(source_manifest["entries"]) != 18:
        raise ValueError("RQ4 source manifest is incomplete")
    sources = {(item["system"], item["protection"]): item
               for item in source_manifest["entries"]}
    if set(sources) != set(groups):
        raise ValueError("RQ4 source manifest covers a different system set")
    for key, rows in groups.items():
        score_file = sources[key]["scores_file"]
        if {r["source_scores_file"] for r in rows} != {score_file}:
            raise ValueError(f"RQ4 source file differs: {key}")
        if {r["source_line"] for r in rows} != set(range(1, 94)):
            raise ValueError(f"RQ4 source lines differ: {key}")
    if sha256(ATTEMPTS) != source_manifest["attempts_sha256"]:
        raise ValueError("RQ4 attempt archive digest differs")
    if workspace is not None:
        for item in source_manifest["entries"]:
            for field in ("scores", "predictions"):
                source_path = workspace / item[f"{field}_file"]
                if sha256(source_path) != item[f"{field}_sha256"]:
                    raise ValueError(f"source archive digest differs: {source_path}")
    paper_rows = json.loads((PAPER / "rq4_cost.json").read_text(encoding="utf-8"))["rows"]
    paper = {(r["system"], r["protection"]): r for r in paper_rows}
    if set(paper) != set(groups) or len(paper_rows) != 18:
        raise ValueError("RQ4 manuscript table covers a different system set")
    for protection in CONDITIONS:
        shared = set.intersection(*(
            {r["subject_id"] for r in groups[system, protection]
             if r["prompt_tokens"] is not None and r["completion_tokens"] is not None}
            for system in AGENTS))
        if len(shared) != (76 if protection == "jsob-full" else 74):
            raise ValueError(f"agent token complete-case cohort differs: {protection}")
        print(f"{protection}: agent token complete-case cohort n={len(shared)}")
        for system in RUNS:
            rows = groups[system, protection]
            if len(rows) != 93 or {r["subject_id"] for r in rows} != {
                    r["subject_id"] for r in groups["openhands", protection]}:
                raise ValueError(f"RQ4 subject cohort differs: {system}/{protection}")
            eligible = [r for r in rows if system not in AGENTS or r["subject_id"] in shared]
            tokens = [r for r in eligible if r["prompt_tokens"] is not None
                      and r["completion_tokens"] is not None]
            input_values = [r["prompt_tokens"] + (r["cache_read_tokens"] or 0)
                            + (r["cache_write_tokens"] or 0) for r in tokens]
            output_values = [r["completion_tokens"] for r in tokens]
            runtime_values = [r["runtime_seconds"] for r in rows
                              if r["runtime_seconds"] is not None]
            if not input_values or not runtime_values:
                raise ValueError(f"RQ4 records have no measurements: {system}/{protection}")
            calculated = {
                "input_tokens_millions_mean": round(statistics.mean(input_values) / 1e6, 3),
                "output_tokens_thousands_mean": round(statistics.mean(output_values) / 1e3, 1),
                "runtime_seconds_median": round(quantile(runtime_values, .5), 1),
                "runtime_seconds_iqr": [round(quantile(runtime_values, q), 1)
                                        for q in (.25, .75)],
                "runtime_seconds_mean": round(statistics.mean(runtime_values), 1),
            }
            expected = paper[system, protection]
            counts = {"attempt_n": len(rows), "token_n": len(tokens),
                      "runtime_n": len(runtime_values)}
            count_differences = {field: (value, expected.get(field))
                                 for field, value in counts.items()
                                 if value != expected.get(field)}
            if count_differences:
                raise ValueError(f"RQ4 denominators differ for {system}/{protection}: "
                                 f"{count_differences}")
            differences = {field: (value, expected[field]) for field, value in calculated.items()
                           if value != expected[field]}
            if differences:
                raise ValueError(f"RQ4 differs for {system}/{protection}: {differences}")
            print(f"  {system}: subjects=93, token_n={len(tokens)}, "
                  f"runtime_n={len(runtime_values)}; five table values match")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--import-workspace", type=Path,
                        help="Import measured costs from the original FSE workspace")
    parser.add_argument("--check-workspace", type=Path,
                        help="Also verify original source archive SHA-256 digests")
    args = parser.parse_args()
    try:
        if args.import_workspace:
            import_workspace(args.import_workspace.resolve())
        check(args.check_workspace.resolve() if args.check_workspace else None)
    except (OSError, ValueError, KeyError, TypeError, json.JSONDecodeError) as error:
        print(f"ERROR: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
