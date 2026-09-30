'use strict';

const { Writable } = require('stream');
const PerMessageDeflate = require('./permessage-deflate');
const { BINARY_TYPES, EMPTY_BUFFER, kStatusCode, kWebSocket } = require('./constants');
const { concat, toArrayBuffer, unmask } = require('./buffer-util');
const { isValidStatusCode, isValidUTF8 } = require('./validation');

const FastBuffer = Buffer[Symbol.species];

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

    this._binaryType = options.binaryType || BINARY_TYPES[0];
    this._extensions = options.extensions || {};
    this._isServer = !!options.isServer;
    this._maxPayload = options.maxPayload | 0;
    this._skipUTF8Validation = !!options.skipUTF8Validation;
    this._masked = false;
    this._bufferedBytes = 0;
    this._buffers = [];
    this._compressed = false;
    this._payloadLength = 0;
    this._mask = null;
    this._fragmented = 0;
    this._fragments = [];
    this._state = GET_INFO;
    this._loop = false;
    this[kWebSocket] = undefined;
  }

  _write(chunk, encoding, cb) {
    if (this._state === INFLATING || this._state === DEFER_EVENT) {
      this._buffers.push(chunk);
      this._bufferedBytes += chunk.length;
      if (this._isServer && this._maxPayload > 0 && this._bufferedBytes > this._maxPayload) {
        this._loop = false;
        return cb(this.createError(RangeError, 'Max payload size exceeded', false, 1009, 'WS_ERR_UNSUPPORTED_MESSAGE_LENGTH'));
      }
      this._startLoop(cb);
      return;
    }
    this._buffers.push(chunk);
    this._bufferedBytes += chunk.length;
    this._startLoop(cb);
  }

  consume(n) {
    this._bufferedBytes -= n;

    if (n === this._buffers[0].length) return this._buffers.shift();

    if (n < this._buffers[0].length) {
      const buf = this._buffers[0];
      this._buffers[0] = new FastBuffer(buf.buffer, buf.byteOffset + n, buf.length - n);
      return new FastBuffer(buf.buffer, buf.byteOffset, n);
    }

    const dst = Buffer.allocUnsafe(n);
    let offset = 0;

    while (n > 0) {
      const buf = this._buffers[0];
      const len = buf.length;

      if (n >= len) {
        dst.set(buf, offset);
        offset += len;
        this._buffers.shift();
      } else {
        dst.set(new Uint8Array(buf.buffer, buf.byteOffset, n), offset);
        this._buffers[0] = new FastBuffer(buf.buffer, buf.byteOffset + n, len - n);
      }
      n -= len;
    }

    return dst;
  }

  startLoop(cb) {
    this._loop = true;

    do {
      switch (this._state) {
        case GET_INFO:
          this.getInfo(cb);
          break;
        case GET_PAYLOAD_LENGTH_16:
          this.getPayloadLength16(cb);
          break;
        case GET_PAYLOAD_LENGTH_64:
          this.getPayloadLength64(cb);
          break;
        case GET_MASK:
          this.getMask();
          break;
        case GET_DATA:
          this.getData(cb);
          break;
        case INFLATING:
        case DEFER_EVENT:
          this._loop = false;
          return;
      }
    } while (this._loop);

    if (!this._errored) cb();
  }

  getInfo(cb) {
    if (this._bufferedBytes < 2) {
      this._loop = false;
      return;
    }

    const buf = this.consume(2);

    if ((buf[0] & 0x30) !== 0x00) {
      const error = this.createError(RangeError, 'Invalid WebSocket frame: RSV2 and RSV3 must be clear', true, 1002, 'WS_ERR_UNEXPECTED_RSV_2_3');
      cb(error);
      return;
    }

    const compressed = (buf[0] & 0x40) === 0x40;

    if (compressed && !this._extensions[PerMessageDeflate.extensionName]) {
      const error = this.createError(RangeError, 'Invalid WebSocket frame: RSV1 must be clear', true, 1002, 'WS_ERR_UNEXPECTED_RSV_1');
      cb(error);
      return;
    }

    this._fin = (buf[0] & 0x80) === 0x80;
    this._opcode = buf[0] & 0x0f;
    this._payloadLength = buf[1] & 0x7f;

    if (this._opcode === 0x08) {
      if (!this._isServer) {
        const error = this.createError(RangeError, 'Invalid WebSocket frame: opcode 8 (close) is not allowed in client mode', true, 1002, 'WS_ERR_INVALID_OPCODE');
        cb(error);
        return;
      }
      if (compressed) {
        const error = this.createError(RangeError, 'Invalid WebSocket frame: close frame must not be compressed', true, 1002, 'WS_ERR_INVALID_OPCODE');
        cb(error);
        return;
      }
    } else if (this._opcode === 0x09 || this._opcode === 0x0a) {
      if (!this._isServer) {
        const error = this.createError(RangeError, `Invalid WebSocket frame: opcode ${this._opcode} is not allowed in client mode`, true, 1002, 'WS_ERR_INVALID_OPCODE');
        cb(error);
        return;
      }
      if (this._payloadLength > 0x7d) {
        const error = this.createError(RangeError, `Invalid WebSocket frame: invalid payload length ${this._payloadLength}`, true, 1002, 'WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH');
        cb(error);
        return;
      }
      if (compressed) {
        const error = this.createError(RangeError, `Invalid WebSocket frame: ${this._opcode === 0x09 ? 'ping' : 'pong'} frame must not be compressed`, true, 1002, 'WS_ERR_INVALID_OPCODE');
        cb(error);
        return;
      }
    } else if (this._opcode === 0x00) {
      if (compressed) {
        const error = this.createError(RangeError, 'Invalid WebSocket frame: continuation frame must not be compressed', true, 1002, 'WS_ERR_INVALID_OPCODE');
        cb(error);
        return;
      }
      if (!this._fragmented) {
        const error = this.createError(RangeError, 'Invalid WebSocket frame: unexpected continuation frame', true, 1002, 'WS_ERR_INVALID_OPCODE');
        cb(error);
        return;
      }
    } else if (this._opcode === 0x01 || this._opcode === 0x02) {
      if (this._fragmented) {
        const error = this.createError(RangeError, 'Invalid WebSocket frame: unexpected text or binary frame', true, 1002, 'WS_ERR_INVALID_OPCODE');
        cb(error);
        return;
      }
      this._fragmented = this._opcode;
    } else {
      const error = this.createError(RangeError, `Invalid WebSocket frame: invalid opcode ${this._opcode}`, true, 1002, 'WS_ERR_INVALID_OPCODE');
      cb(error);
      return;
    }

    if (!this._isServer && !this._masked) this._masked = true;

    if (this._isServer) this._masked = (buf[1] & 0x80) === 0x80;

    if (this._payloadLength === 126) this._state = GET_PAYLOAD_LENGTH_16;
    else if (this._payloadLength === 127) this._state = GET_PAYLOAD_LENGTH_64;
    else this.haveLength(cb);
  }

  getPayloadLength16(cb) {
    if (this._bufferedBytes < 2) {
      this._loop = false;
      return;
    }

    this._payloadLength = this.consume(2).readUInt16BE(0);
    this.haveLength(cb);
  }

  getPayloadLength64(cb) {
    if (this._bufferedBytes < 8) {
      this._loop = false;
      return;
    }

    const buf = this.consume(8);
    const num = buf.readUInt32BE(0);

    if (num > Math.pow(2, 53 - 32) - 1) {
      const error = this.createError(RangeError, 'Unsupported WebSocket frame: payload length > 2^53 - 1', false, 1009, 'WS_ERR_UNSUPPORTED_MESSAGE_LENGTH');
      cb(error);
      return;
    }

    this._payloadLength = num * Math.pow(2, 32) + buf.readUInt32BE(4);
    this.haveLength(cb);
  }

  haveLength(cb) {
    if (this._isServer && this._maxPayload > 0 && this._payloadLength > this._maxPayload) {
      const error = this.createError(RangeError, 'Max payload size exceeded', false, 1009, 'WS_ERR_UNSUPPORTED_MESSAGE_LENGTH');
      cb(error);
      return;
    }

    if (this._masked) this._state = GET_MASK;
    else this._state = GET_DATA;
  }

  getMask() {
    if (this._bufferedBytes < 4) {
      this._loop = false;
      return;
    }

    this._mask = this.consume(4);
    this._state = GET_DATA;
  }

  getData(cb) {
    let data = EMPTY_BUFFER;

    if (this._payloadLength) {
      if (this._bufferedBytes < this._payloadLength) {
        this._loop = false;
        return;
      }

      data = this.consume(this._payloadLength);
      if (this._masked && this._mask[0] | this._mask[1] | this._mask[2] | this._mask[3]) {
        unmask(data, this._mask);
      }
    }

    if (this._opcode > 0x07) this.controlMessage(data, cb);
    else if (this._compressed) {
      this._state = INFLATING;
      this.decompress(data, cb);
    } else if (data.length) {
      if (this._fragments.length) {
        this._fragments.push(data);
      } else {
        this._fragments = [data];
      }
    }

    if (this._fin) {
      if (this._opcode === 0x00 || this._opcode === 0x01 || this._opcode === 0x02) {
        this.dataMessage(cb);
        if (this._state === GET_INFO) this.startLoop(cb);
      }
    } else {
      this._state = GET_INFO;
    }
  }

  decompress(data, cb) {
    const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];

    perMessageDeflate.decompress(data, this._fin, (err, buf) => {
      if (err) return cb(err);

      if (buf.length) {
        if (this._fragments.length) {
          this._fragments.push(buf);
        } else {
          this._fragments = [buf];
        }
      }

      this.dataMessage(cb);
      if (this._state === GET_INFO) this.startLoop(cb);
    });
  }

  dataMessage(cb) {
    if (!this._fin) {
      this._state = GET_INFO;
      return;
    }

    const messageLength = this._fragments.reduce((acc, fragment) => acc + fragment.length, 0);

    if (this._isServer && this._maxPayload > 0 && messageLength > this._maxPayload) {
      const error = this.createError(RangeError, 'Max payload size exceeded', false, 1009, 'WS_ERR_UNSUPPORTED_MESSAGE_LENGTH');
      cb(error);
      return;
    }

    const fragments = this._fragments;
    this._fragments = [];

    if (this._opcode === 0x02) {
      let data;

      if (this._binaryType === 'nodebuffer') {
        data = concat(fragments, messageLength);
      } else if (this._binaryType === 'arraybuffer') {
        data = toArrayBuffer(concat(fragments, messageLength));
      } else if (this._binaryType === 'blob') {
        data = new Blob(fragments);
      } else {
        data = fragments;
      }

      if (this[kWebSocket]) {
        this.emit('message', data, true);
        this._state = GET_INFO;
      } else {
        this._state = DEFER_EVENT;
        setImmediate(() => {
          this.emit('message', data, true);
          this._state = GET_INFO;
          this.startLoop(cb);
        });
      }
    } else {
      const buf = concat(fragments, messageLength);

      if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
        const error = this.createError(Error, 'Invalid WebSocket frame: invalid UTF-8 sequence', true, 1007, 'WS_ERR_INVALID_UTF8');
        cb(error);
        return;
      }

      if (this[kWebSocket] || this._state === INFLATING) {
        this.emit('message', buf.toString(), false);
        this._state = GET_INFO;
      } else {
        this._state = DEFER_EVENT;
        setImmediate(() => {
          this.emit('message', buf.toString(), false);
          this._state = GET_INFO;
          this.startLoop(cb);
        });
      }
    }
  }

  controlMessage(data, cb) {
    if (this._opcode === 0x08) {
      this._loop = false;

      if (data.length === 0) {
        this.emit('conclude', 1005, EMPTY_BUFFER);
        this.end();
      } else {
        const code = data.readUInt16BE(0);

        if (!isValidStatusCode(code)) {
          const error = this.createError(RangeError, `Invalid WebSocket frame: invalid status code ${code}`, true, 1002, 'WS_ERR_INVALID_CLOSE_CODE');
          cb(error);
          return;
        }

        const buf = new FastBuffer(data.buffer, data.byteOffset + 2, data.length - 2);

        if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
          const error = this.createError(Error, 'Invalid WebSocket frame: invalid UTF-8 sequence', true, 1007, 'WS_ERR_INVALID_UTF8');
          cb(error);
          return;
        }

        this.emit('conclude', code, buf);
        this.end();
      }
      this._state = GET_INFO;
      return;
    }

    if (this._opcode === 0x09) {
      if (this[kWebSocket]) {
        this.emit('ping', data);
      } else {
        this._state = DEFER_EVENT;
        setImmediate(() => {
          this.emit('ping', data);
          this._state = GET_INFO;
          this.startLoop(cb);
        });
      }
    } else {
      if (this[kWebSocket]) {
        this.emit('pong', data);
      } else {
        this._state = DEFER_EVENT;
        setImmediate(() => {
          this.emit('pong', data);
          this._state = GET_INFO;
          this.startLoop(cb);
        });
      }
    }

    this._state = GET_INFO;
  }

  createError(ErrorCtor, message, prefix, statusCode, errorCode) {
    this._loop = false;
    this._errored = true;

    const err = new ErrorCtor(prefix ? `Invalid WebSocket frame: ${message}` : message);
    Error.captureStackTrace(err, this.constructor);
    err[kStatusCode] = statusCode;
    err.code = errorCode;
    return err;
  }
}

module.exports = Receiver;
