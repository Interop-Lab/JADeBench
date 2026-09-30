'use strict';

const crypto = require('crypto');

const NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;
const FLOAT_VIEW = new DataView(new ArrayBuffer(8));
const ENCODER = new TextEncoder();
const DECODER = new TextDecoder();

function abstractFunction() {
  throw new Error('Not implemented');
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
  bufEqual = function (a, b) {
    return Buffer.prototype.equals.call(a, b);
  };
} else {
  bufCompare = function (a, b) {
    if (a === b) {
      return 0;
    }
    const length = Math.min(a.length, b.length);
    for (let i = 0; i < length; i++) {
      if (a[i] !== b[i]) {
        return Math.sign(a[i] - b[i]);
      }
    }
    return Math.sign(a.length - b.length);
  };

  bufEqual = function (a, b) {
    return a.length === b.length && bufCompare(a, b) === 0;
  };
}

function getOption(options, key, defaultValue) {
  const value = options[key];
  return value === undefined ? defaultValue : value;
}

function singleIndexOf(array, value) {
  let found = -1;
  if (!array) {
    return -1;
  }
  for (let i = 0; i < array.length; i++) {
    if (array[i] === value) {
      if (found >= 0) {
        return -2;
      }
      found = i;
    }
  }
  return found;
}

function toMap(array, keyFunction) {
  const map = {};
  for (let i = 0; i < array.length; i++) {
    const value = array[i];
    map[keyFunction(value)] = value;
  }
  return map;
}

function objectValues(object) {
  return Object.keys(object).map((key) => object[key]);
}

function hasDuplicates(array, keyFunction) {
  const seen = Object.create(null);
  for (let i = 0; i < array.length; i++) {
    let value = array[i];
    if (keyFunction) {
      value = keyFunction(value);
    }
    if (seen[value]) {
      return true;
    }
    seen[value] = true;
  }
  return false;
}

function copyOwnProperties(source, target, overwrite) {
  const names = Object.getOwnPropertyNames(source);
  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    if (
      !Object.prototype.hasOwnProperty.call(target, name) ||
      overwrite
    ) {
      Object.defineProperty(
        target,
        name,
        Object.getOwnPropertyDescriptor(source, name)
      );
    }
  }
  return target;
}

function isValidName(name) {
  return NAME_PATTERN.test(name);
}

function qualify(name, namespace) {
  if (~name.indexOf('.')) {
    name = name.replace(/^\./, '');
  } else if (namespace) {
    name = namespace + '.' + name;
  }

  name.split('.').forEach((part) => {
    if (!isValidName(part)) {
      throw new Error('invalid name: ' + printJSON(name));
    }
  });

  return name;
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
  position = position || 0;
  let character = json.charAt(position++);

  if (/[\d-]/.test(character)) {
    while (/[eE\d.+-]/.test(json.charAt(position))) {
      position++;
    }
    return position;
  }

  if (/true|null/.test(json.slice(position - 1, position + 3))) {
    return position + 3;
  }

  if (/false/.test(json.slice(position - 1, position + 4))) {
    return position + 4;
  }

  let depth = 0;
  let quoted = false;

  do {
    switch (character) {
      case '{':
      case '[':
        if (!quoted) {
          depth++;
        }
        break;
      case '}':
      case ']':
        if (!quoted && !--depth) {
          return position;
        }
        break;
      case '"':
        quoted = !quoted;
        if (!depth && !quoted) {
          return position;
        }
        break;
      case '\\':
        position++;
        break;
    }
  } while ((character = json.charAt(position++)));

  return -1;
}

function printJSON(value) {
  const seen = new Set();

  try {
    return JSON.stringify(value, (key, current) => {
      if (seen.has(current)) {
        return '[Circular]';
      }

      if (typeof current === 'object' && current !== null) {
        seen.add(current);
      }

      if (
        typeof BigInt === 'function' &&
        typeof current === 'bigint'
      ) {
        return '[BigInt ' + current.toString() + 'n]';
      }

      return current;
    });
  } catch (error) {
    return '[Invalid JSON]';
  }
}

function getHash(value, algorithm) {
  algorithm = algorithm || 'md5';
  const hash = crypto.createHash(algorithm);
  hash.end(value);
  const digest = hash.read();
  return new Uint8Array(
    digest.buffer,
    digest.byteOffset,
    digest.length
  );
}

class Lcg {
  constructor(seed) {
    const multiplier = 1103515245;
    const increment = 12345;
    const modulus = Math.pow(2, 31);
    let state = Math.floor(seed || Math.random() * (modulus - 1));

    this._max = modulus;
    this._next = function () {
      state = (multiplier * state + increment) % modulus;
      return state;
    };
  }

