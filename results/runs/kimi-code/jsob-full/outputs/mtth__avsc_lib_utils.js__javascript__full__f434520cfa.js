'use strict';

const crypto = require('crypto');

const NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;
const FLOAT_VIEW = new DataView(new ArrayBuffer(8));
const TEXT_ENCODER = new TextEncoder();
const TEXT_DECODER = new TextDecoder();
const ENCODE_BUFFER = new Uint8Array(4096);
const ENCODE_SLICES = [];

function abstractFunction() {
  throw new Error('abstract');
}

function getHash(value, algorithm) {
  const hash = crypto.createHash(algorithm || 'md5');
  hash.end(value);
  const buffer = hash.read();
  return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.length);
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

function getOption(options, key, defaultValue) {
  const value = options[key];
  return value === undefined ? defaultValue : value;
}

function singleIndexOf(values, target) {
  let foundIndex = -1;
  if (!values) return foundIndex;
  for (let index = 0; index < values.length; index++) {
    if (values[index] !== target) continue;
    if (foundIndex >= 0) return -2;
    foundIndex = index;
  }
  return foundIndex;
}

function toMap(values, keyFunction) {
  const map = {};
  for (const value of values) map[keyFunction(value)] = value;
  return map;
}

function objectValues(object) {
  return Object.keys(object).map((key) => object[key]);
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
  if (name.includes('.')) {
    name = name.replace(/^\./, '');
  } else if (namespace) {
    name = `${namespace}.${name}`;
  }
  for (const part of name.split('.')) {
    if (!isValidName(part)) throw new Error(`invalid name: ${printJSON(name)}`);
  }
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

function jsonEnd(text, position) {
  position |= 0;
  let character = text.charAt(position++);
  if (/[\d-]/.test(character)) {
    while (/[eE\d.+-]/.test(text.charAt(position))) position++;
    return position;
  }
  if (/true|null/.test(text.slice(position - 1, position + 3))) return position + 3;
  if (/false/.test(text.slice(position - 1, position + 4))) return position + 4;

  let depth = 0;
  let inString = false;
  do {
    switch (character) {
      case '{':
      case '[':
        if (!inString) depth++;
        break;
      case '}':
      case ']':
        if (!inString && --depth === 0) return position;
        break;
      case '"':
        inString = !inString;
        if (depth === 0 && !inString) return position;
        break;
      case '\\':
        position++;
        break;
    }
  } while ((character = text.charAt(position++)));
  return -1;
}

let bufCompare;
let bufEqual;
if (typeof Buffer === 'function') {
  bufCompare = Buffer.compare;
  bufEqual = (left, right) => Buffer.prototype.equals.call(left, right);
} else {
  bufCompare = (left, right) => {
    if (left === right) return 0;
    const length = Math.min(left.length, right.length);
    for (let index = 0; index < length; index++) {
      if (left[index] !== right[index]) return Math.sign(left[index] - right[index]);
    }
    return Math.sign(left.length - right.length);
  };
  bufEqual = (left, right) => left.length === right.length && bufCompare(left, right) === 0;
}

class Lcg {
  constructor(seed) {
    let state = Math.floor(seed || Math.random() * (2 ** 31 - 1));
    this._max = 2 ** 31;
    this._nextInt = () => {
      state = (1103515245 * state + 12345) % this._max;
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
    return start + Math.floor(this.nextFloat() * (end - start));
  }

  nextFloat(start, end) {
    if (end === undefined) {
      end = start;
      start = 0;
    }
    end = end === undefined ? 1 : end;
    return start + (end - start) * this._nextInt() / this._max;
  }

  nextString(length, flags) {
    flags = flags || 'aA';
    let characters = '';
    if (flags.includes('a')) characters += 'abcdefghijklmnopqrstuvwxyz';
    if (flags.includes('A')) characters += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (flags.includes('#')) characters += '0123456789';
    if (flags.includes('!')) characters += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';
    const result = [];
    for (let index = 0; index < (length | 0); index++) result.push(this.choice(characters));
    return result.join('');
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
      const parentIndex = (index - 1) >> 1;
      if (items[index].index >= items[parentIndex].index) break;
      [items[index], items[parentIndex]] = [items[parentIndex], items[index]];
      index = parentIndex;
    }
  }

  pop() {
    const items = this._items;
    const first = items[0];
    if (!first || first.index > this._index) return null;
    this._index++;
    if (items.length === 1) return items.pop();

    items[0] = items.pop();
    let index = 0;
    while (index < items.length >> 1) {
      const leftIndex = (index << 1) + 1;
      const rightIndex = leftIndex + 1;
      const childIndex = !items[rightIndex] || items[leftIndex].index <= items[rightIndex].index
        ? leftIndex
        : rightIndex;
      if (items[childIndex].index >= items[index].index) break;
      [items[index], items[childIndex]] = [items[childIndex], items[index]];
      index = childIndex;
    }
    return first;
  }
}

const decodeSlice = typeof Buffer === 'function' && typeof Buffer.prototype.utf8Slice === 'function'
  ? Function.prototype.call.bind(Buffer.prototype.utf8Slice)
  : (buffer, start, end) => TEXT_DECODER.decode(buffer.subarray(start, end));

function encodeSlice(value) {
  const {read, written} = TEXT_ENCODER.encodeInto(value, ENCODE_BUFFER);
  if (read === value.length) {
    if (!ENCODE_SLICES[written]) ENCODE_SLICES[written] = ENCODE_BUFFER.subarray(0, written);
    return ENCODE_SLICES[written];
  }
  return TEXT_ENCODER.encode(value);
}

const utf8Length = typeof Buffer === 'function' ? Buffer.byteLength : (value) => {
  let length = 0;
  while (value.length) {
    const {read, written} = TEXT_ENCODER.encodeInto(value, ENCODE_BUFFER);
    length += written;
    value = value.slice(read);
  }
  return length;
};

const bufferToBinaryString = typeof Buffer === 'function' && typeof Buffer.prototype.latin1Slice === 'function'
  ? Function.prototype.call.bind(Buffer.prototype.latin1Slice)
  : (buffer) => {
      let value = '';
      for (let index = 0; index < buffer.length; index += 8192) {
        value += String.fromCharCode(...buffer.subarray(index, index + 8192));
      }
      return value;
    };

const binaryStringToBuffer = typeof Buffer === 'function'
  ? (value) => {
      const buffer = Buffer.from(value, 'binary');
      return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.length);
    }
  : (value) => {
      const bytes = new Uint8Array(value.length);
      for (let index = 0; index < value.length; index++) bytes[index] = value.charCodeAt(index);
      return Buffer.from(bytes);
    };

