'use strict';

const NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

function isBufferLike(value) {
  return value instanceof Uint8Array;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function compare(a, b) {
  if (a === b) return 0;
  if (a < b) return -1;
  return 1;
}

var bufCompare, bufEqual;

if (typeof Buffer !== 'undefined') {
  bufCompare = Buffer.compare;
  bufEqual = function(a, b) {
    return Buffer.prototype.equals.call(a, b);
  };
} else {
  bufCompare = function(a, b) {
    if (a === b) return 0;
    let len = Math.min(a.length, b.length);
    for (let i = 0; i < len; i++) {
      if (a[i] !== b[i]) {
        return Math.sign(a[i] - b[i]);
      }
    }
    return Math.sign(a.length - b.length);
  };
  bufEqual = function(a, b) {
    if (a.length !== b.length) return false;
    return bufCompare(a, b) === 0;
  };
}

function getOption(obj, key, defaultValue) {
  let val = obj[key];
  return val === undefined ? defaultValue : val;
}

function singleIndexOf(arr, val) {
  let found = -1;
  if (!arr) return -1;
  for (let i = 0, len = arr.length; i < len; i++) {
    if (arr[i] === val) {
      if (found >= 0) return -1;
      found = i;
    }
  }
  return found;
}

function toMap(arr, keyFn) {
  let map = {};
  for (let i = 0; i < arr.length; i++) {
    let item = arr[i];
    map[keyFn(item)] = item;
  }
  return map;
}

function objectValues(obj) {
  return Object.keys(obj).map(key => obj[key]);
}

function hasDuplicates(arr, keyFn) {
  let seen = Object.create(null);
  for (let i = 0, len = arr.length; i < len; i++) {
    let val = arr[i];
    if (keyFn) val = keyFn(val);
    if (seen[val]) return true;
    seen[val] = true;
  }
  return false;
}

function copyOwnProperties(source, target, overwrite) {
  let keys = Object.getOwnPropertyNames(source);
  for (let i = 0, len = keys.length; i < len; i++) {
    let key = keys[i];
    if (!Object.prototype.hasOwnProperty.call(target, key) || overwrite) {
      let descriptor = Object.getOwnPropertyDescriptor(source, key);
      Object.defineProperty(target, key, descriptor);
    }
  }
  return target;
}

function isValidName(name) {
  return NAME_PATTERN.test(name);
}

function qualify(name, namespace) {
  if (name.indexOf('.') >= 0) {
    name = name.replace(/^\./, '');
  } else if (namespace) {
    name = namespace + '.' + name;
  }
  name.split('.').forEach(part => {
    if (!isValidName(part)) {
      throw new Error('invalid name: ' + JSON.stringify(name));
    }
  });
  return name;
}

function unqualify(name) {
  let parts = name.split('.');
  return parts[parts.length - 1];
}

function impliedNamespace(name) {
  let match = /^(.*)\.[^.]+$/.exec(name);
  return match ? match[1] : undefined;
}

function jsonEnd(str, pos) {
  pos = pos || 0;
  let c = str.charAt(pos++);
  if (/[\d-]/.test(c)) {
    while (/[eE\d.+-]/.test(str.charAt(pos))) pos++;
    return pos;
  } else if (/true|null/.test(str.slice(pos - 1, pos + 3))) {
    return pos + 3;
  } else if (/false/.test(str.slice(pos - 1, pos + 4))) {
    return pos + 4;
  }
  let depth = 0;
  let inString = false;
  do {
    switch (c) {
      case '{':
      case '[':
        if (!inString) depth++;
        break;
      case '}':
      case ']':
        if (!inString && !--depth) return pos;
        break;
      case '"':
        inString = !inString;
        if (!depth && !inString) return pos;
        break;
      case '\\':
        pos++;
        break;
    }
  } while (c = str.charAt(pos++));
  return -1;
}

function abstractFunction() {
  throw new Error('abstract');
}

class Lcg {
  constructor(seed) {
    let m = 0x3ab4bd90 + 0x464ef029 - 0x3f3d5f4c;
    let a = -0x390b + 0x3 * 0x1c83 - 0x13bb * -1;
    let max = Math.pow(2, 0x26cb + 0x1818 - 0x3ee1);
    let s = Math.floor(seed || (Math.random() * (max - 0x4cc + 0xd29 - 0x85e)));
    this.max = max;
    this.next = function() {
      s = ((m * s + a) % max + max) % max;
      return s;
    };
  }
  bool() {
    return !!(this.next() % 2);
  }
  int(min, max) {
    if (max === undefined) {
      max = min;
      min = 0;
    }
    max = max === undefined ? this.max : max;
    return min + Math.floor(this.next() * (max - min));
  }
  float(min, max) {
    if (max === undefined) {
      max = min;
      min = 0;
    }
    max = max === undefined ? 1 : max;
    return min + (this.next() / this.max) * (max - min);
  }
  string(len, charset) {
    charset = charset || 'aA';
    let chars = '';
    if (charset.indexOf('a') >= 0) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (charset.indexOf('A') >= 0) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (charset.indexOf('#') >= 0) chars += '0123456789';
    if (charset.indexOf('!') >= 0) chars += '~`!@#$%^&*()_+-={}[]|\\:;"\'<>,.?/';
    let result = [];
    for (let i = 0; i < len; i++) {
      result.push(this.choice(chars));
    }
    return result.join('');
  }
  buffer(len) {
    let buf = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      buf[i] = this.int(256);
    }
    return buf;
  }
  choice(arr) {
    let len = arr.length;
    if (!len) {
      throw new Error('empty array');
    }
    return arr[this.int(len)];
  }
}