  nextBoolean() {
    return !!(this._next() % 2);
  }

  nextInt(start, end) {
    if (end === undefined) {
      end = start;
      start = 0;
    }
    end = end === undefined ? this._max : end;
    return start + Math.floor(this._next() * (end - start) / this._max);
  }

  nextFloat(start, end) {
    if (end === undefined) {
      end = start;
      start = 0;
    }
    end = end === undefined ? 1 : end;
    return start + this._next() / this._max * (end - start);
  }

  nextString(length, flags) {
    length |= 0;
    flags = flags || 'aA';

    let mask = '';
    if (~flags.indexOf('a')) {
      mask += 'abcdefghijklmnopqrstuvwxyz';
    }
    if (~flags.indexOf('A')) {
      mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    }
    if (~flags.indexOf('#')) {
      mask += '0123456789';
    }
    if (~flags.indexOf('!')) {
      mask += '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~';
    }

    const result = [];
    for (let i = 0; i < length; i++) {
      result.push(this.choice(mask));
    }
    return result.join('');
  }

  nextBuffer(length) {
    const buffer = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      buffer[i] = this.nextInt(256);
    }
    return buffer;
  }

  choice(array) {
    const length = array.length;
    if (!length) {
      throw new Error('choosing from empty array');
    }
    return array[this.nextInt(length)];
  }
}

class OrderedQueue {
  constructor() {
    this.index = 0;
    this.items = [];
  }

  push(item) {
    const items = this.items;
    let index = items.length;
    let parent;

    items.push(item);

    while (
      index > 0 &&
      items[index].index <
        items[parent = (index - 1) >> 1].index
    ) {
      item = items[index];
      items[index] = items[parent];
      items[parent] = item;
      index = parent;
    }
  }

  pop() {
    const items = this.items;
    const lastIndex = items.length - 1;
    const first = items[0];

    if (!first || first.index > this.index) {
      return null;
    }

    this.index++;

    if (!lastIndex) {
      items.pop();
      return first;
    }

    items[0] = items.pop();

    const half = lastIndex >> 1;
    let index = 0;

    while (index < half) {
      const leftIndex = (index << 1) + 1;
      const rightIndex = leftIndex + 1;
      const left = items[leftIndex];
      const right = items[rightIndex];

      let child;
      let childIndex;

      if (!right || left.index < right.index) {
        child = left;
        childIndex = leftIndex;
      } else {
        child = right;
        childIndex = rightIndex;
      }

      if (child.index >= items[index].index) {
        break;
      }

      items[childIndex] = items[index];
      items[index] = child;
      index = childIndex;
    }

    return first;
  }
}

function decodeSlice(buffer, start, end) {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(
      buffer.buffer,
      buffer.byteOffset + start,
      Math.max(0, end - start)
    ).toString();
  }
  return DECODER.decode(buffer.subarray(start, end));
}

const encodeBuffer = new Uint8Array(4096);
const encodedBuffers = [];

function encodeSlice(value) {
  if (typeof ENCODER.encodeInto === 'function') {
    const result = ENCODER.encodeInto(value, encodeBuffer);
    if (result.read === value.length) {
      if (!encodedBuffers[result.written]) {
        encodedBuffers[result.written] =
          encodeBuffer.slice(0, result.written);
      }
      return encodedBuffers[result.written];
    }
  }
  return ENCODER.encode(value);
}

function utf8Length(value) {
  if (typeof Buffer !== 'undefined') {
    return Buffer.byteLength(value);
  }

  let length = 0;
  while (value.length) {
    if (typeof ENCODER.encodeInto === 'function') {
      const result = ENCODER.encodeInto(value, encodeBuffer);
      length += result.written;
      if (result.read === value.length) {
        break;
      }
      value = value.slice(result.read);
    } else {
      return ENCODER.encode(value).length;
    }
  }
  return length;
}

function bufferToBinaryString(buffer) {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(
      buffer.buffer,
      buffer.byteOffset,
      buffer.byteLength
    ).toString('binary');
  }

  let result = '';
  let index = 0;

  for (; index + 8 <= buffer.length; index += 8) {
    result += String.fromCharCode(
      buffer[index],
      buffer[index + 1],
      buffer[index + 2],
      buffer[index + 3],
      buffer[index + 4],
      buffer[index + 5],
      buffer[index + 6],
      buffer[index + 7]
    );
  }

  for (; index < buffer.length; index++) {
    result += String.fromCharCode(buffer[index]);
  }

  return result;
}

