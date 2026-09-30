#!/usr/bin/env python3
"""Commercial obfuscation tier (paper §3.4) — build-time runner, validator, dry-run.

This tier depends on licensed products. What is here is the machinery around
them: a schema for product profiles and the wild-sampling protocol
(config/commercial.json), a validator that checks a profile is complete and its
license was confirmed before any build, a dry-run that shows the exact build
commands that would execute, and — for build-time products — a runner that
produces builds and drives them through the *same* differential admission and
strength metrics every tier uses (reused from 02_admit.py / 03_metrics.py) and
appends the admitted ones to builds/builds.jsonl under tier="commercial".

    python3 commercial.py --validate                 # check config/commercial.json
    python3 commercial.py --dry-run                   # print the build command per product
    python3 commercial.py --product jscrambler        # run (requires the licensed CLI)

Ordering: the commercial runner *appends* to builds/builds.jsonl, whereas the
open-source Stage 4 (04_manifest.py) *rewrites* it. Run the open-source pipeline
first, then this; re-running 04_manifest.py drops the commercial rows, so re-run
this afterwards. The append is idempotent per product (prior rows for the same
product are replaced), so re-running this alone is safe.

Two properties the paper insists on are enforced here rather than left to
discipline: no build runs for a product whose `tos_checked` is false, and every
capability in `documented_protections` is treated as a vendor claim to be
recorded, never as a measurement. Only size_inflation and complexity — measured
locally from the produced build's AST — are measurements.
"""
import argparse
import hashlib
import importlib
import json
import os
import subprocess
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

import lib

# Reuse the admission and metrics mechanisms rather than re-implementing them:
# every tier admits and measures builds the same way (paper §3.4). These modules
# have digit-prefixed names, so import them by string.
admit = importlib.import_module("02_admit")
metrics = importlib.import_module("03_metrics")

STAGE = "commercial"
CODE_DIR = lib.BUILDS / "commercial"
BUILT = lib.RAW / "commercial_built.jsonl"
ADMITTED = lib.RAW / "commercial_admitted.jsonl"
MEASURED = lib.RAW / "commercial_measured.jsonl"
BUILDS_JSONL = lib.BUILDS / "builds.jsonl"


def config():
    return lib.load_json(lib.CONFIG / "commercial.json")


def validate(cfg):
    problems = []
    for p in cfg["products"]:
        pid = p.get("id", "<no id>")
        if p["kind"] == "build-time":
            b = p.get("build", {})
            if str(b.get("command", "")).startswith("REQUIRED"):
                problems.append(f"{pid}: build.command not filled in")
            cf = str(b.get("config_file", ""))
            if cf.startswith("REQUIRED"):
                problems.append(f"{pid}: build.config_file not filled in")
            elif not (lib.OBF_ROOT / cf).exists():
                problems.append(f"{pid}: build.config_file {cf} does not exist")
            if str(b.get("product_version", "")).startswith("REQUIRED"):
                problems.append(f"{pid}: build.product_version not pinned")
        if p["kind"] == "online-service":
            if str(p.get("wild", {}).get("sampled_once_at", "")).startswith("REQUIRED"):
                problems.append(f"{pid}: wild.sampled_once_at not recorded")
        if not p.get("tos_checked"):
            problems.append(f"{pid}: tos_checked is false — no build may run until the "
                            "license is confirmed to permit evaluation and publication")
    return problems


# --- build ------------------------------------------------------------------

def _config_hash(path):
    return hashlib.sha1(Path(path).read_bytes()).hexdigest()[:10]


def _subject_ext(fmt):
    return ".mjs" if fmt == "esm" else ".cjs"


def _sample(subjects, n):
    """Deterministic, evenly-spaced sample spanning the sorted pool, so a
    quota-capped product still covers every domain / runner / format rather than
    an alphabetical prefix (mirrors 01_build_opensource.stratified)."""
    if not n or n >= len(subjects):
        return list(subjects)
    ordered = sorted(subjects, key=lambda s: (s.get("domain", ""), s["test_runner"],
                                              s["module_format"], s["subject_id"]))
    step = len(ordered) / n
    return [ordered[int(i * step)] for i in range(n)]


