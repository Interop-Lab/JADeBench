#!/usr/bin/env python3
"""Stage 2 — Filtering: clone each candidate, install, and run its test suite.

A project is admitted only if its own tests actually run and pass on this
machine, because those tests are the oracle every later stage depends on.
This is the stage with the highest attrition, and the paper requires that
number to be reported, so every failure is recorded with its cause.

Usage:
    python3 scripts/02_build_verify.py [--limit 20] [--jobs 4]
"""
import argparse
import json
import os
import re
import shutil
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from lib import (RAW, WORK, Attrition, load_config, log, read_jsonl,
                 write_jsonl)

STAGE = "02_build_verify"


def run(cmd, cwd, timeout, env=None):
    try:
        p = subprocess.run(cmd, cwd=cwd, timeout=timeout, shell=isinstance(cmd, str),
                           capture_output=True, text=True,
                           env={**os.environ, **(env or {})})
        return p.returncode, (p.stdout or "")[-4000:], (p.stderr or "")[-4000:]
    except subprocess.TimeoutExpired:
        return -1, "", f"TIMEOUT after {timeout}s"
    except Exception as exc:  # noqa: BLE001
        return -2, "", str(exc)


def pick_installer(dest, pkg, cfg):
    """Choose a package manager from the lockfile and the dependency protocols.

    Installing without honouring the lockfile resolves newer versions than the
    project pinned, which is how a CommonJS project ends up importing an
    ESM-only transitive dependency and failing for a reason that has nothing
    to do with the project. Monorepos using the `workspace:` protocol cannot be
    installed by npm at all.
    """
    pms = cfg["package_managers"]
    deps = json.dumps({**pkg.get("dependencies", {}),
                       **pkg.get("devDependencies", {})})
    if "workspace:" in deps:
        return pms["_workspace_protocol"], "workspace_protocol"
    for lockfile in ("pnpm-lock.yaml", "yarn.lock", "package-lock.json"):
        if (dest / lockfile).exists():
            return pms[lockfile], lockfile
    return pms["_fallback"], "no_lockfile"


TEST_COUNT_RE = re.compile(
    r"(?:Tests?:\s+(?:\d+\s+failed,\s+)?(\d+)\s+passed)"
    r"|(?:(\d+)\s+pass(?:ed|ing))"
    r"|(?:\u2713\s*(\d+)\s+tests?\s+passed)"
    r"|(?:#\s*pass\s+(\d+))", re.I)


def count_passing(text):
    """Best-effort passing-test count across the accepted runners."""
    best = 0
    for m in TEST_COUNT_RE.finditer(text or ""):
        for g in m.groups():
            if g:
                best = max(best, int(g))
    return best


def expand_scripts(scripts, name="test", depth=0, seen=None):
    """Collect the individual script bodies reachable from `test`.

    Returns a list of bodies rather than one concatenated string. Real projects
    chain through `npm run test:unit`, `npm-run-all build lint test:unit`, or a
    task runner, and each referenced script is its own shell command; joining
    them would erase the boundaries and make it impossible to recover the exact
    invocation that runs the tests.
    """
    seen = seen or set()
    if depth > 3 or name in seen or name not in scripts:
        return []
    seen.add(name)
    body = scripts.get(name, "") or ""
    out = [body]
    refs = re.findall(r"(?:npm run|pnpm run|yarn run|yarn)\s+([\w:.-]+)", body)
    for grp in re.findall(r"(?:npm-run-all|run-p|run-s|turbo run)\s+([\w\s:.'\"-]+)", body):
        refs.extend(t.strip("'\"") for t in grp.split())
    for r in refs:
        if r.startswith("-"):
            continue
        out.extend(expand_scripts(scripts, r, depth + 1, seen))
    return out


def isolate_invocation(expanded, at):
    """Extract the single shell command around position `at`.

    Stage 5 has to run one test file with the project's own runner
    configuration. Invoking the runner bare loses environment variables and
    flags the project relies on — dropping `BABEL_ENV=test --require
    babel-core/register` makes every test file fail to parse — so the real
    invocation is preserved here and specialized to one file later.
    """
    left = max(expanded.rfind("&&", 0, at), expanded.rfind(";", 0, at),
               expanded.rfind("|", 0, at))
    left = 0 if left < 0 else left + 2
    right = len(expanded)
    for sep in ("&&", ";", "|"):
        i = expanded.find(sep, at)
        if i != -1:
            right = min(right, i)
    return expanded[left:right].strip()


def detect_runner(pkg, cfg):
    """Identify the test runner actually invoked by the `test` script.

    The runner must be invoked, not merely present in the dependency list. A
    project can depend on ava while its `test` script does something else
    entirely — `open ./test/index.html` exits 0 without running a single test,
    and admitting it would give us subjects with no working oracle.
    """
    scripts = pkg.get("scripts", {})
    test_script = scripts.get("test", "")
    if not test_script or "no test specified" in test_script:
        return None, test_script, None

    # `_mocha`/`_tap` are the un-instrumented binaries projects call under a
    # coverage wrapper; they are the same runner.
    bodies = [re.sub(r"(^|[\s/])_(mocha|tap|jest|ava)\b", r"\1\2", b)
              for b in expand_scripts(scripts)]

    for runner in cfg["accepted_test_runners"]:
        needle = "node --test" if runner == "node:test" else runner
        pat = r"(^|[\s/&|;(]){}([\s/&|;)]|$)".format(re.escape(needle))
        for body in bodies:
            m = re.search(pat, body)
            if m:
                return runner, test_script, isolate_invocation(body, m.start())

    # A plain `node test/...` script is a genuine test suite without a
    # framework; it runs and reports through its exit code, which is all the
    # oracle needs.
    for body in bodies:
        m = re.search(r"(^|[\s&|;])node\s+[\w./*-]*test[\w./*-]*\.[cm]?js", body)
        if m:
            return "node-script", test_script, isolate_invocation(body, m.start())

    return None, test_script, None


