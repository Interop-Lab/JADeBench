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
var __commonJS = function __commonJS(_0x56ece8, _0x5d2559) {
    return function _0x1d2f0d() {
        if (!_0x5d2559) {
            _0x56ece8[__getOwnPropNames_new(_0x56ece8)[0]]((_0x5d2559 = { exports: {} }).exports, _0x5d2559);
        }
        return _0x5d2559.exports;
    };
};
var require_platform = __commonJS({
    '../work/mtth__avsc/lib/platform.js'(_0x23b052, _0x2b3d9a) {
        var _0x19aed3 = require('crypto');
        function _0x107e33(_0x518299, _0x471f59) {
            _0x471f59 = _0x471f59 || 'md5';
            var _0x28bc43 = _0x19aed3.createHash(_0x471f59);
            _0x28bc43.end(_0x518299);
            var _0x1e982a = _0x28bc43.read();
            return new Uint8Array(_0x1e982a.buffer, _0x1e982a.byteOffset, _0x1e982a.length);
        }
        var _0x39e8af = { getHash: _0x107e33 };
        _0x2b3d9a.exports = _0x39e8af;
    }
});
var platform = require_platform();
var NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;
function isBufferLike(_0x4d4be8) {
    return _0x4d4be8 instanceof Uint8Array;
}
function capitalize(_0x24a4ce) {
    return _0x24a4ce.charAt(0).toUpperCase() + _0x24a4ce.slice(1);
}
function compare(_0xc009b9, _0x27ae52) {
    if (_0xc009b9 === _0x27ae52) {
        return 0;
    } else if (_0xc009b9 < _0x27ae52) {
        return -1;
    } else {
        return 1;
    }
}
var bufCompare;
var bufEqual;
if (typeof Buffer == 'function') {
    bufCompare = Buffer.compare;
    bufEqual = function bufEqual(_0xf79419, _0x32dbe1) {
        return Buffer.prototype.equals.call(_0xf79419, _0x32dbe1);
    };
} else {
    bufCompare = function bufCompare(_0x494807, _0x26b08d) {
        if (_0x494807 === _0x26b08d) {
            return 0;
        }
        var _0x122712 = Math.min(_0x494807.length, _0x26b08d.length);
        for (var _0x57d8d4 = 0; _0x57d8d4 < _0x122712; _0x57d8d4++) {
            if (_0x494807[_0x57d8d4] !== _0x26b08d[_0x57d8d4]) {
                return Math.sign(_0x494807[_0x57d8d4] - _0x26b08d[_0x57d8d4]);
            }
        }
        return Math.sign(_0x494807.length - _0x26b08d.length);
    };
    bufEqual = function bufEqual(_0x54ffa8, _0x347ac7) {
        if (_0x54ffa8.length !== _0x347ac7.length) {
            return false;
        }
        return bufCompare(_0x54ffa8, _0x347ac7) === 0;
    };
}
function getOption(_0x3a6b9f, _0x23bf15, _0x3848e2) {
    var _0x3135fd = _0x3a6b9f[_0x23bf15];
    if (_0x3135fd === undefined) {
        return _0x3848e2;
    } else {
        return _0x3135fd;
    }
}
function singleIndexOf(_0x4381ca, _0x318bc4) {
    var _0x49afe0 = -1;
    if (!_0x4381ca) {
        return -1;
    }
    for (var _0xb78ac5 = 0, _0x54ef25 = _0x4381ca.length; _0xb78ac5 < _0x54ef25; _0xb78ac5++) {
        if (_0x4381ca[_0xb78ac5] === _0x318bc4) {
            if (_0x49afe0 >= 0) {
                return -2;
            }
            _0x49afe0 = _0xb78ac5;
        }
    }
    return _0x49afe0;
}
function toMap(_0x23dfb3, _0x35299c) {
    var _0x43c83b = {};
    for (var _0xca672e = 0; _0xca672e < _0x23dfb3.length; _0xca672e++) {
        var _0x5ea9ca = _0x23dfb3[_0xca672e];
        _0x43c83b[_0x35299c(_0x5ea9ca)] = _0x5ea9ca;
    }
    return _0x43c83b;
}
function objectValues(_0x56a0bf) {
    return Object.keys(_0x56a0bf).map(function (_0x4ba68a) {
        return _0x56a0bf[_0x4ba68a];
    });
}
function hasDuplicates(_0x1d6daa, _0x440419) {
    var _0x384eb9 = Object.create(null);
    for (var _0x384626 = 0, _0x4df9c0 = _0x1d6daa.length; _0x384626 < _0x4df9c0; _0x384626++) {
        var _0xed5569 = _0x1d6daa[_0x384626];
        if (_0x440419) {
            _0xed5569 = _0x440419(_0xed5569);
        }
        if (_0x384eb9[_0xed5569]) {
            return true;
        }
        _0x384eb9[_0xed5569] = true;
    }
    return false;
}
function copyOwnProperties(_0x27faa8, _0x281923, _0x40e16f) {
    var _0x28aced = Object.getOwnPropertyNames(_0x27faa8);
    for (var _0x555e3e = 0, _0x487c98 = _0x28aced.length; _0x555e3e < _0x487c98; _0x555e3e++) {
        var _0x1dcfeb = _0x28aced[_0x555e3e];
        if (!Object.prototype.hasOwnProperty.call(_0x281923, _0x1dcfeb) || _0x40e16f) {
            var _0x3e081e = Object.getOwnPropertyDescriptor(_0x27faa8, _0x1dcfeb);
            Object.defineProperty(_0x281923, _0x1dcfeb, _0x3e081e);
        }
    }
    return _0x281923;
}
function isValidName(_0x101aeb) {
    return NAME_PATTERN.test(_0x101aeb);
}
function qualify(_0x3c3110, _0x394a32) {
    if (~_0x3c3110.indexOf('.')) {
        _0x3c3110 = _0x3c3110.replace(/^\./, '');
    } else if (_0x394a32) {
        _0x3c3110 = _0x394a32 + '.' + _0x3c3110;
    }
    _0x3c3110.split('.').forEach(function (_0xab21d) {
        if (!isValidName(_0xab21d)) {
            throw new Error('invalid name: ' + printJSON(_0x3c3110));
        }
    });
    return _0x3c3110;
}
function unqualify(_0x307805) {
    var _0xbcbe7c = _0x307805.split('.');
    return _0xbcbe7c[_0xbcbe7c.length - 1];
}
function impliedNamespace(_0xd7512d) {
    var _0x50787e = /^(.*)\.[^.]+$/.exec(_0xd7512d);
    if (_0x50787e) {
        return _0x50787e[1];
    } else {
        return undefined;
    }
}
function jsonEnd(_0x1d81b2, _0x4b1c25) {
    _0x4b1c25 = _0x4b1c25 | 0;
    var _0x3c1f35 = _0x1d81b2.charAt(_0x4b1c25++);
    if (/[\d-]/.test(_0x3c1f35)) {
        while (/[eE\d.+-]/.test(_0x1d81b2.charAt(_0x4b1c25))) {
            _0x4b1c25++;
        }
        return _0x4b1c25;
    } else if (/true|null/.test(_0x1d81b2.slice(_0x4b1c25 - 1, _0x4b1c25 + 3))) {
        return _0x4b1c25 + 3;
    } else if (/false/.test(_0x1d81b2.slice(_0x4b1c25 - 1, _0x4b1c25 + 4))) {
        return _0x4b1c25 + 4;
    }
    var _0x3f3404 = 0;
    var _0x5b55ab = false;
    do {
        switch (_0x3c1f35) {
        case '{':
        case '[':
            if (!_0x5b55ab) {
                _0x3f3404++;
            }
            break;
        case '}':
        case ']':
            if (!_0x5b55ab && !--_0x3f3404) {
                return _0x4b1c25;
            }
            break;
        case '"':
            _0x5b55ab = !_0x5b55ab;
            if (!_0x3f3404 && !_0x5b55ab) {
                return _0x4b1c25;
            }
            break;
        case '\\':
            _0x4b1c25++;
        }
    } while (_0x3c1f35 = _0x1d81b2.charAt(_0x4b1c25++));
    return -1;
}
function abstractFunction() {
    throw new Error('abstract');
}
var Lcg = function () {
    function Lcg(_0x591cc0) {
        _classCallCheck(this, Lcg);
        var _0x5a6a80 = 1103515245;
        var _0x1793f7 = 12345;
        var _0x9db160 = Math.pow(2, 31);
        var _0x54e46a = Math.floor(_0x591cc0 || Math.random() * (_0x9db160 - 1));
        this._max = _0x9db160;
        this._nextInt = function () {
            _0x54e46a = (_0x5a6a80 * _0x54e46a + _0x1793f7) % _0x9db160;
            return _0x54e46a;
        };
    }
    return _createClass(Lcg, [
        {
            key: 'nextBoolean',
            value() {
                return !!(this._nextInt() % 2);
            }
        },
        {
            key: 'nextInt',
            value(_0xee306e, _0x1ee912) {
                if (_0x1ee912 === undefined) {
                    _0x1ee912 = _0xee306e;
                    _0xee306e = 0;
                }
                if (_0x1ee912 === undefined) {
                    _0x1ee912 = this._max;
                } else {
                    _0x1ee912 = _0x1ee912;
                }
                return _0xee306e + Math.floor(this.nextFloat() * (_0x1ee912 - _0xee306e));
            }
        },
        {
            key: 'nextFloat',
            value(_0x463c63, _0x4331d1) {
                if (_0x4331d1 === undefined) {
                    _0x4331d1 = _0x463c63;
                    _0x463c63 = 0;
                }
                if (_0x4331d1 === undefined) {
                    _0x4331d1 = 1;
                } else {
                    _0x4331d1 = _0x4331d1;
                }
                return _0x463c63 + (_0x4331d1 - _0x463c63) * this._nextInt() / this._max;
            }
        },
        {
            key: 'nextString',
            value(_0x5940d6, _0x59c2f4) {
                _0x5940d6 |= 0;
                _0x59c2f4 = _0x59c2f4 || 'aA';
                var _0x125065 = '';
                if (_0x59c2f4.indexOf('a') > -1) {
                    _0x125065 += 'abcdefghijklmnopqrstuvwxyz';
                }
                if (_0x59c2f4.indexOf('A') > -1) {
                    _0x125065 += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                }
                if (_0x59c2f4.indexOf('#') > -1) {
                    _0x125065 += '0123456789';
                }
                if (_0x59c2f4.indexOf('!') > -1) {
                    _0x125065 += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';
                }
                var _0xb19802 = [];
                for (var _0x186187 = 0; _0x186187 < _0x5940d6; _0x186187++) {
                    _0xb19802.push(this.choice(_0x125065));
                }
                return _0xb19802.join('');
            }
        },
        {
            key: 'nextBuffer',
            value(_0x31b96e) {
                var _0x31a73f = new Uint8Array(_0x31b96e);
                for (var _0x4a5b38 = 0; _0x4a5b38 < _0x31b96e; _0x4a5b38++) {
                    _0x31a73f[_0x4a5b38] = this.nextInt(256);
                }
                return _0x31a73f;
            }
        },
        {
            key: 'choice',
            value(_0x409af4) {
                var _0x474e50 = _0x409af4.length;
                if (!_0x474e50) {
                    throw new Error('choosing from empty array');
                }
                return _0x409af4[this.nextInt(_0x474e50)];
            }
        }
    ]);
}();
var OrderedQueue = function () {
    function OrderedQueue() {
        _classCallCheck(this, OrderedQueue);
        this._index = 0;
        this._items = [];
    }
    return _createClass(OrderedQueue, [
        {
            key: 'push',
            value(_0x507bfa) {
                var _0x904ab3 = this._items;
                var _0x1a1c55 = _0x904ab3.length | 0;
                var _0x4fb592;
                _0x904ab3.push(_0x507bfa);
                while (_0x1a1c55 > 0 && _0x904ab3[_0x1a1c55].index < _0x904ab3[_0x4fb592 = _0x1a1c55 - 1 >> 1].index) {
                    _0x507bfa = _0x904ab3[_0x1a1c55];
                    _0x904ab3[_0x1a1c55] = _0x904ab3[_0x4fb592];
                    _0x904ab3[_0x4fb592] = _0x507bfa;
                    _0x1a1c55 = _0x4fb592;
                }
            }
        },
        {
            key: 'pop',
            value() {
                var _0x2da936 = this._items;
                var _0x488dea = _0x2da936.length - 1 | 0;
                var _0x56caca = _0x2da936[0];
                if (!_0x56caca || _0x56caca.index > this._index) {
                    return null;
                }
                this._index++;
                if (!_0x488dea) {
                    _0x2da936.pop();
                    return _0x56caca;
                }
                _0x2da936[0] = _0x2da936.pop();
                var _0x56fec2 = _0x488dea >> 1;
                var _0x49b7f4 = 0;
                var _0x5170eb;
                var _0x38c5b0;
                var _0x13fa96;
                var _0x400e0a;
                var _0x452ef9;
                var _0x13a413;
                var _0x465a16;
                while (_0x49b7f4 < _0x56fec2) {
                    _0x400e0a = _0x2da936[_0x49b7f4];
                    _0x5170eb = (_0x49b7f4 << 1) + 1;
                    _0x38c5b0 = _0x49b7f4 + 1 << 1;
                    _0x13a413 = _0x2da936[_0x5170eb];
                    _0x465a16 = _0x2da936[_0x38c5b0];
                    if (!_0x465a16 || _0x13a413.index <= _0x465a16.index) {
                        _0x452ef9 = _0x13a413;
                        _0x13fa96 = _0x5170eb;
                    } else {
                        _0x452ef9 = _0x465a16;
                        _0x13fa96 = _0x38c5b0;
                    }
                    if (_0x452ef9.index >= _0x400e0a.index) {
                        break;
                    }
                    _0x2da936[_0x13fa96] = _0x400e0a;
                    _0x2da936[_0x49b7f4] = _0x452ef9;
                    _0x49b7f4 = _0x13fa96;
                }
                return _0x56caca;
            }
        }
    ]);
}();
var decodeSlice;
if (typeof Buffer === 'function' && typeof Buffer.prototype.utf8Slice === 'function') {
    decodeSlice = Function.prototype.call.bind(Buffer.prototype.utf8Slice);
} else {
    var DECODER = new TextDecoder();
    decodeSlice = function decodeSlice(_0xf9668b, _0x21b192, _0x1ef640) {
        return DECODER.decode(_0xf9668b.subarray(_0x21b192, _0x1ef640));
    };
}
var ENCODER = new TextEncoder();
var encodeBuf = new Uint8Array(4096);
var encodeBufs = [];
function encodeSlice(_0x4dac3b) {
    var _ENCODER$encodeInto = ENCODER.encodeInto(_0x4dac3b, encodeBuf);
    var _0x4a01eb = _ENCODER$encodeInto.read;
    var _0x29b3c3 = _ENCODER$encodeInto.written;
    if (_0x4a01eb === _0x4dac3b.length) {
        if (!encodeBufs[_0x29b3c3]) {
            encodeBufs[_0x29b3c3] = encodeBuf.subarray(0, _0x29b3c3);
        }
        return encodeBufs[_0x29b3c3];
    }
    return ENCODER.encode(_0x4dac3b);
}
var utf8Length;
if (typeof Buffer === 'function') {
    utf8Length = Buffer.byteLength;
} else {
    utf8Length = function utf8Length(_0x4c27ed) {
        var _0x4599b4 = 0;
        while (true) {
            var _ENCODER$encodeInto2 = ENCODER.encodeInto(_0x4c27ed, encodeBuf);
            var _0x42f9a6 = _ENCODER$encodeInto2.read;
            var _0x455a3b = _ENCODER$encodeInto2.written;
            _0x4599b4 += _0x455a3b;
            if (_0x42f9a6 === _0x4c27ed.length) {
                break;
            }
            _0x4c27ed = _0x4c27ed.slice(_0x42f9a6);
        }
        return _0x4599b4;
    };
}
var bufferToBinaryString;
if (typeof Buffer === 'function' && typeof Buffer.prototype.latin1Slice === 'function') {
    bufferToBinaryString = Function.prototype.call.bind(Buffer.prototype.latin1Slice);
} else {
    bufferToBinaryString = function bufferToBinaryString(_0x8bc562) {
        var _0x1fc729 = '';
        var _0x514b02 = 0;
        var _0x257fdf = _0x8bc562.length;
        for (; _0x514b02 + 7 < _0x257fdf; _0x514b02 += 8) {
            _0x1fc729 += String.fromCharCode(_0x8bc562[_0x514b02], _0x8bc562[_0x514b02 + 1], _0x8bc562[_0x514b02 + 2], _0x8bc562[_0x514b02 + 3], _0x8bc562[_0x514b02 + 4], _0x8bc562[_0x514b02 + 5], _0x8bc562[_0x514b02 + 6], _0x8bc562[_0x514b02 + 7]);
        }
        for (; _0x514b02 < _0x257fdf; _0x514b02++) {
            _0x1fc729 += String.fromCharCode(_0x8bc562[_0x514b02]);
        }
        return _0x1fc729;
    };
}
var binaryStringToBuffer;
if (typeof Buffer === 'function') {
    binaryStringToBuffer = function binaryStringToBuffer(_0xf158c7) {
        var _0x1e9f20 = Buffer.from(_0xf158c7, 'binary');
        return new Uint8Array(_0x1e9f20.buffer, _0x1e9f20.byteOffset, _0x1e9f20.length);
    };
} else {
    binaryStringToBuffer = function binaryStringToBuffer(_0x4c03d1) {
        var _0x3dd061 = new Uint8Array(_0x4c03d1.length);
        for (var _0x1f4cb2 = 0; _0x1f4cb2 < _0x4c03d1.length; _0x1f4cb2++) {
            _0x3dd061[_0x1f4cb2] = _0x4c03d1.charCodeAt(_0x1f4cb2);
        }
        return Buffer.from(_0x3dd061);
    };
}
var FLOAT_VIEW = new DataView(new ArrayBuffer(8));
var Tap = function () {
    function _Tap(_0x902033, _0x1ca066) {
        _classCallCheck(this, _Tap);
        this.setData(_0x902033, _0x1ca066);
    }
    return _createClass(_Tap, [
        {
            key: 'setData',
            value(_0x10aca0, _0x5e0bac) {
                if (typeof Buffer === 'function' && _0x10aca0 instanceof Buffer) {
                    _0x10aca0 = new Uint8Array(_0x10aca0.buffer, _0x10aca0.byteOffset, _0x10aca0.length);
                }
                this.arr = _0x10aca0;
                this.pos = _0x5e0bac | 0;
                if (this.pos < 0) {
                    throw new Error('negative offset');
                }
            }
        },
        {
            key: 'length',
            get() {
                return this.arr.length;
            }
        },
        {
            key: 'reinitialize',
            value(_0x1686aa) {
                this.setData(new Uint8Array(_0x1686aa));
            }
        },
        {
            key: 'toBuffer',
            value() {
                return this.arr.slice(0, this.pos);
            }
        },
        {
            key: 'subarray',
            value(_0x403141, _0x5a8f28) {
                return this.arr.subarray(_0x403141, _0x5a8f28);
            }
        },
        {
            key: 'append',
            value(_0x3162fa) {
                var _0x20da83 = new Uint8Array(this.arr.length + _0x3162fa.length);
                _0x20da83.set(this.arr, 0);
                _0x20da83.set(_0x3162fa, this.arr.length);
                this.setData(_0x20da83, 0);
            }
        },
        {
            key: 'forward',
            value(_0x280a3b) {
                var _0x2e0d75 = this.arr.subarray(this.pos);
                var _0x5cf46b = new Uint8Array(_0x2e0d75.length + _0x280a3b.length);
                _0x5cf46b.set(_0x2e0d75, 0);
                _0x5cf46b.set(_0x280a3b, _0x2e0d75.length);
                this.setData(_0x5cf46b, 0);
            }
        },
        {
            key: 'isValid',
            value() {
                return this.pos <= this.arr.length;
            }
        },
        {
            key: '_invalidate',
            value() {
                this.pos = this.arr.length + 1;
            }
        },
        {
            key: 'readBoolean',
            value() {
                return !!this.arr[this.pos++];
            }
        },
        {
            key: 'skipBoolean',
            value() {
                this.pos++;
            }
        },
        {
            key: 'writeBoolean',
            value(_0x41e5fb) {
                this.arr[this.pos++] = !!_0x41e5fb;
            }
        },
        {
            key: 'readLong',
            value() {
                var _0xa2fab3 = 0;
                var _0x14ce77 = 0;
                var _0x52a3de = this.arr;
                var _0x4b4caf;
                var _0x135380;
                var _0x12eb21;
                var _0x29775b;
                do {
                    _0x4b4caf = _0x52a3de[this.pos++];
                    _0x135380 = _0x4b4caf & 128;
                    _0xa2fab3 |= (_0x4b4caf & 127) << _0x14ce77;
                    _0x14ce77 += 7;
                } while (_0x135380 && _0x14ce77 < 28);
                if (_0x135380) {
                    _0x12eb21 = _0xa2fab3;
                    _0x29775b = 268435456;
                    do {
                        _0x4b4caf = _0x52a3de[this.pos++];
                        _0x12eb21 += (_0x4b4caf & 127) * _0x29775b;
                        _0x29775b *= 128;
                    } while (_0x4b4caf & 128);
                    return (_0x12eb21 % 2 ? -(_0x12eb21 + 1) : _0x12eb21) / 2;
                }
                return _0xa2fab3 >> 1 ^ -(_0xa2fab3 & 1);
            }
        },
        {
            key: 'skipLong',
            value() {
                var _0x466d2f = this.arr;
                while (_0x466d2f[this.pos++] & 128) {
                }
            }
        },
        {
            key: 'writeLong',
            value(_0x16496b) {
                var _0x70121e = this.arr;
                var _0x493e0c;
                var _0x41e07f;
                if (_0x16496b >= -1073741824 && _0x16496b < 1073741824) {
                    if (_0x16496b >= 0) {
                        _0x41e07f = _0x16496b << 1;
                    } else {
                        _0x41e07f = ~_0x16496b << 1 | 1;
                    }
                    do {
                        _0x70121e[this.pos] = _0x41e07f & 127;
                        _0x41e07f >>= 7;
                    } while (_0x41e07f && (_0x70121e[this.pos++] |= 128));
                } else {
                    if (_0x16496b >= 0) {
                        _0x493e0c = _0x16496b * 2;
                    } else {
                        _0x493e0c = -_0x16496b * 2 - 1;
                    }
                    do {
                        _0x70121e[this.pos] = _0x493e0c & 127;
                        _0x493e0c /= 128;
                    } while (_0x493e0c >= 1 && (_0x70121e[this.pos++] |= 128));
                }
                this.pos++;
            }
        },
        {
            key: 'readFloat',
            value() {
                var _0x45e22 = this.pos;
                this.pos += 4;
                if (this.pos > this.arr.length) {
                    return 0;
                }
                FLOAT_VIEW.setUint32(0, this.arr[_0x45e22] | this.arr[_0x45e22 + 1] << 8 | this.arr[_0x45e22 + 2] << 16 | this.arr[_0x45e22 + 3] << 24, true);
                return FLOAT_VIEW.getFloat32(0, true);
            }
        },
        {
            key: 'skipFloat',
            value() {
                this.pos += 4;
            }
        },
        {
            key: 'writeFloat',
            value(_0xf58849) {
                var _0x38fe15 = this.pos;
                this.pos += 4;
                if (this.pos > this.arr.length) {
                    return;
                }
                FLOAT_VIEW.setFloat32(0, _0xf58849, true);
                var _0x1043e4 = FLOAT_VIEW.getUint32(0, true);
                this.arr[_0x38fe15] = _0x1043e4 & 255;
                this.arr[_0x38fe15 + 1] = _0x1043e4 >> 8 & 255;
                this.arr[_0x38fe15 + 2] = _0x1043e4 >> 16 & 255;
                this.arr[_0x38fe15 + 3] = _0x1043e4 >> 24;
            }
        },
        {
            key: 'readDouble',
            value() {
                var _0x4fafc5 = this.pos;
                this.pos += 8;
                if (this.pos > this.arr.length) {
                    return 0;
                }
                FLOAT_VIEW.setUint32(0, this.arr[_0x4fafc5] | this.arr[_0x4fafc5 + 1] << 8 | this.arr[_0x4fafc5 + 2] << 16 | this.arr[_0x4fafc5 + 3] << 24, true);
                FLOAT_VIEW.setUint32(4, this.arr[_0x4fafc5 + 4] | this.arr[_0x4fafc5 + 5] << 8 | this.arr[_0x4fafc5 + 6] << 16 | this.arr[_0x4fafc5 + 7] << 24, true);
                return FLOAT_VIEW.getFloat64(0, true);
            }
        },
        {
            key: 'skipDouble',
            value() {
                this.pos += 8;
            }
        },
        {
            key: 'writeDouble',
            value(_0x499363) {
                var _0x548701 = this.pos;
                this.pos += 8;
                if (this.pos > this.arr.length) {
                    return;
                }
                FLOAT_VIEW.setFloat64(0, _0x499363, true);
                var _0x5949d1 = FLOAT_VIEW.getUint32(0, true);
                var _0x1e1861 = FLOAT_VIEW.getUint32(4, true);
                this.arr[_0x548701] = _0x5949d1 & 255;
                this.arr[_0x548701 + 1] = _0x5949d1 >> 8 & 255;
                this.arr[_0x548701 + 2] = _0x5949d1 >> 16 & 255;
                this.arr[_0x548701 + 3] = _0x5949d1 >> 24;
                this.arr[_0x548701 + 4] = _0x1e1861 & 255;
                this.arr[_0x548701 + 5] = _0x1e1861 >> 8 & 255;
                this.arr[_0x548701 + 6] = _0x1e1861 >> 16 & 255;
                this.arr[_0x548701 + 7] = _0x1e1861 >> 24;
            }
        },
        {
            key: 'readFixed',
            value(_0x3e7f90) {
                var _0x4a5603 = this.pos;
                this.pos += _0x3e7f90;
                if (this.pos > this.arr.length) {
                    return;
                }
                return this.arr.slice(_0x4a5603, _0x4a5603 + _0x3e7f90);
            }
        },
        {
            key: 'skipFixed',
            value(_0x3846be) {
                this.pos += _0x3846be;
            }
        },
        {
            key: 'writeFixed',
            value(_0x36e5c3, _0x507666) {
                _0x507666 = _0x507666 || _0x36e5c3.length;
                var _0x11e2af = this.pos;
                this.pos += _0x507666;
                if (this.pos > this.arr.length) {
                    return;
                }
                this.arr.set(_0x36e5c3.subarray(0, _0x507666), _0x11e2af);
            }
        },
        {
            key: 'readBytes',
            value() {
                var _0x479c0c = this.readLong();
                if (_0x479c0c < 0) {
                    this._invalidate();
                    return;
                }
                return this.readFixed(_0x479c0c);
            }
        },
        {
            key: 'skipBytes',
            value() {
                var _0x224121 = this.readLong();
                if (_0x224121 < 0) {
                    this._invalidate();
                    return;
                }
                this.pos += _0x224121;
            }
        },
        {
            key: 'writeBytes',
            value(_0x33fefb) {
                var _0x2a610f = _0x33fefb.length;
                this.writeLong(_0x2a610f);
                this.writeFixed(_0x33fefb, _0x2a610f);
            }
        },
        {
            key: 'skipString',
            value() {
                var _0x3ca817 = this.readLong();
                if (_0x3ca817 < 0) {
                    this._invalidate();
                    return;
                }
                this.pos += _0x3ca817;
            }
        },
        {
            key: 'readString',
            value() {
                var _0x2d901f = this.readLong();
                if (_0x2d901f < 0) {
                    this._invalidate();
                    return '';
                }
                var _0x1dbe2c = this.pos;
                this.pos += _0x2d901f;
                if (this.pos > this.arr.length) {
                    return;
                }
                var _0x2c841e = this.arr;
                var _0x48f146 = _0x1dbe2c + _0x2d901f;
                if (_0x2d901f > 24) {
                    return decodeSlice(_0x2c841e, _0x1dbe2c, _0x48f146);
                }
                var _0x4c616a = '';
                while (_0x1dbe2c + 3 < _0x48f146) {
                    var _0x34e6db = _0x2c841e[_0x1dbe2c];
                    var _0x2bbf56 = _0x2c841e[_0x1dbe2c + 1];
                    var _0x2ed376 = _0x2c841e[_0x1dbe2c + 2];
                    var _0x2a1771 = _0x2c841e[_0x1dbe2c + 3];
                    if ((_0x34e6db | _0x2bbf56 | _0x2ed376 | _0x2a1771) & 128) {
                        _0x4c616a += decodeSlice(_0x2c841e, _0x1dbe2c, _0x48f146);
                        return _0x4c616a;
                    }
                    _0x4c616a += String.fromCharCode(_0x34e6db, _0x2bbf56, _0x2ed376, _0x2a1771);
                    _0x1dbe2c += 4;
                }
                while (_0x1dbe2c < _0x48f146) {
                    var _0x2a8a0b = _0x2c841e[_0x1dbe2c];
                    if (_0x2a8a0b & 128) {
                        _0x4c616a += decodeSlice(_0x2c841e, _0x1dbe2c, _0x48f146);
                        return _0x4c616a;
                    }
                    _0x4c616a += String.fromCharCode(_0x2a8a0b);
                    _0x1dbe2c++;
                }
                return _0x4c616a;
            }
        },
        {
            key: 'writeString',
            value(_0x2ac034) {
                var _0x4ff173 = this.arr;
                var _0xceb905 = _0x2ac034.length;
                if (_0xceb905 > 21) {
                    var _0x2c2f3a;
                    var _0x5325b8;
                    if (this.isValid()) {
                        _0x5325b8 = encodeSlice(_0x2ac034);
                        _0x2c2f3a = _0x5325b8.length;
                    } else {
                        _0x2c2f3a = utf8Length(_0x2ac034);
                    }
                    this.writeLong(_0x2c2f3a);
                    var _0x1d30c0 = this.pos;
                    this.pos += _0x2c2f3a;
                    if (this.isValid() && typeof _0x5325b8 != 'undefined') {
                        _0x4ff173.set(_0x5325b8, _0x1d30c0);
                    }
                } else {
                    var _0xa4d0bd = this.pos + 1;
                    var _0x1043d1 = _0xa4d0bd;
                    var _0x5d50a7 = _0x4ff173.length;
                    for (var _0x9958ba = 0; _0x9958ba < _0xceb905; _0x9958ba++) {
                        var _0x34232c = _0x2ac034.charCodeAt(_0x9958ba);
                        var _0x6b6341 = undefined;
                        if (_0x34232c < 128) {
                            if (_0xa4d0bd < _0x5d50a7) {
                                _0x4ff173[_0xa4d0bd] = _0x34232c;
                            }
                            _0xa4d0bd++;
                        } else if (_0x34232c < 2048) {
                            if (_0xa4d0bd + 1 < _0x5d50a7) {
                                _0x4ff173[_0xa4d0bd] = _0x34232c >> 6 | 192;
                                _0x4ff173[_0xa4d0bd + 1] = _0x34232c & 63 | 128;
                            }
                            _0xa4d0bd += 2;
                        } else if ((_0x34232c & 64512) === 55296 && ((_0x6b6341 = _0x2ac034.charCodeAt(_0x9958ba + 1)) & 64512) === 56320) {
                            _0x34232c = 65536 + ((_0x34232c & 1023) << 10) + (_0x6b6341 & 1023);
                            _0x9958ba++;
                            if (_0xa4d0bd + 3 < _0x5d50a7) {
                                _0x4ff173[_0xa4d0bd] = _0x34232c >> 18 | 240;
                                _0x4ff173[_0xa4d0bd + 1] = _0x34232c >> 12 & 63 | 128;
                                _0x4ff173[_0xa4d0bd + 2] = _0x34232c >> 6 & 63 | 128;
                                _0x4ff173[_0xa4d0bd + 3] = _0x34232c & 63 | 128;
                            }
                            _0xa4d0bd += 4;
                        } else {
                            if (_0xa4d0bd + 2 < _0x5d50a7) {
                                _0x4ff173[_0xa4d0bd] = _0x34232c >> 12 | 224;
                                _0x4ff173[_0xa4d0bd + 1] = _0x34232c >> 6 & 63 | 128;
                                _0x4ff173[_0xa4d0bd + 2] = _0x34232c & 63 | 128;
                            }
                            _0xa4d0bd += 3;
                        }
                    }
                    if (this.pos <= _0x5d50a7) {
                        this.writeLong(_0xa4d0bd - _0x1043d1);
                    }
                    this.pos = _0xa4d0bd;
                }
            }
        },
        {
            key: 'matchBoolean',
            value(_0x32820c) {
                return this.arr[this.pos++] - _0x32820c.arr[_0x32820c.pos++];
            }
        },
        {
            key: 'matchLong',
            value(_0x50a61b) {
                var _0x791911 = this.readLong();
                var _0x20a306 = _0x50a61b.readLong();
                if (_0x791911 === _0x20a306) {
                    return 0;
                } else if (_0x791911 < _0x20a306) {
                    return -1;
                } else {
                    return 1;
                }
            }
        },
        {
            key: 'matchFloat',
            value(_0x26db6b) {
                var _0x258b4e = this.readFloat();
                var _0x543596 = _0x26db6b.readFloat();
                if (_0x258b4e === _0x543596) {
                    return 0;
                } else if (_0x258b4e < _0x543596) {
                    return -1;
                } else {
                    return 1;
                }
            }
        },
        {
            key: 'matchDouble',
            value(_0x49ad4e) {
                var _0x7993b4 = this.readDouble();
                var _0x9e89c8 = _0x49ad4e.readDouble();
                if (_0x7993b4 === _0x9e89c8) {
                    return 0;
                } else if (_0x7993b4 < _0x9e89c8) {
                    return -1;
                } else {
                    return 1;
                }
            }
        },
        {
            key: 'matchFixed',
            value(_0x3bf332, _0x5c8679) {
                return bufCompare(this.readFixed(_0x5c8679), _0x3bf332.readFixed(_0x5c8679));
            }
        },
        {
            key: 'matchBytes',
            value(_0x29729c) {
                var _0x53c17d = this.readLong();
                var _0x294adf = this.pos;
                this.pos += _0x53c17d;
                var _0x4bd723 = _0x29729c.readLong();
                var _0x2a6f3b = _0x29729c.pos;
                _0x29729c.pos += _0x4bd723;
                var _0x2a9e81 = this.arr.subarray(_0x294adf, this.pos);
                var _0x1eb028 = _0x29729c.arr.subarray(_0x2a6f3b, _0x29729c.pos);
                return bufCompare(_0x2a9e81, _0x1eb028);
            }
        },
        {
            key: 'unpackLongBytes',
            value() {
                var _0x3fe580 = new Uint8Array(8);
                var _0x2af5d8 = 0;
                var _0x1a54ad = 0;
                var _0x30d60a = 6;
                var _0xa536ad = this.arr;
                var _0x2b72e9 = _0xa536ad[this.pos++];
                var _0x4760b0 = _0x2b72e9 & 1;
                _0x3fe580.fill(0);
                _0x2af5d8 |= (_0x2b72e9 & 127) >> 1;
                while (_0x2b72e9 & 128) {
                    _0x2b72e9 = _0xa536ad[this.pos++];
                    _0x2af5d8 |= (_0x2b72e9 & 127) << _0x30d60a;
                    _0x30d60a += 7;
                    if (_0x30d60a >= 8) {
                        _0x30d60a -= 8;
                        _0x3fe580[_0x1a54ad++] = _0x2af5d8;
                        _0x2af5d8 >>= 8;
                    }
                }
                _0x3fe580[_0x1a54ad] = _0x2af5d8;
                if (_0x4760b0) {
                    invert(_0x3fe580, 8);
                }
                return _0x3fe580;
            }
        },
        {
            key: 'packLongBytes',
            value(_0x53f1b7) {
                var _0x246927 = (_0x53f1b7[7] & 128) >> 7;
                var _0x3aeadb = this.arr;
                var _0x27b058 = 1;
                var _0x3365a2 = 0;
                var _0x3b587f = 3;
                var _0xa9aa34;
                if (_0x246927) {
                    invert(_0x53f1b7, 8);
                    _0xa9aa34 = 1;
                } else {
                    _0xa9aa34 = 0;
                }
                var _0x2d541a = [
                    _0x53f1b7[0] | _0x53f1b7[1] << 8 | _0x53f1b7[2] << 16,
                    _0x53f1b7[3] | _0x53f1b7[4] << 8 | _0x53f1b7[5] << 16,
                    _0x53f1b7[6] | _0x53f1b7[7] << 8
                ];
                while (_0x3b587f && !_0x2d541a[--_0x3b587f]) {
                }
                while (_0x3365a2 < _0x3b587f) {
                    _0xa9aa34 |= _0x2d541a[_0x3365a2++] << _0x27b058;
                    _0x27b058 += 24;
                    while (_0x27b058 > 7) {
                        _0x3aeadb[this.pos++] = _0xa9aa34 & 127 | 128;
                        _0xa9aa34 >>= 7;
                        _0x27b058 -= 7;
                    }
                }
                _0xa9aa34 |= _0x2d541a[_0x3b587f] << _0x27b058;
                do {
                    _0x3aeadb[this.pos] = _0xa9aa34 & 127;
                    _0xa9aa34 >>= 7;
                } while (_0xa9aa34 && (_0x3aeadb[this.pos++] |= 128));
                this.pos++;
                if (_0x246927) {
                    invert(_0x53f1b7, 8);
                }
            }
        }
    ], [
        {
            key: 'fromBuffer',
            value(_0xd131ab, _0x79063a) {
                return new _Tap(_0xd131ab, _0x79063a);
            }
        },
        {
            key: 'withCapacity',
            value(_0x3d1c4d) {
                var _0x5c16ff = new Uint8Array(_0x3d1c4d);
                return new _Tap(_0x5c16ff);
            }
        }
    ]);
}();
function invert(_0x1ef9ae, _0x21eb28) {
    while (_0x21eb28--) {
        _0x1ef9ae[_0x21eb28] = ~_0x1ef9ae[_0x21eb28];
    }
}
function printJSON(_0xb06c5) {
    var _0x5aa672 = new Set();
    try {
        return JSON.stringify(_0xb06c5, function (_0x5f4960, _0x1a7128) {
            if (_0x5aa672.has(_0x1a7128)) {
                return '[Circular]';
            }
            if (_typeof(_0x1a7128) === 'object' && _0x1a7128 !== null) {
                _0x5aa672.add(_0x1a7128);
            }
            if (typeof BigInt !== 'undefined' && _0x1a7128 instanceof BigInt) {
                return '[BigInt ' + _0x1a7128.toString() + 'n]';
            }
            return _0x1a7128;
        });
    } catch (_0x184530) {
        return '[object]';
    }
}
var _0x707a08 = {
    abstractFunction: abstractFunction,
    bufCompare: bufCompare,
    bufEqual: bufEqual,
    bufferToBinaryString: bufferToBinaryString,
    binaryStringToBuffer: binaryStringToBuffer,
    capitalize: capitalize,
    copyOwnProperties: copyOwnProperties,
    getHash: platform.getHash,
    compare: compare,
    getOption: getOption,
    impliedNamespace: impliedNamespace,
    isBufferLike: isBufferLike,
    isValidName: isValidName,
    jsonEnd: jsonEnd,
    objectValues: objectValues,
    qualify: qualify,
    toMap: toMap,
    singleIndexOf: singleIndexOf,
    hasDuplicates: hasDuplicates,
    unqualify: unqualify,
    Lcg: Lcg,
    OrderedQueue: OrderedQueue,
    Tap: Tap,
    printJSON: printJSON
};
module.exports = _0x707a08;