class OrderedQueue {
  constructor() {
    this.counter = 0;
    this.items = [];
  }
  push(item) {
    let items = this.items;
    let i = items.length;
    let parent;
    items.push(item);
    while (i > 0 && items[parent = (i - 1) >> 1].counter > items[i].counter) {
      item = items[i];
      items[i] = items[parent];
      items[parent] = item;
      i = parent;
    }
  }
  pop() {
    let items = this.items;
    let len = items.length - 1;
    let result = items[0];
    if (!result || result.counter !== this.counter) return null;
    this.counter++;
    if (!len) {
      items.pop();
      return result;
    }
    items[0] = items.pop();
    let i = 0;
    let left, right, child, item, swap;
    while ((left = (i << 1) + 1) <= len) {
      right = left + 1;
      child = items[left];
      swap = left;
      if (right <= len && items[right].counter < child.counter) {
        child = items[right];
        swap = right;
      }
      if (child.counter >= items[i].counter) break;
      items[swap] = items[i];
      items[i] = child;
      i = swap;
    }
    return result;
  }
}

var decodeSlice;
if (typeof Buffer !== 'undefined' && typeof Buffer.prototype.toString === 'function') {
  decodeSlice = Function.prototype.call.bind(Buffer.prototype.toString);
} else {
  const DECODER = new TextDecoder();
  decodeSlice = function(buf, start, end) {
    return DECODER.decode(buf.subarray(start, end));
  };
}

var ENCODER = new TextEncoder();
var encodeBuf = new Uint8Array(0xb1b - 0x2074 + 0x2559);
var encodeBufs = [];

function encodeSlice(str) {
  let {read, written} = ENCODER.encodeInto(str, encodeBuf);
  if (read === str.length) {
    if (!encodeBufs[written]) {
      encodeBufs[written] = encodeBuf.slice(0, written);
    }
    return encodeBufs[written];
  }
  return ENCODER.encode(str);
}

var utf8Length;
if (typeof Buffer !== 'undefined') {
  utf8Length = Buffer.byteLength;
} else {
  utf8Length = function(str) {
    let total = 0;
    for (;;) {
      let {read, written} = ENCODER.encodeInto(str, encodeBuf);
      total += written;
      if (read === str.length) break;
      str = str.slice(read);
    }
    return total;
  };
}

var bufferToBinaryString;
if (typeof Buffer !== 'undefined' && typeof Buffer.prototype.toString === 'function') {
  bufferToBinaryString = Function.prototype.call.bind(Buffer.prototype.toString);
} else {
  bufferToBinaryString = function(buf) {
    let str = '';
    let i = 0;
    let len = buf.length;
    for (; i + 7 < len; i += 8) {
      str += String.fromCharCode(
        buf[i], buf[i + 1], buf[i + 2], buf[i + 3],
        buf[i + 4], buf[i + 5], buf[i + 6], buf[i + 7]
      );
    }
    for (; i < len; i++) {
      str += String.fromCharCode(buf[i]);
    }
    return str;
  };
}

var binaryStringToBuffer;
if (typeof Buffer !== 'undefined') {
  binaryStringToBuffer = function(str) {
    let buf = Buffer.from(str, 'binary');
    return new Uint8Array(buf.buffer, buf.byteOffset, buf.length);
  };
} else {
  binaryStringToBuffer = function(str) {
    let buf = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
      buf[i] = str.charCodeAt(i);
    }
    return buf;
  };
}

