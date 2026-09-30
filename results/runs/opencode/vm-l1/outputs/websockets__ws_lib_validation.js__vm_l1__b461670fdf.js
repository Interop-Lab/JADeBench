'use strict';

const { isUtf8 } = require('buffer');

const hasBlob = typeof Blob !== 'undefined';

// Lookup table for the HTTP token characters defined by RFC 7230.
const tokenChars = new Array(128).fill(0);
for (const character of "!#$%&'*+-.^_`|~0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz") {
  tokenChars[character.charCodeAt(0)] = 1;
}

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

function isValidUTF8Fallback(buffer) {
  const length = buffer.length;
  let index = 0;

  while (index < length) {
    const firstByte = buffer[index];

    if ((firstByte & 0x80) === 0) {
      index++;
      continue;
    }

    if ((firstByte & 0xe0) === 0xc0) {
      if (
        index + 1 === length ||
        (buffer[index + 1] & 0xc0) !== 0x80 ||
        (firstByte & 0xfe) === 0xc0
      ) {
        return false;
      }
      index += 2;
      continue;
    }

    if ((firstByte & 0xf0) === 0xe0) {
      if (
        index + 2 >= length ||
        (buffer[index + 1] & 0xc0) !== 0x80 ||
        (buffer[index + 2] & 0xc0) !== 0x80 ||
        (firstByte === 0xe0 && (buffer[index + 1] & 0xe0) === 0x80) ||
        (firstByte === 0xed && (buffer[index + 1] & 0xe0) === 0xa0)
      ) {
        return false;
      }
      index += 3;
      continue;
    }

    if ((firstByte & 0xf8) === 0xf0) {
      if (
        index + 3 >= length ||
        (buffer[index + 1] & 0xc0) !== 0x80 ||
        (buffer[index + 2] & 0xc0) !== 0x80 ||
        (buffer[index + 3] & 0xc0) !== 0x80 ||
        (firstByte === 0xf0 && (buffer[index + 1] & 0xf0) === 0x80) ||
        (firstByte === 0xf4 && buffer[index + 1] > 0x8f) ||
        firstByte > 0xf4
      ) {
        return false;
      }
      index += 4;
      continue;
    }

    return false;
  }

  return true;
}

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
  isValidUTF8: isValidUTF8Fallback,
  tokenChars
};

if (isUtf8) {
  module.exports.isValidUTF8 = function isValidUTF8(buffer) {
    return buffer.length < 24 ? isValidUTF8Fallback(buffer) : isUtf8(buffer);
  };
} else if (!process.env.WS_NO_UTF_8_VALIDATE) {
  try {
    const isValidUTF8 = require('utf-8-validate');

    module.exports.isValidUTF8 = function validateUTF8(buffer) {
      return buffer.length < 32
        ? isValidUTF8Fallback(buffer)
        : isValidUTF8(buffer);
    };
  } catch {
    // The optional native validator is not installed.
  }
}
