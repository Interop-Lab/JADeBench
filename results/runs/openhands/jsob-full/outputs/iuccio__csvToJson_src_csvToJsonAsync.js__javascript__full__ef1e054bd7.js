'use strict';

const __getOwnPropNames = Object.getOwnPropertyNames;

const __commonJS = (moduleDefinition, cachedModule) => function requireModule() {
  if (!cachedModule) {
    cachedModule = {
      exports: {}
    };
    const initializerName = __getOwnPropNames(moduleDefinition)[0];
    moduleDefinition[initializerName](cachedModule.exports, cachedModule);
  }
  return cachedModule.exports;
};

const require_errors = __commonJS({
  '../work/iuccio__csvToJson/src/core/errors.js'(exports, module) {
    var CsvParsingError = class extends Error {
      constructor(message, code, context = {}) {
        super(message);
        this.name = 'CsvParsingError';
        this.code = code;
        this.context = context;
        Error.captureStackTrace(this, this.constructor);
      }
      toString() {
        let result = this.name + ': ' + this.message;
        if (this.context && Object.keys(this.context).length > 0) {
          result += '\n\nContext:';
          Object.entries(this.context).forEach(([key, value]) => {
            result += '\n  ' + key + ': ' + this.formatValue(value);
          });
        }
        return result;
      }
      formatValue(value) {
        return null === value ? 'null' : void 0 === value ? 'undefined' : 'string' == typeof value ? '"' + value + '"' : 'object' == typeof value ? JSON.stringify(value) : String(value);
      }
    };
    const errors = {};
    errors.CsvParsingError = CsvParsingError;
    errors.InputValidationError = class extends CsvParsingError {
      constructor(parameterName, expectedType, receivedType, suggestion = '') {
        const message = 'Invalid input: Parameter \'' + parameterName + '\' is required.\nExpected: ' + expectedType + '\nReceived: ' + receivedType + (suggestion ? '\n' + suggestion : ''), context = {};
        context.parameter = parameterName;
        context.expectedType = expectedType;
        context.receivedType = receivedType;
        super(message, 'INPUT_VALIDATION_ERROR', context);
        this.name = 'InputValidationError';
      }
    };
    errors.ConfigurationError = class ConfigurationError extends CsvParsingError {
      constructor(message, context = {}) {
        super(message, 'CONFIGURATION_ERROR', context);
        this.name = 'ConfigurationError';
      }
      static quotedFieldConflict(optionName, value) {
        return new ConfigurationError('Configuration conflict: supportQuotedField() is enabled, but ' + optionName + ' is set to \'' + value + '\'.\nThe quote character (") cannot be used as a field delimiter, separator, or sub-array delimiter when quoted field support is active.\n\nSolutions:\n  1. Use a different character for ' + optionName + ' (e.g., \'|\', \'\\t\', \';\')\n  2. Disable supportQuotedField() if your CSV doesn\'t contain quoted fields\n  3. Refer to RFC 4180 for proper CSV formatting: https://tools.ietf.org/html/rfc4180', {
          optionName: optionName,
          value: value,
          conflictingOption: 'supportQuotedField'
        });
      }
      static invalidHeaderIndex(headerIndex) {
        return new ConfigurationError('Invalid configuration: indexHeader() expects a numeric value.\nReceived: ' + typeof headerIndex + ' (' + headerIndex + ')\n\nSolutions:\n  1. Ensure indexHeader() receives a number: indexHeader(0), indexHeader(1), etc.\n  2. Headers are typically found on row 0 (first line)\n  3. Use indexHeader(2) if headers are on the 3rd line', {
          parameterName: 'indexHeader',
          value: headerIndex,
          type: typeof headerIndex
        });
      }
    };
    errors.CsvFormatError = class CsvFormatError extends CsvParsingError {
      constructor(message, context = {}) {
        super(message, 'CSV_FORMAT_ERROR', context);
        this.name = 'CsvFormatError';
      }
      static missingHeader() {
        return new CsvFormatError('CSV parsing error: No header row found.\nThe CSV file appears to be empty or has no valid header line.\n\nSolutions:\n  1. Ensure your CSV file contains at least one row (header row)\n  2. Verify the file is not empty or contains only whitespace\n  3. Check if you need to use indexHeader(n) to specify a non-standard header row\n  4. Refer to RFC 4180 for proper CSV format: https://tools.ietf.org/html/rfc4180');
      }
      static mismatchedQuotes(location = 'CSV') {
        return new CsvFormatError('CSV parsing error: Mismatched quotes detected in ' + location + '.\nA quoted field was not properly closed with a matching quote character.\n\nRFC 4180 rules for quoted fields:\n  • Fields containing delimiters or quotes MUST be enclosed in double quotes\n  • To include a quote within a quoted field, use two consecutive quotes: ""\n  • Example: "Smith, John" (name contains comma)\n  • Example: "He said ""Hello""" (text contains quotes)\n\nSolutions:\n  1. Review your CSV for properly paired quote characters\n  2. Use double quotes ("") to escape quotes within quoted fields\n  3. Ensure all commas within field values are inside quotes\n  4. Enable supportQuotedField(true) if you\'re using quoted fields', {
          location: location
        });
      }
    };
    errors.FileOperationError = class extends CsvParsingError {
      constructor(operation, filePath, originalError) {
        const message = 'File operation error: Failed to ' + operation + ' file.\nFile path: ' + filePath + '\nReason: ' + originalError.message + '\n\nSolutions:\n  1. Verify the file path is correct: ' + filePath + '\n  2. Check file permissions (read access for input, write access for output)\n  3. Ensure the directory exists and is writable for output files\n  4. Verify the file is not in use by another process', context = {};
        context.operation = operation;
        context.filePath = filePath;
        context.originalError = originalError.message;
        super(message, 'FILE_OPERATION_ERROR', context);
        this.name = 'FileOperationError';
        this.originalError = originalError;
      }
    };
    errors.JsonValidationError = class extends CsvParsingError {
      constructor(csvContent, originalError) {
        super('JSON validation error: The parsed CSV data generated invalid JSON.\nThis typically indicates malformed field names or values in the CSV.\nOriginal error: ' + originalError.message + '\n\nSolutions:\n  1. Check that field names are valid JavaScript identifiers (or will be converted safely)\n  2. Review the CSV data for special characters that aren\'t properly escaped\n  3. Enable supportQuotedField(true) for fields containing special characters\n  4. Verify that formatValueByType() isn\'t converting values incorrectly', 'JSON_VALIDATION_ERROR', {
          originalError: originalError.message,
          csvPreview: csvContent ? csvContent.substring(0, 200) : 'N/A'
        });
        this.name = 'JsonValidationError';
        this.originalError = originalError;
      }
    };
    errors.BrowserApiError = class BrowserApiError extends CsvParsingError {
      constructor(message, context = {}) {
        super(message, 'BROWSER_API_ERROR', context);
        this.name = 'BrowserApiError';
      }
      static fileReaderNotAvailable() {
        return new BrowserApiError('Browser compatibility error: FileReader API is not available.\nYour browser does not support the FileReader API required for file parsing.\n\nSolutions:\n  1. Use a modern browser that supports FileReader (Chrome 13+, Firefox 10+, Safari 6+)\n  2. Consider using csvStringToJson() or csvStringToJsonAsync() for string-based parsing\n  3. Implement a polyfill or alternative file reading method');
      }
      static parseFileError(originalError) {
        return new BrowserApiError('Browser file parsing error: Failed to read and parse the file.\nError details: ' + originalError.message + '\n\nSolutions:\n  1. Verify the file is a valid CSV file\n  2. Check the file encoding (UTF-8 is recommended)\n  3. Try a smaller file to isolate the issue\n  4. Check browser console for additional error details', {
          originalError: originalError.message
        });
      }
      static streamingNotSupported() {
        return new BrowserApiError('Browser compatibility error: ReadableStream API is not available.\nYour browser does not support the ReadableStream API required for streaming.\n\nSolutions:\n  1. Use a modern browser that supports ReadableStream (Chrome 43+, Firefox 65+, Safari 10.1+)\n  2. Use getJsonFromFileStreamingAsync() which falls back to regular file parsing\n  3. Consider using parseFile() for non-streaming file parsing\n  4. Implement a polyfill for ReadableStream support');
      }
    };
    module.exports = errors;
  }
});

