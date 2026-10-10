"""Where a subject's tests run: the sandbox's per-subject oracle view.

Execution scoring used to substitute the candidate directly into
`corpus/work/<project>/<module>`, which made the evaluators the only consumer in
the artifact that wrote into the corpus. Everything else in the pipeline already
worked against `sandbox/sandboxes/<box>/`: differential admission
(`obfuscators/scripts/02_admit.py`) drives `sandbox/scripts/score.py`, and the
agent ladder mounts through `baselines/lib/mount.py`. Scoring is now in the same
place, so the corpus checkout is a read-only input rather than shared mutable
state, and a crash can damage at most one box.

Two things do *not* move, and keeping them still is what makes "the scores did
not change" a checkable claim rather than a hope:

  * the shim's module flavour still comes from `corpus/work/<project>/<module>`,
    the file the shim stands in for. The manifest's `module_format` describes
    the *bundle* and disagrees with the module's own source on 59 of 171
    subjects, so reading it here would silently reformat a third of the corpus.
  * the esbuild platform still comes from the manifest's `platform`, not from
    `sandbox.json`'s `runtime`. The latter describes the agent view's host
    emulation and disagrees with `platform` on 24-odd subjects in both
    directions.

What the box decides is only *where to substitute and how to run*.
"""
import json
import os
from pathlib import Path

from . import corpus

# Bumped when the on-disk shape of a run changes in a way that makes a cached
# reference from an older layout uncomparable. It is part of the reference cache
# key, so an old cache can never be served to a new run — the same guard the
# tracer checksum provides against a changed serialisation.
LAYOUT = "oracle-view/1"

SCRATCH_DIRNAME = ".adb-eval"


def for_subject(subject):
    """The oracle view for a subject, or None if no sandbox was built for it."""
    box = corpus.box_index().get(subject.id)
    if box is None or not (box / "sandbox.json").exists():
        return None
    meta = json.loads((box / "sandbox.json").read_text(encoding="utf-8"))
    return OracleView(box, meta)


