#!/usr/bin/env python3
"""Score returned programs against the AgentDeobfBench evaluators (paper §3.2).

Every evaluated system — static prompting, the controlled agent ladder, a
shipped agent, a traditional deobfuscator — returns one JavaScript program and is
scored here by the same evaluators, which is what makes a difference between two
conditions attributable to the manipulated factor rather than to the scoring.

Usage:
    python3 score.py --predictions runs/gpt-x-L2/predictions.jsonl \\
                     --builds builds/builds.jsonl \\
                     --out results/gpt-x-L2.jsonl [--jobs 4]

    python3 score.py --repair          # restore modules left by a crashed run
    python3 score.py --verify-clean    # check the checkouts are untouched

Scoring is resumable: predictions already present in the output file are skipped
unless --rescore is given.
"""
import argparse
import json
import os
import sys
import tempfile
import traceback
from contextlib import contextmanager
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from evallib import corpus, schema  # noqa: E402
from metrics import execution, similarity, simplification, syntax  # noqa: E402


def score_one(prediction, subject, build, cfg, skip_execution=False,
              skip_similarity=False,
              refresh_reference=False, keep=False):
    """Apply every evaluator to one prediction."""
    candidate_code = prediction.code()
    reference_code = subject.bundle.read_text(encoding="utf-8", errors="replace")
    obfuscated_code = build.code() if build is not None else None

    syntax_score = syntax.evaluate(candidate_code, reference_code, cfg["syntax"])
    similarity_score = ({} if skip_similarity else
                        similarity.evaluate(candidate_code, reference_code,
                                            cfg["similarity"],
                                            parse_status=syntax_score["parses"]))
    simplification_score = simplification.evaluate(candidate_code, obfuscated_code,
                                                   reference_code,
                                                   cfg["simplification"])

    status = schema.STATUS_OK
    execution_score = None
    note = None

    # Establish eligibility before candidate parsing or missing-output failures.
    # Otherwise a malformed candidate silently turns an invalid reference into
    # a scored zero and changes the denominator across systems.
    reference_detail = None
    if not skip_execution and cfg["execution"].get("primary", "full_suite") == "full_suite":
        if subject.is_runnable() and subject.view is not None:
            mountable, _ = subject.view.mountable()
            if mountable:
                ref = execution.reference_run(subject, subject.view, cfg["execution"],
                                              refresh=refresh_reference, keep=keep)
                reference_detail = {"exit_code_reference": ref.get("exit_code"),
                                    "tests_reference": execution._test_counts(ref),
                                    "reference_timed_out": ref.get("timed_out", False),
                                    "reference_workload_consistent": ref.get("workload_repeat_green", True)}
        eligible = reference_detail is not None and execution.full_suite_score(
            reference_detail["exit_code_reference"], reference_detail["tests_reference"],
            None, None, reference_timed_out=reference_detail["reference_timed_out"],
            reference_consistent=reference_detail["reference_workload_consistent"]) is not None
        if not eligible:
            status = schema.STATUS_UNSUPPORTED
            note = "reference did not pass a nonempty test workload"
            execution_score = dict(reference_detail or {}, score=None, reason=note,
                                   reference_eligible=False,
                                   reported_test_pass_fraction=None,
                                   score_policy=execution.EXECUTION_POLICY)

    if execution_score is not None:
        pass
    elif skip_execution:
        note = "execution skipped (--no-execution)"
    elif candidate_code is None:
        status = schema.STATUS_OK
        note = "the system returned no program"
        execution_score = {"score": 0.0, "reason": note}
    elif not subject.is_runnable():
        status = schema.STATUS_UNSUPPORTED
        note = subject.unrunnable_reason()
    elif not syntax_score["parses"]:
        # A program that does not parse cannot be substituted for the module, so
        # the run would only measure the shim failing to load. Scored zero
        # directly, which is the same outcome at a fraction of the cost.
        execution_score = {"score": 0.0, "reason": "the returned program does not parse"}
    else:
        with _on_disk(prediction) as candidate_path:
            # The build's rung reaches the execution evaluator because an
            # `anti`/`full` build's self-defending code targets the harness
            # itself; without it a defence firing is indistinguishable from a
            # system that returned something broken.
            status, execution_score = execution.evaluate(
                subject, candidate_path, cfg["execution"],
                refresh_reference=refresh_reference, keep=keep,
                config_id=build.config_id if build is not None else None)

    if execution_score is not None and reference_detail is not None:
        for key, value in reference_detail.items():
            execution_score.setdefault(key, value)
        execution_score.setdefault("score_policy", execution.EXECUTION_POLICY)
        execution_score.setdefault("reference_eligible", execution_score.get("score") is not None)
        counts = reference_detail.get("tests_reference")
        execution_score.setdefault("reference_test_count", counts.get("passed") if isinstance(counts, dict) else None)
        execution_score.setdefault("reported_test_pass_fraction",
                                   0.0 if execution_score["reference_eligible"] else None)

    return schema.score_record(
        prediction, status=status, syntax=syntax_score, execution=execution_score,
        simplification=simplification_score, similarity=similarity_score,
        identifier=None, note=note, build=build)


