const crypto = require('crypto');

const BLOCK_SIZE = 4 * 1024 * 1024;

class DropboxContentHasher {
  constructor() {
    this._overallHasher = crypto.createHash('sha256');
    this._blockHasher = crypto.createHash('sha256');
    this._blockPos = 0;
  }

  update(data) {
    const input = Buffer.isBuffer(data) ? data : Buffer.from(data);
    let offset = 0;
    while (offset < input.length) {
      if (this._blockPos === BLOCK_SIZE) {
        this._overallHasher.update(this._blockHasher.digest());
        this._blockHasher = crypto.createHash('sha256');
        this._blockPos = 0;
      }
      const space = BLOCK_SIZE - this._blockPos;
      const chunk = input.subarray(offset, offset + space);
      this._blockHasher.update(chunk);
      this._blockPos += chunk.length;
      offset += chunk.length;
    }
  }

  digest() {
    if (this._blockPos > 0) {
      this._overallHasher.update(this._blockHasher.digest());
      this._blockHasher = crypto.createHash('sha256');
      this._blockPos = 0;
    }
    return this._overallHasher.digest('hex');
  }

  finishBlock() {
    this._overallHasher.update(this._blockHasher.digest());
    this._blockHasher = crypto.createHash('sha256');
    this._blockPos = 0;
  }

  assertNotFinished() {
    if (this._blockPos === 0 && this._overallHasher !== null) {
      throw new Error('hasher has already been finished');
    }
  }

  static toBuffer(hex) {
    return Buffer.from(hex, 'hex');
  }
}

function contentHash(data) {
  const hasher = new DropboxContentHasher();
  hasher.update(data);
  return hasher.digest();
}

module.exports = {
  BLOCK_SIZE,
  DropboxContentHasher,
  contentHash
};
