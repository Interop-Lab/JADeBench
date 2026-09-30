'use strict';

var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (_0x38cdfd, _0x26b7f5) => function _0x4238aa() {
  if (!_0x26b7f5) {
    (0, _0x38cdfd[__getOwnPropNames(_0x38cdfd)[0]])((_0x26b7f5 = {
      exports: {}
    }).exports, _0x26b7f5);
  }
  return _0x26b7f5.exports;
};
var require_constants = __commonJS({
  "../work/websockets__ws/lib/constants.js"(_0x2c3022, _0x1b7a9d) {
    'use strict';

    "use strict";
    var _0x5c4e4f = ["nodebuffer", "arraybuffer", "fragments"];
    var _0x420802 = typeof Blob !== "undefined";
    if (_0x420802) {
      _0x5c4e4f.push("blob");
    }
    _0x1b7a9d.exports = {
      BINARY_TYPES: _0x5c4e4f,
      CLOSE_TIMEOUT: 30000,
      EMPTY_BUFFER: Buffer.alloc(0),
      GUID: "258EAFA5-E914-47DA-95CA-C5AB0DC85B11",
      hasBlob: _0x420802,
      kForOnEventAttribute: Symbol("kIsForOnEventAttribute"),
      kListener: Symbol("kListener"),
      kStatusCode: Symbol("status-code"),
      kWebSocket: Symbol("websocket"),
      NOOP: () => {}
    };
  }
});
var {
  isUtf8
} = require("buffer");
var {
  hasBlob
} = require_constants();
var tokenChars = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0];
function isValidStatusCode(_0x5c137a) {
  return _0x5c137a >= 1000 && _0x5c137a <= 1014 && _0x5c137a !== 1004 && _0x5c137a !== 1005 && _0x5c137a !== 1006 || _0x5c137a >= 3000 && _0x5c137a <= 4999;
}
function _isValidUTF8(_0x541f96) {
  const _0x3d2f2e = _0x541f96.length;
  let _0xcced24 = 0;
  while (_0xcced24 < _0x3d2f2e) {
    if ((_0x541f96[_0xcced24] & 128) === 0) {
      _0xcced24++;
    } else if ((_0x541f96[_0xcced24] & 224) === 192) {
      if (_0xcced24 + 1 === _0x3d2f2e || (_0x541f96[_0xcced24 + 1] & 192) !== 128 || (_0x541f96[_0xcced24] & 254) === 192) {
        return false;
      }
      _0xcced24 += 2;
    } else if ((_0x541f96[_0xcced24] & 240) === 224) {
      if (_0xcced24 + 2 >= _0x3d2f2e || (_0x541f96[_0xcced24 + 1] & 192) !== 128 || (_0x541f96[_0xcced24 + 2] & 192) !== 128 || _0x541f96[_0xcced24] === 224 && (_0x541f96[_0xcced24 + 1] & 224) === 128 || _0x541f96[_0xcced24] === 237 && (_0x541f96[_0xcced24 + 1] & 224) === 160) {
        return false;
      }
      _0xcced24 += 3;
    } else if ((_0x541f96[_0xcced24] & 248) === 240) {
      if (_0xcced24 + 3 >= _0x3d2f2e || (_0x541f96[_0xcced24 + 1] & 192) !== 128 || (_0x541f96[_0xcced24 + 2] & 192) !== 128 || (_0x541f96[_0xcced24 + 3] & 192) !== 128 || _0x541f96[_0xcced24] === 240 && (_0x541f96[_0xcced24 + 1] & 240) === 128 || _0x541f96[_0xcced24] === 244 && _0x541f96[_0xcced24 + 1] > 143 || _0x541f96[_0xcced24] > 244) {
        return false;
      }
      _0xcced24 += 4;
    } else {
      return false;
    }
  }
  return true;
}
function isBlob(_0x34c862) {
  return hasBlob && typeof _0x34c862 === "object" && typeof _0x34c862.arrayBuffer === "function" && typeof _0x34c862.type === "string" && typeof _0x34c862.stream === "function" && (_0x34c862[Symbol.toStringTag] === "Blob" || _0x34c862[Symbol.toStringTag] === "File");
}
var _0x263a64 = {
  isBlob: isBlob,
  isValidStatusCode: isValidStatusCode,
  isValidUTF8: _isValidUTF8,
  tokenChars: tokenChars
};
module.exports = _0x263a64;
if (isUtf8) {
  module.exports.isValidUTF8 = function (_0x295215) {
    if (_0x295215.length < 24) {
      return _isValidUTF8(_0x295215);
    } else {
      return isUtf8(_0x295215);
    }
  };
} else if (!process.env.WS_NO_UTF_8_VALIDATE) {
  try {
    const isValidUTF8 = require("utf-8-validate");
    module.exports.isValidUTF8 = function (_0x5da36f) {
      if (_0x5da36f.length < 32) {
        return _isValidUTF8(_0x5da36f);
      } else {
        return isValidUTF8(_0x5da36f);
      }
    };
  } catch (_0x1fad1c) {}
}