'use strict';

var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (_0x40f708, _0x5cb286) => function _0x20db50() {
  if (!_0x5cb286) {
    (0, _0x40f708[__getOwnPropNames(_0x40f708)[0]])((_0x5cb286 = {
      exports: {}
    }).exports, _0x5cb286);
  }
  return _0x5cb286.exports;
};
var require_errors = __commonJS({
  "../work/iuccio__csvToJson/src/core/errors.js"(_0x5edf7b, _0xb3a43) {
    'use strict';

    var _0x50c6e6 = class extends Error {
      constructor(_0x3ca925, _0x4e9780, _0x379af3 = {}) {
        super(_0x3ca925);
        this.name = "CsvParsingError";
        this.code = _0x4e9780;
        this.context = _0x379af3;
        Error.captureStackTrace(this, this.constructor);
      }
      toString() {
        let _0xa870fe = this.name + ": " + this.message;
        if (this.context && Object.keys(this.context).length > 0) {
          _0xa870fe += "\n\nContext:";
          Object.entries(this.context).forEach(([_0x510c08, _0x1ee01d]) => {
            _0xa870fe += "\n  " + _0x510c08 + ": " + this.formatValue(_0x1ee01d);
          });
        }
        return _0xa870fe;
      }
      formatValue(_0x3426e0) {
        if (_0x3426e0 === null) {
          return "null";
        }
        if (_0x3426e0 === undefined) {
          return "undefined";
        }
        if (typeof _0x3426e0 === "string") {
          return "\"" + _0x3426e0 + "\"";
        }
        if (typeof _0x3426e0 === "object") {
          return JSON.stringify(_0x3426e0);
        }
        return String(_0x3426e0);
      }
    };
    var _0x4d1f03 = class extends _0x50c6e6 {
      constructor(_0x4f0586, _0x4f2df6, _0x5265db, _0x419f64 = "") {
        const _0x6f56e1 = "Invalid input: Parameter '" + _0x4f0586 + "' is required.\nExpected: " + _0x4f2df6 + "\nReceived: " + _0x5265db + (_0x419f64 ? "\n" + _0x419f64 : "");
        var _0x1ae499 = {
          parameter: _0x4f0586,
          expectedType: _0x4f2df6,
          receivedType: _0x5265db
        };
        super(_0x6f56e1, "INPUT_VALIDATION_ERROR", _0x1ae499);
        this.name = "InputValidationError";
      }
    };
    var _0x10a9af = class _0x17a8a7 extends _0x50c6e6 {
      constructor(_0x227fdf, _0x392e25 = {}) {
        super(_0x227fdf, "CONFIGURATION_ERROR", _0x392e25);
        this.name = "ConfigurationError";
      }
      static quotedFieldConflict(_0x27460f, _0x3c22b5) {
        return new _0x17a8a7("Configuration conflict: supportQuotedField() is enabled, but " + _0x27460f + " is set to '" + _0x3c22b5 + "'.\nThe quote character (\") cannot be used as a field delimiter, separator, or sub-array delimiter when quoted field support is active.\n\nSolutions:\n  1. Use a different character for " + _0x27460f + " (e.g., '|', '\\t', ';')\n  2. Disable supportQuotedField() if your CSV doesn't contain quoted fields\n  3. Refer to RFC 4180 for proper CSV formatting: https://tools.ietf.org/html/rfc4180", {
          optionName: _0x27460f,
          value: _0x3c22b5,
          conflictingOption: "supportQuotedField"
        });
      }
      static invalidHeaderIndex(_0x587648) {
        return new _0x17a8a7("Invalid configuration: indexHeader() expects a numeric value.\nReceived: " + typeof _0x587648 + " (" + _0x587648 + ")\n\nSolutions:\n  1. Ensure indexHeader() receives a number: indexHeader(0), indexHeader(1), etc.\n  2. Headers are typically found on row 0 (first line)\n  3. Use indexHeader(2) if headers are on the 3rd line", {
          parameterName: "indexHeader",
          value: _0x587648,
          type: typeof _0x587648
        });
      }
    };
    var _0x4dac8c = class _0x463789 extends _0x50c6e6 {
      constructor(_0x4a12f4, _0x342dad = {}) {
        super(_0x4a12f4, "CSV_FORMAT_ERROR", _0x342dad);
        this.name = "CsvFormatError";
      }
      static missingHeader() {
        return new _0x463789("CSV parsing error: No header row found.\nThe CSV file appears to be empty or has no valid header line.\n\nSolutions:\n  1. Ensure your CSV file contains at least one row (header row)\n  2. Verify the file is not empty or contains only whitespace\n  3. Check if you need to use indexHeader(n) to specify a non-standard header row\n  4. Refer to RFC 4180 for proper CSV format: https://tools.ietf.org/html/rfc4180");
      }
      static mismatchedQuotes(_0x5005ad = "CSV") {
        return new _0x463789("CSV parsing error: Mismatched quotes detected in " + _0x5005ad + ".\nA quoted field was not properly closed with a matching quote character.\n\nRFC 4180 rules for quoted fields:\n  • Fields containing delimiters or quotes MUST be enclosed in double quotes\n  • To include a quote within a quoted field, use two consecutive quotes: \"\"\n  • Example: \"Smith, John\" (name contains comma)\n  • Example: \"He said \"\"Hello\"\"\" (text contains quotes)\n\nSolutions:\n  1. Review your CSV for properly paired quote characters\n  2. Use double quotes (\"\") to escape quotes within quoted fields\n  3. Ensure all commas within field values are inside quotes\n  4. Enable supportQuotedField(true) if you're using quoted fields", {
          location: _0x5005ad
        });
      }
    };
    var _0x470fc0 = class extends _0x50c6e6 {
      constructor(_0x141fd4, _0x18974d, _0x2802e0) {
        const _0x1b22b1 = "File operation error: Failed to " + _0x141fd4 + " file.\nFile path: " + _0x18974d + "\nReason: " + _0x2802e0.message + "\n\nSolutions:\n  1. Verify the file path is correct: " + _0x18974d + "\n  2. Check file permissions (read access for input, write access for output)\n  3. Ensure the directory exists and is writable for output files\n  4. Verify the file is not in use by another process";
        var _0x397446 = {
          operation: _0x141fd4,
          filePath: _0x18974d,
          originalError: _0x2802e0.message
        };
        super(_0x1b22b1, "FILE_OPERATION_ERROR", _0x397446);
        this.name = "FileOperationError";
        this.originalError = _0x2802e0;
      }
    };
    var _0x38b04d = class extends _0x50c6e6 {
      constructor(_0x16df63, _0x6af42d) {
        const _0x46c1f9 = "JSON validation error: The parsed CSV data generated invalid JSON.\nThis typically indicates malformed field names or values in the CSV.\nOriginal error: " + _0x6af42d.message + "\n\nSolutions:\n  1. Check that field names are valid JavaScript identifiers (or will be converted safely)\n  2. Review the CSV data for special characters that aren't properly escaped\n  3. Enable supportQuotedField(true) for fields containing special characters\n  4. Verify that formatValueByType() isn't converting values incorrectly";
        super(_0x46c1f9, "JSON_VALIDATION_ERROR", {
          originalError: _0x6af42d.message,
          csvPreview: _0x16df63 ? _0x16df63.substring(0, 200) : "N/A"
        });
        this.name = "JsonValidationError";
        this.originalError = _0x6af42d;
      }
    };
    var _0x5923d1 = class _0x4404c8 extends _0x50c6e6 {
      constructor(_0x93c13d, _0x2b3e94 = {}) {
        super(_0x93c13d, "BROWSER_API_ERROR", _0x2b3e94);
        this.name = "BrowserApiError";
      }
      static fileReaderNotAvailable() {
        return new _0x4404c8("Browser compatibility error: FileReader API is not available.\nYour browser does not support the FileReader API required for file parsing.\n\nSolutions:\n  1. Use a modern browser that supports FileReader (Chrome 13+, Firefox 10+, Safari 6+)\n  2. Consider using csvStringToJson() or csvStringToJsonAsync() for string-based parsing\n  3. Implement a polyfill or alternative file reading method");
      }
      static parseFileError(_0x558de6) {
        return new _0x4404c8("Browser file parsing error: Failed to read and parse the file.\nError details: " + _0x558de6.message + "\n\nSolutions:\n  1. Verify the file is a valid CSV file\n  2. Check the file encoding (UTF-8 is recommended)\n  3. Try a smaller file to isolate the issue\n  4. Check browser console for additional error details", {
          originalError: _0x558de6.message
        });
      }
      static streamingNotSupported() {
        return new _0x4404c8("Browser compatibility error: ReadableStream API is not available.\nYour browser does not support the ReadableStream API required for streaming.\n\nSolutions:\n  1. Use a modern browser that supports ReadableStream (Chrome 43+, Firefox 65+, Safari 10.1+)\n  2. Use getJsonFromFileStreamingAsync() which falls back to regular file parsing\n  3. Consider using parseFile() for non-streaming file parsing\n  4. Implement a polyfill for ReadableStream support");
      }
    };
    var _0x30b454 = {
      CsvParsingError: _0x50c6e6,
      InputValidationError: _0x4d1f03,
      ConfigurationError: _0x10a9af,
      CsvFormatError: _0x4dac8c,
      FileOperationError: _0x470fc0,
      JsonValidationError: _0x38b04d,
      BrowserApiError: _0x5923d1
    };
    _0xb3a43.exports = _0x30b454;
  }
});
var fs = require("fs");
var {
  FileOperationError
} = require_errors();
var ENCODED_FILE_ENCODINGS = new Set(["base64", "hex"]);
var FileUtils = class {
  _isEncodedFile(_0x4d372f) {
    return ENCODED_FILE_ENCODINGS.has(_0x4d372f);
  }
  _decodeContent(_0x170e0a, _0x25625f) {
    if (this._isEncodedFile(_0x25625f)) {
      return Buffer.from(_0x170e0a, _0x25625f).toString("utf8");
    }
    return _0x170e0a;
  }
  _toString(_0xe7fe10) {
    if (typeof _0xe7fe10 === "string") {
      return _0xe7fe10;
    } else {
      return _0xe7fe10.toString();
    }
  }
  _wrapReadError(_0x48cfe8, _0x33431b) {
    return new FileOperationError("read", _0x48cfe8, _0x33431b);
  }
  _wrapWriteError(_0x3a16d7, _0x466b0c) {
    return new FileOperationError("write", _0x3a16d7, _0x466b0c);
  }
  _readFileSync(_0x36ff37, _0x417bb7) {
    if (this._isEncodedFile(_0x417bb7)) {
      const _0x14f4b3 = fs.readFileSync(_0x36ff37, "utf8");
      return this._decodeContent(_0x14f4b3, _0x417bb7);
    }
    return this._toString(fs.readFileSync(_0x36ff37, _0x417bb7));
  }
  readFile(_0x4f9302, _0x545526 = "utf8") {
    try {
      return this._readFileSync(_0x4f9302, _0x545526);
    } catch (_0x39f5de) {
      throw this._wrapReadError(_0x4f9302, _0x39f5de);
    }
  }
  _readFileAsyncWithPromises(_0x59d20e, _0x1604e9) {
    if (this._isEncodedFile(_0x1604e9)) {
      return fs.promises.readFile(_0x59d20e, "utf8").then(_0x3faf6b => this._decodeContent(_0x3faf6b, _0x1604e9));
    }
    return fs.promises.readFile(_0x59d20e, _0x1604e9).then(_0x2fe8c5 => this._toString(_0x2fe8c5));
  }
  readFileAsync(_0x389f4f, _0x3c0f0c = "utf8") {
    if (fs.promises && typeof fs.promises.readFile === "function") {
      return this._readFileAsyncWithPromises(_0x389f4f, _0x3c0f0c).catch(_0x38c7c1 => {
        throw this._wrapReadError(_0x389f4f, _0x38c7c1);
      });
    }
    return new Promise((_0x4f261e, _0x10d46a) => {
      const _0x256741 = (_0x432941, _0x20baca) => {
        if (_0x432941) {
          _0x10d46a(this._wrapReadError(_0x389f4f, _0x432941));
          return;
        }
        try {
          const _0x1d18d3 = this._isEncodedFile(_0x3c0f0c) ? this._decodeContent(this._toString(_0x20baca), _0x3c0f0c) : this._toString(_0x20baca);
          _0x4f261e(_0x1d18d3);
        } catch (_0x4156bd) {
          _0x10d46a(this._wrapReadError(_0x389f4f, _0x4156bd));
        }
      };
      const _0x29bb0f = this._isEncodedFile(_0x3c0f0c) ? "utf8" : _0x3c0f0c;
      fs.readFile(_0x389f4f, _0x29bb0f, _0x256741);
    });
  }
  _writeFileSync(_0x64b906, _0x14a29e) {
    fs.writeFileSync(_0x64b906, _0x14a29e, "utf8");
  }
  _writeFileAsyncWithPromises(_0x4a2205, _0x47e494) {
    return fs.promises.writeFile(_0x4a2205, _0x47e494, "utf8");
  }
  writeFile(_0xe06061, _0x3165ca) {
    try {
      this._writeFileSync(_0x3165ca, _0xe06061);
    } catch (_0x38ce98) {
      throw this._wrapWriteError(_0x3165ca, _0x38ce98);
    }
  }
  writeFileAsync(_0x39d403, _0x37cff1) {
    if (fs.promises && typeof fs.promises.writeFile === "function") {
      return this._writeFileAsyncWithPromises(_0x37cff1, _0x39d403).catch(_0x1cdbd4 => {
        throw this._wrapWriteError(_0x37cff1, _0x1cdbd4);
      });
    }
    return new Promise((_0x147627, _0x401887) => {
      fs.writeFile(_0x37cff1, _0x39d403, "utf8", _0x462281 => {
        if (_0x462281) {
          _0x401887(this._wrapWriteError(_0x37cff1, _0x462281));
          return;
        }
        _0x147627();
      });
    });
  }
};
module.exports = new FileUtils();