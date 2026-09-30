'use strict';

const fs = require('fs');
const path = require('path');

// Error classes
class CsvToJsonError extends Error {
    constructor(message, code, details = {}) {
        super(message);
        this.code = code;
        this.details = details;
        Error.captureStackTrace(this, this.constructor);
    }

    toString() {
        let result = `${this.code}: ${this.message}`;
        if (this.details && Object.keys(this.details).length > 0) {
            result += '\nDetails:';
            Object.entries(this.details).forEach(([key, value]) => {
                result += `\n  ${key}: ${this._formatValue(value)}`;
            });
        }
        return result;
    }

    _formatValue(value) {
        if (typeof value === 'string') return `"${value}"`;
        if (value === undefined) return 'undefined';
        if (value === null) return 'null';
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value);
    }
}

class ConfigurationError extends CsvToJsonError {
    constructor(optionName, value, type, conflictingOption = '') {
        const message = `Invalid configuration for option '${optionName}' with value '${value}'${conflictingOption ? `\nConflicts with: ${conflictingOption}` : ''}`;
        const details = { optionName, value, type };
        if (conflictingOption) details.conflictingOption = conflictingOption;
        super(message, 'CONFIGURATION_ERROR', details);
        this.optionName = optionName;
    }

    static invalidType(value) {
        return new ConfigurationError('Invalid type', value, typeof value);
    }

    static missingRequired(location = 'configuration') {
        return new ConfigurationError(`Missing required configuration at ${location}`, 'MISSING_REQUIRED', { location });
    }
}

class CsvFormatError extends CsvToJsonError {
    constructor(message, csvPreview, originalError) {
        super(message, 'CSV_FORMAT_ERROR', { originalError, csvPreview });
        this.csvPreview = csvPreview;
        this.originalError = originalError;
    }

    static emptyFile() {
        return new CsvFormatError('The CSV file is empty', '', null);
    }

    static invalidFormat(originalError) {
        return new CsvFormatError('Invalid CSV format', '', originalError);
    }
}

class FileOperationError extends CsvToJsonError {
    constructor(operation, filePath, originalError) {
        const message = `File operation '${operation}' failed for '${filePath}'${originalError ? `: ${originalError.message}` : ''}`;
        const details = { operation, filePath, originalError };
        super(message, 'FILE_OPERATION_ERROR', details);
        this.operation = operation;
        this.filePath = filePath;
    }

    static notFound(filePath) {
        return new FileOperationError('read', filePath, { code: 'ENOENT', message: 'File not found' });
    }

    static permissionDenied(filePath) {
        return new FileOperationError('read', filePath, { code: 'EACCES', message: 'Permission denied' });
    }
}

class JsonValidationError extends CsvToJsonError {
    constructor(jsonString, originalError) {
        const message = `JSON validation failed: ${originalError.message}\nOriginal: ${jsonString.substring(0, 100)}...`;
        super(message, 'JSON_VALIDATION_ERROR', { originalError, jsonPreview: jsonString.substring(0, 100) });
        this.originalError = originalError;
    }
}

class ParserConfig {
    constructor(options = {}) {
        this.delimiter = options.delimiter || ',';
        this.quote = options.quote || '"';
        this.escape = options.escape || '"';
        this.header = options.header !== false;
        this.outputFormat = options.outputFormat || 'json';
        this.encoding = options.encoding || 'utf8';
        this.trimValues = options.trimValues || false;
        this.checkType = options.checkType || false;
        this.nullIfEmpty = options.nullIfEmpty || false;
        this.keys = options.keys ? [...options.keys] : [];
        this.parseNumbers = options.parseNumbers !== false;
        this.parseBooleans = options.parseBooleans || false;
        Object.freeze(this);
    }
}

class Configurable {
    constructor(options = {}) {
        this._config = { ...options };
    }

    trim(enabled = true) {
        this._config.trimValues = enabled;
        return this;
    }

    checkType(enabled = false) {
        this._config.checkType = enabled;
        return this;
    }

    delimiter(char) {
        if (typeof char !== 'string' || char.length !== 1) {
            throw new TypeError('Delimiter must be a single character');
        }
        this._config.delimiter = char;
        return this;
    }

