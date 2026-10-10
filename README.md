# JADeBench

JADeBench evaluates coding agents on recovering JavaScript from protected real-world application modules. This checkout contains the fixed **93-module, 33-project** cohort used in the final FSE 2027 manuscript, its paired source-level and VM-protected inputs, candidate programs, evaluators, and per-output results.

## Paper experiment

Every module is bundled with first-party dependencies and paired with its developer test workload. The evaluated system receives the protected module and a public execution/debug harness; the original and tests stay in a private oracle view. Each system returns one complete replacement program.

The final paper compares **eleven systems**: webcrack and JSimplifier; four static LLMs (GPT-5.6-sol, GLM-5.2, DeepSeek-V4-Pro-0813, Kimi-K2.5); and five coding agents (OpenHands, Claude Code, OpenCode, Kimi Code, Codex) configured with the GPT-5.6-sol model family. Every system has one output for each of 93 modules under both **JSO/full** source-level obfuscation and **VM** protection, giving 2,046 paper cells. The older Synchrony runs are retained only as historical material.

The primary metric, **Execution correctness**, is binary per module: the candidate must pass the complete nonempty developer workload, with a successful exit and no failed, cancelled, or missing tests. Trace comparisons and partial test counts are diagnostics. **Syntax correctness** requires a parseable, loadable program with the statically resolvable export surface. **CodeBLEU-R** and **ROUGE-L** measure source recovery over all 93 outputs, including failed executions. CodeBLEU-R uses JavaScript-token BLEU, candidate-precision weighted n-grams, and clipped-multiset F1 for AST subtrees and normalized data flow. The reference-guided **Readability** score is exploratory: DeepSeek-V4-Pro-0813 rates four dimensions from 1 to 10, summed to 4–40. It is available for 2,037 of the 2,046 JADeBench cells; missing ratings are excluded and shown with their denominators.

## Results

The paper's execution pass counts under JSO/full and VM, respectively, include webcrack **86/93 and 93/93**, OpenHands **78/93 and 54/93**, and static GPT-5.6-sol **17/93 and 3/93**. Under VM, webcrack's output preserves behavior while leaving the interpreter in place, with mean ROUGE-L **0.055**. See the [complete generated leaderboard](results/leaderboard.md), [per-output records](results/paper/ja93.jsonl), and [result provenance](results/paper/manifest.json).

**Metric provenance:** all 2,046 per-output JADeBench records have numeric CodeBLEU-R and ROUGE-L scores, and their aggregates reproduce the final manuscript table at its published precision. CodeBLEU-R scores parser-valid outputs even when the broader Syntax check fails on loading or exports; parser-invalid and empty outputs score zero. Readability means use each system's paired JSO/full–VM rated subjects; original rating coverage is reported separately. See [the scoring provenance](results/paper/README.md).

RQ1 uses a **separate fixed set of 93 JsDeObsBench competitive-programming programs** and seven of the systems above. The comparison is in [results/paper/jsdeobsbench93.md](results/paper/jsdeobsbench93.md); the 100-program CodeNet material in `benchmark/codenet100` is a historical reference archive, not the paper's RQ1 denominator.

RQ4's manuscript resource summaries for the nine model-based systems are in [results/paper/rq4_cost.json](results/paper/rq4_cost.json), with the [per-attempt resource records](results/paper/rq4_attempts.jsonl). Input tokens include prompt and cache tokens. The resource summaries use the recorded token cohorts and runtime observations; their exact denominators are given with the results.

## Verify

Python 3.9+ validates the committed records and candidate hashes:

```bash
python3 scripts/reproduce_results.py --check
python3 scripts/audit_rq4_cost.py
python3 scripts/check_repository.py
python3 scripts/check_release_safety.py
```

For evaluator development, install Node.js 22 and the pinned Python dependencies:

```bash
python3 -m pip install -r evaluators/requirements.txt
npm ci --prefix corpus/tools
PYTHONHASHSEED=0 python3 scripts/audit_codebleu_r.py
```

The public 93-module data is under `benchmark/realworld93`. Score a new JSO/full prediction set with:

```bash
ADB_CORPUS="$PWD/benchmark/realworld93" PYTHONHASHSEED=0 \
python3 evaluators/score.py \
  --manifest benchmark/realworld93/manifest.jsonl \
  --builds benchmark/realworld93/builds-jsob.jsonl \
  --predictions path/to/predictions.jsonl \
  --out path/to/scores.jsonl \
  --no-execution
```

Full execution scoring requires the project-specific oracle environments; see [reproduction details](docs/REPRODUCING.md). The released paper records are frozen outputs from the original experiment. Re-running models or an LLM judge can produce different results.

## Repository layout

- `benchmark/realworld93`: the 93 originals, 93 JSO/full builds, 93 VM builds, manifests, and licenses.
- `results/paper`: final-paper per-output metrics and the separate RQ1 cohort.
- `results/runs`: submitted candidate programs and historical diagnostic scores.
- `evaluators`: full-workload execution, syntax, CodeBLEU-R, ROUGE-L, and judge protocols.
- `baselines`, `sandbox`, `corpus`, `obfuscators`: adapters and construction/evaluation tooling.
- `samples/diverse6`: a six-subject integration fixture, not a performance result.

The MIT license covers repository-authored code and documentation. Upstream programs and derivatives retain their own licenses; see [third-party notices](benchmark/realworld93/THIRD_PARTY_NOTICES.md). No credentials, prompts, transcripts, or private workspaces are included. Citation metadata is in [CITATION.cff](CITATION.cff).
