'use strict';

var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

var require_constants = __commonJS({ '../work/websockets__ws/lib/constants.js'(exports, module) {
  'use strict';
  const BINARY_TYPES = ['nodebuffer', 'arraybuffer', 'fragments'];
  const hasBlob = typeof Blob !== 'undefined';
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
} });

var require_buffer_util = __commonJS({ '../work/websockets__ws/lib/buffer-util.js'(exports, module) {
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
    if (offset < totalLength) return new FastBuffer(target.buffer, target.byteOffset, offset);
    return target;
  }

  function _mask(source, mask, output, offset, length) {
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
    toBuffer.readOnly = false;
    if (Buffer.isBuffer(data)) return data;
    let buf;
    if (data instanceof ArrayBuffer) buf = new FastBuffer(data);
    else if (ArrayBuffer.isView(data)) buf = new FastBuffer(data.buffer, data.byteOffset, data.byteLength);
    else {
      buf = Buffer.from(data);
      toBuffer.readOnly = true;
    }
    return buf;
  }

  const bufferUtil = {
    concat,
    mask: _mask,
    toArrayBuffer,
    toBuffer,
    unmask
  };

  module.exports = bufferUtil;

  if (!process.env.WS_NO_BUFFER_UTIL) {
    try {
      const bufferUtil = require('bufferutil');
      module.exports.mask = function(source, mask, output, offset, length) {
        if (length < 48) _mask(source, mask, output, offset, length);
        else bufferUtil.mask(source, mask, output, offset, length);
      };
      module.exports.unmask = function(buffer, mask) {
        if (buffer.length < 32) unmask(buffer, mask);
        else bufferUtil.unmask(buffer, mask);
      };
    } catch (e) {}
  }
} });

var require_limiter = __commonJS({ '../work/websockets__ws/lib/limiter.js'(exports, module) {
  'use strict';
  const kDone = Symbol('kDone');
  const kRun = Symbol('kRun');
  const Limiter = class {
    constructor(concurrency) {
      this[kDone] = () => {
        this.pending--;
        this[kRun]();
      };
      this.concurrency = concurrency || Infinity;
      this.queue = [];
      this.pending = 0;
    }
    add(fn) {
      this.queue.push(fn);
      this[kRun]();
    }
    [kRun]() {
      if (this.pending === this.concurrency) return;
      if (this.queue.length) {
        const fn = this.queue.shift();
        this.pending++;
        fn(this[kDone]);
      }
    }
  };
  module.exports = Limiter;
} });

var require_permessage_deflate = __commonJS({ '../work/websockets__ws/lib/permessage-deflate.js'(exports, module) {
  'use strict';
  const zlib = require('zlib');
  const bufferUtil = require_buffer_util();
  const Limiter = require_limiter();
  const { kStatusCode } = require_constants;
  const FastBuffer = Buffer[Symbol.species];
  const TRAILER = Buffer.from([0x00, 0x00, 0xff, 0xff]);
  const kPerMessageDeflate = Symbol('permessage-deflate');
  const kTotalLength = Symbol('total-length');
  const kCallback = Symbol('callback');
  const kBuffers = Symbol('buffers');
  const kError = Symbol('error');
  let zlibLimiter;

  const PerMessageDeflate = class {
    constructor(options, isServer, maxPayload) {
      this._options = options || {};
      this._isServer = !!isServer;
      this._inflate = null;
      this._deflate = null;
      this.params = null;
      if (!zlibLimiter) {
        const concurrency = this._options.concurrencyLimit !== undefined ? this._options.concurrencyLimit : 10;
        zlibLimiter = new Limiter(concurrency);
      }
    }

    static get extensionName() {
      return 'permessage-deflate';
    }

    init() {
      const opts = {};
      if (this._options.serverNoContextTakeover) opts.server_no_context_takeover = true;
      if (this._options.clientNoContextTakeover) opts.client_no_context_takeover = true;
      if (this._options.serverMaxWindowBits) opts.server_max_window_bits = this._options.serverMaxWindowBits;
      if (this._options.clientMaxWindowBits) opts.client_max_window_bits = this._options.clientMaxWindowBits;
      else opts.client_max_window_bits = true;
      if (this._options.zlibDeflateOptions) {
        Object.assign(opts, this._options.zlibDeflateOptions);
      }
      this.params = opts;
    }

    accept(params) {
      params = this._normalizeParams(params);
      if (this._isServer) this.params = this._acceptParams(params);
      else this.params = params;
      return this.params;
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
      const keys = Object.keys(params);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (params[key].length > 1) throw new Error(`Duplicate parameter "${key}"`);
        params[key] = params[key][0];
        if (key === 'client_max_window_bits') {
          if (params[key] === true) {
            params[key] = this._options.clientMaxWindowBits || 15;
          } else if (!this._isServer && params[key] === false) {
            params[key] = 15;
          } else if (typeof params[key] !== 'number' || params[key] < 8 || params[key] > 15) {
            throw new TypeError(`Invalid value for parameter "${key}": ${params[key]}`);
          }
        } else if (key === 'server_max_window_bits') {
          if (!this._isServer) {
            if (typeof params[key] === 'undefined') {
              params[key] = this._options.serverMaxWindowBits || 15;
            } else if (typeof params[key] !== 'number' || params[key] < 8 || params[key] > 15) {
              throw new TypeError(`Invalid value for parameter "${key}": ${params[key]}`);
            }
          }
        } else if (key === 'client_no_context_takeover' || key === 'server_no_context_takeover') {
          if (params[key] !== true) throw new TypeError(`Invalid value for parameter "${key}": ${params[key]}`);
        } else {
          throw new Error(`Unknown parameter "${key}"`);
        }
      }
      return params;
    }

    _acceptParams(params) {
      const opts = {};
      if (params.server_no_context_takeover !== undefined) opts.server_no_context_takeover = true;
      if (params.client_no_context_takeover !== undefined) opts.client_no_context_takeover = true;
      if (params.server_max_window_bits !== undefined) opts.server_max_window_bits = params.server_max_window_bits;
      if (params.client_max_window_bits !== undefined) opts.client_max_window_bits = params.client_max_window_bits;
      return opts;
    }

    _decompress(data, fin, callback) {
      const endpoint = this._isServer ? 'client' : 'server';
      if (!this._inflate) {
        const key = `${endpoint}_max_window_bits`;
        const windowBits = typeof this.params[key] !== 'undefined' ? this.params[key] : zlib.Z_DEFAULT_WINDOWBITS;
        this._inflate = zlib.createInflateRaw({ ...this._options.zlibInflateOptions, windowBits });
        this._inflate[kPerMessageDeflate] = this;
        this._inflate[kTotalLength] = 0;
        this._inflate[kBuffers] = [];
        this._inflate.on('error', onError);
        this._inflate.on('data', onData);
      }
      this._inflate[kCallback] = callback;
      this._inflate.write(data);
      if (fin) this._inflate.write(TRAILER);
      this._inflate.flush(zlib.constants.Z_SYNC_FLUSH, () => {
        const err = this._inflate[kError];
        if (err) {
          this._inflate.close();
          this._inflate = null;
          callback(err);
          return;
        }
        const data = bufferUtil.concat(this._inflate[kBuffers], this._inflate[kTotalLength]);
        if (this._inflate[kPerMessageDeflate]._isServer && this._inflate[kPerMessageDeflate].params[`${endpoint}_no_context_takeover`]) {
          this._inflate.close();
          this._inflate = null;
        } else {
          this._inflate[kTotalLength] = 0;
          this._inflate[kBuffers] = [];
        }
        callback(null, data);
      });
    }

    _compress(data, fin, callback) {
      const endpoint = this._isServer ? 'server' : 'client';
      if (!this._deflate) {
        const key = `${endpoint}_max_window_bits`;
        const windowBits = typeof this.params[key] !== 'undefined' ? this.params[key] : zlib.Z_DEFAULT_WINDOWBITS;
        this._deflate = zlib.createDeflateRaw({ ...this._options.zlibDeflateOptions, windowBits });
        this._deflate[kTotalLength] = 0;
        this._deflate[kBuffers] = [];
        this._deflate.on('error', onError);
        this._deflate.on('data', onData);
      }
      this._deflate[kCallback] = callback;
      this._deflate.write(data);
      this._deflate.flush(zlib.constants.Z_SYNC_FLUSH, () => {
        if (!this._deflate) return;
        let data = bufferUtil.concat(this._deflate[kBuffers], this._deflate[kTotalLength]);
        if (fin) data = new FastBuffer(data.buffer, data.byteOffset, data.length - 4);
        if (this._deflate[kPerMessageDeflate] && this._deflate[kPerMessageDeflate].params[`${endpoint}_no_context_takeover`]) {
          this._deflate.close();
          this._deflate = null;
        } else {
          this._deflate[kTotalLength] = 0;
          this._deflate[kBuffers] = [];
        }
        callback(null, data);
      });
    }
  };

  module.exports = PerMessageDeflate;

  function onError(err) {
    this[kError] = err;
    this[kPerMessageDeflate]._inflate = null;
    if (this[kCallback]) {
      this[kCallback](err);
      this[kCallback] = null;
    }
  }

  function onData(data) {
    this[kTotalLength] += data.length;
    if (this[kPerMessageDeflate]._maxPayload && this[kTotalLength] > this[kPerMessageDeflate]._maxPayload) {
      if (this[kPerMessageDeflate]._inflate) {
        this[kPerMessageDeflate]._inflate[kError] = new RangeError('Max payload size exceeded');
        this[kPerMessageDeflate]._inflate.close();
        this[kPerMessageDeflate]._inflate = null;
      }
      this[kError] = new RangeError('Max payload size exceeded');
      this[kPerMessageDeflate]._deflate = null;
      this[kPerMessageDeflate]._inflate = null;
      this.removeListener('data', onData);
      this[kBuffers] = [];
      this[kTotalLength] = 0;
      if (this[kCallback]) {
        this[kCallback](this[kError]);
        this[kCallback] = null;
      }
      return;
    }
    this[kBuffers].push(data);
  }
} });

