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
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// ../work/dropbox__dropbox-sdk-js/src/content-hasher.js
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
    this.overallHasher = import_crypto.default.createHash("sha256");
    this.blockHasher = import_crypto.default.createHash("sha256");
    this.blockPosition = 0;
    this.finished = false;
  }
  /**
   * Adds binary data to the hash.
   *
   * @param {Buffer|Uint8Array|ArrayBuffer} data Binary data to hash.
   * @returns {DropboxContentHasher} This hasher instance.
   */
  update(data) {
    this.assertNotFinished();
    const bytes = _DropboxContentHasher.toBuffer(data);
    let position = 0;
    while (position < bytes.length) {
      if (this.blockPosition === BLOCK_SIZE) {
        this.finishBlock();
      }
      const remainingBlockSpace = BLOCK_SIZE - this.blockPosition;
      const remainingData = bytes.length - position;
      const length = Math.min(remainingBlockSpace, remainingData);
      this.blockHasher.update(
        bytes.subarray(position, position + length)
      );
      this.blockPosition += length;
      position += length;
    }
    return this;
  }
  /**
   * Returns the final Dropbox content hash.
   *
   * @param {'hex'|undefined} encoding Optional output encoding.
   * @returns {Buffer|string} Binary digest, or a hexadecimal string.
   */
  digest(encoding) {
    this.assertNotFinished();
    if (this.blockPosition > 0) {
      this.finishBlock();
    }
    this.finished = true;
    if (encoding === void 0) {
      return this.overallHasher.digest();
    }
    if (encoding !== "hex") {
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
      throw new Error(
        "DropboxContentHasher cannot be used after digest() has been called"
      );
    }
  }
  static toBuffer(data) {
    if (Buffer.isBuffer(data)) {
      return data;
    }
    if (data instanceof ArrayBuffer) {
      return Buffer.from(data);
    }
    if (ArrayBuffer.isView(data)) {
      return Buffer.from(
        data.buffer,
        data.byteOffset,
        data.byteLength
      );
    }
    throw new TypeError(
      "DropboxContentHasher.update() expects a Buffer, Uint8Array, or ArrayBuffer"
    );
  }
};
function contentHash(data) {
  return new DropboxContentHasher().update(data).digest("hex");
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BLOCK_SIZE,
  DropboxContentHasher,
  contentHash
});
