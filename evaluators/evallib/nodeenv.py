"""The Node side: locating the toolchain, and running a subject's own tests.

The test command is not reconstructed here. `specialize()` from the corpus
pipeline's stage 5 is imported and reused, because the command that stage ran is
the command that proved the subject's tests green — rebuilding it from the
runner name would drop the flags and environment the project depends on, and a
subject would fail for reasons that have nothing to do with the candidate.
"""
import importlib.util
import os
import subprocess
import sys
import tempfile
import time
from pathlib import Path

from . import corpus, jsast

_TOOLS = "tools/node_modules/.bin"


class ToolchainError(RuntimeError):
    pass


def esbuild_bin(root=None):
    root = Path(root) if root else corpus.corpus_root()
    path = root / _TOOLS / "esbuild"
    if not path.exists():
        raise ToolchainError(
            "esbuild not found at %s — run `npm install` in %s" % (path, root / "tools"))
    return path


def node_bin():
    from shutil import which
    node = which("node")
    if not node:
        raise ToolchainError("node not found on PATH (Node 22 expected)")
    return node


def _load_corpus_lib():
    """Import `corpus/scripts/lib.py` under a name that cannot shadow ours.

    This used to load `05_coverage.py` by file path, because that file name
    starts with a digit and cannot be imported normally. `specialize()` now
    lives in the corpus's shared `lib` module instead, so the only remaining
    care is the name: `corpus/scripts/lib` and this package would collide under
    a plain `import lib`, which is why this package is called `evallib` and why
    the module is bound here under an explicit alias rather than by name.
    """
    path = corpus.corpus_root() / "scripts" / "lib.py"
    if not path.exists():
        raise ToolchainError("corpus shared library not found at %s" % path)
    spec = importlib.util.spec_from_file_location("adb_corpus_lib", str(path))
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


_CORPUS_LIB = None


def specialize(invocation, runner, test_file):
    """Rewrite a project's test command to run one test file.

    Thin wrapper over the corpus pipeline's own implementation
    (`corpus/scripts/lib.py::specialize`), not a reimplementation: that is the
    function whose output proved each subject's suite green and produced the
    manifest's coverage numbers. Rebuilding the command from the runner name
    would drop the flags and environment the project depends on, and a subject
    would fail for reasons that have nothing to do with the candidate.

    Returns (env_prefix, command).
    """
    global _CORPUS_LIB
    if _CORPUS_LIB is None:
        _CORPUS_LIB = _load_corpus_lib()
    return _CORPUS_LIB.specialize(invocation, runner, test_file)


def project_env(project_dir, extra=None):
    """Environment for running a project's tests directly.

    npm puts `node_modules/.bin` on PATH when it runs a script; invoking the
    command ourselves skips that, so a bare `mocha` or `jest` would not resolve.
    """
    env = dict(os.environ)
    env["CI"] = "1"
    env["PATH"] = "%s%s%s" % (Path(project_dir) / "node_modules" / ".bin",
                              os.pathsep, env.get("PATH", ""))
    if extra:
        env.update(extra)
    return env


def run(command, cwd, env=None, timeout=300):
    """Run a shell command, capturing output. Never raises on a non-zero exit."""
    started = time.monotonic()
    try:
        proc = subprocess.run(command, cwd=str(cwd), shell=True, env=env,
                              capture_output=True, text=True, timeout=timeout)
        return {"exit_code": proc.returncode, "stdout": proc.stdout,
                "stderr": proc.stderr, "timed_out": False,
                "elapsed_sec": time.monotonic() - started}
    except subprocess.TimeoutExpired as exc:
        return {"exit_code": None,
                "stdout": exc.stdout.decode("utf-8", "replace") if isinstance(exc.stdout, bytes) else (exc.stdout or ""),
                "stderr": exc.stderr.decode("utf-8", "replace") if isinstance(exc.stderr, bytes) else (exc.stderr or ""),
                "timed_out": True,
                "elapsed_sec": time.monotonic() - started}


# esbuild picks the loader from the extension. A `.cjs` / `.js` / `.mjs`
# candidate that a deobfuscator restored to JSX is rejected before any test
# runs, and that refusal was being scored as execution 0.
_JSX_LOADER_HINT = "JSX syntax extension is not currently enabled"
_JS_SUFFIXES = (".js", ".mjs", ".cjs")


def _esbuild(cmd, timeout):
    proc = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
    detail = (proc.stderr or proc.stdout or "esbuild failed")[:2000]
    return proc.returncode == 0, detail


def _jsx_loader_flag(source):
    """`--loader` that parses this extension as JSX. `.jsx` already does."""
    suffix = Path(source).suffix.lower()
    if suffix not in _JS_SUFFIXES:
        return None
    return "--loader:%s=jsx" % suffix


def _walk_subtree(root):
    """Pre-order walk that does not climb out of `root`.

    `jsast.walk` follows the parent pointer, so starting it on a child visits
    the rest of the file. Name restoration has to stay inside one expression.
    """
    cursor = root.walk()
    while True:
        yield cursor.node
        if cursor.goto_first_child():
            continue
        while True:
            if cursor.node == root:
                return
            if cursor.goto_next_sibling():
                break
            if not cursor.goto_parent():
                return


def _expression_name(node):
    """The inner name of a class or function expression, if it has one."""
    if node is None or node.type not in ("class", "function_expression"):
        return None
    name = node.child_by_field_name("name")
    if name is None or name.type != "identifier":
        return None
    return name.text.decode("utf-8")


