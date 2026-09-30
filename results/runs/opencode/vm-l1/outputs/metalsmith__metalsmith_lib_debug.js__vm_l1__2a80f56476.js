"use strict";

const util = require("node:util");
const debug = require("debug");
const isUtf8 = require("is-utf8");

/**
 * Builds a log function that writes a space-separated, inspected argument list
 * to a writable stream. The first argument is normally the debug namespace.
 */
function streamLogHandler(stream) {
  return (...args) => {
    stream.write(`${args.map((value) => util.format(value)).join(" ")}\n`);
  };
}

// Keep readable UTF-8 buffers compact while leaving binary buffers to debug's
// normal formatter. This formatter is shared by every debug instance.
debug.formatters.b = (value) => {
  if (Buffer.isBuffer(value) && isUtf8(value)) {
    return `${value.toString().slice(0, 200)}...`;
  }
  return value;
};

debug.log = streamLogHandler(process.stderr);

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

/**
 * Creates a configured debug logger. Calling with `new` is also supported,
 * matching the original wrapper's behavior.
 */
function Debugger(namespace) {
  if (typeof namespace !== "string") {
    throw new Error(`invalid debugger namespace "${namespace}"`);
  }

  const logger = debug(namespace);
  logger.log = debug.log;
  logger.warn = logger.extend("warn");
  logger.info = logger.extend("info");
  logger.error = logger.extend("error");
  return logger;
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

proxyProperty(Debugger, options, "handle");
proxyProperty(Debugger, options, "colors");
proxyProperty(Debugger, debug, "enabled");
proxyProperty(Debugger, debug, "enable");
proxyProperty(Debugger, debug, "disable");

module.exports = {
  Debugger,
  fileLogHandler: streamLogHandler,
};
