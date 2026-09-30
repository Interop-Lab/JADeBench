const crypto = require("crypto");

const BLOCK_SIZE = 4 * 1024 * 1024;

class DropboxContentHasher {
  constructor() {
    this.blockHash = crypto.createHash("sha256");
    this.overallHash = crypto.createHash("sha256");
    this.blockPos = 0;
    this.finished = false;
  }

  update(data) {
    this.assertNotFinished();

    const input = DropboxContentHasher.toBuffer(data);
    let offset = 0;

    while (offset < input.length) {
      if (this.blockPos === BLOCK_SIZE) {
        this.finishBlock();
      }

      const remainingBlockBytes = BLOCK_SIZE - this.blockPos;
      const remainingInputBytes = input.length - offset;
      const bytesToHash = Math.min(remainingBlockBytes, remainingInputBytes);

      this.blockHash.update(input.subarray(offset, offset + bytesToHash));
      this.blockPos += bytesToHash;
      offset += bytesToHash;
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
      return this.overallHash.digest();
    }
    if (encoding !== "hex") {
      throw new TypeError("DropboxContentHasher only supports hex encoding");
    }
    return this.overallHash.digest("hex");
  }

  finishBlock() {
    this.overallHash.update(this.blockHash.digest());
    this.blockHash = crypto.createHash("sha256");
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

Object.defineProperty(module.exports, "__esModule", { value: true });
Object.defineProperties(module.exports, {
  BLOCK_SIZE: { enumerable: true, get: () => BLOCK_SIZE },
  DropboxContentHasher: {
    enumerable: true,
    get: () => DropboxContentHasher,
  },
  contentHash: { enumerable: true, get: () => contentHash },
});
