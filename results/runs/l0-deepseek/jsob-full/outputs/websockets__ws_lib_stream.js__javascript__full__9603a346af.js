'use strict';

var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

var require_constants = __commonJS({
  '../work/websockets__ws/lib/constants.js'(exports, module) {
    'use strict';

    const BINARY_TYPES = ['nodebuffer', 'arraybuffer', 'fragments'];
    const EMPTY_BUFFER = Buffer.alloc(0);
    const GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
    const hasBlob = typeof Blob !== 'undefined';
    const kForOnEventAttribute = Symbol('kForOnEventAttribute');
    const kListener = Symbol('kListener');
    const kStatusCode = Symbol('status-code');
    const kWebSocket = Symbol('websocket');
    const NOOP = () => {};

    if (hasBlob) BINARY_TYPES.push('blob');

    module.exports = {
      BINARY_TYPES,
      CLOSE_TIMEOUT: 30000,
      EMPTY_BUFFER,
      GUID,
      hasBlob,
      kForOnEventAttribute,
      kListener,
      kStatusCode,
      kWebSocket,
      NOOP
    };
  }
});

var require_buffer_util = __commonJS({
  '../work/websockets__ws/lib/buffer-util.js'(exports, module) {
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

    module.exports = {
      concat,
      mask,
      toArrayBuffer,
      toBuffer,
      unmask
    };

    if (!process.env.WS_NO_BUFFER_UTIL) {
      try {
        const bufferUtil = require('bufferutil');

        module.exports.mask = function (source, mask, output, offset, length) {
          if (length < 48) mask(source, mask, output, offset, length);
          else bufferUtil.mask(source, mask, output, offset, length);
        };

        module.exports.unmask = function (buffer, mask) {
          if (buffer.length < 32) unmask(buffer, mask);
          else bufferUtil.unmask(buffer, mask);
        };
      } catch (e) {}
    }
  }
});

