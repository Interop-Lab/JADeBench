'use strict';

const { Writable } = require('stream');
const { isUtf8 } = require('buffer');

const BINARY_TYPES = ['nodebuffer', 'arraybuffer', 'fragments'];
if (typeof Blob !== 'undefined') BINARY_TYPES.push('blob');

const EMPTY_BUFFER = Buffer.alloc(0);
const kStatusCode = Symbol('status-code');
const PERMESSAGE_DEFLATE = 'permessage-deflate';

const GET_INFO = 0;
const GET_PAYLOAD_LENGTH_16 = 1;
const GET_PAYLOAD_LENGTH_64 = 2;
const GET_MASK = 3;
const GET_DATA = 4;
const INFLATING = 5;
const DEFER_EVENT = 6;

function concat(buffers, length) {
  if (buffers.length === 0) return EMPTY_BUFFER;
  if (buffers.length === 1) return buffers[0];

  const result = Buffer.allocUnsafe(length);
  let offset = 0;
  for (const buffer of buffers) {
    result.set(buffer, offset);
    offset += buffer.length;
  }
  return offset < length ? result.subarray(0, offset) : result;
}

function toArrayBuffer(buffer) {
  if (buffer.byteLength === buffer.buffer.byteLength) return buffer.buffer;
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
}

function unmask(buffer, mask) {
  for (let i = 0; i < buffer.length; i++) buffer[i] ^= mask[i & 3];
}

function isValidUTF8(buffer) {
  if (isUtf8) return isUtf8(buffer);

  let index = 0;
  while (index < buffer.length) {
    const byte = buffer[index];
    if ((byte & 0x80) === 0) {
      index++;
    } else if ((byte & 0xe0) === 0xc0) {
      if (index + 1 >= buffer.length || (buffer[index + 1] & 0xc0) !== 0x80 || (byte & 0xfe) === 0xc0) return false;
      index += 2;
    } else if ((byte & 0xf0) === 0xe0) {
      if (
        index + 2 >= buffer.length ||
        (buffer[index + 1] & 0xc0) !== 0x80 ||
        (buffer[index + 2] & 0xc0) !== 0x80 ||
        (byte === 0xe0 && (buffer[index + 1] & 0xe0) === 0x80) ||
        (byte === 0xed && (buffer[index + 1] & 0xe0) === 0xa0)
      ) return false;
      index += 3;
    } else if ((byte & 0xf8) === 0xf0) {
      if (
        index + 3 >= buffer.length ||
        (buffer[index + 1] & 0xc0) !== 0x80 ||
        (buffer[index + 2] & 0xc0) !== 0x80 ||
        (buffer[index + 3] & 0xc0) !== 0x80 ||
        (byte === 0xf0 && (buffer[index + 1] & 0xf0) === 0x80) ||
        (byte === 0xf4 && buffer[index + 1] > 0x8f) ||
        byte > 0xf4
      ) return false;
      index += 4;
    } else {
      return false;
    }
  }
  return true;
}

function isValidStatusCode(code) {
  return (
    (code >= 1000 && code <= 1014 && code !== 1004 && code !== 1005 && code !== 1006) ||
    (code >= 3000 && code <= 4999)
  );
}

class Receiver extends Writable {
  constructor(options = {}) {
    super();

    this._allowSynchronousEvents = options.allowSynchronousEvents !== undefined
      ? options.allowSynchronousEvents
      : true;
    this._binaryType = options.binaryType || BINARY_TYPES[0];
    this._extensions = options.extensions || {};
    this._isServer = Boolean(options.isServer);
    this._maxPayload = options.maxPayload | 0;
    this._skipUTF8Validation = Boolean(options.skipUTF8Validation);

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

    const result = Buffer.allocUnsafe(length);
    let offset = 0;
    while (length > 0) {
      const buffer = this._buffers[0];
      const consumed = Math.min(length, buffer.length);
      result.set(buffer.subarray(0, consumed), offset);
      offset += consumed;
      length -= consumed;
      if (consumed === buffer.length) this._buffers.shift();
      else this._buffers[0] = buffer.subarray(consumed);
    }
    return result;
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
      callback(this.createError(RangeError, 'RSV2 and RSV3 must be clear', true, 1002, 'WS_ERR_UNEXPECTED_RSV_2_3'));
      return;
    }

    const compressed = (buffer[0] & 0x40) === 0x40;
    this._fin = (buffer[0] & 0x80) === 0x80;
    this._opcode = buffer[0] & 0x0f;
    this._payloadLength = buffer[1] & 0x7f;

    if (this._opcode === 0x00) {
      if (compressed) {
        callback(this.createError(RangeError, 'RSV1 must be clear', true, 1002, 'WS_ERR_UNEXPECTED_RSV_1'));
        return;
      }
      if (this._fragmented === 0) {
        callback(this.createError(RangeError, 'invalid opcode 0', true, 1002, 'WS_ERR_INVALID_OPCODE'));
        return;
      }
      this._opcode = this._fragmented;
    } else if (this._opcode === 0x01 || this._opcode === 0x02) {
      if (this._fragmented !== 0) {
        callback(this.createError(RangeError, `invalid opcode ${this._opcode}`, true, 1002, 'WS_ERR_INVALID_OPCODE'));
        return;
      }
      this._compressed = compressed;
    } else if (this._opcode > 0x07 && this._opcode < 0x0b) {
      if (!this._fin) {
        callback(this.createError(RangeError, 'FIN must be set', true, 1002, 'WS_ERR_EXPECTED_FIN'));
        return;
      }
      if (compressed) {
        callback(this.createError(RangeError, 'RSV1 must be clear', true, 1002, 'WS_ERR_UNEXPECTED_RSV_1'));
        return;
      }
      if (this._payloadLength > 125) {
        callback(this.createError(RangeError, `invalid payload length ${this._payloadLength}`, true, 1002, 'WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH'));
        return;
      }
    } else {
      callback(this.createError(RangeError, `invalid opcode ${this._opcode}`, true, 1002, 'WS_ERR_INVALID_OPCODE'));
      return;
    }

