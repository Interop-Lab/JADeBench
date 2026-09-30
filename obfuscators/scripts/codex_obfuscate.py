#!/usr/bin/env python3
"""Build the Codex-agent obfuscation group.

Same T19 techniques and sandbox admission as ``scripts/llm_obfuscate.py``, but
the rewrite is produced by the upstream Codex CLI (``codex exec``) with
DeepSeek Pro as the kernel — not a one-shot LLM prompt dump. The agent iterates
against ``node --check`` and ``codex_agent/check.mjs`` in an isolated workspace.

    python3 scripts/codex_obfuscate.py --dry-run --limit 3
    python3 scripts/codex_obfuscate.py --only OpenContext_src_core_config
    python3 scripts/codex_obfuscate.py --limit 1
"""
from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
import os
import shutil
import subprocess
import sys
import tempfile
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

import lib

sys.path.insert(0, str(Path(__file__).resolve().parent))
_admit = __import__("02_admit")

STAGE = "codex-agent"
TIER = "model-generated"
CODE_DIR = lib.BUILDS / "codex_agent"
OUT_RAW = lib.RAW / "codex_agent_builds.jsonl"
CORPUS_OUT = lib.CORPUS / "codex_obfuscated"
_SAMPLE_BUILDS_VALUE = os.environ.get("ADB_SAMPLE_BUILDS")
SAMPLE_BUILDS = (
    Path(_SAMPLE_BUILDS_VALUE).expanduser().resolve()
    if _SAMPLE_BUILDS_VALUE
    else None
)
AGENT_DIR = lib.OBF_ROOT / "codex_agent"
CHECK_JS = AGENT_DIR / "check.mjs"
PROMPT_FILE = AGENT_DIR / "prompt.txt"
WORKER_PATH = lib.ARTIFACTS / "baselines" / "codex" / "worker.py"
ACORN_SRC = lib.TOOLS / "node_modules" / "acorn"


def _load_worker():
    spec = importlib.util.spec_from_file_location("_adb_codex_obf_worker", WORKER_PATH)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


codex_worker = _load_worker()


def isolate_home(task_data):
    """Per-task CODEX_HOME so parallel jobs do not clobber config.toml."""
    home = Path(
        task_data.get("codex_home")
        or os.environ.get("ADB_CODEX_HOME")
        or str(Path.home() / ".cache" / "adb-codex-obfuscate-home")
    )
    home.mkdir(parents=True, exist_ok=True)
    (home / "config.toml").write_text(
        codex_worker.build_codex_config(task_data), encoding="utf-8")
    dst = home / "auth.json"
    src = codex_worker.user_auth_path()
    if src.is_file():
        dst.write_bytes(src.read_bytes())
    else:
        env_name, key = codex_worker.load_auth_key(task_data)
        if key:
            dst.write_text(
                json.dumps({env_name: key}, ensure_ascii=False) + "\n",
                encoding="utf-8")
    if dst.is_file():
        os.chmod(str(dst), 0o600)
    return home


codex_worker.isolate_home = isolate_home


def cfg():
    return lib.load_json(lib.CONFIG / "codex_agent.json")


def original_stems():
    stems = set()
    orig = lib.CORPUS / "original"
    if not orig.exists():
        return stems
    for path in orig.iterdir():
        if path.suffix.lower() in {".js", ".cjs", ".mjs"}:
            stems.add(path.name.rsplit(".", 1)[0])
    return stems


def bundle_stem(bundle_path: str) -> str:
    return Path(bundle_path).name.rsplit(".", 1)[0]


def select_subjects(config, only: str | None, limit: int, max_bytes: int):
    subjects = lib.load_manifest()
    subjects.sort(key=lambda s: s["subject_id"])
    if config["selection"].get("from_original"):
        stems = original_stems()
        subjects = [s for s in subjects if bundle_stem(s["bundle_path"]) in stems]
    if only:
        needle = only.lower()
        subjects = [s for s in subjects if needle in s["subject_id"].lower()
                    or needle in s["bundle_path"].lower()]
    kept = []
    skipped = []
    for s in subjects:
        src = lib.CORPUS / s["bundle_path"]
        if not src.exists():
            skipped.append((s, "missing_bundle"))
            continue
        size = src.stat().st_size
        if max_bytes and size > max_bytes:
            skipped.append((s, f"too_large:{size}"))
            continue
        kept.append(s)
    if limit:
        kept = kept[:limit]
    return kept, skipped


