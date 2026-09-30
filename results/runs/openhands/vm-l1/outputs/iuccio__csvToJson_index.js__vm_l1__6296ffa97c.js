'use strict';

const fs = require('fs');

class CsvParsingError extends Error {
  constructor(message, code, context = {}) {
    super(message);
    this.name = 'CsvParsingError';
    this.code = code;
    this.context = context;
    Error.captureStackTrace?.(this, this.constructor);
  }

  toString() {
    let result = `${this.name}: ${this.message}`;
    if (this.context && Object.keys(this.context).length > 0) {
      result += '\n\nContext:';
      for (const [key, value] of Object.entries(this.context)) {
        result += `\n  ${key}: ${this.formatValue(value)}`;
      }
    }
    return result;
  }

  formatValue(value) {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'string') return `"${value}"`;
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }
}

class InputValidationError extends CsvParsingError {
  constructor(parameter, expectedType, receivedType, suggestion = '') {
    const message =
      `Invalid input: Parameter '${parameter}' is required.\n` +
      `Expected: ${expectedType}\n` +
      `Received: ${receivedType}` +
      (suggestion ? `\n${suggestion}` : '');
    super(message, 'INPUT_VALIDATION_ERROR', { parameter, expectedType, receivedType });
    this.name = 'InputValidationError';
  }
}

class ConfigurationError extends CsvParsingError {
  constructor(message, context = {}) {
    super(message, 'CONFIGURATION_ERROR', context);
    this.name = 'ConfigurationError';
  }

  static quotedFieldConflict(optionName, value) {
    return new ConfigurationError(
      `Configuration conflict: supportQuotedField() is enabled, but ${optionName} is set to '${value}'.\n` +
        'The quote character (") cannot be used as a field delimiter, separator, or sub-array delimiter when quoted field support is active.\n\n' +
        `Solutions:\n  1. Use a different character for ${optionName} (e.g., '|', '\\t', ';')\n` +
        "  2. Disable supportQuotedField() if your CSV doesn't contain quoted fields\n" +
        '  3. Refer to RFC 4180 for proper CSV formatting: https://tools.ietf.org/html/rfc4180',
      { optionName, value, conflictingOption: 'supportQuotedField' },
    );
  }

  static invalidHeaderIndex(value) {
    return new ConfigurationError(
      'Invalid configuration: indexHeader() expects a numeric value.\n' +
        `Received: ${typeof value} (${value})\n\n` +
        'Solutions:\n  1. Ensure indexHeader() receives a number: indexHeader(0), indexHeader(1), etc.\n' +
        '  2. Headers are typically found on row 0 (first line)\n' +
        '  3. Use indexHeader(2) if headers are on the 3rd line',
      { parameterName: 'indexHeader', value, type: typeof value },
    );
  }
}

class CsvFormatError extends CsvParsingError {
  constructor(message, context = {}) {
    super(message, 'CSV_FORMAT_ERROR', context);
    this.name = 'CsvFormatError';
  }

  static missingHeader() {
    return new CsvFormatError(
      'CSV parsing error: No header row found.\n' +
        'The CSV file appears to be empty or has no valid header line.\n\n' +
        'Solutions:\n  1. Ensure your CSV file contains at least one row (header row)\n' +
        '  2. Verify the file is not empty or contains only whitespace\n' +
        '  3. Check if you need to use indexHeader(n) to specify a non-standard header row\n' +
        '  4. Refer to RFC 4180 for proper CSV format: https://tools.ietf.org/html/rfc4180',
    );
  }

  static mismatchedQuotes(location = 'CSV') {
    return new CsvFormatError(
      `CSV parsing error: Mismatched quotes detected in ${location}.\n` +
        'A quoted field was not properly closed with a matching quote character.\n\n' +
        'RFC 4180 rules for quoted fields:\n' +
        '  • Fields containing delimiters or quotes MUST be enclosed in double quotes\n' +
        '  • To include a quote within a quoted field, use two consecutive quotes: ""\n' +
        '  • Example: "Smith, John" (name contains comma)\n' +
        '  • Example: "He said ""Hello""" (text contains quotes)\n\n' +
        'Solutions:\n  1. Review your CSV for properly paired quote characters\n' +
        '  2. Use double quotes ("") to escape quotes within quoted fields\n' +
        '  3. Ensure all commas within field values are inside quotes\n' +
        "  4. Enable supportQuotedField(true) if you're using quoted fields",
      { location },
    );
  }
}

class FileOperationError extends CsvParsingError {
  constructor(operation, filePath, originalError) {
    const message =
      `File operation error: Failed to ${operation} file.\n` +
      `File path: ${filePath}\n` +
      `Reason: ${originalError.message}\n\n` +
      `Solutions:\n  1. Verify the file path is correct: ${filePath}\n` +
      '  2. Check file permissions (read access for input, write access for output)\n' +
      '  3. Ensure the directory exists and is writable for output files\n' +
      '  4. Verify the file is not in use by another process';
    super(message, 'FILE_OPERATION_ERROR', {
      operation,
      filePath,
      originalError: originalError.message,
    });
    this.name = 'FileOperationError';
    this.originalError = originalError;
  }
}

