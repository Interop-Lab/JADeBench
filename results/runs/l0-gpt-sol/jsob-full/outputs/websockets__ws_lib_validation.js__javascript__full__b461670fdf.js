'use strict';

const { isUtf8 } = require('buffer');

const BINARY_TYPES = ['nodebuffer', 'arraybuffer', 'fragments'];
const hasBlob = typeof Blob !== 'undefined';

if (hasBlob) BINARY_TYPES.push('blob');

const constants = {
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
        (buffer[index] === 0xe0 &&
          (buffer[index + 1] & 0xe0) === 0x80) ||
        (buffer[index] === 0xed &&
          (buffer[index + 1] & 0xe0) === 0xa0)
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
        (buffer[index] === 0xf0 &&
          (buffer[index + 1] & 0xf0) === 0x80) ||
        (buffer[index] === 0xf4 &&
          (buffer[index + 1] & 0xf0) > 0x80) ||
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

function isBlob(value) {
  return (
    constants.hasBlob &&
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
  module.exports.isValidUTF8 = function isValidUTF8(buffer) {
    return buffer.length < 24 ? _isValidUTF8(buffer) : isUtf8(buffer);
  };
} else if (!process.env.WS_NO_UTF_8_VALIDATE) {
  try {
    const isValidUTF8 = require('utf-8-validate');

    module.exports.isValidUTF8 = function validateUTF8(buffer) {
      return buffer.length < 32 ? _isValidUTF8(buffer) : isValidUTF8(buffer);
    };
  } catch (error) {}
}
