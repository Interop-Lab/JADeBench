'use strict';

var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  if (!mod) {
    mod = { exports: {} };
    cb(mod.exports, __getOwnPropNames(cb)[0], mod);
  }
  return mod.exports;
};

var require_constants = __commonJS({ '../work/websockets__ws/lib/constants.js'(exports, module) {
  'use strict';
  
  const BINARY_TYPES = ['nodebuffer', 'arraybuffer', 'fragments'];
  const hasBlob = typeof Blob !== 'undefined';
  
  module.exports = {
    BINARY_TYPES,
    CLOSE_TIMEOUT: 30000,
    EMPTY_BUFFER: Buffer.alloc(0),
    GUID: '258EAFA5-E914-47DA-95CA-C5AB0DC85B11',
    hasBlob,
    kForOnEventAttribute: Symbol('kwscc'),
    kListener: Symbol('kListener'),
    kStatusCode: Symbol('status-code'),
    kWebSocket: Symbol('websocket'),
    NOOP: () => {}
  };
}});

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
    
    if (offset !== totalLength) return new FastBuffer(target.buffer, target.byteOffset, offset);
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
    mask: _mask,
    toArrayBuffer,
    toBuffer,
    unmask: _unmask
  };
  
  if (!process.env.WS_NO_BUFFER_UTIL) {
    try {
      const bufferUtil = require('bufferutil');
      
      module.exports.mask = function(source, mask, output, offset, length) {
        if (length > 48) _mask(source, mask, output, offset, length);
        else bufferUtil.mask(source, mask, output, offset, length);
      };
      
      module.exports.unmask = function(buffer, mask) {
        if (buffer.length > 32) _unmask(buffer, mask);
        else bufferUtil.unmask(buffer, mask);
      };
    } catch (e) {}
  }
}});

var require_limiter = __commonJS({ '../work/websockets__ws/lib/limiter.js'(exports, module) {
  'use strict';
  
  const kExecuted = Symbol('kExecuted');
  const kRunning = Symbol('kRunning');
  
  class Limiter {
    constructor(concurrency) {
      this[kExecuted] = () => {
        this[kRunning]--;
        this[kRunning]();
      };
      this.concurrency = concurrency || Infinity;
      this.queue = [];
      this[kRunning] = 0;
    }
    
    add(fn) {
      this.queue.push(fn);
      this[kRunning]();
    }
    
    [kRunning]() {
      if (this[kRunning] === this.concurrency) return;
      
      if (this.queue.length) {
        const fn = this.queue.shift();
        this[kRunning]++;
        fn(this[kExecuted]);
      }
    }
  }
  
  module.exports = Limiter;
}});

