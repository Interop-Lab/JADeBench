'use strict';

const { Duplex } = require('stream');
const { randomFillSync } = require('crypto');
const { types: { isUint8Array } } = require('util');

// Constants
const BINARY_TYPES = ['nodebuffer', 'arraybuffer', 'fragments'];
const GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
const EMPTY_BUFFER = Buffer.alloc(0);
const kForOnEventAttribute = Symbol('kForOnEventAttribute');
const kListener = Symbol('kListener');
const kStatusCode = Symbol('kStatusCode');
const kWebSocket = Symbol('kWebSocket');
const NOOP = () => {};

// Limiter class
class Limiter {
  constructor(concurrency) {
    this[kForOnEventAttribute] = () => {
      this.pending--;
      this[kListener]();
    };
    this[kListener] = Symbol('kListener');
    this.concurrency = concurrency || Infinity;
    this.pending = 0;
    this.queue = [];
  }

  add(job) {
    this.queue.push(job);
    this[kListener]();
  }

  [kListener]() {
    if (this.pending >= this.concurrency) return;
    if (this.queue.length) {
      const job = this.queue.shift();
      this.pending++;
      job(this[kForOnEventAttribute]);
    }
  }
}

// PerMessageDeflate class
class PerMessageDeflate {
  static get extensionName() {
    return 'permessage-deflate';
  }

  constructor(options) {
    this.options = options || {};
    this.threshold = this.options.threshold !== undefined ? this.options.threshold : 1024;
    this.clientNoContextTakeover = !!this.options.clientNoContextTakeover;
    this.serverNoContextTakeover = !!this.options.serverNoContextTakeover;
    this.clientMaxWindowBits = this.options.clientMaxWindowBits;
    this.serverMaxWindowBits = this.options.serverMaxWindowBits;
    this._inflate = null;
    this._deflate = null;
    this.params = null;
  }

  static createOffer(options) {
    const extensions = {};
    if (options.serverNoContextTakeover) {
      extensions.server_no_context_takeover = true;
    }
    if (options.clientNoContextTakeover) {
      extensions.client_no_context_takeover = true;
    }
    if (options.serverMaxWindowBits !== undefined) {
      extensions.server_max_window_bits = options.serverMaxWindowBits;
    }
    if (options.clientMaxWindowBits !== undefined) {
      extensions.client_max_window_bits = options.clientMaxWindowBits;
    }
    return extensions;
  }

  accept(offer) {
    const params = {};
    if (offer.server_no_context_takeover) {
      if (this.options.serverNoContextTakeover === false) {
        throw new Error('server_no_context_takeover is not supported');
      }
      params.server_no_context_takeover = true;
    }
    if (offer.client_no_context_takeover) {
      if (this.options.clientNoContextTakeover === false) {
        throw new Error('client_no_context_takeover is not supported');
      }
      params.client_no_context_takeover = true;
    }
    if (offer.server_max_window_bits !== undefined) {
      if (this.options.serverMaxWindowBits === false) {
        throw new Error('server_max_window_bits is not supported');
      }
      params.server_max_window_bits = offer.server_max_window_bits;
    }
    if (offer.client_max_window_bits !== undefined) {
      if (this.options.clientMaxWindowBits === false) {
        throw new Error('client_max_window_bits is not supported');
      }
      params.client_max_window_bits = offer.client_max_window_bits;
    }
    this.params = params;
    return params;
  }

  decompress(data, fin, callback) {
    const zlib = require('zlib');
    if (!this._inflate) {
      const windowBits = this.params.server_max_window_bits || 15;
      this._inflate = zlib.createInflateRaw({
        ...this.options.zlibInflateOptions,
        windowBits
      });
      this._inflate[kWebSocket] = this;
      this._inflate[kStatusCode] = -1;
      this._inflate[kListener] = [];
      this._inflate.on('error', onInflateError);
      this._inflate.on('data', onInflateData);
    }
    this._inflate[kListener] = callback;
    this._inflate.write(data);
    if (fin) this._inflate.write(Buffer.from([0x00, 0x00, 0xff, 0xff]));
  }

  compress(data, fin, callback) {
    const zlib = require('zlib');
    if (!this._deflate) {
      const windowBits = this.params.client_max_window_bits || 15;
      this._deflate = zlib.createDeflateRaw({
        ...this.options.zlibDeflateOptions,
        windowBits
      });
      this._deflate[kWebSocket] = this;
      this._deflate[kStatusCode] = -1;
      this._deflate[kListener] = [];
      this._deflate.on('error', onDeflateError);
      this._deflate.on('data', onDeflateData);
    }
    this._deflate[kListener] = callback;
    this._deflate.write(data);
    if (fin) this._deflate.flush(zlib.Z_SYNC_FLUSH);
  }