def resolve_provider(config, args):
    p = dict(config["provider"])
    if args.model:
        p["model"] = args.model
    if args.base_url:
        p["base_url"] = args.base_url
    if args.provider:
        p["vendor"] = args.provider
    worker_cfg = {
        "model": p.get("model"),
        "provider": p.get("vendor") or "sophnet",
        "base_url": p.get("base_url"),
        "api_key_env": p.get("api_key_env"),
        "api_key": args.api_key or None,
        "requires_openai_auth": p.get("requires_openai_auth", False),
    }
    worker_cfg = codex_worker.apply_provider(
        worker_cfg, replace_endpoint=bool(args.provider) and not args.base_url)
    env_name = worker_cfg.get("api_key_env") or "SOPHNET_API_KEY"
    worker_cfg["api_key_env"] = env_name
    if not worker_cfg.get("api_key"):
        worker_cfg["api_key"] = (
            os.environ.get(env_name)
            or os.environ.get("SOPHNET_API_KEY")
            or os.environ.get("OPENROUTER_API_KEY")
            or os.environ.get("OPENAI_API_KEY")
        )
    if not worker_cfg.get("api_key"):
        _, loaded = codex_worker.load_auth_key(worker_cfg)
        worker_cfg["api_key"] = loaded
    return worker_cfg, env_name


def already_admitted_ids():
    path = CORPUS_OUT / "builds.jsonl"
    if not path.exists():
        return set()
    return {r["subject_id"] for r in lib.read_jsonl(path) if r.get("subject_id")}


def measure(row, subjects):
    subject = subjects[row["subject_id"]]
    base = lib.complexity(lib.CORPUS / subject["bundle_path"], subject["module_format"])
    m = lib.complexity(lib.BUILDS / row["path"], row["module_format"])
    inflation = None
    if (base and not base.get("error") and base.get("bytes")
            and m and not m.get("error") and m.get("bytes")):
        inflation = round(m["bytes"] / base["bytes"], 4)
    row["size_inflation"] = inflation
    row["complexity"] = None if m.get("error") else m.get("complexity")
    return row


def publish(admitted, subjects):
    CORPUS_OUT.mkdir(parents=True, exist_ok=True)
    by_sid = {}
    existing_path = CORPUS_OUT / "builds.jsonl"
    if existing_path.exists():
        for rec in lib.read_jsonl(existing_path):
            if rec.get("subject_id"):
                by_sid[rec["subject_id"]] = rec
    raw_by_sid = {}
    if OUT_RAW.exists():
        for rec in lib.read_jsonl(OUT_RAW):
            if rec.get("subject_id"):
                raw_by_sid[rec["subject_id"]] = rec
    for row in admitted:
        src = lib.BUILDS / row["path"]
        name = Path(row["path"]).name
        dest = CORPUS_OUT / name
        shutil.copy2(src, dest)
        rec = {
            "build_id": row["build_id"],
            "subject_id": row["subject_id"],
            "tier": row["tier"],
            "tool": row["tool"],
            "config_id": row["config_id"],
            "seed": row.get("seed", 0),
            "path": name,
            "module_format": row["module_format"],
            "admit_mode": row.get("admit_mode"),
            "size_inflation": row.get("size_inflation"),
            "complexity": row.get("complexity"),
            "options": row.get("options"),
        }
        by_sid[rec["subject_id"]] = rec
        raw_by_sid[row["subject_id"]] = row
    records = sorted(by_sid.values(), key=lambda r: r["subject_id"])
    lib.write_jsonl(existing_path, records)
    lib.write_jsonl(OUT_RAW, [raw_by_sid[k] for k in sorted(raw_by_sid)])

    if SAMPLE_BUILDS is not None and SAMPLE_BUILDS.exists():
        sample_ids = {r["subject_id"] for r in lib.read_jsonl(SAMPLE_BUILDS)}
        sample = [r for r in records if r["subject_id"] in sample_ids]
        if sample:
            sample_dir = SAMPLE_BUILDS.parent / "codex_agent"
            sample_dir.mkdir(parents=True, exist_ok=True)
            sample_recs = []
            for i, rec in enumerate(sample, 1):
                name = rec["path"]
                shutil.copy2(CORPUS_OUT / name, sample_dir / name)
                sample_recs.append({**rec, "path": f"codex_agent/{name}", "sample_index": i})
            output_manifest = SAMPLE_BUILDS.parent / "builds_codex_agent.jsonl"
            lib.write_jsonl(output_manifest, sample_recs)
            lib.log(
                STAGE,
                f"sample overlap: {len(sample_recs)} → {output_manifest}",
            )
    return records


