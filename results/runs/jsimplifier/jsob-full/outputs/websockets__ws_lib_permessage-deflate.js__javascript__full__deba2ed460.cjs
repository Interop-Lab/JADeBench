'use strict';
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
var __commonJS = function __commonJS(_0x3746eb, _0x379dd1) {
    return function _0x73f4de() {
        if (!_0x379dd1) {
            _0x3746eb[__getOwnPropNames_new(_0x3746eb)[0]]((_0x379dd1 = { exports: {} }).exports, _0x379dd1);
        }
        return _0x379dd1.exports;
    };
};
var require_constants = __commonJS({
    '../work/websockets__ws/lib/constants.js'(_0x2794e4, _0x481694) {
        'use strict';
        'use strict';
        var _0x51be2b = [
            'nodebuffer',
            'arraybuffer',
            'fragments'
        ];
        var _0x90bb5c = typeof Blob !== 'undefined';
        if (_0x90bb5c) {
            _0x51be2b.push('blob');
        }
        _0x481694.exports = {
            BINARY_TYPES: _0x51be2b,
            CLOSE_TIMEOUT: 30000,
            EMPTY_BUFFER: Buffer.alloc(0),
            GUID: '258EAFA5-E914-47DA-95CA-C5AB0DC85B11',
            hasBlob: _0x90bb5c,
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
    '../work/websockets__ws/lib/buffer-util.js'(_0x576b90, _0x4cb145) {
        'use strict';
        var _require_constants = require_constants();
        var _0x42a507 = _require_constants.EMPTY_BUFFER;
        var _0x9fb7f7 = Buffer[Symbol.species];
        function _0x3f35e1(_0x426ec4, _0x478a95) {
            if (_0x426ec4.length === 0) {
                return _0x42a507;
            }
            if (_0x426ec4.length === 1) {
                return _0x426ec4[0];
            }
            var _0x242ab1 = Buffer.allocUnsafe(_0x478a95);
            var _0x4a1a62 = 0;
            for (var _0x583ec7 = 0; _0x583ec7 < _0x426ec4.length; _0x583ec7++) {
                var _0x379a62 = _0x426ec4[_0x583ec7];
                _0x242ab1.set(_0x379a62, _0x4a1a62);
                _0x4a1a62 += _0x379a62.length;
            }
            if (_0x4a1a62 < _0x478a95) {
                return new _0x9fb7f7(_0x242ab1.buffer, _0x242ab1.byteOffset, _0x4a1a62);
            }
            return _0x242ab1;
        }
        function _0x395d44(_0x42b960, _0x2755af, _0x3d75be, _0x29a591, _0x63875a) {
            for (var _0x53bb3a = 0; _0x53bb3a < _0x63875a; _0x53bb3a++) {
                _0x3d75be[_0x29a591 + _0x53bb3a] = _0x42b960[_0x53bb3a] ^ _0x2755af[_0x53bb3a & 3];
            }
        }
        function _0x1ba0ed(_0x3f61f4, _0x4c7bad) {
            for (var _0x3fd328 = 0; _0x3fd328 < _0x3f61f4.length; _0x3fd328++) {
                _0x3f61f4[_0x3fd328] ^= _0x4c7bad[_0x3fd328 & 3];
            }
        }
        function _0x23a993(_0x4d37ce) {
            if (_0x4d37ce.length === _0x4d37ce.buffer.byteLength) {
                return _0x4d37ce.buffer;
            }
            return _0x4d37ce.buffer.slice(_0x4d37ce.byteOffset, _0x4d37ce.byteOffset + _0x4d37ce.length);
        }
        function _0x16ac0e(_0x4c47ef) {
            _0x16ac0e.readOnly = true;
            if (Buffer.isBuffer(_0x4c47ef)) {
                return _0x4c47ef;
            }
            var _0x548ab3;
            if (_0x4c47ef instanceof ArrayBuffer) {
                _0x548ab3 = new _0x9fb7f7(_0x4c47ef);
            } else if (ArrayBuffer.isView(_0x4c47ef)) {
                _0x548ab3 = new _0x9fb7f7(_0x4c47ef.buffer, _0x4c47ef.byteOffset, _0x4c47ef.byteLength);
            } else {
                _0x548ab3 = Buffer.from(_0x4c47ef);
                _0x16ac0e.readOnly = false;
            }
            return _0x548ab3;
        }
        var _0x181a0e = {
            concat: _0x3f35e1,
            mask: _0x395d44,
            toArrayBuffer: _0x23a993,
            toBuffer: _0x16ac0e,
            unmask: _0x1ba0ed
        };
        _0x4cb145.exports = _0x181a0e;
        if (!process.env.WS_NO_BUFFER_UTIL) {
            try {
                var _0x3e19aa = require('bufferutil');
                _0x4cb145.exports.mask = function (_0x2a5a85, _0x4d9a6f, _0x2c5729, _0x36dd68, _0x4d37ea) {
                    if (_0x4d37ea < 48) {
                        _0x395d44(_0x2a5a85, _0x4d9a6f, _0x2c5729, _0x36dd68, _0x4d37ea);
                    } else {
                        _0x3e19aa.mask(_0x2a5a85, _0x4d9a6f, _0x2c5729, _0x36dd68, _0x4d37ea);
                    }
                };
                _0x4cb145.exports.unmask = function (_0x521a15, _0x1d63a5) {
                    if (_0x521a15.length < 32) {
                        _0x1ba0ed(_0x521a15, _0x1d63a5);
                    } else {
                        _0x3e19aa.unmask(_0x521a15, _0x1d63a5);
                    }
                };
            } catch (_0x533014) {
                null;
            }
        }
    }
});
var require_limiter = __commonJS({
    '../work/websockets__ws/lib/limiter.js'(_0x191302, _0xbc191e) {
        'use strict';
        var _0x11230b = Symbol('kDone');
        var _0x591f36 = Symbol('kRun');
        var _0x5ea68e = function () {
            function _0x5ea68e(_0x281fad) {
                var _this = this;
                _classCallCheck(this, _0x5ea68e);
                this[_0x11230b] = function () {
                    _this.pending--;
                    _this[_0x591f36]();
                };
                this.concurrency = _0x281fad || Infinity;
                this.jobs = [];
                this.pending = 0;
            }
            return _createClass(_0x5ea68e, [
                {
                    key: 'add',
                    value(_0xb6d81e) {
                        this.jobs.push(_0xb6d81e);
                        this[_0x591f36]();
                    }
                },
                {
                    key: _0x591f36,
                    value() {
                        if (this.pending === this.concurrency) {
                            return;
                        }
                        if (this.jobs.length) {
                            var _0x5397d2 = this.jobs.shift();
                            this.pending++;
                            _0x5397d2(this[_0x11230b]);
                        }
                    }
                }
            ]);
        }();
        _0xbc191e.exports = _0x5ea68e;
    }
});
var zlib = require('zlib');
var bufferUtil = require_buffer_util();
var Limiter = require_limiter();
var _require_constants2 = require_constants();
var kStatusCode = _require_constants2.kStatusCode;
var FastBuffer = Buffer[Symbol.species];
var TRAILER = Buffer.from([
    0,
    0,
    255,
    255
]);
var kPerMessageDeflate = Symbol('permessage-deflate');
var kTotalLength = Symbol('total-length');
var kCallback = Symbol('callback');
var kBuffers = Symbol('buffers');
var kError = Symbol('error');
var zlibLimiter;
var PerMessageDeflate = function () {
    function PerMessageDeflate(_0x2051ee) {
        _classCallCheck(this, PerMessageDeflate);
        this._options = _0x2051ee || {};
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
        if (!zlibLimiter) {
            var _0x46a19f = this._options.concurrencyLimit !== undefined ? this._options.concurrencyLimit : 10;
            zlibLimiter = new Limiter(_0x46a19f);
        }
    }
    return _createClass(PerMessageDeflate, [
        {
            key: 'offer',
            value() {
                var _0x242ecb = {};
                if (this._options.serverNoContextTakeover) {
                    _0x242ecb.server_no_context_takeover = true;
                }
                if (this._options.clientNoContextTakeover) {
                    _0x242ecb.client_no_context_takeover = true;
                }
                if (this._options.serverMaxWindowBits) {
                    _0x242ecb.server_max_window_bits = this._options.serverMaxWindowBits;
                }
                if (this._options.clientMaxWindowBits) {
                    _0x242ecb.client_max_window_bits = this._options.clientMaxWindowBits;
                } else if (this._options.clientMaxWindowBits == null) {
                    _0x242ecb.client_max_window_bits = true;
                }
                return _0x242ecb;
            }
        },
        {
            key: 'accept',
            value(_0x393334) {
                _0x393334 = this.normalizeParams(_0x393334);
                if (this._isServer) {
                    this.params = this.acceptAsServer(_0x393334);
                } else {
                    this.params = this.acceptAsClient(_0x393334);
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
                    var _0x4c1804 = this._deflate[kCallback];
                    this._deflate.close();
                    this._deflate = null;
                    if (_0x4c1804) {
                        _0x4c1804(new Error('The deflate stream was closed while data was being processed'));
                    }
                }
            }
        },
        {
            key: 'acceptAsServer',
            value(_0x4b6769) {
                var _0xa70420 = this._options;
                var _0x16d399 = _0x4b6769.find(function (_0x395683) {
                    if (_0xa70420.serverNoContextTakeover === false && _0x395683.server_no_context_takeover || _0x395683.server_max_window_bits && (_0xa70420.serverMaxWindowBits === false || typeof _0xa70420.serverMaxWindowBits === 'number' && _0xa70420.serverMaxWindowBits > _0x395683.server_max_window_bits) || typeof _0xa70420.clientMaxWindowBits === 'number' && !_0x395683.client_max_window_bits) {
                        return false;
                    }
                    return true;
                });
                if (!_0x16d399) {
                    throw new Error('None of the extension offers can be accepted');
                }
                if (_0xa70420.serverNoContextTakeover) {
                    _0x16d399.server_no_context_takeover = true;
                }
                if (_0xa70420.clientNoContextTakeover) {
                    _0x16d399.client_no_context_takeover = true;
                }
                if (typeof _0xa70420.serverMaxWindowBits === 'number') {
                    _0x16d399.server_max_window_bits = _0xa70420.serverMaxWindowBits;
                }
                if (typeof _0xa70420.clientMaxWindowBits === 'number') {
                    _0x16d399.client_max_window_bits = _0xa70420.clientMaxWindowBits;
                } else if (_0x16d399.client_max_window_bits === true || _0xa70420.clientMaxWindowBits === false) {
                }
                return _0x16d399;
            }
        },
        {
            key: 'acceptAsClient',
            value(_0x1ae337) {
                var _0x3fe9b8 = _0x1ae337[0];
                if (this._options.clientNoContextTakeover === false && _0x3fe9b8.client_no_context_takeover) {
                    throw new Error('Unexpected parameter "client_no_context_takeover"');
                }
                if (!_0x3fe9b8.client_max_window_bits) {
                    if (typeof this._options.clientMaxWindowBits === 'number') {
                        _0x3fe9b8.client_max_window_bits = this._options.clientMaxWindowBits;
                    }
                } else if (this._options.clientMaxWindowBits === false || typeof this._options.clientMaxWindowBits === 'number' && _0x3fe9b8.client_max_window_bits > this._options.clientMaxWindowBits) {
                    throw new Error('Unexpected or invalid parameter "client_max_window_bits"');
                }
                return _0x3fe9b8;
            }
        },
        {
            key: 'normalizeParams',
            value(_0x1d1571) {
                var _this2 = this;
                _0x1d1571.forEach(function (_0x4b4f4f) {
                    Object.keys(_0x4b4f4f).forEach(function (_0x4fbe9c) {
                        var _0x5eb9c3 = _0x4b4f4f[_0x4fbe9c];
                        if (_0x5eb9c3.length > 1) {
                            throw new Error('Parameter "' + _0x4fbe9c + '" must have only a single value');
                        }
                        _0x5eb9c3 = _0x5eb9c3[0];
                        if (_0x4fbe9c === 'client_max_window_bits') {
                            if (_0x5eb9c3 !== true) {
                                var _0x5ea891 = +_0x5eb9c3;
                                if (!Number.isInteger(_0x5ea891) || _0x5ea891 < 8 || _0x5ea891 > 15) {
                                    throw new TypeError('Invalid value for parameter "' + _0x4fbe9c + '": ' + _0x5eb9c3);
                                }
                                _0x5eb9c3 = _0x5ea891;
                            } else if (!_this2._isServer) {
                                throw new TypeError('Invalid value for parameter "' + _0x4fbe9c + '": ' + _0x5eb9c3);
                            }
                        } else if (_0x4fbe9c === 'server_max_window_bits') {
                            var _0x2c56b6 = +_0x5eb9c3;
                            if (!Number.isInteger(_0x2c56b6) || _0x2c56b6 < 8 || _0x2c56b6 > 15) {
                                throw new TypeError('Invalid value for parameter "' + _0x4fbe9c + '": ' + _0x5eb9c3);
                            }
                            _0x5eb9c3 = _0x2c56b6;
                        } else if (_0x4fbe9c === 'client_no_context_takeover' || _0x4fbe9c === 'server_no_context_takeover') {
                            if (_0x5eb9c3 !== true) {
                                throw new TypeError('Invalid value for parameter "' + _0x4fbe9c + '": ' + _0x5eb9c3);
                            }
                        } else {
                            throw new Error('Unknown parameter "' + _0x4fbe9c + '"');
                        }
                        _0x4b4f4f[_0x4fbe9c] = _0x5eb9c3;
                    });
                });
                return _0x1d1571;
            }
        },
        {
            key: 'decompress',
            value(_0x52b453, _0x46b37c, _0x35b527) {
                var _this3 = this;
                zlibLimiter.add(function (_0x115bd7) {
                    _this3._decompress(_0x52b453, _0x46b37c, function (_0x569292, _0x51fba8) {
                        _0x115bd7();
                        _0x35b527(_0x569292, _0x51fba8);
                    });
                });
            }
        },
        {
            key: 'compress',
            value(_0x48b2d8, _0x29e950, _0x13a658) {
                var _this4 = this;
                zlibLimiter.add(function (_0x16b233) {
                    _this4._compress(_0x48b2d8, _0x29e950, function (_0x1e4a5a, _0x20482c) {
                        _0x16b233();
                        _0x13a658(_0x1e4a5a, _0x20482c);
                    });
                });
            }
        },
        {
            key: '_decompress',
            value(_0x178568, _0x2aaf10, _0x47b17f) {
                var _this5 = this;
                var _0x3a5059 = this._isServer ? 'client' : 'server';
                if (!this._inflate) {
                    var _0x4078d4 = _0x3a5059 + '_max_window_bits';
                    var _0x2a8ee4 = typeof this.params[_0x4078d4] !== 'number' ? zlib.Z_DEFAULT_WINDOWBITS : this.params[_0x4078d4];
                    this._inflate = zlib.createInflateRaw(Object.assign({}, this._options.zlibInflateOptions, { windowBits: _0x2a8ee4 }));
                    this._inflate[kPerMessageDeflate] = this;
                    this._inflate[kTotalLength] = 0;
                    this._inflate[kBuffers] = [];
                    this._inflate.on('error', inflateOnError);
                    this._inflate.on('data', inflateOnData);
                }
                this._inflate[kCallback] = _0x47b17f;
                this._inflate.write(_0x178568);
                if (_0x2aaf10) {
                    this._inflate.write(TRAILER);
                }
                this._inflate.flush(function () {
                    var _0x202a5a = _this5._inflate[kError];
                    if (_0x202a5a) {
                        _this5._inflate.close();
                        _this5._inflate = null;
                        _0x47b17f(_0x202a5a);
                        return;
                    }
                    var _0x54d0d0 = bufferUtil.concat(_this5._inflate[kBuffers], _this5._inflate[kTotalLength]);
                    if (_this5._inflate._readableState.endEmitted) {
                        _this5._inflate.close();
                        _this5._inflate = null;
                    } else {
                        _this5._inflate[kTotalLength] = 0;
                        _this5._inflate[kBuffers] = [];
                        if (_0x2aaf10 && _this5.params[_0x3a5059 + '_no_context_takeover']) {
                            _this5._inflate.reset();
                        }
                    }
                    _0x47b17f(null, _0x54d0d0);
                });
            }
        },
        {
            key: '_compress',
            value(_0x5297f3, _0x3411d2, _0xc2f42b) {
                var _this6 = this;
                var _0x9fd061 = this._isServer ? 'server' : 'client';
                if (!this._deflate) {
                    var _0x30d02a = _0x9fd061 + '_max_window_bits';
                    var _0x3dc7da = typeof this.params[_0x30d02a] !== 'number' ? zlib.Z_DEFAULT_WINDOWBITS : this.params[_0x30d02a];
                    this._deflate = zlib.createDeflateRaw(Object.assign({}, this._options.zlibDeflateOptions, { windowBits: _0x3dc7da }));
                    this._deflate[kTotalLength] = 0;
                    this._deflate[kBuffers] = [];
                    this._deflate.on('data', deflateOnData);
                }
                this._deflate[kCallback] = _0xc2f42b;
                this._deflate.write(_0x5297f3);
                this._deflate.flush(zlib.Z_SYNC_FLUSH, function () {
                    if (!_this6._deflate) {
                        return;
                    }
                    var _0x1a9b12 = bufferUtil.concat(_this6._deflate[kBuffers], _this6._deflate[kTotalLength]);
                    if (_0x3411d2) {
                        _0x1a9b12 = new FastBuffer(_0x1a9b12.buffer, _0x1a9b12.byteOffset, _0x1a9b12.length - 4);
                    }
                    _this6._deflate[kCallback] = null;
                    _this6._deflate[kTotalLength] = 0;
                    _this6._deflate[kBuffers] = [];
                    if (_0x3411d2 && _this6.params[_0x9fd061 + '_no_context_takeover']) {
                        _this6._deflate.reset();
                    }
                    _0xc2f42b(null, _0x1a9b12);
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
module.exports = PerMessageDeflate;
function deflateOnData(_0x446020) {
    this[kBuffers].push(_0x446020);
    this[kTotalLength] += _0x446020.length;
}
function inflateOnData(_0x4ac8e0) {
    this[kTotalLength] += _0x4ac8e0.length;
    if (this[kPerMessageDeflate]._maxPayload < 1 || this[kTotalLength] <= this[kPerMessageDeflate]._maxPayload) {
        this[kBuffers].push(_0x4ac8e0);
        return;
    }
    this[kError] = new RangeError('Max payload size exceeded');
    this[kError].code = 'WS_ERR_UNSUPPORTED_MESSAGE_LENGTH';
    this[kError][kStatusCode] = 1009;
    this.removeListener('data', inflateOnData);
    this.reset();
}
function inflateOnError(_0x519d8a) {
    this[kPerMessageDeflate]._inflate = null;
    if (this[kError]) {
        this[kCallback](this[kError]);
        return;
    }
    _0x519d8a[kStatusCode] = 1007;
    this[kCallback](_0x519d8a);
}