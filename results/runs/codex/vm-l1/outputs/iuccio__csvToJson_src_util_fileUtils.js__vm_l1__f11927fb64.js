
'use strict';

const fs = require('fs');

const ENCODED_FILE_ENCODINGS = new Set(['base64', 'hex']);

class FileOperationError extends Error {
  constructor(operation, filePath, originalError) {
    super(
      `File operation error: Failed to ${operation} file.\n` +
        `File path: ${filePath}\n` +
        `Reason: ${originalError.message}\n\n` +
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
      originalError: originalError.message,
    };
    this.originalError = originalError;
  }
}

class FileUtils {
  _isEncodedFile(encoding) {
    return ENCODED_FILE_ENCODINGS.has(encoding);
  }

  _decodeContent(content, encoding) {
    if (this._isEncodedFile(encoding)) {
      return Buffer.from(content, encoding).toString();
    }
    return content;
  }

  _toString(content) {
    return content.toString();
  }

  _wrapReadError(filePath, originalError) {
    return new FileOperationError('read', filePath, originalError);
  }

  _wrapWriteError(filePath, originalError) {
    return new FileOperationError('write', filePath, originalError);
  }

  _readFileSync(filePath, encoding) {
    const content = fs.readFileSync(filePath, encoding);
    return this._decodeContent(content, encoding);
  }

  readFile(filePath) {
    try {
      return this._readFileSync(filePath, 'utf8');
    } catch (error) {
      throw this._wrapReadError(filePath, error);
    }
  }

  async _readFileAsyncWithPromises(filePath, encoding) {
    const content = await fs.promises.readFile(filePath, encoding);
    return this._decodeContent(content, encoding);
  }

  async readFileAsync(filePath) {
    try {
      return await this._readFileAsyncWithPromises(filePath, 'utf8');
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
      this._writeFileSync(filePath, content);
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