def _subst(template, subs):
    out = template
    for k, v in subs.items():
        out = out.replace("{" + k + "}", str(v))
    return out


def _run_command(template, subs, timeout):
    """Run a vendor build command with placeholders substituted, via the shell so
    globs / npx work as the product documents. Returns (ok, error_or_None)."""
    cmd = _subst(template, subs)
    try:
        p = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=timeout)
    except subprocess.TimeoutExpired:
        return False, "build_timeout"
    if p.returncode != 0:
        tail = (p.stderr or p.stdout or "").strip().splitlines()
        return False, (tail[-1][:200] if tail else "build_failed")
    return True, None


def build_one(subject, profile, pid, config_path, chash, timeout):
    sid = subject["subject_id"]
    src = lib.CORPUS / subject["bundle_path"]
    cfg_id = profile.get("config_id", "protected")
    bid = lib.build_id(sid, "commercial", pid, cfg_id, chash)
    out = CODE_DIR / (bid + _subject_ext(subject["module_format"]))
    subs = {
        "input": src, "output": out, "output_dir": out.parent,
        "input_basename": Path(subject["bundle_path"]).name, "config": config_path,
    }
    ok, err = _run_command(profile["build"]["command"], subs, timeout)

    # Some CLIs write to a product-chosen path inside output_dir instead of to
    # {output}; if the profile declares where, copy it to {output}.
    produced = profile["build"].get("produced")
    if ok and produced:
        prod = Path(_subst(produced, subs))
        if prod.exists() and prod.resolve() != out.resolve():
            out.parent.mkdir(parents=True, exist_ok=True)
            out.write_bytes(prod.read_bytes())
    if ok and not out.exists():
        ok, err = False, "no_output_produced"

    row = {
        "build_id": bid, "subject_id": sid, "tier": "commercial", "tool": pid,
        "config_id": cfg_id, "seed": None,   # per-build polymorphic: not seed-reproducible
        "module_format": subject["module_format"], "test_runner": subject["test_runner"],
        "path": os.path.relpath(out, lib.BUILDS) if ok else None,
        "options": {
            "product": pid,
            "product_version": profile["build"].get("product_version"),
            "config_file": profile["build"]["config_file"],
            "config_hash": chash,
            "polymorphic": True,
            "documented_protections": profile.get("documented_protections", []),
        },
        "built": bool(ok),
    }
    if not ok:
        row["build_error"] = err
    return row


# --- admission + metrics (reused mechanisms) --------------------------------

def _is_self_defending(profile):
    if profile.get("self_defending"):
        return True
    return any(("self" in p.lower() and "defend" in p.lower()) or "debug" in p.lower()
               for p in profile.get("documented_protections", []))


def admit_rows(rows, jobs):
    """Drive each build through the same differential test 02_admit uses. 02's
    self-defending reclassification keys on the open-source anti/full rungs, so a
    commercial self-defending build that hangs a source-rewriting runner comes
    back as `suite_did_not_exit`; we reclassify it here to `defense_triggered`
    (a defense that worked, not a failure — paper §3.4)."""
    for s in lib.load_manifest():
        admit._subject_bundle[s["subject_id"]] = s["bundle_path"]
    usable = lib.oracle_usable_set()
    by_subject = {}
    for r in rows:
        by_subject.setdefault(r["subject_id"], []).append(r)
    out = []
    with ThreadPoolExecutor(max_workers=jobs) as pool:
        futs = {pool.submit(admit.admit_subject, sid, srows, usable): sid
                for sid, srows in by_subject.items()}
        for fut in as_completed(futs):
            out.extend(fut.result())
    return out


def reclassify_defense(rows, profile):
    if not _is_self_defending(profile):
        return rows
    for r in rows:
        if not r.get("admitted") and r.get("reason") == "suite_did_not_exit":
            r["reason"] = "defense_triggered"
            r["detail"] = "self_defending_vs_source_rewrite"
            r["runner"] = r.get("test_runner")
    return rows


