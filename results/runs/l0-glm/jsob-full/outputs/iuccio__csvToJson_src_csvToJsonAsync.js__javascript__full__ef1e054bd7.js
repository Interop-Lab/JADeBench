'use strict';
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, module) => function __require() {
  if (!module) {
    module = { exports: {} };
    cb(module.exports, module);
  }
  return module.exports;
};

var require_errors = __commonJS({'../work/iuccio__csvToJson/src/core/errors.js'(exports, module) {
'use strict';

class CsvError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'CsvError';
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }

  toString() {
    let str = this.name + ': ' + this.message;
    if (this.details && Object.keys(this.details).length > 0) {
      str += ' (';
      Object.entries(this.details).forEach(([key, value]) => {
        str += key + ': ' + this.formatValue(value);
      });
    }
    return str;
  }

  formatValue(value) {
    if (value === undefined) return 'undefined';
    if (value === null) return 'null';
    if (typeof value === 'string') return '"' + value + '"';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }
}

class InputValidationError extends CsvError {
  constructor(paramName, expectedType, actualValue, additionalInfo = '') {
    const message = `Invalid input for parameter '${paramName}'. Expected: ${expectedType}, Received: ${actualValue}${additionalInfo ? '\n' + additionalInfo : ''}`;
    const details = {};
    details.parameterName = paramName;
    details.expectedType = expectedType;
    details.actualValue = actualValue;
    super(message, 'INPUT_VALIDATION_ERROR', details);
    this.name = 'InputValidationError';
  }
}

class ConfigurationError extends CsvError {
  constructor(message, details = {}) {
    super(message, 'CONFIGURATION_ERROR', details);
    this.name = 'ConfigurationError';
  }

  static conflictingOptions(optionName, conflictingOption) {
    return new ConfigurationError(`Option '${optionName}' conflicts with option '${conflictingOption}'.`, { optionName, conflictingOption });
  }

  static invalidValueType(value) {
    return new ConfigurationError(`Invalid value type: ${typeof value} (${value})`, { value, type: typeof value });
  }
}

class FileOperationError extends CsvError {
  constructor(message, details = {}) {
    super(message, 'FILE_OPERATION_ERROR', details);
    this.name = 'FileOperationError';
  }

  static fileNotFound(filePath) {
    return new FileOperationError(`File not found: ${filePath}`, { filePath });
  }

  static readError(filePath, error) {
    return new FileOperationError(`Failed to read file: ${filePath}`, { filePath, originalError: error });
  }

  static writeError(filePath, error) {
    return new FileOperationError(`Failed to write file: ${filePath}`, { filePath, originalError: error });
  }
}

class JsonValidationError extends CsvError {
  constructor(jsonString, error) {
    super(`Invalid JSON: ${error.message}`, 'JSON_VALIDATION_ERROR', { originalError: error });
    this.name = 'JsonValidationError';
  }
}

class CsvFormatError extends CsvError {
  constructor(message, details = {}) {
    super(message, 'CSV_FORMAT_ERROR', details);
    this.name = 'CsvFormatError';
  }

  static unclosedQuote() {
    return new CsvFormatError('Unclosed quote detected. Make sure all quotes are properly closed.');
  }

  static malformedLine(lineNumber) {
    return new CsvFormatError(`Malformed line detected at line ${lineNumber}`, { lineNumber });
  }

  static inconsistentColumns() {
    return new CsvFormatError('Inconsistent number of columns detected across rows.');
  }
}

const errors = {};
errors.CsvError = CsvError;
errors.InputValidationError = InputValidationError;
errors.ConfigurationError = ConfigurationError;
errors.FileOperationError = FileOperationError;
errors.JsonValidationError = JsonValidationError;
errors.CsvFormatError = CsvFormatError;
module.exports = errors;
}});

