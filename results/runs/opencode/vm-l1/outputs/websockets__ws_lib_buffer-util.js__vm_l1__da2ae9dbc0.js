'use strict';

const EMPTY_BUFFER = Buffer.alloc(0);

// Buffer's species constructor avoids the deprecated Buffer constructor while
// still allowing a Buffer view over an existing ArrayBuffer.
const FastBuffer = Buffer[Symbol.species];

function concat(buffers, totalLength) {
  if (buffers.length === 0) return EMPTY_BUFFER;
  if (buffers.length === 1) return buffers[0];

  const target = Buffer.allocUnsafe(totalLength);
  let offset = 0;

  for (const buffer of buffers) {
    target.set(buffer, offset);
    offset += buffer.length;
  }

  if (offset < totalLength) {
    return new FastBuffer(target.buffer, target.byteOffset, offset);
  }

  return target;
}

function mask(source, maskBytes, output, offset, length) {
  for (let index = 0; index < length; index++) {
    output[offset + index] = source[index] ^ maskBytes[index & 3];
  }
}

function unmask(buffer, maskBytes) {
  for (let index = 0; index < buffer.length; index++) {
    buffer[index] ^= maskBytes[index & 3];
  }
}

function toArrayBuffer(buffer) {
  if (buffer.length === buffer.buffer.byteLength) return buffer.buffer;

  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.length
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

module.exports = { concat, mask, toArrayBuffer, toBuffer, unmask };

if (!process.env.WS_NO_BUFFER_UTIL) {
  try {
    const bufferUtil = require('bufferutil');

    module.exports.mask = function (
      source,
      maskBytes,
      output,
      offset,
      length
    ) {
      if (length < 48) {
        mask(source, maskBytes, output, offset, length);
      } else {
        bufferUtil.mask(source, maskBytes, output, offset, length);
      }
    };

    module.exports.unmask = function (buffer, maskBytes) {
      if (buffer.length < 32) {
        unmask(buffer, maskBytes);
      } else {
        bufferUtil.unmask(buffer, maskBytes);
      }
    };
  } catch {
    // `bufferutil` is an optional native dependency.
  }
}
