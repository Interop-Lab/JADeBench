#!/usr/bin/env python3
"""Degradation tests for the static evaluators.

An evaluator is only useful if it moves in the right direction when the returned
program gets worse. Each case takes a subject's own bundle and damages it in one
specific way, then asserts what the evaluators must say about the damage. These
are the properties the paper relies on when it reads a score as a measurement.

No test framework: the corpus pipeline is stdlib-only and so is this.

Usage:
    python3 tests/test_metrics.py
"""
import re
import subprocess
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from evallib import corpus, jsast, nodeenv  # noqa: E402
from metrics import similarity, simplification, syntax  # noqa: E402

FAILURES = []


def _transform_text(code, fmt):
    handle = tempfile.NamedTemporaryFile("w", suffix=".mjs", delete=False,
                                         encoding="utf-8")
    handle.write(code)
    handle.close()
    src = Path(handle.name)
    dest = src.with_suffix(".out.mjs")
    try:
        ok, detail = nodeenv.transform(src, dest, fmt, platform="neutral")
        text = dest.read_text(encoding="utf-8") if dest.exists() else ""
        return ok, detail, text
    finally:
        src.unlink(missing_ok=True)
        dest.unlink(missing_ok=True)


def _eval_name(code):
    """constructor.name and the name seen from inside the class body."""
    handle = tempfile.NamedTemporaryFile("w", suffix=".mjs", delete=False,
                                         encoding="utf-8")
    handle.write(code)
    handle.close()
    try:
        proc = subprocess.run(
            [nodeenv.node_bin(), "--input-type=module", "-e",
             "import { MarkdownSourceCode as C } from '%s';"
             "const o = new C();"
             "console.log(C.name);"
             "console.log(o.inner());" % handle.name],
            capture_output=True, text=True, timeout=30)
        lines = (proc.stdout or "").splitlines()
        return proc.returncode, lines
    finally:
        Path(handle.name).unlink(missing_ok=True)


def check_esbuild_name_restore():
    named = (
        "var MarkdownSourceCode = class MarkdownSourceCode {\n"
        "  inner() { return MarkdownSourceCode.name; }\n"
        "};\n"
        "export { MarkdownSourceCode };\n"
    )
    ok, detail, text = _transform_text(named, "esm")
    check("named class still transforms", ok, detail)
    check("esbuild suffix is removed from the text",
          "MarkdownSourceCode2" not in text, text)
    code, lines = _eval_name(text)
    check("restored constructor.name is MarkdownSourceCode",
          code == 0 and lines[:1] == ["MarkdownSourceCode"], lines)
    check("the class body still sees its own name",
          code == 0 and lines[1:2] == ["MarkdownSourceCode"], lines)

    distinct = "var Foo = class Foo2 { m() { return Foo2.name; } };\nexport { Foo };\n"
    ok, detail, text = _transform_text(distinct, "esm")
    check("a distinct inner name is kept", ok and "class Foo2" in text, text)

    anonymous = (
        "var MarkdownSourceCode = class extends Object {};\n"
        "export { MarkdownSourceCode };\n"
    )
    ok, detail, text = _transform_text(anonymous, "esm")
    check("anonymous class is not given an inner name",
          ok and "class MarkdownSourceCode" not in text and "class2" not in text,
          text)


def check(name, condition, detail=""):
    if condition:
        print("  ok   %s" % name)
    else:
        print("  FAIL %s %s" % (name, detail))
        FAILURES.append(name)


def rename_identifiers(code):
    """Layout obfuscation: developer names replaced by generated ones."""
    tree = jsast.parse(code)
    names = set()
    for node in jsast.walk(tree.root_node):
        if node.type == "identifier":
            text = node.text.decode("utf-8", "replace")
            if len(text) > 3 and not text.startswith("__"):
                names.add(text)
    out = code
    for index, name in enumerate(sorted(names)):
        out = re.sub(r"\b%s\b" % re.escape(name), "_0x%04x" % index, out)
    return out


def inject_dead_code(code, count=150):
    """Control obfuscation: unreachable branches that no execution takes."""
    extra = "\n".join(
        "function _dead%d(a) { if (a && a.x || a.y) { return a ? %d : %d; } return 0; }"
        % (i, i, i + 1) for i in range(count))
    return code + "\n" + extra


def delete_a_branch(code):
    """A behaviour-changing edit: one `if` guard removed."""
    return re.sub(r"\bif \(", "if (false && ", code, count=1)


