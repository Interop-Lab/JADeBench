/**
 * _debug-target.mjs — the process under debug.
 *
 * Loads the subject and calls one export. It is started with --inspect-brk by
 * debug.mjs and does nothing else: all instrumentation lives in the parent, so
 * this process can be frozen at a breakpoint without stalling the debugger.
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const META = JSON.parse(readFileSync(resolve(ROOT, 'sandbox.json'), 'utf8'));

const argv = process.argv.slice(2);
const arg = (n) => { const i = argv.indexOf(n); return i === -1 ? undefined : argv[i + 1]; };

let outcome = {};
try {
  if (META.runtime === 'browser') {
    const { installBrowserEnv } = await import(resolve(ROOT, 'harness/browser-env.mjs'));
    await installBrowserEnv(() => {});
  }
  const mod = await import(pathToFileURL(resolve(ROOT, META.entry)).href);
  const call = arg('--call');
  if (call) {
    // Dotted paths, matching execute.mjs: an obfuscated CommonJS build arrives
    // as one `default` object, so its functions are only reachable as members.
    let owner = null;
    let fn = mod;
    for (const part of String(call).split('.')) {
      if (fn == null) { fn = undefined; break; }
      owner = fn;
      fn = fn[part];
    }
    if (typeof fn !== 'function') {
      outcome = { error: `export '${call}' is not callable` };
    } else {
      const args = arg('--args') ? JSON.parse(arg('--args')) : [];
      try {
        const v = await fn.apply(owner === mod ? undefined : owner, args);
        outcome = { returned: typeof v === 'object' && v !== null ? '[object]' : v };
      } catch (e) {
        outcome = { threw: { name: e?.name, message: e?.message } };
      }
    }
  } else {
    outcome = { loaded: true, exports: Object.keys(mod) };
  }
} catch (e) {
  outcome = { load_error: String(e?.message || e).slice(0, 200) };
}

process.stdout.write('\n__ADB_OUTCOME__' + JSON.stringify(outcome) + '\n');
