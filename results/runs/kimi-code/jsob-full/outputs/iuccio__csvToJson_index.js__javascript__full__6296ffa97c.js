'use strict';

const fs = require('fs');

function createConfig() {
  return {
    printValueFormatByType: false,
    isSupportQuotedField: false,
    delimiter: ',',
    isTrimHeaderFieldWhiteSpace: false,
    indexHeaderValue: 0,
    parseSubArrayDelimiter: undefined,
    parseSubArraySeparator: undefined,
    indexesToIgnore: [],
    encoding: 'utf8',
    rowMapper: undefined,
  };
}

const nodeConfig = createConfig();
const asyncConfig = createConfig();
const browserConfig = createConfig();
const configurations = [nodeConfig, asyncConfig, browserConfig];
let api;

function configure(update) {
  for (const config of configurations) Object.assign(config, update);
  return api;
}

function formatValueByType(enabled = true) {
  return configure({ printValueFormatByType: enabled });
}

function supportQuotedField(enabled = false) {
  return configure({ isSupportQuotedField: enabled });
}

function fieldDelimiter(delimiter) {
  return configure({ delimiter });
}

function trimHeaderFieldWhiteSpace(enabled = false) {
  return configure({ isTrimHeaderFieldWhiteSpace: enabled });
}

function indexHeader(index) {
  if (isNaN(index)) throw new Error('Invalid configuration: indexHeader must be a number');
  return configure({ indexHeaderValue: index });
}

function parseSubArray(delimiter = '*', separator = ',') {
  return configure({ parseSubArrayDelimiter: delimiter, parseSubArraySeparator: separator });
}

function ignoreColumnIndexes(indexes) {
  if (indexes.some(index => !Number.isInteger(index) || index < 0)) {
    throw new TypeError('ignoreColumnIndexes expects non-negative integer indexes');
  }
  return configure({ indexesToIgnore: [...indexes] });
}

function customEncoding(encoding) {
  return configure({ encoding });
}

function mapRows(mapper) {
  if (typeof mapper !== 'function') throw new TypeError('mapperFn must be a function');
  return configure({ rowMapper: mapper });
}

function splitQuoted(value, delimiter) {
  const fields = [];
  let field = '';
  let quoted = false;
  for (let index = 0; index < value.length; index++) {
    const character = value[index];
    if (character === '"') {
      if (quoted && value[index + 1] === '"') {
        field += '"';
        index++;
      } else {
        quoted = !quoted;
      }
    } else if (!quoted && value.startsWith(delimiter, index)) {
      fields.push(field);
      field = '';
      index += delimiter.length - 1;
    } else {
      field += character;
    }
  }
  fields.push(field);
  return fields;
}

function recordsFrom(csv, quotedFields) {
  if (!quotedFields) return csv.split(/\r\n|\n|\r/);
  const records = [];
  let record = '';
  let quoted = false;
  for (let index = 0; index < csv.length; index++) {
    const character = csv[index];
    if (character === '"') {
      record += character;
      if (quoted && csv[index + 1] === '"') record += csv[++index];
      else quoted = !quoted;
    } else if (!quoted && (character === '\n' || character === '\r')) {
      records.push(record);
      record = '';
      if (character === '\r' && csv[index + 1] === '\n') index++;
    } else {
      record += character;
    }
  }
  records.push(record);
  return records;
}

function valueByType(value) {
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value !== '' && !isNaN(value)) return Number(value);
  return value;
}

function isSubArray(value, config) {
  const marker = config.parseSubArrayDelimiter;
  return Boolean(value && marker && value.indexOf(marker) >= 0 && value.lastIndexOf(marker) === value.length - 1);
}

function buildSubArray(value, config) {
  const start = value.indexOf(config.parseSubArrayDelimiter) + 1;
  const end = value.lastIndexOf(config.parseSubArrayDelimiter);
  const contents = value.substring(start, end).trim();
  const values = contents.split(config.parseSubArraySeparator);
  return config.printValueFormatByType ? values.map(valueByType) : values;
}

function parseCsv(csv, config) {
  const records = recordsFrom(csv, config.isSupportQuotedField);
  const headerIndex = config.indexHeaderValue;
  if (!records.length || headerIndex >= records.length) return [];
  const split = record => config.isSupportQuotedField
    ? splitQuoted(record, config.delimiter)
    : record.split(config.delimiter);
  const headers = split(records[headerIndex]);
  const ignored = new Set(config.indexesToIgnore);
  const result = [];

  for (let index = Number(headerIndex) + 1; index < records.length; index++) {
    if (records[index] === '') continue;
    const fields = split(records[index]);
    const row = {};
    for (let column = 0; column < headers.length; column++) {
      if (ignored.has(column)) continue;
      const header = config.isTrimHeaderFieldWhiteSpace ? headers[column].trim() : headers[column];
      let value = fields[column];
      if (isSubArray(value, config)) value = buildSubArray(value, config);
      else if (config.printValueFormatByType) value = valueByType(value);
      row[header] = value;
    }
    result.push(config.rowMapper ? config.rowMapper(row, result.length) : row);
  }
  return result;
}

