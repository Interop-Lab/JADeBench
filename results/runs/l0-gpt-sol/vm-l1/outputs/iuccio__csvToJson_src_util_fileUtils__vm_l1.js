'use strict';

const fs = require('fs');

class FileOperationError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = 'FileOperationError';
    if (cause !== undefined) this.cause = cause;
  }
}

const ENCODED_FILE_ENCODINGS = new Set(['base64', 'hex']);

class FileUtils {
  _isEncodedFile(encoding) {
    return ENCODED_FILE_ENCODINGS.has(encoding);
  }

  _decodeContent(content, encoding) {
    return Buffer.from(content, encoding).toString();
  }

  _toString(content) {
    return Buffer.isBuffer(content) ? content.toString() : String(content);
  }

  _wrapReadError(error, filePath) {
    if (error instanceof FileOperationError) return error;
    return new FileOperationError(`Unable to read file "${filePath}": ${error.message}`, error);
  }

  _wrapWriteError(error, filePath) {
    if (error instanceof FileOperationError) return error;
    return new FileOperationError(`Unable to write file "${filePath}": ${error.message}`, error);
  }

  _readFileSync(filePath, encoding) {
    try {
      const content = fs.readFileSync(filePath, encoding);
      return this._isEncodedFile(encoding)
        ? this._decodeContent(content, encoding)
        : this._toString(content);
    } catch (error) {
      throw this._wrapReadError(error, filePath);
    }
  }

  async _readFileAsyncWithPromises(filePath, encoding) {
    try {
      const content = await fs.promises.readFile(filePath, encoding);
      return this._isEncodedFile(encoding)
        ? this._decodeContent(content, encoding)
        : this._toString(content);
    } catch (error) {
      throw this._wrapReadError(error, filePath);
    }
  }

  readFile(filePath, encoding) {
    return this._readFileSync(filePath, encoding);
  }

  writeFile(filePath, content) {
    return this._writeFileSync(filePath, content);
  }

  readFileAsync(filePath, encoding) {
    return this._readFileAsyncWithPromises(filePath, encoding);
  }

  _writeFileSync(filePath, content) {
    try {
      fs.writeFileSync(filePath, content);
    } catch (error) {
      throw this._wrapWriteError(error, filePath);
    }
  }

  _writeFileAsyncWithPromises(filePath, content) {
    return fs.promises.writeFile(filePath, content).catch(error => {
      throw this._wrapWriteError(error, filePath);
    });
  }

  writeFileAsync(filePath, content) {
    return this._writeFileAsyncWithPromises(filePath, content);
  }
}

module.exports = new FileUtils();
