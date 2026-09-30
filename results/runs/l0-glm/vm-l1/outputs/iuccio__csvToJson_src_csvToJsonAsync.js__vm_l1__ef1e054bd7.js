'use strict';

class CsvFormatError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CsvFormatError';
  }
}

class InputValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InputValidationError';
  }
}

const fileUtils = {
  generateJsonFileFromCsv(csvFilePath, jsonFilePath) {
    const fs = require('fs');
    const csvData = fs.readFileSync(csvFilePath, 'utf8');
    const jsonData = JSON.stringify(this.csvToJson(csvData));
    fs.writeFileSync(jsonFilePath, jsonData);
  }
};

const stringUtils = {
  csvToJson(csvString) {
    const lines = csvString.trim().split('\n');
    const headers = lines[0].split(',');
    const result = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      const obj = {};
      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = values[j];
      }
      result.push(obj);
    }
    return result;
  }
};

const jsonUtils = {
  getJsonFromCsv(csvString) {
    return stringUtils.csvToJson(csvString);
  }
};

const parserConfig = {
  delimiter: ',',
  quote: '"'
};

class Configurable {
  constructor() {
    this._config = { ...parserConfig };
  }
  _validateStream(stream) {
    if (!stream) throw new InputValidationError('Invalid stream');
  }
}

class StreamProcessor extends Configurable {
  constructor() {
    super();
  }
  processStream(stream, callback) {
    this._validateStream(stream);
    let data = '';
    stream.on('data', chunk => { data += chunk; });
    stream.on('end', () => { callback(null, stringUtils.csvToJson(data)); });
    stream.on('error', err => { callback(err); });
  }
}

class CsvToJson extends Configurable {
  constructor() {
    super();
  }
  csvToJson(csvString) {
    return stringUtils.csvToJson(csvString);
  }
  getJsonFromCsv(csvString) {
    return jsonUtils.getJsonFromCsv(csvString);
  }
  generateJsonFileFromCsv(csvFilePath, jsonFilePath) {
    return fileUtils.generateJsonFileFromCsv(csvFilePath, jsonFilePath);
  }
}

class CsvToJsonAsync extends CsvToJson {
  constructor() {
    super();
  }
  async getJsonFromStreamAsync(stream) {
    return new Promise((resolve, reject) => {
      this._validateStream(stream);
      let data = '';
      stream.on('data', chunk => { data += chunk; });
      stream.on('end', () => { resolve(stringUtils.csvToJson(data)); });
      stream.on('error', err => { reject(err); });
    });
  }
  async getJsonFromCsvStringified(csvString) {
    return JSON.stringify(stringUtils.csvToJson(csvString));
  }
  async getJsonFromCsvAsync(csvString) {
    return stringUtils.csvToJson(csvString);
  }
  async csvStringToJsonAsync(csvString) {
    return stringUtils.csvToJson(csvString);
  }
  async getJsonFromStreamStringifiedAsync(stream) {
    const result = await this.getJsonFromStreamAsync(stream);
    return JSON.stringify(result);
  }
  async getJsonFromFileStreamingAsync(filePath) {
    const fs = require('fs');
    const stream = fs.createReadStream(filePath);
    return this.getJsonFromStreamAsync(stream);
  }
}

module.exports = new CsvToJsonAsync();
