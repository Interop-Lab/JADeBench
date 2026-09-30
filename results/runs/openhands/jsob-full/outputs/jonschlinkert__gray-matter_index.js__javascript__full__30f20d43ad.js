'use strict';

const fs = require('fs');
const yaml = require('js-yaml');
const kindOf = require('kind-of');
const sections = require('section-matter');
const stripBom = require('strip-bom-string');

const engines = {
  yaml: {
    parse: yaml.safeLoad.bind(yaml),
    stringify: yaml.safeDump.bind(yaml)
  },
  json: {
    parse: JSON.parse.bind(JSON),
    stringify(value, options) {
      const settings = Object.assign({ replacer: null, space: 2 }, options);
      return JSON.stringify(value, settings.replacer, settings.space);
    }
  },
  javascript: {
    parse: parseJavaScript,
    stringify() {
      throw new Error('stringifying JavaScript is not supported');
    }
  }
};

function parseJavaScript(source, _options, wrap) {
  try {
    if (wrap !== false) {
      source = `(function() {\nreturn ${source.trim()};\n}());`;
    }
    return eval(source) || {};
  } catch (error) {
    if (wrap !== false && /(unexpected|identifier)/i.test(error.message)) {
      return parseJavaScript(source, _options, false);
    }
    throw new SyntaxError(error);
  }
}

function define(object, key, value) {
  Reflect.defineProperty(object, key, {
    enumerable: false,
    configurable: true,
    writable: true,
    value
  });
}

function isBuffer(value) {
  return kindOf(value) === 'buffer';
}

function toBuffer(value) {
  return typeof value === 'string' ? Buffer.from(value) : value;
}

function toString(value) {
  if (isBuffer(value)) {
    return stripBom(String(value));
  }
  if (typeof value !== 'string') {
    throw new TypeError('expected input to be a string or buffer');
  }
  return stripBom(value);
}

function arrayify(value) {
  return value ? (Array.isArray(value) ? value : [value]) : [];
}

function startsWith(source, prefix, length) {
  if (typeof length !== 'number') {
    length = prefix.length;
  }
  return source.slice(0, length) === prefix;
}

function defaults(options) {
  const settings = Object.assign({}, options);
  settings.delimiters = arrayify(settings.delims || settings.delimiters || '---');
  if (settings.delimiters.length === 1) {
    settings.delimiters.push(settings.delimiters[0]);
  }
  settings.language = (settings.language || settings.lang || 'yaml').toLowerCase();
  settings.engines = Object.assign({}, engines, settings.parsers, settings.engines);
  return settings;
}

function getEngine(language, options) {
  let engine = options.engines[language] || options.engines[normalizeEngineName(language)];
  if (typeof engine === 'undefined') {
    throw new Error(`gray-matter engine "${language}" is not registered`);
  }
  if (typeof engine === 'function') {
    engine = { parse: engine };
  }
  return engine;
}

function normalizeEngineName(language) {
  switch (language.toLowerCase()) {
    case 'js':
    case 'javascript':
      return 'javascript';
    case 'coffee':
    case 'coffeescript':
    case 'cson':
      return 'coffee';
    case 'yaml':
    case 'yml':
      return 'yaml';
    default:
      return language;
  }
}

function parse(language, source, options) {
  const settings = defaults(options);
  const engine = getEngine(language, settings);
  if (typeof engine.parse !== 'function') {
    throw new TypeError(`expected "${language}.parse" to be a function`);
  }
  return engine.parse(source, settings);
}

function ensureTrailingNewline(value) {
  return value.slice(-1) !== '\n' ? `${value}\n` : value;
}

function stringify(file, data, options) {
  if (data == null && options == null) {
    switch (kindOf(file)) {
      case 'object':
        data = file.data;
        options = {};
        break;
      case 'string':
        return file;
      default:
        throw new TypeError('expected file to be a string or object');
    }
  }

  const content = file.content;
  const settings = defaults(options);
  if (data == null) {
    if (!settings.data) {
      return file;
    }
    data = settings.data;
  }

  const language = file.language || settings.language;
  const engine = getEngine(language, settings);
  if (typeof engine.stringify !== 'function') {
    throw new TypeError(`expected "${language}.stringify" to be a function`);
  }

  data = Object.assign({}, file.data, data);
  const openingDelimiter = settings.delimiters[0];
  const closingDelimiter = settings.delimiters[1];
  const serialized = engine.stringify(data, options).trim();
  let output = '';

  if (serialized !== '{}') {
    output =
      ensureTrailingNewline(openingDelimiter) +
      ensureTrailingNewline(serialized) +
      ensureTrailingNewline(closingDelimiter);
  }

  if (typeof file.excerpt === 'string' && file.excerpt !== '') {
    if (content.indexOf(file.excerpt.trim()) === -1) {
      output += ensureTrailingNewline(file.excerpt) + ensureTrailingNewline(closingDelimiter);
    }
  }

  return output + ensureTrailingNewline(content);
}

