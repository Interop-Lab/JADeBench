'use strict';

const { isUtf8 } = require('buffer');
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
  if (!process.env.WS_NO_BUFFER_UTIL) nativeUnmask = require('bufferutil').unmask;
} catch {}

let nativeIsValidUTF8;
try {
  if (typeof isUtf8 !== 'function' && !process.env.WS_NO_UTF_8_VALIDATE) {
    nativeIsValidUTF8 = require('utf-8-validate');
  }
} catch {}

function concat(list, totalLength) {
  if (list.length === 0) return EMPTY_BUFFER;
  if (list.length === 1) return list[0];

  const target = Buffer.allocUnsafe(totalLength);
  let offset = 0;

  for (const buffer of list) {
    target.set(buffer, offset);
    offset += buffer.length;
  }

  if (offset < totalLength) return target.subarray(0, offset);
  return target;
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
  if (typeof isUtf8 === 'function') {
    return buffer.length < 24 ? isValidUTF8Fallback(buffer) : isUtf8(buffer);
  }
  if (nativeIsValidUTF8) {
    return buffer.length < 32 ? isValidUTF8Fallback(buffer) : nativeIsValidUTF8(buffer);
  }
  return isValidUTF8Fallback(buffer);
}

function isValidUTF8Fallback(buffer) {
  let index = 0;

  while (index < buffer.length) {
    const byte = buffer[index];

    if ((byte & 0x80) === 0) {
      index++;
      continue;
    }

    if ((byte & 0xe0) === 0xc0) {
      if (byte < 0xc2 || index + 1 >= buffer.length || (buffer[index + 1] & 0xc0) !== 0x80) {
        return false;
      }
      index += 2;
      continue;
    }

    if ((byte & 0xf0) === 0xe0) {
      if (index + 2 >= buffer.length) return false;
      const second = buffer[index + 1];
      if (
        (second & 0xc0) !== 0x80 ||
        (buffer[index + 2] & 0xc0) !== 0x80 ||
        (byte === 0xe0 && second < 0xa0) ||
        (byte === 0xed && second >= 0xa0)
      ) {
        return false;
      }
      index += 3;
      continue;
    }

    if ((byte & 0xf8) === 0xf0) {
      if (index + 3 >= buffer.length) return false;
      const second = buffer[index + 1];
      if (
        byte > 0xf4 ||
        (second & 0xc0) !== 0x80 ||
        (buffer[index + 2] & 0xc0) !== 0x80 ||
        (buffer[index + 3] & 0xc0) !== 0x80 ||
        (byte === 0xf0 && second < 0x90) ||
        (byte === 0xf4 && second >= 0x90)
      ) {
        return false;
      }
      index += 4;
      continue;
    }

    return false;
  }

  return true;
}

class Receiver extends Writable {
  constructor(options = {}) {
    super();

    this._allowSynchronousEvents =
      options.allowSynchronousEvents !== undefined ? options.allowSynchronousEvents : true;
    this._binaryType = options.binaryType || BINARY_TYPES[0];
    this._extensions = options.extensions || {};
    this._isServer = !!options.isServer;
    this._maxBufferedChunks = options.maxBufferedChunks | 0;
    this._maxFragments = options.maxFragments | 0;
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
    this._numFragments = 0;
    this._fragments = [];
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
      this._buffers[0] = buffer.subarray(length);
      return buffer.subarray(0, length);
    }

    const target = Buffer.allocUnsafe(length);
    let offset = 0;

