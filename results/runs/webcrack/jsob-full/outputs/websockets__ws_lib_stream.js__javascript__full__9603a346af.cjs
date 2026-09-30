'use strict';

var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (_0x3d3cb9, _0x3dd254) => function _0x4ef2f9() {
  if (!_0x3dd254) {
    (0, _0x3d3cb9[__getOwnPropNames(_0x3d3cb9)[0]])((_0x3dd254 = {
      exports: {}
    }).exports, _0x3dd254);
  }
  return _0x3dd254.exports;
};
var require_constants = __commonJS({
  "../work/websockets__ws/lib/constants.js"(_0x4df92c, _0x463d43) {
    'use strict';

    "use strict";
    var _0x123ba3 = ["nodebuffer", "arraybuffer", "fragments"];
    var _0x249101 = typeof Blob !== "undefined";
    if (_0x249101) {
      _0x123ba3.push("blob");
    }
    _0x463d43.exports = {
      BINARY_TYPES: _0x123ba3,
      CLOSE_TIMEOUT: 30000,
      EMPTY_BUFFER: Buffer.alloc(0),
      GUID: "258EAFA5-E914-47DA-95CA-C5AB0DC85B11",
      hasBlob: _0x249101,
      kForOnEventAttribute: Symbol("kIsForOnEventAttribute"),
      kListener: Symbol("kListener"),
      kStatusCode: Symbol("status-code"),
      kWebSocket: Symbol("websocket"),
      NOOP: () => {}
    };
  }
});
var require_buffer_util = __commonJS({
  "../work/websockets__ws/lib/buffer-util.js"(_0x55ae55, _0x537408) {
    'use strict';

    var {
      EMPTY_BUFFER: _0x3d8bdf
    } = require_constants();
    var _0xe622f9 = Buffer[Symbol.species];
    function _0x423e48(_0x51807b, _0x8e614a) {
      if (_0x51807b.length === 0) {
        return _0x3d8bdf;
      }
      if (_0x51807b.length === 1) {
        return _0x51807b[0];
      }
      const _0x57e48a = Buffer.allocUnsafe(_0x8e614a);
      let _0x275f5c = 0;
      for (let _0xf6117d = 0; _0xf6117d < _0x51807b.length; _0xf6117d++) {
        const _0x41c4a8 = _0x51807b[_0xf6117d];
        _0x57e48a.set(_0x41c4a8, _0x275f5c);
        _0x275f5c += _0x41c4a8.length;
      }
      if (_0x275f5c < _0x8e614a) {
        return new _0xe622f9(_0x57e48a.buffer, _0x57e48a.byteOffset, _0x275f5c);
      }
      return _0x57e48a;
    }
    function _0x57ad2f(_0x3238e0, _0x38e41f, _0x2400c6, _0x4947b1, _0x5676f7) {
      for (let _0x572013 = 0; _0x572013 < _0x5676f7; _0x572013++) {
        _0x2400c6[_0x4947b1 + _0x572013] = _0x3238e0[_0x572013] ^ _0x38e41f[_0x572013 & 3];
      }
    }
    function _0x307ca9(_0x572e56, _0x156c8e) {
      for (let _0xc68a9c = 0; _0xc68a9c < _0x572e56.length; _0xc68a9c++) {
        _0x572e56[_0xc68a9c] ^= _0x156c8e[_0xc68a9c & 3];
      }
    }
    function _0x1c3c3b(_0x37f043) {
      if (_0x37f043.length === _0x37f043.buffer.byteLength) {
        return _0x37f043.buffer;
      }
      return _0x37f043.buffer.slice(_0x37f043.byteOffset, _0x37f043.byteOffset + _0x37f043.length);
    }
    function _0x5d478f(_0x224aa1) {
      _0x5d478f.readOnly = true;
      if (Buffer.isBuffer(_0x224aa1)) {
        return _0x224aa1;
      }
      let _0x47d59d;
      if (_0x224aa1 instanceof ArrayBuffer) {
        _0x47d59d = new _0xe622f9(_0x224aa1);
      } else if (ArrayBuffer.isView(_0x224aa1)) {
        _0x47d59d = new _0xe622f9(_0x224aa1.buffer, _0x224aa1.byteOffset, _0x224aa1.byteLength);
      } else {
        _0x47d59d = Buffer.from(_0x224aa1);
        _0x5d478f.readOnly = false;
      }
      return _0x47d59d;
    }
    const _0x434a31 = {
      concat: _0x423e48,
      mask: _0x57ad2f,
      toArrayBuffer: _0x1c3c3b,
      toBuffer: _0x5d478f,
      unmask: _0x307ca9
    };
    _0x537408.exports = _0x434a31;
    if (!process.env.WS_NO_BUFFER_UTIL) {
      try {
        const _0x581692 = require("bufferutil");
        _0x537408.exports.mask = function (_0x10117f, _0x5d5d18, _0x31d2cf, _0x4dfc72, _0x2fb22b) {
          if (_0x2fb22b < 48) {
            _0x57ad2f(_0x10117f, _0x5d5d18, _0x31d2cf, _0x4dfc72, _0x2fb22b);
          } else {
            _0x581692.mask(_0x10117f, _0x5d5d18, _0x31d2cf, _0x4dfc72, _0x2fb22b);
          }
        };
        _0x537408.exports.unmask = function (_0x116490, _0x2d14d9) {
          if (_0x116490.length < 32) {
            _0x307ca9(_0x116490, _0x2d14d9);
          } else {
            _0x581692.unmask(_0x116490, _0x2d14d9);
          }
        };
      } catch (_0x1fa6c4) {}
    }
  }
});
var require_limiter = __commonJS({
  "../work/websockets__ws/lib/limiter.js"(_0x24914c, _0x322379) {
    'use strict';

    var _0x4f775a = Symbol("kDone");
    var _0x11861d = Symbol("kRun");
    var _0x491735 = class {
      constructor(_0x1afd86) {
        this[_0x4f775a] = () => {
          this.pending--;
          this[_0x11861d]();
        };
        this.concurrency = _0x1afd86 || Infinity;
        this.jobs = [];
        this.pending = 0;
      }
      add(_0x519b9b) {
        this.jobs.push(_0x519b9b);
        this[_0x11861d]();
      }
      [_0x11861d]() {
        if (this.pending === this.concurrency) {
          return;
        }
        if (this.jobs.length) {
          const _0x5a612f = this.jobs.shift();
          this.pending++;
          _0x5a612f(this[_0x4f775a]);
        }
      }
    };
    _0x322379.exports = _0x491735;
  }
});
var require_permessage_deflate = __commonJS({
  "../work/websockets__ws/lib/permessage-deflate.js"(_0x24e4fb, _0x4fbf14) {
    'use strict';

    var _0x3b81a9 = require("zlib");
    var _0x5494e0 = require_buffer_util();
    var _0x5bd60f = require_limiter();
    var {
      kStatusCode: _0x483e9b
    } = require_constants();
    var _0x3ebcb4 = Buffer[Symbol.species];
    var _0x333b60 = Buffer.from([0, 0, 255, 255]);
    var _0x170045 = Symbol("permessage-deflate");
    var _0x682c4 = Symbol("total-length");
    var _0x5a8c0b = Symbol("callback");
    var _0x5a8e1a = Symbol("buffers");
    var _0x1512a1 = Symbol("error");
    var _0x3d4804;
    var _0x35d8b0 = class {
      constructor(_0x4b8dd1) {
        this._options = _0x4b8dd1 || {};
        this._threshold = this._options.threshold !== undefined ? this._options.threshold : 1024;
        this._maxPayload = this._options.maxPayload | 0;
        this._isServer = !!this._options.isServer;
        this._deflate = null;
        this._inflate = null;
        this.params = null;
        if (!_0x3d4804) {
          const _0x5ac76c = this._options.concurrencyLimit !== undefined ? this._options.concurrencyLimit : 10;
          _0x3d4804 = new _0x5bd60f(_0x5ac76c);
        }
      }
      static get extensionName() {
        return "permessage-deflate";
      }
      offer() {
        const _0x5e28d4 = {};
        if (this._options.serverNoContextTakeover) {
          _0x5e28d4.server_no_context_takeover = true;
        }
        if (this._options.clientNoContextTakeover) {
          _0x5e28d4.client_no_context_takeover = true;
        }
        if (this._options.serverMaxWindowBits) {
          _0x5e28d4.server_max_window_bits = this._options.serverMaxWindowBits;
        }
        if (this._options.clientMaxWindowBits) {
          _0x5e28d4.client_max_window_bits = this._options.clientMaxWindowBits;
        } else if (this._options.clientMaxWindowBits == null) {
          _0x5e28d4.client_max_window_bits = true;
        }
        return _0x5e28d4;
      }
      accept(_0x427798) {
        _0x427798 = this.normalizeParams(_0x427798);
        this.params = this._isServer ? this.acceptAsServer(_0x427798) : this.acceptAsClient(_0x427798);
        return this.params;
      }
      cleanup() {
        if (this._inflate) {
          this._inflate.close();
          this._inflate = null;
        }
        if (this._deflate) {
          const _0xd26975 = this._deflate[_0x5a8c0b];
          this._deflate.close();
          this._deflate = null;
          if (_0xd26975) {
            _0xd26975(new Error("The deflate stream was closed while data was being processed"));
          }
        }
      }
      acceptAsServer(_0x143829) {
        const _0x44c053 = this._options;
        const _0x240926 = _0x143829.find(_0x442908 => {
          if (_0x44c053.serverNoContextTakeover === false && _0x442908.server_no_context_takeover || _0x442908.server_max_window_bits && (_0x44c053.serverMaxWindowBits === false || typeof _0x44c053.serverMaxWindowBits === "number" && _0x44c053.serverMaxWindowBits > _0x442908.server_max_window_bits) || typeof _0x44c053.clientMaxWindowBits === "number" && !_0x442908.client_max_window_bits) {
            return false;
          }
          return true;
        });
        if (!_0x240926) {
          throw new Error("None of the extension offers can be accepted");
        }
        if (_0x44c053.serverNoContextTakeover) {
          _0x240926.server_no_context_takeover = true;
        }
        if (_0x44c053.clientNoContextTakeover) {
          _0x240926.client_no_context_takeover = true;
        }
        if (typeof _0x44c053.serverMaxWindowBits === "number") {
          _0x240926.server_max_window_bits = _0x44c053.serverMaxWindowBits;
        }
        if (typeof _0x44c053.clientMaxWindowBits === "number") {
          _0x240926.client_max_window_bits = _0x44c053.clientMaxWindowBits;
        } else if (_0x240926.client_max_window_bits === true || _0x44c053.clientMaxWindowBits === false) {
          delete _0x240926.client_max_window_bits;
        }
        return _0x240926;
      }
      acceptAsClient(_0x388d3a) {
        const _0x11e641 = _0x388d3a[0];
        if (this._options.clientNoContextTakeover === false && _0x11e641.client_no_context_takeover) {
          throw new Error("Unexpected parameter \"client_no_context_takeover\"");
        }
        if (!_0x11e641.client_max_window_bits) {
          if (typeof this._options.clientMaxWindowBits === "number") {
            _0x11e641.client_max_window_bits = this._options.clientMaxWindowBits;
          }
        } else if (this._options.clientMaxWindowBits === false || typeof this._options.clientMaxWindowBits === "number" && _0x11e641.client_max_window_bits > this._options.clientMaxWindowBits) {
          throw new Error("Unexpected or invalid parameter \"client_max_window_bits\"");
        }
        return _0x11e641;
      }
      normalizeParams(_0x4137db) {
        _0x4137db.forEach(_0x33da2d => {
          Object.keys(_0x33da2d).forEach(_0xaee969 => {
            let _0x116810 = _0x33da2d[_0xaee969];
            if (_0x116810.length > 1) {
              throw new Error("Parameter \"" + _0xaee969 + "\" must have only a single value");
            }
            _0x116810 = _0x116810[0];
            if (_0xaee969 === "client_max_window_bits") {
              if (_0x116810 !== true) {
                const _0x48df6d = +_0x116810;
                if (!Number.isInteger(_0x48df6d) || _0x48df6d < 8 || _0x48df6d > 15) {
                  throw new TypeError("Invalid value for parameter \"" + _0xaee969 + "\": " + _0x116810);
                }
                _0x116810 = _0x48df6d;
              } else if (!this._isServer) {
                throw new TypeError("Invalid value for parameter \"" + _0xaee969 + "\": " + _0x116810);
              }
            } else if (_0xaee969 === "server_max_window_bits") {
              const _0x5e32b7 = +_0x116810;
              if (!Number.isInteger(_0x5e32b7) || _0x5e32b7 < 8 || _0x5e32b7 > 15) {
                throw new TypeError("Invalid value for parameter \"" + _0xaee969 + "\": " + _0x116810);
              }
              _0x116810 = _0x5e32b7;
            } else if (_0xaee969 === "client_no_context_takeover" || _0xaee969 === "server_no_context_takeover") {
              if (_0x116810 !== true) {
                throw new TypeError("Invalid value for parameter \"" + _0xaee969 + "\": " + _0x116810);
              }
            } else {
              throw new Error("Unknown parameter \"" + _0xaee969 + "\"");
            }
            _0x33da2d[_0xaee969] = _0x116810;
          });
        });
        return _0x4137db;
      }
      decompress(_0x10bc21, _0x2cb603, _0x55832e) {
        _0x3d4804.add(_0x39a30f => {
          this._decompress(_0x10bc21, _0x2cb603, (_0x108120, _0x42d194) => {
            _0x39a30f();
            _0x55832e(_0x108120, _0x42d194);
          });
        });
      }
      compress(_0x1deabb, _0x103ce3, _0x14d486) {
        _0x3d4804.add(_0xf177a3 => {
          this._compress(_0x1deabb, _0x103ce3, (_0x1e4176, _0x1fd369) => {
            _0xf177a3();
            _0x14d486(_0x1e4176, _0x1fd369);
          });
        });
      }
      _decompress(_0x189a6b, _0x395b77, _0x2b4d99) {
        const _0x1ccb3c = this._isServer ? "client" : "server";
        if (!this._inflate) {
          const _0x1cecaf = _0x1ccb3c + "_max_window_bits";
          const _0x18b683 = typeof this.params[_0x1cecaf] !== "number" ? _0x3b81a9.Z_DEFAULT_WINDOWBITS : this.params[_0x1cecaf];
          this._inflate = _0x3b81a9.createInflateRaw({
            ...this._options.zlibInflateOptions,
            windowBits: _0x18b683
          });
          this._inflate[_0x170045] = this;
          this._inflate[_0x682c4] = 0;
          this._inflate[_0x5a8e1a] = [];
          this._inflate.on("error", _0xf619fa);
          this._inflate.on("data", _0x59eba9);
        }
        this._inflate[_0x5a8c0b] = _0x2b4d99;
        this._inflate.write(_0x189a6b);
        if (_0x395b77) {
          this._inflate.write(_0x333b60);
        }
        this._inflate.flush(() => {
          const _0x759a35 = this._inflate[_0x1512a1];
          if (_0x759a35) {
            this._inflate.close();
            this._inflate = null;
            _0x2b4d99(_0x759a35);
            return;
          }
          const _0x55fee2 = _0x5494e0.concat(this._inflate[_0x5a8e1a], this._inflate[_0x682c4]);
          if (this._inflate._readableState.endEmitted) {
            this._inflate.close();
            this._inflate = null;
          } else {
            this._inflate[_0x682c4] = 0;
            this._inflate[_0x5a8e1a] = [];
            if (_0x395b77 && this.params[_0x1ccb3c + "_no_context_takeover"]) {
              this._inflate.reset();
            }
          }
          _0x2b4d99(null, _0x55fee2);
        });
      }
      _compress(_0x419c97, _0x148891, _0x3e61e5) {
        const _0x2a1915 = this._isServer ? "server" : "client";
        if (!this._deflate) {
          const _0x5bfb2d = _0x2a1915 + "_max_window_bits";
          const _0x278e21 = typeof this.params[_0x5bfb2d] !== "number" ? _0x3b81a9.Z_DEFAULT_WINDOWBITS : this.params[_0x5bfb2d];
          this._deflate = _0x3b81a9.createDeflateRaw({
            ...this._options.zlibDeflateOptions,
            windowBits: _0x278e21
          });
          this._deflate[_0x682c4] = 0;
          this._deflate[_0x5a8e1a] = [];
          this._deflate.on("data", _0x39b2c5);
        }
        this._deflate[_0x5a8c0b] = _0x3e61e5;
        this._deflate.write(_0x419c97);
        this._deflate.flush(_0x3b81a9.Z_SYNC_FLUSH, () => {
          if (!this._deflate) {
            return;
          }
          let _0x412bbb = _0x5494e0.concat(this._deflate[_0x5a8e1a], this._deflate[_0x682c4]);
          if (_0x148891) {
            _0x412bbb = new _0x3ebcb4(_0x412bbb.buffer, _0x412bbb.byteOffset, _0x412bbb.length - 4);
          }
          this._deflate[_0x5a8c0b] = null;
          this._deflate[_0x682c4] = 0;
          this._deflate[_0x5a8e1a] = [];
          if (_0x148891 && this.params[_0x2a1915 + "_no_context_takeover"]) {
            this._deflate.reset();
          }
          _0x3e61e5(null, _0x412bbb);
        });
      }
    };
    _0x4fbf14.exports = _0x35d8b0;
    function _0x39b2c5(_0x36dd07) {
      this[_0x5a8e1a].push(_0x36dd07);
      this[_0x682c4] += _0x36dd07.length;
    }
    function _0x59eba9(_0x15c559) {
      this[_0x682c4] += _0x15c559.length;
      if (this[_0x170045]._maxPayload < 1 || this[_0x682c4] <= this[_0x170045]._maxPayload) {
        this[_0x5a8e1a].push(_0x15c559);
        return;
      }
      this[_0x1512a1] = new RangeError("Max payload size exceeded");
      this[_0x1512a1].code = "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH";
      this[_0x1512a1][_0x483e9b] = 1009;
      this.removeListener("data", _0x59eba9);
      this.reset();
    }
    function _0xf619fa(_0xfb24b8) {
      this[_0x170045]._inflate = null;
      if (this[_0x1512a1]) {
        this[_0x5a8c0b](this[_0x1512a1]);
        return;
      }
      _0xfb24b8[_0x483e9b] = 1007;
      this[_0x5a8c0b](_0xfb24b8);
    }
  }
});
var require_validation = __commonJS({
  "../work/websockets__ws/lib/validation.js"(_0x56384b, _0x2df21b) {
    'use strict';

    var {
      isUtf8: _0x5daa5a
    } = require("buffer");
    var {
      hasBlob: _0x3fe5d2
    } = require_constants();
    var _0x58eaec = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0];
    function _0x4b75db(_0x54a9f9) {
      return _0x54a9f9 >= 1000 && _0x54a9f9 <= 1014 && _0x54a9f9 !== 1004 && _0x54a9f9 !== 1005 && _0x54a9f9 !== 1006 || _0x54a9f9 >= 3000 && _0x54a9f9 <= 4999;
    }
    function _0x421971(_0x379090) {
      const _0x36d297 = _0x379090.length;
      let _0x3a0e0d = 0;
      while (_0x3a0e0d < _0x36d297) {
        if ((_0x379090[_0x3a0e0d] & 128) === 0) {
          _0x3a0e0d++;
        } else if ((_0x379090[_0x3a0e0d] & 224) === 192) {
          if (_0x3a0e0d + 1 === _0x36d297 || (_0x379090[_0x3a0e0d + 1] & 192) !== 128 || (_0x379090[_0x3a0e0d] & 254) === 192) {
            return false;
          }
          _0x3a0e0d += 2;
        } else if ((_0x379090[_0x3a0e0d] & 240) === 224) {
          if (_0x3a0e0d + 2 >= _0x36d297 || (_0x379090[_0x3a0e0d + 1] & 192) !== 128 || (_0x379090[_0x3a0e0d + 2] & 192) !== 128 || _0x379090[_0x3a0e0d] === 224 && (_0x379090[_0x3a0e0d + 1] & 224) === 128 || _0x379090[_0x3a0e0d] === 237 && (_0x379090[_0x3a0e0d + 1] & 224) === 160) {
            return false;
          }
          _0x3a0e0d += 3;
        } else if ((_0x379090[_0x3a0e0d] & 248) === 240) {
          if (_0x3a0e0d + 3 >= _0x36d297 || (_0x379090[_0x3a0e0d + 1] & 192) !== 128 || (_0x379090[_0x3a0e0d + 2] & 192) !== 128 || (_0x379090[_0x3a0e0d + 3] & 192) !== 128 || _0x379090[_0x3a0e0d] === 240 && (_0x379090[_0x3a0e0d + 1] & 240) === 128 || _0x379090[_0x3a0e0d] === 244 && _0x379090[_0x3a0e0d + 1] > 143 || _0x379090[_0x3a0e0d] > 244) {
            return false;
          }
          _0x3a0e0d += 4;
        } else {
          return false;
        }
      }
      return true;
    }
    function _0xff007b(_0x436e9e) {
      return _0x3fe5d2 && typeof _0x436e9e === "object" && typeof _0x436e9e.arrayBuffer === "function" && typeof _0x436e9e.type === "string" && typeof _0x436e9e.stream === "function" && (_0x436e9e[Symbol.toStringTag] === "Blob" || _0x436e9e[Symbol.toStringTag] === "File");
    }
    const _0x26ebf7 = {
      isBlob: _0xff007b,
      isValidStatusCode: _0x4b75db,
      isValidUTF8: _0x421971,
      tokenChars: _0x58eaec
    };
    _0x2df21b.exports = _0x26ebf7;
    if (_0x5daa5a) {
      _0x2df21b.exports.isValidUTF8 = function (_0x3c2d34) {
        if (_0x3c2d34.length < 24) {
          return _0x421971(_0x3c2d34);
        } else {
          return _0x5daa5a(_0x3c2d34);
        }
      };
    } else if (!process.env.WS_NO_UTF_8_VALIDATE) {
      try {
        const _0x36e88b = require("utf-8-validate");
        _0x2df21b.exports.isValidUTF8 = function (_0x472e77) {
          if (_0x472e77.length < 32) {
            return _0x421971(_0x472e77);
          } else {
            return _0x36e88b(_0x472e77);
          }
        };
      } catch (_0x202d35) {}
    }
  }
});
var require_receiver = __commonJS({
  "../work/websockets__ws/lib/receiver.js"(_0x4ffa98, _0x3e887f) {
    'use strict';

    var {
      Writable: _0x3b80d0
    } = require("stream");
    var _0x2d069e = require_permessage_deflate();
    var {
      BINARY_TYPES: _0x307cd1,
      EMPTY_BUFFER: _0x52bcbd,
      kStatusCode: _0xa95bfd,
      kWebSocket: _0xc4f953
    } = require_constants();
    var {
      concat: _0x50bb4f,
      toArrayBuffer: _0x473c34,
      unmask: _0x5ae413
    } = require_buffer_util();
    var {
      isValidStatusCode: _0x5d56a7,
      isValidUTF8: _0x400e25
    } = require_validation();
    var _0x401d3f = Buffer[Symbol.species];
    var _0x54e467 = 0;
    var _0x1a3fc4 = 1;
    var _0x55e395 = 2;
    var _0x265f92 = 3;
    var _0x19a094 = 4;
    var _0x408a58 = 5;
    var _0xc6498c = 6;
    var _0x3668e8 = class extends _0x3b80d0 {
      constructor(_0x7f919f = {}) {
        super();
        this._allowSynchronousEvents = _0x7f919f.allowSynchronousEvents !== undefined ? _0x7f919f.allowSynchronousEvents : true;
        this._binaryType = _0x7f919f.binaryType || _0x307cd1[0];
        this._extensions = _0x7f919f.extensions || {};
        this._isServer = !!_0x7f919f.isServer;
        this._maxBufferedChunks = _0x7f919f.maxBufferedChunks | 0;
        this._maxFragments = _0x7f919f.maxFragments | 0;
        this._maxPayload = _0x7f919f.maxPayload | 0;
        this._skipUTF8Validation = !!_0x7f919f.skipUTF8Validation;
        this[_0xc4f953] = undefined;
        this._bufferedBytes = 0;
        this._buffers = [];
        this._compressed = false;
        this._payloadLength = 0;
        this._mask = undefined;
        this._fragmented = 0;
        this._masked = false;
        this._fin = false;
        this._opcode = 0;
        this._totalPayloadLength = 0;
        this._messageLength = 0;
        this._numFragments = 0;
        this._fragments = [];
        this._errored = false;
        this._loop = false;
        this._state = _0x54e467;
      }
      _write(_0x2d5594, _0x560409, _0xb71c71) {
        if (this._opcode === 8 && this._state == _0x54e467) {
          return _0xb71c71();
        }
        if (this._maxBufferedChunks > 0 && this._buffers.length >= this._maxBufferedChunks) {
          _0xb71c71(this.createError(RangeError, "Too many buffered chunks", false, 1008, "WS_ERR_TOO_MANY_BUFFERED_PARTS"));
          return;
        }
        this._bufferedBytes += _0x2d5594.length;
        this._buffers.push(_0x2d5594);
        this.startLoop(_0xb71c71);
      }
      consume(_0x3f1cb7) {
        this._bufferedBytes -= _0x3f1cb7;
        if (_0x3f1cb7 === this._buffers[0].length) {
          return this._buffers.shift();
        }
        if (_0x3f1cb7 < this._buffers[0].length) {
          const _0x1c082d = this._buffers[0];
          this._buffers[0] = new _0x401d3f(_0x1c082d.buffer, _0x1c082d.byteOffset + _0x3f1cb7, _0x1c082d.length - _0x3f1cb7);
          return new _0x401d3f(_0x1c082d.buffer, _0x1c082d.byteOffset, _0x3f1cb7);
        }
        const _0x37ebf6 = Buffer.allocUnsafe(_0x3f1cb7);
        do {
          const _0x18cfb7 = this._buffers[0];
          const _0x51e8a2 = _0x37ebf6.length - _0x3f1cb7;
          if (_0x3f1cb7 >= _0x18cfb7.length) {
            _0x37ebf6.set(this._buffers.shift(), _0x51e8a2);
          } else {
            _0x37ebf6.set(new Uint8Array(_0x18cfb7.buffer, _0x18cfb7.byteOffset, _0x3f1cb7), _0x51e8a2);
            this._buffers[0] = new _0x401d3f(_0x18cfb7.buffer, _0x18cfb7.byteOffset + _0x3f1cb7, _0x18cfb7.length - _0x3f1cb7);
          }
          _0x3f1cb7 -= _0x18cfb7.length;
        } while (_0x3f1cb7 > 0);
        return _0x37ebf6;
      }
      startLoop(_0x9035e) {
        this._loop = true;
        do {
          switch (this._state) {
            case _0x54e467:
              this.getInfo(_0x9035e);
              break;
            case _0x1a3fc4:
              this.getPayloadLength16(_0x9035e);
              break;
            case _0x55e395:
              this.getPayloadLength64(_0x9035e);
              break;
            case _0x265f92:
              this.getMask();
              break;
            case _0x19a094:
              this.getData(_0x9035e);
              break;
            case _0x408a58:
            case _0xc6498c:
              this._loop = false;
              return;
          }
        } while (this._loop);
        if (!this._errored) {
          _0x9035e();
        }
      }
      getInfo(_0x60839b) {
        if (this._bufferedBytes < 2) {
          this._loop = false;
          return;
        }
        const _0x173b20 = this.consume(2);
        if ((_0x173b20[0] & 48) !== 0) {
          const _0x4e6fdb = this.createError(RangeError, "RSV2 and RSV3 must be clear", true, 1002, "WS_ERR_UNEXPECTED_RSV_2_3");
          _0x60839b(_0x4e6fdb);
          return;
        }
        const _0x2b14f4 = (_0x173b20[0] & 64) === 64;
        if (_0x2b14f4 && !this._extensions[_0x2d069e.extensionName]) {
          const _0x640c8b = this.createError(RangeError, "RSV1 must be clear", true, 1002, "WS_ERR_UNEXPECTED_RSV_1");
          _0x60839b(_0x640c8b);
          return;
        }
        this._fin = (_0x173b20[0] & 128) === 128;
        this._opcode = _0x173b20[0] & 15;
        this._payloadLength = _0x173b20[1] & 127;
        if (this._opcode === 0) {
          if (_0x2b14f4) {
            const _0x973418 = this.createError(RangeError, "RSV1 must be clear", true, 1002, "WS_ERR_UNEXPECTED_RSV_1");
            _0x60839b(_0x973418);
            return;
          }
          if (!this._fragmented) {
            const _0x2fcc76 = this.createError(RangeError, "invalid opcode 0", true, 1002, "WS_ERR_INVALID_OPCODE");
            _0x60839b(_0x2fcc76);
            return;
          }
          this._opcode = this._fragmented;
        } else if (this._opcode === 1 || this._opcode === 2) {
          if (this._fragmented) {
            const _0x3ce558 = this.createError(RangeError, "invalid opcode " + this._opcode, true, 1002, "WS_ERR_INVALID_OPCODE");
            _0x60839b(_0x3ce558);
            return;
          }
          this._compressed = _0x2b14f4;
        } else if (this._opcode > 7 && this._opcode < 11) {
          if (!this._fin) {
            const _0xc5f5a9 = this.createError(RangeError, "FIN must be set", true, 1002, "WS_ERR_EXPECTED_FIN");
            _0x60839b(_0xc5f5a9);
            return;
          }
          if (_0x2b14f4) {
            const _0x285291 = this.createError(RangeError, "RSV1 must be clear", true, 1002, "WS_ERR_UNEXPECTED_RSV_1");
            _0x60839b(_0x285291);
            return;
          }
          if (this._payloadLength > 125 || this._opcode === 8 && this._payloadLength === 1) {
            const _0x52a2d1 = this.createError(RangeError, "invalid payload length " + this._payloadLength, true, 1002, "WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH");
            _0x60839b(_0x52a2d1);
            return;
          }
        } else {
          const _0x17d3d9 = this.createError(RangeError, "invalid opcode " + this._opcode, true, 1002, "WS_ERR_INVALID_OPCODE");
          _0x60839b(_0x17d3d9);
          return;
        }
        if (!this._fin && !this._fragmented) {
          this._fragmented = this._opcode;
        }
        this._masked = (_0x173b20[1] & 128) === 128;
        if (this._isServer) {
          if (!this._masked) {
            const _0x3cc5c5 = this.createError(RangeError, "MASK must be set", true, 1002, "WS_ERR_EXPECTED_MASK");
            _0x60839b(_0x3cc5c5);
            return;
          }
        } else if (this._masked) {
          const _0x372781 = this.createError(RangeError, "MASK must be clear", true, 1002, "WS_ERR_UNEXPECTED_MASK");
          _0x60839b(_0x372781);
          return;
        }
        if (this._payloadLength === 126) {
          this._state = _0x1a3fc4;
        } else if (this._payloadLength === 127) {
          this._state = _0x55e395;
        } else {
          this.haveLength(_0x60839b);
        }
      }
      getPayloadLength16(_0x4d234f) {
        if (this._bufferedBytes < 2) {
          this._loop = false;
          return;
        }
        this._payloadLength = this.consume(2).readUInt16BE(0);
        this.haveLength(_0x4d234f);
      }
      getPayloadLength64(_0x353d44) {
        if (this._bufferedBytes < 8) {
          this._loop = false;
          return;
        }
        const _0x1fb5f5 = this.consume(8);
        const _0x2098b4 = _0x1fb5f5.readUInt32BE(0);
        if (_0x2098b4 > Math.pow(2, 21) - 1) {
          const _0x48c252 = this.createError(RangeError, "Unsupported WebSocket frame: payload length > 2^53 - 1", false, 1009, "WS_ERR_UNSUPPORTED_DATA_PAYLOAD_LENGTH");
          _0x353d44(_0x48c252);
          return;
        }
        this._payloadLength = _0x2098b4 * Math.pow(2, 32) + _0x1fb5f5.readUInt32BE(4);
        this.haveLength(_0x353d44);
      }
      haveLength(_0x5cd7ce) {
        if (this._payloadLength && this._opcode < 8) {
          this._totalPayloadLength += this._payloadLength;
          if (this._totalPayloadLength > this._maxPayload && this._maxPayload > 0) {
            const _0x4ba04b = this.createError(RangeError, "Max payload size exceeded", false, 1009, "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH");
            _0x5cd7ce(_0x4ba04b);
            return;
          }
        }
        if (this._masked) {
          this._state = _0x265f92;
        } else {
          this._state = _0x19a094;
        }
      }
      getMask() {
        if (this._bufferedBytes < 4) {
          this._loop = false;
          return;
        }
        this._mask = this.consume(4);
        this._state = _0x19a094;
      }
      getData(_0x4ad1e8) {
        let _0x496779 = _0x52bcbd;
        if (this._payloadLength) {
          if (this._bufferedBytes < this._payloadLength) {
            this._loop = false;
            return;
          }
          _0x496779 = this.consume(this._payloadLength);
          if (this._masked && (this._mask[0] | this._mask[1] | this._mask[2] | this._mask[3]) !== 0) {
            _0x5ae413(_0x496779, this._mask);
          }
        }
        if (this._opcode > 7) {
          this.controlMessage(_0x496779, _0x4ad1e8);
          return;
        }
        if (this._maxFragments > 0 && ++this._numFragments > this._maxFragments) {
          const _0x5e8b83 = this.createError(RangeError, "Too many message fragments", false, 1008, "WS_ERR_TOO_MANY_BUFFERED_PARTS");
          _0x4ad1e8(_0x5e8b83);
          return;
        }
        if (this._compressed) {
          this._state = _0x408a58;
          this.decompress(_0x496779, _0x4ad1e8);
          return;
        }
        if (_0x496779.length) {
          this._messageLength = this._totalPayloadLength;
          this._fragments.push(_0x496779);
        }
        this.dataMessage(_0x4ad1e8);
      }
      decompress(_0x58459c, _0x4b71a3) {
        const _0x54ddd1 = this._extensions[_0x2d069e.extensionName];
        _0x54ddd1.decompress(_0x58459c, this._fin, (_0x280808, _0x526486) => {
          if (_0x280808) {
            return _0x4b71a3(_0x280808);
          }
          if (_0x526486.length) {
            this._messageLength += _0x526486.length;
            if (this._messageLength > this._maxPayload && this._maxPayload > 0) {
              const _0x4a0ae3 = this.createError(RangeError, "Max payload size exceeded", false, 1009, "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH");
              _0x4b71a3(_0x4a0ae3);
              return;
            }
            this._fragments.push(_0x526486);
          }
          this.dataMessage(_0x4b71a3);
          if (this._state === _0x54e467) {
            this.startLoop(_0x4b71a3);
          }
        });
      }
      dataMessage(_0x49560f) {
        if (!this._fin) {
          this._state = _0x54e467;
          return;
        }
        const _0x3c18cf = this._messageLength;
        const _0x17c622 = this._fragments;
        this._totalPayloadLength = 0;
        this._messageLength = 0;
        this._fragmented = 0;
        this._numFragments = 0;
        this._fragments = [];
        if (this._opcode === 2) {
          let _0x103a71;
          if (this._binaryType === "nodebuffer") {
            _0x103a71 = _0x50bb4f(_0x17c622, _0x3c18cf);
          } else if (this._binaryType === "arraybuffer") {
            _0x103a71 = _0x473c34(_0x50bb4f(_0x17c622, _0x3c18cf));
          } else if (this._binaryType === "blob") {
            _0x103a71 = new Blob(_0x17c622);
          } else {
            _0x103a71 = _0x17c622;
          }
          if (this._allowSynchronousEvents) {
            this.emit("message", _0x103a71, true);
            this._state = _0x54e467;
          } else {
            this._state = _0xc6498c;
            setImmediate(() => {
              this.emit("message", _0x103a71, true);
              this._state = _0x54e467;
              this.startLoop(_0x49560f);
            });
          }
        } else {
          const _0x24678d = _0x50bb4f(_0x17c622, _0x3c18cf);
          if (!this._skipUTF8Validation && !_0x400e25(_0x24678d)) {
            const _0x304ab0 = this.createError(Error, "invalid UTF-8 sequence", true, 1007, "WS_ERR_INVALID_UTF8");
            _0x49560f(_0x304ab0);
            return;
          }
          if (this._state === _0x408a58 || this._allowSynchronousEvents) {
            this.emit("message", _0x24678d, false);
            this._state = _0x54e467;
          } else {
            this._state = _0xc6498c;
            setImmediate(() => {
              this.emit("message", _0x24678d, false);
              this._state = _0x54e467;
              this.startLoop(_0x49560f);
            });
          }
        }
      }
      controlMessage(_0x3ec84d, _0x55c00a) {
        if (this._opcode === 8) {
          if (_0x3ec84d.length === 0) {
            this._loop = false;
            this.emit("conclude", 1005, _0x52bcbd);
            this.end();
          } else {
            const _0xb78c87 = _0x3ec84d.readUInt16BE(0);
            if (!_0x5d56a7(_0xb78c87)) {
              const _0x595d34 = this.createError(RangeError, "invalid status code " + _0xb78c87, true, 1002, "WS_ERR_INVALID_CLOSE_CODE");
              _0x55c00a(_0x595d34);
              return;
            }
            const _0x4afeb0 = new _0x401d3f(_0x3ec84d.buffer, _0x3ec84d.byteOffset + 2, _0x3ec84d.length - 2);
            if (!this._skipUTF8Validation && !_0x400e25(_0x4afeb0)) {
              const _0x12a565 = this.createError(Error, "invalid UTF-8 sequence", true, 1007, "WS_ERR_INVALID_UTF8");
              _0x55c00a(_0x12a565);
              return;
            }
            this._loop = false;
            this.emit("conclude", _0xb78c87, _0x4afeb0);
            this.end();
          }
          this._state = _0x54e467;
          return;
        }
        if (this._allowSynchronousEvents) {
          this.emit(this._opcode === 9 ? "ping" : "pong", _0x3ec84d);
          this._state = _0x54e467;
        } else {
          this._state = _0xc6498c;
          setImmediate(() => {
            this.emit(this._opcode === 9 ? "ping" : "pong", _0x3ec84d);
            this._state = _0x54e467;
            this.startLoop(_0x55c00a);
          });
        }
      }
      createError(_0x235fd6, _0x31a4c1, _0x360fbb, _0x17261e, _0x374b0a) {
        this._loop = false;
        this._errored = true;
        const _0x4c42eb = new _0x235fd6(_0x360fbb ? "Invalid WebSocket frame: " + _0x31a4c1 : _0x31a4c1);
        Error.captureStackTrace(_0x4c42eb, this.createError);
        _0x4c42eb.code = _0x374b0a;
        _0x4c42eb[_0xa95bfd] = _0x17261e;
        return _0x4c42eb;
      }
    };
    _0x3e887f.exports = _0x3668e8;
  }
});
var require_sender = __commonJS({
  "../work/websockets__ws/lib/sender.js"(_0x297ea9, _0x10abf9) {
    'use strict';

    var {
      Duplex: _0x533bb5
    } = require("stream");
    var {
      randomFillSync: _0x12e865
    } = require("crypto");
    var {
      types: {
        isUint8Array: _0x3a1eab
      }
    } = require("util");
    var _0x5b996d = require_permessage_deflate();
    var {
      EMPTY_BUFFER: _0x1ec764,
      kWebSocket: _0x5287ce,
      NOOP: _0x5535ca
    } = require_constants();
    var {
      isBlob: _0x10ea1f,
      isValidStatusCode: _0x3f26b8
    } = require_validation();
    var {
      mask: _0x95ec2f,
      toBuffer: _0x5530b9
    } = require_buffer_util();
    var _0x222475 = Symbol("kByteLength");
    var _0x59362d = Buffer.alloc(4);
    var _0x3330b3 = 8192;
    var _0x232126;
    var _0x515163 = _0x3330b3;
    var _0x274bf4 = 0;
    var _0x381bfd = 1;
    var _0xebb32b = 2;
    var _0x4350ff = class _0x2cd858 {
      constructor(_0x33ff72, _0x46a440, _0x1282a2) {
        this._extensions = _0x46a440 || {};
        if (_0x1282a2) {
          this._generateMask = _0x1282a2;
          this._maskBuffer = Buffer.alloc(4);
        }
        this._socket = _0x33ff72;
        this._firstFragment = true;
        this._compress = false;
        this._bufferedBytes = 0;
        this._queue = [];
        this._state = _0x274bf4;
        this.onerror = _0x5535ca;
        this[_0x5287ce] = undefined;
      }
      static frame(_0x5988e7, _0x599e04) {
        let _0x1a3424;
        let _0x21cd52 = false;
        let _0x4c47b9 = 2;
        let _0x5ed8aa = false;
        if (_0x599e04.mask) {
          _0x1a3424 = _0x599e04.maskBuffer || _0x59362d;
          if (_0x599e04.generateMask) {
            _0x599e04.generateMask(_0x1a3424);
          } else {
            if (_0x515163 === _0x3330b3) {
              if (_0x232126 === undefined) {
                _0x232126 = Buffer.alloc(_0x3330b3);
              }
              _0x12e865(_0x232126, 0, _0x3330b3);
              _0x515163 = 0;
            }
            _0x1a3424[0] = _0x232126[_0x515163++];
            _0x1a3424[1] = _0x232126[_0x515163++];
            _0x1a3424[2] = _0x232126[_0x515163++];
            _0x1a3424[3] = _0x232126[_0x515163++];
          }
          _0x5ed8aa = (_0x1a3424[0] | _0x1a3424[1] | _0x1a3424[2] | _0x1a3424[3]) === 0;
          _0x4c47b9 = 6;
        }
        let _0x172298;
        if (typeof _0x5988e7 === "string") {
          if ((!_0x599e04.mask || _0x5ed8aa) && _0x599e04[_0x222475] !== undefined) {
            _0x172298 = _0x599e04[_0x222475];
          } else {
            _0x5988e7 = Buffer.from(_0x5988e7);
            _0x172298 = _0x5988e7.length;
          }
        } else {
          _0x172298 = _0x5988e7.length;
          _0x21cd52 = _0x599e04.mask && _0x599e04.readOnly && !_0x5ed8aa;
        }
        let _0x389b47 = _0x172298;
        if (_0x172298 >= 65536) {
          _0x4c47b9 += 8;
          _0x389b47 = 127;
        } else if (_0x172298 > 125) {
          _0x4c47b9 += 2;
          _0x389b47 = 126;
        }
        const _0x4284cf = Buffer.allocUnsafe(_0x21cd52 ? _0x172298 + _0x4c47b9 : _0x4c47b9);
        _0x4284cf[0] = _0x599e04.fin ? _0x599e04.opcode | 128 : _0x599e04.opcode;
        if (_0x599e04.rsv1) {
          _0x4284cf[0] |= 64;
        }
        _0x4284cf[1] = _0x389b47;
        if (_0x389b47 === 126) {
          _0x4284cf.writeUInt16BE(_0x172298, 2);
        } else if (_0x389b47 === 127) {
          _0x4284cf[2] = _0x4284cf[3] = 0;
          _0x4284cf.writeUIntBE(_0x172298, 4, 6);
        }
        if (!_0x599e04.mask) {
          return [_0x4284cf, _0x5988e7];
        }
        _0x4284cf[1] |= 128;
        _0x4284cf[_0x4c47b9 - 4] = _0x1a3424[0];
        _0x4284cf[_0x4c47b9 - 3] = _0x1a3424[1];
        _0x4284cf[_0x4c47b9 - 2] = _0x1a3424[2];
        _0x4284cf[_0x4c47b9 - 1] = _0x1a3424[3];
        if (_0x5ed8aa) {
          return [_0x4284cf, _0x5988e7];
        }
        if (_0x21cd52) {
          _0x95ec2f(_0x5988e7, _0x1a3424, _0x4284cf, _0x4c47b9, _0x172298);
          return [_0x4284cf];
        }
        _0x95ec2f(_0x5988e7, _0x1a3424, _0x5988e7, 0, _0x172298);
        return [_0x4284cf, _0x5988e7];
      }
      close(_0xd9451c, _0x5c7b1c, _0x4acf2a, _0x41fddf) {
        let _0x3a9b14;
        if (_0xd9451c === undefined) {
          _0x3a9b14 = _0x1ec764;
        } else if (typeof _0xd9451c !== "number" || !_0x3f26b8(_0xd9451c)) {
          throw new TypeError("First argument must be a valid error code number");
        } else if (_0x5c7b1c === undefined || !_0x5c7b1c.length) {
          _0x3a9b14 = Buffer.allocUnsafe(2);
          _0x3a9b14.writeUInt16BE(_0xd9451c, 0);
        } else {
          const _0x21eb26 = Buffer.byteLength(_0x5c7b1c);
          if (_0x21eb26 > 123) {
            throw new RangeError("The message must not be greater than 123 bytes");
          }
          _0x3a9b14 = Buffer.allocUnsafe(2 + _0x21eb26);
          _0x3a9b14.writeUInt16BE(_0xd9451c, 0);
          if (typeof _0x5c7b1c === "string") {
            _0x3a9b14.write(_0x5c7b1c, 2);
          } else if (_0x3a1eab(_0x5c7b1c)) {
            _0x3a9b14.set(_0x5c7b1c, 2);
          } else {
            throw new TypeError("Second argument must be a string or a Uint8Array");
          }
        }
        const _0x310d9e = {
          [_0x222475]: _0x3a9b14.length,
          fin: true,
          generateMask: this._generateMask,
          mask: _0x4acf2a,
          maskBuffer: this._maskBuffer,
          opcode: 8,
          readOnly: false,
          rsv1: false
        };
        const _0x419024 = _0x310d9e;
        if (this._state !== _0x274bf4) {
          this.enqueue([this.dispatch, _0x3a9b14, false, _0x419024, _0x41fddf]);
        } else {
          this.sendFrame(_0x2cd858.frame(_0x3a9b14, _0x419024), _0x41fddf);
        }
      }
      ping(_0x4488c3, _0xdf3cf5, _0xe460e0) {
        let _0x1ec567;
        let _0x25b561;
        if (typeof _0x4488c3 === "string") {
          _0x1ec567 = Buffer.byteLength(_0x4488c3);
          _0x25b561 = false;
        } else if (_0x10ea1f(_0x4488c3)) {
          _0x1ec567 = _0x4488c3.size;
          _0x25b561 = false;
        } else {
          _0x4488c3 = _0x5530b9(_0x4488c3);
          _0x1ec567 = _0x4488c3.length;
          _0x25b561 = _0x5530b9.readOnly;
        }
        if (_0x1ec567 > 125) {
          throw new RangeError("The data size must not be greater than 125 bytes");
        }
        const _0x273d7b = {
          [_0x222475]: _0x1ec567,
          fin: true,
          generateMask: this._generateMask,
          mask: _0xdf3cf5,
          maskBuffer: this._maskBuffer,
          opcode: 9,
          readOnly: _0x25b561,
          rsv1: false
        };
        const _0x1492cd = _0x273d7b;
        if (_0x10ea1f(_0x4488c3)) {
          if (this._state !== _0x274bf4) {
            this.enqueue([this.getBlobData, _0x4488c3, false, _0x1492cd, _0xe460e0]);
          } else {
            this.getBlobData(_0x4488c3, false, _0x1492cd, _0xe460e0);
          }
        } else if (this._state !== _0x274bf4) {
          this.enqueue([this.dispatch, _0x4488c3, false, _0x1492cd, _0xe460e0]);
        } else {
          this.sendFrame(_0x2cd858.frame(_0x4488c3, _0x1492cd), _0xe460e0);
        }
      }
      pong(_0x563b60, _0x11f85e, _0x4133e6) {
        let _0x4b5f2;
        let _0x26aa58;
        if (typeof _0x563b60 === "string") {
          _0x4b5f2 = Buffer.byteLength(_0x563b60);
          _0x26aa58 = false;
        } else if (_0x10ea1f(_0x563b60)) {
          _0x4b5f2 = _0x563b60.size;
          _0x26aa58 = false;
        } else {
          _0x563b60 = _0x5530b9(_0x563b60);
          _0x4b5f2 = _0x563b60.length;
          _0x26aa58 = _0x5530b9.readOnly;
        }
        if (_0x4b5f2 > 125) {
          throw new RangeError("The data size must not be greater than 125 bytes");
        }
        const _0x2f28d0 = {
          [_0x222475]: _0x4b5f2,
          fin: true,
          generateMask: this._generateMask,
          mask: _0x11f85e,
          maskBuffer: this._maskBuffer,
          opcode: 10,
          readOnly: _0x26aa58,
          rsv1: false
        };
        const _0x424743 = _0x2f28d0;
        if (_0x10ea1f(_0x563b60)) {
          if (this._state !== _0x274bf4) {
            this.enqueue([this.getBlobData, _0x563b60, false, _0x424743, _0x4133e6]);
          } else {
            this.getBlobData(_0x563b60, false, _0x424743, _0x4133e6);
          }
        } else if (this._state !== _0x274bf4) {
          this.enqueue([this.dispatch, _0x563b60, false, _0x424743, _0x4133e6]);
        } else {
          this.sendFrame(_0x2cd858.frame(_0x563b60, _0x424743), _0x4133e6);
        }
      }
      send(_0x115da4, _0x5599b7, _0x5c0db6) {
        const _0x92647c = this._extensions[_0x5b996d.extensionName];
        let _0xe007db = _0x5599b7.binary ? 2 : 1;
        let _0xf58667 = _0x5599b7.compress;
        let _0x16c6f3;
        let _0x467408;
        if (typeof _0x115da4 === "string") {
          _0x16c6f3 = Buffer.byteLength(_0x115da4);
          _0x467408 = false;
        } else if (_0x10ea1f(_0x115da4)) {
          _0x16c6f3 = _0x115da4.size;
          _0x467408 = false;
        } else {
          _0x115da4 = _0x5530b9(_0x115da4);
          _0x16c6f3 = _0x115da4.length;
          _0x467408 = _0x5530b9.readOnly;
        }
        if (this._firstFragment) {
          this._firstFragment = false;
          if (_0xf58667 && _0x92647c && _0x92647c.params[_0x92647c._isServer ? "server_no_context_takeover" : "client_no_context_takeover"]) {
            _0xf58667 = _0x16c6f3 >= _0x92647c._threshold;
          }
          this._compress = _0xf58667;
        } else {
          _0xf58667 = false;
          _0xe007db = 0;
        }
        if (_0x5599b7.fin) {
          this._firstFragment = true;
        }
        const _0x558c6d = {
          [_0x222475]: _0x16c6f3,
          fin: _0x5599b7.fin,
          generateMask: this._generateMask,
          mask: _0x5599b7.mask,
          maskBuffer: this._maskBuffer,
          opcode: _0xe007db,
          readOnly: _0x467408,
          rsv1: _0xf58667
        };
        const _0x53d0a9 = _0x558c6d;
        if (_0x10ea1f(_0x115da4)) {
          if (this._state !== _0x274bf4) {
            this.enqueue([this.getBlobData, _0x115da4, this._compress, _0x53d0a9, _0x5c0db6]);
          } else {
            this.getBlobData(_0x115da4, this._compress, _0x53d0a9, _0x5c0db6);
          }
        } else if (this._state !== _0x274bf4) {
          this.enqueue([this.dispatch, _0x115da4, this._compress, _0x53d0a9, _0x5c0db6]);
        } else {
          this.dispatch(_0x115da4, this._compress, _0x53d0a9, _0x5c0db6);
        }
      }
      getBlobData(_0xa6d088, _0x2d0344, _0x5970b4, _0xc2564a) {
        this._bufferedBytes += _0x5970b4[_0x222475];
        this._state = _0xebb32b;
        _0xa6d088.arrayBuffer().then(_0x33b193 => {
          if (this._socket.destroyed) {
            const _0x1e4a23 = new Error("The socket was closed while the blob was being read");
            process.nextTick(_0x3073d6, this, _0x1e4a23, _0xc2564a);
            return;
          }
          this._bufferedBytes -= _0x5970b4[_0x222475];
          const _0x3d90d4 = _0x5530b9(_0x33b193);
          if (!_0x2d0344) {
            this._state = _0x274bf4;
            this.sendFrame(_0x2cd858.frame(_0x3d90d4, _0x5970b4), _0xc2564a);
            this.dequeue();
          } else {
            this.dispatch(_0x3d90d4, _0x2d0344, _0x5970b4, _0xc2564a);
          }
        }).catch(_0x5bb7e5 => {
          process.nextTick(_0x36216c, this, _0x5bb7e5, _0xc2564a);
        });
      }
      dispatch(_0x3cd9b1, _0x2b9987, _0x2dd9ae, _0x3412bb) {
        if (!_0x2b9987) {
          this.sendFrame(_0x2cd858.frame(_0x3cd9b1, _0x2dd9ae), _0x3412bb);
          return;
        }
        const _0x88507d = this._extensions[_0x5b996d.extensionName];
        this._bufferedBytes += _0x2dd9ae[_0x222475];
        this._state = _0x381bfd;
        _0x88507d.compress(_0x3cd9b1, _0x2dd9ae.fin, (_0x4a5cc6, _0x2a41b8) => {
          if (this._socket.destroyed) {
            const _0x904f4f = new Error("The socket was closed while data was being compressed");
            _0x3073d6(this, _0x904f4f, _0x3412bb);
            return;
          }
          this._bufferedBytes -= _0x2dd9ae[_0x222475];
          this._state = _0x274bf4;
          _0x2dd9ae.readOnly = false;
          this.sendFrame(_0x2cd858.frame(_0x2a41b8, _0x2dd9ae), _0x3412bb);
          this.dequeue();
        });
      }
      dequeue() {
        while (this._state === _0x274bf4 && this._queue.length) {
          const _0x56c48f = this._queue.shift();
          this._bufferedBytes -= _0x56c48f[3][_0x222475];
          Reflect.apply(_0x56c48f[0], this, _0x56c48f.slice(1));
        }
      }
      enqueue(_0x58262b) {
        this._bufferedBytes += _0x58262b[3][_0x222475];
        this._queue.push(_0x58262b);
      }
      sendFrame(_0x2cf34e, _0x370ac0) {
        if (_0x2cf34e.length === 2) {
          this._socket.cork();
          this._socket.write(_0x2cf34e[0]);
          this._socket.write(_0x2cf34e[1], _0x370ac0);
          this._socket.uncork();
        } else {
          this._socket.write(_0x2cf34e[0], _0x370ac0);
        }
      }
    };
    _0x10abf9.exports = _0x4350ff;
    function _0x3073d6(_0x432f87, _0x40f114, _0x22c88c) {
      if (typeof _0x22c88c === "function") {
        _0x22c88c(_0x40f114);
      }
      for (let _0x1027dd = 0; _0x1027dd < _0x432f87._queue.length; _0x1027dd++) {
        const _0x7c86eb = _0x432f87._queue[_0x1027dd];
        const _0x58af3e = _0x7c86eb[_0x7c86eb.length - 1];
        if (typeof _0x58af3e === "function") {
          _0x58af3e(_0x40f114);
        }
      }
    }
    function _0x36216c(_0x4dfb2c, _0x568548, _0x45b3ce) {
      _0x3073d6(_0x4dfb2c, _0x568548, _0x45b3ce);
      _0x4dfb2c.onerror(_0x568548);
    }
  }
});
var require_event_target = __commonJS({
  "../work/websockets__ws/lib/event-target.js"(_0x25b6c4, _0x23a564) {
    'use strict';

    var {
      kForOnEventAttribute: _0x58b2b3,
      kListener: _0x58641b
    } = require_constants();
    var _0x66427c = Symbol("kCode");
    var _0x1288da = Symbol("kData");
    var _0x376778 = Symbol("kError");
    var _0x370f6f = Symbol("kMessage");
    var _0x59de80 = Symbol("kReason");
    var _0x5890ab = Symbol("kTarget");
    var _0x1a5d6f = Symbol("kType");
    var _0x94f89b = Symbol("kWasClean");
    var _0x219315 = class {
      constructor(_0x2a422f) {
        this[_0x5890ab] = null;
        this[_0x1a5d6f] = _0x2a422f;
      }
      get target() {
        return this[_0x5890ab];
      }
      get type() {
        return this[_0x1a5d6f];
      }
    };
    Object.defineProperty(_0x219315.prototype, "target", {
      enumerable: true
    });
    Object.defineProperty(_0x219315.prototype, "type", {
      enumerable: true
    });
    var _0x2bb5f5 = class extends _0x219315 {
      constructor(_0x3507e1, _0xb9332a = {}) {
        super(_0x3507e1);
        this[_0x66427c] = _0xb9332a.code === undefined ? 0 : _0xb9332a.code;
        this[_0x59de80] = _0xb9332a.reason === undefined ? "" : _0xb9332a.reason;
        this[_0x94f89b] = _0xb9332a.wasClean === undefined ? false : _0xb9332a.wasClean;
      }
      get code() {
        return this[_0x66427c];
      }
      get reason() {
        return this[_0x59de80];
      }
      get wasClean() {
        return this[_0x94f89b];
      }
    };
    Object.defineProperty(_0x2bb5f5.prototype, "code", {
      enumerable: true
    });
    Object.defineProperty(_0x2bb5f5.prototype, "reason", {
      enumerable: true
    });
    Object.defineProperty(_0x2bb5f5.prototype, "wasClean", {
      enumerable: true
    });
    var _0x415073 = class extends _0x219315 {
      constructor(_0x2fe934, _0x56313d = {}) {
        super(_0x2fe934);
        this[_0x376778] = _0x56313d.error === undefined ? null : _0x56313d.error;
        this[_0x370f6f] = _0x56313d.message === undefined ? "" : _0x56313d.message;
      }
      get error() {
        return this[_0x376778];
      }
      get message() {
        return this[_0x370f6f];
      }
    };
    Object.defineProperty(_0x415073.prototype, "error", {
      enumerable: true
    });
    Object.defineProperty(_0x415073.prototype, "message", {
      enumerable: true
    });
    var _0x5922fa = class extends _0x219315 {
      constructor(_0x438dc4, _0x294add = {}) {
        super(_0x438dc4);
        this[_0x1288da] = _0x294add.data === undefined ? null : _0x294add.data;
      }
      get data() {
        return this[_0x1288da];
      }
    };
    Object.defineProperty(_0x5922fa.prototype, "data", {
      enumerable: true
    });
    var _0x3858bf = {
      addEventListener(_0x4d057e, _0x51852f, _0x767017 = {}) {
        for (const _0x43ebc0 of this.listeners(_0x4d057e)) {
          if (!_0x767017[_0x58b2b3] && _0x43ebc0[_0x58641b] === _0x51852f && !_0x43ebc0[_0x58b2b3]) {
            return;
          }
        }
        let _0x28853c;
        if (_0x4d057e === "message") {
          _0x28853c = function _0x2032a3(_0x1d4270, _0x3c9cb2) {
            const _0x1f034c = new _0x5922fa("message", {
              data: _0x3c9cb2 ? _0x1d4270 : _0x1d4270.toString()
            });
            _0x1f034c[_0x5890ab] = this;
            _0x587616(_0x51852f, this, _0x1f034c);
          };
        } else if (_0x4d057e === "close") {
          _0x28853c = function _0x43847e(_0x1d32cd, _0x372c2e) {
            const _0x227902 = new _0x2bb5f5("close", {
              code: _0x1d32cd,
              reason: _0x372c2e.toString(),
              wasClean: this._closeFrameReceived && this._closeFrameSent
            });
            _0x227902[_0x5890ab] = this;
            _0x587616(_0x51852f, this, _0x227902);
          };
        } else if (_0x4d057e === "error") {
          _0x28853c = function _0x364439(_0x54ec13) {
            const _0x5612b1 = {
              error: _0x54ec13,
              message: _0x54ec13.message
            };
            const _0x403736 = new _0x415073("error", _0x5612b1);
            _0x403736[_0x5890ab] = this;
            _0x587616(_0x51852f, this, _0x403736);
          };
        } else if (_0x4d057e === "open") {
          _0x28853c = function _0x27ed26() {
            const _0x40c189 = new _0x219315("open");
            _0x40c189[_0x5890ab] = this;
            _0x587616(_0x51852f, this, _0x40c189);
          };
        } else {
          return;
        }
        _0x28853c[_0x58b2b3] = !!_0x767017[_0x58b2b3];
        _0x28853c[_0x58641b] = _0x51852f;
        if (_0x767017.once) {
          this.once(_0x4d057e, _0x28853c);
        } else {
          this.on(_0x4d057e, _0x28853c);
        }
      },
      removeEventListener(_0x39d01c, _0x45c30f) {
        for (const _0x4fa720 of this.listeners(_0x39d01c)) {
          if (_0x4fa720[_0x58641b] === _0x45c30f && !_0x4fa720[_0x58b2b3]) {
            this.removeListener(_0x39d01c, _0x4fa720);
            break;
          }
        }
      }
    };
    const _0x3b1c61 = {
      CloseEvent: _0x2bb5f5,
      ErrorEvent: _0x415073,
      Event: _0x219315,
      EventTarget: _0x3858bf,
      MessageEvent: _0x5922fa
    };
    _0x23a564.exports = _0x3b1c61;
    function _0x587616(_0x1c91ad, _0x3f83c2, _0x3ef388) {
      if (typeof _0x1c91ad === "object" && _0x1c91ad.handleEvent) {
        _0x1c91ad.handleEvent.call(_0x1c91ad, _0x3ef388);
      } else {
        _0x1c91ad.call(_0x3f83c2, _0x3ef388);
      }
    }
  }
});
var require_extension = __commonJS({
  "../work/websockets__ws/lib/extension.js"(_0x42181c, _0x29c4fe) {
    'use strict';

    var {
      tokenChars: _0xaed8f0
    } = require_validation();
    function _0x4d0a26(_0x365304, _0x133d6a, _0x987848) {
      if (_0x365304[_0x133d6a] === undefined) {
        _0x365304[_0x133d6a] = [_0x987848];
      } else {
        _0x365304[_0x133d6a].push(_0x987848);
      }
    }
    function _0x2b6c44(_0x19f67b) {
      const _0x5ccfe1 = Object.create(null);
      let _0xf6a24b = Object.create(null);
      let _0x2f6547 = false;
      let _0x2910e2 = false;
      let _0x4702a4 = false;
      let _0x1f5a70;
      let _0x130c1c;
      let _0x19c096 = -1;
      let _0x37b492 = -1;
      let _0xd57101 = -1;
      let _0xcf3d79 = 0;
      for (; _0xcf3d79 < _0x19f67b.length; _0xcf3d79++) {
        _0x37b492 = _0x19f67b.charCodeAt(_0xcf3d79);
        if (_0x1f5a70 === undefined) {
          if (_0xd57101 === -1 && _0xaed8f0[_0x37b492] === 1) {
            if (_0x19c096 === -1) {
              _0x19c096 = _0xcf3d79;
            }
          } else if (_0xcf3d79 !== 0 && (_0x37b492 === 32 || _0x37b492 === 9)) {
            if (_0xd57101 === -1 && _0x19c096 !== -1) {
              _0xd57101 = _0xcf3d79;
            }
          } else if (_0x37b492 === 59 || _0x37b492 === 44) {
            if (_0x19c096 === -1) {
              throw new SyntaxError("Unexpected character at index " + _0xcf3d79);
            }
            if (_0xd57101 === -1) {
              _0xd57101 = _0xcf3d79;
            }
            const _0x28c20d = _0x19f67b.slice(_0x19c096, _0xd57101);
            if (_0x37b492 === 44) {
              _0x4d0a26(_0x5ccfe1, _0x28c20d, _0xf6a24b);
              _0xf6a24b = Object.create(null);
            } else {
              _0x1f5a70 = _0x28c20d;
            }
            _0x19c096 = _0xd57101 = -1;
          } else {
            throw new SyntaxError("Unexpected character at index " + _0xcf3d79);
          }
        } else if (_0x130c1c === undefined) {
          if (_0xd57101 === -1 && _0xaed8f0[_0x37b492] === 1) {
            if (_0x19c096 === -1) {
              _0x19c096 = _0xcf3d79;
            }
          } else if (_0x37b492 === 32 || _0x37b492 === 9) {
            if (_0xd57101 === -1 && _0x19c096 !== -1) {
              _0xd57101 = _0xcf3d79;
            }
          } else if (_0x37b492 === 59 || _0x37b492 === 44) {
            if (_0x19c096 === -1) {
              throw new SyntaxError("Unexpected character at index " + _0xcf3d79);
            }
            if (_0xd57101 === -1) {
              _0xd57101 = _0xcf3d79;
            }
            _0x4d0a26(_0xf6a24b, _0x19f67b.slice(_0x19c096, _0xd57101), true);
            if (_0x37b492 === 44) {
              _0x4d0a26(_0x5ccfe1, _0x1f5a70, _0xf6a24b);
              _0xf6a24b = Object.create(null);
              _0x1f5a70 = undefined;
            }
            _0x19c096 = _0xd57101 = -1;
          } else if (_0x37b492 === 61 && _0x19c096 !== -1 && _0xd57101 === -1) {
            _0x130c1c = _0x19f67b.slice(_0x19c096, _0xcf3d79);
            _0x19c096 = _0xd57101 = -1;
          } else {
            throw new SyntaxError("Unexpected character at index " + _0xcf3d79);
          }
        } else if (_0x2910e2) {
          if (_0xaed8f0[_0x37b492] !== 1) {
            throw new SyntaxError("Unexpected character at index " + _0xcf3d79);
          }
          if (_0x19c096 === -1) {
            _0x19c096 = _0xcf3d79;
          } else if (!_0x2f6547) {
            _0x2f6547 = true;
          }
          _0x2910e2 = false;
        } else if (_0x4702a4) {
          if (_0xaed8f0[_0x37b492] === 1) {
            if (_0x19c096 === -1) {
              _0x19c096 = _0xcf3d79;
            }
          } else if (_0x37b492 === 34 && _0x19c096 !== -1) {
            _0x4702a4 = false;
            _0xd57101 = _0xcf3d79;
          } else if (_0x37b492 === 92) {
            _0x2910e2 = true;
          } else {
            throw new SyntaxError("Unexpected character at index " + _0xcf3d79);
          }
        } else if (_0x37b492 === 34 && _0x19f67b.charCodeAt(_0xcf3d79 - 1) === 61) {
          _0x4702a4 = true;
        } else if (_0xd57101 === -1 && _0xaed8f0[_0x37b492] === 1) {
          if (_0x19c096 === -1) {
            _0x19c096 = _0xcf3d79;
          }
        } else if (_0x19c096 !== -1 && (_0x37b492 === 32 || _0x37b492 === 9)) {
          if (_0xd57101 === -1) {
            _0xd57101 = _0xcf3d79;
          }
        } else if (_0x37b492 === 59 || _0x37b492 === 44) {
          if (_0x19c096 === -1) {
            throw new SyntaxError("Unexpected character at index " + _0xcf3d79);
          }
          if (_0xd57101 === -1) {
            _0xd57101 = _0xcf3d79;
          }
          let _0x3fb48d = _0x19f67b.slice(_0x19c096, _0xd57101);
          if (_0x2f6547) {
            _0x3fb48d = _0x3fb48d.replace(/\\/g, "");
            _0x2f6547 = false;
          }
          _0x4d0a26(_0xf6a24b, _0x130c1c, _0x3fb48d);
          if (_0x37b492 === 44) {
            _0x4d0a26(_0x5ccfe1, _0x1f5a70, _0xf6a24b);
            _0xf6a24b = Object.create(null);
            _0x1f5a70 = undefined;
          }
          _0x130c1c = undefined;
          _0x19c096 = _0xd57101 = -1;
        } else {
          throw new SyntaxError("Unexpected character at index " + _0xcf3d79);
        }
      }
      if (_0x19c096 === -1 || _0x4702a4 || _0x37b492 === 32 || _0x37b492 === 9) {
        throw new SyntaxError("Unexpected end of input");
      }
      if (_0xd57101 === -1) {
        _0xd57101 = _0xcf3d79;
      }
      const _0x53d6c6 = _0x19f67b.slice(_0x19c096, _0xd57101);
      if (_0x1f5a70 === undefined) {
        _0x4d0a26(_0x5ccfe1, _0x53d6c6, _0xf6a24b);
      } else {
        if (_0x130c1c === undefined) {
          _0x4d0a26(_0xf6a24b, _0x53d6c6, true);
        } else if (_0x2f6547) {
          _0x4d0a26(_0xf6a24b, _0x130c1c, _0x53d6c6.replace(/\\/g, ""));
        } else {
          _0x4d0a26(_0xf6a24b, _0x130c1c, _0x53d6c6);
        }
        _0x4d0a26(_0x5ccfe1, _0x1f5a70, _0xf6a24b);
      }
      return _0x5ccfe1;
    }
    function _0x56e05c(_0x31b050) {
      return Object.keys(_0x31b050).map(_0x576323 => {
        let _0x3e15e0 = _0x31b050[_0x576323];
        if (!Array.isArray(_0x3e15e0)) {
          _0x3e15e0 = [_0x3e15e0];
        }
        return _0x3e15e0.map(_0x5d43f0 => {
          return [_0x576323].concat(Object.keys(_0x5d43f0).map(_0x411822 => {
            let _0x35946c = _0x5d43f0[_0x411822];
            if (!Array.isArray(_0x35946c)) {
              _0x35946c = [_0x35946c];
            }
            return _0x35946c.map(_0x1fde32 => _0x1fde32 === true ? _0x411822 : _0x411822 + "=" + _0x1fde32).join("; ");
          })).join("; ");
        }).join(", ");
      }).join(", ");
    }
    const _0xad69bb = {
      format: _0x56e05c,
      parse: _0x2b6c44
    };
    _0x29c4fe.exports = _0xad69bb;
  }
});
var require_websocket = __commonJS({
  "../work/websockets__ws/lib/websocket.js"(_0x53cdb7, _0x3bc5d7) {
    'use strict';

    var _0x10660c = require("events");
    var _0x1d5e39 = require("https");
    var _0x211d03 = require("http");
    var _0x185c84 = require("net");
    var _0x5844b5 = require("tls");
    var {
      randomBytes: _0xa8e613,
      createHash: _0x13790d
    } = require("crypto");
    var {
      Duplex: _0x421308,
      Readable: _0x41848c
    } = require("stream");
    var {
      URL: _0x3c0bce
    } = require("url");
    var _0x15c390 = require_permessage_deflate();
    var _0x27fdd3 = require_receiver();
    var _0x53a5c6 = require_sender();
    var {
      isBlob: _0x3b4170
    } = require_validation();
    var {
      BINARY_TYPES: _0x5be87e,
      CLOSE_TIMEOUT: _0x513ecc,
      EMPTY_BUFFER: _0xb71be,
      GUID: _0x333be9,
      kForOnEventAttribute: _0x1f05e2,
      kListener: _0x329740,
      kStatusCode: _0x4ea71b,
      kWebSocket: _0x3c6704,
      NOOP: _0x429afc
    } = require_constants();
    var {
      EventTarget: {
        addEventListener: _0x164652,
        removeEventListener: _0x5619bf
      }
    } = require_event_target();
    var {
      format: _0x51d4fd,
      parse: _0x9b2391
    } = require_extension();
    var {
      toBuffer: _0x5d43b0
    } = require_buffer_util();
    var _0x4c7132 = Symbol("kAborted");
    var _0x53515c = [8, 13];
    var _0x13dacf = ["CONNECTING", "OPEN", "CLOSING", "CLOSED"];
    var _0x12ee15 = /^[!#$%&'*+\-.0-9A-Z^_`|a-z~]+$/;
    var _0x12f403 = class _0x1b603e extends _0x10660c {
      constructor(_0x7e5fc4, _0x3ab398, _0x1828b8) {
        super();
        this._binaryType = _0x5be87e[0];
        this._closeCode = 1006;
        this._closeFrameReceived = false;
        this._closeFrameSent = false;
        this._closeMessage = _0xb71be;
        this._closeTimer = null;
        this._errorEmitted = false;
        this._extensions = {};
        this._paused = false;
        this._protocol = "";
        this._readyState = _0x1b603e.CONNECTING;
        this._receiver = null;
        this._sender = null;
        this._socket = null;
        if (_0x7e5fc4 !== null) {
          this._bufferedAmount = 0;
          this._isServer = false;
          this._redirects = 0;
          if (_0x3ab398 === undefined) {
            _0x3ab398 = [];
          } else if (!Array.isArray(_0x3ab398)) {
            if (typeof _0x3ab398 === "object" && _0x3ab398 !== null) {
              _0x1828b8 = _0x3ab398;
              _0x3ab398 = [];
            } else {
              _0x3ab398 = [_0x3ab398];
            }
          }
          _0x5c2702(this, _0x7e5fc4, _0x3ab398, _0x1828b8);
        } else {
          this._autoPong = _0x1828b8.autoPong;
          this._closeTimeout = _0x1828b8.closeTimeout;
          this._isServer = true;
        }
      }
      get binaryType() {
        return this._binaryType;
      }
      set binaryType(_0x1e956d) {
        if (!_0x5be87e.includes(_0x1e956d)) {
          return;
        }
        this._binaryType = _0x1e956d;
        if (this._receiver) {
          this._receiver._binaryType = _0x1e956d;
        }
      }
      get bufferedAmount() {
        if (!this._socket) {
          return this._bufferedAmount;
        }
        return this._socket._writableState.length + this._sender._bufferedBytes;
      }
      get extensions() {
        return Object.keys(this._extensions).join();
      }
      get isPaused() {
        return this._paused;
      }
      get onclose() {
        return null;
      }
      get onerror() {
        return null;
      }
      get onopen() {
        return null;
      }
      get onmessage() {
        return null;
      }
      get protocol() {
        return this._protocol;
      }
      get readyState() {
        return this._readyState;
      }
      get url() {
        return this._url;
      }
      setSocket(_0x3b4756, _0x50660e, _0x589f99) {
        const _0xe29d35 = {
          allowSynchronousEvents: _0x589f99.allowSynchronousEvents,
          binaryType: this.binaryType,
          extensions: this._extensions,
          isServer: this._isServer,
          maxBufferedChunks: _0x589f99.maxBufferedChunks,
          maxFragments: _0x589f99.maxFragments,
          maxPayload: _0x589f99.maxPayload,
          skipUTF8Validation: _0x589f99.skipUTF8Validation
        };
        const _0x5c7fc4 = new _0x27fdd3(_0xe29d35);
        const _0xc243d4 = new _0x53a5c6(_0x3b4756, this._extensions, _0x589f99.generateMask);
        this._receiver = _0x5c7fc4;
        this._sender = _0xc243d4;
        this._socket = _0x3b4756;
        _0x5c7fc4[_0x3c6704] = this;
        _0xc243d4[_0x3c6704] = this;
        _0x3b4756[_0x3c6704] = this;
        _0x5c7fc4.on("conclude", _0x2ffb59);
        _0x5c7fc4.on("drain", _0x2970f7);
        _0x5c7fc4.on("error", _0x26e808);
        _0x5c7fc4.on("message", _0x27d394);
        _0x5c7fc4.on("ping", _0x2a1c78);
        _0x5c7fc4.on("pong", _0x4738e8);
        _0xc243d4.onerror = _0x3c2053;
        if (_0x3b4756.setTimeout) {
          _0x3b4756.setTimeout(0);
        }
        if (_0x3b4756.setNoDelay) {
          _0x3b4756.setNoDelay();
        }
        if (_0x50660e.length > 0) {
          _0x3b4756.unshift(_0x50660e);
        }
        _0x3b4756.on("close", _0x5d681c);
        _0x3b4756.on("data", _0xfdf314);
        _0x3b4756.on("end", _0x33f531);
        _0x3b4756.on("error", _0x1627aa);
        this._readyState = _0x1b603e.OPEN;
        this.emit("open");
      }
      emitClose() {
        if (!this._socket) {
          this._readyState = _0x1b603e.CLOSED;
          this.emit("close", this._closeCode, this._closeMessage);
          return;
        }
        if (this._extensions[_0x15c390.extensionName]) {
          this._extensions[_0x15c390.extensionName].cleanup();
        }
        this._receiver.removeAllListeners();
        this._readyState = _0x1b603e.CLOSED;
        this.emit("close", this._closeCode, this._closeMessage);
      }
      close(_0x38dca8, _0x4a9628) {
        if (this.readyState === _0x1b603e.CLOSED) {
          return;
        }
        if (this.readyState === _0x1b603e.CONNECTING) {
          const _0x40c0f0 = "WebSocket was closed before the connection was established";
          _0x4093e2(this, this._req, _0x40c0f0);
          return;
        }
        if (this.readyState === _0x1b603e.CLOSING) {
          if (this._closeFrameSent && (this._closeFrameReceived || this._receiver._writableState.errorEmitted)) {
            this._socket.end();
          }
          return;
        }
        this._readyState = _0x1b603e.CLOSING;
        this._sender.close(_0x38dca8, _0x4a9628, !this._isServer, _0x2b237e => {
          if (_0x2b237e) {
            return;
          }
          this._closeFrameSent = true;
          if (this._closeFrameReceived || this._receiver._writableState.errorEmitted) {
            this._socket.end();
          }
        });
        _0x2a8815(this);
      }
      pause() {
        if (this.readyState === _0x1b603e.CONNECTING || this.readyState === _0x1b603e.CLOSED) {
          return;
        }
        this._paused = true;
        this._socket.pause();
      }
      ping(_0x1efe9f, _0x401a29, _0x1abd6c) {
        if (this.readyState === _0x1b603e.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof _0x1efe9f === "function") {
          _0x1abd6c = _0x1efe9f;
          _0x1efe9f = _0x401a29 = undefined;
        } else if (typeof _0x401a29 === "function") {
          _0x1abd6c = _0x401a29;
          _0x401a29 = undefined;
        }
        if (typeof _0x1efe9f === "number") {
          _0x1efe9f = _0x1efe9f.toString();
        }
        if (this.readyState !== _0x1b603e.OPEN) {
          _0x257b07(this, _0x1efe9f, _0x1abd6c);
          return;
        }
        if (_0x401a29 === undefined) {
          _0x401a29 = !this._isServer;
        }
        this._sender.ping(_0x1efe9f || _0xb71be, _0x401a29, _0x1abd6c);
      }
      pong(_0x4a1686, _0xdabf5a, _0x1fdaea) {
        if (this.readyState === _0x1b603e.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof _0x4a1686 === "function") {
          _0x1fdaea = _0x4a1686;
          _0x4a1686 = _0xdabf5a = undefined;
        } else if (typeof _0xdabf5a === "function") {
          _0x1fdaea = _0xdabf5a;
          _0xdabf5a = undefined;
        }
        if (typeof _0x4a1686 === "number") {
          _0x4a1686 = _0x4a1686.toString();
        }
        if (this.readyState !== _0x1b603e.OPEN) {
          _0x257b07(this, _0x4a1686, _0x1fdaea);
          return;
        }
        if (_0xdabf5a === undefined) {
          _0xdabf5a = !this._isServer;
        }
        this._sender.pong(_0x4a1686 || _0xb71be, _0xdabf5a, _0x1fdaea);
      }
      resume() {
        if (this.readyState === _0x1b603e.CONNECTING || this.readyState === _0x1b603e.CLOSED) {
          return;
        }
        this._paused = false;
        if (!this._receiver._writableState.needDrain) {
          this._socket.resume();
        }
      }
      send(_0x474a8f, _0x2a5231, _0x4d9d45) {
        if (this.readyState === _0x1b603e.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof _0x2a5231 === "function") {
          _0x4d9d45 = _0x2a5231;
          _0x2a5231 = {};
        }
        if (typeof _0x474a8f === "number") {
          _0x474a8f = _0x474a8f.toString();
        }
        if (this.readyState !== _0x1b603e.OPEN) {
          _0x257b07(this, _0x474a8f, _0x4d9d45);
          return;
        }
        const _0x40eef5 = {
          binary: typeof _0x474a8f !== "string",
          mask: !this._isServer,
          compress: true,
          fin: true,
          ..._0x2a5231
        };
        if (!this._extensions[_0x15c390.extensionName]) {
          _0x40eef5.compress = false;
        }
        this._sender.send(_0x474a8f || _0xb71be, _0x40eef5, _0x4d9d45);
      }
      terminate() {
        if (this.readyState === _0x1b603e.CLOSED) {
          return;
        }
        if (this.readyState === _0x1b603e.CONNECTING) {
          const _0x2bceb6 = "WebSocket was closed before the connection was established";
          _0x4093e2(this, this._req, _0x2bceb6);
          return;
        }
        if (this._socket) {
          this._readyState = _0x1b603e.CLOSING;
          this._socket.destroy();
        }
      }
    };
    Object.defineProperty(_0x12f403, "CONNECTING", {
      enumerable: true,
      value: _0x13dacf.indexOf("CONNECTING")
    });
    Object.defineProperty(_0x12f403.prototype, "CONNECTING", {
      enumerable: true,
      value: _0x13dacf.indexOf("CONNECTING")
    });
    Object.defineProperty(_0x12f403, "OPEN", {
      enumerable: true,
      value: _0x13dacf.indexOf("OPEN")
    });
    Object.defineProperty(_0x12f403.prototype, "OPEN", {
      enumerable: true,
      value: _0x13dacf.indexOf("OPEN")
    });
    Object.defineProperty(_0x12f403, "CLOSING", {
      enumerable: true,
      value: _0x13dacf.indexOf("CLOSING")
    });
    Object.defineProperty(_0x12f403.prototype, "CLOSING", {
      enumerable: true,
      value: _0x13dacf.indexOf("CLOSING")
    });
    Object.defineProperty(_0x12f403, "CLOSED", {
      enumerable: true,
      value: _0x13dacf.indexOf("CLOSED")
    });
    Object.defineProperty(_0x12f403.prototype, "CLOSED", {
      enumerable: true,
      value: _0x13dacf.indexOf("CLOSED")
    });
    ["binaryType", "bufferedAmount", "extensions", "isPaused", "protocol", "readyState", "url"].forEach(_0x4c80f7 => {
      Object.defineProperty(_0x12f403.prototype, _0x4c80f7, {
        enumerable: true
      });
    });
    ["open", "error", "close", "message"].forEach(_0x5c04a7 => {
      Object.defineProperty(_0x12f403.prototype, "on" + _0x5c04a7, {
        enumerable: true,
        get() {
          for (const _0x878c2b of this.listeners(_0x5c04a7)) {
            if (_0x878c2b[_0x1f05e2]) {
              return _0x878c2b[_0x329740];
            }
          }
          return null;
        },
        set(_0x18c333) {
          for (const _0x3d7b7a of this.listeners(_0x5c04a7)) {
            if (_0x3d7b7a[_0x1f05e2]) {
              this.removeListener(_0x5c04a7, _0x3d7b7a);
              break;
            }
          }
          if (typeof _0x18c333 !== "function") {
            return;
          }
          const _0x40f588 = {
            [_0x1f05e2]: true
          };
          this.addEventListener(_0x5c04a7, _0x18c333, _0x40f588);
        }
      });
    });
    _0x12f403.prototype.addEventListener = _0x164652;
    _0x12f403.prototype.removeEventListener = _0x5619bf;
    _0x3bc5d7.exports = _0x12f403;
    function _0x5c2702(_0x40b8d1, _0x4befcb, _0x3fd6f8, _0x1ff346) {
      const _0x44918a = {
        allowSynchronousEvents: true,
        autoPong: true,
        closeTimeout: _0x513ecc,
        protocolVersion: _0x53515c[1],
        maxBufferedChunks: 262144,
        maxFragments: 16384,
        maxPayload: 104857600,
        skipUTF8Validation: false,
        perMessageDeflate: true,
        followRedirects: false,
        maxRedirects: 10,
        ..._0x1ff346,
        socketPath: undefined,
        hostname: undefined,
        protocol: undefined,
        timeout: undefined,
        method: "GET",
        host: undefined,
        path: undefined,
        port: undefined
      };
      _0x40b8d1._autoPong = _0x44918a.autoPong;
      _0x40b8d1._closeTimeout = _0x44918a.closeTimeout;
      if (!_0x53515c.includes(_0x44918a.protocolVersion)) {
        throw new RangeError("Unsupported protocol version: " + _0x44918a.protocolVersion + " (supported versions: " + _0x53515c.join(", ") + ")");
      }
      let _0xd1696f;
      if (_0x4befcb instanceof _0x3c0bce) {
        _0xd1696f = _0x4befcb;
      } else {
        try {
          _0xd1696f = new _0x3c0bce(_0x4befcb);
        } catch {
          throw new SyntaxError("Invalid URL: " + _0x4befcb);
        }
      }
      if (_0xd1696f.protocol === "http:") {
        _0xd1696f.protocol = "ws:";
      } else if (_0xd1696f.protocol === "https:") {
        _0xd1696f.protocol = "wss:";
      }
      _0x40b8d1._url = _0xd1696f.href;
      const _0x1b0b39 = _0xd1696f.protocol === "wss:";
      const _0xeeea33 = _0xd1696f.protocol === "ws+unix:";
      let _0x568ba2;
      if (_0xd1696f.protocol !== "ws:" && !_0x1b0b39 && !_0xeeea33) {
        _0x568ba2 = "The URL's protocol must be one of \"ws:\", \"wss:\", \"http:\", \"https:\", or \"ws+unix:\"";
      } else if (_0xeeea33 && !_0xd1696f.pathname) {
        _0x568ba2 = "The URL's pathname is empty";
      } else if (_0xd1696f.hash) {
        _0x568ba2 = "The URL contains a fragment identifier";
      }
      if (_0x568ba2) {
        const _0x596a68 = new SyntaxError(_0x568ba2);
        if (_0x40b8d1._redirects === 0) {
          throw _0x596a68;
        } else {
          _0x511ebf(_0x40b8d1, _0x596a68);
          return;
        }
      }
      const _0x5219df = _0x1b0b39 ? 443 : 80;
      const _0x42d51e = _0xa8e613(16).toString("base64");
      const _0x318828 = _0x1b0b39 ? _0x1d5e39.request : _0x211d03.request;
      const _0x5e68f7 = new Set();
      let _0x4f874e;
      _0x44918a.createConnection = _0x44918a.createConnection || (_0x1b0b39 ? _0x5c4ebf : _0x40480f);
      _0x44918a.defaultPort = _0x44918a.defaultPort || _0x5219df;
      _0x44918a.port = _0xd1696f.port || _0x5219df;
      _0x44918a.host = _0xd1696f.hostname.startsWith("[") ? _0xd1696f.hostname.slice(1, -1) : _0xd1696f.hostname;
      _0x44918a.headers = {
        ..._0x44918a.headers,
        "Sec-WebSocket-Version": _0x44918a.protocolVersion,
        "Sec-WebSocket-Key": _0x42d51e,
        Connection: "Upgrade",
        Upgrade: "websocket"
      };
      _0x44918a.path = _0xd1696f.pathname + _0xd1696f.search;
      _0x44918a.timeout = _0x44918a.handshakeTimeout;
      if (_0x44918a.perMessageDeflate) {
        const _0x2141d3 = {
          ..._0x44918a.perMessageDeflate
        };
        _0x2141d3.isServer = false;
        _0x2141d3.maxPayload = _0x44918a.maxPayload;
        _0x4f874e = new _0x15c390(_0x2141d3);
        _0x44918a.headers["Sec-WebSocket-Extensions"] = _0x51d4fd({
          [_0x15c390.extensionName]: _0x4f874e.offer()
        });
      }
      if (_0x3fd6f8.length) {
        for (const _0x418c79 of _0x3fd6f8) {
          if (typeof _0x418c79 !== "string" || !_0x12ee15.test(_0x418c79) || _0x5e68f7.has(_0x418c79)) {
            throw new SyntaxError("An invalid or duplicated subprotocol was specified");
          }
          _0x5e68f7.add(_0x418c79);
        }
        _0x44918a.headers["Sec-WebSocket-Protocol"] = _0x3fd6f8.join(",");
      }
      if (_0x44918a.origin) {
        if (_0x44918a.protocolVersion < 13) {
          _0x44918a.headers["Sec-WebSocket-Origin"] = _0x44918a.origin;
        } else {
          _0x44918a.headers.Origin = _0x44918a.origin;
        }
      }
      if (_0xd1696f.username || _0xd1696f.password) {
        _0x44918a.auth = _0xd1696f.username + ":" + _0xd1696f.password;
      }
      if (_0xeeea33) {
        const _0xd83b3 = _0x44918a.path.split(":");
        _0x44918a.socketPath = _0xd83b3[0];
        _0x44918a.path = _0xd83b3[1];
      }
      let _0x44e4b0;
      if (_0x44918a.followRedirects) {
        if (_0x40b8d1._redirects === 0) {
          _0x40b8d1._originalIpc = _0xeeea33;
          _0x40b8d1._originalSecure = _0x1b0b39;
          _0x40b8d1._originalHostOrSocketPath = _0xeeea33 ? _0x44918a.socketPath : _0xd1696f.host;
          const _0xe3abb5 = _0x1ff346 && _0x1ff346.headers;
          _0x1ff346 = {
            ..._0x1ff346,
            headers: {}
          };
          if (_0xe3abb5) {
            for (const [_0x1ddfc9, _0x3c9d72] of Object.entries(_0xe3abb5)) {
              _0x1ff346.headers[_0x1ddfc9.toLowerCase()] = _0x3c9d72;
            }
          }
        } else if (_0x40b8d1.listenerCount("redirect") === 0) {
          const _0x4de77d = _0xeeea33 ? _0x40b8d1._originalIpc ? _0x44918a.socketPath === _0x40b8d1._originalHostOrSocketPath : false : _0x40b8d1._originalIpc ? false : _0xd1696f.host === _0x40b8d1._originalHostOrSocketPath;
          if (!_0x4de77d || _0x40b8d1._originalSecure && !_0x1b0b39) {
            delete _0x44918a.headers.authorization;
            delete _0x44918a.headers.cookie;
            if (!_0x4de77d) {
              delete _0x44918a.headers.host;
            }
            _0x44918a.auth = undefined;
          }
        }
        if (_0x44918a.auth && !_0x1ff346.headers.authorization) {
          _0x1ff346.headers.authorization = "Basic " + Buffer.from(_0x44918a.auth).toString("base64");
        }
        _0x44e4b0 = _0x40b8d1._req = _0x318828(_0x44918a);
        if (_0x40b8d1._redirects) {
          _0x40b8d1.emit("redirect", _0x40b8d1.url, _0x44e4b0);
        }
      } else {
        _0x44e4b0 = _0x40b8d1._req = _0x318828(_0x44918a);
      }
      if (_0x44918a.timeout) {
        _0x44e4b0.on("timeout", () => {
          _0x4093e2(_0x40b8d1, _0x44e4b0, "Opening handshake has timed out");
        });
      }
      _0x44e4b0.on("error", _0x1dc1a8 => {
        if (_0x44e4b0 === null || _0x44e4b0[_0x4c7132]) {
          return;
        }
        _0x44e4b0 = _0x40b8d1._req = null;
        _0x511ebf(_0x40b8d1, _0x1dc1a8);
      });
      _0x44e4b0.on("response", _0x59cd97 => {
        const _0x70ebdf = _0x59cd97.headers.location;
        const _0x2593fd = _0x59cd97.statusCode;
        if (_0x70ebdf && _0x44918a.followRedirects && _0x2593fd >= 300 && _0x2593fd < 400) {
          if (++_0x40b8d1._redirects > _0x44918a.maxRedirects) {
            _0x4093e2(_0x40b8d1, _0x44e4b0, "Maximum redirects exceeded");
            return;
          }
          _0x44e4b0.abort();
          let _0x32193b;
          try {
            _0x32193b = new _0x3c0bce(_0x70ebdf, _0x4befcb);
          } catch (_0x5282e9) {
            const _0x5ba53c = new SyntaxError("Invalid URL: " + _0x70ebdf);
            _0x511ebf(_0x40b8d1, _0x5ba53c);
            return;
          }
          _0x5c2702(_0x40b8d1, _0x32193b, _0x3fd6f8, _0x1ff346);
        } else if (!_0x40b8d1.emit("unexpected-response", _0x44e4b0, _0x59cd97)) {
          _0x4093e2(_0x40b8d1, _0x44e4b0, "Unexpected server response: " + _0x59cd97.statusCode);
        }
      });
      _0x44e4b0.on("upgrade", (_0x23aaab, _0x217e97, _0x2f1382) => {
        _0x40b8d1.emit("upgrade", _0x23aaab);
        if (_0x40b8d1.readyState !== _0x12f403.CONNECTING) {
          return;
        }
        _0x44e4b0 = _0x40b8d1._req = null;
        const _0x51835c = _0x23aaab.headers.upgrade;
        if (_0x51835c === undefined || _0x51835c.toLowerCase() !== "websocket") {
          _0x4093e2(_0x40b8d1, _0x217e97, "Invalid Upgrade header");
          return;
        }
        const _0x25f747 = _0x13790d("sha1").update(_0x42d51e + _0x333be9).digest("base64");
        if (_0x23aaab.headers["sec-websocket-accept"] !== _0x25f747) {
          _0x4093e2(_0x40b8d1, _0x217e97, "Invalid Sec-WebSocket-Accept header");
          return;
        }
        const _0xd4f696 = _0x23aaab.headers["sec-websocket-protocol"];
        let _0x98a5f2;
        if (_0xd4f696 !== undefined) {
          if (!_0x5e68f7.size) {
            _0x98a5f2 = "Server sent a subprotocol but none was requested";
          } else if (!_0x5e68f7.has(_0xd4f696)) {
            _0x98a5f2 = "Server sent an invalid subprotocol";
          }
        } else if (_0x5e68f7.size) {
          _0x98a5f2 = "Server sent no subprotocol";
        }
        if (_0x98a5f2) {
          _0x4093e2(_0x40b8d1, _0x217e97, _0x98a5f2);
          return;
        }
        if (_0xd4f696) {
          _0x40b8d1._protocol = _0xd4f696;
        }
        const _0x19692a = _0x23aaab.headers["sec-websocket-extensions"];
        if (_0x19692a !== undefined) {
          if (!_0x4f874e) {
            const _0x1c3965 = "Server sent a Sec-WebSocket-Extensions header but no extension was requested";
            _0x4093e2(_0x40b8d1, _0x217e97, _0x1c3965);
            return;
          }
          let _0x4d7302;
          try {
            _0x4d7302 = _0x9b2391(_0x19692a);
          } catch (_0x492128) {
            const _0x3eb685 = "Invalid Sec-WebSocket-Extensions header";
            _0x4093e2(_0x40b8d1, _0x217e97, _0x3eb685);
            return;
          }
          const _0x476d70 = Object.keys(_0x4d7302);
          if (_0x476d70.length !== 1 || _0x476d70[0] !== _0x15c390.extensionName) {
            const _0x8006e8 = "Server indicated an extension that was not requested";
            _0x4093e2(_0x40b8d1, _0x217e97, _0x8006e8);
            return;
          }
          try {
            _0x4f874e.accept(_0x4d7302[_0x15c390.extensionName]);
          } catch (_0x4a7cb9) {
            const _0x55db14 = "Invalid Sec-WebSocket-Extensions header";
            _0x4093e2(_0x40b8d1, _0x217e97, _0x55db14);
            return;
          }
          _0x40b8d1._extensions[_0x15c390.extensionName] = _0x4f874e;
        }
        const _0x5a8336 = {
          allowSynchronousEvents: _0x44918a.allowSynchronousEvents,
          generateMask: _0x44918a.generateMask,
          maxBufferedChunks: _0x44918a.maxBufferedChunks,
          maxFragments: _0x44918a.maxFragments,
          maxPayload: _0x44918a.maxPayload,
          skipUTF8Validation: _0x44918a.skipUTF8Validation
        };
        _0x40b8d1.setSocket(_0x217e97, _0x2f1382, _0x5a8336);
      });
      if (_0x44918a.finishRequest) {
        _0x44918a.finishRequest(_0x44e4b0, _0x40b8d1);
      } else {
        _0x44e4b0.end();
      }
    }
    function _0x511ebf(_0x5c7be3, _0x1493bd) {
      _0x5c7be3._readyState = _0x12f403.CLOSING;
      _0x5c7be3._errorEmitted = true;
      _0x5c7be3.emit("error", _0x1493bd);
      _0x5c7be3.emitClose();
    }
    function _0x40480f(_0x5e7ca6) {
      _0x5e7ca6.path = _0x5e7ca6.socketPath;
      return _0x185c84.connect(_0x5e7ca6);
    }
    function _0x5c4ebf(_0x16d1c8) {
      _0x16d1c8.path = undefined;
      if (!_0x16d1c8.servername && _0x16d1c8.servername !== "") {
        _0x16d1c8.servername = _0x185c84.isIP(_0x16d1c8.host) ? "" : _0x16d1c8.host;
      }
      return _0x5844b5.connect(_0x16d1c8);
    }
    function _0x4093e2(_0x1b0acf, _0xfaa096, _0x333e51) {
      _0x1b0acf._readyState = _0x12f403.CLOSING;
      const _0x41cbb6 = new Error(_0x333e51);
      Error.captureStackTrace(_0x41cbb6, _0x4093e2);
      if (_0xfaa096.setHeader) {
        _0xfaa096[_0x4c7132] = true;
        _0xfaa096.abort();
        if (_0xfaa096.socket && !_0xfaa096.socket.destroyed) {
          _0xfaa096.socket.destroy();
        }
        process.nextTick(_0x511ebf, _0x1b0acf, _0x41cbb6);
      } else {
        _0xfaa096.destroy(_0x41cbb6);
        _0xfaa096.once("error", _0x1b0acf.emit.bind(_0x1b0acf, "error"));
        _0xfaa096.once("close", _0x1b0acf.emitClose.bind(_0x1b0acf));
      }
    }
    function _0x257b07(_0x4f77c3, _0x2b32b1, _0x377027) {
      if (_0x2b32b1) {
        const _0xff0c85 = _0x3b4170(_0x2b32b1) ? _0x2b32b1.size : _0x5d43b0(_0x2b32b1).length;
        if (_0x4f77c3._socket) {
          _0x4f77c3._sender._bufferedBytes += _0xff0c85;
        } else {
          _0x4f77c3._bufferedAmount += _0xff0c85;
        }
      }
      if (_0x377027) {
        const _0x326c61 = new Error("WebSocket is not open: readyState " + _0x4f77c3.readyState + " (" + _0x13dacf[_0x4f77c3.readyState] + ")");
        process.nextTick(_0x377027, _0x326c61);
      }
    }
    function _0x2ffb59(_0x433de3, _0x5e38a2) {
      const _0x30e08b = this[_0x3c6704];
      _0x30e08b._closeFrameReceived = true;
      _0x30e08b._closeMessage = _0x5e38a2;
      _0x30e08b._closeCode = _0x433de3;
      if (_0x30e08b._socket[_0x3c6704] === undefined) {
        return;
      }
      _0x30e08b._socket.removeListener("data", _0xfdf314);
      process.nextTick(_0x2c96ca, _0x30e08b._socket);
      if (_0x433de3 === 1005) {
        _0x30e08b.close();
      } else {
        _0x30e08b.close(_0x433de3, _0x5e38a2);
      }
    }
    function _0x2970f7() {
      const _0x436fa8 = this[_0x3c6704];
      if (!_0x436fa8.isPaused) {
        _0x436fa8._socket.resume();
      }
    }
    function _0x26e808(_0x53e3ab) {
      const _0x4a0a99 = this[_0x3c6704];
      if (_0x4a0a99._socket[_0x3c6704] !== undefined) {
        _0x4a0a99._socket.removeListener("data", _0xfdf314);
        process.nextTick(_0x2c96ca, _0x4a0a99._socket);
        _0x4a0a99.close(_0x53e3ab[_0x4ea71b]);
      }
      if (!_0x4a0a99._errorEmitted) {
        _0x4a0a99._errorEmitted = true;
        _0x4a0a99.emit("error", _0x53e3ab);
      }
    }
    function _0x57818c() {
      this[_0x3c6704].emitClose();
    }
    function _0x27d394(_0x2c9ed6, _0x409390) {
      this[_0x3c6704].emit("message", _0x2c9ed6, _0x409390);
    }
    function _0x2a1c78(_0x1330db) {
      const _0x214614 = this[_0x3c6704];
      if (_0x214614._autoPong) {
        _0x214614.pong(_0x1330db, !this._isServer, _0x429afc);
      }
      _0x214614.emit("ping", _0x1330db);
    }
    function _0x4738e8(_0xbc124e) {
      this[_0x3c6704].emit("pong", _0xbc124e);
    }
    function _0x2c96ca(_0x31d16e) {
      _0x31d16e.resume();
    }
    function _0x3c2053(_0x16778a) {
      const _0x2a747b = this[_0x3c6704];
      if (_0x2a747b.readyState === _0x12f403.CLOSED) {
        return;
      }
      if (_0x2a747b.readyState === _0x12f403.OPEN) {
        _0x2a747b._readyState = _0x12f403.CLOSING;
        _0x2a8815(_0x2a747b);
      }
      this._socket.end();
      if (!_0x2a747b._errorEmitted) {
        _0x2a747b._errorEmitted = true;
        _0x2a747b.emit("error", _0x16778a);
      }
    }
    function _0x2a8815(_0x348e5d) {
      _0x348e5d._closeTimer = setTimeout(_0x348e5d._socket.destroy.bind(_0x348e5d._socket), _0x348e5d._closeTimeout);
    }
    function _0x5d681c() {
      const _0xc33666 = this[_0x3c6704];
      this.removeListener("close", _0x5d681c);
      this.removeListener("data", _0xfdf314);
      this.removeListener("end", _0x33f531);
      _0xc33666._readyState = _0x12f403.CLOSING;
      if (!this._readableState.endEmitted && !_0xc33666._closeFrameReceived && !_0xc33666._receiver._writableState.errorEmitted && this._readableState.length !== 0) {
        const _0x4ba86b = this.read(this._readableState.length);
        _0xc33666._receiver.write(_0x4ba86b);
      }
      _0xc33666._receiver.end();
      this[_0x3c6704] = undefined;
      clearTimeout(_0xc33666._closeTimer);
      if (_0xc33666._receiver._writableState.finished || _0xc33666._receiver._writableState.errorEmitted) {
        _0xc33666.emitClose();
      } else {
        _0xc33666._receiver.on("error", _0x57818c);
        _0xc33666._receiver.on("finish", _0x57818c);
      }
    }
    function _0xfdf314(_0xb237a0) {
      if (!this[_0x3c6704]._receiver.write(_0xb237a0)) {
        this.pause();
      }
    }
    function _0x33f531() {
      const _0x2b1b04 = this[_0x3c6704];
      _0x2b1b04._readyState = _0x12f403.CLOSING;
      _0x2b1b04._receiver.end();
      this.end();
    }
    function _0x1627aa() {
      const _0x350edb = this[_0x3c6704];
      this.removeListener("error", _0x1627aa);
      this.on("error", _0x429afc);
      if (_0x350edb) {
        _0x350edb._readyState = _0x12f403.CLOSING;
        this.destroy();
      }
    }
  }
});
var WebSocket = require_websocket();
var {
  Duplex
} = require("stream");
function emitClose(_0x308049) {
  _0x308049.emit("close");
}
function duplexOnEnd() {
  if (!this.destroyed && this._writableState.finished) {
    this.destroy();
  }
}
function duplexOnError(_0x45e59c) {
  this.removeListener("error", duplexOnError);
  this.destroy();
  if (this.listenerCount("error") === 0) {
    this.emit("error", _0x45e59c);
  }
}
function createWebSocketStream(_0x2cca4a, _0x1c3cbd) {
  let _0x23b0a3 = true;
  const _0x58259f = {
    ..._0x1c3cbd
  };
  _0x58259f.autoDestroy = false;
  _0x58259f.emitClose = false;
  _0x58259f.objectMode = false;
  _0x58259f.writableObjectMode = false;
  const _0x53d7f8 = new Duplex(_0x58259f);
  _0x2cca4a.on("message", function _0x3fd80e(_0x2cd431, _0x2c63bd) {
    const _0x1a776a = !_0x2c63bd && _0x53d7f8._readableState.objectMode ? _0x2cd431.toString() : _0x2cd431;
    if (!_0x53d7f8.push(_0x1a776a)) {
      _0x2cca4a.pause();
    }
  });
  _0x2cca4a.once("error", function _0x56de76(_0x51867c) {
    if (_0x53d7f8.destroyed) {
      return;
    }
    _0x23b0a3 = false;
    _0x53d7f8.destroy(_0x51867c);
  });
  _0x2cca4a.once("close", function _0x4a66b1() {
    if (_0x53d7f8.destroyed) {
      return;
    }
    _0x53d7f8.push(null);
  });
  _0x53d7f8._destroy = function (_0x2c2f69, _0x3f1c86) {
    if (_0x2cca4a.readyState === _0x2cca4a.CLOSED) {
      _0x3f1c86(_0x2c2f69);
      process.nextTick(emitClose, _0x53d7f8);
      return;
    }
    let _0x469196 = false;
    _0x2cca4a.once("error", function _0x285c09(_0x4dca8d) {
      _0x469196 = true;
      _0x3f1c86(_0x4dca8d);
    });
    _0x2cca4a.once("close", function _0x8bc22a() {
      if (!_0x469196) {
        _0x3f1c86(_0x2c2f69);
      }
      process.nextTick(emitClose, _0x53d7f8);
    });
    if (_0x23b0a3) {
      _0x2cca4a.terminate();
    }
  };
  _0x53d7f8._final = function (_0x36dc0b) {
    if (_0x2cca4a.readyState === _0x2cca4a.CONNECTING) {
      _0x2cca4a.once("open", function _0x3032be() {
        _0x53d7f8._final(_0x36dc0b);
      });
      return;
    }
    if (_0x2cca4a._socket === null) {
      return;
    }
    if (_0x2cca4a._socket._writableState.finished) {
      _0x36dc0b();
      if (_0x53d7f8._readableState.endEmitted) {
        _0x53d7f8.destroy();
      }
    } else {
      _0x2cca4a._socket.once("finish", function _0x15b84d() {
        _0x36dc0b();
      });
      _0x2cca4a.close();
    }
  };
  _0x53d7f8._read = function () {
    if (_0x2cca4a.isPaused) {
      _0x2cca4a.resume();
    }
  };
  _0x53d7f8._write = function (_0x1b7af4, _0x5dfb24, _0x2dc861) {
    if (_0x2cca4a.readyState === _0x2cca4a.CONNECTING) {
      _0x2cca4a.once("open", function _0x2191a7() {
        _0x53d7f8._write(_0x1b7af4, _0x5dfb24, _0x2dc861);
      });
      return;
    }
    _0x2cca4a.send(_0x1b7af4, _0x2dc861);
  };
  _0x53d7f8.on("end", duplexOnEnd);
  _0x53d7f8.on("error", duplexOnError);
  return _0x53d7f8;
}
module.exports = createWebSocketStream;