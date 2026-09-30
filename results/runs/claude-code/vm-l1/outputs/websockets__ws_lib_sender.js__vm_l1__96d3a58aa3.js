'use strict';

const { randomFillSync } = require('crypto');

const EMPTY_BUFFER = Buffer.alloc(0);
const NOOP = () => {};
const kByteLength = Symbol('kByteLength');
const maskBuffer = Buffer.alloc(4);
const RANDOM_POOL_SIZE = 8 * 1024;

const DEFAULT = 0;
const DEFLATING = 1;
const GET_BLOB_DATA = 2;
const PERMESSAGE_DEFLATE = 'permessage-deflate';

let randomPool;
let randomPoolPointer = RANDOM_POOL_SIZE;

function applyMask(source, mask, output, offset, length) {
  for (let index = 0; index < length; index++) {
    output[offset + index] = source[index] ^ mask[index & 3];
  }
}

function toBuffer(data) {
  toBuffer.readOnly = true;

  if (Buffer.isBuffer(data)) return data;

  let buffer;
  if (data instanceof ArrayBuffer) {
    buffer = Buffer.from(data);
  } else if (ArrayBuffer.isView(data)) {
    buffer = Buffer.from(data.buffer, data.byteOffset, data.byteLength);
  } else {
    buffer = Buffer.from(data);
    toBuffer.readOnly = false;
  }

  return buffer;
}

toBuffer.readOnly = false;

function isBlob(value) {
  return (
    typeof Blob !== 'undefined' && value instanceof Blob ||
    value &&
      typeof value === 'object' &&
      typeof value.arrayBuffer === 'function' &&
      typeof value.stream === 'function' &&
      typeof value.type === 'string' &&
      typeof value.size === 'number'
  );
}

function isValidStatusCode(code) {
  return (
    code >= 1000 &&
      code <= 1014 &&
      code !== 1004 &&
      code !== 1005 &&
      code !== 1006 ||
    code >= 3000 && code <= 4999
  );
}

function fillMask(mask) {
  if (randomPoolPointer === RANDOM_POOL_SIZE) {
    if (randomPool === undefined) randomPool = Buffer.allocUnsafe(RANDOM_POOL_SIZE);
    randomFillSync(randomPool, 0, RANDOM_POOL_SIZE);
    randomPoolPointer = 0;
  }

  mask[0] = randomPool[randomPoolPointer++];
  mask[1] = randomPool[randomPoolPointer++];
  mask[2] = randomPool[randomPoolPointer++];
  mask[3] = randomPool[randomPoolPointer++];
}

class Sender {
  constructor(socket, extensions, generateMask) {
    this._extensions = extensions || {};
    this._generateMask = generateMask;
    this._maskBuffer = generateMask ? Buffer.alloc(4) : maskBuffer;
    this._socket = socket;
    this._firstFragment = true;
    this._compress = false;
    this._bufferedBytes = 0;
    this._queue = [];
    this._state = DEFAULT;
    this.onerror = NOOP;
  }

  static frame(data, options) {
    let mask;
    let merge = false;
    let offset = 2;
    let skipMasking = false;

    if (options.mask) {
      mask = options.maskBuffer || maskBuffer;
      if (options.generateMask) options.generateMask(mask);
      else fillMask(mask);

      skipMasking = mask[0] === 0 && mask[1] === 0 && mask[2] === 0 && mask[3] === 0;
      offset = 6;
    }

    let dataLength;
    if (typeof data === 'string') {
      if ((!options.mask || skipMasking) && options[kByteLength] !== undefined) {
        dataLength = options[kByteLength];
      } else {
        data = Buffer.from(data);
        dataLength = data.length;
      }
    } else {
      dataLength = data.length;
      merge = options.mask && options.readOnly && !skipMasking;
    }

    let payloadLength = dataLength;
    if (dataLength >= 65536) {
      offset += 8;
      payloadLength = 127;
    } else if (dataLength > 125) {
      offset += 2;
      payloadLength = 126;
    }

    const target = Buffer.allocUnsafe(merge ? dataLength + offset : offset);
    target[0] = options.fin ? options.opcode | 0x80 : options.opcode;
    if (options.rsv1) target[0] |= 0x40;
    target[1] = payloadLength;

    if (payloadLength === 126) {
      target.writeUInt16BE(dataLength, 2);
    } else if (payloadLength === 127) {
      target[2] = target[3] = 0;
      target.writeUIntBE(dataLength, 4, 6);
    }

    if (options.mask) {
      target[1] |= 0x80;
      target.set(mask, offset - 4);
    }

    if (!dataLength) return [target];

    if (options.mask) {
      if (skipMasking) return [target, data];
      if (merge) {
        applyMask(data, mask, target, offset, dataLength);
        return [target];
      }
      applyMask(data, mask, data, 0, dataLength);
    }

    return [target, data];
  }

