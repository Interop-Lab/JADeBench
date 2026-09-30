'use strict';

const crypto = require('crypto');

const NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

function abstractFunction() {
  throw new Error('abstract');
}

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function compare(left, right) {
  return left === right ? 0 : left < right ? -1 : 1;
}

const bufCompare = Buffer.compare;
function bufEqual(left, right) {
  return left.length === right.length && Buffer.compare(left, right) === 0;
}

function bufferToBinaryString(buffer) {
  return Buffer.from(buffer).toString('latin1');
}

function binaryStringToBuffer(string) {
  return Buffer.from(string, 'latin1');
}

function copyOwnProperties(source, destination, overwrite = false) {
  for (const name of Object.getOwnPropertyNames(source)) {
    if (overwrite || !Object.prototype.hasOwnProperty.call(destination, name)) {
      Object.defineProperty(destination, name, Object.getOwnPropertyDescriptor(source, name));
    }
  }
  return destination;
}

function getHash(value, algorithm = 'md5') {
  return crypto.createHash(algorithm).update(value).digest();
}

function getOption(options, name, defaultValue) {
  return options && options[name] !== undefined ? options[name] : defaultValue;
}

function impliedNamespace(name) {
  const index = name.lastIndexOf('.');
  return index < 0 ? undefined : name.slice(0, index);
}

function isBufferLike(value) {
  return Buffer.isBuffer(value) || value instanceof Uint8Array;
}

function isValidName(name) {
  return NAME_PATTERN.test(name);
}

function jsonEnd(string, position) {
  let depth = 0;
  let quoted = false;
  let escaped = false;
  for (let i = position || 0; i < string.length; i++) {
    const char = string.charAt(i);
    if (quoted) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === '"') quoted = false;
    } else if (char === '"') {
      quoted = true;
    } else if (char === '{' || char === '[') {
      depth++;
    } else if (char === '}' || char === ']') {
      if (--depth === 0) return i + 1;
    } else if (!depth && /\s/.test(char)) {
      return i;
    }
  }
  return string.length;
}

function objectValues(object) {
  return Object.keys(object).map((key) => object[key]);
}

function qualify(name, namespace) {
  if (name.includes('.')) return name;
  return namespace ? `${namespace}.${name}` : name;
}

function unqualify(name) {
  const index = name.lastIndexOf('.');
  return name.slice(index + 1);
}

function toMap(array, keyFunction) {
  const map = {};
  for (const value of array) map[keyFunction(value)] = value;
  return map;
}

function singleIndexOf(array, value) {
  const index = array.indexOf(value);
  return index >= 0 && index === array.lastIndexOf(value) ? index : -1;
}

function hasDuplicates(array, keyFunction) {
  const seen = new Set();
  for (const value of array) {
    const key = keyFunction ? keyFunction(value) : value;
    if (seen.has(key)) return true;
    seen.add(key);
  }
  return false;
}

class Lcg {
  constructor(seed) {
    this.state = seed === undefined ? Math.floor(Math.random() * 0x80000000) : seed >>> 0;
  }

  nextBoolean() {
    return this.nextInt(0, 2) === 1;
  }

  nextInt(start, end) {
    this.state = (Math.imul(this.state, 1103515245) + 12345) & 0x7fffffff;
    return start + Math.floor((this.state / 0x80000000) * (end - start));
  }

  nextFloat(start, end) {
    this.state = (Math.imul(this.state, 1103515245) + 12345) & 0x7fffffff;
    return start + (this.state / 0x80000000) * (end - start);
  }

  nextString(length, flags = 'aA') {
    let characters = '';
    if (flags.includes('a')) characters += 'abcdefghijklmnopqrstuvwxyz';
    if (flags.includes('A')) characters += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (flags.includes('#')) characters += '0123456789';
    if (flags.includes('!')) characters += '~`!@#$%^&*()-_=+[]{};:\'",.<>/?\\|';
    let result = '';
    while (result.length < length) result += characters[this.nextInt(0, characters.length)];
    return result;
  }

  nextBuffer(length) {
    const buffer = Buffer.alloc(length);
    for (let i = 0; i < length; i++) buffer[i] = this.nextInt(0, 256);
    return buffer;
  }

  choice(array) {
    if (!array.length) throw new Error('choosing from empty array');
    return array[this.nextInt(0, array.length)];
  }
}

class OrderedQueue {
  constructor() {
    this.index = 0;
    this.items = [];
  }

  push(item) {
    let low = 0;
    let high = this.items.length;
    while (low < high) {
      const middle = (low + high) >>> 1;
      if (this.items[middle].index < item.index) low = middle + 1;
      else high = middle;
    }
    this.items.splice(low, 0, item);
  }

  pop() {
    if (!this.items.length || this.items[0].index !== this.index) return null;
    this.index++;
    return this.items.shift();
  }
}

class Tap {
  constructor(buffer, position = 0) {
    this.setData(buffer, position);
  }

  setData(buffer, position = 0) {
    this.buf = Buffer.from(buffer || []);
    this.pos = position;
    return this;
  }

