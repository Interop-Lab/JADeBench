'use strict';

const { isUtf8 } = require('buffer');
const { Writable } = require('stream');

const BINARY_TYPES = ['nodebuffer', 'arraybuffer', 'fragments'];
if (typeof Blob !== 'undefined') BINARY_TYPES.push('blob');

const EMPTY_BUFFER = Buffer.alloc(0);
const kStatusCode = Symbol('status-code');
const kWebSocket = Symbol('websocket');
const FastBuffer = Buffer[Symbol.species];
const PERMESSAGE_DEFLATE = 'permessage-deflate';

const GET_INFO = 0;
const GET_PAYLOAD_LENGTH_16 = 1;
const GET_PAYLOAD_LENGTH_64 = 2;
const GET_MASK = 3;
const GET_DATA = 4;
const INFLATING = 5;
const DEFER_EVENT = 6;

function concat(buffers, totalLength) {
  if (buffers.length === 0) return EMPTY_BUFFER;
  if (buffers.length === 1) return buffers[0];

  const target = Buffer.allocUnsafe(totalLength);
  let offset = 0;
  for (const buffer of buffers) {
    target.set(buffer, offset);
    offset += buffer.length;
  }

  if (offset < totalLength) {
    return new FastBuffer(target.buffer, target.byteOffset, offset);
  }
  return target;
}

function toArrayBuffer(buffer) {
  if (buffer.length === buffer.buffer.byteLength) return buffer.buffer;
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.length);
}

function unmask(buffer, mask) {
  for (let index = 0; index < buffer.length; index += 1) {
    buffer[index] ^= mask[index & 3];
  }
}

function isValidStatusCode(code) {
  return (
    (code >= 1000 &&
      code <= 1014 &&
      code !== 1004 &&
      code !== 1005 &&
      code !== 1006) ||
    (code >= 3000 && code <= 4999)
  );
}

function isValidUTF8(buffer) {
  if (isUtf8) return isUtf8(buffer);

  let index = 0;
  while (index < buffer.length) {
    if ((buffer[index] & 0x80) === 0) {
      index += 1;
    } else if ((buffer[index] & 0xe0) === 0xc0) {
      if (
        index + 1 === buffer.length ||
        (buffer[index + 1] & 0xc0) !== 0x80 ||
        (buffer[index] & 0xfe) === 0xc0
      ) return false;
      index += 2;
    } else if ((buffer[index] & 0xf0) === 0xe0) {
      if (
        index + 2 >= buffer.length ||
        (buffer[index + 1] & 0xc0) !== 0x80 ||
        (buffer[index + 2] & 0xc0) !== 0x80 ||
        (buffer[index] === 0xe0 && (buffer[index + 1] & 0xe0) === 0x80) ||
        (buffer[index] === 0xed && (buffer[index + 1] & 0xe0) === 0xa0)
      ) return false;
      index += 3;
    } else if ((buffer[index] & 0xf8) === 0xf0) {
      if (
        index + 3 >= buffer.length ||
        (buffer[index + 1] & 0xc0) !== 0x80 ||
        (buffer[index + 2] & 0xc0) !== 0x80 ||
        (buffer[index + 3] & 0xc0) !== 0x80 ||
        (buffer[index] === 0xf0 && (buffer[index + 1] & 0xf0) === 0x80) ||
        (buffer[index] === 0xf4 && buffer[index + 1] > 0x8f) ||
        buffer[index] > 0xf4
      ) return false;
      index += 4;
    } else {
      return false;
    }
  }
  return true;
}

class Receiver extends Writable {
  constructor(options = {}) {
    super();

    const {
      allowSynchronousEvents = true,
      binaryType = BINARY_TYPES[0],
      extensions = {},
      isServer = false,
      maxBufferedChunks = 0,
      maxFragments = 0,
      maxPayload = 0,
      skipUTF8Validation = false,
    } = options;

    this._allowSynchronousEvents = allowSynchronousEvents;
    this._binaryType = binaryType;
    this._extensions = extensions;
    this._isServer = isServer;
    this._maxBufferedChunks = maxBufferedChunks;
    this._maxFragments = maxFragments;
    this._maxPayload = maxPayload;
    this._skipUTF8Validation = skipUTF8Validation;
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
    this._numFragments = 0;
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

    if (
      this._maxBufferedChunks > 0 &&
      this._buffers.length > this._maxBufferedChunks
    ) {
      callback(this.createError(
        RangeError,
        'Too many buffered chunks',
        false,
        1008,
        'WS_ERR_TOO_MANY_BUFFERED_PARTS',
      ));
      return;
    }

    this.startLoop(callback);
  }

