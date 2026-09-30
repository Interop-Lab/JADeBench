'use strict';

const fs = require('fs');

class InputValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InputValidationError';
  }
}

class CsvFormatError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CsvFormatError';
  }
}

class Configurable {
  constructor() {
    this._fieldDelimiter = ',';
    this._indexHeader = 0;
    this._formatValueByType = false;
  }

  fieldDelimiter(delimiter) {
    if (typeof delimiter !== 'string' || delimiter.length !== 1) {
      throw new InputValidationError('The field delimiter must be a single character');
    }
    this._fieldDelimiter = delimiter;
    return this;
  }

  indexHeader(index) {
    if (!Number.isInteger(index) || index < 0) {
      throw new InputValidationError('The header index must be a non-negative integer');
    }
    this._indexHeader = index;
    return this;
  }

  formatValueByType(enabled = true) {
    this._formatValueByType = Boolean(enabled);
    return this;
  }
}

function convertValue(value, formatByType) {
  if (!formatByType) return value;

  const trimmed = value.trim();

  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if (trimmed === 'null') return null;
  if (trimmed === 'undefined') return undefined;
  if (trimmed !== '' && Number.isFinite(Number(trimmed))) return Number(trimmed);

  return value;
}

function parseCsv(text, delimiter, headerIndex, formatByType) {
  if (typeof text !== 'string') {
    throw new InputValidationError('CSV input must be a string');
  }

  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;

  for (let index = 0; index < text.length; index++) {
    const character = text[index];

    if (quoted) {
      if (character === '"') {
        if (text[index + 1] === '"') {
          field += '"';
          index++;
        } else {
          quoted = false;
        }
      } else {
        field += character;
      }
      continue;
    }

    if (character === '"' && field.length === 0) {
      quoted = true;
    } else if (character === delimiter) {
      row.push(field);
      field = '';
    } else if (character === '\n' || character === '\r') {
      if (character === '\r' && text[index + 1] === '\n') index++;
      row.push(field);
      field = '';

      if (!(row.length === 1 && row[0] === '')) rows.push(row);
      row = [];
    } else {
      field += character;
    }
  }

  if (quoted) {
    throw new CsvFormatError('Unterminated quoted field');
  }

  if (field.length !== 0 || row.length !== 0) {
    row.push(field);
    if (!(row.length === 1 && row[0] === '')) rows.push(row);
  }

  if (rows.length <= headerIndex) return [];

  const headers = rows[headerIndex].map(header => header.trim());
  const result = [];

  for (let rowIndex = headerIndex + 1; rowIndex < rows.length; rowIndex++) {
    const values = rows[rowIndex];

    if (values.length === 1 && values[0] === '') continue;

    const item = {};
    for (let column = 0; column < headers.length; column++) {
      item[headers[column]] = convertValue(
        column < values.length ? values[column] : '',
        formatByType
      );
    }
    result.push(item);
  }

  return result;
}

class CsvToJsonAsync extends Configurable {
  constructor() {
    super();
  }

  async generateJsonFileFromCsv(inputFile, outputFile) {
    if (typeof inputFile !== 'string' || inputFile.length === 0) {
      throw new InputValidationError('An input CSV file is required');
    }
    if (typeof outputFile !== 'string' || outputFile.length === 0) {
      throw new InputValidationError('An output JSON file is required');
    }

    const json = await this.getJsonFromCsvAsync(inputFile);
    await fs.promises.writeFile(outputFile, JSON.stringify(json), 'utf8');
  }

  async getJsonFromCsvStringified(inputFile) {
    return JSON.stringify(await this.getJsonFromCsvAsync(inputFile));
  }

  async getJsonFromCsvAsync(inputFile) {
    if (typeof inputFile !== 'string' || inputFile.length === 0) {
      throw new InputValidationError('An input CSV file is required');
    }

    const csv = await fs.promises.readFile(inputFile, 'utf8');
    return this.csvStringToJsonAsync(csv);
  }

  _validateStream(stream) {
    if (
      stream === null ||
      typeof stream !== 'object' ||
      (typeof stream[Symbol.asyncIterator] !== 'function' &&
        typeof stream.on !== 'function')
    ) {
      throw new InputValidationError('A readable stream is required');
    }
    return stream;
  }

  async getJsonFromStreamAsync(stream) {
    this._validateStream(stream);

    let csv = '';

    if (typeof stream[Symbol.asyncIterator] === 'function') {
      for await (const chunk of stream) {
        csv += Buffer.isBuffer(chunk) ? chunk.toString('utf8') : String(chunk);
      }
    } else {
      csv = await new Promise((resolve, reject) => {
        let contents = '';

        stream.on('data', chunk => {
          contents += Buffer.isBuffer(chunk) ? chunk.toString('utf8') : String(chunk);
        });
        stream.once('end', () => resolve(contents));
        stream.once('error', reject);
      });
    }

    return this.csvStringToJsonAsync(csv);
  }

  async csvStringToJsonAsync(csvString) {
    if (Buffer.isBuffer(csvString)) csvString = csvString.toString('utf8');

    return parseCsv(
      csvString,
      this._fieldDelimiter,
      this._indexHeader,
      this._formatValueByType
    );
  }

  async getJsonFromFileStreamingAsync(inputFile) {
    if (typeof inputFile !== 'string' || inputFile.length === 0) {
      throw new InputValidationError('An input CSV file is required');
    }

    return this.getJsonFromStreamAsync(
      fs.createReadStream(inputFile, { encoding: 'utf8' })
    );
  }
}

module.exports = new CsvToJsonAsync();
