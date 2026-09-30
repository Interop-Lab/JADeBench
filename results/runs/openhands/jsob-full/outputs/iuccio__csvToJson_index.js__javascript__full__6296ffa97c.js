"use strict";

var __commonJS = (factory, cachedModule) => function requireBundledModule() {
  if (!cachedModule) {
    cachedModule = { exports: {} };
    factory(cachedModule.exports, cachedModule);
  }
  return cachedModule.exports;
};

var requireErrors = __commonJS(function errorsModule(exports, module) {
  class CsvParsingError extends Error {
    constructor(message, code, context = {}) {
      super(message);
      this.name = "CsvParsingError";
      this.code = code;
      this.context = context;
      Error.captureStackTrace(this, this.constructor);
    }

    toString() {
      let result = this.name + ": " + this.message;
      if (this.context && Object.keys(this.context).length > 0) {
        result += "\n\nContext:";
        Object.entries(this.context).forEach(([key, value]) => {
          result += "\n  " + key + ": " + this.formatValue(value);
        });
      }
      return result;
    }

    formatValue(value) {
      if (value === null) return "null";
      if (value === undefined) return "undefined";
      if (typeof value === "string") return '"' + value + '"';
      if (typeof value === "object") return JSON.stringify(value);
      return String(value);
    }
  }

  class InputValidationError extends CsvParsingError {
    constructor(parameter, expectedType, receivedType, details = "") {
      const message = "Invalid input: Parameter '" + parameter + "' is required.\nExpected: " +
        expectedType + "\nReceived: " + receivedType + (details ? "\n" + details : "");
      super(message, "INPUT_VALIDATION_ERROR", { parameter, expectedType, receivedType });
      this.name = "InputValidationError";
    }
  }

  class ConfigurationError extends CsvParsingError {
    constructor(message, context = {}) {
      super(message, "CONFIGURATION_ERROR", context);
      this.name = "ConfigurationError";
    }

    static quotedFieldConflict(optionName, value) {
      return new ConfigurationError(
        "Configuration conflict: supportQuotedField() is enabled, but " + optionName + " is set to '" + value + "'.\n" +
        "The quote character (\") cannot be used as a field delimiter, separator, or sub-array delimiter when quoted field support is active.\n\n" +
        "Solutions:\n  1. Use a different character for " + optionName + " (e.g., '|', '\\t', ';')\n" +
        "  2. Disable supportQuotedField() if your CSV doesn't contain quoted fields\n" +
        "  3. Refer to RFC 4180 for proper CSV formatting: https://tools.ietf.org/html/rfc4180",
        { optionName, value, conflictingOption: "supportQuotedField" }
      );
    }

    static invalidHeaderIndex(value) {
      return new ConfigurationError(
        "Invalid configuration: indexHeader() expects a numeric value.\nReceived: " + typeof value + " (" + value + ")\n\n" +
        "Solutions:\n  1. Ensure indexHeader() receives a number: indexHeader(0), indexHeader(1), etc.\n" +
        "  2. Headers are typically found on row 0 (first line)\n" +
        "  3. Use indexHeader(2) if headers are on the 3rd line",
        { parameterName: "indexHeader", value, type: typeof value }
      );
    }
  }

  class CsvFormatError extends CsvParsingError {
    constructor(message, context = {}) {
      super(message, "CSV_FORMAT_ERROR", context);
      this.name = "CsvFormatError";
    }

    static missingHeader() {
      return new CsvFormatError(
        "CSV parsing error: No header row found.\nThe CSV file appears to be empty or has no valid header line.\n\n" +
        "Solutions:\n  1. Ensure your CSV file contains at least one row (header row)\n" +
        "  2. Verify the file is not empty or contains only whitespace\n" +
        "  3. Check if you need to use indexHeader(n) to specify a non-standard header row\n" +
        "  4. Refer to RFC 4180 for proper CSV format: https://tools.ietf.org/html/rfc4180"
      );
    }

    static mismatchedQuotes(location = "CSV") {
      return new CsvFormatError(
        "CSV parsing error: Mismatched quotes detected in " + location + ".\n" +
        "A quoted field was not properly closed with a matching quote character.\n\n" +
        "RFC 4180 rules for quoted fields:\n" +
        "  • Fields containing delimiters or quotes MUST be enclosed in double quotes\n" +
        "  • To include a quote within a quoted field, use two consecutive quotes: \"\"\n" +
        "  • Example: \"Smith, John\" (name contains comma)\n" +
        "  • Example: \"He said \"\"Hello\"\"\" (text contains quotes)\n\n" +
        "Solutions:\n  1. Review your CSV for properly paired quote characters\n" +
        "  2. Use double quotes (\"\") to escape quotes within quoted fields\n" +
        "  3. Ensure all commas within field values are inside quotes\n" +
        "  4. Enable supportQuotedField(true) if you're using quoted fields",
        { location }
      );
    }
  }

  class FileOperationError extends CsvParsingError {
    constructor(operation, filePath, originalError) {
      super(
        "File operation error: Failed to " + operation + " file.\nFile path: " + filePath +
        "\nReason: " + originalError.message + "\n\nSolutions:\n" +
        "  1. Verify the file path is correct: " + filePath + "\n" +
        "  2. Check file permissions (read access for input, write access for output)\n" +
        "  3. Ensure the directory exists and is writable for output files\n" +
        "  4. Verify the file is not in use by another process",
        "FILE_OPERATION_ERROR",
        { operation, filePath, originalError: originalError.message }
      );
      this.name = "FileOperationError";
      this.originalError = originalError;
    }
  }

  class JsonValidationError extends CsvParsingError {
    constructor(csvText, originalError) {
      super(
        "JSON validation error: The parsed CSV data generated invalid JSON.\n" +
        "This typically indicates malformed field names or values in the CSV.\n" +
        "Original error: " + originalError.message + "\n\nSolutions:\n" +
        "  1. Check that field names are valid JavaScript identifiers (or will be converted safely)\n" +
        "  2. Review the CSV data for special characters that aren't properly escaped\n" +
        "  3. Enable supportQuotedField(true) for fields containing special characters\n" +
        "  4. Verify that formatValueByType() isn't converting values incorrectly",
        "JSON_VALIDATION_ERROR",
        { originalError: originalError.message, csvPreview: csvText ? csvText.substring(0, 200) : "N/A" }
      );
      this.name = "JsonValidationError";
      this.originalError = originalError;
    }
  }

  class BrowserApiError extends CsvParsingError {
    constructor(message, context = {}) {
      super(message, "BROWSER_API_ERROR", context);
      this.name = "BrowserApiError";
    }

    static fileReaderNotAvailable() {
      return new BrowserApiError(
        "Browser compatibility error: FileReader API is not available.\n" +
        "Your browser does not support the FileReader API required for file parsing.\n\nSolutions:\n" +
        "  1. Use a modern browser that supports FileReader (Chrome 13+, Firefox 10+, Safari 6+)\n" +
        "  2. Consider using csvStringToJson() or csvStringToJsonAsync() for string-based parsing\n" +
        "  3. Implement a polyfill or alternative file reading method"
      );
    }

    static parseFileError(error) {
      return new BrowserApiError(
        "Browser file parsing error: Failed to read and parse the file.\nError details: " + error.message +
        "\n\nSolutions:\n  1. Verify the file is a valid CSV file\n" +
        "  2. Check the file encoding (UTF-8 is recommended)\n" +
        "  3. Try a smaller file to isolate the issue\n" +
        "  4. Check browser console for additional error details",
        { originalError: error.message }
      );
    }

    static streamingNotSupported() {
      return new BrowserApiError(
        "Browser compatibility error: ReadableStream API is not available.\n" +
        "Your browser does not support the ReadableStream API required for streaming.\n\nSolutions:\n" +
        "  1. Use a modern browser that supports ReadableStream (Chrome 43+, Firefox 65+, Safari 10.1+)\n" +
        "  2. Use getJsonFromFileStreamingAsync() which falls back to regular file parsing\n" +
        "  3. Consider using parseFile() for non-streaming file parsing\n" +
        "  4. Implement a polyfill for ReadableStream support"
      );
    }
  }

  module.exports = { CsvParsingError, InputValidationError, ConfigurationError, CsvFormatError,
    FileOperationError, JsonValidationError, BrowserApiError };
});

