'use strict';

const { isUtf8 } = require('buffer');
const { Writable } = require('stream');
const zlib = require('zlib');

const BINARY_TYPES = ['nodebuffer', 'arraybuffer', 'fragments'];
const EMPTY_BUFFER = Buffer.alloc(0);
const kStatusCode = Symbol('status-code');
const kWebSocket = Symbol('websocket');
const FastBuffer = Buffer[Symbol.species];

if (typeof Blob !== 'undefined') BINARY_TYPES.push('blob');

function concat(buffers, totalLength) {
  if (buffers.length === 0) return EMPTY_BUFFER;
  if (buffers.length === 1) return buffers[0];

  const target = Buffer.allocUnsafe(totalLength);
  let offset = 0;
  for (const buffer of buffers) {
    target.set(buffer, offset);
    offset += buffer.length;
  }
  return offset < totalLength
    ? new FastBuffer(target.buffer, target.byteOffset, offset)
    : target;
}

function toArrayBuffer(buffer) {
  if (buffer.length === buffer.buffer.byteLength) return buffer.buffer;
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.length);
}

function unmask(buffer, mask) {
  for (let index = 0; index < buffer.length; index++) {
    buffer[index] ^= mask[index & 3];
  }
}

function isValidStatusCode(code) {
  return (
    (code >= 1000 && code <= 1014 && ![1004, 1005, 1006].includes(code)) ||
    (code >= 3000 && code <= 4999)
  );
}

function isValidUTF8(buffer) {
  if (isUtf8) return isUtf8(buffer);
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(buffer) !== undefined;
  } catch {
    return false;
  }
}

const limiterDone = Symbol('done');
const limiterRun = Symbol('run');

class Limiter {
  constructor(concurrency) {
    this[limiterDone] = () => {
      this.pending--;
      this[limiterRun]();
    };
    this.concurrency = concurrency || Infinity;
    this.jobs = [];
    this.pending = 0;
  }

  add(job) {
    this.jobs.push(job);
    this[limiterRun]();
  }

  [limiterRun]() {
    if (this.pending === this.concurrency || this.jobs.length === 0) return;
    const job = this.jobs.shift();
    this.pending++;
    job(this[limiterDone]);
  }
}

const TRAILER = Buffer.from([0x00, 0x00, 0xff, 0xff]);
const kBuffers = Symbol('buffers');
const kCallback = Symbol('callback');
const kError = Symbol('error');
const kOwner = Symbol('owner');
const kTotalLength = Symbol('total-length');
let zlibLimiter;

class PerMessageDeflate {
  constructor(options = {}, isServer, maxPayload = 0) {
    this._maxPayload = maxPayload | 0;
    this._options = options;
    this._threshold = options.threshold !== undefined ? options.threshold : 1024;
    this._isServer = !!isServer;
    this._deflate = null;
    this._inflate = null;
    this.params = null;

    if (!zlibLimiter) {
      const concurrency = options.concurrencyLimit !== undefined
        ? options.concurrencyLimit
        : 10;
      zlibLimiter = new Limiter(concurrency);
    }
  }

  static get extensionName() {
    return 'permessage-deflate';
  }

  offer() {
    const params = {};
    if (this._options.serverNoContextTakeover) params.server_no_context_takeover = true;
    if (this._options.clientNoContextTakeover) params.client_no_context_takeover = true;
    if (this._options.serverMaxWindowBits) params.server_max_window_bits = this._options.serverMaxWindowBits;
    if (this._options.clientMaxWindowBits) params.client_max_window_bits = this._options.clientMaxWindowBits;
    else if (this._options.clientMaxWindowBits == null) params.client_max_window_bits = true;
    return params;
  }

  accept(configurations) {
    configurations = this.normalizeParams(configurations);
    this.params = this._isServer
      ? this.acceptAsServer(configurations)
      : this.acceptAsClient(configurations);
    return this.params;
  }