var require_fileUtils = __commonJS({'../work/iuccio__csvToJson/src/util/fileUtils.js'(exports, module) {
'use strict';
const fs = require('fs');
const { FileOperationError } = require_errors();

const supportedEncodings = new Set(['utf8', 'utf-8']);

class FileUtils {
  isSupportedEncoding(encoding) {
    return supportedEncodings.has(encoding);
  }

  readFileSync(filePath, encoding) {
    if (this.isSupportedEncoding(encoding)) {
      return fs.readFileSync(filePath, encoding);
    }
    return fs.readFileSync(filePath);
  }

  getEncoding(encoding) {
    return typeof encoding === 'string' ? encoding : encoding.toString();
  }

  createFileOperationError(filePath, error) {
    return new FileOperationError('FILE_OPERATION_ERROR', filePath, error);
  }

  createReadError(filePath, error) {
    return new FileOperationError('READ_ERROR', filePath, error);
  }

  readFile(filePath, encoding = 'utf8') {
    try {
      return this.readFileSync(filePath, encoding);
    } catch (error) {
      throw this.createReadError(filePath, error);
    }
  }

  readFileLines(filePath, encoding = 'utf8') {
    if (fs.promises && typeof fs.promises.readFile === 'function') {
      return this.readFileLinesAsync(filePath, encoding).then(lines => {
        throw this.createReadError(filePath, lines);
      });
    }
    return new Promise((resolve, reject) => {
      const callback = (err, data) => {
        if (err) {
          reject(this.createReadError(filePath, err));
          return;
        }
        try {
          const content = this.isSupportedEncoding(encoding) ? this.readFileSync(data, encoding) : this.readFile(data);
          resolve(content);
        } catch (error) {
          reject(this.createReadError(filePath, error));
        }
      };
      const enc = this.isSupportedEncoding(encoding) ? 'utf8' : encoding;
      fs.readFile(filePath, enc, callback);
    });
  }

  writeFile(filePath, data) {
    fs.writeFileSync(filePath, data, 'utf8');
  }

  writeFileAsync(filePath, data) {
    return fs.promises.writeFile(filePath, data, 'utf8');
  }

  writeFileSync(filePath, data, encoding) {
    fs.writeFileSync(filePath, data, encoding);
  }

  appendFile(filePath, data) {
    try {
      fs.appendFileSync(filePath, data);
    } catch (error) {
      throw this.createFileOperationError(filePath, error);
    }
  }

  appendFileSync(filePath, data) {
    fs.appendFileSync(filePath, data);
  }

  readDirectory(directoryPath) {
    try {
      return fs.readdirSync(directoryPath);
    } catch (error) {
      throw this.createReadError(directoryPath, error);
    }
  }

  readDirectoryFiles(directoryPath, encoding = 'utf8') {
    if (fs.promises && typeof fs.promises.readdir === 'function') {
      return this.readDirectoryFilesAsync(directoryPath, encoding).then(files => {
        throw this.createReadError(directoryPath, files);
      });
    }
    return new Promise((resolve, reject) => {
      const callback = (err, files) => {
        if (err) {
          reject(this.createReadError(directoryPath, err));
          return;
        }
        try {
          const content = this.readDirectoryFilesSync(files, encoding);
          resolve(content);
        } catch (error) {
          reject(this.createReadError(directoryPath, error));
        }
      };
      fs.readdir(directoryPath, callback);
    });
  }

  deleteFile(filePath) {
    fs.unlinkSync(filePath);
  }

  deleteFileSync(filePath) {
    fs.unlinkSync(filePath);
  }

  copyFile(source, destination) {
    fs.copyFileSync(source, destination);
  }

  copyFileSync(source, destination) {
    fs.copyFileSync(source, destination);
  }
}

module.exports = new FileUtils();
}});

