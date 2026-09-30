const crypto = require("crypto");

const BLOCK_SIZE = 4 * 1024 * 1024;

class DropboxContentHasher {
  constructor() {
    this._blockHasher = crypto.createHash("sha256");
    this._overallHasher = crypto.createHash("sha256");
    this._blockPos = 0;
  }

  update(data) {
    let offset = 0;
    while (offset < data.length) {
      if (this._blockPos === BLOCK_SIZE) {
        this._overallHasher.update(this._blockHasher.digest());
        this._blockHasher = crypto.createHash("sha256");
        this._blockPos = 0;
      }

      const spaceInBlock = BLOCK_SIZE - this._blockPos;
      const toWrite = Math.min(data.length - offset, spaceInBlock);
      this._blockHasher.update(data.slice(offset, offset + toWrite));
      this._blockPos += toWrite;
      offset += toWrite;
    }
    return this;
  }

  digest(encoding) {
    if (this._blockPos > 0) {
      this._overallHasher.update(this._blockHasher.digest());
      this._blockHasher = null;
      this._blockPos = 0;
    }
    return this._overallHasher.digest(encoding);
  }

  finishBlock() {
    if (this._blockPos === BLOCK_SIZE) {
      this._overallHasher.update(this._blockHasher.digest());
      this._blockHasher = crypto.createHash("sha256");
      this._blockPos = 0;
    }
    return this;
  }

  static hash(data) {
    const hasher = new DropboxContentHasher();
    hasher.update(data);
    return hasher.digest();
  }
}

function contentHash(data) {
  return DropboxContentHasher.hash(data);
}

module.exports = {
  BLOCK_SIZE,
  DropboxContentHasher,
  contentHash
};
