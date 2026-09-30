'use strict';

const vm_0x22d62f = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof self !== 'undefined' ? self : typeof global !== 'undefined' ? global : void 0;

var __getOwnPropNames = Object.getOwnPropertyNames;

var __commonJS = (cb, base) => {
  const mod = { exports: {} };
  cb(mod, mod.exports);
  return base ? mod.exports : mod;
};

var require_platform = __commonJS({ '../work/mtth__avsc/lib/platform.js'(module, exports) {
  'use strict';
  let platform;
  if (typeof Buffer === 'function' && typeof Buffer.prototype.utf8Slice === 'function') {
    platform = {
      getHash: function(obj) {
        if (typeof obj === 'string') {
          return Buffer.byteLength(obj);
        }
        return obj;
      }
    };
  } else {
    platform = {
      getHash: function(obj) {
        if (typeof obj === 'string') {
          return new TextEncoder().encode(obj).length;
        }
        return obj;
      }
    };
  }
  module.exports = platform;
}});

var platform = require_platform();

var NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

function isBufferLike(obj) {
  'use strict';
  return obj && typeof obj === 'object' && typeof obj.length === 'number' && typeof obj.slice === 'function';
}

function capitalize(str) {
  'use strict';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function compare(a, b) {
  'use strict';
  if (a === b) return 0;
  if (a < b) return -1;
  return 1;
}

var bufCompare, bufEqual;

if (typeof Buffer === 'function') {
  bufCompare = Buffer.compare;
  bufEqual = function(a, b) {
    'use strict';
    return Buffer.compare(a, b) === 0;
  };
} else {
  bufCompare = function(a, b) {
    'use strict';
    let len = Math.min(a.length, b.length);
    for (let i = 0; i < len; i++) {
      if (a[i] !== b[i]) return a[i] - b[i];
    }
    return a.length - b.length;
  };
  bufEqual = function(a, b) {
    'use strict';
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  };
}

function getOption(options, key, def) {
  'use strict';
  if (options && options[key] !== undefined) return options[key];
  return def;
}

function singleIndexOf(arr, val) {
  'use strict';
  let idx = arr.indexOf(val);
  if (idx === -1) return -1;
  if (arr.indexOf(val, idx + 1) !== -1) return -1;
  return idx;
}

function toMap(arr, keyFn) {
  'use strict';
  let map = {};
  for (let i = 0; i < arr.length; i++) {
    map[keyFn(arr[i])] = arr[i];
  }
  return map;
}

function objectValues(obj) {
  'use strict';
  let result = [];
  for (let key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result.push(obj[key]);
    }
  }
  return result;
}

function hasDuplicates(arr, keyFn) {
  'use strict';
  let seen = {};
  for (let i = 0; i < arr.length; i++) {
    let key = keyFn ? keyFn(arr[i]) : arr[i];
    if (key in seen) return true;
    seen[key] = true;
  }
  return false;
}

function copyOwnProperties(target, source, overwrite) {
  'use strict';
  let names = Object.getOwnPropertyNames(source);
  for (let i = 0; i < names.length; i++) {
    let name = names[i];
    if (overwrite || !(name in target)) {
      let desc = Object.getOwnPropertyDescriptor(source, name);
      if (desc) {
        Object.defineProperty(target, name, desc);
      }
    }
  }
  return target;
}

function isValidName(name) {
  'use strict';
  return NAME_PATTERN.test(name);
}

function qualify(name, namespace) {
  'use strict';
  if (!namespace || name.indexOf('.') >= 0) return name;
  return namespace + '.' + name;
}

function unqualify(name) {
  'use strict';
  let idx = name.lastIndexOf('.');
  if (idx < 0) return name;
  return name.substring(idx + 1);
}

function impliedNamespace(name) {
  'use strict';
  let idx = name.lastIndexOf('.');
  if (idx < 0) return undefined;
  return name.substring(0, idx);
}

