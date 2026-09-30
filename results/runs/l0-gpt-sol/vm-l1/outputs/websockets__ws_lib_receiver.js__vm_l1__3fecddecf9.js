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
    this._fin = false;
    this._opcode = 0;

    this._totalPayloadLength = 0;
    this._messageLength = 0;
    this._fragments = [];

    this._errored = false;
    this._loop = false;
    this._state = GET_INFO;
  }

  _write(chunk, encoding, callback) {
    if (this._opcode === 0x08 && this._state === GET_INFO) {
      callback();
      return;
    }

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
      const buffer = this._buffers[0];

      this._buffers[0] = new FastBuffer(
        buffer.buffer,
        buffer.byteOffset + n,
        buffer.length - n
      );

      return new FastBuffer(buffer.buffer, buffer.byteOffset, n);
    }

    const destination = Buffer.allocUnsafe(n);

    do {
      const buffer = this._buffers[0];
      const offset = destination.length - n;

      if (n >= buffer.length) {
        destination.set(this._buffers.shift(), offset);
        n -= buffer.length;
      } else {
        destination.set(
          new Uint8Array(buffer.buffer, buffer.byteOffset, n),
          offset
        );

        this._buffers[0] = new FastBuffer(
          buffer.buffer,
          buffer.byteOffset + n,
          buffer.length - n
        );
        n = 0;
      }
    } while (n > 0);

    return destination;
  }

  startLoop(callback) {
    this._loop = true;
    let error;

    do {
      switch (this._state) {
        case GET_INFO:
          error = this.getInfo();
          break;
        case GET_PAYLOAD_LENGTH_16:
          error = this.getPayloadLength16();
          break;
        case GET_PAYLOAD_LENGTH_64:
          error = this.getPayloadLength64();
          break;
        case GET_MASK:
          this.getMask();
          break;
        case GET_DATA:
          error = this.getData(callback);
          break;
        case INFLATING:
        case DEFER_EVENT:
          this._loop = false;
          return;
        default:
          this._loop = false;
          return;
      }
    } while (this._loop);

    callback(error);
  }

  getInfo() {
    if (this._bufferedBytes < 2) {
      this._loop = false;
      return;
    }

    const buffer = this.consume(2);

    if ((buffer[0] & 0x30) !== 0) {
      return this.createError(
        RangeError,
        'RSV2 and RSV3 must be clear',
        true,
        1002,
        'WS_ERR_UNEXPECTED_RSV_2_3'
      );
    }

    const compressed = (buffer[0] & 0x40) === 0x40;

    if (
      compressed &&
      !this._extensions[PerMessageDeflate.extensionName]
    ) {
      return this.createError(
        RangeError,
        'RSV1 must be clear',
        true,
        1002,
        'WS_ERR_UNEXPECTED_RSV_1'
      );
    }

    this._fin = (buffer[0] & 0x80) === 0x80;
    this._opcode = buffer[0] & 0x0f;
    this._payloadLength = buffer[1] & 0x7f;

    if (this._opcode === 0x00) {
      if (compressed) {
        return this.createError(
          RangeError,
          'RSV1 must be clear',
          true,
          1002,
          'WS_ERR_UNEXPECTED_RSV_1'
        );
      }

      if (this._fragmented === 0) {
        return this.createError(
          RangeError,
          'invalid opcode 0',
          true,
          1002,
          'WS_ERR_INVALID_OPCODE'
        );
      }

      this._opcode = this._fragmented;
    } else if (this._opcode === 0x01 || this._opcode === 0x02) {
      if (this._fragmented !== 0) {
        return this.createError(
          RangeError,
          `invalid opcode ${this._opcode}`,
          true,
          1002,
          'WS_ERR_INVALID_OPCODE'
        );
      }

      this._compressed = compressed;
    } else if (this._opcode > 0x07 && this._opcode < 0x0b) {
      if (!this._fin) {
        return this.createError(
          RangeError,
          'FIN must be set',
          true,
          1002,
          'WS_ERR_EXPECTED_FIN'
        );
      }

      if (compressed) {
        return this.createError(
          RangeError,
          'RSV1 must be clear',
          true,
          1002,
          'WS_ERR_UNEXPECTED_RSV_1'
        );
      }

      if (
        this._payloadLength > 125 ||
        (this._opcode === 0x08 && this._payloadLength === 1)
      ) {
        return this.createError(
          RangeError,
          `invalid payload length ${this._payloadLength}`,
          true,
          1002,
          'WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH'
        );
      }
    } else {
      return this.createError(
        RangeError,
        `invalid opcode ${this._opcode}`,
        true,
        1002,
        'WS_ERR_INVALID_OPCODE'
      );
    }

    if (!this._fin && this._fragmented === 0) {
      this._fragmented = this._opcode;
    }

    this._masked = (buffer[1] & 0x80) === 0x80;

    if (this._isServer) {
      if (!this._masked) {
        return this.createError(
          RangeError,
          'MASK must be set',
          true,
          1002,
          'WS_ERR_EXPECTED_MASK'
        );
      }
    } else if (this._masked) {
      return this.createError(
        RangeError,
        'MASK must be clear',
        true,
        1002,
        'WS_ERR_UNEXPECTED_MASK'
      );
    }

    if (this._payloadLength === 126) {
      this._state = GET_PAYLOAD_LENGTH_16;
    } else if (this._payloadLength === 127) {
      this._state = GET_PAYLOAD_LENGTH_64;
    } else {
      return this.haveLength();
    }
  }

  getPayloadLength16() {
    if (this._bufferedBytes < 2) {
      this._loop = false;
      return;
    }

    this._payloadLength = this.consume(2).readUInt16BE(0);
    return this.haveLength();
  }

  getPayloadLength64() {
    if (this._bufferedBytes < 8) {
      this._loop = false;
      return;
    }

    const buffer = this.consume(8);
    const high = buffer.readUInt32BE(0);

    if (high > 0x1fffff) {
      return this.createError(
        RangeError,
        'Unsupported WebSocket frame: payload length > 2^53 - 1',
        false,
        1009,
        'WS_ERR_UNSUPPORTED_DATA_PAYLOAD_LENGTH'
      );
    }

    this._payloadLength = high * 0x100000000 + buffer.readUInt32BE(4);
    return this.haveLength();
  }

  haveLength() {
    if (this._payloadLength && this._opcode < 0x08) {
      this._totalPayloadLength += this._payloadLength;

      if (
        this._totalPayloadLength > this._maxPayload &&
        this._maxPayload > 0
      ) {
        return this.createError(
          RangeError,
          'Max payload size exceeded',
          false,
          1009,
          'WS_ERR_UNSUPPORTED_MESSAGE_LENGTH'
        );
      }
    }

    if (this._masked) {
      this._state = GET_MASK;
    } else {
      this._state = GET_DATA;
    }
  }

  getMask() {
    if (this._bufferedBytes < 4) {
      this._loop = false;
      return;
    }

    this._mask = this.consume(4);
    this._state = GET_DATA;
  }

  getData(callback) {
    let data = EMPTY_BUFFER;

    if (this._payloadLength) {
      if (this._bufferedBytes < this._payloadLength) {
        this._loop = false;
        return;
      }

      data = this.consume(this._payloadLength);

      if (
        this._masked &&
        (this._mask[0] | this._mask[1] | this._mask[2] | this._mask[3]) !== 0
      ) {
        unmask(data, this._mask);
      }
    }

    if (this._opcode > 0x07) {
      return this.controlMessage(data, callback);
    }

    if (this._compressed) {
      this._state = INFLATING;
      this.decompress(data, callback);
      return;
    }

    if (data.length) {
      this._messageLength = this._totalPayloadLength;
      this._fragments.push(data);
    }

    return this.dataMessage(callback);
  }

  decompress(data, callback) {
    const perMessageDeflate =
      this._extensions[PerMessageDeflate.extensionName];

    perMessageDeflate.decompress(data, this._fin, (error, buffer) => {
      if (error) {
        callback(error);
        return;
      }

      if (buffer.length) {
        this._messageLength += buffer.length;

        if (
          this._messageLength > this._maxPayload &&
          this._maxPayload > 0
        ) {
          callback(
            this.createError(
              RangeError,
              'Max payload size exceeded',
              false,
              1009,
              'WS_ERR_UNSUPPORTED_MESSAGE_LENGTH'
            )
          );
          return;
        }

        this._fragments.push(buffer);
      }

      const messageError = this.dataMessage(callback);

      if (messageError) {
        callback(messageError);
      } else if (this._state === GET_INFO) {
        this.startLoop(callback);
      }
    });
  }

  dataMessage(callback) {
    if (!this._fin) {
      this._state = GET_INFO;
      return;
    }

    const messageLength = this._messageLength;
    const fragments = this._fragments;

    this._totalPayloadLength = 0;
    this._messageLength = 0;
    this._fragmented = 0;
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

      if (this._allowSynchronousEvents) {
        this.emit('message', data, true);
        this._state = GET_INFO;
      } else {
        this._state = DEFER_EVENT;

        setImmediate(() => {
          this.emit('message', data, true);
          this._state = GET_INFO;
          this.startLoop(callback);
        });
      }

      return;
    }

    const buffer = concat(fragments, messageLength);

    if (!this._skipUTF8Validation && !isValidUTF8(buffer)) {
      return this.createError(
        Error,
        'invalid UTF-8 sequence',
        true,
        1007,
        'WS_ERR_INVALID_UTF8'
      );
    }

    const data = buffer.toString();

    if (this._allowSynchronousEvents) {
      this.emit('message', data, false);
      this._state = GET_INFO;
    } else {
      this._state = DEFER_EVENT;

      setImmediate(() => {
        this.emit('message', data, false);
        this._state = GET_INFO;
        this.startLoop(callback);
      });
    }
  }

  controlMessage(data, callback) {
    if (this._opcode === 0x08) {
      if (data.length === 0) {
        this.emit('conclude', 1005, EMPTY_BUFFER);
        this.end();
        this._loop = false;
        return;
      }

      const code = data.readUInt16BE(0);

      if (!isValidStatusCode(code)) {
        return this.createError(
          RangeError,
          `invalid status code ${code}`,
          true,
          1002,
          'WS_ERR_INVALID_CLOSE_CODE'
        );
      }

      const reason = new FastBuffer(
        data.buffer,
        data.byteOffset + 2,
        data.length - 2
      );

      if (!this._skipUTF8Validation && !isValidUTF8(reason)) {
        return this.createError(
          Error,
          'invalid UTF-8 sequence',
          true,
          1007,
          'WS_ERR_INVALID_UTF8'
        );
      }

      this.emit('conclude', code, reason);
      this.end();
      this._loop = false;
      return;
    }

    const eventName = this._opcode === 0x09 ? 'ping' : 'pong';

    if (this._allowSynchronousEvents) {
      this.emit(eventName, data);
      this._state = GET_INFO;
    } else {
      this._state = DEFER_EVENT;

      setImmediate(() => {
        this.emit(eventName, data);
        this._state = GET_INFO;
        this.startLoop(callback);
      });
    }
  }

  createError(ErrorCtor, message, prefix, statusCode, errorCode) {
    this._loop = false;
    this._errored = true;

    const error = new ErrorCtor(
      prefix ? `Invalid WebSocket frame: ${message}` : message
    );

    Error.captureStackTrace(error, this.createError);
    error.code = errorCode;
    error[kStatusCode] = statusCode;

    return error;
  }
}

module.exports = Receiver;
