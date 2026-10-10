#!/usr/bin/env python3
"""Regenerate final-paper leaderboards from fixed per-output records."""
import argparse
import hashlib
import json
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PAPER = ROOT / 'results/paper'
SYSTEMS = {'webcrack', 'jsimplifier', 'l0-gpt-sol', 'l0-glm', 'l0-deepseek',
           'l0-kimi', 'openhands', 'claude-code', 'opencode', 'kimi-code', 'codex'}
COMPARISON = {'l0-gpt-sol', 'l0-glm', 'openhands', 'claude-code', 'opencode',
              'kimi-code', 'codex'}
PAPER_ORDER = ('webcrack', 'jsimplifier', 'l0-gpt-sol', 'l0-glm', 'l0-deepseek',
               'l0-kimi', 'openhands', 'claude-code', 'opencode', 'kimi-code', 'codex')
PAPER_NAMES = {'webcrack': 'webcrack', 'jsimplifier': 'JSimplifier',
               'l0-gpt-sol': 'GPT-5.6-sol', 'l0-glm': 'GLM-5.2',
               'l0-deepseek': 'DeepSeek-V4-Pro-0813', 'l0-kimi': 'Kimi-K2.5',
               'openhands': 'OpenHands', 'claude-code': 'Claude Code',
               'opencode': 'OpenCode', 'kimi-code': 'Kimi Code', 'codex': 'Codex'}


def read(path):
    return [json.loads(s) for s in path.read_text(encoding='utf-8').splitlines() if s.strip()]


def mean(rows, field):
    values = [r[field] for r in rows if r.get(field) is not None]
    return None if not values else round(sum(values) / len(values), 6)


def groups(rows, group_field):
    result = defaultdict(list)
    for row in rows:
        result[row[group_field]].append(row)
    return result


def paired_readability_subjects(rows):
    """Match the manuscript's paired JSO/full–VM readability comparison."""
    result = {}
    for system, items in groups(rows, 'system').items():
        rated = {
            protection: {r['subject_id'] for r in items
                         if r['protection'] == protection and r['readability'] is not None}
            for protection in ('jsob-full', 'vm-l1')
        }
        result[system] = rated['jsob-full'] & rated['vm-l1']
        if not result[system]:
            raise ValueError(f'no paired readability ratings for {system}')
    return result


def summarize(rows, readability_subjects=None):
    result = []
    for system, items in sorted(groups(rows, 'system').items()):
        rated = [r for r in items if r['readability'] is not None]
        selected = (rated if readability_subjects is None else
                    [r for r in rated if r['subject_id'] in readability_subjects[system]])
        if readability_subjects is not None and len(selected) != len(readability_subjects[system]):
            raise ValueError(f'incomplete paired readability ratings for {system}')
        result.append(dict(system=system, n=len(items), syntax=mean(items, 'syntax'),
                           execution=mean(items, 'execution'),
                           passes=sum(x['execution'] for x in items),
                           codebleu_r=mean(items, 'codebleu_r'),
                           rouge_l=mean(items, 'rouge_l'),
                           readability=mean(selected, 'readability'),
                           readability_n=len(selected),
                           readability_rated_n=len(rated)))
    return result


def check():
    ja = read(PAPER / 'ja93.jsonl')
    code = read(PAPER / 'jsdeobsbench93.jsonl')
    ids = {x['subject_id'] for x in read(ROOT / 'benchmark/realworld93/sample_ids.jsonl')}
    if len(ids) != 93 or len(ja) != 2046 or len(code) != 651:
        raise ValueError('final-paper cohort sizes differ from 93 x 11 x 2 and 93 x 7')
    by_protection = groups(ja, 'protection')
    if set(by_protection) != {'jsob-full', 'vm-l1'}:
        raise ValueError('incorrect protection conditions')
    for protection, rows in by_protection.items():
        by_system = groups(rows, 'system')
        if set(by_system) != SYSTEMS:
            raise ValueError('incorrect JADeBench system set')
        for system, group in by_system.items():
            if len(group) != 93 or {r['subject_id'] for r in group} != ids:
                raise ValueError(f'incomplete {protection}/{system}')
            run = ROOT / 'results/runs' / system / protection
            outputs = {r['subject_id']: run / r['path'] for r in read(run / 'predictions.jsonl')}
            for row in group:
                output = outputs.get(row['subject_id'])
                if output is None or not output.is_file() or hashlib.sha256(output.read_bytes()).hexdigest() != row['candidate_sha256']:
                    raise ValueError(f'candidate hash differs: {protection}/{system}/{row["subject_id"]}')
    code_groups = groups(code, 'system')
    code_ids = {r['subject_id'] for r in code}
    if set(code_groups) != COMPARISON or len(code_ids) != 93:
        raise ValueError('incorrect JsDeObsBench comparison cohort')
    for system, rows in code_groups.items():
        if len(rows) != 93 or {r['subject_id'] for r in rows} != code_ids:
            raise ValueError(f'incomplete JsDeObsBench run {system}')
        run = ROOT / 'results/codenet100/runs' / system / 'jsob-full'
        outputs = {r['subject_id'].split('::')[-1]: run / r['path']
                   for r in read(run / 'predictions.jsonl')}
        for row in rows:
            output = outputs.get(row['subject_id'])
            if output is None or not output.is_file() or hashlib.sha256(output.read_bytes()).hexdigest() != row['candidate_sha256']:
                raise ValueError(f'JsDeObsBench candidate hash differs: {system}/{row["subject_id"]}')
    if sum(r.get('readability_available', r.get('readability') is not None) for r in ja) != 2037:
        raise ValueError('JADeBench judge coverage differs from paper')
    if any(r.get('readability_available', r['readability'] is not None)
           != (r['readability'] is not None) for r in ja):
        raise ValueError('readability availability differs from numeric ratings')
    if any(r.get('pending_metrics') for r in ja):
        raise ValueError('unresolved per-output metric groups remain')
    return ja, code