var require_limiter = __commonJS({
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

var require_permessage_deflate = __commonJS({
  '../work/websockets__ws/lib/permessage-deflate.js'(exports, module) {
    'use strict';

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
      constructor(options, isServer, maxPayload) {
        this._options = options || {};
        this._threshold = this._options.threshold !== undefined ? this._options.threshold : 1024;
        this._isServer = !!isServer;
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
        const opts = this._options;
        const accepted = offers.find((params) => {
          if (
            (opts.serverNoContextTakeover === false &&
              params.server_no_context_takeover) ||
            (params.server_max_window_bits &&
              (opts.serverMaxWindowBits === false ||
                (typeof opts.serverMaxWindowBits === 'number' &&
                  opts.serverMaxWindowBits > params.server_max_window_bits))) ||
            (typeof opts.clientMaxWindowBits === 'number' &&
              !params.client_max_window_bits)
          ) {
            return false;
          }

          return true;
        });

        if (!accepted) {
          throw new Error('None of the extension offers can be accepted');
        }

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
        } else if (
          accepted.client_max_window_bits === true ||
          opts.clientMaxWindowBits === false
        ) {
          delete accepted.client_max_window_bits;
        }

        return accepted;
      }

      acceptAsClient(response) {
        const params = response[0];

        if (
          this._options.clientNoContextTakeover === false &&
          params.client_no_context_takeover
        ) {
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
          throw new Error(
            'Unexpected or invalid parameter "client_max_window_bits"'
          );
        }

        return params;
      }

      normalizeParams(configurations) {
        configurations.forEach((params) => {
          Object.keys(params).forEach((key) => {
            let value = params[key];

            if (value.length > 1) {
              throw new Error(`Parameter "${key}" must have only a single value`);
            }

            value = value[0];

            if (key === 'client_max_window_bits') {
              if (value !== true) {
                const num = +value;
                if (!Number.isInteger(num) || num < 8 || num > 15) {
                  throw new TypeError(
                    `Invalid value for parameter "${key}": ${value}`
                  );
                }
                value = num;
              } else if (!this._isServer) {
                throw new TypeError(
                  `Invalid value for parameter "${key}": ${value}`
                );
              }
            } else if (key === 'server_max_window_bits') {
              const num = +value;
              if (!Number.isInteger(num) || num < 8 || num > 15) {
                throw new TypeError(
                  `Invalid value for parameter "${key}": ${value}`
                );
              }
              value = num;
            } else if (
              key === 'client_no_context_takeover' ||
              key === 'server_no_context_takeover'
            ) {
              if (value !== true) {
                throw new TypeError(
                  `Invalid value for parameter "${key}": ${value}`
                );
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

      compress(data, fin, callback) {
        zlibLimiter.add((done) => {
          this._compress(data, fin, (err, result) => {
            done();
            callback(err, result);
          });
        });
      }

      _decompress(data, fin, callback) {
        const endpoint = this._isServer ? 'client' : 'server';

        if (!this._inflate) {
          const key = `${endpoint}_max_window_bits`;
          const windowBits =
            typeof this.params[key] !== 'number'
              ? zlib.Z_DEFAULT_WINDOWBITS
              : this.params[key];

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

        if (fin) this._inflate.write(TRAILER);

        this._inflate.flush(() => {
          const err = this._inflate[kError];

          if (err) {
            this._inflate.close();
            this._inflate = null;
            callback(err);
            return;
          }

          const data = bufferUtil.concat(
            this._inflate[kBuffers],
            this._inflate[kTotalLength]
          );

          if (this._inflate._readableState.endEmitted) {
            this._inflate.close();
            this._inflate = null;
          } else {
            this._inflate[kTotalLength] = 0;
            this._inflate[kBuffers] = [];

            if (fin && this.params[`${endpoint}_no_context_takeover`]) {
              this._inflate.reset();
            }
          }

          callback(null, data);
        });
      }

      _compress(data, fin, callback) {
        const endpoint = this._isServer ? 'server' : 'client';

        if (!this._deflate) {
          const key = `${endpoint}_max_window_bits`;
          const windowBits =
            typeof this.params[key] !== 'number'
              ? zlib.Z_DEFAULT_WINDOWBITS
              : this.params[key];

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

          let data = bufferUtil.concat(
            this._deflate[kBuffers],
            this._deflate[kTotalLength]
          );

          if (fin) {
            data = new FastBuffer(data.buffer, data.byteOffset, data.length - 4);
          }

          this._deflate[kCallback] = null;
          this._deflate[kTotalLength] = 0;
          this._deflate[kBuffers] = [];

          if (fin && this.params[`${endpoint}_no_context_takeover`]) {
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
      this[kTotalLength] += chunk.length;

      if (
        this[kPerMessageDeflate]._maxPayload < 1 ||
        this[kTotalLength] > this[kPerMessageDeflate]._maxPayload
      ) {
        this[kError] = new RangeError('Max payload size exceeded');
        this[kError].code = 'WS_ERR_UNSUPPORTED_MESSAGE_LENGTH';
        this[kError][kStatusCode] = 1009;
        this.removeListener('data', inflateOnData);
        this.reset();
        return;
      }

      this[kBuffers].push(chunk);
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
  }
});

var require_validation = __commonJS({
  '../work/websockets__ws/lib/validation.js'(exports, module) {
    'use strict';

    const { isUtf8 } = require('buffer');
    const { hasBlob } = require_constants();

    const tokenChars = [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0,
      1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0,
      0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0
    ];

    function isValidStatusCode(code) {
      return (
        (code >= 1000 && code <= 1014 && code !== 1004 && code !== 1005 && code !== 1006) ||
        (code >= 3000 && code <= 4999)
      );
    }

    function isValidUTF8(buf) {
      const len = buf.length;
      let i = 0;

      while (i < len) {
        if ((buf[i] & 0x80) === 0) {
          i++;
        } else if ((buf[i] & 0xe0) === 0xc0) {
          if (
            i + 1 === len ||
            (buf[i + 1] & 0xc0) !== 0x80 ||
            (buf[i] & 0xfe) === 0xc0
          ) {
            return false;
          }
          i += 2;
        } else if ((buf[i] & 0xf0) === 0xe0) {
          if (
            i + 2 >= len ||
            (buf[i + 1] & 0xc0) !== 0x80 ||
            (buf[i + 2] & 0xc0) !== 0x80 ||
            (buf[i] === 0xe0 && (buf[i + 1] & 0xe0) === 0x80) ||
            (buf[i] === 0xed && (buf[i + 1] & 0xe0) === 0xa0)
          ) {
            return false;
          }
          i += 3;
        } else if ((buf[i] & 0xf8) === 0xf0) {
          if (
            i + 3 >= len ||
            (buf[i + 1] & 0xc0) !== 0x80 ||
            (buf[i + 2] & 0xc0) !== 0x80 ||
            (buf[i + 3] & 0xc0) !== 0x80 ||
            (buf[i] === 0xf0 && (buf[i + 1] & 0xf0) === 0x80) ||
            (buf[i] === 0xf4 && buf[i + 1] > 0x8f) ||
            buf[i] > 0xf4
          ) {
            return false;
          }
          i += 4;
        } else {
          return false;
        }
      }

      return true;
    }

    function isBlob(value) {
      return (
        hasBlob &&
        typeof value === 'object' &&
        typeof value.arrayBuffer === 'function' &&
        typeof value.type === 'string' &&
        typeof value.stream === 'function' &&
        (value[Symbol.toStringTag] === 'Blob' ||
          value[Symbol.toStringTag] === 'File')
      );
    }

    module.exports = {
      isBlob,
      isValidStatusCode,
      isValidUTF8,
      tokenChars
    };

    if (isUtf8) {
      module.exports.isValidUTF8 = function (buf) {
        return buf.length < 24 ? isValidUTF8(buf) : isUtf8(buf);
      };
    } else if (!process.env.WS_NO_UTF_8_VALIDATE) {
      try {
        const isValidUTF8 = require('utf-8-validate');

        module.exports.isValidUTF8 = function (buf) {
          return buf.length < 32 ? isValidUTF8(buf) : isValidUTF8(buf);
        };
      } catch (e) {}
    }
  }
});

var require_receiver = __commonJS({
  '../work/websockets__ws/lib/receiver.js'(exports, module) {
    'use strict';

    const { Writable } = require('stream');
    const PerMessageDeflate = require_permessage_deflate();
    const {
      BINARY_TYPES,
      EMPTY_BUFFER,
      kStatusCode,
      kWebSocket
    } = require_constants();
    const { concat, toArrayBuffer, unmask } = require_buffer_util();
    const { isValidStatusCode, isValidUTF8 } = require_validation();

    const FastBuffer = Buffer[Symbol.species];
    const GET_INFO = 0;
    const GET_PAYLOAD_LENGTH_16 = 1;
    const GET_PAYLOAD_LENGTH_64 = 2;
    const GET_MASK = 3;
    const GET_DATA = 4;
    const INFLATING = 5;
    const DEFER_EVENT = 6;

    class Receiver extends Writable {
      constructor(options = {}) {
        super();

        this._binaryType = options.binaryType || BINARY_TYPES[0];
        this._extensions = options.extensions || {};
        this._isServer = !!options.isServer;
        this._maxPayload = options.maxPayload | 0;
        this._skipUTF8Validation = !!options.skipUTF8Validation;
        this._allowSynchronousEvents = options.allowSynchronousEvents !== undefined
          ? options.allowSynchronousEvents
          : true;
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

        this._errored = false;
        this._loop = false;
        this._state = GET_INFO;
      }

      _write(chunk, encoding, cb) {
        if (this._opcode === 0x08 && this._state == GET_INFO) return cb();

        this._bufferedBytes += chunk.length;
        this._buffers.push(chunk);
        this.startLoop(cb);
      }

      consume(n) {
        this._bufferedBytes -= n;

        if (n === this._buffers[0].length) return this._buffers.shift();

        if (n < this._buffers[0].length) {
          const buf = this._buffers[0];
          this._buffers[0] = new FastBuffer(
            buf.buffer,
            buf.byteOffset + n,
            buf.length - n
          );

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
            this._buffers[0] = new FastBuffer(
              buf.buffer,
              buf.byteOffset + n,
              buf.length - n
            );
          }

          n -= buf.length;
        } while (n > 0);

        return dst;
      }

      startLoop(cb) {
        this._loop = true;

        do {
          switch (this._state) {
            case GET_INFO:
              this.getInfo(cb);
              break;
            case GET_PAYLOAD_LENGTH_16:
              this.getPayloadLength16(cb);
              break;
            case GET_PAYLOAD_LENGTH_64:
              this.getPayloadLength64(cb);
              break;
            case GET_MASK:
              this.getMask();
              break;
            case GET_DATA:
              this.getData(cb);
              break;
            case INFLATING:
            case DEFER_EVENT:
              this._loop = false;
              return;
          }
        } while (this._loop);

        if (!this._errored) cb();
      }

      getInfo(cb) {
        if (this._bufferedBytes < 2) {
          this._loop = false;
          return;
        }

        const buf = this.consume(2);

        if ((buf[0] & 0x30) !== 0x00) {
          const error = this.createError(
            RangeError,
            'RSV2 and RSV3 must be clear',
            true,
            1002,
            'WS_ERR_UNEXPECTED_RSV_2_3'
          );
          cb(error);
          return;
        }

        const compressed = (buf[0] & 0x40) === 0x40;

        if (compressed && !this._extensions[PerMessageDeflate.extensionName]) {
          const error = this.createError(
            RangeError,
            'RSV1 must be clear',
            true,
            1002,
            'WS_ERR_UNEXPECTED_RSV_1'
          );
          cb(error);
          return;
        }

        this._fin = (buf[0] & 0x80) === 0x80;
        this._opcode = buf[0] & 0x0f;
        this._payloadLength = buf[1] & 0x7f;

        if (this._opcode === 0x00) {
          if (compressed) {
            const error = this.createError(
              RangeError,
              'RSV1 must be clear',
              true,
              1002,
              'WS_ERR_UNEXPECTED_RSV_1'
            );
            cb(error);
            return;
          }

          if (!this._fragmented) {
            const error = this.createError(
              RangeError,
              'invalid opcode 0',
              true,
              1002,
              'WS_ERR_INVALID_OPCODE'
            );
            cb(error);
            return;
          }

          this._opcode = this._fragmented;
        } else if (this._opcode === 0x01 || this._opcode === 0x02) {
          if (this._fragmented) {
            const error = this.createError(
              RangeError,
              `invalid opcode ${this._opcode}`,
              true,
              1002,
              'WS_ERR_INVALID_OPCODE'
            );
            cb(error);
            return;
          }

          this._compressed = compressed;
        } else if (this._opcode > 0x07 && this._opcode < 0x0b) {
          if (!this._fin) {
            const error = this.createError(
              RangeError,
              'FIN must be set',
              true,
              1002,
              'WS_ERR_EXPECTED_FIN'
            );
            cb(error);
            return;
          }

          if (compressed) {
            const error = this.createError(
              RangeError,
              'RSV1 must be clear',
              true,
              1002,
              'WS_ERR_UNEXPECTED_RSV_1'
            );
            cb(error);
            return;
          }

          if (
            this._payloadLength > 0x7d ||
            (this._opcode === 0x08 && this._payloadLength === 1)
          ) {
            const error = this.createError(
              RangeError,
              `invalid payload length ${this._payloadLength}`,
              true,
              1002,
              'WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH'
            );
            cb(error);
            return;
          }
        } else {
          const error = this.createError(
            RangeError,
            `invalid opcode ${this._opcode}`,
            true,
            1002,
            'WS_ERR_INVALID_OPCODE'
          );
          cb(error);
          return;
        }

        if (!this._fin && !this._fragmented) this._fragmented = this._opcode;
        this._masked = (buf[1] & 0x80) === 0x80;

        if (this._isServer) {
          if (!this._masked) {
            const error = this.createError(
              RangeError,
              'MASK must be set',
              true,
              1002,
              'WS_ERR_EXPECTED_MASK'
            );
            cb(error);
            return;
          }
        } else if (this._masked) {
          const error = this.createError(
            RangeError,
            'MASK must be clear',
            true,
            1002,
            'WS_ERR_UNEXPECTED_MASK'
          );
          cb(error);
          return;
        }

        if (this._payloadLength === 126) this._state = GET_PAYLOAD_LENGTH_16;
        else if (this._payloadLength === 127) this._state = GET_PAYLOAD_LENGTH_64;
        else this.haveLength(cb);
      }

      getPayloadLength16(cb) {
        if (this._bufferedBytes < 2) {
          this._loop = false;
          return;
        }

        this._payloadLength = this.consume(2).readUInt16BE(0);
        this.haveLength(cb);
      }

      getPayloadLength64(cb) {
        if (this._bufferedBytes < 8) {
          this._loop = false;
          return;
        }

        const buf = this.consume(8);
        const num = buf.readUInt32BE(0);

        if (num > Math.pow(2, 53 - 32) - 1) {
          const error = this.createError(
            RangeError,
            'Unsupported WebSocket frame: payload length > 2^53 - 1',
            false,
            1009,
            'WS_ERR_UNSUPPORTED_DATA_PAYLOAD_LENGTH'
          );
          cb(error);
          return;
        }

        this._payloadLength = num * Math.pow(2, 32) + buf.readUInt32BE(4);
        this.haveLength(cb);
      }

      haveLength(cb) {
        if (this._payloadLength && this._opcode < 0x08) {
          this._totalPayloadLength += this._payloadLength;

          if (this._totalPayloadLength > this._maxPayload && this._maxPayload > 0) {
            const error = this.createError(
              RangeError,
              'Max payload size exceeded',
              false,
              1009,
              'WS_ERR_UNSUPPORTED_MESSAGE_LENGTH'
            );
            cb(error);
            return;
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

          if (
            this._masked &&
            (this._mask[0] | this._mask[1] | this._mask[2] | this._mask[3]) !== 0
          ) {
            unmask(data, this._mask);
          }
        }

        if (this._opcode > 0x07) {
          this.controlMessage(data, cb);
          return;
        }

        if (this._compressed) {
          this._state = INFLATING;
          this.decompress(data, cb);
          return;
        }

        if (data.length) {
          this._messageLength = this._totalPayloadLength;
          this._fragments.push(data);
        }

        this.dataMessage(cb);
      }

      decompress(data, cb) {
        const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];

        perMessageDeflate.decompress(data, this._fin, (err, buf) => {
          if (err) return cb(err);

          if (buf.length) {
            this._messageLength += buf.length;
            if (this._messageLength > this._maxPayload && this._maxPayload > 0) {
              const error = this.createError(
                RangeError,
                'Max payload size exceeded',
                false,
                1009,
                'WS_ERR_UNSUPPORTED_MESSAGE_LENGTH'
              );
              cb(error);
              return;
            }

            this._fragments.push(buf);
          }

          this.dataMessage(cb);
          if (this._state === GET_INFO) this.startLoop(cb);
        });
      }

      dataMessage(cb) {
        if (!this._fin) {
          this._state = GET_INFO;
          return;
        }

        const messageLength = this._messageLength;
        const fragments = this._fragments;

        this._totalPayloadLength = 0;
        this._messageLength = 0;
        this._fragmented = 0;
        this._fragments = [];

        if (this._opcode === 2) {
          let data;

          if (this._binaryType === 'nodebuffer') {
            data = concat(fragments, messageLength);
          } else if (this._binaryType === 'arraybuffer') {
            data = toArrayBuffer(concat(fragments, messageLength));
          } else if (this._binaryType === 'blob') {
            data = new Blob(fragments);
          } else {
            data = fragments;
          }

          if (this._allowSynchronousEvents) {
            this.emit('message', data, true);
            this._state = GET_INFO;
          } else {
            this._state = DEFER_EVENT;
            setImmediate(() => {
              this.emit('message', data, true);
              this._state = GET_INFO;
              this.startLoop(cb);
            });
          }
        } else {
          const buf = concat(fragments, messageLength);

          if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
            const error = this.createError(
              Error,
              'invalid UTF-8 sequence',
              true,
              1007,
              'WS_ERR_INVALID_UTF8'
            );
            cb(error);
            return;
          }

          if (this._state === INFLATING || this._allowSynchronousEvents) {
            this.emit('message', buf, false);
            this._state = GET_INFO;
          } else {
            this._state = DEFER_EVENT;
            setImmediate(() => {
              this.emit('message', buf, false);
              this._state = GET_INFO;
              this.startLoop(cb);
            });
          }
        }
      }

      controlMessage(data, cb) {
        if (this._opcode === 0x08) {
          this._loop = false;

          if (data.length === 0) {
            this.emit('conclude', 1005, EMPTY_BUFFER);
            this.end();
          } else {
            const code = data.readUInt16BE(0);

            if (!isValidStatusCode(code)) {
              const error = this.createError(
                RangeError,
                `invalid status code ${code}`,
                true,
                1002,
                'WS_ERR_INVALID_CLOSE_CODE'
              );
              cb(error);
              return;
            }

            const buf = new FastBuffer(
              data.buffer,
              data.byteOffset + 2,
              data.length - 2
            );

            if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
              const error = this.createError(
                Error,
                'invalid UTF-8 sequence',
                true,
                1007,
                'WS_ERR_INVALID_UTF8'
              );
              cb(error);
              return;
            }

            this.emit('conclude', code, buf);
            this.end();
          }

          this._state = GET_INFO;
          return;
        }

        if (this._allowSynchronousEvents) {
          this.emit(this._opcode === 0x09 ? 'ping' : 'pong', data);
          this._state = GET_INFO;
        } else {
          this._state = DEFER_EVENT;
          setImmediate(() => {
            this.emit(this._opcode === 0x09 ? 'ping' : 'pong', data);
            this._state = GET_INFO;
            this.startLoop(cb);
          });
        }
      }

      createError(Type, message, isRangeError, code, errorCode) {
        this._loop = false;
        this._errored = true;

        const err = new Type(
          isRangeError
            ? `Invalid WebSocket frame: ${message}`
            : message
        );

        Error.captureStackTrace(err, this.createError);
        err.code = errorCode;
        err[kStatusCode] = code;
        return err;
      }
    }

    module.exports = Receiver;
  }
});

var require_sender = __commonJS({
  '../work/websockets__ws/lib/sender.js'(exports, module) {
    'use strict';

    const { Duplex } = require('stream');
    const { randomFillSync } = require('crypto');
    const { types: { isUint8Array } } = require('util');
    const PerMessageDeflate = require_permessage_deflate();
    const { EMPTY_BUFFER, kWebSocket, NOOP } = require_constants();
    const { isBlob, isValidStatusCode } = require_validation();
    const { mask: applyMask, toBuffer } = require_buffer_util();

    const kByteLength = Symbol('kByteLength');
    const maskBuffer = Buffer.alloc(4);
    const RANDOM_POOL_SIZE = 8 * 1024;
    let randomPool;
    let randomPoolPointer = RANDOM_POOL_SIZE;

    const DEFAULT = 0;
    const DEFLATING = 1;
    const GET_BLOB_DATA = 2;

    class Sender {
      constructor(socket, extensions, generateMask) {
        this._extensions = extensions || {};

        if (generateMask) {
          this._generateMask = generateMask;
          this._maskBuffer = Buffer.alloc(4);
        }

        this._socket = socket;
        this._firstFragment = true;
        this._compress = false;
        this._bufferedBytes = 0;
        this._queue = [];
        this._state = DEFAULT;
        this.onerror = NOOP;
        this[kWebSocket] = undefined;
      }

      static frame(data, options) {
        let offset = 2;
        let skipMasking = false;
        let mask;

        if (options.mask) {
          mask = options.maskBuffer || maskBuffer;

          if (options.generateMask) {
            options.generateMask(mask);
          } else {
            if (randomPoolPointer === RANDOM_POOL_SIZE) {
              if (randomPool === undefined) {
                    randomPool = Buffer.alloc(RANDOM_POOL_SIZE);
              }
              randomFillSync(randomPool, 0, RANDOM_POOL_SIZE);
              randomPoolPointer = 0;
            }

            mask[0] = randomPool[randomPoolPointer++];
            mask[1] = randomPool[randomPoolPointer++];
            mask[2] = randomPool[randomPoolPointer++];
            mask[3] = randomPool[randomPoolPointer++];
          }

          skipMasking = (mask[0] | mask[1] | mask[2] | mask[3]) === 0;
          offset = 6;
        }

        let dataLength;

        if (typeof data === 'string') {
          if (
            (!options.mask || skipMasking) &&
            options[kByteLength] !== undefined
          ) {
            dataLength = options[kByteLength];
          } else {
            data = Buffer.from(data);
            dataLength = data.length;
          }
        } else {
          dataLength = data.length;
          skipMasking = options.mask && options.mask && !skipMasking;
        }

        let payloadLength = dataLength;

        if (dataLength >= 65536) {
          offset += 8;
          payloadLength = 127;
        } else if (dataLength > 125) {
          offset += 2;
          payloadLength = 126;
        }

        const target = Buffer.allocUnsafe(
          skipMasking ? offset : offset + dataLength
        );

        target[0] = options.fin ? options.opcode | 0x80 : options.opcode;
        if (options.rsv1) target[0] |= 0x40;

        target[1] = payloadLength;

        if (payloadLength === 126) {
          target.writeUInt16BE(dataLength, 2);
        } else if (payloadLength === 127) {
          target[2] = target[3] = 0;
          target.writeUIntBE(dataLength, 4, 6);
        }

        if (!options.mask) return [target, data];

        target[1] |= 0x80;
        target[offset - 4] = mask[0];
        target[offset - 3] = mask[1];
        target[offset - 2] = mask[2];
        target[offset - 1] = mask[3];

        if (skipMasking) return [target, data];

        if (dataLength) {
          applyMask(data, mask, target, offset, dataLength);
        }

        return [target, data];
      }

      close(code, reason, callback) {
        let buf;

        if (code === undefined) {
          buf = EMPTY_BUFFER;
        } else if (typeof code !== 'number' || !isValidStatusCode(code)) {
          throw new TypeError('First argument must be a valid error code number');
        } else if (reason === undefined || !reason.length) {
          buf = Buffer.allocUnsafe(2);
          buf.writeUInt16BE(code, 0);
        } else {
          const length = Buffer.byteLength(reason);

          if (length > 123) {
            throw new RangeError('The message must not be greater than 123 bytes');
          }

          buf = Buffer.allocUnsafe(2 + length);
          buf.writeUInt16BE(code, 0);

          if (typeof reason === 'string') {
            buf.write(reason, 2);
          } else if (isUint8Array(reason)) {
            buf.set(reason, 2);
          } else {
            throw new TypeError('Second argument must be a string or a Uint8Array');
          }
        }

        const options = {
          [kByteLength]: buf.length,
          fin: true,
          generateMask: this._generateMask,
          mask: !this._socket.isServer,
          opcode: 0x08,
          rsv1: false
        };

        if (this._state === DEFAULT) {
          this.sendFrame(Sender.frame(buf, options), callback);
        } else {
          this.enqueue([this.drain, buf, false, options, callback]);
        }
      }

      ping(data, callback) {
        let buf;

        if (typeof data === 'string') {
          buf = Buffer.from(data);
        } else if (isBlob(data)) {
          buf = data.arrayBuffer();
        } else {
          data = toBuffer(data);
          buf = data;
        }

        if (buf.length > 125) {
          throw new RangeError('The data size must not be greater than 125 bytes');
        }

        const options = {
          fin: true,
          generateMask: this._generateMask,
          mask: !this._socket.isServer,
          opcode: 0x09,
          rsv1: false
        };

        if (isBlob(data)) {
          if (this._state === DEFAULT) {
            this.sendFrame(Sender.frame(data, options), callback);
          } else {
            this.enqueue([this.drain, data, false, options, callback]);
          }
        } else {
          if (this._state === DEFAULT) {
            this.sendFrame(Sender.frame(buf, options), callback);
          } else {
            this.enqueue([this.drain, buf, false, options, callback]);
          }
        }
      }

      pong(data, callback) {
        let buf;

        if (typeof data === 'string') {
          buf = Buffer.from(data);
        } else if (isBlob(data)) {
          buf = data.arrayBuffer();
        } else {
          data = toBuffer(data);
          buf = data;
        }

        if (buf.length > 125) {
          throw new RangeError('The data size must not be greater than 125 bytes');
        }

        const options = {
          fin: true,
          generateMask: this._generateMask,
          mask: !this._socket.isServer,
          opcode: 0x0a,
          rsv1: false
        };

        if (isBlob(data)) {
          if (this._state === DEFAULT) {
            this.sendFrame(Sender.frame(data, options), callback);
          } else {
            this.enqueue([this.drain, data, false, options, callback]);
          }
        } else {
          if (this._state === DEFAULT) {
            this.sendFrame(Sender.frame(buf, options), callback);
          } else {
            this.enqueue([this.drain, buf, false, options, callback]);
          }
        }
      }

      send(data, options, callback) {
        let buf;
        let isBlobData;

        if (typeof data === 'string') {
          buf = Buffer.from(data);
          isBlobData = false;
        } else if (isBlob(data)) {
          buf = data.arrayBuffer();
          isBlobData = false;
        } else {
          data = toBuffer(data);
          buf = data;
          isBlobData = toBuffer.readOnly;
        }

        if (buf.length === 0) {
          throw new RangeError('The data size must not be zero');
        }

        const opts = {
          fin: true,
          generateMask: this._generateMask,
          mask: !this._socket.isServer,
          opcode: options.binary ? 2 : 1,
          rsv1: options.compress
        };

        if (isBlob(data)) {
          if (this._state === DEFAULT) {
            this.sendFrame(Sender.frame(data, opts), callback);
          } else {
            this.enqueue([this.drain, data, false, opts, callback]);
          }
        } else {
          if (this._state === DEFAULT) {
            this.sendFrame(Sender.frame(buf, opts), callback);
          } else {
            this.enqueue([this.drain, buf, false, opts, callback]);
          }
        }
      }

      sendFrame(list, callback) {
        if (list.length === 2) {
          this._socket.cork();
          this._socket.write(list[0]);
          this._socket.write(list[1], callback);
          this._socket.uncork();
        } else {
          this._socket.write(list[0], callback);
        }
      }

      drain() {
        while (this._state === DEFAULT && this._queue.length) {
          const item = this._queue.shift();
          this._bufferedBytes -= item[1][kByteLength];
          Reflect.apply(item[0], this, item.slice(1));
        }
      }

      enqueue(item) {
        this._bufferedBytes += item[1][kByteLength];
        this._queue.push(item);
      }
    }

    module.exports = Sender;

    function emitError(error) {
      if (typeof error === 'function') error();
      for (let i = 0; i < this._queue.length; i++) {
        const item = this._queue[i];
        const callback = item[item.length - 1];
        if (typeof callback === 'function') callback(error);
      }
    }
  }
});

var require_event_target = __commonJS({
  '../work/websockets__ws/lib/event-target.js'(exports, module) {
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

    class Event {
      constructor(type) {
        this[kTarget] = null;
        this[kType] = type;
      }

      get target() {
        return this[kTarget];
      }

      get type() {
        return this[kType];
      }
    }

    Object.defineProperty(Event.prototype, 'target', { enumerable: true });
    Object.defineProperty(Event.prototype, 'type', { enumerable: true });

    class CloseEvent extends Event {
      constructor(type, options = {}) {
        super(type);
        this[kCode] = options.code === undefined ? 0 : options.code;
        this[kReason] = options.reason === undefined ? '' : options.reason;
        this[kWasClean] = options.wasClean === undefined ? false : options.wasClean;
      }

      get code() {
        return this[kCode];
      }

      get reason() {
        return this[kReason];
      }

      get wasClean() {
        return this[kWasClean];
      }
    }

    Object.defineProperty(CloseEvent.prototype, 'code', { enumerable: true });
    Object.defineProperty(CloseEvent.prototype, 'reason', { enumerable: true });
    Object.defineProperty(CloseEvent.prototype, 'wasClean', { enumerable: true });

    class ErrorEvent extends Event {
      constructor(type, options = {}) {
        super(type);
        this[kError] = options.error === undefined ? null : options.error;
        this[kMessage] = options.message === undefined ? '' : options.message;
      }

      get error() {
        return this[kError];
      }

      get message() {
        return this[kMessage];
      }
    }

    Object.defineProperty(ErrorEvent.prototype, 'error', { enumerable: true });
    Object.defineProperty(ErrorEvent.prototype, 'message', { enumerable: true });

    class MessageEvent extends Event {
      constructor(type, options = {}) {
        super(type);
        this[kData] = options.data === undefined ? null : options.data;
      }

      get data() {
        return this[kData];
      }
    }

    Object.defineProperty(MessageEvent.prototype, 'data', { enumerable: true });

    const EventTarget = {
      addEventListener(type, listener, options = {}) {
        for (const listener of this.listeners(type)) {
          if (
            !options[kForOnEventAttribute] &&
            listener[kListener] === listener &&
            !listener[kForOnEventAttribute]
          ) {
            return;
          }
        }

        let wrapper;

        if (type === 'message') {
          wrapper = function onMessage(data, isBinary) {
            const event = new MessageEvent('message', {
              data: isBinary ? data : data.toString()
            });

            event[kTarget] = this;
            callListener(listener, this, event);
          };
        } else if (type === 'close') {
          wrapper = function onClose(code, message) {
            const event = new CloseEvent('close', {
              code,
              reason: message.toString(),
              wasClean: this._closeFrameReceived && this._closeFrameSent
            });

            event[kTarget] = this;
            callListener(listener, this, event);
          };
        } else if (type === 'error') {
          wrapper = function onError(error) {
            const event = new ErrorEvent('error', {
              error,
              message: error.message
            });

            event[kTarget] = this;
            callListener(listener, this, event);
          };
        } else if (type === 'open') {
          wrapper = function onOpen() {
            const event = new Event('open');
            event[kTarget] = this;
            callListener(listener, this, event);
          };
        } else {
          return;
        }

        wrapper[kForOnEventAttribute] = !!options[kForOnEventAttribute];
        wrapper[kListener] = listener;

        if (options.once) {
          this.once(type, wrapper);
        } else {
          this.on(type, wrapper);
        }
      },

      removeEventListener(type, listener) {
        for (const listener of this.listeners(type)) {
          if (listener[kListener] === listener && !listener[kForOnEventAttribute]) {
            this.removeListener(type, listener);
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
      if (typeof listener === 'object' && listener.handleEvent) {
        listener.handleEvent.call(listener, event);
      } else {
        listener.call(thisArg, event);
      }
    }
  }
});

var require_extension = __commonJS({
  '../work/websockets__ws/lib/extension.js'(exports, module) {
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
          } else if (
            i !== 0 &&
            (code === 0x20 || code === 0x09)
          ) {
            if (end === -1 && start !== -1) end = i;
          } else if (code === 0x3b || code === 0x2c) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }

            if (end === -1) end = i;
            const name = header.slice(start, end);
            if (code === 0x2c) {
              push(offers, name, params);
              params = Object.create(null);
            } else {
              extensionName = name;
            }

            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        } else if (paramName === undefined) {
          if (end === -1 && tokenChars[code] === 1) {
            if (start === -1) start = i;
          } else if (code === 0x20 || code === 0x09) {
            if (end === -1 && start !== -1) end = i;
          } else if (code === 0x3b || code === 0x2c) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }

            if (end === -1) end = i;
            push(params, header.slice(start, end), true);
            if (code === 0x2c) {
              push(offers, extensionName, params);
              params = Object.create(null);
              extensionName = undefined;
            }

            start = end = -1;
          } else if (code === 0x3d && start !== -1 && end === -1) {
            paramName = header.slice(start, i);
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        } else {
          if (isEscaping) {
            if (tokenChars[code] !== 1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }

            if (start === -1) start = i;
            else if (!mustUnescape) mustUnescape = true;
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
          } else if (code === 0x22 && header.charCodeAt(i - 1) === 0x3d) {
            inQuotes = true;
          } else if (
            (end === -1 && tokenChars[code] === 1) ||
            (end !== -1 && (code === 0x20 || code === 0x09))
          ) {
            if (start === -1) start = i;
          } else if (code === 0x3b || code === 0x2c) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }

            if (end === -1) end = i;
            let value = header.slice(start, end);
            if (mustUnescape) {
              value = value.replace(/\\/g, '');
              mustUnescape = false;
            }
            push(params, paramName, value);
            if (code === 0x2c) {
              push(offers, extensionName, params);
              params = Object.create(null);
              extensionName = undefined;
            }

            paramName = undefined;
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        }
      }

      if (start === -1 || inQuotes || code === 0x20 || code === 0x09) {
        throw new SyntaxError('Unexpected end of input');
      }

      if (end === -1) end = i;
      const token = header.slice(start, end);

      if (extensionName === undefined) {
        push(offers, token, params);
      } else {
        if (paramName === undefined) {
          push(params, token, true);
        } else if (mustUnescape) {
          push(params, paramName, token.replace(/\\/g, ''));
        } else {
          push(params, paramName, token);
        }
        push(offers, extensionName, params);
      }

      return offers;
    }

    function format(extensions) {
      return Object.keys(extensions)
        .map((extension) => {
          let configurations = extensions[extension];
          if (!Array.isArray(configurations)) configurations = [configurations];
          return configurations
            .map((params) => {
              return [extension]
                .concat(
                  Object.keys(params).map((k) => {
                    let values = params[k];
                    if (!Array.isArray(values)) values = [values];
                    return values
                      .map((v) => (v === true ? k : `${k}=${v}`))
                      .join('; ');
                  })
                )
                .join('; ');
            })
            .join(', ');
        })
        .join(', ');
    }

    module.exports = { format, parse };
  }
});

var require_websocket = __commonJS({
  '../work/websockets__ws/lib/websocket.js'(exports, module) {
    'use strict';

    const EventEmitter = require('events');
    const https = require('https');
    const http = require('http');
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
    const {
      EventTarget: { addEventListener, removeEventListener }
    } = require_event_target();
    const { format, parse } = require_extension();
    const { toBuffer } = require_buffer_util();

    const kAborted = Symbol('kAborted');
    const protocolVersions = [8, 13];
    const readyStates = ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'];
    const subprotocolRegex = /^[!#$%&'*+\-.0-9A-Z^_`|a-z~]+$/;

    class WebSocket extends EventEmitter {
      constructor(address, protocols, options) {
        super();

        this._binaryType = BINARY_TYPES[0];
        this._closeCode = 1006;
        this._closeFrameReceived = false;
        this._closeFrameSent = false;
        this._closeMessage = EMPTY_BUFFER;
        this._closeTimer = null;
        this._errorEmitted = false;
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

          if (protocols === undefined) {
            protocols = [];
          } else if (!Array.isArray(protocols)) {
            if (typeof protocols === 'object' && protocols !== null) {
              options = protocols;
              protocols = [];
            } else {
              protocols = [protocols];
            }
          }

          initAsClient(this, address, protocols, options);
        } else {
          this._autoPong = options.autoPong;
          this._isServer = true;
        }
      }

      get binaryType() {
        return this._binaryType;
      }

      set binaryType(type) {
        if (!BINARY_TYPES.includes(type)) return;

        this._binaryType = type;

        if (this._receiver) this._receiver._binaryType = type;
      }

      get bufferedAmount() {
        if (!this._socket) return this._bufferedAmount;

        return this._socket._writableState.length + this._sender._bufferedBytes;
      }

      get extensions() {
        return Object.keys(this._extensions).join();
      }

      get isPaused() {
        return this._paused;
      }

      get onopen() {
        return null;
      }

      get onerror() {
        return null;
      }

      get onclose() {
        return null;
      }

      get onmessage() {
        return null;
      }

      get protocol() {
        return this._protocol;
      }

      get readyState() {
        return this._readyState;
      }

      get url() {
        return this._url;
      }

      setSocket(socket, head, options) {
        const receiver = new Receiver({
          allowSynchronousEvents: options.allowSynchronousEvents,
          binaryType: this.binaryType,
          extensions: this._extensions,
          isServer: this._isServer,
          maxPayload: options.maxPayload,
          skipUTF8Validation: options.skipUTF8Validation
        });

        const sender = new Sender(socket, this._extensions, options.generateMask);

        this._receiver = receiver;
        this._sender = sender;
        this._socket = socket;

        receiver[kWebSocket] = this;
        sender[kWebSocket] = this;
        socket[kWebSocket] = this;

        receiver.on('conclude', receiverOnConclude);
        receiver.on('drain', receiverOnDrain);
        receiver.on('error', receiverOnError);
        receiver.on('message', receiverOnMessage);
        receiver.on('ping', receiverOnPing);
        receiver.on('pong', receiverOnPong);

        sender.onerror = senderOnError;

        if (socket.setTimeout) socket.setTimeout(0);
        if (socket.setNoDelay) socket.setNoDelay();

        if (head.length > 0) socket.unshift(head);

        socket.on('close', socketOnClose);
        socket.on('data', socketOnData);
        socket.on('end', socketOnEnd);
        socket.on('error', socketOnError);

        this._readyState = WebSocket.OPEN;
        this.emit('open');
      }

      emitClose() {
        if (!this._socket) {
          this._readyState = WebSocket.CLOSED;
          this.emit('close', this._closeCode, this._closeMessage);
          return;
        }

        if (this._extensions[PerMessageDeflate.extensionName]) {
          this._extensions[PerMessageDeflate.extensionName].cleanup();
        }

        this._receiver.removeAllListeners();
        this._readyState = WebSocket.CLOSED;
        this.emit('close', this._closeCode, this._closeMessage);
      }

      close(code, data) {
        if (this.readyState === WebSocket.CLOSED) return;
        if (this.readyState === WebSocket.CONNECTING) {
          const msg = 'WebSocket was closed before the connection was established';
          abortHandshake(this, this._req, msg);
          return;
        }

        if (this.readyState === WebSocket.CLOSING) {
          if (
            this._closeFrameSent &&
            (this._closeFrameReceived || this._receiver._writableState.errorEmitted)
          ) {
            this._socket.end();
          }

          return;
        }

        this._readyState = WebSocket.CLOSING;
        this._sender.close(code, data, !this._isServer, (err) => {
          if (err) return;

          this._closeFrameSent = true;

          if (
            this._closeFrameReceived ||
            this._receiver._writableState.errorEmitted
          ) {
            this._socket.end();
          }
        });

        setCloseTimer(this);
      }

      pause() {
        if (
          this.readyState === WebSocket.CONNECTING ||
          this.readyState === WebSocket.CLOSED
        ) {
          return;
        }

        this._paused = true;
        this._socket.pause();
      }

      ping(data, mask, callback) {
        if (this.readyState === WebSocket.CONNECTING) {
          throw new Error('WebSocket was closed before the connection was established');
        }

        if (typeof data === 'function') {
          callback = data;
          data = mask = undefined;
        } else if (typeof mask === 'function') {
          callback = mask;
          mask = undefined;
        }

        if (typeof data === 'number') data = data.toString();

        if (this.readyState !== WebSocket.OPEN) {
          sendAfterClose(this, data, callback);
          return;
        }

        if (mask === undefined) mask = !this._isServer;
        this._sender.ping(data || EMPTY_BUFFER, mask, callback);
      }

      pong(data, mask, callback) {
        if (this.readyState === WebSocket.CONNECTING) {
          throw new Error('WebSocket was closed before the connection was established');
        }

        if (typeof data === 'function') {
          callback = data;
          data = mask = undefined;
        } else if (typeof mask === 'function') {
          callback = mask;
          mask = undefined;
        }

        if (typeof data === 'number') data = data.toString();

        if (this.readyState !== WebSocket.OPEN) {
          sendAfterClose(this, data, callback);
          return;
        }

        if (mask === undefined) mask = !this._isServer;
        this._sender.pong(data || EMPTY_BUFFER, mask, callback);
      }

      resume() {
        if (
          this.readyState === WebSocket.CONNECTING ||
          this.readyState === WebSocket.CLOSED
        ) {
          return;
        }

        this._paused = false;
        if (!this._receiver._writableState.needDrain) this._socket.resume();
      }

      send(data, options, callback) {
        if (this.readyState === WebSocket.CONNECTING) {
          throw new Error('WebSocket was closed before the connection was established');
        }

        if (typeof options === 'function') {
          callback = options;
          options = {};
        }

        if (typeof data === 'number') data = data.toString();

        if (this.readyState !== WebSocket.OPEN) {
          sendAfterClose(this, data, callback);
          return;
        }

        const opts = {
          binary: typeof data !== 'string',
          mask: !this._isServer,
          compress: true,
          fin: true,
          ...options
        };

        if (!this._extensions[PerMessageDeflate.extensionName]) {
          opts.compress = false;
        }

        this._sender.send(data || EMPTY_BUFFER, opts, callback);
      }

      terminate() {
        if (this.readyState === WebSocket.CLOSED) return;
        if (this.readyState === WebSocket.CONNECTING) {
          const msg = 'WebSocket was closed before the connection was established';
          abortHandshake(this, this._req, msg);
          return;
        }

        if (this._socket) {
          this._readyState = WebSocket.CLOSING;
          this._socket.destroy();
        }
      }
    }

    Object.defineProperty(WebSocket, 'CONNECTING', {
      enumerable: true,
      value: readyStates.indexOf('CONNECTING')
    });
    Object.defineProperty(WebSocket.prototype, 'CONNECTING', {
      enumerable: true,
      value: readyStates.indexOf('CONNECTING')
    });
    Object.defineProperty(WebSocket, 'OPEN', {
      enumerable: true,
      value: readyStates.indexOf('OPEN')
    });
    Object.defineProperty(WebSocket.prototype, 'OPEN', {
      enumerable: true,
      value: readyStates.indexOf('OPEN')
    });
    Object.defineProperty(WebSocket, 'CLOSING', {
      enumerable: true,
      value: readyStates.indexOf('CLOSING')
    });
    Object.defineProperty(WebSocket.prototype, 'CLOSING', {
      enumerable: true,
      value: readyStates.indexOf('CLOSING')
    });
    Object.defineProperty(WebSocket, 'CLOSED', {
      enumerable: true,
      value: readyStates.indexOf('CLOSED')
    });
    Object.defineProperty(WebSocket.prototype, 'CLOSED', {
      enumerable: true,
      value: readyStates.indexOf('CLOSED')
    });

    ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'].forEach((property) => {
      Object.defineProperty(WebSocket.prototype, property, { enumerable: true });
    });

    ['open', 'error', 'close', 'message'].forEach((method) => {
      Object.defineProperty(WebSocket.prototype, `on${method}`, {
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

          this.addEventListener(method, listener, {
            [kForOnEventAttribute]: true
          });
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
        protocolVersion: protocolVersions[1],
        maxBufferedChunks: 16 * 1024 * 1024,
        maxFragments: 16 * 1024,
        maxPayload: 100 * 1024 * 1024,
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

      if (!protocolVersions.includes(opts.protocolVersion)) {
        throw new RangeError(
          `Unsupported protocol version: ${opts.protocolVersion}` +
            ` (supported versions: ${protocolVersions.join(', ')})`
        );
      }

      let parsedUrl;

      if (address instanceof URL) {
        parsedUrl = address;
      } else {
        try {
          parsedUrl = new URL(address);
        } catch (e) {
          throw new SyntaxError(`Invalid URL: ${address}`);
        }
      }

      if (parsedUrl.protocol === 'http:') {
        parsedUrl.protocol = 'ws:';
      } else if (parsedUrl.protocol === 'https:') {
        parsedUrl.protocol = 'wss:';
      }

      websocket._url = parsedUrl.href;

      const isSecure = parsedUrl.protocol === 'wss:';
      const isIpcUrl = parsedUrl.protocol === 'ws+unix:';
      let invalidUrlMessage;

      if (parsedUrl.protocol !== 'ws:' && !isSecure && !isIpcUrl) {
        invalidUrlMessage =
          'The URL\'s protocol must be one of "ws:", "wss:", "http:", "https", or "ws+unix:"';
      } else if (isIpcUrl && !parsedUrl.pathname) {
        invalidUrlMessage = "The URL's pathname is empty";
      } else if (parsedUrl.hash) {
        invalidUrlMessage = 'The URL contains a fragment identifier';
      }

      if (invalidUrlMessage) {
        const err = new SyntaxError(invalidUrlMessage);

        if (websocket._redirects === 0) {
          throw err;
        } else {
          emitErrorAndClose(websocket, err);
          return;
        }
      }

      const defaultPort = isSecure ? 443 : 80;
      const key = randomBytes(16).toString('base64');
      const request = isSecure ? https.request : http.request;
      const protocolSet = new Set();
      let perMessageDeflate;

      opts.createConnection =
        opts.createConnection || (isSecure ? tlsConnect : netConnect);
      opts.defaultPort = opts.defaultPort || defaultPort;
      opts.port = parsedUrl.port || defaultPort;
      opts.host = parsedUrl.hostname.startsWith('[')
        ? parsedUrl.hostname.slice(1, -1)
        : parsedUrl.hostname;
      opts.headers = {
        ...opts.headers,
        'Sec-WebSocket-Version': opts.protocolVersion,
        'Sec-WebSocket-Key': key,
        Connection: 'Upgrade',
        Upgrade: 'websocket'
      };
      opts.path = parsedUrl.pathname + parsedUrl.search;
      opts.timeout = opts.handshakeTimeout;

      if (opts.perMessageDeflate) {
        perMessageDeflate = new PerMessageDeflate(
          opts.perMessageDeflate !== true ? opts.perMessageDeflate : {},
          false,
          opts.maxPayload
        );

        opts.headers['Sec-WebSocket-Extensions'] = format({
          [PerMessageDeflate.extensionName]: perMessageDeflate.offer()
        });
      }

      if (protocols.length) {
        for (const protocol of protocols) {
          if (
            typeof protocol !== 'string' ||
            !subprotocolRegex.test(protocol) ||
            protocolSet.has(protocol)
          ) {
            throw new SyntaxError(
              'An invalid or duplicated subprotocol was specified'
            );
          }

          protocolSet.add(protocol);
        }

        opts.headers['Sec-WebSocket-Protocol'] = protocols.join(',');
      }

      if (opts.origin) {
        if (opts.protocolVersion < 13) {
          opts.headers['Sec-WebSocket-Origin'] = opts.origin;
        } else {
          opts.headers.Origin = opts.origin;
        }
      }

      if (parsedUrl.username || parsedUrl.password) {
        opts.auth = `${parsedUrl.username}:${parsedUrl.password}`;
      }

      if (isIpcUrl) {
        const parts = opts.path.split(':');

        opts.socketPath = parts[0];
        opts.path = parts[1];
      }

      let req;

      if (opts.followRedirects) {
        if (websocket._redirects === 0) {
          websocket._originalIpc = isIpcUrl;
          websocket._originalSecure = isSecure;
          websocket._originalHostOrSocketPath = isIpcUrl
            ? opts.socketPath
            : parsedUrl.host;

          const headers = options && options.headers;

          options = { ...options, headers: {} };

          if (headers) {
            for (const [key, value] of Object.entries(headers)) {
              options.headers[key.toLowerCase()] = value;
            }
          }
        } else if (websocket.listenerCount('redirect') === 0) {
          const isSameHost = isIpcUrl
            ? websocket._originalIpc
              ? opts.socketPath === websocket._originalHostOrSocketPath
              : false
            : websocket._originalIpc
              ? false
              : parsedUrl.host === websocket._originalHostOrSocketPath;

          if (!isSameHost || (websocket._originalSecure && !isSecure)) {
            delete opts.headers.authorization;
            delete opts.headers.cookie;

            if (!isSameHost) delete opts.headers.host;

            opts.auth = undefined;
          }
        }
      }

      if (opts.auth && !options.headers.authorization) {
        options.headers.authorization =
          'Basic ' + Buffer.from(opts.auth).toString('base64');
      }

      req = (websocket._req = request(opts));

      if (opts.timeout) {
        req.on('timeout', () => {
          abortHandshake(websocket, req, 'Opening handshake has timed out');
        });
      }

      req.on('error', (err) => {
        if (req === null || req[kAborted]) return;

        req = websocket._req = null;
        emitErrorAndClose(websocket, err);
      });

      req.on('response', (res) => {
        const location = res.headers.location;
        const statusCode = res.statusCode;

        if (
          location &&
          opts.followRedirects &&
          statusCode >= 300 &&
          statusCode < 400
        ) {
          if (++websocket._redirects > opts.maxRedirects) {
            abortHandshake(websocket, req, 'Maximum redirects exceeded');
            return;
          }

          req.abort();

          let addr;

          try {
            addr = new URL(location, address);
          } catch (e) {
            const err = new SyntaxError(`Invalid URL: ${location}`);
            emitErrorAndClose(websocket, err);
            return;
          }

          initAsClient(websocket, addr, protocols, options);
        } else if (!websocket.emit('unexpected-response', req, res)) {
          abortHandshake(
            websocket,
            req,
            `Unexpected server response: ${res.statusCode}`
          );
        }
      });

      req.on('upgrade', (res, socket, head) => {
        websocket.emit('upgrade', res);

        if (
          websocket.readyState !== WebSocket.CONNECTING
        ) {
          return;
        }

        req = websocket._req = null;

        const upgrade = res.headers.upgrade;

        if (upgrade === undefined || upgrade.toLowerCase() !== 'websocket') {
          abortHandshake(websocket, socket, 'Invalid Upgrade header');
          return;
        }

        const digest = createHash('sha1')
          .update(key + GUID)
          .digest('base64');

        if (res.headers['sec-websocket-accept'] !== digest) {
          abortHandshake(websocket, socket, 'Invalid Sec-WebSocket-Accept header');
          return;
        }

        const serverProt = res.headers['sec-websocket-protocol'];
        let protError;

        if (serverProt !== undefined) {
          if (!protocolSet.size) {
            protError = 'Server sent a subprotocol but none was requested';
          } else if (!protocolSet.has(serverProt)) {
            protError = 'Server sent an invalid subprotocol';
          }
        } else if (protocolSet.size) {
          protError = 'Server sent no subprotocol';
        }

        if (protError) {
          abortHandshake(websocket, socket, protError);
          return;
        }

        if (serverProt) websocket._protocol = serverProt;

        const secWebSocketExtensions = res.headers['sec-websocket-extensions'];

        if (secWebSocketExtensions !== undefined) {
          if (!perMessageDeflate) {
            const message =
              'Server sent a Sec-WebSocket-Extensions header but no extension was requested';
            abortHandshake(websocket, socket, message);
            return;
          }

          let extensions;

          try {
            extensions = parse(secWebSocketExtensions);
          } catch (err) {
            const message = 'Invalid Sec-WebSocket-Extensions header';
            abortHandshake(websocket, socket, message);
            return;
          }

          const extensionNames = Object.keys(extensions);

          if (
            extensionNames.length !== 1 ||
            extensionNames[0] !== PerMessageDeflate.extensionName
          ) {
            const message = 'Server indicated an extension that was not requested';
            abortHandshake(websocket, socket, message);
            return;
          }

          try {
            perMessageDeflate.accept(extensions[PerMessageDeflate.extensionName]);
          } catch (err) {
            const message = 'Invalid Sec-WebSocket-Extensions header';
            abortHandshake(websocket, socket, message);
            return;
          }

          websocket._extensions[PerMessageDeflate.extensionName] =
            perMessageDeflate;
        }

        websocket.setSocket(socket, head, {
          allowSynchronousEvents: opts.allowSynchronousEvents,
          generateMask: opts.generateMask,
          maxPayload: opts.maxPayload,
          skipUTF8Validation: opts.skipUTF8Validation
        });
      });

      if (opts.finishRequest) {
        opts.finishRequest(req, websocket);
      } else {
        req.end();
      }
    }

    function emitErrorAndClose(websocket, err) {
      websocket._readyState = WebSocket.CLOSING;
      websocket._errorEmitted = true;
      websocket.emit('error', err);
      websocket.emitClose();
    }

    function abortHandshake(websocket, stream, message) {
      websocket._readyState = WebSocket.CLOSING;
      const err = new Error(message);
      Error.captureStackTrace(err, abortHandshake);

      if (stream.setHeader) {
        stream[kAborted] = true;
        stream.abort();

        if (stream.socket && !stream.socket.destroyed) {
          stream.socket.destroy();
        }

        process.nextTick(emitErrorAndClose, websocket, err);
      } else {
        stream.destroy(err);
        stream.once('error', websocket.emit.bind(websocket, 'error'));
        stream.once('close', websocket.emitClose.bind(websocket));
      }
    }

    function sendAfterClose(websocket, data, cb) {
      if (data) {
        const length = isBlob(data) ? data.size : toBuffer(data).length;

        if (websocket._socket) websocket._sender._bufferedBytes += length;
        else websocket._bufferedAmount += length;
      }

      if (cb) {
        const err = new Error(
          `WebSocket is not open: readyState ${websocket.readyState} ` +
            `(${readyStates[websocket.readyState]})`
        );
        process.nextTick(cb, err);
      }
    }

    function receiverOnConclude(code, reason) {
      const websocket = this[kWebSocket];

      websocket._closeFrameReceived = true;
      websocket._closeMessage = reason;
      websocket._closeCode = code;

      if (websocket._socket[kWebSocket] === undefined) return;

      websocket._socket.removeListener('data', socketOnData);
      process.nextTick(resume, websocket._socket);

      if (code === 1005) websocket.close();
      else websocket.close(code, reason);
    }

    function receiverOnDrain() {
      const websocket = this[kWebSocket];
      if (!websocket.isPaused) websocket._socket.resume();
    }

    function receiverOnError(err) {
      const websocket = this[kWebSocket];

      if (websocket._socket[kWebSocket] !== undefined) {
        websocket._socket.removeListener('data', socketOnData);
        process.nextTick(resume, websocket._socket);
        websocket.close(err[kStatusCode]);
      }

      if (!websocket._errorEmitted) {
        websocket._errorEmitted = true;
        websocket.emit('error', err);
      }
    }

    function receiverOnMessage(data, isBinary) {
      this[kWebSocket].emit('message', data, isBinary);
    }

    function receiverOnPing(data) {
      const websocket = this[kWebSocket];
      if (websocket._autoPong) websocket.pong(data, !this._isServer, NOOP);
      websocket.emit('ping', data);
    }

    function receiverOnPong(data) {
      this[kWebSocket].emit('pong', data);
    }

    function resume(stream) {
      stream.resume();
    }

    function senderOnError(err) {
      const websocket = this[kWebSocket];

      if (websocket.readyState === WebSocket.CLOSED) return;
      if (websocket.readyState === WebSocket.OPEN) {
        websocket._readyState = WebSocket.CLOSING;
        setCloseTimer(websocket);
      }

      websocket._socket.destroy(err);
    }

    function socketOnClose() {
      const websocket = this[kWebSocket];

      this.removeListener('close', socketOnClose);
      this.removeListener('data', socketOnData);
      this.removeListener('end', socketOnEnd);

      websocket._readyState = WebSocket.CLOSING;

      let chunk;

      if (
        !this._readableState.endEmitted &&
        !websocket._closeFrameReceived &&
        !websocket._receiver._writableState.errorEmitted &&
        this.readable
      ) {
        chunk = websocket._socket.read();
      }

      websocket._receiver.end();

      this[kWebSocket] = undefined;

      clearTimeout(websocket._closeTimer);

      if (
        websocket._receiver._writableState.finished ||
        websocket._receiver._writableState.errorEmitted
      ) {
        websocket.emitClose();
      } else {
        websocket._receiver.on('error', receiverOnFinish);
        websocket._receiver.on('finish', receiverOnFinish);
      }
    }

    function socketOnData(chunk) {
      if (!this[kWebSocket]._receiver.write(chunk)) {
        this.pause();
      }
    }

    function socketOnEnd() {
      const websocket = this[kWebSocket];

      websocket._readyState = WebSocket.CLOSING;
      websocket._receiver.end();
      this.end();
    }

    function socketOnError() {
      const websocket = this[kWebSocket];

      this.removeListener('error', socketOnError);
      this.on('error', NOOP);

      if (websocket) {
        websocket._readyState = WebSocket.CLOSING;
        this.destroy();
      }
    }

    function setCloseTimer(websocket) {
      websocket._closeTimer = setTimeout(
        websocket._socket.destroy.bind(websocket._socket),
        CLOSE_TIMEOUT
      );
    }

    function tlsConnect(options) {
      options.path = undefined;

      if (!options.servername && options.servername !== '') {
        options.servername = net.isIP(options.host) ? '' : options.host;
      }

      return tls.connect(options);
    }

    function netConnect(options) {
      options.path = options.socketPath;
      return net.connect(options);
    }
  }
});

var WebSocket = require_websocket();
var { Duplex } = require('stream');

function emitClose(stream) {
  stream.emit('close');
}

function duplexOnEnd() {
  if (!this.destroyed && this._writableState.finished) {
    this.destroy();
  }
}

function duplexOnError(err) {
  this.removeListener('error', duplexOnError);
  this.destroy();
  if (this.listenerCount('error') === 0) {
    this.emit('error', err);
  }
}

function createWebSocketStream(ws, options) {
  let terminateOnDestroy = true;

  const duplex = new Duplex({
    ...options,
    autoDestroy: false,
    emitClose: false,
    objectMode: false,
    writableObjectMode: false
  });

  ws.on('message', function message(msg, isBinary) {
    const data =
      !isBinary && duplex._readableState.objectMode ? msg.toString() : msg;

    if (!duplex.push(data)) ws.pause();
  });

  ws.once('error', function error(err) {
    if (duplex.destroyed) return;

    terminateOnDestroy = false;
    duplex.destroy(err);
  });

  ws.once('close', function close() {
    if (duplex.destroyed) return;

    duplex.push(null);
  });

  duplex._destroy = function (err, callback) {
    if (ws.readyState === ws.CLOSED) {
      callback(err);
      process.nextTick(emitClose, duplex);
      return;
    }

    let called = false;

    ws.once('error', function error(err) {
      called = true;
      callback(err);
    });

    ws.once('close', function close() {
      if (!called) callback(err);
      process.nextTick(emitClose, duplex);
    });

    if (terminateOnDestroy) ws.terminate();
  };

  duplex._final = function (callback) {
    if (ws.readyState === ws.CONNECTING) {
      ws.once('open', function open() {
        duplex._final(callback);
      });
      return;
    }

    if (ws._socket === null) return;

    if (ws._socket._writableState.finished) {
      callback();
      if (duplex._readableState.endEmitted) duplex.destroy();
    } else {
      ws._socket.once('finish', function finish() {
        callback();
      });
      ws.close();
    }
  };

  duplex._read = function () {
    if (ws.isPaused) ws.resume();
  };

  duplex._write = function (chunk, encoding, callback) {
    if (ws.readyState === ws.CONNECTING) {
      ws.once('open', function open() {
        duplex._write(chunk, encoding, callback);
      });
      return;
    }

    ws.send(chunk, callback);
  };

  duplex.on('end', duplexOnEnd);
  duplex.on('error', duplexOnError);
  return duplex;
}

module.exports = createWebSocketStream;
