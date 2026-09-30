'use strict';

const { Writable } = require('stream');

const BINARY_TYPES = ['nodebuffer', 'arraybuffer', 'fragments'];
if (typeof Blob !== 'undefined') BINARY_TYPES.push('blob');

const EMPTY_BUFFER = Buffer.alloc(0);
const kStatusCode = Symbol('status-code');
const kWebSocket = Symbol('websocket');

const GET_INFO = 0;
const GET_PAYLOAD_LENGTH_16 = 1;
const GET_PAYLOAD_LENGTH_64 = 2;
const GET_MASK = 3;
const GET_DATA = 4;
const INFLATING = 5;
const DEFER_EVENT = 6;

let nativeUnmask;
try {
  nativeUnmask = require('bufferutil').unmask;
} catch {
  nativeUnmask = null;
}

let nativeUTF8Validator;
try {
  nativeUTF8Validator = require('utf-8-validate');
} catch {
  nativeUTF8Validator = null;
}

function concat(fragments, totalLength) {
  if (fragments.length === 0) return EMPTY_BUFFER;
  if (fragments.length === 1) return fragments[0];

  const target = Buffer.allocUnsafe(totalLength);
  let offset = 0;
  for (const fragment of fragments) {
    target.set(fragment, offset);
    offset += fragment.length;
  }
  return offset < totalLength ? target.subarray(0, offset) : target;
}

function toArrayBuffer(buffer) {
  if (buffer.byteLength === buffer.buffer.byteLength) return buffer.buffer;
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
}

function unmask(buffer, mask) {
  if (nativeUnmask && buffer.length >= 32) {
    nativeUnmask(buffer, mask);
    return;
  }
  for (let i = 0; i < buffer.length; i++) buffer[i] ^= mask[i & 3];
}

function isValidStatusCode(code) {
  return (
    (code >= 1000 && code <= 1014 && code !== 1004 && code !== 1005 && code !== 1006) ||
    (code >= 3000 && code <= 4999)
  );
}

function isValidUTF8(buffer) {
  if (buffer.length < 24 || !nativeUTF8Validator) {
    try {
      return new TextDecoder('utf-8', { fatal: true }).decode(buffer) !== undefined;
    } catch {
      return false;
    }
  }
  return nativeUTF8Validator(buffer);
}

class Receiver extends Writable {
  constructor(options = {}) {
    super();

    this._allowSynchronousEvents = options.allowSynchronousEvents !== undefined
      ? options.allowSynchronousEvents
      : true;
    this._binaryType = options.binaryType || BINARY_TYPES[0];
    this._extensions = options.extensions || {};
    this._isServer = options.isServer || false;
    this._maxPayload = options.maxPayload | 0;
    this._skipUTF8Validation = options.skipUTF8Validation || false;

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
    if (this._opcode === 0x08 && this._state === GET_INFO) return callback();

    this._bufferedBytes += chunk.length;
    this._buffers.push(chunk);
    this.startLoop(callback);
  }

  consume(length) {
    this._bufferedBytes -= length;

    if (length === this._buffers[0].length) return this._buffers.shift();

    if (length < this._buffers[0].length) {
      const buffer = this._buffers[0];
      this._buffers[0] = buffer.subarray(length);
      return buffer.subarray(0, length);
    }

    const target = Buffer.allocUnsafe(length);
    let offset = 0;

    do {
      const buffer = this._buffers[0];
      const bytesToCopy = Math.min(length - offset, buffer.length);
      target.set(buffer.subarray(0, bytesToCopy), offset);
      offset += bytesToCopy;

      if (bytesToCopy === buffer.length) this._buffers.shift();
      else this._buffers[0] = buffer.subarray(bytesToCopy);
    } while (offset < length);

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
          throw new Error('Unknown receiver state');
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
      const error = this.createError(
        RangeError,
        'RSV2 and RSV3 must be clear',
        true,
        1002,
        'WS_ERR_UNEXPECTED_RSV_2_3'
      );
      callback(error);
      return;
    }

    const compressed = (buffer[0] & 0x40) === 0x40;
    if (compressed && !this._extensions['permessage-deflate']) {
      const error = this.createError(
        RangeError,
        'RSV1 must be clear',
        true,
        1002,
        'WS_ERR_UNEXPECTED_RSV_1'
      );
      callback(error);
      return;
    }

    this._fin = (buffer[0] & 0x80) === 0x80;
    this._opcode = buffer[0] & 0x0f;
    this._payloadLength = buffer[1] & 0x7f;

    if (this._opcode === 0x00) {
      if (compressed) {
        const error = this.createError(
          RangeError,
          'RSV1 must be clear',
          true,
          1002,
          'WS_ERR_UNEXPECTED_RSV_1'
        );
        callback(error);
        return;
      }
      if (!this._fragmented) {
        const error = this.createError(
          RangeError,
          'invalid opcode 0',
          true,
          1002,
          'WS_ERR_INVALID_OPCODE'
        );
        callback(error);
        return;
      }
      this._opcode = this._fragmented;
    } else if (this._opcode === 0x01 || this._opcode === 0x02) {
      if (this._fragmented) {
        const error = this.createError(
          RangeError,
          `invalid opcode ${this._opcode}`,
          true,
          1002,
          'WS_ERR_INVALID_OPCODE'
        );
        callback(error);
        return;
      }
      this._compressed = compressed;
    } else if (this._opcode > 0x07 && this._opcode < 0x0b) {
      if (!this._fin) {
        const error = this.createError(
          RangeError,
          'FIN must be set',
          true,
          1002,
          'WS_ERR_EXPECTED_FIN'
        );
        callback(error);
        return;
      }
      if (compressed) {
        const error = this.createError(
          RangeError,
          'RSV1 must be clear',
          true,
          1002,
          'WS_ERR_UNEXPECTED_RSV_1'
        );
        callback(error);
        return;
      }
      if (this._payloadLength > 0x7d || (this._opcode === 0x08 && this._payloadLength === 1)) {
        const error = this.createError(
          RangeError,
          `invalid payload length ${this._payloadLength}`,
          true,
          1002,
          'WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH'
        );
        callback(error);
        return;
      }
    } else {
      const error = this.createError(
        RangeError,
        `invalid opcode ` + this._opcode,
        true,
        1002,
        'WS_ERR_INVALID_OPCODE'
      );
      callback(error);
      return;
    }

