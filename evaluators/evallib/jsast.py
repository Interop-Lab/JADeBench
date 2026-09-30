"""JavaScript parsing and the structural measurements built on it.

One tree-sitter parser backs the syntax, simplification, and similarity
evaluators, so all three see the same tree: if a program parses for one it
parses for all, and a node counted by one is the node counted by the others.

tree-sitter is used rather than a Node-side parser because the evaluators must
run without a project checkout — scoring a returned program should not depend on
whether the subject's `node_modules` happens to be installed.
"""
import re

import tree_sitter_javascript as ts_javascript
from tree_sitter import Language, Parser

_LANGUAGE = Language(ts_javascript.language())

# Nodes that introduce a branch. Cyclomatic complexity is 1 + the count of
# these, the usual definition, extended to the short-circuit operators because
# obfuscators express control flow through them.
DECISION_NODES = frozenset([
    "if_statement", "for_statement", "for_in_statement", "while_statement",
    "do_statement", "switch_case", "catch_clause", "ternary_expression",
])
DECISION_OPERATORS = frozenset(["&&", "||", "??"])

# Nodes that open a nesting level. Depth is what a reader pays for, so both
# control structures and the functions containing them count.
NESTING_NODES = frozenset([
    "if_statement", "for_statement", "for_in_statement", "while_statement",
    "do_statement", "switch_statement", "try_statement", "catch_clause",
    "function_declaration", "function_expression", "generator_function",
    "generator_function_declaration", "arrow_function", "method_definition",
    "class_declaration", "class",
])

KEYWORDS = frozenset([
    "async", "await", "break", "case", "catch", "class", "const", "continue",
    "debugger", "default", "delete", "do", "else", "export", "extends",
    "finally", "for", "function", "if", "import", "in", "instanceof", "let",
    "new", "of", "return", "static", "super", "switch", "this", "throw", "try",
    "typeof", "var", "void", "while", "with", "yield",
])

_IDENT_RE = re.compile(r"^[A-Za-z_$][A-Za-z0-9_$]*$")


def _parser():
    parser = Parser()
    parser.language = _LANGUAGE
    return parser


def parse(code):
    """Parse source text. Accepts str or bytes, returns a tree-sitter Tree."""
    if isinstance(code, str):
        code = code.encode("utf-8")
    return _parser().parse(code)


def walk(node):
    """Pre-order traversal. Iterative: bundles nest deeply enough to blow the
    recursion limit."""
    cursor = node.walk()
    while True:
        yield cursor.node
        if cursor.goto_first_child():
            continue
        if cursor.goto_next_sibling():
            continue
        while True:
            if not cursor.goto_parent():
                return
            if cursor.goto_next_sibling():
                break


def syntax_errors(tree, limit=20):
    """Locations of ERROR and MISSING nodes. Empty means the program parses."""
    out = []
    if not tree.root_node.has_error:
        return out
    for node in walk(tree.root_node):
        if node.type == "ERROR" or node.is_missing:
            row, col = node.start_point
            out.append({"kind": "MISSING" if node.is_missing else "ERROR",
                        "line": row + 1, "column": col + 1,
                        "text": node.text.decode("utf-8", "replace")[:80]})
            if len(out) >= limit:
                break
    return out


def _is_comment(node_type):
    return node_type == "comment" or node_type == "html_comment"


def tokens(tree):
    """Leaf tokens, comments excluded.

    Comments are dropped because the bundler already stripped most of them and
    every obfuscator removes the rest: counting them would score a candidate on
    something no system in the comparison can control.
    """
    out = []
    for node in walk(tree.root_node):
        if node.child_count == 0 and not _is_comment(node.type):
            text = node.text.decode("utf-8", "replace")
            if text.strip():
                out.append(text)
    return out


