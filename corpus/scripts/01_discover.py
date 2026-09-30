#!/usr/bin/env python3
"""Stage 1 — Collection: discover candidate projects per domain.

Searches GitHub for each domain's queries, applies the repo-level filter from
config/thresholds.json, and writes surviving candidates to raw/candidates.jsonl.
Every rejection is recorded in stats/attrition.jsonl with its reason.

Usage:
    GITHUB_TOKEN=ghp_... python3 scripts/01_discover.py [--per-query 30]
"""
import argparse
import re
import sys
from datetime import datetime, timezone

sys.path.insert(0, str(__import__("pathlib").Path(__file__).resolve().parent))
from lib import (RAW, Attrition, gh_get, load_config, log, require_token_hint,
                 write_jsonl)

STAGE = "01_discover"


def days_since(iso):
    if not iso:
        return 10**6
    dt = datetime.fromisoformat(iso.replace("Z", "+00:00"))
    return (datetime.now(timezone.utc) - dt).days


def repo_passes(repo, flt, att):
    full = repo.get("full_name", "?")

    lic = (repo.get("license") or {}).get("key")
    if lic not in flt["permissive_licenses"]:
        att.drop(full, "license_not_permissive", lic)
        return False

    stars = repo.get("stargazers_count", 0)
    if stars < flt["min_stars"]:
        att.drop(full, "too_few_stars", stars)
        return False
    if stars > flt["max_stars"]:
        att.drop(full, "too_many_stars_contamination_risk", stars)
        return False

    if repo.get("archived") or repo.get("disabled"):
        att.drop(full, "archived_or_disabled")
        return False
    if repo.get("fork"):
        att.drop(full, "is_fork")
        return False

    if days_since(repo.get("pushed_at")) > flt["pushed_within_days"]:
        att.drop(full, "unmaintained", repo.get("pushed_at"))
        return False
    if days_since(repo.get("created_at")) < flt["min_repo_age_days"]:
        att.drop(full, "too_new", repo.get("created_at"))
        return False

    if repo.get("size", 0) > flt["max_repo_size_kb"]:
        att.drop(full, "repo_too_large", repo.get("size"))
        return False

    name = repo.get("name", "").lower()
    desc = (repo.get("description") or "").lower()
    for pat in flt["exclude_name_patterns"]:
        if re.search(pat, name) or re.search(pat, desc):
            att.drop(full, "excluded_pattern_teaching_or_algorithmic", pat)
            return False

    return True


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--per-query", type=int, default=30,
                    help="results to request per search query (max 100)")
    ap.add_argument("--no-cache", action="store_true")
    args = ap.parse_args()

    require_token_hint()
    domains = load_config("domains.json")
    flt = load_config("thresholds.json")["repo_filter"]
    att = Attrition(STAGE)

    seen, kept = set(), []
    for dom in domains["domains"]:
        dom_kept = 0
        for query in dom["queries"]:
            q = f"{query} stars:{flt['min_stars']}..{flt['max_stars']} " \
                f"pushed:>{(datetime.now(timezone.utc).date().replace(year=datetime.now().year - 2))}"
            payload = gh_get(f"{__import__('lib').GITHUB_API}/search/repositories",
                             {"q": q, "sort": "stars", "order": "desc",
                              "per_page": min(args.per_query, 100)},
                             use_cache=not args.no_cache)
            if not payload or "items" not in payload:
                log(STAGE, f"no results for [{query}] (rate limit or empty)")
                continue

            for repo in payload["items"]:
                full = repo["full_name"]
                if full in seen:
                    continue
                seen.add(full)
                if not repo_passes(repo, flt, att):
                    continue
                kept.append({
                    "id": full,
                    "domain": dom["id"],
                    "clone_url": repo["clone_url"],
                    "default_branch": repo.get("default_branch", "main"),
                    "stars": repo.get("stargazers_count"),
                    "license": (repo.get("license") or {}).get("key"),
                    "description": repo.get("description"),
                    "repo_created_at": repo.get("created_at"),
                    "repo_pushed_at": repo.get("pushed_at"),
                    "size_kb": repo.get("size"),
                    "topics": repo.get("topics", []),
                    "discovered_via": query,
                })
                dom_kept += 1
        log(STAGE, f"domain {dom['id']}: {dom_kept} candidates "
                   f"(target {dom['target_projects']} projects)")

    write_jsonl(RAW / "candidates.jsonl", kept)
    att.save()
    log(STAGE, f"wrote {len(kept)} candidates to raw/candidates.jsonl")

    by_dom = {}
    for r in kept:
        by_dom[r["domain"]] = by_dom.get(r["domain"], 0) + 1
    for dom in domains["domains"]:
        n = by_dom.get(dom["id"], 0)
        flag = "OK" if n >= dom["target_projects"] else "SHORT"
        log(STAGE, f"  {flag:5s} {dom['id']:16s} {n:3d} / {dom['target_projects']}")


if __name__ == "__main__":
    main()
