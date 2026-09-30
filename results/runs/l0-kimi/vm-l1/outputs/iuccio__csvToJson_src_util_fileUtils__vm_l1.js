'use strict';

const fs = require('fs');

class FileOperationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'FileOperationError';
  }
}

const ENCODED_FILE_ENCODINGS = new Set(['base64', 'hex']);

class FileUtils {
  _isEncodedFile(encoding) {
    return ENCODED_FILE_ENCODINGS.has(encoding);
  }

  _decodeContent(content, encoding) {
    if (encoding === 'base64') {
      return Buffer.from(content, 'base64').toString('utf8');
    }
    if (encoding === 'hex') {
      return Buffer.from(content, 'hex').toString('utf8');
    }
    return content;
  }

  _toString(data) {
    if (Buffer.isBuffer(data)) {
      return data.toString('utf8');
    }
    if (typeof data === 'string') {
      return data;
    }
    return String(data);
  }

  _wrapReadError(error) {
    return new FileOperationError(`Failed to read file: ${error.message}`);
  }

  _wrapWriteError(error) {
    return new FileOperationError(`Failed to write file: ${error.message}`);
  }

  _readFileSync(filePath, options = {}) {
    try {
      const content = fs.readFileSync(filePath);
      const encoding = options.encoding || 'utf8';
      
      if (this._isEncodedFile(encoding)) {
        return this._decodeContent(content, encoding);
      }
      
      return this._toString(content);
    } catch (error) {
      throw this._wrapReadError(error);
    }
  }

  _readFileAsyncWithPromises(filePath, options = {}) {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, (error, content) => {
        if (error) {
          reject(this._wrapReadError(error));
          return;
        }
        
        const encoding = options.encoding || 'utf8';
        
        if (this._isEncodedFile(encoding)) {
          resolve(this._decodeContent(content, encoding));
        } else {
          resolve(this._toString(content));
        }
      });
    });
  }

  readFileAsync(filePath, options) {
    return this._readFileAsyncWithPromises(filePath, options);
  }

  _writeFileSync(filePath, data) {
    try {
      fs.writeFileSync(filePath, data);
    } catch (error) {
      throw this._wrapWriteError(error);
    }
  }

  _writeFileAsyncWithPromises(filePath, data) {
    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, data, (error) => {
        if (error) {
          reject(this._wrapWriteError(error));
        } else {
          resolve();
        }
      });
    });
  }

  writeFileAsync(filePath, data) {
    return this._writeFileAsyncWithPromises(filePath, data);
  }
}

module.exports = new FileUtils();
