'use strict';

const fs = require('fs');
const path = require('path');
const micromatch = require('micromatch');
const debug = require('debug');
const isUtf8 = require('is-utf8');
const { format } = require('util');

const {
  readFile,
  writeFile,
  stat,
  mkdir,
  chmod,
  rm: remove,
  readdir: readDirectory,
} = fs.promises;

function isBoolean(value) {
  return typeof value === 'boolean';
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

function isUndefined(value) {
  return typeof value === 'undefined';
}

function isFunction(value) {
  return typeof value === 'function';
}

function match(filePaths, patterns, options) {
  if (!filePaths || !filePaths.length) return [];

  return micromatch(
    filePaths,
    patterns,
    Object.assign({ dot: true }, options || {}, { format: path.normalize }),
  ).sort();
}

function writeStream(filePath) {
  return fs.createWriteStream(filePath, 'utf-8');
}

function rm(filePath) {
  return remove(filePath, { recursive: true, force: true });
}

function readdir(directory, options) {
  const { ignores, root } = {
    ignores: [],
    root: '.',
    ...(options || {}),
  };
  const ignorePatterns = ignores.filter(isString);
  const ignoreFunctions = ignores.filter(isFunction);

  return readDirectory(directory).then((names) => {
    const absolutePaths = [];
    const relativePaths = [];

    for (const name of names) {
      const absolutePath = path.resolve(directory, name);
      const relativePath = path.relative(root, absolutePath);
      if (!match(relativePath, ignorePatterns).length) {
        absolutePaths.push(absolutePath);
        relativePaths.push(relativePath);
      }
    }

    const pendingStats = absolutePaths.map((absolutePath, index) =>
      stat(absolutePath).then((fileStat) => {
        const ignored = ignoreFunctions.some((ignore) =>
          ignore(relativePaths[index], fileStat),
        );
        if (ignored) return [];

        if (fileStat.isDirectory()) {
          return readdir(absolutePath, { root, ignores });
        }

        return [[relativePaths[index], fileStat]];
      }),
    );

    return Promise.all(pendingStats).then((entries) =>
      entries
        .flat()
        .sort((left, right) => (left[0] > right[0] ? 1 : -1)),
    );
  });
}

function batchAsync(task, argumentLists, batchSize) {
  let result = Promise.resolve([]);
  argumentLists = [...argumentLists];

  while (argumentLists.length) {
    const batch = argumentLists.splice(0, batchSize);
    result = result.then((previousResults) =>
      Promise.all(
        batch.map((...callbackArguments) => task(...callbackArguments)),
      ).then((batchResults) => [...previousResults, ...batchResults]),
    );
  }

  return result;
}

function outputFile(filePath, data, mode) {
  return mkdir(path.dirname(filePath), { recursive: true })
    .then(() => writeFile(filePath, data))
    .then(() => (mode ? chmod(filePath, mode) : Promise.resolve()));
}

const helpers = {
  isBoolean,
  isNumber,
  isString,
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
  writeStream,
};

function fileLogHandler(stream) {
  return (...arguments_) => stream.write(`${format(...arguments_)}\n`);
}

debug.log = fileLogHandler(process.stderr);

const options = {};
Object.defineProperties(options, {
  colors: {
    get() {
      return debug.inspectOpts.colors;
    },
    set(value) {
      debug.inspectOpts.colors = value;
    },
  },
  handle: {
    get() {
      return debug.log;
    },
    set(value) {
      debug.log = value;
    },
  },
});

debug.formatters.b = function formatBuffer(value) {
  if (value instanceof Buffer && isUtf8(value)) {
    return `${value.toString().slice(0, 200)}...`;
  }
  return value;
};

function Debugger(namespace) {
  if (!helpers.isString(namespace)) {
    const error = new Error(`invalid debugger namespace "${namespace}"`);
    error.code = 'invalid_debugger_namespace';
    throw error;
  }

  const logger = debug(namespace);
  logger.log = (...arguments_) => options.handle(...arguments_);
  logger.color = 247;

  const warn = logger.extend('warn');
  warn.color = 178;

  const info = logger.extend('info');
  info.color = 51;

  const error = logger.extend('error');
  error.color = 196;

  return Object.assign(logger, { warn, info, error });
}

function proxyProperty(target, source, property) {
  Object.defineProperty(target, property, {
    get() {
      return source[property];
    },
    set(value) {
      source[property] = value;
    },
  });
}

proxyProperty(Debugger, options, 'handle');
proxyProperty(Debugger, options, 'colors');
proxyProperty(Debugger, debug, 'enabled');
proxyProperty(Debugger, debug, 'enable');
proxyProperty(Debugger, debug, 'disable');

module.exports = { Debugger, fileLogHandler };
