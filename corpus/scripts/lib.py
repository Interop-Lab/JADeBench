"""Shared helpers for the AgentDeobfBench corpus pipeline.

Every stage reads JSONL in and writes JSONL out, and every rejection is
recorded with its stage and reason so that the attrition table required by
the paper can be produced without re-running anything.
"""
import json
import os
import re
import shlex
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

# The corpus root, the config directory, and the Node tools directory can each
# be redirected by an environment variable. This is what lets a second
# population — the CodeNet reference subset of codenet_ref/ — be processed by
# *these same* stages 3-6 rather than by a fork of them: it runs with
# ADB_CORPUS pointing at its own tree, ADB_CORPUS_CONFIG at its own thresholds
# (identical to this one except for three documented keys), and
# ADB_CORPUS_TOOLS still pointing here, so the extraction and metric code is
# literally the same code. Unset, every path is what it always was.
# ADB_CORPUS is the same variable the evaluators and the obfuscation tier
# already use to point at a corpus root.
ROOT = Path(os.environ.get("ADB_CORPUS")
            or Path(__file__).resolve().parent.parent).resolve()
CONFIG = Path(os.environ.get("ADB_CORPUS_CONFIG") or ROOT / "config").resolve()
RAW = ROOT / "raw"
WORK = ROOT / "work"
SUBJECTS = ROOT / "subjects"
STATS = ROOT / "stats"
LOGS = ROOT / "logs"
TOOLS = Path(os.environ.get("ADB_CORPUS_TOOLS") or ROOT / "tools").resolve()

for _d in (RAW, WORK, SUBJECTS, STATS, LOGS):
    _d.mkdir(parents=True, exist_ok=True)

GITHUB_API = "https://api.github.com"


def load_config(name):
    with open(CONFIG / name, encoding="utf-8") as fh:
        return json.load(fh)