var requireFileUtils = __commonJS(function fileUtilsModule(exports, module) {
  var fs = require("fs");
  var { FileOperationError } = requireErrors();
  var encodedFileTypes = new Set(["base64", "hex"]);

  module.exports = new class FileUtils {
    _isEncodedFile(encoding) {
      return encodedFileTypes.has(encoding);
    }

    _decodeContent(content, encoding) {
      return this._isEncodedFile(encoding) ? Buffer.from(content, encoding).toString("utf8") : content;
    }

    _toString(content) {
      return typeof content === "string" ? content : content.toString();
    }

    _wrapReadError(filePath, error) {
      return new FileOperationError("read", filePath, error);
    }

    _wrapWriteError(filePath, error) {
      return new FileOperationError("write", filePath, error);
    }

    _readFileSync(filePath, encoding) {
      if (this._isEncodedFile(encoding)) {
        return this._decodeContent(fs.readFileSync(filePath, "utf8"), encoding);
      }
      return this._toString(fs.readFileSync(filePath, encoding));
    }

    readFile(filePath, encoding = "utf8") {
      try {
        return this._readFileSync(filePath, encoding);
      } catch (error) {
        throw this._wrapReadError(filePath, error);
      }
    }

    _readFileAsyncWithPromises(filePath, encoding) {
      if (this._isEncodedFile(encoding)) {
        return fs.promises.readFile(filePath, "utf8").then((content) => this._decodeContent(content, encoding));
      }
      return fs.promises.readFile(filePath, encoding).then((content) => this._toString(content));
    }

    readFileAsync(filePath, encoding = "utf8") {
      if (fs.promises && typeof fs.promises.readFile === "function") {
        return this._readFileAsyncWithPromises(filePath, encoding).catch((error) => {
          throw this._wrapReadError(filePath, error);
        });
      }
      return new Promise((resolve, reject) => {
        const readEncoding = this._isEncodedFile(encoding) ? "utf8" : encoding;
        fs.readFile(filePath, readEncoding, (error, content) => {
          if (error) {
            reject(this._wrapReadError(filePath, error));
          } else {
            try {
              const result = this._isEncodedFile(encoding)
                ? this._decodeContent(this._toString(content), encoding)
                : this._toString(content);
              resolve(result);
            } catch (conversionError) {
              reject(this._wrapReadError(filePath, conversionError));
            }
          }
        });
      });
    }

    _writeFileSync(filePath, content) {
      fs.writeFileSync(filePath, content, "utf8");
    }

    _writeFileAsyncWithPromises(filePath, content) {
      return fs.promises.writeFile(filePath, content, "utf8");
    }

    writeFile(content, filePath) {
      try {
        this._writeFileSync(filePath, content);
      } catch (error) {
        throw this._wrapWriteError(filePath, error);
      }
    }

    writeFileAsync(content, filePath) {
      if (fs.promises && typeof fs.promises.writeFile === "function") {
        return this._writeFileAsyncWithPromises(filePath, content).catch((error) => {
          throw this._wrapWriteError(filePath, error);
        });
      }
      return new Promise((resolve, reject) => {
        fs.writeFile(filePath, content, "utf8", (error) => {
          if (error) {
            reject(this._wrapWriteError(filePath, error));
          } else {
            resolve();
          }
        });
      });
    }
  }();
});