class JsonValidationError extends CsvParsingError {
  constructor(csvText, originalError) {
    const message =
      'JSON validation error: The parsed CSV data generated invalid JSON.\n' +
      'This typically indicates malformed field names or values in the CSV.\n' +
      `Original error: ${originalError.message}\n\n` +
      'Solutions:\n  1. Check that field names are valid JavaScript identifiers (or will be converted safely)\n' +
      "  2. Review the CSV data for special characters that aren't properly escaped\n" +
      '  3. Enable supportQuotedField(true) for fields containing special characters\n' +
      "  4. Verify that formatValueByType() isn't converting values incorrectly";
    super(message, 'JSON_VALIDATION_ERROR', {
      originalError: originalError.message,
      csvPreview: csvText ? csvText.substring(0, 200) : 'N/A',
    });
    this.name = 'JsonValidationError';
    this.originalError = originalError;
  }
}

class BrowserApiError extends CsvParsingError {
  constructor(message, context = {}) {
    super(message, 'BROWSER_API_ERROR', context);
    this.name = 'BrowserApiError';
  }

  static fileReaderNotAvailable() {
    return new BrowserApiError(
      'Browser compatibility error: FileReader API is not available.\n' +
        'Your browser does not support the FileReader API required for file parsing.\n\n' +
        'Solutions:\n  1. Use a modern browser that supports FileReader (Chrome 13+, Firefox 10+, Safari 6+)\n' +
        '  2. Consider using csvStringToJson() or csvStringToJsonAsync() for string-based parsing\n' +
        '  3. Implement a polyfill or alternative file reading method',
    );
  }

  static parseFileError(error) {
    return new BrowserApiError(
      'Browser file parsing error: Failed to read and parse the file.\n' +
        `Error details: ${error.message}\n\n` +
        'Solutions:\n  1. Verify the file is a valid CSV file\n' +
        '  2. Check the file encoding (UTF-8 is recommended)\n' +
        '  3. Try a smaller file to isolate the issue\n' +
        '  4. Check browser console for additional error details',
      { originalError: error.message },
    );
  }

  static streamingNotSupported() {
    return new BrowserApiError(
      'Browser compatibility error: ReadableStream API is not available.\n' +
        'Your browser does not support the ReadableStream API required for streaming.\n\n' +
        'Solutions:\n  1. Use a modern browser that supports ReadableStream (Chrome 43+, Firefox 65+, Safari 10.1+)\n' +
        '  2. Use getJsonFromFileStreamingAsync() which falls back to regular file parsing\n' +
        '  3. Consider using parseFile() for non-streaming file parsing\n' +
        '  4. Implement a polyfill for ReadableStream support',
    );
  }
}

class FileUtils {
  static encodedFileTypes = new Set(['base64', 'hex']);

  _isEncodedFile(encoding) {
    return FileUtils.encodedFileTypes.has(encoding);
  }

  _decodeContent(content, encoding) {
    return this._isEncodedFile(encoding)
      ? Buffer.from(content, encoding).toString('utf8')
      : content;
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
      return this._decodeContent(fs.readFileSync(filePath, 'utf8'), encoding);
    }
    return this._toString(fs.readFileSync(filePath, encoding));
  }

  readFile(filePath, encoding = 'utf8') {
    try {
      return this._readFileSync(filePath, encoding);
    } catch (error) {
      throw this._wrapReadError(filePath, error);
    }
  }

  async _readFileAsyncWithPromises(filePath, encoding) {
    if (this._isEncodedFile(encoding)) {
      return fs.promises.readFile(filePath, 'utf8').then((content) => this._decodeContent(content, encoding));
    }
    return fs.promises.readFile(filePath, encoding).then((content) => this._toString(content));
  }

  readFileAsync(filePath, encoding = 'utf8') {
    if (fs.promises && typeof fs.promises.readFile === 'function') {
      return this._readFileAsyncWithPromises(filePath, encoding).catch((error) => {
        throw this._wrapReadError(filePath, error);
      });
    }
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, this._isEncodedFile(encoding) ? 'utf8' : encoding, (error, content) => {
        if (error) return reject(this._wrapReadError(filePath, error));
        try {
          resolve(this._isEncodedFile(encoding) ? this._decodeContent(content, encoding) : this._toString(content));
        } catch (decodeError) {
          reject(this._wrapReadError(filePath, decodeError));
        }
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
        if (error) reject(this._wrapWriteError(filePath, error));
        else resolve();
      });
    });
  }
}

class StringUtils {
  static PATTERNS = {
    INTEGER: /^-?\d+$/,
    FLOAT: /^-?\d*\.\d+$/,
    WHITESPACE: /\s/g,
  };

  static BOOLEAN_VALUES = { TRUE: 'true', FALSE: 'false' };

  trimPropertyName(removeAllWhitespace, propertyName) {
    if (!propertyName) return '';
    return removeAllWhitespace
      ? propertyName.replace(StringUtils.PATTERNS.WHITESPACE, '')
      : propertyName.trim();
  }

  getValueFormatByType(value) {
    if (this.isEmpty(value)) return String();
    if (this.isBoolean(value)) return this.convertToBoolean(value);
    if (this.isInteger(value)) return this.convertInteger(value);
    if (this.isFloat(value)) return this.convertFloat(value);
    return String(value);
  }

  hasContent(values = []) {
    return Array.isArray(values) && values.some(Boolean);
  }

  isEmpty(value) {
    return value === undefined || value === '';
  }

  isBoolean(value) {
    const normalized = value.toLowerCase();
    return normalized === StringUtils.BOOLEAN_VALUES.TRUE || normalized === StringUtils.BOOLEAN_VALUES.FALSE;
  }

