#!/usr/bin/env python3
"""Validate the evaluators against the corpus, before any system is scored.

Every subject's own reference bundle is submitted as if it were a returned
program. The expected result is a perfect score on every evaluator, so any
shortfall is a defect in the harness rather than a property of a system:

    syntax                   1
    similarity.codebleu3     1.0
    execution.behaviour_match 1.0

The other output is one the paper needs regardless: how far the execution oracle
reaches across the corpus. Three numbers come out of it — how many subjects it
can measure at all, how many have a green reference suite (the bundle inlines
first-party modules, which breaks anything the tests compare by identity), and
how many have a reproducible call order. All three are properties of the corpus
and the runtime, and reporting them is what keeps them from being charged to the
systems under evaluation.

Usage:
    python3 selfcheck.py [--limit N] [--jobs 2] [--subject ID] [--no-execution]
"""
import argparse
import json
import sys
from collections import Counter
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from evallib import corpus, schema  # noqa: E402
from metrics import execution, similarity, syntax  # noqa: E402


def check(subject, cfg, skip_execution=False, refresh=False, oracle_usable=()):
    code = subject.bundle.read_text(encoding="utf-8", errors="replace")
    row = {"subject_id": subject.id, "runner": subject.get("test_runner"),
           "platform": subject.platform, "module_format": subject.module_format,
           # The sandbox's own gate, recorded alongside this harness's. They ask
           # different questions — "did the suite start?" versus "did the module
           # produce a trace?" — and neither contains the other, so an analysis
           # that reports one as if it were the other is reporting a number that
           # does not exist.
           "oracle_usable": subject.id in oracle_usable}

    syntax_score = syntax.evaluate(code, code, cfg["syntax"])
    row["syntax"] = syntax_score["score"]
    row["exports"] = syntax_score["exports_declared"]

    similarity_score = similarity.evaluate(code, code, cfg["similarity"])
    row["similarity"] = similarity_score["codebleu3"]

    if skip_execution:
        row["status"] = "skipped"
        return row

    try:
        row["flavour"] = execution.module_flavour(subject)
        status, detail = execution.evaluate(subject, subject.bundle, cfg["execution"],
                                            refresh_reference=refresh)
    except Exception as exc:  # noqa: BLE001
        row["status"] = schema.STATUS_ERROR
        row["reason"] = "%s: %s" % (type(exc).__name__, exc)
        return row

    row["status"] = status
    row["box"] = subject.view.name if subject.view else None
    row["behaviour_match"] = detail.get("behaviour_match")
    row["comparison_mode"] = detail.get("comparison_mode")
    row["suite_green"] = detail.get("reference_suite_green")
    row["trace_match"] = detail.get("trace_match")
    row["events"] = detail.get("reference_events")
    row["host_events"] = detail.get("reference_host_events")
    row["exit_ref"] = detail.get("exit_code_reference")
    row["exit_cand"] = detail.get("exit_code_candidate")
    if detail.get("reason"):
        row["reason"] = detail["reason"]
    if detail.get("first_divergence"):
        row["first_divergence"] = detail["first_divergence"].get("index")
    return row


