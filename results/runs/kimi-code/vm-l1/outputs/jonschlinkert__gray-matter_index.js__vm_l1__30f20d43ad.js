'use strict';

const fs = require('fs');
const yaml = require('js-yaml');
const sections = require('section-matter');
const typeOf = require('kind-of');

const utils = {
  define(object, key, value) {
    Object.defineProperty(object, key, {
      configurable: true,
      enumerable: false,
      value,
      writable: true
    });
  },

  isBuffer(value) {
    return typeOf(value) === 'buffer';
  },

  isObject(value) {
    return typeOf(value) === 'object';
  },

  toBuffer(input) {
    return typeof input === 'string' ? Buffer.from(input) : input;
  },

  toString(input) {
    if (utils.isBuffer(input)) input = input.toString();
    if (typeof input !== 'string') {
      throw new TypeError('expected input to be a string or buffer');
    }
    return input.replace(/^\uFEFF/, '');
  },

  arrayify(value) {
    return value ? (Array.isArray(value) ? value : [value]) : [];
  },

  startsWith(string, substring, length) {
    return string.slice(0, length || substring.length) === substring;
  },

  isEmpty(value) {
    if (value == null) return true;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value !== 'object') return true;
    return Object.keys(value).length === 0;
  }
};

const parseYaml = yaml.load || yaml.safeLoad;
const stringifyYaml = yaml.dump || yaml.safeDump;

const engines = {
  yaml: {
    parse: parseYaml.bind(yaml),
    stringify: stringifyYaml.bind(yaml)
  },

  json: {
    parse: JSON.parse.bind(JSON),
    stringify(object, options) {
      const settings = Object.assign({ replacer: null, space: 2 }, options);
      return JSON.stringify(object, settings.replacer, settings.space);
    }
  },

  javascript: {
    parse(source, options, wrap) {
      try {
        if (wrap !== false) {
          source = `(function() {\nreturn ${source.trim()};\n}());`;
        }
        return eval(source) || {};
      } catch (error) {
        if (wrap !== false && /(unexpected|identifier)/i.test(error.message)) {
          return this.parse(source, options, false);
        }
        throw new SyntaxError(error);
      }
    },

    stringify() {
      throw new Error('stringifying JavaScript is not supported');
    }
  }
};

function defaults(options) {
  const settings = Object.assign({}, options);
  settings.delimiters = utils.arrayify(settings.delims || settings.delimiters || '---');
  if (settings.delimiters.length === 1) {
    settings.delimiters.push(settings.delimiters[0]);
  }
  settings.language = (settings.language || settings.lang || 'yaml').toLowerCase();
  settings.engines = Object.assign({}, engines, settings.parsers, settings.engines);
  return settings;
}

function normalizeLanguage(name) {
  const language = name.toLowerCase();
  if (language === 'js') return 'javascript';
  if (language === 'coffee') return 'coffeescript';
  if (language === 'cson') return 'coffeescript';
  if (language === 'yml') return 'yaml';
  return language;
}

function getEngine(name, options) {
  const language = normalizeLanguage(name);
  const engine = options.engines[language];
  if (typeof engine === 'undefined') {
    throw new Error(`gray-matter engine "${language}" is not registered`);
  }
  return typeof engine === 'function' ? { parse: engine } : engine;
}

function parse(input, options) {
  const engine = getEngine(options.language, options);
  if (typeof engine.parse !== 'function') {
    throw new TypeError(`expected "${options.language}.parse" to be a function`);
  }
  return engine.parse(input, options) || {};
}

function extractExcerpt(file, options) {
  if (typeof options.excerpt === 'function') {
    return options.excerpt(file, options);
  }

  const separator = typeof options.excerpt_separator === 'string'
    ? options.excerpt_separator
    : '---';
  const index = file.content.indexOf(separator);
  if (index !== -1) {
    file.excerpt = file.content.slice(0, index);
  }
}

