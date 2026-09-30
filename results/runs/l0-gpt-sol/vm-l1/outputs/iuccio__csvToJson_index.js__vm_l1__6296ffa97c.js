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
  trimHeaderFieldWhiteSpace: false,
  encoding: 'utf8',
  subArrayDelimiter: null,
  subArraySeparator: null,
  ignoreColumnIndexes: new Set(),
  indexHeader: 0,
  mapRows: null
};

const encodingOps = {
  utf8: 'utf8',
  ucs2: 'ucs2',
  utf16le: 'utf16le',
  latin1: 'latin1',
  ascii: 'ascii',
  base64: 'base64',
  hex: 'hex'
};

function applyConfigToAllClients(callback) {
  callback(configClient);
  return module.exports;
}

const configClient = {
  formatValueByType(value) {
    config.formatValueByType = Boolean(value);
    return this;
  },

  supportQuotedField(value) {
    config.supportQuotedField = Boolean(value);
    return this;
  },

  fieldDelimiter(value) {
    if (value === undefined || value === null || String(value).length === 0) {
      throw new TypeError('fieldDelimiter must be a non-empty string');
    }
    config.fieldDelimiter = String(value);
    return this;
  },

  trimHeaderFieldWhiteSpace(value) {
    config.trimHeaderFieldWhiteSpace = Boolean(value);
    return this;
  },

  encoding(value) {
    if (value === undefined || value === null) {
      throw new TypeError('encoding must be defined');
    }
    config.encoding = String(value);
    return this;
  },

  parseSubArray(delimiter, separator) {
    config.subArrayDelimiter = delimiter == null ? null : String(delimiter);
    config.subArraySeparator = separator == null ? ',' : String(separator);
    return this;
  },

  ignoreColumnIndexes(indexes) {
    config.ignoreColumnIndexes = new Set(indexes);
    return this;
  },

  indexHeader(value) {
    config.indexHeader = value;
    return this;
  },

  mapRows(value) {
    if (value != null && typeof value !== 'function') {
      throw new TypeError('mapRows must be a function');
    }
    config.mapRows = value || null;
    return this;
  }
};

function splitRows(csvString) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  const delimiter = config.fieldDelimiter;

  for (let index = 0; index < csvString.length;) {
    const character = csvString[index];

    if (config.supportQuotedField && character === '"') {
      if (quoted && csvString[index + 1] === '"') {
        field += '"';
        index += 2;
        continue;
      }

      quoted = !quoted;
      index++;
      continue;
    }

    if (!quoted && csvString.startsWith(delimiter, index)) {
      row.push(field);
      field = '';
      index += delimiter.length;
      continue;
    }

    if (!quoted && (character === '\n' || character === '\r')) {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';

      if (character === '\r' && csvString[index + 1] === '\n') {
        index += 2;
      } else {
        index++;
      }
      continue;
    }

    field += character;
    index++;
  }

  if (quoted) {
    throw new CsvFormatError('Unterminated quoted field');
  }

  if (field.length !== 0 || row.length !== 0) {
    row.push(field);
    rows.push(row);
  }

  while (
    rows.length > 0 &&
    rows[rows.length - 1].length === 1 &&
    rows[rows.length - 1][0] === ''
  ) {
    rows.pop();
  }

  return rows;
}

function formatScalar(value) {
  if (!config.formatValueByType || typeof value !== 'string') {
    return value;
  }

  const trimmed = value.trim();

  if (trimmed === '') {
    return '';
  }

  if (trimmed === 'true') {
    return true;
  }

  if (trimmed === 'false') {
    return false;
  }

  if (trimmed === 'null') {
    return null;
  }

  if (trimmed === 'undefined') {
    return undefined;
  }

  if (
    /^[-+]?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?$/i.test(trimmed) &&
    Number.isFinite(Number(trimmed))
  ) {
    return Number(trimmed);
  }

  return value;
}

function formatValue(value) {
  if (
    config.subArrayDelimiter &&
    typeof value === 'string' &&
    value.startsWith(config.subArrayDelimiter) &&
    value.endsWith(config.subArrayDelimiter)
  ) {
    const contents = value.slice(
      config.subArrayDelimiter.length,
      value.length - config.subArrayDelimiter.length
    );

    if (contents === '') {
      return [];
    }

    return contents
      .split(config.subArraySeparator)
      .map(part => formatScalar(part));
  }

  return formatScalar(value);
}

function normalizeHeaders(row) {
  return row.map(header => {
    const value = String(header);
    return config.trimHeaderFieldWhiteSpace ? value.trim() : value;
  });
}

function assignPath(target, path, value) {
  if (!path || !/[.[\]]/.test(path)) {
    target[path] = value;
    return;
  }

  const parts = [];
  String(path).replace(/[^.[\]]+/g, part => {
    parts.push(part);
    return part;
  });

  if (parts.length === 0) {
    target[path] = value;
    return;
  }

  let current = target;

  for (let index = 0; index < parts.length - 1; index++) {
    const part = parts[index];
    const nextPart = parts[index + 1];
    const nextIsIndex = /^(?:0|[1-9]\d*)$/.test(nextPart);

    if (
      current[part] === null ||
      typeof current[part] !== 'object'
    ) {
      current[part] = nextIsIndex ? [] : {};
    }

    current = current[part];
  }

  current[parts[parts.length - 1]] = value;
}

