/**
 * debug.mjs — inspect a subject's internal state while it runs.
 *
 * This is the L2 (debugging) capability of the paper: beyond watching what a
 * program emits, an agent may set breakpoints, read in-scope variables, and
 * query a bounded execution trace. Those are precisely the facts obfuscation
 * hides in the source but cannot hide from a running program — a decoded
 * string exists in a variable the moment the decoder returns.
 *
 * The subject runs in a child process under --inspect-brk while this process
 * drives it over CDP. Running both in one process does not work: pausing at a
 * breakpoint blocks that process's event loop, so the very calls needed to
 * read the paused frame (Runtime.getProperties, evaluateOnCallFrame) never
 * receive a response and the harness deadlocks. Separating them keeps the
 * debugger responsive while the subject is frozen.
 *
 * The debug port is bound to loopback on an ephemeral port for one run only,
 * and the agent never receives the address.
 *
 * Usage:
 *   node harness/debug.mjs --call <export> [--args '<json>'] \
 *        [--break <file:line[:column]>]... [--watch <expr>]... [--trace-calls] [--max-hits N]
 *
 * A breakpoint may name a column as well as a line, and on this corpus it
 * usually must. Every obfuscated build is emitted with `compact: true`, so the
 * whole program is one line: without a column there is exactly one breakpoint
 * available in the entire file, it lands in the module wrapper, and the L2
 * capability degrades to the call counts `--trace-calls` already provides.
 * Columns are 1-based, matching lines.
 */
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const META = JSON.parse(readFileSync(resolve(ROOT, 'sandbox.json'), 'utf8'));

const argv = process.argv.slice(2);
const arg = (n) => { const i = argv.indexOf(n); return i === -1 ? undefined : argv[i + 1]; };
const all = (n) => argv.reduce((a, v, i) => (v === n ? [...a, argv[i + 1]] : a), []);
const flag = (n) => argv.includes(n);

const MAX_HITS = Number(arg('--max-hits') || 50);
const TIMEOUT_MS = Number(arg('--timeout') || 45000);

function fail(msg) {
  process.stdout.write(JSON.stringify({ harness_error: String(msg) }) + '\n');
  process.exit(1);
}

/** Minimal CDP client over the child's inspector WebSocket. */
class CDP {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.handlers = new Map();
    ws.addEventListener('message', (ev) => {
      let msg;
      try { msg = JSON.parse(ev.data); } catch { return; }
      if (msg.id !== undefined) {
        const p = this.pending.get(msg.id);
        if (p) {
          this.pending.delete(msg.id);
          msg.error ? p.reject(new Error(msg.error.message)) : p.resolve(msg.result);
        }
      } else if (msg.method) {
        for (const fn of this.handlers.get(msg.method) || []) fn(msg.params);
      }
    });
  }

  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((res, rej) => {
      this.pending.set(id, { resolve: res, reject: rej });
      this.ws.send(JSON.stringify({ id, method, params }));
      setTimeout(() => {
        if (this.pending.delete(id)) rej(new Error(method + ' timed out'));
      }, 15000);
    });
  }

  on(method, fn) {
    if (!this.handlers.has(method)) this.handlers.set(method, []);
    this.handlers.get(method).push(fn);
  }
}

/** Render a remote object shallowly, without dragging the whole heap across. */
async function preview(cdp, objectId, depth = 0) {
  if (!objectId || depth > 1) return '[...]';
  let result;
  try {
    ({ result } = await cdp.send('Runtime.getProperties',
                                 { objectId, ownProperties: true }));
  } catch {
    return '[unavailable]';
  }
  const out = {};
  for (const p of (result || []).slice(0, 25)) {
    const v = p.value;
    if (!v) continue;
    out[p.name] = v.type === 'object' && v.objectId
      ? (v.className === 'Array' ? '[Array ' + v.description + ']'
                                 : await preview(cdp, v.objectId, depth + 1))
      : (v.value !== undefined ? v.value : v.description);
  }
  return out;
}

