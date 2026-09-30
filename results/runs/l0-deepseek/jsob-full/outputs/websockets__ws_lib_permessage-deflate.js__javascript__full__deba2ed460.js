'use strict';

const __getOwnPropNames = Object.getOwnPropertyNames;
const __commonJS = (src, mod) => function require() {
  const module = { exports: {} };
  (mod || src[__getOwnPropNames(src)[0]])((mod = module).exports, mod);
  return mod.exports;
};

const require_constants = __commonJS({
  '../work/websockets__ws/lib/constants.js'(exports, module) {
    'use strict';

    const hasBlob = typeof Blob !== 'undefined';

    const BINARY_TYPES = ['nodebuffer', 'arraybuffer', 'fragments'];
    if (hasBlob) BINARY_TYPES.push('blob');

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
  }
});

function _0x4a423e(_0xa84260, _0x51806e) {
  return _0x7450(_0xa84260 - -0x24d, _0x51806e);
}

const require_buffer_util = __commonJS({
  '../work/websockets__ws/lib/buffer-util.js'(exports, module) {
    'use strict';

    const { EMPTY_BUFFER } = require_constants;
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

    function mask(source, mask, output, offset, length) {
      for (let i = 0; i < length; i++) {
        output[offset + i] = source[i] ^ mask[i & 3];
      }
    }

    function unmask(buffer, mask) {
      for (let i = 0; i < buffer.length; i++) {
        buffer[i] ^= mask[i & 3];
      }
    }

    function toArrayBuffer(buf) {
      if (buf.length === buf.buffer.byteLength) return buf.buffer;
      return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length);
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

    const bufferUtil = {};
    bufferUtil.concat = concat;
    bufferUtil.mask = mask;
    bufferUtil.toArrayBuffer = toArrayBuffer;
    bufferUtil.toBuffer = toBuffer;
    bufferUtil.unmask = unmask;

    module.exports = bufferUtil;

    if (!process.env.WS_NO_BUFFER_UTIL) {
      try {
        const bufferUtilNative = require('bufferutil');

        module.exports.mask = function (source, mask, output, offset, length) {
          if (length < 48) mask(source, mask, output, offset, length);
          else bufferUtilNative.mask(source, mask, output, offset, length);
        };

        module.exports.unmask = function (buffer, mask) {
          if (buffer.length < 48) unmask(buffer, mask);
          else bufferUtilNative.unmask(buffer, mask);
        };
      } catch (e) {}
    }
  }
});

const require_limiter = __commonJS({
  '../work/websockets__ws/lib/limiter.js'(exports, module) {
    'use strict';

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
        if (this.pending === this.concurrency) return;

        if (this.jobs.length) {
          const job = this.jobs.shift();
          this.pending++;
          job(this[kDone]);
        }
      }
    }

    module.exports = Limiter;
  }
});

