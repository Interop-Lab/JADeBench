#!/usr/bin/env python3
"""Model-generated obfuscation tier (paper §3.4) — runnable scaffolding.

This tier prompts an obfuscating model to rewrite each subject so that a named
property of the source becomes unavailable while behavior is preserved. It is
fully wired but not run in this release, because generation needs an
obfuscating-model API key. Without ADB_OBF_API_KEY it does a DRY RUN: it resolves
every (subject, mode, property) job, writes the exact prompt each would send to
logs/modelgen_dryrun/, and stops before any network call — so the specifications
and the job set are inspectable without spending a token.

With ADB_OBF_API_KEY (and a pinned model in config/modelgen.json or ADB_OBF_MODEL)
it generates builds, admits each through the same sandbox differential test as
the open-source tier, regenerates on failure up to the configured budget, and
reports acceptance rate. Strength calibration and the novelty audit consume the
same complexity features as the open-source tier (see config/modelgen.json).

    python3 modelgen.py --mode specified [--limit N] [--jobs 4]
    python3 modelgen.py --mode adaptive  [--limit N]
    ADB_OBF_API_KEY=... ADB_OBF_MODEL=claude-<snapshot> python3 modelgen.py --mode specified

Reuses scripts/02_admit.py for admission, so a model-generated build is admitted
by exactly the criterion every other tier uses.
"""
import argparse
import json
import os
import re
import sys
from pathlib import Path

import lib

# Reuse the open-source tier's admission machinery unchanged: a build is a build.
sys.path.insert(0, str(Path(__file__).resolve().parent))
import importlib
_admit = importlib.import_module("02_admit")

STAGE = "modelgen"
CODE_DIR = lib.BUILDS / "modelgen"
OUT = lib.RAW / "modelgen_builds.jsonl"
TIER = "model-generated"


def config():
    return lib.load_json(lib.CONFIG / "modelgen.json")


def build_prompt(cfg, mode, prop, code):
    m = cfg["modes"][mode]
    if mode == "specified":
        desc = cfg["target_properties"][prop]
        spec = m["spec"].replace("<PROPERTY_DESCRIPTION>", desc)
    else:
        spec = m["spec"]
    return f"{spec}\n\n```javascript\n{code}\n```"


def extract_code(text):
    """Pull the program out of a model response, tolerating markdown fences."""
    fences = re.findall(r"```(?:javascript|js)?\s*\n(.*?)```", text, re.DOTALL)
    if fences:
        return max(fences, key=len).strip()
    return text.strip()


def call_model(cfg, prompt):
    """One generation call. Uses urllib so the tier adds no dependency.

    Returns the returned program text, or raises. Only reached when a key is set.
    """
    import urllib.request
    key = os.environ["ADB_OBF_API_KEY"]
    model = os.environ.get("ADB_OBF_MODEL") or cfg["provider"]["model"]
    if model.startswith("REQUIRED"):
        raise SystemExit("pin an obfuscating model: set ADB_OBF_MODEL or config/modelgen.json provider.model")
    d = cfg["provider"]["decoding"]
    body = json.dumps({
        "model": model, "max_tokens": d["max_tokens"],
        "temperature": d["temperature"], "top_p": d["top_p"],
        "messages": [{"role": "user", "content": prompt}],
    }).encode()
    req = urllib.request.Request(
        "https://api.anthropic.com/v1/messages", data=body,
        headers={"content-type": "application/json", "x-api-key": key,
                 "anthropic-version": "2023-06-01"})
    with urllib.request.urlopen(req, timeout=180) as resp:
        payload = json.loads(resp.read())
    return "".join(b.get("text", "") for b in payload.get("content", []))