var require_validation = __commonJS({ '../work/websockets__ws/lib/validation.js'(exports, module) {
  'use strict';
  const { isUtf8 } = require('node:buffer');
  const { hasBlob } = require_constants();
  const tokenChars = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0,
    0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
  ];

  function isValidStatusCode(code) {
    return (code >= 1000 && code <= 1014 && code !== 1004 && code !== 1005 && code !== 1006) || (code >= 3000 && code <= 4999);
  }

  function _isValidUTF8(buf) {
    const len = buf.length;
    let i = 0;
    while (i < len) {
      if ((buf[i] & 0x80) === 0) {
        i++;
      } else if ((buf[i] & 0xe0) === 0xc0) {
        if (i + 1 === len || (buf[i + 1] & 0xc0) !== 0x80 || (buf[i] & 0xfe) === 0xc0) return false;
        i += 2;
      } else if ((buf[i] & 0xf0) === 0xe0) {
        if (i + 2 >= len || (buf[i + 1] & 0xc0) !== 0x80 || (buf[i + 2] & 0xc0) !== 0x80 || (buf[i] === 0xe0 && (buf[i + 1] & 0xe0) === 0x80) || (buf[i] === 0xed && (buf[i + 1] & 0xe0) === 0xa0)) return false;
        i += 3;
      } else if ((buf[i] & 0xf8) === 0xf0) {
        if (i + 3 >= len || (buf[i + 1] & 0xc0) !== 0x80 || (buf[i + 2] & 0xc0) !== 0x80 || (buf[i + 3] & 0xc0) !== 0x80 || (buf[i] === 0xf0 && (buf[i + 1] & 0xf0) === 0x80) || (buf[i] === 0xf4 && buf[i + 1] > 0x8f) || buf[i] > 0xf4) return false;
        i += 4;
      } else return false;
    }
    return true;
  }

  function isBlob(value) {
    return hasBlob && typeof value === 'object' && typeof value.arrayBuffer === 'function' && typeof value.stream === 'function' && typeof value.constructor === 'function' && (value[Symbol.toStringTag] === 'Blob' || value[Symbol.toStringTag] === 'File');
  }

  const validation = {
    isBlob,
    isValidStatusCode,
    isValidUTF8: _isValidUTF8,
    tokenChars
  };

  module.exports = validation;

  if (isUtf8) {
    module.exports.isValidUTF8 = function(buf) {
      return buf.length < 150 ? _isValidUTF8(buf) : isUtf8(buf);
    };
  } else if (!process.env.WS_NO_UTF_8_VALIDATE) {
    try {
      const isValidUTF8 = require('utf-8-validate');
      module.exports.isValidUTF8 = function(buf) {
        return buf.length < 150 ? _isValidUTF8(buf) : isValidUTF8(buf);
      };
    } catch (e) {}
  }
} });