  cleanup() {
    if (this._inflate) {
      this._inflate.close();
      this._inflate = null;
    }
    if (this._deflate) {
      const callback = this._deflate[kCallback];
      this._deflate.close();
      this._deflate = null;
      if (callback) callback(new Error('The deflate stream was closed while data was being processed'));
    }
  }

  acceptAsServer(offers) {
    const options = this._options;
    const accepted = offers.find((params) => {
      if (options.serverNoContextTakeover === false && params.server_no_context_takeover) return false;
      if (options.serverMaxWindowBits === false && params.server_max_window_bits) return false;
      if (
        typeof options.serverMaxWindowBits === 'number' &&
        typeof params.server_max_window_bits === 'number' &&
        options.serverMaxWindowBits > params.server_max_window_bits
      ) return false;
      if (typeof options.clientMaxWindowBits === 'number' && !params.client_max_window_bits) return false;
      return true;
    });

    if (!accepted) throw new Error('None of the extension offers can be accepted');
    if (options.serverNoContextTakeover) accepted.server_no_context_takeover = true;
    if (options.clientNoContextTakeover) accepted.client_no_context_takeover = true;
    if (typeof options.serverMaxWindowBits === 'number') accepted.server_max_window_bits = options.serverMaxWindowBits;
    if (typeof options.clientMaxWindowBits === 'number') accepted.client_max_window_bits = options.clientMaxWindowBits;
    else if (accepted.client_max_window_bits === true || options.clientMaxWindowBits === false) delete accepted.client_max_window_bits;
    return accepted;
  }

  acceptAsClient(responses) {
    const params = responses[0];
    if (this._options.clientNoContextTakeover === false && params.client_no_context_takeover) {
      throw new Error('Unexpected parameter "client_no_context_takeover"');
    }
    if (!params.client_max_window_bits) {
      if (typeof this._options.clientMaxWindowBits === 'number') {
        params.client_max_window_bits = this._options.clientMaxWindowBits;
      }
    } else if (
      this._options.clientMaxWindowBits === false ||
      (typeof this._options.clientMaxWindowBits === 'number' &&
        params.client_max_window_bits > this._options.clientMaxWindowBits)
    ) {
      throw new Error('Unexpected or invalid parameter "client_max_window_bits"');
    }
    return params;
  }

  normalizeParams(configurations) {
    configurations.forEach((params) => {
      Object.keys(params).forEach((key) => {
        let value = params[key];
        if (value.length > 1) throw new Error('Parameter "' + key + '" must have only a single value');
        value = value[0];
        if (key === 'client_max_window_bits') {
          if (value !== true) value = validateWindowBits(value, key);
        } else if (key === 'server_max_window_bits') {
          if (value === true) throw new TypeError('Invalid value for parameter "' + key + '": ' + value);
          value = validateWindowBits(value, key);
        } else if (key === 'client_no_context_takeover' || key === 'server_no_context_takeover') {
          if (value !== true) throw new TypeError('Invalid value for parameter "' + key + '": ' + value);
        } else {
          throw new Error('Unknown parameter "' + key + '"');
        }
        params[key] = value;
      });
    });
    return configurations;
  }

  decompress(data, fin, callback) {
    zlibLimiter.add((done) => {
      this._decompress(data, fin, (error, result) => {
        done();
        callback(error, result);
      });
    });
  }

  compress(data, fin, callback) {
    zlibLimiter.add((done) => {
      this._compress(data, fin, (error, result) => {
        done();
        callback(error, result);
      });
    });
  }

