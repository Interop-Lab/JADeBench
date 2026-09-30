#!/usr/bin/env python3
"""Validate released runs and reproduce the public leaderboard."""

from __future__ import annotations

import argparse
import json
import sys
from collections import Counter
from pathlib import Path
from typing import Any, Iterable


ROOT = Path(__file__).resolve().parents[1]
BENCHMARK = ROOT / "benchmark" / "realworld93"
RUNS = ROOT / "results" / "runs"
LEADERBOARD_JSON = ROOT / "results" / "leaderboard.json"
LEADERBOARD_MD = ROOT / "results" / "leaderboard.md"


def read_jsonl(path: Path) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for number, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        if not line.strip():
            continue
        value = json.loads(line)
        if not isinstance(value, dict):
            raise ValueError(f"{path}:{number}: expected a JSON object")
        rows.append(value)
    return rows


def values(rows: Iterable[dict[str, Any]], *keys: str) -> list[float]:
    result: list[float] = []
    for row in rows:
        value: Any = row
        for key in keys:
            value = value.get(key) if isinstance(value, dict) else None
        if isinstance(value, (int, float)):
            result.append(float(value))
    return result


def mean(items: list[float]) -> float | None:
    return None if not items else round(sum(items) / len(items), 4)


def summarize(run_dir: Path, expected_ids: set[str]) -> dict[str, Any]:
    metadata = json.loads((run_dir / "run.json").read_text(encoding="utf-8"))
    predictions = read_jsonl(run_dir / "predictions.jsonl")
    scores = read_jsonl(run_dir / "scores.jsonl")

    prediction_ids = [str(row.get("sample_id")) for row in predictions]
    score_ids = [str(row.get("sample_id")) for row in scores]
    if len(prediction_ids) != 93 or set(prediction_ids) != expected_ids:
        raise ValueError(f"{run_dir}: predictions do not cover realworld93")
    if len(prediction_ids) != len(set(prediction_ids)):
        raise ValueError(f"{run_dir}: duplicate prediction sample IDs")
    if len(score_ids) != len(set(score_ids)) or not set(score_ids) <= expected_ids:
        raise ValueError(f"{run_dir}: invalid score sample IDs")

    for row in predictions:
        relative = row.get("path")
        if relative:
            output = run_dir / str(relative)
            if Path(str(relative)).is_absolute() or not output.is_file():
                raise ValueError(f"{run_dir}: missing prediction output {relative!r}")
    referenced_outputs = {
        (run_dir / str(row["path"])).resolve()
        for row in predictions
        if row.get("path")
    }
    published_outputs = {
        path.resolve() for path in (run_dir / "outputs").iterdir() if path.is_file()
    }
    if published_outputs != referenced_outputs:
        raise ValueError(f"{run_dir}: outputs/ differs from predictions.jsonl")

    execution = values(scores, "execution", "score")
    behaviour = values(scores, "execution", "behaviour_match")
    summary = {
        "run_id": metadata["run_id"],
        "system_slug": metadata["system_slug"],
        "system": metadata.get("system"),
        "model": metadata.get("model"),
        "level": metadata.get("level"),
        "protection": metadata["protection"],
        "predictions": len(predictions),
        "scored": len(scores),
        "execution_n": len(execution),
        "syntax": mean(values(scores, "syntax", "score")),
        "execution": mean(execution),
        "behaviour_exact": mean([1.0 if item == 1.0 else 0.0 for item in behaviour]),
        "simplification": mean(values(scores, "simplification", "anchored")),
        "codebleu3": mean(values(scores, "similarity", "codebleu3")),
        "statuses": dict(sorted(Counter(str(row.get("status")) for row in scores).items())),
    }
    return summary


def render_markdown(summaries: list[dict[str, Any]]) -> str:
    lines = [
        "# Released results",
        "",
        "All values below are regenerated from the canonical `scores.jsonl` files.",
        "Execution correctness is the primary metric. Null execution records are",
        "excluded and reported through the `Exec. n` column rather than converted to zero.",
        "",
    ]
    labels = {"jsob-full": "JavaScript Obfuscator / full", "vm-l1": "VM / L1"}
    for protection in ("jsob-full", "vm-l1"):
        lines.extend(
            [
                f"## {labels[protection]}",
                "",
                "| System | Level | Scored | Exec. n | Syntax | Execution | Exact behavior | Simplification | CodeBLEU |",
                "| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |",
            ]
        )
        selected = [row for row in summaries if row["protection"] == protection]
        selected.sort(
            key=lambda row: (
                row["execution"] is not None,
                row["execution"] if row["execution"] is not None else -1,
            ),
            reverse=True,
        )
        for row in selected:
            display = row["system_slug"]
            lines.append(
                "| {display} | {level} | {scored} | {execution_n} | {syntax} | "
                "**{execution}** | {behaviour_exact} | {simplification} | {codebleu3} |".format(
                    display=display,
                    level=row.get("level") or "—",
                    scored=row["scored"],
                    execution_n=row["execution_n"],
                    syntax=format_score(row["syntax"]),
                    execution=format_score(row["execution"]),
                    behaviour_exact=format_score(row["behaviour_exact"]),
                    simplification=format_score(row["simplification"]),
                    codebleu3=format_score(row["codebleu3"]),
                )
            )
        lines.append("")
    lines.extend(
        [
            "The published runs are historical snapshots, not claims that every system used",
            "the same model, budget, or tool interface. See [`README.md`](README.md) for",
            "interpretation and provenance.",
            "",
        ]
    )
    return "\n".join(lines)


def format_score(value: float | None) -> str:
    return "—" if value is None else f"{value:.4f}"


def generated() -> tuple[str, str]:
    sample_rows = read_jsonl(BENCHMARK / "sample_ids.jsonl")
    expected_ids = {str(row["sample_id"]) for row in sample_rows}
    if len(sample_rows) != 93 or expected_ids != {
        f"adb-{number:03d}" for number in range(1, 94)
    }:
        raise ValueError("benchmark/realworld93 must contain adb-001 through adb-093")

    summaries = [
        summarize(run_dir, expected_ids)
        for run_dir in sorted(RUNS.glob("*/*"))
        if (run_dir / "run.json").is_file()
    ]
    if len(summaries) != 24:
        raise ValueError(f"expected 24 released runs, found {len(summaries)}")
    payload = {
        "schema_version": "agentdeobfbench-leaderboard-v1",
        "benchmark": "realworld93",
        "primary_metric": "execution",
        "runs": summaries,
    }
    return (
        json.dumps(payload, indent=2, ensure_ascii=False) + "\n",
        render_markdown(summaries),
    )


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--check",
        action="store_true",
        help="fail if committed leaderboard files differ from regenerated content",
    )
    args = parser.parse_args()
    try:
        json_text, markdown_text = generated()
    except (OSError, ValueError, json.JSONDecodeError) as error:
        print(f"ERROR: {error}", file=sys.stderr)
        return 1

    expected = ((LEADERBOARD_JSON, json_text), (LEADERBOARD_MD, markdown_text))
    if args.check:
        stale = [
            str(path.relative_to(ROOT))
            for path, content in expected
            if not path.is_file() or path.read_text(encoding="utf-8") != content
        ]
        if stale:
            print("ERROR: stale generated result files: " + ", ".join(stale), file=sys.stderr)
            return 1
        print("released results and leaderboard are consistent")
        return 0

    for path, content in expected:
        path.write_text(content, encoding="utf-8")
        print(path.relative_to(ROOT))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
