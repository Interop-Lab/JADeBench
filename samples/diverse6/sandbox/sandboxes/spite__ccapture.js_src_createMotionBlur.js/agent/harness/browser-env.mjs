/**
 * browser-env.mjs — a DOM host for subjects that target the browser.
 *
 * 61 of the 202 subjects call browser APIs (`document`, `window`,
 * `getComputedStyle`, storage). Bare Node has none of them, so those subjects
 * cannot even be imported, let alone executed or debugged.
 *
 * This installs a jsdom window as the global host and records every access to
 * it. The recording matters as much as the emulation: the paper's execution
 * level is defined by what a run reveals, so a subject's DOM and storage
 * interaction has to be observable, not merely permitted.
 *
 * This is emulation, not a real browser. Subjects depending on layout,
 * rendering, or real browser quirks will behave differently here, which is a
 * threat the paper must state; the real-browser path belongs with the browser
 * sandbox of §3.6 rather than here.
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');

export async function installBrowserEnv(record = () => {}) {
  let JSDOM;
  try {
    ({ JSDOM } = await import('jsdom'));
  } catch {
    throw new Error(
      'jsdom is required for a browser-runtime subject but is not installed in this sandbox');
  }

  const meta = JSON.parse(readFileSync(resolve(ROOT, 'sandbox.json'), 'utf8'));
  const dom = new JSDOM(meta.browser?.html ?? '<!doctype html><html><body></body></html>', {
    url: meta.browser?.url ?? 'https://sandbox.local/',
    pretendToBeVisual: true,
    runScripts: 'outside-only',
  });

  const { window } = dom;

  // Storage is emulated rather than proxied to disk: it must start empty on
  // every run, or one run's writes would leak into the next and break replay.
  const makeStorage = (label) => {
    const map = new Map();
    return {
      getItem: (k) => { record('storage', { label, op: 'get', key: k }); return map.has(k) ? map.get(k) : null; },
      setItem: (k, v) => { record('storage', { label, op: 'set', key: k, value: String(v) }); map.set(k, String(v)); },
      removeItem: (k) => { record('storage', { label, op: 'remove', key: k }); map.delete(k); },
      clear: () => { record('storage', { label, op: 'clear' }); map.clear(); },
      key: (i) => [...map.keys()][i] ?? null,
      get length() { return map.size; },
    };
  };

  // Expose the window's own properties as globals, the way a browser does.
  const SKIP = new Set(['window', 'self', 'globalThis', 'top', 'parent', 'frames']);
  for (const key of Object.getOwnPropertyNames(window)) {
    if (SKIP.has(key) || key in globalThis) continue;
    try {
      Object.defineProperty(globalThis, key, {
        configurable: true,
        get: () => window[key],
        set: (v) => { window[key] = v; },
      });
    } catch { /* accessor-only or frozen on the host; the explicit list below covers it */ }
  }

  // Some of these (notably `navigator`) are accessor-only on modern Node, so
  // every one is installed with defineProperty rather than assigned.
  const put = (name, value) => {
    try {
      Object.defineProperty(globalThis, name, {
        configurable: true, writable: true, value,
      });
    } catch {
      try {
        Object.defineProperty(globalThis, name, { configurable: true, get: () => value });
      } catch { /* frozen by the host; the subject will see the host's version */ }
    }
  };

  put('window', window);
  put('self', window);
  put('document', window.document);
  put('navigator', window.navigator);
  put('location', window.location);
  put('localStorage', makeStorage('local'));
  put('sessionStorage', makeStorage('session'));
  put('getComputedStyle', window.getComputedStyle.bind(window));
  for (const name of ['HTMLElement', 'Element', 'Node', 'Event', 'CustomEvent',
                      'DOMParser', 'MutationObserver', 'NodeList', 'DocumentFragment',
                      'XMLHttpRequest', 'FormData', 'Blob', 'URL', 'URLSearchParams',
                      'requestAnimationFrame', 'cancelAnimationFrame', 'matchMedia']) {
    if (window[name] !== undefined) put(name, typeof window[name] === 'function' &&
      /^(requestAnimationFrame|cancelAnimationFrame|matchMedia)$/.test(name)
      ? window[name].bind(window) : window[name]);
  }

  // Record DOM queries: which selectors a subject reaches for is exactly the
  // kind of fact string-array indirection hides in the source.
  for (const name of ['querySelector', 'querySelectorAll', 'getElementById',
                      'getElementsByClassName', 'getElementsByTagName']) {
    const original = window.document[name]?.bind(window.document);
    if (!original) continue;
    window.document[name] = (...args) => {
      record('dom', { op: name, args: args.map(String) });
      return original(...args);
    };
  }

  const addEventListener = window.addEventListener.bind(window);
  window.addEventListener = (type, ...rest) => {
    record('dom', { op: 'addEventListener', args: [type] });
    return addEventListener(type, ...rest);
  };

  return { window, dom };
}
