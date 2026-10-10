"""Simplification (paper §3.2): how much structure the system removed.

Complexity is the vector V = (ast_nodes, cyclomatic, max_depth), scaled so that
the obfuscated build sits at C = 1. Two scores come out of it, and the second is
the point of the module.

`rel_obf` = 1 - C(candidate) is the prior-work formulation, normalised against
the obfuscated input alone. It is biased in a way that matters here: it rewards
deletion without bound, so a system that returns an empty program scores near 1,
and it inflates with obfuscation strength because the denominator grows. It is
reported only because dropping it would make results incomparable with the
benchmark this one is measured against.

`anchored` divides the same reduction by the reduction the original actually
represents, so 1.0 means "as simple as the developer's program" rather than "as
simple as possible", and over-deletion overshoots and is flagged instead of
rewarded.
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
    vector = jsast.complexity(jsast.parse(code))
    vector["loc"] = jsast.loc(code)
    # Bytes, not lines, is what `size_ratio` is derived from. Every obfuscated
    # build in the suite is emitted with `compact: true`, so its `loc` is 1 and
    # a line-based ratio measures the compactor rather than the system: across
    # the scored predictions it ranged from 44 to 24384. `loc` stays in the
    # vector because it describes the program, but nothing is divided by it.
    vector["bytes"] = len(code.encode("utf-8"))
    return vector


def evaluate(candidate_code, obfuscated_code, original_code, cfg=None):
    """Score a candidate against the build it was given and the original.

    Returns None when there is no obfuscated input to measure against — during
    corpus bring-up there are no builds yet, and a fabricated baseline would be
    worse than an absent score.
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
    return result


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
