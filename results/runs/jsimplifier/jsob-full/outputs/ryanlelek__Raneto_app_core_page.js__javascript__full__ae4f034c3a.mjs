'use strict';
function _typeof(o)
    /*Scope Closed:false | writes:false*/
    {
        '@babel/helpers - typeof';
        if (typeof Symbol == 'function' && typeof Symbol.iterator == 'symbol') {
            var _typeof_new = function _typeof(o)
                /* Called:undefined | Scope Closed:true*/
                {
                    return typeof o;
                };
        } else {
            var _typeof_new = function _typeof(o)
                /* Called:undefined | Scope Closed:false| writes:false*/
                {
                    if (o && typeof Symbol == 'function' && o.constructor === Symbol && o !== Symbol.prototype) {
                        return 'symbol';
                    } else {
                        return typeof o;
                    }
                };
        }
        return _typeof(o);
    }
Object.defineProperty(exports, '__esModule', { value: true });
exports.default = undefined;
var _nodePath = _interopRequireDefault(require('node:path'));
var _fsExtra = _interopRequireDefault(require('fs-extra'));
var _moment = _interopRequireDefault(require('moment'));
var _snakeCase = _interopRequireDefault(require('lodash/snakeCase.js'));
var _kebabCase = _interopRequireDefault(require('lodash/kebabCase.js'));
var _startCase = _interopRequireDefault(require('lodash/startCase.js'));
var _trim = _interopRequireDefault(require('lodash/trim.js'));
var _jsYaml = _interopRequireDefault(require('js-yaml'));
var _sanitizeHtml = _interopRequireDefault(require('sanitize-html'));
var _unescape = _interopRequireDefault(require('lodash/unescape.js'));
var _marked = require('marked');
function _interopRequireDefault(e)
    /*Scope Closed:true*/
    {
        if (e && e.__esModule) {
            return e;
        } else {
            return { default: e };
        }
    }
