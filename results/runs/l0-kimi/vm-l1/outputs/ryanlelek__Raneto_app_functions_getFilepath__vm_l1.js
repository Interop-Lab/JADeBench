import validator from 'validator';
import path from 'node:path';
import fs from 'fs-extra';
import sanitizeFilename from 'sanitize-filename';

let globalThisRef = typeof globalThis !== 'undefined' ? globalThis :
    typeof global !== 'undefined' ? global :
    typeof window !== 'undefined' ? window :
    typeof self !== 'undefined' ? self : void 0;

let vmNamespace = globalThisRef['vm_0x3317a9_65f84c'] || (globalThisRef['vm_0x3317a9_65f84c'] = {});

(function() {
    if (!vmNamespace['module']) {
        try { vmNamespace['module'] = module; } catch(e) {}
    }
    if (!vmNamespace['exports']) {
        try { vmNamespace['exports'] = exports; } catch(e) {}
    }
    if (!vmNamespace['require']) {
        try { vmNamespace['require'] = require; } catch(e) {}
    }
    if (!vmNamespace['__dirname']) {
        try { vmNamespace['__dirname'] = __dirname; } catch(e) {}
    }
    if (!vmNamespace['__filename']) {
        try { vmNamespace['__filename'] = __filename; } catch(e) {}
    }
})();

function sanitizer(input) {
    if (typeof input !== 'string') {
        return input;
    }
    return input.replace(/[&'"\/><]/g, '');
}

function getFilepath(filepath) {
    if (!filepath) return null;
    
    let sanitized = sanitizer(filepath);
    
    if (!sanitized) return null;
    
    if (sanitized.includes('..')) {
        return null;
    }
    
    return path.join(process.cwd(), sanitized);
}

function resolveFilepath(filepath) {
    const resolved = getFilepath(filepath);
    if (!resolved) {
        throw new Error('Invalid filepath');
    }
    return resolved;
}

function parseFileParam(param) {
    if (!param) return null;
    
    if (typeof param === 'string') {
        return getFilepath(param);
    }
    
    if (param.filepath) {
        return getFilepath(param.filepath);
    }
    
    return null;
}

export default getFilepath;
export { parseFileParam, resolveFilepath };
