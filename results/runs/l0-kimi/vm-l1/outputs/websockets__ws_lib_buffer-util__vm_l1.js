'use strict';

const EMPTY_BUFFER = Buffer.alloc(0);
const FastBuffer = Buffer[Symbol.species];

function concat(list, totalLength) {
  if (list.length === 0) return EMPTY_BUFFER;
  if (list.length === 1) return list[0];
  
  const target = Buffer.allocUnsafe(totalLength);
  let offset = 0;
  
  for (let i = 0; i < list.length; i++) {
    const buf = list[i];
    buf.copy(target, offset);
    offset += buf.length;
  }
  
  return target;
}

function _mask(source, mask, output, offset, length) {
  for (let i = 0; i < length; i++) {
    output[offset + i] = source[i] ^ mask[i & 3];
  }
}

function _unmask(buffer, mask) {
  for (let i = 0; i < buffer.length; i++) {
    buffer[i] ^= mask[i & 3];
  }
}

function toArrayBuffer(buf) {
  if (buf.length === buf.buffer.byteLength) {
    return buf.buffer;
  }
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length);
}

function toBuffer(arr) {
  return Buffer.from(arr.buffer, arr.byteOffset, arr.byteLength);
}

module.exports = {
  concat,
  mask: _mask,
  toArrayBuffer,
  toBuffer,
  unmask: _unmask
};

if (!process.env.WS_NO_BUFFER_UTIL) {
  try {
    const bufferUtil = require('bufferutil');
    
    module.exports.mask = function(source, mask, output, offset, length) {
      if (length < 48) {
        _mask(source, mask, output, offset, length);
      } else {
        bufferUtil.mask(source, mask, output, offset, length);
      }
    };
    
    module.exports.unmask = function(buffer, mask) {
      if (buffer.length < 32) {
        _unmask(buffer, mask);
      } else {
        bufferUtil.unmask(buffer, mask);
      }
    };
  } catch (e) {
    // bufferutil not available, use fallback implementations
  }
}
