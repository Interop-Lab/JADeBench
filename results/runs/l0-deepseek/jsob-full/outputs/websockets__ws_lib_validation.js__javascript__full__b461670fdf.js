'use strict';

const __getOwnPropNames = Object.getOwnPropertyNames;
const __commonJS = (cb, mod) => function __require() {
  const module = { exports: {} };
  cb(module.exports, module);
  return module.exports;
};

const require_constants = __commonJS((exports, module) => {
  'use strict';

  const BINARY_TYPES = ['nodebuffer', 'arraybuffer', 'fragments'];
  const hasBlob = typeof Blob !== 'undefined';

  if (hasBlob) BINARY_TYPES.push('blob');

  module.exports = {
    BINARY_TYPES,
    CLOSE_TIMEOUT: 30000,
    EMPTY_BUFFER: Buffer.alloc(0),
    GUID: '258EAFA5-E914-47DA-95CA-C5AB0DC85B11',
    hasBlob,
    kForOnEventAttribute: Symbol('kIsForOnEventAttribute'),
    kListener: Symbol('kListener'),
    kStatusCode: Symbol('kStatusCode'),
    kWebSocket: Symbol('kWebSocket'),
    NOOP: () => {}
  };
});

const { isUtf8 } = require('buffer');
const { hasBlob } = require_constants();

const tokenChars = [
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
  return (
    (code >= 1000 && code <= 1014 && code !== 1004 && code !== 1005 && code !== 1006) ||
    (code >= 3000 && code <= 4999)
  );
}

function _isValidUTF8(buf) {
  const len = buf.length;
  let i = 0;

  while (i < len) {
    if ((buf[i] & 0x80) === 0x00) {
      i++;
    } else if ((buf[i] & 0xe0) === 0xc0) {
      if (
        i + 1 === len ||
        (buf[i + 1] & 0xc0) !== 0x80 ||
        (buf[i] & 0xfe) === 0xc0
      ) {
        return false;
      }
      i += 2;
    } else if ((buf[i] & 0xf0) === 0xe0) {
      if (
        i + 2 >= len ||
        (buf[i + 1] & 0xc0) !== 0x80 ||
        (buf[i + 2] & 0xc0) !== 0x80 ||
        (buf[i] === 0xe0 && (buf[i + 1] & 0xe0) === 0x80) ||
        (buf[i] === 0xed && (buf[i + 1] & 0xe0) === 0xa0)
      ) {
        return false;
      }
      i += 3;
    } else if ((buf[i] & 0xf8) === 0xf0) {
      if (
        i + 3 >= len ||
        (buf[i + 1] & 0xc0) !== 0x80 ||
        (buf[i + 2] & 0xc0) !== 0x80 ||
        (buf[i + 3] & 0xc0) !== 0x80 ||
        (buf[i] === 0xf0 && (buf[i + 1] & 0xf0) === 0x80) ||
        (buf[i] === 0xf4 && buf[i + 1] > 0x8f) ||
        buf[i] > 0xf4
      ) {
        return false;
      }
      i += 4;
    } else {
      return false;
    }
  }

  return true;
}

function isBlob(value) {
  return (
    hasBlob &&
    typeof value === 'object' &&
    typeof value.size === 'number' &&
    typeof value.type === 'string' &&
    typeof value.slice === 'function' &&
    (value[Symbol.toStringTag] === 'Blob' || value[Symbol.toStringTag] === 'File')
  );
}

module.exports = {
  isBlob,
  isValidStatusCode,
  isValidUTF8: _isValidUTF8,
  tokenChars
};

if (isUtf8) {
  module.exports.isValidUTF8 = function(buf) {
    return buf.length < 24 ? _isValidUTF8(buf) : isUtf8(buf);
  };
} else {
  if (!process.env.WS_NO_UTF_8_VALIDATE) {
    try {
      const isValidUTF8 = require('utf-8-validate');
      module.exports.isValidUTF8 = function(buf) {
        return buf.length < 24 ? _isValidUTF8(buf) : isValidUTF8(buf);
      };
    } catch (e) {}
  }
}
