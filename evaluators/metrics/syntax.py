"""Syntax correctness (paper §3.2).

The score is whether the returned program is syntactically valid. tree-sitter
must report no ERROR or MISSING node, and `node --check` must accept it. JSX
restored into a `.js` / `.cjs` / `.mjs` file fails both of those plain-JavaScript
checks; esbuild's JSX loader is the second opinion, and a program it accepts is
scored as valid. Export names are still recorded when a reference is available,
but they do not affect the score: an obfuscator can hide them in a string table
while the module still loads and runs.
"""
import tempfile
from pathlib import Path

from evallib import jsast, nodeenv


def evaluate(candidate_code, reference_code=None, cfg=None):
    cfg = cfg or {}
    result = {
        "parses": False,
        "node_check": None,
        "errors": [],
        "exports_expected": [],
        "exports_declared": [],
        "exports_missing": [],
        "score": 0,
    }
    if candidate_code is None:
        result["errors"] = [{"kind": "MISSING_OUTPUT",
                             "text": "the system returned no program"}]
        return result

    tree = jsast.parse(candidate_code)
    errors = jsast.syntax_errors(tree)
    result["errors"] = errors
    result["parses"] = not errors

    if cfg.get("cross_check_with_node", True):
        result["node_check"] = _node_check(candidate_code,
                                           cfg.get("node_check_timeout_sec", 30))

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

    if not (result["parses"] and result["node_check"] is not False):
        # tree-sitter's JavaScript grammar and `node --check` both reject JSX.
        # A deobfuscator that restores `<Component />` into a `.cjs` file is
        # still a syntactically valid program; esbuild is what the execution
        # harness uses to load it.
        if nodeenv.compiles_as_jsx(candidate_code):
            result["parses"] = True
            result["node_check"] = True
            result["jsx"] = True

    parses_ok = result["parses"] and result["node_check"] is not False
    result["score"] = 1 if parses_ok else 0
    return result


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
