'use strict';

const zlib = require('zlib');

const EMPTY_BUFFER = Buffer.alloc(0);
const FastBuffer = Buffer[Symbol.species];
const SYNC_FLUSH_TRAILER = Buffer.from([0x00, 0x00, 0xff, 0xff]);

const kStatusCode = Symbol('status-code');
const kPerMessageDeflate = Symbol('permessage-deflate');
const kTotalLength = Symbol('total-length');
const kCallback = Symbol('callback');
const kBuffers = Symbol('buffers');
const kError = Symbol('error');
const kDone = Symbol('kDone');
const kRun = Symbol('kRun');

function concat(chunks, totalLength) {
  if (chunks.length === 0) return EMPTY_BUFFER;
  if (chunks.length === 1) return chunks[0];

  const buffer = Buffer.allocUnsafe(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    buffer.set(chunk, offset);
    offset += chunk.length;
  }

  if (offset < totalLength) {
    return new FastBuffer(buffer.buffer, buffer.byteOffset, offset);
  }

  return buffer;
}

function mask(source, maskKey, output, outputOffset, length) {
  for (let i = 0; i < length; i++) {
    output[outputOffset + i] = source[i] ^ maskKey[i & 3];
  }
}

function unmask(buffer, maskKey) {
  for (let i = 0; i < buffer.length; i++) {
    buffer[i] ^= maskKey[i & 3];
  }
}

const bufferUtil = {
  concat,
  mask,
  toArrayBuffer(buffer) {
    if (buffer.length === buffer.buffer.byteLength) return buffer.buffer;
    return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.length);
  },
  toBuffer(data) {
    bufferUtil.toBuffer.readOnly = true;

    if (Buffer.isBuffer(data)) return data;
    if (data instanceof ArrayBuffer) return new FastBuffer(data);
    if (ArrayBuffer.isView(data)) {
      return new FastBuffer(data.buffer, data.byteOffset, data.byteLength);
    }

    bufferUtil.toBuffer.readOnly = false;
    return Buffer.from(data);
  },
  unmask
};

if (!process.env.WS_NO_BUFFER_UTIL) {
  try {
    const nativeBufferUtil = require('bufferutil');

    bufferUtil.mask = function nativeMask(source, maskKey, output, outputOffset, length) {
      if (length < 48) {
        mask(source, maskKey, output, outputOffset, length);
      } else {
        nativeBufferUtil.mask(source, maskKey, output, outputOffset, length);
      }
    };

    bufferUtil.unmask = function nativeUnmask(buffer, maskKey) {
      if (buffer.length < 32) {
        unmask(buffer, maskKey);
      } else {
        nativeBufferUtil.unmask(buffer, maskKey);
      }
    };
  } catch {
    // Native acceleration is optional.
  }
}

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

let sharedZlibLimiter;

class PerMessageDeflate {
  constructor(options) {
    this._options = options || {};
    this._threshold = this._options.threshold !== undefined
      ? this._options.threshold
      : 1024;
    this._maxPayload = this._options.maxPayload | 0;
    this._isServer = Boolean(this._options.isServer);
    this._deflate = null;
    this._inflate = null;
    this.params = null;

    if (!sharedZlibLimiter) {
      const concurrency = this._options.concurrencyLimit !== undefined
        ? this._options.concurrencyLimit
        : 10;
      sharedZlibLimiter = new Limiter(concurrency);
    }
  }

  static get extensionName() {
    return 'permessage-deflate';
  }

  offer() {
    const params = {};

    if (this._options.serverNoContextTakeover) {
      params.server_no_context_takeover = true;
    }
    if (this._options.clientNoContextTakeover) {
      params.client_no_context_takeover = true;
    }
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

  accept(configurations) {
    const normalized = this.normalizeParams(configurations);
    this.params = this._isServer
      ? this.acceptAsServer(normalized)
      : this.acceptAsClient(normalized);
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

      if (callback) {
        callback(new Error('The deflate stream was closed while data was being processed'));
      }
    }
  }

  acceptAsServer(offers) {
    const options = this._options;
    const accepted = offers.find((offer) => {
      const rejectsServerTakeover =
        options.serverNoContextTakeover === false &&
        offer.server_no_context_takeover;
      const rejectsServerWindowBits =
        offer.server_max_window_bits &&
        (options.serverMaxWindowBits === false ||
          (typeof options.serverMaxWindowBits === 'number' &&
            options.serverMaxWindowBits > offer.server_max_window_bits));
      const requiresClientWindowBits =
        typeof options.clientMaxWindowBits === 'number' &&
        !offer.client_max_window_bits;

      return !(
        rejectsServerTakeover ||
        rejectsServerWindowBits ||
        requiresClientWindowBits
      );
    });

    if (!accepted) {
      throw new Error('None of the extension offers can be accepted');
    }

    if (options.serverNoContextTakeover) {
      accepted.server_no_context_takeover = true;
    }
    if (options.clientNoContextTakeover) {
      accepted.client_no_context_takeover = true;
    }
    if (typeof options.serverMaxWindowBits === 'number') {
      accepted.server_max_window_bits = options.serverMaxWindowBits;
    }
    if (typeof options.clientMaxWindowBits === 'number') {
      accepted.client_max_window_bits = options.clientMaxWindowBits;
    } else if (
      accepted.client_max_window_bits === true ||
      options.clientMaxWindowBits === false
    ) {
      delete accepted.client_max_window_bits;
    }

    return accepted;
  }

