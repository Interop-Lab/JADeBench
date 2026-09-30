'use strict';

const fs = require('fs');

const defaults = {
  delimiter: ',',
  quote: '"',
  trim: false,
  checkType: false,
  headers: null,
  ignoreEmpty: false,
  output: 'json',
};

class CsvParser {
  constructor(options = {}) {
    this.options = { ...defaults, ...options };
  }

  fromString(input) {
    return parse(input, this.options);
  }

  fromFile(path) {
    return fs.promises.readFile(path, 'utf8').then(input => this.fromString(input));
  }

  fromStream(stream) {
    return new Promise((resolve, reject) => {
      let input = '';
      stream.setEncoding('utf8');
      stream.on('data', chunk => { input += chunk; });
      stream.on('error', reject);
      stream.on('end', () => {
        try {
          resolve(this.fromString(input));
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  fromStringAsync(input) {
    return Promise.resolve().then(() => this.fromString(input));
  }

  setDelimiter(delimiter) {
    this.options.delimiter = delimiter;
    return this;
  }

  setQuote(quote) {
    this.options.quote = quote;
    return this;
  }

  setHeaders(headers) {
    this.options.headers = Array.isArray(headers) ? [...headers] : headers;
    return this;
  }

  setTrim(enabled = true) {
    this.options.trim = enabled;
    return this;
  }

  setCheckType(enabled = true) {
    this.options.checkType = enabled;
    return this;
  }

  setIgnoreEmpty(enabled = true) {
    this.options.ignoreEmpty = enabled;
    return this;
  }

  setOutput(output) {
    this.options.output = output;
    return this;
  }
}

function parse(input, options) {
  if (typeof input !== 'string') {
    throw new TypeError('CSV input must be a string');
  }

  const delimiter = options.delimiter || ',';
  const quote = options.quote || '"';
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;

  for (let index = 0; index < input.length; index++) {
    const character = input[index];

    if (character === quote) {
      if (quoted && input[index + 1] === quote) {
        field += quote;
        index++;
      } else {
        quoted = !quoted;
      }
    } else if (!quoted && character === delimiter) {
      row.push(normalize(field, options));
      field = '';
    } else if (!quoted && (character === '\n' || character === '\r')) {
      if (character === '\r' && input[index + 1] === '\n') index++;
      row.push(normalize(field, options));
      field = '';
      if (!options.ignoreEmpty || row.some(value => value !== '')) rows.push(row);
      row = [];
    } else {
      field += character;
    }
  }

  if (quoted) throw new Error('Unclosed quoted field');

  if (field !== '' || row.length > 0 || input.length === 0) {
    row.push(normalize(field, options));
    if (!options.ignoreEmpty || row.some(value => value !== '')) rows.push(row);
  }

  if (rows.length === 0) return [];

  const headers = options.headers || rows.shift();
  return rows.map(values => {
    const record = {};
    headers.forEach((header, index) => {
      record[header] = values[index] === undefined ? '' : values[index];
    });
    return record;
  });
}

function normalize(value, options) {
  if (options.trim) value = value.trim();
  if (!options.checkType || value === '') return value;
  if (/^-?\d+$/.test(value)) return Number.parseInt(value, 10);
  if (/^-?\d*\.\d+$/.test(value)) return Number.parseFloat(value);
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value === 'null') return null;
  return value;
}

function createParser(options) {
  return new CsvParser(options);
}

const parser = createParser();
parser.CsvParser = CsvParser;
parser.createParser = createParser;
parser.parse = parse;

module.exports = parser;
