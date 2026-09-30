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
    let text = `${this.name}: ${this.message}`;
    if (this.context && Object.keys(this.context).length > 0) {
      text += '\n\nContext:';
      for (const [key, value] of Object.entries(this.context)) {
        text += `\n  ${key}: ${this.formatValue(value)}`;
      }
    }
    return text;
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
      'CSV parsing error: No header row found.\nThe CSV file appears to be empty or has no valid header line.\n\n' +
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
      'RFC 4180 rules for quoted fields:\n  • Fields containing delimiters or quotes MUST be enclosed in double quotes\n' +
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
  constructor(csvText, originalError) {
    super(
      'JSON validation error: The parsed CSV data generated invalid JSON.\n' +
      'This typically indicates malformed field names or values in the CSV.\n' +
      `Original error: ${originalError.message}\n\n` +
      "Solutions:\n  1. Check that field names are valid JavaScript identifiers (or will be converted safely)\n" +
      "  2. Review the CSV data for special characters that aren't properly escaped\n" +
      '  3. Enable supportQuotedField(true) for fields containing special characters\n' +
      "  4. Verify that formatValueByType() isn't converting values incorrectly",
      'JSON_VALIDATION_ERROR',
      { originalError: originalError.message, csvPreview: csvText ? csvText.substring(0, 200) : 'N/A' },
    );
    this.name = 'JsonValidationError';
    this.originalError = originalError;
  }
}

const fileUtils = {
  _isEncodedFile(encoding) {
    return encoding === 'base64' || encoding === 'hex';
  },
  _decodeContent(content, encoding) {
    return this._isEncodedFile(encoding) ? Buffer.from(content, encoding).toString('utf8') : content;
  },
  _toString(content) {
    return typeof content === 'string' ? content : content.toString();
  },
  _wrapReadError(filePath, error) {
    return new FileOperationError('read', filePath, error);
  },
  _wrapWriteError(filePath, error) {
    return new FileOperationError('write', filePath, error);
  },
  readFile(filePath, encoding = 'utf8') {
    try {
      if (this._isEncodedFile(encoding)) {
        return this._decodeContent(fs.readFileSync(filePath, 'utf8'), encoding);
      }
      return this._toString(fs.readFileSync(filePath, encoding));
    } catch (error) {
      throw this._wrapReadError(filePath, error);
    }
  },
  async readFileAsync(filePath, encoding = 'utf8') {
    try {
      const readEncoding = this._isEncodedFile(encoding) ? 'utf8' : encoding;
      const content = await fs.promises.readFile(filePath, readEncoding);
      return this._isEncodedFile(encoding)
        ? this._decodeContent(this._toString(content), encoding)
        : this._toString(content);
    } catch (error) {
      throw this._wrapReadError(filePath, error);
    }
  },
  writeFile(content, filePath) {
    try {
      fs.writeFileSync(filePath, content, 'utf8');
    } catch (error) {
      throw this._wrapWriteError(filePath, error);
    }
  },
  async writeFileAsync(content, filePath) {
    try {
      await fs.promises.writeFile(filePath, content, 'utf8');
    } catch (error) {
      throw this._wrapWriteError(filePath, error);
    }
  },
};

