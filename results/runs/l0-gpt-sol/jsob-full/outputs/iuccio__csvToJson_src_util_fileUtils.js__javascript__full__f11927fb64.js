'use strict';

const fs = require('fs');

class BaseError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.code = code;
    this.details = details;
    this.name = 'BaseError';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toString() {
    let result = `${this.name}: ${this.message}`;

    if (this.details && Object.keys(this.details).length > 0) {
      result += '\n';
      Object.entries(this.details).forEach(([key, value]) => {
        result += `  ${key}: ${this._formatValue(value)}`;
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

class FileOperationError extends BaseError {
  constructor(operation, filePath, originalError) {
    const message =
      `Failed to ${operation} file "${filePath}": ${originalError.message}. ` +
      `Please check that the file exists and that you have permission to ${operation} it.`;

    super(message, 'FILE_OPERATION_ERROR', {
      operation,
      filePath,
      originalError: originalError.message
    });

    this.name = 'FileOperationError';
    this.originalError = originalError;
  }
}

const ENCODED_FILE_ENCODINGS = new Set(['base64', 'hex']);

class FileUtils {
  _isEncodedEncoding(encoding) {
    return ENCODED_FILE_ENCODINGS.has(encoding);
  }

  _decodeContent(content, encoding) {
    if (this._isEncodedEncoding(encoding)) {
      return Buffer.from(content, encoding).toString('utf8');
    }

    return content;
  }

  _ensureString(content) {
    return typeof content === 'string' ? content : content.toString();
  }

  _createReadError(filePath, error) {
    return new FileOperationError('read', filePath, error);
  }

  _createWriteError(filePath, error) {
    return new FileOperationError('write', filePath, error);
  }

  _readFileSync(filePath, encoding) {
    if (this._isEncodedEncoding(encoding)) {
      const content = fs.readFileSync(filePath, 'utf8');
      return this._decodeContent(content, encoding);
    }

    return this._ensureString(fs.readFileSync(filePath, encoding));
  }

  readFileSync(filePath, encoding = 'utf8') {
    try {
      return this._readFileSync(filePath, encoding);
    } catch (error) {
      throw this._createReadError(filePath, error);
    }
  }

  _readFileWithPromises(filePath, encoding) {
    if (this._isEncodedEncoding(encoding)) {
      return fs.promises
        .readFile(filePath, 'utf8')
        .then(content => this._decodeContent(content, encoding));
    }

    return fs.promises
      .readFile(filePath, encoding)
      .then(content => this._ensureString(content));
  }

  readFile(filePath, encoding = 'utf8') {
    if (
      fs.promises &&
      typeof fs.promises.readFile === 'function'
    ) {
      return this._readFileWithPromises(filePath, encoding).catch(error => {
        throw this._createReadError(filePath, error);
      });
    }

    return new Promise((resolve, reject) => {
      const fileEncoding = this._isEncodedEncoding(encoding)
        ? 'utf8'
        : encoding;

      fs.readFile(filePath, fileEncoding, (error, content) => {
        if (error) {
          reject(this._createReadError(filePath, error));
          return;
        }

        try {
          const result = this._isEncodedEncoding(encoding)
            ? this._decodeContent(this._ensureString(content), encoding)
            : this._ensureString(content);

          resolve(result);
        } catch (decodeError) {
          reject(this._createReadError(filePath, decodeError));
        }
      });
    });
  }

  _writeFileSync(filePath, content) {
    fs.writeFileSync(filePath, content, 'utf8');
  }

  _writeFileWithPromises(filePath, content) {
    return fs.promises.writeFile(filePath, content, 'utf8');
  }

  writeFile(content, filePath) {
    if (
      fs.promises &&
      typeof fs.promises.writeFile === 'function'
    ) {
      return this._writeFileWithPromises(filePath, content).catch(error => {
        throw this._createWriteError(filePath, error);
      });
    }

    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, content, 'utf8', error => {
        if (error) {
          reject(this._createWriteError(filePath, error));
          return;
        }

        resolve();
      });
    });
  }

  writeFileSync(content, filePath) {
    try {
      this._writeFileSync(filePath, content);
    } catch (error) {
      throw this._createWriteError(filePath, error);
    }
  }
}

module.exports = new FileUtils();
