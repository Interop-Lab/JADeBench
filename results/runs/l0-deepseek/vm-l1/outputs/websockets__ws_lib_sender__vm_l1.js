'use strict';

const NOOP = () => {};

const kWebSocket = Symbol('websocket');

const EMPTY_BUFFER = Buffer.alloc(0);

const kByteLength = Symbol('kByteLength');

const maskBuffer = Buffer.alloc(4);

const RANDOM_POOL_SIZE = 8 * 1024;

let randomPool;
let randomPoolPointer = RANDOM_POOL_SIZE;

const DEFAULT = 0;
const DEFLATING = 1;
const GET_BLOB_DATA = 2;

const { Duplex } = require('stream');
const { randomFillSync } = require('crypto');
const { types: { isUint8Array } } = require('util');

const PerMessageDeflate = require('./permessage-deflate');
const bufferUtil = require('./buffer-util');
const validation = require('./validation');
const constants = require('./constants');

const { isBlob, isValidStatusCode } = validation;
const { mask: applyMask, toBuffer } = bufferUtil;

class Sender {
  constructor(socket, extensions, generateMask) {
    this._extensions = extensions || {};
    this._socket = socket;
    this._firstFragment = true;
    this._compress = false;
    this._bufferedBytes = 0;
    this._deflating = false;
    this._queue = [];
    this._generateMask = generateMask;

    if (this._extensions[PerMessageDeflate.extensionName]) {
      this._deflate = new PerMessageDeflate();
    }
  }

  static frame(data, options) {
    let offset = 2;
    let skipByte = false;

    let payloadLength = data.length;

    if (payloadLength > 65535) {
      offset = 10;
      payloadLength = 127;
    } else if (payloadLength > 125) {
      offset = 4;
      payloadLength = 126;
    }

    const target = Buffer.allocUnsafe(offset + payloadLength);

    target[0] = options.fin ? 0x80 : 0;
    target[1] = options.opcode;

    if (options.mask) {
      target[1] |= 0x80;
    }

    if (payloadLength === 126) {
      target.writeUInt16BE(data.length, 2);
    } else if (payloadLength === 127) {
      target.writeUInt32BE(0, 2);
      target.writeUInt32BE(data.length, 6);
    }

    if (options.mask) {
      const mask = options.maskBuffer || maskBuffer;
      randomFillSync(mask, 0, 4);
      target[offset] = mask[0];
      target[offset + 1] = mask[1];
      target[offset + 2] = mask[2];
      target[offset + 3] = mask[3];
      offset += 4;
    }

    if (data.length) {
      data.copy(target, offset);
    }

    if (options.mask) {
      applyMask(target, offset, options.maskBuffer || maskBuffer);
    }

    return target;
  }

  send(data, options, cb) {
    if (this._socket.destroyed) {
      const err = new Error('The socket is closed');
      if (typeof cb === 'function') cb(err);
      return;
    }

    if (this._deflating) {
      this._queue.push([data, options, cb]);
      return;
    }

    const opcode = options.opcode;
    const fin = options.fin;
    const mask = options.mask;
    const compress = options.compress;

    if (compress && this._deflate) {
      this._deflating = true;
      this._deflate.compress(data, fin, (err, result) => {
        if (err) {
          if (typeof cb === 'function') cb(err);
          return;
        }

        this._deflating = false;
        this.sendFrame(result, {
          fin,
          opcode,
          mask,
          compress: false
        }, cb);
      });
      return;
    }

    this.sendFrame(data, {
      fin,
      opcode,
      mask,
      compress
    }, cb);
  }

  sendFrame(data, options, cb) {
    const frame = Sender.frame(data, {
      fin: options.fin,
      opcode: options.opcode,
      mask: options.mask,
      maskBuffer: this._generateMask ? maskBuffer : undefined
    });

    this._socket.write(frame, cb);
  }

  ping(data, mask, cb) {
    this.send(data, {
      fin: true,
      opcode: 0x9,
      mask,
      compress: false
    }, cb);
  }

  pong(data, mask, cb) {
    this.send(data, {
      fin: true,
      opcode: 0xa,
      mask,
      compress: false
    }, cb);
  }

  close(code, data, mask, cb) {
    let buf;
    if (code === undefined) {
      buf = EMPTY_BUFFER;
    } else if (typeof code !== 'number' || !isValidStatusCode(code)) {
      throw new TypeError('First argument must be a valid error code number');
    } else if (data === undefined || !data.length) {
      buf = Buffer.allocUnsafe(2);
      buf.writeUInt16BE(code, 0);
    } else {
      const length = Buffer.byteLength(data);
      if (length > 123) {
        throw new RangeError('The message must not be greater than 123 bytes');
      }
      buf = Buffer.allocUnsafe(2 + length);
      buf.writeUInt16BE(code, 0);
      if (typeof data === 'string') {
        buf.write(data, 2);
      } else {
        buf.set(data, 2);
      }
    }

    this.send(buf, {
      fin: true,
      opcode: 0x8,
      mask,
      compress: false
    }, cb);
  }

  dispatch(data, opcode, compress, fin, cb) {
    if (typeof data === 'string') {
      data = Buffer.from(data);
    }

    if (compress && this._deflate) {
      this._deflating = true;
      this._deflate.compress(data, fin, (err, result) => {
        if (err) {
          if (typeof cb === 'function') cb(err);
          return;
        }

        this._deflating = false;
        this.sendFrame(result, {
          fin,
          opcode,
          mask: false,
          compress: false
        }, cb);
      });
      return;
    }

    this.sendFrame(data, {
      fin,
      opcode,
      mask: false,
      compress
    }, cb);
  }

  enqueue(data, options, cb) {
    this._queue.push([data, options, cb]);
  }

  dequeue() {
    const item = this._queue.shift();
    if (item) {
      this.send(item[0], item[1], item[2]);
    }
  }
}

module.exports = Sender;

function callCallbacks(callbacks, arg) {
  for (const cb of callbacks) {
    cb(arg);
  }
}

function onError(callbacks, err) {
  for (const cb of callbacks) {
    cb(err);
  }
}
