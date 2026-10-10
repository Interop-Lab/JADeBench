#!/usr/bin/env python3
"""Validate the source release, full metadata, and bundled diverse6 sample."""

from __future__ import annotations

import json
import subprocess
import sys
from collections import Counter
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
FULL_CORPUS = ROOT / "corpus" / "manifest.jsonl"
FULL_BUILDS = ROOT / "obfuscators" / "builds" / "builds.jsonl"
SAMPLE = ROOT / "samples" / "diverse6"
BENCHMARK = ROOT / "benchmark" / "realworld93"
CODENET = ROOT / "benchmark" / "codenet100"
RESULTS = ROOT / "results"
EXPECTED_SAMPLE_IDS = {
    "adb-001",
    "adb-009",
    "adb-025",
    "adb-042",
    "adb-069",
    "adb-086",
}

REQUIRED_PATHS = (
    "README.md",
    "DATASET_CARD.md",
    "LICENSE",
    "CITATION.cff",
    "CONTRIBUTING.md",
    "SECURITY.md",
    "third_party/THIRD_PARTY_NOTICES.md",
    "docs/INSTALL.md",
    "docs/REPRODUCING.md",
    "docs/DATA_AND_RESULTS.md",
    "docs/DATA_RELEASE.md",
    "benchmark/README.md",
    "benchmark/realworld93/README.md",
    "benchmark/realworld93/sample_ids.jsonl",
    "benchmark/realworld93/subject_paths.txt",
    "benchmark/realworld93/manifest.jsonl",
    "benchmark/realworld93/builds-jsob.jsonl",
    "benchmark/realworld93/builds-vm.jsonl",
    "benchmark/realworld93/attributions.jsonl",
    "benchmark/realworld93/THIRD_PARTY_NOTICES.md",
    "benchmark/codenet100/README.md",
    "benchmark/codenet100/NOTICE",
    "benchmark/codenet100/sample_ids.jsonl",
    "benchmark/codenet100/manifest.jsonl",
    "benchmark/codenet100/builds-jsob-full.jsonl",
    "benchmark/codenet100/builds-c77-0.jsonl",
    "results/README.md",
    "results/manifest.json",
    "results/leaderboard.json",
    "results/leaderboard.md",
    "results/codenet100/manifest.json",
    "results/codenet100/leaderboard.json",
    "results/codenet100/leaderboard.md",
    "corpus/manifest.jsonl",
    "obfuscators/builds/builds.jsonl",
    "evaluators/score.py",
    "evaluators/config/eval.json",
    "samples/diverse6/builds.jsonl",
    "samples/diverse6/corpus/manifest.jsonl",
    "samples/diverse6/predictions/identity.jsonl",
    "samples/diverse6/sandbox/stats/sandboxes.json",
    "samples/diverse6/attributions.json",
)


class Report:
    def __init__(self) -> None:
        self.errors: list[str] = []
        self.warnings: list[str] = []
        self.notes: list[str] = []

    def error(self, message: str) -> None:
        self.errors.append(message)

    def warning(self, message: str) -> None:
        self.warnings.append(message)

    def note(self, message: str) -> None:
        self.notes.append(message)


def read_json(path: Path, report: Report) -> Any:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        report.error("%s: invalid JSON: %s" % (path.relative_to(ROOT), exc))
        return None


def read_jsonl(path: Path, report: Report) -> list[dict[str, Any]]:
    result: list[dict[str, Any]] = []
    try:
        lines = path.read_text(encoding="utf-8").splitlines()
    except OSError as exc:
        report.error("%s: cannot read: %s" % (path.relative_to(ROOT), exc))
        return result
    for number, line in enumerate(lines, 1):
        if not line.strip():
            continue
        try:
            value = json.loads(line)
        except json.JSONDecodeError as exc:
            report.error(
                "%s:%d: invalid JSON: %s"
                % (path.relative_to(ROOT), number, exc.msg)
            )
            continue
        if not isinstance(value, dict):
            report.error(
                "%s:%d: record is not an object"
                % (path.relative_to(ROOT), number)
            )
            continue
        result.append(value)
    return result


def safe_relative(value: Any) -> bool:
    if not isinstance(value, str) or not value:
        return False
    path = Path(value)
    return not path.is_absolute() and ".." not in path.parts


def unique(
    rows: list[dict[str, Any]], key: str, label: str, report: Report
) -> set[str]:
    values = [str(row.get(key)) for row in rows if row.get(key)]
    missing = len(rows) - len(values)
    duplicates = [value for value, count in Counter(values).items() if count > 1]
    if missing:
        report.error("%s: %d record(s) missing %s" % (label, missing, key))
    if duplicates:
        report.error("%s: duplicate %s values: %s" % (label, key, duplicates[:5]))
    return set(values)