    quote(char) {
        this._config.quote = char;
        return this;
    }

    escape(char) {
        this._config.escape = char;
        return this;
    }

    header(enabled = true) {
        this._config.header = enabled;
        return this;
    }

    encoding(enc) {
        this._config.encoding = enc;
        return this;
    }

    keys(keyArray) {
        if (!Array.isArray(keyArray)) {
            throw new TypeError('Keys must be an array');
        }
        this._config.keys = [...keyArray];
        return this;
    }

    parseNumbers(enabled = true) {
        this._config.parseNumbers = enabled;
        return this;
    }

    parseBooleans(enabled = true) {
        this._config.parseBooleans = enabled;
        return this;
    }

    nullIfEmpty(enabled = true) {
        this._config.nullIfEmpty = enabled;
        return this;
    }

    outputFormat(format) {
        this._config.outputFormat = format;
        return this;
    }

    getConfig() {
        return new ParserConfig(this._config);
    }
}

class FileUtils {
    constructor() {
        this._supportedEncodings = new Set(['utf8', 'utf-8', 'ascii', 'base64', 'hex', 'latin1']);
    }

    isSupportedEncoding(encoding) {
        return this._supportedEncodings.has(encoding);
    }

    readFileSync(filePath, encoding) {
        if (this.isSupportedEncoding(encoding)) {
            return fs.readFileSync(filePath, encoding).toString();
        }
        return fs.readFileSync(filePath).toString();
    }

    readFile(filePath, encoding) {
        return new Promise((resolve, reject) => {
            const actualEncoding = this.isSupportedEncoding(encoding) ? encoding : null;
            
            fs.readFile(filePath, actualEncoding, (err, data) => {
                if (err) {
                    reject(this._createFileError(filePath, err));
                    return;
                }
                try {
                    const result = actualEncoding ? data : data.toString();
                    resolve(result);
                } catch (parseErr) {
                    reject(this._createFileError(filePath, parseErr));
                }
            });
        });
    }

    _createFileError(filePath, originalError) {
        if (originalError.code === 'ENOENT') {
            return FileOperationError.notFound(filePath);
        }
        if (originalError.code === 'EACCES') {
            return FileOperationError.permissionDenied(filePath);
        }
        return new FileOperationError('read', filePath, originalError);
    }

    existsSync(filePath) {
        return fs.existsSync(filePath);
    }

    exists(filePath) {
        return new Promise((resolve) => {
            fs.access(filePath, fs.constants.F_OK, (err) => {
                resolve(!err);
            });
        });
    }

    writeFileSync(filePath, data, encoding = 'utf8') {
        fs.writeFileSync(filePath, data, encoding);
    }

    writeFile(filePath, data, encoding = 'utf8') {
        return new Promise((resolve, reject) => {
            fs.writeFile(filePath, data, encoding, (err) => {
                if (err) {
                    reject(this._createFileError(filePath, err));
                    return;
                }
                resolve();
            });
        });
    }

    mkdirSync(dirPath) {
        fs.mkdirSync(dirPath, { recursive: true });
    }

