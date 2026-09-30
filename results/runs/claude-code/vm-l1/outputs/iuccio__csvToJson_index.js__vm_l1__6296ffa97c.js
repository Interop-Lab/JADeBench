'use strict';

const fs = require('fs');

class CsvFormatError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CsvFormatError';
  }
}

const config = {
  formatValueByType: true,
  supportQuotedField: false,
  fieldDelimiter: ',',
  trimHeaderFieldWhiteSpace: true,
  ignoreColumnIndexes: [],
  indexHeader: null,
  parseSubArray: false,
  mapRows: null,
  encoding: 'utf8'
};

function parseScalar(value) {
  if (!config.formatValueByType) return value;

  const trimmed = value.trim();
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if (trimmed === 'null') return null;
  if (trimmed !== '' && !Number.isNaN(Number(trimmed))) return Number(trimmed);
  return value;
}

function parseRecords(csvString) {
  if (!config.supportQuotedField) {
    return csvString
      .split(/\r?\n/)
      .filter((line, index, lines) => line !== '' || index < lines.length - 1)
      .map(line => line.split(config.fieldDelimiter));
  }

  const records = [];
  let record = [];
  let field = '';
  let quoted = false;

  for (let index = 0; index < csvString.length; index++) {
    const character = csvString[index];

    if (character === '"') {
      if (quoted && csvString[index + 1] === '"') {
        field += '"';
        index++;
      } else {
        quoted = !quoted;
      }
    } else if (!quoted && csvString.startsWith(config.fieldDelimiter, index)) {
      record.push(field);
      field = '';
      index += config.fieldDelimiter.length - 1;
    } else if (!quoted && (character === '\n' || character === '\r')) {
      if (character === '\r' && csvString[index + 1] === '\n') index++;
      record.push(field);
      records.push(record);
      record = [];
      field = '';
    } else {
      field += character;
    }
  }

  if (quoted) throw new CsvFormatError('Unclosed quoted field');
  if (field !== '' || record.length > 0) {
    record.push(field);
    records.push(record);
  }
  return records;
}

function assignNestedValue(target, header, value) {
  if (!config.parseSubArray || !header.includes('.')) {
    target[header] = value;
    return;
  }

  const path = header.split('.');
  let current = target;
  for (let index = 0; index < path.length - 1; index++) {
    const part = path[index];
    if (!current[part] || typeof current[part] !== 'object') current[part] = {};
    current = current[part];
  }
  current[path[path.length - 1]] = value;
}

function convertCsv(csvString) {
  if (csvString === undefined || csvString === null) {
    throw new Error('csvString is not defined!!!');
  }

  const records = parseRecords(String(csvString));
  if (records.length === 0) return [];

  const sourceHeader = config.indexHeader || records.shift();
  const headers = sourceHeader.map(header =>
    config.trimHeaderFieldWhiteSpace ? String(header).trim() : String(header)
  );
  const ignored = new Set(config.ignoreColumnIndexes);

  return records.map((fields, rowIndex) => {
    const row = {};
    headers.forEach((header, columnIndex) => {
      if (!ignored.has(columnIndex)) {
        assignNestedValue(row, header, parseScalar(fields[columnIndex] ?? ''));
      }
    });
    return config.mapRows ? config.mapRows(row, rowIndex) : row;
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

async function csvStringToJsonAsync(csvString) {
  return convertCsv(csvString);
}

async function csvStringToJsonStringifiedAsync(csvString) {
  return JSON.stringify(convertCsv(csvString));
}

async function getJsonFromCsvAsync(inputFileName) {
  if (!inputFileName) throw new Error('inputFileName is not defined!!!');
  const csv = await fs.promises.readFile(inputFileName, config.encoding);
  return convertCsv(csv);
}

async function generateJsonFileFromCsvAsync(inputFileName, outputFileName) {
  if (!inputFileName) throw new Error('inputFileName is not defined!!!');
  if (!outputFileName) throw new Error('outputFileName is not defined!!!');
  const json = await getJsonFromCsvAsync(inputFileName);
  await fs.promises.writeFile(outputFileName, JSON.stringify(json));
}

async function readStream(stream) {
  let csv = '';
  for await (const chunk of stream) {
    csv += Buffer.isBuffer(chunk) ? chunk.toString(config.encoding) : String(chunk);
  }
  return csv;
}

async function getJsonFromStreamAsync(stream) {
  return convertCsv(await readStream(stream));
}

async function getJsonFromFileStreamingAsync(inputFileName) {
  if (!inputFileName) throw new Error('inputFileName is not defined!!!');
  return getJsonFromStreamAsync(fs.createReadStream(inputFileName, { encoding: config.encoding }));
}

function setConfig(name, value) {
  config[name] = value;
  return module.exports;
}

function validateIndexes(indexes) {
  if (!Array.isArray(indexes)) throw new Error('indexes must be an array of numbers');
  if (!indexes.every(index => Number.isInteger(index) && index >= 0)) {
    throw new Error('All elements in indexes must be valid non-negative numbers (>= 0)');
  }
  return indexes;
}

function browserApi() {
  return {
    csvStringToJson,
    csvStringToJsonStringified,
    csvStringToJsonAsync,
    csvStringToJsonStringifiedAsync,
    async getJsonFromFileAsync(file) {
      if (!file) throw new Error('File is not defined!!!');
      if (typeof file.text === 'function') return convertCsv(await file.text());
      return convertCsv(await readStream(file.stream()));
    }
  };
}

exports.formatValueByType = (enabled = true) => setConfig('formatValueByType', enabled);
exports.supportQuotedField = (enabled = false) => setConfig('supportQuotedField', enabled);
exports.fieldDelimiter = delimiter => setConfig('fieldDelimiter', delimiter);
exports.trimHeaderFieldWhiteSpace = (enabled = true) =>
  setConfig('trimHeaderFieldWhiteSpace', enabled);
exports.ignoreColumnIndexes = indexes =>
  setConfig('ignoreColumnIndexes', validateIndexes(indexes));
exports.indexHeader = header => setConfig('indexHeader', header);
exports.parseSubArray = (enabled = true) => setConfig('parseSubArray', enabled);
exports.mapRows = mapper => setConfig('mapRows', mapper);

exports.utf8Encoding = () => setConfig('encoding', 'utf8');
exports.ucs2Encoding = () => setConfig('encoding', 'ucs2');
exports.utf16leEncoding = () => setConfig('encoding', 'utf16le');
exports.latin1Encoding = () => setConfig('encoding', 'latin1');
exports.asciiEncoding = () => setConfig('encoding', 'ascii');
exports.base64Encoding = () => setConfig('encoding', 'base64');
exports.hexEncoding = () => setConfig('encoding', 'hex');
exports.customEncoding = encoding => setConfig('encoding', encoding);

exports.generateJsonFileFromCsv = generateJsonFileFromCsv;
exports.getJsonFromCsv = getJsonFromCsv;
exports.getJsonFromStreamAsync = getJsonFromStreamAsync;
exports.getJsonFromFileStreamingAsync = getJsonFromFileStreamingAsync;
exports.csvStringToJsonStringifiedAsync = csvStringToJsonStringifiedAsync;
exports.generateJsonFileFromCsvAsync = generateJsonFileFromCsvAsync;
exports.getJsonFromCsvAsync = getJsonFromCsvAsync;
exports.csvStringToJsonAsync = csvStringToJsonAsync;
exports.csvStringToJson = csvStringToJson;
exports.csvStringToJsonStringified = csvStringToJsonStringified;
exports.browser = browserApi();
