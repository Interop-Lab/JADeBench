'use strict';
const getOwnPropertyNames = Object.getOwnPropertyNames;
const createCommonJSModule = (moduleDefinitions, cachedModule) => function requireModule() {
  if (!cachedModule) {
    const module = { exports: {} };
    const initializeModule = moduleDefinitions[getOwnPropertyNames(moduleDefinitions)[0]];
    initializeModule(module.exports, module);
    cachedModule = module;
  }

  return cachedModule.exports;
};
var requireConstants = createCommonJSModule({
  '../work/websockets__ws/lib/constants.js'(exports, module) {
    var binaryTypes = [
      'nodebuffer',
      'arraybuffer',
      'fragments'
    ];
    var hasBlob = typeof Blob !== 'undefined';
    if (hasBlob) {
      binaryTypes.push('blob');
    }
    module.exports = {
      BINARY_TYPES: binaryTypes,
      CLOSE_TIMEOUT: 30000,
      EMPTY_BUFFER: Buffer.alloc(0),
      GUID: '258EAFA5-E914-47DA-95CA-C5AB0DC85B11',
      hasBlob,
      kForOnEventAttribute: Symbol('kIsForOnEventAttribute'),
      kListener: Symbol('kListener'),
      kStatusCode: Symbol('status-code'),
      kWebSocket: Symbol('websocket'),
      NOOP: () => {
      }
    };
  }
});
var requireBufferUtil = createCommonJSModule({
  '../work/websockets__ws/lib/buffer-util.js'(exports, module) {
    var {EMPTY_BUFFER} = requireConstants();
    var BufferSpecies = Buffer[Symbol.species];
    function concat(buffers, totalLength) {
      if (buffers.length === 0) {
        return EMPTY_BUFFER;
      }
      if (buffers.length === 1) {
        return buffers[0];
      }
      const target = Buffer.allocUnsafe(totalLength);
      let offset = 0;
      for (let index = 0; index < buffers.length; index++) {
        const buffer = buffers[index];
        target.set(buffer, offset);
        offset += buffer.length;
      }
      if (offset < totalLength) {
        return new BufferSpecies(target.buffer, target.byteOffset, offset);
      }
      return target;
    }
    function maskFallback(source, mask, output, offset, length) {
      for (let index = 0; index < length; index++) {
        output[offset + index] = source[index] ^ mask[index & 3];
      }
    }
    function unmaskFallback(buffer, mask) {
      for (let index = 0; index < buffer.length; index++) {
        buffer[index] ^= mask[index & 3];
      }
    }
    function toArrayBuffer(buffer) {
      if (buffer.length === buffer.buffer.byteLength) {
        return buffer.buffer;
      }
      return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.length);
    }
    function toBuffer(data) {
      toBuffer.readOnly = true;
      if (Buffer.isBuffer(data)) {
        return data;
      }
      let buffer;
      if (data instanceof ArrayBuffer) {
        buffer = new BufferSpecies(data);
      } else if (ArrayBuffer.isView(data)) {
        buffer = new BufferSpecies(data.buffer, data.byteOffset, data.byteLength);
      } else {
        buffer = Buffer.from(data);
        toBuffer.readOnly = false;
      }
      return buffer;
    }
    const bufferUtil = {};
    bufferUtil.concat = concat;
    bufferUtil.mask = maskFallback;
    bufferUtil.toArrayBuffer = toArrayBuffer;
    bufferUtil.toBuffer = toBuffer;
    bufferUtil.unmask = unmaskFallback;
    module.exports = bufferUtil;
    if (!process.env.WS_NO_BUFFER_UTIL) {
      try {
        const nativeBufferUtil = require('bufferutil');
        module.exports.mask = function (source, mask, output, offset, length) {
          if (length < 48) {
            maskFallback(source, mask, output, offset, length);
          } else {
            nativeBufferUtil.mask(source, mask, output, offset, length);
          }
        };
        module.exports.unmask = function (buffer, mask) {
          if (buffer.length < 32) {
            unmaskFallback(buffer, mask);
          } else {
            nativeBufferUtil.unmask(buffer, mask);
          }
        };
      } catch {}
    }
  }
});
var requireLimiter = createCommonJSModule({
  '../work/websockets__ws/lib/limiter.js'(exports, module) {
    var kDone = Symbol('kDone');
    var kRun = Symbol('kRun');
    var Limiter = class {
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
        if (this.pending === this.concurrency) {
          return;
        }
        if (this.jobs.length) {
          const job = this.jobs.shift();
          this.pending++;
          job(this[kDone]);
        }
      }
    };
    module.exports = Limiter;
  }
});
var requirePerMessageDeflate = createCommonJSModule({
  '../work/websockets__ws/lib/permessage-deflate.js'(exports, module) {
    var zlib = require('zlib');
    var bufferUtil = requireBufferUtil();
    var Limiter = requireLimiter();
    var {kStatusCode} = requireConstants();
    var BufferSpecies = Buffer[Symbol.species];
    var TRAILER = Buffer.from([
      0,
      0,
      255,
      255
    ]);
    var kPerMessageDeflate = Symbol('permessage-deflate');
    var kTotalLength = Symbol('total-length');
    var kCallback = Symbol('callback');
    var kBuffers = Symbol('buffers');
    var kError = Symbol('error');
    var zlibLimiter;
    var PerMessageDeflate = class {
      constructor(options) {
        this._options = options || {};
        this._threshold = this._options.threshold !== undefined ? this._options.threshold : 1024;
        this._maxPayload = this._options.maxPayload | 0;
        this._isServer = !!this._options.isServer;
        this._deflate = null;
        this._inflate = null;
        this.params = null;
        if (!zlibLimiter) {
          const concurrencyLimit = this._options.concurrencyLimit !== undefined ? this._options.concurrencyLimit : 10;
          zlibLimiter = new Limiter(concurrencyLimit);
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
      accept(offers) {
        offers = this.normalizeParams(offers);
        this.params = this._isServer ? this.acceptAsServer(offers) : this.acceptAsClient(offers);
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
      acceptAsServer(offers) {
        const options = this._options;
        const acceptedOffer = offers.find((offer) => {
          const rejectsServerContextTakeover =
            options.serverNoContextTakeover === false && offer.server_no_context_takeover;
          const rejectsServerWindowBits =
            offer.server_max_window_bits &&
            (options.serverMaxWindowBits === false ||
              (typeof options.serverMaxWindowBits === 'number' &&
                options.serverMaxWindowBits > offer.server_max_window_bits));
          const requiresClientWindowBits =
            typeof options.clientMaxWindowBits === 'number' && !offer.client_max_window_bits;

          return !(
            rejectsServerContextTakeover ||
            rejectsServerWindowBits ||
            requiresClientWindowBits
          );
        });
        if (!acceptedOffer) {
          throw new Error('None of the extension offers can be accepted');
        }
        if (options.serverNoContextTakeover) {
          acceptedOffer.server_no_context_takeover = true;
        }
        if (options.clientNoContextTakeover) {
          acceptedOffer.client_no_context_takeover = true;
        }
        if (typeof options.serverMaxWindowBits === 'number') {
          acceptedOffer.server_max_window_bits = options.serverMaxWindowBits;
        }
        if (typeof options.clientMaxWindowBits === 'number') {
          acceptedOffer.client_max_window_bits = options.clientMaxWindowBits;
        } else if (acceptedOffer.client_max_window_bits === true || options.clientMaxWindowBits === false) {
          delete acceptedOffer.client_max_window_bits;
        }
        return acceptedOffer;
      }
      acceptAsClient(responseOffers) {
        const params = responseOffers[0];
        if (this._options.clientNoContextTakeover === false && params.client_no_context_takeover) {
          throw new Error('Unexpected parameter "client_no_context_takeover"');
        }
        if (!params.client_max_window_bits) {
          if (typeof this._options.clientMaxWindowBits === 'number') {
            params.client_max_window_bits = this._options.clientMaxWindowBits;
          }
        } else if (this._options.clientMaxWindowBits === false || typeof this._options.clientMaxWindowBits === 'number' && params.client_max_window_bits > this._options.clientMaxWindowBits) {
          throw new Error('Unexpected or invalid parameter "client_max_window_bits"');
        }
        return params;
      }
      normalizeParams(offers) {
        offers.forEach(params => {
          Object.keys(params).forEach(name => {
            let value = params[name];
            if (value.length > 1) {
              throw new Error('Parameter "' + name + '" must have only a single value');
            }
            value = value[0];
            if (name === 'client_max_window_bits') {
              if (value !== true) {
                const clientMaxWindowBits = +value;
                if (!Number.isInteger(clientMaxWindowBits) || clientMaxWindowBits < 8 || clientMaxWindowBits > 15) {
                  throw new TypeError('Invalid value for parameter "' + name + '": ' + value);
                }
                value = clientMaxWindowBits;
              } else if (!this._isServer) {
                throw new TypeError('Invalid value for parameter "' + name + '": ' + value);
              }
            } else if (name === 'server_max_window_bits') {
              const serverMaxWindowBits = +value;
              if (!Number.isInteger(serverMaxWindowBits) || serverMaxWindowBits < 8 || serverMaxWindowBits > 15) {
                throw new TypeError('Invalid value for parameter "' + name + '": ' + value);
              }
              value = serverMaxWindowBits;
            } else if (name === 'client_no_context_takeover' || name === 'server_no_context_takeover') {
              if (value !== true) {
                throw new TypeError('Invalid value for parameter "' + name + '": ' + value);
              }
            } else {
              throw new Error('Unknown parameter "' + name + '"');
            }
            params[name] = value;
          });
        });
        return offers;
      }
      decompress(data, fin, callback) {
        zlibLimiter.add(done => {
          this._decompress(data, fin, (error, result) => {
            done();
            callback(error, result);
          });
        });
      }
      compress(data, fin, callback) {
        zlibLimiter.add(done => {
          this._compress(data, fin, (error, result) => {
            done();
            callback(error, result);
          });
        });
      }
      _decompress(data, fin, callback) {
        const endpoint = this._isServer ? 'client' : 'server';
        if (!this._inflate) {
          const windowBitsKey = endpoint + '_max_window_bits';
          const windowBits = typeof this.params[windowBitsKey] !== 'number' ? zlib.Z_DEFAULT_WINDOWBITS : this.params[windowBitsKey];
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
        if (fin) {
          this._inflate.write(TRAILER);
        }
        this._inflate.flush(() => {
          const error = this._inflate[kError];
          if (error) {
            this._inflate.close();
            this._inflate = null;
            callback(error);
            return;
          }
          const result = bufferUtil.concat(this._inflate[kBuffers], this._inflate[kTotalLength]);
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
          callback(null, result);
        });
      }
      _compress(data, fin, callback) {
        const endpoint = this._isServer ? 'server' : 'client';
        if (!this._deflate) {
          const windowBitsKey = endpoint + '_max_window_bits';
          const windowBits = typeof this.params[windowBitsKey] !== 'number' ? zlib.Z_DEFAULT_WINDOWBITS : this.params[windowBitsKey];
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
          if (!this._deflate) {
            return;
          }
          let result = bufferUtil.concat(this._deflate[kBuffers], this._deflate[kTotalLength]);
          if (fin) {
            result = new BufferSpecies(result.buffer, result.byteOffset, result.length - 4);
          }
          this._deflate[kCallback] = null;
          this._deflate[kTotalLength] = 0;
          this._deflate[kBuffers] = [];
          if (fin && this.params[endpoint + '_no_context_takeover']) {
            this._deflate.reset();
          }
          callback(null, result);
        });
      }
    };
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
  }
});
var requireValidation = createCommonJSModule({
  '../work/websockets__ws/lib/validation.js'(exports, module) {
    var {isUtf8: bufferIsUtf8} = require('buffer');
    var {hasBlob} = requireConstants();
    // ASCII token-character lookup table.
    var tokenChars = [
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
      return code >= 1000 && code <= 1014 && code !== 1004 && code !== 1005 && code !== 1006 || code >= 3000 && code <= 4999;
    }
    function isValidUTF8Fallback(buffer) {
      const length = buffer.length;
      let index = 0;
      while (index < length) {
        if ((buffer[index] & 128) === 0) {
          index++;
        } else if ((buffer[index] & 224) === 192) {
          if (index + 1 === length || (buffer[index + 1] & 192) !== 128 || (buffer[index] & 254) === 192) {
            return false;
          }
          index += 2;
        } else if ((buffer[index] & 240) === 224) {
          if (index + 2 >= length || (buffer[index + 1] & 192) !== 128 || (buffer[index + 2] & 192) !== 128 || buffer[index] === 224 && (buffer[index + 1] & 224) === 128 || buffer[index] === 237 && (buffer[index + 1] & 224) === 160) {
            return false;
          }
          index += 3;
        } else if ((buffer[index] & 248) === 240) {
          if (index + 3 >= length || (buffer[index + 1] & 192) !== 128 || (buffer[index + 2] & 192) !== 128 || (buffer[index + 3] & 192) !== 128 || buffer[index] === 240 && (buffer[index + 1] & 240) === 128 || buffer[index] === 244 && buffer[index + 1] > 143 || buffer[index] > 244) {
            return false;
          }
          index += 4;
        } else {
          return false;
        }
      }
      return true;
    }
    function isBlob(value) {
      return hasBlob && typeof value === 'object' && typeof value.arrayBuffer === 'function' && typeof value.type === 'string' && typeof value.stream === 'function' && (value[Symbol.toStringTag] === 'Blob' || value[Symbol.toStringTag] === 'File');
    }
    const validation = {};
    validation.isBlob = isBlob;
    validation.isValidStatusCode = isValidStatusCode;
    validation.isValidUTF8 = isValidUTF8Fallback;
    validation.tokenChars = tokenChars;
    module.exports = validation;
    if (bufferIsUtf8) {
      module.exports.isValidUTF8 = function (buffer) {
        return buffer.length < 24 ? isValidUTF8Fallback(buffer) : bufferIsUtf8(buffer);
      };
    } else if (!process.env.WS_NO_UTF_8_VALIDATE) {
      try {
        const utf8Validate = require('utf-8-validate');
        module.exports.isValidUTF8 = function (buffer) {
          return buffer.length < 32 ? isValidUTF8Fallback(buffer) : utf8Validate(buffer);
        };
      } catch {}
    }
  }
});
var {Writable} = require('stream');
var PerMessageDeflate = requirePerMessageDeflate();
var {BINARY_TYPES, EMPTY_BUFFER, kStatusCode, kWebSocket} = requireConstants();
var {concat, toArrayBuffer, unmask} = requireBufferUtil();
var {isValidStatusCode, isValidUTF8} = requireValidation();
var BufferSpecies = Buffer[Symbol.species];
var GET_INFO = 0;
var GET_PAYLOAD_LENGTH_16 = 1;
var GET_PAYLOAD_LENGTH_64 = 2;
var GET_MASK = 3;
var GET_DATA = 4;
var INFLATING = 5;
var DEFER_EVENT = 6;
var Receiver = class extends Writable {
  constructor(options = {}) {
    super();
    this._allowSynchronousEvents = options.allowSynchronousEvents !== undefined ? options.allowSynchronousEvents : true;
    this._binaryType = options.binaryType || BINARY_TYPES[0];
    this._extensions = options.extensions || {};
    this._isServer = !!options.isServer;
    this._maxBufferedChunks = options.maxBufferedChunks | 0;
    this._maxFragments = options.maxFragments | 0;
    this._maxPayload = options.maxPayload | 0;
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
    this._numFragments = 0;
    this._fragments = [];
    this._errored = false;
    this._loop = false;
    this._state = GET_INFO;
  }
  _write(chunk, encoding, callback) {
    if (this._opcode === 8 && this._state == GET_INFO) {
      return callback();
    }
    if (this._maxBufferedChunks > 0 && this._buffers.length >= this._maxBufferedChunks) {
      callback(this.createError(RangeError, 'Too many buffered chunks', false, 1008, 'WS_ERR_TOO_MANY_BUFFERED_PARTS'));
      return;
    }
    this._bufferedBytes += chunk.length;
    this._buffers.push(chunk);
    this.startLoop(callback);
  }
  consume(byteCount) {
    this._bufferedBytes -= byteCount;
    if (byteCount === this._buffers[0].length) {
      return this._buffers.shift();
    }
    if (byteCount < this._buffers[0].length) {
      const firstBuffer = this._buffers[0];
      this._buffers[0] = new BufferSpecies(firstBuffer.buffer, firstBuffer.byteOffset + byteCount, firstBuffer.length - byteCount);
      return new BufferSpecies(firstBuffer.buffer, firstBuffer.byteOffset, byteCount);
    }
    const outputBuffer = Buffer.allocUnsafe(byteCount);
    do {
      const sourceBuffer = this._buffers[0];
      const outputOffset = outputBuffer.length - byteCount;
      if (byteCount >= sourceBuffer.length) {
        outputBuffer.set(this._buffers.shift(), outputOffset);
      } else {
        outputBuffer.set(new Uint8Array(sourceBuffer.buffer, sourceBuffer.byteOffset, byteCount), outputOffset);
        this._buffers[0] = new BufferSpecies(sourceBuffer.buffer, sourceBuffer.byteOffset + byteCount, sourceBuffer.length - byteCount);
      }
      byteCount -= sourceBuffer.length;
    } while (byteCount > 0);
    return outputBuffer;
  }
  startLoop(callback) {
    this._loop = true;
    do {
      switch (this._state) {
      case GET_INFO:
        this.getInfo(callback);
        break;
      case GET_PAYLOAD_LENGTH_16:
        this.getPayloadLength16(callback);
        break;
      case GET_PAYLOAD_LENGTH_64:
        this.getPayloadLength64(callback);
        break;
      case GET_MASK:
        this.getMask();
        break;
      case GET_DATA:
        this.getData(callback);
        break;
      case INFLATING:
      case DEFER_EVENT:
        this._loop = false;
        return;
      }
    } while (this._loop);
    if (!this._errored) {
      callback();
    }
  }
  getInfo(callback) {
    if (this._bufferedBytes < 2) {
      this._loop = false;
      return;
    }
    const frameHeader = this.consume(2);
    if ((frameHeader[0] & 48) !== 0) {
      const error = this.createError(RangeError, 'RSV2 and RSV3 must be clear', true, 1002, 'WS_ERR_UNEXPECTED_RSV_2_3');
      callback(error);
      return;
    }
    const rsv1Set = (frameHeader[0] & 64) === 64;
    if (rsv1Set && !this._extensions[PerMessageDeflate.extensionName]) {
      const error = this.createError(RangeError, 'RSV1 must be clear', true, 1002, 'WS_ERR_UNEXPECTED_RSV_1');
      callback(error);
      return;
    }
    this._fin = (frameHeader[0] & 128) === 128;
    this._opcode = frameHeader[0] & 15;
    this._payloadLength = frameHeader[1] & 127;
    if (this._opcode === 0) {
      if (rsv1Set) {
        const error = this.createError(RangeError, 'RSV1 must be clear', true, 1002, 'WS_ERR_UNEXPECTED_RSV_1');
        callback(error);
        return;
      }
      if (!this._fragmented) {
        const error = this.createError(RangeError, 'invalid opcode 0', true, 1002, 'WS_ERR_INVALID_OPCODE');
        callback(error);
        return;
      }
      this._opcode = this._fragmented;
    } else if (this._opcode === 1 || this._opcode === 2) {
      if (this._fragmented) {
        const error = this.createError(RangeError, 'invalid opcode ' + this._opcode, true, 1002, 'WS_ERR_INVALID_OPCODE');
        callback(error);
        return;
      }
      this._compressed = rsv1Set;
    } else if (this._opcode > 7 && this._opcode < 11) {
      if (!this._fin) {
        const error = this.createError(RangeError, 'FIN must be set', true, 1002, 'WS_ERR_EXPECTED_FIN');
        callback(error);
        return;
      }
      if (rsv1Set) {
        const error = this.createError(RangeError, 'RSV1 must be clear', true, 1002, 'WS_ERR_UNEXPECTED_RSV_1');
        callback(error);
        return;
      }
      if (this._payloadLength > 125 || this._opcode === 8 && this._payloadLength === 1) {
        const error = this.createError(RangeError, 'invalid payload length ' + this._payloadLength, true, 1002, 'WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH');
        callback(error);
        return;
      }
    } else {
      const error = this.createError(RangeError, 'invalid opcode ' + this._opcode, true, 1002, 'WS_ERR_INVALID_OPCODE');
      callback(error);
      return;
    }
    if (!this._fin && !this._fragmented) {
      this._fragmented = this._opcode;
    }
    this._masked = (frameHeader[1] & 128) === 128;
    if (this._isServer) {
      if (!this._masked) {
        const error = this.createError(RangeError, 'MASK must be set', true, 1002, 'WS_ERR_EXPECTED_MASK');
        callback(error);
        return;
      }
    } else if (this._masked) {
      const error = this.createError(RangeError, 'MASK must be clear', true, 1002, 'WS_ERR_UNEXPECTED_MASK');
      callback(error);
      return;
    }
    if (this._payloadLength === 126) {
      this._state = GET_PAYLOAD_LENGTH_16;
    } else if (this._payloadLength === 127) {
      this._state = GET_PAYLOAD_LENGTH_64;
    } else {
      this.haveLength(callback);
    }
  }
  getPayloadLength16(callback) {
    if (this._bufferedBytes < 2) {
      this._loop = false;
      return;
    }
    this._payloadLength = this.consume(2).readUInt16BE(0);
    this.haveLength(callback);
  }
  getPayloadLength64(callback) {
    if (this._bufferedBytes < 8) {
      this._loop = false;
      return;
    }
    const lengthBytes = this.consume(8);
    const highBits = lengthBytes.readUInt32BE(0);
    if (highBits > Math.pow(2, 21) - 1) {
      const error = this.createError(RangeError, 'Unsupported WebSocket frame: payload length > 2^53 - 1', false, 1009, 'WS_ERR_UNSUPPORTED_DATA_PAYLOAD_LENGTH');
      callback(error);
      return;
    }
    this._payloadLength = highBits * Math.pow(2, 32) + lengthBytes.readUInt32BE(4);
    this.haveLength(callback);
  }
  haveLength(callback) {
    if (this._payloadLength && this._opcode < 8) {
      this._totalPayloadLength += this._payloadLength;
      if (this._totalPayloadLength > this._maxPayload && this._maxPayload > 0) {
        const error = this.createError(RangeError, 'Max payload size exceeded', false, 1009, 'WS_ERR_UNSUPPORTED_MESSAGE_LENGTH');
        callback(error);
        return;
      }
    }
    if (this._masked) {
      this._state = GET_MASK;
    } else {
      this._state = GET_DATA;
    }
  }
  getMask() {
    if (this._bufferedBytes < 4) {
      this._loop = false;
      return;
    }
    this._mask = this.consume(4);
    this._state = GET_DATA;
  }
  getData(callback) {
    let data = EMPTY_BUFFER;
    if (this._payloadLength) {
      if (this._bufferedBytes < this._payloadLength) {
        this._loop = false;
        return;
      }
      data = this.consume(this._payloadLength);
      if (this._masked && (this._mask[0] | this._mask[1] | this._mask[2] | this._mask[3]) !== 0) {
        unmask(data, this._mask);
      }
    }
    if (this._opcode > 7) {
      this.controlMessage(data, callback);
      return;
    }
    if (this._maxFragments > 0 && ++this._numFragments > this._maxFragments) {
      const error = this.createError(RangeError, 'Too many message fragments', false, 1008, 'WS_ERR_TOO_MANY_BUFFERED_PARTS');
      callback(error);
      return;
    }
    if (this._compressed) {
      this._state = INFLATING;
      this.decompress(data, callback);
      return;
    }
    if (data.length) {
      this._messageLength = this._totalPayloadLength;
      this._fragments.push(data);
    }
    this.dataMessage(callback);
  }
  decompress(data, callback) {
    const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];
    perMessageDeflate.decompress(data, this._fin, (error, decompressedData) => {
      if (error) {
        return callback(error);
      }
      if (decompressedData.length) {
        this._messageLength += decompressedData.length;
        if (this._messageLength > this._maxPayload && this._maxPayload > 0) {
          const payloadError = this.createError(RangeError, 'Max payload size exceeded', false, 1009, 'WS_ERR_UNSUPPORTED_MESSAGE_LENGTH');
          callback(payloadError);
          return;
        }
        this._fragments.push(decompressedData);
      }
      this.dataMessage(callback);
      if (this._state === GET_INFO) {
        this.startLoop(callback);
      }
    });
  }
  dataMessage(callback) {
    if (!this._fin) {
      this._state = GET_INFO;
      return;
    }
    const messageLength = this._messageLength;
    const fragments = this._fragments;
    this._totalPayloadLength = 0;
    this._messageLength = 0;
    this._fragmented = 0;
    this._numFragments = 0;
    this._fragments = [];
    if (this._opcode === 2) {
      let messageData;
      if (this._binaryType === 'nodebuffer') {
        messageData = concat(fragments, messageLength);
      } else if (this._binaryType === 'arraybuffer') {
        messageData = toArrayBuffer(concat(fragments, messageLength));
      } else if (this._binaryType === 'blob') {
        messageData = new Blob(fragments);
      } else {
        messageData = fragments;
      }
      if (this._allowSynchronousEvents) {
        this.emit('message', messageData, true);
        this._state = GET_INFO;
      } else {
        this._state = DEFER_EVENT;
        setImmediate(() => {
          this.emit('message', messageData, true);
          this._state = GET_INFO;
          this.startLoop(callback);
        });
      }
    } else {
      const messageData = concat(fragments, messageLength);
      if (!this._skipUTF8Validation && !isValidUTF8(messageData)) {
        const error = this.createError(Error, 'invalid UTF-8 sequence', true, 1007, 'WS_ERR_INVALID_UTF8');
        callback(error);
        return;
      }
      if (this._state === INFLATING || this._allowSynchronousEvents) {
        this.emit('message', messageData, false);
        this._state = GET_INFO;
      } else {
        this._state = DEFER_EVENT;
        setImmediate(() => {
          this.emit('message', messageData, false);
          this._state = GET_INFO;
          this.startLoop(callback);
        });
      }
    }
  }
  controlMessage(data, callback) {
    if (this._opcode === 8) {
      if (data.length === 0) {
        this._loop = false;
        this.emit('conclude', 1005, EMPTY_BUFFER);
        this.end();
      } else {
        const code = data.readUInt16BE(0);
        if (!isValidStatusCode(code)) {
          const error = this.createError(RangeError, 'invalid status code ' + code, true, 1002, 'WS_ERR_INVALID_CLOSE_CODE');
          callback(error);
          return;
        }
        const reason = new BufferSpecies(data.buffer, data.byteOffset + 2, data.length - 2);
        if (!this._skipUTF8Validation && !isValidUTF8(reason)) {
          const error = this.createError(Error, 'invalid UTF-8 sequence', true, 1007, 'WS_ERR_INVALID_UTF8');
          callback(error);
          return;
        }
        this._loop = false;
        this.emit('conclude', code, reason);
        this.end();
      }
      this._state = GET_INFO;
      return;
    }
    if (this._allowSynchronousEvents) {
      this.emit(this._opcode === 9 ? 'ping' : 'pong', data);
      this._state = GET_INFO;
    } else {
      this._state = DEFER_EVENT;
      setImmediate(() => {
        this.emit(this._opcode === 9 ? 'ping' : 'pong', data);
        this._state = GET_INFO;
        this.startLoop(callback);
      });
    }
  }
  createError(ErrorType, message, prefixFrameError, statusCode, errorCode) {
    this._loop = false;
    this._errored = true;
    const error = new ErrorType(prefixFrameError ? 'Invalid WebSocket frame: ' + message : message);
    Error.captureStackTrace(error, this.createError);
    error.code = errorCode;
    error[kStatusCode] = statusCode;
    return error;
  }
};
module.exports = Receiver;
