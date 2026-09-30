'use strict';

const { Writable } = require('stream');

const EMPTY_BUFFER = Buffer.alloc(0);
const kStatusCode = Symbol('status-code');
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
  return target;
}

function unmask(buffer, mask) {
  for (let i = 0; i < buffer.length; i++) buffer[i] ^= mask[i & 3];
}

function isValidStatusCode(code) {
  return (
    (code >= 1000 && code <= 1014 && code !== 1004 && code !== 1005 && code !== 1006) ||
    (code >= 3000 && code <= 4999)
  );
}

function isValidUTF8(buffer) {
  let i = 0;
  while (i < buffer.length) {
    const first = buffer[i++];
    if (first <= 0x7f) continue;

    if (first >= 0xc2 && first <= 0xdf) {
      if (i >= buffer.length || (buffer[i++] & 0xc0) !== 0x80) return false;
      continue;
    }

    if (first >= 0xe0 && first <= 0xef) {
      if (i + 1 >= buffer.length) return false;
      const second = buffer[i++];
      const third = buffer[i++];
      if ((second & 0xc0) !== 0x80 || (third & 0xc0) !== 0x80) return false;
      if (first === 0xe0 && second < 0xa0) return false;
      if (first === 0xed && second >= 0xa0) return false;
      continue;
    }

    if (first >= 0xf0 && first <= 0xf4) {
      if (i + 2 >= buffer.length) return false;
      const second = buffer[i++];
      const third = buffer[i++];
      const fourth = buffer[i++];
      if ((second & 0xc0) !== 0x80 || (third & 0xc0) !== 0x80 || (fourth & 0xc0) !== 0x80) return false;
      if (first === 0xf0 && second < 0x90) return false;
      if (first === 0xf4 && second >= 0x90) return false;
      continue;
    }

    return false;
  }
  return true;
}

function createError(ErrorType, message, prefix, statusCode, code) {
  const error = new ErrorType(prefix ? `Invalid WebSocket frame: ${message}` : message);
  Error.captureStackTrace(error, createError);
  error.code = code;
  error[kStatusCode] = statusCode;
  return error;
}

class Receiver extends Writable {
  constructor(options = {}) {
    super();

    this._allowSynchronousEvents = options.allowSynchronousEvents !== undefined
      ? options.allowSynchronousEvents
      : true;
    this._binaryType = options.binaryType || 'nodebuffer';
    this._extensions = options.extensions || {};
    this._isServer = !!options.isServer;
    this._maxPayload = options.maxPayload | 0;
    this._skipUTF8Validation = !!options.skipUTF8Validation;

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
    while (length > 0) {
      const buffer = this._buffers[0];
      if (length >= buffer.length) {
        target.set(this._buffers.shift(), offset);
        offset += buffer.length;
        length -= buffer.length;
      } else {
        target.set(buffer.subarray(0, length), offset);
        this._buffers[0] = buffer.subarray(length);
        offset += length;
        length = 0;
      }
    }
    return target;
  }

  fail(callback, error) {
    this._loop = false;
    this._errored = true;
    callback(error);
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

    const buffer = this.consume(2);
    if ((buffer[0] & 0x30) !== 0) {
      this.fail(callback, createError(RangeError, 'RSV2 and RSV3 must be clear', true, 1002, 'WS_ERR_UNEXPECTED_RSV_2_3'));
      return;
    }

    const compressed = (buffer[0] & 0x40) === 0x40;
    if (compressed && !this._extensions['permessage-deflate']) {
      this.fail(callback, createError(RangeError, 'RSV1 must be clear', true, 1002, 'WS_ERR_UNEXPECTED_RSV_1'));
      return;
    }

    this._fin = (buffer[0] & 0x80) === 0x80;
    this._opcode = buffer[0] & 0x0f;
    this._payloadLength = buffer[1] & 0x7f;

    if (this._opcode === 0x00) {
      if (compressed) {
        this.fail(callback, createError(RangeError, 'RSV1 must be clear', true, 1002, 'WS_ERR_UNEXPECTED_RSV_1'));
        return;
      }
      if (!this._fragmented) {
        this.fail(callback, createError(RangeError, 'invalid opcode 0', true, 1002, 'WS_ERR_INVALID_OPCODE'));
        return;
      }
      this._opcode = this._fragmented;
    } else if (this._opcode === 0x01 || this._opcode === 0x02) {
      if (this._fragmented) {
        this.fail(callback, createError(RangeError, `invalid opcode ${this._opcode}`, true, 1002, 'WS_ERR_INVALID_OPCODE'));
        return;
      }
      this._compressed = compressed;
    } else if (this._opcode > 0x07 && this._opcode < 0x0b) {
      if (!this._fin) {
        this.fail(callback, createError(RangeError, 'FIN must be set', true, 1002, 'WS_ERR_EXPECTED_FIN'));
        return;
      }
      if (compressed) {
        this.fail(callback, createError(RangeError, 'RSV1 must be clear', true, 1002, 'WS_ERR_UNEXPECTED_RSV_1'));
        return;
      }
      if (this._payloadLength > 0x7d || (this._opcode === 0x08 && this._payloadLength === 1)) {
        this.fail(callback, createError(RangeError, `invalid payload length ${this._payloadLength}`, true, 1002, 'WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH'));
        return;
      }
    } else {
      this.fail(callback, createError(RangeError, `invalid opcode ${this._opcode}`, true, 1002, 'WS_ERR_INVALID_OPCODE'));
      return;
    }

    if (!this._fin && !this._fragmented) this._fragmented = this._opcode;
    this._masked = (buffer[1] & 0x80) === 0x80;

    if (this._isServer) {
      if (!this._masked) {
        this.fail(callback, createError(RangeError, 'MASK must be set', true, 1002, 'WS_ERR_EXPECTED_MASK'));
        return;
      }
    } else if (this._masked) {
      this.fail(callback, createError(RangeError, 'MASK must be clear', true, 1002, 'WS_ERR_UNEXPECTED_MASK'));
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
    if (this._payloadLength < 126) {
      this.fail(callback, createError(RangeError, `invalid payload length ${this._payloadLength}`, true, 1002, 'WS_ERR_INVALID_PAYLOAD_LENGTH'));
      return;
    }
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
      this.fail(callback, createError(RangeError, 'Unsupported WebSocket frame: payload length > 2^53 - 1', false, 1009, 'WS_ERR_UNSUPPORTED_DATA_PAYLOAD_LENGTH'));
      return;
    }
    this._payloadLength = high * Math.pow(2, 32) + buffer.readUInt32BE(4);
    if (this._payloadLength < 65536) {
      this.fail(callback, createError(RangeError, `invalid payload length ${this._payloadLength}`, true, 1002, 'WS_ERR_INVALID_PAYLOAD_LENGTH'));
      return;
    }
    this.haveLength(callback);
  }