function binaryStringToBuffer(value) {
  if (typeof Buffer !== 'undefined') {
    const buffer = Buffer.from(value, 'binary');
    return new Uint8Array(
      buffer.buffer,
      buffer.byteOffset,
      buffer.length
    );
  }

  const buffer = new Uint8Array(value.length);
  for (let i = 0; i < value.length; i++) {
    buffer[i] = value.charCodeAt(i);
  }
  return buffer;
}

function invert(buffer, length) {
  while (length--) {
    buffer[length] = ~buffer[length];
  }
}

class Tap {
  constructor(buffer, position) {
    this.reset(buffer, position);
  }

  reset(buffer, position) {
    if (
      typeof Buffer !== 'undefined' &&
      buffer instanceof Buffer
    ) {
      buffer = new Uint8Array(
        buffer.buffer,
        buffer.byteOffset,
        buffer.length
      );
    }

    this.buf = buffer;
    this.pos = position | 0;

    if (this.pos < 0) {
      throw new Error('invalid offset');
    }
  }

  get length() {
    return this.buf.length;
  }

  reinitialize(capacity) {
    this.reset(new Uint8Array(capacity));
  }

  static fromBuffer(buffer, position) {
    return new Tap(buffer, position);
  }

  static withCapacity(capacity) {
    return new Tap(new Uint8Array(capacity));
  }

  subarray() {
    return this.buf.subarray(0, this.pos);
  }

  slice(start, end) {
    return this.buf.slice(start, end);
  }

  append(buffer) {
    const combined = new Uint8Array(this.buf.length + buffer.length);
    combined.set(this.buf, 0);
    combined.set(buffer, this.buf.length);
    this.reset(combined, 0);
  }

  forward(buffer) {
    const remaining = this.buf.subarray(this.pos);
    const combined = new Uint8Array(
      remaining.length + buffer.length
    );
    combined.set(remaining, 0);
    combined.set(buffer, remaining.length);
    this.reset(combined, 0);
  }

  isValid() {
    return this.pos <= this.buf.length;
  }

  invalidate() {
    this.pos = this.buf.length + 1;
  }

  readBoolean() {
    return !!this.buf[this.pos++];
  }

  skipBoolean() {
    this.pos++;
  }

  writeBoolean(value) {
    this.buf[this.pos++] = !!value;
  }

  readLong() {
    let n = 0;
    let k = 0;
    let b;

    do {
      b = this.buf[this.pos++];
      n |= (b & 0x7f) << k;
      k += 7;
    } while (b & 0x80 && k < 28);

    if (b & 0x80) {
      let value = n;
      let factor = 0x10000000;

      do {
        b = this.buf[this.pos++];
        value += (b & 0x7f) * factor;
        factor *= 128;
      } while (b & 0x80);

      return (value % 2 ? -(value + 1) : value) / 2;
    }

    return (n >>> 1) ^ -(n & 1);
  }

  skipLong() {
    while (this.buf[this.pos++] & 0x80) {}
  }

  writeLong(value) {
    const buffer = this.buf;

    if (value >= -1073741824 && value < 1073741824) {
      let n = value >= 0 ? value * 2 : -value * 2 - 1;

      do {
        buffer[this.pos] = n & 0x7f;
        n >>>= 7;
      } while (n && (buffer[this.pos++] |= 0x80));

      this.pos++;
      return;
    }

    let n = value >= 0 ? value * 2 : -value * 2 - 1;

    do {
      buffer[this.pos] = n & 0x7f;
      n /= 128;
    } while (n >= 1 && (buffer[this.pos++] |= 0x80));

    this.pos++;
  }

  readFloat() {
    const position = this.pos;
    this.pos += 4;

    if (this.pos > this.buf.length) {
      return 0;
    }

    FLOAT_VIEW.setUint8(0, this.buf[position]);
    FLOAT_VIEW.setUint8(1, this.buf[position + 1]);
    FLOAT_VIEW.setUint8(2, this.buf[position + 2]);
    FLOAT_VIEW.setUint8(3, this.buf[position + 3]);
    return FLOAT_VIEW.getFloat32(0, true);
  }

  skipFloat() {
    this.pos += 4;
  }

  writeFloat(value) {
    const position = this.pos;
    this.pos += 4;

    if (this.pos > this.buf.length) {
      return;
    }

    FLOAT_VIEW.setFloat32(0, value, true);
    this.buf[position] = FLOAT_VIEW.getUint8(0);
    this.buf[position + 1] = FLOAT_VIEW.getUint8(1);
    this.buf[position + 2] = FLOAT_VIEW.getUint8(2);
    this.buf[position + 3] = FLOAT_VIEW.getUint8(3);
  }

