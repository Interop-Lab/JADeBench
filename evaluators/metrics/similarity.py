"""Similarity: reference resemblance, not a proof of readability/correctness.

Reports four-component CodeBLEU, the archived three-component CodeBLEU3 variant,
and exact JavaScript-token ROUGE-L F1. ROUGE-L is whole-module LCS, beta=1.

The primary ``codebleu`` field uses the pinned codebleu==0.7.0 package with
JavaScript leaf tokens and four equal weights. This tokenizer differs from
the package default used by JsDeObsBench. The previous CodeBLEU3 fields are
retained for audit but are not numerically interchangeable with CodeBLEU.

Similarity is a proxy and is treated as one. Execution correctness is the
primary measure; a program can be behaviourally perfect and textually distant.
"""
import difflib
import math
from collections import Counter

from evallib import jsast
from metrics import codebleu_recovery
from metrics import syntax


def evaluate(candidate_code, original_code, cfg=None, parse_status=None):
    cfg = cfg or {}
    weights = cfg.get("weights") or {"bleu": 1 / 3.0, "weighted_bleu": 1 / 3.0,
                                     "ast_match": 1 / 3.0}
    max_ngram = cfg.get("max_ngram", 4)
    keyword_weight = cfg.get("keyword_weight", 4.0)
    ast_orders = cfg.get("ast_ngram_orders", [1, 2, 3, 4])

    result = {"bleu": 0.0, "weighted_bleu": 0.0, "ast_match": 0.0,
              "token_ratio": 0.0, "codebleu3": 0.0, "codebleu": 0.0,
              "codebleu_r": 0.0,
              "rouge_l": 0.0, "rouge_l_precision": 0.0,
              "rouge_l_recall": 0.0,
              "rouge_l_policy": "javascript-leaf-tokens-lcs-f1-v1"}
    if candidate_code is None or original_code is None:
        return result

    cand_tree = jsast.parse(candidate_code)
    orig_tree = jsast.parse(original_code)

    # Both paper similarity metrics require a nonempty parser-accepted program.
    # The Syntax correctness axis also checks Node and the export surface; a
    # candidate can fail that broader axis and still receive similarity credit.
    if not candidate_code.strip() or not (
            parse_status if parse_status is not None
            else syntax.parser_accepts(candidate_code, cand_tree)):
        return result

    cand_tokens = jsast.tokens(cand_tree)
    orig_tokens = jsast.tokens(orig_tree)
    result.update(rouge_l(cand_tokens, orig_tokens))

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

    # Empty or parser-invalid outputs score zero with the fixed denominator.
    # The lexical components use JavaScript tokens.
    from codebleu import calc_codebleu

    upstream = calc_codebleu(
        references=[original_code], predictions=[candidate_code],
        lang="javascript", weights=(0.25, 0.25, 0.25, 0.25),
        tokenizer=lambda source: jsast.tokens(jsast.parse(source)),
    )
    result["codebleu"] = round(float(upstream["codebleu"]), 6)
    for source, target in (
        ("ngram_match_score", "codebleu_ngram"),
        ("weighted_ngram_match_score", "codebleu_weighted_ngram"),
        ("syntax_match_score", "codebleu_syntax"),
        ("dataflow_match_score", "codebleu_dataflow"),
    ):
        result[target] = round(float(upstream[source]), 6)
    result.update(codebleu_recovery.evaluate(candidate_code, original_code))
    return result


def rouge_l(candidate, reference):
    """Exact whole-module token LCS F1 (beta=1), not ROUGE-Lsum.

    Bit-parallel LCS avoids a quadratic Python matrix. Token equality is exact;
    the shared JS tokenizer removes comments/whitespace, not names or literals.
    Empty sequences receive zero, including an empty reference.
    """
    if not candidate or not reference:
        return {"rouge_l": 0.0, "rouge_l_precision": 0.0,
                "rouge_l_recall": 0.0}
    short, long = (candidate, reference) if len(candidate) < len(reference) else (reference, candidate)
    masks = {}
    for index, token in enumerate(short):
        masks[token] = masks.get(token, 0) | (1 << index)
    state = 0
    for token in long:
        matches = state | masks.get(token, 0)
        state = matches & ~(matches - ((state << 1) | 1))
    length = bin(state).count("1")
    return {"rouge_l": round(2.0 * length / (len(candidate) + len(reference)), 6),
            "rouge_l_precision": round(length / len(candidate), 6),
            "rouge_l_recall": round(length / len(reference), 6)}


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
