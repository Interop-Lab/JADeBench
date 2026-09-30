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
    var CsvFormatError2 = class _CsvFormatError extends CsvParsingError {
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
    var FileOperationError = class extends CsvParsingError {
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
      CsvFormatError: CsvFormatError2,
      FileOperationError,
      JsonValidationError,
      BrowserApiError
    };
  }
});

// ../work/iuccio__csvToJson/src/util/fileUtils.js
var require_fileUtils = __commonJS({
  "../work/iuccio__csvToJson/src/util/fileUtils.js"(exports2, module2) {
    "use strict";
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
    module2.exports = new FileUtils();
  }
});

// ../work/iuccio__csvToJson/src/util/stringUtils.js
var require_stringUtils = __commonJS({
  "../work/iuccio__csvToJson/src/util/stringUtils.js"(exports2, module2) {
    "use strict";
    var StringUtils = class _StringUtils {
      // Regular expressions as constants for better maintainability
      static PATTERNS = {
        INTEGER: /^-?\d+$/,
        FLOAT: /^-?\d*\.\d+$/,
        WHITESPACE: /\s/g
      };
      static BOOLEAN_VALUES = {
        TRUE: "true",
        FALSE: "false"
      };
      /**
       * Removes whitespace from property names based on configuration
       * @param {boolean} shouldTrimAll - If true, removes all whitespace, otherwise only trims edges
       * @param {string} propertyName - The property name to process
       * @returns {string} The processed property name
       */
      trimPropertyName(shouldTrimAll, propertyName) {
        if (!propertyName) {
          return "";
        }
        return shouldTrimAll ? propertyName.replace(_StringUtils.PATTERNS.WHITESPACE, "") : propertyName.trim();
      }
      /**
       * Converts a string value to its appropriate type while preserving data integrity
       * @param {string} value - The input value to convert
       * @returns {string|number|boolean} The converted value
       */
      getValueFormatByType(value) {
        if (this.isEmpty(value)) {
          return String();
        }
        if (this.isBoolean(value)) {
          return this.convertToBoolean(value);
        }
        if (this.isInteger(value)) {
          return this.convertInteger(value);
        }
        if (this.isFloat(value)) {
          return this.convertFloat(value);
        }
        return String(value);
      }
      /**
       * Checks if a value array contains any non-empty values
       * @param {Array} values - Array to check for content
       * @returns {boolean} True if array has any non-empty values
       */
      hasContent(values = []) {
        return Array.isArray(values) && values.some((value) => Boolean(value));
      }
      // Private helper methods for type checking and conversion
      /**
       * Check if a value is empty (undefined or empty string)
       * @param {unknown} value - Value to check
       * @returns {boolean} True if value is undefined or empty string
       * @private
       */
      isEmpty(value) {
        return value === void 0 || value === "";
      }
      /**
       * Check if a value is a boolean string ('true' or 'false', case-insensitive)
       * @param {string} value - Value to check
       * @returns {boolean} True if value is 'true' or 'false'
       * @private
       */
      isBoolean(value) {
        const normalizedValue = value.toLowerCase();
        return normalizedValue === _StringUtils.BOOLEAN_VALUES.TRUE || normalizedValue === _StringUtils.BOOLEAN_VALUES.FALSE;
      }
      /**
       * Check if a value is an integer string (with optional leading minus sign)
       * @param {string} value - Value to check
       * @returns {boolean} True if value matches integer pattern
       * @private
       */
      isInteger(value) {
        return _StringUtils.PATTERNS.INTEGER.test(value);
      }
      /**
       * Check if a value is a float string (decimal number with optional leading minus sign)
       * @param {string} value - Value to check
       * @returns {boolean} True if value matches float pattern
       * @private
       */
      isFloat(value) {
        return _StringUtils.PATTERNS.FLOAT.test(value);
      }
      /**
       * Check if a numeric string has a leading zero (e.g., '01' or '-01')
       * Leading zeros indicate the value should be kept as a string to preserve formatting
       * @param {string} value - Numeric string value to check
       * @returns {boolean} True if value has a leading zero
       * @private
       */
      hasLeadingZero(value) {
        const isPositiveWithLeadingZero = value.length > 1 && value[0] === "0";
        const isNegativeWithLeadingZero = value.length > 2 && value[0] === "-" && value[1] === "0";
        return isPositiveWithLeadingZero || isNegativeWithLeadingZero;
      }
      /**
       * Convert a boolean string to native boolean value
       * Safely converts 'true' to true and 'false' to false
       * @param {string} value - Boolean string ('true' or 'false')
       * @returns {boolean} Native boolean value
       * @private
       */
      convertToBoolean(value) {
        return JSON.parse(value.toLowerCase());
      }
      /**
       * Convert an integer string to number or keep as string if it has leading zeros
       * Preserves leading zeros in strings (e.g., '007' stays as string)
       * @param {string} value - Integer string to convert
       * @returns {number|string} Number if safe, otherwise string value
       * @private
       */
      convertInteger(value) {
        if (this.hasLeadingZero(value)) {
          return String(value);
        }
        const num = Number(value);
        return Number.isSafeInteger(num) ? num : String(value);
      }
      /**
       * Convert a float string to number or keep as string if conversion is unsafe
       * @param {string} value - Float string to convert
       * @returns {number|string} Number if finite and valid, otherwise string value
       * @private
       */
      convertFloat(value) {
        const num = Number(value);
        return Number.isFinite(num) ? num : String(value);
      }
    };
    module2.exports = new StringUtils();
  }
});

// ../work/iuccio__csvToJson/src/util/jsonUtils.js
var require_jsonUtils = __commonJS({
  "../work/iuccio__csvToJson/src/util/jsonUtils.js"(exports2, module2) {
    "use strict";
    var { JsonValidationError } = require_errors();
    var JsonUtil = class {
      /**
       * Validate that a string is valid JSON
       * @param {string} json - JSON string to validate
       * @throws {JsonValidationError} If JSON is invalid
       */
      validateJson(json) {
        try {
          JSON.parse(json);
        } catch (err) {
          throw new JsonValidationError(json, err);
        }
      }
    };
    module2.exports = new JsonUtil();
  }
});

// ../work/iuccio__csvToJson/src/core/parserConfig.js
var require_parserConfig = __commonJS({
  "../work/iuccio__csvToJson/src/core/parserConfig.js"(exports2, module2) {
    "use strict";
    var ParserConfig = class {
      /**
       * Create a frozen parser configuration snapshot.
       * @param {object} options - Parser configuration options
       * @param {string} [options.delimiter] - Field delimiter
       * @param {string} [options.encoding] - File encoding
       * @param {boolean} [options.isSupportQuotedField] - Support quoted fields
       * @param {boolean} [options.isTrimHeaderFieldWhiteSpace] - Trim whitespace in header names
       * @param {number} [options.indexHeaderValue] - Header row index
       * @param {string} [options.parseSubArrayDelimiter] - Sub-array delimiter character
       * @param {string} [options.parseSubArraySeparator] - Sub-array item separator
       * @param {boolean} [options.printValueFormatByType] - Format values by type
       * @param {function(object, number): object|null} [options.rowMapper] - Row mapper function
       * @param {Array<number>} [options.indexesToIgnore] - Column indexes to ignore
       */
      constructor(options = {}) {
        this.delimiter = options.delimiter;
        this.encoding = options.encoding;
        this.isSupportQuotedField = options.isSupportQuotedField;
        this.isTrimHeaderFieldWhiteSpace = options.isTrimHeaderFieldWhiteSpace;
        this.indexHeaderValue = options.indexHeaderValue;
        this.parseSubArrayDelimiter = options.parseSubArrayDelimiter;
        this.parseSubArraySeparator = options.parseSubArraySeparator;
        this.printValueFormatByType = options.printValueFormatByType;
        this.rowMapper = options.rowMapper;
        this.indexesToIgnore = options.indexesToIgnore ? Object.freeze([...options.indexesToIgnore]) : Object.freeze([]);
        Object.freeze(this);
      }
    };
    module2.exports = ParserConfig;
  }
});