async function main() {
  const child = spawn(process.execPath,
    ['--inspect-brk=127.0.0.1:0', resolve(HERE, '_debug-target.mjs'), ...argv],
    { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] });

  let stdout = '';
  child.stdout.on('data', (d) => { stdout += d; });

  // The inspector announces its address on stderr before user code runs.
  const wsUrl = await new Promise((res, rej) => {
    let buf = '';
    const t = setTimeout(() => rej(new Error('inspector did not start')), 15000);
    child.stderr.on('data', (d) => {
      buf += d;
      const m = buf.match(/ws:\/\/[^\s]+/);
      if (m) { clearTimeout(t); res(m[0]); }
    });
    child.on('exit', () => {
      clearTimeout(t);
      rej(new Error('child exited early: ' + buf.slice(0, 200)));
    });
  }).catch(fail);

  const ws = new WebSocket(wsUrl);
  await new Promise((res, rej) => {
    ws.addEventListener('open', res, { once: true });
    ws.addEventListener('error', () => rej(new Error('cannot attach to inspector')),
                        { once: true });
  }).catch(fail);

  const cdp = new CDP(ws);
  const scripts = new Map();
  const hits = [];
  const watches = all('--watch');
  let started = false;
  let stopped = false;

  cdp.on('Debugger.scriptParsed', (p) => scripts.set(p.scriptId, p.url));

  cdp.on('Debugger.paused', async (p) => {
    // --inspect-brk stops before the first statement; that pause is not a hit.
    if (!started) {
      started = true;
      await cdp.send('Debugger.resume').catch(() => {});
      return;
    }
    const frames = (p.callFrames || []).slice(0, 6);
    const top = frames[0];
    if (!top) { await cdp.send('Debugger.resume').catch(() => {}); return; }

    const record = {
      hit: hits.length,
      reason: p.reason,
      location: {
        url: basename(scripts.get(top.location.scriptId) || '?'),
        line: top.location.lineNumber + 1,
        column: top.location.columnNumber,
      },
      function: top.functionName || '(anonymous)',
      stack: frames.map((f) => ({
        fn: f.functionName || '(anonymous)',
        line: f.location.lineNumber + 1,
        url: basename(scripts.get(f.location.scriptId) || '?'),
      })),
      scope: {},
      watch: {},
    };

    // In-scope variables: what a name actually holds here, which is the
    // evidence identifier renaming removes from the source.
    for (const sc of top.scopeChain || []) {
      if (sc.type !== 'local' && sc.type !== 'closure') continue;
      if (!sc.object || !sc.object.objectId) continue;
      record.scope[sc.type] = await preview(cdp, sc.object.objectId);
    }

    for (const expr of watches) {
      try {
        const r = await cdp.send('Debugger.evaluateOnCallFrame', {
          callFrameId: top.callFrameId, expression: expr, returnByValue: false,
        });
        record.watch[expr] = r.exceptionDetails
          ? { error: r.exceptionDetails.text }
          : (r.result && r.result.objectId && r.result.type === 'object'
             ? await preview(cdp, r.result.objectId)
             : (r.result && r.result.value !== undefined
                ? r.result.value : r.result && r.result.description));
      } catch (e) {
        record.watch[expr] = { error: String(e.message).slice(0, 100) };
      }
    }

    hits.push(record);
    if (hits.length >= MAX_HITS && !stopped) {
      stopped = true;
      await cdp.send('Debugger.setSkipAllPauses', { skip: true }).catch(() => {});
    }
    await cdp.send('Debugger.resume').catch(() => {});
  });

  await cdp.send('Runtime.enable');
  await cdp.send('Debugger.enable');

  // Breakpoints are placed by URL pattern so they survive the subject being
  // swapped for an obfuscated build, whose line numbers differ.
  const requested = [];
  for (const spec of all('--break')) {
    // <file>:<line>[:<column>]. The file part may itself contain colons, so the
    // numeric tail is matched rather than split on the last colon.
    const m = /^(.*?):(\d+)(?::(\d+))?$/.exec(spec);
    if (!m) { requested.push({ spec, bound: false, error: 'unparseable' }); continue; }
    const file = m[1];
    const line = Number(m[2]);
    const column = m[3] === undefined ? null : Number(m[3]);
    const params = {
      lineNumber: Math.max(0, line - 1),
      urlRegex: '.*' + file.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$',
    };
    if (column !== null) params.columnNumber = Math.max(0, column - 1);
    const r = await cdp.send('Debugger.setBreakpointByUrl', params).catch(() => null);
    requested.push({ file, line, column, bound: Boolean(r && r.breakpointId) });
  }

  if (flag('--trace-calls')) {
    await cdp.send('Profiler.enable').catch(() => {});
    await cdp.send('Profiler.startPreciseCoverage',
                   { callCount: true, detailed: true }).catch(() => {});
  }

  await cdp.send('Runtime.runIfWaitingForDebugger');

  // Take the trace while the child is still alive but after the call has run.
  let traced = null;
  const settle = new Promise((res) => {
    const t = setTimeout(() => res('timeout'), TIMEOUT_MS);
    const poll = setInterval(async () => {
      if (!stdout.includes('__ADB_OUTCOME__')) return;
      clearInterval(poll);
      if (flag('--trace-calls')) {
        traced = await cdp.send('Profiler.takePreciseCoverage').catch(() => null);
      }
      clearTimeout(t);
      res('done');
    }, 50);
    child.on('exit', async () => {
      clearInterval(poll);
      clearTimeout(t);
      res('exited');
    });
  });
  const how = await settle;

  const outcomeMatch = stdout.match(/__ADB_OUTCOME__(.*)/);
  const report = {
    handle: META.handle,
    breakpoints: requested,
    outcome: (() => {
      try { return outcomeMatch ? JSON.parse(outcomeMatch[1]) : {}; }
      catch { return {}; }
    })(),
    hits,
  };
  if (how === 'timeout') report.timed_out = true;

  if (traced && traced.result) {
    const entry = basename(META.entry);
    report.executed_functions = traced.result
      .filter((s) => (scripts.get(s.scriptId) || '').includes(entry))
      .flatMap((s) => (s.functions || [])
        .filter((f) => f.functionName && (f.ranges || []).some((r) => r.count > 0))
        .map((f) => ({ name: f.functionName, calls: f.ranges[0].count })))
      .sort((a, b) => b.calls - a.calls)
      .slice(0, 100);
  }

  // Write, then let the process end on its own. process.exit() truncates a
  // pipe that has not drained, and a report with a dozen breakpoints' scopes in
  // it passes 64 KB — the pipe buffer — routinely; the JSON arrived cut off
  // mid-string and unparseable. Closing the socket and killing the child leaves
  // nothing holding the loop open, so exiting explicitly bought nothing.
  const done = new Promise((r) => process.stdout.write(JSON.stringify(report, null, 2) + '\n', r));
  try { ws.close(); } catch { /* already closed */ }
  try { child.kill('SIGKILL'); } catch { /* already gone */ }
  await done;
}

main().catch(fail);
