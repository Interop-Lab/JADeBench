"""The records that flow between the benchmark's stages.

Three files define the interface between obfuscation, the evaluated systems, and
the evaluators. They are deliberately flat JSONL: a system under evaluation only
has to append a line and drop a file, and a partially complete run is still a
valid input.

    builds.jsonl       one obfuscated program: subject × tier × configuration
    predictions.jsonl  one returned program: build × system
    scores.jsonl       one evaluated prediction (this package's output)

Paths inside a record are resolved relative to the file that contained it, so a
prediction set can be moved as a directory without rewriting it.
"""
from pathlib import Path

from .corpus import read_jsonl

STATUS_OK = "ok"                    # scored normally
STATUS_UNSUPPORTED = "unsupported"  # the harness cannot evaluate this subject
STATUS_DEGRADED = "degraded"        # scored, but with a weaker execution oracle
STATUS_ERROR = "harness_error"      # the evaluator itself failed
STATUS_TIMEOUT = "timeout"
# The build's own anti-analysis code defeated the measurement, not the system.
# Named to match `obfuscators/scripts/02_admit.py`, which already rejects builds
# with `reason: "defense_triggered"` for the same observation.
STATUS_DEFENSE = "defense_triggered"

REQUIRED_BUILD = ("build_id", "subject_id")
REQUIRED_PREDICTION = ("prediction_id", "subject_id")


class RecordError(ValueError):
    pass


def _resolve(base, value):
    path = Path(value)
    return path if path.is_absolute() else (Path(base).parent / path).resolve()


class Build(object):
    """An obfuscated program: what a system is given."""

    def __init__(self, record, source_file):
        for key in REQUIRED_BUILD:
            if not record.get(key):
                raise RecordError("build record missing %r: %r" % (key, record))
        self.record = record
        self.id = record["build_id"]
        self.subject_id = record["subject_id"]
        self.tier = record.get("tier")
        self.tool = record.get("tool")
        self.config_id = record.get("config_id")
        self.seed = record.get("seed")
        self.module_format = record.get("module_format")
        # How this build earned its place in the tier. `oracle` means the
        # subject's own suite re-ran and matched the reference; `L1_exports`
        # means only that the build loads and exports the same symbols, because
        # the subject has no usable oracle. 150 of the 1295 builds are the
        # latter, and behaviour equivalence was never established for them — so
        # the `identity` oracle's "must score 1.0 on execution" expectation does
        # not apply to those, and an analysis has to be able to exclude them.
        self.admit_mode = record.get("admit_mode")
        # Measured by the obfuscation stage against the clean bundle. Carried
        # through rather than recomputed: the two stages use different
        # complexity definitions on purpose (this one is a per-KB strength
        # score, the simplification evaluator's is a reduction vector), and
        # recomputing either here would quietly create a third.
        self.complexity = record.get("complexity")
        self.size_inflation = record.get("size_inflation")
        self.path = _resolve(source_file, record["path"]) if record.get("path") else None

    def code(self):
        return self.path.read_text(encoding="utf-8", errors="replace") if self.path and self.path.exists() else None


class Prediction(object):
    """A returned program: what a system produced, and what it cost."""

    def __init__(self, record, source_file):
        for key in REQUIRED_PREDICTION:
            if not record.get(key):
                raise RecordError("prediction record missing %r: %r" % (key, record))
        if not record.get("path") and record.get("code") is None:
            raise RecordError("prediction %r has neither `path` nor inline `code`"
                              % record["prediction_id"])
        self.record = record
        self.id = record["prediction_id"]
        self.subject_id = record["subject_id"]
        self.build_id = record.get("build_id")
        self.system = record.get("system")
        self.level = record.get("level")
        self.cost = record.get("cost") or {}
        self.model = record.get("model")
        self.path = _resolve(source_file, record["path"]) if record.get("path") else None
        self._inline = record.get("code")

    # Diagnostics the drivers in `baselines/` attach to a prediction. They say
    # nothing about the returned program's quality, which is why the evaluators
    # stay blind to them while scoring — but an analysis cannot interpret a low
    # score without them. A system whose input was truncated, whose tool call
    # failed, or whose debugger was defeated by the build's own defences did not
    # fail in the same way as one that simply answered badly, and dropping these
    # on the floor made the two indistinguishable in scores.jsonl.
    DIAGNOSTICS = ("defense_events", "defense_reasons", "input_truncated",
                   "tool_ok", "tool_error", "call_failed", "driver_error",
                   "tool_protocol", "oracle", "scaffold_note")

    def diagnostics(self):
        found = dict((k, self.record[k]) for k in self.DIAGNOSTICS
                     if self.record.get(k) is not None)
        return found or None

    def code(self):
        """The returned program, or None if the file is missing.

        A missing file is not an error here: a system that failed to produce
        anything is a result, and it is scored as such rather than skipped.
        """
        if self._inline is not None:
            return self._inline
        if self.path and self.path.exists():
            return self.path.read_text(encoding="utf-8", errors="replace")
        return None


def load_builds(path):
    path = Path(path)
    return dict((b.id, b) for b in (Build(r, path) for r in read_jsonl(path)))


def load_predictions(path):
    path = Path(path)
    return [Prediction(r, path) for r in read_jsonl(path)]


def score_record(prediction, status=STATUS_OK, syntax=None, execution=None,
                 simplification=None, similarity=None, identifier=None,
                 note=None, build=None):
    """One line of scores.jsonl.

    `identifier` is always present and always null in this release: the field is
    reserved so that adding identifier recovery later does not change the shape
    of records already produced.
    """
    return {
        "prediction_id": prediction.id,
        "subject_id": prediction.subject_id,
        "build_id": prediction.build_id,
        "system": prediction.system,
        "model": prediction.model,
        "level": prediction.level,
        "tier": build.tier if build is not None else None,
        "config_id": build.config_id if build is not None else None,
        "admit_mode": build.admit_mode if build is not None else None,
        "status": status,
        "syntax": syntax,
        "execution": execution,
        "simplification": simplification,
        "similarity": similarity,
        "identifier": identifier,
        "cost": prediction.cost,
        "diagnostics": prediction.diagnostics(),
        "note": note,
    }
