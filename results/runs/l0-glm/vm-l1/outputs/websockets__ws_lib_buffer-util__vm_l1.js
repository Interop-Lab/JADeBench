'use strict';

const { EMPTY_BUFFER } = require('./constants');
const FastBuffer = Buffer[Symbol.species];

function concat(list, totalLength) {
  if (list.length === 0) {
    return Buffer.alloc(0);
  }

  if (list.length === 1) {
    return list[0];
  }

  if (typeof totalLength !== 'number') {
    totalLength = 0;
    for (let i = 0; i < list.length; i++) {
      const buf = list[i];
      totalLength += buf.length;
    }
  }

  const target = Buffer.allocUnsafe(totalLength);
  let offset = 0;

  for (let i = 0; i < list.length; i++) {
    const buf = list[i];
    const length = buf.length;

    if (length === 0) {
      continue;
    }

    if (offset + length > target.length) {
      throw new Error('Source is too large');
    }

    target.set(buf, offset);
    offset += length;
  }

  if (offset < target.length) {
    return target.slice(0, offset);
  }

  return target;
}

function _mask(source, target, start, end, mask) {
  if (source.length > end) {
    source = source.subarray(0, end);
  }

  if (source.length > start) {
    source = source.subarray(start);
  }

  if (mask.length === 4) {
    target.set(source, 0);
    _maskBy4(target, 0, target.length, mask);
  } else {
    _maskByN(target, 0, target.length, mask);
  }
}

function _maskBy4(target, start, end, mask) {
  let i = start;
  const end4 = end - (end - start) % 4;

  while (i < end4) {
    target[i++] ^= mask[0];
    target[i++] ^= mask[1];
    target[i++] ^= mask[2];
    target[i++] ^= mask[3];
  }

  while (i < end) {
    target[i] ^= mask[i & 3];
    i++;
  }
}

function _maskByN(target, start, end, mask) {
  let i = start;
  let j = 0;

  while (i < end) {
    target[i++] ^= mask[j++];
    if (j === mask.length) {
      j = 0;
    }
  }
}

function _unmask(buffer, mask) {
  const length = buffer.length;

  if (mask.length === 4) {
    _unmaskBy4(buffer, 0, length, mask);
  } else {
    _unmaskByN(buffer, 0, length, mask);
  }
}

function _unmaskBy4(buffer, start, end, mask) {
  let i = start;
  const end4 = end - (end - start) % 4;

  while (i < end4) {
    buffer[i++] ^= mask[0];
    buffer[i++] ^= mask[1];
    buffer[i++] ^= mask[2];
    buffer[i++] ^= mask[3];
  }

  while (i < end) {
    buffer[i] ^= mask[i & 3];
    i++;
  }
}

function _unmaskByN(buffer, start, end, mask) {
  let i = start;
  let j = 0;

  while (i < end) {
    buffer[i++] ^= mask[j++];
    if (j === mask.length) {
      j = 0;
    }
  }
}

function toArrayBuffer(buf) {
  if (buf.length === buf.buffer.byteLength) {
    return buf.buffer;
  }

  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length);
}

function toBuffer(data) {
  if (Buffer.isBuffer(data)) {
    return data;
  }

  if (data instanceof ArrayBuffer) {
    return Buffer.from(data);
  }

  if (ArrayBuffer.isView(data)) {
    return Buffer.from(data.buffer, data.byteOffset, data.byteLength);
  }

  if (typeof data === 'string') {
    return Buffer.from(data);
  }

  throw new TypeError('The "data" argument must be of type string or an instance of Buffer, ArrayBuffer, or ArrayBuffer View.');
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

    module.exports.mask = function(source, target, start, end, mask) {
      if (end - start < 48) {
        _mask(source, target, start, end, mask);
      } else {
        bufferUtil.mask(source, target, start, end, mask);
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
    // Continue regardless of error
  }
}