// ../work/iuccio__csvToJson/src/core/configurable.js
var require_configurable = __commonJS({
  "../work/iuccio__csvToJson/src/core/configurable.js"(exports2, module2) {
    "use strict";
    var { ConfigurationError } = require_errors();
    var ParserConfig = require_parserConfig();
    var Configurable = class {
      /**
       * Initialize a configurable parser instance.
       * @param {object} [initialConfig] - Initial parser configuration values
       */
      constructor(initialConfig = {}) {
        this.config = { ...initialConfig };
      }
      /**
       * Enable or disable automatic type formatting for values.
       * @param {boolean} active - Whether to format values by type
       * @returns {this} For method chaining
       */
      formatValueByType(active = true) {
        this.config.printValueFormatByType = active;
        return this;
      }
      /**
       * Enable or disable support for RFC 4180 quoted fields.
       * @param {boolean} active - Whether to support quoted fields
       * @returns {this} For method chaining
       */
      supportQuotedField(active = false) {
        this.config.isSupportQuotedField = active;
        return this;
      }
      /**
       * Set the field delimiter character.
       * @param {string} delimiter - Character(s) to use as field separator
       * @returns {this} For method chaining
       */
      fieldDelimiter(delimiter) {
        this.config.delimiter = delimiter;
        return this;
      }
      /**
       * Configure whitespace handling in header field names.
       * @param {boolean} active - Whether to trim whitespace in header names
       * @returns {this} For method chaining
       */
      trimHeaderFieldWhiteSpace(active = false) {
        this.config.isTrimHeaderFieldWhiteSpace = active;
        return this;
      }
      /**
       * Set the row index where CSV headers are located.
       * @param {number} indexHeaderValue - Zero-based row index containing headers
       * @returns {this} For method chaining
       */
      indexHeader(indexHeaderValue) {
        if (isNaN(indexHeaderValue)) {
          throw ConfigurationError.invalidHeaderIndex(indexHeaderValue);
        }
        this.config.indexHeaderValue = indexHeaderValue;
        return this;
      }
      /**
       * Configure sub-array parsing for special field values.
       * @param {string} delimiter - Bracket character
       * @param {string} separator - Item separator within brackets
       * @returns {this} For method chaining
       */
      parseSubArray(delimiter = "*", separator = ",") {
        this.config.parseSubArrayDelimiter = delimiter;
        this.config.parseSubArraySeparator = separator;
        return this;
      }
      /**
       * Set a mapper function for row transformation.
       * @param {function(object, number): object|null} mapperFn - Function receiving (row, index)
       * @returns {this} For method chaining
       */
      mapRows(mapperFn) {
        if (typeof mapperFn !== "function") {
          throw new TypeError("mapperFn must be a function");
        }
        this.config.rowMapper = mapperFn;
        return this;
      }
      /**
       * Configure column indexes to exclude from output.
       * @param {Array<number>} indexes - Column indexes to ignore
       * @returns {this} For method chaining
       */
      ignoreColumnIndexes(indexes) {
        this.config.indexesToIgnore = Array.isArray(indexes) ? [...indexes] : [...indexes];
        return this;
      }
      /**
       * Set the file encoding for reading CSV files.
       * @param {string} encoding - Node.js supported encoding
       * @returns {this} For method chaining
       */
      encoding(encoding) {
        this.config.encoding = encoding;
        return this;
      }
      /**
       * Create an immutable parser configuration snapshot.
       * @returns {ParserConfig} Frozen parser configuration
       */
      getParserConfig() {
        return new ParserConfig(this.config);
      }
    };
    module2.exports = Configurable;
  }
});