def copy_acorn(dest: Path):
    vendor = dest / "vendor" / "acorn"
    if vendor.exists():
        return
    if not ACORN_SRC.exists():
        lib.log(STAGE, f"acorn not found at {ACORN_SRC}; check.mjs will use regex fallback")
        return
    shutil.copytree(ACORN_SRC, vendor, dirs_exist_ok=True)


def write_contract_md(workspace: Path, original: Path, techniques: list[str]):
    cmd = ["node", str(workspace / "check.mjs"), "--dump-contract", str(original)]
    proc = subprocess.run(cmd, capture_output=True, text=True, timeout=30, cwd=str(workspace))
    contract = {}
    try:
        payload = json.loads(proc.stdout or "{}")
        contract = payload.get("contract") or {}
    except ValueError:
        pass
    export_names = ", ".join(contract.get("exportNames") or []) or "(none)"
    factories = ", ".join(contract.get("factoryNames") or []) or "(none)"
    text = (
        "MODULE CONTRACT (must keep, or tests will fail):\n"
        f"- Public names that must still be importable/require-able: {export_names}\n"
        "- Keep those public names via aliases only: "
        "`export { _0x1a as getRandomInt }` or `module.exports = { getRandomInt: _0x1a }`.\n"
        f"- Local __commonJS factories; call as functions, never Node require(): {factories}\n"
        "- Keep module, exports, require, class constructor, and every identifier that starts with __.\n"
        f"- Techniques to apply: {', '.join(techniques)}\n"
        "- After edits run: node check.mjs\n"
    )
    (workspace / "CONTRACT.md").write_text(text, encoding="utf-8")
    return contract


def make_workspace(source: Path, techniques: list[str], keep_root: Path | None):
    if keep_root:
        keep_root.mkdir(parents=True, exist_ok=True)
        tmp = tempfile.mkdtemp(prefix="codex-obf-", dir=str(keep_root))
    else:
        tmp = tempfile.mkdtemp(prefix="codex-obf-")
    workspace = Path(tmp)
    shutil.copy2(source, workspace / "original.js")
    shutil.copy2(source, workspace / "answer.js")
    shutil.copy2(CHECK_JS, workspace / "check.mjs")
    copy_acorn(workspace)
    write_contract_md(workspace, workspace / "original.js", techniques)
    (workspace / "CHECKPOINT.md").write_text(
        "Start: answer.js is a copy of original.js. Obfuscate it.\n",
        encoding="utf-8")
    return tmp, workspace


def run_local_check(workspace: Path, techniques: list[str]) -> tuple[bool, str]:
    cmd = [
        "node", "check.mjs", "original.js", "answer.js",
        "--techniques", ",".join(techniques),
    ]
    try:
        proc = subprocess.run(
            cmd, cwd=str(workspace), capture_output=True, text=True, timeout=60)
    except subprocess.TimeoutExpired:
        return False, "check_timeout"
    text = ((proc.stdout or "") + "\n" + (proc.stderr or "")).strip()
    try:
        payload = json.loads(proc.stdout or "")
        if payload.get("ok"):
            return True, text[-2000:]
        errors = payload.get("errors") or ["check_failed"]
        return False, "; ".join(str(e) for e in errors)[:2000]
    except ValueError:
        return proc.returncode == 0, text[-2000:] or "check_failed"