    if (!this._fin && !this._fragmented) this._fragmented = this._opcode;
    this._masked = (buffer[1] & 0x80) === 0x80;

    if (this._isServer) {
      if (!this._masked) {
        const error = this.createError(
          RangeError,
          'MASK must be set',
          true,
          1002,
          'WS_ERR_EXPECTED_MASK'
        );
        callback(error);
        return;
      }
    } else if (this._masked) {
      const error = this.createError(
        RangeError,
        'MASK must be clear',
        true,
        1002,
        'WS_ERR_UNEXPECTED_MASK'
      );
      callback(error);
      return;
    }

    if (this._payloadLength === 126) this._state = GET_PAYLOAD_LENGTH_16;
    else if (this._payloadLength === 127) this._state = GET_PAYLOAD_LENGTH_64;
    else this.haveLength(callback);
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
      const error = this.createError(
        RangeError,
        'Unsupported WebSocket frame: payload length > 2^53 - 1',
        false,
        1009,
        'WS_ERR_UNSUPPORTED_DATA_PAYLOAD_LENGTH'
      );
      callback(error);
      return;
    }

    this._payloadLength = high * Math.pow(2, 32) + buffer.readUInt32BE(4);
    this.haveLength(callback);
  }

  haveLength(callback) {
    if (this._payloadLength && this._opcode < 0x08) {
      this._totalPayloadLength += this._payloadLength;
      if (this._maxPayload > 0 && this._totalPayloadLength > this._maxPayload) {
        const error = this.createError(
          RangeError,
          'Max payload size exceeded',
          false,
          1009,
          'WS_ERR_UNSUPPORTED_MESSAGE_LENGTH'
        );
        callback(error);
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
      if (this._masked && (this._mask[0] | this._mask[1] | this._mask[2] | this._mask[3]) !== 0) {
        unmask(data, this._mask);
      }
    }

    if (this._opcode > 0x07) {
      this.controlMessage(data, callback);
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
    const extension = this._extensions['permessage-deflate'];
    extension.decompress(data, this._fin, (error, buffer) => {
      if (error) return callback(error);

      if (buffer.length) {
        this._messageLength += buffer.length;
        if (this._maxPayload > 0 && this._messageLength > this._maxPayload) {
          const maxPayloadError = this.createError(
            RangeError,
            'Max payload size exceeded',
            false,
            1009,
            'WS_ERR_UNSUPPORTED_MESSAGE_LENGTH'
          );
          callback(maxPayloadError);
          return;
        }
        this._fragments.push(buffer);
      }

      this.dataMessage(callback);
      if (this._state === GET_INFO) this.startLoop(callback);
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
      if (this._binaryType === 'nodebuffer') data = concat(fragments, messageLength);
      else if (this._binaryType === 'arraybuffer') data = toArrayBuffer(concat(fragments, messageLength));
      else if (this._binaryType === 'blob') data = new Blob(fragments);
      else data = fragments;

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
      const error = this.createError(
        Error,
        'invalid UTF-8 sequence',
        true,
        1007,
        'WS_ERR_INVALID_UTF8'
      );
      callback(error);
      return;
    }

    if (this._state === INFLATING || this._allowSynchronousEvents) {
      this.emit('message', buffer, false);
      this._state = GET_INFO;
    } else {
      this._state = DEFER_EVENT;
      setImmediate(() => {
        this.emit('message', buffer, false);
        this._state = GET_INFO;
        this.startLoop(callback);
      });
    }
  }

  controlMessage(data, callback) {
    if (this._opcode === 0x08) {
      if (data.length === 0) {
        this._loop = false;
        this.emit('conclude', 1005, EMPTY_BUFFER);
        this.end();
        return;
      }

      const code = data.readUInt16BE(0);
      if (!isValidStatusCode(code)) {
        const error = this.createError(
          RangeError,
          `invalid status code ${code}`,
          true,
          1002,
          'WS_ERR_INVALID_CLOSE_CODE'
        );
        callback(error);
        return;
      }

      const reason = data.subarray(2);
      if (!this._skipUTF8Validation && !isValidUTF8(reason)) {
        const error = this.createError(
          Error,
          'invalid UTF-8 sequence',
          true,
          1007,
          'WS_ERR_INVALID_UTF8'
        );
        callback(error);
        return;
      }

      this._loop = false;
      this.emit('conclude', code, reason);
      this.end();
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

  createError(ErrorType, message, prefix, statusCode, errorCode) {
    this._loop = false;
    this._errored = true;

    const error = new ErrorType(prefix ? `Invalid WebSocket frame: ${message}` : message);
    Error.captureStackTrace(error, this.createError);
    error.code = errorCode;
    error[kStatusCode] = statusCode;
    return error;
  }
}

module.exports = Receiver;
