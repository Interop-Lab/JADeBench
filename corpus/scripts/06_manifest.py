#!/usr/bin/env python3
"""Stage 6 — Manifest and statistics.

Emits the final corpus manifest plus the two tables the paper needs: the
attrition table (how many subjects each stage removed, and why) and the
benchmark statistics that populate Table 5. Also runs the threshold
sensitivity analysis the paper's TODO asks for, by re-applying the realism
screen at every point of the configured grid and reporting how corpus size
and domain composition move.

Usage:
    python3 scripts/06_manifest.py
"""
import itertools
import json
import statistics
import sys
from collections import Counter, defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from lib import RAW, ROOT, STATS, load_config, log, read_jsonl, write_jsonl

STAGE = "06_manifest"


def quantiles(values):
    if not values:
        return {}
    vs = sorted(values)
    return {
        "min": vs[0],
        "p25": vs[len(vs) // 4],
        "median": statistics.median(vs),
        "p75": vs[3 * len(vs) // 4],
        "max": vs[-1],
        "mean": round(statistics.mean(vs), 2),
    }


def sensitivity(all_candidates, screen_cfg):
    """Re-apply the screen across the configured grid.

    Reported so that the corpus definition can be seen to be robust, or seen
    not to be, rather than resting on one unexamined set of thresholds.
    """
    grid = screen_cfg["sensitivity_grid"]
    rows = []
    combos = itertools.product(
        grid["host_api_call_sites"],
        grid["first_party_modules_inlined"],
        grid["domain_identifier_ratio"],
        grid["min_criteria_met"],
    )
    usable = [c for c in all_candidates
              if c.get("metrics") and c.get("rejected") in (None, "realism_screen")]
    for host, mods, ratio, need in combos:
        kept, by_dom = 0, Counter()
        for c in usable:
            m = c["metrics"]
            met = sum([
                m["host_api_call_sites"] >= host,
                m["first_party_modules_inlined"] >= mods,
                m["domain_identifier_ratio"] >= ratio,
            ])
            if met >= need:
                kept += 1
                by_dom[c["domain"]] += 1
        rows.append({
            "host_api_call_sites": host,
            "first_party_modules_inlined": mods,
            "domain_identifier_ratio": ratio,
            "min_criteria_met": need,
            "subjects_kept": kept,
            "by_domain": dict(by_dom),
        })
    return rows


def main():
    cfg = load_config("thresholds.json")
    subs = read_jsonl(RAW / "subjects_with_coverage.jsonl")
    if not subs:
        subs = read_jsonl(RAW / "subjects_deduped.jsonl")
        if subs:
            log(STAGE, "using pre-coverage subjects (05_coverage.py has not run)")
    if not subs:
        log(STAGE, "no subjects — run the earlier stages first")
        return

    # ---- final manifest -------------------------------------------------
    manifest = []
    for s in subs:
        manifest.append({
            "subject_id": s["subject_id"],
            "project": s["project"],
            "domain": s["domain"],
            "module": s["module"],
            "test_file": s.get("test_file"),
            "bundle_path": s["bundle_path"],
            "platform": s.get("platform"),
            "module_format": s.get("module_format"),
            "commit": s.get("commit"),
            "license": s.get("license"),
            "stars": s.get("stars"),
            "repo_created_at": s.get("repo_created_at"),
            "repo_pushed_at": s.get("repo_pushed_at"),
            "test_runner": s.get("test_runner"),
            "runner_invocation": s.get("runner_invocation"),
            "metrics": s.get("metrics"),
            "coverage": s.get("coverage"),
        })
    write_jsonl(ROOT / "manifest.jsonl", manifest)

    # ---- attrition table ------------------------------------------------
    att_rows = read_jsonl(STATS / "attrition.jsonl")
    attrition = defaultdict(Counter)
    for r in att_rows:
        attrition[r["stage"]][r["reason"]] += 1
    attrition_out = {st: dict(c) for st, c in attrition.items()}
    with open(STATS / "attrition_summary.json", "w", encoding="utf-8") as fh:
        json.dump(attrition_out, fh, indent=2, ensure_ascii=False)

    # ---- benchmark statistics (paper Table 5) ---------------------------
    projects = {s["project"] for s in subs}
    locs = [s["metrics"]["loc"] for s in subs if s.get("metrics")]
    ids = [s["metrics"]["declared_identifiers"] for s in subs if s.get("metrics")]
    dom_ids = [s["metrics"]["domain_identifiers"] for s in subs if s.get("metrics")]
    with_host = sum(1 for s in subs if s.get("metrics", {}).get("host_api_call_sites", 0) > 0)
    with_async = sum(1 for s in subs if s.get("metrics", {}).get("async_constructs", 0) > 0)
    covs = [s["coverage"] for s in subs if s.get("coverage")]

    stats = {
        "projects": len(projects),
        "subjects": len(subs),
        "by_domain": dict(Counter(s["domain"] for s in subs)),
        "by_license": dict(Counter(s.get("license") for s in subs)),
        "loc": quantiles(locs),
        "declared_identifiers_total": sum(ids),
        "domain_identifiers_total": sum(dom_ids),
        "pct_subjects_using_host_api": round(with_host / len(subs), 4),
        "pct_subjects_with_async": round(with_async / len(subs), 4),
        "subjects_per_project": quantiles(
            list(Counter(s["project"] for s in subs).values())),
        "coverage_statement": quantiles([c["statement"] for c in covs]),
        "coverage_branch": quantiles([c["branch"] for c in covs]),
        "coverage_measured_for": len(covs),
    }
    with open(STATS / "summary.json", "w", encoding="utf-8") as fh:
        json.dump(stats, fh, indent=2, ensure_ascii=False)

    # ---- threshold sensitivity -----------------------------------------
    cands = read_jsonl(RAW / "subjects_all_candidates.jsonl")
    if cands:
        rows = sensitivity(cands, cfg["realism_screen"])
        with open(STATS / "sensitivity.json", "w", encoding="utf-8") as fh:
            json.dump(rows, fh, indent=2, ensure_ascii=False)
        log(STAGE, f"sensitivity analysis over {len(rows)} threshold combinations")

    # ---- console report -------------------------------------------------
    log(STAGE, f"manifest: {stats['subjects']} subjects from {stats['projects']} projects")
    log(STAGE, f"  by domain: {stats['by_domain']}")
    log(STAGE, f"  LOC median {stats['loc'].get('median')}, "
               f"host-API {stats['pct_subjects_using_host_api']:.0%}, "
               f"async {stats['pct_subjects_with_async']:.0%}")
    log(STAGE, "attrition by stage:")
    for st in sorted(attrition_out):
        total = sum(attrition_out[st].values())
        log(STAGE, f"  {st:22s} -{total}")
        for reason, n in sorted(attrition_out[st].items(), key=lambda kv: -kv[1])[:5]:
            log(STAGE, f"      {reason:42s} {n}")


if __name__ == "__main__":
    main()