var requireStringUtils = __commonJS(function stringUtilsModule(exports, module) {
  const patterns = { INTEGER: /^-?\d+$/, FLOAT: /^-?\d*\.\d+$/, WHITESPACE: /\s/g };
  const booleanValues = { TRUE: "true", FALSE: "false" };

  class StringUtils {
    static PATTERNS = patterns;
    static BOOLEAN_VALUES = booleanValues;

    trimPropertyName(removeAllWhitespace, propertyName) {
      if (!propertyName) return "";
      return removeAllWhitespace ? propertyName.replace(StringUtils.PATTERNS.WHITESPACE, "") : propertyName.trim();
    }

    getValueFormatByType(value) {
      if (this.isEmpty(value)) return "";
      if (this.isBoolean(value)) return this.convertToBoolean(value);
      if (this.isInteger(value)) return this.convertInteger(value);
      if (this.isFloat(value)) return this.convertFloat(value);
      return value + "";
    }

    hasContent(values = []) {
      return Array.isArray(values) && values.some((value) => !!value);
    }

    isEmpty(value) {
      return value === undefined || value === "";
    }

    isBoolean(value) {
      const normalizedValue = value.toLowerCase();
      return normalizedValue === StringUtils.BOOLEAN_VALUES.TRUE ||
        normalizedValue === StringUtils.BOOLEAN_VALUES.FALSE;
    }

    isInteger(value) {
      return StringUtils.PATTERNS.INTEGER.test(value);
    }

    isFloat(value) {
      return StringUtils.PATTERNS.FLOAT.test(value);
    }

    hasLeadingZero(value) {
      const positiveLeadingZero = value.length > 1 && value[0] === "0";
      const negativeLeadingZero = value.length > 2 && value[0] === "-" && value[1] === "0";
      return positiveLeadingZero || negativeLeadingZero;
    }

    convertToBoolean(value) {
      return JSON.parse(value.toLowerCase());
    }

    convertInteger(value) {
      if (this.hasLeadingZero(value)) return String(value);
      const number = Number(value);
      return Number.isSafeInteger(number) ? number : value + "";
    }

    convertFloat(value) {
      const number = Number(value);
      return Number.isFinite(number) ? number : value + "";
    }
  }

  module.exports = new StringUtils();
});

var requireJsonUtils = __commonJS(function jsonUtilsModule(exports, module) {
  var { JsonValidationError } = requireErrors();
  module.exports = new class JsonUtils {
    validateJson(jsonText) {
      try {
        JSON.parse(jsonText);
      } catch (error) {
        throw new JsonValidationError(jsonText, error);
      }
    }
  }();
});

var requireParserConfig = __commonJS(function parserConfigModule(exports, module) {
  module.exports = class ParserConfig {
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
      this.indexesToIgnore = config.indexesToIgnore
        ? Object.freeze([...config.indexesToIgnore])
        : Object.freeze([]);
      Object.freeze(this);
    }
  };
});

