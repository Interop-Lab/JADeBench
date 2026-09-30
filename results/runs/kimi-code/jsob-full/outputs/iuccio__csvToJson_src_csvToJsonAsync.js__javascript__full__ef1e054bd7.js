'use strict';

const fs = require('fs');
class CsvToJsonError extends Error {
  constructor(message, code, context = {}) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.context = context;
    Error.captureStackTrace(this, this.constructor);
  }

  toString() {
    let result = `${this.name}: ${this.message}`;
    if (Object.keys(this.context).length) {
      result += '\nDetails:';
      for (const [key, value] of Object.entries(this.context)) {
        result += `\n  ${key}: ${value}`;
      }
    }
    return result;
  }
}

class InputValidationError extends CsvToJsonError {
  constructor(parameter, expectedType, receivedType, solution) {
    super(
      `Invalid input: Parameter '${parameter}' is required.\n` +
        `Expected: ${expectedType}\nReceived: ${receivedType}\n${solution}`,
      'INPUT_VALIDATION_ERROR',
      { parameter, expectedType, receivedType }
    );
  }
}

class ConfigurationError extends CsvToJsonError {
  constructor(parameterName, value) {
    super(
      `Invalid configuration: ${parameterName}() expects a numeric value.\n` +
        `Received: ${typeof value} (${value})\n\n` +
        'Solutions:\n' +
        `  1. Ensure ${parameterName}() receives a number: ${parameterName}(0), ${parameterName}(1), etc.\n` +
        '  2. Headers are typically found on row 0 (first line)\n' +
        `  3. Use ${parameterName}(2) if headers are on the 3rd line`,
      'CONFIGURATION_ERROR',
      { parameterName, value, type: typeof value }
    );
  }
}

class CsvFormatError extends CsvToJsonError {
  constructor(message, context = {}) {
    super(`CSV parsing error: ${message}`, 'CSV_FORMAT_ERROR', context);
  }

  static missingHeader() {
    return new CsvFormatError(
      'No header row found.\n' +
        'The CSV file appears to be empty or has no valid header line.\n\n' +
        'Solutions:\n' +
        '  1. Ensure your CSV file contains at least one row (header row)\n' +
        '  2. Verify the file is not empty or contains only whitespace\n' +
        '  3. Check if you need to use indexHeader(n) to specify a non-standard header row\n' +
        '  4. Refer to RFC 4180 for proper CSV format: https://tools.ietf.org/html/rfc4180'
    );
  }
}

class FileOperationError extends CsvToJsonError {
  constructor(operation, filePath, originalError) {
    const reason = originalError instanceof Error ? originalError.message : String(originalError);
    super(
      `File operation error: Failed to ${operation} file.\n` +
        `File path: ${filePath}\nReason: ${reason}\n\n` +
        'Solutions:\n' +
        `  1. Verify the file path is correct: ${filePath}\n` +
        '  2. Check file permissions (read access for input, write access for output)\n' +
        '  3. Ensure the directory exists and is writable for output files\n' +
        '  4. Verify the file is not in use by another process',
      'FILE_OPERATION_ERROR',
      { operation, filePath, originalError: reason }
    );
  }
}

function formatPrimitive(value) {
  const lowerCaseValue = value.toLowerCase();
  if (lowerCaseValue === 'true') return true;
  if (lowerCaseValue === 'false') return false;
  if (/^-?(?:0|[1-9]\d*)(?:\.\d+)?$|^-?\.\d+$/.test(value) && !/^[-+]?0\d+/.test(value)) {
    return Number(value);
  }
  return value;
}