function resolveHeader(rows) {
  if (Array.isArray(config.indexHeader)) {
    return {
      headers: normalizeHeaders(config.indexHeader),
      dataStart: 0
    };
  }

  if (
    config.indexHeader &&
    typeof config.indexHeader === 'object' &&
    !Number.isInteger(config.indexHeader)
  ) {
    const headers = [];
    for (const key of Object.keys(config.indexHeader)) {
      headers[Number(key)] = config.indexHeader[key];
    }
    return {
      headers: normalizeHeaders(headers),
      dataStart: 0
    };
  }

  const index = Number.isInteger(config.indexHeader)
    ? config.indexHeader
    : 0;

  if (index < 0 || index >= rows.length) {
    return {
      headers: [],
      dataStart: rows.length
    };
  }

  return {
    headers: normalizeHeaders(rows[index]),
    dataStart: index + 1
  };
}

function csvStringToJson(csvString) {
  if (csvString === undefined || csvString === null) {
    throw new Error('csvString is not defined!!!');
  }

  const rows = splitRows(String(csvString));
  if (rows.length === 0) {
    return [];
  }

  const { headers, dataStart } = resolveHeader(rows);
  const result = [];

  for (let rowIndex = dataStart; rowIndex < rows.length; rowIndex++) {
    const sourceRow = rows[rowIndex];

    if (sourceRow.length === 1 && sourceRow[0] === '') {
      continue;
    }

    const object = {};

    for (let columnIndex = 0; columnIndex < headers.length; columnIndex++) {
      if (config.ignoreColumnIndexes.has(columnIndex)) {
        continue;
      }

      const header = headers[columnIndex];
      if (header === undefined || header === null || header === '') {
        continue;
      }

      assignPath(
        object,
        String(header),
        formatValue(sourceRow[columnIndex] === undefined ? '' : sourceRow[columnIndex])
      );
    }

    const mapped = config.mapRows
      ? config.mapRows(object, rowIndex - dataStart, sourceRow.slice())
      : object;

    if (mapped !== undefined) {
      result.push(mapped);
    }
  }

  return result;
}

function csvStringToJsonStringified(csvString) {
  return JSON.stringify(csvStringToJson(csvString));
}

function getJsonFromCsv(inputFileName) {
  if (!inputFileName) {
    throw new Error('inputFileName is not defined!!!');
  }

  const csvString = fs.readFileSync(inputFileName, {
    encoding: config.encoding
  });

  return csvStringToJson(csvString);
}

function generateJsonFileFromCsv(inputFileName, outputFileName) {
  if (!inputFileName) {
    throw new Error('inputFileName is not defined!!!');
  }

  if (!outputFileName) {
    throw new Error('outputFileName is not defined!!!');
  }

  fs.writeFileSync(
    outputFileName,
    JSON.stringify(getJsonFromCsv(inputFileName)),
    { encoding: config.encoding }
  );
}

async function csvStringToJsonAsync(csvString) {
  return csvStringToJson(csvString);
}

async function csvStringToJsonStringifiedAsync(csvString) {
  return csvStringToJsonStringified(csvString);
}

async function getJsonFromCsvAsync(inputFileName) {
  if (!inputFileName) {
    throw new Error('inputFileName is not defined!!!');
  }

  const csvString = await fs.promises.readFile(inputFileName, {
    encoding: config.encoding
  });

  return csvStringToJson(csvString);
}

async function generateJsonFileFromCsvAsync(inputFileName, outputFileName) {
  if (!inputFileName) {
    throw new Error('inputFileName is not defined!!!');
  }

  if (!outputFileName) {
    throw new Error('outputFileName is not defined!!!');
  }

  const json = await getJsonFromCsvAsync(inputFileName);
  await fs.promises.writeFile(
    outputFileName,
    JSON.stringify(json),
    { encoding: config.encoding }
  );
}

async function streamToString(stream, encoding) {
  if (stream == null) {
    throw new TypeError('stream is not defined');
  }

  if (typeof stream === 'string' || Buffer.isBuffer(stream)) {
    return Buffer.isBuffer(stream)
      ? stream.toString(encoding)
      : stream;
  }

  if (typeof stream.text === 'function') {
    return stream.text();
  }

  if (typeof stream.getReader === 'function') {
    const reader = stream.getReader();
    const chunks = [];

    while (true) {
      const result = await reader.read();
      if (result.done) {
        break;
      }
      chunks.push(
        typeof result.value === 'string'
          ? Buffer.from(result.value)
          : Buffer.from(result.value)
      );
    }

    return Buffer.concat(chunks).toString(encoding);
  }

  if (typeof stream[Symbol.asyncIterator] === 'function') {
    const chunks = [];

    for await (const chunk of stream) {
      chunks.push(
        typeof chunk === 'string'
          ? Buffer.from(chunk)
          : Buffer.from(chunk)
      );
    }

    return Buffer.concat(chunks).toString(encoding);
  }

  return new Promise((resolve, reject) => {
    let output = '';

    if (typeof stream.setEncoding === 'function') {
      stream.setEncoding(encoding);
    }

    stream.on('data', chunk => {
      output += Buffer.isBuffer(chunk)
        ? chunk.toString(encoding)
        : String(chunk);
    });
    stream.on('end', () => resolve(output));
    stream.on('error', reject);
  });
}

