#!/usr/bin/env python3
"""Shared sandbox helpers used by the agent baselines."""

from __future__ import annotations

import json
import os
import shutil
import tempfile
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
SANDBOX_ROOT = Path(
    os.environ.get(
        "ADB_SANDBOX",
        PROJECT_ROOT / "samples" / "diverse6" / "sandbox",
    )
).expanduser().resolve()
SANDBOX_INDEX = SANDBOX_ROOT / "stats" / "sandboxes.json"


def load_sandboxes():
    """Return usable subject ids mapped to their sandbox directories."""
    rows = json.loads(SANDBOX_INDEX.read_text(encoding="utf-8")).get(
        "results", []
    )
    sandboxes = {}
    for row in rows:
        if not row.get("ok") or not row.get("subject_id") or not row.get("path"):
            continue
        box = SANDBOX_ROOT / row["path"]
        if (box / "agent" / "sandbox.json").is_file():
            sandboxes[row["subject_id"]] = box
    return sandboxes


def make_workspace(agent_dir, entry, source):
    """Copy an agent view into an isolated temporary workspace."""
    tmp = Path(tempfile.mkdtemp(prefix="adb-l1-"))
    workspace = tmp / "agent"
    try:
        shutil.copytree(
            str(agent_dir),
            str(workspace),
            symlinks=True,
        )
        target = workspace / entry
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(source, encoding="utf-8")
    except Exception:
        shutil.rmtree(str(tmp), ignore_errors=True)
        raise
    return tmp, workspace