// ../work/iuccio__csvToJson/src/csvToJson.js
var require_csvToJson = __commonJS({
  "../work/iuccio__csvToJson/src/csvToJson.js"(exports2, module2) {
    "use strict";
    var fileUtils = require_fileUtils();
    var stringUtils = require_stringUtils();
    var jsonUtils = require_jsonUtils();
    var {
      ConfigurationError,
      CsvFormatError: CsvFormatError2,
      JsonValidationError
    } = require_errors();
    var Configurable = require_configurable();
    var ParserConfig = require_parserConfig();
    var DEFAULT_FIELD_DELIMITER = ",";
    var QUOTE_CHAR = '"';
    var CRLF = "\r\n";
    var LF = "\n";
    var CR = "\r";
    var CsvToJson = class extends Configurable {
      /**
       * Parse CSV content using a frozen configuration snapshot.
       * @param {string} parsedCsv - Raw CSV content as string
       * @param {ParserConfig} config - Frozen parser configuration
       * @returns {Array<object>} Parsed JSON array
       */
      csvToJsonWithConfig(parsedCsv, config) {
        this.validateInputConfig(config);
        const records = this.parseRecords(parsedCsv);
        const fieldDelimiter = this.getFieldDelimiter(config);
        let index = this.getIndexHeader(config);
        let headers;
        while (index < records.length) {
          headers = this.getFields(records[index], config, fieldDelimiter);
          if (stringUtils.hasContent(headers)) {
            break;
          }
          index++;
        }
        if (!headers) {
          throw CsvFormatError2.missingHeader();
        }
        const jsonResult = [];
        for (let i = index + 1; i < records.length; i++) {
          const currentLine = this.getFields(records[i], config, fieldDelimiter);
          if (stringUtils.hasContent(currentLine)) {
            let row = this.buildJsonResult(headers, currentLine, config);
            if (config.rowMapper) {
              row = config.rowMapper(row, i - (index + 1));
              if (row != null) {
                jsonResult.push(row);
              }
            } else {
              jsonResult.push(row);
            }
          }
        }
        return jsonResult;
      }
      /**
       * Read a CSV file and write the parsed JSON to an output file
       * @param {string} fileInputName - Path to input CSV file
       * @param {string} fileOutputName - Path to output JSON file
       * @throws {FileOperationError} If file read or write fails
       * @throws {CsvFormatError} If CSV is malformed
       */
      generateJsonFileFromCsv(fileInputName, fileOutputName) {
        let jsonStringified = this.getJsonFromCsvStringified(fileInputName);
        fileUtils.writeFile(jsonStringified, fileOutputName);
      }
      /**
       * Read a CSV file and return parsed data as stringified JSON
       * @param {string} fileInputName - Path to input CSV file
       * @returns {string} JSON stringified array of objects
       * @throws {FileOperationError} If file read fails
       * @throws {CsvFormatError} If CSV is malformed
       * @throws {JsonValidationError} If JSON generation fails
       * @example
       * const csvToJson = require('convert-csv-to-json');
       * const jsonString = csvToJson.getJsonFromCsvStringified('resource/input.csv');
       * console.log(jsonString);
       */
      getJsonFromCsvStringified(fileInputName) {
        let json = this.getJsonFromCsv(fileInputName);
        let jsonStringified = JSON.stringify(json, void 0, 1);
        jsonUtils.validateJson(jsonStringified);
        return jsonStringified;
      }
      /**
       * Read a CSV file and return parsed data as JSON array of objects
       * @param {string} fileInputName - Path to input CSV file
       * @returns {Array<object>} Array of objects representing CSV rows
       * @throws {FileOperationError} If file read fails
       * @throws {CsvFormatError} If CSV is malformed
       * @example
       * const csvToJson = require('convert-csv-to-json');
       * const rows = csvToJson.getJsonFromCsv('resource/input.csv');
       * console.log(rows);
       */
      getJsonFromCsv(fileInputName) {
        const config = this.getParserConfig();
        const parsedCsv = fileUtils.readFile(fileInputName, config.encoding || "utf8");
        return this.csvToJson(parsedCsv);
      }
      /**
       * Parse CSV string content and return as JSON array of objects
       * @param {string} csvString - CSV content as string
       * @returns {Array<object>} Array of objects representing CSV rows
       * @throws {CsvFormatError} If CSV is malformed
       * @example
       * const csvToJson = require('convert-csv-to-json');
       * const rows = csvToJson.csvStringToJson('name,age\nAlice,30');
       * console.log(rows); // [{ name: 'Alice', age: '30' }]
       */
      csvStringToJson(csvString) {
        return this.csvToJson(csvString);
      }
      /**
       * Parse CSV string content and return as stringified JSON
       * @param {string} csvString - CSV content as string
       * @returns {string} JSON stringified array of objects
       * @throws {CsvFormatError} If CSV is malformed
       * @throws {JsonValidationError} If JSON generation fails
       * @example
       * const csvToJson = require('convert-csv-to-json');
       * const jsonString = csvToJson.csvStringToJsonStringified('name,age\nAlice,30');
       * console.log(jsonString);
       */
      csvStringToJsonStringified(csvString) {
        let json = this.csvStringToJson(csvString);
        let jsonStringified = JSON.stringify(json, void 0, 1);
        jsonUtils.validateJson(jsonStringified);
        return jsonStringified;
      }
      /**
       * Core CSV parsing logic - converts CSV string to JSON array
       * Handles quoted fields per RFC 4180 when configured
       * Applies row mapping and filtering when configured
       * @param {string} parsedCsv - Raw CSV content as string
       * @returns {Array<object>} Array of objects with CSV data
       * @private
       */
      csvToJson(parsedCsv) {
        return this.csvToJsonWithConfig(parsedCsv, this.getParserConfig());
      }
      /**
       * Parse CSV content into individual records, respecting quoted fields that may span multiple lines.
       * RFC 4180 compliant parsing - handles quoted fields that may contain newlines.
       * @param {string} csvContent - The raw CSV content
       * @returns {string[]} Array of record strings
       */
      parseRecords(csvContent) {
        let records = [];
        let currentRecord = "";
        let insideQuotes = false;
        let i = 0;
        while (i < csvContent.length) {
          let char = csvContent[i];
          if (char === QUOTE_CHAR) {
            if (insideQuotes && i + 1 < csvContent.length && csvContent[i + 1] === QUOTE_CHAR) {
              currentRecord += QUOTE_CHAR + QUOTE_CHAR;
              i += 2;
            } else {
              insideQuotes = !insideQuotes;
              currentRecord += char;
              i++;
            }
            continue;
          }
          if (!insideQuotes) {
            let lineEndingLength = this.getLineEndingLength(csvContent, i);
            if (lineEndingLength > 0) {
              records.push(currentRecord);
              currentRecord = "";
              i += lineEndingLength;
              continue;
            }
          }
          currentRecord += char;
          i++;
        }
        if (currentRecord.length > 0) {
          records.push(currentRecord);
        }
        if (insideQuotes) {
          throw CsvFormatError2.mismatchedQuotes("CSV");
        }
        return records;
      }
      /**
       * Get the length of line ending at current position (CRLF=2, LF=1, CR=1, or 0)
       * @param {string} content - CSV content
       * @param {number} index - Current index to check
       * @returns {number} Length of line ending (0 if none)
       */
      getLineEndingLength(content, index) {
        if (content.slice(index, index + 2) === CRLF) {
          return 2;
        }
        if (content[index] === LF) {
          return 1;
        }
        if (content[index] === CR && content[index + 1] !== LF) {
          return 1;
        }
        return 0;
      }
      /**
       * Get the configured field delimiter, or default if not set
       * @param {ParserConfig} [config] - Parser configuration
       * @returns {string} Field delimiter character
       * @private
       */
      getFieldDelimiter(config = this.config) {
        if (config.delimiter) {
          return config.delimiter;
        }
        return DEFAULT_FIELD_DELIMITER;
      }
      /**
       * Get the configured header row index, or default (0) if not set
       * @param {ParserConfig} [config] - Parser configuration
       * @returns {number} Header row index
       * @private
       */
      getIndexHeader(config = this.config) {
        if (config.indexHeaderValue !== null && !isNaN(config.indexHeaderValue)) {
          return config.indexHeaderValue;
        }
        return 0;
      }
      /**
       * Get fields for a CSV record line according to configured parser rules.
       * Uses quoted-field splitting when RFC 4180 support is enabled.
       * @param {string} line - CSV record line
       * @param {ParserConfig} [config] - Parser configuration
       * @param {string} [fieldDelimiter] - Field delimiter
       * @returns {string[]} Parsed fields
       * @private
       */
      getFields(line, config = this.config, fieldDelimiter = this.getFieldDelimiter(config)) {
        if (config.isSupportQuotedField) {
          return this.split(line, config);
        }
        return line.split(fieldDelimiter);
      }
      /**
       * Build a JSON object from headers and field values
       * Applies type formatting and sub-array parsing as configured
       * @param {string[]} headers - Array of header field names
       * @param {string[]} currentLine - Array of field values
       * @param {ParserConfig} [config] - Frozen parser configuration
       * @returns {object} JSON object with header names as keys
       * @private
       */
      buildJsonResult(headers, currentLine, config = this.config) {
        let jsonObject = {};
        const ignoredIndexes = config.indexesToIgnore ? new Set(config.indexesToIgnore) : /* @__PURE__ */ new Set();
        for (let j = 0; j < headers.length; j++) {
          if (ignoredIndexes.has(j)) {
            continue;
          }
          let propertyName = stringUtils.trimPropertyName(config.isTrimHeaderFieldWhiteSpace, headers[j]);
          let value = currentLine[j];
          if (this.isParseSubArray(value, config)) {
            value = this.buildJsonSubArray(value, config);
          }
          if (config.printValueFormatByType && !Array.isArray(value)) {
            value = stringUtils.getValueFormatByType(currentLine[j]);
          }
          jsonObject[propertyName] = value;
        }
        return jsonObject;
      }
      /**
       * Parse a field value into a sub-array using configured delimiter and separator
       * @param {string} value - Field value to parse
       * @param {ParserConfig} [config] - Frozen parser configuration
       * @returns {Array<string|number|boolean>} Array of parsed values
       * @private
       */
      buildJsonSubArray(value, config = this.config) {
        let extractedValues = value.substring(
          value.indexOf(config.parseSubArrayDelimiter) + 1,
          value.lastIndexOf(config.parseSubArrayDelimiter)
        );
        extractedValues.trim();
        value = extractedValues.split(config.parseSubArraySeparator);
        if (config.printValueFormatByType) {
          for (let i = 0; i < value.length; i++) {
            value[i] = stringUtils.getValueFormatByType(value[i]);
          }
        }
        return value;
      }
      /**
       * Check if a field value should be parsed as a sub-array
       * @param {string} value - Field value to check
       * @param {ParserConfig} [config] - Frozen parser configuration
       * @returns {boolean} True if value is bracketed with sub-array delimiter
       * @private
       */
      isParseSubArray(value, config = this.config) {
        if (config.parseSubArrayDelimiter) {
          if (value && (value.indexOf(config.parseSubArrayDelimiter) === 0 && value.lastIndexOf(config.parseSubArrayDelimiter) === value.length - 1)) {
            return true;
          }
        }
        return false;
      }
      /**
       * Validate configuration for conflicts and incompatibilities
       * @param {ParserConfig} [config] - Parser configuration
       * @throws {ConfigurationError} If incompatible options are set
       * @private
       */
      validateInputConfig(config = this.config) {
        if (config.isSupportQuotedField) {
          if (this.getFieldDelimiter(config) === '"') {
            throw ConfigurationError.quotedFieldConflict("fieldDelimiter", '"');
          }
          if (config.parseSubArraySeparator === '"') {
            throw ConfigurationError.quotedFieldConflict("parseSubArraySeparator", '"');
          }
          if (config.parseSubArrayDelimiter === '"') {
            throw ConfigurationError.quotedFieldConflict("parseSubArrayDelimiter", '"');
          }
        }
      }
      /**
       * Check if a line contains quote characters
       * @param {string} line - Line to check
       * @returns {boolean} True if line contains quotes
       * @private
       */
      hasQuotes(line) {
        return line.includes('"');
      }
      /**
       * Split a CSV record line into fields, respecting quoted fields per RFC 4180.
       * Handles:
       * - Quoted fields with embedded delimiters and newlines
       * - Escaped quotes (double quotes within quoted fields)
       * - Empty quoted fields
       * @param {string} line - A single CSV record line
       * @param {ParserConfig} [config] - Parser configuration
       * @returns {string[]} Array of field values
       */
      split(line, config = this.config) {
        if (line.length === 0) {
          return [];
        }
        let fields = [];
        let currentField = "";
        let insideQuotes = false;
        let delimiter = this.getFieldDelimiter(config);
        for (let i = 0; i < line.length; i++) {
          let char = line[i];
          if (char === QUOTE_CHAR) {
            if (this.isEscapedQuote(line, i, insideQuotes)) {
              currentField += QUOTE_CHAR;
              i++;
            } else if (this.isEmptyQuotedField(line, i, insideQuotes, currentField, delimiter)) {
              i++;
            } else {
              insideQuotes = !insideQuotes;
            }
          } else if (char === delimiter && !insideQuotes) {
            fields.push(currentField);
            currentField = "";
          } else {
            currentField += char;
          }
        }
        fields.push(currentField);
        if (insideQuotes) {
          throw CsvFormatError2.mismatchedQuotes("row");
        }
        return fields;
      }
      /**
       * Check if character at index is an escaped quote (double quote)
       * Escaped quotes appear as "" within quoted fields per RFC 4180
       * @param {string} line - Line being parsed
       * @param {number} index - Character index to check
       * @param {boolean} insideQuoted - Whether currently inside a quoted field
       * @returns {boolean} True if character is an escaped quote
       * @private
       */
      isEscapedQuote(line, index, insideQuoted) {
        return insideQuoted && index + 1 < line.length && line[index + 1] === QUOTE_CHAR;
      }
      /**
       * Check if this is an empty quoted field: "" before delimiter or end of line
       * @param {string} line - Line being parsed
       * @param {number} index - Character index to check
       * @param {boolean} insideQuoted - Whether currently inside a quoted field
       * @param {string} currentField - Current field accumulation
       * @param {string} delimiter - Field delimiter character
       * @returns {boolean} True if this represents an empty quoted field
       * @private
       */
      isEmptyQuotedField(line, index, insideQuoted, currentField, delimiter) {
        if (insideQuoted || currentField !== "" || index + 1 >= line.length) {
          return false;
        }
        let nextChar = line[index + 1];
        if (nextChar !== QUOTE_CHAR) {
          return false;
        }
        let afterQuotes = index + 2;
        return afterQuotes === line.length || line[afterQuotes] === delimiter;
      }
    };
    module2.exports = new CsvToJson();
    module2.exports.CsvToJson = CsvToJson;
  }
});

