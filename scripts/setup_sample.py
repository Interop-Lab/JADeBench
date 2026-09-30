#!/usr/bin/env python3
"""Install the optional Node dependencies used by the diverse6 sandboxes."""

from __future__ import annotations

import argparse
import shutil
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SAMPLE = ROOT / "samples" / "diverse6" / "sandbox"


def package_directories() -> list[Path]:
    directories = [SAMPLE / "shared", SAMPLE / "vendor"]
    directories.extend(sorted((SAMPLE / "sandboxes").glob("*/oracle")))
    return [path for path in directories if (path / "package.json").is_file()]


def command_for(path: Path) -> list[str]:
    locked = any(
        (path / name).is_file()
        for name in ("package-lock.json", "npm-shrinkwrap.json")
    )
    return [
        "npm",
        "ci" if locked else "install",
        "--ignore-scripts",
        "--legacy-peer-deps",
    ]


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--execute",
        action="store_true",
        help="run installs; the default only prints the commands",
    )
    args = parser.parse_args()

    if shutil.which("npm") is None:
        raise SystemExit("npm was not found; install Node.js 22 and npm first")

    commands = [(path, command_for(path)) for path in package_directories()]
    for path, command in commands:
        relative = path.relative_to(ROOT)
        print("[%s] %s" % (relative, " ".join(command)))
        if command[1] == "install":
            print("  warning: this upstream oracle has no lock file")

    if not args.execute:
        print("\nPreview only. Re-run with --execute to install dependencies.")
        return 0

    for path, command in commands:
        completed = subprocess.run(command, cwd=path, check=False)
        if completed.returncode:
            return completed.returncode
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
