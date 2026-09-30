'use strict';

const EMPTY_BUFFER = Buffer.alloc(0);

const FastBuffer = Buffer[Symbol.species];

function concat(list, totalLength) {
  if (totalLength === undefined) {
    totalLength = 0;
    for (const buf of list) {
      totalLength += buf.length;
    }
  }

  const target = Buffer.allocUnsafe(totalLength);
  let offset = 0;

  for (const buf of list) {
    buf.copy(target, offset);
    offset += buf.length;
  }

  if (offset < totalLength) {
    return target.slice(0, offset);
  }

  return target;
}

function mask(source, mask, output, offset, length) {
  for (let i = 0; i < length; i++) {
    output[offset + i] = source[i] ^ mask[i & 3];
  }
}

function unmask(buffer, mask) {
  const length = buffer.length;
  for (let i = 0; i < length; i++) {
    buffer[i] ^= mask[i & 3];
  }
}

function toArrayBuffer(buf) {
  if (buf.length === buf.buffer.byteLength) {
    return buf.buffer;
  }

  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length);
}

function toBuffer(data) {
  if (Buffer.isBuffer(data)) return data;

  if (data instanceof ArrayBuffer) {
    return Buffer.from(data);
  }

  if (ArrayBuffer.isView(data)) {
    return Buffer.from(data.buffer, data.byteOffset, data.byteLength);
  }

  return Buffer.from(data);
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

    module.exports.mask = function (source, mask, output, offset, length) {
      if (length < 48) {
        mask(source, mask, output, offset, length);
      } else {
        bufferUtil.mask(source, mask, output, offset, length);
      }
    };

    module.exports.unmask = function (buffer, mask) {
      if (buffer.length < 32) {
        unmask(buffer, mask);
      } else {
        bufferUtil.unmask(buffer, mask);
      }
    };
  } catch (e) {
    // Continue without native bufferutil
  }
}