    mkdir(dirPath) {
        return new Promise((resolve, reject) => {
            fs.mkdir(dirPath, { recursive: true }, (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }

    readdirSync(dirPath) {
        return fs.readdirSync(dirPath);
    }

    readdir(dirPath) {
        return new Promise((resolve, reject) => {
            fs.readdir(dirPath, (err, files) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(files);
            });
        });
    }

    statSync(filePath) {
        return fs.statSync(filePath);
    }

    stat(filePath) {
        return new Promise((resolve, reject) => {
            fs.stat(filePath, (err, stats) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(stats);
            });
        });
    }
}

class StringUtils {
    static PATTERNS = {
        INTEGER: /^-?\d+$/,
        FLOAT: /^-?\d*\.\d+$/,
        WHITESPACE: /\s/g
    };

    static FORMATS = {
        JSON: 'json',
        CSV: 'csv'
    };

    trim(value, shouldTrim) {
        if (!value) return '';
        return shouldTrim ? value.replace(StringUtils.PATTERNS.WHITESPACE, '') : value.trim();
    }

    detectType(value) {
        if (this.isEmpty(value)) return String;
        if (this.isInteger(value)) return this.parseNumber(value);
        if (this.isFloat(value)) return this.parseNumber(value);
        if (this.isBoolean(value)) return this.parseBoolean(value);
        return String(value);
    }

    isEmpty(value) {
        return value === undefined || value === null || value === '';
    }

    isInteger(value) {
        const trimmed = value.toString().trim();
        return StringUtils.PATTERNS.INTEGER.test(trimmed);
    }

    isFloat(value) {
        const trimmed = value.toString().trim();
        return StringUtils.PATTERNS.FLOAT.test(trimmed);
    }

    isBoolean(value) {
        const lower = value.toString().toLowerCase();
        return lower === 'true' || lower === 'false';
    }

    parseNumber(value) {
        const num = Number(value);
        return Number.isNaN(num) ? String(value) : num;
    }

    parseBoolean(value) {
        return value.toString().toLowerCase() === 'true';
    }

    isValidIndex(index, length) {
        return index >= 0 && index < length;
    }

    formatValue(value) {
        if (this.isEmpty(value)) return '';
        if (typeof value === 'string') return value;
        if (typeof value === 'number') return value.toString();
        if (typeof value === 'boolean') return value.toString();
        return JSON.stringify(value);
    }

    escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    splitLine(line, delimiter, quote) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === quote) {
                inQuotes = !inQuotes;
            } else if (char === delimiter && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current);
        return result;
    }
}

class JsonUtils {
    constructor() {
        const { JsonValidationError } = require('./errors');
        this.JsonValidationError = JsonValidationError;
    }

    validate(jsonString) {
        try {
            JSON.parse(jsonString);
        } catch (error) {
            throw new JsonValidationError(jsonString, error);
        }
    }

    parse(jsonString) {
        try {
            return JSON.parse(jsonString);
        } catch (error) {
            throw new JsonValidationError(jsonString, error);
        }
    }

    stringify(obj, pretty = false) {
        return pretty ? JSON.stringify(obj, null, 2) : JSON.stringify(obj);
    }
}

class CsvToJson extends Configurable {
    constructor(options = {}) {
        super(options);
        this._fileUtils = new FileUtils();
        this._stringUtils = new StringUtils();
        this._jsonUtils = new JsonUtils();
        this._delimiter = ',';
        this._quote = '"';
        this._newline = '\n';
        this._carriageReturn = '\r';
    }

    _parseLine(line, config, quoteChar) {
        const values = this._stringUtils.splitLine(line, config.delimiter, quoteChar);
        return values.map(v => this._processValue(v, config));
    }

    _processValue(value, config) {
        let result = value;
        
        if (config.trimValues) {
            result = result.trim();
        }
        
        if (config.nullIfEmpty && result === '') {
            return null;
        }
        
        if (config.checkType) {
            return this._stringUtils.detectType(result);
        }
        
        if (config.parseNumbers && this._stringUtils.isInteger(result)) {
            return this._stringUtils.parseNumber(result);
        }
        
        if (config.parseBooleans && this._stringUtils.isBoolean(result)) {
            return this._stringUtils.parseBoolean(result);
        }
        
        return result;
    }

    _buildRecord(headers, values, config) {
        const record = {};
        
        for (let i = 0; i < headers.length; i++) {
            const key = config.keys[i] || headers[i];
            record[key] = values[i] !== undefined ? values[i] : null;
        }
        
        return record;
    }

    parseString(csvString, config = this.getConfig()) {
        if (!csvString || csvString.trim() === '') {
            throw CsvFormatError.emptyFile();
        }

        const lines = csvString.split(/\r?\n/).filter(line => line.trim() !== '');
        if (lines.length === 0) {
            throw CsvFormatError.emptyFile();
        }

        const quoteChar = config.quote || '"';
        const delimiter = config.delimiter || ',';
        
        let headers = [];
        let startIndex = 0;
        
        if (config.header) {
            headers = this._parseLine(lines[0], config, quoteChar);
            startIndex = 1;
        } else {
            const firstLineValues = this._parseLine(lines[0], config, quoteChar);
            headers = firstLineValues.map((_, i) => `field${i + 1}`);
        }

        const results = [];
        
        for (let i = startIndex; i < lines.length; i++) {
            const values = this._parseLine(lines[i], config, quoteChar);
            
            if (values.length === 0) continue;
            
            const record = this._buildRecord(headers, values, config);
            results.push(record);
        }

        return results;
    }

