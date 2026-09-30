#!/usr/bin/env python3
"""Run JSimplifier on the javascript-obfuscator bench corpus.

The published CLI rewrites its input and names outputs with a Windows path
split. This driver keeps the corpus read-only, invokes the AST pipeline
(--model=none, no LLM), and writes one replacement program per build:

    results/jsimplifier/jsob_corpus_full/
    ├── predictions.jsonl
    ├── outputs/<build_id>.{cjs,mjs}
    └── logs/<build_id>.json
"""
from __future__ import annotations

import argparse
import json
import os
import re
import signal
import subprocess
import sys
import threading
import time
from pathlib import Path


HERE = Path(__file__).resolve().parent
PROJECT_ROOT = HERE.parents[1]
_JSIMPLIFIER_VALUE = os.environ.get("ADB_JSIMPLIFIER")
JSIMPLIFIER = (
    Path(_JSIMPLIFIER_VALUE).expanduser().resolve()
    if _JSIMPLIFIER_VALUE
    else None
)
DEFAULT_BUILDS = PROJECT_ROOT / "samples" / "diverse6" / "builds.jsonl"
DEFAULT_CORPUS = PROJECT_ROOT / "samples" / "diverse6" / "corpus"
DEFAULT_RUN_ROOT = PROJECT_ROOT / "results" / "jsimplifier" / "jsob_corpus_full"
SYSTEM = "jsimplifier"
VERSION = "1.0.0"
_APPEND_LOCK = threading.Lock()


def read_jsonl(path: Path) -> list[dict]:
    rows = []
    with path.open(encoding="utf-8") as handle:
        for line_number, line in enumerate(handle, 1):
            if not line.strip():
                continue
            row = json.loads(line)
            if not row.get("build_id") or not row.get("subject_id"):
                raise ValueError("%s:%d missing build_id or subject_id" % (path, line_number))
            rows.append(row)
    return rows