const require_fileUtils = __commonJS({
  '../work/iuccio__csvToJson/src/util/fileUtils.js'(exports, module) {
    var fs = require('fs'), {FileOperationError: FileOperationError} = require_errors(), encodedFileTypes = new Set([ 'base64', 'hex' ]);
    module.exports = new class {
      _isEncodedFile(encoding) {
        return encodedFileTypes.has(encoding);
      }
      _decodeContent(content, encoding) {
        return this._isEncodedFile(encoding) ? Buffer.from(content, encoding).toString('utf8') : content;
      }
      _toString(value) {
        return 'string' == typeof value ? value : value.toString();
      }
      _wrapReadError(filePath, error) {
        return new FileOperationError('read', filePath, error);
      }
      _wrapWriteError(filePath, error) {
        return new FileOperationError('write', filePath, error);
      }
      _readFileSync(filePath, encoding) {
        if (this._isEncodedFile(encoding)) {
          const content = fs.readFileSync(filePath, 'utf8');
          return this._decodeContent(content, encoding);
        }
        return this._toString(fs.readFileSync(filePath, encoding));
      }
      readFile(filePath, encoding = 'utf8') {
        try {
          return this._readFileSync(filePath, encoding);
        } catch (error) {
          throw this._wrapReadError(filePath, error);
        }
      }
      _readFileAsyncWithPromises(filePath, encoding) {
        return this._isEncodedFile(encoding) ? fs.promises.readFile(filePath, 'utf8').then((content => this._decodeContent(content, encoding))) : fs.promises.readFile(filePath, encoding).then((content => this._toString(content)));
      }
      readFileAsync(filePath, encoding = 'utf8') {
        return fs.promises && 'function' == typeof fs.promises.readFile ? this._readFileAsyncWithPromises(filePath, encoding).catch((error => {
          throw this._wrapReadError(filePath, error);
        })) : new Promise(((resolve, reject) => {
          const handleRead = (error, content) => {
            if (error) reject(this._wrapReadError(filePath, error)); else try {
              {
                const decodedContent = this._isEncodedFile(encoding) ? this._decodeContent(this._toString(content), encoding) : this._toString(content);
                resolve(decodedContent);
              }
            } catch (error) {
              reject(this._wrapReadError(filePath, error));
            }
          }, readEncoding = this._isEncodedFile(encoding) ? 'utf8' : encoding;
          fs.readFile(filePath, readEncoding, handleRead);
        }));
      }
      _writeFileSync(filePath, content) {
        fs.writeFileSync(filePath, content, 'utf8');
      }
      _writeFileAsyncWithPromises(filePath, content) {
        return fs.promises.writeFile(filePath, content, 'utf8');
      }
      writeFile(content, filePath) {
        try {
          this._writeFileSync(filePath, content);
        } catch (error) {
          throw this._wrapWriteError(filePath, error);
        }
      }
      writeFileAsync(content, filePath) {
        return fs.promises && 'function' == typeof fs.promises.writeFile ? this._writeFileAsyncWithPromises(filePath, content).catch((error => {
          throw this._wrapWriteError(filePath, error);
        })) : new Promise(((resolve, reject) => {
          fs.writeFile(filePath, content, 'utf8', (error => {
            error ? reject(this._wrapWriteError(filePath, error)) : resolve();
          }));
        }));
      }
    };
  }
});

