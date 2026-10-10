"""Workload execution correctness, with traces retained as diagnostics.

The primary full_suite_v2 score requires a reference that passes a nonempty
workload. A candidate receives one only if it passes the same number of tests,
exits successfully, reports no failed tests, and does not time out. Partial
passed-test fractions and differential traces describe divergence separately.
Module substitution takes place in the isolated subject oracle view and is
restored in a finally block, with a repair journal for interrupted runs.
"""
import atexit
import errno
import fcntl
import hashlib
import json
import os
import re
import shutil
import threading
from collections import Counter
from pathlib import Path

from evallib import jsast, nodeenv, oracleview, schema

HARNESS_DIR = Path(__file__).resolve().parent.parent / "harness"
IMPL_NAME = ".adb_impl.js"
TRACER_NAME = ".adb_tracer.js"
JOURNAL_NAME = "journal.json"

_SCOPE_LOCKS = {}
_LOCKS_GUARD = threading.Lock()
_LIVE_SUBSTITUTIONS = {}
_LIVE_GUARD = threading.Lock()
_REFERENCE_RUNS = {}
_REFERENCE_LOCKS = {}
_REFERENCE_GUARD = threading.Lock()


# --------------------------------------------------------------------------- #
# restoring the sandbox
# --------------------------------------------------------------------------- #

def _journal_path(box):
    return Path(box) / oracleview.SCRATCH_DIRNAME / JOURNAL_NAME


def _journal_write(box, entries):
    path = _journal_path(box)
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(".tmp")
    tmp.write_text(json.dumps(entries, indent=2), encoding="utf-8")
    tmp.replace(path)


def _journal_read(box):
    path = _journal_path(box)
    if not path.exists():
        return []
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except ValueError:
        return []


def sha256(path):
    digest = hashlib.sha256()
    with open(str(path), "rb") as fh:
        for chunk in iter(lambda: fh.read(65536), b""):
            digest.update(chunk)
    return digest.hexdigest()


_TRACER_DIGEST = None


def tracer_digest():
    """Checksum of the tracer body, used to invalidate cached reference runs.

    Editing the tracer changes what a trace *says*, not what the subject does,
    so a cache keyed only on the subject would serve a reference recorded under
    the old serialisation and every candidate would appear to diverge.
    """
    global _TRACER_DIGEST
    if _TRACER_DIGEST is None:
        _TRACER_DIGEST = hashlib.sha256(
            (HARNESS_DIR / "tracer.js").read_bytes()).hexdigest()[:16]
    return _TRACER_DIGEST


def _undo(entry):
    """Empty the slot, and put back whatever was occupying it.

    The slot is empty by contract — `build_sandboxes.py` excludes the module
    under test from the oracle view, because the module is the thing being
    substituted — so the normal outcome is simply that the slot goes away again.
    Anything that *was* there belonged to an earlier mount by another stage and
    is moved back byte for byte.
    """
    result = {"slot": entry["slot"], "restored": True}
    slot = Path(entry["slot"])
    parked = Path(entry["parked"]) if entry.get("parked") else None
    try:
        if parked is not None and parked.exists():
            shutil.move(str(parked), str(slot))
            if entry.get("sha256") and sha256(slot) != entry["sha256"]:
                result.update(restored=False,
                              error="the pre-existing file was not restored intact")
        elif slot.exists():
            slot.unlink()
    except OSError as exc:
        result.update(restored=False, error=str(exc))
    for extra in entry.get("generated", []):
        try:
            os.unlink(extra)
        except OSError:
            pass
    return result


def repair(boxes=None):
    """Undo any substitution left behind by a crashed run.

    Reports what it did rather than doing it silently: a sandbox that needed
    repairing may also have a stale result attached to it.
    """
    report = []
    for box in (boxes if boxes is not None else oracleview.all_boxes()):
        entries = _journal_read(box)
        if not entries:
            continue
        for entry in entries:
            report.append(_undo(entry))
        _journal_write(box, [])
    return report


def verify_clean(boxes=None):
    """Report anything a finished run should not have left behind."""
    problems = []
    for box in (boxes if boxes is not None else oracleview.all_boxes()):
        box = Path(box)
        entries = _journal_read(box)
        if entries:
            problems.append({"box": str(box), "problem": "journal not empty",
                             "entries": [e["slot"] for e in entries]})
        meta_path = box / "sandbox.json"
        if not meta_path.exists():
            continue
        view = oracleview.OracleView(
            box, json.loads(meta_path.read_text(encoding="utf-8")))
        if not view.root.exists():
            continue
        for name in (IMPL_NAME, TRACER_NAME):
            for leftover in view.root.rglob(name):
                if "node_modules" in leftover.parts:
                    continue
                problems.append({"box": str(box),
                                 "problem": "generated file left behind",
                                 "path": str(leftover)})
        if view.parked.exists():
            for stranded in view.parked.rglob("*"):
                if stranded.is_file():
                    problems.append({"box": str(box),
                                     "problem": "a displaced file was never put back",
                                     "path": str(stranded)})
    return problems


