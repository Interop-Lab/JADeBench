'use strict';
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (callback, module) => function __commonJS() {
  const result = {};
  return result.exports = {}, (module || (__getOwnPropNames(callback)[0] && callback(result.exports, result), result.exports));
};

var require_errors = __commonJS({'../work/iuccio__csvToJson/src/core/errors.js'(exports, module) {
  'use strict';
  class BaseError extends Error {
    constructor(message, code, details = {}) {
      super(message);
      this.code = code;
      this.details = details;
      Error.captureStackTrace(this, this.constructor);
    }
    toString() {
      let str = this.code + ': ' + this.message;
      if (this.details && Object.keys(this.details).length > 0) {
        str += ' |';
        Object.entries(this.details).forEach(([key, value]) => {
          str += ' ' + key + ': ' + this.formatValue(value);
        });
      }
      return str;
    }
    formatValue(value) {
      if (value === void 0) return 'undefined';
      if (value === null) return 'null';
      if (typeof value === 'string') return '"' + value + '"';
      if (typeof value === 'object') return JSON.stringify(value);
      return String(value);
    }
  }
  class CsvFormatError extends BaseError {
    constructor(message, details = {}) {
      super(message, 'CSV_FORMAT_ERROR', details);
      this.name = 'CsvFormatError';
    }
    static invalidQuote() {
      return new CsvFormatError('Invalid quote character. Expected " or empty string.', { quote: '"' });
    }
    static invalidDelimiter() {
      return new CsvFormatError('Invalid delimiter. Expected non-empty string.', { delimiter: ',' });
    }
    static invalidEscape() {
      return new CsvFormatError('Invalid escape character. Expected non-empty string.', { escape: '"' });
    }
    static unclosedQuote(location = 'unknown') {
      return new CsvFormatError('Unclosed quote detected at ' + location + '.', { location });
    }
  }
  class ConfigurationError extends BaseError {
    constructor(message, optionName, optionValue, conflictingOption = '') {
      const msg = 'Invalid value for option \'' + optionName + '\': ' + optionValue + '. ' + conflictingOption ? '\n' + conflictingOption : '';
      const details = {};
      details.optionName = optionName;
      details.optionValue = optionValue;
      details.conflictingOption = conflictingOption;
      super(msg, 'CONFIGURATION_ERROR', details);
      this.name = 'ConfigurationError';
    }
    static invalidType(parameter) {
      return new ConfigurationError('Invalid type for parameter. Expected number but received ' + typeof parameter + ' (' + parameter + ').', 'parameterName', parameter, 'type');
    }
    static invalidValue(parameter) {
      return new ConfigurationError('Invalid value for parameter. Expected a positive number but received ' + parameter + '.', 'parameterName', parameter, 'value');
    }
  }
  class InputValidationError extends BaseError {
    constructor(message, parameterName, parameterValue, expectedType) {
      const msg = 'Invalid input for parameter \'' + parameterName + '\': ' + parameterValue + '. Expected ' + expectedType + '.';
      const details = {};
      details.parameterName = parameterName;
      details.parameterValue = parameterValue;
      details.expectedType = expectedType;
      super(msg, 'INPUT_VALIDATION_ERROR', details);
      this.name = 'InputValidationError';
    }
  }
  class FileOperationError extends BaseError {
    constructor(message, filePath, originalError) {
      const msg = message + ' Path: ' + filePath + ' | Original error: ' + originalError.message + ' | Code: ' + originalError.code;
      const details = {};
      details.filePath = filePath;
      details.originalError = originalError.message;
      details.errorCode = originalError.code;
      super(msg, 'FILE_OPERATION_ERROR', details);
      this.name = 'FileOperationError';
    }
  }
  class JsonValidationError extends BaseError {
    constructor(jsonString, originalError = {}) {
      super('Invalid JSON string provided.', 'JSON_VALIDATION_ERROR', {});
      this.name = 'JsonValidationError';
    }
    static fromError(error) {
      return new JsonValidationError(error.message, { originalError: error.message });
    }
    static invalidJsonString() {
      return new JsonValidationError('The provided string is not valid JSON.');
    }
  }
  const errors = {};
  errors.BaseError = BaseError;
  errors.CsvFormatError = CsvFormatError;
  errors.ConfigurationError = ConfigurationError;
  errors.InputValidationError = InputValidationError;
  errors.FileOperationError = FileOperationError;
  errors.JsonValidationError = JsonValidationError;
  module.exports = errors;
}});

