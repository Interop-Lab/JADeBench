const debug = require('debug');
const utf8 = require('is-utf8');

const streamLogHandler = (stream) => (...args) => {
  stream.write(`${require('util').format(...args)}\n`);
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

debug.formatters.b = function (value) {
  if (value instanceof Buffer && utf8(value)) {
    return `${value.toString().slice(0, 200)}...`;
  }

  return value;
};

function Debugger(namespace) {
  if (typeof namespace !== 'string') {
    throw new Error(`invalid debugger namespace "${namespace}"`);
  }

  const logger = debug(namespace);
  logger.log = (...args) => options.handle(...args);
  logger.color = 247;

  logger.warn = logger.extend('warn');
  logger.warn.color = 178;

  logger.info = logger.extend('info');
  logger.info.color = 51;

  logger.error = logger.extend('error');
  logger.error.color = 196;

  return logger;
}

function proxy(target, source, property) {
  Object.defineProperty(target, property, {
    get() {
      return source[property];
    },
    set(value) {
      source[property] = value;
    },
  });
}

proxy(Debugger, options, 'handle');
proxy(Debugger, options, 'colors');
proxy(Debugger, debug, 'enabled');
proxy(Debugger, debug, 'enable');
proxy(Debugger, debug, 'disable');

module.exports = {
  Debugger,
  fileLogHandler: streamLogHandler,
};