def _restore_all():
    with _LIVE_GUARD:
        live = list(_LIVE_SUBSTITUTIONS.values())
    for entry in live:
        try:
            _undo(entry)
        except Exception:  # noqa: BLE001 — best effort during interpreter exit
            pass


atexit.register(_restore_all)


class _ScopeLock(object):
    """Serialise runs that share one `node_modules`.

    Per-box locking looks right — each subject has its own sandbox — but every
    box of a project symlinks `oracle/node_modules` to the *same*
    `corpus/work/<project>/node_modules`, and the runners write into it. This
    artifact's own checkouts already contain `node_modules/.cache/nyc`
    (websockets/ws alone has 9 subjects), `.cache/@babel`,
    `.cache/mongodb-memory-server`, and vite's `.vite` and `.vite-temp`, whose
    fixed-name staging files two concurrent processes rename out from under one
    another. Only 5 projects carry such a directory today, but nyc's and babel's
    caches appear on first use, so probing for them would drop mutual exclusion
    exactly when a project runs for the first time.

    So the lock is keyed on the resolved `node_modules` — the resource itself —
    rather than on the box, which is not it. That is the same granularity as the
    per-project lock this replaces, so no measurement changes, and it becomes
    per-box on its own if a box is ever given a private dependency tree.

    Threads are serialised in-process; the lock file additionally keeps two
    `score.py` invocations from interleaving.
    """

    def __init__(self, scope):
        self.scope = Path(scope)
        with _LOCKS_GUARD:
            key = str(self.scope)
            if key not in _SCOPE_LOCKS:
                _SCOPE_LOCKS[key] = threading.Lock()
            self.thread_lock = _SCOPE_LOCKS[key]
        self.handle = None

    def __enter__(self):
        self.thread_lock.acquire()
        path = self.scope / oracleview.SCRATCH_DIRNAME / ".lock"
        try:
            path.parent.mkdir(parents=True, exist_ok=True)
            self.handle = open(str(path), "w")
            fcntl.flock(self.handle, fcntl.LOCK_EX)
        except OSError:
            # A read-only scope still gets in-process serialisation, which is
            # what matters within one `score.py` run.
            self.handle = None
        return self

    def __exit__(self, *exc):
        try:
            if self.handle is not None:
                fcntl.flock(self.handle, fcntl.LOCK_UN)
                self.handle.close()
        finally:
            self.thread_lock.release()
        return False


# --------------------------------------------------------------------------- #
# building the shim
# --------------------------------------------------------------------------- #

def _read_template(name):
    return (HARNESS_DIR / name).read_text(encoding="utf-8")


def _tracer_source(flavour, cfg):
    body = _read_template("tracer.js")
    template = _read_template("tracer.esm.tmpl" if flavour == "esm" else "tracer.cjs.tmpl")
    options = {
        "max_events": cfg.get("max_events", 5000),
        "value_string_cap": cfg.get("value_string_cap", 200),
        "value_depth_cap": cfg.get("value_depth_cap", 4),
        "value_array_cap": cfg.get("value_array_cap", 20),
        "value_key_cap": cfg.get("value_key_cap", 30),
        "value_budget": cfg.get("value_budget", 2000),
        "host_globals": cfg.get("host_globals", []),
    }
    return (template
            .replace("__ADB_TRACER_BODY__", body)
            .replace("__ADB_OPTIONS__", json.dumps(options, indent=2)))


def _export_block(export_names):
    """ESM export statements for the reference surface."""
    lines = []
    for name in sorted(n for n in export_names if n != "default" and n != "*"):
        if not jsast.is_identifier(name):
            continue
        lines.append("export const %s = __adb_pick('%s');" % (name, name))
    if "default" in export_names:
        lines.append("const __adb_default = __adb_pick('default');")
        lines.append("export default __adb_default;")
    if not lines:
        # A module with no static exports still has to be a module.
        lines.append("export const __adb_empty = __adb_pick('__adb_empty');")
    return "\n".join(lines)


def _shim_source(flavour, export_names):
    tracer_spec = "./" + TRACER_NAME
    impl_spec = "./" + IMPL_NAME
    if flavour == "esm":
        return (_read_template("shim.esm.tmpl")
                .replace("__ADB_TRACER_SPEC__", tracer_spec)
                .replace("__ADB_IMPL_SPEC__", impl_spec)
                .replace("__ADB_EXPORT_BLOCK__", _export_block(export_names)))
    return (_read_template("shim.cjs.tmpl")
            .replace("__ADB_TRACER_SPEC__", tracer_spec)
            .replace("__ADB_IMPL_SPEC__", impl_spec))


def module_flavour(subject):
    """Whether the subject module is written as ESM or CommonJS.

    Decided from the module's own source in the project checkout, not from
    `package.json` and not from the manifest. `package.json` is unreliable —
    marpit leaves `type` unset while writing ESM compiled by babel-jest, and
    OpenContext declares `commonjs`. The manifest's `module_format` is a
    different fact entirely: it describes the *bundle*, and it says `cjs` while
    the module's own source is ESM on 59 of the 171 subjects. The shim has to
    match the file it replaces, because the project's tooling was configured for
    that file, so this stays anchored to the checkout even though the run now
    happens in the sandbox.
    """
    text = subject.module.read_text(encoding="utf-8", errors="replace")
    return "esm" if jsast.has_esm_syntax(jsast.parse(text)) else "cjs"