  isInteger(value) {
    return StringUtils.PATTERNS.INTEGER.test(value);
  }

  isFloat(value) {
    return StringUtils.PATTERNS.FLOAT.test(value);
  }

  hasLeadingZero(value) {
    return (value.length > 1 && value[0] === '0') ||
      (value.length > 2 && value[0] === '-' && value[1] === '0');
  }

  convertToBoolean(value) {
    return JSON.parse(value.toLowerCase());
  }

  convertInteger(value) {
    if (this.hasLeadingZero(value)) return String(value);
    const number = Number(value);
    return Number.isSafeInteger(number) ? number : String(value);
  }

  convertFloat(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : String(value);
  }
}

class JsonUtils {
  validateJson(jsonText) {
    try {
      JSON.parse(jsonText);
    } catch (error) {
      throw new JsonValidationError(jsonText, error);
    }
  }
}

class ParserConfig {
  constructor(config = {}) {
    this.delimiter = config.delimiter;
    this.encoding = config.encoding;
    this.isSupportQuotedField = config.isSupportQuotedField;
    this.isTrimHeaderFieldWhiteSpace = config.isTrimHeaderFieldWhiteSpace;
    this.indexHeaderValue = config.indexHeaderValue;
    this.parseSubArrayDelimiter = config.parseSubArrayDelimiter;
    this.parseSubArraySeparator = config.parseSubArraySeparator;
    this.printValueFormatByType = config.printValueFormatByType;
    this.rowMapper = config.rowMapper;
    this.indexesToIgnore = Object.freeze(config.indexesToIgnore ? [...config.indexesToIgnore] : []);
    Object.freeze(this);
  }
}

class Configurable {
  constructor(config = {}) {
    this.config = { ...config };
  }

  formatValueByType(enabled = true) {
    this.config.printValueFormatByType = enabled;
    return this;
  }

  supportQuotedField(enabled = false) {
    this.config.isSupportQuotedField = enabled;
    return this;
  }

  fieldDelimiter(delimiter) {
    this.config.delimiter = delimiter;
    return this;
  }

  trimHeaderFieldWhiteSpace(enabled = false) {
    this.config.isTrimHeaderFieldWhiteSpace = enabled;
    return this;
  }

  indexHeader(index) {
    if (isNaN(index)) throw ConfigurationError.invalidHeaderIndex(index);
    this.config.indexHeaderValue = index;
    return this;
  }

  parseSubArray(delimiter = '*', separator = ',') {
    this.config.parseSubArrayDelimiter = delimiter;
    this.config.parseSubArraySeparator = separator;
    return this;
  }

  mapRows(mapper) {
    if (typeof mapper !== 'function') throw new TypeError('mapperFn must be a function');
    this.config.rowMapper = mapper;
    return this;
  }

  ignoreColumnIndexes(indexes) {
    this.config.indexesToIgnore = [...indexes];
    return this;
  }

  encoding(encoding) {
    this.config.encoding = encoding;
    return this;
  }

  getParserConfig() {
    return new ParserConfig(this.config);
  }
}

const fileUtils = new FileUtils();
const stringUtils = new StringUtils();
const jsonUtils = new JsonUtils();
const DEFAULT_DELIMITER = ',';
const QUOTE = '"';
const CRLF = '\r\n';
const LF = '\n';
const CR = '\r';

class CsvToJson extends Configurable {
  csvToJsonWithConfig(csvText, config) {
    this.validateInputConfig(config);
    const records = this.parseRecords(csvText);
    const fieldDelimiter = this.getFieldDelimiter(config);
    let headerIndex = this.getIndexHeader(config);
    let headers;

    while (headerIndex < records.length) {
      headers = this.getFields(records[headerIndex], config, fieldDelimiter);
      if (stringUtils.hasContent(headers)) break;
      headerIndex += 1;
    }
    if (!headers) throw CsvFormatError.missingHeader();

    const result = [];
    for (let recordIndex = headerIndex + 1; recordIndex < records.length; recordIndex += 1) {
      const fields = this.getFields(records[recordIndex], config, fieldDelimiter);
      if (!stringUtils.hasContent(fields)) continue;
      let row = this.buildJsonResult(headers, fields, config);
      if (config.rowMapper) {
        row = config.rowMapper(row, recordIndex - (headerIndex + 1));
        if (row != null) result.push(row);
      } else {
        result.push(row);
      }
    }
    return result;
  }

  generateJsonFileFromCsv(inputFileName, outputFileName) {
    fileUtils.writeFile(this.getJsonFromCsvStringified(inputFileName), outputFileName);
  }

  getJsonFromCsvStringified(inputFileName) {
    const json = JSON.stringify(this.getJsonFromCsv(inputFileName), undefined, 1);
    jsonUtils.validateJson(json);
    return json;
  }

  getJsonFromCsv(inputFileName) {
    const config = this.getParserConfig();
    const csvText = fileUtils.readFile(inputFileName, config.encoding || 'utf8');
    return this.csvToJson(csvText);
  }

  csvStringToJson(csvString) {
    return this.csvToJson(csvString);
  }

  csvStringToJsonStringified(csvString) {
    const json = JSON.stringify(this.csvStringToJson(csvString), undefined, 1);
    jsonUtils.validateJson(json);
    return json;
  }

  csvToJson(csvText) {
    return this.csvToJsonWithConfig(csvText, this.getParserConfig());
  }