  consume(length) {
    this._bufferedBytes -= length;

    if (length === this._buffers[0].length) return this._buffers.shift();

    if (length < this._buffers[0].length) {
      const buffer = this._buffers[0];
      this._buffers[0] = new FastBuffer(
        buffer.buffer,
        buffer.byteOffset + length,
        buffer.length - length,
      );
      return new FastBuffer(buffer.buffer, buffer.byteOffset, length);
    }

    const target = Buffer.allocUnsafe(length);
    let offset = 0;
    do {
      const buffer = this._buffers[0];
      if (length >= buffer.length) {
        target.set(this._buffers.shift(), offset);
        offset += buffer.length;
        length -= buffer.length;
      } else {
        target.set(new Uint8Array(buffer.buffer, buffer.byteOffset, length), offset);
        this._buffers[0] = new FastBuffer(
          buffer.buffer,
          buffer.byteOffset + length,
          buffer.length - length,
        );
        offset += length;
        length = 0;
      }
    } while (length > 0);

    return target;
  }

  startLoop(callback) {
    this._loop = true;
    do {
      switch (this._state) {
        case GET_INFO:
          this.getInfo(callback);
          break;
        case GET_PAYLOAD_LENGTH_16:
          this.getPayloadLength16(callback);
          break;
        case GET_PAYLOAD_LENGTH_64:
          this.getPayloadLength64(callback);
          break;
        case GET_MASK:
          this.getMask();
          break;
        case GET_DATA:
          this.getData(callback);
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

    if (!this._errored) callback();
  }

  getInfo(callback) {
    if (this._bufferedBytes < 2) {
      this._loop = false;
      return;
    }

    const buffer = this.consume(2);
    if ((buffer[0] & 0x30) !== 0) {
      callback(this.createError(
        RangeError,
        'RSV2 and RSV3 must be clear',
        true,
        1002,
        'WS_ERR_UNEXPECTED_RSV_2_3',
      ));
      return;
    }

    const compressed = (buffer[0] & 0x40) === 0x40;
    if (compressed && !this._extensions[PERMESSAGE_DEFLATE]) {
      callback(this.createError(
        RangeError,
        'RSV1 must be clear',
        true,
        1002,
        'WS_ERR_UNEXPECTED_RSV_1',
      ));
      return;
    }

    this._fin = (buffer[0] & 0x80) === 0x80;
    this._opcode = buffer[0] & 0x0f;
    this._payloadLength = buffer[1] & 0x7f;

    if (this._opcode === 0x00) {
      if (compressed) {
        callback(this.createError(
          RangeError,
          'RSV1 must be clear',
          true,
          1002,
          'WS_ERR_UNEXPECTED_RSV_1',
        ));
        return;
      }
      if (!this._fragmented) {
        callback(this.createError(
          RangeError,
          'invalid opcode 0',
          true,
          1002,
          'WS_ERR_INVALID_OPCODE',
        ));
        return;
      }
      this._opcode = this._fragmented;
    } else if (this._opcode === 0x01 || this._opcode === 0x02) {
      if (this._fragmented) {
        callback(this.createError(
          RangeError,
          `invalid opcode ${this._opcode}`,
          true,
          1002,
          'WS_ERR_INVALID_OPCODE',
        ));
        return;
      }
      this._compressed = compressed;
    } else if (this._opcode > 0x07 && this._opcode < 0x0b) {
      if (!this._fin) {
        callback(this.createError(
          RangeError,
          'FIN must be set',
          true,
          1002,
          'WS_ERR_EXPECTED_FIN',
        ));
        return;
      }
      if (compressed) {
        callback(this.createError(
          RangeError,
          'RSV1 must be clear',
          true,
          1002,
          'WS_ERR_UNEXPECTED_RSV_1',
        ));
        return;
      }
      if (this._payloadLength > 0x7d) {
        callback(this.createError(
          RangeError,
          `invalid payload length ${this._payloadLength}`,
          true,
          1002,
          'WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH',
        ));
        return;
      }
    } else {
      callback(this.createError(
        RangeError,
        `invalid opcode ${this._opcode}`,
        true,
        1002,
        'WS_ERR_INVALID_OPCODE',
      ));
      return;
    }

    if (!this._fin && !this._fragmented) this._fragmented = this._opcode;

    this._masked = (buffer[1] & 0x80) === 0x80;
    if (this._isServer && !this._masked) {
      callback(this.createError(
        RangeError,
        'MASK must be set',
        true,
        1002,
        'WS_ERR_EXPECTED_MASK',
      ));
      return;
    }
    if (!this._isServer && this._masked) {
      callback(this.createError(
        RangeError,
        'MASK must be clear',
        true,
        1002,
        'WS_ERR_UNEXPECTED_MASK',
      ));
      return;
    }

    if (this._payloadLength === 126) {
      this._state = GET_PAYLOAD_LENGTH_16;
    } else if (this._payloadLength === 127) {
      this._state = GET_PAYLOAD_LENGTH_64;
    } else {
      this.haveLength(callback);
    }
  }

  getPayloadLength16(callback) {
    if (this._bufferedBytes < 2) {
      this._loop = false;
      return;
    }
    this._payloadLength = this.consume(2).readUInt16BE(0);
    this.haveLength(callback);
  }

  getPayloadLength64(callback) {
    if (this._bufferedBytes < 8) {
      this._loop = false;
      return;
    }

    const buffer = this.consume(8);
    const high = buffer.readUInt32BE(0);
    if (high > Math.pow(2, 53 - 32) - 1) {
      callback(this.createError(
        RangeError,
        'Unsupported WebSocket frame: payload length > 2^53 - 1',
        false,
        1009,
        'WS_ERR_UNSUPPORTED_DATA_PAYLOAD_LENGTH',
      ));
      return;
    }

    this._payloadLength = high * Math.pow(2, 32) + buffer.readUInt32BE(4);
    this.haveLength(callback);
  }

  haveLength(callback) {
    if (this._payloadLength && this._opcode < 0x08) {
      this._totalPayloadLength += this._payloadLength;
      if (this._maxPayload > 0 && this._totalPayloadLength > this._maxPayload) {
        callback(this.createError(
          RangeError,
          'Max payload size exceeded',
          false,
          1009,
          'WS_ERR_UNSUPPORTED_MESSAGE_LENGTH',
        ));
        return;
      }
    }
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
      ) unmask(data, this._mask);
    }

    if (this._opcode > 0x07) {
      this.controlMessage(data, callback);
      return;
    }

    if (
      this._maxFragments > 0 &&
      ++this._numFragments > this._maxFragments
    ) {
      callback(this.createError(
        RangeError,
        'Too many message fragments',
        false,
        1008,
        'WS_ERR_TOO_MANY_BUFFERED_PARTS',
      ));
      return;
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
    this.dataMessage(callback);
  }

  decompress(data, callback) {
    this._extensions[PERMESSAGE_DEFLATE].decompress(
      data,
      this._fin,
      (error, buffer) => {
        if (error) {
          callback(error);
          return;
        }

        if (buffer.length) {
          this._messageLength += buffer.length;
          if (this._maxPayload > 0 && this._messageLength > this._maxPayload) {
            callback(this.createError(
              RangeError,
              'Max payload size exceeded',
              false,
              1009,
              'WS_ERR_UNSUPPORTED_MESSAGE_LENGTH',
            ));
            return;
          }
          this._fragments.push(buffer);
          this._numFragments += 1;
        }

        this.dataMessage(callback);
        if (this._state === GET_INFO) this.startLoop(callback);
      },
    );
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
    this._numFragments = 0;

    let data;
    let isBinary;
    if (this._opcode === 0x02) {
      isBinary = true;
      if (this._binaryType === 'nodebuffer') {
        data = concat(fragments, messageLength);
      } else if (this._binaryType === 'arraybuffer') {
        data = toArrayBuffer(concat(fragments, messageLength));
      } else if (this._binaryType === 'blob') {
        data = new Blob(fragments);
      } else {
        data = fragments;
      }
    } else {
      data = concat(fragments, messageLength);
      isBinary = false;
      if (!this._skipUTF8Validation && !isValidUTF8(data)) {
        callback(this.createError(
          Error,
          'invalid UTF-8 sequence',
          true,
          1007,
          'WS_ERR_INVALID_UTF8',
        ));
        return;
      }
    }

    if (this._allowSynchronousEvents) {
      this.emit('message', data, isBinary);
      this._state = GET_INFO;
      return;
    }

    this._state = DEFER_EVENT;
    setImmediate(() => {
      this.emit('message', data, isBinary);
      this._state = GET_INFO;
      this.startLoop(callback);
    });
  }

  controlMessage(data, callback) {
    if (this._opcode === 0x08) {
      if (data.length === 0) {
        this._loop = false;
        this.emit('conclude', 1005, EMPTY_BUFFER);
        this.end();
      } else {
        const code = data.readUInt16BE(0);
        if (!isValidStatusCode(code)) {
          callback(this.createError(
            RangeError,
            `invalid status code ${code}`,
            true,
            1002,
            'WS_ERR_INVALID_CLOSE_CODE',
          ));
          return;
        }

        const reason = new FastBuffer(
          data.buffer,
          data.byteOffset + 2,
          data.length - 2,
        );
        if (!this._skipUTF8Validation && !isValidUTF8(reason)) {
          callback(this.createError(
            Error,
            'invalid UTF-8 sequence',
            true,
            1007,
            'WS_ERR_INVALID_UTF8',
          ));
          return;
        }

        this._loop = false;
        this.emit('conclude', code, reason);
        this.end();
      }
      this._state = GET_INFO;
      return;
    }

    const eventName = this._opcode === 0x09 ? 'ping' : 'pong';
    if (this._allowSynchronousEvents) {
      this.emit(eventName, data);
      this._state = GET_INFO;
      return;
    }

    this._state = DEFER_EVENT;
    setImmediate(() => {
      this.emit(eventName, data);
      this._state = GET_INFO;
      this.startLoop(callback);
    });
  }

  createError(ErrorCtor, message, prefix, statusCode, errorCode) {
    this._loop = false;
    this._errored = true;

    const error = new ErrorCtor(
      prefix ? `Invalid WebSocket frame: ${message}` : message,
    );
    Error.captureStackTrace(error, this.createError);
    error.code = errorCode;
    error[kStatusCode] = statusCode;
    return error;
  }
}

module.exports = Receiver;
