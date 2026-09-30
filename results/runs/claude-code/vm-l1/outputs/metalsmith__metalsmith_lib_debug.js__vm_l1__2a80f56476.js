"use strict";

const { format } = require("util");
const debug = require("debug");
const isUtf8 = require("is-utf8");

function fileLogHandler(stream) {
  return (...args) => stream.write(`${format(...args)}\n`);
}

debug.log = fileLogHandler(process.stderr);

debug.formatters.b = (value) => {
  if (value instanceof Buffer && isUtf8(value)) {
    return `${value.toString().slice(0, 200)}...`;
  }
  return value;
};

function Debugger(namespace) {
  if (typeof namespace !== "string") {
    throw new Error(`invalid debugger namespace "${namespace}"`);
  }

  const logger = debug(namespace);
  logger.log = (...args) => debug.log(...args);
  logger.color = 247;

  const warn = logger.extend("warn");
  warn.color = 178;

  const info = logger.extend("info");
  info.color = 51;

  const error = logger.extend("error");
  error.color = 196;

  logger.warn = warn;
  logger.info = info;
  logger.error = error;

  return logger;
}

Object.defineProperties(Debugger, {
  colors: {
    get() {
      return debug.inspectOpts.colors;
    },
    set(colors) {
      debug.inspectOpts.colors = colors;
    },
  },
  handle: {
    get() {
      return debug.log;
    },
    set(handle) {
      debug.log = handle;
    },
  },
});

for (const property of ["enabled", "enable", "disable"]) {
  Object.defineProperty(Debugger, property, {
    get() {
      return debug[property];
    },
    set(value) {
      debug[property] = value;
    },
  });
}

module.exports = {
  Debugger,
  fileLogHandler,
};
