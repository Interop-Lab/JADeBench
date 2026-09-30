import validator from 'validator';
import path from 'node:path';
import fsExtra from 'fs-extra';
import sanitizeFilename from 'sanitize-filename';

var invalidChars = '<>:"/\\|?*';

function sanitizer(input) {
    input = validator.blacklist(input, invalidChars);
    input = validator.trim(input);
    input = validator.escape(input);
    return input;
}

var sanitize_default = sanitizer;

function getFilepath(options) {
    let filepath = options.base;
    if (options.categories) {
        for (const category of options.categories.split('/')) {
            const sanitized = sanitizeFilename(sanitize_default(category));
            if (!sanitized || sanitized === '.' || sanitized === '..') {
                return null;
            }
            filepath += '/' + sanitized;
        }
    }
    if (options.filename) {
        filepath += '/' + sanitizeFilename(sanitize_default(options.filename));
    }
    filepath = path.normalize(filepath);
    const resolved = path.resolve(filepath);
    const baseResolved = path.resolve(options.base);
    if (!resolved.startsWith(baseResolved + path.sep)) {
        return null;
    }
    return filepath;
}

async function resolveFilepath(filepath) {
    if (await fsExtra.pathExists(filepath)) {
        return filepath;
    }
    return filepath + '.md';
}

function parseFileParam(param) {
    if (!param || param.trim() === '') {
        return null;
    }
    const parts = param.split('/').filter(part => part.length > 0);
    if (parts.length === 0) {
        return null;
    }
    if (parts.length > 1) {
        return {
            category: parts.slice(0, parts.length - 1).join('/'),
            filename: parts[parts.length - 1]
        };
    }
    return {
        category: '',
        filename: parts[0]
    };
}

var getFilepath_default = getFilepath;

export { getFilepath_default as default, parseFileParam, resolveFilepath };
