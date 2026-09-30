'use strict';

const fs = require('fs');
const { promises: fsPromises } = fs;

class CsvParsingError extends Error {
  constructor(message, context = {}) {
    super(message);
    this.name = 'CsvParsingError';
    this.code = 'CSV_PARSING_ERROR';
    this.context = context;
  }

  toString() {
    return `${this.name}: ${this.message}`;
  }

  formatValue(value) {
    return typeof value === 'string' ? value : JSON.stringify(value);
  }
}

class InputValidationError extends CsvParsingError {
  constructor(parameter, expectedType, receivedValue) {
    const receivedType = typeof receivedValue;
    super(
      `Invalid input for ${parameter}. Expected ${expectedType}, received ${receivedType}.`,
      { parameter, expectedType, receivedType },
    );
    this.name = 'InputValidationError';
    this.code = 'INPUT_VALIDATION_ERROR';
  }
}

class ConfigurationError extends CsvParsingError {
  constructor(message, context = {}) {
    super(message, context);
    this.name = 'ConfigurationError';
    this.code = 'CONFIGURATION_ERROR';
  }

  static quotedFieldConflict() {
    return new ConfigurationError(
      'Quoted-field parsing requires a single-character field delimiter.',
    );
  }

  static invalidHeaderIndex(index) {
    return new ConfigurationError(`Invalid header index: ${index}.`, { index });
  }
}

class CsvFormatError extends CsvParsingError {
  constructor(message, context = {}) {
    super(message, context);
    this.name = 'CsvFormatError';
    this.code = 'CSV_FORMAT_ERROR';
  }

  static missingHeader() {
    return new CsvFormatError(
      'CSV parsing error: No header row found.\n' +
        'The CSV file appears to be empty or has no valid header line.',
    );
  }

  static mismatchedQuotes(location) {
    return new CsvFormatError('CSV parsing error: Mismatched quotes.', { location });
  }
}

class FileOperationError extends CsvParsingError {
  constructor(operation, filePath, originalError) {
    super(
      `File operation error: Failed to ${operation} file.\n` +
        `File path: ${filePath}\n` +
        `Reason: ${originalError.message}`,
      { operation, filePath, originalError: originalError.message },
    );
    this.name = 'FileOperationError';
    this.code = 'FILE_OPERATION_ERROR';
    this.originalError = originalError;
  }
}

class JsonValidationError extends CsvParsingError {
  constructor(csvPreview, originalError) {
    super('Unable to convert the CSV result to JSON.', { csvPreview });
    this.name = 'JsonValidationError';
    this.code = 'JSON_VALIDATION_ERROR';
    this.originalError = originalError;
  }
}

class BrowserApiError extends CsvParsingError {
  constructor(message, context = {}) {
    super(message, context);
    this.name = 'BrowserApiError';
    this.code = 'BROWSER_API_ERROR';
  }

  static fileReaderNotAvailable() {
    return new BrowserApiError('The FileReader API is not available.');
  }

  static parseFileError(originalError) {
    return new BrowserApiError('Unable to parse the selected file.', { originalError });
  }

  static streamingNotSupported() {
    return new BrowserApiError('Streaming is not supported in this environment.');
  }
}

class ParserConfig {
  constructor() {
    this.delimiter = undefined;
    this.encoding = undefined;
    this.isSupportQuotedField = undefined;
    this.isTrimHeaderFieldWhiteSpace = undefined;
    this.indexHeaderValue = undefined;
    this.parseSubArrayDelimiter = undefined;
    this.parseSubArraySeparator = undefined;
    this.printValueFormatByType = undefined;
    this.rowMapper = undefined;
    this.indexesToIgnore = [];
  }
}

class Configurable {
  constructor() {
    this.config = new ParserConfig();
  }

  formatValueByType() {
    this.config.printValueFormatByType = true;
    return this;
  }

  supportQuotedField() {
    this.config.isSupportQuotedField = true;
    return this;
  }

  fieldDelimiter(delimiter) {
    if (typeof delimiter !== 'string' || delimiter.length === 0) {
      throw new InputValidationError('delimiter', 'a non-empty string', delimiter);
    }
    this.config.delimiter = delimiter;
    return this;
  }

  trimHeaderFieldWhiteSpace() {
    this.config.isTrimHeaderFieldWhiteSpace = true;
    return this;
  }

  indexHeader(index) {
    if (!Number.isInteger(index) || index < 0) {
      throw ConfigurationError.invalidHeaderIndex(index);
    }
    this.config.indexHeaderValue = index;
    return this;
  }

