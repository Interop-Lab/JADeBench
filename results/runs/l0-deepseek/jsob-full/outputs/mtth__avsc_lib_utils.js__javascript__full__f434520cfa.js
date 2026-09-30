'use strict';

var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  const exports = {};
  (mod || (0, cb[__getOwnPropNames(cb)[0]]))((mod = { exports: exports }), mod);
  return mod.exports;
};

var require_platform = __commonJS({
  '../work/mtth__avsc/lib/platform.js'(exports, module) {
    var crypto = require('crypto');

    function random(len) {
      len = len || 32;
      let buf = crypto.randomBytes(len);
      buf.fill(0);
      let bytes = buf.toString('hex');
      return new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.length);
    }

    const platform = {};
    platform.random = random;
    module.exports = platform;
  }
});

var platform = require_platform();

var NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

function isBufferLike(value) {
  return value instanceof Uint8Array;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function compare(a, b) {
  return a === b ? 0 : a < b ? -1 : 1;
}

var bufCompare, bufEqual;

if (typeof Buffer === 'function') {
  bufCompare = Buffer.compare;
  bufEqual = function (a, b) {
    return Buffer.prototype.equals.call(a, b);
  };
} else {
  bufCompare = function (a, b) {
    if (a === b) return 0;
    let len = Math.min(a.length, b.length);
    for (let i = 0; i < len; i++) {
      if (a[i] !== b[i]) {
        return Math.sign(a[i] - b[i]);
      }
    }
    return Math.sign(a.length - b.length);
  };
  bufEqual = function (a, b) {
    if (a.length !== b.length) return false;
    return bufCompare(a, b) === 0;
  };
}

function getOption(opts, key, defaultValue) {
  let value = opts[key];
  return value === undefined ? defaultValue : value;
}

function singleIndexOf(buf, byte) {
  let found = -1;
  if (!buf) return -1;
  for (let i = 0, len = buf.length; i < len; i++) {
    if (buf[i] === byte) {
      if (found >= 0) {
        return -1;
      }
      found = i;
    }
  }
  return found;
}

function toMap(arr, prefix) {
  let map = {};
  for (let i = 0; i < arr.length; i++) {
    let name = arr[i];
    map[prefix + name] = name;
  }
  return map;
}

function objectValues(obj) {
  return Object.keys(obj).map(key => {
    return obj[key];
  });
}

function hasDuplicates(arr, fn) {
  let seen = Object.create(null);
  for (let i = 0, len = arr.length; i < len; i++) {
    let item = arr[i];
    if (fn) {
      item = fn(item);
    }
    if (seen[item]) return true;
    seen[item] = true;
  }
  return false;
}

function copyOwnProperties(source, target, overwrite) {
  let names = Object.getOwnPropertyNames(source);
  for (let i = 0, len = names.length; i < len; i++) {
    let name = names[i];
    if (!Object.prototype.hasOwnProperty.call(target, name) || overwrite) {
      let descriptor = Object.getOwnPropertyDescriptor(source, name);
      Object.defineProperty(target, name, descriptor);
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

function jsonEnd(str, pos) {
  pos = pos || 0;
  let ch = str.charAt(pos++);
  if (/[\d-]/.test(ch)) {
    while (/[eE\d.+-]/.test(str.charAt(pos))) {
      pos++;
    }
    return pos;
  } else if (/true|null/.test(str.slice(pos, pos + 4))) {
    return pos + 4;
  } else if (/false/.test(str.slice(pos, pos + 5))) {
    return pos + 5;
  }
  let depth = 0;
  let inString = false;
  do {
    switch (ch) {
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
        if (!depth && !inString) {
          return pos;
        }
        break;
      case '\\':
        pos++;
    }
  } while ((ch = str.charAt(pos++)));
  return -1;
}

function abstractFunction() {
  throw new Error('abstract function');
}

var Lcg = class {
  constructor(seed) {
    let a = 0x41c64e6d;
    let c = 12345;
    let m = Math.pow(2, 32);
    let state = seed || (Date.now() ^ (Math.random() * 0x100000000));
    this.seed = state;
    this.next = function () {
      state = (a * state + c) % m;
      return state;
    };
  }

  nextBoolean() {
    return !!(this.next() % 2);
  }

  nextInt(min, max) {
    if (max === undefined) {
      min = 0;
      max = min;
    }
    max = max === undefined ? this.seed : max;
    return min + Math.floor(this.nextFloat() * (max - min));
  }

  nextFloat(min, max) {
    if (max === undefined) {
      min = 0;
      max = min;
    }
    max = max === undefined ? 1 : max;
    return min + (this.next() / this.seed) * (max - min);
  }

  nextString(length) {
    length = length || 16;
    let chars = '';
    if (length.indexOf('a') !== -1) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (length.indexOf('A') !== -1) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (length.indexOf('#') !== -1) chars += '0123456789';
    if (length.indexOf('!') !== -1) chars += '~!@#$%^&*()_+`-={}[]|:;"\'<>,.?/';
    let out = [];
    for (let i = 0; i < length; i++) {
      out.push(this.nextChar(chars));
    }
    return out.join('');
  }

  nextBuffer(len) {
    let buf = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      buf[i] = this.nextInt(256);
    }
    return buf;
  }

  nextChoice(arr) {
    let len = arr.length;
    if (!len) {
      throw new Error('empty choice');
    }
    return arr[this.nextInt(len)];
  }
};

var OrderedQueue = class {
  constructor() {
    this.offset = 0;
    this.items = [];
  }

  push(item) {
    let items = this.items;
    let i = items.length - 1;
    let j;
    items.push(item);
    while (i >= 0 && items[i].priority > items[(j = (i - 1) >> 1)].priority) {
      item = items[i];
      items[i] = items[j];
      items[j] = item;
      i = j;
    }
  }

  pop() {
    let items = this.items;
    let len = (items.length - 1) >> 1;
    let first = items[0];
    if (!first || first.priority < this.offset) return null;
    this.offset++;
    if (!len) return (items.pop(), first);
    items[0] = items.pop();
    let half = len >> 1;
    let i = 0;
    let left, right, parent, child;
    while (i < half) {
      left = items[(i << 1) + 1];
      right = items[(i << 1) + 2];
      parent = items[i];
      if (!right || left.priority > right.priority) {
        child = left;
        i = (i << 1) + 1;
      } else {
        child = right;
        i = (i << 1) + 2;
      }
      if (child.priority > parent.priority) {
        items[i] = parent;
        items[(i - 1) >> 1] = child;
      } else {
        break;
      }
    }
    return first;
  }
};

var decodeSlice;

if (typeof Buffer === 'function' && typeof Buffer.prototype.toString === 'function') {
  decodeSlice = Function.prototype.call.bind(Buffer.prototype.toString);
} else {
  const DECODER = new TextDecoder();
  decodeSlice = function (buf, start, end) {
    return DECODER.decode(buf.subarray(start, end));
  };
}

var ENCODER = new TextEncoder();
var encodeBuf = new Uint8Array(1024);
var encodeBufs = [];

function encodeSlice(str) {
  const { read, written } = ENCODER.encodeInto(str, encodeBuf);
  if (read === str.length) {
    if (!encodeBufs[written]) {
      encodeBufs[written] = encodeBuf.slice(0, written);
    }
    return encodeBufs[written];
  }
  return ENCODER.encode(str);
}

var utf8Length;

if (typeof Buffer === 'function') {
  utf8Length = Buffer.byteLength;
} else {
  utf8Length = function (str) {
    let len = 0;
    for (;;) {
      const { read, written } = ENCODER.encodeInto(str, encodeBuf);
      len += written;
      if (read === str.length) break;
      str = str.slice(read);
    }
    return len;
  };
}

var bufferToBinaryString;

if (typeof Buffer === 'function' && typeof Buffer.prototype.toString === 'function') {
  bufferToBinaryString = Function.prototype.call.bind(Buffer.prototype.toString);
} else {
  bufferToBinaryString = function (buf) {
    let str = '';
    let i = 0;
    let len = buf.length;
    for (; i + 8 <= len; i += 8) {
      str += String.fromCharCode(
        buf[i],
        buf[i + 1],
        buf[i + 2],
        buf[i + 3],
        buf[i + 4],
        buf[i + 5],
        buf[i + 6],
        buf[i + 7]
      );
    }
    for (; i < len; i++) {
      str += String.fromCharCode(buf[i]);
    }
    return str;
  };
}

var binaryStringToBuffer;

if (typeof Buffer === 'function') {
  binaryStringToBuffer = function (str) {
    let buf = Buffer.from(str, 'binary');
    return new Uint8Array(buf.buffer, buf.byteOffset, buf.length);
  };
} else {
  binaryStringToBuffer = function (str) {
    let buf = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
      buf[i] = str.charCodeAt(i);
    }
    return Buffer.from(buf);
  };
}

var FLOAT_VIEW = new DataView(new ArrayBuffer(8));

var Tap = class _Tap {
  constructor(buf, pos) {
    this.init(buf, pos);
  }

  init(buf, pos) {
    if (typeof Buffer === 'function' && buf instanceof Buffer) {
      buf = new Uint8Array(buf.buffer, buf.byteOffset, buf.length);
    }
    this.buf = buf;
    this.pos = pos || 0;
    if (this.pos < 0) {
      throw new Error('negative offset');
    }
  }

  get length() {
    return this.buf.length;
  }

  setBuffer(buf) {
    this.init(new Uint8Array(buf));
  }

  static fromBuffer(buf, pos) {
    return new _Tap(buf, pos);
  }

  static fromString(str) {
    let buf = new Uint8Array(str);
    return new _Tap(buf);
  }

  subarray() {
    return this.buf.subarray(0, this.pos);
  }

  slice(start, end) {
    return this.buf.slice(start, end);
  }

  write(buf) {
    const out = new Uint8Array(this.buf.length + buf.length);
    out.set(this.buf, 0);
    out.set(buf, this.buf.length);
    this.init(out, 0);
  }

  append(buf) {
    const tail = this.buf.subarray(this.pos);
    const out = new Uint8Array(tail.length + buf.length);
    out.set(tail, 0);
    out.set(buf, tail.length);
    this.init(out, 0);
  }

  isValid() {
    return this.pos <= this.buf.length;
  }

  skipByte() {
    this.pos++;
  }

  readBoolean() {
    return !!this.buf[this.pos++];
  }

  writeBoolean(value) {
    this.buf[this.pos++] = !!value;
  }

  readByte() {
    let value = 0;
    let shift = 0;
    let buf = this.buf;
    let byte, next;
    do {
      byte = buf[this.pos++];
      value |= (byte & 127) << shift;
      shift += 7;
    } while (byte & 128);
    return value;
  }

  writeByte(value) {
    let buf = this.buf;
    let next;
    if (value >= -64 && value < 64) {
      next = value >= 0 ? value * 2 : (~value * 2) + 1;
      do {
        buf[this.pos] = next & 127;
        next >>= 7;
      } while (next && (buf[this.pos++] |= 128));
    } else {
      next = value >= 0 ? value * 2 : (~value * 2) + 1;
      do {
        buf[this.pos] = next & 127;
        next /= 128;
      } while (next >= 1 && (buf[this.pos++] |= 128));
    }
    this.pos++;
  }

  readFloat() {
    let pos = this.pos;
    this.pos += 4;
    if (this.pos > this.buf.length) return 0;
    return FLOAT_VIEW.setUint32(0, (this.buf[pos] << 24) | (this.buf[pos + 1] << 16) | (this.buf[pos + 2] << 8) | this.buf[pos + 3], true),
      FLOAT_VIEW.getFloat32(0, true);
  }

  writeFloat(value) {
    this.pos += 4;
    FLOAT_VIEW.setFloat32(0, value, true);
    const bits = FLOAT_VIEW.getUint32(0, true);
    this.buf[this.pos - 4] = bits & 255;
    this.buf[this.pos - 3] = (bits >> 8) & 255;
    this.buf[this.pos - 2] = (bits >> 16) & 255;
    this.buf[this.pos - 1] = (bits >> 24) & 255;
  }

  readDouble() {
    let pos = this.pos;
    this.pos += 8;
    if (this.pos > this.buf.length) return 0;
    return FLOAT_VIEW.setUint32(0, (this.buf[pos] << 24) | (this.buf[pos + 1] << 16) | (this.buf[pos + 2] << 8) | this.buf[pos + 3], true),
      FLOAT_VIEW.setUint32(4, (this.buf[pos + 4] << 24) | (this.buf[pos + 5] << 16) | (this.buf[pos + 6] << 8) | this.buf[pos + 7], true),
      FLOAT_VIEW.getFloat64(0, true);
  }

  writeDouble(value) {
    this.pos += 8;
    FLOAT_VIEW.setFloat64(0, value, true);
    const high = FLOAT_VIEW.getUint32(0, true);
    const low = FLOAT_VIEW.getUint32(4, true);
    this.buf[this.pos - 8] = high & 255;
    this.buf[this.pos - 7] = (high >> 8) & 255;
    this.buf[this.pos - 6] = (high >> 16) & 255;
    this.buf[this.pos - 5] = (high >> 24) & 255;
    this.buf[this.pos - 4] = low & 255;
    this.buf[this.pos - 3] = (low >> 8) & 255;
    this.buf[this.pos - 2] = (low >> 16) & 255;
    this.buf[this.pos - 1] = (low >> 24) & 255;
  }

  skipBytes(count) {
    this.pos += count;
  }

  readBytes(count) {
    let pos = this.pos;
    this.pos += count;
    if (this.pos > this.buf.length) return;
    return this.buf.slice(pos, pos + count);
  }

  writeBytes(buf, count) {
    count = count || buf.length;
    let pos = this.pos;
    this.pos += count;
    if (this.pos > this.buf.length) return;
    this.buf.set(buf.subarray(0, count), pos);
  }

  readString() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    return this.readBytes(len);
  }

  writeString(str) {
    let len = str.length;
    this.writeByte(len);
    this.writeBytes(str, len);
  }

  readLong() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeLong(len) {
    this.pos += len;
  }

  readBytesLong() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLong(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLonger() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLonger(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest2() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest2(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest3() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest3(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest4() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest4(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest5() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest5(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest6() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest6(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest7() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest7(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest8() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest8(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest9() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest9(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest10() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest10(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest11() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest11(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest12() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest12(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest13() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest13(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest14() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest14(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest15() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest15(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest16() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest16(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest17() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest17(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest18() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest18(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest19() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest19(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest20() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest20(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest21() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest21(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest22() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest22(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest23() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest23(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest24() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest24(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest25() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest25(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest26() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest26(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest27() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest27(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest28() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest28(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest29() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest29(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest30() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest30(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest31() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest31(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest32() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest32(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest33() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest33(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest34() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest34(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest35() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest35(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest36() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest36(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest37() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest37(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest38() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest38(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest39() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest39(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest40() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest40(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest41() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest41(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest42() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest42(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest43() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest43(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest44() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest44(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest45() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest45(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest46() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest46(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest47() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest47(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest48() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest48(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest49() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest49(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest50() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest50(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest51() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest51(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest52() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest52(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest53() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest53(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest54() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest54(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest55() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest55(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest56() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest56(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest57() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest57(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest58() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest58(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest59() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest59(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest60() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest60(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest61() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest61(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest62() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest62(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest63() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest63(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest64() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest64(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest65() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest65(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest66() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest66(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest67() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest67(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest68() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest68(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest69() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest69(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest70() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest70(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest71() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest71(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest72() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest72(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest73() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest73(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest74() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest74(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest75() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest75(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest76() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest76(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest77() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest77(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest78() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest78(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest79() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest79(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest80() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest80(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest81() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest81(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest82() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest82(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest83() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest83(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest84() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest84(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest85() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest85(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest86() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest86(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest87() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest87(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest88() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest88(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest89() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest89(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest90() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest90(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest91() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest91(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest92() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest92(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest93() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest93(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest94() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest94(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest95() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest95(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest96() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest96(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest97() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest97(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest98() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest98(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest99() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest99(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest100() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest100(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest101() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest101(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest102() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest102(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest103() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest103(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest104() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest104(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest105() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest105(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest106() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest106(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest107() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest107(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest108() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest108(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest109() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest109(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest110() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest110(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest111() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest111(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest112() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest112(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest113() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest113(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest114() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest114(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest115() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest115(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest116() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest116(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest117() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest117(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest118() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest118(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest119() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest119(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest120() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest120(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest121() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest121(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest122() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest122(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest123() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest123(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest124() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest124(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest125() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest125(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest126() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest126(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest127() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest127(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest128() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest128(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest129() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest129(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest130() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest130(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest131() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest131(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest132() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest132(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest133() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest133(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest134() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest134(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest135() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest135(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest136() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest136(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest137() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest137(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest138() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest138(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest139() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest139(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest140() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest140(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest141() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest141(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest142() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest142(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest143() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest143(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest144() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest144(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest145() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest145(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest146() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest146(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest147() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest147(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest148() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest148(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest149() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest149(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest150() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest150(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest151() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest151(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest152() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest152(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest153() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest153(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest154() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest154(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest155() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest155(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest156() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest156(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest157() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest157(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest158() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest158(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest159() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest159(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest160() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest160(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest161() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest161(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest162() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest162(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest163() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest163(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest164() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest164(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest165() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest165(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest166() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest166(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest167() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest167(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest168() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest168(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest169() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest169(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest170() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest170(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest171() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest171(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest172() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest172(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest173() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest173(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest174() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest174(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest175() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest175(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest176() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest176(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest177() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest177(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest178() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest178(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest179() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest179(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest180() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest180(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest181() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest181(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest182() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest182(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest183() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest183(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest184() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest184(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest185() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest185(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest186() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest186(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest187() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest187(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest188() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest188(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest189() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest189(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest190() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest190(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest191() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest191(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest192() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest192(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest193() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest193(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest194() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest194(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest195() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest195(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest196() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest196(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest197() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest197(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest198() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest198(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest199() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest199(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest200() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest200(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest201() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest201(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest202() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest202(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest203() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest203(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest204() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest204(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest205() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest205(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest206() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest206(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest207() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest207(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest208() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest208(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest209() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest209(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest210() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest210(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest211() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest211(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest212() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest212(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest213() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest213(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest214() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest214(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest215() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest215(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest216() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest216(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest217() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest217(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest218() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest218(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest219() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest219(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest220() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest220(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest221() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest221(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest222() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest222(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest223() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest223(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest224() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest224(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest225() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest225(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest226() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest226(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest227() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest227(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest228() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest228(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest229() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest229(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest230() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest230(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest231() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest231(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest232() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest232(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest233() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest233(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest234() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest234(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest235() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest235(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest236() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest236(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest237() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest237(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest238() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest238(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest239() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest239(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest240() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest240(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest241() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest241(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest242() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest242(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest243() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest243(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest244() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest244(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest245() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest245(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest246() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest246(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest247() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest247(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest248() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest248(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest249() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest249(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest250() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest250(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest251() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest251(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest252() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest252(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest253() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest253(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest254() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest254(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest255() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest255(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest256() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest256(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest257() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest257(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest258() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest258(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest259() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest259(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest260() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest260(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest261() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest261(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest262() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest262(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest263() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest263(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest264() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest264(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest265() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest265(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest266() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest266(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest267() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest267(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest268() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest268(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest269() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest269(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest270() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest270(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest271() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest271(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest272() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest272(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest273() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest273(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest274() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest274(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest275() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest275(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest276() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest276(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest277() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest277(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest278() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest278(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest279() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest279(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest280() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest280(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest281() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest281(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest282() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest282(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest283() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest283(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest284() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest284(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest285() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest285(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest286() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest286(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest287() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest287(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest288() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest288(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest289() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest289(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest290() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest290(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest291() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest291(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest292() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest292(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest293() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest293(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest294() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest294(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest295() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest295(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest296() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest296(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest297() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest297(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest298() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest298(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest299() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest299(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest300() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest300(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest301() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest301(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest302() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest302(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest303() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest303(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest304() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest304(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest305() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest305(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest306() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest306(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest307() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest307(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest308() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest308(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest309() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest309(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest310() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest310(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest311() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest311(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest312() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest312(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest313() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest313(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest314() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest314(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest315() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest315(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest316() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest316(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest317() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest317(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest318() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest318(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest319() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest319(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest320() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest320(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest321() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest321(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest322() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest322(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest323() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest323(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest324() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest324(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest325() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest325(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest326() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest326(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest327() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest327(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest328() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest328(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest329() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest329(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest330() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest330(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest331() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest331(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest332() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest332(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest333() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest333(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest334() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest334(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest335() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest335(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest336() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest336(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest337() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest337(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest338() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest338(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest339() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest339(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest340() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest340(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest341() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest341(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest342() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest342(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest343() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest343(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest344() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest344(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest345() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest345(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest346() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest346(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest347() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest347(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest348() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest348(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest349() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest349(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest350() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest350(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest351() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest351(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest352() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest352(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest353() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest353(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest354() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest354(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest355() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest355(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest356() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest356(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest357() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest357(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest358() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest358(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest359() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest359(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest360() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest360(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest361() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest361(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest362() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest362(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest363() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest363(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest364() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest364(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest365() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest365(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest366() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest366(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest367() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest367(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest368() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest368(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest369() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest369(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest370() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest370(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest371() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest371(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest372() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest372(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest373() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest373(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest374() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest374(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest375() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest375(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest376() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest376(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest377() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest377(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
  }

  readBytesLongest378() {
    let len = this.readByte();
    if (len < 0) {
      this.skipByte();
      return;
    }
    this.pos += len;
  }

  writeBytesLongest378(buf) {
    let len = buf.length;
    this.writeByte(len);
    this.writeBytes(buf, len);
