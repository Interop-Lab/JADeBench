#!/usr/bin/env python3
"""Run the paper's pinned S1 traditional static deobfuscator baselines.

The two systems are webcrack 2.16.0 and Synchrony/deobfuscator 2.4.6. Each
receives only the obfuscated build and returns one complete JavaScript program.
Results use the same predictions.jsonl contract as the other baselines.
"""
from __future__ import annotations

import argparse
import concurrent.futures
import json
import os
import subprocess
import sys
import tempfile
import time
from pathlib import Path


HERE = Path(__file__).resolve().parent
PROJECT_ROOT = HERE.parents[1]
DEFAULT_BUILDS = (
    PROJECT_ROOT
    / "samples"
    / "diverse6"
    / "corpus"
    / "jsob"
    / "manifest.jsonl"
)
DEFAULT_RUN_ROOT = PROJECT_ROOT / "results" / "runs" / "static_tools" / "jsob"
RUNNER = HERE / "runner.mjs"
TOOLS = ("webcrack", "synchrony")
SYSTEMS = {"webcrack": "webcrack@S1", "synchrony": "synchrony@S1"}
VERSIONS = {"webcrack": "2.16.0", "synchrony": "2.4.6"}


def read_jsonl(path: Path) -> list[dict]:
    if not path.exists():
        raise FileNotFoundError(path)
    rows = []
    seen = set()
    with path.open(encoding="utf-8") as handle:
        for line_number, line in enumerate(handle, 1):
            if not line.strip():
                continue
            row = json.loads(line)
            for key in ("build_id", "subject_id"):
                if not row.get(key):
                    raise ValueError("%s:%d missing %s" % (path, line_number, key))
            if not (row.get("path") or row.get("jsob_file") or row.get("vm_file")):
                raise ValueError(
                    "%s:%d missing path, jsob_file, or vm_file"
                    % (path, line_number)
                )
            if row["build_id"] in seen:
                raise ValueError("duplicate build_id %r in %s" % (row["build_id"], path))
            seen.add(row["build_id"])
            rows.append(row)
    return rows


