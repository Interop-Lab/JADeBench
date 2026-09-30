#!/usr/bin/env python3
"""Safe repository-level command planner for AgentDeobfBench."""

from __future__ import annotations

import argparse
import shlex
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Sequence


ROOT = Path(__file__).resolve().parents[1]


@dataclass(frozen=True)
class Step:
    cwd: Path
    argv: tuple[str, ...]
    note: str


def python() -> str:
    return sys.executable


def display(step: Step) -> None:
    relative = step.cwd.relative_to(ROOT)
    where = "." if str(relative) == "." else str(relative)
    print(f"[{where}] {shlex.join(step.argv)}")
    print(f"  # {step.note}")


def run_steps(steps: Sequence[Step], execute: bool) -> int:
    for step in steps:
        display(step)
    if not execute:
        print("\nPreview only. Re-run with global --execute to start these commands.")
        return 0

    for step in steps:
        completed = subprocess.run(step.argv, cwd=step.cwd, check=False)
        if completed.returncode:
            return completed.returncode
    return 0


def corpus_steps(args: argparse.Namespace) -> list[Step]:
    argv = ("./run_all.sh",)
    if args.stage is not None:
        argv += (str(args.stage),)
    if args.pilot:
        argv = ("env", "PILOT=1", *argv)
    return [
        Step(
            ROOT / "corpus",
            argv,
            "Corpus discovery/build can clone repositories, install packages, and run tests.",
        )
    ]


def sandbox_steps(args: argparse.Namespace) -> list[Step]:
    phases = [args.phase] if args.phase != "all" else ["build", "validate", "reference"]
    commands = {
        "build": (
            python(),
            "scripts/build_sandboxes.py",
            "--jobs",
            str(args.jobs),
        ),
        "validate": (
            python(),
            "scripts/validate.py",
            "--jobs",
            str(args.jobs),
        ),
        "reference": (
            python(),
            "scripts/score.py",
            "--all",
            "--record-reference",
            "--jobs",
            str(args.jobs),
        ),
    }
    notes = {
        "build": "Rebuilds generated sandbox views.",
        "validate": "Checks loadability and ground-truth isolation.",
        "reference": "Runs project tests to refresh reference records.",
    }
    return [Step(ROOT / "sandbox", commands[phase], notes[phase]) for phase in phases]


def obfuscate_steps(args: argparse.Namespace) -> list[Step]:
    argv: tuple[str, ...] = ("./run_all.sh",)
    if args.stage is not None:
        argv += (str(args.stage),)
    if args.pilot:
        argv = ("env", "PILOT=1", *argv)
    return [
        Step(
            ROOT / "obfuscators",
            argv,
            "Build generation and differential admission can be CPU- and time-intensive.",
        )
    ]


def baseline_steps(args: argparse.Namespace) -> list[Step]:
    runner = ROOT / "baselines" / args.name / "run.py"
    if not runner.is_file():
        raise ValueError(
            f"unknown baseline {args.name!r}: expected {runner.relative_to(ROOT)}"
        )
    forwarded = list(args.runner_args)
    if forwarded and forwarded[0] == "--":
        forwarded.pop(0)
    return [
        Step(
            ROOT,
            (python(), str(runner.relative_to(ROOT)), *forwarded),
            "Baseline runs may call external models or tools and consume paid quota.",
        )
    ]


def evaluate_steps(args: argparse.Namespace) -> list[Step]:
    argv = [
        "env",
        "ADB_CORPUS=%s" % Path(args.corpus_root).expanduser().resolve(),
        "ADB_SANDBOX=%s" % Path(args.sandbox_root).expanduser().resolve(),
        python(),
        "score.py",
        "--predictions",
        str(Path(args.predictions).expanduser().resolve()),
        "--builds",
        str(Path(args.builds).expanduser().resolve()),
        "--out",
        str(Path(args.out).expanduser().resolve()),
        "--jobs",
        str(args.jobs),
    ]
    if args.manifest:
        argv.extend(
            ["--manifest", str(Path(args.manifest).expanduser().resolve())]
        )
    if args.no_execution:
        argv.append("--no-execution")
    return [
        Step(
            ROOT / "evaluators",
            tuple(argv),
            "Execution scoring runs project test suites; --no-execution limits scoring to static metrics.",
        )
    ]


def check_repository() -> int:
    completed = subprocess.run(
        [python(), str(ROOT / "scripts" / "check_repository.py")],
        cwd=ROOT,
        check=False,
    )
    return completed.returncode


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description=(
            "Plan existing AgentDeobfBench component commands. Expensive commands "
            "are previewed unless global --execute is supplied."
        )
    )
    parser.add_argument(
        "--execute",
        action="store_true",
        help="execute the displayed command plan (default: preview only)",
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    corpus = subparsers.add_parser("corpus", help="plan corpus construction")
    corpus.add_argument("--stage", type=int, choices=range(1, 7))
    corpus.add_argument("--pilot", action="store_true")

    sandbox = subparsers.add_parser("sandbox", help="plan sandbox lifecycle commands")
    sandbox.add_argument(
        "--phase",
        choices=("all", "build", "validate", "reference"),
        default="all",
    )
    sandbox.add_argument("--jobs", type=int, default=4)

    obfuscate = subparsers.add_parser("obfuscate", help="plan open-source obfuscation")
    obfuscate.add_argument("--stage", type=int, choices=range(1, 5))
    obfuscate.add_argument("--pilot", action="store_true")

    baseline = subparsers.add_parser("baseline", help="plan one existing baseline runner")
    baseline.add_argument("name", help="directory below baselines/ containing run.py")
    baseline.add_argument(
        "runner_args",
        nargs=argparse.REMAINDER,
        help="arguments forwarded to the runner; use -- before runner flags",
    )

    evaluate = subparsers.add_parser("evaluate", help="plan evaluator scoring")
    evaluate.add_argument("--predictions", required=True)
    evaluate.add_argument(
        "--builds",
        default=str(ROOT / "samples" / "diverse6" / "builds.jsonl"),
    )
    evaluate.add_argument(
        "--manifest",
        default=str(
            ROOT / "samples" / "diverse6" / "corpus" / "manifest.jsonl"
        ),
    )
    evaluate.add_argument(
        "--corpus-root",
        default=str(ROOT / "samples" / "diverse6" / "corpus"),
    )
    evaluate.add_argument(
        "--sandbox-root",
        default=str(ROOT / "samples" / "diverse6" / "sandbox"),
    )
    evaluate.add_argument("--out", required=True)
    evaluate.add_argument("--jobs", type=int, default=4)
    evaluate.add_argument("--no-execution", action="store_true")

    subparsers.add_parser("check", help="run low-cost repository surface checks")
    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    if args.command == "check":
        return check_repository()

    planners = {
        "corpus": corpus_steps,
        "sandbox": sandbox_steps,
        "obfuscate": obfuscate_steps,
        "baseline": baseline_steps,
        "evaluate": evaluate_steps,
    }
    try:
        steps = planners[args.command](args)
    except ValueError as error:
        parser.error(str(error))
    return run_steps(steps, args.execute)


if __name__ == "__main__":
    raise SystemExit(main())
