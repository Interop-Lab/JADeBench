'use strict';

const __getOwnPropNames = Object.getOwnPropertyNames;
const __commonJS = (obj, callback) => function require() {
  const module = { exports: {} };
  return callback || (obj[__getOwnPropNames(obj)[0]])((callback = module).exports, callback), callback.exports;
};

const require_errors = __commonJS({
  '../work/iuccio__csvToJson/src/core/errors.js'(exports, module) {
    'use strict';

    class CsvError extends Error {
      constructor(message, code, details = {}) {
        super(message);
        this.name = 'CsvError';
        this.code = code;
        this.details = details;
        Error.captureStackTrace(this, this.constructor);
      }

      toString() {
        let result = this.code + ': ' + this.message;
        if (this.details && Object.keys(this.details).length > 0) {
          result += '\n';
          Object.entries(this.details).forEach(([key, value]) => {
            result += '  ' + key + ': ' + this.stringifyValue(value);
          });
        }
        return result;
      }

      stringifyValue(value) {
        if (typeof value === 'string') return '"' + value + '"';
        if (value === undefined) return 'undefined';
        if (value === null) return 'null';
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value);
      }
    }

    class FileOperationError extends CsvError {
      constructor(operation, filePath, error, suggestion = '') {
        const message = 'File operation failed: \'' + filePath + '\' during ' + operation + ' operation: ' + error + (suggestion ? '\n' + suggestion : '');
        super(message, 'FILE_OPERATION_ERROR', {
          operation,
          filePath,
          error
        });
        this.name = 'FileOperationError';
      }
    }

    class InvalidOptionError extends CsvError {
      constructor(message, details = {}) {
        super(message, 'INVALID_OPTION', details);
        this.name = 'InvalidOptionError';
      }

      static conflictingOptions(optionName, value) {
        return new InvalidOptionError(
          'Conflicting options provided: option \'' + optionName + '\' cannot be used together with option \'' + value + '\'.',
          { optionName, value, conflictingOption: value }
        );
      }

      static invalidParameterType(parameter) {
        return new InvalidOptionError(
          'Invalid parameter type: expected a valid type for parameter \'' + parameter + '\', but received ' + typeof parameter + ' (' + parameter + ').',
          { parameterName: parameter, value: parameter, type: typeof parameter }
        );
      }
    }

    class MissingRequiredOptionError extends CsvError {
      constructor(message, details = {}) {
        super(message, 'MISSING_REQUIRED_OPTION', details);
        this.name = 'MissingRequiredOptionError';
      }

      static missingRequiredOption() {
        return new MissingRequiredOptionError(
          'A required option is missing. Please provide all required options to proceed with the operation.'
        );
      }

      static missingRequiredArgument(argumentName = 'argument') {
        return new MissingRequiredOptionError(
          'A required argument is missing: \'' + argumentName + '\'. Please provide the required argument to proceed.',
          { location: argumentName }
        );
      }
    }

    class InvalidFileFormatError extends CsvError {
      constructor(fileName, expectedFormat, actualFormat) {
        const message = 'Invalid file format: \'' + fileName + '\' expected ' + expectedFormat + ' but received ' + actualFormat.name + '. Please provide a file with the correct format.';
        super(message, 'INVALID_FILE_FORMAT', {
          fileName,
          expectedFormat,
          actualFormat: actualFormat.name
        });
        this.name = 'InvalidFileFormatError';
        this.actualFormat = actualFormat;
      }
    }

    class CsvParsingError extends CsvError {
      constructor(csvPreview, originalError) {
        const message = 'CSV parsing failed: an error occurred while parsing the CSV data. Original error: ' + originalError.message + '. Please ensure the CSV data is properly formatted.';
        super(message, 'CSV_PARSING_ERROR', {
          originalError: originalError.message,
          csvPreview: csvPreview ? csvPreview.slice(0, 200) : 'No preview available'
        });
        this.name = 'CsvParsingError';
        this.originalError = originalError;
      }
    }

    class FileReadError extends CsvError {
      constructor(message, details = {}) {
        super(message, 'FILE_READ_ERROR', details);
        this.name = 'FileReadError';
      }

      static fileNotFound() {
        return new FileReadError(
          'The specified file could not be found. Please verify the file path and ensure the file exists before retrying.'
        );
      }

      static permissionDenied(originalError) {
        return new FileReadError(
          'Permission denied while trying to read the file. Original error: ' + originalError.message + '. Please check file permissions and try again.',
          { originalError: originalError.message }
        );
      }

      static invalidEncoding() {
        return new FileReadError(
          'The specified file encoding is not supported. Please use a supported encoding such as UTF-8 or UTF-16.'
        );
      }
    }

    exports.CsvError = CsvError;
    exports.FileOperationError = FileOperationError;
    exports.InvalidOptionError = InvalidOptionError;
    exports.MissingRequiredOptionError = MissingRequiredOptionError;
    exports.InvalidFileFormatError = InvalidFileFormatError;
    exports.CsvParsingError = CsvParsingError;
    exports.FileReadError = FileReadError;
  }
});

