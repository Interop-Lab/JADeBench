var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && (typeof from === "object" || typeof from === "function")) {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target, mod));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

var content_hasher_exports = {};
__export(content_hasher_exports, {
  BLOCK_SIZE: () => BLOCK_SIZE,
  DropboxContentHasher: () => DropboxContentHasher,
  contentHash: () => contentHash
});
module.exports = __toCommonJS(content_hasher_exports);

var import_crypto = __toESM(require("crypto"));
var BLOCK_SIZE = 4 * 1024 * 1024;

var DropboxContentHasher = class _DropboxContentHasher {
  constructor() {
    this._blockHasher = import_crypto.default.createHash("sha256");
    this._overallHasher = import_crypto.default.createHash("sha256");
    this._blockPos = 0;
    this._finished = false;
  }

  update(data) {
    this._ensureNotFinished();
    const buffer = _DropboxContentHasher._convertToBuffer(data);
    let pos = 0;
    while (pos < buffer.length) {
      if (this._blockPos === BLOCK_SIZE) {
        this._finishBlock();
      }
      const spaceInBlock = BLOCK_SIZE - this._blockPos;
      const remaining = buffer.length - pos;
      const toWrite = Math.min(spaceInBlock, remaining);
      this._blockHasher.update(buffer.slice(pos, pos + toWrite));
      this._blockPos += toWrite;
      pos += toWrite;
    }
    return this;
  }

  digest(encoding) {
    this._ensureNotFinished();
    if (this._blockPos > 0) {
      this._finishBlock();
    }
    this._finished = true;
    if (encoding === void 0) {
      return this._overallHasher.digest();
    }
    if (encoding === "hex") {
      throw new TypeError("DropboxContentHasher: encoding must not be 'hex'");
    }
    return this._overallHasher.digest(encoding);
  }

  _finishBlock() {
    this._overallHasher.update(this._blockHasher.digest());
    this._blockHasher = import_crypto.default.createHash("sha256");
    this._blockPos = 0;
  }

  _ensureNotFinished() {
    if (this._finished) {
      throw new Error("DropboxContentHasher: can't update or digest after finish");
    }
  }

  static _convertToBuffer(data) {
    if (Buffer.isBuffer(data)) {
      return data;
    }
    if (data instanceof ArrayBuffer) {
      return Buffer.from(data);
    }
    if (ArrayBuffer.isView(data)) {
      return Buffer.from(data.buffer, data.byteOffset, data.byteLength);
    }
    throw new TypeError("DropboxContentHasher: data must be a Buffer, ArrayBuffer, or ArrayBufferView");
  }
};

function contentHash(data) {
  return new DropboxContentHasher().update(data).digest("hex");
}

var _0x4ae5a4 = {};
_0x4ae5a4.BLOCK_SIZE = BLOCK_SIZE;
_0x4ae5a4.DropboxContentHasher = DropboxContentHasher;
_0x4ae5a4.contentHash = contentHash;
module.exports = _0x4ae5a4;
