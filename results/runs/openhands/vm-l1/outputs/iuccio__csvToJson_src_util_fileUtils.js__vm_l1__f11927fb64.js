'use strict';

const fs = require('fs');

class CsvParsingError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = options.name || this.constructor.name;
    if (options.code !== undefined) this.code = options.code;
    if (options.context !== undefined) this.context = options.context;
    if (options.originalError !== undefined) this.originalError = options.originalError;
  }

  formatValue(value) {
    try {
      const json = JSON.stringify(value);
      return json === undefined ? String(value) : json;
    } catch {
      return String(value);
    }
  }

  toString() {
    let result = `${this.name}: ${this.message}`;
    if (this.context && Object.keys(this.context).length > 0) {
      const details = Object.entries(this.context)
        .map(([key, value]) => `  ${key}: ${this.formatValue(value)}`)
        .join('\n');
      result += `\n\nContext:\n${details}`;
    }
    return result;
  }
}

class FileOperationError extends CsvParsingError {
  constructor(operation, filePath, originalError) {
    const reason = originalError.message;
    const message = [
      `File operation error: Failed to ${operation} file.`,
      `File path: ${filePath}`,
      `Reason: ${reason}`,
      '',
      'Solutions:',
      `  1. Verify the file path is correct: ${filePath}`,
      '  2. Check file permissions (read access for input, write access for output)',
      '  3. Ensure the directory exists and is writable for output files',
      '  4. Verify the file is not in use by another process',
    ].join('\n');
    super(message, {
      name: 'FileOperationError',
      code: 'FILE_OPERATION_ERROR',
      context: {
        operation,
        filePath,
        originalError: reason,
      },
      originalError,
    });
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
    return this._toString(content);
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
      const content = fs.readFileSync(filePath, 'utf8');
      return this._decodeContent(content, encoding);
    }
    return this._toString(fs.readFileSync(filePath, encoding));
  }

  readFile(filePath) {
    try {
      return this._readFileSync(filePath, 'utf8');
    } catch (error) {
      throw this._wrapReadError(filePath, error);
    }
  }

  _readFileAsyncWithPromises(filePath, encoding) {
    const readEncoding = this._isEncodedFile(encoding) ? 'utf8' : encoding;
    return fs.promises.readFile(filePath, readEncoding).then((content) => (
      this._isEncodedFile(encoding)
        ? this._decodeContent(content, encoding)
        : this._toString(content)
    ));
  }

  readFileAsync(filePath) {
    const encoding = 'utf8';
    if (fs.promises && typeof fs.promises.readFile === 'function') {
      return this._readFileAsyncWithPromises(filePath, encoding).catch((error) => {
        throw this._wrapReadError(filePath, error);
      });
    }

    return new Promise((resolve, reject) => {
      fs.readFile(filePath, encoding, (error, content) => {
        if (error) {
          reject(this._wrapReadError(filePath, error));
          return;
        }
        resolve(
          this._isEncodedFile(encoding)
            ? this._decodeContent(content, encoding)
            : this._toString(content),
        );
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
