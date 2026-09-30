'use strict';

var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (_0x53df42, _0x46d16b) => function _0x3fa4fd() {
  if (!_0x46d16b) {
    (0, _0x53df42[__getOwnPropNames(_0x53df42)[0]])((_0x46d16b = {
      exports: {}
    }).exports, _0x46d16b);
  }
  return _0x46d16b.exports;
};
var require_constants = __commonJS({
  "../work/websockets__ws/lib/constants.js"(_0x17b839, _0x47ee3e) {
    'use strict';

    "use strict";
    var _0x4048d4 = ["nodebuffer", "arraybuffer", "fragments"];
    var _0x486ff3 = typeof Blob !== "undefined";
    if (_0x486ff3) {
      _0x4048d4.push("blob");
    }
    _0x47ee3e.exports = {
      BINARY_TYPES: _0x4048d4,
      CLOSE_TIMEOUT: 30000,
      EMPTY_BUFFER: Buffer.alloc(0),
      GUID: "258EAFA5-E914-47DA-95CA-C5AB0DC85B11",
      hasBlob: _0x486ff3,
      kForOnEventAttribute: Symbol("kIsForOnEventAttribute"),
      kListener: Symbol("kListener"),
      kStatusCode: Symbol("status-code"),
      kWebSocket: Symbol("websocket"),
      NOOP: () => {}
    };
  }
});
var require_buffer_util = __commonJS({
  "../work/websockets__ws/lib/buffer-util.js"(_0x15afbf, _0x37cd9f) {
    'use strict';

    var {
      EMPTY_BUFFER: _0x35662a
    } = require_constants();
    var _0x247d2e = Buffer[Symbol.species];
    function _0x18a711(_0x8d9bb1, _0x2dc0f7) {
      if (_0x8d9bb1.length === 0) {
        return _0x35662a;
      }
      if (_0x8d9bb1.length === 1) {
        return _0x8d9bb1[0];
      }
      const _0x31ee2 = Buffer.allocUnsafe(_0x2dc0f7);
      let _0x2d4213 = 0;
      for (let _0xbd68d5 = 0; _0xbd68d5 < _0x8d9bb1.length; _0xbd68d5++) {
        const _0x44aa59 = _0x8d9bb1[_0xbd68d5];
        _0x31ee2.set(_0x44aa59, _0x2d4213);
        _0x2d4213 += _0x44aa59.length;
      }
      if (_0x2d4213 < _0x2dc0f7) {
        return new _0x247d2e(_0x31ee2.buffer, _0x31ee2.byteOffset, _0x2d4213);
      }
      return _0x31ee2;
    }
    function _0x52d3fc(_0x5653c3, _0x32b0a7, _0x4006e3, _0x11d557, _0x1d9d19) {
      for (let _0x3e6863 = 0; _0x3e6863 < _0x1d9d19; _0x3e6863++) {
        _0x4006e3[_0x11d557 + _0x3e6863] = _0x5653c3[_0x3e6863] ^ _0x32b0a7[_0x3e6863 & 3];
      }
    }
    function _0x3de86b(_0x1b9f11, _0x421985) {
      for (let _0x2be2d4 = 0; _0x2be2d4 < _0x1b9f11.length; _0x2be2d4++) {
        _0x1b9f11[_0x2be2d4] ^= _0x421985[_0x2be2d4 & 3];
      }
    }
    function _0x2ff84a(_0x2cd253) {
      if (_0x2cd253.length === _0x2cd253.buffer.byteLength) {
        return _0x2cd253.buffer;
      }
      return _0x2cd253.buffer.slice(_0x2cd253.byteOffset, _0x2cd253.byteOffset + _0x2cd253.length);
    }
    function _0x1f6fe0(_0x372d9c) {
      _0x1f6fe0.readOnly = true;
      if (Buffer.isBuffer(_0x372d9c)) {
        return _0x372d9c;
      }
      let _0x38fe64;
      if (_0x372d9c instanceof ArrayBuffer) {
        _0x38fe64 = new _0x247d2e(_0x372d9c);
      } else if (ArrayBuffer.isView(_0x372d9c)) {
        _0x38fe64 = new _0x247d2e(_0x372d9c.buffer, _0x372d9c.byteOffset, _0x372d9c.byteLength);
      } else {
        _0x38fe64 = Buffer.from(_0x372d9c);
        _0x1f6fe0.readOnly = false;
      }
      return _0x38fe64;
    }
    const _0x46decf = {
      concat: _0x18a711,
      mask: _0x52d3fc,
      toArrayBuffer: _0x2ff84a,
      toBuffer: _0x1f6fe0,
      unmask: _0x3de86b
    };
    _0x37cd9f.exports = _0x46decf;
    if (!process.env.WS_NO_BUFFER_UTIL) {
      try {
        const _0x5376fb = require("bufferutil");
        _0x37cd9f.exports.mask = function (_0x2285d3, _0x3299a9, _0x2b7a04, _0x3e65bb, _0x50f14f) {
          if (_0x50f14f < 48) {
            _0x52d3fc(_0x2285d3, _0x3299a9, _0x2b7a04, _0x3e65bb, _0x50f14f);
          } else {
            _0x5376fb.mask(_0x2285d3, _0x3299a9, _0x2b7a04, _0x3e65bb, _0x50f14f);
          }
        };
        _0x37cd9f.exports.unmask = function (_0x46337d, _0x2b96d1) {
          if (_0x46337d.length < 32) {
            _0x3de86b(_0x46337d, _0x2b96d1);
          } else {
            _0x5376fb.unmask(_0x46337d, _0x2b96d1);
          }
        };
      } catch (_0x5c18e5) {}
    }
  }
});
var require_limiter = __commonJS({
  "../work/websockets__ws/lib/limiter.js"(_0x180e09, _0x5eea28) {
    'use strict';

    var _0x403e66 = Symbol("kDone");
    var _0x4089f2 = Symbol("kRun");
    var _0x539521 = class {
      constructor(_0x555c15) {
        this[_0x403e66] = () => {
          this.pending--;
          this[_0x4089f2]();
        };
        this.concurrency = _0x555c15 || Infinity;
        this.jobs = [];
        this.pending = 0;
      }
      add(_0x3bd144) {
        this.jobs.push(_0x3bd144);
        this[_0x4089f2]();
      }
      [_0x4089f2]() {
        if (this.pending === this.concurrency) {
          return;
        }
        if (this.jobs.length) {
          const _0x49c424 = this.jobs.shift();
          this.pending++;
          _0x49c424(this[_0x403e66]);
        }
      }
    };
    _0x5eea28.exports = _0x539521;
  }
});
var require_permessage_deflate = __commonJS({
  "../work/websockets__ws/lib/permessage-deflate.js"(_0x296cc0, _0x3fe749) {
    'use strict';

    var _0x129eff = require("zlib");
    var _0x53322c = require_buffer_util();
    var _0x23cb37 = require_limiter();
    var {
      kStatusCode: _0x12ee03
    } = require_constants();
    var _0x49c65a = Buffer[Symbol.species];
    var _0x55dd93 = Buffer.from([0, 0, 255, 255]);
    var _0xb14a00 = Symbol("permessage-deflate");
    var _0x16d605 = Symbol("total-length");
    var _0x19eb8c = Symbol("callback");
    var _0x325dba = Symbol("buffers");
    var _0x4ff3d5 = Symbol("error");
    var _0x3633aa;
    var _0x37672a = class {
      constructor(_0x30cb3d) {
        this._options = _0x30cb3d || {};
        this._threshold = this._options.threshold !== undefined ? this._options.threshold : 1024;
        this._maxPayload = this._options.maxPayload | 0;
        this._isServer = !!this._options.isServer;
        this._deflate = null;
        this._inflate = null;
        this.params = null;
        if (!_0x3633aa) {
          const _0x158972 = this._options.concurrencyLimit !== undefined ? this._options.concurrencyLimit : 10;
          _0x3633aa = new _0x23cb37(_0x158972);
        }
      }
      static get extensionName() {
        return "permessage-deflate";
      }
      offer() {
        const _0x20fb65 = {};
        if (this._options.serverNoContextTakeover) {
          _0x20fb65.server_no_context_takeover = true;
        }
        if (this._options.clientNoContextTakeover) {
          _0x20fb65.client_no_context_takeover = true;
        }
        if (this._options.serverMaxWindowBits) {
          _0x20fb65.server_max_window_bits = this._options.serverMaxWindowBits;
        }
        if (this._options.clientMaxWindowBits) {
          _0x20fb65.client_max_window_bits = this._options.clientMaxWindowBits;
        } else if (this._options.clientMaxWindowBits == null) {
          _0x20fb65.client_max_window_bits = true;
        }
        return _0x20fb65;
      }
      accept(_0x4b49c3) {
        _0x4b49c3 = this.normalizeParams(_0x4b49c3);
        this.params = this._isServer ? this.acceptAsServer(_0x4b49c3) : this.acceptAsClient(_0x4b49c3);
        return this.params;
      }
      cleanup() {
        if (this._inflate) {
          this._inflate.close();
          this._inflate = null;
        }
        if (this._deflate) {
          const _0x5727ee = this._deflate[_0x19eb8c];
          this._deflate.close();
          this._deflate = null;
          if (_0x5727ee) {
            _0x5727ee(new Error("The deflate stream was closed while data was being processed"));
          }
        }
      }
      acceptAsServer(_0x2952e7) {
        const _0x375940 = this._options;
        const _0x3ed366 = _0x2952e7.find(_0x41e84d => {
          if (_0x375940.serverNoContextTakeover === false && _0x41e84d.server_no_context_takeover || _0x41e84d.server_max_window_bits && (_0x375940.serverMaxWindowBits === false || typeof _0x375940.serverMaxWindowBits === "number" && _0x375940.serverMaxWindowBits > _0x41e84d.server_max_window_bits) || typeof _0x375940.clientMaxWindowBits === "number" && !_0x41e84d.client_max_window_bits) {
            return false;
          }
          return true;
        });
        if (!_0x3ed366) {
          throw new Error("None of the extension offers can be accepted");
        }
        if (_0x375940.serverNoContextTakeover) {
          _0x3ed366.server_no_context_takeover = true;
        }
        if (_0x375940.clientNoContextTakeover) {
          _0x3ed366.client_no_context_takeover = true;
        }
        if (typeof _0x375940.serverMaxWindowBits === "number") {
          _0x3ed366.server_max_window_bits = _0x375940.serverMaxWindowBits;
        }
        if (typeof _0x375940.clientMaxWindowBits === "number") {
          _0x3ed366.client_max_window_bits = _0x375940.clientMaxWindowBits;
        } else if (_0x3ed366.client_max_window_bits === true || _0x375940.clientMaxWindowBits === false) {
          delete _0x3ed366.client_max_window_bits;
        }
        return _0x3ed366;
      }
      acceptAsClient(_0x1b8b07) {
        const _0x36bd15 = _0x1b8b07[0];
        if (this._options.clientNoContextTakeover === false && _0x36bd15.client_no_context_takeover) {
          throw new Error("Unexpected parameter \"client_no_context_takeover\"");
        }
        if (!_0x36bd15.client_max_window_bits) {
          if (typeof this._options.clientMaxWindowBits === "number") {
            _0x36bd15.client_max_window_bits = this._options.clientMaxWindowBits;
          }
        } else if (this._options.clientMaxWindowBits === false || typeof this._options.clientMaxWindowBits === "number" && _0x36bd15.client_max_window_bits > this._options.clientMaxWindowBits) {
          throw new Error("Unexpected or invalid parameter \"client_max_window_bits\"");
        }
        return _0x36bd15;
      }
      normalizeParams(_0x349ce2) {
        _0x349ce2.forEach(_0x40485d => {
          Object.keys(_0x40485d).forEach(_0x45ddc0 => {
            let _0x19fba3 = _0x40485d[_0x45ddc0];
            if (_0x19fba3.length > 1) {
              throw new Error("Parameter \"" + _0x45ddc0 + "\" must have only a single value");
            }
            _0x19fba3 = _0x19fba3[0];
            if (_0x45ddc0 === "client_max_window_bits") {
              if (_0x19fba3 !== true) {
                const _0x54c6da = +_0x19fba3;
                if (!Number.isInteger(_0x54c6da) || _0x54c6da < 8 || _0x54c6da > 15) {
                  throw new TypeError("Invalid value for parameter \"" + _0x45ddc0 + "\": " + _0x19fba3);
                }
                _0x19fba3 = _0x54c6da;
              } else if (!this._isServer) {
                throw new TypeError("Invalid value for parameter \"" + _0x45ddc0 + "\": " + _0x19fba3);
              }
            } else if (_0x45ddc0 === "server_max_window_bits") {
              const _0x46cc90 = +_0x19fba3;
              if (!Number.isInteger(_0x46cc90) || _0x46cc90 < 8 || _0x46cc90 > 15) {
                throw new TypeError("Invalid value for parameter \"" + _0x45ddc0 + "\": " + _0x19fba3);
              }
              _0x19fba3 = _0x46cc90;
            } else if (_0x45ddc0 === "client_no_context_takeover" || _0x45ddc0 === "server_no_context_takeover") {
              if (_0x19fba3 !== true) {
                throw new TypeError("Invalid value for parameter \"" + _0x45ddc0 + "\": " + _0x19fba3);
              }
            } else {
              throw new Error("Unknown parameter \"" + _0x45ddc0 + "\"");
            }
            _0x40485d[_0x45ddc0] = _0x19fba3;
          });
        });
        return _0x349ce2;
      }
      decompress(_0x2f896c, _0x3fe8bc, _0x5ca28d) {
        _0x3633aa.add(_0x159059 => {
          this._decompress(_0x2f896c, _0x3fe8bc, (_0x596d89, _0x2f4e1f) => {
            _0x159059();
            _0x5ca28d(_0x596d89, _0x2f4e1f);
          });
        });
      }
      compress(_0x23e0f2, _0xa954c, _0x1605f5) {
        _0x3633aa.add(_0x53627a => {
          this._compress(_0x23e0f2, _0xa954c, (_0xa63360, _0x55b657) => {
            _0x53627a();
            _0x1605f5(_0xa63360, _0x55b657);
          });
        });
      }
      _decompress(_0xb02914, _0xde50a3, _0xa75c56) {
        const _0x1a7121 = this._isServer ? "client" : "server";
        if (!this._inflate) {
          const _0x424c4d = _0x1a7121 + "_max_window_bits";
          const _0x4fe122 = typeof this.params[_0x424c4d] !== "number" ? _0x129eff.Z_DEFAULT_WINDOWBITS : this.params[_0x424c4d];
          this._inflate = _0x129eff.createInflateRaw({
            ...this._options.zlibInflateOptions,
            windowBits: _0x4fe122
          });
          this._inflate[_0xb14a00] = this;
          this._inflate[_0x16d605] = 0;
          this._inflate[_0x325dba] = [];
          this._inflate.on("error", _0x360dba);
          this._inflate.on("data", _0x21499b);
        }
        this._inflate[_0x19eb8c] = _0xa75c56;
        this._inflate.write(_0xb02914);
        if (_0xde50a3) {
          this._inflate.write(_0x55dd93);
        }
        this._inflate.flush(() => {
          const _0x44b1f5 = this._inflate[_0x4ff3d5];
          if (_0x44b1f5) {
            this._inflate.close();
            this._inflate = null;
            _0xa75c56(_0x44b1f5);
            return;
          }
          const _0xb849ff = _0x53322c.concat(this._inflate[_0x325dba], this._inflate[_0x16d605]);
          if (this._inflate._readableState.endEmitted) {
            this._inflate.close();
            this._inflate = null;
          } else {
            this._inflate[_0x16d605] = 0;
            this._inflate[_0x325dba] = [];
            if (_0xde50a3 && this.params[_0x1a7121 + "_no_context_takeover"]) {
              this._inflate.reset();
            }
          }
          _0xa75c56(null, _0xb849ff);
        });
      }
      _compress(_0x11f217, _0x1ab221, _0x103f04) {
        const _0x1fdb7d = this._isServer ? "server" : "client";
        if (!this._deflate) {
          const _0x3b9641 = _0x1fdb7d + "_max_window_bits";
          const _0x3c033f = typeof this.params[_0x3b9641] !== "number" ? _0x129eff.Z_DEFAULT_WINDOWBITS : this.params[_0x3b9641];
          this._deflate = _0x129eff.createDeflateRaw({
            ...this._options.zlibDeflateOptions,
            windowBits: _0x3c033f
          });
          this._deflate[_0x16d605] = 0;
          this._deflate[_0x325dba] = [];
          this._deflate.on("data", _0x18bb79);
        }
        this._deflate[_0x19eb8c] = _0x103f04;
        this._deflate.write(_0x11f217);
        this._deflate.flush(_0x129eff.Z_SYNC_FLUSH, () => {
          if (!this._deflate) {
            return;
          }
          let _0xd624ac = _0x53322c.concat(this._deflate[_0x325dba], this._deflate[_0x16d605]);
          if (_0x1ab221) {
            _0xd624ac = new _0x49c65a(_0xd624ac.buffer, _0xd624ac.byteOffset, _0xd624ac.length - 4);
          }
          this._deflate[_0x19eb8c] = null;
          this._deflate[_0x16d605] = 0;
          this._deflate[_0x325dba] = [];
          if (_0x1ab221 && this.params[_0x1fdb7d + "_no_context_takeover"]) {
            this._deflate.reset();
          }
          _0x103f04(null, _0xd624ac);
        });
      }
    };
    _0x3fe749.exports = _0x37672a;
    function _0x18bb79(_0x2ccb10) {
      this[_0x325dba].push(_0x2ccb10);
      this[_0x16d605] += _0x2ccb10.length;
    }
    function _0x21499b(_0x5a0623) {
      this[_0x16d605] += _0x5a0623.length;
      if (this[_0xb14a00]._maxPayload < 1 || this[_0x16d605] <= this[_0xb14a00]._maxPayload) {
        this[_0x325dba].push(_0x5a0623);
        return;
      }
      this[_0x4ff3d5] = new RangeError("Max payload size exceeded");
      this[_0x4ff3d5].code = "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH";
      this[_0x4ff3d5][_0x12ee03] = 1009;
      this.removeListener("data", _0x21499b);
      this.reset();
    }
    function _0x360dba(_0xfc69a7) {
      this[_0xb14a00]._inflate = null;
      if (this[_0x4ff3d5]) {
        this[_0x19eb8c](this[_0x4ff3d5]);
        return;
      }
      _0xfc69a7[_0x12ee03] = 1007;
      this[_0x19eb8c](_0xfc69a7);
    }
  }
});
var require_validation = __commonJS({
  "../work/websockets__ws/lib/validation.js"(_0x5c6773, _0x595d94) {
    'use strict';

    var {
      isUtf8: _0x3e0f7e
    } = require("buffer");
    var {
      hasBlob: _0x3800d2
    } = require_constants();
    var _0x3c2ec1 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0];
    function _0x21fb49(_0x99b5df) {
      return _0x99b5df >= 1000 && _0x99b5df <= 1014 && _0x99b5df !== 1004 && _0x99b5df !== 1005 && _0x99b5df !== 1006 || _0x99b5df >= 3000 && _0x99b5df <= 4999;
    }
    function _0x25df05(_0x59382b) {
      const _0x23062b = _0x59382b.length;
      let _0x49b1dd = 0;
      while (_0x49b1dd < _0x23062b) {
        if ((_0x59382b[_0x49b1dd] & 128) === 0) {
          _0x49b1dd++;
        } else if ((_0x59382b[_0x49b1dd] & 224) === 192) {
          if (_0x49b1dd + 1 === _0x23062b || (_0x59382b[_0x49b1dd + 1] & 192) !== 128 || (_0x59382b[_0x49b1dd] & 254) === 192) {
            return false;
          }
          _0x49b1dd += 2;
        } else if ((_0x59382b[_0x49b1dd] & 240) === 224) {
          if (_0x49b1dd + 2 >= _0x23062b || (_0x59382b[_0x49b1dd + 1] & 192) !== 128 || (_0x59382b[_0x49b1dd + 2] & 192) !== 128 || _0x59382b[_0x49b1dd] === 224 && (_0x59382b[_0x49b1dd + 1] & 224) === 128 || _0x59382b[_0x49b1dd] === 237 && (_0x59382b[_0x49b1dd + 1] & 224) === 160) {
            return false;
          }
          _0x49b1dd += 3;
        } else if ((_0x59382b[_0x49b1dd] & 248) === 240) {
          if (_0x49b1dd + 3 >= _0x23062b || (_0x59382b[_0x49b1dd + 1] & 192) !== 128 || (_0x59382b[_0x49b1dd + 2] & 192) !== 128 || (_0x59382b[_0x49b1dd + 3] & 192) !== 128 || _0x59382b[_0x49b1dd] === 240 && (_0x59382b[_0x49b1dd + 1] & 240) === 128 || _0x59382b[_0x49b1dd] === 244 && _0x59382b[_0x49b1dd + 1] > 143 || _0x59382b[_0x49b1dd] > 244) {
            return false;
          }
          _0x49b1dd += 4;
        } else {
          return false;
        }
      }
      return true;
    }
    function _0x1ecd30(_0x5ae50f) {
      return _0x3800d2 && typeof _0x5ae50f === "object" && typeof _0x5ae50f.arrayBuffer === "function" && typeof _0x5ae50f.type === "string" && typeof _0x5ae50f.stream === "function" && (_0x5ae50f[Symbol.toStringTag] === "Blob" || _0x5ae50f[Symbol.toStringTag] === "File");
    }
    const _0x9de61c = {
      isBlob: _0x1ecd30,
      isValidStatusCode: _0x21fb49,
      isValidUTF8: _0x25df05,
      tokenChars: _0x3c2ec1
    };
    _0x595d94.exports = _0x9de61c;
    if (_0x3e0f7e) {
      _0x595d94.exports.isValidUTF8 = function (_0x347b02) {
        if (_0x347b02.length < 24) {
          return _0x25df05(_0x347b02);
        } else {
          return _0x3e0f7e(_0x347b02);
        }
      };
    } else if (!process.env.WS_NO_UTF_8_VALIDATE) {
      try {
        const _0x47b514 = require("utf-8-validate");
        _0x595d94.exports.isValidUTF8 = function (_0x3675bf) {
          if (_0x3675bf.length < 32) {
            return _0x25df05(_0x3675bf);
          } else {
            return _0x47b514(_0x3675bf);
          }
        };
      } catch (_0xc35e38) {}
    }
  }
});
var {
  Writable
} = require("stream");
var PerMessageDeflate = require_permessage_deflate();
var {
  BINARY_TYPES,
  EMPTY_BUFFER,
  kStatusCode,
  kWebSocket
} = require_constants();
var {
  concat,
  toArrayBuffer,
  unmask
} = require_buffer_util();
var {
  isValidStatusCode,
  isValidUTF8
} = require_validation();
var FastBuffer = Buffer[Symbol.species];
var GET_INFO = 0;
var GET_PAYLOAD_LENGTH_16 = 1;
var GET_PAYLOAD_LENGTH_64 = 2;
var GET_MASK = 3;
var GET_DATA = 4;
var INFLATING = 5;
var DEFER_EVENT = 6;
var Receiver = class extends Writable {
  constructor(_0x729780 = {}) {
    super();
    this._allowSynchronousEvents = _0x729780.allowSynchronousEvents !== undefined ? _0x729780.allowSynchronousEvents : true;
    this._binaryType = _0x729780.binaryType || BINARY_TYPES[0];
    this._extensions = _0x729780.extensions || {};
    this._isServer = !!_0x729780.isServer;
    this._maxBufferedChunks = _0x729780.maxBufferedChunks | 0;
    this._maxFragments = _0x729780.maxFragments | 0;
    this._maxPayload = _0x729780.maxPayload | 0;
    this._skipUTF8Validation = !!_0x729780.skipUTF8Validation;
    this[kWebSocket] = undefined;
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
    this._state = GET_INFO;
  }
  _write(_0x16116c, _0x1ade75, _0x191e71) {
    if (this._opcode === 8 && this._state == GET_INFO) {
      return _0x191e71();
    }
    if (this._maxBufferedChunks > 0 && this._buffers.length >= this._maxBufferedChunks) {
      _0x191e71(this.createError(RangeError, "Too many buffered chunks", false, 1008, "WS_ERR_TOO_MANY_BUFFERED_PARTS"));
      return;
    }
    this._bufferedBytes += _0x16116c.length;
    this._buffers.push(_0x16116c);
    this.startLoop(_0x191e71);
  }
  consume(_0x40cc28) {
    this._bufferedBytes -= _0x40cc28;
    if (_0x40cc28 === this._buffers[0].length) {
      return this._buffers.shift();
    }
    if (_0x40cc28 < this._buffers[0].length) {
      const _0x1b97da = this._buffers[0];
      this._buffers[0] = new FastBuffer(_0x1b97da.buffer, _0x1b97da.byteOffset + _0x40cc28, _0x1b97da.length - _0x40cc28);
      return new FastBuffer(_0x1b97da.buffer, _0x1b97da.byteOffset, _0x40cc28);
    }
    const _0x541fd9 = Buffer.allocUnsafe(_0x40cc28);
    do {
      const _0x36de95 = this._buffers[0];
      const _0x3ea735 = _0x541fd9.length - _0x40cc28;
      if (_0x40cc28 >= _0x36de95.length) {
        _0x541fd9.set(this._buffers.shift(), _0x3ea735);
      } else {
        _0x541fd9.set(new Uint8Array(_0x36de95.buffer, _0x36de95.byteOffset, _0x40cc28), _0x3ea735);
        this._buffers[0] = new FastBuffer(_0x36de95.buffer, _0x36de95.byteOffset + _0x40cc28, _0x36de95.length - _0x40cc28);
      }
      _0x40cc28 -= _0x36de95.length;
    } while (_0x40cc28 > 0);
    return _0x541fd9;
  }
  startLoop(_0xf4a065) {
    this._loop = true;
    do {
      switch (this._state) {
        case GET_INFO:
          this.getInfo(_0xf4a065);
          break;
        case GET_PAYLOAD_LENGTH_16:
          this.getPayloadLength16(_0xf4a065);
          break;
        case GET_PAYLOAD_LENGTH_64:
          this.getPayloadLength64(_0xf4a065);
          break;
        case GET_MASK:
          this.getMask();
          break;
        case GET_DATA:
          this.getData(_0xf4a065);
          break;
        case INFLATING:
        case DEFER_EVENT:
          this._loop = false;
          return;
      }
    } while (this._loop);
    if (!this._errored) {
      _0xf4a065();
    }
  }
  getInfo(_0x46c3df) {
    if (this._bufferedBytes < 2) {
      this._loop = false;
      return;
    }
    const _0xdb5f88 = this.consume(2);
    if ((_0xdb5f88[0] & 48) !== 0) {
      const _0x5b1d34 = this.createError(RangeError, "RSV2 and RSV3 must be clear", true, 1002, "WS_ERR_UNEXPECTED_RSV_2_3");
      _0x46c3df(_0x5b1d34);
      return;
    }
    const _0x2b65ff = (_0xdb5f88[0] & 64) === 64;
    if (_0x2b65ff && !this._extensions[PerMessageDeflate.extensionName]) {
      const _0x3c971e = this.createError(RangeError, "RSV1 must be clear", true, 1002, "WS_ERR_UNEXPECTED_RSV_1");
      _0x46c3df(_0x3c971e);
      return;
    }
    this._fin = (_0xdb5f88[0] & 128) === 128;
    this._opcode = _0xdb5f88[0] & 15;
    this._payloadLength = _0xdb5f88[1] & 127;
    if (this._opcode === 0) {
      if (_0x2b65ff) {
        const _0x1be34a = this.createError(RangeError, "RSV1 must be clear", true, 1002, "WS_ERR_UNEXPECTED_RSV_1");
        _0x46c3df(_0x1be34a);
        return;
      }
      if (!this._fragmented) {
        const _0x5e9af0 = this.createError(RangeError, "invalid opcode 0", true, 1002, "WS_ERR_INVALID_OPCODE");
        _0x46c3df(_0x5e9af0);
        return;
      }
      this._opcode = this._fragmented;
    } else if (this._opcode === 1 || this._opcode === 2) {
      if (this._fragmented) {
        const _0x515326 = this.createError(RangeError, "invalid opcode " + this._opcode, true, 1002, "WS_ERR_INVALID_OPCODE");
        _0x46c3df(_0x515326);
        return;
      }
      this._compressed = _0x2b65ff;
    } else if (this._opcode > 7 && this._opcode < 11) {
      if (!this._fin) {
        const _0x511e33 = this.createError(RangeError, "FIN must be set", true, 1002, "WS_ERR_EXPECTED_FIN");
        _0x46c3df(_0x511e33);
        return;
      }
      if (_0x2b65ff) {
        const _0x176900 = this.createError(RangeError, "RSV1 must be clear", true, 1002, "WS_ERR_UNEXPECTED_RSV_1");
        _0x46c3df(_0x176900);
        return;
      }
      if (this._payloadLength > 125 || this._opcode === 8 && this._payloadLength === 1) {
        const _0xa876cc = this.createError(RangeError, "invalid payload length " + this._payloadLength, true, 1002, "WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH");
        _0x46c3df(_0xa876cc);
        return;
      }
    } else {
      const _0x4bf6c8 = this.createError(RangeError, "invalid opcode " + this._opcode, true, 1002, "WS_ERR_INVALID_OPCODE");
      _0x46c3df(_0x4bf6c8);
      return;
    }
    if (!this._fin && !this._fragmented) {
      this._fragmented = this._opcode;
    }
    this._masked = (_0xdb5f88[1] & 128) === 128;
    if (this._isServer) {
      if (!this._masked) {
        const _0x5a4463 = this.createError(RangeError, "MASK must be set", true, 1002, "WS_ERR_EXPECTED_MASK");
        _0x46c3df(_0x5a4463);
        return;
      }
    } else if (this._masked) {
      const _0x4e96a8 = this.createError(RangeError, "MASK must be clear", true, 1002, "WS_ERR_UNEXPECTED_MASK");
      _0x46c3df(_0x4e96a8);
      return;
    }
    if (this._payloadLength === 126) {
      this._state = GET_PAYLOAD_LENGTH_16;
    } else if (this._payloadLength === 127) {
      this._state = GET_PAYLOAD_LENGTH_64;
    } else {
      this.haveLength(_0x46c3df);
    }
  }
  getPayloadLength16(_0x359c1f) {
    if (this._bufferedBytes < 2) {
      this._loop = false;
      return;
    }
    this._payloadLength = this.consume(2).readUInt16BE(0);
    this.haveLength(_0x359c1f);
  }
  getPayloadLength64(_0x451ab7) {
    if (this._bufferedBytes < 8) {
      this._loop = false;
      return;
    }
    const _0x2dbc2a = this.consume(8);
    const _0x47fbee = _0x2dbc2a.readUInt32BE(0);
    if (_0x47fbee > Math.pow(2, 21) - 1) {
      const _0x23dd2e = this.createError(RangeError, "Unsupported WebSocket frame: payload length > 2^53 - 1", false, 1009, "WS_ERR_UNSUPPORTED_DATA_PAYLOAD_LENGTH");
      _0x451ab7(_0x23dd2e);
      return;
    }
    this._payloadLength = _0x47fbee * Math.pow(2, 32) + _0x2dbc2a.readUInt32BE(4);
    this.haveLength(_0x451ab7);
  }
  haveLength(_0x12acfb) {
    if (this._payloadLength && this._opcode < 8) {
      this._totalPayloadLength += this._payloadLength;
      if (this._totalPayloadLength > this._maxPayload && this._maxPayload > 0) {
        const _0x225eee = this.createError(RangeError, "Max payload size exceeded", false, 1009, "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH");
        _0x12acfb(_0x225eee);
        return;
      }
    }
    if (this._masked) {
      this._state = GET_MASK;
    } else {
      this._state = GET_DATA;
    }
  }
  getMask() {
    if (this._bufferedBytes < 4) {
      this._loop = false;
      return;
    }
    this._mask = this.consume(4);
    this._state = GET_DATA;
  }
  getData(_0x592945) {
    let _0x5d2220 = EMPTY_BUFFER;
    if (this._payloadLength) {
      if (this._bufferedBytes < this._payloadLength) {
        this._loop = false;
        return;
      }
      _0x5d2220 = this.consume(this._payloadLength);
      if (this._masked && (this._mask[0] | this._mask[1] | this._mask[2] | this._mask[3]) !== 0) {
        unmask(_0x5d2220, this._mask);
      }
    }
    if (this._opcode > 7) {
      this.controlMessage(_0x5d2220, _0x592945);
      return;
    }
    if (this._maxFragments > 0 && ++this._numFragments > this._maxFragments) {
      const _0x38fcda = this.createError(RangeError, "Too many message fragments", false, 1008, "WS_ERR_TOO_MANY_BUFFERED_PARTS");
      _0x592945(_0x38fcda);
      return;
    }
    if (this._compressed) {
      this._state = INFLATING;
      this.decompress(_0x5d2220, _0x592945);
      return;
    }
    if (_0x5d2220.length) {
      this._messageLength = this._totalPayloadLength;
      this._fragments.push(_0x5d2220);
    }
    this.dataMessage(_0x592945);
  }
  decompress(_0x23291c, _0x6440e4) {
    const _0x3c2bd1 = this._extensions[PerMessageDeflate.extensionName];
    _0x3c2bd1.decompress(_0x23291c, this._fin, (_0x53b919, _0x55d2f9) => {
      if (_0x53b919) {
        return _0x6440e4(_0x53b919);
      }
      if (_0x55d2f9.length) {
        this._messageLength += _0x55d2f9.length;
        if (this._messageLength > this._maxPayload && this._maxPayload > 0) {
          const _0x4746b1 = this.createError(RangeError, "Max payload size exceeded", false, 1009, "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH");
          _0x6440e4(_0x4746b1);
          return;
        }
        this._fragments.push(_0x55d2f9);
      }
      this.dataMessage(_0x6440e4);
      if (this._state === GET_INFO) {
        this.startLoop(_0x6440e4);
      }
    });
  }
  dataMessage(_0x54906b) {
    if (!this._fin) {
      this._state = GET_INFO;
      return;
    }
    const _0x4ba9ed = this._messageLength;
    const _0x9b8559 = this._fragments;
    this._totalPayloadLength = 0;
    this._messageLength = 0;
    this._fragmented = 0;
    this._numFragments = 0;
    this._fragments = [];
    if (this._opcode === 2) {
      let _0x2211c5;
      if (this._binaryType === "nodebuffer") {
        _0x2211c5 = concat(_0x9b8559, _0x4ba9ed);
      } else if (this._binaryType === "arraybuffer") {
        _0x2211c5 = toArrayBuffer(concat(_0x9b8559, _0x4ba9ed));
      } else if (this._binaryType === "blob") {
        _0x2211c5 = new Blob(_0x9b8559);
      } else {
        _0x2211c5 = _0x9b8559;
      }
      if (this._allowSynchronousEvents) {
        this.emit("message", _0x2211c5, true);
        this._state = GET_INFO;
      } else {
        this._state = DEFER_EVENT;
        setImmediate(() => {
          this.emit("message", _0x2211c5, true);
          this._state = GET_INFO;
          this.startLoop(_0x54906b);
        });
      }
    } else {
      const _0x2a4117 = concat(_0x9b8559, _0x4ba9ed);
      if (!this._skipUTF8Validation && !isValidUTF8(_0x2a4117)) {
        const _0x4ab9af = this.createError(Error, "invalid UTF-8 sequence", true, 1007, "WS_ERR_INVALID_UTF8");
        _0x54906b(_0x4ab9af);
        return;
      }
      if (this._state === INFLATING || this._allowSynchronousEvents) {
        this.emit("message", _0x2a4117, false);
        this._state = GET_INFO;
      } else {
        this._state = DEFER_EVENT;
        setImmediate(() => {
          this.emit("message", _0x2a4117, false);
          this._state = GET_INFO;
          this.startLoop(_0x54906b);
        });
      }
    }
  }
  controlMessage(_0x31cba6, _0x2bec8a) {
    if (this._opcode === 8) {
      if (_0x31cba6.length === 0) {
        this._loop = false;
        this.emit("conclude", 1005, EMPTY_BUFFER);
        this.end();
      } else {
        const _0x424ad2 = _0x31cba6.readUInt16BE(0);
        if (!isValidStatusCode(_0x424ad2)) {
          const _0x502722 = this.createError(RangeError, "invalid status code " + _0x424ad2, true, 1002, "WS_ERR_INVALID_CLOSE_CODE");
          _0x2bec8a(_0x502722);
          return;
        }
        const _0x41de20 = new FastBuffer(_0x31cba6.buffer, _0x31cba6.byteOffset + 2, _0x31cba6.length - 2);
        if (!this._skipUTF8Validation && !isValidUTF8(_0x41de20)) {
          const _0x15c7a8 = this.createError(Error, "invalid UTF-8 sequence", true, 1007, "WS_ERR_INVALID_UTF8");
          _0x2bec8a(_0x15c7a8);
          return;
        }
        this._loop = false;
        this.emit("conclude", _0x424ad2, _0x41de20);
        this.end();
      }
      this._state = GET_INFO;
      return;
    }
    if (this._allowSynchronousEvents) {
      this.emit(this._opcode === 9 ? "ping" : "pong", _0x31cba6);
      this._state = GET_INFO;
    } else {
      this._state = DEFER_EVENT;
      setImmediate(() => {
        this.emit(this._opcode === 9 ? "ping" : "pong", _0x31cba6);
        this._state = GET_INFO;
        this.startLoop(_0x2bec8a);
      });
    }
  }
  createError(_0x48a88a, _0xa05924, _0x47c6f1, _0x46b789, _0x4e42ae) {
    this._loop = false;
    this._errored = true;
    const _0x40f2bb = new _0x48a88a(_0x47c6f1 ? "Invalid WebSocket frame: " + _0xa05924 : _0xa05924);
    Error.captureStackTrace(_0x40f2bb, this.createError);
    _0x40f2bb.code = _0x4e42ae;
    _0x40f2bb[kStatusCode] = _0x46b789;
    return _0x40f2bb;
  }
};
module.exports = Receiver;