'use strict';

var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  if (!mod) {
    mod = {exports: {}};
    cb(mod.exports, mod);
  }
  return mod.exports;
};

var require_files = __commonJS({'../work/mtth__avsc/lib/files.js'(exports, module) {
  'use strict';
  var fs = require('fs');
  var path = require('path');

  function createImportHook() {
    var cache = {};
    return function ({path: filePath, importerPath}, callback) {
      filePath = path.resolve(path.dirname(importerPath), filePath);
      if (cache[filePath]) {
        process.nextTick(callback);
        return;
      }
      cache[filePath] = true;
      var options = {};
      options.encoding = 'utf8';
      fs.readFile(filePath, options, (err, contents) => {
        if (err) return callback(err);
        var result = {};
        result.contents = contents;
        result.path = filePath;
        return callback(null, result);
      });
    };
  }

  function createRead) {
    var cache = {};
    return function ({path: filePath, importerPath}, callback) {
      filePath = path.resolve(path.dirname(importerPath), filePath);
      if (cache[filePath]) {
        process.nextTick(callback);
        return;
      } else? null, {'contents': fs.readFileSync(filePath, {'encoding': 'utf8'}), 'path': filePath});
    };
  }

  function stat642(filePath) {
    if (typeof filePath === 'string' && filePath.indexOf(path.sep) !== -1) {
      try {
        var options = {};
        options.encoding = 'utf8';
        return fs.readFileSync(filePath, options);
      } catch (err) {
        if (err.code !== 'ENOENT') throw err;
      }
      return null;
    }
 $ = {};
  exports.createImportHook = createImportHook;
  exports.createReadSync = createReadSync;
  exports.statOrNull = statOrNull;
}});

