'use strict';

const globalThis = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof self !== 'undefined' ? self : typeof global !== 'undefined' ? global : void 0;

const NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

function isBufferLike(obj) {
  return obj && typeof obj === 'object' && typeof obj.length === 'number';
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function compare(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
}

let bufCompare, bufEqual;
if (typeof Buffer === 'function') {
  bufCompare = Buffer.compare;
  bufEqual = function(a, b) {
    return a.length === b.length && a.compare(b) === 0;
  };
} else {
  bufCompare = function(a, b) {
    const len = Math.min(a.length, b.length);
    for (let i = 0; i < len; i++) {
      if (a[i] !== b[i]) return a[i] - b[i];
    }
    return a.length - b.length;
  };
  bufEqual = function(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  };
}

function getOption(obj, key, defaultValue) {
  return obj && key in obj ? obj[key] : defaultValue;
}

function singleIndexOf(arr, val) {
  let idx = -1;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === val) {
      if (idx >= 0) return -2;
      idx = i;
    }
  }
  return idx;
}

function toMap(arr, fn) {
  const map = {};
  for (let i = 0; i < arr.length; i++) {
    const key = fn ? fn(arr[i]) : arr[i];
    map[key] = arr[i];
  }
  return map;
}

function objectValues(obj) {
  const vals = [];
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      vals.push(obj[key]);
    }
  }
  return vals;
}

function hasDuplicates(arr, fn) {
  const seen = new Set();
  for (let i = 0; i < arr.length; i++) {
    const key = fn ? fn(arr[i]) : arr[i];
    if (seen.has(key)) return true;
    seen.add(key);
  }
  return false;
}

function copyOwnProperties(from, to, filter) {
  const names = Object.getOwnPropertyNames(from);
  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    if (filter && !filter(name)) continue;
    const desc = Object.getOwnPropertyDescriptor(from, name);
    Object.defineProperty(to, name, desc);
  }
}

function isValidName(name) {
  return NAME_PATTERN.test(name);
}

function qualify(name, namespace) {
  if (!namespace) return name;
  return namespace + '.' + name;
}

function unqualify(name) {
  const idx = name.lastIndexOf('.');
  return idx >= 0 ? name.slice(idx + 1) : name;
}

function impliedNamespace(name) {
  const idx = name.lastIndexOf('.');
  return idx >= 0 ? name.slice(0, idx) : '';
}

function jsonEnd(str, pos) {
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = pos; i < str.length; i++) {
    const c = str.charCodeAt(i);
    if (inString) {
      if (escape) {
        escape = false;
      } else if (c === 0x5c) {
        escape = true;
      } else if (c === 0x22) {
        inString = false;
      }
    } else {
      if (c === 0x22) {
        inString = true;
      } else if (c === 0x7b || c === 0x5b) {
        depth++;
      } else if (c === 0x7d || c === 0x5d) {
        if (--depth < 0) return i;
      }
    }
  }
  return -1;
}

function abstractFunction() {
  throw new Error('abstract function');
}

class Lcg {
  constructor(seed) {
    this.seed = seed;
  }

  next() {
    this.seed = (this.seed * 0x19660d + 0x3c6ef35f) & 0xffffffff;
    return this.seed;
  }

  nextInt(min, max) {
    return min + (this.next() % (max - min));
  }

  nextBoolean() {
    return (this.next() & 1) === 1;
  }

  nextString(len, chars) {
    let s = '';
    for (let i = 0; i < len; i++) {
      s += chars[this.nextInt(0, chars.length)];
    }
    return s;
  }

  nextBuffer(len) {
    const buf = Buffer.alloc(len);
    for (let i = 0; i < len; i++) {
      buf[i] = this.next() & 0xff;
    }
    return buf;
  }

  choice(arr) {
    return arr[this.nextInt(0, arr.length)];
  }
}

class OrderedQueue {
  constructor() {
    this.arr = [];
  }

  push(item) {
    let i = this.arr.length;
    while (i > 0 && this.arr[i - 1] > item) i--;
    this.arr.splice(i, 0, item);
  }

  pop() {
    return this.arr.shift();
  }
}