class OracleView(object):
    """One sandbox's oracle view: a per-subject reconstruction of the project.

    It holds the project's `package.json`, a symlink to the project's whole
    `node_modules`, the runner and setup configuration, and the test file's
    first-party import closure — everything at its original project-relative
    path, so the tests resolve the module exactly as they always did. It does
    not hold unrelated sibling sources, which is the one way it is weaker than
    the checkout.
    """

    def __init__(self, box, meta):
        self.box = Path(box)
        self.meta = meta
        self._oracle = meta.get("oracle") or {}

    # --- identity ---------------------------------------------------------- #

    @property
    def subject_id(self):
        return self.meta.get("subject_id")

    @property
    def name(self):
        """The box directory name. Already unique — no slug is derived here."""
        return self.box.name

    # --- the run's filesystem ---------------------------------------------- #

    @property
    def root(self):
        return self.box / self.meta.get("oracle_dir", "oracle")

    @property
    def slot(self):
        """The path the candidate occupies: the module's original location.

        Empty by construction — `build_sandboxes.py::collect_test_closure`
        excludes the module under test, because the module is the thing being
        substituted. Anything found here is a previous mount.
        """
        return self.root / self.entry

    @property
    def entry(self):
        return self._oracle.get("entry") or self.meta.get("entry")

    @property
    def slot_dir(self):
        return self.slot.parent

    @property
    def cwd(self):
        return self.root

    @property
    def work(self):
        """Scratch root for this box.

        A third namespace beside `.adb-baseline/` (the agent ladder's) and the
        `oracle/<entry>.reference` sidecars `sandbox/scripts/score.py` leaves
        behind, so no two stages can tread on each other's state.
        """
        path = self.box / SCRATCH_DIRNAME
        path.mkdir(parents=True, exist_ok=True)
        return path

    @property
    def parked(self):
        """Where a pre-existing occupant of the slot is held during a run."""
        return self.work / "preexisting"

    # --- the test command -------------------------------------------------- #

    @property
    def invocation(self):
        return self._oracle.get("invocation")

    @property
    def runner(self):
        return self._oracle.get("runner")

    @property
    def test_rel(self):
        return self._oracle.get("test_file")

    @property
    def test_file(self):
        rel = self.test_rel
        return (self.root / rel) if rel else None

    def env(self, extra=None):
        """Environment for the test run.

        Mirrors `sandbox/scripts/score.py` exactly — including the `shared/`
        fallback on PATH — so a subject that ran there runs here. npm puts
        `node_modules/.bin` on PATH when it runs a script; invoking the command
        directly skips that, and a bare `mocha` would not resolve.
        """
        env = dict(os.environ)
        env["CI"] = "1"
        env["PATH"] = os.pathsep.join([
            str(self.root / "node_modules" / ".bin"),
            str(corpus.sandbox_root() / "shared" / "node_modules" / ".bin"),
            env.get("PATH", ""),
        ])
        if extra:
            env.update(extra)
        return env

    # --- locking ----------------------------------------------------------- #

    def lock_scope(self):
        """The directory owning the resource two concurrent runs can collide on.

        Not the box. `oracle/node_modules` is a symlink into
        `corpus/work/<project>/node_modules`, so every box of a project shares
        one dependency tree inode-for-inode — and the runners write into it.
        Present in this artifact's own checkouts: `node_modules/.cache/nyc`
        (websockets/ws alone has 9 subjects), `.cache/@babel`,
        `.cache/mongodb-memory-server`, and vite's `.vite` plus `.vite-temp`,
        whose fixed-name staging files two concurrent processes rename out from
        under each other.

        Only 5 projects carry such a directory today, but absence is not proof:
        nyc's and babel's caches are created on first use, so a policy that
        probed for them would lose mutual exclusion exactly when a project runs
        for the first time. Keying on the resolved `node_modules` is correct by
        construction instead, costs nothing relative to the previous per-project
        lock, and degenerates to per-box automatically if a box ever gets a
        private dependency tree.
        """
        node_modules = self.root / "node_modules"
        try:
            if node_modules.exists():
                return node_modules.resolve().parent
        except OSError:
            pass
        return self.box

    # --- gating ------------------------------------------------------------ #

    def mountable(self):
        """(True, None), or (False, reason) naming the stage that has to re-run."""
        if not self.box.exists():
            return False, "the subject's sandbox directory is missing"
        if not self._oracle.get("available"):
            return False, ("the sandbox has no oracle view (the corpus captured "
                           "no test file for this subject)")
        if not self.root.exists():
            return False, "the sandbox's oracle view is missing"
        if not self.entry:
            return False, "the sandbox records no oracle entry point"
        test_file = self.test_file
        if test_file is None or not test_file.exists():
            return False, "the oracle view's test file is missing"
        if not (self.root / "node_modules").exists():
            return False, ("the oracle view's node_modules link does not resolve; "
                           "the project checkout it points at may be gone")
        return True, None

    # --- trace comparison -------------------------------------------------- #

    def normalize_roots(self):
        """Path prefixes to fold out of a trace before comparing it.

        Longest first, because `_normalize_text` replaces in list order and a
        shorter root that prefixes a longer one would eat it — the corpus root
        would swallow `corpus/work/<project>` and leave the project-relative
        remainder in the trace.

        The corpus roots have to stay in the list even though the run happens in
        the sandbox: `oracle/node_modules` is a symlink, so `require.resolve`
        and stack frames for any dependency come back as *corpus* paths.
        """
        roots = [self.root, self.box, corpus.sandbox_root(), corpus.corpus_root()]
        node_modules = self.root / "node_modules"
        try:
            if node_modules.exists():
                roots.append(node_modules.resolve().parent)
        except OSError:
            pass
        return sorted(set(str(r) for r in roots), key=len, reverse=True)


def all_boxes():
    """Every built sandbox, for `--repair` and `--verify-clean`."""
    root = corpus.sandbox_root() / "sandboxes"
    if not root.exists():
        return []
    return sorted(d for d in root.iterdir() if (d / "sandbox.json").exists())