var require_receiver = __commonJS({ '../work/websockets__ws/lib/receiver.js'(exports, module) {
  'use strict';
  const { Writable } = require('stream');
  const PerMessageDeflate = require_permessage_deflate();
  const { BINARY_TYPES, EMPTY_BUFFER, kStatusCode, kWebSocket } = require_constants();
  const { concat, toArrayBuffer, unmask } = require_buffer_util();
  const { isValidStatusCode, isValidUTF8 } = require_validation;
  const FastBuffer = Buffer[Symbol.species];
  const GET_INFO = 0;
  const GET_PAYLOAD_LENGTH_16 = 1;
  const GET_PAYLOAD_LENGTH_64 = 2;
  const GET_MASK = 3;
  const GET_DATA = 4;
  const INFLATING = 5;

  const Receiver = class extends Writable {
    constructor(options = {}) {
      super();
      this._binaryType = options.binaryType || BINARY_TYPES[0];
      this._extensions = options.extensions || {};
      this._isServer = !!options.isServer;
      this._maxPayload = options.maxPayload || 0;
      this._skipUTF8Validation = !!options.skipUTF8Validation;
      this[kWebSocket] = undefined;
      this._bufferedBytes = 0;
      this._buffers = [];
      this._compressed = false;
      this._payloadLength = 0;
      this._mask = undefined;
      this._fragmented = 0;
      this._masked = false;
      this._fin = false;
      this._opcode = 0;
      this._totalPayloadLength = 0;
      this._messageLength = 0;
      this._fragments = [];
      this._state = GET_INFO;
      this._loop = false;
    }

    _write(chunk, encoding, cb) {
      if (this._opcode === 0x08 && this._state === GET_INFO) return cb();
      this._bufferedBytes += chunk.length;
      this._buffers.push(chunk);
      this.startLoop(cb);
    }

    consume(n) {
      this._bufferedBytes -= n;
      if (n === this._buffers[0].length) return this._buffers.shift();
      if (n < this._buffers[0].length) {
        const buf = this._buffers[0];
        this._buffers[0] = new FastBuffer(buf.buffer, buf.byteOffset + n, buf.length - n);
        return new FastBuffer(buf.buffer, buf.byteOffset, n);
      }
      const dst = Buffer.allocUnsafe(n);
      do {
        const buf = this._buffers[0];
        const offset = dst.length - n;
        if (n >= buf.length) {
          dst.set(this._buffers.shift(), offset);
        } else {
          dst.set(new Uint8Array(buf.buffer, buf.byteOffset, n), offset);
          this._buffers[0] = new FastBuffer(buf.buffer, buf.byteOffset + n, buf.length - n);
        }
        n -= buf.length;
      } while (n > 0);
      return dst;
    }

    startLoop(cb) {
      let err;
      this._loop = true;
      do {
        switch (this._state) {
          case GET_INFO:
            err = this.getInfo();
            break;
          case GET_PAYLOAD_LENGTH_16:
            err = this.getPayloadLength16();
            break;
          case GET_PAYLOAD_LENGTH_64:
            err = this.getPayloadLength64();
            break;
          case GET_MASK:
            this.getMask();
            break;
          case GET_DATA:
            err = this.getData(cb);
            break;
          case INFLATING:
            this._loop = false;
            return;
          default:
            this._loop = false;
            return;
        }
      } while (this._loop);
      cb(err);
    }

    getInfo() {
      if (this._bufferedBytes < 2) {
        this._loop = false;
        return;
      }
      const buf = this.consume(2);
      if ((buf[0] & 0x70) !== 0x00) {
        const error = this.createError(RangeError, 'RSV2 and RSV3 must be clear', true, 1002, 'WS_ERR_UNEXPECTED_RSV_2_3');
        this._loop = false;
        return error;
      }
      const compressed = (buf[0] & 0x40) !== 0;
      if (compressed && !this._extensions[PerMessageDeflate.extensionName]) {
        const error = this.createError(RangeError, 'RSV1 must be clear', true, 1002, 'WS_ERR_UNEXPECTED_RSV_1');
        this._loop = false;
        return error;
      }
      this._fin = (buf[0] & 0x80) !== 0;
      this._opcode = buf[0] & 0x0f;
      this._masked = (buf[1] & 0x80) !== 0;
      if (this._payloadLength === 126) this._state = GET_PAYLOAD_LENGTH_16;
      else if (this._payloadLength === 127) this._state = GET_PAYLOAD_LENGTH_64;
      else {
        this._state = GET_MASK;
        this.haveLength(this._payloadLength);
      }
    }

    getPayloadLength16() {
      if (this._bufferedBytes < 2) {
        this._loop = false;
        return;
      }
      this._payloadLength = this.consume(2).readUInt16BE(0);
      this._state = GET_MASK;
      this.haveLength(this._payloadLength);
    }

    getPayloadLength64() {
      if (this._bufferedBytes < 8) {
        this._loop = false;
        return;
      }
      const buf = this.consume(8);
      const num = buf.readUInt32BE(0);
      if (num > Math.pow(2, 53 - 32) - 1) {
        const error = this.createError(RangeError, 'Unsupported WebSocket frame: payload too large', true, 1009, 'WS_ERR_UNSUPPORTED_MESSAGE_LENGTH');
        this._loop = false;
        return error;
      }
      this._payloadLength = num * Math.pow(2, 32) + buf.readUInt32BE(4);
      this._state = GET_MASK;
      this.haveLength(this._payloadLength);
    }

    haveLength(length) {
      if (this._opcode < 0x08) {
        this._totalPayloadLength += length;
        if (this._maxPayload && this._totalPayloadLength > this._maxPayload) {
          this._loop = false;
          return this.createError(RangeError, 'Max payload size exceeded', false, 1009, 'WS_ERR_UNSUPPORTED_MESSAGE_LENGTH');
        }
        this._messageLength += length;
        if (this._messageLength > this._maxPayload && this._maxPayload) {
          this._loop = false;
          return this.createError(RangeError, 'Max payload size exceeded', false, 1009, 'WS_ERR_UNSUPPORTED_MESSAGE_LENGTH');
        }
      }
      if (this._masked) this._state = GET_MASK;
      else this._state = GET_DATA;
    }

    getMask() {
      if (this._bufferedBytes < 4) {
        this._loop = false;
        return;
      }
      this._mask = this.consume(4);
      this._state = GET_DATA;
    }

    getData(cb) {
      let data = EMPTY_BUFFER;
      if (this._payloadLength) {
        if (this._bufferedBytes < this._payloadLength) {
          this._loop = false;
          return;
        }
        data = this.consume(this._payloadLength);
        if (this._masked) unmask(data, this._mask);
      }
      if (this._opcode > 0x07) {
        this._loop = false;
        return this.controlMessage(data, cb);
      }
      if (this._compressed) {
        this._state = INFLATING;
        this.decompress(data, cb);
        return;
      }
      if (data.length) {
        this._messageLength += data.length;
        if (this._opcode === 0x09) {
          this._loop = false;
          return this.ping(data, cb);
        }
        if (this._opcode === 0x0a) {
          this._loop = false;
          return this.pong(data, cb);
        }
        this._fragments.push(data);
        this._state = GET_INFO;
      } else {
        this._loop = false;
        return this.dataMessage(cb);
      }
    }

    decompress(data, cb) {
      const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];
      zlibLimiter.add((done) => {
        perMessageDeflate.decompress(data, this._fin, (err, data) => {
          done();
          if (err) {
            const error = this.createError(Error, 'Invalid compressed frame', true, 1007, 'WS_ERR_INVALID_COMPRESSED_FRAME');
            cb(error);
            return;
          }
          if (data.length) {
            this._messageLength += data.length;
            if (this._maxPayload && this._messageLength > this._maxPayload) {
              this._loop = false;
              const error = this.createError(RangeError, 'Max payload size exceeded', false, 1009, 'WS_ERR_UNSUPPORTED_MESSAGE_LENGTH');
              cb(error);
              return;
            }
            this._fragments.push(data);
          }
          this._state = GET_INFO;
          this.startLoop(cb);
        });
      });
    }

    controlMessage(data, cb) {
      if (this._opcode === 0x08) {
        this._loop = false;
        if (data.length === 0) {
          this._loop = false;
          this._state = GET_INFO;
          this.emit('conclude', 1005, EMPTY_BUFFER);
          this.end();
        } else if (data.length === 1) {
          const error = this.createError(RangeError, 'Invalid WebSocket frame: 1 byte payload', true, 1002, 'WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH');
          cb(error);
        } else {
          this._loop = false;
          const code = data.readUInt16BE(0);
          if (!isValidStatusCode(code)) {
            const error = this.createError(RangeError, `Invalid status code ${code}`, true, 1002, 'WS_ERR_INVALID_CLOSE_CODE');
            cb(error);
            return;
          }
          const buf = new FastBuffer(data.buffer, data.byteOffset + 2, data.length - 2);
          if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
            const error = this.createError(Error, 'Invalid UTF-8 sequence', true, 1007, 'WS_ERR_INVALID_UTF8');
            cb(error);
            return;
          }
          this._state = GET_INFO;
          this.emit('conclude', code, buf);
          this.end();
        }
        return;
      }
      if (this._opcode === 0x09) {
        this._loop = false;
        this._state = GET_INFO;
        this.emit('ping', data);
        return;
      }
      this._loop = false;
      this._state = GET_INFO;
      this.emit('pong', data);
    }

    dataMessage(cb) {
      if (this._fin && this._fragmented === 0) {
        let data;
        if (this._opcode === 0x02) {
          data = concat(this._fragments, this._messageLength);
        } else {
          if (this._opcode === 0x01) {
            data = concat(this._fragments, this._messageLength);
            if (!this._skipUTF8Validation && !isValidUTF8(data)) {
              const error = this.createError(Error, 'Invalid UTF-8 sequence', true, 1007, 'WS_ERR_INVALID_UTF8');
              cb(error);
              return;
            }
          } else {
            data = concat(this._fragments, this._messageLength);
          }
        }
        if (this._binaryType === 'nodebuffer') {
          this.emit('message', data, false);
        } else if (this._binaryType === 'arraybuffer') {
          this.emit('message', toArrayBuffer(data), false);
        } else {
          this.emit('message', data, true);
        }
        this._state = GET_INFO;
        this._messageLength = 0;
        this._fragments = [];
      } else if (this._opcode === 0x01) {
        this._fragmented = 1;
        this._state = GET_INFO;
      } else if (this._opcode === 0x02) {
        this._fragmented = 2;
        this._state = GET_INFO;
      } else {
        this._state = GET_INFO;
      }
    }

    ping(data, cb) {
      this.emit('ping', data);
      cb();
    }

    pong(data, cb) {
      this.emit('pong', data);
      cb();
    }

    createError(Constructor, message, prefix, statusCode, code) {
      this._loop = false;
      this._errored = true;
      const err = new Constructor(prefix ? `Invalid WebSocket frame: ${message}` : message);
      Error.captureStackTrace(err, this.createError);
      err.code = code;
      err[kStatusCode] = statusCode;
      return err;
    }
  };

  module.exports = Receiver;
} });

