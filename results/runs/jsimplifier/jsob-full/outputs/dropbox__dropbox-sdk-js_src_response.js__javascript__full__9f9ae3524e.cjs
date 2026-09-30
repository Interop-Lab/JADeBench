'use strict';
function _defineProperties(e, r) {
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
function _createClass(e, r, t) {
    if (r) {
        _defineProperties(e.prototype, r);
    }
    if (t) {
        _defineProperties(e, t);
    }
    Object.defineProperty(e, 'prototype', { writable: false });
    return e;
}
function _toPropertyKey(t) {
    var i = _toPrimitive(t, 'string');
    if (_typeof(i) == 'symbol') {
        return i;
    } else {
        return i + '';
    }
}
function _toPrimitive(t, r) {
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
function _classCallCheck(a, n) {
    if (!(a instanceof n)) {
        throw new TypeError('Cannot call a class as a function');
    }
}
function _callSuper(t, o, e) {
    o = _getPrototypeOf(o);
    return _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e));
}
function _possibleConstructorReturn(t, e) {
    if (e && (_typeof(e) == 'object' || typeof e == 'function')) {
        return e;
    }
    if (e !== undefined) {
        throw new TypeError('Derived constructors may only return object or undefined');
    }
    return _assertThisInitialized(t);
}
function _assertThisInitialized(e) {
    if (e === undefined) {
        throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called');
    }
    return e;
}
function _inherits(t, e) {
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
function _wrapNativeSuper(t) {
    var r = typeof Map == 'function' ? new Map() : undefined;
    _wrapNativeSuper = function _wrapNativeSuper(t) {
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
        function Wrapper() {
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
function _construct(t, e, r) {
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
function _isNativeReflectConstruct() {
    try {
        var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {
        }));
    } catch (t) {
    }
    return (_isNativeReflectConstruct = function _isNativeReflectConstruct() {
        return !!t;
    })();
}
function _isNativeFunction(t) {
    try {
        return Function.toString.call(t).indexOf('[native code]') !== -1;
    } catch (n) {
        return typeof t == 'function';
    }
}
function _setPrototypeOf(t, e) {
    if (Object.setPrototypeOf) {
        _setPrototypeOf = Object.setPrototypeOf.bind();
    } else {
        _setPrototypeOf = function _setPrototypeOf(t, e) {
            t.__proto__ = e;
            return t;
        };
    }
    return _setPrototypeOf(t, e);
}
function _getPrototypeOf(t) {
    if (Object.setPrototypeOf) {
        _getPrototypeOf = Object.getPrototypeOf.bind();
    } else {
        _getPrototypeOf = function _getPrototypeOf(t) {
            return t.__proto__ || Object.getPrototypeOf(t);
        };
    }
    return _getPrototypeOf(t);
}
function _createForOfIteratorHelper(r, e) {
    var t = typeof Symbol != 'undefined' && r[Symbol.iterator] || r['@@iterator'];
    if (!t) {
        if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && typeof r.length == 'number') {
            if (t) {
                r = t;
            }
            var _n = 0;
            var F = function F() {
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
function _unsupportedIterableToArray(r, a) {
    if (r) {
        if (typeof r == 'string') {
            return _arrayLikeToArray(r, a);
        }
        var t = {}.toString.call(r).slice(8, -1);
        if (t === 'Object' && r.constructor) {
            t = r.constructor.name;
        }
        if (t === 'Map' || t === 'Set') {
            return Array.from(r);
        } else if (t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)) {
            return _arrayLikeToArray(r, a);
        } else {
            return undefined;
        }
    }
}
function _arrayLikeToArray(r, a) {
    if (a == null || a > r.length) {
        a = r.length;
    }
    for (var e = 0, n = Array(a); e < a; e++) {
        n[e] = r[e];
    }
    return n;
}
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
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = function __export(_0x13e6f2, _0x286257) {
    for (var _0x17a4ed in _0x286257) {
        __defProp_new(_0x13e6f2, _0x17a4ed, {
            get: _0x286257[_0x17a4ed],
            enumerable: true
        });
    }
};
var __copyProps = function __copyProps(_0x2c44d4, _0x32c451, _0x185850, _0x568959) {
    if (_0x32c451 && _typeof(_0x32c451) === 'object' || typeof _0x32c451 === 'function') {
        var _iterator = _createForOfIteratorHelper(__getOwnPropNames_new(_0x32c451));
        var _step;
        try {
            var _loop = function _loop() {
                var _0x5b5d20 = _step.value;
                if (!__hasOwnProp.call(_0x2c44d4, _0x5b5d20) && _0x5b5d20 !== _0x185850) {
                    __defProp_new(_0x2c44d4, _0x5b5d20, {
                        get() {
                            return _0x32c451[_0x5b5d20];
                        },
                        enumerable: !(_0x568959 = __getOwnPropDesc_new(_0x32c451, _0x5b5d20)) || _0x568959.enumerable
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
    return _0x2c44d4;
};
var _0x2459d6 = { value: true };
var __toCommonJS = function __toCommonJS(_0x3ac3a8) {
    return __copyProps(__defProp_new({}, '__esModule', _0x2459d6), _0x3ac3a8);
};
var response_exports = {};
var _0x1f6a39 = {
    DropboxResponse() {
        return _DropboxResponse;
    },
    parseDownloadResponse() {
        return _parseDownloadResponse;
    },
    parseResponse() {
        return _parseResponse;
    }
};
__export(response_exports, _0x1f6a39);
module.exports = __toCommonJS(response_exports);
var RPC = 'rpc';
var UPLOAD = 'upload';
var DOWNLOAD = 'download';
var APP_AUTH = 'app';
var USER_AUTH = 'user';
var TEAM_AUTH = 'team';
var NO_AUTH = 'noauth';
var COOKIE = 'cookie';
var DEFAULT_API_DOMAIN = 'dropboxapi.com';
var DEFAULT_DOMAIN = 'dropbox.com';
var TEST_DOMAIN_MAPPINGS = {
    api: 'api',
    notify: 'bolt',
    content: 'api-content'
};
function getSafeUnicode(_0x151061) {
    var _0x254234 = ('000' + _0x151061.charCodeAt(0).toString(16)).slice(-4);
    return '\\u' + _0x254234;
}
var baseApiUrl = function baseApiUrl(_0x1d9403, _0x19a9a9 = DEFAULT_API_DOMAIN, _0x2a6860 = '.') {
    if (!_0x2a6860) {
        return 'https://' + _0x19a9a9 + '/2/';
    }
    if (_0x19a9a9 !== DEFAULT_API_DOMAIN && TEST_DOMAIN_MAPPINGS[_0x1d9403] !== undefined) {
        _0x1d9403 = TEST_DOMAIN_MAPPINGS[_0x1d9403];
        _0x2a6860 = '-';
    }
    return 'https://' + _0x1d9403 + _0x2a6860 + _0x19a9a9 + '/2/';
};
var OAuth2AuthorizationUrl = function OAuth2AuthorizationUrl(_0x47eba1 = DEFAULT_DOMAIN) {
    if (_0x47eba1 !== DEFAULT_DOMAIN) {
        _0x47eba1 = 'meta-' + _0x47eba1;
    }
    return 'https://' + _0x47eba1 + '/oauth2/authorize';
};
var OAuth2TokenUrl = function OAuth2TokenUrl(_0x551707 = DEFAULT_API_DOMAIN, _0x96555b = '.') {
    var _0x30fd3d = 'api';
    if (_0x551707 !== DEFAULT_API_DOMAIN) {
        _0x30fd3d = TEST_DOMAIN_MAPPINGS[_0x30fd3d];
        _0x96555b = '-';
    }
    return 'https://' + _0x30fd3d + _0x96555b + _0x551707 + '/oauth2/token';
};
function httpHeaderSafeJson(_0x1b6b3a) {
    return JSON.stringify(_0x1b6b3a).replace(/[\u007f-\uffff]/g, getSafeUnicode);
}
function getTokenExpiresAtDate(_0x90161c) {
    return new Date(Date.now() + _0x90161c * 1000);
}
function isWindowOrWorker() {
    return typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope || typeof module === 'undefined' || typeof window !== 'undefined';
}
function isBrowserEnv() {
    return typeof window !== 'undefined';
}
function isWorkerEnv() {
    return typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope;
}
function createBrowserSafeString(_0x1677eb) {
    var _0x55a81e = _0x1677eb.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    return _0x55a81e;
}
var DropboxResponseError = function (_Error) {
    function DropboxResponseError(_0xf03daf, _0x508f4b, _0x28f116) {
        var _this;
        _classCallCheck(this, DropboxResponseError);
        _this = _callSuper(this, DropboxResponseError, ['Response failed with a ' + _0xf03daf + ' code']);
        _this.name = 'DropboxResponseError';
        _this.status = _0xf03daf;
        _this.headers = _0x508f4b;
        _this.error = _0x28f116;
        return _this;
    }
    _inherits(DropboxResponseError, _Error);
    return _createClass(DropboxResponseError);
}(_wrapNativeSuper(Error));
var _DropboxResponse = _createClass(function _DropboxResponse(_0x4f128b, _0x1d4f2e, _0x243fe3) {
    _classCallCheck(this, _DropboxResponse);
    this.status = _0x4f128b;
    this.headers = _0x1d4f2e;
    this.result = _0x243fe3;
});
function throwAsError(_0x3d1ef2) {
    return _0x3d1ef2.text().then(function (_0x20072a) {
        var _0x97c429;
        try {
            _0x97c429 = JSON.parse(_0x20072a);
        } catch (_0x2f8e1e) {
            _0x97c429 = _0x20072a;
        }
        throw new DropboxResponseError(_0x3d1ef2.status, _0x3d1ef2.headers, _0x97c429);
    });
}
function _parseResponse(_0x4bf5bc) {
    if (!_0x4bf5bc.ok) {
        return throwAsError(_0x4bf5bc);
    }
    return _0x4bf5bc.text().then(function (_0x56ec33) {
        var _0x468529;
        try {
            _0x468529 = JSON.parse(_0x56ec33);
        } catch (_0x547e8a) {
            _0x468529 = _0x56ec33;
        }
        return new _DropboxResponse(_0x4bf5bc.status, _0x4bf5bc.headers, _0x468529);
    });
}
function _parseDownloadResponse(_0xf74ae5) {
    if (!_0xf74ae5.ok) {
        return throwAsError(_0xf74ae5);
    }
    var _0x263225 = isWindowOrWorker() ? _0xf74ae5.blob() : _0xf74ae5.arrayBuffer().then(function (_0x2dcce6) {
        return Buffer.from(_0x2dcce6);
    });
    return _0x263225.then(function (_0x148429) {
        var _0x32f892 = JSON.parse(_0xf74ae5.headers.get('dropbox-api-result'));
        if (isWindowOrWorker()) {
            _0x32f892.fileBlob = _0x148429;
        } else {
            _0x32f892.fileBinary = _0x148429;
        }
        return new _DropboxResponse(_0xf74ae5.status, _0xf74ae5.headers, _0x32f892);
    });
}
var _0x5b2e61 = {
    DropboxResponse: _DropboxResponse,
    parseDownloadResponse: _parseDownloadResponse,
    parseResponse: _parseResponse
};