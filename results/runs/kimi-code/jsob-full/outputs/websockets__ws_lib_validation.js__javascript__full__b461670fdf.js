'use strict';

const { isUtf8 } = require('buffer');

const hasBlob = typeof Blob !== 'undefined';

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
    (code >= 1000 &&
      code <= 1014 &&
      code !== 1004 &&
      code !== 1005 &&
      code !== 1006) ||
    (code >= 3000 && code <= 4999)
  );
}

function _isValidUTF8(buffer) {
  let index = 0;

  while (index < buffer.length) {
    if ((buffer[index] & 0x80) === 0) {
      index++;
    } else if ((buffer[index] & 0xe0) === 0xc0) {
      if (
        buffer[index] < 0xc2 ||
        (buffer[index + 1] & 0xc0) !== 0x80
      ) {
        return false;
      }
      index += 2;
    } else if ((buffer[index] & 0xf0) === 0xe0) {
      if (
        (buffer[index + 1] & 0xc0) !== 0x80 ||
        (buffer[index + 2] & 0xc0) !== 0x80 ||
        (buffer[index] === 0xe0 && buffer[index + 1] < 0xa0) ||
        (buffer[index] === 0xed && buffer[index + 1] >= 0xa0)
      ) {
        return false;
      }
      index += 3;
    } else if ((buffer[index] & 0xf8) === 0xf0) {
      if (
        buffer[index] > 0xf4 ||
        (buffer[index + 1] & 0xc0) !== 0x80 ||
        (buffer[index + 2] & 0xc0) !== 0x80 ||
        (buffer[index + 3] & 0xc0) !== 0x80 ||
        (buffer[index] === 0xf0 && buffer[index + 1] < 0x90) ||
        (buffer[index] === 0xf4 && buffer[index + 1] >= 0x90)
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

function isBlob(value) {
  return (
    hasBlob &&
    typeof value === 'object' &&
    typeof value.arrayBuffer === 'function' &&
    typeof value.stream === 'function' &&
    typeof value.type === 'string' &&
    (value[Symbol.toStringTag] === 'Blob' ||
      value[Symbol.toStringTag] === 'File')
  );
}

module.exports = {
  isBlob,
  isValidStatusCode,
  _isValidUTF8,
  tokenChars
};

if (isUtf8) {
  module.exports._isValidUTF8 = function (buffer) {
    return buffer.length < 24 ? _isValidUTF8(buffer) : isUtf8(buffer);
  };
} else if (!process.env.WS_NO_UTF_8_VALIDATE) {
  try {
    const isValidUTF8 = require('utf-8-validate');

    module.exports._isValidUTF8 = function (buffer) {
      return buffer.length < 32 ? _isValidUTF8(buffer) : isValidUTF8(buffer);
    };
  } catch {
  }
}
