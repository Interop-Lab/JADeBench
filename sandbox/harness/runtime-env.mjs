/**
 * Shared host stubs for L1 session.mjs and L2 introspect.mjs.
 *
 * execute.mjs keeps an inlined copy of the same policy so each sandbox's
 * one-shot harness stays self-contained.  This module is the importable form:
 * a cassette-backed clock/PRNG/network, console capture, and a JSON-safe
 * value preview.  The agent never reaches the real clock, entropy source, or
 * network.
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const DEFAULT_CASSETTE = {
  network: {},
  clock: { start: 1735689600000, step: 1 },
  random: { seed: 42 },
};

export function loadCassette(root) {
  const path = resolve(root, 'cassette.json');
  return existsSync(path)
    ? JSON.parse(readFileSync(path, 'utf8'))
    : { ...DEFAULT_CASSETTE };
}

export function installDeterminism(root, record = () => {}) {
  const cassette = loadCassette(root);
  let now = cassette.clock?.start ?? DEFAULT_CASSETTE.clock.start;
  const step = cassette.clock?.step ?? DEFAULT_CASSETTE.clock.step;
  const RealDate = Date;
  globalThis.Date = class extends RealDate {
    constructor(...a) { super(...(a.length ? a : [now])); }
    static now() { const t = now; now += step; return t; }
  };
  globalThis.Date.UTC = RealDate.UTC;
  globalThis.Date.parse = RealDate.parse;

  let seed = (cassette.random?.seed ?? DEFAULT_CASSETTE.random.seed) >>> 0;
  Math.random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0x100000000;
  };

  const network = cassette.network || {};
  const respond = (key) => {
    const hit = network[key];
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

export function instrumentConsole(record = () => {}) {
  for (const level of ['log', 'info', 'warn', 'error', 'debug']) {
    const original = console[level].bind(console);
    console[level] = (...args) => {
      record('console', { level, args: args.map(safeValue) });
      if (process.env.ADB_PASSTHROUGH_CONSOLE) original(...args);
    };
  }
}

export function safeValue(value) {
  try {
    if (typeof value === 'function') return `[Function ${value.name || 'anonymous'}]`;
    if (typeof value === 'bigint') return `${value}n`;
    return JSON.parse(JSON.stringify(value, (_k, x) =>
      typeof x === 'bigint' ? `${x}n` :
      typeof x === 'function' ? `[Function ${x.name || 'anonymous'}]` :
      x instanceof Error ? { name: x.name, message: x.message } : x));
  } catch {
    return String(value);
  }
}
