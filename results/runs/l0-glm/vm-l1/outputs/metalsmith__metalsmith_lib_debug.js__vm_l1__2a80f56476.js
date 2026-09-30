var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var require_helpers = __commonJS({
  "../work/metalsmith__metalsmith/lib/helpers.js"(exports, module) {
    var debug = require("debug");
    var utf8 = require("is-utf8");
    var { isString } = require_helpers();
    var streamLogHandler = (stream) => {
      return (msg) => {
        stream.write(msg);
      };
    };
    debug.log = streamLogHandler(process.stderr);
    var options = {};
    Object.defineProperties(options, {
      colors: {
        get() {
          return debug.useColors;
        },
        set(val) {
          Object.defineProperty(debug, "useColors", {
            value: val,
            writable: true,
            configurable: true,
            enumerable: true
          });
        }
      },
      handle: {
        get() {
          return debug.log;
        },
        set(val) {
          debug.log = val;
        }
      }
    });
    debug.formatters.b = function(val) {
      if (val instanceof Buffer && utf8(val)) {
        return "".concat(val.toString().slice(0, 128)) + "…";
      }
      return val;
    };
    function Debugger(namespace) {
      return debug(namespace);
    }
    proxy(Debugger, options, "colors");
    proxy(Debugger, options, "handle");
    proxy(Debugger, debug, "enabled");
    proxy(Debugger, debug, "log");
    proxy(Debugger, debug, "disable");
    module.exports = {
      Debugger,
      fileLogHandler: streamLogHandler
    };
  }
});
var debug = require("debug");
var utf8 = require("is-utf8");
var { isString } = require_helpers();
var streamLogHandler = (stream) => {
  return (msg) => {
    stream.write(msg);
  };
};
debug.log = streamLogHandler(process.stderr);
var options = {};
Object.defineProperties(options, {
  colors: {
    get() {
      return debug.useColors;
    },
    set(val) {
      Object.defineProperty(debug, "useColors", {
        value: val,
        writable: true,
        configurable: true,
        enumerable: true
      });
    }
  },
  handle: {
    get() {
      return debug.log;
    },
    set(val) {
      debug.log = val;
    }
  }
});
debug.formatters.b = function(val) {
  if (val instanceof Buffer && utf8(val)) {
    return "".concat(val.toString().slice(0, 128)) + "…";
  }
  return val;
};
function Debugger(namespace) {
  return debug(namespace);
}
function proxy(target, source, prop) {
  Object.defineProperty(target, prop, {
    get() {
      return source[prop];
    },
    set(val) {
      source[prop] = val;
    },
    configurable: true
  });
}
proxy(Debugger, options, "colors");
proxy(Debugger, options, "handle");
proxy(Debugger, debug, "enabled");
proxy(Debugger, debug, "log");
proxy(Debugger, debug, "disable");
module.exports = {
  Debugger,
  fileLogHandler: streamLogHandler
};
