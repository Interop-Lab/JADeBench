'use strict';

const crypto = require('crypto');

const NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();
const FLOAT_VIEW = new DataView(new ArrayBuffer(8));

function abstractFunction() {
  throw new Error('abstract');
}

function isBufferLike(value) {
  return value instanceof Uint8Array;
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function compare(first, second) {
  return first === second ? 0 : first < second ? -1 : 1;
}

function bufCompare(first, second) {
  if (typeof Buffer === 'function') {
    return Buffer.compare(first, second);
  }
  const length = Math.min(first.length, second.length);
  for (let index = 0; index < length; index++) {
    if (first[index] !== second[index]) return Math.sign(first[index] - second[index]);
  }
  return Math.sign(first.length - second.length);
}

function bufEqual(first, second) {
  return first.length === second.length && bufCompare(first, second) === 0;
}

function bufferToBinaryString(buffer) {
  if (typeof Buffer === 'function' && Buffer.prototype.latin1Slice) {
    return Buffer.prototype.latin1Slice.call(buffer);
  }
  let result = '';
  for (let offset = 0; offset + 8 <= buffer.length; offset += 8) {
    result += String.fromCharCode(...buffer.subarray(offset, offset + 8));
  }
  const remainder = buffer.length - (buffer.length % 8);
  for (let offset = remainder; offset < buffer.length; offset++) {
    result += String.fromCharCode(buffer[offset]);
  }
  return result;
}

function binaryStringToBuffer(value) {
  if (typeof Buffer === 'function') {
    const buffer = Buffer.from(value, 'latin1');
    return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.length);
  }
  const buffer = new Uint8Array(value.length);
  for (let index = 0; index < value.length; index++) buffer[index] = value.charCodeAt(index);
  return buffer;
}

function copyOwnProperties(source, destination, overwrite) {
  for (const name of Object.getOwnPropertyNames(source)) {
    if (!Object.prototype.hasOwnProperty.call(destination, name) || overwrite) {
      Object.defineProperty(destination, name, Object.getOwnPropertyDescriptor(source, name));
    }
  }
  return destination;
}

function getHash(value, algorithm) {
  const hash = crypto.createHash(algorithm || 'md5');
  hash.end(value);
  const digest = hash.read();
  return new Uint8Array(digest.buffer, digest.byteOffset, digest.length);
}

function getOption(options, name, defaultValue) {
  const value = options[name];
  return value === undefined ? defaultValue : value;
}

function impliedNamespace(name) {
  const match = /^(.*)\.[^.]+$/.exec(name);
  return match ? match[1] : undefined;
}

function isValidName(name) {
  return NAME_PATTERN.test(name);
}

function qualify(name, namespace) {
  if (name.includes('.')) {
    name = name.replace(/^\./, '');
  } else if (namespace) {
    name = `${namespace}.${name}`;
  }
  name.split('.').forEach((part) => {
    if (!isValidName(part)) throw new Error(`invalid name: ${printJSON(name)}`);
  });
  return name;
}

function unqualify(name) {
  const parts = name.split('.');
  return parts[parts.length - 1];
}

function objectValues(object) {
  return Object.keys(object).map((key) => object[key]);
}

function toMap(values, keyFunction) {
  const map = {};
  for (const value of values) map[keyFunction(value)] = value;
  return map;
}

function singleIndexOf(values, value) {
  let found = -1;
  if (!values) return found;
  for (let index = 0; index < values.length; index++) {
    if (values[index] === value) {
      if (found >= 0) return -2;
      found = index;
    }
  }
  return found;
}

function hasDuplicates(values, keyFunction) {
  const seen = Object.create(null);
  for (let value of values) {
    if (keyFunction) value = keyFunction(value);
    if (seen[value]) return true;
    seen[value] = true;
  }
  return false;
}