def jobs_for(cfg, mode, subjects):
    m = cfg["modes"][mode]
    props = m.get("properties", [mode])          # adaptive has no property axis
    variants = m.get("variants_per_subject", 1)
    for s in subjects:
        for prop in props:
            for v in range(variants):
                yield s, prop, v


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--mode", choices=["specified", "adaptive"], required=True)
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--jobs", type=int, default=4)
    args = ap.parse_args()

    cfg = config()
    subjects = lib.load_manifest()
    subjects.sort(key=lambda s: s["subject_id"])
    if args.limit:
        subjects = subjects[:args.limit]
    jobs = list(jobs_for(cfg, args.mode, subjects))

    dry = "ADB_OBF_API_KEY" not in os.environ
    if dry:
        out_dir = lib.LOGS / "modelgen_dryrun"
        out_dir.mkdir(parents=True, exist_ok=True)
        lib.log(STAGE, f"DRY RUN ({len(jobs)} jobs, mode={args.mode}): "
                       "no ADB_OBF_API_KEY set, writing prompts only")
        for s, prop, v in jobs:
            code = (lib.CORPUS / s["bundle_path"]).read_text(encoding="utf-8")
            prompt = build_prompt(cfg, args.mode, prop, code)
            slug = lib.build_id(s["subject_id"], TIER, "modelgen", f"{args.mode}:{prop}", v)
            (out_dir / f"{slug}.prompt.txt").write_text(prompt, encoding="utf-8")
        lib.log(STAGE, f"wrote {len(jobs)} prompts to {out_dir.relative_to(lib.OBF_ROOT)}; "
                       "set ADB_OBF_API_KEY and ADB_OBF_MODEL to generate")
        return

    CODE_DIR.mkdir(parents=True, exist_ok=True)
    max_attempts = cfg["controls"]["semantics"]["max_attempts"]
    usable = lib.oracle_usable_set()
    for s in lib.load_manifest():
        _admit._subject_bundle[s["subject_id"]] = s["bundle_path"]

    rows = []
    for s, prop, v in jobs:
        sid = s["subject_id"]
        code = (lib.CORPUS / s["bundle_path"]).read_text(encoding="utf-8")
        prompt = build_prompt(cfg, args.mode, prop, code)
        config_id = f"{args.mode}:{prop}" + (f"#{v}" if v else "")
        bid = lib.build_id(sid, TIER, "modelgen", config_id, v)
        ext = ".mjs" if s["module_format"] == "esm" else ".cjs"
        out = CODE_DIR / (bid + ext)
        admitted_row = None
        for attempt in range(max_attempts):
            try:
                text = call_model(cfg, prompt)
            except Exception as e:  # noqa: BLE001
                admitted_row = {"admitted": False, "reason": f"generation_failed:{str(e)[:60]}"}
                break
            out.write_text(extract_code(text), encoding="utf-8")
            row = {"build_id": bid, "subject_id": sid, "tier": TIER, "tool": "modelgen",
                   "config_id": config_id, "seed": v, "module_format": s["module_format"],
                   "test_runner": s["test_runner"],
                   "path": os.path.relpath(out, lib.BUILDS), "built": True,
                   "options": {"mode": args.mode, "property": prop, "attempt": attempt}}
            res = _admit.admit_subject(sid, [row], usable)[0]
            if res.get("admitted"):
                admitted_row = res
                break
            admitted_row = res
        rows.append({**(admitted_row or {}), "build_id": bid, "subject_id": sid,
                     "config_id": config_id})
        if len(rows) % 10 == 0:
            adm = sum(1 for r in rows if r.get("admitted"))
            lib.log(STAGE, f"  {len(rows)}/{len(jobs)} generated, {adm} admitted")

    lib.write_jsonl(OUT, rows)
    admitted = sum(1 for r in rows if r.get("admitted"))
    lib.log(STAGE, f"mode={args.mode}: acceptance {admitted}/{len(rows)} "
                   f"({admitted/max(len(rows),1):.1%}) → {OUT.relative_to(lib.OBF_ROOT)}")
    lib.log(STAGE, "next: fold admitted builds into builds/builds.jsonl, then run "
                   "strength calibration and the novelty audit (config/modelgen.json controls)")


if __name__ == "__main__":
    main()