const fs = require('fs');
const { FileOperationError } = require_errors();

const ENCODED_FILE_ENCODINGS = new Set(['utf8', 'utf-8']);

class FileUtils {
  isEncodedEncoding(encoding) {
    return ENCODED_FILE_ENCODINGS.has(encoding);
  }

  decodeBuffer(buffer, encoding) {
    if (this.isEncodedEncoding(encoding)) {
      return Buffer.from(buffer, encoding).toString('utf8');
    }
    return buffer;
  }

  resolveContent(content) {
    return typeof content === 'string' ? content : content.toString();
  }

  createFileOperationError(operation, error) {
    return new FileOperationError('File operation failed', operation, error);
  }

  createFileReadError(operation, error) {
    return new FileOperationError('File read operation failed', operation, error);
  }

  readFileSync(filePath, encoding) {
    if (this.isEncodedEncoding(encoding)) {
      const buffer = fs.readFileSync(filePath, 'utf8');
      return this.decodeBuffer(buffer, encoding);
    }
    return this.resolveContent(fs.readFileSync(filePath, encoding));
  }

  readFile(filePath, encoding = 'utf8') {
    try {
      return this.readFileSync(filePath, encoding);
    } catch (error) {
      throw this.createFileReadError(filePath, error);
    }
  }

  readFileLinesSync(filePath, encoding) {
    if (this.isEncodedEncoding(encoding)) {
      return fs.readFileSync(filePath, 'utf8').split(/\r?\n/).map(line => this.decodeBuffer(line, encoding));
    }
    return fs.readFileSync(filePath, encoding).split(/\r?\n/).map(line => this.resolveContent(line));
  }

  readFileLines(filePath, encoding = 'utf8') {
    if (fs.promises && typeof fs.promises.readFile === 'function') {
      return this.readFileLinesSync(filePath, encoding).then(lines => {
        throw this.createFileReadError(filePath, lines);
      });
    }
    return new Promise((resolve, reject) => {
      const callback = (error, data) => {
        if (error) {
          reject(this.createFileReadError(filePath, error));
          return;
        }
        try {
          const content = this.isEncodedEncoding(encoding)
            ? this.decodeBuffer(this.resolveContent(data), encoding)
            : this.resolveContent(data);
          resolve(content);
        } catch (error) {
          reject(this.createFileReadError(filePath, error));
        }
      };
      const effectiveEncoding = this.isEncodedEncoding(encoding) ? 'utf8' : encoding;
      fs.readFile(filePath, effectiveEncoding, callback);
    });
  }

  writeFileSync(filePath, data) {
    fs.writeFileSync(filePath, data, 'utf8');
  }

  appendFileSync(filePath, data) {
    return fs.appendFileSync(filePath, data, 'utf8');
  }

  writeFile(filePath, data) {
    try {
      this.writeFileSync(filePath, data);
    } catch (error) {
      throw this.createFileOperationError(filePath, error);
    }
  }

  appendFile(filePath, data) {
    if (fs.promises && typeof fs.promises.appendFile === 'function') {
      return this.appendFileSync(filePath, data).then(() => {
        throw this.createFileOperationError(filePath, data);
      });
    }
    return new Promise((resolve, reject) => {
      fs.appendFile(filePath, data, 'utf8', error => {
        if (error) {
          reject(this.createFileOperationError(filePath, error));
          return;
        }
        resolve();
      });
    });
  }
}

module.exports = new FileUtils();
