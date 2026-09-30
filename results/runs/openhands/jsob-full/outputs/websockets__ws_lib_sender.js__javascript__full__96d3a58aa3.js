'use strict';

var randomPool;

const getOwnPropertyNames = Object.getOwnPropertyNames;
const createCommonJSModule = (callbacks, module) => function requireBundledModule() {
  if (!module) {
    module = { exports: {} };
    callbacks[getOwnPropertyNames(callbacks)[0]](module.exports, module);
  }
  return module.exports;
};

const requireConstants = createCommonJSModule({
  '../work/websockets__ws/lib/constants.js'(exports, module) {
    const BINARY_TYPES = ['nodebuffer', 'arraybuffer', 'fragments'];
    const hasBlob = typeof Blob !== 'undefined';

    if (hasBlob) BINARY_TYPES.push('blob');

    module.exports = {
      BINARY_TYPES,
      CLOSE_TIMEOUT: 30_000,
      EMPTY_BUFFER: Buffer.alloc(0),
      GUID: '258EAFA5-E914-47DA-95CA-C5AB0DC85B11',
      hasBlob,
      kForOnEventAttribute: Symbol('kIsForOnEventAttribute'),
      kListener: Symbol('kListener'),
      kStatusCode: Symbol('status-code'),
      kWebSocket: Symbol('websocket'),
      NOOP: () => {},
    };
  },
});

const requireBufferUtil = createCommonJSModule({
  '../work/websockets__ws/lib/buffer-util.js'(exports, module) {
    const { EMPTY_BUFFER } = requireConstants();
    const FastBuffer = Buffer[Symbol.species];

    function mask(source, maskBytes, output, offset, length) {
      for (let index = 0; index < length; index++) {
        output[offset + index] = source[index] ^ maskBytes[index & 3];
      }
    }

    function unmask(buffer, maskBytes) {
      for (let index = 0; index < buffer.length; index++) {
        buffer[index] ^= maskBytes[index & 3];
      }
    }

    const bufferUtil = {
      concat(buffers, totalLength) {
        if (buffers.length === 0) return EMPTY_BUFFER;
        if (buffers.length === 1) return buffers[0];

        const target = Buffer.allocUnsafe(totalLength);
        let offset = 0;

        for (const buffer of buffers) {
          target.set(buffer, offset);
          offset += buffer.length;
        }

        return offset < totalLength
          ? new FastBuffer(target.buffer, target.byteOffset, offset)
          : target;
      },

      mask,

      toArrayBuffer(buffer) {
        if (buffer.length === buffer.buffer.byteLength) return buffer.buffer;
        return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.length);
      },

      toBuffer(data) {
        bufferUtil.toBuffer.readOnly = true;

        if (Buffer.isBuffer(data)) return data;

        let buffer;
        if (data instanceof ArrayBuffer) {
          buffer = new FastBuffer(data);
        } else if (ArrayBuffer.isView(data)) {
          buffer = new FastBuffer(data.buffer, data.byteOffset, data.byteLength);
        } else {
          buffer = Buffer.from(data);
          bufferUtil.toBuffer.readOnly = false;
        }
        return buffer;
      },

      unmask,
    };

    module.exports = bufferUtil;

    if (!process.env.WS_NO_BUFFER_UTIL) {
      try {
        const bufferUtilExtension = require('bufferutil');

        module.exports.mask = function optimizedMask(source, maskBytes, output, offset, length) {
          if (length < 48) mask(source, maskBytes, output, offset, length);
          else bufferUtilExtension.mask(source, maskBytes, output, offset, length);
        };

        module.exports.unmask = function optimizedUnmask(buffer, maskBytes) {
          if (buffer.length < 32) unmask(buffer, maskBytes);
          else bufferUtilExtension.unmask(buffer, maskBytes);
        };
      } catch {}
    }
  },
});

const requireLimiter = createCommonJSModule({
  '../work/websockets__ws/lib/limiter.js'(exports, module) {
    const kDone = Symbol('kDone');
    const kRun = Symbol('kRun');

    module.exports = class Limiter {
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
    };
  },
});

