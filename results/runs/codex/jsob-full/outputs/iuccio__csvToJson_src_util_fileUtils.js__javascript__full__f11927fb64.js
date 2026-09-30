'use strict';

const fs = require('fs');

const ENCODED_FILE_ENCODINGS = new Set(['base64', 'hex']);

class FileOperationError extends Error {
  constructor(operation, filePath, originalError) {
    const operationName = operation === 'read' ? 'read' : 'write';
    const reason = originalError instanceof Error ? originalError.message : String(originalError);
    super(
      `File operation error: Failed to ${operationName} file.\n` +
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
    if (!this._isEncodedFile(encoding)) {
      return content;
    }

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
    try {
      const content = fs.readFileSync(filePath, encoding);
      return this._decodeContent(content, encoding);
    } catch (error) {
      throw this._wrapReadError(filePath, error);
    }
  }

  readFile(filePath, encoding = 'utf8') {
    return this._readFileSync(filePath, encoding);
  }

  async _readFileAsyncWithPromises(filePath, encoding) {
    try {
      const content = await fs.promises.readFile(filePath, encoding);
      return this._decodeContent(content, encoding);
    } catch (error) {
      throw this._wrapReadError(filePath, error);
    }
  }

  readFileAsync(filePath, encoding = 'utf8') {
    return this._readFileAsyncWithPromises(filePath, encoding);
  }

  _writeFileSync(content, filePath, encoding) {
    try {
      fs.writeFileSync(filePath, content, encoding);
    } catch (error) {
      throw this._wrapWriteError(filePath, error);
    }
  }

  async _writeFileAsyncWithPromises(content, filePath, encoding) {
    try {
      await fs.promises.writeFile(filePath, content, encoding);
    } catch (error) {
      throw this._wrapWriteError(filePath, error);
    }
  }

  writeFile(content, filePath, encoding = 'utf8') {
    return this._writeFileSync(content, filePath, encoding);
  }

  writeFileAsync(content, filePath, encoding = 'utf8') {
    return this._writeFileAsyncWithPromises(content, filePath, encoding);
  }
}

module.exports = new FileUtils();
