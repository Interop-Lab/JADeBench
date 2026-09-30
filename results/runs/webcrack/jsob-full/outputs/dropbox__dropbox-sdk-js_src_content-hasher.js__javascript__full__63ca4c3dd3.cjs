var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (_0x12bad3, _0x422f06) => {
  for (var _0x17972f in _0x422f06) {
    __defProp(_0x12bad3, _0x17972f, {
      get: _0x422f06[_0x17972f],
      enumerable: true
    });
  }
};
var __copyProps = (_0x3d114f, _0x441017, _0x2d0e60, _0x2ef394) => {
  if (_0x441017 && typeof _0x441017 === "object" || typeof _0x441017 === "function") {
    for (let _0x5914b6 of __getOwnPropNames(_0x441017)) {
      if (!__hasOwnProp.call(_0x3d114f, _0x5914b6) && _0x5914b6 !== _0x2d0e60) {
        __defProp(_0x3d114f, _0x5914b6, {
          get: () => _0x441017[_0x5914b6],
          enumerable: !(_0x2ef394 = __getOwnPropDesc(_0x441017, _0x5914b6)) || _0x2ef394.enumerable
        });
      }
    }
  }
  return _0x3d114f;
};
var __toESM = (_0x4cac14, _0x1de8bb, _0x529d00) => {
  _0x529d00 = _0x4cac14 != null ? __create(__getProtoOf(_0x4cac14)) : {};
  return __copyProps(_0x1de8bb || !_0x4cac14 || !_0x4cac14.__esModule ? __defProp(_0x529d00, "default", {
    value: _0x4cac14,
    enumerable: true
  }) : _0x529d00, _0x4cac14);
};
var _0x17fa20 = {
  value: true
};
var __toCommonJS = _0x20ee82 => __copyProps(__defProp({}, "__esModule", _0x17fa20), _0x20ee82);
var content_hasher_exports = {};
var _0x446829 = {
  BLOCK_SIZE: () => BLOCK_SIZE,
  DropboxContentHasher: () => DropboxContentHasher,
  contentHash: () => contentHash
};
__export(content_hasher_exports, _0x446829);
module.exports = __toCommonJS(content_hasher_exports);
var import_crypto = __toESM(require("crypto"));
var BLOCK_SIZE = 4194304;
var DropboxContentHasher = class _DropboxContentHasher {
  constructor() {
    this.overallHasher = import_crypto.default.createHash("sha256");
    this.blockHasher = import_crypto.default.createHash("sha256");
    this.blockPosition = 0;
    this.finished = false;
  }
  update(_0x359c09) {
    this.assertNotFinished();
    const _0x1d94e1 = _DropboxContentHasher.toBuffer(_0x359c09);
    let _0x4133d5 = 0;
    while (_0x4133d5 < _0x1d94e1.length) {
      if (this.blockPosition === BLOCK_SIZE) {
        this.finishBlock();
      }
      const _0x5eef2c = BLOCK_SIZE - this.blockPosition;
      const _0x4700f8 = _0x1d94e1.length - _0x4133d5;
      const _0x15f9d7 = Math.min(_0x5eef2c, _0x4700f8);
      this.blockHasher.update(_0x1d94e1.subarray(_0x4133d5, _0x4133d5 + _0x15f9d7));
      this.blockPosition += _0x15f9d7;
      _0x4133d5 += _0x15f9d7;
    }
    return this;
  }
  digest(_0x28ae36) {
    this.assertNotFinished();
    if (this.blockPosition > 0) {
      this.finishBlock();
    }
    this.finished = true;
    if (_0x28ae36 === undefined) {
      return this.overallHasher.digest();
    }
    if (_0x28ae36 !== "hex") {
      throw new TypeError("DropboxContentHasher only supports hex encoding");
    }
    return this.overallHasher.digest("hex");
  }
  finishBlock() {
    this.overallHasher.update(this.blockHasher.digest());
    this.blockHasher = import_crypto.default.createHash("sha256");
    this.blockPosition = 0;
  }
  assertNotFinished() {
    if (this.finished) {
      throw new Error("DropboxContentHasher cannot be used after digest() has been called");
    }
  }
  static toBuffer(_0x3f11d5) {
    if (Buffer.isBuffer(_0x3f11d5)) {
      return _0x3f11d5;
    }
    if (_0x3f11d5 instanceof ArrayBuffer) {
      return Buffer.from(_0x3f11d5);
    }
    if (ArrayBuffer.isView(_0x3f11d5)) {
      return Buffer.from(_0x3f11d5.buffer, _0x3f11d5.byteOffset, _0x3f11d5.byteLength);
    }
    throw new TypeError("DropboxContentHasher.update() expects a Buffer, Uint8Array, or ArrayBuffer");
  }
};
function contentHash(_0x56cbec) {
  return new DropboxContentHasher().update(_0x56cbec).digest("hex");
}
var _0x4ae5a4 = {
  BLOCK_SIZE: BLOCK_SIZE,
  DropboxContentHasher: DropboxContentHasher,
  contentHash: contentHash
};
if (0) {
  module.exports = _0x4ae5a4;
}