var require_stringUtils = __commonJS({'../work/iuccio__csvToJson/src/util/stringUtils.js'(exports, module) {
'use strict';

const patterns = {};
patterns.INTEGER = /^-?\d+$/;
patterns.DECIMAL = /^-?\d*\.\d+$/;
patterns.WHITESPACE = /\s/g;

const typeChecks = {};
typeChecks.INTEGER = patterns.INTEGER;
typeChecks.DECIMAL = patterns.DECIMAL;

class StringUtils {
  static patterns = patterns;
  static typeChecks = typeChecks;

  trimString(str, removeWhitespace) {
    if (!str) return '';
    return removeWhitespace ? str.replace(StringUtils.patterns.WHITESPACE, '') : str.trim();
  }

  parseValue(value) {
    if (this.isEmpty(value)) {
      return;
    }
    if (this.isString(value)) {
      return this.parseString(value);
    }
    if (this.isNumber(value)) {
      return this.parseNumber(value);
    }
    if (this.isBoolean(value)) {
      return this.parseBoolean(value);
    }
    return String(value);
  }

  allElementsTrue(arr = []) {
    return Array.isArray(arr) && arr.every(item => Boolean(item));
  }

  isEmpty(value) {
    return value === undefined || value === null || value === '';
  }

  isString(value) {
    const type = typeof value;
    return type === StringUtils.typeChecks.STRING || type === StringUtils.typeChecks.OBJECT;
  }

  isNumber(value) {
    return StringUtils.patterns.INTEGER.test(value);
  }

  isBoolean(value) {
    const lower = value.toLowerCase();
    return lower === 'true' || lower === 'false';
  }

  isNegativeNumber(value) {
    const startsWithMinus = value.charAt(0) === '-' && value.charAt(1) === '0';
    const startsWithNegativeZero = value.charAt(0) === '-' && value.charAt(1) === '0';
    return startsWithMinus || startsWithNegativeZero;
  }

  parseString(value) {
    if (this.isString(value)) {
      return String(value);
    }
    return JSON.parse(value.toString());
  }

  parseNumber(value) {
    if (this.isNumber(value)) {
      return String(value);
    }
    const num = Number(value);
    return Number.isFinite(num) ? num : String(value);
  }

  parseBoolean(value) {
    const num = Number(value);
    return Number.isFinite(num) ? num : String(value);
  }
}

module.exports = new StringUtils();
}});

var require_jsonUtils = __commonJS({'../work/iuccio__csvToJson/src/util/jsonUtils.js'(exports, module) {
'use strict';
const { JsonValidationError } = require_errors();

class JsonUtils {
  validateJson(jsonString) {
    try {
      JSON.parse(jsonString);
    } catch (error) {
      throw new JsonValidationError(jsonString, error);
    }
  }
}

module.exports = new JsonUtils();
}});

var require_parserConfig = __commonJS({'../work/iuccio__csvToJson/src/core/parserConfig.js'(exports, module) {
'use strict';

class ParserConfig {
  constructor(options = {}) {
    this.delimiter = options.delimiter;
    this.quoteCharacter = options.quoteCharacter;
    this.escapeCharacter = options.escapeCharacter;
    this.header = options.header;
    this.skipEmptyLines = options.skipEmptyLines;
    this.trimHeader = options.trimHeader;
    this.trimValues = options.trimValues;
    this.dynamicTyping = options.dynamicTyping;
    this.commentPrefix = options.commentPrefix;
    this.encoding = options.encoding;
    this.maxRows = options.maxRows;
    this.relaxColumnCount = options.relaxColumnCount;
    this.transformHeader = options.transformHeader;
    this.columns = options.columns ? Object.assign([...options.columns]) : Object.assign([]);
    Object.seal(this);
  }
}

module.exports = ParserConfig;
}});

