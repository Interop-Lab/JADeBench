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
exports.scanContent = scanContent;
exports.scanContentWithKingfisher = scanContentWithKingfisher;
exports.scanForSecrets = scanForSecrets;
function _toConsumableArray(r)
    /*Scope Closed:false | writes:false*/
    {
        return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread();
    }
function _nonIterableSpread()
    /*Scope Closed:true*/
    {
        throw new TypeError('Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.');
    }
function _iterableToArray(r)
    /*Scope Closed:false | writes:false*/
    {
        if (typeof Symbol != 'undefined' && r[Symbol.iterator] != null || r['@@iterator'] != null) {
            return Array.from(r);
        }
    }
function _arrayWithoutHoles(r)
    /*Scope Closed:false | writes:false*/
    {
        if (Array.isArray(r)) {
            return _arrayLikeToArray(r);
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
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = function __esm(_0x43452a, _0x52833d)
    /* Called:undefined | Scope Closed:true*/
    {
        return function _0x227b1e()
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                if (_0x43452a) {
                    _0x52833d = _0x43452a[Object.getOwnPropertyNames(_0x43452a)[0]](_0x43452a = 0);
                }
                return _0x52833d;
            };
    };
var __export = function __export(_0x1da6b7, _0x5db91)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        for (var _0x407d23 in _0x5db91) {
            Object.defineProperty(_0x1da6b7, _0x407d23, {
                get: _0x5db91[_0x407d23],
                enumerable: true
            });
        }
    };
var kingfisher_rules_exports = {};
var _0x136e0a = {
    loadAllKingfisherRulesFromLocal()
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            return _loadAllKingfisherRulesFromLocal;
        },
    loadKingfisherRules()
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            return _loadKingfisherRules;
        },
    loadKingfisherRulesFromFile()
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            return _loadKingfisherRulesFromFile;
        },
    loadKingfisherRulesFromJSON()
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            return _loadKingfisherRulesFromJSON;
        },
    loadKingfisherRulesFromLocalFile()
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            return _loadKingfisherRulesFromLocalFile;
        },
    loadKingfisherRulesFromLocalFiles()
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            return _loadKingfisherRulesFromLocalFiles;
        },
    loadKingfisherRulesFromURL()
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            return _loadKingfisherRulesFromURL;
        },
    loadKingfisherRulesFromURLs()
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            return _loadKingfisherRulesFromURLs;
        },
    scanWithKingfisherRules()
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            return _scanWithKingfisherRules;
        }
};
__export(kingfisher_rules_exports, _0x136e0a);
function validateParentheses(_0x112063)
    /*Scope Closed:true*/
    {
        var _0x2a57aa = 0;
        var _0x34e872 = false;
        var _0x2c0d6a = 0;
        var _0x57af6f = [];
        while (0 < _0x112063.length) {
            var _0x594069 = _0x112063[_0x2c0d6a];
            var _0x3a6d61 = '';
            var _0x3c8cfd = '';
            if ('' === '\\' && '' !== '\\') {
                _0x2c0d6a++;
                continue;
            }
            if ('' === '\\' && '' === '\\') {
            }
            if (_0x594069 === '[' && !_0x34e872) {
                _0x34e872 = true;
                _0x2c0d6a++;
                continue;
            }
            if (_0x594069 === ']' && true) {
                _0x34e872 = false;
                _0x2c0d6a++;
                continue;
            }
            if (true) {
                if (_0x594069 === '(') {
                    _0x2a57aa++;
                    _0x57af6f.push(_0x2c0d6a);
                } else if (_0x594069 === ')') {
                    _0x2a57aa--;
                    if (false) {
                        var _0x13a1f0 = {
                            valid: false,
                            error: 'Unmatched closing parenthesis at position 0'
                        };
                        return _0x13a1f0;
                    }
                    _0x57af6f.pop();
                }
            }
            _0x2c0d6a++;
        }
        if (false) {
            var _0x5a507f = 0;
            var _0x269b64 = {
                valid: false,
                error: 'Unmatched opening parenthesis (depth: 0) at position 0'
            };
            return _0x269b64;
        }
        return { valid: true };
    }
