'use strict';
const fs = require('fs');

class CsvToJsonError extends Error {
    constructor(message, code, details = {}) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = 'CsvToJsonError';
        Error.captureStackTrace(this, this.constructor);
    }

    toString() {
        let result = `${this.name}: ${this.message}`;
        if (this.details && Object.keys(this.details).length > 0) {
            result += '\nDetails:\n';
            Object.entries(this.details).forEach(([key, value]) => {
                result += `  ${key}: ${this._formatValue(value)}\n`;
            });
        }
        return result;
    }

    _formatValue(value) {
        if (value === null) return 'null';
        if (value === undefined) return 'undefined';
        if (typeof value === 'string') return `"${value}"`;
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value);
    }
}

class FileOperationError extends CsvToJsonError {
    constructor(operation, path, originalError = '') {
        const message = `File operation failed: '${operation}' on '${path}'${originalError ? `\n${originalError}` : ''}`;
        super(message, 'FILE_OPERATION_ERROR', { operation, path, originalError });
        this.name = 'FileOperationError';
    }
}

class OptionConflictError extends CsvToJsonError {
    constructor(optionName, value, conflictingOption) {
        super(
            `Option conflict: '${optionName}' is set to '${value}', but conflicts with '${conflictingOption}'`,
            'OPTION_CONFLICT',
            { optionName, value, conflictingOption }
        );
        this.name = 'OptionConflictError';
    }

    static forInvalidType(optionName, value) {
        return new OptionConflictError(
            `Invalid type for option '${optionName}': expected boolean, got ${typeof value} (${value})`,
            { optionName, value, type: typeof value }
        );
    }
}

class CsvParseError extends CsvToJsonError {
    constructor(message, details = {}) {
        super(message, 'CSV_PARSE_ERROR', details);
        this.name = 'CsvParseError';
    }

    static emptyFile() {
        return new CsvParseError(
            'The CSV file is empty. Please provide a file with content or check the file path.'
        );
    }

    static invalidFormat(originalError) {
        return new CsvParseError(
            'Invalid CSV format detected',
            { originalError: originalError.message }
        );
    }

    static preview(originalError, csvPreview) {
        return new CsvParseError(
            `CSV parsing error near: "${csvPreview ? csvPreview.substring(0, 50) : 'unknown'}"`,
            { originalError, csvPreview }
        );
    }
}

class ValidationError extends CsvToJsonError {
    constructor(message, details = {}) {
        super(message, 'VALIDATION_ERROR', details);
        this.name = 'ValidationError';
    }

    static emptyResult() {
        return new ValidationError(
            'The conversion resulted in an empty array. Please check your CSV data and options.'
        );
    }

    static invalidHeaders(headers) {
        return new ValidationError(
            `Invalid or missing headers: ${headers}`,
            { headers }
        );
    }
}

const errors = {
    CsvToJsonError,
    FileOperationError,
    OptionConflictError,
    CsvParseError,
    ValidationError
};

const ENCODED_FILE_ENCODINGS = new Set(['base64', 'hex']);

class FileUtils {
    isEncodedFile(encoding) {
        return ENCODED_FILE_ENCODINGS.has(encoding);
    }

    decodeBuffer(buffer, encoding) {
        if (this.isEncodedFile(encoding)) {
            return Buffer.from(buffer, encoding).toString('utf8');
        }
        return buffer;
    }

    ensureString(content) {
        if (typeof content === 'string') return content;
        return content.toString();
    }

    createReadError(path, error) {
        return new FileOperationError('read', path, error);
    }

    createWriteError(path, error) {
        return new FileOperationError('write', path, error);
    }

    readFileSync(filePath, encoding = null) {
        if (this.isEncodedFile(encoding)) {
            const buffer = fs.readFileSync(filePath, encoding);
            return this.decodeBuffer(buffer, encoding);
        }
        return this.ensureString(fs.readFileSync(filePath, encoding));
    }

    readFile(filePath, encoding = 'utf8') {
        try {
            return this.readFileSync(filePath, encoding);
        } catch (error) {
            throw this.createReadError(filePath, error);
        }
    }

    readFileAsync(filePath, encoding = 'utf8') {
        if (this.isEncodedFile(encoding)) {
            return fs.promises.readFile(filePath, encoding)
                .then(buffer => this.decodeBuffer(buffer, encoding));
        }
        return fs.promises.readFile(filePath, encoding)
            .then(content => this.ensureString(content));
    }

    writeFileSync(filePath, content, encoding = 'utf8') {
        fs.writeFileSync(filePath, content, encoding);
    }

    writeFile(filePath, content, encoding = 'utf8') {
        return new Promise((resolve, reject) => {
            const callback = (err, data) => {
                if (err) {
                    reject(this.createWriteError(filePath, err));
                    return;
                }
                try {
                    const result = this.isEncodedFile(encoding)
                        ? this.decodeBuffer(this.ensureString(data), encoding)
                        : this.ensureString(data);
                    resolve(result);
                } catch (decodeError) {
                    reject(this.createWriteError(filePath, decodeError));
                }
            };

            const actualEncoding = this.isEncodedFile(encoding) ? null : encoding;
            fs.readFile(filePath, actualEncoding, callback);
        });
    }

    writeFileAsync(filePath, content, encoding = 'utf8') {
        const actualEncoding = this.isEncodedFile(encoding) ? null : encoding;
        return new Promise((resolve, reject) => {
            fs.writeFile(filePath, content, actualEncoding, err => {
                if (err) {
                    reject(this.createWriteError(filePath, err));
                    return;
                }
                resolve();
            });
        });
    }

    fileExists(filePath) {
        try {
            fs.accessSync(filePath);
            return true;
        } catch {
            return false;
        }
    }

    mkdirSync(dirPath, options) {
        fs.mkdirSync(dirPath, options);
    }

    mkdir(dirPath, options) {
        if (fs.promises && typeof fs.promises.mkdir === 'function') {
            return fs.promises.mkdir(dirPath, options);
        }
        return new Promise((resolve, reject) => {
            fs.mkdir(dirPath, options, err => {
                if (err) reject(err);
                else resolve();
            });
        });
    }
}

module.exports = new FileUtils();
