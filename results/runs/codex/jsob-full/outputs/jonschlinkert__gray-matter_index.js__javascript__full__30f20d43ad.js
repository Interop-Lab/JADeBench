'use strict';

const fs = require('fs');
const yaml = require('js-yaml');
const sections = require('section-matter');
const stripBom = require('strip-bom-string');

const defaultEngines = {
  yaml: {
    parse(source) { return yaml.load(source) || {}; },
    stringify(data) { return yaml.dump(data); }
  },
  json: {
    parse(source) { return JSON.parse(source); },
    stringify(data) { return JSON.stringify(data, null, 2); }
  },
  javascript: {
    parse(source) {
      const module = { exports: {} };
      Function('module', 'exports', source)(module, module.exports);
      return module.exports;
    },
    stringify() { throw new Error('stringifying JavaScript is not supported'); }
  }
};

function arrayify(value) { return Array.isArray(value) ? value : [value]; }

function normalizeOptions(options = {}) {
  const normalized = Object.assign({}, options);
  normalized.delimiters = arrayify(normalized.delims || normalized.delimiters || '---');
  if (normalized.delimiters.length === 1) normalized.delimiters.push(normalized.delimiters[0]);
  normalized.language = (normalized.language || normalized.lang || 'yaml').toLowerCase();
  normalized.engines = Object.assign({}, defaultEngines, normalized.parsers, normalized.engines);
  return normalized;
}

function toFile(input) {
  if (Buffer.isBuffer(input)) input = input.toString();
  if (typeof input === 'string') return { content: stripBom(input), data: {} };
  if (input && typeof input === 'object') {
    const file = Object.assign({}, input);
    if (Buffer.isBuffer(file.content)) file.content = file.content.toString();
    file.content = stripBom(file.content || '');
    file.data = file.data || {};
    return file;
  }
  throw new TypeError('expected a string, buffer, or object');
}

function resolveEngine(language, options) {
  const engine = options.engines[language];
  if (!engine) throw new Error(`engine "${language}" is not registered`);
  return typeof engine === 'function' ? { parse: engine } : engine;
}

function finish(file, options) {
  if (options.excerpt) {
    if (typeof options.excerpt === 'function') file.excerpt = options.excerpt(file, options);
    else {
      const separator = typeof options.excerpt_separator === 'string'
        ? options.excerpt_separator
        : options.excerpt === true ? '\n\n' : options.excerpt;
      const index = file.content.indexOf(separator);
      file.excerpt = index === -1 ? file.content : file.content.slice(0, index);
    }
  }
  if (options.sections) sections(file, options.section || options.sections);
  return file;
}

function parseMatter(file, options) {
  const normalized = normalizeOptions(options);
  const open = normalized.delimiters[0];
  const close = `\n${normalized.delimiters[1]}`;
  file.orig = file.orig || file.content;
  file.language = normalized.language;
  file.matter = '';
  file.data = file.data || {};
  file.isEmpty = false;
  file.excerpt = '';
  if (!file.content.startsWith(open)) return finish(file, normalized);

  let source = file.content.slice(open.length);
  const language = matter.language(source, normalized);
  if (language.name) {
    file.language = language.name;
    source = source.slice(language.raw.length);
  }
  let closeIndex = source.indexOf(close);
  if (closeIndex === -1) closeIndex = source.length;
  file.matter = source.slice(0, closeIndex);
  const meaningfulMatter = file.matter.replace(/^\s*#[^\n]+/gm, '').trim();
  file.content = closeIndex < source.length
    ? source.slice(closeIndex + close.length).replace(/^\r?\n/, '')
    : '';
  if (meaningfulMatter === '') {
    file.isEmpty = true;
    file.empty = file.content;
  } else {
    const engine = resolveEngine(file.language, normalized);
    file.data = Object.assign({}, file.data, engine.parse(file.matter, normalized));
  }
  return finish(file, normalized);
}

function matter(input, options) {
  if (input === '') return { data: {}, content: '', excerpt: '', orig: '' };
  const file = toFile(input);
  const cached = matter.cache[file.content];
  if (!options && cached) {
    const copy = Object.assign({}, cached);
    copy.orig = cached.orig;
    return copy;
  }
  if (!options) matter.cache[file.content] = file;
  return parseMatter(file, options);
}

matter.engines = defaultEngines;
matter.stringify = function stringify(input, data, options) {
  const file = typeof input === 'string' ? matter(input, options) : input;
  const normalized = normalizeOptions(options);
  const language = file.language || normalized.language;
  const engine = resolveEngine(language, normalized);
  const serialized = engine.stringify(Object.assign({}, file.data, data), normalized).trim();
  const languageTag = language === normalized.language ? '' : language;
  return `${normalized.delimiters[0]}${languageTag}\n${serialized}\n${normalized.delimiters[1]}\n${file.content}`;
};
matter.read = function read(filepath, options) {
  const file = matter(fs.readFileSync(filepath, 'utf8'), options);
  file.path = filepath;
  return file;
};
matter.test = function test(input, options) {
  return String(input).startsWith(normalizeOptions(options).delimiters[0]);
};
matter.language = function language(input, options) {
  const open = normalizeOptions(options).delimiters[0];
  let source = String(input);
  if (matter.test(source, options)) source = source.slice(open.length);
  const raw = source.slice(0, source.search(/\r?\n/));
  return { raw, name: raw ? raw.trim() : '' };
};
matter.cache = {};
matter.clearCache = function clearCache() { matter.cache = {}; };

module.exports = matter;
