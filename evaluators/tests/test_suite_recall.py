#!/usr/bin/env python3
"""Execution score is the fraction of tests the original bundle passed.

The export-surface trace is recorded for diagnosis and does not change the
score. A candidate that matches the trace but fails originally-passing tests
must not score 1.0.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from metrics import execution  # noqa: E402

FAILURES = []


def check(name, condition, detail=""):
    if condition:
        print("  ok   %s" % name)
    else:
        print("  FAIL %s %s" % (name, detail))
        FAILURES.append(name)


def main():
    print("suite_recall: originally-passing tests must still pass")
    green = {"passed": 11, "failed": 0}
    check("perfect copy is 1.0",
          execution.suite_recall(green, {"passed": 11, "failed": 0}, True) == 1.0)
    check("marpit-style 4/11 is 4/11",
          abs(execution.suite_recall(green, {"passed": 4, "failed": 7}, False)
              - 4 / 11.0) < 1e-9)
    check("bundle identity failure is not charged (184/185 vs 184/185)",
          execution.suite_recall({"passed": 184, "failed": 1},
                                 {"passed": 184, "failed": 1}, True) == 1.0)
    check("one extra failure on a previously green test",
          abs(execution.suite_recall({"passed": 184, "failed": 1},
                                     {"passed": 183, "failed": 2}, False)
              - 183 / 184.0) < 1e-9)
    check("candidate may fix a bundle-only failure",
          execution.suite_recall({"passed": 184, "failed": 1},
                                 {"passed": 185, "failed": 0}, True) == 1.0)
    check("no counts: fall back to matching exit codes",
          execution.suite_recall(None, None, True) == 1.0)
    check("no counts and the suite exit disagrees",
          execution.suite_recall(None, None, False) == 0.0)

    print("\ncombine_score: headline is the test fraction; trace is ignored")
    check("both 1.0 → 1.0", execution.combine_score(1.0, 1.0) == 1.0)
    check("trace 1.0 but tests 4/11 → 4/11",
          abs(execution.combine_score(1.0, 4 / 11.0) - 4 / 11.0) < 1e-9)
    check("tests 1.0 but trace 0.5 → 1.0 (trace does not press the score)",
          execution.combine_score(0.5, 1.0) == 1.0)
    check("tests 12/14, prefix 1/28 → 12/14",
          abs(execution.combine_score(1 / 28.0, 12 / 14.0) - 12 / 14.0) < 1e-9)
    check("no trace uses the tests",
          execution.combine_score(None, 1.0) == 1.0)
    check("no trace and tests failed",
          execution.combine_score(None, 0.0) == 0.0)

    print("\ncompare() records suite_recall and keeps the trace as behaviour_match")
    cfg = {"normalize": {}}
    reference = {
        "events": [{"kind": "call", "name": "headingDivider", "args": [], "seq": 0},
                   {"kind": "return", "name": "headingDivider", "value": None, "seq": 1}],
        "exit_code": 0,
        "timed_out": False,
        "stdout": "",
        "stderr": "Tests:       11 passed, 11 total\n",
        "suite_green": True,
    }
    candidate = {
        "events": list(reference["events"]),
        "exit_code": 1,
        "timed_out": False,
        "stdout": "",
        "stderr": "Tests:       4 passed, 7 failed, 11 total\n",
        "suite_green": False,
    }
    detail = execution.compare(reference, candidate, [], cfg, mode="sequence")
    check("trace still 1.0", detail["behaviour_match"] == 1.0, detail["behaviour_match"])
    check("suite_recall is 4/11",
          abs(detail["suite_recall"] - 4 / 11.0) < 1e-6, detail["suite_recall"])
    check("combined score is 4/11",
          abs(execution.combine_score(detail["behaviour_match"],
                                      detail["suite_recall"]) - 4 / 11.0) < 1e-6)

    if FAILURES:
        print("\n%d failure(s): %s" % (len(FAILURES), ", ".join(FAILURES)))
        return 1
    print("\nok")
    return 0


if __name__ == "__main__":
    sys.exit(main())
