#!/usr/bin/env python3
"""Verify paper CodeBLEU-R scores against released candidates and references.

By default, re-score the 69 parser-valid outputs that fail the broader Syntax
axis. Use --all to re-score every one of the 2,046 JADeBench outputs. Both
modes also check that parser-invalid/empty outputs have zero CodeBLEU-R.
"""
import argparse
import json
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'evaluators'))
from metrics.codebleu_recovery import evaluate  # noqa: E402
from metrics.syntax import parser_accepts  # noqa: E402


def rows(path):
    return [json.loads(line) for line in path.read_text(encoding='utf-8').splitlines()
            if line.strip()]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--all', action='store_true', help='re-score all 2,046 records')
    args = parser.parse_args()
    if os.environ.get('PYTHONHASHSEED') != '0':
        parser.error('set PYTHONHASHSEED=0 for deterministic data-flow normalization')

    samples = {row['subject_id']: ROOT / 'benchmark/realworld93/original' / row['original_file']
               for row in rows(ROOT / 'benchmark/realworld93/sample_ids.jsonl')}
    records = rows(ROOT / 'results/paper/ja93.jsonl')
    paths = {}
    for run in (ROOT / 'results/runs').iterdir():
        if not run.is_dir():
            continue
        for protection in ('jsob-full', 'vm-l1'):
            pred = run / protection / 'predictions.jsonl'
            if pred.exists():
                for row in rows(pred):
                    paths[run.name, protection, row['subject_id']] = pred.parent / row['path']

    checked = 0
    exceptional = 0
    for row in records:
        status = row['codebleu_scoring_status']
        if status == 'invalid_or_empty':
            if row['codebleu_r'] != 0:
                raise ValueError(f'nonzero invalid output: {row["system"]}/{row["subject_id"]}')
            continue
        if status not in ('scored', 'scored_valid_jsx'):
            raise ValueError(f'unknown source scoring status: {status}')
        is_exception = row['syntax'] == 0
        exceptional += is_exception
        if not (args.all or is_exception or status == 'scored_valid_jsx'):
            continue
        candidate = paths[row['system'], row['protection'], row['subject_id']]
        candidate_source = candidate.read_text(encoding='utf-8')
        if not parser_accepts(candidate_source):
            raise ValueError(f'scored candidate does not parse: {row["protection"]}/'
                             f'{row["system"]}/{row["subject_id"]}')
        actual = evaluate(candidate_source,
                          samples[row['subject_id']].read_text(encoding='utf-8'))['codebleu_r']
        if actual != row['codebleu_r']:
            raise ValueError(f'CodeBLEU-R differs: {row["protection"]}/{row["system"]}/'
                             f'{row["subject_id"]}: {actual} != {row["codebleu_r"]}')
        checked += 1
    if len(records) != 2046 or exceptional != 69:
        raise ValueError(f'unexpected cohort or exceptional score count: {len(records)}, {exceptional}')
    print(f'verified {checked} CodeBLEU-R scores; 69 parser-valid Syntax-axis failures retained')


if __name__ == '__main__':
    main()