def append_jsonl(path: Path, row: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    text = json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n"
    with _APPEND_LOCK:
        with path.open("a", encoding="utf-8") as handle:
            handle.write(text)


def source_path(manifest: Path, build: dict) -> Path:
    path = Path(build["path"])
    return path if path.is_absolute() else (manifest.parent / path).resolve()


def safe_extension(build: dict, source: Path) -> str:
    if build.get("module_format") == "esm":
        return ".mjs"
    if build.get("module_format") == "cjs":
        return ".cjs"
    return source.suffix if source.suffix in (".js", ".mjs", ".cjs") else ".js"


def relative_path(target: Path, record_file: Path) -> str:
    return os.path.relpath(str(target.resolve()), str(record_file.parent.resolve()))


def pick_output(root: Path) -> Path | None:
    if not root.exists():
        return None
    files = [path for path in root.rglob("*") if path.is_file() and path.suffix == ".js"]
    if not files:
        return None
    named = [path for path in files if path.name == "deobfuscated.js"]
    if named:
        files = named
    else:
        files = [path for path in files if path.name != "deobfuscated_original_code.js"] or files
    files.sort(key=lambda path: path.stat().st_size, reverse=True)
    chosen = files[0]
    if chosen.stat().st_size == 0:
        return None
    return chosen


_BIGINT_LITERAL = re.compile(r"0x[0-9a-fA-F]+n|\d+n")


def rewrite_bigint_literals(code: str) -> str:
    """Rewrite bigint literals so esprima can tokenize the program.

    JSIMPLIFIER's recast step falls back to esprima, which rejects `0x0n`.
    `BigInt(0x0)` is the same value and does not touch the tool source.
    String contents are left unchanged.
    """
    out = []
    i = 0
    quote = ""
    n = len(code)
    while i < n:
        c = code[i]
        if quote:
            out.append(c)
            if c == "\\" and i + 1 < n:
                out.append(code[i + 1])
                i += 2
                continue
            if c == quote:
                quote = ""
            i += 1
            continue
        if c in "\"'`":
            quote = c
            out.append(c)
            i += 1
            continue
        match = _BIGINT_LITERAL.match(code, i)
        if match and (i == 0 or code[i - 1] not in "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$_"):
            literal = match.group(0)
            out.append("BigInt(" + literal[:-1] + ")")
            i = match.end()
            continue
        out.append(c)
        i += 1
    return "".join(out)


def run_tool(node: str, source: Path, output_dir: Path, timeout: float,
             extra_args: list[str]) -> tuple[str | None, str, str]:
    assert JSIMPLIFIER is not None
    output_dir.mkdir(parents=True, exist_ok=True)
    command = [
        node, "--import", "tsx",
        str(JSIMPLIFIER / "src" / "index.ts"),
        "deobfuscate",
        "--model", "none",
        *extra_args,
        "--outputDir", str(output_dir),
        str(source),
    ]
    proc = subprocess.Popen(
        command,
        cwd=str(JSIMPLIFIER),
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        start_new_session=True,
    )
    try:
        stdout, stderr = proc.communicate(timeout=timeout)
    except subprocess.TimeoutExpired:
        try:
            os.killpg(proc.pid, signal.SIGKILL)
        except OSError:
            proc.kill()
        stdout, stderr = proc.communicate()
        return "timeout after %.1fs" % timeout, stdout or "", stderr or ""
    stdout = stdout or ""
    stderr = stderr or ""
    if proc.returncode != 0:
        detail = (stderr or stdout).strip() or "tool exited %s" % proc.returncode
        return detail[-4000:], stdout, stderr
    return None, stdout, stderr


def process_one(node: str, build: dict, source: Path, run_dir: Path, timeout: float,
                skip_preprocessing: bool, rewrite_bigint: bool) -> dict:
    output_dir = run_dir / "outputs"
    log_dir = run_dir / "logs"
    scratch = run_dir / "scratch" / build["build_id"]
    output_dir.mkdir(parents=True, exist_ok=True)
    log_dir.mkdir(parents=True, exist_ok=True)
    output = output_dir / (build["build_id"] + safe_extension(build, source))
    log_path = log_dir / (build["build_id"] + ".json")
    started = time.monotonic()
    error = None
    stdout = ""
    stderr = ""
    recovered = False
    if not source.exists():
        error = "build source does not exist: %s" % source
        output.write_text("", encoding="utf-8")
    else:
        if scratch.exists():
            for child in scratch.iterdir():
                if child.is_dir():
                    subprocess.run(["rm", "-rf", str(child)], check=False)
        tool_source = source
        if rewrite_bigint:
            scratch.mkdir(parents=True, exist_ok=True)
            tool_source = scratch / ("input" + source.suffix)
            tool_source.write_text(
                rewrite_bigint_literals(source.read_text(encoding="utf-8", errors="replace")),
                encoding="utf-8")
        extra_args = ["--skip-preprocessing"] if skip_preprocessing else []
        error, stdout, stderr = run_tool(node, tool_source, scratch, timeout, extra_args)
        chosen = pick_output(scratch)
        if chosen is None:
            if error is None:
                error = "JSimplifier produced no JavaScript output"
            output.write_text("", encoding="utf-8")
        else:
            output.write_text(chosen.read_text(encoding="utf-8", errors="replace"), encoding="utf-8")
            # A later stage can crash after webcrack has already written a program.
            # Keep that program; an empty file would be scored as "no answer".
            if error:
                recovered = True
                error = None
        subprocess.run(["rm", "-rf", str(scratch)], check=False)

    elapsed = round(time.monotonic() - started, 4)
    log = {
        "build_id": build["build_id"],
        "subject_id": build["subject_id"],
        "tool": "jsimplifier",
        "version": VERSION,
        "model": "none",
        "skip_preprocessing": skip_preprocessing,
        "rewrite_bigint": rewrite_bigint,
        "source": str(source),
        "output": str(output),
        "ok": error is None,
        "recovered_after_error": recovered,
        "error": error,
        "seconds": elapsed,
        "stdout_tail": stdout[-4000:],
        "stderr_tail": stderr[-4000:],
    }
    log_path.write_text(json.dumps(log, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return {
        "output": output,
        "log": log_path,
        "prediction": {
            "prediction_id": "%s.%s" % (SYSTEM, build["build_id"]),
            "build_id": build["build_id"],
            "subject_id": build["subject_id"],
            "system": SYSTEM,
            "level": "traditional",
            "model": "none",
            "path": None,
            "cost": {"tokens": 0, "tool_calls": 1, "executions": 0, "seconds": elapsed},
            "static_tool": "jsimplifier",
            "static_tool_version": VERSION,
            "tool_ok": error is None,
            "tool_error": error,
            "log_path": None,
        },
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--builds", type=Path, default=DEFAULT_BUILDS)
    parser.add_argument("--corpus", type=Path, default=DEFAULT_CORPUS)
    parser.add_argument("--run-root", type=Path, default=DEFAULT_RUN_ROOT)
    parser.add_argument("--workers", type=int, default=2)
    parser.add_argument("--timeout", type=float, default=480.0,
                        help="wall-clock seconds per build")
    parser.add_argument("--limit", type=int)
    parser.add_argument("--subject", action="append", default=[],
                        help="subject_id or build_id; repeatable")
    parser.add_argument("--resume", action="store_true")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--node", default="node")
    parser.add_argument("--skip-preprocessing", action="store_true",
                        help="pass JSIMPLIFIER's --skip-preprocessing; skips the delete rewriter")
    parser.add_argument("--rewrite-bigint", action="store_true",
                        help="rewrite 0x0n-style literals to BigInt() on a temp copy before the tool sees them")
    args = parser.parse_args()

    if JSIMPLIFIER is None:
        raise SystemExit(
            "JSIMPLIFIER is not vendored; set ADB_JSIMPLIFIER to a "
            "separately obtained and license-reviewed checkout"
        )
    if not (JSIMPLIFIER / "package.json").exists():
        raise SystemExit("JSIMPLIFIER package.json not found at %s" % JSIMPLIFIER)
    manifest = args.builds.resolve()
    corpus = args.corpus.resolve()
    rows = read_jsonl(manifest)
    selected = []
    skipped = 0
    subjects = set(args.subject)
    for row in rows:
        source = source_path(manifest, row)
        if subjects and row["subject_id"] not in subjects and row["build_id"] not in subjects:
            continue
        try:
            source.resolve().relative_to(corpus)
        except ValueError:
            skipped += 1
            continue
        if not source.exists():
            skipped += 1
            continue
        selected.append((row, source))
    if args.limit:
        selected = selected[:args.limit]
    if not selected:
        raise SystemExit("no builds selected under %s" % corpus)

    run_dir = args.run_root.resolve()
    predictions = run_dir / "predictions.jsonl"
    done = set()
    if args.resume and predictions.exists():
        done = {row.get("build_id") for row in read_jsonl(predictions)}
    jobs = [(row, source) for row, source in selected if row["build_id"] not in done]
    print("jsimplifier: %d builds in corpus, %d skipped, %d already done, %d to run"
          % (len(selected), skipped, len(selected) - len(jobs), len(jobs)))
    print("output: %s" % run_dir)
    if args.dry_run:
        return 0

    import concurrent.futures
    succeeded = failed = 0
    with concurrent.futures.ThreadPoolExecutor(max_workers=max(1, args.workers)) as pool:
        futures = {
            pool.submit(process_one, args.node, row, source, run_dir, args.timeout,
                        args.skip_preprocessing, args.rewrite_bigint): row
            for row, source in jobs
        }
        for index, future in enumerate(concurrent.futures.as_completed(futures), 1):
            row = futures[future]
            try:
                result = future.result()
            except Exception as exc:
                output = run_dir / "outputs" / (row["build_id"] + safe_extension(row, source_path(manifest, row)))
                output.parent.mkdir(parents=True, exist_ok=True)
                output.write_text("", encoding="utf-8")
                log_path = run_dir / "logs" / (row["build_id"] + ".json")
                log_path.parent.mkdir(parents=True, exist_ok=True)
                log_path.write_text(json.dumps({
                    "ok": False, "error": "%s: %s" % (type(exc).__name__, exc),
                }, indent=2) + "\n", encoding="utf-8")
                result = {
                    "output": output,
                    "log": log_path,
                    "prediction": {
                        "prediction_id": "%s.%s" % (SYSTEM, row["build_id"]),
                        "build_id": row["build_id"],
                        "subject_id": row["subject_id"],
                        "system": SYSTEM,
                        "level": "traditional",
                        "model": "none",
                        "path": None,
                        "cost": {"tokens": 0, "tool_calls": 1, "executions": 0, "seconds": 0.0},
                        "static_tool": "jsimplifier",
                        "static_tool_version": VERSION,
                        "tool_ok": False,
                        "tool_error": "driver error: %s: %s" % (type(exc).__name__, exc),
                        "log_path": None,
                    },
                }
            record = result["prediction"]
            record["path"] = relative_path(result["output"], predictions)
            record["log_path"] = relative_path(result["log"], predictions)
            append_jsonl(predictions, record)
            if record["tool_ok"]:
                succeeded += 1
            else:
                failed += 1
            print("[%d/%d] %s %s" % (
                index, len(jobs), row["build_id"],
                "ok" if record["tool_ok"] else "FAILED"), flush=True)
    print("finished: %d ok, %d failed" % (succeeded, failed))
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print("interrupted; rerun with --resume", file=sys.stderr)
        sys.exit(130)
