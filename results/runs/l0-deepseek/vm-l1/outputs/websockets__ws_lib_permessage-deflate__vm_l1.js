'use strict';

const zlib = require('zlib');
const bufferUtil = require('../work/websockets__ws/lib/buffer-util.js');
const Limiter = require('../work/websockets__ws/lib/limiter.js');
const { kStatusCode } = require('../work/websockets__ws/lib/constants.js');

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
    this._maxPayload = this._options.maxPayload || 0;
    this._threshold = this._options.threshold || 1024;
    this._serverNoContextTakeover = !!this._options.serverNoContextTakeover;
    this._clientNoContextTakeover = !!this._options.clientNoContextTakeover;
    this._serverMaxWindowBits = this._options.serverMaxWindowBits;
    this._clientMaxWindowBits = this._options.clientMaxWindowBits;
    this._concurrencyLimit = this._options.concurrencyLimit;
    this._isServer = !!this._options.isServer;
    this._deflate = null;
    this._inflate = null;
    this._zlibLimiter = zlibLimiter;
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
    }
    return params;
  }

  acceptAsClient(extension) {
    const params = extension.params;
    if (this._options.serverNoContextTakeover) {
      if (params.server_no_context_takeover) {
        throw new Error('server_no_context_takeover is not supported');
      }
    }
    if (this._options.clientNoContextTakeover) {
      if (params.client_no_context_takeover) {
        throw new Error('client_no_context_takeover is not supported');
      }
    }
    if (this._options.serverMaxWindowBits) {
      if (params.server_max_window_bits) {
        throw new Error('server_max_window_bits is not supported');
      }
    }
    if (this._options.clientMaxWindowBits) {
      if (params.client_max_window_bits) {
        throw new Error('client_max_window_bits is not supported');
      }
    }
    this._isServer = false;
  }

  acceptAsServer(extension) {
    const params = extension.params;
    if (this._options.serverNoContextTakeover) {
      if (params.server_no_context_takeover) {
        throw new Error('server_no_context_takeover is not supported');
      }
    }
    if (this._options.clientNoContextTakeover) {
      if (params.client_no_context_takeover) {
        throw new Error('client_no_context_takeover is not supported');
      }
    }
    if (this._options.serverMaxWindowBits) {
      if (params.server_max_window_bits) {
        throw new Error('server_max_window_bits is not supported');
      }
    }
    if (this._options.clientMaxWindowBits) {
      if (params.client_max_window_bits) {
        throw new Error('client_max_window_bits is not supported');
      }
    }
    this._isServer = true;
  }

  normalizeParams() {
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
    }
    return params;
  }

  decompress(data, fin, callback) {
    if (this._inflate === null) {
      this._inflate = zlib.createInflateRaw({
        windowBits: this._isServer ? this._clientMaxWindowBits : this._serverMaxWindowBits
      });
      this._inflate[kTotalLength] = 0;
      this._inflate[kBuffers] = [];
      this._inflate[kCallback] = null;
      this._inflate[kError] = null;
      this._inflate.on('data', (chunk) => {
        this._inflate[kTotalLength] += chunk.length;
        this._inflate[kBuffers].push(chunk);
        if (this._maxPayload > 0 && this._inflate[kTotalLength] > this._maxPayload) {
          this._inflate[kError] = new RangeError('Max payload size exceeded');
          this._inflate[kError].statusCode = kStatusCode.PAYLOAD_TOO_LARGE;
          this._inflate[kBuffers] = [];
          this._inflate.reset();
        }
      });
      this._inflate.on('error', (err) => {
        this._inflate[kError] = err;
        this._inflate[kBuffers] = [];
        this._inflate.reset();
      });
    }

    this._inflate[kCallback] = callback;
    this._inflate[kBuffers] = [];
    this._inflate[kTotalLength] = 0;
    this._inflate.write(data);
    if (fin) {
      this._inflate.end();
    }

    if (this._inflate[kError]) {
      const err = this._inflate[kError];
      this._inflate[kError] = null;
      this._inflate[kCallback] = null;
      callback(err);
      return;
    }

    if (fin && this._inflate[kBuffers].length > 0) {
      const chunks = this._inflate[kBuffers];
      this._inflate[kBuffers] = [];
      this._inflate[kCallback] = null;
      callback(null, Buffer.concat(chunks, this._inflate[kTotalLength]));
    }
  }

  compress(data, fin, callback) {
    if (this._deflate === null) {
      this._deflate = zlib.createDeflateRaw({
        windowBits: this._isServer ? this._serverMaxWindowBits : this._clientMaxWindowBits
      });
      this._deflate[kTotalLength] = 0;
      this._deflate[kBuffers] = [];
      this._deflate[kCallback] = null;
      this._deflate[kError] = null;
      this._deflate.on('data', (chunk) => {
        this._deflate[kTotalLength] += chunk.length;
        this._deflate[kBuffers].push(chunk);
      });
      this._deflate.on('error', (err) => {
        this._deflate[kError] = err;
        this._deflate[kBuffers] = [];
        this._deflate.reset();
      });
    }

    this._deflate[kCallback] = callback;
    this._deflate[kBuffers] = [];
    this._deflate[kTotalLength] = 0;
    this._deflate.write(data);
    if (fin) {
      this._deflate.end();
    }

    if (this._deflate[kError]) {
      const err = this._deflate[kError];
      this._deflate[kError] = null;
      this._deflate[kCallback] = null;
      callback(err);
      return;
    }

    if (fin && this._deflate[kBuffers].length > 0) {
      const chunks = this._deflate[kBuffers];
      this._deflate[kBuffers] = [];
      this._deflate[kCallback] = null;
      callback(null, Buffer.concat(chunks, this._deflate[kTotalLength]));
    }
  }

  _compress(data, fin, callback) {
    if (this._zlibLimiter) {
      this._zlibLimiter.add((done) => {
        this.compress(data, fin, (err, result) => {
          done();
          callback(err, result);
        });
      });
    } else {
      this.compress(data, fin, callback);
    }
  }
}

