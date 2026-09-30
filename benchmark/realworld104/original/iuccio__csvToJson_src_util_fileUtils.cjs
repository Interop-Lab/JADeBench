"use strict";
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// ../work/iuccio__csvToJson/src/core/errors.js
var require_errors = __commonJS({
  "../work/iuccio__csvToJson/src/core/errors.js"(exports2, module2) {
    "use strict";
    var CsvParsingError = class extends Error {
      /**
       * Create a CSV parsing error
       * @param {string} message - Error message
       * @param {string} code - Error code for identification
       * @param {object} context - Additional context information (default: {})
       */
      constructor(message, code, context = {}) {
        super(message);
        this.name = "CsvParsingError";
        this.code = code;
        this.context = context;
        Error.captureStackTrace(this, this.constructor);
      }
      /**
       * Convert error to formatted string with context information
       * @returns {string} Formatted error message including context
       */
      toString() {
        let output = `${this.name}: ${this.message}`;
        if (this.context && Object.keys(this.context).length > 0) {
          output += "\n\nContext:";
          Object.entries(this.context).forEach(([key, value]) => {
            output += `
  ${key}: ${this.formatValue(value)}`;
          });
        }
        return output;
      }
      /**
       * Format a context value for display in error message
       * @param {unknown} value - Value to format
       * @returns {string} Formatted value string
       * @private
       */
      formatValue(value) {
        if (value === null) return "null";
        if (value === void 0) return "undefined";
        if (typeof value === "string") return `"${value}"`;
        if (typeof value === "object") return JSON.stringify(value);
        return String(value);
      }
    };
    var InputValidationError = class extends CsvParsingError {
      /**
       * Create an input validation error
       * @param {string} paramName - Name of the invalid parameter
       * @param {string} expectedType - Expected type description
       * @param {string} receivedType - Actual type received
       * @param {string} details - Additional error details (optional)
       */
      constructor(paramName, expectedType, receivedType, details = "") {
        const message = `Invalid input: Parameter '${paramName}' is required.
Expected: ${expectedType}
Received: ${receivedType}${details ? "\n" + details : ""}`;
        super(message, "INPUT_VALIDATION_ERROR", {
          parameter: paramName,
          expectedType,
          receivedType
        });
        this.name = "InputValidationError";
      }
    };
    var ConfigurationError = class _ConfigurationError extends CsvParsingError {
      /**
       * Create a configuration error
       * @param {string} message - Error message
       * @param {object} conflictingOptions - Configuration options in conflict (optional)
       */
      constructor(message, conflictingOptions = {}) {
        super(message, "CONFIGURATION_ERROR", conflictingOptions);
        this.name = "ConfigurationError";
      }
      /**
       * Create error for quoted field configuration conflict
       * Occurs when quote character is used as delimiter while quoted fields are enabled
       * @param {string} optionName - Name of the conflicting option
       * @param {string} value - Value that causes the conflict
       * @returns {ConfigurationError} Configured error instance
       * @static
       */
      static quotedFieldConflict(optionName, value) {
        return new _ConfigurationError(
          `Configuration conflict: supportQuotedField() is enabled, but ${optionName} is set to '${value}'.
The quote character (") cannot be used as a field delimiter, separator, or sub-array delimiter when quoted field support is active.

Solutions:
  1. Use a different character for ${optionName} (e.g., '|', '\\t', ';')
  2. Disable supportQuotedField() if your CSV doesn't contain quoted fields
  3. Refer to RFC 4180 for proper CSV formatting: https://tools.ietf.org/html/rfc4180`,
          { optionName, value, conflictingOption: "supportQuotedField" }
        );
      }
      /**
       * Create error for invalid header index
       * Occurs when indexHeader() receives non-numeric value
       * @param {unknown} value - Invalid header index value
       * @returns {ConfigurationError} Configured error instance
       * @static
       */
      static invalidHeaderIndex(value) {
        return new _ConfigurationError(
          `Invalid configuration: indexHeader() expects a numeric value.
Received: ${typeof value} (${value})

Solutions:
  1. Ensure indexHeader() receives a number: indexHeader(0), indexHeader(1), etc.
  2. Headers are typically found on row 0 (first line)
  3. Use indexHeader(2) if headers are on the 3rd line`,
          { parameterName: "indexHeader", value, type: typeof value }
        );
      }
    };
    var CsvFormatError = class _CsvFormatError extends CsvParsingError {
      /**
       * Create a CSV format error
       * @param {string} message - Error message
       * @param {object} context - Additional context information (optional)
       */
      constructor(message, context = {}) {
        super(message, "CSV_FORMAT_ERROR", context);
        this.name = "CsvFormatError";
      }
      /**
       * Create error for missing CSV header row
       * Occurs when no valid header row is found in CSV
       * @returns {CsvFormatError} Configured error instance
       * @static
       */
      static missingHeader() {
        return new _CsvFormatError(
          `CSV parsing error: No header row found.
The CSV file appears to be empty or has no valid header line.

Solutions:
  1. Ensure your CSV file contains at least one row (header row)
  2. Verify the file is not empty or contains only whitespace
  3. Check if you need to use indexHeader(n) to specify a non-standard header row
  4. Refer to RFC 4180 for proper CSV format: https://tools.ietf.org/html/rfc4180`
        );
      }
      /**
       * Create error for mismatched quotes in CSV
       * Occurs when quoted fields are not properly closed
       * @param {string} location - Where the error occurred (default: 'CSV')
       * @returns {CsvFormatError} Configured error instance
       * @static
       */
      static mismatchedQuotes(location = "CSV") {
        return new _CsvFormatError(
          `CSV parsing error: Mismatched quotes detected in ${location}.
A quoted field was not properly closed with a matching quote character.

RFC 4180 rules for quoted fields:
  \u2022 Fields containing delimiters or quotes MUST be enclosed in double quotes
  \u2022 To include a quote within a quoted field, use two consecutive quotes: ""
  \u2022 Example: "Smith, John" (name contains comma)
  \u2022 Example: "He said ""Hello""" (text contains quotes)

Solutions:
  1. Review your CSV for properly paired quote characters
  2. Use double quotes ("") to escape quotes within quoted fields
  3. Ensure all commas within field values are inside quotes
  4. Enable supportQuotedField(true) if you're using quoted fields`,
          { location }
        );
      }
    };
    var FileOperationError2 = class extends CsvParsingError {
      /**
       * Create a file operation error
       * @param {string} operation - Type of operation that failed (e.g., 'read', 'write')
       * @param {string} filePath - Path to the file where operation failed
       * @param {Error} originalError - The underlying error object from Node.js
       */
      constructor(operation, filePath, originalError) {
        const message = `File operation error: Failed to ${operation} file.
File path: ${filePath}
Reason: ${originalError.message}

Solutions:
  1. Verify the file path is correct: ${filePath}
  2. Check file permissions (read access for input, write access for output)
  3. Ensure the directory exists and is writable for output files
  4. Verify the file is not in use by another process`;
        super(message, "FILE_OPERATION_ERROR", {
          operation,
          filePath,
          originalError: originalError.message
        });
        this.name = "FileOperationError";
        this.originalError = originalError;
      }
    };
    var JsonValidationError = class extends CsvParsingError {
      /**
       * Create a JSON validation error
       * @param {string} csvData - The CSV data that failed validation
       * @param {Error} originalError - The underlying JSON parsing error
       */
      constructor(csvData, originalError) {
        const message = `JSON validation error: The parsed CSV data generated invalid JSON.
This typically indicates malformed field names or values in the CSV.
Original error: ${originalError.message}

Solutions:
  1. Check that field names are valid JavaScript identifiers (or will be converted safely)
  2. Review the CSV data for special characters that aren't properly escaped
  3. Enable supportQuotedField(true) for fields containing special characters
  4. Verify that formatValueByType() isn't converting values incorrectly`;
        super(message, "JSON_VALIDATION_ERROR", {
          originalError: originalError.message,
          csvPreview: csvData ? csvData.substring(0, 200) : "N/A"
        });
        this.name = "JsonValidationError";
        this.originalError = originalError;
      }
    };
    var BrowserApiError = class _BrowserApiError extends CsvParsingError {
      /**
       * Create a browser API error
       * @param {string} message - Error message
       * @param {object} context - Additional context information (optional)
       */
      constructor(message, context = {}) {
        super(message, "BROWSER_API_ERROR", context);
        this.name = "BrowserApiError";
      }
      /**
       * Create error for unavailable FileReader API
       * Occurs when browser doesn't support FileReader
       * @returns {BrowserApiError} Configured error instance
       * @static
       */
      static fileReaderNotAvailable() {
        return new _BrowserApiError(
          `Browser compatibility error: FileReader API is not available.
Your browser does not support the FileReader API required for file parsing.

Solutions:
  1. Use a modern browser that supports FileReader (Chrome 13+, Firefox 10+, Safari 6+)
  2. Consider using csvStringToJson() or csvStringToJsonAsync() for string-based parsing
  3. Implement a polyfill or alternative file reading method`
        );
      }
      /**
       * Create error for file parsing failure in browser
       * Occurs when file read or CSV parse fails
       * @param {Error} originalError - The underlying error that occurred
       * @returns {BrowserApiError} Configured error instance
       * @static
       */
      static parseFileError(originalError) {
        return new _BrowserApiError(
          `Browser file parsing error: Failed to read and parse the file.
Error details: ${originalError.message}

Solutions:
  1. Verify the file is a valid CSV file
  2. Check the file encoding (UTF-8 is recommended)
  3. Try a smaller file to isolate the issue
  4. Check browser console for additional error details`,
          { originalError: originalError.message }
        );
      }
      /**
       * Create error for unsupported streaming API in browser
       * Occurs when browser doesn't support ReadableStream
       * @returns {BrowserApiError} Configured error instance
       * @static
       */
      static streamingNotSupported() {
        return new _BrowserApiError(
          `Browser compatibility error: ReadableStream API is not available.
Your browser does not support the ReadableStream API required for streaming.

Solutions:
  1. Use a modern browser that supports ReadableStream (Chrome 43+, Firefox 65+, Safari 10.1+)
  2. Use getJsonFromFileStreamingAsync() which falls back to regular file parsing
  3. Consider using parseFile() for non-streaming file parsing
  4. Implement a polyfill for ReadableStream support`
        );
      }
    };
    module2.exports = {
      CsvParsingError,
      InputValidationError,
      ConfigurationError,
      CsvFormatError,
      FileOperationError: FileOperationError2,
      JsonValidationError,
      BrowserApiError
    };
  }
});

