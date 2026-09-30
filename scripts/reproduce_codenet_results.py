#!/usr/bin/env python3
"""Validate the CodeNet100 reference runs and regenerate their leaderboard."""

from __future__ import annotations

import argparse
import json
import sys
from collections import Counter
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
BENCHMARK = ROOT / "benchmark" / "codenet100"
RUNS = ROOT / "results" / "codenet100" / "runs"
LEADERBOARD_JSON = ROOT / "results" / "codenet100" / "leaderboard.json"
LEADERBOARD_MD = ROOT / "results" / "codenet100" / "leaderboard.md"


def read_jsonl(path: Path) -> list[dict[str, Any]]:
    rows = []
    for number, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        if not line.strip():
            continue
        value = json.loads(line)
        if not isinstance(value, dict):
            raise ValueError(f"{path}:{number}: expected an object")
        rows.append(value)
    return rows


def mean(rows: list[dict[str, Any]], key: str) -> float | None:
    values = [float(row[key]) for row in rows if isinstance(row.get(key), (int, float))]
    return None if not values else round(sum(values) / len(values), 4)


def summarize(run_dir: Path, expected_ids: set[str]) -> dict[str, Any]:
    metadata = json.loads((run_dir / "run.json").read_text(encoding="utf-8"))
    predictions = read_jsonl(run_dir / "predictions.jsonl")
    scores = read_jsonl(run_dir / "scores.jsonl")
    prediction_ids = [str(row.get("sample_id")) for row in predictions]
    score_ids = [str(row.get("sample_id")) for row in scores]
    if len(prediction_ids) != len(set(prediction_ids)):
        raise ValueError(f"{run_dir}: duplicate prediction sample IDs")
    if len(score_ids) != len(set(score_ids)):
        raise ValueError(f"{run_dir}: duplicate score sample IDs")
    if not set(prediction_ids) <= expected_ids or not set(score_ids) <= expected_ids:
        raise ValueError(f"{run_dir}: unknown CodeNet100 sample IDs")
    if set(prediction_ids) != set(score_ids):
        raise ValueError(f"{run_dir}: predictions and scores cover different samples")
    for row in predictions:
        relative = row.get("path")
        output = run_dir / str(relative)
        if not relative or Path(str(relative)).is_absolute() or not output.is_file():
            raise ValueError(f"{run_dir}: missing prediction output {relative!r}")
    return {
        "run_id": metadata["run_id"],
        "system_slug": metadata["system_slug"],
        "system": metadata.get("system"),
        "model": metadata.get("model"),
        "level": metadata.get("level"),
        "protection": metadata["protection"],
        "predictions": len(predictions),
        "scored": len(scores),
        "syntax": mean(scores, "syntax_pass"),
        "execution": mean(scores, "exe_pass"),
        "codebleu": mean(scores, "codebleu"),
        "statuses": dict(sorted(Counter(str(row.get("status")) for row in scores).items())),
    }


def score(value: float | None) -> str:
    return "—" if value is None else f"{value:.4f}"


def render_markdown(summaries: list[dict[str, Any]]) -> str:
    lines = [
        "# CodeNet100 reference results",
        "",
        "These values are regenerated from the released JsDeObsBench-compatible",
        "`scores.jsonl` records. Results are reported separately from realworld93",
        "because the datasets and evaluator schemas are different.",
        "",
    ]
    labels = {"jsob-full": "JavaScript Obfuscator / full", "c77-0": "C77-0"}
    for protection in ("jsob-full", "c77-0"):
        lines.extend(
            [
                f"## {labels[protection]}",
                "",
                "| Run | Level | n | Syntax | Execution | CodeBLEU |",
                "| --- | --- | ---: | ---: | ---: | ---: |",
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
            lines.append(
                "| {system_slug} | {level} | {scored} | {syntax} | "
                "**{execution}** | {codebleu} |".format(
                    system_slug=row["system_slug"],
                    scored=row["scored"],
                    syntax=score(row["syntax"]),
                    execution=score(row["execution"]),
                    codebleu=score(row["codebleu"]),
                    level=row.get("level") or "—",
                )
            )
        lines.append("")
    lines.extend(
        [
            "Rows suffixed `-rerun` are repeated runs, not additional systems. The",
            "historical GPT-sol C77-0 run contains 69 subjects; all other listed runs",
            "contain 100. See [`../README.md`](../README.md) for interpretation.",
            "",
        ]
    )
    return "\n".join(lines)


def generated() -> tuple[str, str]:
    index = read_jsonl(BENCHMARK / "sample_ids.jsonl")
    expected_ids = {str(row["sample_id"]) for row in index}
    if len(index) != 100 or expected_ids != {
        f"codenet-{number:03d}" for number in range(1, 101)
    }:
        raise ValueError("benchmark/codenet100 must contain codenet-001 through -100")
    summaries = [
        summarize(run_dir, expected_ids)
        for run_dir in sorted(RUNS.glob("*/*"))
        if (run_dir / "run.json").is_file()
    ]
    if len(summaries) != 13:
        raise ValueError(f"expected 13 CodeNet runs, found {len(summaries)}")
    payload = {
        "schema_version": "agentdeobfbench-codenet-leaderboard-v1",
        "benchmark": "codenet100",
        "primary_metric": "execution",
        "runs": summaries,
    }
    return (
        json.dumps(payload, indent=2, ensure_ascii=False) + "\n",
        render_markdown(summaries),
    )


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    try:
        json_text, markdown_text = generated()
    except (OSError, ValueError, json.JSONDecodeError) as error:
        print(f"ERROR: {error}", file=sys.stderr)
        return 1
    outputs = ((LEADERBOARD_JSON, json_text), (LEADERBOARD_MD, markdown_text))
    if args.check:
        stale = [
            str(path.relative_to(ROOT))
            for path, content in outputs
            if not path.is_file() or path.read_text(encoding="utf-8") != content
        ]
        if stale:
            print("ERROR: stale generated result files: " + ", ".join(stale), file=sys.stderr)
            return 1
        print("CodeNet100 results and leaderboard are consistent")
        return 0
    for path, content in outputs:
        path.write_text(content, encoding="utf-8")
        print(path.relative_to(ROOT))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