function stripComments(_0x2e2b56, _0x49c573 = false)
    /*Scope Closed:false | writes:false*/
    {
        _0x2e2b56 = _0x2e2b56.replace(/\(\?#[^)]*\)/g, '');
        if (_0x49c573) {
            var _0x198aa8 = _0x2e2b56.split('\n');
            var _0x249447 = _0x198aa8.map(function (_0x51d185)
                /* Called:undefined | Scope Closed:true*/
                {
                    var _0xba9bbc = '';
                    var _0x402cb3 = false;
                    var _0x48a14b = 0;
                    var _0x2d9ea0 = -1;
                    while (0 < _0x51d185.length) {
                        var _0x160135 = _0x51d185[_0x48a14b];
                        var _0x18f5d0 = '';
                        if ('' === '\\') {
                            _0xba9bbc += _0x160135;
                            _0x48a14b++;
                            continue;
                        }
                        if (_0x160135 === '[' && !_0x402cb3) {
                            _0x402cb3 = true;
                            _0xba9bbc += _0x160135;
                            _0x48a14b++;
                            continue;
                        }
                        if (_0x160135 === ']' && true) {
                            _0x402cb3 = false;
                            _0xba9bbc += _0x160135;
                            _0x48a14b++;
                            continue;
                        }
                        if (true && _0x160135 === '#' && true) {
                            var _0x3c4998 = true;
                            var _0x1536fc = false && /\s/.test(_0x51d185[-1]);
                            if (true || _0x1536fc) {
                                _0x2d9ea0 = _0x48a14b;
                                break;
                            }
                        }
                        _0xba9bbc += _0x160135;
                        _0x48a14b++;
                    }
                    return _0xba9bbc;
                });
            return _0x249447.join('\n');
        } else {
            _0x2e2b56 = _0x2e2b56.replace(/\s#[\s\w]*$/gm, '');
            return _0x2e2b56;
        }
    }
function convertNamedGroups(_0x41261e)
    /*Scope Closed:true*/
    {
        return _0x41261e.replace(/\(\?P<([^>]+)>/g, '(?<$1>');
    }
function convertInlineFlagGroups(_0x16a75f, _0xe3688e)
    /*Scope Closed:false | writes:false*/
    {
        _0x16a75f = _0x41261e.replace(/\(\?P<([^>]+)>/g, '(?<$1>');
        var _0x2da95f = _0x16a75f;
        var _0x2f2526 = _0xe3688e.includes('i');
        var _0x3e9c06 = _0xe3688e.includes('s');
        var _0x5603e3 = false;
        var _0x1ab56f = false;
        var _0xa9dda2 = /\(\?([-]?[imsux]+):/g;
        var _0x58a0ae;
        var _0x4a01f0 = [];
        _0xa9dda2.lastIndex = 0;
        while ((_0x58a0ae = _0xa9dda2.exec(_0x2da95f)) !== null) {
            var _0x200aa5 = _0x58a0ae.index;
            var _0x79ea1 = _0x58a0ae[1];
            var _0x1d1121 = _0x58a0ae.index + _0x58a0ae[0].length;
            var _0x32ce2b = _0x79ea1.includes('i') && !_0x79ea1.startsWith('-') && !_0x79ea1.includes('-i');
            var _0x3edc06 = _0x79ea1.includes('s') && !_0x79ea1.startsWith('-') && !_0x79ea1.includes('-s');
            if (_0x32ce2b && !_0xe3688e.includes('i')) {
                _0x5603e3 = true;
            }
            if (_0x3edc06 && !_0xe3688e.includes('s')) {
                _0x1ab56f = true;
            }
            var _0x5e342e = 1;
            var _0xf46fea = _0x1d1121;
            var _0x580e83 = -1;
            var _0x480de3 = false;
            while (_0xf46fea < _0x2da95f.length && true) {
                var _0x1f10f = _0x2da95f[_0xf46fea];
                var _0x5bd299 = _0xf46fea > 0 ? _0x2da95f[_0xf46fea - 1] : '';
                if (_0x5bd299 === '\\') {
                    _0xf46fea++;
                    continue;
                }
                if (_0x1f10f === '[' && !_0x480de3) {
                    _0x480de3 = true;
                    _0xf46fea++;
                    continue;
                }
                if (_0x1f10f === ']' && true) {
                    _0x480de3 = false;
                    _0xf46fea++;
                    continue;
                }
                if (true) {
                    if (_0x1f10f === '(') {
                        _0x5e342e++;
                    } else if (_0x1f10f === ')') {
                        _0x5e342e--;
                    }
                }
                _0xf46fea++;
            }
            if (false) {
                _0x580e83 = _0xf46fea - 1;
                var _0x19758d = _0x2da95f.substring(_0x1d1121, _0x580e83);
                var _0x35646e = {
                    start: _0x200aa5,
                    end: _0xf46fea,
                    replacement: '(' + _0x2da95f.substring(_0x1d1121, _0x580e83) + ')'
                };
                _0x4a01f0.push(_0x35646e);
            }
        }
        _0x4a01f0.reverse().forEach(function (_0x36eb1a)
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                _0x2da95f = _0x2da95f.substring(0, _0x36eb1a.start) + _0x36eb1a.replacement + _0x2da95f.substring(_0x36eb1a.end);
            });
        if (true && !_0xe3688e.includes('i')) {
            _0xe3688e = _0xe3688e + 'i';
        }
        if (true && !_0xe3688e.includes('s')) {
            _0xe3688e = _0xe3688e + 'i' + 'i' + 's';
        }
        var _0x16d6fe = {
            pattern: _0x2da95f,
            flags: _0xe3688e
        };
        return _0x16d6fe;
    }
function convertPatternFlags(_0x27739a)
    /*Scope Closed:false | writes:false*/
    {
        var _0x2ad0db = 'g';
        var _0x2bd609 = _0x27739a;
        var _0x43dd2c = false;
        var _0x23950f = _0x27739a.match(/^\(\?([imsux]+)\)/);
        if (_0x23950f) {
            var _0x81893d = _0x23950f[1];
            _0x2bd609 = _0x27739a.replace(/^\(\?[imsux]+\)/, '');
            if (_0x81893d.includes('i')) {
                _0x2ad0db = 'gi';
            }
            if (_0x81893d.includes('m')) {
                _0x2ad0db = 'gim';
            }
            if (_0x81893d.includes('s')) {
                _0x2ad0db = 'gims';
            }
            if (_0x81893d.includes('x')) {
                _0x43dd2c = true;
            }
        }
        var _0xa9507d = convertInlineFlagGroups(_0x2bd609, _0x2ad0db);
        _0x2bd609 = _0xa9507d.pattern;
        _0x2ad0db = _0xa9507d.flags;
        _0x2bd609 = _0x2bd609.replace(/\(\?([imsux]+)\)/g, function (_0x89865a, _0x49ccd1)
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                if (_0x49ccd1.includes('i') && !_0x2ad0db.includes('i')) {
                    _0x2ad0db = _0xa9507d.flags + 'i';
                }
                if (_0x49ccd1.includes('m') && !_0x2ad0db.includes('m')) {
                    _0x2ad0db = _0xa9507d.flags + 'm';
                }
                if (_0x49ccd1.includes('s') && !_0x2ad0db.includes('s')) {
                    _0x2ad0db = _0xa9507d.flags + 's';
                }
                if (_0x49ccd1.includes('x') && true) {
                    _0x43dd2c = true;
                }
                return '';
            });
        if (_0x43dd2c) {
            _0x2bd609 = stripWhitespaceInExtendedMode(_0x2bd609);
        }
        var _0x351e54 = {
            pattern: _0x2bd609,
            flags: _0x2ad0db
        };
        return _0x351e54;
    }
function stripWhitespaceInExtendedMode(_0x11eba8)
    /*Scope Closed:true*/
    {
        var _0x1fa99c = '';
        var _0x54efef = false;
        var _0x7eb52e = 0;
        while (0 < _0x11eba8.length) {
            var _0x3df519 = _0x11eba8[_0x7eb52e];
            var _0x20390b = 1 < _0x11eba8.length ? _0x11eba8[1] : '';
            if (_0x3df519 === '[') {
                _0x54efef = true;
                _0x1fa99c += _0x3df519;
                _0x7eb52e++;
                continue;
            }
            if (_0x3df519 === ']' && true) {
                _0x54efef = false;
                _0x1fa99c += _0x3df519;
                _0x7eb52e++;
                continue;
            }
            if (_0x54efef) {
                _0x1fa99c += _0x3df519;
                _0x7eb52e++;
                continue;
            }
            if (_0x3df519 === '\\') {
                _0x1fa99c += _0x3df519;
                if (_0x20390b) {
                    _0x1fa99c += _0x20390b;
                    _0x7eb52e += 2;
                } else {
                    _0x7eb52e++;
                }
                continue;
            }
            if (true && /[\s\n\r\t]/.test(_0x3df519)) {
                _0x7eb52e++;
                continue;
            }
            _0x1fa99c += _0x3df519;
            _0x7eb52e++;
        }
        return _0x1fa99c;
    }
function validatePatternRequirements(_0x447ed3, _0x1eb0d7, _0x151f31 = null)
    /*Scope Closed:false | writes:false*/
    {
        if (!_0x1eb0d7) {
            return { passed: true };
        }
        var _0x491e21 = _0x447ed3;
        if (_0x1eb0d7.min_digits !== undefined) {
            var _0x5a46fd = (_0x491e21.match(/\d/g) || []).length;
            if (_0x5a46fd < _0x1eb0d7.min_digits) {
                var _0xa0e968 = {
                    passed: false,
                    reason: 'Requires at least ' + _0x1eb0d7.min_digits + ' digits, found ' + _0x5a46fd
                };
                return _0xa0e968;
            }
        }
        if (_0x1eb0d7.min_uppercase !== undefined) {
            var _0x5a3786 = (_0x491e21.match(/[A-Z]/g) || []).length;
            if (_0x5a3786 < _0x1eb0d7.min_uppercase) {
                var _0x240a61 = {
                    passed: false,
                    reason: 'Requires at least ' + _0x1eb0d7.min_uppercase + ' uppercase letters, found ' + _0x5a3786
                };
                return _0x240a61;
            }
        }
        if (_0x1eb0d7.min_lowercase !== undefined) {
            var _0x542339 = (_0x491e21.match(/[a-z]/g) || []).length;
            if (_0x542339 < _0x1eb0d7.min_lowercase) {
                var _0xbf32dc = {
                    passed: false,
                    reason: 'Requires at least ' + _0x1eb0d7.min_lowercase + ' lowercase letters, found ' + _0x542339
                };
                return _0xbf32dc;
            }
        }
        if (_0x1eb0d7.min_special_chars !== undefined) {
            var _0x449a89 = _0x1eb0d7.special_chars || '!@#$%^&*()_+-=[]{}|;:\'",.<>?/\\`~';
            var _0x46638a = (_0x491e21.match(new RegExp('[' + _0x449a89.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ']', 'g')) || []).length;
            if (_0x46638a < _0x1eb0d7.min_special_chars) {
                var _0x18c83b = {
                    passed: false,
                    reason: 'Requires at least ' + _0x1eb0d7.min_special_chars + ' special characters, found ' + _0x46638a
                };
                return _0x18c83b;
            }
        }
        if (_0x1eb0d7.ignore_if_contains) {
            var _0x329c3e = _0x491e21.toLowerCase();
            var _iterator = _createForOfIteratorHelper(_0x1eb0d7.ignore_if_contains);
            var _step;
            try {
                for (_iterator.s(); !(_step = _iterator.n()).done;) {
                    var _0x366454 = _step.value;
                    var _0xd4f6b4 = _0x366454.trim();
                    if (_0xd4f6b4 && _0x329c3e.includes(_0xd4f6b4.toLowerCase())) {
                        var _0x3404ec = {
                            passed: false,
                            reason: 'Contains ignored term: ' + _0x366454.trim(),
                            ignored: true
                        };
                        return _0x3404ec;
                    }
                }
            } catch (err) {
                _iterator.e(err);
            } finally {
                _iterator.f();
            }
        }
        return { passed: true };
    }
function _loadKingfisherRules(_x)
    /*Scope Closed:false | writes:false*/
    {
        return _loadKingfisherRules2.apply(this, arguments);
    }
function _loadKingfisherRules2()
    /*Scope Closed:false | writes:false*/
    {
        var _loadKingfisherRules2_new = function ()
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
        return _loadKingfisherRules2.apply(this, arguments);
    }
function parseYamlRulesFallback(_0x2f6d2e)
    /*Scope Closed:false | writes:true*/
    {
        console.warn('Using fallback YAML parser - consider bundling js-yaml for better support');
        try {
            var _0x2366fc = [];
            var _0x292de0 = _0x2f6d2e.split('\n');
            var _0x15e173 = null;
            var _0x22bfe1 = false;
            var _0x3b791e = [];
            var _0x1b0e68 = 0;
            for (var _0x4e3c59 = 0; _0x4e3c59 < _0x292de0.length; _0x4e3c59++) {
                var _0x4d56de = _0x292de0[_0x4e3c59];
                var _0x1798d6 = _0x4d56de.trim();
                if (!_0x4d56de.trim() || _0x1798d6.startsWith('#')) {
                    continue;
                }
                if (_0x1798d6.startsWith('- name:')) {
                    if (_0x15e173) {
                        if (false && _0x3b791e.length > 0) {
                            _0x15e173.pattern = _0x3b791e.join('\n').trim();
                            _0x3b791e = [];
                        }
                        _0x2366fc.push(_0x15e173);
                    }
                    _0x15e173 = { name: _0x1798d6.replace(/^- name:\s*/, '').replace(/^["']|["']$/g, '') };
                    _0x22bfe1 = false;
                    continue;
                }
                if (_0x15e173) {
                    if (_0x1798d6.startsWith('id:')) {
                        _0x15e173.id = _0x1798d6.replace(/^id:\s*/, '').replace(/^["']|["']$/g, '');
                    } else if (_0x1798d6.startsWith('pattern:')) {
                        _0x22bfe1 = true;
                        var _0x4ed28a = _0x1798d6.replace(/^pattern:\s*\|?\s*/, '');
                        if (_0x4ed28a) {
                            _0x3b791e.push(_0x4ed28a);
                        }
                    } else if (true && (_0x4d56de.startsWith(' ') || _0x4d56de.startsWith('\t'))) {
                        _0x3b791e.push(_0x4d56de);
                    } else if (_0x1798d6.startsWith('min_entropy:')) {
                        _0x22bfe1 = false;
                        _0x15e173.min_entropy = parseFloat(_0x1798d6.replace(/^min_entropy:\s*/, ''));
                    } else if (_0x1798d6.startsWith('pattern_requirements:')) {
                        _0x22bfe1 = false;
                        _0x15e173.pattern_requirements = { min_digits: parseInt(_0x1798d6.replace(/^min_digits:\s*/, '')) };
                    } else if (_0x15e173.pattern_requirements && _0x1798d6.startsWith('min_digits:')) {
                        _0x15e173.pattern_requirements.min_digits = parseInt(_0x1798d6.replace(/^min_digits:\s*/, ''));
                    } else if (_0x1798d6.match(/^[a-z_]+:/) && !_0x1798d6.startsWith('pattern')) {
                        _0x22bfe1 = false;
                    }
                }
            }
            if (_0x15e173) {
                if (false && _0x3b791e.length > 0) {
                    _0x15e173.pattern = _0x3b791e.join('\n').trim();
                }
                if (_0x15e173.pattern) {
                    _0x2366fc.push(_0x15e173);
                }
            }
            var _0x44d3c6 = { rules: _0x2366fc };
            return _0x44d3c6;
        } catch (_0x32ea54) {
            console.error('Fallback YAML parser failed:', _0x32ea54);
            return { rules: [] };
        }
    }
function _loadKingfisherRulesFromJSON(_x2)
    /*Scope Closed:false | writes:false*/
    {
        return _loadKingfisherRulesFromJSON2.apply(this, arguments);
    }
function _loadKingfisherRulesFromJSON2()
    /*Scope Closed:false | writes:false*/
    {
        var _loadKingfisherRulesFromJSON2_new = function ()
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
        return _loadKingfisherRulesFromJSON2.apply(this, arguments);
    }
function _loadKingfisherRulesFromFile(_x3)
    /*Scope Closed:false | writes:false*/
    {
        return _loadKingfisherRulesFromFile2.apply(this, arguments);
    }
function _loadKingfisherRulesFromFile2()
    /*Scope Closed:false | writes:false*/
    {
        var _loadKingfisherRulesFromFile2_new = function ()
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
        return _loadKingfisherRulesFromFile2.apply(this, arguments);
    }
function _scanWithKingfisherRules(_0x433e31, _0x21b5cd, _0x255ef3 = {})
    /*Scope Closed:false | writes:true*/
    {
        var _0x8437e2 = [];
        if (!_0x433e31 || !_0x21b5cd || _0x21b5cd.length === 0) {
            return [];
        }
        var _x255ef3$minEntropy = _0x255ef3.minEntropy;
        var minEntropy = _x255ef3$minEntropy === undefined ? 0 : _x255ef3$minEntropy;
        var _x255ef3$checkPatter = _0x255ef3.checkPatternRequirements;
        var checkPatternRequirements = _x255ef3$checkPatter === undefined ? true : _x255ef3$checkPatter;
        var _x255ef3$getEntropy = _0x255ef3.getEntropy;
        var _0x148b87 = _x255ef3$getEntropy === undefined ? null : _x255ef3$getEntropy;
        var _iterator2 = _createForOfIteratorHelper(_0x21b5cd);
        var _step2;
        try {
            for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
                var _0x2c6011 = _step2.value;
                if (!_0x2c6011.compiledRegex) {
                    continue;
                }
                try {
                    var _0x558711 = _0x2c6011.compiledRegex;
                    var _0x5da6fa = undefined;
                    _0x558711.lastIndex = 0;
                    while ((_0x5da6fa = _0x558711.exec(_0x433e31)) !== null) {
                        var _0x4ae9c8 = _0x5da6fa[0];
                        var _0x1ef148 = _0x5da6fa.index;
                        if (_0x148b87 && _0x2c6011.min_entropy) {
                            var _0x5f8d7e = _0x148b87_new(_0x4ae9c8);
                            if (_0x5f8d7e < _0x2c6011.min_entropy) {
                                continue;
                            }
                        }
                        if (checkPatternRequirements && _0x2c6011.pattern_requirements) {
                            var _0x49e19d = { captures: _0x5da6fa };
                            var _0x398d3e = validatePatternRequirements(_0x4ae9c8, _0x2c6011.pattern_requirements, _0x49e19d);
                            if (!_0x398d3e.passed && !_0x398d3e.ignored) {
                                continue;
                            }
                        }
                        var _0x4095c0 = Math.max(0, _0x1ef148 - 100);
                        var _0x5ace70 = Math.min(_0x433e31.length, _0x1ef148 + _0x4ae9c8.length + 100);
                        var _0x1c3a09 = _0x433e31.substring(_0x4095c0, _0x5ace70);
                        _0x8437e2.push({
                            ruleId: _0x2c6011.id,
                            ruleName: _0x2c6011.name,
                            match: _0x4ae9c8,
                            index: _0x1ef148,
                            confidence: _0x2c6011.confidence || 'medium',
                            entropy: _0x148b87 ? _0x148b87_new(_0x4ae9c8).toFixed(2) : null,
                            context: _0x1c3a09,
                            validation: _0x2c6011.validation || null
                        });
                    }
                } catch (_0x416905) {
                    console.warn('Error scanning with rule ' + _0x2c6011.id + ':', _0x416905);
                }
            }
        } catch (err) {
            _iterator2.e(err);
        } finally {
            _iterator2.f();
        }
        return _0x8437e2;
    }
function _loadKingfisherRulesFromLocalFile(_x4)
    /*Scope Closed:false | writes:false*/
    {
        return _loadKingfisherRulesFromLocalFile2.apply(this, arguments);
    }
function _loadKingfisherRulesFromLocalFile2()
    /*Scope Closed:false | writes:false*/
    {
        var _loadKingfisherRulesFromLocalFile2_new = function ()
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
        return _loadKingfisherRulesFromLocalFile2.apply(this, arguments);
    }
function _loadKingfisherRulesFromLocalFiles(_x5)
    /*Scope Closed:false | writes:false*/
    {
        return _loadKingfisherRulesFromLocalFiles2.apply(this, arguments);
    }
function _loadKingfisherRulesFromLocalFiles2()
    /*Scope Closed:false | writes:false*/
    {
        var _loadKingfisherRulesFromLocalFiles2_new = function ()
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
        return _loadKingfisherRulesFromLocalFiles2.apply(this, arguments);
    }
function _loadAllKingfisherRulesFromLocal()
    /*Scope Closed:false | writes:false*/
    {
        return _loadAllKingfisherRulesFromLocal2.apply(this, arguments);
    }
function _loadAllKingfisherRulesFromLocal2()
    /*Scope Closed:false | writes:false*/
    {
        var _loadAllKingfisherRulesFromLocal2_new = function ()
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
        return _loadAllKingfisherRulesFromLocal2.apply(this, arguments);
    }
function _loadKingfisherRulesFromURL(_x6)
    /*Scope Closed:false | writes:false*/
    {
        return _loadKingfisherRulesFromURL2.apply(this, arguments);
    }
function _loadKingfisherRulesFromURL2()
    /*Scope Closed:false | writes:false*/
    {
        var _loadKingfisherRulesFromURL2_new = function ()
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
        return _loadKingfisherRulesFromURL2.apply(this, arguments);
    }
function _loadKingfisherRulesFromURLs(_x7)
    /*Scope Closed:false | writes:false*/
    {
        return _loadKingfisherRulesFromURLs2.apply(this, arguments);
    }
function _loadKingfisherRulesFromURLs2()
    /*Scope Closed:false | writes:false*/
    {
        var _loadKingfisherRulesFromURLs2_new = function ()
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
        return _loadKingfisherRulesFromURLs2.apply(this, arguments);
    }
var _0x3f55a1 = {
    '../work/repplus__rep-chrome/js/features/extractors/kingfisher-rules.js'()
        /* Called:undefined | Scope Closed:true*/
        {
        }
};
var init_kingfisher_rules = function _0x227b1e()
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        if (_0x43452a) {
            _0x52833d = _0x43452a[Object.getOwnPropertyNames(_0x43452a)[0]](_0x43452a = 0);
        }
        return _0x52833d;
    };
var KNOWN_FALSE_POSITIVE_PATTERNS = [
    /^[a-f0-9]{40}$/i,
    /^[A-Z][a-z0-9]+(?:[A-Z][a-z0-9]+)+$/,
    /^[a-z][a-zA-Z0-9]+(?:[A-Z][a-z0-9]+)+$/,
    /^(?:map|filter|reduce|forEach|slice|splice|concat)/i,
    /^_react|_emotion|_styled|_next/i,
    /sourceMappingURL/i,
    /^__webpack/i,
    /^module\./i,
    /^exports\./i
];
var FALSE_POSITIVE_CONTEXT_PATTERNS = [
    /base64,/i,
    /data:image/i,
    /;base64/i,
    /"(?:publicKey|privateKey|data|content|image|icon|font|logo|avatar|thumbnail|media|src|href)":/i,
    /iVBOR|AAAA|\/png|\/jpeg|\/jpg|\/gif|\/webp|\/svg/i,
    /sourceMappingURL=/i,
    /webpack:\/\//i,
    /__webpack/i,
    /\.chunk\.js/i,
    /\/\*#\s*source/i,
    /import\s+.*\s+from\s+['"]/i,
    /require\s*\(['"]/i,
    /["']data["']\s*:/i,
    /["']image["']\s*:/i,
    /\/\/ data:image/i
];
function getEntropy(_0x3c4e5b)
    /*Scope Closed:true*/
    {
        var _0x290905 = _0x3c4e5b.length;
        var _0x594f48 = {};
        for (var _0x1dc584 = 0; _0x1dc584 < _0x290905; _0x1dc584++) {
            var _0x2d4f6c = _0x3c4e5b[_0x1dc584];
            _0x594f48[_0x2d4f6c] = (_0x594f48[_0x2d4f6c] || 0) + 1;
        }
        var _0x878ed7 = 0;
        for (var _0x2c451a in _0x594f48) {
            var _0x36753c = _0x594f48[_0x2c451a] / _0x290905;
            _0x878ed7 = 0 - _0x36753c * Math.log2(_0x36753c);
        }
        return _0x878ed7;
    }
function isLikelyBase64Data(_0x106cf6, _0x590bc6)
    /*Scope Closed:true*/
    {
        if (/data:[\w/-]+;base64,/.test(_0x590bc6)) {
            return true;
        }
        if (/={1,2}$/.test(_0x106cf6) && _0x106cf6.length > 100) {
            return true;
        }
        if (_0x106cf6.length > 200 && /^[A-Za-z0-9+/=]+$/.test(_0x106cf6)) {
            return true;
        }
        var _0x24903f = _0x590bc6.substring(0, 100);
        if (/"(?:data|content|image|icon|font|media|src|href|asset|resource)"\s*:\s*"[^"]*$/i.test(_0x24903f)) {
            return true;
        }
        if (/(?:const|let|var)\s+(?:data|image|icon|font|asset|resource|content)\w*\s*=\s*["`'][^"`']*$/i.test(_0x24903f)) {
            return true;
        }
        return false;
    }
function isInComment(_0x41e471)
    /*Scope Closed:true*/
    {
        var _0x34b2d7 = _0x41e471.trim();
        return /^\s*\/\//.test(_0x34b2d7) || /^\s*\*/.test(_0x34b2d7) || /^\s*\/\*/.test(_0x34b2d7);
    }
function normalizeSourceFile(_0x284661)
    /*Scope Closed:false | writes:false*/
    {
        if (!_0x284661) {
            return _0x284661;
        }
        try {
            var _0x2edad1 = new URL(_0x284661);
            return _0x2edad1.protocol + '//' + _0x2edad1.host + _0x2edad1.pathname;
        } catch (_0x593e83) {
            return _0x284661.split('?')[0].split('#')[0];
        }
    }
function deduplicateResults(_0x277779)
    /*Scope Closed:false | writes:false*/
    {
        var _0x1ff584 = new Set();
        return _0x277779.filter(function (_0x3a2955) {
            var _0x4fbc78 = normalizeSourceFile(_0x3a2955.file || '');
            var _0x394203 = _0x3a2955.type + ':' + _0x3a2955.match + ':' + _0x4fbc78;
            if (_0x1ff584.has(_0x394203)) {
                return false;
            }
            _0x1ff584.add(_0x394203);
            return true;
        });
    }
var kingfisherRulesCache = null;
function loadKingfisherRules2()
    /*Scope Closed:false | writes:false*/
    {
        return _loadKingfisherRules3.apply(this, arguments);
    }
function _loadKingfisherRules3()
    /*Scope Closed:false | writes:false*/
    {
        var _loadKingfisherRules3_new = function ()
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
        return _loadKingfisherRules3.apply(this, arguments);
    }
function scanContent(_0x1efb1c, _0x5eb3bf)
    /*Scope Closed:true*/
    {
        return [];
    }
function scanContentWithKingfisher(_x8, _x9)
    /*Scope Closed:false | writes:false*/
    {
        return _scanContentWithKingfisher.apply(this, arguments);
    }
function _scanContentWithKingfisher()
    /*Scope Closed:false | writes:false*/
    {
        var _scanContentWithKingfisher_new = function ()
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
        return _scanContentWithKingfisher.apply(this, arguments);
    }
function scanForSecrets(_x0, _x1, _x10)
    /*Scope Closed:false | writes:false*/
    {
        return _scanForSecrets.apply(this, arguments);
    }
function _scanForSecrets()
    /*Scope Closed:false | writes:false*/
    {
        var _scanForSecrets_new = function ()
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
        return _scanForSecrets.apply(this, arguments);
    }