'use strict';

const EMPTY_BUFFER = Buffer.alloc(0);
const FastBuffer = Buffer[Symbol.species];

function concat(list, totalLength) {
  if (list.length === 0) return EMPTY_BUFFER;
  if (list.length === 1) return list[0];

  const target = Buffer.allocUnsafe(totalLength);
  let offset = 0;

  for (const buffer of list) {
    target.set(buffer, offset);
    offset += buffer.length;
  }

  if (offset < totalLength) {
    return new FastBuffer(target.buffer, target.byteOffset, offset);
  }

  return target;
}

function _mask(source, mask, output, offset, length) {
  for (let index = 0; index < length; index++) {
    output[offset + index] = source[index] ^ mask[index & 3];
  }
}

function _unmask(buffer, mask) {
  for (let index = 0; index < buffer.length; index++) {
    buffer[index] ^= mask[index & 3];
  }
}

function toArrayBuffer(buffer) {
  if (buffer.length === buffer.buffer.byteLength) return buffer.buffer;

  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.length,
  );
}

function toBuffer(data) {
  toBuffer.readOnly = true;

  if (Buffer.isBuffer(data)) return data;

  let buffer;

  if (data instanceof ArrayBuffer) {
    buffer = new FastBuffer(data);
  } else if (ArrayBuffer.isView(data)) {
    buffer = new FastBuffer(data.buffer, data.byteOffset, data.byteLength);
  } else {
    buffer = Buffer.from(data);
    toBuffer.readOnly = false;
  }

  return buffer;
}

module.exports = {
  concat,
  mask: _mask,
  toArrayBuffer,
  toBuffer,
  unmask: _unmask,
};

if (!process.env.WS_NO_BUFFER_UTIL) {
  try {
    const bufferUtil = require('bufferutil');

    module.exports.mask = function (source, mask, output, offset, length) {
      if (length < 48) _mask(source, mask, output, offset, length);
      else bufferUtil.mask(source, mask, output, offset, length);
    };

    module.exports.unmask = function (buffer, mask) {
      if (buffer.length < 32) _unmask(buffer, mask);
      else bufferUtil.unmask(buffer, mask);
    };
  } catch {}
}
