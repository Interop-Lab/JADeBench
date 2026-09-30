'use strict';

const fs = require('fs');
const yaml = require('js-yaml');
const sections = require('section-matter');
const stripBom = require('strip-bom-string');
const kindOf = require('kind-of');

const engines = {
  yaml: {
    parse: yaml.load.bind(yaml),
    stringify: yaml.dump.bind(yaml)
  },
  json: {
    parse: JSON.parse.bind(JSON),
    stringify(value, options) {
      const settings = Object.assign({}, options);
      return JSON.stringify(value, settings.replacer, settings.space);
    }
  },
  javascript: {
    parse(source, options, wrap = true) {
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

const utils = {
  define(target, key, value) {
    Reflect.defineProperty(target, key, {
      enumerable: false,
      configurable: true,
      writable: true,
      value
    });
  },

  isBuffer(value) {
    return kindOf(value) === 'buffer';
  },

  isObject(value) {
    return kindOf(value) === 'object';
  },

  toBuffer(value) {
    return typeof value === 'string' ? Buffer.from(value) : value;
  },

  toString(value) {
    if (this.isBuffer(value)) value = String(value);
    if (typeof value !== 'string') {
      throw new TypeError('expected input to be a string or buffer');
    }
    return stripBom(value);
  },

  arrayify(value) {
    return Array.isArray(value) ? value : [value];
  },

  startsWith(string, prefix, length) {
    if (typeof length === 'number') return string.slice(0, length) === prefix;
    return string.slice(0, prefix.length) === prefix;
  }
};

function defaults(options) {
  const settings = Object.assign({}, options);
  settings.delimiters = utils.arrayify(settings.delims || settings.delimiters || '---');
  if (settings.delimiters.length === 1) settings.delimiters.push(settings.delimiters[0]);
  settings.language = (settings.language || settings.lang || 'yaml').toLowerCase();
  settings.engines = Object.assign({}, engines, settings.parsers, settings.engines);
  return settings;
}

function normalizeLanguage(language) {
  const name = (language || '').toLowerCase();
  switch (name) {
    case 'js':
      return 'javascript';
    case 'coffee':
      return 'coffeescript';
    case 'cson':
      return 'cson';
    case 'yml':
      return 'yaml';
    default:
      return name;
  }
}

function getEngine(language, options) {
  const name = normalizeLanguage(language || options.language);
  const engine = options.engines[name];
  if (engine === undefined) {
    throw new Error(`gray-matter engine "${name}" is not registered`);
  }
  return engine;
}

function parseWithEngine(language, source, options) {
  const engine = getEngine(language, options);
  const parse = typeof engine === 'function' ? engine : engine.parse;
  if (typeof parse !== 'function') {
    throw new TypeError(`expected "${language}.parse" to be a function`);
  }
  return parse(source, options);
}

function toFile(input) {
  if (typeof input !== 'string' && !utils.isObject(input)) {
    throw new TypeError('expected file to be a string or object');
  }

  const file = typeof input === 'string' ? { content: input } : input;
  if (!utils.isObject(file.data)) file.data = {};
  if (file.contents && !file.content) file.content = file.contents;
  utils.define(file, 'orig', utils.toBuffer(file.content));
  file.content = utils.toString(file.content);
  file.language = file.language || '';
  file.matter = file.matter || '';
  file.stringify = function stringifyFile(data, options) {
    return stringify(file, data, options);
  };
  return file;
}

function extractExcerpt(file, options) {
  const settings = defaults(options);
  if (typeof settings.excerpt === 'function') {
    return settings.excerpt(file, settings);
  }

  const separator = settings.excerpt_separator || settings.delimiters[0];
  if (separator === false) return file;
  if (typeof separator !== 'string') {
    throw new TypeError('expected excerpt separator to be a string');
  }

  const index = file.content.indexOf(separator);
  if (index !== -1) file.excerpt = file.content.slice(0, index);
  return file;
}

function stripLeadingNewline(value) {
  return value.slice(0, 1) === '\n' ? value.slice(1) : value;
}

function stringify(file, data, options) {
  if (typeof file === 'string') file = { content: file };
  if (!utils.isObject(file)) {
    throw new TypeError('expected file to be a string or object');
  }
  if (options === undefined && data && (data.delimiters || data.engines || data.language)) {
    options = data;
    data = undefined;
  }

  const settings = defaults(options);
  const language = file.language || settings.language;
  const engine = getEngine(language, settings);
  if (typeof engine.stringify !== 'function') {
    throw new TypeError(`expected "${language}.stringify" to be a function`);
  }

  data = Object.assign({}, file.data, data);
  const delimiters = settings.delimiters;
  let matter = engine.stringify(data, settings).trim();
  if (matter === '{}') matter = '';

  let content = stripLeadingNewline(file.content || '');
  if (matter !== '') {
    matter = `${delimiters[0]}${language === 'yaml' ? '' : language}\n${matter}\n${delimiters[1]}`;
  }

  if (typeof file.excerpt === 'string' && file.excerpt !== '') {
    const text = file.excerpt.trim();
    if (content.indexOf(text) === -1) content = `${file.excerpt}\n${content}`;
  }

  return matter === '' ? content : `${matter}\n${content}`;
}

function parseMatter(file, options) {
  const settings = defaults(options);
  let opening = settings.delimiters[0];
  const closing = `\n${settings.delimiters[1]}`;
  let source = file.content;

  if (!utils.startsWith(source, opening)) return file;
  source = source.slice(opening.length);

  const language = matter.language(source, settings);
  if (language.name) {
    opening += language.raw;
    source = source.slice(language.raw.length);
  }

  if (source.slice(0, 1) === '\r') source = source.slice(1);
  if (source.slice(0, 1) === '\n') source = source.slice(1);

  let closeIndex = source.indexOf(closing);
  if (closeIndex === -1) closeIndex = source.length;

  file.matter = source.slice(0, closeIndex);
  const contentStart = closeIndex === source.length ? closeIndex : closeIndex + closing.length;
  file.content = stripLeadingNewline(source.slice(contentStart));
  file.data = parseWithEngine(language.name || settings.language, file.matter, settings);

  if (settings.excerpt) extractExcerpt(file, settings);
  if (settings.sections) sections(file, settings.section);
  return file;
}

function matter(input, options) {
  if (input === '') {
    return { data: {}, content: '', excerpt: '', orig: input };
  }

  const file = toFile(input);
  const cached = matter.cache[file.content];
  if (!options) {
    if (cached) return Object.assign({}, cached);
    matter.cache[file.content] = file;
  }
  return parseMatter(file, options);
}

matter.engines = engines;
matter.stringify = function stringifyMatter(input, data, options) {
  if (typeof input === 'string') input = matter(input, options);
  return stringify(input, data, options);
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
  const opening = settings.delimiters[0];
  if (matter.test(source, settings)) source = source.slice(opening.length);
  const raw = source.slice(0, source.search(/\r?\n/));
  return { raw, name: raw ? raw.trim() : '' };
};
matter.cache = {};
matter.clearCache = function clearCache() {
  matter.cache = {};
};

module.exports = matter;
