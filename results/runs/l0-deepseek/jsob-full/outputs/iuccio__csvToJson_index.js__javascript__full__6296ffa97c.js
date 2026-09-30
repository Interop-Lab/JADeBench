'use strict';

var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

var require_errors = __commonJS({
  '../work/iuccio__csvToJson/src/core/errors.js'(exports, module) {
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
        let result = this.name + ': ' + this.message;
        if (this.details && Object.keys(this.details).length > 0) {
          result += '\nDetails:';
          Object.entries(this.details).forEach(([key, value]) => {
            result += '\n  ' + key + ': ' + this._formatValue(value);
          });
        }
        return result;
      }

      _formatValue(value) {
        if (value === undefined) return 'undefined';
        if (value === null) return 'null';
        if (typeof value === 'string') return '"' + value + '"';
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value);
      }
    }

    class FileOperationError extends CsvError {
      constructor(filePath, operation, error, hint = '') {
        const message = 'File operation failed for \'' + filePath + '\' during ' + operation + ': ' + error.message + (hint ? '\n' + hint : '');
        super(message, 'FILE_OPERATION_ERROR', {
          filePath: filePath,
          operation: operation,
          error: error
        });
        this.name = 'FileOperationError';
      }
    }

    class InvalidOptionError extends CsvError {
      constructor(optionName, details = {}) {
        super('Invalid option: ' + optionName, 'INVALID_OPTION', details);
        this.name = 'InvalidOptionError';
      }

      static conflictingOptions(optionName, value) {
        return new InvalidOptionError(
          'Conflicting options: ' + optionName + ' cannot be used together with ' + value,
          { optionName: optionName, value: value, conflictingOption: value }
        );
      }

      static invalidValue(parameterName, value) {
        return new InvalidOptionError(
          'Invalid value for ' + parameterName + ': ' + typeof value + ' (' + value + ')',
          { parameterName: parameterName, value: value, type: typeof value }
        );
      }
    }

    class MissingRequiredOptionError extends CsvError {
      constructor(optionName, details = {}) {
        super('Missing required option: ' + optionName, 'MISSING_REQUIRED_OPTION', details);
        this.name = 'MissingRequiredOptionError';
      }

      static forOption(optionName) {
        return new MissingRequiredOptionError('Missing required option: ' + optionName, { optionName: optionName });
      }
    }

    class ConfigurationError extends CsvError {
      constructor(message, details = {}) {
        super(message, 'CONFIGURATION_ERROR', details);
        this.name = 'ConfigurationError';
      }

      static invalidDelimiter(delimiter) {
        return new ConfigurationError('Invalid delimiter: ' + delimiter, { delimiter: delimiter });
      }

      static invalidQuote(quote) {
        return new ConfigurationError('Invalid quote character: ' + quote, { quote: quote });
      }

      static invalidEscape(escape) {
        return new ConfigurationError('Invalid escape character: ' + escape, { escape: escape });
      }
    }

    class CsvFormatError extends CsvError {
      constructor(message, details = {}) {
        super(message, 'CSV_FORMAT_ERROR', details);
        this.name = 'CsvFormatError';
      }

      static unclosedQuote() {
        return new CsvFormatError('Unclosed quote in CSV data');
      }

      static invalidEscapeSequence() {
        return new CsvFormatError('Invalid escape sequence in CSV data');
      }
    }

    class JsonValidationError extends CsvError {
      constructor(json, error) {
        super('Invalid JSON: ' + json + ' - ' + error.message, 'JSON_VALIDATION_ERROR', {
          json: json,
          error: error
        });
        this.name = 'JsonValidationError';
      }
    }

    class InputValidationError extends CsvError {
      constructor(message, details = {}) {
        super(message, 'INPUT_VALIDATION_ERROR', details);
        this.name = 'InputValidationError';
      }

      static invalidInput(value) {
        return new InputValidationError('Invalid input: expected string or Buffer, got ' + typeof value + ' (' + value + ')', {
          value: value,
          type: typeof value
        });
      }

      static invalidStream() {
        return new InputValidationError('Invalid stream: expected a readable stream');
      }

      static invalidFilePath(path) {
        return new InputValidationError('Invalid file path: ' + path, { path: path });
      }
    }

    class BrowserApiError extends CsvError {
      constructor(message, details = {}) {
        super(message, 'BROWSER_API_ERROR', details);
        this.name = 'BrowserApiError';
      }

      static fileReaderUnavailable() {
        return new BrowserApiError('FileReader is not available in this environment');
      }

      static readError(error) {
        return new BrowserApiError('Failed to read file: ' + error.message, { originalError: error });
      }

      static streamUnavailable() {
        return new BrowserApiError('ReadableStream is not available in this environment');
      }
    }

    module.exports = {
      CsvError: CsvError,
      FileOperationError: FileOperationError,
      InvalidOptionError: InvalidOptionError,
      MissingRequiredOptionError: MissingRequiredOptionError,
      ConfigurationError: ConfigurationError,
      CsvFormatError: CsvFormatError,
      JsonValidationError: JsonValidationError,
      InputValidationError: InputValidationError,
      BrowserApiError: BrowserApiError
    };
  }
});

