#!/usr/bin/env python3
"""Behavioural tests for the differential execution evaluator.

The static evaluators cannot tell a behaviour-preserving rewrite from a subtly
broken one — tests/test_metrics.py ends by demonstrating exactly that. These
tests check that the execution evaluator can, which is the claim that makes it
the primary measure:

    1. the reference bundle scores 1.0 against itself
    2. a semantics-preserving obfuscation of it also scores 1.0
    3. a one-line behaviour change is caught, with the diverging call named
    4. a program that cannot be loaded scores 0 rather than crashing the run

Case 2 needs `javascript-obfuscator` on PATH and is skipped if it is missing.

Usage:
    python3 tests/test_execution.py
"""
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from evallib import corpus, schema  # noqa: E402
from metrics import execution  # noqa: E402

SUBJECT_ID = "websockets__ws::lib/extension.js"
FAILURES = []


def check(name, condition, detail=""):
    if condition:
        print("  ok   %s" % name)
    else:
        print("  FAIL %s %s" % (name, detail))
        FAILURES.append(name)


def write_temp(code, suffix=".js"):
    handle = tempfile.NamedTemporaryFile("w", suffix=suffix, delete=False,
                                         encoding="utf-8")
    handle.write(code)
    handle.close()
    return Path(handle.name)


def mutate_behaviour(code):
    """Change what the module returns without changing what it looks like.

    `format` keeps its name, arity, and structure, and the program still parses
    and still exports the same surface; only the value coming back differs. That
    is the case the primary measure has to catch and the static evaluators
    cannot.

    Appended rather than substituted into the bundle's tail. The tail is not
    stable: this test used to splice a literal `export default
    require_extension();`, which stopped existing the moment bundles began
    following the project's own module system, and the test then failed on its
    own assertion instead of testing anything.
    """
    wrapper = (
        "\n// --- test mutation: wrap `format` so its return value differs ---\n"
        "(function () {\n"
        "  var __adb_target = (typeof module !== 'undefined' && module.exports) || undefined;\n"
        "  if (!__adb_target || typeof __adb_target.format !== 'function') {\n"
        "    throw new Error('mutation target not found: the bundle does not export `format`');\n"
        "  }\n"
        "  var __adb_real = __adb_target.format;\n"
        "  __adb_target.format = function (extensions) {\n"
        "    return String(__adb_real.apply(this, arguments)).toUpperCase();\n"
        "  };\n"
        "})();\n")
    return code + wrapper


def obfuscate(source, dest):
    binary = shutil.which("javascript-obfuscator")
    if not binary:
        return False, "javascript-obfuscator not on PATH"
    proc = subprocess.run(
        [binary, str(source), "--output", str(dest), "--compact", "true",
         "--string-array", "true", "--string-array-threshold", "1",
         "--identifier-names-generator", "hexadecimal", "--seed", "42"],
        capture_output=True, text=True, timeout=300)
    if proc.returncode != 0 or not Path(dest).exists():
        return False, (proc.stderr or proc.stdout)[:400]
    return True, ""


class _FakeView(object):
    runner = "node:test"


def check_defense_classification():
    """An anti-rung defence is a hang, and only a hang.

    This runs before the corpus gate because it needs no checkout, and because
    the failure it guards against is the expensive kind: excusing a system that
    simply answered badly. The `empty` oracle returns `export default {}`,
    carries no self-defending code, and exits with code 1 in under a second —
    an earlier version of `_defense_signal` excused it on the `anti` rung
    because it produced no events, which would have let any system escape a zero
    on the hardest rungs by returning nothing.
    """
    print("\n0. anti-rung defence classification (no checkout needed)")
    reference = {"exit_code": 0, "events": [{"kind": "call"}]}
    hung = {"timed_out": True, "events": [], "exit_code": None}
    failed_fast = {"timed_out": False, "events": [], "exit_code": 1}
    diverged = {"timed_out": False, "events": [{"kind": "call"}], "exit_code": 1}

    view = _FakeView()
    hit = execution._defense_signal(reference, hung, True, "anti", view)
    check("a hang on an anti rung is a defence", hit is not None)
    check("and it is scored null, not zero", hit is not None and hit["score"] is None)
    check("an empty answer that exits is NOT excused",
          execution._defense_signal(reference, failed_fast, True, "anti", view) is None)
    check("a divergent answer that exits is NOT excused",
          execution._defense_signal(reference, diverged, True, "anti", view) is None)
    check("a hang on a non-anti rung is not a defence",
          execution._defense_signal(reference, hung, False, "default", view) is None)


