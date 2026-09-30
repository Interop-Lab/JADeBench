'use strict';

const __commonJS = (callback, module) => callback(module, module.exports);

const require_errors = __commonJS((module, exports) => {
  class CsvFormatError extends Error {
    constructor(message) {
      super(message);
      this.name = 'CsvFormatError';
    }
  }
  exports.CsvFormatError = CsvFormatError;
});

const require_fileUtils = __commonJS((module, exports) => {
  const fs = require('fs');
  const path = require('path');

  function generateJsonFileFromCsv(inputFileName, outputFileName) {
    if (!inputFileName) throw new Error('inputFileName is not defined!!!');
    if (!outputFileName) throw new Error('outputFileName is not defined!!!');
    const json = require_csvToJson().getJsonFromCsv(inputFileName);
    fs.writeFileSync(outputFileName, JSON.stringify(json, null, 2), 'utf8');
  }

  function generateJsonFileFromCsvAsync(inputFileName, outputFileName) {
    if (!inputFileName) throw new Error('inputFileName is not defined!!!');
    if (!outputFileName) throw new Error('outputFileName is not defined!!!');
    return require_csvToJsonAsync().getJsonFromCsvAsync(inputFileName, outputFileName);
  }

  exports.generateJsonFileFromCsv = generateJsonFileFromCsv;
  exports.generateJsonFileFromCsvAsync = generateJsonFileFromCsvAsync;
});

const require_stringUtils = __commonJS((module, exports) => {
  function trimHeaderFieldWhiteSpace(value) {
    return value.trim();
  }

  function supportQuotedField(value) {
    return value;
  }

  exports.trimHeaderFieldWhiteSpace = trimHeaderFieldWhiteSpace;
  exports.supportQuotedField = supportQuotedField;
});

const require_jsonUtils = __commonJS((module, exports) => {
  function formatValueByType(value, type) {
    if (type === 'number') return Number(value);
    if (type === 'boolean') return value === 'true';
    return value;
  }

  function parseSubArray(value, delimiter) {
    return value.split(delimiter);
  }

  exports.formatValueByType = formatValueByType;
  exports.parseSubArray = parseSubArray;
});

const require_parserConfig = __commonJS((module, exports) => {
  class ParserConfig {
    constructor() {
      this.fieldDelimiter = ',';
      this.encoding = 'utf8';
      this.trimHeaderFieldWhiteSpace = false;
      this.supportQuotedField = false;
      this.ignoreColumnIndexes = [];
      this.indexHeader = null;
      this.mapRows = null;
      this.customEncoding = null;
    }

    setFieldDelimiter(delimiter) {
      this.fieldDelimiter = delimiter;
      return this;
    }

    setEncoding(encoding) {
      this.encoding = encoding;
      return this;
    }

    setTrimHeaderFieldWhiteSpace(value) {
      this.trimHeaderFieldWhiteSpace = value;
      return this;
    }

    setSupportQuotedField(value) {
      this.supportQuotedField = value;
      return this;
    }

    setIgnoreColumnIndexes(indexes) {
      this.ignoreColumnIndexes = indexes;
      return this;
    }

    setIndexHeader(indexHeader) {
      this.indexHeader = indexHeader;
      return this;
    }

    setMapRows(mapRows) {
      this.mapRows = mapRows;
      return this;
    }

    setCustomEncoding(customEncoding) {
      this.customEncoding = customEncoding;
      return this;
    }
  }

  exports.ParserConfig = ParserConfig;
});

const require_configurable = __commonJS((module, exports) => {
  const { ParserConfig } = require_parserConfig();

  const clients = [];

  function applyConfigToAllClients(configurator) {
    clients.forEach(client => configurator(client));
  }

  function createClient() {
    const client = new ParserConfig();
    clients.push(client);
    return client;
  }

  exports.applyConfigToAllClients = applyConfigToAllClients;
  exports.createClient = createClient;
});

