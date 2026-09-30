'use strict';

const fs = require('fs');

const ENCODED_FILE_ENCODINGS = new Set(['base64', 'hex']);

class FileOperationError extends Error {
  constructor(message, code, context = {}) {
    super(message);
    this.code = code;
    this.name = 'FileOperationError';
    this.context = context;
    Error.captureStackTrace(this, this.constructor);
  }

  toString() {
    let result = `${this.name}: ${this.message}`;
    if (this.context && Object.keys(this.context).length > 0) {
      result += '\nContext:';
      Object.entries(this.context).forEach(([key, value]) => {
        result += `\n  ${key}: ${this._formatValue(value)}`;
      });
    }
    return result;
  }

  _formatValue(value) {
    if (value === undefined) return 'undefined';
    if (value === null) return 'null';
    if (typeof value === 'string') return `"${value}"`;
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }
}

class FileUtils {
  _isEncodedFile(encoding) {
    return ENCODED_FILE_ENCODINGS.has(encoding);
  }

  _decodeContent(content, encoding) {
    if (this._isEncodedFile(encoding)) {
      return Buffer.from(content, encoding).toString('utf8');
    }
    return content;
  }

  _toString(content) {
    return typeof content === 'string' ? content : content.toString();
  }

  _wrapReadError(filePath, error) {
    return new FileOperationError(
      `Failed to read file: ${filePath}. ${error.message}`,
      'FILE_OPERATION_ERROR',
      { operation: 'read', filePath, originalError: error.message },
    );
  }

  _wrapWriteError(filePath, error) {
    return new FileOperationError(
      `Failed to write file: ${filePath}. ${error.message}`,
      'FILE_OPERATION_ERROR',
      { operation: 'write', filePath, originalError: error.message },
    );
  }

  _readFileSync(filePath, encoding) {
    if (this._isEncodedFile(encoding)) {
      const content = fs.readFileSync(filePath, 'utf8');
      return this._decodeContent(content, encoding);
    }
    return this._toString(fs.readFileSync(filePath, encoding));
  }

  readFile(filePath, encoding = 'utf8') {
    try {
      return this._readFileSync(filePath, encoding);
    } catch (error) {
      throw this._wrapReadError(filePath, error);
    }
  }

  _readFileAsyncWithPromises(filePath, encoding) {
    if (this._isEncodedFile(encoding)) {
      return fs.promises
        .readFile(filePath, 'utf8')
        .then((content) => this._decodeContent(content, encoding));
    }
    return fs.promises
      .readFile(filePath, encoding)
      .then((content) => this._toString(content));
  }

  readFileAsync(filePath, encoding = 'utf8') {
    if (fs.promises && typeof fs.promises.readFile === 'function') {
      return this._readFileAsyncWithPromises(filePath, encoding).catch((error) => {
        throw this._wrapReadError(filePath, error);
      });
    }

    return new Promise((resolve, reject) => {
      const fileEncoding = this._isEncodedFile(encoding) ? 'utf8' : encoding;
      fs.readFile(filePath, fileEncoding, (error, content) => {
        if (error) {
          reject(this._wrapReadError(filePath, error));
          return;
        }

        try {
          const result = this._isEncodedFile(encoding)
            ? this._decodeContent(this._toString(content), encoding)
            : this._toString(content);
          resolve(result);
        } catch (decodeError) {
          reject(this._wrapReadError(filePath, decodeError));
        }
      });
    });
  }

  _writeFileSync(filePath, content) {
    fs.writeFileSync(filePath, content, { encoding: 'utf8' });
  }

  _writeFileAsyncWithPromises(filePath, content) {
    return fs.promises.writeFile(filePath, content, { encoding: 'utf8' });
  }

  writeFile(content, filePath) {
    try {
      this._writeFileSync(filePath, content);
    } catch (error) {
      throw this._wrapWriteError(filePath, error);
    }
  }

  writeFileAsync(content, filePath) {
    if (fs.promises && typeof fs.promises.writeFile === 'function') {
      return this._writeFileAsyncWithPromises(filePath, content).catch((error) => {
        throw this._wrapWriteError(filePath, error);
      });
    }

    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, content, { encoding: 'utf8' }, (error) => {
        if (error) {
          reject(this._wrapWriteError(filePath, error));
          return;
        }
        resolve();
      });
    });
  }
}

module.exports = new FileUtils();
