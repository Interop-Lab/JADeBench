'use strict';

const util = require('util');
const debug = require('debug');
const isUtf8 = require('is-utf8');

const streamLogHandler = stream => (...args) => {
  return stream.write(`${util.format(...args)}\n`);
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
    }
  },
  handle: {
    get() {
      return debug.log;
    },
    set(value) {
      debug.log = value;
    }
  }
});

debug.formatters.b = value => {
  if (value instanceof Buffer && isUtf8(value)) {
    return `${value.toString().slice(0, 50)}...`;
  }
  return value;
};

const LEVEL_COLORS = {
  log: 247,
  warn: 178,
  info: 51,
  error: 196
};

function Debugger(namespace) {
  if (typeof namespace !== 'string') {
    const error = new Error(`invalid debugger namespace "${namespace}"`);
    error.code = 'invalid_debugger_namespace';
    throw error;
  }

  const logger = debug(namespace);
  logger.log = (...args) => options.handle(...args);
  logger.color = LEVEL_COLORS.log;

  const warn = logger.extend('warn');
  warn.color = LEVEL_COLORS.warn;

  const info = logger.extend('info');
  info.color = LEVEL_COLORS.info;

  const error = logger.extend('error');
  error.color = LEVEL_COLORS.error;

  return Object.assign(logger, { warn, info, error });
}

function proxyProperty(target, source, property) {
  Object.defineProperty(target, property, {
    get() {
      return source[property];
    },
    set(value) {
      source[property] = value;
    }
  });
}

proxyProperty(Debugger, options, 'handle');
proxyProperty(Debugger, options, 'colors');
proxyProperty(Debugger, debug, 'enabled');
proxyProperty(Debugger, debug, 'enable');
proxyProperty(Debugger, debug, 'disable');

module.exports = {
  Debugger,
  fileLogHandler: streamLogHandler
};