function invert(buffer, length) {
  while (length--) buffer[length] = ~buffer[length];
}

class Tap {
  constructor(buffer, position) {
    this.setData(buffer, position);
  }

  static fromBuffer(buffer, position) {
    return new Tap(buffer, position);
  }

  static withCapacity(capacity) {
    return new Tap(new Uint8Array(capacity));
  }

  setData(buffer, position) {
    if (typeof Buffer === 'function' && buffer instanceof Buffer) {
      buffer = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.length);
    }
    this.arr = buffer;
    this.pos = position | 0;
    if (this.pos < 0) throw new Error('negative offset');
  }

  get length() { return this.arr.length; }
  reinitialize(capacity) { this.setData(new Uint8Array(capacity)); }
  toBuffer() { return this.arr.slice(0, this.pos); }
  subarray(start, end) { return this.arr.subarray(start, end); }

  append(buffer) {
    const combined = new Uint8Array(this.arr.length + buffer.length);
    combined.set(this.arr);
    combined.set(buffer, this.arr.length);
    this.setData(combined, 0);
  }

  forward(buffer) {
    const remainder = this.arr.subarray(this.pos);
    const combined = new Uint8Array(remainder.length + buffer.length);
    combined.set(remainder);
    combined.set(buffer, remainder.length);
    this.setData(combined, 0);
  }

  isValid() { return this.pos <= this.arr.length; }
  _invalidate() { this.pos = this.arr.length + 1; }
  readBoolean() { return Boolean(this.arr[this.pos++]); }
  skipBoolean() { this.pos++; }
  writeBoolean(value) { this.arr[this.pos++] = Boolean(value); }

  readLong() {
    let byte;
    let continuation;
    let value = 0;
    let shift = 0;
    do {
      byte = this.arr[this.pos++];
      continuation = byte & 128;
      value |= (byte & 127) << shift;
      shift += 7;
    } while (continuation && shift < 28);
    if (continuation) {
      let multiplier = 268435456;
      let fullValue = value;
      do {
        byte = this.arr[this.pos++];
        fullValue += (byte & 127) * multiplier;
        multiplier *= 128;
      } while (byte & 128);
      return (fullValue % 2 ? -(fullValue + 1) : fullValue) / 2;
    }
    return value >> 1 ^ -(value & 1);
  }

  skipLong() { while (this.arr[this.pos++] & 128); }

  writeLong(value) {
    let encoded;
    if (value >= -1073741824 && value < 1073741824) {
      encoded = value >= 0 ? value << 1 : (~value << 1) | 1;
      do {
        this.arr[this.pos] = encoded & 127;
        encoded >>= 7;
      } while (encoded && (this.arr[this.pos++] |= 128));
    } else {
      encoded = value >= 0 ? value * 2 : -value * 2 - 1;
      do {
        this.arr[this.pos] = encoded & 127;
        encoded /= 128;
      } while (encoded >= 1 && (this.arr[this.pos++] |= 128));
    }
    this.pos++;
  }

  readFloat() {
    const position = this.pos;
    this.pos += 4;
    if (!this.isValid()) return 0;
    FLOAT_VIEW.setUint32(0, this.arr[position] | this.arr[position + 1] << 8 |
      this.arr[position + 2] << 16 | this.arr[position + 3] << 24, true);
    return FLOAT_VIEW.getFloat32(0, true);
  }

  skipFloat() { this.pos += 4; }

  writeFloat(value) {
    const position = this.pos;
    this.pos += 4;
    if (!this.isValid()) return;
    FLOAT_VIEW.setFloat32(0, value, true);
    const bits = FLOAT_VIEW.getUint32(0, true);
    for (let offset = 0; offset < 4; offset++) this.arr[position + offset] = bits >> (offset * 8);
  }

  readDouble() {
    const position = this.pos;
    this.pos += 8;
    if (!this.isValid()) return 0;
    for (let offset = 0; offset < 8; offset++) FLOAT_VIEW.setUint8(offset, this.arr[position + offset]);
    return FLOAT_VIEW.getFloat64(0, true);
  }

  skipDouble() { this.pos += 8; }

  writeDouble(value) {
    const position = this.pos;
    this.pos += 8;
    if (!this.isValid()) return;
    FLOAT_VIEW.setFloat64(0, value, true);
    for (let offset = 0; offset < 8; offset++) this.arr[position + offset] = FLOAT_VIEW.getUint8(offset);
  }

  readFixed(length) {
    const position = this.pos;
    this.pos += length;
    if (this.isValid()) return this.arr.slice(position, position + length);
  }

  skipFixed(length) { this.pos += length; }

  writeFixed(buffer, length) {
    length = length || buffer.length;
    const position = this.pos;
    this.pos += length;
    if (this.isValid()) this.arr.set(buffer.subarray(0, length), position);
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
    if (length < 0) this._invalidate();
    else this.pos += length;
  }

  writeBytes(buffer) {
    this.writeLong(buffer.length);
    this.writeFixed(buffer, buffer.length);
  }

  skipString() { this.skipBytes(); }

  readString() {
    const length = this.readLong();
    if (length < 0) {
      this._invalidate();
      return '';
    }
    const start = this.pos;
    this.pos += length;
    if (!this.isValid()) return undefined;
    return decodeSlice(this.arr, start, start + length);
  }

  writeString(value) {
    if (value.length > 21) {
      const encoded = this.isValid() ? encodeSlice(value) : undefined;
      const length = encoded ? encoded.length : utf8Length(value);
      this.writeLong(length);
      const position = this.pos;
      this.pos += length;
      if (this.isValid() && encoded) this.arr.set(encoded, position);
      return;
    }
    const encoded = TEXT_ENCODER.encode(value);
    this.writeLong(encoded.length);
    this.writeFixed(encoded);
  }

  matchBoolean(tap) { return this.arr[this.pos++] - tap.arr[tap.pos++]; }
  matchLong(tap) { return compare(this.readLong(), tap.readLong()); }
  matchFloat(tap) { return compare(this.readFloat(), tap.readFloat()); }
  matchDouble(tap) { return compare(this.readDouble(), tap.readDouble()); }
  matchFixed(tap, length) { return bufCompare(this.readFixed(length), tap.readFixed(length)); }

  matchBytes(tap) {
    const leftLength = this.readLong();
    const leftStart = this.pos;
    this.pos += leftLength;
    const rightLength = tap.readLong();
    const rightStart = tap.pos;
    tap.pos += rightLength;
    return bufCompare(this.arr.subarray(leftStart, this.pos), tap.arr.subarray(rightStart, tap.pos));
  }

  unpackLongBytes() {
    const bytes = new Uint8Array(8);
    let value = 0;
    let byteIndex = 0;
    let shift = 6;
    let byte = this.arr[this.pos++];
    const negative = byte & 1;
    bytes.fill(0);
    value |= (byte & 127) >> 1;
    while (byte & 128) {
      byte = this.arr[this.pos++];
      value |= (byte & 127) << shift;
      shift += 7;
      if (shift >= 8) {
        shift -= 8;
        bytes[byteIndex++] = value;
        value >>= 8;
      }
    }
    bytes[byteIndex] = value;
    if (negative) invert(bytes, 8);
    return bytes;
  }

  packLongBytes(bytes) {
    const negative = (bytes[7] & 128) >> 7;
    let value = negative ? 1 : 0;
    if (negative) invert(bytes, 8);
    const words = [bytes[0] | bytes[1] << 8 | bytes[2] << 16,
      bytes[3] | bytes[4] << 8 | bytes[5] << 16,
      bytes[6] | bytes[7] << 8];
    let wordCount = 3;
    while (wordCount && !words[--wordCount]);
    let shift = 1;
    let wordIndex = 0;
    while (wordIndex < wordCount) {
      value |= words[wordIndex++] << shift;
      shift += 24;
      while (shift > 7) {
        this.arr[this.pos++] = (value & 127) | 128;
        value >>= 7;
        shift -= 7;
      }
    }
    value |= words[wordCount] << shift;
    do {
      this.arr[this.pos] = value & 127;
      value >>= 7;
    } while (value && (this.arr[this.pos++] |= 128));
    this.pos++;
    if (negative) invert(bytes, 8);
  }
}

function printJSON(value) {
  const seen = new Set();
  try {
    return JSON.stringify(value, (key, item) => {
      if (seen.has(item)) return '[Circular]';
      if (typeof item === 'object' && item !== null) seen.add(item);
      if (typeof item === 'bigint') return `[BigInt ${item.toString()}n]`;
      return item;
    });
  } catch {
    return '[object]';
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