def read_jsonl(path):
    path = Path(path)
    if not path.exists():
        return []
    out = []
    with open(path, encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if line:
                out.append(json.loads(line))
    return out


def write_jsonl(path, rows):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as fh:
        for r in rows:
            fh.write(json.dumps(r, ensure_ascii=False) + "\n")
    return len(rows)


def log(stage, msg):
    line = f"[{time.strftime('%H:%M:%S')}] {stage}: {msg}"
    print(line, flush=True)
    with open(LOGS / f"{stage}.log", "a", encoding="utf-8") as fh:
        fh.write(line + "\n")


class Attrition:
    """Records why each candidate was dropped, per stage.

    The paper requires reporting how many subjects each filtering stage
    removed; this makes that a by-product of running the pipeline rather
    than a separate bookkeeping exercise.
    """

    def __init__(self, stage):
        self.stage = stage
        self.rows = []

    def drop(self, ident, reason, detail=None):
        self.rows.append({
            "stage": self.stage,
            "id": ident,
            "reason": reason,
            "detail": detail,
        })

    def save(self):
        path = STATS / "attrition.jsonl"
        existing = [r for r in read_jsonl(path) if r.get("stage") != self.stage]
        write_jsonl(path, existing + self.rows)
        by_reason = {}
        for r in self.rows:
            by_reason[r["reason"]] = by_reason.get(r["reason"], 0) + 1
        log(self.stage, f"dropped {len(self.rows)}: {by_reason}")
        return by_reason


# --------------------------------------------------------------------------
# GitHub API with on-disk caching. Caching matters because the pipeline is
# meant to be re-runnable after a threshold change without re-spending the
# rate limit on discovery.
# --------------------------------------------------------------------------

CACHE = RAW / "gh_cache"
CACHE.mkdir(parents=True, exist_ok=True)


def _cache_key(url):
    return re.sub(r"[^A-Za-z0-9]+", "_", url)[-180:]


def gh_get(url, params=None, use_cache=True, retries=3):
    if params:
        url = f"{url}?{urllib.parse.urlencode(params)}"
    cpath = CACHE / (_cache_key(url) + ".json")
    if use_cache and cpath.exists():
        with open(cpath, encoding="utf-8") as fh:
            return json.load(fh)

    token = os.environ.get("GITHUB_TOKEN", "").strip()
    headers = {
        "Accept": "application/vnd.github+json",
        "User-Agent": "AgentDeobfBench-corpus/1.0",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"

    for attempt in range(retries):
        req = urllib.request.Request(url, headers=headers)
        try:
            with urllib.request.urlopen(req, timeout=45) as resp:
                payload = json.load(resp)
                remaining = resp.headers.get("X-RateLimit-Remaining")
                if remaining is not None and int(remaining) < 3:
                    reset = int(resp.headers.get("X-RateLimit-Reset", "0"))
                    wait = max(0, reset - int(time.time())) + 2
                    log("gh", f"rate limit nearly exhausted, sleeping {wait}s")
                    time.sleep(wait)
            with open(cpath, "w", encoding="utf-8") as fh:
                json.dump(payload, fh)
            return payload
        except urllib.error.HTTPError as exc:
            if exc.code in (403, 429):
                reset = exc.headers.get("X-RateLimit-Reset")
                if reset:
                    wait = max(0, int(reset) - int(time.time())) + 2
                    log("gh", f"rate limited; sleeping {wait}s "
                              f"({'token set' if token else 'NO TOKEN — set GITHUB_TOKEN'})")
                    time.sleep(min(wait, 3600))
                    continue
            if exc.code == 404:
                return None
            log("gh", f"HTTP {exc.code} on {url}")
            if attempt == retries - 1:
                return None
            time.sleep(2 ** attempt)
        except Exception as exc:  # noqa: BLE001
            log("gh", f"error {exc} on {url}")
            if attempt == retries - 1:
                return None
            time.sleep(2 ** attempt)
    return None


def require_token_hint():
    if not os.environ.get("GITHUB_TOKEN", "").strip():
        log("gh", "GITHUB_TOKEN is not set — discovery is limited to 60 requests/hour. "
                  "Export a token to run at full corpus scale.")


# --------------------------------------------------------------------------- #
# the project's own test command, narrowed to one file
# --------------------------------------------------------------------------- #

# Fallback invocations, used only when stage 2 could not capture the project's
# own command. The project's real invocation is always preferred: running a
# runner bare discards the environment and flags it depends on.
FALLBACK_CMD = {
    "jest":        "npx jest --runTestsByPath --ci",
    "vitest":      "npx vitest run",
    "mocha":       "npx mocha",
    "ava":         "npx ava",
    "tap":         "npx tap --disable-coverage",
    "node:test":   "node --test",
    "uvu":         "npx uvu",
    "jasmine":     "npx jasmine",
    "node-script": "node",
}

# A positional argument naming test files or a glob: this is what gets replaced
# by the one file we want to run. Flags and their values are left alone.
FILE_ARG_RE = re.compile(r"^[^-].*(\*|\.[cm]?[jt]sx?$)|^(test|tests|spec|__tests__)/")

# Flags whose next token is a value (path, pattern, module, …), not a positional
# test file. Without this, `vitest run --exclude test/integration.test.js`
# rewrote the exclude target into the subject test and ran nothing —
# `No test files found` → execution `unsupported` for all three migrate-mongo
# subjects that share that invocation.
FLAG_TAKES_VALUE_RE = re.compile(
    r"^(?:"
    r"--exclude|--include|--ignore|"
    r"--require|-r|"
    r"--config|--configPath|-c|"
    r"--reporter|-R|"
    r"--grep|-g|--fgrep|"
    r"--timeout|--testTimeout|-t|"
    r"--slow|--ui|--environment|"
    r"--dir|--root|--project|--shard|--pool|"
    r"--testNamePattern|--testPathPattern|--testPathIgnorePatterns|"
    r"--setupFiles|--setupFilesAfterEnv|"
    r"--maxWorkers|-w|--outputFile|--transform|--preset|"
    r"--extension|--package"
    r")$"
)

ENV_ASSIGN_RE = re.compile(r"^[A-Za-z_][A-Za-z0-9_]*=")


def specialize(invocation, runner, test_file):
    """Rewrite the project's own test command to run a single file.

    Returns (env_assignments, command). Flags are preserved and only the
    positional file or glob arguments are replaced, which keeps setup the
    suite depends on — dropping `BABEL_ENV=test --require babel-core/register`
    makes every test file fail to parse.

    Environment assignments come back separately because a shell only honours
    them at the very start of a command, and this command gets wrapped in a
    coverage runner before it executes.

    This lives here rather than in a stage because three consumers need it and
    a hand-copy had already appeared: the coverage stage that produced the
    manifest's numbers, `sandbox/scripts/score.py`, and the evaluators' own
    execution harness. The copies agreed on the reviewed corpus when they were
    merged, but they had already drifted in one respect — the copy did not
    re-quote a non-file token containing a space — and a command that is
    assembled two ways is a command whose provenance nobody can state.
    """
    fallback = f"{FALLBACK_CMD.get(runner, 'node')} {shlex.quote(test_file)}"
    if not invocation:
        return "", fallback
    try:
        toks = shlex.split(invocation)
    except ValueError:
        return "", fallback

    env_toks = []
    while toks and ENV_ASSIGN_RE.match(toks[0]):
        env_toks.append(toks.pop(0))
    if not toks:
        return " ".join(env_toks), fallback

    kept, replaced = [], False
    skip_value = False
    for tok in toks:
        if skip_value:
            kept.append(shlex.quote(tok) if " " in tok else tok)
            skip_value = False
            continue
        if tok.startswith("-"):
            kept.append(shlex.quote(tok) if " " in tok else tok)
            # `--flag=value` carries its own value; a bare valued flag owns the
            # next token, which must not be mistaken for a positional test path.
            if "=" not in tok and FLAG_TAKES_VALUE_RE.match(tok):
                skip_value = True
            continue
        if FILE_ARG_RE.match(tok):
            if not replaced:
                kept.append(shlex.quote(test_file))
                replaced = True
            continue
        kept.append(shlex.quote(tok) if " " in tok else tok)
    if not replaced:
        kept.append(shlex.quote(test_file))
    # Mocha waits for the event loop to drain after the reporter finishes.
    # websocket tests leave sockets/timers open, so the process never exits
    # and the execution oracle times out with a full trace already in hand
    # (`unsupported` for every candidate). `--exit` force-quits after tests;
    # it does not skip them. Skip if the project already asked for it.
    if runner == "mocha" and "--exit" not in kept:
        kept.append("--exit")
    return " ".join(env_toks), " ".join(kept)
