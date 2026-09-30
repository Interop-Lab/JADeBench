'use strict';

const crypto = require('crypto');
const NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;
const textEncoder = typeof TextEncoder === 'function' ? new TextEncoder() : null;
const textDecoder = typeof TextDecoder === 'function' ? new TextDecoder() : null;
const floatBuffer = new ArrayBuffer(8);
const floatView = new DataView(floatBuffer);

function isBufferLike(value) {
  return value instanceof Uint8Array;
}

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function compare(value1, value2) {
  return value1 === value2 ? 0 : value1 < value2 ? -1 : 1;
}

const bufCompare = typeof Buffer === 'function' && Buffer.compare
  ? Buffer.compare
  : (buffer1, buffer2) => {
      const length = Math.min(buffer1.length, buffer2.length);
      for (let index = 0; index < length; index++) {
        if (buffer1[index] !== buffer2[index]) return buffer1[index] < buffer2[index] ? -1 : 1;
      }
      return compare(buffer1.length, buffer2.length);
    };
const bufEqual = (buffer1, buffer2) => bufCompare(buffer1, buffer2) === 0;

function getOption(options, key, defaultValue) {
  const value = options && options[key];
  return value === undefined ? defaultValue : value;
}

function singleIndexOf(array, value) {
  const first = array.indexOf(value);
  return first < 0 || first !== array.lastIndexOf(value) ? -1 : first;
}

function toMap(array, keyFunction) {
  const map = {};
  array.forEach((value) => { map[keyFunction(value)] = value; });
  return map;
}

function objectValues(object) {
  return Object.keys(object).map((key) => object[key]);
}

function hasDuplicates(array, keyFunction = (value) => value) {
  const seen = {};
  return array.some((value) => {
    const key = keyFunction(value);
    if (Object.prototype.hasOwnProperty.call(seen, key)) return true;
    seen[key] = true;
    return false;
  });
}

function copyOwnProperties(source, destination, overwrite) {
  Object.getOwnPropertyNames(source).forEach((key) => {
    if (overwrite || !Object.prototype.hasOwnProperty.call(destination, key)) {
      Object.defineProperty(destination, key, Object.getOwnPropertyDescriptor(source, key));
    }
  });
  return destination;
}

function isValidName(name) {
  return NAME_PATTERN.test(name);
}

function qualify(name, namespace) {
  return name.indexOf('.') >= 0 ? name : namespace ? `${namespace}.${name}` : name;
}

function unqualify(name) {
  const index = name.lastIndexOf('.');
  return index < 0 ? name : name.slice(index + 1);
}

function impliedNamespace(name) {
  const index = name.lastIndexOf('.');
  return index < 0 ? undefined : name.slice(0, index);
}

function jsonEnd(string, position) {
  const first = string[position];
  if (first === '"') {
    for (let index = position + 1; index < string.length; index++) {
      if (string[index] === '\\') index++;
      else if (string[index] === '"') return index + 1;
    }
    return -1;
  }
  if (first === '{' || first === '[') {
    const closing = first === '{' ? '}' : ']';
    let depth = 1;
    for (let index = position + 1; index < string.length; index++) {
      if (string[index] === '"') {
        index = jsonEnd(string, index) - 1;
        if (index < 0) return -1;
      } else if (string[index] === first) depth++;
      else if (string[index] === closing && --depth === 0) return index + 1;
    }
    return -1;
  }
  const match = /^(?:true|false|null|-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?)/.exec(string.slice(position));
  return match ? position + match[0].length : -1;
}

function abstractFunction() {
  throw new Error('abstract function');
}

class Lcg {
  constructor(seed) {
    this._seed = seed || Math.random();
  }

  nextBoolean() {
    return this.nextInt(0, 2) === 0;
  }

  nextInt(start, end) {
    return start + Math.floor(this.nextFloat() * (end - start));
  }

  nextFloat(start, end) {
    const seed = (this._seed * 9301 + 49297) % 233280;
    this._seed = seed;
    const random = seed / 233280;
    if (start === undefined) return random;
    if (end === undefined) {
      end = start;
      start = 0;
    }
    return start + random * (end - start);
  }

