'use strict';

const crypto = require('crypto');

const NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DIGITS = '0123456789';
const SPECIAL_CHARACTERS = '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';

function getHash(buffer, algorithm) {
  const hash = crypto.createHash(algorithm || 'md5');
  hash.end(buffer);
  const digest = hash.read();
  return new Uint8Array(digest.buffer, digest.byteOffset, digest.length);
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

let bufCompare;
let bufEqual;
if (typeof Buffer === 'function') {
  bufCompare = Buffer.compare;
  bufEqual = function bufEqual(left, right) {
    return Buffer.prototype.equals.call(left, right);
  };
} else {
  bufCompare = function bufCompare(left, right) {
    if (left === right) return 0;
    const length = Math.min(left.length, right.length);
    for (let index = 0; index < length; index += 1) {
      if (left[index] !== right[index]) {
        return Math.sign(left[index] - right[index]);
      }
    }
    return Math.sign(left.length - right.length);
  };
  bufEqual = function bufEqual(left, right) {
    return left.length === right.length && bufCompare(left, right) === 0;
  };
}

function getOption(options, key, defaultValue) {
  const value = options[key];
  return value === undefined ? defaultValue : value;
}

function singleIndexOf(values, target) {
  if (!values) return -1;
  let foundIndex = -1;
  for (let index = 0; index < values.length; index += 1) {
    if (values[index] === target) {
      if (foundIndex >= 0) return -2;
      foundIndex = index;
    }
  }
  return foundIndex;
}

function toMap(values, getKey) {
  const map = {};
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    map[getKey(value)] = value;
  }
  return map;
}

function objectValues(object) {
  return Object.keys(object).map((key) => object[key]);
}

function hasDuplicates(values, getKey) {
  const seen = Object.create(null);
  for (let index = 0; index < values.length; index += 1) {
    const value = getKey ? getKey(values[index]) : values[index];
    if (seen[value]) return true;
    seen[value] = true;
  }
  return false;
}

function copyOwnProperties(source, destination, overwrite) {
  const names = Object.getOwnPropertyNames(source);
  for (let index = 0; index < names.length; index += 1) {
    const name = names[index];
    if (!Object.prototype.hasOwnProperty.call(destination, name) || overwrite) {
      const descriptor = Object.getOwnPropertyDescriptor(source, name);
      Object.defineProperty(destination, name, descriptor);
    }
  }
  return destination;
}

function isValidName(name) {
  return NAME_PATTERN.test(name);
}