  cleanup() {
    if (this._inflate) {
      this._inflate.close();
      this._inflate = null;
    }
    if (this._deflate) {
      this._deflate.close();
      this._deflate = null;
    }
  }
}

function onInflateError(err) {
  this[kWebSocket]._inflate = null;
  const callback = this[kListener];
  if (callback) {
    callback(err);
  }
}

function onInflateData(chunk) {
  this[kWebSocket]._inflate[kListener](null, chunk);
}

function onDeflateError(err) {
  this[kWebSocket]._deflate = null;
  const callback = this[kListener];
  if (callback) {
    callback(err);
  }
}

function onDeflateData(chunk) {
  this[kWebSocket]._deflate[kListener](null, chunk);
}

// Buffer utilities
const kByteLength = Symbol('kByteLength');
const maskBuffer = Buffer.alloc(4);
const RANDOM_POOL_SIZE = 4 * 1024;
let randomPool;
let randomPoolPointer = RANDOM_POOL_SIZE;

function concat(buffers, totalLength) {
  if (buffers.length === 0) return EMPTY_BUFFER;
  if (buffers.length === 1) return buffers[0];
  const result = Buffer.allocUnsafe(totalLength);
  let offset = 0;
  for (let i = 0; i < buffers.length; i++) {
    const buf = buffers[i];
    buf.copy(result, offset);
    offset += buf.length;
  }
  if (offset !== totalLength) {
    return new Uint8Array(result.buffer, result.byteOffset, offset);
  }
  return result;
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

function toBuffer(data) {
  if (toBuffer.read) return data;
  if (Buffer.isBuffer(data)) return data;
  let buf;
  if (data instanceof ArrayBuffer) {
    buf = Buffer.from(data);
  } else if (ArrayBuffer.isView(data)) {
    buf = Buffer.from(data.buffer, data.byteOffset, data.byteLength);
  } else {
    buf = Buffer.from(data);
    toBuffer.read = false;
  }
  return buf;
}

// Validation utilities
function isValidStatusCode(code) {
  return (
    (code >= 1000 && code <= 1003) ||
    (code >= 1005 && code <= 1011) ||
    (code >= 3000 && code <= 4999)
  );
}

function isValidUTF8(buffer) {
  const len = buffer.length;
  let i = 0;
  while (i < len) {
    if ((buffer[i] & 0x80) === 0) {
      i++;
    } else if ((buffer[i] & 0xe0) === 0xc0) {
      if (i + 1 >= len || (buffer[i + 1] & 0xc0) !== 0x80) return false;
      i += 2;
    } else if ((buffer[i] & 0xf0) === 0xe0) {
      if (
        i + 2 >= len ||
        (buffer[i + 1] & 0xc0) !== 0x80 ||
        (buffer[i + 2] & 0xc0) !== 0x80 ||
        (buffer[i] === 0xe0 && (buffer[i + 1] & 0xe0) === 0x80) ||
        (buffer[i] === 0xed && (buffer[i + 1] & 0xe0) === 0xa0)
      )
        return false;
      i += 3;
    } else if ((buffer[i] & 0xf8) === 0xf0) {
      if (
        i + 3 >= len ||
        (buffer[i + 1] & 0xc0) !== 0x80 ||
        (buffer[i + 2] & 0xc0) !== 0x80 ||
        (buffer[i + 3] & 0xc0) !== 0x80 ||
        (buffer[i] === 0xf0 && (buffer[i + 1] & 0xf0) === 0x80) ||
        (buffer[i] === 0xf4 && buffer[i + 1] > 0x8f) ||
        buffer[i] > 0xf4
      )
        return false;
      i += 4;
    } else {
      return false;
    }
  }
  return true;
}

function isBlob(value) {
  return (
    typeof value === 'object' &&
    typeof value.arrayBuffer === 'function' &&
    typeof value.slice === 'function' &&
    typeof value.text === 'function' &&
    typeof value.stream === 'function' &&
    (value[Symbol.toStringTag] === 'Blob' ||
      value[Symbol.toStringTag] === 'File')
  );
}

// Sender class
const DEFAULT = 0;
const DEFLATING = 1;
const GET_BLOB_DATA = 2;

class Sender {
  constructor(socket, extensions, generateMask) {
    this.options = extensions || {};
    this.generateMask = generateMask;
    if (generateMask) {
      this.extensions = extensions;
      this.maskKey = Buffer.alloc(4);
    }
    this.socket = socket;
    this.firstFragment = true;
    this.bytesSent = 0;
    this.sentClose = false;
    this.queue = [];
    this.state = DEFAULT;
    this.onerror = NOOP;
    this[kWebSocket] = undefined;
  }

  static frame(data, options) {
    let maskKey;
    let hasMask = false;
    let dataLength = 0;
    let mask = false;

    if (options.mask) {
      maskKey = options.maskKey || maskBuffer;
      if (options.generateMask) {
        options.generateMask(maskKey);
      } else {
        if (randomPoolPointer >= RANDOM_POOL_SIZE) {
          if (!randomPool) {
            randomPool = Buffer.allocUnsafe(RANDOM_POOL_SIZE);
          }
          randomFillSync(randomPool, 0, RANDOM_POOL_SIZE);
          randomPoolPointer = 0;
        }
        maskKey[0] = randomPool[randomPoolPointer++];
        maskKey[1] = randomPool[randomPoolPointer++];
        maskKey[2] = randomPool[randomPoolPointer++];
        maskKey[3] = randomPool[randomPoolPointer++];
      }
      hasMask = true;
      mask = (maskKey[0] | (maskKey[1] << 8) | (maskKey[2] << 16) | (maskKey[3] << 24)) >>> 0;
      dataLength = 4;
    }

    let payloadLength;
    if (typeof data === 'string') {
      if (!options.mask || hasMask) {
        payloadLength = data[kByteLength];
      } else {
        data = Buffer.from(data);
        payloadLength = data.length;
      }
    } else {
      payloadLength = data.length;
      hasMask = options.mask && !hasMask;
    }

    let targetLength = payloadLength;
    if (payloadLength < 126) {
      dataLength += 2;
    } else if (payloadLength < 65536) {
      dataLength += 4;
      targetLength = 126;
    } else {
      dataLength += 10;
      targetLength = 127;
    }

    const target = Buffer.allocUnsafe(hasMask ? dataLength + payloadLength : dataLength);
    target[0] = options.fin ? options.opcode | 0x80 : options.opcode;
    if (options.rsv1) target[0] |= 0x40;

    target[1] = hasMask ? 0x80 | targetLength : targetLength;

    if (payloadLength < 126) {
      target.writeUIntBE(payloadLength, 2, 0);
    } else if (payloadLength < 65536) {
      target[2] = target[3] = 0;
      target.writeUIntBE(payloadLength, 4, 2);
    } else {
      target[2] = target[3] = target[4] = target[5] = target[6] = target[7] = 0;
      target.writeUIntBE(payloadLength, 8, 8);
    }

    if (!options.mask) return [target, data];

    target[1] |= 0x80;
    target[dataLength - 4] = maskKey[0];
    target[dataLength - 3] = maskKey[1];
    target[dataLength - 2] = maskKey[2];
    target[dataLength - 1] = maskKey[3];

    if (hasMask) return [target, data];

    mask(data, maskKey, data, 0, payloadLength);
    return [target];
  }

  close(code, data, mask, cb) {
    let buf;
    if (code === undefined) {
      buf = EMPTY_BUFFER;
    } else if (typeof code !== 'number' || !isValidStatusCode(code)) {
      throw new TypeError('Invalid status code');
    } else {
      buf = Buffer.allocUnsafe(2);
      buf.writeUInt16BE(code, 0);
      if (data !== undefined && data.length) {
        if (buf.length + data.length > 125) {
          throw new RangeError('Data too long');
        }
        buf = Buffer.concat([buf, data]);
      }
    }

    const options = {
      [kByteLength]: buf.length,
      fin: true,
      generateMask: this.generateMask,
      mask,
      opcode: 0x08,
      readOnly: false,
      rsv1: false
    };

    if (this.state === DEFAULT) {
      this.sendFrame(Sender.frame(buf, options), cb);
    } else {
      this.enqueue([this.socket, buf, false, options, cb]);
    }
  }

  ping(data, mask, cb) {
    let buf, readOnly;
    if (typeof data === 'string') {
      buf = Buffer.byteLength(data);
      readOnly = false;
    } else if (isBlob(data)) {
      buf = data.size;
      readOnly = false;
    } else {
      data = toBuffer(data);
      buf = data.length;
      readOnly = toBuffer.read;
    }

    if (buf > 125) {
      throw new RangeError('Data too long');
    }

    const options = {
      [kByteLength]: buf,
      fin: true,
      generateMask: this.generateMask,
      mask,
      opcode: 0x09,
      readOnly,
      rsv1: false
    };

    if (isBlob(data)) {
      if (this.state === DEFAULT) {
        this.sendBlob(data, false, options, cb);
      } else {
        this.enqueue([data, false, options, cb]);
      }
    } else if (this.state === DEFAULT) {
      this.sendFrame(Sender.frame(data, options), cb);
    } else {
      this.enqueue([this.socket, data, false, options, cb]);
    }
  }

  pong(data, mask, cb) {
    let buf, readOnly;
    if (typeof data === 'string') {
      buf = Buffer.byteLength(data);
      readOnly = false;
    } else if (isBlob(data)) {
      buf = data.size;
      readOnly = false;
    } else {
      data = toBuffer(data);
      buf = data.length;
      readOnly = toBuffer.read;
    }

    if (buf > 125) {
      throw new RangeError('Data too long');
    }

    const options = {
      [kByteLength]: buf,
      fin: true,
      generateMask: this.generateMask,
      mask,
      opcode: 0x0a,
      readOnly,
      rsv1: false
    };

    if (isBlob(data)) {
      if (this.state === DEFAULT) {
        this.sendBlob(data, false, options, cb);
      } else {
        this.enqueue([data, false, options, cb]);
      }
    } else if (this.state === DEFAULT) {
      this.sendFrame(Sender.frame(data, options), cb);
    } else {
      this.enqueue([this.socket, data, false, options, cb]);
    }
  }

  send(data, options, cb) {
    const perMessageDeflate = this.extensions[PerMessageDeflate.extensionName];
    let opcode = options.binary ? 2 : 1;
    let rsv1 = options.compress;
    let len, readOnly;

    if (typeof data === 'string') {
      len = Buffer.byteLength(data);
      readOnly = false;
    } else if (isBlob(data)) {
      len = data.size;
      readOnly = false;
    } else {
      data = toBuffer(data);
      len = data.length;
      readOnly = toBuffer.read;
    }

    if (this.firstFragment) {
      this.firstFragment = false;
      if (rsv1 && perMessageDeflate) {
        rsv1 = len >= perMessageDeflate.threshold;
      }
    } else {
      rsv1 = false;
      opcode = 0;
    }

    const frameOptions = {
      [kByteLength]: len,
      fin: options.fin,
      generateMask: this.generateMask,
      mask: options.mask,
      opcode,
      readOnly,
      rsv1
    };

    if (isBlob(data)) {
      if (this.state === DEFAULT) {
        if (rsv1) {
          this.deflate(data, false, frameOptions, cb);
        } else {
          this.sendBlob(data, false, frameOptions, cb);
        }
      } else {
        this.enqueue([data, false, frameOptions, cb]);
      }
    } else if (this.state === DEFAULT) {
      if (rsv1) {
        this.deflate(data, false, frameOptions, cb);
      } else {
        this.sendFrame(Sender.frame(data, frameOptions), cb);
      }
    } else {
      this.enqueue([this.socket, data, false, frameOptions, cb]);
    }
  }

  sendBlob(blob, compress, options, cb) {
    this.state = GET_BLOB_DATA;
    blob.arrayBuffer().then((arrayBuffer) => {
      if (this.socket.destroyed) {
        const err = new Error('Socket destroyed');
        callCallbacks(this, err, cb);
        return;
      }
      this.bytesSent -= options[kByteLength];
      const buf = toBuffer(arrayBuffer);
      if (!compress) {
        this.state = DEFAULT;
        this.sendFrame(Sender.frame(buf, options), cb);
        this.dispatch();
      } else {
        this.deflate(buf, false, options, cb);
      }
    }).catch((err) => {
      callCallbacks(this, err, cb);
    });
  }

  deflate(data, fin, options, cb) {
    const perMessageDeflate = this.extensions[PerMessageDeflate.extensionName];
    this.bytesSent += options[kByteLength];
    this.state = DEFLATING;
    perMessageDeflate.compress(data, fin, (err, buf) => {
      if (this.socket.destroyed) {
        const err = new Error('Socket destroyed');
        callCallbacks(this, err, cb);
        return;
      }
      this.bytesSent -= options[kByteLength];
      this.state = DEFAULT;
      options.fin = true;
      this.sendFrame(Sender.frame(buf, options), cb);
      this.dispatch();
    });
  }

  dispatch() {
    while (this.state === DEFAULT && this.queue.length) {
      const params = this.queue.shift();
      this.bytesSent -= params[3][kByteLength];
      Reflect.apply(params[0], this, params.slice(1));
    }
  }

  enqueue(params) {
    this.bytesSent += params[3][kByteLength];
    this.queue.push(params);
  }

  sendFrame(list, cb) {
    if (list.length === 2) {
      this.socket.write(list[0]);
      this.socket.write(list[1], cb);
    } else {
      this.socket.write(list[0], cb);
    }
  }
}

function callCallbacks(sender, err, cb) {
  if (typeof cb === 'function') cb(err);
  for (let i = 0; i < sender.queue.length; i++) {
    const params = sender.queue[i];
    const callback = params[params.length - 1];
    if (typeof callback === 'function') callback(err);
  }
}

function onError(sender, err, cb) {
  callCallbacks(sender, err, cb);
  sender.onerror(err);
}

module.exports = Sender;
