"""Execution correctness (paper §3.2), by differential comparison of behaviour.

The original bundle is the semantic oracle. The subject's own tests drive that
bundle and the candidate through the same shim. A test the bundle passed must
still pass on the candidate; that fraction is ``suite_recall``. The shim also
records calls into the exported surface (and host-API traffic those calls
produce) so a coarse assertion cannot hide a wrong return value; that prefix
is ``behaviour_match`` / ``trace_match``. The score is the test fraction.
The trace is kept as a diagnostic when it disagrees with the tests, so a
failure can be read; it does not change the score. The reference is run a
second time, so the subject's own nondeterminism is measured rather than
charged to the candidate.

The export-surface prefix is still recorded so a coarse assertion cannot hide
a wrong return value, but it is diagnostic only. Scoring the trace as the
headline (or taking the minimum with the tests) was rejected: a single early
mismatch collapses the prefix to 0 and the published score becomes a coin
flip. Recording call arguments and replaying them offline needs stateful
arguments — sockets, DOM nodes, database handles — to be reconstructed, which
cannot be done faithfully; letting the test drive both sides sidesteps
reconstruction entirely.

Module substitution is in-place at the module's own path, because that is the
only interception point all four test runners share: jest resolves through its
own registry, vitest through Vite aliases, mocha and node:test through Node's
loader. That path is inside the subject's sandbox oracle view
(`sandbox/sandboxes/<box>/oracle/<entry>`) rather than inside the shared project
checkout: the rest of the pipeline already mounts there, one box belongs to one
subject, and a crash can damage at most that box. The slot is emptied in a
`finally`, any previous occupant restored and re-checksummed, and a journal on
disk allows `score.py --repair` afterwards.
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
# Bump when how two reference traces are compared changes. The tracer checksum
# does not move for a Python-side comparison change, and stale `usable=false`
# caches would otherwise keep a now-measurable subject unsupported.
STABILITY_VERSION = 2


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
    the module's own source can disagree with the bundled module format. The shim has to
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
              "error": None, "stdout": "", "stderr": "", "dropped": False,
              "elapsed_sec": None}

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
                          timeout=timeout or cfg.get("timeout_sec", 300))
        result["exit_code"] = run["exit_code"]
        result["timed_out"] = run["timed_out"]
        result["elapsed_sec"] = run.get("elapsed_sec")
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
# The same port without a scheme: HTTP `Host: localhost:37161`, Node's
# `_originalHostOrSocketPath`. The URL regex above requires `://`.
_LOCAL_PORT_RE = re.compile(r"\b(localhost|127\.0\.0\.1|\[::1\]):\d{2,5}\b")
# WebSocket handshake nonce (16 random bytes, base64). Not hex, so `_HEX_RE`
# misses it, and two reference runs of websockets/ws then look unstable.
_WS_KEY_RE = re.compile(r"(Sec-WebSocket-(?:Key|Accept):\s*)[A-Za-z0-9+/]+=*")

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
        text = _LOCAL_PORT_RE.sub(r"\1:@port", text)
    text = _WS_KEY_RE.sub(r"\1@wskey", text)
    text = _UUID_RE.sub("@uuid", text)
    text = _HEX_RE.sub("@hex", text)
    return text


# Constructor names that are language/host behaviour. Anything else on `@class`
# is a subject-declared identifier and must not decide execution score.
_INTRINSIC_CLASSES = frozenset((
    "Object", "Function", "Boolean", "Symbol", "Number", "BigInt", "String",
    "Array", "Date", "RegExp", "Error", "EvalError", "RangeError",
    "ReferenceError", "SyntaxError", "TypeError", "URIError",
    "Map", "Set", "WeakMap", "WeakSet", "Promise",
    "ArrayBuffer", "DataView",
    "Uint8Array", "Int8Array", "Uint16Array", "Int16Array",
    "Uint32Array", "Int32Array", "Float32Array", "Float64Array",
    "URL", "URLSearchParams", "Headers", "Request", "Response",
    "AbortController", "AbortSignal", "Event",
    "@custom",
))


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
        out = {}
        for key, item in value.items():
            if key == "seq":
                continue
            normalized = _normalize(item, roots, flags)
            if (key == "@class" and isinstance(normalized, str)
                    and normalized not in _INTRINSIC_CLASSES):
                normalized = "@custom"
            out[key] = normalized
        return out
    return value


def _key(event, roots, flags):
    return json.dumps(_normalize(event, roots, flags), sort_keys=True,
                      ensure_ascii=False)


def _dump(value):
    return json.dumps(value, sort_keys=True, ensure_ascii=False)


def _mask_nondet(left, right):
    """Keep leaves that both reference runs agree on; replace the rest with `@nondet`.

    A subject that returns `Date.now()`, a short random id, or the tracer's own
    `ADB_TRACE` path produces two traces with the same calls and different
    values. Treating that as `unstable` throws the whole subject out of
    execution scoring even though the suite is green. Masking only the disagreeing
    leaves keeps the stable behaviour comparable.
    """
    if left == right:
        return left
    if isinstance(left, dict) and isinstance(right, dict):
        return dict((k, _mask_nondet(left.get(k, "@missing"), right.get(k, "@missing")))
                    for k in set(left) | set(right))
    if isinstance(left, list) and isinstance(right, list):
        n = max(len(left), len(right))
        out = []
        for i in range(n):
            a = left[i] if i < len(left) else "@missing"
            b = right[i] if i < len(right) else "@missing"
            out.append(_mask_nondet(a, b))
        return out
    return "@nondet"


def _apply_template(value, template):
    """Force candidate leaves to `@nondet` wherever the two references disagreed."""
    if template == "@nondet":
        return "@nondet"
    if isinstance(template, dict):
        if not isinstance(value, dict):
            return value
        return dict((k, _apply_template(value.get(k, "@missing"), t))
                    for k, t in template.items())
    if isinstance(template, list):
        if not isinstance(value, list):
            return value
        return [_apply_template(value[i] if i < len(value) else "@missing", t)
                for i, t in enumerate(template)]
    return value


def _skeletons(events):
    return [(e.get("kind"), e.get("name")) for e in events]


def _mask_templates(first, second, roots, cfg):
    flags = cfg.get("normalize", {})
    left = [_normalize(e, roots, flags) for e in first.get("events") or []]
    right = [_normalize(e, roots, flags) for e in second.get("events") or []]
    if not left or len(left) != len(right) or _skeletons(left) != _skeletons(right):
        return None
    return [_mask_nondet(a, b) for a, b in zip(left, right)]


_TEST_PATTERNS = [
    ("mocha", re.compile(r"(\d+) passing"), re.compile(r"(\d+) failing")),
    ("jest", re.compile(r"Tests:.*?(\d+) passed"), re.compile(r"Tests:.*?(\d+) failed")),
    ("vitest", re.compile(r"Tests\s+(?:\d+ failed \| )?(\d+) passed"),
     re.compile(r"Tests\s+(\d+) failed")),
    ("node:test", re.compile(r"^# pass (\d+)", re.M), re.compile(r"^# fail (\d+)", re.M)),
]


def _test_counts(run):
    """Best-effort pass/fail counts from the runner's own output.

    Deliberately parsed rather than requested: adding `--json` or a reporter flag
    to the project's command risks overriding a reporter the project configured,
    which is the failure mode that ruled out injecting `--setupFiles`. When a
    format is not recognised the counts are null and suite recall falls back to
    whether both runs exited the same way.
    """
    text = (run.get("stdout") or "") + "\n" + (run.get("stderr") or "")
    for _name, passing, failing in _TEST_PATTERNS:
        match = passing.search(text)
        if not match:
            continue
        fail_match = failing.search(text)
        return {"passed": int(match.group(1)),
                "failed": int(fail_match.group(1)) if fail_match else 0}
    return None


def suite_recall(tests_reference, tests_candidate, exit_match):
    """Fraction of tests the original bundle passed that still pass on the candidate.

    Extra failures on the candidate, beyond those already present on the bundle,
    are treated as originally-passing tests that broke. Tests the bundle itself
    failed are not charged to the candidate. Without parsed counts, fall back to
    whether both runs exited the same way.
    """
    if not tests_reference or tests_reference.get("passed") is None:
        return 1.0 if exit_match else 0.0
    if not tests_candidate or tests_candidate.get("passed") is None:
        return 1.0 if exit_match else 0.0
    ref_pass = int(tests_reference["passed"])
    cand_pass = int(tests_candidate["passed"])
    if ref_pass <= 0:
        return 1.0 if exit_match else 0.0
    ref_fail = int(tests_reference.get("failed") or 0)
    cand_fail = int(tests_candidate.get("failed") or 0)
    extra_fail = max(0, cand_fail - ref_fail)
    still_pass = min(cand_pass, max(0, ref_pass - extra_fail))
    return min(1.0, still_pass / float(ref_pass))


def combine_score(behaviour_match, suite_recall_value):
    """Headline is originally-passing tests that still pass (a fraction).

    ``behaviour_match`` is recorded for diagnosis and is ignored here. Using
    the export-surface prefix as a score (or as a gate on 1.0) collapses most
    subjects to 0 or 1; the test fraction is the number we actually want.
    """
    return float(suite_recall_value)


def trace_keys(run, roots, cfg, templates=None):
    flags = cfg.get("normalize", {})
    if templates is None:
        return [_key(e, roots, flags) for e in run["events"]]
    keys = []
    for i, event in enumerate(run["events"]):
        value = _normalize(event, roots, flags)
        if i < len(templates):
            value = _apply_template(value, templates[i])
        keys.append(_dump(value))
    return keys


def stability(first, second, roots, cfg):
    """Whether the subject's behaviour is reproducible run to run.

    Measured, not assumed. §3.2 requires that repeated runs of the same input
    agree, and some subjects do not: vitest interleaves calls from concurrent
    tests, so migrate-mongo's 4838-event trace comes back with the same events
    in a different order every time. Comparing such a trace as a sequence would
    score a perfect candidate at 0.0002.

    Outcomes, in decreasing strength: identical (compare as a sequence),
    same events in a different order (compare as a multiset), same call
    sequence with noisy values (mask the disagreeing leaves, still sequence),
    or a different call sequence (nothing can be measured).
    """
    first_keys = trace_keys(first, roots, cfg)
    second_keys = trace_keys(second, roots, cfg)
    identical = first_keys == second_keys
    same_multiset = Counter(first_keys) == Counter(second_keys)
    templates = None if identical or same_multiset else _mask_templates(
        first, second, roots, cfg)
    masked = templates is not None
    if identical:
        mode = "sequence"
    elif same_multiset:
        mode = "multiset"
    elif masked:
        mode = "sequence"
    else:
        mode = "unstable"
    return {
        "identical": identical,
        "same_multiset": same_multiset,
        "masked": masked,
        "mode": mode,
        "events_first": len(first_keys),
        "events_second": len(second_keys),
    }


def compare(reference, candidate, roots, cfg, mode="sequence"):
    """Score a candidate run against the reference run."""
    templates = None
    if (reference.get("stability") or {}).get("masked") and reference.get("events_repeat"):
        templates = _mask_templates(
            reference, {"events": reference["events_repeat"]}, roots, cfg)
    if templates is not None:
        ref_keys = [_dump(t) for t in templates]
        cand_keys = trace_keys(candidate, roots, cfg, templates=templates)
    else:
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

    tests_reference = _test_counts(reference)
    tests_candidate = _test_counts(candidate)
    suite = suite_recall(tests_reference, tests_candidate, exit_match)

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
        "tests_reference": tests_reference,
        "tests_candidate": tests_candidate,
        "suite_recall": round(suite, 6),
        "timed_out": candidate["timed_out"],
        "nondet_masked": bool(templates is not None),
    }


# --------------------------------------------------------------------------- #
# the reference run, cached
# --------------------------------------------------------------------------- #

def reference_run(subject, view, cfg, refresh=False, keep=False):
    """Run the subject's tests against its own reference bundle.

    Cached per (subject, bundle checksum): it is identical for every prediction
    of that subject, and it is the expensive half of the measurement.

    This run is also the admission gate, but the bar is *a usable trace*, not a
    green suite. The oracle is differential: the reference run defines the
    expected behaviour, and both runs go through the same substitution, so a
    test that fails for the reference fails identically for the candidate and
    the two traces still align.

    That distinction decides whether the harness keeps a subject or throws it
    away. The bundle inlines the subject's first-party modules, which duplicates
    anything the project's tests compare by identity — an error class checked
    with `instanceof`, a React context read through a provider. Requiring a
    green suite discarded 17 of 44 subjects on that alone, including one where
    184 of 185 tests passed and the failure was two structurally identical error
    classes. What genuinely cannot be measured is a reference run that produced
    no trace: then the module never really ran, and there is nothing to compare
    against. `reference_suite_green` records the difference so an analysis can
    filter on it.
    """
    # Named `reference-run.json` rather than `reference.json`: the box already
    # has a `reference.json` at its top level, recording whether the sandbox's
    # oracle suite starts. Two different schemas one directory apart under one
    # name is a trap for whoever greps next.
    cache_path = view.work / "reference-run.json"
    digest = sha256(subject.bundle)
    tracer = tracer_digest()
    roots = view.normalize_roots()
    if cache_path.exists() and not refresh:
        try:
            cached = json.loads(cache_path.read_text(encoding="utf-8"))
            # All three keys are required. The bundle checksum catches a changed
            # subject; the tracer checksum catches a changed *serialisation*,
            # which would otherwise compare a candidate's new-format trace
            # against a reference's cached old-format one and report every
            # difference as the candidate's fault; the layout tag catches a
            # reference recorded somewhere else entirely, whose events carry
            # paths this run's normalisation has never heard of. Each was added
            # after the corresponding failure was silent.
            if (cached.get("bundle_sha256") == digest
                    and cached.get("tracer_sha256") == tracer
                    and cached.get("layout") == oracleview.LAYOUT
                    and cached.get("stability_version") == STABILITY_VERSION):
                return cached["run"]
        except (ValueError, KeyError):
            pass

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
    if run["usable"] and run["events"]:
        with _ScopeLock(view.lock_scope()):
            repeat = run_once(subject, view, subject.bundle, cfg, "reference2", keep=keep)
        run["stability"] = stability(run, repeat, roots, cfg)
        if run["stability"].get("masked"):
            run["events_repeat"] = repeat.get("events") or []
        if run["stability"]["mode"] == "unstable":
            run["usable"] = False
            run["error"] = ("the subject does not behave reproducibly: two runs of "
                            "the reference bundle produced different events (%d vs %d)"
                            % (run["stability"]["events_first"],
                               run["stability"]["events_second"]))
    else:
        run["stability"] = {"identical": True, "same_multiset": True,
                            "masked": False,
                            "mode": "sequence", "events_first": len(run["events"]),
                            "events_second": len(run["events"])}
    cache_path.parent.mkdir(parents=True, exist_ok=True)
    cache_path.write_text(json.dumps({"bundle_sha256": digest, "tracer_sha256": tracer,
                                      "layout": oracleview.LAYOUT,
                                      "stability_version": STABILITY_VERSION,
                                      "run": run},
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
    if not reference.get("usable"):
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
    timeout = None
    if anti:
        # The short leash is for infinite-loop self-defending code. It must
        # not be shorter than the reference suite itself: websocket.test.js
        # needs tens of seconds even on the original bundle, and a 15s cap
        # would mark every candidate `defense_triggered`.
        defense = int(cfg.get("defense_timeout_sec", 15) or 15)
        try:
            ref_elapsed = float(reference.get("elapsed_sec") or 0)
        except (TypeError, ValueError):
            ref_elapsed = 0.0
        timeout = max(defense, int(ref_elapsed) + 30)

    with _ScopeLock(view.lock_scope()):
        candidate = run_once(subject, view, candidate_path, cfg, "candidate",
                             keep=keep, timeout=timeout)

    if candidate["error"]:
        return schema.STATUS_OK, {"score": 0.0, "reason": candidate["error"],
                                  "exit_code_candidate": candidate["exit_code"]}

    defense = _defense_signal(reference, candidate, anti, config_id, view)
    if defense is not None:
        return schema.STATUS_DEFENSE, defense

    mode = (reference.get("stability") or {}).get("mode", "sequence")
    detail = compare(reference, candidate, view.normalize_roots(), cfg, mode=mode)
    if candidate["timed_out"]:
        detail["score"] = 0.0
        return schema.STATUS_TIMEOUT, detail

    detail["score"] = round(
        combine_score(detail["behaviour_match"], detail["suite_recall"]), 6)

    if detail["behaviour_match"] is None:
        # The tests exercise the module without calling its exports directly —
        # a React component rendered by JSX, for instance. There is no trace to
        # compare, so the oracle is the tests the original bundle passed.
        detail["reason"] = "no traced calls; scored on tests the original bundle passed"
        return schema.STATUS_DEGRADED, detail

    notes = []
    if detail["suite_recall"] < 1.0:
        notes.append("tests the original bundle passed did not all pass on the candidate")
    if mode == "multiset":
        notes.append("the subject's call order is not reproducible; "
                     "trace compared as event overlap rather than sequence")
        if notes:
            detail["reason"] = "; ".join(notes)
        return schema.STATUS_DEGRADED, detail
    if notes:
        detail["reason"] = notes[0]
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
