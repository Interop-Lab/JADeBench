#!/usr/bin/env python3
"""Reject sensitive, machine-specific, or oversized release content."""

from __future__ import annotations

import os
import re
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MAX_FILE_BYTES = 95 * 1024 * 1024
FORBIDDEN_ROOTS = {"paper", "archive", "experiments"}
FORBIDDEN_PARTS = {
    "transcripts",
    "checkpoints",
    "_archive",
}
IGNORED_GENERATED_DIRS = {
    ".git",
    "__pycache__",
    ".pytest_cache",
    ".mypy_cache",
    ".ruff_cache",
    "node_modules",
}
TEXT_SUFFIXES = {
    "",
    ".cff",
    ".cjs",
    ".css",
    ".html",
    ".js",
    ".json",
    ".jsonl",
    ".lock",
    ".md",
    ".mjs",
    ".py",
    ".sh",
    ".toml",
    ".txt",
    ".yaml",
    ".yml",
}
SECRET_PATTERNS = (
    re.compile(r"sk" + r"-or-v1-[A-Za-z0-9_-]{16,}"),
    re.compile(r"sk" + r"-proj-[A-Za-z0-9_-]{16,}"),
    re.compile(r"sk" + r"-ant-[A-Za-z0-9_-]{16,}"),
    re.compile(r"gh" + r"p_[A-Za-z0-9]{20,}"),
    re.compile(r"github" + r"_pat_[A-Za-z0-9_]{20,}"),
    re.compile(r"AKIA[A-Z0-9]{16}"),
    re.compile(r"xox[baprs]-[A-Za-z0-9-]{16,}"),
    re.compile(r"AIza[A-Za-z0-9_-]{30,}"),
    re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----"),
)
MACHINE_PATHS = (
    "/" + "home" + "/" + "deepsearch" + "/",
    "/" + "Users" + "/" + "chenyiwang" + "/",
)


def release_files() -> list[Path]:
    try:
        output = subprocess.check_output(
            [
                "git",
                "ls-files",
                "--cached",
                "--others",
                "--exclude-standard",
                "-z",
            ],
            cwd=ROOT,
        )
    except (OSError, subprocess.CalledProcessError):
        files: list[Path] = []
        for directory, names, filenames in os.walk(ROOT, followlinks=False):
            base = Path(directory)
            files.extend(
                base / name for name in names if (base / name).is_symlink()
            )
            names[:] = [
                name
                for name in names
                if name not in IGNORED_GENERATED_DIRS
                and not name.startswith(".venv")
            ]
            files.extend(base / filename for filename in filenames)
        return sorted(set(files))
    paths = [
        ROOT / value
        for value in output.decode("utf-8").split("\0")
        if value
    ]
    return sorted(path for path in paths if path.exists() or path.is_symlink())


def safe_symlink(path: Path) -> bool:
    target = path.readlink()
    if target.is_absolute():
        return False
    resolved = (path.parent / target).resolve(strict=False)
    try:
        resolved.relative_to(ROOT)
    except ValueError:
        return False
    return True


def main() -> int:
    errors: list[str] = []
    for name in FORBIDDEN_ROOTS:
        if (ROOT / name).exists():
            errors.append("forbidden root directory: %s/" % name)

    files = release_files()
    total = 0
    largest = (0, None)
    for path in files:
        relative = path.relative_to(ROOT)
        parts = set(relative.parts)
        if parts & FORBIDDEN_PARTS:
            errors.append("forbidden generated path: %s" % relative)
        if any(part.startswith(".venv") for part in relative.parts):
            errors.append("virtual environment path: %s" % relative)
        if path.is_symlink():
            if not safe_symlink(path):
                errors.append("unsafe symlink: %s -> %s" % (relative, path.readlink()))
            continue
        try:
            size = path.stat().st_size
        except OSError as exc:
            errors.append("cannot stat %s: %s" % (relative, exc))
            continue
        total += size
        if size > largest[0]:
            largest = (size, relative)
        if size > MAX_FILE_BYTES:
            errors.append(
                "file exceeds GitHub-safe limit (%d bytes): %s" % (size, relative)
            )
        if path.suffix.lower() not in TEXT_SUFFIXES:
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except (OSError, UnicodeDecodeError):
            continue
        for pattern in SECRET_PATTERNS:
            if pattern.search(text):
                errors.append("possible credential in %s" % relative)
                break
        for prefix in MACHINE_PATHS:
            if prefix in text:
                errors.append("machine-specific absolute path in %s" % relative)
                break

    for error in sorted(set(errors)):
        print("ERROR: %s" % error, file=sys.stderr)
    print(
        "release safety: %d file(s), %.2f MiB, largest=%s (%.2f MiB), %d error(s)"
        % (
            len(files),
            total / (1024 * 1024),
            largest[1] or "-",
            largest[0] / (1024 * 1024),
            len(set(errors)),
        )
    )
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