const requirePerMessageDeflate = createCommonJSModule({
  '../work/websockets__ws/lib/permessage-deflate.js'(exports, module) {
    const zlib = require('zlib');
    const bufferUtil = requireBufferUtil();
    const Limiter = requireLimiter();
    const { kStatusCode } = requireConstants();
    const FastBuffer = Buffer[Symbol.species];
    const TRAILER = Buffer.from([0x00, 0x00, 0xff, 0xff]);
    const kPerMessageDeflate = Symbol('permessage-deflate');
    const kTotalLength = Symbol('total-length');
    const kCallback = Symbol('callback');
    const kBuffers = Symbol('buffers');
    const kError = Symbol('error');
    let zlibLimiter;

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
      } else {
        error[kStatusCode] = 1007;
        this[kCallback](error);
      }
    }

    module.exports = class PerMessageDeflate {
      constructor(options) {
        this._options = options || {};
        this._threshold =
          this._options.threshold !== undefined ? this._options.threshold : 1024;
        this._maxPayload = this._options.maxPayload | 0;
        this._isServer = Boolean(this._options.isServer);
        this._deflate = null;
        this._inflate = null;
        this.params = null;

        if (!zlibLimiter) {
          const concurrency =
            this._options.concurrencyLimit !== undefined
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

      acceptAsServer(configurations) {
        const options = this._options;
        const accepted = configurations.find((params) => !(
          options.serverNoContextTakeover === false &&
            params.server_no_context_takeover ||
          params.server_max_window_bits &&
            (options.serverMaxWindowBits === false ||
              typeof options.serverMaxWindowBits === 'number' &&
                options.serverMaxWindowBits > params.server_max_window_bits) ||
          typeof options.clientMaxWindowBits === 'number' &&
            !params.client_max_window_bits
        ));

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

      acceptAsClient(configurations) {
        const params = configurations[0];

        if (
          this._options.clientNoContextTakeover === false &&
          params.client_no_context_takeover
        ) {
          throw new Error('Unexpected parameter "client_no_context_takeover"');
        }

        if (params.client_max_window_bits) {
          if (
            this._options.clientMaxWindowBits === false ||
            typeof this._options.clientMaxWindowBits === 'number' &&
              params.client_max_window_bits > this._options.clientMaxWindowBits
          ) {
            throw new Error('Unexpected or invalid parameter "client_max_window_bits"');
          }
        } else if (typeof this._options.clientMaxWindowBits === 'number') {
          params.client_max_window_bits = this._options.clientMaxWindowBits;
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
                const windowBits = +value;
                if (!Number.isInteger(windowBits) || windowBits < 8 || windowBits > 15) {
                  throw new TypeError(`Invalid value for parameter "${key}": ${value}`);
                }
                value = windowBits;
              } else if (!this._isServer) {
                throw new TypeError(`Invalid value for parameter "${key}": ${value}`);
              }
            } else if (key === 'server_max_window_bits') {
              const windowBits = +value;
              if (!Number.isInteger(windowBits) || windowBits < 8 || windowBits > 15) {
                throw new TypeError(`Invalid value for parameter "${key}": ${value}`);
              }
              value = windowBits;
            } else {
              if (key !== 'client_no_context_takeover' && key !== 'server_no_context_takeover') {
                throw new Error(`Unknown parameter "${key}"`);
              }
              if (value !== true) {
                throw new TypeError(`Invalid value for parameter "${key}": ${value}`);
              }
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
          const windowBitsKey = `${endpoint}_max_window_bits`;
          const windowBits =
            typeof this.params[windowBitsKey] !== 'number'
              ? zlib.Z_DEFAULT_WINDOWBITS
              : this.params[windowBitsKey];

          this._inflate = zlib.createInflateRaw({
            ...this._options.zlibInflateOptions,
            windowBits,
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
          const error = this._inflate[kError];
          if (error) {
            this._inflate.close();
            this._inflate = null;
            callback(error);
            return;
          }

          const result = bufferUtil.concat(
            this._inflate[kBuffers],
            this._inflate[kTotalLength],
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

          callback(null, result);
        });
      }

      _compress(data, fin, callback) {
        const endpoint = this._isServer ? 'server' : 'client';

        if (!this._deflate) {
          const windowBitsKey = `${endpoint}_max_window_bits`;
          const windowBits =
            typeof this.params[windowBitsKey] !== 'number'
              ? zlib.Z_DEFAULT_WINDOWBITS
              : this.params[windowBitsKey];

          this._deflate = zlib.createDeflateRaw({
            ...this._options.zlibDeflateOptions,
            windowBits,
          });
          this._deflate[kTotalLength] = 0;
          this._deflate[kBuffers] = [];
          this._deflate.on('data', deflateOnData);
        }

        this._deflate[kCallback] = callback;
        this._deflate.write(data);
        this._deflate.flush(zlib.Z_SYNC_FLUSH, () => {
          if (!this._deflate) return;

          let result = bufferUtil.concat(
            this._deflate[kBuffers],
            this._deflate[kTotalLength],
          );
          if (fin) {
            result = new FastBuffer(
              result.buffer,
              result.byteOffset,
              result.length - 4,
            );
          }

          this._deflate[kCallback] = null;
          this._deflate[kTotalLength] = 0;
          this._deflate[kBuffers] = [];
          if (fin && this.params[`${endpoint}_no_context_takeover`]) {
            this._deflate.reset();
          }

          callback(null, result);
        });
      }
    };
  },
});

const requireValidation = createCommonJSModule({
  '../work/websockets__ws/lib/validation.js'(exports, module) {
    const { isUtf8 } = require('buffer');
    const { hasBlob } = requireConstants();

    function isValidUTF8(buffer) {
      const length = buffer.length;
      let index = 0;

      while (index < length) {
        if ((buffer[index] & 0x80) === 0) {
          index++;
        } else if ((buffer[index] & 0xe0) === 0xc0) {
          if (
            index + 1 === length ||
            (buffer[index + 1] & 0xc0) !== 0x80 ||
            (buffer[index] & 0xfe) === 0xc0
          ) {
            return false;
          }
          index += 2;
        } else if ((buffer[index] & 0xf0) === 0xe0) {
          if (
            index + 2 >= length ||
            (buffer[index + 1] & 0xc0) !== 0x80 ||
            (buffer[index + 2] & 0xc0) !== 0x80 ||
            buffer[index] === 0xe0 && (buffer[index + 1] & 0xe0) === 0x80 ||
            buffer[index] === 0xed && (buffer[index + 1] & 0xe0) === 0xa0
          ) {
            return false;
          }
          index += 3;
        } else {
          if ((buffer[index] & 0xf8) !== 0xf0) return false;
          if (
            index + 3 >= length ||
            (buffer[index + 1] & 0xc0) !== 0x80 ||
            (buffer[index + 2] & 0xc0) !== 0x80 ||
            (buffer[index + 3] & 0xc0) !== 0x80 ||
            buffer[index] === 0xf0 && (buffer[index + 1] & 0xf0) === 0x80 ||
            buffer[index] === 0xf4 && buffer[index + 1] > 0x8f ||
            buffer[index] > 0xf4
          ) {
            return false;
          }
          index += 4;
        }
      }

      return true;
    }

    const validation = {
      isBlob(value) {
        return hasBlob &&
          typeof value === 'object' &&
          typeof value.arrayBuffer === 'function' &&
          typeof value.type === 'string' &&
          typeof value.stream === 'function' &&
          (value[Symbol.toStringTag] === 'Blob' || value[Symbol.toStringTag] === 'File');
      },

      isValidStatusCode(code) {
        return code >= 1000 && code <= 1014 &&
          code !== 1004 && code !== 1005 && code !== 1006 ||
          code >= 3000 && code <= 4999;
      },

      isValidUTF8,

      tokenChars: [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0,
        0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0,
      ],
    };

    module.exports = validation;

    if (isUtf8) {
      module.exports.isValidUTF8 = function validateUTF8(buffer) {
        return buffer.length < 24 ? isValidUTF8(buffer) : isUtf8(buffer);
      };
    } else if (!process.env.WS_NO_UTF_8_VALIDATE) {
      try {
        const utf8Validate = require('utf-8-validate');
        module.exports.isValidUTF8 = function validateUTF8(buffer) {
          return buffer.length < 32 ? isValidUTF8(buffer) : utf8Validate(buffer);
        };
      } catch {}
    }
  },
});

const { Duplex } = require('stream');
const { randomFillSync } = require('crypto');
const { types: { isUint8Array } } = require('util');
const PerMessageDeflate = requirePerMessageDeflate();
const { EMPTY_BUFFER, kWebSocket, NOOP } = requireConstants();
const { isBlob, isValidStatusCode } = requireValidation();
const { mask: applyMask, toBuffer } = requireBufferUtil();
const kByteLength = Symbol('kByteLength');
const maskBuffer = Buffer.alloc(4);
const RANDOM_POOL_SIZE = 8192;
const DEFAULT = 0;
const DEFLATING = 1;
const GET_BLOB_DATA = 2;
let randomPoolPointer = RANDOM_POOL_SIZE;

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
    let mask;
    let dataLength;
    let merge = false;
    let offset = 2;
    let skipMasking = false;

    if (options.mask) {
      mask = options.maskBuffer || maskBuffer;
      if (options.generateMask) {
        options.generateMask(mask);
      } else {
        if (randomPoolPointer === RANDOM_POOL_SIZE) {
          if (randomPool === undefined) randomPool = Buffer.alloc(RANDOM_POOL_SIZE);
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

    if (typeof data === 'string') {
      if (options.mask && !skipMasking || options[kByteLength] === undefined) {
        data = Buffer.from(data);
        dataLength = data.length;
      } else {
        dataLength = options[kByteLength];
      }
    } else {
      dataLength = data.length;
      merge = options.mask && options.readOnly && !skipMasking;
    }

    let payloadLength = dataLength;
    if (dataLength >= 65536) {
      offset += 8;
      payloadLength = 127;
    } else if (dataLength > 125) {
      offset += 2;
      payloadLength = 126;
    }

    const target = Buffer.allocUnsafe(merge ? dataLength + offset : offset);
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
    if (merge) {
      applyMask(data, mask, target, offset, dataLength);
      return [target];
    }

    applyMask(data, mask, data, 0, dataLength);
    return [target, data];
  }

  close(code, data, mask, callback) {
    let buffer;

    if (code === undefined) {
      buffer = EMPTY_BUFFER;
    } else {
      if (typeof code !== 'number' || !isValidStatusCode(code)) {
        throw new TypeError('First argument must be a valid error code number');
      }

      if (data !== undefined && data.length) {
        const length = Buffer.byteLength(data);
        if (length > 123) {
          throw new RangeError('The message must not be greater than 123 bytes');
        }

        buffer = Buffer.allocUnsafe(2 + length);
        buffer.writeUInt16BE(code, 0);
        if (typeof data === 'string') {
          buffer.write(data, 2);
        } else {
          if (!isUint8Array(data)) {
            throw new TypeError('Second argument must be a string or a Uint8Array');
          }
          buffer.set(data, 2);
        }
      } else {
        buffer = Buffer.allocUnsafe(2);
        buffer.writeUInt16BE(code, 0);
      }
    }

    const options = {
      [kByteLength]: buffer.length,
      fin: true,
      generateMask: this._generateMask,
      mask,
      maskBuffer: this._maskBuffer,
      opcode: 0x08,
      readOnly: false,
      rsv1: false,
    };

    if (this._state !== DEFAULT) {
      this.enqueue([this.dispatch, buffer, false, options, callback]);
    } else {
      this.sendFrame(Sender.frame(buffer, options), callback);
    }
  }

  ping(data, mask, callback) {
    let byteLength;
    let readOnly;

    if (typeof data === 'string') {
      byteLength = Buffer.byteLength(data);
      readOnly = false;
    } else if (isBlob(data)) {
      byteLength = data.size;
      readOnly = false;
    } else {
      data = toBuffer(data);
      byteLength = data.length;
      readOnly = toBuffer.readOnly;
    }

    if (byteLength > 125) {
      throw new RangeError('The data size must not be greater than 125 bytes');
    }

    const options = {
      [kByteLength]: byteLength,
      fin: true,
      generateMask: this._generateMask,
      mask,
      maskBuffer: this._maskBuffer,
      opcode: 0x09,
      readOnly,
      rsv1: false,
    };

    if (isBlob(data)) {
      if (this._state !== DEFAULT) {
        this.enqueue([this.getBlobData, data, false, options, callback]);
      } else {
        this.getBlobData(data, false, options, callback);
      }
    } else if (this._state !== DEFAULT) {
      this.enqueue([this.dispatch, data, false, options, callback]);
    } else {
      this.sendFrame(Sender.frame(data, options), callback);
    }
  }

  pong(data, mask, callback) {
    let byteLength;
    let readOnly;

    if (typeof data === 'string') {
      byteLength = Buffer.byteLength(data);
      readOnly = false;
    } else if (isBlob(data)) {
      byteLength = data.size;
      readOnly = false;
    } else {
      data = toBuffer(data);
      byteLength = data.length;
      readOnly = toBuffer.readOnly;
    }

    if (byteLength > 125) {
      throw new RangeError('The data size must not be greater than 125 bytes');
    }

    const options = {
      [kByteLength]: byteLength,
      fin: true,
      generateMask: this._generateMask,
      mask,
      maskBuffer: this._maskBuffer,
      opcode: 0x0a,
      readOnly,
      rsv1: false,
    };

    if (isBlob(data)) {
      if (this._state !== DEFAULT) {
        this.enqueue([this.getBlobData, data, false, options, callback]);
      } else {
        this.getBlobData(data, false, options, callback);
      }
    } else if (this._state !== DEFAULT) {
      this.enqueue([this.dispatch, data, false, options, callback]);
    } else {
      this.sendFrame(Sender.frame(data, options), callback);
    }
  }

  send(data, options, callback) {
    const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];
    let byteLength;
    let readOnly;
    let opcode = options.binary ? 0x02 : 0x01;
    let rsv1 = options.compress;

    if (typeof data === 'string') {
      byteLength = Buffer.byteLength(data);
      readOnly = false;
    } else if (isBlob(data)) {
      byteLength = data.size;
      readOnly = false;
    } else {
      data = toBuffer(data);
      byteLength = data.length;
      readOnly = toBuffer.readOnly;
    }

    if (this._firstFragment) {
      this._firstFragment = false;
      if (
        rsv1 &&
        perMessageDeflate &&
        perMessageDeflate.params[
          perMessageDeflate._isServer
            ? 'server_no_context_takeover'
            : 'client_no_context_takeover'
        ]
      ) {
        rsv1 = byteLength >= perMessageDeflate._threshold;
      }
      this._compress = rsv1;
    } else {
      rsv1 = false;
      opcode = 0;
    }

    if (options.fin) this._firstFragment = true;

    const frameOptions = {
      [kByteLength]: byteLength,
      fin: options.fin,
      generateMask: this._generateMask,
      mask: options.mask,
      maskBuffer: this._maskBuffer,
      opcode,
      readOnly,
      rsv1,
    };

    if (isBlob(data)) {
      if (this._state !== DEFAULT) {
        this.enqueue([this.getBlobData, data, this._compress, frameOptions, callback]);
      } else {
        this.getBlobData(data, this._compress, frameOptions, callback);
      }
    } else if (this._state !== DEFAULT) {
      this.enqueue([this.dispatch, data, this._compress, frameOptions, callback]);
    } else {
      this.dispatch(data, this._compress, frameOptions, callback);
    }
  }

  getBlobData(blob, compress, options, callback) {
    this._bufferedBytes += options[kByteLength];
    this._state = GET_BLOB_DATA;

    blob.arrayBuffer().then((arrayBuffer) => {
      if (this._socket.destroyed) {
        const error = new Error('The socket was closed while the blob was being read');
        process.nextTick(callCallbacks, this, error, callback);
        return;
      }

      this._bufferedBytes -= options[kByteLength];
      const data = toBuffer(arrayBuffer);
      if (compress) {
        this.dispatch(data, compress, options, callback);
      } else {
        this._state = DEFAULT;
        this.sendFrame(Sender.frame(data, options), callback);
        this.dequeue();
      }
    }).catch((error) => {
      process.nextTick(onError, this, error, callback);
    });
  }

  dispatch(data, compress, options, callback) {
    if (!compress) {
      this.sendFrame(Sender.frame(data, options), callback);
      return;
    }

    const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];
    this._bufferedBytes += options[kByteLength];
    this._state = DEFLATING;

    perMessageDeflate.compress(data, options.fin, (error, compressedData) => {
      if (this._socket.destroyed) {
        callCallbacks(
          this,
          new Error('The socket was closed while data was being compressed'),
          callback,
        );
        return;
      }

      this._bufferedBytes -= options[kByteLength];
      this._state = DEFAULT;
      options.readOnly = false;
      this.sendFrame(Sender.frame(compressedData, options), callback);
      this.dequeue();
    });
  }

  dequeue() {
    while (this._state === DEFAULT && this._queue.length) {
      const params = this._queue.shift();
      this._bufferedBytes -= params[3][kByteLength];
      Reflect.apply(params[0], this, params.slice(1));
    }
  }

  enqueue(params) {
    this._bufferedBytes += params[3][kByteLength];
    this._queue.push(params);
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
}

function callCallbacks(sender, error, callback) {
  if (typeof callback === 'function') callback(error);

  for (const params of sender._queue) {
    const queuedCallback = params[params.length - 1];
    if (typeof queuedCallback === 'function') queuedCallback(error);
  }
}

function onError(sender, error, callback) {
  callCallbacks(sender, error, callback);
  sender.onerror(error);
}

module.exports = Sender;
