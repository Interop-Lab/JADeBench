'use strict';
const zlib = require('zlib');
const { EMPTY_BUFFER } = require('./constants');
const bufferUtil = require('./buffer-util');
const Limiter = require('./limiter');
const { kStatusCode } = require('./constants');

const FastBuffer = Buffer[Symbol.species];
const TRAILER = Buffer.from([0x00, 0x00, 0xff, 0xff]);
const kPerMessageDeflate = Symbol('permessage-deflate');
const kTotalLength = Symbol('total-length');
const kCallback = Symbol('callback');
const kBuffers = Symbol('buffers');
const kError = Symbol('error');

let zlibLimiter;

class PerMessageDeflate {
  constructor(options) {
    this._options = options || {};
    this._threshold = this._options.threshold !== undefined ? this._options.threshold : 1024;
    this._concurrencyLimit = this._options.concurrencyLimit !== undefined ? this._options.concurrencyLimit : 10;
    this._isServer = !!this._options.server;
    this._deflate = null;
    this._inflate = null;

    if (!zlibLimiter) {
      const concurrency = this._options.concurrencyLimit !== undefined ? this._options.concurrencyLimit : 10;
      zlibLimiter = new Limiter(concurrency);
    }
  }

  static get extensionName() {
    return 'permessage-deflate';
  }

  accept(offers) {
    const options = {};
    if (this._options.serverNoContextTakeover) {
      options.server_no_context_takeover = true;
    }
    if (this._options.clientNoContextTakeover) {
      options.client_no_context_takeover = true;
    }
    if (this._options.serverMaxWindowBits) {
      options.server_max_window_bits = this._options.serverMaxWindowBits;
    }
    if (this._options.clientMaxWindowBits) {
      options.client_max_window_bits = this._options.clientMaxWindowBits;
    } else if (this._options.clientMaxWindowBits === null) {
      options.client_max_window_bits = true;
    }

    return options;
  }

  compress(data, fin, callback) {
    zlibLimiter.add(done => {
      this._compress(data, fin, (err, result) => {
        done();
        callback(err, result);
      });
    });
  }

  decompress(data, fin, callback) {
    zlibLimiter.add(done => {
      this._decompress(data, fin, (err, result) => {
        done();
        callback(err, result);
      });
    });
  }

  _compress(data, fin, callback) {
    const endpoint = this._isServer ? 'server' : 'client';

    if (!this._deflate) {
      const key = endpoint + '_max_window_bits';
      const windowBits = typeof this._options[key] !== 'undefined' ? this._options[key] : zlib.constants.Z_DEFAULT_WINDOWBITS;
      this._deflate = zlib.createDeflateRaw({
        ...this._options.zlibDeflateOptions,
        windowBits
      });
      this._deflate[kPerMessageDeflate] = this;
      this._deflate[kTotalLength] = 0;
      this._deflate[kBuffers] = [];
      this._deflate.on('data', deflateOnData);
      this._deflate.on('error', deflateOnError);
    }

    this._deflate[kCallback] = callback;
    this._deflate.write(data);
    if (fin) this._deflate.write(TRAILER);
    this._deflate.flush(() => {
      const err = this._deflate[kError];
      if (err) {
        this._deflate.close();
        this._deflate = null;
        callback(err);
        return;
      }

      let buf = bufferUtil.concat(this._deflate[kBuffers], this._deflate[kTotalLength]);
      if (fin) {
        buf = new FastBuffer(buf.buffer, buf.byteOffset, buf.length - 4);
      }

      this._deflate[kCallback] = null;
      this._deflate[kTotalLength] = 0;
      this._deflate[kBuffers] = [];
      if (fin && this._deflate[endpoint + '_no_context_takeover']) {
        this._deflate.close();
        this._deflate = null;
      }

      callback(null, buf);
    });
  }

  _decompress(data, fin, callback) {
    const endpoint = this._isServer ? 'client' : 'server';

    if (!this._inflate) {
      const key = endpoint + '_max_window_bits';
      const windowBits = typeof this._options[key] !== 'undefined' ? this._options[key] : zlib.constants.Z_DEFAULT_WINDOWBITS;
      this._inflate = zlib.createInflateRaw({
        ...this._options.zlibInflateOptions,
        windowBits
      });
      this._inflate[kPerMessageDeflate] = this;
      this._inflate[kTotalLength] = 0;
      this._inflate[kBuffers] = [];
      this._inflate.on('data', inflateOnData);
      this._inflate.on('error', inflateOnError);
    }

    this._inflate[kCallback] = callback;
    this._inflate.write(data);
    if (fin) this._inflate.write(TRAILER);
    this._inflate.flush(() => {
      const err = this._inflate[kError];
      if (err) {
        this._inflate.close();
        this._inflate = null;
        callback(err);
        return;
      }

      const buf = bufferUtil.concat(this._inflate[kBuffers], this._inflate[kTotalLength]);
      if (fin && this._inflate[endpoint + '_no_context_takeover']) {
        this._inflate.close();
        this._inflate = null;
      } else {
        this._inflate[kTotalLength] = 0;
        this._inflate[kBuffers] = [];
      }

      callback(null, buf);
    });
  }

  cleanup() {
    if (this._deflate) {
      this._deflate.close();
      this._deflate = null;
    }
    if (this._inflate) {
      const callback = this._inflate[kCallback];
      this._inflate.close();
      this._inflate = null;
      if (callback) {
        callback(new Error('The deflate stream was closed while data was being processed'));
      }
    }
  }
}

module.exports = PerMessageDeflate;

function deflateOnData(chunk) {
  this[kBuffers].push(chunk);
  this[kTotalLength] += chunk.length;
}

function inflateOnData(chunk) {
  this[kTotalLength] += chunk.length;

  if (this[kPerMessageDeflate]._maxPayload < 1 || this[kTotalLength] <= this[kPerMessageDeflate]._maxPayload) {
    this[kBuffers].push(chunk);
    return;
  }

  this[kError] = new RangeError('Max payload size exceeded');
  this[kError][kStatusCode] = 1009;
  this[kError].code = 'WS_ERR_UNSUPPORTED_MESSAGE_LENGTH';
  this.close();
}

function inflateOnError(err) {
  this[kPerMessageDeflate]._inflate = null;
  if (this[kError]) {
    this[kCallback](this[kError]);
    return;
  }
  err[kStatusCode] = 1007;
  this[kCallback](err);
}
