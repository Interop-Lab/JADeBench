'use strict';

const EMPTY_BUFFER = Buffer.alloc(0);
const FastBuffer = Buffer[Symbol.species];

/**
 * Concatenate a list of buffers into a buffer of the requested size.
 *
 * @param {Buffer[]} list Buffers to concatenate
 * @param {number} totalLength Size of the resulting buffer
 * @returns {Buffer} The concatenated buffer
 */
function concat(list, totalLength) {
  if (list.length === 0) return EMPTY_BUFFER;
  if (list.length === 1) return list[0];

  const target = Buffer.allocUnsafe(totalLength);
  let offset = 0;

  for (let i = 0; i < list.length; i++) {
    const buffer = list[i];

    target.set(buffer, offset);
    offset += buffer.length;
  }

  if (offset < totalLength) {
    return new FastBuffer(target.buffer, target.byteOffset, offset);
  }

  return target;
}

/** Apply a WebSocket mask to a buffer. */
function _mask(source, mask, output, offset, length) {
  for (let i = 0; i < length; i++) {
    output[offset + i] = source[i] ^ mask[i & 3];
  }
}

/** Remove a WebSocket mask from a buffer in place. */
function _unmask(buffer, mask) {
  for (let i = 0; i < buffer.length; i++) {
    buffer[i] ^= mask[i & 3];
  }
}

/** Convert a Buffer to an ArrayBuffer covering exactly the same bytes. */
function toArrayBuffer(buffer) {
  if (buffer.byteLength === buffer.buffer.byteLength) return buffer.buffer;

  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength
  );
}

/** Convert supported binary input to a Buffer. */
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
  unmask: _unmask
};

// Use the optional native implementation for payloads large enough to benefit.
if (!process.env.WS_NO_BUFFER_UTIL) {
  try {
    const bufferUtil = require('bufferutil');

    module.exports.mask = function mask(source, mask, output, offset, length) {
      if (length < 48) _mask(source, mask, output, offset, length);
      else bufferUtil.mask(source, mask, output, offset, length);
    };

    module.exports.unmask = function unmask(buffer, mask) {
      if (buffer.length < 32) _unmask(buffer, mask);
      else bufferUtil.unmask(buffer, mask);
    };
  } catch (error) {
    // The native dependency is optional.
  }
}