  nextString(length, flags = 'aA') {
    let alphabet = '';
    if (flags.includes('a')) alphabet += 'abcdefghijklmnopqrstuvwxyz';
    if (flags.includes('A')) alphabet += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (flags.includes('#')) alphabet += '0123456789';
    if (flags.includes('!')) alphabet += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';
    let string = '';
    while (string.length < length) string += this.choice(alphabet);
    return string;
  }

  nextBuffer(length) {
    const buffer = Buffer.alloc(length);
    for (let index = 0; index < length; index++) buffer[index] = this.nextInt(0, 256);
    return buffer;
  }

  choice(array) {
    if (!array.length) throw new Error('choosing from empty array');
    return array[this.nextInt(0, array.length)];
  }
}

class OrderedQueue {
  constructor() {
    this._index = 0;
    this._items = [];
  }

  push(item) {
    let index = this._items.length;
    while (index > 0 && this._items[index - 1].index > item.index) index--;
    this._items.splice(index, 0, item);
  }

  pop() {
    const item = this._items[0];
    if (item && item.index === this._index) {
      this._index++;
      return this._items.shift();
    }
    return null;
  }
}

function encodeSlice(string) {
  return typeof Buffer === 'function' ? Buffer.from(string, 'utf8') : textEncoder.encode(string);
}

function decodeSlice(buffer, start = 0, end = buffer.length) {
  if (typeof Buffer === 'function') {
    return Buffer.from(buffer.buffer, buffer.byteOffset + start, end - start).toString('utf8');
  }
  return textDecoder.decode(buffer.subarray(start, end));
}

function bufferToBinaryString(buffer) {
  if (typeof Buffer === 'function') return Buffer.from(buffer.buffer, buffer.byteOffset, buffer.byteLength).toString('latin1');
  let string = '';
  for (let index = 0; index < buffer.length; index += 0x8000) {
    string += String.fromCharCode(...buffer.subarray(index, index + 0x8000));
  }
  return string;
}

function binaryStringToBuffer(string) {
  if (typeof Buffer === 'function') return Buffer.from(string, 'latin1');
  const buffer = new Uint8Array(string.length);
  for (let index = 0; index < string.length; index++) buffer[index] = string.charCodeAt(index);
  return buffer;
}

function getHash(string, algorithm = 'md5') {
  const digest = crypto.createHash(algorithm).update(string).digest();
  return algorithm === 'md5' ? digest : digest.toString('hex');
}

class Tap {
  constructor(buffer, position = 0) {
    this.setData(buffer, position);
  }

  setData(buffer, position = 0) {
    this.buf = buffer;
    this.pos = position;
    return this;
  }

  get length() {
    return this.buf.length;
  }

  reinitialize(capacity) {
    if (this.buf.length < capacity) this.buf = Buffer.alloc(capacity);
    this.pos = 0;
    return this;
  }

  static fromBuffer(buffer, position = 0) {
    return new Tap(buffer, position);
  }

  static withCapacity(capacity) {
    return new Tap(Buffer.alloc(capacity));
  }

  toBuffer() {
    const length = Math.min(this.pos, this.buf.length);
    return Buffer.from(this.buf.subarray(0, length));
  }

  subarray(start, end) {
    const slice = this.buf.subarray(start, end);
    return new Tap(slice, 0);
  }

  append(tap) {
    const source = tap.buf.subarray(0, tap.pos);
    const available = Math.max(0, Math.min(source.length, this.buf.length - this.pos));
    if (available) this.buf.set(source.subarray(0, available), this.pos);
    this.pos += source.length;
  }

  forward(length) { this.pos += length; }
  isValid() { return this.pos <= this.buf.length; }
  _invalidate() { this.pos = this.buf.length + 1; }

  readBoolean() { return !!this.buf[this.pos++]; }
  skipBoolean() { this.pos++; }
  writeBoolean(value) { this._writeByte(value ? 1 : 0); }

  readLong() {
    let value = 0;
    let shift = 0;
    let byte;
    do {
      byte = this.buf[this.pos++];
      value += (byte & 0x7f) * 2 ** shift;
      shift += 7;
    } while (byte & 0x80);
    return value & 1 ? -(value + 1) / 2 : value / 2;
  }

  skipLong() { while (this.buf[this.pos++] & 0x80) {} }

  writeLong(value) {
    let encoded = value >= 0 ? value * 2 : -value * 2 - 1;
    do {
      const byte = encoded % 128;
      encoded = Math.floor(encoded / 128);
      this._writeByte(byte | (encoded ? 0x80 : 0));
    } while (encoded);
  }

