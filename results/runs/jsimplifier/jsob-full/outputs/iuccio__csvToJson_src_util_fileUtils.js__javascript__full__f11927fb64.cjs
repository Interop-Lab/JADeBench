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
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = function __commonJS(_0x40f708, _0x5cb286)
    /* Called:undefined | Scope Closed:true*/
    {
        return function _0x20db50()
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                if (!_0x5cb286) {
                    _0x40f708[Object.getOwnPropertyNames(_0x40f708)[0]]((_0x5cb286 = { exports: {} }).exports, _0x5cb286);
                }
                return _0x5cb286.exports;
            };
    };
var require_errors = function _0x20db50()
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        if (!_0x5cb286) {
            _0x40f708[Object.getOwnPropertyNames(_0x40f708)[0]]((_0x5cb286 = { exports: {} }).exports, _0x5cb286);
        }
        return _0x5cb286.exports;
    };
var fs = require('fs');
var _require_errors = require_errors();
var FileOperationError = _require_errors.FileOperationError;
var ENCODED_FILE_ENCODINGS = new Set([
    'base64',
    'hex'
]);
var FileUtils = /*@Info: Executed but got error: ReferenceError: _defineProperties is not defined*/
function ()
    /* Called:true | Scope Closed:false| writes:false*/
    {
        function FileUtils()
            /*Scope Closed:false | writes:false*/
            {
                _classCallCheck(this, FileUtils);
            }
        return _createClass(FileUtils, [
            {
                key: '_isEncodedFile',
                value(_0x4d372f) {
                    return ENCODED_FILE_ENCODINGS.has(_0x4d372f);
                }
            },
            {
                key: '_decodeContent',
                value(_0x170e0a, _0x25625f) {
                    if (this._isEncodedFile(_0x25625f)) {
                        return Buffer.from(_0x170e0a, _0x25625f).toString('utf8');
                    }
                    return _0x170e0a;
                }
            },
            {
                key: '_toString',
                value(_0xe7fe10) {
                    if (typeof _0xe7fe10 === 'string') {
                        return _0xe7fe10;
                    } else {
                        return _0xe7fe10.toString();
                    }
                }
            },
            {
                key: '_wrapReadError',
                value(_0x48cfe8, _0x33431b) {
                    return new FileOperationError('read', _0x48cfe8, _0x33431b);
                }
            },
            {
                key: '_wrapWriteError',
                value(_0x3a16d7, _0x466b0c) {
                    return new FileOperationError('write', _0x3a16d7, _0x466b0c);
                }
            },
            {
                key: '_readFileSync',
                value(_0x36ff37, _0x417bb7) {
                    if (this._isEncodedFile(_0x417bb7)) {
                        var _0x14f4b3 = fs.readFileSync(_0x36ff37, 'utf8');
                        return this._decodeContent(_0x14f4b3, _0x417bb7);
                    }
                    return this._toString(fs.readFileSync(_0x36ff37, _0x417bb7));
                }
            },
            {
                key: 'readFile',
                value(_0x4f9302, _0x545526 = 'utf8') {
                    try {
                        return this._readFileSync(_0x4f9302, _0x545526);
                    } catch (_0x39f5de) {
                        throw this._wrapReadError(_0x4f9302, _0x39f5de);
                    }
                }
            },
            {
                key: '_readFileAsyncWithPromises',
                value(_0x59d20e, _0x1604e9) {
                    var _this8 = this;
                    if (this._isEncodedFile(_0x1604e9)) {
                        return fs.promises.readFile(_0x59d20e, 'utf8').then(function (_0x3faf6b) {
                            return _this8._decodeContent(_0x3faf6b, _0x1604e9);
                        });
                    }
                    return fs.promises.readFile(_0x59d20e, _0x1604e9).then(function (_0x2fe8c5) {
                        return _this8._toString(_0x2fe8c5);
                    });
                }
            },
            {
                key: 'readFileAsync',
                value(_0x389f4f) {
                    var _this9 = this;
                    var _0x3c0f0c = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'utf8';
                    if (fs.promises && typeof fs.promises.readFile === 'function') {
                        return this._readFileAsyncWithPromises(_0x389f4f, _0x3c0f0c).catch(function (_0x38c7c1) {
                            throw _this9._wrapReadError(_0x389f4f, _0x38c7c1);
                        });
                    }
                    return new Promise(function (_0x4f261e, _0x10d46a) {
                        var _0x256741 = function _0x256741(_0x432941, _0x20baca) {
                            if (_0x432941) {
                                _0x10d46a(_this9._wrapReadError(_0x389f4f, _0x432941));
                                return;
                            }
                            try {
                                var _0x1d18d3 = _this9._isEncodedFile(_0x3c0f0c) ? _this9._decodeContent(_this9._toString(_0x20baca), _0x3c0f0c) : _this9._toString(_0x20baca);
                                _0x4f261e(_0x1d18d3);
                            } catch (_0x4156bd) {
                                _0x10d46a(_this9._wrapReadError(_0x389f4f, _0x4156bd));
                            }
                        };
                        var _0x29bb0f = _this9._isEncodedFile(_0x3c0f0c) ? 'utf8' : _0x3c0f0c;
                        fs.readFile(_0x389f4f, _0x29bb0f, _0x256741);
                    });
                }
            },
            {
                key: '_writeFileSync',
                value(_0x64b906, _0x14a29e) {
                    fs.writeFileSync(_0x64b906, _0x14a29e, 'utf8');
                }
            },
            {
                key: '_writeFileAsyncWithPromises',
                value(_0x4a2205, _0x47e494) {
                    return fs.promises.writeFile(_0x4a2205, _0x47e494, 'utf8');
                }
            },
            {
                key: 'writeFile',
                value(_0xe06061, _0x3165ca) {
                    try {
                        this._writeFileSync(_0x3165ca, _0xe06061);
                    } catch (_0x38ce98) {
                        throw this._wrapWriteError(_0x3165ca, _0x38ce98);
                    }
                }
            },
            {
                key: 'writeFileAsync',
                value(_0x39d403, _0x37cff1) {
                    var _this0 = this;
                    if (fs.promises && typeof fs.promises.writeFile === 'function') {
                        return this._writeFileAsyncWithPromises(_0x37cff1, _0x39d403).catch(function (_0x1cdbd4) {
                            throw _this0._wrapWriteError(_0x37cff1, _0x1cdbd4);
                        });
                    }
                    return new Promise(function (_0x147627, _0x401887) {
                        fs.writeFile(_0x37cff1, _0x39d403, 'utf8', function (_0x462281) {
                            if (_0x462281) {
                                _0x401887(_this0._wrapWriteError(_0x37cff1, _0x462281));
                                return;
                            }
                            _0x147627();
                        });
                    });
                }
            }
        ]);
    }();
module.exports = new FileUtils();