const debug = require("debug");
const isUtf8 = require("is-utf8");
const { format } = require("util");

function streamLogHandler(stream) {
  return (...args) => stream.write(`${format(...args)}\n`);
}

debug.log = streamLogHandler(process.stderr);

const options = {};
Object.defineProperties(options, {
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

debug.formatters.b = function formatBuffer(value) {
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

  const logger = debug(namespace);
  logger.log = (...args) => options.handle(...args);
  logger.color = 247;

  const warn = logger.extend("warn");
  warn.color = 178;

  const info = logger.extend("info");
  info.color = 51;

  const error = logger.extend("error");
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

proxyProperty(Debugger, options, "handle");
proxyProperty(Debugger, options, "colors");
proxyProperty(Debugger, debug, "enabled");
proxyProperty(Debugger, debug, "enable");
proxyProperty(Debugger, debug, "disable");

module.exports = {
  Debugger,
  fileLogHandler: streamLogHandler,
};
