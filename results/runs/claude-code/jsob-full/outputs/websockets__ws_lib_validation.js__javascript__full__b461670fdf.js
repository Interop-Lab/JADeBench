'use strict';

const { isUtf8 } = require('buffer');

const hasBlob = typeof Blob !== 'undefined';

// Lookup table for characters allowed in an HTTP token (RFC 9110, section 5.6.2).
const tokenChars = Array(128).fill(0);
for (const character of "!#$%&'*+-.^_`|~0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz") {
  tokenChars[character.charCodeAt(0)] = 1;
}

/**
 * Determine whether a WebSocket close status code may appear on the wire.
 *
 * @param {number} code The status code
 * @returns {boolean} Whether the status code is valid
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
 * Validate that a buffer contains only well-formed UTF-8.
 *
 * @param {Buffer} buffer The buffer to validate
 * @returns {boolean} Whether the buffer contains valid UTF-8
 */
function isValidUTF8Fallback(buffer) {
  const length = buffer.length;
  let index = 0;

  while (index < length) {
    if ((buffer[index] & 0x80) === 0) {
      index++;
    } else if ((buffer[index] & 0xe0) === 0xc0) {
      if (
        index + 1 === length ||
        (buffer[index + 1] & 0xc0) !== 0x80 ||
        (buffer[index] & 0xfe) === 0xc0
      ) {
        return false;
      }

      index += 2;
    } else if ((buffer[index] & 0xf0) === 0xe0) {
      if (
        index + 2 >= length ||
        (buffer[index + 1] & 0xc0) !== 0x80 ||
        (buffer[index + 2] & 0xc0) !== 0x80 ||
        (buffer[index] === 0xe0 && (buffer[index + 1] & 0xe0) === 0x80) ||
        (buffer[index] === 0xed && (buffer[index + 1] & 0xe0) === 0xa0)
      ) {
        return false;
      }

      index += 3;
    } else if ((buffer[index] & 0xf8) === 0xf0) {
      if (
        index + 3 >= length ||
        (buffer[index + 1] & 0xc0) !== 0x80 ||
        (buffer[index + 2] & 0xc0) !== 0x80 ||
        (buffer[index + 3] & 0xc0) !== 0x80 ||
        (buffer[index] === 0xf0 && (buffer[index + 1] & 0xf0) === 0x80) ||
        (buffer[index] === 0xf4 && buffer[index + 1] > 0x8f) ||
        buffer[index] > 0xf4
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
 * Determine whether a value implements the Blob interface.
 *
 * @param {*} value The value to inspect
 * @returns {boolean} Whether the value is a Blob or File
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

const validation = {
  isBlob,
  isValidStatusCode,
  isValidUTF8: isValidUTF8Fallback,
  tokenChars
};

module.exports = validation;

if (isUtf8) {
  validation.isValidUTF8 = function isValidUTF8(buffer) {
    return buffer.length < 24 ? isValidUTF8Fallback(buffer) : isUtf8(buffer);
  };
} else if (!process.env.WS_NO_UTF_8_VALIDATE) {
  try {
    const isValidUTF8Native = require('utf-8-validate');

    validation.isValidUTF8 = function isValidUTF8(buffer) {
      return buffer.length < 32
        ? isValidUTF8Fallback(buffer)
        : isValidUTF8Native(buffer);
    };
  } catch {
    // The optional native validator is not installed.
  }
}
