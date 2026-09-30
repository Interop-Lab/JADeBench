/**
 * execute.mjs — run a subject and record its externally observable behavior.
 *
 * This is the L1 (execution) capability of the paper: an agent may run the
 * program on inputs of its choice and read return values, thrown exceptions,
 * host-API calls, and outbound requests. Everything the subject does to the
 * outside world is intercepted here rather than allowed through, so that a run
 * is both reproducible and safe to grant to an untrusted agent.
 *
 * Usage:
 *   node harness/execute.mjs --call <export>[.<member>...] [--args '<json array>']
 *   node harness/execute.mjs                    # list exports without calling
 *
 * `--call` accepts a dotted path, and on this corpus it usually needs one. A
 * CommonJS subject is reached through `import()`, which recovers named exports
 * by statically analysing the source; obfuscation defeats that analysis, so an
 * obfuscated CommonJS build arrives as a single `default` object and none of its
 * functions are addressable as top-level exports. 131 of 171 subjects are
 * CommonJS, so without dotted paths the execution capability would be
 * unavailable on most of the corpus for a reason that has nothing to do with how
 * hard the program is to analyse. `--call default.get` reaches it.
 *
 * Emits one JSON object on stdout describing the run.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const META = JSON.parse(readFileSync(resolve(ROOT, 'sandbox.json'), 'utf8'));

// ---------------------------------------------------------------------------
// Host interaction recording. Calls are logged and then either replayed from a
// recording or served a deterministic stub; a subject never reaches the real
// network, clock, or entropy source. Without this, two runs of the same input
// can disagree and an agent cannot tell a real finding from noise.
// ---------------------------------------------------------------------------
const events = [];
const record = (channel, detail) => {
  events.push({ seq: events.length, channel, ...detail });
};

const CASSETTE = resolve(ROOT, 'cassette.json');
const cassette = existsSync(CASSETTE)
  ? JSON.parse(readFileSync(CASSETTE, 'utf8'))
  : { network: {}, clock: { start: 1735689600000, step: 1 }, random: { seed: 42 } };

function installDeterminism() {
  // Clock: monotonic from a fixed epoch, so timestamps are stable across runs.
  let now = cassette.clock.start;
  const RealDate = Date;
  globalThis.Date = class extends RealDate {
    constructor(...a) { super(...(a.length ? a : [now])); }
    static now() { const t = now; now += cassette.clock.step; return t; }
  };
  globalThis.Date.UTC = RealDate.UTC;
  globalThis.Date.parse = RealDate.parse;

  // Entropy: a seeded PRNG, so obfuscation that branches on randomness still
  // takes the same path on every run.
  let seed = cassette.random.seed >>> 0;
  Math.random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0x100000000;
  };

  // Network: served from the cassette, recorded when absent. A miss is logged
  // rather than silently returning undefined, because an unrecorded request is
  // exactly the kind of nondeterminism the sandbox exists to surface.
  const respond = (key) => {
    const hit = cassette.network[key];
    record('network', { key, replayed: Boolean(hit) });
    if (hit) return hit;
    return { status: 200, headers: {}, body: '', _unrecorded: true };
  };
  globalThis.fetch = async (input, init = {}) => {
    const url = typeof input === 'string' ? input : input?.url;
    const key = `${(init.method || 'GET').toUpperCase()} ${url}`;
    const r = respond(key);
    return {
      ok: r.status < 400, status: r.status, url,
      headers: new Map(Object.entries(r.headers || {})),
      text: async () => r.body,
      json: async () => { try { return JSON.parse(r.body); } catch { return null; } },
      arrayBuffer: async () => new TextEncoder().encode(r.body).buffer,
    };
  };
}

function instrumentConsole() {
  for (const level of ['log', 'info', 'warn', 'error', 'debug']) {
    const original = console[level].bind(console);
    console[level] = (...args) => {
      record('console', { level, args: args.map(safeString) });
      if (process.env.ADB_PASSTHROUGH_CONSOLE) original(...args);
    };
  }
}

/**
 * Resolve a dotted export path against a module namespace.
 * Returns { target, owner } so a method can be called with its receiver bound —
 * a CommonJS export that reads `this` would otherwise throw when detached.
 */