var requireConfigurable = __commonJS(function configurableModule(exports, module) {
  var { ConfigurationError } = requireErrors();
  var ParserConfig = requireParserConfig();

  module.exports = class Configurable {
    constructor(config = {}) {
      this.config = { ...config };
    }

    formatValueByType(enabled = true) {
      this.config.printValueFormatByType = enabled;
      return this;
    }

    supportQuotedField(enabled = false) {
      this.config.isSupportQuotedField = enabled;
      return this;
    }

    fieldDelimiter(delimiter) {
      this.config.delimiter = delimiter;
      return this;
    }

    trimHeaderFieldWhiteSpace(enabled = false) {
      this.config.isTrimHeaderFieldWhiteSpace = enabled;
      return this;
    }

    indexHeader(index) {
      if (isNaN(index)) throw ConfigurationError.invalidHeaderIndex(index);
      this.config.indexHeaderValue = index;
      return this;
    }

    parseSubArray(delimiter = "*", separator = ",") {
      this.config.parseSubArrayDelimiter = delimiter;
      this.config.parseSubArraySeparator = separator;
      return this;
    }

    mapRows(mapper) {
      if (typeof mapper !== "function") throw new TypeError("mapperFn must be a function");
      this.config.rowMapper = mapper;
      return this;
    }

    ignoreColumnIndexes(indexes) {
      this.config.indexesToIgnore = [...indexes];
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
});

var requireCsvToJson = __commonJS(function csvToJsonModule(exports, module) {
  var fileUtils = requireFileUtils();
  var stringUtils = requireStringUtils();
  var jsonUtils = requireJsonUtils();
  var { ConfigurationError, CsvFormatError } = requireErrors();
  var Configurable = requireConfigurable();
  requireParserConfig();

  class CsvToJson extends Configurable {
    csvToJsonWithConfig(csvText, config) {
      this.validateInputConfig(config);
      const records = this.parseRecords(csvText);
      const delimiter = this.getFieldDelimiter(config);
      let headers;
      let headerIndex = this.getIndexHeader(config);
      while (headerIndex < records.length) {
        headers = this.getFields(records[headerIndex], config, delimiter);
        if (stringUtils.hasContent(headers)) break;
        headerIndex++;
      }
      if (!headers) throw CsvFormatError.missingHeader();

      const result = [];
      for (let recordIndex = headerIndex + 1; recordIndex < records.length; recordIndex++) {
        const fields = this.getFields(records[recordIndex], config, delimiter);
        if (stringUtils.hasContent(fields)) {
          let row = this.buildJsonResult(headers, fields, config);
          if (config.rowMapper) {
            row = config.rowMapper(row, recordIndex - (headerIndex + 1));
            if (row != null) result.push(row);
          } else {
            result.push(row);
          }
        }
      }
      return result;
    }

    generateJsonFileFromCsv(inputFileName, outputFileName) {
      const jsonText = this.getJsonFromCsvStringified(inputFileName);
      fileUtils.writeFile(jsonText, outputFileName);
    }

    getJsonFromCsvStringified(inputFileName) {
      const result = this.getJsonFromCsv(inputFileName);
      const jsonText = JSON.stringify(result, undefined, 1);
      jsonUtils.validateJson(jsonText);
      return jsonText;
    }

    getJsonFromCsv(inputFileName) {
      const config = this.getParserConfig();
      const csvText = fileUtils.readFile(inputFileName, config.encoding || "utf8");
      return this.csvToJson(csvText);
    }

    csvStringToJson(csvText) {
      return this.csvToJson(csvText);
    }

    csvStringToJsonStringified(csvText) {
      const result = this.csvStringToJson(csvText);
      const jsonText = JSON.stringify(result, undefined, 1);
      jsonUtils.validateJson(jsonText);
      return jsonText;
    }

    csvToJson(csvText) {
      return this.csvToJsonWithConfig(csvText, this.getParserConfig());
    }

    parseRecords(csvText) {
      const records = [];
      let currentRecord = "";
      let isInsideQuotes = false;
      let index = 0;
      while (index < csvText.length) {
        const character = csvText[index];
        if (character === '"') {
          if (isInsideQuotes && csvText.length > 1 && csvText[1] === '"') {
            currentRecord += '""';
            index += 2;
          } else {
            isInsideQuotes = !isInsideQuotes;
            currentRecord += character;
            index++;
          }
        } else {
          if (!isInsideQuotes) {
            const lineEndingLength = this.getLineEndingLength(csvText, index);
            if (lineEndingLength > 0) {
              records.push(currentRecord);
              currentRecord = "";
              index += lineEndingLength;
              continue;
            }
          }
          currentRecord += character;
          index++;
        }
      }
      if (isInsideQuotes) throw CsvFormatError.mismatchedQuotes("CSV");
      return records;
    }

    getLineEndingLength(text, index) {
      if (text.slice(index, index + 2) === "\r\n") return 2;
      if (text[index] === "\n" || (text[index] === "\r" && text[index + 1] !== "\n")) return 1;
      return 0;
    }

    getFieldDelimiter(config = this.config) {
      return config.delimiter ? config.delimiter : ",";
    }

    getIndexHeader(config = this.config) {
      return config.indexHeaderValue === null || isNaN(config.indexHeaderValue)
        ? 0
        : config.indexHeaderValue;
    }

    getFields(record, config = this.config, delimiter = this.getFieldDelimiter(config)) {
      return config.isSupportQuotedField ? this.split(record, config) : record.split(delimiter);
    }

    buildJsonResult(headers, fields, config = this.config) {
      const result = {};
      const ignoredIndexes = config.indexesToIgnore ? new Set(config.indexesToIgnore) : new Set();
      for (let index = 0; index < headers.length; index++) {
        if (ignoredIndexes.has(index)) continue;
        const propertyName = stringUtils.trimPropertyName(
          config.isTrimHeaderFieldWhiteSpace,
          headers[index]
        );
        let value = fields[index];
        if (this.isParseSubArray(value, config)) value = this.buildJsonSubArray(value, config);
        if (config.printValueFormatByType && !Array.isArray(value)) {
          value = stringUtils.getValueFormatByType(fields[index]);
        }
        result[propertyName] = value;
      }
      return result;
    }

    buildJsonSubArray(value, config = this.config) {
      const innerValue = value.substring(
        value.indexOf(config.parseSubArrayDelimiter) + 1,
        value.lastIndexOf(config.parseSubArrayDelimiter)
      );
      const values = innerValue.split(config.parseSubArraySeparator);
      if (config.printValueFormatByType) {
        for (let index = 0; index < values.length; index++) {
          values[index] = stringUtils.getValueFormatByType(values[index]);
        }
      }
      return values;
    }

    isParseSubArray(value, config = this.config) {
      return !!config.parseSubArrayDelimiter && value &&
        value.indexOf(config.parseSubArrayDelimiter) === 0 &&
        value.lastIndexOf(config.parseSubArrayDelimiter) === value.length - 1;
    }

    validateInputConfig(config = this.config) {
      if (config.isSupportQuotedField) {
        if (this.getFieldDelimiter(config) === '"') {
          throw ConfigurationError.quotedFieldConflict("fieldDelimiter", '"');
        }
        if (config.parseSubArraySeparator === '"') {
          throw ConfigurationError.quotedFieldConflict("parseSubArraySeparator", '"');
        }
        if (config.parseSubArrayDelimiter === '"') {
          throw ConfigurationError.quotedFieldConflict("parseSubArrayDelimiter", '"');
        }
      }
    }

    hasQuotes(value) {
      return value.includes('"');
    }

    split(record, config = this.config) {
      if (record.length === 0) return [];
      const fields = [];
      let currentField = "";
      let isInsideQuotes = false;
      const delimiter = this.getFieldDelimiter(config);
      for (let index = 0; index < record.length; index++) {
        const character = record[index];
        if (character === '"') {
          if (this.isEscapedQuote(record, index, isInsideQuotes)) {
            currentField += '"';
            index++;
          } else if (this.isEmptyQuotedField(record, index, isInsideQuotes, currentField, delimiter)) {
            index++;
          } else {
            isInsideQuotes = !isInsideQuotes;
          }
        } else if (character === delimiter && !isInsideQuotes) {
          fields.push(currentField);
          currentField = "";
        } else {
          currentField += character;
        }
      }
      fields.push(currentField);
      if (isInsideQuotes) throw CsvFormatError.mismatchedQuotes("row");
      return fields;
    }

    isEscapedQuote(record, index, isInsideQuotes) {
      return isInsideQuotes && index + 1 < record.length && record[index + 1] === '"';
    }

    isEmptyQuotedField(record, index, isInsideQuotes, currentField, delimiter) {
      if (isInsideQuotes || currentField !== "" || index + 1 >= record.length) return false;
      if (record[index + 1] !== '"') return false;
      const followingIndex = index + 2;
      return followingIndex === record.length || record[followingIndex] === delimiter;
    }
  }

  module.exports = new CsvToJson();
  module.exports.CsvToJson = CsvToJson;
});

var requireStreamProcessor = __commonJS(function streamProcessorModule(exports, module) {
  var stringUtils = requireStringUtils();

  module.exports = class StreamProcessor {
    constructor(csvConfig, options = {}) {
      this.csvConfig = csvConfig;
      this.isBrowser = options.isBrowser ||
        (typeof window !== "undefined" && typeof document !== "undefined");
      this.buffer = "";
      this.isInsideQuotes = false;
      this.headers = null;
      this.headerRowIndex = csvConfig.indexHeaderValue !== null && !isNaN(csvConfig.indexHeaderValue)
        ? csvConfig.indexHeaderValue
        : 0;
      this.currentRecordIndex = 0;
      this.parsedRecords = [];
      this.dataRowIndex = 0;
      this.ignoredIndexes = new Set(csvConfig.indexesToIgnore || []);
      this.chunkSize = options.chunkSize || 1000;
      this.onChunk = options.onChunk;
      this.onComplete = options.onComplete;
      this.onError = options.onError;
      this.allRecords = [];
    }

    processChunk(chunk) {
      let text;
      if (typeof chunk === "string") {
        text = chunk;
      } else if (this.isBrowser && typeof globalThis.TextDecoder !== "undefined") {
        text = new globalThis.TextDecoder().decode(chunk);
      } else if (this.isBrowser) {
        text = String.fromCharCode.apply(null, new Uint8Array(chunk));
      } else {
        text = chunk.toString();
      }
      this.buffer += text;
      this._processCompleteRecords();
    }

    async processStreamWithCallbacks(stream) {
      return new Promise((resolve, reject) => {
        if (this.isBrowser) {
          if (!stream || typeof stream.getReader !== "function") {
            const error = Error("Invalid ReadableStream provided");
            if (this.onError) this.onError(error);
            reject(error);
            return;
          }
          const reader = stream.getReader();
          (async () => {
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) {
                  this.finalizeProcessing();
                  this._sendRemainingChunks();
                  if (this.onComplete) this.onComplete(this.allRecords);
                  resolve();
                  return;
                }
                this.processChunk(value);
                this._sendPendingChunks();
              }
            } catch (error) {
              if (this.onError) this.onError(error);
              reject(error);
            }
          })();
          return;
        }

        if (!stream || typeof stream.pipe !== "function") {
          const error = Error("Invalid Readable stream provided");
          if (this.onError) this.onError(error);
          reject(error);
          return;
        }
        stream.on("data", (chunk) => {
          try {
            this.processChunk(chunk);
            this._sendPendingChunks();
          } catch (error) {
            if (this.onError) this.onError(error);
            reject(error);
          }
        });
        stream.on("end", () => {
          try {
            this.finalizeProcessing();
            this._sendRemainingChunks();
            if (this.onComplete) this.onComplete(this.allRecords);
            resolve();
          } catch (error) {
            if (this.onError) this.onError(error);
            reject(error);
          }
        });
        stream.on("error", (error) => {
          if (this.onError) this.onError(error);
          reject(error);
        });
      });
    }

    _sendPendingChunks() {
      if (this.onChunk) {
        while (this.parsedRecords.length >= this.chunkSize) {
          const chunk = this.parsedRecords.splice(0, this.chunkSize);
          this.allRecords.push(...chunk);
          this.onChunk(chunk, this.allRecords.length, null);
        }
      }
    }

    _sendRemainingChunks() {
      if (!this.onChunk || this.parsedRecords.length === 0) return;
      const chunk = [...this.parsedRecords];
      this.parsedRecords.length = 0;
      this.allRecords.push(...chunk);
      this.onChunk(chunk, this.allRecords.length, this.allRecords.length);
    }

    async processStream(stream) {
      return new Promise((resolve, reject) => {
        if (this.isBrowser) {
          if (!stream || typeof stream.getReader !== "function") {
            reject(Error("Invalid ReadableStream provided"));
            return;
          }
          const reader = stream.getReader();
          const readStream = async () => {
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) {
                  this.finalizeProcessing();
                  resolve(this.getResult());
                  return;
                }
                this.processChunk(value);
              }
            } catch (error) {
              reject(error);
            }
          };
          readStream();
          return;
        }

        if (!stream || typeof stream.pipe !== "function") {
          reject(Error("Invalid Readable stream provided"));
          return;
        }
        stream.on("data", (chunk) => {
          try {
            this.processChunk(chunk);
          } catch (error) {
            reject(error);
          }
        });
        stream.on("end", () => {
          try {
            this.finalizeProcessing();
            resolve(this.getResult());
          } catch (error) {
            reject(error);
          }
        });
        stream.on("error", (error) => reject(error));
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
      const parsed = this._parseRecordsFromBuffer(this.buffer, this.isInsideQuotes);
      this.buffer = parsed.remainingBuffer;
      this.isInsideQuotes = parsed.isInsideQuotes;
      for (const record of parsed.completeRecords) {
        this._processRecord(record);
        this.currentRecordIndex++;
      }
    }

    _processRemainingBuffer() {
      if (this.buffer.length > 0) {
        if (this.isInsideQuotes) throw CsvFormatError.mismatchedQuotes("CSV stream");
        const parsed = this._parseRecordsFromBuffer(this.buffer + "\n", false);
        for (const record of parsed.completeRecords) {
          this._processRecord(record);
          this.currentRecordIndex++;
        }
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
      const fields = this._splitRecord(record);
      if (stringUtils.hasContent(fields)) this.headers = fields;
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
      return this.csvConfig.isSupportQuotedField
        ? this._splitWithConfig(record, this.csvConfig)
        : record.split(this.csvConfig.delimiter || ",");
    }

    _splitWithConfig(record, config) {
      if (record.length === 0) return [];
      const fields = [];
      let currentField = "";
      let isInsideQuotes = false;
      const delimiter = config.delimiter || ",";
      for (let index = 0; index < record.length; index++) {
        const character = record[index];
        if (character === '"') {
          if (isInsideQuotes && 1 < record.length && record[1] === '"') {
            currentField += '"';
            index++;
          } else {
            isInsideQuotes = !isInsideQuotes;
          }
        } else if (character === delimiter && !isInsideQuotes) {
          fields.push(currentField);
          currentField = "";
        } else {
          currentField += character;
        }
      }
      fields.push(currentField);
      if (isInsideQuotes) throw CsvFormatError.mismatchedQuotes("row");
      return fields;
    }

    _buildJsonResult(headers, fields) {
      const result = {};
      for (let index = 0; index < headers.length; index++) {
        if (this.ignoredIndexes.has(index)) continue;
        const propertyName = stringUtils.trimPropertyName(
          this.csvConfig.isTrimHeaderFieldWhiteSpace,
          headers[index]
        );
        let value = fields[index];
        if (this._isParseSubArray(value)) value = this._buildJsonSubArray(value);
        if (this.csvConfig.printValueFormatByType && !Array.isArray(value)) {
          value = stringUtils.getValueFormatByType(fields[index]);
        }
        result[propertyName] = value;
      }
      return result;
    }

    _isParseSubArray(value) {
      return !!this.csvConfig.parseSubArrayDelimiter && value &&
        value.indexOf(this.csvConfig.parseSubArrayDelimiter) === 0 &&
        value.lastIndexOf(this.csvConfig.parseSubArrayDelimiter) === value.length - 1;
    }

    _buildJsonSubArray(value) {
      const values = value.substring(
        value.indexOf(this.csvConfig.parseSubArrayDelimiter) + 1,
        value.lastIndexOf(this.csvConfig.parseSubArrayDelimiter)
      ).split(this.csvConfig.parseSubArraySeparator);
      if (this.csvConfig.printValueFormatByType) {
        for (let index = 0; index < values.length; index++) {
          values[index] = stringUtils.getValueFormatByType(values[index]);
        }
      }
      return values;
    }

    _parseRecordsFromBuffer(buffer, isInsideQuotes) {
      const completeRecords = [];
      let currentRecord = "";
      let index = 0;
      while (index < buffer.length) {
        const character = buffer[index];
        if (character === '"') {
          const escapedQuote = this._handleEscapedQuote(buffer, index, isInsideQuotes);
          if (escapedQuote.wasEscaped) {
            currentRecord += '""';
            index = escapedQuote.newIndex;
            continue;
          }
          isInsideQuotes = !isInsideQuotes;
        } else if (!isInsideQuotes && this._isLineEnding(buffer, index)) {
          const lineEndingLength = this._getLineEndingLength(buffer, index);
          completeRecords.push(currentRecord);
          currentRecord = "";
          index += lineEndingLength;
          continue;
        }
        currentRecord += character;
        index++;
      }
      return { completeRecords, remainingBuffer: currentRecord, isInsideQuotes };
    }

    _handleEscapedQuote(buffer, index, isInsideQuotes) {
      if (isInsideQuotes && index + 1 < buffer.length && buffer[index + 1] === '"') {
        return { wasEscaped: true, newIndex: index + 2 };
      }
      return { wasEscaped: false, newIndex: index + 1 };
    }

    _isLineEnding(buffer, index) {
      return this._getLineEndingLength(buffer, index) > 0;
    }

    _getLineEndingLength(buffer, index) {
      if (buffer.slice(index, index + 2) === "\r\n") return 2;
      if (buffer[index] === "\n" || (buffer[index] === "\r" && buffer[index + 1] !== "\n")) return 1;
      return 0;
    }

    _validateProcessingResult() {
      if ((this.headers || this.parsedRecords.length !== 0) && !this.headers) {
        throw CsvFormatError.missingHeader();
      }
    }
  };
});

