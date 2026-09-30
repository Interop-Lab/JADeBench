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

  static formatValue(value) {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'string') return `"${value}"`;
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value);
      } catch {
        return String(value);
      }
    }
    return String(value);
  }

  toString() {
    let text = `${this.name}: ${this.message}`;
    const entries = Object.entries(this.context || {});
    if (entries.length) {
      text += '\n\nContext:';
      for (const [key, value] of entries) {
        text += `\n  ${key}: ${CsvParsingError.formatValue(value)}`;
      }
    }
    return text;
  }
}

class InputValidationError extends CsvParsingError {
  constructor(parameter, expectedType, receivedValue, suggestion = '') {
    const receivedType = receivedValue === null ? 'null' : typeof receivedValue;
    const details = suggestion ? `\n${suggestion}` : '';
    super(
      `Invalid input: Parameter '${parameter}' is required.\n` +
        `Expected: ${expectedType}\n` +
        `Received: ${CsvParsingError.formatValue(receivedValue)} (${receivedType})${details}`,
      'INPUT_VALIDATION_ERROR',
      { parameter, expectedType, receivedType },
    );
  }
}

class ConfigurationError extends CsvParsingError {
  constructor(message, context = {}) {
    super(message, 'CONFIGURATION_ERROR', context);
  }

  static quotedFieldConflict(optionName, value) {
    return new ConfigurationError(
      `Configuration conflict: supportQuotedField() is enabled, but ${optionName} is set to '${value}'.\n` +
        'The quote character (") cannot be used as a field delimiter, separator, or sub-array delimiter when quoted field support is active.',
      { optionName, value, supportQuotedField: true, conflictingOption: optionName },
    );
  }

  static invalidHeaderIndex(value) {
    return new ConfigurationError(
      `Invalid configuration: indexHeader() expects a numeric value.\nReceived: ${value} (${typeof value})`,
      { parameterName: 'indexHeader', value, type: typeof value },
    );
  }
}

class CsvFormatError extends CsvParsingError {
  constructor(message, context = {}) {
    super(message, 'CSV_FORMAT_ERROR', context);
  }

  static missingHeader() {
    return new CsvFormatError(
      'CSV parsing error: No header row found.\nThe CSV file appears to be empty or has no valid header line.',
    );
  }

  static mismatchedQuotes(location = 'CSV') {
    return new CsvFormatError(
      `CSV parsing error: Mismatched quotes detected in ${location}.\n` +
        'A quoted field was not properly closed with a matching quote character.',
      { location },
    );
  }
}

class FileOperationError extends CsvParsingError {
  constructor(operation, filePath, originalError) {
    super(
      `File operation error: Failed to ${operation} file.\n` +
        `File path: ${filePath}\nReason: ${originalError?.message || originalError}`,
      'FILE_OPERATION_ERROR',
      { operation, filePath, originalError },
    );
  }
}

class JsonValidationError extends CsvParsingError {
  constructor(originalError, csv) {
    super(
      'JSON validation error: The parsed CSV data generated invalid JSON.\n' +
        `Original error: ${originalError?.message || originalError}`,
      'JSON_VALIDATION_ERROR',
      { originalError, csvPreview: csv?.substring?.(0, 200) || 'N/A' },
    );
  }
}

const encodedFileTypes = new Set(['base64', 'hex']);

const fileUtils = {
  isEncoded(encoding) {
    return encodedFileTypes.has(encoding);
  },

  decode(content, encoding) {
    return Buffer.from(content, encoding).toString('utf8');
  },

  normalize(content) {
    return typeof content === 'string' ? content : content.toString();
  },

  readFile(filePath, encoding = 'utf8') {
    try {
      const content = fs.readFileSync(filePath, this.isEncoded(encoding) ? 'utf8' : encoding);
      return this.isEncoded(encoding) ? this.decode(content, encoding) : this.normalize(content);
    } catch (error) {
      throw new FileOperationError('read', filePath, error);
    }
  },

  async readFileAsync(filePath, encoding = 'utf8') {
    try {
      const content = await fs.promises.readFile(
        filePath,
        this.isEncoded(encoding) ? 'utf8' : encoding,
      );
      return this.isEncoded(encoding) ? this.decode(content, encoding) : this.normalize(content);
    } catch (error) {
      throw new FileOperationError('read', filePath, error);
    }
  },

  writeFile(filePath, content) {
    try {
      fs.writeFileSync(filePath, content, 'utf8');
    } catch (error) {
      throw new FileOperationError('write', filePath, error);
    }
  },

  async writeFileAsync(filePath, content) {
    try {
      await fs.promises.writeFile(filePath, content, 'utf8');
    } catch (error) {
      throw new FileOperationError('write', filePath, error);
    }
  },
};

