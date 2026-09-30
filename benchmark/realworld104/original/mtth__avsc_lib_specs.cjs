"use strict";
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// ../work/mtth__avsc/lib/files.js
var require_files = __commonJS({
  "../work/mtth__avsc/lib/files.js"(exports2, module2) {
    "use strict";
    var fs = require("fs"), path = require("path");
    function createImportHook() {
      let imports = {};
      return function({ path: fpath, importerPath }, cb) {
        fpath = path.resolve(path.dirname(importerPath), fpath);
        if (imports[fpath]) {
          process.nextTick(cb);
          return;
        }
        imports[fpath] = true;
        fs.readFile(fpath, { encoding: "utf8" }, (err, data) => {
          if (err) return cb(err);
          return cb(null, { contents: data, path: fpath });
        });
      };
    }
    function createSyncImportHook() {
      let imports = {};
      return function({ path: fpath, importerPath }, cb) {
        fpath = path.resolve(path.dirname(importerPath), fpath);
        if (imports[fpath]) {
          cb();
        } else {
          imports[fpath] = true;
          cb(null, {
            contents: fs.readFileSync(fpath, { encoding: "utf8" }),
            path: fpath
          });
        }
      };
    }
    function tryReadFileSync(str) {
      if (typeof str == "string" && str.indexOf(path.sep) !== -1) {
        try {
          return fs.readFileSync(str, { encoding: "utf8" });
        } catch (err) {
          if (err.code !== "ENOENT") throw err;
        }
      }
      return null;
    }
    module2.exports = {
      createImportHook,
      createSyncImportHook,
      tryReadFileSync
    };
  }
});

// ../work/mtth__avsc/lib/platform.js
var require_platform = __commonJS({
  "../work/mtth__avsc/lib/platform.js"(exports2, module2) {
    var crypto = require("crypto");
    function getHash(str, algorithm) {
      algorithm = algorithm || "md5";
      let hash = crypto.createHash(algorithm);
      hash.end(str);
      let buf = hash.read();
      return new Uint8Array(buf.buffer, buf.byteOffset, buf.length);
    }
    module2.exports = {
      getHash
    };
  }
});

