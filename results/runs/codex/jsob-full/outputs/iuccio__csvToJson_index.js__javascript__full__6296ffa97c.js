'use strict';
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (moduleFactories, cachedModule) => function loadModule() {
  if (!cachedModule) {
    cachedModule = { exports: {} };
    moduleFactories[__getOwnPropNames(moduleFactories)[0]](cachedModule.exports, cachedModule);
  }
  return cachedModule.exports;
};
var require_errors = __commonJS({
  '../work/iuccio__csvToJson/src/core/errors.js'(exports, module) {
    'use strict';
    var CsvParsingError = class extends Error {
      constructor(message, code, context = {
      }) {
        {
          {
            super(message);
            this.name = "CsvParsingError";
            this.code = code;
            this.context = context;
            Error.captureStackTrace(this, this.constructor);
          }
        }
      }
      toString() {
        {
          let text = this.name + ':\x20' + this.message;
          return this.context && ((Object.keys(this.context).length) > (0)) && (text += "\n\nContext:", Object.entries(this.context).forEach(([contextKey, contextValue]) => {
            text += "\n  " + contextKey + ':\x20' + this.formatValue(contextValue);
          })), text;
        }
      }
      formatValue(value) {
        {
          {
            if (((value) === (null)))return "null";
            if (((value) === (void 0)))return "undefined";
            if (((typeof value) === ("string")))return '\x22' + value + '\x22';
            if (((typeof value) === ("object")))return JSON.stringify(value);
            return (String)((value));
          }
        }
      }
    };
    var InputValidationError = class extends CsvParsingError {
      constructor(parameterName, expectedType, receivedType, guidance = '') {
        
        
        {
          const text = "Invalid input: Parameter '" + parameterName + ("' is required.\nExpected: ") + expectedType + ("\nReceived: ") + receivedType + (guidance ? (('\x0a') + (guidance)): ''), errorContext = {
          };
          errorContext.parameter = parameterName, errorContext.expectedType = expectedType, errorContext.receivedType = receivedType, super(text, "INPUT_VALIDATION_ERROR", errorContext), this.name = "InputValidationError";
        }
      }
    }, ConfigurationError = class ConfigurationError extends CsvParsingError {
      constructor(message, context = {
      }) {
        super(message, "CONFIGURATION_ERROR", context);
        this.name = "ConfigurationError";
      }
      static quotedFieldConflict(optionName, value) {
        return new ConfigurationError("Configuration conflict: supportQuotedField() is enabled, but " + optionName + (" is set to '") + value + ("'.\nThe quote character (\") cannot be used as a field delimiter, separator, or sub-array delimiter when quoted field support is active.\n\nSolutions:\n  1. Use a different character for ") + optionName + (" (e.g., '|', '\\t', ';')\n  2. Disable supportQuotedField() if your CSV doesn't contain quoted fields\n  3. Refer to RFC 4180 for proper CSV formatting: https://tools.ietf.org/html/rfc4180"), {
          'optionName': optionName, 'value': value, 'conflictingOption': "supportQuotedField"
        });
      }
      static invalidHeaderIndex(headerIndex) {
        return new ConfigurationError("Invalid configuration: indexHeader() expects a numeric value.\nReceived: " + typeof headerIndex + '\x20(' + headerIndex + (")\n\nSolutions:\n  1. Ensure indexHeader() receives a number: indexHeader(0), indexHeader(1), etc.\n  2. Headers are typically found on row 0 (first line)\n  3. Use indexHeader(2) if headers are on the 3rd line"), {
          'parameterName': "indexHeader", 'value': headerIndex, 'type': typeof headerIndex
        });
      }
    }, CsvFormatError = class CsvFormatError extends CsvParsingError {
      constructor(message, context = {
      }) {
        super(message, "CSV_FORMAT_ERROR", context);
        this.name = "CsvFormatError";
      }
      static missingHeader() {
        return new CsvFormatError("CSV parsing error: No header row found.\nThe CSV file appears to be empty or has no valid header line.\n\nSolutions:\n  1. Ensure your CSV file contains at least one row (header row)\n  2. Verify the file is not empty or contains only whitespace\n  3. Check if you need to use indexHeader(n) to specify a non-standard header row\n  4. Refer to RFC 4180 for proper CSV format: https://tools.ietf.org/html/rfc4180");
      }
      static mismatchedQuotes(location = "CSV") {
        return new CsvFormatError("CSV parsing error: Mismatched quotes detected in " + location + (".\nA quoted field was not properly closed with a matching quote character.\n\nRFC 4180 rules for quoted fields:\n  • Fields containing delimiters or quotes MUST be enclosed in double quotes\n  • To include a quote within a quoted field, use two consecutive quotes: \"\"\n  • Example: \"Smith, John\" (name contains comma)\n  • Example: \"He said \"\"Hello\"\"\" (text contains quotes)\n\nSolutions:\n  1. Review your CSV for properly paired quote characters\n  2. Use double quotes (\"\") to escape quotes within quoted fields\n  3. Ensure all commas within field values are inside quotes\n  4. Enable supportQuotedField(true) if you're using quoted fields"), {
          'location': location
        });
      }
    }, FileOperationError = class extends CsvParsingError {
      constructor(operation, filePath, error) {
        {
          const text = "File operation error: Failed to " + operation + (" file.\nFile path: ") + filePath + ("\nReason: ") + error.message + ("\n\nSolutions:\n  1. Verify the file path is correct: ") + filePath + ("\n  2. Check file permissions (read access for input, write access for output)\n  3. Ensure the directory exists and is writable for output files\n  4. Verify the file is not in use by another process"), context = {
          };
          context.operation = operation, context.filePath = filePath, context.originalError = error.message, super(text, "FILE_OPERATION_ERROR", context), this.name = "FileOperationError", this.originalError = error;
        }
      }
    }, JsonValidationError = class extends CsvParsingError {
      constructor(csvText, error) {
        {
          const text = "JSON validation error: The parsed CSV data generated invalid JSON.\nThis typically indicates malformed field names or values in the CSV.\nOriginal error: " + error.message + ("\n\nSolutions:\n  1. Check that field names are valid JavaScript identifiers (or will be converted safely)\n  2. Review the CSV data for special characters that aren't properly escaped\n  3. Enable supportQuotedField(true) for fields containing special characters\n  4. Verify that formatValueByType() isn't converting values incorrectly");
          super(text, "JSON_VALIDATION_ERROR", {
            'originalError': error.message, 'csvPreview': csvText ? csvText.substring(0, 200): "N/A"
          }), this.name = "JsonValidationError", this.originalError = error;
        }
      }
    }, BrowserApiError = class BrowserApiError extends CsvParsingError {
      constructor(message, context = {
      }) {
        super(message, "BROWSER_API_ERROR", context), this.name = "BrowserApiError";
      }
      static fileReaderNotAvailable() {
        return new BrowserApiError("Browser compatibility error: FileReader API is not available.\nYour browser does not support the FileReader API required for file parsing.\n\nSolutions:\n  1. Use a modern browser that supports FileReader (Chrome 13+, Firefox 10+, Safari 6+)\n  2. Consider using csvStringToJson() or csvStringToJsonAsync() for string-based parsing\n  3. Implement a polyfill or alternative file reading method");
      }
      static parseFileError(error) {
        return new BrowserApiError("Browser file parsing error: Failed to read and parse the file.\nError details: " + error.message + ("\n\nSolutions:\n  1. Verify the file is a valid CSV file\n  2. Check the file encoding (UTF-8 is recommended)\n  3. Try a smaller file to isolate the issue\n  4. Check browser console for additional error details"), {
          'originalError': error.message
        });
      }
      static streamingNotSupported() {
        return new BrowserApiError("Browser compatibility error: ReadableStream API is not available.\nYour browser does not support the ReadableStream API required for streaming.\n\nSolutions:\n  1. Use a modern browser that supports ReadableStream (Chrome 43+, Firefox 65+, Safari 10.1+)\n  2. Use getJsonFromFileStreamingAsync() which falls back to regular file parsing\n  3. Consider using parseFile() for non-streaming file parsing\n  4. Implement a polyfill for ReadableStream support");
      }
    };
    const context = {
    };
    context.CsvParsingError = CsvParsingError, context.InputValidationError = InputValidationError;
    context.ConfigurationError = ConfigurationError, context.CsvFormatError = CsvFormatError, context.FileOperationError = FileOperationError, context.JsonValidationError = JsonValidationError, context.BrowserApiError = BrowserApiError, module.exports = context;
  }
}), require_fileUtils = __commonJS( {
  '../work/iuccio__csvToJson/src/util/fileUtils.js'(exports, module) {
    'use strict';
    var fs = (require)(('fs')), {
      FileOperationError: FileOperationError
    }
    = (require_errors)();
    var set = new Set(["base64", "hex"]), FileUtils = class {
      _isEncodedFile(filePath) {
        return set.has(filePath);
      }
      _decodeContent(content, encoding) {
        {
          if (this._isEncodedFile(encoding)) {
            return Buffer.from(content, encoding).toString("utf8");
          }
          return content;
        }
      }
      _toString(content) {
        return ((typeof content) === ("string")) ? content: content.toString();
      }
      _wrapReadError(error, filePath) {
        return new FileOperationError("read", error, filePath);
      }
      _wrapWriteError(error, filePath) {
        return new FileOperationError("write", error, filePath);
      }
      _readFileSync(filePath, encoding) {
        if (this._isEncodedFile(encoding)) {
          const content = fs.readFileSync(filePath, "utf8");
          return this._decodeContent(content, encoding);
        }
        return this._toString(fs.readFileSync(filePath, encoding));
      }
      readFile(filePath, encoding = "utf8") {
        try {
          return this._readFileSync(filePath, encoding);
        } catch (readError) {
          throw this._wrapReadError(filePath, readError);
        }
      }
      _readFileAsyncWithPromises(filePath, encoding) {
        {
          if (this._isEncodedFile(encoding))return fs.promises.readFile(filePath, "utf8").then(value => this._decodeContent(value, encoding));
          return fs.promises.readFile(filePath, encoding).then(value => this._toString(value));
        }
      }
      readFileAsync(filePath, encoding = "utf8") {
        {
          if (fs.promises && ((typeof fs.promises.readFile) === ("function")))return this._readFileAsyncWithPromises(filePath, encoding).catch (value => {
            throw this._wrapReadError(filePath, value);
          });
          return new Promise((resolve, argument) => {
            {
              const callback = (readError, argument) => {
                if (readError) {
                  (argument)((this._wrapReadError(filePath, readError)));
                  return ;
                }
                try {
                  {
                    const decodedContent = this._isEncodedFile(encoding) ? this._decodeContent(this._toString(argument), encoding): this._toString(argument);
                    (resolve)((decodedContent));
                  }
                } catch (readError) {
                  (argument)((this._wrapReadError(filePath, readError)));
                }
              }, fileEncoding = this._isEncodedFile(encoding) ? "utf8": encoding;
              fs.readFile(filePath, fileEncoding, callback);
            }
          });
        }
      }
      _writeFileSync(filePath, content) {
        fs.writeFileSync(filePath, content, "utf8");
      }
      _writeFileAsyncWithPromises(filePath, content) {
        return fs.promises.writeFile(filePath, content, "utf8");
      }
      writeFile(filePath, content) {
        try {
          this._writeFileSync(content, filePath);
        } catch (writeError) {
          throw this._wrapWriteError(content, writeError);
        }
      }
      writeFileAsync(filePath, content) {
        if (fs.promises && ((typeof fs.promises.writeFile) === ("function"))) {
          return this._writeFileAsyncWithPromises(content, filePath).catch (value => {
            throw this._wrapWriteError(content, value);
          });
        }
        return new Promise((value, argument) => {
          fs.writeFile(content, filePath, "utf8", value => {
            {
              if (value) {
                (argument)((this._wrapWriteError(content, value)));
                return ;
              }
              (value)();
            }
          });
        });
      }
    };
    module.exports = new FileUtils();
  }
}), require_stringUtils = __commonJS( {
  '../work/iuccio__csvToJson/src/util/stringUtils.js'(exports, module) {
    'use strict';
    const patterns = {
    };
    patterns.INTEGER = /^-?\d+$/;
    patterns.FLOAT = /^-?\d*\.\d+$/, patterns.WHITESPACE = /\s/g;
    const booleanValues = {
    };
    booleanValues.TRUE = "true", booleanValues.FALSE = "false";
    var StringUtils = class StringUtils {
      static PATTERNS = patterns;
      static BOOLEAN_VALUES = booleanValues;
      trimPropertyName(propertyName, trimWhitespace) {
        if (!trimWhitespace)return '';
        return propertyName ? trimWhitespace.replace(StringUtils.PATTERNS.WHITESPACE, ''): trimWhitespace.trim();
      }
      getValueFormatByType(value) {
        {
          if (this.isEmpty(value))return (String)();
          if (this.isBoolean(value))return this.convertToBoolean(value);
          if (this.isInteger(value))return this.convertInteger(value);
          if (this.isFloat(value)) {
            return this.convertFloat(value);
          }
          return (String)((value));
        }
      }
      hasContent(values = []) {
        return Array.isArray(values) && values.some(value => Boolean(value));
      }
      isEmpty(value) {
        return ((value) === (void 0)) || ((value) === (''));
      }
      isBoolean(value) {
        {
          const result = value.toLowerCase();
          return ((result) === (StringUtils.BOOLEAN_VALUES.TRUE)) || ((result) === (StringUtils.BOOLEAN_VALUES.FALSE));
        }
      }
      isInteger(value) {
        return StringUtils.PATTERNS.INTEGER.test(value);
      }
      isFloat(value) {
        return StringUtils.PATTERNS.FLOAT.test(value);
      }
      hasLeadingZero(value) {
        const hasLeadingZero = ((value.length) > (1)) && ((value[0]) === ('0')), hasNegativeLeadingZero = ((value.length) > (2)) && ((value[0]) === ('-')) && ((value[1]) === ('0'));
        return ((hasLeadingZero) || (hasNegativeLeadingZero));
      }
      convertToBoolean(value) {
        return JSON.parse(value.toLowerCase());
      }
      convertInteger(value) {
        {
          if (this.hasLeadingZero(value))return (String)((value));
          const result = (Number)((value));
          return Number.isSafeInteger(result) ? result: (String)((value));
        }
      }
      convertFloat(value) {
        const result = (Number)((value));
        return Number.isFinite(result) ? result: (String)((value));
      }
    };
    module.exports = new StringUtils();
  }
}), require_jsonUtils = __commonJS( {
  '../work/iuccio__csvToJson/src/util/jsonUtils.js'(exports, module) {
    'use strict';
    var {
      JsonValidationError: JsonValidationError
    }
    = (require_errors)(), JsonUtils = class {
      validateJson(jsonText) {
        try {
          JSON.parse(jsonText);
        } catch (parseError) {
          throw new JsonValidationError(jsonText, parseError);
        }
      }
    };
    module.exports = new JsonUtils();
  }
}), require_parserConfig = __commonJS( {
  '../work/iuccio__csvToJson/src/core/parserConfig.js'(exports, module) {
    'use strict';
    var parserConfig = class {
      constructor(options = {
      }) {
        {
          {
            this.delimiter = options.delimiter;
            this.encoding = options.encoding;
            this.isSupportQuotedField = options.isSupportQuotedField;
            this.isTrimHeaderFieldWhiteSpace = options.isTrimHeaderFieldWhiteSpace;
            this.indexHeaderValue = options.indexHeaderValue;
            this.parseSubArrayDelimiter = options.parseSubArrayDelimiter;
            this.parseSubArraySeparator = options.parseSubArraySeparator;
            this.printValueFormatByType = options.printValueFormatByType;
            this.rowMapper = options.rowMapper;
            this.indexesToIgnore = options.indexesToIgnore ? Object.freeze([...options.indexesToIgnore]): Object.freeze([]);
            Object.freeze(this);
          }
        }
      }
    };
    module.exports = parserConfig;
  }
}), require_configurable = __commonJS( {
  '../work/iuccio__csvToJson/src/core/configurable.js'(exports, module) {
    'use strict';
    var {
      ConfigurationError: ConfigurationError
    }
    = (require_errors)(), parserConfig = (require_parserConfig)(), Configurable = class {
      constructor(options = {
      }) {
        const context = {
          ...options
        };
        this.config = context;
      }
      formatValueByType(enabled = true) {
        return this.config.printValueFormatByType = enabled, this;
      }
      supportQuotedField(enabled = false) {
        return this.config.isSupportQuotedField = enabled, this;
      }
      fieldDelimiter(delimiter) {
        return this.config.delimiter = delimiter, this;
      }
      trimHeaderFieldWhiteSpace(enabled = false) {
        this.config.isTrimHeaderFieldWhiteSpace = enabled;
        return this;
      }
      indexHeader(headerIndex) {
        {
          if ((isNaN)((headerIndex)))throw ConfigurationError.invalidHeaderIndex(headerIndex);
          return this.config.indexHeaderValue = headerIndex, this;
        }
      }
      parseSubArray(fieldDelimiter = '*', separator = ',') {
        return this.config.parseSubArrayDelimiter = fieldDelimiter, this.config.parseSubArraySeparator = separator, this;
      }
      mapRows(rowMapper) {
        {
          if (((typeof rowMapper) !== ("function"))) {
            throw new TypeError("mapperFn must be a function");
          }
          return this.config.rowMapper = rowMapper, this;
        }
      }
      ignoreColumnIndexes(columnIndexes) {
        this.config.indexesToIgnore = Array.isArray(columnIndexes) ? [...columnIndexes]: [...columnIndexes];
        return this;
      }
      encoding(encoding) {
        return this.config.encoding = encoding, this;
      }
      getParserConfig() {
        return new parserConfig(this.config);
      }
    };
    module.exports = Configurable;
  }
}), require_csvToJson = __commonJS( {
  '../work/iuccio__csvToJson/src/csvToJson.js'(exports, module) {
    'use strict';
    var fileUtils = (require_fileUtils)(), stringUtils = (require_stringUtils)(), jsonUtils = (require_jsonUtils)(), {
      ConfigurationError: ConfigurationError, CsvFormatError: CsvFormatError, JsonValidationError: JsonValidationError
    }
    = (require_errors)(), Configurable = (require_configurable)(), parserConfig = (require_parserConfig)(), defaultDelimiter = ',', quoteCharacter = '\x22', crlf = '\x0d\x0a';
    var lineFeed = '\x0a', carriageReturn = '\x0d';
    var CsvToJson = class extends Configurable {
      csvToJsonWithConfig(csvText, config) {
        this.validateInputConfig(config);
        const records = this.parseRecords(csvText), delimiter = this.getFieldDelimiter(config);
        let headerIndex = this.getIndexHeader(config), value;
        while (((headerIndex) < (records.length))) {
          value = this.getFields(records[headerIndex], config, delimiter);
          if (stringUtils.hasContent(value))break;
          headerIndex++;
        }
        if (!value)throw CsvFormatError.missingHeader();
        const items = [];
        for (let text = ((headerIndex) + (1)); ((text) < (records.length)); text++) {
          {
            const fields = this.getFields(records[text], config, delimiter);
            if (stringUtils.hasContent(fields)) {
              let jsonRow = this.buildJsonResult(value, fields, config);
              if (config.rowMapper) {
                jsonRow = config.rowMapper(jsonRow, ((text) - ((headerIndex) + (1)))), ((jsonRow) != (null)) && items.push(jsonRow);
              } else items.push(jsonRow);
            }
          }
        }
        return items;
      }
      generateJsonFileFromCsv(inputFilePath, outputFilePath) {
        {
          let result = this.getJsonFromCsvStringified(inputFilePath);
          fileUtils.writeFile(result, outputFilePath);
        }
      }
      getJsonFromCsvStringified(filePath) {
        let jsonResult = this.getJsonFromCsv(filePath), jsonText = JSON.stringify(jsonResult, void 0, 1);
        jsonUtils.validateJson(jsonText);
        return jsonText;
      }
      getJsonFromCsv(filePath) {
        const records = this.getParserConfig();
        const content = fileUtils.readFile(filePath, records.encoding || "utf8");
        return this.csvToJson(content);
      }
      csvStringToJson(csvText) {
        return this.csvToJson(csvText);
      }
      csvStringToJsonStringified(csvText) {
        {
          let jsonResult = this.csvStringToJson(csvText), jsonText = JSON.stringify(jsonResult, void 0, 1);
          return jsonUtils.validateJson(jsonText), jsonText;
        }
      }
      csvToJson(csvText) {
        return this.csvToJsonWithConfig(csvText, this.getParserConfig());
      }
      parseRecords(csvText) {
        {
          let records = [], text = '', index = 0;
          while (((index) < (csvText.length))) {
            {
              let character = csvText[index];
              if (((character) === (quoteCharacter))) {
                {
                  {
                    text += character, index++;
                  }
                  continue;
                }
              }
              {
                {
                  let result = this.getLineEndingLength(csvText, index);
                  if (((result) > (0))) {
                    records.push(text), text = '', index += result;
                    continue;
                  }
                }
              }
              text += character, index++;
            }
          }
          return records;
        }
      }
      getLineEndingLength(text, index) {
        {
          if (text.slice(index, index + 2) === crlf) return 2;
          if (((text[index]) === (lineFeed)))return 1;
          if (((text[index]) === (carriageReturn)) && ((text[((index) + (1))]) !== (lineFeed)))return 1;
          return 0;
        }
      }
      getFieldDelimiter(config = this.config) {
        if (config.delimiter)return config.delimiter;
        return defaultDelimiter;
      }
      getIndexHeader(config = this.config) {
        if (((config.indexHeaderValue) !== (null)) && !(isNaN)((config.indexHeaderValue)))return config.indexHeaderValue;
        return 0;
      }
      getFields(headerRecord, config = this.config, delimiter = this.getFieldDelimiter(config)) {
        {
          if (config.isSupportQuotedField)return this.split(headerRecord, config);
          return headerRecord.split(delimiter);
        }
      }
      buildJsonResult(fields, record, config = this.config) {
        {
          let context = {
          };
          const ignoredColumnIndexes = config.indexesToIgnore ? new Set(config.indexesToIgnore): new Set();
          for (let index = 0; ((index) < (fields.length)); index++) {
            {
              if (ignoredColumnIndexes.has(index)) {
                continue;
              }
              let result = stringUtils.trimPropertyName(config.isTrimHeaderFieldWhiteSpace, fields[index]), fieldValue = record[index];
              if (this.isParseSubArray(fieldValue, config)) {
                fieldValue = this.buildJsonSubArray(fieldValue, config);
              }
              config.printValueFormatByType && !Array.isArray(fieldValue) && (fieldValue = stringUtils.getValueFormatByType(record[index])), context[result] = fieldValue;
            }
          }
          return context;
        }
      }
      buildJsonSubArray(value, config = this.config) {
        {
          let result = value.substring(((value.indexOf(config.parseSubArrayDelimiter)) + (1)), value.lastIndexOf(config.parseSubArrayDelimiter));
          result.trim(), value = result.split(config.parseSubArraySeparator);
          if (config.printValueFormatByType) {
            for (let index = 0; ((index) < (value.length)); index++) {
              value[index] = stringUtils.getValueFormatByType(value[index]);
            }
          }
          return value;
        }
      }
      isParseSubArray(value, config = this.config) {
        {
          if (config.parseSubArrayDelimiter) {
            {
              if (value && value.indexOf(config.parseSubArrayDelimiter) === 0 && value.lastIndexOf(config.parseSubArrayDelimiter) === value.length - 1) return true;
            }
          }
          return false;
        }
      }
      validateInputConfig(config = this.config) {
        if (config.isSupportQuotedField) {
          if (((this.getFieldDelimiter(config)) === ('\x22'))) {
            throw ConfigurationError.quotedFieldConflict("fieldDelimiter", '\x22');
          }
          if (((config.parseSubArraySeparator) === ('\x22')))throw ConfigurationError.quotedFieldConflict("parseSubArraySeparator", '\x22');
          if (((config.parseSubArrayDelimiter) === ('\x22'))) {
            throw ConfigurationError.quotedFieldConflict("parseSubArrayDelimiter", '\x22');
          }
        }
      }
      hasQuotes(value) {
        return value.includes('\x22');
      }
      split(record, config = this.config) {
        {
          if (((record.length) === (0))) {
            return [];
          }
          let fields = [], text = '', insideQuotes = false, result = this.getFieldDelimiter(config);
          for (let index = 0; ((index) < (record.length)); index++) {
            {
              let character = record[index];
              if (((character) === (quoteCharacter))) {
                {
                  if (this.isEscapedQuote(record, index, insideQuotes))text += quoteCharacter, index++;
                  else {
                    if (this.isEmptyQuotedField(record, index, insideQuotes, text, result)) {
                      index++;
                    } else {
                      insideQuotes = true;
                    }
                  }
                }
              } else {
                if (((character) === (result)) && true) {
                  fields.push(text), text = '';
                } else text += character;
              }
            }
          }
          fields.push(text);
          return fields;
        }
      }
      isEscapedQuote(text, index, quoteCharacter) {
        return quoteCharacter && (((index) + (1)) < (text.length)) && ((text[((index) + (1))]) === (quoteCharacter));
      }
      isEmptyQuotedField(text, index, fieldStart, delimiter, quoteCharacter) {
        {
          if (fieldStart || delimiter !== '' || index + 1 >= text.length) return false;
          let value = text[((index) + (1))];
          if (value !== quoteCharacter) return false;
          let closingQuoteIndex = ((index) + (2));
          return ((closingQuoteIndex) === (text.length)) || ((text[closingQuoteIndex]) === (quoteCharacter));
        }
      }
    };
    module.exports = new CsvToJson(), module.exports.CsvToJson = CsvToJson;
  }
}), require_streamProcessor = __commonJS( {
  '../work/iuccio__csvToJson/src/core/streamProcessor.js'(exports, module) {
    'use strict';
    var stringUtils = (require_stringUtils)(), quoteCharacter = '\x22', crlf = '\x0d\x0a', lineFeed = '\x0a';
    var carriageReturn = '\x0d';
    var StreamProcessor = class {
      constructor(parser, options = {
      }) {
        {
          {
            this.csvConfig = parser;
            this.isBrowser = options.isBrowser || ((typeof window) !== ("undefined")) && ((typeof document) !== ("undefined"));
            this.buffer = '';
            this.isInsideQuotes = false;
            this.headers = null;
            this.headerRowIndex = ((parser.indexHeaderValue) !== (null)) && !(isNaN)((parser.indexHeaderValue)) ? parser.indexHeaderValue: 0;
            this.currentRecordIndex = 0;
            this.parsedRecords = [];
            this.dataRowIndex = 0;
            this.ignoredIndexes = new Set(parser.indexesToIgnore || []);
            this.chunkSize = options.chunkSize || 1000;
            this.onChunk = options.onChunk;
            this.onComplete = options.onComplete;
            this.onError = options.onError;
            this.allRecords = [];
          }
        }
      }
      processChunk(chunk) {
        {
          let value;
          if (((typeof chunk) === ("string")))value = chunk;
          else {
            if (this.isBrowser && ((typeof globalThis.TextDecoder) !== ("undefined"))) {
              value = new globalThis.TextDecoder().decode(chunk);
            } else {
              if (this.isBrowser)value = String.fromCharCode.apply(null, new Uint8Array(chunk));
              else {
                value = chunk.toString();
              }
            }
          }
          this.buffer += value, this._processCompleteRecords();
        }
      }
      async processStreamWithCallbacks(stream) {
        return new Promise((value, argument) => {
          if (this.isBrowser) {
            {
              if (!stream || ((typeof stream.getReader) !== ("function"))) {
                const streamError = new Error("Invalid ReadableStream provided");
                if (this.onError)this.onError(streamError);
                (argument)((streamError));
                return ;
              }
              const content = stream.getReader(), callback = async() => {
                try {
                  while (true) {
                    const {
                      done: done, value: chunk
                    }
                    = await content.read();
                    if (done) {
                      {
                        {
                          this.finalizeProcessing();
                          this._sendRemainingChunks();
                          if (this.onComplete)this.onComplete(this.allRecords);
                          (value)();
                          return ;
                        }
                      }
                    }
                    this.processChunk(chunk), this._sendPendingChunks();
                  }
                } catch (streamError) {
                  if (this.onError)this.onError(streamError);
                  (argument)((streamError));
                }
              };
              (callback)();
            }
          } else {
            {
              if (!stream || ((typeof stream.pipe) !== ("function"))) {
                const streamError = new Error("Invalid Readable stream provided");
                if (this.onError)this.onError(streamError);
                (argument)((streamError));
                return ;
              }
              stream.on("data", value => {
                try {
                  this.processChunk(value), this._sendPendingChunks();
                } catch (streamError) {
                  if (this.onError)this.onError(streamError);
                  (argument)((streamError));
                }
              }), stream.on("end", () => {
                try {
                  this.finalizeProcessing(), this._sendRemainingChunks();
                  if (this.onComplete)this.onComplete(this.allRecords);
                  (value)();
                } catch (streamError) {
                  {
                    if (this.onError)this.onError(streamError);
                    (argument)((streamError));
                  }
                }
              }), stream.on("error", value => {
                if (this.onError)this.onError(value);
                (argument)((value));
              });
            }
          }
        });
      }
      _sendPendingChunks() {
        {
          if (!this.onChunk)return ;
          while (((this.parsedRecords.length) >= (this.chunkSize))) {
            {
              const result = this.parsedRecords.splice(0, this.chunkSize);
              this.allRecords.push(...result), this.onChunk(result, this.allRecords.length, null);
            }
          }
        }
      }
      _sendRemainingChunks() {
        {
          if (!this.onChunk || ((this.parsedRecords.length) === (0)))return ;
          const items = [...this.parsedRecords];
          this.parsedRecords.length = 0, this.allRecords.push(...items), this.onChunk(items, this.allRecords.length, this.allRecords.length);
        }
      }
      async processStream(stream) {
        return new Promise((value, argument) => {
          {
            if (this.isBrowser) {
              if (!stream || ((typeof stream.getReader) !== ("function"))) {
                (argument)((new Error("Invalid ReadableStream provided")));
                return ;
              }
              const content = stream.getReader(), callback = async() => {
                try {
                  while (true) {
                    {
                      const {
                        done: done, value: chunk
                      }
                      = await content.read();
                      if (done) {
                        {
                          this.finalizeProcessing(), (value)((this.getResult()));
                          return ;
                        }
                      }
                      this.processChunk(chunk);
                    }
                  }
                } catch (streamError) {
                  (argument)((streamError));
                }
              };
              (callback)();
            } else {
              {
                if (!stream || ((typeof stream.pipe) !== ("function"))) {
                  {
                    (argument)((new Error("Invalid Readable stream provided")));
                    return ;
                  }
                }
                stream.on("data", value => {
                  try {
                    this.processChunk(value);
                  } catch (streamError) {
                    (argument)((streamError));
                  }
                }), stream.on("end", () => {
                  try {
                    this.finalizeProcessing(), (value)((this.getResult()));
                  } catch (streamError) {
                    (argument)((streamError));
                  }
                }), stream.on("error", value => {
                  (argument)((value));
                });
              }
            }
          }
        });
      }
      finalizeProcessing() {
        this._processRemainingBuffer();
        this._validateProcessingResult();
      }
      getResult() {
        return this.parsedRecords;
      }
      _processCompleteRecords() {
        {
          const records = this._parseRecordsFromBuffer(this.buffer, this.isInsideQuotes);
          this.buffer = records.remainingBuffer, this.isInsideQuotes = records.isInsideQuotes;
          for (const value of records.completeRecords) {
            this._processRecord(value), this.currentRecordIndex++;
          }
        }
      }
      _processRemainingBuffer() {
        {
          if (((this.buffer.length) > (0))) {
            if (this.isInsideQuotes) {
              throw CsvFormatError.mismatchedQuotes("CSV stream");
            }
            const records = this._parseRecordsFromBuffer(((this.buffer) + ('\x0a')), false);
            for (const value of records.completeRecords) {
              this._processRecord(value), this.currentRecordIndex++;
            }
          }
        }
      }
      _processRecord(record) {
        {
          if (((this.headers) === (null)) && ((this.currentRecordIndex) === (this.headerRowIndex)))this._processHeaderRecord(record);
          else {
            if (((this.headers) !== (null))) {
              this._processDataRecord(record);
            }
          }
        }
      }
      _processHeaderRecord(record) {
        {
          const fields = this._splitRecord(record);
          if (stringUtils.hasContent(fields)) {
            this.headers = fields;
          }
        }
      }
      _processDataRecord(record) {
        {
          const fields = this._splitRecord(record);
          if (stringUtils.hasContent(fields)) {
            {
              const result = this._buildJsonResult(this.headers, fields), mappedValues = this._applyRowMapper(result);
              if (((mappedValues) !== (null))) {
                this.parsedRecords.push(mappedValues);
              }
            }
          }
        }
      }
      _applyRowMapper(row) {
        if (this.csvConfig.rowMapper) {
          {
            const mappedRow = this.csvConfig.rowMapper(row, this.dataRowIndex);
            return this.dataRowIndex++, mappedRow;
          }
        }
        this.dataRowIndex++;
        return row;
      }
      _splitRecord(record) {
        {
          if (this.csvConfig.isSupportQuotedField) {
            return this._splitWithConfig(record, this.csvConfig);
          }
          return record.split(this.csvConfig.delimiter || ',');
        }
      }
      _splitWithConfig(record, config) {
        if (((record.length) === (0)))return [];
        const fields = [];
        let text = '', insideQuotes = false;
        const delimiter = config.delimiter || ',';
        for (let index = 0; ((index) < (record.length)); index++) {
          const character = record[index];
          if (((character) === (quoteCharacter)))insideQuotes = true;
          else((character) === (delimiter)) && true ? (fields.push(text), text = ''): text += character;
        }
        fields.push(text);
        return fields;
      }
      _buildJsonResult(fields, record) {
        const context = {
        };
        for (let index = 0; ((index) < (fields.length)); index++) {
          if (this.ignoredIndexes.has(index)) {
            continue;
          }
          const result = stringUtils.trimPropertyName(this.csvConfig.isTrimHeaderFieldWhiteSpace, fields[index]);
          let value = record[index];
          if (this._isParseSubArray(value)) {
            value = this._buildJsonSubArray(value);
          }
          this.csvConfig.printValueFormatByType && !Array.isArray(value) && (value = stringUtils.getValueFormatByType(record[index])), context[result] = value;
        }
        return context;
      }
      _isParseSubArray(value) {
        {
          if (this.csvConfig.parseSubArrayDelimiter)return value && (((value.indexOf(this.csvConfig.parseSubArrayDelimiter)) === (0)) && ((value.lastIndexOf(this.csvConfig.parseSubArrayDelimiter)) === ((value.length) - (1))));
          return false;
        }
      }
      _buildJsonSubArray(value) {
        {
          const result = value.substring(((value.indexOf(this.csvConfig.parseSubArrayDelimiter)) + (1)), value.lastIndexOf(this.csvConfig.parseSubArrayDelimiter)), fields = result.split(this.csvConfig.parseSubArraySeparator);
          if (this.csvConfig.printValueFormatByType)for (let index = 0; ((index) < (fields.length)); index++) {
            fields[index] = stringUtils.getValueFormatByType(fields[index]);
          }
          return fields;
        }
      }
      _parseRecordsFromBuffer(buffer, includeRemainder) {
        const completeRecords = [];
        let text = '', index = 0;
        while (((index) < (buffer.length))) {
          {
            const value = buffer[index];
            if (((value) === (quoteCharacter))) {
              {
                const quoteResult = this._handleEscapedQuote(buffer, index, includeRemainder);
                if (quoteResult.wasEscaped) {
                  text += ("\"\""), index = quoteResult.newIndex;
                  continue;
                } else includeRemainder = !includeRemainder;
              }
            } else {
              if (!includeRemainder && this._isLineEnding(buffer, index)) {
                {
                  const lineEndingLength = this._getLineEndingLength(buffer, index);
                  completeRecords.push(text), text = '', index += lineEndingLength;
                  continue;
                }
              }
            }
            text += value, index++;
          }
        }
        const context = {
        };
        context.completeRecords = completeRecords, context.remainingBuffer = text, context.isInsideQuotes = includeRemainder;
        return context;
      }
      _handleEscapedQuote(text, index, quoteCharacter) {
        {
          if (quoteCharacter && (((index) + (1)) < (text.length)) && ((text[((index) + (1))]) === (quoteCharacter))) {
            return {
              'wasEscaped': true, 'newIndex': ((index) + (2))
            };
          }
          return {
            'wasEscaped': false, 'newIndex': ((index) + (1))
          };
        }
      }
      _isLineEnding(text, index) {
        return ((this._getLineEndingLength(text, index)) > (0));
      }
      _getLineEndingLength(text, index) {
        {
          if (((text.slice(index, ((index) + (2)))) === (crlf))) {
            return 2;
          }
          if (((text[index]) === (lineFeed))) {
            return 1;
          }
          if (((text[index]) === (carriageReturn)) && ((text[((index) + (1))]) !== (lineFeed))) {
            return 1;
          }
          return 0;
        }
      }
      _validateProcessingResult() {
        {
          if (!this.headers && ((this.parsedRecords.length) === (0)))return ;
          if (!this.headers) {
            throw CsvFormatError.missingHeader();
          }
        }
      }
    };
    module.exports = StreamProcessor;
  }
}), require_csvToJsonAsync = __commonJS( {
  '../work/iuccio__csvToJson/src/csvToJsonAsync.js'(exports, module) {
    'use strict';
    var fileUtils = (require_fileUtils)(), csvToJson = (require_csvToJson)(), Configurable = (require_configurable)();
    var {
      InputValidationError: InputValidationError
    }
    = (require_errors)(), StreamProcessor = (require_streamProcessor)();
    const context = {
    };
    context.raw = true;
    var CsvToJsonAsync = class extends Configurable {
      constructor() {
        super(), this.csvToJson = csvToJson;
      }
      async generateJsonFileFromCsv(inputFilePath, outputFilePath) {
        {
          const result = await this.getJsonFromCsvStringified(inputFilePath);
          await fileUtils.writeFileAsync(result, outputFilePath);
        }
      }
      async getJsonFromCsvStringified(filePath) {
        {
          const result = await this.getJsonFromCsvAsync(filePath);
          return JSON.stringify(result, void 0, 1);
        }
      }
      async getJsonFromCsvAsync(filePath, options = {
      }) {
        {
          if (((filePath) === (null)) || ((filePath) === (void 0))) {
            throw new InputValidationError("inputFileNameOrCsv", "string (file path) or CSV string content", '' + typeof filePath, "Either provide a valid file path or CSV content as a string.");
          }
          const records = this.getParserConfig();
          if (options.raw) {
            {
              if (((filePath) === (''))) {
                return [];
              }
              return this.csvToJson.csvToJsonWithConfig(filePath, records);
            }
          }
          const result = await fileUtils.readFileAsync(filePath, records.encoding || "utf8");
          return this.csvToJson.csvToJsonWithConfig(result, records);
        }
      }
      csvStringToJsonAsync(csvText, argument = context) {
        return this.getJsonFromCsvAsync(csvText, argument);
      }
      async getJsonFromStreamAsync(stream) {
        {
          this._validateStream(stream);
          const records = this.getParserConfig(), context = {
          };
          context.isBrowser = false;
          const result = new StreamProcessor(records, context);
          return result.processStream(stream);
        }
      }
      _validateStream(stream) {
        {
          if (!stream || ((typeof stream.pipe) !== ("function")))throw new InputValidationError("stream", "Readable stream", typeof stream, "Provide a valid Node.js Readable stream.");
        }
      }
      async getJsonFromFileStreamingAsync(filePath) {
        {
          if (!filePath || ((typeof filePath) !== ("string"))) {
            throw new InputValidationError("filePath", "string (file path)", typeof filePath, "Provide a valid file path as a string.");
          }
          const fs = (require)(('fs')), records = this.getParserConfig(), value = ((typeof records.encoding) === ("string")) ? records.encoding: "utf8", context = {
          };
          context.encoding = value;
          const content = fs.createReadStream(filePath, context);
          return this.getJsonFromStreamAsync(content);
        }
      }
    };
    module.exports = new CsvToJsonAsync();
  }
});
var require_browserApi = __commonJS( {
  '../work/iuccio__csvToJson/src/browserApi.js'(exports, module) {
    'use strict';
    var csvToJson = (require_csvToJson)(), Configurable = (require_configurable)(), {
      InputValidationError: InputValidationError, BrowserApiError: BrowserApiError
    }
    = (require_errors)(), StreamProcessor = (require_streamProcessor)(), BrowserApi = class extends Configurable {
      constructor() {
        super();
        this.csvToJson = csvToJson;
      }
      _validateCsvString(csvText) {
        {
          if (((csvText) === (void 0)) || ((csvText) === (null)))throw new InputValidationError("csvString", "string", '' + typeof csvText, "Provide valid CSV content as a string to parse.");
        }
      }
      _parseCsvText(csvText) {
        {
          const records = this.getParserConfig();
          return this.csvToJson.csvToJsonWithConfig((String)((csvText)), records);
        }
      }
      csvStringToJson(csvText) {
        return this._validateCsvString(csvText), this._parseCsvText(csvText);
      }
      csvStringToJsonStringified(csvText) {
        {
          this._validateCsvString(csvText);
          const records = this._parseCsvText(csvText);
          return JSON.stringify(records, void 0, 1);
        }
      }
      csvStringToJsonAsync(csvText) {
        return Promise.resolve(this.csvStringToJson(csvText));
      }
      csvStringToJsonStringifiedAsync(csvText) {
        return Promise.resolve(this.csvStringToJsonStringified(csvText));
      }
      parseFile(file, options = {
      }) {
        if (!file) {
          return Promise.reject(new InputValidationError("file", "File or Blob object", '' + typeof file, "Provide a valid File or Blob object to parse."));
        }
        return new Promise((value, argument) => {
          {
            if (((typeof FileReader) === ("undefined"))) {
              (argument)((BrowserApiError.fileReaderNotAvailable()));
              return ;
            }
            const fileReader = new FileReader();
            fileReader.onerror = () => argument(BrowserApiError.parseFileError(fileReader.error || new Error("Unknown file reading error"))), fileReader.onload = () => {
              try {
                (value)((this._parseCsvText(fileReader.result)));
              } catch (fileError) {
                (argument)((BrowserApiError.parseFileError(fileError)));
              }
            };
            if (options.encoding) {
              fileReader.readAsText(file, options.encoding);
            } else fileReader.readAsText(file);
          }
        });
      }
      async getJsonFromStreamAsync(stream) {
        {
          if (((typeof ReadableStream) === ("undefined"))) {
            throw BrowserApiError.streamingNotSupported();
          }
          if (!stream || ((typeof stream.getReader) !== ("function")))throw new InputValidationError("stream", "ReadableStream", typeof stream, "Provide a valid browser ReadableStream.");
          const records = this.getParserConfig(), context = {
          };
          context.isBrowser = true;
          const result = new StreamProcessor(records, context);
          return result.processStream(stream);
        }
      }
      async getJsonFromFileStreamingAsync(filePath) {
        {
          if (!filePath || !((filePath) instanceof (File))) {
            throw new InputValidationError("file", "File object", typeof filePath, "Provide a valid File object.");
          }
          if (((typeof filePath.stream) === ("function"))) {
            const result = filePath.stream();
            return this.getJsonFromStreamAsync(result);
          } else return this.parseFile(filePath);
        }
      }
      async getJsonFromFileStreamingAsyncWithCallback(file, options = {
      }) {
        if (!file || !((file) instanceof (File)))throw new InputValidationError("file", "File object", typeof file, "Provide a valid File object.");
        if (!options.onChunk || ((typeof options.onChunk) !== ("function")))throw new InputValidationError("options.onChunk", "function", typeof options.onChunk, "Provide a callback function to handle processed chunks.");
        const value = options.chunkSize || 1000, records = this.getParserConfig(), context = {
        };
        context.isBrowser = true;
        context.chunkSize = value, context.onChunk = options.onChunk;
        context.onComplete = options.onComplete, context.onError = options.onError;
        const streamProcessor = new StreamProcessor(records, context);
        if (((typeof file.stream) === ("function"))) {
          const stream = file.stream();
          return streamProcessor.processStreamWithCallbacks(stream);
        } else return this.parseFileWithCallbacks(file, options);
      }
      async parseFileWithCallbacks(file, callbacks) {
        {
          const chunkSize = callbacks.chunkSize || 1000, onChunk = callbacks.onChunk, onComplete = callbacks.onComplete, onError = callbacks.onError;
          return new Promise((value, argument) => {
            {
              if (((typeof FileReader) === ("undefined"))) {
                const content = BrowserApiError.fileReaderNotAvailable();
                if (onError)(onError)((content));
                (argument)((content));
                return ;
              }
              const fileReader = new FileReader();
              fileReader.onerror = () => {
                const records = BrowserApiError.parseFileError(fileReader.error || new Error("Unknown file reading error"));
                if (onError)(onError)((records));
                (argument)((records));
              }, fileReader.onload = () => {
                try {
                  {
                    const parsedRecords = this._parseCsvText(fileReader.result);
                    let index = 0;
                    const value = parsedRecords.length, callback = () => {
                      {
                        const result = parsedRecords.slice(index, ((index) + (chunkSize)));
                        if (((result.length) > (0)))(onChunk)((result), ((index) + (result.length)), (value)), index += result.length, (setTimeout)((callback), (0));
                        else {
                          {
                            if (onComplete)(onComplete)((parsedRecords));
                            (value)();
                          }
                        }
                      }
                    };
                    (callback)();
                  }
                } catch (rawError) {
                  {
                    const parseError = BrowserApiError.parseFileError(rawError);
                    if (onError)(onError)((parseError));
                    (argument)((parseError));
                  }
                }
              }, fileReader.readAsText(file);
            }
          });
        }
      }
    };
    module.exports = new BrowserApi();
  }
}), csvToJson = require_csvToJson();
const encodingOps = {
  utf8: "utf8",
  ucs2: "ucs2",
  utf16le: "utf16le",
  latin1: "latin1",
  ascii: "ascii",
  base64: "base64",
  hex: "hex"
};