const require_stringUtils = __commonJS({
  '../work/iuccio__csvToJson/src/util/stringUtils.js'(exports, module) {
    const patterns = {
      INTEGER: /^-?\d+$/,
      FLOAT: /^-?\d*\.\d+$/,
      WHITESPACE: /\s/g
    }, booleanValues = {
      TRUE: 'true',
      FALSE: 'false'
    };
    module.exports = new class StringUtils {
      static PATTERNS=patterns;
      static BOOLEAN_VALUES=booleanValues;
      trimPropertyName(removeAllWhitespace, propertyName) {
        return propertyName ? removeAllWhitespace ? propertyName.replace(StringUtils.PATTERNS.WHITESPACE, '') : propertyName.trim() : '';
      }
      getValueFormatByType(value) {
        return this.isEmpty(value) ? String() : this.isBoolean(value) ? this.convertToBoolean(value) : this.isInteger(value) ? this.convertInteger(value) : this.isFloat(value) ? this.convertFloat(value) : String(value);
      }
      hasContent(values = []) {
        return Array.isArray(values) && values.some((value => Boolean(value)));
      }
      isEmpty(value) {
        return void 0 === value || '' === value;
      }
      isBoolean(value) {
        const normalizedValue = value.toLowerCase();
        return normalizedValue === StringUtils.BOOLEAN_VALUES.TRUE || normalizedValue === StringUtils.BOOLEAN_VALUES.FALSE;
      }
      isInteger(value) {
        return StringUtils.PATTERNS.INTEGER.test(value);
      }
      isFloat(value) {
        return StringUtils.PATTERNS.FLOAT.test(value);
      }
      hasLeadingZero(value) {
        const hasPositiveLeadingZero = value.length > 1 && '0' === value[0], hasNegativeLeadingZero = value.length > 2 && '-' === value[0] && '0' === value[1];
        return hasPositiveLeadingZero || hasNegativeLeadingZero;
      }
      convertToBoolean(value) {
        return JSON.parse(value.toLowerCase());
      }
      convertInteger(value) {
        if (this.hasLeadingZero(value)) return String(value);
        const number = Number(value);
        return Number.isSafeInteger(number) ? number : String(value);
      }
      convertFloat(value) {
        const number = Number(value);
        return Number.isFinite(number) ? number : String(value);
      }
    };
  }
});

const require_jsonUtils = __commonJS({
  '../work/iuccio__csvToJson/src/util/jsonUtils.js'(exports, module) {
    var {JsonValidationError: JsonValidationError} = require_errors();
    module.exports = new class {
      validateJson(json) {
        try {
          JSON.parse(json);
        } catch (error) {
          throw new JsonValidationError(json, error);
        }
      }
    };
  }
});

