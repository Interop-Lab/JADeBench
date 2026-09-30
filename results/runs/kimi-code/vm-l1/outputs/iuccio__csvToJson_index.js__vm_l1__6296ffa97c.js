'use strict';

const fs = require('fs');
const { Readable } = require('stream');

const ENCODINGS = Object.freeze({
  utf8: 'utf8',
  ucs2: 'ucs2',
  utf16le: 'utf16le',
  latin1: 'latin1',
  ascii: 'ascii',
  base64: 'base64',
  hex: 'hex',
});

const config = {
  convertValues: true,
  quotedFields: false,
  delimiter: ',',
  trimHeaders: false,
  headerRow: 0,
  subArray: null,
  ignoredColumns: [],
  rowMapper: null,
  encoding: ENCODINGS.utf8,
};

class CsvFormatError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CsvFormatError';
  }
}

function splitRows(csv) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;

  for (let index = 0; index < csv.length; index += 1) {
    const character = csv[index];
    if (config.quotedFields && character === '"') {
      if (quoted && csv[index + 1] === '"') {
        field += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (!quoted && character === config.delimiter) {
      row.push(field);
      field = '';
    } else if (!quoted && (character === '\n' || character === '\r')) {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      if (character === '\r' && csv[index + 1] === '\n') index += 1;
    } else {
      field += character;
    }
  }

  if (quoted) throw new CsvFormatError('Unclosed quoted field');
  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function formatValue(value) {
  if (!config.convertValues) return value;
  const trimmed = value.trim();
  if (trimmed === '') return value;
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if (trimmed === 'null') return null;
  const number = Number(trimmed);
  return Number.isNaN(number) ? value : number;
}

function parseValue(value) {
  if (!config.subArray) return formatValue(value);
  const { delimiter, separator } = config.subArray;
  if (!value.includes(delimiter)) return formatValue(value);
  return value.split(separator || delimiter).map(formatValue);
}

function convertCsv(csvString) {
  if (csvString === undefined || csvString === null) {
    throw new Error('csvString is not defined!!!');
  }

  const rows = splitRows(String(csvString));
  if (rows.length <= config.headerRow) return [];
  const headers = rows[config.headerRow].map(header => (
    config.trimHeaders ? header.trim() : header
  ));
  const ignored = new Set(config.ignoredColumns);

  return rows.slice(config.headerRow + 1)
    .filter(row => row.some(value => value !== ''))
    .map(row => {
      const result = {};
      headers.forEach((header, column) => {
        if (!ignored.has(column) && header !== undefined && header !== '') {
          result[header] = parseValue(row[column] === undefined ? '' : row[column]);
        }
      });
      return config.rowMapper ? config.rowMapper(result) : result;
    });
}

function csvStringToJson(csvString) {
  return convertCsv(csvString);
}

function csvStringToJsonStringified(csvString) {
  return JSON.stringify(convertCsv(csvString));
}

function getJsonFromCsv(inputFileName) {
  if (!inputFileName) throw new Error('inputFileName is not defined!!!');
  return convertCsv(fs.readFileSync(inputFileName, config.encoding));
}

function generateJsonFileFromCsv(inputFileName, outputFileName) {
  if (!inputFileName) throw new Error('inputFileName is not defined!!!');
  if (!outputFileName) throw new Error('outputFileName is not defined!!!');
  fs.writeFileSync(outputFileName, JSON.stringify(getJsonFromCsv(inputFileName)));
}

async function streamToString(stream, encoding = config.encoding) {
  if (!stream || typeof stream.on !== 'function') {
    throw new TypeError('stream must be a readable stream');
  }
  stream.setEncoding(encoding);
  let csv = '';
  for await (const chunk of stream) csv += chunk;
  return csv;
}

async function getJsonFromStreamAsync(stream, encoding = config.encoding) {
  return convertCsv(await streamToString(stream, encoding));
}

async function getJsonFromCsvAsync(inputFileName, encoding = config.encoding) {
  if (!inputFileName) throw new Error('inputFileName is not defined!!!');
  return getJsonFromStreamAsync(fs.createReadStream(inputFileName), encoding);
}

async function getJsonFromFileStreamingAsync(inputFileName) {
  return getJsonFromCsvAsync(inputFileName);
}

async function csvStringToJsonAsync(csvString) {
  return getJsonFromStreamAsync(Readable.from([String(csvString)]));
}

async function csvStringToJsonStringifiedAsync(csvString) {
  return JSON.stringify(await csvStringToJsonAsync(csvString));
}

async function generateJsonFileFromCsvAsync(inputFileName, outputFileName) {
  if (!inputFileName) throw new Error('inputFileName is not defined!!!');
  if (!outputFileName) throw new Error('outputFileName is not defined!!!');
  const json = await getJsonFromCsvAsync(inputFileName);
  await fs.promises.writeFile(outputFileName, JSON.stringify(json));
}

function updateConfig(key, value) {
  config[key] = value;
  return exports;
}

exports.formatValueByType = (enabled = true) => updateConfig('convertValues', enabled);
exports.supportQuotedField = (enabled = false) => updateConfig('quotedFields', enabled);
exports.fieldDelimiter = delimiter => updateConfig('delimiter', delimiter);
exports.trimHeaderFieldWhiteSpace = (enabled = false) => updateConfig('trimHeaders', enabled);
exports.indexHeader = index => updateConfig('headerRow', index);
exports.parseSubArray = (delimiter, separator) => updateConfig('subArray', { delimiter, separator });
exports.ignoreColumnIndexes = indexes => {
  if (!Array.isArray(indexes)) throw new TypeError('indexes must be an array of numbers');
  if (!indexes.every(index => Number.isInteger(index) && index >= 0)) {
    throw new TypeError('All elements in indexes must be valid non-negative numbers (>= 0)');
  }
  return updateConfig('ignoredColumns', indexes.slice());
};
exports.mapRows = mapper => updateConfig('rowMapper', mapper);
exports.customEncoding = encoding => updateConfig('encoding', encoding);
exports.utf8Encoding = () => updateConfig('encoding', ENCODINGS.utf8);
exports.ucs2Encoding = () => updateConfig('encoding', ENCODINGS.ucs2);
exports.utf16leEncoding = () => updateConfig('encoding', ENCODINGS.utf16le);
exports.latin1Encoding = () => updateConfig('encoding', ENCODINGS.latin1);
exports.asciiEncoding = () => updateConfig('encoding', ENCODINGS.ascii);
exports.base64Encoding = () => updateConfig('encoding', ENCODINGS.base64);
exports.hexEncoding = () => updateConfig('encoding', ENCODINGS.hex);
exports.generateJsonFileFromCsv = generateJsonFileFromCsv;
exports.getJsonFromCsv = getJsonFromCsv;
exports.getJsonFromCsvAsync = getJsonFromCsvAsync;
exports.getJsonFromStreamAsync = getJsonFromStreamAsync;
exports.csvStringToJsonStringifiedAsync = csvStringToJsonStringifiedAsync;
exports.generateJsonFileFromCsvAsync = generateJsonFileFromCsvAsync;
exports.getJsonFromFileStreamingAsync = getJsonFromFileStreamingAsync;
exports.csvStringToJsonAsync = csvStringToJsonAsync;
exports.csvStringToJson = csvStringToJson;
exports.csvStringToJsonStringified = csvStringToJsonStringified;
exports.browser = Object.freeze({ csvStringToJson, csvStringToJsonStringified });
