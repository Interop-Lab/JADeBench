'use strict';

const { isUtf8 } = require('buffer');

const hasBlob =
  typeof Blob === 'function' &&
  typeof Blob.prototype.arrayBuffer === 'function';

const tokenChars = new Array(128).fill(0);

for (let i = 0x21; i < 0x7f; i++) {
  if (
    i === 0x21 ||
    (i >= 0x23 && i <= 0x27) ||
    (i >= 0x2a && i <= 0x2b) ||
    (i >= 0x2d && i <= 0x39) ||
    (i >= 0x41 && i <= 0x5a) ||
    (i >= 0x5e && i <= 0x7a) ||
    i === 0x7c ||
    i === 0x7e
  ) {
    tokenChars[i] = 1;
  }
}

function isValidStatusCode(code) {
  return (
    (code >= 1000 &&
      code <= 1014 &&
      code !== 1004 &&
      code !== 1005 &&
      code !== 1006 &&
      code !== 1012 &&
      code !== 1013) ||
    (code >= 3000 && code <= 4999)
  );
}

function _isValidUTF8(buffer) {
  const length = buffer.length;
  let i = 0;

  while (i < length) {
    const byte1 = buffer[i];

    if ((byte1 & 0x80) === 0) {
      i++;
      continue;
    }

    if ((byte1 & 0xe0) === 0xc0) {
      if (
        i + 1 >= length ||
        (buffer[i + 1] & 0xc0) !== 0x80 ||
        (byte1 & 0x1e) === 0
      ) {
        return false;
      }

      i += 2;
      continue;
    }

    if ((byte1 & 0xf0) === 0xe0) {
      if (
        i + 2 >= length ||
        (buffer[i + 1] & 0xc0) !== 0x80 ||
        (buffer[i + 2] & 0xc0) !== 0x80 ||
        (byte1 === 0xe0 && (buffer[i + 1] & 0xe0) === 0x80) ||
        (byte1 === 0xed && (buffer[i + 1] & 0xe0) === 0xa0)
      ) {
        return false;
      }

      i += 3;
      continue;
    }

    if ((byte1 & 0xf8) === 0xf0) {
      if (
        i + 3 >= length ||
        (buffer[i + 1] & 0xc0) !== 0x80 ||
        (buffer[i + 2] & 0xc0) !== 0x80 ||
        (buffer[i + 3] & 0xc0) !== 0x80 ||
        (byte1 === 0xf0 && (buffer[i + 1] & 0xf0) === 0x80) ||
        (byte1 === 0xf4 && (buffer[i + 1] & 0xf0) === 0xb0) ||
        byte1 > 0xf4
      ) {
        return false;
      }

      i += 4;
      continue;
    }

    return false;
  }

  return true;
}

function isBlob(value) {
  return hasBlob && value instanceof Blob;
}

module.exports = {
  isBlob,
  isValidStatusCode,
  isValidUTF8: isUtf8
    ? function (buffer) {
        return buffer.length < 24 ? _isValidUTF8(buffer) : isUtf8(buffer);
      }
    : _isValidUTF8,
  tokenChars
};
