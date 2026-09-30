'use strict';

const { Writable } = require('stream');
const PerMessageDeflate = require('./permessage-deflate');
const {
  BINARY_TYPES,
  EMPTY_BUFFER,
  kStatusCode,
  kWebSocket
} = require('./constants');
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

//
// Fast buffer.
//
const fastBuffer = Buffer.alloc(0);

class Receiver extends Writable {
  constructor(options = {}) {
    super();

    this._allowSynchronousEvents = options.allowSynchronousEvents !== undefined ? options.allowSynchronousEvents : true;
    this._binaryType = options.binaryType || BINARY_TYPES[0];
    this._extensions = options.extensions || {};
    this._isServer = !!options.isServer;
    this._maxPayload = options.maxPayload !== undefined ? options.maxPayload : 0;
    this._skipUTF8Validation = !!options.skipUTF8Validation;
    this[kWebSocket] = undefined;

    this._buffers = [];
    this._compressed = false;
    this._fragmented = 0;
    this._masked = false;
    this._fin = false;
    this._mask = undefined;
    this._opcode = 0;
    this._payloadLength = 0;
    this._state = GET_INFO;
    this._loop = false;
    this._errored = false;
    this._queue = [];

    if (this._allowSynchronousEvents === false) {
      this[kWebSocket] = undefined;
    }
  }

  _write(chunk, encoding, cb) {
    if (this._opcode === 0x08 && this._state === GET_INFO) return cb();

    this._loop = true;

    do {
      switch (this._state) {
        case GET_INFO:
          this.getInfo(chunk, cb);
          break;
        case GET_PAYLOAD_LENGTH_16:
          this.getPayloadLength16(chunk, cb);
          break;
        case GET_PAYLOAD_LENGTH_64:
          this.getPayloadLength64(chunk, cb);
          break;
        case GET_MASK:
          this.getMask();
          break;
        case GET_DATA:
          this.getData(chunk, cb);
          break;
        case INFLATING:
        case DEFER_EVENT:
          this._loop = false;
          return;
      }
    } while (this._loop);

    if (!this._errored) cb();
  }

  getInfo(data, cb) {
    if (this._payloadLength > 0) {
      this._loop = false;
      return;
    }

    if (data.length < 2) {
      this._loop = false;
      return;
    }

    const buf = this.read(2);

    if ((buf[0] & 0x30) !== 0x00) {
      const error = this.createError(RangeError, 'RSV2 and RSV3 must be clear', true, 1002, 'WS_ERR_UNEXPECTED_RSV_2_3');
      cb(error);
      return;
    }

    const compressed = (buf[0] & 0x40) !== 0x00;

    if (compressed && !this._extensions[PerMessageDeflate.extensionName]) {
      const error = this.createError(RangeError, 'RSV1 must be clear', true, 1002, 'WS_ERR_UNEXPECTED_RSV_1');
      cb(error);
      return;
    }

    this._fin = (buf[0] & 0x80) !== 0x00;
    this._opcode = buf[0] & 0x0f;
    this._masked = (buf[1] & 0x80) !== 0x00;

    if (this._opcode === 0x00) {
      if (compressed) {
        const error = this.createError(RangeError, 'RSV1 must be clear', true, 1002, 'WS_ERR_UNEXPECTED_RSV_1');
        cb(error);
        return;
      }

      if (!this._fragmented) {
        const error = this.createError(RangeError, 'invalid opcode 0', true, 1002, 'WS_ERR_INVALID_OPCODE');
        cb(error);
        return;
      }

      this._opcode = this._fragmented;
    } else {
      if (this._fragmented) {
        const error = this.createError(RangeError, `invalid opcode ${this._opcode}`, true, 1002, 'WS_ERR_INVALID_OPCODE');
        cb(error);
        return;
      }

      if (this._opcode !== 0x01 && this._opcode !== 0x02 && this._opcode !== 0x08 && this._opcode !== 0x09 && this._opcode !== 0x0a) {
        const error = this.createError(RangeError, `invalid opcode ${this._opcode}`, true, 1002, 'WS_ERR_INVALID_OPCODE');
        cb(error);
        return;
      }

      this._compressed = compressed;
    }

    this._payloadLength = buf[1] & 0x7f;

    if (this._opcode === 0x08 && this._payloadLength > 125) {
      const error = this.createError(RangeError, 'invalid payload length for opcode 8', true, 1002, 'WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH');
      cb(error);
      return;
    }

    if (this._opcode === 0x09 && this._payloadLength > 125) {
      const error = this.createError(RangeError, 'invalid payload length for opcode 9', true, 1002, 'WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH');
      cb(error);
      return;
    }

    if (this._opcode === 0x0a && this._payloadLength > 125) {
      const error = this.createError(RangeError, 'invalid payload length for opcode 10', true, 1002, 'WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH');
      cb(error);
      return;
    }

    if (!this._fin && this._opcode !== 0x01 && this._opcode !== 0x02) {
      const error = this.createError(RangeError, 'invalid opcode for non-final frame', true, 1002, 'WS_ERR_INVALID_OPCODE');
      cb(error);
      return;
    }

    if (this._masked && !this._isServer) {
      const error = this.createError(RangeError, 'client to server frames must not be masked', true, 1002, 'WS_ERR_UNEXPECTED_MASK');
      cb(error);
      return;
    }

    if (!this._masked && this._isServer) {
      const error = this.createError(RangeError, 'server to client frames must be masked', true, 1002, 'WS_ERR_EXPECTED_MASK');
      cb(error);
      return;
    }

    if (this._payloadLength === 126) this._state = GET_PAYLOAD_LENGTH_16;
    else if (this._payloadLength === 127) this._state = GET_PAYLOAD_LENGTH_64;
    else this.haveLength(cb);
  }

