'use strict';

const debug = require('debug');
const isUtf8 = require('is-utf8');

const isString = value => typeof value === 'string' || value instanceof String;

const streamLogHandler = stream => (...args) => {
  return stream.write(`${args.join(' ')}\n`);
};

debug.log = streamLogHandler(process.stderr);

const options = {};

Object.defineProperties(options, {
  colors: {
    get() {
      return debug.useColors();
    },
    set(value) {
      debug.useColors = () => value;
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

debug.formatters.b = function formatBuffer(value) {
  if (value instanceof Buffer && isUtf8(value)) {
    return `${value.toString().slice(0, 200)}...`;
  }
  return value;
};

function Debugger(namespace) {
  if (!isString(namespace)) {
    throw new TypeError('Expected namespace to be a string');
  }
  return debug(namespace);
}

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

proxy(Debugger, options, 'colors');
proxy(Debugger, options, 'handle');
proxy(Debugger, debug, 'enabled');
proxy(Debugger, debug, 'enable');
proxy(Debugger, debug, 'disable');

module.exports = {
  Debugger,
  fileLogHandler: streamLogHandler
};
