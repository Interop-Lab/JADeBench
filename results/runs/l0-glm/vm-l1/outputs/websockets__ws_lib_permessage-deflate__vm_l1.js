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
  constructor(options, isServer, maxPayload) {
    this._maxPayload = maxPayload | 0;
    this._options = options || {};
    this._threshold = this._options.threshold !== undefined ? this._options.threshold : 1024;
    this._isServer = !!isServer;
    this._deflate = null;
    this._inflate = null;
    this.params = null;

    if (!this._options.serverNoContextTakeover) {
      this._options.serverNoContextTakeover = true;
    }
    if (!this._options.clientNoContextTakeover) {
      this._options.clientNoContextTakeover = true;
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
    }

    return params;
  }

  accept(params) {
    this.params = this._normalizeParams(params);
    this._inflate = null;
    this._deflate = null;
  }

  cleanup() {
    if (this._inflate) {
      this._inflate.close();
      this._inflate = null;
    }
    if (this._deflate) {
      this._deflate.close();
      this._deflate = null;
    }
  }

  _normalizeParams(params) {
    params = Object.assign({}, params);

    if (
      Object.keys(params).length !== 0 &&
      (Object.keys(params).length !== 4 ||
        !params.server_no_context_takeover ||
        !params.client_no_context_takeover ||
        !params.server_max_window_bits ||
        !params.client_max_window_bits)
    ) {
      throw new TypeError('Invalid parameter for "permessage-deflate"');
    }

    if (typeof params.server_max_window_bits !== 'number') {
      params.server_max_window_bits = this._options.serverMaxWindowBits;
    }
    if (typeof params.client_max_window_bits !== 'number') {
      params.client_max_window_bits = this._options.clientMaxWindowBits;
    }

    return params;
  }

  acceptAsServer(params) {
    this.params = this._normalizeParams(params);

    if (this._options.serverNoContextTakeover !== false) {
      this.params.server_no_context_takeover = true;
    }
    if (this._options.clientNoContextTakeover !== false) {
      this.params.client_no_context_takeover = true;
    }
  }

  acceptAsClient(params) {
    this.params = this._normalizeParams(params);
  }

  _createInflate() {
    const inflate = zlib.createInflateRaw({
      ...this._options.zlibInflateOptions,
      windowBits: this.params.client_max_window_bits
    });

    inflate[kPerMessageDeflate] = this;
    inflate[kTotalLength] = 0;
    inflate[kBuffers] = [];
    inflate[kCallback] = null;

    inflate.on('error', inflateOnError);
    inflate.on('data', inflateOnData);

    return inflate;
  }

  _createDeflate() {
    const deflate = zlib.createDeflateRaw({
      ...this._options.zlibDeflateOptions,
      windowBits: this.params.server_max_window_bits
    });

    deflate[kPerMessageDeflate] = this;
    deflate[kTotalLength] = 0;
    deflate[kBuffers] = [];
    deflate[kCallback] = null;

    deflate.on('error', () => {});
    deflate.on('data', deflateOnData);

    return deflate;
  }

  decompress(data, fin, callback) {
    zlibLimiter.add((done) => {
      this._decompress(data, fin, (err, result) => {
        done();
        callback(err, result);
      });
    });
  }

  _decompress(data, fin, callback) {
    const inflate = this._inflate;

    if (inflate === null) {
      this._inflate = inflate = this._createInflate();
    }

    inflate[kCallback] = callback;
    inflate[kBuffers].push(data);
    inflate[kTotalLength] += data.length;

    if (fin) {
      inflate[kBuffers].push(TRAILER);
      inflate[kTotalLength] += TRAILER.length;
    }

    inflate.write(data);
    if (fin) {
      inflate.write(TRAILER);
      inflate.flush(zlib.constants.Z_SYNC_FLUSH, () => {
        this._inflate = null;
      });
    }
  }

  compress(data, fin, callback) {
    zlibLimiter.add((done) => {
      this._compress(data, fin, (err, result) => {
        done();
        callback(err, result);
      });
    });
  }

  _compress(data, fin, callback) {
    const deflate = this._deflate;

    if (deflate === null) {
      this._deflate = deflate = this._createDeflate();
    }

    deflate[kCallback] = callback;
    deflate[kBuffers].push(data);
    deflate[kTotalLength] += data.length;

    deflate.write(data);
    if (fin) {
      deflate.flush(zlib.constants.Z_SYNC_FLUSH, () => {
        const buffers = deflate[kBuffers];
        const totalLength = deflate[kTotalLength];

        let result;
        if (totalLength > this._threshold) {
          result = bufferUtil.concat(buffers, totalLength);
        } else {
          result = data;
        }

        this._deflate = null;
        deflate[kCallback](null, result);
      });
    }
  }
}

function deflateOnData(chunk) {
  const deflate = this;
  const perMessageDeflate = deflate[kPerMessageDeflate];

  if (deflate[kCallback] === null) {
    perMessageDeflate._deflate = null;
    return;
  }

  deflate[kBuffers].push(chunk);
  deflate[kTotalLength] += chunk.length;
}

function inflateOnData(chunk) {
  const inflate = this;
  const perMessageDeflate = inflate[kPerMessageDeflate];

  if (inflate[kCallback] === null) {
    perMessageDeflate._inflate = null;
    return;
  }

  inflate[kBuffers].push(chunk);
  inflate[kTotalLength] += chunk.length;

  if (inflate[kTotalLength] > perMessageDeflate._maxPayload) {
    const err = new RangeError('Max payload size exceeded');
    err[kStatusCode] = 1009;
    inflate[kError] = err;
    inflate[kCallback](err);
    inflate[kCallback] = null;
    return;
  }

  if (inflate[kTotalLength] > perMessageDeflate._maxPayload * 0.25) {
    inflate.flush(zlib.constants.Z_SYNC_FLUSH);
  }
}

function inflateOnError(err) {
  const inflate = this;
  const perMessageDeflate = inflate[kPerMessageDeflate];

  if (inflate[kError] !== undefined) {
    return;
  }

  if (inflate[kCallback] === null) {
    perMessageDeflate._inflate = null;
    return;
  }

  inflate[kError] = err;
  inflate[kCallback](err);
  inflate[kCallback] = null;
}

zlibLimiter = new Limiter(1);

module.exports = PerMessageDeflate;