  _writeByte(value) {
    if (this.pos < this.buf.length) this.buf[this.pos] = value;
    this.pos++;
  }

  readFloat() {
    const position = this.pos;
    this.pos += 4;
    if (this.pos > this.buf.length) return undefined;
    return new DataView(this.buf.buffer, this.buf.byteOffset + position, 4).getFloat32(0, true);
  }

  skipFloat() { this.pos += 4; }

  writeFloat(value) {
    floatView.setFloat32(0, value, true);
    this.writeFixed(new Uint8Array(floatBuffer, 0, 4));
  }

  readDouble() {
    const position = this.pos;
    this.pos += 8;
    if (this.pos > this.buf.length) return undefined;
    return new DataView(this.buf.buffer, this.buf.byteOffset + position, 8).getFloat64(0, true);
  }

  skipDouble() { this.pos += 8; }

  writeDouble(value) {
    floatView.setFloat64(0, value, true);
    this.writeFixed(new Uint8Array(floatBuffer));
  }

  readFixed(length) {
    const position = this.pos;
    this.pos += length;
    return this.pos <= this.buf.length ? this.buf.subarray(position, this.pos) : undefined;
  }

  skipFixed(length) { this.pos += length; }

  writeFixed(buffer, length = buffer.length) {
    const available = Math.max(0, Math.min(length, this.buf.length - this.pos));
    if (available) this.buf.set(buffer.subarray(0, available), this.pos);
    this.pos += length;
  }

  readBytes() { return this.readFixed(this.readLong()); }
  skipBytes() { this.pos += this.readLong(); }
  writeBytes(buffer) { this.writeLong(buffer.length); this.writeFixed(buffer); }
  skipString() { this.skipBytes(); }

  readString() {
    const length = this.readLong();
    const position = this.pos;
    this.pos += length;
    return this.pos <= this.buf.length ? decodeSlice(this.buf, position, this.pos) : undefined;
  }

  writeString(string) {
    const buffer = encodeSlice(string);
    this.writeLong(buffer.length);
    this.writeFixed(buffer);
  }

  matchBoolean(tap) { return compare(this.readBoolean(), tap.readBoolean()); }
  matchLong(tap) { return compare(this.readLong(), tap.readLong()); }
  matchFloat(tap) { return compare(this.readFloat(), tap.readFloat()); }
  matchDouble(tap) { return compare(this.readDouble(), tap.readDouble()); }
  matchFixed(tap, length) { return bufCompare(this.readFixed(length), tap.readFixed(length)); }

  matchBytes(tap) {
    const length1 = this.readLong();
    const length2 = tap.readLong();
    const commonLength = Math.min(length1, length2);
    const result = bufCompare(this.buf.subarray(this.pos, this.pos + commonLength), tap.buf.subarray(tap.pos, tap.pos + commonLength));
    this.pos += length1;
    tap.pos += length2;
    return result || compare(length1, length2);
  }

  unpackLongBytes() {
    const bytes = new Uint8Array(8);
    let index = 0;
    let byte = this.buf[this.pos++];
    let encoded = BigInt(byte & 0x7f);
    let shift = 7n;
    while (byte & 0x80) {
      byte = this.buf[this.pos++];
      encoded |= BigInt(byte & 0x7f) << shift;
      shift += 7n;
    }
    let value = (encoded >> 1n) ^ -(encoded & 1n);
    if (value < 0) value += 1n << 64n;
    while (index < bytes.length) {
      bytes[index++] = Number(value & 0xffn);
      value >>= 8n;
    }
    return bytes;
  }

  packLongBytes(bytes) {
    let value = 0n;
    for (let index = 7; index >= 0; index--) value = (value << 8n) | BigInt(bytes[index]);
    if (value & (1n << 63n)) value -= 1n << 64n;
    let encoded = (value << 1n) ^ (value >> 63n);
    do {
      const byte = Number(encoded & 0x7fn);
      encoded >>= 7n;
      this._writeByte(byte | (encoded ? 0x80 : 0));
    } while (encoded);
  }
}

function printJSON(value) {
  if (typeof value === 'bigint') return value.toString();
  if (isBufferLike(value)) return bufferToBinaryString(value);
  return value;
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
