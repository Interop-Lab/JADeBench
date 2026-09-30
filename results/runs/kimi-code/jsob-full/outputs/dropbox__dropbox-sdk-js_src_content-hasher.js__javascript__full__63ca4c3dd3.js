"use strict";

const { createHash } = require("crypto");

const BLOCK_SIZE = 4 * 1024 * 1024;

class DropboxContentHasher {
  constructor() {
    this.overallHasher = createHash("sha256");
    this.blockHasher = createHash("sha256");
    this.blockPos = 0;
    this.finished = false;
  }

  update(data) {
    this.assertNotFinished();

    const buffer = DropboxContentHasher.toBuffer(data);
    let inputPos = 0;

    while (inputPos < buffer.length) {
      if (this.blockPos === BLOCK_SIZE) {
        this.finishBlock();
      }

      const blockSpace = BLOCK_SIZE - this.blockPos;
      const inputRemaining = buffer.length - inputPos;
      const bytesToHash = Math.min(blockSpace, inputRemaining);
      this.blockHasher.update(buffer.subarray(inputPos, inputPos + bytesToHash));
      this.blockPos += bytesToHash;
      inputPos += bytesToHash;
    }

    return this;
  }

  digest(encoding) {
    this.assertNotFinished();

    if (this.blockPos > 0) {
      this.finishBlock();
    }
    this.finished = true;

    if (encoding === undefined) {
      return this.overallHasher.digest();
    }
    if (encoding !== "hex") {
      throw new TypeError("DropboxContentHasher only supports hex encoding");
    }
    return this.overallHasher.digest("hex");
  }

  finishBlock() {
    this.overallHasher.update(this.blockHasher.digest());
    this.blockHasher = createHash("sha256");
    this.blockPos = 0;
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
    throw new TypeError(
      "DropboxContentHasher.update() expects a Buffer, Uint8Array, or ArrayBuffer",
    );
  }
}

function contentHash(data) {
  return new DropboxContentHasher().update(data).digest("hex");
}

Object.defineProperty(exports, "__esModule", { value: true });
Object.defineProperties(exports, {
  BLOCK_SIZE: { enumerable: true, get: () => BLOCK_SIZE },
  DropboxContentHasher: { enumerable: true, get: () => DropboxContentHasher },
  contentHash: { enumerable: true, get: () => contentHash },
});
