'use strict';

const { Duplex } = require('stream');
const { randomFillSync } = require('crypto');
const { types } = require('util');
const { isUint8Array } = types;

const PerMessageDeflate = require('../work/websockets__ws/lib/permessage-deflate.js');
const { EMPTY_BUFFER, kWebSocket, NOOP } = require('../work/websockets__ws/lib/constants.js');
const { isBlob, isValidStatusCode } = require('../work/websockets__ws/lib/validation.js');
const { mask: applyMask, toBuffer } = require('../work/websockets__ws/lib/buffer-util.js');

const kByteLength = Symbol('kByteLength');

const maskBuffer = Buffer.alloc(4);
const RANDOM_POOL_SIZE = 8 * 1024;
let randomPool;
let randomPoolPointer = RANDOM_POOL_SIZE;

const DEFAULT = 0;
const DEFLATING = 1;
const GET_BLOB_DATA = 2;

class Sender {
  constructor(socket, extensions) {
    this._extensions = extensions || {};
    this._socket = socket;
    this._firstFragment = true;
    this._compress = false;
    this._bufferedBytes = 0;
    this._queue = [];
    this._state = DEFAULT;
  }

  static frame(data, options) {
    const mask = options.mask;
    const payloadLength = data.length;
    let offset = mask ? 6 : 2;

    if (payloadLength >= 65536) {
      offset += 8;
    } else if (payloadLength >= 126) {
      offset += 2;
    }

    const target = Buffer.allocUnsafe(offset);
    target[0] = options.fin ? options.opcode | 0x80 : options.opcode;

    if (options.rsv1) {
      target[0] |= 0x40;
    }

    if (payloadLength < 126) {
      target[1] = payloadLength;
    } else if (payloadLength < 65536) {
      target[1] = 126;
      target.writeUInt16BE(payloadLength, 2);
    } else {
      target[1] = 127;
      target[2] = 0;
      target[3] = 0;
      target.writeUInt32BE(Math.floor(payloadLength / 0x100000000), 4);
      target.writeUInt32BE(payloadLength >>> 0, 8);
    }

    if (mask) {
      target[1] |= 0x80;

      if (randomPoolPointer + 4 > RANDOM_POOL_SIZE) {
        randomPool = randomFillSync(Buffer.allocUnsafe(RANDOM_POOL_SIZE));
        randomPoolPointer = 0;
      }

      const maskKey = randomPool.slice(randomPoolPointer, randomPoolPointer + 4);
      randomPoolPointer += 4;
      maskKey.copy(target, offset - 4);

      applyMask(data, maskKey, data);
    }

    return [target, data];
  }

  static getPayloadLength(list) {
    let length = 0;

    for (const item of list) {
      length += item.length;
    }

    return length;
  }

  close(code, data, cb) {
    if (code < 1000 || code >= 5000) {
      throw new RangeError(`invalid status code: ${code}`);
    }

    if (code >= 3000 && code <= 3999 && !isValidStatusCode(code)) {
      throw new RangeError(`invalid status code: ${code}`);
    }

    data = data ? toBuffer(data) : EMPTY_BUFFER;

    if (data.length > 123) {
      throw new RangeError('The message must not be greater than 123 bytes');
    }

    const buffer = Buffer.allocUnsafe(2 + data.length);
    buffer.writeUInt16BE(code, 0);
    data.copy(buffer, 2);

    this.sendFrame(Sender.frame(buffer, {
      fin: true,
      opcode: 0x8,
      mask: this._mask,
      readOnly: false
    }), cb);
  }

  ping(data, mask, cb) {
    if (typeof mask === 'function') {
      cb = mask;
      mask = false;
    }

    data = data || EMPTY_BUFFER;

    if (isBlob(data)) {
      if (!this._deflating) {
        this._state = GET_BLOB_DATA;
        this.getBlobData(data, false, {
          fin: true,
          opcode: 0x9,
          mask
        }, cb);
      }

      return;
    }

    data = toBuffer(data);

    if (data.length > 125) {
      throw new RangeError('The data size must not be greater than 125 bytes');
    }

    this.sendFrame(Sender.frame(data, {
      fin: true,
      opcode: 0x9,
      mask,
      readOnly: data === EMPTY_BUFFER
    }), cb);
  }