var requireCsvToJsonAsync = __commonJS(function csvToJsonAsyncModule(exports, module) {
  var fileUtils = requireFileUtils();
  var csvToJson = requireCsvToJson();
  var Configurable = requireConfigurable();
  var { InputValidationError } = requireErrors();
  var StreamProcessor = requireStreamProcessor();
  const rawOptions = { raw: true };

  module.exports = new class CsvToJsonAsync extends Configurable {
    constructor() {
      super();
      this.csvToJson = csvToJson;
    }

    async generateJsonFileFromCsv(inputFileName, outputFileName) {
      const jsonText = await this.getJsonFromCsvStringified(inputFileName);
      await fileUtils.writeFileAsync(jsonText, outputFileName);
    }

    async getJsonFromCsvStringified(inputFileName) {
      const result = await this.getJsonFromCsvAsync(inputFileName);
      return JSON.stringify(result, undefined, 1);
    }

    async getJsonFromCsvAsync(inputFileNameOrCsv, options = {}) {
      if (inputFileNameOrCsv === null || inputFileNameOrCsv === undefined) {
        throw new InputValidationError(
          "inputFileNameOrCsv",
          "string (file path) or CSV string content",
          typeof inputFileNameOrCsv,
          "Either provide a valid file path or CSV content as a string."
        );
      }
      const config = this.getParserConfig();
      if (options.raw) {
        return this.csvToJson.csvToJsonWithConfig(inputFileNameOrCsv, config);
      }
      const csvText = await fileUtils.readFileAsync(inputFileNameOrCsv, config.encoding || "utf8");
      return this.csvToJson.csvToJsonWithConfig(csvText, config);
    }

    csvStringToJsonAsync(csvText, options = rawOptions) {
      return this.getJsonFromCsvAsync(csvText, options);
    }

    async getJsonFromStreamAsync(stream) {
      this._validateStream(stream);
      const config = this.getParserConfig();
      return new StreamProcessor(config, { isBrowser: false }).processStream(stream);
    }

    _validateStream(stream) {
      if (!stream || typeof stream.pipe !== "function") {
        throw new InputValidationError(
          "stream",
          "Readable stream",
          typeof stream,
          "Provide a valid Node.js Readable stream."
        );
      }
    }

    async getJsonFromFileStreamingAsync(filePath) {
      if (!filePath || typeof filePath !== "string") {
        throw new InputValidationError(
          "filePath",
          "string (file path)",
          typeof filePath,
          "Provide a valid file path as a string."
        );
      }
      const fs = require("fs");
      const config = this.getParserConfig();
      const encoding = typeof config.encoding === "string" ? config.encoding : "utf8";
      const stream = fs.createReadStream(filePath, { encoding });
      return this.getJsonFromStreamAsync(stream);
    }
  }();
});