  close(code, data, mask, callback) {
    let buffer;

    if (code === undefined) {
      buffer = EMPTY_BUFFER;
    } else if (typeof code !== 'number' || !isValidStatusCode(code)) {
      throw new TypeError(`First argument must be a valid error code number`);
    } else if (data === undefined || !data.length) {
      buffer = Buffer.allocUnsafe(2);
      buffer.writeUInt16BE(code, 0);
    } else {
      const length = Buffer.byteLength(data);
      if (length > 123) throw new RangeError('The message must not be greater than 123 bytes');

      buffer = Buffer.allocUnsafe(2 + length);
      buffer.writeUInt16BE(code, 0);
      if (Buffer.isBuffer(data)) data.copy(buffer, 2);
      else buffer.write(data, 2);
    }

    const options = {
      [kByteLength]: buffer.length,
      fin: true,
      generateMask: this._generateMask,
      mask,
      maskBuffer: this._maskBuffer,
      opcode: 0x08,
      readOnly: false,
      rsv1: false
    };

    if (this._state !== DEFAULT) {
      this.enqueue([this.dispatch, buffer, false, options, callback]);
    } else {
      this.sendFrame(Sender.frame(buffer, options), callback);
    }
  }

  ping(data, mask, callback) {
    let byteLength;
    let readOnly;

    if (typeof data === 'string') {
      byteLength = Buffer.byteLength(data);
      readOnly = false;
    } else if (isBlob(data)) {
      byteLength = data.size;
      readOnly = false;
    } else {
      data = toBuffer(data);
      byteLength = data.length;
      readOnly = toBuffer.readOnly;
    }

    if (byteLength > 125) throw new RangeError('The data size must not be greater than 125 bytes');

    const options = {
      [kByteLength]: byteLength,
      fin: true,
      generateMask: this._generateMask,
      mask,
      maskBuffer: this._maskBuffer,
      opcode: 0x09,
      readOnly,
      rsv1: false
    };

    if (isBlob(data)) {
      if (this._state !== DEFAULT) this.enqueue([this.getBlobData, data, false, options, callback]);
      else this.getBlobData(data, false, options, callback);
    } else if (this._state !== DEFAULT) {
      this.enqueue([this.dispatch, data, false, options, callback]);
    } else {
      this.sendFrame(Sender.frame(data, options), callback);
    }
  }

  pong(data, mask, callback) {
    let byteLength;
    let readOnly;

    if (typeof data === 'string') {
      byteLength = Buffer.byteLength(data);
      readOnly = false;
    } else if (isBlob(data)) {
      byteLength = data.size;
      readOnly = false;
    } else {
      data = toBuffer(data);
      byteLength = data.length;
      readOnly = toBuffer.readOnly;
    }

    if (byteLength > 125) throw new RangeError('The data size must not be greater than 125 bytes');

    const options = {
      [kByteLength]: byteLength,
      fin: true,
      generateMask: this._generateMask,
      mask,
      maskBuffer: this._maskBuffer,
      opcode: 0x0a,
      readOnly,
      rsv1: false
    };

    if (isBlob(data)) {
      if (this._state !== DEFAULT) this.enqueue([this.getBlobData, data, false, options, callback]);
      else this.getBlobData(data, false, options, callback);
    } else if (this._state !== DEFAULT) {
      this.enqueue([this.dispatch, data, false, options, callback]);
    } else {
      this.sendFrame(Sender.frame(data, options), callback);
    }
  }

