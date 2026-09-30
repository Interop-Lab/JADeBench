'use strict';

const crypto = require('crypto');

const EMPTY_BUFFER = Buffer.alloc(0);
const NOOP = () => {};
const kWebSocket = Symbol('websocket');
const DEFAULT = 0;
const DEFLATING = 1;
const GET_BLOB_DATA = 2;
const RANDOM_POOL_SIZE = 8 * 1024;

let maskBuffer;
let randomPool;
let randomPoolPointer = RANDOM_POOL_SIZE;

function generateMask(mask) {
  if (!randomPool || randomPoolPointer + 4 > RANDOM_POOL_SIZE) {
    randomPool = crypto.randomBytes(RANDOM_POOL_SIZE);
    randomPoolPointer = 0;
  }

  mask.set(randomPool, randomPoolPointer, randomPoolPointer + 4);
  randomPoolPointer += 4;
}

function applyMask(source, mask, target, offset, length) {
  for (let index = 0; index < length; index++) {
    target[offset + index] = source[index] ^ mask[index & 3];
  }
}

function toBuffer(data) {
  if (Buffer.isBuffer(data)) return data;
  if (data instanceof ArrayBuffer) return Buffer.from(data);
  if (ArrayBuffer.isView(data)) {
    return Buffer.from(data.buffer, data.byteOffset, data.byteLength);
  }
  return Buffer.from(data);
}

function isBlob(data) {
  return typeof Blob !== 'undefined' && data instanceof Blob;
}

function isValidStatusCode(code) {
  return (code >= 1000 && code < 1000 + 999) &&
    !((code >= 1004 && code <= 1006) || (code >= 1012 && code <= 1016));
}

function callCallbacks(sender, error) {
  while (sender._queue.length) {
    const entry = sender._queue.shift();
    sender._bufferedBytes -= entry[3];
    entry[2](error);
  }
}

class Sender {
  constructor(socket, extensions, generateMaskFunction) {
    this._extensions = extensions || {};
    this._socket = socket;
    this._firstFragment = true;
    this._compress = false;
    this._bufferedBytes = 0;
    this._queue = [];
    this._state = DEFAULT;
    this._generateMask = generateMaskFunction || generateMask;
  }

  static frame(data, options) {
    const length = data.length;
    const headerLength = 2 + (length < 126 ? 0 : length < 65536 ? 2 : 8) +
      (options.mask ? 4 : 0);
    const header = Buffer.allocUnsafe(headerLength);
    header[0] = options.fin ? options.opcode | 0x80 : options.opcode;
    if (options.rsv1) header[0] |= 0x40;

    let offset = 2;
    if (length < 126) {
      header[1] = length;
    } else if (length < 65536) {
      header[1] = 126;
      header.writeUInt16BE(length, offset);
      offset += 2;
    } else {
      header[1] = 127;
      header.writeUInt32BE(Math.floor(length / 0x100000000), offset);
      header.writeUInt32BE(length >>> 0, offset + 4);
      offset += 8;
    }

    if (!options.mask) return [header, data];

    header[1] |= 0x80;
    const mask = header.subarray(offset, offset + 4);
    options.generateMask(mask);
    const masked = Buffer.allocUnsafe(data.length);
    applyMask(data, mask, masked, 0, data.length);
    return [header, masked];
  }

  close(code, data, mask, callback) {
    if (code === undefined) {
      this.sendFrame(Sender.frame(EMPTY_BUFFER, { fin: true, opcode: 8, mask }));
      return;
    }
    if (typeof code !== 'number' || !isValidStatusCode(code)) {
      throw new TypeError('First argument must be a valid error code number');
    }
    const reason = data ? Buffer.from(data) : EMPTY_BUFFER;
    if (reason.length > 123) throw new RangeError('The message must not be greater than 123 bytes');
    const payload = Buffer.allocUnsafe(2 + reason.length);
    payload.writeUInt16BE(code, 0);
    reason.copy(payload, 2);
    this.sendFrame(Sender.frame(payload, {
      fin: true,
      opcode: 8,
      mask,
      generateMask: this._generateMask
    }), callback);
  }

  ping(data, mask, callback) {
    if (typeof mask === 'function') {
      callback = mask;
      mask = false;
    }
    const payload = data === undefined ? EMPTY_BUFFER : toBuffer(data);
    if (payload.length > 125) throw new RangeError('The data is too long');
    this.sendFrame(Sender.frame(payload, {
      fin: true,
      opcode: 9,
      mask,
      generateMask: this._generateMask
    }), callback);
  }

  pong(data, mask, callback) {
    if (typeof mask === 'function') {
      callback = mask;
      mask = false;
    }
    const payload = data === undefined ? EMPTY_BUFFER : toBuffer(data);
    if (payload.length > 125) throw new RangeError('The data is too long');
    this.sendFrame(Sender.frame(payload, {
      fin: true,
      opcode: 10,
      mask,
      generateMask: this._generateMask
    }), callback);
  }

  send(data, options, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }
    options = options || {};
    if (typeof callback !== 'function') callback = NOOP;

    let opcode = options.binary ? 2 : 1;
    let payload = data;
    if (typeof data === 'string') {
      payload = Buffer.from(data);
      opcode = options.binary ? 2 : 1;
    } else if (isBlob(data)) {
      this.getBlobData(data, options, callback);
      return;
    } else {
      payload = toBuffer(data);
      opcode = 2;
    }

    if (this._firstFragment) {
      this._firstFragment = false;
    } else {
      opcode = 0;
    }
    if (options.fin) this._firstFragment = true;

    const rsv1 = options.compress && this._extensions.permessageDeflate &&
      this._firstFragment === false;
    const frame = Sender.frame(payload, {
      fin: options.fin !== false,
      opcode,
      mask: options.mask,
      rsv1,
      generateMask: this._generateMask
    });
    this.sendFrame(frame, callback);
  }

  getBlobData(blob, options, callback) {
    blob.arrayBuffer().then((data) => {
      this.send(Buffer.from(data), options, callback);
    }, callback);
  }

  dispatch(data, compress, options, callback) {
    if (this._state === DEFLATING) {
      this.enqueue(data, compress, options, callback);
      return;
    }
    this.send(data, options, callback);
  }

  dequeue() {
    while (this._queue.length && this._state === DEFAULT) {
      const [data, compress, options, callback] = this._queue.shift();
      this._bufferedBytes -= data.length;
      this.dispatch(data, compress, options, callback);
    }
  }

  enqueue(data, compress, options, callback) {
    this._bufferedBytes += data.length;
    this._queue.push([data, compress, options, callback, data.length]);
  }

  sendFrame(frames, callback) {
    if (this._socket.destroyed) {
      callback(new Error('The socket was closed before the frame was sent'));
      return;
    }
    if (this._socket._writableState && this._socket._writableState.corked) {
      this._socket.write(frames[0]);
      this._socket.write(frames[1], callback);
    } else {
      this._socket.cork();
      this._socket.write(frames[0]);
      this._socket.write(frames[1], callback);
      this._socket.uncork();
    }
  }
}

module.exports = Sender;