function jsonEnd(buf, offset) {
  'use strict';
  let pos = offset || 0;
  let len = buf.length;
  let depth = 0;
  let inString = false;
  let escape = false;
  while (pos < len) {
    let ch = buf[pos];
    if (inString) {
      if (escape) {
        escape = false;
      } else if (ch === 0x5c) {
        escape = true;
      } else if (ch === 0x22) {
        inString = false;
      }
    } else {
      if (ch === 0x22) {
        inString = true;
      } else if (ch === 0x7b || ch === 0x5b) {
        depth++;
      } else if (ch === 0x7d || ch === 0x5d) {
        depth--;
        if (depth === 0) {
          return pos + 1;
        }
      }
    }
    pos++;
  }
  return -1;
}

function abstractFunction() {
  'use strict';
  throw new Error('abstract function called');
}

var Lcg = class {
  constructor(seed) {
    'use strict';
    this.seed = seed >>> 0;
    this.state = seed >>> 0;
  }
  nextBoolean() {
    'use strict';
    return this.nextInt(0, 2) === 1;
  }
  nextInt(min, max) {
    'use strict';
    if (max === undefined) {
      max = min;
      min = 0;
    }
    this.state = (this.state * 0x41c64e6d + 0x3039) >>> 0;
    return min + (this.state >>> 0) % (max - min);
  }
  nextFloat() {
    'use strict';
    this.state = (this.state * 0x41c64e6d + 0x3039) >>> 0;
    return (this.state >>> 0) / 0x100000000;
  }
  nextString(len, charset) {
    'use strict';
    charset = charset || 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < len; i++) {
      result += charset[this.nextInt(0, charset.length)];
    }
    return result;
  }
  nextBuffer(len) {
    'use strict';
    let buf = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      buf[i] = this.nextInt(0, 256);
    }
    return buf;
  }
  choice(arr) {
    'use strict';
    return arr[this.nextInt(0, arr.length)];
  }
};

var OrderedQueue = class {
  constructor() {
    'use strict';
    this.items = [];
  }
  push(item) {
    'use strict';
    this.items.push(item);
  }
  pop() {
    'use strict';
    return this.items.shift();
  }
};

var decodeSlice;

if (typeof Buffer === 'function' && typeof Buffer.prototype.utf8Slice === 'function') {
  decodeSlice = Function.prototype.call.bind(Buffer.prototype.utf8Slice);
} else {
  const DECODER = new TextDecoder();
  decodeSlice = function(buf, start, end) {
    'use strict';
    return DECODER.decode(buf.subarray(start, end));
  };
}

var ENCODER = new TextEncoder();

var encodeBuf = new Uint8Array(0x1000);

var encodeBufs = [];

function encodeSlice(str) {
  'use strict';
  let encoded = ENCODER.encode(str);
  return encoded;
}

var utf8Length;

if (typeof Buffer === 'function') {
  utf8Length = Buffer.byteLength;
} else {
  utf8Length = function(str) {
    'use strict';
    return ENCODER.encode(str).length;
  };
}

var bufferToBinaryString;

if (typeof Buffer === 'function' && typeof Buffer.prototype.latin1Slice === 'function') {
  bufferToBinaryString = Function.prototype.call.bind(Buffer.prototype.latin1Slice);
} else {
  bufferToBinaryString = function(buf, start, end) {
    'use strict';
    start = start || 0;
    end = end || buf.length;
    let str = '';
    for (let i = start; i < end; i++) {
      str += String.fromCharCode(buf[i]);
    }
    return str;
  };
}

var binaryStringToBuffer;

if (typeof Buffer === 'function') {
  binaryStringToBuffer = function(str) {
    'use strict';
    return Buffer.from(str, 'latin1');
  };
} else {
  binaryStringToBuffer = function(str) {
    'use strict';
    let buf = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
      buf[i] = str.charCodeAt(i) & 0xff;
    }
    return buf;
  };
}

var FLOAT_VIEW = new DataView(new ArrayBuffer(8));

