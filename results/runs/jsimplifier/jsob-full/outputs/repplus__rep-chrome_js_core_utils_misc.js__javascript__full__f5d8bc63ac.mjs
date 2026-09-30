'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.decodeJWT = decodeJWT;
exports.renderDiff = renderDiff;
exports.testRegex = testRegex;
function _typeof(o) {
    '@babel/helpers - typeof';
    if (typeof Symbol == 'function' && typeof Symbol.iterator == 'symbol') {
        _typeof = function _typeof(o) {
            return typeof o;
        };
    } else {
        _typeof = function _typeof(o) {
            if (o && typeof Symbol == 'function' && o.constructor === Symbol && o !== Symbol.prototype) {
                return 'symbol';
            } else {
                return typeof o;
            }
        };
    }
    return _typeof(o);
}
function _regeneratorRuntime() {
    'use strict';
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
    var i = typeof Symbol == 'function' ? Symbol : {};
    var a = i.iterator || '@@iterator';
    var c = i.asyncIterator || '@@asyncIterator';
    var u = i.toStringTag || '@@toStringTag';
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
        define({}, '');
    } catch (t) {
        define = function define(t, e, r) {
            return t[e] = r;
        };
    }
    function wrap(t, e, r, n) {
        var i = e && e.prototype instanceof Generator ? e : Generator;
        var a = Object.create(i.prototype);
        var c = new Context(n || []);
        o_new(a, '_invoke', { value: makeInvokeMethod(t, r, c) });
        return a;
    }
    function tryCatch(t, e, r) {
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
    function Generator() {
    }
    function GeneratorFunction() {
    }
    function GeneratorFunctionPrototype() {
    }
    var p = {};
    define(p, a, function () {
        return this;
    });
    var d = Object.getPrototypeOf;
    var v = d && d_new(d_new(values([])));
    if (v && v !== r && n.call(v, a)) {
        p = v;
    }
    var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p);
    function defineIteratorMethods(t) {
        [
            'next',
            'throw',
            'return'
        ].forEach(function (e) {
            define(t, e, function (t) {
                return this._invoke(e, t);
            });
        });
    }
    function AsyncIterator(t, e) {
        function invoke(r, o, i, a) {
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
    function maybeInvokeDelegate(e, r) {
        var n = r.method;
        var o = e.iterator[n];
        if (o === t) {
            r.delegate = null;
            if (n !== 'throw' || !e.iterator.return || !(r.method = 'return', r.arg = t, maybeInvokeDelegate_new(e, r), r.method === 'throw')) {
                if (n !== 'return') {
                    r.method = 'throw';
                    r.arg = new TypeError('The iterator does not provide a \'' + n + '\' method');
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
    function pushTryEntry(t) {
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
    function resetTryEntry(t) {
        var e = t.completion || {};
        e.type = 'normal';
        delete e.arg;
        t.completion = e;
    }
    function Context(t) {
        this.tryEntries = [{ tryLoc: 'root' }];
        t.forEach(pushTryEntry, this);
        this.reset(true);
    }
    function values(e) {
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
    GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, 'GeneratorFunction');
    e.isGeneratorFunction = function (t) {
        var e = typeof t == 'function' && t.constructor;
        return !!e && (e === GeneratorFunction || (e.displayName || e.name) === 'GeneratorFunction');
    };
    e.mark = function (t) {
        if (Object.setPrototypeOf) {
            Object.setPrototypeOf(t, GeneratorFunctionPrototype);
        } else {
            t.__proto__ = GeneratorFunctionPrototype;
            define(t, u, 'GeneratorFunction');
        }
        t.prototype = Object.create(g);
        return t;
    };
    e.awrap = function (t) {
        return { __await: t };
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
    define(g, u, 'Generator');
    define(g, a, function () {
        return this;
    });
    define(g, 'toString', function () {
        return '[object Generator]';
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
        stop() {
            this.done = true;
            var t = this.tryEntries[0].completion;
            if (t.type === 'throw') {
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
                var i = this.tryEntries[o];
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
                        if (!u) {
                            throw Error('try statement without catch or finally');
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
        complete(t, e) {
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
                    if (n.type === 'throw') {
                        var o = n.arg;
                        resetTryEntry(r);
                    }
                    return o;
                }
            }
            throw Error('illegal catch attempt');
        },
        delegateYield(e, r, n) {
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
                asyncGeneratorStep(a, r, o, _next, _throw, 'next', n);
            }
            function _throw(n) {
                asyncGeneratorStep(a, r, o, _next, _throw, 'throw', n);
            }
            _next(undefined);
        });
    };
}
function escapeHtml(_0x1b3fbb) {
    var _0x59a1aa = document.createElement('div');
    _0x59a1aa.textContent = _0x1b3fbb;
    return _0x59a1aa.innerHTML;
}
function escapeCsvField(_0x262cea) {
    if (_0x262cea == null) {
        return '';
    }
    var _0xf48289 = String(_0x262cea);
    if (_0xf48289.includes(',') || _0xf48289.includes('"') || _0xf48289.includes('\n') || _0xf48289.includes('\r')) {
        return '"' + _0xf48289.replace(/"/g, '""') + '"';
    }
    return _0xf48289;
}
function arrayToCSV(_0x55a5a1, _0x4b774c) {
    if (!_0x55a5a1 || _0x55a5a1.length === 0) {
        if (_0x4b774c) {
            return _0x4b774c.join(',');
        } else {
            return '';
        }
    }
    var _0xe54ab8 = _0x4b774c || Object.keys(_0x55a5a1[0]);
    var _0x223b86 = [_0xe54ab8.map(escapeCsvField).join(',')];
    _0x55a5a1.forEach(function (_0x31752b) {
        var _0x3e4b1f = _0xe54ab8.map(function (_0x325b16) {
            var _0x12d801 = _0x31752b[_0x325b16];
            return escapeCsvField(_0x12d801);
        });
        _0x223b86.push(_0x3e4b1f.join(','));
    });
    return _0x223b86.join('\n');
}
function downloadCSV(_0x4cb56a, _0x353f67, _0x1963d1 = null) {
    var _0x4423b5 = arrayToCSV(_0x4cb56a, _0x1963d1);
    var _0x12abb6 = new Blob([_0x4423b5], { type: 'text/csv;charset=utf-8;' });
    var _0x543e59 = URL.createObjectURL(_0x12abb6);
    var _0x3a7e2b = document.createElement('a');
    _0x3a7e2b.href = _0x543e59;
    _0x3a7e2b.download = _0x353f67;
    document.body.appendChild(_0x3a7e2b);
    _0x3a7e2b.click();
    document.body.removeChild(_0x3a7e2b);
    URL.revokeObjectURL(_0x543e59);
}
function downloadJSON(_0x4ac812, _0x11c109) {
    var _0x676e7f = JSON.stringify(_0x4ac812, null, 2);
    var _0x579367 = new Blob([_0x676e7f], { type: 'application/json;charset=utf-8;' });
    var _0x43c210 = URL.createObjectURL(_0x579367);
    var _0xd8505 = document.createElement('a');
    _0xd8505.href = _0x43c210;
    _0xd8505.download = _0x11c109;
    document.body.appendChild(_0xd8505);
    _0xd8505.click();
    document.body.removeChild(_0xd8505);
    URL.revokeObjectURL(_0x43c210);
}
function copyToClipboard(_x, _x2) {
    return _copyToClipboard.apply(this, arguments);
}
function _copyToClipboard() {
    _copyToClipboard = _asyncToGenerator(_regeneratorRuntime().mark(function _callee(_0x1bb6c9, _0x42f528) {
        var _0x17c812;
        var _0x5dfcff;
        var _0xc0abd4;
        var _0x42cb97;
        var _0x3096c5;
        var _0x5eeb0c;
        var _0x49750d;
        var _0xef2573;
        var _0x1e2571;
        var _0x575694;
        var _0x39393d;
        var _0x34abdf;
        var _0x18d203;
        return _regeneratorRuntime().wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                case 0:
                    _0x17c812 = {
                        yTJFV(_0x17f570, _0x289ec9) {
                            return _0x17f570(_0x289ec9);
                        },
                        fPJwI(_0x527d4c, _0x4167c8) {
                            return _0x527d4c === _0x4167c8;
                        },
                        iJnkz(_0x17629f, _0x33f297) {
                            return _0x17629f - _0x33f297;
                        },
                        VaKzh(_0x42abc2, _0x5be239) {
                            return _0x42abc2(_0x5be239);
                        },
                        JbOYW(_0x15ca9e, _0x56ec6a) {
                            return _0x15ca9e(_0x56ec6a);
                        },
                        eKFbd: 'Invalid JWT format. Expected format: header.payload.signature',
                        kCEkn(_0x53374e, _0x346c8a) {
                            return _0x53374e(_0x346c8a);
                        },
                        iNKPr(_0x1b120d, _0x31dcf7) {
                            return _0x1b120d(_0x31dcf7);
                        },
                        dzfrI: 'application/json;charset=utf-8;',
                        wDvdP(_0x3038eb, _0x447118) {
                            return _0x3038eb + _0x447118;
                        },
                        SVJFG(_0x5edb8a, _0x2857f2) {
                            return _0x5edb8a !== _0x2857f2;
                        },
                        kJEIL: 'KsYNv',
                        pwmxx: 'Vbser',
                        zRjlf: 'URwbm',
                        cSwVY: 'QQhPv',
                        Ybpbe: 'permissions policy',
                        lqhOb: 'Permissions policy',
                        USwrw: 'Clipboard API failed, trying fallback:',
                        RKylY(_0x53e7bb, _0xcfed8e) {
                            return _0x53e7bb === _0xcfed8e;
                        },
                        pBbAI: 'devtools:',
                        rUEeM(_0x3c5311, _0x57ee64) {
                            return _0x3c5311 !== _0x57ee64;
                        },
                        skDer: 'SAlBP',
                        ofuOK(_0x15953c, _0xbdd072) {
                            return _0x15953c === _0xbdd072;
                        },
                        RgzPe: 'ELdkq',
                        MvmMl: 'Xmwwi',
                        xHiey(_0xf57d27, _0x1b7df4) {
                            return _0xf57d27(_0x1b7df4);
                        },
                        EjTUk: 'oqmwb',
                        EfPSz: 'CKtTI',
                        FvhQQ(_0x508b52, _0x3889cd) {
                            return _0x508b52 === _0x3889cd;
                        },
                        IzSNa: 'acUJf',
                        iyNhr: 'jZIzI',
                        RJkSi: 'textarea',
                        PpLhM: 'fixed',
                        dfABN: '-9999px',
                        aPbyD: 'none',
                        bAHvv: 'copy',
                        hvdvl(_0x38c885, _0x6fcb41) {
                            return _0x38c885 !== _0x6fcb41;
                        },
                        KUhQZ: 'EKKLO',
                        drEvD(_0x1937ac, _0x589193) {
                            return _0x1937ac !== _0x589193;
                        },
                        ihDuG: 'iaPEC',
                        EowdL: 'dAVkR',
                        wGBnV(_0x155285, _0x180f91) {
                            return _0x155285(_0x180f91);
                        },
                        JRbLl: 'EVMIN',
                        pmjxp: 'execCommand copy failed',
                        qOHXE: 'JSQel',
                        lfkTd: 'Copy to clipboard failed:',
                        EpHLs(_0x547e03, _0x58b136) {
                            return _0x547e03 !== _0x58b136;
                        },
                        pAOMl: 'yjExL',
                        lAWTr: '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="#f28b82"/></svg>',
                        mNjOF(_0x451528, _0x33bbd1, _0x5beb54) {
                            return _0x451528(_0x33bbd1, _0x5beb54);
                        }
                    };
                    _0x5dfcff = _0x17c812.RKylY(window.location.protocol, _0x17c812.pBbAI);
                    if (_0x5dfcff) {
                        _context.next = 27;
                        break;
                    }
                    if (!_0x17c812.rUEeM(_0x17c812.skDer, _0x17c812.skDer)) {
                        _context.next = 7;
                        break;
                    }
                    _0x17c812.yTJFV(_0x4bd861, _0x161199);
                    _context.next = 27;
                    break;
                case 7:
                    _context.prev = 7;
                    if (!_0x17c812.ofuOK(_0x17c812.RgzPe, _0x17c812.MvmMl)) {
                        _context.next = 14;
                        break;
                    }
                    if (!_0x17c812.fPJwI(_0xae9210, _0x17c812.iJnkz(_0x389534.length, 1)) || !_0x17c812.fPJwI(_0x197fad, '')) {
                        _context.next = 11;
                        break;
                    }
                    return _context.abrupt('return');
                case 11:
                    if (_0x58133d.added) {
                        _0x5659ae += '<div class="diff-add">+ ' + _0x17c812.yTJFV(_0x4d4f6a, _0x340524) + '</div>';
                    } else if (_0x34b8c7.removed) {
                        _0x159ece += '<div class="diff-remove">- ' + _0x17c812.VaKzh(_0x3a21fa, _0x320e6f) + '</div>';
                    } else {
                        _0x3e82d9 += '<div>  ' + _0x17c812.JbOYW(_0x373898, _0x2176c9) + '</div>';
                    }
                    _context.next = 18;
                    break;
                case 14:
                    _context.next = 16;
                    return navigator.clipboard.writeText(_0x1bb6c9);
                case 16:
                    if (_0x42f528) {
                        _0x17c812.xHiey(showCopySuccess, _0x42f528);
                    }
                    return _context.abrupt('return');
                case 18:
                    _context.next = 27;
                    break;
                case 20:
                    _context.prev = 20;
                    _context.t0 = _context.catch(7);
                    if (!_0x17c812.rUEeM(_0x17c812.EjTUk, _0x17c812.EfPSz)) {
                        _context.next = 26;
                        break;
                    }
                    if (!(((_context.t0 != null ? undefined : _context.t0.message) != null ? undefined : (_context.t0 != null ? undefined : _context.t0.message).includes) != null ? undefined : ((_context.t0 != null ? undefined : _context.t0.message) != null ? undefined : (_context.t0 != null ? undefined : _context.t0.message).includes)(_0x17c812 != null ? undefined : _0x17c812.Ybpbe)) && !(((_context.t0 != null ? undefined : _context.t0.message) != null ? undefined : (_context.t0 != null ? undefined : _context.t0.message).includes) != null ? undefined : ((_context.t0 != null ? undefined : _context.t0.message) != null ? undefined : (_context.t0 != null ? undefined : _context.t0.message).includes)(_0x17c812 != null ? undefined : _0x17c812.lqhOb))) {
                        console.warn(_0x17c812.USwrw, _context.t0);
                    }
                    _context.next = 27;
                    break;
                case 26:
                    throw new _0x3487f9(_0x17c812.eKFbd);
                case 27:
                    _context.prev = 27;
                    if (!_0x17c812.FvhQQ(_0x17c812.IzSNa, _0x17c812.iyNhr)) {
                        _context.next = 33;
                        break;
                    }
                    _0xc0abd4 = _0x85cfce.map(function (_0x1b3593) {
                        var _0x443a99 = _0x36c6b7[_0x1b3593];
                        return WzhyEq.kCEkn(_0x24990a, _0x443a99);
                    });
                    _0x8290c7.push(_0xc0abd4.join(','));
                    _context.next = 74;
                    break;
                case 33:
                    _0x42cb97 = document.createElement(_0x17c812.RJkSi);
                    _0x42cb97.value = _0x1bb6c9;
                    _0x42cb97.style.position = _0x17c812.PpLhM;
                    _0x42cb97.style.left = _0x17c812.dfABN;
                    _0x42cb97.style.top = '0';
                    _0x42cb97.style.opacity = '0';
                    _0x42cb97.style.pointerEvents = _0x17c812.aPbyD;
                    document.body.appendChild(_0x42cb97);
                    _0x42cb97.focus();
                    _0x42cb97.select();
                    if (navigator.userAgent.match(/ipad|iphone/i)) {
                        _0x3096c5 = document.createRange();
                        _0x3096c5.selectNodeContents(_0x42cb97);
                        _0x5eeb0c = window.getSelection();
                        _0x5eeb0c.removeAllRanges();
                        _0x5eeb0c.addRange(_0x3096c5);
                        _0x42cb97.setSelectionRange(0, 999999);
                    }
                    _0x49750d = document.execCommand(_0x17c812.bAHvv);
                    document.body.removeChild(_0x42cb97);
                    if (!_0x49750d) {
                        _context.next = 59;
                        break;
                    }
                    if (!_0x17c812.hvdvl(_0x17c812.KUhQZ, _0x17c812.KUhQZ)) {
                        _context.next = 51;
                        break;
                    }
                    _0x3f2cf9 += '<div class="diff-add">+ ' + _0x17c812.iNKPr(_0x237483, _0x40dcfe) + '</div>';
                    _context.next = 57;
                    break;
                case 51:
                    if (!_0x42f528) {
                        _context.next = 57;
                        break;
                    }
                    if (!_0x17c812.drEvD(_0x17c812.ihDuG, _0x17c812.EowdL)) {
                        _context.next = 56;
                        break;
                    }
                    _0x17c812.wGBnV(showCopySuccess, _0x42f528);
                    _context.next = 57;
                    break;
                case 56:
                    return _context.abrupt('return', '"' + _0x4c5811.replace(/"/g, '""') + '"');
                case 57:
                    _context.next = 74;
                    break;
                case 59:
                    if (!_0x17c812.ofuOK(_0x17c812.JRbLl, _0x17c812.JRbLl)) {
                        _context.next = 63;
                        break;
                    }
                    throw new Error(_0x17c812.pmjxp);
                case 63:
                    _0xef2573 = _0x1b9ce6.stringify(_0x254729, null, 2);
                    _0x1e2571 = { type: WzhyEq.dzfrI };
                    _0x575694 = new _0x265372([_0xef2573], _0x1e2571);
                    _0x39393d = _0x51f6d7.createObjectURL(_0x575694);
                    _0x34abdf = _0x1628a3.createElement('a');
                    _0x34abdf.href = _0x39393d;
                    _0x34abdf.download = _0x42512b;
                    _0x1df329.body.appendChild(_0x34abdf);
                    _0x34abdf.click();
                    _0x14e983.body.removeChild(_0x34abdf);
                    _0x4998b9.revokeObjectURL(_0x39393d);
                case 74:
                    _context.next = 79;
                    break;
                case 76:
                    _context.prev = 76;
                    _context.t1 = _context.catch(27);
                    if (_0x17c812.ofuOK(_0x17c812.qOHXE, _0x17c812.qOHXE)) {
                        console.error(_0x17c812.lfkTd, _context.t1);
                        if (_0x42f528) {
                            if (_0x17c812.EpHLs(_0x17c812.pAOMl, _0x17c812.pAOMl)) {
                                if (_0x4a1b96) {
                                    _0x5353a7.innerHTML = _0x15f4a0;
                                }
                            } else {
                                _0x18d203 = _0x42f528.innerHTML;
                                _0x42f528.innerHTML = _0x17c812.lAWTr;
                                _0x17c812.mNjOF(setTimeout, function () {
                                    var _0x127130 = {
                                        TTaba(_0x3a3438, _0x3ff497) {
                                            return _0x17c812.wDvdP(_0x3a3438, _0x3ff497);
                                        },
                                        yIQTK(_0x429b82, _0x23e492) {
                                            return _0x17c812.yTJFV(_0x429b82, _0x23e492);
                                        }
                                    };
                                    if (_0x17c812.SVJFG(_0x17c812.kJEIL, _0x17c812.pwmxx)) {
                                        if (_0x42f528) {
                                            if (_0x17c812.SVJFG(_0x17c812.zRjlf, _0x17c812.cSwVY)) {
                                                _0x42f528.innerHTML = _0x18d203;
                                            } else {
                                                _0x2a9c8c += '<div class="diff-remove">- ' + _0x17c812.VaKzh(_0x3d7968, _0x4ea5eb) + '</div>';
                                            }
                                        }
                                    } else {
                                        var _0x17552d = _0x31f92a.substring(0, _0x549cd0);
                                        var _0x38619d = _0x5a8ac0.substring(_0x127130.TTaba(_0x19a921, 1));
                                        return '<span class="cookie-key">' + _0x127130.yIQTK(_0x24cf07, _0x17552d) + '</span>=<span class="cookie-value">' + _0x127130.yIQTK(_0x478241, _0x38619d) + '</span>';
                                    }
                                }, 1500);
                            }
                        }
                    } else if (!(((_0x31e1c1 != null ? undefined : _0x31e1c1.message) != null ? undefined : (_0x31e1c1 != null ? undefined : _0x31e1c1.message).includes) != null ? undefined : ((_0x31e1c1 != null ? undefined : _0x31e1c1.message) != null ? undefined : (_0x31e1c1 != null ? undefined : _0x31e1c1.message).includes)(_0x17c812 != null ? undefined : _0x17c812.Ybpbe)) && !(((_0x5e5f9f != null ? undefined : _0x5e5f9f.message) != null ? undefined : (_0x5e5f9f != null ? undefined : _0x5e5f9f.message).includes) != null ? undefined : ((_0x5e5f9f != null ? undefined : _0x5e5f9f.message) != null ? undefined : (_0x5e5f9f != null ? undefined : _0x5e5f9f.message).includes)(_0x17c812 != null ? undefined : _0x17c812.lqhOb))) {
                        _0x18164b.warn(_0x17c812.USwrw, _0x13ee46);
                    }
                case 79:
                case 'end':
                    return _context.stop();
                }
            }
        }, _callee, null, [
            [
                7,
                20
            ],
            [
                27,
                76
            ]
        ]);
    }));
    return _copyToClipboard.apply(this, arguments);
}
function showCopySuccess(_0x29e071) {
    if (!_0x29e071) {
        return;
    }
    var _0x55b6bc = _0x29e071.innerHTML;
    _0x29e071.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="#81c995"/></svg>';
    setTimeout(function () {
        if (_0x29e071) {
            _0x29e071.innerHTML = _0x55b6bc;
        }
    }, 1500);
}
function getHostname(_0x4bcbd2) {
    try {
        var _0x2030b5 = new URL(_0x4bcbd2);
        return _0x2030b5.hostname;
    } catch (_0x4a8ce1) {
        return 'unknown';
    }
}
function highlightHTTP(_0x4e79f7) {
    if (!_0x4e79f7) {
        return '';
    }
    var _0x122ad4 = _0x4e79f7.split('\n');
    var _0x21711c = false;
    var _0x1b4fa6 = -1;
    var _0x3ef08f = _0x122ad4[0] && _0x122ad4[0].toUpperCase().startsWith('HTTP/');
    for (var _0x507221 = 0; _0x507221 < _0x122ad4.length; _0x507221++) {
        if (_0x122ad4[_0x507221].trim() === '') {
            _0x21711c = true;
            _0x1b4fa6 = _0x507221;
            break;
        }
    }
    var _0x2bd900 = '';
    for (var _0x245efa = 0; _0x245efa < _0x122ad4.length; _0x245efa++) {
        var _0x254bae = _0x122ad4[_0x245efa];
        if (_0x245efa === 0) {
            var _0x14e999 = _0x254bae.indexOf(' ');
            if (_0x14e999 > -1) {
                var _0x5428fb = _0x254bae.substring(0, _0x14e999);
                var _0x3af818 = _0x254bae.substring(_0x14e999 + 1);
                _0x2bd900 += '<span class="http-method">' + escapeHtml(_0x5428fb) + '</span> ';
                var _0x3edc55 = _0x3af818;
                var _0x4e9d49 = '';
                var _0x3a0dc2 = /(\s*HTTP\/\d+(\.\d+)?|\s+([hH]\d+|QUIC))$/i;
                var _0x233e47 = _0x3af818.match(_0x3a0dc2);
                if (_0x233e47) {
                    _0x3edc55 = _0x3af818.substring(0, _0x233e47.index);
                    _0x4e9d49 = _0x3af818.substring(_0x233e47.index);
                }
                var _0x52df78 = _0x3edc55.indexOf('?');
                if (_0x52df78 > -1) {
                    _0x2bd900 += '<span class="http-path">' + escapeHtml(_0x3edc55.substring(0, _0x52df78)) + '</span>?';
                    _0x2bd900 += highlightParams(_0x3edc55.substring(_0x52df78 + 1));
                } else {
                    _0x2bd900 += '<span class="http-path">' + escapeHtml(_0x3edc55) + '</span>';
                }
                if (_0x4e9d49) {
                    _0x2bd900 += '<span class="http-version">' + escapeHtml(_0x4e9d49) + '</span>';
                }
            } else {
                _0x2bd900 += escapeHtml(_0x254bae);
            }
        } else if (!_0x21711c || _0x245efa < _0x1b4fa6) {
            var _0x5e063e = _0x254bae.indexOf(':');
            if (_0x5e063e > 0) {
                var _0x1c9e1a = _0x254bae.substring(0, _0x5e063e);
                var _0x2817d4 = _0x254bae.substring(_0x5e063e + 1);
                _0x2bd900 += '<span class="http-header-name">' + escapeHtml(_0x1c9e1a) + '</span>';
                _0x2bd900 += '<span class="http-colon">:</span>';
                if (_0x1c9e1a.trim().toLowerCase() === 'cookie') {
                    _0x2bd900 += highlightCookies(_0x2817d4);
                } else {
                    _0x2bd900 += '<span class="http-header-value">' + escapeHtml(_0x2817d4) + '</span>';
                }
            } else {
                _0x2bd900 += escapeHtml(_0x254bae);
            }
        } else if (_0x245efa === _0x1b4fa6) {
            _0x2bd900 += '';
        } else {
            var _0x54ab77 = _0x122ad4.slice(_0x1b4fa6 + 1).join('\n');
            var _0x27db50 = highlightJSON(_0x54ab77);
            if (!_0x3ef08f && _0x27db50 === escapeHtml(_0x54ab77)) {
                _0x27db50 = highlightParams(_0x54ab77);
            }
            _0x2bd900 += _0x27db50;
            break;
        }
        if (_0x245efa < _0x122ad4.length - 1) {
            _0x2bd900 += '\n';
        }
    }
    return _0x2bd900;
}
function highlightJSON(_0x20295f) {
    try {
        JSON.parse(_0x20295f);
        return _0x20295f.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (_0x514fe5) {
            var _0x5dad0a = 'json-number';
            if (/^"/.test(_0x514fe5)) {
                if (/:$/.test(_0x514fe5)) {
                    _0x5dad0a = 'json-key';
                } else {
                    _0x5dad0a = 'json-string';
                }
            } else if (/true|false/.test(_0x514fe5)) {
                _0x5dad0a = 'json-boolean';
            } else if (/null/.test(_0x514fe5)) {
                _0x5dad0a = 'json-null';
            }
            return '<span class="' + _0x5dad0a + '">' + escapeHtml(_0x514fe5) + '</span>';
        });
    } catch (_0x5dc7bf) {
        return escapeHtml(_0x20295f);
    }
}
function highlightParams(_0x468ba5) {
    if (_0x468ba5.trim().startsWith('<')) {
        return escapeHtml(_0x468ba5);
    }
    if (_0x468ba5.indexOf('=') === -1) {
        return escapeHtml(_0x468ba5);
    }
    return _0x468ba5.split('&').map(function (_0x382786) {
        var _0x2fc0d2 = _0x382786.indexOf('=');
        if (_0x2fc0d2 > -1) {
            var _0x207e57 = _0x382786.substring(0, _0x2fc0d2);
            var _0x25b5e6 = _0x382786.substring(_0x2fc0d2 + 1);
            return '<span class="param-key">' + escapeHtml(_0x207e57) + '</span>=<span class="param-value">' + escapeHtml(_0x25b5e6) + '</span>';
        } else {
            return escapeHtml(_0x382786);
        }
    }).join('&');
}
function highlightCookies(_0x502ae5) {
    return _0x502ae5.split(';').map(function (_0x3b561e) {
        var _0xe5267 = _0x3b561e.indexOf('=');
        if (_0xe5267 > -1) {
            var _0x4d871c = _0x3b561e.substring(0, _0xe5267);
            var _0x3f0bb5 = _0x3b561e.substring(_0xe5267 + 1);
            return '<span class="cookie-key">' + escapeHtml(_0x4d871c) + '</span>=<span class="cookie-value">' + escapeHtml(_0x3f0bb5) + '</span>';
        } else {
            return escapeHtml(_0x3b561e);
        }
    }).join(';');
}
function testRegex(_0x385f68, _0x55e1b8) {
    try {
        var _0x121663 = new RegExp(_0x385f68);
        return _0x121663.test(_0x55e1b8);
    } catch (_0x5dc756) {
        return false;
    }
}
function decodeJWT(_0x13e908) {
    try {
        var _0x4e67a6 = function _0x4e67a6(_0x52d62a) {
            _0x52d62a = _0x52d62a.replace(/-/g, '+').replace(/_/g, '/');
            while (_0x52d62a.length % 4) {
                _0x52d62a += '=';
            }
            try {
                var _0x5e3eb0 = atob(_0x52d62a);
                return decodeURIComponent(_0x5e3eb0.split('').map(function (_0x41072b) {
                    return '%' + ('00' + _0x41072b.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
            } catch (_0x36e2e7) {
                throw new Error('Failed to decode base64: ' + _0x36e2e7.message);
            }
        };
        _0x13e908 = _0x13e908.trim();
        var _0x274721 = _0x13e908.split('.');
        if (_0x274721.length !== 3) {
            throw new Error('Invalid JWT format. Expected format: header.payload.signature');
        }
        var _0x33a51a;
        try {
            var _0x435a13 = _0x4e67a6(_0x274721[0]);
            _0x33a51a = JSON.parse(_0x435a13);
        } catch (_0x296b3b) {
            throw new Error('Failed to decode JWT header: ' + _0x296b3b.message);
        }
        var _0x474fa8;
        try {
            var _0x4a52d1 = _0x4e67a6(_0x274721[1]);
            _0x474fa8 = JSON.parse(_0x4a52d1);
        } catch (_0x14c456) {
            throw new Error('Failed to decode JWT payload: ' + _0x14c456.message);
        }
        var _0x49d77b = 'JWT Decoded:\n\n';
        _0x49d77b += '=== HEADER ===\n';
        _0x49d77b += JSON.stringify(_0x33a51a, null, 2);
        _0x49d77b += '\n\n=== PAYLOAD ===\n';
        _0x49d77b += JSON.stringify(_0x474fa8, null, 2);
        _0x49d77b += '\n\n=== SIGNATURE ===\n';
        _0x49d77b += _0x274721[2] + '\n';
        _0x49d77b += '(Signature verification not performed)';
        if (_0x474fa8.exp) {
            var _0x4fcf8f = new Date(_0x474fa8.exp * 1000);
            var _0x5eccc0 = new Date();
            var _0x34c406 = _0x4fcf8f < _0x5eccc0;
            _0x49d77b += '\n\n=== TOKEN INFO ===\n';
            _0x49d77b += 'Expiration: ' + _0x4fcf8f.toISOString() + '\n';
            _0x49d77b += 'Status: ' + (_0x34c406 ? 'EXPIRED' : 'VALID') + '\n';
            if (_0x34c406) {
                _0x49d77b += 'Expired ' + Math.floor((_0x5eccc0 - _0x4fcf8f) / 1000 / 60) + ' minutes ago';
            } else {
                _0x49d77b += 'Expires in ' + Math.floor((_0x4fcf8f - _0x5eccc0) / 1000 / 60) + ' minutes';
            }
        }
        return _0x49d77b;
    } catch (_0xa270ab) {
        throw new Error('JWT decode failed: ' + _0xa270ab.message);
    }
}
function renderDiff(_0x53795b, _0x547d94) {
    if (typeof Diff === 'undefined') {
        return highlightHTTP(_0x547d94);
    }
    var _0x583b6c = Diff.diffLines(_0x53795b, _0x547d94);
    var _0x580e1d = '<pre style="margin: 0; padding: 10px; font-family: monospace; font-size: 12px; line-height: 1.5;">';
    _0x583b6c.forEach(function (_0x3e5d70) {
        var _0x4cf262 = _0x3e5d70.value.split('\n');
        _0x4cf262.forEach(function (_0x366649, _0x2b6ac9) {
            if (_0x2b6ac9 === _0x4cf262.length - 1 && _0x366649 === '') {
                return;
            }
            if (_0x3e5d70.added) {
                _0x580e1d += '<div class="diff-add">+ ' + escapeHtml(_0x366649) + '</div>';
            } else if (_0x3e5d70.removed) {
                _0x580e1d += '<div class="diff-remove">- ' + escapeHtml(_0x366649) + '</div>';
            } else {
                _0x580e1d += '<div>  ' + escapeHtml(_0x366649) + '</div>';
            }
        });
    });
    _0x580e1d += '</pre>';
    return _0x580e1d;
}