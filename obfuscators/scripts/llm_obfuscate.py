#!/usr/bin/env python3
"""Build the LLM-obfuscated group used to test agent deobfuscation.

This is the model-generated tier, wired as a parallel corpus to
``corpus/jsob_corpus_full`` and ``corpus/vm_corpus_l1``:

  1. Prompt an LLM (standalone-llm-obfuscate T19 techniques) on each subject.
  2. Admit the rewrite with the same sandbox differential test as the
     open-source tier (``02_admit.py``).
  3. Write admitted programs + ``builds.jsonl`` under ``corpus/llm_obfuscated/``.

Agent drivers take that jsonl via ``--builds``. Default subject set is
``corpus/original`` (the 69-file comparison set). Files larger than
``selection.max_bytes`` are skipped rather than chunked.

    python3 scripts/llm_obfuscate.py --dry-run --limit 3
    python3 scripts/llm_obfuscate.py --only OpenContext_src_core_config
    python3 scripts/llm_obfuscate.py --resume
"""
from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

import lib

sys.path.insert(0, str(Path(__file__).resolve().parent))
import importlib
_admit = importlib.import_module("02_admit")

STAGE = "llm"
TIER = "model-generated"
CODE_DIR = lib.BUILDS / "llm"
OUT_RAW = lib.RAW / "llm_builds.jsonl"
CORPUS_OUT = lib.CORPUS / "llm_obfuscated"
_SAMPLE_BUILDS_VALUE = os.environ.get("ADB_SAMPLE_BUILDS")
SAMPLE_BUILDS = (
    Path(_SAMPLE_BUILDS_VALUE).expanduser().resolve()
    if _SAMPLE_BUILDS_VALUE
    else None
)
CLI_ROOT = Path(os.environ.get(
    "ADB_LLM_OBFUSCATOR",
    lib.ARTIFACTS / "tools" / "standalone-llm-obfuscate",
)).expanduser().resolve()


def cfg():
    return lib.load_json(lib.CONFIG / "llm.json")


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
        needles = [n.strip().lower() for n in only.split(",") if n.strip()]
        subjects = [s for s in subjects if any(
            needle in s["subject_id"].lower() or needle in s["bundle_path"].lower()
            for needle in needles
        )]
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
    env_name = p.get("api_key_env") or "OPENAI_API_KEY"
    key = os.environ.get(env_name) or os.environ.get("OPENAI_API_KEY") or os.environ.get("SOPHNET_API_KEY")
    if args.api_key:
        key = args.api_key
    return p, key, env_name


def ensure_cli():
    if not CLI_ROOT.exists():
        raise SystemExit(f"LLM obfuscator CLI not found at {CLI_ROOT}")
    pkg = CLI_ROOT / "node_modules" / "tsx"
    if not pkg.exists():
        lib.log(STAGE, f"npm install in {CLI_ROOT}")
        subprocess.run(["npm", "install"], cwd=str(CLI_ROOT), check=True)


def run_cli(src: Path, dest: Path, config, provider, api_key: str) -> tuple[bool, str]:
    cli = config["cli"]
    dest.parent.mkdir(parents=True, exist_ok=True)
    cmd = [
        "npx", "--yes", "tsx", "obfuscate.ts", str(src),
        "-o", str(dest),
        "--model", provider["model"],
        "--baseURL", provider["base_url"],
        "--apiKey", api_key,
        "--techniques", ",".join(cli["techniques"]),
        "--temperature", str(cli["temperature"]),
        "--max-tokens", str(cli["max_tokens"]),
        "--retries", str(cli["retries"]),
        "--max-continues", str(cli["max_continues"]),
        "--concurrency", str(cli.get("concurrency", 1)),
    ]
    if cli.get("sequential", True):
        cmd.append("--sequential")
    if not cli.get("chunk_chars"):
        cmd.append("--no-chunk")
    else:
        cmd.extend(["--chunk-chars", str(cli["chunk_chars"])])
    try:
        proc = subprocess.run(
            cmd, cwd=str(CLI_ROOT), capture_output=True, text=True, timeout=1800,
        )
    except subprocess.TimeoutExpired:
        return False, "obfuscator_timeout"
    log = ((proc.stderr or "") + "\n" + (proc.stdout or "")).strip()
    if proc.returncode != 0 or not dest.exists() or dest.stat().st_size == 0:
        return False, log[-4000:] or "obfuscator_failed"
    return True, log[-500:]


