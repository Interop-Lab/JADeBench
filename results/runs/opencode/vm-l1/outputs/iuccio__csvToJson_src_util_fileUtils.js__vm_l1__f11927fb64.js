'use strict';

const fs = require('fs');

const ENCODED_FILE_ENCODINGS = new Set(['base64', 'hex']);

class FileOperationError extends Error {
  constructor(operation, filePath, originalError) {
    const reason = originalError.message;
    super(
      `File operation error: Failed to ${operation} file.\n` +
        `File path: ${filePath}\n` +
        `Reason: ${reason}\n\n` +
        'Solutions:\n' +
        `  1. Verify the file path is correct: ${filePath}\n` +
        '  2. Check file permissions (read access for input, write access for output)\n' +
        '  3. Ensure the directory exists and is writable for output files\n' +
        '  4. Verify the file is not in use by another process',
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
}

class FileUtils {
  _isEncodedFile(encoding) {
    return ENCODED_FILE_ENCODINGS.has(encoding);
  }

  _decodeContent(content, encoding) {
    if (!this._isEncodedFile(encoding)) return content;
    if (Buffer.isBuffer(content)) return content.toString();
    return Buffer.from(content, encoding).toString();
  }

  _toString(content) {
    return content.toString();
  }

  _wrapReadError(filePath, error) {
    return new FileOperationError('read', filePath, error);
  }

  _wrapWriteError(filePath, error) {
    return new FileOperationError('write', filePath, error);
  }

  _readFileSync(filePath, encoding) {
    const readEncoding = this._isEncodedFile(encoding) ? 'utf8' : encoding;
    const content = fs.readFileSync(filePath, readEncoding);
    return this._toString(this._decodeContent(content, encoding));
  }

  readFile(filePath, encoding = 'utf8') {
    try {
      return this._readFileSync(filePath, encoding);
    } catch (error) {
      throw this._wrapReadError(filePath, error);
    }
  }

  async _readFileAsyncWithPromises(filePath, encoding) {
    const readEncoding = this._isEncodedFile(encoding) ? 'utf8' : encoding;
    const content = await fs.promises.readFile(filePath, readEncoding);
    return this._toString(this._decodeContent(content, encoding));
  }

  async readFileAsync(filePath, encoding = 'utf8') {
    try {
      return await this._readFileAsyncWithPromises(filePath, encoding);
    } catch (error) {
      throw this._wrapReadError(filePath, error);
    }
  }

  _writeFileSync(filePath, content) {
    fs.writeFileSync(filePath, content, 'utf8');
  }

  async _writeFileAsyncWithPromises(filePath, content) {
    return fs.promises.writeFile(filePath, content, 'utf8');
  }

  writeFile(content, filePath) {
    try {
      return this._writeFileSync(filePath, content);
    } catch (error) {
      throw this._wrapWriteError(filePath, error);
    }
  }

  async writeFileAsync(content, filePath) {
    try {
      return await this._writeFileAsyncWithPromises(filePath, content);
    } catch (error) {
      throw this._wrapWriteError(filePath, error);
    }
  }
}

module.exports = new FileUtils();
