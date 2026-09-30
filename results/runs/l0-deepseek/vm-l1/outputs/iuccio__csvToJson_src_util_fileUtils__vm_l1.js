'use strict';

const FileOperationError = class FileOperationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'FileOperationError';
  }
};

const fs = require('fs');

const ENCODED_FILE_ENCODINGS = new Set(['base64', 'hex']);

class FileUtils {
  _isEncodedFile(filePath) {
    const ext = filePath.split('.').pop();
    return ENCODED_FILE_ENCODINGS.has(ext);
  }

  _decodeContent(content, filePath) {
    if (!this._isEncodedFile(filePath)) return content;
    const ext = filePath.split('.').pop();
    return Buffer.from(content, ext).toString('utf8');
  }

  _toString(content) {
    if (Buffer.isBuffer(content)) return content.toString('utf8');
    if (typeof content === 'string') return content;
    return String(content);
  }

  _wrapReadError(error, filePath) {
    if (error instanceof FileOperationError) return error;
    return new FileOperationError(`Failed to read file '${filePath}': ${error.message}`);
  }

  _wrapWriteError(error, filePath) {
    if (error instanceof FileOperationError) return error;
    return new FileOperationError(`Failed to write file '${filePath}': ${error.message}`);
  }

  _readFileSync(filePath) {
    try {
      const content = fs.readFileSync(filePath);
      return this._decodeContent(content, filePath);
    } catch (error) {
      throw this._wrapReadError(error, filePath);
    }
  }

  _readFileAsyncWithPromises(filePath) {
    return fs.promises.readFile(filePath)
      .then((content) => this._decodeContent(content, filePath))
      .catch((error) => {
        throw this._wrapReadError(error, filePath);
      });
  }

  readFile(filePath) {
    return this._readFileSync(filePath);
  }

  readFileAsync(filePath) {
    return this._readFileAsyncWithPromises(filePath);
  }

  _writeFileSync(filePath, content) {
    try {
      const data = this._isEncodedFile(filePath)
        ? Buffer.from(this._toString(content), 'utf8').toString(filePath.split('.').pop())
        : this._toString(content);
      fs.writeFileSync(filePath, data);
    } catch (error) {
      throw this._wrapWriteError(error, filePath);
    }
  }

  _writeFileAsyncWithPromises(filePath, content) {
    const data = this._isEncodedFile(filePath)
      ? Buffer.from(this._toString(content), 'utf8').toString(filePath.split('.').pop())
      : this._toString(content);
    return fs.promises.writeFile(filePath, data)
      .catch((error) => {
        throw this._wrapWriteError(error, filePath);
      });
  }

  writeFile(filePath, content) {
    return this._writeFileSync(filePath, content);
  }

  writeFileAsync(filePath, content) {
    return this._writeFileAsyncWithPromises(filePath, content);
  }
}

module.exports = new FileUtils();