def main():
    cfg = corpus.load_config()
    # Keep this test self-contained in the source release. The original
    # research checkout used one full-corpus subject, which made the static
    # metric suite fail before testing anything when large corpus artifacts
    # were distributed separately.
    original = """
function format(items) {
  if (items && items.length) return items.join(", ");
  return "";
}
function parse(text) {
  if (!text) return [];
  return String(text).split(/\\s*,\\s*/);
}
module.exports = { format, parse };
"""

    print("subject: embedded CommonJS metric fixture")

    print("\nidentity — a system that returns the original scores perfectly")
    identity_syntax = syntax.evaluate(original, original, cfg["syntax"])
    identity_similarity = similarity.evaluate(original, original, cfg["similarity"])
    check("syntax == 1", identity_syntax["score"] == 1, identity_syntax)
    check("codebleu3 == 1.0", identity_similarity["codebleu3"] == 1.0, identity_similarity)
    check("no missing exports", identity_syntax["exports_missing"] == [])

    print("\nbroken syntax — must fail, and must fail on both parsers")
    broken = syntax.evaluate("const = ;( function", original, cfg["syntax"])
    check("score == 0", broken["score"] == 0)
    check("parses is False", broken["parses"] is False)
    check("node agrees", broken["node_check"] is False, broken["node_check"])

    print("\nJSX restored into a .cjs-shaped program is still valid")
    jsx = (
        "const React = { createElement() { return null; } };\n"
        "function Nav() { return <div className=\"x\">hi</div>; }\n"
        "module.exports = { Nav };\n"
    )
    jsx_syntax = syntax.evaluate(jsx, original, cfg["syntax"])
    check("JSX scores as syntactically valid", jsx_syntax["score"] == 1, jsx_syntax)
    check("JSX recovery is recorded", jsx_syntax.get("jsx") is True, jsx_syntax)

    print("\ndropped export — still syntactically valid; the missing names are recorded only")
    dropped = syntax.evaluate("export const unrelated = 1;", original, cfg["syntax"])
    expected = identity_syntax["exports_declared"]
    check("parses", dropped["parses"] is True)
    check("score stays 1", dropped["score"] == 1)
    # Asserted against the subject's actual surface rather than a literal. This
    # subject is a CommonJS bundle exporting `{format, parse}`; hardcoding
    # ["default"] dated from when every bundle was ESM, and the assertion went
    # on passing for the wrong reason once the export check stopped seeing
    # CommonJS at all.
    check("names every missing export", dropped["exports_missing"] == expected,
          "%s vs expected %s" % (dropped["exports_missing"], expected))
    check("the subject's surface is non-empty", len(expected) > 0, expected)

    print("\ndropped export, CommonJS candidate — the check is flavour-agnostic")
    cjs_ok = syntax.evaluate("module.exports = { format, parse };", original, cfg["syntax"])
    cjs_bad = syntax.evaluate("module.exports = { format };", original, cfg["syntax"])
    check("a CommonJS answer covering the surface passes", cjs_ok["score"] == 1, cjs_ok)
    check("a CommonJS answer dropping one export still parses", cjs_bad["score"] == 1, cjs_bad)
    check("and it names the one that is missing", cjs_bad["exports_missing"] == ["parse"],
          cjs_bad["exports_missing"])

    print("\nan export surface that cannot be read statically must not be guessed")
    # `module.exports = <identifier>` is what real CommonJS — and real
    # deobfuscator output — overwhelmingly writes. Reading it as "only a default
    # export" is a claim, not a conservative default, and it was a false one:
    # webcrack answers `module.exports = _0x5cddf9` on the `full` rung and the
    # module exports all ten of its names at run time. That artifact scored
    # syntax 0 and execution 1.0 at the same time.
    opaque = syntax.evaluate("module.exports = whateverThisIs;", original, cfg["syntax"])
    check("an unresolvable surface is not scored as a dropped export",
          opaque["score"] == 1, opaque)
    check("and it is recorded as unresolvable rather than as `default`",
          opaque["exports_declared"] == ["*"], opaque["exports_declared"])

    # Resolvable locally: the name is bound in the module's own scope, so the
    # surface is knowable and the check must still bite.
    local = syntax.evaluate(
        "class W {}\nW.format = 1;\nW.parse = 2;\nmodule.exports = W;",
        original, cfg["syntax"])
    check("a locally-bound export is resolved, statics included",
          local["score"] == 1, local)
    local_short = syntax.evaluate(
        "class W {}\nW.format = 1;\nmodule.exports = W;", original, cfg["syntax"])
    check("and a locally-bound export that drops a name still parses",
          local_short["score"] == 1 and local_short["exports_missing"] == ["parse"],
          local_short["exports_missing"])

    # The other direction: an unreadable *reference* surface is a defect of the
    # reference, and cannot be used to condemn an answer.
    unknown_ref = syntax.evaluate("module.exports = { a: 1 };",
                                  "module.exports = opaqueThing;", cfg["syntax"])
    check("an unreadable reference surface abstains rather than failing",
          unknown_ref["score"] == 1, unknown_ref)
    check("and the abstention is visible", unknown_ref["exports_unresolved"] is True)

    print("\nrenamed identifiers — similarity falls, structure is untouched")
    renamed = rename_identifiers(original)
    renamed_similarity = similarity.evaluate(renamed, original, cfg["similarity"])
    check("codebleu3 drops", renamed_similarity["codebleu3"] < 0.95, renamed_similarity["codebleu3"])
    check("bleu drops", renamed_similarity["bleu"] < 0.9, renamed_similarity["bleu"])
    check("ast_match stays 1.0", renamed_similarity["ast_match"] == 1.0,
          renamed_similarity["ast_match"])

    print("\ndead code — the obfuscated input; a candidate equal to it gains nothing")
    obfuscated = inject_dead_code(original)
    at_obfuscated = simplification.evaluate(obfuscated, obfuscated, original,
                                            cfg["simplification"])
    at_original = simplification.evaluate(original, obfuscated, original,
                                          cfg["simplification"])
    check("rel_obf == 0 when nothing was removed", abs(at_obfuscated["rel_obf"]) < 1e-6,
          at_obfuscated["rel_obf"])
    check("anchored == 0 when nothing was removed", abs(at_obfuscated["anchored"]) < 1e-6,
          at_obfuscated["anchored"])
    check("anchored == 1 when the original is recovered",
          abs(at_original["anchored"] - 1.0) < 1e-6, at_original["anchored"])
    check("not flagged over-simplified", at_original["over_simplified"] is False)
    check("jsdeobs == 0 when nothing was removed",
          abs(at_obfuscated["jsdeobs"] or 0) < 1e-6, at_obfuscated["jsdeobs"])
    check("jsdeobs matches the original's recoverable reduction",
          abs((at_original["jsdeobs"] or 0) - (at_original["jsdeobs_original"] or 0)) < 1e-6,
          "%s vs %s" % (at_original["jsdeobs"], at_original["jsdeobs_original"]))
    check("jsdeobs on original is below 1 (Halstead still sees the program)",
          0.0 < (at_original["jsdeobs"] or 0) < 1.0, at_original["jsdeobs"])

    print("\nempty output — the case the legacy simplification metric gets wrong")
    empty = simplification.evaluate("", obfuscated, original, cfg["simplification"])
    check("rel_obf rewards deletion (documented bias)", empty["rel_obf"] > 0.99,
          empty["rel_obf"])
    check("anchored overshoots 1.0 instead", empty["anchored"] > 1.0, empty["anchored"])
    check("over_simplified is flagged", empty["over_simplified"] is True)
    check("jsdeobs is null (syntax gate, matching JsDeObsBench)",
          empty["jsdeobs"] is None, empty["jsdeobs"])

    print("\nno obfuscated input — simplification is undefined, not zero")
    check("returns None", simplification.evaluate(original, None, original,
                                                  cfg["simplification"]) is None)

    print("\nesbuild name restore — constructor.name must survive the harness")
    check_esbuild_name_restore()

    print("\nbehaviour-changing edit — static evaluators cannot see it")
    edited = delete_a_branch(original)
    edited_syntax = syntax.evaluate(edited, original, cfg["syntax"])
    edited_similarity = similarity.evaluate(edited, original, cfg["similarity"])
    check("still scores syntactically correct", edited_syntax["score"] == 1)
    check("still scores highly similar", edited_similarity["codebleu3"] > 0.95,
          edited_similarity["codebleu3"])
    print("       ^ this is why execution correctness is the primary measure;"
          "\n         tests/test_execution.py checks that the trace catches it.")

    print("\n%s" % ("FAILED: %s" % ", ".join(FAILURES) if FAILURES else "all checks passed"))
    return 1 if FAILURES else 0


if __name__ == "__main__":
    sys.exit(main())
