'use strict';
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
var stream = require('stream');
var stripAnsi = require('strip-ansi');
var os = require('os');
var pid = process.pid;
var isBun = typeof Bun !== 'undefined';
var LogLevel = {
    INFO: 'info',
    ERROR: 'error'
};
var logCollector = {
    storage: {},
    collectLogs: [
        LogLevel.INFO,
        LogLevel.ERROR
    ],
    enableConsoleOutput: process.env.NODE_ENV !== 'production',
    hostname: os.hostname(),
    pid: pid,
    isInitializationFailed: false,
    isStorageReady: false,
    originalStdoutWrite: process.stdout.write,
    originalStderrWrite: process.stderr.write,
    setInitializationTimeout()
        /* Called:undefined | Scope Closed:true*/
        {
            var _this = this;
            this.initializationTimeoutId = setTimeout(function ()
                /* Called:undefined | Scope Closed:false| writes:true*/
                {
                    _this.createEmptyLogStream();
                    _this.isInitializationFailed = true;
                    console.error('Error: Unable to initialize Errsole');
                }, 30000);
        },
    initialize()
        /* Called:undefined | Scope Closed:false| writes:true*/
        {
            var _this2 = this;
            var _0x1d21f8 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            this.storage = _0x1d21f8.storage;
            this.collectLogs = _0x1d21f8.collectLogs || [
                LogLevel.INFO,
                LogLevel.ERROR
            ];
            if (typeof _0x1d21f8.enableConsoleOutput !== 'undefined') {
                this.enableConsoleOutput = _0x1d21f8.enableConsoleOutput;
            }
            this.hostname = _0x1d21f8.serverName || os.hostname();
            if (_0x1d21f8.storage.once) {
                _0x1d21f8.storage.once('ready', function ()
                    /* Called:undefined | Scope Closed:false| writes:true*/
                    {
                        clearTimeout(_this2.initializationTimeoutId);
                        if (_this2.isInitializationFailed) {
                            _this2.createLogStream();
                            _this2.isInitializationFailed = false;
                        } else {
                            _this2.logStream.uncork();
                        }
                        _this2.isStorageReady = true;
                    });
            }
            if (this.enableConsoleOutput) {
                process.stdout.write = this.originalStdoutWrite;
                process.stderr.write = this.originalStderrWrite;
            } else {
                console.log('Note: Terminal output will be disabled after initial logs.');
                var _0x3de7b0 = function _0x3de7b0(_0x5c555c, _0x3280aa, _0x37df82)
                    /* Called:undefined | Scope Closed:false| writes:true*/
                    {
                        if (typeof _0x3280aa === 'function') {
                            _0x37df82 = _0x3280aa;
                        }
                        if (typeof _0x3280aa === 'function') {
                            process.nextTick(function ()
                                /* Called:undefined | Scope Closed:false| writes:true*/
                                {
                                    return _0x37df82(null);
                                });
                        }
                        return true;
                    };
                process.stdout.write = _0x3de7b0;
                process.stderr.write = _0x3de7b0;
            }
            if ((_0x1d21f8.collectLogs || [
                    LogLevel.INFO,
                    LogLevel.ERROR
                ]).includes(LogLevel.INFO)) {
                this.interceptLogs(LogLevel.INFO);
                console.log('Errsole is capturing INFO logs.');
            } else {
                console.log('Errsole is NOT capturing INFO logs.');
            }
            if ((_0x1d21f8.collectLogs || [
                    LogLevel.INFO,
                    LogLevel.ERROR
                ]).includes(LogLevel.ERROR)) {
                this.interceptLogs(LogLevel.ERROR);
                console.log('Errsole is capturing ERROR logs.');
            } else {
                console.log('Errsole is NOT capturing ERROR logs.');
            }
        },
    createLogStream()
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            var _this3 = this;
            this.logStream = new stream.Writable({
                objectMode: true,
                write(_0x4e1273, _0x5daca3, _0x10b4eb)
                    /* Called:undefined | Scope Closed:false| writes:false*/
                    {
                        _this3.storage.postLogs([_0x4e1273]);
                        setImmediate(_0x10b4eb);
                    }
            });
        },
    createEmptyLogStream()
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            if (this.logStream) {
                new stream.Writable({
                    objectMode: true,
                    write(_0x4e1273, _0x5daca3, _0x10b4eb)
                        /* Called:undefined | Scope Closed:false| writes:false*/
                        {
                            _this3.storage.postLogs([_0x4e1273]);
                            setImmediate(_0x10b4eb);
                        }
                }).destroy();
            }
            this.logStream = new stream.Writable({
                objectMode: true,
                write(_0x4dfa05, _0x4f4f3c, _0x3b0a00)
                    /* Called:undefined | Scope Closed:true*/
                    {
                        setImmediate(_0x3b0a00);
                    }
            });
        },
    interceptLogs(_0xd11064)
        /* Called:undefined | Scope Closed:false| writes:true*/
        {
            var _this4 = this;
            var _0x1f706a;
            var _0x1ad25f;
            switch (_0xd11064) {
            case LogLevel.INFO:
                _0x1f706a = process.stdout;
                _0x1ad25f = this.originalStdoutWrite;
                break;
            case LogLevel.ERROR:
                _0x1f706a = process.stderr;
                _0x1ad25f = this.originalStderrWrite;
                break;
            default:
                return;
            }
            if (isBun) {
                var _0x4325e3 = [
                    'log',
                    'info',
                    'debug',
                    'dir',
                    'table',
                    'count',
                    'countReset',
                    'time',
                    'timeLog',
                    'timeEnd',
                    'group',
                    'groupEnd'
                ];
                var _0x413342 = [
                    'error',
                    'warn',
                    'trace'
                ];
                _0x4325e3.forEach(function (_0xd23417)
                    /* Called:undefined | Scope Closed:true*/
                    {
                        console[_0xd23417] = function ()
                            /* Called:undefined | Scope Closed:false| writes:true*/
                            {
                                for (var _len = arguments.length, _0x1c750c = new Array(_len), _key = 0; _key < _len; _key++) {
                                    _0x1c750c[_key] = arguments[_key];
                                }
                                var _0x151217 = _0x1c750c.map(function (_0x2b8cdc)
                                    /* Called:undefined | Scope Closed:false| writes:true*/
                                    {
                                        if (_typeof(_0x2b8cdc) === 'object') {
                                            return JSON.stringify(_0x2b8cdc);
                                        } else {
                                            return _0x2b8cdc;
                                        }
                                    }).join(' ');
                                var _0x51a099 = {
                                    timestamp: new Date().toISOString(),
                                    message: _0x151217,
                                    source: 'console',
                                    level: LogLevel[_0xd23417.toUpperCase()] || LogLevel.INFO,
                                    hostname: _this4.hostname,
                                    pid: _this4.pid
                                };
                                _this4.logStream.write(_0x51a099);
                                Bun.write(Bun.stdout, new Array(_len) + '\n');
                            };
                    });
                _0x413342.forEach(function (_0x4c9159)
                    /* Called:undefined | Scope Closed:true*/
                    {
                        console[_0x4c9159] = function ()
                            /* Called:undefined | Scope Closed:false| writes:true*/
                            {
                                for (var _len2 = arguments.length, _0x2e634a = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                                    _0x2e634a[_key2] = arguments[_key2];
                                }
                                var _0x5c9328 = _0x2e634a.map(function (_0x1a9984)
                                    /* Called:undefined | Scope Closed:false| writes:true*/
                                    {
                                        if (_typeof(_0x1a9984) === 'object') {
                                            return JSON.stringify(_0x1a9984);
                                        } else {
                                            return _0x1a9984;
                                        }
                                    }).join(' ');
                                var _0x14d059 = {
                                    timestamp: new Date().toISOString(),
                                    message: _0x5c9328,
                                    source: 'console',
                                    level: LogLevel.ERROR,
                                    hostname: _this4.hostname,
                                    pid: _this4.pid
                                };
                                _this4.logStream.write(_0x14d059);
                                Bun.write(Bun.stderr, new Array(_len2) + '\n');
                            };
                    });
                return;
            }
            _0x1f706a.write = function (_0x5cf477, _0x36ae17, _0x2017ee)
                /* Called:undefined | Scope Closed:false| writes:false*/
                {
                    var _0x3d6ff9 = stripAnsi_new(_0x5cf477.toString());
                    var _0x3abce0 = {
                        timestamp: new Date().toISOString(),
                        message: _0x3d6ff9,
                        source: 'console',
                        level: _0xd11064,
                        hostname: _this4.hostname,
                        pid: _this4.pid
                    };
                    _this4.logStream.write(_0x3abce0);
                    if (_this4.enableConsoleOutput || !_this4.isStorageReady) {
                        _0x1ad25f.call(_0x1f706a, _0x5cf477, _0x36ae17, _0x2017ee);
                    } else if (_0x2017ee) {
                        _0x2017ee();
                    }
                };
        },
    flushLogs()
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            var _arguments = arguments;
            var _this5 = this;
            return _asyncToGenerator(_regeneratorRuntime().mark(function _callee() {
                var _0x3870d4;
                return _regeneratorRuntime().wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                        case 0:
                            if (_arguments.length > 0 && _arguments[0] !== undefined) {
                                _0x3870d4 = _arguments[0];
                            } else {
                                _0x3870d4 = 5000;
                            }
                            if (typeof _this5.storage.flushLogs !== 'function') {
                                _context.next = 10;
                                break;
                            }
                            _context.prev = 2;
                            _context.next = 5;
                            return Promise.race([
                                _this5.storage.flushLogs(),
                                new Promise(function (_0x529bf4, _0x40ff73) {
                                    return setTimeout(function () {
                                        return _0x40ff73(new Error('flushLogs timed out'));
                                    }, _0x3870d4);
                                })
                            ]);
                        case 5:
                            _context.next = 10;
                            break;
                        case 7:
                            _context.prev = 7;
                            _context.t0 = _context.catch(2);
                            console.error(_context.t0);
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
    logCustomMessage(_0x1aa0cd, _0x35012d, _0x4ea2e8, _0x13d995, _0x225b17)
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            var _0x931ea5 = {
                timestamp: _0x225b17 || new Date().toISOString(),
                message: _0x35012d,
                meta: _0x4ea2e8 || '{}',
                source: 'errsole',
                level: _0x1aa0cd,
                hostname: this.hostname,
                pid: this.pid,
                errsole_id: _0x13d995
            };
            try {
                new stream.Writable({
                    objectMode: true,
                    write(_0x4dfa05, _0x4f4f3c, _0x3b0a00)
                        /* Called:undefined | Scope Closed:true*/
                        {
                            setImmediate(_0x3b0a00);
                        }
                }).write(_0x931ea5);
                if (!this.enableConsoleOutput) {
                    return;
                }
                this.originalStdoutWrite.call(process.stdout, _0x35012d + '\n', 'utf8');
            } catch (_0x2624f3) {
                console.error(_0x2624f3);
            }
        }
};
logCollector.resetConsoleOutput = function ()
    /* Called:undefined | Scope Closed:false| writes:true*/
    {
        this.logStream.uncork();
        if (!this.enableConsoleOutput) {
            this.enableConsoleOutput = true;
            process.stdout.write = this.originalStdoutWrite;
            process.stderr.write = this.originalStderrWrite;
        }
    };
logCollector.setInitializationTimeout();
logCollector.createLogStream();
logCollector.logStream.cork();
logCollector.interceptLogs(LogLevel.INFO);
logCollector.interceptLogs(LogLevel.ERROR);
module.exports = logCollector;