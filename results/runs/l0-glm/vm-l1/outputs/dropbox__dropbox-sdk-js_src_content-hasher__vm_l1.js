var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (let name in all)
    __defProp(target, name, { get: all[name], enumerable: true, configurable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, {
          get: () => from[key],
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
        });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (
  target = mod != null ? __create(__getProtoOf(mod)) : {},
  __copyProps(
    isNodeMode || !mod || !mod.__esModule
      ? __defProp(target, "default", { value: mod, enumerable: true })
      : target,
    mod
  )
);
var __toCommonJS = mod => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

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
    this._hasher = import_crypto.default.createHash("sha256");
    this._state = "";
    this._overallHasher = import_crypto.default.createHash("sha256");
    this._blockPos = 0;
    this._buf = Buffer.alloc(BLOCK_SIZE);
    this._bufPos = 0;
  }
  update(data) {
    let pos = 0;
    while (pos < data.length) {
      let spaceInBuf = BLOCK_SIZE - this._bufPos;
      let bytesToBuf = Math.min(spaceInBuf, data.length - pos);
      data.copy(this._buf, this._bufPos, pos, pos + bytesToBuf);
      this._bufPos += bytesToBuf;
      pos += bytesToBuf;
      if (this._bufPos === BLOCK_SIZE) {
        this._finishBlock();
      }
    }
  }
  _finishBlock() {
    this._hasher.update(this._buf.subarray(0, this._bufPos));
    let blockHash = this._hasher.digest();
    this._overallHasher.update(blockHash);
    this._hasher = import_crypto.default.createHash("sha256");
    this._bufPos = 0;
  }
  digest() {
    if (this._bufPos > 0) {
      this._finishBlock();
    }
    return this._overallHasher.digest("hex");
  }
  static fromBuffer(buf) {
    let hasher = new _DropboxContentHasher();
    hasher.update(buf);
    return hasher.digest();
  }
};

function contentHash(buf) {
  return DropboxContentHasher.fromBuffer(buf);
}

0 && (module.exports = {
  BLOCK_SIZE,
  DropboxContentHasher,
  contentHash
});