const stringUtils = {
  trimPropertyName(removeAllWhitespace, propertyName) {
    if (!propertyName) return '';
    return removeAllWhitespace ? propertyName.replace(/\s/g, '') : propertyName.trim();
  },
  getValueFormatByType(value) {
    if (value === undefined || value === '') return '';
    const lower = value.toLowerCase();
    if (lower === 'true' || lower === 'false') return JSON.parse(lower);
    if (/^-?\d+$/.test(value)) {
      if ((value.length > 1 && value[0] === '0') || (value.length > 2 && value[0] === '-' && value[1] === '0')) return String(value);
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
    return Array.isArray(fields) && fields.some(Boolean);
  },
};

function validateJson(text) {
  try {
    JSON.parse(text);
  } catch (error) {
    throw new JsonValidationError(text, error);
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
  formatValueByType(enabled = true) { this.config.printValueFormatByType = enabled; return this; }
  supportQuotedField(enabled = false) { this.config.isSupportQuotedField = enabled; return this; }
  fieldDelimiter(delimiter) { this.config.delimiter = delimiter; return this; }
  trimHeaderFieldWhiteSpace(enabled = false) { this.config.isTrimHeaderFieldWhiteSpace = enabled; return this; }
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
  ignoreColumnIndexes(indexes) { this.config.indexesToIgnore = [...indexes]; return this; }
  encoding(encoding) { this.config.encoding = encoding; return this; }
  getParserConfig() { return new ParserConfig(this.config); }
}

function lineEndingLength(text, index) {
  if (text.slice(index, index + 2) === '\r\n') return 2;
  if (text[index] === '\n') return 1;
  if (text[index] === '\r' && text[index + 1] !== '\n') return 1;
  return 0;
}

function parseRecords(csv) {
  const records = [];
  let record = '';
  let insideQuotes = false;
  for (let index = 0; index < csv.length;) {
    const character = csv[index];
    if (character === '"') {
      if (insideQuotes && csv[index + 1] === '"') {
        record += '""';
        index += 2;
      } else {
        insideQuotes = !insideQuotes;
        record += character;
        index++;
      }
      continue;
    }
    const endingLength = insideQuotes ? 0 : lineEndingLength(csv, index);
    if (endingLength) {
      records.push(record);
      record = '';
      index += endingLength;
    } else {
      record += character;
      index++;
    }
  }
  if (record.length > 0) records.push(record);
  if (insideQuotes) throw CsvFormatError.mismatchedQuotes('CSV');
  return records;
}

function splitQuotedRecord(record, delimiter) {
  if (record.length === 0) return [];
  const fields = [];
  let field = '';
  let insideQuotes = false;
  for (let index = 0; index < record.length; index++) {
    const character = record[index];
    if (character === '"') {
      if (insideQuotes && record[index + 1] === '"') {
        field += '"';
        index++;
      } else if (!insideQuotes && field === '' && record[index + 1] === '"' && (index + 2 === record.length || record[index + 2] === delimiter)) {
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

function validateConfig(config) {
  if (!config.isSupportQuotedField) return;
  if ((config.delimiter || ',') === '"') throw ConfigurationError.quotedFieldConflict('fieldDelimiter', '"');
  if (config.parseSubArraySeparator === '"') throw ConfigurationError.quotedFieldConflict('parseSubArraySeparator', '"');
  if (config.parseSubArrayDelimiter === '"') throw ConfigurationError.quotedFieldConflict('parseSubArrayDelimiter', '"');
}

function getFields(record, config) {
  const delimiter = config.delimiter || ',';
  return config.isSupportQuotedField ? splitQuotedRecord(record, delimiter) : record.split(delimiter);
}

function isSubArray(value, config) {
  const delimiter = config.parseSubArrayDelimiter;
  return Boolean(delimiter && value && value.indexOf(delimiter) === 0 && value.lastIndexOf(delimiter) === value.length - 1);
}

function buildSubArray(value, config) {
  const delimiter = config.parseSubArrayDelimiter;
  const values = value.substring(value.indexOf(delimiter) + 1, value.lastIndexOf(delimiter)).split(config.parseSubArraySeparator);
  return config.printValueFormatByType ? values.map(item => stringUtils.getValueFormatByType(item)) : values;
}

function buildJsonResult(headers, fields, config) {
  const result = {};
  const ignoredIndexes = new Set(config.indexesToIgnore || []);
  for (let index = 0; index < headers.length; index++) {
    if (ignoredIndexes.has(index)) continue;
    const property = stringUtils.trimPropertyName(config.isTrimHeaderFieldWhiteSpace, headers[index]);
    let value = fields[index];
    if (isSubArray(value, config)) value = buildSubArray(value, config);
    if (config.printValueFormatByType && !Array.isArray(value)) value = stringUtils.getValueFormatByType(fields[index]);
    result[property] = value;
  }
  return result;
}

class CsvToJson extends Configurable {
  csvToJsonWithConfig(csv, config) {
    validateConfig(config);
    const records = parseRecords(csv);
    let headerIndex = config.indexHeaderValue != null && !isNaN(config.indexHeaderValue) ? config.indexHeaderValue : 0;
    let headers;
    while (headerIndex < records.length) {
      headers = getFields(records[headerIndex], config);
      if (stringUtils.hasContent(headers)) break;
      headerIndex++;
    }
    if (!headers) throw CsvFormatError.missingHeader();

    const result = [];
    let dataRowIndex = 0;
    for (let index = headerIndex + 1; index < records.length; index++) {
      const fields = getFields(records[index], config);
      if (!stringUtils.hasContent(fields)) continue;
      let row = buildJsonResult(headers, fields, config);
      if (config.rowMapper) row = config.rowMapper(row, dataRowIndex);
      dataRowIndex++;
      if (row !== null) result.push(row);
    }
    return result;
  }
  generateJsonFileFromCsv(csvFilePath, jsonFilePath) { fileUtils.writeFile(this.getJsonFromCsvStringified(csvFilePath), jsonFilePath); }
  getJsonFromCsvStringified(csvFilePath) {
    const json = JSON.stringify(this.getJsonFromCsv(csvFilePath), undefined, 1);
    validateJson(json);
    return json;
  }
  getJsonFromCsv(csvFilePath) {
    const config = this.getParserConfig();
    return this.csvToJson(fileUtils.readFile(csvFilePath, config.encoding || 'utf8'));
  }
  csvStringToJson(csv) { return this.csvToJson(csv); }
  csvStringToJsonStringified(csv) {
    const json = JSON.stringify(this.csvStringToJson(csv), undefined, 1);
    validateJson(json);
    return json;
  }
  csvToJson(csv) { return this.csvToJsonWithConfig(csv, this.getParserConfig()); }
  parseRecords(csv) { return parseRecords(csv); }
  getLineEndingLength(csv, index) { return lineEndingLength(csv, index); }
  getFieldDelimiter(config = this.config) { return config.delimiter || ','; }
  getIndexHeader(config = this.config) { return config.indexHeaderValue != null && !isNaN(config.indexHeaderValue) ? config.indexHeaderValue : 0; }
  getFields(record, config = this.config) { return getFields(record, config); }
  buildJsonResult(headers, fields, config = this.config) { return buildJsonResult(headers, fields, config); }
  buildJsonSubArray(value, config = this.config) { return buildSubArray(value, config); }
  isParseSubArray(value, config = this.config) { return isSubArray(value, config); }
  validateInputConfig(config = this.config) { validateConfig(config); }
  hasQuotes(value) { return value.includes('"'); }
  split(record, config = this.config) { return splitQuotedRecord(record, config.delimiter || ','); }
  isEscapedQuote(value, index, insideQuotes) { return insideQuotes && index + 1 < value.length && value[index + 1] === '"'; }
  isEmptyQuotedField(value, index, insideQuotes, field, delimiter) {
    if (insideQuotes || field !== '' || index + 1 >= value.length || value[index + 1] !== '"') return false;
    return index + 2 === value.length || value[index + 2] === delimiter;
  }
}

const csvToJson = new CsvToJson();
csvToJson.CsvToJson = CsvToJson;

class StreamProcessor {
  constructor(csvConfig, options = {}) {
    this.csvConfig = csvConfig;
    this.isBrowser = options.isBrowser || (typeof window !== 'undefined' && typeof document !== 'undefined');
    this.buffer = '';
    this.isInsideQuotes = false;
    this.headers = null;
    this.headerRowIndex = csvConfig.indexHeaderValue != null && !isNaN(csvConfig.indexHeaderValue) ? csvConfig.indexHeaderValue : 0;
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
    if (typeof chunk === 'string') text = chunk;
    else if (this.isBrowser && typeof globalThis.TextDecoder !== 'undefined') text = new globalThis.TextDecoder().decode(chunk);
    else if (this.isBrowser) text = String.fromCharCode.apply(null, new Uint8Array(chunk));
    else text = chunk.toString();
    this.buffer += text;
    this._processCompleteRecords();
  }

  processStream(stream) {
    return new Promise((resolve, reject) => {
      if (this.isBrowser) {
        if (!stream || typeof stream.getReader !== 'function') return reject(Error('Invalid ReadableStream provided'));
        const reader = stream.getReader();
        const consume = async () => {
          try {
            for (;;) {
              const { done, value } = await reader.read();
              if (done) { this.finalizeProcessing(); resolve(this.getResult()); return; }
              this.processChunk(value);
            }
          } catch (error) { reject(error); }
        };
        consume();
        return;
      }
      if (!stream || typeof stream.pipe !== 'function') return reject(Error('Invalid Readable stream provided'));
      stream.on('data', chunk => { try { this.processChunk(chunk); } catch (error) { reject(error); } });
      stream.on('end', () => { try { this.finalizeProcessing(); resolve(this.getResult()); } catch (error) { reject(error); } });
      stream.on('error', reject);
    });
  }

  finalizeProcessing() {
    if (this.isInsideQuotes) throw CsvFormatError.mismatchedQuotes('CSV stream');
    if (this.buffer.length > 0) {
      this._processRecord(this.buffer);
      this.currentRecordIndex++;
      this.buffer = '';
    }
    if (!this.headers && this.parsedRecords.length !== 0) throw CsvFormatError.missingHeader();
  }
  getResult() { return this.parsedRecords; }

  _processCompleteRecords() {
    let record = '';
    let index = 0;
    while (index < this.buffer.length) {
      const character = this.buffer[index];
      if (character === '"') {
        if (this.isInsideQuotes && this.buffer[index + 1] === '"') { record += '""'; index += 2; continue; }
        this.isInsideQuotes = !this.isInsideQuotes;
      }
      const endingLength = this.isInsideQuotes ? 0 : lineEndingLength(this.buffer, index);
      if (endingLength) {
        this._processRecord(record);
        this.currentRecordIndex++;
        record = '';
        index += endingLength;
      } else {
        record += character;
        index++;
      }
    }
    this.buffer = record;
  }

  _processRecord(record) {
    if (this.headers === null && this.currentRecordIndex === this.headerRowIndex) this._processHeaderRecord(record);
    else if (this.headers !== null) this._processDataRecord(record);
  }
  _processHeaderRecord(record) {
    const fields = getFields(record, this.csvConfig);
    if (stringUtils.hasContent(fields)) this.headers = fields;
  }
  _processDataRecord(record) {
    const fields = getFields(record, this.csvConfig);
    if (!stringUtils.hasContent(fields)) return;
    let row = buildJsonResult(this.headers, fields, this.csvConfig);
    if (this.csvConfig.rowMapper) row = this.csvConfig.rowMapper(row, this.dataRowIndex);
    this.dataRowIndex++;
    if (row !== null) this.parsedRecords.push(row);
  }
}

const DEFAULT_OPTIONS = { raw: true };

class CsvToJsonAsync extends Configurable {
  constructor() {
    super();
    this.csvToJson = csvToJson;
  }
  async generateJsonFileFromCsv(csvFilePath, jsonFilePath) {
    const json = await this.getJsonFromCsvStringified(csvFilePath);
    await fileUtils.writeFileAsync(json, jsonFilePath);
  }
  async getJsonFromCsvStringified(csvFilePath) {
    return JSON.stringify(await this.getJsonFromCsvAsync(csvFilePath), undefined, 1);
  }
  async getJsonFromCsvAsync(csvInput, options = {}) {
    if (csvInput === null || csvInput === undefined) {
      throw new InputValidationError('inputFileNameOrCsv', 'string (file path) or CSV string content', typeof csvInput, 'Either provide a valid file path or CSV content as a string.');
    }
    const config = this.getParserConfig();
    if (options.raw) return csvInput === '' ? [] : this.csvToJson.csvToJsonWithConfig(csvInput, config);
    const csvContents = await fileUtils.readFileAsync(csvInput, config.encoding || 'utf8');
    return this.csvToJson.csvToJsonWithConfig(csvContents, config);
  }
  csvStringToJsonAsync(csvString, options = DEFAULT_OPTIONS) { return this.getJsonFromCsvAsync(csvString, options); }
  async getJsonFromStreamAsync(stream) {
    this._validateStream(stream);
    return new StreamProcessor(this.getParserConfig(), { isBrowser: false }).processStream(stream);
  }
  _validateStream(stream) {
    if (!stream || typeof stream.pipe !== 'function') throw new InputValidationError('stream', 'Readable stream', typeof stream, 'Provide a valid Node.js Readable stream.');
  }
  async getJsonFromFileStreamingAsync(filePath) {
    if (!filePath || typeof filePath !== 'string') throw new InputValidationError('filePath', 'string (file path)', typeof filePath, 'Provide a valid file path as a string.');
    const config = this.getParserConfig();
    const encoding = typeof config.encoding === 'string' ? config.encoding : 'utf8';
    return this.getJsonFromStreamAsync(fs.createReadStream(filePath, { encoding }));
  }
}

module.exports = new CsvToJsonAsync();
