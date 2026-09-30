'use strict';
function _classCallCheck(a, n) {
    if (!(a instanceof n)) {
        throw new TypeError('Cannot call a class as a function');
    }
}
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
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = function __export(_0x12bad3, _0x422f06) {
    for (var _0x17972f in _0x422f06) {
        __defProp_new(_0x12bad3, _0x17972f, {
            get: _0x422f06[_0x17972f],
            enumerable: true
        });
    }
};
var __copyProps = function __copyProps(_0x3d114f, _0x441017, _0x2d0e60, _0x2ef394) {
    if (_0x441017 && _typeof(_0x441017) === 'object' || typeof _0x441017 === 'function') {
        var _iterator = _createForOfIteratorHelper(__getOwnPropNames_new(_0x441017));
        var _step;
        try {
            var _loop = function _loop() {
                var _0x5914b6 = _step.value;
                if (!__hasOwnProp.call(_0x3d114f, _0x5914b6) && _0x5914b6 !== _0x2d0e60) {
                    __defProp_new(_0x3d114f, _0x5914b6, {
                        get() {
                            return _0x441017[_0x5914b6];
                        },
                        enumerable: !(_0x2ef394 = __getOwnPropDesc_new(_0x441017, _0x5914b6)) || _0x2ef394.enumerable
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
    return _0x3d114f;
};
var __toESM = function __toESM(_0x4cac14, _0x1de8bb, _0x529d00) {
    if (_0x4cac14 != null) {
        _0x529d00 = __create_new(__getProtoOf_new(_0x4cac14));
    } else {
        _0x529d00 = {};
    }
    return __copyProps(_0x1de8bb || !_0x4cac14 || !_0x4cac14.__esModule ? __defProp_new(_0x529d00, 'default', {
        value: _0x4cac14,
        enumerable: true
    }) : _0x529d00, _0x4cac14);
};
var _0x17fa20 = { value: true };
var __toCommonJS = function __toCommonJS(_0x20ee82) {
    return __copyProps(__defProp_new({}, '__esModule', _0x17fa20), _0x20ee82);
};
var content_hasher_exports = {};
var _0x446829 = {
    BLOCK_SIZE() {
        return _BLOCK_SIZE;
    },
    DropboxContentHasher() {
        return _DropboxContentHasher2;
    },
    contentHash() {
        return _contentHash;
    }
};
__export(content_hasher_exports, _0x446829);
module.exports = __toCommonJS(content_hasher_exports);
var import_crypto = __toESM(require('crypto'));
var _BLOCK_SIZE = 4194304;
var _DropboxContentHasher2 = function () {
    function _DropboxContentHasher() {
        _classCallCheck(this, _DropboxContentHasher);
        this.overallHasher = import_crypto.default_.createHash('sha256');
        this.blockHasher = import_crypto.default_.createHash('sha256');
        this.blockPosition = 0;
        this.finished = false;
    }
    return _createClass(_DropboxContentHasher, [
        {
            key: 'update',
            value(_0x359c09) {
                this.assertNotFinished();
                var _0x1d94e1 = _DropboxContentHasher.toBuffer(_0x359c09);
                var _0x4133d5 = 0;
                while (_0x4133d5 < _0x1d94e1.length) {
                    if (this.blockPosition === _BLOCK_SIZE) {
                        this.finishBlock();
                    }
                    var _0x5eef2c = _BLOCK_SIZE - this.blockPosition;
                    var _0x4700f8 = _0x1d94e1.length - _0x4133d5;
                    var _0x15f9d7 = Math.min(_0x5eef2c, _0x4700f8);
                    this.blockHasher.update(_0x1d94e1.subarray(_0x4133d5, _0x4133d5 + _0x15f9d7));
                    this.blockPosition += _0x15f9d7;
                    _0x4133d5 += _0x15f9d7;
                }
                return this;
            }
        },
        {
            key: 'digest',
            value(_0x28ae36) {
                this.assertNotFinished();
                if (this.blockPosition > 0) {
                    this.finishBlock();
                }
                this.finished = true;
                if (_0x28ae36 === undefined) {
                    return this.overallHasher.digest();
                }
                if (_0x28ae36 !== 'hex') {
                    throw new TypeError('DropboxContentHasher only supports hex encoding');
                }
                return this.overallHasher.digest('hex');
            }
        },
        {
            key: 'finishBlock',
            value() {
                this.overallHasher.update(this.blockHasher.digest());
                this.blockHasher = import_crypto.default_.createHash('sha256');
                this.blockPosition = 0;
            }
        },
        {
            key: 'assertNotFinished',
            value() {
                if (this.finished) {
                    throw new Error('DropboxContentHasher cannot be used after digest() has been called');
                }
            }
        }
    ], [{
            key: 'toBuffer',
            value(_0x3f11d5) {
                if (Buffer.isBuffer(_0x3f11d5)) {
                    return _0x3f11d5;
                }
                if (_0x3f11d5 instanceof ArrayBuffer) {
                    return Buffer.from(_0x3f11d5);
                }
                if (ArrayBuffer.isView(_0x3f11d5)) {
                    return Buffer.from(_0x3f11d5.buffer, _0x3f11d5.byteOffset, _0x3f11d5.byteLength);
                }
                throw new TypeError('DropboxContentHasher.update() expects a Buffer, Uint8Array, or ArrayBuffer');
            }
        }]);
}();
function _contentHash(_0x56cbec) {
    return new _DropboxContentHasher2().update(_0x56cbec).digest('hex');
}
var _0x4ae5a4 = {
    BLOCK_SIZE: _BLOCK_SIZE,
    DropboxContentHasher: _DropboxContentHasher2,
    contentHash: _contentHash
};