// ../work/mtth__avsc/lib/utils.js
var require_utils = __commonJS({
  "../work/mtth__avsc/lib/utils.js"(exports2, module2) {
    "use strict";
    var platform = require_platform();
    var NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;
    function isBufferLike(data) {
      return data instanceof Uint8Array;
    }
    function capitalize(s) {
      return s.charAt(0).toUpperCase() + s.slice(1);
    }
    function compare(n1, n2) {
      return n1 === n2 ? 0 : n1 < n2 ? -1 : 1;
    }
    var bufCompare, bufEqual;
    if (typeof Buffer == "function") {
      bufCompare = Buffer.compare;
      bufEqual = function(buf1, buf2) {
        return Buffer.prototype.equals.call(buf1, buf2);
      };
    } else {
      bufCompare = function(buf1, buf2) {
        if (buf1 === buf2) {
          return 0;
        }
        let len = Math.min(buf1.length, buf2.length);
        for (let i = 0; i < len; i++) {
          if (buf1[i] !== buf2[i]) {
            return Math.sign(buf1[i] - buf2[i]);
          }
        }
        return Math.sign(buf1.length - buf2.length);
      };
      bufEqual = function(buf1, buf2) {
        if (buf1.length !== buf2.length) {
          return false;
        }
        return bufCompare(buf1, buf2) === 0;
      };
    }
    function getOption(opts, key, def) {
      let value = opts[key];
      return value === void 0 ? def : value;
    }
    function singleIndexOf(arr, v) {
      let pos = -1;
      if (!arr) {
        return -1;
      }
      for (let i = 0, l = arr.length; i < l; i++) {
        if (arr[i] === v) {
          if (pos >= 0) {
            return -2;
          }
          pos = i;
        }
      }
      return pos;
    }
    function toMap(arr, fn) {
      let obj = {};
      for (let i = 0; i < arr.length; i++) {
        let elem = arr[i];
        obj[fn(elem)] = elem;
      }
      return obj;
    }
    function objectValues(obj) {
      return Object.keys(obj).map((key) => {
        return obj[key];
      });
    }
    function hasDuplicates(arr, fn) {
      let obj = /* @__PURE__ */ Object.create(null);
      for (let i = 0, l = arr.length; i < l; i++) {
        let elem = arr[i];
        if (fn) {
          elem = fn(elem);
        }
        if (obj[elem]) {
          return true;
        }
        obj[elem] = true;
      }
      return false;
    }
    function copyOwnProperties(src, dst, overwrite) {
      let names = Object.getOwnPropertyNames(src);
      for (let i = 0, l = names.length; i < l; i++) {
        let name = names[i];
        if (!Object.prototype.hasOwnProperty.call(dst, name) || overwrite) {
          let descriptor = Object.getOwnPropertyDescriptor(src, name);
          Object.defineProperty(dst, name, descriptor);
        }
      }
      return dst;
    }
    function isValidName(str) {
      return NAME_PATTERN.test(str);
    }
    function qualify(name, namespace) {
      if (~name.indexOf(".")) {
        name = name.replace(/^\./, "");
      } else if (namespace) {
        name = namespace + "." + name;
      }
      name.split(".").forEach((part) => {
        if (!isValidName(part)) {
          throw new Error(`invalid name: ${printJSON(name)}`);
        }
      });
      return name;
    }
    function unqualify(name) {
      let parts = name.split(".");
      return parts[parts.length - 1];
    }
    function impliedNamespace(name) {
      let match = /^(.*)\.[^.]+$/.exec(name);
      return match ? match[1] : void 0;
    }
    function jsonEnd(str, pos) {
      pos = pos | 0;
      let c = str.charAt(pos++);
      if (/[\d-]/.test(c)) {
        while (/[eE\d.+-]/.test(str.charAt(pos))) {
          pos++;
        }
        return pos;
      } else if (/true|null/.test(str.slice(pos - 1, pos + 3))) {
        return pos + 3;
      } else if (/false/.test(str.slice(pos - 1, pos + 4))) {
        return pos + 4;
      }
      let depth = 0;
      let literal = false;
      do {
        switch (c) {
          case "{":
          case "[":
            if (!literal) {
              depth++;
            }
            break;
          case "}":
          case "]":
            if (!literal && !--depth) {
              return pos;
            }
            break;
          case '"':
            literal = !literal;
            if (!depth && !literal) {
              return pos;
            }
            break;
          case "\\":
            pos++;
        }
      } while (c = str.charAt(pos++));
      return -1;
    }
    function abstractFunction() {
      throw new Error("abstract");
    }
    var Lcg = class {
      constructor(seed) {
        let a = 1103515245;
        let c = 12345;
        let m = Math.pow(2, 31);
        let state = Math.floor(seed || Math.random() * (m - 1));
        this._max = m;
        this._nextInt = function() {
          state = (a * state + c) % m;
          return state;
        };
      }
      nextBoolean() {
        return !!(this._nextInt() % 2);
      }
      nextInt(start, end) {
        if (end === void 0) {
          end = start;
          start = 0;
        }
        end = end === void 0 ? this._max : end;
        return start + Math.floor(this.nextFloat() * (end - start));
      }
      nextFloat(start, end) {
        if (end === void 0) {
          end = start;
          start = 0;
        }
        end = end === void 0 ? 1 : end;
        return start + (end - start) * this._nextInt() / this._max;
      }
      nextString(len, flags) {
        len |= 0;
        flags = flags || "aA";
        let mask = "";
        if (flags.indexOf("a") > -1) {
          mask += "abcdefghijklmnopqrstuvwxyz";
        }
        if (flags.indexOf("A") > -1) {
          mask += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        }
        if (flags.indexOf("#") > -1) {
          mask += "0123456789";
        }
        if (flags.indexOf("!") > -1) {
          mask += "~`!@#$%^&*()_+-={}[]:\";'<>?,./|\\";
        }
        let result = [];
        for (let i = 0; i < len; i++) {
          result.push(this.choice(mask));
        }
        return result.join("");
      }
      nextBuffer(len) {
        let arr = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          arr[i] = this.nextInt(256);
        }
        return arr;
      }
      choice(arr) {
        let len = arr.length;
        if (!len) {
          throw new Error("choosing from empty array");
        }
        return arr[this.nextInt(len)];
      }
    };
    var OrderedQueue = class {
      constructor() {
        this._index = 0;
        this._items = [];
      }
      push(item) {
        let items = this._items;
        let i = items.length | 0;
        let j;
        items.push(item);
        while (i > 0 && items[i].index < items[j = i - 1 >> 1].index) {
          item = items[i];
          items[i] = items[j];
          items[j] = item;
          i = j;
        }
      }
      pop() {
        let items = this._items;
        let len = items.length - 1 | 0;
        let first = items[0];
        if (!first || first.index > this._index) {
          return null;
        }
        this._index++;
        if (!len) {
          items.pop();
          return first;
        }
        items[0] = items.pop();
        let mid = len >> 1;
        let i = 0;
        let i1, i2, j, item, c, c1, c2;
        while (i < mid) {
          item = items[i];
          i1 = (i << 1) + 1;
          i2 = i + 1 << 1;
          c1 = items[i1];
          c2 = items[i2];
          if (!c2 || c1.index <= c2.index) {
            c = c1;
            j = i1;
          } else {
            c = c2;
            j = i2;
          }
          if (c.index >= item.index) {
            break;
          }
          items[j] = item;
          items[i] = c;
          i = j;
        }
        return first;
      }
    };
    var decodeSlice;
    if (typeof Buffer === "function" && typeof Buffer.prototype.utf8Slice === "function") {
      decodeSlice = Function.prototype.call.bind(Buffer.prototype.utf8Slice);
    } else {
      const DECODER = new TextDecoder();
      decodeSlice = function(arr, start, end) {
        return DECODER.decode(arr.subarray(start, end));
      };
    }
    var ENCODER = new TextEncoder();
    var encodeBuf = new Uint8Array(4096);
    var encodeBufs = [];
    function encodeSlice(str) {
      const { read: read2, written } = ENCODER.encodeInto(str, encodeBuf);
      if (read2 === str.length) {
        if (!encodeBufs[written]) {
          encodeBufs[written] = encodeBuf.subarray(0, written);
        }
        return encodeBufs[written];
      }
      return ENCODER.encode(str);
    }
    var utf8Length;
    if (typeof Buffer === "function") {
      utf8Length = Buffer.byteLength;
    } else {
      utf8Length = function(str) {
        let len = 0;
        for (; ; ) {
          const { read: read2, written } = ENCODER.encodeInto(str, encodeBuf);
          len += written;
          if (read2 === str.length) break;
          str = str.slice(read2);
        }
        return len;
      };
    }
    var bufferToBinaryString;
    if (typeof Buffer === "function" && typeof Buffer.prototype.latin1Slice === "function") {
      bufferToBinaryString = Function.prototype.call.bind(
        Buffer.prototype.latin1Slice
      );
    } else {
      bufferToBinaryString = function(buf) {
        let str = "";
        let i = 0, len = buf.length;
        for (; i + 7 < len; i += 8) {
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
    if (typeof Buffer === "function") {
      binaryStringToBuffer = function(str) {
        let buf = Buffer.from(str, "binary");
        return new Uint8Array(buf.buffer, buf.byteOffset, buf.length);
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
    var Tap = class _Tap {
      constructor(buf, pos) {
        this.setData(buf, pos);
      }
      setData(buf, pos) {
        if (typeof Buffer === "function" && buf instanceof Buffer) {
          buf = new Uint8Array(buf.buffer, buf.byteOffset, buf.length);
        }
        this.arr = buf;
        this.pos = pos | 0;
        if (this.pos < 0) {
          throw new Error("negative offset");
        }
      }
      get length() {
        return this.arr.length;
      }
      reinitialize(capacity) {
        this.setData(new Uint8Array(capacity));
      }
      static fromBuffer(buf, pos) {
        return new _Tap(buf, pos);
      }
      static withCapacity(capacity) {
        let buf = new Uint8Array(capacity);
        return new _Tap(buf);
      }
      toBuffer() {
        return this.arr.slice(0, this.pos);
      }
      subarray(start, end) {
        return this.arr.subarray(start, end);
      }
      append(newBuf) {
        const newArr = new Uint8Array(this.arr.length + newBuf.length);
        newArr.set(this.arr, 0);
        newArr.set(newBuf, this.arr.length);
        this.setData(newArr, 0);
      }
      forward(newBuf) {
        const subArr = this.arr.subarray(this.pos);
        const newArr = new Uint8Array(subArr.length + newBuf.length);
        newArr.set(subArr, 0);
        newArr.set(newBuf, subArr.length);
        this.setData(newArr, 0);
      }
      /**
       * Check that the tap is in a valid state.
       *
       * For efficiency reasons, none of the methods below will fail if an overflow
       * occurs (either read, skip, or write). For this reason, it is up to the
       * caller to always check that the read, skip, or write was valid by calling
       * this method.
       */
      isValid() {
        return this.pos <= this.arr.length;
      }
      _invalidate() {
        this.pos = this.arr.length + 1;
      }
      // Read, skip, write methods.
      //
      // These should fail silently when the buffer overflows. Note this is only
      // required to be true when the functions are decoding valid objects. For
      // example errors will still be thrown if a bad count is read, leading to a
      // negative position offset (which will typically cause a failure in
      // `readFixed`).
      readBoolean() {
        return !!this.arr[this.pos++];
      }
      skipBoolean() {
        this.pos++;
      }
      writeBoolean(b) {
        this.arr[this.pos++] = !!b;
      }
      readLong() {
        let n = 0;
        let k = 0;
        let buf = this.arr;
        let b, h, f, fk;
        do {
          b = buf[this.pos++];
          h = b & 128;
          n |= (b & 127) << k;
          k += 7;
        } while (h && k < 28);
        if (h) {
          f = n;
          fk = 268435456;
          do {
            b = buf[this.pos++];
            f += (b & 127) * fk;
            fk *= 128;
          } while (b & 128);
          return (f % 2 ? -(f + 1) : f) / 2;
        }
        return n >> 1 ^ -(n & 1);
      }
      skipLong() {
        let buf = this.arr;
        while (buf[this.pos++] & 128) {
        }
      }
      writeLong(n) {
        let buf = this.arr;
        let f, m;
        if (n >= -1073741824 && n < 1073741824) {
          m = n >= 0 ? n << 1 : ~n << 1 | 1;
          do {
            buf[this.pos] = m & 127;
            m >>= 7;
          } while (m && (buf[this.pos++] |= 128));
        } else {
          f = n >= 0 ? n * 2 : -n * 2 - 1;
          do {
            buf[this.pos] = f & 127;
            f /= 128;
          } while (f >= 1 && (buf[this.pos++] |= 128));
        }
        this.pos++;
      }
      readFloat() {
        let pos = this.pos;
        this.pos += 4;
        if (this.pos > this.arr.length) {
          return 0;
        }
        FLOAT_VIEW.setUint32(
          0,
          this.arr[pos] | this.arr[pos + 1] << 8 | this.arr[pos + 2] << 16 | this.arr[pos + 3] << 24,
          true
        );
        return FLOAT_VIEW.getFloat32(0, true);
      }
      skipFloat() {
        this.pos += 4;
      }
      writeFloat(f) {
        let pos = this.pos;
        this.pos += 4;
        if (this.pos > this.arr.length) {
          return;
        }
        FLOAT_VIEW.setFloat32(0, f, true);
        const n = FLOAT_VIEW.getUint32(0, true);
        this.arr[pos] = n & 255;
        this.arr[pos + 1] = n >> 8 & 255;
        this.arr[pos + 2] = n >> 16 & 255;
        this.arr[pos + 3] = n >> 24;
      }
      readDouble() {
        let pos = this.pos;
        this.pos += 8;
        if (this.pos > this.arr.length) {
          return 0;
        }
        FLOAT_VIEW.setUint32(
          0,
          this.arr[pos] | this.arr[pos + 1] << 8 | this.arr[pos + 2] << 16 | this.arr[pos + 3] << 24,
          true
        );
        FLOAT_VIEW.setUint32(
          4,
          this.arr[pos + 4] | this.arr[pos + 5] << 8 | this.arr[pos + 6] << 16 | this.arr[pos + 7] << 24,
          true
        );
        return FLOAT_VIEW.getFloat64(0, true);
      }
      skipDouble() {
        this.pos += 8;
      }
      writeDouble(d) {
        let pos = this.pos;
        this.pos += 8;
        if (this.pos > this.arr.length) {
          return;
        }
        FLOAT_VIEW.setFloat64(0, d, true);
        const a = FLOAT_VIEW.getUint32(0, true);
        const b = FLOAT_VIEW.getUint32(4, true);
        this.arr[pos] = a & 255;
        this.arr[pos + 1] = a >> 8 & 255;
        this.arr[pos + 2] = a >> 16 & 255;
        this.arr[pos + 3] = a >> 24;
        this.arr[pos + 4] = b & 255;
        this.arr[pos + 5] = b >> 8 & 255;
        this.arr[pos + 6] = b >> 16 & 255;
        this.arr[pos + 7] = b >> 24;
      }
      readFixed(len) {
        let pos = this.pos;
        this.pos += len;
        if (this.pos > this.arr.length) {
          return;
        }
        return this.arr.slice(pos, pos + len);
      }
      skipFixed(len) {
        this.pos += len;
      }
      writeFixed(buf, len) {
        len = len || buf.length;
        let pos = this.pos;
        this.pos += len;
        if (this.pos > this.arr.length) {
          return;
        }
        this.arr.set(buf.subarray(0, len), pos);
      }
      readBytes() {
        let len = this.readLong();
        if (len < 0) {
          this._invalidate();
          return;
        }
        return this.readFixed(len);
      }
      skipBytes() {
        let len = this.readLong();
        if (len < 0) {
          this._invalidate();
          return;
        }
        this.pos += len;
      }
      writeBytes(buf) {
        let len = buf.length;
        this.writeLong(len);
        this.writeFixed(buf, len);
      }
      skipString() {
        let len = this.readLong();
        if (len < 0) {
          this._invalidate();
          return;
        }
        this.pos += len;
      }
      readString() {
        let len = this.readLong();
        if (len < 0) {
          this._invalidate();
          return "";
        }
        let pos = this.pos;
        this.pos += len;
        if (this.pos > this.arr.length) {
          return;
        }
        let arr = this.arr;
        let end = pos + len;
        if (len > 24) {
          return decodeSlice(arr, pos, end);
        }
        let output = "";
        while (pos + 3 < end) {
          let a = arr[pos], b = arr[pos + 1], c = arr[pos + 2], d = arr[pos + 3];
          if ((a | b | c | d) & 128) {
            output += decodeSlice(arr, pos, end);
            return output;
          }
          output += String.fromCharCode(a, b, c, d);
          pos += 4;
        }
        while (pos < end) {
          let char = arr[pos];
          if (char & 128) {
            output += decodeSlice(arr, pos, end);
            return output;
          }
          output += String.fromCharCode(char);
          pos++;
        }
        return output;
      }
      writeString(s) {
        let buf = this.arr;
        const stringLen = s.length;
        if (stringLen > 21) {
          let encodedLength, encoded;
          if (this.isValid()) {
            encoded = encodeSlice(s);
            encodedLength = encoded.length;
          } else {
            encodedLength = utf8Length(s);
          }
          this.writeLong(encodedLength);
          let pos = this.pos;
          this.pos += encodedLength;
          if (this.isValid() && typeof encoded != "undefined") {
            buf.set(encoded, pos);
          }
        } else {
          let pos = this.pos + 1;
          let startPos = pos;
          let bufLen = buf.length;
          for (let i = 0; i < stringLen; i++) {
            let c1 = s.charCodeAt(i);
            let c2;
            if (c1 < 128) {
              if (pos < bufLen) buf[pos] = c1;
              pos++;
            } else if (c1 < 2048) {
              if (pos + 1 < bufLen) {
                buf[pos] = c1 >> 6 | 192;
                buf[pos + 1] = c1 & 63 | 128;
              }
              pos += 2;
            } else if ((c1 & 64512) === 55296 && ((c2 = s.charCodeAt(i + 1)) & 64512) === 56320) {
              c1 = 65536 + ((c1 & 1023) << 10) + (c2 & 1023);
              i++;
              if (pos + 3 < bufLen) {
                buf[pos] = c1 >> 18 | 240;
                buf[pos + 1] = c1 >> 12 & 63 | 128;
                buf[pos + 2] = c1 >> 6 & 63 | 128;
                buf[pos + 3] = c1 & 63 | 128;
              }
              pos += 4;
            } else {
              if (pos + 2 < bufLen) {
                buf[pos] = c1 >> 12 | 224;
                buf[pos + 1] = c1 >> 6 & 63 | 128;
                buf[pos + 2] = c1 & 63 | 128;
              }
              pos += 3;
            }
          }
          if (this.pos <= bufLen) {
            this.writeLong(pos - startPos);
          }
          this.pos = pos;
        }
      }
      // Binary comparison methods.
      //
      // These are not guaranteed to consume the objects they are comparing when
      // returning a non-zero result (allowing for performance benefits), so no
      // other operations should be done on either tap after a compare returns a
      // non-zero value. Also, these methods do not have the same silent failure
      // requirement as read, skip, and write since they are assumed to be called on
      // valid buffers.
      matchBoolean(tap) {
        return this.arr[this.pos++] - tap.arr[tap.pos++];
      }
      matchLong(tap) {
        let n1 = this.readLong();
        let n2 = tap.readLong();
        return n1 === n2 ? 0 : n1 < n2 ? -1 : 1;
      }
      matchFloat(tap) {
        let n1 = this.readFloat();
        let n2 = tap.readFloat();
        return n1 === n2 ? 0 : n1 < n2 ? -1 : 1;
      }
      matchDouble(tap) {
        let n1 = this.readDouble();
        let n2 = tap.readDouble();
        return n1 === n2 ? 0 : n1 < n2 ? -1 : 1;
      }
      matchFixed(tap, len) {
        return bufCompare(this.readFixed(len), tap.readFixed(len));
      }
      matchBytes(tap) {
        let l1 = this.readLong();
        let p1 = this.pos;
        this.pos += l1;
        let l2 = tap.readLong();
        let p2 = tap.pos;
        tap.pos += l2;
        let b1 = this.arr.subarray(p1, this.pos);
        let b2 = tap.arr.subarray(p2, tap.pos);
        return bufCompare(b1, b2);
      }
      // Functions for supporting custom long classes.
      //
      // The two following methods allow the long implementations to not have to
      // worry about Avro's zigzag encoding, we directly expose longs as unpacked.
      unpackLongBytes() {
        let res = new Uint8Array(8);
        let n = 0;
        let i = 0;
        let j = 6;
        let buf = this.arr;
        let b = buf[this.pos++];
        let neg = b & 1;
        res.fill(0);
        n |= (b & 127) >> 1;
        while (b & 128) {
          b = buf[this.pos++];
          n |= (b & 127) << j;
          j += 7;
          if (j >= 8) {
            j -= 8;
            res[i++] = n;
            n >>= 8;
          }
        }
        res[i] = n;
        if (neg) {
          invert(res, 8);
        }
        return res;
      }
      packLongBytes(buf) {
        let neg = (buf[7] & 128) >> 7;
        let res = this.arr;
        let j = 1;
        let k = 0;
        let m = 3;
        let n;
        if (neg) {
          invert(buf, 8);
          n = 1;
        } else {
          n = 0;
        }
        let parts = [
          buf[0] | buf[1] << 8 | buf[2] << 16,
          buf[3] | buf[4] << 8 | buf[5] << 16,
          buf[6] | buf[7] << 8
        ];
        while (m && !parts[--m]) {
        }
        while (k < m) {
          n |= parts[k++] << j;
          j += 24;
          while (j > 7) {
            res[this.pos++] = n & 127 | 128;
            n >>= 7;
            j -= 7;
          }
        }
        n |= parts[m] << j;
        do {
          res[this.pos] = n & 127;
          n >>= 7;
        } while (n && (res[this.pos++] |= 128));
        this.pos++;
        if (neg) {
          invert(buf, 8);
        }
      }
    };
    function invert(buf, len) {
      while (len--) {
        buf[len] = ~buf[len];
      }
    }
    function printJSON(obj) {
      let seen = /* @__PURE__ */ new Set();
      try {
        return JSON.stringify(obj, (key, value) => {
          if (seen.has(value)) return "[Circular]";
          if (typeof value === "object" && value !== null) seen.add(value);
          if (typeof BigInt !== "undefined" && value instanceof BigInt) {
            return `[BigInt ${value.toString()}n]`;
          }
          return value;
        });
      } catch (err) {
        return "[object]";
      }
    }
    module2.exports = {
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
  }
});

// ../work/mtth__avsc/lib/specs.js
var files = require_files(), utils = require_utils();
var TYPE_REFS = {
  date: { type: "int", logicalType: "date" },
  decimal: { type: "bytes", logicalType: "decimal" },
  time_ms: { type: "long", logicalType: "time-millis" },
  timestamp_ms: { type: "long", logicalType: "timestamp-millis" }
};
function assembleProtocol(fpath, opts, cb) {
  if (!cb && typeof opts == "function") {
    cb = opts;
    opts = void 0;
  }
  opts = opts || {};
  if (!opts.importHook) {
    opts.importHook = files.createImportHook();
  }
  importFile(fpath, "", (err, protocol) => {
    if (err) {
      cb(err);
      return;
    }
    if (!protocol) {
      cb(new Error("empty root import"));
      return;
    }
    let schemas = protocol.types;
    if (schemas) {
      let namespace = protocolNamespace(protocol) || "";
      schemas.forEach((schema) => {
        if (schema.namespace === namespace) {
          delete schema.namespace;
        }
      });
    }
    cb(null, protocol);
  });
  function importFile(fpath2, importerPath, cb2) {
    opts.importHook({ path: fpath2, importerPath, kind: "idl" }, (err, payload) => {
      if (err) {
        cb2(err);
        return;
      }
      if (!payload) {
        cb2();
        return;
      }
      const { contents: str, path: fpath3 } = payload;
      let obj;
      try {
        let reader = new Reader(str, opts);
        obj = reader._readProtocol(str, opts);
      } catch (err2) {
        err2.path = fpath3;
        cb2(err2);
        return;
      }
      fetchImports(obj.protocol, obj.imports, fpath3, cb2);
    });
  }
  function fetchImports(protocol, imports, fpath2, cb2) {
    let importedProtocols = [];
    next();
    function next() {
      let info = imports.shift();
      if (!info) {
        importedProtocols.reverse();
        try {
          importedProtocols.forEach((imported) => {
            mergeImport(protocol, imported);
          });
        } catch (err) {
          cb2(err);
          return;
        }
        cb2(null, protocol);
        return;
      }
      if (info.kind === "idl") {
        importFile(info.name, fpath2, (err, imported) => {
          if (err) {
            cb2(err);
            return;
          }
          if (imported) {
            importedProtocols.push(imported);
          }
          next();
        });
      } else {
        opts.importHook({
          path: info.name,
          importerPath: fpath2,
          kind: info.kind
        }, (err, payload) => {
          if (err) {
            cb2(err);
            return;
          }
          switch (info.kind) {
            case "protocol":
            case "schema": {
              if (!payload) {
                next();
                return;
              }
              let obj;
              try {
                obj = JSON.parse(payload.contents);
              } catch (err2) {
                err2.path = payload.path;
                cb2(err2);
                return;
              }
              let imported = info.kind === "schema" ? { types: [obj] } : obj;
              importedProtocols.push(imported);
              next();
              return;
            }
            default:
              cb2(new Error(`invalid import kind: ${info.kind}`));
          }
        });
      }
    }
  }
  function mergeImport(protocol, imported) {
    let schemas = imported.types || [];
    schemas.reverse();
    schemas.forEach((schema) => {
      if (!protocol.types) {
        protocol.types = [];
      }
      if (schema.namespace === void 0) {
        schema.namespace = protocolNamespace(imported) || "";
      }
      protocol.types.unshift(schema);
    });
    Object.keys(imported.messages || {}).forEach((name) => {
      if (!protocol.messages) {
        protocol.messages = {};
      }
      if (protocol.messages[name]) {
        throw new Error(`duplicate message: ${name}`);
      }
      protocol.messages[name] = imported.messages[name];
    });
  }
}
function read(str) {
  let schema;
  let contents = files.tryReadFileSync(str);
  if (contents === null) {
    schema = str;
  } else {
    try {
      return JSON.parse(contents);
    } catch (err) {
      let opts = { importHook: files.createSyncImportHook() };
      assembleProtocol(str, opts, (err2, protocolSchema) => {
        schema = err2 ? contents : protocolSchema;
      });
    }
  }
  if (typeof schema != "string" || schema === "null") {
    return schema;
  }
  try {
    return JSON.parse(schema);
  } catch (err) {
    try {
      return Reader.readProtocol(schema);
    } catch (err2) {
      try {
        return Reader.readSchema(schema);
      } catch (err3) {
        return schema;
      }
    }
  }
}
var Reader = class _Reader {
  constructor(str, opts) {
    opts = opts || {};
    this._tk = new Tokenizer(str);
    this._ackVoidMessages = !!opts.ackVoidMessages;
    this._implicitTags = !opts.delimitedCollections;
    this._typeRefs = opts.typeRefs || TYPE_REFS;
  }
  static readProtocol(str, opts) {
    let reader = new _Reader(str, opts);
    let protocol = reader._readProtocol();
    if (protocol.imports.length) {
      throw new Error("unresolvable import");
    }
    return protocol.protocol;
  }
  static readSchema(str, opts) {
    let reader = new _Reader(str, opts);
    let doc = reader._readJavadoc();
    let schema = reader._readType(doc === void 0 ? {} : { doc }, true);
    reader._tk.next({ id: "(eof)" });
    return schema;
  }
  _readProtocol() {
    let tk = this._tk;
    let imports = [];
    let types = [];
    let messages = {};
    this._readImports(imports);
    let protocolSchema = {};
    let protocolJavadoc = this._readJavadoc();
    if (protocolJavadoc !== void 0) {
      protocolSchema.doc = protocolJavadoc;
    }
    this._readAnnotations(protocolSchema);
    tk.next({ val: "protocol" });
    if (!tk.next({ val: "{", silent: true })) {
      protocolSchema.protocol = tk.next({ id: "name" }).val;
      tk.next({ val: "{" });
    }
    while (!tk.next({ val: "}", silent: true })) {
      if (!this._readImports(imports)) {
        let javadoc = this._readJavadoc();
        let typeSchema = this._readType({}, true);
        let numImports = this._readImports(imports, true);
        let message = void 0;
        let pos = tk.pos;
        if (!numImports && (message = this._readMessage(typeSchema))) {
          if (javadoc !== void 0 && message.schema.doc === void 0) {
            message.schema.doc = javadoc;
          }
          let oneWay = false;
          if (message.schema.response === "void" || message.schema.response.type === "void") {
            oneWay = !this._ackVoidMessages && !message.schema.errors;
            if (message.schema.response === "void") {
              message.schema.response = "null";
            } else {
              message.schema.response.type = "null";
            }
          }
          if (oneWay) {
            message.schema["one-way"] = true;
          }
          if (messages[message.name]) {
            throw new Error(`duplicate message: ${message.name}`);
          }
          messages[message.name] = message.schema;
        } else {
          if (javadoc) {
            if (typeof typeSchema == "string") {
              typeSchema = { doc: javadoc, type: typeSchema };
            } else if (typeSchema.doc === void 0) {
              typeSchema.doc = javadoc;
            }
          }
          types.push(typeSchema);
          tk.pos = pos;
          tk.next({ val: ";", silent: true });
        }
        javadoc = void 0;
      }
    }
    tk.next({ id: "(eof)" });
    if (types.length) {
      protocolSchema.types = types;
    }
    if (Object.keys(messages).length) {
      protocolSchema.messages = messages;
    }
    return { protocol: protocolSchema, imports };
  }
  _readAnnotations(schema) {
    let tk = this._tk;
    while (tk.next({ val: "@", silent: true })) {
      let parts = [];
      while (!tk.next({ val: "(", silent: true })) {
        parts.push(tk.next().val);
      }
      schema[parts.join("")] = tk.next({ id: "json" }).val;
      tk.next({ val: ")" });
    }
  }
  _readMessage(responseSchema) {
    let tk = this._tk;
    let schema = { request: [], response: responseSchema };
    this._readAnnotations(schema);
    let name = tk.next().val;
    if (tk.next().val !== "(") {
      return;
    }
    if (!tk.next({ val: ")", silent: true })) {
      do {
        schema.request.push(this._readField());
      } while (!tk.next({ val: ")", silent: true }) && tk.next({ val: "," }));
    }
    let token = tk.next();
    switch (token.val) {
      case "throws":
        schema.errors = [];
        do {
          schema.errors.push(this._readType());
        } while (!tk.next({ val: ";", silent: true }) && tk.next({ val: "," }));
        break;
      case "oneway":
        schema["one-way"] = true;
        tk.next({ val: ";" });
        break;
      case ";":
        break;
      default:
        throw tk.error("invalid message suffix", token);
    }
    return { name, schema };
  }
  _readJavadoc() {
    let token = this._tk.next({ id: "javadoc", emitJavadoc: true, silent: true });
    if (token) {
      return token.val;
    }
  }
  _readField() {
    let tk = this._tk;
    let javadoc = this._readJavadoc();
    let schema = { type: this._readType() };
    if (javadoc !== void 0 && schema.doc === void 0) {
      schema.doc = javadoc;
    }
    const isOptional = tk.next({ id: "operator", val: "?", silent: true });
    this._readAnnotations(schema);
    schema.name = tk.next({ id: "name" }).val;
    if (tk.next({ val: "=", silent: true })) {
      schema["default"] = tk.next({ id: "json" }).val;
    }
    if (isOptional) {
      schema.type = "default" in schema && schema.default !== null ? [schema.type, "null"] : ["null", schema.type];
    }
    return schema;
  }
  _readType(schema, top) {
    schema = schema || {};
    this._readAnnotations(schema);
    schema.type = this._tk.next({ id: "name" }).val;
    switch (schema.type) {
      case "record":
      case "error":
        return this._readRecord(schema);
      case "fixed":
        return this._readFixed(schema);
      case "enum":
        return this._readEnum(schema, top);
      case "map":
        return this._readMap(schema);
      case "array":
        return this._readArray(schema);
      case "union":
        if (Object.keys(schema).length > 1) {
          throw new Error("union annotations are not supported");
        }
        return this._readUnion();
      default: {
        let ref = this._typeRefs[schema.type];
        if (ref) {
          delete schema.type;
          utils.copyOwnProperties(ref, schema);
        }
        return Object.keys(schema).length > 1 ? schema : schema.type;
      }
    }
  }
  _readFixed(schema) {
    let tk = this._tk;
    if (!tk.next({ val: "(", silent: true })) {
      schema.name = tk.next({ id: "name" }).val;
      tk.next({ val: "(" });
    }
    schema.size = parseInt(tk.next({ id: "number" }).val);
    tk.next({ val: ")" });
    return schema;
  }
  _readMap(schema) {
    let tk = this._tk;
    let silent = this._implicitTags;
    let implicitTags = tk.next({ val: "<", silent }) === void 0;
    schema.values = this._readType();
    tk.next({ val: ">", silent: implicitTags });
    return schema;
  }
  _readArray(schema) {
    let tk = this._tk;
    let silent = this._implicitTags;
    let implicitTags = tk.next({ val: "<", silent }) === void 0;
    schema.items = this._readType();
    tk.next({ val: ">", silent: implicitTags });
    return schema;
  }
  _readEnum(schema, top) {
    let tk = this._tk;
    if (!tk.next({ val: "{", silent: true })) {
      schema.name = tk.next({ id: "name" }).val;
      tk.next({ val: "{" });
    }
    schema.symbols = [];
    do {
      schema.symbols.push(tk.next().val);
    } while (!tk.next({ val: "}", silent: true }) && tk.next({ val: "," }));
    if (top && tk.next({ val: "=", silent: true })) {
      schema.default = tk.next().val;
      tk.next({ val: ";" });
    }
    return schema;
  }
  _readUnion() {
    let tk = this._tk;
    let arr = [];
    tk.next({ val: "{" });
    do {
      arr.push(this._readType());
    } while (!tk.next({ val: "}", silent: true }) && tk.next({ val: "," }));
    return arr;
  }
  _readRecord(schema) {
    let tk = this._tk;
    if (!tk.next({ val: "{", silent: true })) {
      schema.name = tk.next({ id: "name" }).val;
      tk.next({ val: "{" });
    }
    schema.fields = [];
    while (!tk.next({ val: "}", silent: true })) {
      schema.fields.push(this._readField());
      tk.next({ val: ";" });
    }
    return schema;
  }
  _readImports(imports, maybeMessage) {
    let tk = this._tk;
    let numImports = 0;
    let pos = tk.pos;
    while (tk.next({ val: "import", silent: true })) {
      if (!numImports && maybeMessage && tk.next({ val: "(", silent: true })) {
        tk.pos = pos;
        return;
      }
      let kind = tk.next({ id: "name" }).val;
      let fname = JSON.parse(tk.next({ id: "string" }).val);
      tk.next({ val: ";" });
      imports.push({ kind, name: fname });
      numImports++;
    }
    return numImports;
  }
};
var Tokenizer = class {
  constructor(str) {
    this._str = str;
    this.pos = 0;
  }
  next(opts) {
    let token = { pos: this.pos, id: void 0, val: void 0 };
    let javadoc = this._skip(opts && opts.emitJavadoc);
    if (typeof javadoc == "string") {
      token.id = "javadoc";
      token.val = javadoc;
    } else {
      let pos = this.pos;
      let str = this._str;
      let c = str.charAt(pos);
      if (!c) {
        token.id = "(eof)";
      } else {
        if (opts && opts.id === "json") {
          token.id = "json";
          this.pos = this._endOfJson();
        } else if (c === '"') {
          token.id = "string";
          this.pos = this._endOfString();
        } else if (/[0-9]/.test(c)) {
          token.id = "number";
          this.pos = this._endOf(/[0-9]/);
        } else if (/[`A-Za-z_.]/.test(c)) {
          token.id = "name";
          this.pos = this._endOf(/[`A-Za-z0-9_.]/);
        } else {
          token.id = "operator";
          this.pos = pos + 1;
        }
        token.val = str.slice(pos, this.pos);
        if (token.id === "json") {
          try {
            token.val = JSON.parse(token.val);
          } catch (err2) {
            throw this.error("invalid JSON", token);
          }
        } else if (token.id === "name") {
          token.val = token.val.replace(/`/g, "");
        }
      }
    }
    let err;
    if (opts && opts.id && opts.id !== token.id) {
      err = this.error(`expected ID ${opts.id}`, token);
    } else if (opts && opts.val && opts.val !== token.val) {
      err = this.error(`expected value ${opts.val}`, token);
    }
    if (!err) {
      return token;
    } else if (opts && opts.silent) {
      this.pos = token.pos;
      return void 0;
    } else {
      throw err;
    }
  }
  error(reason, context) {
    let isToken = typeof context != "number";
    let pos = isToken ? context.pos : context;
    let str = this._str;
    let lineNum = 1;
    let lineStart = 0;
    for (let i = 0; i < pos; i++) {
      if (str.charAt(i) === "\n") {
        lineNum++;
        lineStart = i;
      }
    }
    let msg = isToken ? `invalid token ${utils.printJSON(context)}: ${reason}` : reason;
    let err = new Error(msg);
    err.token = isToken ? context : void 0;
    err.lineNum = lineNum;
    err.colNum = pos - lineStart;
    return err;
  }
  /** Skip whitespace and comments. */
  _skip(emitJavadoc) {
    let str = this._str;
    let isJavadoc = false;
    let c;
    while ((c = str.charAt(this.pos)) && /\s/.test(c)) {
      this.pos++;
    }
    let pos = this.pos;
    if (c === "/") {
      switch (str.charAt(this.pos + 1)) {
        case "/":
          this.pos += 2;
          while ((c = str.charAt(this.pos)) && c !== "\n") {
            this.pos++;
          }
          return this._skip(emitJavadoc);
        case "*":
          this.pos += 2;
          if (str.charAt(this.pos) === "*") {
            isJavadoc = true;
          }
          while (c = str.charAt(this.pos++)) {
            if (c === "*" && str.charAt(this.pos) === "/") {
              this.pos++;
              if (isJavadoc && emitJavadoc) {
                return extractJavadoc(str.slice(pos + 3, this.pos - 2));
              }
              return this._skip(emitJavadoc);
            }
          }
          throw this.error("unterminated comment", pos);
      }
    }
  }
  /** Generic end of method. */
  _endOf(pat) {
    let pos = this.pos;
    let str = this._str;
    while (pat.test(str.charAt(pos))) {
      pos++;
    }
    return pos;
  }
  /** Find end of a string. */
  _endOfString() {
    let pos = this.pos + 1;
    let str = this._str;
    let c;
    while (c = str.charAt(pos)) {
      if (c === '"') {
        return pos + 1;
      }
      if (c === "\\") {
        pos += 2;
      } else {
        pos++;
      }
    }
    throw this.error("unterminated string", pos - 1);
  }
  /** Find end of JSON object, throwing an error if the end is reached first. */
  _endOfJson() {
    let pos = utils.jsonEnd(this._str, this.pos);
    if (pos < 0) {
      throw this.error("invalid JSON", pos);
    }
    return pos;
  }
};
function extractJavadoc(str) {
  let lines = str.replace(/^[ \t]+|[ \t]+$/g, "").split("\n").map((line, i) => {
    return i ? line.replace(/^\s*\*\s?/, "") : line;
  });
  while (lines.length && !lines[0]) {
    lines.shift();
  }
  while (lines.length && !lines[lines.length - 1]) {
    lines.pop();
  }
  return lines.join("\n");
}
function protocolNamespace(protocol) {
  if (protocol.namespace) {
    return protocol.namespace;
  }
  let match = /^(.*)\.[^.]+$/.exec(protocol.protocol);
  return match ? match[1] : void 0;
}
module.exports = {
  Tokenizer,
  assembleProtocol,
  read,
  readProtocol: Reader.readProtocol,
  readSchema: Reader.readSchema
};
