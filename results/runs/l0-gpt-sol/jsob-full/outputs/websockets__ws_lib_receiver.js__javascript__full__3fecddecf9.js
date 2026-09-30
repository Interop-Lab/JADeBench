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

class Receiver extends Writable {
  constructor(options = {}) {
    super();

    this._allowSynchronousEvents =
      options.allowSynchronousEvents !== undefined
        ? options.allowSynchronousEvents
        : true;
    this._binaryType = options.binaryType || BINARY_TYPES[0];
    this._extensions = options.extensions || {};
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
    this._opcode = 0;
    this._totalPayloadLength = 0;
    this._messageLength = 0;
    this._fragments = [];
    this._errored = false;
    this._loop = false;
    this._state = GET_INFO;
    this._fin = false;
    this._fragmented = 0;
    this._payload = EMPTY_BUFFER;
    this._message = null;
    this._utf8 = null;
  }

  _write(chunk, encoding, callback) {
    this._bufferedBytes += chunk.length;
    this._buffers.push(chunk);
    this.startLoop(callback);
  }

  consume(n) {
    this._bufferedBytes -= n;

    if (n === this._buffers[0].length) {
      return this._buffers.shift();
    }

    if (n < this._buffers[0].length) {
      const buf = this._buffers[0];
      this._buffers[0] = new FastBuffer(buf.buffer, buf.byteOffset + n, buf.length - n);
      return new FastBuffer(buf.buffer, buf.byteOffset, n);
    }

    const dst = Buffer.allocUnsafe(n);
    let offset = 0;

    while (offset < n) {
      const buf = this._buffers[0];
      const length = Math.min(n - offset, buf.length);

      dst.set(new Uint8Array(buf.buffer, buf.byteOffset, length), offset);
      offset += length;

      if (length === buf.length) {
        this._buffers.shift();
      } else {
        this._buffers[0] = new FastBuffer(
          buf.buffer,
          buf.byteOffset + length,
          buf.length - length
        );
      }
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
          this.getPayloadLength16();
          break;
        case GET_PAYLOAD_LENGTH_64:
          this.getPayloadLength64();
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

    if (!this._errored && cb) cb();
  }

  getInfo(cb) {
    if (this._bufferedBytes < 2) {
      this._loop = false;
      return;
    }

    const buf = this.consume(2);
    this._fin = (buf[0] & 0x80) === 0x80;
    this._opcode = buf[0] & 0x0f;
    this._payloadLength = buf[1] & 0x7f;

    if (this._opcode === 0x00) {
      if (this._fragmented === 0) {
        this.protocolError('invalid opcode', cb);
        return;
      }
      this._compressed = false;
    } else if (this._opcode === 0x01 || this._opcode === 0x02) {
      if (this._fragmented !== 0) {
        this.protocolError('invalid opcode', cb);
        return;
      }
      this._fragmented = this._opcode;
      this._compressed = (buf[0] & 0x40) === 0x40;
    } else if (this._opcode > 0x07 && this._opcode < 0x0b) {
      if (!this._fin) {
        this.protocolError('control frames must not be fragmented', cb);
        return;
      }
      if (this._payloadLength > 0x7d) {
        this.protocolError('control frame length cannot be greater than 125 bytes', cb);
        return;
      }
      this._compressed = false;
    } else {
      this.protocolError('invalid opcode', cb);
      return;
    }

    if (!this._fin && this._opcode > 0x00 && this._opcode < 0x03) {
      this._fragmented = this._opcode;
    }

    this._masked = (buf[1] & 0x80) === 0x80;

    if (this._isServer && !this._masked) {
      this.protocolError('MASK must be set', cb);
      return;
    }

    if (!this._isServer && this._masked) {
      this.protocolError('MASK must not be set', cb);
      return;
    }

    if (this._payloadLength === 126) {
      this._state = GET_PAYLOAD_LENGTH_16;
    } else if (this._payloadLength === 127) {
      this._state = GET_PAYLOAD_LENGTH_64;
    } else {
      this.haveLength = true;
      this._state = this._masked ? GET_MASK : GET_DATA;
    }
  }

  getPayloadLength16() {
    if (this._bufferedBytes < 2) {
      this._loop = false;
      return;
    }

    this._payloadLength = this.consume(2).readUInt16BE(0);
    this.haveLength = true;
    this._state = this._masked ? GET_MASK : GET_DATA;
  }

  getPayloadLength64() {
    if (this._bufferedBytes < 8) {
      this._loop = false;
      return;
    }

    const buf = this.consume(8);

    if (buf[0] !== 0 || buf[1] !== 0 || buf[2] !== 0 || buf[3] !== 0) {
      this.protocolError('invalid payload length', null);
      return;
    }

    this._payloadLength = buf.readUInt32BE(4);

    if (this._payloadLength > 0x7fffffff) {
      this.protocolError('invalid payload length', null);
      return;
    }

    this.haveLength = true;
    this._state = this._masked ? GET_MASK : GET_DATA;
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
    if (this._payloadLength && this._bufferedBytes < this._payloadLength) {
      this._loop = false;
      return;
    }

    const data = this._payloadLength ? this.consume(this._payloadLength) : EMPTY_BUFFER;

    if (this._masked) {
      unmask(data, this._mask);
      this._mask = undefined;
    }

    if (this._opcode < 0x08) {
      this._messageLength += data.length;

      if (this._messageLength > this._maxPayload && this._maxPayload > 0) {
        this.error(
          RangeError,
          'Max payload size exceeded',
          1009,
          'WS_ERR_UNSUPPORTED_MESSAGE_LENGTH',
          cb
        );
        return;
      }

      if (this._fin) {
        this._state = GET_INFO;
        this._messageLength = 0;

        if (this._compressed) {
          this._state = INFLATING;
          this.decompress(data, cb);
          return;
        }

        this.dataMessage(data, cb);
        return;
      }

      this._fragments.push(data);
      this._state = GET_INFO;
      return;
    }

    this.controlMessage(data, cb);
  }

  decompress(data, cb) {
    const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];

    perMessageDeflate.decompress(data, this._fin, (err, data) => {
      if (err) {
        this.error(
          Error,
          'invalid compressed data',
          1007,
          'WS_ERR_INVALID_DATA',
          cb
        );
        return;
      }

      this._state = GET_INFO;
      this.dataMessage(data, cb);
    });
  }

