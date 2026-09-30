var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// ../work/metalsmith__metalsmith/lib/helpers.js
var require_helpers = __commonJS({
  "../work/metalsmith__metalsmith/lib/helpers.js"(exports2, module2) {
    var fs = require("fs");
    var { readFile, writeFile, stat, mkdir, chmod, ...fsPromises } = fs.promises;
    var { resolve, relative, normalize, dirname } = require("path");
    var micromatch = require("micromatch");
    function isBoolean(b) {
      return typeof b === "boolean";
    }
    function isNumber(n) {
      return typeof n === "number" && !Number.isNaN(n);
    }
    function isObject(o) {
      return o !== null && typeof o === "object";
    }
    function isString2(s) {
      return typeof s === "string";
    }
    function isUndefined(u) {
      return typeof u === "undefined";
    }
    function isFunction(f) {
      return typeof f === "function";
    }
    function match(input, patterns, options2) {
      if (!(input && input.length)) return [];
      options2 = Object.assign({ dot: true }, options2 || {}, {
        // required to convert forward to backslashes on Windows and match the file keys properly
        format: normalize
      });
      return micromatch(input, patterns, options2).sort();
    }
    function writeStream(path) {
      return fs.createWriteStream(path, "utf-8");
    }
    function rm(p) {
      return fsPromises.rm(p, { recursive: true, force: true });
    }
    function readdir(dir, opts) {
      const { ignores, root } = { ignores: [], root: ".", ...opts || {} };
      const patternIgnores = ignores.filter(isString2);
      const fnIgnores = ignores.filter(isFunction);
      const abspaths = [], relpaths = [];
      const statAndSubdirCalls = [];
      const resolutions = [];
      const result = fsPromises.readdir(dir).then((descendants) => {
        descendants.forEach((dpath) => {
          const abspath = resolve(dir, dpath);
          const relpath = relative(root, abspath);
          if (!match(relpath, patternIgnores).length) {
            abspaths.push(abspath);
            relpaths.push(relpath);
          }
        });
        abspaths.forEach((abspath, i) => {
          statAndSubdirCalls.push(
            stat(abspath).then((stats) => {
              const isFnIgnored = fnIgnores.some((fn) => fn(relpaths[i], stats));
              if (isFnIgnored) return;
              if (stats.isDirectory()) {
                const promised = readdir(abspath, { root, ignores }).then((descendants2) => {
                  resolutions.push(...descendants2);
                });
                return promised;
              }
              resolutions.push([relpaths[i], stats]);
            })
          );
        });
        return Promise.all(statAndSubdirCalls).then(() => resolutions.sort((a, b) => a[0] > b[0] ? 1 : -1)).catch((err) => {
          throw err;
        });
      });
      return result;
    }
    function batchAsync(fn, items, concurrency) {
      let batches = Promise.resolve([]);
      items = [...items];
      while (items.length) {
        const slice = items.splice(0, concurrency);
        batches = batches.then((previousBatch) => {
          return Promise.all(slice.map((...args) => fn(...args))).then((currentBatch) => [
            ...previousBatch,
            ...currentBatch
          ]);
        });
      }
      return batches;
    }
    function outputFile(file, data, mode) {
      return mkdir(dirname(file), { recursive: true }).then(() => writeFile(file, data)).then(() => mode ? chmod(file, mode) : Promise.resolve());
    }
    var helpers = {
      isBoolean,
      isNumber,
      isString: isString2,
      isObject,
      isUndefined,
      isFunction,
      match,
      rm,
      readdir,
      outputFile,
      stat,
      readFile,
      batchAsync,
      writeStream
    };
    module2.exports = helpers;
  }
});

// ../work/metalsmith__metalsmith/lib/debug.js
var debug = require("debug");
var utf8 = require("is-utf8");
var { isString } = require_helpers();
var streamLogHandler = (stream) => (...args) => stream.write(require("util").format(...args) + "\n");
debug.log = streamLogHandler(process.stderr);
var options = {};
Object.defineProperties(options, {
  colors: {
    get() {
      return debug.inspectOpts.colors;
    },
    set(v) {
      debug.inspectOpts.colors = v;
    }
  },
  handle: {
    get() {
      return debug.log;
    },
    set(v) {
      debug.log = v;
    }
  }
});
debug.formatters.b = function(buffer) {
  if (buffer instanceof Buffer && utf8(buffer)) {
    return `${buffer.toString().slice(0, 200)}...`;
  }
  return buffer;
};
function Debugger(namespace) {
  if (!isString(namespace)) {
    const err = new Error(`invalid debugger namespace "${namespace}"`);
    err.code = "invalid_debugger_namespace";
    throw err;
  }
  const namespacedDebug = debug(namespace);
  namespacedDebug.log = (...args) => options.handle(...args);
  namespacedDebug.color = 247;
  const warn = namespacedDebug.extend("warn");
  warn.color = 178;
  const info = namespacedDebug.extend("info");
  info.color = 51;
  const error = namespacedDebug.extend("error");
  error.color = 196;
  const dbugger = Object.assign(namespacedDebug, { warn, info, error });
  return dbugger;
}
function proxy(host, target, option) {
  Object.defineProperty(host, option, {
    get() {
      return target[option];
    },
    set(v) {
      target[option] = v;
    }
  });
}
proxy(Debugger, options, "handle");
proxy(Debugger, options, "colors");
proxy(Debugger, debug, "enabled");
proxy(Debugger, debug, "enable");
proxy(Debugger, debug, "disable");
module.exports = {
  Debugger,
  fileLogHandler: streamLogHandler
};
