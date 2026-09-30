'use strict';

const { isUtf8 } = require('buffer');
const { Writable } = require('stream');

const BINARY_TYPES = ['nodebuffer', 'arraybuffer', 'fragments', 'blob'];
const EMPTY_BUFFER = Buffer.alloc(0);
const kStatusCode = Symbol('status-code');
const kWebSocket = Symbol('websocket');
const FastBuffer = Buffer[Symbol.species];

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

  return offset < totalLength
    ? new FastBuffer(target.buffer, target.byteOffset, offset)
    : target;
}

function toArrayBuffer(buffer) {
  if (buffer.length === buffer.buffer.byteLength) return buffer.buffer;
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.length);
}

function unmask(buffer, mask) {
  for (let index = 0; index < buffer.length; index++) {
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
    const byte = buffer[index];
    if ((byte & 0x80) === 0) {
      index++;
    } else if ((byte & 0xe0) === 0xc0) {
      if (
        index + 1 === buffer.length ||
        (buffer[index + 1] & 0xc0) !== 0x80 ||
        (byte & 0xfe) === 0xc0
      ) return false;
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

function emitOrDefer(receiver, eventName, arguments_, callback) {
  if (receiver._allowSynchronousEvents) {
    receiver.emit(eventName, ...arguments_);
    receiver._state = GET_INFO;
    return;
  }

  receiver._state = DEFER_EVENT;
  setImmediate(() => {
    receiver.emit(eventName, ...arguments_);
    receiver._state = GET_INFO;
    receiver.startLoop(callback);
  });
}

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
    if (this._opcode === 0x08 && this._state === GET_INFO) return callback();
    this._bufferedBytes += chunk.length;
    this._buffers.push(chunk);
    this.startLoop(callback);
  }

  consume(byteCount) {
    this._bufferedBytes -= byteCount;
    if (byteCount === this._buffers[0].length) return this._buffers.shift();

    if (byteCount < this._buffers[0].length) {
      const buffer = this._buffers[0];
      this._buffers[0] = new FastBuffer(
        buffer.buffer,
        buffer.byteOffset + byteCount,
        buffer.length - byteCount,
      );
      return new FastBuffer(buffer.buffer, buffer.byteOffset, byteCount);
    }

    const target = Buffer.allocUnsafe(byteCount);
    let offset = 0;
    do {
      const buffer = this._buffers[0];
      const bytesToCopy = Math.min(byteCount - offset, buffer.length);
      target.set(
        new Uint8Array(buffer.buffer, buffer.byteOffset, bytesToCopy),
        offset,
      );
      if (bytesToCopy === buffer.length) {
        this._buffers.shift();
      } else {
        this._buffers[0] = new FastBuffer(
          buffer.buffer,
          buffer.byteOffset + bytesToCopy,
          buffer.length - bytesToCopy,
        );
      }
      offset += bytesToCopy;
    } while (offset < byteCount);
    return target;
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
        RangeError, 'RSV2 and RSV3 must be clear', true, 1002,
        'WS_ERR_UNEXPECTED_RSV_2_3',
      );
    }

    const compressed = (buffer[0] & 0x40) === 0x40;
    if (compressed && !this._extensions['permessage-deflate']) {
      return this.createError(
        RangeError, 'RSV1 must be clear', true, 1002,
        'WS_ERR_UNEXPECTED_RSV_1',
      );
    }

    this._fin = (buffer[0] & 0x80) === 0x80;
    this._opcode = buffer[0] & 0x0f;
    this._payloadLength = buffer[1] & 0x7f;

    if (this._opcode === 0x00) {
      if (compressed) {
        return this.createError(
          RangeError, 'RSV1 must be clear', true, 1002,
          'WS_ERR_UNEXPECTED_RSV_1',
        );
      }
      if (!this._fragmented) {
        return this.createError(
          RangeError, 'invalid opcode 0', true, 1002,
          'WS_ERR_INVALID_OPCODE',
        );
      }
      this._opcode = this._fragmented;
    } else if (this._opcode === 0x01 || this._opcode === 0x02) {
      if (this._fragmented) {
        return this.createError(
          RangeError, 'invalid opcode ' + this._opcode, true, 1002,
          'WS_ERR_INVALID_OPCODE',
        );
      }
      this._compressed = compressed;
    } else if (this._opcode > 0x07 && this._opcode < 0x0b) {
      if (!this._fin) {
        return this.createError(
          RangeError, 'FIN must be set', true, 1002,
          'WS_ERR_EXPECTED_FIN',
        );
      }
      if (compressed) {
        return this.createError(
          RangeError, 'RSV1 must be clear', true, 1002,
          'WS_ERR_UNEXPECTED_RSV_1',
        );
      }
      if (this._payloadLength > 0x7d) {
        return this.createError(
          RangeError, 'invalid payload length ' + this._payloadLength, true,
          1002, 'WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH',
        );
      }
    } else {
      return this.createError(
        RangeError, 'invalid opcode ' + this._opcode, true, 1002,
        'WS_ERR_INVALID_OPCODE',
      );
    }

    if (!this._fin && !this._fragmented) this._fragmented = this._opcode;
    this._masked = (buffer[1] & 0x80) === 0x80;

    if (this._isServer) {
      if (!this._masked) {
        return this.createError(
          RangeError, 'MASK must be set', true, 1002,
          'WS_ERR_EXPECTED_MASK',
        );
      }
    } else if (this._masked) {
      return this.createError(
        RangeError, 'MASK must be clear', true, 1002,
        'WS_ERR_UNEXPECTED_MASK',
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
    const highBits = buffer.readUInt32BE(0);
    if (highBits > Math.pow(2, 21) - 1) {
      return this.createError(
        RangeError,
        'Unsupported WebSocket frame: payload length > 2^53 - 1',
        false, 1009, 'WS_ERR_UNSUPPORTED_DATA_PAYLOAD_LENGTH',
      );
    }
    this._payloadLength = highBits * Math.pow(2, 32) + buffer.readUInt32BE(4);
    return this.haveLength();
  }

  haveLength() {
    if (this._payloadLength && this._opcode < 0x08) {
      this._totalPayloadLength += this._payloadLength;
      if (this._maxPayload > 0 && this._totalPayloadLength > this._maxPayload) {
        return this.createError(
          RangeError, 'Max payload size exceeded', false, 1009,
          'WS_ERR_UNSUPPORTED_MESSAGE_LENGTH',
        );
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
      if (this._masked) unmask(data, this._mask);
    }

    if (this._opcode > 0x07) return this.controlMessage(data, callback);
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
    const extension = this._extensions['permessage-deflate'];
    extension.decompress(data, this._fin, (error, buffer) => {
      if (error) return callback(error);
      if (buffer.length) {
        this._messageLength += buffer.length;
        if (this._maxPayload > 0 && this._messageLength > this._maxPayload) {
          return callback(this.createError(
            RangeError, 'Max payload size exceeded', false, 1009,
            'WS_ERR_UNSUPPORTED_MESSAGE_LENGTH',
          ));
        }
        this._fragments.push(buffer);
      }
      const messageError = this.dataMessage(callback);
      if (messageError) return callback(messageError);
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
      if (this._binaryType === 'nodebuffer') {
        data = concat(fragments, messageLength);
      } else if (this._binaryType === 'arraybuffer') {
        data = toArrayBuffer(concat(fragments, messageLength));
      } else if (this._binaryType === 'blob') {
        data = new Blob(fragments);
      } else {
        data = fragments;
      }
      emitOrDefer(this, 'message', [data, true], callback);
    } else {
      const data = concat(fragments, messageLength);
      if (!this._skipUTF8Validation && !isValidUTF8(data)) {
        return this.createError(
          Error, 'invalid UTF-8 sequence', true, 1007,
          'WS_ERR_INVALID_UTF8',
        );
      }
      emitOrDefer(this, 'message', [data.toString(), false], callback);
    }
  }

  controlMessage(data, callback) {
    if (this._opcode === 0x08) {
      let code = 1005;
      let reason = EMPTY_BUFFER;
      if (data.length === 1) {
        return this.createError(
          RangeError, 'invalid payload length 1', true, 1002,
          'WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH',
        );
      }
      if (data.length > 1) {
        code = data.readUInt16BE(0);
        if (!isValidStatusCode(code)) {
          return this.createError(
            RangeError, 'invalid status code ' + code, true, 1002,
            'WS_ERR_INVALID_CLOSE_CODE',
          );
        }
        reason = new FastBuffer(
          data.buffer, data.byteOffset + 2, data.length - 2,
        );
        if (!this._skipUTF8Validation && !isValidUTF8(reason)) {
          return this.createError(
            Error, 'invalid UTF-8 sequence', true, 1007,
            'WS_ERR_INVALID_UTF8',
          );
        }
      }
      this._loop = false;
      this.emit('conclude', code, reason);
      this.end();
      this._state = GET_INFO;
      return;
    }

    const eventName = this._opcode === 0x09 ? 'ping' : 'pong';
    emitOrDefer(this, eventName, [data], callback);
  }

  createError(ErrorConstructor, message, prefix, statusCode, errorCode) {
    this._loop = false;
    this._errored = true;
    const error = new ErrorConstructor(
      prefix ? 'Invalid WebSocket frame: ' + message : message,
    );
    Error.captureStackTrace(error, this.createError);
    error.code = errorCode;
    error[kStatusCode] = statusCode;
    return error;
  }
}

module.exports = Receiver;