  haveLength(callback) {
    if (this._payloadLength && this._opcode < 0x08) {
      this._totalPayloadLength += this._payloadLength;
      if (this._maxPayload > 0 && this._totalPayloadLength > this._maxPayload) {
        this.fail(callback, createError(RangeError, 'Max payload size exceeded', false, 1009, 'WS_ERR_UNSUPPORTED_MESSAGE_LENGTH'));
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
    } else {
      this.dataMessage(data, callback);
    }
  }

  decompress(data, callback) {
    this._extensions['permessage-deflate'].decompress(data, this._fin, (error, buffer) => {
      if (error) return this.fail(callback, error);

      if (buffer.length) {
        this._messageLength += buffer.length;
        if (this._maxPayload > 0 && this._messageLength > this._maxPayload) {
          this.fail(callback, createError(RangeError, 'Max payload size exceeded', false, 1009, 'WS_ERR_UNSUPPORTED_MESSAGE_LENGTH'));
          return;
        }
        this._fragments.push(buffer);
      }

      this.dataMessage(EMPTY_BUFFER, callback);
      if (this._state === GET_INFO) this.startLoop(callback);
    });
  }

  dataMessage(data, callback) {
    if (data.length) {
      this._messageLength += data.length;
      this._fragments.push(data);
    }

    if (this._fin) {
      const messageLength = this._messageLength;
      const fragments = this._fragments;
      this._totalPayloadLength = 0;
      this._messageLength = 0;
      this._fragmented = 0;
      this._fragments = [];

      if (this._opcode === 0x02) {
        let message;
        if (this._binaryType === 'nodebuffer') message = concat(fragments, messageLength);
        else if (this._binaryType === 'arraybuffer') {
          const buffer = concat(fragments, messageLength);
          message = buffer.length === buffer.buffer.byteLength
            ? buffer.buffer
            : buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.length);
        } else if (this._binaryType === 'blob') {
          message = new Blob(fragments);
        } else {
          message = fragments;
        }

        if (this._allowSynchronousEvents) this.emit('message', message, true);
        else {
          this._state = DEFER_EVENT;
          setImmediate(() => {
            this.emit('message', message, true);
            this._state = GET_INFO;
            this.startLoop(callback);
          });
          return;
        }
      } else {
        const message = concat(fragments, messageLength);
        if (!this._skipUTF8Validation && !isValidUTF8(message)) {
          this.fail(callback, createError(Error, 'invalid UTF-8 sequence', true, 1007, 'WS_ERR_INVALID_UTF8'));
          return;
        }

        if (this._allowSynchronousEvents) this.emit('message', message, false);
        else {
          this._state = DEFER_EVENT;
          setImmediate(() => {
            this.emit('message', message, false);
            this._state = GET_INFO;
            this.startLoop(callback);
          });
          return;
        }
      }
    }

    this._state = GET_INFO;
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
        this.fail(callback, createError(RangeError, `invalid status code ${code}`, true, 1002, 'WS_ERR_INVALID_CLOSE_CODE'));
        return;
      }

      const reason = data.subarray(2);
      if (!this._skipUTF8Validation && !isValidUTF8(reason)) {
        this.fail(callback, createError(Error, 'invalid UTF-8 sequence', true, 1007, 'WS_ERR_INVALID_UTF8'));
        return;
      }

      this._loop = false;
      this.emit('conclude', code, reason);
      this.end();
      return;
    }

    const eventName = this._opcode === 0x09 ? 'ping' : 'pong';
    if (this._allowSynchronousEvents) this.emit(eventName, data);
    else {
      this._state = DEFER_EVENT;
      setImmediate(() => {
        this.emit(eventName, data);
        this._state = GET_INFO;
        this.startLoop(callback);
      });
      return;
    }
    this._state = GET_INFO;
  }
}

module.exports = Receiver;
