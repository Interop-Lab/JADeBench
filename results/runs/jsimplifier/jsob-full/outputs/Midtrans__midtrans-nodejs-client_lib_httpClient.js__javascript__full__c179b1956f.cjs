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
function _classCallCheck(a, n)
    /*Scope Closed:true*/
    {
        if (!(a instanceof n)) {
            throw new TypeError('Cannot call a class as a function');
        }
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
var __commonJS = function __commonJS(_0x41e7ff, _0x4c72c8)
    /* Called:undefined | Scope Closed:true*/
    {
        return function _0x44c4a0()
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                if (!_0x4c72c8) {
                    _0x41e7ff[Object.getOwnPropertyNames(_0x41e7ff)[0]]((_0x4c72c8 = { exports: {} }).exports, _0x4c72c8);
                }
                return _0x4c72c8.exports;
            };
    };
var require_midtransError = function _0x44c4a0()
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        if (!_0x4c72c8) {
            _0x41e7ff[Object.getOwnPropertyNames(_0x41e7ff)[0]]((_0x4c72c8 = { exports: {} }).exports, _0x4c72c8);
        }
        return _0x4c72c8.exports;
    };
var axios = require('axios').default;
var querystring = require('querystring');
var MidtransError = require_midtransError();
var HttpClient = /*@Info: Executed but got error: ReferenceError: require_midtransError is not defined*/
function ()
    /* Called:true | Scope Closed:false| writes:false*/
    {
        function HttpClient(_0x156a32 = {})
            /*Scope Closed:false | writes:true*/
            {
                _classCallCheck(this, HttpClient);
                this.parent = _0x156a32;
                this.http_client = axios.create();
            }
        return _createClass(HttpClient, [{
                key: 'request',
                value(_0x390855, _0x1e3cd3, _0x54bfc1, _0x389dff = {}, _0x159d3a = {}) {
                    var _0x47e202 = {
                        'content-type': 'application/json',
                        accept: 'application/json',
                        'user-agent': 'midtransclient-nodejs/1.4.3'
                    };
                    var _0x8015bc = {};
                    var _0x3a3288 = {};
                    if (_0x390855.toLowerCase() == 'get') {
                        _0x3a3288 = _0x389dff;
                        _0x8015bc = _0x159d3a;
                    } else {
                        _0x8015bc = _0x389dff;
                        _0x3a3288 = _0x159d3a;
                    }
                    var _0x572801 = this;
                    return new Promise(function (_0x3a5266, _0x53ee42) {
                        if (typeof _0x8015bc === 'string' || _0x8015bc instanceof String) {
                            try {
                                _0x8015bc = JSON.parse(_0x8015bc);
                            } catch (_0x2011de) {
                                _0x53ee42(new MidtransError('fail to parse \'body parameters\' string as JSON. Use JSON string or Object as \'body parameters\'. with message: ' + _0x2011de));
                            }
                        }
                        if (typeof _0x3a3288 === 'string' || _0x3a3288 instanceof String) {
                            try {
                                _0x3a3288 = JSON.parse(_0x3a3288);
                            } catch (_0x24c2ac) {
                                _0x53ee42(new MidtransError('fail to parse \'query parameters\' string as JSON. Use JSON string or Object as \'query parameters\'. with message: ' + _0x24c2ac));
                            }
                        }
                        var _0xf65e7d = {
                            username: _0x1e3cd3,
                            password: ''
                        };
                        var _0x2a2685 = {
                            method: _0x390855,
                            headers: _0x47e202,
                            url: _0x54bfc1,
                            data: _0x8015bc,
                            params: _0x3a3288,
                            auth: _0xf65e7d
                        };
                        var _0x25d873 = _0x572801.http_client(_0x2a2685).then(function (_0x4a5d2c) {
                            if (_0x4a5d2c.data.hasOwnProperty('status_code') && _0x4a5d2c.data.status_code >= 400 && _0x4a5d2c.data.status_code != 407) {
                                _0x53ee42(new MidtransError('Midtrans API is returning API error. HTTP status code: ' + _0x4a5d2c.data.status_code + '. API response: ' + JSON.stringify(_0x4a5d2c.data), _0x4a5d2c.data.status_code, _0x4a5d2c.data, _0x4a5d2c));
                            }
                            _0x3a5266(_0x4a5d2c.data);
                        }).catch(function (_0x1438ef) {
                            var _0x4e0e81 = _0x1438ef.response;
                            if (typeof _0x4e0e81 !== 'undefined' && _0x4e0e81.status >= 400) {
                                _0x53ee42(new MidtransError('Midtrans API is returning API error. HTTP status code: ' + _0x4e0e81.status + '. API response: ' + JSON.stringify(_0x4e0e81.data), _0x4e0e81.status, _0x4e0e81.data, _0x4e0e81));
                            } else if (typeof _0x4e0e81 === 'undefined') {
                                _0x53ee42(new MidtransError('Midtrans API request failed. HTTP response not found, likely connection failure, with message: ' + JSON.stringify(_0x1438ef.message), null, null, _0x1438ef));
                            }
                            _0x53ee42(_0x1438ef);
                        });
                    });
                }
            }]);
    }();
module.exports = HttpClient;