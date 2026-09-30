'use strict';

const zlib = require('zlib');
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
    this._maxPayload = options.maxPayload | 0;
    this._options = options;
    this._threshold = options.threshold === undefined ? 1024 : options.threshold;
    this._acceptNoContextTakeover = options.serverNoContextTakeover === undefined ? false : options.serverNoContextTakeover;
    this._acceptMaxWindowBits = options.serverMaxWindowBits === undefined ? false : options.serverMaxWindowBits;
    this._constrainedMaxWindowBits = options.constrainedMaxWindowBits === undefined ? false : options.constrainedMaxWindowBits;
    this._zlibLimiter = options.zlibLimiter === undefined ? zlibLimiter : options.zlibLimiter;
    this._deflate = null;
    this._inflate = null;
    this._deflateWrite = null;
    this._inflateWrite = null;
    this._deflateRaw = null;
    this._inflateRaw = null;
    this._deflateQueue = [];
    this._inflateQueue = [];
  }

  static get extensionName() {
    return 'permessage-deflate';
  }

  cleanup() {
    if (this._deflate) {
      this._deflate.close();
      this._deflate = null;
    }
    if (this._inflate) {
      this._inflate.close();
      this._inflate = null;
    }
  }

  acceptAsClient(offer) {
    const options = {};
    let maxWindowBits = offer.parameters['client_max_window_bits'];
    if (maxWindowBits !== undefined) {
      maxWindowBits = parseInt(maxWindowBits, 10);
      if (!this._acceptMaxWindowBits) {
        return null;
      }
      if (this._constrainedMaxWindowBits && maxWindowBits > this._constrainedMaxWindowBits) {
        maxWindowBits = this._constrainedMaxWindowBits;
      }
      options.clientMaxWindowBits = maxWindowBits;
    } else if (this._acceptMaxWindowBits) {
      options.clientMaxWindowBits = this._constrainedMaxWindowBits || true;
    }
    if (offer.parameters['client_no_context_takeover'] !== undefined) {
      if (!this._acceptNoContextTakeover) {
        return null;
      }
      options.clientNoContextTakeover = true;
    }
    return options;
  }

  acceptAsServer(offer) {
    const options = {};
    if (offer.parameters['server_max_window_bits'] !== undefined) {
      const maxWindowBits = parseInt(offer.parameters['server_max_window_bits'], 10);
      if (this._constrainedMaxWindowBits && maxWindowBits > this._constrainedMaxWindowBits) {
        return null;
      }
      options.serverMaxWindowBits = maxWindowBits;
    } else if (this._acceptMaxWindowBits) {
      options.serverMaxWindowBits = this._constrainedMaxWindowBits;
    }
    if (offer.parameters['server_no_context_takeover'] !== undefined) {
      if (!this._acceptNoContextTakeover) {
        return null;
      }
      options.serverNoContextTakeover = true;
    }
    return options;
  }

  normalizeParams(params) {
    const options = {};
    for (const key of Object.keys(params)) {
      let value = params[key];
      if (value === true) {
        value = '';
      } else if (typeof value === 'string') {
        value = parseInt(value, 10);
        if (isNaN(value)) {
          return null;
        }
      } else {
        return null;
      }
      if (key === 'server_max_window_bits' || key === 'client_max_window_bits') {
        if (this._constrainedMaxWindowBits && value > this._constrainedMaxWindowBits) {
          return null;
        }
      }
      options[key] = value;
    }
    return options;
  }

  decompress(data, fin, callback) {
    zlibLimiter = this._zlibLimiter || new Limiter({ concurrency: this._options.concurrencyLimit || 10 });
    if (!this._inflate) {
      const windowBits = this._options.clientMaxWindowBits === true ? zlib.constants.Z_DEFAULT_WINDOWBITS : this._options.clientMaxWindowBits;
      this._inflate = zlib.createInflateRaw({ windowBits });
      this._inflate[kPerMessageDeflate] = this;
      this._inflate[kTotalLength] = 0;
      this._inflate[kBuffers] = [];
      this._inflate[kCallback] = null;
      this._inflate.on('error', inflateOnError);
      this._inflate.on('data', inflateOnData);
    }
    this._inflate[kCallback] = callback;
    this._inflate[kBuffers].push(data);
    this._inflate[kTotalLength] += data.length;
    if (this._inflate[kTotalLength] > this._maxPayload) {
      this._inflate[kBuffers].length = 0;
      this._inflate[kTotalLength] = 0;
      callback(new RangeError('Max payload size exceeded'), null, fin);
      return;
    }
    if (fin) {
      this._inflate.write(Buffer.concat(this._inflate[kBuffers]));
      this._inflate[kBuffers].length = 0;
      this._inflate[kTotalLength] = 0;
      this._inflate.flush(zlib.constants.Z_SYNC_FLUSH, () => {
        if (!this._inflate) {
          return;
        }
        const error = this._inflate[kError];
        this._inflate[kError] = null;
        this._inflate[kCallback] = null;
        if (error) {
          callback(error, null, fin);
          return;
        }
        const data = Buffer.concat(this._inflate[kBuffers]);
        this._inflate[kBuffers].length = 0;
        callback(null, data, fin);
      });
    }
  }

  compress(data, fin, callback) {
    zlibLimiter = this._zlibLimiter || new Limiter({ concurrency: this._options.concurrencyLimit || 10 });
    if (data.length < this._threshold) {
      callback(null, data, fin);
      return;
    }
    if (!this._deflate) {
      const windowBits = this._options.serverMaxWindowBits === true ? zlib.constants.Z_DEFAULT_WINDOWBITS : this._options.serverMaxWindowBits;
      this._deflate = zlib.createDeflateRaw({ windowBits, memLevel: this._options.memLevel || 8, level: this._options.level });
      this._deflate[kPerMessageDeflate] = this;
      this._deflate[kTotalLength] = 0;
      this._deflate[kBuffers] = [];
      this._deflate[kCallback] = null;
      this._deflate.on('data', deflateOnData);
    }
    this._deflate[kCallback] = callback;
    this._deflate.write(data);
    this._deflate.flush(zlib.constants.Z_SYNC_FLUSH, () => {
      if (!this._deflate) {
        return;
      }
      let data = Buffer.concat(this._deflate[kBuffers]);
      if (fin) {
        data = data.slice(0, data.length - 4);
      }
      this._deflate[kBuffers].length = 0;
      this._deflate[kCallback] = null;
      callback(null, data, fin);
    });
  }
}

function deflateOnData(chunk) {
  this[kPerMessageDeflate]._deflate[kBuffers].push(chunk);
  this[kPerMessageDeflate]._deflate[kTotalLength] += chunk.length;
}

function inflateOnData(chunk) {
  this[kPerMessageDeflate]._inflate[kBuffers].push(chunk);
  this[kPerMessageDeflate]._inflate[kTotalLength] += chunk.length;
}

function inflateOnError(err) {
  if (this[kPerMessageDeflate]) {
    this[kPerMessageDeflate]._inflate[kError] = err;
  }
}

module.exports = PerMessageDeflate;