def check_surface(report: Report) -> None:
    for relative in REQUIRED_PATHS:
        if not (ROOT / relative).exists():
            report.error("missing release path: %s" % relative)

    forbidden = ("paper", "archive", "experiments", "benchmark/realworld104")
    for relative in forbidden:
        if (ROOT / relative).exists():
            report.error("forbidden release tree is present: %s/" % relative)

    readme = (ROOT / "README.md").read_text(encoding="utf-8")
    for command in (
        "python3 scripts/check_release_safety.py",
        "python3 scripts/reproduce_results.py --check",
        "benchmark/realworld93",
        "results/leaderboard.md",
        "results/paper/ja93.jsonl",
    ):
        if command not in readme:
            report.error("README.md is missing %r" % command)


def check_full_metadata(report: Report) -> None:
    subjects = read_jsonl(FULL_CORPUS, report)
    builds = read_jsonl(FULL_BUILDS, report)
    subject_ids = unique(subjects, "subject_id", "full corpus", report)
    unique(builds, "build_id", "full builds", report)
    if len(subjects) != 93:
        report.error("screened corpus has %d records; expected 93" % len(subjects))
    if len(builds) != 805:
        report.error("build metadata has %d records; expected 805" % len(builds))
    unknown = {str(row.get("subject_id")) for row in builds} - subject_ids
    if unknown:
        report.error("full build metadata contains %d unknown subjects" % len(unknown))
    release_subjects = {
        str(row.get("subject_id"))
        for row in read_jsonl(BENCHMARK / "sample_ids.jsonl", report)
    }
    if subject_ids != release_subjects:
        report.error("construction corpus differs from realworld93 subjects")
    for row in subjects:
        if not safe_relative(row.get("bundle_path")):
            report.error(
                "full corpus has unsafe bundle_path for %r" % row.get("subject_id")
            )
    for row in builds:
        if not safe_relative(row.get("path")):
            report.error(
                "full builds has unsafe path for %r" % row.get("build_id")
            )
    report.note(
        "screened metadata: %d subjects, %d builds"
        % (len(subjects), len(builds))
    )


def check_sample(report: Report) -> None:
    sample_ids = read_jsonl(SAMPLE / "sample_ids.jsonl", report)
    sample_id_values = unique(sample_ids, "sample_id", "sample ids", report)
    subject_ids = unique(sample_ids, "subject_id", "sample ids", report)
    if sample_id_values != EXPECTED_SAMPLE_IDS:
        report.error("diverse6 sample IDs differ from the release selection")

    subjects = read_jsonl(SAMPLE / "corpus" / "manifest.jsonl", report)
    builds = read_jsonl(SAMPLE / "builds.jsonl", report)
    predictions = read_jsonl(SAMPLE / "predictions" / "identity.jsonl", report)
    if unique(subjects, "subject_id", "sample corpus", report) != subject_ids:
        report.error("sample corpus subjects do not match sample_ids.jsonl")
    if len(builds) != 12:
        report.error("sample has %d builds; expected 12" % len(builds))
    if len(predictions) != 12:
        report.error("sample has %d identity predictions; expected 12" % len(predictions))
    build_ids = unique(builds, "build_id", "sample builds", report)
    prediction_ids = unique(
        predictions, "prediction_id", "sample predictions", report
    )
    if len(prediction_ids) != 12:
        report.error("sample prediction IDs are not unique")

    for row in subjects:
        relative = row.get("bundle_path")
        if not safe_relative(relative) or not (SAMPLE / "corpus" / relative).is_file():
            report.error("missing sample bundle for %r" % row.get("subject_id"))
    for row in builds:
        relative = row.get("path")
        if not safe_relative(relative) or not (SAMPLE / relative).is_file():
            report.error("missing sample build for %r" % row.get("build_id"))
    for row in predictions:
        if row.get("build_id") not in build_ids:
            report.error(
                "prediction %r references an unknown build" % row.get("prediction_id")
            )
        relative = row.get("path")
        source = None
        if isinstance(relative, str) and relative and not Path(relative).is_absolute():
            candidate = (SAMPLE / "predictions" / relative).resolve()
            try:
                candidate.relative_to(SAMPLE.resolve())
            except ValueError:
                pass
            else:
                source = candidate
        if source is None or not source.is_file():
            report.error(
                "prediction %r has a missing path" % row.get("prediction_id")
            )

    sandbox_data = read_json(
        SAMPLE / "sandbox" / "stats" / "sandboxes.json", report
    )
    rows = sandbox_data.get("results", []) if isinstance(sandbox_data, dict) else []
    sandbox_subjects = {
        str(row.get("subject_id")) for row in rows if row.get("ok")
    }
    if sandbox_subjects != subject_ids:
        report.error("sample sandbox index does not match diverse6 subjects")
    for row in rows:
        relative = row.get("path")
        box = SAMPLE / "sandbox" / relative if safe_relative(relative) else None
        if box is None or not (box / "sandbox.json").is_file():
            report.error("missing sample sandbox for %r" % row.get("subject_id"))

    attributions = read_json(SAMPLE / "attributions.json", report)
    if not isinstance(attributions, list) or len(attributions) != 6:
        report.error("sample must contain six project attributions")
    else:
        for row in attributions:
            relative = row.get("license_file")
            if not safe_relative(relative) or not (SAMPLE / relative).is_file():
                report.error("missing license for %r" % row.get("project"))
            project = row.get("project")
            work_license = (
                SAMPLE
                / "corpus"
                / "work"
                / str(project).replace("/", "__")
                / "LICENSE"
            )
            if not project or not work_license.is_file():
                report.error("sample work tree lacks license for %r" % project)

    report.note(
        "diverse6: %d subjects, %d builds, %d sandboxes"
        % (len(subjects), len(builds), len(rows))
    )