function parseCsvRecords(input, delimiter, supportQuotedFields) {
  const text = typeof input === 'string' ? input.replace(/^\uFEFF/, '') : '';
  const records = [];
  let record = [];
  let field = '';
  let quoted = false;
  let literalQuoteOpen = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];

    if (character === '"') {
      if (supportQuotedFields) {
        if (quoted && text[index + 1] === '"') {
          field += '"';
          index += 1;
        } else if (quoted || field.length === 0) {
          quoted = !quoted;
        } else {
          field += character;
        }
        continue;
      }
      literalQuoteOpen = !literalQuoteOpen;
    }

    if (!quoted && character === delimiter) {
      record.push(field);
      field = '';
      continue;
    }

    if (!quoted && (character === '\n' || character === '\r')) {
      if (!supportQuotedFields && literalQuoteOpen) {
        field += character;
        continue;
      }
      if (character === '\r' && text[index + 1] === '\n') index += 1;
      record.push(field);
      records.push(record);
      record = [];
      field = '';
      continue;
    }

    field += character;
  }

  if (quoted) throw new CsvFormatError('Unclosed quoted field.');
  if (!supportQuotedFields && literalQuoteOpen) {
    throw new CsvFormatError(
      'Mismatched quotes detected in CSV.\n' +
        'A quoted field was not properly closed with a matching quote character.\n\n' +
        'RFC 4180 rules for quoted fields:\n' +
        '  • Fields containing delimiters or quotes MUST be enclosed in double quotes\n' +
        '  • To include a quote within a quoted field, use two consecutive quotes: ""\n' +
        '  • Example: "Smith, John" (name contains comma)\n' +
        '  • Example: "He said ""Hello""" (text contains quotes)\n\n' +
        'Solutions:\n' +
        '  1. Review your CSV for properly paired quote characters\n' +
        '  2. Use double quotes ("") to escape quotes within quoted fields\n' +
        '  3. Ensure all commas within field values are inside quotes\n' +
        "  4. Enable supportQuotedField(true) if you're using quoted fields"
    );
  }
  if (field.length || record.length) {
    record.push(field);
    records.push(record);
  }
  return records;
}

class CsvParser {
  constructor(config) {
    this.config = config;
    this.CsvToJson = CsvParser;
  }

  csvToJsonWithConfig(csv, config) {
    return this.csvToJson(csv, config);
  }

  generateJsonFileFromCsv(inputFileName, outputFileName) {
    const json = this.getJsonFromCsvStringified(inputFileName);
    try {
      fs.writeFileSync(outputFileName, json);
    } catch (error) {
      throw new FileOperationError('write', outputFileName, error);
    }
  }

  getJsonFromCsvStringified(inputFileName) {
    return JSON.stringify(this.getJsonFromCsv(inputFileName), null, 1);
  }

  getJsonFromCsv(inputFileName) {
    try {
      return this.csvStringToJson(fs.readFileSync(inputFileName, this.config.encoding || 'utf8'));
    } catch (error) {
      if (error instanceof CsvToJsonError) throw error;
      throw new FileOperationError('read', inputFileName, error);
    }
  }

  csvStringToJson(csv) {
    return this.csvToJson(csv);
  }

  csvStringToJsonStringified(csv) {
    return JSON.stringify(this.csvStringToJson(csv), null, 1);
  }

  csvToJson(csv, overrideConfig) {
    const config = overrideConfig || this.config;
    if (csv === '') return [];

    const records = this.parseRecords(csv, config).filter(
      (record) => !(record.length === 1 && record[0] === '')
    );
    const headerIndex = config.indexHeaderValue ?? 0;
    const header = records[headerIndex];
    if (!header) throw CsvFormatError.missingHeader();

    const ignored = new Set(config.indexesToIgnore || []);
    const headers = header.map((value) => value.trim());
    const result = [];

    for (let index = headerIndex + 1; index < records.length; index += 1) {
      const fields = records[index];
      const row = {};
      const fieldCount = config.printValueFormatByType
        ? headers.length
        : Math.min(headers.length, fields.length);
      for (let fieldIndex = 0; fieldIndex < fieldCount; fieldIndex += 1) {
        if (ignored.has(fieldIndex)) continue;
        let value = fields[fieldIndex] ?? '';
        if (config.printValueFormatByType) value = formatPrimitive(value);
        if (this.isParseSubArray(value, config)) value = this.buildJsonSubArray(value, config);
        row[headers[fieldIndex]] = value;
      }
      result.push(typeof config.rowMapper === 'function' ? config.rowMapper(row) : row);
    }
    return result;
  }

  parseRecords(csv, config = this.config) {
    return parseCsvRecords(
      csv,
      config.delimiter === undefined ? ',' : config.delimiter,
      Boolean(config.isSupportQuotedField)
    );
  }

  getLineEndingLength(input, index) {
    return input[index] === '\r' && input[index + 1] === '\n' ? 2 : 1;
  }

  getFieldDelimiter() {
    return this.config.delimiter === undefined ? ',' : this.config.delimiter;
  }

  getIndexHeader() {
    return this.config.indexHeaderValue ?? 0;
  }

  getFields(record) {
    return this.parseRecords(record)[0] || [];
  }

  buildJsonResult(headers, fields) {
    return headers.reduce((result, header, index) => {
      result[header] = fields[index] ?? '';
      return result;
    }, {});
  }

  buildJsonSubArray(value, config = this.config) {
    return value.slice(1, -1).split(config.parseSubArraySeparator || ',');
  }

  isParseSubArray(value, config = this.config) {
    const marker = config.parseSubArrayDelimiter;
    return typeof value === 'string' && marker && value.startsWith(marker) && value.endsWith(marker);
  }