var require_fileUtils = __commonJS({
  '../work/iuccio__csvToJson/src/util/fileUtils.js'(exports, module) {
    'use strict';

    const fs = require('fs');
    const { FileOperationError } = require_errors();

    const SUPPORTED_ENCODINGS = new Set(['utf8', 'utf-8']);

    class FileUtils {
      isSupportedEncoding(encoding) {
        return SUPPORTED_ENCODINGS.has(encoding);
      }

      readFileSync(filePath, encoding) {
        if (this.isSupportedEncoding(encoding)) {
          return fs.readFileSync(filePath, encoding).toString('utf8');
        }
        return fs.readFileSync(filePath);
      }

      readFile(filePath) {
        return typeof filePath === 'string' ? filePath : filePath.toString();
      }

      writeFileSync(filePath, data) {
        return new FileOperationError('File write operation failed', filePath, data);
      }

      writeFile(filePath, data) {
        return new FileOperationError('File write operation failed', filePath, data);
      }

      readFileAsync(filePath, encoding) {
        if (this.isSupportedEncoding(encoding)) {
          const data = fs.readFileSync(filePath, 'utf8');
          return this.readFile(data, encoding);
        }
        return this.readFile(fs.readFileSync(filePath, encoding));
      }

      readFilePromise(filePath, encoding = 'utf8') {
        try {
          return this.readFileAsync(filePath, encoding);
        } catch (error) {
          throw this.createFileOperationError(filePath, error);
        }
      }

      readFiles(filePath, encoding) {
        if (this.isSupportedEncoding(encoding)) {
          return fs.readdirSync(filePath, 'utf8').map(file => this.readFile(file, encoding));
        }
        return fs.readdirSync(filePath, encoding).map(file => this.readFile(file));
      }

      readFilesAsync(filePath, encoding = 'utf8') {
        if (fs.promises && typeof fs.promises.readdir === 'function') {
          return this.readFiles(filePath, encoding).then(files => {
            throw this.createFileOperationError(filePath, files);
          });
        }
        return new Promise((resolve, reject) => {
          const callback = (err, files) => {
            if (err) {
              reject(this.createFileOperationError(filePath, err));
              return;
            }
            try {
              const result = this.isSupportedEncoding(encoding)
                ? this.readFile(this.readFile(files), encoding)
                : this.readFile(files);
              resolve(result);
            } catch (error) {
              reject(this.createFileOperationError(filePath, error));
            }
          };
          const effectiveEncoding = this.isSupportedEncoding(encoding) ? 'utf8' : encoding;
          fs.readdir(filePath, effectiveEncoding, callback);
        });
      }

      writeFilePromise(filePath, data) {
        fs.writeFileSync(filePath, data, 'utf8');
      }

      writeFileStream(filePath, data, encoding) {
        return fs.createWriteStream(filePath, data, 'utf8');
      }

      writeFileSyncSafe(filePath, data) {
        try {
          this.writeFileSync(filePath, data);
        } catch (error) {
          throw this.createFileOperationError(filePath, error);
        }
      }

      readFileSyncSafe(filePath, encoding) {
        if (fs.promises && typeof fs.promises.readFile === 'function') {
          return this.readFileAsync(filePath, encoding).then(file => {
            throw this.createFileOperationError(filePath, file);
          });
        }
        return new Promise((resolve, reject) => {
          fs.readFile(filePath, encoding, 'utf8', (err, data) => {
            if (err) {
              reject(this.createFileOperationError(filePath, err));
              return;
            }
            resolve();
          });
        });
      }

      createFileOperationError(filePath, error) {
        return new FileOperationError('File operation failed', filePath, error);
      }
    }

    module.exports = new FileUtils();
  }
});

