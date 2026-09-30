"""The isolation property, and its check.

Kept in one module because two callers must agree on it: the builder enforces
it when a sandbox is created, and the validator re-checks it afterwards. A
property defined in only one of those places is a property that holds only
when someone remembers to look.

The agent view may contain the subject, its harness, its dependencies, and
nothing else. Anything more — a test file, a stray copy of project source, a
metadata field naming the original — hands the agent identifiers it is
supposed to recover.
"""
import json
import re

TEST_FILE_RE = re.compile(r"(\.|-)(test|spec)\.[cm]?jsx?$"
                          r"|(^|/)(__tests__|tests?|spec)/")
ASSERTION_RE = re.compile(r"\b(describe|it\s*\(|expect\s*\(|assert\.|"
                          r"toEqual|toBe\b|chai|should\.)")
# Naming the project, the module, or the reference outcome is enough to leak.
FORBIDDEN_META = ("subject_id", "module", "project", "oracle",
                  "coverage", "metrics", "commit", "domain")


def check_isolation(box, meta):
    """Return a list of isolation violations; empty means the sandbox is clean."""
    agent = box / meta.get("agent_dir", "agent")
    findings = []
    if not agent.is_dir():
        return ["agent_view_missing"]

    entry = meta["entry"]
    allowed = {entry, "package.json", "sandbox.json", "cassette.json"}
    for f in agent.rglob("*"):
        if not f.is_file() or "node_modules" in f.parts:
            continue
        rel = f.relative_to(agent).as_posix()
        if rel in allowed or rel.startswith("harness/"):
            continue
        if TEST_FILE_RE.search(rel):
            findings.append(f"test_file_in_agent_view:{rel}")
            continue
        if f.suffix in (".js", ".mjs", ".cjs", ".jsx", ".ts"):
            try:
                text = f.read_text(encoding="utf-8", errors="ignore")
            except OSError:
                continue
            findings.append(
                (f"assertions_in_agent_view:{rel}" if ASSERTION_RE.search(text)
                 else f"unexpected_source_in_agent_view:{rel}"))

    aj = agent / "sandbox.json"
    if aj.exists():
        try:
            am = json.loads(aj.read_text(encoding="utf-8"))
        except ValueError:
            findings.append("agent_metadata_unreadable")
        else:
            findings += [f"metadata_leak:{k}" for k in FORBIDDEN_META if k in am]

    oracle = (box / meta.get("oracle_dir", "oracle")).resolve()
    for f in agent.rglob("*"):
        if f.is_symlink():
            try:
                if str(f.resolve()).startswith(str(oracle)):
                    findings.append(f"symlink_into_oracle:{f.relative_to(agent)}")
            except OSError:
                continue
    return findings