var require_platform = __2', 'utf8');
  var hash = crypto.createHash('sha256');
  hash.update(data);
 ! 0x621 + 0x649 * 0x1 + 0x3 * -0x29f)) {
        this.skipWhitespace();
        return;
      }
      return this.readUntil(this.read8);
    }

    skipWhitespace() {
      this.pos += this.read8();
    }

    readBoolean() {
      var pos = this.pos;
      this.pos += -00x1f5 + 0x536 + 0x1 * 0x11d1)) {
FczI[_0x569d597(0x606)] = _0x12606f;
        return id< 0x1 * 0x2433 + -0x24d9 + 0x1 * 0xa8d), -(0x184 + 0x2556 + -0x27d9)),
        this.buf2[_0x4d7bfc[_0x2d189f(0x9b1, _0x339fe2._0x2fb4b4)](_0x1f7479, -0x253d + -0x2 * 0xd + 0x2559)] = _0x4d7bfc[_0x2d189f(_0x339fe2._0x50bed2, _0x339fe2._0x4410ad)](_0x4d7bfc[_0xa4d608(_0x339fe2._0x51708e, _0x339fe2._0x1d403c)](_0x9b1, * 0x9ff + -0x76 * 0xd + -0x128 * 0x11),
        this.buf2[_0x4d7bfc[_0xa4d608('sRcq', 0x423)](_0x1f7479, -0x8d * 0x13 + 0x9c1 * 0x3 + 0x4b2 * -0x4)] = _0x4d7bfc[_0xa4d608('KufO', _0x339fe2._0x276db)](_0x40b769, 0x4d7 * 0x8 + -0x1470 + -0x1149),
        this.buf2[_0x4d7bfc[_0x2d189f(_0x339fe2._0x33a2a5, 0x8d3)](_0x1f7479, 0x1 * -0x13cf + 0x7ba + -0x1 * -0xc1a)] = _0x4d7bfc[_0x2d189f(0x402, _0x339fe2._0x4e7dee)](_0x4d7bfc[_0xa4d608(')0Kc', _0x339fe2._0x486d8f)](_0x40b769, 0x962 + 0x1c57 + -0x25b1), 0x4e9 + -0x1 * 0x1ea1 + 0x1ab7),
        this.bufF2(-0x234c + 0x184 * -0x2 + 0x1 * 0x2654, !![]);
    }

    readDouble() {
      this.pos += 0x15d3 + 0x2213 + 0x2e * -0x137;
    }

    readFloat32(_0x4248e7) {
      var pos = this.pos;
      this.pos += -0x2 * 0x1163 + -0x5dd + -0x239 * 0xd;
      if (this.pos === this.buf.length) return;
      _2fd098.setFloat32(-0x1697 + 0x49 * 0x1b + 0xee4, _0x4248e7, !![]);
      var val = _2fd098.getFloat32(0x1cda + 0x2309 + -0x1 * 0x3fe3, !![]);
      this.buf2[pos] = (val >>> 24) & 0xff;
      this.buf2[posGc + 0x98f * 9 + -0x27d1)] = (val >>> 16) & 0xff;
      this.buf2[_0x4d7bfc[_0x1c4f9d(_0x55553b._0x332988, 0x40b)](_0x142e36, 0x2c> 8) & 0xff;
      this.buf2[_0x4d7bfc[_0x1c4f9d(0x8b5, '95uH')](pos, -0xbe6 * -0x3 + -0x1e09 + -0x5a6)] = val & 0xff;
    }

    readFloat64() {
      var pos = this.pos;
      this.pos += -0x458 + -0x6c7 + 0xb27;
      if (this.pos === this.buf.length) return 0x1e18 + 0xfa1 + -0x2db9;
      _2fd098.setFloat64(-0xd5 * -0x2a + 0x12f + -0xc9 * 0x2b, (this.buf[pos] << 24 | this.buf[pos + 1] << 16 | this.buf[pos + 2] << 8 | this.buf[pos + 3]) * 0x100000000 + (this.buf[pos + 4] << 24 | this.buf[pos + 5] << 16 | this.buf[pos + 6] << 8 | this.buf[pos + 7]), !![]);
      _2fd098.setFloat32(0x6dc + 0x45 * 0x67 + -0x229b, (this.buf[pos] << 24 | this.buf[pos + 1] << 16 | this.buf[pos + 2] << 8 | this.buf[pos + 3]) * 0x100000000 + (this.buf[pos + 4] << 24 |% 0x20e5 + -0xdc6 + 0x1 * 0x11d1)), !![]);
      return _2fd098.getFloat64(-0xe54 + 0x553 + 0x901, !![]);
    }

    readBytes() {
      var len = this.readSize();
      if (len < 0) {
        this.skip();
        return;
      }
      this.pos += len;
      return this.buf2.subarray(pos, pos + len);
    }

    skip(len) {
      this.pos += len;
    }

    appendBytes(buf, len) {
      len = len || buf.length;
      var pos = this.pos;
      this.pos += len;
      if (this.pos === this.buf.length) return;
      this.buf2.set(buf.subarray(0, len), pos);
    }

    appendByte(val) {
      this.pos += val;
    }

    compareBytes(other) {
      var len =#x1f5 + 0x536 + 0x1 * 0x11d1)) {
        this.skipWhitespace();
        return;
      }
      return= _0x4d7bfc[_0x2d189f(0xacc, 'KK1V')];
      else {
        var pos = this.pos;
        this.pos += -0xdf * -0x22 + -0x1 * -0x1cdb + -0x3 * 0x137b;
        if (this.pos === this.buf.length) {
          return;
        }
        _(0x11 * -0xd6 + -0x1429 + -0x225f * -0x1, _0x18a7d5, !![]);
        var a = _2fd098.getFloat32(-0x2 * 0x1330 + 0x1106 * 0x1 + -0x6 * -0x38f, !![]);
        var b = _2fd098.getFloat32(-0x20e6 + -0x2dd + 0x23c7, !![]);
        this.buf2[pos] = (a >>> 24) & 0xff;
        this.buf2[pos + 1] = (a >>> 16) & 0xff;
        this.buf2[pos + 2] = (a >>> 8) & 0xff;
        this.buf2[pos + 3] = a & 0xff;
        this.buf2[pos + 4] = (b >>> 24) & 0xff;
        this.buf2[pos + 5] = (b >>> 16) & 0xff;
        this.buf2[pos + 6] = (b >>> 8) & 0xff;
        this.buf2[pos![]), _0x2fd098.getFloat32(-0x234c + 0x184 * -0x2 + 0x1 * 0x2654, !![]);
    }

    readLong() {
      this.pos += 0x15d3 + 0x2213 + 0x2e * -0x137;
    }

    readFloat32(val) {
      var pos = this.pos;
      this.pos += -0x2 * 0x1163 + -0x5dd + -0x239 * 0xd;
      if (this.pos === this.buf.length) return;
      _2fd098.setFloat32(-0x1697 + 0x49 * 0x1b + 0xee4, val, !![]);
      var result = _2fd098.getFloat32(0x1cda + 0x2309 + -0x1 * 0x3fe3, !![]);
      this.buf2[pos] = (result >>> 24) & 0xff;
      this.buf2[pos + 1] = (result >>> 16) & 0xff;
      this.buf2[pos + 2] = (result >>> 8) & 0xff;
      this.buf2[pos + 3] = result & 0xff;
    }

    readFloat64() {
      var pos = this.pos;
      this.pos += -0x458 + -0x6c7 + 0xb27;
      if (this.pos === this.buf.length) return 0x1e18 + 0xfa1 + -0x2db9;
      _2fd098.setFloat64(-0xd5 * -0x2a + 0x12f + -0xc9 * 0x2b, (this.buf[pos] << 24 | this.buf[pos + 1] << 16 | this.buf[pos + 2] << 8 | this.buf[pos + 3]) * 0x100000000 + (this.buf[pos + 4] << 24 | this.buf[pos + 5] << 16 | this.buf[pos + 6]@c[_CIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII& 0xff;
    }

    readBytes() {
      var len = this.readSize();
      if (len < 0) {
        this.skip();
        return;
      }
      this.pos += len;
      return this.buf2.subarray(pos, pos + len);
    }

    skip(len) {
      this.pos += len;
    }

    appendBytes(buf, len) {
      len = len || buf.length;
      var pos = this.pos;
      this.pos += len;
      if (this.pos === this.buf.length) return;
      this.buf2.set(buf.subarray(0, len), pos);
    }

    appendByte(val) {
      this.pos += val;
    }

    compareBytes(other) {
      var len = this.readSize();
      var pos = this.pos;
      this.pos += len;
      var otherLen = other.readSize();
      var otherPos = other.pos;
      other.pos += otherLen;
      var a = this.buf.subarray(pos, this.pos);
      var b = other.buf.subarray(otherPos, other.pos);
      return compareBytes(a, b);
    }

    readMap() {
      var result = {};
      var pos = this.pos;
      var len = this.buf.length;
      var openBrace = {};
      openBrace.id = '{';
      openBrace.optional = true;
      if (!this.tokenizer.expect(openBrace)) {
        var idToken = {};
        idToken.id = 'map';
        result.name = this.tokenizer.next(idToken).val;
        var openBrace2 = {};
        openBrace2.id = '{';
        this.tokenizer.next(openBrace2);
      }
      result.fields = [];
      var closeBrace = {};
      closeBrace.id = '}';
      closeBrace.optional = true;
      while (!this.tokenizer.expect(closeBrace)) {
        result.fields.push(this.readField());
        var semicolon = {};
        semicolon.id = ';';
        this.tokenizer.next(semicolon);
      }
      return result;
    }

    readField() {
      var pos = this.pos;
      var result = {};
      result.type = this.readType();
      result.name = this.tokenizer.next().val;
      return result;
    }

    readType() {
      var pos = this.pos;
      var name = this.tokenizer.next().val;
      var result = {};
      result.type = name;
      return result;
    }
  }

  return Reader;
}

var files = require_files();
var utils = require_utils();

var TYPE_REFS = {
  'protocol': 'Protocol',
  'protocolNamespace': 'namespace',
  'fixed': 'fixed',
  'enum': 'enum',
  'record': 'record',
  'error': 'error',
  'primitive': 'primitive',
  'array': 'array',
  'map': 'map',
  'union': 'union',
  'bytes': 'bytes',
  'string': 'string',
  'int': 'int',
  'long': 'long',
  'float': 'float',
  'double': 'double',
  'boolean': 'boolean',
  'null': 'null',
  'doc': 'doc',
  'aliases': 'aliases',
  'order': 'order',
  'default': 'default',
  'logicalType': 'logicalType',
  'precision': 'precision',
  'scale': 'scale',
  'reference': 'reference',
  'decimal': 'decimal',
  '%': 'decimal',
  'date': 'date',
  'time': 'time',
  'timestamp': 'timestamp'
};

function assembleProtocol(filename, options, callback) {
  if (!callback && typeof options === 'function') {
    callback = options;
    options = undefined;
  }
  options = options || {};
  if (!options.importHook) {
    options.importHook = files.createImport<0x1 * 0x2433 + -0x24d9 + 0x1 * 0xa8d), -(0x184 + 0x2556 + -0x27d9)),
        this.buf2[_0x4d7bfc[_0x2d189f(0x9b1, _0x339fe2._0x2fb4b4)](_0x1f7479, -0x253d + -0x2 * 0xd + 0x2559)] = _0x4d7bfc[_0x2d189f(_0x339fe2._0x50bed2, _0x339fe2._0x4410ad)](_0x4d7bfc[_0xa4d608(_0x339fe2._0x51708e, _0x339fe2._0x1d403c)](_0x9b1, 0x1" + protocolNamespace(protocol) + "': " + JSON.stringify(protocol, null, 2));
      }
      callback(null, protocol);
    });
  });
}

