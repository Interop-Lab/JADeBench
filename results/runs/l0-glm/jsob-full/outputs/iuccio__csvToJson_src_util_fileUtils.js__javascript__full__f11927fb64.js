'use strict';
const fs = require('fs');

class CsvToJsonError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }

  toString() {
    let str = this.code + ': ' + this.message;
    if (this.details && Object.keys(this.details).length > 0) {
      str += '\nDetails:';
      Object.entries(this.details).forEach(([key, value]) => {
        str += '\n  ' + key + ': ' + this._formatValue(value);
      });
    }
    return str;
  }

  _formatValue(value) {
    if (typeof value === 'string') return '"' + value + '"';
    if (value === undefined) return 'undefined';
    if (value === null) return 'null';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }
}

class FieldValidationError extends CsvToJsonError {
  constructor(fieldName, fieldValue, rowNumber, suggestion = '') {
    const message = `Invalid value for field '${fieldName}': '${fieldValue}' at row ${rowNumber}` + (suggestion ? '\n' + suggestion : '');
    super(message, 'FIELD_VALIDATION_ERROR', {
      fieldName,
      fieldValue,
      rowNumber
    });
    this.fieldName = fieldName;
  }
}

class ConfigurationError extends CsvToJsonError {
  constructor(message, details = {}) {
    super(message, 'CONFIGURATION_ERROR', details);
    this.name = 'ConfigurationError';
  }

  static conflictingOptions(optionName, conflictingOption) {
    return new ConfigurationError(`The options '${optionName}' and '${conflictingOption}' cannot be used together. Please choose one or the other.`, {
      optionName,
      conflictingOption
    });
  }

  static invalidParameterType(parameterName, value) {
    return new ConfigurationError(`Invalid type for parameter '${parameterName}'. Expected a string but received ${typeof value} (${value}). Please ensure the value is of the correct type.`, {
      parameterName,
      value,
      type: typeof value
    });
  }
}

class FileNotFoundError extends CsvToJsonError {
  constructor(filePath, details = {}) {
    super(`The specified file was not found: ${filePath}. Please verify the file path and ensure the file exists.`, details);
    this.name = 'FileNotFoundError';
  }

  static fileNotFound(filePath) {
    return new FileNotFoundError(`The specified file was not found: ${filePath}. Please verify the file path and ensure the file exists.`);
  }

  static directoryNotFound(directoryPath) {
    return new FileNotFoundError(`The specified directory was not found: ${directoryPath}. Please verify the directory path and ensure the directory exists.`);
  }
}

class FileReadError extends CsvToJsonError {
  constructor(filePath, error) {
    const message = `Failed to read the file at path: ${filePath}. Error: ${error.message}. Please check file permissions and ensure the file is accessible.`;
    super(message, 'FILE_READ_ERROR', {
      filePath,
      originalError: error.message
    });
    this.name = 'FileReadError';
    this.originalError = error;
  }
}

class FileWriteError extends CsvToJsonError {
  constructor(filePath, error) {
    const message = `Failed to write to the file at path: ${filePath}. Error: ${error.message}. Please check file permissions and ensure the directory is writable.`;
    super(message, 'FILE_WRITE_ERROR', {
      filePath,
      originalError: error.message
    });
    this.name = 'FileWriteError';
    this.originalError = error;
  }
}

class FileOperationError extends CsvToJsonError {
  constructor(message, filePath, error) {
    super(message, 'FILE_OPERATION_ERROR', {
      filePath,
      originalError: error.message
    });
    this.name = 'FileOperationError';
    this.originalError = error;
  }
}

const errors = {
  CsvToJsonError,
  FieldValidationError,
  ConfigurationError,
  FileNotFoundError,
  FileOperationError,
  FileReadError,
  FileWriteError
};

const ENCODED_FILE_ENCODINGS = new Set(['base64', 'hex']);

class FileUtils {
  isEncodedFile(encoding) {
    return ENCODED_FILE_ENCODINGS.has(encoding);
  }

  decodeFileContent(content, encoding) {
    if (this.isEncodedFile(encoding)) {
      return Buffer.from(content, encoding).toString('utf8');
    }
    return content;
  }

  ensureString(value) {
    return typeof value === 'string' ? value : value.toString();
  }

  createFileReadError(filePath, error) {
    return new FileOperationError('Failed to read file', filePath, error);
  }

  createFileWriteError(filePath, error) {
    return new FileOperationError('Failed to write file', filePath, error);
  }

  readFileSync(filePath, encoding) {
    if (this.isEncodedFile(encoding)) {
      const content = fs.readFileSync(filePath, encoding);
      return this.decodeFileContent(content, encoding);
    }
    return this.ensureString(fs.readFileSync(filePath, encoding));
  }

  readFile(filePath, encoding = 'utf8') {
    try {
      return this.readFileSync(filePath, encoding);
    } catch (error) {
      throw this.createFileReadError(filePath, error);
    }
  }

  readDirectoryFiles(directoryPath, encoding) {
    if (this.isEncodedFile(encoding)) {
      return fs.readdirSync(directoryPath, 'utf8').map(file => this.readFileSync(file, encoding));
    }
    return fs.readdirSync(directoryPath, encoding).map(file => this.ensureString(file));
  }

  readFileAsync(filePath, encoding = 'utf8') {
    if (fs.promises && typeof fs.promises.readFile === 'function') {
      return this.readDirectoryFilesAsync(filePath, encoding).catch(error => {
        throw this.createFileReadError(filePath, error);
      });
    }
    return new Promise((resolve, reject) => {
      const callback = (err, data) => {
        if (err) {
          reject(this.createFileReadError(filePath, err));
          return;
        }
        try {
          const content = this.isEncodedFile(encoding) ? this.decodeFileContent(this.ensureString(data), encoding) : this.ensureString(data);
          resolve(content);
        } catch (error) {
          reject(this.createFileReadError(filePath, error));
        }
      };
      const fileEncoding = this.isEncodedFile(encoding) ? 'utf8' : encoding;
      fs.readFile(filePath, fileEncoding, callback);
    });
  }

  writeFileSync(filePath, data) {
    fs.writeFileSync(filePath, data, 'utf8');
  }

  writeFileAsync(filePath, data) {
    return fs.promises.writeFile(filePath, data, 'utf8');
  }

  writeFileSyncWithCallback(filePath, data, callback) {
    return fs.writeFile(filePath, data, 'utf8', callback);
  }

  writeFile(filePath, data) {
    try {
      this.writeFileSyncWithCallback(filePath, data);
    } catch (error) {
      throw this.createFileWriteError(filePath, error);
    }
  }

  writeFileAsyncWithCallback(filePath, data) {
    if (fs.promises && typeof fs.promises.writeFile === 'function') {
      return this.readDirectoryFilesAsync(filePath, data).catch(error => {
        throw this.createFileWriteError(filePath, error);
      });
    }
    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, data, 'utf8', err => {
        if (err) {
          reject(this.createFileWriteError(filePath, err));
          return;
        }
        resolve();
      });
    });
  }
}

module.exports = new FileUtils();