    parseFile(filePath, encoding = 'utf8') {
        const config = this.getConfig();
        const content = this._fileUtils.readFileSync(filePath, encoding);
        return this.parseString(content, config);
    }

    async parseFileAsync(filePath, encoding = 'utf8') {
        const config = this.getConfig();
        const content = await this._fileUtils.readFile(filePath, encoding);
        return this.parseString(content, config);
    }

    toJson(csvString) {
        return this.parseString(csvString);
    }

    toJsonAsync(csvString) {
        return Promise.resolve(this.parseString(csvString));
    }

    csvStringToJson(csvString) {
        return this.parseString(csvString);
    }

    csvFileToJson(filePath, encoding = 'utf8') {
        return this.parseFile(filePath, encoding);
    }

    csvFileToJsonAsync(filePath, encoding = 'utf8') {
        return this.parseFileAsync(filePath, encoding);
    }

    fieldDelimiter(delimiter) {
        return this.delimiter(delimiter);
    }

    quoteMark(quote) {
        return this.quote(quote);
    }

    escapeChar(escape) {
        return this.escape(escape);
    }

    hasHeader(enabled = true) {
        return this.header(enabled);
    }

    encoding(enc) {
        return this.encoding(enc);
    }

    trimHeader(enabled = true) {
        return this.trim(enabled);
    }

    checkColumn(enabled = false) {
        return this.checkType(enabled);
    }

    parseNumber(enabled = true) {
        return this.parseNumbers(enabled);
    }

    parseBoolean(enabled = true) {
        return this.parseBooleans(enabled);
    }

    nullIfEmpty(enabled = true) {
        return this.nullIfEmpty(enabled);
    }

    keys(keyArray) {
        return this.keys(keyArray);
    }

    outputFormat(format) {
        return this.outputFormat(format);
    }

    getParserConfig() {
        return this.getConfig();
    }
}

// Create singleton instances
const csvToJson = new CsvToJson();
const csvToJsonAsync = new CsvToJson();

// Helper function to apply config to all clients
function applyConfigToAllClients(configFn) {
    configFn(csvToJson);
    configFn(csvToJsonAsync);
    if (exports.csvToJson) {
        configFn(exports.csvToJson);
    }
    return exports;
}

// Export functions
exports.csvToJson = csvToJson;
exports.csvToJsonAsync = csvToJsonAsync;

exports.trim = function(enabled = true) {
    return applyConfigToAllClients(client => client.trim(enabled));
};

exports.checkType = function(enabled = false) {
    return applyConfigToAllClients(client => client.checkType(enabled));
};

exports.delimiter = function(char) {
    return applyConfigToAllClients(client => client.delimiter(char));
};

exports.quote = function(char) {
    return applyConfigToAllClients(client => client.quote(char));
};

exports.escape = function(char) {
    return applyConfigToAllClients(client => client.escape(char));
};

exports.header = function(enabled = true) {
    return applyConfigToAllClients(client => client.header(enabled));
};

exports.encoding = function(enc) {
    return applyConfigToAllClients(client => client.encoding(enc));
};

exports.keys = function(keyArray) {
    return applyConfigToAllClients(client => client.keys(keyArray));
};

exports.parseNumbers = function(enabled = true) {
    return applyConfigToAllClients(client => client.parseNumbers(enabled));
};

exports.parseBooleans = function(enabled = true) {
    return applyConfigToAllClients(client => client.parseBooleans(enabled));
};

exports.nullIfEmpty = function(enabled = true) {
    return applyConfigToAllClients(client => client.nullIfEmpty(enabled));
};