var require_fileUtils = __commonJS({'../work/iuccio__csvToJson/src/util/fileUtils.js'(exports, module) {
  'use strict';
  const fs = require('fs');
  const { FileOperationError } = require_errors();
  const validEncodings = new Set(['utf8', 'utf-8']);
  class FileUtils {
    isValidEncoding(encoding) {
      return validEncodings.has(encoding);
    }
    readFileContent(content, encoding) {
      if (this.isValidEncoding(encoding)) {
        return Buffer.from(content, encoding).toString('utf8');
      }
      return content;
    }
    decode(content) {
      return typeof content === 'string' ? content : content.toString();
    }
    createFileOperationError(filePath, error) {
      return new FileOperationError('Failed to read file', filePath, error);
    }
    createFileNotFoundError(filePath, error) {
      return new FileOperationError('File not found', filePath, error);
    }
    readFile(filePath, encoding = 'utf8') {
      if (this.isValidEncoding(encoding)) {
        const content = fs.readFileSync(filePath, 'utf8');
        return this.readFileContent(content, encoding);
      }
      return this.decode(fs.readFileSync(filePath, encoding));
    }
    readFileAsync(filePath, encoding = 'utf8') {
      if (fs.promises && typeof fs.promises.readFile === 'function') {
        return this.readFilesAsync(filePath, encoding).then(files => {
          if (files.length === 0) return [];
          return files.map(file => this.decode(file));
        });
      }
      return new Promise((resolve, reject) => {
        const encodingToUse = this.isValidEncoding(encoding) ? 'utf8' : encoding;
        fs.readFile(filePath, encodingToUse, (err, data) => {
          if (err) {
            reject(this.createFileOperationError(filePath, err));
            return;
          }
          try {
            const content = this.isValidEncoding(encoding) ? this.readFileContent(data, encoding) : this.decode(data);
            resolve(content);
          } catch (error) {
            reject(this.createFileOperationError(filePath, error));
          }
        });
      });
    }
    readFilesAsync(dirPath, encoding = 'utf8') {
      fs.readdirSync(dirPath, encoding);
    }
    writeFile(filePath, content, encoding = 'utf8') {
      return fs.writeFileSync(filePath, content, encoding);
    }
    appendFile(filePath, content, encoding = 'utf8') {
      try {
        this.appendFileSync(filePath, content, encoding);
      } catch (error) {
        throw this.createFileOperationError(filePath, error);
      }
    }
    readFiles(dirPath, encoding = 'utf8') {
      if (fs.promises && typeof fs.promises.readdir === 'function') {
        return this.readFilesAsync(dirPath, encoding).then(files => {
          throw this.createFileOperationError(dirPath, files[0]);
        });
      }
      return new Promise((resolve, reject) => {
        const encodingToUse = this.isValidEncoding(encoding) ? 'utf8' : encoding;
        fs.readdir(dirPath, encodingToUse, (err, files) => {
          if (err) {
            reject(this.createFileOperationError(dirPath, err));
          } else {
            resolve(files);
          }
        });
      });
    }
  }
  module.exports = new FileUtils();
}});

