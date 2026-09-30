#!/usr/bin/env python3
"""Run JS-OB and VM admission for corpus/build_dataset.

JS-OB admission reuses the sandbox differential oracle (score.py) or, when the
oracle is not usable, an L1 export-set check — the same rules as
obfuscators/scripts/02_admit.py.

VM admission requires both:
  (1) the original bundle's project tests exit 0
  (2) the VM L1 file's project tests exit 0 and match the reference verdict

When evaluators are importable, exec_gate_check also records trace stability
fields from execution.reference_run.

Outputs (updated in place):
  build_dataset/jsob_corpus_full/admit.jsonl
  build_dataset/jsob_corpus_full/manifest.jsonl
  build_dataset/vm_corpus/exec_gate_check.jsonl
  build_dataset/vm_corpus/manifest.jsonl

Usage:
    python3 admit_build_dataset.py [--pending|--all] [--jobs 4] [--limit N]
"""
from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

HERE = Path(__file__).resolve().parent
CORPUS = Path(os.environ.get("ADB_CORPUS", HERE.parent)).resolve()
ARTIFACTS = CORPUS.parent
SANDBOX = Path(os.environ.get("ADB_SANDBOX", ARTIFACTS / "sandbox")).resolve()
OBF_SCRIPTS = ARTIFACTS / "obfuscators" / "scripts"
EVAL_ROOT = ARTIFACTS / "evaluators"

BD = CORPUS / "build_dataset"
ORIGINAL = BD / "original"
JSOB = BD / "jsob_corpus_full"
VM = BD / "vm_corpus"

SCORE = SANDBOX / "scripts" / "score.py"
CAP_NORMAL = 300

sys.path.insert(0, str(OBF_SCRIPTS))
import lib as obf_lib  # noqa: E402