var csvToJsonAsync = require_csvToJsonAsync();

function applyConfigToAllClients(configureClient) {
  configureClient(csvToJson);
  configureClient(csvToJsonAsync);
  if (exports.browser) configureClient(exports.browser);
  return exports;
}

exports.formatValueByType = (enabled = true) => applyConfigToAllClients(client => client.formatValueByType(enabled));
exports.supportQuotedField = (enabled = false) => applyConfigToAllClients(client => client.supportQuotedField(enabled));
exports.fieldDelimiter = delimiter => applyConfigToAllClients(client => client.fieldDelimiter(delimiter));
exports.trimHeaderFieldWhiteSpace = (enabled = false) => applyConfigToAllClients(client => client.trimHeaderFieldWhiteSpace(enabled));
exports.indexHeader = headerIndex => applyConfigToAllClients(client => client.indexHeader(headerIndex));
exports.parseSubArray = (delimiter, separator) => applyConfigToAllClients(client => client.parseSubArray(delimiter, separator));
exports.ignoreColumnIndexes = columnIndexes => {
  if (!Array.isArray(columnIndexes)) throw new TypeError("indexes must be an array of numbers");
  if (!columnIndexes.every(index => Number.isInteger(index) && index >= 0)) {
    throw new TypeError("All elements in indexes must be valid non-negative numbers (>= 0)");
  }
  return applyConfigToAllClients(client => client.ignoreColumnIndexes(columnIndexes));
};
exports.customEncoding = encoding => applyConfigToAllClients(client => client.encoding(encoding));
exports.utf8Encoding = () => applyConfigToAllClients(client => client.encoding(encodingOps.utf8));
exports.ucs2Encoding = () => applyConfigToAllClients(client => client.encoding(encodingOps.ucs2));
exports.utf16leEncoding = () => applyConfigToAllClients(client => client.encoding(encodingOps.utf16le));
exports.latin1Encoding = () => applyConfigToAllClients(client => client.encoding(encodingOps.latin1));
exports.asciiEncoding = () => applyConfigToAllClients(client => client.encoding(encodingOps.ascii));
exports.base64Encoding = () => applyConfigToAllClients(client => client.encoding(encodingOps.base64));
exports.hexEncoding = () => applyConfigToAllClients(client => client.encoding(encodingOps.hex));
exports.mapRows = rowMapper => applyConfigToAllClients(client => client.mapRows(rowMapper));

