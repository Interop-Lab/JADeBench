'use strict';

const fs = require('fs');

class CsvParsingError extends Error {
  constructor(message, code, context = {}) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.context = context;
    Error.captureStackTrace?.(this, this.constructor);
  }
}
class InputValidationError extends CsvParsingError {
  constructor(parameter, expectedType, receivedType) {
    super(`Invalid input: Parameter '${parameter}' is required.\nExpected: ${expectedType}\nReceived: ${receivedType}`, 'INPUT_VALIDATION_ERROR', { parameter, expectedType, receivedType });
  }
}
class ConfigurationError extends CsvParsingError {
  constructor(message, context = {}) { super(message, 'CONFIGURATION_ERROR', context); }
}
class CsvFormatError extends CsvParsingError {
  constructor(message, context = {}) { super(message, 'CSV_FORMAT_ERROR', context); }
}
class FileOperationError extends CsvParsingError {
  constructor(operation, filePath, originalError) {
    super(`File operation error: Failed to ${operation} file.\nFile path: ${filePath}\nReason: ${originalError.message}`, 'FILE_OPERATION_ERROR', { operation, filePath, originalError });
  }
}
class JsonValidationError extends CsvParsingError {
  constructor(originalError, csvPreview = 'N/A') {
    super(`JSON validation error: ${originalError.message}`, 'JSON_VALIDATION_ERROR', { originalError, csvPreview: csvPreview.substring(0, 200) });
  }
}

const DEFAULT_CONFIG = Object.freeze({
  delimiter: ',',
  encoding: 'utf8',
  isSupportQuotedField: false,
  isTrimHeaderFieldWhiteSpace: false,
  indexHeaderValue: 0,
  parseSubArrayDelimiter: '*',
  parseSubArraySeparator: ',',
  printValueFormatByType: false,
  rowMapper: undefined,
  indexesToIgnore: [],
});

function trimPropertyName(value) { return String(value).replace(/\s/g, ''); }
function isEmpty(value) { return value === null || value === undefined || value === ''; }
function hasLeadingZero(value) {
  const text = String(value).replace(/^-/, '');
  return text.length > 1 && text.startsWith('0');
}
function getValueFormatByType(value) {
  if (isEmpty(value)) return value;
  const text = String(value);
  const lower = text.toLowerCase();
  if (lower === 'true' || lower === 'false') return JSON.parse(lower);
  if (/^-?\d+$/.test(text) && !hasLeadingZero(text)) {
    const integer = Number(text);
    if (Number.isSafeInteger(integer)) return integer;
  }
  if (/^-?\d*\.\d+$/.test(text)) {
    const number = Number(text);
    if (Number.isFinite(number)) return number;
  }
  return value;
}
function validateJson(value, csvPreview) {
  try { JSON.parse(JSON.stringify(value)); }
  catch (error) { throw new JsonValidationError(error, csvPreview); }
}

const fileUtils = {
  async readFileAsync(filePath, encoding = 'utf8') {
    try {
      const content = await fs.promises.readFile(filePath, encoding);
      return Buffer.isBuffer(content) ? content.toString('utf8') : content;
    } catch (error) { throw new FileOperationError('read', filePath, error); }
  },
  async writeFileAsync(filePath, content) {
    try { await fs.promises.writeFile(filePath, content, 'utf8'); }
    catch (error) { throw new FileOperationError('write', filePath, error); }
  },
};

function splitQuotedRecord(record, delimiter) {
  const fields = [];
  let field = '';
  let insideQuotes = false;
  for (let index = 0; index < record.length; index += 1) {
    const character = record[index];
    if (character === '"') {
      if (insideQuotes && record[index + 1] === '"') { field += '"'; index += 1; }
      else insideQuotes = !insideQuotes;
    } else if (!insideQuotes && record.startsWith(delimiter, index)) {
      fields.push(field); field = ''; index += delimiter.length - 1;
    } else field += character;
  }
  if (insideQuotes) throw new CsvFormatError('CSV parsing error: Mismatched quotes detected in CSV.');
  fields.push(field);
  return fields;
}

function splitRecords(csv) {
  const records = [];
  let record = '';
  let insideQuotes = false;
  for (let index = 0; index < csv.length; index += 1) {
    const character = csv[index];
    if (character === '"') {
      record += character;
      if (insideQuotes && csv[index + 1] === '"') record += csv[++index];
      else insideQuotes = !insideQuotes;
    } else if (!insideQuotes && (character === '\n' || character === '\r')) {
      records.push(record); record = '';
      if (character === '\r' && csv[index + 1] === '\n') index += 1;
    } else record += character;
  }
  if (insideQuotes) throw new CsvFormatError('CSV parsing error: Mismatched quotes detected in CSV.');
  if (record.length) records.push(record);
  return records;
}

function parseSubArray(value, config) {
  const marker = config.parseSubArrayDelimiter;
  if (!marker || !value.startsWith(marker) || !value.endsWith(marker)) return null;
  return value.slice(marker.length, -marker.length).split(config.parseSubArraySeparator)
    .map(item => config.printValueFormatByType ? getValueFormatByType(item.trim()) : item.trim());
}

