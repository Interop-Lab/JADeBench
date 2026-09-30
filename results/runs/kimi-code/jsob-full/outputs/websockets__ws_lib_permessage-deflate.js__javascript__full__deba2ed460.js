'use strict';

const zlib = require('zlib');

const FastBuffer = Buffer[Symbol.species];
const TRAILER = Buffer.from([0x00, 0x00, 0xff, 0xff]);
const kBuffers = Symbol('buffers');
const kCallback = Symbol('callback');
const kError = Symbol('error');
const kPerMessageDeflate = Symbol('permessage-deflate');
const kStatusCode = Symbol('status-code');
const kTotalLength = Symbol('total-length');

let zlibLimiter;

function concatBuffers(list, totalLength) {
  if (list.length === 0) return Buffer.alloc(0);
  if (list.length === 1) return list[0];

  const target = Buffer.allocUnsafe(totalLength);
  let offset = 0;
  for (const buffer of list) {
    target.set(buffer, offset);
    offset += buffer.length;
  }
  return offset < totalLength
    ? new FastBuffer(target.buffer, target.byteOffset, offset)
    : target;
}

class Limiter {
  constructor(concurrency) {
    this.concurrency = concurrency || Infinity;
    this.jobs = [];
    this.pending = 0;
  }

  add(job) {
    this.jobs.push(job);
    this.run();
  }

  run() {
    if (this.pending === this.concurrency) return;

    const job = this.jobs.shift();
    if (!job) return;

    this.pending++;
    job(() => {
      this.pending--;
      this.run();
    });
  }
}

class PerMessageDeflate {
  static extensionName = 'permessage-deflate';

