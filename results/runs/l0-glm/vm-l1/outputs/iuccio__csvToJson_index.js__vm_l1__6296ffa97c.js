'use strict';

const vm_0x5058ac = typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : void 0x0;
const vm_0x2c62b6_f426fd = vm_0x5058ac['vm_0x2c62b6_f426fd'] || (vm_0x5058ac['vm_0x2c62b6_f426fd'] = {});

(function() {
  if (!vm_0x2c62b6_f426fd['module']) try { vm_0x2c62b6_f426fd['module'] = module; } catch (e) {}
  if (!vm_0x2c62b6_f426fd['exports']) try { vm_0x2c62b6_f426fd['exports'] = exports; } catch (e) {}
  if (!vm_0x2c62b6_f426fd['require']) try { vm_0x2c62b6_f426fd['require'] = require; } catch (e) {}
  if (!vm_0x2c62b6_f426fd['__dirname']) try { vm_0x2c62b6_f426fd['__dirname'] = __dirname; } catch (e) {}
  if (!vm_0x2c62b6_f426fd['__filename']) try { vm_0x2c62b6_f426fd['__filename'] = __filename; } catch (e) {}
}());

// [VM Interpreter and Bytecode omitted for brevity - this is a massive VM-based obfuscation layer]
// The VM interprets bytecode to reconstruct and execute the original module logic.

// Reconstructed Module Structure based on VM bytecode analysis:

// require_errors module:
class CsvFormatError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CsvFormatError';
  }
}

// require_fileUtils module:
function generateJsonFileFromCsv(inputFileName, outputFileName) {
  if (!inputFileName) throw new Error('inputFileName is not defined!!!');
  if (!outputFileName) throw new Error('outputFileName is not defined!!!');
  // File generation logic
}

// require_stringUtils module:
function trimHeaderFieldWhiteSpace(value) {
  return value.trim();
}

// require_jsonUtils module:
function formatValueByType(value) {
  // Type formatting logic
}

// require_parserConfig module:
function applyConfigToAllClients(configFn) {
  // Apply config to all parser clients
}

// require_configurable module:
function supportQuotedField(value) {
  // Quoted field support
}

// require_csvToJson module:
class CsvToJson {
  constructor() {
    this.config = {};
  }
  
  formatValueByType(value) {
    // Format value by type
  }
  
  supportQuotedField(value) {
    // Support quoted field
  }
  
  customEncoding(encoding) {
    this.config.encoding = encoding;
  }
  
  trimHeaderFieldWhiteSpace(value) {
    // Trim header field whitespace
  }
  
  fieldDelimiter(delimiter) {
    this.config.delimiter = delimiter;
  }
  
  parseSubArray(start, end) {
    // Parse sub array
  }
  
  ignoreColumnIndexes(indexes) {
    this.config.ignoreIndexes = indexes;
  }
  
  indexHeader(value) {
    this.config.indexHeader = value;
  }
  
  generateJsonFileFromCsv(input, output) {
    // Generate JSON file from CSV
  }
  
  getJsonFromCsv(csvString) {
    if (!csvString) throw new Error('csvString is not defined!!!');
    // Parse CSV to JSON
  }
  
  csvStringToJson(csvString) {
    if (csvString === void 0 || csvString === null) throw new Error('csvString is not defined!!!');
    // Convert CSV string to JSON
  }
  
  csvStringToJsonStringified(csvString) {
    // Convert CSV string to stringified JSON
  }
}

// require_streamProcessor module:
function getJsonFromStreamAsync(stream, options) {
  // Stream processing
}

// require_csvToJsonAsync module:
class CsvToJsonAsync {
  getJsonFromCsvAsync(csvString, options) {
    // Async CSV to JSON
  }
  
  getJsonFromFileStreamingAsync(filePath, options) {
    // Async file streaming
  }
  
  csvStringToJsonStringifiedAsync(csvString) {
    // Async stringified JSON
  }
  
  generateJsonFileFromCsvAsync(input, output) {
    // Async file generation
  }
  
  getJsonFromStreamAsync(stream, options) {
    // Async stream processing
  }
}

// require_browserApi module:
function browser() {
  // Browser API setup
}

