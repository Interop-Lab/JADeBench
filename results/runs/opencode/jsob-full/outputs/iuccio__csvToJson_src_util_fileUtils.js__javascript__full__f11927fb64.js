'use strict';

const fs = require('fs');

class FileOperationError extends Error {
  constructor(operation, filePath, originalError) {
    const reason = originalError && originalError.message
      ? originalError.message
      : String(originalError);

    super(
      `File operation error: Failed to ${operation} file.\n` +
      `File path: ${filePath}\n` +
      `Reason: ${reason}\n\n` +
      'Solutions:\n' +
      `  1. Verify the file path is correct: ${filePath}\n` +
      '  2. Check file permissions (read access for input, write access for output)\n' +
      '  3. Ensure the directory exists and is writable for output files\n' +
      '  4. Verify the file is not in use by another process'
    );

    this.name = 'FileOperationError';
    this.code = 'FILE_OPERATION_ERROR';
    this.context = {
      operation,
      filePath,
      originalError: reason,
    };
    this.originalError = originalError;
  }

  toString() {
    let result = `${this.name}: ${this.message}`;
    if (this.context && Object.keys(this.context).length > 0) {
      for (const [key, value] of Object.entries(this.context)) {
        result += `\n  ${key}: ${this.formatValue(value)}`;
      }
    }
    return result;
  }

  formatValue(value) {
    return typeof value === 'string' ? value : value.toString();
  }
}

const ENCODED_FILE_ENCODINGS = new Set(['base64', 'hex']);

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

  _toString(value) {
    return typeof value === 'string' ? value : value.toString();
  }

  _wrapReadError(filePath, error) {
    return new FileOperationError('read', filePath, error);
  }

  _wrapWriteError(filePath, error) {
    return new FileOperationError('write', filePath, error);
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
        .then(content => this._decodeContent(content, encoding));
    }
    return fs.promises
      .readFile(filePath, encoding)
      .then(content => this._toString(content));
  }

  readFileAsync(filePath, encoding = 'utf8') {
    if (fs.promises && typeof fs.promises.readFile === 'function') {
      return this._readFileAsyncWithPromises(filePath, encoding).catch(error => {
        throw this._wrapReadError(filePath, error);
      });
    }

    return new Promise((resolve, reject) => {
      const nodeEncoding = this._isEncodedFile(encoding) ? 'utf8' : encoding;
      fs.readFile(filePath, nodeEncoding, (error, content) => {
        if (error) {
          reject(this._wrapReadError(filePath, error));
          return;
        }
        try {
          const result = this._isEncodedFile(encoding)
            ? this._decodeContent(this._toString(content), encoding)
            : this._toString(content);
          resolve(result);
        } catch (conversionError) {
          reject(this._wrapReadError(filePath, conversionError));
        }
      });
    });
  }

  _writeFileSync(content, filePath) {
    fs.writeFileSync(content, filePath, 'utf8');
  }

  _writeFileAsyncWithPromises(content, filePath) {
    return fs.promises.writeFile(content, filePath, 'utf8');
  }

  writeFile(content, filePath) {
    try {
      this._writeFileSync(content, filePath);
    } catch (error) {
      throw this._wrapWriteError(filePath, error);
    }
  }

  writeFileAsync(content, filePath) {
    if (fs.promises && typeof fs.promises.writeFile === 'function') {
      return this._writeFileAsyncWithPromises(content, filePath).catch(error => {
        throw this._wrapWriteError(filePath, error);
      });
    }

    return new Promise((resolve, reject) => {
      fs.writeFile(content, filePath, 'utf8', error => {
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