def _esbuild_platform(subject):
    """esbuild's target platform for this subject.

    From the manifest's `platform`, not the sandbox's `runtime`: the latter
    describes the agent view's host emulation and disagrees with `platform` on
    two dozen subjects in both directions, so reading it here would change what
    esbuild emits for them.
    """
    platform = (subject.platform or "neutral").lower()
    return platform if platform in ("browser", "node", "neutral") else "neutral"


# --------------------------------------------------------------------------- #
# running
# --------------------------------------------------------------------------- #

def run_once(subject, view, impl_source, cfg, tag, keep=False, timeout=None):
    """Run the subject's test file with `impl_source` standing in for it.

    Returns the run's trace and outcome. The oracle view is left exactly as
    found, including when the run raises.
    """
    result = {"tag": tag, "events": [], "exit_code": None, "timed_out": False,
              "error": None, "stdout": "", "stderr": "", "dropped": False}

    mountable, why = view.mountable()
    if not mountable:
        result["error"] = why
        return result
    if not subject.module.exists() or not subject.bundle.exists():
        result["error"] = "the project checkout or subject bundle is missing"
        return result

    flavour = module_flavour(subject)
    export_names = jsast.exported_names(
        jsast.parse(subject.bundle.read_text(encoding="utf-8", errors="replace")))

    slot = view.slot
    slot.parent.mkdir(parents=True, exist_ok=True)
    impl_dest = view.slot_dir / IMPL_NAME
    tracer_dest = view.slot_dir / TRACER_NAME
    work = view.work
    trace_path = work / ("trace.%s.jsonl" % tag)
    if trace_path.exists():
        trace_path.unlink()

    ok, detail = nodeenv.transform(impl_source, impl_dest, flavour,
                                   platform=_esbuild_platform(subject),
                                   root=subject.root)
    if not ok:
        result["error"] = "esbuild could not convert the program: %s" % detail
        _cleanup(impl_dest, tracer_dest, keep)
        return result

    tracer_dest.write_text(_tracer_source(flavour, cfg), encoding="utf-8")

    # The slot is empty by contract, so the usual outcome is that nothing is
    # displaced. If something is there it belongs to an earlier mount by another
    # stage; it is moved aside whole and moved back afterwards, never copied
    # over, so a half-written restore cannot leave a hybrid behind.
    entry = {"box": str(view.box), "slot": str(slot), "parked": None,
             "sha256": None, "layout": oracleview.LAYOUT, "pid": os.getpid(),
             "generated": [str(impl_dest), str(tracer_dest)]}
    if slot.exists():
        parked = view.parked / view.entry
        parked.parent.mkdir(parents=True, exist_ok=True)
        entry["sha256"] = sha256(slot)
        entry["parked"] = str(parked)
        if not parked.exists():
            shutil.move(str(slot), str(parked))
        else:
            # A file already parked is the older and more trustworthy one; the
            # slot's current contents are this stage's own leftovers.
            slot.unlink()
    live_key = str(slot)

    try:
        entries = [e for e in _journal_read(view.box) if e["slot"] != live_key]
        _journal_write(view.box, entries + [entry])
        with _LIVE_GUARD:
            _LIVE_SUBSTITUTIONS[live_key] = entry

        slot.write_text(_shim_source(flavour, export_names), encoding="utf-8")

        # The command comes from the sandbox's own record of the oracle, but is
        # assembled by the corpus's `specialize()` — the same function that
        # produced the command which proved this subject's suite green.
        env_prefix, command = nodeenv.specialize(
            view.invocation, view.runner, view.test_rel)
        command = ("%s %s" % (env_prefix, command)).strip()
        env = view.env({"ADB_TRACE": str(trace_path)})
        run = nodeenv.run(command, view.cwd, env=env,
                          timeout=timeout or cfg.get("timeout_sec", 900))
        result["exit_code"] = run["exit_code"]
        result["timed_out"] = run["timed_out"]
        result["stdout"] = run["stdout"][-20000:]
        result["stderr"] = run["stderr"][-20000:]
        result["command"] = command
    finally:
        undone = _undo(dict(entry, generated=[] if keep else entry["generated"]))
        if not undone.get("restored") and not result["error"]:
            result["error"] = undone.get("error", "the oracle view was not restored")
        with _LIVE_GUARD:
            _LIVE_SUBSTITUTIONS.pop(live_key, None)
        _journal_write(view.box, [e for e in _journal_read(view.box)
                                  if e["slot"] != live_key])

    result["events"] = _read_trace(trace_path, cfg)
    return result


def _cleanup(impl_dest, tracer_dest, keep):
    if keep:
        return
    for path in (impl_dest, tracer_dest):
        try:
            os.unlink(str(path))
        except OSError as exc:
            if exc.errno != errno.ENOENT:
                raise


