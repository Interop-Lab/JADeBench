'use strict';

const { randomFillSync } = require('crypto');

const EMPTY_BUFFER = Buffer.alloc(0);
const kByteLength = Symbol('kByteLength');
const kWebSocket = Symbol('kWebSocket');
const NOOP = () => {};
const PERMESSAGE_DEFLATE = 'permessage-deflate';
const maskBuffer = Buffer.alloc(4);

const hasBlob = typeof Blob !== 'undefined';
const fastMask = !process.env.WS_NO_BUFFER_UTIL ? loadBufferUtil() : null;

function loadBufferUtil() {
  try {
    return require('bufferutil').mask;
  } catch {
    return null;
  }
}

function mask(source, maskBytes, output, offset, length) {
  if (fastMask && length >= 48) {
    fastMask(source, maskBytes, output, offset, length);
    return;
  }

  for (let index = 0; index < length; index++) {
    output[offset + index] = source[index] ^ maskBytes[index & 3];
  }
}

function toBuffer(data) {
  toBuffer.readOnly = true;

  if (Buffer.isBuffer(data)) return data;

  let buffer;
  if (data instanceof ArrayBuffer) {
    buffer = new Buffer(data);
  } else if (ArrayBuffer.isView(data)) {
    buffer = new Buffer(data.buffer, data.byteOffset, data.byteLength);
  } else {
    buffer = Buffer.from(data);
    toBuffer.readOnly = false;
  }

  return buffer;
}

function isValidStatusCode(code) {
  return (
    (code >= 1000 && code <= 1014 && code !== 1004 && code !== 1005 && code !== 1006) ||
    (code >= 3000 && code <= 4999)
  );
}

class Sender {
  constructor(socket, extensions, generateMask) {
    this._extensions = extensions || {};

    if (generateMask) {
      this._generateMask = generateMask;
      this._maskBuffer = Buffer.alloc(4);
    }

    this._socket = socket;
    this._firstFragment = true;
    this._compress = false;
    this._bufferedBytes = 0;
    this._queue = [];
    this._state = Sender.DEFAULT;
    this.onerror = NOOP;
    this[kWebSocket] = undefined;
  }

