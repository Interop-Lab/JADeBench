'use strict';

const fs = require('fs');
const sections = require('section-matter');
const yaml = require('js-yaml');
const stripBom = require('strip-bom-string');

const engines = {
  yaml: {
    parse: yaml.safeLoad.bind(yaml),
    stringify: yaml.safeDump.bind(yaml)
  },
  json: {
    parse: JSON.parse.bind(JSON),
    stringify(value, options) {
      const opts = Object.assign({replacer: null, space: 2}, options);
      return JSON.stringify(value, opts.replacer, opts.space);
    }
  },
  javascript: {
    parse(value, options, wrap) {
      try {
        if (wrap !== false) value = `(function() { return ${value.trim()}; }())`;
        return eval(value) || {};
      } catch (error) {
        if (wrap !== false && /(unexpected|identifier)/i.test(error.message)) {
          return this.parse(value, options, false);
        }
        throw new SyntaxError(error);
      }
    },
    stringify() {
      throw new Error('cannot stringify JavaScript');
    }
  }
};

const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const arrayify = value => value == null ? [] : Array.isArray(value) ? value : [value];
const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
const define = (object, key, value) => Object.defineProperty(object, key, {
  configurable: true,
  enumerable: false,
  writable: true,
  value
});

function defaults(options) {
  const opts = Object.assign({}, options);
  opts.delimiters = arrayify(opts.delims || opts.delimiters || '---');
  if (opts.delimiters.length === 1) opts.delimiters.push(opts.delimiters[0]);
  opts.language = (opts.language || opts.lang || 'yaml').toLowerCase();
  opts.engines = Object.assign({}, engines, opts.parsers, opts.engines);
  return opts;
}

function parseMatter(file, options) {
  const engine = options.engines[file.language];
  if (typeof engine === 'function') return engine(file.matter, options);
  if (engine && typeof engine.parse === 'function') return engine.parse(file.matter, options);
  throw new Error(`engine "${file.language}" is not registered`);
}

function addExcerpt(file, options) {
  if (typeof options.excerpt === 'function') {
    file.excerpt = options.excerpt(file, options);
    return;
  }
  const separator = options.excerpt_separator || options.excerptSeparator;
  if (separator) {
    const index = file.content.indexOf(separator);
    file.excerpt = index === -1 ? '' : file.content.slice(0, index);
    return;
  }
  if (options.excerpt === true) {
    file.excerpt = file.content.split(/^\s*<!--\s*more\s*-->\s*$/m)[0];
  }
}

function stringify(value, data, options) {
  if (data == null && isObject(value)) data = value.data;
  const opts = defaults(options);
  const open = opts.delimiters[0];
  const close = opts.delimiters[1];
  const language = value.language || opts.language;
  const engine = opts.engines[language];
  let content = typeof value === 'string' ? value : value.content || '';
  data = data || {};

  let matter;
  if (typeof engine === 'function') matter = engine(data, opts);
  else if (engine && typeof engine.stringify === 'function') matter = engine.stringify(data, opts);
  else throw new Error(`engine "${language}" is not registered`);

  matter = String(matter == null ? '' : matter).trim();
  if (!matter) return content;
  if (content && content.charAt(0) !== '\n') content = `\n${content}`;
  return `${open}\n${matter}\n${close}${content}`;
}

function createFile(input) {
  if (input === '') return {data: {}, content: '', excerpt: '', orig: ''};
  if (isObject(input) && typeof input.content === 'string') input = Object.assign({}, input);
  else if (typeof input === 'string' || Buffer.isBuffer(input)) input = {content: input};
  else throw new TypeError('expected input to be a string or buffer');

  const source = input.content;
  input.data = input.data || {};
  input.content = stripBom(Buffer.isBuffer(source) ? source.toString() : source);
  define(input, 'orig', Buffer.from(input.content));
  define(input, 'language', 'yaml');
  define(input, 'matter', '');
  define(input, 'stringify', function(options) {
    return stringify(this, this.data, options);
  });
  return input;
}

function matter(input, options) {
  const file = createFile(input);
  if (input === '') return file;
  const opts = defaults(options);
  const open = opts.delimiters[0];
  const close = `\n${opts.delimiters[1]}`;
  const source = file.content;

  if (!source.startsWith(open)) {
    file.isEmpty = false;
    file.excerpt = '';
    addExcerpt(file, opts);
    if (opts.sections === true || typeof opts.section === 'function') {
      sections(file, opts.section);
    }
    return file;
  }

  file.language = matter.language(source, opts).name || opts.language;
  const firstLineEnd = source.indexOf('\n');
  const start = firstLineEnd === -1 ? source.length : firstLineEnd;
  let end = source.indexOf(close, start);
  if (end === -1) end = source.length;
  file.matter = source.slice(start, end);

  const meaningful = file.matter.replace(/^\s*#[^\n]+/gm, '').trim();
  if (meaningful === '') {
    file.isEmpty = true;
    file.excerpt = '';
    file.empty = source;
    file.data = {};
  } else {
    file.isEmpty = false;
    file.excerpt = '';
    file.data = parseMatter(file, opts);
  }

  if (end === source.length) {
    file.content = '';
  } else {
    file.content = source.slice(end + close.length);
    if (file.content.charAt(0) === '\r') file.content = file.content.slice(1);
    if (file.content.charAt(0) === '\n') file.content = file.content.slice(1);
  }

  addExcerpt(file, opts);
  if (opts.sections === true || typeof opts.section === 'function') {
    sections(file, opts.section);
  }
  return file;
}

matter.engines = engines;
matter.stringify = function(value, data, options) {
  if (typeof value === 'string') value = matter(value, options);
  return stringify(value, data, options);
};
matter.read = function(filepath, options) {
  const file = matter(fs.readFileSync(filepath, 'utf8'), options);
  file.path = filepath;
  return file;
};
matter.test = function(value, options) {
  return String(value).startsWith(defaults(options).delimiters[0]);
};
matter.language = function(value, options) {
  const opts = defaults(options);
  const delimiter = opts.delimiters[0];
  if (matter.test(value, opts)) value = String(value).slice(delimiter.length);
  const raw = String(value).slice(0, String(value).search(/\r?\n/));
  return {raw, name: raw ? raw.trim() : ''};
};
matter.cache = {};
matter.clearCache = function() {
  matter.cache = {};
};

module.exports = matter;
