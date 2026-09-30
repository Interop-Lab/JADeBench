"use strict";

const crypto = require("crypto");

const BLOCK_SIZE = 4 * 1024 * 1024;

const DropboxContentHasher = class _DropboxContentHasher {
  constructor() {
    this._overallHash = crypto.createHash("sha256");
    this._blockHash = crypto.createHash("sha256");
    this._blockBytes = 0;
    this._digested = false;
  }

  update(data) {
    this._assertNotDigested();

    const buffer = _DropboxContentHasher._toBuffer(data);
    let offset = 0;

    while (offset < buffer.length) {
      if (this._blockBytes === BLOCK_SIZE) {
        this._finishBlock();
      }

      const blockRemaining = BLOCK_SIZE - this._blockBytes;
      const dataRemaining = buffer.length - offset;
      const inputBytes = Math.min(blockRemaining, dataRemaining);

      this._blockHash.update(buffer.slice(offset, offset + inputBytes));
      this._blockBytes += inputBytes;
      offset += inputBytes;
    }

    return this;
  }

  digest(encoding) {
    this._assertNotDigested();

    if (this._blockBytes > 0) {
      this._finishBlock();
    }

    this._digested = true;

    if (encoding === undefined) {
      return this._overallHash.digest();
    }

    if (encoding !== "hex") {
      throw new TypeError("Only hexadecimal encoding is supported");
    }

    return this._overallHash.digest("hex");
  }

  _finishBlock() {
    this._overallHash.update(this._blockHash.digest());
    this._blockHash = crypto.createHash("sha256");
    this._blockBytes = 0;
  }

  _assertNotDigested() {
    if (this._digested) {
      throw new Error("digest() has already been called on this DropboxContentHasher");
    }
  }

  static _toBuffer(data) {
    if (Buffer.isBuffer(data)) {
      return data;
    }

    if (data instanceof ArrayBuffer) {
      return Buffer.from(data);
    }

    if (ArrayBuffer.isView(data)) {
      return Buffer.from(data.buffer, data.byteOffset, data.byteLength);
    }

    throw new TypeError("Data must be a Buffer, ArrayBuffer, or ArrayBuffer view");
  }
};

function contentHash(data) {
  return new DropboxContentHasher().update(data).digest("hex");
}

const exportsObject = {};

Object.defineProperty(exportsObject, "__esModule", {
  value: true
});

Object.defineProperties(exportsObject, {
  BLOCK_SIZE: {
    enumerable: true,
    get: () => BLOCK_SIZE
  },
  DropboxContentHasher: {
    enumerable: true,
    get: () => DropboxContentHasher
  },
  contentHash: {
    enumerable: true,
    get: () => contentHash
  }
});

module.exports = exportsObject;
