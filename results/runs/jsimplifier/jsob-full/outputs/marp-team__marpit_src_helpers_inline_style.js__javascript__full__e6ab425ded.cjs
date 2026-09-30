'use strict';
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
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = function __export(_0x37b743, _0x33f710)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        for (var _0x1a7390 in _0x33f710) {
            Object.defineProperty(_0x37b743, _0x1a7390, {
                get: _0x33f710[_0x1a7390],
                enumerable: true
            });
        }
    };
var __copyProps = function __copyProps(_0x7e4eee, _0x4ade03, _0x11accc, _0x3efa67)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        if (_0x4ade03 && _typeof(_0x4ade03) === 'object' || typeof _0x4ade03 === 'function') {
            var _iterator = _createForOfIteratorHelper(Object.getOwnPropertyNames(_0x4ade03));
            var _step;
            try {
                var _loop = function _loop()
                    /* Called:undefined | Scope Closed:false| writes:false*/
                    {
                        var _0x55c8a8 = _step.value;
                        if (!__hasOwnProp.call(_0x7e4eee, _0x55c8a8) && _0x55c8a8 !== _0x11accc) {
                            Object.defineProperty(_0x7e4eee, _0x55c8a8, {
                                get()
                                    /* Called:undefined | Scope Closed:false| writes:false*/
                                    {
                                        return _0x4ade03[_0x55c8a8];
                                    },
                                enumerable: !(_0x3efa67 = Object.getOwnPropertyDescriptor(_0x4ade03, _0x55c8a8)) || _0x3efa67.enumerable
                            });
                        }
                    };
                for (_iterator.s(); !(_step = _iterator.n()).done;) {
                    _loop();
                }
            } catch (err) {
                _iterator.e(err);
            } finally {
                _iterator.f();
            }
        }
        return _0x7e4eee;
    };
var _0x294d0d = { value: true };
var __toCommonJS = function __toCommonJS(_0x3efdd5)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        return __copyProps(__defProp_new({}, '__esModule', _0x294d0d), _0x3efdd5);
    };
var inline_style_exports = {};
var _0x3a06fe = {
    default()
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            return InlineStyle;
        }
};
__export(inline_style_exports, _0x3a06fe);
module.exports = __copyProps(__defProp_new({}, '__esModule', _0x294d0d), _0x3efdd5);
var import_postcss = require('postcss');
var InlineStyle = /*@Info: Executed but got error: ReferenceError: _defineProperties is not defined*/
function ()
    /* Called:true | Scope Closed:false| writes:false*/
    {
        function _InlineStyle(_0x3a66a1)
            /*Scope Closed:false | writes:false*/
            {
                var _this = this;
                _classCallCheck(this, _InlineStyle);
                this.decls = {};
                if (_0x3a66a1) {
                    if (_0x3a66a1 instanceof _InlineStyle || typeof _0x3a66a1 === 'string') {
                        var _0x785a8e = { from: undefined };
                        var _0x3975c8 = import_postcss.parse(_0x3a66a1.toString(), _0x785a8e);
                        _0x3975c8.each(function (_0x394372)
                            /* Called:undefined | Scope Closed:false| writes:false*/
                            {
                                if (_0x394372.type === 'decl') {
                                    _this.decls[_0x394372.prop] = _0x394372.value;
                                }
                            });
                    } else {
                        var _0x91f8d0 = Object.assign({}, _0x3a66a1);
                        this.decls = _0x91f8d0;
                    }
                }
            }
        return _createClass(_InlineStyle, [
            {
                key: 'delete',
                value(_0x56466a) {
                    return this;
                }
            },
            {
                key: 'set',
                value(_0x4f57b4, _0x3dbba4) {
                    this.decls[_0x4f57b4] = _0x3dbba4;
                    return this;
                }
            },
            {
                key: 'toString',
                value() {
                    var _this2 = this;
                    var _0x9efb61 = '';
                    var _loop2 = function _loop2() {
                        var _0xe20177 = _Object$keys[_i];
                        var _0x27e120;
                        try {
                            _0x2cd937 = { from: undefined };
                            _0x27e120 = import_postcss.parse(_0xe20177 + ':' + _this2.decls[_0xe20177], _0x2cd937);
                        } catch (e) {
                            null;
                        }
                        if (_0x27e120) {
                            _0x27e120.each(function (_0x6f80b3) {
                                if (_0x6f80b3.type !== 'decl' || _0x6f80b3.prop !== _0xe20177) {
                                    _0x6f80b3.remove();
                                }
                            });
                            _0x9efb61 += _0x27e120.toString() + ';';
                        }
                    };
                    var _0x2cd937;
                    for (var _i = 0, _Object$keys = Object.keys(this.decls); _i < _Object$keys.length; _i++) {
                        _loop2();
                    }
                    return _0x9efb61;
                }
            }
        ]);
    }();