#!/usr/bin/env python3
"""Run the upstream OpenCode CLI as a deobfuscation baseline.

Same shape as OH-Bench and as typing in the OpenCode TUI: an isolated copy of
the agent-visible sandbox, ``TASK.md``, and ``opencode run`` with that text.
The collected artifact is ``answer.js``. Predictions use the L0 jsonl contract
so ``evaluators/score.py`` can score them.
"""

from __future__ import print_function

import argparse
import concurrent.futures
import hashlib
import importlib.util
import json
import os
import shutil
import sys
import time
from pathlib import Path


HERE = Path(__file__).resolve().parent
if HERE.parent.parent.name == "artifacts":
    ARTIFACTS_ROOT = HERE.parent.parent
    PROJECT_ROOT = ARTIFACTS_ROOT.parent
else:
    PROJECT_ROOT = HERE.parent.parent
    ARTIFACTS_ROOT = PROJECT_ROOT
L0_DIR = HERE.parent / "L0"
_L0_SPEC = importlib.util.spec_from_file_location("_adb_l0_run", L0_DIR / "run.py")
l0 = importlib.util.module_from_spec(_L0_SPEC)
_L0_SPEC.loader.exec_module(l0)
_WORKSPACE_SPEC = importlib.util.spec_from_file_location(
    "_adb_workspace", HERE.parent / "workspace.py")
workspace_lib = importlib.util.module_from_spec(_WORKSPACE_SPEC)
_WORKSPACE_SPEC.loader.exec_module(workspace_lib)
_WORKER_SPEC = importlib.util.spec_from_file_location(
    "_adb_opencode_worker", HERE / "worker.py")
opencode_worker = importlib.util.module_from_spec(_WORKER_SPEC)
_WORKER_SPEC.loader.exec_module(opencode_worker)

DEFAULT_BUILDS = (
    ARTIFACTS_ROOT
    / "samples"
    / "diverse6"
    / "corpus"
    / "jsob"
    / "manifest.jsonl"
)
DEFAULT_CONFIG = HERE / "config.example.json"
DEFAULT_PROMPT = HERE / "prompt.txt"
LEVEL = "opencode"
FINALIZER_PROMPT = (
    "You finish a deobfuscation job after OpenCode stopped without writing "
    "answer.js. The user message has the obfuscated source and OpenCode's last "
    "notes. Recover a readable, behavior-preserving JavaScript program. Preserve "
    "the module system and public exports. Return exactly one complete JavaScript "
    "program and nothing else. Do not use Markdown fences."
)


def make_agent_workspace(agent_dir, entry, source):
    """Repo with the original program as valid JavaScript.

    OpenCode Read truncates each line at 2000 characters, so the agent must
    ``cat`` ``{entry}`` (or read it from Node) instead of using Read. Do not
    wrap the program into a second file: that copy is not runnable. Sandbox
    harness files are removed so the agent does not spend its step budget
    there.
    """
    tmp, workspace = workspace_lib.make_workspace(agent_dir, entry, source)
    workspace = Path(workspace)
    target = workspace / entry
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(source, encoding="utf-8")
    for name in ("harness", "cassette.json"):
        path = workspace / name
        if path.is_dir():
            shutil.rmtree(str(path), ignore_errors=True)
        elif path.is_file():
            path.unlink()
    return tmp, workspace


def add_usage(total, usage):
    usage = usage or {}
    for key in ("prompt_tokens", "completion_tokens", "total_tokens"):
        value = usage.get(key)
        if value is None:
            continue
        total[key] = (total.get(key) or 0) + value
    return total


def run_finalizer(result, source, config, args):
    """One Chat Completions pass when OpenCode exits without a program."""
    notes = ((result.get("metadata") or {}).get("last_text") or "").strip()[:4000]
    visible, truncated = l0.truncate_source(source, args.max_input_tokens)
    user = (
        "<obfuscated-javascript>\n" + visible + "\n</obfuscated-javascript>\n\n"
        "<opencode-notes>\n" + notes + "\n</opencode-notes>\n\n"
        "Return the single deobfuscated JavaScript program now."
    )
    messages = [
        {"role": "system", "content": FINALIZER_PROMPT},
        {"role": "user", "content": user},
    ]
    timeout = min(float(args.timeout), 90.0)
    print("[opencode] empty artifact; running one finalizer request", flush=True)
    stage = dict(config)
    stage["max_output_tokens"] = min(int(config.get("max_output_tokens") or 16384), 16384)
    payload, attempts, error, elapsed = l0.call_model(stage, messages, timeout, 1)
    raw = l0.response_text(payload)
    code = l0.extract_code(raw)
    ok, detail = ((False, "empty candidate") if not code.strip()
                  else opencode_worker.syntax_check(code))
    meta = result.setdefault("metadata", {})
    usage = l0.usage_from(payload)
    add_usage(meta.setdefault("usage", {}), usage)
    meta["finalizer"] = {
        "error": error,
        "attempts": attempts,
        "elapsed": round(elapsed, 4),
        "input_truncated": truncated,
        "usage": usage,
        "response_chars": len(raw or ""),
    }
    result["patch"] = code
    result["answer_source"] = "finalizer"
    result["syntax_ok"] = ok
    result["syntax_detail"] = detail
    if error and not code.strip():
        meta["error"] = error
    elif code.strip():
        meta["error"] = None
    return result


