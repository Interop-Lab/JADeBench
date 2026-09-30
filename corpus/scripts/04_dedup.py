#!/usr/bin/env python3
"""Stage 4 — Deduplication.

Removes near-duplicate subjects so that a widely copied utility does not
dominate the measured effect. Shingles are taken over a *normalized* token
stream, with identifier names and literals replaced by placeholders, so that
a copy that was renamed on adoption is still recognized as a duplicate.

Comparison is on the **root module source**, not on the bundle. Two subjects
from one project routinely inline the same first-party utilities, which makes
their bundles look almost identical while their root modules are unrelated —
comparing bundles reported 93% similarity between modules that share nothing
but their dependencies. A subject's identity is its root module; the inlined
code is context.

Within a duplicate pair we keep the lower-star project, which lowers the
corpus's overall exposure to pre-training contamination.

Usage:
    python3 scripts/04_dedup.py
"""
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from lib import RAW, WORK, Attrition, load_config, log, read_jsonl, write_jsonl

STAGE = "04_dedup"

TOKEN_RE = re.compile(r"""
    (?P<str>"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)
  | (?P<num>\b\d+(?:\.\d+)?\b)
  | (?P<name>[A-Za-z_$][\w$]*)
  | (?P<op>[^\s\w$])
""", re.VERBOSE)

KEYWORDS = {
    "var", "let", "const", "function", "return", "if", "else", "for", "while",
    "new", "typeof", "this", "class", "extends", "import", "export", "from",
    "async", "await", "try", "catch", "finally", "throw", "switch", "case",
    "default", "break", "continue", "do", "in", "of", "delete", "void",
    "instanceof", "yield", "static", "get", "set", "null", "true", "false",
    "undefined",
}


def normalize(code):
    """Token stream with names and literals erased, so renaming defeats nothing."""
    code = re.sub(r"//.*?$|/\*.*?\*/", " ", code, flags=re.S | re.M)
    out = []
    for m in TOKEN_RE.finditer(code):
        if m.lastgroup == "str":
            out.append("STR")
        elif m.lastgroup == "num":
            out.append("NUM")
        elif m.lastgroup == "name":
            out.append(m.group() if m.group() in KEYWORDS else "ID")
        else:
            out.append(m.group())
    return out


def shingles(tokens, k):
    return {hash(tuple(tokens[i:i + k])) for i in range(max(0, len(tokens) - k + 1))}


def jaccard(a, b):
    if not a or not b:
        return 0.0
    inter = len(a & b)
    return inter / (len(a) + len(b) - inter)


def main():
    cfg = load_config("thresholds.json")["dedup"]
    subs = read_jsonl(RAW / "subjects_screened.jsonl")
    if not subs:
        log(STAGE, "no screened subjects — run 03_extract_subjects.py first")
        return

    att = Attrition(STAGE)
    sigs = {}
    for s in subs:
        p = WORK / s["project"].replace("/", "__") / s["module"]
        try:
            code = p.read_text(encoding="utf-8", errors="ignore")
        except OSError:
            att.drop(s["subject_id"], "root_module_missing", str(p))
            continue
        sigs[s["subject_id"]] = shingles(normalize(code), cfg["ngram_size"])

    subs = [s for s in subs if s["subject_id"] in sigs]
    # Compare in descending star order so the survivor of a pair is the
    # lower-star (less exposed) project, per keep_policy.
    subs.sort(key=lambda s: (-(s.get("stars") or 0), s["subject_id"]))

    dropped, kept = set(), []
    thr = cfg["jaccard_threshold"]
    for i, s in enumerate(subs):
        if s["subject_id"] in dropped:
            continue
        for t in subs[i + 1:]:
            if t["subject_id"] in dropped:
                continue
            j = jaccard(sigs[s["subject_id"]], sigs[t["subject_id"]])
            if j >= thr:
                # s has >= stars than t, so drop s and keep t
                dropped.add(s["subject_id"])
                att.drop(s["subject_id"], "near_duplicate",
                         f"jaccard={j:.3f} with {t['subject_id']}")
                break
        if s["subject_id"] not in dropped:
            kept.append(s)

    write_jsonl(RAW / "subjects_deduped.jsonl", kept)
    att.save()
    log(STAGE, f"{len(kept)} subjects kept, {len(dropped)} near-duplicates removed")


if __name__ == "__main__":
    main()
