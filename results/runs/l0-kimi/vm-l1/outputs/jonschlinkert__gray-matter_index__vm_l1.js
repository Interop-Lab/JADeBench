'use strict';

const vm_0x5e3864_ed96a5 = {};

(function() {
    try { vm_0x5e3864_ed96a5.module = module; } catch(e) {}
    try { vm_0x5e3864_ed96a5.exports = exports; } catch(e) {}
    try { vm_0x5e3864_ed96a5.require = require; } catch(e) {}
    try { vm_0x5e3864_ed96a5.__dirname = __dirname; } catch(e) {}
    try { vm_0x5e3864_ed96a5.__filename = __filename; } catch(e) {}
})();

const jsYaml = require('js-yaml');
const fs = require('fs');
const sections = require('section-matter');

const engines = {
    yaml: {
        parse: jsYaml.safeLoad.bind(jsYaml),
        stringify: jsYaml.safeDump.bind(jsYaml)
    },
    json: {
        parse: JSON.parse.bind(JSON),
        stringify: function(value, replacer, space) {
            return JSON.stringify(value, replacer, space);
        }
    },
    javascript: {
        parse: function(str, options, wrap) {
            try {
                if (wrap !== false) {
                    str = '(function() {\nreturn ' + str.trim() + ';\n}());';
                }
                return eval(str) || {};
            } catch (err) {
                if (wrap !== false && /(unexpected|identifier)/i.test(err.message)) {
                    return this.parse(str, options, false);
                }
                throw new SyntaxError(err);
            }
        },
        stringify: function() {
            return '';
        }
    }
};

const defaults = {
    engines: engines,
    language: 'yaml',
    delimiters: ['---', '---'],
    excerpt: false,
    excerpt_separator: '\n---\n',
    engines2: engines
};

function matter(str, options) {
    if (typeof str !== 'string') {
        throw new TypeError('expected a string');
    }
    
    str = str.replace(/^\uFEFF/, '');
    
    const opts = Object.assign({}, defaults, options);
    const delims = opts.delimiters;
    
    let file = toFile(str, opts);
    
    if (opts.excerpt) {
        file = excerpt(file, opts);
    }
    
    const parsed = parseMatter(file.content, opts);
    
    file.data = parsed.data;
    file.content = parsed.content;
    file.orig = str;
    
    if (parsed.matter) {
        file.matter = parsed.matter;
    }
    
    return file;
}

function parseMatter(str, options) {
    const opts = Object.assign({}, defaults, options);
    const delims = opts.delimiters;
    
    let data = {};
    let content = str;
    let matter = '';
    
    if (!matter.test(str, opts)) {
        return { data: data, content: content, matter: matter };
    }
    
    const open = delims[0];
    const close = delims[1];
    
    const openLen = open.length;
    const closeLen = close.length;
    
    let start = str.indexOf(open);
    if (start !== 0) {
        return { data: data, content: content, matter: matter };
    }
    
    let end = str.indexOf(close, openLen);
    if (end === -1) {
        return { data: data, content: content, matter: matter };
    }
    
    matter = str.slice(0, end + closeLen);
    const lang = matter.language(str, opts);
    const body = str.slice(openLen, end).trim();
    
    if (body) {
        const engine = opts.engines[lang.name] || opts.engines[opts.language];
        if (engine && typeof engine.parse === 'function') {
            try {
                data = engine.parse(body, opts);
            } catch (err) {
                data = {};
            }
        }
    }
    
    content = str.slice(end + closeLen).trim();
    
    return { data: data, content: content, matter: matter };
}

function toFile(str, options) {
    return {
        content: str,
        data: {},
        orig: str,
        path: options && options.path ? options.path : null,
        excerpt: ''
    };
}

function excerpt(file, options) {
    const opts = Object.assign({}, defaults, options);
    const sep = opts.excerpt_separator;
    
    if (file.content.indexOf(sep) !== -1) {
        const parts = file.content.split(sep);
        file.excerpt = parts[0].trim();
        file.content = parts.slice(1).join(sep).trim();
    }
    
    return file;
}

function stringify(file, data, options) {
    if (typeof file === 'string') {
        file = matter(file, options);
    }
    
    const opts = Object.assign({}, defaults, options);
    const delims = opts.delimiters;
    const lang = opts.language;
    const engine = opts.engines[lang];
    
    let frontMatter = '';
    
    if (engine && typeof engine.stringify === 'function') {
        frontMatter = engine.stringify(file.data || data, opts);
    }
    
    if (frontMatter) {
        return delims[0] + '\n' + frontMatter.trim() + '\n' + delims[1] + '\n\n' + file.content;
    }
    
    return file.content;
}

matter.engines = engines;
matter.stringify = stringify;

matter.read = function(filepath, options) {
    const str = fs.readFileSync(filepath, 'utf8');
    const file = matter(str, options);
    file.path = filepath;
    return file;
};

matter.test = function(str, options) {
    const opts = Object.assign({}, defaults, options);
    return str.indexOf(opts.delimiters[0]) === 0;
};

matter.language = function(str, options) {
    const opts = Object.assign({}, defaults, options);
    const open = opts.delimiters[0];
    
    if (matter.test(str)) {
        str = str.slice(open.length);
    }
    
    const newline = str.search(/\r?\n/);
    const firstLine = str.slice(0, newline);
    
    return {
        raw: firstLine,
        name: firstLine ? firstLine.trim() : ''
    };
};

matter.cache = {};
matter.clearCache = function() {
    matter.cache = {};
};

module.exports = matter;