var require_sender = __commonJS({ '../work/websockets__ws/lib/sender.js'(exports, module) {
  'use strict';
  const { Duplex } = require('stream');
  const { randomFillSync } = require('crypto');
  const { types: { isUint8Array } } = require('util');
  const PerMessageDeflate = require_permessage_deflate();
  const { EMPTY_BUFFER, kWebSocket, NOOP } = require_constants();
  const { isBlob, isValidStatusCode } = require_validation();
  const { mask: _mask, toBuffer: _toBuffer } = require_buffer_util();
  const kQueue = Symbol('queue');
  const kLingeringTimeout = Symbol('lingering-timeout');
  const kError = Symbol('error');
  const kCloseTimeout = Symbol('close-timeout');
  const kOnError = Symbol('onerror');
  const kListening = Symbol('listening');

  const SEND_BUFFERING = 0;
  const SEND_DIRECT = 1;
  const SEND_DEFERRED = 2;

  const Sender = class {
    constructor(socket, extensions, options) {
      this._extensions = extensions || {};
      if (options) {
        this._generateMask = options.generateMask;
        this._maskBuffer = Buffer.alloc(4);
      }
      this._socket = socket;
      this._firstFragment = true;
      this._compress = false;
      this._bufferedBytes = 0;
      this._queue = [];
      this._state = SEND_BUFFERING;
      this._.onerror = NOOP;
      this[kWebSocket] = undefined;
    }

    static frame(data, options) {
      let mask;
      let mutable = false;
      let generateMask = false;
      let offset = 2;
      let skipMasking = false;
      if (options.mask) {
        mask = options.mask || Buffer.alloc(4);
        if (options.generateMask) {
          options.generateMask(mask);
        } else {
          randomFillSync(mask, 0, 4);
        }
        generateMask = options.generateMask || (mask[0] | mask[1] | mask[2] | mask[3]) === 0;
        skipMasking = options.readOnly;
      }
      let payloadLength = data.length;
      if (payloadLength > 65535) {
        offset += 8;
        payloadLength = 127;
      } else if (payloadLength > 125) {
        offset += 2;
        payloadLength = 126;
      }
      const target = Buffer.allocUnsafe(skipMasking ? data.length + offset : offset + (generateMask ? data.length : 0));
      target[0] = options.fin ? options.opcode | 0x80 : options.opcode;
      if (options.rsv1) target[0] |= 0x40;
      target[1] = payloadLength;
      if (payloadLength === 126) {
        target.writeUInt16BE(data.length, 2);
      } else if (payloadLength === 127) {
        target[2] = target[3] = 0;
        target.writeUInt32BE(data.length, 4);
      }
      if (!options.mask) return [target, data];
      target[1] |= 0x80;
      target[offset - 4] = mask[0];
      target[offset - 3] = mask[1];
      target[offset - 2] = mask[2];
      target[offset - 1] = mask[3];
      if (skipMasking) return [target, data];
      if (generateMask) return _mask(data, mask, target, offset, data.length), [target];
      return _mask(data, mask, data, 0, data.length), [target, data];
    }

    close(code, data, mask, cb) {
      let buf;
      if (code === undefined) {
        buf = EMPTY_BUFFER;
      } else {
        if (typeof code !== 'number' || !isValidStatusCode(code)) throw new TypeError('First argument must be a valid error code number');
        if (data === undefined || !data.length) {
          buf = Buffer.allocUnsafe(2);
          buf.writeUInt16BE(code, 0);
        } else {
          const length = Buffer.byteLength(data);
          if (length > 123) throw new RangeError('The message must not be greater than 123 bytes');
          buf = Buffer.allocUnsafe(2 + length);
          buf.writeUInt16BE(code, 0);
          if (typeof data === 'string') {
            buf.write(data, 2);
          } else if (isUint8Array(data)) {
            buf.set(data, 2);
          } else {
            throw new TypeError('Second argument must be a string or Buffer');
          }
        }
      }
      const opts = {
        [kQueue]: buf.length,
        fin: true,
        generateMask: this._generateMask,
        mask: typeof this._socket !== 'undefined' ? mask !== undefined ? mask : !this._isServer : mask,
        opcode: 0x08,
        readOnly: false,
        rsv1: false
      };
      if (this._state !== SEND_DIRECT) {
        this._queue.push([this._send, buf, false, opts, cb]);
        this._bufferedBytes += buf.length;
      } else {
        this.sendFrame(Sender.frame(buf, opts), cb);
      }
    }

    ping(data, mask, cb) {
      let mutable = false;
      if (typeof data === 'string') {
        data = Buffer.from(data);
        mutable = false;
      } else if (isBlob(data)) {
        data = data.arrayBuffer();
        mutable = true;
      } else {
        data = _toBuffer(data);
        mutable = _toBuffer.readOnly;
      }
      if (data.length > 125) throw new RangeError('The data size must not be greater than 125 bytes');
      const opts = {
        [kQueue]: data.length,
        fin: true,
        generateMask: this._generateMask,
        mask: typeof this._socket !== 'undefined' ? mask !== undefined ? mask : !this._isServer : mask,
        opcode: 0x09,
        readOnly: mutable,
        rsv1: false
      };
      if (isBlob(data)) {
        if (this._state === SEND_BUFFERING) {
          this._queue.push([this._send, data, false, opts, cb]);
        } else {
          this._state = SEND_DEFERRED;
          data.then((buf) => {
            this._state = SEND_DIRECT;
            this.sendFrame(Sender.frame(buf, opts), cb);
            this.dequeue();
          });
        }
      } else {
        if (this._state === SEND_BUFFERING) {
          this._queue.push([this._send, data, false, opts, cb]);
        } else {
          this.sendFrame(Sender.frame(data, opts), cb);
        }
      }
    }

    pong(data, mask, cb) {
      let mutable = false;
      if (typeof data === 'string') {
        data = Buffer.from(data);
        mutable = false;
      } else if (isBlob(data)) {
        data = data.arrayBuffer();
        mutable = true;
      } else {
        data = _toBuffer(data);
        mutable = _toBuffer.readOnly;
      }
      if (data.length > 125) throw new RangeError('The data size must not be greater than 125 bytes');
      const opts = {
        [kQueue]: data.length,
        fin: true,
        generateMask: this._generateMask,
        mask: typeof this._socket !== 'undefined' ? mask !== undefined ? mask : !this._isServer : mask,
        opcode: 0x0a,
        readOnly: mutable,
        rsv1: false
      };
      if (isBlob(data)) {
        if (this._state === SEND_BUFFERING) {
          this._queue.push([this._send, data, false, opts, cb]);
        } else {
          this._state = SEND_DEFERRED;
          data.then((buf) => {
            this._state = SEND_DIRECT;
            this.sendFrame(Sender.frame(buf, opts), cb);
            this.dequeue();
          });
        }
      } else {
        if (this._state === SEND_BUFFERING) {
          this._queue.push([this._send, data, false, opts, cb]);
        } else {
          this.sendFrame(Sender.frame(data, opts), cb);
        }
      }
    }

    send(data, options, cb) {
      const opts = {
        [kQueue]: data.length,
        binary: typeof data !== 'string',
        compress: true,
        fin: true,
        generateMask: this._generateMask,
        mask: !this._isServer,
        ...options
      };
      if (this._extensions[PerMessageDeflate.extensionName]) {
        opts.compress = opts.binary ? opts.compress : false;
      } else {
        opts.compress = false;
      }
      if (isBlob(data)) {
        if (this._state === SEND_BUFFERING) {
          this._queue.push([this._send, data, false, opts, cb]);
        } else {
          this._state = SEND_DEFERRED;
          data.then((buf) => {
            this._state = SEND_DIRECT;
            this.sendFrame(Sender.frame(buf, opts), cb);
            this.dequeue();
          });
        }
      } else {
        if (this._state === SEND_BUFFERING) {
          this._queue.push([this._send, data, false, opts, cb]);
        } else {
          this.sendFrame(Sender.frame(data, opts), cb);
        }
      }
    }

    end(cb) {
      if (this._socket && this._socket.writable) {
        cb();
        this._socket.end();
      } else {
        cb();
      }
    }

    _send(data, compressed, opts, cb) {
      if (compressed) {
        this._extensions[PerMessageDeflate.extensionName].compress(data, opts.fin, (err, buf) => {
          if (err) {
            cb(err);
            return;
          }
          opts.rsv1 = true;
          this.sendFrame(Sender.frame(buf, opts), cb);
        });
      } else {
        this.sendFrame(Sender.frame(data, opts), cb);
      }
    }

    dequeue() {
      while (this._state === SEND_DIRECT && this._queue.length) {
        const [fn, data, compressed, opts, cb] = this._queue.shift();
        this._bufferedBytes -= opts[kQueue];
        fn.call(this, data, compressed, opts, cb);
      }
    }

    sendFrame(list, cb) {
      if (list.length === 2) {
        this._socket.cork();
        this._socket.write(list[0]);
        this._socket.write(list[1], cb);
        this._socket.uncork();
      } else {
        this._socket.write(list[0], cb);
      }
    }
  };

  module.exports = Sender;
} });

