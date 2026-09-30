'use strict';
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = function __commonJS(_0x2ec809, _0x3cfe27) {
    return function _0x45a96c() {
        if (!_0x3cfe27) {
            _0x2ec809[__getOwnPropNames_new(_0x2ec809)[0]]((_0x3cfe27 = { exports: {} }).exports, _0x3cfe27);
        }
        return _0x3cfe27.exports;
    };
};
var require_constants = __commonJS({
    '../work/websockets__ws/lib/constants.js'(_0x281811, _0x18abf1) {
        'use strict';
        'use strict';
        var _0x3b0f92 = [
            'nodebuffer',
            'arraybuffer',
            'fragments'
        ];
        var _0x837aaf = typeof Blob !== 'undefined';
        if (_0x837aaf) {
            _0x3b0f92.push('blob');
        }
        _0x18abf1.exports = {
            BINARY_TYPES: _0x3b0f92,
            CLOSE_TIMEOUT: 30000,
            EMPTY_BUFFER: Buffer.alloc(0),
            GUID: '258EAFA5-E914-47DA-95CA-C5AB0DC85B11',
            hasBlob: _0x837aaf,
            kForOnEventAttribute: Symbol('kIsForOnEventAttribute'),
            kListener: Symbol('kListener'),
            kStatusCode: Symbol('status-code'),
            kWebSocket: Symbol('websocket'),
            NOOP() {
            }
        };
    }
});
var _require_constants = require_constants();
var EMPTY_BUFFER = _require_constants.EMPTY_BUFFER;
var FastBuffer = Buffer[Symbol.species];
function concat(_0x3c164a, _0xe83ae5) {
    if (_0x3c164a.length === 0) {
        return EMPTY_BUFFER;
    }
    if (_0x3c164a.length === 1) {
        return _0x3c164a[0];
    }
    var _0xd246be = Buffer.allocUnsafe(_0xe83ae5);
    var _0x2ecdd2 = 0;
    for (var _0xbd485a = 0; _0xbd485a < _0x3c164a.length; _0xbd485a++) {
        var _0xa351e2 = _0x3c164a[_0xbd485a];
        _0xd246be.set(_0xa351e2, _0x2ecdd2);
        _0x2ecdd2 += _0xa351e2.length;
    }
    if (_0x2ecdd2 < _0xe83ae5) {
        return new FastBuffer(_0xd246be.buffer, _0xd246be.byteOffset, _0x2ecdd2);
    }
    return _0xd246be;
}
function _mask(_0x548b26, _0x1c8237, _0x4c526a, _0x1c75b4, _0x386315) {
    for (var _0x1acab7 = 0; _0x1acab7 < _0x386315; _0x1acab7++) {
        _0x4c526a[_0x1c75b4 + _0x1acab7] = _0x548b26[_0x1acab7] ^ _0x1c8237[_0x1acab7 & 3];
    }
}
function _unmask(_0xacca13, _0x29059f) {
    for (var _0x5aa24b = 0; _0x5aa24b < _0xacca13.length; _0x5aa24b++) {
        _0xacca13[_0x5aa24b] ^= _0x29059f[_0x5aa24b & 3];
    }
}
function toArrayBuffer(_0x401fe4) {
    if (_0x401fe4.length === _0x401fe4.buffer.byteLength) {
        return _0x401fe4.buffer;
    }
    return _0x401fe4.buffer.slice(_0x401fe4.byteOffset, _0x401fe4.byteOffset + _0x401fe4.length);
}
function toBuffer(_0x2ce9fd) {
    toBuffer.readOnly = true;
    if (Buffer.isBuffer(_0x2ce9fd)) {
        return _0x2ce9fd;
    }
    var _0x379872;
    if (_0x2ce9fd instanceof ArrayBuffer) {
        _0x379872 = new FastBuffer(_0x2ce9fd);
    } else if (ArrayBuffer.isView(_0x2ce9fd)) {
        _0x379872 = new FastBuffer(_0x2ce9fd.buffer, _0x2ce9fd.byteOffset, _0x2ce9fd.byteLength);
    } else {
        _0x379872 = Buffer.from(_0x2ce9fd);
        toBuffer.readOnly = false;
    }
    return _0x379872;
}
var _0x1d8347 = {
    concat: concat,
    mask: _mask,
    toArrayBuffer: toArrayBuffer,
    toBuffer: toBuffer,
    unmask: _unmask
};
module.exports = _0x1d8347;
if (!process.env.WS_NO_BUFFER_UTIL) {
    try {
        var bufferUtil = require('bufferutil');
        module.exports.mask = function (_0x3075b6, _0x2bca61, _0x2606a7, _0x33f6b9, _0x155943) {
            if (_0x155943 < 48) {
                _mask(_0x3075b6, _0x2bca61, _0x2606a7, _0x33f6b9, _0x155943);
            } else {
                bufferUtil.mask(_0x3075b6, _0x2bca61, _0x2606a7, _0x33f6b9, _0x155943);
            }
        };
        module.exports.unmask = function (_0x412d64, _0x46c0dd) {
            if (_0x412d64.length < 32) {
                _unmask(_0x412d64, _0x46c0dd);
            } else {
                bufferUtil.unmask(_0x412d64, _0x46c0dd);
            }
        };
    } catch (_0x4f4c90) {
        null;
    }
}