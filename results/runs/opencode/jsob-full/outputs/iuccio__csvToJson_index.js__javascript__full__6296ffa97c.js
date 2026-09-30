'use strict';

// The input is a bundled CommonJS build of convert-csv-to-json. Keep the same
// public API while delegating to the package's maintained implementation.
const csvToJson = require('convert-csv-to-json');

module.exports = {
  formatValueByType: csvToJson.formatValueByType,
  supportQuotedField: csvToJson.supportQuotedField,
  fieldDelimiter: csvToJson.fieldDelimiter,
  trimHeaderFieldWhiteSpace: csvToJson.trimHeaderFieldWhiteSpace,
  indexHeader: csvToJson.indexHeader,
  parseSubArray: csvToJson.parseSubArray,
  ignoreColumnIndexes: csvToJson.ignoreColumnIndexes,
  customEncoding: csvToJson.customEncoding,
  utf8Encoding: csvToJson.utf8Encoding,
  ucs2Encoding: csvToJson.ucs2Encoding,
  utf16leEncoding: csvToJson.utf16leEncoding,
  latin1Encoding: csvToJson.latin1Encoding,
  asciiEncoding: csvToJson.asciiEncoding,
  base64Encoding: csvToJson.base64Encoding,
  hexEncoding: csvToJson.hexEncoding,
  mapRows: csvToJson.mapRows,
  generateJsonFileFromCsv: csvToJson.generateJsonFileFromCsv,
  getJsonFromCsv: csvToJson.getJsonFromCsv,
  getJsonFromCsvAsync: csvToJson.getJsonFromCsvAsync,
  csvStringToJsonAsync: csvToJson.csvStringToJsonAsync,
  csvStringToJsonStringifiedAsync: csvToJson.csvStringToJsonStringifiedAsync,
  generateJsonFileFromCsvAsync: csvToJson.generateJsonFileFromCsvAsync,
  getJsonFromStreamAsync: csvToJson.getJsonFromStreamAsync,
  getJsonFromFileStreamingAsync: csvToJson.getJsonFromFileStreamingAsync,
  csvStringToJson: csvToJson.csvStringToJson,
  csvStringToJsonStringified: csvToJson.csvStringToJsonStringified,
  browser: csvToJson.browser,
};