def _read_trace(path, cfg):
    if not Path(path).exists():
        return []
    events = []
    with open(str(path), encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if not line:
                continue
            try:
                events.append(json.loads(line))
            except ValueError:
                continue
    events.sort(key=lambda e: e.get("seq", 0))
    return events


# --------------------------------------------------------------------------- #
# comparing traces
# --------------------------------------------------------------------------- #

_TMP_RE = re.compile(r"(/private)?/(tmp|var/folders)/[^\s\"']*")
_ISO_RE = re.compile(r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[^\s\"']*")
_UUID_RE = re.compile(r"[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}")
_HEX_RE = re.compile(r"\b[0-9a-fA-F]{32,}\b")
_EPOCH_RE = re.compile(r"\b1[0-9]{9,12}\b")
# Compact datetime stamps, e.g. the `20260806085108-add-index.js` filename
# migrate-mongo derives from the clock. Year-anchored so that an ordinary
# 14-digit number is not swallowed with it.
_STAMP_RE = re.compile(r"\b(?:19|20)[0-9]{12}\b")
_STACK_RE = re.compile(r"\n\s+at\s.*")
# An ephemeral port in a URL: mongodb-memory-server binds a fresh one per run,
# so migrate-mongo's config differs from itself between runs.
_PORT_RE = re.compile(r"(://[^/\s\"']{1,80}?):\d{2,5}\b")

# Epoch milliseconds appearing as a JSON *number* rather than inside a string —
# a cache entry's expiry, for instance. Bounded to a range no plausible domain
# constant occupies: 10^12 ms is 2001, 10^14 is the year 5138.
_EPOCH_MS_MIN = 10 ** 12
_EPOCH_MS_MAX = 10 ** 14


def _normalize_text(text, roots, flags):
    if flags.get("absolute_paths", True):
        # `roots` must arrive longest-first: replacement is sequential, so a
        # shorter root that prefixes a longer one consumes it and leaves the
        # distinguishing remainder in the trace. `OracleView.normalize_roots()`
        # sorts for this.
        for root in roots:
            if root:
                text = text.replace(root, "@root")
    if flags.get("temp_dirs", True):
        text = _TMP_RE.sub("@tmp", text)
    if flags.get("stack_traces", True):
        text = _STACK_RE.sub("", text)
    if flags.get("timestamps", True):
        text = _ISO_RE.sub("@ts", text)
        text = _STAMP_RE.sub("@stamp", text)
        text = _EPOCH_RE.sub("@epoch", text)
    if flags.get("ephemeral_ports", True):
        text = _PORT_RE.sub(r"\1:@port", text)
    text = _UUID_RE.sub("@uuid", text)
    text = _HEX_RE.sub("@hex", text)
    return text


def _normalize(value, roots, flags):
    if isinstance(value, str):
        return _normalize_text(value, roots, flags)
    if isinstance(value, bool):
        return value  # bool is an int subclass; it must not reach the epoch test
    if (isinstance(value, (int, float)) and flags.get("timestamps", True)
            and _EPOCH_MS_MIN <= value < _EPOCH_MS_MAX):
        return "@epoch"
    if isinstance(value, list):
        return [_normalize(v, roots, flags) for v in value]
    if isinstance(value, dict):
        return dict((k, _normalize(v, roots, flags)) for k, v in value.items()
                    if k != "seq")
    return value


def _key(event, roots, flags):
    return json.dumps(_normalize(event, roots, flags), sort_keys=True,
                      ensure_ascii=False)


EXECUTION_POLICY = "full_suite_v2"
_ANSI = re.compile(r"\x1b\[[0-?]*[ -/]*[@-~]")


def _test_counts(run):
    """Read terminal test summaries, not trace events or suite counts.

    All-failed runs, ANSI colours, reordered Jest/Vitest fields and nested TAP
    summaries are supported. Ambiguous multiple workloads are not guessed or
    summed: without test identities they could double-count a repeated run.
    Unknown/incomplete reference summaries remain ineligible, never a zero.
    """
    text = _ANSI.sub("", (run.get("stdout") or "") + "\n" + (run.get("stderr") or ""))
    # Node TAP: child summaries are indented; only the outermost final block
    # establishes the workload. Require both pass and fail counters.
    tap = re.findall(r"^# tests (\d+)\s*$([\s\S]*?)(?=^# tests |\Z)", text, re.M)
    if len(tap) == 1:
        total, block = tap[0]
        passed = re.search(r"^# pass (\d+)\s*$", block, re.M)
        failed = re.search(r"^# fail (\d+)\s*$", block, re.M)
        if passed and failed:
            counts = {"passed": int(passed[1]), "failed": int(failed[1]),
                      "total": int(total), "runner": "node:test"}
            for key in ("cancelled", "skipped", "todo"):
                m = re.search(r"^# " + key + r" (\d+)\s*$", block, re.M)
                counts[key] = int(m[1]) if m else 0
            return counts if _valid_counts(counts) else None
        return None
    if tap:
        return None
    # Jest and Vitest have one test summary line (not 'Test Suites/Files').
    summaries = re.findall(r"^\s*Tests(?::|\s+)\s*([^\n]+)$", text, re.M)
    if len(summaries) == 1:
        fields = dict((name, int(n)) for n, name in re.findall(
            r"(\d+)\s+(passed|failed|skipped|todo|total)\b", summaries[0]))
        if not fields or not any(k in fields for k in ("passed", "failed")):
            return None
        counts = {"passed": fields.get("passed", 0), "failed": fields.get("failed", 0),
                  "skipped": fields.get("skipped", 0), "todo": fields.get("todo", 0),
                  "cancelled": 0, "runner": "jest/vitest"}
        counts["total"] = fields.get("total", sum(counts[k] for k in
                                                ("passed", "failed", "skipped", "todo")))
        return counts if _valid_counts(counts) else None
    if summaries:
        return None
    # Mocha may omit '0 passing' on an all-failed run. Pending is recorded.
    fields = re.findall(r"^\s*(\d+)\s+(passing|failing|pending)(?:\s+\([^\n]*\))?\s*$", text, re.M)
    if fields:
        if len({name for _, name in fields}) != len(fields):
            return None
        values = {name: int(n) for n, name in fields}
        counts = {"passed": values.get("passing", 0), "failed": values.get("failing", 0),
                  "skipped": values.get("pending", 0), "cancelled": 0, "todo": 0,
                  "runner": "mocha"}
        counts["total"] = sum(counts[k] for k in ("passed", "failed", "skipped"))
        return counts if _valid_counts(counts) else None
    return None


def _valid_counts(counts):
    if not isinstance(counts, dict):
        return False
    for key in ("passed", "failed"):
        if type(counts.get(key)) is not int or counts[key] < 0:
            return False
    for key in ("total", "cancelled", "skipped", "todo"):
        if key in counts and (type(counts[key]) is not int or counts[key] < 0):
            return False
    counted = sum(counts.get(k, 0) for k in ("passed", "failed", "cancelled", "skipped", "todo"))
    return "total" not in counts or counts["total"] == counted


def trace_keys(run, roots, cfg):
    flags = cfg.get("normalize", {})
    return [_key(e, roots, flags) for e in run["events"]]


def stability(first, second, roots, cfg):
    """Whether the subject's behaviour is reproducible run to run.

    Measured, not assumed. §3.2 requires that repeated runs of the same input
    agree, and some subjects do not: vitest interleaves calls from concurrent
    tests, so migrate-mongo's 4838-event trace comes back with the same events
    in a different order every time. Comparing such a trace as a sequence would
    score a perfect candidate at 0.0002.

    Three outcomes, in decreasing strength: identical (compare as a sequence),
    same events in a different order (compare as a multiset), or different
    events altogether (nothing can be measured — run-to-run noise would be
    indistinguishable from a candidate's error).
    """
    first_keys = trace_keys(first, roots, cfg)
    second_keys = trace_keys(second, roots, cfg)
    identical = first_keys == second_keys
    same_multiset = Counter(first_keys) == Counter(second_keys)
    return {
        "identical": identical,
        "same_multiset": same_multiset,
        "mode": "sequence" if identical else ("multiset" if same_multiset else "unstable"),
        "events_first": len(first_keys),
        "events_second": len(second_keys),
    }


def compare(reference, candidate, roots, cfg, mode="sequence"):
    """Score a candidate run against the reference run."""
    ref_keys = trace_keys(reference, roots, cfg)
    cand_keys = trace_keys(candidate, roots, cfg)

    matched = 0
    for a, b in zip(ref_keys, cand_keys):
        if a != b:
            break
        matched += 1

    divergence = None
    if matched < len(ref_keys) or len(cand_keys) != len(ref_keys):
        divergence = {
            "index": matched,
            "reference": reference["events"][matched] if matched < len(reference["events"]) else None,
            "candidate": candidate["events"][matched] if matched < len(candidate["events"]) else None,
        }

    ref_counts = Counter(ref_keys)
    cand_counts = Counter(cand_keys)
    overlap = sum((ref_counts & cand_counts).values())
    precision = overlap / float(len(cand_keys)) if cand_keys else 0.0
    recall = overlap / float(len(ref_keys)) if ref_keys else 0.0
    f1 = 0.0 if precision + recall == 0 else 2 * precision * recall / (precision + recall)

    exit_match = reference["exit_code"] == candidate["exit_code"]
    # Normalised by the longer of the two, so that a candidate which reproduces
    # the reference's calls and then keeps going — an extra request, a retry
    # loop, a duplicated write — is not scored as behaviourally identical.
    span = max(len(ref_keys), len(cand_keys))
    trace_match = (matched / float(span)) if span else None

    # On a subject whose call order is not reproducible, order carries no
    # information and the multiset overlap is the strongest sound comparison.
    behaviour_match = trace_match if mode == "sequence" else (f1 if span else None)

    return {
        "behaviour_match": round(behaviour_match, 6) if behaviour_match is not None else None,
        "comparison_mode": mode,
        "trace_match": round(trace_match, 6) if trace_match is not None else None,
        "event_f1": round(f1, 6),
        "matched_prefix": matched,
        "reference_events": len(ref_keys),
        "candidate_events": len(cand_keys),
        "reference_host_events": sum(1 for e in reference["events"] if e.get("kind") == "host"),
        "candidate_host_events": sum(1 for e in candidate["events"] if e.get("kind") == "host"),
        "first_divergence": divergence,
        "exit_code_reference": reference["exit_code"],
        "exit_code_candidate": candidate["exit_code"],
        "exit_code_match": bool(exit_match),
        "reference_suite_green": reference.get("suite_green"),
        "tests_reference": _test_counts(reference),
        "tests_candidate": _test_counts(candidate),
        "timed_out": candidate["timed_out"],
    }


def full_suite_score(reference_exit, reference_counts, candidate_exit,
                     candidate_counts, timed_out=False, reference_timed_out=False,
                     reference_consistent=True):
    """Return a workload pass, never credit matching failures or zero tests.

    None means the reference is not eligible for the executable scoring set.
    A candidate must complete the same nonempty test workload without failures.
    Trace agreement is a separate diagnostic, not a substitute for test success.
    """
    if (not reference_consistent or reference_timed_out or reference_exit != 0 or not _valid_counts(reference_counts)
            or reference_counts.get("passed", 0) <= 0
            or reference_counts.get("failed", 0) != 0
            or reference_counts.get("cancelled", 0) != 0):
        return None
    complete = (not timed_out and candidate_exit == 0
                and _valid_counts(candidate_counts)
                and candidate_counts.get("failed", 0) == 0
                and candidate_counts.get("cancelled", 0) == 0
                and candidate_counts.get("passed", 0)
                    == reference_counts["passed"])
    if complete:
        # Prevent extra skipped/todo tests from disguising a changed workload.
        complete = all(reference_counts[k] == candidate_counts[k]
                       for k in ("total", "skipped", "todo")
                       if k in reference_counts and k in candidate_counts)
    return 1.0 if complete else 0.0


def workload_diagnostics(reference_exit, reference_counts, candidate_exit,
                         candidate_counts, timed_out=False, reference_timed_out=False,
                         reference_consistent=True):
    """Separate complete recovery from partial test counts and trace similarity."""
    score = full_suite_score(reference_exit, reference_counts, candidate_exit,
                             candidate_counts, timed_out, reference_timed_out, reference_consistent)
    out = {"score": score, "score_policy": EXECUTION_POLICY,
           "reference_eligible": score is not None,
           "reference_test_count": reference_counts.get("passed")
                                     if _valid_counts(reference_counts) else None,
           "reported_test_pass_fraction": None}
    if score is None:
        out["reason"] = "reference workload failed, timed out, was empty or had unrecognized counts"
    elif timed_out:
        out["reason"] = "candidate timed out"
    elif not _valid_counts(candidate_counts):
        out["reason"] = "candidate test counts unavailable or invalid"
    elif candidate_counts["passed"] > reference_counts["passed"]:
        out["reason"] = "candidate passed more tests than the reference; workload mismatch"
    else:
        out["reported_test_pass_fraction"] = candidate_counts["passed"] / reference_counts["passed"]
        if score == 1:
            out["reason"] = "complete reference workload passed"
        elif candidate_exit != 0:
            out["reason"] = "candidate exited unsuccessfully"
        elif candidate_counts["failed"] or candidate_counts.get("cancelled", 0):
            out["reason"] = "candidate has failed or cancelled tests"
        else:
            out["reason"] = "candidate did not complete the same reference workload"
    return out


# --------------------------------------------------------------------------- #
# the reference run, cached
# --------------------------------------------------------------------------- #

def reference_run(subject, view, cfg, refresh=False, keep=False):
    """Revalidate once per scoring process; disk caches cannot establish eligibility.

    Bundle/tracer hashes miss changed fixtures, dependencies and host state.
    Process-local memoization shares only this invocation's fresh control run.
    """
    context = json.dumps({'bundle': sha256(subject.bundle), 'tracer': tracer_digest(),
                          'invocation': view.invocation, 'runner': view.runner,
                          'test': view.test_rel, 'config': cfg, 'keep': keep},
                         sort_keys=True, default=str)
    key = (str(view.work), hashlib.sha256(context.encode()).hexdigest())
    with _REFERENCE_GUARD:
        lock = _REFERENCE_LOCKS.setdefault(key, threading.Lock())
    with lock:
        if not refresh and key in _REFERENCE_RUNS:
            return _REFERENCE_RUNS[key]
        result = _run_fresh_reference(subject, view, cfg, refresh=True, keep=keep)
        _REFERENCE_RUNS[key] = result
        return result


def _run_fresh_reference(subject, view, cfg, refresh=True, keep=False):
    """Run current reference controls and write an audit snapshot, never reuse disk green status."""
    # Named `reference-run.json` rather than `reference.json`: the box already
    # has a `reference.json` at its top level, recording whether the sandbox's
    # oracle suite starts. Two different schemas one directory apart under one
    # name is a trap for whoever greps next.
    cache_path = view.work / "reference-run.json"
    digest = sha256(subject.bundle)
    tracer = tracer_digest()
    roots = view.normalize_roots()
    with _ScopeLock(view.lock_scope()):
        run = run_once(subject, view, subject.bundle, cfg, "reference", keep=keep)
    # A trace, or a green suite for a subject whose exports are never called
    # directly. Neither means the module failed to load and nothing was observed.
    run["usable"] = bool(not run["error"] and not run["timed_out"]
                         and (run["events"] or run["exit_code"] == 0))
    run["suite_green"] = bool(run["exit_code"] == 0)

    # The reference is run a second time to establish how reproducible the
    # subject is. Without this the harness cannot tell a candidate's divergence
    # from the subject's own nondeterminism. Paid once per subject and cached.
    if run["usable"] and (run["events"] or
                          full_suite_score(run["exit_code"], _test_counts(run), None, None) is not None):
        with _ScopeLock(view.lock_scope()):
            repeat = run_once(subject, view, subject.bundle, cfg, "reference2", keep=keep)
        run["stability"] = stability(run, repeat, roots, cfg)
        run["workload_repeat_green"] = full_suite_score(
            run["exit_code"], _test_counts(run), repeat["exit_code"],
            _test_counts(repeat), repeat.get("timed_out", False), run.get("timed_out", False)) == 1
        if run["stability"]["mode"] == "unstable":
            run["usable"] = False
            run["error"] = ("the subject does not behave reproducibly: two runs of "
                            "the reference bundle produced different events (%d vs %d)"
                            % (run["stability"]["events_first"],
                               run["stability"]["events_second"]))
    else:
        run["stability"] = {"identical": True, "same_multiset": True,
                            "mode": "sequence", "events_first": len(run["events"]),
                            "events_second": len(run["events"])}
    cache_path.parent.mkdir(parents=True, exist_ok=True)
    cache_path.write_text(json.dumps({"bundle_sha256": digest, "tracer_sha256": tracer,
                                      "layout": oracleview.LAYOUT, "run": run},
                                     ensure_ascii=False, indent=1), encoding="utf-8")
    return run


def evaluate(subject, candidate_path, cfg, refresh_reference=False, keep=False,
             config_id=None):
    """Full execution measurement for one candidate program.

    Returns (status, detail). `status` distinguishes a system that failed from a
    subject the harness cannot measure and from a build whose own defences
    defeated the measurement — the paper reports all three separately, and
    conflating them would let a runtime limit or an obfuscator's anti-analysis
    code read as a model failure.
    """
    view = subject.view
    if view is None:
        return schema.STATUS_UNSUPPORTED, {
            "score": None,
            "reason": ("no sandbox was built for this subject; run "
                       "sandbox/scripts/build_sandboxes.py"),
        }
    mountable, why = view.mountable()
    if not mountable:
        return schema.STATUS_UNSUPPORTED, {"score": None, "reason": why}

    reference = reference_run(subject, view, cfg, refresh=refresh_reference, keep=keep)
    primary = cfg.get("primary", "full_suite")
    if primary == "full_suite" and full_suite_score(
            reference.get("exit_code"), _test_counts(reference), None, None,
            reference_timed_out=reference.get("timed_out", False),
            reference_consistent=reference.get("workload_repeat_green", True)) is None:
        return schema.STATUS_UNSUPPORTED, {
            **workload_diagnostics(reference.get("exit_code"), _test_counts(reference), None, None,
                                   reference_timed_out=reference.get("timed_out", False),
                                   reference_consistent=reference.get("workload_repeat_green", True)),
            "reason": "reference did not pass a nonempty test workload",
            "exit_code_reference": reference.get("exit_code"),
            "tests_reference": _test_counts(reference),
        }
    if not reference.get("usable") and primary != "full_suite":
        return schema.STATUS_UNSUPPORTED, {
            "score": None,
            "reason": reference.get("error")
                      or "the reference bundle produced no observable behaviour "
                         "(it could not be substituted for the subject module)",
            # Why the reference run produced nothing, in the runner's own words.
            # Without it every unsupported subject reads the same and the cause
            # has to be re-derived by hand — and the causes are not alike: a
            # module exercised only through JSX is a property of the subject,
            # while `document is not defined` is a missing jsdom setting in the
            # oracle view, which is a property of the *runtime* and fixable.
            "diagnosis": _diagnose(reference),
            "exit_code_reference": reference.get("exit_code"),
            "reference_events": len(reference.get("events") or []),
        }

    # An anti-analysis rung gets a short leash. Its self-defending code does not
    # fail the run, it prevents the run from ever finishing, so the default
    # 900-second timeout is 900 seconds spent confirming something the rung
    # announced in its own configuration. `obfuscators/scripts/02_admit.py` caps
    # these at 15 seconds for exactly this reason.
    anti = str(config_id) in set(cfg.get("anti_rungs") or [])
    timeout = cfg.get("defense_timeout_sec", 15) if anti else None

    with _ScopeLock(view.lock_scope()):
        candidate = run_once(subject, view, candidate_path, cfg, "candidate",
                             keep=keep, timeout=timeout)

    if candidate["error"]:
        diagnostics = (workload_diagnostics(reference.get("exit_code"),
                                  _test_counts(reference), candidate.get("exit_code"),
                                  _test_counts(candidate), candidate.get("timed_out", False))
                       if primary == "full_suite" else {"score": 0.0})
        return schema.STATUS_OK, {**diagnostics,
                                  "reason": candidate["error"],
                                  "exit_code_candidate": candidate["exit_code"],
                                  "exit_code_reference": reference.get("exit_code"),
                                  "tests_reference": _test_counts(reference),
                                  "tests_candidate": _test_counts(candidate),
                                  "timed_out": candidate.get("timed_out", False),
                                  "score_policy": EXECUTION_POLICY}

    defense = (_defense_signal(reference, candidate, anti, config_id, view)
               if primary != "full_suite" else None)
    if defense is not None:
        return schema.STATUS_DEFENSE, defense

    mode = (reference.get("stability") or {}).get("mode", "sequence")
    detail = compare(reference, candidate, view.normalize_roots(), cfg, mode=mode)
    if primary == "full_suite":
        detail.update(workload_diagnostics(
            detail["exit_code_reference"], detail["tests_reference"],
            detail["exit_code_candidate"], detail["tests_candidate"],
            detail["timed_out"], reference.get("timed_out", False),
            reference.get("workload_repeat_green", True)))
        return (schema.STATUS_TIMEOUT if candidate["timed_out"] else schema.STATUS_OK), detail
    if candidate["timed_out"]:
        detail["score"] = 0.0
        return schema.STATUS_TIMEOUT, detail

    if detail["behaviour_match"] is None:
        # The tests exercise the module without calling its exports directly —
        # a React component rendered by JSX, for instance. There is no trace to
        # compare, so the oracle degrades to whether the suite still agrees.
        detail["score"] = 1.0 if detail["exit_code_match"] else 0.0
        detail["reason"] = "no traced calls; scored on suite agreement alone"
        return schema.STATUS_DEGRADED, detail

    detail["score"] = detail["behaviour_match"]
    if mode == "multiset":
        detail["reason"] = ("the subject's call order is not reproducible; scored on "
                            "event overlap rather than sequence")
        return schema.STATUS_DEGRADED, detail
    return schema.STATUS_OK, detail


# Failures whose cause is the oracle view's construction rather than the
# subject. Named because they are actionable in a way "no observable behaviour"
# is not: each points at something the sandbox stage could copy in.
_DIAGNOSES = [
    ("document is not defined",
     "the oracle view has no jsdom environment; the project's jest config was "
     "not copied in (it is not at the project root in a monorepo)"),
    ("Cannot find module",
     "a module the test imports is absent from the oracle view"),
    ("Test suite failed to run",
     "the suite never started in the oracle view"),
    ("SyntaxError: Cannot use import statement",
     "the oracle view has no transform configured for ESM test sources"),
]


def _diagnose(run):
    text = (run.get("stderr") or "") + "\n" + (run.get("stdout") or "")
    for needle, explanation in _DIAGNOSES:
        if needle in text:
            return explanation
    return None


def _defense_signal(reference, candidate, anti, config_id, view):
    """Detail record if the build's own anti-analysis code defeated the run.

    The differential harness replaces the module with a tracing shim. That is a
    source rewrite, and detecting a source rewrite is precisely what the `anti`
    and `full` rungs' `selfDefending` and `debugProtection` options exist to do.
    The evidence that this is a defence rather than a broken answer is that the
    reference run of the *same* subject went through the *same* substitution and
    came back fine: only the candidate carries the defending code.

    It showed up first on the `identity` oracle, which returns the obfuscated
    build unchanged and is therefore byte-identical to a build that already
    passed differential admission. It scored execution 0.0 with status
    `timeout`: the reference side ran its 7 cases, the candidate side produced no
    events at all, and the suite never exited. Charging that to the system would
    have reported a defence working as a model failing.

    The signal is a **hang**, and only a hang. That is how `selfDefending` and
    `debugProtection` work — an infinite loop or a debugger trap, so the suite
    never exits — and it is the same signal
    `obfuscators/scripts/02_admit.py` keys on (`suite_did_not_exit` reclassified
    to `defense_triggered`). An earlier version of this function also excused a
    candidate that merely produced no events, which was wrong and dangerous: the
    `empty` oracle returns `export default {}`, carries no defending code at all,
    and exits cleanly with code 1 in under a second, yet was being excused on the
    `anti` rung. That would have let any system escape a zero on the hardest
    rungs by returning nothing — removing exactly the failures the score is
    supposed to count. A candidate that exits has answered, and is scored.

    This remains a heuristic keyed on the rung rather than on anything observed
    in the returned program, so it must be reported separately and never folded
    into a `behaviour_match` average. The name is shared with the obfuscation
    stage deliberately.
    """
    if not anti or not candidate["timed_out"]:
        return None
    signal = "the test suite never exited"
    return {
        "score": None,
        "reason": ("the build's own anti-analysis code defeated the measurement, "
                   "not the returned program: %s, while the reference run of the "
                   "same subject through the same substitution did not" % signal),
        "defense": {"config_id": config_id, "runner": view.runner, "signal": signal},
        "exit_code_reference": reference.get("exit_code"),
        "exit_code_candidate": candidate.get("exit_code"),
        "reference_events": len(reference.get("events") or []),
        "candidate_events": len(candidate.get("events") or []),
        "timed_out": candidate["timed_out"],
    }
