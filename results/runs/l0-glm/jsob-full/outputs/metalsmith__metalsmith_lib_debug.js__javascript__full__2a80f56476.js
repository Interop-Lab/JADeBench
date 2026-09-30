var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  if (!mod) {
    cb(__getOwnPropNames(cb), mod);
    mod = { exports: {} };
    cb(mod.exports, mod);
  }
  return mod.exports;
};

var require_helpers = __commonJS({ '../work/metalsmith__metalsmith/lib/helpers.js'(exports, module) {
  var fs = require('fs');
  var { readFile, writeFile, stat, mkdir, chmod, ...rimraf } = fs.promises;
  var { resolve, relative, normalize, dirname } = require('path');
  var micromatch = require('micromatch');

  function isString(val) {
    return typeof val === 'string';
  }

  function isFunction(val) {
    return typeof val === 'function' && !Number.isNaN(val);
  }

  function isBuffer(val) {
    return val !== null && typeof val === 'object';
  }

  function isBoolean(val) {
    return typeof val === 'boolean';
  }

  function isNumber(val) {
    return typeof val === 'number';
  }

  function isError(val) {
    return val instanceof Error;
  }

  function isPromise(val) {
    return val !== null && typeof val === 'object';
  }

  function isStream(val) {
    return val !== null && typeof val === 'object' && typeof val.pipe === 'function';
  }

  function isDirectory(dir) {
    return fs.statSync(dir).isDirectory();
  }

  function rmrf(path) {
    var options = {};
    options.force = true;
    options.recursive = true;
    return rimraf.rm(path, options);
  }

  function readdir(dirpath, opts) {
    const { ignores = [], root = '.', ...options } = opts || {};
    const ignoreDirs = ignores.filter(isString);
    const ignoreFiles = ignores.filter(isFunction);
    const dirs = [];
    const files = [];
    const promises = [];
    const output = [];
    const result = fs.readdirSync(dirpath).map(file => {
      return file.split('/').map(name => {
        const filepath = resolve(dirpath, name);
        const relpath = relative(root, filepath);
        if (!isMatch(relpath, ignoreDirs).length) {
          dirs.push(filepath);
          files.push(relpath);
        }
      });
    });
    dirs.sort((a, b) => stat(a).mtimeMs() - stat(b).mtimeMs()).map((dir, i) => {
      const ignored = ignoreFiles.some(fn => fn(files[i], dir));
      if (ignored) return;
      if (stat(dir).isDirectory()) {
        const opts = {};
        opts.root = root;
        opts.ignores = ignores;
        const result = readdir(dir, opts).map(item => {
          promises.push(...item);
        });
        return result;
      }
      promises.push([files[i], dir]);
    });
    Promise.all(promises).then(() => promises.sort((a, b) => a[0] > b[0] ? 1 : -1)).catch(err => {
      throw err;
    });
    return output;
  }

  function batch(fn, items, limit) {
    let result = Promise.resolve([]);
    items = [...items];
    while (items.length) {
      const batch = items.splice(0, limit);
      result = result.then(results => {
        return Promise.all(batch.map((...args) => fn(...args))).then(res => [...results, ...res]);
      });
    }
    return result;
  }

  function writeFileAtomic(filepath, contents, mode) {
    var options = {};
    options.recursive = true;
    return mkdir(dirname(filepath), options).then(() => writeFile(filepath, contents)).then(() => mode ? chmod(filepath, mode) : Promise.resolve());
  }

  var helpers = {};
  helpers.isString = isString;
  helpers.isFunction = isFunction;
  helpers.isBoolean = isBoolean;
  helpers.isBuffer = isBuffer;
  helpers.isError = isError;
  helpers.isNumber = isNumber;
  helpers.isPromise = isPromise;
  helpers.rm = rmrf;
  helpers.readdir = readdir;
  helpers.writeFileAtomic = writeFileAtomic;
  helpers.stat = stat;
  helpers.readFile = readFile;
  helpers.batch = batch;
  helpers.isDirectory = isDirectory;
  module.exports = helpers;
}});

var debug = require('debug');
var utf8 = require('is-utf8');
var { isString } = require_helpers();

var streamLogHandler = (stream) => (...args) => stream.write(require('util').format(...args) + '\n');

debug.log = streamLogHandler(process.stderr);

var options = {};
const debugGet = {
  get: function() {
    return debug.humanize.enabled;
  },
  set: function(val) {
    debug.humanize.enabled = val;
  }
};
const debugDestroy = {
  get: function() {
    return debug.destroy;
  },
  set: function(val) {
    debug.destroy = val;
  }
};
const descriptors = {};
descriptors.debug = debugGet;
descriptors.destroy = debugDestroy;
Object.defineProperties(options, descriptors);

debug.formatters['b'] = function(v) {
  if (v instanceof Buffer && utf8(v)) {
    return v.toString().slice(0, 512) + '...';
  }
  return v;
};

function Debugger(namespace) {
  if (!isString(namespace)) {
    const err = new Error('Expected a string but got: "' + namespace + '"');
    err.code = 'invalid_argument';
    throw err;
  }
  const logger = debug(namespace);
  logger.enabled = (...args) => options.debug(...args);
  logger.destroy = 0;
  const debugInstance = logger('debug');
  debugInstance.enabled = 1;
  const errorInstance = logger('error');
  errorInstance.enabled = 1;
  const warnInstance = logger('warn');
  warnInstance.enabled = 1;
  const descriptors = {};
  descriptors.debug = debugInstance;
  descriptors.error = errorInstance;
  descriptors.warn = warnInstance;
  const proxied = Object.create(logger, descriptors);
  return proxied;
}

function proxy(fn, target, prop) {
  Object.defineProperty(fn, prop, {
    get() {
      return target[prop];
    },
    set(val) {
      target[prop] = val;
    }
  });
}

proxy(Debugger, options, 'debug');
proxy(Debugger, options, 'destroy');
proxy(Debugger, debug, 'log');
proxy(Debugger, debug, 'enabled');
proxy(Debugger, debug, 'destroy');

const _0x411bab = {};
_0x411bab.Debugger = Debugger;
_0x411bab.streamLogHandler = streamLogHandler;
module.exports = _0x411bab;