function toFile(input) {
  let file = {
    data: {},
    content: '',
    excerpt: '',
    orig: Buffer.from('')
  };

  if (typeof input === 'string' || utils.isBuffer(input)) {
    file.orig = utils.toBuffer(input);
    file.content = utils.toString(input);
  } else if (utils.isObject(input)) {
    file = Object.assign({}, input);
    file.orig = utils.toBuffer(file.orig || file.content);
    file.content = utils.toString(file.content || file.contents);
    file.data = file.data || {};
  }
  return file;
}

function stringify(file, data, options) {
  if (typeof file === 'string') {
    file = { content: file };
  }
  if (!utils.isObject(file)) {
    throw new TypeError('expected file to be a string or object');
  }

  const output = Object.assign({}, file);
  const settings = defaults(options);
  const open = settings.delimiters[0];
  const close = settings.delimiters[1];
  const language = output.language || settings.language;
  const engine = getEngine(language, settings);
  const stringifyData = options && typeof options.stringify === 'function'
    ? options.stringify
    : engine.stringify;

  if (typeof stringifyData !== 'function') {
    throw new TypeError(`expected "${language}.stringify" to be a function`);
  }

  const matter = stringifyData(data, options).trim();
  let buffer = '';
  if (matter !== '{}') {
    buffer = `${open}\n${matter}\n${close}`;
  }
  if (output.excerpt && output.excerpt.indexOf(close) === -1) {
    buffer += output.excerpt;
  }
  return `${buffer}\n${output.content}`;
}

function matter(input, options) {
  if (input === '') {
    return { data: {}, content: input, excerpt: '', orig: input };
  }

  let file = toFile(input);
  const cached = matter.cache[file.content];
  if (!options) {
    if (cached) {
      file = Object.assign({}, cached);
      file.orig = cached.orig;
      return file;
    }
    matter.cache[file.content] = file;
  }
  return parseMatter(file, options);
}

function parseMatter(file, options) {
  const settings = defaults(options);
  const open = settings.delimiters[0];
  const close = `\n${settings.delimiters[1]}`;
  let source = file.content;

  if (settings.language) file.language = settings.language;
  if (settings.excerpt) extractExcerpt(file, settings);
  if (settings.sections === true || typeof settings.section === 'function') {
    sections(file, settings.section);
  }
  if (!utils.startsWith(source, open, open.length)) {
    return file;
  }

  source = source.charCodeAt(open.length) === 0xfeff
    ? source.slice(open.length + 1)
    : source.slice(open.length);

  const language = matter.language(source, settings);
  if (language.name) {
    file.language = language.name;
    settings.language = language.name;
    source = source.slice(language.raw.length);
  }

  let closeIndex = source.indexOf(close);
  if (closeIndex === -1) closeIndex = source.length;
  let raw = source.slice(0, closeIndex);
  if (raw.charAt(0) === '\n') raw = raw.slice(1);
  if (raw.charAt(raw.length - 1) === '\r') raw = raw.slice(0, -1);
  file.data = parse(raw, settings);
  file.content = closeIndex === source.length
    ? ''
    : source.slice(closeIndex + close.length);

  if (file.content.charAt(0) === '\r') file.content = file.content.slice(1);
  if (file.content.charAt(0) === '\n') file.content = file.content.slice(1);
  if (utils.isEmpty(file.data)) file.empty = raw;
  return file;
}

matter.engines = engines;
matter.stringify = function stringifyMatter(file, data, options) {
  if (typeof file === 'string') file = matter(file, options);
  return stringify(file, data, options);
};
matter.read = function read(path, options) {
  const file = matter(fs.readFileSync(path, 'utf8'), options);
  file.path = path;
  return file;
};
matter.test = function test(source, options) {
  return utils.startsWith(source, defaults(options).delimiters[0]);
};
matter.language = function language(source, options) {
  const settings = defaults(options);
  const open = settings.delimiters[0];
  if (matter.test(source)) source = source.slice(open.length);
  const raw = source.slice(0, source.search(/\r?\n/));
  return { raw, name: raw ? raw.trim() : '' };
};
matter.cache = {};
matter.clearCache = function clearCache() {
  matter.cache = {};
};

module.exports = matter;