class StringUtils {
  static PATTERNS = Object.freeze({
    INTEGER: /^-?\d+$/,
    FLOAT: /^-?\d*\.\d+$/,
    WHITESPACE: /\s/g,
  });

  static BOOLEAN_VALUES = Object.freeze({ TRUE: 'true', FALSE: 'false' });

  static trimPropertyName(value) {
    return String(value ?? '').replace(this.PATTERNS.WHITESPACE, '').trim();
  }

  static getValueFormatByType(value) {
    if (this.isEmpty(value)) return String(value ?? '');
    if (this.isBoolean(value)) return this.convertToBoolean(value);
    if (this.isInteger(value)) return this.convertInteger(value);
    if (this.isFloat(value)) return this.convertFloat(value);
    return value;
  }

  static hasContent(value) {
    return Array.isArray(value) ? value.some(Boolean) : Boolean(value);
  }

  static isEmpty(value) {
    return value == null || value === '';
  }

  static isBoolean(value) {
    const normalized = String(value).toLowerCase();
    return normalized === this.BOOLEAN_VALUES.TRUE || normalized === this.BOOLEAN_VALUES.FALSE;
  }

  static isInteger(value) {
    return this.PATTERNS.INTEGER.test(value);
  }

  static isFloat(value) {
    return this.PATTERNS.FLOAT.test(value);
  }

  static hasLeadingZero(value) {
    const text = String(value);
    return text.length > 1 && (text[0] === '0' || (text[0] === '-' && text[1] === '0'));
  }

  static convertToBoolean(value) {
    return JSON.parse(String(value).toLowerCase());
  }

  static convertInteger(value) {
    if (this.hasLeadingZero(value)) return String(value);
    const converted = Number(value);
    return Number.isSafeInteger(converted) ? converted : String(value);
  }

  static convertFloat(value) {
    const converted = Number(value);
    return Number.isFinite(converted) ? converted : String(value);
  }
}

