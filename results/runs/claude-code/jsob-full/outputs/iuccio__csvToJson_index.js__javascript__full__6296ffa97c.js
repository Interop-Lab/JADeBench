'use strict';

const fs = require('fs');

class CsvParsingError extends Error {
  constructor(message, code = 'CSV_PARSING_ERROR', context = {}) {
    super(message);
    this.name = 'CsvParsingError';
    this.code = code;
    this.context = context;
    Error.captureStackTrace?.(this, this.constructor);
  }

  toString() {
    let text = `${this.name}: ${this.message}`;
    if (this.context && Object.keys(this.context).length) {
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
  constructor(parameter, expected, actual, suggestion) {
    super(
      `Invalid input for ${parameter}. Expected ${expected}, received ${actual}. ${suggestion}`,
      'INPUT_VALIDATION_ERROR',
      { parameter, expected, actual, suggestion },
    );
    this.name = 'InputValidationError';
  }
}

class ConfigurationError extends CsvParsingError {
  constructor(message, context = {}) {
    super(message, 'CONFIGURATION_ERROR', context);
    this.name = 'ConfigurationError';
  }

  static invalidHeaderIndex(value) {
    return new ConfigurationError(`Invalid header index: ${value}`, { value });
  }

  static quotedFieldConflict(optionName, value) {
    return new ConfigurationError(
      `Configuration conflict: supportQuotedField() is enabled, but ${optionName} is set to '${value}'.\n` +
        'The quote character (") cannot be used as a field delimiter, separator, or sub-array delimiter when quoted field support is active.',
      { optionName, value, conflictingOption: 'supportQuotedField' },
    );
  }
}

class CsvFormatError extends CsvParsingError {
  constructor(message, context = {}) {
    super(message, 'CSV_FORMAT_ERROR', context);
    this.name = 'CsvFormatError';
  }

  static missingHeader() {
    return new CsvFormatError('CSV parsing error: No header row found.');
  }

  static mismatchedQuotes(location) {
    return new CsvFormatError(`CSV parsing error: Mismatched quotes detected in ${location}.`, { location });
  }
}

class FileOperationError extends CsvParsingError {
  constructor(operation, filePath, originalError) {
    super(
      `File ${operation} error for "${filePath}": ${originalError.message}`,
      'FILE_OPERATION_ERROR',
      { operation, filePath, originalError: originalError.message },
    );
    this.name = 'FileOperationError';
    this.originalError = originalError;
  }
}

class JsonValidationError extends CsvParsingError {
  constructor(csvPreview, originalError) {
    super(
      `JSON validation error: The parsed CSV data generated invalid JSON. Original error: ${originalError.message}`,
      'JSON_VALIDATION_ERROR',
      { originalError: originalError.message, csvPreview: csvPreview ? csvPreview.substring(0, 100) : '' },
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
    return new BrowserApiError('Browser compatibility error: FileReader API is not available.');
  }

  static parseFileError(error) {
    return new BrowserApiError(`Browser file parsing error: ${error.message}`, {
      originalError: error.message,
    });
  }

  static streamingNotSupported() {
    return new BrowserApiError('Browser compatibility error: ReadableStream API is not available.');
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

function hasContent(values) {
  return Array.isArray(values) && values.some(Boolean);
}

function formatValue(value) {
  if (typeof value !== 'string') return value;
  if (/^-?\d+$/.test(value)) {
    if ((value.length > 1 && value[0] === '0') || (value.length > 2 && value[0] === '-' && value[1] === '0')) {
      return value;
    }
    const number = Number(value);
    return Number.isSafeInteger(number) ? number : value;
  }
  if (/^-?\d*\.\d+$/.test(value)) {
    const number = Number(value);
    return Number.isFinite(number) ? number : value;
  }
  const lower = value.toLowerCase();
  if (lower === 'true' || lower === 'false') return JSON.parse(lower);
  return value;
}

function parseCsvRecords(csv) {
  const records = [];
  let record = '';
  let quoted = false;

  for (let index = 0; index < csv.length; index++) {
    const character = csv[index];
    if (character === '"') {
      if (quoted && csv[index + 1] === '"') {
        record += '""';
        index++;
      } else {
        quoted = !quoted;
        record += character;
      }
      continue;
    }

    if (!quoted && (character === '\n' || character === '\r')) {
      records.push(record);
      record = '';
      if (character === '\r' && csv[index + 1] === '\n') index++;
    } else {
      record += character;
    }
  }

  if (record.length) records.push(record);
  if (quoted) throw CsvFormatError.mismatchedQuotes('CSV data');
  return records;
}

function splitQuotedRecord(record, delimiter) {
  const fields = [];
  let field = '';
  let quoted = false;

  for (let index = 0; index < record.length; index++) {
    const character = record[index];
    if (character === '"') {
      if (quoted && record[index + 1] === '"') {
        field += '"';
        index++;
      } else {
        quoted = !quoted;
      }
    } else if (character === delimiter && !quoted) {
      fields.push(field);
      field = '';
    } else {
      field += character;
    }
  }

  fields.push(field);
  if (quoted) throw CsvFormatError.mismatchedQuotes('row');
  return fields;
}

class CsvToJson extends Configurable {
  validateInputConfig(config) {
    if (!config.isSupportQuotedField) return;
    if ((config.delimiter || ',') === '"') {
      throw ConfigurationError.quotedFieldConflict('fieldDelimiter', '"');
    }
    if (config.parseSubArraySeparator === '"') {
      throw ConfigurationError.quotedFieldConflict('parseSubArraySeparator', '"');
    }
    if (config.parseSubArrayDelimiter === '"') {
      throw ConfigurationError.quotedFieldConflict('parseSubArrayDelimiter', '"');
    }
  }

  getFields(record, config, delimiter) {
    return config.isSupportQuotedField
      ? splitQuotedRecord(record, delimiter)
      : record.split(delimiter);
  }

  buildJsonSubArray(value, config) {
    const start = value.indexOf(config.parseSubArrayDelimiter) + 1;
    const end = value.lastIndexOf(config.parseSubArrayDelimiter);
    const values = value.substring(start, end).trim().split(config.parseSubArraySeparator);
    return config.printValueFormatByType ? values.map(formatValue) : values;
  }

  isParseSubArray(value, config) {
    const delimiter = config.parseSubArrayDelimiter;
    return Boolean(
      delimiter &&
      value &&
      value.indexOf(delimiter) === 0 &&
      value.lastIndexOf(delimiter) === value.length - 1,
    );
  }

  buildJsonResult(headers, fields, config) {
    const result = {};
    const ignored = new Set(config.indexesToIgnore);
    for (let index = 0; index < headers.length; index++) {
      if (ignored.has(index)) continue;
      const rawHeader = headers[index];
      const header = config.isTrimHeaderFieldWhiteSpace
        ? rawHeader.replace(/\s/g, '')
        : rawHeader.trim();
      let value = fields[index];
      if (this.isParseSubArray(value, config)) value = this.buildJsonSubArray(value, config);
      if (config.printValueFormatByType && !Array.isArray(value)) value = formatValue(value);
      result[header] = value;
    }
    return result;
  }

  csvToJsonWithConfig(csv, config) {
    this.validateInputConfig(config);
    const records = parseCsvRecords(String(csv));
    const delimiter = config.delimiter || ',';
    let headerIndex = config.indexHeaderValue != null && !isNaN(config.indexHeaderValue)
      ? Number(config.indexHeaderValue)
      : 0;
    let headers;

    while (headerIndex < records.length) {
      headers = this.getFields(records[headerIndex], config, delimiter);
      if (hasContent(headers)) break;
      headerIndex++;
    }
    if (!headers) throw CsvFormatError.missingHeader();

    const output = [];
    for (let index = headerIndex + 1; index < records.length; index++) {
      const fields = this.getFields(records[index], config, delimiter);
      if (!hasContent(fields)) continue;
      let row = this.buildJsonResult(headers, fields, config);
      if (config.rowMapper) row = config.rowMapper(row, index - headerIndex - 1);
      if (row !== null) output.push(row);
    }
    return output;
  }

  csvToJson(csv) {
    return this.csvToJsonWithConfig(csv, this.getParserConfig());
  }

  csvStringToJson(csv) {
    return this.csvToJson(csv);
  }

  csvStringToJsonStringified(csv) {
    const json = JSON.stringify(this.csvStringToJson(csv), undefined, 2);
    try {
      JSON.parse(json);
    } catch (error) {
      throw new JsonValidationError(csv, error);
    }
    return json;
  }

  getJsonFromCsv(filePath) {
    const config = this.getParserConfig();
    try {
      let content;
      if (config.encoding === 'base64' || config.encoding === 'hex') {
        content = Buffer.from(fs.readFileSync(filePath, 'utf8'), config.encoding).toString('utf8');
      } else {
        content = fs.readFileSync(filePath, config.encoding || 'utf8').toString();
      }
      return this.csvToJsonWithConfig(content, config);
    } catch (error) {
      if (error instanceof CsvParsingError) throw error;
      throw new FileOperationError('read', filePath, error);
    }
  }

  getJsonFromCsvStringified(filePath) {
    return JSON.stringify(this.getJsonFromCsv(filePath), undefined, 2);
  }

  generateJsonFileFromCsv(inputFileName, outputFileName) {
    try {
      fs.writeFileSync(outputFileName, this.getJsonFromCsvStringified(inputFileName), 'utf8');
    } catch (error) {
      if (error instanceof CsvParsingError) throw error;
      throw new FileOperationError('write', outputFileName, error);
    }
  }
}

class CsvToJsonAsync extends Configurable {
  constructor(syncParser) {
    super();
    this.csvToJson = syncParser;
  }

  async getJsonFromCsvAsync(inputFileNameOrCsv, options = {}) {
    if (inputFileNameOrCsv == null) {
      throw new InputValidationError(
        'inputFileNameOrCsv',
        'string (file path) or CSV string content',
        typeof inputFileNameOrCsv,
        'Either provide a valid file path or CSV content as a string.',
      );
    }
    const config = this.getParserConfig();
    if (options.raw) return inputFileNameOrCsv === '' ? [] : this.csvToJson.csvToJsonWithConfig(inputFileNameOrCsv, config);
    try {
      let content = await fs.promises.readFile(inputFileNameOrCsv, config.encoding || 'utf8');
      if (config.encoding === 'base64' || config.encoding === 'hex') {
        content = Buffer.from(content.toString(), config.encoding).toString('utf8');
      }
      return this.csvToJson.csvToJsonWithConfig(content.toString(), config);
    } catch (error) {
      if (error instanceof CsvParsingError) throw error;
      throw new FileOperationError('read', inputFileNameOrCsv, error);
    }
  }

  csvStringToJsonAsync(csv, options = { raw: true }) {
    return this.getJsonFromCsvAsync(csv, options);
  }

  async csvStringToJsonStringifiedAsync(csv) {
    return JSON.stringify(await this.csvStringToJsonAsync(csv), undefined, 2);
  }

  async generateJsonFileFromCsv(inputFileName, outputFileName) {
    const json = JSON.stringify(await this.getJsonFromCsvAsync(inputFileName), undefined, 2);
    try {
      await fs.promises.writeFile(outputFileName, json, 'utf8');
    } catch (error) {
      throw new FileOperationError('write', outputFileName, error);
    }
  }

  async getJsonFromStreamAsync(stream) {
    if (!stream || typeof stream.pipe !== 'function') {
      throw new InputValidationError('stream', 'Readable stream', typeof stream, 'Provide a valid Node.js Readable stream.');
    }
    let csv = '';
    for await (const chunk of stream) csv += chunk.toString();
    return this.csvToJson.csvToJsonWithConfig(csv, this.getParserConfig());
  }

  getJsonFromFileStreamingAsync(filePath) {
    if (!filePath || typeof filePath !== 'string') {
      throw new InputValidationError('filePath', 'string (file path)', typeof filePath, 'Provide a valid file path as a string.');
    }
    const config = this.getParserConfig();
    const encoding = typeof config.encoding === 'string' ? config.encoding : 'utf8';
    return this.getJsonFromStreamAsync(fs.createReadStream(filePath, { encoding }));
  }
}

class BrowserApi extends Configurable {
  constructor(syncParser) {
    super();
    this.csvToJsonParser = syncParser;
  }

  _parseCsvText(csv) {
    return this.csvToJsonParser.csvToJsonWithConfig(csv, this.getParserConfig());
  }

  csvStringToJson(csv) {
    if (csv == null) throw new InputValidationError('csvString', 'string', typeof csv, 'Provide CSV text.');
    return this._parseCsvText(csv);
  }

  csvStringToJsonStringified(csv) {
    return JSON.stringify(this.csvStringToJson(csv), undefined, 2);
  }

  csvStringToJsonAsync(csv) {
    return Promise.resolve().then(() => this.csvStringToJson(csv));
  }

  async csvStringToJsonStringifiedAsync(csv) {
    return JSON.stringify(await this.csvStringToJsonAsync(csv), undefined, 2);
  }

  parseFile(file, onComplete, onError) {
    return new Promise((resolve, reject) => {
      if (typeof FileReader === 'undefined') {
        const error = BrowserApiError.fileReaderNotAvailable();
        onError?.(error);
        reject(error);
        return;
      }
      const reader = new FileReader();
      reader.onerror = () => {
        const error = BrowserApiError.parseFileError(reader.error || new Error('Unknown file read error'));
        onError?.(error);
        reject(error);
      };
      reader.onload = () => {
        try {
          const result = this._parseCsvText(reader.result);
          onComplete?.(result);
          resolve(result);
        } catch (error) {
          const wrapped = BrowserApiError.parseFileError(error);
          onError?.(wrapped);
          reject(wrapped);
        }
      };
      reader.readAsText(file);
    });
  }
}

const csvToJson = new CsvToJson();
const csvToJsonAsync = new CsvToJsonAsync(csvToJson);
const browser = new BrowserApi(csvToJson);
const clients = [csvToJson, csvToJsonAsync, browser];

function configure(method, ...args) {
  for (const client of clients) client[method](...args);
  return exports;
}

exports.formatValueByType = (enabled = true) => configure('formatValueByType', enabled);
exports.supportQuotedField = (enabled = false) => configure('supportQuotedField', enabled);
exports.fieldDelimiter = delimiter => configure('fieldDelimiter', delimiter);
exports.trimHeaderFieldWhiteSpace = (enabled = false) => configure('trimHeaderFieldWhiteSpace', enabled);
exports.indexHeader = index => configure('indexHeader', index);
exports.parseSubArray = (delimiter, separator) => configure('parseSubArray', delimiter, separator);
exports.ignoreColumnIndexes = indexes => {
  if (!Array.isArray(indexes)) throw new TypeError('indexes must be an array of numbers');
  if (!indexes.every(index => Number.isInteger(index) && index >= 0)) {
    throw new TypeError('All elements in indexes must be valid non-negative numbers (>= 0)');
  }
  return configure('ignoreColumnIndexes', indexes);
};
exports.customEncoding = encoding => configure('encoding', encoding);
exports.utf8Encoding = () => configure('encoding', 'utf8');
exports.ucs2Encoding = () => configure('encoding', 'ucs2');
exports.utf16leEncoding = () => configure('encoding', 'utf16le');
exports.latin1Encoding = () => configure('encoding', 'latin1');
exports.asciiEncoding = () => configure('encoding', 'ascii');
exports.base64Encoding = () => configure('encoding', 'base64');
exports.hexEncoding = () => configure('encoding', 'hex');
exports.mapRows = mapper => configure('mapRows', mapper);

exports.generateJsonFileFromCsv = (inputFileName, outputFileName) => {
  if (!inputFileName) throw new Error('inputFileName is not defined!!!');
  if (!outputFileName) throw new Error('outputFileName is not defined!!!');
  return csvToJson.generateJsonFileFromCsv(inputFileName, outputFileName);
};
exports.getJsonFromCsv = inputFileName => {
  if (!inputFileName) throw new Error('inputFileName is not defined!!!');
  return csvToJson.getJsonFromCsv(inputFileName);
};
exports.getJsonFromCsvAsync = (input, options) => csvToJsonAsync.getJsonFromCsvAsync(input, options);
exports.csvStringToJsonAsync = (csv, options) => csvToJsonAsync.csvStringToJsonAsync(csv, options);
exports.csvStringToJsonStringifiedAsync = csv => csvToJsonAsync.csvStringToJsonStringifiedAsync(csv);
exports.generateJsonFileFromCsvAsync = (input, output) => csvToJsonAsync.generateJsonFileFromCsv(input, output);
exports.getJsonFromStreamAsync = stream => csvToJsonAsync.getJsonFromStreamAsync(stream);
exports.getJsonFromFileStreamingAsync = path => csvToJsonAsync.getJsonFromFileStreamingAsync(path);
exports.csvStringToJson = csv => csvToJson.csvStringToJson(csv);
exports.csvStringToJsonStringified = csv => {
  if (csv === undefined || csv === null) throw new Error('csvString is not defined!!!');
  return csvToJson.csvStringToJsonStringified(csv);
};
exports.browser = browser;
