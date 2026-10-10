"""CodeBLEU-R used in the final JADeBench paper.

The four components are JavaScript-token BLEU, candidate-precision weighted
BLEU, clipped-multiset AST-subtree F1, and normalized data-flow F1. When both
programs have no data-flow edges, the fourth component is omitted.
"""

import math
from collections import Counter
from pathlib import Path

import codebleu
from codebleu import bleu, dataflow_match
from codebleu.parser import remove_comments_and_docstrings
from codebleu.utils import get_tree_sitter_language
from tree_sitter import Parser

from evallib import jsast


# The keyword set comes from the pinned CodeBLEU JavaScript implementation.
_keywords = set(
    (Path(codebleu.__file__).resolve().parent / "keywords/javascript.txt")
    .read_text(encoding="utf-8").splitlines()
)


def _cleaned(source):
    try:
        return remove_comments_and_docstrings(source, "javascript")
    except Exception:
        return source


def _ast_subtrees(source):
    stack = [jsast.parse(_cleaned(source)).root_node]
    result = Counter()
    while stack:
        node = stack.pop()
        result[str(node)] += 1
        stack.extend(child for child in node.children if child.child_count)
    return result


def _dataflows(source):
    parser = Parser()
    parser.language = get_tree_sitter_language("javascript")
    raw = dataflow_match.get_data_flow(
        _cleaned(source), [parser, dataflow_match.dfg_function["javascript"]]
    )
    return Counter(
        (name, relation, tuple(parents))
        for name, relation, parents in dataflow_match.normalize_dataflow(raw)
    )


def _f1(reference, candidate):
    total = sum(reference.values()) + sum(candidate.values())
    if total == 0:
        return None
    return 2 * sum((reference & candidate).values()) / total


def _weighted_bleu(reference, candidate):
    if not reference or not candidate:
        return 0.0
    log_precision = 0.0
    for n in range(1, 5):
        ref_counts = Counter(zip(*(reference[i:] for i in range(n))))
        cand_counts = Counter(zip(*(candidate[i:] for i in range(n))))
        matched = ref_counts & cand_counts
        if n == 1:
            weight = lambda gram: 1.0 if gram[0] in _keywords else 0.2
            numerator = sum(count * weight(gram) for gram, count in matched.items())
            denominator = sum(count * weight(gram) for gram, count in cand_counts.items())
        else:
            numerator = sum(matched.values())
            denominator = sum(cand_counts.values())
        if denominator == 0:
            return 0.0
        log_precision += 0.25 * math.log((numerator or 0.1) / denominator)
    brevity = math.exp(min(0.0, 1.0 - len(reference) / len(candidate)))
    return min(1.0, brevity * math.exp(log_precision))


def evaluate(candidate_source, reference_source):
    """Return component scores and their recovery-aware mean."""
    ref_tokens = jsast.tokens(jsast.parse(reference_source))
    cand_tokens = jsast.tokens(jsast.parse(candidate_source))
    lexical = float(bleu.corpus_bleu([[ref_tokens]], [cand_tokens]))
    weighted = _weighted_bleu(ref_tokens, cand_tokens)
    ast = _f1(_ast_subtrees(reference_source), _ast_subtrees(candidate_source))
    dfg = _f1(_dataflows(reference_source), _dataflows(candidate_source))
    components = [lexical, weighted, ast]
    if dfg is not None:
        components.append(dfg)
    return {
        "codebleu_r": round(sum(components) / len(components), 6),
        "token_bleu": round(lexical, 6),
        "weighted_precision": round(weighted, 6),
        "ast_f1": round(ast, 6),
        "dataflow_f1": None if dfg is None else round(dfg, 6),
        "component_count": len(components),
    }