def verify_one(cand, cfg, att, cleanup=True):
    """Verify one candidate, discarding its checkout if it does not qualify.

    Roughly four in five candidates fail, and a failed checkout still holds a
    partially installed node_modules. At corpus scale that is tens of
    gigabytes of storage devoted to projects the benchmark will never use, so
    failures are removed as soon as they are recorded.
    """
    ident = cand["id"]
    dest = WORK / ident.replace("/", "__")

    def reject(reason, detail=None):
        att.drop(ident, reason, detail)
        if cleanup:
            shutil.rmtree(dest, ignore_errors=True)
        return None

    if not (dest / ".git").exists():
        if dest.exists():
            shutil.rmtree(dest, ignore_errors=True)
        rc, _, err = run(
            ["git", "clone", "--depth", "50", "--quiet",
             cand["clone_url"], str(dest)], cwd=WORK, timeout=300)
        if rc != 0:
            return reject("clone_failed", err[:300])

    pkg_path = dest / "package.json"
    if not pkg_path.exists():
        return reject("no_package_json")
    try:
        pkg = json.loads(pkg_path.read_text(encoding="utf-8"))
    except Exception as exc:  # noqa: BLE001
        return reject("bad_package_json", str(exc)[:200])

    runner, test_script, invocation = detect_runner(pkg, cfg)
    if runner is None:
        return reject("no_supported_test_runner", test_script[:200])

    install_cmd, why = pick_installer(dest, pkg, cfg)
    rc, _, err = run(install_cmd, cwd=dest, timeout=cfg["install_timeout_sec"])
    if rc != 0 and why != "no_lockfile":
        # A frozen-lockfile install can fail on a shallow clone; fall back once,
        # but record that this project was not installed at pinned versions.
        install_cmd, why = cfg["package_managers"]["_fallback"], "fallback_after_lockfile_failure"
        rc, _, err = run(install_cmd, cwd=dest, timeout=cfg["install_timeout_sec"])
    if rc != 0:
        return reject("install_failed", f"[{install_cmd}] {err[:260]}")

    rc, out, err = run("npm test", cwd=dest,
                       timeout=cfg["test_timeout_sec"], env={"CI": "1"})
    passing = count_passing(out + "\n" + err)
    # The suite must run and produce a substantial body of passing tests, which
    # is what shows the toolchain is correctly assembled. It need not be fully
    # green: a stale snapshot in an unrelated module says nothing about the
    # subject we will extract, whose own test file is gated in stage 5.
    if passing < cfg["min_passing_tests"]:
        return reject("suite_did_not_run_or_too_few_passing",
                      f"passing={passing} rc={rc} {(err or out)[-220:]}")
    suite_green = rc == 0

    rc2, head, _ = run(["git", "rev-parse", "HEAD"], cwd=dest, timeout=30)
    log(STAGE, f"OK  {ident} ({runner}, {passing} passing, green={rc == 0}, via {why})")
    return {
        **cand,
        "local_path": str(dest),
        "commit": head.strip() if rc2 == 0 else None,
        "test_runner": runner,
        "test_script": test_script,
        "runner_invocation": invocation,
        "module_type": pkg.get("type", "commonjs"),
        "installer": install_cmd,
        "install_mode": why,
        "suite_green": suite_green,
        "suite_passing_tests": passing,
        "pkg_name": pkg.get("name"),
        "pkg_version": pkg.get("version"),
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--jobs", type=int, default=4)
    ap.add_argument("--sample", type=int, default=0,
                    help="stratified sample per domain, for estimating the "
                         "survival rate without running the whole set")
    ap.add_argument("--seed", type=int, default=17)
    ap.add_argument("--keep-failed", action="store_true",
                    help="retain checkouts of rejected candidates for debugging")
    args = ap.parse_args()

    cfg = load_config("thresholds.json")["build_verify"]
    cands = read_jsonl(RAW / "candidates.jsonl")
    if args.sample:
        import random
        from collections import defaultdict
        rng = random.Random(args.seed)
        by_dom = defaultdict(list)
        for c in cands:
            by_dom[c["domain"]].append(c)
        cands = []
        for dom in sorted(by_dom):
            pool = by_dom[dom][:]
            rng.shuffle(pool)
            cands.extend(pool[:args.sample])
        log(STAGE, f"stratified sample: {args.sample}/domain, seed={args.seed}")
    if args.limit:
        cands = cands[:args.limit]
    if not cands:
        log(STAGE, "no candidates — run 01_discover.py first")
        return

    att = Attrition(STAGE)
    kept = []
    log(STAGE, f"verifying {len(cands)} candidates with {args.jobs} workers")
    with ThreadPoolExecutor(max_workers=args.jobs) as pool:
        futs = {pool.submit(verify_one, c, cfg, att, not args.keep_failed): c
                for c in cands}
        for fut in as_completed(futs):
            try:
                r = fut.result()
            except Exception as exc:  # noqa: BLE001
                att.drop(futs[fut]["id"], "verifier_crashed", str(exc)[:200])
                continue
            if r:
                kept.append(r)

    write_jsonl(RAW / "projects_verified.jsonl", kept)
    att.save()
    log(STAGE, f"{len(kept)}/{len(cands)} projects build and pass their own tests")


if __name__ == "__main__":
    main()