    do {
      const buffer = this._buffers[0];
      const bytesToRead = Math.min(length - offset, buffer.length);
      target.set(buffer.subarray(0, bytesToRead), offset);
      offset += bytesToRead;

      if (bytesToRead === buffer.length) this._buffers.shift();
      else this._buffers[0] = buffer.subarray(bytesToRead);
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

    if (compressed && !this._extensions['permessage-deflate']) {
      callback(this.createError(RangeError, 'RSV1 must be clear', true, 1002, 'WS_ERR_UNEXPECTED_RSV_1'));
      return;
    }

    this._fin = (buffer[0] & 0x80) === 0x80;
    this._opcode = buffer[0] & 0x0f;
    this._payloadLength = buffer[1] & 0x7f;

    if (this._opcode === 0x00) {
      if (compressed) {
        callback(this.createError(RangeError, 'RSV1 must be clear', true, 1002, 'WS_ERR_UNEXPECTED_RSV_1'));
        return;
      }
      if (!this._fragmented) {
        callback(this.createError(RangeError, 'invalid opcode 0', true, 1002, 'WS_ERR_INVALID_OPCODE'));
        return;
      }
      this._opcode = this._fragmented;
    } else if (this._opcode === 0x01 || this._opcode === 0x02) {
      if (this._fragmented) {
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
      if (this._payloadLength > 0x7d || (this._opcode === 0x08 && this._payloadLength === 1)) {
        callback(this.createError(RangeError, `invalid payload length ${this._payloadLength}`, true, 1002, 'WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH'));
        return;
      }
    } else {
      callback(this.createError(RangeError, `invalid opcode ${this._opcode}`, true, 1002, 'WS_ERR_INVALID_OPCODE'));
      return;
    }

    if (!this._fin && !this._fragmented) this._fragmented = this._opcode;

    this._masked = (buffer[1] & 0x80) === 0x80;
    if (this._isServer) {
      if (!this._masked) {
        callback(this.createError(RangeError, 'MASK must be set', true, 1002, 'WS_ERR_EXPECTED_MASK'));
        return;
      }
    } else if (this._masked) {
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

    if (high > Math.pow(2, 21) - 1) {
      callback(this.createError(RangeError, 'Unsupported WebSocket frame: payload length > 2^53 - 1', false, 1009, 'WS_ERR_UNSUPPORTED_DATA_PAYLOAD_LENGTH'));
      return;
    }

    this._payloadLength = high * Math.pow(2, 32) + buffer.readUInt32BE(4);
    this.haveLength(callback);
  }

  haveLength(callback) {
    if (this._payloadLength && this._opcode < 0x08) {
      this._totalPayloadLength += this._payloadLength;
      if (this._totalPayloadLength > this._maxPayload && this._maxPayload > 0) {
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
      if (this._masked && (this._mask[0] | this._mask[1] | this._mask[2] | this._mask[3]) !== 0) {
        unmask(data, this._mask);
      }
    }

    if (this._opcode > 0x07) {
      this.controlMessage(data, callback);
      return;
    }

    if (this._maxFragments > 0 && this._numFragments >= this._maxFragments) {
      callback(this.createError(RangeError, 'Too many message fragments', false, 1008, 'WS_ERR_TOO_MANY_BUFFERED_PARTS'));
      return;
    }
    this._numFragments++;

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
    this._extensions['permessage-deflate'].decompress(data, this._fin, (error, buffer) => {
      if (error) return callback(error);

      if (buffer.length) {
        this._messageLength += buffer.length;
        if (this._messageLength > this._maxPayload && this._maxPayload > 0) {
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
    this._numFragments = 0;
    this._fragments = [];

    if (this._opcode === 2) {
      let data;
      if (this._binaryType === 'nodebuffer') data = concat(fragments, messageLength);
      else if (this._binaryType === 'arraybuffer') data = toArrayBuffer(concat(fragments, messageLength));
      else if (this._binaryType === 'blob') data = new Blob(fragments);
      else data = fragments;

      this.emitMessage(data, true, callback);
      return;
    }

    const buffer = concat(fragments, messageLength);
    if (!this._skipUTF8Validation && !isValidUTF8(buffer)) {
      callback(this.createError(Error, 'invalid UTF-8 sequence', true, 1007, 'WS_ERR_INVALID_UTF8'));
      return;
    }

    this.emitMessage(buffer, false, callback);
  }

  emitMessage(data, isBinary, callback) {
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
        this.emit('conclude', 1005, EMPTY_BUFFER);
        this.end();
        this._state = GET_INFO;
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

      if (this._allowSynchronousEvents) {
        this.emit('conclude', code, reason);
        this.end();
        this._state = GET_INFO;
      } else {
        this._state = DEFER_EVENT;
        setImmediate(() => {
          this.emit('conclude', code, reason);
          this.end();
          this._state = GET_INFO;
          this.startLoop(callback);
        });
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