// ../work/iuccio__csvToJson/src/core/streamProcessor.js
var require_streamProcessor = __commonJS({
  "../work/iuccio__csvToJson/src/core/streamProcessor.js"(exports2, module2) {
    "use strict";
    var stringUtils = require_stringUtils();
    var QUOTE_CHAR = '"';
    var CRLF = "\r\n";
    var LF = "\n";
    var CR = "\r";
    var StreamProcessor = class {
      /**
       * Initialize the stream processor with CSV configuration
       * @param {object} csvConfig - The CSV configuration object
       * @param {object} options - Environment options
       * @param {boolean} options.isBrowser - Whether running in browser environment
       * @param {number} options.chunkSize - Number of rows per chunk for callback processing
       * @param {function(Array<object>, number, number): void} [options.onChunk] - Callback for each chunk
       * @param {function(Array<object>): void} [options.onComplete] - Callback when processing complete
       * @param {function(Error): void} [options.onError] - Callback for errors
       */
      constructor(csvConfig, options = {}) {
        this.csvConfig = csvConfig;
        this.isBrowser = options.isBrowser || typeof window !== "undefined" && typeof document !== "undefined";
        this.buffer = "";
        this.isInsideQuotes = false;
        this.headers = null;
        this.headerRowIndex = csvConfig.indexHeaderValue !== null && !isNaN(csvConfig.indexHeaderValue) ? csvConfig.indexHeaderValue : 0;
        this.currentRecordIndex = 0;
        this.parsedRecords = [];
        this.dataRowIndex = 0;
        this.ignoredIndexes = new Set(csvConfig.indexesToIgnore || []);
        this.chunkSize = options.chunkSize || 1e3;
        this.onChunk = options.onChunk;
        this.onComplete = options.onComplete;
        this.onError = options.onError;
        this.allRecords = [];
      }
      /**
       * Process a chunk of data from the stream
       * @param {Buffer|string|Uint8Array} chunk - The data chunk to process
       */
      processChunk(chunk) {
        let chunkString;
        if (typeof chunk === "string") {
          chunkString = chunk;
        } else if (this.isBrowser && typeof globalThis.TextDecoder !== "undefined") {
          chunkString = new globalThis.TextDecoder().decode(chunk);
        } else if (this.isBrowser) {
          chunkString = String.fromCharCode.apply(null, new Uint8Array(chunk));
        } else {
          chunkString = chunk.toString();
        }
        this.buffer += chunkString;
        this._processCompleteRecords();
      }
      /**
       * Process a stream with chunked callbacks (for large files)
       * @param {object} stream - The stream to process (Node.js Readable or browser ReadableStream)
       * @returns {Promise<void>} Promise that resolves when streaming starts
       */
      async processStreamWithCallbacks(stream) {
        return new Promise((resolve, reject) => {
          if (this.isBrowser) {
            if (!stream || typeof stream.getReader !== "function") {
              const error = new Error("Invalid ReadableStream provided");
              if (this.onError) this.onError(error);
              reject(error);
              return;
            }
            const reader = stream.getReader();
            const processChunk = async () => {
              try {
                while (true) {
                  const { done, value } = await reader.read();
                  if (done) {
                    this.finalizeProcessing();
                    this._sendRemainingChunks();
                    if (this.onComplete) this.onComplete(this.allRecords);
                    resolve();
                    return;
                  }
                  this.processChunk(value);
                  this._sendPendingChunks();
                }
              } catch (error) {
                if (this.onError) this.onError(error);
                reject(error);
              }
            };
            processChunk();
          } else {
            if (!stream || typeof stream.pipe !== "function") {
              const error = new Error("Invalid Readable stream provided");
              if (this.onError) this.onError(error);
              reject(error);
              return;
            }
            stream.on("data", (chunk) => {
              try {
                this.processChunk(chunk);
                this._sendPendingChunks();
              } catch (error) {
                if (this.onError) this.onError(error);
                reject(error);
              }
            });
            stream.on("end", () => {
              try {
                this.finalizeProcessing();
                this._sendRemainingChunks();
                if (this.onComplete) this.onComplete(this.allRecords);
                resolve();
              } catch (error) {
                if (this.onError) this.onError(error);
                reject(error);
              }
            });
            stream.on("error", (error) => {
              if (this.onError) this.onError(error);
              reject(error);
            });
          }
        });
      }
      /**
       * Send pending chunks when they reach the chunk size
       * @private
       */
      _sendPendingChunks() {
        if (!this.onChunk) return;
        while (this.parsedRecords.length >= this.chunkSize) {
          const chunk = this.parsedRecords.splice(0, this.chunkSize);
          this.allRecords.push(...chunk);
          this.onChunk(chunk, this.allRecords.length, null);
        }
      }
      /**
       * Send any remaining chunks at the end of processing
       * @private
       */
      _sendRemainingChunks() {
        if (!this.onChunk || this.parsedRecords.length === 0) return;
        const chunk = [...this.parsedRecords];
        this.parsedRecords.length = 0;
        this.allRecords.push(...chunk);
        this.onChunk(chunk, this.allRecords.length, this.allRecords.length);
      }
      /**
       * Process a stream directly (unified interface for both environments)
       * @param {object} stream - The stream to process (Node.js Readable or browser ReadableStream)
       * @returns {Promise<Array<object>>} Promise resolving to parsed records
       */
      async processStream(stream) {
        return new Promise((resolve, reject) => {
          if (this.isBrowser) {
            if (!stream || typeof stream.getReader !== "function") {
              reject(new Error("Invalid ReadableStream provided"));
              return;
            }
            const reader = stream.getReader();
            const processChunk = async () => {
              try {
                while (true) {
                  const { done, value } = await reader.read();
                  if (done) {
                    this.finalizeProcessing();
                    resolve(this.getResult());
                    return;
                  }
                  this.processChunk(value);
                }
              } catch (error) {
                reject(error);
              }
            };
            processChunk();
          } else {
            if (!stream || typeof stream.pipe !== "function") {
              reject(new Error("Invalid Readable stream provided"));
              return;
            }
            stream.on("data", (chunk) => {
              try {
                this.processChunk(chunk);
              } catch (error) {
                reject(error);
              }
            });
            stream.on("end", () => {
              try {
                this.finalizeProcessing();
                resolve(this.getResult());
              } catch (error) {
                reject(error);
              }
            });
            stream.on("error", (error) => {
              reject(error);
            });
          }
        });
      }
      /**
       * Finalize processing when the stream ends
       */
      finalizeProcessing() {
        this._processRemainingBuffer();
        this._validateProcessingResult();
      }
      /**
       * Get the final processed result
       * @returns {Array<object>} Array of parsed JSON objects
       */
      getResult() {
        return this.parsedRecords;
      }
      /**
       * Process all complete records currently in the buffer
       * @private
       */
      _processCompleteRecords() {
        const parseResult = this._parseRecordsFromBuffer(this.buffer, this.isInsideQuotes);
        this.buffer = parseResult.remainingBuffer;
        this.isInsideQuotes = parseResult.isInsideQuotes;
        for (const record of parseResult.completeRecords) {
          this._processRecord(record);
          this.currentRecordIndex++;
        }
      }
      /**
       * Process any remaining buffer content when stream ends
       * @private
       */
      _processRemainingBuffer() {
        if (this.buffer.length > 0) {
          if (this.isInsideQuotes) {
            throw CsvFormatError.mismatchedQuotes("CSV stream");
          }
          const parseResult = this._parseRecordsFromBuffer(this.buffer + "\n", false);
          for (const record of parseResult.completeRecords) {
            this._processRecord(record);
            this.currentRecordIndex++;
          }
        }
      }
      /**
       * Process a single CSV record
       * @param {string} record - The CSV record to process
       * @private
       */
      _processRecord(record) {
        if (this.headers === null && this.currentRecordIndex === this.headerRowIndex) {
          this._processHeaderRecord(record);
        } else if (this.headers !== null) {
          this._processDataRecord(record);
        }
      }
      /**
       * Process a header record
       * @param {string} record - The header record
       * @private
       */
      _processHeaderRecord(record) {
        const headerFields = this._splitRecord(record);
        if (stringUtils.hasContent(headerFields)) {
          this.headers = headerFields;
        }
      }
      /**
       * Process a data record
       * @param {string} record - The data record
       * @private
       */
      _processDataRecord(record) {
        const dataFields = this._splitRecord(record);
        if (stringUtils.hasContent(dataFields)) {
          const row = this._buildJsonResult(this.headers, dataFields);
          const processedRow = this._applyRowMapper(row);
          if (processedRow !== null) {
            this.parsedRecords.push(processedRow);
          }
        }
      }
      /**
       * Apply row mapper function if configured
       * @param {object} row - The parsed row object
       * @returns {object|null} The processed row or null if filtered out
       * @private
       */
      _applyRowMapper(row) {
        if (this.csvConfig.rowMapper) {
          const mappedRow = this.csvConfig.rowMapper(row, this.dataRowIndex);
          this.dataRowIndex++;
          return mappedRow;
        }
        this.dataRowIndex++;
        return row;
      }
      /**
       * Split a CSV record into fields based on configuration
       * @param {string} record - The record to split
       * @returns {string[]} Array of field values
       * @private
       */
      _splitRecord(record) {
        if (this.csvConfig.isSupportQuotedField) {
          return this._splitWithConfig(record, this.csvConfig);
        }
        return record.split(this.csvConfig.delimiter || ",");
      }
      /**
       * Split a CSV line into fields using parser configuration rules
       * @param {string} line - The CSV line to split
       * @param {object} config - The CSV parser configuration object
       * @returns {string[]} Array of parsed field values
       * @private
       */
      _splitWithConfig(line, config) {
        if (line.length === 0) {
          return [];
        }
        const fields = [];
        let currentField = "";
        let insideQuotes = false;
        const delimiter = config.delimiter || ",";
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === QUOTE_CHAR) {
            if (insideQuotes && i + 1 < line.length && line[i + 1] === QUOTE_CHAR) {
              currentField += QUOTE_CHAR;
              i++;
            } else {
              insideQuotes = !insideQuotes;
            }
          } else if (char === delimiter && !insideQuotes) {
            fields.push(currentField);
            currentField = "";
          } else {
            currentField += char;
          }
        }
        fields.push(currentField);
        if (insideQuotes) {
          throw CsvFormatError.mismatchedQuotes("row");
        }
        return fields;
      }
      /**
       * Convert a parsed CSV row into a JSON object using header names
       * @param {string[]} headers - Array of header names
       * @param {string[]} currentLine - Array of field values for the current row
       * @returns {object} Parsed row object keyed by header names
       * @private
       */
      _buildJsonResult(headers, currentLine) {
        const jsonObject = {};
        for (let j = 0; j < headers.length; j++) {
          if (this.ignoredIndexes.has(j)) {
            continue;
          }
          const propertyName = stringUtils.trimPropertyName(this.csvConfig.isTrimHeaderFieldWhiteSpace, headers[j]);
          let value = currentLine[j];
          if (this._isParseSubArray(value)) {
            value = this._buildJsonSubArray(value);
          }
          if (this.csvConfig.printValueFormatByType && !Array.isArray(value)) {
            value = stringUtils.getValueFormatByType(currentLine[j]);
          }
          jsonObject[propertyName] = value;
        }
        return jsonObject;
      }
      /**
       * Determine whether a field value represents a sub-array expression
       * @param {string} value - The field value to inspect
       * @returns {boolean} True when the value is wrapped in the configured sub-array delimiters
       * @private
       */
      _isParseSubArray(value) {
        if (this.csvConfig.parseSubArrayDelimiter) {
          return value && (value.indexOf(this.csvConfig.parseSubArrayDelimiter) === 0 && value.lastIndexOf(this.csvConfig.parseSubArrayDelimiter) === value.length - 1);
        }
        return false;
      }
      /**
       * Parse a field value into a JSON sub-array based on configured delimiters and separators
       * @param {string} value - The quoted sub-array string to parse
       * @returns {Array<string|number|boolean>} Parsed sub-array values
       * @private
       */
      _buildJsonSubArray(value) {
        const extractedValues = value.substring(
          value.indexOf(this.csvConfig.parseSubArrayDelimiter) + 1,
          value.lastIndexOf(this.csvConfig.parseSubArrayDelimiter)
        );
        const items = extractedValues.split(this.csvConfig.parseSubArraySeparator);
        if (this.csvConfig.printValueFormatByType) {
          for (let i = 0; i < items.length; i++) {
            items[i] = stringUtils.getValueFormatByType(items[i]);
          }
        }
        return items;
      }
      /**
       * Parse complete records from buffer, handling quoted fields across chunks
       * @param {string} buffer - Current buffer content
       * @param {boolean} insideQuotes - Whether we're currently inside quotes
       * @returns {object} Object with completeRecords array and remaining buffer/quote state
       * @private
       */
      _parseRecordsFromBuffer(buffer, insideQuotes) {
        const completeRecords = [];
        let currentRecord = "";
        let i = 0;
        while (i < buffer.length) {
          const char = buffer[i];
          if (char === QUOTE_CHAR) {
            const escapedQuoteResult = this._handleEscapedQuote(buffer, i, insideQuotes);
            if (escapedQuoteResult.wasEscaped) {
              currentRecord += QUOTE_CHAR + QUOTE_CHAR;
              i = escapedQuoteResult.newIndex;
              continue;
            } else {
              insideQuotes = !insideQuotes;
            }
          } else if (!insideQuotes && this._isLineEnding(buffer, i)) {
            const lineEndingLength = this._getLineEndingLength(buffer, i);
            completeRecords.push(currentRecord);
            currentRecord = "";
            i += lineEndingLength;
            continue;
          }
          currentRecord += char;
          i++;
        }
        return {
          completeRecords,
          remainingBuffer: currentRecord,
          isInsideQuotes: insideQuotes
        };
      }
      /**
       * Handle escaped quotes in quoted fields
       * @param {string} buffer - The buffer content
       * @param {number} index - Current index in buffer
       * @param {boolean} insideQuotes - Whether currently inside quotes
       * @returns {object} Result indicating if quote was escaped and new index
       * @private
       */
      _handleEscapedQuote(buffer, index, insideQuotes) {
        if (insideQuotes && index + 1 < buffer.length && buffer[index + 1] === QUOTE_CHAR) {
          return { wasEscaped: true, newIndex: index + 2 };
        }
        return { wasEscaped: false, newIndex: index + 1 };
      }
      /**
       * Check if character at index is a line ending
       * @param {string} buffer - The buffer content
       * @param {number} index - Current index
       * @returns {boolean} True if line ending
       * @private
       */
      _isLineEnding(buffer, index) {
        return this._getLineEndingLength(buffer, index) > 0;
      }
      /**
       * Get the length of line ending at current position
       * @param {string} content - Content to check
       * @param {number} index - Current index
       * @returns {number} Length of line ending
       * @private
       */
      _getLineEndingLength(content, index) {
        if (content.slice(index, index + 2) === CRLF) {
          return 2;
        }
        if (content[index] === LF) {
          return 1;
        }
        if (content[index] === CR && content[index + 1] !== LF) {
          return 1;
        }
        return 0;
      }
      /**
       * Validate the final processing result
       * @private
       */
      _validateProcessingResult() {
        if (!this.headers && this.parsedRecords.length === 0) {
          return;
        }
        if (!this.headers) {
          throw CsvFormatError.missingHeader();
        }
      }
    };
    module2.exports = StreamProcessor;
  }
});