const require_parserConfig = __commonJS({
  '../work/iuccio__csvToJson/src/core/parserConfig.js'(exports, module) {
    module.exports = class {
      constructor(config = {}) {
        this.delimiter = config.delimiter;
        this.encoding = config.encoding;
        this.isSupportQuotedField = config.isSupportQuotedField;
        this.isTrimHeaderFieldWhiteSpace = config.isTrimHeaderFieldWhiteSpace;
        this.indexHeaderValue = config.indexHeaderValue;
        this.parseSubArrayDelimiter = config.parseSubArrayDelimiter;
        this.parseSubArraySeparator = config.parseSubArraySeparator;
        this.printValueFormatByType = config.printValueFormatByType;
        this.rowMapper = config.rowMapper;
        this.indexesToIgnore = config.indexesToIgnore ? Object.freeze([ ...config.indexesToIgnore ]) : Object.freeze([]);
        Object.freeze(this);
      }
    };
  }
});

const require_configurable = __commonJS({
  '../work/iuccio__csvToJson/src/core/configurable.js'(exports, module) {
    var {ConfigurationError: ConfigurationError} = require_errors(), ParserConfig = require_parserConfig();
    module.exports = class {
      constructor(initialConfig = {}) {
        const config = {
          ...initialConfig
        };
        this.config = config;
      }
      formatValueByType(enabled = !0) {
        this.config.printValueFormatByType = enabled;
        return this;
      }
      supportQuotedField(enabled = !1) {
        this.config.isSupportQuotedField = enabled;
        return this;
      }
      fieldDelimiter(delimiter) {
        this.config.delimiter = delimiter;
        return this;
      }
      trimHeaderFieldWhiteSpace(enabled = !1) {
        this.config.isTrimHeaderFieldWhiteSpace = enabled;
        return this;
      }
      indexHeader(headerIndex) {
        if (isNaN(headerIndex)) throw ConfigurationError.invalidHeaderIndex(headerIndex);
        this.config.indexHeaderValue = headerIndex;
        return this;
      }
      parseSubArray(delimiter = '*', separator = ',') {
        this.config.parseSubArrayDelimiter = delimiter;
        this.config.parseSubArraySeparator = separator;
        return this;
      }
      mapRows(mapper) {
        if ('function' != typeof mapper) throw new TypeError('mapperFn must be a function');
        this.config.rowMapper = mapper;
        return this;
      }
      ignoreColumnIndexes(indexes) {
        Array.isArray(indexes);
        this.config.indexesToIgnore = [ ...indexes ];
        return this;
      }
      encoding(encoding) {
        this.config.encoding = encoding;
        return this;
      }
      getParserConfig() {
        return new ParserConfig(this.config);
      }
    };
  }
});