var FLOAT_VIEW = new DataView(new ArrayBuffer(8));

class Tap {
  constructor(buf, pos) {
    this.wrap(buf, pos);
  }
  wrap(buf, pos) {
    if (typeof Buffer !== 'undefined' && buf instanceof Buffer) {
      buf = new Uint8Array(buf.buffer, buf.byteOffset, buf.length);
    }
    this.buf = buf;
    this.pos = pos || 0;
    if (this.pos < 0) {
      throw new Error('negative pos');
    }
  }
  get length() {
    return this.buf.length;
  }
  unwrap() {
    return this.buf.subarray(0, this.pos);
  }
  skip(len) {
    this.pos += len;
  }
  write(buf) {
    let target = new Uint8Array(this.buf.length + buf.length);
    target.set(this.buf, 0);
    target.set(buf, this.buf.length);
    this.wrap(target, -1);
  }
  concat(buf) {
    let head = this.buf.subarray(this.pos);
    let result = new Uint8Array(head.length + buf.length);
    result.set(head, 0);
    result.set(buf, head.length);
    this.wrap(result, -1);
  }
  isValid() {
    return this.pos <= this.buf.length;
  }
  readByte() {
    return this.buf[this.pos++];
  }
  skipByte() {
    this.pos++;
  }
  writeByte(val) {
    this.buf[this.pos++] = val;
  }
  readBoolean() {
    return !!this.buf[this.pos++];
  }
  skipBoolean() {
    this.pos++;
  }
  writeBoolean(val) {
    this.buf[this.pos++] = !!val;
  }
  readInt() {
    let n = 0;
    let shift = 0;
    let buf = this.buf;
    let b, more;
    do {
      b = buf[this.pos++];
      more = b & 0x80;
      n |= (b & 0x7f) << shift;
      shift += 7;
    } while (more && shift < 28);
    if (more) {
      let m = n;
      let s = 0x570d * 0x10da + 0x141bc9f7 - 0x29d6bb09;
      do {
        b = buf[this.pos++];
        m += (b & 0x7f) << s;
        s += 7;
      } while (b & 0x80);
      return (m >>> 1) ^ -(m & 1);
    }
    return (n >>> 1) ^ -(n & 1);
  }
  skipInt() {
    while (this.buf[this.pos++] & 0x80) {}
  }
  writeInt(n) {
    let buf = this.buf;
    let m, b;
    if (n >= -0x7637bb3d - 0x6eb1147f - 0x56 * -0x367ea9a && n <= 0x3c * 0x20f9909 + 0x174c41d3 - 0x52f41fef) {
      m = n >= 0 ? n << 1 : (~n << 1) | 1;
      do {
        buf[this.pos] = m & 0x7f;
        m >>= 7;
      } while (m && (buf[this.pos++] |= 0x80));
    } else {
      m = n >= 0 ? n << 1 : (~n << 1) | 1;
      do {
        buf[this.pos] = m & 0x7f;
        m /= 128;
      } while (m > 0 && (buf[this.pos++] |= 0x80));
    }
    this.pos++;
  }
  readFloat() {
    let pos = this.pos;
    this.pos += 4;
    if (this.pos > this.buf.length) return 0;
    FLOAT_VIEW.setInt32(0, (this.buf[pos] | (this.buf[pos + 1] << 8) | (this.buf[pos + 2] << 16) | (this.buf[pos + 3] << 24)), true);
    return FLOAT_VIEW.getFloat32(0, true);
  }
  skipFloat() {
    this.pos += 4;
  }
  writeFloat(val) {
    FLOAT_VIEW.setFloat32(0, val, true);
    const b = FLOAT_VIEW.getInt32(0, true);
    this.buf[this.pos] = b & 0xff;
    this.buf[this.pos + 1] = (b >> 8) & 0xff;
    this.buf[this.pos + 2] = (b >> 16) & 0xff;
    this.buf[this.pos + 3] = (b >> 24) & 0xff;
  }
  readDouble() {
    let pos = this.pos;
    this.pos += 8;
    if (this.pos > this.buf.length) return 0;
    FLOAT_VIEW.setInt32(0, (this.buf[pos] | (this.buf[pos + 1] << 8) | (this.buf[pos + 2] << 16) | (this.buf[pos + 3] << 24)), true);
    FLOAT_VIEW.setInt32(4, (this.buf[pos + 4] | (this.buf[pos + 5] << 8) | (this.buf[pos + 6] << 16) | (this.buf[pos + 7] << 24)), true);
    return FLOAT_VIEW.getFloat64(0, true);
  }
  skipDouble() {
    this.pos += 8;
  }
  writeDouble(val) {
    FLOAT_VIEW.setFloat64(0, val, true);
    const b1 = FLOAT_VIEW.getInt32(0, true);
    const b2 = FLOAT_VIEW.getInt32(4, true);
    this.buf[this.pos] = b1 & 0xff;
    this.buf[this.pos + 1] = (b1 >> 8) & 0xff;
    this.buf[this.pos + 2] = (b1 >> 16) & 0xff;
    this.buf[this.pos + 3] = (b1 >> 24) & 0xff;
    this.buf[this.pos + 4] = b2 & 0xff;
    this.buf[this.pos + 5] = (b2 >> 8) & 0xff;
    this.buf[this.pos + 6] = (b2 >> 16) & 0xff;
    this.buf[this.pos + 7] = (b2 >> 24) & 0xff;
  }
  readFixed(len) {
    let pos = this.pos;
    this.pos += len;
    if (this.pos > this.buf.length) return;
    return this.buf.subarray(pos, pos + len);
  }
  skipFixed(len) {
    this.pos += len;
  }
  writeFixed(buf) {
    let pos = this.pos;
    this.pos += buf.length;
    if (this.pos > this.buf.length) return;
    this.buf.set(buf, pos);
  }
  readBytes() {
    let len = this.readInt();
    if (len < 0) {
      this.skipBytes();
      return;
    }
    let start = this.pos;
    this.pos += len;
    if (this.isValid()) {
      return decodeSlice(this.buf, start, this.pos);
    }
  }
  skipBytes() {
    let len = this.readInt();
    this.pos += len;
  }
  writeBytes(str) {
    let len = str.length;
    if (len < 0) {
      this.writeInt(-1);
      return;
    }
    let enc;
    if (this.isValid() && typeof str !== 'string') {
      enc = encodeSlice(str);
      len = enc.length;
    } else {
      len = utf8Length(str);
    }
    this.writeInt(len);
    let pos = this.pos;
    this.pos += len;
    if (this.isValid() && typeof enc !== 'undefined') {
      this.buf.set(enc, pos);
    }
  }
  readString() {
    let len = this.readInt();
    if (len < 0) {
      this.skipString();
      return '';
    }
    let start = this.pos;
    this.pos += len;
    if (this.pos > this.buf.length) return;
    let buf = this.buf;
    let end = start + len;
    let result = '';
    while (start + 3 < end) {
      let b1 = buf[start];
      let b2 = buf[start + 1];
      let b3 = buf[start + 2];
      let b4 = buf[start + 3];
      if (((b1 | b2 | b3 | b4) & 0x80) === 0) {
        result += String.fromCharCode(b1, b2, b3, b4);
        start += 4;
      } else {
        break;
      }
    }
    while (start < end) {
      let b = buf[start];
      if (b < 0x80) {
        result += String.fromCharCode(b);
        start++;
      } else if ((b & 0xe0) === 0xc0) {
        if (start + 1 >= end) break;
        result += decodeSlice(buf, start, start + 2);
        start += 2;
      } else if ((b & 0xf0) === 0xe0) {
        if (start + 2 >= end) break;
        result += decodeSlice(buf, start, start + 3);
        start += 3;
      } else if ((b & 0xf8) === 0xf0) {
        if (start + 3 >= end) break;
        result += decodeSlice(buf, start, start + 4);
        start += 4;
      } else {
        break;
      }
    }
    return result;
  }
  skipString() {
    let len = this.readInt();
    this.pos += len;
  }
  writeString(str) {
    let len = str.length;
    if (len < 0) {
      this.writeInt(-1);
      return;
    }
    let enc;
    if (this.isValid()) {
      enc = encodeSlice(str);
      len = enc.length;
    } else {
      len = utf8Length(str);
    }
    this.writeInt(len);
    let pos = this.pos;
    this.pos += len;
    if (this.isValid() && typeof enc !== 'undefined') {
      this.buf.set(enc, pos);
    }
  }
  readLong() {
    let buf = this.buf;
    let b = buf[this.pos++];
    let n = (b & 0x7f);
    let shift = 7;
    let more = b & 0x80;
    while (more && shift < 28) {
      b = buf[this.pos++];
      more = b & 0x80;
      n |= (b & 0x7f) << shift;
      shift += 7;
    }
    if (more) {
      let m = n;
      let s = 0;
      do {
        b = buf[this.pos++];
        m += (b & 0x7f) << s;
        s += 7;
      } while (b & 0x80);
      return (m >>> 1) ^ -(m & 1);
    }
    return (n >>> 1) ^ -(n & 1);
  }
  skipLong() {
    while (this.buf[this.pos++] & 0x80) {}
  }
  writeLong(n) {
    let m = n >= 0 ? n << 1 : (~n << 1) | 1;
    do {
      this.buf[this.pos] = m & 0x7f;
      m >>= 7;
    } while (m && (this.buf[this.pos++] |= 0x80));
    this.pos++;
  }
  readEnum(symbols) {
    return symbols[this.readInt()];
  }
  skipEnum() {
    this.skipInt();
  }
  writeEnum(val, symbols) {
    this.writeInt(symbols.indexOf(val));
  }
  readArrayHeader() {
    return this.readInt();
  }
  skipArrayHeader() {
    this.skipInt();
  }
  writeArrayHeader(len) {
    this.writeInt(len);
  }
  readMapHeader() {
    return this.readInt();
  }
  skipMapHeader() {
    this.skipInt();
  }
  writeMapHeader(len) {
    this.writeInt(len);
  }
  readUnionIndex() {
    return this.readInt();
  }
  skipUnionIndex() {
    this.skipInt();
  }
  writeUnionIndex(idx) {
    this.writeInt(idx);
  }
  readFixedBytes(len) {
    let pos = this.pos;
    this.pos += len;
    if (this.pos > this.buf.length) return;
    return this.buf.subarray(pos, this.pos);
  }
  skipFixedBytes(len) {
    this.pos += len;
  }
  writeFixedBytes(buf, len) {
    this.buf.set(buf.subarray(0, len), this.pos);
    this.pos += len;
  }
  compareBytes(other, len) {
    return bufCompare(this.readFixedBytes(len), other.readFixedBytes(len));
  }
  compareString(other) {
    let len1 = this.readInt();
    let pos1 = this.pos;
    this.pos += len1;
    let len2 = other.readInt();
    let pos2 = other.pos;
    other.pos += len2;
    return bufCompare(this.buf.subarray(pos1, this.pos), other.buf.subarray(pos2, other.pos));
  }
  compareFloat(other) {
    let a = this.readFloat();
    let b = other.readFloat();
    return a === b ? 0 : a < b ? -1 : 1;
  }
  compareDouble(other) {
    let a = this.readDouble();
    let b = other.readDouble();
    return a === b ? 0 : a < b ? -1 : 1;
  }
  compareLong(other) {
    let a = this.readLong();
    let b = other.readLong();
    return a === b ? 0 : a < b ? -1 : 1;
  }
  compareFixed(other, len) {
    return bufCompare(this.readFixed(len), other.readFixed(len));
  }
  compareBytes(other, len) {
    return bufCompare(this.readFixedBytes(len), other.readFixedBytes(len));
  }
}

