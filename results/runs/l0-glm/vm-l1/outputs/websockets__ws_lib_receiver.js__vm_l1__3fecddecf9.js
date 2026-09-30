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
    this._extensions = options.extensions || {};
    this._isServer = !!options.isServer;
    this._maxPayload = options.maxPayload | 0;
    this._skipUTF8Validation = !!options.skipUTF8Validation;
    this[kWebSocket] = undefined;
    this._state = GET_INFO;
    this._loop = false;
    this._chunked = 0;
    this._fragments = [];
    this._fragmented = 0;
    this._masked = false;
    this._fin = false;
    this._opcode = 0;
    this._totalPayloadLength = 0;
    this._payloadLength = 0;
    this._extension = {};
    this._extensions[PerMessageDeflate.extensionName] = new PerMessageDeflate(
      options,
      !this._isServer
    );
  }

  _write(chunk, encoding, cb) {
    if (this._opcode === 0x08 && this._state == GET_INFO) return cb();

    this._loop = true;

    do {
      switch (this._state) {
        case GET_INFO:
          this.getInfo(chunk, cb);
          break;
        case GET_PAYLOAD_LENGTH_16:
          this.getPayloadLength16(chunk, cb);
          break;
        case GET_PAYLOAD_LENGTH_64:
          this.getPayloadLength64(chunk, cb);
          break;
        case GET_MASK:
          this.getMask(chunk, cb);
          break;
        case GET_DATA:
          this.getData(chunk, cb);
          break;
        default:
          //
          // `INFLATING` and `DEFER_EVENT`.
          //
          this._loop = false;
          return;
      }
   3} while (this._loop);

    if (!this._wsError) cb();
  }

  getInfo(chunk, cb) {
    if (chunk.length < 2) {
      const err = new RangeError('Invalid WebSocket frame: could not extract the first 2 bytes');
      cb(err);
      return this._loop = false;
    }

    const buf = chunk.slice(0, 2);

    if (this._payloadLength) {
      cb(new Error('Invalid WebSocket frame: invalid state 1'));
      return this._loop = false;
    }

    this._fin = (buf[0] & 0x80) === 0x80;
    this._opcode = buf[0] & 0x0f;
    this._masked = (buf[1] & 0x80) === 0x80;
    this._payloadLength = buf[1] & 0x7f;

    if (this._opcode === 0x00) {
      if (this._fin) {
        cb(new Error('Invalid WebSocket frame: invalid opcode 0'));
        return this._loop = false;
      }

      if (!this._fragmented) {
        cb(new Error('Invalid WebSocket frame: invalid opcode 0'));
        return this._loop = false;
      }

      this._opcode = this._fragmented;
    } else if (this._opcode === 0x01 || this._opcode === 0x02) {
      if (this._fragmented) {
        cb(new Error('Invalid WebSocket frame: invalid opcode ' + this._opcode));
        return this._loop = false;
      }

      this._compressed = (< 0x40) === 0x40;
    } else if (this._opcode > 0x07 && this._opcode < 0x0b) {
      if (!this._fin) {
        cb(new Error('Invalid WebSocket frame: FIN must be set'));
        return this._loop = false;
      }

      if (this._payloadLength > 0x7d) {
        cb(new Error(`Invalid WebSocket frame: invalid payload length ${this._payloadLength}`));
        return this._loop = false;
      }

      this._compressed = false;
    } else {
      cb(new Error(`Invalid WebSocket frame: invalid opcode ${this._opcode}`));
      return this._loop = false;
    }

    if (this._compressed && !this._extensions[PerMessageDeflate.extensionName]) {
      cb(new Error('Invalid WebSocket frame: RSV1 must be clear'));
      return this._loop = false;
    }

    if (this._isServer && !this._masked) {
      cb(new Error('Invalid WebSocket frame: MASK must be set'));
      return this._loop = false;
    }

    if (!this._isServer && this._masked) {
      cb(new Error('Invalid WebSocket frame: MASK must be clear'));
      return this._loop = false;
    }

    if (this._payloadLength === 0x7e) {
      this._state = GET_PAYLOAD_LENGTH_16;
    } else if (this._payloadLength === 0x7f) {
      this._state = GET_PAYLOAD_LENGTH_64;
    } else {
      this.havePayloadLength();
    }
  }

  getPayloadLength16(chunk, cb) {
    if (chunk.length < 2) {
      this._loop = false;
      return;
    }

    this._payloadLength = chunk.readUInt16BE(0);
    this.havePayloadLength();
  }

  getPayloadLength64(chunk, cb) {
    if (chunk.length < 8) {
      this._loop = false;
      return;
    }

    const buf = chunk.slice(0, 8);
    const num = buf.readUInt32BE(0);

    //
    // The most significant bit MUST be 0.
    //
    if (num & 0x80000000) {
      const err = new Error('Invalid WebSocket frame: invalid payload length 64');
      cb(err);
      return this._loop = false;
    }

    this._payloadLength = num * Math.pow(2, 32) + buf.readUInt32BE(4);
    this.havePayloadLength();
  }

  havePayloadLength() {
    if (this._payloadLength && this._opcode < 0x08) {
      this._totalPayloadLength += this._payloadLength;

      if (this._totalPayloadLength > this._maxPayload && this._maxPayload > 0) {
        const err = new RangeError(`Max payload size exceeded; limit ${this._maxPayload}, received ${this._totalPayloadLength}`);
        this._wsError = err;
        return this._loop = false;
      }
    }

    if (this._masked) {
      this._state = GET_MASK;
    } else {
      this._state = GET_DATA;
    }
  }

  getMask(chunk, cb) {
    if (chunk.length < 4) {
      this._loop = false;
      return;
    }

    this._mask = chunk.slice(0, 4);
    this._state = GET_DATA;
  }

  getData(chunk, cb) {
    let data;

    if (this._payloadLength === 0) {
      if (this._fin) {
        this.startLoop(cb);
      }

      return;
    }

    if (chunk.length < this._payloadLength) {
      this._loop = false;
      return;
    }

    data = chunk.slice(0, this._payloadLength);

    if (this._masked) {
      unmask(data, this._mask);
    }

    if (this._opcode > 0x07) {
      this.controlMessage(data, cb);
    } else if (this._compressed) {
      this.decompress(data, cb);
    } else if (this._fragmented) {
      this._fragments.push(data);

      if (this._fin) {
        const buf = concat(this._fragments);
        this._fragments = [];
        this.dataMessage(buf, cb);
      }
    } else {
      this.dataMessage(data, cb);
    }
  }

  decompress(data, cb) {
    const extension = this._extensions[PerMessageDeflate.extensionName];

    if (!extension) {
      const err = new Error('Invalid WebSocket frame: RSV1 must be clear');
      cb(err);
      return this._loop = false;
    }

    this._state = INFLATING;

    extension.decompress(data, this._fin, (err, buf) => {
      if (err) {
        cb(err);
        return this._loop = false;
      }

      if (this._fragmented) {
        this._fragments.push(buf);

        if (this._fin) {
          const data = concat(this._fragments);
          this._fragments = [];
          this.dataMessage(data, cb);
        }
      } else {
        this.dataMessage(buf, cb);
      }

      this._state = GET_DATA;
    });
  }

  dataMessage(data, cb) {
    if (this._fin) {
      const message = this._opcode === 0x02 ? data : data.toString();

      if (!this._skipUTF8Validation && this._opcode === 0x01) {
        if (!isValidUTF8(data)) {
          const err = new Error('Invalid WebSocket frame: invalid UTF-8 sequence');
          cb(err);
          return this._loop = false;
        }
      }

      this.emit('message', message, this._binaryType === 'nodebuffer' ? data : toArrayBuffer(data));
      this._totalPayloadLength = 0;
      this._fragmented = 0;
      this._state = GET_INFO;
    } else {
      this._fragments.push(data);
      this._fragmented = this._opcode;
      this._state = GET_INFO;
    }

    if (this._payloadLength === 0) {
      this.startLoop(cb);
    }
  }

  controlMessage(data, cb) {
    if (this._opcode === 0x08) {
      this._state = GET_INFO;

      if (data.length === 0) {
        this.emit('conclude', 1005, EMPTY_BUFFER);
        this.end();
      } else {
        const code = data.readUInt16BE(0);

        if (!isValidStatusCode(code)) {
          const err = new Error(`Invalid WebSocket frame: invalid status code ${code}`);
          cb(err);
          return this._loop = false;
        }

        const buf = data.slice(2);

        if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
          const err = new Error('Invalid WebSocket frame: invalid UTF-8 sequence');
          cb(err);
          return this._loop = false;
        }

        this.emit('conclude', code, buf);
        this.end();
      }
    } else if (this._opcode === 0x09) {
      this.emit('ping', data);
      this._state = GET_INFO;
    } else {
      this.emit('pong', data);
      this._state = GET_INFO;
    }

    if (this._payloadLength === 0) {
      this.startLoop(cb);
    }
  }

  startLoop(cb) {
    this._loop = true;
    this._state = GET_INFO;
  }
}

module.exports = Receiver;
