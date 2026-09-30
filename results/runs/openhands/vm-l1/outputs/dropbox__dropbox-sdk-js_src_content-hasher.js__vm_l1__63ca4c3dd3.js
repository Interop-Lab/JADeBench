const crypto = require("crypto");

const BLOCK_SIZE = 4 * 1024 * 1024;

const DropboxContentHasher = class _DropboxContentHasher {
  constructor() {
    this.overallHasher = crypto.createHash("sha256");
    this.blockHasher = crypto.createHash("sha256");
    this.blockPosition = 0;
    this.finished = false;
  }

  update(input) {
    this.assertNotFinished();

    const buffer = _DropboxContentHasher.toBuffer(input);
    let offset = 0;

    while (offset < buffer.length) {
      if (this.blockPosition === BLOCK_SIZE) {
        this.finishBlock();
      }

      const remainingBlockSpace = BLOCK_SIZE - this.blockPosition;
      const chunkSize = Math.min(
        remainingBlockSpace,
        buffer.length - offset,
      );

      this.blockHasher.update(buffer.subarray(offset, offset + chunkSize));
      this.blockPosition += chunkSize;
      offset += chunkSize;
    }

    return this;
  }

  digest(encoding) {
    this.assertNotFinished();

    if (this.blockPosition > 0) {
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

  static toBuffer(input) {
    if (Buffer.isBuffer(input)) {
      return input;
    }

    if (input instanceof ArrayBuffer) {
      return Buffer.from(input);
    }

    if (ArrayBuffer.isView(input)) {
      return Buffer.from(input.buffer, input.byteOffset, input.byteLength);
    }

    throw new TypeError(
      "DropboxContentHasher.update() expects a Buffer, Uint8Array, or ArrayBuffer",
    );
  }
};

function contentHash(input) {
  return new DropboxContentHasher().update(input).digest("hex");
}

Object.defineProperties(module.exports, {
  __esModule: {
    value: true,
  },
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
