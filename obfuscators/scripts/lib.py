"""Shared facilities for the obfuscation pipeline (paper §3.4).

The obfuscation stage turns each clean corpus subject into a set of obfuscated
*builds* — one program per (subject, tier, configuration) — and admits only the
builds that reproduce the original's behavior. This module holds what every
stage needs: locating the corpus and its sandboxes, resolving the configuration
ladder into concrete options objects, and the two vocabularies the stages share
(build identity and admission outcome).

Stages, each reading the previous stage's JSONL and rewriting its own so any
stage can be re-run after a config change without repeating the ones before it:

    01_build_opensource.py  -> raw/builds_built.jsonl     obfuscate; record options+seed
    02_admit.py             -> raw/builds_admitted.jsonl  differential test each build
    03_metrics.py           -> raw/builds_measured.jsonl  size inflation + complexity
    04_manifest.py          -> builds/builds.jsonl + stats/    the tier's deliverable
"""
import hashlib
import json
import os
import subprocess
from pathlib import Path

HERE = Path(__file__).resolve().parent
OBF_ROOT = Path(os.environ.get(
    "ADB_OBFUSCATORS", HERE.parent
)).expanduser().resolve()
ARTIFACTS = Path(os.environ.get(
    "ADB_PROJECT_ROOT", OBF_ROOT.parent
)).expanduser().resolve()
CORPUS = Path(os.environ.get("ADB_CORPUS", ARTIFACTS / "corpus")).resolve()
SANDBOX = Path(os.environ.get("ADB_SANDBOX", ARTIFACTS / "sandbox")).resolve()
CONFIG = OBF_ROOT / "config"
TOOLS = OBF_ROOT / "tools"
RAW = OBF_ROOT / "raw"
BUILDS = OBF_ROOT / "builds"
STATS = OBF_ROOT / "stats"
LOGS = OBF_ROOT / "logs"

for d in (RAW, BUILDS, STATS, LOGS):
    d.mkdir(exist_ok=True)


# --- config -----------------------------------------------------------------

def load_json(path):
    return json.loads(Path(path).read_text(encoding="utf-8"))


def opensource_config():
    return load_json(CONFIG / "opensource.json")


def resolve_ladder(tool_cfg):
    """Turn a tool's base + ladder into one cumulative options object per rung.

    Each rung is the merge of `base` and every rung up to and including it, so
    `full` is the union of the whole ladder and two adjacent rungs differ by
    exactly one transformation family — which is what makes an ablation between
    them interpretable.
    """
    base = dict(tool_cfg["base"])
    rungs = {}
    acc = dict(base)
    for name, delta in tool_cfg["ladder"].items():
        acc = {**acc, **delta}
        rungs[name] = dict(acc)
    return rungs


# --- corpus -----------------------------------------------------------------

def load_manifest():
    path = CORPUS / "manifest.jsonl"
    if not path.exists():
        raise SystemExit(f"corpus manifest not found at {path}; run corpus/run_all.sh first")
    return [json.loads(l) for l in path.read_text(encoding="utf-8").splitlines() if l.strip()]


def sandbox_dir(subject_id):
    """The sandbox built for a subject: subject_id with :: and / flattened."""
    return SANDBOX / "sandboxes" / subject_id.replace("::", "_").replace("/", "_")


def oracle_usable_set():
    """Subject ids whose sandbox oracle actually runs test cases.

    Only these can be admitted by re-running the suite; the rest fall back to an
    interface-level (L1) check. Read from the sandbox's reference stats.
    """
    ref = SANDBOX / "stats" / "reference.json"
    if not ref.exists():
        return set()
    return {r["subject_id"] for r in load_json(ref) if r.get("oracle_usable")}


# --- build identity ---------------------------------------------------------

def build_id(subject_id, tier, tool, config_id, seed):
    """A stable, collision-resistant id for one build.

    Deterministic in its inputs so re-running the pipeline reproduces the same
    ids, and short enough to name a file. The subject slug stays human-readable;
    a hash of the full tuple disambiguates.
    """
    slug = subject_id.replace("::", "_").replace("/", "_")
    h = hashlib.sha1(f"{subject_id}|{tier}|{tool}|{config_id}|{seed}".encode()).hexdigest()[:10]
    return f"{slug}__{tool.split('-')[0]}__{config_id}__{h}"


# --- jsonl ------------------------------------------------------------------

def read_jsonl(path):
    path = Path(path)
    if not path.exists():
        return []
    return [json.loads(l) for l in path.read_text(encoding="utf-8").splitlines() if l.strip()]


def write_jsonl(path, rows):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as fh:
        for r in rows:
            fh.write(json.dumps(r, ensure_ascii=False) + "\n")


# --- external tools ---------------------------------------------------------

def obfuscate(tool, input_path, output_path, opts, seed, timeout=120):
    """Run tools/obfuscate.mjs. Returns (ok, meta_or_error)."""
    opts_file = Path(output_path).with_suffix(".opts.json")
    opts_file.write_text(json.dumps(opts), encoding="utf-8")
    try:
        p = subprocess.run(
            ["node", str(TOOLS / "obfuscate.mjs"), "--tool", tool,
             "--input", str(input_path), "--seed", str(seed),
             "--opts", str(opts_file), "--output", str(output_path)],
            capture_output=True, text=True, timeout=timeout)
    except subprocess.TimeoutExpired:
        return False, {"error": "obfuscator_timeout"}
    finally:
        opts_file.unlink(missing_ok=True)
    line = (p.stderr or "").strip().splitlines()
    rec = {}
    for l in reversed(line):
        try:
            rec = json.loads(l); break
        except ValueError:
            continue
    if p.returncode != 0 or not rec.get("ok"):
        return False, {"error": rec.get("error", "obfuscator_failed")}
    return True, rec


def complexity(path, fmt, timeout=60):
    """Run tools/complexity.mjs on a program. Returns a metrics dict (or {error})."""
    try:
        p = subprocess.run(
            ["node", str(TOOLS / "complexity.mjs"), str(path), "--format", fmt],
            capture_output=True, text=True, timeout=timeout)
    except subprocess.TimeoutExpired:
        return {"error": "complexity_timeout"}
    out = (p.stdout or "").strip()
    try:
        return json.loads(out)
    except ValueError:
        return {"error": "complexity_unparseable"}


def log(stage, msg):
    print(f"[{stage}] {msg}", flush=True)
