import validator from 'validator';
import path from 'node:path';
import fsExtra from 'fs-extra';
import sanitizeFilename from 'sanitize-filename';

var invalidChars = /[<>:"/\\|?*]/g;

function sanitizer(input) {
    input = validator.blacklist(input, invalidChars);
    input = validator.trim(input);
    input = validator.escape(input);
    return input;
}

var sanitize_default = sanitizer;

function getFilepath(params) {
    let filepath = params.base;
    
    if (params.segments) {
        for (const segment of params.segments.split('/')) {
            const sanitized = sanitizeFilename(sanitize_default(segment));
            if (!sanitized || sanitized === '.' || sanitized === '..') {
                return null;
            }
            filepath += '/' + sanitized;
        }
    }
    
    if (params.filename) {
        filepath += '/' + sanitizeFilename(sanitize_default(params.filename));
    }
    
    filepath = path.normalize(filepath);
    const resolved = path.resolve(filepath);
    const baseResolved = path.resolve(params.base);
    
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
    
    if (parts.length === 1) {
        return {
            category: '',
            filename: parts[0]
        };
    }
    
    return {
        category: parts.slice(0, parts.length - 1).join('/'),
        filename: parts[parts.length - 1]
    };
}

var getFilepath_default = getFilepath;

function routeCategoryCreate(config) {
    return async function(req, res) {
        const params = {
            base: config.content.base,
            segments: req.params.category
        };
        
        const filepath = getFilepath_default(params);
        
        if (!filepath) {
            return res.status(400).json({
                error: 1,
                message: config.messages.error.invalidPath || 'Invalid path'
            });
        }
        
        try {
            await fsExtra.ensureDir(filepath);
            res.status(200).json({
                error: 0,
                message: config.messages.success.created
            });
        } catch (err) {
            console.error('Failed to create category:', err.message);
            res.status(500).json({
                error: 1,
                message: config.messages.error.notCreated || 'Failed to create category'
            });
        }
    };
}

var categoryCreate_route_default = routeCategoryCreate;

export { categoryCreate_route_default as default };
