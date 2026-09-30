'use strict';

const crypto = require('crypto');

const NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

function abstractFunction() {
  throw new Error('abstract');
}

function isBufferLike(value) {
  return value instanceof Uint8Array;
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function compare(a, b) {
  return a === b ? 0 : a < b ? -1 : 1;
}

let bufCompare;
let bufEqual;
if (typeof Buffer !== 'undefined') {
  bufCompare = Buffer.compare;
  bufEqual = (a, b) => Buffer.prototype.equals.call(a, b);
} else {
  bufCompare = function (a, b) {
    if (a === b) return 0;
    const length = Math.min(a.length, b.length);
    for (let i = 0; i < length; i++) {
      if (a[i] !== b[i]) return Math.sign(a[i] - b[i]);
    }
    return Math.sign(a.length - b.length);
  };
  bufEqual = (a, b) => a.length === b.length && bufCompare(a, b) === 0;
}

function getOption(options, key, defaultValue) {
  const value = options[key];
  return value === undefined ? defaultValue : value;
}

function singleIndexOf(items, value) {
  if (!items) return -1;
  let index = -1;
  for (let i = 0; i < items.length; i++) {
    if (items[i] === value) {
      if (index >= 0) return -2;
      index = i;
    }
  }
  return index;
}

function toMap(items, keyFn) {
  const map = {};
  for (const item of items) map[keyFn(item)] = item;
  return map;
}

function objectValues(object) {
  return Object.keys(object).map((key) => object[key]);
}

function hasDuplicates(items, keyFn) {
  const seen = Object.create(null);
  for (let item of items) {
    if (keyFn) item = keyFn(item);
    if (seen[item]) return true;
    seen[item] = true;
  }
  return false;
}

function copyOwnProperties(source, destination, overwrite) {
  for (const key of Object.getOwnPropertyNames(source)) {
    if (!Object.prototype.hasOwnProperty.call(destination, key) || overwrite) {
      Object.defineProperty(destination, key, Object.getOwnPropertyDescriptor(source, key));
    }
  }
  return destination;
}

function isValidName(name) {
  return NAME_PATTERN.test(name);
}

function qualify(name, namespace) {
  if (name.indexOf('.') < 0 && namespace) name = namespace + '.' + name;
  const parts = name.split('.');
  if (parts.some((part) => !isValidName(part))) throw new Error(`invalid name: ${name}`);
  return name;
}

function unqualify(name) {
  const index = name.lastIndexOf('.');
  return index < 0 ? name : name.slice(index + 1);
}

function impliedNamespace(name) {
  const match = /^(.*)\.[^.]+$/.exec(name);
  return match ? match[1] : undefined;
}

function jsonEnd(text, position) {
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = position || 0; i < text.length; i++) {
    const ch = text.charAt(i);
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === '"') inString = false;
    } else if (ch === '"') {
      inString = true;
    } else if (ch === '{' || ch === '[') {
      depth++;
    } else if (ch === '}' || ch === ']') {
      if (--depth === 0) return i + 1;
    } else if (depth === 0 && /\s/.test(ch)) {
      return i;
    }
  }
  return text.length;
}

function bufferToBinaryString(buffer) {
  let string = '';
  for (let i = 0; i < buffer.length; i += 4096) {
    string += String.fromCharCode.apply(null, buffer.subarray(i, i + 4096));
  }
  return string;
}

function binaryStringToBuffer(string) {
  const buffer = Buffer.from(string, 'latin1');
  return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.length);
}

function getHash(string, algorithm) {
  const hash = crypto.createHash(algorithm || 'md5');
  hash.end(string);
  const buffer = hash.read();
  return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.length);
}

class Lcg {
  constructor(seed) {
    this._modulus = Math.pow(2, 31);
    this._multiplier = 1103515245;
    this._increment = 12345;
    this._state = Math.floor(seed || Math.random() * (this._modulus - 1));
  }

  nextBoolean() {
    return (this.nextInt() & 1) === 1;
  }

  nextInt(start, end) {
    this._state = (this._multiplier * this._state + this._increment) % this._modulus;
    if (start === undefined) return this._state;
    if (end === undefined) { end = start; start = 0; }
    return start + Math.floor(this.nextInt() / this._modulus * (end - start));
  }

  nextFloat(start, end) {
    if (start === undefined) { start = 0; end = 1; }
    else if (end === undefined) { end = start; start = 0; }
    return start + (end - start) * this.nextInt() / this._modulus;
  }

  nextString(length, flags) {
    flags = flags || 'aA';
    let mask = '';
    if (flags.indexOf('a') >= 0) mask += 'abcdefghijklmnopqrstuvwxyz';
    if (flags.indexOf('A') >= 0) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (flags.indexOf('#') >= 0) mask += '0123456789';
    if (flags.indexOf('!') >= 0) mask += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';
    let value = '';
    while (value.length < length) value += mask.charAt(this.nextInt(mask.length));
    return value;
  }

  choice(items) {
    if (!items.length) throw new Error('choosing from empty array');
    return items[this.nextInt(items.length)];
  }
}

class OrderedQueue {
  constructor() {
    this._index = 0;
    this._items = [];
  }

  push(item) {
    const items = this._items;
    let lo = 0;
    let hi = items.length;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (items[mid].index <= item.index) lo = mid + 1;
      else hi = mid;
    }
    items.splice(lo, 0, item);
  }

  pop() {
    const item = this._items[0];
    if (!item || item.index !== this._index) return null;
    this._index++;
    return this._items.shift();
  }
}