def normalized_tokens(tree):
    """Token stream with identifiers and literals replaced by placeholders.

    This is the structure-only view: it ignores what things are called, which is
    the identifier evaluator's business, not similarity's.
    """
    out = []
    for node in walk(tree.root_node):
        if node.child_count != 0 or _is_comment(node.type):
            continue
        text = node.text.decode("utf-8", "replace")
        if not text.strip():
            continue
        if node.type == "identifier" or node.type == "property_identifier":
            out.append("ID")
        elif node.type == "string_fragment" or node.type == "template_string":
            out.append("STR")
        elif node.type == "number":
            out.append("NUM")
        elif node.type == "regex_pattern":
            out.append("RE")
        else:
            out.append(text)
    return out


def node_types(tree):
    """Pre-order sequence of named node types: the shape of the program."""
    return [n.type for n in walk(tree.root_node) if n.is_named and not _is_comment(n.type)]


def complexity(tree):
    """Structural complexity vector.

    (ast_nodes, cyclomatic, max_depth) — the three measures the corpus
    construction plan settled on. Reported as raw counts; the simplification
    evaluator does the scaling, so a stored score can be re-weighted later
    without re-parsing anything.
    """
    ast_nodes = 0
    decisions = 0
    max_depth = 0
    stack = [(tree.root_node, 0)]
    while stack:
        node, depth = stack.pop()
        if node.is_named and not _is_comment(node.type):
            ast_nodes += 1
            if node.type in DECISION_NODES:
                decisions += 1
            elif node.type == "binary_expression":
                op = node.child_by_field_name("operator")
                if op is not None and op.text.decode("utf-8", "replace") in DECISION_OPERATORS:
                    decisions += 1
        if node.type in NESTING_NODES:
            depth += 1
            if depth > max_depth:
                max_depth = depth
        for child in reversed(node.children):
            stack.append((child, depth))
    return {"ast_nodes": ast_nodes,
            "cyclomatic": decisions + 1,
            "max_depth": max_depth,
            "halstead_length": halstead_length(tree)}


# Leaves counted as Halstead operands. Everything else that `tokens()` yields
# is an operator. Length is N = N1 + N2 (totals, not distinct), matching
# JsDeObsBench Equation 1's HLoC: `aggregate.halstead.length` from escomplex.
_HALSTEAD_OPERANDS = frozenset([
    "identifier", "property_identifier", "shorthand_property_identifier",
    "private_property_identifier", "number", "string_fragment", "escape_sequence",
    "true", "false", "null", "undefined", "this", "super",
    "regex_pattern", "regex_flags", "template_chars",
])


def halstead_length(tree):
    """Halstead length N = total operators + total operands.

    JsDeObsBench reports simplification as 1 - HLoC(deobf)/HLoC(obf) using
    typhonjs-escomplex's aggregate length. This walks the same token stream the
    other static evaluators see, so a program that parses for syntax has a
    defined HLoC here. Distinct counts are not needed for that equation.
    """
    operators = 0
    operands = 0
    for node in walk(tree.root_node):
        if node.child_count != 0 or _is_comment(node.type):
            continue
        text = node.text.decode("utf-8", "replace")
        if not text.strip():
            continue
        if node.type in _HALSTEAD_OPERANDS:
            operands += 1
        else:
            operators += 1
    return operators + operands


def loc(code):
    """Non-blank physical lines."""
    if isinstance(code, bytes):
        code = code.decode("utf-8", "replace")
    return sum(1 for line in code.splitlines() if line.strip())


def exported_names(tree):
    """The export surface: the names another module can import.

    A returned program is substituted for the subject in its project, so its
    export surface is part of the contract, not a stylistic detail. `export *`
    is reported as `*` because its contents cannot be resolved statically.

    Both module systems are read, and the union is returned. The corpus is 131
    CommonJS bundles to 40 ESM, and a returned program may use either syntax —
    esbuild converts it to the subject's flavour before execution — so the
    contract is "the same names are importable", not "the same keyword was
    used". Reading only `export` statements, as this did originally, made the
    check a no-op on 77% of the corpus: it silently reduced syntax correctness
    to "it parses" on every CommonJS subject.
    """
    return _esm_exported_names(tree) | _cjs_exported_names(tree)


