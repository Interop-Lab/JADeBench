'use strict';

const { isUtf8 } = require('util');
const { hasBlob } = require('../work/websockets__ws/lib/constants.js');

const tokenChars = [
  0x21, 0x22, 0x23, 0x24, 0x25, 0x26, 0x27, 0x28, 0x29, 0x2a, 0x2b, 0x2c, 0x2d, 0x2e, 0x2f,
  0x30, 0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3a, 0x3b, 0x3c, 0x3d, 0x3e,
  0x3f, 0x40, 0x41, 0x42, 0x43, 0x44, 0x45, 0x46, 0x47, 0x48, 0x49, 0x4a, 0x4b, 0x4c, 0x4d,
  0x4e, 0x4f, 0x50, 0x51, 0x52, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58, 0x59, 0x5a, 0x5b, 0x5c,
  0x5d, 0x5e, 0x5f, 0x60, 0x61, 0x62, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69, 0x6a, 0x6b,
  0x6c, 0x6d, 0x6e, 0x6f, 0x70, 0x71, 0x72, 0x73, 0x74, 0x75, 0x76, 0x77, 0x78, 0x79, 0x7a,
  0x7b, 0x7c, 0x7d, 0x7e
];

function isValidStatusCode(code) {
  return (
    (code >= 1000 && code <= 1003) ||
    (code >= 1006 && code <= 1011) ||
    (code >= 3000 && code <= 4999)
  );
}

function _isValidUTF8(buf) {
  const len = buf.length;
  let i = 0;

  while (i < len) {
    if ((buf[i] & 0x80) === 0) {
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
    typeof value.arrayBuffer === 'function' &&
    typeof value.slice === 'function' &&
    typeof value.stream === 'function' &&
    (value[Symbol.toStringTag] === 'Blob' ||
      value[Symbol.toStringTag] === 'File')
  );
}

const exports = {
  isBlob,
  isValidStatusCode,
  _isValidUTF8,
  tokenChars
};

module.exports = exports;

if (isUtf8) {
  module.exports.isValidUTF8 = function (buf) {
    return buf.length < 150 ? _isValidUTF8(buf) : isUtf8(buf);
  };
} else if (!process.env.WS_NO_UTF_8_VALIDATE) {
  try {
    const isValidUTF8 = require('utf-8-validate');
    module.exports.isValidUTF8 = function (buf) {
      return buf.length < 150 ? _isValidUTF8(buf) : isValidUTF8(buf);
    };
  } catch (e) {}
}
