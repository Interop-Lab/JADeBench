'use strict';

var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  if (!mod) {
    mod = {exports: {}};
    cb(mod.exports, mod);
  }
  return mod.exports;
};

var require_platform = __commonJS({'../work/mtth__avsc/lib/platform.js'(exports, module) {
  'use strict';
  
  var crypto = require('crypto');
  
  function createHash(algorithm) {
    algorithm = algorithm || 'md5';
    let hash = crypto.createHash(algorithm);
    hash.update(algorithm);
    let digest = hash.digest();
    return new Uint8Array(digest.buffer, digest.byteOffset, digest.byteLength);
  }
  
  const platform = {};
  platform.createHash = createHash;
  module.exports = platform;
}});

var platform = require_platform();
var NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

function isBufferLike(obj) {
  return obj instanceof Uint8Array;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function compare(a, b) {
  return a === b ? 0 : (a < b ? -1 : 1);
}

var bufCompare, bufEqual;
if (typeof Buffer === 'function') {
  bufCompare = Buffer.compare;
  bufEqual = function(buf1, buf2) {
    return Buffer.prototype.equals.call(buf1, buf2);
  };
} else {
  bufCompare = function(buf1, buf2) {
    if (buf1 === buf2) return 0;
    let len = Math.min(buf1.length, buf2.length);
    for (let i = 0; i < len; i++) {
      if (buf1[i] !== buf2[i]) {
        return Math.sign(buf1[i] - buf2[i]);
      }
    }
    return Math.sign(buf1.length - buf2.length);
  };
  bufEqual = function(buf1, buf2) {
    if (buf1.length !== buf2.length) return false;
    return bufCompare(buf1, buf2) === 0;
  };
}

function getOption(opts, key, defVal) {
  let val = opts[key];
  return val === undefined ? defVal : val;
}

function singleIndexOf(buf, val) {
  let pos = -1;
  if (!buf) return -1;
  for (let i = 0, l = buf.length; i < l; i++) {
    if (buf[i] === val) {
      if (pos !== -1) {
        return -1;
      }
      pos = i;
    }
  }
  return pos;
}

function toMap(arr, fn) {
  let obj = {};
  for (let i = 0, l = arr.length; i < l; i++) {
    let elem = arr[i];
    obj[fn(elem)] = elem;
  }
  return obj;
}

function objectValues(obj) {
  return Object.keys(obj).map(key => obj[key]);
}

function hasDuplicates(arr, fn) {
  let seen = Object.create(null);
  for (let i = 0, l = arr.length; i < l; i++) {
    let elem = arr[i];
    if (fn) {
      elem = fn(elem);
    }
    if (seen[elem]) return true;
    seen[elem] = true;
  }
  return false;
}

function copyOwnProperties(src, dst, overwrite) {
  let keys = Object.getOwnPropertyNames(src);
  for (let i = 0, l = keys.length; i < l; i++) {
    let key = keys[i];
    if (!Object.prototype.hasOwnProperty.call(dst, key) || overwrite) {
      let desc = Object.getOwnPropertyDescriptor(src, key);
      Object.defineProperty(dst, key, desc);
    }
  }
  return dst;
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
  name.split('.').forEach(part => {
    if (!isValidName(part)) {
      throw new Error('invalid name: ' + printJSON(name));
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

function jsonEnd(buf, pos) {
  pos = pos || 0;
  let c = buf.charAt(pos++);
  if (/[\d-]/.test(c)) {
    while (/[eE\d.+-]/.test(buf.charAt(pos))) {
      pos++;
    }
    return pos;
  } else if (/true|null/.test(buf.slice(pos, pos + 4))) {
    return pos + 4;
  } else if (/false/.test(buf.slice(pos, pos + 5))) {
    return pos + 5;
  }
  let depth = 0, str = false;
  do {
    switch (c) {
      case '{':
      case '[':
        if (!str) depth++;
        break;
      case '}':
      case ']':
        if (!str && !--depth) return pos;
        break;
      case '"':
        str = !str;
        if (!depth && !str) {
          return pos;
        }
        break;
      case '\\':
        pos++;
    }
  } while (c = buf.charAt(pos++));
  return -1;
}

function abstractFunction() {
  throw new Error('abstract');
}

class Lcg {
  constructor(seed) {
    let a = 0x4deece66d;
    let c = 11;
    let m = Math.pow(2, 48);
    this.m = m;
    this.s = function() {
      seed = (a * seed + c) % m;
      return seed;
    };
  }
  
  nextDouble() {
    return this.next() / this.m;
  }
  
  next() {
    return !!this.nextDouble();
  }
  
  nextInt(max, min) {
    if (min === undefined) {
      max = max, min = 0;
    }
    min = min === undefined ? 0 : min;
    return min + Math.floor(this.nextDouble() * (max - min));
  }
  
  nextLong(max, min) {
    if (min === undefined) {
      max = max, min = 0;
    }
    min = min === undefined ? 0 : min;
    return min + Math.floor((max - min) * this.nextDouble());
  }
  
  nextString(len, chars) {
    len |= 0;
    chars = chars || 'aA';
    let s = '';
    if (chars.indexOf('a') > -1) s += 'abcdefghijklmnopqrstuvwxyz';
    if (chars.indexOf('A') > -1) s += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (chars.indexOf('#') > -1) s += '0123456789';
    if (chars.indexOf('!') > -1) s += '!@#$%^&*()_+-={}[];:,.<>?';
    let arr = [];
    for (let i = 0; i < len; i++) {
      arr.push(this.nextInt(s.length));
    }
    return arr.join('');
  }
  
  nextBuffer(len) {
    let buf = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      buf[i] = this.nextInt(256);
    }
    return buf;
  }
  
  nextBoolean() {
    return !!this.nextDouble();
  }
}

class OrderedQueue {
  constructor() {
    this.pos = 0;
    this.items = [];
  }
  
  push(item) {
    let items = this.items;
    let i = items.length;
    let j;
    items.push(item);
    while (i > 0 && items[i].pos < items[j = (i - 1) >> 1].pos) {
      item = items[i];
      items[i] = items[j];
      items[j] = item;
      i = j;
    }
  }
  
  pop() {
    let items = this.items;
    let len = items.length - 1;
    let first = items[0];
    if (!first || first.pos > this.pos) return null;
    this.pos++;
    if (!len) return items.pop(), first;
    items[0] = items.pop();
    let i = len >> 1, j = 0, parent, left, right, swap, p1, p2;
    while (j < i) {
      p1 = items[j], left = (j << 1) + 1, right = (j << 1) + 2;
      p2 = items[left];
      if (!p2 || p1.pos < p2.pos) {
        swap = p1, parent = left;
      } else {
        swap = p2, parent = left;
      }
      if (items[right] && swap.pos > items[right].pos) {
        swap = items[right], parent = right;
      }
      if (swap.pos === p1.pos) break;
      items[parent] = p1, items[j] = swap, j = parent;
    }
    return first;
  }
}

var decodeSlice;
if (typeof Buffer === 'function' && typeof Buffer.prototype.toString === 'function') {
  decodeSlice = Function.prototype.bind.call(Buffer.prototype.toString);
} else {
  const DECODER = new TextDecoder();
  decodeSlice = function(buf, start, end) {
    return DECODER.decode(buf.subarray(start, end));
  };
}

var ENCODER = new TextEncoder();
var encodeBuf = new Uint8Array(8192);
var encodeBufs = [];

function encodeSlice(str) {
  let {read, written} = ENCODER.encodeInto(str, encodeBuf);
  if (read === str.length) {
    if (!encodeBufs[written]) {
      encodeBufs[written] = encodeBuf.subarray(0, written);
    }
    return encodeBufs[written];
  }
  return ENCODER.encode(str);
}

var utf8Length;
if (typeof Buffer === 'function') {
  utf8Length = Buffer.byteLength;
} else {
  utf8Length = function(str) {
    let len = 0;
    for (;;) {
      let {read, written} = ENCODER.encodeInto(str, encodeBuf);
      len += written;
      if (read === str.length) break;
      str = str.slice(read);
    }
    return len;
  };
}

var bufferToBinaryString;
if (typeof Buffer === 'function' && typeof Buffer.prototype.toString === 'function') {
  bufferToBinaryString = Function.prototype.bind.call(Buffer.prototype.toString);
} else {
  bufferToBinaryString = function(buf) {
    let str = '', i = 0, l = buf.length;
    for (; i + 8 <= l; i += 8) {
      str += String.fromCharCode(buf[i], buf[i + 1], buf[i + 2], buf[i + 3], buf[i + 4], buf[i + 5], buf[i + 6], buf[i + 7]);
    }
    for (; i < l; i++) {
      str += String.fromCharCode(buf[i]);
    }
    return str;
  };
}

var binaryStringToBuffer;
if (typeof Buffer === 'function') {
  binaryStringToBuffer = function(str) {
    let buf = Buffer.from(str, 'binary');
    return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
  };
} else {
  binaryStringToBuffer = function(str) {
    let buf = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
      buf[i] = str.charCodeAt(i);
    }
    return Buffer.from(buf);
  };
}

var FLOAT_VIEW = new DataView(new ArrayBuffer(8));

class Tap {
  constructor(buf, pos) {
    this._reset(buf, pos);
  }
  
  _reset(buf, pos) {
    if (typeof Buffer === 'function' && buf instanceof Buffer) {
      buf = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
    }
    this.buf = buf;
    this.pos = pos | 0;
    if (this.pos < 0) {
      throw new Error('bad offset');
    }
  }
  
  get length() {
    return this.buf.length;
  }
  
  _resizeFixed(buf) {
    this._reset(new Uint8Array(buf));
  }
  
  static fromBuffer(buf, pos) {
    return new Tap(buf, pos);
  }
  
  static fromString(str) {
    let buf = new Uint8Array(str.length);
    return new Tap(buf);
  }
  
  subarray(start, end) {
    return this.buf.subarray(start, end);
  }
  
  slice(start, end) {
    return this.buf.slice(start, end);
  }
  
  append(buf) {
    let newBuf = new Uint8Array(this.buf.length + buf.length);
    newBuf.set(this.buf, 0);
    newBuf.set(buf, this.buf.length);
    this._reset(newBuf, this.pos);
  }
  
  toBuffer() {
    return this.buf.slice(0, this.pos);
  }
  
  toBufferAll() {
    let buf = this.buf.slice(0, this.pos);
    let newBuf = new Uint8Array(buf.length + this.buf.length - this.pos);
    newBuf.set(buf, 0);
    newBuf.set(this.buf, this.pos);
    this._reset(newBuf, 0);
  }
  
  isValid() {
    return this.pos <= this.buf.length;
  }
  
  canReadBoolean() {
    return !!this.buf[this.pos++];
  }
  
  canReadLong() {
    this.pos++;
  }
  
  writeBoolean(b) {
    this.buf[this.pos++] = !!b;
  }
  
  readBoolean() {
    return !!this.buf[this.pos++];
  }
  
  readLong() {
    let n = 0, k = 0, buf = this.buf, shift, b;
    do {
      b = buf[this.pos++], shift = b & 0x7f, n |= (b & 0x7f) << k, k += 7;
    } while (shift && k < 32);
    if (shift) {
      let m = n, p = 0;
      do {
        b = buf[this.pos++], m += (b & 0x7f) * Math.pow(2, k), k += 7;
      } while (b & 0x80);
      return (n | 0) * Math.pow(2, 32) + m;
    }
    return (n << 32 - k) >> (32 - k);
  }
  
  skipLong() {
    let buf = this.buf;
    while (buf[this.pos++] & 0x80) {}
  }
  
  writeLong(n) {
    let buf = this.buf, b, m;
    if (n >= -1073741824 && n < 1073741824) {
      m = n >= 0 ? n : (-n - 1) * 2 + 1;
      do {
        buf[this.pos] = m & 0x7f, m >>= 7;
      } while (m && (buf[this.pos++] |= 0x80));
    } else {
      m = n >= 0 ? n : (-n - 1) * 2 + 1;
      do {
        buf[this.pos] = m & 0x7f, m /= 128;
      } while (m >= 1 && (buf[this.pos++] |= 0x80));
    }
    this.pos++;
  }
  
  readFloat() {
    let pos = this.pos;
    this.pos += 4;
    if (this.pos > this.buf.length) return 0;
    return FLOAT_VIEW.getFloat32(0, (FLOAT_VIEW.setInt32(0, (this.buf[pos] | (this.buf[pos + 1] << 8) | (this.buf[pos + 2] << 16) | (this.buf[pos + 3] << 24))), true), true);
  }
  
  writeFloat(f) {
    let pos = this.pos;
    this.pos += 4;
    if (this.pos > this.buf.length) return;
    FLOAT_VIEW.setInt32(0, f, true);
    this.buf[pos] = FLOAT_VIEW.getInt32(0, true) & 0xff;
    this.buf[pos + 1] = (FLOAT_VIEW.getInt32(0, true) >> 8) & 0xff;
    this.buf[pos + 2] = (FLOAT_VIEW.getInt32(0, true) >> 16) & 0xff;
    this.buf[pos + 3] = (FLOAT_VIEW.getInt32(0, true) >> 24) & 0xff;
  }
  
  readDouble() {
    let pos = this.pos;
    this.pos += 8;
    if (this.pos > this.buf.length) return 0;
    return FLOAT_VIEW.getFloat64(0, (FLOAT_VIEW.setInt32(0, (this.buf[pos] | (this.buf[pos + 1] << 8) | (this.buf[pos + 2] << 16) | (this.buf[pos + 3] << 24))), true), (FLOAT_VIEW.setInt32(4, (this.buf[pos + 4] | (this.buf[pos + 5] << 8) | (this.buf[pos + 6] << 16) | (this.buf[pos + 7] << 24))), true), true);
  }
  
  writeDouble(d) {
    let pos = this.pos;
    this.pos += 8;
    if (this.pos > this.buf.length) return;
    FLOAT_VIEW.setFloat64(0, d, true);
    const high = FLOAT_VIEW.getInt32(0, true);
    const low = FLOAT_VIEW.getInt32(4, true);
    this.buf[pos] = high & 0xff;
    this.buf[pos + 1] = (high >> 8) & 0xff;
    this.buf[pos + 2] = (high >> 16) & 0xff;
    this.buf[pos + 3] = (high >> 24) & 0xff;
    this.buf[pos + 4] = low & 0xff;
    this.buf[pos + 5] = (low >> 8) & 0xff;
    this.buf[pos + 6] = (low >> 16) & 0xff;
    this.buf[pos + 7] = (low >> 24) & 0xff;
  }
  
  readFixed(len) {
    let pos = this.pos;
    this.pos += len;
    if (this.pos > this.buf.length) return;
    return this.buf.subarray(pos, pos + len);
  }
  
  writeFixed(buf, len) {
    len = len || buf.length;
    let pos = this.pos;
    this.pos += len;
    if (this.pos > this.buf.length) return;
    this.buf.set(buf.subarray(0, len), pos);
  }
  
  readBytes() {
    let len = this.readLong();
    if (len < 0) {
      this.pos -= 1;
      return;
    }
    return this.readFixed(len);
  }
  
  writeBytes(buf) {
    let len = buf.length;
    this.writeLong(len);
    let pos = this.pos;
    this.pos += len;
    if (this.isValid()) {
      this.buf.set(buf, pos);
    }
  }
  
  skipBytes() {
    let len = this.readLong();
    if (len < 0) {
      this.pos -= 1;
      return;
    }
    this.pos += len;
  }
  
  readString() {
    let len = this.readLong();
    if (len < 0) {
      this.pos -= 1;
      return '';
    }
    let pos = this.pos;
    let end = pos + len;
    if (len === 0) {
      return '';
    }
    let buf = this.buf;
    let str = '';
    while (pos + 4 <= end) {
      let b1 = buf[pos], b2 = buf[pos + 1], b3 = buf[pos + 2], b4 = buf[pos + 3];
      if ((b1 | b2 | b3 | b4) > 0x7f) {
        str += decodeSlice(buf, pos, end);
        return str;
      }
      str += String.fromCharCode(b1, b2, b3, b4);
      pos += 4;
    }
    while (pos < end) {
      let b = buf[pos];
      if (b > 0x7f) {
        str += decodeSlice(buf, pos, end);
        return str;
      }
      str += String.fromCharCode(b);
      pos++;
    }
    return str;
  }
  
  writeString(s) {
    let buf = this.buf;
    const len = s.length;
    if (len < 0) throw new Error('invalid string length');
    let strBytes, strLen;
    if (this.isValid()) {
      strBytes = encodeSlice(s);
      strLen = strBytes.length;
    } else {
      strLen = utf8Length(s);
    }
    this.writeLong(strLen);
    let pos = this.pos;
    this.pos += strLen;
    if (this.isValid() && typeof strBytes !== 'undefined') {
      buf.set(strBytes, pos);
    } else {
      let p = pos;
      let end = pos + strLen;
      for (let i = 0; i < len; i++) {
        let c = s.charCodeAt(i);
        if (c < 0x80) {
          if (p < end) buf[p] = c;
          p++;
        } else if (c < 0x800) {
          if (p + 1 < end) {
            buf[p] = (c >> 6) | 0xc0;
            buf[p + 1] = (c & 0x3f) | 0x80;
          }
          p += 2;
        } else {
          if ((c & 0xfc00) === 0xd800 && i + 1 < len && (s.charCodeAt(i + 1) & 0xfc00) === 0xdc00) {
            c = 0x10000 + ((c & 0x3ff) << 10) + (s.charCodeAt(++i) & 0x3ff);
            if (p + 3 < end) {
              buf[p] = (c >> 18) | 0xf0;
              buf[p + 1] = ((c >> 12) & 0x3f) | 0x80;
              buf[p + 2] = ((c >> 6) & 0x3f) | 0x80;
              buf[p + 3] = (c & 0x3f) | 0x80;
            }
            p += 4;
          } else {
            if (p + 2 < end) {
              buf[p] = (c >> 12) | 0xe0;
              buf[p + 1] = ((c >> 6) & 0x3f) | 0x80;
              buf[p + 2] = (c & 0x3f) | 0x80;
            }
            p += 3;
          }
        }
      }
      if (p !== end) {
        this._resizeFixed(p - pos);
      }
      this.pos = p;
    }
  }
  
  skipString() {
    let len = this.readLong();
    if (len < 0) {
      this.pos -= 1;
      return;
    }
    this.pos += len;
  }
  
  readIndex() {
    let n = this.readLong();
    if (n < 0) {
      this.pos -= 1;
      return;
    }
    return n;
  }
  
  writeIndex(i) {
    this.writeLong(i);
  }
  
  matchAt(pos, tap) {
    return this.buf[this.pos++] - tap.buf[tap.pos++];
  }
  
  compareAt(tap) {
    let n1 = this.readLong();
    let n2 = tap.readLong();
    return n1 === n2 ? 0 : (n1 < n2 ? -1 : 1);
  }
  
  compareBytes(tap) {
    let n1 = this.readLong();
    let pos1 = this.pos;
    this.pos += n1;
    let n2 = tap.readLong();
    let pos2 = tap.pos;
    tap.pos += n2;
    let b1 = this.buf.subarray(pos1, this.pos);
    let b2 = tap.buf.subarray(pos2, tap.pos);
    return bufCompare(b1, b2);
  }
  
  readUuid() {
    let b = new Uint8Array(16), p = 0, q = 0, r = 0, s = 0;
    let buf = this.buf, b0 = buf[this.pos++], n = b0 & 0x7f;
    b[0] = b0, p |= (b0 & 0x7f) >> 0;
    while (b0 & 0x80) {
      b0 = buf[this.pos++], p |= (b0 & 0x7f) << s, s += 7;
      if (s >= 8) {
        s -= 8, b[q++] = p, p >>= 8;
      }
    }
    b[q] = p, n && invert(b, 0), b;
  }
  
  writeUuid(uuid) {
    let n = ((uuid[0] & 0x80) > 0), buf = this.buf, p = 0, s = 0, q = 0, b;
    if (n) invert(uuid, 0), b = 0x80;
    else b = 0x00;
    let arr = [((uuid[0] | (uuid[1] << 8)) & 0xffff), (uuid[2] | 0x00), ((uuid[3] | (uuid[4] << 8)) & 0xffff), (uuid[5] | 0x00), (uuid[6] | (uuid[7] << 8))];
    while (q && !arr[--q]) {}
    while (s < q) {
      b |= arr[s++] << p, p += 7;
      while (p >= 8) {
        buf[this.pos++] = (b & 0xff), b >>= 8, p -= 8;
      }
    }
    b |= arr[q] << p;
    do {
      buf[this.pos] = b & 0xff, b >>= 8;
    } while (b && (buf[this.pos++] |= 0x80));
    this.pos++, n && invert(uuid, 0);
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
      if (typeof BigInt === 'function' && value instanceof BigInt) {
        return value.toString() + 'n]';
      }
      return value;
    });
  } catch (err) {
    return '[complex]';
  }
}

const utils = {};
utils.abstractFunction = abstractFunction;
utils.bufCompare = bufCompare;
utils.bufEqual = bufEqual;
utils.bufferToBinaryString = bufferToBinaryString;
utils.binaryStringToBuffer = binaryStringToBuffer;
utils.capitalize = capitalize;
utils.copyOwnProperties = copyOwnProperties;
utils.createHash = platform.createHash;
utils.compare = compare;
utils.getOption = getOption;
utils.impliedNamespace = impliedNamespace;
utils.isBufferLike = isBufferLike;
utils.isValidName = isValidName;
utils.jsonEnd = jsonEnd;
utils.objectValues = objectValues;
utils.qualify = qualify;
utils.toMap = toMap;
utils.singleIndexOf = singleIndexOf;
utils.hasDuplicates = hasDuplicates;
utils.unqualify = unqualify;
utils.Lcg = Lcg;
utils.OrderedQueue = OrderedQueue;
utils.Tap = Tap;
utils.printJSON = printJSON;
module.exports = utils;