class Tap {
  constructor(buffer, position) {
    if (typeof Buffer !== 'undefined' && buffer instanceof Buffer) {
      buffer = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.length);
    }
    this.buf = buffer;
    this.pos = position || 0;
    if (this.pos < 0) throw new Error('invalid position');
  }

  get length() { return this.buf.length; }
  reinitialize(capacity) { this._setData(new Uint8Array(capacity), 0); }
  static fromBuffer(buffer, position) { return new Tap(buffer, position); }
  static withCapacity(capacity) { return new Tap(new Uint8Array(capacity)); }
  toBuffer() { return this.buf.subarray(0, this.pos); }
  subarray(start, end) { return this.buf.subarray(start, end); }
  append(buffer) {
    const data = new Uint8Array(this.buf.length + buffer.length);
    data.set(this.buf);
    data.set(buffer, this.buf.length);
    this._setData(data, this.pos);
  }
  forward(length) { this.pos += length; }
  _setData(buffer, position) { this.buf = buffer; this.pos = position || 0; }
  isValid() { return this.pos <= this.buf.length; }

  readBoolean() { return !!this.buf[this.pos++]; }
  skipBoolean() { this.pos++; }
  writeBoolean(value) { this.buf[this.pos++] = !!value; }

  readLong() {
    let n = 0;
    let shift = 0;
    let byte;
    do {
      byte = this.buf[this.pos++];
      n += (byte & 0x7f) * Math.pow(2, shift);
      shift += 7;
    } while (byte & 0x80);
    return n & 1 ? -(n + 1) / 2 : n / 2;
  }

  skipLong() { while (this.buf[this.pos++] & 0x80) {} }

  writeLong(value) {
    let n = value >= 0 ? value * 2 : -value * 2 - 1;
    do {
      this.buf[this.pos++] = (n & 0x7f) | (n >= 128 ? 0x80 : 0);
      n = Math.floor(n / 128);
    } while (n);
  }

  readFloat() {
    const value = new DataView(this.buf.buffer, this.buf.byteOffset, this.buf.byteLength)
      .getFloat32(this.pos, true);
    this.pos += 4;
    return value;
  }
  skipFloat() { this.pos += 4; }
  writeFloat(value) {
    if (this.pos + 4 <= this.buf.length) {
      new DataView(this.buf.buffer, this.buf.byteOffset, this.buf.byteLength)
        .setFloat32(this.pos, value, true);
    }
    this.pos += 4;
  }
  readDouble() {
    const value = new DataView(this.buf.buffer, this.buf.byteOffset, this.buf.byteLength)
      .getFloat64(this.pos, true);
    this.pos += 8;
    return value;
  }
  skipDouble() { this.pos += 8; }
  writeDouble(value) {
    if (this.pos + 8 <= this.buf.length) {
      new DataView(this.buf.buffer, this.buf.byteOffset, this.buf.byteLength)
        .setFloat64(this.pos, value, true);
    }
    this.pos += 8;
  }

  readFixed(length) {
    const value = this.buf.subarray(this.pos, this.pos + length);
    this.pos += length;
    return value;
  }
  skipFixed(length) { this.pos += length; }
  writeFixed(value, length) {
    length = length === undefined ? value.length : length;
    if (this.pos + length <= this.buf.length) this.buf.set(value.subarray(0, length), this.pos);
    this.pos += length;
  }

  readBytes() { return this.readFixed(this.readLong()); }
  skipBytes() { this.skipFixed(this.readLong()); }
  writeBytes(value) { this.writeLong(value.length); this.writeFixed(value); }
  readString() { return Buffer.from(this.readBytes()).toString(); }
  skipString() { this.skipBytes(); }
  writeString(value) {
    const length = Buffer.byteLength(value);
    this.writeLong(length);
    if (this.pos + length <= this.buf.length) this.buf.set(Buffer.from(value), this.pos);
    this.pos += length;
  }

  matchBoolean(tap) { return compare(this.readBoolean(), tap.readBoolean()); }
  matchLong(tap) { return compare(this.readLong(), tap.readLong()); }
  matchFloat(tap) { return compare(this.readFloat(), tap.readFloat()); }
  matchDouble(tap) { return compare(this.readDouble(), tap.readDouble()); }
  matchFixed(tap, length) { return bufCompare(this.readFixed(length), tap.readFixed(length)); }
  matchBytes(tap) { return bufCompare(this.readBytes(), tap.readBytes()); }
  matchString(tap) { return this.matchBytes(tap); }

  unpackLongBytes() {
    let n = 0n;
    let shift = 0n;
    let byte;
    do {
      byte = this.buf[this.pos++];
      n |= BigInt(byte & 0x7f) << shift;
      shift += 7n;
    } while (byte & 0x80);
    n = n & 1n ? -((n + 1n) >> 1n) : n >> 1n;
    const out = Buffer.alloc(8);
    out.writeBigInt64LE(n);
    return out;
  }

  packLongBytes(value) {
    let n = Buffer.from(value).readBigInt64LE(0);
    n = n >= 0 ? n << 1n : ((-n) << 1n) - 1n;
    do {
      const more = n >= 128n;
      this.buf[this.pos++] = Number(n & 0x7fn) | (more ? 0x80 : 0);
      n >>= 7n;
    } while (n);
  }
}

function printJSON(value) {
  const seen = new Set();
  try {
    return JSON.stringify(value, (key, item) => {
      if (seen.has(item)) return '[Circular]';
      if (item && typeof item === 'object') seen.add(item);
      if (typeof BigInt !== 'undefined' && item instanceof BigInt) return `[BigInt ${item.toString()}n]`;
      return item;
    });
  } catch (error) {
    return '[Invalid JSON]';
  }
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
  printJSON
};
