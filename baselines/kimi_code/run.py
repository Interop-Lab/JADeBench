#!/usr/bin/env python3
"""Run the upstream Kimi Code CLI as a deobfuscation baseline.

Same shape as the Claude Code / OpenHands / Codex baselines: an isolated
copy of the agent-visible sandbox, ``TASK.md`` / ``AGENTS.md``, and
``kimi -p`` with that text. The collected artifact is ``answer.js``.
Predictions use the L0 jsonl contract so ``evaluators/score.py`` can
score them.

Default route is OpenRouter Chat Completions
(``https://openrouter.ai/api/v1``, model ``openai/gpt-5.6-sol``),
not the user's personal ``~/.kimi-code``. Credentials are written into
an isolated ``KIMI_CODE_HOME/config.toml`` because Kimi Code does not
read ``OPENROUTER_API_KEY`` from the shell.
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
    "_adb_kimi_worker", HERE / "worker.py")
kimi_worker = importlib.util.module_from_spec(_WORKER_SPEC)
_WORKER_SPEC.loader.exec_module(kimi_worker)

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
LEVEL = "kimi_code"


def make_agent_workspace(agent_dir, entry, source):
    """Repo with the original program as valid JavaScript.

    Sandbox harness files are removed so the agent does not spend steps on
    ``execute.mjs``.
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


def cleanup_tmp(tmp):
    if tmp is None:
        return
    shutil.rmtree(str(tmp), ignore_errors=True)