  get length() { return this.buf.length; }
  reinitialize(position = 0) { this.pos = position; return this; }
  static fromBuffer(buffer, position = 0) { return new Tap(buffer, position); }
  static withCapacity(capacity) { return new Tap(Buffer.alloc(capacity)); }
  toBuffer() { return this.buf.subarray(0, this.pos); }
  subarray(start, end) { return this.buf.subarray(start, end); }

  append(buffer) {
    const required = this.pos + buffer.length;
    if (required > this.buf.length) {
      const grown = Buffer.alloc(Math.max(required, this.buf.length * 2 || 1));
      this.buf.copy(grown);
      this.buf = grown;
    }
    Buffer.from(buffer).copy(this.buf, this.pos);
    this.pos = required;
    return this;
  }

  forward(count) { this.pos += count; return this; }
  isValid() { return this.pos <= this.buf.length; }
  _invalidate() { this.pos = this.buf.length + 1; }
  _ensure(count) { if (this.pos + count > this.buf.length) this._invalidate(); }

  readBoolean() { return !!this.buf[this.pos++]; }
  skipBoolean() { this.pos++; }
  writeBoolean(value) { this._writeByte(value ? 1 : 0); }

  readLong() {
    let value = 0n;
    let shift = 0n;
    let byte;
    do {
      if (this.pos >= this.buf.length) { this._invalidate(); return 0; }
      byte = this.buf[this.pos++];
      value |= BigInt(byte & 0x7f) << shift;
      shift += 7n;
    } while (byte & 0x80);
    const decoded = (value >> 1n) ^ -(value & 1n);
    return Number(decoded);
  }

  skipLong() {
    while (this.pos < this.buf.length && this.buf[this.pos++] & 0x80) {}
    if (this.pos > this.buf.length) this._invalidate();
  }

  writeLong(value) {
    let encoded = (BigInt(Math.trunc(value)) << 1n) ^ (BigInt(Math.trunc(value)) >> 63n);
    while (encoded > 0x7fn) {
      this._writeByte(Number(encoded & 0x7fn) | 0x80);
      encoded >>= 7n;
    }
    this._writeByte(Number(encoded));
  }

  readFloat() { const value = this.buf.readFloatLE(this.pos); this.pos += 4; return value; }
  skipFloat() { this.pos += 4; }
  writeFloat(value) { this._ensureWritable(4); this.buf.writeFloatLE(value, this.pos); this.pos += 4; }
  readDouble() { const value = this.buf.readDoubleLE(this.pos); this.pos += 8; return value; }
  skipDouble() { this.pos += 8; }
  writeDouble(value) { this._ensureWritable(8); this.buf.writeDoubleLE(value, this.pos); this.pos += 8; }

  readFixed(length) { const value = this.buf.subarray(this.pos, this.pos + length); this.pos += length; return value; }
  skipFixed(length) { this.pos += length; }
  writeFixed(value, length) { this.append(Buffer.from(value).subarray(0, length === undefined ? value.length : length)); }
  readBytes() { return this.readFixed(this.readLong()); }
  skipBytes() { this.skipFixed(this.readLong()); }
  writeBytes(value) { this.writeLong(value.length); this.append(value); }
  skipString() { this.skipBytes(); }
  readString() { return this.readBytes().toString('utf8'); }
  writeString(value) { const bytes = Buffer.from(value, 'utf8'); this.writeBytes(bytes); }

  matchBoolean(other) { return compare(this.readBoolean(), other.readBoolean()); }
  matchLong(other) { return compare(this.readLong(), other.readLong()); }
  matchFloat(other) { return compare(this.readFloat(), other.readFloat()); }
  matchDouble(other) { return compare(this.readDouble(), other.readDouble()); }
  matchFixed(other, length) { return bufCompare(this.readFixed(length), other.readFixed(length)); }
  matchBytes(other) { return bufCompare(this.readBytes(), other.readBytes()); }

  unpackLongBytes() {
    const bytes = this.readFixed(8);
    return bytes.readBigInt64LE(0).toString();
  }

  packLongBytes(value) {
    const bytes = Buffer.alloc(8);
    bytes.writeBigInt64LE(BigInt(value));
    this.append(bytes);
  }

  _writeByte(value) { this._ensureWritable(1); this.buf[this.pos++] = value; }
  _ensureWritable(count) {
    if (this.pos + count > this.buf.length) {
      const grown = Buffer.alloc(Math.max(this.pos + count, this.buf.length * 2 || 1));
      this.buf.copy(grown);
      this.buf = grown;
    }
  }
}

function invert(object, value) {
  const result = {};
  for (const key of Object.keys(object)) result[object[key]] = value === undefined ? key : value;
  return result;
}

function printJSON(value) {
  return JSON.stringify(value, (_, item) => typeof item === 'bigint' ? item.toString() : item);
}

Object.assign(globalThis, { Lcg, OrderedQueue, Tap, bufCompare, bufEqual, bufferToBinaryString, binaryStringToBuffer });

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