var require_event_target = __commonJS({ '../work/websockets__ws/lib/event-target.js'(exports, module) {
  'use strict';
  const { kForOnEventAttribute, kListener } = require_constants();
  const kCode = Symbol('kCode');
  const kData = Symbol('kData');
  const kError = Symbol('kError');
  const kMessage = Symbol('kMessage');
  const kReason = Symbol('kReason');
  const kTarget = Symbol('kTarget');
  const kType = Symbol('kType');
  const kWasClean = Symbol('kWasClean');

  const Event = class {
    constructor(type, options = {}) {
      this[kTarget] = null;
      this[kType] = type;
      this[kCode] = options.code !== undefined ? options.code : 0;
      this[kReason] = options.reason !== undefined ? options.reason : '';
      this[kWasClean] = options.wasClean !== undefined ? options.wasClean : false;
    }
    get target() { return this[kTarget]; }
    get type() { return this[kType]; }
    get code() { return this[kCode]; }
    get reason() { return this[kReason]; }
    get wasClean() { return this[kWasClean]; }
  };
  Object.defineProperty(Event.prototype, 'target', { enumerable: true });
  Object.defineProperty(Event.prototype, 'type', { enumerable: true });
  Object.defineProperty(Event.prototype, 'code', { enumerable: true });
  Object.defineProperty(Event.prototype, 'reason', { enumerable: true });
  Object.defineProperty(Event.prototype, 'wasClean', { enumerable: true });

  const CloseEvent = class extends Event {
    constructor(type, options = {}) {
      super(type, options);
      this[kError] = options.error !== undefined ? options.error : null;
      this[kMessage] = options.message !== undefined ? options.message : '';
    }
    get error() { return this[kError]; }
    get message() { return this[kMessage]; }
  };
  Object.defineProperty(CloseEvent.prototype, 'error', { enumerable: true });
  Object.defineProperty(CloseEvent.prototype, 'message', { enumerable: true });

  const ErrorEvent = class extends Event {
    constructor(type, options = {}) {
      super(type, options);
      this[kError] = options.error !== undefined ? options.error : null;
      this[kMessage] = options.message !== undefined ? options.message : '';
    }
    get error() { return this[kError]; }
    get message() { return this[kMessage]; }
  };
  Object.defineProperty(ErrorEvent.prototype, 'error', { enumerable: true });
  Object.defineProperty(ErrorEvent.prototype, 'message', { enumerable: true });

  const MessageEvent = class extends Event {
    constructor(type, options = {}) {
      super(type, options);
      this[kData] = options.data !== undefined ? options.data : null;
    }
    get data() { return this[kData]; }
  };
  Object.defineProperty(MessageEvent.prototype, 'data', { enumerable: true });

  const EventTarget = {
    addEventListener(method, listener, options = {}) {
      for (const listener of this.listeners(method)) {
        if (!options[kForOnEventAttribute] && listener[kListener] === listener && !listener[kForOnEventAttribute]) return;
      }
      let wrapper;
      if (method === 'message') {
        wrapper = function onMessage(data, isBinary) {
          const event = new MessageEvent('message', { data: isBinary ? data : data.toString() });
          event[kTarget] = this;
          callListener(listener, this, event);
        };
      } else if (method === 'close') {
        wrapper = function onClose(code, reason) {
          const event = new CloseEvent('close', { code, reason: reason.toString(), wasClean: this._closeCode === code });
          event[kTarget] = this;
          callListener(listener, this, event);
        };
      } else if (method === 'error') {
        wrapper = function onError(error) {
          const event = new ErrorEvent('error', { error, message: error.message });
          event[kTarget] = this;
          callListener(listener, this, event);
        };
      } else if (method === 'open') {
        wrapper = function onOpen() {
          const event = new Event('open');
          event[kTarget] = this;
          callListener(listener, this, event);
        };
      } else return;
      wrapper[kForOnEventAttribute] = !!options[kForOnEventAttribute];
      wrapper[kListener] = listener;
      if (options.once) this.once(method, wrapper);
      else this.on(method, wrapper);
    },
    removeEventListener(method, listener) {
      for (const wrapper of this.listeners(method)) {
        if (wrapper[kListener] === listener && !wrapper[kForOnEventAttribute]) {
          this.removeListener(method, wrapper);
          break;
        }
      }
    }
  };

  module.exports = {
    CloseEvent,
    ErrorEvent,
    Event,
    EventTarget,
    MessageEvent
  };

  function callListener(listener, thisArg, event) {
    if (typeof listener === 'object' && listener.handleEvent) listener.handleEvent(event);
    else listener.call(thisArg, event);
  }
} });

