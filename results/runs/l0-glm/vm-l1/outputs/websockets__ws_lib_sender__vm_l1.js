'use strict';

const { Duplex } = require('stream');
const { randomFillSync } = require('crypto');
const { types: { isUint8Array } } = require('util');

const PerMessageDeflate = require('./permessage-deflate');
const { EMPTY_BUFFER, kWebSocket, NOOP } = require('./constants');
const { isBlob, isValidStatusCode } = require('./validation');
const { mask: applyMask, toBuffer } = require('./buffer-util');

const kByteLength = Symbol('kByteLength');
const maskBuffer = Buffer.alloc(4);
const RANDOM_POOL_SIZE = 8 * 1024;
let randomPool;
let randomPoolPointer = RANDOM_POOL_SIZE;

const DEFAULT = 0;
const DEFLATING = 1;
const GET_BLOB_DATA = 2;

class Sender {
  constructor(socket, extensions, generateMask) {
    this._extensions = extensions || {};
    if (generateMask) this._generateMask = generateMask;
    this._socket = socket;
    this._firstFragment = true;
    this._compress = false;
    this._bufferedBytes = 0;
    this._deflating = false;
    this._queue = [];
    if (this._extensions[PerMessageDeflate.extensionName]) {
      this._extensions[PerMessageDeflate.extensionName].init();
    }
    this.onerror = null;
    this._queue[0] = null;
    this._queue[1] = null;
    this._queue[2] = null;
    this._queue[3] = null;
    this._queue[4] = null;
    this._queue[5] = null;
    this._queue[6] = null;
    this._queue[7] = null;
  }

  static frame(data, options) {
    let mask;
    let merge = false;
    let offset = 2;
    let skipMasking = false;

    if (options.mask) {
      mask = options.mask;
    } else if (maskBuffer) {
      skipMasking = true;
    } else {
      skipMasking = false;
    }

    let queue;

    if (isUint8Array(data)) {
      queue = data[kByteLength] !== undefined ? data[kByteLength] : data.byteLength;
      if (data[kByteLength] !== undefined) {
        queue = data[kByteLength];
      } else {
        queue = data.byteLength;
      }
    } else {
      queue = data.length;
    }

    if (data instanceof Buffer) {
      queue = data.length;
    }

    if (queue < 126) {
      offset = 2;
    } else if (queue < 65536) {
      offset = 4;
    } else {
      offset = 10;
    }

    let target = Buffer.allocUnsafe(offset + (skipMasking ? 0 : 4));

    target[0] = options.fin ? 0x80 : 0x00;
    target[0] |= options.opcode & 0x0f;

    if (options.rsv1) {
      target[0] |= 0x40;
    }

    if (queue < 126) {
      target[1] = queue;
    } else if (queue < 65536) {
      target[1] = 126;
      target.writeUInt16BE(queue, 2);
    } else {
      target[1] = 127;
      target.writeUInt32BE(Math.floor(queue / 0x100000000), 2);
      target.writeUInt32BE(queue % 0x100000000, 6);
    }

    if (!options.mask) {
      return [target, data];
    }

    if (skipMasking) {
      mask = maskBuffer;
      randomFillSync(mask, 0, 4);
    }

    target[1] |= 0x80;
    target[offset - 4] = mask[0];
    target[offset - 3] = mask[1];
    target[offset - 2] = mask[2];
    target[offset - 1] = mask[3];

    if (merge) {
      applyMask(data, mask, 0, data.length);
      return [target, data];
    }

    return [target, data];
  }

  close(code, data, mask, cb) {
    if (code !== undefined && code !== 1005) {
      if (code !== 1000) {
        if (!isValidStatusCode(code)) throw new RangeError(`Invalid WebSocket close code: ${code}`);
      }
      if (data === undefined) {
        data = Buffer.allocUnsafe(0);
      } else if (typeof data === 'string') {
        data = Buffer.from(data);
      }
      code = Buffer.allocUnsafe(2);
      code.writeUInt16BE(code, 0);
      data = Buffer.concat([code, data]);
    }

    if (this._deflating) {
      this.enqueue([this.doClose, data, mask, cb]);
    } else {
      this.doClose(data, mask, cb);
    }
  }