def check_public_benchmark(report: Report) -> None:
    index = read_jsonl(BENCHMARK / "sample_ids.jsonl", report)
    subjects = read_jsonl(BENCHMARK / "manifest.jsonl", report)
    jsob = read_jsonl(BENCHMARK / "builds-jsob.jsonl", report)
    vm = read_jsonl(BENCHMARK / "builds-vm.jsonl", report)
    combined = read_jsonl(BENCHMARK / "builds.jsonl", report)
    attributions = read_jsonl(BENCHMARK / "attributions.jsonl", report)

    sample_ids = unique(index, "sample_id", "realworld93 index", report)
    subject_ids = unique(index, "subject_id", "realworld93 index", report)
    if len(index) != 93 or sample_ids != {
        "adb-%03d" % number for number in range(1, 94)
    }:
        report.error("realworld93 must contain adb-001 through adb-093")
    selected_paths = [
        line.strip()
        for line in (BENCHMARK / "subject_paths.txt").read_text(
            encoding="utf-8"
        ).splitlines()
        if line.strip()
    ]
    if selected_paths != [str(row.get("subject_id")) for row in index]:
        report.error("realworld93 subject_paths.txt differs from sample_ids order")
    for label, rows in (
        ("manifest", subjects),
        ("JS-OB builds", jsob),
        ("VM builds", vm),
        ("attributions", attributions),
    ):
        if len(rows) != 93:
            report.error("realworld93 %s has %d rows; expected 93" % (label, len(rows)))
        if unique(rows, "subject_id", "realworld93 " + label, report) != subject_ids:
            report.error("realworld93 %s subject set differs from sample_ids" % label)
    if len(combined) != 186:
        report.error("realworld93 builds.jsonl has %d rows; expected 186" % len(combined))

    for row in subjects:
        relative = row.get("bundle_path")
        if not safe_relative(relative) or not (BENCHMARK / relative).is_file():
            report.error("missing realworld93 original for %r" % row.get("subject_id"))
    for label, rows in (("JS-OB", jsob), ("VM", vm)):
        for row in rows:
            relative = row.get("path")
            if not safe_relative(relative) or not (BENCHMARK / relative).is_file():
                report.error(
                    "missing realworld93 %s build for %r"
                    % (label, row.get("subject_id"))
                )
    for row in attributions:
        relative = row.get("license_file")
        if not safe_relative(relative) or not (BENCHMARK / relative).is_file():
            report.error("missing realworld93 license for %r" % row.get("project"))
    report.note("realworld93: 93 subjects, 186 protected builds")