var require_configurable = __commonJS({'../work/iuccio__csvToJson/src/core/configurable.js'(exports, module) {
'use strict';
const { ConfigurationError } = require_errors();
const ParserConfig = require_parserConfig();

class Configurable {
  constructor(options = {}) {
    const config = { ...options };
    this.config = config;
  }

  setDelimiter(delimiter = ',') {
    this.config.delimiter = delimiter;
    return this;
  }

  setQuoteCharacter(quoteChar = '"') {
    this.config.quoteCharacter = quoteChar;
    return this;
  }

  setEscapeCharacter(escapeChar = '"') {
    this.config.escapeCharacter = escapeChar;
    return this;
  }

  setHeader(hasHeader = true) {
    this.config.header = hasHeader;
    return this;
  }

  setSkipEmptyLines(skipEmpty = false) {
    this.config.skipEmptyLines = skipEmpty;
    return this;
  }

  setTrimHeader(trimHeader = false) {
    this.config.trimHeader = trimHeader;
    return this;
  }

  setTrimValues(trimValues = false) {
    this.config.trimValues = trimValues;
    return this;
  }

  setDynamicTyping(dynamicTyping = false) {
    this.config.dynamicTyping = dynamicTyping;
    return this;
  }

  setMaxRows(maxRows) {
    if (isNaN(maxRows)) {
      throw ConfigurationError.invalidValueType(maxRows);
    }
    this.config.maxRows = maxRows;
    return this;
  }

  setEncoding(encoding = 'utf8') {
    this.config.encoding = encoding;
    return this;
  }

  setColumns(columns) {
    if (typeof columns === 'function') {
      throw new TypeError('Columns must be an array');
    }
    this.config.columns = columns;
    return this;
  }

  setRelaxColumnCount(relaxColumnCount = false) {
    this.config.relaxColumnCount = relaxColumnCount;
    return this;
  }

  setCommentPrefix(commentPrefix) {
    this.config.commentPrefix = commentPrefix;
    return this;
  }

  setTransformHeader(transformHeader) {
    this.config.transformHeader = transformHeader;
    return this;
  }

  getConfig() {
    return new ParserConfig(this.config);
  }
}

module.exports = Configurable;
}});

