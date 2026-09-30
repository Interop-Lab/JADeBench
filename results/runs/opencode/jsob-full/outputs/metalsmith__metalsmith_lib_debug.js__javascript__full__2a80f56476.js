"use strict";

const util = require("util");
const createDebug = require("debug");
const isUtf8 = require("is-utf8");

/** Create a debug-compatible log handler that writes complete lines. */
const fileLogHandler = (stream) => (...values) => {
  stream.write(`${util.format(...values)}\n`);
};

createDebug.log = fileLogHandler(process.stderr);

const options = {};
Object.defineProperties(options, {
  colors: {
    get() {
      return createDebug.inspectOpts.colors;
    },
    set(value) {
      createDebug.inspectOpts.colors = value;
    },
  },
  handle: {
    get() {
      return createDebug.log;
    },
    set(value) {
      createDebug.log = value;
    },
  },
});

// The debug package calls custom formatters with the value following `%b`.
// Display short, valid UTF-8 buffers as text and leave other values untouched.
createDebug.formatters.b = (value) => {
  if (value instanceof Buffer && isUtf8(value)) {
    return `${value.toString().slice(0, 200)}...`;
  }
  return value;
};

function Debugger(namespace) {
  if (typeof namespace !== "string") {
    const error = new Error(`invalid debugger namespace "${namespace}"`);
    error.code = "invalid_debugger_namespace";
    throw error;
  }

  const logger = createDebug(namespace);
  logger.log = (...values) => options.handle(...values);
  logger.color = 247;

  const warn = logger.extend("warn");
  warn.color = 178;

  const info = logger.extend("info");
  info.color = 51;

  const error = logger.extend("error");
  error.color = 196;

  return Object.assign(logger, { warn, info, error });
}

function proxyStaticProperty(target, source, property) {
  Object.defineProperty(target, property, {
    get() {
      return source[property];
    },
    set(value) {
      source[property] = value;
    },
  });
}

proxyStaticProperty(Debugger, options, "handle");
proxyStaticProperty(Debugger, options, "colors");
proxyStaticProperty(Debugger, createDebug, "enabled");
proxyStaticProperty(Debugger, createDebug, "enable");
proxyStaticProperty(Debugger, createDebug, "disable");

module.exports = { Debugger, fileLogHandler };