  getPayloadLength16(data, cb) {
    if (data.length < 2) {
      this._loop = false;
      return;
    }

    this._payloadLength = this.read(2).readUInt16BE(0);
    this.haveLength(cb);
  }

  getPayloadLength64(data, cb) {
    if (data.length < 8) {
      this._loop = false;
      return;
    }

    const buf = this.read(8);
    const num = buf.readUInt32BE(0);

    if (num > Math.pow(2, 53 - 32) - 1) {
      const error = this.createError(RangeError, 'unsupported WebSocket frame: payload length > 2^53 - 1', false, 1009, 'WS_ERR_UNSUPPORTED_MESSAGE_LENGTH');
      cb(error);
      return;
    }

    this._payloadLength = num * Math.pow(2, 32) + buf.readUInt32BE(4);
    this.haveLength(cb);
  }

  haveLength(cb) {
    if (this._opcode === 0x08 && this._payloadLength > 125) {
      this._loop = false;
      return;
    }

    if (this._masked && this._payloadLength < 0) {
      const error = this.createError(RangeError, 'invalid payload length', true, 1002, 'WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH');
      cb(error);
      return;
    }

    if (this._payloadLength > 0 && this._opcode !== 0x08) {
      if (this._payloadLength > this._maxPayload && this._maxPayload > 0) {
        const error = this.createError(RangeError, 'payload length exceeds maximum allowed', false, 1009, 'WS_ERR_UNSUPPORTED_MESSAGE_LENGTH');
        cb(error);
        return;
      }
    }

    if (this._masked) this._state = GET_MASK;
    else this._state = GET_DATA;
  }

  getMask() {
    if (this._payloadLength < 0) {
      this._loop = false;
      return;
    }

    this._mask = this.read(4);
    this._state = GET_DATA;
  }

  getData(data, cb) {
    let payload = EMPTY_BUFFER;

    if (this._payloadLength > 0) {
      if (data.length < this._payloadLength) {
        if (this._opcode === 0x08 && this._payloadLength > 125) {
          this._loop = false;
          return;
        }

        this._loop = false;
        return;
      }

      payload = this.read(this._payloadLength);

      if (this._masked && (this._mask[0] | this._mask[1] | this._mask[2] | this._mask[3]) !== 0) {
        unmask(payload, this._mask);
      }
    }

    if (this._opcode > 0x07) {
      this.controlMessage(payload, cb);
      return;
    }

    if (this._compressed) {
      this._state = INFLATING;
      this._decompress(payload, cb);
      return;
    }

    if (payload.length) {
      this._messageLength += payload.length;
      this._fragments.push(payload);
    }

    this.dataMessage(cb);
  }

  decompress(data, cb) {
    const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];