function extractExcerpt(file, options) {
  const settings = defaults(options);
  if (file.data == null) {
    file.data = {};
  }
  if (typeof settings.excerpt === 'function') {
    return settings.excerpt(file, settings);
  }

  const separator = file.data.excerpt_separator || settings.excerpt_separator;
  if (separator == null && (settings.excerpt === false || settings.excerpt == null)) {
    return file;
  }

  const marker =
    typeof settings.excerpt === 'string'
      ? settings.excerpt
      : separator || settings.delimiters[0];
  const index = file.content.indexOf(marker);
  if (index !== -1) {
    file.excerpt = file.content.slice(0, index);
  }
  return file;
}

function toFile(input) {
  const file = kindOf(input) === 'object' ? input : { content: input };
  if (kindOf(file.data) !== 'object') {
    file.data = {};
  }
  if (file.contents && file.content == null) {
    file.content = file.contents;
  }

  define(file, 'orig', toBuffer(file.content));
  define(file, 'language', file.language || '');
  define(file, 'matter', file.matter || '');
  define(file, 'stringify', function stringifyFile(data, options) {
    if (options && options.language) {
      file.language = options.language;
    }
    return stringify(file, data, options);
  });

  file.content = toString(file.content);
  file.isEmpty = false;
  file.excerpt = '';
  return file;
}

function matter(input, options) {
  if (input === '') {
    return {
      data: {},
      content: input,
      excerpt: '',
      orig: input
    };
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
  const openingDelimiter = settings.delimiters[0];
  const closingMarker = `\n${settings.delimiters[1]}`;
  let source = file.content;
  if (settings.language) {
    file.language = settings.language;
  }

  if (!startsWith(source, openingDelimiter, openingDelimiter.length)) {
    extractExcerpt(file, settings);
    return file;
  }
  if (source.charAt(openingDelimiter.length) === openingDelimiter.slice(-1)) {
    return file;
  }

  source = source.slice(openingDelimiter.length);
  const sourceLength = source.length;
  const language = matter.language(source, settings);
  if (language.name) {
    file.language = language.name;
    source = source.slice(language.raw.length);
  }

  let end = source.indexOf(closingMarker);
  if (end === -1) {
    end = sourceLength;
  }
  file.matter = source.slice(0, end);

  const meaningfulMatter = file.matter.replace(/^\s*#[^\n]+/gm, '').trim();
  if (meaningfulMatter === '') {
    file.isEmpty = true;
    file.empty = file.content;
    file.data = {};
  } else {
    file.data = parse(file.language, file.matter, settings);
  }

  if (end === sourceLength) {
    file.content = '';
  } else {
    file.content = source.slice(end + closingMarker.length);
    if (file.content[0] === '\r') {
      file.content = file.content.slice(1);
    }
    if (file.content[0] === '\n') {
      file.content = file.content.slice(1);
    }
  }

  extractExcerpt(file, settings);
  if (settings.sections === true || typeof settings.section === 'function') {
    sections(file, settings.section);
  }
  return file;
}

matter.engines = engines;

matter.stringify = function stringifyMatter(input, data, options) {
  const file = typeof input === 'string' ? matter(input, options) : input;
  return stringify(file, data, options);
};

matter.read = function read(filepath, options) {
  const source = fs.readFileSync(filepath, 'utf8');
  const file = matter(source, options);
  file.path = filepath;
  return file;
};

matter.test = function test(source, options) {
  return startsWith(source, defaults(options).delimiters[0]);
};

matter.language = function language(source, options) {
  const openingDelimiter = defaults(options).delimiters[0];
  if (matter.test(source)) {
    source = source.slice(openingDelimiter.length);
  }
  const raw = source.slice(0, source.search(/\r?\n/));
  return {
    raw,
    name: raw ? raw.trim() : ''
  };
};

matter.cache = {};

matter.clearCache = function clearCache() {
  matter.cache = {};
};

module.exports = matter;
