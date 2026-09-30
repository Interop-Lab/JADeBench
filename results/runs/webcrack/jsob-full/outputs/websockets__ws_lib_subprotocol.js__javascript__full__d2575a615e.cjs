'use strict';

var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (_0x5cc58a, _0x373463) => function _0x4a96c9() {
  if (!_0x373463) {
    (0, _0x5cc58a[__getOwnPropNames(_0x5cc58a)[0]])((_0x373463 = {
      exports: {}
    }).exports, _0x373463);
  }
  return _0x373463.exports;
};
var require_constants = __commonJS({
  "../work/websockets__ws/lib/constants.js"(_0x5367e7, _0x2ab2d2) {
    'use strict';

    "use strict";
    var _0x4a3d54 = ["nodebuffer", "arraybuffer", "fragments"];
    var _0x231f2e = typeof Blob !== "undefined";
    if (_0x231f2e) {
      _0x4a3d54.push("blob");
    }
    _0x2ab2d2.exports = {
      BINARY_TYPES: _0x4a3d54,
      CLOSE_TIMEOUT: 30000,
      EMPTY_BUFFER: Buffer.alloc(0),
      GUID: "258EAFA5-E914-47DA-95CA-C5AB0DC85B11",
      hasBlob: _0x231f2e,
      kForOnEventAttribute: Symbol("kIsForOnEventAttribute"),
      kListener: Symbol("kListener"),
      kStatusCode: Symbol("status-code"),
      kWebSocket: Symbol("websocket"),
      NOOP: () => {}
    };
  }
});
var require_validation = __commonJS({
  "../work/websockets__ws/lib/validation.js"(_0x2195ad, _0x4d5dc0) {
    'use strict';

    var {
      isUtf8: _0xcbf8e9
    } = require("buffer");
    var {
      hasBlob: _0x9fb7c2
    } = require_constants();
    var _0x9b0a72 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0];
    function _0x12e20e(_0x3ab65b) {
      return _0x3ab65b >= 1000 && _0x3ab65b <= 1014 && _0x3ab65b !== 1004 && _0x3ab65b !== 1005 && _0x3ab65b !== 1006 || _0x3ab65b >= 3000 && _0x3ab65b <= 4999;
    }
    function _0x1bd8a5(_0x26fe55) {
      const _0x467aa7 = _0x26fe55.length;
      let _0x4fb696 = 0;
      while (_0x4fb696 < _0x467aa7) {
        if ((_0x26fe55[_0x4fb696] & 128) === 0) {
          _0x4fb696++;
        } else if ((_0x26fe55[_0x4fb696] & 224) === 192) {
          if (_0x4fb696 + 1 === _0x467aa7 || (_0x26fe55[_0x4fb696 + 1] & 192) !== 128 || (_0x26fe55[_0x4fb696] & 254) === 192) {
            return false;
          }
          _0x4fb696 += 2;
        } else if ((_0x26fe55[_0x4fb696] & 240) === 224) {
          if (_0x4fb696 + 2 >= _0x467aa7 || (_0x26fe55[_0x4fb696 + 1] & 192) !== 128 || (_0x26fe55[_0x4fb696 + 2] & 192) !== 128 || _0x26fe55[_0x4fb696] === 224 && (_0x26fe55[_0x4fb696 + 1] & 224) === 128 || _0x26fe55[_0x4fb696] === 237 && (_0x26fe55[_0x4fb696 + 1] & 224) === 160) {
            return false;
          }
          _0x4fb696 += 3;
        } else if ((_0x26fe55[_0x4fb696] & 248) === 240) {
          if (_0x4fb696 + 3 >= _0x467aa7 || (_0x26fe55[_0x4fb696 + 1] & 192) !== 128 || (_0x26fe55[_0x4fb696 + 2] & 192) !== 128 || (_0x26fe55[_0x4fb696 + 3] & 192) !== 128 || _0x26fe55[_0x4fb696] === 240 && (_0x26fe55[_0x4fb696 + 1] & 240) === 128 || _0x26fe55[_0x4fb696] === 244 && _0x26fe55[_0x4fb696 + 1] > 143 || _0x26fe55[_0x4fb696] > 244) {
            return false;
          }
          _0x4fb696 += 4;
        } else {
          return false;
        }
      }
      return true;
    }
    function _0x197f8e(_0x15126d) {
      return _0x9fb7c2 && typeof _0x15126d === "object" && typeof _0x15126d.arrayBuffer === "function" && typeof _0x15126d.type === "string" && typeof _0x15126d.stream === "function" && (_0x15126d[Symbol.toStringTag] === "Blob" || _0x15126d[Symbol.toStringTag] === "File");
    }
    var _0x2122e5 = {
      isBlob: _0x197f8e,
      isValidStatusCode: _0x12e20e,
      isValidUTF8: _0x1bd8a5,
      tokenChars: _0x9b0a72
    };
    _0x4d5dc0.exports = _0x2122e5;
    if (_0xcbf8e9) {
      _0x4d5dc0.exports.isValidUTF8 = function (_0x587ca9) {
        if (_0x587ca9.length < 24) {
          return _0x1bd8a5(_0x587ca9);
        } else {
          return _0xcbf8e9(_0x587ca9);
        }
      };
    } else if (!process.env.WS_NO_UTF_8_VALIDATE) {
      try {
        const _0x12e1b8 = require("utf-8-validate");
        _0x4d5dc0.exports.isValidUTF8 = function (_0x5523a1) {
          if (_0x5523a1.length < 32) {
            return _0x1bd8a5(_0x5523a1);
          } else {
            return _0x12e1b8(_0x5523a1);
          }
        };
      } catch (_0x2dfb1f) {}
    }
  }
});
var {
  tokenChars
} = require_validation();
function parse(_0x1565c3) {
  const _0x3eb34d = new Set();
  let _0x371f21 = -1;
  let _0x4afdf2 = -1;
  let _0x211d6a = 0;
  for (_0x211d6a; _0x211d6a < _0x1565c3.length; _0x211d6a++) {
    const _0x2b98f6 = _0x1565c3.charCodeAt(_0x211d6a);
    if (_0x4afdf2 === -1 && tokenChars[_0x2b98f6] === 1) {
      if (_0x371f21 === -1) {
        _0x371f21 = _0x211d6a;
      }
    } else if (_0x211d6a !== 0 && (_0x2b98f6 === 32 || _0x2b98f6 === 9)) {
      if (_0x4afdf2 === -1 && _0x371f21 !== -1) {
        _0x4afdf2 = _0x211d6a;
      }
    } else if (_0x2b98f6 === 44) {
      if (_0x371f21 === -1) {
        throw new SyntaxError("Unexpected character at index " + _0x211d6a);
      }
      if (_0x4afdf2 === -1) {
        _0x4afdf2 = _0x211d6a;
      }
      const _0x558377 = _0x1565c3.slice(_0x371f21, _0x4afdf2);
      if (_0x3eb34d.has(_0x558377)) {
        throw new SyntaxError("The \"" + _0x558377 + "\" subprotocol is duplicated");
      }
      _0x3eb34d.add(_0x558377);
      _0x371f21 = _0x4afdf2 = -1;
    } else {
      throw new SyntaxError("Unexpected character at index " + _0x211d6a);
    }
  }
  if (_0x371f21 === -1 || _0x4afdf2 !== -1) {
    throw new SyntaxError("Unexpected end of input");
  }
  const _0x1d239f = _0x1565c3.slice(_0x371f21, _0x211d6a);
  if (_0x3eb34d.has(_0x1d239f)) {
    throw new SyntaxError("The \"" + _0x1d239f + "\" subprotocol is duplicated");
  }
  _0x3eb34d.add(_0x1d239f);
  return _0x3eb34d;
}
var _0x18f94a = {
  parse: parse
};
module.exports = _0x18f94a;