def table(rows, title):
    lines = [f'## {title}', '',
             '| System | Syntax (%) | Execution (%) | Passes | CodeBLEU-R | ROUGE-L | Readability (n) |',
             '| --- | ---: | ---: | ---: | ---: | ---: | ---: |']
    for x in rows:
        rating = '—' if x['readability'] is None else f'{x["readability"]:.1f} ({x["readability_n"]})'
        syntax = x.get('syntax_percent', round(100 * x['syntax'], 1))
        execution = x.get('execution_percent', round(100 * x['execution'], 1))
        lines.append(f'| {PAPER_NAMES[x["system"]]} | {syntax:.1f} | {execution:.1f} | '
                     f'{x["passes"]}/93 | {x["codebleu_r"]:.3f} | {x["rouge_l"]:.3f} | {rating} |')
    return lines + ['']


def generated():
    ja, code = check()
    paired = paired_readability_subjects(ja)
    sections = {p: sorted(summarize([r for r in ja if r['protection'] == p], paired),
                          key=lambda row: PAPER_ORDER.index(row['system']))
                for p in ('jsob-full', 'vm-l1')}
    manuscript = json.loads((PAPER / 'manuscript_table.json').read_text(encoding='utf-8'))
    cost = json.loads((PAPER / 'rq4_cost.json').read_text(encoding='utf-8'))
    if len(cost['rows']) != 18 or {row['system'] for row in cost['rows']} != SYSTEMS - {'webcrack', 'jsimplifier'}:
        raise ValueError('RQ4 manuscript cost table must cover nine model systems twice')
    for protection, items in sections.items():
        reported = manuscript['protections'][protection]
        if set(reported) != SYSTEMS:
            raise ValueError('manuscript table system set differs')
        for row in items:
            values = reported[row['system']]
            for key in ('syntax', 'execution'):
                reported_percent = values[key + '_percent']
                actual_percent = round(100 * row[key], 1)
                if actual_percent != reported_percent:
                    raise ValueError(f'{key} does not match manuscript: '
                                     f'{protection}/{row["system"]}: '
                                     f'{actual_percent} != {reported_percent}')
                row[key + '_percent'] = reported_percent
            for key in ('codebleu_r', 'rouge_l', 'readability'):
                archived = row[key]
                paper = values[key]
                if archived is None or abs(archived - paper) > (0.0005 if key != 'readability' else 0.05):
                    raise ValueError(f'released mean does not round to manuscript: {protection}/{row["system"]}/{key}')
                row[key] = paper
            row['aggregate_source'] = 'manuscript_table'
    comparison = summarize(code)
    payload = {'schema_version': 'jadebench-final-paper-v2', 'benchmark': 'JADeBench-93',
               'primary_metric': 'complete_workload_execution',
               'protections': sections, 'jsdeobsbench93_comparison': comparison,
               'source': 'results/paper/ja93.jsonl and results/paper/jsdeobsbench93.jsonl'}
    md = ['# Final-paper results', '',
          'Similarity and readability aggregates below follow the final manuscript Table RQ2.',
          'Execution, syntax, and similarity use all 93 outputs per condition. Readability',
          'uses each system\'s rated-subject intersection across JSO/full and VM protection;',
          'the paired denominator is shown. The unpaired rated count is retained in JSON.',
          'Historical `scores.jsonl` uses an earlier evaluator and is not the paper result.', '']
    md += table(sections['jsob-full'], 'Source-level obfuscation (JSO/full)')
    md += table(sections['vm-l1'], 'VM protection')
    comparison_md = ['# JsDeObsBench comparison (RQ1)', '',
                     'A separate fixed 93-program cohort under the prior benchmark configuration.', '']
    comparison_md += table(comparison, 'Seven systems')
    manifest = json.loads((PAPER / 'manifest.json').read_text(encoding='utf-8'))
    manifest['canonical_records_sha256'] = {
        name: hashlib.sha256((PAPER / name).read_bytes()).hexdigest()
        for name in ('ja93.jsonl', 'jsdeobsbench93.jsonl',
                     'manuscript_table.json', 'rq4_cost.json',
                     'rq4_attempts.jsonl', 'rq4_sources.json')}
    return {ROOT / 'results/leaderboard.json': json.dumps(payload, indent=2) + '\n',
            ROOT / 'results/leaderboard.md': '\n'.join(md).rstrip() + '\n',
            PAPER / 'jsdeobsbench93.md': '\n'.join(comparison_md).rstrip() + '\n',
            PAPER / 'manifest.json': json.dumps(manifest, indent=2) + '\n'}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    try:
        files = generated()
        if args.check:
            stale = [str(p.relative_to(ROOT)) for p, value in files.items()
                     if not p.is_file() or p.read_text(encoding='utf-8') != value]
            if stale:
                raise ValueError('stale generated files: ' + ', '.join(stale))
            print('final-paper results and candidate hashes are consistent')
        else:
            for path, value in files.items():
                path.write_text(value, encoding='utf-8')
                print(path.relative_to(ROOT))
    except (OSError, ValueError, KeyError, json.JSONDecodeError) as error:
        print(f'ERROR: {error}', file=sys.stderr)
        return 1
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
