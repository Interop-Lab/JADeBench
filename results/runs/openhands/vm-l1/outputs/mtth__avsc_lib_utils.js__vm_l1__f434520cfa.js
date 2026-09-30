'use strict';

const crypto = require('crypto');

const NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;
const textDecoder = typeof TextDecoder === 'function' ? new TextDecoder() : null;
const textEncoder = typeof TextEncoder === 'function' ? new TextEncoder() : null;
const FLOAT_BUFFER = new ArrayBuffer(8);
const FLOAT_VIEW = new DataView(FLOAT_BUFFER);

function getHash(value, algorithm) {
  return crypto.createHash(algorithm).update(value).digest();
}

function isBufferLike(value) {
  return value instanceof Uint8Array;
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function compare(left, right) {
  return left === right ? 0 : left < right ? -1 : 1;
}

const bufCompare = typeof Buffer === 'function'
  ? Buffer.compare
  : function bufCompareFallback(left, right) {
      const length = Math.min(left.length, right.length);
      for (let index = 0; index < length; index++) {
        if (left[index] !== right[index]) {
          return Math.sign(left[index] - right[index]);
        }
      }
      return compare(left.length, right.length);
    };

const bufEqual = typeof Buffer === 'function'
  ? function bufEqualNative(left, right) {
      return Buffer.prototype.equals.call(left, right);
    }
  : function bufEqualFallback(left, right) {
      return left.length === right.length && !bufCompare(left, right);
    };

function getOption(options, key, defaultValue) {
  const value = options[key];
  return value === undefined ? defaultValue : value;
}

function singleIndexOf(values, predicate) {
  let foundIndex = -1;
  for (let index = 0; index < values.length; index++) {
    if (predicate(values[index])) {
      if (foundIndex !== -1) {
        return -2;
      }
      foundIndex = index;
    }
  }
  return foundIndex;
}

function toMap(values, keyFunction) {
  const map = {};
  for (let index = 0; index < values.length; index++) {
    const value = values[index];
    map[keyFunction(value)] = value;
  }
  return map;
}

function objectValues(object) {
  return Object.keys(object).map((key) => object[key]);
}

function hasDuplicates(values, keyFunction) {
  const seen = Object.create(null);
  for (let index = 0; index < values.length; index++) {
    const value = keyFunction ? keyFunction(values[index]) : values[index];
    if (seen[value]) {
      return true;
    }
    seen[value] = true;
  }
  return false;
}

function copyOwnProperties(source, destination, overwrite) {
  Object.getOwnPropertyNames(source).forEach((key) => {
    if (key === 'prototype') {
      return;
    }
    if (overwrite || !Object.prototype.hasOwnProperty.call(destination, key)) {
      const descriptor = Object.getOwnPropertyDescriptor(source, key);
      Object.defineProperty(destination, key, descriptor);
    }
  });
}

function isValidName(name) {
  return NAME_PATTERN.test(name);
}

function qualify(name, namespace) {
  if (name.indexOf('.') < 0 && namespace) {
    return `${namespace}.${name}`;
  }
  return name.replace(/^\./, '');
}

function unqualify(name) {
  const parts = name.split('.');
  return parts[parts.length - 1];
}

function impliedNamespace(name) {
  const match = /^(.*)\.[^.]+$/.exec(name);
  return match ? match[1] : undefined;
}

function jsonEnd(json, position) {
  let index = position || 0;
  let character = json.charAt(index++);

  if (/[\d-]/.test(character)) {
    while (/[eE\d.+-]/.test(json.charAt(index))) {
      index++;
    }
    return index;
  }
  if (/true|null/.test(json.slice(index - 1, index + 3))) {
    return index + 3;
  }
  if (/false/.test(json.slice(index - 1, index + 4))) {
    return index + 4;
  }
  if (character === '{' || character === '[') {
    let depth = 1;
    let inString = false;
    while (depth && index < json.length) {
      character = json.charAt(index++);
      if (character === '"' && json.charAt(index - 2) !== '\\') {
        inString = !inString;
      } else if (!inString) {
        if (character === '{' || character === '[') {
          depth++;
        } else if (character === '}' || character === ']') {
          depth--;
        }
      }
    }
    return depth ? -1 : index;
  }
  if (character === '"') {
    while (index < json.length) {
      character = json.charAt(index++);
      if (character === '"' && json.charAt(index - 2) !== '\\') {
        return index;
      }
    }
  }
  return -1;
}

function abstractFunction() {
  throw new Error('abstract');
}

class Lcg {
  constructor(seed) {
    const multiplier = 1103515245;
    const increment = 12345;
    const modulus = Math.pow(2, 31);
    let state = seed || Math.floor(Math.random() * modulus);

    this._max = modulus;
    this._nextInt = () => {
      state = (multiplier * state + increment) % modulus;
      return state;
    };
  }

  nextBoolean() {
    return !!(this._nextInt() % 2);
  }

  nextInt(minimum, maximum) {
    if (maximum === undefined) {
      maximum = minimum === undefined ? this._max : minimum;
      minimum = 0;
    }
    return Math.floor(this.nextFloat(minimum, maximum));
  }

  nextFloat(minimum, maximum) {
    if (maximum === undefined) {
      maximum = minimum === undefined ? 1 : minimum;
      minimum = 0;
    }
    return minimum + (maximum - minimum) * this._nextInt() / this._max;
  }

  nextString(length, flags) {
    const enabled = flags || 'aA';
    const characterSets = [];
    if (enabled.indexOf('a') >= 0) characterSets.push('abcdefghijklmnopqrstuvwxyz');
    if (enabled.indexOf('A') >= 0) characterSets.push('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
    if (enabled.indexOf('#') >= 0) characterSets.push('0123456789');
    if (enabled.indexOf('!') >= 0) characterSets.push('~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\');
    const characters = characterSets.join('');
    const result = [];
    for (let index = 0; index < length; index++) {
      result.push(this.choice(characters));
    }
    return result.join('');
  }

  nextBuffer(length) {
    const buffer = new Uint8Array(length);
    for (let index = 0; index < length; index++) {
      buffer[index] = this.nextInt(256);
    }
    return buffer;
  }

  choice(values) {
    if (!values.length) {
      throw new Error('choosing from empty array');
    }
    return values[this.nextInt(values.length)];
  }
}

class OrderedQueue {
  constructor() {
    this._index = 0;
    this._items = [];
  }

  push(item) {
    const items = this._items;
    let index = items.length;
    items.push(item);
    while (index > 0 && items[index - 1].index < item.index) {
      items[index] = items[index - 1];
      index--;
    }
    items[index] = item;
  }

  pop() {
    const items = this._items;
    if (!items.length || items[items.length - 1].index > this._index) {
      return undefined;
    }
    this._index++;
    return items.pop();
  }
}

function decodeSlice(buffer, start, end) {
  if (typeof Buffer === 'function' && typeof Buffer.prototype.utf8Slice === 'function') {
    return Buffer.prototype.utf8Slice.call(buffer, start, end);
  }
  return textDecoder.decode(buffer.subarray(start, end));
}

function encodeSlice(value) {
  if (typeof Buffer === 'function') {
    return Buffer.from(value);
  }
  return textEncoder.encode(value);
}

function utf8Length(value) {
  return typeof Buffer === 'function' ? Buffer.byteLength(value) : encodeSlice(value).length;
}

function bufferToBinaryString(buffer) {
  if (typeof Buffer === 'function' && typeof Buffer.prototype.latin1Slice === 'function') {
    return Buffer.prototype.latin1Slice.call(buffer);
  }
  let value = '';
  let index = 0;
  const stop = buffer.length - 7;
  while (index < stop) {
    value += String.fromCharCode(
      buffer[index++], buffer[index++], buffer[index++], buffer[index++],
      buffer[index++], buffer[index++], buffer[index++], buffer[index++],
    );
  }
  while (index < buffer.length) {
    value += String.fromCharCode(buffer[index++]);
  }
  return value;
}

function binaryStringToBuffer(value) {
  if (typeof Buffer === 'function') {
    const buffer = Buffer.from(value, 'binary');
    return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.length);
  }
  const buffer = new Uint8Array(value.length);
  for (let index = 0; index < value.length; index++) {
    buffer[index] = value.charCodeAt(index);
  }
  return buffer;
}

class Tap {
  constructor(buffer, position) {
    this.setData(buffer, position);
  }

  setData(buffer, position) {
    if (typeof Buffer === 'function' && buffer instanceof Buffer) {
      buffer = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.length);
    }
    this.arr = buffer;
    this.pos = position || 0;
    if (this.pos < 0) {
      throw new Error('negative offset');
    }
  }

  get length() {
    return this.arr.length;
  }

  reinitialize(capacity) {
    this.setData(new Uint8Array(capacity));
  }

  static fromBuffer(buffer, position) {
    return new Tap(buffer, position);
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

  append(buffer) {
    const combined = new Uint8Array(this.arr.length + buffer.length);
    combined.set(this.arr, 0);
    combined.set(buffer, this.arr.length);
    this.setData(combined);
  }

  forward(length) {
    if (this.pos) {
      const remaining = this.arr.subarray(this.pos);
      const buffer = new Uint8Array(remaining.length + length);
      buffer.set(remaining, 0);
      this.setData(buffer);
    }
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
    let multiplier = 1;
    let byte;
    do {
      byte = this.arr[this.pos++];
      value += (byte & 0x7f) * multiplier;
      multiplier *= 128;
    } while (byte & 0x80);
    return value & 1 ? -(value + 1) / 2 : value / 2;
  }

  skipLong() {
    while (this.arr[this.pos++] & 0x80) {}
  }

  writeLong(value) {
    let encoded = value >= 0 ? value * 2 : -value * 2 - 1;
    do {
      const byte = encoded % 128;
      encoded = Math.floor(encoded / 128);
      this.arr[this.pos++] = encoded ? byte | 0x80 : byte;
    } while (encoded);
  }

  readFloat() {
    const position = this.pos;
    this.pos += 4;
    if (this.pos > this.arr.length) return 0;
    FLOAT_VIEW.setUint32(
      0,
      this.arr[position] |
        this.arr[position + 1] << 8 |
        this.arr[position + 2] << 16 |
        this.arr[position + 3] << 24,
      true,
    );
    return FLOAT_VIEW.getFloat32(0, true);
  }

  skipFloat() {
    this.pos += 4;
  }

  writeFloat(value) {
    const position = this.pos;
    this.pos += 4;
    if (this.pos > this.arr.length) return;
    FLOAT_VIEW.setFloat32(0, value, true);
    const bits = FLOAT_VIEW.getUint32(0, true);
    this.arr[position] = bits & 0xff;
    this.arr[position + 1] = bits >> 8 & 0xff;
    this.arr[position + 2] = bits >> 16 & 0xff;
    this.arr[position + 3] = bits >> 24 & 0xff;
  }

  readDouble() {
    const position = this.pos;
    this.pos += 8;
    if (this.pos > this.arr.length) return 0;
    FLOAT_VIEW.setUint32(
      0,
      this.arr[position] |
        this.arr[position + 1] << 8 |
        this.arr[position + 2] << 16 |
        this.arr[position + 3] << 24,
      true,
    );
    FLOAT_VIEW.setUint32(
      4,
      this.arr[position + 4] |
        this.arr[position + 5] << 8 |
        this.arr[position + 6] << 16 |
        this.arr[position + 7] << 24,
      true,
    );
    return FLOAT_VIEW.getFloat64(0, true);
  }

  skipDouble() {
    this.pos += 8;
  }

  writeDouble(value) {
    const position = this.pos;
    this.pos += 8;
    if (this.pos > this.arr.length) return;
    FLOAT_VIEW.setFloat64(0, value, true);
    const lowBits = FLOAT_VIEW.getUint32(0, true);
    const highBits = FLOAT_VIEW.getUint32(4, true);
    this.arr[position] = lowBits & 0xff;
    this.arr[position + 1] = lowBits >> 8 & 0xff;
    this.arr[position + 2] = lowBits >> 16 & 0xff;
    this.arr[position + 3] = lowBits >> 24 & 0xff;
    this.arr[position + 4] = highBits & 0xff;
    this.arr[position + 5] = highBits >> 8 & 0xff;
    this.arr[position + 6] = highBits >> 16 & 0xff;
    this.arr[position + 7] = highBits >> 24 & 0xff;
  }

  readFixed(length) {
    const position = this.pos;
    this.pos += length;
    if (this.pos > this.arr.length) return undefined;
    return this.arr.slice(position, this.pos);
  }

  skipFixed(length) {
    this.pos += length;
  }

  writeFixed(buffer, length) {
    const size = length === undefined ? buffer.length : length;
    const position = this.pos;
    this.pos += size;
    if (this.pos <= this.arr.length) {
      this.arr.set(buffer.subarray(0, size), position);
    }
  }

  readBytes() {
    const length = this.readLong();
    if (length < 0) {
      this._invalidate();
      return undefined;
    }
    return this.readFixed(length);
  }

  skipBytes() {
    const length = this.readLong();
    if (length < 0) {
      this._invalidate();
    } else {
      this.pos += length;
    }
  }

  writeBytes(buffer) {
    this.writeLong(buffer.length);
    this.writeFixed(buffer);
  }

  skipString() {
    this.skipBytes();
  }

  readString() {
    const length = this.readLong();
    if (length < 0) {
      this._invalidate();
      return undefined;
    }
    const position = this.pos;
    this.pos += length;
    if (this.pos > this.arr.length) return undefined;
    if (!length) return '';
    return decodeSlice(this.arr, position, this.pos);
  }

  writeString(value) {
    const buffer = encodeSlice(value);
    this.writeLong(buffer.length);
    this.writeFixed(buffer);
  }

  matchBoolean(other) {
    return compare(this.arr[this.pos++], other.arr[other.pos++]);
  }

  matchLong(other) {
    return compare(this.readLong(), other.readLong());
  }

  matchFloat(other) {
    return compare(this.readFloat(), other.readFloat());
  }

  matchDouble(other) {
    return compare(this.readDouble(), other.readDouble());
  }

  matchFixed(other, length) {
    return bufCompare(this.readFixed(length), other.readFixed(length));
  }

  matchBytes(other) {
    const leftLength = this.readLong();
    const leftPosition = this.pos;
    this.pos += leftLength;
    const rightLength = other.readLong();
    const rightPosition = other.pos;
    other.pos += rightLength;
    return bufCompare(
      this.arr.subarray(leftPosition, leftPosition + leftLength),
      other.arr.subarray(rightPosition, rightPosition + rightLength),
    );
  }

  unpackLongBytes() {
    let encoded = 0n;
    let shift = 0n;
    let byte;
    do {
      byte = this.arr[this.pos++];
      encoded |= BigInt(byte & 0x7f) << shift;
      shift += 7n;
    } while (byte & 0x80);

    let value = encoded & 1n ? -((encoded + 1n) >> 1n) : encoded >> 1n;
    value = BigInt.asUintN(64, value);
    const bytes = new Uint8Array(8);
    for (let index = 0; index < bytes.length; index++) {
      bytes[index] = Number(value & 0xffn);
      value >>= 8n;
    }
    return bytes;
  }

  packLongBytes(bytes) {
    let value = 0n;
    for (let index = 7; index >= 0; index--) {
      value = value << 8n | BigInt(bytes[index]);
    }
    value = BigInt.asIntN(64, value);
    let encoded = value >= 0n ? value << 1n : (-value << 1n) - 1n;
    do {
      const byte = Number(encoded & 0x7fn);
      encoded >>= 7n;
      this.arr[this.pos++] = encoded ? byte | 0x80 : byte;
    } while (encoded);
  }
}

function printJSON(value) {
  const seen = new Set();
  return JSON.stringify(
    value,
    (key, child) => {
      if (child && typeof child === 'object') {
        if (seen.has(child)) return '[object]';
        seen.add(child);
      }
      return child;
    },
    2,
  );
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
