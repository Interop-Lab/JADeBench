#!/usr/bin/env python3
"""Two reference traces that share a call sequence but differ in noisy values
must remain measurable. The previous gate treated that as `unsupported`.
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


def run(events, exit_code=0):
    return {"events": events, "exit_code": exit_code, "timed_out": False}


CFG = {"normalize": {"timestamps": True, "absolute_paths": True,
                     "temp_dirs": True, "stack_traces": True,
                     "ephemeral_ports": True}}
ROOTS = []


def main():
    print("mask leaves that two references disagree on")
    a = {"kind": "return", "name": "getProjectId", "value": "local:abc", "seq": 0}
    b = {"kind": "return", "name": "getProjectId", "value": "local:xyz", "seq": 0}
    masked = execution._mask_nondet(
        execution._normalize(a, ROOTS, CFG["normalize"]),
        execution._normalize(b, ROOTS, CFG["normalize"]))
    check("value becomes @nondet", masked["value"] == "@nondet", masked)
    check("name kept", masked["name"] == "getProjectId")

    print("\nstability: same calls, noisy values → sequence + masked")
    first = run([
        {"kind": "call", "name": "f", "args": ["x"], "seq": 0},
        {"kind": "return", "name": "f", "value": "id-1", "seq": 1},
    ])
    second = run([
        {"kind": "call", "name": "f", "args": ["x"], "seq": 0},
        {"kind": "return", "name": "f", "value": "id-2", "seq": 1},
    ])
    st = execution.stability(first, second, ROOTS, CFG)
    check("not identical", st["identical"] is False)
    check("masked", st["masked"] is True)
    check("mode sequence", st["mode"] == "sequence", st)

    print("\nperfect candidate with a different random id still scores 1.0")
    reference = dict(first)
    reference["stability"] = st
    reference["events_repeat"] = second["events"]
    reference["suite_green"] = True
    candidate = run([
        {"kind": "call", "name": "f", "args": ["x"], "seq": 0},
        {"kind": "return", "name": "f", "value": "id-9", "seq": 1},
    ])
    detail = execution.compare(reference, candidate, ROOTS, CFG, mode="sequence")
    check("score 1.0", detail["behaviour_match"] == 1.0, detail)
    check("nondet_masked", detail["nondet_masked"] is True)

    print("\nwrong call is still caught")
    broken = run([
        {"kind": "call", "name": "g", "args": ["x"], "seq": 0},
        {"kind": "return", "name": "g", "value": "id-9", "seq": 1},
    ])
    detail = execution.compare(reference, broken, ROOTS, CFG, mode="sequence")
    check("score 0", detail["behaviour_match"] == 0.0, detail)

    print("\nsubject class name is not behaviour")
    custom = {"kind": "constructed", "name": "default",
              "value": {"@class": "@custom", "host": "localhost"}, "seq": 0}
    named = {"kind": "constructed", "name": "default",
             "value": {"@class": "JSONRPCClient", "host": "localhost"}, "seq": 0}
    st3 = execution.stability(run([custom]), run([named]), ROOTS, CFG)
    check("class name masked or equal", st3["identical"] or st3["masked"], st3)
    detail = execution.compare(
        {"events": [custom], "exit_code": 0, "timed_out": False,
         "stability": st3, "events_repeat": [named], "suite_green": True},
        run([named]), ROOTS, CFG, mode="sequence")
    check("@custom vs JSONRPCClient scores 1.0", detail["behaviour_match"] == 1.0, detail)
    type_vs_range = execution.compare(
        run([{"kind": "return", "name": "f",
              "value": {"@class": "TypeError", "message": "x"}, "seq": 0}]),
        run([{"kind": "return", "name": "f",
              "value": {"@class": "RangeError", "message": "x"}, "seq": 0}]),
        ROOTS, CFG, mode="sequence")
    check("TypeError vs RangeError still differs",
          type_vs_range["behaviour_match"] == 0.0, type_vs_range)

    print("\ndifferent call sequence stays unstable")
    other = run([{"kind": "call", "name": "h", "args": [], "seq": 0}])
    st2 = execution.stability(first, other, ROOTS, CFG)
    check("unstable", st2["mode"] == "unstable", st2)
    check("not masked", st2["masked"] is False)

    if FAILURES:
        print("\n%d failure(s)" % len(FAILURES))
        return 1
    print("\nok")
    return 0


if __name__ == "__main__":
    sys.exit(main())
