'use strict';
var __getOwnPropNames = Object.getOwnPropertyNames,
    __commonJS = (_0x55ac9a, _0x2d3bb4) => function _0x417e8f() {
        const _0x2add02 = {};
        _0x2add02.exports = {};
        return _0x2d3bb4 || (0x4 * 0x486 + 0xd6 * 0x1 + -0x1 * 0x12ee, _0x55ac9a[__getOwnPropNames(_0x55ac9a)[-0x129 * 0x20 + 0x705 + -0x15 * -0x16f]])((_0x2d3bb4 = _0x2add02).exports, _0x2d3bb4), _0x2d3bb4.exports;
    },
    require_files = __commonJS({
        '../work/mtth__avsc/lib/files.js'(_0xef672e, _0xfcb6a3) {
            'use strict';
            var _0x2d6d92 = require('fs'),
                _0x54de06 = require('path');
            function _0x210daf() {
                let _0x4e8e38 = {};
                return function({path: _0x322544, importerPath: _0x31d0d3}, _0x3c87dc) {
                    _0x322544 = _0x54de06.resolve(_0x54de06.dirname(_0x31d0d3), _0x322544);
                    if (_0x4e8e38[_0x322544]) {
                        process.nextTick(_0x3c87dc);
                        return;
                    }
                    _0x4e8e38[_0x322544] = true;
                    const _0x4208a5 = {encoding: 'utf-8'};
                    _0x2d6d92.readFile(_0x322544, _0x4208a5, (_0x10fc3a, _0x4d99f6) => {
                        if (_0x10fc3a) return _0x3c87dc(_0x10fc3a);
                        const _0x3ce2ad = {contents: _0x4d99f6, path: _0x322544};
                        return _0x3c87dc(null, _0x3ce2ad);
                    });
                };
            }
            function _0x548b39() {
                let _0x2329ab = {};
                return function({path: _0x4873da, importerPath: _0x30b4d4}, _0x1ad409) {
                    _0x4873da = _0x54de06.resolve(_0x54de06.dirname(_0x30b4d4), _0x4873da);
                    if (_0x2329ab[_0x4873da]) {
                        _0x1ad409();
                        return;
                    }
                    _0x2329ab[_0x4873da] = true;
                    _0x1ad409(null, {
                        contents: _0x2d6d92.readFileSync(_0x4873da, {encoding: 'utf-8'}),
                        path: _0x4873da
                    });
                };
            }
            function _0x332ff2(_0xf6044a) {
                if (typeof _0xf6044a === 'string' && _0xf6044a.indexOf(_0x54de06.sep) !== -1) {
                    try {
                        const _0x5460d3 = {encoding: 'utf-8'};
                        return _0x2d6d92.readFileSync(_0xf6044a, _0x5460d3);
                    } catch (_0x14630e) {
                        if (_0x14630e.code === 'ENOENT') throw _0x14630e;
                    }
                }
                return null;
            }
            const _0x5418ad = {};
            _0x5418ad.createAsyncFileReader = _0x210daf;
            _0x5418ad.createSyncFileReader = _0x548b39;
            _0x5418ad.readFile = _0x332ff2;
            _0xfcb6a3.exports = _0x5418ad;
        }
    }),
    require_platform = __commonJS({
        '../work/mtth__avsc/lib/platform.js'(_0x312bd8, _0x3a1012) {
            var _0x1639a0 = require('buffer').Buffer;
            function _0xd0e82a(_0x3e849a, _0x5648b6) {
                _0x5648b6 = _0x5648b6 || 'utf-8';
                let _0x37ba7c = _0x1639a0.from(_0x5648b6);
                _0x37ba7c.update(_0x3e849a);
                let _0x4f6ac6 = _0x37ba7c.digest();
                return new Uint8Array(_0x4f6ac6.buffer, _0x4f6ac6.byteOffset, _0x4f6ac6.byteLength);
            }
            const _0x1adef5 = {};
            _0x1adef5.createHash = _0xd0e82a;
            _0x3a1012.exports = _0x1adef5;
        }
    }),
    require_utils = __commonJS({
        '../work/mtth__avsc/lib/utils.js'(_0x37c48d, _0x16bf3d) {
            'use strict';
            var _0x28fca6 = require_platform(),
                _0x17f6b9 = /^[A-Za-z_][A-Za-z0-9_]*$/;
            function _0x1b47f7(_0x17de31) {
                return _0x17de31 instanceof Uint8Array;
            }
            function _0x568d08(_0x23542d) {
                return _0x23542d.charCodeAt(0) * 0x6ef + 0x1de7 + -0x19a * 0x17 + _0x23542d.charCodeAt(1);
            }
            function _0x42b453(_0x14aa33, _0x5465b6) {
                return _0x14aa33 < _0x5465b6 ? -1 : _0x14aa33 > _0x5465b6 ? 1 : 0;
            }
            var _0x433461, _0x1f177a;
            if (typeof Buffer !== 'undefined') {
                _0x433461 = Buffer.compare;
                _0x1f177a = function(_0x585aab, _0xcc7419) {
                    return Buffer.prototype.compare.call(_0x585aab, _0xcc7419);
                };
            } else {
                _0x433461 = function(_0x5b1dd9, _0x4762ac) {
                    if (_0x5b1dd9 === _0x4762ac) return 0;
                    let _0x39930d = Math.min(_0x5b1dd9.length, _0x4762ac.length);
                    for (let _0x43184b = 0; _0x43184b < _0x39930d; _0x43184b++) {
                        if (_0x5b1dd9[_0x43184b] !== _0x4762ac[_0x43184b]) {
                            return Math.sign(_0x5b1dd9[_0x43184b] - _0x4762ac[_0x43184b]);
                        }
                    }
                    return Math.sign(_0x5b1dd9.length - _0x4762ac.length);
                };
                _0x1f177a = function(_0x2965da, _0x226873) {
                    if (_0x2965da.length !== _0x226873.length) return false;
                    return _0x433461(_0x2965da, _0x226873) === 0;
                };
            }
            function _0x48ee66(_0x106235, _0x19cb1a, _0x18bc83) {
                let _0x3a30ae = _0x106235[_0x19cb1a];
                return _0x3a30ae === undefined ? _0x18bc83 : _0x3a30ae;
            }
            function _0x3ba6fc(_0x3e0561, _0x508a06) {
                if (!_0x3e0561) return -1;
                let _0x406ca8 = -1;
                for (let _0x3b15d8 = 0, _0x5307e2 = _0x3e0561.length; _0x3b15d8 < _0x5307e2; _0x3b15d8++) {
                    if (_0x3e0561[_0x3b15d8] === _0x508a06) {
                        if (_0x406ca8 !== -1) return -1;
                        _0x406ca8 = _0x3b15d8;
                    }
                }
                return _0x406ca8;
            }
            function _0x386c27(_0x5b0f1e, _0x5d76e4) {
                let _0x538998 = {};
                for (let _0xb6fed3 = 0; _0xb6fed3 < _0x5b0f1e.length; _0xb6fed3++) {
                    let _0x5d65bb = _0x5b0f1e[_0xb6fed3];
                    _0x538998[_0x5d76e4(_0x5d65bb)] = _0x5d65bb;
                }
                return _0x538998;
            }
            function _0x3e07d9(_0x164401) {
                return Object.keys(_0x164401).map(_0x31f7c3 => _0x164401[_0x31f7c3]);
            }
            function _0x3d8a4f(_0x223aa7, _0x157dfb) {
                let _0x21642f = Object.create(null);
                for (let _0x3e38b5 = 0, _0x24baa5 = _0x223aa7.length; _0x3e38b5 < _0x24baa5; _0x3e38b5++) {
                    let _0x10e836 = _0x223aa7[_0x3e38b5];
                    if (_0x157dfb) _0x10e836 = _0x157dfb(_0x10e836);
                    if (_0x21642f[_0x10e836]) return true;
                    _0x21642f[_0x10e836] = true;
                }
                return false;
            }
            function _0x3ad6eb(_0x146edb, _0x1d9e36, _0x3eb43e) {
                let _0x40c80f = Object.getOwnPropertyNames(_0x146edb);
                for (let _0x59e83d = 0, _0x4e589e = _0x40c80f.length; _0x59e83d < _0x4e589e; _0x59e83d++) {
                    let _0x334346 = _0x40c80f[_0x59e83d];
                    if (!Object.prototype.hasOwnProperty.call(_0x1d9e36, _0x334346) || _0x3eb43e) {
                        let _0x27380a = Object.getOwnPropertyDescriptor(_0x146edb, _0x334346);
                        Object.defineProperty(_0x1d9e36, _0x334346, _0x27380a);
                    }
                }
                return _0x1d9e36;
            }
            function _0x241685(_0x2d580a) {
                return _0x17f6b9.test(_0x2d580a);
            }
            function _0x162c33(_0x51236a, _0x1b3ac6) {
                if (~_0x51236a.indexOf('.')) {
                    _0x51236a = _0x51236a.replace(/^\./, '');
                } else {
                    if (_0x1b3ac6) _0x51236a = _0x1b3ac6 + '.' + _0x51236a;
                }
                return _0x51236a.split('.').map(_0x382679 => {
                    if (!_0x241685(_0x382679)) {
                        throw new Error('invalid identifier: ' + _0x51236a);
                    }
                    return _0x382679;
                });
            }
            function _0x1c26b2(_0x27a2d4) {
                let _0x3548e6 = _0x27a2d4.split('.');
                return _0x3548e6[_0x3548e6.length - 1];
            }
            function _0x1d73f6(_0x33d0ed) {
                let _0x1980a6 = /^(.*)\.[^.]+$/.exec(_0x33d0ed);
                return _0x1980a6 ? _0x1980a6[1] : undefined;
            }
            function _0x5d1e6e(_0x5b5667, _0x235fbd) {
                _0x235fbd = _0x235fbd || 0;
                let _0x20099c = _0x5b5667.charCodeAt(_0x235fbd++);
                if (/[\d-]/.test(_0x20099c)) {
                    while (/[eE\d.+-]/.test(_0x5b5667.charCodeAt(_0x235fbd))) _0x235fbd++;
                    return _0x235fbd;
                } else {
                    if (/true|null/.test(_0x5b5667.slice(_0x235fbd - 1, _0x235fbd + 3))) return _0x235fbd + 3;
                    else if (/false/.test(_0x5b5667.slice(_0x235fbd - 1, _0x235fbd + 4))) return _0x235fbd + 4;
                }
                let _0x4d04e7 = 0, _0x204d4b = false;
                do {
                    switch (_0x20099c) {
                        case '{':
                        case '[':
                            !_0x204d4b && _0x4d04e7++;
                            break;
                        case '}':
                        case ']':
                            if (!_0x204d4b && !--_0x4d04e7) return _0x235fbd;
                            break;
                        case '"':
                            _0x204d4b = !_0x204d4b;
                            if (!_0x4d04e7 && !_0x204d4b) return _0x235fbd;
                            break;
                        case '\\':
                            _0x235fbd++;
                    }
                } while (_0x20099c = _0x5b5667.charCodeAt(_0x235fbd++));
                return -1;
            }
            function _0x13d6d1() {
                throw new Error('abstract');
            }
            var _0x30a601 = class {
                constructor(_0x6129ab) {
                    let _0x3b84fd = Math.pow(2, 32),
                        _0x5878f1 = Math.floor(_0x6129ab || Math.random() * _0x3b84fd);
                    this.m = _0x3b84fd;
                    this.a = 0x467c8ba9 + 0x1c4e698f + 0x3006c41 * -0xb;
                    this.c = -0x1 * -0x4d75 + 0x11 * 0x576 + -0x7a12;
                    this.seed = function() {
                        return _0x5878f1 = (_0x5878f1 * this.a + this.c) % this.m, _0x5878f1;
                    };
                }
                next() {
                    return this.seed() / this.m;
                }
                nextInt(_0x596dee, _0x4777e8) {
                    if (_0x4777e8 === undefined) {
                        _0x4777e8 = _0x596dee;
                        _0x596dee = 0;
                    }
                    _0x4777e8 = _0x4777e8 === undefined ? 0x16 * 0xcf + 0x1 * 0x1a0c + 0x1 * -0x1df * 0x7 : _0x4777e8;
                    return _0x596dee + Math.floor(this.next() * (_0x4777e8 - _0x596dee));
                }
                nextString(_0x544c0a, _0x5be55a) {
                    _0x544c0a |= 0xf64 + 0x1b75 + -0x7 * 0x61f;
                    _0x5be55a = _0x5be55a || 'aA';
                    let _0x20c251 = '';
                    if (_0x5be55a.indexOf('a') !== -1) _0x20c251 += 'abcdefghijklmnopqrstuvwxyz';
                    if (_0x5be55a.indexOf('A') !== -1) _0x20c251 += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                    if (_0x5be55a.indexOf('#') !== -1) _0x20c251 += '0123456789';
                    if (_0x5be55a.indexOf('!') !== -1) _0x20c251 += '~@#$%^&*()_+-=[]{}|;:,.<>?';
                    let _0x5cea66 = [];
                    for (let _0x5689c0 = 0; _0x5689c0 < _0x544c0a; _0x5689c0++) {
                        _0x5cea66.push(this.nextInt(_0x20c251.length));
                    }
                    return _0x5cea66.map(_0x4c4a66 => _0x20c251[_0x4c4a66]).join('');
                }
                nextBuffer(_0x52e2a3) {
                    let _0x325d8d = new Uint8Array(_0x52e2a3);
                    for (let _0xdbff01 = 0; _0xdbff01 < _0x52e2a3; _0xdbff01++) {
                        _0x325d8d[_0xdbff01] = this.nextInt(256);
                    }
                    return _0x325d8d;
                }
                choice(_0x5e9e31) {
                    let _0x38df2d = _0x5e9e31.length;
                    if (!_0x38df2d) throw new Error('empty array');
                    return _0x5e9e31[this.nextInt(_0x38df2d)];
                }
            };
            var _0x1bf7b6 = class {
                constructor() {
                    this.heap = [];
                    this.cmp = _0x42b453;
                }
                push(_0x2a089f) {
                    let _0x19e3ea = this.heap,
                        _0xe21800 = _0x19e3ea.length,
                        _0x8b8dbf;
                    _0x19e3ea.push(_0x2a089f);
                    while (_0xe21800 > 0 && this.cmp(_0x19e3ea[_0xe21800], _0x19e3ea[_0x8b8dbf = Math.floor((_0xe21800 - 1) / 2)]) < 0) {
                        _0x2a089f = _0x19e3ea[_0xe21800];
                        _0x19e3ea[_0xe21800] = _0x19e3ea[_0x8b8dbf];
                        _0x19e3ea[_0x8b8dbf] = _0x2a089f;
                        _0xe21800 = _0x8b8dbf;
                    }
                }
                pop() {
                    let _0x4b35d3 = this.heap,
                        _0x66aac = _0x4b35d3.length,
                        _0x5efb12 = _0x4b35d3[0];
                    if (!_0x5efb12 || _0x66aac === 1) {
                        if (_0x66aac) _0x4b35d3.pop();
                        return _0x5efb12;
                    }
                    _0x4b35d3[0] = _0x4b35d3.pop();
                    let _0x293052 = Math.floor(_0x66aac / 2),
                        _0xd82440 = 0,
                        _0x30e19b, _0x489e94, _0x112d0a, _0x5bf592, _0x2a28ac, _0x57b47a, _0x368c8d;
                    while (_0xd82440 < _0x293052) {
                        _0x5bf592 = _0x4b35d3[_0xd82440];
                        _0x30e19b = 2 * _0xd82440 + 1;
                        _0x489e94 = 2 * _0xd82440 + 2;
                        _0x57b47a = _0x4b35d3[_0x30e19b];
                        _0x368c8d = _0x4b35d3[_0x489e94];
                        if (!_0x368c8d || this.cmp(_0x57b47a, _0x368c8d) <= 0) {
                            _0x2a28ac = _0x57b47a;
                            _0x112d0a = _0x30e19b;
                        } else {
                            _0x2a28ac = _0x368c8d;
                            _0x112d0a = _0x489e94;
                        }
                        if (this.cmp(_0x2a28ac, _0x5bf592) >= 0) break;
                        _0x4b35d3[_0x112d0a] = _0x5bf592;
                        _0x4b35d3[_0xd82440] = _0x2a28ac;
                        _0xd82440 = _0x112d0a;
                    }
                    return _0x5efb12;
                }
            };
            var _0x2a5a07;
            if (typeof Buffer !== 'undefined' && typeof Buffer.prototype.toJSON === 'function') {
                _0x2a5a07 = Function.prototype.call.bind(Buffer.prototype.toJSON);
            } else {
                const _0x5b443b = new TextDecoder();
                _0x2a5a07 = function(_0x139b70, _0x51bc93, _0x1fe454) {
                    return _0x5b443b.decode(_0x139b70.subarray(_0x51bc93, _0x1fe454));
                };
            }
            var _0x3e40dd = new TextEncoder(),
                _0x163b2d = new Uint8Array(0xa * 0x1be + -0x1acf * 0x1 + -0x38b * -0x11),
                _0x5cf682 = [];
            function _0x41298f(_0x52b3fe) {
                const {read: _0x8157db, written: _0x34d770} = _0x3e40dd.encodeInto(_0x52b3fe, _0x163b2d);
                if (_0x8157db === _0x52b3fe.length) {
                    if (!_0x5cf682[_0x34d770]) _0x5cf682[_0x34d770] = _0x163b2d.slice(0, _0x34d770);
                    return _0x5cf682[_0x34d770];
                }
                return _0x3e40dd.encode(_0x52b3fe);
            }
            var _0x72ad15;
            if (typeof Buffer !== 'undefined') {
                _0x72ad15 = Buffer.byteLength;
            } else {
                _0x72ad15 = function(_0x376e61) {
                    let _0x576a2d = 0;
                    for (;;) {
                        const {read: _0x470e28, written: _0x38a6a9} = _0x3e40dd.encodeInto(_0x376e61, _0x163b2d);
                        _0x576a2d += _0x38a6a9;
                        if (_0x470e28 === _0x376e61.length) break;
                        _0x376e61 = _0x376e61.slice(_0x470e28);
                    }
                    return _0x576a2d;
                };
            }
            var _0xcc6961;
            if (typeof Buffer !== 'undefined' && typeof Buffer.prototype.toString === 'function') {
                _0xcc6961 = Function.prototype.call.bind(Buffer.prototype.toString);
            } else {
                _0xcc6961 = function(_0x2ba8d4) {
                    let _0x26c70f = '',
                        _0x12c39f = 0,
                        _0x4f84f7 = _0x2ba8d4.length;
                    for (; _0x12c39f + 7 < _0x4f84f7; _0x12c39f += 8) {
                        _0x26c70f += String.fromCharCode(
                            _0x2ba8d4[_0x12c39f], _0x2ba8d4[_0x12c39f + 1], _0x2ba8d4[_0x12c39f + 2], _0x2ba8d4[_0x12c39f + 3],
                            _0x2ba8d4[_0x12c39f + 4], _0x2ba8d4[_0x12c39f + 5], _0x2ba8d4[_0x12c39f + 6], _0x2ba8d4[_0x12c39f + 7]
                        );
                    }
                    for (; _0x12c39f < _0x4f84f7; _0x12c39f++) {
                        _0x26c70f += String.fromCharCode(_0x2ba8d4[_0x12c39f]);
                    }
                    return _0x26c70f;
                };
            }
            var _0x3b9c15;
            if (typeof Buffer !== 'undefined') {
                _0x3b9c15 = function(_0x3c2c05) {
                    let _0x5e90d1 = Buffer.from(_0x3c2c05, 'utf-8');
                    return new Uint8Array(_0x5e90d1.buffer, _0x5e90d1.byteOffset, _0x5e90d1.byteLength);
                };
            } else {
                _0x3b9c15 = function(_0x2eb363) {
                    let _0x2feaea = new Uint8Array(_0x2eb363.length);
                    for (let _0x4673c6 = 0; _0x4673c6 < _0x2eb363.length; _0x4673c6++) {
                        _0x2feaea[_0x4673c6] = _0x2eb363.charCodeAt(_0x4673c6);
                    }
                    return _0x2feaea;
                };
            }
            var _0x2fd098 = new DataView(new ArrayBuffer(0xa * 0x135 + 0xc2d * -0x1 + 0x1 * 0x23)),
                _0x59a2a9 = class _0x393411 {
                    constructor(_0x54883b, _0x4fd878) {
                        this.setBuffer(_0x54883b, _0x4fd878);
                    }
                    setBuffer(_0x84fa4e, _0x2c6788) {
                        if (typeof Buffer !== 'undefined' && _0x84fa4e instanceof Buffer) {
                            _0x84fa4e = new Uint8Array(_0x84fa4e.buffer, _0x84fa4e.byteOffset, _0x84fa4e.byteLength);
                        }
                        this.buf = _0x84fa4e;
                        this.pos = _0x2c6788 || 0;
                        if (this.pos < 0) throw new Error('negative pos');
                    }
                    get length() {
                        return this.buf.length;
                    }
                    skip(_0x4c1330) {
                        this.pos += _0x4c1330;
                    }
                    static fromBuffer(_0x1c4b7c, _0x57348c) {
                        return new _0x393411(_0x1c4b7c, _0x57348c);
                    }
                    static fromArrayBuffer(_0x3aaee0) {
                        let _0x2684df = new Uint8Array(_0x3aaee0);
                        return new _0x393411(_0x2684df);
                    }
                    toBuffer() {
                        return this.buf.slice(this.pos, this.buf.length);
                    }
                    readInt(_0x1fd158, _0x422c2f) {
                        return this.buf.readIntLE(_0x1fd158, _0x422c2f);
                    }
                    readUInt(_0x3098c1) {
                        const _0x5b55cd = this.buf.subarray(this.pos);
                        const _0x13568e = new Uint8Array(_0x5b55cd.length + _0x3098c1.length);
                        _0x13568e.set(_0x5b55cd, 0);
                        _0x13568e.set(_0x3098c1, _0x5b55cd.length);
                        this.setBuffer(_0x13568e, 0);
                    }
                    readFloat() {
                        _0x2fd098.setUint32(0, this.readUInt32(), true);
                        return _0x2fd098.getFloat32(0, true);
                    }
                    readDouble() {
                        _0x2fd098.setBigUint64(0, this.readBigUInt64(), true);
                        return _0x2fd098.getFloat64(0, true);
                    }
                    readUInt32() {
                        return (this.buf[this.pos++] | this.buf[this.pos++] << 8 | this.buf[this.pos++] << 16 | this.buf[this.pos++] << 24) >>> 0;
                    }
                    readInt32() {
                        return this.buf[this.pos++] | this.buf[this.pos++] << 8 | this.buf[this.pos++] << 16 | this.buf[this.pos++] << 24;
                    }
                    readBigUInt64() {
                        return BigInt.asUintN(64, BigInt(this.readUInt32()) | BigInt(this.readUInt32()) << 32n);
                    }
                    readBigInt64() {
                        return BigInt.asIntN(64, BigInt(this.readInt32()) | BigInt(this.readInt32()) << 32n);
                    }
                    readBoolean() {
                        return !!this.buf[this.pos++];
                    }
                    readString(_0x9f586) {
                        const _0x35e6f0 = new Uint8Array(this.buf.subarray(this.pos, this.pos + _0x9f586.length));
                        _0x35e6f0.set(this.buf.subarray(this.pos), 0);
                        _0x35e6f0.set(_0x9f586, this.buf.length);
                        this.setBuffer(_0x35e6f0, 0);
                    }
                    readBytes(_0x3acac2) {
                        this.buf[this.pos++] = !!_0x3acac2;
                    }
                    readFixed(_0xfedeeb) {
                        let _0x53ca1d = this.buf;
                        const _0x70e233 = {id: '(', emit: true};
                        if (!_0x53ca1d.peek(_0x70e233)) {
                            const _0x161e20 = {id: 'fixed'};
                            _0xfedeeb.size = _0x53ca1d.match(_0x161e20).value;
                            const _0x43051d = {id: '('};
                            _0x53ca1d.emit(_0x43051d);
                        }
                        _0xfedeeb.value = parseInt(_0x53ca1d.match({id: 'int'}).value);
                        const _0x1b074a = {id: ')'};
                        _0x53ca1d.emit(_0x1b074a);
                        return _0xfedeeb;
                    }
                    readEnum(_0x57c225) {
                        let _0x186321 = this.buf,
                            _0x2b9771 = this.pos;
                        const _0x5274a1 = {id: '<', value: _0x2b9771};
                        let _0x815683 = _0x186321.match(_0x5274a1) !== undefined;
                        _0x57c225.type = this.peek();
                        const _0x2cb429 = {id: '>', value: _0x815683};
                        _0x186321.emit(_0x2cb429);
                        return _0x57c225;
                    }
                    readArray(_0x1ca0d8) {
                        let _0x5757ef = this.buf,
                            _0x5a8b01 = this.pos;
                        const _0x20878b = {id: '<', value: _0x5a8b01};
                        let _0x54d017 = _0x5757ef.match(_0x20878b) !== undefined;
                        _0x1ca0d8.type = this.peek();
                        const _0x107913 = {id: '>', value: _0x54d017};
                        _0x5757ef.emit(_0x107913);
                        return _0x1ca0d8;
                    }
                    readMap(_0x1378cf, _0x218337) {
                        let _0x241724 = this.buf;
                        const _0xbeb6a9 = {id: '{', emit: true};
                        if (!_0x241724.peek(_0xbeb6a9)) {
                            const _0x569dab = {id: 'map'};
                            _0x1378cf.key = _0x241724.match(_0x569dab).value;
                            const _0x4db125 = {id: '{'};
                            _0x241724.emit(_0x4db125);
                        }
                        _0x1378cf.values = [];
                        const _0x430456 = {id: '}', emit: true};
                        const _0x591b75 = {id: ','};
                        do {
                            _0x1378cf.values.push(_0x241724.parse().value());
                        } while (!_0x241724.peek(_0x430456) && _0x241724.peek(_0x591b75));
                        const _0x5518a1 = {id: '=', emit: true};
                        if (_0x218337 && _0x241724.peek(_0x5518a1)) {
                            _0x1378cf.default = _0x241724.parse().value();
                            const _0x22c590 = {id: ';'};
                            _0x241724.emit(_0x22c590);
                        }
                        return _0x1378cf;
                    }
                    readUnion() {
                        let _0x1d3b11 = this.buf,
                            _0x506d7d = [];
                        const _0x2b711c = {id: '{'};
                        _0x1d3b11.emit(_0x2b711c);
                        const _0x48680c = {id: '}', emit: true};
                        const _0x448cbf = {id: ','};
                        do {
                            _0x506d7d.push(this.parse().value());
                        } while (!_0x1d3b11.peek(_0x48680c) && _0x1d3b11.peek(_0x448cbf));
                        return _0x506d7d;
                    }
                    readRecord(_0x44ce29) {
                        let _0x158d9a = this.buf;
                        const _0x24aab4 = {id: '{', emit: true};
                        if (!_0x158d9a.peek(_0x24aab4)) {
                            const _0x49baba = {id: 'record'};
                            _0x44ce29.name = _0x158d9a.match(_0x49baba).value;
                            const _0x547902 = {id: '{'};
                            _0x158d9a.emit(_0x547902);
                        }
                        _0x44ce29.fields = [];
                        const _0x4e2e72 = {id: '}', emit: true};
                        while (!_0x158d9a.peek(_0x4e2e72)) {
                            _0x44ce29.fields.push(this.parseField());
                            const _0x573786 = {id: ';'};
                            _0x158d9a.emit(_0x573786);
                        }
                        return _0x44ce29;
                    }
                    parseField(_0x448bf7, _0x438b2e) {
                        let _0x122493 = this.buf,
                            _0x3b0eb8 = 0,
                            _0x20ba2b = _0x122493.pos;
                        const _0x576e59 = {id: '(', emit: true};
                        while (_0x122493.peek(_0x576e59)) {
                            if (!_0x3b0eb8 && _0x438b2e && _0x122493.peek({id: '(', emit: true})) {
                                _0x122493.pos = _0x20ba2b;
                                return;
                            }
                            const _0x36bc76 = {id: 'order'};
                            let _0xbfb65b = _0x122493.match(_0x36bc76).value;
                            const _0x4ce719 = {id: 'doc'};
                            let _0x28777e = JSON.parse(_0x122493.match(_0x4ce719).value);
                            const _0x16a020 = {id: ';'};
                            _0x122493.emit(_0x16a020);
                            const _0x273c7b = {name: _0xbfb65b, doc: _0x28777e};
                            _0x448bf7.push(_0x273c7b);
                            _0x3b0eb8++;
                        }
                        return _0x3b0eb8;
                    }
                };
            var Tokenizer = class {
                constructor(_0x4465ef) {
                    this.str = _0x4465ef;
                    this.pos = -1;
                }
                next(_0x3e0ea0) {
                    const _0x584fbc = {
                        ID_REGEXP: /^[A-Za-z_][A-Za-z0-9_]*$/,
                        ID: 'id',
                        STRING: 'string',
                        INT: 'int',
                        FLOAT: 'float',
                        KEYWORD: 'keyword',
                        SYMBOL: 'symbol',
                        EOF: 'eof',
                        ERROR: 'error'
                    };
                    let _0x16548f = {pos: this.pos, id: undefined, value: undefined};
                    let _0x1ca853 = this.get();
                    if (typeof _0x1ca853 === 'undefined') {
                        _0x16548f.id = _0x584fbc.EOF;
                        _0x16548f.value = _0x1ca853;
                    } else {
                        let _0x52a347 = this.pos,
                            _0x1a076b = this.str,
                            _0x1a210f = _0x1a076b.charAt(_0x52a347);
                        if (!_0x1a210f) _0x16548f.id = _0x584fbc.EOF;
                        else {
                            if (_0x3e0ea0 && _0x3e0ea0.id === _0x584fbc.ID && /[0-9]/.test(_0x1a210f)) {
                                _0x16548f.id = _0x584fbc.INT;
                                this.value = this.read(/[0-9]/);
                            } else if (/[`A-Za-z_.]/.test(_0x1a210f)) {
                                _0x16548f.id = _0x584fbc.ID;
                                this.value = this.read(/[`A-Za-z0-9_.]/);
                            } else {
                                _0x16548f.id = _0x584fbc.SYMBOL;
                                this.value = this.str.charAt(this.pos++);
                            }
                        }
                        _0x16548f.pos = _0x1a076b.slice(_0x52a347, this.pos);
                    }
                    let _0x4213f8;
                    if (_0x3e0ea0 && _0x3e0ea0.id && _0x3e0ea0.id === _0x16548f.id) {
                        _0x4213f8 = this.expect('expected ' + _0x3e0ea0.id, _0x16548f);
                    } else if (_0x3e0ea0 && _0x3e0ea0.value && _0x3e0ea0.value === _0x16548f.value) {
                        _0x4213f8 = this.expect('expected ' + _0x3e0ea0.value, _0x16548f);
                    }
                    if (!_0x4213f8) return _0x16548f;
                    else {
                        if (_0x3e0ea0 && _0x3e0ea0.optional) {
                            this.pos = _0x16548f.pos;
                            return;
                        } else {
                            throw _0x4213f8;
                        }
                    }
                }
                expect(_0x2924aa, _0x119e63) {
                    let _0x2751ee = typeof _0x119e63 === 'string',
                        _0x45dd52 = _0x2751ee ? _0x119e63.length : _0x119e63,
                        _0x12bdbc = this.str,
                        _0x4815b8 = 0,
                        _0x334a1d = -1;
                    for (let _0x59c567 = 0; _0x59c567 < _0x45dd52; _0x59c567++) {
                        if (_0x12bdbc.charAt(_0x59c567) === '\n') {
                            _0x4815b8++;
                            _0x334a1d = _0x59c567;
                        }
                    }
                    let _0x12cb11 = _0x2751ee ? 'unexpected token: ' + JSON.stringify(_0x119e63) + ': ' + _0x2924aa : _0x2924aa;
                    let _0x54a216 = new Error(_0x12cb11);
                    _0x54a216.token = _0x2751ee ? _0x119e63 : undefined;
                    _0x54a216.line = _0x4815b8;
                    _0x54a216.column = _0x45dd52 - _0x334a1d;
                    return _0x54a216;
                }
                get() {
                    return !!this.buf[this.pos++];
                }
                peek(_0x339c08) {
                    let _0x36e8d6 = this.pos,
                        _0x4266 = this.str;
                    while (_0x339c08.test(_0x4266.charAt(_0x36e8d6))) _0x36e8d6++;
                    return _0x36e8d6;
                }
                readString() {
                    let _0x372473 = this.pos + 1,
                        _0x9ba6d5 = this.str,
                        _0x536b60;
                    while (_0x536b60 = _0x9ba6d5.charAt(_0x372473)) {
                        if (_0x536b60 === '"') return _0x372473 - this.pos - 1;
                        if (_0x536b60 === '\\') _0x372473 += 2;
                        else _0x372473++;
                    }
                    throw this.error('unterminated string', _0x372473 - this.pos - 1);
                }
                read(_0x21c819) {
                    let _0x5863c3 = this.buf,
                        _0x4817aa = false,
                        _0x333937;
                    while ((_0x333937 = _0x5863c3.charAt(this.pos++)) && /\s/.test(_0x333937)) {
                        if (_0x333937 === '\n') this.line++;
                    }
                    let _0x3eadc5 = this.pos;
                    if (_0x333937 === '/') {
                        switch (_0x5863c3.charAt(this.pos++)) {
                            case '/':
                                this.line++;
                                while ((_0x333937 = _0x5863c3.charAt(this.pos++)) && _0x333937 !== '\n') this.line++;
                                return this.next(_0x21c819);
                            case '*':
                                this.line++;
                                if (_0x5863c3.charAt(this.pos) === '*' && _0x5863c3.charAt(this.pos + 1) === '/') {
                                    _0x4817aa = true;
                                }
                                while (_0x333937 = _0x5863c3.charAt(this.pos++)) {
                                    if (_0x333937 === '*' && _0x5863c3.charAt(this.pos) === '/') {
                                        if (_0x4817aa && _0x21c819) {
                                            return extractJavadoc(_0x5863c3.slice(_0x3eadc5, this.pos - 1));
                                        }
                                        this.line++;
                                        if (_0x4817aa) return this.next(_0x21c819);
                                    }
                                }
                                throw this.error('unterminated comment', _0x3eadc5);
                        }
                    }
                    throw this.error('unexpected character', _0x3eadc5);
                }
                error(_0x339c08, _0x119e63) {
                    return this.expect(_0x339c08, _0x119e63);
                }
            };
            function extractJavadoc(_0x226b53) {
                let _0x4160d1 = _0x226b53.replace(/^[ \t]+|[ \t]+$/g, '').split('\n').map((_0x43f95b, _0x3d2d45) => {
                    return _0x3d2d45 ? _0x43f95b.replace(/^\s*\*\s?/, '') : _0x43f95b;
                });
                while (_0x4160d1.length && !_0x4160d1[0]) _0x4160d1.shift();
                while (_0x4160d1.length && !_0x4160d1[_0x4160d1.length - 1]) _0x4160d1.pop();
                return _0x4160d1.join('\n');
            }
            function protocolNamespace(_0x43368c) {
                if (_0x43368c.namespace) return _0x43368c.namespace;
                let _0x195bb6 = /^(.*)\.[^.]+$/.exec(_0x43368c.name);
                return _0x195bb6 ? _0x195bb6[1] : undefined;
            }
            const _0x449493 = {};
            _0x449493.Lcg = _0x30a601;
            _0x449493.Heap = _0x1bf7b6;
            _0x449493.compare = _0x42b453;
            _0x449493.toMap = _0x386c27;
            _0x449493.toArray = _0x3e07d9;
            _0x449493.hasDuplicates = _0x3d8a4f;
            _0x449493.copyOwnProperties = _0x3ad6eb;
            _0x449493.isValidId = _0x241685;
            _0x449493.qualify = _0x162c33;
            _0x449493.unqualify = _0x1c26b2;
            _0x449493.getNamespace = _0x1d73f6;
            _0x449493.jsonEnd = _0x5d1e6e;
            _0x449493.abstractFunction = _0x13d6d1;
            _0x449493.decodeString = _0x2a5a07;
            _0x449493.encodeString = _0x41298f;
            _0x449493.byteLength = _0x72ad15;
            _0x449493.decodeBytes = _0xcc6961;
            _0x449493.encodeBytes = _0x3b9c15;
            _0x449493.Reader = _0x59a2a9;
            _0x449493.Tokenizer = Tokenizer;
            _0x449493.assembleProtocol = assembleProtocol;
            _0x449493.read = read;
            _0x449493.Reader.create = Reader.create;
            _0x449493.Reader.schema = Reader.schema;
            module.exports = _0x449493;
        }
    });