  constructor(options = {}, isServer, maxPayload) {
    this._maxPayload = maxPayload | 0;
    this._options = options;
    this._threshold = options.threshold !== undefined ? options.threshold : 1024;
    this._isServer = !!isServer;
    this._deflate = null;
    this._inflate = null;
    this.params = null;

    if (!zlibLimiter) {
      const concurrency = options.concurrencyLimit !== undefined
        ? options.concurrencyLimit
        : 10;
      zlibLimiter = new Limiter(concurrency);
    }
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
    configurations = this.normalizeParams(configurations);
    this.params = this._isServer
      ? this.acceptAsServer(configurations)
      : this.acceptAsClient(configurations);
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
      if (callback) callback(new Error('The deflate stream was closed while data was being processed'));
    }
  }

  acceptAsServer(offers) {
    const options = this._options;
    const accepted = offers.find((params) => {
      if (
        (options.serverNoContextTakeover === false && params.server_no_context_takeover) ||
        (params.server_max_window_bits &&
          (options.serverMaxWindowBits === false ||
            (typeof options.serverMaxWindowBits === 'number' &&
              options.serverMaxWindowBits > params.server_max_window_bits))) ||
        (typeof options.clientMaxWindowBits === 'number' && !params.client_max_window_bits)
      ) {
        return false;
      }
      return true;
    });

    if (!accepted) throw new Error('None of the extension offers can be accepted');

    if (options.serverNoContextTakeover) accepted.server_no_context_takeover = true;
    if (options.clientNoContextTakeover) accepted.client_no_context_takeover = true;
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

  acceptAsClient(response) {
    const params = response[0];

    if (this._options.clientNoContextTakeover === false && params.client_no_context_takeover) {
      throw new Error('Unexpected parameter "client_no_context_takeover"');
    }

    if (!params.client_max_window_bits) {
      if (typeof this._options.clientMaxWindowBits === 'number') {
        params.client_max_window_bits = this._options.clientMaxWindowBits;
      }
    } else if (
      this._options.clientMaxWindowBits === false ||
      (typeof this._options.clientMaxWindowBits === 'number' &&
        params.client_max_window_bits > this._options.clientMaxWindowBits)
    ) {
      throw new Error('Unexpected or invalid parameter "client_max_window_bits"');
    }

    return params;
  }

  normalizeParams(configurations) {
    configurations.forEach((params) => {
      Object.keys(params).forEach((key) => {
        let value = params[key];
        if (value.length > 1) throw new Error(`Parameter "${key}" must have only a single value`);

        value = value[0];
        if (key === 'client_max_window_bits') {
          if (value !== true && (typeof value !== 'number' || value < 8 || value > 15)) {
            throw new TypeError(`Invalid value for parameter "${key}": ${value}`);
          }
          if (!this._isServer && value === true) {
            throw new TypeError(`Invalid value for parameter "${key}": ${value}`);
          }
        } else if (key === 'server_max_window_bits') {
          if (typeof value !== 'number' || value < 8 || value > 15) {
            throw new TypeError(`Invalid value for parameter "${key}": ${value}`);
          }
        } else if (
          key === 'client_no_context_takeover' ||
          key === 'server_no_context_takeover'
        ) {
          if (value !== true) throw new TypeError(`Invalid value for parameter "${key}": ${value}`);
        } else {
          throw new Error(`Unknown parameter "${key}"`);
        }

        params[key] = value;
      });
    });

    return configurations;
  }

  decompress(data, fin, callback) {
    zlibLimiter.add((done) => {
      this._decompress(data, fin, (error, result) => {
        done();
        callback(error, result);
      });
    });
  }

  compress(data, fin, callback) {
    zlibLimiter.add((done) => {
      this._compress(data, fin, (error, result) => {
        done();
        callback(error, result);
      });
    });
  }

  _decompress(data, fin, callback) {
    const endpoint = this._isServer ? 'client' : 'server';

    if (!this._inflate) {
      const windowBits = this.params[`${endpoint}_max_window_bits`];
      this._inflate = zlib.createInflateRaw({
        ...this._options.zlibInflateOptions,
        windowBits: windowBits || zlib.Z_DEFAULT_WINDOWBITS
      });
      this._inflate[kPerMessageDeflate] = this;
      this._inflate[kTotalLength] = 0;
      this._inflate[kBuffers] = [];
      this._inflate.on('error', inflateOnError);
      this._inflate.on('data', inflateOnData);
    }

    this._inflate[kCallback] = callback;
    this._inflate.write(data);
    if (fin) this._inflate.write(TRAILER);

    this._inflate.flush(() => {
      if (!this._inflate) return;
      const error = this._inflate[kError];
      if (error) {
        this._inflate.close();
        this._inflate = null;
        callback(error);
        return;
      }

      const result = concatBuffers(this._inflate[kBuffers], this._inflate[kTotalLength]);
      this._inflate[kCallback] = null;
      this._inflate[kTotalLength] = 0;
      this._inflate[kBuffers] = [];

      if (fin && this.params[`${endpoint}_no_context_takeover`]) this._inflate.reset();
      callback(null, result);
    });
  }

  _compress(data, fin, callback) {
    const endpoint = this._isServer ? 'server' : 'client';

    if (!this._deflate) {
      const windowBits = this.params[`${endpoint}_max_window_bits`];
      this._deflate = zlib.createDeflateRaw({
        ...this._options.zlibDeflateOptions,
        windowBits: windowBits || zlib.Z_DEFAULT_WINDOWBITS
      });
      this._deflate[kTotalLength] = 0;
      this._deflate[kBuffers] = [];
      this._deflate.on('data', deflateOnData);
    }

    this._deflate[kCallback] = callback;
    this._deflate.write(data);
    this._deflate.flush(zlib.Z_SYNC_FLUSH, () => {
      if (!this._deflate) return;

      let result = concatBuffers(this._deflate[kBuffers], this._deflate[kTotalLength]);
      if (fin) result = new FastBuffer(result.buffer, result.byteOffset, result.length - 4);

      this._deflate[kCallback] = null;
      this._deflate[kTotalLength] = 0;
      this._deflate[kBuffers] = [];

      if (fin && this.params[`${endpoint}_no_context_takeover`]) this._deflate.reset();
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

  if (
    this[kPerMessageDeflate]._maxPayload < 1 ||
    this[kTotalLength] <= this[kPerMessageDeflate]._maxPayload
  ) {
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
    return;
  }

  error[kStatusCode] = 1007;
  this[kCallback](error);
}

module.exports = PerMessageDeflate;
