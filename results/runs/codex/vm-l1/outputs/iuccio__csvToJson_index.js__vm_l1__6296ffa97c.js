'use strict';

const fs = require('fs');

const EMPTY_CSV_MESSAGE = `CSV parsing error: No header row found.
The CSV file appears to be empty or has no valid header line.

Solutions:
  1. Ensure your CSV file contains at least one row (header row)
  2. Verify the file is not empty or contains only whitespace
  3. Check if you need to use indexHeader(n) to specify a non-standard header row
  4. Refer to RFC 4180 for proper CSV format: https://tools.ietf.org/html/rfc4180`;

const MISMATCHED_QUOTES_MESSAGE = `CSV parsing error: Mismatched quotes detected in CSV.
A quoted field was not properly closed with a matching quote character.

RFC 4180 rules for quoted fields:
  • Fields containing delimiters or quotes MUST be enclosed in double quotes
  • To include a quote within a quoted field, use two consecutive quotes: ""
  • Example: "Smith, John" (name contains comma)
  • Example: "He said ""Hello""" (text contains quotes)

Solutions:
  1. Review your CSV for properly paired quote characters
  2. Use double quotes ("") to escape quotes within quoted fields
  3. Ensure all commas within field values are inside quotes
  4. Enable supportQuotedField(true) if you're using quoted fields`;

class CsvFormatError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CsvFormatError';
  }
}

class FileOperationError extends Error {
  constructor(action, filePath, cause) {
    super(`File operation error: Failed to ${action} file.
File path: ${filePath}
Reason: ${cause.message}

Solutions:
  1. Verify the file path is correct: ${filePath}
  2. Check file permissions (read access for input, write access for output)
  3. Ensure the directory exists and is writable for output files
  4. Verify the file is not in use by another process`);
    this.name = 'FileOperationError';
    this.cause = cause;
  }
}

function createConfig() {
  return {
    printValueFormatByType: false,
    isSupportQuotedField: false,
    delimiter: ',',
    isTrimHeaderFieldWhiteSpace: false,
    indexHeaderValue: 0,
    parseSubArrayDelimiter: '*',
    parseSubArraySeparator: ',',
    indexesToIgnore: [],
  };
}

function formatValue(value, enabled) {
  if (!enabled) return value;
  if (value === 'true') return true;
  if (value === 'false') return false;
  const numericValue = Number(value);
  if (value !== '' && Number.isFinite(numericValue) && String(numericValue) === value) {
    return numericValue;
  }
  return value;
}