  parseSubArray(delimiter = '*', separator = ',') {
    this.config.parseSubArrayDelimiter = delimiter;
    this.config.parseSubArraySeparator = separator;
    return this;
  }

  mapRows(rowMapper) {
    if (typeof rowMapper !== 'function') {
      throw new InputValidationError('rowMapper', 'function', rowMapper);
    }
    this.config.rowMapper = rowMapper;
    return this;
  }

  ignoreColumnIndexes(indexes) {
    if (!Array.isArray(indexes)) {
      throw new InputValidationError('indexes', 'array', indexes);
    }
    this.config.indexesToIgnore = indexes;
    return this;
  }

  encoding(encoding) {
    if (typeof encoding !== 'string' || encoding.length === 0) {
      throw new InputValidationError('encoding', 'a non-empty string', encoding);
    }
    this.config.encoding = encoding;
    return this;
  }

  getParserConfig() {
    return this.config;
  }
}

function splitCsvRecords(csvText, supportQuotedFields) {
  if (!supportQuotedFields) {
    return csvText.split(/\r\n|\n|\r/);
  }

  const records = [];
  let record = '';
  let insideQuotes = false;

  for (let index = 0; index < csvText.length; index += 1) {
    const character = csvText[index];
    if (character === '"') {
      if (insideQuotes && csvText[index + 1] === '"') {
        record += '""';
        index += 1;
      } else {
        insideQuotes = !insideQuotes;
        record += character;
      }
    } else if (!insideQuotes && (character === '\n' || character === '\r')) {
      records.push(record);
      record = '';
      if (character === '\r' && csvText[index + 1] === '\n') index += 1;
    } else {
      record += character;
    }
  }

  if (insideQuotes) throw CsvFormatError.mismatchedQuotes(records.length + 1);
  records.push(record);
  return records;
}