  parseRecords(csvText) {
    const records = [];
    let current = '';
    let insideQuotes = false;
    let index = 0;

    while (index < csvText.length) {
      const character = csvText[index];
      if (character === QUOTE) {
        if (insideQuotes && index + 1 < csvText.length && csvText[index + 1] === QUOTE) {
          current += QUOTE + QUOTE;
          index += 2;
        } else {
          insideQuotes = !insideQuotes;
          current += character;
          index += 1;
        }
        continue;
      }

      if (!insideQuotes) {
        const lineEndingLength = this.getLineEndingLength(csvText, index);
        if (lineEndingLength > 0) {
          records.push(current);
          current = '';
          index += lineEndingLength;
          continue;
        }
      }
      current += character;
      index += 1;
    }

    if (current.length > 0) records.push(current);
    if (insideQuotes) throw CsvFormatError.mismatchedQuotes('CSV');
    return records;
  }

  getLineEndingLength(text, index) {
    if (text.slice(index, index + 2) === CRLF) return 2;
    if (text[index] === LF) return 1;
    if (text[index] === CR && text[index + 1] !== LF) return 1;
    return 0;
  }

  getFieldDelimiter(config = this.config) {
    return config.delimiter || DEFAULT_DELIMITER;
  }

  getIndexHeader(config = this.config) {
    return config.indexHeaderValue !== null && !isNaN(config.indexHeaderValue)
      ? config.indexHeaderValue
      : 0;
  }

  getFields(row, config = this.config, delimiter = this.getFieldDelimiter(config)) {
    return config.isSupportQuotedField ? this.split(row, config) : row.split(delimiter);
  }

  buildJsonResult(headers, values, config = this.config) {
    const result = {};
    const ignoredIndexes = config.indexesToIgnore ? new Set(config.indexesToIgnore) : new Set();

    for (let index = 0; index < headers.length; index += 1) {
      if (ignoredIndexes.has(index)) continue;
      const property = stringUtils.trimPropertyName(config.isTrimHeaderFieldWhiteSpace, headers[index]);
      let value = values[index];
      if (this.isParseSubArray(value, config)) value = this.buildJsonSubArray(value, config);
      if (config.printValueFormatByType && !Array.isArray(value)) {
        value = stringUtils.getValueFormatByType(values[index]);
      }
      result[property] = value;
    }
    return result;
  }

  buildJsonSubArray(value, config = this.config) {
    const content = value.substring(
      value.indexOf(config.parseSubArrayDelimiter) + 1,
      value.lastIndexOf(config.parseSubArrayDelimiter),
    );
    content.trim();
    const values = content.split(config.parseSubArraySeparator);
    if (config.printValueFormatByType) {
      for (let index = 0; index < values.length; index += 1) {
        values[index] = stringUtils.getValueFormatByType(values[index]);
      }
    }
    return values;
  }

  isParseSubArray(value, config = this.config) {
    const delimiter = config.parseSubArrayDelimiter;
    return Boolean(
      delimiter &&
      value &&
      value.indexOf(delimiter) === 0 &&
      value.lastIndexOf(delimiter) === value.length - 1,
    );
  }

  validateInputConfig(config = this.config) {
    if (!config.isSupportQuotedField) return;
    if (this.getFieldDelimiter(config) === QUOTE) {
      throw ConfigurationError.quotedFieldConflict('fieldDelimiter', QUOTE);
    }
    if (config.parseSubArraySeparator === QUOTE) {
      throw ConfigurationError.quotedFieldConflict('parseSubArraySeparator', QUOTE);
    }
    if (config.parseSubArrayDelimiter === QUOTE) {
      throw ConfigurationError.quotedFieldConflict('parseSubArrayDelimiter', QUOTE);
    }
  }

  hasQuotes(value) {
    return value.includes(QUOTE);
  }

