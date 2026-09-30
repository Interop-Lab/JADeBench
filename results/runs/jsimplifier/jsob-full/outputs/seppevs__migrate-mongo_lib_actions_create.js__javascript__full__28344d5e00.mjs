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
var _module = require('module');
var _url = _interopRequireWildcard(require('url'));
var _path = _interopRequireDefault(require('path'));
var _promises = _interopRequireDefault(require('fs/promises'));
var _crypto = _interopRequireDefault(require('crypto'));
function _interopRequireDefault(e)
    /*Scope Closed:true*/
    {
        if (e && e.__esModule) {
            return e;
        } else {
            return { default: e };
        }
    }
function _getRequireWildcardCache(e)
    /*Scope Closed:false | writes:false*/
    {
        if (typeof WeakMap != 'function') {
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
function _interopRequireWildcard(e, r)
    /*Scope Closed:false | writes:false*/
    {
        if (!r && e && e.__esModule) {
            return e;
        }
        if (e === null || _typeof(e) != 'object' && typeof e != 'function') {
            return { default: e };
        }
        var t = _getRequireWildcardCache(r);
        if (t && t.has(e)) {
            return t.get(e);
        }
        var n = { __proto__: null };
        var a = Object.defineProperty && Object.getOwnPropertyDescriptor;
        for (var u in e) {
            if (u !== 'default' && {}.hasOwnProperty.call(e, u)) {
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
var now = function now(_0x5d1ac2 = Date.now())
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        var _0x412c17 = new Date(_0x5d1ac2);
        return new Date(_0x412c17.getUTCFullYear(), _0x412c17.getUTCMonth(), _0x412c17.getUTCDate(), _0x412c17.getUTCHours(), _0x412c17.getUTCMinutes(), _0x412c17.getUTCSeconds(), _0x412c17.getUTCMilliseconds());
    };
var nowAsString = function nowAsString()
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        var _0x44c66f = now();
        var _0x63f9cb = ('0' + (_0x44c66f.getMonth() + 1)).slice(-2);
        var _0x531e2c = ('0' + _0x44c66f.getDate()).slice(-2);
        var _0x214b83 = ('0' + _0x44c66f.getHours()).slice(-2);
        var _0xed7d9b = ('0' + _0x44c66f.getMinutes()).slice(-2);
        var _0x58de39 = ('0' + _0x44c66f.getSeconds()).slice(-2);
        return '' + _0x44c66f.getFullYear() + _0x63f9cb + _0x531e2c + _0x214b83 + _0xed7d9b + _0x58de39;
    };
var _0x105af1 = {
    now: now,
    nowAsString: nowAsString
};
var date_default = _0x105af1;
var module_loader_default = {
    require(_0x1bf50e)
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            var _0x13cf99 = _module.createRequire(_url.pathToFileURL(_path.default.join(process.cwd(), 'package_.json')));
            return _0x13cf99_new(_0x1bf50e);
        },
    import(_0x2d940d)
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            return Promise.resolve(_0x2d940d);
        }
};
var DEFAULT_CONFIG_FILE_NAME = 'migrate-mongo-config.js';
var customConfigContent = null;
function getConfigPath()
    /*Scope Closed:false | writes:false*/
    {
        var _0x3fa869 = function ()
            /* Called:true | Scope Closed:false| writes:false*/
            {
                var _temp16339 = (global != null ? undefined : global.options) != null ? undefined : (global != null ? undefined : global.options).file;
                {
                    return null;
                }
            }();
        if (!function ()
                /* Called:true | Scope Closed:false| writes:false*/
                {
                    var _temp16339 = (global != null ? undefined : global.options) != null ? undefined : (global != null ? undefined : global.options).file;
                    {
                        return null;
                    }
                }()) {
            return _path.default.join(process.cwd(), DEFAULT_CONFIG_FILE_NAME);
        }
        if (_path.default.isAbsolute(_0x3fa869)) {
            return _0x3fa869;
        }
        return _path.default.join(process.cwd(), _0x3fa869);
    }
function getModuleExports(_0x4115d5)
    /*Scope Closed:true*/
    {
        if (_0x4115d5.default) {
            return _0x4115d5.default;
        } else {
            return _0x4115d5;
        }
    }
var config_default = {
    DEFAULT_CONFIG_FILE_NAME: 'migrate-mongo-config.js',
    set(_0x37a190)
        /* Called:undefined | Scope Closed:true*/
        {
            customConfigContent = _0x37a190;
        },
    shouldExist()
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            return _asyncToGenerator(_regeneratorRuntime().mark(function _callee() {
                var _0x3bd9d0;
                return _regeneratorRuntime().wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                        case 0:
                            if (customConfigContent) {
                                _context.next = 10;
                                break;
                            }
                            _0x3bd9d0 = getConfigPath();
                            _context.prev = 2;
                            _context.next = 5;
                            return _promises.default.stat(_0x3bd9d0);
                        case 5:
                            _context.next = 10;
                            break;
                        case 7:
                            _context.prev = 7;
                            _context.t0 = _context.catch(2);
                            throw new Error('config file does not exist: ' + _0x3bd9d0);
                        case 10:
                        case 'end':
                            return _context.stop();
                        }
                    }
                }, _callee, null, [[
                        2,
                        7
                    ]]);
            }))();
        },
    shouldNotExist()
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            return _asyncToGenerator(_regeneratorRuntime().mark(function _callee2() {
                var _0xbae9a9;
                var _0x18f255;
                return _regeneratorRuntime().wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                        case 0:
                            if (customConfigContent) {
                                _context2.next = 13;
                                break;
                            }
                            _0xbae9a9 = getConfigPath();
                            _0x18f255 = new Error('config file already exists: ' + _0xbae9a9);
                            _context2.prev = 3;
                            _context2.next = 6;
                            return _promises.default.stat(_0xbae9a9);
                        case 6:
                            throw _0x18f255;
                        case 9:
                            _context2.prev = 9;
                            _context2.t0 = _context2.catch(3);
                            if (_context2.t0.code === 'ENOENT') {
                                _context2.next = 13;
                                break;
                            }
                            throw _0x18f255;
                        case 13:
                        case 'end':
                            return _context2.stop();
                        }
                    }
                }, _callee2, null, [[
                        3,
                        9
                    ]]);
            }))();
        },
    getConfigFilename()
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            return _path.default.basename(getConfigPath());
        },
    read()
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            return _asyncToGenerator(_regeneratorRuntime().mark(function _callee3() {
                var _0x311b6d;
                var _0x176b4b;
                var _0x2454c9;
                var _0x13f786;
                return _regeneratorRuntime().wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                        case 0:
                            if (!customConfigContent) {
                                _context3.next = 2;
                                break;
                            }
                            return _context3.abrupt('return', customConfigContent);
                        case 2:
                            _0x311b6d = getConfigPath();
                            _context3.prev = 3;
                            _context3.next = 6;
                            return module_loader_default.require(_0x311b6d);
                        case 6:
                            _0x176b4b = _context3.sent;
                            _0x176b4b = getModuleExports(_0x176b4b);
                            if ((global != null ? undefined : global.options) != null ? undefined : (global != null ? undefined : global.options).migrationsDir) {
                                _0x176b4b = Object.assign({}, _0x176b4b, { migrationsDir: global.options.migrationsDir });
                            }
                            return _context3.abrupt('return', _0x176b4b);
                        case 12:
                            _context3.prev = 12;
                            _context3.t0 = _context3.catch(3);
                            if (_context3.t0.code !== 'ERR_REQUIRE_ESM' && _context3.t0.code !== 'ERR_REQUIRE_ASYNC_MODULE') {
                                _context3.next = 21;
                                break;
                            }
                            _context3.next = 17;
                            return module_loader_default.import(_url.default.pathToFileURL(_0x311b6d));
                        case 17:
                            _0x2454c9 = _context3.sent;
                            _0x13f786 = getModuleExports(_0x2454c9);
                            if ((global != null ? undefined : global.options) != null ? undefined : (global != null ? undefined : global.options).migrationsDir) {
                                _0x13f786 = Object.assign({}, _0x13f786, { migrationsDir: global.options.migrationsDir });
                            }
                            return _context3.abrupt('return', _0x13f786);
                        case 21:
                            throw _context3.t0;
                        case 22:
                        case 'end':
                            return _context3.stop();
                        }
                    }
                }, _callee3, null, [[
                        3,
                        12
                    ]]);
            }))();
        }
};
var DEFAULT_MIGRATIONS_DIR_NAME = 'migrations';
var DEFAULT_MIGRATION_EXT = '.js';
function resolveMigrationsDirPath()
    /*Scope Closed:false | writes:false*/
    {
        return _resolveMigrationsDirPath.apply(this, arguments);
    }