def main():
    cfg = corpus.load_config()["execution"]
    check_defense_classification()

    subjects = dict((s.id, s) for s in corpus.load_manifest())
    subject = subjects.get(SUBJECT_ID)
    if subject is None or not subject.is_runnable():
        print("subject %s is not available in this checkout — nothing else to test"
              % SUBJECT_ID)
        return 1 if FAILURES else 0

    bundle = subject.bundle.read_text(encoding="utf-8")
    print("subject: %s (%s)" % (subject.id, subject.get("test_runner")))

    print("\n1. the reference bundle against itself")
    status, detail = execution.evaluate(subject, subject.bundle, cfg)
    check("status is ok", status == schema.STATUS_OK, status)
    check("trace_match == 1.0", detail.get("trace_match") == 1.0, detail.get("trace_match"))
    check("no divergence", detail.get("first_divergence") is None)
    check("the trace is not empty", (detail.get("reference_events") or 0) > 0,
          detail.get("reference_events"))
    check("exit codes agree", detail.get("exit_code_match") is True)

    print("\n2. a semantics-preserving obfuscation of it")
    # The CLI insists on a `.js` input, and the bundle is now `.cjs`/`.mjs`, so
    # it is copied to a `.js` temp first. Without this the step silently
    # degraded to "skip" and the property it checks — that obfuscation alone
    # scores 1.0 — stopped being verified.
    source = write_temp(bundle)
    obfuscated = write_temp("")
    ok, reason = obfuscate(source, obfuscated)
    if not ok:
        print("  skip  %s" % reason)
    else:
        status, detail = execution.evaluate(subject, obfuscated, cfg)
        check("status is ok", status == schema.STATUS_OK, status)
        check("trace_match == 1.0 (behaviour is preserved)",
              detail.get("trace_match") == 1.0,
              (detail.get("trace_match"), detail.get("first_divergence")))
    os.unlink(str(obfuscated))
    os.unlink(str(source))

    print("\n3. a one-line behaviour change")
    mutated = write_temp(mutate_behaviour(bundle))
    status, detail = execution.evaluate(subject, mutated, cfg)
    check("still runs (status ok)", status == schema.STATUS_OK, status)
    check("trace_match < 1.0", (detail.get("trace_match") or 0) < 1.0,
          detail.get("trace_match"))
    divergence = detail.get("first_divergence") or {}
    reference_event = divergence.get("reference") or {}
    check("divergence is reported", bool(divergence))
    check("it names the changed export", reference_event.get("name") == "format",
          reference_event.get("name"))
    check("the suites disagree too", detail.get("exit_code_match") is False,
          (detail.get("exit_code_reference"), detail.get("exit_code_candidate")))
    os.unlink(str(mutated))

    print("\n4. a program that cannot be loaded")
    broken = write_temp("export default (((;")
    status, detail = execution.evaluate(subject, broken, cfg)
    check("scored, not crashed", detail.get("score") == 0.0, detail)
    check("the reason is recorded", bool(detail.get("reason")))
    os.unlink(str(broken))

    print("\n5. the checkout is left exactly as it was")
    problems = execution.verify_clean([subject.view.box])
    check("no outstanding substitution", not problems, problems)

    print("\n%s" % ("FAILED: %s" % ", ".join(FAILURES) if FAILURES else "all checks passed"))
    return 1 if FAILURES else 0


if __name__ == "__main__":
    sys.exit(main())