  split(row, config = this.config) {
    if (row.length === 0) return [];
    const fields = [];
    let current = '';
    let insideQuotes = false;
    const delimiter = this.getFieldDelimiter(config);

    for (let index = 0; index < row.length; index += 1) {
      const character = row[index];
      if (character === QUOTE) {
        if (this.isEscapedQuote(row, index, insideQuotes)) {
          current += QUOTE;
          index += 1;
        } else if (this.isEmptyQuotedField(row, index, insideQuotes, current, delimiter)) {
          index += 1;
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (character === delimiter && !insideQuotes) {
        fields.push(current);
        current = '';
      } else {
        current += character;
      }
    }

    fields.push(current);
    if (insideQuotes) throw CsvFormatError.mismatchedQuotes('row');
    return fields;
  }

  isEscapedQuote(row, index, insideQuotes) {
    return Boolean(insideQuotes && index + 1 < row.length && row[index + 1] === QUOTE);
  }

  isEmptyQuotedField(row, index, insideQuotes, current, delimiter) {
    if ((!insideQuotes && current !== '') || index + 1 >= row.length) return false;
    if (row[index + 1] !== QUOTE) return false;
    const nextIndex = index + 2;
    return nextIndex === row.length || row[nextIndex] === delimiter;
  }
}

class StreamProcessor {
  constructor(csvConfig, options = {}) {
    this.csvConfig = csvConfig;
    this.isBrowser = options.isBrowser ||
      (typeof window !== 'undefined' && typeof document !== 'undefined');
    this.buffer = '';
    this.isInsideQuotes = false;
    this.headers = null;
    this.headerRowIndex = csvConfig.indexHeaderValue !== null && !isNaN(csvConfig.indexHeaderValue)
      ? csvConfig.indexHeaderValue
      : 0;
    this.currentRecordIndex = 0;
    this.parsedRecords = [];
    this.dataRowIndex = 0;
    this.ignoredIndexes = new Set(csvConfig.indexesToIgnore || []);
    this.chunkSize = options.chunkSize || 1000;
    this.onChunk = options.onChunk;
    this.onComplete = options.onComplete;
    this.onError = options.onError;
    this.allRecords = [];
  }

  processChunk(chunk) {
    let text;
    if (typeof chunk === 'string') {
      text = chunk;
    } else if (this.isBrowser && typeof globalThis.TextDecoder !== 'undefined') {
      text = new globalThis.TextDecoder().decode(chunk);
    } else if (this.isBrowser) {
      text = String.fromCharCode.apply(null, new Uint8Array(chunk));
    } else {
      text = chunk.toString();
    }
    this.buffer += text;
    this._processCompleteRecords();
  }

  processStreamWithCallbacks(stream) {
    return new Promise((resolve, reject) => {
      if (this.isBrowser) {
        if (!stream || typeof stream.getReader !== 'function') {
          const error = new Error('Invalid ReadableStream provided');
          this.onError?.(error);
          reject(error);
          return;
        }
        const reader = stream.getReader();
        const readNext = async () => {
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) {
                this.finalizeProcessing();
                this._sendRemainingChunks();
                this.onComplete?.(this.allRecords);
                resolve();
                return;
              }
              this.processChunk(value);
              this._sendPendingChunks();
            }
          } catch (error) {
            this.onError?.(error);
            reject(error);
          }
        };
        readNext();
        return;
      }

      if (!stream || typeof stream.pipe !== 'function') {
        const error = new Error('Invalid Readable stream provided');
        this.onError?.(error);
        reject(error);
        return;
      }
      stream.on('data', (chunk) => {
        try {
          this.processChunk(chunk);
          this._sendPendingChunks();
        } catch (error) {
          this.onError?.(error);
          reject(error);
        }
      });
      stream.on('end', () => {
        try {
          this.finalizeProcessing();
          this._sendRemainingChunks();
          this.onComplete?.(this.allRecords);
          resolve();
        } catch (error) {
          this.onError?.(error);
          reject(error);
        }
      });
      stream.on('error', (error) => {
        this.onError?.(error);
        reject(error);
      });
    });
  }

  _sendPendingChunks() {
    if (!this.onChunk) return;
    while (this.parsedRecords.length >= this.chunkSize) {
      const chunk = this.parsedRecords.splice(0, this.chunkSize);
      this.allRecords.push(...chunk);
      this.onChunk(chunk, this.allRecords.length, null);
    }
  }

  _sendRemainingChunks() {
    if (!this.onChunk || this.parsedRecords.length === 0) return;
    const chunk = [...this.parsedRecords];
    this.parsedRecords.length = 0;
    this.allRecords.push(...chunk);
    this.onChunk(chunk, this.allRecords.length, this.allRecords.length);
  }

  processStream(stream) {
    return new Promise((resolve, reject) => {
      if (this.isBrowser) {
        if (!stream || typeof stream.getReader !== 'function') {
          reject(new Error('Invalid ReadableStream provided'));
          return;
        }
        const reader = stream.getReader();
        const readNext = async () => {
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
        readNext();
        return;
      }

      if (!stream || typeof stream.pipe !== 'function') {
        reject(new Error('Invalid Readable stream provided'));
        return;
      }
      stream.on('data', (chunk) => {
        try {
          this.processChunk(chunk);
        } catch (error) {
          reject(error);
        }
      });
      stream.on('end', () => {
        try {
          this.finalizeProcessing();
          resolve(this.getResult());
        } catch (error) {
          reject(error);
        }
      });
      stream.on('error', reject);
    });
  }

  finalizeProcessing() {
    this._processRemainingBuffer();
    this._validateProcessingResult();
  }

  getResult() {
    return this.parsedRecords;
  }

  _processCompleteRecords() {
    const parsed = this._parseRecordsFromBuffer(this.buffer, this.isInsideQuotes);
    this.buffer = parsed.remainingBuffer;
    this.isInsideQuotes = parsed.isInsideQuotes;
    for (const record of parsed.completeRecords) {
      this._processRecord(record);
      this.currentRecordIndex += 1;
    }
  }

  _processRemainingBuffer() {
    if (this.buffer.length === 0) return;
    if (this.isInsideQuotes) throw CsvFormatError.mismatchedQuotes('CSV stream');
    const parsed = this._parseRecordsFromBuffer(`${this.buffer}\n`, false);
    for (const record of parsed.completeRecords) {
      this._processRecord(record);
      this.currentRecordIndex += 1;
    }
  }

  _processRecord(record) {
    if (this.headers === null && this.currentRecordIndex === this.headerRowIndex) {
      this._processHeaderRecord(record);
    } else if (this.headers !== null) {
      this._processDataRecord(record);
    }
  }

  _processHeaderRecord(record) {
    const fields = this._splitRecord(record);
    if (stringUtils.hasContent(fields)) this.headers = fields;
  }

  _processDataRecord(record) {
    const fields = this._splitRecord(record);
    if (!stringUtils.hasContent(fields)) return;
    const row = this._buildJsonResult(this.headers, fields);
    const mappedRow = this._applyRowMapper(row);
    if (mappedRow !== null) this.parsedRecords.push(mappedRow);
  }

  _applyRowMapper(row) {
    if (this.csvConfig.rowMapper) {
      const mapped = this.csvConfig.rowMapper(row, this.dataRowIndex);
      this.dataRowIndex += 1;
      return mapped;
    }
    this.dataRowIndex += 1;
    return row;
  }

  _splitRecord(record) {
    return this.csvConfig.isSupportQuotedField
      ? this._splitWithConfig(record, this.csvConfig)
      : record.split(this.csvConfig.delimiter || DEFAULT_DELIMITER);
  }

  _splitWithConfig(row, config) {
    if (row.length === 0) return [];
    const fields = [];
    let current = '';
    let insideQuotes = false;
    const delimiter = config.delimiter || DEFAULT_DELIMITER;
    for (let index = 0; index < row.length; index += 1) {
      const character = row[index];
      if (character === QUOTE) {
        if (insideQuotes && index + 1 < row.length && row[index + 1] === QUOTE) {
          current += QUOTE;
          index += 1;
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (character === delimiter && !insideQuotes) {
        fields.push(current);
        current = '';
      } else {
        current += character;
      }
    }
    fields.push(current);
    if (insideQuotes) throw CsvFormatError.mismatchedQuotes('row');
    return fields;
  }

  _buildJsonResult(headers, values) {
    const result = {};
    for (let index = 0; index < headers.length; index += 1) {
      if (this.ignoredIndexes.has(index)) continue;
      const property = stringUtils.trimPropertyName(
        this.csvConfig.isTrimHeaderFieldWhiteSpace,
        headers[index],
      );
      let value = values[index];
      if (this._isParseSubArray(value)) value = this._buildJsonSubArray(value);
      if (this.csvConfig.printValueFormatByType && !Array.isArray(value)) {
        value = stringUtils.getValueFormatByType(values[index]);
      }
      result[property] = value;
    }
    return result;
  }

  _isParseSubArray(value) {
    const delimiter = this.csvConfig.parseSubArrayDelimiter;
    return Boolean(
      delimiter &&
      value &&
      value.indexOf(delimiter) === 0 &&
      value.lastIndexOf(delimiter) === value.length - 1,
    );
  }

  _buildJsonSubArray(value) {
    const content = value.substring(
      value.indexOf(this.csvConfig.parseSubArrayDelimiter) + 1,
      value.lastIndexOf(this.csvConfig.parseSubArrayDelimiter),
    );
    const values = content.split(this.csvConfig.parseSubArraySeparator);
    if (this.csvConfig.printValueFormatByType) {
      for (let index = 0; index < values.length; index += 1) {
        values[index] = stringUtils.getValueFormatByType(values[index]);
      }
    }
    return values;
  }

  _parseRecordsFromBuffer(buffer, isInsideQuotes) {
    const completeRecords = [];
    let current = '';
    let index = 0;
    while (index < buffer.length) {
      const character = buffer[index];
      if (character === QUOTE) {
        const escaped = this._handleEscapedQuote(buffer, index, isInsideQuotes);
        if (escaped.wasEscaped) {
          current += QUOTE + QUOTE;
          index = escaped.newIndex;
          continue;
        }
        isInsideQuotes = !isInsideQuotes;
      } else if (!isInsideQuotes && this._isLineEnding(buffer, index)) {
        const lineEndingLength = this._getLineEndingLength(buffer, index);
        completeRecords.push(current);
        current = '';
        index += lineEndingLength;
        continue;
      }
      current += character;
      index += 1;
    }
    return { completeRecords, remainingBuffer: current, isInsideQuotes };
  }

  _handleEscapedQuote(buffer, index, isInsideQuotes) {
    if (isInsideQuotes && index + 1 < buffer.length && buffer[index + 1] === QUOTE) {
      return { wasEscaped: true, newIndex: index + 2 };
    }
    return { wasEscaped: false, newIndex: index + 1 };
  }

  _isLineEnding(buffer, index) {
    return this._getLineEndingLength(buffer, index) > 0;
  }

  _getLineEndingLength(buffer, index) {
    if (buffer.slice(index, index + 2) === CRLF) return 2;
    if (buffer[index] === LF) return 1;
    if (buffer[index] === CR && buffer[index + 1] !== LF) return 1;
    return 0;
  }

  _validateProcessingResult() {
    if (!this.headers && this.parsedRecords.length === 0) return;
    if (!this.headers) throw CsvFormatError.missingHeader();
  }
}

class CsvToJsonAsync extends Configurable {
  constructor(csvToJson) {
    super();
    this.csvToJson = csvToJson;
  }

  async generateJsonFileFromCsv(inputFileName, outputFileName) {
    const json = await this.getJsonFromCsvStringified(inputFileName);
    await fileUtils.writeFileAsync(json, outputFileName);
  }

  async getJsonFromCsvStringified(inputFileName) {
    return JSON.stringify(await this.getJsonFromCsvAsync(inputFileName), undefined, 1);
  }

  async getJsonFromCsvAsync(inputFileNameOrCsv, options = {}) {
    if (inputFileNameOrCsv === null || inputFileNameOrCsv === undefined) {
      throw new InputValidationError(
        'inputFileNameOrCsv',
        'string (file path) or CSV string content',
        `${typeof inputFileNameOrCsv}`,
        'Either provide a valid file path or CSV content as a string.',
      );
    }
    const config = this.getParserConfig();
    if (options.raw) {
      if (inputFileNameOrCsv === '') return [];
      return this.csvToJson.csvToJsonWithConfig(inputFileNameOrCsv, config);
    }
    const csvText = await fileUtils.readFileAsync(inputFileNameOrCsv, config.encoding || 'utf8');
    return this.csvToJson.csvToJsonWithConfig(csvText, config);
  }

  csvStringToJsonAsync(csvString, options = { raw: true }) {
    return this.getJsonFromCsvAsync(csvString, options);
  }

  async getJsonFromStreamAsync(stream) {
    this._validateStream(stream);
    const processor = new StreamProcessor(this.getParserConfig(), { isBrowser: false });
    return processor.processStream(stream);
  }

  _validateStream(stream) {
    if (!stream || typeof stream.pipe !== 'function') {
      throw new InputValidationError(
        'stream',
        'Readable stream',
        typeof stream,
        'Provide a valid Node.js Readable stream.',
      );
    }
  }

  async getJsonFromFileStreamingAsync(filePath) {
    if (!filePath || typeof filePath !== 'string') {
      throw new InputValidationError(
        'filePath',
        'string (file path)',
        typeof filePath,
        'Provide a valid file path as a string.',
      );
    }
    const config = this.getParserConfig();
    const encoding = typeof config.encoding === 'string' ? config.encoding : 'utf8';
    return this.getJsonFromStreamAsync(fs.createReadStream(filePath, { encoding }));
  }
}

class BrowserApi extends Configurable {
  constructor(csvToJson) {
    super();
    this.csvToJson = csvToJson;
  }

  _validateCsvString(csvString) {
    if (csvString === undefined || csvString === null) {
      throw new InputValidationError(
        'csvString',
        'string',
        `${typeof csvString}`,
        'Provide valid CSV content as a string to parse.',
      );
    }
  }

  _parseCsvText(csvText) {
    return this.csvToJson.csvToJsonWithConfig(String(csvText), this.getParserConfig());
  }

  csvStringToJson(csvString) {
    this._validateCsvString(csvString);
    return this._parseCsvText(csvString);
  }

  csvStringToJsonStringified(csvString) {
    this._validateCsvString(csvString);
    return JSON.stringify(this._parseCsvText(csvString), undefined, 1);
  }

  csvStringToJsonAsync(csvString) {
    return Promise.resolve(this.csvStringToJson(csvString));
  }

  csvStringToJsonStringifiedAsync(csvString) {
    return Promise.resolve(this.csvStringToJsonStringified(csvString));
  }

  parseFile(file, options = {}) {
    if (!file) {
      return Promise.reject(new InputValidationError(
        'file',
        'File or Blob object',
        `${typeof file}`,
        'Provide a valid File or Blob object to parse.',
      ));
    }
    if (typeof FileReader === 'undefined') return Promise.reject(BrowserApiError.fileReaderNotAvailable());

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          resolve(this._parseCsvText(reader.result));
        } catch (error) {
          reject(BrowserApiError.parseFileError(error));
        }
      };
      reader.onerror = () => reject(
        BrowserApiError.parseFileError(reader.error || new Error('Unknown file reading error')),
      );
      if (options.encoding) reader.readAsText(file, options.encoding);
      else reader.readAsText(file);
    });
  }

  async getJsonFromStreamAsync(stream) {
    if (typeof ReadableStream === 'undefined') throw BrowserApiError.streamingNotSupported();
    if (!stream || typeof stream.getReader !== 'function') {
      throw new InputValidationError(
        'stream',
        'ReadableStream',
        typeof stream,
        'Provide a valid browser ReadableStream.',
      );
    }
    return new StreamProcessor(this.getParserConfig(), { isBrowser: true }).processStream(stream);
  }

  async getJsonFromFileStreamingAsync(file) {
    if (!file || !(file instanceof File)) {
      throw new InputValidationError('file', 'File object', typeof file, 'Provide a valid File object.');
    }
    return typeof file.stream === 'function'
      ? this.getJsonFromStreamAsync(file.stream())
      : this.parseFile(file);
  }

  async getJsonFromFileStreamingAsyncWithCallback(file, options = {}) {
    if (!file || !(file instanceof File)) {
      throw new InputValidationError('file', 'File object', typeof file, 'Provide a valid File object.');
    }
    if (!options.onChunk || typeof options.onChunk !== 'function') {
      throw new InputValidationError(
        'options.onChunk',
        'function',
        typeof options.onChunk,
        'Provide a callback function to handle processed chunks.',
      );
    }
    if (typeof file.stream === 'function') {
      const processor = new StreamProcessor(this.getParserConfig(), {
        isBrowser: true,
        chunkSize: options.chunkSize || 1000,
        onChunk: options.onChunk,
        onComplete: options.onComplete,
        onError: options.onError,
      });
      return processor.processStreamWithCallbacks(file.stream());
    }
    return this.parseFileWithCallbacks(file, options);
  }

  parseFileWithCallbacks(file, options) {
    const chunkSize = options.chunkSize || 1000;
    const onChunk = options.onChunk;
    const onComplete = options.onComplete;
    const onError = options.onError;

    return new Promise((resolve, reject) => {
      if (typeof FileReader === 'undefined') {
        const error = BrowserApiError.fileReaderNotAvailable();
        onError?.(error);
        reject(error);
        return;
      }

      const reader = new FileReader();
      reader.onerror = () => {
        const error = BrowserApiError.parseFileError(
          reader.error || new Error('Unknown file reading error'),
        );
        onError?.(error);
        reject(error);
      };
      reader.onload = () => {
        try {
          const records = this._parseCsvText(reader.result);
          let offset = 0;
          const total = records.length;
          const sendNextChunk = () => {
            const chunk = records.slice(offset, offset + chunkSize);
            if (chunk.length > 0) {
              onChunk(chunk, offset + chunk.length, total);
              offset += chunk.length;
              setTimeout(sendNextChunk, 0);
            } else {
              onComplete?.(records);
              resolve();
            }
          };
          sendNextChunk();
        } catch (cause) {
          const error = BrowserApiError.parseFileError(cause);
          onError?.(error);
          reject(error);
        }
      };
      reader.readAsText(file);
    });
  }
}

