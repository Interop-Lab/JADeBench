'use strict';

const EMPTY_BUFFER = Buffer.alloc(0);
const FastBuffer = Buffer[Symbol.species];

/**
 * Concatenate a list of buffers into a buffer of the requested size.
 *
 * @param {Buffer[]} buffers
 * @param {number} totalLength
 * @returns {Buffer}
 */
function concat(buffers, totalLength) {
  if (buffers.length === 0) return EMPTY_BUFFER;
  if (buffers.length === 1) return buffers[0];

  const result = Buffer.allocUnsafe(totalLength);
  let offset = 0;

  for (const buffer of buffers) {
    result.set(buffer, offset);
    offset += buffer.length;
  }

  if (offset < totalLength) {
    return new FastBuffer(result.buffer, result.byteOffset, offset);
  }

  return result;
}

/**
 * Apply a WebSocket mask while copying bytes into an output buffer.
 *
 * @param {Buffer} source
 * @param {Buffer} mask
 * @param {Buffer} output
 * @param {number} offset
 * @param {number} length
 */
function mask(source, mask, output, offset, length) {
  for (let index = 0; index < length; index++) {
    output[offset + index] = source[index] ^ mask[index & 3];
  }
}

/**
 * Remove a WebSocket mask in place.
 *
 * @param {Buffer} buffer
 * @param {Buffer} mask
 */
function unmask(buffer, mask) {
  for (let index = 0; index < buffer.length; index++) {
    buffer[index] ^= mask[index & 3];
  }
}

/**
 * Return the exact ArrayBuffer region occupied by a Buffer.
 *
 * @param {Buffer} buffer
 * @returns {ArrayBuffer}
 */
function toArrayBuffer(buffer) {
  if (buffer.byteLength === buffer.buffer.byteLength) return buffer.buffer;

  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength
  );
}

/**
 * Convert supported binary data to a Buffer.
 *
 * `readOnly` indicates whether the returned Buffer aliases the input data.
 *
 * @param {*} data
 * @returns {Buffer}
 */
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
  mask,
  toArrayBuffer,
  toBuffer,
  unmask
};

if (!process.env.WS_NO_BUFFER_UTIL) {
  try {
    const bufferUtil = require('bufferutil');

    module.exports.mask = function acceleratedMask(
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

    module.exports.unmask = function acceleratedUnmask(buffer, maskBytes) {
      if (buffer.length < 32) {
        unmask(buffer, maskBytes);
      } else {
        bufferUtil.unmask(buffer, maskBytes);
      }
    };
  } catch {
    // The native dependency is optional; use the JavaScript implementations.
  }
}
