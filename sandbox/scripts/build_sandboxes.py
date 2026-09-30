#!/usr/bin/env python3
"""Build one sandbox per subject, split into an agent view and an oracle view.

Each sandbox has two directories that never see each other:

    agent/   the subject, its dependencies, and the execute/debug harnesses
    oracle/  the project's test files and the reference behavior

The split exists because a developer-written test cannot be shown to the agent.
Such a test is simultaneously a driver (it makes the code run) and a definition
of correctness (it asserts expected values), and it is written in the
developer's vocabulary — a test for `config.js` inevitably names
`EMBEDDING_API_KEY`, because that is what it tests. Measured on an earlier
build of this pipeline, every sandbox leaked at least three of its module's
original identifiers through the test file, and 74% leaked the original module
path. An agent that can read that is not deobfuscating; it is copying.

Scoring therefore mounts the agent's subject into the oracle view from outside
(see scripts/score.py), rather than placing the oracle where the agent works.

The subject is stored under a fixed name, so an obfuscated build can be swapped
in without touching anything else — the oracle, the harness, and the dependency
set are identical across access levels and obfuscation tiers, which is what
makes a measured difference attributable.

Usage:
    python3 scripts/build_sandboxes.py [--limit N] [--only <substring>] [--jobs 8]
"""
import argparse
import hashlib
import json
import os
import re
import shutil
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed

from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from isolation import check_isolation  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
# ADB_CORPUS names the corpus root, as it already does for the evaluators and
# the obfuscation tier. Pointing it at corpus/codenet_ref builds sandboxes for
# the CodeNet reference population instead; subject ids are prefixed by their
# project, so the two populations' sandboxes do not collide.
CORPUS = Path(os.environ.get("ADB_CORPUS", ROOT.parent / "corpus")).resolve()
OUT = ROOT / "sandboxes"
HARNESS = ROOT / "harness"
STATS = ROOT / "stats"
SHARED_NM = ROOT / "shared" / "node_modules"
ORACLE_OVERLAYS = ROOT / "oracle_overlays"

IMPORT_RE = re.compile(
    r"""(?:import|export)\s[^'"]*?from\s*['"]([^'"]+)['"]"""
    r"""|import\s*\(\s*['"]([^'"]+)['"]\s*\)"""
    r"""|import\s+['"]([^'"]+)['"]"""
    r"""|(?:__require|require)\s*\(\s*['"]([^'"]+)['"]\s*\)""")

# Node builtins are not installable packages; treating them as third-party
# dependencies made every CommonJS subject report a dozen unresolved deps.
NODE_BUILTINS = {
    "assert", "async_hooks", "buffer", "child_process", "cluster", "console",
    "constants", "crypto", "dgram", "diagnostics_channel", "dns", "domain",
    "events", "fs", "http", "http2", "https", "inspector", "module", "net",
    "os", "path", "perf_hooks", "process", "punycode", "querystring",
    "readline", "repl", "stream", "string_decoder", "sys", "timers", "tls",
    "trace_events", "tty", "url", "util", "v8", "vm", "wasi", "worker_threads",
    "zlib",
}

BROWSER_GLOBALS = {
    "document", "window", "navigator", "localStorage", "sessionStorage",
    "XMLHttpRequest", "WebSocket", "location", "history", "customElements",
    "IntersectionObserver", "MutationObserver", "requestAnimationFrame",
    "getComputedStyle", "HTMLElement", "Element", "CSS", "React",
}
NODE_GLOBALS = {
    "process", "Buffer", "__dirname", "__filename", "global",
    "fs", "path", "os", "child_process", "worker_threads", "stream", "zlib",
}


def specifiers(source):
    """Every module specifier in a source file, in order of appearance."""
    out = []
    for m in IMPORT_RE.finditer(source):
        spec = next((g for g in m.groups() if g), None)
        if spec:
            out.append(spec)
    return out


def package_root(spec):
    """The installable package name for a specifier (`a/b` -> `a`, scoped kept)."""
    if spec.startswith("@"):
        return "/".join(spec.split("/")[:2])
    return spec.split("/")[0]


def classify_runtime(metrics):
    """Which host a subject targets, judged by the globals it actually uses.

    Determined from the code rather than assigned from a topic label, so the
    classification is verifiable and has no arbitrary tie-breaking.
    """
    used = set(metrics.get("host_globals_used", [])) | set(metrics.get("third_party_bindings", []))
    b, n = len(used & BROWSER_GLOBALS), len(used & NODE_GLOBALS)
    if b > n:
        return "browser"
    if n > b:
        return "node"
    return "agnostic"