var requireBrowserApi = __commonJS(function browserApiModule(exports, module) {
  var csvToJson = requireCsvToJson();
  var Configurable = requireConfigurable();
  var { InputValidationError, BrowserApiError } = requireErrors();
  var StreamProcessor = requireStreamProcessor();

  module.exports = new class BrowserApi extends Configurable {
    constructor() {
      super();
      this.csvToJson = csvToJson;
    }

    _validateCsvString(csvText) {
      if (csvText == null) {
        throw new InputValidationError(
          "csvString",
          "string",
          typeof csvText,
          "Provide valid CSV content as a string to parse."
        );
      }
    }

    _parseCsvText(csvText) {
      const config = this.getParserConfig();
      return this.csvToJson.csvToJsonWithConfig(String(csvText), config);
    }

    csvStringToJson(csvText) {
      this._validateCsvString(csvText);
      return this._parseCsvText(csvText);
    }

    csvStringToJsonStringified(csvText) {
      this._validateCsvString(csvText);
      return JSON.stringify(this._parseCsvText(csvText), undefined, 1);
    }

    csvStringToJsonAsync(csvText) {
      return Promise.resolve(this.csvStringToJson(csvText));
    }

    csvStringToJsonStringifiedAsync(csvText) {
      return Promise.resolve(this.csvStringToJsonStringified(csvText));
    }

    parseFile(file, options = {}) {
      if (!file) {
        return Promise.reject(new InputValidationError(
          "file",
          "File or Blob object",
          typeof file,
          "Provide a valid File or Blob object to parse."
        ));
      }
      return new Promise((resolve, reject) => {
        if (typeof FileReader === "undefined") {
          reject(BrowserApiError.fileReaderNotAvailable());
          return;
        }
        const reader = new FileReader();
        reader.onerror = () => reject(BrowserApiError.parseFileError(
          reader.error || Error("Unknown file reading error")
        ));
        reader.onload = () => {
          try {
            resolve(this._parseCsvText(reader.result));
          } catch (error) {
            reject(BrowserApiError.parseFileError(error));
          }
        };
        if (options.encoding) {
          reader.readAsText(file, options.encoding);
        } else {
          reader.readAsText(file);
        }
      });
    }

    async getJsonFromStreamAsync(stream) {
      if (typeof ReadableStream === "undefined") {
        throw BrowserApiError.streamingNotSupported();
      }
      if (!stream || typeof stream.getReader !== "function") {
        throw new InputValidationError(
          "stream",
          "ReadableStream",
          typeof stream,
          "Provide a valid browser ReadableStream."
        );
      }
      const config = this.getParserConfig();
      return new StreamProcessor(config, { isBrowser: true }).processStream(stream);
    }

    async getJsonFromFileStreamingAsync(file) {
      if (!(file && file instanceof File)) {
        throw new InputValidationError(
          "file",
          "File object",
          typeof file,
          "Provide a valid File object."
        );
      }
      if (typeof file.stream === "function") {
        return this.getJsonFromStreamAsync(file.stream());
      }
      return this.parseFile(file);
    }

    async getJsonFromFileStreamingAsyncWithCallback(file, options = {}) {
      if (!(file && file instanceof File)) {
        throw new InputValidationError(
          "file",
          "File object",
          typeof file,
          "Provide a valid File object."
        );
      }
      if (!options.onChunk || typeof options.onChunk !== "function") {
        throw new InputValidationError(
          "options.onChunk",
          "function",
          typeof options.onChunk,
          "Provide a callback function to handle processed chunks."
        );
      }
      const config = this.getParserConfig();
      const processor = new StreamProcessor(config, {
        isBrowser: true,
        chunkSize: options.chunkSize || 1000,
        onChunk: options.onChunk,
        onComplete: options.onComplete,
        onError: options.onError
      });
      if (typeof file.stream === "function") {
        return processor.processStreamWithCallbacks(file.stream());
      }
      return this.parseFileWithCallbacks(file, options);
    }

    async parseFileWithCallbacks(file, options) {
      const chunkSize = options.chunkSize || 1000;
      const onChunk = options.onChunk;
      const onComplete = options.onComplete;
      const onError = options.onError;
      return new Promise((resolve, reject) => {
        if (typeof FileReader === "undefined") {
          const error = BrowserApiError.fileReaderNotAvailable();
          if (onError) onError(error);
          reject(error);
          return;
        }
        const reader = new FileReader();
        reader.onerror = () => {
          const error = BrowserApiError.parseFileError(
            reader.error || Error("Unknown file reading error")
          );
          if (onError) onError(error);
          reject(error);
        };
        reader.onload = () => {
          try {
            const records = this._parseCsvText(reader.result);
            let index = 0;
            const totalRecords = records.length;
            const processNextChunk = () => {
              const chunk = records.slice(index, index + chunkSize);
              if (chunk.length > 0) {
                onChunk(chunk, index + chunk.length, totalRecords);
                index += chunk.length;
                setTimeout(processNextChunk, 0);
              } else {
                if (onComplete) onComplete(records);
                resolve();
              }
            };
            processNextChunk();
          } catch (parseError) {
            const error = BrowserApiError.parseFileError(parseError);
            if (onError) onError(error);
            reject(error);
          }
        };
        reader.readAsText(file);
      });
    }
  }();
});

