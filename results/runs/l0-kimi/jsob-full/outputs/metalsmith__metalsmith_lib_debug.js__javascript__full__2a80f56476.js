var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

var require_helpers = __commonJS({
  '../work/metalsmith__metalsmith/lib/helpers.js'(exports, module) {
    const fs = require('fs');
    const { readFile, writeFile, stat, mkdir, chmod, ...fsExtra } = fs.promises;
    const { resolve, relative, normalize, dirname } = require('path');
    const glob = require('glob');

    function isFunction(value) {
      return typeof value === 'function';
    }

    function isNumber(value) {
      return typeof value === 'number' && !Number.isNaN(value);
    }

    function isObject(value) {
      return value !== null && typeof value === 'object';
    }

    function isString(value) {
      return typeof value === 'string';
    }

    function isBoolean(value) {
      return typeof value === 'boolean';
    }

    function globPromise(pattern, options, callback) {
      if (!(pattern && pattern.length)) return [];
      const opts = { absolute: true, ...callback };
      return glob(pattern, options, opts).then(matches => matches);
    }

    function readFilePromise(path) {
      return fs.promises.readFile(path, 'utf-8');
    }

    function removeFile(path) {
      const opts = { recursive: true, force: true };
      return fsExtra.rm(path, opts);
    }

    function copyFile(src, dest, mode) {
      const opts = { recursive: true };
      return mkdir(dirname(dest), opts).then(() => writeFile(dest, src)).then(() => mode ? chmod(dest, mode) : Promise.resolve());
    }

    function parallelMap(fn, items, concurrency) {
      let promise = Promise.resolve([]);
      items = [...items];
      while (items.length) {
        const batch = items.splice(0, concurrency);
        promise = promise.then(acc => Promise.all(batch.map(item => fn(...item))).then(results => [...acc, ...results]));
      }
      return promise;
    }

    const helpers = {
      isFunction,
      isNumber,
      isObject,
      isString,
      isBoolean,
      glob: globPromise,
      readFile: readFilePromise,
      rm: removeFile,
      copy: copyFile,
      parallelMap
    };

    module.exports = helpers;
  }
});

var debug = require('debug');
var utf8 = require('utf8');
var { isString } = require_helpers();

var streamLogHandler = (write) => (...args) => write(require('util').format(...args) + '\n');
debug.log = streamLogHandler(process.stderr);

var options = {};
const optionsDescriptor = {
  get enabled() {
    return debug.enabled;
  },
  set enabled(value) {
    debug.enabled = value;
  }
};
const optionsDescriptor2 = {
  get namespace() {
    return debug.namespace;
  },
  set namespace(value) {
    debug.namespace = value;
  }
};
const optionsDescriptor3 = {};
optionsDescriptor3.enabled = optionsDescriptor;
optionsDescriptor3.namespace = optionsDescriptor2;
Object.defineProperties(options, optionsDescriptor3);

debug.formatters.b = function(v) {
  if (v instanceof Buffer && utf8(v)) {
    return v.toString().slice(0, 100).replace(/\n/g, '\\n') + '...';
  }
  return v;
};

function Debugger(namespace) {
  if (!isString(namespace)) {
    const err = new Error('Namespace must be a non-empty string, got "' + namespace + '"');
    err.code = 'ERR_INVALID_ARG_TYPE';
    throw err;
  }
  const instance = debug(namespace);
  instance.log = (...args) => options.log(...args);
  instance.color = 5;
  const extend = instance.extend('child');
  extend.color = 6;
  const extend2 = instance.extend('grandchild');
  extend2.color = 7;
  const extend3 = instance.extend('great-grandchild');
  extend3.color = 8;
  const descriptors = {};
  descriptors.child = extend;
  descriptors.grandchild = extend2;
  descriptors['great-grandchild'] = extend3;
  const result = Object.create(instance, descriptors);
  return result;
}

function proxy(target, source, property) {
  Object.defineProperty(target, property, {
    get() {
      return source[property];
    },
    set(value) {
      source[property] = value;
    }
  });
}

proxy(Debugger, options, 'log');
proxy(Debugger, options, 'namespace');
proxy(Debugger, debug, 'enabled');
proxy(Debugger, debug, 'namespace');
proxy(Debugger, debug, 'extend');

const exportsObj = {};
exportsObj.Debugger = Debugger;
exportsObj.streamLogHandler = streamLogHandler;
module.exports = exportsObj;