def resolve_relative(base_file, spec, project_root):
    """Resolve a relative specifier to a real file inside the project."""
    base = (base_file.parent / spec).resolve()
    cands = [base]
    for ext in (".js", ".mjs", ".cjs", ".jsx", ".json"):
        cands.append(Path(str(base) + ext))
        cands.append(base / f"index{ext}")
    for c in cands:
        if c.is_file():
            try:
                c.relative_to(project_root.resolve())
            except ValueError:
                return None          # outside the project; do not copy
            return c
    return None


def apply_oracle_overlays(box, oracle_dir):
    """Copy subject-specific oracle replacements, if any.

    Corpus bundling inlines first-party helpers. A test that spies on one of
    those helpers then scores the bundle (and every obfuscation of it) as
    failing, even though the public behavior is intact. Overlays rewrite only
    those tests so they exercise the exported API instead of the inlined edge.
    """
    overlay_root = ORACLE_OVERLAYS / box.name
    if not overlay_root.is_dir():
        return 0
    copied = 0
    for src in overlay_root.rglob("*"):
        if not src.is_file() or src.name == "README.md":
            continue
        dest = oracle_dir / src.relative_to(overlay_root)
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, dest)
        copied += 1
    return copied


def collect_test_closure(test_path, project_root, subject_module, depth=0, seen=None):
    """The test file plus every project file it transitively pulls in.

    44% of test files import project helpers or fixtures alongside the module
    under test, so copying the test alone yields a sandbox whose oracle cannot
    load. The module under test is deliberately excluded: it is replaced by the
    subject bundle.
    """
    seen = seen if seen is not None else set()
    if depth > 4 or test_path in seen or not test_path.is_file():
        return seen
    seen.add(test_path)
    try:
        src = test_path.read_text(encoding="utf-8", errors="ignore")
    except OSError:
        return seen
    for spec in specifiers(src):
        if not spec.startswith("."):
            continue
        target = resolve_relative(test_path, spec, project_root)
        if target and target != subject_module:
            collect_test_closure(target, project_root, subject_module, depth + 1, seen)
    return seen


# Tests reach the module under test through more than `import`/`require`:
# `require.resolve` for cache busting, `jest.mock`/`vi.mock` for stubbing. Any
# of these left pointing at the original path makes the oracle load a module
# that is not the candidate being scored.
INDIRECT_RE = re.compile(
    r"""(require\.resolve|jest\.(?:mock|unmock|requireActual|doMock)"""
    r"""|vi\.(?:mock|unmock|importActual))\s*\(\s*['"]([^'"]+)['"]""")


def rewrite_subject_import(source, test_file, subject_module, project_root, subject_rel):
    """Point every reference to the module under test at the subject bundle."""
    def repl(m):
        spec = next((g for g in m.groups() if g), None)
        if not spec or not spec.startswith("."):
            return m.group(0)
        target = resolve_relative(test_file, spec, project_root)
        if target and target == subject_module:
            return m.group(0).replace(spec, subject_rel)
        return m.group(0)

    def repl_indirect(m):
        spec = m.group(2)
        if not spec.startswith("."):
            return m.group(0)
        target = resolve_relative(test_file, spec, project_root)
        if target and target == subject_module:
            return m.group(0).replace(spec, subject_rel)
        return m.group(0)

    return INDIRECT_RE.sub(repl_indirect, IMPORT_RE.sub(repl, source))


def find_package(name, project_root):
    """Locate an installed package, or the project itself under its own name.

    Three cases the top level of node_modules does not cover: a package nested
    under another dependency rather than hoisted; a project that imports itself
    by its published name; and a workspace package living outside node_modules.
    """
    top = project_root / "node_modules" / name
    if top.exists():
        return top

    # The project referring to itself by its package name.
    pkg_json = project_root / "package.json"
    if pkg_json.is_file():
        try:
            if json.loads(pkg_json.read_text(encoding="utf-8")).get("name") == name:
                return project_root
        except Exception:  # noqa: BLE001
            pass

    # Nested (unhoisted) installs.
    for nested in (project_root / "node_modules").glob(f"*/node_modules/{name}"):
        if nested.exists():
            return nested
    for ws in ("packages", "libs", "modules"):
        cand = project_root / ws / name.split("/")[-1]
        if (cand / "package.json").is_file():
            return cand
    return None