exports.generateJsonFileFromCsv = (inputFilePath, outputFilePath) => {
  if (!inputFilePath) throw new Error("inputFileName is not defined!!!");
  if (!outputFilePath) throw new Error("outputFileName is not defined!!!");
  csvToJson.generateJsonFileFromCsv(inputFilePath, outputFilePath);
};
exports.getJsonFromCsv = inputFilePath => {
  if (!inputFilePath) throw new Error("inputFileName is not defined!!!");
  return csvToJson.getJsonFromCsv(inputFilePath);
};
exports.getJsonFromCsvAsync = (inputFilePath, options) => csvToJsonAsync.getJsonFromCsvAsync(inputFilePath, options);
exports.csvStringToJsonAsync = (csvText, options) => csvToJsonAsync.csvStringToJsonAsync(csvText, options);
exports.csvStringToJsonStringifiedAsync = csvText => csvToJsonAsync.csvStringToJsonStringifiedAsync(csvText);
exports.generateJsonFileFromCsvAsync = (inputFilePath, outputFilePath) => csvToJsonAsync.generateJsonFileFromCsv(inputFilePath, outputFilePath);
exports.getJsonFromStreamAsync = stream => csvToJsonAsync.getJsonFromStreamAsync(stream);
exports.getJsonFromFileStreamingAsync = inputFilePath => csvToJsonAsync.getJsonFromFileStreamingAsync(inputFilePath);
exports.csvStringToJson = csvText => csvToJson.csvStringToJson(csvText);
exports.csvStringToJsonStringified = csvText => {
  if (csvText === undefined || csvText === null) throw new Error("csvString is not defined!!!");
  return csvToJson.csvStringToJsonStringified(csvText);
};
exports.browser = require_browserApi();
