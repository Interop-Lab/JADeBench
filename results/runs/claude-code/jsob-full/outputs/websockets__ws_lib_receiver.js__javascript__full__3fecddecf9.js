'use strict';

const { Writable } = require('stream');
const { isUtf8 } = require('buffer');

const EMPTY_BUFFER = Buffer.alloc(0);
const PERMESSAGE_DEFLATE = 'permessage-deflate';
const kStatusCode = Symbol('status-code');

const GET_INFO = 0;
const GET_PAYLOAD_LENGTH_16 = 1;
const GET_PAYLOAD_LENGTH_64 = 2;
const GET_MASK = 3;
const GET_DATA = 4;
const INFLATING = 5;
const DEFER_EVENT = 6;

function isValidStatusCode(code) {
  return (
    (code >= 1000 && code <= 1014 && code !== 1004 && code !== 1005 && code !== 1006) ||
    (code >= 3000 && code <= 4999)
  );
}

function isValidUTF8(buffer) {
  return buffer.length < 24 || isUtf8(buffer);
}

function concatBuffers(buffers, totalLength) {
  if (buffers.length === 0) return EMPTY_BUFFER;
  if (buffers.length === 1) return buffers[0];
  return Buffer.concat(buffers, totalLength);
}

function unmask(buffer, mask) {
  for (let index = 0; index < buffer.length; index++) {
    buffer[index] ^= mask[index & 3];
  }
}

class Receiver extends Writable {
  constructor(options = {}) {
    super();

    this._allowSynchronousEvents = options.allowSynchronousEvents !== false;
    this._binaryType = options.binaryType || 'nodebuffer';
    this._extensions = options.extensions || {};
    this._isServer = Boolean(options.isServer);
    this._maxBufferedChunks = options.maxBufferedChunks | 0;
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
    if (this._opcode === 0x08 && this._state === GET_INFO) {
      callback();
      return;
    }

    if (
      this._maxBufferedChunks > 0 &&
      this._buffers.length >= this._maxBufferedChunks
    ) {
      callback(
        this.createError(
          RangeError,
          'Too many buffered chunks',
          false,
          1009,
          'WS_ERR_TOO_MANY_BUFFERED_PARTS'
        )
      );
      return;
    }

    this._bufferedBytes += chunk.length;
    this._buffers.push(chunk);
    this.startLoop(callback);
  }

  consume(byteCount) {
    this._bufferedBytes -= byteCount;

    if (byteCount === this._buffers[0].length) return this._buffers.shift();

    if (byteCount < this._buffers[0].length) {
      const buffer = this._buffers[0];
      this._buffers[0] = buffer.subarray(byteCount);
      return buffer.subarray(0, byteCount);
    }

    const output = Buffer.allocUnsafe(byteCount);
    let offset = 0;
    do {
      const buffer = this._buffers[0];
      const available = byteCount - offset;
      if (available >= buffer.length) {
        output.set(this._buffers.shift(), offset);
        offset += buffer.length;
      } else {
        output.set(buffer.subarray(0, available), offset);
        this._buffers[0] = buffer.subarray(available);
        offset += available;
      }
    } while (offset < byteCount);
    return output;
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
        default:
          throw new Error(`Unknown receiver state: ${this._state}`);
      }
    } while (this._loop);
    if (!this._errored) callback();
  }

  getInfo(callback) {
    if (this._bufferedBytes < 2) {
      this._loop = false;
      return;
    }

    const header = this.consume(2);
    if ((header[0] & 0x30) !== 0) {
      callback(this.createError(RangeError, 'RSV2 and RSV3 must be clear', true, 1002, 'WS_ERR_UNEXPECTED_RSV_2_3'));
      return;
    }

    const compressed = (header[0] & 0x40) === 0x40;
    if (compressed && !this._extensions[PERMESSAGE_DEFLATE]) {
      callback(this.createError(RangeError, 'RSV1 must be clear', true, 1002, 'WS_ERR_UNEXPECTED_RSV_1'));
      return;
    }

    this._fin = (header[0] & 0x80) === 0x80;
    this._opcode = header[0] & 0x0f;
    this._payloadLength = header[1] & 0x7f;

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
    } else if (this._opcode >= 0x08 && this._opcode <= 0x0a) {
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

    if (!this._fin && this._fragmented === 0) this._fragmented = this._opcode;

    this._masked = (header[1] & 0x80) === 0x80;
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
    this._extensions[PERMESSAGE_DEFLATE].decompress(data, this._fin, (error, output) => {
      if (error) {
        callback(error);
        return;
      }
      if (output.length) {
        this._messageLength += output.length;
        if (this._maxPayload > 0 && this._messageLength > this._maxPayload) {
          callback(this.createError(RangeError, 'Max payload size exceeded', false, 1009, 'WS_ERR_UNSUPPORTED_MESSAGE_LENGTH'));
          return;
        }
        this._fragments.push(output);
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

    let message;
    if (this._opcode === 0x02) {
      if (this._binaryType === 'nodebuffer') {
        message = concatBuffers(fragments, messageLength);
      } else if (this._binaryType === 'arraybuffer') {
        const buffer = concatBuffers(fragments, messageLength);
        message = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
      } else if (this._binaryType === 'blob') {
        message = new Blob(fragments);
      } else {
        message = fragments;
      }
    } else {
      message = concatBuffers(fragments, messageLength);
      if (!this._skipUTF8Validation && !isValidUTF8(message)) {
        callback(this.createError(Error, 'invalid UTF-8 sequence', true, 1007, 'WS_ERR_INVALID_UTF8'));
        return;
      }
    }

    this._state = GET_INFO;
    this.emitEvent('message', [message, this._opcode === 0x02], callback);
  }

  controlMessage(data, callback) {
    if (this._opcode === 0x08) {
      if (data.length === 0) {
        this._loop = false;
        this.emitEvent('conclude', [1005, EMPTY_BUFFER], callback);
        this.end();
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

      this._loop = false;
      this.emitEvent('conclude', [code, reason], callback);
      this.end();
      return;
    }

    this._state = GET_INFO;
    this.emitEvent(this._opcode === 0x09 ? 'ping' : 'pong', [data], callback);
  }

  emitEvent(name, arguments_, callback) {
    if (this._allowSynchronousEvents) {
      this.emit(name, ...arguments_);
      return;
    }
    this._state = DEFER_EVENT;
    this._loop = false;
    setImmediate(() => {
      this.emit(name, ...arguments_);
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
