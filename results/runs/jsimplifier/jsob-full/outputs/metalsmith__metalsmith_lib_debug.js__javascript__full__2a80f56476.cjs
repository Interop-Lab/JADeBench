'use strict';
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
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = function __commonJS(_0x1666e9, _0x51c0f0)
    /* Called:undefined | Scope Closed:true*/
    {
        return function _0x19187d()
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                if (!_0x51c0f0) {
                    _0x1666e9[Object.getOwnPropertyNames(_0x1666e9)[0]]((_0x51c0f0 = { exports: {} }).exports, _0x51c0f0);
                }
                return _0x51c0f0.exports;
            };
    };
var require_helpers = function _0x19187d()
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        if (!_0x51c0f0) {
            _0x1666e9[Object.getOwnPropertyNames(_0x1666e9)[0]]((_0x51c0f0 = { exports: {} }).exports, _0x51c0f0);
        }
        return _0x51c0f0.exports;
    };
var debug = require('debug');
var utf8 = require('is-utf8');
var _require_helpers = require_helpers();
var isString = _require_helpers.isString;
var streamLogHandler = function streamLogHandler(_0x2446c6)
    /* Called:undefined | Scope Closed:true*/
    {
        return function ()
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                var _require2;
                return _0x2446c6.write((_require2 = require('util')).format.apply(_require2, arguments) + '\n');
            };
    };
debug.log = function ()
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        var _require2;
        return _0x2446c6.write((_require2 = require('util')).format.apply(_require2, arguments) + '\n');
    };
var options = {};
var _0x331e72 = {
    get()
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            return debug.inspectOpts.colors;
        },
    set(_0x48005c)
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            debug.inspectOpts.colors = _0x48005c;
        }
};
var _0x3a1fc6 = {
    get()
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            return debug.log;
        },
    set(_0x1ac6a8)
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            debug.log = _0x1ac6a8;
        }
};
var _0x474dd6 = {
    colors: _0x331e72,
    handle: _0x3a1fc6
};
Object.defineProperties(options, _0x474dd6);
debug.formatters.b = function (_0x1837cf)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        if (_0x1837cf instanceof Buffer && utf8_new(_0x1837cf)) {
            return _0x1837cf.toString().slice(0, 200) + '...';
        }
        return _0x1837cf;
    };
function Debugger(_0x4de860)
    /*Scope Closed:false | writes:true*/
    {
        if (!_require_helpers.isString(_0x4de860)) {
            var _0x4f2624 = new Error('invalid debugger namespace "' + _0x4de860 + '"');
            _0x4f2624.code = 'invalid_debugger_namespace';
            throw _0x4f2624;
        }
        var _0x211f39 = debug_new(_0x4de860);
        _0x211f39.log = function ()
            /* Called:undefined | Scope Closed:false| writes:true*/
            {
                return options.handle.apply(options, arguments);
            };
        _0x211f39.color = 247;
        var _0x4e4365 = _0x211f39.extend('warn');
        _0x4e4365.color = 178;
        var _0x5b054f = _0x211f39.extend('info');
        _0x5b054f.color = 51;
        var _0x12a74e = _0x211f39.extend('error');
        _0x12a74e.color = 196;
        var _0x22dd47 = {
            warn: _0x4e4365,
            info: _0x5b054f,
            error: _0x12a74e
        };
        var _0x340f6a = Object.assign(_0x211f39, _0x22dd47);
        return _0x340f6a;
    }
function proxy(_0x1b39ad, _0x4d7bf2, _0x1e6b3f)
    /*Scope Closed:true*/
    {
        Object.defineProperty(_0x1b39ad, _0x1e6b3f, {
            get()
                /* Called:undefined | Scope Closed:false| writes:false*/
                {
                    return _0x4d7bf2[_0x1e6b3f];
                },
            set(_0x5857f1)
                /* Called:undefined | Scope Closed:false| writes:false*/
                {
                    _0x4d7bf2[_0x1e6b3f] = _0x5857f1;
                }
        });
    }
proxy(Debugger, options, 'handle');
proxy(Debugger, options, 'colors');
proxy(Debugger, debug, 'enabled');
proxy(Debugger, debug, 'enable');
proxy(Debugger, debug, 'disable');
var _0x411bab = {
    Debugger: Debugger,
    fileLogHandler: streamLogHandler
};
module.exports = _0x411bab;