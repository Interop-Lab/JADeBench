'use strict';

const crypto = require('crypto');
const { Buffer } = require('buffer');

function abstractFunction() {
  throw new Error('abstract');
}

function isBufferLike(value) {
  return value instanceof Uint8Array;
}

const bufCompare = Buffer.compare;

function bufEqual(first, second) {
  return first.length === second.length && Buffer.compare(first, second) === 0;
}

function bufferToBinaryString(buffer) {
  return Buffer.prototype.latin1Slice.call(buffer);
}

function binaryStringToBuffer(value) {
  return Buffer.from(value, 'latin1');
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function copyOwnProperties(source, destination, overwrite) {
  Object.getOwnPropertyNames(source).forEach(name => {
    const descriptor = Object.getOwnPropertyDescriptor(source, name);
    if (overwrite || !Object.prototype.hasOwnProperty.call(destination, name)) {
      Object.defineProperty(destination, name, descriptor);
    }
  });
  Object.getOwnPropertySymbols(source).forEach(symbol => {
    const descriptor = Object.getOwnPropertyDescriptor(source, symbol);
    if (overwrite || !Object.prototype.hasOwnProperty.call(destination, symbol)) {
      Object.defineProperty(destination, symbol, descriptor);
    }
  });
  return destination;
}

function getHash(value) {
  return crypto.createHash('md5').update(value).digest('hex');
}

function compare(first, second) {
  return first === second ? 0 : first < second ? -1 : 1;
}

function getOption(options, name, defaultValue) {
  return options && options[name] !== undefined ? options[name] : defaultValue;
}

function impliedNamespace(name) {
  const index = name.lastIndexOf('.');
  return index < 0 ? undefined : name.slice(0, index);
}

function isValidName(name) {
  return /^[A-Za-z_][A-Za-z0-9_]*$/.test(name);
}

function jsonEnd(value, position = 0) {
  const opening = value.charAt(position);
  if (opening !== '{' && opening !== '[') return position;

  const stack = [opening === '{' ? '}' : ']'];
  let inString = false;
  for (let i = position + 1; i < value.length; i++) {
    const character = value.charAt(i);
    if (inString) {
      if (character === '\\') i++;
      else if (character === '"') inString = false;
      continue;
    }
    if (character === '"') inString = true;
    else if (character === '{') stack.push('}');
    else if (character === '[') stack.push(']');
    else if (character === stack[stack.length - 1]) {
      stack.pop();
      if (!stack.length) return i + 1;
    }
  }
  return -1;
}

function objectValues(object) {
  return Object.keys(object).map(key => object[key]);
}

function qualify(name, namespace) {
  if (name.includes('.')) return name;
  return namespace ? `${namespace}.${name}` : name;
}

function unqualify(name) {
  const index = name.lastIndexOf('.');
  return index < 0 ? name : name.slice(index + 1);
}

function toMap(array, keySelector) {
  const map = {};
  array.forEach(value => {
    map[keySelector(value)] = value;
  });
  return map;
}

function singleIndexOf(array, value) {
  const index = array.indexOf(value);
  return index >= 0 && array.lastIndexOf(value) === index ? index : -1;
}

function hasDuplicates(array, keySelector = value => value) {
  const seen = Object.create(null);
  for (const value of array) {
    const key = keySelector(value);
    if (seen[key]) return true;
    seen[key] = true;
  }
  return false;
}

class Lcg {
  constructor(seed) {
    this._state = seed === undefined ? Math.floor(Math.random() * 0x100000000) : seed;
  }

  _next() {
    this._state = (Math.imul(this._state, 1664525) + 1013904223) >>> 0;
    return this._state / 0x100000000;
  }

  nextBoolean() {
    return this._next() < 0.5;
  }

  nextInt(start, end) {
    if (end === undefined) {
      end = start;
      start = 0;
    }
    return Math.floor(this._next() * (end - start)) + start;
  }

  nextFloat(start, end) {
    if (end === undefined) {
      end = start;
      start = 0;
    }
    return this._next() * (end - start) + start;
  }

  nextString(length, flags = 'aA') {
    let alphabet = '';
    if (flags.includes('a')) alphabet += 'abcdefghijklmnopqrstuvwxyz';
    if (flags.includes('A')) alphabet += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (flags.includes('#')) alphabet += '0123456789';
    if (flags.includes('!')) alphabet += '~!@#$%^&*()_+-={}[];\',.';
    let value = '';
    while (value.length < length) value += this.choice(alphabet);
    return value;
  }

  nextBuffer(length) {
    const buffer = Buffer.alloc(length);
    for (let i = 0; i < length; i++) buffer[i] = this.nextInt(256);
    return buffer;
  }

  choice(array) {
    if (!array.length) throw new Error('choosing from empty array');
    return array[this.nextInt(array.length)];
  }
}

class OrderedQueue {
  constructor() {
    this._index = 0;
    this._items = [];
  }

  push(item) {
    const offset = item.index - this._index;
    if (offset < 0 || this._items[offset] !== undefined) {
      throw new Error(`invalid index: ${item.index}`);
    }
    this._items[offset] = item;
  }

  pop() {
    const item = this._items[0];
    if (item === undefined) return null;
    this._index++;
    this._items.shift();
    return item;
  }
}

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

class Tap {
  constructor(buffer, position = 0) {
    this.setData(buffer, position);
  }

  setData(buffer, position = 0) {
    this.buf = buffer;
    this.pos = position;
  }

  get length() {
    return this.buf.length;
  }

  reinitialize(capacity) {
    this.buf = Buffer.alloc(capacity);
    this.pos = 0;
  }

  static fromBuffer(buffer, position = 0) {
    return new Tap(buffer, position);
  }

  static withCapacity(capacity) {
    return new Tap(Buffer.alloc(capacity));
  }

  toBuffer() {
    return this.buf.subarray(0, this.pos);
  }

  subarray(start, end) {
    return this.buf.subarray(start, end);
  }

  append(buffer) {
    const required = this.pos + buffer.length;
    if (required > this.buf.length) {
      this.pos = required;
      return;
    }
    Buffer.from(buffer).copy(this.buf, this.pos);
    this.pos = required;
  }

  forward(count) {
    this.pos += count;
  }

  isValid() {
    return this.pos <= this.buf.length;
  }

  _invalidate() {
    this.pos = this.buf.length + 1;
  }

  readBoolean() {
    return !!this.buf[this.pos++];
  }

  skipBoolean() {
    this.pos++;
  }

  writeBoolean(value) {
    if (this.pos < this.buf.length) this.buf[this.pos] = value ? 1 : 0;
    this.pos++;
  }

  readLong() {
    let shift = 0n;
    let value = 0n;
    let byte;
    do {
      byte = this.buf[this.pos++];
      value |= BigInt(byte & 0x7f) << shift;
      shift += 7n;
    } while (byte & 0x80);
    const decoded = value & 1n ? -((value + 1n) >> 1n) : value >> 1n;
    return Number(decoded);
  }

  skipLong() {
    while (this.buf[this.pos++] & 0x80) {}
  }

  writeLong(value) {
    let encoded = value >= 0 ? BigInt(value) << 1n : (-BigInt(value) << 1n) - 1n;
    do {
      const byte = Number(encoded & 0x7fn) | (encoded >= 128n ? 0x80 : 0);
      if (this.pos < this.buf.length) this.buf[this.pos] = byte;
      this.pos++;
      encoded >>= 7n;
    } while (encoded);
  }

  readFloat() {
    const value = this.pos + 4 <= this.buf.length ? this.buf.readFloatLE(this.pos) : 0;
    this.pos += 4;
    return value;
  }

  skipFloat() {
    this.pos += 4;
  }

  writeFloat(value) {
    if (this.pos + 4 <= this.buf.length) this.buf.writeFloatLE(value, this.pos);
    this.pos += 4;
  }

  readDouble() {
    const value = this.pos + 8 <= this.buf.length ? this.buf.readDoubleLE(this.pos) : 0;
    this.pos += 8;
    return value;
  }

  skipDouble() {
    this.pos += 8;
  }

  writeDouble(value) {
    if (this.pos + 8 <= this.buf.length) this.buf.writeDoubleLE(value, this.pos);
    this.pos += 8;
  }

  readFixed(length) {
    const end = this.pos + length;
    const value = this.buf.subarray(this.pos, end);
    this.pos = end;
    return value;
  }

  skipFixed(length) {
    this.pos += length;
  }

  writeFixed(buffer, length = buffer.length) {
    this.append(buffer.subarray(0, length));
  }

  readBytes() {
    return this.readFixed(this.readLong());
  }

  skipBytes() {
    this.pos += this.readLong();
  }

  writeBytes(buffer) {
    this.writeLong(buffer.length);
    this.append(buffer);
  }

  skipString() {
    this.skipBytes();
  }

  readString() {
    return textDecoder.decode(this.readBytes());
  }

  writeString(value) {
    this.writeBytes(textEncoder.encode(value));
  }

  matchBoolean(tap) {
    return compare(this.readBoolean(), tap.readBoolean());
  }

  matchLong(tap) {
    return compare(this.readLong(), tap.readLong());
  }

  matchFloat(tap) {
    return compare(this.readFloat(), tap.readFloat());
  }

  matchDouble(tap) {
    return compare(this.readDouble(), tap.readDouble());
  }

  matchFixed(tap, length) {
    return bufCompare(this.readFixed(length), tap.readFixed(length));
  }

  matchBytes(tap) {
    return bufCompare(this.readBytes(), tap.readBytes());
  }

  unpackLongBytes() {
    let value = BigInt(this.readLong());
    const bytes = Buffer.alloc(8);
    for (let i = 0; i < 8; i++) {
      bytes[i] = Number(value & 255n);
      value >>= 8n;
    }
    return bytes;
  }

  packLongBytes(bytes) {
    let value = 0n;
    for (let i = 7; i >= 0; i--) value = (value << 8n) | BigInt(bytes[i]);
    if (value & (1n << 63n)) value -= 1n << 64n;
    this.writeLong(Number(value));
  }
}

function printJSON(value) {
  return JSON.stringify(value, (key, item) => {
    if (item && item.type === 'Buffer' && Array.isArray(item.data)) {
      return Buffer.from(item.data).toString('hex');
    }
    return item;
  });
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