let decodeSlice;
if (typeof Buffer === 'function' && typeof Buffer.prototype.utf8Slice === 'function') {
  decodeSlice = Function.prototype.call.bind(Buffer.prototype.utf8Slice);
} else {
  const DECODER = new TextDecoder();
  decodeSlice = function(buf, start, end) {
    return DECODER.decode(buf.subarray(start, end));
  };
}

const ENCODER = new TextEncoder();
let encodeBuf = new Uint8Array(0x1000);
let encodeBufs = [];

function encodeSlice(str) {
  const len = ENCODER.encodeInto(str, encodeBuf).written;
  const buf = Buffer.alloc(len);
  for (let i = 0; i < len; i++) {
    buf[i] = encodeBuf[i];
  }
  return buf;
}

let utf8Length;
if (typeof Buffer === 'function') {
  utf8Length = Buffer.byteLength;
} else {
  utf8Length = function(str) {
    let len = 0;
    for (let i = 0; i < str.length; i++) {
      const c = str.charCodeAt(i);
      if (c < 0x80) len++;
      else if (c < 0x800) len += 2;
      else if (c < 0xd800 || c >= 0xe000) len += 3;
      else { len += 4; i++; }
    }
    return len;
  };
}

let bufferToBinaryString;
if (typeof Buffer === 'function' && typeof Buffer.prototype.toString === 'function') {
  bufferToBinaryString = Function.prototype.call.bind(Buffer.prototype.toString);
} else {
  bufferToBinaryString = function(buf) {
    let s = '';
    for (let i = 0; i < buf.length; i++) {
      s += String.fromCharCode(buf[i]);
    }
    return s;
  };
}

let binaryStringToBuffer;
if (typeof Buffer === 'function') {
  binaryStringToBuffer = function(str) {
    const buf = Buffer.alloc(str.length);
    for (let i = 0; i < str.length; i++) {
      buf[i] = str.charCodeAt(i);
    }
    return buf;
  };
} else {
  binaryStringToBuffer = function(str) {
    const buf = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
      buf[i] = str.charCodeAt(i);
    }
    return buf;
  };
}

const FLOAT_VIEW = new DataView(new ArrayBuffer(8));

class Tap {
  constructor(buf, pos) {
    this.buf = buf;
    this.pos = pos || 0;
  }

  static fromBuffer(buf, pos) {
    return new Tap(buf, pos);
  }

  static withCapacity(cap) {
    return new Tap(Buffer.alloc(cap));
  }

  get length() {
    return this.buf.length;
  }

  reinitialize(buf) {
    this.buf = buf;
    this.pos = 0;
  }

  clone() {
    return new Tap(this.buf, this.pos);
  }

  slice(start, end) {
    return this.buf.slice(start, end);
  }

  append(buf) {
    const len = this.buf.length;
    const newBuf = Buffer.alloc(len + buf.length);
    this.buf.copy(newBuf, 0);
    buf.copy(newBuf, len);
    this.buf = newBuf;
  }

  setData(buf) {
    this.buf = buf;
    this.pos = 0;
  }

  isValid() {
    return this.pos <= this.buf.length;
  }

  skipNull() {
    return;
  }

  readBoolean() {
    return this.buf[this.pos++] === 1;
  }

  skipBoolean() {
    this.pos++;
  }

  readInt() {
    let n = 0;
    let shift = 0;
    let b;
    do {
      b = this.buf[this.pos++];
      n |= (b & 0x7f) << shift;
      shift += 7;
    } while (b & 0x80);
    return (n >>> 1) ^ -(n & 1);
  }

  skipInt() {
    while (this.buf[this.pos++] & 0x80) {}
  }

  readLong() {
    return this.readInt();
  }

  skipLong() {
    this.skipInt();
  }

  readFloat() {
    const val = FLOAT_VIEW.getFloat32(0, true);
    this.pos += 4;
    return val;
  }

  skipFloat() {
    this.pos += 4;
  }

  readDouble() {
    const val = FLOAT_VIEW.getFloat64(0, true);
    this.pos += 8;
    return val;
  }

  skipDouble() {
    this.pos += 8;
  }