  static frame(data, options) {
    let maskBytes;
    let merge = false;
    let offset = 2;
    let skipMasking = false;

    if (options.mask) {
      maskBytes = options.maskBuffer || maskBuffer;

      if (options.generateMask) {
        options.generateMask(maskBytes);
      } else {
        randomFillSync(maskBytes, 0, 4);
      }

      skipMasking =
        maskBytes[0] === 0 &&
        maskBytes[1] === 0 &&
        maskBytes[2] === 0 &&
        maskBytes[3] === 0;
      offset = 6;
    }

    let dataLength;
    if (typeof data === 'string') {
      if ((!options.mask || skipMasking) && options[kByteLength] !== undefined) {
        dataLength = options[kByteLength];
      } else {
        dataLength = Buffer.byteLength(data);
        merge = options.mask && !skipMasking;
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

    const target = Buffer.allocUnsafeSlow(merge ? dataLength + offset : offset);
    target[0] = options.fin ? options.opcode | 0x80 : options.opcode;
    if (options.rsv1) target[0] |= 0x40;
    target[1] = payloadLength;

    if (payloadLength === 126) {
      target.writeUInt16BE(dataLength, 2);
    } else if (payloadLength === 127) {
      target[2] = target[3] = 0;
      target.writeUIntBE(dataLength, 4, 6);
    }

    if (!options.mask) return [target, data];

    target[1] |= 0x80;
    target.set(maskBytes, offset - 4);

    if (skipMasking) return [target, data];

    if (merge) {
      const source = typeof data === 'string' ? Buffer.from(data) : data;
      mask(source, maskBytes, target, offset, dataLength);
      return [target];
    }

    mask(data, maskBytes, data, 0, dataLength);
    return [target, data];
  }

  close(code, data, maskFrame, callback) {
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
      if (length > 123) {
        throw new RangeError('The message must not be greater than 123 bytes');
      }

      buffer = Buffer.allocUnsafe(2 + length);
      buffer.writeUInt16BE(code, 0);
      if (Buffer.isBuffer(data)) buffer.set(data, 2);
      else buffer.write(data, 2);
    }

    const options = {
      [kByteLength]: buffer.length,
      fin: true,
      generateMask: this._generateMask,
      mask: maskFrame,
      maskBuffer: this._maskBuffer,
      opcode: 0x08,
      readOnly: false,
      rsv1: false
    };

    if (this._state !== Sender.DEFAULT) {
      this.enqueue([this.dispatch, buffer, false, options, callback]);
    } else {
      this.sendFrame(Sender.frame(buffer, options), callback);
    }
  }

  ping(data, maskFrame, callback) {
    let byteLength;
    let readOnly;

    if (typeof data === 'string') {
      byteLength = Buffer.byteLength(data);
      readOnly = false;
    } else if (hasBlob && data instanceof Blob) {
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
      mask: maskFrame,
      maskBuffer: this._maskBuffer,
      opcode: 0x09,
      readOnly,
      rsv1: false
    };

    if (hasBlob && data instanceof Blob) {
      if (this._state !== Sender.DEFAULT) this.enqueue([this.getBlobData, data, false, options, callback]);
      else this.getBlobData(data, false, options, callback);
    } else if (this._state !== Sender.DEFAULT) {
      this.enqueue([this.dispatch, data, false, options, callback]);
    } else {
      this.sendFrame(Sender.frame(data, options), callback);
    }
  }

  pong(data, maskFrame, callback) {
    let byteLength;
    let readOnly;

    if (typeof data === 'string') {
      byteLength = Buffer.byteLength(data);
      readOnly = false;
    } else if (hasBlob && data instanceof Blob) {
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
      mask: maskFrame,
      maskBuffer: this._maskBuffer,
      opcode: 0x0a,
      readOnly,
      rsv1: false
    };

    if (hasBlob && data instanceof Blob) {
      if (this._state !== Sender.DEFAULT) this.enqueue([this.getBlobData, data, false, options, callback]);
      else this.getBlobData(data, false, options, callback);
    } else if (this._state !== Sender.DEFAULT) {
      this.enqueue([this.dispatch, data, false, options, callback]);
    } else {
      this.sendFrame(Sender.frame(data, options), callback);
    }
  }

  send(data, options, callback) {
    const perMessageDeflate = this._extensions[PERMESSAGE_DEFLATE];
    let opcode = options.binary ? 2 : 1;
    let rsv1 = options.compress;

    let byteLength;
    let readOnly;

    if (typeof data === 'string') {
      byteLength = Buffer.byteLength(data);
      readOnly = false;
    } else if (hasBlob && data instanceof Blob) {
      byteLength = data.size;
      readOnly = false;
    } else {
      data = toBuffer(data);
      byteLength = data.length;
      readOnly = toBuffer.readOnly;
    }

    if (this._firstFragment) {
      this._firstFragment = false;
      if (rsv1 && perMessageDeflate) {
        rsv1 = byteLength >= perMessageDeflate._threshold;
      }
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

    if (hasBlob && data instanceof Blob) {
      if (this._state !== Sender.DEFAULT) this.enqueue([this.getBlobData, data, this._compress, frameOptions, callback]);
      else this.getBlobData(data, this._compress, frameOptions, callback);
    } else if (this._state !== Sender.DEFAULT) {
      this.enqueue([this.dispatch, data, this._compress, frameOptions, callback]);
    } else {
      this.dispatch(data, this._compress, frameOptions, callback);
    }
  }

  getBlobData(blob, compress, options, callback) {
    this._bufferedBytes += options[kByteLength];
    this._state = Sender.GET_BLOB_DATA;

    blob.arrayBuffer().then((arrayBuffer) => {
      if (this._socket.destroyed) {
        const error = new Error('The socket was closed while the blob was being read');
        process.nextTick(callCallbacks, this, error, callback);
        return;
      }

      this._bufferedBytes -= options[kByteLength];
      const data = toBuffer(arrayBuffer);

      if (!compress) {
        this._state = Sender.DEFAULT;
        this.sendFrame(Sender.frame(data, options), callback);
        this.dequeue();
      } else {
        this.dispatch(data, compress, options, callback);
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
    this._state = Sender.DEFLATING;
    perMessageDeflate.compress(data, options.fin, (_, compressedData) => {
      if (this._socket.destroyed) {
        const error = new Error('The socket was closed while data was being compressed');
        callCallbacks(this, error, callback);
        return;
      }

      this._bufferedBytes -= options[kByteLength];
      this._state = Sender.DEFAULT;
      options.readOnly = false;
      this.sendFrame(Sender.frame(compressedData, options), callback);
      this.dequeue();
    });
  }

  dequeue() {
    while (this._state === Sender.DEFAULT && this._queue.length) {
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

Sender.DEFAULT = 0;
Sender.DEFLATING = 1;
Sender.GET_BLOB_DATA = 2;

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
