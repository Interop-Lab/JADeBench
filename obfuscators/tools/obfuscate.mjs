/**
 * obfuscate.mjs — apply one open-source obfuscation configuration to one subject.
 *
 * This is the mechanical core of the open-source tier (paper §3.4). It takes a
 * clean subject bundle, a tool name, a fully-resolved options object, and a
 * seed, and emits an obfuscated program plus a record of exactly what produced
 * it. Nothing here decides *which* configurations to run — that is the job of
 * the configuration ladder in `config/opensource.json`, driven by
 * `scripts/01_build_opensource.py`. Keeping the policy in config and only the
 * mechanism here is what lets the whole options object and seed be published
 * for every build, as the paper requires.
 *
 * Reproducibility. `javascript-obfuscator` takes a `seed` and is deterministic
 * from it. `js-confuser` (2.x) has no seed and draws its per-build randomness
 * from Math.random, so we install a seeded PRNG (mulberry32) around the call.
 * With that, both tools reproduce byte-identical output from (subject, options,
 * seed) — the property the seed column in builds.jsonl promises.
 *
 * Usage:
 *   node obfuscate.mjs --tool <javascript-obfuscator|js-confuser> \
 *        --input <file> --seed <int> --opts <options.json> \
 *        [--output <file>]
 *
 * On success it writes the obfuscated code to --output (or stdout) and prints a
 * one-line JSON record to stderr:
 *   { "ok": true, "tool": "...", "bytes_in": N, "bytes_out": M, "ms": T }
 * On failure it prints { "ok": false, "error": "..." } to stderr and exits 1,
 * so the Python driver can record the failure without the process crashing it.
 */
import { readFileSync, writeFileSync } from 'node:fs';

function arg(name, fallback) {
  const i = process.argv.indexOf(name);
  return i === -1 ? fallback : process.argv[i + 1];
}

// mulberry32: a small, fast, seedable PRNG. Used to make js-confuser (which has
// no seed option) reproducible by standing in for Math.random for one call.
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

async function withSeededRandom(seed, fn) {
  const orig = Math.random;
  Math.random = mulberry32(seed);
  try {
    return await fn();
  } finally {
    Math.random = orig;
  }
}

async function runJavascriptObfuscator(code, opts, seed) {
  const mod = await import('javascript-obfuscator');
  const O = mod.default || mod;
  // The tool's own seed makes it deterministic; we still pass it explicitly so
  // the options object recorded in builds.jsonl is self-contained.
  const result = O.obfuscate(code, { ...opts, seed });
  return result.getObfuscatedCode();
}

async function runJsConfuser(code, opts, seed) {
  const mod = await import('js-confuser');
  const J = mod.default || mod;
  return withSeededRandom(seed, async () => {
    const out = await J.obfuscate(code, opts);
    return typeof out === 'string' ? out : out.code;
  });
}

const TOOLS = {
  'javascript-obfuscator': runJavascriptObfuscator,
  'js-confuser': runJsConfuser,
};

async function main() {
  const tool = arg('--tool');
  const input = arg('--input');
  const optsPath = arg('--opts');
  const output = arg('--output');
  const seed = Number(arg('--seed', '0'));

  const runner = TOOLS[tool];
  if (!runner) throw new Error(`unknown tool: ${tool}`);
  const code = readFileSync(input, 'utf8');
  const opts = JSON.parse(readFileSync(optsPath, 'utf8'));

  const t0 = Date.now();
  const obf = await runner(code, opts, seed);
  const ms = Date.now() - t0;

  if (!obf || typeof obf !== 'string') throw new Error('obfuscator returned no code');
  if (output) writeFileSync(output, obf, 'utf8');
  else process.stdout.write(obf);

  process.stderr.write(JSON.stringify({
    ok: true, tool, bytes_in: Buffer.byteLength(code),
    bytes_out: Buffer.byteLength(obf), ms,
  }) + '\n');
}

main().catch((e) => {
  process.stderr.write(JSON.stringify({ ok: false, error: String(e && e.message || e) }) + '\n');
  process.exit(1);
});
