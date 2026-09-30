'use strict';

const fs = require('node:fs');
const { Readable } = require('node:stream');

class InputValidationError extends Error {
  constructor(parameter, expected, received) {
    super(
      `Invalid input: Parameter '${parameter}' is required.\n` +
      `Expected: ${expected}\nReceived: ${received}\n` +
      `Provide a valid Node.js Readable stream.`,
    );
    this.name = 'InputValidationError';
  }
}

class ConfigurationError extends Error {
  constructor(message) {
    super(`Invalid configuration: ${message}`);
    this.name = 'ConfigurationError';
  }
}

class FileOperationError extends Error {
  constructor(action, filePath, cause) {
    super(
      `File operation error: Failed to ${action} file.\n` +
      `File path: ${filePath}\nReason: ${cause.message}\n\n` +
      `Solutions:\n  1. Verify the file path is correct: ${filePath}\n` +
      '  2. Check file permissions (read access for input, write access for output files)\n' +
      '  3. Ensure the directory exists and is writable for output files\n' +
      '  4. Verify the file is not in use by another process',
    );
    this.name = 'FileOperationError';
    this.cause = cause;
  }
}

function valueByType(value) {
  const trimmed = value.trim();
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if (trimmed !== '' && Number.isFinite(Number(trimmed))) return Number(trimmed);
  return value;
}

class CsvParser {
  constructor(config = {}) {
    this.config = config;
    this.CsvToJson = CsvParser;
  }

  csvToJsonWithConfig(csv, config) {
    const previous = this.config;
    this.config = config;
    try {
      const result = this.csvToJson(csv);
      return config.rowMapper ? result.map(config.rowMapper) : result;
    } finally {
      this.config = previous;
    }
  }

  generateJsonFileFromCsv(inputPath, outputPath) {
    fs.writeFileSync(outputPath, this.getJsonFromCsvStringified(inputPath));
  }

  getJsonFromCsvStringified(filePath) {
    return JSON.stringify(this.getJsonFromCsv(filePath), null, 1);
  }

  getJsonFromCsv(filePath) {
    try {
      return this.csvStringToJson(fs.readFileSync(filePath, this.config.encoding || 'utf8'));
    } catch (error) {
      if (error instanceof FileOperationError) throw error;
      throw new FileOperationError('read', filePath, error);
    }
  }

  csvStringToJson(csv) { return this.csvToJson(csv); }
  csvStringToJsonStringified(csv) { return JSON.stringify(this.csvToJson(csv), null, 1); }

  csvToJson(csv) {
    if (csv == null || String(csv).length === 0) return [];
    const records = this.parseRecords(String(csv));
    if (records.length < 2) return [];

    const headerIndex = this.getIndexHeader();
    if (!records[headerIndex]) return [];
    let headers = this.getFields(records[headerIndex]);
    if (this.config.isTrimHeaderFieldWhiteSpace) headers = headers.map((field) => field.trim());
    const ignored = new Set(this.config.indexesToIgnore || []);
    const rows = [];

    for (const record of records.slice(headerIndex + 1)) {
      if (record === '') continue;
      const fields = this.getFields(record);
      const row = {};
      for (let index = 0; index < headers.length && index < fields.length; index++) {
        if (ignored.has(index)) continue;
        let value = fields[index];
        if (this.isParseSubArray(value)) value = this.buildJsonSubArray(value);
        else if (this.config.printValueFormatByType) value = valueByType(value);
        row[headers[index]] = value;
      }
      rows.push(row);
    }
    return this.config.rowMapper ? rows.map(this.config.rowMapper) : rows;
  }

  parseRecords(csv) {
    const records = [];
    let record = '';
    let quoted = false;
    for (let index = 0; index < csv.length; index++) {
      const char = csv[index];
      if (char === '"' && this.config.isSupportQuotedField) {
        if (quoted && csv[index + 1] === '"') {
          record += '""';
          index++;
        } else {
          quoted = !quoted;
          record += char;
        }
      } else if (!quoted && (char === '\n' || char === '\r')) {
        records.push(record);
        record = '';
        if (char === '\r' && csv[index + 1] === '\n') index++;
      } else record += char;
    }
    if (record !== '' || records.length === 0) records.push(record);
    return records;
  }

  getLineEndingLength(text, index) {
    return text.slice(index, index + 2) === '\r\n' ? 2 : /[\r\n]/.test(text[index]) ? 1 : 0;
  }

  getFieldDelimiter() { return this.config.delimiter || ','; }
  getIndexHeader() { return this.config.indexHeaderValue || 0; }
  getFields(record) { return this.split(record); }

