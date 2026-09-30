'use strict';

const fs = require('fs');
const yaml = require('js-yaml');
const sections = require('section-matter');
const kindOf = require('kind-of');
const stripBom = require('strip-bom-string');

function define(object, property, value) {
  Reflect.defineProperty(object, property, {
    enumerable: false,
    configurable: true,
    writable: true,
    value
  });
  return object;
}

function isBuffer(value) {
  return kindOf(value) === 'buffer';
}

function isObject(value) {
  return kindOf(value) === 'object';
}

function toBuffer(value) {
  return typeof value === 'string' ? Buffer.from(value) : value;
}

function toString(value) {
  if (isBuffer(value)) return value.toString();
  if (typeof value === 'string') return value;
  throw new TypeError('expected input to be a string or buffer');
}

function arrayify(value) {
  return Array.isArray(value) ? value : [value];
}

function startsWith(source, prefix, length) {
  if (typeof length !== 'number') length = prefix.length;
  return source.slice(0, length) === prefix;
}

const utils = {
  define,
  isBuffer,
  isObject,
  toBuffer,
  toString,
  arrayify,
  startsWith
};

function stringifyJson(value, options) {
  const settings = Object.assign({ replacer: null, space: 2 }, options);
  return JSON.stringify(value, settings.replacer, settings.space);
}

function stringifyJavaScript() {
  throw new Error('stringifying JavaScript is not supported');
}

function parseJavaScript(source, options, wrap) {
  try {
    if (wrap !== false) {
      source = `(function() {\nreturn ${source.trim()};\n}());`;
    }
    return eval(source) || {};
  } catch (error) {
    if (wrap !== false && /(unexpected|identifier)/i.test(error.message)) {
      return parseJavaScript(source, options, false);
    }
    throw new SyntaxError(error);
  }
}

const engines = {
  yaml: {
    parse: yaml.safeLoad.bind(yaml),
    stringify: yaml.safeDump.bind(yaml)
  },
  json: {
    parse: JSON.parse.bind(JSON),
    stringify: stringifyJson
  },
  javascript: {
    parse: parseJavaScript,
    stringify: stringifyJavaScript
  }
};

function normalizeOptions(options) {
  const settings = Object.assign({}, options);
  settings.delimiters = arrayify(settings.delims || settings.delimiters || '---');
  if (settings.delimiters.length === 1) settings.delimiters.push(settings.delimiters[0]);
  settings.language = settings.language || settings.lang || 'yaml';
  settings.engines = Object.assign({}, engines, settings.parsers, settings.engines);
  return settings;
}

function normalizeLanguage(language) {
  language = language.toLowerCase();
  switch (language) {
    case 'js':
      return 'javascript';
    case 'coffee':
      return 'coffeescript';
    case 'cson':
      return 'cson';
    case 'yaml':
    case 'yml':
      return 'yaml';
    default:
      return language;
  }
}

function getEngine(language, options) {
  const name = normalizeLanguage(language);
  const engine = options.engines[name];
  if (typeof engine === 'undefined') {
    throw new Error(`gray-matter engine "${name}" is not registered`);
  }
  if (typeof engine === 'function') return { parse: engine };
  return engine;
}

function toFile(input) {
  let file;
  if (isObject(input)) {
    file = input;
  } else {
    file = { content: input };
  }

  if (file.contents && file.content == null) file.content = file.contents;
  define(file, 'orig', toBuffer(file.content));
  file.content = toString(file.content);
  file.data = isObject(file.data) ? file.data : {};
  file.language = file.language || '';
  file.matter = file.matter || '';
  file.isEmpty = false;
  file.excerpt = file.excerpt || '';
  return file;
}

function extractExcerpt(file, options) {
  if (file.data && file.data.excerpt) {
    file.excerpt = file.data.excerpt;
    return file;
  }
  if (typeof options.excerpt === 'function') {
    file.excerpt = options.excerpt(file, options);
    return file;
  }
  if (options.excerpt === false) return file;

  const separator = options.excerpt_separator;
  if (typeof separator === 'string') {
    const index = file.content.indexOf(separator);
    if (index !== -1) file.excerpt = file.content.slice(0, index);
  }
  return file;
}