@contextmanager
def _on_disk(prediction):
    """The prediction as a file esbuild can read.

    A prediction may carry its program inline instead of as a path; that form is
    written to a temporary file for the duration of the run and removed after,
    so a long scoring session does not accumulate one file per prediction.
    """
    if prediction.path:
        yield prediction.path
        return
    handle = tempfile.NamedTemporaryFile("w", suffix=".js", delete=False,
                                         encoding="utf-8")
    handle.write(prediction.code() or "")
    handle.close()
    try:
        yield Path(handle.name)
    finally:
        try:
            os.unlink(handle.name)
        except OSError:
            pass


def main():
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--predictions", help="predictions.jsonl to score")
    parser.add_argument("--builds", help="builds.jsonl describing the obfuscated inputs")
    parser.add_argument("--out", default="results/scores.jsonl",
                        help="where scores are written (default: results/scores.jsonl)")
    parser.add_argument("--manifest", help="override the corpus manifest path")
    parser.add_argument("--jobs", type=int, default=1,
                        help="parallel predictions; runs of one project are serialised regardless")
    parser.add_argument("--limit", type=int, help="score at most this many predictions")
    parser.add_argument("--rescore", action="store_true",
                        help="re-score predictions already present in --out")
    parser.add_argument("--no-execution", action="store_true",
                        help="static evaluators only; no project checkout needed")
    parser.add_argument("--no-similarity", action="store_true",
                        help="defer similarity scoring for a separate batch")
    parser.add_argument("--refresh-reference", action="store_true",
                        help="re-run the cached reference execution for each subject")
    parser.add_argument("--keep", action="store_true",
                        help="leave generated harness files in place for debugging")
    parser.add_argument("--repair", action="store_true",
                        help="restore any subject module left substituted by a crashed run")
    parser.add_argument("--verify-clean", action="store_true",
                        help="report any outstanding substitution or generated file")
    args = parser.parse_args()

    if (not args.no_similarity and not (args.repair or args.verify_clean)
            and os.environ.get("PYTHONHASHSEED") != "0"):
        parser.error("set PYTHONHASHSEED=0 for deterministic CodeBLEU-R data-flow scores")

    cfg = corpus.load_config()
    subjects = dict((s.id, s) for s in corpus.load_manifest(path=args.manifest))

    if args.repair or args.verify_clean:
        if args.repair:
            report = execution.repair()
            for row in report:
                print("undid %s: %s" % (row["slot"], "ok" if row["restored"]
                                        else row.get("error", "FAILED")))
            if not report:
                print("nothing to repair")
        problems = execution.verify_clean()
        for problem in problems:
            print("PROBLEM %s" % json.dumps(problem, ensure_ascii=False))
        print("sandboxes clean" if not problems else "%d problem(s)" % len(problems))
        return 0 if not problems else 1

    if not args.predictions:
        parser.error("--predictions is required (or use --repair / --verify-clean)")

    builds = schema.load_builds(args.builds) if args.builds else {}
    predictions = schema.load_predictions(args.predictions)

    out_path = Path(args.out)
    done = set()
    if out_path.exists() and not args.rescore:
        done = set(r.get("prediction_id") for r in corpus.read_jsonl(out_path))
    todo = [p for p in predictions if p.id not in done]
    if args.limit:
        todo = todo[:args.limit]

    print("%d prediction(s): %d to score, %d already in %s"
          % (len(predictions), len(todo), len(predictions) - len(todo), out_path))

    def work(prediction):
        subject = subjects.get(prediction.subject_id)
        if subject is None:
            return schema.score_record(
                prediction, status=schema.STATUS_ERROR,
                note="subject %r is not in the manifest" % prediction.subject_id,
                build=builds.get(prediction.build_id))
        try:
            return score_one(prediction, subject, builds.get(prediction.build_id),
                             cfg, skip_execution=args.no_execution,
                             skip_similarity=args.no_similarity,
                             refresh_reference=args.refresh_reference, keep=args.keep)
        except Exception as exc:  # noqa: BLE001 — one bad prediction must not stop the run
            return schema.score_record(
                prediction, status=schema.STATUS_ERROR,
                note="%s: %s" % (type(exc).__name__, exc),
                build=builds.get(prediction.build_id))

    written = 0
    if args.jobs > 1:
        with ThreadPoolExecutor(max_workers=args.jobs) as pool:
            futures = dict((pool.submit(work, p), p) for p in todo)
            for future in as_completed(futures):
                record = future.result()
                corpus.append_jsonl(out_path, record)
                written += 1
                _progress(record, written, len(todo))
    else:
        for prediction in todo:
            record = work(prediction)
            corpus.append_jsonl(out_path, record)
            written += 1
            _progress(record, written, len(todo))

    print("wrote %d score(s) to %s" % (written, out_path))
    return 0


def _progress(record, done, total):
    execution_score = (record.get("execution") or {}).get("score")
    print("[%d/%d] %s  status=%s syntax=%s exec=%s sim=%s"
          % (done, total, record["prediction_id"], record["status"],
             (record.get("syntax") or {}).get("score"),
             "-" if execution_score is None else round(execution_score, 3),
             (record.get("similarity") or {}).get("codebleu")))


if __name__ == "__main__":
    if os.environ.get("PYTHONHASHSEED") != "0":
        os.execvpe(sys.executable, [sys.executable, *sys.argv],
                   {**os.environ, "PYTHONHASHSEED": "0"})
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print("\ninterrupted — run `score.py --verify-clean` before the next run",
              file=sys.stderr)
        sys.exit(130)
    except Exception:  # noqa: BLE001
        traceback.print_exc()
        sys.exit(1)
