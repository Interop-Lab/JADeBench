"use strict";

const crypto = require("crypto");

const BLOCK_SIZE = 4 * 1024 * 1024;

class DropboxContentHasher {
  constructor() {
    this.overallHasher = crypto.createHash("sha256");
    this.blockHasher = crypto.createHash("sha256");
    this.blockPosition = 0;
    this.finished = false;
  }

  update(data) {
    this.assertNotFinished();
    const buffer = DropboxContentHasher.toBuffer(data);

    let position = 0;
    while (position < buffer.length) {
      if (this.blockPosition === BLOCK_SIZE) {
        this.finishBlock();
      }

      const bytesToHash = Math.min(
        BLOCK_SIZE - this.blockPosition,
        buffer.length - position,
      );
      const chunk = buffer.subarray(position, position + bytesToHash);

      this.blockHasher.update(chunk);
      this.blockPosition += chunk.length;
      position += chunk.length;
    }

    return this;
  }

  digest(encoding) {
    this.assertNotFinished();

    if (this.blockPosition > 0) {
      this.finishBlock();
    }
    this.finished = true;

    const hash = this.overallHasher.digest("hex");
    if (encoding && encoding !== "hex") {
      throw new TypeError("DropboxContentHasher only supports hex encoding");
    }
    return hash;
  }

  finishBlock() {
    this.overallHasher.update(this.blockHasher.digest());
    this.blockHasher = crypto.createHash("sha256");
    this.blockPosition = 0;
  }

  assertNotFinished() {
    if (this.finished) {
      throw new Error(
        "DropboxContentHasher cannot be used after digest() has been called",
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
      return Buffer.from(data.buffer, data.byteOffset, data.byteLength);
    }
    throw new TypeError(
      "DropboxContentHasher.update() expects a Buffer, Uint8Array, or ArrayBuffer",
    );
  }
}

function contentHash(data) {
  return new DropboxContentHasher().update(data).digest("hex");
}

const contentHasherExports = {};
Object.defineProperty(contentHasherExports, "__esModule", { value: true });
Object.defineProperties(contentHasherExports, {
  BLOCK_SIZE: { enumerable: true, get: () => BLOCK_SIZE },
  DropboxContentHasher: {
    enumerable: true,
    get: () => DropboxContentHasher,
  },
  contentHash: { enumerable: true, get: () => contentHash },
});

module.exports = contentHasherExports;