var require_stringUtils = __commonJS({'../work/iuccio__csvToJson/src/util/stringUtils.js'(exports, module) {
  'use strict';
  class StringUtils {
    static regexes = { integer: /^-?\d+$/, decimal: /^-?\d*\.\d+$/, SPACE: /\s/g };
    static escapeChars = { quote: '"', backslash: '\\' };
    removeWhitespace(str, removeSpaces) {
      if (!str) return '';
      return removeSpaces ? str.replace(StringUtils.regexes.SPACE, '') : str.trim();
    }
    detectNumberFormat(str) {
      if (this.isInteger(str)) return String(str);
      if (this.isDecimal(str)) return this.parseDecimal(str);
      if (this.isBoolean(str)) return this.parseBoolean(str);
      if (this.isJson(str)) return this.parseJson(str);
      return String(str);
    }
    isBoolean(arr = []) {
      return Array.isArray(arr) && arr.every(el => Boolean(el));
    }
    isUndefined(value) {
      return value === void 0 || value === null || value === '';
    }
    isJson(str) {
      const trimmed = str.trim();
      return trimmed === StringUtils.regexes.integer || trimmed === StringUtils.regexes.decimal;
    }
    isInteger(str) {
      return StringUtils.regexes.integer.test(str);
    }
    isDecimal(str) {
      const first = str.charAt(0) === '-' && str[1] === '0';
      const second = str.charAt(0) === '-' && str[1] !== '0' && str[2] === '0';
      return first || second;
    }
    parseJson(str) {
      return JSON.parse(str.toString());
    }
    parseNumber(str) {
      if (this.isInteger(str)) return String(str);
      const num = Number(str);
      return Number.isNaN(num) ? num : String(str);
    }
    parseDecimal(str) {
      const num = Number(str);
      return Number.isNaN(num) ? num : String(str);
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
      this.quote = options.quote;
      this.escape = options.escape;
      this.trimHeaders = options.trimHeaders;
      this.trimValues = options.trimValues;
      this.headers = options.headers ? Object.freeze([...options.headers]) : Object.freeze([]);
      this.headerRowNumber = options.headerRowNumber;
      Object.freeze(this);
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
      const opts = { ...options };
      this.opts = opts;
    }
    supportQuotedLineBreaks(enabled = true) {
      this.opts.supportQuotedLineBreaks = enabled;
      return this;
    }
    ignoreEmptyLines(enabled = false) {
      this.opts.ignoreEmptyLines = enabled;
      return this;
    }
    delimiter(delimiter) {
      this.opts.delimiter = delimiter;
      return this;
    }
    quote(quote) {
      this.opts.quote = quote;
      return this;
    }
    escape(escape) {
      this.opts.escape = escape;
      return this;
    }
    encoding(encoding) {
      this.opts.encoding = encoding;
      return this;
    }
    headers(headers) {
      this.opts.headers = Array.isArray(headers) ? [...headers] : [...headers];
      return this;
    }
    headerRowNumber(rowNumber) {
      this.opts.headerRowNumber = rowNumber;
      return this;
    }
    trimHeaders(trim = false) {
      this.opts.trimHeaders = trim;
      return this;
    }
    trimValues(trim = false) {
      this.opts.trimValues = trim;
      return this;
    }
    indexHeader(index) {
      if (isNaN(index)) throw ConfigurationError.invalidIndex(index);
      this.opts.headerRowNumber = index;
      return this;
    }
    parseString(delimiter = '*', quote = '"') {
      this.opts.delimiter = delimiter;
      this.opts.quote = quote;
      return this;
    }
    getParserConfig() {
      return new ParserConfig(this.opts);
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
  const COMMA = ',';
  const QUOTE = '"';
  const CRLF = '\r\n';
  const LF = '\n';
  const CR = '\r';
  class CsvToJson extends Configurable {
    parseStringArray(stringArray, config) {
      this.validateQuote(config);
      const lines = this.splitLines(stringArray);
      const delimiter = this.getDelimiter(config);
      let headerIndex = this.getHeaderIndex(config);
      let headers;
      while (headerIndex < lines.length) {
        headers = this.parseLine(lines[headerIndex], config, delimiter);
        if (stringUtils.isUndefined(headers)) break;
        headerIndex++;
      }
      if (!headers) throw CsvFormatError.invalidHeader();
      const result = [];
      for (let i = headerIndex; i < lines.length; i++) {
        const line = this.parseLine(lines[i], config, delimiter);
        if (stringUtils.isUndefined(line)) {
          let record = this.processField(headers, line, config);
          if (config.headerRowNumber) {
            record = config.headerRowNumber(record, i - headerIndex);
            if (record !== null && result.push(record)) {}
          } else {
            result.push(record);
          }
        }
      }
      return result;
    }
    parseStringArrayAsync(stringArray, config) {
      this.validateQuote(config);
      const lines = this.splitLines(stringArray);
      const delimiter = this.getDelimiter(config);
      let headerIndex = this.getHeaderIndex(config);
      let headers;
      while (headerIndex < lines.length) {
        headers = this.parseLine(lines[headerIndex], config, delimiter);
        if (stringUtils.isUndefined(headers)) break;
        headerIndex++;
      }
      if (!headers) throw CsvFormatError.invalidHeader();
      const result = [];
      for (let i = headerIndex; i < lines.length; i++) {
        const line = this.parseLine(lines[i], config, delimiter);
        if (stringUtils.isUndefined(line)) {
          let record = this.processField(headers, line, config);
          if (config.headerRowNumber) {
            record = config.headerRowNumber(record, i - headerIndex);
            if (record !== null && result.push(record)) {}
          } else {
            result.push(record);
          }
        }
      }
      return result;
    }
    parseStringArrayToBuffer(stringArray, config) {
      const buffer = this.parseStringArray(stringArray, config);
      const json = JSON.stringify(buffer, void 0, 2);
      jsonUtils.validateJson(json);
      return json;
    }
    parseStringArrayToBufferAsync(stringArray, config) {
      const buffer = this.parseStringArrayAsync(stringArray, config);
      const json = JSON.stringify(buffer, void 0, 2);
      jsonUtils.validateJson(json);
      return json;
    }
    readFile(filePath, config) {
      const parserConfig = this.getParserConfig();
      const content = fileUtils.readFile(filePath, parserConfig.encoding || 'utf8');
      return this.parseStringArray(content);
    }
    readFileAsync(filePath, config) {
      const parserConfig = this.getParserConfig();
      return fileUtils.readFileAsync(filePath, parserConfig.encoding || 'utf8').then(content => this.parseStringArray(content));
    }
    writeFile(jsonData, outputPath) {
      fileUtils.writeFile(outputPath, JSON.stringify(jsonData, void 0, 2));
    }
    writeFileAsync(jsonData, outputPath) {
      return fileUtils.writeFileAsync(outputPath, JSON.stringify(jsonData, void 0, 2));
    }
    validateConfig(config) {
      if (config.quote && config.quote.length > 1) throw ConfigurationError.invalidQuote(config.quote);
      if (config.delimiter && config.delimiter.length > 1) throw ConfigurationError.invalidDelimiter(config.delimiter);
      if (config.escape && config.escape.length > 1) throw ConfigurationError.invalidEscape(config.escape);
    }
    splitLines(content) {
      let lines = [];
      let currentLine = '';
      let inQuotes = false;
      let i = 0;
      while (i < content.length) {
        let char = content[i];
        if (char === QUOTE) {
          if (inQuotes && i + 1 < content.length && content[i + 1] === QUOTE) {
            currentLine += QUOTE + QUOTE;
            i += 2;
          } else {
            inQuotes = !inQuotes;
            currentLine += char;
            i++;
          }
          continue;
        }
        if (!inQuotes) {
          let lineBreakLength = this.detectLineBreak(content, i);
          if (lineBreakLength > 0) {
            lines.push(currentLine);
            currentLine = '';
            i += lineBreakLength;
            continue;
          }
        }
        currentLine += char;
        i++;
      }
      if (currentLine.length > 0) lines.push(currentLine);
      if (inQuotes) throw CsvFormatError.unclosedQuote('end of file');
      return lines;
    }
    detectLineBreak(content, index) {
      if (content.substr(index, 2) === CRLF) return 2;
      if (content[index] === LF) return 1;
      if (content[index] === CR && content[index + 1] === LF) return 2;
      return 0;
    }
    getDelimiter(config = this.opts) {
      if (config.delimiter) return config.delimiter;
      return COMMA;
    }
    getHeaderIndex(config = this.opts) {
      if (config.headerRowNumber !== null && !isNaN(config.headerRowNumber)) return config.headerRowNumber;
      return 0;
    }
    parseLine(line, config = this.opts, delimiter = this.getDelimiter(config)) {
      if (config.trimHeaders) return this.parseLineWithTrim(line, config);
      return line.split(delimiter);
    }
    processField(headers, line, config = this.opts) {
      let result = {};
      const skipColumns = config.headerRowNumber ? new Set(config.headerRowNumber) : new Set();
      for (let i = 0; i < headers.length; i++) {
        if (skipColumns.has(i)) continue;
        const header = stringUtils.removeWhitespace(config.trimHeaders ? headers[i] : headers[i]);
        let value = line[i];
        if (this.isJson(value, config)) {
          value = this.parseJson(value, config);
        }
        config.trimValues && !Array.isArray(value) && (value = stringUtils.decode(line[i]));
        result[header] = value;
      }
      return result;
    }
    processFieldAsync(headers, line, config = this.opts) {
      let result = {};
      const skipColumns = config.headerRowNumber ? new Set(config.headerRowNumber) : new Set();
      for (let i = 0; i < headers.length; i++) {
        if (skipColumns.has(i)) continue;
        const header = stringUtils.removeWhitespace(config.trimHeaders ? headers[i] : headers[i]);
        let value = line[i];
        if (this.isJson(value, config)) {
          value = this.parseJson(value, config);
        }
        config.trimValues && !Array.isArray(value) && (value = stringUtils.decode(line[i]));
        result[header] = value;
      }
      return result;
    }
    isJson(value, config = this.opts) {
      if (config.trimValues) {
        if (value && value.length > 0 && value[0] === QUOTE) return false;
      }
      return false;
    }
    parseJson(value, config = this.opts) {
      return JSON.parse(value);
    }
    parseLineWithTrim(line, config = this.opts) {
      if (line.length === 0) return [];
      let result = [];
      let current = '';
      let inQuotes = false;
      const delimiter = config.delimiter || ',';
      for (let i = 0; i < line.length; i++) {
        let char = line[i];
        if (char === QUOTE) {
          if (inQuotes && i + 1 < line.length && line[i + 1] === QUOTE) {
            current += QUOTE + QUOTE;
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === delimiter && !inQuotes) {
          result.push(current);
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current);
      if (inQuotes) throw CsvFormatError.unclosedQuote('end of line');
      return result;
    }
    validateQuote(config = this.opts) {
      if (config.quote && config.quote.length > 1) {
        throw ConfigurationError.invalidValue(config.quote);
      }
    }
    validateDelimiter(config = this.opts) {
      if (config.delimiter && config.delimiter.length > 1) {
        throw ConfigurationError.invalidValue(config.delimiter);
      }
    }
    validateEscape(config = this.opts) {
      if (config.escape && config.escape.length > 1) {
        throw ConfigurationError.invalidValue(config.escape);
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
      this.results = [];
      this.headers = null;
      this.currentLineIndex = 0;
      this.currentColumnIndex = 0;
      this.inQuotes = false;
      this.chunkSize = options.chunkSize || 1024;
      this.isBrowser = options.isBrowser || typeof window !== 'undefined' && typeof document !== 'undefined';
      this.onHeader = options.onHeader;
      this.onRecord = options.onRecord;
      this.onError = options.onError;
      this.onComplete = options.onComplete;
      this.skipColumns = new Set(config.skipColumns ||[]);
      this.encoding = options.encoding;
    }
    appendChunk(chunk) {
      let str;
      if (typeof chunk === 'string') str = chunk;
      else {
        if (this.isBrowser && typeof globalThis.TextDecoder === 'function') {
          str = new globalThis.TextDecoder().decode(chunk);
        } else {
          if (this.isBrowser) str = String.fromCharCode.apply(null, new Uint8Array(chunk));
          else throw new Error('TextDecoder is not available');
        }
      }
      this.buffer += str;
      this.processBuffer();
    }
    async processStream(stream) {
      return new Promise((resolve, reject) => {
        if (this.isBrowser) {
          if (!stream || typeof stream.getReader !== 'function') {
            const error = new Error('Invalid stream provided');
            if (this.onError) this.onError(error);
            reject(error);
            return;
          }
          const reader = stream.getReader();
          const processChunk = async () => {
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) {
                  this.finalizeBuffer();
                  if (this.onComplete) this.onComplete(this.results);
                  resolve(this.getResult());
                  return;
                }
                this.appendChunk(value);
                this.processBuffer();
              }
            } catch (error) {
              if (this.onError) this.onError(error);
              reject(error);
            }
          };
          processChunk();
        } else {
          if (!stream || typeof stream.on !== 'function') {
            const error = new Error('Invalid stream provided');
            if (this.onError) this.onError(error);
            reject(error);
            return;
          }
          stream.on('data', chunk => {
            try {
              this.appendChunk(chunk);
              this.processBuffer();
            } catch (error) {
              if (this.onError) this.onError(error);
              reject(error);
            }
          });
          stream.on('end', () => {
            try {
              this.finalizeBuffer();
              if (this.onComplete) this.onComplete(this.results);
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
      while (this.buffer.length >= this.chunkSize) {
        const chunk = this.buffer.slice(0, this.chunkSize);
        this.results.push(...chunk);
        this.processChunk(chunk, this.results.length, null);
      }
    }
    finalizeBuffer() {
      if (!this.buffer || this.buffer.length === 0) return;
      const remaining = [...this.buffer];
      this.buffer = '';
      this.results.push(...remaining);
      this.processChunk(remaining, this.results.length, this.results.length);
    }
    async processChunk(chunk) {
      const result = this.parseLine(chunk);
      this.headers = result.headers;
      this.currentLine = result.currentLine;
      for (const record of result.records) {
        this.processRecord(record);
        this.currentColumnIndex++;
      }
    }
    parseLine(line) {
      if (this.config.trimHeaders && this.currentColumnIndex === 0) {
        if (this.headers) this.validateHeaders(this.headers);
        const parsed = this.parseLineWithTrim(line, false);
        for (const header of parsed.headers) {
          this.processHeader(header);
          this.currentColumnIndex++;
        }
      }
      const result = {};
      result.headers = this.headers;
      result.currentLine = this.currentLine;
      result.records = this.parseRecords(line);
      return result;
    }
    processHeader(header) {
      if (this.headers === null && this.currentColumnIndex === this.headerRowNumber) this.setHeader(header);
      else {
        if (this.headers !== null) {
          this.validateHeader(header);
        }
      }
    }
    setHeader(header) {
      const parsed = this.parseHeader(header);
      if (stringUtils.isUndefined(parsed)) {
        this.headers = parsed;
      }
    }
    validateHeader(header) {
      const parsed = this.parseHeader(header);
      if (stringUtils.isUndefined(parsed)) {
        this.validateHeader(parsed);
      }
    }
    parseHeader(header) {
      if (this.config.trimHeaders) {
        return this.parseLineWithTrim(header, this.config);
      }
      return header.split(this.config.delimiter || ',');
    }
    parseLineWithTrim(line, config) {
      if (line.length === 0) return [];
      const result = [];
      let current = '';
      let inQuotes = false;
      const delimiter = config.delimiter || ',';
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === QUOTE) {
          if (inQuotes && i + 1 < line.length && line[i + 1] === QUOTE) {
            current += QUOTE + QUOTE;
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === delimiter && !inQuotes) {
          result.push(current);
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current);
      if (inQuotes) throw CsvFormatError.unclosedQuote('end of line');
      return result;
    }
    detectLineBreak(content, index) {
      if (content.substr(index, 2) === CRLF) return 2;
      if (content[index] === LF) return 1;
      if (content[index] === CR && content[index + 1] === LF) return 2;
      return 0;
    }
    processRecord(record) {
      if (this.config.trimValues) return this.processRecordWithTrim(record);
      return record;
    }
    processRecordWithTrim(record) {
      const trimmed = record.map(str => stringUtils.removeWhitespace(str, true));
      const result = stringUtils.detectNumberFormat(trimmed);
      if (this.config.trimValues) {
        for (let i = 0; i < result.length; i++) {
          result[i] = stringUtils.removeWhitespace(result[i], true);
        }
      }
      return result;
    }
    parseChunk(chunk, inQuotes) {
      const result = {};
      result.records = [];
      let current = '';
      let i = 0;
      while (i < chunk.length) {
        const char = chunk[i];
        if (char === QUOTE) {
          const escapeResult = this.checkEscape(chunk, i, inQuotes);
          if (escapeResult.wasEscaped) {
            current += QUOTE + QUOTE;
            i = escapeResult.newIndex;
          } else {
            inQuotes = !inQuotes;
          }
        } else {
          if (!inQuotes && this.detectLineBreak(chunk, i)) {
            const lineBreakLength = this.detectLineBreak(chunk, i);
            result.records.push(current);
            current = '';
            i += lineBreakLength;
            continue;
          }
          current += char;
        }
        i++;
      }
      result.records = result.records;
      result.currentLine = current;
      result.inQuotes = inQuotes;
      return result;
    }
    checkEscape(content, index, inQuotes) {
      if (inQuotes && index + 1 < content.length && content[index + 1] === QUOTE) {
        return { wasEscaped: true, newIndex: index + 2 };
      }
      return { wasEscaped: false, newIndex: index + 1 };
    }
    finalizeBuffer() {
      this.processBuffer();
      this.finalizeChunk();
    }
    getResult() {
      return this.results;
    }
    validateHeaders() {
      if (!this.headers && this.currentLine.length === 0) return;
      if (!this.headers) {
        throw CsvFormatError.invalidHeader();
      }
    }
  }
  module.exports = StreamProcessor;
}});

var require_csvToJsonAsync = __commonJS({'../work/iuccio__csvToJson/src/csvToJsonAsync.js'(exports, module) {
  'use strict';
  const fileUtils = require_fileUtils();
  const csvToJson = require_csvToJson();
  const Configurable = require_configurable();
  const { InputValidationError } = require_errors();
  const StreamProcessor = require_streamProcessor();
  const defaultOptions = {};
  defaultOptions.isBrowser = true;
  class CsvToJsonAsync extends Configurable {
    constructor() {
      super();
      this.csvToJson = csvToJson;
    }
    async parseStringArray(stringArray, config) {
      const configObj = {};
      configObj.isBrowser = false;
      const result = await this.parseStringArrayAsync(stringArray);
      await fileUtils.writeFile(result, config);
    }
    async parseStringArrayAsync(stringArray) {
      const result = await this.parseStringArrayAsyncInternal(stringArray);
      return JSON.stringify(result, void 0, 2);
    }
    async parseStringArrayAsyncInternal(stringArray, config = defaultOptions) {
      if (stringArray === null || stringArray === void 0) {
        throw new InputValidationError('Invalid input', 'stringArray', '' + typeof stringArray, 'string');
      }
      const parserConfig = this.getParserConfig();
      if (config.isBrowser) {
        if (stringArray === '') return [];
        return this.csvToJson.parseStringArray(stringArray, parserConfig);
      }
      const content = await fileUtils.readFileAsync(stringArray, parserConfig.encoding || 'utf8');
      return this.csvToJson.parseStringArray(content, parserConfig);
    }
    async readFile(filePath, config = {}) {
      this.validateConfig(config);
      const parserConfig = this.getParserConfig();
      const streamProcessor = {};
      streamProcessor.isBrowser = false;
      const processor = new StreamProcessor(parserConfig, streamProcessor);
      return processor.processStream(filePath);
    }
    async readFileAsync(filePath) {
      if (!filePath || typeof filePath !== 'object') {
        throw new InputValidationError('Invalid input', 'filePath', typeof filePath, 'ReadableStream');
      }
      const fs = require('fs');
      const parserConfig = this.getParserConfig();
      const encoding = typeof parserConfig.encoding === 'string' ? parserConfig.encoding : 'utf8';
      const options = {};
      options.encoding = encoding;
      const stream = fs.createReadStream(filePath, options);
      return this.readFile(stream);
    }
  }
  module.exports = new CsvToJsonAsync();
}});

var require_browserApi = __commonJS({'../work/iuccio__csvToJson/src/browserApi.js'(exports, module) {
  'use strict';
  const csvToJson = require_csvToJson();
  const Configurable = require_configurable();
  const { InputValidationError, BrowserApiError } = require_errors();
  const StreamProcessor = require_streamProcessor();
  class BrowserApi extends Configurable {
    constructor() {
      super();
      this.csvToJson = csvToJson;
    }
    validateInput(input) {
      if (input === void 0 || input === null) {
        throw new InputValidationError('Invalid input', 'input', '' + typeof input, 'string');
      }
    }
    parseStringArray(stringArray) {
      this.validateInput(stringArray);
      const config = this.getParserConfig();
      return this.csvToJson.parseStringArray(String(stringArray), config);
    }
    parseStringArrayAsync(stringArray) {
      this.validateInput(stringArray);
      const config = this.getParserConfig();
      return this.csvToJson.parseStringArrayAsync(stringArray, config);
    }
    parseStringArrayToBuffer(stringArray) {
      this.validateInput(stringArray);
      const config = this.getParserConfig();
      return JSON.stringify(this.parseStringArray(stringArray), void 0, 2);
    }
    parseStringArrayToBufferAsync(stringArray) {
      return Promise.resolve(this.parseStringArrayToBuffer(stringArray));
    }
    parseFile(file, options = {}) {
      if (!file) {
        return Promise.reject(new InputValidationError('Invalid input', 'file', '' + typeof file, 'File'));
      }
      return new Promise((resolve, reject) => {
        if (typeof FileReader === 'undefined') {
          reject(BrowserApiError.unsupportedEnvironment());
          return;
        }
        const reader = new FileReader();
        reader.onerror = () => reject(BrowserApiError.fileReadError(reader.error || new Error('Unknown error')));
        reader.onload = () => {
          try {
            resolve(this.parseStringArray(reader.result));
          } catch (error) {
            reject(BrowserApiError.fileReadError(error));
          }
        };
        if (options.encoding) {
          reader.readAsText(file, options.encoding);
        } else {
          reader.readAsText(file);
        }
      });
    }
    async parseStream(stream) {
      if (typeof ReadableStream === 'undefined') {
        throw BrowserApiError.unsupportedEnvironment();
      }
      if (!stream || typeof stream.getReader !== 'function') {
        throw new InputValidationError('Invalid input', 'stream', typeof stream, 'ReadableStream');
      }
      const config = this.getParserConfig();
      const options = {};
      options.isBrowser = true;
      const processor = new StreamProcessor(config, options);
      return processor.processStream(stream);
    }
    async parseFileAsync(file) {
      if (!file || !(file instanceof File)) {
        throw new InputValidationError('Invalid input', 'file', typeof file, 'File');
      }
      if (typeof file.text === 'function') {
        const text = await file.text();
        return this.parseStringArray(text);
      } else {
        return this.parseFile(file);
      }
    }
    async parseFileToBufferAsync(file, options = {}) {
      if (!file || !(file instanceof File)) {
        throw new InputValidationError('Invalid input', 'file', typeof file, 'File');
      }
      if (!options.encoding || typeof options.encoding !== 'string') {
        throw new InputValidationError('Invalid input', 'encoding', typeof options.encoding, 'string');
      }
      const chunkSize = options.chunkSize || 1024;
      const config = this.getParserConfig();
      const streamProcessorOptions = {};
      streamProcessorOptions.isBrowser = true;
      streamProcessorOptions.chunkSize = chunkSize;
      streamProcessorOptions.onHeader = options.onHeader;
      streamProcessorOptions.onRecord = options.onRecord;
      streamProcessorOptions.onError = options.onError;
      streamProcessorOptions.encoding = options.encoding;
      const processor = new StreamProcessor(config, streamProcessorOptions);
      if (typeof file.stream === 'function') {
        const stream = file.stream();
        return processor.processStream(stream);
      } else {
        return this.parseFile(file, options);
      }
    }
    async parseStreamAsync(stream, options) {
      const chunkSize = options.chunkSize || 1024;
      const onHeader = options.onHeader;
      const onRecord = options.onRecord;
      const onError = options.onError;
      return new Promise((resolve, reject) => {
        if (typeof FileReader === 'undefined') {
          const error = BrowserApiError.unsupportedEnvironment();
          if (onError) onError(error);
          reject(error);
          return;
        }
        const reader = new FileReader();
        reader.onerror = () => {
          const error = BrowserApiError.fileReadError(reader.error || new Error('Unknown error'));
          if (onError) onError(error);
          reject(error);
        };
        reader.onload = () => {
          try {
            const result = this.parseStringArray(reader.result);
            let index = 0;
            const total = result.length;
            const processNext = () => {
              const chunk = result.slice(index, index + chunkSize);
              if (chunk.length === 0) {
                if (onRecord) onRecord(result);
                resolve();
                return;
              }
              if (onHeader) onHeader(chunk, index + chunk.length, total);
              index += chunk.length;
              setTimeout(processNext, 0);
            };
            processNext();
          } catch (error) {
            if (onError) onError(error);
            reject(error);
          }
        };
        reader.readAsText(stream);
      });
    }
  }
  module.exports = new BrowserApi();
}});

var csvToJson = require_csvToJson();
var csvToJsonAsync = require_csvToJsonAsync();

var encodingOps = {};
encodingOps.utf8 = 'utf8';
encodingOps.utf16le = 'utf16le';
encodingOps.latin1 = 'latin1';
encodingOps.ascii = 'ascii';
encodingOps.base64 = 'base64';
encodingOps.hex = 'hex';

function applyConfigToAllClients(config, client) {
  config(csvToJson);
  config(csvToJsonAsync);
  exports.browserApi && config(exports.browserApi);
  return exports;
}

exports.supportQuotedLineBreaks = function(enabled = true) {
  return applyConfigToAllClients(client => client.supportQuotedLineBreaks(enabled));
};
exports.ignoreEmptyLines = function(enabled = false) {
  return applyConfigToAllClients(client => client.ignoreEmptyLines(enabled));
};
exports.delimiter = function(delimiter) {
  return applyConfigToAllClients(client => client.delimiter(delimiter));
};
exports.quote = function(quote) {
  return applyConfigToAllClients(client => client.quote(quote));
};
exports.escape = function(escape) {
  return applyConfigToAllClients(client => client.escape(escape));
};
exports.encoding = function(encoding) {
  return applyConfigToAllClients(client => client.encoding(encoding));
};
exports.headers = function(headers) {
  if (!Array.isArray(headers)) {
    throw new TypeError('Headers must be an array');
  }
  if (!headers.every(header => Number.isInteger(header) && header >= 0)) {
    throw new TypeError('Headers must be an array of non-negative integers');
  }
  return applyConfigToAllClients(client => client.headers(headers));
};
exports.headerRowNumber = function(rowNumber) {
  return applyConfigToAllClients(client => client.headerRowNumber(rowNumber));
};
exports.utf8Encoding = function() {
  return applyConfigToAllClients(client => client.encoding(encodingOps.utf8));
};
exports.utf16leEncoding = function() {
  return applyConfigToAllClients(client => client.encoding(encodingOps.utf16le));
};
exports.latin1Encoding = function() {
  return applyConfigToAllClients(client => client.encoding(encodingOps.latin1));
};
exports.asciiEncoding = function() {
  return applyConfigToAllClients(client => client.encoding(encodingOps.ascii));
};
exports.base64Encoding = function() {
  return applyConfigToAllClients(client => client.encoding(encodingOps.base64));
};
exports.hexEncoding = function() {
  return applyConfigToAllClients(client => client.encoding(encodingOps.hex));
};
exports.parseStringArray = function(stringArray) {
  return csvToJson.parseStringArray(stringArray);
};
exports.parseStringArrayAsync = function(stringArray, config) {
  return csvToJsonAsync.parseStringArrayAsync(stringArray, config);
};
exports.parseStringArrayToBuffer = function(stringArray) {
  return csvToJson.parseStringArrayToBuffer(stringArray);
};
exports.parseStringArrayToBufferAsync = function(stringArray) {
  return csvToJsonAsync.parseStringArrayToBufferAsync(stringArray);
};
exports.parseFile = function(filePath, config) {
  return csvToJsonAsync.parseFile(filePath, config);
};
exports.parseFileAsync = function(filePath) {
  return csvToJsonAsync.parseFileAsync(filePath);
};
exports.parseStream = function(stream, options) {
  return csvToJsonAsync.parseStream(stream, options);
};
exports.parseStreamAsync = function(stream) {
  return csvToJsonAsync.parseStreamAsync(stream);
};
exports.parseFileToBuffer = function(filePath) {
  return csvToJson.parseFileToBuffer(filePath);
};
exports.parseFileToBufferAsync = function(filePath) {
  return csvToJsonAsync.parseFileToBufferAsync(filePath);
};
exports.parseFileToBufferAsyncInternal = function(filePath, options) {
  if (!filePath) throw new Error('File path is required');
  if (!options) throw new Error('Options are required');
  csvToJson.parseFileToBufferAsyncInternal(filePath, options);
};
exports.parseFileToBufferAsyncInternalAsync = function(filePath) {
  if (!filePath) throw new Error('File path is required');
  return csvToJson.parseFileToBufferAsyncInternalAsync(filePath);
};
exports.parseFileAsyncInternal = function(filePath, config) {
  return csvToJsonAsync.parseFileAsyncInternal(filePath, config);
};
exports.parseStreamAsyncInternal = function(stream) {
  return csvToJsonAsync.parseStreamAsyncInternal(stream);
};
exports.parseStringArrayAsyncInternal = function(stringArray) {
  return csvToJsonAsync.parseStringArrayAsyncInternal(stringArray);
};
exports.parseStringArrayToBufferAsyncInternal = function(stringArray, config) {
  return csvToJsonAsync.parseStringArrayToBufferAsyncInternal(stringArray, config);
};
exports.browserApi = require_browserApi();