function qualify(name, namespace) {
  if (~name.indexOf('.')) {
    name = name.replace(/^\./, '');
  } else if (namespace) {
    name = `${namespace}.${name}`;
  }
  name.split('.').forEach((part) => {
    if (!isValidName(part)) {
      throw new Error(`invalid name: ${printJSON(name)}`);
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
  position |= 0;
  let character = json.charAt(position++);
  if (/[\d-]/.test(character)) {
    while (/[eE\d.+-]/.test(json.charAt(position))) position += 1;
    return position;
  }
  if (/true|null/.test(json.slice(position - 1, position + 3))) return position + 3;
  if (/false/.test(json.slice(position - 1, position + 4))) return position + 4;

  let depth = 0;
  let inString = false;
  do {
    switch (character) {
      case '{':
      case '[':
        if (!inString) depth += 1;
        break;
      case '}':
      case ']':
        if (!inString && !--depth) return position;
        break;
      case '"':
        inString = !inString;
        if (!depth && !inString) return position;
        break;
      case '\\':
        position += 1;
        break;
    }
  } while ((character = json.charAt(position++)));
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
    let state = Math.floor(seed || Math.random() * (modulus - 1));
    this._max = modulus;
    this._nextInt = function nextInt() {
      state = (multiplier * state + increment) % modulus;
      return state;
    };
  }

  nextBoolean() {
    return !!(this._nextInt() % 2);
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
    return start + ((end - start) * this._nextInt()) / this._max;
  }

  nextString(length, flags) {
    length |= 0;
    flags = flags || 'aA';
    let characters = '';
    if (flags.indexOf('a') > -1) characters += LOWERCASE;
    if (flags.indexOf('A') > -1) characters += UPPERCASE;
    if (flags.indexOf('#') > -1) characters += DIGITS;
    if (flags.indexOf('!') > -1) characters += SPECIAL_CHARACTERS;
    const result = [];
    for (let index = 0; index < length; index += 1) {
      result.push(this.choice(characters));
    }
    return result.join('');
  }

  nextBuffer(length) {
    const buffer = new Uint8Array(length);
    for (let index = 0; index < length; index += 1) {
      buffer[index] = this.nextInt(256);
    }
    return buffer;
  }

  choice(values) {
    const length = values.length;
    if (!length) throw new Error('choosing from empty array');
    return values[this.nextInt(length)];
  }
}

class OrderedQueue {
  constructor() {
    this._index = 0;
    this._items = [];
  }

  push(item) {
    const items = this._items;
    let index = items.length | 0;
    let parentIndex;
    items.push(item);
    while (index > 0 && items[index].index < items[(parentIndex = (index - 1) >> 1)].index) {
      [items[index], items[parentIndex]] = [items[parentIndex], items[index]];
      index = parentIndex;
    }
  }

  pop() {
    const items = this._items;
    const lastIndex = (items.length - 1) | 0;
    const first = items[0];
    if (!first || first.index > this._index) return null;
    this._index += 1;
    if (!lastIndex) {
      items.pop();
      return first;
    }

    items[0] = items.pop();
    const half = lastIndex >> 1;
    let index = 0;
    while (index < half) {
      const current = items[index];
      const leftIndex = (index << 1) + 1;
      const rightIndex = (index + 1) << 1;
      const left = items[leftIndex];
      const right = items[rightIndex];
      const child = !right || left.index <= right.index ? left : right;
      const childIndex = child === left ? leftIndex : rightIndex;
      if (child.index >= current.index) break;
      items[childIndex] = current;
      items[index] = child;
      index = childIndex;
    }
    return first;
  }
}

let decodeSlice;
if (typeof Buffer === 'function' && typeof Buffer.prototype.utf8Slice === 'function') {
  decodeSlice = Function.prototype.call.bind(Buffer.prototype.utf8Slice);
} else {
  const decoder = new TextDecoder();
  decodeSlice = function decodeSlice(buffer, start, end) {
    return decoder.decode(buffer.subarray(start, end));
  };
}

const ENCODER = new TextEncoder();
const encodeBuffer = new Uint8Array(4096);
const encodeBuffers = [];

function encodeSlice(value) {
  const { read, written } = ENCODER.encodeInto(value, encodeBuffer);
  if (read === value.length) {
    if (!encodeBuffers[written]) encodeBuffers[written] = encodeBuffer.subarray(0, written);
    return encodeBuffers[written];
  }
  return ENCODER.encode(value);
}

let utf8Length;
if (typeof Buffer === 'function') {
  utf8Length = Buffer.byteLength;
} else {
  utf8Length = function utf8Length(value) {
    let length = 0;
    for (;;) {
      const { read, written } = ENCODER.encodeInto(value, encodeBuffer);
      length += written;
      if (read === value.length) break;
      value = value.slice(read);
    }
    return length;
  };
}

let bufferToBinaryString;
if (typeof Buffer === 'function' && typeof Buffer.prototype.latin1Slice === 'function') {
  bufferToBinaryString = Function.prototype.call.bind(Buffer.prototype.latin1Slice);
} else {
  bufferToBinaryString = function bufferToBinaryString(buffer) {
    let value = '';
    let index = 0;
    for (; index + 7 < buffer.length; index += 8) {
      value += String.fromCharCode(
        buffer[index],
        buffer[index + 1],
        buffer[index + 2],
        buffer[index + 3],
        buffer[index + 4],
        buffer[index + 5],
        buffer[index + 6],
        buffer[index + 7],
      );
    }
    for (; index < buffer.length; index += 1) value += String.fromCharCode(buffer[index]);
    return value;
  };
}

let binaryStringToBuffer;
if (typeof Buffer === 'function') {
  binaryStringToBuffer = function binaryStringToBuffer(value) {
    const buffer = Buffer.from(value, 'binary');
    return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.length);
  };
} else {
  binaryStringToBuffer = function binaryStringToBuffer(value) {
    const buffer = new Uint8Array(value.length);
    for (let index = 0; index < value.length; index += 1) {
      buffer[index] = value.charCodeAt(index);
    }
    return Buffer.from(buffer);
  };
}

const FLOAT_VIEW = new DataView(new ArrayBuffer(8));

class Tap {
  constructor(buffer, position) {
    this.setData(buffer, position);
  }

  setData(buffer, position) {
    if (typeof Buffer === 'function' && buffer instanceof Buffer) {
      buffer = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.length);
    }
    this.arr = buffer;
    this.pos = position | 0;
    if (this.pos < 0) throw new Error('negative offset');
  }

  get length() {
    return this.arr.length;
  }

  reinitialize(length) {
    this.setData(new Uint8Array(length));
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
    this.setData(combined, 0);
  }

  forward(buffer) {
    const remaining = this.arr.subarray(this.pos);
    const combined = new Uint8Array(remaining.length + buffer.length);
    combined.set(remaining, 0);
    combined.set(buffer, remaining.length);
    this.setData(combined, 0);
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
    this.pos += 1;
  }

  writeBoolean(value) {
    this.arr[this.pos++] = !!value;
  }

  readLong() {
    let value = 0;
    let shift = 0;
    let byte;
    let hasMore;
    do {
      byte = this.arr[this.pos++];
      hasMore = byte & 128;
      value |= (byte & 127) << shift;
      shift += 7;
    } while (hasMore && shift < 28);

    if (hasMore) {
      let longValue = value;
      let multiplier = 268435456;
      do {
        byte = this.arr[this.pos++];
        longValue += (byte & 127) * multiplier;
        multiplier *= 128;
      } while (byte & 128);
      return (longValue % 2 ? -(longValue + 1) : longValue) / 2;
    }
    return (value >> 1) ^ -(value & 1);
  }

  skipLong() {
    while (this.arr[this.pos++] & 128) {}
  }

  writeLong(value) {
    const buffer = this.arr;
    if (value >= -1073741824 && value < 1073741824) {
      let encoded = value >= 0 ? value << 1 : (~value << 1) | 1;
      do {
        buffer[this.pos] = encoded & 127;
        encoded >>= 7;
      } while (encoded && (buffer[this.pos++] |= 128));
    } else {
      let encoded = value >= 0 ? value * 2 : -value * 2 - 1;
      do {
        buffer[this.pos] = encoded & 127;
        encoded /= 128;
      } while (encoded >= 1 && (buffer[this.pos++] |= 128));
    }
    this.pos += 1;
  }

  readFloat() {
    const position = this.pos;
    this.pos += 4;
    if (this.pos > this.arr.length) return 0;
    FLOAT_VIEW.setUint32(
      0,
      this.arr[position] |
        (this.arr[position + 1] << 8) |
        (this.arr[position + 2] << 16) |
        (this.arr[position + 3] << 24),
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
    this.arr[position] = bits & 255;
    this.arr[position + 1] = (bits >> 8) & 255;
    this.arr[position + 2] = (bits >> 16) & 255;
    this.arr[position + 3] = bits >> 24;
  }

  readDouble() {
    const position = this.pos;
    this.pos += 8;
    if (this.pos > this.arr.length) return 0;
    FLOAT_VIEW.setUint32(
      0,
      this.arr[position] |
        (this.arr[position + 1] << 8) |
        (this.arr[position + 2] << 16) |
        (this.arr[position + 3] << 24),
      true,
    );
    FLOAT_VIEW.setUint32(
      4,
      this.arr[position + 4] |
        (this.arr[position + 5] << 8) |
        (this.arr[position + 6] << 16) |
        (this.arr[position + 7] << 24),
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
    const low = FLOAT_VIEW.getUint32(0, true);
    const high = FLOAT_VIEW.getUint32(4, true);
    this.arr[position] = low & 255;
    this.arr[position + 1] = (low >> 8) & 255;
    this.arr[position + 2] = (low >> 16) & 255;
    this.arr[position + 3] = low >> 24;
    this.arr[position + 4] = high & 255;
    this.arr[position + 5] = (high >> 8) & 255;
    this.arr[position + 6] = (high >> 16) & 255;
    this.arr[position + 7] = high >> 24;
  }

  readFixed(length) {
    const position = this.pos;
    this.pos += length;
    if (this.pos > this.arr.length) return;
    return this.arr.slice(position, position + length);
  }

  skipFixed(length) {
    this.pos += length;
  }

  writeFixed(buffer, length) {
    length = length || buffer.length;
    const position = this.pos;
    this.pos += length;
    if (this.pos > this.arr.length) return;
    this.arr.set(buffer.subarray(0, length), position);
  }

  readBytes() {
    const length = this.readLong();
    if (length < 0) {
      this._invalidate();
      return;
    }
    return this.readFixed(length);
  }

  skipBytes() {
    const length = this.readLong();
    if (length < 0) {
      this._invalidate();
      return;
    }
    this.pos += length;
  }

  writeBytes(buffer) {
    const length = buffer.length;
    this.writeLong(length);
    this.writeFixed(buffer, length);
  }

  skipString() {
    const length = this.readLong();
    if (length < 0) {
      this._invalidate();
      return;
    }
    this.pos += length;
  }

  readString() {
    const length = this.readLong();
    if (length < 0) {
      this._invalidate();
      return '';
    }
    let position = this.pos;
    this.pos += length;
    if (this.pos > this.arr.length) return;
    const buffer = this.arr;
    const end = position + length;
    if (length > 24) return decodeSlice(buffer, position, end);

    let value = '';
    while (position + 3 < end) {
      const first = buffer[position];
      const second = buffer[position + 1];
      const third = buffer[position + 2];
      const fourth = buffer[position + 3];
      if ((first | second | third | fourth) & 128) {
        value += decodeSlice(buffer, position, end);
        return value;
      }
      value += String.fromCharCode(first, second, third, fourth);
      position += 4;
    }
    while (position < end) {
      const byte = buffer[position];
      if (byte & 128) {
        value += decodeSlice(buffer, position, end);
        return value;
      }
      value += String.fromCharCode(byte);
      position += 1;
    }
    return value;
  }

  writeString(value) {
    const buffer = this.arr;
    const characterLength = value.length;
    if (characterLength > 21) {
      let byteLength;
      let encoded;
      if (this.isValid()) {
        encoded = encodeSlice(value);
        byteLength = encoded.length;
      } else {
        byteLength = utf8Length(value);
      }
      this.writeLong(byteLength);
      const position = this.pos;
      this.pos += byteLength;
      if (this.isValid() && typeof encoded !== 'undefined') buffer.set(encoded, position);
      return;
    }

    let outputPosition = this.pos + 1;
    const contentStart = outputPosition;
    const capacity = buffer.length;
    for (let index = 0; index < characterLength; index += 1) {
      let codePoint = value.charCodeAt(index);
      let trailing;
      if (codePoint < 128) {
        if (outputPosition < capacity) buffer[outputPosition] = codePoint;
        outputPosition += 1;
      } else if (codePoint < 2048) {
        if (outputPosition + 1 < capacity) {
          buffer[outputPosition] = (codePoint >> 6) | 192;
          buffer[outputPosition + 1] = (codePoint & 63) | 128;
        }
        outputPosition += 2;
      } else if (
        (codePoint & 64512) === 55296 &&
        ((trailing = value.charCodeAt(index + 1)) & 64512) === 56320
      ) {
        codePoint = 65536 + ((codePoint & 1023) << 10) + (trailing & 1023);
        index += 1;
        if (outputPosition + 3 < capacity) {
          buffer[outputPosition] = (codePoint >> 18) | 240;
          buffer[outputPosition + 1] = ((codePoint >> 12) & 63) | 128;
          buffer[outputPosition + 2] = ((codePoint >> 6) & 63) | 128;
          buffer[outputPosition + 3] = (codePoint & 63) | 128;
        }
        outputPosition += 4;
      } else {
        if (outputPosition + 2 < capacity) {
          buffer[outputPosition] = (codePoint >> 12) | 224;
          buffer[outputPosition + 1] = ((codePoint >> 6) & 63) | 128;
          buffer[outputPosition + 2] = (codePoint & 63) | 128;
        }
        outputPosition += 3;
      }
    }
    if (this.pos <= capacity) this.writeLong(outputPosition - contentStart);
    this.pos = outputPosition;
  }

  matchBoolean(tap) {
    return this.arr[this.pos++] - tap.arr[tap.pos++];
  }

  matchLong(tap) {
    const left = this.readLong();
    const right = tap.readLong();
    return left === right ? 0 : left < right ? -1 : 1;
  }

  matchFloat(tap) {
    const left = this.readFloat();
    const right = tap.readFloat();
    return left === right ? 0 : left < right ? -1 : 1;
  }

  matchDouble(tap) {
    const left = this.readDouble();
    const right = tap.readDouble();
    return left === right ? 0 : left < right ? -1 : 1;
  }

  matchFixed(tap, length) {
    return bufCompare(this.readFixed(length), tap.readFixed(length));
  }

  matchBytes(tap) {
    const leftLength = this.readLong();
    const leftPosition = this.pos;
    this.pos += leftLength;
    const rightLength = tap.readLong();
    const rightPosition = tap.pos;
    tap.pos += rightLength;
    const left = this.arr.subarray(leftPosition, this.pos);
    const right = tap.arr.subarray(rightPosition, tap.pos);
    return bufCompare(left, right);
  }

  unpackLongBytes() {
    const bytes = new Uint8Array(8);
    let value = 0;
    let byteIndex = 0;
    let shift = 6;
    const buffer = this.arr;
    let byte = buffer[this.pos++];
    const negative = byte & 1;
    bytes.fill(0);
    value |= (byte & 127) >> 1;
    while (byte & 128) {
      byte = buffer[this.pos++];
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
    const buffer = this.arr;
    let shift = 1;
    let wordIndex = 0;
    let wordCount = 3;
    let value;
    if (negative) {
      invert(bytes, 8);
      value = 1;
    } else {
      value = 0;
    }
    const words = [
      bytes[0] | (bytes[1] << 8) | (bytes[2] << 16),
      bytes[3] | (bytes[4] << 8) | (bytes[5] << 16),
      bytes[6] | (bytes[7] << 8),
    ];
    while (wordCount && !words[--wordCount]) {}
    while (wordIndex < wordCount) {
      value |= words[wordIndex++] << shift;
      shift += 24;
      while (shift > 7) {
        buffer[this.pos++] = (value & 127) | 128;
        value >>= 7;
        shift -= 7;
      }
    }
    value |= words[wordCount] << shift;
    do {
      buffer[this.pos] = value & 127;
      value >>= 7;
    } while (value && (buffer[this.pos++] |= 128));
    this.pos += 1;
    if (negative) invert(bytes, 8);
  }
}

function invert(buffer, length) {
  while (length--) buffer[length] = ~buffer[length];
}

function printJSON(value) {
  const seen = new Set();
  try {
    return JSON.stringify(value, (key, current) => {
      if (seen.has(current)) return '[Circular]';
      if (typeof current === 'object' && current !== null) seen.add(current);
      if (typeof BigInt !== 'undefined' && current instanceof BigInt) {
        return `[BigInt ${current.toString()}n]`;
      }
      return current;
    });
  } catch (error) {
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
  printJSON,
};