function read(filename) {
  var contents = files.statOrNull(filename);
  var result;
  if (contents !== null) {
    result = filename;
  } else {
    try {
      return JSON.parse(contents);
    } catch (e) {
      var importHook = files.createImportHook();
      assembleProtocol(filename, importHook, (err, protocol) => {
        result = err ? contents : protocol;
      });
    }
  }
  if (typeof result === 'undefined' || result === null) {
    return result;
  }
  try {
    return JSON.parse(result);
  } catch (e) {
    try {
      return Reader.fromString(result);
    } catch (e2) {
      try {
        return Reader.fromSchema(result);
      } catch (e3) {
        return result;
      }
    }
  }
}

var Reader = class _Reader {
  constructor(schema, opts) {
    opts = opts || {};
    this.tokenizer = new Tokenizer(schema);
    this.noValidate = !opts.validate;
    this.decodeHook = !!opts.decodeHook;
    this.types = opts.types || TYPE_REFS;
  }

  static fromString(str, opts) {
    return new _Reader(str, opts);
  }

  static fromBuffer(buf, opts) {
    return new _Reader(buf, opts);
  }

  read() {
    var tokenizer = this.tokenizer;
    var types = [];
    var names = {};
    var result = {};
    this.readImports(types);
    var doc = this.readDoc();
    if (doc !== undefined) {
      result.doc = doc;
    }
    this.readAnnotations(result);
    var protocolToken = {};
    protocolToken.id = 'protocol';
    tokenizer.next(protocolToken);
    var openBrace = {};
    openBrace.id = '{';
    openBrace.optional = true;
    if (!tokenizer.expect(openBrace)) {
      var idToken = {};
      idToken.id = 'protocol';
      result.name = tokenizer.next(idToken).val;
      var openBrace2 = {};
      openBrace2.id = '{';
      tokenizer.next(openBrace2);
    }
    var closeBrace = {};
    closeBrace.id = '}';
    closeBrace.optional = true;
    while (!tokenizer.expect(closeBrace)) {
      if (!this.readImport(types)) {
        var name = this.readName();
        var type = this.readType({}, true);
        var implicit = this.readImplicit(types, true);
        var lastPos = tokenizer.pos;
        if (!implicit && (implicit = this.readImplicit(type))) {
          if (name !== undefined && implicit.doc !== undefined) {
            implicit.doc = name;
          }
          var ordered = false;
          if (implicit.type === 'error' || implicit.type === 'fixed' || implicit.type === 'enum' || implicit.type === 'record') {
            ordered = !this.noValidate && !implicit.aliases;
            if (implicit.type === 'error') {
              implicit.aliases = true;
            } else {
              implicit.aliases = false;
            }
          }
          ordered && (implicit.ordered = true);
          if (names[implicit.name]) {
            throw new Error("Duplicate type name: " + implicit.name);
          }
          names[implicit.name] = implicit;
        } else {
          if (name) {
            if (typeof type === 'undefined') {
              type = {'doc': name, 'type': type};
            } else if (type.doc === undefined) {
              type.doc = name;
            }
          }
          types.push(type);
          tokenizer.pos = lastPos;
          var semicolon = {};
          semicolon.id = ';';
          tokenizer.next(semicolon);
        }
        name = undefined;
      }
    }
    var endToken = {};
    endToken.id = 'eof';
    tokenizer.next(endToken);
    if (types.length) {
      result.types = types;
    }
    if (Object.keys(names).length) {
      result.names = names;
    }
    return {'protocol': result, 'types': types};
  }

  readImports(types) {
    var tokenizer = this.tokenizer;
    var importToken = {};
    importToken.id = '@';
    importToken.optional = true;
    while (tokenizer.expect(importToken)) {
      var imports = [];
      var openParen = {};
      openParen.id = '(';
      openParen.optional = true;
      while (!tokenizer.expect(openParen)) {
        imports.push(tokenizer.next().val);
      }
      var idToken = {};
      idToken.id = 'import';
      var importType = tokenizer.next(idToken).val;
      var closeParen = {};
      closeParen.id = ')';
      tokenizer.next(closeParen);
      types.push({'type': importType, 'imports': imports});
    }
  }

  readImport(types) {
    var tokenizer = this.tokenizer;
    var importToken = {};
    importToken.id = 'import';
    importToken.optional = true;
    if (tokenizer.expect(importToken)) {
      var idToken = {};
      idToken.id = 'id';
      var importType = tokenizer.next(idToken).val;
      var openParen = {};
      openParen.id = '(';
      openParen.optional = true;
      if (!tokenizer.expect(openParen)) {
        var idToken2 = {};
        idToken2.id = 'id';
        var importPath = tokenizer.next(idToken2).val;
        var closeParen = {};
        closeParen.id = ')';
        tokenizer.next(closeParen);
        types.push({'type': importType, 'path': importPath});
      }
      var semicolon = {};
      semicolon.id = ';';
      tokenizer.next(semicolon);
      return true;
    }
    return false;
  }

  readDoc() {
    var tokenizer = this.tokenizer;
    var docToken = {};
    docToken.id = 'doc';
    docToken.optional = true;
    var doc = tokenizer.expect(docToken);
    if (doc) {
      return doc.val;
    }
    return undefined;
  }

  readAnnotations(obj) {
    var tokenizer = this.tokenizer;
    var annotationToken = {};
    annotationToken.id = 'annotation';
    annotationToken.optional = true;
    while (tokenizer.expect(annotationToken)) {
      var key = tokenizer.next().val;
      var value = tokenizer.next().val;
      obj[key] = value;
    }
  }

  readName() {
    var tokenizer = this.tokenizer;
    var nameToken = {};
    nameToken.id = 'name';
    nameToken.optional = true;
    var name = tokenizer.expect(nameToken);
    if (name) {
      return name.val;
    }
    return undefined;
  }

  readType(opts, implicit) {
    opts = opts || {};
    this.readAnnotations(opts);
    var idToken = {};
    idToken.id = 'type';
    opts.type = this.tokenizer.next(idToken).val;
    switch (opts.type) {
      case 'map':
      case 'array':
        return this.readArray(opts);
      case 'enum':
        return this.readEnum(opts);
      case 'fixed':
        return this.readFixed(opts, implicit);
      case 'record':
        return this.readRecord(opts);
      case 'error':
        return this.readError(opts);
      case 'protocol':
        if (Object.keys(opts).length !== 1) {
          throw new Error("Unknown protocol type");
        }
        return this.readProtocol();
      default: {
        var ref = this.types[opts.type];
        if (ref) {
          delete opts.type;
          utils.copyDefaults(ref, opts);
        }
        return Object.keys(opts).length === 1 ? opts : opts.type;
      }
    }
  }

  readArray(opts) {
    var tokenizer = this.tokenizer;
    var openBrace = {};
    openBrace.id = '{';
    openBrace.optional = true;
    if (!tokenizer.expect(openBrace)) {
      var idToken = {};
      idToken.id = 'array';
      opts.name = tokenizer.next(idToken).val;
      var openBrace2 = {};
      openBrace2.id = '{';
      tokenizer.next(openBrace2);
    }
    opts.items = [];
    var closeBrace = {};
    closeBrace.id = '}';
    closeBrace.optional = true;
    while (!tokenizer.expect(closeBrace)) {
      opts.items.push(this.readField());
      var semicolon = {};
      semicolon.id = ';';
      tokenizer.next(semicolon);
    }
    return opts;
  }

  readEnum(opts) {
    var tokenizer = this.tokenizer;
    var openBrace = {};
    openBrace.id = '{';
    openBrace.optional = true;
    if (!tokenizer.expect(openBrace)) {
      var idToken = {};
      idToken.id = 'enum';
      opts.name = tokenizer.next(idToken).val;
      var openBrace2 = {};
      openBrace2.id = '{';
      tokenizer.next(openBrace2);
    }
    opts.symbols = [];
    var closeBrace = {};
    closeBrace.id = '}';
    closeBrace.optional = true;
    var comma = {};
    comma.id = ',';
    do {
      opts.symbols.push(tokenizer.next().val);
    } while (!tokenizer.expect(closeBrace) && tokenizer.expect(comma));
    return opts;
  }

  readFixed(opts, implicit) {
    var tokenizer = this.tokenizer;
    var openParen = {};
    openParen.id = '(';
    openParen.optional = true;
    if (!tokenizer.expect(openParen)) {
      var idToken = {};
      idToken.id = 'fixed';
      opts.name = tokenizer.next(idToken).val;
      var openParen2 = {};
      openParen2.id = '(';
      tokenizer.next(openParen2);
    }
    opts.size = parseInt(tokenizer.next({'id': 'size'}).val);
    var closeParen = {};
    closeParen.id = ')';
    tokenizer.next(closeParen);
    return opts;
  }

  readRecord(opts) {
    var tokenizer = this.tokenizer;
    var name = this.readName();
    var fields = [];
    this.readFields(fields, name);
    opts.name = name;
    opts.fields = fields;
    return opts;
  }

  readError(opts) {
    var tokenizer = this.tokenizer;
    var name = this.readName();
    var fields = [];
    this.readFields(fields, name);
    opts.name = name;
    opts.fields = fields;
    return opts;
  }

  readProtocol() {
    var tokenizer = this.tokenizer;
    var messages = [];
    var openBrace = {};
    openBrace.id = '{';
    tokenizer.next(openBrace);
    var closeBrace = {};
    closeBrace.id = '}';
    closeBrace.optional = true;
    var comma = {};
    comma.id = ',';
    do {
      messages.push(this.readMessage());
    } while (!tokenizer.expect(closeBrace) && tokenizer.expect(comma));
    return messages;
  }

  readMessage() {
    var tokenizer = this.tokenizer;
    var result = {};
    result.name = tokenizer.next().val;
    var openParen = {};
    openParen.id = '(';
    openParen.optional = true;
    if (!tokenizer.expect(openParen)) {
      var idToken = {};
      idToken.id = 'message';
      result.name = tokenizer.next(idToken).val;
      var openParen2 = {};
      openParen2.id = '(';
      tokenizer.next(openParen2);
    }
    result.request = [];
    var closeParen = {};
    closeParen.id = ')';
    closeParen.optional = true;
    var comma = {};
    comma.id = ',';
    do {
      result.request.push(this.readField());
    } while (!tokenizer.expect(closeParen) && tokenizer.expect(comma));
    var response = tokenizer.next();
    switch (response.id) {
      case 'void':
        result.response = 'void';
        var semicolon = {};
        semicolon.id = ';';
        tokenizer.next(semicolon);
        break;
      case 'throws':
        result.response = 'throws';
        var semicolon2 = {};
        semicolon2.id = ';';
        tokenizer.next(semicolon2);
        break;
      case ';':
        break;
      default:
        throw tokenizer.error("Unexpected token", response);
    }
    return result;
  }

  readField() {
    var result = {};
    result.type = this.readType();
    result.name = this.tokenizer.next().val;
    return result;
  }

  readImplicit(types, implicit) {
    var pos = this.tokenizer.pos;
    var name = this.readName();
    var type = this.readType({}, true);
    var result = this.readImplicit(types, true);
    if (!result) {
      if (name) {
        if (typeof type === 'undefined') {
          type = {'doc': name, 'type': type};
        } else if (type.doc === undefined) {
          type.doc = name;
        }
      }
      types.push(type);
      var semicolon = {};
      semicolon.id = ';';
      this.tokenizer.next(semicolon);
    }
    return result;
  }
};

