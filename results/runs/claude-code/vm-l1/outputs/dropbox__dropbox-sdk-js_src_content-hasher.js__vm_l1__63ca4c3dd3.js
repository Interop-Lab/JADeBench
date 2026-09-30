'use strict';

const crypto = require('crypto');

const BLOCK_SIZE = 4 * 1024 * 1024;

class DropboxContentHasher {
  constructor() {
    this.blockHash = crypto.createHash('sha256');
    this.overallHash = crypto.createHash('sha256');
    this.blockBytes = 0;
    this.finished = false;
  }

  update(data) {
    this.assertNotFinished();

    const buffer = DropboxContentHasher.toBuffer(data);
    let offset = 0;

    while (offset < buffer.length) {
      const bytesAvailable = BLOCK_SIZE - this.blockBytes;
      const bytesToHash = Math.min(bytesAvailable, buffer.length - offset);
      const end = offset + bytesToHash;

      this.blockHash.update(buffer.subarray(offset, end));
      this.blockBytes += bytesToHash;
      offset = end;

      if (this.blockBytes === BLOCK_SIZE) {
        this.finishBlock();
      }
    }

    return this;
  }

  digest(encoding) {
    this.assertNotFinished();

    if (this.blockBytes > 0) {
      this.finishBlock();
    }

    this.finished = true;
    return this.overallHash.digest(encoding);
  }

  finishBlock() {
    this.overallHash.update(this.blockHash.digest());
    this.blockHash = crypto.createHash('sha256');
    this.blockBytes = 0;
  }

  assertNotFinished() {
    if (this.finished) {
      throw new Error('Digest already called');
    }
  }

  static toBuffer(data) {
    if (Buffer.isBuffer(data)) {
      return data;
    }
    if (typeof data === 'string') {
      return Buffer.from(data);
    }
    if (data instanceof ArrayBuffer) {
      return Buffer.from(data);
    }

    throw new TypeError('Data must be a string, Buffer, or ArrayBuffer');
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