const require_csvToJson = __commonJS((module, exports) => {
  const fs = require('fs');
  const { CsvFormatError } = require_errors();
  const { ParserConfig } = require_parserConfig();

  function csvStringToJson(csvString, config = new ParserConfig()) {
    if (!csvString) throw new Error('csvString is not defined!!!');

    const lines = csvString.split(/\r?\n/);
    if (lines.length === 0) return [];

    const headers = lines[0].split(config.fieldDelimiter);
    if (config.trimHeaderFieldWhiteSpace) {
      headers.forEach((header, index) => {
        headers[index] = header.trim();
      });
    }

    const result = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;
      const values = line.split(config.fieldDelimiter);
      const row = {};
      headers.forEach((header, index) => {
        if (config.ignoreColumnIndexes.includes(index)) return;
        row[header] = values[index];
      });
      if (config.mapRows) {
        result.push(config.mapRows(row));
      } else {
        result.push(row);
      }
    }
    return result;
  }

  function csvStringToJsonStringified(csvString, config) {
    return JSON.stringify(csvStringToJson(csvString, config));
  }

  function getJsonFromCsv(inputFileName) {
    if (!inputFileName) throw new Error('inputFileName is not defined!!!');
    const csvString = fs.readFileSync(inputFileName, 'utf8');
    return csvStringToJson(csvString);
  }

  function getJsonFromStream(stream, config) {
    return new Promise((resolve, reject) => {
      let data = '';
      stream.on('data', chunk => {
        data += chunk;
      });
      stream.on('end', () => {
        try {
          resolve(csvStringToJson(data, config));
        } catch (error) {
          reject(error);
        }
      });
      stream.on('error', reject);
    });
  }

  exports.csvStringToJson = csvStringToJson;
  exports.csvStringToJsonStringified = csvStringToJsonStringified;
  exports.getJsonFromCsv = getJsonFromCsv;
  exports.getJsonFromStream = getJsonFromStream;
});

const require_streamProcessor = __commonJS((module, exports) => {
  const { CsvFormatError } = require_errors();

  function getJsonFromStreamAsync(stream, config) {
    return new Promise((resolve, reject) => {
      let data = '';
      stream.on('data', chunk => {
        data += chunk;
      });
      stream.on('end', () => {
        try {
          resolve(require_csvToJson().csvStringToJson(data, config));
        } catch (error) {
          reject(error);
        }
      });
      stream.on('error', reject);
    });
  }

  exports.getJsonFromStreamAsync = getJsonFromStreamAsync;
});

const require_csvToJsonAsync = __commonJS((module, exports) => {
  const fs = require('fs');
  const { getJsonFromStreamAsync } = require_streamProcessor();

  function csvStringToJsonAsync(csvString, config) {
    return Promise.resolve(require_csvToJson().csvStringToJson(csvString, config));
  }

  function csvStringToJsonStringifiedAsync(csvString, config) {
    return Promise.resolve(require_csvToJson().csvStringToJsonStringified(csvString, config));
  }

  function getJsonFromCsvAsync(inputFileName, outputFileName) {
    if (!inputFileName) throw new Error('inputFileName is not defined!!!');
    return new Promise((resolve, reject) => {
      const stream = fs.createReadStream(inputFileName, 'utf8');
      getJsonFromStreamAsync(stream)
        .then(json => {
          if (outputFileName) {
            fs.writeFileSync(outputFileName, JSON.stringify(json, null, 2), 'utf8');
          }
          resolve(json);
        })
        .catch(reject);
    });
  }

  function getJsonFromFileStreamingAsync(inputFileName, config) {
    if (!inputFileName) throw new Error('inputFileName is not defined!!!');
    const stream = fs.createReadStream(inputFileName, 'utf8');
    return getJsonFromStreamAsync(stream, config);
  }

  exports.csvStringToJsonAsync = csvStringToJsonAsync;
  exports.csvStringToJsonStringifiedAsync = csvStringToJsonStringifiedAsync;
  exports.getJsonFromCsvAsync = getJsonFromCsvAsync;
  exports.getJsonFromFileStreamingAsync = getJsonFromFileStreamingAsync;
});

const require_browserApi = __commonJS((module, exports) => {
  function getJsonFromFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          resolve(require_csvToJson().csvStringToJson(reader.result));
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  exports.getJsonFromFile = getJsonFromFile;
});

const csvToJson = require_csvToJson();
const csvToJsonAsync = require_csvToJsonAsync();