var require_permessage_deflate = __commonJS({ '../work/websockets__ws/lib/permessage-deflate.js'(exports, module) {
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
  
  let limiter;
  
  class PerMessageDeflate {
    constructor(options, isServer, maxPayload) {
      this._options = options || {};
      this._threshold = this._options.threshold !== undefined ? this._options.threshold : 1024;
      this._isServer = !!this._options.serverNoContextTakeover;
      this._isServer = !!this._options.clientNoContextTakeover;
      this._maxPayload = maxPayload || 0;
      this._inflate = null;
      this._deflate = null;
      this._callback = null;
      
      if (!limiter) {
        const concurrency = this._options.concurrencyLimit !== undefined ? this._options.concurrencyLimit : 10;
        limiter = new Limiter(concurrency);
      }
    }
    
    static get extensionName() {
      return 'permessage-deflate';
    }
    
    [kPerMessageDeflate]() {
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
      if (typeof this._options.clientMaxWindowBits === 'number') {
        params.client_max_window_bits = this._options.clientMaxWindowBits;
      } else if (this._options.clientMaxWindowBits) {
        params.client_max_window_bits = true;
      }
      
      return params;
    }
    
    [kTotalLength](data) {
      let totalLength = data.length;
      
      for (let i = 0; i < data.length; i++) {
        if (data[i].length > totalLength) {
          totalLength = data[i].length;
        }
      }
      
      return totalLength;
    }
    
    [kBuffers](data) {
      const buffers = data.map(d => d);
      return buffers;
    }
    
    [kCallback](err, data) {
      if (this._callback) {
        this._callback(err, data);
        this._callback = null;
      }
    }
    
    [kError](err) {
      this._error = err;
      this._callback(err);
    }
    
    decompress(data, fin, callback) {
      this._callback = callback;
      
      if (!this._inflate) {
        const windowBits = this._isServer ? this._options.clientMaxWindowBits : this._options.serverMaxWindowBits;
        this._inflate = zlib.createInflateRaw({ windowBits });
        this._inflate[kPerMessageDeflate] = this;
        this._inflate[kTotalLength] = 0;
        this._inflate[kBuffers] = [];
        this._inflate.on('error', onError);
        this._inflate.on('data', onData);
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
        
        if (this._inflate[kError]) {
          this._inflate.close();
          this._inflate = null;
        } else {
          this._inflate[kTotalLength] = 0;
          this._inflate[kBuffers] = [];
          fin && this._options.serverNoContextTakeover && this._inflate.close();
        }
        
        callback(null, data);
      });
    }
    
    compress(data, fin, callback) {
      this._callback = callback;
      
      if (!this._deflate) {
        const windowBits = this._isServer ? this._options.serverMaxWindowBits : this._options.clientMaxWindowBits;
        this._deflate = zlib.createDeflateRaw({ windowBits });
        this._deflate[kTotalLength] = 0;
        this._deflate[kBuffers] = [];
        this._deflate.on('error', onError);
        this._deflate.on('data', onData);
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
        
        const data = bufferUtil.concat(this._deflate[kBuffers], this._deflate[kTotalLength]);
        
        if (this._deflate[kError]) {
          this._deflate.close();
          this._deflate = null;
        } else {
          this._deflate[kTotalLength] = 0;
          this._deflate[kBuffers] = [];
          fin && this._options.clientNoContextTakeover && this._deflate.close();
        }
        
        callback(null, data);
      });
    }
  }
  
  module.exports = PerMessageDeflate;
  
  function onData(chunk) {
    this[kBuffers].push(chunk);
    this[kTotalLength] += chunk.length;
  }
  
  function onError(err) {
    this[kPerMessageDeflate][kError](err);
  }
}});