function splitCsvFields(record, delimiter, supportQuotedFields) {
  if (!supportQuotedFields) return record.split(delimiter);

  const fields = [];
  let field = '';
  let insideQuotes = false;

  for (let index = 0; index < record.length; index += 1) {
    const character = record[index];
    if (character === '"') {
      if (insideQuotes && record[index + 1] === '"') {
        field += '"';
        index += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (!insideQuotes && record.startsWith(delimiter, index)) {
      fields.push(field);
      field = '';
      index += delimiter.length - 1;
    } else {
      field += character;
    }
  }

  if (insideQuotes) throw CsvFormatError.mismatchedQuotes(record);
  fields.push(field);
  return fields;
}

function formatValueByType(value) {
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value !== '' && !Number.isNaN(Number(value))) return Number(value);
  return value;
}

class CsvToJson extends Configurable {
  csvToJsonWithConfig(csvText, parserConfig) {
    const previousConfig = this.config;
    this.config = parserConfig;
    try {
      return this.csvStringToJson(csvText);
    } finally {
      this.config = previousConfig;
    }
  }

  async generateJsonFileFromCsv(inputPath, outputPath) {
    const json = await this.getJsonFromCsvStringified(inputPath);
    try {
      await fsPromises.writeFile(outputPath, json, this.config.encoding || 'utf8');
    } catch (error) {
      throw new FileOperationError('write', outputPath, error);
    }
  }

  async getJsonFromCsvStringified(filePath) {
    return this.csvStringToJsonStringified(await this.readCsvFile(filePath));
  }

  async getJsonFromCsv(filePath) {
    return this.csvStringToJson(await this.readCsvFile(filePath));
  }

  csvStringToJson(csvText) {
    this.validateInputConfig(csvText);
    const records = splitCsvRecords(csvText, this.config.isSupportQuotedField);
    while (records.length && records[records.length - 1] === '') records.pop();
    return this.parseRecords(records);
  }

  csvStringToJsonStringified(csvText) {
    try {
      return JSON.stringify(this.csvStringToJson(csvText), null, 1);
    } catch (error) {
      if (error instanceof CsvParsingError) throw error;
      throw new JsonValidationError(csvText.slice(0, 100), error);
    }
  }

  csvToJson(csvText) {
    return this.csvStringToJson(csvText);
  }

  parseRecords(records) {
    const headerIndex = this.getIndexHeader();
    if (!records[headerIndex]) throw CsvFormatError.missingHeader();

    const headers = this.getFields(records[headerIndex]).map((header) =>
      this.config.isTrimHeaderFieldWhiteSpace ? header.trim() : header,
    );
    const rows = [];

    for (let index = headerIndex + 1; index < records.length; index += 1) {
      if (records[index] === '') continue;
      const fields = this.getFields(records[index]);
      const row = this.buildJsonResult(headers, fields);
      rows.push(this.config.rowMapper ? this.config.rowMapper(row, index) : row);
    }
    return rows;
  }

  getLineEndingLength(csvText, index) {
    return csvText[index] === '\r' && csvText[index + 1] === '\n' ? 2 : 1;
  }

  getFieldDelimiter() {
    return this.config.delimiter || ',';
  }

  getIndexHeader() {
    return this.config.indexHeaderValue ?? 0;
  }

  getFields(record) {
    return this.split(record);
  }

  buildJsonResult(headers, fields) {
    const result = {};
    const ignoredIndexes = new Set(this.config.indexesToIgnore);
    headers.forEach((header, index) => {
      if (ignoredIndexes.has(index)) return;
      let value = fields[index] ?? '';
      if (this.isParseSubArray(value)) value = this.buildJsonSubArray(value);
      else if (this.config.printValueFormatByType) value = formatValueByType(value);
      result[header] = value;
    });
    return result;
  }

  buildJsonSubArray(value) {
    const marker = this.config.parseSubArrayDelimiter;
    const content = value.slice(marker.length, -marker.length);
    return content.split(this.config.parseSubArraySeparator);
  }

  isParseSubArray(value) {
    const marker = this.config.parseSubArrayDelimiter;
    return Boolean(marker && value.startsWith(marker) && value.endsWith(marker));
  }

  validateInputConfig(csvText) {
    if (typeof csvText !== 'string') {
      throw new InputValidationError('csvText', 'string', csvText);
    }
    if (this.config.isSupportQuotedField && this.getFieldDelimiter().length !== 1) {
      throw ConfigurationError.quotedFieldConflict();
    }
  }

  hasQuotes(record) {
    return record.includes('"');
  }

  split(record) {
    return splitCsvFields(
      record,
      this.getFieldDelimiter(),
      this.config.isSupportQuotedField,
    );
  }

  isEscapedQuote(record, index) {
    return record[index] === '"' && record[index + 1] === '"';
  }

  isEmptyQuotedField(value) {
    return value === '""';
  }

  async readCsvFile(filePath) {
    try {
      return await fsPromises.readFile(filePath, this.config.encoding || 'utf8');
    } catch (error) {
      throw new FileOperationError('read', filePath, error);
    }
  }
}

class StreamProcessor {
  constructor(parserConfig) {
    this.parser = new CsvToJson();
    this.parser.config = parserConfig;
    this.chunks = [];
  }

  processChunk(chunk) {
    this.chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  processStreamWithCallbacks(stream, onComplete, onError) {
    this.processStream(stream).then(onComplete, onError);
  }

  _sendPendingChunks() {}

  _sendRemainingChunks() {}

  async processStream(stream) {
    for await (const chunk of stream) this.processChunk(chunk);
    return this.finalizeProcessing();
  }

  finalizeProcessing() {
    return this.parser.csvStringToJson(
      Buffer.concat(this.chunks).toString(this.parser.config.encoding || 'utf8'),
    );
  }

  getResult() {
    return this.finalizeProcessing();
  }
}

class CsvToJsonAsync extends Configurable {
  async generateJsonFileFromCsv(inputPath, outputPath) {
    const parser = new CsvToJson();
    parser.config = this.config;
    return parser.generateJsonFileFromCsv(inputPath, outputPath);
  }

  async getJsonFromCsvStringified(filePath) {
    const parser = new CsvToJson();
    parser.config = this.config;
    return parser.getJsonFromCsvStringified(filePath);
  }

  async getJsonFromCsvAsync(filePath) {
    const parser = new CsvToJson();
    parser.config = this.config;
    return parser.getJsonFromCsv(filePath);
  }

  async csvStringToJsonAsync(csvText) {
    const parser = new CsvToJson();
    parser.config = this.config;
    return parser.csvStringToJson(csvText);
  }

  async getJsonFromStreamAsync(stream) {
    this._validateStream(stream);
    return new StreamProcessor(this.config).processStream(stream);
  }

  _validateStream(stream) {
    if (!stream || typeof stream[Symbol.asyncIterator] !== 'function') {
      throw new InputValidationError('stream', 'readable stream', stream);
    }
  }

  async getJsonFromFileStreamingAsync(filePath) {
    const stream = fs.createReadStream(filePath, {
      encoding: this.config.encoding || 'utf8',
    });
    try {
      return await this.getJsonFromStreamAsync(stream);
    } catch (error) {
      if (error instanceof CsvParsingError) throw error;
      throw new FileOperationError('read', filePath, error);
    }
  }
}

module.exports = new CsvToJsonAsync();