  dataMessage(data, cb) {
    if (this._opcode === 0x01) {
      this._fragments.push(data);
      this._messageLength += data.length;

      const message = concat(this._fragments, this._messageLength);
      this._fragments = [];
      this._messageLength = 0;
      this._fragmented = 0;

      if (!this._skipUTF8Validation && !isValidUTF8(message)) {
        this.error(Error, 'invalid UTF-8 sequence', 1007, 'WS_ERR_INVALID_UTF8', cb);
        return;
      }

      this.emit('message', message, false);
      return;
    }

    if (this._opcode === 0x02) {
      this._fragments.push(data);
      this._messageLength += data.length;

      const message = concat(this._fragments, this._messageLength);
      this._fragments = [];
      this._messageLength = 0;
      this._fragmented = 0;

      this.emit('message', message, true);
      return;
    }

    this._fragments.push(data);

    if (!this._fin) return;

    const message = concat(this._fragments, this._messageLength);
    this._fragments = [];
    this._messageLength = 0;
    this._fragmented = 0;

    if (this._fragmented === 0x01) {
      if (!this._skipUTF8Validation && !isValidUTF8(message)) {
        this.error(Error, 'invalid UTF-8 sequence', 1007, 'WS_ERR_INVALID_UTF8', cb);
        return;
      }
      this.emit('message', message, false);
    } else {
      this.emit('message', message, true);
    }
  }

  controlMessage(data, cb) {
    if (this._opcode === 0x08) {
      if (data.length === 1) {
        this.error(Error, 'invalid payload length', 1002, 'WS_ERR_INVALID_CONTROL_MESSAGE', cb);
        return;
      }

      if (data.length >= 2) {
        const code = data.readUInt16BE(0);

        if (!isValidStatusCode(code)) {
          this.error(Error, 'invalid status code', 1002, 'WS_ERR_INVALID_CONTROL_MESSAGE', cb);
          return;
        }

        if (data.length > 2 && !this._skipUTF8Validation && !isValidUTF8(data.subarray(2))) {
          this.error(Error, 'invalid UTF-8 sequence', 1007, 'WS_ERR_INVALID_UTF8', cb);
          return;
        }
      }

      this.emit('conclude', data);
      this._state = GET_INFO;
      return;
    }

    if (this._opcode === 0x09) {
      this.emit('ping', data);
    } else {
      this.emit('pong', data);
    }

    this._state = GET_INFO;
  }

  protocolError(message, cb) {
    this.error(Error, message, 1002, 'WS_ERR_PROTOCOL_ERROR', cb);
  }

  error(ErrorType, message, statusCode, errorCode, cb) {
    this._loop = false;
    this._errored = true;

    const err = new ErrorType(message);
    err[kStatusCode] = statusCode;
    err.code = errorCode;

    if (cb) {
      cb(err);
    } else {
      this.emit('error', err);
    }
  }

  _final(callback) {
    if (this._bufferedBytes === 0 && this._state === GET_INFO) {
      callback();
      return;
    }

    callback(new Error('invalid frame'));
  }
}

module.exports = Receiver;