function resolvePath(mod, path) {
  const parts = String(path).split('.');
  let owner = null;
  let target = mod;
  for (const part of parts) {
    if (target == null) return { target: undefined, owner: null };
    owner = target;
    target = target[part];
  }
  return { target, owner };
}

/** One level of shape, so a `default` object's API is discoverable at all. */
function describe(value) {
  if (value === null || typeof value !== 'object') return undefined;
  const out = {};
  for (const k of Object.keys(value).slice(0, 60)) {
    try { out[k] = typeof value[k]; } catch { out[k] = '[unreadable]'; }
  }
  return out;
}

function safeString(v) {
  try {
    if (typeof v === 'function') return `[Function ${v.name || 'anonymous'}]`;
    if (typeof v === 'bigint') return `${v}n`;
    return JSON.parse(JSON.stringify(v, (_k, x) =>
      typeof x === 'bigint' ? `${x}n` :
      typeof x === 'function' ? `[Function ${x.name || 'anonymous'}]` :
      x instanceof Error ? { name: x.name, message: x.message } : x));
  } catch {
    return String(v);
  }
}

async function main() {
  const argv = process.argv.slice(2);
  const arg = (name) => {
    const i = argv.indexOf(name);
    return i === -1 ? undefined : argv[i + 1];
  };

  if (META.runtime === 'browser') {
    const { installBrowserEnv } = await import(resolve(ROOT, 'harness/browser-env.mjs'));
    await installBrowserEnv(record);
  }
  installDeterminism();
  instrumentConsole();

  const started = Date.now();
  let mod, loadError = null;
  try {
    mod = await import(pathToFileURL(resolve(ROOT, META.entry)).href);
  } catch (err) {
    loadError = { name: err.name, message: err.message, code: err.code };
  }

  const exports = mod ? Object.keys(mod) : [];
  const result = {
    handle: META.handle,
    runtime: META.runtime,
    loaded: !loadError,
    load_error: loadError,
    exports,
    export_kinds: mod ? Object.fromEntries(
      exports.map(k => [k, typeof mod[k]])) : {},
  };

  // One level of member shape for object-valued exports. Without it an
  // obfuscated CommonJS build reports `{ default: 'object' }` and nothing an
  // agent could act on, even though every function of the module is one
  // property away.
  if (mod) {
    const members = {};
    for (const k of exports) {
      const shape = describe(mod[k]);
      if (shape && Object.keys(shape).length) members[k] = shape;
    }
    if (Object.keys(members).length) result.export_members = members;
  }

  const call = arg('--call');
  if (call && mod) {
    const args = arg('--args') ? JSON.parse(arg('--args')) : [];
    const { target, owner } = resolvePath(mod, call);
    if (typeof target !== 'function') {
      result.call = { name: call, error: 'export is not callable' };
    } else {
      try {
        const value = await target.apply(owner === mod ? undefined : owner, args);
        result.call = { name: call, args, returned: safeString(value) };
      } catch (err) {
        result.call = {
          name: call, args,
          threw: { name: err?.name, message: err?.message, stack: (err?.stack || '').split('\n').slice(0, 4) },
        };
      }
    }
  }

  result.events = events;
  result.duration_ms = Date.now() - started;
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');

  const unrecorded = events.filter(e => e.channel === 'network' && !e.replayed);
  if (unrecorded.length && process.env.ADB_STRICT_REPLAY) {
    process.exitCode = 3;   // an unrecorded request breaks determinism
  }
}

main().catch(err => {
  process.stdout.write(JSON.stringify({ harness_error: String(err) }) + '\n');
  process.exit(1);
});