def task_payload(build_id, workspace, source, provider, config, prompt, args, checkpoint_dir, attempt):
    timeout = args.timeout or float(config["codex"].get("timeout_seconds") or 1200)
    return {
        "build_id": "%s__attempt%d" % (build_id, attempt),
        "repo_path": str(workspace),
        "entry": "original.js",
        "source": source,
        "model": provider.get("model"),
        "provider": provider.get("provider") or provider.get("vendor") or "sophnet",
        "base_url": provider.get("base_url"),
        "api_key_env": provider.get("api_key_env") or "SOPHNET_API_KEY",
        "api_key": provider.get("api_key"),
        "requires_openai_auth": provider.get("requires_openai_auth", False),
        "timeout": timeout,
        "sandbox": config["codex"].get("sandbox") or "workspace-write",
        "network_access": bool(config["codex"].get("network_access")),
        "approval_policy": config["codex"].get("approval_policy") or "never",
        "checkpoint_dir": str(checkpoint_dir),
        "prompt": prompt,
        "codex_executable": args.codex_executable or config["codex"].get("executable") or "codex",
        "codex_home": str(Path(workspace) / ".codex-home"),
        "checkpoint_restored": attempt > 1,
    }


def write_transcript(path: Path, row: dict, result: dict, extra: dict):
    path.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "build_id": row.get("build_id"),
        "subject_id": row.get("subject_id"),
        "prompt": result.get("prompt"),
        "codex_cli": result.get("codex_cli"),
        "codex_config": result.get("codex_config"),
        "answer_source": result.get("answer_source"),
        "syntax_ok": result.get("syntax_ok"),
        "syntax_detail": result.get("syntax_detail"),
        "metadata": result.get("metadata"),
        **extra,
    }
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def run_agent(src: Path, dest: Path, row: dict, config, provider, prompt, args, techniques):
    dest.parent.mkdir(parents=True, exist_ok=True)
    checkpoint_dir = (args.checkpoint_dir
                      / hashlib.sha1(row["build_id"].encode()).hexdigest()[:16])
    keep_root = args.keep_workspace
    tmp, workspace = make_workspace(src, techniques, keep_root)
    source = src.read_text(encoding="utf-8", errors="replace")
    last_err = ""
    result = {}
    try:
        restored = []
        if args.resume:
            restored = codex_worker.restore_checkpoint(workspace, checkpoint_dir)
            if restored:
                lib.log(STAGE, f"  restored checkpoint: {','.join(restored[:8])}")
        for attempt in range(1, int(config["controls"].get("max_attempts") or 1) + 1):
            lib.log(STAGE, f"  codex exec attempt {attempt}/{config['controls']['max_attempts']}")
            task = task_payload(
                row["build_id"], workspace, source, provider, config, prompt,
                args, checkpoint_dir, attempt)
            if restored or attempt > 1:
                task["checkpoint_restored"] = True
            started = time.time()
            result = codex_worker.process_task(task)
            code = result.get("patch") or ""
            meta = result.get("metadata") or {}
            error = meta.get("error")
            answer_source = result.get("answer_source")
            transcript = lib.LOGS / "codex_agent" / (row["build_id"] + f".a{attempt}.json")
            write_transcript(transcript, row, result, {
                "attempt": attempt,
                "seconds": round(time.time() - started, 3),
                "error": error,
            })
            if answer_source in ("input_fallback", "under_deobfuscated") or not code.strip():
                last_err = error or f"agent did not obfuscate ({answer_source or 'empty'})"
                lib.log(STAGE, f"  {last_err[:240]}")
                continue
            if result.get("syntax_ok") is False:
                last_err = result.get("syntax_detail") or "syntax_invalid"
                lib.log(STAGE, f"  syntax: {last_err[:240]}")
                continue
            (workspace / "answer.js").write_text(code, encoding="utf-8")
            ok, detail = run_local_check(workspace, techniques)
            if not ok:
                last_err = detail
                lib.log(STAGE, f"  check.mjs: {detail[:240]}")
                (workspace / "CHECKPOINT.md").write_text(
                    f"Previous check.mjs failed:\n{detail}\nFix these, keep answer.js valid.\n",
                    encoding="utf-8")
                continue
            dest.write_text(code, encoding="utf-8")
            return True, {
                "attempt": attempt,
                "answer_source": answer_source,
                "transcript": str(transcript),
                "usage": meta.get("usage") or {},
                "seconds": round(time.time() - started, 3),
            }
        return False, last_err or "generation_failed"
    finally:
        if not keep_root:
            shutil.rmtree(tmp, ignore_errors=True)


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--only", default="")
    ap.add_argument("--model", default="")
    ap.add_argument("--base-url", default="")
    ap.add_argument("--provider", default="",
                    help="LLM gateway: sophnet (default), openrouter, requesty, or codex")
    ap.add_argument("--api-key", default="")
    ap.add_argument("--timeout", type=float, default=0,
                    help="per-file Codex wall timeout; 0 uses config")
    ap.add_argument("--codex-executable", default="")
    ap.add_argument("--max-bytes", type=int, default=0,
                    help="override config selection.max_bytes; 0 keeps the config value")
    ap.add_argument("--all-subjects", action="store_true",
                    help="ignore corpus/original restriction; use the full manifest")
    ap.add_argument("--resume", action="store_true",
                    help="reuse already-written obfuscated files and Codex checkpoints")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--skip-admit", action="store_true",
                    help="generate only; do not run the sandbox differential test")
    ap.add_argument("--jobs", type=int, default=1,
                    help="how many files to obfuscate in parallel (default 1; Codex homes are isolated)")
    ap.add_argument("--checkpoint-dir", type=Path, default=None)
    ap.add_argument("--keep-workspace", type=Path, default=None,
                    help="keep per-file agent workspaces under this directory")
    args = ap.parse_args()

    config = cfg()
    if args.all_subjects:
        config = json.loads(json.dumps(config))
        config["selection"]["from_original"] = False
    max_bytes = args.max_bytes or int(config["selection"].get("max_bytes") or 0)
    subjects, skipped = select_subjects(config, args.only or None, args.limit, max_bytes)
    provider, env_name = resolve_provider(config, args)
    if args.checkpoint_dir is None:
        args.checkpoint_dir = lib.LOGS / "codex_agent" / "checkpoints"
    args.checkpoint_dir = args.checkpoint_dir.resolve()

    if not CHECK_JS.exists():
        raise SystemExit(f"missing checker: {CHECK_JS}")
    if not PROMPT_FILE.exists():
        raise SystemExit(f"missing prompt: {PROMPT_FILE}")
    prompt = PROMPT_FILE.read_text(encoding="utf-8")
    techniques = list(config["cli"]["techniques"])

    done_ids = already_admitted_ids()
    if done_ids:
        before = len(subjects)
        subjects = [s for s in subjects if s["subject_id"] not in done_ids]
        lib.log(STAGE, f"skip {before - len(subjects)} already admitted in {CORPUS_OUT}")

    lib.log(STAGE, f"subjects={len(subjects)} skipped={len(skipped)} "
                   f"model={provider.get('model')} provider={provider.get('provider')} "
                   f"techniques={','.join(techniques)}")
    for s, reason in skipped[:12]:
        lib.log(STAGE, f"  skip {s['subject_id']}: {reason}")
    if len(skipped) > 12:
        lib.log(STAGE, f"  ... {len(skipped) - 12} more skipped")

    if args.dry_run:
        dummy_task = task_payload(
            "dry-run", Path("/tmp/codex-obf-dry"), "", provider, config, prompt,
            args, args.checkpoint_dir, 1)
        dummy_task["repo_path"] = "/tmp/codex-obf-dry"
        lib.log(STAGE, "codex config:\n" + codex_worker.build_codex_config(dummy_task).rstrip())
        lib.log(STAGE, "codex cli: " + " ".join(
            str(x) for x in codex_worker.build_cli(
                "/tmp/codex-obf-dry",
                codex_worker.build_run_message(dummy_task),
                dummy_task)))
        for s in subjects:
            src = lib.CORPUS / s["bundle_path"]
            lib.log(STAGE, f"would obfuscate {s['subject_id']} ({src.stat().st_size} bytes)")
        return

    if not provider.get("api_key") and not codex_worker.has_codex_auth(provider):
        raise SystemExit(
            f"missing Codex auth: set {env_name} (DeepSeek Pro / Sophnet), "
            "or put it in ~/.codex/auth.json, or use --dry-run")
    exe = args.codex_executable or config["codex"].get("executable") or "codex"
    found = shutil.which(exe)
    if not found and Path(exe).exists() and os.access(str(exe), os.X_OK):
        found = str(Path(exe).resolve())
    if not found:
        raise SystemExit(f"codex CLI not found: {exe}")

    CODE_DIR.mkdir(parents=True, exist_ok=True)
    by_id = {s["subject_id"]: s for s in lib.load_manifest()}
    jobs_n = max(1, args.jobs)
    total = len(subjects)

    def generate_one(i, s):
        sid = s["subject_id"]
        src = lib.CORPUS / s["bundle_path"]
        bid = lib.build_id(sid, TIER, config["tool"], config["config_id"], 0)
        ext = ".mjs" if s["module_format"] == "esm" else ".cjs"
        rel = f"codex_agent/{bid}{ext}"
        dest = lib.BUILDS / rel
        options = {
            "mode": "t19-codex-agent",
            "techniques": techniques,
            "model": provider.get("model"),
            "provider": provider.get("provider"),
        }
        row = {
            "build_id": bid, "subject_id": sid, "tier": TIER,
            "tool": config["tool"], "config_id": config["config_id"],
            "seed": 0, "module_format": s["module_format"],
            "test_runner": s.get("test_runner"),
            "path": rel, "built": False, "options": options,
        }
        reused = args.resume and dest.exists() and dest.stat().st_size > 0
        if reused:
            ok, detail = run_local_check_on_files(src, dest, techniques)
            if ok:
                row["built"] = True
                row["options"] = {**options, "resumed": True}
                lib.log(STAGE, f"[{i}/{total}] resume {sid}")
                return row
            lib.log(STAGE, f"[{i}/{total}] resume {sid} failed check: {detail[:200]}")
        lib.log(STAGE, f"[{i}/{total}] obfuscate {sid}")
        try:
            ok, detail = run_agent(src, dest, row, config, provider, prompt, args, techniques)
        except Exception as exc:
            row["built"] = False
            row["reason"] = f"generation_failed:{type(exc).__name__}:{exc}"[:200]
            lib.log(STAGE, f"[{i}/{total}] {sid}: {row['reason']}")
            return row
        if ok:
            row["built"] = True
            row["options"] = {**options, **(detail if isinstance(detail, dict) else {})}
            lib.log(STAGE, f"[{i}/{total}] wrote {dest.name}")
            return row
        row["built"] = False
        row["reason"] = f"generation_failed:{str(detail)[:180]}"
        return row

    if not args.skip_admit:
        for s in lib.load_manifest():
            _admit._subject_bundle[s["subject_id"]] = s["bundle_path"]
        usable = lib.oracle_usable_set()
    else:
        usable = set()

    lib.log(STAGE, f"generating {total} files with jobs={jobs_n}")
    done = 0
    generated = 0
    admitted_n = 0
    with ThreadPoolExecutor(max_workers=jobs_n) as pool:
        futs = {pool.submit(generate_one, i, s): i for i, s in enumerate(subjects, 1)}
        for fut in as_completed(futs):
            row = fut.result()
            done += 1
            sid = row["subject_id"]
            if not row.get("built"):
                lib.log(STAGE, f"[{done}/{total}] {sid}: "
                               f"reject:{row.get('reason', 'generation_failed')}")
                continue
            generated += 1
            if args.skip_admit:
                lib.log(STAGE, f"[{done}/{total}] {sid}: generated (admit skipped)")
                continue
            res = _admit.admit_subject(sid, [row], usable)[0]
            if res.get("admitted"):
                res = measure(res, by_id)
                publish([res], by_id)
                admitted_n += 1
                flag = "ADMIT"
            else:
                flag = f"reject:{res.get('reason')}"
            lib.log(STAGE, f"[{done}/{total}] {sid}: {flag}  corpus={admitted_n}")

    if args.skip_admit:
        lib.log(STAGE, f"generated {generated}/{total}; skipped admit")
        return
    lib.log(STAGE, f"admitted {admitted_n}/{total} this run → {CORPUS_OUT / 'builds.jsonl'}")
    lib.log(STAGE, f"next: python3 baselines/L0/run.py --builds {CORPUS_OUT / 'builds.jsonl'} --dry-run")


def run_local_check_on_files(original: Path, answer: Path, techniques: list[str]) -> tuple[bool, str]:
    tmp = tempfile.mkdtemp(prefix="codex-obf-check-")
    try:
        shutil.copy2(original, Path(tmp) / "original.js")
        shutil.copy2(answer, Path(tmp) / "answer.js")
        shutil.copy2(CHECK_JS, Path(tmp) / "check.mjs")
        copy_acorn(Path(tmp))
        return run_local_check(Path(tmp), techniques)
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("interrupted", file=sys.stderr)
        raise SystemExit(130)