function validateJson(json, csv) {
  try {
    JSON.parse(json);
    return json;
  } catch (error) {
    throw new JsonValidationError(error, csv);
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

class Configurable {
  constructor() {
    this.config = { ...DEFAULT_CONFIG, indexesToIgnore: [] };
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
    this.config.indexHeaderValue = Number(index);
    return this;
  }

  parseSubArray(delimiter = '*', separator = ',') {
    this.config.parseSubArrayDelimiter = delimiter;
    this.config.parseSubArraySeparator = separator;
    return this;
  }

  mapRows(mapperFn) {
    if (typeof mapperFn !== 'function') throw new TypeError('mapperFn must be a function');
    this.config.rowMapper = mapperFn;
    return this;
  }

  ignoreColumnIndexes(indexes) {
    this.config.indexesToIgnore = Array.isArray(indexes) ? indexes : [];
    return this;
  }

  encoding(encoding) {
    this.config.encoding = encoding;
    return this;
  }

  getParserConfig() {
    return { ...this.config, indexesToIgnore: [...this.config.indexesToIgnore] };
  }
}

class CsvToJson extends Configurable {
  csvToJsonWithConfig(csv, config) {
    this.validateInputConfig(config);
    const records = this.parseRecords(String(csv ?? ''), config);
    const headerIndex = this.getIndexHeader(config);
    const headerRecord = records[headerIndex];
    if (!StringUtils.hasContent(headerRecord)) throw CsvFormatError.missingHeader();
    const headers = this.getFields(headerRecord, config);
    if (!StringUtils.hasContent(headers)) throw CsvFormatError.missingHeader();

    const result = [];
    let dataRowIndex = 0;
    for (let index = headerIndex + 1; index < records.length; index += 1) {
      if (!StringUtils.hasContent(records[index])) continue;
      const fields = this.getFields(records[index], config);
      let row = this.buildJsonResult(headers, fields, config);
      if (config.rowMapper) row = config.rowMapper(row, dataRowIndex);
      result.push(row);
      dataRowIndex += 1;
    }
    return result;
  }

  parseRecords(csv, config) {
    const records = [];
    let record = '';
    let insideQuotes = false;
    for (let index = 0; index < csv.length; index += 1) {
      const character = csv[index];
      if (config.isSupportQuotedField && character === '"') {
        if (insideQuotes && csv[index + 1] === '"') {
          record += '""';
          index += 1;
        } else {
          insideQuotes = !insideQuotes;
          record += character;
        }
        continue;
      }
      const lineEndingLength = insideQuotes ? 0 : this.getLineEndingLength(csv, index);
      if (lineEndingLength) {
        records.push(record);
        record = '';
        index += lineEndingLength - 1;
      } else {
        record += character;
      }
    }
    if (insideQuotes) throw CsvFormatError.mismatchedQuotes('CSV');
    if (record.length || csv.length === 0) records.push(record);
    return records;
  }

  getLineEndingLength(text, index) {
    if (text.slice(index, index + 2) === '\r\n') return 2;
    return text[index] === '\r' || text[index] === '\n' ? 1 : 0;
  }

  getFieldDelimiter(config) {
    return config.delimiter || ',';
  }

  getIndexHeader(config) {
    return isNaN(config.indexHeaderValue) ? 0 : Number(config.indexHeaderValue);
  }

  getFields(record, config) {
    return config.isSupportQuotedField
      ? this.split(record, config)
      : record.split(this.getFieldDelimiter(config));
  }

  buildJsonResult(headers, fields, config) {
    const ignoredIndexes = new Set(config.indexesToIgnore || []);
    const result = {};
    for (let index = 0; index < headers.length; index += 1) {
      if (ignoredIndexes.has(index)) continue;
      const header = config.isTrimHeaderFieldWhiteSpace
        ? StringUtils.trimPropertyName(headers[index])
        : headers[index];
      const value = fields[index] ?? '';
      result[header] = this.isParseSubArray(value, config)
        ? this.buildJsonSubArray(value, config)
        : config.printValueFormatByType
          ? StringUtils.getValueFormatByType(value)
          : value;
    }
    return result;
  }

  buildJsonSubArray(value, config) {
    const marker = config.parseSubArrayDelimiter;
    const content = value.substring(
      value.indexOf(marker) + marker.length,
      value.lastIndexOf(marker),
    );
    return content.trim().split(config.parseSubArraySeparator).map((item) =>
      config.printValueFormatByType ? StringUtils.getValueFormatByType(item) : item,
    );
  }

  isParseSubArray(value, config) {
    const marker = config.parseSubArrayDelimiter;
    return Boolean(
      marker &&
        value.indexOf(marker) === 0 &&
        value.lastIndexOf(marker) === value.length - marker.length,
    );
  }

  validateInputConfig(config) {
    if (!config.isSupportQuotedField) return;
    for (const [name, value] of [
      ['fieldDelimiter', this.getFieldDelimiter(config)],
      ['parseSubArraySeparator', config.parseSubArraySeparator],
      ['parseSubArrayDelimiter', config.parseSubArrayDelimiter],
    ]) {
      if (value === '"') throw ConfigurationError.quotedFieldConflict(name, value);
    }
  }

  split(row, config) {
    const delimiter = this.getFieldDelimiter(config);
    const fields = [];
    let field = '';
    let insideQuotes = false;
    for (let index = 0; index < row.length; index += 1) {
      const character = row[index];
      if (character === '"') {
        if (insideQuotes && row[index + 1] === '"') {
          field += '"';
          index += 1;
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
    if (insideQuotes) throw CsvFormatError.mismatchedQuotes('row');
    fields.push(field);
    return fields;
  }
}

class StreamProcessor {
  constructor(csvConfig, isBrowser = false) {
    this.csvConfig = csvConfig;
    this.isBrowser = isBrowser;
    this.buffer = '';
    this.headers = null;
    this.headerRowIndex = isNaN(csvConfig.indexHeaderValue) ? 0 : Number(csvConfig.indexHeaderValue);
    this.currentRecordIndex = 0;
    this.dataRowIndex = 0;
    this.parsedRecords = [];
    this.csvParser = new CsvToJson();
  }

  processChunk(chunk) {
    if (typeof chunk === 'string') this.buffer += chunk;
    else if (this.isBrowser && typeof globalThis.TextDecoder !== 'undefined') {
      this.buffer += new globalThis.TextDecoder().decode(chunk);
    } else {
      this.buffer += Buffer.from(chunk).toString();
    }
    this.processCompleteRecords();
  }

  processCompleteRecords() {
    const parsed = this.extractRecords(false);
    this.buffer = parsed.remainingBuffer;
    for (const record of parsed.records) this.processRecord(record);
  }

  finalizeProcessing() {
    const parsed = this.extractRecords(true);
    if (parsed.insideQuotes) throw CsvFormatError.mismatchedQuotes('CSV stream');
    this.buffer = '';
    for (const record of parsed.records) this.processRecord(record);
    if (!this.headers?.length) throw CsvFormatError.missingHeader();
  }

  extractRecords(finalChunk) {
    const records = [];
    let start = 0;
    let insideQuotes = false;
    for (let index = 0; index < this.buffer.length; index += 1) {
      if (this.csvConfig.isSupportQuotedField && this.buffer[index] === '"') {
        if (insideQuotes && this.buffer[index + 1] === '"') index += 1;
        else insideQuotes = !insideQuotes;
        continue;
      }
      if (insideQuotes) continue;
      if (!finalChunk && this.buffer[index] === '\r' && index === this.buffer.length - 1) {
        break;
      }
      const length = this.csvParser.getLineEndingLength(this.buffer, index);
      if (!length) continue;
      records.push(this.buffer.slice(start, index));
      index += length - 1;
      start = index + 1;
    }
    let remainingBuffer = this.buffer.slice(start);
    if (finalChunk && remainingBuffer.length && !insideQuotes) {
      records.push(remainingBuffer);
      remainingBuffer = '';
    }
    return { records, remainingBuffer, insideQuotes };
  }

  processRecord(record) {
    const recordIndex = this.currentRecordIndex++;
    if (recordIndex < this.headerRowIndex) return;
    if (recordIndex === this.headerRowIndex) {
      const headers = this.csvParser.getFields(record, this.csvConfig);
      if (StringUtils.hasContent(headers)) this.headers = headers;
      return;
    }
    if (!StringUtils.hasContent(record)) return;
    const fields = this.csvParser.getFields(record, this.csvConfig);
    let row = this.csvParser.buildJsonResult(this.headers, fields, this.csvConfig);
    if (this.csvConfig.rowMapper) row = this.csvConfig.rowMapper(row, this.dataRowIndex);
    this.dataRowIndex += 1;
    this.parsedRecords.push(row);
  }

  processStream(stream) {
    return new Promise((resolve, reject) => {
      if (this.isBrowser) {
        const reader = stream?.getReader?.();
        if (!reader) return reject(new Error('Invalid ReadableStream provided'));
        const read = () => reader.read().then(({ done, value }) => {
          if (done) {
            this.finalizeProcessing();
            return resolve(this.parsedRecords);
          }
          this.processChunk(value);
          return read();
        }).catch(reject);
        read();
        return;
      }
      if (typeof stream?.on !== 'function') {
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
          resolve(this.parsedRecords);
        } catch (error) {
          reject(error);
        }
      });
      stream.on('error', reject);
    });
  }
}

const csvParser = new CsvToJson();

class CsvToJsonAsync extends Configurable {
  async generateJsonFileFromCsv(inputFileName, outputFileName) {
    const json = await this.getJsonFromCsvStringified(inputFileName);
    await fileUtils.writeFileAsync(outputFileName, json);
  }

  async getJsonFromCsvStringified(inputFileName) {
    const csv = await fileUtils.readFileAsync(inputFileName, this.config.encoding || 'utf8');
    const json = JSON.stringify(csvParser.csvToJsonWithConfig(csv, this.getParserConfig()));
    return validateJson(json, csv);
  }

  async getJsonFromCsvAsync(inputFileNameOrCsv, raw = false) {
    if (typeof inputFileNameOrCsv !== 'string' || inputFileNameOrCsv === '') {
      throw new InputValidationError(
        'inputFileNameOrCsv',
        'string (file path) or CSV string content',
        inputFileNameOrCsv,
        'Either provide a valid file path or CSV content as a string.',
      );
    }
    const csv = raw
      ? inputFileNameOrCsv
      : await fileUtils.readFileAsync(inputFileNameOrCsv, this.config.encoding || 'utf8');
    return csvParser.csvToJsonWithConfig(csv, this.getParserConfig());
  }

  csvStringToJsonAsync(csv) {
    return this.getJsonFromCsvAsync(csv, true);
  }

  async getJsonFromStreamAsync(stream) {
    this._validateStream(stream);
    const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
    return new StreamProcessor(this.getParserConfig(), isBrowser).processStream(stream);
  }

  _validateStream(stream) {
    if (typeof stream?.pipe !== 'function' && typeof stream?.getReader !== 'function') {
      throw new InputValidationError(
        'stream',
        'Readable stream',
        stream,
        'Provide a valid Node.js Readable stream.',
      );
    }
  }

  async getJsonFromFileStreamingAsync(filePath) {
    if (typeof filePath !== 'string' || filePath === '') {
      throw new InputValidationError(
        'filePath',
        'string (file path)',
        filePath,
        'Provide a valid file path as a string.',
      );
    }
    const stream = fs.createReadStream(filePath, { encoding: this.config.encoding || 'utf8' });
    return this.getJsonFromStreamAsync(stream);
  }
}

module.exports = new CsvToJsonAsync();