const csvToJson = new CsvToJson();
const csvToJsonAsync = new CsvToJsonAsync(csvToJson);
const browser = new BrowserApi(csvToJson);
const encodingOps = {
  utf8: 'utf8',
  ucs2: 'ucs2',
  utf16le: 'utf16le',
  latin1: 'latin1',
  ascii: 'ascii',
  base64: 'base64',
  hex: 'hex',
};

function applyConfigToAllClients(configure) {
  configure(csvToJson);
  configure(csvToJsonAsync);
  if (exports.browser) configure(exports.browser);
  return exports;
}

exports.formatValueByType = (enabled = true) =>
  applyConfigToAllClients((client) => client.formatValueByType(enabled));
exports.supportQuotedField = (enabled = false) =>
  applyConfigToAllClients((client) => client.supportQuotedField(enabled));
exports.fieldDelimiter = (delimiter) =>
  applyConfigToAllClients((client) => client.fieldDelimiter(delimiter));
exports.trimHeaderFieldWhiteSpace = (enabled = false) =>
  applyConfigToAllClients((client) => client.trimHeaderFieldWhiteSpace(enabled));
exports.indexHeader = (index) =>
  applyConfigToAllClients((client) => client.indexHeader(index));
exports.parseSubArray = (delimiter, separator) =>
  applyConfigToAllClients((client) => client.parseSubArray(delimiter, separator));
