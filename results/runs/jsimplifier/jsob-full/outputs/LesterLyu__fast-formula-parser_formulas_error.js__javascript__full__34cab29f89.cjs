'use strict';
function _callSuper(t, o, e)
    /*Scope Closed:false | writes:false*/
    {
        o = _getPrototypeOf(o);
        return _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e));
    }
function _possibleConstructorReturn(t, e)
    /*Scope Closed:false | writes:false*/
    {
        if (e && (_typeof(e) == 'object' || typeof e == 'function')) {
            return e;
        }
        if (e !== undefined) {
            throw new TypeError('Derived constructors may only return object or undefined');
        }
        return _assertThisInitialized(t);
    }
function _assertThisInitialized(e)
    /*Scope Closed:true*/
    {
        if (e === undefined) {
            throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called');
        }
        return e;
    }
function _inherits(t, e)
    /*Scope Closed:false | writes:false*/
    {
        if (typeof e != 'function' && e !== null) {
            throw new TypeError('Super expression must either be null or a function');
        }
        t.prototype = Object.create(e && e.prototype, {
            constructor: {
                value: t,
                writable: true,
                configurable: true
            }
        });
        Object.defineProperty(t, 'prototype', { writable: false });
        if (e) {
            _setPrototypeOf(t, e);
        }
    }
function _wrapNativeSuper(t)
    /*Scope Closed:false | writes:false*/
    {
        var r = typeof Map == 'function' ? new Map() : undefined;
        var _wrapNativeSuper_new = function _wrapNativeSuper(t)
            /* Called:undefined | Scope Closed:false| writes:true*/
            {
                if (t === null || !_isNativeFunction(t)) {
                    return t;
                }
                if (typeof t != 'function') {
                    throw new TypeError('Super expression must either be null or a function');
                }
                if (r !== undefined) {
                    if (r.has(t)) {
                        return r.get(t);
                    }
                    r.set(t, Wrapper);
                }
                function Wrapper()
                    /*Scope Closed:false | writes:false*/
                    {
                        return _construct(t, arguments, _getPrototypeOf(this).constructor);
                    }
                Wrapper.prototype = Object.create(t.prototype, {
                    constructor: {
                        value: Wrapper,
                        enumerable: false,
                        writable: true,
                        configurable: true
                    }
                });
                return _setPrototypeOf(Wrapper, t);
            };
        return _wrapNativeSuper(t);
    }
function _construct(t, e, r)
    /*Scope Closed:false | writes:false*/
    {
        if (_isNativeReflectConstruct()) {
            return Reflect.construct.apply(null, arguments);
        }
        var o = [null];
        o.push.apply(o, e);
        var p = new (t.bind.apply(t, o))();
        if (r) {
            _setPrototypeOf(p, r.prototype);
        }
        return p;
    }
function _isNativeReflectConstruct()
    /*Scope Closed:false | writes:false*/
    {
        try {
            var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function ()
                /* Called:undefined | Scope Closed:true*/
                {
                }));
        } catch (t) {
        }
        return (_isNativeReflectConstruct = function _isNativeReflectConstruct() {
            return !!t;
        })();
    }
function _isNativeFunction(t)
    /*Scope Closed:false | writes:false*/
    {
        try {
            return Function.toString.call(t).indexOf('[native code]') !== -1;
        } catch (n) {
            return typeof t == 'function';
        }
    }
function _setPrototypeOf(t, e)
    /*Scope Closed:true*/
    {
        if (Object.setPrototypeOf) {
            _setPrototypeOf = Object.setPrototypeOf.bind();
        } else {
            var _setPrototypeOf_new = function _setPrototypeOf(t, e)
                /* Called:undefined | Scope Closed:true*/
                {
                    t.__proto__ = e;
                    return t;
                };
        }
        return _setPrototypeOf(t, e);
    }
function _getPrototypeOf(t)
    /*Scope Closed:true*/
    {
        if (Object.setPrototypeOf) {
            _getPrototypeOf = Object.getPrototypeOf.bind();
        } else {
            var _getPrototypeOf_new = function _getPrototypeOf(t)
                /* Called:undefined | Scope Closed:false| writes:false*/
                {
                    return t.__proto__ || Object.getPrototypeOf(t);
                };
        }
        return t.__proto__ || Object.getPrototypeOf(t);
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
function _classCallCheck(a, n)
    /*Scope Closed:true*/
    {
        if (!(a instanceof n)) {
            throw new TypeError('Cannot call a class as a function');
        }
    }
function _defineProperties(e, r)
    /*Scope Closed:true*/
    {
        for (var t = 0; t < r.length; t++) {
            var o = r[t];
            o.enumerable = o.enumerable || false;
            o.configurable = true;
            if ('value' in o) {
                o.writable = true;
            }
            Object.defineProperty(e, _toPropertyKey(o.key), o);
        }
    }
function _createClass(e, r, t)
    /*Scope Closed:false | writes:false*/
    {
        if (r) {
            _defineProperties(e.prototype, r);
        }
        if (t) {
            _defineProperties(e, t);
        }
        Object.defineProperty(e, 'prototype', { writable: false });
        return e;
    }
function _toPropertyKey(t)
    /*Scope Closed:false | writes:false*/
    {
        var i = _toPrimitive(t, 'string');
        if (_typeof(i) == 'symbol') {
            return i;
        } else {
            return i + '';
        }
    }
function _toPrimitive(t, r)
    /*Scope Closed:false | writes:false*/
    {
        if (_typeof(t) != 'object' || !t) {
            return t;
        }
        var e = t[Symbol.toPrimitive];
        if (e !== undefined) {
            var i = e.call(t, r || 'default');
            if (_typeof(i) != 'object') {
                return i;
            }
            throw new TypeError('@@toPrimitive must return a primitive value.');
        }
        return (r === 'string' ? String : Number)(t);
    }
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = function __commonJS(_0x2e5756, _0x449fe9)
    /* Called:undefined | Scope Closed:true*/
    {
        return function _0x273c3e()
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                if (!_0x449fe9) {
                    _0x2e5756[Object.getOwnPropertyNames(_0x2e5756)[0]]((_0x449fe9 = { exports: {} }).exports, _0x449fe9);
                }
                return _0x449fe9.exports;
            };
    };
var require_collection = function _0x273c3e()
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        if (!_0x449fe9) {
            _0x2e5756[Object.getOwnPropertyNames(_0x2e5756)[0]]((_0x449fe9 = { exports: {} }).exports, _0x449fe9);
        }
        return _0x449fe9.exports;
    };
var require_helpers = function _0x273c3e()
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        if (!_0x449fe9) {
            _0x2e5756[Object.getOwnPropertyNames(_0x2e5756)[0]]((_0x449fe9 = { exports: {} }).exports, _0x449fe9);
        }
        return _0x449fe9.exports;
    };
var require_error = function _0x273c3e()
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        if (!_0x449fe9) {
            _0x2e5756[Object.getOwnPropertyNames(_0x2e5756)[0]]((_0x449fe9 = { exports: {} }).exports, _0x449fe9);
        }
        return _0x449fe9.exports;
    };
module.exports = require_error();