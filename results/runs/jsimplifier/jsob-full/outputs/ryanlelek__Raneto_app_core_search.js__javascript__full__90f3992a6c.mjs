"use strict";

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
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;
var _nodePath = _interopRequireDefault(require("node:path"));
var _fsExtra = _interopRequireDefault(require("fs-extra"));
var _snakeCase = _interopRequireDefault(require("lodash/snakeCase.js"));
var _kebabCase = _interopRequireDefault(require("lodash/kebabCase.js"));
var _startCase = _interopRequireDefault(require("lodash/startCase.js"));
var _trim = _interopRequireDefault(require("lodash/trim.js"));
var _jsYaml = _interopRequireDefault(require("js-yaml"));
var _moment = _interopRequireDefault(require("moment"));
var _sanitizeHtml = _interopRequireDefault(require("sanitize-html"));
var _unescape = _interopRequireDefault(require("lodash/unescape.js"));
var _marked = require("marked");
var _lunr = _interopRequireDefault(require("lunr"));
var _lunrStemmerSupport = _interopRequireDefault(require("lunr-languages/lunr.stemmer.support.js"));
var _lunrMulti = _interopRequireDefault(require("lunr-languages/lunr.multi.js"));
var _tinyseg = _interopRequireDefault(require("lunr-languages/tinyseg.js"));
var _lunrDa = _interopRequireDefault(require("lunr-languages/lunr.da.js"));
var _lunrDe = _interopRequireDefault(require("lunr-languages/lunr.de.js"));
var _lunrEs = _interopRequireDefault(require("lunr-languages/lunr.es.js"));
var _lunrFi = _interopRequireDefault(require("lunr-languages/lunr.fi.js"));
var _lunrFr = _interopRequireDefault(require("lunr-languages/lunr.fr.js"));
var _lunrHu = _interopRequireDefault(require("lunr-languages/lunr.hu.js"));
var _lunrJa = _interopRequireDefault(require("lunr-languages/lunr.ja.js"));
var _lunrNo = _interopRequireDefault(require("lunr-languages/lunr.no.js"));
var _lunrPt = _interopRequireDefault(require("lunr-languages/lunr.pt.js"));
var _lunrRo = _interopRequireDefault(require("lunr-languages/lunr.ro.js"));
var _lunrRu = _interopRequireDefault(require("lunr-languages/lunr.ru.js"));
var _lunrSv = _interopRequireDefault(require("lunr-languages/lunr.sv.js"));
var _lunrTr = _interopRequireDefault(require("lunr-languages/lunr.tr.js"));
var _glob = require("glob");
var _templateObject;
function _interopRequireDefault(e) {
  if (e && e.__esModule) {
    return e;
  } else {
    return {
      default: e
    };
  }
}
function _taggedTemplateLiteral(e, t) {
  if (!t) {
    t = e.slice(0);
  }
  return Object.freeze(Object.defineProperties(e, {
    raw: {
      value: Object.freeze(t)
    }
  }));
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
var META_REGEX = /^\uFEFF?\/\*([\s\S]*?)\*\//i;
var META_REGEX_YAML = /^\uFEFF?---([\s\S]*?)---/i;
function cleanString(_0x68f73b, _0x3b7b23 = false) {
  _0x68f73b = _0x68f73b.replaceAll("/", " ").trim();
  if (_0x3b7b23) {
    return _snakeCase.default(_0x68f73b);
  }
  return _trim.default(_kebabCase.default(_0x68f73b), "-");
}
function cleanObjectStrings(_0x1c709f) {
  var _0x4cd6f5 = {};
  for (var _0x28b3ff in _0x1c709f) {
    if (Object.hasOwn(_0x1c709f, _0x28b3ff)) {
      _0x4cd6f5[cleanString(_0x28b3ff, true)] = ("" + _0x1c709f[_0x28b3ff]).trim();
    }
  }
  return _0x4cd6f5;
}
function slugToTitle(_0x5c868c) {
  _0x5c868c = _0x5c868c.replaceAll(".md", "").trim();
  return _startCase.default(_nodePath.default.basename(_0x5c868c).replaceAll(/[-_]/g, " "));
}
function stripMeta(_0x4a4706) {
  if (META_REGEX.test(_0x4a4706)) {
    return _0x4a4706.replace(META_REGEX, "").trim();
  }
  if (META_REGEX_YAML.test(_0x4a4706)) {
    return _0x4a4706.replace(META_REGEX_YAML, "").trim();
  }
  return _0x4a4706.trim();
}
function processMeta(_0x48d718) {
  if (META_REGEX.test(_0x48d718)) {
    var _0xb38ce7 = {};
    var _0x865ead = _0x48d718.match(META_REGEX);
    var _0x602deb = function () {
      var _temp10406 = ((_0x865ead != null ? undefined : _0x865ead[1]) != null ? undefined : (_0x865ead != null ? undefined : _0x865ead[1]).trim) != null ? undefined : ((_0x865ead != null ? undefined : _0x865ead[1]) != null ? undefined : (_0x865ead != null ? undefined : _0x865ead[1]).trim)();
      if (_temp10406 != null) {
        return _temp10406;
      } else {
        return "";
      }
    }();
    if (_0x602deb) {
      var _0x5daaf7 = _0x602deb.split("\n");
      var _iterator = _createForOfIteratorHelper(_0x5daaf7);
      var _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var _0x21c43a = _step.value;
          var _0x40ccb6 = _0x21c43a.indexOf(": ");
          if (_0x40ccb6 <= 0) {
            continue;
          }
          var _0x43381a = _0x21c43a.substring(0, _0x40ccb6).trim();
          var _0x824945 = _0x21c43a.substring(_0x40ccb6 + 2).trim();
          if (_0x43381a && _0x824945) {
            _0xb38ce7[cleanString(_0x43381a, true)] = _0x824945;
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }
    return _0xb38ce7;
  }
  if (META_REGEX_YAML.test(_0x48d718)) {
    var _0x3fe0d9 = _0x48d718.match(META_REGEX_YAML);
    var _0x34b9b3 = function () {
      var _temp13869 = ((_0x3fe0d9 != null ? undefined : _0x3fe0d9[1]) != null ? undefined : (_0x3fe0d9 != null ? undefined : _0x3fe0d9[1]).trim) != null ? undefined : ((_0x3fe0d9 != null ? undefined : _0x3fe0d9[1]) != null ? undefined : (_0x3fe0d9 != null ? undefined : _0x3fe0d9[1]).trim)();
      if (_temp13869 != null) {
        return _temp13869;
      } else {
        return "";
      }
    }();
    var _0x236fad = _jsYaml.default.load(_0x34b9b3);
    return cleanObjectStrings(_0x236fad);
  }
  return {};
}
function processVars(_0x583430, _0x89c688) {
  if (_0x89c688.variables && Array.isArray(_0x89c688.variables)) {
    _0x89c688.variables.forEach(function (_0x1303aa) {
      _0x583430 = _0x583430.replaceAll(new RegExp("%" + _0x1303aa.name + "%", "g"), _0x1303aa.content);
    });
  }
  if (_0x89c688.base_url !== undefined) {
    _0x583430 = _0x583430.replaceAll("%base_url%", _0x89c688.base_url);
  }
  if (_0x89c688.image_url !== undefined) {
    _0x583430 = _0x583430.replaceAll("%image_url%", _0x89c688.image_url);
  }
  return _0x583430;
}
function extractDocument(_x, _x2, _x3) {
  return _extractDocument.apply(this, arguments);
}
function _extractDocument() {
  _extractDocument = _asyncToGenerator(_regeneratorRuntime().mark(function _callee(_0x24ea11, _0x465232, _0x116b63) {
    var _0x1841e0;
    var _0x3d1223;
    var _0x2fed36;
    var _0xbc314a;
    var _0x1a13c4;
    var _0x1a2afb;
    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            _context.next = 3;
            return _fsExtra.default.readFile(_0x465232, "utf8");
          case 3:
            _0x1841e0 = _context.sent;
            _0x3d1223 = processMeta(_0x1841e0);
            _0x2fed36 = _0x465232.replaceAll(_0x24ea11, "").trim();
            if (_0x3d1223.title) {
              _0xbc314a = _0x3d1223.title;
            } else {
              _0xbc314a = slugToTitle(_0x2fed36);
            }
            _0x1a13c4 = _0x1841e0;
            _0x1a2afb = {
              id: _0x2fed36,
              title: _0xbc314a,
              body: _0x1a13c4
            };
            return _context.abrupt("return", _0x1a2afb);
          case 12:
            _context.prev = 12;
            _context.t0 = _context.catch(0);
            if (_0x116b63) {
              console.log(_context.t0);
            }
            return _context.abrupt("return", null);
          case 16:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[0, 12]]);
  }));
  return _extractDocument.apply(this, arguments);
}
var _0xd619b8 = {
  cleanString: cleanString,
  cleanObjectStrings: cleanObjectStrings,
  extractDocument: extractDocument,
  slugToTitle: slugToTitle,
  stripMeta: stripMeta,
  processMeta: processMeta,
  processVars: processVars
};
var contentProcessors_default = _0xd619b8;
var normalizeDir = function normalizeDir(_0x2a1bbf) {
  return _0x2a1bbf.replaceAll("\\", "/");
};
var getSlug = function getSlug(_0x21be1c, _0x1401d8) {
  return normalizeDir(_0x21be1c).replaceAll(normalizeDir(_0x1401d8), "").trim();
};
function getLastModified(_x4, _x5, _x6) {
  return _getLastModified.apply(this, arguments);
}
function _getLastModified() {
  _getLastModified = _asyncToGenerator(_regeneratorRuntime().mark(function _callee2(_0x91c608, _0x565a7f, _0x333f01) {
    var _0x5081e0;
    var _0x31aa7f;
    var _0x47e0a3;
    var _0x4bff53;
    var _0x4fc90d;
    var _yield$_0x1645db$lsta;
    var _0x5d1409;
    return _regeneratorRuntime().wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            if (_0x565a7f.modified === undefined) {
              _context2.next = 2;
              break;
            }
            return _context2.abrupt("return", _moment.default(_0x565a7f.modified).format(_0x91c608.datetime_format));
          case 2:
            _0x5081e0 = _nodePath.default.resolve(_0x91c608.content_dir);
            _0x31aa7f = [_0x5081e0];
            if (_0x91c608.theme_dir) {
              _0x31aa7f.push(_nodePath.default.resolve(_0x91c608.theme_dir));
            }
            _0x47e0a3 = function _0x47e0a3(_0x252d91) {
              return _0x31aa7f.some(function (_0x17aa2a) {
                return _0x252d91.startsWith(_0x17aa2a + _nodePath.default.sep) || _0x252d91 === _0x17aa2a;
              });
            };
            _0x4bff53 = _nodePath.default.resolve(_0x333f01);
            if (_0x47e0a3(_0x4bff53)) {
              _context2.next = 9;
              break;
            }
            throw new Error("Access denied: file path is outside allowed directories");
          case 9:
            _context2.next = 11;
            return _fsExtra.default.realpath(_0x4bff53);
          case 11:
            _0x4fc90d = _context2.sent;
            if (_0x47e0a3(_0x4fc90d)) {
              _context2.next = 14;
              break;
            }
            throw new Error("Access denied: file path is outside allowed directories");
          case 14:
            _context2.next = 16;
            return _fsExtra.default.lstat(_0x4fc90d);
          case 16:
            _yield$_0x1645db$lsta = _context2.sent;
            _0x5d1409 = _yield$_0x1645db$lsta.mtime;
            return _context2.abrupt("return", _moment.default(_0x5d1409).format(_0x91c608.datetime_format));
          case 19:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _getLastModified.apply(this, arguments);
}
var _0x226c3d = {
  normalizeDir: normalizeDir,
  getLastModified: getLastModified,
  getSlug: getSlug
};
var utils_default = _0x226c3d;
var allowedTags = _sanitizeHtml.default.defaults.allowedTags.concat(["img", "input", "del"]);
var _0x368d84 = Object.assign({}, _sanitizeHtml.default.defaults.allowedAttributes);
_0x368d84.img = ["src", "srcset", "alt", "title", "width", "height", "loading"];
_0x368d84.input = ["type", "checked", "disabled"];
_0x368d84.h1 = ["id"];
_0x368d84.h2 = ["id"];
_0x368d84.h3 = ["id"];
_0x368d84.h4 = ["id"];
_0x368d84.h5 = ["id"];
_0x368d84.h6 = ["id"];
_0x368d84.span = ["class"];
_0x368d84.code = ["class"];
_0x368d84.pre = ["class"];
var allowedAttributes = _0x368d84;
function sanitizeHtmlOutput(_0x15952d) {
  var _0x553d1b = {
    allowedTags: allowedTags,
    allowedAttributes: allowedAttributes
  };
  return _sanitizeHtml.default(_0x15952d, _0x553d1b);
}
var sanitizeHtmlOutput_default = sanitizeHtmlOutput;
function handler(_x7, _x8) {
  return _handler.apply(this, arguments);
}
function _handler() {
  _handler = _asyncToGenerator(_regeneratorRuntime().mark(function _callee3(_0x1cb85a, _0x156e7c) {
    var _0x4a3efe;
    var _0xb43766;
    var _0x10b62f;
    var _0x1bdc4b;
    var _0x2eaf18;
    var _0x3abc69;
    var _0xba641a;
    var _0x1545fd;
    var _0x3a793f;
    var _0x4a78c4;
    var _0x1aba3e;
    return _regeneratorRuntime().wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _0x4a3efe = utils_default.normalizeDir(_nodePath.default.normalize(_0x156e7c.content_dir));
            _context3.prev = 1;
            _context3.next = 4;
            return _fsExtra.default.readFile(_0x1cb85a, "utf8");
          case 4:
            _0xb43766 = _context3.sent;
            _0x10b62f = utils_default.getSlug(_0x1cb85a, _0x4a3efe);
            if (_0x10b62f.includes("index.md")) {
              _0x10b62f = _0x10b62f.replaceAll("index.md", "");
            }
            _0x10b62f = _0x10b62f.replaceAll(".md", "").trim();
            _0x1bdc4b = contentProcessors_default.processMeta(_0xb43766);
            _0x2eaf18 = contentProcessors_default.processVars(contentProcessors_default.stripMeta(_0xb43766), _0x156e7c);
            _0x3abc69 = sanitizeHtmlOutput_default(_marked.marked(_0x2eaf18));
            if (_0x1bdc4b.title) {
              _0xba641a = _0x1bdc4b.title;
            } else {
              _0xba641a = contentProcessors_default.slugToTitle(_0x10b62f);
            }
            _0x1545fd = _unescape.default(_sanitizeHtml.default(_0x3abc69, {
              allowedTags: [],
              allowedAttributes: {}
            }));
            _0x3a793f = _0x156e7c.excerpt_length || 400;
            if (_0x1545fd.length > _0x3a793f) {
              _0x4a78c4 = _0x1545fd.slice(0, _0x3a793f).trimEnd().replace(/\s\S+$/, "") + "...";
            } else {
              _0x4a78c4 = _0x1545fd;
            }
            _0x1aba3e = {
              slug: _0x10b62f,
              title: _0xba641a,
              body: _0x3abc69,
              excerpt: _0x4a78c4
            };
            return _context3.abrupt("return", _0x1aba3e);
          case 19:
            _context3.prev = 19;
            _context3.t0 = _context3.catch(1);
            if (_0x156e7c.debug) {
              console.log(_context3.t0);
            }
            return _context3.abrupt("return", null);
          case 23:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, null, [[1, 19]]);
  }));
  return _handler.apply(this, arguments);
}
var page_default = handler;
var _0x5cbe1a = {
  da: _lunrDa.default,
  de: _lunrDe.default,
  es: _lunrEs.default,
  fi: _lunrFi.default,
  fr: _lunrFr.default,
  hu: _lunrHu.default,
  ja: _lunrJa.default,
  no: _lunrNo.default,
  pt: _lunrPt.default,
  ro: _lunrRo.default,
  ru: _lunrRu.default,
  sv: _lunrSv.default,
  tr: _lunrTr.default
};
var languageLoaders = _0x5cbe1a;
var instance = null;
var stemmers = null;
function getLunr(_0x275ea5) {
  if (instance === null) {
    instance = _lunr.default;
    _lunrStemmerSupport.default(instance);
    _lunrMulti.default(instance);
    _tinyseg.default(instance);
    _0x275ea5.searchExtraLanguages.forEach(function (_0x430a69) {
      if (languageLoaders[_0x430a69]) {
        languageLoaders[_0x430a69](instance);
      }
    });
  }
  return instance;
}
function getStemmers(_0x101d70) {
  if (stemmers === null) {
    var _getLunr;
    var _0x22e193 = ["en"].concat(_0x101d70.searchExtraLanguages);
    stemmers = (_getLunr = getLunr(_0x101d70)).multiLanguage.apply(_getLunr, _toConsumableArray(_0x22e193));
  }
  return stemmers;
}
var _0x30fee5 = {
  getLunr: getLunr,
  getStemmers: getStemmers
};
var lunr_default = _0x30fee5;
function handler2(_x9, _x0) {
  return _handler2.apply(this, arguments);
}
function _handler2() {
  _handler2 = _asyncToGenerator(_regeneratorRuntime().mark(function _callee4(_0x2550a3, _0x18cd9b) {
    var _0x144dd0;
    var _0x28441f;
    var _0x2dfe4c;
    var _0x59dd12;
    var _0x5887d2;
    var _0x30b150;
    var _0x205e74;
    var _0x3de4d0;
    var _0x41ab36;
    var _0x575ccb;
    var _0x826e4;
    var _0x3b301c;
    return _regeneratorRuntime().wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _0x144dd0 = utils_default.normalizeDir(_nodePath.default.normalize(_0x18cd9b.content_dir));
            _context4.next = 3;
            return _glob.glob(_nodePath.default.join(_0x144dd0, "**", "*.md"));
          case 3:
            _0x28441f = _context4.sent;
            _context4.next = 6;
            return Promise.all(_0x28441f.map(function (_0x575b6b) {
              return contentProcessors_default.extractDocument(_0x144dd0, _0x575b6b, _0x18cd9b.debug);
            }));
          case 6:
            _0x2dfe4c = _context4.sent;
            _0x59dd12 = _0x2dfe4c.filter(function (_0x5295e5) {
              return _0x5295e5 !== null;
            });
            _0x5887d2 = lunr_default.getLunr(_0x18cd9b);
            _0x30b150 = _0x5887d2(function () {
              var _this = this;
              this.use(lunr_default.getStemmers(_0x18cd9b));
              this.field("title", {
                boost: 10
              });
              this.field("body");
              this.ref("id");
              _0x59dd12.forEach(function (_0x473eee) {
                return _this.add(_0x473eee);
              }, this);
            });
            _0x205e74 = _0x2550a3.replaceAll(/[~*+\-^:]/g, " ").replaceAll(/\s+/g, " ").trim();
            if (_0x205e74) {
              _context4.next = 13;
              break;
            }
            return _context4.abrupt("return", []);
          case 13:
            _0x3de4d0 = _0x30b150.search(_0x205e74);
            if (_0x3de4d0.length === 0 && _0x205e74.includes(" ")) {
              _0x41ab36 = _0x205e74.split(/\s+/).join(" OR ");
              _0x3de4d0 = _0x30b150.search(_0x41ab36);
            }
            if (_0x3de4d0.length === 0 && _0x205e74.length > 2) {
              _0x3de4d0 = _0x30b150.search(_0x205e74 + "~1");
            }
            if (_0x3de4d0.length === 0) {
              _0x3de4d0 = _0x30b150.search(_0x205e74 + "*");
            }
            if (_0x3de4d0.length === 0) {
              _0x575ccb = _0x205e74.split(/\s+/).filter(function (_0xcde79f) {
                return _0xcde79f.length > 2;
              });
              _0x826e4 = _0x575ccb.map(function (_0x508472) {
                return _0x508472 + "~1";
              }).join(" OR ");
              if (_0x826e4) {
                _0x3de4d0 = _0x30b150.search(_0x826e4);
              }
            }
            _context4.next = 20;
            return Promise.all(_0x3de4d0.map(function (_0x3a86a9) {
              return processSearchResult(_0x144dd0, _0x18cd9b, _0x2550a3, _0x3a86a9);
            }));
          case 20:
            _0x3b301c = _context4.sent;
            return _context4.abrupt("return", _0x3b301c.filter(function (_0x9df7c4) {
              return _0x9df7c4 !== null;
            }));
          case 22:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));
  return _handler2.apply(this, arguments);
}
function processSearchResult(_x1, _x10, _x11, _x12) {
  return _processSearchResult.apply(this, arguments);
}
function _processSearchResult() {
  _processSearchResult = _asyncToGenerator(_regeneratorRuntime().mark(function _callee5(_0x16bae5, _0x3743fa, _0x2fa267, _0x1ddfaf) {
    var _0x419a64;
    var _0x3d5b53;
    var _0xc17f27;
    var _0x409a5d;
    return _regeneratorRuntime().wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _0x419a64 = _nodePath.default.join(_0x16bae5, _0x1ddfaf.ref);
            _context5.next = 3;
            return page_default(_0x419a64, _0x3743fa);
          case 3:
            _0x3d5b53 = _context5.sent;
            if (_0x3d5b53) {
              _context5.next = 6;
              break;
            }
            return _context5.abrupt("return", null);
          case 6:
            _0xc17f27 = _0x3d5b53.slug.split("/");
            if (_0xc17f27.length > 1) {
              _0x3d5b53.category = _0xc17f27[0];
            } else {
              _0x3d5b53.category = null;
            }
            if (_0x3d5b53.excerpt) {
              _0x409a5d = _0x2fa267.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw(_templateObject ||= _taggedTemplateLiteral(["$&"], ["\\$&"])));
              _0x3d5b53.excerpt = _0x3d5b53.excerpt.replaceAll(new RegExp("(" + _0x409a5d + ")", "gim"), "<span class=\"search-query\">$1</span>");
            }
            return _context5.abrupt("return", _0x3d5b53);
          case 10:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5);
  }));
  return _processSearchResult.apply(this, arguments);
}
var search_default = exports.default = handler2;