"""Syntax correctness (paper §3.2).

Two questions, both required. Does the returned program parse? And does it still
present the module contract of the subject it replaces? The second is not
pedantry: a program that parses but drops an export cannot be substituted for
the subject, so the execution evaluator could never run it, and scoring it
correct would credit a system for an artifact nobody can use.
"""
import subprocess
import tempfile
from pathlib import Path

from evallib import jsast, nodeenv


def evaluate(candidate_code, reference_code=None, cfg=None):
    cfg = cfg or {}
    result = {
        "parses": False,
        "jsx": False,
        "node_check": None,
        "errors": [],
        "exports_expected": [],
        "exports_declared": [],
        "exports_missing": [],
        "score": 0,
    }
    if candidate_code is None or not candidate_code.strip():
        result["errors"] = [{"kind": "MISSING_OUTPUT",
                             "text": "the system returned no program"}]
        return result

    tree = jsast.parse(candidate_code)
    errors = jsast.syntax_errors(tree)
    result["errors"] = errors
    result["jsx"] = _has_jsx(tree)
    timeout = cfg.get("node_check_timeout_sec", 30)
    if result["jsx"]:
        # Node cannot parse JSX directly, and tree-sitter can report an ERROR
        # inside a valid JSX attribute. Validate the source with esbuild's JSX
        # parser and ask Node to check the transformed JavaScript instead.
        jsx_check = _jsx_check(candidate_code, timeout)
        result["parses"] = not errors or jsx_check is True
        if cfg.get("cross_check_with_node", True):
            result["node_check"] = jsx_check
    else:
        result["parses"] = not errors
        if cfg.get("cross_check_with_node", True):
            result["node_check"] = _node_check(candidate_code, timeout)

    declared = jsast.exported_names(tree)
    result["exports_declared"] = sorted(declared)
    if reference_code is not None and cfg.get("require_export_surface", True):
        expected = jsast.exported_names(jsast.parse(reference_code))
        result["exports_expected"] = sorted(expected)
        # `*` means "an unknown set", and which side it appears on decides what
        # can be concluded.
        #
        # On the candidate's side it covers anything, so nothing is missing:
        # `export *` or `module.exports = <computed>` may well re-export the
        # whole surface, and the run is what settles it.
        #
        # On the *reference's* side it is the opposite — the contract itself
        # could not be determined, so there is no requirement to check against.
        # It must not be carried into the required set: `expected - declared`
        # would leave `*` outstanding and fail every candidate on a subject
        # whose own surface is unreadable, which is a defect of the reference,
        # not of the answer. Six bundles are in that state (`var WebSocket =
        # require_websocket()` and friends), and `exports_unresolved` records
        # it so the pass is visibly an abstention rather than a silent one.
        required = expected - {"*"}
        result["exports_unresolved"] = "*" in expected
        missing = set() if "*" in declared else required - declared
        result["exports_missing"] = sorted(missing)

    parses_ok = result["parses"] and result["node_check"] is not False
    result["score"] = 1 if parses_ok and not result["exports_missing"] else 0
    return result


def parser_accepts(code, tree=None, timeout=30):
    """Similarity eligibility: parseable JavaScript, including valid JSX."""
    tree = tree or jsast.parse(code)
    if not jsast.syntax_errors(tree):
        return True
    return _has_jsx(tree) and _jsx_check(code, timeout) is True


def _has_jsx(tree):
    return any(node.type in ("jsx_element", "jsx_self_closing_element", "jsx_fragment")
               for node in jsast.walk(tree.root_node))


def _jsx_check(code, timeout):
    """Use the pinned esbuild JSX loader, then check the emitted JavaScript."""
    try:
        compiler = nodeenv.esbuild_bin()
        converted = subprocess.run(
            [str(compiler), "--loader=jsx", "--format=esm", "--log-level=error"],
            input=code, capture_output=True, text=True, timeout=timeout)
    except (nodeenv.ToolchainError, subprocess.TimeoutExpired, OSError):
        return None
    if converted.returncode != 0:
        return False
    path = None
    try:
        with tempfile.NamedTemporaryFile("w", suffix=".mjs", delete=False,
                                         encoding="utf-8") as fh:
            fh.write(converted.stdout)
            path = Path(fh.name)
        valid, _ = nodeenv.node_check(path, timeout=timeout)
        return valid
    finally:
        if path is not None:
            path.unlink(missing_ok=True)


def _node_check(code, timeout):
    """Ask Node whether it would accept the program.

    Written as `.mjs` because every subject bundle is ESM: checking it as a
    script would reject valid top-level `import`.
    """
    tmp = None
    try:
        with tempfile.NamedTemporaryFile("w", suffix=".mjs", delete=False,
                                         encoding="utf-8") as fh:
            fh.write(code)
            tmp = Path(fh.name)
        ok, _detail = nodeenv.node_check(tmp, timeout=timeout)
        return ok
    except Exception:  # noqa: BLE001 — a missing Node must not fail the score
        return None
    finally:
        if tmp is not None:
            try:
                tmp.unlink()
            except OSError:
                pass
