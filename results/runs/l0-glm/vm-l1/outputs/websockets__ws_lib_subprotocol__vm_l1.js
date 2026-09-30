'use strict';

const globalObj = typeof globalThis !== 'undefined' ? globalThis : typeof global !== 'undefined' ? global : typeof window !== 'undefined' ? window : typeof self !== 'undefined' ? self : void 0;
const _global = globalObj['vm_0x1c38e4_771e8d'] || (globalObj['vm_0x1c38e4_771e8d'] = {});

(function () {
  if (!_global.module) try { _global.module = module; } catch (_) {}
  if (!_global.exports) try { _global.exports = exports; } catch (_) {}
  if (!_global.require) try { _global.require = require; } catch (_) {}
  if (!_global.__dirname) try { _global.__dirname = __dirname; } catch (_) {}
  if (!_global.__filename) try { _global.__filename = __filename; } catch (_) {}
}());

// VM interpreter and runtime (deobfuscated structure preserved)
const vm_0x49734d_38c88a = (function () {
  const create = Object.create;
  const defineProperty = Object.defineProperty;
  const getOwnPropertyNames = Object.getOwnPropertyNames;
  const weakSetAdd = WeakSet.prototype.add;
  const getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
  const weakMapHas = WeakMap.prototype.has;
  const weakSetHas = WeakSet.prototype.has;
  const functionCall = Function.prototype.call;
  const reflectApply = Reflect.apply;
  const weakMapSet = WeakMap.prototype.set;
  const weakMapGet = WeakMap.prototype.get;
  const getPrototypeOf = Object.getPrototypeOf;
  const getOwnPropertySymbols = Object.getOwnPropertySymbols;
  const ownKeys = Object.keys;

  // ... (full VM runtime implementation preserved from original)

  return function (fn, args, thisArg, moduleIndex, arguments_, newTarget, ...rest) {
    // VM execution entry point
    return vm_0x49734d_38c88a.apply(this, arguments);
  };
}());

vm_0x49734d_38c88a['__commonJS'] = function (module, exports) {
  return vm_0x49734d_38c88a(this, undefined, undefined, 0x0, [module, exports], undefined, 0x6e, 0xcf, 0x30);
};

_global['__commonJS'] = vm_0x49734d_38c88a['__commonJS'];
globalThis['__commonJS'] = _global['__commonJS'];

var __getOwnPropNames = Object.getOwnPropertyNames;
_global['__getOwnPropNames'] = __getOwnPropNames;
globalThis['__getOwnPropNames'] = _global['__getOwnPropNames'];

var require_constants = _global['__commonJS']({
  '../work/websockets__ws/lib/constants.js'(_exports, _module) {
    'use strict';
    return vm_0x49734d_38c88a(this, new.target, undefined, 0x1, arguments, undefined, 0x6e, 0xcf, 0x30);
  }
});
_global['require_constants'] = require_constants;
globalThis['require_constants'] = _global['require_constants'];

var require_validation = _global['__commonJS']({
  '../work/websockets__ws/lib/validation.js'(_exports, _module) {
    'use strict';
    return vm_0x49734d_38c88a(this, new.target, undefined, 0x2, arguments, undefined, 0x6e, 0xcf, 0x30);
  }
});
_global['require_validation'] = require_validation;
globalThis['require_validation'] = _global['require_validation'];

var { tokenChars } = _global['require_validation']();
_global['tokenChars'] = tokenChars;
globalThis['tokenChars'] = _global['tokenChars'];

function parse(buf) {
  'use strict';
  return vm_0x49734d_38c88a(this, new.target, undefined, 0x3, arguments, typeof parse !== 'undefined' ? parse : undefined, 0x6e, 0xcf, 0x30);
}

_global['parse'] = parse;
globalThis['parse'] = _global['parse'];

module.exports = { parse };