  readFixed(len) {
    const buf = this.buf.slice(this.pos, this.pos + len);
    this.pos += len;
    return buf;
  }

  skipFixed(len) {
    this.pos += len;
  }

  readBytes() {
    const len = this.readLong();
    const buf = this.buf.slice(this.pos, this.pos + len);
    this.pos += len;
    return buf;
  }

  skipBytes() {
    const len = this.readLong();
    this.pos += len;
  }

  readString() {
    const len = this.readLong();
    return decodeSlice(this.buf, this.pos, this.pos += len);
  }

  skipString() {
    const len = this.readLong();
    this.pos += len;
  }

  writeBoolean(val) {
    this.buf[this.pos++] = val ? 1 : 0;
  }

  writeInt(val) {
    val = (val << 1) ^ (val >> 31);
    while (val & ~0x7f) {
      this.buf[this.pos++] = (val & 0x7f) | 0x80;
      val >>>= 7;
    }
    this.buf[this.pos++] = val;
  }

  writeLong(val) {
    this.writeInt(val);
  }

  writeFloat(val) {
    FLOAT_VIEW.setFloat32(0, val, true);
    for (let i = 0; i < 4; i++) {
      this.buf[this.pos++] = FLOAT_VIEW.getUint8(i);
    }
  }

  writeDouble(val) {
    FLOAT_VIEW.setFloat64(0, val, true);
    for (let i = 0; i < 8; i++) {
      this.buf[this.pos++] = FLOAT_VIEW.getUint8(i);
    }
  }

  writeFixed(buf) {
    buf.copy(this.buf, this.pos);
    this.pos += buf.length;
  }

  writeBytes(buf) {
    this.writeLong(buf.length);
    buf.copy(this.buf, this.pos);
    this.pos += buf.length;
  }

  writeString(str) {
    const len = utf8Length(str);
    this.writeLong(len);
    ENCODER.encodeInto(str, this.buf.subarray(this.pos));
    this.pos += len;
  }

  matchBoolean(val) {
    return this.buf[this.pos++] === (val ? 1 : 0);
  }

  matchInt(val) {
    return this.readInt() === val;
  }

  matchLong(val) {
    return this.matchInt(val);
  }

  matchFloat(val) {
    return Math.abs(this.readFloat() - val) < 0.0001;
  }

  matchDouble(val) {
    return Math.abs(this.readDouble() - val) < 0.0001;
  }

  matchFixed(buf) {
    for (let i = 0; i < buf.length; i++) {
      if (this.buf[this.pos++] !== buf[i]) return false;
    }
    return true;
  }

  matchBytes(buf) {
    const len = this.readLong();
    if (len !== buf.length) return false;
    for (let i = 0; i < len; i++) {
      if (this.buf[this.pos++] !== buf[i]) return false;
    }
    return true;
  }

  matchString(str) {
    const len = this.readLong();
    const s = decodeSlice(this.buf, this.pos, this.pos + len);
    this.pos += len;
    return s === str;
  }

  packLongBytes(val) {
    const buf = Buffer.alloc(8);
    let n = val;
    for (let i = 7; i >= 0; i--) {
      buf[i] = n & 0xff;
      n >>= 8;
    }
    return buf;
  }

  unpackLongBytes(buf) {
    let n = 0;
    for (let i = 0; i < 8; i++) {
      n = (n << 8) | buf[i];
    }
    return n;
  }
}

function invert(obj, fn) {
  const res = {};
  for (const key in obj) {
    const val = obj[key];
    const newKey = fn ? fn(val) : val;
    res[newKey] = key;
  }
  return res;
}

function printJSON(obj) {
  return JSON.stringify(obj, null, 2);
}

module.exports = {
  abstractFunction,
  bufCompare,
  bufEqual,
  bufferToBinaryString,
  binaryStringToBuffer,
  capitalize,
  copyOwnProperties,
  compare,
  getOption,
  impliedNamespace,
  isBufferLike,
  isValidName,
  jsonEnd,
  objectValues,
  qualify,
  toMap,
  singleIndexOf,
  hasDuplicates,
  unqualify,
  Lcg,
  OrderedQueue,
  Tap,
  printJSON
};
