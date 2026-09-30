'use strict';

const zlib = require('zlib');

const BINARY_TYPES = ['nodebuffer', 'arraybuffer', 'fragments'];
const hasBlob = typeof Blob !== 'undefined';
if (hasBlob) BINARY_TYPES.push('blob');

const constants = {
  BINARY_TYPES,
  CLOSE_TIMEOUT: 30_000,
  EMPTY_BUFFER: Buffer.alloc(0),
  GUID: '258EAFA5-E914-47DA-95CA-C5AB0DC85B11',
  hasBlob,
  kForOnEventAttribute: Symbol('kIsForOnEventAttribute'),
  kListener: Symbol('kListener'),
  kStatusCode: Symbol('status-code'),
  kWebSocket: Symbol('websocket'),
  NOOP: () => {}
};

const FastBuffer = Buffer[Symbol.species];

function mask(source, maskBytes, target, targetStart, length) {
  for (let index = 0; index < length; index++) {
    target[targetStart + index] = source[index] ^ maskBytes[index & 3];
  }
}

function unmask(buffer, maskBytes) {
  for (let index = 0; index < buffer.length; index++) {
    buffer[index] ^= maskBytes[index & 3];
  }
}

const bufferUtil = {
  concat(chunks, totalLength) {
    if (chunks.length === 0) return constants.EMPTY_BUFFER;
    if (chunks.length === 1) return chunks[0];

    const buffer = Buffer.allocUnsafe(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      buffer.set(chunk, offset);
      offset += chunk.length;
    }
    return offset < totalLength
      ? new FastBuffer(buffer.buffer, buffer.byteOffset, offset)
      : buffer;
  },

  mask,

  toArrayBuffer(value) {
    return value.length === value.buffer.byteLength
      ? value.buffer
      : value.buffer.slice(value.byteOffset, value.byteOffset + value.length);
  },

  toBuffer(value) {
    bufferUtil.toBuffer.readOnly = true;
    if (Buffer.isBuffer(value)) return value;

    if (value instanceof ArrayBuffer) {
      return new FastBuffer(value);
    }
    if (ArrayBuffer.isView(value)) {
      return new FastBuffer(value.buffer, value.byteOffset, value.byteLength);
    }

    bufferUtil.toBuffer.readOnly = false;
    return Buffer.from(value);
  },

  unmask
};

if (!process.env.WS_NO_BUFFER_UTIL) {
  try {
    const nativeBufferUtil = require('bufferutil');
    bufferUtil.mask = (source, maskBytes, target, targetStart, length) => {
      if (length < 48) {
        mask(source, maskBytes, target, targetStart, length);
      } else {
        nativeBufferUtil.mask(source, maskBytes, target, targetStart, length);
      }
    };
    bufferUtil.unmask = (buffer, maskBytes) => {
      if (buffer.length < 32) {
        unmask(buffer, maskBytes);
      } else {
        nativeBufferUtil.unmask(buffer, maskBytes);
      }
    };
  } catch {}
}

const kDone = Symbol('kDone');
const kRun = Symbol('kRun');

class Limiter {
  constructor(concurrency) {
    this[kDone] = () => {
      this.pending--;
      this[kRun]();
    };
    this.concurrency = concurrency || Infinity;
    this.jobs = [];
    this.pending = 0;
  }

  add(job) {
    this.jobs.push(job);
    this[kRun]();
  }

  [kRun]() {
    if (this.pending === this.concurrency || this.jobs.length === 0) return;
    const job = this.jobs.shift();
    this.pending++;
    job(this[kDone]);
  }
}

let zlibLimiter;
const TRAILER = Buffer.from([0, 0, 255, 255]);
const kPerMessageDeflate = Symbol('permessage-deflate');
const kTotalLength = Symbol('total-length');
const kCallback = Symbol('callback');
const kBuffers = Symbol('buffers');
const kError = Symbol('error');

class PerMessageDeflate {
  constructor(options) {
    this._options = options || {};
    this._threshold = this._options.threshold !== undefined ? this._options.threshold : 1024;
    this._maxPayload = 0 | this._options.maxPayload;
    this._isServer = !!this._options.isServer;
    this._deflate = null;
    this._inflate = null;
    this.params = null;

    if (!zlibLimiter) {
      const concurrency = this._options.concurrencyLimit !== undefined
        ? this._options.concurrencyLimit
        : 10;
      zlibLimiter = new Limiter(concurrency);
    }
  }

