"use strict";

var crypto = require("crypto");

var BLOCK_SIZE = 4 * 1024 * 1024;

var DropboxContentHasher = class DropboxContentHasher {
  constructor() {
    this.blockHashes = [];
    this.blockHasher = crypto.createHash("sha256");
    this.bytesInBlock = 0;
  }

  update(data) {
    this.assertNotFinished();

    var input = DropboxContentHasher.toBuffer(data);
    var offset = 0;

    while (offset < input.length) {
      var spaceInBlock = BLOCK_SIZE - this.bytesInBlock;
      var inputPart = input.slice(offset, offset + spaceInBlock);

      this.blockHasher.update(inputPart);
      this.bytesInBlock += inputPart.length;
      offset += inputPart.length;

      if (this.bytesInBlock === BLOCK_SIZE) {
        this.finishBlock();
      }
    }

    return this;
  }

  digest(encoding) {
    this.assertNotFinished();

    if (this.bytesInBlock > 0) {
      this.finishBlock();
    }

    var result = crypto
      .createHash("sha256")
      .update(Buffer.concat(this.blockHashes))
      .digest(encoding);

    this.blockHasher = null;
    return result;
  }

  finishBlock() {
    this.blockHashes.push(this.blockHasher.digest());
    this.blockHasher = crypto.createHash("sha256");
    this.bytesInBlock = 0;
  }

  assertNotFinished() {
    if (this.blockHasher === null) {
      throw new Error("digest() has already been called");
    }
  }

  static toBuffer(data) {
    if (Buffer.isBuffer(data)) {
      return data;
    }

    if (data instanceof ArrayBuffer) {
      return Buffer.from(data);
    }

    throw new TypeError("Expected a Buffer or ArrayBuffer");
  }
};

function contentHash(data) {
  return new DropboxContentHasher().update(data).digest("hex");
}

var exportsObject = {};

Object.defineProperty(exportsObject, "__esModule", {
  value: true
});

Object.defineProperties(exportsObject, {
  BLOCK_SIZE: {
    enumerable: true,
    get: function () {
      return BLOCK_SIZE;
    }
  },
  DropboxContentHasher: {
    enumerable: true,
    get: function () {
      return DropboxContentHasher;
    }
  },
  contentHash: {
    enumerable: true,
    get: function () {
      return contentHash;
    }
  }
});

module.exports = exportsObject;
