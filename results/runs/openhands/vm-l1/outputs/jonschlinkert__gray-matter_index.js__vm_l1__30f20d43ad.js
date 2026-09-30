'use strict';

const fs = require('fs');
const yaml = require('js-yaml');
const kindOf = require('kind-of');
const sections = require('section-matter');
const stripBom = require('strip-bom-string');

const utils = {
  define(object, key, value) {
    Reflect.defineProperty(object, key, {
      enumerable: false,
      configurable: true,
      writable: true,
      value
    });
  },

  isBuffer(value) {
    return value && value.buffer;
  },

  isObject(value) {
    return kindOf(value) === 'object';
  },

  toBuffer(value) {
    if (typeof value === 'string') {
      return Buffer.from(value);
    }
    return value;
  },

  toString(value) {
    if (utils.isBuffer(value)) {
      return stripBom(String(value));
    }
    if (typeof value !== 'string') {
      throw new TypeError('expected input to be a string or buffer');
    }
    return stripBom(value);
  },

  arrayify(value) {
    return Array.isArray(value) ? value : [value];
  },

  startsWith(string, substr, length) {
    if (typeof length !== 'number') {
      length = substr.length;
    }
    return string.slice(0, length) === substr;
  }
};

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
    parse: function parseJavaScript(source, options, wrap) {
      try {
        if (wrap !== false) {
          source = `(function() {\nreturn ${source.trim()};\n}());\n`;
        }
        return eval(source) || {};
      } catch (error) {
        if (wrap !== false && /(unexpected|identifier)/i.test(error.message)) {
          return parseJavaScript(source, options, false);
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
  const result = Object.assign({}, options);
  const delimiters = result.delims || result.delimiters || '---';

  result.delimiters = utils.arrayify(delimiters);
  if (result.delimiters.length === 1) {
    result.delimiters.push(result.delimiters[0]);
  }

  result.language = (result.language || result.lang || 'yaml').toLowerCase();
  result.engines = Object.assign({}, engines, result.parsers, result.engines);
  return result;
}

function normalizeLanguage(language) {
  const aliases = {
    js: 'javascript',
    coffee: 'coffeescript',
    cson: 'coffeescript',
    yml: 'yaml'
  };
  const normalized = (language || 'yaml').toLowerCase();
  return aliases[normalized] || normalized;
}

function getEngine(language, options) {
  const name = normalizeLanguage(language);
  const engine = options.engines[name] || engines[name];

  if (engine === undefined) {
    throw new Error(`gray-matter engine "${name}" is not registered`);
  }
  if (typeof engine.parse !== 'function') {
    throw new TypeError(`expected "${name}.parse" to be a function`);
  }
  return engine;
}

function parseData(source, options) {
  const engine = getEngine(options.language, options);
  return engine.parse(source, options);
}

function newline(value) {
  return value.slice(-1) === '\n' ? value : `${value}\n`;
}

function stringifyFile(file, data, options) {
  if (typeof file === 'string') {
    file = { content: file };
  }
  if (typeof data === 'string') {
    options = data;
    data = {};
  }
  if (kindOf(file) !== 'object' && typeof file !== 'string') {
    throw new TypeError('expected file to be a string or object');
  }

  data = Object.assign({}, file.data, data);
  const settings = defaults(options);
  const language = file.language || settings.language;
  const engine = getEngine(language, settings);
  if (typeof engine.stringify !== 'function') {
    throw new TypeError(`expected "${language}.stringify" to be a function`);
  }

  const delimiters = settings.delimiters;
  const open = delimiters[0];
  const close = delimiters[1];
  const matterBlock = engine.stringify(data, settings).trim();
  let output = '';

  if (matterBlock !== '{}') {
    output = newline(open);
    if (language !== 'yaml') {
      output += newline(language);
    }
    output += newline(matterBlock);
    output += newline(close);
  }

  if (file.excerpt && file.content.indexOf(file.excerpt.trim()) === -1) {
    output += newline(file.excerpt);
  }
  return output + file.content;
}

function extractExcerpt(file, options) {
  if (typeof options.excerpt === 'function') {
    return options.excerpt(file, options);
  }

  let separator = file.data.excerpt_separator || options.excerpt_separator;
  if (separator == null && options.excerpt !== false) {
    separator = options.excerpt;
  }
  if (separator == null) {
    return file;
  }
  if (typeof separator !== 'string') {
    separator = options.delimiters[0];
  }

  const index = file.content.indexOf(separator);
  if (index !== -1) {
    file.excerpt = file.content.slice(0, index);
  }
  return file;
}

function toFile(input) {
  let file = { content: input };
  if (kindOf(input) === 'object') {
    file = Object.assign({}, input);
  }

  if (file.content == null && file.contents != null) {
    file.content = file.contents;
  }
  file.data = utils.isObject(file.data) ? file.data : {};

  utils.define(file, 'orig', utils.toBuffer(file.content));
  utils.define(file, 'language', file.language || '');
  utils.define(file, 'matter', file.matter || '');
  utils.define(file, 'stringify', function stringify(data, options) {
    if (options && options.language) {
      file.language = options.language;
    }
    return stringifyFile(file, data, options);
  });

  file.content = utils.toString(file.content);
  file.isEmpty = false;
  file.excerpt = '';
  return file;
}

function parseMatter(file, options) {
  const settings = defaults(options);
  const open = settings.delimiters[0];
  const close = `\n${settings.delimiters[1]}`;
  let source = file.content;

  if (!utils.startsWith(source, open)) {
    return extractExcerpt(file, settings);
  }

  source = source.slice(open.length);
  const sourceLength = source.length;
  const language = matter.language(source, settings);
  if (language.name) {
    source = source.slice(language.raw.length);
    settings.language = language.name;
  }
  file.language = settings.language;

  let closeIndex = source.indexOf(close);
  if (closeIndex === -1) {
    closeIndex = sourceLength;
  }
  const matterEnd = source.charAt(closeIndex - 1) === '\r'
    ? closeIndex - 1
    : closeIndex;

  file.matter = source.slice(0, matterEnd);
  const meaningfulMatter = file.matter.replace(/^\s*#[^\n]+/gm, '').trim();
  file.data = parseData(file.matter, settings);
  file.content = source.slice(closeIndex + close.length);

  if (file.content.charAt(0) === '\r') {
    file.content = file.content.slice(1);
  }
  if (file.content.charAt(0) === '\n') {
    file.content = file.content.slice(1);
  }

  if (settings.excerpt) {
    extractExcerpt(file, settings);
  }
  if (settings.sections === true || typeof settings.section === 'function') {
    sections(file, settings.section);
  }

  file.isEmpty = meaningfulMatter === '';
  if (file.isEmpty) {
    file.empty = file.content;
  }
  return file;
}

function matter(input, options) {
  if (input === '') {
    return {
      data: {},
      content: '',
      excerpt: '',
      orig: input
    };
  }

  const file = toFile(input);
  const cached = matter.cache[file.content];
  if (!options && cached) {
    return Object.assign({}, cached);
  }

  const result = parseMatter(file, options);
  if (!options) {
    matter.cache[file.content] = result;
  }
  return result;
}

matter.engines = engines;

matter.stringify = function stringify(input, data, options) {
  if (typeof input === 'string') {
    input = matter(input, options);
  }
  return stringifyFile(input, data, options);
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
  if (matter.test(source)) {
    source = source.slice(open.length);
  }
  const raw = source.slice(0, source.search(/\r?\n/));
  return { raw, name: raw ? raw.trim() : '' };
};

matter.cache = {};
matter.clearCache = function clearCache() {
  matter.cache = {};
};

module.exports = matter;
