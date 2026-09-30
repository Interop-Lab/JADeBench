'use strict';

const crypto = require('crypto');

function abstractFunction() {
  throw new Error('abstract');
}

function bufCompare(buf1, buf2) {
  const len = Math.min(buf1.length, buf2.length);
  for (let i = 0; i < len; i++) {
    if (buf1[i] !== buf2[i]) return buf1[i] < buf2[i] ? -1 : 1;
  }
  return compare(buf1.length, buf2.length);
}

function bufEqual(buf1, buf2) {
  if (buf1.length !== buf2.length) return false;
  for (let i = 0; i < buf1.length; i++) {
    if (buf1[i] !== buf2[i]) return false;
  }
  return true;
}

function bufferToBinaryString(buf) {
  return Buffer.from(buf.buffer, buf.byteOffset, buf.byteLength).toString('latin1');
}

function binaryStringToBuffer(str) {
  return Buffer.from(str, 'binary');
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function copyOwnProperties(src, dst, overwrite) {
  Object.getOwnPropertyNames(src).forEach(key => {
    if (overwrite || !Object.prototype.hasOwnProperty.call(dst, key)) {
      Object.defineProperty(dst, key, Object.getOwnPropertyDescriptor(src, key));
    }
  });
  return dst;
}

function getHash(str, algorithm) {
  return crypto.createHash(algorithm || 'md5').update(str).digest();
}

function compare(a, b) {
  return a === b ? 0 : a < b ? -1 : 1;
}

function getOption(opts, key, defaultValue) {
  const value = opts[key];
  return value === undefined ? defaultValue : value;
}

function impliedNamespace(name) {
  const index = name.lastIndexOf('.');
  return index < 0 ? undefined : name.slice(0, index);
}

function isBufferLike(value) {
  return value instanceof Uint8Array;
}

function isValidName(name) {
  return /^[A-Za-z_][A-Za-z0-9_]*$/.test(name);
}

function jsonEnd(str, pos) {
  pos = pos | 0;
  const first = str.charAt(pos);
  if (first === '"') {
    for (let i = pos + 1; i < str.length; i++) {
      if (str.charAt(i) === '\\') i++;
      else if (str.charAt(i) === '"') return i + 1;
    }
    return -1;
  }
  if (first === '{' || first === '[') {
    let depth = 0;
    let quoted = false;
    for (let i = pos; i < str.length; i++) {
      const character = str.charAt(i);
      if (quoted) {
        if (character === '\\') i++;
        else if (character === '"') quoted = false;
      } else if (character === '"') quoted = true;
      else if (character === '{' || character === '[') depth++;
      else if ((character === '}' || character === ']') && --depth === 0) return i + 1;
    }
    return -1;
  }
  const match = /^(?:null|true|false|-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?)/.exec(str.slice(pos));
  return match ? pos + match[0].length : -1;
}

function objectValues(obj) {
  return Object.keys(obj).map(key => obj[key]);
}

function qualify(name, namespace) {
  if (name.charAt(0) === '.') return name.slice(1);
  return name.indexOf('.') < 0 && namespace ? `${namespace}.${name}` : name;
}

function toMap(arr, fn) {
  const obj = {};
  arr.forEach(value => { obj[fn(value)] = value; });
  return obj;
}

function singleIndexOf(arr, value) {
  const index = arr.indexOf(value);
  return index < 0 || index === arr.lastIndexOf(value) ? index : -2;
}

function hasDuplicates(arr, fn) {
  const seen = Object.create(null);
  return arr.some(value => {
    const key = fn ? fn(value) : value;
    if (seen[key]) return true;
    seen[key] = true;
    return false;
  });
}

function unqualify(name) {
  const index = name.lastIndexOf('.');
  return name.slice(index + 1);
}

class Lcg {
  constructor(seed) {
    const max = this._max = 0x80000000;
    let state = seed || Math.floor(Math.random() * max);
    this._nextInt = function () {
      return state = (state * 1103515245 + 12345) % max;
    };
  }

  nextBoolean() {
    return !!(this._nextInt() & 1);
  }

  nextInt(start, end) {
    if (end === undefined) {
      end = start;
      start = 0;
    }
    return start + Math.floor(this._nextInt() / this._max * (end - start));
  }

  nextFloat(start, end) {
    if (end === undefined) {
      end = start;
      start = 0;
    }
    return start + this._nextInt() / this._max * (end - start);
  }

  nextString(len, flags) {
    flags = flags || 'aA';
    let mask = '';
    if (flags.indexOf('a') > -1) mask += 'abcdefghijklmnopqrstuvwxyz';
    if (flags.indexOf('A') > -1) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (flags.indexOf('#') > -1) mask += '0123456789';
    if (flags.indexOf('!') > -1) mask += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';
    let str = '';
    for (let i = 0; i < len; i++) str += mask[this.nextInt(mask.length)] || '';
    return str;
  }

  nextBuffer(len) {
    const buf = Buffer.alloc(len);
    for (let i = 0; i < len; i++) buf[i] = this.nextInt(256);
    return buf;
  }

  choice(arr) {
    if (!arr.length) return undefined;
    return arr[this.nextInt(arr.length)];
  }
}

class OrderedQueue {
  constructor() {
    this._index = 0;
    this._items = [];
  }

  push(item) {
    const index = item.index - this._index;
    this._items[index] = item;
  }

  pop() {
    const item = this._items[0];
    if (!item) return null;
    this._items.shift();
    this._index++;
    return item;
  }
}

const FLOAT_VIEW = new DataView(new ArrayBuffer(8));

const Tap = class _Tap {
  constructor(arr, pos) {
    this.setData(arr, pos);
  }

  setData(arr, pos) {
    this.arr = arr;
    this.pos = pos | 0;
  }

  get length() {
    return this.arr.length;
  }

  reinitialize(capacity) {
    this.arr = new Uint8Array(capacity);
    this.pos = 0;
  }

  static fromBuffer(buf, pos) {
    return new Tap(buf, pos);
  }

  static withCapacity(capacity) {
    return new Tap(new Uint8Array(capacity));
  }

  toBuffer() {
    return this.arr.slice(0, this.pos);
  }

  subarray(start, end) {
    return this.arr.subarray(start, end);
  }

  append(buf) {
    const arr = new Uint8Array(this.arr.length + buf.length);
    arr.set(this.arr);
    arr.set(buf, this.arr.length);
    this.arr = arr;
    this.pos = 0;
  }

  forward(buf) {
    const arr = new Uint8Array(this.arr.length - this.pos + buf.length);
    arr.set(this.arr.subarray(this.pos));
    arr.set(buf, this.arr.length - this.pos);
    this.arr = arr;
    this.pos = 0;
  }

  isValid() {
    return this.pos <= this.arr.length;
  }

  _invalidate() {
    this.pos = this.arr.length + 1;
  }

  readBoolean() {
    return !!this.arr[this.pos++];
  }

  skipBoolean() {
    this.pos++;
  }

  writeBoolean(value) {
    this.arr[this.pos++] = !!value;
  }

  readLong() {
    let value = 0;
    let shift = 0;
    let byte;
    do {
      byte = this.arr[this.pos++];
      if (byte === undefined) return undefined;
      if (shift < 28) value |= (byte & 0x7f) << shift;
      else value += (byte & 0x7f) * Math.pow(2, shift);
      shift += 7;
    } while (byte & 0x80);
    return (value % 2 ? -(value + 1) : value) / 2;
  }

  skipLong() {
    while (this.arr[this.pos++] & 0x80) {}
  }

  writeLong(value) {
    value = value < 0 ? -value * 2 - 1 : value * 2;
    while (value >= 128) {
      this.arr[this.pos++] = value % 128 | 0x80;
      value = Math.floor(value / 128);
    }
    this.arr[this.pos++] = value;
  }

  readFloat() {
    const pos = this.pos;
    this.pos += 4;
    if (this.pos > this.arr.length) return undefined;
    for (let i = 0; i < 4; i++) FLOAT_VIEW.setUint8(i, this.arr[pos + i]);
    return FLOAT_VIEW.getFloat32(0, true);
  }

  skipFloat() { this.pos += 4; }

  writeFloat(value) {
    FLOAT_VIEW.setFloat32(0, value, true);
    const pos = this.pos;
    this.pos += 4;
    if (this.pos <= this.arr.length) {
      for (let i = 0; i < 4; i++) this.arr[pos + i] = FLOAT_VIEW.getUint8(i);
    }
  }

  readDouble() {
    const pos = this.pos;
    this.pos += 8;
    if (this.pos > this.arr.length) return undefined;
    for (let i = 0; i < 8; i++) FLOAT_VIEW.setUint8(i, this.arr[pos + i]);
    return FLOAT_VIEW.getFloat64(0, true);
  }

  skipDouble() { this.pos += 8; }

  writeDouble(value) {
    FLOAT_VIEW.setFloat64(0, value, true);
    const pos = this.pos;
    this.pos += 8;
    if (this.pos <= this.arr.length) {
      for (let i = 0; i < 8; i++) this.arr[pos + i] = FLOAT_VIEW.getUint8(i);
    }
  }

  readFixed(len) {
    const pos = this.pos;
    this.pos += len;
    if (this.pos > this.arr.length) return undefined;
    return this.arr.slice(pos, this.pos);
  }

  skipFixed(len) { this.pos += len; }

  writeFixed(buf, len) {
    len = len === undefined ? buf.length : len;
    if (this.pos + len <= this.arr.length) this.arr.set(buf.subarray(0, len), this.pos);
    this.pos += len;
  }

  readBytes() {
    return this.readFixed(this.readLong());
  }

  skipBytes() {
    this.pos += this.readLong();
  }

  writeBytes(buf) {
    this.writeLong(buf.length);
    this.writeFixed(buf);
  }

  skipString() {
    this.pos += this.readLong();
  }

  readString() {
    const len = this.readLong();
    const pos = this.pos;
    this.pos += len;
    if (this.pos > this.arr.length) return undefined;
    return Buffer.from(this.arr.buffer, this.arr.byteOffset + pos, len).toString();
  }

  writeString(str) {
    const len = Buffer.byteLength(str);
    this.writeLong(len);
    if (this.pos + len <= this.arr.length) {
      Buffer.from(this.arr.buffer, this.arr.byteOffset + this.pos, len).write(str);
    }
    this.pos += len;
  }

  matchBoolean(tap) { return compare(this.readBoolean(), tap.readBoolean()); }
  matchLong(tap) { return compare(this.readLong(), tap.readLong()); }
  matchFloat(tap) { return compare(this.readFloat(), tap.readFloat()); }
  matchDouble(tap) { return compare(this.readDouble(), tap.readDouble()); }

  matchFixed(tap, len) {
    const left = this.readFixed(len);
    const right = tap.readFixed(len);
    return bufCompare(left, right);
  }

  matchBytes(tap) {
    return bufCompare(this.readBytes(), tap.readBytes());
  }

  unpackLongBytes() {
    let value = 0n;
    let shift = 0n;
    let byte;
    do {
      byte = this.arr[this.pos++];
      if (byte === undefined) return undefined;
      value |= BigInt(byte & 0x7f) << shift;
      shift += 7n;
    } while (byte & 0x80);
    const signed = (value >> 1n) ^ -(value & 1n);
    const out = new Uint8Array(8);
    let bits = BigInt.asUintN(64, signed);
    for (let i = 0; i < 8; i++) {
      out[i] = Number(bits & 255n);
      bits >>= 8n;
    }
    return out;
  }

  packLongBytes(buf) {
    let value = 0n;
    for (let i = 7; i >= 0; i--) value = value << 8n | BigInt(buf[i]);
    const signed = BigInt.asIntN(64, value);
    let zigzag = BigInt.asUintN(64, signed << 1n ^ signed >> 63n);
    do {
      let byte = Number(zigzag & 0x7fn);
      zigzag >>= 7n;
      if (zigzag) byte |= 0x80;
      this.arr[this.pos++] = byte;
    } while (zigzag);
  }
};

function printJSON(obj) {
  return JSON.stringify(obj);
}

module.exports = {
  abstractFunction,
  bufCompare,
  bufEqual,
  bufferToBinaryString,
  binaryStringToBuffer,
  capitalize,
  copyOwnProperties,
  getHash,
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
  printJSON,
};
