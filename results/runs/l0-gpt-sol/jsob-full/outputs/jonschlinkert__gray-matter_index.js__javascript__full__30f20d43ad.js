'use strict';

const fs = require('fs');
const sections = require('section-matter');
const typeOf = require('kind-of');
const stripBom = require('strip-bom-string');
const yaml = require('js-yaml');

const engines = {
  yaml: {
    parse: yaml.load.bind(yaml),
    stringify: yaml.dump.bind(yaml)
  },

  json: {
    parse: JSON.parse.bind(JSON),
    stringify(data, options) {
      const opts = Object.assign({ replacer: null, space: 2 }, options);
      return JSON.stringify(data, opts.replacer, opts.space);
    }
  },

  javascript: {
    parse(str, options, wrap) {
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

    stringify() {
      throw new Error('stringifying JavaScript is not supported');
    }
  }
};

const utils = {
  define(obj, key, value) {
    Reflect.defineProperty(obj, key, {
      enumerable: false,
      configurable: true,
      writable: true,
      value
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
    if (utils.isBuffer(input)) {
      return stripBom(String(input));
    }
    if (typeof input !== 'string') {
      throw new TypeError('expected input to be a string or buffer');
    }
    return stripBom(input);
  },

  arrayify(value) {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  },

  startsWith(str, substr, len) {
    if (typeof len !== 'number') {
      len = substr.length;
    }
    return str.slice(0, len) === substr;
  }
};

function defaults(options) {
  const opts = Object.assign({}, options);

  opts.delimiters = utils.arrayify(
    opts.delims || opts.delimiters || '---'
  );

  if (opts.delimiters.length === 1) {
    opts.delimiters.push(opts.delimiters[0]);
  }

  opts.language = (opts.language || opts.lang || 'yaml').toLowerCase();
  opts.engines = Object.assign({}, engines, opts.parsers, opts.engines);
  return opts;
}

function alias(name) {
  switch (name.toLowerCase()) {
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
      return name;
  }
}

function getEngine(name, options) {
  let engine = options.engines[name] || options.engines[alias(name)];

  if (typeof engine === 'undefined') {
    throw new Error('engine "' + name + '" is not registered');
  }

  if (typeof engine === 'function') {
    engine = { parse: engine };
  }

  return engine;
}

function parse(language, str, options) {
  const opts = defaults(options);
  const engine = getEngine(language, opts);

  if (typeof engine.parse !== 'function') {
    throw new TypeError(
      'expected "' + language + '.parse" to be a function'
    );
  }

  return engine.parse(str, opts);
}

function ensureNewline(str) {
  return str.slice(-1) !== '\n' ? str + '\n' : str;
}

function stringify(file, data, options) {
  if (data == null && options == null) {
    switch (typeOf(file)) {
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
  const opts = defaults(options);

  if (data == null) {
    if (!opts.data) return file;
    data = opts.data;
  }

  const language = file.language || opts.language;
  const engine = getEngine(language, opts);

  if (typeof engine.stringify !== 'function') {
    throw new TypeError(
      'expected "' + language + '.stringify" to be a function'
    );
  }

  data = Object.assign({}, file.data, data);

  const open = opts.delimiters[0];
  const close = opts.delimiters[1];
  const matter = engine.stringify(data, options).trim();
  let result = '';

  if (matter !== '{}') {
    result =
      ensureNewline(open) +
      ensureNewline(matter) +
      ensureNewline(close);
  }

  if (typeof file.excerpt === 'string' && file.excerpt !== '') {
    if (content.indexOf(file.excerpt.trim()) === -1) {
      result += ensureNewline(file.excerpt) + ensureNewline(close);
    }
  }

  return result + ensureNewline(content);
}

function excerpt(file, options) {
  const opts = defaults(options);

  if (file.data == null) {
    file.data = {};
  }

  if (typeof opts.excerpt === 'function') {
    return opts.excerpt(file, opts);
  }

  const separator = file.data.excerpt_separator || opts.excerpt_separator;

  if (
    separator == null &&
    (opts.excerpt === false || opts.excerpt == null)
  ) {
    return file;
  }

  const delimiter =
    typeof opts.excerpt === 'string'
      ? opts.excerpt
      : separator || opts.delimiters[0];

  const index = file.content.indexOf(delimiter);
  if (index !== -1) {
    file.excerpt = file.content.slice(0, index);
  }

  return file;
}

function toFile(input) {
  if (typeOf(input) !== 'object') {
    input = { content: input };
  }

  if (typeOf(input.data) !== 'object') {
    input.data = {};
  }

  if (input.contents && input.content == null) {
    input.content = input.contents;
  }

  utils.define(input, 'orig', utils.toBuffer(input.content));
  utils.define(input, 'language', input.language || '');
  utils.define(input, 'matter', input.matter || '');
  utils.define(input, 'stringify', function(data, options) {
    if (options && options.language) {
      input.language = options.language;
    }
    return stringify(input, data, options);
  });

  input.content = utils.toString(input.content);
  input.isEmpty = false;
  input.empty = '';
  return input;
}

function parseMatter(file, options) {
  const opts = defaults(options);
  const open = opts.delimiters[0];
  const close = '\n' + opts.delimiters[1];
  let str = file.content;

  if (opts.language) {
    file.language = opts.language;
  }

  const openLength = open.length;

  if (!utils.startsWith(str, open, openLength)) {
    excerpt(file, opts);
    return file;
  }

  if (str.slice(openLength, openLength + 1) === open.slice(-1)) {
    return file;
  }

  str = str.slice(openLength);
  const length = str.length;
  const language = matter.language(str, opts);

  if (language.raw) {
    file.language = language.name;
    str = str.slice(language.raw.length);
  }

  let closeIndex = str.indexOf(close);
  if (closeIndex === -1) {
    closeIndex = length;
  }

  file.matter = str.slice(0, closeIndex);

  const block = file.matter.replace(/^\s*#[^\n]+/gm, '').trim();

  if (block === '') {
    file.isEmpty = true;
    file.empty = file.content;
    file.data = {};
  } else {
    file.data = parse(file.language, file.matter, opts);
  }

  if (closeIndex === length) {
    file.content = '';
  } else {
    file.content = str.slice(closeIndex + close.length);

    if (file.content[0] === '\r') {
      file.content = file.content.slice(1);
    }

    if (file.content[0] === '\n') {
      file.content = file.content.slice(1);
    }
  }

  excerpt(file, opts);

  if (opts.sections === true || typeof opts.section === 'function') {
    sections(file, opts.section);
  }

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

matter.engines = engines;

matter.stringify = function(file, data, options) {
  if (typeof file === 'string') {
    file = matter(file, options);
  }
  return stringify(file, data, options);
};

matter.read = function(filepath, options) {
  const input = fs.readFileSync(filepath, 'utf8');
  const file = matter(input, options);
  file.path = filepath;
  return file;
};

matter.test = function(str, options) {
  return utils.startsWith(
    str,
    defaults(options).delimiters[0]
  );
};

matter.language = function(str, options) {
  const opts = defaults(options);
  const open = opts.delimiters[0];

  if (matter.test(str, opts)) {
    str = str.slice(open.length);
  }

  const raw = str.slice(0, str.search(/\r?\n/));

  return {
    raw,
    name: raw ? raw.trim() : ''
  };
};

matter.cache = {};

matter.clearCache = function() {
  matter.cache = {};
};

module.exports = matter;