def _esm_exported_names(tree):
    names = set()
    for node in walk(tree.root_node):
        if node.type != "export_statement":
            continue
        value = node.child_by_field_name("declaration")
        has_default = any(c.type == "default" for c in node.children)
        if has_default:
            names.add("default")
        if value is not None:
            names.update(_declared_names(value))
        for child in node.children:
            if child.type == "export_clause":
                for spec in child.children:
                    if spec.type != "export_specifier":
                        continue
                    alias = spec.child_by_field_name("alias")
                    name = spec.child_by_field_name("name")
                    chosen = alias if alias is not None else name
                    if chosen is not None:
                        names.add(chosen.text.decode("utf-8", "replace"))
            elif child.type == "namespace_export" or child.type == "*":
                names.add("*")
    return names


def _text(node):
    return node.text.decode("utf-8", "replace")


def _member_path(node):
    """`module.exports.foo` -> ['module', 'exports', 'foo'], or None."""
    parts = []
    while node is not None and node.type == "member_expression":
        prop = node.child_by_field_name("property")
        if prop is None:
            return None
        parts.append(_text(prop))
        node = node.child_by_field_name("object")
    if node is None or node.type != "identifier":
        return None
    parts.append(_text(node))
    parts.reverse()
    return parts


def _is_computed_export(node):
    """`module[expr]` / `exports[expr]` — an export whose name is not statically known."""
    if node is None or node.type != "subscript_expression":
        return False
    obj = node.child_by_field_name("object")
    if obj is None:
        return False
    if obj.type == "identifier" and _text(obj) in ("module", "exports"):
        return True
    return _member_path(obj) == ["module", "exports"]


def _object_keys(node):
    """Names bound by an object literal, for `module.exports = { a, b: c }`."""
    names = set()
    if node is None or node.type != "object":
        return names
    for child in node.named_children:
        if child.type == "shorthand_property_identifier":
            names.add(_text(child))
        elif child.type in ("pair", "method_definition"):
            key = child.child_by_field_name("key")
            if key is not None:
                names.add(_text(key).strip("'\""))
        elif child.type == "spread_element":
            # `...rest` re-exports an unresolvable set, same as `export *`.
            names.add("*")
    return names


_SCOPE_NODES = frozenset([
    "function_declaration", "function_expression", "arrow_function",
    "generator_function", "generator_function_declaration", "method_definition",
    "class_declaration", "class", "class_body",
])

# `module.exports = <value>` where the value *is* the module and carries no
# statically knowable names. A function, a class, or a primitive genuinely has
# no named exports, so `default` is the whole truth about it.
_DEFAULT_ONLY_RHS = frozenset([
    "function_expression", "arrow_function", "generator_function", "class",
    "string", "number", "template_string", "array", "true", "false", "null",
    "undefined", "regex",
])


def _unwrap(node):
    while node is not None and node.type == "parenthesized_expression" \
            and node.named_children:
        node = node.named_children[0]
    return node