function jsonEnd(text, position) {
  let character;
  do {
    character = text.charAt(position++);
  } while (/\s/.test(character));

  if (character === '{' || character === '[') {
    const stack = [character];
    let quoted = false;
    let escaped = false;
    while (stack.length && (character = text.charAt(position++))) {
      if (quoted) {
        if (escaped) escaped = false;
        else if (character === '\\') escaped = true;
        else if (character === '"') quoted = false;
      } else if (character === '"') {
        quoted = true;
      } else if (character === '{' || character === '[') {
        stack.push(character);
      } else if (character === '}' || character === ']') {
        const opening = stack.pop();
        if ((opening === '{') !== (character === '}')) return -1;
      }
    }
    return stack.length ? -1 : position;
  }

  if (character === '"') {
    let escaped = false;
    while ((character = text.charAt(position++))) {
      if (escaped) escaped = false;
      else if (character === '\\') escaped = true;
      else if (character === '"') return position;
    }
    return -1;
  }

  const primitive = text.slice(position - 1).match(/^(?:true|false|null|-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?)/);
  return primitive ? position - 1 + primitive[0].length : -1;
}

class Lcg {
  constructor(seed) {
    const multiplier = 1103515245;
    const increment = 12345;
    const modulus = 2 ** 31;
    let state = Math.floor(seed || Math.random() * (modulus - 1));
    this._max = modulus;
    this._nextInt = () => {
      state = (multiplier * state + increment) % modulus;
      return state;
    };
  }

  nextBoolean() {
    return Boolean(this._nextInt() % 2);
  }

  nextInt(start, end) {
    if (end === undefined) {
      end = start;
      start = 0;
    }
    end = end === undefined ? this._max : end;
    return start + Math.floor(this._nextInt() / this._max * (end - start));
  }

  nextFloat(start, end) {
    if (end === undefined) {
      end = start;
      start = 0;
    }
    end = end === undefined ? 1 : end;
    return start + this._nextInt() / this._max * (end - start);
  }

  nextString(length, flags) {
    flags ||= 'aA';
    let characters = '';
    if (flags.includes('a')) characters += 'abcdefghijklmnopqrstuvwxyz';
    if (flags.includes('A')) characters += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (flags.includes('#')) characters += '0123456789';
    if (flags.includes('!')) characters += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';
    let result = '';
    for (let index = 0; index < (length | 0); index++) result += this.choice(characters);
    return result;
  }

  nextBuffer(length) {
    const buffer = new Uint8Array(length);
    for (let index = 0; index < length; index++) buffer[index] = this.nextInt(256);
    return buffer;
  }

  choice(values) {
    if (!values.length) throw new Error('choosing from empty array');
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
    while (index > 0) {
      const parent = (index - 1) >> 1;
      if (items[index].index >= items[parent].index) break;
      [items[index], items[parent]] = [items[parent], items[index]];
      index = parent;
    }
  }

  pop() {
    const items = this._items;
    const first = items[0];
    if (!first || first.index !== this._index) return null;
    this._index++;
    const last = items.pop();
    if (items.length) {
      items[0] = last;
      let index = 0;
      while (true) {
        const left = index * 2 + 1;
        const right = left + 1;
        if (left >= items.length) break;
        const child = right < items.length && items[right].index < items[left].index ? right : left;
        if (items[child].index >= items[index].index) break;
        [items[index], items[child]] = [items[child], items[index]];
        index = child;
      }
    }
    return first;
  }
}

function encodeLong(value, output, position) {
  let encoded = value >= 0 ? value * 2 : -value * 2 - 1;
  while (encoded > 127) {
    output[position++] = encoded & 0x7f | 0x80;
    encoded = Math.floor(encoded / 128);
  }
  output[position++] = encoded;
  return position;
}

class Tap {
  constructor(buffer, position) {
    this.setData(buffer, position);
  }

  setData(buffer, position = 0) {
    this.buf = buffer || new Uint8Array(0);
    this.pos = position;
    return this;
  }

  reinitialize(capacity) {
    const currentLength = this.buf.length;
    if (capacity >= currentLength) {
      const length = currentLength ? Math.ceil(capacity / currentLength) * currentLength : capacity;
      this.buf = new Uint8Array(length);
    }
    this.pos = 0;
    return this;
  }

  toBuffer() {
    if (!this.isValid()) return undefined;
    return this.buf.slice(0, this.pos);
  }

  subarray(start, end) {
    if (!this.isValid()) return undefined;
    return this.buf.subarray(start, end);
  }

  append(buffer) {
    const start = this.pos;
    this.pos += buffer.length;
    if (this.pos <= this.buf.length) this.buf.set(buffer, start);
  }

  forward(count) {
    this.pos += count;
  }

  isValid() {
    return this.pos <= this.buf.length;
  }