  buildJsonResult(headers, fields) {
    return Object.fromEntries(headers.map((header, index) => [header, fields[index]]));
  }

  buildJsonSubArray(value) {
    const marker = this.config.parseSubArrayDelimiter;
    return value.slice(marker.length, -marker.length).split(this.config.parseSubArraySeparator || ',');
  }

  isParseSubArray(value) {
    const marker = this.config.parseSubArrayDelimiter;
    return Boolean(marker && value.startsWith(marker) && value.endsWith(marker));
  }

  validateInputConfig() { return true; }
  hasQuotes(value) { return value.includes('"'); }

  split(record) {
    const delimiter = this.getFieldDelimiter();
    if (!this.config.isSupportQuotedField) return record.split(delimiter);
    const fields = [];
    let field = '';
    let quoted = false;
    for (let index = 0; index < record.length; index++) {
      const char = record[index];
      if (char === '"') {
        if (quoted && record[index + 1] === '"') {
          field += '"';
          index++;
        } else quoted = !quoted;
      } else if (!quoted && record.startsWith(delimiter, index)) {
        fields.push(field);
        field = '';
        index += delimiter.length - 1;
      } else field += char;
    }
    fields.push(field);
    return fields;
  }

  isEscapedQuote(text, index) { return text[index] === '"' && text[index + 1] === '"'; }
  isEmptyQuotedField(text, start, end) { return text.slice(start, end) === '""'; }
}

class Configurable {
  constructor() {
    this.config = {};
    this.csvToJson = new CsvParser(this.config);
  }

  formatValueByType(enabled = true) { this.config.printValueFormatByType = enabled; return this; }
  supportQuotedField(enabled = false) { this.config.isSupportQuotedField = enabled; return this; }
  fieldDelimiter(delimiter) { this.config.delimiter = delimiter; return this; }
  trimHeaderFieldWhiteSpace(enabled = false) { this.config.isTrimHeaderFieldWhiteSpace = enabled; return this; }

  indexHeader(index) {
    if (typeof index !== 'number' && typeof index !== 'boolean') {
      throw new ConfigurationError('indexHeader() expects a numeric value.');
    }
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

  getParserConfig() {
    return {
      delimiter: this.config.delimiter,
      encoding: this.config.encoding,
      isSupportQuotedField: this.config.isSupportQuotedField,
      isTrimHeaderFieldWhiteSpace: this.config.isTrimHeaderFieldWhiteSpace,
      indexHeaderValue: this.config.indexHeaderValue,
      parseSubArrayDelimiter: this.config.parseSubArrayDelimiter,
      parseSubArraySeparator: this.config.parseSubArraySeparator,
      printValueFormatByType: this.config.printValueFormatByType,
      rowMapper: this.config.rowMapper,
      indexesToIgnore: this.config.indexesToIgnore || [],
    };
  }
}

class CsvToJsonAsync extends Configurable {
  async generateJsonFileFromCsv(inputPath, outputPath) {
    try {
      await fs.promises.writeFile(outputPath, await this.getJsonFromCsvStringified(inputPath));
    } catch (error) {
      if (error instanceof FileOperationError) throw error;
      throw new FileOperationError('write', outputPath, error);
    }
  }

  async getJsonFromCsvStringified(filePath) {
    return JSON.stringify(await this.getJsonFromCsvAsync(filePath), null, 1);
  }

  async getJsonFromCsvAsync(filePath) {
    try {
      return await this.csvStringToJsonAsync(await fs.promises.readFile(filePath, this.config.encoding || 'utf8'));
    } catch (error) {
      if (error instanceof FileOperationError) throw error;
      throw new FileOperationError('read', filePath, error);
    }
  }

  async csvStringToJsonAsync(csv) { return this.csvToJson.csvToJson(String(csv)); }

  async getJsonFromStreamAsync(stream) {
    this._validateStream(stream);
    let csv = '';
    for await (const chunk of stream) csv += chunk.toString(this.config.encoding || 'utf8');
    return this.csvStringToJsonAsync(csv);
  }

  _validateStream(stream) {
    if (!(stream instanceof Readable)) {
      throw new InputValidationError('stream', 'Readable stream', typeof stream);
    }
  }

  async getJsonFromFileStreamingAsync(filePath) {
    return this.getJsonFromStreamAsync(fs.createReadStream(filePath, { encoding: this.config.encoding || 'utf8' }));
  }
}

module.exports = new CsvToJsonAsync();