def _assigned_surface(node, root=None):
    """The export surface published by `module.exports = <node>`.

    An object literal is read directly, and a function, class, or primitive *is*
    the module and has no named exports, so `default` describes it completely.
    The interesting case is `module.exports = <identifier>`, which is what real
    CommonJS overwhelmingly writes, and where the two obvious answers are both
    wrong.

    Answering `default` is a false claim, not a conservative reading: it asserts
    the module has exactly one export when the truth is not yet known, so every
    named export of the reference gets reported missing. That is not
    hypothetical — webcrack answers `module.exports = _0x5cddf9` on the `full`
    rung, and the module exports all ten names correctly at run time. Execution
    correctness scored 1.0 on the very artifact syntax correctness scored 0, and
    Many reference bundles carry named exports, which is exactly the
    population the false claim bites.

    Answering `*` for every identifier is sound but throws away a contract that
    is usually right there. `websockets/ws` ends with `module.exports = WebSocket`
    after attaching `WebSocket.Receiver`, `WebSocket.Server`, and five more at
    module scope; those *are* importable names, and 22 bundles look like this.
    Declaring their surface unknown would make the check vacuous on them — the
    same defect, in the other direction, that reading only ESM `export`
    statements used to cause on every CommonJS subject.

    So an identifier is resolved against the module's own scope: bound to a class
    or function, the surface is `default` plus whatever module-scope
    `Name.prop = …` assignments attach to it; bound to an object literal, its
    keys plus the same statics. Only a value that genuinely cannot be resolved —
    a call, a member access, an unbound or obfuscated name — falls back to `*`,
    the convention `export *`, `...spread`, and `module[<expr>]` already use. A
    check that cannot be performed abstains rather than guessing wrong.
    """
    node = _unwrap(node)
    if node is None:
        return {"default"}
    if node.type == "object":
        keys = _object_keys(node)
        return keys if keys else {"default"}
    if node.type in _DEFAULT_ONLY_RHS:
        return {"default"}
    if node.type == "identifier" and root is not None:
        resolved = _resolve_local_surface(_text(node), root)
        if resolved is not None:
            return resolved
    # call_expression, member_expression, subscript_expression, new_expression,
    # ternary_expression, await_expression, an unbound or obfuscated name …
    return {"*"}


def _resolve_local_surface(name, root):
    """Surface of a module-scope binding, or None if it cannot be resolved.

    Statics assigned after the declaration count: `WebSocket.Server = …` at
    module scope makes `Server` importable, which is how the CommonJS half of
    the corpus publishes most of its named exports.
    """
    bindings = _module_scope_bindings(root)
    if name not in bindings:
        return None
    value = _unwrap(bindings[name])
    if value is None:                       # function/class declaration
        surface = {"default"}
    elif value.type == "object":
        surface = _object_keys(value) or {"default"}
    elif value.type in _DEFAULT_ONLY_RHS:
        surface = {"default"}
    else:
        return None                          # bound to something unresolvable
    return surface | _static_members(name, root)


def _static_members(name, root):
    """Module-scope `name.prop = …` assignments — importable as named exports.

    `name.prototype.foo` is excluded: it defines instance behaviour, not a
    property of the exported object.
    """
    names = set()
    for expr in _module_scope_expressions(root):
        if expr.type != "assignment_expression":
            continue
        path = _member_path(expr.child_by_field_name("left"))
        if path and len(path) == 2 and path[0] == name:
            names.add(path[1])
    return names


def _module_scope_bindings(root):
    """name -> initialiser node for module-scope declarations.

    A function or class declaration maps to None: the name is bound, and the
    binding is a callable with no statically knowable keys of its own.
    """
    out = {}
    stack = list(root.named_children)
    while stack:
        node = stack.pop()
        if node.type in ("function_declaration", "generator_function_declaration",
                         "class_declaration"):
            ident = node.child_by_field_name("name")
            if ident is not None:
                out.setdefault(_text(ident), None)
            continue
        if node.type in _SCOPE_NODES:
            continue
        if node.type in ("lexical_declaration", "variable_declaration"):
            for child in node.children:
                if child.type != "variable_declarator":
                    continue
                ident = child.child_by_field_name("name")
                if ident is not None and ident.type == "identifier":
                    out.setdefault(_text(ident), child.child_by_field_name("value"))
            continue
        stack.extend(node.named_children)
    return out