function deflateOnData(data) {
  if (!this._deflate) {
    this._deflate = zlib.createDeflateRaw({
      windowBits: this._isServer ? this._serverMaxWindowBits : this._clientMaxWindowBits
    });
    this._deflate[kTotalLength] = 0;
    this._deflate[kBuffers] = [];
    this._deflate[kCallback] = null;
    this._deflate[kError] = null;
    this._deflate.on('data', (chunk) => {
      this._deflate[kTotalLength] += chunk.length;
      this._deflate[kBuffers].push(chunk);
    });
    this._deflate.on('error', (err) => {
      this._deflate[kError] = err;
      this._deflate[kBuffers] = [];
      this._deflate.reset();
    });
  }

  this._deflate.write(data);
}

function inflateOnData(data) {
  if (!this._inflate) {
    this._inflate = zlib.createInflateRaw({
      windowBits: this._isServer ? this._clientMaxWindowBits : this._serverMaxWindowBits
    });
    this._inflate[kTotalLength] = 0;
    this._inflate[kBuffers] = [];
    this._inflate[kCallback] = null;
    this._inflate[kError] = null;
    this._inflate.on('data', (chunk) => {
      this._inflate[kTotalLength] += chunk.length;
      this._inflate[kBuffers].push(chunk);
      if (this._maxPayload > 0 && this._inflate[kTotalLength] > this._maxPayload) {
        this._inflate[kError] = new RangeError('Max payload size exceeded');
        this._inflate[kError].statusCode = kStatusCode.PAYLOAD_TOO_LARGE;
        this._inflate[kBuffers] = [];
        this._inflate.reset();
      }
    });
    this._inflate.on('error', (err) => {
      this._inflate[kError] = err;
      this._inflate[kBuffers] = [];
      this._inflate.reset();
    });
  }

  this._inflate.write(data);
}

function inflateOnError(err) {
  if (this._inflate) {
    this._inflate[kError] = err;
    this._inflate[kBuffers] = [];
    this._inflate.reset();
  }
}

module.exports = PerMessageDeflate;
