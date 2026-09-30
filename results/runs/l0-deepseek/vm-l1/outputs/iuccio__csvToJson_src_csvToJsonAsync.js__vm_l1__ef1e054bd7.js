'use strict';

class InputValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InputValidationError';
  }
}

class CsvFormatError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CsvFormatError';
  }
}

class Configurable {
  constructor(config = {}) {
    this.config = config;
  }

  getConfig() {
    return this.config;
  }

  setConfig(config) {
    this.config = config;
  }

  updateConfig(config) {
    this.config = { ...this.config, ...config };
  }
}

class ParserConfig extends Configurable {
  constructor(config = {}) {
    super({
      delimiter: ',',
      quote: '"',
      escape: '"',
      newline: '\n',
      skipEmptyLines: false,
      trim: false,
      ...config
    });
  }
}

const fileUtils = {
  readFile(filePath) {
    const fs = require('fs');
    return fs.readFileSync(filePath, 'utf8');
  },

  createReadStream(filePath) {
    const fs = require('fs');
    return fs.createReadStream(filePath, { encoding: 'utf8' });
  },

  writeFile(filePath, content) {
    const fs = require('fs');
    fs.writeFileSync(filePath, content, 'utf8');
  },

  createWriteStream(filePath) {
    const fs = require('fs');
    return fs.createWriteStream(filePath, { encoding: 'utf8' });
  }
};

const stringUtils = {
  isEmpty(value) {
    return value === null || value === undefined || value === '';
  },

  isString(value) {
    return typeof value === 'string';
  },

  trim(value) {
    return typeof value === 'string' ? value.trim() : value;
  }
};

const jsonUtils = {
  parseJson(jsonString) {
    return JSON.parse(jsonString);
  },

  stringifyJson(value, pretty = false) {
    return pretty ? JSON.stringify(value, null, 2) : JSON.stringify(value);
  }
};

class StreamProcessor {
  constructor(stream) {
    this.stream = stream;
  }

  async getJsonFromStreamAsync() {
    let data = '';
    for await (const chunk of this.stream) {
      data += chunk;
    }
    return JSON.parse(data);
  }
}

class CsvToJson {
  constructor(config = {}) {
    this.config = new ParserConfig(config);
  }

  parseLine(line) {
    const { delimiter, quote, escape, trim } = this.config.getConfig();
    const values = [];
    let current = '';
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
      const char = line[i];

      if (inQuotes) {
        if (char === escape && i + 1 < line.length && (line[i + 1] === quote || line[i + 1] === escape)) {
          current += line[i + 1];
          i += 2;
        } else if (char === quote) {
          inQuotes = false;
          i++;
        } else {
          current += char;
          i++;
        }
      } else {
        if (char === quote) {
          inQuotes = true;
          i++;
        } else if (char === delimiter) {
          values.push(trim ? current.trim() : current);
          current = '';
          i++;
        } else {
          current += char;
          i++;
        }
      }
    }

    values.push(trim ? current.trim() : current);
    return values;
  }

  parseCsv(csvString) {
    const { newline, skipEmptyLines } = this.config.getConfig();
    const lines = csvString.split(newline);
    const rows = [];

    for (const line of lines) {
      if (skipEmptyLines && stringUtils.isEmpty(line)) {
        continue;
      }
      rows.push(this.parseLine(line));
    }

    return rows;
  }

  csvToJson(csvString) {
    const rows = this.parseCsv(csvString);
    if (rows.length === 0) {
      return [];
    }

    const headers = rows[0];
    const result = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const obj = {};
      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = row[j] !== undefined ? row[j] : null;
      }
      result.push(obj);
    }

    return result;
  }

  getJsonFromCsvStringified(csvString) {
    return this.csvToJson(csvString);
  }

  getJsonFromCsvString(csvString) {
    return this.csvToJson(csvString);
  }

  getJsonFromCsvFile(filePath) {
    const csvString = fileUtils.readFile(filePath);
    return this.csvToJson(csvString);
  }

  generateJsonFileFromCsv(csvFilePath, jsonFilePath, pretty = false) {
    const json = this.getJsonFromCsvFile(csvFilePath);
    fileUtils.writeFile(jsonFilePath, jsonUtils.stringifyJson(json, pretty));
  }
}

class CsvToJsonAsync extends CsvToJson {
  constructor(config = {}) {
    super(config);
  }

  async getJsonFromCsvStringAsync(csvString) {
    return this.csvToJson(csvString);
  }

  async getJsonFromCsvFileAsync(filePath) {
    const csvString = fileUtils.readFile(filePath);
    return this.csvToJson(csvString);
  }

  async getJsonFromStreamAsync(stream) {
    const processor = new StreamProcessor(stream);
    return processor.getJsonFromStreamAsync();
  }

  async getJsonFromFileStreamingAsync(filePath) {
    const stream = fileUtils.createReadStream(filePath);
    return this.getJsonFromStreamAsync(stream);
  }
}

module.exports = new CsvToJsonAsync();