var require_extension = __commonJS({ '../work/websockets__ws/lib/extension.js'(exports, module) {
  'use strict';
  const { tokenChars } = require_validation();

  function push(dest, name, elem) {
    if (dest[name] === undefined) dest[name] = [elem];
    else dest[name].push(elem);
  }

  function parse(header) {
    const offers = Object.create(null);
    let params = Object.create(null);
    let mustUnescape = false;
    let isEscaping = false;
    let inQuotes = false;
    let extensionName;
    let paramName;
    let start = -1;
    let code = -1;
    let end = -1;
    let i = 0;
    for (; i < header.length; i++) {
      code = header.charCodeAt(i);
      if (extensionName === undefined) {
        if (end === -1 && tokenChars[code] === 1) {
          if (start === -1) start = i;
        } else if (code !== 0x20 && code !== 0x09) {
          if (code === 0x3b && start !== -1) {
            extensionName = header.slice(start, i);
            start = -1;
          } else if (code === 0x3d || code === 0x2c) {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        } else {
          if (start !== -1) {
            extensionName = header.slice(start, i);
          }
          start = -1;
        }
      } else {
        if (paramName === undefined) {
          if (end === -1 && tokenChars[code] === 1) {
            if (start === -1) start = i;
          } else if (code === 0x20 || code === 0x09) {
            if (start === -1) throw new SyntaxError(`Unexpected character at index ${i}`);
            start = -1;
          } else if (code === 0x3b || code === 0x2c) {
            if (start === -1) throw new SyntaxError(`Unexpected character at index ${i}`);
            push(offers, extensionName, params);
            params = Object.create(null);
            extensionName = undefined;
            start = -1;
          } else if (code === 0x3d) {
            if (start === -1) throw new SyntaxError(`Unexpected character at index ${i}`);
            paramName = header.slice(start, i);
            start = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        } else {
          if (isEscaping) {
            if (tokenChars[code] !== 1) throw new SyntaxError(`Unexpected character at index ${i}`);
            if (start === -1) start = i;
            isEscaping = false;
          } else if (inQuotes) {
            if (tokenChars[code] === 1) {
              if (start === -1) start = i;
            } else if (code === 0x22 && start !== -1) {
              inQuotes = false;
              end = i;
            } else if (code === 0x5c) {
              isEscaping = true;
            } else {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
          } else {
            if (tokenChars[code] === 1) {
              if (start === -1) start = i;
            } else if (code === 0x20 || code === 0x09) {
              if (start === -1) throw new SyntaxError(`Unexpected character at index ${i}`);
              end = i;
            } else if (code === 0x3b || code === 0x2c) {
              if (start === -1) throw new SyntaxError(`Unexpected character at index ${i}`);
              push(params, paramName, header.slice(start, end !== -1 ? end : i));
              paramName = undefined;
              start = end = -1;
            } else if (code === 0x3d) {
              if (start === -1) throw new SyntaxError(`Unexpected character at index ${i}`);
              push(params, paramName, header.slice(start, i));
              start = -1;
            } else if (code === 0x22) {
              if (start !== -1) throw new SyntaxError(`Unexpected character at index ${i}`);
              inQuotes = true;
            } else {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
          }
        }
      }
    }
    if (start !== -1 || inQuotes || isEscaping) throw new SyntaxError(`Unexpected end of input`);
    if (extensionName === undefined) {
      if (paramName !== undefined) push(params, paramName, header.slice(start !== -1 ? start : i));
      push(offers, extensionName, params);
    } else {
      if (paramName !== undefined) push(params, paramName, header.slice(start !== -1 ? start : i));
      push(offers, extensionName, params);
    }
    return offers;
  }

  function format(extensions) {
    return Object.keys(extensions).map((extension) => {
      let configurations = extensions[extension];
      if (!Array.isArray(configurations)) configurations = [configurations];
      return configurations.map((params) => {
        return [extension].concat(Object.keys(params).map((k) => {
          let values = params[k];
          if (!Array.isArray(values)) values = [values];
          return values.map((v) => v === true ? k : `${k}=${v}`).join('; ');
        })).join('; ');
      }).join(', ');
    }).join(', ');
  }

  module.exports = { format, parse };
} });

var require_websocket = __commonJS({ '../work/websockets__ws/lib/websocket.js'(exports, module) {
  'use strict';
  const EventEmitter = require('events');
  const http = require('http');
  const https = require('https');
  const net = require('net');
  const tls = require('tls');
  const { randomBytes, createHash } = require('crypto');
  const { Duplex, Readable } = require('stream');
  const { URL } = require('url');
  const PerMessageDeflate = require_permessage_deflate();
  const Receiver = require_receiver();
  const Sender = require_sender();
  const { isBlob } = require_validation();
  const {
    BINARY_TYPES,
    CLOSE_TIMEOUT,
    EMPTY_BUFFER,
    GUID,
    kForOnEventAttribute,
    kListener,
    kStatusCode,
    kWebSocket,
    NOOP
  } = require_constants();
  const { EventTarget: { addEventListener, removeEventListener } } = require_event_target();
  const { format, parse } = require_extension();
  const { toBuffer } = require_buffer_util();
  const readyStates = ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'];
  const subprotocolVersions = [13];
  const kHeaders = Symbol('headers');
  const kIsRunning = Symbol('is-running');
  const kSentClose = Symbol('sent-close');
  const kReceivedClose = Symbol('received-close');
  const kByteLength = Symbol('byte-length');
  const kSendFns = Symbol('send-fns');
  const kErrorEmitted = Symbol('error-emitted');

  const WebSocket = class extends EventEmitter {
    constructor(address, protocols, options) {
      super();
      this._binaryType = BINARY_TYPES[0];
      this._closeCode = 1006;
      this._closeFrameReceived = false;
      this._closeFrameSent = false;
      this._closeMessage = EMPTY_BUFFER;
      this._closeTimer = null;
      this._extensions = {};
      this._paused = false;
      this._protocol = '';
      this._readyState = WebSocket.CONNECTING;
      this._receiver = null;
      this._sender = null;
      this._socket = null;
      if (address !== null) {
        this._bufferedAmount = 0;
        this._isServer = false;
        this._redirects = 0;
        if (protocols === undefined) protocols = [];
        else {
          if (!Array.isArray(protocols)) {
            if (typeof protocols === 'object' && protocols !== null) {
              options = protocols;
              protocols = [];
            } else {
              protocols = [protocols];
            }
          }
        }
        initAsClient(this, address, protocols, options);
      } else {
        this._isServer = true;
        this._options = options || {};
      }
    }

    get binaryType() {
      return this._binaryType;
    }
    set binaryType(value) {
      if (!BINARY_TYPES.includes(value)) return;
      this._binaryType = value;
      if (this._receiver) this._receiver._binaryType = value;
    }

    get bufferedAmount() {
      if (!this._socket) return this._bufferedAmount;
      return this._socket.writableLength + this._bufferedAmount;
    }

    get extensions() {
      return Object.keys(this._extensions).join();
    }

    get isPaused() {
      return this._paused;
    }

    get onclose() {
      return null;
    }
    set onclose(value) {}

    get onerror() {
      return null;
    }
    set onerror(value) {}

    get onopen() {
      return null;
    }
    set onopen(value) {}

    get onmessage() {
      return null;
    }
    set onmessage(value) {}

    get protocol() {
      return this._protocol;
    }

    get readyState() {
      return this._readyState;
    }

    get url() {
      return this._url;
    }

    close(code, data) {
      if (this.readyState === WebSocket.CLOSED) return;
      if (this.readyState === WebSocket.CONNECTING) {
        const err = this._finalizeError('WebSocket was closed before the connection was established');
        this._finalize(err, true);
        return;
      }
      if (this.readyState === WebSocket.CLOSING) {
        if (this._closeFrameSent && (this._closeFrameReceived || this._receiver._receiver._writableState.errorEmitted)) {
          this._socket.end();
        }
        return;
      }
      this._readyState = WebSocket.CLOSING;
      this._sender.close(code, data, !this._isServer, (err) => {
        if (err) this._finalizeError(err);
      });
      this._closeTimer = setTimeout(this._finalizeCloseTimer, CLOSE_TIMEOUT);
    }

    pause() {
      if (this.readyState === WebSocket.CONNECTING || this.readyState === WebSocket.CLOSED) return;
      this._paused = true;
      this._socket.pause();
    }

    ping(data, mask, cb) {
      if (this.readyState === WebSocket.CONNECTING) throw new Error('WebSocket is not open: readyState 0 (CONNECTING)');
      if (typeof data === 'function') {
        cb = data;
        data = mask = undefined;
      } else if (typeof mask === 'function') {
        cb = mask;
        mask = undefined;
      }
      if (typeof data === 'number') data = data.toString();
      if (this.readyState === WebSocket.OPEN) {
        this._sender.ping(data, mask, cb);
        return;
      }
      this._finalizeError('WebSocket is not open: readyState ' + this.readyState + ' (' + readyStates[this.readyState] + ')');
    }

    pong(data, mask, cb) {
      if (this.readyState === WebSocket.CONNECTING) throw new Error('WebSocket is not open: readyState 0 (CONNECTING)');
      if (typeof data === 'function') {
        cb = data;
        data = mask = undefined;
      } else if (typeof mask === 'function') {
        cb = mask;
        mask = undefined;
      }
      if (typeof data === 'number') data = data.toString();
      if (this.readyState === WebSocket.OPEN) {
        this._sender.pong(data, mask, cb);
        return;
      }
      this._finalizeError('WebSocket is not open: readyState ' + this.readyState + ' (' + readyStates[this.readyState] + ')');
    }

    resume() {
      if (this.readyState === WebSocket.CONNECTING || this.readyState === WebSocket.CLOSED) return;
      this._paused = false;
      this._socket.resume();
    }

    send(data, options, cb) {
      if (this.readyState === WebSocket.CONNECTING) throw new Error('WebSocket is not open: readyState 0 (CONNECTING)');
      if (typeof options === 'function') {
        cb = options;
        options = {};
      }
      if (typeof data === 'number') data = data.toString();
      if (this.readyState === WebSocket.OPEN) {
        this._sender.send(data, options, cb);
        return;
      }
      this._finalizeError('WebSocket is not open: readyState ' + this.readyState + ' (' + readyStates[this.readyState] + ')');
    }

    terminate() {
      if (this.readyState === WebSocket.CLOSED) return;
      if (this.readyState === WebSocket.CONNECTING) {
        const err = this._finalizeError('WebSocket was closed before the connection was established');
        this._finalize(err, true);
        return;
      }
      this._socket.destroy();
      this._readyState = WebSocket.CLOSING;
      this._sender._state = 2;
      if (!this._receiver._writableState.errorEmitted) {
        this._receiver._errored = true;
        this._receiver.emit('error', new Error('WebSocket was closed before the connection was established'));
      }
      this._receiver.close();
      this._closeTimer = setTimeout(this._finalizeCloseTimer, CLOSE_TIMEOUT);
    }

    _finalizeCloseTimer() {
      this._socket.end();
    }

    _finalizeError(error) {
      if (this._errorEmitted) return;
      this._errorEmitted = true;
      const err = new Error(error);
      Error.captureStackTrace(err, this._finalizeError);
      if (this._socket) {
        this._socket.destroy();
        this._socket = null;
        if (this._receiver) {
          this._receiver.close();
          this._receiver = null;
        }
      }
      process.nextTick(emitError, this, err);
    }

    _finalize(err, needsClose) {
      if (this._socket) {
        this._socket.removeListener('error', this._finalizeError);
        this._socket.removeListener('end', this._finalizeCloseTimer);
        this._socket.removeListener('close', this._finalizeCloseTimer);
        this._socket = null;
        if (needsClose) {
          this._readyState = WebSocket.CLOSING;
          this._closeTimer = setTimeout(this._finalizeCloseTimer, CLOSE_TIMEOUT);
        }
      }
      if (this._receiver) {
        this._receiver.close();
        this._receiver = null;
      }
      if (err) {
        process.nextTick(emitError, this, err);
      } else {
        process.nextTick(emitClose, this);
      }
    }
  };

  Object.defineProperty(WebSocket, 'CONNECTING', { enumerable: true, value: readyStates.indexOf('CONNECTING') });
  Object.defineProperty(WebSocket.prototype, 'CONNECTING', { enumerable: true, value: readyStates.indexOf('CONNECTING') });
  Object.defineProperty(WebSocket, 'OPEN', { enumerable: true, value: readyStates.indexOf('OPEN') });
  Object.defineProperty(WebSocket.prototype, 'OPEN', { enumerable: true, value: readyStates.indexOf('OPEN') });
  Object.defineProperty(WebSocket, 'CLOSING', { enumerable: true, value: readyStates.indexOf('CLOSING') });
  Object.defineProperty(WebSocket.prototype, 'CLOSING', { enumerable: true, value: readyStates.indexOf('CLOSING') });
  Object.defineProperty(WebSocket, 'CLOSED', { enumerable: true, value: readyStates.indexOf('CLOSED') });
  Object.defineProperty(WebSocket.prototype, 'CLOSED', { enumerable: true, value: readyStates.indexOf('CLOSED') });
  ['open', 'error', 'close', 'message', 'ping', 'pong'].forEach((method) => {
    Object.defineProperty(WebSocket.prototype, 'on' + method, {
      enumerable: true,
      get() {
        for (const listener of this.listeners(method)) {
          if (listener[kForOnEventAttribute]) return listener[kListener];
        }
        return null;
      },
      set(listener) {
        for (const listener of this.listeners(method)) {
          if (listener[kForOnEventAttribute]) {
            this.removeListener(method, listener);
            break;
          }
        }
        if (typeof listener !== 'function') return;
        const opts = { [kForOnEventAttribute]: true };
        this.addEventListener(method, listener, opts);
      }
    });
  });
  WebSocket.prototype.addEventListener = addEventListener;
  WebSocket.prototype.removeEventListener = removeEventListener;
  module.exports = WebSocket;

  function initAsClient(websocket, address, protocols, options) {
    const opts = {
      allowSynchronousEvents: true,
      autoPong: true,
      closeTimeout: CLOSE_TIMEOUT,
      protocolVersion: subprotocolVersions[0],
      maxBufferedChunks: 0x10000,
      maxFragments: Math.pow(2, 16),
      maxPayload: Math.pow(2, 30),
      skipUTF8Validation: false,
      perMessageDeflate: true,
      followRedirects: false,
      maxRedirects: 10,
      ...options,
      socketPath: undefined,
      hostname: undefined,
      protocol: undefined,
      timeout: undefined,
      method: 'GET',
      host: undefined,
      path: undefined,
      port: undefined
    };
    websocket._autoPong = opts.autoPong;
    websocket._closeTimeout = opts.closeTimeout;
    if (!subprotocolVersions.includes(opts.protocolVersion)) throw new RangeError(`Unsupported protocol version: ${opts.protocolVersion} (supported versions: ${subprotocolVersions.join(', ')})`);
    let parsedUrl;
    if (address instanceof URL) parsedUrl = address;
    else {
      try {
        parsedUrl = new URL(address);
      } catch {
        throw new SyntaxError(`Invalid URL: ${address}`);
      }
    }
    if (parsedUrl.protocol === 'http:') parsedUrl.protocol = 'ws:';
    else if (parsedUrl.protocol === 'https:') parsedUrl.protocol = 'wss:';
    else if (parsedUrl.protocol !== 'ws:' && parsedUrl.protocol !== 'wss:') throw new SyntaxError(`Invalid URL: ${address}`);
    if (parsedUrl.hash) throw new SyntaxError(`URL contains a fragment identifier: ${address}`);
    websocket._url = parsedUrl.href;
    const isSecure = parsedUrl.protocol === 'wss:';
    const isIpc = parsedUrl.protocol === 'ws+unix:';
    let path;
    if (isIpc) {
      if (parsedUrl.pathname === undefined || parsedUrl.pathname === '') throw new SyntaxError(`Invalid URL: ${address}`);
      path = parsedUrl.pathname;
    } else if (parsedUrl.pathname) {
      path = parsedUrl.pathname;
    } else {
      path = '/';
    }
    if (parsedUrl.search) path += parsedUrl.search;
    const key = randomBytes(16).toString('base64');
    const httpObj = isSecure ? https : http;
    const perMessageDeflate = opts.perMessageDeflate ? new PerMessageDeflate(opts.perMessageDeflate, false, opts.maxPayload) : null;
    const defaultHeaders = {
      'Sec-WebSocket-Version': opts.protocolVersion,
      'Sec-WebSocket-Key': key,
      'Connection': 'Upgrade',
      'Upgrade': 'websocket'
    };
    if (opts.headers) Object.assign(defaultHeaders, opts.headers);
    if (opts.perMessageDeflate) {
      defaultHeaders['Sec-WebSocket-Extensions'] = format({ [PerMessageDeflate.extensionName]: perMessageDeflate.offer() });
    }
    if (protocols) {
      for (const protocol of protocols) {
        if (typeof protocol !== 'string' || !subprotocolVersions.includes(protocol) || websocket._protocol) throw new SyntaxError(`Invalid protocol: ${protocol}`);
        websocket._protocol = protocol;
      }
      defaultHeaders['Sec-WebSocket-Protocol'] = protocols.join(',');
    }
    if (opts.maxPayload === 0) opts.maxPayload = Infinity;
    if (opts.followRedirects) {
      if (opts.maxRedirects === undefined) opts.maxRedirects = 10;
      else if (opts.maxRedirects < 0) throw new RangeError(`Invalid maxRedirects: ${opts.maxRedirects}`);
    }
    let req;
    if (isIpc) {
      if (opts.agent && opts.agent instanceof http.Agent) {
        req = httpObj.request({ ...opts, socketPath: parsedUrl.pathname, path, headers: defaultHeaders });
      } else {
        req = httpObj.request({ socketPath: parsedUrl.pathname, path, headers: defaultHeaders });
      }
    } else {
      req = httpObj.request({ ...opts, hostname: parsedUrl.hostname, port: parsedUrl.port, path, headers: defaultHeaders });
    }
    if (opts.timeout) req.on('timeout', () => { abortRequest(req); });
    req.on('error', (err) => {
      if (req === null || req[kHeaders]) return;
      req = websocket._req = null;
      websocket._finalizeError(err);
    });
    req.on('response', (res) => {
      const location = res.headers.location;
      const statusCode = res.statusCode;
      if (location && opts.followRedirects && statusCode >= 300 && statusCode < 400) {
        if (++websocket._redirects > opts.maxRedirects) {
          websocket._finalizeError(new Error('Maximum redirects exceeded'));
          return;
        }
        req.abort();
        let url;
        try {
          url = new URL(location, address);
        } catch (err) {
          websocket._finalizeError(new Error(`Invalid redirect URL: ${location}`));
          return;
        }
        initAsClient(websocket, url, protocols, options);
      } else if (!websocket.emit('unexpected-response', req, res)) {
        websocket._finalizeError(new Error(`Unexpected server response: ${res.statusCode}`));
      }
    });
    req.on('upgrade', (res, socket, head) => {
      websocket.emit('upgrade', res);
      if (websocket.readyState !== WebSocket.CONNECTING) return;
      req = websocket._req = null;
      const upgrade = res.headers.upgrade;
      if (upgrade === undefined || upgrade.toLowerCase() !== 'websocket') {
        websocket._finalizeError(new Error('Invalid Upgrade header'));
        return;
      }
      const digest = createHash('sha1').update(key + GUID).digest('base64');
      if (res.headers['sec-websocket-accept'] !== digest) {
        websocket._finalizeError(new Error('Invalid Sec-WebSocket-Accept header'));
        return;
      }
      const serverProt = res.headers['sec-websocket-protocol'];
      let prot;
      if (serverProt !== undefined) {
        if (!protocols.length) prot = '';
        else if (!protocols.includes(serverProt)) prot = '';
        else prot = serverProt;
      } else {
        if (protocols.length) prot = protocols[0];
      }
      if (prot) websocket._protocol = prot;
      const serverExtensions = res.headers['sec-websocket-extensions'];
      if (serverExtensions !== undefined) {
        if (!perMessageDeflate) {
          websocket._finalizeError(new Error('Sec-WebSocket-Extensions header received but no extension was offered'));
          return;
        }
        let extensions;
        try {
          extensions = parse(serverExtensions);
        } catch (err) {
          websocket._finalizeError(new Error('Invalid Sec-WebSocket-Extensions header'));
          return;
        }
        const extensionNames = Object.keys(extensions);
        if (extensionNames.length !== 1 || extensionNames[0] !== PerMessageDeflate.extensionName) {
          websocket._finalizeError(new Error('Invalid Sec-WebSocket-Extensions header'));
          return;
        }
        try {
          perMessageDeflate.accept(extensions[PerMessageDeflate.extensionName]);
        } catch (err) {
          websocket._finalizeError(new Error('Invalid Sec-WebSocket-Extensions header'));
          return;
        }
        websocket._extensions[PerMessageDeflate.extensionName] = perMessageDeflate;
      }
      websocket.setSocket(socket, head, opts.maxPayload);
    });
    if (opts.finishRequest) opts.finishRequest(req, websocket);
    else req.end();
  }

  function emitError(websocket, err) {
    websocket._readyState = WebSocket.CLOSED;
    websocket.emit('error', err);
  }

  function emitClose(websocket) {
    websocket._readyState = WebSocket.CLOSED;
    websocket.emit('close', websocket._closeCode, websocket._closeMessage);
  }

  function abortRequest(req) {
    req.destroy();
  }
} });

WebSocket = require_websocket();
const { Duplex } = require('stream');

function emitClose(websocket) {
  websocket.emit('close', websocket._closeCode, websocket._closeMessage);
}

function duplexOnEnd() {
  if (!this._errored && this._readableState.ended) this.destroy();
}

function duplexOnError(err) {
  this.removeListener('error', duplexOnError);
  this.destroy();
  if (this._errored) return;
  this._errored = true;
  this._websocket._finalizeError(err);
}

function createWebSocketStream(ws, options) {
  let terminate = true;
  const duplex = new Duplex({
    ...options,
    autoDestroy: false,
    objectMode: false,
    emitClose: false,
    decodeStrings: false
  });
  ws.on('message', function message(msg, isBinary) {
    const data = !isBinary && duplex._readableState.objectMode ? msg.toString() : msg;
    if (!duplex.push(data)) ws._socket.pause();
  });
  ws.on('error', function error(err) {
    if (duplex.destroyed) return;
    terminate = false;
    duplex.destroy(err);
  });
  ws.on('close', function close() {
    if (duplex.destroyed) return;
    duplex.push(null);
  });
  duplex._read = function() {
    if (ws.readyState === ws.OPEN) ws._socket.resume();
  };
  duplex._write = function(chunk, encoding, cb) {
    if (ws.readyState === ws.CONNECTING) {
      ws.once('open', function open() {
        duplex._write(chunk, encoding, cb);
      });
      return;
    }
    ws.send(chunk, cb);
  };
  duplex._final = function(cb) {
    if (ws.readyState !== ws.CONNECTING) {
      if (ws._socket) {
        ws._socket.on('close', function close() {
          cb();
        });
        ws.close();
      } else {
        cb();
      }
      return;
    }
    ws.once('open', function open() {
      duplex._final(cb);
    });
  };
  duplex.on('error', duplexOnError);
  duplex.on('end', duplexOnEnd);
  if (terminate) ws.terminate();
  return duplex;
}

module.exports = createWebSocketStream;
