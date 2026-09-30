#!/usr/bin/env python3
"""Recompute simplification on existing scores.jsonl (syntax/execution untouched).

Usage:
    python3 rescore_simplification.py --results path/to/scores.jsonl
"""
import argparse
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from evallib import corpus, schema  # noqa: E402
from metrics import simplification  # noqa: E402

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
DEFAULT_BUILDS = [
    ROOT / "samples" / "diverse6" / "builds.jsonl",
]
DEFAULT_CORPUS = ROOT / "samples" / "diverse6" / "corpus"
DEFAULT_MANIFEST = DEFAULT_CORPUS / "manifest.jsonl"


def load_builds(paths):
    out = {}
    for path in paths:
        if not path.exists():
            continue
        out.update(schema.load_builds(path))
    return out


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--results", nargs="+", required=True,
                        help="scores.jsonl files to rewrite")
    parser.add_argument("--builds", action="append", default=[],
                        help="extra builds.jsonl (repeatable)")
    parser.add_argument("--manifest", default=str(DEFAULT_MANIFEST),
                        help="corpus manifest used to resolve original bundles")
    parser.add_argument("--corpus-root", default=str(DEFAULT_CORPUS),
                        help="root for bundle_path entries in the manifest")
    args = parser.parse_args()

    os.environ["ADB_CORPUS"] = str(Path(args.corpus_root).expanduser().resolve())
    cfg = corpus.load_config()
    subjects = dict(
        (s.id, s) for s in corpus.load_manifest(path=args.manifest)
    )
    build_paths = list(DEFAULT_BUILDS)
    build_paths.extend(Path(p) for p in args.builds)
    builds = load_builds(build_paths)

    score_files = [Path(p) for p in args.results]

    print("builds loaded: %d" % len(builds))
    for score_path in score_files:
        n, missing = rescore_file(score_path, subjects, builds, cfg["simplification"])
        print("%s  updated=%d  skipped=%d" % (score_path, n, missing))
    return 0


def rescore_file(score_path, subjects, builds, cfg):
    rows = corpus.read_jsonl(score_path)
    updated = 0
    skipped = 0
    out = []
    for row in rows:
        try:
            row["simplification"] = rescore_row(row, score_path, subjects, builds, cfg)
            updated += 1
        except Exception as exc:  # noqa: BLE001
            skipped += 1
            row.setdefault("note", None)
            print("  skip %s: %s: %s" % (row.get("prediction_id"),
                                         type(exc).__name__, exc),
                  file=sys.stderr)
        out.append(row)
    tmp = score_path.with_suffix(".jsonl.tmp")
    corpus.write_jsonl(tmp, out)
    tmp.replace(score_path)
    return updated, skipped


def rescore_row(row, score_path, subjects, builds, cfg):
    subject = subjects.get(row["subject_id"])
    if subject is None:
        raise KeyError("subject not in manifest")
    build = builds.get(row.get("build_id"))
    candidate = _candidate_code(row, score_path)
    original = subject.bundle.read_text(encoding="utf-8", errors="replace")
    obfuscated = build.code() if build is not None else None
    parses = (row.get("syntax") or {}).get("parses")
    return simplification.evaluate(candidate, obfuscated, original, cfg,
                                   parses=parses)


def _candidate_code(row, score_path):
    """Prefer the scored run's output file; fall back to inline code."""
    pred_file = score_path.parent / "predictions.jsonl"
    if pred_file.exists():
        for pred in corpus.read_jsonl(pred_file):
            if pred.get("prediction_id") != row.get("prediction_id"):
                continue
            if pred.get("code") is not None:
                return pred["code"]
            path = pred.get("path")
            if path:
                full = (pred_file.parent / path).resolve()
                if full.exists():
                    return full.read_text(encoding="utf-8", errors="replace")
            return None
    return None


if __name__ == "__main__":
    sys.exit(main())
