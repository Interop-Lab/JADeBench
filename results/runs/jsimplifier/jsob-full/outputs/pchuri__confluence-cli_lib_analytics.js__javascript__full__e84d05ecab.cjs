"use strict";

function _classCallCheck(a, n) {
  if (!(a instanceof n)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
function _defineProperties(e, r) {
  for (var t = 0; t < r.length; t++) {
    var o = r[t];
    o.enumerable = o.enumerable || false;
    o.configurable = true;
    if ("value" in o) {
      o.writable = true;
    }
    Object.defineProperty(e, _toPropertyKey(o.key), o);
  }
}
function _createClass(e, r, t) {
  if (r) {
    _defineProperties(e.prototype, r);
  }
  if (t) {
    _defineProperties(e, t);
  }
  Object.defineProperty(e, "prototype", {
    writable: false
  });
  return e;
}
function _toPropertyKey(t) {
  var i = _toPrimitive(t, "string");
  if (_typeof(i) == "symbol") {
    return i;
  } else {
    return i + "";
  }
}
function _toPrimitive(t, r) {
  if (_typeof(t) != "object" || !t) {
    return t;
  }
  var e = t[Symbol.toPrimitive];
  if (e !== undefined) {
    var i = e.call(t, r || "default");
    if (_typeof(i) != "object") {
      return i;
    }
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (r === "string" ? String : Number)(t);
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
function _toConsumableArray(r) {
  return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread();
}
function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _iterableToArray(r) {
  if (typeof Symbol != "undefined" && r[Symbol.iterator] != null || r["@@iterator"] != null) {
    return Array.from(r);
  }
}
function _arrayWithoutHoles(r) {
  if (Array.isArray(r)) {
    return _arrayLikeToArray(r);
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
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = function __commonJS(_0x183b41, _0xcee95a) {
  return function _0x1aefeb() {
    if (!_0xcee95a) {
      _0x183b41[__getOwnPropNames(_0x183b41)[0]]((_0xcee95a = {
        exports: {}
      }).exports, _0xcee95a);
    }
    return _0xcee95a.exports;
  };
};
var require_link_style = __commonJS({
  "../work/pchuri__confluence-cli/lib/link-style.js"(_0x1cfa3b, _0x27162e) {
    var _0x16179c = ["smart", "plain", "wiki"];
    function _0x5b3cae(_ref = {}) {
      var _ref$isCloud = _ref.isCloud;
      var isCloud = _ref$isCloud === undefined ? false : _ref$isCloud;
      var _ref$linkStyle = _ref.linkStyle;
      var linkStyle = _ref$linkStyle === undefined ? null : _ref$linkStyle;
      if (_0x16179c.includes(linkStyle)) {
        return linkStyle;
      }
      if (isCloud) {
        return "smart";
      } else {
        return "plain";
      }
    }
    var _0x573664 = {
      VALID_LINK_STYLES: _0x16179c,
      resolveLinkStyle: _0x5b3cae
    };
    _0x27162e.exports = _0x573664;
  }
});
var require_output = __commonJS({
  "../work/pchuri__confluence-cli/lib/output.js"(_0x2f79ef, _0x1df48d) {
    'use strict';

    var _0x5440ad = {
      lbVNy(_0x2848f7, _0x2293cd) {
        return _0x2848f7(_0x2293cd);
      },
      AAtLV: "--protocol must be \"http\" or \"https\"",
      jbSDs(_0x293b82, _0x234f5c) {
        return _0x293b82 === _0x234f5c;
      },
      WDapl: "jqbjZ",
      SeBHH: "Warning: \"--format json\" is deprecated and will be removed in a future major version. Use the global \"--json\" flag instead.",
      WJDrd: "OyAMw",
      alRli: "CrvZd",
      HvFPb(_0x163e1c, _0x342cf2) {
        return _0x163e1c === _0x342cf2;
      },
      wWGOp: "AUTH_FAILED",
      FADwC(_0x327eac, _0x4225ee) {
        return _0x327eac === _0x4225ee;
      },
      rpSRE: "NOT_FOUND",
      isvse(_0x55b96a, _0x31c923) {
        return _0x55b96a === _0x31c923;
      },
      aNewL: "number",
      QvKde(_0x3325f5, _0x7638ca) {
        return _0x3325f5 >= _0x7638ca;
      },
      BghuK: "API_ERROR",
      kHUvc: "NETWORK",
      jbZLQ(_0x46c6c9, _0x1ab4fa) {
        return _0x46c6c9 instanceof _0x1ab4fa;
      },
      jybst: "VALIDATION",
      xRubr: "UNKNOWN",
      OAXAd(_0x4696ca, _0x954546) {
        return _0x4696ca !== _0x954546;
      },
      mLlSs: "bmCVK",
      ETjrx(_0x2b700b, _0x4825bb) {
        return _0x2b700b in _0x4825bb;
      },
      fVXjy: "status",
      Pzxlt(_0x2cc3de, _0x498dd5) {
        return _0x2cc3de in _0x498dd5;
      },
      GBRlf: "details",
      nlDLC(_0x40d443, _0x22f7f5) {
        return _0x40d443(_0x22f7f5);
      },
      AdtDi(_0xe0c95, _0x4a7c07) {
        if (_0xe0c95 != null) {
          return _0xe0c95;
        } else {
          return _0x4a7c07;
        }
      },
      diPIR(_0x1321c8, _0x221ce8) {
        if (_0x1321c8 != null) {
          return _0x1321c8;
        } else {
          return _0x221ce8;
        }
      },
      iizrA(_0x58df39, _0x44a294) {
        return _0x58df39 === _0x44a294;
      },
      bVAtl: "win32",
      IsGzr: "_netrc",
      fMTGB: ".netrc",
      DISBa(_0x2661b4, _0x33468a, _0x36e6a9) {
        return _0x2661b4(_0x33468a, _0x36e6a9);
      },
      dSoBY: "--auth-type mtls",
      bzhBO(_0xbaa17e, _0x3cb642) {
        return _0xbaa17e(_0x3cb642);
      },
      dwiEE: "OnKKf",
      TRKWu: "pLyfi",
      hfqBy: "anQxJ",
      zwHRv(_0xfc67f0, _0x4b1c44) {
        return _0xfc67f0 === _0x4b1c44;
      },
      OxLSa: "string",
      kXkLn(_0x1dd8c3, _0xe969ef) {
        return _0x1dd8c3 === _0xe969ef;
      },
      JmzvN: "json",
      ceNRX: "REYUw",
      XNOFf: "hEAuH",
      jOZLj: "BlZuJ",
      FpzCf(_0x3939ab, _0x1a9c58) {
        return _0x3939ab(_0x1a9c58);
      },
      VeTmd: "chalk",
      PJicn: "ECONNREFUSED",
      yQGNo: "ENOTFOUND",
      YdlEj: "ETIMEDOUT",
      lHQcf: "ECONNRESET",
      LpbcU: "ECONNABORTED",
      KibIJ: "EAI_AGAIN",
      SmAWH: "EPIPE",
      UJWma: "EHOSTUNREACH",
      bsVJh: "ENETUNREACH"
    };
    var _0x4a9f64 = _0x5440ad.FpzCf(require, _0x5440ad.VeTmd);
    var _0x56581e = false;
    function _0x5f0cff(_0x4d2d59) {
      _0x56581e = _0x5440ad.lbVNy(Boolean, _0x4d2d59);
    }
    function _0x5c62ba() {
      return _0x56581e;
    }
    function _0x23de84(_0xd5b310) {
      if (_0x5440ad.jbSDs(_0x5440ad.WDapl, _0x5440ad.WDapl)) {
        console.log(JSON.stringify(_0xd5b310, null, 2));
      } else {
        _0x50dde6.push(_0x5440ad.AAtLV);
      }
    }
    var _0x1bf2b6 = new Set([_0x5440ad.PJicn, _0x5440ad.yQGNo, _0x5440ad.YdlEj, _0x5440ad.lHQcf, _0x5440ad.LpbcU, _0x5440ad.KibIJ, _0x5440ad.SmAWH, _0x5440ad.UJWma, _0x5440ad.bsVJh]);
    function _0x530361(_0x28c6aa) {
      var _0x17da00 = {
        OoGIv: _0x5440ad.SeBHH
      };
      var _0x570734 = _0x17da00;
      if (_0x5440ad.jbSDs(_0x5440ad.WJDrd, _0x5440ad.alRli)) {
        _0x12bbfd = true;
        _0x120dcf.error(_0x2f6285.yellow(_0x570734.OoGIv));
      } else {
        var _0x5c1cc1 = (_0x28c6aa != null ? undefined : _0x28c6aa.response) != null ? undefined : (_0x28c6aa != null ? undefined : _0x28c6aa.response).status;
        if (_0x5440ad.HvFPb(_0x5c1cc1, 401) || _0x5440ad.jbSDs(_0x5c1cc1, 403)) {
          return _0x5440ad.wWGOp;
        }
        if (_0x5440ad.FADwC(_0x5c1cc1, 404)) {
          return _0x5440ad.rpSRE;
        }
        if (_0x5440ad.isvse(_typeof(_0x5c1cc1), _0x5440ad.aNewL) && _0x5440ad.QvKde(_0x5c1cc1, 400)) {
          return _0x5440ad.BghuK;
        }
        if ((_0x28c6aa != null ? undefined : _0x28c6aa.code) && _0x1bf2b6.has(_0x28c6aa.code)) {
          return _0x5440ad.kHUvc;
        }
        if (_0x5440ad.jbZLQ(_0x28c6aa, Error)) {
          return _0x5440ad.jybst;
        }
        return _0x5440ad.xRubr;
      }
    }
    function _0x531bf7(_0x17127d, _0x5c9e9d = {}) {
      if (_0x5440ad.OAXAd(_0x5440ad.mLlSs, _0x5440ad.mLlSs)) {
        return undefined;
      } else {
        var _0x1ea6c8 = _0x5440ad.ETjrx(_0x5440ad.fVXjy, _0x5c9e9d) ? _0x5c9e9d.status : function () {
          var _temp65266 = (_0x17127d != null ? undefined : _0x17127d.response) != null ? undefined : (_0x17127d != null ? undefined : _0x17127d.response).status;
          if (_temp65266 != null) {
            return _temp65266;
          } else {
            return null;
          }
        }();
        var _0x2c1e7f = _0x5440ad.Pzxlt(_0x5440ad.GBRlf, _0x5c9e9d) ? _0x5c9e9d.details : function () {
          var _temp65475 = (_0x17127d != null ? undefined : _0x17127d.response) != null ? undefined : (_0x17127d != null ? undefined : _0x17127d.response).data;
          if (_temp65475 != null) {
            return _temp65475;
          } else {
            return null;
          }
        }();
        var _0x4b59fe = {
          error: function () {
            var _temp65618 = _0x5c9e9d.message ?? (_0x17127d != null ? undefined : _0x17127d.message);
            if (_temp65618 != null) {
              return _temp65618;
            } else {
              return _0x5440ad.lbVNy(String, _0x17127d);
            }
          }(),
          code: _0x5c9e9d.code ?? _0x5440ad.nlDLC(_0x530361, _0x17127d),
          status: _0x5440ad.AdtDi(_0x1ea6c8, null),
          details: _0x5440ad.diPIR(_0x2c1e7f, null)
        };
        console.error(JSON.stringify(_0x4b59fe, null, 2));
      }
    }
    var _0x22fc9f = false;
    function _0x219d8b(_0xd6b598, _0x21e13e = {}) {
      var _0x3683e4 = {
        FjFUa(_0x2140ae, _0x598aad, _0xd20afb) {
          return _0x5440ad.DISBa(_0x2140ae, _0x598aad, _0xd20afb);
        },
        omUOg: _0x5440ad.dSoBY,
        DJFsZ(_0x246d26, _0x54f3cb) {
          return _0x5440ad.bzhBO(_0x246d26, _0x54f3cb);
        }
      };
      if (_0x5440ad.OAXAd(_0x5440ad.dwiEE, _0x5440ad.TRKWu)) {
        if (_0xd6b598) {
          if (_0x5440ad.OAXAd(_0x5440ad.hfqBy, _0x5440ad.hfqBy)) {
            _0x3683e4.FjFUa(_0x5cf308, _0x1e6165.mtls, _0x3683e4.omUOg).forEach(function (_0x559422) {
              _0x36ac0e.push(_0x559422);
            });
            var _0x1eb269 = _0x3683e4.DJFsZ(_0x5cf10, _0x43d8b2.protocol);
            if (_0x1eb269) {
              _0x1a33d7.push(_0x1eb269);
            }
          } else {
            return true;
          }
        }
        var _0x42818c = _0x5440ad.zwHRv(_typeof(_0x21e13e.format), _0x5440ad.OxLSa) ? _0x21e13e.format.toLowerCase() : "";
        if (_0x5440ad.kXkLn(_0x42818c, _0x5440ad.JmzvN)) {
          if (_0x5440ad.OAXAd(_0x5440ad.ceNRX, _0x5440ad.ceNRX)) {
            if (_0x5bcf50.env.NETRC) {
              return _0x510086.env.NETRC;
            }
            var _0x261687 = _0x5440ad.iizrA(_0x5e0e24.platform, _0x5440ad.bVAtl) ? _0x5440ad.IsGzr : _0x5440ad.fMTGB;
            return _0x2dd480.join(_0x36eb90.homedir(), _0x261687);
          } else {
            if (!_0x22fc9f) {
              if (_0x5440ad.iizrA(_0x5440ad.XNOFf, _0x5440ad.jOZLj)) {
                _0x4799f3.mkdirSync(this.configDir, {
                  recursive: true
                });
              } else {
                _0x22fc9f = true;
                console.error(_0x4a9f64.yellow(_0x5440ad.SeBHH));
              }
            }
            return true;
          }
        }
        return false;
      } else {
        _0x4f7ed2.push(_0x4c3cca);
      }
    }
    var _0x3ac58d = {
      emitJson: _0x23de84,
      emitJsonError: _0x531bf7,
      classifyErrorCode: _0x530361,
      jsonRequested: _0x219d8b,
      setJsonMode: _0x5f0cff,
      isJsonMode: _0x5c62ba
    };
    _0x1df48d.exports = _0x3ac58d;
  }
});
var require_netrc = __commonJS({
  "../work/pchuri__confluence-cli/lib/netrc.js"(_0x38abec, _0x52dcf7) {
    var _0x5dadd6 = require("fs");
    var _0x4a3303 = require("path");
    var _0x2d28ec = require("os");
    var _0x508529 = require("chalk");
    var _require_output = require_output();
    var _0x4b6b9d = _require_output.isJsonMode;
    function _0x500ed7() {
      if (process.env.NETRC) {
        return process.env.NETRC;
      }
      var _0x373812 = process.platform === "win32" ? "_netrc" : ".netrc";
      return _0x4a3303.join(_0x2d28ec.homedir(), _0x373812);
    }
    function _0x4d91c3(_0x2f31fd) {
      var _0x5d8f67 = [];
      var _0xd5b27a = /"((?:[^"\\]|\\.)*)"|(\S+)/g;
      var _0x41229d;
      while ((_0x41229d = _0xd5b27a.exec(_0x2f31fd)) !== null) {
        _0x5d8f67.push(_0x41229d[1] !== undefined ? _0x41229d[1].replace(/\\(.)/g, "$1") : _0x41229d[2]);
      }
      return _0x5d8f67;
    }
    function _0x26df62(_0x182288) {
      var _0x6338ac = [];
      var _0x402a4b = null;
      var _0x5f5ae2 = false;
      var _iterator = _createForOfIteratorHelper(_0x182288.split("\n"));
      var _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var _0x571e11 = _step.value;
          if (_0x5f5ae2) {
            if (_0x571e11.trim() === "") {
              _0x5f5ae2 = false;
            }
            continue;
          }
          if (_0x571e11.trimStart().startsWith("#")) {
            continue;
          }
          var _0x1bf932 = _0x4d91c3(_0x571e11);
          for (var _0x29c838 = 0; _0x29c838 < _0x1bf932.length; _0x29c838++) {
            var _0x46ad41 = _0x1bf932[_0x29c838];
            switch (_0x46ad41) {
              case "machine":
                var _0x7d24dd = {
                  machine: _0x1bf932[++_0x29c838],
                  login: undefined,
                  password: undefined
                };
                _0x402a4b = _0x7d24dd;
                _0x6338ac.push(_0x402a4b);
                break;
              case "default":
                var _0x33894e = {
                  machine: null,
                  login: undefined,
                  password: undefined
                };
                _0x402a4b = _0x33894e;
                _0x6338ac.push(_0x402a4b);
                break;
              case "macdef":
                _0x5f5ae2 = true;
                _0x29c838 = _0x1bf932.length;
                break;
              case "login":
                if (_0x402a4b) {
                  _0x402a4b.login = _0x1bf932[++_0x29c838];
                }
                break;
              case "password":
                if (_0x402a4b) {
                  _0x402a4b.password = _0x1bf932[++_0x29c838];
                }
                break;
              default:
                _0x29c838++;
                break;
            }
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      return _0x6338ac;
    }
    function _0x365c54(_ref2 = {}) {
      var _0x1d4ea9 = _ref2.machine;
      var _0x1f09bd = _ref2.login;
      var _0x2a10f8 = (_0x1d4ea9 || "").trim().toLowerCase();
      if (!_0x2a10f8) {
        return null;
      }
      var _0x12ffa5 = _0x500ed7();
      var _0x16d781;
      try {
        _0x16d781 = _0x5dadd6.readFileSync(_0x12ffa5, "utf8");
      } catch (_0x4303e8) {
        if (_0x4303e8.code === "ENOENT") {
          return null;
        }
        if (!_0x4b6b9d()) {
          console.error(_0x508529.yellow("⚠ Failed to read netrc file at " + _0x12ffa5 + ": " + _0x4303e8.message));
        }
        return null;
      }
      var _0x297e0f = _0x26df62(_0x16d781);
      var _0x2b8f39 = _0x297e0f.find(function (_0x14621d) {
        return _0x14621d.machine && _0x14621d.machine.toLowerCase() === _0x2a10f8 && (_0x1f09bd == null || _0x14621d.login === _0x1f09bd);
      });
      if (!_0x2b8f39) {
        return null;
      }
      var _0x3e035a = {
        machine: _0x2b8f39.machine,
        login: _0x2b8f39.login,
        password: _0x2b8f39.password
      };
      return _0x3e035a;
    }
    var _0x213b6d = {
      getNetrcPath: _0x500ed7,
      parseNetrc: _0x26df62,
      lookupNetrc: _0x365c54
    };
    _0x52dcf7.exports = _0x213b6d;
  }
});
var require_config = __commonJS({
  "../work/pchuri__confluence-cli/lib/config.js"(_0xce7eb9, _0x596677) {
    var _0x5c358e = require("fs");
    var _0x497571 = require("path");
    var _0x5dcf04 = require("os");
    var _0x2eb0f9 = require("inquirer");
    var _0x410ce4 = require("chalk");
    var _0x529203 = "default";
    var _0x2449bf = null;
    function _0x141daf() {
      if (process.env.CONFLUENCE_CONFIG_DIR) {
        return process.env.CONFLUENCE_CONFIG_DIR;
      }
      var _0x284159 = _0x497571.join(_0x5dcf04.homedir(), ".confluence-cli");
      var _0x2a27f4 = process.env.XDG_CONFIG_HOME || _0x497571.join(_0x5dcf04.homedir(), ".config");
      var _0x1f4343 = _0x497571.join(_0x2a27f4, "confluence-cli");
      if (_0x5c358e.existsSync(_0x284159) && !_0x5c358e.existsSync(_0x1f4343)) {
        return _0x284159;
      }
      return _0x1f4343;
    }
    function _0x4fc197() {
      if (!_0x2449bf) {
        _0x2449bf = _0x141daf();
      }
      return _0x2449bf;
    }
    function _0xebc140() {
      return _0x497571.join(_0x4fc197(), "config.json");
    }
    var _0x1034d1 = _0x4fc197();
    var _0x57ae66 = _0xebc140();
    var _0x25c9b8 = [{
      name: "Basic (credentials)",
      value: "basic"
    }, {
      name: "Bearer token",
      value: "bearer"
    }, {
      name: "Client certificate (mTLS)",
      value: "mtls"
    }, {
      name: "Cookie (Enterprise SSO)",
      value: "cookie"
    }, {
      name: "None (auth injected by reverse proxy)",
      value: "none"
    }];
    var _0x3d6c35 = ["basic", "bearer", "mtls", "cookie", "none"];
    var _require_link_style = require_link_style();
    var _0x35fe41 = _require_link_style.VALID_LINK_STYLES;
    var _require_netrc = require_netrc();
    var _0x2a8c4a = _require_netrc.lookupNetrc;
    var _0x443327 = _require_netrc.getNetrcPath;
    var _require_output2 = require_output();
    var _0x23f5d2 = _require_output2.isJsonMode;
    var _0xf8625d = function _0xf8625d(_0x2ec277, _0x261f0c) {
      if (_0x2ec277 === undefined || _0x2ec277 === null || _0x2ec277 === "") {
        return undefined;
      }
      var _0x32e4f1 = String(_0x2ec277).trim().toLowerCase();
      if (_0x35fe41.includes(_0x32e4f1)) {
        return _0x32e4f1;
      }
      var _0x1aedde = _0x261f0c ? _0x261f0c + " " : "";
      if (!_0x23f5d2()) {
        console.error(_0x410ce4.yellow("⚠ Invalid linkStyle " + _0x1aedde + "\"" + _0x2ec277 + "\"; valid values: " + _0x35fe41.join(", ") + ". Falling back to auto-detection."));
      }
      return undefined;
    };
    var _0x3a23a7 = function _0x3a23a7(_0x184bf9) {
      return /^[a-zA-Z0-9_-]+$/.test(_0x184bf9);
    };
    var _0xd81e6c = function _0xd81e6c(_0x508f3f) {
      return function (_0xf8b333) {
        if (!_0xf8b333 || !_0xf8b333.trim()) {
          return _0x508f3f + " is required";
        }
        return true;
      };
    };
    var _0x363f0f = [{
      name: "HTTPS (recommended)",
      value: "https"
    }, {
      name: "HTTP",
      value: "http"
    }];
    var _0x6712aa = function _0x6712aa(_0x388c88) {
      var _0x274f57 = (_0x388c88 || "").trim().toLowerCase();
      if (_0x274f57 === "http" || _0x274f57 === "https") {
        return _0x274f57;
      }
      return "https";
    };
    var _0x2d944c = function _0x2d944c(_0x3137b9) {
      return (_0x3137b9 || "").trim().replace(/^https?:\/\//i, "").replace(/\/.*$/, "").toLowerCase();
    };
    var _0x169ce7 = function _0x169ce7(_0x46d6ff) {
      return (_0x46d6ff || "").trim().replace(/^https?:\/\//i, "").replace(/\/+$/, "");
    };
    var _0x170a1c = function _0x170a1c(_0x1c396c, _0x12bbac) {
      var _0x5626e5 = (_0x1c396c || "").trim().toLowerCase();
      if (_0x3d6c35.includes(_0x5626e5)) {
        return _0x5626e5;
      }
      if (_0x12bbac) {
        return "basic";
      } else {
        return "bearer";
      }
    };
    var _0x1ecc94 = function _0x1ecc94(_0x48ae1c) {
      if (typeof _0x48ae1c !== "string") {
        return undefined;
      }
      var _0x204c68 = _0x48ae1c.trim();
      return _0x204c68 || undefined;
    };
    var _0x1e49ab = function _0x1e49ab(_0x1fdb0f) {
      if (!_0x1fdb0f) {
        return undefined;
      }
      var _0x1dd30f = {
        caCert: _0x1ecc94(_0x1fdb0f.caCert),
        clientCert: _0x1ecc94(_0x1fdb0f.clientCert),
        clientKey: _0x1ecc94(_0x1fdb0f.clientKey)
      };
      if (!_0x1dd30f.caCert && !_0x1dd30f.clientCert && !_0x1dd30f.clientKey) {
        return undefined;
      }
      return _0x1dd30f;
    };
    var _0x274e00 = function _0x274e00(_0x571577, _0x5dbf79 = "mTLS") {
      var _0x37b96c = _0x1e49ab(_0x571577);
      if (!_0x37b96c) {
        return [_0x5dbf79 + " requires a client certificate and client key."];
      }
      var _0x38bbdc = [];
      if (!_0x37b96c.clientCert) {
        _0x38bbdc.push(_0x5dbf79 + " requires a client certificate.");
      } else if (!_0x5c358e.existsSync(_0x37b96c.clientCert)) {
        _0x38bbdc.push(_0x5dbf79 + " client certificate file not found: " + _0x37b96c.clientCert);
      }
      if (!_0x37b96c.clientKey) {
        _0x38bbdc.push(_0x5dbf79 + " requires a client key.");
      } else if (!_0x5c358e.existsSync(_0x37b96c.clientKey)) {
        _0x38bbdc.push(_0x5dbf79 + " client key file not found: " + _0x37b96c.clientKey);
      }
      if (_0x37b96c.caCert && !_0x5c358e.existsSync(_0x37b96c.caCert)) {
        _0x38bbdc.push(_0x5dbf79 + " CA certificate file not found: " + _0x37b96c.caCert);
      }
      return _0x38bbdc;
    };
    var _0x4dd745 = function _0x4dd745(_0x2023bc) {
      if (_0x6712aa(_0x2023bc) === "http") {
        return "mTLS authentication requires HTTPS and is not compatible with HTTP.";
      }
      return null;
    };
    var _0x4e77bb = function _0x4e77bb(_0x7d2a0a, _0x31b3cd) {
      var _0x21ec0d = [];
      if (_0x7d2a0a.authType === "none") {
        return _0x21ec0d;
      }
      if (_0x7d2a0a.authType === "basic" && !_0x7d2a0a.email) {
        _0x21ec0d.push("Basic authentication requires an email address or username.");
      }
      if (_0x7d2a0a.authType === "cookie" && !_0x7d2a0a.cookie) {
        _0x21ec0d.push("Cookie authentication requires a cookie value.");
      }
      if (_0x7d2a0a.authType !== "mtls" && _0x7d2a0a.authType !== "cookie" && !_0x7d2a0a.token) {
        _0x21ec0d.push("Bearer or basic authentication requires a token.");
      }
      if (_0x7d2a0a.authType === "mtls") {
        _0x21ec0d.push.apply(_0x21ec0d, _toConsumableArray(_0x274e00(_0x7d2a0a.mtls, _0x31b3cd)));
        var _0x9aae7b = _0x4dd745(_0x7d2a0a.protocol);
        if (_0x9aae7b) {
          _0x21ec0d.push(_0x9aae7b);
        }
      }
      return _0x21ec0d;
    };
    var _0x93f9be = function _0x93f9be(_0xec0144, _0x207bd4, _0x352b1d, _0x216fcb) {
      return {
        type: "input",
        name: _0xec0144,
        message: _0x207bd4,
        when: _0x216fcb || function (_0x28e426) {
          return _0x28e426.authType === "mtls";
        },
        validate(_0x23c660) {
          var _0x5dfb49 = (_0x23c660 || "").trim();
          if (!_0x5dfb49) {
            if (_0x352b1d) {
              return _0x207bd4.replace(/:$/, "") + " is required for mTLS.";
            } else {
              return true;
            }
          }
          if (!_0x5c358e.existsSync(_0x5dfb49)) {
            return "File not found: " + _0x5dfb49;
          }
          return true;
        }
      };
    };
    var _0x558320 = function _0x558320(_0x575307) {
      var _0x11d82d = _0x2d944c(_0x575307);
      if (_0x11d82d.endsWith(".atlassian.net")) {
        return "/wiki/rest/api";
      }
      return "/rest/api";
    };
    var _0x2c97aa = function _0x2c97aa(_0x4344e2, _0x379b7d) {
      var _0x1b5544 = (_0x4344e2 || "").trim();
      if (!_0x1b5544) {
        return _0x558320(_0x379b7d);
      }
      if (!_0x1b5544.startsWith("/")) {
        throw new Error("Confluence API path must start with \"/\".");
      }
      var _0x1d3284 = _0x1b5544.replace(/\/+$/, "");
      return _0x1d3284 || _0x558320(_0x379b7d);
    };
    function _0x39eea1(_ref3 = {}) {
      var _ref3$throwOnError = _ref3.throwOnError;
      var throwOnError = _ref3$throwOnError === undefined ? false : _ref3$throwOnError;
      if (!_0x5c358e.existsSync(_0x57ae66)) {
        return null;
      }
      try {
        var _0x455a05 = JSON.parse(_0x5c358e.readFileSync(_0x57ae66, "utf8"));
        if (_0x455a05.domain && !_0x455a05.profiles) {
          var _0x9139a = {
            domain: _0x455a05.domain,
            protocol: _0x455a05.protocol,
            apiPath: _0x455a05.apiPath,
            token: _0x455a05.token,
            authType: _0x455a05.authType
          };
          var _0x2e1c32 = _0x9139a;
          var _0x1f6ed3 = _0x1e49ab(_0x455a05.mtls);
          if (_0x1f6ed3) {
            _0x2e1c32.mtls = _0x1f6ed3;
          }
          if (_0x455a05.email) {
            _0x2e1c32.email = _0x455a05.email;
          }
          if (_0x455a05.cookie) {
            _0x2e1c32.cookie = _0x455a05.cookie;
          }
          var _0x20e0e8 = {
            activeProfile: _0x529203,
            profiles: {}
          };
          _0x20e0e8.profiles[_0x529203] = _0x2e1c32;
          return _0x20e0e8;
        }
        return _0x455a05;
      } catch (_0x109a8d) {
        if (throwOnError) {
          throw _0x109a8d;
        }
        console.error(_0x410ce4.yellow("⚠ Failed to parse config file at " + _0x57ae66 + ": " + _0x109a8d.message));
        console.error(_0x410ce4.yellow("  Run \"confluence init\" to recreate it."));
        return null;
      }
    }
    function _0x443254(_0x4f38d1) {
      if (!_0x5c358e.existsSync(_0x1034d1)) {
        _0x5c358e.mkdirSync(_0x1034d1, {
          recursive: true,
          mode: 448
        });
      } else {
        _0x5c358e.chmodSync(_0x1034d1, 448);
      }
      _0x5c358e.writeFileSync(_0x57ae66, JSON.stringify(_0x4f38d1, null, 2), {
        mode: 384
      });
      _0x5c358e.chmodSync(_0x57ae66, 384);
    }
    var _0x4c50cd = function _0x4c50cd(_0x560bdc) {
      var _0x2b08df = [];
      if (_0x560bdc.domain && (typeof _0x560bdc.domain !== "string" || !_0x560bdc.domain.trim())) {
        _0x2b08df.push("--domain cannot be empty");
      }
      if (_0x560bdc.token !== undefined && (typeof _0x560bdc.token !== "string" || !_0x560bdc.token.trim())) {
        _0x2b08df.push("--token cannot be empty");
      }
      if (_0x560bdc.email && (typeof _0x560bdc.email !== "string" || !_0x560bdc.email.trim())) {
        _0x2b08df.push("--email cannot be empty");
      }
      if (_0x560bdc.apiPath) {
        if (typeof _0x560bdc.apiPath !== "string" || !_0x560bdc.apiPath.startsWith("/")) {
          _0x2b08df.push("--api-path must start with \"/\"");
        } else {
          try {
            _0x2c97aa(_0x560bdc.apiPath, _0x560bdc.domain || "example.com");
          } catch (_0x41351e) {
            _0x2b08df.push("--api-path is invalid: " + _0x41351e.message);
          }
        }
      }
      if (_0x560bdc.protocol && (typeof _0x560bdc.protocol !== "string" || !["http", "https"].includes(_0x560bdc.protocol.toLowerCase()))) {
        _0x2b08df.push("--protocol must be \"http\" or \"https\"");
      }
      if (_0x560bdc.authType && (typeof _0x560bdc.authType !== "string" || !_0x3d6c35.includes(_0x560bdc.authType.toLowerCase()))) {
        _0x2b08df.push("--auth-type must be \"basic\", \"bearer\", \"mtls\", \"cookie\", or \"none\"");
      }
      var _0x529bd0 = typeof _0x560bdc.authType === "string" && _0x560bdc.authType ? _0x170a1c(_0x560bdc.authType, Boolean(_0x560bdc.email)) : null;
      if (_0x529bd0 === "basic" && !_0x560bdc.email) {
        _0x2b08df.push("--email is required when using basic authentication (use your username for on-premise)");
      }
      if (_0x529bd0 === "mtls") {
        _0x274e00(_0x560bdc.mtls, "--auth-type mtls").forEach(function (_0x1b6029) {
          _0x2b08df.push(_0x1b6029);
        });
        var _0x50aa28 = _0x4dd745(_0x560bdc.protocol);
        if (_0x50aa28) {
          _0x2b08df.push(_0x50aa28);
        }
      }
      if (_0x529bd0 === "cookie" && _0x560bdc.cookie !== undefined && (typeof _0x560bdc.cookie !== "string" || !_0x560bdc.cookie.trim())) {
        _0x2b08df.push("--cookie cannot be empty when using cookie authentication");
      }
      return _0x2b08df;
    };
    var _0x1bed37 = function _0x1bed37(_0x10ccde, _0xb236a4) {
      var _0xe715a2 = {
        domain: _0x169ce7(_0x10ccde.domain),
        protocol: _0x6712aa(_0x10ccde.protocol),
        apiPath: _0x2c97aa(_0x10ccde.apiPath, _0x10ccde.domain),
        authType: _0x10ccde.authType
      };
      if (_0x10ccde.token) {
        _0xe715a2.token = _0x10ccde.token.trim();
      }
      if (_0x10ccde.authType === "basic" && _0x10ccde.email) {
        _0xe715a2.email = _0x10ccde.email.trim();
      }
      if (_0x10ccde.authType === "cookie" && _0x10ccde.cookie) {
        _0xe715a2.cookie = _0x10ccde.cookie.trim();
      }
      var _0x5cbcc0 = _0x1e49ab(_0x10ccde.mtls);
      if (_0x5cbcc0) {
        _0xe715a2.mtls = _0x5cbcc0;
      }
      if (_0x10ccde.readOnly) {
        _0xe715a2.readOnly = true;
      }
      var _0x513d32 = {
        activeProfile: _0x529203,
        profiles: {}
      };
      var _0xd1bb87 = _0x39eea1() || _0x513d32;
      if (!_0xd1bb87.profiles || _typeof(_0xd1bb87.profiles) !== "object") {
        _0xd1bb87.profiles = {};
      }
      var _0x1cacff = _0xb236a4 || _0xd1bb87.activeProfile || _0x529203;
      _0xd1bb87.profiles[_0x1cacff] = _0xe715a2;
      if (!_0xd1bb87.activeProfile || !_0xd1bb87.profiles[_0xd1bb87.activeProfile]) {
        _0xd1bb87.activeProfile = _0x1cacff;
      }
      _0x443254(_0xd1bb87);
      console.log(_0x410ce4.green("✅ Configuration saved successfully!"));
      if (_0xb236a4) {
        console.log("Profile: " + _0x410ce4.cyan(_0x1cacff));
      }
      console.log("Config file location: " + _0x410ce4.gray(_0x57ae66));
      console.log(_0x410ce4.yellow("\n💡 Tip: You can regenerate this config anytime by running \"confluence init\""));
    };
    var _0x4b11e0 = function () {
      var _ref4 = _asyncToGenerator(_regeneratorRuntime().mark(function _callee(_0x3c2a6d) {
        var _0x1e14c8;
        var _0xd9cbae;
        var _0x184b63;
        var _0x50b36f;
        var _0x22c59b;
        var _0xcb3a11;
        var _0x5e154d;
        var _0x2049be;
        return _regeneratorRuntime().wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _0x1e14c8 = [];
                if (!_0x3c2a6d.protocol) {
                  _0xd9cbae = {
                    type: "list",
                    name: "protocol",
                    message: "Protocol:",
                    choices: _0x363f0f,
                    default: "https"
                  };
                  _0x1e14c8.push(_0xd9cbae);
                }
                if (!_0x3c2a6d.domain) {
                  _0x1e14c8.push({
                    type: "input",
                    name: "domain",
                    message: "Confluence domain (e.g., yourcompany.atlassian.net):",
                    validate: _0xd81e6c("Domain")
                  });
                }
                if (!_0x3c2a6d.apiPath) {
                  _0x1e14c8.push({
                    type: "input",
                    name: "apiPath",
                    message: "REST API path (Cloud: /wiki/rest/api, Server: /rest/api):",
                    default(_0x579531) {
                      return _0x558320(_0x3c2a6d.domain || _0x579531.domain);
                    },
                    validate(_0x6a3a, _0x41ff0f) {
                      var _0x1d0905 = (_0x6a3a || "").trim();
                      if (!_0x1d0905) {
                        return true;
                      }
                      if (!_0x1d0905.startsWith("/")) {
                        return "API path must start with \"/\"";
                      }
                      try {
                        var _0x10ced7 = _0x3c2a6d.domain || _0x41ff0f.domain;
                        _0x2c97aa(_0x1d0905, _0x10ced7);
                        return true;
                      } catch (_0x225a3d) {
                        return _0x225a3d.message;
                      }
                    }
                  });
                }
                _0x184b63 = Boolean(_0x3c2a6d.email);
                if (!_0x3c2a6d.authType) {
                  _0x50b36f = {
                    type: "list",
                    name: "authType",
                    message: "Authentication method:",
                    choices: _0x25c9b8,
                    default: _0x184b63 ? "basic" : "bearer"
                  };
                  _0x1e14c8.push(_0x50b36f);
                }
                if (!_0x3c2a6d.email) {
                  _0x1e14c8.push({
                    type: "input",
                    name: "email",
                    message: "Email / username:",
                    when(_0x17d994) {
                      var _0x3b1021 = _0x3c2a6d.authType || _0x17d994.authType;
                      return _0x3b1021 === "basic";
                    },
                    validate: _0xd81e6c("Email / username")
                  });
                }
                if (!_0x3c2a6d.token) {
                  _0x1e14c8.push({
                    type: "password",
                    name: "token",
                    message: "API token / password (optional, can be left blank):",
                    when(_0x48753f) {
                      var _0x24a681 = _0x3c2a6d.authType || _0x48753f.authType;
                      return _0x24a681 !== "mtls" && _0x24a681 !== "cookie" && _0x24a681 !== "none";
                    }
                  });
                }
                if (!_0x3c2a6d.cookie) {
                  _0x1e14c8.push({
                    type: "password",
                    name: "cookie",
                    message: "Cookie (format: \"name=value\" or \"name=value; name2=value2\"):",
                    when(_0x4c4ba6) {
                      var _0x54a702 = _0x3c2a6d.authType || _0x4c4ba6.authType;
                      return _0x54a702 === "cookie";
                    },
                    validate: _0xd81e6c("Cookie")
                  });
                }
                _0x22c59b = _0x1e49ab(_0x3c2a6d.mtls);
                _0xcb3a11 = function _0xcb3a11(_0x5c7572) {
                  var _0x2bd794 = _0x3c2a6d.authType || _0x5c7572.authType;
                  return _0x2bd794 === "mtls";
                };
                if (!_0x22c59b || !_0x22c59b.clientCert) {
                  _0x1e14c8.push(_0x93f9be("tlsClientCert", "Path to client certificate file (PEM):", true, _0xcb3a11));
                }
                if (!_0x22c59b || !_0x22c59b.clientKey) {
                  _0x1e14c8.push(_0x93f9be("tlsClientKey", "Path to client key file (PEM):", true, _0xcb3a11));
                }
                if (!_0x22c59b || !_0x22c59b.caCert) {
                  _0x1e14c8.push(_0x93f9be("tlsCaCert", "Path to CA certificate file (PEM, optional):", false, _0xcb3a11));
                }
                if (_0x1e14c8.length !== 0) {
                  _context.next = 16;
                  break;
                }
                return _context.abrupt("return", _0x3c2a6d);
              case 16:
                _context.next = 18;
                return _0x2eb0f9.prompt(_0x1e14c8);
              case 18:
                _0x5e154d = _context.sent;
                _0x2049be = Object.assign({}, _0x3c2a6d, _0x5e154d);
                return _context.abrupt("return", _0x2049be);
              case 21:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));
      return function _0x4b11e0(_x) {
        return _ref4.apply(this, arguments);
      };
    }();
    var _0xbf8985 = function _0xbf8985(_0x31719e, _0x4b8a1b, _0x2cd820) {
      if (_0x31719e !== "basic" && _0x31719e !== "bearer") {
        var _0x59f044 = {
          token: undefined,
          attempted: false
        };
        return _0x59f044;
      }
      var _0x7e0199 = _0x2d944c(_0x4b8a1b);
      if (!_0x7e0199) {
        var _0x1e7af1 = {
          token: undefined,
          attempted: false
        };
        return _0x1e7af1;
      }
      var _0x1103b6 = _0x31719e === "basic" ? _0x2cd820 : undefined;
      var _0x27b6db = {
        machine: _0x7e0199,
        login: _0x1103b6
      };
      var _0x2bc2b3 = _0x2a8c4a(_0x27b6db);
      var _0x165d10 = {
        token: _0x2bc2b3 ? _0x2bc2b3.password : undefined,
        attempted: true
      };
      return _0x165d10;
    };
    function _0x427deb() {
      return _0x427deb2.apply(this, arguments);
    }
    function _0x427deb2() {
      _0x427deb2 = _asyncToGenerator(_regeneratorRuntime().mark(function _callee2() {
        var _0x450509;
        var _0x20407c;
        var _0x58305d;
        var _0x2f3364;
        var _0x5fc344;
        var _0x3cae10;
        var _0x5b22ca;
        var _0x281c70;
        var _0x134e6b;
        var _0xdd15d4;
        var _0x5366b8;
        var _0x1b9284;
        var _0x5bcac7;
        var _0x2036b1;
        var _0x2f7f52;
        var _0x4c8657;
        var _0x1d18a3;
        var _0x4d41ed;
        var _args2 = arguments;
        return _regeneratorRuntime().wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (_args2.length > 0 && _args2[0] !== undefined) {
                  _0x450509 = _args2[0];
                } else {
                  _0x450509 = {};
                }
                _0x20407c = _0x450509.profile;
                if (_0x20407c && !_0x3a23a7(_0x20407c)) {
                  console.error(_0x410ce4.red("❌ Invalid profile name. Use only letters, numbers, hyphens, and underscores."));
                  process.exit(1);
                }
                _0x58305d = _0x450509.readOnly || false;
                _0x2f3364 = {
                  protocol: _0x450509.protocol,
                  domain: _0x450509.domain,
                  apiPath: _0x450509.apiPath,
                  authType: typeof _0x450509.authType === "string" && _0x450509.authType ? _0x450509.authType.trim().toLowerCase() : _0x450509.authType,
                  email: _0x450509.email,
                  token: _0x450509.token,
                  cookie: _0x450509.cookie,
                  mtls: _0x450509.mtls || {
                    caCert: _0x450509.tlsCaCert,
                    clientCert: _0x450509.tlsClientCert,
                    clientKey: _0x450509.tlsClientKey
                  }
                };
                _0x5fc344 = Object.values(_0x2f3364).some(function (_0xdcf033) {
                  return _0xdcf033;
                });
                if (_0x5fc344) {
                  _context2.next = 20;
                  break;
                }
                console.log(_0x410ce4.blue("🚀 Confluence CLI Configuration"));
                if (_0x20407c) {
                  console.log("Profile: " + _0x410ce4.cyan(_0x20407c));
                }
                console.log("Please provide your Confluence connection details:\n");
                _0x3cae10 = {
                  type: "list",
                  name: "protocol",
                  message: "Protocol:",
                  choices: _0x363f0f,
                  default: "https"
                };
                _context2.next = 13;
                return _0x2eb0f9.prompt([_0x3cae10, {
                  type: "input",
                  name: "domain",
                  message: "Confluence domain (e.g., yourcompany.atlassian.net):",
                  validate: _0xd81e6c("Domain")
                }, {
                  type: "input",
                  name: "apiPath",
                  message: "REST API path (Cloud: /wiki/rest/api, Server: /rest/api):",
                  default(_0x1a20fc) {
                    return _0x558320(_0x1a20fc.domain);
                  },
                  validate(_0x1e7a5e, _0x50fe38) {
                    var _0xc8cef5 = (_0x1e7a5e || "").trim();
                    if (!_0xc8cef5) {
                      return true;
                    }
                    if (!_0xc8cef5.startsWith("/")) {
                      return "API path must start with \"/\"";
                    }
                    try {
                      _0x2c97aa(_0xc8cef5, _0x50fe38.domain);
                      return true;
                    } catch (_0x1c85b5) {
                      return _0x1c85b5.message;
                    }
                  }
                }, {
                  type: "list",
                  name: "authType",
                  message: "Authentication method:",
                  choices: _0x25c9b8,
                  default: "basic"
                }, {
                  type: "input",
                  name: "email",
                  message: "Email / username:",
                  when(_0x497913) {
                    return _0x497913.authType === "basic";
                  },
                  validate: _0xd81e6c("Email / username")
                }, {
                  type: "password",
                  name: "token",
                  message: "API token / password (optional, can be left blank):",
                  when(_0xb69709) {
                    return _0xb69709.authType !== "mtls" && _0xb69709.authType !== "cookie" && _0xb69709.authType !== "none";
                  }
                }, {
                  type: "password",
                  name: "cookie",
                  message: "Cookie (format: \"name=value\" or \"name=value; name2=value2\"):",
                  when(_0xbd5e73) {
                    return _0xbd5e73.authType === "cookie";
                  },
                  validate: _0xd81e6c("Cookie")
                }, _0x93f9be("tlsClientCert", "Path to client certificate file (PEM):", true), _0x93f9be("tlsClientKey", "Path to client key file (PEM):", true), _0x93f9be("tlsCaCert", "Path to CA certificate file (PEM, optional):", false)]);
              case 13:
                _0x5b22ca = _context2.sent;
                _0x281c70 = Object.assign({}, _0x5b22ca);
                _0x281c70.readOnly = _0x58305d;
                _0x134e6b = _0x281c70;
                if (_0x5b22ca.authType === "mtls") {
                  _0xdd15d4 = {
                    clientCert: _0x5b22ca.tlsClientCert,
                    clientKey: _0x5b22ca.tlsClientKey,
                    caCert: _0x5b22ca.tlsCaCert || undefined
                  };
                  _0x134e6b.mtls = _0xdd15d4;
                }
                _0x1bed37(_0x134e6b, _0x20407c);
                return _context2.abrupt("return");
              case 20:
                _0x5366b8 = _0x4c50cd(_0x2f3364);
                if (_0x5366b8.length > 0) {
                  console.error(_0x410ce4.red("❌ Configuration Error:"));
                  _0x5366b8.forEach(function (_0x280924) {
                    console.error(_0x410ce4.red("  • " + _0x280924));
                  });
                  process.exit(1);
                }
                _0x1b9284 = Boolean(_0x2f3364.domain && (_0x2f3364.authType === "mtls" || _0x2f3364.authType === "none" || _0x2f3364.authType === "cookie" && _0x2f3364.cookie || _0x2f3364.token && (_0x2f3364.authType || _0x2f3364.email)));
                if (!_0x1b9284) {
                  _context2.next = 26;
                  break;
                }
                try {
                  _0x5bcac7 = _0x2f3364.authType;
                  if (!_0x5bcac7) {
                    if (_0x2f3364.email) {
                      _0x5bcac7 = "basic";
                    } else {
                      _0x5bcac7 = "bearer";
                    }
                  }
                  _0x2036b1 = _0x170a1c(_0x5bcac7, Boolean(_0x2f3364.email));
                  _0x2f7f52 = _0x2f3364.domain.trim();
                  if (_0x2036b1 === "basic" && !_0x2f3364.email) {
                    console.error(_0x410ce4.red("❌ Email is required for basic authentication"));
                    process.exit(1);
                  }
                  if (_0x2036b1 !== "mtls" && _0x2036b1 !== "cookie" && _0x2036b1 !== "none" && !_0x2f3364.token) {
                    console.error(_0x410ce4.red("❌ Token is required for basic or bearer authentication"));
                    process.exit(1);
                  }
                  if (_0x2036b1 === "cookie" && !_0x2f3364.cookie) {
                    console.error(_0x410ce4.red("❌ Cookie is required for cookie authentication"));
                    process.exit(1);
                  }
                  if (_0x2f3364.apiPath) {
                    _0x2c97aa(_0x2f3364.apiPath, _0x2f7f52);
                  }
                  _0x4c8657 = {
                    domain: _0x2f7f52,
                    protocol: _0x6712aa(_0x2f3364.protocol),
                    apiPath: _0x2f3364.apiPath || _0x558320(_0x2f7f52),
                    token: _0x2f3364.token,
                    authType: _0x2036b1,
                    email: _0x2f3364.email,
                    cookie: _0x2f3364.cookie,
                    mtls: _0x2f3364.mtls,
                    readOnly: _0x58305d
                  };
                  _0x1bed37(_0x4c8657, _0x20407c);
                } catch (_0x42e1fe) {
                  console.error(_0x410ce4.red("❌ " + _0x42e1fe.message));
                  process.exit(1);
                }
                return _context2.abrupt("return");
              case 26:
                _context2.prev = 26;
                console.log(_0x410ce4.blue("🚀 Confluence CLI Configuration"));
                if (_0x20407c) {
                  console.log("Profile: " + _0x410ce4.cyan(_0x20407c));
                }
                console.log("Completing configuration with interactive prompts:\n");
                _context2.next = 32;
                return _0x4b11e0(_0x2f3364);
              case 32:
                _0x1d18a3 = _context2.sent;
                _0x1d18a3.authType = _0x170a1c(_0x1d18a3.authType, Boolean(_0x1d18a3.email));
                if (_0x1d18a3.authType === "mtls") {
                  _0x1d18a3.mtls = _0x1e49ab({
                    clientCert: _0x1d18a3.tlsClientCert || _0x1d18a3.mtls && _0x1d18a3.mtls.clientCert,
                    clientKey: _0x1d18a3.tlsClientKey || _0x1d18a3.mtls && _0x1d18a3.mtls.clientKey,
                    caCert: _0x1d18a3.tlsCaCert || _0x1d18a3.mtls && _0x1d18a3.mtls.caCert
                  });
                }
                _0x4d41ed = Object.assign({}, _0x1d18a3);
                _0x4d41ed.readOnly = _0x58305d;
                _0x1bed37(_0x4d41ed, _0x20407c);
                _context2.next = 44;
                break;
              case 40:
                _context2.prev = 40;
                _context2.t0 = _context2.catch(26);
                console.error(_0x410ce4.red("❌ " + _context2.t0.message));
                process.exit(1);
              case 44:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, null, [[26, 40]]);
      }));
      return _0x427deb2.apply(this, arguments);
    }
    function _0x4ddc6f(_0x2515c3, _ref5 = {}) {
      var _ref5$throwOnError = _ref5.throwOnError;
      var throwOnError = _ref5$throwOnError === undefined ? false : _ref5$throwOnError;
      var _0x5825f0 = process.env.CONFLUENCE_DOMAIN || process.env.CONFLUENCE_HOST;
      var _0x2f4577 = process.env.CONFLUENCE_API_TOKEN || process.env.CONFLUENCE_PASSWORD;
      var _0x186b4b = process.env.CONFLUENCE_EMAIL || process.env.CONFLUENCE_USERNAME;
      var _0xbf56a7 = process.env.CONFLUENCE_AUTH_TYPE ? process.env.CONFLUENCE_AUTH_TYPE.trim().toLowerCase() : undefined;
      var _0x241eca = process.env.CONFLUENCE_API_PATH;
      var _0x63dd9f = process.env.CONFLUENCE_PROTOCOL;
      var _0x3cdaca = process.env.CONFLUENCE_READ_ONLY;
      var _0x16d77 = process.env.CONFLUENCE_FORCE_CLOUD;
      var _0x3db1fc = _0xf8625d(process.env.CONFLUENCE_LINK_STYLE, "from CONFLUENCE_LINK_STYLE");
      var _0x3bfd35 = process.env.CONFLUENCE_COOKIE;
      var _0x4fa369 = {
        caCert: process.env.CONFLUENCE_TLS_CA_CERT,
        clientCert: process.env.CONFLUENCE_TLS_CLIENT_CERT,
        clientKey: process.env.CONFLUENCE_TLS_CLIENT_KEY
      };
      var _0x14166e = _0x1e49ab(_0x4fa369);
      var _0x1f270d = _0x2f4577 || _0xbf56a7 === "mtls" || _0x14166e || _0xbf56a7 === "cookie" || _0x3bfd35 || _0xbf56a7 === "none";
      if (_0x5825f0 && _0x1f270d) {
        var _0x281f6e = _0xbf56a7 || (_0x14166e && !_0x2f4577 ? "mtls" : undefined) || (_0x3bfd35 && !_0x2f4577 ? "cookie" : undefined);
        var _0x30920b = _0x170a1c(_0x281f6e, Boolean(_0x186b4b));
        var _0x194524;
        try {
          _0x194524 = _0x2c97aa(_0x241eca, _0x5825f0);
        } catch (_0x5e471d) {
          if (throwOnError) {
            throw _0x5e471d;
          }
          console.error(_0x410ce4.red("❌ " + _0x5e471d.message));
          process.exit(1);
        }
        var _0x41cd9f = {
          authType: _0x30920b,
          token: _0x2f4577,
          email: _0x186b4b,
          cookie: _0x3bfd35,
          mtls: _0x14166e,
          protocol: _0x63dd9f
        };
        var _0x4feb4f = _0x4e77bb(_0x41cd9f, "CONFLUENCE_AUTH_TYPE=mtls");
        if (_0x4feb4f.length > 0) {
          if (throwOnError) {
            throw new Error(_0x4feb4f.join(" "));
          }
          console.error(_0x410ce4.red("❌ " + _0x4feb4f.join(" ")));
          if (_0x30920b === "basic" && !_0x186b4b) {
            console.log(_0x410ce4.yellow("Set CONFLUENCE_EMAIL (or CONFLUENCE_USERNAME for on-premise) or switch to bearer auth by setting CONFLUENCE_AUTH_TYPE=bearer."));
          }
          if (_0x30920b === "mtls" && !_0x14166e) {
            console.log(_0x410ce4.yellow("Set CONFLUENCE_TLS_CLIENT_CERT and CONFLUENCE_TLS_CLIENT_KEY. Optionally set CONFLUENCE_TLS_CA_CERT."));
          }
          if (_0x30920b === "cookie" && !_0x3bfd35) {
            console.log(_0x410ce4.yellow("Set CONFLUENCE_COOKIE with your session cookie (e.g., \"JSESSIONID=...\")."));
          }
          process.exit(1);
        }
        return {
          domain: _0x169ce7(_0x5825f0),
          protocol: _0x6712aa(_0x63dd9f),
          apiPath: _0x194524,
          token: _0x2f4577 ? _0x2f4577.trim() : undefined,
          email: _0x186b4b ? _0x186b4b.trim() : undefined,
          cookie: _0x3bfd35 ? _0x3bfd35.trim() : undefined,
          authType: _0x30920b,
          mtls: _0x14166e,
          readOnly: _0x3cdaca === "true",
          forceCloud: _0x16d77 === "true",
          linkStyle: _0x3db1fc
        };
      }
      var _0x4b549e = _0x2515c3 || process.env.CONFLUENCE_PROFILE || null;
      var _0x1b7728 = {
        throwOnError: throwOnError
      };
      var _0x108d92 = _0x39eea1(_0x1b7728);
      if (!_0x108d92) {
        if (throwOnError) {
          throw new Error("No configuration found!");
        }
        console.error(_0x410ce4.red("❌ No configuration found!"));
        console.log(_0x410ce4.yellow("Please run \"confluence init\" to set up your configuration."));
        console.log(_0x410ce4.gray("Or set environment variables: CONFLUENCE_DOMAIN, CONFLUENCE_API_TOKEN (or CONFLUENCE_PASSWORD), CONFLUENCE_EMAIL (or CONFLUENCE_USERNAME), and optionally CONFLUENCE_API_PATH, CONFLUENCE_PROTOCOL."));
        process.exit(1);
      }
      var _0x4d30db = _0x4b549e || _0x108d92.activeProfile || _0x529203;
      var _0x4b90b = _0x108d92.profiles && _0x108d92.profiles[_0x4d30db];
      if (!_0x4b90b) {
        if (throwOnError) {
          throw new Error("Profile \"" + _0x4d30db + "\" not found!");
        }
        console.error(_0x410ce4.red("❌ Profile \"" + _0x4d30db + "\" not found!"));
        var _0x311e08 = _0x108d92.profiles ? Object.keys(_0x108d92.profiles) : [];
        if (_0x311e08.length > 0) {
          console.log(_0x410ce4.yellow("Available profiles: " + _0x311e08.join(", ")));
        }
        console.log(_0x410ce4.yellow("Run \"confluence init --profile <name>\" to create it, or \"confluence profile list\" to see available profiles."));
        process.exit(1);
      }
      try {
        var _0xd03112 = _0x169ce7(_0x4b90b.domain);
        var _0x3471e8 = _0x1ecc94(_0x4b90b.token);
        var _0xf62342 = _0x4b90b.email ? _0x4b90b.email.trim() : undefined;
        var _0x550240 = _0x1ecc94(_0x4b90b.cookie);
        var _0x1e8e77 = _0x170a1c(_0x4b90b.authType, Boolean(_0xf62342));
        var _0x3c094a = _0x1e49ab(_0x4b90b.mtls);
        var _0x843580;
        if (!_0xd03112) {
          if (throwOnError) {
            throw new Error("Configuration file is missing required values.");
          }
          console.error(_0x410ce4.red("❌ Configuration file is missing required values."));
          console.log(_0x410ce4.yellow("Run \"confluence init\" to refresh your settings."));
          process.exit(1);
        }
        var _0x584ca8 = false;
        if (!_0x3471e8) {
          var _0x485528 = _0xbf8985(_0x1e8e77, _0xd03112, _0xf62342);
          _0x3471e8 = _0x485528.token;
          _0x584ca8 = _0x485528.attempted;
        }
        var _0x49b0a5 = {
          authType: _0x1e8e77,
          token: _0x3471e8,
          email: _0xf62342,
          cookie: _0x550240,
          mtls: _0x3c094a,
          protocol: _0x4b90b.protocol
        };
        var _0x54636b = _0x4e77bb(_0x49b0a5, "mTLS authentication");
        if (_0x54636b.length > 0) {
          if (throwOnError) {
            throw new Error(_0x54636b.join(" "));
          }
          console.error(_0x410ce4.red("❌ " + _0x54636b.join(" ")));
          if (_0x584ca8 && !_0x3471e8) {
            console.log(_0x410ce4.yellow("No profile token found, and no matching " + _0x443327() + " entry for machine \"" + _0x2d944c(_0xd03112) + "\"."));
          }
          console.log(_0x410ce4.yellow("Please rerun \"confluence init\" to refresh your settings."));
          process.exit(1);
        }
        try {
          _0x843580 = _0x2c97aa(_0x4b90b.apiPath, _0xd03112);
        } catch (_0x21eb8a) {
          if (throwOnError) {
            throw _0x21eb8a;
          }
          console.error(_0x410ce4.red("❌ " + _0x21eb8a.message));
          console.log(_0x410ce4.yellow("Please rerun \"confluence init\" to update your API path."));
          process.exit(1);
        }
        var _0xdd1893 = _0x3cdaca !== undefined ? _0x3cdaca === "true" : Boolean(_0x4b90b.readOnly);
        var _0x59cb05 = _0x16d77 !== undefined ? _0x16d77 === "true" : Boolean(_0x4b90b.forceCloud);
        var _0x12d49e = _0x3db1fc ?? _0xf8625d(_0x4b90b.linkStyle, "in profile \"" + _0x4d30db + "\"");
        return {
          domain: _0xd03112,
          protocol: _0x6712aa(_0x4b90b.protocol),
          apiPath: _0x843580,
          token: _0x3471e8,
          email: _0xf62342,
          cookie: _0x550240,
          authType: _0x1e8e77,
          mtls: _0x3c094a,
          readOnly: _0xdd1893,
          forceCloud: _0x59cb05,
          linkStyle: _0x12d49e
        };
      } catch (_0x56412d) {
        if (throwOnError) {
          throw _0x56412d;
        }
        console.error(_0x410ce4.red("❌ Error reading configuration file:"), _0x56412d.message);
        console.log(_0x410ce4.yellow("Please run \"confluence init\" to recreate your configuration."));
        process.exit(1);
      }
    }
    function _0x399f81() {
      var _0x32d4c5 = _0x39eea1();
      if (!_0x32d4c5 || !_0x32d4c5.profiles || Object.keys(_0x32d4c5.profiles).length === 0) {
        return {
          activeProfile: null,
          profiles: []
        };
      }
      return {
        activeProfile: _0x32d4c5.activeProfile,
        profiles: Object.keys(_0x32d4c5.profiles).map(function (_0x188db1) {
          return {
            name: _0x188db1,
            active: _0x188db1 === _0x32d4c5.activeProfile,
            domain: _0x32d4c5.profiles[_0x188db1].domain,
            readOnly: Boolean(_0x32d4c5.profiles[_0x188db1].readOnly)
          };
        })
      };
    }
    function _0x55c560(_0x3f586f) {
      var _0x2811c3 = _0x39eea1();
      if (!_0x2811c3) {
        throw new Error("No configuration file found. Run \"confluence init\" first.");
      }
      if (!_0x2811c3.profiles || !_0x2811c3.profiles[_0x3f586f]) {
        var _0x510f93 = _0x2811c3.profiles ? Object.keys(_0x2811c3.profiles) : [];
        throw new Error("Profile \"" + _0x3f586f + "\" not found. Available: " + _0x510f93.join(", "));
      }
      _0x2811c3.activeProfile = _0x3f586f;
      _0x443254(_0x2811c3);
    }
    function _0x84e649(_0x50d067) {
      var _0x2c94e6 = _0x39eea1();
      if (!_0x2c94e6) {
        throw new Error("No configuration file found. Run \"confluence init\" first.");
      }
      if (!_0x2c94e6.profiles || !_0x2c94e6.profiles[_0x50d067]) {
        throw new Error("Profile \"" + _0x50d067 + "\" not found.");
      }
      if (Object.keys(_0x2c94e6.profiles).length === 1) {
        throw new Error("Cannot delete the only remaining profile.");
      }
      if (_0x2c94e6.activeProfile === _0x50d067) {
        _0x2c94e6.activeProfile = Object.keys(_0x2c94e6.profiles)[0];
      }
      _0x443254(_0x2c94e6);
    }
    function _0x480c63() {
      _0x2449bf = null;
    }
    var _0x2be93b = {
      initConfig: _0x427deb,
      getConfig: _0x4ddc6f,
      listProfiles: _0x399f81,
      setActiveProfile: _0x55c560,
      deleteProfile: _0x84e649,
      isValidProfileName: _0x3a23a7,
      getConfigDir: _0x4fc197,
      getConfigFile: _0xebc140,
      _resetConfigDirCache: _0x480c63,
      CONFIG_DIR: _0x1034d1,
      CONFIG_FILE: _0x57ae66,
      DEFAULT_PROFILE: _0x529203
    };
    _0x596677.exports = _0x2be93b;
  }
});
var path = require("path");
var fs = require("fs");
var _require_config = require_config();
var getConfigDir = _require_config.getConfigDir;
var Analytics = function () {
  function Analytics() {
    _classCallCheck(this, Analytics);
    this.enabled = process.env.CONFLUENCE_CLI_ANALYTICS !== "false";
    this.configDir = getConfigDir();
    this.statsFile = path.join(this.configDir, "stats.json");
  }
  return _createClass(Analytics, [{
    key: "track",
    value(_0x21e04c, _0x22c345 = true) {
      if (!this.enabled) {
        return;
      }
      try {
        var _0x25eca2 = {};
        if (fs.existsSync(this.statsFile)) {
          _0x25eca2 = JSON.parse(fs.readFileSync(this.statsFile, "utf8"));
        }
        if (!_0x25eca2.commands) {
          _0x25eca2.commands = {};
        }
        if (!_0x25eca2.firstUsed) {
          _0x25eca2.firstUsed = new Date().toISOString();
        }
        _0x25eca2.lastUsed = new Date().toISOString();
        var _0x19e596 = _0x21e04c + "_" + (_0x22c345 ? "success" : "error");
        _0x25eca2.commands[_0x19e596] = (_0x25eca2.commands[_0x19e596] || 0) + 1;
        if (!fs.existsSync(this.configDir)) {
          fs.mkdirSync(this.configDir, {
            recursive: true
          });
        }
        fs.writeFileSync(this.statsFile, JSON.stringify(_0x25eca2, null, 2));
      } catch (_0xbbe2ec) {
        null;
      }
    }
  }, {
    key: "getStats",
    value() {
      if (!fs.existsSync(this.statsFile)) {
        return null;
      }
      try {
        return JSON.parse(fs.readFileSync(this.statsFile, "utf8"));
      } catch (_0x569bc6) {
        return null;
      }
    }
  }, {
    key: "showStats",
    value() {
      var _0xe681f2 = this.getStats();
      if (!_0xe681f2) {
        console.log("No usage statistics available.");
        return;
      }
      console.log("📊 Usage Statistics:");
      console.log("First used: " + new Date(_0xe681f2.firstUsed).toLocaleDateString());
      console.log("Last used: " + new Date(_0xe681f2.lastUsed).toLocaleDateString());
      console.log("\nCommand usage:");
      Object.entries(_0xe681f2.commands).forEach(function (item) {
        var _0x515a45 = item[0];
        var _0x41ba35 = item[1];
      });
    }
  }]);
}();
module.exports = Analytics;