exports.outputFormat = function(format) {
    return applyConfigToAllClients(client => client.outputFormat(format));
};

exports.fieldDelimiter = function(delimiter) {
    return applyConfigToAllClients(client => client.fieldDelimiter(delimiter));
};

exports.quoteMark = function(quote) {
    return applyConfigToAllClients(client => client.quoteMark(quote));
};

exports.escapeChar = function(escape) {
    return applyConfigToAllClients(client => client.escapeChar(escape));
};

exports.hasHeader = function(enabled = true) {
    return applyConfigToAllClients(client => client.hasHeader(enabled));
};

exports.trimHeader = function(enabled = true) {
    return applyConfigToAllClients(client => client.trimHeader(enabled));
};

exports.checkColumn = function(enabled = false) {
    return applyConfigToAllClients(client => client.checkColumn(enabled));
};

exports.parseNumber = function(enabled = true) {
    return applyConfigToAllClients(client => client.parseNumber(enabled));
};

exports.parseBoolean = function(enabled = true) {
    return applyConfigToAllClients(client => client.parseBoolean(enabled));
};

exports.getParserConfig = function() {
    return applyConfigToAllClients(client => client.getParserConfig());
};

exports.csvStringToJson = function(csvString) {
    if (!csvString) {
        throw new Error('CSV string is required');
    }
    return csvToJson.csvStringToJson(csvString);
};

exports.csvFileToJson = function(filePath, encoding = 'utf8') {
    if (!filePath) {
        throw new Error('File path is required');
    }
    if (!encoding) {
        throw new Error('Encoding is required');
    }
    return csvToJson.csvFileToJson(filePath, encoding);
};

exports.csvStringToJsonAsync = function(csvString) {
    if (!csvString) {
        throw new Error('CSV string is required');
    }
    return csvToJsonAsync.csvStringToJsonAsync(csvString);
};

exports.csvFileToJsonAsync = function(filePath, encoding = 'utf8') {
    return csvToJsonAsync.csvFileToJsonAsync(filePath, encoding);
};

exports.toJson = function(csvString) {
    return csvToJson.toJson(csvString);
};

exports.toJsonAsync = function(csvString) {
    return csvToJsonAsync.toJsonAsync(csvString);
};

exports.parseString = function(csvString) {
    return csvToJson.parseString(csvString);
};

exports.parseFile = function(filePath, encoding = 'utf8') {
    return csvToJson.parseFile(filePath, encoding);
};

exports.parseFileAsync = function(filePath, encoding = 'utf8') {
    return csvToJsonAsync.parseFileAsync(filePath, encoding);
};

exports.parseStringAsync = function(csvString) {
    return csvToJsonAsync.parseString(csvString);
};

exports.parse = function(csvString) {
    return csvToJson.parseString(csvString);
};

exports.parseAsync = function(csvString) {
    return csvToJsonAsync.parseString(csvString);
};

exports.loadAndParse = function(filePath, encoding = 'utf8') {
    return csvToJson.csvFileToJson(filePath, encoding);
};

exports.loadAndParseAsync = function(filePath, encoding = 'utf8') {
    return csvToJsonAsync.csvFileToJsonAsync(filePath, encoding);
};

exports.stream = function(filePath) {
    return csvToJson.csvFileToJson(filePath);
};

exports.streamAsync = function(filePath) {
    return csvToJsonAsync.csvFileToJsonAsync(filePath);
};

exports.createParser = function(options = {}) {
    return new CsvToJson(options);
};

exports.createAsyncParser = function(options = {}) {
    return new CsvToJson(options);
};

// Error exports
exports.CsvToJsonError = CsvToJsonError;
exports.ConfigurationError = ConfigurationError;
exports.CsvFormatError = CsvFormatError;
exports.FileOperationError = FileOperationError;
exports.JsonValidationError = JsonValidationError;
exports.ParserConfig = ParserConfig;
exports.Configurable = Configurable;

// Browser API export
exports.browserApi = function() {
    return {
        csvToJson: csvToJson,
        csvToJsonAsync: csvToJsonAsync,
        createParser: exports.createParser,
        createAsyncParser: exports.createAsyncParser
    };
};