function invert(buf, len) {
  while (len--) {
    buf[len] = ~buf[len];
  }
}

function printJSON(obj) {
  let seen = new Set();
  try {
    return JSON.stringify(obj, (key, value) => {
      if (seen.has(value)) return '[Circular]';
      if (typeof value === 'object' && value !== null) seen.add(value);
      if (typeof BigInt !== 'undefined' && typeof value === 'bigint') {
        return value.toString() + 'n';
      }
      return value;
    });
  } catch (e) {
    return '[Object]';
  }
}

const platform = require('./platform');

const exports = {
  abstractFunction: abstractFunction,
  bufCompare: bufCompare,
  bufEqual: bufEqual,
  bufferToBinaryString: bufferToBinaryString,
  binaryStringToBuffer: binaryStringToBuffer,
  capitalize: capitalize,
  copyOwnProperties: copyOwnProperties,
  createHash: platform.createHash,
  compare: compare,
  getOption: getOption,
  impliedNamespace: impliedNamespace,
  isBufferLike: isBufferLike,
  isValidName: isValidName,
  jsonEnd: jsonEnd,
  objectValues: objectValues,
  qualify: qualify,
  toMap: toMap,
  singleIndexOf: singleIndexOf,
  hasDuplicates: hasDuplicates,
  unqualify: unqualify,
  Lcg: Lcg,
  OrderedQueue: OrderedQueue,
  Tap: Tap,
  printJSON: printJSON
};

module.exports = exports;
