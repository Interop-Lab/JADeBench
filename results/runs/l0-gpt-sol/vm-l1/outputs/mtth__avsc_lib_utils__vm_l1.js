'use strict';

const crypto = require('crypto');

const NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

function isBufferLike(value) {
  return typeof Buffer !== 'undefined' && Buffer.isBuffer(value) ||
    value instanceof Uint8Array;
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function compare(a, b) {
  const length = Math.min(a.length, b.length);
  for (let i = 0; i < length; i++) {
    const av = a[i];
    const bv = b[i];
    if (av < bv) return -1;
    if (av > bv) return 1;
  }
  return a.length - b.length;
}

function getOption(options, name, defaultValue) {
  return options && options[name] !== undefined ? options[name] : defaultValue;
}

function singleIndexOf(array, value) {
  const index = array.indexOf(value);
  return index === -1 ? undefined : index;
}

function toMap(array, value) {
  const map = Object.create(null);
  for (const item of array) {
    map[item] = value === undefined ? true : value;
  }
  return map;
}

function objectValues(object) {
  return Object.keys(object).map(key => object[key]);
}

function hasDuplicates(array, key) {
  const seen = new Set();
  for (const value of array) {
    const item = key ? key(value) : value;
    if (seen.has(item)) return true;
    seen.add(item);
  }
  return false;
}

function copyOwnProperties(source, target, properties) {
  if (properties) {
    for (const property of properties) {
      if (Object.prototype.hasOwnProperty.call(source, property)) {
        target[property] = source[property];
      }
    }
  } else {
    for (const property of Object.keys(source)) {
      target[property] = source[property];
    }
  }
  return target;
}

function isValidName(name) {
  return typeof name === 'string' && NAME_PATTERN.test(name);
}

function qualify(name, namespace) {
  return name.indexOf('.') === -1 && namespace ? namespace + '.' + name : name;
}

function unqualify(name) {
  const index = name.lastIndexOf('.');
  return index === -1 ? name : name.slice(index + 1);
}

function impliedNamespace(name) {
  const index = name.lastIndexOf('.');
  return index === -1 ? undefined : name.slice(0, index);
}

function jsonEnd(string, index) {
  let i = index || 0;
  while (i < string.length && /\s/.test(string[i])) i++;

  const start = i;
  const first = string[i];

  if (first === '"' || first === "'" ) {
    const quote = first;
    i++;
    while (i < string.length) {
      if (string[i] === '\\') {
        i += 2;
      } else if (string[i] === quote) {
        return i + 1;
      } else {
        i++;
      }
    }
    return -1;
  }

  if (first === '{' || first === '[') {
    const open = first;
    const close = first === '{' ? '}' : ']';
    const stack = [close];
    let quote = null;

    for (i++; i < string.length; i++) {
      const character = string[i];
      if (quote) {
        if (character === '\\') {
          i++;
        } else if (character === quote) {
          quote = null;
        }
        continue;
      }
      if (character === '"' || character === "'") {
        quote = character;
      } else if (character === '{') {
        stack.push('}');
      } else if (character === '[') {
        stack.push(']');
      } else if (character === stack[stack.length - 1]) {
        stack.pop();
        if (!stack.length) return i + 1;
      }
    }
    return -1;
  }

  const match = string.slice(start).match(
    /^(?:true|false|null|[-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][-+]?\d+)?)/);
  return match ? start + match[0].length : -1;
}

function abstractFunction() {
  throw new Error('abstract function');
}

function encodeSlice(value) {
  return Buffer.from(String(value), 'utf8');
}

function invert(value, defaultValue) {
  return value === undefined ? defaultValue : !value;
}

function printJSON(value) {
  return JSON.stringify(value, (_, item) => item === undefined ? null : item);
}

class Lcg {
  constructor(seed) {
    this.seed = seed == null ? 0 : seed >>> 0;
  }

  nextFloat() {
    this.seed = (Math.imul(1664525, this.seed) + 1013904223) >>> 0;
    return this.seed / 0x100000000;
  }

  nextInt(min, max) {
    if (max === undefined) {
      max = min;
      min = 0;
    }
    return min + Math.floor(this.nextFloat() * (max - min));
  }

  nextBoolean() {
    return this.nextInt(2) === 0;
  }

  nextString(length, characters) {
    characters = characters || 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters[this.nextInt(characters.length)];
    }
    return result;
  }

  nextBuffer(length) {
    const buffer = Buffer.alloc(length);
    for (let i = 0; i < length; i++) buffer[i] = this.nextInt(256);
    return buffer;
  }

  choice(array) {
    return array[this.nextInt(array.length)];
  }
}

class OrderedQueue {
  constructor() {
    this.items = [];
  }

  push(item) {
    let index = this.items.length;
    while (index > 0 && this.items[index - 1].index > item.index) index--;
    this.items.splice(index, 0, item);
  }

  pop() {
    return this.items.shift();
  }
}

