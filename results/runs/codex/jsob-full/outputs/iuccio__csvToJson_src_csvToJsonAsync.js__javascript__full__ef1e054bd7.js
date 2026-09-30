'use strict';
var __getOwnPropNames = Object.getOwnPropertyNames, __commonJS = (moduleFactories, cachedModule) => function loadModule() {
  const moduleRecord = {
  };
  return moduleRecord.exports = {
  }, (cachedModule || (0, moduleFactories[((__getOwnPropNames)((moduleFactories)))[0]])((cachedModule = moduleRecord)["exports"], cachedModule), cachedModule.exports);
}, require_errors = __commonJS({
  '../work/iuccio__csvToJson/src/core/errors.js'(module, exports) {
    'use strict'; var CsvParsingError = class extends Error {
      constructor(argument5, argument6, value57 = {
      }) {
        super(argument5); this.name = "CsvParsingError"; this.code = argument6; this.context = value57; Error.captureStackTrace(this, this.constructor);
      }
      toString() {
        {
          let value1 = this.name + ':\x20' + this.message; if (this.context && ((Object.keys(this.context).length) > (0))) {
            value1 += "\n\nContext:", Object.entries(this.context).forEach(([value58, value59]) => {
              value1 += "\n  " + value58 + ':\x20' + this.formatValue(value59);
            });
          }
          return value1;
        }
      }
      formatValue(value) {
        {
          if (((value) === (null))) return "null"; if (((value) === (void(0)))) return "undefined"; if (((typeof value) === ("string"))) return '\x22' + value + '\x22'; if (((typeof value) === ("object"))) return JSON.stringify(value); return((String)((value)));
        }
      }
    }, InputValidationError = class extends CsvParsingError {
      constructor(argument8, argument9, argument10, value60 = '') {
        {
          const value2 = "Invalid input: Parameter '" + argument8 + ("' is required.\nExpected: ") + argument9 + ("\nReceived: ") + argument10 + (value60 ? (('\x0a') + (value60)): ''), options4 = {
          }; options4.parameter = argument8, options4.expectedType = argument9, options4.receivedType = argument10, super(value2, "INPUT_VALIDATION_ERROR", options4), this.name = "InputValidationError";
        }
      }
    }, ConfigurationError = class ConfigurationError extends CsvParsingError {
      constructor(argument11, value61 = {
      }) {
        super(argument11, "CONFIGURATION_ERROR", value61), this.name = "ConfigurationError";
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
    }; var CsvFormatError = class CsvFormatError extends CsvParsingError {
      constructor(argument15, value63 = {
      }) {
        super(argument15, "CSV_FORMAT_ERROR", value63); this.name = "CsvFormatError";
      }
      static missingHeader() {
        return new CsvFormatError("CSV parsing error: No header row found.\nThe CSV file appears to be empty or has no valid header line.\n\nSolutions:\n  1. Ensure your CSV file contains at least one row (header row)\n  2. Verify the file is not empty or contains only whitespace\n  3. Check if you need to use indexHeader(n) to specify a non-standard header row\n  4. Refer to RFC 4180 for proper CSV format: https://tools.ietf.org/html/rfc4180");
      }
      static mismatchedQuotes(value64 = "CSV") {
        return new CsvFormatError("CSV parsing error: Mismatched quotes detected in " + value64 + (".\nA quoted field was not properly closed with a matching quote character.\n\nRFC 4180 rules for quoted fields:\n  • Fields containing delimiters or quotes MUST be enclosed in double quotes\n  • To include a quote within a quoted field, use two consecutive quotes: \"\"\n  • Example: \"Smith, John\" (name contains comma)\n  • Example: \"He said \"\"Hello\"\"\" (text contains quotes)\n\nSolutions:\n  1. Review your CSV for properly paired quote characters\n  2. Use double quotes (\"\") to escape quotes within quoted fields\n  3. Ensure all commas within field values are inside quotes\n  4. Enable supportQuotedField(true) if you're using quoted fields"), {
          'location': value64
        });
      }
    }, FileOperationError = class extends CsvParsingError {
      constructor(argument16, argument17, argument18) {
        const value4 = "File operation error: Failed to " + argument16 + (" file.\nFile path: ") + argument17 + ("\nReason: ") + argument18.message + ("\n\nSolutions:\n  1. Verify the file path is correct: ") + argument17 + ("\n  2. Check file permissions (read access for input, write access for output)\n  3. Ensure the directory exists and is writable for output files\n  4. Verify the file is not in use by another process"), options8 = {
        }; options8.operation = argument16, options8.filePath = argument17, options8.originalError = argument18.message, super(value4, "FILE_OPERATION_ERROR", options8), this.name = "FileOperationError"; this.originalError = argument18;
      }
    }, JsonValidationError = class extends CsvParsingError {
      constructor(argument19, argument20) {
        {
          const value5 = "JSON validation error: The parsed CSV data generated invalid JSON.\nThis typically indicates malformed field names or values in the CSV.\nOriginal error: " + argument20.message + ("\n\nSolutions:\n  1. Check that field names are valid JavaScript identifiers (or will be converted safely)\n  2. Review the CSV data for special characters that aren't properly escaped\n  3. Enable supportQuotedField(true) for fields containing special characters\n  4. Verify that formatValueByType() isn't converting values incorrectly"); super(value5, "JSON_VALIDATION_ERROR", {
            'originalError': argument20.message, 'csvPreview': argument19 ? argument19.substring(0, 200): "N/A"
          }), this.name = "JsonValidationError", this.originalError = argument20;
        }
      }
    }, BrowserApiError = class BrowserApiError extends CsvParsingError {
      constructor(argument21, value66 = {
      }) {
        super(argument21, "BROWSER_API_ERROR", value66), this.name = "BrowserApiError";
      }
      static fileReaderNotAvailable() {
        return new BrowserApiError("Browser compatibility error: FileReader API is not available.\nYour browser does not support the FileReader API required for file parsing.\n\nSolutions:\n  1. Use a modern browser that supports FileReader (Chrome 13+, Firefox 10+, Safari 6+)\n  2. Consider using csvStringToJson() or csvStringToJsonAsync() for string-based parsing\n  3. Implement a polyfill or alternative file reading method");
      }
      static parseFileError(argument22) {
        return new BrowserApiError("Browser file parsing error: Failed to read and parse the file.\nError details: " + argument22.message + ("\n\nSolutions:\n  1. Verify the file is a valid CSV file\n  2. Check the file encoding (UTF-8 is recommended)\n  3. Try a smaller file to isolate the issue\n  4. Check browser console for additional error details"), {
          'originalError': argument22.message
        });
      }
      static streamingNotSupported() {
        return new BrowserApiError("Browser compatibility error: ReadableStream API is not available.\nYour browser does not support the ReadableStream API required for streaming.\n\nSolutions:\n  1. Use a modern browser that supports ReadableStream (Chrome 43+, Firefox 65+, Safari 10.1+)\n  2. Use getJsonFromFileStreamingAsync() which falls back to regular file parsing\n  3. Consider using parseFile() for non-streaming file parsing\n  4. Implement a polyfill for ReadableStream support");
      }
    }; const exportedErrors = {
    }; exportedErrors.CsvParsingError = CsvParsingError, exportedErrors.InputValidationError = InputValidationError, exportedErrors.ConfigurationError = ConfigurationError, exportedErrors.CsvFormatError = CsvFormatError, exportedErrors.FileOperationError = FileOperationError, exportedErrors.JsonValidationError = JsonValidationError, exportedErrors.BrowserApiError = BrowserApiError, exports.exports = exportedErrors;
  }
}), require_fileUtils = __commonJS({
  '../work/iuccio__csvToJson/src/util/fileUtils.js'(module, exports) {
    'use strict'; var result1 = ((require)(('fs'))), {
      FileOperationError: FileOperationError
    }
    = ((require_errors)()); var instance2 = new Set(["base64", "hex"]), FileUtils = class {
      _isEncodedFile(encoding) {
        return instance2.has(encoding);
      }
      _decodeContent(content, encoding) {
        if (this._isEncodedFile(encoding)) {
          return Buffer.from(content, encoding).toString("utf8");
        }
        return content;
      }
      _toString(content) {
        return((typeof content) === ("string")) ? content: content.toString();
      }
      _wrapReadError(filePath, error) {
        return new FileOperationError("read", filePath, error);
      }
      _wrapWriteError(filePath, error) {
        return new FileOperationError("write", filePath, error);
      }
      _readFileSync(filePath, encoding) {
        if (this._isEncodedFile(encoding)) {
          {
            const result2 = result1.readFileSync(filePath, "utf8"); return this._decodeContent(result2, encoding);
          }
        }
        return this._toString(result1.readFileSync(filePath, encoding));
      }
      readFile(filePath, value68 = "utf8") {
        try {
          return this._readFileSync(filePath, value68);
        }catch (error36) {
          throw this._wrapReadError(filePath, error36);
        }
      }
      _readFileAsyncWithPromises(filePath, encoding) {
        {
          if (this._isEncodedFile(encoding)) return result1.promises.readFile(filePath, "utf8").then(argument39 => this._decodeContent(argument39, encoding)); return result1.promises.readFile(filePath, encoding).then(argument40 => this._toString(argument40));
        }
      }
      readFileAsync(filePath, value69 = "utf8") {
        if (result1.promises && ((typeof result1.promises.readFile) === ("function"))) {
          return this._readFileAsyncWithPromises(filePath, value69).catch (argument42 => {
            throw this._wrapReadError(filePath, argument42);
          });
        }
        return new Promise((argument43, argument44) => {
          {
            const callback1 = (argument45, argument46) => {
              {
                if (argument45) {
                  (((argument44))(((this._wrapReadError(filePath, argument45))))); return;
                }
                try {
                  {
                    const value6 = this._isEncodedFile(value69) ? this._decodeContent(this._toString(argument46), value69): this._toString(argument46); (((argument43))(((value6))));
                  }
                }catch (error47) {
                  (((argument44))(((this._wrapReadError(filePath, error47)))));
                }
              }
            }, value7 = this._isEncodedFile(value69) ? "utf8": value69; result1.readFile(filePath, value7, callback1);
          }
        });
      }
      _writeFileSync(content, filePath) {
        result1.writeFileSync(content, filePath, "utf8");
      }
      _writeFileAsyncWithPromises(content, filePath) {
        return result1.promises.writeFile(content, filePath, "utf8");
      }
      writeFile(content, filePath) {
        try {
          this._writeFileSync(filePath, content);
        }catch (error54) {
          throw this._wrapWriteError(filePath, error54);
        }
      }
      writeFileAsync(content, filePath) {
        if (result1.promises && ((typeof result1.promises.writeFile) === ("function"))) return this._writeFileAsyncWithPromises(filePath, content).catch (argument57 => {
          throw this._wrapWriteError(filePath, argument57);
        }); return new Promise((argument58, argument59) => {
          result1.writeFile(filePath, content, "utf8", argument60 => {
            if (argument60) {
              (((argument59))(((this._wrapWriteError(filePath, argument60))))); return;
            }
            (((argument58))());
          });
        });
      }
    }; exports.exports = new FileUtils();
  }
}), require_stringUtils = __commonJS({
  '../work/iuccio__csvToJson/src/util/stringUtils.js'(module, exports) {
    'use strict'; const options11 = {
    }; options11.INTEGER = /^-?\d+$/, options11.FLOAT = /^-?\d*\.\d+$/, options11.WHITESPACE = /\s/g; const options12 = {
    }; options12.TRUE = "true", options12.FALSE = "false"; var StringUtils = class StringUtils {
      static["PATTERNS"] = options11; static["BOOLEAN_VALUES"] = options12; trimPropertyName(propertyName, shouldTrim) {
        {
          if (!shouldTrim) return ''; return propertyName ? shouldTrim.replace(StringUtils.PATTERNS.WHITESPACE, ''): shouldTrim.trim();
        }
      }
      getValueFormatByType(value) {
        if (this.isEmpty(value)) {
          return((String)());
        }
        if (this.isBoolean(value)) return this.convertToBoolean(value); if (this.isInteger(value)) {
          return this.convertInteger(value);
        }
        if (this.isFloat(value)) return this.convertFloat(value); return((String)((value)));
      }
      hasContent(value70 = []) {
        return Array.isArray(value70) && value70.some(argument66 => Boolean(argument66));
      }
      isEmpty(value) {
        return((value) === (void(0))) || ((value) === (''));
      }
      isBoolean(value) {
        const result3 = value.toLowerCase(); return((result3) === (StringUtils.BOOLEAN_VALUES.TRUE)) || ((result3) === (StringUtils.BOOLEAN_VALUES.FALSE));
      }
      isInteger(value) {
        return StringUtils.PATTERNS.INTEGER.test(value);
      }
      isFloat(value) {
        return StringUtils.PATTERNS.FLOAT.test(value);
      }
      hasLeadingZero(value) {
        const value10 = ((value.length) > (1)) && ((value[0]) === ('0')), value11 = ((value.length) > (2)) && ((value[0]) === ('-')) && ((value[1]) === ('0')); return((value10) || (value11));
      }
      convertToBoolean(value) {
        return JSON.parse(value.toLowerCase());
      }
      convertInteger(value) {
        {
          if (this.hasLeadingZero(value)) {
            return((String)((value)));
          }
          const result4 = ((Number)((value))); return Number.isSafeInteger(result4) ? result4: ((String)((value)));
        }
      }
      convertFloat(value) {
        const result5 = ((Number)((value))); return Number.isFinite(result5) ? result5: ((String)((value)));
      }
    }; exports.exports = new StringUtils();
  }
}), require_jsonUtils = __commonJS({
  '../work/iuccio__csvToJson/src/util/jsonUtils.js'(module, exports) {
    'use strict'; var {
      JsonValidationError: JsonValidationError
    }
    = ((require_errors)()), JsonUtils = class {
      validateJson(jsonText) {
        try {
          JSON.parse(jsonText);
        }catch (error78) {
          throw new JsonValidationError(jsonText, error78);
        }
      }
    }; exports.exports = new JsonUtils();
  }
}), require_parserConfig = __commonJS({
  '../work/iuccio__csvToJson/src/core/parserConfig.js'(module, exports) {
    'use strict'; var ParserConfig = class {
      constructor(value73 = {
      }) {
        {
          this.delimiter = value73.delimiter; this.encoding = value73.encoding; this.isSupportQuotedField = value73.isSupportQuotedField; this.isTrimHeaderFieldWhiteSpace = value73.isTrimHeaderFieldWhiteSpace; this.indexHeaderValue = value73.indexHeaderValue; this.parseSubArrayDelimiter = value73.parseSubArrayDelimiter; this.parseSubArraySeparator = value73.parseSubArraySeparator; this.printValueFormatByType = value73.printValueFormatByType; this.rowMapper = value73.rowMapper; this.indexesToIgnore = value73.indexesToIgnore ? Object.freeze([...value73.indexesToIgnore]): Object.freeze([]); Object.freeze(this);
        }
      }
    }; exports.exports = ParserConfig;
  }
}), require_configurable = __commonJS({
  '../work/iuccio__csvToJson/src/core/configurable.js'(module, exports) {
    'use strict'; var {
      ConfigurationError: ConfigurationError
    }
    = ((require_errors)()); var ParserConfig = ((require_parserConfig)()); var Configurable = class {
      constructor(value75 = {
      }) {
        const options15 = {
          ...value75
        }; this.config = options15;
      }
      formatValueByType(value76 = !![]) {
        return this.config.printValueFormatByType = value76, this;
      }
      supportQuotedField(value77 = ![]) {
        this.config.isSupportQuotedField = value77; return this;
      }
      fieldDelimiter(delimiter) {
        return this.config.delimiter = delimiter, this;
      }
      trimHeaderFieldWhiteSpace(value78 = ![]) {
        return this.config.isTrimHeaderFieldWhiteSpace = value78, this;
      }
      indexHeader(headerIndex) {
        if (((isNaN)((headerIndex)))) {
          throw ConfigurationError.invalidHeaderIndex(headerIndex);
        }
        this.config.indexHeaderValue = headerIndex; return this;
      }
      parseSubArray(value79 = '*', value80 = ',') {
        return this.config.parseSubArrayDelimiter = value79, this.config.parseSubArraySeparator = value80, this;
      }
      mapRows(mapper) {
        if (((typeof mapper) !== ("function"))) {
          throw new TypeError("mapperFn must be a function");
        }
        this.config.rowMapper = mapper; return this;
      }
      ignoreColumnIndexes(indexes) {
        return this.config.indexesToIgnore = Array.isArray(indexes) ? [...indexes]: [...indexes], this;
      }
      encoding(encoding) {
        this.config.encoding = encoding; return this;
      }
      getParserConfig() {
        return new ParserConfig(this.config);
      }
    }; exports.exports = Configurable;
  }
}), require_csvToJson = __commonJS({
  '../work/iuccio__csvToJson/src/csvToJson.js'(module, exports) {
    'use strict'; var fileUtils = ((require_fileUtils)()), stringUtils = ((require_stringUtils)()), jsonUtils = ((require_jsonUtils)()), {
      ConfigurationError: ConfigurationError, CsvFormatError: CsvFormatError, JsonValidationError: JsonValidationError
    }
    = ((require_errors)()), Configurable = ((require_configurable)()), ParserConfig = ((require_parserConfig)()), value14 = ','; var value15 = '\x22', value16 = '\x0d\x0a', value17 = '\x0a', value18 = '\x0d', CsvToJson = class extends Configurable {
      csvToJsonWithConfig(csvText, config) {
        {
          this.validateInputConfig(config); const result12 = this.parseRecords(csvText), result13 = this.getFieldDelimiter(config); let result14 = this.getIndexHeader(config), value19; while (((result14) < (result12.length))) {
            {
              value19 = this.getFields(result12[result14], config, result13); if (stringUtils.hasContent(value19)) {
                break;
              }
              result14++;
            }
          }
          if (!value19) {
            throw CsvFormatError.missingHeader();
          }
          const items1 = []; for (let value20 = ((result14) + (1)); ((value20) < (result12.length)); value20++) {
            const result15 = this.getFields(result12[value20], config, result13); if (stringUtils.hasContent(result15)) {
              {
                let result16 = this.buildJsonResult(value19, result15, config); if (config.rowMapper) {
                  {
                    result16 = config.rowMapper(result16, ((value20) - (((result14) + (1))))); if (((result16) != (null))) {
                      items1.push(result16);
                    }
                  }
                }else {
                  items1.push(result16);
                }
              }
            }
          }
          return items1;
        }
      }
      generateJsonFileFromCsv(input, outputPath) {
        {
          let result17 = this.getJsonFromCsvStringified(input); fileUtils.writeFile(result17, outputPath);
        }
      }
      getJsonFromCsvStringified(filePath) {
        {
          let result18 = this.getJsonFromCsv(filePath), result19 = JSON.stringify(result18, void(0), 1); return jsonUtils.validateJson(result19), result19;
        }
      }
      getJsonFromCsv(filePath) {
        const result20 = this.getParserConfig(); const result21 = fileUtils.readFile(filePath, result20.encoding || "utf8"); return this.csvToJson(result21);
      }
      csvStringToJson(csvText) {
        return this.csvToJson(csvText);
      }
      csvStringToJsonStringified(csvText) {
        {
          let result22 = this.csvStringToJson(csvText), result23 = JSON.stringify(result22, void(0), 1); return jsonUtils.validateJson(result23), result23;
        }
      }
      csvToJson(csvText) {
        return this.csvToJsonWithConfig(csvText, this.getParserConfig());
      }
      parseRecords(csvText) {
        {
          let items2 = [], value21 = '', value22 = ![], index1 = 0; while (((index1) < (csvText.length))) {
            {
              let value23 = csvText[index1]; if (((value23) === (value15))) {
                if (value22 && ((((index1) + (1))) < (csvText.length)) && ((csvText[((index1) + (1))]) === (value15))) {
                  value21 += ((value15) + (value15)), index1 += 2;
                }else {
                  value22 = !value22, value21 += value23, index1++;
                }
                continue;
              }
              if (!value22) {
                {
                  let result24 = this.getLineEndingLength(csvText, index1); if (((result24) > (0))) {
                    items2.push(value21), value21 = '', index1 += result24; continue;
                  }
                }
              }
              value21 += value23, index1++;
            }
          }
          if (((value21.length) > (0))) {
            items2.push(value21);
          }
          if (value22) {
            throw CsvFormatError.mismatchedQuotes("CSV");
          }
          return items2;
        }
      }
      getLineEndingLength(argument100, argument101) {
        {
          if (((argument100.slice(argument101, ((argument101) + (2)))) === (value16))) return 2; if (((argument100[argument101]) === (value17))) {
            return 1;
          }
          if (((argument100[argument101]) === (value18)) && ((argument100[((argument101) + (1))]) !== (value17))) {
            return 1;
          }
          return 0;
        }
      }
      getFieldDelimiter(value136 = this.config) {
        {
          if (value136.delimiter) return value136.delimiter; return value14;
        }
      }
      getIndexHeader(value137 = this.config) {
        if (((value137.indexHeaderValue) !== (null)) && !((isNaN)((value137.indexHeaderValue)))) {
          return value137.indexHeaderValue;
        }
        return 0;
      }
      getFields(record, value138 = this.config, value139 = this.getFieldDelimiter(value138)) {
        if (value138.isSupportQuotedField) {
          return this.split(record, value138);
        }
        return record.split(value139);
      }
      buildJsonResult(headers, fields, value140 = this.config) {
        {
          let options19 = {
          }; const value24 = value140.indexesToIgnore ? new Set(value140.indexesToIgnore): new Set(); for (let index2 = 0; ((index2) < (headers.length)); index2++) {
            if (value24.has(index2)) continue; let result25 = stringUtils.trimPropertyName(value140.isTrimHeaderFieldWhiteSpace, headers[index2]), value25 = fields[index2]; if (this.isParseSubArray(value25, value140)) {
              value25 = this.buildJsonSubArray(value25, value140);
            }
            if (value140.printValueFormatByType && !Array.isArray(value25)) {
              value25 = stringUtils.getValueFormatByType(fields[index2]);
            }
            options19[result25] = value25;
          }
          return options19;
        }
      }
      buildJsonSubArray(argument105, value141 = this.config) {
        {
          let result26 = argument105.substring(((argument105.indexOf(value141.parseSubArrayDelimiter)) + (1)), argument105.lastIndexOf(value141.parseSubArrayDelimiter)); result26.trim(), argument105 = result26.split(value141.parseSubArraySeparator); if (value141.printValueFormatByType) for (let index3 = 0; ((index3) < (argument105.length)); index3++) {
            argument105[index3] = stringUtils.getValueFormatByType(argument105[index3]);
          }
          return argument105;
        }
      }
      isParseSubArray(argument106, value142 = this.config) {
        {
          if (value142.parseSubArrayDelimiter) {
            {
              if (argument106 && (((argument106.indexOf(value142.parseSubArrayDelimiter)) === (0)) && ((argument106.lastIndexOf(value142.parseSubArrayDelimiter)) === (((argument106.length) - (1)))))) return!![];
            }
          }
          return![];
        }
      }
      validateInputConfig(value143 = this.config) {
        if (value143.isSupportQuotedField) {
          if (((this.getFieldDelimiter(value143)) === ('\x22'))) {
            throw ConfigurationError.quotedFieldConflict("fieldDelimiter", '\x22');
          }
          if (((value143.parseSubArraySeparator) === ('\x22'))) throw ConfigurationError.quotedFieldConflict("parseSubArraySeparator", '\x22'); if (((value143.parseSubArrayDelimiter) === ('\x22'))) {
            throw ConfigurationError.quotedFieldConflict("parseSubArrayDelimiter", '\x22');
          }
        }
      }
      hasQuotes(argument107) {
        return argument107.includes('\x22');
      }
      split(argument108, value144 = this.config) {
        if (((argument108.length) === (0))) {
          return[];
        }
        let items3 = [], value27 = ''; let value28 = ![], result27 = this.getFieldDelimiter(value144); for (let index4 = 0; ((index4) < (argument108.length)); index4++) {
          let value29 = argument108[index4]; if (((value29) === (value15))) {
            {
              if (this.isEscapedQuote(argument108, index4, value28)) {
                value27 += value15, index4++;
              }else {
                if (this.isEmptyQuotedField(argument108, index4, value28, value27, result27)) {
                  index4++;
                }else value28 = !value28;
              }
            }
          }else {
            if (((value29) === (result27)) && !value28) {
              items3.push(value27), value27 = '';
            }else value27 += value29;
          }
        }
        items3.push(value27); if (value28) {
          throw CsvFormatError.mismatchedQuotes("row");
        }
        return items3;
      }
      isEscapedQuote(argument109, argument110, argument111) {
        return argument111 && ((((argument110) + (1))) < (argument109.length)) && ((argument109[((argument110) + (1))]) === (value15));
      }
      isEmptyQuotedField(argument112, argument113, argument114, argument115, argument116) {
        if (argument114 || ((argument115) !== ('')) || ((((argument113) + (1))) >= (argument112.length))) {
          return![];
        }
        let value31 = argument112[((argument113) + (1))]; if (((value31) !== (value15))) {
          return![];
        }
        let value32 = ((argument113) + (2)); return((value32) === (argument112.length)) || ((argument112[value32]) === (argument116));
      }
    }; exports.exports = new CsvToJson(); exports.exports.CsvToJson = CsvToJson;
  }
}), require_streamProcessor = __commonJS({
  '../work/iuccio__csvToJson/src/core/streamProcessor.js'(module, exports) {
    'use strict'; var stringUtils = ((require_stringUtils)()); var value33 = '\x22', value34 = '\x0d\x0a', value35 = '\x0a', value36 = '\x0d', StreamProcessor = class {
      constructor(argument119, value145 = {
      }) {
        {
          this.csvConfig = argument119; this.isBrowser = value145.isBrowser || ((typeof window) !== ("undefined")) && ((typeof document) !== ("undefined")); this.buffer = ''; this.isInsideQuotes = ![]; this.headers = null; this.headerRowIndex = ((argument119.indexHeaderValue) !== (null)) && !((isNaN)((argument119.indexHeaderValue))) ? argument119.indexHeaderValue: 0; this.currentRecordIndex = 0; this.parsedRecords = []; this.dataRowIndex = 0; this.ignoredIndexes = new Set(argument119.indexesToIgnore || []); this.chunkSize = value145.chunkSize || 1000; this.onChunk = value145.onChunk; this.onComplete = value145.onComplete; this.onError = value145.onError; this.allRecords = [];
        }
      }
      processChunk(chunk) {
        {
          let value37; if (((typeof chunk) === ("string"))) value37 = chunk; else {
            if (this.isBrowser && ((typeof globalThis.TextDecoder) !== ("undefined"))) {
              value37 = new globalThis.TextDecoder().decode(chunk);
            }else {
              if (this.isBrowser) {
                value37 = String.fromCharCode.apply(null, new Uint8Array(chunk));
              }else value37 = chunk.toString();
            }
          }
          this.buffer += value37, this._processCompleteRecords();
        }
      }
      async processStreamWithCallbacks(stream) {
        return new Promise((argument122, argument123) => {
          if (this.isBrowser) {
            if (!stream || ((typeof stream.getReader) !== ("function"))) {
              const instance4 = new Error("Invalid ReadableStream provided"); if (this.onError) this.onError(instance4); ((argument123)((instance4))); return;
            }
            const result29 = stream.getReader(), callback2 = async() => {
              try {
                while (true) {
                  {
                    const {
                      done: done, value: value
                    }
                    = await result29.read(); if (done) {
                      {
                        this.finalizeProcessing(); this._sendRemainingChunks(); if (this.onComplete) this.onComplete(this.allRecords); (((argument122))()); return;
                      }
                    }
                    this.processChunk(value), this._sendPendingChunks();
                  }
                }
              }catch (error124) {
                if (this.onError) this.onError(error124); (((argument123))(((error124))));
              }
            }; ((callback2)());
          }else {
            {
              if (!stream || ((typeof stream.pipe) !== ("function"))) {
                const instance5 = new Error("Invalid Readable stream provided"); if (this.onError) this.onError(instance5); ((argument123)((instance5))); return;
              }
              stream.on("data", argument125 => {
                try {
                  this.processChunk(argument125), this._sendPendingChunks();
                }catch (error126) {
                  {
                    if (this.onError) this.onError(error126); (((argument123))(((error126))));
                  }
                }
              }), stream.on("end", () => {
                try {
                  {
                    this.finalizeProcessing(), this._sendRemainingChunks(); if (this.onComplete) this.onComplete(this.allRecords); (((argument122))());
                  }
                }catch (error127) {
                  if (this.onError) this.onError(error127); (((argument123))(((error127))));
                }
              }), stream.on("error", argument128 => {
                {
                  if (this.onError) this.onError(argument128); (((argument123))(((argument128))));
                }
              });
            }
          }
        });
      }
      _sendPendingChunks() {
        if (!this.onChunk) return; while (((this.parsedRecords.length) >= (this.chunkSize))) {
          {
            const result30 = this.parsedRecords.splice(0, this.chunkSize); this.allRecords.push(...result30), this.onChunk(result30, this.allRecords.length, null);
          }
        }
      }
      _sendRemainingChunks() {
        if (!this.onChunk || ((this.parsedRecords.length) === (0))) return; const items4 = [...this.parsedRecords]; this.parsedRecords.length = 0, this.allRecords.push(...items4); this.onChunk(items4, this.allRecords.length, this.allRecords.length);
      }
      async processStream(stream) {
        return new Promise((argument130, argument131) => {
          if (this.isBrowser) {
            {
              if (!stream || ((typeof stream.getReader) !== ("function"))) {
                {
                  ((argument131)((new Error("Invalid ReadableStream provided")))); return;
                }
              }
              const result31 = stream.getReader(), callback3 = async() => {
                try {
                while (true) {
                    {
                      const {
                        done: done, value: value
                      }
                      = await result31.read(); if (done) {
                        {
                          this.finalizeProcessing(), (((argument130))(((this.getResult())))); return;
                        }
                      }
                      this.processChunk(value);
                    }
                  }
                }catch (error132) {
                  (((argument131))(((error132))));
                }
              }; ((callback3)());
            }
          }else {
            {
              if (!stream || ((typeof stream.pipe) !== ("function"))) {
                {
                  ((argument131)((new Error("Invalid Readable stream provided")))); return;
                }
              }
              stream.on("data", argument133 => {
                try {
                  this.processChunk(argument133);
                }catch (error134) {
                  (((argument131))(((error134))));
                }
              }), stream.on("end", () => {
                try {
                  this.finalizeProcessing(), (((argument130))(((this.getResult()))));
                }catch (error135) {
                  (((argument131))(((error135))));
                }
              }), stream.on("error", argument136 => {
                (((argument131))(((argument136))));
              });
            }
          }
        });
      }
      finalizeProcessing() {
        this._processRemainingBuffer(), this._validateProcessingResult();
      }
      getResult() {
        return this.parsedRecords;
      }
      _processCompleteRecords() {
        const result32 = this._parseRecordsFromBuffer(this.buffer, this.isInsideQuotes); this.buffer = result32.remainingBuffer, this.isInsideQuotes = result32.isInsideQuotes; for (const value38 of result32.completeRecords) {
          this._processRecord(value38), this.currentRecordIndex++;
        }
      }
      _processRemainingBuffer() {
        {
          if (((this.buffer.length) > (0))) {
            {
              if (this.isInsideQuotes) throw CsvFormatError.mismatchedQuotes("CSV stream"); const result33 = this._parseRecordsFromBuffer(((this.buffer) + ('\x0a')), ![]); for (const value39 of result33.completeRecords) {
                this._processRecord(value39), this.currentRecordIndex++;
              }
            }
          }
        }
      }
      _processRecord(record) {
        {
          if (((this.headers) === (null)) && ((this.currentRecordIndex) === (this.headerRowIndex))) {
            this._processHeaderRecord(record);
          }else((this.headers) !== (null)) && this._processDataRecord(record);
        }
      }
      _processHeaderRecord(argument138) {
        const result34 = this._splitRecord(argument138); stringUtils.hasContent(result34) && (this.headers = result34);
      }
      _processDataRecord(argument139) {
        const result35 = this._splitRecord(argument139); if (stringUtils.hasContent(result35)) {
          {
            const result36 = this._buildJsonResult(this.headers, result35), result37 = this._applyRowMapper(result36); if (((result37) !== (null))) {
              this.parsedRecords.push(result37);
            }
          }
        }
      }
      _applyRowMapper(argument140) {
        {
          if (this.csvConfig.rowMapper) {
            {
              const result38 = this.csvConfig.rowMapper(argument140, this.dataRowIndex); return this.dataRowIndex++, result38;
            }
          }
          return this.dataRowIndex++, argument140;
        }
      }
      _splitRecord(argument141) {
        if (this.csvConfig.isSupportQuotedField) return this._splitWithConfig(argument141, this.csvConfig); return argument141.split(this.csvConfig.delimiter || ',');
      }
      _splitWithConfig(argument142, argument143) {
        {
          if (((argument142.length) === (0))) {
            return[];
          }
          const items5 = []; let value40 = '', value41 = ![]; const value42 = argument143.delimiter || ','; for (let index5 = 0; ((index5) < (argument142.length)); index5++) {
            const value43 = argument142[index5]; if (((value43) === (value33))) {
              {
                if (value41 && ((((index5) + (1))) < (argument142.length)) && ((argument142[((index5) + (1))]) === (value33))) {
                  value40 += value33, index5++;
                }else {
                  value41 = !value41;
                }
              }
            }else((value43) === (value42)) && !value41 ? (items5.push(value40), value40 = ''): value40 += value43;
          }
          items5.push(value40); if (value41) {
            throw CsvFormatError.mismatchedQuotes("row");
          }
          return items5;
        }
      }
      _buildJsonResult(argument144, argument145) {
        const options23 = {
        }; for (let index6 = 0; ((index6) < (argument144.length)); index6++) {
          {
            if (this.ignoredIndexes.has(index6)) {
              continue;
            }
            const result39 = stringUtils.trimPropertyName(this.csvConfig.isTrimHeaderFieldWhiteSpace, argument144[index6]); let value44 = argument145[index6]; if (this._isParseSubArray(value44)) {
              value44 = this._buildJsonSubArray(value44);
            }
            this.csvConfig.printValueFormatByType && !Array.isArray(value44) && (value44 = stringUtils.getValueFormatByType(argument145[index6])), options23[result39] = value44;
          }
        }
        return options23;
      }
      _isParseSubArray(argument146) {
        {
          if (this.csvConfig.parseSubArrayDelimiter) {
            return argument146 && (((argument146.indexOf(this.csvConfig.parseSubArrayDelimiter)) === (0)) && ((argument146.lastIndexOf(this.csvConfig.parseSubArrayDelimiter)) === (((argument146.length) - (1)))));
          }
          return![];
        }
      }
      _buildJsonSubArray(argument147) {
        const result40 = argument147.substring(((argument147.indexOf(this.csvConfig.parseSubArrayDelimiter)) + (1)), argument147.lastIndexOf(this.csvConfig.parseSubArrayDelimiter)); const result41 = result40.split(this.csvConfig.parseSubArraySeparator); if (this.csvConfig.printValueFormatByType) {
          for (let index7 = 0; ((index7) < (result41.length)); index7++) {
            result41[index7] = stringUtils.getValueFormatByType(result41[index7]);
          }
        }
        return result41;
      }
      _parseRecordsFromBuffer(buffer, finalChunk) {
        const items6 = []; let value46 = '', index8 = 0; while (((index8) < (buffer.length))) {
          {
            const value47 = buffer[index8]; if (((value47) === (value33))) {
              {
                const result42 = this._handleEscapedQuote(buffer, index8, finalChunk); if (result42.wasEscaped) {
                  value46 += ((value33) + (value33)), index8 = result42.newIndex; continue;
                }else finalChunk = !finalChunk;
              }
            }else {
              if (!finalChunk && this._isLineEnding(buffer, index8)) {
                {
                  const result43 = this._getLineEndingLength(buffer, index8); items6.push(value46), value46 = '', index8 += result43; continue;
                }
              }
            }
            value46 += value47, index8++;
          }
        }
        const options25 = {
        }; return options25.completeRecords = items6, options25.remainingBuffer = value46, options25.isInsideQuotes = finalChunk, options25;
      }
      _handleEscapedQuote(argument150, argument151, argument152) {
        {
          if (argument152 && ((((argument151) + (1))) < (argument150.length)) && ((argument150[((argument151) + (1))]) === (value33))) {
            return {
              'wasEscaped': !![], 'newIndex': ((argument151) + (2))
            };
          }
          return {
            'wasEscaped': ![], 'newIndex': ((argument151) + (1))
          };
        }
      }
      _isLineEnding(buffer, index) {
        return((this._getLineEndingLength(buffer, index)) > (0));
      }
      _getLineEndingLength(buffer, index) {
        if (((buffer.slice(index, ((index) + (2)))) === (value34))) return 2; if (((buffer[index]) === (value35))) return 1; if (((buffer[index]) === (value36)) && ((buffer[((index) + (1))]) !== (value35))) {
          return 1;
        }
        return 0;
      }
      _validateProcessingResult() {
        {
          if (!this.headers && ((this.parsedRecords.length) === (0))) {
            return;
          }
          if (!this.headers) {
            throw CsvFormatError.missingHeader();
          }
        }
      }
    }; exports.exports = StreamProcessor;
  }
}), fileUtils = require_fileUtils(), csvToJson = require_csvToJson(), Configurable = require_configurable();
var {
  InputValidationError
}
= require_errors(), StreamProcessor = require_streamProcessor();
const options26 = {
};
options26.raw = !![];
var CsvToJsonAsync = class extends Configurable {
  constructor() {
    super(), this.csvToJson = csvToJson;
  }
  async generateJsonFileFromCsv(input, outputPath) {
    const result44 = await this.getJsonFromCsvStringified(input);
    await fileUtils.writeFileAsync(result44, outputPath);
  }
  async getJsonFromCsvStringified(filePath) {
    const result45 = await this.getJsonFromCsvAsync(filePath);
    return JSON.stringify(result45, void(0), 1);
  }
  async getJsonFromCsvAsync(inputFileNameOrCsv, value159 = {
  }) {
    if (((inputFileNameOrCsv) === (null)) || ((inputFileNameOrCsv) === (void(0)))) {
      throw new InputValidationError("inputFileNameOrCsv", "string (file path) or CSV string content", '' + typeof inputFileNameOrCsv, "Either provide a valid file path or CSV content as a string.");
    }
    const result46 = this.getParserConfig();
    if (value159.raw) {
      if (((inputFileNameOrCsv) === (''))) {
        return[];
      }
      return this.csvToJson.csvToJsonWithConfig(inputFileNameOrCsv, result46);
    }
    const result47 = await fileUtils.readFileAsync(inputFileNameOrCsv, result46.encoding || "utf8");
    return this.csvToJson.csvToJsonWithConfig(result47, result46);
  }
  csvStringToJsonAsync(csvText, value217 = options26) {
    return this.getJsonFromCsvAsync(csvText, value217);
  }
  async getJsonFromStreamAsync(stream) {
    this._validateStream(stream);
    const result48 = this.getParserConfig(), options33 = {
    };
    options33.isBrowser = ![];
    const instance6 = new StreamProcessor(result48, options33);
    return instance6.processStream(stream);
  }
  _validateStream(stream) {
    if (!stream || ((typeof stream.pipe) !== ("function"))) {
      throw new InputValidationError("stream", "Readable stream", typeof stream, "Provide a valid Node.js Readable stream.");
    }
  }
  async getJsonFromFileStreamingAsync(filePath) {
    if (!filePath || ((typeof filePath) !== ("string"))) throw new InputValidationError("filePath", "string (file path)", typeof filePath, "Provide a valid file path as a string.");
    const result49 = ((require)(('fs')));
    const result50 = this.getParserConfig(), value50 = ((typeof result50.encoding) === ("string")) ? result50.encoding: "utf8", options37 = {
    };
    options37.encoding = value50;
    const result51 = result49.createReadStream(filePath, options37);
    return this.getJsonFromStreamAsync(result51);
  }
};
module.exports = new CsvToJsonAsync();