def measure_rows(rows, jobs):
    subjects = {s["subject_id"]: s for s in lib.load_manifest()}
    targets = [r for r in rows if r.get("admitted")]
    for sid in {r["subject_id"] for r in targets}:
        metrics.baseline_for(subjects[sid])
    measured = {}
    with ThreadPoolExecutor(max_workers=jobs) as pool:
        futs = {pool.submit(metrics.measure_one, r, metrics._baseline[r["subject_id"]]):
                r["build_id"] for r in targets}
        for fut in as_completed(futs):
            res = fut.result()
            measured[res["build_id"]] = res
    return [measured.get(r["build_id"], r) for r in rows]


# --- outputs ----------------------------------------------------------------

def _median(xs):
    xs = sorted(v for v in xs if v is not None)
    if not xs:
        return None
    k = (len(xs) - 1) / 2
    lo, hi = int(k), min(int(k) + 1, len(xs) - 1)
    return round(xs[lo] + (xs[hi] - xs[lo]) * (k - lo), 4)


def append_to_builds_jsonl(measured, pid):
    """Append this product's admitted builds to the evaluators' builds.jsonl,
    replacing any prior rows for the same product so re-runs are idempotent."""
    existing = [r for r in lib.read_jsonl(BUILDS_JSONL)
                if not (r.get("tier") == "commercial" and r.get("tool") == pid)]
    new = [{
        "build_id": r["build_id"], "subject_id": r["subject_id"], "tier": r["tier"],
        "tool": r["tool"], "config_id": r["config_id"], "seed": r["seed"], "path": r["path"],
        "module_format": r["module_format"], "admit_mode": r.get("admit_mode"),
        "size_inflation": r.get("size_inflation"), "complexity": r.get("complexity"),
        "options": r["options"],
    } for r in measured if r.get("admitted")]
    lib.write_jsonl(BUILDS_JSONL, existing + new)
    return len(new)


def write_stats(measured, pid, profile, chash):
    from collections import Counter
    admitted = [r for r in measured if r.get("admitted")]
    stats = {
        "tier": "commercial", "product": pid,
        "product_version": profile["build"].get("product_version"),
        "config_file": profile["build"]["config_file"], "config_hash": chash,
        "builds_attempted": len(measured),
        "built": sum(1 for r in measured if r["built"]),
        "admitted": len(admitted),
        "admit_rate": round(len(admitted) / len(measured), 4) if measured else None,
        "admit_mode": dict(Counter(r.get("admit_mode") for r in admitted)),
        "rejections": dict(Counter(r.get("reason") for r in measured if not r.get("admitted"))),
        "size_inflation_median": _median([r.get("size_inflation") for r in admitted]),
        "complexity_median": _median([r.get("complexity") for r in admitted]),
        "documented_protections_vendor_claims": profile.get("documented_protections", []),
        "note": "documented_protections are vendor self-descriptions, not measurements; "
                "only size_inflation and complexity are measured locally. Anti-debug "
                "degradation (degraded_L2 / total_L2) is reported by the sandbox debug "
                "harness during evaluation, not here.",
    }
    out = lib.STATS / f"commercial_{pid}.json"
    out.write_text(json.dumps(stats, indent=2, ensure_ascii=False), encoding="utf-8")
    return stats


# --- run --------------------------------------------------------------------