  send(data, options, callback) {
    const perMessageDeflate = this._extensions[PERMESSAGE_DEFLATE];
    let opcode = options.binary ? 0x02 : 0x01;
    let rsv1 = options.compress;
    let byteLength;
    let readOnly;

    if (typeof data === 'string') {
      byteLength = Buffer.byteLength(data);
      readOnly = false;
    } else if (isBlob(data)) {
      byteLength = data.size;
      readOnly = false;
    } else {
      data = toBuffer(data);
      byteLength = data.length;
      readOnly = toBuffer.readOnly;
    }

    if (this._firstFragment) {
      this._firstFragment = false;
      if (rsv1 && perMessageDeflate) rsv1 = byteLength >= perMessageDeflate._threshold;
      this._compress = rsv1;
    } else {
      rsv1 = false;
      opcode = 0;
    }

    if (options.fin) this._firstFragment = true;

    const frameOptions = {
      [kByteLength]: byteLength,
      fin: options.fin,
      generateMask: this._generateMask,
      mask: options.mask,
      maskBuffer: this._maskBuffer,
      opcode,
      readOnly,
      rsv1
    };

    if (isBlob(data)) {
      if (this._state !== DEFAULT) {
        this.enqueue([this.getBlobData, data, this._compress, frameOptions, callback]);
      } else {
        this.getBlobData(data, this._compress, frameOptions, callback);
      }
    } else if (this._state !== DEFAULT) {
      this.enqueue([this.dispatch, data, this._compress, frameOptions, callback]);
    } else {
      this.dispatch(data, this._compress, frameOptions, callback);
    }
  }

  getBlobData(blob, compress, options, callback) {
    this._bufferedBytes += options[kByteLength];
    this._state = GET_BLOB_DATA;

    blob.arrayBuffer().then((arrayBuffer) => {
      if (this._socket.destroyed) {
        const error = new Error('The socket was closed while the blob was being read');
        process.nextTick(callCallbacks, this, error, callback);
        return;
      }

      this._bufferedBytes -= options[kByteLength];
      const data = toBuffer(arrayBuffer);

      if (compress) {
        this.dispatch(data, true, options, callback);
      } else {
        this._state = DEFAULT;
        this.sendFrame(Sender.frame(data, options), callback);
        this.dequeue();
      }
    }).catch((error) => {
      process.nextTick(onError, this, error, callback);
    });
  }

  dispatch(data, compress, options, callback) {
    if (!compress) {
      this.sendFrame(Sender.frame(data, options), callback);
      return;
    }

    const perMessageDeflate = this._extensions[PERMESSAGE_DEFLATE];
    this._bufferedBytes += options[kByteLength];
    this._state = DEFLATING;

    perMessageDeflate.compress(data, options.fin, (_, buffer) => {
      if (this._socket.destroyed) {
        const error = new Error('The socket was closed while data was being compressed');
        callCallbacks(this, error, callback);
        return;
      }

      this._bufferedBytes -= options[kByteLength];
      this._state = DEFAULT;
      options.readOnly = false;
      this.sendFrame(Sender.frame(buffer, options), callback);
      this.dequeue();
    });
  }

  dequeue() {
    while (this._state === DEFAULT && this._queue.length) {
      const params = this._queue.shift();
      this._bufferedBytes -= params[3][kByteLength];
      Reflect.apply(params[0], this, params.slice(1));
    }
  }

  enqueue(params) {
    this._bufferedBytes += params[3][kByteLength];
    this._queue.push(params);
  }

  sendFrame(list, callback) {
    if (list.length === 2) {
      this._socket.cork();
      this._socket.write(list[0]);
      this._socket.write(list[1], callback);
      this._socket.uncork();
    } else {
      this._socket.write(list[0], callback);
    }
  }
}

function callCallbacks(sender, error, callback) {
  if (typeof callback === 'function') callback(error);

  for (const params of sender._queue) {
    const queuedCallback = params[params.length - 1];
    if (typeof queuedCallback === 'function') queuedCallback(error);
  }
}

function onError(sender, error, callback) {
  callCallbacks(sender, error, callback);
  sender.onerror(error);
}

module.exports = Sender;
