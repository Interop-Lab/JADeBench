'use strict';

const fs = require('fs');
const yaml = require('js-yaml');
const kindOf = require('kind-of');
const parseSections = require('section-matter');
const stripBom = require('strip-bom-string');

const engines = {
  yaml: {
    parse: yaml.load.bind(yaml),
    stringify: yaml.dump.bind(yaml)
  },
  json: {
    parse: JSON.parse.bind(JSON),
    stringify(value, options) {
      const settings = Object.assign({ replacer: null, space: 2 }, options);
      return JSON.stringify(value, settings.replacer, settings.space);
    }
  },
  javascript: {
    parse(source, options, wrap = true) {
      try {
        if (wrap !== false) source = `(${source.trim()}\n)`;
        return eval(source) || {};
      } catch (error) {
        if (wrap !== false && /(unexpected|identifier)/i.test(error.message)) {
          return engines.javascript.parse(source, options, false);
        }
        throw new SyntaxError(error);
      }
    },
    stringify() {
      throw new Error('stringifying JavaScript is not supported');
    }
  }
};
engines.js = engines.javascript;
engines.yml = engines.yaml;

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function arrayify(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function toBuffer(value) {
  return typeof value === 'string' ? Buffer.from(value) : value;
}

function toFile(input) {
  if (kindOf(input) !== 'object') input = { content: input };
  if (kindOf(input.data) !== 'object') input.data = {};
  if (input.contents && input.content == null) input.content = input.contents;

  input.orig = toBuffer(input.content);
  input.language = input.language || '';
  input.matter = input.matter || '';
  input.stringify = function stringifyFile(language, options) {
    if (language && language.stringify) input.data = language.stringify(input.data, options);
    return stringify(input, language, options);
  };
  input.content = stripBom(String(input.content));
  input.isEmpty = false;
  input.excerpt = '';
  return input;
}

function normalizeOptions(options) {
  const result = Object.assign({}, options);
  result.delimiters = arrayify(result.delims || result.delimiters || '---');
  if (result.delimiters.length === 1) result.delimiters.push(result.delimiters[0]);
  result.language = (result.language || result.lang || 'yaml').toLowerCase();
  result.engines = Object.assign({}, engines, result.parsers, result.engines);
  return result;
}

function startsWith(source, prefix, length = prefix.length) {
  return source.slice(0, length) === prefix;
}

function normalizeLanguage(name) {
  switch (name.toLowerCase()) {
    case 'js':
    case 'javascript':
      return 'javascript';
    case 'yaml':
    case 'yml':
      return 'yaml';
    case 'json':
      return 'json';
    default:
      return name;
  }
}

function resolveEngine(name, options) {
  let engine = options.engines[name] || options.engines[normalizeLanguage(name)];
  if (typeof engine === 'undefined') throw new Error(`engine "${name}" is not registered`);
  if (typeof engine === 'function') engine = { parse: engine };
  return engine;
}

function language(source, options) {
  const settings = normalizeOptions(options);
  const opening = settings.delimiters[0];
  if (matter.test(source, settings)) source = source.slice(opening.length);
  const raw = source.slice(0, source.search(/\r?\n/));
  return { raw, name: raw ? raw.trim() : '' };
}

function parseData(languageName, source, options) {
  const engine = resolveEngine(languageName, options);
  if (typeof engine.parse !== 'function') {
    throw new TypeError(`expected engine "${languageName}" to have a parse function`);
  }
  return engine.parse(source, options);
}

function addExcerpt(file, options) {
  const settings = normalizeOptions(options);
  if (file.data == null) file.data = {};

  if (typeof settings.excerpt === 'function') return settings.excerpt(file, settings);
  const separator = file.data.excerpt_separator || settings.excerpt_separator;
  if (separator == null && settings.excerpt !== true) return file;

  const delimiter = typeof separator === 'string' ? separator : settings.delimiters[0];
  const index = file.content.indexOf(delimiter);
  file.excerpt = index === -1 ? file.content : file.content.slice(0, index);
  return file;
}

function addSections(file, options) {
  parseSections(file, {
    section_delimiter: options.section_delimiter || '---',
    parse(section, sections) {
      if (typeof options.section === 'function') options.section(section, sections);
      section.data = parseData(options.language, section.data, options);
    }
  });
}

function parseMatter(file, options) {
  const settings = normalizeOptions(options);
  const opening = settings.delimiters[0];
  const closing = `\n${settings.delimiters[1]}`;
  let source = file.content;
  if (settings.language) file.language = settings.language;

  if (!startsWith(source, opening, opening.length)) {
    addExcerpt(file, settings);
    return file;
  }
  if (source.charAt(opening.length) === opening.slice(-1)) return file;

  source = source.slice(opening.length);
  const length = source.length;
  const detected = matter.language(source, settings);
  if (detected.raw) {
    file.language = detected.name;
    source = source.slice(detected.raw.length);
  }

  let index = source.indexOf(closing);
  if (index === -1) index = length;
  file.matter = source.slice(0, index);
  const meaningfulMatter = file.matter.replace(/^\s*#[^\n]+/gm, '').trim();
  if (meaningfulMatter === '') {
    file.isEmpty = true;
    file.empty = file.content;
    file.data = {};
  } else {
    file.data = parseData(file.language, file.matter, settings);
  }

  if (index === length) {
    file.content = '';
  } else {
    file.content = source.slice(index + closing.length);
    if (file.content[0] === '\r') file.content = file.content.slice(1);
    if (file.content[0] === '\n') file.content = file.content.slice(1);
  }

  addExcerpt(file, settings);
  if (settings.sections === true || typeof settings.section === 'function') {
    addSections(file, settings);
  }
  return file;
}

function matter(input, options) {
  if (input === '') return { data: {}, content: '', excerpt: '', orig: '' };
  let file = toFile(input);
  const cached = matter.cache[file.content];
  if (!options && cached) {
    file = Object.assign({}, cached);
    file.orig = cached.orig;
    return file;
  }
  matter.cache[file.content] = file;
  return parseMatter(file, options);
}

function stringify(input, data, options) {
  if (data == null && options == null) {
    switch (kindOf(input)) {
      case 'object':
        data = input.data;
        options = {};
        break;
      case 'string':
        return input;
      default:
        throw new TypeError('expected input to be a string or object');
    }
  }

  const content = input.content;
  const settings = normalizeOptions(options);
  if (data == null) {
    if (!settings.data) return input;
    data = settings.data;
  }

  const languageName = input.language || settings.language;
  const engine = resolveEngine(languageName, settings);
  if (typeof engine.stringify !== 'function') {
    throw new TypeError(`expected engine "${languageName}" to have a stringify function`);
  }

  data = Object.assign({}, input.data, data);
  const opening = settings.delimiters[0];
  const closing = settings.delimiters[1];
  const serialized = engine.stringify(data, options).trim();
  let result = '';
  if (serialized !== '{}') result = `${ensureNewline(opening)}${ensureNewline(serialized)}${ensureNewline(closing)}`;

  if (typeof input.excerpt === 'string' && input.excerpt !== '' && content.indexOf(input.excerpt.trim()) === -1) {
    result += `${ensureNewline(input.excerpt)}${ensureNewline(closing)}`;
  }
  return result + ensureNewline(content);
}

function ensureNewline(value) {
  return value.slice(-1) !== '\n' ? `${value}\n` : value;
}

matter.engines = engines;
matter.stringify = function stringifyMatter(input, data, options) {
  if (typeof input === 'string') input = matter(input, options);
  return stringify(input, data, options);
};
matter.read = function read(filepath, options) {
  const result = matter(fs.readFileSync(filepath, 'utf8'), options);
  result.path = filepath;
  return result;
};
matter.test = function test(source, options) {
  return startsWith(source, normalizeOptions(options).delimiters[0]);
};
matter.language = language;
matter.cache = {};
matter.clearCache = function clearCache() {
  matter.cache = {};
};

module.exports = matter;