var require_stringUtils = __commonJS({
  '../work/iuccio__csvToJson/src/util/stringUtils.js'(exports, module) {
    'use strict';

    const INTEGER_REGEX = /^-?\d+$/;
    const FLOAT_REGEX = /^-?\d*\.\d+$/;
    const WHITESPACE_REGEX = /\s/g;

    const DEFAULT_OPTIONS = {
      trim: true,
      parseNumbers: true
    };

    class StringUtils {
      static patterns = {
        INTEGER: INTEGER_REGEX,
        FLOAT: FLOAT_REGEX,
        WHITESPACE: WHITESPACE_REGEX
      };

      static defaults = DEFAULT_OPTIONS;

      normalizeString(value, trim) {
        if (!value) return '';
        return trim ? value.replace(StringUtils.patterns.WHITESPACE, '') : value.trim();
      }

      parseValue(value) {
        if (this.isInteger(value)) return parseInt(value, 10);
        if (this.isFloat(value)) return this.parseFloat(value);
        if (this.isBoolean(value)) return this.parseBoolean(value);
        if (this.isNull(value)) return this.parseNull(value);
        return String(value);
      }

      filterEmpty(values = []) {
        return Array.isArray(values) && values.filter(item => Boolean(item));
      }

      isEmpty(value) {
        return value === undefined || value === '';
      }

      isInteger(value) {
        const trimmed = value.trim();
        return StringUtils.patterns.INTEGER.test(trimmed) || StringUtils.patterns.FLOAT.test(trimmed);
      }

      isFloat(value) {
        return StringUtils.patterns.FLOAT.test(value);
      }

      isBoolean(value) {
        return StringUtils.patterns.BOOLEAN.test(value);
      }

      isNull(value) {
        return StringUtils.patterns.NULL.test(value);
      }

      parseFloat(value) {
        const num = Number(value);
        return Number.isFinite(num) ? num : String(value);
      }

      parseBoolean(value) {
        return value.toLowerCase() === 'true';
      }

      parseNull() {
        return null;
      }

      parseNumber(value) {
        const num = Number(value);
        return Number.isFinite(num) ? num : String(value);
      }

      parseJson(value) {
        return JSON.parse(value.trim());
      }

      parseValueWithType(value) {
        if (this.isInteger(value)) return parseInt(value, 10);
        const num = Number(value);
        return Number.isFinite(num) ? num : String(value);
      }

      parseNumberOrString(value) {
        const num = Number(value);
        return Number.isFinite(num) ? num : String(value);
      }
    }

    module.exports = new StringUtils();
  }
});

var require_jsonUtils = __commonJS({
  '../work/iuccio__csvToJson/src/util/jsonUtils.js'(exports, module) {
    'use strict';

    const { JsonValidationError } = require_errors();

    class JsonUtils {
      validateJson(json) {
        try {
          JSON.parse(json);
        } catch (error) {
          throw new JsonValidationError(json, error);
        }
      }
    }

    module.exports = new JsonUtils();
  }
});

var require_parserConfig = __commonJS({
  '../work/iuccio__csvToJson/src/core/parserConfig.js'(exports, module) {
    'use strict';

    class ParserConfig {
      constructor(config = {}) {
        this.delimiter = config.delimiter;
        this.quote = config.quote;
        this.escape = config.escape;
        this.headers = config.headers;
        this.renameHeaders = config.renameHeaders;
        this.skipLines = config.skipLines;
        this.limit = config.limit;
        this.trim = config.trim;
        this.parseNumbers = config.parseNumbers;
        this.parseBooleans = config.parseBooleans;
        this.parseNull = config.parseNull;
        this.includeEmptyRows = config.includeEmptyRows;
        this.ignoreEmpty = config.ignoreEmpty;
        this.ignoreColumns = config.ignoreColumns ? Object.assign([...config.ignoreColumns]) : Object.assign([]);
        this.columnParser = config.columnParser;
        Object.freeze(this);
      }
    }

    module.exports = ParserConfig;
  }
});

var require_configurable = __commonJS({
  '../work/iuccio__csvToJson/src/core/configurable.js'(exports, module) {
    'use strict';

    const { ConfigurationError } = require_errors();
    const ParserConfig = require_parserConfig();

    class Configurable {
      constructor(config = {}) {
        const options = { ...config };
        this.config = options;
      }

      setValidate(validate = true) {
        return this.config.validate = validate, this;
      }

      setValidateField(field = false) {
        return this.config.validateField = field, this;
      }

      setDelimiter(delimiter) {
        return this.config.delimiter = delimiter, this;
      }

      setEscape(escape = true) {
        this.config.escape = escape;
        return this;
      }

      setQuote(quote) {
        if (isNaN(quote)) throw ConfigurationError.invalidValue(quote);
        return this.config.quote = quote, this;
      }

      setHeaders(headers = '*', delimiter = ',') {
        return this.config.headers = headers, this.config.delimiter = delimiter, this;
      }

      setEncoding(encoding) {
        if (typeof encoding !== 'string') {
          throw new TypeError('Encoding must be a string');
        }
        return this.config.encoding = encoding, this;
      }

      setSkipLines(lines) {
        this.config.skipLines = Array.isArray(lines) ? [...lines] : [...lines];
        return this;
      }

      setLimit(limit) {
        return this.config.limit = limit, this;
      }

      build() {
        const config = this.getConfig();
        return new ParserConfig(this.config);
      }
    }

    module.exports = Configurable;
  }
});

