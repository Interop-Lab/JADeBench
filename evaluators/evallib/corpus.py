"""Corpus access: the manifest, and where a subject's files live.

The corpus pipeline writes `manifest.jsonl` with paths in two different frames
(`bundle_path` is relative to the corpus root, `module` and `test_file` are
relative to the project checkout), so every consumer that resolves them by hand
gets one of them wrong eventually. `Subject` resolves all of them once.
"""
import json
import os
import re
from pathlib import Path

EVAL_ROOT = Path(__file__).resolve().parent.parent
ARTIFACTS = EVAL_ROOT.parent
DEFAULT_CORPUS = ARTIFACTS / "corpus"
DEFAULT_SANDBOX = ARTIFACTS / "sandbox"
DEFAULT_OBFUSCATORS = ARTIFACTS / "obfuscators"


def corpus_root():
    """The corpus directory. ADB_CORPUS overrides, for a relocated artifact."""
    return Path(os.environ.get("ADB_CORPUS", DEFAULT_CORPUS)).resolve()


def sandbox_root():
    """The sandbox directory, where execution scoring actually runs."""
    return Path(os.environ.get("ADB_SANDBOX", DEFAULT_SANDBOX)).resolve()


def obfuscators_root():
    """The obfuscation stage, source of builds.jsonl."""
    return Path(os.environ.get("ADB_OBFUSCATORS", DEFAULT_OBFUSCATORS)).resolve()


_BOX_INDEX = None


def box_index():
    """subject_id -> sandbox directory.

    Read from the builder's own record rather than re-derived. The builder's
    slug (`re.sub(r"[^\\w.@-]+", "_", sid)`) collapses runs of separators and so
    is not injective in principle, which is why `baselines/lib/common.py` reads
    the recorded mapping too. Two implementations of one normalisation is how a
    subject silently gets scored in another subject's sandbox.
    """
    global _BOX_INDEX
    if _BOX_INDEX is None:
        stats = sandbox_root() / "stats" / "sandboxes.json"
        if not stats.exists():
            raise SystemExit(
                "sandbox stats not found at %s — run sandbox/scripts/build_sandboxes.py "
                "first, or point ADB_SANDBOX at the sandbox root." % stats)
        rows = json.loads(stats.read_text(encoding="utf-8"))["results"]
        _BOX_INDEX = dict((r["subject_id"], sandbox_root() / r["path"])
                          for r in rows if r.get("ok"))
    return _BOX_INDEX


def oracle_usable_set():
    """Subjects whose sandbox oracle actually runs test cases.

    This is *not* the same criterion as the evaluators' own `unsupported`: the
    sandbox asks whether the suite started, this harness asks whether the module
    produced a trace, and neither contains the other. Both denominators have to
    be reported, and conflating them would let a runtime limit read as a system
    failure.
    """
    ref = sandbox_root() / "stats" / "reference.json"
    if not ref.exists():
        return set()
    return set(r["subject_id"] for r in json.loads(ref.read_text(encoding="utf-8"))
               if r.get("oracle_usable"))


def load_config(name="eval.json"):
    return json.loads((EVAL_ROOT / "config" / name).read_text(encoding="utf-8"))


def read_jsonl(path):
    path = Path(path)
    if not path.exists():
        return []
    out = []
    with path.open(encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if line:
                out.append(json.loads(line))
    return out


def write_jsonl(path, rows):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as fh:
        for row in rows:
            fh.write(json.dumps(row, ensure_ascii=False) + "\n")


def append_jsonl(path, row):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as fh:
        fh.write(json.dumps(row, ensure_ascii=False) + "\n")


def sanitize(subject_id):
    """Directory-safe form of a subject id.

    Matches the corpus pipeline's own convention (05_coverage.py:110) so that a
    subject's evaluation artifacts sit beside its coverage artifacts under the
    same name.
    """
    return re.sub(r"[^A-Za-z0-9_.:-]", "_", subject_id.replace("/", "_"))[-80:]


_UNSET = object()


class Subject(object):
    """One manifest record with its paths resolved."""

    def __init__(self, record, root=None):
        self.record = record
        self.root = Path(root) if root else corpus_root()
        self._view = _UNSET

    def __getitem__(self, key):
        return self.record[key]

    def get(self, key, default=None):
        return self.record.get(key, default)

    @property
    def id(self):
        return self.record["subject_id"]

    @property
    def slug(self):
        return sanitize(self.id)

    @property
    def project_dir(self):
        """The installed checkout: work/<owner>__<repo>."""
        return self.root / "work" / self.record["project"].replace("/", "__")

    @property
    def bundle(self):
        """The reference program: the un-obfuscated subject bundle."""
        return self.root / self.record["bundle_path"]

    @property
    def module(self):
        """The original module inside the checkout, i.e. what tests import."""
        return self.project_dir / self.record["module"]

    @property
    def test_file(self):
        return self.project_dir / self.record["test_file"]

    @property
    def module_format(self):
        """The format the *bundle* was emitted in.

        Not the same thing as the module's own flavour, and not a substitute for
        it: the manifest can say `cjs` while the module's source is ESM,
        because the corpus emits every bundle in the format the
        project's tooling resolves. The shim has to match the file it replaces,
        so `execution.module_flavour()` reads the module, not this.
        """
        return self.record.get("module_format")

    @property
    def platform(self):
        """esbuild platform for this subject: node, browser, or neutral.

        Distinct from the sandbox's `runtime` field, which describes the agent
        view's host emulation and disagrees with this on 24-odd subjects in both
        directions. This one is what the bundle was built for.
        """
        return self.record.get("platform")

    @property
    def eval_dir(self):
        """Scratch space for this subject, inside its project checkout.

        Retained only to read caches written before execution scoring moved into
        the sandbox; nothing writes here now. See `evallib/oracleview.py`.
        """
        return self.project_dir / ".adb-eval" / self.slug

    @property
    def view(self):
        """The sandbox oracle view this subject's tests run in, or None."""
        if self._view is _UNSET:
            from . import oracleview
            self._view = oracleview.for_subject(self)
        return self._view

    def is_runnable(self):
        """Whether everything an execution run needs is present.

        The checkout still matters after the move into the sandbox, but only as
        a read-only input: `module` decides the shim's module flavour and
        `bundle` is the reference program. Where the tests *run* is the view.
        """
        if not (self.module.exists() and self.bundle.exists()):
            return False
        view = self.view
        return view is not None and view.mountable()[0]

    def unrunnable_reason(self):
        """Why `is_runnable()` is false, in words that name the stage to re-run."""
        if not self.bundle.exists():
            return "the subject bundle is missing; run the corpus pipeline"
        if not self.module.exists():
            return "the project checkout is missing; run the corpus pipeline"
        view = self.view
        if view is None:
            return ("no sandbox was built for this subject; run "
                    "sandbox/scripts/build_sandboxes.py")
        return view.mountable()[1]


def load_manifest(root=None, path=None):
    root = Path(root).resolve() if root else corpus_root()
    path = Path(path) if path else root / "manifest.jsonl"
    if not path.exists():
        raise SystemExit(
            "manifest not found at %s — run the corpus pipeline first "
            "(corpus/run_all.sh), or point ADB_CORPUS at the corpus root." % path)
    return [Subject(r, root) for r in read_jsonl(path)]


def index_manifest(root=None, path=None):
    return dict((s.id, s) for s in load_manifest(root, path))
