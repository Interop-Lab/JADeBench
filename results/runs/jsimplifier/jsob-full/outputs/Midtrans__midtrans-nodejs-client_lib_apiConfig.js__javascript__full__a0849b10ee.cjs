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
var _ = require('lodash');
var _0x184802 = {
    isProduction: false,
    serverKey: '',
    clientKey: ''
};
var ApiConfig = /*@Info: Executed but got error: ReferenceError: _defineProperties is not defined*/
function ()
    /* Called:true | Scope Closed:false| writes:false*/
    {
        function _ApiConfig(_0x3c0507 = _0x184802)
            /*Scope Closed:false | writes:false*/
            {
                _classCallCheck(this, _ApiConfig);
                this.isProduction = false;
                this.serverKey = '';
                this.clientKey = '';
                this.set(_0x3c0507);
            }
        return _createClass(_ApiConfig, [
            {
                key: 'get',
                value() {
                    var _0x4173b5 = {
                        isProduction: this.isProduction,
                        serverKey: this.serverKey,
                        clientKey: this.clientKey
                    };
                    var _0x463d40 = _0x4173b5;
                    return _0x463d40;
                }
            },
            {
                key: 'set',
                value(_0x4992f0) {
                    var _0x5a1668 = {
                        isProduction: this.isProduction,
                        serverKey: this.serverKey,
                        clientKey: this.clientKey
                    };
                    var _0x4a6e48 = _0x5a1668;
                    var _0x22a269 = _.pick(_0x4992f0, [
                        'isProduction',
                        'serverKey',
                        'clientKey'
                    ]);
                    var _0x2408c5 = _.merge({}, _0x4a6e48, _0x22a269);
                    this.isProduction = _0x2408c5.isProduction;
                    this.serverKey = _0x2408c5.serverKey;
                    this.clientKey = _0x2408c5.clientKey;
                }
            },
            {
                key: 'getCoreApiBaseUrl',
                value() {
                    if (this.isProduction) {
                        return _ApiConfig.CORE_PRODUCTION_BASE_URL;
                    } else {
                        return _ApiConfig.CORE_SANDBOX_BASE_URL;
                    }
                }
            },
            {
                key: 'getSnapApiBaseUrl',
                value() {
                    if (this.isProduction) {
                        return _ApiConfig.SNAP_PRODUCTION_BASE_URL;
                    } else {
                        return _ApiConfig.SNAP_SANDBOX_BASE_URL;
                    }
                }
            },
            {
                key: 'getIrisApiBaseUrl',
                value() {
                    if (this.isProduction) {
                        return _ApiConfig.IRIS_PRODUCTION_BASE_URL;
                    } else {
                        return _ApiConfig.IRIS_SANDBOX_BASE_URL;
                    }
                }
            }
        ]);
    }();
ApiConfig.CORE_SANDBOX_BASE_URL = 'https://api.sandbox.midtrans.com';
ApiConfig.CORE_PRODUCTION_BASE_URL = 'https://api.midtrans.com';
ApiConfig.SNAP_SANDBOX_BASE_URL = 'https://app.sandbox.midtrans.com/snap/v1';
ApiConfig.SNAP_PRODUCTION_BASE_URL = 'https://app.midtrans.com/snap/v1';
ApiConfig.IRIS_SANDBOX_BASE_URL = 'https://app.sandbox.midtrans.com/iris/api/v1';
ApiConfig.IRIS_PRODUCTION_BASE_URL = 'https://app.midtrans.com/iris/api/v1';
module.exports = ApiConfig;