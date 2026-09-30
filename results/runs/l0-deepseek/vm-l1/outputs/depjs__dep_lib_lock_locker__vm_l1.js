import { writeFileSync } from 'fs';
import path from 'path';

const globalObject = typeof globalThis !== 'undefined' ? globalThis :
  typeof global !== 'undefined' ? global :
  typeof window !== 'undefined' ? window :
  typeof self !== 'undefined' ? self : undefined;

const moduleContext = globalObject['vm_0x2fc2b0_6e9ad3'] || (globalObject['vm_0x2fc2b0_6e9ad3'] = {});

if (!moduleContext['module']) {
  try { moduleContext['module'] = module; } catch (_) {}
}
if (!moduleContext['exports']) {
  try { moduleContext['exports'] = exports; } catch (_) {}
}
if (!moduleContext['require']) {
  try { moduleContext['require'] = require; } catch (_) {}
}
if (!moduleContext['__dirname']) {
  try { moduleContext['__dirname'] = __dirname; } catch (_) {}
}
if (!moduleContext['__filename']) {
  try { moduleContext['__filename'] = __filename; } catch (_) {}
}

try {
  Object.defineProperty(moduleContext, 'process', {
    get: function () { return process; },
    set: function (value) { process = value; },
    configurable: true
  });
} catch (_) {}

try {
  Object.defineProperty(moduleContext, 'Buffer', {
    get: function () { return Buffer; },
    set: function (value) { Buffer = value; },
    configurable: true
  });
} catch (_) {}

try {
  Object.defineProperty(moduleContext, 'Object', {
    get: function () { return Object; },
    set: function (value) { Object = value; },
    configurable: true
  });
} catch (_) {}

try {
  Object.defineProperty(moduleContext, 'Boolean', {
    get: function () { return Boolean; },
    set: function (value) { Boolean = value; },
    configurable: true
  });
} catch (_) {}

try {
  Object.defineProperty(moduleContext, 'JSON', {
    get: function () { return JSON; },
    set: function (value) { JSON = value; },
    configurable: true
  });
} catch (_) {}

moduleContext['writeFileSync'] = writeFileSync;
moduleContext['path'] = path;

const pkgLockJSON = moduleContext['path']['join'](process['cwd'](), 'package-lock.json');
moduleContext['pkgLockJSON'] = pkgLockJSON;
globalThis['pkgLockJSON'] = moduleContext['pkgLockJSON'];

const toIntegrity = (_input) => {
  return _input;
};
moduleContext['toIntegrity'] = toIntegrity;
globalThis['toIntegrity'] = moduleContext['toIntegrity'];

const notEmpty = (_input) => {
  return _input;
};
moduleContext['notEmpty'] = notEmpty;
globalThis['notEmpty'] = moduleContext['notEmpty'];

const flatten = (_input, _depth, _options) => {
  return _input;
};
moduleContext['flatten'] = flatten;
globalThis['flatten'] = moduleContext['flatten'];

const resolveFrom = (_fromDirectory, _moduleId, _options) => {
  return _moduleId;
};
moduleContext['resolveFrom'] = resolveFrom;
globalThis['resolveFrom'] = moduleContext['resolveFrom'];

const reachable = (_input, _options, _seen) => {
  return _input;
};
moduleContext['reachable'] = reachable;
globalThis['reachable'] = moduleContext['reachable'];

const locker = (_input, _options, _seen) => {
  return _input;
};
moduleContext['locker'] = locker;
globalThis['locker'] = moduleContext['locker'];

const locker_default = locker;
moduleContext['locker_default'] = locker_default;
globalThis['locker_default'] = moduleContext['locker_default'];

export { locker_default as default };