def append_jsonl(path: Path, row: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n")


def installed_versions(node: str) -> dict:
    try:
        proc = subprocess.run(
            [node, str(RUNNER), "--versions"], cwd=str(HERE), text=True,
            stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=30, check=False)
    except (OSError, subprocess.TimeoutExpired) as exc:
        raise SystemExit("cannot inspect static-tool dependencies: %s" % exc)
    if proc.returncode != 0:
        raise SystemExit(
            "static-tool dependencies are unavailable; run `npm install` in %s\n%s"
            % (HERE, (proc.stderr or proc.stdout).strip()))
    found = json.loads(proc.stdout)
    for tool, expected in VERSIONS.items():
        if found.get(tool) != expected:
            raise SystemExit("%s must be %s, found %s" % (tool, expected, found.get(tool)))
    return found


def source_path(manifest: Path, build: dict) -> Path:
    path = Path(
        build.get("path") or build.get("jsob_file") or build.get("vm_file")
    )
    return path if path.is_absolute() else (manifest.parent / path).resolve()


def relative_path(target: Path, record_file: Path) -> str:
    return os.path.relpath(str(target.resolve()), str(record_file.parent.resolve()))


def safe_extension(build: dict, source: Path) -> str:
    if build.get("module_format") == "esm":
        return ".mjs"
    if build.get("module_format") == "cjs":
        return ".cjs"
    return source.suffix if source.suffix in (".js", ".mjs", ".cjs") else ".js"


def process_one(node: str, manifest: Path, build: dict, tool: str,
                run_dir: Path, timeout: float) -> dict:
    source = source_path(manifest, build)
    output_dir = run_dir / "outputs"
    log_dir = run_dir / "logs"
    output_dir.mkdir(parents=True, exist_ok=True)
    log_dir.mkdir(parents=True, exist_ok=True)
    output = output_dir / (build["build_id"] + safe_extension(build, source))
    log_path = log_dir / (build["build_id"] + ".json")
    output.write_text("", encoding="utf-8")

    started = time.monotonic()
    metadata = {}
    error = None
    stdout = ""
    stderr = ""
    if not source.exists():
        error = "build source does not exist: %s" % source
    else:
        meta_handle = tempfile.NamedTemporaryFile(
            prefix="adb-static-", suffix=".json", delete=False)
        meta_handle.close()
        meta_path = Path(meta_handle.name)
        try:
            try:
                proc = subprocess.run(
                    [node, str(RUNNER), tool, str(source), str(output), str(meta_path)],
                    cwd=str(HERE), text=True, stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE, timeout=timeout, check=False)
                stdout, stderr = proc.stdout or "", proc.stderr or ""
                if meta_path.exists() and meta_path.stat().st_size:
                    metadata = json.loads(meta_path.read_text(encoding="utf-8"))
                if proc.returncode != 0 or not metadata.get("ok"):
                    error = metadata.get("error") or stderr.strip() or stdout.strip() \
                        or "tool exited %s" % proc.returncode
            except subprocess.TimeoutExpired as exc:
                stdout = exc.stdout or ""
                stderr = exc.stderr or ""
                error = "timeout after %.1fs" % timeout
            except (OSError, ValueError) as exc:
                error = "%s: %s" % (type(exc).__name__, exc)
        finally:
            try:
                meta_path.unlink()
            except OSError:
                pass

    if error:
        output.write_text("", encoding="utf-8")
    elapsed = round(time.monotonic() - started, 4)
    log = {
        "build_id": build["build_id"],
        "subject_id": build["subject_id"],
        "tool": tool,
        "version": VERSIONS[tool],
        "source": str(source),
        "output": str(output),
        "ok": error is None,
        "error": error,
        "seconds": elapsed,
        "adapter_metadata": metadata,
        "stdout_tail": stdout[-4000:],
        "stderr_tail": stderr[-4000:],
    }
    log_path.write_text(json.dumps(log, ensure_ascii=False, indent=2) + "\n",
                        encoding="utf-8")

    system = SYSTEMS[tool]
    prediction = {
        "prediction_id": "%s.%s" % (system, build["build_id"]),
        "build_id": build["build_id"],
        "subject_id": build["subject_id"],
        "system": system,
        "level": "traditional",
        "path": None,  # filled relative to predictions.jsonl by the caller
        "cost": {
            "tokens": 0,
            "tool_calls": 1,
            "executions": 0,
            "seconds": elapsed,
        },
        "static_tool": tool,
        "static_tool_version": VERSIONS[tool],
        "tool_ok": error is None,
        "tool_error": error,
        "log_path": None,
    }
    return {"prediction": prediction, "output": output, "log": log_path}


def select_builds(rows: list[dict], subjects: set[str], limit: int | None) -> list[dict]:
    if subjects:
        rows = [row for row in rows
                if row["subject_id"] in subjects or row["build_id"] in subjects]
    return rows[:limit] if limit else rows


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--builds", type=Path, default=DEFAULT_BUILDS)
    parser.add_argument("--run-root", type=Path, default=DEFAULT_RUN_ROOT)
    parser.add_argument("--tool", choices=("all",) + TOOLS, default="all")
    parser.add_argument("--workers", type=int, default=4)
    parser.add_argument("--timeout", type=float, default=300.0,
                        help="wall-clock seconds per build and tool")
    parser.add_argument("--limit", type=int)
    parser.add_argument("--subject", action="append", default=[],
                        help="subject_id or build_id; repeatable")
    parser.add_argument("--resume", action="store_true")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--fail-on-tool-error", action="store_true",
                        help="return exit code 2 when any tool/build result failed")
    parser.add_argument("--node", default="node")
    args = parser.parse_args()

    manifest = args.builds.resolve()
    rows = select_builds(read_jsonl(manifest), set(args.subject), args.limit)
    if not rows:
        raise SystemExit("no builds selected")
    tools = TOOLS if args.tool == "all" else (args.tool,)

    missing = [str(source_path(manifest, row)) for row in rows
               if not source_path(manifest, row).exists()]
    if missing:
        raise SystemExit("%d selected build file(s) are missing; first: %s"
                         % (len(missing), missing[0]))
    if args.dry_run:
        print("dry run: %d builds x %d tools = %d predictions"
              % (len(rows), len(tools), len(rows) * len(tools)))
        for tool in tools:
            print("  %s -> %s" % (SYSTEMS[tool], (args.run_root / tool).resolve()))
        return 0

    found = installed_versions(args.node)
    print("versions: node=%s webcrack=%s synchrony=%s"
          % (found["node"], found["webcrack"], found["synchrony"]))

    jobs = []
    for tool in tools:
        run_dir = (args.run_root / tool).resolve()
        predictions = run_dir / "predictions.jsonl"
        done = set()
        if args.resume and predictions.exists():
            done = {row.get("build_id") for row in read_jsonl(predictions)}
        for build in rows:
            if build["build_id"] not in done:
                jobs.append((tool, run_dir, predictions, build))
        print("%s: %d selected, %d already complete"
              % (SYSTEMS[tool], len(rows), len(done & {r['build_id'] for r in rows})))

    succeeded = failed = 0
    with concurrent.futures.ThreadPoolExecutor(max_workers=max(1, args.workers)) as pool:
        futures = {
            pool.submit(process_one, args.node, manifest, build, tool, run_dir,
                        args.timeout): (tool, predictions, build)
            for tool, run_dir, predictions, build in jobs
        }
        for index, future in enumerate(concurrent.futures.as_completed(futures), 1):
            tool, predictions, build = futures[future]
            try:
                result = future.result()
            except Exception as exc:  # one tool/build must not abort the experiment
                run_dir = predictions.parent
                output = run_dir / "outputs" / (build["build_id"] + safe_extension(
                    build, source_path(manifest, build)))
                output.parent.mkdir(parents=True, exist_ok=True)
                output.write_text("", encoding="utf-8")
                result = {
                    "output": output,
                    "log": run_dir / "logs" / (build["build_id"] + ".json"),
                    "prediction": {
                        "prediction_id": "%s.%s" % (SYSTEMS[tool], build["build_id"]),
                        "build_id": build["build_id"], "subject_id": build["subject_id"],
                        "system": SYSTEMS[tool], "level": "traditional", "path": None,
                        "cost": {"tokens": 0, "tool_calls": 1, "executions": 0,
                                 "seconds": 0.0},
                        "static_tool": tool, "static_tool_version": VERSIONS[tool],
                        "tool_ok": False,
                        "tool_error": "driver error: %s: %s" % (type(exc).__name__, exc),
                        "log_path": None,
                    },
                }
                result["log"].parent.mkdir(parents=True, exist_ok=True)
                result["log"].write_text(json.dumps({"ok": False,
                    "error": result["prediction"]["tool_error"]}, indent=2) + "\n")
            record = result["prediction"]
            record["path"] = relative_path(result["output"], predictions)
            record["log_path"] = relative_path(result["log"], predictions)
            append_jsonl(predictions, record)
            if record["tool_ok"]:
                succeeded += 1
            else:
                failed += 1
            print("[%d/%d] %s %s %s" % (
                index, len(jobs), tool, build["build_id"],
                "ok" if record["tool_ok"] else "FAILED"))

    print("finished: %d ok, %d failed" % (succeeded, failed))
    # An unsupported/malformed build is a measured tool result, not a driver
    # crash. Keep the default suitable for long experiment pipelines while
    # offering a strict mode for CI and adapter debugging.
    return 2 if failed and args.fail_on_tool_error else 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print("interrupted; use --resume to continue", file=sys.stderr)
        sys.exit(130)
