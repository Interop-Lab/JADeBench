"""The Node side: locating the toolchain, and running a subject's own tests.

The test command is not reconstructed here. `specialize()` from the corpus
pipeline's stage 5 is imported and reused, because the command that stage ran is
the command that proved the subject's tests green — rebuilding it from the
runner name would drop the flags and environment the project depends on, and a
subject would fail for reasons that have nothing to do with the candidate.
"""
import importlib.util
import os
import signal
import subprocess
import sys
from pathlib import Path

from . import corpus

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


def run(command, cwd, env=None, timeout=900):
    """Run a shell command, capturing output. Never raises on a non-zero exit."""
    proc = subprocess.Popen(command, cwd=str(cwd), shell=True, env=env,
                            stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                            text=True, start_new_session=True)
    try:
        stdout, stderr = proc.communicate(timeout=timeout)
        return {"exit_code": proc.returncode, "stdout": stdout,
                "stderr": stderr, "timed_out": False}
    except subprocess.TimeoutExpired:
        # Test scripts often launch a shell, a runner and then a Node worker.
        # Stopping only the shell leaves the worker running after the score.
        try:
            os.killpg(proc.pid, signal.SIGTERM)
        except ProcessLookupError:
            pass
        try:
            stdout, stderr = proc.communicate(timeout=3)
        except subprocess.TimeoutExpired:
            try:
                os.killpg(proc.pid, signal.SIGKILL)
            except ProcessLookupError:
                pass
            stdout, stderr = proc.communicate()
        return {"exit_code": None, "stdout": stdout or "",
                "stderr": stderr or "", "timed_out": True}


def transform(source, dest, fmt, platform="node", root=None, timeout=120):
    """Convert one file to a module format with esbuild, without bundling.

    Bundling is off: the candidate must run with exactly the dependencies the
    subject bundle has, and inlining more would change what is being measured.
    """
    dest = Path(dest)
    dest.parent.mkdir(parents=True, exist_ok=True)
    cmd = [str(esbuild_bin(root)), str(source), "--format=%s" % fmt,
           "--platform=%s" % platform, "--log-level=warning",
           "--outfile=%s" % dest]
    proc = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
    if proc.returncode != 0 or not dest.exists():
        return False, (proc.stderr or proc.stdout or "esbuild failed")[:2000]
    return True, ""


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