  acceptAsClient(responses) {
    const accepted = responses[0];

    if (
      this._options.clientNoContextTakeover === false &&
      accepted.client_no_context_takeover
    ) {
      throw new Error('Unexpected parameter "client_no_context_takeover"');
    }

    if (accepted.client_max_window_bits) {
      if (
        this._options.clientMaxWindowBits === false ||
        (typeof this._options.clientMaxWindowBits === 'number' &&
          accepted.client_max_window_bits > this._options.clientMaxWindowBits)
      ) {
        throw new Error('Unexpected or invalid parameter "client_max_window_bits"');
      }
    } else if (typeof this._options.clientMaxWindowBits === 'number') {
      accepted.client_max_window_bits = this._options.clientMaxWindowBits;
    }

    return accepted;
  }

  normalizeParams(configurations) {
    configurations.forEach((params) => {
      Object.keys(params).forEach((name) => {
        let value = params[name];

        if (value.length > 1) {
          throw new Error(`Parameter "${name}" must have only a single value`);
        }

        value = value[0];

        if (name === 'client_max_window_bits') {
          if (value !== true) {
            const windowBits = +value;
            if (!Number.isInteger(windowBits) || windowBits < 8 || windowBits > 15) {
              throw new TypeError(`Invalid value for parameter "${name}": ${value}`);
            }
            value = windowBits;
          } else if (!this._isServer) {
            throw new TypeError(`Invalid value for parameter "${name}": ${value}`);
          }
        } else if (name === 'server_max_window_bits') {
          const windowBits = +value;
          if (!Number.isInteger(windowBits) || windowBits < 8 || windowBits > 15) {
            throw new TypeError(`Invalid value for parameter "${name}": ${value}`);
          }
          value = windowBits;
        } else {
          if (
            name !== 'client_no_context_takeover' &&
            name !== 'server_no_context_takeover'
          ) {
            throw new Error(`Unknown parameter "${name}"`);
          }
          if (value !== true) {
            throw new TypeError(`Invalid value for parameter "${name}": ${value}`);
          }
        }

        params[name] = value;
      });
    });

    return configurations;
  }

  decompress(data, fin, callback) {
    sharedZlibLimiter.add((done) => {
      this._decompress(data, fin, (error, result) => {
        done();
        callback(error, result);
      });
    });
  }

  compress(data, fin, callback) {
    sharedZlibLimiter.add((done) => {
      this._compress(data, fin, (error, result) => {
        done();
        callback(error, result);
      });
    });
  }

  _decompress(data, fin, callback) {
    const peerEndpoint = this._isServer ? 'client' : 'server';

    if (!this._inflate) {
      const windowBitsName = `${peerEndpoint}_max_window_bits`;
      const windowBits = typeof this.params[windowBitsName] === 'number'
        ? this.params[windowBitsName]
        : zlib.Z_DEFAULT_WINDOWBITS;

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
    if (fin) this._inflate.write(SYNC_FLUSH_TRAILER);

    this._inflate.flush(() => {
      const error = this._inflate[kError];
      if (error) {
        this._inflate.close();
        this._inflate = null;
        callback(error);
        return;
      }

      const result = bufferUtil.concat(
        this._inflate[kBuffers],
        this._inflate[kTotalLength]
      );

      if (this._inflate._readableState.endEmitted) {
        this._inflate.close();
        this._inflate = null;
      } else {
        this._inflate[kTotalLength] = 0;
        this._inflate[kBuffers] = [];
        if (fin && this.params[`${peerEndpoint}_no_context_takeover`]) {
          this._inflate.reset();
        }
      }

      callback(null, result);
    });
  }

  _compress(data, fin, callback) {
    const localEndpoint = this._isServer ? 'server' : 'client';

    if (!this._deflate) {
      const windowBitsName = `${localEndpoint}_max_window_bits`;
      const windowBits = typeof this.params[windowBitsName] === 'number'
        ? this.params[windowBitsName]
        : zlib.Z_DEFAULT_WINDOWBITS;

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
      // cleanup() has already notified the pending callback.
      if (!this._deflate) return;

      let result = bufferUtil.concat(
        this._deflate[kBuffers],
        this._deflate[kTotalLength]
      );

      if (fin) {
        result = new FastBuffer(
          result.buffer,
          result.byteOffset,
          result.length - SYNC_FLUSH_TRAILER.length
        );
      }

      this._deflate[kCallback] = null;
      this._deflate[kTotalLength] = 0;
      this._deflate[kBuffers] = [];

      if (fin && this.params[`${localEndpoint}_no_context_takeover`]) {
        this._deflate.reset();
      }

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

  const extension = this[kPerMessageDeflate];
  if (extension._maxPayload < 1 || this[kTotalLength] <= extension._maxPayload) {
    this[kBuffers].push(chunk);
    return;
  }

  this[kError] = new RangeError('Max payload size exceeded');
  this[kError].code = 'WS_ERR_UNSUPPORTED_MESSAGE_LENGTH';
  this[kError][kStatusCode] = 1009;
  this.removeListener('data', inflateOnData);
  this.reset();
}

function inflateOnError(error) {
  this[kPerMessageDeflate]._inflate = null;

  if (this[kError]) {
    this[kCallback](this[kError]);
  } else {
    error[kStatusCode] = 1007;
    this[kCallback](error);
  }
}

module.exports = PerMessageDeflate;
