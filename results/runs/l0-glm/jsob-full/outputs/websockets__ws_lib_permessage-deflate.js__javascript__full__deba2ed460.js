'use strict';

var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (callback, module) => function () {
  var data = {};
  data.exports = {};
  (callback(__getOwnPropNames(callback)[0], data), data), data.exports;
};

var require_constants = __commonJS({'../work/websockets__ws/lib/constants.js'(exports, module) {
  'use strict';

  const BINARY_TYPES = ['nodebuffer', 'arraybuffer', 'fragments'];
  const hasBlob = typeof Blob !== 'undefined';

  module.exports = {
    BINARY_TYPES,
    CLOSE_TIMEOUT: 30000,
    EMPTY_BUFFER: Buffer.alloc(0),
    GUID: '258EAFA5-E914-47DA-95CA-C5AB0DC85B11',
    hasBlob,
    kForOnEventAttribute: Symbol('kForOnEventAttribute'),
    kListener: Symbol('kListener'),
    kStatusCode: Symbol('status-code'),
    kWebSocket: Symbol('websocket'),
    NOOP: () => {}
  };
}});

var require_buffer_util = __commonJS({'../work/websockets__ws/lib/buffer-util.js'(exports, module) {
  'use strict';

  const { EMPTY_BUFFER } = require_constants();
  const FastBuffer = Buffer[Symbol.species];

  function concat(list, totalLength) {
    if (list.length === 0) return EMPTY_BUFFER;
    if (list.length === 1) return list[0];

    const target = Buffer.allocUnsafe(totalLength);
    let offset = 0;

    for (let i = 0; i < list.length; i++) {
      const buf = list[i];
      target.set(buf, offset);
      offset += buf.length;
    }

    if (offset < totalLength) {
      return new FastBuffer(target.buffer, target.byteOffset, offset);
    }

    return target;
  }

  function _mask(source, mask, output, offset, length) {
    for (let i = 0; i < length; i++) {
      output[offset + i] = source[i] ^ mask[i & 3];
    }
  }

  function _unmask(buffer, mask) {
    for (let i = 0; i < buffer.length; i++) {
      buffer[i] ^= mask[i & 3];
    }
  }

  function toArrayBuffer(buf) {
    if (buf.byteLength === buf.buffer.byteLength) {
      return buf.buffer;
    }
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  }

  function toBuffer(data) {
    toBuffer.readOnly = true;

    if (Buffer.isBuffer(data)) return data;

    let buf;

    if (data instanceof ArrayBuffer) {
      buf = new FastBuffer(data);
    } else if (ArrayBuffer.isView(data)) {
      buf = new FastBuffer(data.buffer, data.byteOffset, data.byteLength);
    } else {
      buf = Buffer.from(data);
      toBuffer.readOnly = false;
    }

    return buf;
  }

  var obj = {};
  obj.concat = concat;
  obj.mask = _mask;
  obj.toArrayBuffer = toArrayBuffer;
  obj.toBuffer = toBuffer;
  obj.unmask = _unmask;
  module.exports = obj;

  if (!process.env.WS_NO_BUFFER_UTIL) {
    try {
      const bufferUtil = require('bufferutil');

      module.exports.concat = function (list, totalLength) {
        if (totalLength < list.length) {
          _mask(list, totalLength);
        } else {
          bufferUtil.concat(list, totalLength);
        }
      };

      module.exports.mask = function (source, mask, output, offset, length) {
        if (length < 48) {
          _mask(source, mask, output, offset, length);
        } else {
          bufferUtil.mask(source, mask, output, offset, length);
        }
      };

      module.exports.unmask = function (buffer, mask) {
        if (buffer.length < 32) {
          _unmask(buffer, mask);
        } else {
          bufferUtil.unmask(buffer, mask);
        }
      };
    } catch (e) {
      // Continue with JS fallback
    }
  }
}});

var require_limiter = __commonJS({'../work/websockets__ws/lib/limiter.js'(exports, module) {
  'use strict';

  const kDone = Symbol('kDone');
  const kRun = Symbol('kRun');

  class Limiter {
    constructor(concurrency) {
      this[kDone] = () => {
        this.pendingCount--;
        this[kRun]();
      };
      this.concurrency = concurrency || Infinity;
      this.queue = [];
      this.pendingCount = 0;
    }

    add(fn) {
      this.queue.push(fn);
      this[kRun]();
    }

    [kRun]() {
      if (this.pendingCount === this.concurrency) return;

      if (this.queue.length) {
        const fn = this.queue.shift();
        this.pendingCount++;
        fn(this[kDone]);
      }
    }
  }

  module.exports = Limiter;
}});

var zlib = require('zlib');
var bufferUtil = require_buffer_util();
var Limiter = require_limiter();
var { kStatusCode } = require_constants();
var FastBuffer = Buffer[Symbol.species];
var TRAILER = Buffer.from([0x00, 0x00, 0xff, 0xff]);
var kPerMessageDeflate = Symbol('permessage-deflate');
var kTotalLength = Symbol('kTotalLength');
var kCallback = Symbol('kCallback');
var kBuffers = Symbol('kBuffers');
var kError = Symbol('kError');
var zlibLimiter;

class PerMessageDeflate {
  constructor(options) {
    this._options = options || {};
    this._threshold = this._options.threshold !== undefined ? this._options.threshold : 1024;
    this._isServer = this._options.serverNoContextTakeover !== undefined ? this._options.serverNoContextTakeover : false;
    this._deflate = null;
    this._inflate = null;
    this.params = null;

    if (!zlibLimiter) {
      const concurrency = this._options.concurrencyLimit !== undefined ? this._options.concurrencyLimit : 10;
      zlibLimiter = new Limiter(concurrency);
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
    } else if (this._params && this._params.client_max_window_bits === null) {
      params.client_max_window_bits = true;
    }

    return params;
  }