const require_csvToJson = __commonJS({
  '../work/iuccio__csvToJson/src/csvToJson.js'(exports, module) {
    const fileUtils = require_fileUtils();
    const stringUtils = require_stringUtils();
    const jsonUtils = require_jsonUtils();
    const { ConfigurationError, CsvFormatError } = require_errors();
    const Configurable = require_configurable();
    require_parserConfig();

    class CsvToJson extends Configurable {
      csvToJsonWithConfig(csvContent, config) {
        this.validateInputConfig(config);
        const records = this.parseRecords(csvContent), fieldDelimiter = this.getFieldDelimiter(config);
        let headers, headerIndex = this.getIndexHeader(config);
        for (;headerIndex < records.length; ) {
          headers = this.getFields(records[headerIndex], config, fieldDelimiter);
          if (stringUtils.hasContent(headers)) break;
          headerIndex++;
        }
        if (!headers) throw CsvFormatError.missingHeader();
        const results = [];
        for (let recordIndex = headerIndex + 1; recordIndex < records.length; recordIndex++) {
          const fields = this.getFields(records[recordIndex], config, fieldDelimiter);
          if (stringUtils.hasContent(fields)) {
            let row = this.buildJsonResult(headers, fields, config);
            if (config.rowMapper) {
              row = config.rowMapper(row, recordIndex - (headerIndex + 1));
              null != row && results.push(row);
            } else results.push(row);
          }
        }
        return results;
      }
      generateJsonFileFromCsv(csvFilePath, jsonFilePath) {
        let json = this.getJsonFromCsvStringified(csvFilePath);
        fileUtils.writeFile(json, jsonFilePath);
      }
      getJsonFromCsvStringified(csvFilePath) {
        let result = this.getJsonFromCsv(csvFilePath), json = JSON.stringify(result, void 0, 1);
        jsonUtils.validateJson(json);
        return json;
      }
      getJsonFromCsv(csvFilePath) {
        const config = this.getParserConfig(), csvContent = fileUtils.readFile(csvFilePath, config.encoding || 'utf8');
        return this.csvToJson(csvContent);
      }
      csvStringToJson(csvContent) {
        return this.csvToJson(csvContent);
      }
      csvStringToJsonStringified(csvContent) {
        let result = this.csvStringToJson(csvContent), json = JSON.stringify(result, void 0, 1);
        jsonUtils.validateJson(json);
        return json;
      }
      csvToJson(csvContent) {
        return this.csvToJsonWithConfig(csvContent, this.getParserConfig());
      }
      parseRecords(csvContent) {
        const records = [];
        let currentRecord = '';
        let insideQuotes = false;
        let index = 0;

        while (index < csvContent.length) {
          const character = csvContent[index];
          if (character === '"') {
            if (insideQuotes && csvContent[index + 1] === '"') {
              currentRecord += '""';
              index += 2;
            } else {
              insideQuotes = !insideQuotes;
              currentRecord += character;
              index++;
            }
            continue;
          }

          if (!insideQuotes) {
            const lineEndingLength = this.getLineEndingLength(csvContent, index);
            if (lineEndingLength > 0) {
              records.push(currentRecord);
              currentRecord = '';
              index += lineEndingLength;
              continue;
            }
          }

          currentRecord += character;
          index++;
        }

        if (currentRecord.length > 0) records.push(currentRecord);
        if (insideQuotes) throw CsvFormatError.mismatchedQuotes('CSV');
        return records;
      }
      getLineEndingLength(content, index) {
        return '\r\n' === content.slice(index, index + 2) ? 2 : '\n' === content[index] || '\r' === content[index] && '\n' !== content[index + 1] ? 1 : 0;
      }
      getFieldDelimiter(config = this.config) {
        return config.delimiter ? config.delimiter : ',';
      }
      getIndexHeader(config = this.config) {
        return null === config.indexHeaderValue || isNaN(config.indexHeaderValue) ? 0 : config.indexHeaderValue;
      }
      getFields(record, config = this.config, delimiter = this.getFieldDelimiter(config)) {
        return config.isSupportQuotedField ? this.split(record, config) : record.split(delimiter);
      }
      buildJsonResult(headers, fields, config = this.config) {
        let result = {};
        const ignoredIndexes = config.indexesToIgnore ? new Set(config.indexesToIgnore) : new Set;
        for (let index = 0; index < headers.length; index++) {
          if (ignoredIndexes.has(index)) continue;

          const propertyName = stringUtils.trimPropertyName(config.isTrimHeaderFieldWhiteSpace, headers[index]);
          let value = fields[index];
          if (this.isParseSubArray(value, config)) {
            value = this.buildJsonSubArray(value, config);
          }
          if (config.printValueFormatByType && !Array.isArray(value)) {
            value = stringUtils.getValueFormatByType(fields[index]);
          }
          result[propertyName] = value;
        }
        return result;
      }
      buildJsonSubArray(value, config = this.config) {
        let arrayContent = value.substring(value.indexOf(config.parseSubArrayDelimiter) + 1, value.lastIndexOf(config.parseSubArrayDelimiter));
        arrayContent.trim();
        value = arrayContent.split(config.parseSubArraySeparator);
        if (config.printValueFormatByType) for (let index = 0; index < value.length; index++) value[index] = stringUtils.getValueFormatByType(value[index]);
        return value;
      }
      isParseSubArray(value, config = this.config) {
        return !(!config.parseSubArrayDelimiter || !value || 0 !== value.indexOf(config.parseSubArrayDelimiter) || value.lastIndexOf(config.parseSubArrayDelimiter) !== value.length - 1);
      }
      validateInputConfig(config = this.config) {
        if (config.isSupportQuotedField) {
          if ('"' === this.getFieldDelimiter(config)) throw ConfigurationError.quotedFieldConflict('fieldDelimiter', '"');
          if ('"' === config.parseSubArraySeparator) throw ConfigurationError.quotedFieldConflict('parseSubArraySeparator', '"');
          if ('"' === config.parseSubArrayDelimiter) throw ConfigurationError.quotedFieldConflict('parseSubArrayDelimiter', '"');
        }
      }
      hasQuotes(value) {
        return value.includes('"');
      }
      split(record, config = this.config) {
        if (record.length === 0) return [];

        const fields = [];
        const delimiter = this.getFieldDelimiter(config);
        let currentField = '';
        let insideQuotes = false;

        for (let index = 0; index < record.length; index++) {
          const character = record[index];
          if (character === '"') {
            if (this.isEscapedQuote(record, index, insideQuotes)) {
              currentField += '"';
              index++;
            } else if (this.isEmptyQuotedField(record, index, insideQuotes, currentField, delimiter)) {
              index++;
            } else {
              insideQuotes = !insideQuotes;
            }
          } else if (character === delimiter && !insideQuotes) {
            fields.push(currentField);
            currentField = '';
          } else {
            currentField += character;
          }
        }

        fields.push(currentField);
        if (insideQuotes) throw CsvFormatError.mismatchedQuotes('row');
        return fields;
      }
      isEscapedQuote(record, index, insideQuotes) {
        return insideQuotes && index + 1 < record.length && '"' === record[index + 1];
      }
      isEmptyQuotedField(record, index, insideQuotes, currentField, delimiter) {
        if (insideQuotes || '' !== currentField || index + 1 >= record.length) return !1;
        if ('"' !== record[index + 1]) return !1;
        let nextIndex = index + 2;
        return nextIndex === record.length || record[nextIndex] === delimiter;
      }
    }

    module.exports = new CsvToJson();
    module.exports.CsvToJson = CsvToJson;
  }
});

