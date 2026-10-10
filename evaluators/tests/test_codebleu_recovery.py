#!/usr/bin/env python3
"""Check the final-paper CodeBLEU-R implementation against a frozen output."""
import json
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from metrics.codebleu_recovery import evaluate  # noqa: E402
from metrics import similarity, syntax  # noqa: E402


def main():
    if os.environ.get('PYTHONHASHSEED') != '0':
        raise SystemExit('run with PYTHONHASHSEED=0')
    root = Path(__file__).resolve().parents[2]
    index = {row['subject_id']: row for row in map(json.loads,
             (root / 'benchmark/realworld93/sample_ids.jsonl').open())}
    subject_id = '0xranx__OpenContext::src/core/config.js'
    reference = (root / 'benchmark/realworld93/original' /
                 index[subject_id]['original_file']).read_text()
    run = root / 'results/runs/webcrack/jsob-full'
    prediction = next(row for row in map(json.loads, (run / 'predictions.jsonl').open())
                      if row['subject_id'] == subject_id)
    candidate = (run / prediction['path']).read_text()
    actual = evaluate(candidate, reference)
    assert actual['codebleu_r'] == 0.738448, actual
    assert actual['weighted_precision'] == 0.708853, actual
    assert actual['dataflow_f1'] == 0.715953, actual
    assert evaluate(reference, reference)['codebleu_r'] == 1.0

    # This candidate parses but fails the broader Syntax axis at Node check.
    # The paper still scores its source resemblance, so it must not be zeroed.
    subject_id = 'eslint__markdown::src/language/markdown-source-code.js'
    reference = (root / 'benchmark/realworld93/original' /
                 index[subject_id]['original_file']).read_text()
    run = root / 'results/runs/l0-kimi/jsob-full'
    prediction = next(row for row in map(json.loads, (run / 'predictions.jsonl').open())
                      if row['subject_id'] == subject_id)
    candidate = (run / prediction['path']).read_text()
    parsed = syntax.evaluate(candidate, reference)
    assert parsed['parses'] is True and parsed['score'] == 0
    resemblance = similarity.evaluate(candidate, reference, parse_status=parsed['parses'])
    assert resemblance['codebleu_r'] == 0.613152, resemblance
    assert resemblance['rouge_l'] == 0.834932, resemblance
    print('CodeBLEU-R frozen-output parity passed')


if __name__ == '__main__':
    main()
