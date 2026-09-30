'use strict';

const { Duplex } = require('stream');
const { randomFillSync } = require('crypto');
const { types: { isUint8Array } } = require('util');

const EMPTY_BUFFER = Buffer.alloc(0);
const kWebSocket = Symbol('kWebSocket');
const NOOP = () => {};

const RANDOM_POOL_SIZE = 8 * 1024;
let randomPool;
let randomPoolPointer = RANDOM_POOL_SIZE;

const DEFAULT = 0;
const DEFLATING = 1;
const GET_BLOB_DATA = 2;

class Sender {
  constructor(socket, extensions, generateMask) {
    this._socket = socket;
    this._extensions = extensions || {};
    this._generateMask = generateMask;
    this._bufferedBytes = 0;
    this._deflating = false;
    this._queue = [];
  }

  static frame(data, options) {
    const merge = options.merge;
    const mask = options.mask;
    const opcode = options.opcode;
    const readOnly = options.readOnly;
    const rsv1 = options.rsv1;

    let offset = 2;
    let dataLength = data.length;

    if (dataLength < 126) {
      offset += 0;
    } else if (dataLength < 65536) {
      offset += 2;
    } else {
      offset += 8;
    }

    const mergeBuffers = merge && dataLength < 1024;
    const totalLength = mergeBuffers ? dataLength + offset : offset;
    const target = Buffer.allocUnsafe(totalLength);

    target[0] = opcode | 0x80;
    if (rsv1) target[0] |= 0x40;

    if (dataLength < 126) {
      target[1] = dataLength;
    } else if (dataLength < 65536) {
      target[1] = 126;
      target.writeUInt16BE(dataLength, 2);
    } else {
      target[1] = 127;
      target.writeUInt32BE(0, 2);
      target.writeUInt32BE(dataLength, 6);
    }

    if (!mergeBuffers) {
      if (mask) {
        target[1] |= 0x80;
        offset += 4;
      }
      return [target, data];
    }

    if (mask) {
      target[1] |= 0x80;
      const maskKey = randomFillSync(Buffer.allocUnsafe(4));
      maskKey.copy(target, offset);
      offset += 4;
      applyMask(data, maskKey, target, offset, dataLength);
    } else {
      data.copy(target, offset);
    }

    return [target];
  }

  close(code, data, mask, cb) {
    let buf;

    if (code !== undefined) {
      if (typeof code !== 'number' || !isValidStatusCode(code)) {
        throw new TypeError('First argument must be a valid error code number');
      }
      buf = Buffer.allocUnsafe(2 + Buffer.byteLength(data || ''));
      buf.writeUInt16BE(code, 0);
      if (data) buf.write(data, 2);
    }

    if (this._deflating) {
      this.enqueue([this.doClose, buf, mask, cb]);
    } else {
      this.doClose(buf, mask, cb);
    }
  }

  doClose(data, mask, cb) {
    this.sendFrame(Sender.frame(data, {
      fin: true,
      rsv1: false,
      opcode: 0x08,
      mask,
      readOnly: false
    }), cb);
  }

  ping(data, mask, cb) {
    const buf = toBuffer(data);

    if (mask) {
      const maskKey = randomFillSync(Buffer.allocUnsafe(4));
      applyMask(buf, maskKey, buf, 0, buf.length);
    }

    if (this._deflating) {
      this.enqueue([this.doPing, buf, mask, cb]);
    } else {
      this.doPing(buf, mask, cb);
    }
  }

  doPing(data, mask, cb) {
    this.sendFrame(Sender.frame(data, {
      fin: true,
      rsv1: false,
      opcode: 0x09,
      mask,
      readOnly: false
    }), cb);
  }

  pong(data, mask, cb) {
    const buf = toBuffer(data);

    if (mask) {
      const maskKey = randomFillSync(Buffer.allocUnsafe(4));
      applyMask(buf, maskKey, buf, 0, buf.length);
    }

    if (this._deflating) {
      this.enqueue([this.doPong, buf, mask, cb]);
    } else {
      this.doPong(buf, mask, cb);
    }
  }

