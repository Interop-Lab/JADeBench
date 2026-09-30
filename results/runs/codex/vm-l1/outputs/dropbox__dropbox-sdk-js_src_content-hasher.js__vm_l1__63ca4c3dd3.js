"use strict";

const crypto = require("crypto");

const BLOCK_SIZE = 4 * 1024 * 1024;

const DropboxContentHasher = class _DropboxContentHasher {
  constructor() {
    this.overallHasher = crypto.createHash("sha256");
    this.blockHasher = crypto.createHash("sha256");
    this.blockPosition = 0;
    this.finished = false;
  }

  update(data) {
    this.assertNotFinished();

    const buffer = DropboxContentHasher.toBuffer(data);
    let offset = 0;

    while (offset < buffer.length) {
      const remaining = BLOCK_SIZE - this.blockPosition;
      const chunk = buffer.subarray(offset, offset + remaining);
      this.blockHasher.update(chunk);
      this.blockPosition += chunk.length;
      offset += chunk.length;

      if (this.blockPosition === BLOCK_SIZE) {
        this.finishBlock();
      }
    }

    return this;
  }

  digest(encoding) {
    this.assertNotFinished();

    if (this.blockPosition > 0) {
      this.finishBlock();
    }

    this.finished = true;

    if (encoding !== undefined && encoding !== "hex") {
      throw new TypeError("DropboxContentHasher only supports hex encoding");
    }

    return this.overallHasher.digest(encoding);
  }

  finishBlock() {
    this.overallHasher.update(this.blockHasher.digest());
    this.blockHasher = crypto.createHash("sha256");
    this.blockPosition = 0;
  }

  assertNotFinished() {
    if (this.finished) {
      throw new Error("DropboxContentHasher cannot be used after digest() has been called");
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
      return Buffer.from(data.buffer, data.byteOffset, data.byteLength);
    }

    throw new TypeError("DropboxContentHasher.update() expects a Buffer, Uint8Array, or ArrayBuffer");
  }
};

function contentHash(data) {
  return new DropboxContentHasher().update(data).digest("hex");
}

Object.defineProperty(module.exports, "__esModule", { value: true });
Object.defineProperties(module.exports, {
  BLOCK_SIZE: {
    enumerable: true,
    get: () => BLOCK_SIZE,
  },
  DropboxContentHasher: {
    enumerable: true,
    get: () => DropboxContentHasher,
  },
  contentHash: {
    enumerable: true,
    get: () => contentHash,
  },
});
