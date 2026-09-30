'use strict';

var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (_0x37327b, _0x59ebb3) => function _0x1885c7() {
  if (!_0x59ebb3) {
    (0, _0x37327b[__getOwnPropNames(_0x37327b)[0]])((_0x59ebb3 = {
      exports: {}
    }).exports, _0x59ebb3);
  }
  return _0x59ebb3.exports;
};
var require_errors = __commonJS({
  "../work/iuccio__csvToJson/src/core/errors.js"(_0x2bb990, _0x6d3b76) {
    'use strict';

    var _0x46cbe1 = class extends Error {
      constructor(_0x5a2a95, _0xcaadae, _0x170032 = {}) {
        super(_0x5a2a95);
        this.name = "CsvParsingError";
        this.code = _0xcaadae;
        this.context = _0x170032;
        Error.captureStackTrace(this, this.constructor);
      }
      toString() {
        let _0x3e6bc8 = this.name + ": " + this.message;
        if (this.context && Object.keys(this.context).length > 0) {
          _0x3e6bc8 += "\n\nContext:";
          Object.entries(this.context).forEach(([_0x299508, _0xf2543c]) => {
            _0x3e6bc8 += "\n  " + _0x299508 + ": " + this.formatValue(_0xf2543c);
          });
        }
        return _0x3e6bc8;
      }
      formatValue(_0x506667) {
        if (_0x506667 === null) {
          return "null";
        }
        if (_0x506667 === undefined) {
          return "undefined";
        }
        if (typeof _0x506667 === "string") {
          return "\"" + _0x506667 + "\"";
        }
        if (typeof _0x506667 === "object") {
          return JSON.stringify(_0x506667);
        }
        return String(_0x506667);
      }
    };
    var _0xe92962 = class extends _0x46cbe1 {
      constructor(_0x5468a0, _0x4fb6a0, _0x553515, _0x2dd44d = "") {
        const _0x3df969 = "Invalid input: Parameter '" + _0x5468a0 + "' is required.\nExpected: " + _0x4fb6a0 + "\nReceived: " + _0x553515 + (_0x2dd44d ? "\n" + _0x2dd44d : "");
        const _0x3e81bd = {
          parameter: _0x5468a0,
          expectedType: _0x4fb6a0,
          receivedType: _0x553515
        };
        super(_0x3df969, "INPUT_VALIDATION_ERROR", _0x3e81bd);
        this.name = "InputValidationError";
      }
    };
    var _0x596d3b = class _0x40e69d extends _0x46cbe1 {
      constructor(_0x136905, _0x13416f = {}) {
        super(_0x136905, "CONFIGURATION_ERROR", _0x13416f);
        this.name = "ConfigurationError";
      }
      static quotedFieldConflict(_0x566868, _0x4e128b) {
        return new _0x40e69d("Configuration conflict: supportQuotedField() is enabled, but " + _0x566868 + " is set to '" + _0x4e128b + "'.\nThe quote character (\") cannot be used as a field delimiter, separator, or sub-array delimiter when quoted field support is active.\n\nSolutions:\n  1. Use a different character for " + _0x566868 + " (e.g., '|', '\\t', ';')\n  2. Disable supportQuotedField() if your CSV doesn't contain quoted fields\n  3. Refer to RFC 4180 for proper CSV formatting: https://tools.ietf.org/html/rfc4180", {
          optionName: _0x566868,
          value: _0x4e128b,
          conflictingOption: "supportQuotedField"
        });
      }
      static invalidHeaderIndex(_0x1110bc) {
        return new _0x40e69d("Invalid configuration: indexHeader() expects a numeric value.\nReceived: " + typeof _0x1110bc + " (" + _0x1110bc + ")\n\nSolutions:\n  1. Ensure indexHeader() receives a number: indexHeader(0), indexHeader(1), etc.\n  2. Headers are typically found on row 0 (first line)\n  3. Use indexHeader(2) if headers are on the 3rd line", {
          parameterName: "indexHeader",
          value: _0x1110bc,
          type: typeof _0x1110bc
        });
      }
    };
    var _0xb57214 = class _0x5dbc58 extends _0x46cbe1 {
      constructor(_0x4ecb2b, _0x27f9eb = {}) {
        super(_0x4ecb2b, "CSV_FORMAT_ERROR", _0x27f9eb);
        this.name = "CsvFormatError";
      }
      static missingHeader() {
        return new _0x5dbc58("CSV parsing error: No header row found.\nThe CSV file appears to be empty or has no valid header line.\n\nSolutions:\n  1. Ensure your CSV file contains at least one row (header row)\n  2. Verify the file is not empty or contains only whitespace\n  3. Check if you need to use indexHeader(n) to specify a non-standard header row\n  4. Refer to RFC 4180 for proper CSV format: https://tools.ietf.org/html/rfc4180");
      }
      static mismatchedQuotes(_0x52ec15 = "CSV") {
        return new _0x5dbc58("CSV parsing error: Mismatched quotes detected in " + _0x52ec15 + ".\nA quoted field was not properly closed with a matching quote character.\n\nRFC 4180 rules for quoted fields:\n  • Fields containing delimiters or quotes MUST be enclosed in double quotes\n  • To include a quote within a quoted field, use two consecutive quotes: \"\"\n  • Example: \"Smith, John\" (name contains comma)\n  • Example: \"He said \"\"Hello\"\"\" (text contains quotes)\n\nSolutions:\n  1. Review your CSV for properly paired quote characters\n  2. Use double quotes (\"\") to escape quotes within quoted fields\n  3. Ensure all commas within field values are inside quotes\n  4. Enable supportQuotedField(true) if you're using quoted fields", {
          location: _0x52ec15
        });
      }
    };
    var _0x71e95 = class extends _0x46cbe1 {
      constructor(_0xa55a41, _0x8d7273, _0x73a5f7) {
        const _0x150098 = "File operation error: Failed to " + _0xa55a41 + " file.\nFile path: " + _0x8d7273 + "\nReason: " + _0x73a5f7.message + "\n\nSolutions:\n  1. Verify the file path is correct: " + _0x8d7273 + "\n  2. Check file permissions (read access for input, write access for output)\n  3. Ensure the directory exists and is writable for output files\n  4. Verify the file is not in use by another process";
        const _0xf0af4d = {
          operation: _0xa55a41,
          filePath: _0x8d7273,
          originalError: _0x73a5f7.message
        };
        super(_0x150098, "FILE_OPERATION_ERROR", _0xf0af4d);
        this.name = "FileOperationError";
        this.originalError = _0x73a5f7;
      }
    };
    var _0x30922c = class extends _0x46cbe1 {
      constructor(_0x5092e1, _0x34848f) {
        const _0x282a71 = "JSON validation error: The parsed CSV data generated invalid JSON.\nThis typically indicates malformed field names or values in the CSV.\nOriginal error: " + _0x34848f.message + "\n\nSolutions:\n  1. Check that field names are valid JavaScript identifiers (or will be converted safely)\n  2. Review the CSV data for special characters that aren't properly escaped\n  3. Enable supportQuotedField(true) for fields containing special characters\n  4. Verify that formatValueByType() isn't converting values incorrectly";
        super(_0x282a71, "JSON_VALIDATION_ERROR", {
          originalError: _0x34848f.message,
          csvPreview: _0x5092e1 ? _0x5092e1.substring(0, 200) : "N/A"
        });
        this.name = "JsonValidationError";
        this.originalError = _0x34848f;
      }
    };
    var _0x1f06f8 = class _0x315305 extends _0x46cbe1 {
      constructor(_0xdcf384, _0x2c8759 = {}) {
        super(_0xdcf384, "BROWSER_API_ERROR", _0x2c8759);
        this.name = "BrowserApiError";
      }
      static fileReaderNotAvailable() {
        return new _0x315305("Browser compatibility error: FileReader API is not available.\nYour browser does not support the FileReader API required for file parsing.\n\nSolutions:\n  1. Use a modern browser that supports FileReader (Chrome 13+, Firefox 10+, Safari 6+)\n  2. Consider using csvStringToJson() or csvStringToJsonAsync() for string-based parsing\n  3. Implement a polyfill or alternative file reading method");
      }
      static parseFileError(_0x5dee46) {
        return new _0x315305("Browser file parsing error: Failed to read and parse the file.\nError details: " + _0x5dee46.message + "\n\nSolutions:\n  1. Verify the file is a valid CSV file\n  2. Check the file encoding (UTF-8 is recommended)\n  3. Try a smaller file to isolate the issue\n  4. Check browser console for additional error details", {
          originalError: _0x5dee46.message
        });
      }
      static streamingNotSupported() {
        return new _0x315305("Browser compatibility error: ReadableStream API is not available.\nYour browser does not support the ReadableStream API required for streaming.\n\nSolutions:\n  1. Use a modern browser that supports ReadableStream (Chrome 43+, Firefox 65+, Safari 10.1+)\n  2. Use getJsonFromFileStreamingAsync() which falls back to regular file parsing\n  3. Consider using parseFile() for non-streaming file parsing\n  4. Implement a polyfill for ReadableStream support");
      }
    };
    const _0x3ce04a = {
      CsvParsingError: _0x46cbe1,
      InputValidationError: _0xe92962,
      ConfigurationError: _0x596d3b,
      CsvFormatError: _0xb57214,
      FileOperationError: _0x71e95,
      JsonValidationError: _0x30922c,
      BrowserApiError: _0x1f06f8
    };
    _0x6d3b76.exports = _0x3ce04a;
  }
});
var require_fileUtils = __commonJS({
  "../work/iuccio__csvToJson/src/util/fileUtils.js"(_0xfc2889, _0x46ca10) {
    'use strict';

    var _0x8b7132 = require("fs");
    var {
      FileOperationError: _0x2424b4
    } = require_errors();
    var _0xb304af = new Set(["base64", "hex"]);
    var _0x41a0a3 = class {
      _isEncodedFile(_0x3c32de) {
        return _0xb304af.has(_0x3c32de);
      }
      _decodeContent(_0x59f786, _0x53701d) {
        if (this._isEncodedFile(_0x53701d)) {
          return Buffer.from(_0x59f786, _0x53701d).toString("utf8");
        }
        return _0x59f786;
      }
      _toString(_0x429e77) {
        if (typeof _0x429e77 === "string") {
          return _0x429e77;
        } else {
          return _0x429e77.toString();
        }
      }
      _wrapReadError(_0xad0274, _0x3ea76d) {
        return new _0x2424b4("read", _0xad0274, _0x3ea76d);
      }
      _wrapWriteError(_0x3c0bba, _0x232202) {
        return new _0x2424b4("write", _0x3c0bba, _0x232202);
      }
      _readFileSync(_0x1065da, _0xfbd699) {
        if (this._isEncodedFile(_0xfbd699)) {
          const _0x349da6 = _0x8b7132.readFileSync(_0x1065da, "utf8");
          return this._decodeContent(_0x349da6, _0xfbd699);
        }
        return this._toString(_0x8b7132.readFileSync(_0x1065da, _0xfbd699));
      }
      readFile(_0x51dc6d, _0x1fd1c6 = "utf8") {
        try {
          return this._readFileSync(_0x51dc6d, _0x1fd1c6);
        } catch (_0xbbe1b1) {
          throw this._wrapReadError(_0x51dc6d, _0xbbe1b1);
        }
      }
      _readFileAsyncWithPromises(_0x5b062a, _0x28b089) {
        if (this._isEncodedFile(_0x28b089)) {
          return _0x8b7132.promises.readFile(_0x5b062a, "utf8").then(_0x4b042f => this._decodeContent(_0x4b042f, _0x28b089));
        }
        return _0x8b7132.promises.readFile(_0x5b062a, _0x28b089).then(_0xdbefc => this._toString(_0xdbefc));
      }
      readFileAsync(_0xdb63bf, _0x2a8d62 = "utf8") {
        if (_0x8b7132.promises && typeof _0x8b7132.promises.readFile === "function") {
          return this._readFileAsyncWithPromises(_0xdb63bf, _0x2a8d62).catch(_0x23be96 => {
            throw this._wrapReadError(_0xdb63bf, _0x23be96);
          });
        }
        return new Promise((_0x43b1c5, _0x53a6fb) => {
          const _0x3092ef = (_0x5d2989, _0x31e69c) => {
            if (_0x5d2989) {
              _0x53a6fb(this._wrapReadError(_0xdb63bf, _0x5d2989));
              return;
            }
            try {
              const _0x434766 = this._isEncodedFile(_0x2a8d62) ? this._decodeContent(this._toString(_0x31e69c), _0x2a8d62) : this._toString(_0x31e69c);
              _0x43b1c5(_0x434766);
            } catch (_0x289697) {
              _0x53a6fb(this._wrapReadError(_0xdb63bf, _0x289697));
            }
          };
          const _0x3ef656 = this._isEncodedFile(_0x2a8d62) ? "utf8" : _0x2a8d62;
          _0x8b7132.readFile(_0xdb63bf, _0x3ef656, _0x3092ef);
        });
      }
      _writeFileSync(_0x36c53a, _0x1fbca0) {
        _0x8b7132.writeFileSync(_0x36c53a, _0x1fbca0, "utf8");
      }
      _writeFileAsyncWithPromises(_0x50e24c, _0x3d6efe) {
        return _0x8b7132.promises.writeFile(_0x50e24c, _0x3d6efe, "utf8");
      }
      writeFile(_0x1a8b52, _0xc9637f) {
        try {
          this._writeFileSync(_0xc9637f, _0x1a8b52);
        } catch (_0x202441) {
          throw this._wrapWriteError(_0xc9637f, _0x202441);
        }
      }
      writeFileAsync(_0x3cf20f, _0x1242f4) {
        if (_0x8b7132.promises && typeof _0x8b7132.promises.writeFile === "function") {
          return this._writeFileAsyncWithPromises(_0x1242f4, _0x3cf20f).catch(_0x49b49d => {
            throw this._wrapWriteError(_0x1242f4, _0x49b49d);
          });
        }
        return new Promise((_0x4e1337, _0x221adb) => {
          _0x8b7132.writeFile(_0x1242f4, _0x3cf20f, "utf8", _0x3c75dc => {
            if (_0x3c75dc) {
              _0x221adb(this._wrapWriteError(_0x1242f4, _0x3c75dc));
              return;
            }
            _0x4e1337();
          });
        });
      }
    };
    _0x46ca10.exports = new _0x41a0a3();
  }
});
var require_stringUtils = __commonJS({
  "../work/iuccio__csvToJson/src/util/stringUtils.js"(_0x3172aa, _0x13070a) {
    'use strict';

    const _0x295c62 = {
      INTEGER: /^-?\d+$/,
      FLOAT: /^-?\d*\.\d+$/,
      WHITESPACE: /\s/g
    };
    const _0x5f24ef = {
      TRUE: "true",
      FALSE: "false"
    };
    var _0x4870ec = class _0x3f7bcd {
      static PATTERNS = _0x295c62;
      static BOOLEAN_VALUES = _0x5f24ef;
      trimPropertyName(_0x173522, _0x1d7512) {
        if (!_0x1d7512) {
          return "";
        }
        if (_0x173522) {
          return _0x1d7512.replace(_0x3f7bcd.PATTERNS.WHITESPACE, "");
        } else {
          return _0x1d7512.trim();
        }
      }
      getValueFormatByType(_0x1e9d19) {
        if (this.isEmpty(_0x1e9d19)) {
          return String();
        }
        if (this.isBoolean(_0x1e9d19)) {
          return this.convertToBoolean(_0x1e9d19);
        }
        if (this.isInteger(_0x1e9d19)) {
          return this.convertInteger(_0x1e9d19);
        }
        if (this.isFloat(_0x1e9d19)) {
          return this.convertFloat(_0x1e9d19);
        }
        return String(_0x1e9d19);
      }
      hasContent(_0x57c856 = []) {
        return Array.isArray(_0x57c856) && _0x57c856.some(_0x31490f => Boolean(_0x31490f));
      }
      isEmpty(_0x4c2756) {
        return _0x4c2756 === undefined || _0x4c2756 === "";
      }
      isBoolean(_0x32895f) {
        const _0x52a230 = _0x32895f.toLowerCase();
        return _0x52a230 === _0x3f7bcd.BOOLEAN_VALUES.TRUE || _0x52a230 === _0x3f7bcd.BOOLEAN_VALUES.FALSE;
      }
      isInteger(_0x2baa0e) {
        return _0x3f7bcd.PATTERNS.INTEGER.test(_0x2baa0e);
      }
      isFloat(_0x43431d) {
        return _0x3f7bcd.PATTERNS.FLOAT.test(_0x43431d);
      }
      hasLeadingZero(_0x73622f) {
        const _0x51f83f = _0x73622f.length > 1 && _0x73622f[0] === "0";
        const _0x255b93 = _0x73622f.length > 2 && _0x73622f[0] === "-" && _0x73622f[1] === "0";
        return _0x51f83f || _0x255b93;
      }
      convertToBoolean(_0x22b38e) {
        return JSON.parse(_0x22b38e.toLowerCase());
      }
      convertInteger(_0x226d9a) {
        if (this.hasLeadingZero(_0x226d9a)) {
          return String(_0x226d9a);
        }
        const _0x4789ff = Number(_0x226d9a);
        if (Number.isSafeInteger(_0x4789ff)) {
          return _0x4789ff;
        } else {
          return String(_0x226d9a);
        }
      }
      convertFloat(_0x19b917) {
        const _0x28b118 = Number(_0x19b917);
        if (Number.isFinite(_0x28b118)) {
          return _0x28b118;
        } else {
          return String(_0x19b917);
        }
      }
    };
    _0x13070a.exports = new _0x4870ec();
  }
});
var require_jsonUtils = __commonJS({
  "../work/iuccio__csvToJson/src/util/jsonUtils.js"(_0xe16f1e, _0x3e658a) {
    'use strict';

    var {
      JsonValidationError: _0x57bfe0
    } = require_errors();
    var _0x10c709 = class {
      validateJson(_0x5e6d3d) {
        try {
          JSON.parse(_0x5e6d3d);
        } catch (_0x5c00f3) {
          throw new _0x57bfe0(_0x5e6d3d, _0x5c00f3);
        }
      }
    };
    _0x3e658a.exports = new _0x10c709();
  }
});
var require_parserConfig = __commonJS({
  "../work/iuccio__csvToJson/src/core/parserConfig.js"(_0x2bfb7e, _0x12f2f8) {
    'use strict';

    var _0x1423e = class {
      constructor(_0x485979 = {}) {
        this.delimiter = _0x485979.delimiter;
        this.encoding = _0x485979.encoding;
        this.isSupportQuotedField = _0x485979.isSupportQuotedField;
        this.isTrimHeaderFieldWhiteSpace = _0x485979.isTrimHeaderFieldWhiteSpace;
        this.indexHeaderValue = _0x485979.indexHeaderValue;
        this.parseSubArrayDelimiter = _0x485979.parseSubArrayDelimiter;
        this.parseSubArraySeparator = _0x485979.parseSubArraySeparator;
        this.printValueFormatByType = _0x485979.printValueFormatByType;
        this.rowMapper = _0x485979.rowMapper;
        this.indexesToIgnore = _0x485979.indexesToIgnore ? Object.freeze([..._0x485979.indexesToIgnore]) : Object.freeze([]);
        Object.freeze(this);
      }
    };
    _0x12f2f8.exports = _0x1423e;
  }
});
var require_configurable = __commonJS({
  "../work/iuccio__csvToJson/src/core/configurable.js"(_0xe2e3e9, _0x5f321a) {
    'use strict';

    var {
      ConfigurationError: _0x5d80d6
    } = require_errors();
    var _0x1d0b06 = require_parserConfig();
    var _0x441787 = class {
      constructor(_0x45f8a3 = {}) {
        const _0x165352 = {
          ..._0x45f8a3
        };
        this.config = _0x165352;
      }
      formatValueByType(_0x28c328 = true) {
        this.config.printValueFormatByType = _0x28c328;
        return this;
      }
      supportQuotedField(_0x26e1c6 = false) {
        this.config.isSupportQuotedField = _0x26e1c6;
        return this;
      }
      fieldDelimiter(_0x3d1486) {
        this.config.delimiter = _0x3d1486;
        return this;
      }
      trimHeaderFieldWhiteSpace(_0x19118a = false) {
        this.config.isTrimHeaderFieldWhiteSpace = _0x19118a;
        return this;
      }
      indexHeader(_0x3e2a56) {
        if (isNaN(_0x3e2a56)) {
          throw _0x5d80d6.invalidHeaderIndex(_0x3e2a56);
        }
        this.config.indexHeaderValue = _0x3e2a56;
        return this;
      }
      parseSubArray(_0x43166d = "*", _0x13b16b = ",") {
        this.config.parseSubArrayDelimiter = _0x43166d;
        this.config.parseSubArraySeparator = _0x13b16b;
        return this;
      }
      mapRows(_0x2eeda0) {
        if (typeof _0x2eeda0 !== "function") {
          throw new TypeError("mapperFn must be a function");
        }
        this.config.rowMapper = _0x2eeda0;
        return this;
      }
      ignoreColumnIndexes(_0xc3c60a) {
        this.config.indexesToIgnore = Array.isArray(_0xc3c60a) ? [..._0xc3c60a] : [..._0xc3c60a];
        return this;
      }
      encoding(_0x49ba4a) {
        this.config.encoding = _0x49ba4a;
        return this;
      }
      getParserConfig() {
        return new _0x1d0b06(this.config);
      }
    };
    _0x5f321a.exports = _0x441787;
  }
});
var require_csvToJson = __commonJS({
  "../work/iuccio__csvToJson/src/csvToJson.js"(_0xcb0bbb, _0x2d53d3) {
    'use strict';

    var _0x4fb6a2 = require_fileUtils();
    var _0x2b4888 = require_stringUtils();
    var _0x17067c = require_jsonUtils();
    var {
      ConfigurationError: _0x50139d,
      CsvFormatError: _0x5ad452,
      JsonValidationError: _0x106d16
    } = require_errors();
    var _0x39d4c7 = require_configurable();
    var _0x6669bd = require_parserConfig();
    var _0x2c18ec = ",";
    var _0xf89cb1 = "\"";
    var _0x31b261 = "\r\n";
    var _0x58ef9d = "\n";
    var _0x560fb0 = "\r";
    var _0x49e466 = class extends _0x39d4c7 {
      csvToJsonWithConfig(_0xe839e6, _0x26ce21) {
        this.validateInputConfig(_0x26ce21);
        const _0x25c661 = this.parseRecords(_0xe839e6);
        const _0x1ff1d5 = this.getFieldDelimiter(_0x26ce21);
        let _0x3612cb = this.getIndexHeader(_0x26ce21);
        let _0x24a336;
        while (_0x3612cb < _0x25c661.length) {
          _0x24a336 = this.getFields(_0x25c661[_0x3612cb], _0x26ce21, _0x1ff1d5);
          if (_0x2b4888.hasContent(_0x24a336)) {
            break;
          }
          _0x3612cb++;
        }
        if (!_0x24a336) {
          throw _0x5ad452.missingHeader();
        }
        const _0x5a1dbb = [];
        for (let _0xa46217 = _0x3612cb + 1; _0xa46217 < _0x25c661.length; _0xa46217++) {
          const _0x1fab05 = this.getFields(_0x25c661[_0xa46217], _0x26ce21, _0x1ff1d5);
          if (_0x2b4888.hasContent(_0x1fab05)) {
            let _0x1af1bf = this.buildJsonResult(_0x24a336, _0x1fab05, _0x26ce21);
            if (_0x26ce21.rowMapper) {
              _0x1af1bf = _0x26ce21.rowMapper(_0x1af1bf, _0xa46217 - (_0x3612cb + 1));
              if (_0x1af1bf != null) {
                _0x5a1dbb.push(_0x1af1bf);
              }
            } else {
              _0x5a1dbb.push(_0x1af1bf);
            }
          }
        }
        return _0x5a1dbb;
      }
      generateJsonFileFromCsv(_0x34d7aa, _0x19b93a) {
        let _0xf3b0bf = this.getJsonFromCsvStringified(_0x34d7aa);
        _0x4fb6a2.writeFile(_0xf3b0bf, _0x19b93a);
      }
      getJsonFromCsvStringified(_0x2abadb) {
        let _0x1bc58b = this.getJsonFromCsv(_0x2abadb);
        let _0x3af5a3 = JSON.stringify(_0x1bc58b, undefined, 1);
        _0x17067c.validateJson(_0x3af5a3);
        return _0x3af5a3;
      }
      getJsonFromCsv(_0x18ea93) {
        const _0x1c601a = this.getParserConfig();
        const _0x2f6cdc = _0x4fb6a2.readFile(_0x18ea93, _0x1c601a.encoding || "utf8");
        return this.csvToJson(_0x2f6cdc);
      }
      csvStringToJson(_0x23cc50) {
        return this.csvToJson(_0x23cc50);
      }
      csvStringToJsonStringified(_0x45f657) {
        let _0x403281 = this.csvStringToJson(_0x45f657);
        let _0x2651ee = JSON.stringify(_0x403281, undefined, 1);
        _0x17067c.validateJson(_0x2651ee);
        return _0x2651ee;
      }
      csvToJson(_0x4c152a) {
        return this.csvToJsonWithConfig(_0x4c152a, this.getParserConfig());
      }
      parseRecords(_0x601f9a) {
        let _0x263564 = [];
        let _0xb5576 = "";
        let _0x2effe6 = false;
        let _0x3c50c2 = 0;
        while (_0x3c50c2 < _0x601f9a.length) {
          let _0x33703a = _0x601f9a[_0x3c50c2];
          if (_0x33703a === _0xf89cb1) {
            if (_0x2effe6 && _0x3c50c2 + 1 < _0x601f9a.length && _0x601f9a[_0x3c50c2 + 1] === _0xf89cb1) {
              _0xb5576 += _0xf89cb1 + _0xf89cb1;
              _0x3c50c2 += 2;
            } else {
              _0x2effe6 = !_0x2effe6;
              _0xb5576 += _0x33703a;
              _0x3c50c2++;
            }
            continue;
          }
          if (!_0x2effe6) {
            let _0x359d7d = this.getLineEndingLength(_0x601f9a, _0x3c50c2);
            if (_0x359d7d > 0) {
              _0x263564.push(_0xb5576);
              _0xb5576 = "";
              _0x3c50c2 += _0x359d7d;
              continue;
            }
          }
          _0xb5576 += _0x33703a;
          _0x3c50c2++;
        }
        if (_0xb5576.length > 0) {
          _0x263564.push(_0xb5576);
        }
        if (_0x2effe6) {
          throw _0x5ad452.mismatchedQuotes("CSV");
        }
        return _0x263564;
      }
      getLineEndingLength(_0x2848c8, _0x1ba413) {
        if (_0x2848c8.slice(_0x1ba413, _0x1ba413 + 2) === _0x31b261) {
          return 2;
        }
        if (_0x2848c8[_0x1ba413] === _0x58ef9d) {
          return 1;
        }
        if (_0x2848c8[_0x1ba413] === _0x560fb0 && _0x2848c8[_0x1ba413 + 1] !== _0x58ef9d) {
          return 1;
        }
        return 0;
      }
      getFieldDelimiter(_0x76c81c = this.config) {
        if (_0x76c81c.delimiter) {
          return _0x76c81c.delimiter;
        }
        return _0x2c18ec;
      }
      getIndexHeader(_0x2f198d = this.config) {
        if (_0x2f198d.indexHeaderValue !== null && !isNaN(_0x2f198d.indexHeaderValue)) {
          return _0x2f198d.indexHeaderValue;
        }
        return 0;
      }
      getFields(_0x1eecbe, _0x4a0d8a = this.config, _0x3d75c2 = this.getFieldDelimiter(_0x4a0d8a)) {
        if (_0x4a0d8a.isSupportQuotedField) {
          return this.split(_0x1eecbe, _0x4a0d8a);
        }
        return _0x1eecbe.split(_0x3d75c2);
      }
      buildJsonResult(_0x78c1aa, _0x8d2d1c, _0x57b773 = this.config) {
        let _0x56ac1b = {};
        const _0x2e2daa = _0x57b773.indexesToIgnore ? new Set(_0x57b773.indexesToIgnore) : new Set();
        for (let _0x1f5717 = 0; _0x1f5717 < _0x78c1aa.length; _0x1f5717++) {
          if (_0x2e2daa.has(_0x1f5717)) {
            continue;
          }
          let _0x470b35 = _0x2b4888.trimPropertyName(_0x57b773.isTrimHeaderFieldWhiteSpace, _0x78c1aa[_0x1f5717]);
          let _0x368ac3 = _0x8d2d1c[_0x1f5717];
          if (this.isParseSubArray(_0x368ac3, _0x57b773)) {
            _0x368ac3 = this.buildJsonSubArray(_0x368ac3, _0x57b773);
          }
          if (_0x57b773.printValueFormatByType && !Array.isArray(_0x368ac3)) {
            _0x368ac3 = _0x2b4888.getValueFormatByType(_0x8d2d1c[_0x1f5717]);
          }
          _0x56ac1b[_0x470b35] = _0x368ac3;
        }
        return _0x56ac1b;
      }
      buildJsonSubArray(_0x392fd1, _0x57b9d6 = this.config) {
        let _0x3b157c = _0x392fd1.substring(_0x392fd1.indexOf(_0x57b9d6.parseSubArrayDelimiter) + 1, _0x392fd1.lastIndexOf(_0x57b9d6.parseSubArrayDelimiter));
        _0x3b157c.trim();
        _0x392fd1 = _0x3b157c.split(_0x57b9d6.parseSubArraySeparator);
        if (_0x57b9d6.printValueFormatByType) {
          for (let _0x5a539a = 0; _0x5a539a < _0x392fd1.length; _0x5a539a++) {
            _0x392fd1[_0x5a539a] = _0x2b4888.getValueFormatByType(_0x392fd1[_0x5a539a]);
          }
        }
        return _0x392fd1;
      }
      isParseSubArray(_0x10bf62, _0x25f243 = this.config) {
        if (_0x25f243.parseSubArrayDelimiter) {
          if (_0x10bf62 && _0x10bf62.indexOf(_0x25f243.parseSubArrayDelimiter) === 0 && _0x10bf62.lastIndexOf(_0x25f243.parseSubArrayDelimiter) === _0x10bf62.length - 1) {
            return true;
          }
        }
        return false;
      }
      validateInputConfig(_0x5d7648 = this.config) {
        if (_0x5d7648.isSupportQuotedField) {
          if (this.getFieldDelimiter(_0x5d7648) === "\"") {
            throw _0x50139d.quotedFieldConflict("fieldDelimiter", "\"");
          }
          if (_0x5d7648.parseSubArraySeparator === "\"") {
            throw _0x50139d.quotedFieldConflict("parseSubArraySeparator", "\"");
          }
          if (_0x5d7648.parseSubArrayDelimiter === "\"") {
            throw _0x50139d.quotedFieldConflict("parseSubArrayDelimiter", "\"");
          }
        }
      }
      hasQuotes(_0x1947e5) {
        return _0x1947e5.includes("\"");
      }
      split(_0x490128, _0x49bfe0 = this.config) {
        if (_0x490128.length === 0) {
          return [];
        }
        let _0x1c6cfd = [];
        let _0x2fad07 = "";
        let _0x46f09d = false;
        let _0x299d21 = this.getFieldDelimiter(_0x49bfe0);
        for (let _0x5bd8cf = 0; _0x5bd8cf < _0x490128.length; _0x5bd8cf++) {
          let _0x2b6bed = _0x490128[_0x5bd8cf];
          if (_0x2b6bed === _0xf89cb1) {
            if (this.isEscapedQuote(_0x490128, _0x5bd8cf, _0x46f09d)) {
              _0x2fad07 += _0xf89cb1;
              _0x5bd8cf++;
            } else if (this.isEmptyQuotedField(_0x490128, _0x5bd8cf, _0x46f09d, _0x2fad07, _0x299d21)) {
              _0x5bd8cf++;
            } else {
              _0x46f09d = !_0x46f09d;
            }
          } else if (_0x2b6bed === _0x299d21 && !_0x46f09d) {
            _0x1c6cfd.push(_0x2fad07);
            _0x2fad07 = "";
          } else {
            _0x2fad07 += _0x2b6bed;
          }
        }
        _0x1c6cfd.push(_0x2fad07);
        if (_0x46f09d) {
          throw _0x5ad452.mismatchedQuotes("row");
        }
        return _0x1c6cfd;
      }
      isEscapedQuote(_0x189edd, _0x1efba9, _0x140f83) {
        return _0x140f83 && _0x1efba9 + 1 < _0x189edd.length && _0x189edd[_0x1efba9 + 1] === _0xf89cb1;
      }
      isEmptyQuotedField(_0x373657, _0x3903e2, _0x3479f6, _0x6efaec, _0x59b07b) {
        if (_0x3479f6 || _0x6efaec !== "" || _0x3903e2 + 1 >= _0x373657.length) {
          return false;
        }
        let _0x5b369b = _0x373657[_0x3903e2 + 1];
        if (_0x5b369b !== _0xf89cb1) {
          return false;
        }
        let _0x32a0bb = _0x3903e2 + 2;
        return _0x32a0bb === _0x373657.length || _0x373657[_0x32a0bb] === _0x59b07b;
      }
    };
    _0x2d53d3.exports = new _0x49e466();
    _0x2d53d3.exports.CsvToJson = _0x49e466;
  }
});
var require_streamProcessor = __commonJS({
  "../work/iuccio__csvToJson/src/core/streamProcessor.js"(_0x348962, _0x43084e) {
    'use strict';

    var _0x26f6e5 = require_stringUtils();
    var _0x20a1c3 = "\"";
    var _0x58851c = "\r\n";
    var _0x5321dd = "\n";
    var _0x4d697e = "\r";
    var _0x3e9b7d = class {
      constructor(_0x494b3d, _0x263bc9 = {}) {
        this.csvConfig = _0x494b3d;
        this.isBrowser = _0x263bc9.isBrowser || typeof window !== "undefined" && typeof document !== "undefined";
        this.buffer = "";
        this.isInsideQuotes = false;
        this.headers = null;
        this.headerRowIndex = _0x494b3d.indexHeaderValue !== null && !isNaN(_0x494b3d.indexHeaderValue) ? _0x494b3d.indexHeaderValue : 0;
        this.currentRecordIndex = 0;
        this.parsedRecords = [];
        this.dataRowIndex = 0;
        this.ignoredIndexes = new Set(_0x494b3d.indexesToIgnore || []);
        this.chunkSize = _0x263bc9.chunkSize || 1000;
        this.onChunk = _0x263bc9.onChunk;
        this.onComplete = _0x263bc9.onComplete;
        this.onError = _0x263bc9.onError;
        this.allRecords = [];
      }
      processChunk(_0x18fa6f) {
        let _0x56acd9;
        if (typeof _0x18fa6f === "string") {
          _0x56acd9 = _0x18fa6f;
        } else if (this.isBrowser && typeof globalThis.TextDecoder !== "undefined") {
          _0x56acd9 = new globalThis.TextDecoder().decode(_0x18fa6f);
        } else if (this.isBrowser) {
          _0x56acd9 = String.fromCharCode.apply(null, new Uint8Array(_0x18fa6f));
        } else {
          _0x56acd9 = _0x18fa6f.toString();
        }
        this.buffer += _0x56acd9;
        this._processCompleteRecords();
      }
      async processStreamWithCallbacks(_0x2c0f3e) {
        return new Promise((_0x12fed6, _0x46506d) => {
          if (this.isBrowser) {
            if (!_0x2c0f3e || typeof _0x2c0f3e.getReader !== "function") {
              const _0x1f65d1 = new Error("Invalid ReadableStream provided");
              if (this.onError) {
                this.onError(_0x1f65d1);
              }
              _0x46506d(_0x1f65d1);
              return;
            }
            const _0x2097da = _0x2c0f3e.getReader();
            const _0x6bdb93 = async () => {
              try {
                while (true) {
                  const {
                    done: _0x24ad90,
                    value: _0xbb9ef5
                  } = await _0x2097da.read();
                  if (_0x24ad90) {
                    this.finalizeProcessing();
                    this._sendRemainingChunks();
                    if (this.onComplete) {
                      this.onComplete(this.allRecords);
                    }
                    _0x12fed6();
                    return;
                  }
                  this.processChunk(_0xbb9ef5);
                  this._sendPendingChunks();
                }
              } catch (_0x336375) {
                if (this.onError) {
                  this.onError(_0x336375);
                }
                _0x46506d(_0x336375);
              }
            };
            _0x6bdb93();
          } else {
            if (!_0x2c0f3e || typeof _0x2c0f3e.pipe !== "function") {
              const _0x33e8a3 = new Error("Invalid Readable stream provided");
              if (this.onError) {
                this.onError(_0x33e8a3);
              }
              _0x46506d(_0x33e8a3);
              return;
            }
            _0x2c0f3e.on("data", _0x128a83 => {
              try {
                this.processChunk(_0x128a83);
                this._sendPendingChunks();
              } catch (_0x4e8814) {
                if (this.onError) {
                  this.onError(_0x4e8814);
                }
                _0x46506d(_0x4e8814);
              }
            });
            _0x2c0f3e.on("end", () => {
              try {
                this.finalizeProcessing();
                this._sendRemainingChunks();
                if (this.onComplete) {
                  this.onComplete(this.allRecords);
                }
                _0x12fed6();
              } catch (_0x3bed4b) {
                if (this.onError) {
                  this.onError(_0x3bed4b);
                }
                _0x46506d(_0x3bed4b);
              }
            });
            _0x2c0f3e.on("error", _0x4a0e99 => {
              if (this.onError) {
                this.onError(_0x4a0e99);
              }
              _0x46506d(_0x4a0e99);
            });
          }
        });
      }
      _sendPendingChunks() {
        if (!this.onChunk) {
          return;
        }
        while (this.parsedRecords.length >= this.chunkSize) {
          const _0x2293ab = this.parsedRecords.splice(0, this.chunkSize);
          this.allRecords.push(..._0x2293ab);
          this.onChunk(_0x2293ab, this.allRecords.length, null);
        }
      }
      _sendRemainingChunks() {
        if (!this.onChunk || this.parsedRecords.length === 0) {
          return;
        }
        const _0x3aa562 = [...this.parsedRecords];
        this.parsedRecords.length = 0;
        this.allRecords.push(..._0x3aa562);
        this.onChunk(_0x3aa562, this.allRecords.length, this.allRecords.length);
      }
      async processStream(_0x56a04) {
        return new Promise((_0x27f567, _0x2eb220) => {
          if (this.isBrowser) {
            if (!_0x56a04 || typeof _0x56a04.getReader !== "function") {
              _0x2eb220(new Error("Invalid ReadableStream provided"));
              return;
            }
            const _0x4935ec = _0x56a04.getReader();
            const _0x2240c2 = async () => {
              try {
                while (true) {
                  const {
                    done: _0x5781a8,
                    value: _0x5d93a4
                  } = await _0x4935ec.read();
                  if (_0x5781a8) {
                    this.finalizeProcessing();
                    _0x27f567(this.getResult());
                    return;
                  }
                  this.processChunk(_0x5d93a4);
                }
              } catch (_0x31816c) {
                _0x2eb220(_0x31816c);
              }
            };
            _0x2240c2();
          } else {
            if (!_0x56a04 || typeof _0x56a04.pipe !== "function") {
              _0x2eb220(new Error("Invalid Readable stream provided"));
              return;
            }
            _0x56a04.on("data", _0xd060bf => {
              try {
                this.processChunk(_0xd060bf);
              } catch (_0x4f780a) {
                _0x2eb220(_0x4f780a);
              }
            });
            _0x56a04.on("end", () => {
              try {
                this.finalizeProcessing();
                _0x27f567(this.getResult());
              } catch (_0x23eaab) {
                _0x2eb220(_0x23eaab);
              }
            });
            _0x56a04.on("error", _0x342b1f => {
              _0x2eb220(_0x342b1f);
            });
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
        const _0x3cc244 = this._parseRecordsFromBuffer(this.buffer, this.isInsideQuotes);
        this.buffer = _0x3cc244.remainingBuffer;
        this.isInsideQuotes = _0x3cc244.isInsideQuotes;
        for (const _0x238aab of _0x3cc244.completeRecords) {
          this._processRecord(_0x238aab);
          this.currentRecordIndex++;
        }
      }
      _processRemainingBuffer() {
        if (this.buffer.length > 0) {
          if (this.isInsideQuotes) {
            throw CsvFormatError.mismatchedQuotes("CSV stream");
          }
          const _0x41f67 = this._parseRecordsFromBuffer(this.buffer + "\n", false);
          for (const _0x21feb2 of _0x41f67.completeRecords) {
            this._processRecord(_0x21feb2);
            this.currentRecordIndex++;
          }
        }
      }
      _processRecord(_0x1c52e7) {
        if (this.headers === null && this.currentRecordIndex === this.headerRowIndex) {
          this._processHeaderRecord(_0x1c52e7);
        } else if (this.headers !== null) {
          this._processDataRecord(_0x1c52e7);
        }
      }
      _processHeaderRecord(_0x515977) {
        const _0x3036ad = this._splitRecord(_0x515977);
        if (_0x26f6e5.hasContent(_0x3036ad)) {
          this.headers = _0x3036ad;
        }
      }
      _processDataRecord(_0xd57c7) {
        const _0x4712bf = this._splitRecord(_0xd57c7);
        if (_0x26f6e5.hasContent(_0x4712bf)) {
          const _0xbd309d = this._buildJsonResult(this.headers, _0x4712bf);
          const _0x4190c2 = this._applyRowMapper(_0xbd309d);
          if (_0x4190c2 !== null) {
            this.parsedRecords.push(_0x4190c2);
          }
        }
      }
      _applyRowMapper(_0x232f9a) {
        if (this.csvConfig.rowMapper) {
          const _0x422c9b = this.csvConfig.rowMapper(_0x232f9a, this.dataRowIndex);
          this.dataRowIndex++;
          return _0x422c9b;
        }
        this.dataRowIndex++;
        return _0x232f9a;
      }
      _splitRecord(_0x57ec04) {
        if (this.csvConfig.isSupportQuotedField) {
          return this._splitWithConfig(_0x57ec04, this.csvConfig);
        }
        return _0x57ec04.split(this.csvConfig.delimiter || ",");
      }
      _splitWithConfig(_0x51e255, _0xa71da6) {
        if (_0x51e255.length === 0) {
          return [];
        }
        const _0x5cee88 = [];
        let _0x36e461 = "";
        let _0x14be14 = false;
        const _0x3bdd79 = _0xa71da6.delimiter || ",";
        for (let _0x2a730d = 0; _0x2a730d < _0x51e255.length; _0x2a730d++) {
          const _0x450c2a = _0x51e255[_0x2a730d];
          if (_0x450c2a === _0x20a1c3) {
            if (_0x14be14 && _0x2a730d + 1 < _0x51e255.length && _0x51e255[_0x2a730d + 1] === _0x20a1c3) {
              _0x36e461 += _0x20a1c3;
              _0x2a730d++;
            } else {
              _0x14be14 = !_0x14be14;
            }
          } else if (_0x450c2a === _0x3bdd79 && !_0x14be14) {
            _0x5cee88.push(_0x36e461);
            _0x36e461 = "";
          } else {
            _0x36e461 += _0x450c2a;
          }
        }
        _0x5cee88.push(_0x36e461);
        if (_0x14be14) {
          throw CsvFormatError.mismatchedQuotes("row");
        }
        return _0x5cee88;
      }
      _buildJsonResult(_0x220285, _0x32ac62) {
        const _0x5ca195 = {};
        for (let _0xf9a95c = 0; _0xf9a95c < _0x220285.length; _0xf9a95c++) {
          if (this.ignoredIndexes.has(_0xf9a95c)) {
            continue;
          }
          const _0x3de447 = _0x26f6e5.trimPropertyName(this.csvConfig.isTrimHeaderFieldWhiteSpace, _0x220285[_0xf9a95c]);
          let _0x3b888a = _0x32ac62[_0xf9a95c];
          if (this._isParseSubArray(_0x3b888a)) {
            _0x3b888a = this._buildJsonSubArray(_0x3b888a);
          }
          if (this.csvConfig.printValueFormatByType && !Array.isArray(_0x3b888a)) {
            _0x3b888a = _0x26f6e5.getValueFormatByType(_0x32ac62[_0xf9a95c]);
          }
          _0x5ca195[_0x3de447] = _0x3b888a;
        }
        return _0x5ca195;
      }
      _isParseSubArray(_0x10c7f7) {
        if (this.csvConfig.parseSubArrayDelimiter) {
          return _0x10c7f7 && _0x10c7f7.indexOf(this.csvConfig.parseSubArrayDelimiter) === 0 && _0x10c7f7.lastIndexOf(this.csvConfig.parseSubArrayDelimiter) === _0x10c7f7.length - 1;
        }
        return false;
      }
      _buildJsonSubArray(_0x8ea5d0) {
        const _0x24ba7c = _0x8ea5d0.substring(_0x8ea5d0.indexOf(this.csvConfig.parseSubArrayDelimiter) + 1, _0x8ea5d0.lastIndexOf(this.csvConfig.parseSubArrayDelimiter));
        const _0x297118 = _0x24ba7c.split(this.csvConfig.parseSubArraySeparator);
        if (this.csvConfig.printValueFormatByType) {
          for (let _0x7a32e5 = 0; _0x7a32e5 < _0x297118.length; _0x7a32e5++) {
            _0x297118[_0x7a32e5] = _0x26f6e5.getValueFormatByType(_0x297118[_0x7a32e5]);
          }
        }
        return _0x297118;
      }
      _parseRecordsFromBuffer(_0x37bfd5, _0x292bda) {
        const _0x27809e = [];
        let _0xb46964 = "";
        let _0xd82337 = 0;
        while (_0xd82337 < _0x37bfd5.length) {
          const _0x222062 = _0x37bfd5[_0xd82337];
          if (_0x222062 === _0x20a1c3) {
            const _0x240625 = this._handleEscapedQuote(_0x37bfd5, _0xd82337, _0x292bda);
            if (_0x240625.wasEscaped) {
              _0xb46964 += _0x20a1c3 + _0x20a1c3;
              _0xd82337 = _0x240625.newIndex;
              continue;
            } else {
              _0x292bda = !_0x292bda;
            }
          } else if (!_0x292bda && this._isLineEnding(_0x37bfd5, _0xd82337)) {
            const _0x3896de = this._getLineEndingLength(_0x37bfd5, _0xd82337);
            _0x27809e.push(_0xb46964);
            _0xb46964 = "";
            _0xd82337 += _0x3896de;
            continue;
          }
          _0xb46964 += _0x222062;
          _0xd82337++;
        }
        const _0x1193f1 = {
          completeRecords: _0x27809e,
          remainingBuffer: _0xb46964,
          isInsideQuotes: _0x292bda
        };
        return _0x1193f1;
      }
      _handleEscapedQuote(_0x1aa3fe, _0x58ad06, _0x35c6ec) {
        if (_0x35c6ec && _0x58ad06 + 1 < _0x1aa3fe.length && _0x1aa3fe[_0x58ad06 + 1] === _0x20a1c3) {
          return {
            wasEscaped: true,
            newIndex: _0x58ad06 + 2
          };
        }
        return {
          wasEscaped: false,
          newIndex: _0x58ad06 + 1
        };
      }
      _isLineEnding(_0x16522b, _0x8697db) {
        return this._getLineEndingLength(_0x16522b, _0x8697db) > 0;
      }
      _getLineEndingLength(_0x98e2ce, _0x31cafb) {
        if (_0x98e2ce.slice(_0x31cafb, _0x31cafb + 2) === _0x58851c) {
          return 2;
        }
        if (_0x98e2ce[_0x31cafb] === _0x5321dd) {
          return 1;
        }
        if (_0x98e2ce[_0x31cafb] === _0x4d697e && _0x98e2ce[_0x31cafb + 1] !== _0x5321dd) {
          return 1;
        }
        return 0;
      }
      _validateProcessingResult() {
        if (!this.headers && this.parsedRecords.length === 0) {
          return;
        }
        if (!this.headers) {
          throw CsvFormatError.missingHeader();
        }
      }
    };
    _0x43084e.exports = _0x3e9b7d;
  }
});
var require_csvToJsonAsync = __commonJS({
  "../work/iuccio__csvToJson/src/csvToJsonAsync.js"(_0x4a6a5b, _0x46e960) {
    'use strict';

    var _0x231055 = require_fileUtils();
    var _0x91e0a0 = require_csvToJson();
    var _0x35f183 = require_configurable();
    var {
      InputValidationError: _0x2c2a7c
    } = require_errors();
    var _0x33c5b4 = require_streamProcessor();
    const _0x311a49 = {
      raw: true
    };
    var _0x112b53 = class extends _0x35f183 {
      constructor() {
        super();
        this.csvToJson = _0x91e0a0;
      }
      async generateJsonFileFromCsv(_0x109b9f, _0x1ea07e) {
        const _0x562b89 = await this.getJsonFromCsvStringified(_0x109b9f);
        await _0x231055.writeFileAsync(_0x562b89, _0x1ea07e);
      }
      async getJsonFromCsvStringified(_0x5ed475) {
        const _0x3f4d05 = await this.getJsonFromCsvAsync(_0x5ed475);
        return JSON.stringify(_0x3f4d05, undefined, 1);
      }
      async getJsonFromCsvAsync(_0x4971ca, _0xfd4f83 = {}) {
        if (_0x4971ca === null || _0x4971ca === undefined) {
          throw new _0x2c2a7c("inputFileNameOrCsv", "string (file path) or CSV string content", "" + typeof _0x4971ca, "Either provide a valid file path or CSV content as a string.");
        }
        const _0x31972e = this.getParserConfig();
        if (_0xfd4f83.raw) {
          if (_0x4971ca === "") {
            return [];
          }
          return this.csvToJson.csvToJsonWithConfig(_0x4971ca, _0x31972e);
        }
        const _0x24fd5c = await _0x231055.readFileAsync(_0x4971ca, _0x31972e.encoding || "utf8");
        return this.csvToJson.csvToJsonWithConfig(_0x24fd5c, _0x31972e);
      }
      csvStringToJsonAsync(_0x4687a2, _0x5bd646 = _0x311a49) {
        return this.getJsonFromCsvAsync(_0x4687a2, _0x5bd646);
      }
      async getJsonFromStreamAsync(_0x460a85) {
        this._validateStream(_0x460a85);
        const _0x5732c8 = this.getParserConfig();
        const _0x3b1f1f = new _0x33c5b4(_0x5732c8, {
          isBrowser: false
        });
        return _0x3b1f1f.processStream(_0x460a85);
      }
      _validateStream(_0x1f208c) {
        if (!_0x1f208c || typeof _0x1f208c.pipe !== "function") {
          throw new _0x2c2a7c("stream", "Readable stream", typeof _0x1f208c, "Provide a valid Node.js Readable stream.");
        }
      }
      async getJsonFromFileStreamingAsync(_0x379ce9) {
        if (!_0x379ce9 || typeof _0x379ce9 !== "string") {
          throw new _0x2c2a7c("filePath", "string (file path)", typeof _0x379ce9, "Provide a valid file path as a string.");
        }
        const _0x1f2989 = require("fs");
        const _0x2cb89a = this.getParserConfig();
        const _0x592948 = typeof _0x2cb89a.encoding === "string" ? _0x2cb89a.encoding : "utf8";
        const _0x3c8115 = {
          encoding: _0x592948
        };
        const _0x2eb69c = _0x1f2989.createReadStream(_0x379ce9, _0x3c8115);
        return this.getJsonFromStreamAsync(_0x2eb69c);
      }
    };
    _0x46e960.exports = new _0x112b53();
  }
});
var require_browserApi = __commonJS({
  "../work/iuccio__csvToJson/src/browserApi.js"(_0x33d807, _0x3f91fb) {
    'use strict';

    var _0x1e6e00 = require_csvToJson();
    var _0x334080 = require_configurable();
    var {
      InputValidationError: _0x1097d6,
      BrowserApiError: _0x105d11
    } = require_errors();
    var _0x3d76d6 = require_streamProcessor();
    var _0x463d1d = class extends _0x334080 {
      constructor() {
        super();
        this.csvToJson = _0x1e6e00;
      }
      _validateCsvString(_0x506fcb) {
        if (_0x506fcb === undefined || _0x506fcb === null) {
          throw new _0x1097d6("csvString", "string", "" + typeof _0x506fcb, "Provide valid CSV content as a string to parse.");
        }
      }
      _parseCsvText(_0x219ea8) {
        const _0x46ab03 = this.getParserConfig();
        return this.csvToJson.csvToJsonWithConfig(String(_0x219ea8), _0x46ab03);
      }
      csvStringToJson(_0x32f9ca) {
        this._validateCsvString(_0x32f9ca);
        return this._parseCsvText(_0x32f9ca);
      }
      csvStringToJsonStringified(_0x360b63) {
        this._validateCsvString(_0x360b63);
        const _0x326bbd = this._parseCsvText(_0x360b63);
        return JSON.stringify(_0x326bbd, undefined, 1);
      }
      csvStringToJsonAsync(_0x23c1d9) {
        return Promise.resolve(this.csvStringToJson(_0x23c1d9));
      }
      csvStringToJsonStringifiedAsync(_0xb906e4) {
        return Promise.resolve(this.csvStringToJsonStringified(_0xb906e4));
      }
      parseFile(_0x399302, _0x27844c = {}) {
        if (!_0x399302) {
          return Promise.reject(new _0x1097d6("file", "File or Blob object", "" + typeof _0x399302, "Provide a valid File or Blob object to parse."));
        }
        return new Promise((_0x394feb, _0x204ca4) => {
          if (typeof FileReader === "undefined") {
            _0x204ca4(_0x105d11.fileReaderNotAvailable());
            return;
          }
          const _0x4e4ebf = new FileReader();
          _0x4e4ebf.onerror = () => _0x204ca4(_0x105d11.parseFileError(_0x4e4ebf.error || new Error("Unknown file reading error")));
          _0x4e4ebf.onload = () => {
            try {
              _0x394feb(this._parseCsvText(_0x4e4ebf.result));
            } catch (_0x2c35e6) {
              _0x204ca4(_0x105d11.parseFileError(_0x2c35e6));
            }
          };
          if (_0x27844c.encoding) {
            _0x4e4ebf.readAsText(_0x399302, _0x27844c.encoding);
          } else {
            _0x4e4ebf.readAsText(_0x399302);
          }
        });
      }
      async getJsonFromStreamAsync(_0x48dabd) {
        if (typeof ReadableStream === "undefined") {
          throw _0x105d11.streamingNotSupported();
        }
        if (!_0x48dabd || typeof _0x48dabd.getReader !== "function") {
          throw new _0x1097d6("stream", "ReadableStream", typeof _0x48dabd, "Provide a valid browser ReadableStream.");
        }
        const _0x3fa4c1 = this.getParserConfig();
        const _0x53c8f0 = new _0x3d76d6(_0x3fa4c1, {
          isBrowser: true
        });
        return _0x53c8f0.processStream(_0x48dabd);
      }
      async getJsonFromFileStreamingAsync(_0x496bd5) {
        if (!_0x496bd5 || !(_0x496bd5 instanceof File)) {
          throw new _0x1097d6("file", "File object", typeof _0x496bd5, "Provide a valid File object.");
        }
        if (typeof _0x496bd5.stream === "function") {
          const _0x4d7b11 = _0x496bd5.stream();
          return this.getJsonFromStreamAsync(_0x4d7b11);
        } else {
          return this.parseFile(_0x496bd5);
        }
      }
      async getJsonFromFileStreamingAsyncWithCallback(_0x1ed613, _0x2529af = {}) {
        if (!_0x1ed613 || !(_0x1ed613 instanceof File)) {
          throw new _0x1097d6("file", "File object", typeof _0x1ed613, "Provide a valid File object.");
        }
        if (!_0x2529af.onChunk || typeof _0x2529af.onChunk !== "function") {
          throw new _0x1097d6("options.onChunk", "function", typeof _0x2529af.onChunk, "Provide a callback function to handle processed chunks.");
        }
        const _0x554d8b = _0x2529af.chunkSize || 1000;
        const _0x1f71cc = this.getParserConfig();
        const _0x5ea721 = {
          isBrowser: true,
          chunkSize: _0x554d8b,
          onChunk: _0x2529af.onChunk,
          onComplete: _0x2529af.onComplete,
          onError: _0x2529af.onError
        };
        const _0x2a998a = new _0x3d76d6(_0x1f71cc, _0x5ea721);
        if (typeof _0x1ed613.stream === "function") {
          const _0x3bfac1 = _0x1ed613.stream();
          return _0x2a998a.processStreamWithCallbacks(_0x3bfac1);
        } else {
          return this.parseFileWithCallbacks(_0x1ed613, _0x2529af);
        }
      }
      async parseFileWithCallbacks(_0x2927b0, _0x3bd4f9) {
        const _0x3bb86 = _0x3bd4f9.chunkSize || 1000;
        const _0x321571 = _0x3bd4f9.onChunk;
        const _0x30b7c2 = _0x3bd4f9.onComplete;
        const _0x7a939d = _0x3bd4f9.onError;
        return new Promise((_0x1c496e, _0x1f9223) => {
          if (typeof FileReader === "undefined") {
            const _0x4b28e3 = _0x105d11.fileReaderNotAvailable();
            if (_0x7a939d) {
              _0x7a939d(_0x4b28e3);
            }
            _0x1f9223(_0x4b28e3);
            return;
          }
          const _0x499fe2 = new FileReader();
          _0x499fe2.onerror = () => {
            const _0x4c58de = _0x105d11.parseFileError(_0x499fe2.error || new Error("Unknown file reading error"));
            if (_0x7a939d) {
              _0x7a939d(_0x4c58de);
            }
            _0x1f9223(_0x4c58de);
          };
          _0x499fe2.onload = () => {
            try {
              const _0x218364 = this._parseCsvText(_0x499fe2.result);
              let _0x1803cf = 0;
              const _0x327d5a = _0x218364.length;
              const _0x199041 = () => {
                const _0x2b1362 = _0x218364.slice(_0x1803cf, _0x1803cf + _0x3bb86);
                if (_0x2b1362.length > 0) {
                  _0x321571(_0x2b1362, _0x1803cf + _0x2b1362.length, _0x327d5a);
                  _0x1803cf += _0x2b1362.length;
                  setTimeout(_0x199041, 0);
                } else {
                  if (_0x30b7c2) {
                    _0x30b7c2(_0x218364);
                  }
                  _0x1c496e();
                }
              };
              _0x199041();
            } catch (_0xef2813) {
              const _0x286553 = _0x105d11.parseFileError(_0xef2813);
              if (_0x7a939d) {
                _0x7a939d(_0x286553);
              }
              _0x1f9223(_0x286553);
            }
          };
          _0x499fe2.readAsText(_0x2927b0);
        });
      }
    };
    _0x3f91fb.exports = new _0x463d1d();
  }
});
var csvToJson = require_csvToJson();
var encodingOps = {
  utf8: "utf8",
  ucs2: "ucs2",
  utf16le: "utf16le",
  latin1: "latin1",
  ascii: "ascii",
  base64: "base64",
  hex: "hex"
};
var csvToJsonAsync = require_csvToJsonAsync();
function applyConfigToAllClients(_0x4d06dc) {
  _0x4d06dc(csvToJson);
  _0x4d06dc(csvToJsonAsync);
  if (exports.browser) {
    _0x4d06dc(exports.browser);
  }
  return exports;
}
exports.formatValueByType = function (_0xc150c = true) {
  return applyConfigToAllClients(_0x2d00d2 => _0x2d00d2.formatValueByType(_0xc150c));
};
exports.supportQuotedField = function (_0x5a24f3 = false) {
  return applyConfigToAllClients(_0x1a2fe5 => _0x1a2fe5.supportQuotedField(_0x5a24f3));
};
exports.fieldDelimiter = function (_0x3385bb) {
  return applyConfigToAllClients(_0x278dbf => _0x278dbf.fieldDelimiter(_0x3385bb));
};
exports.trimHeaderFieldWhiteSpace = function (_0x3720c3 = false) {
  return applyConfigToAllClients(_0x45d98c => _0x45d98c.trimHeaderFieldWhiteSpace(_0x3720c3));
};
exports.indexHeader = function (_0x59ef10) {
  return applyConfigToAllClients(_0x59b05d => _0x59b05d.indexHeader(_0x59ef10));
};
exports.parseSubArray = function (_0x2651be, _0x252411) {
  return applyConfigToAllClients(_0x2561d7 => _0x2561d7.parseSubArray(_0x2651be, _0x252411));
};
exports.ignoreColumnIndexes = function (_0x3e15a2) {
  if (!Array.isArray(_0x3e15a2)) {
    throw new TypeError("indexes must be an array of numbers");
  }
  if (!_0x3e15a2.every(_0x5a6309 => Number.isInteger(_0x5a6309) && _0x5a6309 >= 0)) {
    throw new TypeError("All elements in indexes must be valid non-negative numbers (>= 0)");
  }
  return applyConfigToAllClients(_0xa9511c => _0xa9511c.ignoreColumnIndexes(_0x3e15a2));
};
exports.customEncoding = function (_0x5b436d) {
  return applyConfigToAllClients(_0x2cf2d7 => _0x2cf2d7.encoding(_0x5b436d));
};
exports.utf8Encoding = function utf8Encoding() {
  return applyConfigToAllClients(_0x130acb => _0x130acb.encoding(encodingOps.utf8));
};
exports.ucs2Encoding = function () {
  return applyConfigToAllClients(_0x2de961 => _0x2de961.encoding(encodingOps.ucs2));
};
exports.utf16leEncoding = function () {
  return applyConfigToAllClients(_0x4f1455 => _0x4f1455.encoding(encodingOps.utf16le));
};
exports.latin1Encoding = function () {
  return applyConfigToAllClients(_0x450afd => _0x450afd.encoding(encodingOps.latin1));
};
exports.asciiEncoding = function () {
  return applyConfigToAllClients(_0x3f1f74 => _0x3f1f74.encoding(encodingOps.ascii));
};
exports.base64Encoding = function () {
  return applyConfigToAllClients(_0x758ec0 => _0x758ec0.encoding(encodingOps.base64));
};
exports.hexEncoding = function () {
  return applyConfigToAllClients(_0x1d9058 => _0x1d9058.encoding(encodingOps.hex));
};
exports.mapRows = function (_0x3093c4) {
  return applyConfigToAllClients(_0x2312d4 => _0x2312d4.mapRows(_0x3093c4));
};
exports.generateJsonFileFromCsv = function (_0xca0e92, _0x40a5aa) {
  if (!_0xca0e92) {
    throw new Error("inputFileName is not defined!!!");
  }
  if (!_0x40a5aa) {
    throw new Error("outputFileName is not defined!!!");
  }
  csvToJson.generateJsonFileFromCsv(_0xca0e92, _0x40a5aa);
};
exports.getJsonFromCsv = function (_0x2e5409) {
  if (!_0x2e5409) {
    throw new Error("inputFileName is not defined!!!");
  }
  return csvToJson.getJsonFromCsv(_0x2e5409);
};
exports.getJsonFromCsvAsync = function (_0x319edd, _0x2dab19) {
  return csvToJsonAsync.getJsonFromCsvAsync(_0x319edd, _0x2dab19);
};
exports.csvStringToJsonAsync = function (_0x3858db, _0x2e4e20) {
  return csvToJsonAsync.csvStringToJsonAsync(_0x3858db, _0x2e4e20);
};
exports.csvStringToJsonStringifiedAsync = function (_0x1919f1) {
  return csvToJsonAsync.csvStringToJsonStringifiedAsync(_0x1919f1);
};
exports.generateJsonFileFromCsvAsync = function (_0x122602, _0x39a663) {
  return csvToJsonAsync.generateJsonFileFromCsv(_0x122602, _0x39a663);
};
exports.getJsonFromStreamAsync = function (_0x39a3d5) {
  return csvToJsonAsync.getJsonFromStreamAsync(_0x39a3d5);
};
exports.getJsonFromFileStreamingAsync = function (_0x441ec9) {
  return csvToJsonAsync.getJsonFromFileStreamingAsync(_0x441ec9);
};
exports.csvStringToJson = function (_0x4b0e1d) {
  return csvToJson.csvStringToJson(_0x4b0e1d);
};
exports.csvStringToJsonStringified = function (_0x160d8f) {
  if (_0x160d8f === undefined || _0x160d8f === null) {
    throw new Error("csvString is not defined!!!");
  }
  return csvToJson.csvStringToJsonStringified(_0x160d8f);
};
exports.browser = require_browserApi();