def cleanup_tmp(tmp):
    if tmp is None:
        return
    shutil.rmtree(str(tmp), ignore_errors=True)


def task_payload(build, workspace, source, entry, args, config, prompt):
    provider, _model, snapshot = opencode_worker.split_model(config)
    return {
        "build_id": build["build_id"],
        "repo_path": str(workspace),
        "entry": entry,
        "source": source,
        "model": config.get("model"),
        "provider": config.get("provider") or provider,
        "base_url": config.get("base_url"),
        "api_key_env": config.get("api_key_env", "OPENAI_API_KEY"),
        "api_key": config.get("api_key"),
        "timeout": args.timeout,
        "max_steps": args.max_steps,
        "bash_timeout_ms": int(config.get("bash_timeout_ms") or 120000),
        "max_input_tokens": args.max_input_tokens,
        "max_output_tokens": config.get("max_output_tokens", 32768),
        "temperature": config.get("temperature"),
        "thinking": config.get("thinking") or {"type": "disabled"},
        "variant": config.get("variant") or args.variant,
        "prompt": prompt,
        "opencode_executable": args.opencode_executable,
        "max_passes": (
            args.max_passes if args.max_passes is not None
            else int(config.get("max_passes") or 2)),
        "opencode_model": snapshot,
    }


def run_one(job):
    (index, build, args, config, prompt, sandbox_map) = job
    started = time.time()
    build_id = build["build_id"]
    source_path = l0.build_source_path(args.builds, build)
    source = source_path.read_text(encoding="utf-8", errors="replace")
    box = sandbox_map.get(build["subject_id"])
    if not box:
        raise RuntimeError("no agent sandbox for %s" % build["subject_id"])
    meta = l0.read_json(box / "agent" / "sandbox.json")
    entry = meta.get("entry") or "subject.mjs"
    output_name = l0.slug(build_id) + ".js"
    transcript_name = l0.slug(build_id) + ".json"
    output_path = args.output_dir / output_name
    transcript_path = args.transcript_dir / transcript_name
    tmp = None
    workspace = None
    error = None
    result = None
    code = ""
    status = "ok"

    if args.dry_run:
        status = "dry_run"
        error = "dry_run: OpenCode was not launched"
        task = {
            "build_id": build_id,
            "entry": entry,
            "repo_path": str(box / "agent"),
            "model": config.get("model"),
            "provider": config.get("provider"),
            "base_url": config.get("base_url"),
            "api_key_env": config.get("api_key_env", "OPENAI_API_KEY"),
            "timeout": args.timeout,
            "max_steps": args.max_steps,
            "bash_timeout_ms": int(config.get("bash_timeout_ms") or 120000),
            "max_input_tokens": args.max_input_tokens,
            "max_output_tokens": config.get("max_output_tokens", 131072),
            "prompt": prompt,
            "source": source,
        }
        prompt_text = opencode_worker.build_prompt(task)
        product = opencode_worker.build_opencode_config(task)
        result = {
            "prompt": prompt_text,
            "opencode_config": product,
            "answer_source": "none",
            "syntax_ok": False,
            "metadata": {"error": error, "returncode": None, "usage": {}},
        }
    else:
        print("[opencode] start #%d %s timeout=%ss" %
              (index, build_id, int(args.timeout)), flush=True)
        tmp, workspace = make_agent_workspace(box / "agent", entry, source)
        (workspace / opencode_worker.ANSWER_NAME).write_text(
            source, encoding="utf-8")
        task = task_payload(build, workspace, source, entry, args, config, prompt)
        result = opencode_worker.process_task(task)
        code = result.get("patch") or ""
        if not code.strip() and args.finalizer:
            result = run_finalizer(result, source, config, args)
            code = result.get("patch") or ""
        error = (result.get("metadata") or {}).get("error")
        answer_source = result.get("answer_source")
        if (code.strip() and result.get("syntax_ok") is not False
                and answer_source not in (
                    "input_fallback", "under_deobfuscated")):
            # A complete artifact written before a wall-time kill still counts.
            status = "ok"
            error = None
        elif answer_source == "under_deobfuscated":
            status = "under_deobfuscated"
            error = error or "answer.js is still obfuscated"
        elif answer_source == "input_fallback":
            status = "timeout" if (
                error and str(error).startswith("Timeout")) else "empty_response"
            error = error or "agent did not improve the input fallback"
        elif error:
            # Preserve transport/timeout failures instead of overwriting them
            # with a secondary syntax error from an incomplete artifact.
            status = "request_error"
        elif not code.strip():
            status = "empty_response"
            error = "empty_response"
        else:
            status = "syntax_invalid"
            error = result.get("syntax_detail")

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(code, encoding="utf-8")
    prompt_hash = hashlib.sha256(
        (result.get("prompt") or prompt).encode("utf-8")
    ).hexdigest()
    usage = ((result.get("metadata") or {}).get("usage") or {})
    transcript = {
        "build_id": build_id,
        "subject_id": build.get("subject_id"),
        "system": args.system,
        "level": LEVEL,
        "model": config.get("model"),
        "status": status,
        "entry": entry,
        "workspace": str(workspace) if workspace else None,
        "sandbox_path": str(box),
        "source_path": str(source_path),
        "source_chars": len(source),
        "prompt_sha256": prompt_hash,
        "prompt": result.get("prompt"),
        "opencode_config": result.get("opencode_config"),
        "answer_source": result.get("answer_source"),
        "syntax_ok": result.get("syntax_ok"),
        "syntax_detail": result.get("syntax_detail"),
        "metadata": result.get("metadata"),
        "error": error,
    }
    l0.write_json(transcript_path, transcript)
    cleanup_tmp(tmp)
    prediction = {
        "prediction_id": "%s.%s" % (args.system, build_id),
        "build_id": build_id,
        "subject_id": build["subject_id"],
        "system": args.system,
        "level": LEVEL,
        "model": config.get("model"),
        "path": os.path.relpath(str(output_path), str(args.output.parent)),
        "status": status,
        "input_truncated": False,
        "tool_ok": result.get("syntax_ok") is True,
        "transcript_path": os.path.relpath(str(transcript_path),
                                            str(args.output.parent)),
        "cost": dict(usage, seconds=round(time.time() - started, 4),
                      input_chars=len(source),
                      answer_source=result.get("answer_source"),
                      passes=((result.get("metadata") or {}).get("passes")),
                      rejected_obfuscated=result.get("answer_source") in (
                          "input_fallback", "under_deobfuscated"),
                      timeout=args.timeout),
    }
    if error:
        prediction["driver_error"] = error
    if args.show_response and code:
        preview = code.replace("\n", " ")
        print("[opencode %02d] %s status=%s preview=%s" %
              (index, build_id, status, preview[:240]),
              file=sys.stderr, flush=True)
    return index, prediction