  readDouble() {
    const position = this.pos;
    this.pos += 8;

    if (this.pos > this.buf.length) {
      return 0;
    }

    for (let i = 0; i < 8; i++) {
      FLOAT_VIEW.setUint8(i, this.buf[position + i]);
    }
    return FLOAT_VIEW.getFloat64(0, true);
  }

  skipDouble() {
    this.pos += 8;
  }

  writeDouble(value) {
    const position = this.pos;
    this.pos += 8;

    if (this.pos > this.buf.length) {
      return;
    }

    FLOAT_VIEW.setFloat64(0, value, true);
    for (let i = 0; i < 8; i++) {
      this.buf[position + i] = FLOAT_VIEW.getUint8(i);
    }
  }

  readFixed(length) {
    const position = this.pos;
    this.pos += length;

    if (this.pos > this.buf.length) {
      return;
    }

    return this.buf.slice(position, position + length);
  }

  skipFixed(length) {
    this.pos += length;
  }

  writeFixed(buffer, length) {
    length = length || buffer.length;
    const position = this.pos;
    this.pos += length;

    if (this.pos > this.buf.length) {
      return;
    }

    this.buf.set(buffer.subarray(0, length), position);
  }

  readBytes() {
    const length = this.readLong();
    if (length < 0) {
      this.invalidate();
      return;
    }
    return this.readFixed(length);
  }

  skipBytes() {
    const length = this.readLong();
    if (length < 0) {
      this.invalidate();
      return;
    }
    this.pos += length;
  }

  writeBytes(buffer) {
    this.writeLong(buffer.length);
    this.writeFixed(buffer, buffer.length);
  }

  readString() {
    const length = this.readLong();

    if (length < 0) {
      this.invalidate();
      return '';
    }

    const start = this.pos;
    this.pos += length;

    if (this.pos > this.buf.length) {
      return '';
    }

    return decodeSlice(this.buf, start, start + length);
  }

  skipString() {
    const length = this.readLong();
    if (length < 0) {
      this.invalidate();
      return;
    }
    this.pos += length;
  }

  writeString(value) {
    let encoded;
    let length;

    if (this.isValid()) {
      encoded = encodeSlice(value);
      length = encoded.length;
    } else {
      length = utf8Length(value);
    }

    this.writeLong(length);

    const position = this.pos;
    this.pos += length;

    if (this.isValid() && encoded) {
      this.buf.set(encoded, position);
    }
  }

  matchBoolean(other) {
    return this.buf[this.pos++] - other.buf[other.pos++];
  }

  matchLong(other) {
    const a = this.readLong();
    const b = other.readLong();
    return a === b ? 0 : a < b ? -1 : 1;
  }

  matchFloat(other) {
    const a = this.readFloat();
    const b = other.readFloat();
    return a === b ? 0 : a < b ? -1 : 1;
  }

  matchDouble(other) {
    const a = this.readDouble();
    const b = other.readDouble();
    return a === b ? 0 : a < b ? -1 : 1;
  }

  matchFixed(other, length) {
    return bufCompare(
      this.readFixed(length),
      other.readFixed(length)
    );
  }

  matchBytes(other) {
    const length = this.readLong();
    const start = this.pos;
    this.pos += length;

    const otherLength = other.readLong();
    const otherStart = other.pos;
    other.pos += otherLength;

    return bufCompare(
      this.buf.slice(start, start + length),
      other.buf.slice(otherStart, otherStart + otherLength)
    );
  }

  packLongBytes(bytes) {
    let value = 0n;
    for (let i = 7; i >= 0; i--) {
      value = (value << 8n) | BigInt(bytes[i]);
    }

    if (bytes[7] & 0x80) {
      value -= 1n << 64n;
    }

    let zigzag = value >= 0n
      ? value << 1n
      : ((-value) << 1n) - 1n;

    do {
      let byte = Number(zigzag & 0x7fn);
      zigzag >>= 7n;
      if (zigzag) {
        byte |= 0x80;
      }
      this.buf[this.pos++] = byte;
    } while (zigzag);
  }

  unpackLongBytes() {
    let value = 0n;
    let shift = 0n;
    let byte;

    do {
      byte = this.buf[this.pos++];
      value |= BigInt(byte & 0x7f) << shift;
      shift += 7n;
    } while (byte & 0x80);

    const signed = value & 1n
      ? -((value >> 1n) + 1n)
      : value >> 1n;

    let unsigned = signed;
    if (unsigned < 0n) {
      unsigned += 1n << 64n;
    }

    const result = new Uint8Array(8);
    for (let i = 0; i < 8; i++) {
      result[i] = Number(unsigned & 0xffn);
      unsigned >>= 8n;
    }

    return result;
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