def link_package(name, project_root, sandbox_nm):
    """Symlink one installed package into the sandbox.

    Symlinks rather than copies: the closures are small but 171 sandboxes would
    still duplicate gigabytes, and the packages are read-only inputs.
    """
    src = find_package(name, project_root)
    if src is None:
        return False
    dst = sandbox_nm / name
    dst.parent.mkdir(parents=True, exist_ok=True)
    if dst.exists() or dst.is_symlink():
        return True
    try:
        os.symlink(src.resolve(), dst, target_is_directory=True)
        return True
    except OSError:
        return False


def build_one(sub):
    """Assemble one sandbox.

    The oracle view mirrors the project's own directory layout, and the subject
    is placed at the original module's path. Runner configuration routinely
    names files by project-relative path (`.mocharc` requiring
    `test/support/bootstrap.js`), so relocating the tests under a subdirectory
    breaks setup that has nothing to do with the subject.
    """
    sid = sub["subject_id"]
    safe = re.sub(r"[^\w.@-]+", "_", sid)
    box = OUT / safe
    project_root = CORPUS / "work" / sub["project"].replace("/", "__")
    bundle = CORPUS / sub["bundle_path"]

    if not bundle.is_file():
        return {"subject_id": sid, "ok": False, "reason": "bundle_missing"}
    if not project_root.is_dir():
        return {"subject_id": sid, "ok": False, "reason": "project_checkout_missing"}

    if box.exists():
        shutil.rmtree(box)
    agent_dir = box / "agent"
    oracle_dir = box / "oracle"
    (agent_dir / "harness").mkdir(parents=True, exist_ok=True)
    oracle_dir.mkdir(parents=True, exist_ok=True)

    # ---- the subject (agent view) ---------------------------------------
    source = bundle.read_text(encoding="utf-8", errors="ignore")
    # The extension carries the module system, so Node loads the subject the way
    # its project would have; an ESM wrapper around CommonJS throws on builtins.
    entry_name = "subject.mjs" if sub.get("module_format") == "esm" else "subject.cjs"
    (agent_dir / entry_name).write_text(source, encoding="utf-8")

    # In the oracle the subject stands in for the original module, at its
    # original path, so the tests need no rewriting at all.
    oracle_entry = sub["module"]

    # ---- third-party closure --------------------------------------------
    deps = sorted({package_root(s) for s in specifiers(source)
                   if not s.startswith(".") and not s.startswith("node:")
                   and package_root(s) not in NODE_BUILTINS})
    linked, unresolved = [], []
    (agent_dir / "node_modules").mkdir(exist_ok=True)
    for d in deps:
        (linked if link_package(d, project_root, agent_dir / "node_modules") else unresolved).append(d)

    runtime = classify_runtime(sub.get("metrics", {}))
    if runtime == "browser":
        # A browser subject needs a DOM host even when its project never
        # installed one, so fall back to the shared jsdom kept beside the
        # harness rather than leaving the sandbox unable to load anything.
        if link_package("jsdom", project_root, agent_dir / "node_modules"):
            linked.append("jsdom")
        elif (SHARED_NM / "jsdom").exists():
            link_package("jsdom", ROOT / "shared", agent_dir / "node_modules")
            linked.append("jsdom(shared)")
        else:
            unresolved.append("jsdom")

    # ---- oracle: the project's own runtime -------------------------------
    # The oracle runs the project's test runner with the project's config, so it
    # needs the project's node_modules, not the subject's narrow closure. This
    # is safe: the oracle view is never visible to the agent.
    onm = oracle_dir / "node_modules"
    if not onm.exists():
        try:
            os.symlink((project_root / "node_modules").resolve(), onm,
                       target_is_directory=True)
        except OSError:
            pass
    # Runner configuration (jest.config, babel.config, tsconfig…) decides whether
    # the suite can even start.
    for cfg in project_root.glob("*"):
        if cfg.is_file() and re.match(
                r"^\.?(jest|vitest|babel|tsconfig|babelrc|mocharc|ava|nyc|c8|swcrc)"
                r"[.\w-]*(\.(json|js|cjs|mjs|ts|yml|yaml))?$", cfg.name):
            try:
                shutil.copy2(cfg, oracle_dir / cfg.name)
            except OSError:
                pass

    # Runner configuration names setup files by project-relative path
    # (`.mocharc` requiring `test/support/bootstrap.js`, jest's setupFiles,
    # vitest's setupFiles). Those are not reachable from the test's imports, so
    # the import closure alone leaves the suite unable to start.
    for cfg_file in list(oracle_dir.glob("*")):
        if not cfg_file.is_file() or cfg_file.name == "package.json":
            continue
        try:
            cfg_text = cfg_file.read_text(encoding="utf-8", errors="ignore")
        except OSError:
            continue
        for ref in re.findall(r"['\"]([\w./@-]+\.[cm]?js)['\"]", cfg_text):
            src_file = (project_root / ref.lstrip("./")).resolve()
            if src_file.is_file():
                try:
                    rel_ref = src_file.relative_to(project_root.resolve())
                except ValueError:
                    continue
                dst = oracle_dir / rel_ref
                dst.parent.mkdir(parents=True, exist_ok=True)
                if not dst.exists():
                    shutil.copy2(src_file, dst)
                    # setup files import project code of their own
                    for extra in collect_test_closure(src_file, project_root,
                                                      (project_root / sub["module"]).resolve()):
                        try:
                            er = extra.relative_to(project_root.resolve())
                        except ValueError:
                            continue
                        ed = oracle_dir / er
                        if not ed.exists():
                            ed.parent.mkdir(parents=True, exist_ok=True)
                            shutil.copy2(extra, ed)

    # ---- oracle: test file plus its project closure ----------------------
    test_rel = sub.get("test_file")
    oracle = {"available": False}
    if test_rel:
        test_path = project_root / test_rel
        subject_module = (project_root / sub["module"]).resolve()
        closure = collect_test_closure(test_path, project_root, subject_module)
        for f in closure:
            rel = f.relative_to(project_root)
            dest = oracle_dir / rel
            dest.parent.mkdir(parents=True, exist_ok=True)
            # No import rewriting: the subject occupies the original module's
            # path, so the tests resolve it exactly as they always did.
            text = f.read_text(encoding="utf-8", errors="ignore")
            dest.write_text(text, encoding="utf-8")
            # a test's own imports may reach third-party packages too
            for spec in specifiers(text):
                if not spec.startswith(".") and not spec.startswith("node:"):
                    r = package_root(spec)
                    if r not in linked and link_package(r, project_root,
                                                        oracle_dir / "node_modules"):
                        pass    # oracle dependencies stay in the oracle view
        oracle = {
            "available": True,
            "test_file": str(test_rel),
            "extra_files": len(closure) - 1,
            "runner": sub.get("test_runner"),
            "invocation": sub.get("runner_invocation"),
        }

    apply_oracle_overlays(box, oracle_dir)

    # ---- harness (agent view) -------------------------------------------
    for h in ("execute.mjs", "debug.mjs", "browser-env.mjs", "_debug-target.mjs"):
        shutil.copy2(HARNESS / h, agent_dir / "harness" / h)

    pkg_type = "module" if sub.get("module_format") == "esm" else "commonjs"
    (agent_dir / "package.json").write_text(json.dumps({
        "name": f"adb-agent-{safe[:52]}".lower(),
        "private": True,
        "type": pkg_type,
        "description": "AgentDeobfBench agent view",
    }, indent=2), encoding="utf-8")

    # The oracle inherits the project's package.json so the runner resolves
    # configuration the way it did in the project, minus the scripts that would
    # rebuild or re-fetch anything.
    try:
        proj_pkg = json.loads((project_root / "package.json").read_text(encoding="utf-8"))
    except Exception:  # noqa: BLE001
        proj_pkg = {}
    proj_pkg.pop("scripts", None)
    proj_pkg["private"] = True
    (oracle_dir / "package.json").write_text(json.dumps(proj_pkg, indent=2),
                                             encoding="utf-8")

    # The agent's own metadata deliberately omits the module path, the project
    # name, and anything else that would name the original.
    # The agent gets an opaque handle, not the subject id: the id embeds the
    # project and the original module path, which would hand over the module's
    # name and its place in the source tree for free.
    handle = hashlib.sha256(sid.encode("utf-8")).hexdigest()[:16]
    (agent_dir / "sandbox.json").write_text(json.dumps({
        "handle": handle,
        "entry": entry_name,
        "runtime": runtime,
        "dependencies": {"available": sorted(set(linked))},
        "browser": {"url": "https://sandbox.local/",
                    "html": "<!doctype html><html><body></body></html>"}
                   if runtime == "browser" else None,
    }, indent=2, ensure_ascii=False), encoding="utf-8")

    (agent_dir / "cassette.json").write_text(json.dumps({
        "_comment": "Recorded host interactions. Network responses are keyed "
                    "'METHOD url'; the clock and PRNG are fixed so repeated runs "
                    "of one input agree.",
        "network": {}, "clock": {"start": 1735689600000, "step": 1},
        "random": {"seed": 42},
    }, indent=2), encoding="utf-8")

    # ---- sandbox manifest (scorer view; never inside agent/) -------------
    (box / "sandbox.json").write_text(json.dumps({
        "subject_id": sid,
        "agent_handle": handle,
        "project": sub["project"],
        "module": sub["module"],
        "commit": sub.get("commit"),
        "entry": entry_name,
        "agent_dir": "agent",
        "oracle_dir": "oracle",
        "runtime": runtime,
        "domain": sub.get("domain"),
        "dependencies": {"required": deps, "linked": sorted(set(linked)),
                         "unresolved": sorted(set(unresolved))},
        "oracle": {**oracle, "entry": oracle_entry},
        "metrics": sub.get("metrics"),
        "coverage": sub.get("coverage"),
        "browser": {"url": "https://sandbox.local/",
                    "html": "<!doctype html><html><body></body></html>"}
                   if runtime == "browser" else None,
    }, indent=2, ensure_ascii=False), encoding="utf-8")

    # Enforce isolation here, not only in the validator. A sandbox that leaks
    # ground truth is not a usable sandbox, and discovering that later means
    # every measurement taken in between was invalid.
    violations = check_isolation(box, json.loads(
        (box / "sandbox.json").read_text(encoding="utf-8")))
    if violations:
        shutil.rmtree(box, ignore_errors=True)
        return {"subject_id": sid, "ok": False, "reason": "isolation_violated",
                "violations": violations[:5]}

    return {"subject_id": sid, "ok": True, "path": str(box.relative_to(ROOT)),
            "runtime": runtime, "deps_required": len(deps),
            "deps_unresolved": len(unresolved), "oracle": oracle["available"]}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--only", type=str, default="")
    ap.add_argument("--jobs", type=int, default=8)
    args = ap.parse_args()

    manifest = [json.loads(l) for l in
                open(CORPUS / "manifest.jsonl", encoding="utf-8") if l.strip()]
    if args.only:
        manifest = [s for s in manifest if args.only in s["subject_id"]]
    if args.limit:
        manifest = manifest[:args.limit]

    OUT.mkdir(parents=True, exist_ok=True)
    STATS.mkdir(parents=True, exist_ok=True)
    print(f"building {len(manifest)} sandboxes into {OUT.relative_to(ROOT)}/")

    results = []
    with ThreadPoolExecutor(max_workers=args.jobs) as pool:
        futs = {pool.submit(build_one, s): s for s in manifest}
        for fut in as_completed(futs):
            try:
                results.append(fut.result())
            except Exception as exc:  # noqa: BLE001
                results.append({"subject_id": futs[fut]["subject_id"],
                                "ok": False, "reason": f"builder_error:{exc}"})

    ok = [r for r in results if r.get("ok")]
    bad = [r for r in results if not r.get("ok")]
    by_rt = {}
    for r in ok:
        by_rt[r["runtime"]] = by_rt.get(r["runtime"], 0) + 1

    with open(STATS / "sandboxes.json", "w", encoding="utf-8") as fh:
        json.dump({"built": len(ok), "failed": len(bad), "by_runtime": by_rt,
                   "results": sorted(results, key=lambda r: r["subject_id"])},
                  fh, indent=2, ensure_ascii=False)

    leaked = [r for r in bad if r.get("reason") == "isolation_violated"]
    if leaked:
        print(f"REJECTED {len(leaked)} sandbox(es) for leaking ground truth:")
        for r in leaked[:5]:
            print(f"  {r['subject_id']}: {r['violations']}")
    print(f"built {len(ok)}, failed {len(bad)}")
    print(f"  by runtime: {by_rt}")
    print(f"  with oracle: {sum(1 for r in ok if r['oracle'])}")
    unres = [r for r in ok if r["deps_unresolved"]]
    if unres:
        print(f"  with unresolved dependencies: {len(unres)}")
    for r in bad[:5]:
        print(f"  FAIL {r['subject_id']}: {r.get('reason')}")


if __name__ == "__main__":
    main()