function csvStringToJson(csv) {
  return parseCsv(csv, nodeConfig);
}

function csvStringToJsonStringified(csv) {
  if (csv === undefined || csv === null) throw new Error('csvString must be defined!!!');
  return JSON.stringify(csvStringToJson(csv), undefined, 1);
}

function getJsonFromCsv(inputFileName) {
  if (!inputFileName) throw new Error('inputFileName is not defined');
  return csvStringToJson(fs.readFileSync(inputFileName, nodeConfig.encoding || 'utf8'));
}

function generateJsonFileFromCsv(inputFileName, outputFileName) {
  if (!inputFileName) throw new Error('inputFileName is not defined');
  if (!outputFileName) throw new Error('outputFileName is not defined');
  fs.writeFileSync(outputFileName, JSON.stringify(getJsonFromCsv(inputFileName), undefined, 1));
}

function withCallback(promise, callback) {
  if (typeof callback !== 'function') return promise;
  promise.then(result => callback(null, result), error => callback(error));
  return promise;
}

function csvStringToJsonAsync(csv, callback) {
  return withCallback(Promise.resolve().then(() => parseCsv(csv, asyncConfig)), callback);
}

function csvStringToJsonStringifiedAsync(csv) {
  return Promise.resolve().then(() => JSON.stringify(parseCsv(csv, asyncConfig), undefined, 1));
}

async function readStream(stream, config) {
  let csv = '';
  for await (const chunk of stream) csv += Buffer.isBuffer(chunk) ? chunk.toString(config.encoding || 'utf8') : chunk;
  return parseCsv(csv, config);
}

function getJsonFromStreamAsync(stream) {
  return readStream(stream, asyncConfig);
}

function getJsonFromFileStreamingAsync(inputFileName) {
  return getJsonFromStreamAsync(fs.createReadStream(inputFileName, { encoding: asyncConfig.encoding || 'utf8' }));
}

function getJsonFromCsvAsync(inputFileName, callback) {
  const promise = fs.promises.readFile(inputFileName, asyncConfig.encoding || 'utf8')
    .then(csv => parseCsv(csv, asyncConfig));
  return withCallback(promise, callback);
}

async function generateJsonFileFromCsvAsync(inputFileName, outputFileName) {
  const rows = await getJsonFromCsvAsync(inputFileName);
  await fs.promises.writeFile(outputFileName, JSON.stringify(rows, undefined, 1));
}

class BrowserCsvToJson {
  constructor(config = browserConfig) {
    this.config = config;
  }

  csvStringToJson(csv) {
    return parseCsv(csv, this.config);
  }

  csvStringToJsonStringified(csv) {
    return JSON.stringify(this.csvStringToJson(csv), undefined, 1);
  }
}

const browserCsvToJson = new BrowserCsvToJson();
browserCsvToJson.CsvToJson = BrowserCsvToJson;
const browser = { config: browserConfig, csvToJson: browserCsvToJson };

api = {
  formatValueByType,
  supportQuotedField,
  fieldDelimiter,
  trimHeaderFieldWhiteSpace,
  indexHeader,
  parseSubArray,
  ignoreColumnIndexes,
  customEncoding,
  utf8Encoding: () => configure({ encoding: 'utf8' }),
  ucs2Encoding: () => configure({ encoding: 'ucs2' }),
  utf16leEncoding: () => configure({ encoding: 'utf16le' }),
  latin1Encoding: () => configure({ encoding: 'latin1' }),
  asciiEncoding: () => configure({ encoding: 'ascii' }),
  base64Encoding: () => configure({ encoding: 'base64' }),
  hexEncoding: () => configure({ encoding: 'hex' }),
  mapRows,
  generateJsonFileFromCsv,
  getJsonFromCsv,
  getJsonFromCsvAsync,
  csvStringToJsonAsync,
  csvStringToJsonStringifiedAsync,
  generateJsonFileFromCsvAsync,
  getJsonFromStreamAsync,
  getJsonFromFileStreamingAsync,
  csvStringToJson,
  csvStringToJsonStringified,
  browser,
};

module.exports = api;