async function getJsonFromStreamAsync(stream, options) {
  const encoding =
    typeof options === 'string'
      ? options
      : options && options.encoding
        ? options.encoding
        : config.encoding;

  return csvStringToJson(await streamToString(stream, encoding));
}

async function getJsonFromFileStreamingAsync(inputFileName) {
  if (!inputFileName) {
    throw new Error('inputFileName is not defined!!!');
  }

  return getJsonFromStreamAsync(
    fs.createReadStream(inputFileName),
    config.encoding
  );
}

const browser = {
  async getJsonFromCsvAsync(file, options) {
    if (!file) {
      throw new Error('inputFileName is not defined!!!');
    }

    if (typeof file.text === 'function') {
      return csvStringToJson(await file.text());
    }

    if (typeof FileReader !== 'undefined') {
      const text = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsText(
          file,
          options && options.encoding
            ? options.encoding
            : config.encoding
        );
      });

      return csvStringToJson(text);
    }

    return getJsonFromStreamAsync(file, options);
  },

  csvStringToJsonAsync,
  csvStringToJsonStringifiedAsync,
  getJsonFromStreamAsync
};

exports.formatValueByType = function formatValueByType(value = true) {
  return applyConfigToAllClients(client => client.formatValueByType(value));
};

exports.supportQuotedField = function supportQuotedField(value = false) {
  return applyConfigToAllClients(client => client.supportQuotedField(value));
};

exports.fieldDelimiter = function fieldDelimiter(value) {
  return applyConfigToAllClients(client => client.fieldDelimiter(value));
};

exports.trimHeaderFieldWhiteSpace = function trimHeaderFieldWhiteSpace(value = false) {
  return applyConfigToAllClients(client => client.trimHeaderFieldWhiteSpace(value));
};

exports.encoding = function encoding(value) {
  return applyConfigToAllClients(client => client.encoding(value));
};

exports.parseSubArray = function parseSubArray(delimiter, separator) {
  return applyConfigToAllClients(client => client.parseSubArray(delimiter, separator));
};

exports.ignoreColumnIndexes = function ignoreColumnIndexes(indexes) {
  if (!Array.isArray(indexes)) {
    throw new TypeError('indexes must be an array of numbers');
  }

  if (!indexes.every(index => Number.isInteger(index) && index >= 0)) {
    throw new TypeError(
      'All elements in indexes must be valid non-negative numbers (>= 0)'
    );
  }

  return applyConfigToAllClients(client => client.ignoreColumnIndexes(indexes));
};

exports.indexHeader = function indexHeader(value) {
  return applyConfigToAllClients(client => client.indexHeader(value));
};

exports.utf8Encoding = function utf8Encoding() {
  return applyConfigToAllClients(client => client.encoding(encodingOps.utf8));
};

exports.ucs2Encoding = function ucs2Encoding() {
  return applyConfigToAllClients(client => client.encoding(encodingOps.ucs2));
};

exports.utf16leEncoding = function utf16leEncoding() {
  return applyConfigToAllClients(client => client.encoding(encodingOps.utf16le));
};

exports.latin1Encoding = function latin1Encoding() {
  return applyConfigToAllClients(client => client.encoding(encodingOps.latin1));
};

exports.asciiEncoding = function asciiEncoding() {
  return applyConfigToAllClients(client => client.encoding(encodingOps.ascii));
};

exports.base64Encoding = function base64Encoding() {
  return applyConfigToAllClients(client => client.encoding(encodingOps.base64));
};

exports.hexEncoding = function hexEncoding() {
  return applyConfigToAllClients(client => client.encoding(encodingOps.hex));
};

exports.customEncoding = function customEncoding(value) {
  return applyConfigToAllClients(client => client.encoding(value));
};

exports.mapRows = function mapRows(callback) {
  return applyConfigToAllClients(client => client.mapRows(callback));
};

exports.generateJsonFileFromCsv = generateJsonFileFromCsv;
exports.getJsonFromCsv = getJsonFromCsv;
exports.getJsonFromCsvAsync = getJsonFromCsvAsync;
exports.csvStringToJsonAsync = csvStringToJsonAsync;
exports.csvStringToJsonStringifiedAsync = csvStringToJsonStringifiedAsync;
exports.generateJsonFileFromCsvAsync = generateJsonFileFromCsvAsync;
exports.getJsonFromStreamAsync = getJsonFromStreamAsync;
exports.getJsonFromFileStreamingAsync = getJsonFromFileStreamingAsync;
exports.csvStringToJson = csvStringToJson;
exports.csvStringToJsonStringified = csvStringToJsonStringified;
exports.browser = browser;
