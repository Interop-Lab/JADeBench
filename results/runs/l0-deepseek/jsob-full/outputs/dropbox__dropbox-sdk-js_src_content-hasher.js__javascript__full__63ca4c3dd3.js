const crypto = require('crypto');

const BLOCK_SIZE = 4 * 1024 * 1024;

class DropboxContentHasher {
  constructor() {
    this._overallHasher = crypto.createHash('sha256');
    this._blockHasher = crypto.createHash('sha256');
    this._blockPos = 0;
    this._done = false;
  }

  update(data) {
    this._ensureNotDone();
    const input = DropboxContentHasher._toBuffer(data);
    let offset = 0;
    while (offset < input.length) {
      if (this._blockPos === BLOCK_SIZE) {
        this._finishBlock();
      }
      const spaceInBlock = BLOCK_SIZE - this._blockPos;
      const remaining = input.length - offset;
      const chunkSize = Math.min(spaceInBlock, remaining);
      this._blockHasher.update(input.slice(offset, offset + chunkSize));
      this._blockPos += chunkSize;
      offset += chunkSize;
    }
    return this;
  }

  digest(encoding) {
    this._ensureNotDone();
    if (this._blockPos > 0) {
      this._finishBlock();
    }
    this._done = true;
    if (encoding === undefined) {
      return this._overallHasher.digest();
    }
    if (encoding === 'hex') {
      return this._overallHasher.digest('hex');
    }
    throw new TypeError('Unsupported encoding');
  }

  _finishBlock() {
    this._overallHasher.update(this._blockHasher.digest());
    this._blockHasher = crypto.createHash('sha256');
    this._blockPos = 0;
  }

  _ensureNotDone() {
    if (this._done) {
      throw new Error('Digest already called');
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
    throw new TypeError('Unsupported data type');
  }
}

function contentHash(data) {
  return new DropboxContentHasher().update(data).digest('hex');
}

module.exports = {
  BLOCK_SIZE,
  DropboxContentHasher,
  contentHash,
};