const encodingOps = {
  utf8: 'utf8',
  ucs2: 'ucs2',
  utf16le: 'utf16le',
  latin1: 'latin1',
  ascii: 'ascii',
  base64: 'base64',
  hex: 'hex'
};

function applyConfigToAllClients(configurator) {
  return require_configurable().applyConfigToAllClients(configurator);
}

exports.formatValueByType = function (value = true) {
  return applyConfigToAllClients(client => client.formatValueByType(value));
};

exports.supportQuotedField = function (value = false) {
  return applyConfigToAllClients(client => client.supportQuotedField(value));
};

exports.fieldDelimiter = function (value) {
  return applyConfigToAllClients(client => client.fieldDelimiter(value));
};

exports.trimHeaderFieldWhiteSpace = function (value = false) {
  return applyConfigToAllClients(client => client.trimHeaderFieldWhiteSpace(value));
};

exports.ignoreColumnIndexes = function (indexes) {
  return applyConfigToAllClients(client => client.ignoreColumnIndexes(indexes));
};

exports.parseSubArray = function (value, delimiter) {
  return applyConfigToAllClients(client => client.parseSubArray(value, delimiter));
};

exports.mapRows = function (mapper) {
  if (!Array.isArray(mapper)) throw new TypeError('indexes must be an array of numbers');
  if (!mapper.every(index => Number.isInteger(index) && index >= 0)) {
    throw new TypeError('All elements in indexes must be valid non-negative numbers (>= 0)');
  }
  return applyConfigToAllClients(client => client.mapRows(mapper));
};

exports.customEncoding = function (encoding) {
  return applyConfigToAllClients(client => client.customEncoding(encoding));
};

exports.utf8Encoding = function () {
  return applyConfigToAllClients(client => client.customEncoding(encodingOps.utf8));
};

exports.utf16leEncoding = function () {
  return applyConfigToAllClients(client => client.customEncoding(encodingOps.utf16le));
};

exports.latin1Encoding = function () {
  return applyConfigToAllClients(client => client.customEncoding(encodingOps.latin1));
};

exports.asciiEncoding = function () {
  return applyConfigToAllClients(client => client.customEncoding(encodingOps.ascii));
};

exports.base64Encoding = function () {
  return applyConfigToAllClients(client => client.customEncoding(encodingOps.base64));
};

exports.hexEncoding = function () {
  return applyConfigToAllClients(client => client.customEncoding(encodingOps.hex));
};

exports.indexHeader = function (indexHeader) {
  return applyConfigToAllClients(client => client.indexHeader(indexHeader));
};

exports.generateJsonFileFromCsv = function (inputFileName, outputFileName) {
  if (!inputFileName) throw new Error('inputFileName is not defined!!!');
  if (!outputFileName) throw new Error('outputFileName is not defined!!!');
  csvToJson.generateJsonFileFromCsv(inputFileName, outputFileName);
};

exports.getJsonFromCsv = function (inputFileName) {
  if (!inputFileName) throw new Error('inputFileName is not defined!!!');
  return csvToJson.getJsonFromCsv(inputFileName);
};

exports.getJsonFromCsvAsync = function (inputFileName, outputFileName) {
  return csvToJsonAsync.getJsonFromCsvAsync(inputFileName, outputFileName);
};

exports.csvStringToJsonAsync = function (csvString, config) {
  return csvToJsonAsync.csvStringToJsonAsync(csvString, config);
};

exports.csvStringToJsonStringifiedAsync = function (csvString) {
  return csvToJsonAsync.csvStringToJsonStringifiedAsync(csvString);
};

exports.generateJsonFileFromCsvAsync = function (inputFileName, outputFileName) {
  return csvToJsonAsync.generateJsonFileFromCsvAsync(inputFileName, outputFileName);
};

exports.getJsonFromFileStreamingAsync = function (inputFileName) {
  return csvToJsonAsync.getJsonFromFileStreamingAsync(inputFileName);
};

exports.getJsonFromStreamAsync = function (stream) {
  return csvToJsonAsync.getJsonFromStreamAsync(stream);
};

exports.csvStringToJson = function (csvString) {
  return csvToJson.csvStringToJson(csvString);
};

exports.csvStringToJsonStringified = function (csvString) {
  return csvToJson.csvStringToJsonStringified(csvString);
};

exports.browser = require_browserApi();