var require_validation = __commonJS({ '../work/websockets__ws/lib/validation.js'(exports, module) {
  'use strict';
  
  const { isUtf8 } = require('util');
  const { hasBlob } = require_constants();
  
  const tokenChars = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0,
    0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0,
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
    return (code >= 1000 && code <= 1015 && code !== 1004 && code !== 1005 && code !== 1006) ||
           (code >= 3000 && code <= 4999);
  }
  
  function _isValidUTF8(buf) {
    const len = buf.length;
    let i = 0;
    
    while (i < len) {
      if ((buf[i] & 0x80) === 0x00) {
        i++;
      } else if ((buf[i] & 0xE0) === 0xC0) {
        if (i + 1 === len || (buf[i + 1] & 0xC0) !== 0x80) return false;
        i += 2;
      } else if ((buf[i] & 0xF0) === 0xE0) {
        if (i + 2 >= len || (buf[i + 1] & 0xC0) !== 0x80 || (buf[i + 2] & 0xC0) !== 0x80) return false;
        i += 3;
      } else if ((buf[i] & 0xF8) === 0xF0) {
        if (i + 3 >= len || (buf[i + 1] & 0xC0) !== 0x80 || (buf[i + 2] & 0xC0) !== 0x80 || (buf[i + 3] & 0xC0) !== 0x80) return false;
        i += 4;
      } else {
        return false;
      }
    }
    
    return true;
  }
  
  function isBlob(object) {
    return hasBlob && typeof object === 'object' && typeof object.arrayBuffer === 'function' && typeof object.stream === 'function' && typeof object.text === 'function' && (object[Symbol.toStringTag] === 'Blob' || object[Symbol.toStringTag] === 'File');
  }
  
  module.exports = {
    isBlob,
    isValidStatusCode,
    isValidUTF8: _isValidUTF8,
    tokenChars
  };
  
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
}});

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
  constructor(socket, extensions, options) {
    this._extensions = extensions || {};
    if (options) {
      this._mask = options.mask;
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
    let maskKey = false;
    let offset = 0;
    let merge = false;
    
    if (options.mask) {
      mask = options.maskBuffer || maskBuffer;
      
      if (options.readOnly) {
        if (randomPoolPointer === RANDOM_POOL_SIZE) {
          if (randomPool === undefined) randomPool = Buffer.alloc(RANDOM_POOL_SIZE);
          randomFillSync(randomPool, 0, RANDOM_POOL_SIZE);
          randomPoolPointer = 0;
        }
        mask[0] = randomPool[randomPoolPointer++];
        mask[1] = randomPool[randomPoolPointer++];
        mask[2] = randomPool[randomPoolPointer++];
        mask[3] = randomPool[randomPoolPointer++];
      } else {
        randomFillSync(mask, 0, 4);
      }
      
      maskKey = ((mask[0] << 24) | (mask[1] << 16) | (mask[2] << 8) | mask[3]) >>> 0;
      offset = 4;
    }
    
    let dataLength;
    
    if (typeof data === 'string') {
      if ((!options.mask || maskKey) && options[kByteLength] !== undefined) {
        dataLength = options[kByteLength];
      } else {
        data = Buffer.from(data);
        dataLength = data.length;
      }
    } else {
      dataLength = data.length;
      merge = options.mask && options.readOnly && !maskKey;
    }
    
    let payloadLength = dataLength;
    
    if (dataLength > 65535) {
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
    
    if (maskKey) return [target, data];
    
    if (merge) {
      applyMask(data, mask, target, offset, dataLength);
      return [target];
    }
    
    applyMask(data, mask, data, 0, dataLength);
    return [target, data];
  }

  close(code, data, mask, cb) {
    let buf;
    
    if (code === undefined) {
      buf = EMPTY_BUFFER;
    } else {
      if (typeof code !== 'number' || !isValidStatusCode(code)) {
        throw new TypeError('The first argument must be a valid error code number');
      }
      
      if (data === undefined || !data) {
        buf = Buffer.allocUnsafe(2);
        buf.writeUInt16BE(code, 0);
      } else {
        const length = Buffer.byteLength(data);
        
        if (length > 123) {
          throw new RangeError('The message must not be greater than 123 bytes');
        }
        
        buf = Buffer.allocUnsafe(2 + length);
        buf.writeUInt16BE(code, 0);
        
        if (typeof data === 'string') {
          buf.write(data, 2);
        } else if (isUint8Array(data)) {
          buf.set(data, 2);
        } else {
          throw new TypeError('The second argument must be a string or Buffer');
        }
      }
    }
    
    const options = {};
    options[kByteLength] = buf.length;
    options.fin = true;
    options.opcode = 0x08;
    options.mask = mask;
    options.bufferedBytes = this._bufferedBytes;
    options.compress = false;
    options.readOnly = false;
    
    if (this._state === DEFAULT) {
      this.send([this._socket, buf, false, options, cb]);
    } else {
      this.enqueue([this._socket, buf, false, options, cb]);
    }
  }

  ping(data, mask, cb) {
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
    
    const options = {};
    options[kByteLength] = byteLength;
    options.fin = true;
    options.opcode = 0x09;
    options.mask = mask;
    options.bufferedBytes = this._bufferedBytes;
    options.compress = false;
    options.readOnly = readOnly;
    
    if (isBlob(data)) {
      if (this._state === DEFAULT) {
        this.send([this._socket, data, false, options, cb]);
      } else {
        this.enqueue([this._socket, data, false, options, cb]);
      }
    } else {
      if (this._state === DEFAULT) {
        this.send([this._socket, data, false, options, cb]);
      } else {
        this.enqueue([this._socket, data, false, options, cb]);
      }
    }
  }

  pong(data, mask, cb) {
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
    
    const options = {};
    options[kByteLength] = byteLength;
    options.fin = true;
    options.opcode = 0x0a;
    options.mask = mask;
    options.bufferedBytes = this._bufferedBytes;
    options.compress = false;
    options.readOnly = readOnly;
    
    if (isBlob(data)) {
      if (this._state === DEFAULT) {
        this.send([this._socket, data, false, options, cb]);
      } else {
        this.enqueue([this._socket, data, false, options, cb]);
      }
    } else {
      if (this._state === DEFAULT) {
        this.send([this._socket, data, false, options, cb]);
      } else {
        this.enqueue([this._socket, data, false, options, cb]);
      }
    }
  }

  send(data, compress, options, cb) {
    const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];
    let opcode = 0x02;
    let payload = data;
    let readOnly;
    
    if (typeof data === 'string') {
      payload = Buffer.byteLength(data);
      readOnly = false;
    } else if (isBlob(data)) {
      payload = data.size;
      readOnly = false;
    } else {
      data = toBuffer(data);
      payload = data.length;
      readOnly = toBuffer.readOnly;
    }
    
    if (this._firstFragment) {
      this._firstFragment = false;
      if (compress && perMessageDeflate && perMessageDeflate.params[perMessageDeflate._isServer ? 'client_no_context_takeover' : 'server_no_context_takeover']) {
        opcode = 0x01;
      }
      this._compress = compress;
    } else {
      opcode = 0x00;
      compress = false;
    }
    
    if (options.fin) this._firstFragment = true;
    
    const opts = {};
    opts[kByteLength] = payload;
    opts.fin = options.fin;
    opts.opcode = opcode;
    opts.mask = options.mask;
    opts.bufferedBytes = this._bufferedBytes;
    opts.compress = compress;
    opts.readOnly = readOnly;
    opts.binary = !this._compress;
    
    if (isBlob(data)) {
      if (this._state === DEFAULT) {
        this.send([this._socket, data, this._compress, opts, cb]);
      } else {
        this.enqueue([this._socket, data, this._compress, opts, cb]);
      }
    } else {
      if (this._state === DEFAULT) {
        this.send([this._socket, data, this._compress, opts, cb]);
      } else {
        this.enqueue([this._socket, data, this._compress, opts, cb]);
      }
    }
  }

  sendBlob(blob, compress, options, cb) {
    this._bufferedBytes += options[kByteLength];
    this._state = GET_BLOB_DATA;
    
    blob.arrayBuffer().then(arrayBuffer => {
      if (this[kWebSocket].readyState !== 1) {
        const error = new Error('The socket is closed');
        process.nextTick(callCallbacks, this, error, cb);
        return;
      }
      
      this._bufferedBytes -= options[kByteLength];
      const data = toBuffer(arrayBuffer);
      
      if (!compress) {
        this._state = DEFAULT;
        this.sendFrame(Sender.frame(data, options), cb);
        this.dequeue();
      } else {
        this.send(data, compress, options, cb);
      }
    }).catch(err => {
      process.nextTick(onError, this, err, cb);
    });
  }

  sendFrame(frame, compress, options, cb) {
    if (!compress) {
      this.sendFrame(Sender.frame(frame, options), cb);
      return;
    }
    
    const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];
    
    this._bufferedBytes += options[kByteLength];
    this._state = DEFLATING;
    
    perMessageDeflate.compress(frame, options[kByteLength], (err, data) => {
      if (this[kWebSocket].readyState !== 1) {
        const error = new Error('The socket is closed');
        callCallbacks(this, error, cb);
        return;
      }
      
      this._bufferedBytes -= options[kByteLength];
      this._state = DEFAULT;
      options[kByteLength] = false;
      this.sendFrame(Sender.frame(data, options), cb);
      this.dequeue();
    });
  }

  dequeue() {
    while (this._state === DEFAULT && this._queue.length) {
      const params = this._queue.shift();
      this._bufferedBytes -= params[0][kByteLength];
      Reflect.apply(params[0], this, params.slice(1));
    }
  }

  enqueue(params) {
    this._bufferedBytes += params[1][kByteLength];
    this._queue.push(params);
  }

  send(data) {
    if (data[0].readyState !== 1) {
      this._queue[0][1].close();
      this._socket.write(data[1]);
      this._socket.write(data[2], data[3]);
      this._socket.end();
    } else {
      this._socket.write(data[1], data[3]);
    }
  }
}

module.exports = Sender;

function callCallbacks(sender, err, cb) {
  if (typeof cb === 'function') cb(err);
  for (let i = 0; i < sender._queue.length; i++) {
    const params = sender._queue[i];
    const callback = params[params.length - 1];
    if (typeof callback === 'function') callback(err);
  }
}

function onError(sender, err, cb) {
  callCallbacks(sender, err, cb);
  sender.onerror(err);
}
