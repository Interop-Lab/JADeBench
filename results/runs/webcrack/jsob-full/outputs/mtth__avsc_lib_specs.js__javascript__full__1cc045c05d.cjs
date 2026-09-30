'use strict';

var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (_0x55ac9a, _0x2d3bb4) => function _0x417e8f() {
  if (!_0x2d3bb4) {
    (0, _0x55ac9a[__getOwnPropNames(_0x55ac9a)[0]])((_0x2d3bb4 = {
      exports: {}
    }).exports, _0x2d3bb4);
  }
  return _0x2d3bb4.exports;
};
var require_files = __commonJS({
  "../work/mtth__avsc/lib/files.js"(_0xef672e, _0xfcb6a3) {
    'use strict';

    var _0x2d6d92 = require("fs");
    var _0x54de06 = require("path");
    function _0x210daf() {
      let _0x4e8e38 = {};
      return function ({
        path: _0x322544,
        importerPath: _0x31d0d3
      }, _0x3c87dc) {
        _0x322544 = _0x54de06.resolve(_0x54de06.dirname(_0x31d0d3), _0x322544);
        if (_0x4e8e38[_0x322544]) {
          process.nextTick(_0x3c87dc);
          return;
        }
        _0x4e8e38[_0x322544] = true;
        _0x2d6d92.readFile(_0x322544, {
          encoding: "utf8"
        }, (_0x10fc3a, _0x4d99f6) => {
          if (_0x10fc3a) {
            return _0x3c87dc(_0x10fc3a);
          }
          const _0x3ce2ad = {
            contents: _0x4d99f6,
            path: _0x322544
          };
          return _0x3c87dc(null, _0x3ce2ad);
        });
      };
    }
    function _0x548b39() {
      let _0x2329ab = {};
      return function ({
        path: _0x4873da,
        importerPath: _0x30b4d4
      }, _0x1ad409) {
        _0x4873da = _0x54de06.resolve(_0x54de06.dirname(_0x30b4d4), _0x4873da);
        if (_0x2329ab[_0x4873da]) {
          _0x1ad409();
        } else {
          _0x2329ab[_0x4873da] = true;
          _0x1ad409(null, {
            contents: _0x2d6d92.readFileSync(_0x4873da, {
              encoding: "utf8"
            }),
            path: _0x4873da
          });
        }
      };
    }
    function _0x332ff2(_0xf6044a) {
      if (typeof _0xf6044a == "string" && _0xf6044a.indexOf(_0x54de06.sep) !== -1) {
        try {
          return _0x2d6d92.readFileSync(_0xf6044a, {
            encoding: "utf8"
          });
        } catch (_0x14630e) {
          if (_0x14630e.code !== "ENOENT") {
            throw _0x14630e;
          }
        }
      }
      return null;
    }
    const _0x5418ad = {
      createImportHook: _0x210daf,
      createSyncImportHook: _0x548b39,
      tryReadFileSync: _0x332ff2
    };
    _0xfcb6a3.exports = _0x5418ad;
  }
});
var require_platform = __commonJS({
  "../work/mtth__avsc/lib/platform.js"(_0x312bd8, _0x3a1012) {
    var _0x1639a0 = require("crypto");
    function _0xd0e82a(_0x3e849a, _0x5648b6) {
      _0x5648b6 = _0x5648b6 || "md5";
      let _0x37ba7c = _0x1639a0.createHash(_0x5648b6);
      _0x37ba7c.end(_0x3e849a);
      let _0x4f6ac6 = _0x37ba7c.read();
      return new Uint8Array(_0x4f6ac6.buffer, _0x4f6ac6.byteOffset, _0x4f6ac6.length);
    }
    const _0x1adef5 = {
      getHash: _0xd0e82a
    };
    _0x3a1012.exports = _0x1adef5;
  }
});
var require_utils = __commonJS({
  "../work/mtth__avsc/lib/utils.js"(_0x37c48d, _0x16bf3d) {
    'use strict';

    var _0x28fca6 = require_platform();
    var _0x17f6b9 = /^[A-Za-z_][A-Za-z0-9_]*$/;
    function _0x1b47f7(_0x17de31) {
      return _0x17de31 instanceof Uint8Array;
    }
    function _0x568d08(_0x23542d) {
      return _0x23542d.charAt(0).toUpperCase() + _0x23542d.slice(1);
    }
    function _0x42b453(_0x14aa33, _0x5465b6) {
      if (_0x14aa33 === _0x5465b6) {
        return 0;
      } else if (_0x14aa33 < _0x5465b6) {
        return -1;
      } else {
        return 1;
      }
    }
    var _0x433461;
    var _0x1f177a;
    if (typeof Buffer == "function") {
      _0x433461 = Buffer.compare;
      _0x1f177a = function (_0x585aab, _0xcc7419) {
        return Buffer.prototype.equals.call(_0x585aab, _0xcc7419);
      };
    } else {
      _0x433461 = function (_0x5b1dd9, _0x4762ac) {
        if (_0x5b1dd9 === _0x4762ac) {
          return 0;
        }
        let _0x39930d = Math.min(_0x5b1dd9.length, _0x4762ac.length);
        for (let _0x43184b = 0; _0x43184b < _0x39930d; _0x43184b++) {
          if (_0x5b1dd9[_0x43184b] !== _0x4762ac[_0x43184b]) {
            return Math.sign(_0x5b1dd9[_0x43184b] - _0x4762ac[_0x43184b]);
          }
        }
        return Math.sign(_0x5b1dd9.length - _0x4762ac.length);
      };
      _0x1f177a = function (_0x2965da, _0x226873) {
        if (_0x2965da.length !== _0x226873.length) {
          return false;
        }
        return _0x433461(_0x2965da, _0x226873) === 0;
      };
    }
    function _0x48ee66(_0x106235, _0x19cb1a, _0x18bc83) {
      let _0x3a30ae = _0x106235[_0x19cb1a];
      if (_0x3a30ae === undefined) {
        return _0x18bc83;
      } else {
        return _0x3a30ae;
      }
    }
    function _0x3ba6fc(_0x3e0561, _0x508a06) {
      let _0x406ca8 = -1;
      if (!_0x3e0561) {
        return -1;
      }
      for (let _0x3b15d8 = 0, _0x5307e2 = _0x3e0561.length; _0x3b15d8 < _0x5307e2; _0x3b15d8++) {
        if (_0x3e0561[_0x3b15d8] === _0x508a06) {
          if (_0x406ca8 >= 0) {
            return -2;
          }
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
      return Object.keys(_0x164401).map(_0x31f7c3 => {
        return _0x164401[_0x31f7c3];
      });
    }
    function _0x3d8a4f(_0x223aa7, _0x157dfb) {
      let _0x21642f = Object.create(null);
      for (let _0x3e38b5 = 0, _0x24baa5 = _0x223aa7.length; _0x3e38b5 < _0x24baa5; _0x3e38b5++) {
        let _0x10e836 = _0x223aa7[_0x3e38b5];
        if (_0x157dfb) {
          _0x10e836 = _0x157dfb(_0x10e836);
        }
        if (_0x21642f[_0x10e836]) {
          return true;
        }
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
      if (~_0x51236a.indexOf(".")) {
        _0x51236a = _0x51236a.replace(/^\./, "");
      } else if (_0x1b3ac6) {
        _0x51236a = _0x1b3ac6 + "." + _0x51236a;
      }
      _0x51236a.split(".").forEach(_0x382679 => {
        if (!_0x241685(_0x382679)) {
          throw new Error("invalid name: " + _0x5f08cb(_0x51236a));
        }
      });
      return _0x51236a;
    }
    function _0x1c26b2(_0x27a2d4) {
      let _0x3548e6 = _0x27a2d4.split(".");
      return _0x3548e6[_0x3548e6.length - 1];
    }
    function _0x1d73f6(_0x33d0ed) {
      let _0x1980a6 = /^(.*)\.[^.]+$/.exec(_0x33d0ed);
      if (_0x1980a6) {
        return _0x1980a6[1];
      } else {
        return undefined;
      }
    }
    function _0x5d1e6e(_0x5b5667, _0x235fbd) {
      _0x235fbd = _0x235fbd | 0;
      let _0x20099c = _0x5b5667.charAt(_0x235fbd++);
      if (/[\d-]/.test(_0x20099c)) {
        while (/[eE\d.+-]/.test(_0x5b5667.charAt(_0x235fbd))) {
          _0x235fbd++;
        }
        return _0x235fbd;
      } else if (/true|null/.test(_0x5b5667.slice(_0x235fbd - 1, _0x235fbd + 3))) {
        return _0x235fbd + 3;
      } else if (/false/.test(_0x5b5667.slice(_0x235fbd - 1, _0x235fbd + 4))) {
        return _0x235fbd + 4;
      }
      let _0x4d04e7 = 0;
      let _0x204d4b = false;
      do {
        switch (_0x20099c) {
          case "{":
          case "[":
            if (!_0x204d4b) {
              _0x4d04e7++;
            }
            break;
          case "}":
          case "]":
            if (!_0x204d4b && ! --_0x4d04e7) {
              return _0x235fbd;
            }
            break;
          case "\"":
            _0x204d4b = !_0x204d4b;
            if (!_0x4d04e7 && !_0x204d4b) {
              return _0x235fbd;
            }
            break;
          case "\\":
            _0x235fbd++;
        }
      } while (_0x20099c = _0x5b5667.charAt(_0x235fbd++));
      return -1;
    }
    function _0x13d6d1() {
      throw new Error("abstract");
    }
    var _0x30a601 = class {
      constructor(_0x6129ab) {
        let _0x11a5af = 1103515245;
        let _0x697407 = 12345;
        let _0x3b84fd = Math.pow(2, 31);
        let _0x5878f1 = Math.floor(_0x6129ab || Math.random() * (_0x3b84fd - 1));
        this._max = _0x3b84fd;
        this._nextInt = function () {
          _0x5878f1 = (_0x11a5af * _0x5878f1 + _0x697407) % _0x3b84fd;
          return _0x5878f1;
        };
      }
      nextBoolean() {
        return !!(this._nextInt() % 2);
      }
      nextInt(_0x216dd9, _0x3f876f) {
        if (_0x3f876f === undefined) {
          _0x3f876f = _0x216dd9;
          _0x216dd9 = 0;
        }
        _0x3f876f = _0x3f876f === undefined ? this._max : _0x3f876f;
        return _0x216dd9 + Math.floor(this.nextFloat() * (_0x3f876f - _0x216dd9));
      }
      nextFloat(_0x596dee, _0x4777e8) {
        if (_0x4777e8 === undefined) {
          _0x4777e8 = _0x596dee;
          _0x596dee = 0;
        }
        _0x4777e8 = _0x4777e8 === undefined ? 1 : _0x4777e8;
        return _0x596dee + (_0x4777e8 - _0x596dee) * this._nextInt() / this._max;
      }
      nextString(_0x544c0a, _0x5be55a) {
        _0x544c0a |= 0;
        _0x5be55a = _0x5be55a || "aA";
        let _0x20c251 = "";
        if (_0x5be55a.indexOf("a") > -1) {
          _0x20c251 += "abcdefghijklmnopqrstuvwxyz";
        }
        if (_0x5be55a.indexOf("A") > -1) {
          _0x20c251 += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        }
        if (_0x5be55a.indexOf("#") > -1) {
          _0x20c251 += "0123456789";
        }
        if (_0x5be55a.indexOf("!") > -1) {
          _0x20c251 += "~`!@#$%^&*()_+-={}[]:\";'<>?,./|\\";
        }
        let _0x5cea66 = [];
        for (let _0x5689c0 = 0; _0x5689c0 < _0x544c0a; _0x5689c0++) {
          _0x5cea66.push(this.choice(_0x20c251));
        }
        return _0x5cea66.join("");
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
        if (!_0x38df2d) {
          throw new Error("choosing from empty array");
        }
        return _0x5e9e31[this.nextInt(_0x38df2d)];
      }
    };
    var _0x1bf7b6 = class {
      constructor() {
        this._index = 0;
        this._items = [];
      }
      push(_0x2a089f) {
        let _0x19e3ea = this._items;
        let _0xe21800 = _0x19e3ea.length | 0;
        let _0x8b8dbf;
        _0x19e3ea.push(_0x2a089f);
        while (_0xe21800 > 0 && _0x19e3ea[_0xe21800].index < _0x19e3ea[_0x8b8dbf = _0xe21800 - 1 >> 1].index) {
          _0x2a089f = _0x19e3ea[_0xe21800];
          _0x19e3ea[_0xe21800] = _0x19e3ea[_0x8b8dbf];
          _0x19e3ea[_0x8b8dbf] = _0x2a089f;
          _0xe21800 = _0x8b8dbf;
        }
      }
      pop() {
        let _0x4b35d3 = this._items;
        let _0x66aac = _0x4b35d3.length - 1 | 0;
        let _0x5efb12 = _0x4b35d3[0];
        if (!_0x5efb12 || _0x5efb12.index > this._index) {
          return null;
        }
        this._index++;
        if (!_0x66aac) {
          _0x4b35d3.pop();
          return _0x5efb12;
        }
        _0x4b35d3[0] = _0x4b35d3.pop();
        let _0x293052 = _0x66aac >> 1;
        let _0xd82440 = 0;
        let _0x30e19b;
        let _0x489e94;
        let _0x112d0a;
        let _0x5bf592;
        let _0x2a28ac;
        let _0x57b47a;
        let _0x368c8d;
        while (_0xd82440 < _0x293052) {
          _0x5bf592 = _0x4b35d3[_0xd82440];
          _0x30e19b = (_0xd82440 << 1) + 1;
          _0x489e94 = _0xd82440 + 1 << 1;
          _0x57b47a = _0x4b35d3[_0x30e19b];
          _0x368c8d = _0x4b35d3[_0x489e94];
          if (!_0x368c8d || _0x57b47a.index <= _0x368c8d.index) {
            _0x2a28ac = _0x57b47a;
            _0x112d0a = _0x30e19b;
          } else {
            _0x2a28ac = _0x368c8d;
            _0x112d0a = _0x489e94;
          }
          if (_0x2a28ac.index >= _0x5bf592.index) {
            break;
          }
          _0x4b35d3[_0x112d0a] = _0x5bf592;
          _0x4b35d3[_0xd82440] = _0x2a28ac;
          _0xd82440 = _0x112d0a;
        }
        return _0x5efb12;
      }
    };
    var _0x2a5a07;
    if (typeof Buffer === "function" && typeof Buffer.prototype.utf8Slice === "function") {
      _0x2a5a07 = Function.prototype.call.bind(Buffer.prototype.utf8Slice);
    } else {
      const _0x5b443b = new TextDecoder();
      _0x2a5a07 = function (_0x139b70, _0x51bc93, _0x1fe454) {
        return _0x5b443b.decode(_0x139b70.subarray(_0x51bc93, _0x1fe454));
      };
    }
    var _0x3e40dd = new TextEncoder();
    var _0x163b2d = new Uint8Array(4096);
    var _0x5cf682 = [];
    function _0x41298f(_0x52b3fe) {
      const {
        read: _0x24774a,
        written: _0x4e1b80
      } = _0x3e40dd.encodeInto(_0x52b3fe, _0x163b2d);
      if (_0x24774a === _0x52b3fe.length) {
        if (!_0x5cf682[_0x4e1b80]) {
          _0x5cf682[_0x4e1b80] = _0x163b2d.subarray(0, _0x4e1b80);
        }
        return _0x5cf682[_0x4e1b80];
      }
      return _0x3e40dd.encode(_0x52b3fe);
    }
    var _0x72ad15;
    if (typeof Buffer === "function") {
      _0x72ad15 = Buffer.byteLength;
    } else {
      _0x72ad15 = function (_0x376e61) {
        let _0x576a2d = 0;
        while (true) {
          const {
            read: _0x470e28,
            written: _0x38a6a9
          } = _0x3e40dd.encodeInto(_0x376e61, _0x163b2d);
          _0x576a2d += _0x38a6a9;
          if (_0x470e28 === _0x376e61.length) {
            break;
          }
          _0x376e61 = _0x376e61.slice(_0x470e28);
        }
        return _0x576a2d;
      };
    }
    var _0xcc6961;
    if (typeof Buffer === "function" && typeof Buffer.prototype.latin1Slice === "function") {
      _0xcc6961 = Function.prototype.call.bind(Buffer.prototype.latin1Slice);
    } else {
      _0xcc6961 = function (_0x2ba8d4) {
        let _0x26c70f = "";
        let _0x12c39f = 0;
        let _0x4f84f7 = _0x2ba8d4.length;
        for (; _0x12c39f + 7 < _0x4f84f7; _0x12c39f += 8) {
          _0x26c70f += String.fromCharCode(_0x2ba8d4[_0x12c39f], _0x2ba8d4[_0x12c39f + 1], _0x2ba8d4[_0x12c39f + 2], _0x2ba8d4[_0x12c39f + 3], _0x2ba8d4[_0x12c39f + 4], _0x2ba8d4[_0x12c39f + 5], _0x2ba8d4[_0x12c39f + 6], _0x2ba8d4[_0x12c39f + 7]);
        }
        for (; _0x12c39f < _0x4f84f7; _0x12c39f++) {
          _0x26c70f += String.fromCharCode(_0x2ba8d4[_0x12c39f]);
        }
        return _0x26c70f;
      };
    }
    var _0x3b9c15;
    if (typeof Buffer === "function") {
      _0x3b9c15 = function (_0x3c2c05) {
        let _0x5e90d1 = Buffer.from(_0x3c2c05, "binary");
        return new Uint8Array(_0x5e90d1.buffer, _0x5e90d1.byteOffset, _0x5e90d1.length);
      };
    } else {
      _0x3b9c15 = function (_0x2eb363) {
        let _0x2feaea = new Uint8Array(_0x2eb363.length);
        for (let _0x4673c6 = 0; _0x4673c6 < _0x2eb363.length; _0x4673c6++) {
          _0x2feaea[_0x4673c6] = _0x2eb363.charCodeAt(_0x4673c6);
        }
        return Buffer.from(_0x2feaea);
      };
    }
    var _0x2fd098 = new DataView(new ArrayBuffer(8));
    var _0x59a2a9 = class _0x393411 {
      constructor(_0x54883b, _0x4fd878) {
        this.setData(_0x54883b, _0x4fd878);
      }
      setData(_0x84fa4e, _0x2c6788) {
        if (typeof Buffer === "function" && _0x84fa4e instanceof Buffer) {
          _0x84fa4e = new Uint8Array(_0x84fa4e.buffer, _0x84fa4e.byteOffset, _0x84fa4e.length);
        }
        this.arr = _0x84fa4e;
        this.pos = _0x2c6788 | 0;
        if (this.pos < 0) {
          throw new Error("negative offset");
        }
      }
      get length() {
        return this.arr.length;
      }
      reinitialize(_0x4c1330) {
        this.setData(new Uint8Array(_0x4c1330));
      }
      static fromBuffer(_0x1c4b7c, _0x57348c) {
        return new _0x393411(_0x1c4b7c, _0x57348c);
      }
      static withCapacity(_0x3aaee0) {
        let _0x2684df = new Uint8Array(_0x3aaee0);
        return new _0x393411(_0x2684df);
      }
      toBuffer() {
        return this.arr.slice(0, this.pos);
      }
      subarray(_0x1fd158, _0x422c2f) {
        return this.arr.subarray(_0x1fd158, _0x422c2f);
      }
      append(_0x9f586) {
        const _0x35e6f0 = new Uint8Array(this.arr.length + _0x9f586.length);
        _0x35e6f0.set(this.arr, 0);
        _0x35e6f0.set(_0x9f586, this.arr.length);
        this.setData(_0x35e6f0, 0);
      }
      forward(_0x3098c1) {
        const _0x5b55cd = this.arr.subarray(this.pos);
        const _0x13568e = new Uint8Array(_0x5b55cd.length + _0x3098c1.length);
        _0x13568e.set(_0x5b55cd, 0);
        _0x13568e.set(_0x3098c1, _0x5b55cd.length);
        this.setData(_0x13568e, 0);
      }
      isValid() {
        return this.pos <= this.arr.length;
      }
      _invalidate() {
        this.pos = this.arr.length + 1;
      }
      readBoolean() {
        return !!this.arr[this.pos++];
      }
      skipBoolean() {
        this.pos++;
      }
      writeBoolean(_0x3acac2) {
        this.arr[this.pos++] = !!_0x3acac2;
      }
      readLong() {
        let _0xe56f8a = 0;
        let _0x51752c = 0;
        let _0x6b2a72 = this.arr;
        let _0x2c6bef;
        let _0x43d4d0;
        let _0x2d699f;
        let _0x439a17;
        do {
          _0x2c6bef = _0x6b2a72[this.pos++];
          _0x43d4d0 = _0x2c6bef & 128;
          _0xe56f8a |= (_0x2c6bef & 127) << _0x51752c;
          _0x51752c += 7;
        } while (_0x43d4d0 && _0x51752c < 28);
        if (_0x43d4d0) {
          _0x2d699f = _0xe56f8a;
          _0x439a17 = 268435456;
          do {
            _0x2c6bef = _0x6b2a72[this.pos++];
            _0x2d699f += (_0x2c6bef & 127) * _0x439a17;
            _0x439a17 *= 128;
          } while (_0x2c6bef & 128);
          return (_0x2d699f % 2 ? -(_0x2d699f + 1) : _0x2d699f) / 2;
        }
        return _0xe56f8a >> 1 ^ -(_0xe56f8a & 1);
      }
      skipLong() {
        let _0x1a5934 = this.arr;
        while (_0x1a5934[this.pos++] & 128) {}
      }
      writeLong(_0x2d6ed0) {
        let _0x4c48ea = this.arr;
        let _0x164cf6;
        let _0x47fe81;
        if (_0x2d6ed0 >= -1073741824 && _0x2d6ed0 < 1073741824) {
          _0x47fe81 = _0x2d6ed0 >= 0 ? _0x2d6ed0 << 1 : ~_0x2d6ed0 << 1 | 1;
          do {
            _0x4c48ea[this.pos] = _0x47fe81 & 127;
            _0x47fe81 >>= 7;
          } while (_0x47fe81 && (_0x4c48ea[this.pos++] |= 128));
        } else {
          _0x164cf6 = _0x2d6ed0 >= 0 ? _0x2d6ed0 * 2 : -_0x2d6ed0 * 2 - 1;
          do {
            _0x4c48ea[this.pos] = _0x164cf6 & 127;
            _0x164cf6 /= 128;
          } while (_0x164cf6 >= 1 && (_0x4c48ea[this.pos++] |= 128));
        }
        this.pos++;
      }
      readFloat() {
        let _0x2658c7 = this.pos;
        this.pos += 4;
        if (this.pos > this.arr.length) {
          return 0;
        }
        _0x2fd098.setUint32(0, this.arr[_0x2658c7] | this.arr[_0x2658c7 + 1] << 8 | this.arr[_0x2658c7 + 2] << 16 | this.arr[_0x2658c7 + 3] << 24, true);
        return _0x2fd098.getFloat32(0, true);
      }
      skipFloat() {
        this.pos += 4;
      }
      writeFloat(_0x4248e7) {
        let _0x142e36 = this.pos;
        this.pos += 4;
        if (this.pos > this.arr.length) {
          return;
        }
        _0x2fd098.setFloat32(0, _0x4248e7, true);
        const _0x2341bd = _0x2fd098.getUint32(0, true);
        this.arr[_0x142e36] = _0x2341bd & 255;
        this.arr[_0x142e36 + 1] = _0x2341bd >> 8 & 255;
        this.arr[_0x142e36 + 2] = _0x2341bd >> 16 & 255;
        this.arr[_0x142e36 + 3] = _0x2341bd >> 24;
      }
      readDouble() {
        let _0x3b5f3a = this.pos;
        this.pos += 8;
        if (this.pos > this.arr.length) {
          return 0;
        }
        _0x2fd098.setUint32(0, this.arr[_0x3b5f3a] | this.arr[_0x3b5f3a + 1] << 8 | this.arr[_0x3b5f3a + 2] << 16 | this.arr[_0x3b5f3a + 3] << 24, true);
        _0x2fd098.setUint32(4, this.arr[_0x3b5f3a + 4] | this.arr[_0x3b5f3a + 5] << 8 | this.arr[_0x3b5f3a + 6] << 16 | this.arr[_0x3b5f3a + 7] << 24, true);
        return _0x2fd098.getFloat64(0, true);
      }
      skipDouble() {
        this.pos += 8;
      }
      writeDouble(_0x18a7d5) {
        let _0x1f7479 = this.pos;
        this.pos += 8;
        if (this.pos > this.arr.length) {
          return;
        }
        _0x2fd098.setFloat64(0, _0x18a7d5, true);
        const _0x3eaaf4 = _0x2fd098.getUint32(0, true);
        const _0x40b769 = _0x2fd098.getUint32(4, true);
        this.arr[_0x1f7479] = _0x3eaaf4 & 255;
        this.arr[_0x1f7479 + 1] = _0x3eaaf4 >> 8 & 255;
        this.arr[_0x1f7479 + 2] = _0x3eaaf4 >> 16 & 255;
        this.arr[_0x1f7479 + 3] = _0x3eaaf4 >> 24;
        this.arr[_0x1f7479 + 4] = _0x40b769 & 255;
        this.arr[_0x1f7479 + 5] = _0x40b769 >> 8 & 255;
        this.arr[_0x1f7479 + 6] = _0x40b769 >> 16 & 255;
        this.arr[_0x1f7479 + 7] = _0x40b769 >> 24;
      }
      readFixed(_0x21236a) {
        let _0x34ed88 = this.pos;
        this.pos += _0x21236a;
        if (this.pos > this.arr.length) {
          return;
        }
        return this.arr.slice(_0x34ed88, _0x34ed88 + _0x21236a);
      }
      skipFixed(_0x4f1044) {
        this.pos += _0x4f1044;
      }
      writeFixed(_0xad8a13, _0x1b9530) {
        _0x1b9530 = _0x1b9530 || _0xad8a13.length;
        let _0x58f921 = this.pos;
        this.pos += _0x1b9530;
        if (this.pos > this.arr.length) {
          return;
        }
        this.arr.set(_0xad8a13.subarray(0, _0x1b9530), _0x58f921);
      }
      readBytes() {
        let _0x550500 = this.readLong();
        if (_0x550500 < 0) {
          this._invalidate();
          return;
        }
        return this.readFixed(_0x550500);
      }
      skipBytes() {
        let _0x48cdef = this.readLong();
        if (_0x48cdef < 0) {
          this._invalidate();
          return;
        }
        this.pos += _0x48cdef;
      }
      writeBytes(_0x3eac40) {
        let _0x454c8f = _0x3eac40.length;
        this.writeLong(_0x454c8f);
        this.writeFixed(_0x3eac40, _0x454c8f);
      }
      skipString() {
        let _0x76ef69 = this.readLong();
        if (_0x76ef69 < 0) {
          this._invalidate();
          return;
        }
        this.pos += _0x76ef69;
      }
      readString() {
        let _0x54343d = this.readLong();
        if (_0x54343d < 0) {
          this._invalidate();
          return "";
        }
        let _0x299868 = this.pos;
        this.pos += _0x54343d;
        if (this.pos > this.arr.length) {
          return;
        }
        let _0x59fbe3 = this.arr;
        let _0x169af3 = _0x299868 + _0x54343d;
        if (_0x54343d > 24) {
          return _0x2a5a07(_0x59fbe3, _0x299868, _0x169af3);
        }
        let _0x4d646e = "";
        while (_0x299868 + 3 < _0x169af3) {
          let _0x482b55 = _0x59fbe3[_0x299868];
          let _0x5942e6 = _0x59fbe3[_0x299868 + 1];
          let _0x1d408f = _0x59fbe3[_0x299868 + 2];
          let _0x540026 = _0x59fbe3[_0x299868 + 3];
          if ((_0x482b55 | _0x5942e6 | _0x1d408f | _0x540026) & 128) {
            _0x4d646e += _0x2a5a07(_0x59fbe3, _0x299868, _0x169af3);
            return _0x4d646e;
          }
          _0x4d646e += String.fromCharCode(_0x482b55, _0x5942e6, _0x1d408f, _0x540026);
          _0x299868 += 4;
        }
        while (_0x299868 < _0x169af3) {
          let _0x4bb5ff = _0x59fbe3[_0x299868];
          if (_0x4bb5ff & 128) {
            _0x4d646e += _0x2a5a07(_0x59fbe3, _0x299868, _0x169af3);
            return _0x4d646e;
          }
          _0x4d646e += String.fromCharCode(_0x4bb5ff);
          _0x299868++;
        }
        return _0x4d646e;
      }
      writeString(_0x22acc8) {
        let _0x22af28 = this.arr;
        const _0x4e7ada = _0x22acc8.length;
        if (_0x4e7ada > 21) {
          let _0x5e8927;
          let _0x3a0510;
          if (this.isValid()) {
            _0x3a0510 = _0x41298f(_0x22acc8);
            _0x5e8927 = _0x3a0510.length;
          } else {
            _0x5e8927 = _0x72ad15(_0x22acc8);
          }
          this.writeLong(_0x5e8927);
          let _0x375648 = this.pos;
          this.pos += _0x5e8927;
          if (this.isValid() && typeof _0x3a0510 != "undefined") {
            _0x22af28.set(_0x3a0510, _0x375648);
          }
        } else {
          let _0x5c434d = this.pos + 1;
          let _0x3073e0 = _0x5c434d;
          let _0xcf4bb8 = _0x22af28.length;
          for (let _0x237f49 = 0; _0x237f49 < _0x4e7ada; _0x237f49++) {
            let _0x33a6c9 = _0x22acc8.charCodeAt(_0x237f49);
            let _0x379da6;
            if (_0x33a6c9 < 128) {
              if (_0x5c434d < _0xcf4bb8) {
                _0x22af28[_0x5c434d] = _0x33a6c9;
              }
              _0x5c434d++;
            } else if (_0x33a6c9 < 2048) {
              if (_0x5c434d + 1 < _0xcf4bb8) {
                _0x22af28[_0x5c434d] = _0x33a6c9 >> 6 | 192;
                _0x22af28[_0x5c434d + 1] = _0x33a6c9 & 63 | 128;
              }
              _0x5c434d += 2;
            } else if ((_0x33a6c9 & 64512) === 55296 && ((_0x379da6 = _0x22acc8.charCodeAt(_0x237f49 + 1)) & 64512) === 56320) {
              _0x33a6c9 = 65536 + ((_0x33a6c9 & 1023) << 10) + (_0x379da6 & 1023);
              _0x237f49++;
              if (_0x5c434d + 3 < _0xcf4bb8) {
                _0x22af28[_0x5c434d] = _0x33a6c9 >> 18 | 240;
                _0x22af28[_0x5c434d + 1] = _0x33a6c9 >> 12 & 63 | 128;
                _0x22af28[_0x5c434d + 2] = _0x33a6c9 >> 6 & 63 | 128;
                _0x22af28[_0x5c434d + 3] = _0x33a6c9 & 63 | 128;
              }
              _0x5c434d += 4;
            } else {
              if (_0x5c434d + 2 < _0xcf4bb8) {
                _0x22af28[_0x5c434d] = _0x33a6c9 >> 12 | 224;
                _0x22af28[_0x5c434d + 1] = _0x33a6c9 >> 6 & 63 | 128;
                _0x22af28[_0x5c434d + 2] = _0x33a6c9 & 63 | 128;
              }
              _0x5c434d += 3;
            }
          }
          if (this.pos <= _0xcf4bb8) {
            this.writeLong(_0x5c434d - _0x3073e0);
          }
          this.pos = _0x5c434d;
        }
      }
      matchBoolean(_0x8ccbc6) {
        return this.arr[this.pos++] - _0x8ccbc6.arr[_0x8ccbc6.pos++];
      }
      matchLong(_0x1ddf4a) {
        let _0x51450b = this.readLong();
        let _0x19ab0d = _0x1ddf4a.readLong();
        if (_0x51450b === _0x19ab0d) {
          return 0;
        } else if (_0x51450b < _0x19ab0d) {
          return -1;
        } else {
          return 1;
        }
      }
      matchFloat(_0x32a091) {
        let _0x31d40e = this.readFloat();
        let _0x32b7dd = _0x32a091.readFloat();
        if (_0x31d40e === _0x32b7dd) {
          return 0;
        } else if (_0x31d40e < _0x32b7dd) {
          return -1;
        } else {
          return 1;
        }
      }
      matchDouble(_0x3a4b61) {
        let _0x4d8f71 = this.readDouble();
        let _0x2b385c = _0x3a4b61.readDouble();
        if (_0x4d8f71 === _0x2b385c) {
          return 0;
        } else if (_0x4d8f71 < _0x2b385c) {
          return -1;
        } else {
          return 1;
        }
      }
      matchFixed(_0x4ade1d, _0x3c7339) {
        return _0x433461(this.readFixed(_0x3c7339), _0x4ade1d.readFixed(_0x3c7339));
      }
      matchBytes(_0x2b43d4) {
        let _0x8e819b = this.readLong();
        let _0x591022 = this.pos;
        this.pos += _0x8e819b;
        let _0x2edcb5 = _0x2b43d4.readLong();
        let _0x474bbb = _0x2b43d4.pos;
        _0x2b43d4.pos += _0x2edcb5;
        let _0x4e33c3 = this.arr.subarray(_0x591022, this.pos);
        let _0x27bc64 = _0x2b43d4.arr.subarray(_0x474bbb, _0x2b43d4.pos);
        return _0x433461(_0x4e33c3, _0x27bc64);
      }
      unpackLongBytes() {
        let _0x4e3789 = new Uint8Array(8);
        let _0x2eac1e = 0;
        let _0x4fdd79 = 0;
        let _0x145a87 = 6;
        let _0x2bcb97 = this.arr;
        let _0x44a378 = _0x2bcb97[this.pos++];
        let _0x557f76 = _0x44a378 & 1;
        _0x4e3789.fill(0);
        _0x2eac1e |= (_0x44a378 & 127) >> 1;
        while (_0x44a378 & 128) {
          _0x44a378 = _0x2bcb97[this.pos++];
          _0x2eac1e |= (_0x44a378 & 127) << _0x145a87;
          _0x145a87 += 7;
          if (_0x145a87 >= 8) {
            _0x145a87 -= 8;
            _0x4e3789[_0x4fdd79++] = _0x2eac1e;
            _0x2eac1e >>= 8;
          }
        }
        _0x4e3789[_0x4fdd79] = _0x2eac1e;
        if (_0x557f76) {
          _0x33f739(_0x4e3789, 8);
        }
        return _0x4e3789;
      }
      packLongBytes(_0x121c56) {
        let _0x5ba2ef = (_0x121c56[7] & 128) >> 7;
        let _0x3162f1 = this.arr;
        let _0x1e4093 = 1;
        let _0x318e32 = 0;
        let _0x5d45c2 = 3;
        let _0xbfe38e;
        if (_0x5ba2ef) {
          _0x33f739(_0x121c56, 8);
          _0xbfe38e = 1;
        } else {
          _0xbfe38e = 0;
        }
        let _0x4f0e03 = [_0x121c56[0] | _0x121c56[1] << 8 | _0x121c56[2] << 16, _0x121c56[3] | _0x121c56[4] << 8 | _0x121c56[5] << 16, _0x121c56[6] | _0x121c56[7] << 8];
        while (_0x5d45c2 && !_0x4f0e03[--_0x5d45c2]) {}
        while (_0x318e32 < _0x5d45c2) {
          _0xbfe38e |= _0x4f0e03[_0x318e32++] << _0x1e4093;
          _0x1e4093 += 24;
          while (_0x1e4093 > 7) {
            _0x3162f1[this.pos++] = _0xbfe38e & 127 | 128;
            _0xbfe38e >>= 7;
            _0x1e4093 -= 7;
          }
        }
        _0xbfe38e |= _0x4f0e03[_0x5d45c2] << _0x1e4093;
        do {
          _0x3162f1[this.pos] = _0xbfe38e & 127;
          _0xbfe38e >>= 7;
        } while (_0xbfe38e && (_0x3162f1[this.pos++] |= 128));
        this.pos++;
        if (_0x5ba2ef) {
          _0x33f739(_0x121c56, 8);
        }
      }
    };
    function _0x33f739(_0x428ac6, _0x14dfec) {
      while (_0x14dfec--) {
        _0x428ac6[_0x14dfec] = ~_0x428ac6[_0x14dfec];
      }
    }
    function _0x5f08cb(_0x482585) {
      let _0x115afa = new Set();
      try {
        return JSON.stringify(_0x482585, (_0x374c06, _0x43bb2e) => {
          if (_0x115afa.has(_0x43bb2e)) {
            return "[Circular]";
          }
          if (typeof _0x43bb2e === "object" && _0x43bb2e !== null) {
            _0x115afa.add(_0x43bb2e);
          }
          if (typeof BigInt !== "undefined" && _0x43bb2e instanceof BigInt) {
            return "[BigInt " + _0x43bb2e.toString() + "n]";
          }
          return _0x43bb2e;
        });
      } catch (_0x3f6c52) {
        return "[object]";
      }
    }
    const _0x313b31 = {
      abstractFunction: _0x13d6d1,
      bufCompare: _0x433461,
      bufEqual: _0x1f177a,
      bufferToBinaryString: _0xcc6961,
      binaryStringToBuffer: _0x3b9c15,
      capitalize: _0x568d08,
      copyOwnProperties: _0x3ad6eb,
      getHash: _0x28fca6.getHash,
      compare: _0x42b453,
      getOption: _0x48ee66,
      impliedNamespace: _0x1d73f6,
      isBufferLike: _0x1b47f7,
      isValidName: _0x241685,
      jsonEnd: _0x5d1e6e,
      objectValues: _0x3e07d9,
      qualify: _0x162c33,
      toMap: _0x386c27,
      singleIndexOf: _0x3ba6fc,
      hasDuplicates: _0x3d8a4f,
      unqualify: _0x1c26b2,
      Lcg: _0x30a601,
      OrderedQueue: _0x1bf7b6,
      Tap: _0x59a2a9,
      printJSON: _0x5f08cb
    };
    _0x16bf3d.exports = _0x313b31;
  }
});
var files = require_files();
var utils = require_utils();
var TYPE_REFS = {
  date: {
    type: "int",
    logicalType: "date"
  },
  decimal: {
    type: "bytes",
    logicalType: "decimal"
  },
  time_ms: {
    type: "long",
    logicalType: "time-millis"
  },
  timestamp_ms: {
    type: "long",
    logicalType: "timestamp-millis"
  }
};
function assembleProtocol(_0x48e6db, _0x454cd9, _0x3fcf83) {
  if (!_0x3fcf83 && typeof _0x454cd9 == "function") {
    _0x3fcf83 = _0x454cd9;
    _0x454cd9 = undefined;
  }
  _0x454cd9 = _0x454cd9 || {};
  if (!_0x454cd9.importHook) {
    _0x454cd9.importHook = files.createImportHook();
  }
  _0x541879(_0x48e6db, "", (_0x35f9c4, _0x245c94) => {
    if (_0x35f9c4) {
      _0x3fcf83(_0x35f9c4);
      return;
    }
    if (!_0x245c94) {
      _0x3fcf83(new Error("empty root import"));
      return;
    }
    let _0x40eac5 = _0x245c94.types;
    if (_0x40eac5) {
      let _0x51c496 = protocolNamespace(_0x245c94) || "";
      _0x40eac5.forEach(_0x37fbba => {
        if (_0x37fbba.namespace === _0x51c496) {
          delete _0x37fbba.namespace;
        }
      });
    }
    _0x3fcf83(null, _0x245c94);
  });
  function _0x541879(_0x5bbb56, _0x5a6595, _0x4cd6da) {
    const _0x4ffee0 = {
      path: _0x5bbb56,
      importerPath: _0x5a6595,
      kind: "idl"
    };
    _0x454cd9.importHook(_0x4ffee0, (_0x5009f2, _0x3c5fce) => {
      if (_0x5009f2) {
        _0x4cd6da(_0x5009f2);
        return;
      }
      if (!_0x3c5fce) {
        _0x4cd6da();
        return;
      }
      const {
        contents: _0x1dcc72,
        path: _0x5c628c
      } = _0x3c5fce;
      let _0x80484d;
      try {
        let _0x1e4d78 = new Reader(_0x1dcc72, _0x454cd9);
        _0x80484d = _0x1e4d78._readProtocol(_0x1dcc72, _0x454cd9);
      } catch (_0x2a6c67) {
        _0x2a6c67.path = _0x5c628c;
        _0x4cd6da(_0x2a6c67);
        return;
      }
      _0x38423f(_0x80484d.protocol, _0x80484d.imports, _0x5c628c, _0x4cd6da);
    });
  }
  function _0x38423f(_0x5397eb, _0x36a627, _0x119958, _0xe0e81c) {
    let _0x4e0516 = [];
    _0x5de877();
    function _0x5de877() {
      let _0x994a72 = _0x36a627.shift();
      if (!_0x994a72) {
        _0x4e0516.reverse();
        try {
          _0x4e0516.forEach(_0x5355bd => {
            _0x3af6a7(_0x5397eb, _0x5355bd);
          });
        } catch (_0x2dad47) {
          _0xe0e81c(_0x2dad47);
          return;
        }
        _0xe0e81c(null, _0x5397eb);
        return;
      }
      if (_0x994a72.kind === "idl") {
        _0x541879(_0x994a72.name, _0x119958, (_0x408a64, _0xea60bf) => {
          if (_0x408a64) {
            _0xe0e81c(_0x408a64);
            return;
          }
          if (_0xea60bf) {
            _0x4e0516.push(_0xea60bf);
          }
          _0x5de877();
        });
      } else {
        const _0x12d099 = {
          path: _0x994a72.name,
          importerPath: _0x119958,
          kind: _0x994a72.kind
        };
        _0x454cd9.importHook(_0x12d099, (_0x38668b, _0xc6f702) => {
          if (_0x38668b) {
            _0xe0e81c(_0x38668b);
            return;
          }
          switch (_0x994a72.kind) {
            case "protocol":
            case "schema":
              {
                if (!_0xc6f702) {
                  _0x5de877();
                  return;
                }
                let _0x28dc3a;
                try {
                  _0x28dc3a = JSON.parse(_0xc6f702.contents);
                } catch (_0x54e7f7) {
                  _0x54e7f7.path = _0xc6f702.path;
                  _0xe0e81c(_0x54e7f7);
                  return;
                }
                const _0x4fea58 = {
                  types: [_0x28dc3a]
                };
                let _0x69d57b = _0x994a72.kind === "schema" ? _0x4fea58 : _0x28dc3a;
                _0x4e0516.push(_0x69d57b);
                _0x5de877();
                return;
              }
            default:
              _0xe0e81c(new Error("invalid import kind: " + _0x994a72.kind));
          }
        });
      }
    }
  }
  function _0x3af6a7(_0x50d683, _0x2bbcad) {
    let _0xd4e979 = _0x2bbcad.types || [];
    _0xd4e979.reverse();
    _0xd4e979.forEach(_0x51aa98 => {
      if (!_0x50d683.types) {
        _0x50d683.types = [];
      }
      if (_0x51aa98.namespace === undefined) {
        _0x51aa98.namespace = protocolNamespace(_0x2bbcad) || "";
      }
      _0x50d683.types.unshift(_0x51aa98);
    });
    Object.keys(_0x2bbcad.messages || {}).forEach(_0x3038b0 => {
      if (!_0x50d683.messages) {
        _0x50d683.messages = {};
      }
      if (_0x50d683.messages[_0x3038b0]) {
        throw new Error("duplicate message: " + _0x3038b0);
      }
      _0x50d683.messages[_0x3038b0] = _0x2bbcad.messages[_0x3038b0];
    });
  }
}
function read(_0x11ee71) {
  let _0x2cb333;
  let _0x18187f = files.tryReadFileSync(_0x11ee71);
  if (_0x18187f === null) {
    _0x2cb333 = _0x11ee71;
  } else {
    try {
      return JSON.parse(_0x18187f);
    } catch (_0xd7dda8) {
      let _0x28b60a = {
        importHook: files.createSyncImportHook()
      };
      assembleProtocol(_0x11ee71, _0x28b60a, (_0xde4042, _0x1f9c43) => {
        _0x2cb333 = _0xde4042 ? _0x18187f : _0x1f9c43;
      });
    }
  }
  if (typeof _0x2cb333 != "string" || _0x2cb333 === "null") {
    return _0x2cb333;
  }
  try {
    return JSON.parse(_0x2cb333);
  } catch (_0x40c201) {
    try {
      return Reader.readProtocol(_0x2cb333);
    } catch (_0x16023e) {
      try {
        return Reader.readSchema(_0x2cb333);
      } catch (_0x4310ad) {
        return _0x2cb333;
      }
    }
  }
}
var Reader = class _Reader {
  constructor(_0x46b71a, _0x141642) {
    _0x141642 = _0x141642 || {};
    this._tk = new Tokenizer(_0x46b71a);
    this._ackVoidMessages = !!_0x141642.ackVoidMessages;
    this._implicitTags = !_0x141642.delimitedCollections;
    this._typeRefs = _0x141642.typeRefs || TYPE_REFS;
  }
  static readProtocol(_0xa03290, _0x4f54c5) {
    let _0x3d01e7 = new _Reader(_0xa03290, _0x4f54c5);
    let _0x53e195 = _0x3d01e7._readProtocol();
    if (_0x53e195.imports.length) {
      throw new Error("unresolvable import");
    }
    return _0x53e195.protocol;
  }
  static readSchema(_0x552f7b, _0x23c055) {
    let _0x5ee469 = new _Reader(_0x552f7b, _0x23c055);
    let _0x275a71 = _0x5ee469._readJavadoc();
    let _0x4abe94 = _0x5ee469._readType(_0x275a71 === undefined ? {} : {
      doc: _0x275a71
    }, true);
    _0x5ee469._tk.next({
      id: "(eof)"
    });
    return _0x4abe94;
  }
  _readProtocol() {
    let _0x231750 = this._tk;
    let _0x369863 = [];
    let _0x16fd43 = [];
    let _0x5565af = {};
    this._readImports(_0x369863);
    let _0x181c82 = {};
    let _0x57ee3c = this._readJavadoc();
    if (_0x57ee3c !== undefined) {
      _0x181c82.doc = _0x57ee3c;
    }
    this._readAnnotations(_0x181c82);
    _0x231750.next({
      val: "protocol"
    });
    if (!_0x231750.next({
      val: "{",
      silent: true
    })) {
      _0x181c82.protocol = _0x231750.next({
        id: "name"
      }).val;
      _0x231750.next({
        val: "{"
      });
    }
    const _0x5de06a = {
      val: "}",
      silent: true
    };
    while (!_0x231750.next(_0x5de06a)) {
      if (!this._readImports(_0x369863)) {
        let _0x516d2f = this._readJavadoc();
        let _0x4c6ebd = this._readType({}, true);
        let _0x50a398 = this._readImports(_0x369863, true);
        let _0x3d1c36 = undefined;
        let _0x581ad8 = _0x231750.pos;
        if (!_0x50a398 && (_0x3d1c36 = this._readMessage(_0x4c6ebd))) {
          if (_0x516d2f !== undefined && _0x3d1c36.schema.doc === undefined) {
            _0x3d1c36.schema.doc = _0x516d2f;
          }
          let _0x396f0a = false;
          if (_0x3d1c36.schema.response === "void" || _0x3d1c36.schema.response.type === "void") {
            _0x396f0a = !this._ackVoidMessages && !_0x3d1c36.schema.errors;
            if (_0x3d1c36.schema.response === "void") {
              _0x3d1c36.schema.response = "null";
            } else {
              _0x3d1c36.schema.response.type = "null";
            }
          }
          if (_0x396f0a) {
            _0x3d1c36.schema["one-way"] = true;
          }
          if (_0x5565af[_0x3d1c36.name]) {
            throw new Error("duplicate message: " + _0x3d1c36.name);
          }
          _0x5565af[_0x3d1c36.name] = _0x3d1c36.schema;
        } else {
          if (_0x516d2f) {
            if (typeof _0x4c6ebd == "string") {
              _0x4c6ebd = {
                doc: _0x516d2f,
                type: _0x4c6ebd
              };
            } else if (_0x4c6ebd.doc === undefined) {
              _0x4c6ebd.doc = _0x516d2f;
            }
          }
          _0x16fd43.push(_0x4c6ebd);
          _0x231750.pos = _0x581ad8;
          _0x231750.next({
            val: ";",
            silent: true
          });
        }
        _0x516d2f = undefined;
      }
    }
    _0x231750.next({
      id: "(eof)"
    });
    if (_0x16fd43.length) {
      _0x181c82.types = _0x16fd43;
    }
    if (Object.keys(_0x5565af).length) {
      _0x181c82.messages = _0x5565af;
    }
    const _0x2a5428 = {
      protocol: _0x181c82,
      imports: _0x369863
    };
    return _0x2a5428;
  }
  _readAnnotations(_0x16ab02) {
    let _0x3e73bf = this._tk;
    const _0x4e0171 = {
      val: "@",
      silent: true
    };
    while (_0x3e73bf.next(_0x4e0171)) {
      let _0x32c00d = [];
      const _0x14b9c2 = {
        val: "(",
        silent: true
      };
      while (!_0x3e73bf.next(_0x14b9c2)) {
        _0x32c00d.push(_0x3e73bf.next().val);
      }
      _0x16ab02[_0x32c00d.join("")] = _0x3e73bf.next({
        id: "json"
      }).val;
      _0x3e73bf.next({
        val: ")"
      });
    }
  }
  _readMessage(_0x264f81) {
    let _0x546742 = this._tk;
    const _0x443786 = {
      request: [],
      response: _0x264f81
    };
    let _0x5a8661 = _0x443786;
    this._readAnnotations(_0x5a8661);
    let _0x23e726 = _0x546742.next().val;
    if (_0x546742.next().val !== "(") {
      return;
    }
    if (!_0x546742.next({
      val: ")",
      silent: true
    })) {
      const _0x4cea84 = {
        val: ")",
        silent: true
      };
      const _0x583dc3 = {
        val: ","
      };
      do {
        _0x5a8661.request.push(this._readField());
      } while (!_0x546742.next(_0x4cea84) && _0x546742.next(_0x583dc3));
    }
    let _0x2a5a9b = _0x546742.next();
    switch (_0x2a5a9b.val) {
      case "throws":
        _0x5a8661.errors = [];
        const _0x4c3fba = {
          val: ";",
          silent: true
        };
        const _0x4f2b82 = {
          val: ","
        };
        do {
          _0x5a8661.errors.push(this._readType());
        } while (!_0x546742.next(_0x4c3fba) && _0x546742.next(_0x4f2b82));
        break;
      case "oneway":
        _0x5a8661["one-way"] = true;
        _0x546742.next({
          val: ";"
        });
        break;
      case ";":
        break;
      default:
        throw _0x546742.error("invalid message suffix", _0x2a5a9b);
    }
    const _0x1688c0 = {
      name: _0x23e726,
      schema: _0x5a8661
    };
    return _0x1688c0;
  }
  _readJavadoc() {
    let _0x237c01 = this._tk.next({
      id: "javadoc",
      emitJavadoc: true,
      silent: true
    });
    if (_0x237c01) {
      return _0x237c01.val;
    }
  }
  _readField() {
    let _0x2c61c5 = this._tk;
    let _0x556b24 = this._readJavadoc();
    let _0x3a825b = {
      type: this._readType()
    };
    if (_0x556b24 !== undefined && _0x3a825b.doc === undefined) {
      _0x3a825b.doc = _0x556b24;
    }
    const _0x7c63f0 = _0x2c61c5.next({
      id: "operator",
      val: "?",
      silent: true
    });
    this._readAnnotations(_0x3a825b);
    _0x3a825b.name = _0x2c61c5.next({
      id: "name"
    }).val;
    if (_0x2c61c5.next({
      val: "=",
      silent: true
    })) {
      _0x3a825b.default = _0x2c61c5.next({
        id: "json"
      }).val;
    }
    if (_0x7c63f0) {
      _0x3a825b.type = "default" in _0x3a825b && _0x3a825b.default !== null ? [_0x3a825b.type, "null"] : ["null", _0x3a825b.type];
    }
    return _0x3a825b;
  }
  _readType(_0x3db3b7, _0x38b366) {
    _0x3db3b7 = _0x3db3b7 || {};
    this._readAnnotations(_0x3db3b7);
    _0x3db3b7.type = this._tk.next({
      id: "name"
    }).val;
    switch (_0x3db3b7.type) {
      case "record":
      case "error":
        return this._readRecord(_0x3db3b7);
      case "fixed":
        return this._readFixed(_0x3db3b7);
      case "enum":
        return this._readEnum(_0x3db3b7, _0x38b366);
      case "map":
        return this._readMap(_0x3db3b7);
      case "array":
        return this._readArray(_0x3db3b7);
      case "union":
        if (Object.keys(_0x3db3b7).length > 1) {
          throw new Error("union annotations are not supported");
        }
        return this._readUnion();
      default:
        {
          let _0x5e5791 = this._typeRefs[_0x3db3b7.type];
          if (_0x5e5791) {
            delete _0x3db3b7.type;
            utils.copyOwnProperties(_0x5e5791, _0x3db3b7);
          }
          if (Object.keys(_0x3db3b7).length > 1) {
            return _0x3db3b7;
          } else {
            return _0x3db3b7.type;
          }
        }
    }
  }
  _readFixed(_0xfedeeb) {
    let _0x53ca1d = this._tk;
    if (!_0x53ca1d.next({
      val: "(",
      silent: true
    })) {
      _0xfedeeb.name = _0x53ca1d.next({
        id: "name"
      }).val;
      _0x53ca1d.next({
        val: "("
      });
    }
    _0xfedeeb.size = parseInt(_0x53ca1d.next({
      id: "number"
    }).val);
    _0x53ca1d.next({
      val: ")"
    });
    return _0xfedeeb;
  }
  _readMap(_0x57c225) {
    let _0x186321 = this._tk;
    let _0x2b9771 = this._implicitTags;
    const _0x5274a1 = {
      val: "<",
      silent: _0x2b9771
    };
    let _0x815683 = _0x186321.next(_0x5274a1) === undefined;
    _0x57c225.values = this._readType();
    const _0x2cb429 = {
      val: ">",
      silent: _0x815683
    };
    _0x186321.next(_0x2cb429);
    return _0x57c225;
  }
  _readArray(_0x1ca0d8) {
    let _0x5757ef = this._tk;
    let _0x5a8b01 = this._implicitTags;
    const _0x20878b = {
      val: "<",
      silent: _0x5a8b01
    };
    let _0x54d017 = _0x5757ef.next(_0x20878b) === undefined;
    _0x1ca0d8.items = this._readType();
    const _0x107913 = {
      val: ">",
      silent: _0x54d017
    };
    _0x5757ef.next(_0x107913);
    return _0x1ca0d8;
  }
  _readEnum(_0x1378cf, _0x218337) {
    let _0x241724 = this._tk;
    if (!_0x241724.next({
      val: "{",
      silent: true
    })) {
      _0x1378cf.name = _0x241724.next({
        id: "name"
      }).val;
      _0x241724.next({
        val: "{"
      });
    }
    _0x1378cf.symbols = [];
    const _0x430456 = {
      val: "}",
      silent: true
    };
    const _0x591b75 = {
      val: ","
    };
    do {
      _0x1378cf.symbols.push(_0x241724.next().val);
    } while (!_0x241724.next(_0x430456) && _0x241724.next(_0x591b75));
    if (_0x218337 && _0x241724.next({
      val: "=",
      silent: true
    })) {
      _0x1378cf.default = _0x241724.next().val;
      _0x241724.next({
        val: ";"
      });
    }
    return _0x1378cf;
  }
  _readUnion() {
    let _0x1d3b11 = this._tk;
    let _0x506d7d = [];
    _0x1d3b11.next({
      val: "{"
    });
    const _0x48680c = {
      val: "}",
      silent: true
    };
    const _0x448cbf = {
      val: ","
    };
    do {
      _0x506d7d.push(this._readType());
    } while (!_0x1d3b11.next(_0x48680c) && _0x1d3b11.next(_0x448cbf));
    return _0x506d7d;
  }
  _readRecord(_0x44ce29) {
    let _0x158d9a = this._tk;
    if (!_0x158d9a.next({
      val: "{",
      silent: true
    })) {
      _0x44ce29.name = _0x158d9a.next({
        id: "name"
      }).val;
      _0x158d9a.next({
        val: "{"
      });
    }
    _0x44ce29.fields = [];
    const _0x4e2e72 = {
      val: "}",
      silent: true
    };
    while (!_0x158d9a.next(_0x4e2e72)) {
      _0x44ce29.fields.push(this._readField());
      _0x158d9a.next({
        val: ";"
      });
    }
    return _0x44ce29;
  }
  _readImports(_0x448bf7, _0x438b2e) {
    let _0x122493 = this._tk;
    let _0x3b0eb8 = 0;
    let _0x20ba2b = _0x122493.pos;
    const _0x576e59 = {
      val: "import",
      silent: true
    };
    while (_0x122493.next(_0x576e59)) {
      if (!_0x3b0eb8 && _0x438b2e && _0x122493.next({
        val: "(",
        silent: true
      })) {
        _0x122493.pos = _0x20ba2b;
        return;
      }
      let _0xbfb65b = _0x122493.next({
        id: "name"
      }).val;
      let _0x28777e = JSON.parse(_0x122493.next({
        id: "string"
      }).val);
      _0x122493.next({
        val: ";"
      });
      const _0x273c7b = {
        kind: _0xbfb65b,
        name: _0x28777e
      };
      _0x448bf7.push(_0x273c7b);
      _0x3b0eb8++;
    }
    return _0x3b0eb8;
  }
};
var Tokenizer = class {
  constructor(_0x4465ef) {
    this._str = _0x4465ef;
    this.pos = 0;
  }
  next(_0x3e0ea0) {
    const _0x16548f = {
      pos: this.pos,
      id: undefined,
      val: undefined
    };
    let _0x3e987e = _0x16548f;
    let _0x1ca853 = this._skip(_0x3e0ea0 && _0x3e0ea0.emitJavadoc);
    if (typeof _0x1ca853 == "string") {
      _0x3e987e.id = "javadoc";
      _0x3e987e.val = _0x1ca853;
    } else {
      let _0x52a347 = this.pos;
      let _0x1a076b = this._str;
      let _0x1a210f = _0x1a076b.charAt(_0x52a347);
      if (!_0x1a210f) {
        _0x3e987e.id = "(eof)";
      } else {
        if (_0x3e0ea0 && _0x3e0ea0.id === "json") {
          _0x3e987e.id = "json";
          this.pos = this._endOfJson();
        } else if (_0x1a210f === "\"") {
          _0x3e987e.id = "string";
          this.pos = this._endOfString();
        } else if (/[0-9]/.test(_0x1a210f)) {
          _0x3e987e.id = "number";
          this.pos = this._endOf(/[0-9]/);
        } else if (/[`A-Za-z_.]/.test(_0x1a210f)) {
          _0x3e987e.id = "name";
          this.pos = this._endOf(/[`A-Za-z0-9_.]/);
        } else {
          _0x3e987e.id = "operator";
          this.pos = _0x52a347 + 1;
        }
        _0x3e987e.val = _0x1a076b.slice(_0x52a347, this.pos);
        if (_0x3e987e.id === "json") {
          try {
            _0x3e987e.val = JSON.parse(_0x3e987e.val);
          } catch (_0x59233b) {
            throw this.error("invalid JSON", _0x3e987e);
          }
        } else if (_0x3e987e.id === "name") {
          _0x3e987e.val = _0x3e987e.val.replace(/`/g, "");
        }
      }
    }
    let _0x4213f8;
    if (_0x3e0ea0 && _0x3e0ea0.id && _0x3e0ea0.id !== _0x3e987e.id) {
      _0x4213f8 = this.error("expected ID " + _0x3e0ea0.id, _0x3e987e);
    } else if (_0x3e0ea0 && _0x3e0ea0.val && _0x3e0ea0.val !== _0x3e987e.val) {
      _0x4213f8 = this.error("expected value " + _0x3e0ea0.val, _0x3e987e);
    }
    if (!_0x4213f8) {
      return _0x3e987e;
    } else if (_0x3e0ea0 && _0x3e0ea0.silent) {
      this.pos = _0x3e987e.pos;
      return undefined;
    } else {
      throw _0x4213f8;
    }
  }
  error(_0x2924aa, _0x119e63) {
    let _0x2751ee = typeof _0x119e63 != "number";
    let _0x45dd52 = _0x2751ee ? _0x119e63.pos : _0x119e63;
    let _0x12bdbc = this._str;
    let _0x4815b8 = 1;
    let _0x334a1d = 0;
    for (let _0x59c567 = 0; _0x59c567 < _0x45dd52; _0x59c567++) {
      if (_0x12bdbc.charAt(_0x59c567) === "\n") {
        _0x4815b8++;
        _0x334a1d = _0x59c567;
      }
    }
    let _0x12cb11 = _0x2751ee ? "invalid token " + utils.printJSON(_0x119e63) + ": " + _0x2924aa : _0x2924aa;
    let _0x54a216 = new Error(_0x12cb11);
    _0x54a216.token = _0x2751ee ? _0x119e63 : undefined;
    _0x54a216.lineNum = _0x4815b8;
    _0x54a216.colNum = _0x45dd52 - _0x334a1d;
    return _0x54a216;
  }
  _skip(_0x21c819) {
    let _0x5863c3 = this._str;
    let _0x4817aa = false;
    let _0x333937;
    while ((_0x333937 = _0x5863c3.charAt(this.pos)) && /\s/.test(_0x333937)) {
      this.pos++;
    }
    let _0x3eadc5 = this.pos;
    if (_0x333937 === "/") {
      switch (_0x5863c3.charAt(this.pos + 1)) {
        case "/":
          this.pos += 2;
          while ((_0x333937 = _0x5863c3.charAt(this.pos)) && _0x333937 !== "\n") {
            this.pos++;
          }
          return this._skip(_0x21c819);
        case "*":
          this.pos += 2;
          if (_0x5863c3.charAt(this.pos) === "*") {
            _0x4817aa = true;
          }
          while (_0x333937 = _0x5863c3.charAt(this.pos++)) {
            if (_0x333937 === "*" && _0x5863c3.charAt(this.pos) === "/") {
              this.pos++;
              if (_0x4817aa && _0x21c819) {
                return extractJavadoc(_0x5863c3.slice(_0x3eadc5 + 3, this.pos - 2));
              }
              return this._skip(_0x21c819);
            }
          }
          throw this.error("unterminated comment", _0x3eadc5);
      }
    }
  }
  _endOf(_0x339c08) {
    let _0x36e8d6 = this.pos;
    let _0x4266 = this._str;
    while (_0x339c08.test(_0x4266.charAt(_0x36e8d6))) {
      _0x36e8d6++;
    }
    return _0x36e8d6;
  }
  _endOfString() {
    let _0x372473 = this.pos + 1;
    let _0x9ba6d5 = this._str;
    let _0x536b60;
    while (_0x536b60 = _0x9ba6d5.charAt(_0x372473)) {
      if (_0x536b60 === "\"") {
        return _0x372473 + 1;
      }
      if (_0x536b60 === "\\") {
        _0x372473 += 2;
      } else {
        _0x372473++;
      }
    }
    throw this.error("unterminated string", _0x372473 - 1);
  }
  _endOfJson() {
    let _0x17f89f = utils.jsonEnd(this._str, this.pos);
    if (_0x17f89f < 0) {
      throw this.error("invalid JSON", _0x17f89f);
    }
    return _0x17f89f;
  }
};
function extractJavadoc(_0x226b53) {
  let _0x4160d1 = _0x226b53.replace(/^[ \t]+|[ \t]+$/g, "").split("\n").map((_0x43f95b, _0x3d2d45) => {
    if (_0x3d2d45) {
      return _0x43f95b.replace(/^\s*\*\s?/, "");
    } else {
      return _0x43f95b;
    }
  });
  while (_0x4160d1.length && !_0x4160d1[0]) {
    _0x4160d1.shift();
  }
  while (_0x4160d1.length && !_0x4160d1[_0x4160d1.length - 1]) {
    _0x4160d1.pop();
  }
  return _0x4160d1.join("\n");
}
function protocolNamespace(_0x43368c) {
  if (_0x43368c.namespace) {
    return _0x43368c.namespace;
  }
  let _0x195bb6 = /^(.*)\.[^.]+$/.exec(_0x43368c.protocol);
  if (_0x195bb6) {
    return _0x195bb6[1];
  } else {
    return undefined;
  }
}
const _0x449493 = {
  Tokenizer: Tokenizer,
  assembleProtocol: assembleProtocol,
  read: read,
  readProtocol: Reader.readProtocol,
  readSchema: Reader.readSchema
};
module.exports = _0x449493;