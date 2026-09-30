'use strict';

const fs = require('fs');

const ENCODED_FILE_ENCODINGS = new Set(['base64', 'hex']);

class CsvParsingError extends Error {
  constructor(message, code, context) {
    super(message);
    this.name = 'CsvParsingError';
    this.code = code;
    this.context = context;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

class FileOperationError extends CsvParsingError {
  constructor(operation, filePath, originalError) {
    const message =
      `File operation error: Failed to ${operation} file.\n` +
      `File path: ${filePath}\n` +
      `Reason: ${originalError.message}\n\n` +
      'Solutions:\n' +
      `  1. Verify the file path is correct: ${filePath}\n` +
      '  2. Check file permissions (read access for input, write access for output)\n' +
      '  3. Ensure the directory exists and is writable for output files\n' +
      '  4. Verify the file is not in use by another process';

    super(message, 'FILE_OPERATION_ERROR', {
      operation,
      filePath,
      originalError,
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
      return Buffer.from(content, encoding).toString('utf8');
    }
    return content;
  }

  _toString(content) {
    return typeof content === 'string' ? content : content.toString();
  }

  _wrapReadError(error, filePath) {
    return new FileOperationError('read', filePath, error);
  }

  _wrapWriteError(error, filePath) {
    return new FileOperationError('write', filePath, error);
  }

  _readFileSync(filePath, encoding) {
    if (this._isEncodedFile(encoding)) {
      const encodedContent = fs.readFileSync(filePath, 'utf8');
      return this._decodeContent(encodedContent, encoding);
    }

    return this._toString(fs.readFileSync(filePath, encoding));
  }

  readFile(filePath, encoding = 'utf8') {
    try {
      return this._readFileSync(filePath, encoding);
    } catch (error) {
      throw this._wrapReadError(error, filePath);
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
        throw this._wrapReadError(error, filePath);
      });
    }

    return new Promise((resolve, reject) => {
      const fileEncoding = this._isEncodedFile(encoding) ? 'utf8' : encoding;
      fs.readFile(filePath, fileEncoding, (error, content) => {
        if (error) {
          reject(this._wrapReadError(error, filePath));
          return;
        }

        const result = this._isEncodedFile(encoding)
          ? this._decodeContent(content, encoding)
          : this._toString(content);
        resolve(result);
      });
    });
  }

  _writeFileSync(filePath, content) {
    fs.writeFileSync(filePath, content, 'utf8');
  }

  _writeFileAsyncWithPromises(filePath, content) {
    return fs.promises.writeFile(filePath, content, 'utf8');
  }

  writeFile(filePath, content) {
    try {
      this._writeFileSync(filePath, content);
    } catch (error) {
      throw this._wrapWriteError(error, filePath);
    }
  }

  writeFileAsync(filePath, content) {
    if (fs.promises && typeof fs.promises.writeFile === 'function') {
      return this._writeFileAsyncWithPromises(filePath, content).catch((error) => {
        throw this._wrapWriteError(error, filePath);
      });
    }

    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, content, 'utf8', (error) => {
        if (error) {
          reject(this._wrapWriteError(error, filePath));
          return;
        }
        resolve();
      });
    });
  }
}

module.exports = new FileUtils();