function _regeneratorRuntime()
    /*Scope Closed:false | writes:true*/
    {
        'use strict';
        var _regeneratorRuntime_new = function _regeneratorRuntime()
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                return e;
            };
        var t;
        var e = {};
        var r = Object.prototype;
        var n = r.hasOwnProperty;
        var o = Object.defineProperty || function (t, e, r)
            /* Called:undefined | Scope Closed:true*/
            {
                t[e] = r.value;
            };
        var i = typeof Symbol == 'function' ? Symbol : {};
        var a = i.iterator || '@@iterator';
        var c = i.asyncIterator || '@@asyncIterator';
        var u = i.toStringTag || '@@toStringTag';
        function define(t, e, r)
            /*Scope Closed:true*/
            {
                Object.defineProperty(t, e, {
                    value: r,
                    enumerable: true,
                    configurable: true,
                    writable: true
                });
                return t[e];
            }
        try {
            define({}, '');
        } catch (t) {
            var define_new = function define(t, e, r)
                /* Called:undefined | Scope Closed:true*/
                {
                    return t[e] = r;
                };
        }
        function wrap(t, e, r, n)
            /*Scope Closed:false | writes:false*/
            {
                var i = e && e.prototype instanceof Generator ? e : Generator;
                var a = Object.create(i.prototype);
                var c = new Context(n || []);
                o_new(a, '_invoke', { value: makeInvokeMethod(t, r, c) });
                return a;
            }
        function tryCatch(t, e, r)
            /*Scope Closed:true*/
            {
                try {
                    return {
                        type: 'normal',
                        arg: t.call(e, r)
                    };
                } catch (t) {
                    return {
                        type: 'throw',
                        arg: t
                    };
                }
            }
        e.wrap = wrap;
        var h = 'suspendedStart';
        var l = 'suspendedYield';
        var f = 'executing';
        var s = 'completed';
        var y = {};
        function Generator()
            /*Scope Closed:true*/
            {
            }
        function GeneratorFunction()
            /*Scope Closed:true*/
            {
            }
        function GeneratorFunctionPrototype()
            /*Scope Closed:true*/
            {
            }
        var p = {};
        t[e] = r;
        var d = Object.getPrototypeOf;
        var v = d && Object.getPrototypeOf(Object.getPrototypeOf(values([])));
        if (v && v !== r && n.call(v, a)) {
            p = v;
        }
        var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p);
        function defineIteratorMethods(t)
            /*Scope Closed:true*/
            {
                [
                    'next',
                    'throw',
                    'return'
                ].forEach(function (e)
                    /* Called:undefined | Scope Closed:false| writes:true*/
                    {
                        t[e] = r;
                    });
            }
        function AsyncIterator(t, e)
            /*Scope Closed:false | writes:true*/
            {
                function invoke(r, o, i, a)
                    /*Scope Closed:false | writes:true*/
                    {
                        var c = tryCatch(t[r], t, o);
                        if (c.type !== 'throw') {
                            var u = c.arg;
                            var h = u.value;
                            if (h && _typeof(h) == 'object' && n.call(h, '__await')) {
                                return e.resolve(h.__await).then(function (t) {
                                    invoke_new('next', t, i, a);
                                }, function (t) {
                                    invoke_new('throw', t, i, a);
                                });
                            } else {
                                return e.resolve(h).then(function (t) {
                                    u.value = t;
                                    i(u);
                                }, function (t) {
                                    return invoke_new('throw', t, i, a);
                                });
                            }
                        }
                        a(c.arg);
                    }
                var r;
                o_new(this, '_invoke', {
                    value(t, n)
                        /* Called:undefined | Scope Closed:false| writes:true*/
                        {
                            function callInvokeWithMethodAndArg()
                                /*Scope Closed:false | writes:true*/
                                {
                                    return new e(function (e, r) {
                                        invoke(t, n, e, r);
                                    });
                                }
                            return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
                        }
                });
            }
        function makeInvokeMethod(e, r, n)
            /*Scope Closed:false | writes:true*/
            {
                var o = h;
                return function (i, a) {
                    if (o === f) {
                        throw Error('Generator is already running');
                    }
                    if (o === s) {
                        if (i === 'throw') {
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
                        if (n.method === 'next') {
                            n.sent = n._sent = n.arg;
                        } else if (n.method === 'throw') {
                            if (o === h) {
                                o = s;
                                throw n.arg;
                            }
                            n.dispatchException(n.arg);
                        } else if (n.method === 'return') {
                            n.abrupt('return', n.arg);
                        }
                        o = f;
                        var p = tryCatch(e, r, n);
                        if (p.type === 'normal') {
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
                        if (p.type === 'throw') {
                            o = s;
                            n.method = 'throw';
                            n.arg = p.arg;
                        }
                    }
                };
            }
        function maybeInvokeDelegate(e, r)
            /*Scope Closed:false | writes:true*/
            {
                var n = r.method;
                var o = e.iterator[n];
                if (o === t) {
                    r.delegate = null;
                    if (n !== 'throw' || !e.iterator.return || !(r.method = 'return', r.arg = t, maybeInvokeDelegate_new(e, r), r.method === 'throw')) {
                        if (n !== 'return') {
                            r.method = 'throw';
                            r.arg = new TypeError('The iterator does not provide a \'' + r.method + '\' method');
                        }
                    }
                    return y;
                }
                var i = tryCatch(o, e.iterator, r.arg);
                if (i.type === 'throw') {
                    r.method = 'throw';
                    r.arg = i.arg;
                    r.delegate = null;
                    return y;
                }
                var a = i.arg;
                if (a) {
                    if (a.done) {
                        r[e.resultName] = a.value;
                        r.next = e.nextLoc;
                        if (r.method !== 'return') {
                            r.method = 'next';
                            r.arg = t;
                        }
                        r.delegate = null;
                        return y;
                    } else {
                        return a;
                    }
                } else {
                    r.method = 'throw';
                    r.arg = new TypeError('iterator result is not an object');
                    r.delegate = null;
                    return y;
                }
            }
        function pushTryEntry(t)
            /*Scope Closed:true*/
            {
                var e = { tryLoc: t[0] };
                if (1 in t) {
                    e.catchLoc = t[1];
                }
                if (2 in t) {
                    e.finallyLoc = t[2];
                    e.afterLoc = t[3];
                }
                this.tryEntries.push(e);
            }
        function resetTryEntry(t)
            /*Scope Closed:true*/
            {
                var e = t.completion || {};
                e.type = 'normal';
                delete e.arg;
                t.completion = e;
            }
        function Context(t)
            /*Scope Closed:false | writes:true*/
            {
                this.tryEntries = [{ tryLoc: 'root' }];
                t.forEach(pushTryEntry, this);
                this.reset(true);
            }
        function values(e)
            /*Scope Closed:false | writes:true*/
            {
                if (e || e === '') {
                    var r = e[a];
                    if (r) {
                        return r.call(e);
                    }
                    if (typeof e.next == 'function') {
                        return e;
                    }
                    if (!isNaN(e.length)) {
                        var o = -1;
                        var i = function next()
                            /* Called:undefined | Scope Closed:false| writes:true*/
                            {
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
                throw new TypeError(_typeof(e) + ' is not iterable');
            }
        GeneratorFunction.prototype = GeneratorFunctionPrototype;
        o_new(g, 'constructor', {
            value: GeneratorFunctionPrototype,
            configurable: true
        });
        o_new(GeneratorFunctionPrototype, 'constructor', {
            value: GeneratorFunction,
            configurable: true
        });
        GeneratorFunction.displayName = t[e] = r;
        e.isGeneratorFunction = function (t)
            /* Called:undefined | Scope Closed:false| writes:true*/
            {
                var e = typeof t == 'function' && t.constructor;
                return !!e && (e === GeneratorFunction || (e.displayName || e.name) === 'GeneratorFunction');
            };
        e.mark = function (t)
            /* Called:undefined | Scope Closed:false| writes:true*/
            {
                if (Object.setPrototypeOf) {
                    Object.setPrototypeOf(t, GeneratorFunctionPrototype);
                } else {
                    t.__proto__ = GeneratorFunctionPrototype;
                    t[e] = r;
                }
                t.prototype = Object.create(g);
                return t;
            };
        e.awrap = function (t)
            /* Called:undefined | Scope Closed:true*/
            {
                return { __await: t };
            };
        defineIteratorMethods(AsyncIterator.prototype);
        t[e] = r;
        e.AsyncIterator = AsyncIterator;
        e.async = function (t, r, n, o, i = Promise)
            /* Called:undefined | Scope Closed:false| writes:true*/
            {
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
        t[e] = r;
        t[e] = r;
        t[e] = r;
        e.keys = function (t)
            /* Called:undefined | Scope Closed:false| writes:true*/
            {
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
            reset(e)
                /* Called:undefined | Scope Closed:false| writes:true*/
                {
                    this.prev = 0;
                    this.next = 0;
                    this.sent = this._sent = t;
                    this.done = false;
                    this.delegate = null;
                    this.method = 'next';
                    this.arg = t;
                    this.tryEntries.forEach(resetTryEntry);
                    if (!e) {
                        for (var r in this) {
                            if (r.charAt(0) === 't' && n.call(this, r) && !isNaN(+r.slice(1))) {
                                this[r] = t;
                            }
                        }
                    }
                },
            stop()
                /* Called:undefined | Scope Closed:true*/
                {
                    this.done = true;
                    var t = undefined;
                    if (t.type === 'throw') {
                        throw t.arg;
                    }
                    return this.rval;
                },
            dispatchException(e)
                /* Called:undefined | Scope Closed:false| writes:true*/
                {
                    if (this.done) {
                        throw e;
                    }
                    var r = this;
                    function handle(n, o)
                        /*Scope Closed:false | writes:true*/
                        {
                            a.type = 'throw';
                            a.arg = e;
                            r.next = n;
                            if (o) {
                                r.method = 'next';
                                r.arg = t;
                            }
                            return !!o;
                        }
                    for (var o = this.tryEntries.length - 1; o >= 0; --o) {
                        var i = undefined;
                        var a = i.completion;
                        if (i.tryLoc === 'root') {
                            return handle('end');
                        }
                        if (i.tryLoc <= this.prev) {
                            var c = n.call(i, 'catchLoc');
                            var u = n.call(i, 'finallyLoc');
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
                                if (!n.call(i, 'finallyLoc')) {
                                    throw Error('try statement without catch or finally');
                                }
                                if (this.prev < i.finallyLoc) {
                                    return handle(i.finallyLoc);
                                }
                            }
                        }
                    }
                },
            abrupt(t, e)
                /* Called:undefined | Scope Closed:false| writes:true*/
                {
                    for (var r = this.tryEntries.length - 1; r >= 0; --r) {
                        var o = undefined;
                        if (o.tryLoc <= this.prev && n.call(o, 'finallyLoc') && this.prev < o.finallyLoc) {
                            var i = o;
                            break;
                        }
                    }
                    if (i && (t === 'break' || t === 'continue') && i.tryLoc <= e && e <= i.finallyLoc) {
                        i = null;
                    }
                    var a = i ? i.completion : {};
                    a.type = t;
                    a.arg = e;
                    if (i) {
                        this.method = 'next';
                        this.next = i.finallyLoc;
                        return y;
                    } else {
                        return this.complete(a);
                    }
                },
            complete(t, e)
                /* Called:undefined | Scope Closed:false| writes:true*/
                {
                    if (t.type === 'throw') {
                        throw t.arg;
                    }
                    if (t.type === 'break' || t.type === 'continue') {
                        this.next = t.arg;
                    } else if (t.type === 'return') {
                        this.rval = this.arg = t.arg;
                        this.method = 'return';
                        this.next = 'end';
                    } else if (t.type === 'normal' && e) {
                        this.next = e;
                    }
                    return y;
                },
            finish(t)
                /* Called:undefined | Scope Closed:true*/
                {
                    for (var e = this.tryEntries.length - 1; e >= 0; --e) {
                        var r = undefined;
                        if (r.finallyLoc === t) {
                            this.complete(r.completion, r.afterLoc);
                            resetTryEntry(r);
                            return y;
                        }
                    }
                },
            catch(t)
                /* Called:undefined | Scope Closed:true*/
                {
                    for (var e = this.tryEntries.length - 1; e >= 0; --e) {
                        var r = undefined;
                        if (r.tryLoc === t) {
                            var n = r.completion;
                            if (n.type === 'throw') {
                                var o = n.arg;
                                resetTryEntry(r);
                            }
                            return o;
                        }
                    }
                    throw Error('illegal catch attempt');
                },
            delegateYield(e, r, n)
                /* Called:undefined | Scope Closed:false| writes:true*/
                {
                    this.delegate = {
                        iterator: values(e),
                        resultName: r,
                        nextLoc: n
                    };
                    if (this.method === 'next') {
                        this.arg = t;
                    }
                    return y;
                }
        };
        return e;
    }
function _createForOfIteratorHelper(r, e)
    /*Scope Closed:false | writes:false*/
    {
        var t = typeof Symbol != 'undefined' && r[Symbol.iterator] || r['@@iterator'];
        if (!(typeof Symbol != 'undefined' && r[Symbol.iterator] || r['@@iterator'])) {
            if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && typeof r.length == 'number') {
                if (t) {
                    r = t;
                }
                var _n = 0;
                var F = function F()
                    /* Called:undefined | Scope Closed:true*/
                    {
                    };
                return {
                    s: F,
                    n() {
                        if (_n >= r.length) {
                            return { done: true };
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
            throw new TypeError('Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.');
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
function _unsupportedIterableToArray(r, a)
    /*Scope Closed:false | writes:false*/
    {
        if (r) {
            if (typeof r == 'string') {
                return _arrayLikeToArray(r, a);
            }
            var t = {}.toString.call(r).slice(8, -1);
            if (t === 'Object' && r.constructor) {
                t = r.constructor.name;
            }
            {
                return undefined;
            }
        }
    }
function _arrayLikeToArray(r, a)
    /*Scope Closed:true*/
    {
        if (a == null || a > r.length) {
            a = r.length;
        }
        for (var e = 0, n = Array(a); e < a; e++) {
            n[e] = r[e];
        }
        return n;
    }
function asyncGeneratorStep(n, t, e, r, o, a, c)
    /*Scope Closed:false | writes:false*/
    {
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
function _asyncToGenerator(n)
    /*Scope Closed:true*/
    {
        return function ()
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                var t = this;
                var e = arguments;
                return new Promise(function (r, o) {
                    var a = n.apply(t, e);
                    function _next(n) {
                        asyncGeneratorStep(a, r, o, _next, _throw, 'next', n);
                    }
                    function _throw(n) {
                        asyncGeneratorStep(a, r, o, _next, _throw, 'throw', n);
                    }
                    _next(undefined);
                });
            };
    }
var normalizeDir = function normalizeDir(_0x2e4119)
    /* Called:undefined | Scope Closed:true*/
    {
        return _0x2e4119.replaceAll('\\', '/');
    };
var getSlug = function getSlug(_0x30d4c8, _0x14a1f4)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        return normalizeDir(_0x30d4c8).replaceAll(normalizeDir(_0x14a1f4), '').trim();
    };
function getLastModified(_x, _x2, _x3)
    /*Scope Closed:false | writes:false*/
    {
        return _getLastModified.apply(this, arguments);
    }
function _getLastModified()
    /*Scope Closed:false | writes:false*/
    {
        var _getLastModified_new = function ()
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                var t = this;
                var e = arguments;
                return new Promise(function (r, o) {
                    var a = n.apply(t, e);
                    function _next(n) {
                        asyncGeneratorStep(a, r, o, _next, _throw, 'next', n);
                    }
                    function _throw(n) {
                        asyncGeneratorStep(a, r, o, _next, _throw, 'throw', n);
                    }
                    _next(undefined);
                });
            };
        return _getLastModified.apply(this, arguments);
    }
var _0x5f5ef7 = {
    normalizeDir: normalizeDir,
    getLastModified: getLastModified,
    getSlug: getSlug
};
var utils_default = _0x5f5ef7;
var META_REGEX = /^\uFEFF?\/\*([\s\S]*?)\*\//i;
var META_REGEX_YAML = /^\uFEFF?---([\s\S]*?)---/i;
function cleanString(_0x12fe77, _0x59e382 = false)
    /*Scope Closed:false | writes:false*/
    {
        _0x12fe77 = _0x12fe77.replaceAll('/', ' ').trim();
        if (_0x59e382) {
            return _snakeCase.default(_0x12fe77);
        }
        return _trim.default(_kebabCase.default(_0x12fe77), '-');
    }
function cleanObjectStrings(_0x1e7b1b)
    /*Scope Closed:false | writes:false*/
    {
        var _0x4c8b03 = {};
        for (var _0x211e03 in _0x1e7b1b) {
            if (Object.hasOwn(_0x1e7b1b, _0x211e03)) {
                _0x4c8b03[cleanString(_0x211e03, true)] = ('' + _0x1e7b1b[_0x211e03]).trim();
            }
        }
        return _0x4c8b03;
    }
function slugToTitle(_0x2103a7)
    /*Scope Closed:false | writes:false*/
    {
        _0x2103a7 = _0x2103a7.replaceAll('.md', '').trim();
        return _startCase.default(_nodePath.default.basename(_0x2103a7).replaceAll(/[-_]/g, ' '));
    }
function stripMeta(_0x5f15e0)
    /*Scope Closed:false | writes:false*/
    {
        if (META_REGEX.test(_0x5f15e0)) {
            return _0x5f15e0.replace(META_REGEX, '').trim();
        }
        if (META_REGEX_YAML.test(_0x5f15e0)) {
            return _0x5f15e0.replace(META_REGEX_YAML, '').trim();
        }
        return _0x5f15e0.trim();
    }
function processMeta(_0x4079d5)
    /*Scope Closed:false | writes:false*/
    {
        if (META_REGEX.test(_0x4079d5)) {
            var _0x185405 = {};
            var _0x5d8ae4 = _0x4079d5.match(META_REGEX);
            var _0x4831ef = function ()
                /* Called:true | Scope Closed:false| writes:false*/
                {
                    var _temp24561 = ((_0x5d8ae4 != null ? undefined : _0x5d8ae4[1]) != null ? undefined : (_0x5d8ae4 != null ? undefined : _0x5d8ae4[1]).trim) != null ? undefined : ((_0x5d8ae4 != null ? undefined : _0x5d8ae4[1]) != null ? undefined : (_0x5d8ae4 != null ? undefined : _0x5d8ae4[1]).trim)();
                    {
                        return '';
                    }
                }();
            if (_0x4831ef) {
                var _0x42a285 = _0x4831ef.split('\n');
                var _iterator = _createForOfIteratorHelper(_0x42a285);
                var _step;
                try {
                    for (_iterator.s(); !(_step = _iterator.n()).done;) {
                        var _0xab4f73 = _step.value;
                        var _0x4c70d7 = _0xab4f73.indexOf(': ');
                        if (_0x4c70d7 <= 0) {
                            continue;
                        }
                        var _0x3e9d0f = _0xab4f73.substring(0, _0x4c70d7).trim();
                        var _0x18827e = _0xab4f73.substring(_0xab4f73.indexOf(': ') + 2).trim();
                        if (_0x3e9d0f && _0x18827e) {
                            _0x185405[cleanString(_0x3e9d0f, true)] = _0x18827e;
                        }
                    }
                } catch (err) {
                    _iterator.e(err);
                } finally {
                    _iterator.f();
                }
            }
            return _0x185405;
        }
        if (META_REGEX_YAML.test(_0x4079d5)) {
            var _0x5e04f5 = _0x4079d5.match(META_REGEX_YAML);
            var _0xd15e3a = function ()
                /* Called:true | Scope Closed:false| writes:false*/
                {
                    var _temp26321 = ((_0x5e04f5 != null ? undefined : _0x5e04f5[1]) != null ? undefined : (_0x5e04f5 != null ? undefined : _0x5e04f5[1]).trim) != null ? undefined : ((_0x5e04f5 != null ? undefined : _0x5e04f5[1]) != null ? undefined : (_0x5e04f5 != null ? undefined : _0x5e04f5[1]).trim)();
                    {
                        return '';
                    }
                }();
            var _0x5ab3a8 = _jsYaml.default.load(_0xd15e3a);
            return cleanObjectStrings(_0x5ab3a8);
        }
        return {};
    }
function processVars(_0x809856, _0x5066d3)
    /*Scope Closed:true*/
    {
        if (_0x5066d3.variables && Array.isArray(_0x5066d3.variables)) {
            _0x5066d3.variables.forEach(function (_0x424add)
                /* Called:undefined | Scope Closed:false| writes:false*/
                {
                    _0x809856 = _0x809856.replaceAll(/%undefined%/g, _0x424add.content);
                });
        }
        if (_0x5066d3.base_url !== undefined) {
            _0x809856 = _0x809856.replaceAll('%base_url%', _0x5066d3.base_url);
        }
        if (_0x5066d3.image_url !== undefined) {
            _0x809856 = _0x809856.replaceAll('%image_url%', _0x5066d3.image_url);
        }
        return _0x809856;
    }
function extractDocument(_x4, _x5, _x6)
    /*Scope Closed:false | writes:false*/
    {
        return _extractDocument.apply(this, arguments);
    }
function _extractDocument()
    /*Scope Closed:false | writes:false*/
    {
        var _extractDocument_new = function ()
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                var t = this;
                var e = arguments;
                return new Promise(function (r, o) {
                    var a = n.apply(t, e);
                    function _next(n) {
                        asyncGeneratorStep(a, r, o, _next, _throw, 'next', n);
                    }
                    function _throw(n) {
                        asyncGeneratorStep(a, r, o, _next, _throw, 'throw', n);
                    }
                    _next(undefined);
                });
            };
        return _extractDocument.apply(this, arguments);
    }
var _0x1a4a4b = {
    cleanString: cleanString,
    cleanObjectStrings: cleanObjectStrings,
    extractDocument: extractDocument,
    slugToTitle: slugToTitle,
    stripMeta: stripMeta,
    processMeta: processMeta,
    processVars: processVars
};
var contentProcessors_default = _0x1a4a4b;
var allowedTags = _sanitizeHtml.default.defaults.allowedTags.concat([
    'img',
    'input',
    'del'
]);
var _0x376b5b = Object.assign({}, _sanitizeHtml.default.defaults.allowedAttributes);
_0x376b5b.img = [
    'src',
    'srcset',
    'alt',
    'title',
    'width',
    'height',
    'loading'
];
_0x376b5b.input = [
    'type',
    'checked',
    'disabled'
];
_0x376b5b.h1 = ['id'];
_0x376b5b.h2 = ['id'];
_0x376b5b.h3 = ['id'];
_0x376b5b.h4 = ['id'];
_0x376b5b.h5 = ['id'];
_0x376b5b.h6 = ['id'];
_0x376b5b.span = ['class'];
_0x376b5b.code = ['class'];
_0x376b5b.pre = ['class'];
var allowedAttributes = _0x376b5b;
function sanitizeHtmlOutput(_0x511f0d)
    /*Scope Closed:false | writes:false*/
    {
        var _0x3f6818 = {
            allowedTags: allowedTags,
            allowedAttributes: allowedAttributes
        };
        return _sanitizeHtml.default(_0x511f0d, _0x3f6818);
    }
var sanitizeHtmlOutput_default = sanitizeHtmlOutput;
function handler(_x7, _x8)
    /*Scope Closed:false | writes:false*/
    {
        return _handler.apply(this, arguments);
    }
function _handler()
    /*Scope Closed:false | writes:false*/
    {
        var _handler_new = function ()
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                var t = this;
                var e = arguments;
                return new Promise(function (r, o) {
                    var a = n.apply(t, e);
                    function _next(n) {
                        asyncGeneratorStep(a, r, o, _next, _throw, 'next', n);
                    }
                    function _throw(n) {
                        asyncGeneratorStep(a, r, o, _next, _throw, 'throw', n);
                    }
                    _next(undefined);
                });
            };
        return _handler.apply(this, arguments);
    }
var page_default = exports.default = handler;