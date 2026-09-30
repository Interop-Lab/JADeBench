'use strict';

const __getOwnPropNames = Object.getOwnPropertyNames;
const __commonJS = (callback, module) => function () {
  const moduleObj = { exports: {} };
  return module || (callback(__getOwnPropNames, callback)[0])((module = moduleObj).exports, module), module.exports;
};

const require_constants = __commonJS({
  '../work/websockets__ws/lib/constants.js'(exports, module) {
    'use strict';

    const BINARY_TYPES = ['nodebuffer', 'arraybuffer', 'fragments'];
    const hasBlob = typeof Blob !== 'undefined';

    if (hasBlob) BINARY_TYPES.push('blob');

    exports = {
      BINARY_TYPES,
      CLOSE_TIMEOUT: 30000,
      EMPTY_BUFFER: Buffer.alloc(0),
      GUID: '258EAFA5-E914-47DA-95CA-C5AB0DC85B11',
      hasBlob,
      kForOnEventAttribute: Symbol('kForOnEventAttribute'),
      kListener: Symbol('kListener'),
      kStatusCode: Symbol('kStatusCode'),
      kWebSocket: Symbol('kWebSocket'),
      NOOP: () => {}
    };
  }
});

const { EMPTY_BUFFER } = require_constants();
const FastBuffer = Buffer[Symbol.species];

function concat(list, length) {
  if (list.length === 0) return EMPTY_BUFFER;
  if (list.length === 1) return list[0];

  const buffer = Buffer.allocUnsafe(length);
  let offset = 0;

  for (let i = 0; i < list.length; i++) {
    const buf = list[i];
    buffer.set(buf, offset);
    offset += buf.length;
  }

  if (offset < length) {
    return new FastBuffer(buffer.buffer, buffer.byteOffset, offset);
  }

  return buffer;
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
  if (buf.length === buf.buffer.byteLength) return buf.buffer;
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length);
}

function toBuffer(data) {
  toBuffer.readOnly = true;

  if (Buffer.isBuffer(data)) return data;

  let buf;

  if (data instanceof ArrayBuffer) {
    buf = new FastBuffer(data);
  } else if (ArrayBuffer.isView(data)) {
    buf = new FastBuffer(data.buffer, data.byteOffset, data.byteLength);
  } else {
    buf = Buffer.from(data);
    toBuffer.readOnly = false;
  }

  return buf;
}

const bufferUtil = {
  concat,
  mask: _mask,
  toArrayBuffer,
  toBuffer,
  unmask: _unmask
};

module.exports = bufferUtil;

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
  } catch (e) {}
}
