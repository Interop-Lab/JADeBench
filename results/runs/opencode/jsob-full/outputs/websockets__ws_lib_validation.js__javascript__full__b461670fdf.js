'use strict';

const { isUtf8 } = require('buffer');

const hasBlob = typeof Blob !== 'undefined';

const tokenChars = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0,
  0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0
];

/**
 * Returns whether `code` is a valid WebSocket close status code.
 *
 * @param {number} code The status code to test
 * @returns {boolean}
 */
function isValidStatusCode(code) {
  return (
    (code >= 1000 &&
      code <= 1014 &&
      code !== 1004 &&
      code !== 1005 &&
      code !== 1006) ||
    (code >= 3000 && code <= 4999)
  );
}

/**
 * Validates a buffer as UTF-8 without using a native extension.
 *
 * @param {Buffer|Uint8Array} buf The bytes to validate
 * @returns {boolean}
 */
function _isValidUTF8(buf) {
  const length = buf.length;
  let index = 0;

  while (index < length) {
    if ((buf[index] & 0x80) === 0) {
      index++;
    } else if ((buf[index] & 0xe0) === 0xc0) {
      if (
        index + 1 === length ||
        (buf[index + 1] & 0xc0) !== 0x80 ||
        (buf[index] & 0xfe) === 0xc0
      ) {
        return false;
      }

      index += 2;
    } else if ((buf[index] & 0xf0) === 0xe0) {
      if (
        index + 2 >= length ||
        (buf[index + 1] & 0xc0) !== 0x80 ||
        (buf[index + 2] & 0xc0) !== 0x80 ||
        (buf[index] === 0xe0 && (buf[index + 1] & 0xe0) === 0x80) ||
        (buf[index] === 0xed && (buf[index + 1] & 0xe0) === 0xa0)
      ) {
        return false;
      }

      index += 3;
    } else if ((buf[index] & 0xf8) === 0xf0) {
      if (
        index + 3 >= length ||
        (buf[index + 1] & 0xc0) !== 0x80 ||
        (buf[index + 2] & 0xc0) !== 0x80 ||
        (buf[index + 3] & 0xc0) !== 0x80 ||
        (buf[index] === 0xf0 && (buf[index + 1] & 0xf0) === 0x80) ||
        (buf[index] === 0xf4 && buf[index + 1] > 0x8f) ||
        buf[index] > 0xf4
      ) {
        return false;
      }

      index += 4;
    } else {
      return false;
    }
  }

  return true;
}

/**
 * Returns whether a value implements the Blob interface.
 *
 * @param {*} value The value to test
 * @returns {boolean}
 */
function isBlob(value) {
  return (
    hasBlob &&
    typeof value === 'object' &&
    typeof value.arrayBuffer === 'function' &&
    typeof value.type === 'string' &&
    typeof value.stream === 'function' &&
    (value[Symbol.toStringTag] === 'Blob' ||
      value[Symbol.toStringTag] === 'File')
  );
}

module.exports = {
  isBlob,
  isValidStatusCode,
  isValidUTF8: _isValidUTF8,
  tokenChars
};

if (isUtf8) {
  module.exports.isValidUTF8 = function isValidUTF8(buf) {
    return buf.length < 24 ? _isValidUTF8(buf) : isUtf8(buf);
  };
} else if (!process.env.WS_NO_UTF_8_VALIDATE) {
  try {
    const isValidUTF8 = require('utf-8-validate');

    module.exports.isValidUTF8 = function validateUTF8(buf) {
      return buf.length < 32 ? _isValidUTF8(buf) : isValidUTF8(buf);
    };
  } catch (error) {
    // The optional native validator is not installed.
  }
}