  doPong(data, mask, cb) {
    this.sendFrame(Sender.frame(data, {
      fin: true,
      rsv1: false,
      opcode: 0x0a,
      mask,
      readOnly: false
    }), cb);
  }

  send(data, options, cb) {
    const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];
    let opcode = options.binary ? 2 : 1;
    let rsv1 = false;

    if (isBlob(data)) {
      if (this._bufferedBytes > 0 || this._deflating) {
        this.enqueue([this.getBlobData, data, options, cb]);
      } else {
        this.getBlobData(data, options, cb);
      }
      return;
    }

    if (perMessageDeflate) {
      const params = perMessageDeflate.params[perMessageDeflate._isServer ? 'server_no_context_takeover' : 'client_no_context_takeover'];
      if (params) {
        rsv1 = true;
        opcode = options.binary ? 2 : 1;
      }
    }

    if (this._deflating) {
      this.enqueue([this.dispatch, data, options, cb]);
    } else {
      this.dispatch(data, options, cb);
    }
  }

  getBlobData(blob, options, cb) {
    const reader = blob.stream().getReader();
    const chunks = [];

    reader.read().then(function processResult(result) {
      if (result.done) {
        const data = Buffer.concat(chunks);
        this.dispatch(data, options, cb);
        return;
      }
      chunks.push(Buffer.from(result.value));
      return reader.read().then(processResult);
    }.bind(this)).catch((err) => {
      if (cb) cb(err);
    });
  }

  dispatch(data, options, cb) {
    if (!options.compress || this._bufferedBytes > 0) {
      this.sendFrame(Sender.frame(data, {
        fin: true,
        rsv1: false,
        opcode: options.binary ? 2 : 1,
        mask: options.mask,
        readOnly: options.readOnly
      }), cb);
      return;
    }

    this._deflating = true;
    const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];

    perMessageDeflate.compress(data, options.fin, (_, buf) => {
      if (this._socket.destroyed) {
        if (cb) cb(new Error('The socket was closed before the message was sent'));
        return;
      }

      const readOnly = options.readOnly;
      const rsv1 = buf.length < data.length;
      const opcode = options.binary ? 2 : 1;

      this.sendFrame(Sender.frame(buf, {
        fin: true,
        rsv1,
        opcode,
        mask: options.mask,
        readOnly
      }), cb);

      this._deflating = false;
      this.dequeue();
    });
  }

  dequeue() {
    while (!this._deflating && this._queue.length) {
      const params = this._queue.shift();
      this._bufferedBytes -= params[1].length;
      this._socket.cork();
      params[0].apply(this, params.slice(1));
      this._socket.uncork();
    }
  }

  enqueue(params) {
    this._bufferedBytes += params[1].length;
    this._queue.push(params);
  }

  sendFrame(list, cb) {
    if (list.length === 2) {
      this._socket.cork();
      this._socket.write(list[0]);
      this._socket.write(list[1], cb);
      this._socket.uncork();
    } else {
      this._socket.write(list[0], cb);
    }
  }
}

function toBuffer(data) {
  if (Buffer.isBuffer(data)) return data;
  if (isUint8Array(data)) return Buffer.from(data);
  return Buffer.from(String(data));
}

function applyMask(source, mask, output, offset, length) {
  for (let i = 0; i < length; i++) {
    output[offset + i] = source[i] ^ mask[i & 3];
  }
}

function isValidStatusCode(code) {
  return (
    (code >= 1000 && code <= 1014 && code !== 1004 && code !== 1005 && code !== 1006) ||
    (code >= 3000 && code <= 4999)
  );
}

function isBlob(value) {
  return typeof Blob !== 'undefined' && value instanceof Blob;
}

module.exports = Sender;