var csvToJson = requireCsvToJson();
var encodingOptions = {
  utf8: "utf8",
  ucs2: "ucs2",
  utf16le: "utf16le",
  latin1: "latin1",
  ascii: "ascii",
  base64: "base64",
  hex: "hex"
};
var csvToJsonAsync = requireCsvToJsonAsync();

function applyConfigToAllClients(configure) {
  configure(csvToJson);
  configure(csvToJsonAsync);
  if (exports.browser) configure(exports.browser);
  return exports;
}

exports.formatValueByType = function formatValueByType(enabled = true) {
  return applyConfigToAllClients((client) => client.formatValueByType(enabled));
};
exports.supportQuotedField = function supportQuotedField(enabled = false) {
  return applyConfigToAllClients((client) => client.supportQuotedField(enabled));
};
exports.fieldDelimiter = function fieldDelimiter(delimiter) {
  return applyConfigToAllClients((client) => client.fieldDelimiter(delimiter));
};
exports.trimHeaderFieldWhiteSpace = function trimHeaderFieldWhiteSpace(enabled = false) {
  return applyConfigToAllClients((client) => client.trimHeaderFieldWhiteSpace(enabled));
};
exports.indexHeader = function indexHeader(index) {
  return applyConfigToAllClients((client) => client.indexHeader(index));
};
exports.parseSubArray = function parseSubArray(delimiter, separator) {
  return applyConfigToAllClients((client) => client.parseSubArray(delimiter, separator));
};
exports.ignoreColumnIndexes = function ignoreColumnIndexes(indexes) {
  if (!Array.isArray(indexes)) throw new TypeError("indexes must be an array of numbers");
  if (!indexes.every((index) => Number.isInteger(index) && index >= 0)) {
    throw new TypeError("All elements in indexes must be valid non-negative numbers (>= 0)");
  }
  return applyConfigToAllClients((client) => client.ignoreColumnIndexes(indexes));
};
exports.customEncoding = function customEncoding(encoding) {
  return applyConfigToAllClients((client) => client.encoding(encoding));
};
exports.utf8Encoding = function utf8Encoding() {
  return applyConfigToAllClients((client) => client.encoding(encodingOptions.utf8));
};
exports.ucs2Encoding = function ucs2Encoding() {
  return applyConfigToAllClients((client) => client.encoding(encodingOptions.ucs2));
};
exports.utf16leEncoding = function utf16leEncoding() {
  return applyConfigToAllClients((client) => client.encoding(encodingOptions.utf16le));
};
exports.latin1Encoding = function latin1Encoding() {
  return applyConfigToAllClients((client) => client.encoding(encodingOptions.latin1));
};
exports.asciiEncoding = function asciiEncoding() {
  return applyConfigToAllClients((client) => client.encoding(encodingOptions.ascii));
};
exports.base64Encoding = function base64Encoding() {
  return applyConfigToAllClients((client) => client.encoding(encodingOptions.base64));
};
exports.hexEncoding = function hexEncoding() {
  return applyConfigToAllClients((client) => client.encoding(encodingOptions.hex));
};
exports.mapRows = function mapRows(mapper) {
  return applyConfigToAllClients((client) => client.mapRows(mapper));
};
exports.generateJsonFileFromCsv = function generateJsonFileFromCsv(inputFileName, outputFileName) {
  if (!inputFileName) throw Error("inputFileName is not defined!!!");
  if (!outputFileName) throw Error("outputFileName is not defined!!!");
  csvToJson.generateJsonFileFromCsv(inputFileName, outputFileName);
};
exports.getJsonFromCsv = function getJsonFromCsv(inputFileName) {
  if (!inputFileName) throw Error("inputFileName is not defined!!!");
  return csvToJson.getJsonFromCsv(inputFileName);
};
exports.getJsonFromCsvAsync = function getJsonFromCsvAsync(inputFileNameOrCsv, options) {
  return csvToJsonAsync.getJsonFromCsvAsync(inputFileNameOrCsv, options);
};
exports.csvStringToJsonAsync = function csvStringToJsonAsync(csvText, options) {
  return csvToJsonAsync.csvStringToJsonAsync(csvText, options);
};
exports.csvStringToJsonStringifiedAsync = function csvStringToJsonStringifiedAsync(csvText) {
  return csvToJsonAsync.csvStringToJsonStringifiedAsync(csvText);
};
exports.generateJsonFileFromCsvAsync = function generateJsonFileFromCsvAsync(inputFileName, outputFileName) {
  return csvToJsonAsync.generateJsonFileFromCsv(inputFileName, outputFileName);
};
exports.getJsonFromStreamAsync = function getJsonFromStreamAsync(stream) {
  return csvToJsonAsync.getJsonFromStreamAsync(stream);
};
exports.getJsonFromFileStreamingAsync = function getJsonFromFileStreamingAsync(filePath) {
  return csvToJsonAsync.getJsonFromFileStreamingAsync(filePath);
};
exports.csvStringToJson = function csvStringToJson(csvText) {
  return csvToJson.csvStringToJson(csvText);
};
exports.csvStringToJsonStringified = function csvStringToJsonStringified(csvText) {
  if (csvText == null) throw Error("csvString is not defined!!!");
  return csvToJson.csvStringToJsonStringified(csvText);
};
exports.browser = requireBrowserApi();