// ../work/iuccio__csvToJson/src/csvToJsonAsync.js
var require_csvToJsonAsync = __commonJS({
  "../work/iuccio__csvToJson/src/csvToJsonAsync.js"(exports2, module2) {
    "use strict";
    var fileUtils = require_fileUtils();
    var csvToJson2 = require_csvToJson();
    var Configurable = require_configurable();
    var { InputValidationError } = require_errors();
    var StreamProcessor = require_streamProcessor();
    var CsvToJsonAsync = class extends Configurable {
      /**
       * Constructor initializes proxy to sync csvToJson instance
       */
      constructor() {
        super();
        this.csvToJson = csvToJson2;
      }
      /**
       * Read a CSV file and write parsed JSON to an output file (async)
       * @param {string} fileInputName - Path to input CSV file
       * @param {string} fileOutputName - Path to output JSON file
       * @returns {Promise<void>}
       * @throws {FileOperationError} If file operations fail
       * @throws {CsvFormatError} If CSV is malformed
       */
      async generateJsonFileFromCsv(fileInputName, fileOutputName) {
        const jsonStringified = await this.getJsonFromCsvStringified(fileInputName);
        await fileUtils.writeFileAsync(jsonStringified, fileOutputName);
      }
      /**
       * Read a CSV file and return parsed data as stringified JSON (async)
       * @param {string} fileInputName - Path to input CSV file
       * @returns {Promise<string>} JSON stringified array of objects
       * @throws {FileOperationError} If file read fails
       * @throws {CsvFormatError} If CSV is malformed
       */
      async getJsonFromCsvStringified(fileInputName) {
        const json = await this.getJsonFromCsvAsync(fileInputName);
        return JSON.stringify(json, void 0, 1);
      }
      /**
       * Main async API method for reading CSV and returning parsed JSON
       * Supports reading from file path or parsing CSV string content
       * @param {string} inputFileNameOrCsv - File path or CSV string content
       * @param {object} options - Configuration options
       * @param {boolean} options.raw - If true, treats input as CSV string; if false, reads from file
       * @returns {Promise<Array<object>>} Array of objects representing CSV rows
       * @throws {InputValidationError} If input is invalid
       * @throws {FileOperationError} If file read fails
       * @throws {CsvFormatError} If CSV is malformed
       * @example
       * const csvToJson = require('convert-csv-to-json');
       * const data = await csvToJson.getJsonFromCsvAsync('resource/input.csv');
       * console.log(data);
       */
      async getJsonFromCsvAsync(inputFileNameOrCsv, options = {}) {
        if (inputFileNameOrCsv === null || inputFileNameOrCsv === void 0) {
          throw new InputValidationError(
            "inputFileNameOrCsv",
            "string (file path) or CSV string content",
            `${typeof inputFileNameOrCsv}`,
            "Either provide a valid file path or CSV content as a string."
          );
        }
        const config = this.getParserConfig();
        if (options.raw) {
          if (inputFileNameOrCsv === "") {
            return [];
          }
          return this.csvToJson.csvToJsonWithConfig(inputFileNameOrCsv, config);
        }
        const parsedCsv = await fileUtils.readFileAsync(inputFileNameOrCsv, config.encoding || "utf8");
        return this.csvToJson.csvToJsonWithConfig(parsedCsv, config);
      }
      /**
       * Parse CSV string to JSON array (async)
       * @param {string} csvString - CSV content as string
       * @param {object} options - Configuration options (default: { raw: true })
       * @returns {Promise<Array<object>>} Array of objects representing CSV rows
       * @throws {CsvFormatError} If CSV is malformed
       * @example
       * const csvToJson = require('convert-csv-to-json');
       * const data = await csvToJson.csvStringToJsonAsync('name,age\nAlice,30');
       * console.log(data);
       */
      csvStringToJsonAsync(csvString, options = { raw: true }) {
        return this.getJsonFromCsvAsync(csvString, options);
      }
      /**
       * Parse CSV from a Readable stream and return parsed data as JSON array
       * Processes data in chunks for memory-efficient handling of large files
       * @param {object} stream - Node.js Readable stream containing CSV data
       * @returns {Promise<Array<object>>} Promise resolving to array of objects representing CSV rows
       * @throws {InputValidationError} If stream is invalid
       * @throws {CsvFormatError} If CSV is malformed
       * @example
       * const fs = require('fs');
       * const csvToJson = require('convert-csv-to-json');
       * const stream = fs.createReadStream('large.csv');
       * const data = await csvToJson.getJsonFromStreamAsync(stream);
       * console.log(data);
       */
      async getJsonFromStreamAsync(stream) {
        this._validateStream(stream);
        const config = this.getParserConfig();
        const streamProcessor = new StreamProcessor(config, { isBrowser: false });
        return streamProcessor.processStream(stream);
      }
      /**
       * Validate that the provided stream is a valid Readable stream
       * @param {object} stream - The stream to validate
       * @throws {InputValidationError} If stream is invalid
       * @private
       */
      _validateStream(stream) {
        if (!stream || typeof stream.pipe !== "function") {
          throw new InputValidationError(
            "stream",
            "Readable stream",
            typeof stream,
            "Provide a valid Node.js Readable stream."
          );
        }
      }
      /**
       * Parse CSV from a file path using streaming for memory-efficient processing
       * @param {string} filePath - Path to the CSV file
       * @returns {Promise<Array<object>>} Promise resolving to array of objects representing CSV rows
       * @throws {InputValidationError} If filePath is invalid
       * @throws {FileOperationError} If file cannot be read
       * @throws {CsvFormatError} If CSV is malformed
       * @example
       * const csvToJson = require('convert-csv-to-json');
       * const data = await csvToJson.getJsonFromFileStreamingAsync('large.csv');
       * console.log(data);
       */
      async getJsonFromFileStreamingAsync(filePath) {
        if (!filePath || typeof filePath !== "string") {
          throw new InputValidationError(
            "filePath",
            "string (file path)",
            typeof filePath,
            "Provide a valid file path as a string."
          );
        }
        const fs = require("fs");
        const config = this.getParserConfig();
        const encoding = typeof config.encoding === "string" ? config.encoding : "utf8";
        const stream = fs.createReadStream(filePath, { encoding });
        return this.getJsonFromStreamAsync(stream);
      }
    };
    module2.exports = new CsvToJsonAsync();
  }
});