def measure(row, subjects):
    subject = subjects[row["subject_id"]]
    base = lib.complexity(lib.CORPUS / subject["bundle_path"], subject["module_format"])
    m = lib.complexity(lib.BUILDS / row["path"], row["module_format"])
    inflation = None
    if base and not base.get("error") and base.get("bytes") and m and not m.get("error") and m.get("bytes"):
        inflation = round(m["bytes"] / base["bytes"], 4)
    row["size_inflation"] = inflation
    row["complexity"] = None if m.get("error") else m.get("complexity")
    return row


def existing_t19_path(rec) -> Path | None:
    """The already-admitted LLM-t19 file, not a later t19h rewrite."""
    name = rec.get("path") or ""
    prefix = Path(name).name.split("__llm__")[0]
    cands = [
        p for p in CORPUS_OUT.glob(prefix + "__llm__t19__*")
        if "__llm__t19h__" not in p.name
    ]
    if cands:
        return sorted(cands)[0]
    p = CORPUS_OUT / name
    return p if p.exists() else None


def already_admitted_ids():
    path = CORPUS_OUT / "builds.jsonl"
    if not path.exists():
        return set()
    return {r["subject_id"] for r in lib.read_jsonl(path) if r.get("subject_id")}


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
            sample_dir = SAMPLE_BUILDS.parent / "llm"
            sample_dir.mkdir(parents=True, exist_ok=True)
            sample_recs = []
            for i, rec in enumerate(sample, 1):
                name = rec["path"]
                shutil.copy2(CORPUS_OUT / name, sample_dir / name)
                sample_recs.append({**rec, "path": f"llm/{name}", "sample_index": i})
            output_manifest = SAMPLE_BUILDS.parent / "builds_llm.jsonl"
            lib.write_jsonl(output_manifest, sample_recs)
            lib.log(
                STAGE,
                f"sample overlap: {len(sample_recs)} → {output_manifest}",
            )
    return records


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--only", default="")
    ap.add_argument("--techniques", default="",
                    help="comma-separated techniques; default: config cli.techniques")
    ap.add_argument("--config-id", default="",
                    help="override config_id used in build_id / output names")
    ap.add_argument("--provider", default="",
                    help="sophnet or openrouter; overrides config provider")
    ap.add_argument("--model", default="")
    ap.add_argument("--no-sequential", action="store_true",
                    help="one LLM call applying all techniques (do not run AST passes)")
    ap.add_argument("--base-url", default="")
    ap.add_argument("--api-key", default="")
    ap.add_argument("--max-bytes", type=int, default=0,
                    help="override config selection.max_bytes; 0 keeps the config value")
    ap.add_argument("--all-subjects", action="store_true",
                    help="ignore corpus/original restriction; use the full manifest")
    ap.add_argument("--resume", action="store_true",
                    help="reuse already-written obfuscated files")
    ap.add_argument("--force", action="store_true",
                    help="regenerate even if the subject is already in corpus/llm_obfuscated")
    ap.add_argument("--from-existing", action="store_true",
                    help="stack mechanical hardening on corpus/llm_obfuscated t19 files instead of corpus/original")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--skip-admit", action="store_true",
                    help="generate only; do not run the sandbox differential test")
    ap.add_argument("--jobs", type=int, default=1,
                    help="how many files to obfuscate in parallel")
    args = ap.parse_args()

    config = cfg()
    if args.config_id:
        config = json.loads(json.dumps(config))
        config["config_id"] = args.config_id
    if args.techniques:
        config = json.loads(json.dumps(config))
        config["cli"]["techniques"] = [t.strip() for t in args.techniques.split(",") if t.strip()]
    if args.no_sequential:
        config = json.loads(json.dumps(config))
        config["cli"]["sequential"] = False
    if args.provider:
        config = json.loads(json.dumps(config))
        name = args.provider.strip().lower()
        if name == "sophnet":
            config["provider"] = {
                "vendor": "sophnet",
                "model": args.model or "DeepSeek-V4-Pro-0813",
                "base_url": "https://www.sophnet.com/api/open-apis/v1",
                "api_key_env": "SOPHNET_API_KEY",
            }
        elif name == "openrouter":
            config["provider"]["vendor"] = "openrouter"
            config["provider"]["base_url"] = "https://openrouter.ai/api/v1"
            config["provider"]["api_key_env"] = "OPENROUTER_API_KEY"
            if args.model:
                config["provider"]["model"] = args.model
        else:
            raise SystemExit("unsupported --provider (use sophnet or openrouter)")
    if args.all_subjects:
        config = json.loads(json.dumps(config))
        config["selection"]["from_original"] = False
    global CORPUS_OUT
    cid = str(config.get("config_id") or "")
    if cid == "rewrite":
        CORPUS_OUT = lib.CORPUS / "llm_rewritten"
    elif cid in {"deepseek", "ds-obf"}:
        CORPUS_OUT = lib.CORPUS / "llm_deepseek"
    max_bytes = args.max_bytes or int(config["selection"].get("max_bytes") or 0)
    subjects, skipped = select_subjects(config, args.only or None, args.limit, max_bytes)
    provider, api_key, env_name = resolve_provider(config, args)
    existing_by_sid = {}
    if args.from_existing:
        args.force = True
        config = json.loads(json.dumps(config))
        config["cli"]["techniques"] = [
            "string_splitting", "control_flow_flatten", "dead_code_insert"
        ]
        existing_recs = lib.read_jsonl(CORPUS_OUT / "builds.jsonl") if (CORPUS_OUT / "builds.jsonl").exists() else []
        for rec in existing_recs:
            src = existing_t19_path(rec)
            if src and rec.get("subject_id"):
                existing_by_sid[rec["subject_id"]] = src
        before = len(subjects)
        subjects = [s for s in subjects if s["subject_id"] in existing_by_sid]
        lib.log(STAGE, f"from-existing: {len(subjects)}/{before} subjects with t19 files; "
                       f"techniques={','.join(config['cli']['techniques'])}")

    done_ids = already_admitted_ids()
    if done_ids and not args.force:
        before = len(subjects)
        subjects = [s for s in subjects if s["subject_id"] not in done_ids]
        lib.log(STAGE, f"skip {before - len(subjects)} already admitted in {CORPUS_OUT}")
    elif args.force and done_ids:
        lib.log(STAGE, f"--force: regenerating {len(subjects)} subjects "
                       f"({len(done_ids)} already in {CORPUS_OUT})")

    lib.log(STAGE, f"subjects={len(subjects)} skipped={len(skipped)} "
                   f"model={provider['model']} techniques={','.join(config['cli']['techniques'])}")
    for s, reason in skipped[:12]:
        lib.log(STAGE, f"  skip {s['subject_id']}: {reason}")
    if len(skipped) > 12:
        lib.log(STAGE, f"  ... {len(skipped) - 12} more skipped")

    if args.dry_run:
        for s in subjects:
            src = existing_by_sid.get(s["subject_id"]) if existing_by_sid else (lib.CORPUS / s["bundle_path"])
            lib.log(STAGE, f"would obfuscate {s['subject_id']} from {src} ({src.stat().st_size} bytes)")
        return

    mechanical = set(config["cli"]["techniques"]) <= {
        "var_rename", "string_splitting", "dead_code_insert", "control_flow_flatten"
    }
    if not api_key:
        if not mechanical:
            raise SystemExit(f"API key required: set {env_name} (or OPENAI_API_KEY / SOPHNET_API_KEY)")
        api_key = "mechanical"
        lib.log(STAGE, "no API key; using whole-file AST transforms only")

    ensure_cli()
    CODE_DIR.mkdir(parents=True, exist_ok=True)
    max_attempts = int(config["controls"].get("max_attempts") or 1)
    by_id = {s["subject_id"]: s for s in lib.load_manifest()}
    jobs_n = max(1, args.jobs)

    def generate_one(i, s):
        sid = s["subject_id"]
        src = existing_by_sid.get(sid) if existing_by_sid else (lib.CORPUS / s["bundle_path"])
        bid = lib.build_id(sid, TIER, config["tool"], config["config_id"], 0)
        ext = ".mjs" if s["module_format"] == "esm" else ".cjs"
        rel = f"llm/{bid}{ext}"
        dest = lib.BUILDS / rel
        options = {
            "mode": "t19",
            "techniques": config["cli"]["techniques"],
            "model": provider["model"],
            "temperature": config["cli"]["temperature"],
            "chunk_chars": config["cli"]["chunk_chars"],
            "from_existing": bool(existing_by_sid),
            "existing_src": str(src) if existing_by_sid else None,
        }
        row = {
            "build_id": bid, "subject_id": sid, "tier": TIER,
            "tool": config["tool"], "config_id": config["config_id"],
            "seed": 0, "module_format": s["module_format"],
            "test_runner": s.get("test_runner"),
            "path": rel, "built": False, "options": options,
        }
        reused = (not args.force) and args.resume and dest.exists() and dest.stat().st_size > 0
        if reused:
            row["built"] = True
            row["options"] = {**options, "resumed": True}
            lib.log(STAGE, f"[{i}/{len(subjects)}] resume {sid}")
            return row
        last_err = ""
        for attempt in range(1, max_attempts + 1):
            lib.log(STAGE, f"[{i}/{len(subjects)}] obfuscate {sid} from {src.name} attempt {attempt}/{max_attempts}")
            ok, detail = run_cli(src, dest, config, provider, api_key)
            if ok:
                row["built"] = True
                row["options"] = {**options, "attempt": attempt}
                lib.log(STAGE, f"[{i}/{len(subjects)}] wrote {dest.name}")
                return row
            last_err = detail
            interesting = [ln for ln in last_err.splitlines()
                           if any(tok in ln for tok in (
                               "Strength check", "Contract broken", "FAILED",
                               "failed to parse", "Last error", "too weak"))]
            lib.log(STAGE, f"  failed: {(interesting[-1] if interesting else last_err)[:300]}")
        row["built"] = False
        row["reason"] = f"generation_failed:{last_err[:180]}"
        return row

    lib.log(STAGE, f"generating {len(subjects)} files with jobs={jobs_n}")
    if not args.skip_admit:
        for s in lib.load_manifest():
            _admit._subject_bundle[s["subject_id"]] = s["bundle_path"]
        usable = lib.oracle_usable_set()
    else:
        usable = set()

    done = 0
    generated = 0
    admitted_n = 0
    with ThreadPoolExecutor(max_workers=jobs_n) as pool:
        futs = {pool.submit(generate_one, i, s): i
                for i, s in enumerate(subjects, 1)}
        for fut in as_completed(futs):
            row = fut.result()
            done += 1
            sid = row["subject_id"]
            if not row.get("built"):
                lib.log(STAGE, f"[{done}/{len(subjects)}] {sid}: "
                               f"reject:{row.get('reason', 'generation_failed')}")
                continue
            generated += 1
            if args.skip_admit:
                lib.log(STAGE, f"[{done}/{len(subjects)}] {sid}: generated (admit skipped)")
                continue
            res = _admit.admit_subject(sid, [row], usable)[0]
            if res.get("admitted"):
                res = measure(res, by_id)
                publish([res], by_id)
                admitted_n += 1
                flag = "ADMIT"
            else:
                flag = f"reject:{res.get('reason')}"
            lib.log(STAGE, f"[{done}/{len(subjects)}] {sid}: {flag}  "
                           f"corpus={admitted_n}")

    if args.skip_admit:
        lib.log(STAGE, f"generated {generated}/{len(subjects)}; skipped admit")
        return
    lib.log(STAGE, f"admitted {admitted_n}/{len(subjects)} this run → {CORPUS_OUT / 'builds.jsonl'}")
    lib.log(STAGE, f"next: python3 baselines/L0/run.py --builds {CORPUS_OUT / 'builds.jsonl'} --dry-run")


if __name__ == "__main__":
    main()