  static get extensionName() {
    return 'permessage-deflate';
  }

  offer() {
    const params = {};
    if (this._options.serverNoContextTakeover) params.server_no_context_takeover = true;
    if (this._options.clientNoContextTakeover) params.client_no_context_takeover = true;
    if (this._options.serverMaxWindowBits) {
      params.server_max_window_bits = this._options.serverMaxWindowBits;
    }
    if (this._options.clientMaxWindowBits) {
      params.client_max_window_bits = this._options.clientMaxWindowBits;
    } else if (this._options.clientMaxWindowBits == null) {
      params.client_max_window_bits = true;
    }
    return params;
  }

  accept(params) {
    const normalizedParams = this.normalizeParams(params);
    this.params = this._isServer
      ? this.acceptAsServer(normalizedParams)
      : this.acceptAsClient(normalizedParams);
    return this.params;
  }

  cleanup() {
    if (this._inflate) {
      this._inflate.close();
      this._inflate = null;
    }
    if (this._deflate) {
      const callback = this._deflate[kCallback];
      this._deflate.close();
      this._deflate = null;
      if (callback) callback(Error('The deflate stream was closed while data was being processed'));
    }
  }

  acceptAsServer(offers) {
    const options = this._options;
    const accepted = offers.find((offer) => {
      if (options.serverNoContextTakeover === false && offer.server_no_context_takeover) {
        return false;
      }
      if (offer.server_max_window_bits &&
          (options.serverMaxWindowBits === false ||
           typeof options.serverMaxWindowBits === 'number' &&
           options.serverMaxWindowBits > offer.server_max_window_bits)) {
        return false;
      }
      if (typeof options.clientMaxWindowBits === 'number' && !offer.client_max_window_bits) {
        return false;
      }
      return true;
    });

    if (!accepted) throw Error('None of the extension offers can be accepted');
    if (options.serverNoContextTakeover) accepted.server_no_context_takeover = true;
    if (options.clientNoContextTakeover) accepted.client_no_context_takeover = true;
    if (typeof options.serverMaxWindowBits === 'number') {
      accepted.server_max_window_bits = options.serverMaxWindowBits;
    }
    if (typeof options.clientMaxWindowBits === 'number') {
      accepted.client_max_window_bits = options.clientMaxWindowBits;
    } else if (accepted.client_max_window_bits === true || options.clientMaxWindowBits === false) {
      delete accepted.client_max_window_bits;
    }
    return accepted;
  }

  acceptAsClient(params) {
    const accepted = params[0];
    if (this._options.clientNoContextTakeover === false && accepted.client_no_context_takeover) {
      throw Error('Unexpected parameter "client_no_context_takeover"');
    }
    if (accepted.client_max_window_bits) {
      if (this._options.clientMaxWindowBits === false ||
          typeof this._options.clientMaxWindowBits === 'number' &&
          accepted.client_max_window_bits > this._options.clientMaxWindowBits) {
        throw Error('Unexpected or invalid parameter "client_max_window_bits"');
      }
    } else if (typeof this._options.clientMaxWindowBits === 'number') {
      accepted.client_max_window_bits = this._options.clientMaxWindowBits;
    }
    return accepted;
  }

  normalizeParams(params) {
    params.forEach((param) => {
      Object.getOwnPropertyNames(param).forEach((name) => {
        let value = param[name];
        if (value.length > 1) {
          throw Error(`Parameter "${name}" must have only a single value`);
        }
        value = value[0];

        if (name === 'client_max_window_bits') {
          if (value !== true) {
            const number = +value;
            if (!Number.isInteger(number) || number < 8 || number > 15) {
              throw new TypeError(`Invalid value for parameter "${name}": ${value}`);
            }
            value = number;
          } else if (!this._isServer) {
            throw new TypeError(`Invalid value for parameter "${name}": ${value}`);
          }
        } else if (name === 'server_max_window_bits') {
          const number = +value;
          if (!Number.isInteger(number) || number < 8 || number > 15) {
            throw new TypeError(`Invalid value for parameter "${name}": ${value}`);
          }
          value = number;
        } else if (name !== 'client_no_context_takeover' && name !== 'server_no_context_takeover') {
          throw Error(`Unknown parameter "${name}"`);
        } else if (value !== true) {
          throw new TypeError(`Invalid value for parameter "${name}": ${value}`);
        }
        param[name] = value;
      });
    });
    return params;
  }