function splitQuotedRecords(csvString, delimiter) {
  const records = [];
  let record = [];
  let field = '';
  let insideQuotes = false;

  for (let index = 0; index < csvString.length; index += 1) {
    const character = csvString[index];
    if (character === '"') {
      if (insideQuotes && csvString[index + 1] === '"') {
        field += '"';
        index += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (!insideQuotes && character === delimiter) {
      record.push(field);
      field = '';
    } else if (!insideQuotes && (character === '\n' || character === '\r')) {
      if (character === '\r' && csvString[index + 1] === '\n') index += 1;
      record.push(field);
      records.push(record);
      record = [];
      field = '';
    } else {
      field += character;
    }
  }

  if (insideQuotes) throw new CsvFormatError(MISMATCHED_QUOTES_MESSAGE);
  record.push(field);
  records.push(record);
  return records;
}

function splitSimpleRecords(csvString, delimiter) {
  return csvString.split(/\r?\n/).map((line) => line.split(delimiter));
}

class CsvParser {
  constructor(config = createConfig()) {
    this.config = config;
  }

  csvStringToJson(csvString) {
    if (csvString === '') throw new CsvFormatError(EMPTY_CSV_MESSAGE);
    if (typeof csvString !== 'string') throw new TypeError('csvString must be a string');

    const records = this.config.isSupportQuotedField
      ? splitQuotedRecords(csvString, this.config.delimiter)
      : splitSimpleRecords(csvString, this.config.delimiter);
    const headerIndex = this.config.indexHeaderValue;
    const headerRecord = records[headerIndex];
    if (!headerRecord) throw new CsvFormatError(EMPTY_CSV_MESSAGE);

    const headers = headerRecord.map((header) => header.trim());
    const rows = [];
    for (let recordIndex = headerIndex + 1; recordIndex < records.length; recordIndex += 1) {
      const record = records[recordIndex];
      if (record.length === 1 && record[0] === '') continue;

      const row = {};
      for (let columnIndex = 0; columnIndex < headers.length; columnIndex += 1) {
        if (this.config.indexesToIgnore.includes(columnIndex)) continue;
        if (columnIndex >= record.length) continue;
        const header = headers[columnIndex];
        const rawValue = record[columnIndex];
        row[header] = this.buildJsonValue(rawValue);
      }
      rows.push(this.config.rowMapper ? this.config.rowMapper(row, rows.length) : row);
    }
    return rows;
  }

  buildJsonValue(value) {
    const marker = String(this.config.parseSubArrayDelimiter);
    const separator = String(this.config.parseSubArraySeparator);
    if (
      value === marker ||
      (value.length >= marker.length * 2 && value.startsWith(marker) && value.endsWith(marker))
    ) {
      if (value === marker) return [formatValue(value, this.config.printValueFormatByType)];
      const innerValue = value.slice(marker.length, -marker.length);
      return innerValue
        .split(separator)
        .map((item) => formatValue(item, this.config.printValueFormatByType));
    }
    return formatValue(value, this.config.printValueFormatByType);
  }

  csvStringToJsonStringified(csvString) {
    return JSON.stringify(this.csvStringToJson(csvString), null, 1);
  }

  getJsonFromCsv(filePath) {
    let csvString;
    try {
      csvString = fs.readFileSync(filePath, this.config.encoding || 'utf8');
    } catch (error) {
      throw new FileOperationError('read', filePath, error);
    }
    return this.csvStringToJson(csvString);
  }

  generateJsonFileFromCsv(inputFilePath, outputFilePath) {
    const jsonString = JSON.stringify(this.getJsonFromCsv(inputFilePath), null, 1);
    try {
      fs.writeFileSync(outputFilePath, jsonString);
    } catch (error) {
      throw new FileOperationError('write', outputFilePath, error);
    }
  }
}

class AsyncCsvParser extends CsvParser {
  async getJsonFromCsvAsync(filePath) {
    let csvString;
    try {
      csvString = await fs.promises.readFile(filePath, this.config.encoding || 'utf8');
    } catch (error) {
      throw new FileOperationError('read', filePath, error);
    }
    return this.csvStringToJson(csvString);
  }

  async csvStringToJsonAsync(csvString) {
    return this.csvStringToJson(csvString);
  }

  async generateJsonFileFromCsv(inputFilePath, outputFilePath) {
    const json = await this.getJsonFromCsvAsync(inputFilePath);
    try {
      await fs.promises.writeFile(outputFilePath, JSON.stringify(json, null, 1));
    } catch (error) {
      throw new FileOperationError('write', outputFilePath, error);
    }
  }

  async getJsonFromStreamAsync(stream) {
    const chunks = [];
    if (stream && typeof stream[Symbol.asyncIterator] === 'function') {
      for await (const chunk of stream) chunks.push(chunk);
    } else if (stream && typeof stream.getReader === 'function') {
      const reader = stream.getReader();
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        chunks.push(value);
      }
    } else {
      throw new TypeError('stream must be a readable stream');
    }

    const csvString = chunks
      .map((chunk) => (typeof chunk === 'string' ? chunk : Buffer.from(chunk).toString(this.config.encoding || 'utf8')))
      .join('');
    return this.csvStringToJson(csvString);
  }

  async getJsonFromFileStreamingAsync(filePath) {
    let stream;
    try {
      stream = fs.createReadStream(filePath);
      return await this.getJsonFromStreamAsync(stream);
    } catch (error) {
      if (error instanceof FileOperationError) throw error;
      throw new FileOperationError('read', filePath, error);
    }
  }
}

class BrowserCsvParser extends CsvParser {
  csvToJsonWithConfig(csvString, config) {
    return new CsvParser({ ...this.config, ...config }).csvStringToJson(csvString);
  }

  generateJsonFileFromCsv(inputFilePath, outputFilePath) {
    return super.generateJsonFileFromCsv(inputFilePath, outputFilePath);
  }

  getJsonFromCsvStringified(inputFilePath) {
    return JSON.stringify(this.getJsonFromCsv(inputFilePath), null, 1);
  }

  getJsonFromCsv(inputFilePath) {
    return super.getJsonFromCsv(inputFilePath);
  }

  csvStringToJson(csvString) {
    return super.csvStringToJson(csvString);
  }

  csvStringToJsonStringified(csvString) {
    return super.csvStringToJsonStringified(csvString);
  }

  csvToJson(csvString) {
    return this.csvStringToJson(csvString);
  }

  parseRecords(csvString) {
    return this.config.isSupportQuotedField
      ? splitQuotedRecords(csvString, this.config.delimiter)
      : splitSimpleRecords(csvString, this.config.delimiter);
  }

  getLineEndingLength(csvString) {
    return csvString.includes('\r\n') ? 2 : 1;
  }

  getFieldDelimiter() {
    return this.config.delimiter;
  }

  getIndexHeader() {
    return this.config.indexHeaderValue;
  }

  getFields(record) {
    return Array.isArray(record) ? record : String(record).split(this.config.delimiter);
  }

  buildJsonResult(csvString) {
    return this.csvStringToJson(csvString);
  }

  buildJsonSubArray(value) {
    return this.buildJsonValue(value);
  }

  isParseSubArray(value) {
    const marker = String(this.config.parseSubArrayDelimiter);
    return value === marker || (value.startsWith(marker) && value.endsWith(marker));
  }

  validateInputConfig(csvString) {
    if (typeof csvString !== 'string') throw new TypeError('csvString must be a string');
    return true;
  }

  hasQuotes(value) {
    return value.includes('"');
  }

  split(value) {
    return splitQuotedRecords(value, this.config.delimiter)[0];
  }

  isEscapedQuote(value, index) {
    return value[index] === '"' && value[index + 1] === '"';
  }

  isEmptyQuotedField(value) {
    return value === '""';
  }
}

const syncParser = new CsvParser();
const csvToJsonAsync = new AsyncCsvParser();
const browserParser = new BrowserCsvParser();
const browserConfig = {};
const configs = [syncParser.config, csvToJsonAsync.config, browserParser.config, browserConfig];

function applyConfigToAllClients(updateConfig) {
  for (const config of configs) updateConfig(config);
  return runtimeState;
}

const browser = {
  config: browserConfig,
  csvToJson: browserParser,
};
Object.defineProperty(browser, 'csvStringToJson', {
  value: (csvString) => browserParser.csvStringToJson(csvString),
});
const runtimeState = { browser };

exports.formatValueByType = function formatValueByType(enabled = true) {
  return applyConfigToAllClients((config) => { config.printValueFormatByType = enabled; });
};

exports.supportQuotedField = function supportQuotedField(enabled = false) {
  return applyConfigToAllClients((config) => { config.isSupportQuotedField = enabled; });
};

exports.fieldDelimiter = function fieldDelimiter(delimiter) {
  return applyConfigToAllClients((config) => { config.delimiter = delimiter; });
};

exports.trimHeaderFieldWhiteSpace = function trimHeaderFieldWhiteSpace(enabled = false) {
  return applyConfigToAllClients((config) => { config.isTrimHeaderFieldWhiteSpace = enabled; });
};

exports.indexHeader = function indexHeader(index) {
  return applyConfigToAllClients((config) => { config.indexHeaderValue = index; });
};

exports.parseSubArray = function parseSubArray(delimiter = '*', separator = ',') {
  return applyConfigToAllClients((config) => {
    config.parseSubArrayDelimiter = delimiter;
    config.parseSubArraySeparator = separator;
  });
};

exports.ignoreColumnIndexes = function ignoreColumnIndexes(indexes) {
  if (!Array.isArray(indexes)) throw new TypeError('indexes must be an array of numbers');
  if (!indexes.every((index) => Number.isInteger(index) && index >= 0)) {
    throw new TypeError('All elements in indexes must be valid non-negative numbers (>= 0)');
  }
  return applyConfigToAllClients((config) => { config.indexesToIgnore = indexes; });
};

exports.customEncoding = function customEncoding(encoding) {
  return applyConfigToAllClients((config) => { config.encoding = encoding; });
};

exports.utf8Encoding = function utf8Encoding() {
  return exports.customEncoding('utf8');
};

exports.ucs2Encoding = function ucs2Encoding() {
  return exports.customEncoding('ucs2');
};

exports.utf16leEncoding = function utf16leEncoding() {
  return exports.customEncoding('utf16le');
};

exports.latin1Encoding = function latin1Encoding() {
  return exports.customEncoding('latin1');
};

exports.asciiEncoding = function asciiEncoding() {
  return exports.customEncoding('ascii');
};

exports.base64Encoding = function base64Encoding() {
  return exports.customEncoding('base64');
};

exports.hexEncoding = function hexEncoding() {
  return exports.customEncoding('hex');
};

exports.mapRows = function mapRows(mapper) {
  if (typeof mapper !== 'function') throw new TypeError('mapperFn must be a function');
  return applyConfigToAllClients((config) => { config.rowMapper = mapper; });
};

exports.generateJsonFileFromCsv = function generateJsonFileFromCsv(inputFilePath, outputFilePath) {
  if (!inputFilePath) throw new Error('inputFileName is not defined!!!');
  if (!outputFilePath) throw new Error('outputFileName is not defined!!!');
  syncParser.generateJsonFileFromCsv(inputFilePath, outputFilePath);
};

exports.getJsonFromCsv = function getJsonFromCsv(inputFilePath) {
  if (!inputFilePath) throw new Error('inputFileName is not defined!!!');
  return syncParser.getJsonFromCsv(inputFilePath);
};

exports.getJsonFromCsvAsync = function getJsonFromCsvAsync(inputFilePath, options) {
  return csvToJsonAsync.getJsonFromCsvAsync(inputFilePath, options);
};

exports.csvStringToJsonAsync = function csvStringToJsonAsync(csvString, options) {
  return csvToJsonAsync.csvStringToJsonAsync(csvString, options);
};

exports.csvStringToJsonStringifiedAsync = function csvStringToJsonStringifiedAsync(csvString) {
  return csvToJsonAsync.csvStringToJsonStringifiedAsync(csvString);
};

exports.generateJsonFileFromCsvAsync = function generateJsonFileFromCsvAsync(inputFilePath, outputFilePath) {
  return csvToJsonAsync.generateJsonFileFromCsv(inputFilePath, outputFilePath);
};

exports.getJsonFromStreamAsync = function getJsonFromStreamAsync(stream) {
  return csvToJsonAsync.getJsonFromStreamAsync(stream);
};

exports.getJsonFromFileStreamingAsync = function getJsonFromFileStreamingAsync(inputFilePath) {
  return csvToJsonAsync.getJsonFromFileStreamingAsync(inputFilePath);
};

exports.csvStringToJson = function csvStringToJson(csvString) {
  return syncParser.csvStringToJson(csvString);
};

exports.csvStringToJsonStringified = function csvStringToJsonStringified(csvString) {
  if (csvString === undefined || csvString === null) throw new Error('csvString is not defined!!!');
  return syncParser.csvStringToJsonStringified(csvString);
};

exports.browser = browser;
