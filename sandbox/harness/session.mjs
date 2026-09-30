/**
 * Persistent L1 execution session.
 *
 * The subject is loaded once, then newline-delimited JSON requests are read
 * from stdin.  This preserves module state across a bounded probe sequence.
 * It exposes only the same public information as execute.mjs: export shape,
 * return values, exceptions, and intercepted host events.
 */
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline';
import { installDeterminism, instrumentConsole, safeValue } from './runtime-env.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const META = JSON.parse(readFileSync(resolve(ROOT, 'sandbox.json'), 'utf8'));
const events = [];
const record = (channel, detail) => events.push({ seq: events.length, channel, ...detail });

if (META.runtime === 'browser') {
  const { installBrowserEnv } = await import(resolve(ROOT, 'harness/browser-env.mjs'));
  await installBrowserEnv(record);
}
installDeterminism(ROOT, record);
instrumentConsole(record);

let mod = null;
let loadError = null;
try {
  mod = await import(pathToFileURL(resolve(ROOT, META.entry)).href);
} catch (err) {
  loadError = { name: err?.name, message: err?.message, code: err?.code };
}
const loadEvents = events.slice();

function resolvePath(path) {
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

function describe(value) {
  if (value === null || (typeof value !== 'object' && typeof value !== 'function')) return undefined;
  const out = {};
  for (const key of Object.keys(value).slice(0, 80)) {
    try { out[key] = typeof value[key]; } catch { out[key] = '[unreadable]'; }
  }
  return out;
}

function describeStatic(value) {
  if (typeof value !== 'function') return undefined;
  const out = {};
  for (const key of Object.getOwnPropertyNames(value).filter(
    key => !['length', 'name', 'prototype', 'arguments', 'caller'].includes(key)
  ).slice(0, 80)) {
    try { out[key] = typeof value[key]; } catch { out[key] = '[unreadable]'; }
  }
  return out;
}

function describePrototype(value) {
  if (typeof value !== 'function' || !value.prototype) return undefined;
  const out = {};
  for (const key of Object.getOwnPropertyNames(value.prototype).filter(key => key !== 'constructor').slice(0, 80)) {
    try { out[key] = typeof value.prototype[key]; } catch { out[key] = '[unreadable]'; }
  }
  return out;
}

function moduleDescription(includeLoadEvents = false) {
  const names = mod ? Object.keys(mod) : [];
  const result = {
    runtime: META.runtime,
    loaded: !loadError,
    load_error: loadError,
    exports: names,
    export_kinds: mod ? Object.fromEntries(names.map(name => [name, typeof mod[name]])) : {},
  };
  if (mod) {
    const members = {};
    const staticMembers = {};
    const prototypes = {};
    for (const name of names) {
      const shape = describe(mod[name]);
      if (shape && Object.keys(shape).length) members[name] = shape;
      const prototype = describePrototype(mod[name]);
      if (prototype && Object.keys(prototype).length) prototypes[name] = prototype;
      const staticShape = describeStatic(mod[name]);
      if (staticShape && Object.keys(staticShape).length) staticMembers[name] = staticShape;
      if (shape) {
        for (const member of Object.keys(shape)) {
          let memberPrototype;
          try { memberPrototype = describePrototype(mod[name][member]); } catch { memberPrototype = undefined; }
          if (memberPrototype && Object.keys(memberPrototype).length) {
            prototypes[`${name}.${member}`] = memberPrototype;
          }
        }
      }
    }
    if (Object.keys(members).length) result.export_members = members;
    if (Object.keys(staticMembers).length) result.export_static_members = staticMembers;
    if (Object.keys(prototypes).length) result.export_prototypes = prototypes;
  }
  result.events = includeLoadEvents ? loadEvents : [];
  return result;
}

async function execute(request) {
  if (!request || request.op === 'describe') return moduleDescription(true);
  if (request.op === 'describe_handle') {
    const handle = String(request.handle || '');
    const value = instances.get(handle);
    return {
      loaded: !loadError,
      handle,
      handle_members: value === undefined ? null : describe(value),
      events: [],
    };
  }
  if (request.op !== 'call') return { harness_error: 'unsupported session operation' };
  const call = String(request.call || '');
  const args = Array.isArray(request.args) ? request.args : [];
  const construct = request.construct === true;
  const start = events.length;
  const result = moduleDescription(false);
  if (!mod) return result;
  const receiver = request.receiver ? instances.get(String(request.receiver)) : undefined;
  const resolved = receiver === undefined
    ? resolvePath(call)
    : { target: receiver?.[call], owner: receiver };
  const { target, owner } = resolved;
  if (typeof target !== 'function') {
    result.call = { name: call, args, error: 'export is not callable' };
  } else {
    try {
      const value = construct
        ? Reflect.construct(target, args)
        : await target.apply(owner === mod ? undefined : owner, args);
      if (request.save) instances.set(String(request.save), value);
      result.call = { name: call, args, construct, returned: safeValue(value) };
    } catch (err) {
      result.call = {
        name: call, construct,
        args,
        threw: { name: err?.name, message: err?.message, code: err?.code },
      };
    }
  }
  result.events = events.slice(start);
  return result;
}

function send(value) {
  process.stdout.write(JSON.stringify(value) + '\n');
}

const instances = new Map();
send({ ready: true, result: moduleDescription(true) });
const reader = createInterface({ input: process.stdin, crlfDelay: Infinity });
for await (const line of reader) {
  if (!line.trim()) continue;
  try {
    const request = JSON.parse(line);
    if (request.op === 'close') {
      send({ closed: true });
      break;
    }
    send(await execute(request));
  } catch (err) {
    send({ harness_error: String(err?.message || err) });
  }
}
