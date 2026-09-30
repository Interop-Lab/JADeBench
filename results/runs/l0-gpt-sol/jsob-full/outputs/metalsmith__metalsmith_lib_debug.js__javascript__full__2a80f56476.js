const debug = require('debug');
const util = require('util');

function streamLogHandler(stream) {
  return (...args) => stream.write(util.format(...args) + '\n');
}

debug.log = streamLogHandler(process.stderr);

function Debugger(namespace) {
  if (typeof namespace !== 'string') {
    const error = new Error(`Debug namespace must be a string, got "${namespace}"`);
    error.code = 'ERR_INVALID_ARG_TYPE';
    throw error;
  }

  const logger = debug(namespace);
  logger.log = (...args) => options.log(...args);
  logger.diff = 0;

  const errorLogger = logger.extend('error');
  errorLogger.diff = 0;

  const warningLogger = logger.extend('warn');
  warningLogger.diff = 0;

  const debugLogger = logger.extend('debug');
  debugLogger.diff = -1;

  return Object.defineProperties(logger, {
    error: { value: errorLogger },
    warn: { value: warningLogger },
    debug: { value: debugLogger }
  });
}

const options = {
  get log() {
    return debug.log;
  },
  set log(value) {
    debug.log = value;
  },
  get formatArgs() {
    return debug.formatArgs;
  },
  set formatArgs(value) {
    debug.formatArgs = value;
  }
};

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
proxy(Debugger, options, 'formatArgs');
proxy(Debugger, debug, 'enable');
proxy(Debugger, debug, 'disable');
proxy(Debugger, debug, 'enabled');

module.exports = {
  Debugger,
  streamLogHandler
};
