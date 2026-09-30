'use strict';

const fs = require('fs');

const ENCODED_FILE_ENCODINGS = new Set(['base64', 'hex']);

class FileOperationError extends Error {
  constructor(operation, filePath, originalError) {
    const message =
      `Failed to ${operation} file.\n` +
      `File: ${filePath}\n` +
      `Error: ${originalError.message}\n\n` +
      'Solutions:\n' +
      '  1. Ensure the file path is valid and accessible\n' +
      '  2. Check file permissions\n' +
      '  3. Verify the file is not in use by another process';

    super(message);
    this.name = 'FileOperationError';
    this.code = 'FILE_OPERATION_ERROR';
    this.context = {
      operation,
      filePath,
      originalError: originalError.message,
    };
    this.originalError = originalError;

    Error.captureStackTrace?.(this, FileOperationError);
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
      const callbackEncoding = this._isEncodedFile(encoding) ? 'utf8' : encoding;

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
    fs.writeFileSync(filePath, content, 'utf8');
  }

  _writeFileAsyncWithPromises(filePath, content) {
    return fs.promises.writeFile(filePath, content, 'utf8');
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
      fs.writeFile(filePath, content, 'utf8', (error) => {
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