const require_streamProcessor = __commonJS({
  '../work/iuccio__csvToJson/src/core/streamProcessor.js'(exports, module) {
    var stringUtils = require_stringUtils();
    module.exports = class {
      constructor(config, options = {}) {
        this.csvConfig = config;
        this.isBrowser = options.isBrowser || 'undefined' != typeof window && 'undefined' != typeof document;
        this.buffer = '';
        this.isInsideQuotes = !1;
        this.headers = null;
        this.headerRowIndex = null === config.indexHeaderValue || isNaN(config.indexHeaderValue) ? 0 : config.indexHeaderValue;
        this.currentRecordIndex = 0;
        this.parsedRecords = [];
        this.dataRowIndex = 0;
        this.ignoredIndexes = new Set(config.indexesToIgnore || []);
        this.chunkSize = options.chunkSize || 1e3;
        this.onChunk = options.onChunk;
        this.onComplete = options.onComplete;
        this.onError = options.onError;
        this.allRecords = [];
      }
      processChunk(chunk) {
        let text;
        text = 'string' == typeof chunk ? chunk : this.isBrowser && void 0 !== globalThis.TextDecoder ? (new globalThis.TextDecoder).decode(chunk) : this.isBrowser ? String.fromCharCode.apply(null, new Uint8Array(chunk)) : chunk.toString();
        this.buffer += text;
        this._processCompleteRecords();
      }
      async processStreamWithCallbacks(stream) {
        return new Promise(((resolve, reject) => {
          if (this.isBrowser) {
            if (!stream || 'function' != typeof stream.getReader) {
              const error = new Error('Invalid ReadableStream provided');
              this.onError && this.onError(error);
              reject(error);
              return;
            }
            const reader = stream.getReader();
            (async () => {
              try {
                for (;;) {
                  const {done: done, value: chunk} = await reader.read();
                  if (done) {
                    this.finalizeProcessing();
                    this._sendRemainingChunks();
                    this.onComplete && this.onComplete(this.allRecords);
                    resolve();
                    return;
                  }
                  this.processChunk(chunk);
                  this._sendPendingChunks();
                }
              } catch (error) {
                this.onError && this.onError(error);
                reject(error);
              }
            })();
          } else {
            if (!stream || 'function' != typeof stream.pipe) {
              const error = new Error('Invalid Readable stream provided');
              this.onError && this.onError(error);
              reject(error);
              return;
            }
            stream.on('data', (chunk => {
              try {
                this.processChunk(chunk);
                this._sendPendingChunks();
              } catch (error) {
                this.onError && this.onError(error);
                reject(error);
              }
            }));
            stream.on('end', (() => {
              try {
                this.finalizeProcessing();
                this._sendRemainingChunks();
                this.onComplete && this.onComplete(this.allRecords);
                resolve();
              } catch (error) {
                this.onError && this.onError(error);
                reject(error);
              }
            }));
            stream.on('error', (error => {
              this.onError && this.onError(error);
              reject(error);
            }));
          }
        }));
      }
      _sendPendingChunks() {
        if (this.onChunk) for (;this.parsedRecords.length >= this.chunkSize; ) {
          const records = this.parsedRecords.splice(0, this.chunkSize);
          this.allRecords.push(...records);
          this.onChunk(records, this.allRecords.length, null);
        }
      }
      _sendRemainingChunks() {
        if (!this.onChunk || 0 === this.parsedRecords.length) return;
        const records = [ ...this.parsedRecords ];
        this.parsedRecords.length = 0;
        this.allRecords.push(...records);
        this.onChunk(records, this.allRecords.length, this.allRecords.length);
      }
      async processStream(stream) {
        return new Promise(((resolve, reject) => {
          if (this.isBrowser) {
            if (!stream || 'function' != typeof stream.getReader) {
              reject(new Error('Invalid ReadableStream provided'));
              return;
            }
            const reader = stream.getReader();
            (async () => {
              try {
                for (;;) {
                  const {done: done, value: chunk} = await reader.read();
                  if (done) {
                    this.finalizeProcessing();
                    resolve(this.getResult());
                    return;
                  }
                  this.processChunk(chunk);
                }
              } catch (error) {
                reject(error);
              }
            })();
          } else {
            if (!stream || 'function' != typeof stream.pipe) {
              reject(new Error('Invalid Readable stream provided'));
              return;
            }
            stream.on('data', (chunk => {
              try {
                this.processChunk(chunk);
              } catch (error) {
                reject(error);
              }
            }));
            stream.on('end', (() => {
              try {
                this.finalizeProcessing();
                resolve(this.getResult());
              } catch (error) {
                reject(error);
              }
            }));
            stream.on('error', (error => {
              reject(error);
            }));
          }
        }));
      }
      finalizeProcessing() {
        this._processRemainingBuffer();
        this._validateProcessingResult();
      }
      getResult() {
        return this.parsedRecords;
      }
      _processCompleteRecords() {
        const parsedBuffer = this._parseRecordsFromBuffer(this.buffer, this.isInsideQuotes);
        this.buffer = parsedBuffer.remainingBuffer;
        this.isInsideQuotes = parsedBuffer.isInsideQuotes;
        for (const record of parsedBuffer.completeRecords) this._processRecord(record);
        this.currentRecordIndex++;
      }
      _processRemainingBuffer() {
        if (this.buffer.length > 0) {
          if (this.isInsideQuotes) throw CsvFormatError.mismatchedQuotes('CSV stream');
          const parsedBuffer = this._parseRecordsFromBuffer(this.buffer + '\n', !1);
          for (const record of parsedBuffer.completeRecords) this._processRecord(record);
          this.currentRecordIndex++;
        }
      }
      _processRecord(record) {
        if (this.headers === null && this.currentRecordIndex === this.headerRowIndex) {
          this._processHeaderRecord(record);
        } else if (this.headers !== null) {
          this._processDataRecord(record);
        }
      }
      _processHeaderRecord(record) {
        const headers = this._splitRecord(record);
        if (stringUtils.hasContent(headers)) {
          this.headers = headers;
        }
      }
      _processDataRecord(record) {
        const fields = this._splitRecord(record);
        if (stringUtils.hasContent(fields)) {
          const row = this._buildJsonResult(this.headers, fields);
          const mappedRow = this._applyRowMapper(row);
          if (mappedRow !== null) this.parsedRecords.push(mappedRow);
        }
      }
      _applyRowMapper(row) {
        if (this.csvConfig.rowMapper) {
          const mappedRow = this.csvConfig.rowMapper(row, this.dataRowIndex);
          this.dataRowIndex++;
          return mappedRow;
        }
        this.dataRowIndex++;
        return row;
      }
      _splitRecord(record) {
        return this.csvConfig.isSupportQuotedField ? this._splitWithConfig(record, this.csvConfig) : record.split(this.csvConfig.delimiter || ',');
      }
      _splitWithConfig(record, config) {
        if (record.length === 0) return [];

        const fields = [];
        const delimiter = config.delimiter || ',';
        let currentField = '';
        let insideQuotes = false;

        for (let index = 0; index < record.length; index++) {
          const character = record[index];
          if (character === '"') {
            if (insideQuotes && record[index + 1] === '"') {
              currentField += '"';
              index++;
            } else {
              insideQuotes = !insideQuotes;
            }
          } else if (character === delimiter && !insideQuotes) {
            fields.push(currentField);
            currentField = '';
          } else {
            currentField += character;
          }
        }

        fields.push(currentField);
        if (insideQuotes) throw CsvFormatError.mismatchedQuotes('row');
        return fields;
      }
      _buildJsonResult(headers, fields) {
        const result = {};
        for (let index = 0; index < headers.length; index++) {
          if (this.ignoredIndexes.has(index)) continue;

          const propertyName = stringUtils.trimPropertyName(this.csvConfig.isTrimHeaderFieldWhiteSpace, headers[index]);
          let value = fields[index];
          if (this._isParseSubArray(value)) {
            value = this._buildJsonSubArray(value);
          }
          if (this.csvConfig.printValueFormatByType && !Array.isArray(value)) {
            value = stringUtils.getValueFormatByType(fields[index]);
          }
          result[propertyName] = value;
        }
        return result;
      }
      _isParseSubArray(value) {
        return !!this.csvConfig.parseSubArrayDelimiter && value && 0 === value.indexOf(this.csvConfig.parseSubArrayDelimiter) && value.lastIndexOf(this.csvConfig.parseSubArrayDelimiter) === value.length - 1;
      }
      _buildJsonSubArray(value) {
        const values = value.substring(value.indexOf(this.csvConfig.parseSubArrayDelimiter) + 1, value.lastIndexOf(this.csvConfig.parseSubArrayDelimiter)).split(this.csvConfig.parseSubArraySeparator);
        if (this.csvConfig.printValueFormatByType) for (let index = 0; index < values.length; index++) values[index] = stringUtils.getValueFormatByType(values[index]);
        return values;
      }
      _parseRecordsFromBuffer(buffer, insideQuotes) {
        const completeRecords = [];
        let remainingBuffer = '', index = 0;
        for (;index < buffer.length; ) {
          const character = buffer[index];
          if ('"' === character) {
            const escapedQuote = this._handleEscapedQuote(buffer, index, insideQuotes);
            if (escapedQuote.wasEscaped) {
              remainingBuffer += '""';
              index = escapedQuote.newIndex;
              continue;
            }
            insideQuotes = !insideQuotes;
          } else if (!insideQuotes && this._isLineEnding(buffer, index)) {
            const lineEndingLength = this._getLineEndingLength(buffer, index);
            completeRecords.push(remainingBuffer);
            remainingBuffer = '';
            index += lineEndingLength;
            continue;
          }
          remainingBuffer += character;
          index++;
        }
        const result = {};
        result.completeRecords = completeRecords;
        result.remainingBuffer = remainingBuffer;
        result.isInsideQuotes = insideQuotes;
        return result;
      }
      _handleEscapedQuote(buffer, index, insideQuotes) {
        return insideQuotes && index + 1 < buffer.length && '"' === buffer[index + 1] ? {
          wasEscaped: !0,
          newIndex: index + 2
        } : {
          wasEscaped: !1,
          newIndex: index + 1
        };
      }
      _isLineEnding(buffer, index) {
        return this._getLineEndingLength(buffer, index) > 0;
      }
      _getLineEndingLength(buffer, index) {
        return '\r\n' === buffer.slice(index, index + 2) ? 2 : '\n' === buffer[index] || '\r' === buffer[index] && '\n' !== buffer[index + 1] ? 1 : 0;
      }
      _validateProcessingResult() {
        if ((this.headers || 0 !== this.parsedRecords.length) && !this.headers) throw CsvFormatError.missingHeader();
      }
    };
  }
});