def read_jsonl(path: Path) -> list[dict]:
    if not path.exists():
        return []
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def write_jsonl(path: Path, rows: list[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as fh:
        for row in rows:
            fh.write(json.dumps(row, ensure_ascii=False) + "\n")


def slug(subject_id: str) -> str:
    return subject_id.replace("::", "_").replace("/", "_")


def vm_path(mapping_row: dict) -> Path | None:
    stem = Path(mapping_row["original_file"]).stem
    matches = sorted(VM.glob(stem + "__L1.*"))
    if len(matches) == 1:
        return matches[0]
    return None


def ensure_reference(box: Path) -> bool:
    try:
        subprocess.run(
            ["python3", str(SCORE), "--sandbox", str(box), "--record-reference"],
            capture_output=True,
            text=True,
            timeout=CAP_NORMAL,
        )
    except subprocess.TimeoutExpired:
        pass
    return (box / "reference.json").exists()


def score_candidate(box: Path, candidate: Path) -> dict:
    try:
        proc = subprocess.run(
            ["python3", str(SCORE), "--sandbox", str(box), "--candidate", str(candidate)],
            capture_output=True,
            text=True,
            timeout=CAP_NORMAL,
        )
    except subprocess.TimeoutExpired:
        return {"ran": False, "reason": "timeout"}
    try:
        return json.loads(proc.stdout)
    except ValueError:
        return {"ran": False, "reason": "score_error", "stderr": (proc.stderr or "")[-500:]}


def exports_of(path: Path, fmt: str, cwd: Path) -> list[str] | None:
    if fmt == "esm":
        script = (
            "import(process.argv[1]).then(m=>{"
            "console.log(JSON.stringify(Object.keys(m).sort()))})"
            ".catch(e=>{console.log('__LOAD_ERROR__')})"
        )
    else:
        script = (
            "try{const m=require(process.argv[1]);"
            "console.log(JSON.stringify(m&&typeof m==='object'?Object.keys(m).sort():['default']))}"
            "catch(e){console.log('__LOAD_ERROR__')}"
        )
    try:
        proc = subprocess.run(
            ["node", "-e", script, str(path)],
            capture_output=True,
            text=True,
            timeout=30,
            cwd=str(cwd),
        )
    except subprocess.TimeoutExpired:
        return None
    out = (proc.stdout or "").strip().splitlines()
    if not out or out[-1] == "__LOAD_ERROR__":
        return None
    try:
        return json.loads(out[-1])
    except ValueError:
        return None


def read_reference(box: Path) -> dict:
    ref_file = box / "reference.json"
    if not ref_file.exists():
        return {}
    try:
        return json.loads(ref_file.read_text(encoding="utf-8"))
    except ValueError:
        return {}


def admit_jsob(row: dict, box: Path, bundle_by_subject: dict[str, str]) -> dict:
    sid = row["subject_id"]
    candidate = JSOB / row["jsob_file"]
    if not candidate.exists():
        return {**row, "admitted": False, "reason": "no_jsob_file"}
    if not box.exists():
        return {**row, "admitted": False, "reason": "no_sandbox"}

    ensure_reference(box)
    result = score_candidate(box, candidate)
    if result.get("matches_reference") is True:
        out = {**row, "admitted": True, "admit_mode": "oracle", "passed": result.get("passed")}
        out.pop("reason", None)
        return out
    if result.get("ran") and "matches_reference" in result:
        return {**row, "admitted": False, "reason": "behavior_diverged", "passed": result.get("passed")}
    if result.get("reason") != "no_oracle" and result.get("ran"):
        return {**row, "admitted": False, "reason": result.get("reason", "oracle_inconclusive")}

    agent = box / "agent"
    ref_bundle = CORPUS / bundle_by_subject[sid]
    ref_exports = exports_of(ref_bundle, row["module_format"], agent)
    cand_exports = exports_of(candidate, row["module_format"], agent)
    if cand_exports is None:
        return {**row, "admitted": False, "reason": "load_failed"}
    if ref_exports is None:
        return {**row, "admitted": False, "reason": "reference_load_failed"}
    if cand_exports == ref_exports:
        return {**row, "admitted": True, "admit_mode": "L1_exports", "exports": len(cand_exports)}
    return {
        **row,
        "admitted": False,
        "reason": "exports_diverged",
        "exports": len(cand_exports),
        "reference_exports": len(ref_exports),
    }


def exec_trace_fields(subject_id: str) -> dict | None:
    sys.path.insert(0, str(EVAL_ROOT))
    try:
        from evallib import corpus as ev_corpus  # noqa: WPS433
        from metrics import execution  # noqa: WPS433
    except ImportError:
        return None
    cfg = ev_corpus.load_config()
    subjects = ev_corpus.index_manifest(root=CORPUS)
    subject = subjects.get(subject_id)
    if subject is None or not subject.is_runnable():
        return None
    ref = execution.reference_run(subject, subject.view, cfg["execution"], refresh=False)
    stability = ref.get("stability") or {}
    return {
        "usable": bool(ref.get("usable")),
        "error": ref.get("error"),
        "suite_green": bool(ref.get("suite_green")),
        "exit_code": ref.get("exit_code"),
        "timed_out": bool(ref.get("timed_out")),
        "n_events": len(ref.get("events") or []),
        "mode": stability.get("mode", "sequence"),
        "events_first": stability.get("events_first", len(ref.get("events") or [])),
        "events_second": stability.get("events_second", len(ref.get("events") or [])),
        "runnable": bool(ref.get("usable")),
        "status": "ok" if ref.get("usable") else "unsupported",
    }


def admit_vm(mapping_row: dict, meta: dict, box: Path, with_trace: bool) -> dict:
    sid = mapping_row["subject_id"]
    original = ORIGINAL / mapping_row["original_file"]
    vm_file = vm_path(mapping_row)
    out = {
        "subject_id": sid,
        "vm_file": vm_file.name if vm_file else None,
        "source": "fresh",
    }
    if vm_file is None or not vm_file.exists():
        return {**out, "usable": False, "reason": "no_vm_file", "suite_green": False, "runnable": False, "status": "error"}
    if not original.exists():
        return {**out, "usable": False, "reason": "no_original_file", "suite_green": False, "runnable": False, "status": "error"}
    if not box.exists():
        return {**out, "usable": False, "reason": "no_sandbox", "suite_green": False, "runnable": False, "status": "error"}

    ensure_reference(box)
    ref = read_reference(box)
    orig_score = score_candidate(box, original)
    vm_score = score_candidate(box, vm_file)

    # Differential oracle: match the reference verdict, not an absolute exit 0.
    orig_ok = orig_score.get("matches_reference") is True
    vm_ok = vm_score.get("matches_reference") is True
    passed = orig_ok and vm_ok

    row = {
        **out,
        "usable": passed,
        "error": None if passed else (
            orig_score.get("reason") if not orig_ok else vm_score.get("reason") or "vm_behavior_diverged"
        ),
        "suite_green": bool(ref.get("passed")),
        "exit_code": vm_score.get("exit_code"),
        "timed_out": orig_score.get("reason") == "timeout" or vm_score.get("reason") == "timeout",
        "runnable": passed,
        "status": "ok" if passed else "fail",
        "original_passed": orig_score.get("passed"),
        "original_matches_reference": orig_score.get("matches_reference"),
        "vm_passed": vm_score.get("passed"),
        "vm_matches_reference": vm_score.get("matches_reference"),
    }

    if with_trace and passed:
        trace = exec_trace_fields(sid)
        if trace:
            score_usable = row["usable"]
            row.update({k: trace[k] for k in (
                "n_events", "mode", "events_first", "events_second",
            ) if k in trace})
            # score.py admission is authoritative; trace metadata is diagnostic only.
            row["usable"] = score_usable
            row["runnable"] = score_usable
            row["status"] = "ok" if score_usable else "fail"
            if trace.get("error") and not score_usable:
                row["error"] = trace["error"]
    return row


def base_jsob_row(mapping_row: dict, meta: dict, existing: dict | None) -> dict:
    if existing:
        return dict(existing)
    jsob_file = mapping_row["jsob_file"]
    build_id = jsob_file.rsplit(".", 1)[0]
    candidate = JSOB / jsob_file
    return {
        "subject_id": mapping_row["subject_id"],
        "project": meta["project"],
        "jsob_file": jsob_file,
        "build_id": build_id,
        "original_bundle": meta["bundle_path"],
        "module": meta["module"],
        "module_format": meta["module_format"],
        "test_file": meta["test_file"],
        "test_runner": meta["test_runner"],
        "tool": "javascript-obfuscator",
        "config_id": "full",
        "seed": None,
        "built": candidate.exists(),
        "protect_disabled": True,
        "bytes": candidate.stat().st_size if candidate.exists() else 0,
        "bytes_in": mapping_row.get("bytes_in"),
        "bytes_out": mapping_row.get("bytes_out") or (candidate.stat().st_size if candidate.exists() else 0),
    }


def vm_manifest_row(mapping_row: dict, meta: dict, gate: dict) -> dict:
    vm_file = gate["vm_file"]
    path = VM / vm_file
    return {
        "subject_id": mapping_row["subject_id"],
        "project": meta["project"],
        "vm_file": vm_file,
        "original_bundle": meta["bundle_path"],
        "module": meta["module"],
        "test_file": meta["test_file"],
        "test_runner": meta["test_runner"],
        "bytes": path.stat().st_size if path.exists() else 0,
    }


def process_subject(
    sid: str,
    mapping_row: dict,
    meta: dict,
    existing_admit: dict | None,
    bundle_by_subject: dict[str, str],
    with_trace: bool,
) -> tuple[dict, dict]:
    box = obf_lib.sandbox_dir(sid)
    jsob_row = admit_jsob(base_jsob_row(mapping_row, meta, existing_admit), box, bundle_by_subject)
    vm_row = admit_vm(mapping_row, meta, box, with_trace)
    return jsob_row, vm_row


def main() -> None:
    ap = argparse.ArgumentParser(description="Run build_dataset JS-OB + VM admission")
    scope = ap.add_mutually_exclusive_group()
    scope.add_argument("--pending", dest="scope", action="store_const", const="pending",
                       help="only subjects outside active manifests (default)")
    scope.add_argument("--all", dest="scope", action="store_const", const="all",
                       help="re-run every subject in mapping.jsonl")
    ap.set_defaults(scope="pending")
    ap.add_argument("--jobs", type=int, default=2)
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--no-trace", action="store_true", help="skip execution.reference_run for VM gate extras")
    args = ap.parse_args()
    mapping_rows = read_jsonl(ORIGINAL / "mapping.jsonl")
    mapping = {r["subject_id"]: r for r in mapping_rows}
    manifest_meta = {r["subject_id"]: r for r in read_jsonl(CORPUS / "manifest.jsonl")}
    bundle_by_subject = {sid: r["bundle_path"] for sid, r in manifest_meta.items()}

    existing_admit = {r["subject_id"]: r for r in read_jsonl(JSOB / "admit.jsonl")}
    existing_gate = {r["subject_id"]: r for r in read_jsonl(VM / "exec_gate_check.jsonl")}
    active_jsob = {r["subject_id"] for r in read_jsonl(JSOB / "manifest.jsonl")}
    active_vm = {r["subject_id"] for r in read_jsonl(VM / "manifest.jsonl")}
    active = active_jsob & active_vm

    if args.scope == "pending":
        targets = sorted(set(mapping) - active)
    else:
        targets = sorted(mapping)

    if args.limit:
        targets = targets[: args.limit]

    missing_meta = [sid for sid in targets if sid not in manifest_meta]
    if missing_meta:
        raise SystemExit(f"{len(missing_meta)} subjects missing from corpus/manifest.jsonl")

    print(f"[admit_build_dataset] targets={len(targets)} jobs={args.jobs} cap={CAP_NORMAL}s")
    if args.dry_run:
        for sid in targets:
            print(" ", sid)
        return

    results: dict[str, tuple[dict, dict]] = {}
    with ThreadPoolExecutor(max_workers=args.jobs) as pool:
        futs = {
            pool.submit(
                process_subject,
                sid,
                mapping[sid],
                manifest_meta[sid],
                existing_admit.get(sid),
                bundle_by_subject,
                not args.no_trace,
            ): sid
            for sid in targets
        }
        done = 0
        for fut in as_completed(futs):
            sid = futs[fut]
            results[sid] = fut.result()
            done += 1
            jsob_row, vm_row = results[sid]
            mark = "PASS" if jsob_row.get("admitted") and vm_row.get("usable") else "FAIL"
            print(f"  [{done}/{len(targets)}] {mark} {sid}", flush=True)

    admit_by_subject = dict(existing_admit)
    gate_by_subject = dict(existing_gate)
    for sid, (jsob_row, vm_row) in results.items():
        admit_by_subject[sid] = jsob_row
        gate_by_subject[sid] = vm_row

    admit_rows = sorted(admit_by_subject.values(), key=lambda r: r["subject_id"])
    gate_rows = sorted(gate_by_subject.values(), key=lambda r: r["subject_id"])

    admitted_ids = {r["subject_id"] for r in admit_rows if r.get("admitted")}
    vm_pass_ids = {r["subject_id"] for r in gate_rows if r.get("usable")}
    active_ids = sorted(admitted_ids & vm_pass_ids)

    jsob_manifest = [r for r in admit_rows if r["subject_id"] in active_ids]
    vm_manifest = [
        vm_manifest_row(mapping[sid], manifest_meta[sid], gate_by_subject[sid])
        for sid in active_ids
    ]

    write_jsonl(JSOB / "admit.jsonl", admit_rows)
    write_jsonl(VM / "exec_gate_check.jsonl", gate_rows)
    write_jsonl(JSOB / "manifest.jsonl", jsob_manifest)
    write_jsonl(VM / "manifest.jsonl", vm_manifest)

    print(
        f"[admit_build_dataset] done: jsob_admitted={len(admitted_ids)} "
        f"vm_pass={len(vm_pass_ids)} active_pair={len(active_ids)}"
    )


if __name__ == "__main__":
    main()