function bufferToBinaryString(buffer) {
  return Buffer.from(buffer.buffer, buffer.byteOffset, buffer.byteLength).toString('latin1');
}

function binaryStringToBuffer(string) {
  return Buffer.from(string, 'latin1');
}

function utf8Length(string) {
  return Buffer.byteLength(string, 'utf8');
}

function bufCompare(a, b) {
  return compare(a, b);
}

function bufEqual(a, b) {
  return compare(a, b) === 0;
}

class Tap {
  constructor(buf, pos) {
    this.buf = buf || Buffer.alloc(0);
    this.pos = pos || 0;
  }

  static fromBuffer(buf, pos) {
    return new Tap(buf, pos);
  }

  static withCapacity(size) {
    return new Tap(Buffer.alloc(size), 0);
  }

  isValid() {
    return this.pos <= this.buf.length;
  }

  get length() {
    return this.pos;
  }

  reinitialize(buf, pos) {
    this.buf = buf;
    this.pos = pos || 0;
  }

  toBuffer() {
    return this.buf.subarray(0, this.pos);
  }

  skipBoolean() {
    this.pos++;
  }

  readBoolean() {
    return this.buf[this.pos++] !== 0;
  }

  writeBoolean(value) {
    this.buf[this.pos++] = value ? 1 : 0;
  }

  skipInt() {
    while (this.buf[this.pos++] & 0x80) {}
  }

  readInt() {
    let value = 0;
    let shift = 0;
    let byte;
    do {
      byte = this.buf[this.pos++];
      value |= (byte & 0x7f) << shift;
      shift += 7;
    } while (byte & 0x80);
    return (value >>> 1) ^ -(value & 1);
  }

  writeInt(value) {
    value = ((value << 1) ^ (value >> 31)) >>> 0;
    while (value & ~0x7f) {
      this.buf[this.pos++] = (value & 0x7f) | 0x80;
      value >>>= 7;
    }
    this.buf[this.pos++] = value;
  }

  skipLong() {
    this.skipInt();
  }

  readLong() {
    return this.readInt();
  }

  writeLong(value) {
    this.writeInt(value);
  }

  skipFloat() {
    this.pos += 4;
  }

  readFloat() {
    const value = this.buf.readFloatLE(this.pos);
    this.pos += 4;
    return value;
  }

  writeFloat(value) {
    this.buf.writeFloatLE(value, this.pos);
    this.pos += 4;
  }

  skipDouble() {
    this.pos += 8;
  }

  readDouble() {
    const value = this.buf.readDoubleLE(this.pos);
    this.pos += 8;
    return value;
  }

  writeDouble(value) {
    this.buf.writeDoubleLE(value, this.pos);
    this.pos += 8;
  }

  skipFixed(size) {
    this.pos += size;
  }

  readFixed(size) {
    const value = this.buf.subarray(this.pos, this.pos + size);
    this.pos += size;
    return value;
  }

  writeFixed(value, size) {
    const length = size === undefined ? value.length : size;
    Buffer.from(value).copy(this.buf, this.pos, 0, length);
    this.pos += length;
  }

  skipBytes() {
    const size = this.readLong();
    this.pos += size;
  }

  readBytes() {
    const size = this.readLong();
    const value = this.buf.subarray(this.pos, this.pos + size);
    this.pos += size;
    return value;
  }

  writeBytes(value) {
    this.writeLong(value.length);
    this.writeFixed(value);
  }

  skipString() {
    this.skipBytes();
  }

  readString() {
    return this.readBytes().toString('utf8');
  }

  writeString(value) {
    this.writeBytes(Buffer.from(value, 'utf8'));
  }

  matchBoolean(value) {
    return this.readBoolean() === value;
  }

  matchInt(value) {
    return this.readInt() === value;
  }

  matchLong(value) {
    return this.readLong() === value;
  }

  matchFloat(value) {
    return this.readFloat() === value;
  }

  matchDouble(value) {
    return this.readDouble() === value;
  }

  matchFixed(value) {
    const actual = this.readFixed(value.length);
    return compare(actual, value) === 0;
  }

  matchBytes(value) {
    return this.matchFixed(value);
  }

  matchString(value) {
    return this.readString() === value;
  }

  skip() {
    this.pos++;
  }

  append(other) {
    const value = other instanceof Tap ? other.toBuffer() : other;
    const required = this.pos + value.length;
    if (required > this.buf.length) {
      const buffer = Buffer.alloc(Math.max(required, this.buf.length * 2 || 1));
      this.buf.copy(buffer);
      this.buf = buffer;
    }
    Buffer.from(value).copy(this.buf, this.pos);
    this.pos += value.length;
  }
}

const platform = {
  getHash(value) {
    return crypto.createHash('sha256').update(value).digest();
  }
};

module.exports = {
  abstractFunction,
  bufCompare,
  bufEqual,
  bufferToBinaryString,
  binaryStringToBuffer,
  capitalize,
  copyOwnProperties,
  getHash: platform.getHash,
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
