# Evaluators — AgentDeobfBench

Implements the scoring half of §3.2 (*Task, Evaluators, and Runtime*) of
`benchmark/main.tex`. Every evaluated system — one-shot prompting, a shipped
coding agent, or a traditional deobfuscator — returns **one JavaScript
program**, and that program is scored
here. The evaluators do not know which system, corpus, access level, or
obfuscation tier produced it. That is the whole point: because the artifact and
the scoring never change, a difference between two conditions is attributable to
the manipulated factor rather than to a redefined goal.

This directory is the concrete answer to the paper's §3.2 TODO — *"固定每个评价器
的实现与阈值 … 给出相似度与复杂度的具体度量与版本"*. Every threshold, weight, and
version lives in `config/eval.json`; nothing is hard-coded in the metric code.

**Scope of this release.** Four of the five evaluators are implemented: syntax
correctness, execution correctness, simplification, and similarity. Identifier
recovery is **not** implemented — see [Identifier recovery](#identifier-recovery-not-implemented).

---

## Quick start

```bash
# score a run
python3 score.py --predictions runs/claude-code/predictions.jsonl \
                 --builds     builds/builds.jsonl \
                 --out        results/claude-code.jsonl --jobs 4

# validate the harness against the corpus (expects a perfect score everywhere)
python3 selfcheck.py --jobs 4

# tests
python3 tests/test_metrics.py       # static evaluators, no checkout needed
python3 tests/test_suite_recall.py  # execution score = tests ∩ trace
python3 tests/test_execution.py     # the differential harness

# safety
python3 score.py --verify-clean     # is every sandbox oracle view untouched?
python3 score.py --repair           # undo substitutions left by a crashed run
```

Requirements: `pip install -r requirements.txt` (Python 3.9+, tree-sitter);
Node 22 and the corpus's own `tools/node_modules` (esbuild) for execution
scoring. The static evaluators need neither Node nor a checkout.

Execution scoring needs **both** stages present: the corpus checkout (read-only —
it supplies the reference bundle and decides the shim's module flavour) and the
built sandboxes (where the run happens). `ADB_CORPUS`, `ADB_SANDBOX`, and
`ADB_OBFUSCATORS` override their locations, matching `baselines/lib/common.py`.

### Sanity-checking a scoring setup

Three "oracle systems" bracket what any real system can score, and running them
first is the cheapest way to confirm a `builds.jsonl` / `predictions.jsonl` pair
is wired up correctly:

| oracle | returns | expected |
|---|---|---|
| perfect | the original bundle | syntax 1, execution 1.0, similarity 1.0, `anchored` 1.0 |
| identity | the obfuscated build unchanged | execution 1.0 (obfuscation preserves behaviour), similarity low, `rel_obf` 0 |
| empty | `export default {}` | execution 0.0, similarity ≈ 0, `over_simplified` true |

The `identity` row is the useful one: it must score 1.0 on execution. If it does
not, the harness — not the system — is broken.

Two caveats on that row, both of which are properties of the input rather than of
the harness. It does **not** apply on the `anti` and `full` rungs, where the
build's own anti-analysis code defeats the substitution: those are scored
`defense_triggered` and are excluded by construction. And it does not apply to
the **150 of 1295** builds whose `admit_mode` is `L1_exports` rather than
`oracle` — those were admitted on their export surface alone because the subject
has no usable oracle, so behavioural equivalence was never established for them.
`admit_mode` is carried into every score record so an analysis can exclude
them.

---

## Data contract

Three JSONL files connect obfuscation, the evaluated systems, and this
directory. Paths inside a record resolve relative to the file that contains
them, so a run can be moved as a directory.

```jsonc
// builds.jsonl — one obfuscated program: subject × tier × configuration
{"build_id": "os.L3.ws-extension", "subject_id": "websockets__ws::lib/extension.js",
 "tier": "open-source", "tool": "javascript-obfuscator", "config_id": "L3-flatten",
 "seed": 42, "path": "builds/open-source/L3/ws-extension.js"}

// predictions.jsonl — one returned program: build × system
{"prediction_id": "claude-code.os.L3.ws-extension", "build_id": "os.L3.ws-extension",
 "subject_id": "websockets__ws::lib/extension.js", "system": "claude-code", "level": "claude_code",
 "path": "out/ws-extension.js",
 "cost": {"tokens": 48213, "tool_calls": 17, "executions": 5, "seconds": 96.4}}

// results/scores.jsonl — one line per prediction (this directory's output)
{"prediction_id": "…", "subject_id": "…", "build_id": "…", "system": "…",
 "model": null, "level": "claude_code", "tier": "open-source", "config_id": "L3-flatten",
 "admit_mode": "oracle", "status": "ok",
 "syntax": {…}, "execution": {…}, "simplification": {…}, "similarity": {…},
 "identifier": null, "cost": {…}, "diagnostics": {"tool_ok": true}, "note": null}
```

Two fields exist so that a low score can be *interpreted* rather than merely
recorded. `admit_mode` says how the build earned its place in the tier — `oracle`
(its suite re-ran and matched) or `L1_exports` (only its export surface was
checked, because the subject has no usable oracle). `diagnostics` passes through
whatever the driver in `baselines/` attached to the prediction —
`defense_events`, `input_truncated`, `tool_ok`, `call_failed`, `driver_error`.
None of it touches scoring, and the evaluators stay blind to which system
produced a program; but a system whose input was truncated or whose debugger was
defeated did not fail the same way as one that simply answered badly, and
dropping these made the two indistinguishable in `scores.jsonl`.

`builds.jsonl` is optional. Without it the simplification score is `null`
(there is no obfuscated input to measure a reduction against) and everything
else is computed normally. A prediction may carry inline `code` instead of a
`path`. **A missing output file is not an error** — a system that returned
nothing is a result, and is scored as one.

### `status`

| value | meaning |
|---|---|
| `ok` | scored normally |
| `degraded` | scored, but with a weaker execution oracle — either no traced calls (suite agreement only) or an unreproducible call order (event overlap instead of sequence) |
| `unsupported` | **the harness** cannot measure this subject — never charged to the system |
| `defense_triggered` | **the build's own anti-analysis code** defeated the measurement — never charged to the system |
| `timeout` | the candidate's run exceeded `execution.timeout_sec` |
| `harness_error` | the evaluator itself failed |

The `unsupported`/`ok` split is load-bearing for the paper: §7 requires that a
subject the runtime cannot handle be reported separately from a system that
failed, and this field is what carries that distinction into the analysis.
`defense_triggered` is the same requirement for a third case, and it is not a
hypothetical one — see [Anti-analysis rungs](#anti-analysis-rungs-defense_triggered).
Both carry a **null** score rather than 0.0, so a mean over `behaviour_match`
cannot silently absorb them.

---

## The evaluators

### Syntax correctness → `metrics/syntax.py`

The score is `1` or `0`, and it asks only whether the program is syntactically
valid:

1. tree-sitter reports no `ERROR` and no `MISSING` node.
2. `node --check` accepts the program written as `.mjs` (every subject bundle is
   ESM). tree-sitter recovers from errors by design and will accept text V8
   rejects, and the returned program has to run on Node.

Export names are still read and stored (`exports_declared`, `exports_missing`,
`exports_unresolved`). They do not change the score. An obfuscator hides those
names in a string table while the module still loads, and treating that as a
syntax failure contradicted an execution score of 1.0 on the same program. A
program that does not parse is still refused by the execution evaluator before
any run.

**The export surface is read from both module systems** (`schema_version` 2).
`jsast.exported_names` originally recognised only `export` statements, which was
correct when every bundle was ESM and became a no-op the moment bundles began
following the project's own module system: on all **131 of 171** CommonJS
subjects the check found an empty expected surface, passed vacuously, and
silently reduced syntax correctness to "it parses". It now also reads
`module.exports = {…}`, `module.exports = <expr>`, `exports.foo`, esbuild's
`__export(exports, {…})`, and `Object.defineProperty(exports, "…")`, and returns
the union, so a candidate is free to answer in either syntax — esbuild converts
it before execution anyway.

**`module.exports = <identifier>` is resolved, not guessed** (`schema_version` 3).
Recording it as `default` was a claim rather than a conservative reading: it
asserts the module has exactly one export when the truth is not yet known, so on
a reference with named exports every one of them is reported missing. webcrack
answers in exactly this shape on the `full` rung — `module.exports = _0x5cddf9` —
and the module exports all ten of its names at run time. **That artifact scored
syntax 0 and execution 1.0 simultaneously**: two contradictory verdicts on one
program, and the static one was wrong. 99 of the 171 reference bundles carry
named exports, which is the population the false claim bites.

Answering `*` for every identifier would be sound but would throw away a contract
that is usually right there: `websockets/ws` ends with `module.exports = WebSocket`
after attaching `WebSocket.Server` and five more at module scope, and those *are*
importable names. So the name is resolved against the module's own scope — bound
to a class or function, the surface is `default` plus its module-scope
`Name.prop = …` statics; bound to an object literal, its keys plus the same. Only
a value that genuinely cannot be resolved — a call, a member access, an unbound or
obfuscated name — falls back to `*`. That took the bundles whose whole surface is
unresolvable from 22 down to **6**, all of them genuine (`var WebSocket =
require_websocket()` and friends).

`*` on the *reference's* side means the contract is unreadable, which is a defect
of the reference and cannot condemn an answer, so it is dropped from the required
set and recorded as `exports_unresolved` — a visible abstention rather than a
silent pass.

Three details make that sound. CommonJS assignments are collected from the
**module's own scope only**, crossing blocks but never entering a function or
class: an esbuild CommonJS bundle wraps every inlined dependency in
`__commonJS({ "path"(exports, module) { … } })`, so descending into functions
would collect each bundled dependency's exports as the subject's. A guarded
`if (typeof module !== 'undefined') module.exports = X` still counts, because an
`if` introduces no new `module` binding. And `module[<expr>] = …` is recorded as
`*` — an unresolvable set that covers anything, the convention `export *` and
`...spread` already use — because with the string array on, obfuscation turns
`module.exports` into `module[_0x15d20b(-0xc7,-0xd5)]`; reading that as
"declares nothing" scored the `identity` oracle, which exports correctly at
runtime and reaches execution 1.0, as having dropped all ten of its exports.

Every one of the 171 clean bundles has a non-empty, non-inflated surface (median
2 names, max 35) and scores 1 against itself. Across the predictions already on
disk the change flips 2 records from 0 to 1 — both of them the
`syntax 0 / execution 1.0` contradiction above — and leaves 5 genuine zeros and
50 ones untouched.

### Execution correctness → `metrics/execution.py` (primary measure)

**The score is the fraction of originally-passing tests that still pass.** The
export-surface trace is recorded so a failure can be read; it does not change
the score. The subject's own test file is the workload. It runs twice —
once with the reference bundle standing in for the subject module, once with the
candidate. `suite_recall` is the fraction of originally-passing tests that still
pass (extra candidate failures are charged; failures the bundle already had are
not). The two behaviour traces are still compared as `behaviour_match` so a
failure can be read; they do not change `score`. A plugin whose exported
installer matches but whose tests fail therefore cannot score 1.0.

A trace event is a call into the module's exported surface (`call`, `new`) with
its serialised arguments, and its outcome (`return`, `constructed`, `throw`,
`resolve`, `reject`), plus every host-API call made while such a call is on the
stack (`host`). Host globals are listed in `config/eval.json`
(`execution.host_globals`) and are **recorded, never stubbed**: stubbing
`Date.now` or a timer would change the program being measured.

**A trace records only rename-invariant facts** (`schema_version` 2; scores
produced under version 1 must be regenerated). This is not a detail — getting it
wrong inverted the primary measure. Version 1 serialised a function value as
`@fn:<name>`, which made a returned function's *identifier* part of its
observable behaviour. Deobfuscation necessarily changes identifiers, so a
behaviourally perfect answer was scored as divergent unless it happened to
reproduce the developer's original name:

```
webcrack on pompelmi__pompelmi::packages/nextjs/index.js, anti rung
  tests_reference {passed: 6, failed: 0}   tests_candidate {passed: 6, failed: 0}
  exit_code_match True                      reference_suite_green True
  first_divergence index 1
    reference  return withPompelmi → "@fn:pompelmiHandler"
    candidate  return withPompelmi → "@fn:_0x2c14b5"
  behaviour_match 0.083     ← after the fix: 1.0
```

Every test passed on both sides; the only difference was a name. Prefix matching
then amplified one mismatch at index 1 into a near-zero score. The measure was
scoring identifier recovery — an evaluator that is deliberately *not* implemented
here — inside execution correctness, and scoring it backwards, since a system
that renamed the function to something readable was penalised exactly as much as
one that left `_0x2c14b5`.

Three places leaked a renameable identifier, and all three are now closed:

| value | version 1 | version 2 |
|---|---|---|
| function | `@fn:<name>` | `@fn/<arity>` |
| class instance | `@class:<ctor.name>` | `@class:<name>` if the constructor is ambient, else `@class:@custom` |
| error | `@error:<ctor.name>` | same ambient test, else `@error:custom`; `message` unchanged |

*Ambient* means `globalThis[ctor.name] === ctor` — true of `TypeError`, `Map`,
`Buffer`, false of a class the subject declares. Built-in names are intrinsic and
an obfuscator cannot rename them, so which one came back is genuine behaviour and
is still compared.

Own property names are still compared as-is, which is sound only because the
obfuscation suite keeps `renameProperties` off throughout. Enabling it would
reopen the same hole through object keys.

**`selfcheck.py` is blind to this class of defect by construction**: it submits
each subject's own reference bundle, so every name matches trivially. Only the
`identity` oracle or a real system exposes it — which is why the three oracle
systems in `../baselines/scripts/05_manifest.py --oracle` are worth running
before trusting a scoring setup.

Reference runs are cached per (subject, bundle checksum, **tracer checksum**).
The tracer term was added with this fix: without it, a serialisation change would
serve a reference recorded in the old format and report every candidate as
divergent, silently.

| field | meaning |
|---|---|
| `score` | **the score**: `suite_recall` (trace is diagnostic only) |
| `suite_recall` | originally-passing tests that still pass ÷ originally-passing tests |
| `behaviour_match` | export-surface trace agreement (diagnostic; was the score before this change) |
| `comparison_mode` | `sequence` or `multiset` — how `behaviour_match` was computed |
| `trace_match` | matched prefix ÷ max(reference, candidate) events |
| `event_f1` | multiset overlap of events |
| `first_divergence` | index, and both events, so a failure can be read |
| `exit_code_match`, `tests_reference`, `tests_candidate` | suite-level counts parsed from the runner's own output |
| `reference_suite_green` | whether the reference run's suite passed (see the gate, below) |

Prefix matching rather than set matching is the default because behaviour is a
sequence: a candidate that produces the right calls in the wrong order has not
preserved behaviour. `trace_match` is normalised by the *longer* of the two
traces, so a candidate that reproduces every reference call and then keeps going
— an extra request, a retry loop, a duplicated write — does not score 1.0.

**Reproducibility is measured, not assumed.** The reference is run twice and the
two traces compared:

| outcome | `comparison_mode` | score | status |
|---|---|---|---|
| identical | `sequence` | `trace_match` | `ok` |
| same events, different order | `multiset` | `event_f1` | `degraded` |
| different events | — | — | `unsupported` |

This is not hypothetical. vitest interleaves calls from concurrent tests, so
`seppevs__migrate-mongo::lib/env/config.js` returns the same 4838 events in a
different order every run; compared as a sequence, a *perfect* candidate scores
0.0002. Where order carries no information, multiset overlap is the strongest
sound comparison. Where even the events differ, nothing can be measured — the
subject's own noise would be indistinguishable from a candidate's error.

**Where the substitution happens.** In the subject's own sandbox oracle view,
`sandbox/sandboxes/<box>/oracle/`, at the module's original project-relative
path. It used to happen in the shared project checkout under `corpus/work/`,
which made the evaluators the only consumer in the artifact that wrote into the
corpus; differential admission (`obfuscators/scripts/02_admit.py`, via
`sandbox/scripts/score.py`) and the agent ladder (`baselines/lib/mount.py`)
already mounted into the sandbox. Scoring is now in the same place, so the
checkout is a read-only input and a crashed run can damage at most one box.

Two inputs deliberately still come from the corpus, and keeping them there is
what makes the move checkable rather than merely plausible:

- the shim's **module flavour** comes from `corpus/work/<project>/<module>`, the
  file the shim stands in for. The manifest's `module_format` describes the
  *bundle* and says `cjs` while the module's own source is ESM on **59 of the
  171** subjects, so reading it here would silently reformat a third of the
  corpus.
- the **esbuild platform** comes from the manifest's `platform`, not from
  `sandbox.json`'s `runtime`, which describes the agent view's host emulation
  and disagrees with `platform` on two dozen subjects in both directions.

**How the substitution works.** The candidate is converted to the subject
module's own module format with esbuild (no bundling) and written beside the
slot as `.adb_impl.js`; a generated `.adb_tracer.js` sits next to it; the slot
itself receives a generated shim that imports the tracer, then the
implementation, and re-exports the reference surface through tracing proxies.
The project's own test command — obtained by reusing
`corpus/scripts/lib.py::specialize()`, fed the oracle's own
`invocation`/`runner`/`test_file` — then runs **unmodified**, with
`cwd` = the oracle view.

The slot is empty by contract: `build_sandboxes.py` excludes the module under
test from the oracle view, precisely because it is the thing to be substituted.
So the run's invariant is *the slot is absent afterwards*, not *the file is
restored to its original checksum*. Anything found occupying it belongs to an
earlier mount by another stage and is moved aside whole and moved back, never
copied over.

**The ESM shim unwraps one layer of CommonJS interop**, and it did not always.
Most bundles are CommonJS while the module they replace is ESM, so esbuild
converts the bundle by wrapping it — the program becomes
`export default require_<name>()` and the namespace has exactly one member.
Picking a named export out of that namespace yields `undefined`, and the shim
then re-exports `undefined` under every name the subject declares: the module
resolves, the import succeeds, and the first call dies with
`Cannot read properties of undefined (reading 'apply')`, which reads as the
returned program being broken. `marp-team/marpit`'s comment plugin failed
exactly this way. The CommonJS shim had always unwrapped; the ESM one now does
too, under a deliberately narrow test — a namespace whose only member is
`default`, whose default carries `__esModule` — so a genuine ESM bundle keeps
its named exports.

Three further design choices are worth recording, because each rules out
something that looks easier:

- *Why substitute the module rather than alias it?* In-place substitution is the
  only interception point all four runners share. jest resolves through its own
  registry, vitest through Vite aliases, mocha and node:test through Node's
  loader. Every subject's tests import their module by relative path (44/44 in
  the snapshot measured), so replacing the file works for every one of them.
- *Why is the host spy inside the shim rather than a preload?* jest's
  `--setupFiles` **overrides** rather than extends the project's configuration,
  and `hustcc/jest-canvas-mock` configures `setupFiles` in its `package.json` —
  injecting ours would silently dismantle its test environment. The shim shares
  a realm with the tests, so one implementation covers all four runners with no
  command-line surgery.
- *Why not record arguments and replay them offline?* Replay would have to
  reconstruct stateful arguments — sockets, DOM nodes, database handles — which
  cannot be done faithfully. Letting the test drive both sides avoids
  reconstruction entirely.

**The reference run is the admission gate, and the bar is a usable trace — not a
green suite.** The oracle is differential: the reference run *defines* the
expected behaviour, and both runs go through the same substitution, so a test
that fails for the reference fails identically for the candidate and the traces
still align.

That distinction is worth a lot of corpus. The subject bundle inlines the
subject's first-party modules, which duplicates anything the project's tests
compare by identity — an error class checked with `instanceof`, a React context
read through a provider. Requiring a green suite marked 17 of 44 subjects
unsupported on that ground alone (counts from the older snapshot — see
[Validation](#validation)), including `pchuri__confluence-cli::lib/macro-converter.js`,
where 184 of 185 tests passed and the one failure was two structurally identical
`StorageDepthExceededError` classes. What genuinely cannot be measured is a
reference run that produced no trace at all: then the module never ran and there
is nothing to compare against.

`reference_suite_green` records which side of that line a subject is on, so an
analysis can restrict to fully green subjects if it wants to. Reference runs are
cached per (subject, bundle checksum) in
`work/<project>/.adb-eval/<subject>/reference.json`.

**Serialisation is bounded** in depth, width, string length, and a per-event
character budget (`execution.value_budget`). Real subjects are called with host
objects whose reachable graph is unbounded at any useful depth limit — one
marpit call argument reached ~10 KB before the budget was added. Traversal order
is fixed and keys are sorted, so both runs truncate at the same point and
truncation cannot manufacture a difference.

**Values are normalised before comparison** — absolute paths, temp directories,
ISO timestamps, epoch-like integers, UUIDs, long hex strings, and stack traces
(`execution.normalize`). Without this a trace differs from itself between runs
and every candidate scores zero. Path roots are folded **longest-first**, because
replacement is sequential and a shorter root that prefixes a longer one would
consume it and leave the distinguishing remainder behind; and the corpus roots
stay in the list even though the run happens in the sandbox, because
`oracle/node_modules` is a symlink, so `require.resolve` and every dependency's
stack frames come back as corpus paths.

**Degraded scoring.** Some subjects are exercised without their exports being
called directly (a React component rendered through JSX). There is no trace to
compare, so the oracle falls back to suite agreement and the record is marked
`degraded`.

#### Anti-analysis rungs (`defense_triggered`)

The harness substitutes a tracing shim for the module. That is a source
rewrite — and detecting a source rewrite is exactly what the `anti` and `full`
rungs' `selfDefending` and `debugProtection` options are for. So on those rungs
the measurement can be defeated by the build rather than failed by the system,
and the two must not be reported as the same thing.

The evidence is the `identity` oracle, which returns the obfuscated build
unchanged and is therefore byte-identical to a build that already passed
differential admission. On `anti` it scored execution **0.0** with status
`timeout`: the reference side ran its 7 cases, the candidate side produced no
events at all, and the suite never exited. Reporting that as a system failure
would report a defence working as a model failing.

A candidate is scored `defense_triggered`, with a **null** score, when all three
hold: the build's `config_id` is in `execution.anti_rungs`; the candidate run
timed out or produced no events; and the reference run of the *same* subject,
through the *same* substitution, was fine. That last clause is what separates a
defence from a broken answer. These runs also get `execution.defense_timeout_sec`
(15 s) rather than the full 900 s, matching `02_admit.py`'s `CAP_ANTI` — a
self-defending build never exits, so waiting longer only lengthens the wait.

**This is a heuristic keyed on the rung, not on anything observed in the
program.** It must be reported separately and never folded into a
`behaviour_match` mean. The obfuscation stage reaches the same verdict by the
same reasoning and calls it `defense_triggered` too; the name is shared on
purpose.

#### Safety of the sandbox views

Substitution writes into `sandbox/sandboxes/<box>/oracle/`. Before the swap, any
pre-existing occupant of the slot and its SHA-256 are journalled to
`<box>/.adb-eval/journal.json`; the slot is emptied in a `finally`, the occupant
moved back and re-checksummed, and the journal entry cleared. An `atexit` handler
undoes anything still outstanding, `score.py --repair` recovers from a crash, and
`score.py --verify-clean` reports outstanding substitutions, leftover generated
files, and files left parked in `<box>/.adb-eval/preexisting/`.

Scratch state lives under `<box>/.adb-eval/`, a third namespace beside the agent
ladder's `.adb-baseline/` and the `oracle/<entry>.reference` sidecars
`sandbox/scripts/score.py` leaves behind, so no two stages tread on each other.
The reference cache is `reference-run.json`, *not* `reference.json` — the box
already has one of those at its top level recording whether the sandbox's oracle
suite starts, and two different schemas one directory apart under one name is a
trap for whoever greps next.

**Locking is keyed on the resolved `node_modules`, not on the box.** Per-box
looks right, since each subject has its own sandbox — but every box of a project
symlinks `oracle/node_modules` to the *same*
`corpus/work/<project>/node_modules`, and the runners write into it. These
checkouts already contain `node_modules/.cache/nyc` (websockets/ws alone has 9
subjects), `.cache/@babel`, `.cache/mongodb-memory-server`, and vite's `.vite`
and `.vite-temp`, whose fixed-name staging files two concurrent processes rename
out from under each other. Only 5 projects carry such a directory today, but
nyc's and babel's caches appear on first use, so probing for them would drop
mutual exclusion exactly when a project runs for the first time. Keying on the
resolved `node_modules` names the resource itself: it is the same granularity as
the per-project lock it replaces, and it becomes per-box automatically if a box
is ever given a private dependency tree.

### Simplification → `metrics/simplification.py`

Complexity is the vector **V = (ast_nodes, cyclomatic, max_depth)**, each
component scaled by the obfuscated build's value so that *C*(obfuscated) = 1,
then combined with the weights in `config/eval.json`. A component the obfuscated
build measures as zero is dropped and the remaining weights renormalised.
Cyclomatic complexity counts `if`, `for`, `for…in`, `while`, `do`, `case`,
`catch`, `?:` and the short-circuit operators `&&`, `||`, `??`, plus one.

**`max_depth` is measured and reported but weighted 0** (`schema_version` 3). It
carries no signal under this obfuscation suite: on **26 of 57** scored records the
obfuscated build was no deeper than the original, and its median inflation is
1.17× against 6.10× for `ast_nodes`, so an equal third of the weight went to a
near-constant term present in both numerator and denominator. The correction is
small and worth stating exactly rather than overselling — per-system median
`anchored` moves by at most 0.02, and the gap between the two traditional
deobfuscators goes from 0.781 to 0.763. Where it shows is over-deletion, which is
what `anchored` exists to expose: the empty program's overshoot falls from 3.45
to 1.86. Restore the weight to ⅓ to reproduce `schema_version` 2 numbers.

**This is not the same complexity score the obfuscation stage reports.**
`obfuscators/tools/complexity.mjs` computes a per-KB *strength* composite over
the whole program; this is a *reduction* vector against the build. `builds.jsonl`
carries the former as `complexity` and `size_inflation`, and those are passed
through rather than recomputed here, precisely so that a third definition does
not appear. The two are not interchangeable and should never be averaged
together.

Three scores are reported:

- **`jsdeobs` = 1 − HLoC(candidate) / HLoC(obfuscated)** — JsDeObsBench
  Equation 1 (leaderboard `decomplexity`). HLoC is Halstead length. Unparseable
  or empty returns are `null`, matching their syntax gate. `jsdeobs_original`
  is the same formula on the clean bundle: the score a perfect recovery gets.
- **`rel_obf` = 1 − *C*(candidate)** — the reduction-vector analogue of the
  same shape, kept so older numbers can be recomputed.
- **`anchored` = (1 − *C*(candidate)) ÷ (1 − *C*(original))** — the same
  reduction divided by the reduction the original actually represents.

`rel_obf` is kept only for comparability with the benchmark this one is measured
against, and it is biased in a way that inverts the ranking it is supposed to
produce: it rewards deletion without bound, and it inflates with obfuscation
strength because the denominator grows. Measured on three real
`javascript-obfuscator` builds (rename + string array + dead code):

| returned program | `rel_obf` | `anchored` | `over_simplified` | execution |
|---|---|---|---|---|
| the developer's original | 0.248 – 0.345 | **1.000** | false | 1.0 |
| `export default {}` | **0.993 – 0.998** | 2.88 – 4.01 | true | 0.0 |
| the obfuscated input, unchanged | 0.000 | 0.000 | false | 1.0 |

Under the legacy metric, returning nothing scores roughly three times better
than returning the correct answer. Report `anchored` as the corrected measure,
and `rel_obf` only when comparing against prior numbers.

**`size_ratio` is bytes, not lines** (`schema_version` 3). Every build in the
suite is emitted with `compact: true`, so its `loc` is 1 and a line-based ratio
measured the compactor rather than the system — it ranged from 44 to 24384 across
the scored predictions. On bytes it lands where it should: ≈0.001 for the empty
program, 0.13–0.27 for the developer's original, exactly 1.0 for the obfuscated
input returned unchanged. Same denominator convention as the obfuscation stage's
`size_inflation`, so the two compose.

`anchored` is `null` when obfuscation did not raise complexity at all (there is
no scale on which to express progress), and the whole score is `null` when no
obfuscated input was supplied.

### Similarity → `metrics/similarity.py`

**`codebleu3`** — CodeBLEU without its dataflow component, over three equally
weighted parts, each also reported on its own:

| component | definition |
|---|---|
| `bleu` | smoothed BLEU-4 over the tree-sitter token stream (comments excluded) |
| `weighted_bleu` | the same, with JavaScript keywords weighted ×4 |
| `ast_match` | mean F1 of clipped node-type *n*-gram overlap, *n* = 1…4 |

Also reported: `token_ratio`, a plain `difflib` sequence ratio, as a
model-independent textual reference point.

The dataflow component is omitted **deliberately, and the omission is named
rather than papered over**: CodeBLEU's dataflow match needs a language-specific
def-use extractor, and no validated one exists for JavaScript's dynamic property
access. An unsound fourth component would move every score without anyone being
able to say why. `ast_match` uses F1 rather than precision because precision
alone rewards a candidate that returns a *fragment* of the original's structure —
exactly what an over-deleting system produces. BLEU is smoothed (Chen & Cherry
method 1) because without it one missing 4-gram zeroes the score, which is
useless for ranking the near-misses that deobfuscation output actually consists
of.

Similarity is a readability proxy and is treated as one. Execution correctness is
primary; a program can be behaviourally perfect and textually distant.
`tests/test_metrics.py` closes by showing a one-line behaviour change that keeps
`syntax = 1` and `codebleu3 > 0.95` — which is precisely why the primary measure
has to be the executing one.

### Identifier recovery (not implemented)

Deferred by decision, not by oversight. Scoring recovered names requires
aligning variables in the returned program with the developer's variables in the
original, and no alignment method is fixed yet (`main.tex` §3.2 TODO: *"说明变量
对齐如何在不泄露原名给模型的前提下建立"*). Shipping a scorer on an arbitrary
alignment would produce numbers nobody could defend.

The field is present and `null` in every score record, so adding it later does
not change the shape of records already produced. Material that exists in this
repository for the eventual implementation: the subtoken splitter
(`subtokens()`) and the domain-bearing-name predicate in
`corpus/tools/subjectgen.mjs`, and the 97-word generic stoplist under
`realism_screen.generic_stoplist` in `corpus/config/thresholds.json`. Every
subject's manifest record already carries `metrics.declared_identifiers`,
`metrics.domain_identifiers`, and `metrics.domain_identifier_ratio` computed with
exactly that predicate, which is the denominator the paper's ID and ID\_d columns
need.

One refinement worth recording before anyone implements it: the obfuscation suite
keeps `renameProperties` and `renameGlobals` off throughout, so property names
and exported names survive obfuscation verbatim. A system that echoes them back
has recovered nothing. The names actually at stake are those the obfuscator
destroyed — the difference between the original's declared identifiers and the
build's — and restricting the measure to that set is computable from artifacts
already on disk.

---

## Layout

```
config/eval.json         every threshold, weight, and pinned version
score.py                 CLI: score predictions → results/scores.jsonl
selfcheck.py             harness validation against the corpus
evallib/corpus.py        manifest loading, path resolution, sandbox indices
evallib/oracleview.py    where a run happens: the subject's sandbox oracle view
evallib/jsast.py         tree-sitter: parsing, tokens, complexity, export surface
evallib/nodeenv.py       Node/esbuild location; reuses corpus lib's specialize()
evallib/schema.py        build / prediction / score records
metrics/*.py             the four evaluators
harness/tracer.js        the tracer body, inlined into both shim flavours
harness/*.tmpl           generated shim and tracer, ESM and CommonJS
tests/                   degradation tests for the metrics and the harness
```

`evallib` is not called `lib` because the corpus pipeline has a top-level `lib`
module of its own; the two would shadow each other, which is why
`nodeenv._load_corpus_lib()` binds it under an explicit alias.

**Roots** are `ADB_CORPUS`, `ADB_SANDBOX`, and `ADB_OBFUSCATORS`, matching
`baselines/lib/common.py`, so a relocated artifact is configured the same way
everywhere.

**`specialize()` has one implementation**, `corpus/scripts/lib.py::specialize`.
It used to have two — `corpus/scripts/05_coverage.py` and a hand-copy in
`sandbox/scripts/score.py` — which had already drifted in one respect: the copy
did not re-quote a non-file token containing a space. They agreed on all 171
subjects, which is exactly why the drift would have gone unnoticed until a
project's invocation contained one. All three consumers now call the same
function; `tests/test_metrics.py`-style verification over the whole manifest
confirmed the move changed no command.

## Validation

> **Still not regenerated over the full 171-subject corpus.** What follows is a
> 51-subject before/after against the harness this replaces — every subject whose
> pre-migration reference cache was keyed to the current bundle, which is the
> largest set on which "did the scores move?" can be answered at all. Run
> `python3 selfcheck.py --jobs 4 --refresh-reference` over all 171 before citing
> any count in the paper.

### Did the migration change the scores?

Submitting each subject's own reference bundle as if a system had returned it,
and comparing against the cached pre-migration reference for the same subject and
the same bundle checksum:

| | |
|---|---|
| syntax == 1 | **51 / 51** |
| similarity.codebleu3 == 1.0 | **51 / 51** |
| execution.behaviour_match == 1.0 | **33 / 33 traced subjects** |

The identity invariant holds exactly: wherever the oracle applies, a subject's own
bundle scores perfectly. That is location-independent, so any regression here
would have been a harness bug rather than a finding.

**What moved is coverage, and it moved net upward.**

| | now measurable | now unsupported |
|---|---|---|
| measurable before | 26 | **4** |
| unsupported before | **8** | 13 |

The **8 gained** are seven `octokatherine/readme.so` React components and one
`SabakiHQ/Sabaki` module — precisely the population the ESM-shim interop fix
addresses (ESM modules with CommonJS bundles, where every named pick used to come
back `undefined`). The **4 lost** are `docsifyjs/docsify`'s router, two
`seppevs/migrate-mongo` actions, and `spite/ccapture.js`'s WebM encoder; the
cause is named rather than guessed, because the harness now reports it —
`ERR_MODULE_NOT_FOUND`, *a module the test imports is absent from the oracle
view*. That is the minimal oracle view's one genuine weakness against a full
checkout, and it is a `build_sandboxes.py` gap, not a scoring one: the failure
mode is safe, since a missing sibling yields no trace and therefore `unsupported`,
never a wrong score.

Of the 26 measurable on both sides, **23 produce a byte-identical reference
event count**. The 3 that differ shortened rather than changed:

| subject | events | `reference_suite_green` |
|---|---|---|
| `expressjs__morgan::index.js` | 168 → 166 | true → false |
| `metalsmith__metalsmith::lib/debug.js` | 38 → 18 | false → false |
| `ryanlelek__Raneto::app/functions/contentProcessors.js` | 61 → 49 | true → false |

Each still scores `behaviour_match` 1.0 — the workload is smaller, not wrong —
and `reference_suite_green` records it, which is what that field is for. An
analysis needing the full workload should filter on it.

### The three oracle systems

Re-run end to end through `score.py` after the migration:

| | `controlflow` | `deadcode` | `anti` |
|---|---|---|---|
| `oracle-perfect` | ok · exec 1.0 · sim 1.0 | ok · exec 1.0 · sim 1.0 | ok · exec 1.0 · sim 1.0 |
| `oracle-identity` | ok · **exec 1.0** · sim 0.108 | ok · **exec 1.0** · sim 0.098 | **`defense_triggered`** · score null |
| `oracle-empty` | ok · exec 0.0 · syntax 0 | ok · exec 0.0 · syntax 0 | ok · exec 0.0 · syntax 0 |

The `anti` column is the change. `oracle-identity` there previously scored
`timeout` / **0.0** on a program byte-identical to an admitted build; it is now
`defense_triggered` with a null score. `oracle-perfect` still scores 1.0 on
`anti`, because the clean bundle carries no self-defending code — which is what
makes the `identity` result attributable to the build rather than to the rung.

`oracle-empty` on `anti` is the case that shaped the rule. An earlier version
excused it too, on the grounds that it produced no events — but an empty program
carries no defending code, exits in under a second with code 1, and has simply
failed. Excusing it would have let any system escape a zero on the hardest rungs
by returning nothing. The signal is a hang and only a hang, matching
`02_admit.py`; `tests/test_execution.py` step 0 asserts all four cases.

### The static evaluators, across every prediction already on disk

Re-scored with `--no-execution` (48 real predictions plus 9 oracle ones):

| | webcrack@S1 | synchrony@S1 |
|---|---|---|
| syntax (old → new) | 22 unchanged, **2 flip 0 → 1** | 22 unchanged, 2 genuine zeros held |
| `anchored` median shift | +0.0000 (max \|Δ\| 0.052) | +0.0007 (max \|Δ\| 0.236) |
| `size_ratio` range | 44 – 24384 → **0.042 – 1.535** | 0 – 22307 → **0.000 – 1.919** |

The two syntax flips are the `syntax 0 / execution 1.0` contradiction. The
`anchored` shift is small, as the changelog says it is. `size_ratio` becomes a
quantity with a meaning.

### `oracle_usable` is still not the same criterion

Neither gate contains the other: the sandbox asks whether the test suite
*started*, this harness asks whether the module *produced a trace*. On the 8
subjects examined in detail, 5 satisfied both, 2 satisfied only the sandbox's,
and 0 only this one — and `whawker/react-jsx-highcharts` is the instructive case,
`oracle_usable = true` because its suite ran, `unsupported` here because every
test errored with `document is not defined`. The sandbox's own reference run
records the identical failure, so this is a property of the sandbox's
construction (a monorepo whose `jest.config.js` sits in the package directory
rather than the project root, where `build_sandboxes.py` looks) and not of the
migration.

`selfcheck.py` reports both gates and their intersection on every run. The
corpus-wide figure of 133/171 usable oracles is **not** the population on which
execution correctness is defined here. Report the two separately.

### Tests

`tests/test_metrics.py` and `tests/test_execution.py` both pass. Between them
they hold the properties the measures rest on: a `javascript-obfuscator` build of
a subject scores 1.0 (behaviour preserved); a one-line change to what an export
returns is caught with the diverging call named, while the same change leaves
`syntax = 1` and `codebleu3 > 0.95`; an unresolvable export surface is neither
guessed at nor used to condemn an answer; and an anti-rung defence is a hang and
only a hang.

> **Both test files had themselves gone stale**, and had stopped checking the
> properties they existed for. They were written against the all-ESM corpus.
> `test_execution.py` spliced a literal `export default require_extension();`
> into the ws bundle, which no longer exists, so the behaviour-change case died
> on its own assertion before reaching the harness; and it handed the obfuscator
> a `.cjs` path, which the CLI rejects, so the behaviour-preserved case degraded
> to `skip`. `test_metrics.py`'s dropped-export case asserted
> `exports_missing == ["default"]`, a literal from the ESM era, and kept passing
> for the wrong reason once the export check stopped seeing CommonJS at all. All
> are fixed. A test that cannot fail is not evidence.

After every run `score.py --verify-clean` reports `sandboxes clean`, no
`.adb_impl.js` or `.adb_tracer.js` survives under any `oracle/`, and `git status`
across all 106 checkouts shows no modified subject module — the checkouts are no
longer written to at all.

> **The old design had in fact already failed silently, and the migration found
> it.** Sweeping the checkouts turned up
> `0xranx__OpenContext/src/core/config.js` still holding a generated shim, dated
> two days before this change: a crashed run had left the module substituted, and
> because the journal had been cleared, `--repair` could never see it and
> `--verify-clean` — which checked the journal and stray generated files but
> never the module itself — reported clean. Worse, the `.orig` backup beside it
> was 674 bytes, the size of the shim rather than of the 6839-byte module: the
> backup had been taken *over an already-substituted file*, so `--repair` would
> have "restored" a shim. The module was recovered from git, and no other
> checkout was affected.
>
> This is the failure mode the new design removes structurally rather than by
> being more careful. The slot in an oracle view is empty by contract, so the
> invariant is *the slot is absent afterwards* rather than *the file matches its
> backup*; nothing is ever restored from a backup that could itself be a previous
> mount; and the corpus is not written at all, so the worst case is a damaged
> disposable box rather than a damaged subject.

## Reproducibility

`config/eval.json` carries the pinned toolchain and every constant the scores
depend on. Changing any of them changes reported numbers: bump `schema_version`
and note it here. The corpus side is pinned separately in
`corpus/config/thresholds.json`.

Known bounds on what these evaluators measure:

- Execution correctness is bounded by the workload. A branch no test reaches is
  invisible to it — the same limit the paper states for dynamic evidence in §2.3
  — which is why the manifest carries per-subject statement and branch coverage.
- Suite-level counts (`tests_reference`, `tests_candidate`) are parsed from
  runner output and are `null` for formats not recognised. They are diagnostics;
  `behaviour_match` is the score.
- The harness assumes a subject can be reached through its module's exports.
  Subjects exercised only indirectly score `degraded`.
- A subject whose reference suite is not green is still measured, but its
  workload is whatever ran before the failure. Filter on
  `reference_suite_green` for an analysis that needs the full workload.
- The generated tracer imports `fs`, not `node:fs`: jest's resolver rejects the
  `node:` prefix, and jest is the most common runner in the corpus (83 of 171).
- **The oracle view is a reconstruction, not a checkout.** It holds the test
  file's first-party import closure, the runner and setup configuration, and a
  symlink to the project's `node_modules` — but not unrelated sibling sources,
  and not configuration that lives outside the project root. Two consequences,
  both measured above: a test needing an absent fixture yields no trace and the
  subject is reported `unsupported` (4 of 51 in the before/after), and a monorepo
  whose `jest.config.js` sits in its package directory loses its jsdom setting.
  Both are `sandbox/scripts/build_sandboxes.py` gaps rather than scoring ones,
  and both fail safe: a missing file produces a missing score, never a wrong one.
  Fixing them means rebuilding the sandboxes, which would confound any score
  comparison, so it is deliberately a separate change.
- `defense_triggered` is keyed on the build's rung, not on anything observed in
  the returned program. It is a sound *exclusion* — a hang on a rung carrying
  `selfDefending` is the defence working — but it is not evidence about the
  system, and it must be reported as its own category.
- Two writers other than this one mount into a box: `sandbox/scripts/score.py`
  (which takes no lock at all) and `baselines/lib/mount.py` (which locks the
  agent view, a different resource). Do not run them concurrently with scoring.
