#!/usr/bin/env python3
"""Move result entries outside build_dataset bench into results/_outside_bench/."""

from __future__ import annotations

import json
import shutil
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[2]
RESULTS = ROOT / "results"
ARCHIVE = RESULTS / "_outside_bench"
SAMPLE_IDS = ROOT / "corpus" / "build_dataset" / "sample_ids.jsonl"

# Entire trees that are never part of the 104-subject bench.
WHOLE_MOVE_DIRS = [
    "codenet_sample_results",
]

JSONL_NAMES = ("predictions.jsonl", "scores.jsonl", "evaluator_scores.jsonl", "builds.jsonl")

EXTRA_SUBJECTS = {
    "doyensec__electronegativity::src/locales/i18n.js",
    "ferrislucas__promptr::src/services/TemplateLoader.js",
    "koalazak__dorita980::index.js",
    "pchuri__confluence-cli::bin/commands/export.js",
    "sockjs__sockjs-client::lib/utils/event.js",
}


def load_bench_sets() -> tuple[set[str], set[str]]:
    subjects: set[str] = set()
    build_ids: set[str] = set()
    with SAMPLE_IDS.open(encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if not line:
                continue
            row = json.loads(line)
            subjects.add(row["subject_id"])
            build_ids.add(row["jsob_build_id"])
            build_ids.add(row["vm_build_id"])
            # VM corpus filenames sometimes omit hash in build_id.
            vm_stem = row["vm_file"].rsplit(".", 1)[0]
            build_ids.add(vm_stem.replace("__L1", "__vm_l1"))
    return subjects, build_ids


def read_jsonl(path: Path) -> list[dict[str, Any]]:
    if not path.is_file():
        return []
    rows: list[dict[str, Any]] = []
    with path.open(encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if line:
                rows.append(json.loads(line))
    return rows


def write_jsonl(path: Path, rows: list[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as fh:
        for row in rows:
            fh.write(json.dumps(row, ensure_ascii=False) + "\n")


def subject_from_build_id(build_id: str) -> str | None:
    if build_id.startswith("codenet::"):
        return build_id.split("__", 1)[0] if "__" in build_id else build_id
    for extra in EXTRA_SUBJECTS:
        repo_proj, mod = extra.split("::", 1)
        token = repo_proj.replace("__", "_") + "_" + mod.replace("/", "_").replace(".js", "")
        if build_id.startswith(token):
            return extra
    return None


def in_bench(row: dict[str, Any], bench_subjects: set[str], bench_build_ids: set[str]) -> bool:
    sid = row.get("subject_id")
    if sid:
        if sid.startswith("codenet::"):
            return False
        return sid in bench_subjects
    bid = row.get("build_id") or row.get("build") or ""
    if bid in bench_build_ids:
        return True
    guessed = subject_from_build_id(bid)
    if guessed:
        return guessed in bench_subjects
    # Unknown build without subject — keep if it looks bench-like (conservative: quarantine).
    return False


def artifact_paths(row: dict[str, Any], run_dir: Path) -> list[Path]:
    paths: list[Path] = []
    for key in ("path", "transcript_path", "log_path"):
        rel = row.get(key)
        if not rel:
            continue
        p = (run_dir / rel).resolve()
        if p.is_file() and run_dir.resolve() in p.parents:
            paths.append(p)
    bid = row.get("build_id") or ""
    for sub in ("outputs", "transcripts", "logs"):
        d = run_dir / sub
        if not d.is_dir() or not bid:
            continue
        for candidate in d.glob(f"{bid}*"):
            if candidate.is_file():
                paths.append(candidate.resolve())
    return sorted(set(paths))


def move_file(src: Path, dst: Path) -> None:
    if not src.is_file():
        return
    dst.parent.mkdir(parents=True, exist_ok=True)
    if dst.exists():
        return
    shutil.move(str(src), str(dst))


def split_rows(
    rows: list[dict[str, Any]], bench_subjects: set[str], bench_build_ids: set[str]
) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    kept: list[dict[str, Any]] = []
    out: list[dict[str, Any]] = []
    for row in rows:
        (kept if in_bench(row, bench_subjects, bench_build_ids) else out).append(row)
    return kept, out


def process_run_dir(run_dir: Path, bench_subjects: set[str], bench_build_ids: set[str]) -> dict[str, Any]:
    rel = run_dir.relative_to(RESULTS)
    archive_dir = ARCHIVE / rel
    stats: dict[str, Any] = {"run_dir": str(rel), "moved_rows": 0, "artifacts": 0}

    pred_rows = read_jsonl(run_dir / "predictions.jsonl")
    if not pred_rows:
        return stats

    kept_pred, out_pred = split_rows(pred_rows, bench_subjects, bench_build_ids)
    stats["predictions_before"] = len(pred_rows)
    stats["predictions_after"] = len(kept_pred)
    stats["predictions_moved"] = len(out_pred)

    # Collect keys from quarantined predictions for scores filtering.
    out_keys: set[str] = set()
    for row in out_pred:
        for key in ("prediction_id", "build_id", "subject_id"):
            val = row.get(key)
            if val:
                out_keys.add(val)

    for row in out_pred:
        for src in artifact_paths(row, run_dir):
            dst = archive_dir / src.relative_to(run_dir)
            move_file(src, dst)
            stats["artifacts"] += 1

    write_jsonl(archive_dir / "predictions.jsonl", out_pred)
    write_jsonl(run_dir / "predictions.jsonl", kept_pred)

    score_path = run_dir / "scores.jsonl"
    score_rows = read_jsonl(score_path)
    if score_rows:
        kept_scores: list[dict[str, Any]] = []
        out_scores: list[dict[str, Any]] = []
        for row in score_rows:
            keys = {row.get(k) for k in ("prediction_id", "build_id", "subject_id")} - {None}
            if keys & out_keys or not in_bench(row, bench_subjects, bench_build_ids):
                out_scores.append(row)
            else:
                kept_scores.append(row)
        write_jsonl(archive_dir / "scores.jsonl", out_scores)
        write_jsonl(score_path, kept_scores)
        stats["scores_moved"] = len(out_scores)
        stats["scores_after"] = len(kept_scores)

    for name in ("evaluator_scores.jsonl", "builds.jsonl"):
        extra_path = run_dir / name
        extra_rows = read_jsonl(extra_path)
        if not extra_rows:
            continue
        kept_extra, out_extra = split_rows(extra_rows, bench_subjects, bench_build_ids)
        write_jsonl(archive_dir / name, out_extra)
        write_jsonl(extra_path, kept_extra)
        stats[f"{name}_moved"] = len(out_extra)

    stats["moved_rows"] = len(out_pred)
    return stats


def move_whole_dir(name: str) -> dict[str, Any]:
    src = RESULTS / name
    dst = ARCHIVE / name
    if not src.is_dir():
        return {"dir": name, "status": "missing"}
    if dst.exists():
        return {"dir": name, "status": "already_archived"}
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.move(str(src), str(dst))
    return {"dir": name, "status": "moved", "dest": str(dst.relative_to(ROOT))}


def find_run_dirs() -> list[Path]:
    runs: list[Path] = []
    for pred in RESULTS.rglob("predictions.jsonl"):
        run_dir = pred.parent
        rel = run_dir.relative_to(RESULTS)
        parts = rel.parts
        if parts[0] == "_outside_bench":
            continue
        if parts[0] in WHOLE_MOVE_DIRS:
            continue
        if "_archive" in parts:
            continue
        runs.append(run_dir)
    return sorted(set(runs))


def main() -> None:
    bench_subjects, bench_build_ids = load_bench_sets()
    ARCHIVE.mkdir(parents=True, exist_ok=True)

    manifest: dict[str, Any] = {
        "bench_subjects": len(bench_subjects),
        "extra_subjects_quarantined": sorted(EXTRA_SUBJECTS),
        "whole_moves": [],
        "runs": [],
    }

    for name in WHOLE_MOVE_DIRS:
        manifest["whole_moves"].append(move_whole_dir(name))

    for run_dir in find_run_dirs():
        manifest["runs"].append(process_run_dir(run_dir, bench_subjects, bench_build_ids))

    readme = ARCHIVE / "README.md"
    readme.write_text(
        """# Outside Bench Archive

Entries removed from active `results/` run directories because they are **not**
part of the 104-subject `corpus/build_dataset` bench.

## Layout

- Mirrored run paths (`L0_result/`, `codex_results/`, …) with 1–5 excluded subject rows each
- `codenet_sample_results/` — entire CodeNet experiment tree (never in bench)
- `quarantine_manifest.json` — per-run before/after counts

## Excluded subjects

"""
        + "\n".join(f"- `{s}`" for s in sorted(EXTRA_SUBJECTS))
        + """

Regenerated by `corpus/scripts/quarantine_outside_bench.py`.
""",
        encoding="utf-8",
    )

    report_path = ARCHIVE / "quarantine_manifest.json"
    report_path.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps(manifest, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
