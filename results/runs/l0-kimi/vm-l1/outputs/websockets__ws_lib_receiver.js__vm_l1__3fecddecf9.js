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
    this._extensions = options.extensions || null;
    this._isServer = !!options.isServer;
    this._maxPayload = options.maxPayload | 0;
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

    this._state = GET_INFO;
    this._loop = false;
  }

  _write(chunk, encoding, cb) {
    if (this._opcode === 0x08 && this._state == GET_INFO) return cb();

    this._bufferedBytes += chunk.length;
    if (this._buffers.push(chunk) > 1) this._buffers = [concat(this._buffers)];

    this.startLoop(cb);
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

    do {
      const buf = this._buffers[0];
      const len = buf.length;

      if (n >= len) {
        dst.set(this._buffers.shift(), dst.length - n);
        n -= len;
      } else {
        dst.set(new FastBuffer(buf.buffer, buf.byteOffset, n), dst.length - n);
        this._buffers[0] = new FastBuffer(buf.buffer, buf.byteOffset + n, len - n);
        break;
      }
    } while (n > 0);

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
          this.getMask(cb);
          break;
        case GET_DATA:
          this.getData(cb);
          break;
        default:
          this._loop = false;
          return;
      }
    } while (this._loop);

    cb();
  }

  getInfo(cb) {
    if (this._bufferedBytes < 2) {
      this._loop = false;
      return cb();
    }

    const buf = this.consume(2);

    if ((buf[0] & 0x30) !== 0x00) {
      const error = this.createError(
        RangeError,
        'RSV2 and RSV3 must be clear',
        true,
        1002,
        'WS_ERR_UNEXPECTED_RSV_BITS'
      );

      cb(error);
      return;
    }

    const compressed = (buf[0] & 0x40) === 0x40;
    const isContinuation = (buf[0] & 0x0f) === 0x00;
    const isControl = (buf[0] & 0x08) === 0x08;

    if (
      (compressed && !this._extensions[PerMessageDeflate.extensionName]) ||
      (this._opcode === 0x08 && !isContinuation) ||
      (isControl && !isContinuation)
    ) {
      const error = this.createError(
        RangeError,
        'invalid opcode',
        true,
        1002,
        'WS_ERR_INVALID_OPCODE'
      );

      cb(error);
      return;
    }

    const fin = (buf[0] & 0x80) === 0x80;
    const opcode = buf[0] & 0x0f;
    const fragmented = !fin && !isControl;
    const masked = (buf[1] & 0x80) === 0x80;

    if (!isContinuation) {
      if (opcode === 0x00) {
        const error = this.createError(
          RangeError,
          'invalid opcode',
          true,
          1002,
          'WS_ERR_INVALID_OPCODE'
        );

        cb(error);
        return;
      }

      this._opcode = opcode;

      if (isControl) {
        if (opcode !== 0x08 && opcode !== 0x09 && opcode !== 0x0a) {
          const error = this.createError(
            RangeError,
            'invalid opcode',
            true,
            1002,
            'WS_ERR_INVALID_OPCODE'
          );

          cb(error);
          return;
        }

        if (!fin) {
          const error = this.createError(
            RangeError,
            'FIN must be set',
            true,
            1002,
            'WS_ERR_EXPECTED_FIN'
          );

          cb(error);
          return;
        }

        if (this._payloadLength > 0x7d) {
          const error = this.createError(
            RangeError,
            'invalid payload length',
            true,
            1002,
            'WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH'
          );

          cb(error);
          return;
        }
      } else if (opcode !== 0x00 && opcode !== 0x01 && opcode !== 0x02) {
        const error = this.createError(
          RangeError,
          'invalid opcode',
          true,
          1002,
          'WS_ERR_INVALID_OPCODE'
        );

        cb(error);
        return;
      }
    }

    if (this._opcode === 0x00 && this._fragmented === 0) {
      const error = this.createError(
        RangeError,
        'invalid opcode',
        true,
        1002,
        'WS_ERR_INVALID_OPCODE'
      );

      cb(error);
      return;
    }

    this._fin = fin;
    this._fragmented = fragmented;
    this._masked = masked;
    this._payloadLength = buf[1] & 0x7f;

    if (this._payloadLength === 126) {
      this._state = GET_PAYLOAD_LENGTH_16;
    } else if (this._payloadLength === 127) {
      this._state = GET_PAYLOAD_LENGTH_64;
    } else {
      return this.haveLength(cb);
    }

    if (this._isServer) {
      this._state = GET_MASK;
    }
  }

  getPayloadLength16(cb) {
    if (this._bufferedBytes < 2) {
      this._loop = false;
      return cb();
    }

    this._payloadLength = this.consume(2).readUInt16BE(0);
    return this.haveLength(cb);
  }

  getPayloadLength64(cb) {
    if (this._bufferedBytes < 8) {
      this._loop = false;
      return cb();
    }

    const buf = this.consume(8);
    const num = buf.readUInt32BE(0);

    if (num > Math.pow(2, 53 - 32) - 1) {
      const error = this.createError(
        RangeError,
        'Unsupported WebSocket frame: payload length > 2^53 - 1',
        false,
        1009,
        'WS_ERR_UNSUPPORTED_DATA_PAYLOAD_LENGTH'
      );

      cb(error);
      return;
    }

    this._payloadLength = num * Math.pow(2, 32) + buf.readUInt32BE(4);
    return this.haveLength(cb);
  }

  haveLength(cb) {
    if (this._payloadLength && this._opcode < 0x08) {
      this._totalPayloadLength += this._payloadLength;
      if (this._totalPayloadLength > this._maxPayload && this._maxPayload > 0) {
        const error = this.createError(
          RangeError,
          'Max payload size exceeded',
          false,
          1009,
          'WS_ERR_UNSUPPORTED_MESSAGE_LENGTH'
        );

        cb(error);
        return;
      }
    }

    if (this._masked) this._state = GET_MASK;
    else this._state = GET_DATA;
  }

  getMask(cb) {
    if (this._bufferedBytes < 4) {
      this._loop = false;
      return cb();
    }

    this._mask = this.consume(4);
    this._state = GET_DATA;
  }

  getData(cb) {
    let data = EMPTY_BUFFER;

    if (this._payloadLength) {
      if (this._bufferedBytes < this._payloadLength) {
        this._loop = false;
        return cb();
      }

      data = this.consume(this._payloadLength);
      if (this._masked) unmask(data, this._mask);
    }

    if (this._opcode > 0x07) return this.controlMessage(data, cb);

    if (this._compressed) {
      this._state = INFLATING;
      this.decompress(data, cb);
      return;
    }

    if (data.length) {
      this._messageLength = this._totalPayloadLength;
      this._fragments.push(data);
    }

    return this.dataMessage(cb);
  }

  decompress(data, cb) {
    const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];

    perMessageDeflate.decompress(data, this._fin, (err, buf) => {
      if (err) {
        cb(err);
        return;
      }

      if (buf.length) {
        this._messageLength += buf.length;
        if (this._messageLength > this._maxPayload && this._maxPayload > 0) {
          const error = this.createError(
            RangeError,
            'Max payload size exceeded',
            false,
            1009,
            'WS_ERR_UNSUPPORTED_MESSAGE_LENGTH'
          );

          cb(error);
          return;
        }

        this._fragments.push(buf);
      }

      this.dataMessage(cb);
      if (this._state === GET_INFO) this.startLoop(cb);
    });
  }

  dataMessage(cb) {
    if (this._fin) {
      const messageLength = this._messageLength;
      const fragments = this._fragments;

      this._totalPayloadLength = 0;
      this._messageLength = 0;
      this._fragmented = 0;
      this._fragments = [];

      if (this._opcode === 2) {
        let data;

        if (this._binaryType === 'nodebuffer') {
          data = concat(fragments, messageLength);
        } else if (this._binaryType === 'arraybuffer') {
          data = toArrayBuffer(concat(fragments, messageLength));
        } else {
          data = fragments;
        }

        this.emit('message', data, true);
      } else {
        const buf = concat(fragments, messageLength);

        if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
          const error = this.createError(
            Error,
            'invalid UTF-8 sequence',
            true,
            1007,
            'WS_ERR_INVALID_UTF8'
          );

          cb(error);
          return;
        }

        this.emit('message', buf.toString(), false);
      }
    }

    this._state = GET_INFO;
  }

  controlMessage(data, cb) {
    if (this._opcode === 0x08) {
      this._loop = false;

      if (data.length === 0) {
        this.emit('conclude', 1005, EMPTY_BUFFER);
        this.end();
      } else if (data.length === 1) {
        const error = this.createError(
          RangeError,
          'invalid payload length 1',
          true,
          1002,
          'WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH'
        );

        cb(error);
      } else {
        const code = data.readUInt16BE(0);

        if (!isValidStatusCode(code)) {
          const error = this.createError(
            RangeError,
            'invalid status code',
            true,
            1002,
            'WS_ERR_INVALID_CLOSE_CODE'
          );

          cb(error);
          return;
        }

        const buf = new FastBuffer(data.buffer, data.byteOffset + 2, data.length - 2);

        if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
          const error = this.createError(
            Error,
            'invalid UTF-8 sequence',
            true,
            1007,
            'WS_ERR_INVALID_UTF8'
          );

          cb(error);
          return;
        }

        this.emit('conclude', code, buf);
        this.end();
      }

      return;
    }

    if (this._opcode === 0x09) {
      this.emit('ping', data);
    } else {
      this.emit('pong', data);
    }

    this._state = GET_INFO;
  }

  createError(ErrorCtor, message, prefix, statusCode, errorCode) {
    let err;

    if (message.length > 123) {
      err = new ErrorCtor(
        prefix ? 'Invalid WebSocket frame: ' + message : message
      );
    } else {
      err = new ErrorCtor(message);
    }

    Error.captureStackTrace(err, this.createError);
    err.code = errorCode;
    err[kStatusCode] = statusCode;
    return err;
  }
}

module.exports = Receiver;