exports.ignoreColumnIndexes = (indexes) => {
  if (!Array.isArray(indexes)) throw new TypeError('indexes must be an array of numbers');
  if (!indexes.every((index) => Number.isInteger(index) && index >= 0)) {
    throw new TypeError('All elements in indexes must be valid non-negative numbers (>= 0)');
  }
  return applyConfigToAllClients((client) => client.ignoreColumnIndexes(indexes));
};
exports.customEncoding = (encoding) =>
  applyConfigToAllClients((client) => client.encoding(encoding));
exports.utf8Encoding = () =>
  applyConfigToAllClients((client) => client.encoding(encodingOps.utf8));
exports.ucs2Encoding = () =>
  applyConfigToAllClients((client) => client.encoding(encodingOps.ucs2));
exports.utf16leEncoding = () =>
  applyConfigToAllClients((client) => client.encoding(encodingOps.utf16le));
exports.latin1Encoding = () =>
  applyConfigToAllClients((client) => client.encoding(encodingOps.latin1));
exports.asciiEncoding = () =>
  applyConfigToAllClients((client) => client.encoding(encodingOps.ascii));
exports.base64Encoding = () =>
  applyConfigToAllClients((client) => client.encoding(encodingOps.base64));
exports.hexEncoding = () =>
  applyConfigToAllClients((client) => client.encoding(encodingOps.hex));