  accept(configurations) {
    config = this._normalizeParams(configurations);
    this.params = this._accept(config);
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
      callback && callback(new Error('The deflate stream was closed while data was being processed'));
    }
  }

  _accept(configurations) {
    const opts = this._options || {};
    const accepted = configurations.find((params) => {
      if ((opts.serverNoContextTakeover === false && params.server_no_context_takeover) || params.client_no_context_takeover && (opts.clientNoContextTakeover === false || typeof opts.clientNoContextTakeover === 'undefined' && params.client_no_context_takeover === true) || typeof opts.serverMaxWindowBits === 'number' && params.server_max_window_bits && opts.serverMaxWindowBits > params.server_max_window_bits || typeof opts.clientMaxWindowBits === 'number' && !params.client_max_window_bits) {
        return false;
      }
      return true;
    });

    if (!accepted) throw new Error('None of the extension offers can be accepted');

    if (opts.serverNoContextTakeover) {
      accepted.server_no_context_takeover = true;
    }
    if (opts.clientNoContextTakeover) {
      accepted.client_no_context_takeover = true;
    }
    if (typeof opts.serverMaxWindowBits === 'number') {
      accepted.server_max_window_bits = opts.serverMaxWindowBits;
    }
    if (typeof opts.clientMaxWindowBits === 'number') {
      accepted.client_max_window_bits = opts.clientMaxWindowBits;
    } else if (accepted.client_max_window_bits === true || accepted.client_max_window_bits === false) {
      delete accepted.client_max_window_bits;
    }

    return accepted;
  }

  _normalizeParams(configurations) {
    configurations.forEach((params) => {
      Object.keys(params).forEach((key) => {
        let value = params[key];
        if (value.length > 1) {
          throw new Error(`Parameter "${key}" must have only a single value`);
        }

        value = value[0];

        if (key === 'server_max_window_bits') {
          const num = +value;
          if (!Number.isInteger(num) || num < 8 || num > 15) {
            throw new TypeError(`Invalid value for parameter "${key}": ${value}`);
          }
          value = num;
        } else if (key === 'client_max_window_bits') {
          const num = +value;
          if (!Number.isInteger(num) || num < 8 || num > 15) {
            throw new TypeError(`Invalid value for parameter "${key}": ${value}`);
          }
          value = num;
        } else if (key === 'server_no_context_takeover' || key === 'client_no_context_takeover') {
          if (value !== true) {
            throw new TypeError(`Invalid value for parameter "${key}": ${value}`);
          }
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
      this._decompress(data, fin, (err, result) => {
        done();
        callback(err, result);
      });
    });
  }

  _decompress(data, fin, callback) {
    const endpoint = this._isServer ? 'client' : 'server';

    if (!this._inflate) {
      const key = endpoint + '_max_window_bits';
      const windowBits = typeof this._options[key] === 'number' ? zlib.Z_DEFAULT_WINDOWBITS : this._options[key];
      this._inflate = zlib.createInflateRaw({ ...this._options.zlibInflateOptions, windowBits });
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
      const err = this._inflate[kError];

      if (err) {
        this._inflate.close();
        this._inflate = null;
        callback(err);
        return;
      }

      const data = bufferUtil.concat(this._inflate[kBuffers], this._inflate[kTotalLength]);

      if (this._inflate._readableState.endEmitted) {
        this._inflate.close();
        this._inflate = null;
      } else {
        this._inflate[kTotalLength] = 0;
        this._inflate[kBuffers] = [];

        if (fin && this.params[endpoint + '_no_context_takeover']) {
          this._inflate.reset();
        }
      }

      callback(null, data);
    });
  }

  compress(data, fin, callback) {
    const endpoint = this._isServer ? 'server' : 'client';

    if (!this._deflate) {
      const key = endpoint + '_max_window_bits';
      const windowBits = typeof this._options[key] === 'number' ? zlib.Z_DEFAULT_WINDOWBITS : this._options[key];
      this._deflate = zlib.createDeflateRaw({ ...this._options.zlibDeflateOptions, windowBits });
      this._deflate[kTotalLength] = 0;
      this._deflate[kBuffers] = [];
      this._deflate.on('data', deflateOnData);
    }

    this._deflate[kCallback] = callback;
    this._deflate.write(data);
    this._deflate.flush(zlib.Z_SYNC_FLUSH, () => {
      if (!this._deflate) return;

      let data = bufferUtil.concat(this._deflate[kBuffers], this._deflate[kTotalLength]);

      if (fin) {
        data = new FastBuffer(data.buffer, data.byteOffset, data.length - 4);
      }

      this._deflate[kCallback] = null;
      this._deflate[kTotalLength] = 0;
      this._deflate[kBuffers] = [];

      if (fin && this.params[endpoint + '_no_context_takeover']) {
        this._deflate.reset();
      }

      callback(null, data);
    });
  }
}

module.exports = PerMessageDeflate;

function deflateOnData(chunk) {
  this[kBuffers].push(chunk);
  this[kTotalLength] += chunk.length;
}

function inflateOnData(chunk) {
  if (this[kPerMessageDeflate]._maxPayload < 1 || this[kTotalLength] <= this[kPerMessageDeflate]._maxPayload) {
    this[kBuffers].push(chunk);
    this[kTotalLength] += chunk.length;
    return;
  }

  this[kError] = new RangeError('Max payload size exceeded');
  this[kError][kStatusCode] = 1009;
  this.removeListener('data', inflateOnData);
  this[kError].code = 'WS_ERR_UNSUPPORTED_MESSAGE_PAYLOAD';
  this[kPerMessageDeflate].cleanup();
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