def parse_args(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--builds", type=Path, default=DEFAULT_BUILDS,
                        help="builds.jsonl; paths resolve relative to this file")
    parser.add_argument("--config", type=Path, default=DEFAULT_CONFIG,
                        help="JSON API/model configuration")
    parser.add_argument("--model", help="override config model")
    parser.add_argument("--base-url", help="override config endpoint/base_url")
    parser.add_argument("--provider",
                        help="LLM gateway: sophnet, openrouter, or soleapi")
    parser.add_argument("--prompt", type=Path, default=DEFAULT_PROMPT)
    parser.add_argument("--output", type=Path, default=HERE / "predictions.jsonl")
    parser.add_argument("--output-dir", type=Path, default=HERE / "outputs")
    parser.add_argument("--transcript-dir", type=Path, default=HERE / "transcripts")
    parser.add_argument("--system", default="openai/gpt-5.6-sol@opencode")
    parser.add_argument("--workers", type=int, default=1)
    parser.add_argument("--limit", type=int,
                        help="evaluate only the first N matching builds")
    parser.add_argument("--timeout", type=float,
                        help="per-instance OpenCode wall timeout in seconds")
    parser.add_argument("--max-passes", type=int,
                        help="passes while answer.js stays obfuscated "
                             "(default: config max_passes or 2)")
    parser.add_argument("--max-steps", type=int,
                        help="OpenCode build-agent step cap (bounds tool iterations)")
    parser.add_argument("--variant",
                        help="OpenCode --variant (reasoning effort), e.g. minimal")
    parser.add_argument("--max-input-tokens", type=int, default=None)
    parser.add_argument("--opencode-executable", default="opencode")
    parser.add_argument("--finalizer", action="store_true",
                        help="one Chat Completions fallback if OpenCode writes nothing (off by default)")
    parser.add_argument("--no-finalizer", action="store_true",
                        help="deprecated: finalizer is already off unless --finalizer is set")
    parser.add_argument("--dry-run", action="store_true",
                        help="materialize prompts without launching OpenCode")
    parser.add_argument("--show-response", action="store_true")
    parser.add_argument("--resume", action="store_true")
    return parser.parse_args(argv)