exports.mapRows = (mapper) =>
  applyConfigToAllClients((client) => client.mapRows(mapper));

exports.generateJsonFileFromCsv = (inputFileName, outputFileName) => {
  if (!inputFileName) throw new Error('inputFileName is not defined!!!');
  if (!outputFileName) throw new Error('outputFileName is not defined!!!');
  csvToJson.generateJsonFileFromCsv(inputFileName, outputFileName);
};
exports.getJsonFromCsv = (inputFileName) => {
  if (!inputFileName) throw new Error('inputFileName is not defined!!!');
  return csvToJson.getJsonFromCsv(inputFileName);
};
exports.getJsonFromCsvAsync = (inputFileNameOrCsv, options) =>
  csvToJsonAsync.getJsonFromCsvAsync(inputFileNameOrCsv, options);
exports.csvStringToJsonAsync = (csvString, options) =>
  csvToJsonAsync.csvStringToJsonAsync(csvString, options);
exports.csvStringToJsonStringifiedAsync = (csvString) =>
  csvToJsonAsync.csvStringToJsonStringifiedAsync(csvString);
exports.generateJsonFileFromCsvAsync = (inputFileName, outputFileName) =>
  csvToJsonAsync.generateJsonFileFromCsv(inputFileName, outputFileName);
exports.getJsonFromStreamAsync = (stream) => csvToJsonAsync.getJsonFromStreamAsync(stream);
exports.getJsonFromFileStreamingAsync = (filePath) =>
  csvToJsonAsync.getJsonFromFileStreamingAsync(filePath);
exports.csvStringToJson = (csvString) => csvToJson.csvStringToJson(csvString);
exports.csvStringToJsonStringified = (csvString) => {
  if (csvString === undefined || csvString === null) throw new Error('csvString is not defined!!!');
  return csvToJson.csvStringToJsonStringified(csvString);
};
exports.browser = browser;