def _module_scope_expressions(root):
    """Expressions in the module's own scope: everything outside a function body.

    The boundary is a function or class, not a block. `if (typeof module !==
    'undefined') module.exports = X` is a real and common export, and an `if`
    introduces no new `module` binding — but a function does, which is exactly
    how an esbuild CommonJS bundle wraps every inlined dependency
    (`__commonJS({ "path"(exports, module) { … } })`). Descending into functions
    would collect each bundled dependency's exports as if they were the
    subject's.
    """
    out = []
    stack = list(root.named_children)
    while stack:
        node = stack.pop()
        if node.type in _SCOPE_NODES:
            continue
        if node.type == "expression_statement" and node.named_children:
            out.append(node.named_children[0])
            continue
        stack.extend(node.named_children)
    return out


def _cjs_exported_names(tree):
    """The CommonJS export surface, read from the module's own scope."""
    names = set()
    for expr in _module_scope_expressions(tree.root_node):

        if expr.type == "call_expression":
            names |= _cjs_export_call(expr)
            continue
        if expr.type != "assignment_expression":
            continue

        left = expr.child_by_field_name("left")
        right = expr.child_by_field_name("right")
        if left is not None and _is_computed_export(left):
            # `module[<expr>] = …` publishes a set that cannot be resolved
            # statically, so it is recorded as `*` and treated as covering
            # anything — the same convention `export *` and `...spread` already
            # use. Obfuscation produces exactly this: with the string array on,
            # `module.exports` becomes `module[_0x15d20b(-0xc7,-0xd5)]`. Reading
            # it as "declares nothing" would score a program that exports
            # correctly at runtime as having dropped every export.
            names.add("*")
            continue
        path = _member_path(left) if left is not None else None
        if not path:
            continue

        if path == ["module", "exports"]:
            names |= _assigned_surface(right, tree.root_node)
        elif path[:2] == ["module", "exports"] and len(path) == 3:
            names.add(path[2])
        elif path[0] == "exports" and len(path) == 2:
            names.add(path[1])
    return names


def _cjs_export_call(expr):
    """esbuild's `__export(exports, {...})` and `Object.defineProperty(exports, "x", …)`."""
    fn = expr.child_by_field_name("function")
    args = expr.child_by_field_name("arguments")
    if fn is None or args is None:
        return set()
    argv = [a for a in args.named_children]
    name = _text(fn)
    if name.endswith("__export") and len(argv) >= 2:
        return _object_keys(argv[1])
    if name == "Object.defineProperty" and len(argv) >= 2 and argv[1].type == "string":
        target = _text(argv[0])
        if target in ("exports", "module.exports"):
            return {_text(argv[1]).strip("'\"")}
    return set()


def _declared_names(node):
    """Names bound by an exported declaration (`export const a, b = …`)."""
    out = set()
    if node.type in ("function_declaration", "generator_function_declaration",
                     "class_declaration"):
        name = node.child_by_field_name("name")
        if name is not None:
            out.add(name.text.decode("utf-8", "replace"))
        return out
    if node.type in ("lexical_declaration", "variable_declaration"):
        for child in node.children:
            if child.type != "variable_declarator":
                continue
            name = child.child_by_field_name("name")
            if name is None:
                continue
            if name.type == "identifier":
                out.add(name.text.decode("utf-8", "replace"))
            else:  # destructuring: every bound identifier is exported
                for sub in walk(name):
                    if sub.type == "identifier":
                        out.add(sub.text.decode("utf-8", "replace"))
    return out


def has_esm_syntax(tree):
    """Whether the program uses ESM import/export at the top level.

    Used to pick the module flavour of a shim. The project's `package.json`
    "type" field is not a reliable substitute: marp-team/marpit leaves `type`
    unset but writes ESM sources compiled by babel-jest, and 0xranx/OpenContext
    declares `commonjs` while carrying ESM elsewhere in the tree.
    """
    for child in tree.root_node.children:
        if child.type in ("import_statement", "export_statement"):
            return True
    return False


def is_identifier(text):
    return bool(_IDENT_RE.match(text))
