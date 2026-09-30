'use strict';

var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (_0x583594, _0x52806f) => function _0x45cf9d() {
  if (!_0x52806f) {
    (0, _0x583594[__getOwnPropNames(_0x583594)[0]])((_0x52806f = {
      exports: {}
    }).exports, _0x52806f);
  }
  return _0x52806f.exports;
};
var require_constants = __commonJS({
  "../work/websockets__ws/lib/constants.js"(_0x21cab8, _0x42b75f) {
    'use strict';

    "use strict";
    var _0x5443bb = ["nodebuffer", "arraybuffer", "fragments"];
    var _0x43a98a = typeof Blob !== "undefined";
    if (_0x43a98a) {
      _0x5443bb.push("blob");
    }
    _0x42b75f.exports = {
      BINARY_TYPES: _0x5443bb,
      CLOSE_TIMEOUT: 30000,
      EMPTY_BUFFER: Buffer.alloc(0),
      GUID: "258EAFA5-E914-47DA-95CA-C5AB0DC85B11",
      hasBlob: _0x43a98a,
      kForOnEventAttribute: Symbol("kIsForOnEventAttribute"),
      kListener: Symbol("kListener"),
      kStatusCode: Symbol("status-code"),
      kWebSocket: Symbol("websocket"),
      NOOP: () => {}
    };
  }
});
var require_validation = __commonJS({
  "../work/websockets__ws/lib/validation.js"(_0x13d13a, _0x37a0a8) {
    'use strict';

    var {
      isUtf8: _0x2ccb55
    } = require("buffer");
    var {
      hasBlob: _0x328d1b
    } = require_constants();
    var _0x2e78c0 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0];
    function _0x39b0e9(_0x21f637) {
      return _0x21f637 >= 1000 && _0x21f637 <= 1014 && _0x21f637 !== 1004 && _0x21f637 !== 1005 && _0x21f637 !== 1006 || _0x21f637 >= 3000 && _0x21f637 <= 4999;
    }
    function _0x5e384a(_0x2e1bce) {
      const _0x207e89 = _0x2e1bce.length;
      let _0x4b0d22 = 0;
      while (_0x4b0d22 < _0x207e89) {
        if ((_0x2e1bce[_0x4b0d22] & 128) === 0) {
          _0x4b0d22++;
        } else if ((_0x2e1bce[_0x4b0d22] & 224) === 192) {
          if (_0x4b0d22 + 1 === _0x207e89 || (_0x2e1bce[_0x4b0d22 + 1] & 192) !== 128 || (_0x2e1bce[_0x4b0d22] & 254) === 192) {
            return false;
          }
          _0x4b0d22 += 2;
        } else if ((_0x2e1bce[_0x4b0d22] & 240) === 224) {
          if (_0x4b0d22 + 2 >= _0x207e89 || (_0x2e1bce[_0x4b0d22 + 1] & 192) !== 128 || (_0x2e1bce[_0x4b0d22 + 2] & 192) !== 128 || _0x2e1bce[_0x4b0d22] === 224 && (_0x2e1bce[_0x4b0d22 + 1] & 224) === 128 || _0x2e1bce[_0x4b0d22] === 237 && (_0x2e1bce[_0x4b0d22 + 1] & 224) === 160) {
            return false;
          }
          _0x4b0d22 += 3;
        } else if ((_0x2e1bce[_0x4b0d22] & 248) === 240) {
          if (_0x4b0d22 + 3 >= _0x207e89 || (_0x2e1bce[_0x4b0d22 + 1] & 192) !== 128 || (_0x2e1bce[_0x4b0d22 + 2] & 192) !== 128 || (_0x2e1bce[_0x4b0d22 + 3] & 192) !== 128 || _0x2e1bce[_0x4b0d22] === 240 && (_0x2e1bce[_0x4b0d22 + 1] & 240) === 128 || _0x2e1bce[_0x4b0d22] === 244 && _0x2e1bce[_0x4b0d22 + 1] > 143 || _0x2e1bce[_0x4b0d22] > 244) {
            return false;
          }
          _0x4b0d22 += 4;
        } else {
          return false;
        }
      }
      return true;
    }
    function _0xfef2e4(_0x2cc422) {
      return _0x328d1b && typeof _0x2cc422 === "object" && typeof _0x2cc422.arrayBuffer === "function" && typeof _0x2cc422.type === "string" && typeof _0x2cc422.stream === "function" && (_0x2cc422[Symbol.toStringTag] === "Blob" || _0x2cc422[Symbol.toStringTag] === "File");
    }
    const _0x3d8b39 = {
      isBlob: _0xfef2e4,
      isValidStatusCode: _0x39b0e9,
      isValidUTF8: _0x5e384a,
      tokenChars: _0x2e78c0
    };
    _0x37a0a8.exports = _0x3d8b39;
    if (_0x2ccb55) {
      _0x37a0a8.exports.isValidUTF8 = function (_0x5a9f68) {
        if (_0x5a9f68.length < 24) {
          return _0x5e384a(_0x5a9f68);
        } else {
          return _0x2ccb55(_0x5a9f68);
        }
      };
    } else if (!process.env.WS_NO_UTF_8_VALIDATE) {
      try {
        const _0x18fdfd = require("utf-8-validate");
        _0x37a0a8.exports.isValidUTF8 = function (_0x48d984) {
          if (_0x48d984.length < 32) {
            return _0x5e384a(_0x48d984);
          } else {
            return _0x18fdfd(_0x48d984);
          }
        };
      } catch (_0x175f4d) {}
    }
  }
});
var {
  tokenChars
} = require_validation();
function push(_0x5b60f0, _0xb2fda3, _0x4e28b3) {
  if (_0x5b60f0[_0xb2fda3] === undefined) {
    _0x5b60f0[_0xb2fda3] = [_0x4e28b3];
  } else {
    _0x5b60f0[_0xb2fda3].push(_0x4e28b3);
  }
}
function parse(_0x35aa84) {
  const _0x40b474 = Object.create(null);
  let _0x744e94 = Object.create(null);
  let _0x477662 = false;
  let _0x11c113 = false;
  let _0x473035 = false;
  let _0x139644;
  let _0x1dae9e;
  let _0x5eda62 = -1;
  let _0x1ce7c2 = -1;
  let _0x423399 = -1;
  let _0x5e5a13 = 0;
  for (; _0x5e5a13 < _0x35aa84.length; _0x5e5a13++) {
    _0x1ce7c2 = _0x35aa84.charCodeAt(_0x5e5a13);
    if (_0x139644 === undefined) {
      if (_0x423399 === -1 && tokenChars[_0x1ce7c2] === 1) {
        if (_0x5eda62 === -1) {
          _0x5eda62 = _0x5e5a13;
        }
      } else if (_0x5e5a13 !== 0 && (_0x1ce7c2 === 32 || _0x1ce7c2 === 9)) {
        if (_0x423399 === -1 && _0x5eda62 !== -1) {
          _0x423399 = _0x5e5a13;
        }
      } else if (_0x1ce7c2 === 59 || _0x1ce7c2 === 44) {
        if (_0x5eda62 === -1) {
          throw new SyntaxError("Unexpected character at index " + _0x5e5a13);
        }
        if (_0x423399 === -1) {
          _0x423399 = _0x5e5a13;
        }
        const _0x39b072 = _0x35aa84.slice(_0x5eda62, _0x423399);
        if (_0x1ce7c2 === 44) {
          push(_0x40b474, _0x39b072, _0x744e94);
          _0x744e94 = Object.create(null);
        } else {
          _0x139644 = _0x39b072;
        }
        _0x5eda62 = _0x423399 = -1;
      } else {
        throw new SyntaxError("Unexpected character at index " + _0x5e5a13);
      }
    } else if (_0x1dae9e === undefined) {
      if (_0x423399 === -1 && tokenChars[_0x1ce7c2] === 1) {
        if (_0x5eda62 === -1) {
          _0x5eda62 = _0x5e5a13;
        }
      } else if (_0x1ce7c2 === 32 || _0x1ce7c2 === 9) {
        if (_0x423399 === -1 && _0x5eda62 !== -1) {
          _0x423399 = _0x5e5a13;
        }
      } else if (_0x1ce7c2 === 59 || _0x1ce7c2 === 44) {
        if (_0x5eda62 === -1) {
          throw new SyntaxError("Unexpected character at index " + _0x5e5a13);
        }
        if (_0x423399 === -1) {
          _0x423399 = _0x5e5a13;
        }
        push(_0x744e94, _0x35aa84.slice(_0x5eda62, _0x423399), true);
        if (_0x1ce7c2 === 44) {
          push(_0x40b474, _0x139644, _0x744e94);
          _0x744e94 = Object.create(null);
          _0x139644 = undefined;
        }
        _0x5eda62 = _0x423399 = -1;
      } else if (_0x1ce7c2 === 61 && _0x5eda62 !== -1 && _0x423399 === -1) {
        _0x1dae9e = _0x35aa84.slice(_0x5eda62, _0x5e5a13);
        _0x5eda62 = _0x423399 = -1;
      } else {
        throw new SyntaxError("Unexpected character at index " + _0x5e5a13);
      }
    } else if (_0x11c113) {
      if (tokenChars[_0x1ce7c2] !== 1) {
        throw new SyntaxError("Unexpected character at index " + _0x5e5a13);
      }
      if (_0x5eda62 === -1) {
        _0x5eda62 = _0x5e5a13;
      } else if (!_0x477662) {
        _0x477662 = true;
      }
      _0x11c113 = false;
    } else if (_0x473035) {
      if (tokenChars[_0x1ce7c2] === 1) {
        if (_0x5eda62 === -1) {
          _0x5eda62 = _0x5e5a13;
        }
      } else if (_0x1ce7c2 === 34 && _0x5eda62 !== -1) {
        _0x473035 = false;
        _0x423399 = _0x5e5a13;
      } else if (_0x1ce7c2 === 92) {
        _0x11c113 = true;
      } else {
        throw new SyntaxError("Unexpected character at index " + _0x5e5a13);
      }
    } else if (_0x1ce7c2 === 34 && _0x35aa84.charCodeAt(_0x5e5a13 - 1) === 61) {
      _0x473035 = true;
    } else if (_0x423399 === -1 && tokenChars[_0x1ce7c2] === 1) {
      if (_0x5eda62 === -1) {
        _0x5eda62 = _0x5e5a13;
      }
    } else if (_0x5eda62 !== -1 && (_0x1ce7c2 === 32 || _0x1ce7c2 === 9)) {
      if (_0x423399 === -1) {
        _0x423399 = _0x5e5a13;
      }
    } else if (_0x1ce7c2 === 59 || _0x1ce7c2 === 44) {
      if (_0x5eda62 === -1) {
        throw new SyntaxError("Unexpected character at index " + _0x5e5a13);
      }
      if (_0x423399 === -1) {
        _0x423399 = _0x5e5a13;
      }
      let _0x42ff03 = _0x35aa84.slice(_0x5eda62, _0x423399);
      if (_0x477662) {
        _0x42ff03 = _0x42ff03.replace(/\\/g, "");
        _0x477662 = false;
      }
      push(_0x744e94, _0x1dae9e, _0x42ff03);
      if (_0x1ce7c2 === 44) {
        push(_0x40b474, _0x139644, _0x744e94);
        _0x744e94 = Object.create(null);
        _0x139644 = undefined;
      }
      _0x1dae9e = undefined;
      _0x5eda62 = _0x423399 = -1;
    } else {
      throw new SyntaxError("Unexpected character at index " + _0x5e5a13);
    }
  }
  if (_0x5eda62 === -1 || _0x473035 || _0x1ce7c2 === 32 || _0x1ce7c2 === 9) {
    throw new SyntaxError("Unexpected end of input");
  }
  if (_0x423399 === -1) {
    _0x423399 = _0x5e5a13;
  }
  const _0x192e3b = _0x35aa84.slice(_0x5eda62, _0x423399);
  if (_0x139644 === undefined) {
    push(_0x40b474, _0x192e3b, _0x744e94);
  } else {
    if (_0x1dae9e === undefined) {
      push(_0x744e94, _0x192e3b, true);
    } else if (_0x477662) {
      push(_0x744e94, _0x1dae9e, _0x192e3b.replace(/\\/g, ""));
    } else {
      push(_0x744e94, _0x1dae9e, _0x192e3b);
    }
    push(_0x40b474, _0x139644, _0x744e94);
  }
  return _0x40b474;
}
function format(_0x53affe) {
  return Object.keys(_0x53affe).map(_0x25d340 => {
    let _0x5acc09 = _0x53affe[_0x25d340];
    if (!Array.isArray(_0x5acc09)) {
      _0x5acc09 = [_0x5acc09];
    }
    return _0x5acc09.map(_0x5a6064 => {
      return [_0x25d340].concat(Object.keys(_0x5a6064).map(_0x7aae6f => {
        let _0x3e162c = _0x5a6064[_0x7aae6f];
        if (!Array.isArray(_0x3e162c)) {
          _0x3e162c = [_0x3e162c];
        }
        return _0x3e162c.map(_0x1f0ba3 => _0x1f0ba3 === true ? _0x7aae6f : _0x7aae6f + "=" + _0x1f0ba3).join("; ");
      })).join("; ");
    }).join(", ");
  }).join(", ");
}
const _0x587f58 = {
  format: format,
  parse: parse
};
module.exports = _0x587f58;