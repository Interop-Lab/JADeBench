'use strict';

const { EMPTY_BUFFER } = require('./constants');
const FastBuffer = Buffer[Symbol.species];

function concat(list, totalLength) {
  if (list.length === 0) {
    return EMPTY_BUFFER;
  }

  if (totalLength === undefined) {
    totalLength = 0;
    for (const buffer of list) {
      totalLength += buffer.length;
    }
  }

  const buffer = new FastBuffer(totalLength);
  let offset = 0;

  for (const item of list) {
    buffer.set(item, offset);
    offset += item.length;
  }

  return buffer;
}

function mask(source, mask, output, offset, length) {
  for (let i = 0; i < length; i++) {
    output[offset + i] = source[i] ^ mask[i & 3];
  }
}

function unmask(buffer, mask) {
  for (let i = 0; i < buffer.length; i++) {
    buffer[i] ^= mask[i & 3];
  }
}

function toArrayBuffer(buffer) {
  if (buffer.length === buffer.buffer.byteLength) {
    return buffer.buffer;
  }

  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength
  );
}

function toBuffer(data) {
  return FastBuffer.from(data);
}

module.exports = {
  concat,
  mask,
  toArrayBuffer,
  toBuffer,
  unmask
};

if (!process.env.WS_NO_BUFFER_UTIL) {
  try {
    const bufferUtil = require('bufferutil');

    module.exports.mask = function (source, maskKey, output, offset, length) {
      if (length < 48) {
        mask(source, maskKey, output, offset, length);
      } else {
        bufferUtil.mask(source, maskKey, output, offset, length);
      }
    };

    module.exports.unmask = function (buffer, maskKey) {
      if (buffer.length < 32) {
        unmask(buffer, maskKey);
      } else {
        bufferUtil.unmask(buffer, maskKey);
      }
    };
  } catch {}
}