const zlib = require('zlib');
const bufferUtil = require_buffer_util();
const Limiter = require_limiter();
const { kStatusCode } = require_constants();
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
    this._maxPayload = this._options.maxPayload || 100 * 1024 * 1024;
    this._isServer = !!this._options.isServer;
    this._deflate = null;
    this._inflate = null;

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

  accept(extension) {
    extension = this.normalizeParams(extension);

    this._deflate = this._isServer
      ? this.acceptAsServer(extension)
      : this.acceptAsClient(extension);

    return this._deflate;
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

  normalizeParams(params) {
    const first = params[0];

    if (this._options.serverNoContextTakeover && first.server_no_context_takeover) {
      throw new Error('Received duplicate server_no_context_takeover parameter');
    }

    if (!first.server_no_context_takeover) {
      if (typeof this._options.serverNoContextTakeover === 'boolean') {
        first.server_no_context_takeover = this._options.serverNoContextTakeover;
      }
    } else {
      if (this._options.serverNoContextTakeover !== true ||
          typeof this._options.serverNoContextTakeover === 'boolean' &&
          first.server_no_context_takeover !== this._options.serverNoContextTakeover) {
        throw new Error('Mismatched server_no_context_takeover parameter');
      }
    }

    return first;
  }

  acceptAsServer(offers) {
    return offers.find((params) => {
      if (this._options.serverNoContextTakeover && params.server_no_context_takeover ||
          params.server_max_window_bits &&
          (this._options.serverMaxWindowBits === false ||
           typeof this._options.serverMaxWindowBits === 'number' &&
           params.server_max_window_bits !== this._options.serverMaxWindowBits) ||
          typeof this._options.clientMaxWindowBits === 'boolean' &&
          !params.client_max_window_bits) {
        return false;
      }

      return true;
    });
  }

  acceptAsClient(response) {
    const params = response[0];

    if (this._options.clientNoContextTakeover && params.client_no_context_takeover) {
      throw new Error('Received duplicate client_no_context_takeover parameter');
    }

    if (!params.client_no_context_takeover) {
      if (typeof this._options.clientNoContextTakeover === 'boolean') {
        params.client_no_context_takeover = this._options.clientNoContextTakeover;
      }
    } else {
      if (this._options.clientNoContextTakeover !== true ||
          typeof this._options.clientNoContextTakeover === 'boolean' &&
          params.client_no_context_takeover !== this._options.clientNoContextTakeover) {
        throw new Error('Mismatched client_no_context_takeover parameter');
      }
    }

    return params;
  }

  compress(data, fin, callback) {
    zlibLimiter.add((done) => {
      this._compress(data, fin, (err, result) => {
        done();
        callback(err, result);
      });
    });
  }

  decompress(data, fin, callback) {
    zlibLimiter.add((done) => {
      this._decompress(data, fin, (err, result) => {
        done();
        callback(err, result);
      });
    });
  }

  _compress(data, fin, callback) {
    const method = this._isServer ? 'deflateRawSync' : 'deflateSync';

    if (!this._deflate) {
      const key = method + 'WindowBits';
      const windowBits = typeof this._options[key] === 'number'
        ? zlib[method + 'WindowBits']
        : this._options[key];

      this._deflate = zlib.createDeflateRaw({
        ...this._options.deflateOptions,
        windowBits
      });

      this._deflate[kPerMessageDeflate] = this;
      this._deflate[kTotalLength] = 0;
      this._deflate[kBuffers] = [];
      this._deflate.on('data', deflateOnData);
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

      const data = bufferUtil.concat(
        this._deflate[kBuffers],
        this._deflate[kTotalLength]
      );

      if (this._deflate._writableState.finished) {
        this._deflate.close();
        this._deflate = null;
      } else {
        this._deflate[kTotalLength] = 0;
        this._deflate[kBuffers] = [];

        if (fin && this._deflate[method + 'WindowBits']) {
          this._deflate.reset();
        }
      }

      callback(null, data);
    });
  }

  _decompress(data, fin, callback) {
    const method = this._isServer ? 'inflateRawSync' : 'inflateSync';

    if (!this._inflate) {
      const key = method + 'WindowBits';
      const windowBits = typeof this._options[key] === 'number'
        ? zlib[method + 'WindowBits']
        : this._options[key];

      this._inflate = zlib.createInflateRaw({
        ...this._options.inflateOptions,
        windowBits
      });

      this._inflate[kTotalLength] = 0;
      this._inflate[kBuffers] = [];
      this._inflate.on('error', inflateOnError);
    }

    this._inflate[kCallback] = callback;
    this._inflate.write(data);
    this._inflate.flush(() => {
      if (!this._inflate) return;

      const data = bufferUtil.concat(
        this._inflate[kBuffers],
        this._inflate[kTotalLength]
      );

      if (fin) {
        data = new FastBuffer(data.buffer, data.byteOffset, data.length - 4);
      }

      this._inflate[kCallback] = null;
      this._inflate[kTotalLength] = 0;
      this._inflate[kBuffers] = [];

      if (fin && this._inflate[method + 'WindowBits']) {
        this._inflate.reset();
      }

      callback(null, data);
    });
  }
}

module.exports = PerMessageDeflate;

function deflateOnData(data) {
  this[kBuffers].push(data);
  this[kTotalLength] += data.length;
}

function inflateOnData(data) {
  this[kTotalLength] += data.length;

  if (
    this[kPerMessageDeflate]._maxPayload < 1 ||
    this[kTotalLength] > this[kPerMessageDeflate]._maxPayload
  ) {
    this[kBuffers].push(data);
    return;
  }

  this[kError] = new RangeError('Max payload size exceeded');
  this[kError][kStatusCode] = 1009;
  this.removeListener('data', inflateOnData);
  this.reset();
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