def run_product(profile, jobs, build_timeout, limit=0):
    pid = profile["id"]
    if profile["kind"] != "build-time":
        raise SystemExit(f"{pid}: kind={profile['kind']} is not run here; online "
                         "services are sampled once as a wild condition (config/commercial.json).")
    CODE_DIR.mkdir(parents=True, exist_ok=True)
    config_path = lib.OBF_ROOT / profile["build"]["config_file"]
    chash = _config_hash(config_path)
    cfg_id = profile.get("config_id", "protected")

    subjects = _sample(lib.load_manifest(), profile.get("max_subjects"))
    if limit:
        subjects = subjects[:limit]
    lib.log(STAGE, f"[{pid}] building {len(subjects)} subjects with config "
                   f"{profile['build']['config_file']} (hash {chash})")

    with ThreadPoolExecutor(max_workers=jobs) as pool:
        futs = [pool.submit(build_one, s, profile, pid, config_path, chash, build_timeout)
                for s in subjects]
        built = [f.result() for f in as_completed(futs)]
    built.sort(key=lambda r: r["subject_id"])
    lib.write_jsonl(BUILT, built)
    n_built = sum(1 for r in built if r["built"])
    lib.log(STAGE, f"[{pid}] built {n_built}/{len(built)} → {BUILT.relative_to(lib.OBF_ROOT)}")

    admitted = reclassify_defense(admit_rows(built, jobs), profile)
    admitted.sort(key=lambda r: r["subject_id"])
    lib.write_jsonl(ADMITTED, admitted)
    n_adm = sum(1 for r in admitted if r.get("admitted"))
    lib.log(STAGE, f"[{pid}] admitted {n_adm}/{len(admitted)}")

    measured = measure_rows(admitted, jobs)
    measured.sort(key=lambda r: r["subject_id"])
    lib.write_jsonl(MEASURED, measured)

    n_new = append_to_builds_jsonl(measured, pid)
    stats = write_stats(measured, pid, profile, chash)
    lib.log(STAGE, f"[{pid}] appended {n_new} builds to builds.jsonl; "
                   f"stats → stats/commercial_{pid}.json")
    lib.log(STAGE, f"[{pid}] admit_rate={stats['admit_rate']} "
                   f"size_inflation_median={stats['size_inflation_median']} "
                   f"complexity_median={stats['complexity_median']}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--validate", action="store_true")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--product", type=str, default="")
    ap.add_argument("--jobs", type=int, default=6)
    ap.add_argument("--limit", type=int, default=0,
                    help="cap subjects further (on top of the profile's max_subjects), "
                         "for a small pilot run")
    ap.add_argument("--build-timeout", type=int, default=300,
                    help="seconds per build (commercial protectors can be slow)")
    args = ap.parse_args()

    cfg = config()
    problems = validate(cfg)

    if args.validate or (not args.dry_run and not args.product):
        if problems:
            lib.log(STAGE, f"{len(problems)} thing(s) block a real run:")
            for p in problems:
                lib.log(STAGE, f"  - {p}")
        else:
            lib.log(STAGE, "config is complete and all licenses confirmed")
        lib.log(STAGE, "this tier is scaffolding: it does not run without a licensed product")
        return

    if args.dry_run:
        sample_subject = next(iter(lib.load_manifest()), None)
        for p in cfg["products"]:
            lib.log(STAGE, f"[{p['id']}] kind={p['kind']} reproducible={p['reproducible']}")
            if p["kind"] == "build-time":
                lib.log(STAGE, f"    template: {p['build']['command']}")
                if sample_subject:
                    subs = {"input": lib.CORPUS / sample_subject["bundle_path"],
                            "output": CODE_DIR / "<build_id>.cjs", "output_dir": CODE_DIR,
                            "input_basename": Path(sample_subject["bundle_path"]).name,
                            "config": lib.OBF_ROOT / p["build"]["config_file"]}
                    lib.log(STAGE, f"    example:  {_subst(p['build']['command'], subs)}")
            else:
                lib.log(STAGE, f"    would sample once → {p['wild']['archive_path']}")
            lib.log(STAGE, f"    documented (vendor claims, not measured): "
                           f"{', '.join(p['documented_protections'])}")
        return

    if args.product:
        prof = next((p for p in cfg["products"] if p["id"] == args.product), None)
        if not prof:
            raise SystemExit(f"no product '{args.product}' in config/commercial.json")
        prod_problems = [x for x in problems if x.startswith(f"{args.product}:")]
        if prod_problems:
            raise SystemExit("cannot run:\n  - " + "\n  - ".join(prod_problems))
        run_product(prof, args.jobs, args.build_timeout, args.limit)


if __name__ == "__main__":
    main()
