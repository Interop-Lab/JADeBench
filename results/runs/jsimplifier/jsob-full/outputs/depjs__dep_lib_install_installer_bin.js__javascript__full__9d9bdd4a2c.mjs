"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;
var _promises = require("fs/promises");
var _path = _interopRequireWildcard(require("path"));
var _fs = _interopRequireDefault(require("fs"));
function _interopRequireDefault(e) {
  if (e && e.__esModule) {
    return e;
  } else {
    return {
      default: e
    };
  }
}
function _getRequireWildcardCache(e) {
  if (typeof WeakMap != "function") {
    return null;
  }
  var r = new WeakMap();
  var t = new WeakMap();
  return (_getRequireWildcardCache = function _getRequireWildcardCache(e) {
    if (e) {
      return t;
    } else {
      return r;
    }
  })(e);
}
function _interopRequireWildcard(e, r) {
  if (!r && e && e.__esModule) {
    return e;
  }
  if (e === null || _typeof(e) != "object" && typeof e != "function") {
    return {
      default: e
    };
  }
  var t = _getRequireWildcardCache(r);
  if (t && t.has(e)) {
    return t.get(e);
  }
  var n = {
    __proto__: null
  };
  var a = Object.defineProperty && Object.getOwnPropertyDescriptor;
  for (var u in e) {
    if (u !== "default" && {}.hasOwnProperty.call(e, u)) {
      var i = a ? Object.getOwnPropertyDescriptor(e, u) : null;
      if (i && (i.get || i.set)) {
        Object.defineProperty(n, u, i);
      } else {
        n[u] = e[u];
      }
    }
  }
  n.default = e;
  if (t) {
    t.set(e, n);
  }
  return n;
}
function _typeof(o) {
  "@babel/helpers - typeof";

  if (typeof Symbol == "function" && typeof Symbol.iterator == "symbol") {
    _typeof = function _typeof(o) {
      return typeof o;
    };
  } else {
    _typeof = function _typeof(o) {
      if (o && typeof Symbol == "function" && o.constructor === Symbol && o !== Symbol.prototype) {
        return "symbol";
      } else {
        return typeof o;
      }
    };
  }
  return _typeof(o);
}
function _regeneratorRuntime() {
  "use strict";

  _regeneratorRuntime = function _regeneratorRuntime() {
    return e;
  };
  var t;
  var e = {};
  var r = Object.prototype;
  var n = r.hasOwnProperty;
  var o = Object.defineProperty || function (t, e, r) {
    t[e] = r.value;
  };
  var i = typeof Symbol == "function" ? Symbol : {};
  var a = i.iterator || "@@iterator";
  var c = i.asyncIterator || "@@asyncIterator";
  var u = i.toStringTag || "@@toStringTag";
  function define(t, e, r) {
    Object.defineProperty(t, e, {
      value: r,
      enumerable: true,
      configurable: true,
      writable: true
    });
    return t[e];
  }
  try {
    define({}, "");
  } catch (t) {
    define = function define(t, e, r) {
      return t[e] = r;
    };
  }
  function wrap(t, e, r, n) {
    var i = e && e.prototype instanceof Generator ? e : Generator;
    var a = Object.create(i.prototype);
    var c = new Context(n || []);
    o(a, "_invoke", {
      value: makeInvokeMethod(t, r, c)
    });
    return a;
  }
  function tryCatch(t, e, r) {
    try {
      return {
        type: "normal",
        arg: t.call(e, r)
      };
    } catch (t) {
      return {
        type: "throw",
        arg: t
      };
    }
  }
  e.wrap = wrap;
  var h = "suspendedStart";
  var l = "suspendedYield";
  var f = "executing";
  var s = "completed";
  var y = {};
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}
  var p = {};
  define(p, a, function () {
    return this;
  });
  var d = Object.getPrototypeOf;
  var v = d && d(d(values([])));
  if (v && v !== r && n.call(v, a)) {
    p = v;
  }
  var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p);
  function defineIteratorMethods(t) {
    ["next", "throw", "return"].forEach(function (e) {
      define(t, e, function (t) {
        return this._invoke(e, t);
      });
    });
  }
  function AsyncIterator(t, e) {
    function invoke(r, o, i, a) {
      var c = tryCatch(t[r], t, o);
      if (c.type !== "throw") {
        var u = c.arg;
        var h = u.value;
        if (h && _typeof(h) == "object" && n.call(h, "__await")) {
          return e.resolve(h.__await).then(function (t) {
            invoke("next", t, i, a);
          }, function (t) {
            invoke("throw", t, i, a);
          });
        } else {
          return e.resolve(h).then(function (t) {
            u.value = t;
            i(u);
          }, function (t) {
            return invoke("throw", t, i, a);
          });
        }
      }
      a(c.arg);
    }
    var r;
    o(this, "_invoke", {
      value(t, n) {
        function callInvokeWithMethodAndArg() {
          return new e(function (e, r) {
            invoke(t, n, e, r);
          });
        }
        return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
      }
    });
  }
  function makeInvokeMethod(e, r, n) {
    var o = h;
    return function (i, a) {
      if (o === f) {
        throw Error("Generator is already running");
      }
      if (o === s) {
        if (i === "throw") {
          throw a;
        }
        return {
          value: t,
          done: true
        };
      }
      n.method = i;
      for (n.arg = a;;) {
        var c = n.delegate;
        if (c) {
          var u = maybeInvokeDelegate(c, n);
          if (u) {
            if (u === y) {
              continue;
            }
            return u;
          }
        }
        if (n.method === "next") {
          n.sent = n._sent = n.arg;
        } else if (n.method === "throw") {
          if (o === h) {
            o = s;
            throw n.arg;
          }
          n.dispatchException(n.arg);
        } else if (n.method === "return") {
          n.abrupt("return", n.arg);
        }
        o = f;
        var p = tryCatch(e, r, n);
        if (p.type === "normal") {
          if (n.done) {
            o = s;
          } else {
            o = l;
          }
          if (p.arg === y) {
            continue;
          }
          return {
            value: p.arg,
            done: n.done
          };
        }
        if (p.type === "throw") {
          o = s;
          n.method = "throw";
          n.arg = p.arg;
        }
      }
    };
  }
  function maybeInvokeDelegate(e, r) {
    var n = r.method;
    var o = e.iterator[n];
    if (o === t) {
      r.delegate = null;
      if (n !== "throw" || !e.iterator.return || !(r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), r.method === "throw")) {
        if (n !== "return") {
          r.method = "throw";
          r.arg = new TypeError("The iterator does not provide a '" + n + "' method");
        }
      }
      return y;
    }
    var i = tryCatch(o, e.iterator, r.arg);
    if (i.type === "throw") {
      r.method = "throw";
      r.arg = i.arg;
      r.delegate = null;
      return y;
    }
    var a = i.arg;
    if (a) {
      if (a.done) {
        r[e.resultName] = a.value;
        r.next = e.nextLoc;
        if (r.method !== "return") {
          r.method = "next";
          r.arg = t;
        }
        r.delegate = null;
        return y;
      } else {
        return a;
      }
    } else {
      r.method = "throw";
      r.arg = new TypeError("iterator result is not an object");
      r.delegate = null;
      return y;
    }
  }
  function pushTryEntry(t) {
    var e = {
      tryLoc: t[0]
    };
    if (1 in t) {
      e.catchLoc = t[1];
    }
    if (2 in t) {
      e.finallyLoc = t[2];
      e.afterLoc = t[3];
    }
    this.tryEntries.push(e);
  }
  function resetTryEntry(t) {
    var e = t.completion || {};
    e.type = "normal";
    delete e.arg;
    t.completion = e;
  }
  function Context(t) {
    this.tryEntries = [{
      tryLoc: "root"
    }];
    t.forEach(pushTryEntry, this);
    this.reset(true);
  }
  function values(e) {
    if (e || e === "") {
      var r = e[a];
      if (r) {
        return r.call(e);
      }
      if (typeof e.next == "function") {
        return e;
      }
      if (!isNaN(e.length)) {
        var o = -1;
        var i = function next() {
          while (++o < e.length) {
            if (n.call(e, o)) {
              next.value = e[o];
              next.done = false;
              return next;
            }
          }
          next.value = t;
          next.done = true;
          return next;
        };
        return i.next = i;
      }
    }
    throw new TypeError(_typeof(e) + " is not iterable");
  }
  GeneratorFunction.prototype = GeneratorFunctionPrototype;
  o(g, "constructor", {
    value: GeneratorFunctionPrototype,
    configurable: true
  });
  o(GeneratorFunctionPrototype, "constructor", {
    value: GeneratorFunction,
    configurable: true
  });
  GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction");
  e.isGeneratorFunction = function (t) {
    var e = typeof t == "function" && t.constructor;
    return !!e && (e === GeneratorFunction || (e.displayName || e.name) === "GeneratorFunction");
  };
  e.mark = function (t) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(t, GeneratorFunctionPrototype);
    } else {
      t.__proto__ = GeneratorFunctionPrototype;
      define(t, u, "GeneratorFunction");
    }
    t.prototype = Object.create(g);
    return t;
  };
  e.awrap = function (t) {
    return {
      __await: t
    };
  };
  defineIteratorMethods(AsyncIterator.prototype);
  define(AsyncIterator.prototype, c, function () {
    return this;
  });
  e.AsyncIterator = AsyncIterator;
  e.async = function (t, r, n, o, i = Promise) {
    var a = new AsyncIterator(wrap(t, r, n, o), i);
    if (e.isGeneratorFunction(r)) {
      return a;
    } else {
      return a.next().then(function (t) {
        if (t.done) {
          return t.value;
        } else {
          return a.next();
        }
      });
    }
  };
  defineIteratorMethods(g);
  define(g, u, "Generator");
  define(g, a, function () {
    return this;
  });
  define(g, "toString", function () {
    return "[object Generator]";
  });
  e.keys = function (t) {
    var e = Object(t);
    var r = [];
    for (var n in e) {
      r.push(n);
    }
    r.reverse();
    return function next() {
      while (r.length) {
        var t = r.pop();
        if (t in e) {
          next.value = t;
          next.done = false;
          return next;
        }
      }
      next.done = true;
      return next;
    };
  };
  e.values = values;
  Context.prototype = {
    constructor: Context,
    reset(e) {
      this.prev = 0;
      this.next = 0;
      this.sent = this._sent = t;
      this.done = false;
      this.delegate = null;
      this.method = "next";
      this.arg = t;
      this.tryEntries.forEach(resetTryEntry);
      if (!e) {
        for (var r in this) {
          if (r.charAt(0) === "t" && n.call(this, r) && !isNaN(+r.slice(1))) {
            this[r] = t;
          }
        }
      }
    },
    stop() {
      this.done = true;
      var t = this.tryEntries[0].completion;
      if (t.type === "throw") {
        throw t.arg;
      }
      return this.rval;
    },
    dispatchException(e) {
      if (this.done) {
        throw e;
      }
      var r = this;
      function handle(n, o) {
        a.type = "throw";
        a.arg = e;
        r.next = n;
        if (o) {
          r.method = "next";
          r.arg = t;
        }
        return !!o;
      }
      for (var o = this.tryEntries.length - 1; o >= 0; --o) {
        var i = this.tryEntries[o];
        var a = i.completion;
        if (i.tryLoc === "root") {
          return handle("end");
        }
        if (i.tryLoc <= this.prev) {
          var c = n.call(i, "catchLoc");
          var u = n.call(i, "finallyLoc");
          if (c && u) {
            if (this.prev < i.catchLoc) {
              return handle(i.catchLoc, true);
            }
            if (this.prev < i.finallyLoc) {
              return handle(i.finallyLoc);
            }
          } else if (c) {
            if (this.prev < i.catchLoc) {
              return handle(i.catchLoc, true);
            }
          } else {
            if (!u) {
              throw Error("try statement without catch or finally");
            }
            if (this.prev < i.finallyLoc) {
              return handle(i.finallyLoc);
            }
          }
        }
      }
    },
    abrupt(t, e) {
      for (var r = this.tryEntries.length - 1; r >= 0; --r) {
        var o = this.tryEntries[r];
        if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) {
          var i = o;
          break;
        }
      }
      if (i && (t === "break" || t === "continue") && i.tryLoc <= e && e <= i.finallyLoc) {
        i = null;
      }
      var a = i ? i.completion : {};
      a.type = t;
      a.arg = e;
      if (i) {
        this.method = "next";
        this.next = i.finallyLoc;
        return y;
      } else {
        return this.complete(a);
      }
    },
    complete(t, e) {
      if (t.type === "throw") {
        throw t.arg;
      }
      if (t.type === "break" || t.type === "continue") {
        this.next = t.arg;
      } else if (t.type === "return") {
        this.rval = this.arg = t.arg;
        this.method = "return";
        this.next = "end";
      } else if (t.type === "normal" && e) {
        this.next = e;
      }
      return y;
    },
    finish(t) {
      for (var e = this.tryEntries.length - 1; e >= 0; --e) {
        var r = this.tryEntries[e];
        if (r.finallyLoc === t) {
          this.complete(r.completion, r.afterLoc);
          resetTryEntry(r);
          return y;
        }
      }
    },
    catch(t) {
      for (var e = this.tryEntries.length - 1; e >= 0; --e) {
        var r = this.tryEntries[e];
        if (r.tryLoc === t) {
          var n = r.completion;
          if (n.type === "throw") {
            var o = n.arg;
            resetTryEntry(r);
          }
          return o;
        }
      }
      throw Error("illegal catch attempt");
    },
    delegateYield(e, r, n) {
      this.delegate = {
        iterator: values(e),
        resultName: r,
        nextLoc: n
      };
      if (this.method === "next") {
        this.arg = t;
      }
      return y;
    }
  };
  return e;
}
function asyncGeneratorStep(n, t, e, r, o, a, c) {
  try {
    var i = n[a](c);
    var u = i.value;
  } catch (n) {
    e(n);
    return;
  }
  if (i.done) {
    t(u);
  } else {
    Promise.resolve(u).then(r, o);
  }
}
function _asyncToGenerator(n) {
  return function () {
    var t = this;
    var e = arguments;
    return new Promise(function (r, o) {
      var a = n.apply(t, e);
      function _next(n) {
        asyncGeneratorStep(a, r, o, _next, _throw, "next", n);
      }
      function _throw(n) {
        asyncGeneratorStep(a, r, o, _next, _throw, "throw", n);
      }
      _next(undefined);
    });
  };
}
function _slicedToArray(r, e) {
  return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest();
}
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _iterableToArrayLimit(r, l) {
  var t = r == null ? null : typeof Symbol != "undefined" && r[Symbol.iterator] || r["@@iterator"];
  if (t != null) {
    var e;
    var n;
    var i;
    var u;
    var a = [];
    var f = true;
    var o = false;
    try {
      i = (t = t.call(r)).next;
      if (l === 0) {
        if (Object(t) !== t) {
          return;
        }
        f = false;
      } else {
        for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = true) {}
      }
    } catch (r) {
      o = true;
      n = r;
    } finally {
      try {
        if (!f && t.return != null && (u = t.return(), Object(u) !== u)) {
          return;
        }
      } finally {
        if (o) {
          throw n;
        }
      }
    }
    return a;
  }
}
function _arrayWithHoles(r) {
  if (Array.isArray(r)) {
    return r;
  }
}
function _createForOfIteratorHelper(r, e) {
  var t = typeof Symbol != "undefined" && r[Symbol.iterator] || r["@@iterator"];
  if (!t) {
    if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && typeof r.length == "number") {
      if (t) {
        r = t;
      }
      var _n = 0;
      var F = function F() {};
      return {
        s: F,
        n() {
          if (_n >= r.length) {
            return {
              done: true
            };
          } else {
            return {
              done: false,
              value: r[_n++]
            };
          }
        },
        e(r) {
          throw r;
        },
        f: F
      };
    }
    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  var o;
  var a = true;
  var u = false;
  return {
    s() {
      t = t.call(r);
    },
    n() {
      var r = t.next();
      a = r.done;
      return r;
    },
    e(r) {
      u = true;
      o = r;
    },
    f() {
      try {
        if (!a && t.return != null) {
          t.return();
        }
      } finally {
        if (u) {
          throw o;
        }
      }
    }
  };
}
function _unsupportedIterableToArray(r, a) {
  if (r) {
    if (typeof r == "string") {
      return _arrayLikeToArray(r, a);
    }
    var t = {}.toString.call(r).slice(8, -1);
    if (t === "Object" && r.constructor) {
      t = r.constructor.name;
    }
    if (t === "Map" || t === "Set") {
      return Array.from(r);
    } else if (t === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)) {
      return _arrayLikeToArray(r, a);
    } else {
      return undefined;
    }
  }
}
function _arrayLikeToArray(r, a) {
  if (a == null || a > r.length) {
    a = r.length;
  }
  for (var e = 0, n = Array(a); e < a; e++) {
    n[e] = r[e];
  }
  return n;
}
var shebangExpr = /^#!\s*(?:\/usr\/bin\/env\s+(?:-S\s+)?((?:[^ \t=]+=[^ \t=]+\s+)*))?([^ \t]+)(.*)$/;
var replaceDollarWithPercentPair = function replaceDollarWithPercentPair(_0x5ce640) {
  var _0x387029 = /\$\{?([^$@#?\- \t{}:]+)\}?/g;
  var _0x44f7ab = "";
  var _0x5b1c06 = 0;
  var _0x3e3e8a;
  do {
    _0x3e3e8a = _0x387029.exec(_0x5ce640);
    if (_0x3e3e8a) {
      _0x44f7ab += (_0x5ce640.substring(_0x5b1c06, _0x3e3e8a.index) || "") + "%" + _0x3e3e8a[1] + "%";
      _0x5b1c06 = _0x387029.lastIndex;
    }
  } while (_0x387029.lastIndex > 0);
  return _0x44f7ab + _0x5ce640.slice(_0x5b1c06);
};
var convertToSetCommands = function convertToSetCommands(_0x4d0bf8) {
  var _0x8129d9 = "";
  var _iterator = _createForOfIteratorHelper(_0x4d0bf8.split(" "));
  var _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var _0x25ab54 = _step.value;
      var _x25ab54$split = _0x25ab54.split("=");
      var _x25ab54$split2 = _slicedToArray(_x25ab54$split, 2);
      var _0x3b0005 = _x25ab54$split2[0];
      var _0x2aa863 = _x25ab54$split2[1];
      var _0x14b0f5 = (_0x3b0005 || "").trim();
      var _0x2d32b4 = (_0x2aa863 || "").trim();
      if (_0x14b0f5 && _0x2d32b4) {
        _0x8129d9 += "@SET " + _0x14b0f5 + "=" + replaceDollarWithPercentPair(_0x2d32b4) + "\r\n";
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  return _0x8129d9;
};
var rm = function rm(_0x127a49) {
  return _promises.unlink(_0x127a49).catch(function () {});
};
var writeShim = function writeShim(_0x4cdd45, _0x411a35, _0xb22d17, _0x588619, _0xd14a1c) {
  var _0x3f3c39 = _path.relative(_path.dirname(_0x411a35), _0x4cdd45).split("\\").join("/");
  var _0xdfefdf = _0x3f3c39.split("/").join("\\");
  var _0x31793c = _0x3f3c39;
  var _0x235439;
  var _0x1f10bf = _0xb22d17 && _0xb22d17.split("\\").join("/");
  var _0x29853d;
  var _0x4c0103 = _0x1f10bf && "\"" + _0x1f10bf + "$exe\"";
  var _0x86a77;
  _0x588619 = _0x588619 || "";
  _0xd14a1c = _0xd14a1c || "";
  if (!_0xb22d17) {
    _0xb22d17 = "\"%dp0%\\" + _0xdfefdf + "\"";
    _0x1f10bf = "\"$basedir/" + _0x3f3c39 + "\"";
    _0x4c0103 = _0x1f10bf;
    _0x588619 = "";
    _0xdfefdf = "";
    _0x3f3c39 = "";
    _0x31793c = "";
  } else {
    _0x235439 = "\"%dp0%\\" + _0xb22d17 + ".exe\"";
    _0x29853d = "\"$basedir/" + _0xb22d17 + "\"";
    _0x86a77 = "\"$basedir/" + _0xb22d17 + "$exe\"";
    _0xdfefdf = "\"%dp0%\\" + _0xdfefdf + "\"";
    _0x3f3c39 = "\"$basedir_win/" + _0x3f3c39 + "\"";
    _0x31793c = "\"$basedir/" + _0x31793c + "\"";
  }
  var _0x4b1118 = "@ECHO off\r\nGOTO start\r\n:find_dp0\r\nSET dp0=%~dp0\r\nEXIT /b\r\n:start\r\nSETLOCAL\r\nCALL :find_dp0\r\n";
  var _0x459d1a;
  if (_0x235439) {
    _0x588619 = _0x588619.trim();
    _0x459d1a = _0x4b1118 + convertToSetCommands(_0xd14a1c) + ("\r\nIF EXIST " + _0x235439 + " (\r\n  SET \"_prog=" + _0x235439.replace(/(^")|("$)/g, "") + "\"\r\n) ELSE (\r\n  SET \"_prog=" + _0xb22d17.replace(/(^")|("$)/g, "") + "\"\r\n)\r\n\r\nendLocal & goto #_undefined_# 2>NUL || title %COMSPEC% & set PATHEXT=%PATHEXT:;.JS;=;% & \"%_prog%\" " + _0x588619 + " " + _0xdfefdf + " %*\r\n");
  } else {
    _0x459d1a = "" + _0x4b1118 + _0xb22d17 + " " + _0x588619 + " " + _0xdfefdf + " %*\r\n";
  }
  var _0x2f55c9 = "#!/bin/sh\nbasedir=$(dirname \"$(echo \"$0\" | sed -e 's,\\\\,/,g')\")\nbasedir_win=\"$basedir\"\n\ncase `uname -a` in\n  *CYGWIN*|*MINGW*|*MSYS*)\n    if command -v cygpath > /dev/null 2>&1; then\n      basedir_win=`cygpath -w \"$basedir\"`\n    fi\n  ;;\n  *WSL2*)\n    if command -v wslpath > /dev/null 2>&1; then\n      basedir_win=\"$(wslpath -w \"$basedir\" 2> /dev/null)\"\n      if [ $? -ne 0 ] || [ -z \"$basedir_win\" ]; then\n        echo \"Error: wslpath failed to convert path. WSL environment may be misconfigured.\" >&2\n        exit 1\n      fi\n    fi\n  ;;\nesac\n\n";
  if (_0x29853d) {
    _0x2f55c9 = _0x2f55c9 + ("PROG_EXE=" + _0x29853d.replace(/"$/, ".exe\"") + "\nif ! [ -x \"$PROG_EXE\" ]; then\n  PROG_EXE=" + _0x29853d + "\n  if ! [ -x \"$PROG_EXE\" ]; then\n    PROG_EXE=" + _0x1f10bf + "\n    if ! [ -x \"$PROG_EXE\" ]; then\n      PROG_EXE=" + _0x1f10bf + ".exe\n    fi\n  fi\nfi\n\nexec " + _0xd14a1c + "\"$PROG_EXE\" " + _0x588619 + " " + _0x3f3c39 + " \"$@\"\n");
  } else {
    _0x2f55c9 = _0x2f55c9 + ("exec " + _0x1f10bf + " " + _0x588619 + " " + _0x3f3c39 + " \"$@\"\n");
  }
  var _0x221eb9 = "#!/usr/bin/env pwsh\n$basedir=Split-Path $MyInvocation.MyCommand.Definition -Parent\n\n$exe=\"\"\nif ($PSVersionTable.PSVersion -lt \"6.0\" -or $IsWindows) {\n  # Fix case when both the Windows and Linux builds of Node\n  # are installed in the same directory\n  $exe=\".exe\"\n}\n";
  if (_0x86a77) {
    _0x221eb9 = _0x221eb9 + ("$ret=0\nif (Test-Path " + _0x86a77 + ") {\n  # Support pipeline input\n  if ($MyInvocation.ExpectingInput) {\n    $input | & " + _0x86a77 + " " + _0x588619 + " " + _0x31793c + " $args\n  } else {\n    & " + _0x86a77 + " " + _0x588619 + " " + _0x31793c + " $args\n  }\n  $ret=$LASTEXITCODE\n} else {\n  # Support pipeline input\n  if ($MyInvocation.ExpectingInput) {\n    $input | & " + _0x4c0103 + " " + _0x588619 + " " + _0x31793c + " $args\n  } else {\n    & " + _0x4c0103 + " " + _0x588619 + " " + _0x31793c + " $args\n  }\n  $ret=$LASTEXITCODE\n}\nexit $ret\n");
  } else {
    _0x221eb9 = _0x221eb9 + ("# Support pipeline input\nif ($MyInvocation.ExpectingInput) {\n  $input | & " + _0x4c0103 + " " + _0x588619 + " " + _0x31793c + " $args\n} else {\n  & " + _0x4c0103 + " " + _0x588619 + " " + _0x31793c + " $args\n}\nexit $LASTEXITCODE\n");
  }
  return Promise.all([_promises.writeFile(_0x411a35 + ".ps1", _0x221eb9, "utf8"), _promises.writeFile(_0x411a35 + ".cmd", _0x459d1a, "utf8"), _promises.writeFile(_0x411a35, _0x2f55c9, "utf8")]).then(function () {
    return Promise.all([_promises.chmod(_0x411a35, 493), _promises.chmod(_0x411a35 + ".cmd", 493), _promises.chmod(_0x411a35 + ".ps1", 493)]);
  });
};
var _0x58edf1 = {
  recursive: true
};
var prepare = function prepare(_0x209d03, _0x3d0af4) {
  return _promises.mkdir(_path.dirname(_0x3d0af4), _0x58edf1).then(function () {
    return _promises.readFile(_0x209d03, "utf8");
  }).then(function (_0x532107) {
    var _0xb5302e = _0x532107.trim().split(/\r*\n/)[0];
    var _0x12dd14 = _0xb5302e.match(shebangExpr);
    if (!_0x12dd14) {
      return writeShim(_0x209d03, _0x3d0af4);
    }
    return writeShim(_0x209d03, _0x3d0af4, _0x12dd14[2], _0x12dd14[3] || "", _0x12dd14[1] || "");
  }, function () {
    return writeShim(_0x209d03, _0x3d0af4);
  });
};
var cmdShim = function cmdShim(_0x56e216, _0x456520) {
  return _promises.stat(_0x56e216).then(function () {
    return Promise.all([rm(_0x456520), rm(_0x456520 + ".cmd"), rm(_0x456520 + ".ps1")]);
  }).then(function () {
    return prepare(_0x56e216, _0x456520);
  });
};
var cmd_shim_default = cmdShim;
var nm_default = _path.default.join(process.cwd(), "node_modules");
var isWin = process.platform === "win32";
var link = function () {
  var _ref = _asyncToGenerator(_regeneratorRuntime().mark(function _callee(_0x3593c9, _0x304720) {
    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!isWin) {
              _context.next = 4;
              break;
            }
            _context.next = 3;
            return cmd_shim_default(_0x3593c9, _0x304720);
          case 3:
            return _context.abrupt("return");
          case 4:
            try {
              _fs.default.unlinkSync(_0x304720);
            } catch (_0x284e87) {
              null;
            }
            _fs.default.symlinkSync(_0x3593c9, _0x304720);
            _fs.default.chmodSync(_0x3593c9, "0755");
          case 7:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return function link(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();
var bin = function () {
  var _ref2 = _asyncToGenerator(_regeneratorRuntime().mark(function _callee2(_0x7af843, _0x15929d, _0x2e2c84) {
    var _0x147cd3;
    var _0x477184;
    var _i;
    var _Object$keys;
    var _0x4a8997;
    return _regeneratorRuntime().wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            if (_0x2e2c84 !== undefined) {
              _context2.next = 7;
              break;
            }
            _context2.t0 = JSON;
            _context2.next = 4;
            return _promises.readFile(_path.default.join(_0x15929d, "package_.json"));
          case 4:
            _context2.t1 = _context2.sent;
            _0x147cd3 = _context2.t0.parse.call(_context2.t0, _context2.t1);
            _0x2e2c84 = _0x147cd3.bin;
          case 7:
            if (_0x2e2c84) {
              _context2.next = 9;
              break;
            }
            return _context2.abrupt("return");
          case 9:
            _fs.default.mkdirSync(_path.default.join(nm_default, ".bin"), {
              recursive: true
            });
            if (typeof _0x2e2c84 !== "string") {
              _context2.next = 16;
              break;
            }
            if (_0x7af843.charAt(0) === "@") {
              _0x477184 = _0x7af843.split("/")[1];
            } else {
              _0x477184 = _0x7af843;
            }
            _context2.next = 14;
            return link(_path.default.join(_0x15929d, _0x2e2c84), _path.default.join(nm_default, ".bin", _0x477184));
          case 14:
            _context2.next = 25;
            break;
          case 16:
            if (_typeof(_0x2e2c84) !== "object") {
              _context2.next = 25;
              break;
            }
            _i = 0;
            _Object$keys = Object.keys(_0x2e2c84);
          case 18:
            if (!(_i < _Object$keys.length)) {
              _context2.next = 25;
              break;
            }
            _0x4a8997 = _Object$keys[_i];
            _context2.next = 22;
            return link(_path.default.join(_0x15929d, _0x2e2c84[_0x4a8997]), _path.default.join(nm_default, ".bin", _0x4a8997));
          case 22:
            _i++;
            _context2.next = 18;
            break;
          case 25:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return function bin(_x3, _x4, _x5) {
    return _ref2.apply(this, arguments);
  };
}();
var bin_default = exports.default = bin;