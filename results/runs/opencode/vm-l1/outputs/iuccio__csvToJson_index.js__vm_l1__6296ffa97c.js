'use strict';

const fs = require('fs');

const ENCODINGS = Object.freeze({
  utf8: 'utf8',
  ucs2: 'ucs2',
  utf16le: 'utf16le',
  latin1: 'latin1',
  ascii: 'ascii',
  base64: 'base64',
  hex: 'hex',
});

class CsvFormatError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CsvFormatError';
  }
}

const configuration = {
  formatValueByType: true,
  supportQuotedField: false,
  fieldDelimiter: ',',
  trimHeaderFieldWhiteSpace: false,
  indexHeader: 0,
  ignoredColumnIndexes: [],
  encoding: ENCODINGS.utf8,
  subArrayDelimiters: null,
  mapRows: null,
};

function convertValue(value) {
  if (!configuration.formatValueByType) return value;

  const trimmed = value.trim();
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if (trimmed === 'null') return null;
  if (trimmed !== '' && !Number.isNaN(Number(trimmed))) return Number(trimmed);
  return value;
}

function splitCsvRows(csvText) {
  const delimiter = String(configuration.fieldDelimiter);
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;

  for (let index = 0; index < csvText.length; index++) {
    const character = csvText[index];

    if (configuration.supportQuotedField && character === '"') {
      if (quoted && csvText[index + 1] === '"') {
        field += '"';
        index++;
      } else {
        quoted = !quoted;
      }
      continue;
    }

    if (!quoted && csvText.startsWith(delimiter, index)) {
      row.push(field);
      field = '';
      index += delimiter.length - 1;
    } else if (!quoted && (character === '\n' || character === '\r')) {
      if (character === '\r' && csvText[index + 1] === '\n') index++;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
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

function expandSubArray(value) {
  const delimiters = configuration.subArrayDelimiters;
  if (!delimiters) return convertValue(value);

  const [start, end] = delimiters;
  if (!value.startsWith(start) || !value.endsWith(end)) return convertValue(value);
  const contents = value.slice(start.length, value.length - end.length);
  if (!contents) return [];
  return contents.split(configuration.fieldDelimiter).map(convertValue);
}

function parseCsv(csvText) {
  if (csvText === undefined || csvText === null) {
    throw new Error('csvString is not defined!!!');
  }

  const rows = splitCsvRows(String(csvText));
  const headerRow = rows[configuration.indexHeader];
  if (!headerRow) return [];

  const ignored = new Set(configuration.ignoredColumnIndexes);
  const headers = headerRow.map((header) =>
    configuration.trimHeaderFieldWhiteSpace ? header.trim() : header
  );
  const result = [];

  for (let rowIndex = configuration.indexHeader + 1; rowIndex < rows.length; rowIndex++) {
    const fields = rows[rowIndex];
    if (fields.length === 1 && fields[0] === '') continue;

    const record = {};
    for (let column = 0; column < headers.length; column++) {
      if (!ignored.has(column)) record[headers[column]] = expandSubArray(fields[column] ?? '');
    }
    result.push(configuration.mapRows ? configuration.mapRows(record, rowIndex) : record);
  }
  return result;
}

function setConfiguration(name, value) {
  configuration[name] = value;
  return api;
}

function formatValueByType(enabled = true) {
  return setConfiguration('formatValueByType', enabled);
}

function supportQuotedField(enabled = false) {
  return setConfiguration('supportQuotedField', enabled);
}

function fieldDelimiter(delimiter) {
  return setConfiguration('fieldDelimiter', delimiter);
}

function trimHeaderFieldWhiteSpace(enabled = false) {
  return setConfiguration('trimHeaderFieldWhiteSpace', enabled);
}

function indexHeader(index) {
  return setConfiguration('indexHeader', index);
}

function parseSubArray(startDelimiter, endDelimiter) {
  return setConfiguration('subArrayDelimiters', [String(startDelimiter), String(endDelimiter)]);
}

function ignoreColumnIndexes(indexes) {
  if (!Array.isArray(indexes)) throw new TypeError('indexes must be an array of numbers');
  if (!indexes.every((index) => Number.isInteger(index) && index >= 0)) {
    throw new TypeError('All elements in indexes must be valid non-negative numbers (>= 0)');
  }
  return setConfiguration('ignoredColumnIndexes', indexes.slice());
}

function customEncoding(encoding) {
  return setConfiguration('encoding', encoding);
}

function mapRows(mapper) {
  return setConfiguration('mapRows', mapper);
}

function getJsonFromCsv(inputFileName) {
  if (!inputFileName) throw new Error('inputFileName is not defined!!!');
  return parseCsv(fs.readFileSync(inputFileName, configuration.encoding));
}

function generateJsonFileFromCsv(inputFileName, outputFileName) {
  if (!inputFileName) throw new Error('inputFileName is not defined!!!');
  if (!outputFileName) throw new Error('outputFileName is not defined!!!');
  fs.writeFileSync(outputFileName, JSON.stringify(getJsonFromCsv(inputFileName)));
}

function csvStringToJson(csvString) {
  return parseCsv(csvString);
}

function csvStringToJsonStringified(csvString) {
  return JSON.stringify(parseCsv(csvString));
}

async function getJsonFromCsvAsync(inputFileName) {
  if (!inputFileName) throw new Error('inputFileName is not defined!!!');
  const contents = await fs.promises.readFile(inputFileName, configuration.encoding);
  return parseCsv(contents);
}

async function csvStringToJsonAsync(csvString) {
  return parseCsv(csvString);
}

async function csvStringToJsonStringifiedAsync(csvString) {
  return JSON.stringify(parseCsv(csvString));
}

async function generateJsonFileFromCsvAsync(inputFileName, outputFileName) {
  if (!inputFileName) throw new Error('inputFileName is not defined!!!');
  if (!outputFileName) throw new Error('outputFileName is not defined!!!');
  const json = await getJsonFromCsvAsync(inputFileName);
  await fs.promises.writeFile(outputFileName, JSON.stringify(json));
}

async function getJsonFromStreamAsync(stream) {
  let contents = '';
  stream.setEncoding?.(configuration.encoding);
  for await (const chunk of stream) contents += chunk;
  return parseCsv(contents);
}

function getJsonFromFileStreamingAsync(inputFileName) {
  if (!inputFileName) return Promise.reject(new Error('inputFileName is not defined!!!'));
  return getJsonFromStreamAsync(fs.createReadStream(inputFileName, { encoding: configuration.encoding }));
}

const api = {
  formatValueByType,
  supportQuotedField,
  fieldDelimiter,
  trimHeaderFieldWhiteSpace,
  indexHeader,
  parseSubArray,
  ignoreColumnIndexes,
  customEncoding,
  utf8Encoding: () => customEncoding(ENCODINGS.utf8),
  ucs2Encoding: () => customEncoding(ENCODINGS.ucs2),
  utf16leEncoding: () => customEncoding(ENCODINGS.utf16le),
  latin1Encoding: () => customEncoding(ENCODINGS.latin1),
  asciiEncoding: () => customEncoding(ENCODINGS.ascii),
  base64Encoding: () => customEncoding(ENCODINGS.base64),
  hexEncoding: () => customEncoding(ENCODINGS.hex),
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
};

api.browser = api;
module.exports = api;