var Tap = class _Tap {
  constructor(buf, offset) {
    'use strict';
    this.buf = buf;
    this.pos = offset || 0;
  }
  setData(buf, offset) {
    'use strict';
    this.buf = buf;
    this.pos = offset || 0;
  }
  get length() {
    'use strict';
    return this.buf.length - this.pos;
  }
  reinitialize(buf, offset) {
    'use strict';
    this.buf = buf;
    this.pos = offset || 0;
  }
  static fromBuffer(buf, offset) {
    'use strict';
    return new _Tap(buf, offset);
  }
  static withCapacity(capacity) {
    'use strict';
    return new _Tap(new Uint8Array(capacity));
  }
  toBuffer() {
    'use strict';
    return this.buf.subarray(0, this.pos);
  }
  toBufferFull() {
    'use strict';
    return this.buf;
  }
  append(buf) {
    'use strict';
    this.buf = buf;
    this.pos = 0;
  }
  isValid() {
    'use strict';
    return this.pos >= 0 && this.pos <= this.buf.length;
  }
  _invalidate() {
    'use strict';
    this.pos = -1;
  }
  readBoolean() {
    'use strict';
    return this.buf[this.pos++] !== 0;
  }
  skipBoolean() {
    'use strict';
    this.pos++;
  }
  writeBoolean(b) {
    'use strict';
    this.buf[this.pos++] = b ? 1 : 0;
  }
  readLong() {
    'use strict';
    let view = new DataView(this.buf.buffer, this.buf.byteOffset, this.buf.byteLength);
    let val = view.getFloat64(this.pos, true);
    this.pos += 8;
    return val;
  }
  skipLong() {
    'use strict';
    this.pos += 8;
  }
  writeLong(val) {
    'use strict';
    let view = new DataView(this.buf.buffer, this.buf.byteOffset, this.buf.byteLength);
    view.setFloat64(this.pos, val, true);
    this.pos += 8;
  }
  readFloat() {
    'use strict';
    let view = new DataView(this.buf.buffer, this.buf.byteOffset, this.buf.byteLength);
    let val = view.getFloat32(this.pos, true);
    this.pos += 4;
    return val;
  }
  skipFloat() {
    'use strict';
    this.pos += 4;
  }
  writeFloat(val) {
    'use strict';
    let view = new DataView(this.buf.buffer, this.buf.byteOffset, this.buf.byteLength);
    view.setFloat32(this.pos, val, true);
    this.pos += 4;
  }
  readDouble() {
    'use strict';
    let view = new DataView(this.buf.buffer, this.buf.byteOffset, this.buf.byteLength);
    let val = view.getFloat64(this.pos, true);
    this.pos += 8;
    return val;
  }
  skipDouble() {
    'use strict';
    this.pos += 8;
  }
  writeDouble(val) {
    'use strict';
    let view = new DataView(this.buf.buffer, this.buf.byteOffset, this.buf.byteLength);
    view.setFloat64(this.pos, val, true);
    this.pos += 8;
  }
  readFixed(len) {
    'use strict';
    let result = this.buf.subarray(this.pos, this.pos + len);
    this.pos += len;
    return result;
  }
  skipFixed(len) {
    'use strict';
    this.pos += len;
  }
  writeFixed(buf, len) {
    'use strict';
    this.buf.set(buf.subarray(0, len), this.pos);
    this.pos += len;
  }
  readBytes() {
    'use strict';
    let view = new DataView(this.buf.buffer, this.buf.byteOffset, this.buf.byteLength);
    let len = view.getUint32(this.pos, true);
    this.pos += 4;
    let result = this.buf.subarray(this.pos, this.pos + len);
    this.pos += len;
    return result;
  }
  skipBytes() {
    'use strict';
    let view = new DataView(this.buf.buffer, this.buf.byteOffset, this.buf.byteLength);
    let len = view.getUint32(this.pos, true);
    this.pos += 4 + len;
  }
  writeBytes(buf) {
    'use strict';
    let view = new DataView(this.buf.buffer, this.buf.byteOffset, this.buf.byteLength);
    view.setUint32(this.pos, buf.length, true);
    this.pos += 4;
    this.buf.set(buf, this.pos);
    this.pos += buf.length;
  }
  readString() {
    'use strict';
    let view = new DataView(this.buf.buffer, this.buf.byteOffset, this.buf.byteLength);
    let len = view.getUint32(this.pos, true);
    this.pos += 4;
    let result = decodeSlice(this.buf, this.pos, this.pos + len);
    this.pos += len;
    return result;
  }
  skipString() {
    'use strict';
    let view = new DataView(this.buf.buffer, this.buf.byteOffset, this.buf.byteLength);
    let len = view.getUint32(this.pos, true);
    this.pos += 4 + len;
  }
  writeString(str) {
    'use strict';
    let encoded = ENCODER.encode(str);
    let view = new DataView(this.buf.buffer, this.buf.byteOffset, this.buf.byteLength);
    view.setUint32(this.pos, encoded.length, true);
    this.pos += 4;
    this.buf.set(encoded, this.pos);
    this.pos += encoded.length;
  }
  matchBoolean(b) {
    'use strict';
    return this.buf[this.pos++] === (b ? 1 : 0);
  }
  matchLong(val) {
    'use strict';
    let view = new DataView(this.buf.buffer, this.buf.byteOffset, this.buf.byteLength);
    let result = view.getFloat64(this.pos, true) === val;
    this.pos += 8;
    return result;
  }
  matchFloat(val) {
    'use strict';
    let view = new DataView(this.buf.buffer, this.buf.byteOffset, this.buf.byteLength);
    let result = view.getFloat32(this.pos, true) === val;
    this.pos += 4;
    return result;
  }
  matchDouble(val) {
    'use strict';
    let view = new DataView(this.buf.buffer, this.buf.byteOffset, this.buf.byteLength);
    let result = view.getFloat64(this.pos, true) === val;
    this.pos += 8;
    return result;
  }
  matchFixed(buf, len) {
    'use strict';
    let result = true;
    for (let i = 0; i < len; i++) {
      if (this.buf[this.pos + i] !== buf[i]) {
        result = false;
        break;
      }
    }
    this.pos += len;
    return result;
  }
  matchBytes(buf) {
    'use strict';
    let view = new DataView(this.buf.buffer, this.buf.byteOffset, this.buf.byteLength);
    let len = view.getUint32(this.pos, true);
    this.pos += 4;
    if (len !== buf.length) {
      this.pos += len;
      return false;
    }
    let result = true;
    for (let i = 0; i < len; i++) {
      if (this.buf[this.pos + i] !== buf[i]) {
        result = false;
        break;
      }
    }
    this.pos += len;
    return result;
  }
  matchString(str) {
    'use strict';
    let encoded = ENCODER.encode(str);
    let view = new DataView(this.buf.buffer, this.buf.byteOffset, this.buf.byteLength);
    let len = view.getUint32(this.pos, true);
    this.pos += 4;
    if (len !== encoded.length) {
      this.pos += len;
      return false;
    }
    let result = true;
    for (let i = 0; i < len; i++) {
      if (this.buf[this.pos + i] !== encoded[i]) {
        result = false;
        break;
      }
    }
    this.pos += len;
    return result;
  }
};

function invert(obj) {
  'use strict';
  let result = {};
  for (let key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[obj[key]] = key;
    }
  }
  return result;
}

function printJSON(obj) {
  'use strict';
  return JSON.stringify(obj, null, 2);
}

module.exports = {
  abstractFunction: abstractFunction,
  bufCompare: bufCompare,
  bufEqual: bufEqual,
  bufferToBinaryString: bufferToBinaryString,
  binaryStringToBuffer: binaryStringToBuffer,
  capitalize: capitalize,
  copyOwnProperties: copyOwnProperties,
  getHash: platform.getHash,
  compare: compare,
  getOption: getOption,
  impliedNamespace: impliedNamespace,
  isBufferLike: isBufferLike,
  isValidName: isValidName,
  jsonEnd: jsonEnd,
  objectValues: objectValues,
  qualify: qualify,
  toMap: toMap,
  singleIndexOf: singleIndexOf,
  hasDuplicates: hasDuplicates,
  unqualify: unqualify,
  Lcg: Lcg,
  OrderedQueue: OrderedQueue,
  Tap: Tap,
  printJSON: printJSON
};