  decompress(data, fin, callback) {
    zlibLimiter.add((release) => {
      this._decompress(data, fin, (error, result) => {
        release();
        callback(error, result);
      });
    });
  }

  compress(data, fin, callback) {
    zlibLimiter.add((release) => {
      this._compress(data, fin, (error, result) => {
        release();
        callback(error, result);
      });
    });
  }

  _decompress(data, fin, callback) {
    const direction = this._isServer ? 'client' : 'server';
    if (!this._inflate) {
      const windowBitsName = `${direction}_max_window_bits`;
      const windowBits = typeof this.params[windowBitsName] !== 'number'
        ? zlib.Z_DEFAULT_WINDOWBITS
        : this.params[windowBitsName];
      this._inflate = zlib.createInflateRaw({
        ...this._options.zlibInflateOptions,
        windowBits
      });
      this._inflate[kPerMessageDeflate] = this;
      this._inflate[kTotalLength] = 0;
      this._inflate[kBuffers] = [];
      this._inflate.on('error', inflateOnError);
      this._inflate.on('data', inflateOnData);
    }

    this._inflate[kCallback] = callback;
    this._inflate.write(data);
    if (!fin) this._inflate.write(TRAILER);
    this._inflate.flush(() => {
      const error = this._inflate[kError];
      if (error) {
        this._inflate.close();
        this._inflate = null;
        callback(error);
        return;
      }

      const result = bufferUtil.concat(this._inflate[kBuffers], this._inflate[kTotalLength]);
      if (this._inflate._readableState.endEmitted) {
        this._inflate.close();
        this._inflate = null;
      } else {
        this._inflate[kTotalLength] = 0;
        this._inflate[kBuffers] = [];
        if (fin && this.params[`${direction}_no_context_takeover`]) {
          this._inflate.reset();
        }
      }
      callback(null, result);
    });
  }

  _compress(data, fin, callback) {
    const direction = this._isServer ? 'server' : 'client';
    if (!this._deflate) {
      const windowBitsName = `${direction}_max_window_bits`;
      const windowBits = typeof this.params[windowBitsName] !== 'number'
        ? zlib.Z_DEFAULT_WINDOWBITS
        : this.params[windowBitsName];
      this._deflate = zlib.createDeflateRaw({
        ...this._options.zlibDeflateOptions,
        windowBits
      });
      this._deflate[kTotalLength] = 0;
      this._deflate[kBuffers] = [];
      this._deflate.on('data', deflateOnData);
    }

    this._deflate[kCallback] = callback;
    this._deflate.write(data);
    this._deflate.flush(zlib.Z_SYNC_FLUSH, () => {
      if (!this._deflate) return;
      let result = bufferUtil.concat(this._deflate[kBuffers], this._deflate[kTotalLength]);
      if (fin) result = new FastBuffer(result.buffer, result.byteOffset, result.length - 4);
      this._deflate[kCallback] = null;
      this._deflate[kTotalLength] = 0;
      this._deflate[kBuffers] = [];
      if (fin && this.params[`${direction}_no_context_takeover`]) this._deflate.reset();
      callback(null, result);
    });
  }
}

function deflateOnData(chunk) {
  this[kBuffers].push(chunk);
  this[kTotalLength] += chunk.length;
}

function inflateOnData(chunk) {
  this[kTotalLength] += chunk.length;
  const owner = this[kPerMessageDeflate];
  if (owner._maxPayload < 1 || this[kTotalLength] <= owner._maxPayload) {
    this[kBuffers].push(chunk);
    return;
  }
  this[kError] = new RangeError('Max payload size exceeded');
  this[kError].code = 'WS_ERR_UNSUPPORTED_MESSAGE_LENGTH';
  this.removeListener('data', inflateOnData);
  this.reset();
}

function inflateOnError(error) {
  this[kPerMessageDeflate]._inflate = null;
  if (this[kError]) {
    this[kCallback](this[kError]);
  } else {
    error[constants.kStatusCode] = 1007;
    this[kCallback](error);
  }
}

module.exports = PerMessageDeflate;