  _decompress(data, fin, callback) {
    const endpoint = this._isServer ? 'client' : 'server';
    if (!this._inflate) {
      const windowBits = this.params[endpoint + '_max_window_bits'];
      this._inflate = zlib.createInflateRaw({
        ...this._options.zlibInflateOptions,
        windowBits: typeof windowBits === 'number' ? windowBits : zlib.Z_DEFAULT_WINDOWBITS
      });
      this._inflate[kBuffers] = [];
      this._inflate[kOwner] = this;
      this._inflate[kTotalLength] = 0;
      this._inflate.on('data', inflateOnData);
      this._inflate.on('error', inflateOnError);
    }

    this._inflate[kCallback] = callback;
    this._inflate.write(data);
    if (fin) this._inflate.write(TRAILER);
    this._inflate.flush(() => {
      if (!this._inflate) return;
      const error = this._inflate[kError];
      if (error) {
        this._inflate.close();
        this._inflate = null;
        callback(error);
        return;
      }
      const result = concat(this._inflate[kBuffers], this._inflate[kTotalLength]);
      if (fin && this.params[endpoint + '_no_context_takeover']) this._inflate.reset();
      this._inflate[kBuffers] = [];
      this._inflate[kTotalLength] = 0;
      callback(null, result);
    });
  }

  _compress(data, fin, callback) {
    const endpoint = this._isServer ? 'server' : 'client';
    if (!this._deflate) {
      const windowBits = this.params[endpoint + '_max_window_bits'];
      this._deflate = zlib.createDeflateRaw({
        ...this._options.zlibDeflateOptions,
        windowBits: typeof windowBits === 'number' ? windowBits : zlib.Z_DEFAULT_WINDOWBITS
      });
      this._deflate[kBuffers] = [];
      this._deflate[kTotalLength] = 0;
      this._deflate.on('data', deflateOnData);
    }

    this._deflate[kCallback] = callback;
    this._deflate.write(data);
    this._deflate.flush(zlib.Z_SYNC_FLUSH, () => {
      if (!this._deflate) return;
      let result = concat(this._deflate[kBuffers], this._deflate[kTotalLength]);
      if (fin) result = new FastBuffer(result.buffer, result.byteOffset, result.length - 4);
      if (fin && this.params[endpoint + '_no_context_takeover']) this._deflate.reset();
      this._deflate[kBuffers] = [];
      this._deflate[kTotalLength] = 0;
      this._deflate[kCallback] = null;
      callback(null, result);
    });
  }
}

function validateWindowBits(value, key) {
  const bits = +value;
  if (!Number.isInteger(bits) || bits < 8 || bits > 15) {
    throw new TypeError('Invalid value for parameter "' + key + '": ' + value);
  }
  return bits;
}

function inflateOnData(chunk) {
  this[kTotalLength] += chunk.length;
  if (this[kTotalLength] > this[kOwner]._maxPayload && this[kOwner]._maxPayload > 0) {
    const error = new RangeError('Max payload size exceeded');
    error.code = 'WS_ERR_UNSUPPORTED_MESSAGE_LENGTH';
    error[kStatusCode] = 1009;
    this[kError] = error;
    this.removeListener('data', inflateOnData);
    this.reset();
    return;
  }
  this[kBuffers].push(chunk);
}

function inflateOnError(error) {
  this[kOwner]._inflate = null;
  error[kStatusCode] = 1007;
  this[kCallback](error);
}

function deflateOnData(chunk) {
  this[kBuffers].push(chunk);
  this[kTotalLength] += chunk.length;
}

const GET_INFO = 0;
const GET_PAYLOAD_LENGTH_16 = 1;
const GET_PAYLOAD_LENGTH_64 = 2;
const GET_MASK = 3;
const GET_DATA = 4;
const INFLATING = 5;
const DEFER_EVENT = 6;

