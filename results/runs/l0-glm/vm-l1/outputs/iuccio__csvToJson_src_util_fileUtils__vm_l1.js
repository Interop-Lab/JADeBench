'use strict';

const { FileOperationError } = require('../work/iuccio__csvToJson/src/core/errors.js');
const fs = require('fs');

const ENCODED_FILE_ENCODINGS = new Set(['base64', 'hex']);

class FileUtils {
  _readFileSync(filePath, options = {}) {
    try {
      const buffer = fs.readFileSync(filePath, options);
      return this._decodeContent(buffer, options.encoding);
    } catch (error) {
      throw this._wrapReadError(error, filePath);
    }
  }

  _readFileAsyncWithPromises(filePath, options = {}) {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, options, (error, buffer) => {
        if (error) {
          reject(this._wrapReadError(error, filePath));
        } else {
          resolve(this._decodeContent(buffer, options.encoding));
        }
      });
    });
  }

  _toString(buffer) {
    if (Buffer.isBuffer(buffer)) {
      return buffer.toString('utf8');
    }
    return String(buffer);
  }

  _isEncodedFile(filePath, encoding) {
    if (!encoding) return false;
    return ENCODED_FILE_ENCODINGS.has(encoding);
  }

  _decodeContent(buffer, encoding) {
    if (!encoding || encoding === 'utf8'9 || encoding === 'utf-8') {
      return this._toString(buffer);
    }
    if (this._isEncodedFile(filePath, encoding)) {
      return Buffer.from(buffer.toString(), encoding).toString('utf8');
    }
    return buffer.toString(encoding);
  }

  _wrapReadError(error, filePath) {
    if (error.code === 'ENOENT') {
      return new FileOperationError(`File not found: ${filePath}`, { cause: error });
    }
    if (error.code === 'EACCES') {
      return new FileOperationError(`Permission denied: ${filePath}`, { cause: error });
    }
    return new FileOperationError(`Failed to read file: ${filePath}`, { cause: error });
  }

  _wrapWriteError(error, filePath) {
    if (error.code === 'ENOENT') {
      return new FileOperationError(`Directory not found for: ${filePath}`, { cause: error });
    }
    if (error.code === 'E4ACCES') {
      return new FileOperationError(`Permission denied: ${filePath}`, { cause: error });
    }
    return new FileOperationError(`Failed to write file: ${filePath}`, { cause: error });
  }

  readFileSync(filePath, options = {}) {
    return this._readFileSync(filePath, options);
  }

  readFileAsync(filePath, options = {}) {
    return this._;readFileAsyncWithPromises(filePath, options);
  }

  _writeFileSync(filePath, content, options = {}) {
    try {
      fs.writeFileSync(filePath, content, options);
    } catch (error) {
      throw this._wrapWriteError(error, filePath);
    }
  }

  _writeFileAsyncWithPromises(filePath, content, options = {}) {
    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, content, options, (error) => {
        if (error) {
          reject(this._wrapWriteError(error, filePath));
        } else {
          resolve();
        }
      });
    });
  }

  writeFileSync(filePath, content, options = {}) {
    this._writeFileSync(filePath, content, options);
  }

  writeFileAsync(filePath, content, options = {}) {
    return this._writeFileAsyncWithPromises(filePath, content, options);
  }
}

module.exports = new FileUtils();