  readBoolean() {
    return Boolean(this.buf[this.pos++]);
  }

  skipBoolean() {
    this.pos++;
  }

  writeBoolean(value) {
    this.buf[this.pos++] = value ? 1 : 0;
  }

  readLong() {
    let value = 0;
    let multiplier = 1;
    let byte;
    do {
      byte = this.buf[this.pos++];
      value += (byte & 0x7f) * multiplier;
      multiplier *= 128;
    } while (byte & 0x80);
    return value & 1 ? -(value + 1) / 2 : value / 2;
  }

  skipLong() {
    while (this.buf[this.pos++] & 0x80) {}
  }

  writeLong(value) {
    this.pos = encodeLong(value, this.buf, this.pos);
  }

  readFloat() {
    FLOAT_VIEW.setUint8(0, this.buf[this.pos++]);
    FLOAT_VIEW.setUint8(1, this.buf[this.pos++]);
    FLOAT_VIEW.setUint8(2, this.buf[this.pos++]);
    FLOAT_VIEW.setUint8(3, this.buf[this.pos++]);
    return FLOAT_VIEW.getFloat32(0, true);
  }

  skipFloat() {
    this.pos += 4;
  }

  writeFloat(value) {
    FLOAT_VIEW.setFloat32(0, value, true);
    for (let index = 0; index < 4; index++) this.buf[this.pos++] = FLOAT_VIEW.getUint8(index);
  }

  readDouble() {
    for (let index = 0; index < 8; index++) FLOAT_VIEW.setUint8(index, this.buf[this.pos++]);
    return FLOAT_VIEW.getFloat64(0, true);
  }

  skipDouble() {
    this.pos += 8;
  }

  writeDouble(value) {
    FLOAT_VIEW.setFloat64(0, value, true);
    for (let index = 0; index < 8; index++) this.buf[this.pos++] = FLOAT_VIEW.getUint8(index);
  }

  readFixed(length) {
    const start = this.pos;
    this.pos += length;
    if (this.pos > this.buf.length) return undefined;
    return this.buf.subarray(start, this.pos);
  }

  skipFixed(length) {
    this.pos += length;
  }

  writeFixed(buffer, length = buffer.length) {
    const start = this.pos;
    this.pos += length;
    if (this.pos <= this.buf.length) this.buf.set(buffer.subarray(0, length), start);
  }

  readBytes() {
    return this.readFixed(this.readLong());
  }

  skipBytes() {
    this.pos += this.readLong();
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
    const start = this.pos;
    this.pos += length;
    if (typeof Buffer === 'function' && Buffer.prototype.utf8Slice) {
      return Buffer.prototype.utf8Slice.call(this.buf, start, this.pos);
    }
    return textDecoder.decode(this.buf.subarray(start, this.pos));
  }

  writeString(value) {
    const encoded = textEncoder.encode(value);
    this.writeLong(encoded.length);
    this.writeFixed(encoded);
  }

  matchBoolean(other) {
    return compare(this.readBoolean(), other.readBoolean());
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
    return bufCompare(this.readBytes(), other.readBytes());
  }

  unpackLongBytes() {
    let value = BigInt(this.readLong());
    if (value < 0) value += 1n << 64n;
    const buffer = new Uint8Array(8);
    for (let index = 0; index < 8; index++) {
      buffer[index] = Number(value & 0xffn);
      value >>= 8n;
    }
    return buffer;
  }

  packLongBytes(buffer) {
    let value = 0n;
    for (let index = 7; index >= 0; index--) value = value << 8n | BigInt(buffer[index]);
    if (value & 1n << 63n) value -= 1n << 64n;
    this.writeLong(Number(value));
  }
}

function invert(buffer, length) {
  let carry = 1;
  while (length--) {
    const value = (~buffer[length] & 0xff) + carry;
    buffer[length] = value;
    carry = value > 255 ? 1 : 0;
  }
}

function printJSON(value) {
  const seen = new Set();
  try {
    return JSON.stringify(value, (_key, current) => {
      if (seen.has(current)) return '[Circular]';
      if (typeof current === 'object' && current !== null) seen.add(current);
      if (typeof BigInt === 'function' && current instanceof BigInt) {
        return `[BigInt ${current.toString()}n]`;
      }
      return current;
    });
  } catch {
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
  printJSON,
};
