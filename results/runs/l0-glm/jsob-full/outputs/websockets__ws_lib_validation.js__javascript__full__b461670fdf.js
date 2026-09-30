'use strict';

var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (callback, module) => function() {
  return module || (module = { exports: {} }), callback(module, module.exports), module.exports;
};

var require_constants = __commonJS({'../work/websockets__ws/lib/constants.js'(_0x2c3022, exports) {
  'use strict';
  var hasBlob = typeof Blob !== 'undefined';
  var binaryTypes = ['nodebuffer', 'arraybuffer', 'fragments'];
  if (hasBlob) binaryTypes.push('blob');
  exports = {
    BINARY_TYPES: binaryTypes,
    CLOSE_TIMEOUT: 30000,
    EMPTY_BUFFER: Buffer.alloc(0),
    GUID: '258EAFA5-E914-47DA-95CA-C5AB0DC85B11',
    hasBlob: hasBlob,
    kForOnEventAttribute: Symbol('kForOnEventAttribute'),
    kListener: Symbol('kListener'),
    kStatusCode: Symbol('kStatusCode'),
    kWebSocket: Symbol('kWebSocket'),
    NOOP: () => {}
  };
}});

var { isUtf8 } = require('buffer');
var { hasBlob } = require_constants();

var tokenChars = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0,
  0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0
];

function isValidStatusCode(code) {
  return (code >= 1000 && code <= 1015 && code !== 1004 && code !== 1005 && code !== 1006) || (code >= 3000 && code <= 4999);
}

function _isValidUTF8(buf) {
  const len = buf.length;
  let i = 0;
  while (i < len) {
    if ((buf[i] & 0x80) === 0) {
      i++;
    } else if ((buf[i] & 0xe0) === 0xc0) {
      if (i + 1 === len || (buf[i + 1] & 0xc0) !== 0x80 || (buf[i] & 0xfe) === 0xc0) {
        return false;
      }
      i += 2;
    } else if ((buf[i] & 0xf0) === 0xe0) {
      if (i + 2 >= len || (buf[i + 1] & 0xc0) !== 0x80 || (buf[i + 2] & 0xc0) !== 0x80 || buf[i] === 0xe0 && (buf[i + 1] & 0xe0) === 0x80 || buf[i] === 0xed && (buf[i + 1] & 0xe0) === 0xa0) {
        return false;
      }
      i += 3;
    } else if ((buf[i] & 0xf8) === 0xf0) {
      if (i + 3 >= len || (buf[i + 1] & 0xc0) !== 0x80 || (buf[i + 2] & 0xc0) !== 0x80 || (buf[i + 3] & 0xc0) !== 0x80 || buf[i] > 0xf4 || buf[i] === 0xf0 && (buf[i + 1] & 0xf0) === 0x80 || buf[i] === 0xf4 && (buf[i + 1] & 0xf0) > 0x80) {
        return false;
      }
      i += 4;
    } else {
      return false;
    }
  }
  return true;
}

function isBlob(object) {
  return hasBlob && typeof object === 'object' && typeof object.arrayBuffer === 'function' && typeof object.stream === 'function' && typeof object.text === 'function' && (object[Symbol.toStringTag] === 'Blob' || object[Symbol.toStringTag] === 'File');
}

var validation = {};
validation.isBlob = isBlob;
validation.isValidStatusCode = isValidStatusCode;
validation.isValidUTF8 = _isValidUTF8;
validation.tokenChars = tokenChars;

module.exports = validation;

if (isUtf8) {
  module.exports.isValidUTF8 = function(buf) {
    return buf.length < 32 ? _isValidUTF8(buf) : isUtf8(buf);
  };
} else {
  if (!process.env.WS_NO_UTF_8_VALIDATE) {
    try {
      const isValidUTF8 = require('utf-8-validate');
      module.exports.isValidUTF8 = function(buf) {
        return buf.length < 32 ? _isValidUTF8(buf) : isValidUTF8(buf);
      };
    } catch (e) {
    }
  }
}