    if (compressed && !this._extensions[PERMESSAGE_DEFLATE]) {
      callback(this.createError(RangeError, 'RSV1 must be clear', true, 1002, 'WS_ERR_UNEXPECTED_RSV_1'));
      return;
    }

    if (!this._fin && this._fragmented === 0) this._fragmented = this._opcode;

    this._masked = (buffer[1] & 0x80) === 0x80;
    if (this._isServer && !this._masked) {
      callback(this.createError(RangeError, 'MASK must be set', true, 1002, 'WS_ERR_EXPECTED_MASK'));
      return;
    }
    if (!this._isServer && this._masked) {
      callback(this.createError(RangeError, 'MASK must be clear', true, 1002, 'WS_ERR_UNEXPECTED_MASK'));
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
    if (high > 0x1fffff) {
      callback(this.createError(RangeError, 'Unsupported WebSocket frame: payload length > 2^53 - 1', false, 1009, 'WS_ERR_UNSUPPORTED_DATA_PAYLOAD_LENGTH'));
      return;
    }
    this._payloadLength = high * 2 ** 32 + buffer.readUInt32BE(4);
    this.haveLength(callback);
  }

  haveLength(callback) {
    if (this._payloadLength && this._opcode < 0x08) {
      this._totalPayloadLength += this._payloadLength;
      if (this._maxPayload > 0 && this._totalPayloadLength > this._maxPayload) {
        callback(this.createError(RangeError, 'Max payload size exceeded', false, 1009, 'WS_ERR_UNSUPPORTED_MESSAGE_LENGTH'));
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
      if (this._masked && (this._mask[0] | this._mask[1] | this._mask[2] | this._mask[3]) !== 0) unmask(data, this._mask);
    }

    if (this._opcode > 0x07) {
      this.controlMessage(data, callback);
    } else if (this._compressed) {
      this._state = INFLATING;
      this.decompress(data, callback);
    } else {
      if (data.length) {
        this._messageLength = this._totalPayloadLength;
        this._fragments.push(data);
      }
      this.dataMessage(callback);
    }
  }

  decompress(data, callback) {
    const extension = this._extensions[PERMESSAGE_DEFLATE];
    extension.decompress(data, this._fin, (error, buffer) => {
      if (error) return callback(error);

      if (buffer.length) {
        this._messageLength += buffer.length;
        if (this._maxPayload > 0 && this._messageLength > this._maxPayload) {
          callback(this.createError(RangeError, 'Max payload size exceeded', false, 1009, 'WS_ERR_UNSUPPORTED_MESSAGE_LENGTH'));
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

    let data;
    if (this._opcode === 2) {
      if (this._binaryType === 'nodebuffer') data = concat(fragments, messageLength);
      else if (this._binaryType === 'arraybuffer') data = toArrayBuffer(concat(fragments, messageLength));
      else if (this._binaryType === 'blob') data = new Blob(fragments);
      else data = fragments;
    } else {
      data = concat(fragments, messageLength);
      if (!this._skipUTF8Validation && !isValidUTF8(data)) {
        callback(this.createError(Error, 'invalid UTF-8 sequence', true, 1007, 'WS_ERR_INVALID_UTF8'));
        return;
      }
    }

    if (this._allowSynchronousEvents) {
      this.emit('message', data, this._opcode === 2);
      this._state = GET_INFO;
      return;
    }

    this._state = DEFER_EVENT;
    setImmediate(() => {
      this.emit('message', data, this._opcode === 2);
      this._state = GET_INFO;
      this.startLoop(callback);
    });
  }

  controlMessage(data, callback) {
    if (this._opcode === 0x08) {
      if (data.length === 0) {
        this.emit('conclude', 1005, EMPTY_BUFFER);
        this.end();
        this._loop = false;
        return;
      }
      if (data.length === 1) {
        callback(this.createError(RangeError, 'invalid payload length 1', true, 1002, 'WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH'));
        return;
      }

      const code = data.readUInt16BE(0);
      if (!isValidStatusCode(code)) {
        callback(this.createError(RangeError, `invalid status code ${code}`, true, 1002, 'WS_ERR_INVALID_CLOSE_CODE'));
        return;
      }
      const reason = data.subarray(2);
      if (!this._skipUTF8Validation && !isValidUTF8(reason)) {
        callback(this.createError(Error, 'invalid UTF-8 sequence', true, 1007, 'WS_ERR_INVALID_UTF8'));
        return;
      }
      this.emit('conclude', code, reason);
      this.end();
      this._loop = false;
      return;
    }

    const event = this._opcode === 0x09 ? 'ping' : 'pong';
    if (this._allowSynchronousEvents) {
      this.emit(event, data);
      this._state = GET_INFO;
      return;
    }

    this._state = DEFER_EVENT;
    setImmediate(() => {
      this.emit(event, data);
      this._state = GET_INFO;
      this.startLoop(callback);
    });
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
