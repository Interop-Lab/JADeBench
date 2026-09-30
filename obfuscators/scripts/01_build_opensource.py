#!/usr/bin/env python3
"""Stage 1 — produce the open-source tier's obfuscated builds.

For every corpus subject, apply both tools across the whole configuration
ladder, and separately sweep the continuous thresholds on a sample. Each build
is written to builds/opensource/ next to nothing but its own code; the options
object and seed that produced it are recorded in the JSONL so the build is
regenerable from this stage's output alone.

Obfuscation is cheap and never touches the oracle, so this stage is fast and
safe to re-run. Admission (Stage 2) is where the cost is.

    python3 01_build_opensource.py [--limit N] [--only <subject substring>]
                                   [--tools javascript-obfuscator,js-confuser]
                                   [--no-sweep] [--jobs 8]
"""
import argparse
import os
from concurrent.futures import ThreadPoolExecutor, as_completed

import lib

STAGE = "01_build"
OUT = lib.RAW / "builds_built.jsonl"
CODE_DIR = lib.BUILDS / "opensource"


def subject_ext(fmt):
    return ".mjs" if fmt == "esm" else ".cjs"


def build_one(subject, tool, config_id, opts, seed, tier="open-source"):
    sid = subject["subject_id"]
    src = lib.CORPUS / subject["bundle_path"]
    bid = lib.build_id(sid, tier, tool, config_id, seed)
    out = CODE_DIR / (bid + subject_ext(subject["module_format"]))
    ok, meta = lib.obfuscate(tool, src, out, opts, seed)
    row = {
        "build_id": bid, "subject_id": sid, "tier": tier, "tool": tool,
        "config_id": config_id, "seed": seed,
        "module_format": subject["module_format"],
        "test_runner": subject["test_runner"],
        "path": os.path.relpath(out, lib.BUILDS) if ok else None,
        "options": opts, "built": ok,
    }
    if ok:
        row["bytes_in"] = meta["bytes_in"]
        row["bytes_out"] = meta["bytes_out"]
        row["obf_ms"] = meta["ms"]
    else:
        row["build_error"] = meta.get("error")
    return row


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--only", type=str, default="")
    ap.add_argument("--tools", type=str, default="javascript-obfuscator,js-confuser")
    ap.add_argument("--configs", type=str, default="",
                    help="comma-separated rung names to build (default: all rungs). "
                         "The ladder is cumulative, so e.g. --configs deadcode builds "
                         "only that rung with its full accumulated options.")
    ap.add_argument("--no-sweep", action="store_true")
    ap.add_argument("--jobs", type=int, default=8)
    args = ap.parse_args()

    CODE_DIR.mkdir(parents=True, exist_ok=True)
    cfg = lib.opensource_config()
    seed0 = cfg["seed"]
    tools = [t for t in args.tools.split(",") if t]

    subjects = lib.load_manifest()
    if args.only:
        subjects = [s for s in subjects if args.only in s["subject_id"]]
    if args.limit:
        subjects = subjects[:args.limit]
    subjects.sort(key=lambda s: s["subject_id"])

    # Per-subject seed so no two subjects share a random stream, but stable
    # across runs so builds are reproducible.
    seed_of = {s["subject_id"]: seed0 + i for i, s in enumerate(subjects)}

    def stratified(pool, n):
        """A deterministic, evenly-spaced sample spanning the sorted pool, so a
        capped tool still covers every domain / runner / format rather than an
        alphabetical prefix."""
        if n >= len(pool):
            return list(pool)
        ordered = sorted(pool, key=lambda s: (s["domain"], s["test_runner"],
                                              s["module_format"], s["subject_id"]))
        step = len(ordered) / n
        return [ordered[int(i * step)] for i in range(n)]

    want_configs = {c for c in args.configs.split(",") if c}
    tasks = []  # (subject, tool, config_id, opts, seed)
    samples = {}
    for tool in tools:
        rungs = lib.resolve_ladder(cfg["tools"][tool])
        if want_configs:
            rungs = {k: v for k, v in rungs.items() if k in want_configs}
        cap = cfg["tools"][tool].get("max_subjects")
        tool_subjects = stratified(subjects, cap) if cap else subjects
        if cap and len(tool_subjects) < len(subjects):
            samples[tool] = [s["subject_id"] for s in tool_subjects]
            lib.log(STAGE, f"{tool}: capped to {len(tool_subjects)}/{len(subjects)} "
                           f"subjects (stratified sample)")
        for s in tool_subjects:
            for config_id, opts in rungs.items():
                tasks.append((s, tool, config_id, opts, seed_of[s["subject_id"]]))
    if samples:
        (lib.STATS / "jsconfuser_sample.json").write_text(
            __import__("json").dumps(samples, indent=2, ensure_ascii=False), encoding="utf-8")

    # Threshold sweep: one tool, a sample of subjects, each axis × each point.
    sweep_rows_meta = None
    if not args.no_sweep:
        sw = cfg["sweep"]
        usable = lib.oracle_usable_set()
        sample = [s for s in subjects if s["subject_id"] in usable][:sw["sample_subjects"]]
        sweep_rows_meta = {"tool": sw["tool"], "points": sw["points"],
                           "axes": list(sw["axes"]),
                           "subjects": [s["subject_id"] for s in sample]}
        base = dict(cfg["tools"][sw["tool"]]["base"])
        for axis, extra in sw["axes"].items():
            for pt in sw["points"]:
                opts = {**base, **extra, axis: pt}
                cid = f"sweep:{axis}={pt}"
                for s in sample:
                    tasks.append((s, sw["tool"], cid, opts, seed_of[s["subject_id"]]))

    lib.log(STAGE, f"{len(subjects)} subjects × {tools} → {len(tasks)} builds "
                   f"({'no sweep' if args.no_sweep else 'incl. sweep'})")

    rows = []
    with ThreadPoolExecutor(max_workers=args.jobs) as pool:
        futs = [pool.submit(build_one, *t) for t in tasks]
        for i, fut in enumerate(as_completed(futs), 1):
            rows.append(fut.result())
            if i % 200 == 0:
                lib.log(STAGE, f"  {i}/{len(tasks)} built")

    rows.sort(key=lambda r: (r["subject_id"], r["tool"], r["config_id"]))
    lib.write_jsonl(OUT, rows)
    built = sum(1 for r in rows if r["built"])
    failed = len(rows) - built
    lib.log(STAGE, f"built {built}, failed {failed} → {OUT.relative_to(lib.OBF_ROOT)}")
    if sweep_rows_meta:
        (lib.STATS / "sweep_plan.json").write_text(
            __import__("json").dumps(sweep_rows_meta, indent=2, ensure_ascii=False),
            encoding="utf-8")
    if failed:
        from collections import Counter
        c = Counter(r.get("build_error") for r in rows if not r["built"])
        lib.log(STAGE, f"  build errors: {dict(c)}")


if __name__ == "__main__":
    main()