def check_codenet_benchmark(report: Report) -> None:
    index = read_jsonl(CODENET / "sample_ids.jsonl", report)
    subjects = read_jsonl(CODENET / "manifest.jsonl", report)
    jsob = read_jsonl(CODENET / "builds-jsob-full.jsonl", report)
    c77 = read_jsonl(CODENET / "builds-c77-0.jsonl", report)
    sample_ids = unique(index, "sample_id", "codenet100 index", report)
    subject_ids = unique(index, "subject_id", "codenet100 index", report)
    expected = {"codenet-%03d" % number for number in range(1, 101)}
    if len(index) != 100 or sample_ids != expected:
        report.error("codenet100 must contain codenet-001 through codenet-100")
    if len(subjects) != 100:
        report.error("codenet100 manifest has %d rows; expected 100" % len(subjects))
    if unique(subjects, "subject_id", "codenet100 manifest", report) != subject_ids:
        report.error("codenet100 manifest subjects differ from sample_ids")
    for label, rows in (("JS-OB/full", jsob), ("C77-0", c77)):
        if len(rows) != 100:
            report.error("codenet100 %s has %d builds; expected 100" % (label, len(rows)))
        unique(rows, "build_id", "codenet100 " + label, report)
        for row in rows:
            relative = row.get("path")
            if not safe_relative(relative) or not (CODENET / relative).is_file():
                report.error("missing codenet100 %s build for %r" % (label, row.get("build_id")))
    for row in subjects:
        original = row.get("bundle_path")
        tests = row.get("test_file")
        if not safe_relative(original) or not (CODENET / original).is_file():
            report.error("missing codenet100 original for %r" % row.get("subject_id"))
        if not safe_relative(tests) or not (CODENET / tests).is_file():
            report.error("missing codenet100 tests for %r" % row.get("subject_id"))
    report.note("codenet100: 100 subjects, 200 protected builds")


def check_released_results(report: Report) -> None:
    manifest = read_json(RESULTS / "manifest.json", report)
    runs = manifest.get("runs", []) if isinstance(manifest, dict) else []
    if len(runs) != 24:
        report.error("released result manifest has %d runs; expected 24" % len(runs))
    if sum(int(row.get("prediction_count", 0)) for row in runs) != 2232:
        report.error("released result manifest must cover 2,232 predictions")
    if sum(int(row.get("score_count", 0)) for row in runs) != 2228:
        report.error("released result manifest must cover 2,228 scores")
    completed = subprocess.run(
        [sys.executable, str(ROOT / "scripts" / "reproduce_results.py"), "--check"],
        cwd=ROOT,
        check=False,
        capture_output=True,
        text=True,
    )
    if completed.returncode:
        report.error(
            "released results failed validation: %s"
            % (completed.stderr.strip() or completed.stdout.strip())
        )
    else:
        report.note("final paper: 22 runs over realworld93; 24 historical run directories retained")

    codenet_manifest = read_json(RESULTS / "codenet100" / "manifest.json", report)
    codenet_runs = (
        codenet_manifest.get("runs", [])
        if isinstance(codenet_manifest, dict)
        else []
    )
    if len(codenet_runs) != 13:
        report.error(
            "CodeNet result manifest has %d runs; expected 13" % len(codenet_runs)
        )
    if sum(int(row.get("prediction_count", 0)) for row in codenet_runs) != 1269:
        report.error("CodeNet result manifest must cover 1,269 predictions")
    completed = subprocess.run(
        [
            sys.executable,
            str(ROOT / "scripts" / "reproduce_codenet_results.py"),
            "--check",
        ],
        cwd=ROOT,
        check=False,
        capture_output=True,
        text=True,
    )
    if completed.returncode:
        report.error(
            "CodeNet results failed validation: %s"
            % (completed.stderr.strip() or completed.stdout.strip())
        )
    else:
        report.note("CodeNet100 results: 13 runs, 1,269 outputs and scores")


def check_external_tool_boundary(report: Report) -> None:
    driver = (ROOT / "baselines" / "jsimplifier" / "run.py").read_text(
        encoding="utf-8"
    )
    if 'os.environ.get("ADB_JSIMPLIFIER")' not in driver:
        report.error("JSIMPLIFIER driver does not require ADB_JSIMPLIFIER")
    if 'PROJECT_ROOT / "third_party" / "JSIMPLIFIER"' in driver:
        report.error("JSIMPLIFIER driver still defaults to a vendored checkout")


def main() -> int:
    report = Report()
    check_surface(report)
    check_full_metadata(report)
    check_public_benchmark(report)
    check_codenet_benchmark(report)
    check_released_results(report)
    check_sample(report)
    check_external_tool_boundary(report)

    for note in report.notes:
        print("INFO: %s" % note)
    for warning in report.warnings:
        print("WARNING: %s" % warning, file=sys.stderr)
    for error in report.errors:
        print("ERROR: %s" % error, file=sys.stderr)
    print(
        "release check: %d error(s), %d warning(s)"
        % (len(report.errors), len(report.warnings))
    )
    return 1 if report.errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