function csvToJsonWithConfig(csv, config) {
  if (typeof csv !== 'string') throw new InputValidationError('csv', 'CSV string content', typeof csv);
  if (config.isSupportQuotedField && [config.delimiter, config.parseSubArrayDelimiter, config.parseSubArraySeparator].includes('"')) {
    throw new ConfigurationError('The quote character cannot be used as a delimiter when quoted-field support is active.');
  }
  const records = splitRecords(csv).filter(record => record.trim().length);
  const headerIndex = Number(config.indexHeaderValue);
  if (!Number.isInteger(headerIndex)) throw new ConfigurationError(`Invalid header index: ${config.indexHeaderValue}`);
  if (!records[headerIndex]) throw new CsvFormatError('CSV parsing error: No header row found.');
  const split = record => config.isSupportQuotedField ? splitQuotedRecord(record, config.delimiter) : record.split(config.delimiter);
  const headers = split(records[headerIndex]);
  const ignored = new Set(config.indexesToIgnore);
  const result = [];
  for (const record of records.slice(headerIndex + 1)) {
    const fields = split(record);
    if (!fields.some(field => field !== '')) continue;
    const row = {};
    headers.forEach((header, index) => {
      if (ignored.has(index)) return;
      const key = trimPropertyName(config.isTrimHeaderFieldWhiteSpace ? header.trim() : header);
      const rawValue = fields[index] ?? '';
      row[key] = parseSubArray(rawValue, config) ?? (config.printValueFormatByType ? getValueFormatByType(rawValue) : rawValue);
    });
    result.push(config.rowMapper ? config.rowMapper(row, result.length) : row);
  }
  validateJson(result, csv);
  return result;
}

class Configurable {
  constructor() { this.config = { ...DEFAULT_CONFIG, indexesToIgnore: [] }; }
  formatValueByType(enabled = true) { this.config.printValueFormatByType = enabled; return this; }
  supportQuotedField(enabled = true) { this.config.isSupportQuotedField = enabled; return this; }
  fieldDelimiter(delimiter) { this.config.delimiter = delimiter; return this; }
  trimHeaderFieldWhiteSpace(enabled = true) { this.config.isTrimHeaderFieldWhiteSpace = enabled; return this; }
  indexHeader(index) {
    if (Number.isNaN(Number(index))) throw new ConfigurationError(`Invalid header index: ${index}`);
    this.config.indexHeaderValue = Number(index); return this;
  }
  parseSubArray(delimiter = '*', separator = ',') {
    this.config.parseSubArrayDelimiter = delimiter; this.config.parseSubArraySeparator = separator; return this;
  }
  mapRows(mapperFn) {
    if (typeof mapperFn !== 'function') throw new TypeError('mapperFn must be a function');
    this.config.rowMapper = mapperFn; return this;
  }
  ignoreColumnIndexes(indexes) {
    this.config.indexesToIgnore = Array.isArray(indexes) ? indexes : [...arguments]; return this;
  }
  encoding(encoding) { this.config.encoding = encoding; return this; }
  getParserConfig() { return { ...this.config, indexesToIgnore: [...this.config.indexesToIgnore] }; }
}

class StreamProcessor {
  constructor(config) { this.config = config; }
  async processStream(stream) {
    let csv = '';
    for await (const chunk of stream) csv += Buffer.isBuffer(chunk) ? chunk.toString(this.config.encoding) : String(chunk);
    return csvToJsonWithConfig(csv, this.config);
  }
}

class CsvToJsonAsync extends Configurable {
  async generateJsonFileFromCsv(inputFileNameOrCsv, outputFileName) {
    await fileUtils.writeFileAsync(outputFileName, await this.getJsonFromCsvStringified(inputFileNameOrCsv));
  }
  async getJsonFromCsvStringified(inputFileNameOrCsv) {
    return JSON.stringify(await this.getJsonFromCsvAsync(inputFileNameOrCsv));
  }
  async getJsonFromCsvAsync(inputFileNameOrCsv) {
    if (typeof inputFileNameOrCsv !== 'string' || !inputFileNameOrCsv.length) {
      throw new InputValidationError('inputFileNameOrCsv', 'string (file path) or CSV string content', typeof inputFileNameOrCsv);
    }
    const config = this.getParserConfig();
    if (config.raw) return csvToJsonWithConfig(inputFileNameOrCsv, config);
    try {
      return csvToJsonWithConfig(await fileUtils.readFileAsync(inputFileNameOrCsv, config.encoding), config);
    } catch (error) {
      if (error instanceof FileOperationError && /[\r\n,]/.test(inputFileNameOrCsv)) return csvToJsonWithConfig(inputFileNameOrCsv, config);
      throw error;
    }
  }
  async csvStringToJsonAsync(csv) {
    const previousRaw = this.config.raw;
    this.config.raw = true;
    try { return await this.getJsonFromCsvAsync(csv); }
    finally { this.config.raw = previousRaw; }
  }
  async getJsonFromStreamAsync(stream) {
    this._validateStream(stream);
    return new StreamProcessor(this.getParserConfig()).processStream(stream);
  }
  _validateStream(stream) {
    if (!stream || typeof stream.pipe !== 'function') {
      throw new InputValidationError('stream', 'Readable stream', 'Provide a valid Node.js Readable stream.');
    }
  }
  async getJsonFromFileStreamingAsync(filePath) {
    if (typeof filePath !== 'string' || !filePath.length) throw new InputValidationError('filePath', 'string (file path)', typeof filePath);
    return this.getJsonFromStreamAsync(fs.createReadStream(filePath, { encoding: this.config.encoding }));
  }
}

module.exports = new CsvToJsonAsync();