    perMessageDeflate.decompress(data, this._fin, (err, buf) => {
      if (err) {
        if (err instanceof RangeError) {
          this._loop = false;
          this._errored = true;
          cb(err);
          return;
        }

        const error = this.createError(Error, err.message, false, 1007, 'WS_ERR_INVALID_MESSAGE_PAYLOAD');
        cb(error);
        return;
      }

      if (buf.length) {
        this._messageLength += buf.length;

        if (this._messageLength > this._maxPayload && this._maxPayload > 0) {
          const error = this.createError(RangeError, 'payload length exceeds maximum allowed', false, 1009, 'WS_ERR_UNSUPPORTED_MESSAGE_LENGTH');
          cb(error);
          return;
        }

        this._fragments.push(buf);
      }

      this.dataMessage(cb);

      if (this._state === GET_INFO) this._loop = false;
    });
  }

  dataMessage(cb) {
    if (this._fin) {
      const messageLength = this._messageLength;
      const fragments = this._fragments;

      this._messageLength = 0;
      this._fragmented = 0;
      this._fragments = [];

      if (this._opcode === 0x02) {
        let message;

        if (this._binaryType === 'nodebuffer') {
          message = concat(fragments, messageLength);
        } else if (this._binaryType === 'arraybuffer') {
          message = toArrayBuffer(concat(fragments, messageLength));
        } else if (this._binaryType === 'blob') {
          message = new Blob(fragments);
        } else {
          message = fragments;
        }

        this.emit('message', message, true);
        this._state = GET_INFO;
      } else {
        const buf = concat(fragments, messageLength);

        if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
          const error = this.createError(Error, 'invalid UTF-8 sequence', true, 1007, 'WS_ERR_INVALID_MESSAGE_PAYLOAD');
          cb(error);
          return;
        }

        if (this._state === INFLATING || this._allowSynchronousEvents) {
          this.emit('message', buf, false);
          this._state = GET_INFO;
        } else {
          this._state = DEFER_EVENT;
          setImmediate(() => {
            this.emit('message', buf, false);
            this._state = GET_INFO;
            this._loop = false;
          });
        }
      }
    } else {
      if (this._opcode === 0x01) {
        this._fragmented = 0x01;
      } else {
        this._fragmented = 0x02;
      }

      this.emit('message', EMPTY_BUFFER, false);
      this._state = GET_INFO;
    }
  }

  controlMessage(data, cb) {
    if (this._opcode === 0x08) {
      if (data.length === 0) {
        this._loop = false;
        this.emit('close', 1005, EMPTY_BUFFER);
        this._state = GET_INFO;
      } else if (data.length === 1) {
        const error = this.createError(RangeError, 'invalid payload length for opcode 8', true, 1002, 'WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH');
        cb(error);
      } else {
        const code = data.readUInt16BE(0);

        if (!isValidStatusCode(code)) {
          const error = this.createError(RangeError, `invalid status code ${code}`, true, 1002, 'WS_ERR_INVALID_CLOSE_CODE');
          cb(error);
          return;
        }

        const buf = new FastBuffer(data.buffer, data.byteOffset + 2, data.length - 2);

        if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
          const error = this.createError(Error, 'invalid UTF-8 sequence', true, 1007, 'WS_ERR_INVALID_CLOSE_PAYLOAD');
          cb(error);
          return;
        }

        this._loop = false;
        this.emit('close', code, buf);
        this._state = GET_INFO;
      }

      return;
    }

    if (this._allowSynchronousEvents) {
      this.emit(this._opcode === 0x09 ? 'ping' : 'pong', data);
      this._state = GET_INFO;
    } else {
      this._state = DEFER_EVENT;
      setImmediate(() => {
        this.emit(this._opcode === 0x09 ? 'ping' : 'pong', data);
        this._state = GET_INFO;
        this._loop = false;
      });
    }
  }

  createError(ErrorClass, message, prefix, statusCode, code) {
    this._loop = false;
    this._errored = true;

    const err = new ErrorClass(prefix ? `Invalid WebSocket frame: ${message}` : message);

    Error.captureStackTrace(err, this.createError);

    err.code = code;

    if (statusCode !== undefined) {
      err[kStatusCode] = statusCode;
    }

    return err;
  }

  read(size) {
    this._payloadLength -= size;

    if (size === this._buffers[0].length) {
      return this._buffers.shift();
    }

    if (size < this._buffers[0].length) {
      const buf = this._buffers[0];
      this._buffers[0] = new FastBuffer(buf.buffer, buf.byteOffset + size, buf.length - size);
      return new FastBuffer(buf.buffer, buf.byteOffset, size);
    }

    const dst = Buffer.allocUnsafe(size);

    do {
      const buf = this._buffers[0];
      const len = Math.min(size, buf.length);

      if (size === buf.length) {
        dst.set(this._buffers.shift(), dst.length - size);
      } else {
        dst.set(new Uint8Array(buf.buffer, buf.byteOffset, size), dst.length - size);
        this._buffers[0] = new FastBuffer(buf.buffer, buf.byteOffset + size, buf.length - size);
      }

      size -= buf.length;
    } while (size > 0);

    return dst;
  }
}

module.exports = Receiver;