class Receiver extends Writable {
  constructor(options = {}) {
    super();
    this._allowSynchronousEvents = options.allowSynchronousEvents !== undefined ? options.allowSynchronousEvents : true;
    this._binaryType = options.binaryType || BINARY_TYPES[0];
    this._extensions = options.extensions || {};
    this._isServer = !!options.isServer;
    this._maxPayload = options.maxPayload | 0;
    this._maxBufferedChunks = options.maxBufferedChunks | 0;
    this._maxFragments = options.maxFragments | 0;
    this._skipUTF8Validation = !!options.skipUTF8Validation;
    this[kWebSocket] = undefined;
    this._bufferedBytes = 0;
    this._buffers = [];
    this._compressed = false;
    this._payloadLength = 0;
    this._mask = undefined;
    this._fragmented = 0;
    this._masked = false;
    this._fin = false;
    this._opcode = 0;
    this._totalPayloadLength = 0;
    this._messageLength = 0;
    this._fragments = [];
    this._numFragments = 0;
    this._errored = false;
    this._loop = false;
    this._state = GET_INFO;
  }

  _write(chunk, encoding, callback) {
    if (this._opcode === 0x08 && this._state === GET_INFO) return callback();
    if (this._maxBufferedChunks > 0 && this._buffers.length >= this._maxBufferedChunks) {
      callback(this.createError(RangeError, 'Too many buffered chunks', false, 1008, 'WS_ERR_TOO_MANY_BUFFERED_PARTS'));
      return;
    }
    this._bufferedBytes += chunk.length;
    this._buffers.push(chunk);
    this.startLoop(callback);
  }

  consume(length) {
    this._bufferedBytes -= length;
    if (length === this._buffers[0].length) return this._buffers.shift();
    if (length < this._buffers[0].length) {
      const buffer = this._buffers[0];
      this._buffers[0] = new FastBuffer(buffer.buffer, buffer.byteOffset + length, buffer.length - length);
      return new FastBuffer(buffer.buffer, buffer.byteOffset, length);
    }
    const target = Buffer.allocUnsafe(length);
    let remaining = length;
    do {
      const buffer = this._buffers[0];
      const offset = target.length - remaining;
      if (remaining >= buffer.length) target.set(this._buffers.shift(), offset);
      else {
        target.set(new Uint8Array(buffer.buffer, buffer.byteOffset, remaining), offset);
        this._buffers[0] = new FastBuffer(buffer.buffer, buffer.byteOffset + remaining, buffer.length - remaining);
      }
      remaining -= buffer.length;
    } while (remaining > 0);
    return target;
  }

  startLoop(callback) {
    this._loop = true;
    do {
      switch (this._state) {
        case GET_INFO: this.getInfo(callback); break;
        case GET_PAYLOAD_LENGTH_16: this.getPayloadLength16(callback); break;
        case GET_PAYLOAD_LENGTH_64: this.getPayloadLength64(callback); break;
        case GET_MASK: this.getMask(); break;
        case GET_DATA: this.getData(callback); break;
        case INFLATING:
        case DEFER_EVENT:
          this._loop = false;
          return;
      }
    } while (this._loop);
    if (!this._errored) callback();
  }

