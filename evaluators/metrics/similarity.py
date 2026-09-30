"""Similarity (paper §3.2): closeness to the original, as a readability proxy.

CodeBLEU without its dataflow component, reported as `codebleu3`. The omission
is deliberate rather than an approximation of convenience: CodeBLEU's dataflow
match is defined over a language-specific def-use extractor, and no validated
one exists for JavaScript's dynamic property access — an unsound fourth
component would move every score without anyone being able to say why. The three
implemented components are reported individually so a different weighting can be
applied to stored scores without re-running anything.

Similarity is a proxy and is treated as one. Execution correctness is the
primary measure; a program can be behaviourally perfect and textually distant.
"""
import difflib
import math
from collections import Counter

from evallib import jsast


def evaluate(candidate_code, original_code, cfg=None):
    cfg = cfg or {}
    weights = cfg.get("weights") or {"bleu": 1 / 3.0, "weighted_bleu": 1 / 3.0,
                                     "ast_match": 1 / 3.0}
    max_ngram = cfg.get("max_ngram", 4)
    keyword_weight = cfg.get("keyword_weight", 4.0)
    ast_orders = cfg.get("ast_ngram_orders", [1, 2, 3, 4])

    result = {"bleu": 0.0, "weighted_bleu": 0.0, "ast_match": 0.0,
              "token_ratio": 0.0, "codebleu3": 0.0}
    if candidate_code is None or original_code is None:
        return result

    cand_tree = jsast.parse(candidate_code)
    orig_tree = jsast.parse(original_code)

    cand_tokens = jsast.tokens(cand_tree)
    orig_tokens = jsast.tokens(orig_tree)

    result["bleu"] = round(_bleu(cand_tokens, orig_tokens, max_ngram), 6)
    result["weighted_bleu"] = round(
        _bleu(cand_tokens, orig_tokens, max_ngram,
              weight_fn=lambda tok: keyword_weight if tok in jsast.KEYWORDS else 1.0), 6)
    result["ast_match"] = round(
        _ngram_match(jsast.node_types(cand_tree), jsast.node_types(orig_tree),
                     ast_orders), 6)
    result["token_ratio"] = round(
        difflib.SequenceMatcher(None, cand_tokens, orig_tokens,
                                autojunk=False).ratio(), 6)

    result["codebleu3"] = round(
        weights.get("bleu", 0.0) * result["bleu"]
        + weights.get("weighted_bleu", 0.0) * result["weighted_bleu"]
        + weights.get("ast_match", 0.0) * result["ast_match"], 6)
    return result


def _ngrams(seq, n):
    if len(seq) < n:
        return Counter()
    return Counter(tuple(seq[i:i + n]) for i in range(len(seq) - n + 1))


def _bleu(candidate, reference, max_n, weight_fn=None):
    """Modified n-gram precision with a brevity penalty.

    Smoothed by adding one to both numerator and denominator for orders above 1
    (Chen & Cherry method 1). Without smoothing a single missing 4-gram zeroes
    the whole score, which makes the measure useless for ranking near-misses —
    exactly the regime deobfuscation output lives in.
    """
    if not candidate or not reference:
        return 0.0

    log_sum = 0.0
    for n in range(1, max_n + 1):
        cand_grams = _ngrams(candidate, n)
        ref_grams = _ngrams(reference, n)
        if weight_fn is None:
            overlap = sum(min(count, ref_grams[gram]) for gram, count in cand_grams.items())
            total = sum(cand_grams.values())
        else:
            overlap = 0.0
            total = 0.0
            for gram, count in cand_grams.items():
                weight = max(weight_fn(tok) for tok in gram)
                overlap += weight * min(count, ref_grams[gram])
                total += weight * count
        if total <= 0:
            return 0.0
        if n > 1:
            overlap += 1.0
            total += 1.0
        precision = overlap / total
        if precision <= 0:
            return 0.0
        log_sum += math.log(precision) / max_n

    brevity = 1.0
    if len(candidate) < len(reference):
        brevity = math.exp(1.0 - float(len(reference)) / max(len(candidate), 1))
    return brevity * math.exp(log_sum)


def _ngram_match(candidate, reference, orders):
    """Mean clipped n-gram overlap over node-type sequences (F1 per order).

    F1 rather than precision: precision alone rewards a candidate that returns a
    fragment of the original's structure, which is precisely what an
    over-deleting system produces.
    """
    scores = []
    for n in orders:
        cand_grams = _ngrams(candidate, n)
        ref_grams = _ngrams(reference, n)
        cand_total = sum(cand_grams.values())
        ref_total = sum(ref_grams.values())
        if not cand_total or not ref_total:
            scores.append(0.0)
            continue
        overlap = sum(min(count, ref_grams[gram]) for gram, count in cand_grams.items())
        precision = overlap / float(cand_total)
        recall = overlap / float(ref_total)
        scores.append(0.0 if precision + recall == 0
                      else 2 * precision * recall / (precision + recall))
    return sum(scores) / len(scores) if scores else 0.0