var Tokenizer = class {
  constructor(source) {
    this.source = source;
    this.pos = 0;
  }

  next(opts) {
    var token = {};
    token.source = this.source;
    token.id = undefined;
    token.val = undefined;
    var ch = this.skipWhitespace(opts && opts.optional);
    if (typeof ch === 'undefined') {
      token.id = 'eof';
    } else {
      var match = this.source.charAt(this.pos);
      if (!match) {
        token.id = 'eof';
      } else {
        if (opts && opts.id === 'id') {
          token.id = 'id';
          token.val = match;
        } else {
          if (match === '"') {
            token.id = 'string';
            token.val = this.readString();
          } else if (/[0-9]/.test(match)) {
            token.id = 'number';
            token.val = this.readNumber();
          } else if (/[`A-Za-z_.]/.test(match)) {
            token.id = 'name';
            token.val = this.readName();
          } else {
            token.id = match;
            token.val = match;
            this.pos++;
          }
        }
        token.pos = this.source.indexOf(token.val, this.pos);
        if (token.id === 'string') {
          try {
            token.val = JSON.parse(token.val);
          } catch (e) {
            throw this.error("Invalid string", token);
          }
        } else if (token.id === 'name') {
          token.val = token.val.replace(/`/g, '');
        }
      }
    }
    var error;
    if (opts && opts.id && opts.id !== token.id) {
      error = this.error("Expected " + opts.id + " but found " + token.id, token);
    } else {
      if (opts && opts.val && opts.val !== token.val) {
        error = this.error("Expected " + opts.val + " but found " + token.val, token);
      }
    }
    if (!error) {
      return token;
    } else {
      if (opts && opts.optional) {
        this.pos = token.pos;
        return undefined;
      } else {
        throw error;
      }
    }
  }

  error(msg, token) {
    var isObj = typeof token === 'object';
    var source = isObj ? token.source : token;
    var pos = 0;
    var line = 1;
    var col = 0;
    for (var i = 0; i < source.length; i++) {
      if (source.charAt(i) === '\n') {
        line++;
        col = 0;
      }
      col++;
    }
    var message = isObj ? "Syntax error at line " + utils.lineCount(token) + ": " + msg : msg;
    var err = new Error(message);
    err.token = isObj ? token : undefined;
    err.line = line;
    err.column = source.length - pos;
    return err;
  }

  skipWhitespace(optional) {
    var pos = this.pos;
    var source = this.source;
    var ch;
    while ((ch = source.charAt(pos)) && /\s/.test(ch)) {
      this.pos++;
    }
    var lastPos = this.pos;
    if (ch === '/') {
      switch (source.charAt(this.pos + 1)) {
        case '/':
          this.pos += 2;
          while ((ch = source.charAt(this.pos)) && ch !== '\n') {
            this.pos++;
          }
          return this.next(optional);
        case '*':
          this.pos += 2;
          var inComment = false;
          if (source.charAt(this.pos) === '*') {
            inComment = true;
          }
          while (ch = source.charAt(this.pos++)) {
            if (ch === '*' && source.charAt(this.pos) === '/') {
              this.pos++;
              if (inComment && optional) {
                return extractJavadoc(source.substring(lastPos, this.pos - 2));
              }
              return this.next(optional);
            }
          }
          throw this.error("Unterminated comment", lastPos);
      }
    }
    return ch;
  }

  expect(opts) {
    var token = this.next(opts);
    if (token === undefined) {
      return false;
    }
    return token;
  }

  readString() {
    var pos = this.pos - 1;
    var source = this.source;
    var ch;
    while (ch = source.charAt(pos)) {
      if (ch === '"') {
        return pos - 1;
      }
      if (ch === '\\') {
        pos += 2;
      } else {
        pos++;
      }
    }
    throw this.error("Unterminated string", pos - 1);
  }

  readNumber() {
    var pos = utils.skipWhitespace(this.source, this.pos);
    if (pos < 0) {
      throw this.error("Invalid number", pos);
    }
    return pos;
  }
};

function extractJavadoc(comment) {
  var lines = comment.replace(/^[ \t]+|[ \t]+$/g, '').split('\n').map((line, i) => {
    return i ? line.replace(/^\s*\*\s?/, '') : line;
  });
  while (lines.length && !lines[0]) {
    lines.shift();
  }
  while (lines.length && !lines[lines.length - 1]) {
    lines.pop();
  }
  return lines.join('\n');
}

function protocolNamespace(protocol) {
  if (protocol.protocol) {
    return protocol.protocol;
  }
  var match = /^(.*)\.[^.]+$/.exec(protocol.namespace);
  return match ? match[1] : undefined;
}

var exports = {};
exports.Tokenizer = Tokenizer;
exports.assembleProtocol = assembleProtocol;
exports.read = read;
exports.fromBuffer = Reader.fromBuffer;
exports.fromString = Reader.fromString;
module.exports = exports;