  getInfo(callback) {
    if (this._bufferedBytes < 2) { this._loop = false; return; }
    const buffer = this.consume(2);
    if ((buffer[0] & 0x30) !== 0) return callback(this.createError(RangeError, 'RSV2 and RSV3 must be clear', true, 1002, 'WS_ERR_UNEXPECTED_RSV_2_3'));

    const compressed = (buffer[0] & 0x40) === 0x40;
    if (compressed && !this._extensions[PerMessageDeflate.extensionName]) return callback(this.createError(RangeError, 'RSV1 must be clear', true, 1002, 'WS_ERR_UNEXPECTED_RSV_1'));

    this._fin = (buffer[0] & 0x80) === 0x80;
    this._opcode = buffer[0] & 0x0f;
    this._payloadLength = buffer[1] & 0x7f;

    if (this._opcode === 0x00) {
      if (compressed) return callback(this.createError(RangeError, 'RSV1 must be clear', true, 1002, 'WS_ERR_UNEXPECTED_RSV_1'));
      if (!this._fragmented) return callback(this.createError(RangeError, 'invalid opcode 0', true, 1002, 'WS_ERR_INVALID_OPCODE'));
      this._opcode = this._fragmented;
    } else if (this._opcode === 0x01 || this._opcode === 0x02) {
      if (this._fragmented) return callback(this.createError(RangeError, 'invalid opcode ' + this._opcode, true, 1002, 'WS_ERR_INVALID_OPCODE'));
      this._compressed = compressed;
      if (!this._fin) this._fragmented = this._opcode;
    } else if (this._opcode > 0x07 && this._opcode < 0x0b) {
      if (!this._fin) return callback(this.createError(RangeError, 'FIN must be set', true, 1002, 'WS_ERR_EXPECTED_FIN'));
      if (compressed) return callback(this.createError(RangeError, 'RSV1 must be clear', true, 1002, 'WS_ERR_UNEXPECTED_RSV_1'));
      if (this._payloadLength > 0x7d || (this._opcode === 0x08 && this._payloadLength === 1)) return callback(this.createError(RangeError, 'invalid payload length ' + this._payloadLength, true, 1002, 'WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH'));
    } else {
      return callback(this.createError(RangeError, 'invalid opcode ' + this._opcode, true, 1002, 'WS_ERR_INVALID_OPCODE'));
    }

    this._masked = (buffer[1] & 0x80) === 0x80;
    if (this._isServer && !this._masked) return callback(this.createError(RangeError, 'MASK must be set', true, 1002, 'WS_ERR_EXPECTED_MASK'));
    if (!this._isServer && this._masked) return callback(this.createError(RangeError, 'MASK must be clear', true, 1002, 'WS_ERR_UNEXPECTED_MASK'));

    if (this._payloadLength === 126) this._state = GET_PAYLOAD_LENGTH_16;
    else if (this._payloadLength === 127) this._state = GET_PAYLOAD_LENGTH_64;
    else this.haveLength(callback);
  }

  getPayloadLength16(callback) {
    if (this._bufferedBytes < 2) { this._loop = false; return; }
    this._payloadLength = this.consume(2).readUInt16BE(0);
    this.haveLength(callback);
  }

  getPayloadLength64(callback) {
    if (this._bufferedBytes < 8) { this._loop = false; return; }
    const buffer = this.consume(8);
    const high = buffer.readUInt32BE(0);
    if (high > Math.pow(2, 21) - 1) return callback(this.createError(RangeError, 'Unsupported WebSocket frame: payload length > 2^53 - 1', false, 1009, 'WS_ERR_UNSUPPORTED_DATA_PAYLOAD_LENGTH'));
    this._payloadLength = high * Math.pow(2, 32) + buffer.readUInt32BE(4);
    this.haveLength(callback);
  }

  haveLength(callback) {
    if (this._opcode < 0x08 && this._payloadLength) {
      this._totalPayloadLength += this._payloadLength;
      if (this._totalPayloadLength > this._maxPayload && this._maxPayload > 0) return callback(this.createError(RangeError, 'Max payload size exceeded', false, 1009, 'WS_ERR_UNSUPPORTED_MESSAGE_LENGTH'));
    }
    this._state = this._masked ? GET_MASK : GET_DATA;
  }

  getMask() {
    if (this._bufferedBytes < 4) { this._loop = false; return; }
    this._mask = this.consume(4);
    this._state = GET_DATA;
  }

  getData(callback) {
    let data = EMPTY_BUFFER;
    if (this._payloadLength) {
      if (this._bufferedBytes < this._payloadLength) { this._loop = false; return; }
      data = this.consume(this._payloadLength);
      if (this._masked && (this._mask[0] | this._mask[1] | this._mask[2] | this._mask[3]) !== 0) unmask(data, this._mask);
    }
    if (this._opcode > 0x07) { this.controlMessage(data, callback); return; }
    if (this._maxFragments > 0 && ++this._numFragments > this._maxFragments) return callback(this.createError(RangeError, 'Too many message fragments', false, 1008, 'WS_ERR_TOO_MANY_BUFFERED_PARTS'));
    if (this._compressed) { this._state = INFLATING; this.decompress(data, callback); return; }
    if (data.length) { this._messageLength = this._totalPayloadLength; this._fragments.push(data); }
    this.dataMessage(callback);
  }

