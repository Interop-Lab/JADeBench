'use strict';

const fs = require('fs');

const ENCODED_FILE_ENCODINGS = new Set(['base64', 'hex']);
const TEXT_ENCODING = 'utf8';

class CsvParsingError extends Error {
  constructor(message, code, context = {}) {
    super(message);
    this.name = 'CsvParsingError';
    this.code = code;
    this.context = context;
    Error.captureStackTrace(this, this.constructor);
  }

  toString() {
    let description = `${this.name}: ${this.message}`;

    if (this.context && Object.keys(this.context).length > 0) {
      description += '\n\nContext:';
      for (const [key, value] of Object.entries(this.context)) {
        description += `\n  ${key}: ${this.formatValue(value)}`;
      }
    }

    return description;
  }

  formatValue(value) {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'string') return `"${value}"`;
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }
}

class FileOperationError extends CsvParsingError {
  constructor(operation, filePath, originalError) {
    const reason = originalError.message;
    const message =
      `File operation error: Failed to ${operation} file.\n` +
      `File path: ${filePath}\n` +
      `Reason: ${reason}\n\n` +
      'Solutions:\n' +
      `  1. Verify the file path is correct: ${filePath}\n` +
      '  2. Check file permissions (read access for input, write access for output)\n' +
      '  3. Ensure the directory exists and is writable for output files\n' +
      '  4. Verify the file is not in use by another process';

    super(message, 'FILE_OPERATION_ERROR', {
      operation,
      filePath,
      originalError: reason,
    });

    this.name = 'FileOperationError';
    this.originalError = originalError;
  }
}

class FileUtils {
  _isEncodedFile(encoding) {
    return ENCODED_FILE_ENCODINGS.has(encoding);
  }

  _decodeContent(content, encoding) {
    if (this._isEncodedFile(encoding)) {
      return Buffer.from(content, encoding).toString(TEXT_ENCODING);
    }

    return content;
  }

  _toString(content) {
    return typeof content === 'string' ? content : content.toString();
  }

  _wrapReadError(filePath, error) {
    return new FileOperationError('read', filePath, error);
  }

  _wrapWriteError(filePath, error) {
    return new FileOperationError('write', filePath, error);
  }

  _readFileSync(filePath, encoding) {
    if (this._isEncodedFile(encoding)) {
      const encodedContent = fs.readFileSync(filePath, TEXT_ENCODING);
      return this._decodeContent(encodedContent, encoding);
    }

    return this._toString(fs.readFileSync(filePath, encoding));
  }

  readFile(filePath, encoding = TEXT_ENCODING) {
    try {
      return this._readFileSync(filePath, encoding);
    } catch (error) {
      throw this._wrapReadError(filePath, error);
    }
  }

  _readFileAsyncWithPromises(filePath, encoding) {
    if (this._isEncodedFile(encoding)) {
      return fs.promises
        .readFile(filePath, TEXT_ENCODING)
        .then(content => this._decodeContent(content, encoding));
    }

    return fs.promises
      .readFile(filePath, encoding)
      .then(content => this._toString(content));
  }

  readFileAsync(filePath, encoding = TEXT_ENCODING) {
    if (fs.promises && typeof fs.promises.readFile === 'function') {
      return this._readFileAsyncWithPromises(filePath, encoding).catch(error => {
        throw this._wrapReadError(filePath, error);
      });
    }

    return new Promise((resolve, reject) => {
      const callbackEncoding = this._isEncodedFile(encoding) ? TEXT_ENCODING : encoding;

      fs.readFile(filePath, callbackEncoding, (error, content) => {
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
    fs.writeFileSync(filePath, content, TEXT_ENCODING);
  }

  _writeFileAsyncWithPromises(filePath, content) {
    return fs.promises.writeFile(filePath, content, TEXT_ENCODING);
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
      return this._writeFileAsyncWithPromises(filePath, content).catch(error => {
        throw this._wrapWriteError(filePath, error);
      });
    }

    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, content, TEXT_ENCODING, error => {
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