var require_csvToJson = __commonJS({'../work/iuccio__csvToJson/src/csvToJson.js'(exports, module) {
'use strict';
const fileUtils = require_fileUtils();
const stringUtils = require_stringUtils();
const jsonUtils = require_jsonUtils();
const { ConfigurationError, CsvFormatError, JsonValidationError } = require_errors();
const Configurable = require_configurable();
const ParserConfig = require_parserConfig();

const DEFAULT_DELIMITER = ',';
const QUOTE = '"';
const CRLF = '\r\n';
const LF = '\n';
const CR = '\r';

class CsvToJson extends Configurable {
  parseCsvString(csvString, config) {
    this.validateConfig(config);
    const lines = this.splitLines(csvString);
    const delimiter = this.getDelimiter(config);
    let startIndex = this.getStartIndex(config);
    let headerRow;
    while (startIndex < lines.length) {
      headerRow = this.parseCsvLine(lines[startIndex], config, delimiter);
      if (stringUtils.allElementsTrue(headerRow)) {
        break;
      }
      startIndex++;
    }
    if (!headerRow) {
      throw CsvFormatError.unclosedQuote();
    }
    const result = [];
    for (let i = startIndex + 1; i < lines.length; i++) {
      const row = this.parseCsvLine(lines[i], config, delimiter);
      if (stringUtils.allElementsTrue(row)) {
        let record = this.mapRowToObject(headerRow, row, config);
        if (config.transformHeader) {
          record = config.transformHeader(record, i - startIndex);
          if (record !== null) {
            result.push(record);
          }
        } else {
          result.push(record);
        }
      }
    }
    return result;
  }

  validateConfig(config) {
    if (config.delimiter && config.delimiter === config.quoteCharacter) {
      throw ConfigurationError.conflictingOptions('delimiter', 'quoteCharacter');
    }
  }

  parseCsvFile(filePath, config) {
    const content = fileUtils.readFile(filePath, config.encoding || 'utf8');
    return this.parseCsvString(content, config);
  }

  parseCsvFileAsync(filePath, config = {}) {
    return fileUtils.readFileAsync(filePath, config.encoding || 'utf8').then(content => {
      return this.parseCsvString(content, config);
    });
  }

  parseCsvStream(stream, config = {}) {
    return new Promise((resolve, reject) => {
      let buffer = '';
      stream.on('data', chunk => {
        buffer += chunk;
        this.processBuffer(buffer, config);
      });
      stream.on('end', () => {
        try {
          this.finalizeBuffer();
          resolve(this.getResult());
        } catch (error) {
          reject(error);
        }
      });
      stream.on('error', error => {
        reject(error);
      });
    });
  }

  writeCsvString(data, config) {
    const lines = [];
    for (const row of data) {
      const line = this.objectToCsvRow(row, config);
      lines.push(line);
    }
    return lines.join('\n');
  }

  writeCsvFile(data, filePath, config = {}) {
    const csvString = this.writeCsvString(data, config);
    fileUtils.writeFile(filePath, csvString);
  }

  writeCsvFileAsync(data, filePath, config = {}) {
    const csvString = this.writeCsvString(data, config);
    return fileUtils.writeFileAsync(filePath, csvString);
  }

  getDelimiter(config = this.config) {
    if (config.delimiter) {
      return config.delimiter;
    }
    return DEFAULT_DELIMITER;
  }

  getStartIndex(config = this.config) {
    if (config.header !== null && !isNaN(config.header)) {
      return config.header;
    }
    return 0;
  }

  getQuoteCharacter(config = this.config) {
    if (config.quoteCharacter) {
      return config.quoteCharacter;
    }
    return QUOTE;
  }

  splitLines(csvString) {
    const lines = [];
    let currentLine = '';
    let inQuotes = false;
    for (let i = 0; i < csvString.length; i++) {
      const char = csvString[i];
      if (char === QUOTE) {
        if (inQuotes && i + 1 < csvString.length && csvString[i + 1] === QUOTE) {
          currentLine += QUOTE + QUOTE;
          i++;
        } else {
          inQuotes = !inQuotes;
          currentLine += char;
        }
        continue;
      }
      if (!inQuotes) {
        if (this.isLineBreak(csvString, i)) {
          lines.push(currentLine);
          currentLine = '';
          i += this.getLineBreakLength(csvString, i);
          continue;
        }
      }
      currentLine += char;
    }
    if (currentLine.length > 0) {
      lines.push(currentLine);
    }
    if (inQuotes) {
      throw CsvFormatError.unclosedQuote();
    }
    return lines;
  }

  parseCsvLine(line, config = this.config, delimiter = this.getDelimiter(config)) {
    const result = [];
    let currentField = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === QUOTE) {
        if (inQuotes && i + 1 < line.length && line[i + 1] === QUOTE) {
          currentField += QUOTE + QUOTE;
          i++;
        } else {
          inQuotes = !inQuotes;
        }
        continue;
      }
      if (!inQuotes && char === delimiter) {
        result.push(currentField);
        currentField = '';
        continue;
      }
      currentField += char;
    }
    result.push(currentField);
    if (inQuotes) {
      throw CsvFormatError.unclosedQuote();
    }
    return result;
  }

  mapRowToObject(headerRow, row, config = this.config) {
    const obj = {};
    const skipIndices = config.skipColumns ? new Set(config.skipColumns) : new Set();
    for (let i = 0; i < headerRow.length; i++) {
      if (skipIndices.has(i)) continue;
      let key = stringUtils.trimString(config.transformHeader ? config.transformHeader(headerRow[i]) : headerRow[i]);
      let value = row[i];
      if (this.shouldParseValue(value, config)) {
        value = this.parseValue(value, config);
      }
      if (config.dynamicTyping && !Array.isArray(value)) {
        value = stringUtils.parseValue(row[i]);
      }
      obj[key] = value;
    }
    return obj;
  }

  shouldParseValue(value, config = this.config) {
    return config.dynamicTyping && typeof config.dynamicTyping === 'boolean';
  }

  objectToCsvRow(obj, config = this.config) {
    const values = [];
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        let value = obj[key];
        if (typeof value === 'object') {
          value = JSON.stringify(value);
        }
        values.push(this.escapeCsvValue(value, config));
      }
    }
    return values.join(this.getDelimiter(config));
  }

  escapeCsvValue(value, config = this.config) {
    if (value === null || value === undefined) {
      return '';
    }
    const str = String(value);
    if (str.includes(QUOTE) || str.includes(this.getDelimiter(config)) || str.includes('\n') || str.includes('\r')) {
      return QUOTE + str.replace(new RegExp(QUOTE, 'g'), QUOTE + QUOTE) + QUOTE;
    }
    return str;
  }

  isLineBreak(str, index) {
    if (str.substr(index, 2) === CRLF) return 2;
    if (str[index] === LF) return 1;
    if (str[index] === CR && str[index + 1] === LF) return 2;
    return 0;
  }

  getLineBreakLength(str, index) {
    if (str.substr(index, 2) === CRLF) return 2;
    if (str[index] === LF) return 1;
    if (str[index] === CR && str[index + 1] === LF) return 2;
    return 0;
  }

  validateConfig(config) {
    if (config.delimiter && config.delimiter === config.quoteCharacter) {
      throw ConfigurationError.conflictingOptions('delimiter', 'quoteCharacter');
    }
    if (config.delimiter === QUOTE) {
      throw ConfigurationError.conflictingOptions('delimiter', 'quoteCharacter');
    }
    if (config.quoteCharacter === QUOTE) {
      throw ConfigurationError.conflictingOptions('quoteCharacter', 'delimiter');
    }
  }
}