// ../work/iuccio__csvToJson/src/browserApi.js
var require_browserApi = __commonJS({
  "../work/iuccio__csvToJson/src/browserApi.js"(exports2, module2) {
    "use strict";
    var csvToJson2 = require_csvToJson();
    var Configurable = require_configurable();
    var { InputValidationError, BrowserApiError } = require_errors();
    var StreamProcessor = require_streamProcessor();
    var BrowserApi = class extends Configurable {
      /**
       * Constructor initializes proxy to sync csvToJson instance
       */
      constructor() {
        super();
        this.csvToJson = csvToJson2;
      }
      /**
       * Validate CSV text input for browser methods.
       * @param {string} csvString - CSV content as string
       * @throws {InputValidationError} If the input is not a valid string
       * @private
       */
      _validateCsvString(csvString) {
        if (csvString === void 0 || csvString === null) {
          throw new InputValidationError(
            "csvString",
            "string",
            `${typeof csvString}`,
            "Provide valid CSV content as a string to parse."
          );
        }
      }
      /**
       * Parse CSV text using a frozen parser configuration snapshot.
       * @param {string} csvString - CSV content as string
       * @returns {Array<object>} Parsed CSV rows
       * @private
       */
      _parseCsvText(csvString) {
        const config = this.getParserConfig();
        return this.csvToJson.csvToJsonWithConfig(String(csvString), config);
      }
      /**
       * Parse a CSV string and return as JSON array of objects
       * @param {string} csvString - CSV content as string
       * @returns {Array<object>} Array of objects representing CSV rows
       * @throws {InputValidationError} If csvString is invalid
       * @throws {CsvFormatError} If CSV is malformed
       * @example
       * const csvToJson = require('convert-csv-to-json');
       * const rows = csvToJson.browser.csvStringToJson('name,age\nAlice,30');
       * console.log(rows); // [{ name: 'Alice', age: '30' }]
       */
      csvStringToJson(csvString) {
        this._validateCsvString(csvString);
        return this._parseCsvText(csvString);
      }
      /**
       * Parse a CSV string and return as stringified JSON
       * @param {string} csvString - CSV content as string
       * @returns {string} JSON stringified array of objects
       * @throws {InputValidationError} If csvString is invalid
       * @throws {CsvFormatError} If CSV is malformed
       * @example
       * const csvToJson = require('convert-csv-to-json');
       * const jsonString = csvToJson.browser.csvStringToJsonStringified('name,age\nAlice,30');
       * console.log(jsonString);
       */
      csvStringToJsonStringified(csvString) {
        this._validateCsvString(csvString);
        const rows = this._parseCsvText(csvString);
        return JSON.stringify(rows, void 0, 1);
      }
      /**
       * Parse a CSV string asynchronously (returns resolved Promise)
       * @param {string} csvString - CSV content as string
       * @returns {Promise<Array<object>>} Promise resolving to array of objects
       * @throws {InputValidationError} If csvString is invalid
       * @throws {CsvFormatError} If CSV is malformed
       * @example
       * const csvToJson = require('convert-csv-to-json');
       * const rows = await csvToJson.browser.csvStringToJsonAsync('name,age\nAlice,30');
       * console.log(rows);
       */
      csvStringToJsonAsync(csvString) {
        return Promise.resolve(this.csvStringToJson(csvString));
      }
      /**
       * Parse a CSV string asynchronously and return as stringified JSON
       * @param {string} csvString - CSV content as string
       * @returns {Promise<string>} Promise resolving to JSON stringified array
       * @throws {InputValidationError} If csvString is invalid
       * @throws {CsvFormatError} If CSV is malformed
       * @example
       * const csvToJson = require('convert-csv-to-json');
       * const json = await csvToJson.browser.csvStringToJsonStringifiedAsync('name,age\nAlice,30');
       * console.log(json);
       */
      csvStringToJsonStringifiedAsync(csvString) {
        return Promise.resolve(this.csvStringToJsonStringified(csvString));
      }
      /**
       * Parse a browser File or Blob object to JSON array.
       * @param {File|Blob} file - File or Blob to read as text
       * @param {object} [options] - options: { encoding?: string }
       * @returns {Promise<object[]>} Promise resolving to parsed JSON rows
       * @example
       * const csvToJson = require('convert-csv-to-json');
       * const fileInput = document.querySelector('#csvfile').files[0];
       * const rows = await csvToJson.browser.parseFile(fileInput);
       * console.log(rows);
       */
      parseFile(file, options = {}) {
        if (!file) {
          return Promise.reject(new InputValidationError(
            "file",
            "File or Blob object",
            `${typeof file}`,
            "Provide a valid File or Blob object to parse."
          ));
        }
        return new Promise((resolve, reject) => {
          if (typeof FileReader === "undefined") {
            reject(BrowserApiError.fileReaderNotAvailable());
            return;
          }
          const reader = new FileReader();
          reader.onerror = () => reject(BrowserApiError.parseFileError(
            reader.error || new Error("Unknown file reading error")
          ));
          reader.onload = () => {
            try {
              resolve(this._parseCsvText(reader.result));
            } catch (err) {
              reject(BrowserApiError.parseFileError(err));
            }
          };
          if (options.encoding) {
            reader.readAsText(file, options.encoding);
          } else {
            reader.readAsText(file);
          }
        });
      }
      /**
       * Parse CSV from a browser ReadableStream and return parsed data as JSON array
       * Processes data in chunks for memory-efficient handling of large streams
       * @param {object} stream - Browser ReadableStream containing CSV data
       * @returns {Promise<Array<object>>} Promise resolving to array of objects representing CSV rows
       * @throws {InputValidationError} If stream is invalid
       * @throws {BrowserApiError} If streaming is not supported or parsing fails
       * @example
       * const csvToJson = require('convert-csv-to-json');
       * const response = await fetch('large-dataset.csv');
       * const stream = response.body;
       * const data = await csvToJson.browser.getJsonFromStreamAsync(stream);
       * console.log(data);
       */
      async getJsonFromStreamAsync(stream) {
        if (typeof ReadableStream === "undefined") {
          throw BrowserApiError.streamingNotSupported();
        }
        if (!stream || typeof stream.getReader !== "function") {
          throw new InputValidationError(
            "stream",
            "ReadableStream",
            typeof stream,
            "Provide a valid browser ReadableStream."
          );
        }
        const config = this.getParserConfig();
        const streamProcessor = new StreamProcessor(config, { isBrowser: true });
        return streamProcessor.processStream(stream);
      }
      /**
       * Parse CSV from a File object using streaming for memory-efficient processing
       * @param {File} file - File object containing CSV data
       * @returns {Promise<Array<object>>} Promise resolving to array of objects representing CSV rows
       * @throws {InputValidationError} If file is invalid
       * @throws {BrowserApiError} If streaming is not supported or parsing fails
       * @example
       * const csvToJson = require('convert-csv-to-json');
       * const fileInput = document.querySelector('#csvfile').files[0];
       * const data = await csvToJson.browser.getJsonFromFileStreamingAsync(fileInput);
       * console.log(data);
       */
      async getJsonFromFileStreamingAsync(file) {
        if (!file || !(file instanceof File)) {
          throw new InputValidationError(
            "file",
            "File object",
            typeof file,
            "Provide a valid File object."
          );
        }
        if (typeof file.stream === "function") {
          const stream = file.stream();
          return this.getJsonFromStreamAsync(stream);
        } else {
          return this.parseFile(file);
        }
      }
      /**
       * Parse CSV from a File object using streaming with progress callbacks for large files
       * Processes data in chunks to avoid memory issues with large datasets
       * @param {File} file - File object containing CSV data
       * @param {object} options - Processing options
       * @param {function(Array<object>, number, number): void} options.onChunk - Callback for each chunk of processed rows
       * @param {function(Array<object>): void} [options.onComplete] - Callback when processing is complete
       * @param {function(Error): void} [options.onError] - Callback for errors
       * @param {number} [options.chunkSize] - Number of rows per chunk (default: 1000)
       * @returns {Promise<void>} Promise that resolves when streaming starts
       * @throws {InputValidationError} If file or options are invalid
       * @example
       * const csvToJson = require('convert-csv-to-json');
       * const fileInput = document.querySelector('#csvfile').files[0];
       *
       * await csvToJson.browser.getJsonFromFileStreamingAsyncWithCallback(fileInput, {
       *   chunkSize: 500,
       *   onChunk: (rows, processed, total) => {
       *     console.log(`Processed ${processed}/${total} rows`);
       *     // Handle chunk of rows here
       *   },
       *   onComplete: (allRows) => {
       *     console.log('Processing complete!');
       *   },
       *   onError: (error) => {
       *     console.error('Error:', error);
       *   }
       * });
       */
      async getJsonFromFileStreamingAsyncWithCallback(file, options = {}) {
        if (!file || !(file instanceof File)) {
          throw new InputValidationError(
            "file",
            "File object",
            typeof file,
            "Provide a valid File object."
          );
        }
        if (!options.onChunk || typeof options.onChunk !== "function") {
          throw new InputValidationError(
            "options.onChunk",
            "function",
            typeof options.onChunk,
            "Provide a callback function to handle processed chunks."
          );
        }
        const chunkSize = options.chunkSize || 1e3;
        const config = this.getParserConfig();
        const streamProcessor = new StreamProcessor(config, {
          isBrowser: true,
          chunkSize,
          onChunk: options.onChunk,
          onComplete: options.onComplete,
          onError: options.onError
        });
        if (typeof file.stream === "function") {
          const stream = file.stream();
          return streamProcessor.processStreamWithCallbacks(stream);
        } else {
          return this.parseFileWithCallbacks(file, options);
        }
      }
      /**
       * Parse a File object with progress callbacks (fallback for non-streaming browsers)
       * @param {File} file - File object to parse
       * @param {object} options - Processing options
       * @private
       */
      async parseFileWithCallbacks(file, options) {
        const chunkSize = options.chunkSize || 1e3;
        const onChunk = options.onChunk;
        const onComplete = options.onComplete;
        const onError = options.onError;
        return new Promise((resolve, reject) => {
          if (typeof FileReader === "undefined") {
            const error = BrowserApiError.fileReaderNotAvailable();
            if (onError) onError(error);
            reject(error);
            return;
          }
          const reader = new FileReader();
          reader.onerror = () => {
            const error = BrowserApiError.parseFileError(
              reader.error || new Error("Unknown file reading error")
            );
            if (onError) onError(error);
            reject(error);
          };
          reader.onload = () => {
            try {
              const allRows = this._parseCsvText(reader.result);
              let processed = 0;
              const total = allRows.length;
              const processChunk = () => {
                const chunk = allRows.slice(processed, processed + chunkSize);
                if (chunk.length > 0) {
                  onChunk(chunk, processed + chunk.length, total);
                  processed += chunk.length;
                  setTimeout(processChunk, 0);
                } else {
                  if (onComplete) onComplete(allRows);
                  resolve();
                }
              };
              processChunk();
            } catch (err) {
              const error = BrowserApiError.parseFileError(err);
              if (onError) onError(error);
              reject(error);
            }
          };
          reader.readAsText(file);
        });
      }
    };
    module2.exports = new BrowserApi();
  }
});

