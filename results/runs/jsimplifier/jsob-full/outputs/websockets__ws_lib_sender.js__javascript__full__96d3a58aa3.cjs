'use strict';
function _defineProperty(e, r, t) {
    if ((r = _toPropertyKey(r)) in e) {
        Object.defineProperty(e, r, {
            value: t,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        e[r] = t;
    }
    return e;
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
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = function __commonJS(_0x5967e8, _0x47475b) {
    return function _0x4c7360() {
        if (!_0x47475b) {
            _0x5967e8[__getOwnPropNames_new(_0x5967e8)[0]]((_0x47475b = { exports: {} }).exports, _0x47475b);
        }
        return _0x47475b.exports;
    };
};
var require_constants = __commonJS({
    '../work/websockets__ws/lib/constants.js'(_0x573406, _0x5af6a5) {
        'use strict';
        'use strict';
        var _0x4c3f50 = [
            'nodebuffer',
            'arraybuffer',
            'fragments'
        ];
        var _0x549da1 = typeof Blob !== 'undefined';
        if (_0x549da1) {
            _0x4c3f50.push('blob');
        }
        _0x5af6a5.exports = {
            BINARY_TYPES: _0x4c3f50,
            CLOSE_TIMEOUT: 30000,
            EMPTY_BUFFER: Buffer.alloc(0),
            GUID: '258EAFA5-E914-47DA-95CA-C5AB0DC85B11',
            hasBlob: _0x549da1,
            kForOnEventAttribute: Symbol('kIsForOnEventAttribute'),
            kListener: Symbol('kListener'),
            kStatusCode: Symbol('status-code'),
            kWebSocket: Symbol('websocket'),
            NOOP() {
            }
        };
    }
});
var require_buffer_util = __commonJS({
    '../work/websockets__ws/lib/buffer-util.js'(_0x393711, _0x3f3606) {
        'use strict';
        var _require_constants = require_constants();
        var _0x4c4713 = _require_constants.EMPTY_BUFFER;
        var _0x44bfea = Buffer[Symbol.species];
        function _0x522c82(_0x33474a, _0x5f475b) {
            if (_0x33474a.length === 0) {
                return _0x4c4713;
            }
            if (_0x33474a.length === 1) {
                return _0x33474a[0];
            }
            var _0x4e0dc5 = Buffer.allocUnsafe(_0x5f475b);
            var _0xd73047 = 0;
            for (var _0x26868c = 0; _0x26868c < _0x33474a.length; _0x26868c++) {
                var _0x5403cc = _0x33474a[_0x26868c];
                _0x4e0dc5.set(_0x5403cc, _0xd73047);
                _0xd73047 += _0x5403cc.length;
            }
            if (_0xd73047 < _0x5f475b) {
                return new _0x44bfea(_0x4e0dc5.buffer, _0x4e0dc5.byteOffset, _0xd73047);
            }
            return _0x4e0dc5;
        }
        function _0xef443b(_0x25c7a6, _0x317737, _0x4ded9e, _0x3a6224, _0x5e0684) {
            for (var _0x37ef5f = 0; _0x37ef5f < _0x5e0684; _0x37ef5f++) {
                _0x4ded9e[_0x3a6224 + _0x37ef5f] = _0x25c7a6[_0x37ef5f] ^ _0x317737[_0x37ef5f & 3];
            }
        }
        function _0x405f10(_0x45883c, _0x1d2794) {
            for (var _0x5be634 = 0; _0x5be634 < _0x45883c.length; _0x5be634++) {
                _0x45883c[_0x5be634] ^= _0x1d2794[_0x5be634 & 3];
            }
        }
        function _0x42175b(_0x39064d) {
            if (_0x39064d.length === _0x39064d.buffer.byteLength) {
                return _0x39064d.buffer;
            }
            return _0x39064d.buffer.slice(_0x39064d.byteOffset, _0x39064d.byteOffset + _0x39064d.length);
        }
        function _0x1aee39(_0xf9e4c0) {
            _0x1aee39.readOnly = true;
            if (Buffer.isBuffer(_0xf9e4c0)) {
                return _0xf9e4c0;
            }
            var _0x27829f;
            if (_0xf9e4c0 instanceof ArrayBuffer) {
                _0x27829f = new _0x44bfea(_0xf9e4c0);
            } else if (ArrayBuffer.isView(_0xf9e4c0)) {
                _0x27829f = new _0x44bfea(_0xf9e4c0.buffer, _0xf9e4c0.byteOffset, _0xf9e4c0.byteLength);
            } else {
                _0x27829f = Buffer.from(_0xf9e4c0);
                _0x1aee39.readOnly = false;
            }
            return _0x27829f;
        }
        var _0x18bd57 = {
            concat: _0x522c82,
            mask: _0xef443b,
            toArrayBuffer: _0x42175b,
            toBuffer: _0x1aee39,
            unmask: _0x405f10
        };
        _0x3f3606.exports = _0x18bd57;
        if (!process.env.WS_NO_BUFFER_UTIL) {
            try {
                var _0x36dc7a = require('bufferutil');
                _0x3f3606.exports.mask = function (_0xca63c9, _0x1215e1, _0x3de64c, _0x3506c5, _0x83c102) {
                    if (_0x83c102 < 48) {
                        _0xef443b(_0xca63c9, _0x1215e1, _0x3de64c, _0x3506c5, _0x83c102);
                    } else {
                        _0x36dc7a.mask(_0xca63c9, _0x1215e1, _0x3de64c, _0x3506c5, _0x83c102);
                    }
                };
                _0x3f3606.exports.unmask = function (_0x126838, _0x365821) {
                    if (_0x126838.length < 32) {
                        _0x405f10(_0x126838, _0x365821);
                    } else {
                        _0x36dc7a.unmask(_0x126838, _0x365821);
                    }
                };
            } catch (_0x370d8c) {
                null;
            }
        }
    }
});
var require_limiter = __commonJS({
    '../work/websockets__ws/lib/limiter.js'(_0x4768b8, _0x30afaf) {
        'use strict';
        var _0x352d9b = Symbol('kDone');
        var _0x3b0367 = Symbol('kRun');
        var _0x3c298f = function () {
            function _0x3c298f(_0x4e921a) {
                var _this = this;
                _classCallCheck(this, _0x3c298f);
                this[_0x352d9b] = function () {
                    _this.pending--;
                    _this[_0x3b0367]();
                };
                this.concurrency = _0x4e921a || Infinity;
                this.jobs = [];
                this.pending = 0;
            }
            return _createClass(_0x3c298f, [
                {
                    key: 'add',
                    value(_0x1b08a3) {
                        this.jobs.push(_0x1b08a3);
                        this[_0x3b0367]();
                    }
                },
                {
                    key: _0x3b0367,
                    value() {
                        if (this.pending === this.concurrency) {
                            return;
                        }
                        if (this.jobs.length) {
                            var _0x58bd38 = this.jobs.shift();
                            this.pending++;
                            _0x58bd38(this[_0x352d9b]);
                        }
                    }
                }
            ]);
        }();
        _0x30afaf.exports = _0x3c298f;
    }
});
var require_permessage_deflate = __commonJS({
    '../work/websockets__ws/lib/permessage-deflate.js'(_0x17aa9b, _0x101f59) {
        'use strict';
        var _0x36721a = require('zlib');
        var _0x35c4a9 = require_buffer_util();
        var _0x2469f8 = require_limiter();
        var _require_constants2 = require_constants();
        var _0x37864e = _require_constants2.kStatusCode;
        var _0xcc9936 = Buffer[Symbol.species];
        var _0x3977ce = Buffer.from([
            0,
            0,
            255,
            255
        ]);
        var _0x2d1786 = Symbol('permessage-deflate');
        var _0x4e2aff = Symbol('total-length');
        var _0xab2854 = Symbol('callback');
        var _0x3306d9 = Symbol('buffers');
        var _0x1ecb50 = Symbol('error');
        var _0x26cdb1;
        var _0x32713e = function () {
            function _0x32713e(_0x5afeb8) {
                _classCallCheck(this, _0x32713e);
                this._options = _0x5afeb8 || {};
                if (this._options.threshold !== undefined) {
                    this._threshold = this._options.threshold;
                } else {
                    this._threshold = 1024;
                }
                this._maxPayload = this._options.maxPayload | 0;
                this._isServer = !!this._options.isServer;
                this._deflate = null;
                this._inflate = null;
                this.params = null;
                if (!_0x26cdb1) {
                    var _0x3de97c = this._options.concurrencyLimit !== undefined ? this._options.concurrencyLimit : 10;
                    _0x26cdb1 = new _0x2469f8(_0x3de97c);
                }
            }
            return _createClass(_0x32713e, [
                {
                    key: 'offer',
                    value() {
                        var _0x35651b = {};
                        if (this._options.serverNoContextTakeover) {
                            _0x35651b.server_no_context_takeover = true;
                        }
                        if (this._options.clientNoContextTakeover) {
                            _0x35651b.client_no_context_takeover = true;
                        }
                        if (this._options.serverMaxWindowBits) {
                            _0x35651b.server_max_window_bits = this._options.serverMaxWindowBits;
                        }
                        if (this._options.clientMaxWindowBits) {
                            _0x35651b.client_max_window_bits = this._options.clientMaxWindowBits;
                        } else if (this._options.clientMaxWindowBits == null) {
                            _0x35651b.client_max_window_bits = true;
                        }
                        return _0x35651b;
                    }
                },
                {
                    key: 'accept',
                    value(_0x23af88) {
                        _0x23af88 = this.normalizeParams(_0x23af88);
                        if (this._isServer) {
                            this.params = this.acceptAsServer(_0x23af88);
                        } else {
                            this.params = this.acceptAsClient(_0x23af88);
                        }
                        return this.params;
                    }
                },
                {
                    key: 'cleanup',
                    value() {
                        if (this._inflate) {
                            this._inflate.close();
                            this._inflate = null;
                        }
                        if (this._deflate) {
                            var _0x39894b = this._deflate[_0xab2854];
                            this._deflate.close();
                            this._deflate = null;
                            if (_0x39894b) {
                                _0x39894b(new Error('The deflate stream was closed while data was being processed'));
                            }
                        }
                    }
                },
                {
                    key: 'acceptAsServer',
                    value(_0x31fabb) {
                        var _0xf9645 = this._options;
                        var _0x440132 = _0x31fabb.find(function (_0x2892d8) {
                            if (_0xf9645.serverNoContextTakeover === false && _0x2892d8.server_no_context_takeover || _0x2892d8.server_max_window_bits && (_0xf9645.serverMaxWindowBits === false || typeof _0xf9645.serverMaxWindowBits === 'number' && _0xf9645.serverMaxWindowBits > _0x2892d8.server_max_window_bits) || typeof _0xf9645.clientMaxWindowBits === 'number' && !_0x2892d8.client_max_window_bits) {
                                return false;
                            }
                            return true;
                        });
                        if (!_0x440132) {
                            throw new Error('None of the extension offers can be accepted');
                        }
                        if (_0xf9645.serverNoContextTakeover) {
                            _0x440132.server_no_context_takeover = true;
                        }
                        if (_0xf9645.clientNoContextTakeover) {
                            _0x440132.client_no_context_takeover = true;
                        }
                        if (typeof _0xf9645.serverMaxWindowBits === 'number') {
                            _0x440132.server_max_window_bits = _0xf9645.serverMaxWindowBits;
                        }
                        if (typeof _0xf9645.clientMaxWindowBits === 'number') {
                            _0x440132.client_max_window_bits = _0xf9645.clientMaxWindowBits;
                        } else if (_0x440132.client_max_window_bits === true || _0xf9645.clientMaxWindowBits === false) {
                            _0x440132.client_max_window_bits = null;
                            true;
                        }
                        return _0x440132;
                    }
                },
                {
                    key: 'acceptAsClient',
                    value(_0x41b055) {
                        var _0x4de16c = _0x41b055[0];
                        if (this._options.clientNoContextTakeover === false && _0x4de16c.client_no_context_takeover) {
                            throw new Error('Unexpected parameter "client_no_context_takeover"');
                        }
                        if (!_0x4de16c.client_max_window_bits) {
                            if (typeof this._options.clientMaxWindowBits === 'number') {
                                _0x4de16c.client_max_window_bits = this._options.clientMaxWindowBits;
                            }
                        } else if (this._options.clientMaxWindowBits === false || typeof this._options.clientMaxWindowBits === 'number' && _0x4de16c.client_max_window_bits > this._options.clientMaxWindowBits) {
                            throw new Error('Unexpected or invalid parameter "client_max_window_bits"');
                        }
                        return _0x4de16c;
                    }
                },
                {
                    key: 'normalizeParams',
                    value(_0x43006e) {
                        var _this2 = this;
                        _0x43006e.forEach(function (_0x3e616a) {
                            Object.keys(_0x3e616a).forEach(function (_0x19f832) {
                                var _0x4092f9 = _0x3e616a[_0x19f832];
                                if (_0x4092f9.length > 1) {
                                    throw new Error('Parameter "' + _0x19f832 + '" must have only a single value');
                                }
                                _0x4092f9 = _0x4092f9[0];
                                if (_0x19f832 === 'client_max_window_bits') {
                                    if (_0x4092f9 !== true) {
                                        var _0x2d698d = +_0x4092f9;
                                        if (!Number.isInteger(_0x2d698d) || _0x2d698d < 8 || _0x2d698d > 15) {
                                            throw new TypeError('Invalid value for parameter "' + _0x19f832 + '": ' + _0x4092f9);
                                        }
                                        _0x4092f9 = _0x2d698d;
                                    } else if (!_this2._isServer) {
                                        throw new TypeError('Invalid value for parameter "' + _0x19f832 + '": ' + _0x4092f9);
                                    }
                                } else if (_0x19f832 === 'server_max_window_bits') {
                                    var _0x172f8b = +_0x4092f9;
                                    if (!Number.isInteger(_0x172f8b) || _0x172f8b < 8 || _0x172f8b > 15) {
                                        throw new TypeError('Invalid value for parameter "' + _0x19f832 + '": ' + _0x4092f9);
                                    }
                                    _0x4092f9 = _0x172f8b;
                                } else if (_0x19f832 === 'client_no_context_takeover' || _0x19f832 === 'server_no_context_takeover') {
                                    if (_0x4092f9 !== true) {
                                        throw new TypeError('Invalid value for parameter "' + _0x19f832 + '": ' + _0x4092f9);
                                    }
                                } else {
                                    throw new Error('Unknown parameter "' + _0x19f832 + '"');
                                }
                                _0x3e616a[_0x19f832] = _0x4092f9;
                            });
                        });
                        return _0x43006e;
                    }
                },
                {
                    key: 'decompress',
                    value(_0x17a852, _0x5b7680, _0x3dc934) {
                        var _this3 = this;
                        _0x26cdb1.add(function (_0x5f52df) {
                            _this3._decompress(_0x17a852, _0x5b7680, function (_0x22a910, _0x21b854) {
                                _0x5f52df();
                                _0x3dc934(_0x22a910, _0x21b854);
                            });
                        });
                    }
                },
                {
                    key: 'compress',
                    value(_0x551eae, _0xd0fb9a, _0x25609e) {
                        var _this4 = this;
                        _0x26cdb1.add(function (_0x14a159) {
                            _this4._compress(_0x551eae, _0xd0fb9a, function (_0x47284d, _0x3851d1) {
                                _0x14a159();
                                _0x25609e(_0x47284d, _0x3851d1);
                            });
                        });
                    }
                },
                {
                    key: '_decompress',
                    value(_0x1d8412, _0x4bf6dc, _0xb19d10) {
                        var _this5 = this;
                        var _0x2647e9 = this._isServer ? 'client' : 'server';
                        if (!this._inflate) {
                            var _0x2f54c4 = _0x2647e9 + '_max_window_bits';
                            var _0x4c8fec = typeof this.params[_0x2f54c4] !== 'number' ? _0x36721a.Z_DEFAULT_WINDOWBITS : this.params[_0x2f54c4];
                            this._inflate = _0x36721a.createInflateRaw(Object.assign({}, this._options.zlibInflateOptions, { windowBits: _0x4c8fec }));
                            this._inflate[_0x2d1786] = this;
                            this._inflate[_0x4e2aff] = 0;
                            this._inflate[_0x3306d9] = [];
                            this._inflate.on('error', _0x4edb7f);
                            this._inflate.on('data', _0x22fc95);
                        }
                        this._inflate[_0xab2854] = _0xb19d10;
                        this._inflate.write(_0x1d8412);
                        if (_0x4bf6dc) {
                            this._inflate.write(_0x3977ce);
                        }
                        this._inflate.flush(function () {
                            var _0x5bed2b = _this5._inflate[_0x1ecb50];
                            if (_0x5bed2b) {
                                _this5._inflate.close();
                                _this5._inflate = null;
                                _0xb19d10(_0x5bed2b);
                                return;
                            }
                            var _0x1c8ed2 = _0x35c4a9.concat(_this5._inflate[_0x3306d9], _this5._inflate[_0x4e2aff]);
                            if (_this5._inflate._readableState.endEmitted) {
                                _this5._inflate.close();
                                _this5._inflate = null;
                            } else {
                                _this5._inflate[_0x4e2aff] = 0;
                                _this5._inflate[_0x3306d9] = [];
                                if (_0x4bf6dc && _this5.params[_0x2647e9 + '_no_context_takeover']) {
                                    _this5._inflate.reset();
                                }
                            }
                            _0xb19d10(null, _0x1c8ed2);
                        });
                    }
                },
                {
                    key: '_compress',
                    value(_0x4b7b78, _0x335c10, _0x3df9c0) {
                        var _this6 = this;
                        var _0x33e4ae = this._isServer ? 'server' : 'client';
                        if (!this._deflate) {
                            var _0x4b77ed = _0x33e4ae + '_max_window_bits';
                            var _0x58918a = typeof this.params[_0x4b77ed] !== 'number' ? _0x36721a.Z_DEFAULT_WINDOWBITS : this.params[_0x4b77ed];
                            this._deflate = _0x36721a.createDeflateRaw(Object.assign({}, this._options.zlibDeflateOptions, { windowBits: _0x58918a }));
                            this._deflate[_0x4e2aff] = 0;
                            this._deflate[_0x3306d9] = [];
                            this._deflate.on('data', _0x161625);
                        }
                        this._deflate[_0xab2854] = _0x3df9c0;
                        this._deflate.write(_0x4b7b78);
                        this._deflate.flush(_0x36721a.Z_SYNC_FLUSH, function () {
                            if (!_this6._deflate) {
                                return;
                            }
                            var _0x5af32c = _0x35c4a9.concat(_this6._deflate[_0x3306d9], _this6._deflate[_0x4e2aff]);
                            if (_0x335c10) {
                                _0x5af32c = new _0xcc9936(_0x5af32c.buffer, _0x5af32c.byteOffset, _0x5af32c.length - 4);
                            }
                            _this6._deflate[_0xab2854] = null;
                            _this6._deflate[_0x4e2aff] = 0;
                            _this6._deflate[_0x3306d9] = [];
                            if (_0x335c10 && _this6.params[_0x33e4ae + '_no_context_takeover']) {
                                _this6._deflate.reset();
                            }
                            _0x3df9c0(null, _0x5af32c);
                        });
                    }
                }
            ], [{
                    key: 'extensionName',
                    get() {
                        return 'permessage-deflate';
                    }
                }]);
        }();
        _0x101f59.exports = _0x32713e;
        function _0x161625(_0x5b9f85) {
            this[_0x3306d9].push(_0x5b9f85);
            this[_0x4e2aff] += _0x5b9f85.length;
        }
        function _0x22fc95(_0x2fb886) {
            this[_0x4e2aff] += _0x2fb886.length;
            if (this[_0x2d1786]._maxPayload < 1 || this[_0x4e2aff] <= this[_0x2d1786]._maxPayload) {
                this[_0x3306d9].push(_0x2fb886);
                return;
            }
            this[_0x1ecb50] = new RangeError('Max payload size exceeded');
            this[_0x1ecb50].code = 'WS_ERR_UNSUPPORTED_MESSAGE_LENGTH';
            this[_0x1ecb50][_0x37864e] = 1009;
            this.removeListener('data', _0x22fc95);
            this.reset();
        }
        function _0x4edb7f(_0x21fb7d) {
            this[_0x2d1786]._inflate = null;
            if (this[_0x1ecb50]) {
                this[_0xab2854](this[_0x1ecb50]);
                return;
            }
            _0x21fb7d[_0x37864e] = 1007;
            this[_0xab2854](_0x21fb7d);
        }
    }
});
var require_validation = __commonJS({
    '../work/websockets__ws/lib/validation.js'(_0x1b43cc, _0x41f9a2) {
        'use strict';
        var _require = require('buffer');
        var _0x4b8f1e = _require.isUtf8;
        var _require_constants3 = require_constants();
        var _0x37c826 = _require_constants3.hasBlob;
        var _0x4fae6c = [
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            1,
            0,
            1,
            1,
            1,
            1,
            1,
            0,
            0,
            1,
            1,
            0,
            1,
            1,
            0,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            0,
            0,
            0,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            0,
            1,
            0,
            1,
            0
        ];
        function _0x251688(_0x2db68c) {
            return _0x2db68c >= 1000 && _0x2db68c <= 1014 && _0x2db68c !== 1004 && _0x2db68c !== 1005 && _0x2db68c !== 1006 || _0x2db68c >= 3000 && _0x2db68c <= 4999;
        }
        function _0xf4998d(_0x1a6011) {
            var _0x1de918 = _0x1a6011.length;
            var _0x1d39ec = 0;
            while (_0x1d39ec < _0x1de918) {
                if ((_0x1a6011[_0x1d39ec] & 128) === 0) {
                    _0x1d39ec++;
                } else if ((_0x1a6011[_0x1d39ec] & 224) === 192) {
                    if (_0x1d39ec + 1 === _0x1de918 || (_0x1a6011[_0x1d39ec + 1] & 192) !== 128 || (_0x1a6011[_0x1d39ec] & 254) === 192) {
                        return false;
                    }
                    _0x1d39ec += 2;
                } else if ((_0x1a6011[_0x1d39ec] & 240) === 224) {
                    if (_0x1d39ec + 2 >= _0x1de918 || (_0x1a6011[_0x1d39ec + 1] & 192) !== 128 || (_0x1a6011[_0x1d39ec + 2] & 192) !== 128 || _0x1a6011[_0x1d39ec] === 224 && (_0x1a6011[_0x1d39ec + 1] & 224) === 128 || _0x1a6011[_0x1d39ec] === 237 && (_0x1a6011[_0x1d39ec + 1] & 224) === 160) {
                        return false;
                    }
                    _0x1d39ec += 3;
                } else if ((_0x1a6011[_0x1d39ec] & 248) === 240) {
                    if (_0x1d39ec + 3 >= _0x1de918 || (_0x1a6011[_0x1d39ec + 1] & 192) !== 128 || (_0x1a6011[_0x1d39ec + 2] & 192) !== 128 || (_0x1a6011[_0x1d39ec + 3] & 192) !== 128 || _0x1a6011[_0x1d39ec] === 240 && (_0x1a6011[_0x1d39ec + 1] & 240) === 128 || _0x1a6011[_0x1d39ec] === 244 && _0x1a6011[_0x1d39ec + 1] > 143 || _0x1a6011[_0x1d39ec] > 244) {
                        return false;
                    }
                    _0x1d39ec += 4;
                } else {
                    return false;
                }
            }
            return true;
        }
        function _0x638535(_0x292049) {
            return _0x37c826 && _typeof(_0x292049) === 'object' && typeof _0x292049.arrayBuffer === 'function' && typeof _0x292049.type === 'string' && typeof _0x292049.stream === 'function' && (_0x292049[Symbol.toStringTag] === 'Blob' || _0x292049[Symbol.toStringTag] === 'File');
        }
        var _0x17bc7e = {
            isBlob: _0x638535,
            isValidStatusCode: _0x251688,
            isValidUTF8: _0xf4998d,
            tokenChars: _0x4fae6c
        };
        _0x41f9a2.exports = _0x17bc7e;
        if (_0x4b8f1e) {
            _0x41f9a2.exports.isValidUTF8 = function (_0x3600f0) {
                if (_0x3600f0.length < 24) {
                    return _0xf4998d(_0x3600f0);
                } else {
                    return _0x4b8f1e(_0x3600f0);
                }
            };
        } else if (!process.env.WS_NO_UTF_8_VALIDATE) {
            try {
                var _0x5b9e1d = require('utf-8-validate');
                _0x41f9a2.exports.isValidUTF8 = function (_0x492d1e) {
                    if (_0x492d1e.length < 32) {
                        return _0xf4998d(_0x492d1e);
                    } else {
                        return _0x5b9e1d(_0x492d1e);
                    }
                };
            } catch (_0x39fc19) {
                null;
            }
        }
    }
});
var _require2 = require('stream');
var Duplex = _require2.Duplex;
var _require3 = require('crypto');
var randomFillSync = _require3.randomFillSync;
var _require4 = require('util');
var isUint8Array = _require4.types.isUint8Array;
var PerMessageDeflate = require_permessage_deflate();
var _require_constants4 = require_constants();
var EMPTY_BUFFER = _require_constants4.EMPTY_BUFFER;
var kWebSocket = _require_constants4.kWebSocket;
var NOOP = _require_constants4.NOOP;
var _require_validation = require_validation();
var isBlob = _require_validation.isBlob;
var isValidStatusCode = _require_validation.isValidStatusCode;
var _require_buffer_util = require_buffer_util();
var applyMask = _require_buffer_util.mask;
var toBuffer = _require_buffer_util.toBuffer;
var kByteLength = Symbol('kByteLength');
var maskBuffer = Buffer.alloc(4);
var RANDOM_POOL_SIZE = 8192;
var randomPool;
var randomPoolPointer = RANDOM_POOL_SIZE;
var DEFAULT = 0;
var DEFLATING = 1;
var GET_BLOB_DATA = 2;
var Sender = function () {
    function _Sender(_0x528f26, _0x25ba7a, _0x5e930c) {
        _classCallCheck(this, _Sender);
        this._extensions = _0x25ba7a || {};
        if (_0x5e930c) {
            this._generateMask = _0x5e930c;
            this._maskBuffer = Buffer.alloc(4);
        }
        this._socket = _0x528f26;
        this._firstFragment = true;
        this._compress = false;
        this._bufferedBytes = 0;
        this._queue = [];
        this._state = DEFAULT;
        this.onerror = NOOP;
        this[kWebSocket] = undefined;
    }
    return _createClass(_Sender, [
        {
            key: 'close',
            value(_0x719b69, _0x387d9f, _0x554033, _0xd95f0c) {
                var _0x4d3d43;
                if (_0x719b69 === undefined) {
                    _0x4d3d43 = EMPTY_BUFFER;
                } else if (typeof _0x719b69 !== 'number' || !isValidStatusCode(_0x719b69)) {
                    throw new TypeError('First argument must be a valid error code number');
                } else if (_0x387d9f === undefined || !_0x387d9f.length) {
                    _0x4d3d43 = Buffer.allocUnsafe(2);
                    _0x4d3d43.writeUInt16BE(_0x719b69, 0);
                } else {
                    var _0x29194d = Buffer.byteLength(_0x387d9f);
                    if (_0x29194d > 123) {
                        throw new RangeError('The message must not be greater than 123 bytes');
                    }
                    _0x4d3d43 = Buffer.allocUnsafe(2 + _0x29194d);
                    _0x4d3d43.writeUInt16BE(_0x719b69, 0);
                    if (typeof _0x387d9f === 'string') {
                        _0x4d3d43.write(_0x387d9f, 2);
                    } else if (isUint8Array(_0x387d9f)) {
                        _0x4d3d43.set(_0x387d9f, 2);
                    } else {
                        throw new TypeError('Second argument must be a string or a Uint8Array');
                    }
                }
                var _0x10417b = _defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty({}, kByteLength, _0x4d3d43.length), 'fin', true), 'generateMask', this._generateMask), 'mask', _0x554033), 'maskBuffer', this._maskBuffer), 'opcode', 8), 'readOnly', false), 'rsv1', false);
                var _0x7bf588 = _0x10417b;
                if (this._state !== DEFAULT) {
                    this.enqueue([
                        this.dispatch,
                        _0x4d3d43,
                        false,
                        _0x7bf588,
                        _0xd95f0c
                    ]);
                } else {
                    this.sendFrame(_Sender.frame(_0x4d3d43, _0x7bf588), _0xd95f0c);
                }
            }
        },
        {
            key: 'ping',
            value(_0x21446f, _0x6aca9, _0x2440f1) {
                var _0x3e426b;
                var _0x453dca;
                if (typeof _0x21446f === 'string') {
                    _0x3e426b = Buffer.byteLength(_0x21446f);
                    _0x453dca = false;
                } else if (isBlob(_0x21446f)) {
                    _0x3e426b = _0x21446f.size;
                    _0x453dca = false;
                } else {
                    _0x21446f = toBuffer(_0x21446f);
                    _0x3e426b = _0x21446f.length;
                    _0x453dca = toBuffer.readOnly;
                }
                if (_0x3e426b > 125) {
                    throw new RangeError('The data size must not be greater than 125 bytes');
                }
                var _0x41d3de = _defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty({}, kByteLength, _0x3e426b), 'fin', true), 'generateMask', this._generateMask), 'mask', _0x6aca9), 'maskBuffer', this._maskBuffer), 'opcode', 9), 'readOnly', _0x453dca), 'rsv1', false);
                var _0xef0ddc = _0x41d3de;
                if (isBlob(_0x21446f)) {
                    if (this._state !== DEFAULT) {
                        this.enqueue([
                            this.getBlobData,
                            _0x21446f,
                            false,
                            _0xef0ddc,
                            _0x2440f1
                        ]);
                    } else {
                        this.getBlobData(_0x21446f, false, _0xef0ddc, _0x2440f1);
                    }
                } else if (this._state !== DEFAULT) {
                    this.enqueue([
                        this.dispatch,
                        _0x21446f,
                        false,
                        _0xef0ddc,
                        _0x2440f1
                    ]);
                } else {
                    this.sendFrame(_Sender.frame(_0x21446f, _0xef0ddc), _0x2440f1);
                }
            }
        },
        {
            key: 'pong',
            value(_0x1f8fc2, _0x514bd8, _0x39176e) {
                var _0x44f080;
                var _0x40aee7;
                if (typeof _0x1f8fc2 === 'string') {
                    _0x44f080 = Buffer.byteLength(_0x1f8fc2);
                    _0x40aee7 = false;
                } else if (isBlob(_0x1f8fc2)) {
                    _0x44f080 = _0x1f8fc2.size;
                    _0x40aee7 = false;
                } else {
                    _0x1f8fc2 = toBuffer(_0x1f8fc2);
                    _0x44f080 = _0x1f8fc2.length;
                    _0x40aee7 = toBuffer.readOnly;
                }
                if (_0x44f080 > 125) {
                    throw new RangeError('The data size must not be greater than 125 bytes');
                }
                var _0x2620de = _defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty({}, kByteLength, _0x44f080), 'fin', true), 'generateMask', this._generateMask), 'mask', _0x514bd8), 'maskBuffer', this._maskBuffer), 'opcode', 10), 'readOnly', _0x40aee7), 'rsv1', false);
                var _0x586fd0 = _0x2620de;
                if (isBlob(_0x1f8fc2)) {
                    if (this._state !== DEFAULT) {
                        this.enqueue([
                            this.getBlobData,
                            _0x1f8fc2,
                            false,
                            _0x586fd0,
                            _0x39176e
                        ]);
                    } else {
                        this.getBlobData(_0x1f8fc2, false, _0x586fd0, _0x39176e);
                    }
                } else if (this._state !== DEFAULT) {
                    this.enqueue([
                        this.dispatch,
                        _0x1f8fc2,
                        false,
                        _0x586fd0,
                        _0x39176e
                    ]);
                } else {
                    this.sendFrame(_Sender.frame(_0x1f8fc2, _0x586fd0), _0x39176e);
                }
            }
        },
        {
            key: 'send',
            value(_0x2503bc, _0x183a80, _0x583539) {
                var _0x28a54b = this._extensions[PerMessageDeflate.extensionName];
                var _0x2b092f = _0x183a80.binary ? 2 : 1;
                var _0x3e0978 = _0x183a80.compress;
                var _0x59cd7d;
                var _0x9dc1d2;
                if (typeof _0x2503bc === 'string') {
                    _0x59cd7d = Buffer.byteLength(_0x2503bc);
                    _0x9dc1d2 = false;
                } else if (isBlob(_0x2503bc)) {
                    _0x59cd7d = _0x2503bc.size;
                    _0x9dc1d2 = false;
                } else {
                    _0x2503bc = toBuffer(_0x2503bc);
                    _0x59cd7d = _0x2503bc.length;
                    _0x9dc1d2 = toBuffer.readOnly;
                }
                if (this._firstFragment) {
                    this._firstFragment = false;
                    if (_0x3e0978 && _0x28a54b && _0x28a54b.params[_0x28a54b._isServer ? 'server_no_context_takeover' : 'client_no_context_takeover']) {
                        _0x3e0978 = _0x59cd7d >= _0x28a54b._threshold;
                    }
                    this._compress = _0x3e0978;
                } else {
                    _0x3e0978 = false;
                    _0x2b092f = 0;
                }
                if (_0x183a80.fin) {
                    this._firstFragment = true;
                }
                var _0x47dd27 = _defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty({}, kByteLength, _0x59cd7d), 'fin', _0x183a80.fin), 'generateMask', this._generateMask), 'mask', _0x183a80.mask), 'maskBuffer', this._maskBuffer), 'opcode', _0x2b092f), 'readOnly', _0x9dc1d2), 'rsv1', _0x3e0978);
                var _0x2553b3 = _0x47dd27;
                if (isBlob(_0x2503bc)) {
                    if (this._state !== DEFAULT) {
                        this.enqueue([
                            this.getBlobData,
                            _0x2503bc,
                            this._compress,
                            _0x2553b3,
                            _0x583539
                        ]);
                    } else {
                        this.getBlobData(_0x2503bc, this._compress, _0x2553b3, _0x583539);
                    }
                } else if (this._state !== DEFAULT) {
                    this.enqueue([
                        this.dispatch,
                        _0x2503bc,
                        this._compress,
                        _0x2553b3,
                        _0x583539
                    ]);
                } else {
                    this.dispatch(_0x2503bc, this._compress, _0x2553b3, _0x583539);
                }
            }
        },
        {
            key: 'getBlobData',
            value(_0x507b33, _0xe72a72, _0x29c5ca, _0x2322a8) {
                var _this7 = this;
                this._bufferedBytes += _0x29c5ca[kByteLength];
                this._state = GET_BLOB_DATA;
                _0x507b33.arrayBuffer().then(function (_0x1dd19c) {
                    if (_this7._socket.destroyed) {
                        var _0x3ce532 = new Error('The socket was closed while the blob was being read');
                        process.nextTick(callCallbacks, _this7, _0x3ce532, _0x2322a8);
                        return;
                    }
                    _this7._bufferedBytes -= _0x29c5ca[kByteLength];
                    var _0x288408 = toBuffer(_0x1dd19c);
                    if (!_0xe72a72) {
                        _this7._state = DEFAULT;
                        _this7.sendFrame(_Sender.frame(_0x288408, _0x29c5ca), _0x2322a8);
                        _this7.dequeue();
                    } else {
                        _this7.dispatch(_0x288408, _0xe72a72, _0x29c5ca, _0x2322a8);
                    }
                }).catch(function (_0x37999c) {
                    process.nextTick(onError, _this7, _0x37999c, _0x2322a8);
                });
            }
        },
        {
            key: 'dispatch',
            value(_0x1e593c, _0x11a93a, _0x305e53, _0x4637f7) {
                var _this8 = this;
                if (!_0x11a93a) {
                    this.sendFrame(_Sender.frame(_0x1e593c, _0x305e53), _0x4637f7);
                    return;
                }
                var _0x4af330 = this._extensions[PerMessageDeflate.extensionName];
                this._bufferedBytes += _0x305e53[kByteLength];
                this._state = DEFLATING;
                _0x4af330.compress(_0x1e593c, _0x305e53.fin, function (_0xe3a54f, _0x2f6820) {
                    if (_this8._socket.destroyed) {
                        var _0x1e4bd6 = new Error('The socket was closed while data was being compressed');
                        callCallbacks(_this8, _0x1e4bd6, _0x4637f7);
                        return;
                    }
                    _this8._bufferedBytes -= _0x305e53[kByteLength];
                    _this8._state = DEFAULT;
                    _0x305e53.readOnly = false;
                    _this8.sendFrame(_Sender.frame(_0x2f6820, _0x305e53), _0x4637f7);
                    _this8.dequeue();
                });
            }
        },
        {
            key: 'dequeue',
            value() {
                while (this._state === DEFAULT && this._queue.length) {
                    var _0x471793 = this._queue.shift();
                    this._bufferedBytes -= _0x471793[3][kByteLength];
                    Reflect.apply(_0x471793[0], this, _0x471793.slice(1));
                }
            }
        },
        {
            key: 'enqueue',
            value(_0x5aac26) {
                this._bufferedBytes += _0x5aac26[3][kByteLength];
                this._queue.push(_0x5aac26);
            }
        },
        {
            key: 'sendFrame',
            value(_0xaf6b8d, _0x487be9) {
                if (_0xaf6b8d.length === 2) {
                    this._socket.cork();
                    this._socket.write(_0xaf6b8d[0]);
                    this._socket.write(_0xaf6b8d[1], _0x487be9);
                    this._socket.uncork();
                } else {
                    this._socket.write(_0xaf6b8d[0], _0x487be9);
                }
            }
        }
    ], [{
            key: 'frame',
            value(_0x5dffd0, _0xc9db77) {
                var _0x3b9d37;
                var _0x9f8865 = false;
                var _0x3de235 = 2;
                var _0x395682 = false;
                if (_0xc9db77.mask) {
                    _0x3b9d37 = _0xc9db77.maskBuffer || maskBuffer;
                    if (_0xc9db77.generateMask) {
                        _0xc9db77.generateMask(_0x3b9d37);
                    } else {
                        if (randomPoolPointer === RANDOM_POOL_SIZE) {
                            if (randomPool === undefined) {
                                randomPool = Buffer.alloc(RANDOM_POOL_SIZE);
                            }
                            randomFillSync(randomPool, 0, RANDOM_POOL_SIZE);
                            randomPoolPointer = 0;
                        }
                        _0x3b9d37[0] = randomPool[randomPoolPointer++];
                        _0x3b9d37[1] = randomPool[randomPoolPointer++];
                        _0x3b9d37[2] = randomPool[randomPoolPointer++];
                        _0x3b9d37[3] = randomPool[randomPoolPointer++];
                    }
                    _0x395682 = (_0x3b9d37[0] | _0x3b9d37[1] | _0x3b9d37[2] | _0x3b9d37[3]) === 0;
                    _0x3de235 = 6;
                }
                var _0xcc1a06;
                if (typeof _0x5dffd0 === 'string') {
                    if ((!_0xc9db77.mask || _0x395682) && _0xc9db77[kByteLength] !== undefined) {
                        _0xcc1a06 = _0xc9db77[kByteLength];
                    } else {
                        _0x5dffd0 = Buffer.from(_0x5dffd0);
                        _0xcc1a06 = _0x5dffd0.length;
                    }
                } else {
                    _0xcc1a06 = _0x5dffd0.length;
                    _0x9f8865 = _0xc9db77.mask && _0xc9db77.readOnly && !_0x395682;
                }
                var _0x4b384f = _0xcc1a06;
                if (_0xcc1a06 >= 65536) {
                    _0x3de235 += 8;
                    _0x4b384f = 127;
                } else if (_0xcc1a06 > 125) {
                    _0x3de235 += 2;
                    _0x4b384f = 126;
                }
                var _0x304228 = Buffer.allocUnsafe(_0x9f8865 ? _0xcc1a06 + _0x3de235 : _0x3de235);
                if (_0xc9db77.fin) {
                    _0x304228[0] = _0xc9db77.opcode | 128;
                } else {
                    _0x304228[0] = _0xc9db77.opcode;
                }
                if (_0xc9db77.rsv1) {
                    _0x304228[0] |= 64;
                }
                _0x304228[1] = _0x4b384f;
                if (_0x4b384f === 126) {
                    _0x304228.writeUInt16BE(_0xcc1a06, 2);
                } else if (_0x4b384f === 127) {
                    _0x304228[2] = _0x304228[3] = 0;
                    _0x304228.writeUIntBE(_0xcc1a06, 4, 6);
                }
                if (!_0xc9db77.mask) {
                    return [
                        _0x304228,
                        _0x5dffd0
                    ];
                }
                _0x304228[1] |= 128;
                _0x304228[_0x3de235 - 4] = _0x3b9d37[0];
                _0x304228[_0x3de235 - 3] = _0x3b9d37[1];
                _0x304228[_0x3de235 - 2] = _0x3b9d37[2];
                _0x304228[_0x3de235 - 1] = _0x3b9d37[3];
                if (_0x395682) {
                    return [
                        _0x304228,
                        _0x5dffd0
                    ];
                }
                if (_0x9f8865) {
                    applyMask(_0x5dffd0, _0x3b9d37, _0x304228, _0x3de235, _0xcc1a06);
                    return [_0x304228];
                }
                applyMask(_0x5dffd0, _0x3b9d37, _0x5dffd0, 0, _0xcc1a06);
                return [
                    _0x304228,
                    _0x5dffd0
                ];
            }
        }]);
}();
module.exports = Sender;
function callCallbacks(_0x236b65, _0x30d2d9, _0x27c8db) {
    if (typeof _0x27c8db === 'function') {
        _0x27c8db(_0x30d2d9);
    }
    for (var _0x2f85da = 0; _0x2f85da < _0x236b65._queue.length; _0x2f85da++) {
        var _0x2ff6cf = _0x236b65._queue[_0x2f85da];
        var _0x4c66b8 = _0x2ff6cf[_0x2ff6cf.length - 1];
        if (typeof _0x4c66b8 === 'function') {
            _0x4c66b8(_0x30d2d9);
        }
    }
}
function onError(_0x2ccd41, _0x3caf9f, _0x4c9756) {
    callCallbacks(_0x2ccd41, _0x3caf9f, _0x4c9756);
    _0x2ccd41.onerror(_0x3caf9f);
}