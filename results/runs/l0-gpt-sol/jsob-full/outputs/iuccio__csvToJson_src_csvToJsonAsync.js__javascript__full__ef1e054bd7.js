'use strict';

const fs = require('fs');
const { StringDecoder } = require('string_decoder');

class InputValidationError extends TypeError {
  constructor(parameterName, value, type, expected) {
    super(`Invalid ${parameterName}: expected ${expected}, received ${type} (${String(value)})`);
    this.name = 'InputValidationError';
    this.parameterName = parameterName;
    this.value = value;
    this.type = type;
  }
}

class CsvFormatError extends Error {
  constructor(message = 'Invalid CSV format') {
    super(message);
    this.name = 'CsvFormatError';
  }
}

class ConfigurationError extends Error {
  constructor(message, optionName, value, details = {}) {
    super(message);
    this.name = 'ConfigurationError';
    this.optionName = optionName;
    this.value = value;
    this.details = details;
  }
}

class JsonValidationError extends Error {
  constructor(value, originalError) {
    super(`Invalid JSON value: ${String(value)}`);
    this.name = 'JsonValidationError';
    this.value = value;
    this.originalError = originalError;
  }
}

class FileOperationError extends Error {
  constructor(operation, filePath, originalError) {
    super(`${operation} failed for '${filePath}': ${originalError && originalError.message}`);
    this.name = 'FileOperationError';
    this.operation = operation;
    this.filePath = filePath;
    this.originalError = originalError;
  }
}

class StringUtils {
  static patterns = {
    integer: /^-?\d+$/,
    float: /^-?\d*\.\d+$/,
    whitespace: /\s/g
  };

  clean(value, trim = true) {
    if (!value) return '';
    return trim ? value.replace(StringUtils.patterns.whitespace, '') : value.trim();
  }

  isBoolean(value) {
    const normalized = value.toLowerCase();
    return normalized === 'true' || normalized === 'false';
  }

  isInteger(value) {
    return StringUtils.patterns.integer.test(value);
  }

  isFloat(value) {
    return StringUtils.patterns.float.test(value);
  }

  isEmpty(value) {
    return value == null || value === '';
  }

  isNull(value) {
    return value.toLowerCase() === 'null';
  }

  isQuoted(value) {
    return value.startsWith('"') && value.endsWith('"');
  }

  isNumber(value) {
    return this.isInteger(value) || this.isFloat(value);
  }

  parseNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : String(value);
  }

  parseInteger(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : String(value);
  }
}

class JsonUtils {
  validate(value) {
    try {
      JSON.stringify(value);
    } catch (error) {
      throw new JsonValidationError(value, error);
    }
  }
}

class ParserConfig {
  constructor(options = {}) {
    Object.assign(this, options);
    this.headers = options.headers ? [...options.headers] : [];
    Object.freeze(this);
  }
}

class Configurable {
  constructor(options = {}) {
    this.options = { ...options };
  }

  setTrim(trim = true) {
    this.options.trim = trim;
    return this;
  }

  setIgnoreEmpty(ignoreEmpty = false) {
    this.options.ignoreEmpty = ignoreEmpty;
    return this;
  }

  setHeaders(headers) {
    this.options.headers = Array.isArray(headers) ? [...headers] : [...headers];
    return this;
  }

  setDelimiter(delimiter = ',') {
    this.options.delimiter = delimiter;
    return this;
  }

  setCheckType(checkType) {
    if (isNaN(checkType)) throw ConfigurationError.invalidValue(checkType);
    this.options.checkType = checkType;
    return this;
  }

  setQuote(quote = '"') {
    this.options.quote = quote;
    return this;
  }

  setEOL(eol) {
    this.options.eol = eol;
    return this;
  }

  getParserConfig() {
    return new ParserConfig(this.options);
  }
}

class CsvParser extends Configurable {
  constructor() {
    super();
  }

  parseString(input, options = {}) {
    if (typeof input !== 'string') {
      throw new InputValidationError('csv', input, typeof input, 'string');
    }

    const config = { ...this.options, ...options };
    const delimiter = config.delimiter || ',';
    const quote = config.quote || '"';
    const rows = this.parseRows(input, delimiter, quote, config);
    const headers = config.headers || rows.shift() || [];
    const result = [];

    for (const row of rows) {
      const record = {};
      for (let index = 0; index < headers.length; index++) {
        let value = row[index] === undefined ? '' : row[index];
        if (config.trim !== false) value = value.trim();
        if (config.checkType && value !== '' && !Number.isNaN(Number(value))) {
          value = Number(value);
        }
        record[headers[index]] = value;
      }

      if (!config.ignoreEmpty || Object.values(record).some(value => value !== '')) {
        result.push(record);
      }
    }

    return result;
  }

  parseRows(input, delimiter, quote, config) {
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
        row.push(field);
        field = '';
      } else if (!quoted && (character === '\n' || character === '\r')) {
        row.push(field);
        rows.push(row);
        row = [];
        field = '';
        if (character === '\r' && input[index + 1] === '\n') index++;
      } else {
        field += character;
      }
    }

    if (quoted) throw new CsvFormatError('Unclosed quoted field');
    if (field !== '' || row.length) {
      row.push(field);
      rows.push(row);
    }

    return rows;
  }
}

class StreamProcessor extends CsvParser {
  constructor(parser, options = {}) {
    super();
    this.parser = parser;
    this.options = { ...options };
    this.buffer = '';
    this.rows = [];
    this.ended = false;
  }

  async parseStream(stream) {
    if (!stream || typeof stream[Symbol.asyncIterator] !== 'function') {
      throw new InputValidationError('stream', stream, typeof stream, 'readable stream');
    }

    const decoder = new StringDecoder('utf8');
    for await (const chunk of stream) {
      this.buffer += Buffer.isBuffer(chunk) ? decoder.write(chunk) : String(chunk);
    }
    this.buffer += decoder.end();
    this.ended = true;
    return this.parseString(this.buffer, this.options);
  }
}

class CsvToJsonAsync extends Configurable {
  constructor() {
    super();
    this.parser = new CsvParser();
  }

  async parseFile(filePath, options = {}) {
    if (typeof filePath !== 'string') {
      throw new InputValidationError('filePath', filePath, typeof filePath, 'string');
    }

    let contents;
    try {
      contents = await fs.promises.readFile(filePath, options.encoding || 'utf8');
    } catch (error) {
      throw new FileOperationError('read', filePath, error);
    }
    return this.parseString(contents, options);
  }

  async parseString(input, options = {}) {
    if (typeof input !== 'string') {
      throw new InputValidationError('csv', input, typeof input, 'string');
    }
    return this.parser.parseString(input, { ...this.options, ...options });
  }

  async parseStream(stream, options = {}) {
    const processor = new StreamProcessor(this.parser, { ...this.options, ...options });
    return processor.parseStream(stream);
  }

  async fromString(input, options = {}) {
    return this.parseString(input, options);
  }

  async fromFile(filePath, options = {}) {
    return this.parseFile(filePath, options);
  }

  async fromStream(stream, options = {}) {
    return this.parseStream(stream, options);
  }
}

module.exports = new CsvToJsonAsync();