def main():
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--limit", type=int)
    parser.add_argument("--jobs", type=int, default=1)
    parser.add_argument("--subject", action="append",
                        help="check only these subject ids (repeatable)")
    parser.add_argument("--no-execution", action="store_true")
    parser.add_argument("--refresh-reference", action="store_true")
    parser.add_argument("--out", default="results/selfcheck.jsonl")
    args = parser.parse_args()

    cfg = corpus.load_config()
    subjects = corpus.load_manifest()
    if args.subject:
        wanted = set(args.subject)
        subjects = [s for s in subjects if s.id in wanted]
    if args.limit:
        subjects = subjects[:args.limit]

    usable = corpus.oracle_usable_set()
    print("self-checking %d subject(s)" % len(subjects))
    rows = []
    if args.jobs > 1:
        with ThreadPoolExecutor(max_workers=args.jobs) as pool:
            futures = [pool.submit(check, s, cfg, args.no_execution,
                                   args.refresh_reference, usable) for s in subjects]
            for future in as_completed(futures):
                rows.append(future.result())
                _line(rows[-1], len(rows), len(subjects))
    else:
        for subject in subjects:
            rows.append(check(subject, cfg, args.no_execution,
                              args.refresh_reference, usable))
            _line(rows[-1], len(rows), len(subjects))

    corpus.write_jsonl(args.out, rows)
    _summary(rows, args.out)
    # A harness defect is a failure; an unsupported subject is a finding.
    broken = [r for r in rows
              if r.get("syntax") != 1
              or (r.get("similarity") or 0) < 0.999
              or (r.get("status") in (schema.STATUS_OK, schema.STATUS_DEGRADED)
                  and r.get("behaviour_match") is not None
                  and r.get("behaviour_match") != 1.0)
              or r.get("status") == schema.STATUS_ERROR]
    return 1 if broken else 0


def _line(row, done, total):
    print("[%d/%d] %-56s syntax=%s sim=%.3f %-11s behaviour=%-8s events=%-5s green=%s"
          % (done, total, row["subject_id"][-56:], row.get("syntax"),
             row.get("similarity") or 0.0, row.get("status"),
             row.get("behaviour_match"), row.get("events"), row.get("suite_green")))


def _summary(rows, out):
    statuses = Counter(r.get("status") for r in rows)
    supported = [r for r in rows if r.get("status") == schema.STATUS_OK]
    degraded = [r for r in rows if r.get("status") == schema.STATUS_DEGRADED]
    unsupported = [r for r in rows if r.get("status") == schema.STATUS_UNSUPPORTED]

    print("\n=== self-check summary ===")
    print("subjects                 %d" % len(rows))
    print("syntax == 1              %d" % sum(1 for r in rows if r.get("syntax") == 1))
    print("similarity == 1.0        %d" % sum(1 for r in rows if (r.get("similarity") or 0) >= 0.999))
    print("status                   %s" % json.dumps(dict(statuses)))
    traced = [r for r in rows if r.get("behaviour_match") is not None]
    print("behaviour_match == 1.0   %d of %d traced subjects"
          % (sum(1 for r in traced if r.get("behaviour_match") == 1.0), len(traced)))
    print("reference suite green    %d of %d measurable subjects"
          % (sum(1 for r in rows if r.get("suite_green")), len(supported) + len(degraded)))

    # Two gates, neither containing the other, both of which have to be reported
    # for the population an execution number is defined on to be legible: the
    # sandbox asks whether the suite started, this harness asks whether the
    # module produced a trace.
    measurable = set(r["subject_id"] for r in supported + degraded)
    sandbox_usable = set(r["subject_id"] for r in rows if r.get("oracle_usable"))
    print("sandbox oracle_usable    %d" % len(sandbox_usable))
    print("  both gates             %d" % len(measurable & sandbox_usable))
    print("  this harness only      %d" % len(measurable - sandbox_usable))
    print("  sandbox only           %d" % len(sandbox_usable - measurable))
    multiset = [r for r in rows if r.get("comparison_mode") == "multiset"]
    if multiset:
        print("call order not reproducible (scored on event overlap):")
        for row in multiset:
            print("    %s (%s)" % (row["subject_id"], row.get("runner")))
    no_trace = [r for r in degraded if r.get("comparison_mode") != "multiset"]
    if no_trace:
        print("degraded (no traced calls, scored on suite agreement):")
        for row in no_trace:
            print("    %s (%s)" % (row["subject_id"], row.get("runner")))
    if unsupported:
        print("unsupported by the execution oracle:")
        for row in unsupported:
            print("    %s (%s): %s" % (row["subject_id"], row.get("runner"),
                                       (row.get("reason") or "")[:120]))
    print("rows written to %s" % out)


if __name__ == "__main__":
    sys.exit(main())