// Main exports
const csvToJson = new CsvToJson();
const csvToJsonAsync = new CsvToJsonAsync();

const encodingOps = {
  'utf8': 'utf8',
  'ucs2': 'ucs2',
  'utf16le': 'utf16le',
  'latin1': 'latin1',
  'ascii': 'ascii',
  'base64': 'base64',
  'hex': 'hex'
};

function applyConfigToAllClients(configFn) {
  configFn(csvToJson);
  configFn(csvToJsonAsync);
}

exports.formatValueByType = function(value = true) {
  return applyConfigToAllClients(client => client.formatValueByType(value));
};

exports.supportQuotedField = function(value = false) {
  return applyConfigToAllClients(client => client.supportQuotedField(value));
};

exports.customEncoding = function(encoding) {
  return applyConfigToAllClients(client => client.customEncoding(encoding));
};

exports.trimHeaderFieldWhiteSpace = function(value = false) {
  return applyConfigToAllClients(client => client.trimHeaderFieldWhiteSpace(value));
};

exports.fieldDelimiter = function(delimiter) {
  return applyConfigToAllClients(client => client.fieldDelimiter(delimiter));
};

exports.parseSubArray = function(start, end) {
  return applyConfigToAllClients(client => client.parseSubArray(start, end));
};

exports.ignoreColumnIndexes = function(indexes) {
  if (!Array.isArray(indexes)) throw new TypeError('indexes must be an array of numbers');
  if (!indexes.every(idx => Number.isInteger(idx) && idx >= 0)) throw new TypeError('All elements in indexes must be valid non-negative numbers (>= 0)');
  return applyConfigToAllClients(client => client.ignoreColumnIndexes(indexes));
};

exports.indexHeader = function(value) {
  return applyConfigToAllClients(client => client.indexHeader(value));
};

exports.utf8Encoding = function utf8Encoding() {
  return applyConfigToAllClients(client => client.customEncoding(encodingOps.utf8));
};

exports.utf16leEncoding = function() {
  return applyConfigToAllClients(client => client.customEncoding(encodingOps.utf16le));
};

exports.latin1Encoding = function() {
  return applyConfigToAllClients(client => client.customEncoding(encodingOps.latin1));
};

exports.asciiEncoding = function() {
  return applyConfigToAllClients(client => client.customEncoding(encodingOps.ascii));
};

exports.base64Encoding = function() {
  return applyConfigToAllClients(client => client.customEncoding(encodingOps.base64));
};

exports.hexEncoding = function() {
  return applyConfigToAllClients(client => client.customEncoding(encodingOps.hex));
};

exports.generateJsonFileFromCsv = function(inputFileName, outputFileName) {
  if (!inputFileName) throw new Error('inputFileName is not defined!!!');
  if (!outputFileName) throw new Error('outputFileName is not defined!!!');
  csvToJson.generateJsonFileFromCsv(inputFileName, outputFileName);
};

exports.getJsonFromCsv = function(csvString) {
  if (!csvString) throw new Error('csvString is not defined!!!');
  return csvToJson.getJsonFromCsv(csvString);
};

exports.getJsonFromCsvAsync = function(csvString, options) {
  return csvToJsonAsync.getJsonFromCsvAsync(csvString, options);
};

exports.getJsonFromFileStreamingAsync = function(filePath, options) {
  return csvToJsonAsync.getJsonFromFileStreamingAsync(filePath, options);
};

exports.csvStringToJsonStringifiedAsync = function(csvString) {
  return csvToJsonAsync.csvStringToJsonStringifiedAsync(csvString);
};

exports.generateJsonFileFromCsvAsync = function(input, output) {
  return csvToJsonAsync.generateJsonFileFromCsvAsync(input, output);
};

exports.getJsonFromStreamAsync = function(stream) {
  return csvToJsonAsync.getJsonFromStreamAsync(stream);
};

exports.csvStringToJsonStringified = function(csvString) {
  return csvToJson.csvStringToJsonStringified(csvString);
};

exports.csvStringToJson = function(csvString) {
  if (csvString === void 0 || csvString === null) throw new Error('csvString is not defined!!!');
  return csvToJson.csvStringToJson(csvString);
};

exports.browser = browser();
