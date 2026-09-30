'use strict';

const platform = (() => {
  const hasBuffer = typeof Buffer === 'function';
  const hasTextDecoder = typeof TextDecoder === 'function';
  const hasTextEncoder = typeof TextEncoder === 'function';
  return {
    hasBuffer,
    hasTextDecoder,
    hasTextEncoder,
    getHash: null
  };
})();

const NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

function isBufferLike(value) {
  return value != null && typeof value === 'object' && typeof value.byteLength === 'number' && typeof value.byteOffset === 'number' && typeof value.subarray === 'function';
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function compare(a, b) {
  if (a === b) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  if (typeof a === 'number' && typeof b === 'number') return a < b ? -1 : a > b ? 1 : 0;
  if (typeof a === 'string' && typeof b === 'string') return a < b ? -1 : a > b ? 1 : 0;
  if (typeof a === 'boolean' && typeof b === 'boolean') return a === b ? 0 : a ? 1 : -1;
  if (isBufferLike(a) && isBufferLike(b)) return bufCompare(a, b);
  if (Array.isArray(a) && Array.isArray(b)) {
    const len = Math.min(a.length, b.length);
    for (let i = 0; i < len; i++) {
      const cmp = compare(a[i], b[i]);
      if (cmp) return cmp;
    }
    return a.length - b.length;
  }
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const aKeys = Object.keys(a).sort();
    const bKeys = Object.keys(b).sort();
    const len = Math.min(aKeys.length, bKeys.length);
    for (let i = 0; i < len; i++) {
      const cmp = compare(aKeys[i], bKeys[i]);
      if (cmp) return cmp;
      const valCmp = compare(a[aKeys[i]], b[bKeys[i]]);
      if (valCmp) return valCmp;
    }
    return aKeys.length - bKeys.length;
  }
  return String(a) < String(b) ? -1 : 1;
}

let bufCompare, bufEqual;
if (typeof Buffer === 'function') {
  bufCompare = Buffer.compare;
  bufEqual = (a, b) => a.equals(b);
} else {
  bufCompare = (a, b) => {
    const len = Math.min(a.length, b.length);
    for (let i = 0; i < len; i++) {
      if (a[i] !== b[i]) return a[i] < b[i] ? -1 : 1;
    }
    return a.length - b.length;
  };
  bufEqual = (a, b) => {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  };
}

function getOption(opts, key, defaultValue) {
  if (opts && Object.prototype.hasOwnProperty.call(opts, key)) return opts[key];
  return defaultValue;
}

function singleIndexOf(arr, value) {
  let found = -1;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === value) {
      if (found !== -1) return -1;
      found = i;
    }
  }
  return found;
}

function toMap(arr, keyFn) {
  const map = {};
  for (const item of arr) {
    map[keyFn(item)] = item;
  }
  return map;
}

function objectValues(obj) {
  return Object.keys(obj).map(k => obj[k]);
}

function hasDuplicates(arr, keyFn) {
  const seen = new Set();
  for (const item of arr) {
    const key = keyFn ? keyFn(item) : item;
    if (seen.has(key)) return true;
    seen.add(key);
  }
  return false;
}

function copyOwnProperties(target, source, excluded) {
  const excludeSet = new Set(excluded || []);
  for (const key of Object.keys(source)) {
    if (!excludeSet.has(key)) target[key] = source[key];
  }
  return target;
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
  return idx === -1 ? name : name.slice(idx + 1);
}

function impliedNamespace(name) {
  const idx = name.lastIndexOf('.');
  return idx === -1 ? '' : name.slice(0, idx);
}

function jsonEnd(buf, pos) {
  let end = pos;
  while (end < buf.length) {
    const c = buf[end];
    if (c === 0x20 || c === 0x09 || c === 0x0a || c === 0x0d) end++;
    else if (c === 0x7d || c === 0x5d) { end++; break; }
    else break;
  }
  return end;
}

function abstractFunction() {
  throw new Error('Abstract function not implemented');
}

class Lcg {
  constructor(seed) {
    this.seed = seed >>> 0;
    this.state = this.seed;
  }
  next() {
    this.state = (Math.imul(this.state, 1664525) + 1013904223) >>> 0;
    return this.state / 0x100000000;
  }
  nextInt(min, max) {
    return min + Math.floor(this.next() * (max - min + 1));
  }
  nextFloat(min, max) {
    return min + this.next() * (max - min);
  }
  nextString(len, alphabet) {
    let str = '';
    for (let i = 0; i < len; i++) {
      str += alphabet[this.nextInt(0, alphabet.length - 1)];
    }
    return str;
  }
  nextBuffer(len) {
    const buf = new Uint8Array(len);
    for (let i = 0; i < len; i++) buf[i] = this.nextInt(0, 255);
    return buf;
  }
  choice(arr) {
    return arr[this.nextInt(0, arr.length - 1)];
  }
}

class OrderedQueue {
  constructor() {
    this.items = [];
  }
  push(item) {
    this.items.push(item);
    this.items.sort((a, b) => a[0] - b[0]);
  }
  pop() {
    return this.items.shift();
  }
}

let DECODER = typeof TextDecoder === 'function' ? new TextDecoder() : null;
let ENCODER = typeof TextEncoder === 'function' ? new TextEncoder() : null;
const encodeBuf = new Uint8Array(0x1000);
const encodeBufs = [];

function decodeSlice(buf, start, end) {
  if (typeof Buffer === 'function' && typeof Buffer.prototype.utf8Slice === 'function') {
    return Buffer.prototype.utf8Slice.call(buf, start, end);
  }
  return DECODER.decode(buf.subarray(start, end));
}