def _same_name_bindings(code):
    """Bindings written as `binding = class binding` or `binding = function binding`.

    The inner name is scoped to the expression, so `constructor.name` and
    `function.name` are that name. esbuild's ESM/CJS printer treats it as a
    collision with the outer binding and renames it (`Foo` becomes `Foo2`),
    which changes `.name` before any test runs.
    """
    found = set()
    tree = jsast.parse(code)
    for node in jsast.walk(tree.root_node):
        if node.type != "variable_declarator":
            continue
        binding = node.child_by_field_name("name")
        value = node.child_by_field_name("value")
        if binding is None or binding.type != "identifier":
            continue
        inner = _expression_name(value)
        if inner is not None and inner == binding.text.decode("utf-8"):
            found.add(inner)
    return found


def _restore_esbuild_expression_names(source_text, output_text):
    """Put back class and function names esbuild suffixed during printing.

    Only bindings whose source text used the same inner and outer name are
    restored, and only when the printed inner name is that name plus digits.
    `var Foo = class Foo2` in the input is left alone.
    """
    if not source_text or not output_text:
        return output_text
    wanted = _same_name_bindings(source_text)
    if not wanted:
        return output_text
    tree = jsast.parse(output_text)
    raw = output_text.encode("utf-8")
    spans = []
    for node in jsast.walk(tree.root_node):
        if node.type != "variable_declarator":
            continue
        binding_node = node.child_by_field_name("name")
        value = node.child_by_field_name("value")
        if binding_node is None or binding_node.type != "identifier":
            continue
        binding = binding_node.text.decode("utf-8")
        inner = _expression_name(value)
        if binding not in wanted or not inner or inner == binding:
            continue
        if not (inner.startswith(binding) and inner[len(binding):].isdigit()):
            continue
        old = inner.encode("utf-8")
        new = binding.encode("utf-8")
        for sub in _walk_subtree(value):
            if sub.type == "identifier" and sub.text == old:
                spans.append((sub.start_byte, sub.end_byte, new))
    if not spans:
        return output_text
    spans.sort()
    out = bytearray()
    cursor = 0
    for start, end, new in spans:
        if start < cursor or end > len(raw):
            return output_text
        out += raw[cursor:start]
        out += new
        cursor = end
    out += raw[cursor:]
    restored = out.decode("utf-8")
    if jsast.syntax_errors(jsast.parse(restored)):
        return output_text
    return restored


def transform(source, dest, fmt, platform="node", root=None, timeout=120):
    """Convert one file to a module format with esbuild, without bundling.

    Bundling is off: the candidate must run with exactly the dependencies the
    subject bundle has, and inlining more would change what is being measured.

    When the default loader rejects JSX, retry once with that extension parsed
    as JSX. esbuild's classic JSX transform emits `React.createElement`, which
    is what these React subjects already call; the automatic runtime is not
    selected, so no `react/jsx-runtime` import is injected.

    esbuild renames `var Foo = class Foo` to `class Foo2` when printing a
    module, which changes `constructor.name`. Those names are restored from
    the input so the harness does not fail tests that read `.name`.
    """
    dest = Path(dest)
    dest.parent.mkdir(parents=True, exist_ok=True)
    cmd = [str(esbuild_bin(root)), str(source), "--format=%s" % fmt,
           "--platform=%s" % platform, "--log-level=warning",
           "--outfile=%s" % dest]
    ok, detail = _esbuild(cmd, timeout)
    if (not ok or not dest.exists()) and _JSX_LOADER_HINT in (detail or ""):
        flag = _jsx_loader_flag(source)
        if flag:
            ok, detail = _esbuild(cmd + [flag], timeout)
    if not ok or not dest.exists():
        return False, detail or "esbuild failed"
    source_text = Path(source).read_text(encoding="utf-8", errors="replace")
    output_text = dest.read_text(encoding="utf-8", errors="replace")
    restored = _restore_esbuild_expression_names(source_text, output_text)
    if restored != output_text:
        dest.write_text(restored, encoding="utf-8")
    return True, ""


def compiles_as_jsx(code, root=None, timeout=30):
    """Whether `code` is JSX that esbuild accepts once the loader is enabled.

    False for plain JavaScript and for errors that are not the JSX-loader
    refusal. Callers use this to avoid treating a restored JSX program as
    syntactically invalid just because `node --check` and the JavaScript
    grammar do not understand JSX.
    """
    if not code or not isinstance(code, str):
        return False
    src = None
    out = None
    try:
        handle = tempfile.NamedTemporaryFile("w", suffix=".cjs", delete=False,
                                             encoding="utf-8")
        handle.write(code)
        handle.close()
        src = Path(handle.name)
        out = Path(str(src) + ".out.js")
        cmd = [str(esbuild_bin(root)), str(src), "--format=cjs",
               "--platform=neutral", "--log-level=warning",
               "--outfile=%s" % out]
        ok, detail = _esbuild(cmd, timeout)
        if ok:
            return False
        if _JSX_LOADER_HINT not in (detail or ""):
            return False
        ok, _detail = _esbuild(cmd + ["--loader:.cjs=jsx"], timeout)
        return bool(ok and out.exists())
    except (OSError, subprocess.TimeoutExpired, ToolchainError):
        return False
    finally:
        for path in (src, out):
            if path is None:
                continue
            try:
                path.unlink()
            except OSError:
                pass


def node_check(path, timeout=30):
    """Syntax-check a file with Node itself.

    A second opinion on tree-sitter: tree-sitter recovers from errors by design
    and can accept text V8 rejects, and the returned program has to run on Node,
    not on a parser.
    """
    try:
        proc = subprocess.run([node_bin(), "--check", str(path)],
                              capture_output=True, text=True, timeout=timeout)
    except subprocess.TimeoutExpired:
        return False, "node --check timed out"
    except ToolchainError as exc:
        return None, str(exc)
    if proc.returncode == 0:
        return True, ""
    return False, (proc.stderr or proc.stdout).strip()[:2000]