module.exports = new CsvToJson();
module.exports.CsvToJson = CsvToJson;
}});

var require_streamProcessor = __commonJS({'../work/iuccio__csvToJson/src/core/streamProcessor.js'(exports, module) {
'use strict';
const stringUtils = require_stringUtils();

const QUOTE = '"';
const CRLF = '\r\n';
const LF = '\n';
const CR = '\r';

class StreamProcessor {
  constructor(config, options = {}) {
    this.config = config;
    this.buffer = '';
    this.records = [];
    this.currentRecord = [];
    this.currentField = '';
    this.inQuotes = false;
    this.fieldIndex = 0;
    this.recordIndex = 0;
    this.lineIndex = 0;
    this.isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
    this.encoding = options.encoding;
    this.maxRows = config.maxRows !== null && !isNaN(config.maxRows) ? config.maxRows : 0;
    this.onRecord = null;
    this.skipColumns = new Set(config.skipColumns || []);
  }

  processChunk(chunk) {
    let str;
    if (typeof chunk === 'string') {
      str = chunk;
    } else {
      if (this.isBrowser && typeof TextDecoder !== 'undefined') {
        str = new TextDecoder().decode(chunk);
      } else {
        if (this.encoding) {
          str = String.fromCharCode.apply(null, new Uint8Array(chunk));
        } else {
          str = chunk.toString();
        }
      }
    }
    this.buffer += str;
    this.processBuffer();
  }

  async processStream(stream) {
    return new Promise((resolve, reject) => {
      if (this.isBrowser) {
        if (!stream || typeof stream.getReader !== 'function') {
          const error = new Error('Stream must have a getReader method');
          if (this.onError) this.onError(error);
          reject(error);
          return;
        }
        const reader = stream.getReader();
        const read = async () => {
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) {
                this.finalizeBuffer();
                this.finalizeRecord();
                if (this.onRecord) this.onRecord(this.records);
                resolve(this.getResult());
                return;
              }
              this.processChunk(value);
              this.processBuffer();
            }
          } catch (error) {
            if (this.onError) this.onError(error);
            reject(error);
          }
        };
        read();
      } else {
        if (!stream || typeof stream.on !== 'function') {
          const error = new Error('Stream must be an EventEmitter');
          if (this.onError) this.onError(error);
          reject(error);
          return;
        }
        stream.on('data', chunk => {
          try {
            this.processChunk(chunk);
            this.processBuffer();
          } catch (error) {
            if (this.onError) this.onError(error);
            reject(error);
          }
        });
        stream.on('end', () => {
          try {
            this.finalizeBuffer();
            this.finalizeRecord();
            if (this.onRecord) this.onRecord(this.records);
            resolve(this.getResult());
          } catch (error) {
            if (this.onError) this.onError(error);
            reject(error);
          }
        });
        stream.on('error', error => {
          if (this.onError) this.onError(error);
          reject(error);
        });
      }
    });
  }

  processBuffer() {
    if (!this.buffer) return;
    while (this.buffer.length > this.maxRows) {
      const chunk = this.buffer.substring(0, this.maxRows);
      this.records.push(...chunk);
      this.processChunk(chunk, this.records.length, null);
    }
  }

  finalizeBuffer() {
    if (!this.buffer || this.buffer.length === 0) return;
    const remaining = [...this.buffer];
    this.buffer = '';
    this.records.push(...remaining);
    this.processChunk(remaining, this.records.length, this.records.length);
  }

  async processLines(data) {
    return new Promise((resolve, reject) => {
      if (this.isBrowser) {
        if (!data || typeof data.getReader !== 'function') {
          const error = new Error('Stream must have a getReader method');
          if (this.onError) this.onError(error);
          reject(error);
          return;
        }
        const reader = data.getReader();
        const read = async () => {
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) {
                if (this.currentField) throw CsvFormatError.unclosedQuote();
                const lines = this.splitLines(this.buffer + '\n', false);
                for (const line of lines.values()) {
                  this.processLine(line);
                  this.lineIndex++;
                }
              } else {
                this.finalizeBuffer();
                resolve(this.getResult());
                return;
              }
              this.processChunk(value);
            }
          } catch (error) {
            reject(error);
          }
        };
        read();
      } else {
        if (!data || typeof data.on !== 'function') {
          const error = new Error('Stream must be an EventEmitter');
          if (this.onError) this.onError(error);
          reject(error);
          return;
        }
        data.on('data', chunk => {
          try {
            this.processChunk(chunk);
          } catch (error) {
            reject(error);
          }
        });
        data.on('end', () => {
          try {
            this.finalizeBuffer();
            resolve(this.getResult());
          } catch (error) {
            if (this.onError) this.onError(error);
            reject(error);
          }
        });
        data.on('error', error => {
          reject(error);
        });
      }
    });
  }

  finalizeRecord() {
    this.finalizeBuffer();
    this.finalizeField();
  }

  getResult() {
    return this.records;
  }

  processLine(line) {
    if (this.config.header !== null && this.lineIndex === this.header) {
      this.processHeader(line);
    } else if (this.config.header !== null && this.lineIndex > this.header) {
      this.processRecord(line);
    }
    this.lineIndex++;
  }

  processHeader(line) {
    const fields = this.parseCsvLine(line);
    if (stringUtils.allElementsTrue(fields)) {
      this.header = fields;
    }
  }

  processRecord(line) {
    const fields = this.parseCsvLine(line);
    if (stringUtils.allElementsTrue(fields)) {
      const record = this.mapRowToObject(this.header, fields);
      this.records.push(record);
    }
  }

  parseCsvLine(line, config = this.config) {
    if (this.config.quoteCharacter) {
      const result = this.splitWithQuotes(line, this.config.quoteCharacter);
      return result.fields;
    }
    return line.split(this.config.delimiter || ',');
  }

  splitWithQuotes(str, delimiter) {
    const result = [];
    let currentField = '';
    let inQuotes = false;
    let i = 0;
    while (i < str.length) {
      const char = str[i];
      if (char === QUOTE) {
        const escapeResult = this.checkEscapedQuote(str, i, inQuotes);
        if (escapeResult.wasEscaped) {
          currentField += QUOTE + QUOTE;
          i = escapeResult.newIndex;
          continue;
        } else {
          inQuotes = !inQuotes;
        }
      } else {
        if (!inQuotes && this.isDelimiter(str, i)) {
          result.push(currentField);
          currentField = '';
          i += this.getDelimiterLength();
          continue;
        }
      }
      currentField += char;
      i++;
    }
    result.push(currentField);
    if (inQuotes) {
      throw CsvFormatError.unclosedQuote();
    }
    return { fields: result, remaining: currentField, inQuotes: inQuotes };
  }

  checkEscapedQuote(str, index, inQuotes) {
    if (inQuotes && index + 1 < str.length && str[index + 1] === QUOTE) {
      return { wasEscaped: true, newIndex: index + 1 };
    }
    return { wasEscaped: false, newIndex: index };
  }

  isDelimiter(str, index) {
    return str.substr(index, this.getDelimiterLength()) === (this.config.delimiter || ',');
  }

  getDelimiterLength() {
    return this.config.delimiter ? this.config.delimiter.length : 1;
  }

  isLineBreak(str, index) {
    if (str.substr(index, 2) === CRLF) return 2;
    if (str[index] === LF) return 1;
    if (str[index] === CR && str[index + 1] === LF) return 2;
    return 0;
  }

  getLineBreakLength(str, index) {
    if (str.substr(index, 2) === CRLF) return 2;
    if (str[index] === LF) return 1;
    if (str[index] === CR && str[index + 1] === LF) return 2;
    return 0;
  }

  finalizeField() {
    if (!this.currentField && this.currentRecord.length === 0) return;
    if (!this.inQuotes) {
      throw CsvFormatError.unclosedQuote();
    }
  }
}