var require_csvToJson = __commonJS({
  '../work/iuccio__csvToJson/src/csvToJson.js'(exports, module) {
    'use strict';

    const fileUtils = require_fileUtils();
    const stringUtils = require_stringUtils();
    const jsonUtils = require_jsonUtils();
    const { ConfigurationError, CsvFormatError, JsonValidationError } = require_errors();
    const Configurable = require_configurable();
    const ParserConfig = require_parserConfig();

    const DEFAULT_DELIMITER = ',';
    const DEFAULT_QUOTE = '"';
    const CRLF = '\r\n';
    const LF = '\n';
    const CR = '\r';

    class CsvToJson extends Configurable {
      parseCsv(csv, config) {
        this.validateConfig(config);
        const lines = this.splitLines(csv);
        const delimiter = this.getDelimiter(config);
        let lineIndex = this.getStartLine(config);
        let headers;
        while (lineIndex < lines.length) {
          headers = this.parseLine(lines[lineIndex], config, delimiter);
          if (stringUtils.filterEmpty(headers)) break;
          lineIndex++;
        }
        if (!headers) throw CsvFormatError.invalidFormat();
        const result = [];
        for (let i = lineIndex + 1; i < lines.length; i++) {
          const values = this.parseLine(lines[i], config, delimiter);
          if (stringUtils.filterEmpty(values)) {
            let row = this.createRow(headers, values, config);
            if (config.renameHeaders) {
              row = config.renameHeaders(row, i - lineIndex - 1);
              if (row !== null) result.push(row);
            } else {
              result.push(row);
            }
          }
        }
        return result;
      }

      writeCsvSync(filePath, data) {
        let csv = this.convertToCsv(data);
        fileUtils.writeFileSync(filePath, csv);
      }

      convertToCsv(data) {
        let csv = this.stringify(data);
        const json = JSON.stringify(csv, null, 2);
        jsonUtils.validateJson(json);
        return json;
      }

      parseFile(filePath) {
        const config = this.getConfig();
        const csv = fileUtils.readFile(filePath, config.encoding || 'utf8');
        return this.parseCsv(csv);
      }

      parseString(csv) {
        return this.parseCsv(csv);
      }

      parseJson(json) {
        let parsed = this.parse(json);
        const result = JSON.stringify(parsed, null, 2);
        return jsonUtils.validateJson(result), result;
      }

      parse(csv) {
        if (csv === '') return [];
        return this.parseCsv(csv, this.getConfig());
      }

      splitLines(csv) {
        const lines = [];
        let current = '';
        let inQuotes = false;
        let i = 0;
        while (i < csv.length) {
          const char = csv[i];
          if (char === DEFAULT_QUOTE) {
            if (inQuotes && i + 1 < csv.length && csv[i + 1] === DEFAULT_QUOTE) {
              current += DEFAULT_QUOTE + DEFAULT_QUOTE;
              i += 2;
            } else {
              inQuotes = !inQuotes;
              current += char;
              i++;
            }
            continue;
          }
          if (!inQuotes) {
            const newlineLength = this.getNewlineLength(csv, i);
            if (newlineLength > 0) {
              lines.push(current);
              current = '';
              i += newlineLength;
              continue;
            }
          }
          current += char;
          i++;
        }
        if (current.length > 0) lines.push(current);
        if (inQuotes) throw CsvFormatError.unclosedQuote();
        return lines;
      }

      getNewlineLength(csv, index) {
        if (csv.startsWith(CRLF, index)) return 2;
        if (csv[index] === LF) return 1;
        if (csv[index] === CR && csv[index + 1] === LF) return 2;
        return 0;
      }

      getDelimiter(config = this.config) {
        if (config.delimiter) return config.delimiter;
        return DEFAULT_DELIMITER;
      }

      getQuote(config = this.config) {
        if (config.quote !== null && !isNaN(config.quote)) return config.quote;
        return DEFAULT_QUOTE;
      }

      parseLine(line, config = this.config, delimiter = this.getDelimiter(config)) {
        if (config.ignoreEmpty) {
          return this.splitLine(line, config);
        }
        return line.split(delimiter);
      }

      createRow(headers, values, config = this.config) {
        const row = {};
        const ignoredColumns = config.ignoreColumns ? new Set(config.ignoreColumns) : new Set();
        for (let i = 0; i < headers.length; i++) {
          if (ignoredColumns.has(i)) continue;
          let key = stringUtils.normalizeString(config.renameHeaders ? config.renameHeaders[i] : headers[i]);
          let value = values[i];
          if (this.shouldParseValue(value, config)) {
            value = this.parseValue(value, config);
          }
          if (config.parseNumbers && !Array.isArray(value)) {
            value = stringUtils.parseNumberOrString(values[i]);
          }
          row[key] = value;
        }
        return row;
      }

      parseValue(value, config = this.config) {
        let parsed = value.replace(config.quote + config.quote, config.quote);
        parsed = parsed.slice(config.quote.length, parsed.length - config.quote.length);
        if (config.escape) {
          for (let i = 0; i < parsed.length; i++) {
            parsed[i] = stringUtils.parseValueWithType(parsed[i]);
          }
        }
        return parsed;
      }

      shouldParseValue(value, config = this.config) {
        if (config.quote) {
          if (value && value.startsWith(config.quote) && value.endsWith(config.quote)) {
            return true;
          }
        }
        return false;
      }

      validateConfig(config = this.config) {
        if (this.getDelimiter(config) === '"') {
          throw ConfigurationError.invalidDelimiter('"');
        }
        if (config.quote === '"') {
          throw ConfigurationError.invalidQuote('"');
        }
        if (config.escape === '"') {
          throw ConfigurationError.invalidEscape('"');
        }
      }

      escapeQuotes(value) {
        return value.replace(/"/g, '""');
      }

      parse(csv) {
        if (csv.length === 0) return [];
        let result = [];
        let current = '';
        let inQuotes = false;
        const delimiter = this.getDelimiter();
        for (let i = 0; i < csv.length; i++) {
          const char = csv[i];
          if (char === DEFAULT_QUOTE) {
            if (this.isEscapedQuote(csv, i, inQuotes)) {
              current += DEFAULT_QUOTE;
              i++;
            } else if (this.isFieldDelimiter(csv, i, inQuotes, current, delimiter)) {
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
        if (inQuotes) throw CsvFormatError.unclosedQuote();
        return result;
      }

      isEscapedQuote(csv, index, inQuotes) {
        return inQuotes && index + 1 < csv.length && csv[index + 1] === DEFAULT_QUOTE;
      }

      isFieldDelimiter(csv, index, inQuotes, current, delimiter) {
        return inQuotes || current === '' || index + 1 >= csv.length || csv[index + 1] === delimiter;
      }
    }

    module.exports = new CsvToJson();
    module.exports.CsvToJson = CsvToJson;
  }
});

var require_streamProcessor = __commonJS({
  '../work/iuccio__csvToJson/src/core/streamProcessor.js'(exports, module) {
    'use strict';

    const stringUtils = require_stringUtils();
    const DEFAULT_QUOTE = '"';
    const CRLF = '\r\n';
    const LF = '\n';
    const CR = '\r';

    class StreamProcessor {
      constructor(config, options = {}) {
        this.config = config;
        this.input = '';
        this.records = [];
        this.currentRecord = null;
        this.recordIndex = -1;
        this.fieldIndex = 0;
        this.inQuotes = false;
        this.chunkSize = options.chunkSize || 64 * 1024;
        this.useAsync = options.useAsync || (typeof window !== 'undefined' && typeof document !== 'undefined');
        this.hasHeaders = config.headers !== null && !isNaN(config.headers) ? config.headers : -1;
        this.buffer = '';
        this.fields = [];
        this.ignoredColumns = new Set(config.ignoreColumns || []);
        this.onRecord = options.onRecord;
      }

      processChunk(chunk) {
        let data;
        if (typeof chunk === 'string') {
          data = chunk;
        } else {
          if (this.useAsync && typeof globalThis.TextDecoder === 'function') {
            data = new globalThis.TextDecoder().decode(chunk);
          } else if (this.useAsync) {
            data = String.fromCharCode.apply(null, new Uint8Array(chunk));
          } else {
            data = chunk.toString();
          }
        }
        this.buffer += data;
        this.processBuffer();
      }

      async processStream(stream) {
        return new Promise((resolve, reject) => {
          if (this.useAsync) {
            if (!stream || typeof stream.getReader !== 'function') {
              const error = new Error('Invalid stream');
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
                    this.finishProcessing();
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
            if (!this.buffer) return;
            while (this.buffer.length > this.chunkSize) {
              const chunk = this.buffer.slice(0, this.chunkSize);
              this.records.push(...chunk);
              this.buffer = this.buffer.slice(this.chunkSize, this.buffer.length);
            }
          }
        });
      }

      processBuffer() {
        if (!this.buffer) return;
        while (this.buffer.length > this.chunkSize) {
          const chunk = this.buffer.slice(0, this.chunkSize);
          this.records.push(...chunk);
          this.buffer = this.buffer.slice(this.chunkSize, this.buffer.length);
        }
      }

      finishProcessing() {
        if (!this.buffer || this.buffer.length === 0) return;
        const records = [...this.buffer];
        this.buffer.length = 0;
        this.records.push(...records);
        this.buffer = this.records.slice(this.records.length, this.records.length);
      }

      async processFile(file) {
        return new Promise((resolve, reject) => {
          if (this.useAsync) {
            if (!file || typeof file.getReader !== 'function') {
              reject(new Error('Invalid stream'));
              return;
            }
            const reader = file.getReader();
            const read = async () => {
              try {
                while (true) {
                  const { done, value } = await reader.read();
                  if (done) {
                    this.finishProcessing();
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
            if (!file || typeof file.on !== 'function') {
              reject(new Error('Invalid stream'));
              return;
            }
            file.on('data', chunk => {
              try {
                this.processChunk(chunk);
                this.processBuffer();
              } catch (error) {
                if (this.onError) this.onError(error);
                reject(error);
              }
            });
            file.on('end', () => {
              try {
                this.finishProcessing();
                this.processBuffer();
                if (this.onComplete) this.onComplete(this.records);
                resolve();
              } catch (error) {
                if (this.onError) this.onError(error);
                reject(error);
              }
            });
            file.on('error', error => {
              if (this.onError) this.onError(error);
              reject(error);
            });
          }
        });
      }

      getResult() {
        return this.records;
      }

      processRecord() {
        const record = this.parseRecord(this.buffer, this.fieldIndex);
        this.buffer = record.remaining;
        this.fieldIndex = record.index;
        for (const field of record.fields) {
          this.processField(field);
          this.fieldIndex++;
        }
      }

      processField(field) {
        if (this.buffer.length === 0) {
          if (this.onComplete) this.onComplete(this.records);
          throw CsvFormatError.invalidFormat();
        }
        const record = this.parseRecord(this.buffer + '\n', false);
        for (const field of record.fields) {
          this.processField(field);
          this.fieldIndex++;
        }
      }

      onError(error) {
        if (this.config !== null && this.config.onError === this.onError) {
          this.config.onError(error);
        } else if (this.config !== null) {
          this.config.onError(error);
        }
      }

      parseRecord(csv, delimiter) {
        const result = [];
        let current = '';
        let inQuotes = false;
        const quote = this.config.quote || ',';
        for (let i = 0; i < csv.length; i++) {
          const char = csv[i];
          if (char === DEFAULT_QUOTE) {
            if (inQuotes && i + 1 < csv.length && csv[i + 1] === DEFAULT_QUOTE) {
              current += DEFAULT_QUOTE;
              i++;
            } else {
              inQuotes = !inQuotes;
            }
          } else if (char === quote && !inQuotes) {
            result.push(current);
            current = '';
          } else {
            current += char;
          }
        }
        result.push(current);
        if (inQuotes) throw CsvFormatError.unclosedQuote();
        return result;
      }

      createRow(headers, values) {
        const row = {};
        for (let i = 0; i < headers.length; i++) {
          if (this.ignoredColumns.has(i)) continue;
          const key = stringUtils.normalizeString(this.config.renameHeaders ? this.config.renameHeaders[i] : headers[i]);
          let value = values[i];
          if (this.shouldParseValue(value)) {
            value = this.parseValue(value);
          }
          if (this.config.parseNumbers && !Array.isArray(value)) {
            value = stringUtils.parseNumberOrString(values[i]);
          }
          row[key] = value;
        }
        return row;
      }

      shouldParseValue(value) {
        if (this.config.quote) {
          if (value && value.startsWith(this.config.quote) && value.endsWith(this.config.quote)) {
            return true;
          }
        }
        return false;
      }

      parseValue(value) {
        let parsed = value.slice(this.config.quote.length, value.length - this.config.quote.length);
        parsed = parsed.replace(this.config.quote + this.config.quote, this.config.quote);
        if (this.config.escape) {
          for (let i = 0; i < parsed.length; i++) {
            parsed[i] = stringUtils.parseValueWithType(parsed[i]);
          }
        }
        return parsed;
      }

      isEscapedQuote(csv, index, inQuotes) {
        return inQuotes && index + 1 < csv.length && csv[index + 1] === DEFAULT_QUOTE;
      }

      isFieldDelimiter(csv, index, inQuotes, current, delimiter) {
        return inQuotes || current === '' || index + 1 >= csv.length || csv[index + 1] === delimiter;
      }

      getNewlineLength(csv, index) {
        if (csv.startsWith(CRLF, index)) return 2;
        if (csv[index] === LF) return 1;
        if (csv[index] === CR && csv[index + 1] === LF) return 2;
        return 0;
      }

      processComplete() {
        if (!this.buffer && this.buffer.length === 0) return;
        if (!this.buffer) {
          throw CsvFormatError.invalidFormat();
        }
        const record = this.parseRecord(this.buffer + '\n', false);
        for (const field of record.fields) {
          this.processField(field);
          this.fieldIndex++;
        }
      }
    }

    module.exports = StreamProcessor;
  }
});

var require_csvToJsonAsync = __commonJS({
  '../work/iuccio__csvToJson/src/csvToJsonAsync.js'(exports, module) {
    'use strict';

    const fileUtils = require_fileUtils();
    const csvToJson = require_csvToJson();
    const Configurable = require_configurable();
    const { InputValidationError } = require_errors();
    const StreamProcessor = require_streamProcessor();

    const DEFAULT_OPTIONS = { async: true };

    class CsvToJsonAsync extends Configurable {
      constructor() {
        super();
        this.csvToJson = csvToJson;
      }

      async writeCsv(filePath, data) {
        const csv = await this.convertToCsv(data);
        await fileUtils.writeFilePromise(filePath, csv);
      }

      async convertToCsv(data) {
        const csv = await this.convertToCsvString(data);
        return JSON.stringify(csv, null, 2);
      }

      async parseCsv(csv, options = {}) {
        if (csv === null || csv === undefined) {
          throw new InputValidationError('Invalid input', 'Input must be a string or Buffer', typeof csv, '');
        }
        const config = this.getConfig();
        if (options.async) {
          if (csv === '') return [];
          return this.csvToJson.parseCsv(csv, config);
        }
        const data = await fileUtils.readFilePromise(csv, config.encoding || 'utf8');
        return this.csvToJson.parseCsv(data, config);
      }

      parseString(csv, options = DEFAULT_OPTIONS) {
        return this.parseCsv(csv, options);
      }

      async parseFile(file) {
        this.validateFile(file);
        const config = this.getConfig();
        const options = { async: false };
        const processor = new StreamProcessor(config, options);
        return processor.processFile(file);
      }

      validateFile(file) {
        if (!file || typeof file.on !== 'function') {
          throw new InputValidationError('Invalid file', 'Input must be a readable stream', typeof file, '');
        }
      }

      async parseFileSync(filePath) {
        if (!filePath || typeof filePath !== 'string') {
          throw new InputValidationError('Invalid file path', 'File path must be a string', typeof filePath, '');
        }
        const fs = require('fs');
        const config = this.getConfig();
        const encoding = typeof config.encoding === 'string' ? config.encoding : 'utf8';
        const options = { encoding: encoding };
        const stream = fs.createReadStream(filePath, options);
        return this.parseFile(stream);
      }
    }

    module.exports = new CsvToJsonAsync();
  }
});

var require_browserApi = __commonJS({
  '../work/iuccio__csvToJson/src/browserApi.js'(exports, module) {
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
        if (input === undefined || input === null) {
          throw new InputValidationError('Invalid input', 'Input must be a string or Buffer', typeof input, '');
        }
      }

      parseString(csv) {
        const config = this.getConfig();
        return this.csvToJson.parseCsv(String(csv), config);
      }

      parseFile(file) {
        this.validateInput(file);
        return this.csvToJson.parseFile(file);
      }

      parseFileAsync(file) {
        this.validateInput(file);
        const csv = this.csvToJson.parseFile(file);
        return JSON.stringify(csv, null, 2);
      }

      parseFileStream(file) {
        return Promise.resolve(this.parseFileAsync(file));
      }

      readFile(file, options = {}) {
        if (!file) {
          return Promise.resolve(new InputValidationError('Invalid file', 'File is required', typeof file, ''));
        }
        return new Promise((resolve, reject) => {
          if (typeof FileReader === 'undefined') {
            reject(BrowserApiError.fileReaderUnavailable());
            return;
          }
          const reader = new FileReader();
          reader.onerror = () => reject(BrowserApiError.readError(reader.error || new Error('File read error')));
          reader.onload = () => {
            try {
              resolve(this.parseString(reader.result));
            } catch (error) {
              reject(BrowserApiError.readError(error));
            }
          };
          if (options.encoding) {
            reader.readAsText(file, options.encoding);
          } else {
            reader.readAsText(file);
          }
        });
      }

      async parseFileStreamAsync(file) {
        if (typeof ReadableStream === 'undefined') {
          throw BrowserApiError.streamUnavailable();
        }
        if (!file || typeof file.getReader !== 'function') {
          throw new InputValidationError('Invalid file', 'Input must be a readable stream', typeof file, '');
        }
        const config = this.getConfig();
        const options = { async: true };
        const processor = new StreamProcessor(config, options);
        return processor.processFile(file);
      }

      async parseFileWithStream(file) {
        if (!file || !(file instanceof File)) {
          throw new InputValidationError('Invalid file', 'Input must be a File', typeof file, '');
        }
        if (typeof file.stream === 'function') {
          const stream = file.stream();
          return this.parseFileStreamAsync(stream);
        } else {
          return this.readFile(file);
        }
      }

      async parseFileChunked(file, options = {}) {
        if (!file || !(file instanceof File)) {
          throw new InputValidationError('Invalid file', 'Input must be a File', typeof file, '');
        }
        if (!options.chunkSize || typeof options.chunkSize !== 'number') {
          throw new InputValidationError('Invalid chunk size', 'Chunk size must be a number', typeof options.chunkSize, '');
        }
        const chunkSize = options.chunkSize || 1024;
        const config = this.getConfig();
        const processorOptions = { async: true };
        processorOptions.chunkSize = chunkSize;
        processorOptions.onRecord = options.onRecord;
        processorOptions.onComplete = options.onComplete;
        processorOptions.onError = options.onError;
        const processor = new StreamProcessor(config, processorOptions);
        if (typeof file.stream === 'function') {
          const stream = file.stream();
          return processor.processStream(stream);
        } else {
          return this.readFile(file, options);
        }
      }
    }

    module.exports = new BrowserApi();
  }
});

var csvToJson = require_csvToJson();

var encodingOps = {
  utf8: 'utf8',
  utf16le: 'utf16le',
  latin1: 'latin1',
  ascii: 'ascii',
  base64: 'base64',
  hex: 'hex',
  ucs2: 'ucs2'
};

var csvToJsonAsync = require_csvToJsonAsync();

function applyConfigToAllClients(configFn, client) {
  configFn(client);
  configFn(csvToJsonAsync);
  if (exports.browserApi) configFn(exports.browserApi);
  return exports;
}

exports.setValidate = function(validate = true) {
  return applyConfigToAllClients(client => client.setValidate(validate));
};

exports.setValidateField = function(validateField = false) {
  return applyConfigToAllClients(client => client.setValidateField(validateField));
};

exports.setDelimiter = function(delimiter) {
  return applyConfigToAllClients(client => client.setDelimiter(delimiter));
};

exports.setEscape = function(escape = false) {
  return applyConfigToAllClients(client => client.setEscape(escape));
};

exports.setQuote = function(quote) {
  return applyConfigToAllClients(client => client.setQuote(quote));
};

exports.setHeaders = function(headers, delimiter) {
  return applyConfigToAllClients(client => client.setHeaders(headers, delimiter));
};

exports.setSkipLines = function(lines) {
  if (!Array.isArray(lines)) {
    throw new TypeError('Skip lines must be an array');
  }
  if (!lines.every(line => Number.isInteger(line) && line >= 0)) {
    throw new TypeError('Skip lines must contain non-negative integers');
  }
  return applyConfigToAllClients(client => client.setSkipLines(lines));
};

exports.setLimit = function(limit) {
  return applyConfigToAllClients(client => client.setLimit(limit));
};

exports.utf8Encoding = function utf8Encoding() {
  return applyConfigToAllClients(client => client.setEncoding(encodingOps.utf8));
};

exports.utf16leEncoding = function() {
  return applyConfigToAllClients(client => client.setEncoding(encodingOps.utf16le));
};

exports.latin1Encoding = function() {
  return applyConfigToAllClients(client => client.setEncoding(encodingOps.latin1));
};

exports.asciiEncoding = function() {
  return applyConfigToAllClients(client => client.setEncoding(encodingOps.ascii));
};

exports.base64Encoding = function() {
  return applyConfigToAllClients(client => client.setEncoding(encodingOps.base64));
};

exports.hexEncoding = function() {
  return applyConfigToAllClients(client => client.setEncoding(encodingOps.hex));
};

exports.ucs2Encoding = function() {
  return applyConfigToAllClients(client => client.setEncoding(encodingOps.ucs2));
};

exports.setEncoding = function(encoding) {
  return applyConfigToAllClients(client => client.setEncoding(encoding));
};

exports.parseCsv = function(csv, options) {
  if (!csv) throw new Error('CSV input is required');
  if (!options) throw new Error('Options are required');
  csvToJson.parseCsv(csv, options);
};

exports.parseString = function(csv) {
  if (!csv) throw new Error('CSV input is required');
  return csvToJson.parseString(csv);
};

exports.parseFile = function(filePath, options) {
  return csvToJsonAsync.parseFile(filePath, options);
};

exports.parseFileSync = function(filePath, options) {
  return csvToJsonAsync.parseFileSync(filePath, options);
};

exports.parseJson = function(json) {
  return csvToJsonAsync.parseJson(json);
};

exports.parse = function(csv, options) {
  return csvToJsonAsync.parse(csv, options);
};

exports.parseCsvAsync = function(csv) {
  return csvToJsonAsync.parseCsv(csv);
};

exports.parseStringAsync = function(csv) {
  return csvToJsonAsync.parseString(csv);
};

exports.parseFileAsync = function(file) {
  return csvToJson.parseFile(file);
};

exports.parseJsonAsync = function(json) {
  if (json === undefined || json === null) throw new Error('JSON input is required');
  return csvToJson.parseJson(json);
};

exports.browserApi = require_browserApi();