function encodeSlice(str) {
  if (typeof Buffer === 'function') return Buffer.from(str, 'utf8');
  return ENCODER.encode(str);
}

function utf8Length(str) {
  if (typeof Buffer === 'function') return Buffer.byteLength(str);
  return ENCODER.encode(str).length;
}

function bufferToBinaryString(buf) {
  if (typeof Buffer === 'function' && typeof Buffer.prototype.latin1Slice === 'function') {
    return Buffer.prototype.latin1Slice.call(buf);
  }
  let str = '';
  for (let i = 0; i < buf.length; i++) str += String.fromCharCode(buf[i]);
  return str;
}

function binaryStringToBuffer(str) {
  if (typeof Buffer === 'function') return Buffer.from(str, 'binary');
  const buf = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) buf[i] = str.charCodeAt(i) & 0xff;
  return buf;
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
  static withCapacity(capacity) {
    return new Tap(new Uint8Array(capacity), 0);
  }
  get length() {
    return this.buf.length;
  }
  reinitialize(buf) {
    this.buf = buf;
    this.pos = 0;
  }
  toBuffer() {
    return this.buf;
  }
  append(buf) {
    const newBuf = new Uint8Array(this.buf.length + buf.length);
    newBuf.set(this.buf, 0);
    newBuf.set(buf, this.buf.length);
    this.buf = newBuf;
    return this;
  }
  isValid() {
    return this.pos >= 0 && this.pos <= this.buf.length;
  }
  _invalidate() {
    this.pos = -1;
  }
  readBoolean() {
    const v = this.buf[this.pos++];
    if (v === 0) return false;
    if (v === 1) return true;
    this._invalidate();
    return false;
  }
  skipBoolean() {
    this.pos++;
  }
  matchBoolean(value) {
    return this.readBoolean() === value;
  }
  readLong() {
    let result = 0;
    let shift = 0;
    let byte;
    do {
      byte = this.buf[this.pos++];
      result |= (byte & 0x7f) << shift;
      shift += 7;
    } while (byte & 0x80);
    return (result >>> 1) ^ -(result & 1);
  }
  skipLong() {
    let byte;
    do {
      byte = this.buf[this.pos++];
    } while (byte & 0x80);
  }
  matchLong(value) {
    return this.readLong() === value;
  }
  writeLong(value) {
    let v = value;
    while (v < -0x40 || v >= 0x40) {
      this.buf[this.pos++] = (v & 0x7f) | 0x80;
      v >>= 7;
    }
    this.buf[this.pos++] = v & 0x7f;
  }
  readFloat() {
    const v = this.buf.readFloatLE ? this.buf.readFloatLE(this.pos) : new DataView(this.buf.buffer, this.buf.byteOffset + this.pos, 4).getFloat32(0, true);
    this.pos += 4;
    return v;
  }
  skipFloat() {
    this.pos += 4;
  }
  matchFloat(value) {
    return this.readFloat() === value;
  }
  writeFloat(value) {
    if (this.buf.writeFloatLE) this.buf.writeFloatLE(value, this.pos);
    else new DataView(this.buf.buffer, this.buf.byteOffset + this.pos, 4).setFloat32(0, value, true);
    this.pos += 4;
  }
  readDouble() {
    const v = this.buf.readDoubleLE ? this.buf.readDoubleLE(this.pos) : new DataView(this.buf.buffer, this.buf.byteOffset + this.pos, 8).getFloat64(0, true);
    this.pos += 8;
    return v;
  }
  skipDouble() {
    this.pos += 8;
  }
  matchDouble(value) {
    return this.readDouble() === value;
  }
  writeDouble(value) {
    if (this.buf.writeDoubleLE) this.buf.writeDoubleLE(value, this.pos);
    else new DataView(this.buf.buffer, this.buf.byteOffset + this.pos, 8).setFloat64(0, value, true);
    this.pos += 8;
  }
  readFixed(size) {
    const v = this.buf.subarray(this.pos, this.pos + size);
    this.pos += size;
    return v;
  }
  skipFixed(size) {
    this.pos += size;
  }
  matchFixed(value) {
    const v = this.readFixed(value.length);
    return bufEqual(v, value);
  }
  writeFixed(value) {
    this.buf.set(value, this.pos);
    this.pos += value.length;
  }
  readBytes() {
    const len = this.readLong();
    return this.readFixed(len);
  }
  skipBytes() {
    const len = this.readLong();
    this.pos += len;
  }
  matchBytes(value) {
    const len = this.readLong();
    if (len !== value.length) return false;
    return bufEqual(this.readFixed(len), value);
  }
  writeBytes(value) {
    this.writeLong(value.length);
    this.writeFixed(value);
  }
  readString() {
    const len = this.readLong();
    return decodeSlice(this.buf, this.pos, this.pos + len);
  }
  skipString() {
    const len = this.readLong();
    this.pos += len;
  }
  matchString(value) {
    const len = this.readLong();
    return decodeSlice(this.buf, this.pos, this.pos + len) === value;
  }
  writeString(value) {
    const encoded = encodeSlice(value);
    this.writeLong(encoded.length);
    this.writeFixed(encoded);
  }
}

function invert(obj) {
  const result = {};
  for (const key of Object.keys(obj)) {
    result[obj[key]] = key;
  }
  return result;
}

function printJSON(value) {
  return JSON.stringify(value, null, 2);
}

module.exports = {
  abstractFunction,
  bufCompare,
  bufEqual,
  bufferToBinaryString,
  binaryStringToBuffer,
  capitalize,
  copyOwnProperties,
  getHash: platform.getHash,
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