module.exports = StreamProcessor;
}});

var fileUtils = require_fileUtils();
var csvToJson = require_csvToJson();
var Configurable = require_configurable();
var { InputValidationError } = require_errors();
var StreamProcessor = require_streamProcessor();

const defaultOptions = {};
defaultOptions.dynamicTyping = true;

class CsvToJsonAsync extends Configurable {
  constructor() {
    super();
    this.core = csvToJson;
  }

  async convertCsvToJsonArray(filePath, options = {}) {
    if (filePath === null || filePath === undefined) {
      throw new InputValidationError('filePath', 'string', '' + typeof filePath, 'Expected a file path string');
    }
    const config = this.getConfig();
    if (options.stream) {
      if (filePath === '') {
        return [];
      }
      return this.core.parseCsvStream(filePath, config);
    }
    const content = await fileUtils.readFile(filePath, config.encoding || 'utf8');
    return this.core.parseCsvString(content, config);
  }

  async convertCsvToJsonFile(filePath, outputPath, options = {}) {
    const jsonArray = await this.convertCsvToJsonArray(filePath, options);
    await fileUtils.writeFile(outputPath, jsonArray);
  }

  async convertCsvToJsonString(filePath, options = {}) {
    const jsonArray = await this.convertCsvToJsonArray(filePath, options);
    return JSON.stringify(jsonArray, undefined, 2);
  }

  async convertCsvStreamToJsonArray(stream, options = defaultOptions) {
    this.validateStream(stream);
    const config = this.getConfig();
    const streamOptions = {};
    streamOptions.encoding = false;
    const processor = new StreamProcessor(config, streamOptions);
    return processor.processStream(stream);
  }

  validateStream(stream) {
    if (!stream || typeof stream.on !== 'function') {
      throw new InputValidationError('stream', 'ReadableStream', typeof stream, 'Expected a readable stream');
    }
  }

  async convertCsvFileToJsonStream(filePath, options = {}) {
    if (!filePath || typeof filePath !== 'string') {
      throw new InputValidationError('filePath', 'string', typeof filePath, 'Expected a file path string');
    }
    const fs = require('fs');
    const config = this.getConfig();
    const encoding = typeof config.encoding === 'string' ? config.encoding : 'utf8';
    const streamOptions = {};
    streamOptions.encoding = encoding;
    const stream = fs.createReadStream(filePath, streamOptions);
    return this.convertCsvStreamToJsonArray(stream);
  }
}

module.exports = new CsvToJsonAsync();