function parseMatter(file, options) {
  const settings = normalizeOptions(options);
  const open = settings.delimiters[0];
  const close = `\n${settings.delimiters[1]}`;

  if (!startsWith(file.content, open)) return file;

  const language = matter.language(file.content, settings);
  if (language.name) file.language = language.name;

  const openLength = open.length + language.raw.length;
  const closeIndex = file.content.indexOf(close, openLength);
  if (closeIndex === -1) return file;

  file.matter = file.content.slice(openLength, closeIndex);
  if (file.matter.charAt(0) === '\n') file.matter = file.matter.slice(1);

  const contentStart = closeIndex + close.length;
  file.content = file.content.slice(contentStart);
  if (file.content.charAt(0) === '\r') file.content = file.content.slice(1);
  if (file.content.charAt(0) === '\n') file.content = file.content.slice(1);

  if (file.matter.trim() === '') {
    file.isEmpty = true;
    file.empty = file.orig.toString();
    file.data = {};
  } else {
    const engine = getEngine(file.language || settings.language, settings);
    if (typeof engine.parse !== 'function') {
      throw new TypeError(`expected "${file.language || settings.language}.parse" to be a function`);
    }
    file.data = engine.parse(file.matter, settings) || {};
  }

  if (settings.sections === true || typeof settings.section === 'function') {
    sections(file, settings.section);
  }
  return extractExcerpt(file, settings);
}

function stringify(file, data, options) {
  if (data == null) return file;
  const settings = normalizeOptions(options);
  const document = typeof file === 'string' ? toFile(file) : file;
  if (!isObject(document)) throw new TypeError('expected file to be a string or object');

  document.data = Object.assign({}, document.data, data);
  const language = document.language || settings.language;
  const engine = getEngine(language, settings);
  if (typeof engine.stringify !== 'function') {
    throw new TypeError(`expected "${language}.stringify" to be a function`);
  }

  const open = settings.delimiters[0];
  const close = settings.delimiters[1];
  const header = document.language && document.language !== settings.language
    ? open + document.language
    : open;
  const matterSource = engine.stringify(document.data, settings).trim();
  const body = document.content ? `${document.content}\n` : '';
  return `${header}\n${matterSource}\n${close}\n${body}`;
}

function matter(input, options) {
  const settings = normalizeOptions(options);
  const file = toFile(input);
  const source = file.content;

  if (settings.cache !== false && matter.cache[source]) return matter.cache[source];
  const parsed = parseMatter(file, settings);
  define(parsed, 'orig', file.orig);
  define(parsed, 'language', parsed.language);
  define(parsed, 'matter', parsed.matter);
  define(parsed, 'stringify', function stringifyFile(data, stringifyOptions) {
    return stringify(parsed, data || parsed.data, stringifyOptions || settings);
  });

  if (settings.cache !== false) matter.cache[source] = parsed;
  return parsed;
}

matter.engines = engines;
matter.stringify = function stringifyMatter(input, data, options) {
  if (typeof input === 'string') input = matter(input, options);
  return stringify(input, data, options);
};
matter.read = function read(path, options) {
  const result = matter(fs.readFileSync(path, 'utf8'), options);
  result.path = path;
  return result;
};
matter.test = function test(source, options) {
  return startsWith(source, normalizeOptions(options).delimiters[0]);
};
matter.language = function language(source, options) {
  const marker = normalizeOptions(options).delimiters[0];
  if (matter.test(source, options)) source = source.slice(marker.length);
  const raw = source.slice(0, source.search(/\r?\n/));
  return { raw, name: raw ? raw.trim() : '' };
};
matter.cache = {};
matter.clearCache = function clearCache() {
  matter.cache = {};
};

module.exports = matter;
