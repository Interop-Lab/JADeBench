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
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = function __commonJS(_0x2463cd, _0x1cef3d)
    /* Called:undefined | Scope Closed:true*/
    {
        return function _0x11d608()
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                if (!_0x1cef3d) {
                    _0x2463cd[Object.getOwnPropertyNames(_0x2463cd)[0]]((_0x1cef3d = { exports: {} }).exports, _0x1cef3d);
                }
                return _0x1cef3d.exports;
            };
    };
var require_jsonapiUtil = function _0x11d608()
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        if (!_0x1cef3d) {
            _0x2463cd[Object.getOwnPropertyNames(_0x2463cd)[0]]((_0x1cef3d = { exports: {} }).exports, _0x1cef3d);
        }
        return _0x1cef3d.exports;
    };
var require_storageConnection = function _0x11d608()
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        if (!_0x1cef3d) {
            _0x2463cd[Object.getOwnPropertyNames(_0x2463cd)[0]]((_0x1cef3d = { exports: {} }).exports, _0x1cef3d);
        }
        return _0x1cef3d.exports;
    };
var require_helpers = function _0x11d608()
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        if (!_0x1cef3d) {
            _0x2463cd[Object.getOwnPropertyNames(_0x2463cd)[0]]((_0x1cef3d = { exports: {} }).exports, _0x1cef3d);
        }
        return _0x1cef3d.exports;
    };
var path = require('path');
var Jsonapi = require_jsonapiUtil();
var jwt = require('jsonwebtoken');
var helpers = require_helpers();
var _require_storageConne2 = require_storageConnection();
var getStorageConnection = _require_storageConne2.getStorageConnection;
exports.serveIndexPage = function (_0x1d4bb4, _0x29bb91)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        _0x29bb91.sendFile(path.join(__dirname, '..', '..', '..', 'web', 'index.html'));
    };
exports.createUser = /*@Info: Executed but got error: Error: Line 1: Unexpected token (*/
function ()
    /* Called:true | Scope Closed:true*/
    {
        var _ref = function ()
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
        return function (_x, _x2)
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                return _ref.apply(this, arguments);
            };
    }();
exports.loginUser = /*@Info: Executed but got error: Error: Line 1: Unexpected token (*/
function ()
    /* Called:true | Scope Closed:true*/
    {
        var _ref2 = function ()
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
        return function (_x3, _x4)
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                return _ref2.apply(this, arguments);
            };
    }();
exports.getUserProfile = /*@Info: Executed but got error: Error: Line 1: Unexpected token (*/
function ()
    /* Called:true | Scope Closed:true*/
    {
        var _ref3 = function ()
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
        return function (_x5, _x6)
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                return _ref3.apply(this, arguments);
            };
    }();
exports.updateUserProfile = /*@Info: Executed but got error: Error: Line 1: Unexpected token (*/
function ()
    /* Called:true | Scope Closed:true*/
    {
        var _ref4 = function ()
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
        return function (_x7, _x8)
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                return _ref4.apply(this, arguments);
            };
    }();
exports.updateUserPassword = /*@Info: Executed but got error: Error: Line 1: Unexpected token (*/
function ()
    /* Called:true | Scope Closed:true*/
    {
        var _ref5 = function ()
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
        return function (_x9, _x0)
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                return _ref5.apply(this, arguments);
            };
    }();
exports.getAllUsers = /*@Info: Executed but got error: Error: Line 1: Unexpected token (*/
function ()
    /* Called:true | Scope Closed:true*/
    {
        var _ref6 = function ()
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
        return function (_x1, _x10)
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                return _ref6.apply(this, arguments);
            };
    }();
exports.getAdminName = /*@Info: Executed but got error: Error: Line 1: Unexpected token (*/
function ()
    /* Called:true | Scope Closed:true*/
    {
        var _ref7 = function ()
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
        return function (_x11, _x12)
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                return _ref7.apply(this, arguments);
            };
    }();
exports.addUser = /*@Info: Executed but got error: Error: Line 1: Unexpected token (*/
function ()
    /* Called:true | Scope Closed:true*/
    {
        var _ref8 = function ()
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
        return function (_x13, _x14)
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                return _ref8.apply(this, arguments);
            };
    }();
exports.removeUser = /*@Info: Executed but got error: Error: Line 1: Unexpected token (*/
function ()
    /* Called:true | Scope Closed:true*/
    {
        var _ref9 = function ()
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
        return function (_x15, _x16)
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                return _ref9.apply(this, arguments);
            };
    }();
exports.getTotalUsers = /*@Info: Executed but got error: Error: Line 1: Unexpected token (*/
function ()
    /* Called:true | Scope Closed:true*/
    {
        var _ref0 = function ()
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
        return function (_x17, _x18)
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                return _ref0.apply(this, arguments);
            };
    }();