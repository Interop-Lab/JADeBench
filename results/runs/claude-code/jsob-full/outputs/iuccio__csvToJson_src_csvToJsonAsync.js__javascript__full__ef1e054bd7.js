'use strict';

const fs = require('fs');

class CsvParsingError extends Error {
  constructor(message, code, context = {}) {
    super(message);
    this.name = 'CsvParsingError';
    this.code = code;
    this.context = context;
    Error.captureStackTrace(this, this.constructor);
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
  constructor(parameter, expectedType, receivedType, guidance = '') {
    const message = `Invalid input: Parameter '${parameter}' is required.\nExpected: ${expectedType}\nReceived: ${receivedType}${guidance ? `\n${guidance}` : ''}`;
    super(message, 'INPUT_VALIDATION_ERROR', {
      parameter,
      expectedType,
      receivedType,
    });
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
      `Invalid configuration: indexHeader() expects a numeric value.\nReceived: ${typeof value} (${value})\n\n` +
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
    super(
      `File operation error: Failed to ${operation} file.\nFile path: ${filePath}\nReason: ${originalError.message}\n\n` +
        `Solutions:\n  1. Verify the file path is correct: ${filePath}\n` +
        '  2. Check file permissions (read access for input, write access for output)\n' +
        '  3. Ensure the directory exists and is writable for output files\n' +
        '  4. Verify the file is not in use by another process',
      'FILE_OPERATION_ERROR',
      { operation, filePath, originalError: originalError.message },
    );
    this.name = 'FileOperationError';
    this.originalError = originalError;
  }
}

class JsonValidationError extends CsvParsingError {
  constructor(json, originalError) {
    super(
      'JSON validation error: The parsed CSV data generated invalid JSON.\n' +
        'This typically indicates malformed field names or values in the CSV.\n' +
        `Original error: ${originalError.message}\n\n` +
        "Solutions:\n  1. Check that field names are valid JavaScript identifiers (or will be converted safely)\n" +
        "  2. Review the CSV data for special characters that aren't properly escaped\n" +
        '  3. Enable supportQuotedField(true) for fields containing special characters\n' +
        "  4. Verify that formatValueByType() isn't converting values incorrectly",
      'JSON_VALIDATION_ERROR',
      {
        originalError: originalError.message,
        csvPreview: json ? json.substring(0, 200) : 'N/A',
      },
    );
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

const fileUtils = {
  isEncodedFile(encoding) {
    return encoding === 'base64' || encoding === 'hex';
  },

  decodeContent(content, encoding) {
    return this.isEncodedFile(encoding)
      ? Buffer.from(content, encoding).toString('utf8')
      : content;
  },

  toString(content) {
    return typeof content === 'string' ? content : String(content);
  },

  wrapReadError(filePath, error) {
    return new FileOperationError('read', filePath, error);
  },

  wrapWriteError(filePath, error) {
    return new FileOperationError('write', filePath, error);
  },

  readFile(filePath, encoding = 'utf8') {
    try {
      if (this.isEncodedFile(encoding)) {
        return this.decodeContent(fs.readFileSync(filePath, 'utf8'), encoding);
      }
      return this.toString(fs.readFileSync(filePath, encoding));
    } catch (error) {
      throw this.wrapReadError(filePath, error);
    }
  },

  async readFileAsync(filePath, encoding = 'utf8') {
    try {
      if (this.isEncodedFile(encoding)) {
        return this.decodeContent(await fs.promises.readFile(filePath, 'utf8'), encoding);
      }
      return this.toString(await fs.promises.readFile(filePath, encoding));
    } catch (error) {
      throw this.wrapReadError(filePath, error);
    }
  },

  writeFile(content, filePath) {
    try {
      fs.writeFileSync(filePath, content, 'utf8');
    } catch (error) {
      throw this.wrapWriteError(filePath, error);
    }
  },

  async writeFileAsync(content, filePath) {
    try {
      await fs.promises.writeFile(filePath, content, 'utf8');
    } catch (error) {
      throw this.wrapWriteError(filePath, error);
    }
  },
};

const stringUtils = {
  trimPropertyName(trimAllWhitespace, propertyName) {
    if (!propertyName) return '';
    return trimAllWhitespace
      ? propertyName.replace(/\s/g, '')
      : propertyName.trim();
  },

  getValueFormatByType(value) {
    if (value === undefined || value === '') return undefined;
    const lowerCaseValue = value.toLowerCase();
    if (lowerCaseValue === 'true' || lowerCaseValue === 'false') {
      return JSON.parse(lowerCaseValue);
    }
    if (/^-?\d+$/.test(value)) {
      const hasLeadingZero =
        (value.length > 1 && value[0] === '0') ||
        (value.length > 2 && value[0] === '-' && value[1] === '0');
      if (hasLeadingZero) return String(value);
      const number = Number(value);
      return Number.isSafeInteger(number) ? number : String(value);
    }
    if (/^-?\d*\.\d+$/.test(value)) {
      const number = Number(value);
      return Number.isFinite(number) ? number : String(value);
    }
    return String(value);
  },

  hasContent(fields = []) {
    return Array.isArray(fields) && fields.some((field) => Boolean(field));
  },
};

const jsonUtils = {
  validateJson(json) {
    try {
      JSON.parse(json);
    } catch (error) {
      throw new JsonValidationError(json, error);
    }
  },
};

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
    this.indexesToIgnore = Object.freeze(
      config.indexesToIgnore ? [...config.indexesToIgnore] : [],
    );
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
    if (typeof mapper !== 'function') {
      throw new TypeError('mapperFn must be a function');
    }
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

class CsvToJson extends Configurable {
  csvToJsonWithConfig(csv, config) {
    this.validateInputConfig(config);
    const records = this.parseRecords(csv);
    const delimiter = this.getFieldDelimiter(config);
    let headerFields;
    let headerIndex = this.getIndexHeader(config);

    while (headerIndex < records.length) {
      headerFields = this.getFields(records[headerIndex], config, delimiter);
      if (stringUtils.hasContent(headerFields)) break;
      headerIndex++;
    }

    if (!headerFields) throw CsvFormatError.missingHeader();

    const results = [];
    for (let recordIndex = headerIndex + 1; recordIndex < records.length; recordIndex++) {
      const fields = this.getFields(records[recordIndex], config, delimiter);
      if (!stringUtils.hasContent(fields)) continue;

      let row = this.buildJsonResult(headerFields, fields, config);
      if (config.rowMapper) {
        row = config.rowMapper(row, recordIndex - (headerIndex + 1));
      }
      if (row !== null) results.push(row);
    }
    return results;
  }

  generateJsonFileFromCsv(inputFilePath, outputFilePath) {
    fileUtils.writeFile(this.getJsonFromCsvStringified(inputFilePath), outputFilePath);
  }

  getJsonFromCsvStringified(filePath) {
    const json = JSON.stringify(this.getJsonFromCsv(filePath), undefined, 1);
    jsonUtils.validateJson(json);
    return json;
  }

  getJsonFromCsv(filePath) {
    const config = this.getParserConfig();
    return this.csvToJson(fileUtils.readFile(filePath, config.encoding || 'utf8'));
  }

  csvStringToJson(csv) {
    return this.csvToJson(csv);
  }

  csvStringToJsonStringified(csv) {
    const json = JSON.stringify(this.csvStringToJson(csv), undefined, 1);
    jsonUtils.validateJson(json);
    return json;
  }

  csvToJson(csv) {
    return this.csvToJsonWithConfig(csv, this.getParserConfig());
  }

  parseRecords(csv) {
    const records = [];
    let record = '';
    let insideQuotes = false;

    for (let index = 0; index < csv.length; ) {
      const character = csv[index];
      if (character === '"') {
        if (insideQuotes && csv[index + 1] === '"') {
          record += '""';
          index += 2;
          continue;
        }
        insideQuotes = !insideQuotes;
        record += character;
        index++;
        continue;
      }

      if (!insideQuotes) {
        const lineEndingLength = this.getLineEndingLength(csv, index);
        if (lineEndingLength > 0) {
          records.push(record);
          record = '';
          index += lineEndingLength;
          continue;
        }
      }

      record += character;
      index++;
    }

    if (record.length > 0) records.push(record);
    if (insideQuotes) throw CsvFormatError.mismatchedQuotes('CSV');
    return records;
  }

  getLineEndingLength(text, index) {
    if (text.slice(index, index + 2) === '\r\n') return 2;
    if (text[index] === '\n') return 1;
    if (text[index] === '\r' && text[index + 1] !== '\n') return 1;
    return 0;
  }

  getFieldDelimiter(config = this.config) {
    return config.delimiter || ',';
  }

  getIndexHeader(config = this.config) {
    return config.indexHeaderValue !== null && !isNaN(config.indexHeaderValue)
      ? config.indexHeaderValue
      : 0;
  }

  getFields(record, config = this.config, delimiter = this.getFieldDelimiter(config)) {
    return config.isSupportQuotedField
      ? this.split(record, config)
      : record.split(delimiter);
  }

  buildJsonResult(headers, fields, config = this.config) {
    const result = {};
    const ignoredIndexes = new Set(config.indexesToIgnore || []);

    for (let index = 0; index < headers.length; index++) {
      if (ignoredIndexes.has(index)) continue;
      const propertyName = stringUtils.trimPropertyName(
        config.isTrimHeaderFieldWhiteSpace,
        headers[index],
      );
      let value = fields[index];
      if (this.isParseSubArray(value, config)) {
        value = this.buildJsonSubArray(value, config);
      }
      if (config.printValueFormatByType && !Array.isArray(value)) {
        value = stringUtils.getValueFormatByType(fields[index]);
      }
      result[propertyName] = value;
    }
    return result;
  }

  buildJsonSubArray(value, config = this.config) {
    const delimiter = config.parseSubArrayDelimiter;
    const content = value.substring(
      value.indexOf(delimiter) + 1,
      value.lastIndexOf(delimiter),
    );
    const values = content.split(config.parseSubArraySeparator);
    return config.printValueFormatByType
      ? values.map((item) => stringUtils.getValueFormatByType(item))
      : values;
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
    if (this.getFieldDelimiter(config) === '"') {
      throw ConfigurationError.quotedFieldConflict('fieldDelimiter', '"');
    }
    if (config.parseSubArraySeparator === '"') {
      throw ConfigurationError.quotedFieldConflict('parseSubArraySeparator', '"');
    }
    if (config.parseSubArrayDelimiter === '"') {
      throw ConfigurationError.quotedFieldConflict('parseSubArrayDelimiter', '"');
    }
  }

  hasQuotes(value) {
    return value.includes('"');
  }

  split(record, config = this.config) {
    if (record.length === 0) return [];
    const fields = [];
    const delimiter = this.getFieldDelimiter(config);
    let field = '';
    let insideQuotes = false;

    for (let index = 0; index < record.length; index++) {
      const character = record[index];
      if (character === '"') {
        if (insideQuotes && record[index + 1] === '"') {
          field += '"';
          index++;
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (character === delimiter && !insideQuotes) {
        fields.push(field);
        field = '';
      } else {
        field += character;
      }
    }

    fields.push(field);
    if (insideQuotes) throw CsvFormatError.mismatchedQuotes('row');
    return fields;
  }

  isEscapedQuote(text, index, insideQuotes) {
    return insideQuotes && index + 1 < text.length && text[index + 1] === '"';
  }

  isEmptyQuotedField(text, index, insideQuotes, field, delimiter) {
    if (insideQuotes || field !== '' || index + 1 >= text.length) return false;
    if (text[index + 1] !== '"') return false;
    const followingIndex = index + 2;
    return followingIndex === text.length || text[followingIndex] === delimiter;
  }
}

const csvParser = new CsvToJson();
csvParser.CsvToJson = CsvToJson;

class StreamProcessor {
  constructor(csvConfig, options = {}) {
    this.csvConfig = csvConfig;
    this.isBrowser = options.isBrowser ||
      (typeof window !== 'undefined' && typeof document !== 'undefined');
    this.onChunk = options.onChunk;
    this.chunkSize = options.chunkSize || 1000;
    this.onComplete = options.onComplete;
    this.onError = options.onError;
    this.buffer = '';
    this.headers = null;
    this.headerRowIndex =
      csvConfig.indexHeaderValue !== null && !isNaN(csvConfig.indexHeaderValue)
        ? csvConfig.indexHeaderValue
        : 0;
    this.currentRecordIndex = 0;
    this.dataRowIndex = 0;
    this.ignoredIndexes = new Set(csvConfig.indexesToIgnore || []);
    this.parsedRecords = [];
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
      text = String(chunk);
    }
    this.buffer += text;
    this.processCompleteRecords();
  }

  processCompleteRecords() {
    const parsed = this.extractRecords(this.buffer, false);
    this.buffer = parsed.remainingBuffer;
    for (const record of parsed.completeRecords) {
      this.processRecord(record);
      this.currentRecordIndex++;
    }
  }

  extractRecords(text, includeLastRecord) {
    const completeRecords = [];
    let record = '';
    let insideQuotes = false;

    for (let index = 0; index < text.length; ) {
      const character = text[index];
      if (character === '"') {
        if (insideQuotes && text[index + 1] === '"') {
          record += '""';
          index += 2;
          continue;
        }
        insideQuotes = !insideQuotes;
        record += character;
        index++;
        continue;
      }

      if (!insideQuotes) {
        const lineEndingLength = csvParser.getLineEndingLength(text, index);
        if (lineEndingLength > 0) {
          completeRecords.push(record);
          record = '';
          index += lineEndingLength;
          continue;
        }
      }
      record += character;
      index++;
    }

    if (includeLastRecord && record.length > 0) {
      if (insideQuotes) throw CsvFormatError.mismatchedQuotes('CSV stream');
      completeRecords.push(record);
      record = '';
    }
    return { completeRecords, remainingBuffer: record, isInsideQuotes: insideQuotes };
  }

  processRecord(record) {
    if (this.headers === null && this.currentRecordIndex === this.headerRowIndex) {
      const fields = this.splitRecord(record);
      if (stringUtils.hasContent(fields)) this.headers = fields;
      return;
    }
    if (this.headers === null) return;

    const fields = this.splitRecord(record);
    if (!stringUtils.hasContent(fields)) return;
    const row = this.buildJsonResult(this.headers, fields);
    const mappedRow = this.applyRowMapper(row);
    if (mappedRow !== null) this.parsedRecords.push(mappedRow);
  }

  splitRecord(record) {
    return this.csvConfig.isSupportQuotedField
      ? csvParser.split(record, this.csvConfig)
      : record.split(this.csvConfig.delimiter || ',');
  }

  buildJsonResult(headers, fields) {
    return csvParser.buildJsonResult(headers, fields, this.csvConfig);
  }

  applyRowMapper(row) {
    if (this.csvConfig.rowMapper) {
      const mappedRow = this.csvConfig.rowMapper(row, this.dataRowIndex);
      this.dataRowIndex++;
      return mappedRow;
    }
    this.dataRowIndex++;
    return row;
  }

  sendPendingChunks() {
    if (!this.onChunk) return;
    while (this.parsedRecords.length >= this.chunkSize) {
      const chunk = this.parsedRecords.splice(0, this.chunkSize);
      this.allRecords.push(...chunk);
      this.onChunk(chunk, this.allRecords.length, null);
    }
  }

  sendRemainingChunks() {
    if (!this.onChunk || this.parsedRecords.length === 0) return;
    const chunk = [...this.parsedRecords];
    this.parsedRecords.length = 0;
    this.allRecords.push(...chunk);
    this.onChunk(chunk, this.allRecords.length, this.allRecords.length);
  }

  finalizeProcessing() {
    const parsed = this.extractRecords(this.buffer, true);
    for (const record of parsed.completeRecords) {
      this.processRecord(record);
      this.currentRecordIndex++;
    }
    this.buffer = '';
    if (!this.headers && this.parsedRecords.length === 0) return;
    if (!this.headers) throw CsvFormatError.missingHeader();
  }

  getResult() {
    return this.parsedRecords;
  }

  async processStream(stream) {
    if (this.isBrowser) {
      if (!stream || typeof stream.getReader !== 'function') {
        throw new Error('Invalid ReadableStream provided');
      }
      const reader = stream.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        this.processChunk(value);
      }
      this.finalizeProcessing();
      return this.getResult();
    }

    if (!stream || typeof stream.pipe !== 'function') {
      throw new Error('Invalid Readable stream provided');
    }
    return new Promise((resolve, reject) => {
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

  async processStreamWithCallbacks(stream) {
    try {
      if (this.isBrowser) {
        if (!stream || typeof stream.getReader !== 'function') {
          throw new Error('Invalid ReadableStream provided');
        }
        const reader = stream.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          this.processChunk(value);
          this.sendPendingChunks();
        }
      } else {
        await new Promise((resolve, reject) => {
          if (!stream || typeof stream.pipe !== 'function') {
            reject(new Error('Invalid Readable stream provided'));
            return;
          }
          stream.on('data', (chunk) => {
            try {
              this.processChunk(chunk);
              this.sendPendingChunks();
            } catch (error) {
              reject(error);
            }
          });
          stream.on('end', resolve);
          stream.on('error', reject);
        });
      }
      this.finalizeProcessing();
      this.sendRemainingChunks();
      if (this.onComplete) this.onComplete(this.allRecords);
    } catch (error) {
      if (this.onError) this.onError(error);
      throw error;
    }
  }
}

class CsvToJsonAsync extends Configurable {
  constructor() {
    super();
    this.csvToJson = csvParser;
  }

  async generateJsonFileFromCsv(inputFilePath, outputFilePath) {
    const json = await this.getJsonFromCsvStringified(inputFilePath);
    await fileUtils.writeFileAsync(json, outputFilePath);
  }

  async getJsonFromCsvStringified(inputFilePath) {
    const records = await this.getJsonFromCsvAsync(inputFilePath);
    return JSON.stringify(records, undefined, 1);
  }

  async getJsonFromCsvAsync(inputFilePathOrCsv, options = {}) {
    if (inputFilePathOrCsv === null || inputFilePathOrCsv === undefined) {
      throw new InputValidationError(
        'inputFileNameOrCsv',
        'string (file path) or CSV string content',
        typeof inputFilePathOrCsv,
        'Either provide a valid file path or CSV content as a string.',
      );
    }

    const config = this.getParserConfig();
    if (options.raw) {
      return inputFilePathOrCsv === ''
        ? []
        : this.csvToJson.csvToJsonWithConfig(inputFilePathOrCsv, config);
    }
    const csv = await fileUtils.readFileAsync(
      inputFilePathOrCsv,
      config.encoding || 'utf8',
    );
    return this.csvToJson.csvToJsonWithConfig(csv, config);
  }

  csvStringToJsonAsync(csv, options = { raw: true }) {
    return this.getJsonFromCsvAsync(csv, options);
  }

  async getJsonFromStreamAsync(stream) {
    this.validateStream(stream);
    return new StreamProcessor(this.getParserConfig(), { isBrowser: false })
      .processStream(stream);
  }

  validateStream(stream) {
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

module.exports = new CsvToJsonAsync();