function _resolveMigrationsDirPath()
    /*Scope Closed:false | writes:false*/
    {
        var _resolveMigrationsDirPath_new = function ()
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
        return _resolveMigrationsDirPath.apply(this, arguments);
    }
function resolveMigrationFileExtension()
    /*Scope Closed:false | writes:false*/
    {
        return _resolveMigrationFileExtension.apply(this, arguments);
    }
function _resolveMigrationFileExtension()
    /*Scope Closed:false | writes:false*/
    {
        var _resolveMigrationFileExtension_new = function ()
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
        return _resolveMigrationFileExtension.apply(this, arguments);
    }
function resolveSampleMigrationFileName()
    /*Scope Closed:false | writes:false*/
    {
        return _resolveSampleMigrationFileName.apply(this, arguments);
    }
function _resolveSampleMigrationFileName()
    /*Scope Closed:false | writes:false*/
    {
        var _resolveSampleMigrationFileName_new = function ()
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
        return _resolveSampleMigrationFileName.apply(this, arguments);
    }
function resolveSampleMigrationPath()
    /*Scope Closed:false | writes:false*/
    {
        return _resolveSampleMigrationPath.apply(this, arguments);
    }
function _resolveSampleMigrationPath()
    /*Scope Closed:false | writes:false*/
    {
        var _resolveSampleMigrationPath_new = function ()
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
        return _resolveSampleMigrationPath.apply(this, arguments);
    }
