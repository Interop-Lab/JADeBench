"""Simplification (paper §3.2): how much structure the system removed.

Two formulations are reported.

`jsdeobs` is JsDeObsBench Equation 1, the score that paper's leaderboard calls
decomplexity:

    S = 1 - HLoC(candidate) / HLoC(obfuscated)

HLoC is Halstead length (total operators + total operands). Only programs that
parse are scored — the same syntax gate their pipeline applies before
simplification. An empty or unparseable return is `null`, not ~1.

`rel_obf` / `anchored` keep the earlier reduction-vector formulation so stored
scores remain re-interpretable. `anchored` is 1.0 when the candidate matches
the original's complexity; it clusters near 1 whenever a system actually
recovers the program, which is why `jsdeobs` is the number to compare across
systems.
"""
from evallib import jsast

# `max_depth` is measured and reported but carries weight 0 by default
# (config/eval.json). It does not survive contact with this obfuscation suite as
# a strength signal: on 26 of 57 scored records the obfuscated build was no
# deeper than the original, and its median inflation is 1.17x against 6.10x for
# `ast_nodes`, so a third of the weight went to a near-constant term appearing
# in both numerator and denominator.
#
# Dropping it is a small correction, not a large one, and it is worth being
# exact about that: per-system median `anchored` moves by at most 0.02 on the
# pilot. Where it shows is over-deletion, which is what `anchored` exists to
# expose — the empty program's overshoot falls from 3.45 to 1.86. It stays in
# the vector so a stored score can be re-weighted without re-parsing.
COMPONENTS = ("ast_nodes", "cyclomatic", "max_depth")


def complexity_vector(code):
    if code is None:
        return None
    tree = jsast.parse(code)
    vector = jsast.complexity(tree)
    vector["loc"] = jsast.loc(code)
    # Bytes, not lines, is what `size_ratio` is derived from. Every obfuscated
    # build in the suite is emitted with `compact: true`, so its `loc` is 1 and
    # a line-based ratio measures the compactor rather than the system: across
    # the scored predictions it ranged from 44 to 24384. `loc` stays in the
    # vector because it describes the program, but nothing is divided by it.
    vector["bytes"] = len(code.encode("utf-8"))
    vector["parses"] = not jsast.syntax_errors(tree)
    return vector


def evaluate(candidate_code, obfuscated_code, original_code, cfg=None,
             parses=None):
    """Score a candidate against the build it was given and the original.

    Returns None when there is no obfuscated input to measure against — during
    corpus bring-up there are no builds yet, and a fabricated baseline would be
    worse than an absent score.

    `parses` is the syntax evaluator's parse bit when the caller already has
    it. When omitted, this module asks the same tree-sitter the other static
    evaluators use. Empty source is treated as not parsing, matching
    JsDeObsBench's `is_valid_js`.
    """
    cfg = cfg or {}
    weights = cfg.get("weights") or dict((c, 1.0 / len(COMPONENTS)) for c in COMPONENTS)
    eps = cfg.get("epsilon", 1e-9)

    if obfuscated_code is None:
        return None

    v_obf = complexity_vector(obfuscated_code)
    v_cand = complexity_vector(candidate_code)
    v_orig = complexity_vector(original_code)

    result = {
        "complexity_obfuscated": v_obf,
        "complexity_candidate": v_cand,
        "complexity_original": v_orig,
        "c_candidate": None,
        "c_original": None,
        "rel_obf": None,
        "anchored": None,
        "over_simplified": None,
        "size_ratio": None,
        "jsdeobs": None,
        "jsdeobs_original": None,
    }
    if v_cand is None:
        return result

    c_cand = _scaled(v_cand, v_obf, weights, eps)
    result["c_candidate"] = round(c_cand, 6)
    result["rel_obf"] = round(1.0 - c_cand, 6)
    # Same denominator as the obfuscation stage's own `size_inflation`
    # (obfuscators/scripts/03_metrics.py), so the two are comparable: that one
    # is obfuscated ÷ original, this one is candidate ÷ obfuscated.
    if v_obf.get("bytes"):
        result["size_ratio"] = round(v_cand["bytes"] / float(v_obf["bytes"]), 6)

    if v_orig is not None:
        c_orig = _scaled(v_orig, v_obf, weights, eps)
        result["c_original"] = round(c_orig, 6)
        result["over_simplified"] = bool(c_cand < c_orig)
        span = 1.0 - c_orig  # C(obfuscated) is 1 by construction
        # A build no more complex than the original leaves nothing to undo, so
        # there is no scale on which to express progress.
        if abs(span) > 1e-6:
            result["anchored"] = round((1.0 - c_cand) / span, 6)

    h_obf = float(v_obf.get("halstead_length") or 0)
    if h_obf > eps:
        if v_orig is not None:
            result["jsdeobs_original"] = round(
                1.0 - float(v_orig.get("halstead_length") or 0) / h_obf, 6)
        cand_parses = _candidate_parses(candidate_code, v_cand, parses)
        if cand_parses:
            result["jsdeobs"] = round(
                1.0 - float(v_cand.get("halstead_length") or 0) / h_obf, 6)
    return result


def _candidate_parses(code, vector, parses):
    if code is None or not str(code).strip():
        return False
    if parses is not None:
        return bool(parses)
    return bool(vector.get("parses"))


def _scaled(vector, reference, weights, eps):
    """Weighted mean of component ratios, renormalised over usable components.

    A component the reference measures as zero carries no information about the
    candidate, so it is dropped rather than divided by epsilon — which would
    otherwise let a rounding artefact dominate the whole score.
    """
    total_weight = 0.0
    total = 0.0
    for name in COMPONENTS:
        denominator = float(reference.get(name, 0) or 0)
        if denominator <= eps:
            continue
        weight = float(weights.get(name, 0.0))
        total += weight * (float(vector.get(name, 0) or 0) / denominator)
        total_weight += weight
    if total_weight <= eps:
        return 0.0
    return total / total_weight