// ../work/iuccio__csvToJson/index.js
var csvToJson = require_csvToJson();
var encodingOps = {
  utf8: "utf8",
  ucs2: "ucs2",
  utf16le: "utf16le",
  latin1: "latin1",
  ascii: "ascii",
  base64: "base64",
  hex: "hex"
};
var csvToJsonAsync = require_csvToJsonAsync();
function applyConfigToAllClients(configFn) {
  configFn(csvToJson);
  configFn(csvToJsonAsync);
  if (exports.browser) {
    configFn(exports.browser);
  }
  return exports;
}
exports.formatValueByType = function(active = true) {
  return applyConfigToAllClients((client) => client.formatValueByType(active));
};
exports.supportQuotedField = function(active = false) {
  return applyConfigToAllClients((client) => client.supportQuotedField(active));
};
exports.fieldDelimiter = function(delimiter) {
  return applyConfigToAllClients((client) => client.fieldDelimiter(delimiter));
};
exports.trimHeaderFieldWhiteSpace = function(active = false) {
  return applyConfigToAllClients((client) => client.trimHeaderFieldWhiteSpace(active));
};
exports.indexHeader = function(index) {
  return applyConfigToAllClients((client) => client.indexHeader(index));
};
exports.parseSubArray = function(delimiter, separator) {
  return applyConfigToAllClients((client) => client.parseSubArray(delimiter, separator));
};
exports.ignoreColumnIndexes = function(indexes) {
  if (!Array.isArray(indexes)) {
    throw new TypeError("indexes must be an array of numbers");
  }
  if (!indexes.every((idx) => Number.isInteger(idx) && idx >= 0)) {
    throw new TypeError("All elements in indexes must be valid non-negative numbers (>= 0)");
  }
  return applyConfigToAllClients((client) => client.ignoreColumnIndexes(indexes));
};
exports.customEncoding = function(encoding) {
  return applyConfigToAllClients((client) => client.encoding(encoding));
};
exports.utf8Encoding = function utf8Encoding() {
  return applyConfigToAllClients((client) => client.encoding(encodingOps.utf8));
};
exports.ucs2Encoding = function() {
  return applyConfigToAllClients((client) => client.encoding(encodingOps.ucs2));
};
exports.utf16leEncoding = function() {
  return applyConfigToAllClients((client) => client.encoding(encodingOps.utf16le));
};
exports.latin1Encoding = function() {
  return applyConfigToAllClients((client) => client.encoding(encodingOps.latin1));
};
exports.asciiEncoding = function() {
  return applyConfigToAllClients((client) => client.encoding(encodingOps.ascii));
};
exports.base64Encoding = function() {
  return applyConfigToAllClients((client) => client.encoding(encodingOps.base64));
};
exports.hexEncoding = function() {
  return applyConfigToAllClients((client) => client.encoding(encodingOps.hex));
};
exports.mapRows = function(mapperFn) {
  return applyConfigToAllClients((client) => client.mapRows(mapperFn));
};
exports.generateJsonFileFromCsv = function(inputFileName, outputFileName) {
  if (!inputFileName) {
    throw new Error("inputFileName is not defined!!!");
  }
  if (!outputFileName) {
    throw new Error("outputFileName is not defined!!!");
  }
  csvToJson.generateJsonFileFromCsv(inputFileName, outputFileName);
};
exports.getJsonFromCsv = function(inputFileName) {
  if (!inputFileName) {
    throw new Error("inputFileName is not defined!!!");
  }
  return csvToJson.getJsonFromCsv(inputFileName);
};
exports.getJsonFromCsvAsync = function(input, options) {
  return csvToJsonAsync.getJsonFromCsvAsync(input, options);
};
exports.csvStringToJsonAsync = function(input, options) {
  return csvToJsonAsync.csvStringToJsonAsync(input, options);
};
exports.csvStringToJsonStringifiedAsync = function(input) {
  return csvToJsonAsync.csvStringToJsonStringifiedAsync(input);
};
exports.generateJsonFileFromCsvAsync = function(input, output) {
  return csvToJsonAsync.generateJsonFileFromCsv(input, output);
};
exports.getJsonFromStreamAsync = function(stream) {
  return csvToJsonAsync.getJsonFromStreamAsync(stream);
};
exports.getJsonFromFileStreamingAsync = function(filePath) {
  return csvToJsonAsync.getJsonFromFileStreamingAsync(filePath);
};
exports.csvStringToJson = function(csvString) {
  return csvToJson.csvStringToJson(csvString);
};
exports.csvStringToJsonStringified = function(csvString) {
  if (csvString === void 0 || csvString === null) {
    throw new Error("csvString is not defined!!!");
  }
  return csvToJson.csvStringToJsonStringified(csvString);
};
exports.browser = require_browserApi();
