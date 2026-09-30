'use strict';

var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (_0x524bef, _0x3a5093) => function _0x6a2167() {
  if (!_0x3a5093) {
    (0, _0x524bef[__getOwnPropNames(_0x524bef)[0]])((_0x3a5093 = {
      exports: {}
    }).exports, _0x3a5093);
  }
  return _0x3a5093.exports;
};
var require_errors = __commonJS({
  "../work/iuccio__csvToJson/src/core/errors.js"(_0x44cf60, _0x5b506a) {
    'use strict';

    var _0x1d554b = class extends Error {
      constructor(_0x4725e2, _0x3d519c, _0x273ad4 = {}) {
        super(_0x4725e2);
        this.name = "CsvParsingError";
        this.code = _0x3d519c;
        this.context = _0x273ad4;
        Error.captureStackTrace(this, this.constructor);
      }
      toString() {
        let _0x44638f = this.name + ": " + this.message;
        if (this.context && Object.keys(this.context).length > 0) {
          _0x44638f += "\n\nContext:";
          Object.entries(this.context).forEach(([_0x73ffbd, _0x391457]) => {
            _0x44638f += "\n  " + _0x73ffbd + ": " + this.formatValue(_0x391457);
          });
        }
        return _0x44638f;
      }
      formatValue(_0x2bcb8f) {
        if (_0x2bcb8f === null) {
          return "null";
        }
        if (_0x2bcb8f === undefined) {
          return "undefined";
        }
        if (typeof _0x2bcb8f === "string") {
          return "\"" + _0x2bcb8f + "\"";
        }
        if (typeof _0x2bcb8f === "object") {
          return JSON.stringify(_0x2bcb8f);
        }
        return String(_0x2bcb8f);
      }
    };
    var _0x6ee817 = class extends _0x1d554b {
      constructor(_0x55c8fe, _0x1c36e2, _0x15cb87, _0x26cba1 = "") {
        const _0x3b7ee6 = "Invalid input: Parameter '" + _0x55c8fe + "' is required.\nExpected: " + _0x1c36e2 + "\nReceived: " + _0x15cb87 + (_0x26cba1 ? "\n" + _0x26cba1 : "");
        const _0x540fec = {
          parameter: _0x55c8fe,
          expectedType: _0x1c36e2,
          receivedType: _0x15cb87
        };
        super(_0x3b7ee6, "INPUT_VALIDATION_ERROR", _0x540fec);
        this.name = "InputValidationError";
      }
    };
    var _0x38a022 = class _0x36e3ac extends _0x1d554b {
      constructor(_0x497189, _0x4d133f = {}) {
        super(_0x497189, "CONFIGURATION_ERROR", _0x4d133f);
        this.name = "ConfigurationError";
      }
      static quotedFieldConflict(_0x224287, _0x3c6512) {
        return new _0x36e3ac("Configuration conflict: supportQuotedField() is enabled, but " + _0x224287 + " is set to '" + _0x3c6512 + "'.\nThe quote character (\") cannot be used as a field delimiter, separator, or sub-array delimiter when quoted field support is active.\n\nSolutions:\n  1. Use a different character for " + _0x224287 + " (e.g., '|', '\\t', ';')\n  2. Disable supportQuotedField() if your CSV doesn't contain quoted fields\n  3. Refer to RFC 4180 for proper CSV formatting: https://tools.ietf.org/html/rfc4180", {
          optionName: _0x224287,
          value: _0x3c6512,
          conflictingOption: "supportQuotedField"
        });
      }
      static invalidHeaderIndex(_0x23a598) {
        return new _0x36e3ac("Invalid configuration: indexHeader() expects a numeric value.\nReceived: " + typeof _0x23a598 + " (" + _0x23a598 + ")\n\nSolutions:\n  1. Ensure indexHeader() receives a number: indexHeader(0), indexHeader(1), etc.\n  2. Headers are typically found on row 0 (first line)\n  3. Use indexHeader(2) if headers are on the 3rd line", {
          parameterName: "indexHeader",
          value: _0x23a598,
          type: typeof _0x23a598
        });
      }
    };
    var _0x418d30 = class _0x1a8fc2 extends _0x1d554b {
      constructor(_0x2b02e5, _0x3e2bab = {}) {
        super(_0x2b02e5, "CSV_FORMAT_ERROR", _0x3e2bab);
        this.name = "CsvFormatError";
      }
      static missingHeader() {
        return new _0x1a8fc2("CSV parsing error: No header row found.\nThe CSV file appears to be empty or has no valid header line.\n\nSolutions:\n  1. Ensure your CSV file contains at least one row (header row)\n  2. Verify the file is not empty or contains only whitespace\n  3. Check if you need to use indexHeader(n) to specify a non-standard header row\n  4. Refer to RFC 4180 for proper CSV format: https://tools.ietf.org/html/rfc4180");
      }
      static mismatchedQuotes(_0x319c66 = "CSV") {
        return new _0x1a8fc2("CSV parsing error: Mismatched quotes detected in " + _0x319c66 + ".\nA quoted field was not properly closed with a matching quote character.\n\nRFC 4180 rules for quoted fields:\n  • Fields containing delimiters or quotes MUST be enclosed in double quotes\n  • To include a quote within a quoted field, use two consecutive quotes: \"\"\n  • Example: \"Smith, John\" (name contains comma)\n  • Example: \"He said \"\"Hello\"\"\" (text contains quotes)\n\nSolutions:\n  1. Review your CSV for properly paired quote characters\n  2. Use double quotes (\"\") to escape quotes within quoted fields\n  3. Ensure all commas within field values are inside quotes\n  4. Enable supportQuotedField(true) if you're using quoted fields", {
          location: _0x319c66
        });
      }
    };
    var _0x42e1c5 = class extends _0x1d554b {
      constructor(_0x5e51c0, _0x24f0cc, _0x1d20b6) {
        const _0x14e530 = "File operation error: Failed to " + _0x5e51c0 + " file.\nFile path: " + _0x24f0cc + "\nReason: " + _0x1d20b6.message + "\n\nSolutions:\n  1. Verify the file path is correct: " + _0x24f0cc + "\n  2. Check file permissions (read access for input, write access for output)\n  3. Ensure the directory exists and is writable for output files\n  4. Verify the file is not in use by another process";
        const _0x98e511 = {
          operation: _0x5e51c0,
          filePath: _0x24f0cc,
          originalError: _0x1d20b6.message
        };
        super(_0x14e530, "FILE_OPERATION_ERROR", _0x98e511);
        this.name = "FileOperationError";
        this.originalError = _0x1d20b6;
      }
    };
    var _0x49d686 = class extends _0x1d554b {
      constructor(_0x57c321, _0x5bb76b) {
        const _0x224a83 = "JSON validation error: The parsed CSV data generated invalid JSON.\nThis typically indicates malformed field names or values in the CSV.\nOriginal error: " + _0x5bb76b.message + "\n\nSolutions:\n  1. Check that field names are valid JavaScript identifiers (or will be converted safely)\n  2. Review the CSV data for special characters that aren't properly escaped\n  3. Enable supportQuotedField(true) for fields containing special characters\n  4. Verify that formatValueByType() isn't converting values incorrectly";
        super(_0x224a83, "JSON_VALIDATION_ERROR", {
          originalError: _0x5bb76b.message,
          csvPreview: _0x57c321 ? _0x57c321.substring(0, 200) : "N/A"
        });
        this.name = "JsonValidationError";
        this.originalError = _0x5bb76b;
      }
    };
    var _0x150594 = class _0x2dd1dc extends _0x1d554b {
      constructor(_0x23f50c, _0x3ab8b0 = {}) {
        super(_0x23f50c, "BROWSER_API_ERROR", _0x3ab8b0);
        this.name = "BrowserApiError";
      }
      static fileReaderNotAvailable() {
        return new _0x2dd1dc("Browser compatibility error: FileReader API is not available.\nYour browser does not support the FileReader API required for file parsing.\n\nSolutions:\n  1. Use a modern browser that supports FileReader (Chrome 13+, Firefox 10+, Safari 6+)\n  2. Consider using csvStringToJson() or csvStringToJsonAsync() for string-based parsing\n  3. Implement a polyfill or alternative file reading method");
      }
      static parseFileError(_0x5718bd) {
        return new _0x2dd1dc("Browser file parsing error: Failed to read and parse the file.\nError details: " + _0x5718bd.message + "\n\nSolutions:\n  1. Verify the file is a valid CSV file\n  2. Check the file encoding (UTF-8 is recommended)\n  3. Try a smaller file to isolate the issue\n  4. Check browser console for additional error details", {
          originalError: _0x5718bd.message
        });
      }
      static streamingNotSupported() {
        return new _0x2dd1dc("Browser compatibility error: ReadableStream API is not available.\nYour browser does not support the ReadableStream API required for streaming.\n\nSolutions:\n  1. Use a modern browser that supports ReadableStream (Chrome 43+, Firefox 65+, Safari 10.1+)\n  2. Use getJsonFromFileStreamingAsync() which falls back to regular file parsing\n  3. Consider using parseFile() for non-streaming file parsing\n  4. Implement a polyfill for ReadableStream support");
      }
    };
    const _0x2f2f1e = {
      CsvParsingError: _0x1d554b,
      InputValidationError: _0x6ee817,
      ConfigurationError: _0x38a022,
      CsvFormatError: _0x418d30,
      FileOperationError: _0x42e1c5,
      JsonValidationError: _0x49d686,
      BrowserApiError: _0x150594
    };
    _0x5b506a.exports = _0x2f2f1e;
  }
});
var require_fileUtils = __commonJS({
  "../work/iuccio__csvToJson/src/util/fileUtils.js"(_0x287df5, _0x1f21c1) {
    'use strict';

    var _0x4f5e83 = require("fs");
    var {
      FileOperationError: _0x2d2b40
    } = require_errors();
    var _0x10366f = new Set(["base64", "hex"]);
    var _0x45cb21 = class {
      _isEncodedFile(_0x4e7ee6) {
        return _0x10366f.has(_0x4e7ee6);
      }
      _decodeContent(_0x117c0e, _0x3b3ac5) {
        if (this._isEncodedFile(_0x3b3ac5)) {
          return Buffer.from(_0x117c0e, _0x3b3ac5).toString("utf8");
        }
        return _0x117c0e;
      }
      _toString(_0xd7c34d) {
        if (typeof _0xd7c34d === "string") {
          return _0xd7c34d;
        } else {
          return _0xd7c34d.toString();
        }
      }
      _wrapReadError(_0x51aae1, _0x1299d9) {
        return new _0x2d2b40("read", _0x51aae1, _0x1299d9);
      }
      _wrapWriteError(_0x1f4737, _0x78143a) {
        return new _0x2d2b40("write", _0x1f4737, _0x78143a);
      }
      _readFileSync(_0x4d7984, _0x2de470) {
        if (this._isEncodedFile(_0x2de470)) {
          const _0x46de23 = _0x4f5e83.readFileSync(_0x4d7984, "utf8");
          return this._decodeContent(_0x46de23, _0x2de470);
        }
        return this._toString(_0x4f5e83.readFileSync(_0x4d7984, _0x2de470));
      }
      readFile(_0x480a1e, _0x26c591 = "utf8") {
        try {
          return this._readFileSync(_0x480a1e, _0x26c591);
        } catch (_0x54c38f) {
          throw this._wrapReadError(_0x480a1e, _0x54c38f);
        }
      }
      _readFileAsyncWithPromises(_0x137959, _0x591ad0) {
        if (this._isEncodedFile(_0x591ad0)) {
          return _0x4f5e83.promises.readFile(_0x137959, "utf8").then(_0x2934d3 => this._decodeContent(_0x2934d3, _0x591ad0));
        }
        return _0x4f5e83.promises.readFile(_0x137959, _0x591ad0).then(_0x3c80a9 => this._toString(_0x3c80a9));
      }
      readFileAsync(_0x29758f, _0x39e11e = "utf8") {
        if (_0x4f5e83.promises && typeof _0x4f5e83.promises.readFile === "function") {
          return this._readFileAsyncWithPromises(_0x29758f, _0x39e11e).catch(_0x2d191f => {
            throw this._wrapReadError(_0x29758f, _0x2d191f);
          });
        }
        return new Promise((_0x43914d, _0x51c22d) => {
          const _0x592aed = (_0x381d7b, _0x437421) => {
            if (_0x381d7b) {
              _0x51c22d(this._wrapReadError(_0x29758f, _0x381d7b));
              return;
            }
            try {
              const _0x2e6d12 = this._isEncodedFile(_0x39e11e) ? this._decodeContent(this._toString(_0x437421), _0x39e11e) : this._toString(_0x437421);
              _0x43914d(_0x2e6d12);
            } catch (_0x23d52b) {
              _0x51c22d(this._wrapReadError(_0x29758f, _0x23d52b));
            }
          };
          const _0x385291 = this._isEncodedFile(_0x39e11e) ? "utf8" : _0x39e11e;
          _0x4f5e83.readFile(_0x29758f, _0x385291, _0x592aed);
        });
      }
      _writeFileSync(_0x1d1898, _0x206787) {
        _0x4f5e83.writeFileSync(_0x1d1898, _0x206787, "utf8");
      }
      _writeFileAsyncWithPromises(_0x3e1bf2, _0x412f6a) {
        return _0x4f5e83.promises.writeFile(_0x3e1bf2, _0x412f6a, "utf8");
      }
      writeFile(_0x11c65a, _0x3946f1) {
        try {
          this._writeFileSync(_0x3946f1, _0x11c65a);
        } catch (_0x520a79) {
          throw this._wrapWriteError(_0x3946f1, _0x520a79);
        }
      }
      writeFileAsync(_0x429095, _0x4ae886) {
        if (_0x4f5e83.promises && typeof _0x4f5e83.promises.writeFile === "function") {
          return this._writeFileAsyncWithPromises(_0x4ae886, _0x429095).catch(_0x11d17e => {
            throw this._wrapWriteError(_0x4ae886, _0x11d17e);
          });
        }
        return new Promise((_0x5a49fa, _0x2b08fd) => {
          _0x4f5e83.writeFile(_0x4ae886, _0x429095, "utf8", _0x476ac6 => {
            if (_0x476ac6) {
              _0x2b08fd(this._wrapWriteError(_0x4ae886, _0x476ac6));
              return;
            }
            _0x5a49fa();
          });
        });
      }
    };
    _0x1f21c1.exports = new _0x45cb21();
  }
});
var require_stringUtils = __commonJS({
  "../work/iuccio__csvToJson/src/util/stringUtils.js"(_0x27dfce, _0x2dcf33) {
    'use strict';

    const _0x579dac = {
      INTEGER: /^-?\d+$/,
      FLOAT: /^-?\d*\.\d+$/,
      WHITESPACE: /\s/g
    };
    const _0x55e82f = {
      TRUE: "true",
      FALSE: "false"
    };
    var _0x1fb30a = class _0x1deee5 {
      static PATTERNS = _0x579dac;
      static BOOLEAN_VALUES = _0x55e82f;
      trimPropertyName(_0x5b916f, _0x33af08) {
        if (!_0x33af08) {
          return "";
        }
        if (_0x5b916f) {
          return _0x33af08.replace(_0x1deee5.PATTERNS.WHITESPACE, "");
        } else {
          return _0x33af08.trim();
        }
      }
      getValueFormatByType(_0x5aefe1) {
        if (this.isEmpty(_0x5aefe1)) {
          return String();
        }
        if (this.isBoolean(_0x5aefe1)) {
          return this.convertToBoolean(_0x5aefe1);
        }
        if (this.isInteger(_0x5aefe1)) {
          return this.convertInteger(_0x5aefe1);
        }
        if (this.isFloat(_0x5aefe1)) {
          return this.convertFloat(_0x5aefe1);
        }
        return String(_0x5aefe1);
      }
      hasContent(_0x53da61 = []) {
        return Array.isArray(_0x53da61) && _0x53da61.some(_0x3e9304 => Boolean(_0x3e9304));
      }
      isEmpty(_0x25cc1a) {
        return _0x25cc1a === undefined || _0x25cc1a === "";
      }
      isBoolean(_0x1c2baa) {
        const _0x3d2005 = _0x1c2baa.toLowerCase();
        return _0x3d2005 === _0x1deee5.BOOLEAN_VALUES.TRUE || _0x3d2005 === _0x1deee5.BOOLEAN_VALUES.FALSE;
      }
      isInteger(_0x336940) {
        return _0x1deee5.PATTERNS.INTEGER.test(_0x336940);
      }
      isFloat(_0x3576d5) {
        return _0x1deee5.PATTERNS.FLOAT.test(_0x3576d5);
      }
      hasLeadingZero(_0x3806db) {
        const _0x476be8 = _0x3806db.length > 1 && _0x3806db[0] === "0";
        const _0x2877a2 = _0x3806db.length > 2 && _0x3806db[0] === "-" && _0x3806db[1] === "0";
        return _0x476be8 || _0x2877a2;
      }
      convertToBoolean(_0x42154a) {
        return JSON.parse(_0x42154a.toLowerCase());
      }
      convertInteger(_0x327296) {
        if (this.hasLeadingZero(_0x327296)) {
          return String(_0x327296);
        }
        const _0x188245 = Number(_0x327296);
        if (Number.isSafeInteger(_0x188245)) {
          return _0x188245;
        } else {
          return String(_0x327296);
        }
      }
      convertFloat(_0x228679) {
        const _0x3263d0 = Number(_0x228679);
        if (Number.isFinite(_0x3263d0)) {
          return _0x3263d0;
        } else {
          return String(_0x228679);
        }
      }
    };
    _0x2dcf33.exports = new _0x1fb30a();
  }
});
var require_jsonUtils = __commonJS({
  "../work/iuccio__csvToJson/src/util/jsonUtils.js"(_0x20245d, _0x5218d5) {
    'use strict';

    var {
      JsonValidationError: _0x524af4
    } = require_errors();
    var _0x1dfa0d = class {
      validateJson(_0x449133) {
        try {
          JSON.parse(_0x449133);
        } catch (_0x39a416) {
          throw new _0x524af4(_0x449133, _0x39a416);
        }
      }
    };
    _0x5218d5.exports = new _0x1dfa0d();
  }
});
var require_parserConfig = __commonJS({
  "../work/iuccio__csvToJson/src/core/parserConfig.js"(_0x3f6a88, _0x560b37) {
    'use strict';

    var _0x528c92 = class {
      constructor(_0x81f2cc = {}) {
        this.delimiter = _0x81f2cc.delimiter;
        this.encoding = _0x81f2cc.encoding;
        this.isSupportQuotedField = _0x81f2cc.isSupportQuotedField;
        this.isTrimHeaderFieldWhiteSpace = _0x81f2cc.isTrimHeaderFieldWhiteSpace;
        this.indexHeaderValue = _0x81f2cc.indexHeaderValue;
        this.parseSubArrayDelimiter = _0x81f2cc.parseSubArrayDelimiter;
        this.parseSubArraySeparator = _0x81f2cc.parseSubArraySeparator;
        this.printValueFormatByType = _0x81f2cc.printValueFormatByType;
        this.rowMapper = _0x81f2cc.rowMapper;
        this.indexesToIgnore = _0x81f2cc.indexesToIgnore ? Object.freeze([..._0x81f2cc.indexesToIgnore]) : Object.freeze([]);
        Object.freeze(this);
      }
    };
    _0x560b37.exports = _0x528c92;
  }
});
var require_configurable = __commonJS({
  "../work/iuccio__csvToJson/src/core/configurable.js"(_0x32cdb3, _0x570953) {
    'use strict';

    var {
      ConfigurationError: _0x597a16
    } = require_errors();
    var _0x57a0ba = require_parserConfig();
    var _0x27864d = class {
      constructor(_0x4e8051 = {}) {
        const _0x1837e8 = {
          ..._0x4e8051
        };
        this.config = _0x1837e8;
      }
      formatValueByType(_0x6d80c4 = true) {
        this.config.printValueFormatByType = _0x6d80c4;
        return this;
      }
      supportQuotedField(_0x5860f6 = false) {
        this.config.isSupportQuotedField = _0x5860f6;
        return this;
      }
      fieldDelimiter(_0x579037) {
        this.config.delimiter = _0x579037;
        return this;
      }
      trimHeaderFieldWhiteSpace(_0x266144 = false) {
        this.config.isTrimHeaderFieldWhiteSpace = _0x266144;
        return this;
      }
      indexHeader(_0x3061c2) {
        if (isNaN(_0x3061c2)) {
          throw _0x597a16.invalidHeaderIndex(_0x3061c2);
        }
        this.config.indexHeaderValue = _0x3061c2;
        return this;
      }
      parseSubArray(_0x10f0ed = "*", _0x633906 = ",") {
        this.config.parseSubArrayDelimiter = _0x10f0ed;
        this.config.parseSubArraySeparator = _0x633906;
        return this;
      }
      mapRows(_0x4508b6) {
        if (typeof _0x4508b6 !== "function") {
          throw new TypeError("mapperFn must be a function");
        }
        this.config.rowMapper = _0x4508b6;
        return this;
      }
      ignoreColumnIndexes(_0x7ad3cd) {
        this.config.indexesToIgnore = Array.isArray(_0x7ad3cd) ? [..._0x7ad3cd] : [..._0x7ad3cd];
        return this;
      }
      encoding(_0xa0dbd8) {
        this.config.encoding = _0xa0dbd8;
        return this;
      }
      getParserConfig() {
        return new _0x57a0ba(this.config);
      }
    };
    _0x570953.exports = _0x27864d;
  }
});
var require_csvToJson = __commonJS({
  "../work/iuccio__csvToJson/src/csvToJson.js"(_0x562df1, _0x433d8a) {
    'use strict';

    var _0x5ae9d8 = require_fileUtils();
    var _0x5bf85a = require_stringUtils();
    var _0x499e7e = require_jsonUtils();
    var {
      ConfigurationError: _0x14258b,
      CsvFormatError: _0x3eec5a,
      JsonValidationError: _0x42437b
    } = require_errors();
    var _0x544b0c = require_configurable();
    var _0x3a183a = require_parserConfig();
    var _0x7777d6 = ",";
    var _0x3931c0 = "\"";
    var _0x2e3858 = "\r\n";
    var _0x4550ca = "\n";
    var _0x9935b3 = "\r";
    var _0x15f6d8 = class extends _0x544b0c {
      csvToJsonWithConfig(_0x167441, _0x4d2482) {
        this.validateInputConfig(_0x4d2482);
        const _0x41f19e = this.parseRecords(_0x167441);
        const _0x5d9a8e = this.getFieldDelimiter(_0x4d2482);
        let _0x8b00e5 = this.getIndexHeader(_0x4d2482);
        let _0x5b7d92;
        while (_0x8b00e5 < _0x41f19e.length) {
          _0x5b7d92 = this.getFields(_0x41f19e[_0x8b00e5], _0x4d2482, _0x5d9a8e);
          if (_0x5bf85a.hasContent(_0x5b7d92)) {
            break;
          }
          _0x8b00e5++;
        }
        if (!_0x5b7d92) {
          throw _0x3eec5a.missingHeader();
        }
        const _0x212e55 = [];
        for (let _0x209727 = _0x8b00e5 + 1; _0x209727 < _0x41f19e.length; _0x209727++) {
          const _0x167ddc = this.getFields(_0x41f19e[_0x209727], _0x4d2482, _0x5d9a8e);
          if (_0x5bf85a.hasContent(_0x167ddc)) {
            let _0x1600ee = this.buildJsonResult(_0x5b7d92, _0x167ddc, _0x4d2482);
            if (_0x4d2482.rowMapper) {
              _0x1600ee = _0x4d2482.rowMapper(_0x1600ee, _0x209727 - (_0x8b00e5 + 1));
              if (_0x1600ee != null) {
                _0x212e55.push(_0x1600ee);
              }
            } else {
              _0x212e55.push(_0x1600ee);
            }
          }
        }
        return _0x212e55;
      }
      generateJsonFileFromCsv(_0x54e63a, _0x386417) {
        let _0x1874ea = this.getJsonFromCsvStringified(_0x54e63a);
        _0x5ae9d8.writeFile(_0x1874ea, _0x386417);
      }
      getJsonFromCsvStringified(_0x499fa7) {
        let _0x121ea1 = this.getJsonFromCsv(_0x499fa7);
        let _0x1036c1 = JSON.stringify(_0x121ea1, undefined, 1);
        _0x499e7e.validateJson(_0x1036c1);
        return _0x1036c1;
      }
      getJsonFromCsv(_0x545578) {
        const _0x492f5e = this.getParserConfig();
        const _0x4b3416 = _0x5ae9d8.readFile(_0x545578, _0x492f5e.encoding || "utf8");
        return this.csvToJson(_0x4b3416);
      }
      csvStringToJson(_0x3d7809) {
        return this.csvToJson(_0x3d7809);
      }
      csvStringToJsonStringified(_0x22399e) {
        let _0x1d9c00 = this.csvStringToJson(_0x22399e);
        let _0x439cb0 = JSON.stringify(_0x1d9c00, undefined, 1);
        _0x499e7e.validateJson(_0x439cb0);
        return _0x439cb0;
      }
      csvToJson(_0x12ba4f) {
        return this.csvToJsonWithConfig(_0x12ba4f, this.getParserConfig());
      }
      parseRecords(_0x38370d) {
        let _0x2eb64d = [];
        let _0x2bdb96 = "";
        let _0x3a98e0 = false;
        let _0x5eae92 = 0;
        while (_0x5eae92 < _0x38370d.length) {
          let _0x12c995 = _0x38370d[_0x5eae92];
          if (_0x12c995 === _0x3931c0) {
            if (_0x3a98e0 && _0x5eae92 + 1 < _0x38370d.length && _0x38370d[_0x5eae92 + 1] === _0x3931c0) {
              _0x2bdb96 += _0x3931c0 + _0x3931c0;
              _0x5eae92 += 2;
            } else {
              _0x3a98e0 = !_0x3a98e0;
              _0x2bdb96 += _0x12c995;
              _0x5eae92++;
            }
            continue;
          }
          if (!_0x3a98e0) {
            let _0x45d3f6 = this.getLineEndingLength(_0x38370d, _0x5eae92);
            if (_0x45d3f6 > 0) {
              _0x2eb64d.push(_0x2bdb96);
              _0x2bdb96 = "";
              _0x5eae92 += _0x45d3f6;
              continue;
            }
          }
          _0x2bdb96 += _0x12c995;
          _0x5eae92++;
        }
        if (_0x2bdb96.length > 0) {
          _0x2eb64d.push(_0x2bdb96);
        }
        if (_0x3a98e0) {
          throw _0x3eec5a.mismatchedQuotes("CSV");
        }
        return _0x2eb64d;
      }
      getLineEndingLength(_0x1c2a08, _0x48fe31) {
        if (_0x1c2a08.slice(_0x48fe31, _0x48fe31 + 2) === _0x2e3858) {
          return 2;
        }
        if (_0x1c2a08[_0x48fe31] === _0x4550ca) {
          return 1;
        }
        if (_0x1c2a08[_0x48fe31] === _0x9935b3 && _0x1c2a08[_0x48fe31 + 1] !== _0x4550ca) {
          return 1;
        }
        return 0;
      }
      getFieldDelimiter(_0x1cf9c6 = this.config) {
        if (_0x1cf9c6.delimiter) {
          return _0x1cf9c6.delimiter;
        }
        return _0x7777d6;
      }
      getIndexHeader(_0x2d42b8 = this.config) {
        if (_0x2d42b8.indexHeaderValue !== null && !isNaN(_0x2d42b8.indexHeaderValue)) {
          return _0x2d42b8.indexHeaderValue;
        }
        return 0;
      }
      getFields(_0x403c53, _0x2e350f = this.config, _0x206573 = this.getFieldDelimiter(_0x2e350f)) {
        if (_0x2e350f.isSupportQuotedField) {
          return this.split(_0x403c53, _0x2e350f);
        }
        return _0x403c53.split(_0x206573);
      }
      buildJsonResult(_0x394752, _0x3c497f, _0x51c1fb = this.config) {
        let _0x26dc11 = {};
        const _0x1f72be = _0x51c1fb.indexesToIgnore ? new Set(_0x51c1fb.indexesToIgnore) : new Set();
        for (let _0x886202 = 0; _0x886202 < _0x394752.length; _0x886202++) {
          if (_0x1f72be.has(_0x886202)) {
            continue;
          }
          let _0x5b3c26 = _0x5bf85a.trimPropertyName(_0x51c1fb.isTrimHeaderFieldWhiteSpace, _0x394752[_0x886202]);
          let _0x259079 = _0x3c497f[_0x886202];
          if (this.isParseSubArray(_0x259079, _0x51c1fb)) {
            _0x259079 = this.buildJsonSubArray(_0x259079, _0x51c1fb);
          }
          if (_0x51c1fb.printValueFormatByType && !Array.isArray(_0x259079)) {
            _0x259079 = _0x5bf85a.getValueFormatByType(_0x3c497f[_0x886202]);
          }
          _0x26dc11[_0x5b3c26] = _0x259079;
        }
        return _0x26dc11;
      }
      buildJsonSubArray(_0x50beb6, _0x1b99ea = this.config) {
        let _0x2ac296 = _0x50beb6.substring(_0x50beb6.indexOf(_0x1b99ea.parseSubArrayDelimiter) + 1, _0x50beb6.lastIndexOf(_0x1b99ea.parseSubArrayDelimiter));
        _0x2ac296.trim();
        _0x50beb6 = _0x2ac296.split(_0x1b99ea.parseSubArraySeparator);
        if (_0x1b99ea.printValueFormatByType) {
          for (let _0x168aca = 0; _0x168aca < _0x50beb6.length; _0x168aca++) {
            _0x50beb6[_0x168aca] = _0x5bf85a.getValueFormatByType(_0x50beb6[_0x168aca]);
          }
        }
        return _0x50beb6;
      }
      isParseSubArray(_0xe57f88, _0x153570 = this.config) {
        if (_0x153570.parseSubArrayDelimiter) {
          if (_0xe57f88 && _0xe57f88.indexOf(_0x153570.parseSubArrayDelimiter) === 0 && _0xe57f88.lastIndexOf(_0x153570.parseSubArrayDelimiter) === _0xe57f88.length - 1) {
            return true;
          }
        }
        return false;
      }
      validateInputConfig(_0x3b73cb = this.config) {
        if (_0x3b73cb.isSupportQuotedField) {
          if (this.getFieldDelimiter(_0x3b73cb) === "\"") {
            throw _0x14258b.quotedFieldConflict("fieldDelimiter", "\"");
          }
          if (_0x3b73cb.parseSubArraySeparator === "\"") {
            throw _0x14258b.quotedFieldConflict("parseSubArraySeparator", "\"");
          }
          if (_0x3b73cb.parseSubArrayDelimiter === "\"") {
            throw _0x14258b.quotedFieldConflict("parseSubArrayDelimiter", "\"");
          }
        }
      }
      hasQuotes(_0x4d357a) {
        return _0x4d357a.includes("\"");
      }
      split(_0x31d143, _0x5ae495 = this.config) {
        if (_0x31d143.length === 0) {
          return [];
        }
        let _0x577351 = [];
        let _0x4818af = "";
        let _0x4f281f = false;
        let _0x2c1b98 = this.getFieldDelimiter(_0x5ae495);
        for (let _0x26a27d = 0; _0x26a27d < _0x31d143.length; _0x26a27d++) {
          let _0x8f70d1 = _0x31d143[_0x26a27d];
          if (_0x8f70d1 === _0x3931c0) {
            if (this.isEscapedQuote(_0x31d143, _0x26a27d, _0x4f281f)) {
              _0x4818af += _0x3931c0;
              _0x26a27d++;
            } else if (this.isEmptyQuotedField(_0x31d143, _0x26a27d, _0x4f281f, _0x4818af, _0x2c1b98)) {
              _0x26a27d++;
            } else {
              _0x4f281f = !_0x4f281f;
            }
          } else if (_0x8f70d1 === _0x2c1b98 && !_0x4f281f) {
            _0x577351.push(_0x4818af);
            _0x4818af = "";
          } else {
            _0x4818af += _0x8f70d1;
          }
        }
        _0x577351.push(_0x4818af);
        if (_0x4f281f) {
          throw _0x3eec5a.mismatchedQuotes("row");
        }
        return _0x577351;
      }
      isEscapedQuote(_0x5a760e, _0x52323d, _0x572b47) {
        return _0x572b47 && _0x52323d + 1 < _0x5a760e.length && _0x5a760e[_0x52323d + 1] === _0x3931c0;
      }
      isEmptyQuotedField(_0x15580b, _0x31f5b4, _0x3c1c71, _0x2e8832, _0xef9f42) {
        if (_0x3c1c71 || _0x2e8832 !== "" || _0x31f5b4 + 1 >= _0x15580b.length) {
          return false;
        }
        let _0x4aec4d = _0x15580b[_0x31f5b4 + 1];
        if (_0x4aec4d !== _0x3931c0) {
          return false;
        }
        let _0x386b51 = _0x31f5b4 + 2;
        return _0x386b51 === _0x15580b.length || _0x15580b[_0x386b51] === _0xef9f42;
      }
    };
    _0x433d8a.exports = new _0x15f6d8();
    _0x433d8a.exports.CsvToJson = _0x15f6d8;
  }
});
var require_streamProcessor = __commonJS({
  "../work/iuccio__csvToJson/src/core/streamProcessor.js"(_0x34bc8f, _0x528103) {
    'use strict';

    var _0x4b32a6 = require_stringUtils();
    var _0x31b55c = "\"";
    var _0x1cba5b = "\r\n";
    var _0x3a6420 = "\n";
    var _0x54ea53 = "\r";
    var _0x3b5980 = class {
      constructor(_0x1b371d, _0x2761d6 = {}) {
        this.csvConfig = _0x1b371d;
        this.isBrowser = _0x2761d6.isBrowser || typeof window !== "undefined" && typeof document !== "undefined";
        this.buffer = "";
        this.isInsideQuotes = false;
        this.headers = null;
        this.headerRowIndex = _0x1b371d.indexHeaderValue !== null && !isNaN(_0x1b371d.indexHeaderValue) ? _0x1b371d.indexHeaderValue : 0;
        this.currentRecordIndex = 0;
        this.parsedRecords = [];
        this.dataRowIndex = 0;
        this.ignoredIndexes = new Set(_0x1b371d.indexesToIgnore || []);
        this.chunkSize = _0x2761d6.chunkSize || 1000;
        this.onChunk = _0x2761d6.onChunk;
        this.onComplete = _0x2761d6.onComplete;
        this.onError = _0x2761d6.onError;
        this.allRecords = [];
      }
      processChunk(_0x53fd8a) {
        let _0x4ff713;
        if (typeof _0x53fd8a === "string") {
          _0x4ff713 = _0x53fd8a;
        } else if (this.isBrowser && typeof globalThis.TextDecoder !== "undefined") {
          _0x4ff713 = new globalThis.TextDecoder().decode(_0x53fd8a);
        } else if (this.isBrowser) {
          _0x4ff713 = String.fromCharCode.apply(null, new Uint8Array(_0x53fd8a));
        } else {
          _0x4ff713 = _0x53fd8a.toString();
        }
        this.buffer += _0x4ff713;
        this._processCompleteRecords();
      }
      async processStreamWithCallbacks(_0x147e1b) {
        return new Promise((_0x1abcad, _0x4dd1d2) => {
          if (this.isBrowser) {
            if (!_0x147e1b || typeof _0x147e1b.getReader !== "function") {
              const _0x58927c = new Error("Invalid ReadableStream provided");
              if (this.onError) {
                this.onError(_0x58927c);
              }
              _0x4dd1d2(_0x58927c);
              return;
            }
            const _0x56feea = _0x147e1b.getReader();
            const _0x29f627 = async () => {
              try {
                while (true) {
                  const {
                    done: _0x2818a3,
                    value: _0x58d617
                  } = await _0x56feea.read();
                  if (_0x2818a3) {
                    this.finalizeProcessing();
                    this._sendRemainingChunks();
                    if (this.onComplete) {
                      this.onComplete(this.allRecords);
                    }
                    _0x1abcad();
                    return;
                  }
                  this.processChunk(_0x58d617);
                  this._sendPendingChunks();
                }
              } catch (_0x1f23be) {
                if (this.onError) {
                  this.onError(_0x1f23be);
                }
                _0x4dd1d2(_0x1f23be);
              }
            };
            _0x29f627();
          } else {
            if (!_0x147e1b || typeof _0x147e1b.pipe !== "function") {
              const _0x2558c8 = new Error("Invalid Readable stream provided");
              if (this.onError) {
                this.onError(_0x2558c8);
              }
              _0x4dd1d2(_0x2558c8);
              return;
            }
            _0x147e1b.on("data", _0x4bdcea => {
              try {
                this.processChunk(_0x4bdcea);
                this._sendPendingChunks();
              } catch (_0x41f39c) {
                if (this.onError) {
                  this.onError(_0x41f39c);
                }
                _0x4dd1d2(_0x41f39c);
              }
            });
            _0x147e1b.on("end", () => {
              try {
                this.finalizeProcessing();
                this._sendRemainingChunks();
                if (this.onComplete) {
                  this.onComplete(this.allRecords);
                }
                _0x1abcad();
              } catch (_0x3a9692) {
                if (this.onError) {
                  this.onError(_0x3a9692);
                }
                _0x4dd1d2(_0x3a9692);
              }
            });
            _0x147e1b.on("error", _0x3c530c => {
              if (this.onError) {
                this.onError(_0x3c530c);
              }
              _0x4dd1d2(_0x3c530c);
            });
          }
        });
      }
      _sendPendingChunks() {
        if (!this.onChunk) {
          return;
        }
        while (this.parsedRecords.length >= this.chunkSize) {
          const _0x31ef0f = this.parsedRecords.splice(0, this.chunkSize);
          this.allRecords.push(..._0x31ef0f);
          this.onChunk(_0x31ef0f, this.allRecords.length, null);
        }
      }
      _sendRemainingChunks() {
        if (!this.onChunk || this.parsedRecords.length === 0) {
          return;
        }
        const _0x51e9fc = [...this.parsedRecords];
        this.parsedRecords.length = 0;
        this.allRecords.push(..._0x51e9fc);
        this.onChunk(_0x51e9fc, this.allRecords.length, this.allRecords.length);
      }
      async processStream(_0x1b1ebe) {
        return new Promise((_0x579040, _0x5e3381) => {
          if (this.isBrowser) {
            if (!_0x1b1ebe || typeof _0x1b1ebe.getReader !== "function") {
              _0x5e3381(new Error("Invalid ReadableStream provided"));
              return;
            }
            const _0x130870 = _0x1b1ebe.getReader();
            const _0xfba22c = async () => {
              try {
                while (true) {
                  const {
                    done: _0x38c075,
                    value: _0x167a02
                  } = await _0x130870.read();
                  if (_0x38c075) {
                    this.finalizeProcessing();
                    _0x579040(this.getResult());
                    return;
                  }
                  this.processChunk(_0x167a02);
                }
              } catch (_0x89c33b) {
                _0x5e3381(_0x89c33b);
              }
            };
            _0xfba22c();
          } else {
            if (!_0x1b1ebe || typeof _0x1b1ebe.pipe !== "function") {
              _0x5e3381(new Error("Invalid Readable stream provided"));
              return;
            }
            _0x1b1ebe.on("data", _0x21c27f => {
              try {
                this.processChunk(_0x21c27f);
              } catch (_0x2833c1) {
                _0x5e3381(_0x2833c1);
              }
            });
            _0x1b1ebe.on("end", () => {
              try {
                this.finalizeProcessing();
                _0x579040(this.getResult());
              } catch (_0x1a256b) {
                _0x5e3381(_0x1a256b);
              }
            });
            _0x1b1ebe.on("error", _0xb98597 => {
              _0x5e3381(_0xb98597);
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
        const _0x4b7fe2 = this._parseRecordsFromBuffer(this.buffer, this.isInsideQuotes);
        this.buffer = _0x4b7fe2.remainingBuffer;
        this.isInsideQuotes = _0x4b7fe2.isInsideQuotes;
        for (const _0x51fa72 of _0x4b7fe2.completeRecords) {
          this._processRecord(_0x51fa72);
          this.currentRecordIndex++;
        }
      }
      _processRemainingBuffer() {
        if (this.buffer.length > 0) {
          if (this.isInsideQuotes) {
            throw CsvFormatError.mismatchedQuotes("CSV stream");
          }
          const _0x23c38a = this._parseRecordsFromBuffer(this.buffer + "\n", false);
          for (const _0xaa85db of _0x23c38a.completeRecords) {
            this._processRecord(_0xaa85db);
            this.currentRecordIndex++;
          }
        }
      }
      _processRecord(_0xa08297) {
        if (this.headers === null && this.currentRecordIndex === this.headerRowIndex) {
          this._processHeaderRecord(_0xa08297);
        } else if (this.headers !== null) {
          this._processDataRecord(_0xa08297);
        }
      }
      _processHeaderRecord(_0x323be9) {
        const _0x5b0c5f = this._splitRecord(_0x323be9);
        if (_0x4b32a6.hasContent(_0x5b0c5f)) {
          this.headers = _0x5b0c5f;
        }
      }
      _processDataRecord(_0x3d6182) {
        const _0x4a3bc8 = this._splitRecord(_0x3d6182);
        if (_0x4b32a6.hasContent(_0x4a3bc8)) {
          const _0x581909 = this._buildJsonResult(this.headers, _0x4a3bc8);
          const _0x12d216 = this._applyRowMapper(_0x581909);
          if (_0x12d216 !== null) {
            this.parsedRecords.push(_0x12d216);
          }
        }
      }
      _applyRowMapper(_0x540156) {
        if (this.csvConfig.rowMapper) {
          const _0x2fb60e = this.csvConfig.rowMapper(_0x540156, this.dataRowIndex);
          this.dataRowIndex++;
          return _0x2fb60e;
        }
        this.dataRowIndex++;
        return _0x540156;
      }
      _splitRecord(_0x15b229) {
        if (this.csvConfig.isSupportQuotedField) {
          return this._splitWithConfig(_0x15b229, this.csvConfig);
        }
        return _0x15b229.split(this.csvConfig.delimiter || ",");
      }
      _splitWithConfig(_0x1fa1a4, _0x48661f) {
        if (_0x1fa1a4.length === 0) {
          return [];
        }
        const _0x5bfece = [];
        let _0x24b15b = "";
        let _0x23f353 = false;
        const _0x32afde = _0x48661f.delimiter || ",";
        for (let _0xc236d5 = 0; _0xc236d5 < _0x1fa1a4.length; _0xc236d5++) {
          const _0x1a9969 = _0x1fa1a4[_0xc236d5];
          if (_0x1a9969 === _0x31b55c) {
            if (_0x23f353 && _0xc236d5 + 1 < _0x1fa1a4.length && _0x1fa1a4[_0xc236d5 + 1] === _0x31b55c) {
              _0x24b15b += _0x31b55c;
              _0xc236d5++;
            } else {
              _0x23f353 = !_0x23f353;
            }
          } else if (_0x1a9969 === _0x32afde && !_0x23f353) {
            _0x5bfece.push(_0x24b15b);
            _0x24b15b = "";
          } else {
            _0x24b15b += _0x1a9969;
          }
        }
        _0x5bfece.push(_0x24b15b);
        if (_0x23f353) {
          throw CsvFormatError.mismatchedQuotes("row");
        }
        return _0x5bfece;
      }
      _buildJsonResult(_0x36566b, _0x3f9cf8) {
        const _0x2cc78e = {};
        for (let _0x1e2e06 = 0; _0x1e2e06 < _0x36566b.length; _0x1e2e06++) {
          if (this.ignoredIndexes.has(_0x1e2e06)) {
            continue;
          }
          const _0x2a360b = _0x4b32a6.trimPropertyName(this.csvConfig.isTrimHeaderFieldWhiteSpace, _0x36566b[_0x1e2e06]);
          let _0x16ef87 = _0x3f9cf8[_0x1e2e06];
          if (this._isParseSubArray(_0x16ef87)) {
            _0x16ef87 = this._buildJsonSubArray(_0x16ef87);
          }
          if (this.csvConfig.printValueFormatByType && !Array.isArray(_0x16ef87)) {
            _0x16ef87 = _0x4b32a6.getValueFormatByType(_0x3f9cf8[_0x1e2e06]);
          }
          _0x2cc78e[_0x2a360b] = _0x16ef87;
        }
        return _0x2cc78e;
      }
      _isParseSubArray(_0x2fe3a3) {
        if (this.csvConfig.parseSubArrayDelimiter) {
          return _0x2fe3a3 && _0x2fe3a3.indexOf(this.csvConfig.parseSubArrayDelimiter) === 0 && _0x2fe3a3.lastIndexOf(this.csvConfig.parseSubArrayDelimiter) === _0x2fe3a3.length - 1;
        }
        return false;
      }
      _buildJsonSubArray(_0x40685f) {
        const _0x22eaa9 = _0x40685f.substring(_0x40685f.indexOf(this.csvConfig.parseSubArrayDelimiter) + 1, _0x40685f.lastIndexOf(this.csvConfig.parseSubArrayDelimiter));
        const _0x33aa3e = _0x22eaa9.split(this.csvConfig.parseSubArraySeparator);
        if (this.csvConfig.printValueFormatByType) {
          for (let _0x572819 = 0; _0x572819 < _0x33aa3e.length; _0x572819++) {
            _0x33aa3e[_0x572819] = _0x4b32a6.getValueFormatByType(_0x33aa3e[_0x572819]);
          }
        }
        return _0x33aa3e;
      }
      _parseRecordsFromBuffer(_0x532695, _0x3ebc47) {
        const _0x44daa8 = [];
        let _0x535bfe = "";
        let _0x72ff44 = 0;
        while (_0x72ff44 < _0x532695.length) {
          const _0x53aeba = _0x532695[_0x72ff44];
          if (_0x53aeba === _0x31b55c) {
            const _0x5ebd58 = this._handleEscapedQuote(_0x532695, _0x72ff44, _0x3ebc47);
            if (_0x5ebd58.wasEscaped) {
              _0x535bfe += _0x31b55c + _0x31b55c;
              _0x72ff44 = _0x5ebd58.newIndex;
              continue;
            } else {
              _0x3ebc47 = !_0x3ebc47;
            }
          } else if (!_0x3ebc47 && this._isLineEnding(_0x532695, _0x72ff44)) {
            const _0x4a4cf7 = this._getLineEndingLength(_0x532695, _0x72ff44);
            _0x44daa8.push(_0x535bfe);
            _0x535bfe = "";
            _0x72ff44 += _0x4a4cf7;
            continue;
          }
          _0x535bfe += _0x53aeba;
          _0x72ff44++;
        }
        const _0x5aa7d9 = {
          completeRecords: _0x44daa8,
          remainingBuffer: _0x535bfe,
          isInsideQuotes: _0x3ebc47
        };
        return _0x5aa7d9;
      }
      _handleEscapedQuote(_0x439d6b, _0x2e6f44, _0x11197f) {
        if (_0x11197f && _0x2e6f44 + 1 < _0x439d6b.length && _0x439d6b[_0x2e6f44 + 1] === _0x31b55c) {
          return {
            wasEscaped: true,
            newIndex: _0x2e6f44 + 2
          };
        }
        return {
          wasEscaped: false,
          newIndex: _0x2e6f44 + 1
        };
      }
      _isLineEnding(_0x249801, _0x4937b3) {
        return this._getLineEndingLength(_0x249801, _0x4937b3) > 0;
      }
      _getLineEndingLength(_0x4bb39b, _0x389307) {
        if (_0x4bb39b.slice(_0x389307, _0x389307 + 2) === _0x1cba5b) {
          return 2;
        }
        if (_0x4bb39b[_0x389307] === _0x3a6420) {
          return 1;
        }
        if (_0x4bb39b[_0x389307] === _0x54ea53 && _0x4bb39b[_0x389307 + 1] !== _0x3a6420) {
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
    _0x528103.exports = _0x3b5980;
  }
});
var fileUtils = require_fileUtils();
var csvToJson = require_csvToJson();
var Configurable = require_configurable();
var {
  InputValidationError
} = require_errors();
var StreamProcessor = require_streamProcessor();
const _0x3bfabd = {
  raw: true
};
var CsvToJsonAsync = class extends Configurable {
  constructor() {
    super();
    this.csvToJson = csvToJson;
  }
  async generateJsonFileFromCsv(_0x23bc1b, _0x46194d) {
    const _0x28cd38 = await this.getJsonFromCsvStringified(_0x23bc1b);
    await fileUtils.writeFileAsync(_0x28cd38, _0x46194d);
  }
  async getJsonFromCsvStringified(_0x2b2dcb) {
    const _0x4663cf = await this.getJsonFromCsvAsync(_0x2b2dcb);
    return JSON.stringify(_0x4663cf, undefined, 1);
  }
  async getJsonFromCsvAsync(_0x21bf43, _0x1d66ee = {}) {
    if (_0x21bf43 === null || _0x21bf43 === undefined) {
      throw new InputValidationError("inputFileNameOrCsv", "string (file path) or CSV string content", "" + typeof _0x21bf43, "Either provide a valid file path or CSV content as a string.");
    }
    const _0x4b0cd8 = this.getParserConfig();
    if (_0x1d66ee.raw) {
      if (_0x21bf43 === "") {
        return [];
      }
      return this.csvToJson.csvToJsonWithConfig(_0x21bf43, _0x4b0cd8);
    }
    const _0x510cbf = await fileUtils.readFileAsync(_0x21bf43, _0x4b0cd8.encoding || "utf8");
    return this.csvToJson.csvToJsonWithConfig(_0x510cbf, _0x4b0cd8);
  }
  csvStringToJsonAsync(_0x55d021, _0x44045c = _0x3bfabd) {
    return this.getJsonFromCsvAsync(_0x55d021, _0x44045c);
  }
  async getJsonFromStreamAsync(_0x572a49) {
    this._validateStream(_0x572a49);
    const _0x59bcc5 = this.getParserConfig();
    const _0x439a07 = new StreamProcessor(_0x59bcc5, {
      isBrowser: false
    });
    return _0x439a07.processStream(_0x572a49);
  }
  _validateStream(_0x417d8a) {
    if (!_0x417d8a || typeof _0x417d8a.pipe !== "function") {
      throw new InputValidationError("stream", "Readable stream", typeof _0x417d8a, "Provide a valid Node.js Readable stream.");
    }
  }
  async getJsonFromFileStreamingAsync(_0x4973df) {
    if (!_0x4973df || typeof _0x4973df !== "string") {
      throw new InputValidationError("filePath", "string (file path)", typeof _0x4973df, "Provide a valid file path as a string.");
    }
    const _0x170cbf = require("fs");
    const _0x509c7c = this.getParserConfig();
    const _0x2061fd = typeof _0x509c7c.encoding === "string" ? _0x509c7c.encoding : "utf8";
    const _0x2e25e3 = {
      encoding: _0x2061fd
    };
    const _0x393125 = _0x170cbf.createReadStream(_0x4973df, _0x2e25e3);
    return this.getJsonFromStreamAsync(_0x393125);
  }
};
module.exports = new CsvToJsonAsync();