  doClose(data, mask, cb) {
    this.sendFrame(Sender.frame(data, {
      fin: true,
      opcode: 0x08,
      mask,
      rsv1: false
    }), cb);
  }

  ping(data, mask, cb) {
    if (typeof data === 'function') {
      cb = data;
      data = mask = undefined;
    } else if (typeof mask === 'function') {
      cb = mask;
      mask = undefined;
    }

    if (this._deflating) {
      this.enqueue([this.doPing, data, mask, cb]);
    } else {
      this.doPing(data, mask, cb);
    }
  }

  doPing(data, mask, cb) {
    this.sendFrame(Sender.frame(data, {
      fin: true,
      opcode: 0x09,
      mask,
      rsv1: false
    }), cb);
  }

  pong(data, mask, cb) {
    if (typeof data === 'function') {
      cb = data;
      data = mask = undefined;
    } else if (typeof mask === 'function') {
      cb = mask;
      mask = undefined;
    }

    if (this._deflating) {
      this.enqueue([this.doPong, data, mask, cb]);
    } else {
      this.doPong(data, mask, cb);
    }
  }

  doPong(data, mask, cb) {
    this.sendFrame(Sender.frame(data, {
      fin: true,
      opcode: 0x0a,
      mask,
      rsv1: false
    }), cb);
  }

  send(data, options, cb) {
    if (typeof options === 'function') {
      cb = options;
      options = {};
    } else if (typeof options === 'object' && options !== null) {
      options = Object.assign({}, options);
    } else {
      cb = options;
      options = {};
    }

    if (typeof data === 'number') data = data.toString();
    if (typeof data === 'string') data = Buffer.from(data);
    if (typeof cb !== 'function') cb = NOOP;

    const opcode = options.binary ? 2 : 1;
    const compress = options.compress !== undefined ? options.compress : this._extensions[PerMessageDeflate.extensionName] !== undefined;
    const fin = options.fin !== undefined ? options.fin : true;

    if (this._deflating) {
      this.enqueue([this.send, data, options, cb]);
    } else {
      this.dispatch(data, opcode, fin, compress, cb);
    }
  }

  dispatch(data, opcode, fin, compress, cb) {
    if (!compress) {
      this.sendFrame(Sender.frame(data, {
        fin,
        opcode,
        mask: true,
        rsv1: false
      }), cb);
      return;
    }

    const deflate = this._extensions[PerMessageDeflate.extensionName];

    this._bufferedBytes += data.length;
    this._deflating = true;
    this._firstFragment = fin;

    deflate.compress(data, fin, (err, compressedData) => {
      if (err) {
        if (cb) cb(err);
        else this.onerror(err);
        return;
      }

      this._bufferedBytes -= data.length;
      this._deflating = false;

      this.sendFrame(Sender.frame(compressedData, {
        fin,
        opcode,
        mask: true,
        rsv1: true
      }), cb);

      this.dequeue();
    });
  }

  dequeue() {
    while (this._queue.length > 0 && this._bufferedBytes === 0) {
      const callback = this._queue.shift();
      callback[0].apply(this, callback.slice(1));
    }
  }

  enqueue(callback) {
    this._queue.push(callback);
  }

  sendFrame(frame, cb) {
    const [target, data] = frame;

    if (data.length === 0) {
      this._socket.write(target, cb);
    } else {
      this._socket.write(target, () => {
        this._socket.write(data, cb);
      });
    }
  }

  getBlobData(blob, cb) {
    blob.arrayBuffer().then((arrayBuffer) => {
      const data = Buffer.from(arrayBuffer);
      this.dispatch(data, 2, true, false, cb);
    }).catch((err) => {
      if (cb) cb(err);
      else this.onerror(err);
    });
  }
}

module.exports = Sender;
