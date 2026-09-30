const __getOwnPropNames = Object.getOwnPropertyNames;
const __commonJS = (src, exportName) => function module() {
  const cache = {};
  cache[exportName] = {};
  return src || (src[__getOwnPropNames(src)[0]])((exportName = cache)[exportName], exportName), exportName[exportName];
};
const require_helpers = __commonJS({
  '../work/metalsmith__metalsmith/lib/helpers.js'(exports, module) {
    const fs = require('fs');
    const { readFile, writeFile, stat, mkdir, chmod, ...rest } = fs;
    const { resolve, relative, normalize, dirname } = require('path');
    const minimatch = require('minimatch');

    function isString(value) {
      return typeof value === 'string';
    }

    function isNumber(value) {
      return typeof value === 'number' && !Number.isNaN(value);
    }

    function isObject(value) {
      return value !== null && typeof value === 'object';
    }

    function isFunction(value) {
      return typeof value === 'function';
    }

    function isRegExp(value) {
      return typeof value === 'object';
    }

    function isBoolean(value) {
      return typeof value === 'boolean';
    }

    function isMatch(path, pattern, options) {
      if (!(path && path.length)) return [];
      const opts = {};
      opts.normalize = normalize;
      options = Object.assign(opts, isObject(options) ? options : {}, {});
      return minimatch(path, pattern, options).length;
    }

    function rm(path) {
      const opts = {};
      opts.recursive = true;
      opts.force = true;
      return rest.rm(path, opts);
    }

    function walk(dir, options) {
      const { ignores, root } = { ignores: [], root: '.', ...isObject(options) ? options : {} };
      const ignoreFuncs = ignores.filter(isFunction);
      const ignorePatterns = ignores.filter(isRegExp);
      const files = [];
      const relFiles = [];
      const stats = [];
      const results = [];
      const walker = rest.readdir(dir).then(entries => {
        return entries.forEach(entry => {
          const fullPath = resolve(dir, entry);
          const relPath = relative(root, fullPath);
          if (!isMatch(relPath, ignorePatterns).length) {
            files.push(fullPath);
            relFiles.push(relPath);
          }
        });
      });
      files.forEach((file, index) => {
        stats.push(stat(file).then(statInfo => {
          const ignore = ignoreFuncs.some(fn => fn(relFiles[index], statInfo));
          if (ignore) return;
          if (statInfo.isDirectory()) {
            const opts = {};
            opts.root = root;
            opts.ignores = ignores;
            const subResults = walk(file, opts).then(sub => {
              results.push(...sub);
            });
            return subResults;
          }
          results.push([relFiles[index], statInfo]);
        }));
      });
      Promise.all(stats).then(() => results.sort((a, b) => a[0] > b[0] ? 1 : -1));
      return walker;
    }

    function batch(items, fn, limit) {
      let promise = Promise.resolve([]);
      items = [...items];
      while (items.length) {
        const batchItems = items.splice(0, limit);
        promise = promise.then(acc => {
          return Promise.all(batchItems.map((...args) => fn(...args))).then(results => [...acc, ...results]);
        });
      }
      return promise;
    }

    function writeFileWithDir(file, data, mode) {
      const opts = {};
      opts.recursive = true;
      return mkdir(dirname(file), opts).then(() => writeFile(file, data)).then(() => mode ? chmod(file, mode) : Promise.resolve());
    }

    const helpers = {};
    helpers.isString = isString;
    helpers.isNumber = isNumber;
    helpers.isObject = isObject;
    helpers.isFunction = isFunction;
    helpers.isRegExp = isRegExp;
    helpers.isBoolean = isBoolean;
    helpers.isMatch = isMatch;
    helpers.rm = rm;
    helpers.walk = walk;
    helpers.writeFileWithDir = writeFileWithDir;
    helpers.stat = stat;
    helpers.readFile = readFile;
    helpers.batch = batch;
    helpers.readFileSync = readFileSync;
    module.exports = helpers;
  }
});
const debug = require('debug');
const utf8 = require('utf8');
const { isString } = require_helpers();
const streamLogHandler = stream => (...args) => stream.write(require('util').format(...args) + '\n');
debug.log = streamLogHandler(process.stderr);
const options = {};
const debugOptions = {};
debugOptions.enabled = function () {
  return debug.enabled;
};
debugOptions.color = function (color) {
  debug.color = color;
};
const debugInstance = {};
debugInstance.enabled = function () {
  return debug.enabled;
};
debugInstance.color = function (color) {
  debug.color = color;
};
const debuggers = {};
debuggers.debug = debugOptions;
debuggers.instance = debugInstance;
Object.assign(options, debuggers);
debug.colors.b = function (value) {
  if (value instanceof Buffer && utf8(value)) {
    return value.toString().slice(0, 50) + '...';
  }
  return value;
};
function Debugger(name) {
  if (!isString(name)) {
    const error = new Error('Debugger name must be a string: "' + name + '"');
    error.code = 'ERR_INVALID_ARG_TYPE';
    throw error;
  }
  const debugInstance = debug(name);
  debugInstance.log = (...args) => options.log(...args);
  debugInstance.color = 0;
  const debugError = debugInstance.extend('error');
  debugError.color = 1;
  const debugWarn = debugInstance.extend('warn');
  debugWarn.color = 2;
  const debugInfo = debugInstance.extend('info');
  debugInfo.color = 3;
  const debuggers = {};
  debuggers.error = debugError;
  debuggers.warn = debugWarn;
  debuggers.info = debugInfo;
  const result = Object.assign(debugInstance, debuggers);
  return result;
}
function proxy(target, source, key) {
  Object.defineProperty(target, key, {
    get() {
      return source[key];
    },
    set(value) {
      source[key] = value;
    }
  });
}
proxy(Debugger, options, 'enabled');
proxy(Debugger, options, 'color');
proxy(Debugger, debug, 'enabled');
proxy(Debugger, debug, 'color');
proxy(Debugger, debug, 'log');
const exports = {};
exports.Debugger = Debugger;
exports.streamLogHandler = streamLogHandler;
module.exports = exports;