// ../work/iuccio__csvToJson/src/util/fileUtils.js
var fs = require("fs");
var { FileOperationError } = require_errors();
var ENCODED_FILE_ENCODINGS = /* @__PURE__ */ new Set(["base64", "hex"]);
var FileUtils = class {
  /**
   * Determine whether the encoding represents a binary-encoded file.
   * @param {string} encoding - File encoding label
   * @returns {boolean} True when encoding is base64 or hex
   * @private
   */
  _isEncodedFile(encoding) {
    return ENCODED_FILE_ENCODINGS.has(encoding);
  }
  /**
   * Decode raw file content that was stored as base64 or hex.
   * @param {string} rawContent - Raw file content read from disk
   * @param {string} encoding - Encoding used for the file
   * @returns {string} UTF-8 decoded string content
   * @private
   */
  _decodeContent(rawContent, encoding) {
    if (this._isEncodedFile(encoding)) {
      return Buffer.from(rawContent, encoding).toString("utf8");
    }
    return rawContent;
  }
  /**
   * Convert raw file data into a string.
   * @param {string|Buffer} data - Data read from fs
   * @returns {string} String representation of the data
   * @private
   */
  _toString(data) {
    return typeof data === "string" ? data : data.toString();
  }
  /**
   * Wrap a read error in a FileOperationError instance.
   * @param {string} fileInputName - Path to file being read
   * @param {Error} error - Original error from fs
   * @returns {FileOperationError} Wrapped read error
   * @private
   */
  _wrapReadError(fileInputName, error) {
    return new FileOperationError("read", fileInputName, error);
  }
  /**
   * Wrap a write error in a FileOperationError instance.
   * @param {string} fileOutputName - Path to file being written
   * @param {Error} error - Original error from fs
   * @returns {FileOperationError} Wrapped write error
   * @private
   */
  _wrapWriteError(fileOutputName, error) {
    return new FileOperationError("write", fileOutputName, error);
  }
  /**
   * Perform a synchronous file read using the provided encoding.
   * @param {string} fileInputName - Path to file to read
   * @param {string} encoding - File encoding to use when reading
   * @returns {string} Decoded file content
   * @private
   */
  _readFileSync(fileInputName, encoding) {
    if (this._isEncodedFile(encoding)) {
      const rawContent = fs.readFileSync(fileInputName, "utf8");
      return this._decodeContent(rawContent, encoding);
    }
    return this._toString(fs.readFileSync(fileInputName, encoding));
  }
  /**
   * Read a file synchronously with specified encoding.
   * @param {string} fileInputName - Path to file to read
   * @param {string} encoding - File encoding (e.g., 'utf8', 'latin1')
   * @returns {string} File contents as string
   * @throws {FileOperationError} If file read fails
   */
  readFile(fileInputName, encoding = "utf8") {
    try {
      return this._readFileSync(fileInputName, encoding);
    } catch (error) {
      throw this._wrapReadError(fileInputName, error);
    }
  }
  /**
   * Read a file using fs.promises and return decoded content.
   * @param {string} fileInputName - Path to file to read
   * @param {string} encoding - File encoding to use
   * @returns {Promise<string>} Promise resolving to decoded file content
   * @private
   */
  _readFileAsyncWithPromises(fileInputName, encoding) {
    if (this._isEncodedFile(encoding)) {
      return fs.promises.readFile(fileInputName, "utf8").then((rawContent) => this._decodeContent(rawContent, encoding));
    }
    return fs.promises.readFile(fileInputName, encoding).then((data) => this._toString(data));
  }
  /**
   * Read a file asynchronously with specified encoding.
   * Uses fs.promises when available, falls back to callback-based API.
   * @param {string} fileInputName - Path to file to read
   * @param {string} encoding - File encoding (default: 'utf8')
   * @returns {Promise<string>} Promise resolving to file contents
   * @throws {FileOperationError} If file read fails
   */
  readFileAsync(fileInputName, encoding = "utf8") {
    if (fs.promises && typeof fs.promises.readFile === "function") {
      return this._readFileAsyncWithPromises(fileInputName, encoding).catch((error) => {
        throw this._wrapReadError(fileInputName, error);
      });
    }
    return new Promise((resolve, reject) => {
      const callback = (error, data) => {
        if (error) {
          reject(this._wrapReadError(fileInputName, error));
          return;
        }
        try {
          const content = this._isEncodedFile(encoding) ? this._decodeContent(this._toString(data), encoding) : this._toString(data);
          resolve(content);
        } catch (decodeError) {
          reject(this._wrapReadError(fileInputName, decodeError));
        }
      };
      const readEncoding = this._isEncodedFile(encoding) ? "utf8" : encoding;
      fs.readFile(fileInputName, readEncoding, callback);
    });
  }
  /**
   * Write content to a file synchronously.
   * @param {string} fileOutputName - Path to output file
   * @param {string} content - File content to write
   * @private
   */
  _writeFileSync(fileOutputName, content) {
    fs.writeFileSync(fileOutputName, content, "utf8");
  }
  /**
   * Write content to a file using fs.promises.
   * @param {string} fileOutputName - Path to output file
   * @param {string} content - File content to write
   * @returns {Promise<void>} Promise that resolves when write completes
   * @private
   */
  _writeFileAsyncWithPromises(fileOutputName, content) {
    return fs.promises.writeFile(fileOutputName, content, "utf8");
  }
  /**
   * Write content to a file synchronously.
   * @param {string} content - Content to write to file
   * @param {string} fileOutputName - Path to output file
   * @throws {FileOperationError} If file write fails
   */
  writeFile(content, fileOutputName) {
    try {
      this._writeFileSync(fileOutputName, content);
    } catch (error) {
      throw this._wrapWriteError(fileOutputName, error);
    }
  }
  /**
   * Write content to a file asynchronously.
   * Uses fs.promises when available, falls back to callback-based API.
   * @param {string} content - Content to write to file
   * @param {string} fileOutputName - Path to output file
   * @returns {Promise<void>} Promise that resolves when write completes
   * @throws {FileOperationError} If file write fails
   */
  writeFileAsync(content, fileOutputName) {
    if (fs.promises && typeof fs.promises.writeFile === "function") {
      return this._writeFileAsyncWithPromises(fileOutputName, content).catch((error) => {
        throw this._wrapWriteError(fileOutputName, error);
      });
    }
    return new Promise((resolve, reject) => {
      fs.writeFile(fileOutputName, content, "utf8", (error) => {
        if (error) {
          reject(this._wrapWriteError(fileOutputName, error));
          return;
        }
        resolve();
      });
    });
  }
};
module.exports = new FileUtils();