  pong(data, mask, cb) {
    if (typeof mask === 'function') {
      cb = mask;
      mask = false;
    }

    data = data || EMPTY_BUFFER;

    if (isBlob(data)) {
      if (!this._deflating) {
        this._state = GET_BLOB_DATA;
        this.getBlobData(data, false, {
          fin: true,
          opcode: 0xa,
          mask
        }, cb);
      }

      return;
    }

    data = toBuffer(data);

    if (data.length > 125) {
      throw new RangeError('The data size must not be greater than 125 bytes');
    }

    this.sendFrame(Sender.frame(data, {
      fin: true,
      opcode: 0xa,
      mask,
      readOnly: data === EMPTY_BUFFER
    }), cb);
  }

  send(data, options, cb) {
    const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];
    let opcode = options.binary ? 2 : 1;
    let rsv1 = false;

    if (this._firstFragment) {
      this._firstFragment = false;
      if (options.compress && perMessageDeflate) {
        rsv1 = true;
        this._compress = true;
      }
    } else {
      opcode = 0;
    }

    if (options.fin) {
      this._firstFragment = true;
    }

    const mask = options.mask;
    const readOnly = options.readOnly;

    if (isBlob(data)) {
      if (this._state !== DEFAULT) {
        this.enqueue([this.getBlobData, data, this._compress, {
          fin: options.fin,
          opcode,
          mask,
          rsv1
        }, cb]);
      } else {
        this._state = GET_BLOB_DATA;
        this.getBlobData(data, this._compress, {
          fin: options.fin,
          opcode,
          mask,
          rsv1
        }, cb);
      }

      return;
    }

    data = toBuffer(data);

    if (perMessageDeflate && this._compress) {
      this.dispatch(data, this._compress, {
        fin: options.fin,
        opcode,
        mask,
        rsv1
      }, cb);
    } else {
      this.sendFrame(Sender.frame(data, {
        fin: options.fin,
        opcode,
        mask,
        rsv1,
        readOnly
      }), cb);
    }
  }

  dispatch(data, compress, options, cb) {
    if (!compress) {
      this.sendFrame(Sender.frame(data, options), cb);
      return;
    }

    const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];

    this._bufferedBytes += data.length;
    this._state = DEFLATING;

    perMessageDeflate.compress(data, options.fin, (_, buf) => {
      if (this._state === DEFLATING) {
        this._bufferedBytes -= data.length;
        this._state = DEFAULT;
        options.rsv1 = options.rsv1 && perMessageDeflate.params.server_no_context_takeover !== undefined;
        this.sendFrame(Sender.frame(buf, options), cb);
        this.dequeue();
      }
    });
  }

  dequeue() {
    while (this._state === DEFAULT && this._queue.length) {
      const params = this._queue.shift();
      this._bufferedBytes -= params[3];

      if (params[0] === this.dispatch) {
        this.dispatch(params[1], params[2], params[4], params[5]);
      } else {
        params[0].call(this, params[1], params[2], params[3], params[4], params[5]);
      }
    }
  }

  enqueue(params) {
    this._bufferedBytes += params[3] || 0;
    this._queue.push(params);
  }

  sendFrame(list, cb) {
    if (list.length === 2) {
      this._socket.write(list[0]);
      this._socket.write(list[1], cb);
    } else {
      this._socket.write(list[0], cb);
    }
  }

  getBlobData(blob, compress, options, cb) {
    blob.arrayBuffer().then(arrayBuffer => {
      this._state = DEFAULT;
      this.dispatch(Buffer.from(arrayBuffer), compress, options, cb);
      this.dequeue();
    }).catch(error => {
      this._state = DEFAULT;
      if (cb) cb(error);
      this.dequeue();
    });
  }
}

module.exports = Sender;