def task_payload(build, workspace, source, entry, args, config, prompt):
    return {
        "build_id": build["build_id"],
        "repo_path": str(workspace),
        "entry": entry,
        "source": source,
        "model": config.get("model") or kimi_worker.DEFAULT_MODEL,
        "model_alias": config.get("model_alias") or kimi_worker.DEFAULT_MODEL_ALIAS,
        "provider": config.get("provider") or "openrouter",
        "provider_type": config.get("provider_type") or "openai",
        "base_url": config.get("base_url"),
        "api_key_env": config.get("api_key_env", "OPENROUTER_API_KEY"),
        "api_key": config.get("api_key"),
        "timeout": args.timeout,
        "idle_after_final_seconds": config.get(
            "idle_after_final_seconds", kimi_worker.DEFAULT_IDLE_AFTER_FINAL),
        "max_steps_per_turn": config.get("max_steps_per_turn", 64),
        "enable_browsing": bool(config.get("enable_browsing")),
        "bash_timeout_ms": int(config.get("bash_timeout_ms") or 120000),
        "checkpoint_dir": str(args.checkpoint_dir / l0.slug(build["build_id"])),
        "max_passes": (
            args.max_passes if args.max_passes is not None
            else int(config.get("max_passes") or 2)),
        "prompt": prompt,
        "kimi_executable": args.kimi_executable,
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
        error = "dry_run: Kimi Code was not launched"
        task = {
            "build_id": build_id,
            "entry": entry,
            "repo_path": str(box / "agent"),
            "model": config.get("model") or kimi_worker.DEFAULT_MODEL,
            "model_alias": config.get("model_alias") or kimi_worker.DEFAULT_MODEL_ALIAS,
            "provider": config.get("provider") or "openrouter",
            "provider_type": config.get("provider_type") or "openai",
            "base_url": config.get("base_url"),
            "api_key_env": config.get("api_key_env", "OPENROUTER_API_KEY"),
            "prompt": prompt,
            "source": source,
            "max_steps_per_turn": config.get("max_steps_per_turn", 64),
            "enable_browsing": bool(config.get("enable_browsing")),
        }
        prompt_text = kimi_worker.build_prompt(task)
        result = {
            "prompt": prompt_text,
            "kimi_cli": kimi_worker.build_cli(
                box / "agent", kimi_worker.build_run_message(task), task),
            "kimi_config": kimi_worker.redact_config_toml(
                kimi_worker.build_config_toml(task)),
            "gateway_model": kimi_worker.gateway_model(task),
            "model_alias": kimi_worker.model_alias(task),
            "answer_source": "none",
            "syntax_ok": False,
            "metadata": {"error": error, "returncode": None, "usage": {}},
        }
    else:
        print("[kimi] start #%d %s timeout=%ss" %
              (index, build_id, int(args.timeout)), flush=True)
        tmp, workspace = make_agent_workspace(box / "agent", entry, source)
        (workspace / kimi_worker.ANSWER_NAME).write_text(
            source, encoding="utf-8")
        checkpoint_dir = args.checkpoint_dir / l0.slug(build_id)
        restored = kimi_worker.restore_checkpoint(workspace, checkpoint_dir)
        task = task_payload(build, workspace, source, entry, args, config, prompt)
        task["checkpoint_restored"] = bool(restored)
        if restored:
            print("[kimi] restored checkpoint %s: %s" %
                  (build_id, ",".join(restored[:8])), flush=True)
        result = kimi_worker.process_task(task)
        code = result.get("patch") or ""
        error = (result.get("metadata") or {}).get("error")
        answer_source = result.get("answer_source")
        if (code.strip() and result.get("syntax_ok") is not False
                and answer_source not in (
                    "input_fallback", "under_deobfuscated")):
            status = "ok"
            error = None
        elif answer_source == "under_deobfuscated":
            status = "under_deobfuscated"
            error = error or (
                "answer.js is still obfuscated")
        elif answer_source == "input_fallback":
            status = "timeout" if (
                error and str(error).startswith("Timeout")) else "empty_response"
            error = error or "agent did not improve the input fallback"
        elif error and str(error).startswith("Timeout"):
            status = "timeout"
        elif error:
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
        "checkpoint_dir": str(
            args.checkpoint_dir / l0.slug(build_id)),
        "sandbox_path": str(box),
        "source_path": str(source_path),
        "source_chars": len(source),
        "prompt_sha256": prompt_hash,
        "prompt": result.get("prompt"),
        "kimi_cli": result.get("kimi_cli"),
        "kimi_config": result.get("kimi_config"),
        "gateway_model": result.get("gateway_model"),
        "model_alias": result.get("model_alias"),
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
                      checkpoint_dir=os.path.relpath(
                          str(args.checkpoint_dir / l0.slug(build_id)),
                          str(args.output.parent)),
                      timeout=args.timeout,
                      usage_source=(result.get("metadata") or {}).get(
                          "usage_source"),
                      hung_after_final=bool(
                          (result.get("metadata") or {}).get("hung_after_final"))),
    }
    if error:
        prediction["driver_error"] = error
    if args.show_response and code:
        preview = code.replace("\n", " ")
        print("[kimi %02d] %s status=%s preview=%s" %
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
                        help="LLM gateway: openrouter or sophnet")
    parser.add_argument("--prompt", type=Path, default=DEFAULT_PROMPT)
    parser.add_argument("--output", type=Path, default=HERE / "predictions.jsonl")
    parser.add_argument("--output-dir", type=Path, default=HERE / "outputs")
    parser.add_argument("--transcript-dir", type=Path, default=HERE / "transcripts")
    parser.add_argument(
        "--checkpoint-dir", type=Path,
        help="persistent per-build checkpoints (default: beside predictions)")
    parser.add_argument("--system", default="openai/gpt-5.6-sol@kimi_code")
    parser.add_argument("--workers", type=int, default=1)
    parser.add_argument("--limit", type=int,
                        help="evaluate only the first N matching builds")
    parser.add_argument("--timeout", type=float,
                        help="per-instance Kimi Code wall timeout in seconds")
    parser.add_argument("--max-passes", type=int,
                        help="passes while answer.js stays obfuscated "
                             "(default: config max_passes or 2)")
    parser.add_argument("--kimi-executable", default="kimi")
    parser.add_argument("--dry-run", action="store_true",
                        help="materialize prompts without launching Kimi Code")
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
    if args.checkpoint_dir is None:
        args.checkpoint_dir = args.output.parent / "checkpoints"
    args.checkpoint_dir = args.checkpoint_dir.resolve()
    if not args.builds.exists():
        raise SystemExit("build manifest not found: %s" % args.builds)
    config = l0.read_json(args.config)
    if args.model:
        config["model"] = args.model
    if args.base_url:
        config["base_url"] = args.base_url
    if args.provider:
        config["provider"] = args.provider
    config = kimi_worker.apply_provider(
        config, replace_endpoint=bool(args.provider) and not args.base_url)
    if args.timeout is None:
        args.timeout = float(config.get("timeout_seconds", 1200))
    if not config.get("model"):
        config["model"] = os.environ.get(
            "LLM_MODEL", kimi_worker.DEFAULT_MODEL)
        if str(config["model"]).startswith("openrouter/"):
            config["model"] = config["model"][len("openrouter/"):]
    env_name = config.get("api_key_env", "OPENROUTER_API_KEY")
    if not config.get("api_key"):
        _, key = kimi_worker.load_auth_key(config)
        config["api_key"] = key
    if not args.dry_run and not kimi_worker.has_kimi_auth(config):
        raise SystemExit(
            "missing Kimi Code auth: set %s, or use --dry-run" % env_name)
    exe = Path(args.kimi_executable)
    found = shutil.which(args.kimi_executable)
    if not found and exe.exists() and os.access(str(exe), os.X_OK):
        found = str(exe)
    if not args.dry_run and not found:
        raise SystemExit(
            "kimi CLI not found: %s (see https://www.kimi.com/code/docs)"
            % args.kimi_executable)
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
        prior = l0.read_jsonl(args.output)
        completed = [row for row in prior if row.get("status") == "ok"]
        done = set(row.get("build_id") for row in completed)
        args.output.write_text(
            "".join(json.dumps(row, ensure_ascii=False) + "\n"
                    for row in completed),
            encoding="utf-8")
    jobs = [(i, b, args, config, prompt, sandbox_map)
            for i, b in enumerate(builds, 1) if b.get("build_id") not in done]
    print("kimi: %d builds, %d pending, workers=%d, dry_run=%s" %
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
            print("[kimi %d/%d] #%d %s status=%s source=%s" %
                  (written, len(jobs), index, prediction["build_id"],
                   prediction["status"],
                   (prediction.get("cost") or {}).get("answer_source")),
                  flush=True)
    print("kimi complete: wrote %d prediction(s) to %s" %
          (written, args.output), flush=True)
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except KeyboardInterrupt:
        print("interrupted", file=sys.stderr)
        raise SystemExit(130)