  decompress(data, callback) {
    const extension = this._extensions[PerMessageDeflate.extensionName];
    extension.decompress(data, this._fin, (error, buffer) => {
      if (error) return callback(error);
      if (buffer.length) {
        this._messageLength += buffer.length;
        if (this._messageLength > this._maxPayload && this._maxPayload > 0) return callback(this.createError(RangeError, 'Max payload size exceeded', false, 1009, 'WS_ERR_UNSUPPORTED_MESSAGE_LENGTH'));
        this._fragments.push(buffer);
      }
      this.dataMessage(callback);
      if (this._state === GET_INFO) this.startLoop(callback);
    });
  }

  dataMessage(callback) {
    if (!this._fin) { this._state = GET_INFO; return; }
    const messageLength = this._messageLength;
    const fragments = this._fragments;
    this._totalPayloadLength = 0;
    this._messageLength = 0;
    this._fragmented = 0;
    this._numFragments = 0;
    this._fragments = [];

    if (this._opcode === 2) {
      let data;
      if (this._binaryType === 'nodebuffer') data = concat(fragments, messageLength);
      else if (this._binaryType === 'arraybuffer') data = toArrayBuffer(concat(fragments, messageLength));
      else if (this._binaryType === 'blob') data = new Blob(fragments);
      else data = fragments;
      this.emitOrDefer('message', [data, true], callback);
    } else {
      const data = concat(fragments, messageLength);
      if (!this._skipUTF8Validation && !isValidUTF8(data)) return callback(this.createError(Error, 'invalid UTF-8 sequence', true, 1007, 'WS_ERR_INVALID_UTF8'));
      if (this._state === INFLATING || this._allowSynchronousEvents) { this.emit('message', data, false); this._state = GET_INFO; }
      else this.emitOrDefer('message', [data, false], callback);
    }
  }

  controlMessage(data, callback) {
    if (this._opcode === 0x08) {
      if (data.length === 0) { this._loop = false; this.emit('conclude', 1005, EMPTY_BUFFER); this.end(); }
      else {
        const code = data.readUInt16BE(0);
        if (!isValidStatusCode(code)) return callback(this.createError(RangeError, 'invalid status code ' + code, true, 1002, 'WS_ERR_INVALID_CLOSE_CODE'));
        const reason = new FastBuffer(data.buffer, data.byteOffset + 2, data.length - 2);
        if (!this._skipUTF8Validation && !isValidUTF8(reason)) return callback(this.createError(Error, 'invalid UTF-8 sequence', true, 1007, 'WS_ERR_INVALID_UTF8'));
        this._loop = false;
        this.emit('conclude', code, reason);
        this.end();
      }
      this._state = GET_INFO;
      return;
    }
    this.emitOrDefer(this._opcode === 0x09 ? 'ping' : 'pong', [data], callback);
  }

  emitOrDefer(event, args, callback) {
    if (this._allowSynchronousEvents) { this.emit(event, ...args); this._state = GET_INFO; return; }
    this._state = DEFER_EVENT;
    setImmediate(() => { this.emit(event, ...args); this._state = GET_INFO; this.startLoop(callback); });
  }

  createError(ErrorType, message, prefix, statusCode, errorCode) {
    this._loop = false;
    this._errored = true;
    const error = new ErrorType(prefix ? 'Invalid WebSocket frame: ' + message : message);
    Error.captureStackTrace(error, this.createError);
    error.code = errorCode;
    error[kStatusCode] = statusCode;
    return error;
  }
}

module.exports = Receiver;