  validateInputConfig() {
    return true;
  }

  hasQuotes(value) {
    return typeof value === 'string' && value.includes('"');
  }

  split(value) {
    return this.getFields(value);
  }

  isEscapedQuote(value, index) {
    return value[index] === '"' && value[index + 1] === '"';
  }

  isEmptyQuotedField(value) {
    return value === '""';
  }
}

class Configurable {
  constructor() {
    this.config = {};
  }

  formatValueByType(enabled = true) {
    this.config.printValueFormatByType = enabled;
    return this;
  }

  supportQuotedField(enabled) {
    this.config.isSupportQuotedField = Boolean(enabled);
    return this;
  }

  fieldDelimiter(delimiter) {
    this.config.delimiter = delimiter;
    return this;
  }

  trimHeaderFieldWhiteSpace(enabled) {
    this.config.isTrimHeaderFieldWhiteSpace = Boolean(enabled);
    return this;
  }

  indexHeader(index) {
    if (Number.isNaN(Number(index))) throw new ConfigurationError('indexHeader', index);
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
    return Object.freeze({
      delimiter: this.config.delimiter,
      encoding: this.config.encoding,
      isSupportQuotedField: this.config.isSupportQuotedField,
      isTrimHeaderFieldWhiteSpace: this.config.isTrimHeaderFieldWhiteSpace,
      indexHeaderValue: this.config.indexHeaderValue,
      parseSubArrayDelimiter: this.config.parseSubArrayDelimiter,
      parseSubArraySeparator: this.config.parseSubArraySeparator,
      printValueFormatByType: this.config.printValueFormatByType,
      rowMapper: this.config.rowMapper,
      indexesToIgnore: Object.freeze([...(this.config.indexesToIgnore || [])])
    });
  }
}

class CsvToJsonAsync extends Configurable {
  constructor() {
    super();
    this.csvToJson = new CsvParser(this.config);
  }

  async generateJsonFileFromCsv(inputFileName, outputFileName) {
    const json = await this.getJsonFromCsvStringified(inputFileName);
    try {
      await fs.promises.writeFile(outputFileName, json);
    } catch (error) {
      throw new FileOperationError('write', outputFileName, error);
    }
  }

  async getJsonFromCsvStringified(inputFileName) {
    const result = await this.getJsonFromCsvAsync(inputFileName);
    return JSON.stringify(result, undefined, 1);
  }

  async getJsonFromCsvAsync(inputFileName, options = {}) {
    if (inputFileName === null || inputFileName === undefined) {
      throw new InputValidationError(
        'inputFileNameOrCsv',
        'string (file path) or CSV string content',
        String(typeof inputFileName),
        'Either provide a valid file path or CSV content as a string.'
      );
    }
    if (options.raw) {
      if (inputFileName === '') return [];
      return this.csvToJson.csvToJsonWithConfig(inputFileName, this.getParserConfig());
    }
    try {
      const contents = await fs.promises.readFile(
        inputFileName,
        this.getParserConfig().encoding || 'utf8'
      );
      return this.csvToJson.csvToJsonWithConfig(contents, this.getParserConfig());
    } catch (error) {
      if (error instanceof CsvToJsonError) throw error;
      throw new FileOperationError('read', inputFileName, error);
    }
  }

  csvStringToJsonAsync(csv, options = { raw: true }) {
    return this.getJsonFromCsvAsync(csv, options);
  }

  async getJsonFromStreamAsync(stream) {
    this._validateStream(stream);
    let csv = '';
    for await (const chunk of stream) csv += chunk.toString(this.config.encoding || 'utf8');
    return this.csvToJson.csvStringToJson(csv);
  }

  _validateStream(stream) {
    if (!stream || typeof stream.on !== 'function') {
      throw new InputValidationError(
        'stream',
        'Readable stream',
        typeof stream,
        'Provide a valid Node.js Readable stream.'
      );
    }
  }

  async getJsonFromFileStreamingAsync(filePath) {
    if (!filePath || typeof filePath !== 'string') {
      throw new InputValidationError(
        'filePath',
        'string (file path)',
        typeof filePath,
        'Provide a valid file path as a string.'
      );
    }
    try {
      return await this.getJsonFromStreamAsync(
        fs.createReadStream(filePath, { encoding: this.config.encoding || 'utf8' })
      );
    } catch (error) {
      if (error instanceof CsvToJsonError) throw error;
      throw new FileOperationError('read', filePath, error);
    }
  }
}

module.exports = new CsvToJsonAsync();