def main(argv=None):
    args = parse_args(argv)
    args.builds = args.builds.resolve()
    args.config = args.config.resolve()
    args.prompt = args.prompt.resolve()
    args.output = args.output.resolve()
    args.output_dir = args.output_dir.resolve()
    args.transcript_dir = args.transcript_dir.resolve()
    if not args.builds.exists():
        raise SystemExit("build manifest not found: %s" % args.builds)
    config = l0.read_json(args.config)
    if args.model:
        config["model"] = args.model
    if args.base_url:
        config["base_url"] = args.base_url
    if args.provider:
        config["provider"] = args.provider
    config = opencode_worker.apply_provider(
        config, replace_endpoint=bool(args.provider) and not args.base_url)
    if args.max_input_tokens is None:
        args.max_input_tokens = int(config.get("max_input_tokens", 900000))
    if args.timeout is None:
        args.timeout = float(config.get("timeout_seconds", 1200))
    if args.max_steps is None:
        args.max_steps = int(config.get("max_steps", 24))
    if not config.get("model"):
        config["model"] = os.environ.get(
            "LLM_MODEL", opencode_worker.DEFAULT_OPENROUTER_MODEL)
    if not config.get("base_url"):
        config["base_url"] = os.environ.get("LLM_BASE_URL")
    if not config.get("base_url") and not args.dry_run:
        raise SystemExit("missing endpoint: set config base_url, "
                         "--provider sophnet|openrouter|soleapi, or LLM_BASE_URL")
    env_name = config.get("api_key_env", "OPENROUTER_API_KEY")
    if not config.get("api_key"):
        config["api_key"] = os.environ.get(env_name)
    if not args.dry_run and not config.get("api_key"):
        raise SystemExit("missing API key: set %s or use --dry-run" % env_name)
    exe = Path(args.opencode_executable)
    found = shutil.which(args.opencode_executable)
    if not found and exe.exists() and os.access(str(exe), os.X_OK):
        found = str(exe)
    if not args.dry_run and not found:
        raise SystemExit("opencode CLI not found: %s" % args.opencode_executable)
    prompt = l0.load_prompt(args.prompt)
    sandbox_map = workspace_lib.load_sandboxes()
    builds = l0.select_builds(l0.read_jsonl(args.builds))
    if not builds:
        raise SystemExit("no matching builds in %s" % args.builds)
    if args.limit is not None:
        builds = builds[: max(0, args.limit)]
    missing = [b["subject_id"] for b in builds if b["subject_id"] not in sandbox_map]
    if missing:
        raise SystemExit("no agent sandbox for %s" % missing[0])
    done = set()
    if args.resume and args.output.exists():
        done = set(r.get("build_id") for r in l0.read_jsonl(args.output))
    jobs = [(i, b, args, config, prompt, sandbox_map)
            for i, b in enumerate(builds, 1) if b.get("build_id") not in done]
    print("opencode: %d builds, %d pending, workers=%d, dry_run=%s" %
          (len(builds), len(jobs), max(1, args.workers), args.dry_run),
          flush=True)
    if not jobs:
        return 0
    written = 0
    args.output.parent.mkdir(parents=True, exist_ok=True)
    with concurrent.futures.ThreadPoolExecutor(
            max_workers=max(1, args.workers)) as pool:
        futures = [pool.submit(run_one, job) for job in jobs]
        for future in concurrent.futures.as_completed(futures):
            index, prediction = future.result()
            l0.append_jsonl(args.output, prediction)
            written += 1
            print("[opencode %d/%d] #%d %s status=%s source=%s" %
                  (written, len(jobs), index, prediction["build_id"],
                   prediction["status"],
                   (prediction.get("cost") or {}).get("answer_source")),
                  flush=True)
    print("opencode complete: wrote %d prediction(s) to %s" %
          (written, args.output), flush=True)
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except KeyboardInterrupt:
        print("interrupted", file=sys.stderr)
        raise SystemExit(130)