const fileUtils = require_fileUtils(), csvToJson = require_csvToJson(), Configurable = require_configurable(), {InputValidationError: InputValidationError} = require_errors(), StreamProcessor = require_streamProcessor();

const rawInputOptions = {
  raw: !0
};

var CsvToJsonAsync = class extends Configurable {
  constructor() {
    super();
    this.csvToJson = csvToJson;
  }
  async generateJsonFileFromCsv(csvFilePath, jsonFilePath) {
    const json = await this.getJsonFromCsvStringified(csvFilePath);
    await fileUtils.writeFileAsync(json, jsonFilePath);
  }
  async getJsonFromCsvStringified(csvFilePath) {
    const result = await this.getJsonFromCsvAsync(csvFilePath);
    return JSON.stringify(result, void 0, 1);
  }
  async getJsonFromCsvAsync(inputFileNameOrCsv, options = {}) {
    if (null == inputFileNameOrCsv) throw new InputValidationError('inputFileNameOrCsv', 'string (file path) or CSV string content', typeof inputFileNameOrCsv, 'Either provide a valid file path or CSV content as a string.');
    const config = this.getParserConfig();
    if (options.raw) return '' === inputFileNameOrCsv ? [] : this.csvToJson.csvToJsonWithConfig(inputFileNameOrCsv, config);
    const csvContent = await fileUtils.readFileAsync(inputFileNameOrCsv, config.encoding || 'utf8');
    return this.csvToJson.csvToJsonWithConfig(csvContent, config);
  }
  csvStringToJsonAsync(csvContent, options = rawInputOptions) {
    return this.getJsonFromCsvAsync(csvContent, options);
  }
  async getJsonFromStreamAsync(stream) {
    this._validateStream(stream);
    const config = this.getParserConfig();
    return new StreamProcessor(config, {
      isBrowser: !1
    }).processStream(stream);
  }
  _validateStream(stream) {
    if (!stream || 'function' != typeof stream.pipe) throw new InputValidationError('stream', 'Readable stream', typeof stream, 'Provide a valid Node.js Readable stream.');
  }
  async getJsonFromFileStreamingAsync(filePath) {
    if (!filePath || 'string' != typeof filePath) throw new InputValidationError('filePath', 'string (file path)', typeof filePath, 'Provide a valid file path as a string.');
    const fs = require('fs'), config = this.getParserConfig(), encoding = 'string' == typeof config.encoding ? config.encoding : 'utf8', streamOptions = {};
    streamOptions.encoding = encoding;
    const stream = fs.createReadStream(filePath, streamOptions);
    return this.getJsonFromStreamAsync(stream);
  }
};

module.exports = new CsvToJsonAsync;