function getModuleExports2(_0x5eba6b)
    /*Scope Closed:true*/
    {
        if (_0x5eba6b.default) {
            return _0x5eba6b.default;
        } else {
            return _0x5eba6b;
        }
    }
var migrationsDir_default = {
    resolve: resolveMigrationsDirPath,
    resolveSampleMigrationPath: resolveSampleMigrationPath,
    resolveMigrationFileExtension: resolveMigrationFileExtension,
    shouldExist()
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            return _asyncToGenerator(_regeneratorRuntime().mark(function _callee4() {
                var _0x447e40;
                return _regeneratorRuntime().wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                        case 0:
                            _context4.next = 2;
                            return resolveMigrationsDirPath();
                        case 2:
                            _0x447e40 = _context4.sent;
                            _context4.prev = 3;
                            _context4.next = 6;
                            return _promises.default.stat(_0x447e40);
                        case 6:
                            _context4.next = 11;
                            break;
                        case 8:
                            _context4.prev = 8;
                            _context4.t0 = _context4.catch(3);
                            throw new Error('migrations directory does not exist: ' + _0x447e40);
                        case 11:
                        case 'end':
                            return _context4.stop();
                        }
                    }
                }, _callee4, null, [[
                        3,
                        8
                    ]]);
            }))();
        },
    shouldNotExist()
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            return _asyncToGenerator(_regeneratorRuntime().mark(function _callee5() {
                var _0x425b89;
                var _0x3e30d5;
                return _regeneratorRuntime().wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                        case 0:
                            _context5.next = 2;
                            return resolveMigrationsDirPath();
                        case 2:
                            _0x425b89 = _context5.sent;
                            _0x3e30d5 = new Error('migrations directory already exists: ' + _0x425b89);
                            _context5.prev = 4;
                            _context5.next = 7;
                            return _promises.default.stat(_0x425b89);
                        case 7:
                            throw _0x3e30d5;
                        case 10:
                            _context5.prev = 10;
                            _context5.t0 = _context5.catch(4);
                            if (_context5.t0.code === 'ENOENT') {
                                _context5.next = 14;
                                break;
                            }
                            throw _0x3e30d5;
                        case 14:
                        case 'end':
                            return _context5.stop();
                        }
                    }
                }, _callee5, null, [[
                        4,
                        10
                    ]]);
            }))();
        },
    getFileNames()
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            return _asyncToGenerator(_regeneratorRuntime().mark(function _callee6() {
                var _0x52a700;
                var _0x1fc0e8;
                var _0x33b634;
                var _0x59d13d;
                return _regeneratorRuntime().wrap(function _callee6$(_context6) {
                    while (1) {
                        switch (_context6.prev = _context6.next) {
                        case 0:
                            _context6.next = 2;
                            return resolveMigrationsDirPath();
                        case 2:
                            _0x52a700 = _context6.sent;
                            _context6.next = 5;
                            return resolveMigrationFileExtension();
                        case 5:
                            _0x1fc0e8 = _context6.sent;
                            _context6.next = 8;
                            return _promises.default.readdir(_0x52a700);
                        case 8:
                            _0x33b634 = _context6.sent;
                            _context6.next = 11;
                            return resolveSampleMigrationFileName();
                        case 11:
                            _0x59d13d = _context6.sent;
                            return _context6.abrupt('return', _0x33b634.filter(function (_0x32bc66) {
                                return _path.default.extname(_0x32bc66) === _0x1fc0e8 && _path.default.basename(_0x32bc66) !== _0x59d13d;
                            }).sort());
                        case 13:
                        case 'end':
                            return _context6.stop();
                        }
                    }
                }, _callee6);
            }))();
        },
    loadMigration(_0x4f7c48)
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            return _asyncToGenerator(_regeneratorRuntime().mark(function _callee7() {
                var _0x3c1f5b;
                var _0x482e3a;
                var _0x1746d3;
                var _0x2d0e95;
                return _regeneratorRuntime().wrap(function _callee7$(_context7) {
                    while (1) {
                        switch (_context7.prev = _context7.next) {
                        case 0:
                            _context7.next = 2;
                            return resolveMigrationsDirPath();
                        case 2:
                            _0x3c1f5b = _context7.sent;
                            _0x482e3a = _path.default.join(_0x3c1f5b, _0x4f7c48);
                            _context7.prev = 4;
                            _0x1746d3 = module_loader_default.require(_0x482e3a);
                            return _context7.abrupt('return', getModuleExports2(_0x1746d3));
                        case 9:
                            _context7.prev = 9;
                            _context7.t0 = _context7.catch(4);
                            if (_context7.t0.code !== 'ERR_REQUIRE_ESM' && _context7.t0.code !== 'ERR_REQUIRE_ASYNC_MODULE') {
                                _context7.next = 16;
                                break;
                            }
                            _context7.next = 14;
                            return module_loader_default.import(_url.default.pathToFileURL(_0x482e3a));
                        case 14:
                            _0x2d0e95 = _context7.sent;
                            return _context7.abrupt('return', getModuleExports2(_0x2d0e95));
                        case 16:
                            throw _context7.t0;
                        case 17:
                        case 'end':
                            return _context7.stop();
                        }
                    }
                }, _callee7, null, [[
                        4,
                        9
                    ]]);
            }))();
        },
    loadFileHash(_0x375431)
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            return _asyncToGenerator(_regeneratorRuntime().mark(function _callee8() {
                var _0x2a4f2b;
                var _0x1e11f4;
                var _0x1b9a4b;
                var _0x312844;
                return _regeneratorRuntime().wrap(function _callee8$(_context8) {
                    while (1) {
                        switch (_context8.prev = _context8.next) {
                        case 0:
                            _context8.next = 2;
                            return resolveMigrationsDirPath();
                        case 2:
                            _0x2a4f2b = _context8.sent;
                            _0x1e11f4 = _path.default.join(_0x2a4f2b, _0x375431);
                            _0x1b9a4b = _crypto.default.createHash('sha256');
                            _context8.next = 7;
                            return _promises.default.readFile(_0x1e11f4);
                        case 7:
                            _0x312844 = _context8.sent;
                            _0x1b9a4b.update(_0x312844);
                            return _context8.abrupt('return', _0x1b9a4b.digest('hex'));
                        case 10:
                        case 'end':
                            return _context8.stop();
                        }
                    }
                }, _callee8);
            }))();
        },
    doesSampleMigrationExist()
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            return _asyncToGenerator(_regeneratorRuntime().mark(function _callee9() {
                var _0x2df72e;
                return _regeneratorRuntime().wrap(function _callee9$(_context9) {
                    while (1) {
                        switch (_context9.prev = _context9.next) {
                        case 0:
                            _context9.next = 2;
                            return resolveSampleMigrationPath();
                        case 2:
                            _0x2df72e = _context9.sent;
                            _context9.prev = 3;
                            _context9.next = 6;
                            return _promises.default.stat(_0x2df72e);
                        case 6:
                            return _context9.abrupt('return', true);
                        case 9:
                            _context9.prev = 9;
                            _context9.t0 = _context9.catch(3);
                            return _context9.abrupt('return', false);
                        case 12:
                        case 'end':
                            return _context9.stop();
                        }
                    }
                }, _callee9, null, [[
                        3,
                        9
                    ]]);
            }))();
        }
};
var _filename = _url.fileURLToPath(import_.meta.url);
var _dirname = _path.default.dirname(_filename);
var create_default = exports.default = function create_default(_x)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        return _ref.apply(this, arguments);
    };