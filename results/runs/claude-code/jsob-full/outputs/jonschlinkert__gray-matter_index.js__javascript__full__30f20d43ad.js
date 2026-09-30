'use strict';

const fs = require('fs');
const yaml = require('js-yaml');
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
    parse(source, options, wrap) {
      try {
        if (wrap !== false) source = `(function() {\nreturn ${source.trim()};\n}());`;
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

function define(target, key, value) {
  Reflect.defineProperty(target, key, {
    configurable: true,
    enumerable: false,
    writable: true,
    value
  });
}

function isBuffer(value) {
  return value && value.constructor && typeof value.constructor.isBuffer === 'function'
    ? value.constructor.isBuffer(value)
    : false;
}

function toBuffer(value) {
  return typeof value === 'string' ? Buffer.from(value) : value;
}

function arrayify(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function startsWith(source, prefix, length) {
  if (typeof length !== 'number') length = prefix.length;
  return source.slice(0, length) === prefix;
}

function normalizeOptions(options) {
  const result = Object.assign({}, options);
  result.delimiters = arrayify(result.delims || result.delimiters || '---');
  if (result.delimiters.length === 1) result.delimiters.push(result.delimiters[0]);
  result.language = (result.language || result.lang || 'yaml').toLowerCase();
  result.engines = Object.assign({}, engines, result.parsers, result.engines);
  return result;
}

function engine(name, options) {
  let selected = options.engines[name] || options.engines[alias(name)];
  if (typeof selected === 'undefined') {
    throw new Error(`gray-matter engine "${name}" is not registered`);
  }
  if (typeof selected === 'function') selected = { parse: selected };
  return selected;
}

function alias(name) {
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

function parseData(language, source, options) {
  const selected = engine(language, options);
  if (typeof selected.parse !== 'function') {
    throw new TypeError(`expected engine "${language}" to have a parse method`);
  }
  return selected.parse(source, options);
}

function stringifyData(language, data, options) {
  const selected = engine(language, options);
  if (typeof selected.stringify !== 'function') {
    throw new TypeError(`expected engine "${language}" to have a stringify method`);
  }
  return selected.stringify(data, options);
}

function ensureNewline(value) {
  return value.slice(-1) !== '\n' ? `${value}\n` : value;
}

function toFile(input) {
  if (typeof input !== 'object' || isBuffer(input)) input = { content: input };
  if (typeof input.content !== 'string' && !isBuffer(input.content)) input.content = '';

  input.content = stripBom(input.content.toString());
  if (input.data == null) input.data = {};
  if (input.orig && input.original == null) input.original = input.orig;

  define(input, 'orig', toBuffer(input.original || input.content));
  define(input, 'language', input.language || '');
  define(input, 'matter', input.matter || '');
  define(input, 'stringify', function stringifyFile(data, options) {
    if (data && data.content) input.content = data.content;
    return stringify(input, data, options);
  });

  input.isEmpty = false;
  input.empty = '';
  return input;
}

function applyExcerpt(file, options) {
  if (file.data == null) file.data = {};
  if (typeof options.excerpt === 'function') return options.excerpt(file, options);

  const separator = file.data.excerpt_separator || options.excerpt_separator;
  if (separator == null && (options.excerpt === false || options.excerpt == null)) return file;

  const marker = typeof options.excerpt === 'string'
    ? options.excerpt
    : separator || options.delimiters[0];
  const index = file.content.indexOf(marker);
  if (index !== -1) file.excerpt = file.content.slice(0, index);
  return file;
}

function parseSections(file, options) {
  const delimiter = options.section_delimiter || '---';
  const lines = file.content.split(/\r?\n/);
  const sections = [];
  let section = { key: '', data: '', content: '' };
  let content = [];
  let stack = [];

  function closeSection(value) {
    if (stack.length === 0) return;
    section.key = stack[0].slice(delimiter.length).trim();
    section.content = value;
    if (typeof options.sections === 'function') options.sections(section, sections);
    sections.push(section);
    section = { key: '', data: '', content: '' };
    content = [];
    stack = [];
  }

  let foundSection = false;
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    const trimmed = line.trim();
    const isDelimiter = trimmed.slice(0, delimiter.length) === delimiter
      && trimmed.charAt(delimiter.length + 1) !== delimiter.slice(-1);

    if (!isDelimiter) {
      content.push(line);
      continue;
    }

    if (trimmed.length === 3 && index !== 0) {
      if (stack.length === 0 || stack.length === 2) {
        content.push(line);
        continue;
      }
      stack.push(trimmed);
      section.data = content.join('\n');
      content = [];
      continue;
    }

    if (!foundSection) {
      file.content = content.join('\n');
      foundSection = true;
      content = [];
    }
    if (stack.length === 2) closeSection(content.join('\n'));
    stack.push(trimmed);
  }

  if (!foundSection) file.content = content.join('\n');
  else closeSection(content.join('\n'));
  file.sections = sections;
}

function parseMatter(file, suppliedOptions) {
  const options = normalizeOptions(suppliedOptions);
  const open = options.delimiters[0];
  const close = `\n${options.delimiters[1]}`;
  let source = file.content;

  if (options.language) file.language = options.language;
  const openingLength = open.length;
  if (!startsWith(source, open, openingLength)) {
    applyExcerpt(file, options);
    return file;
  }
  if (source.slice(openingLength, openingLength + 1) === open.slice(-1)) return file;

  source = source.slice(openingLength);
  const language = matter.language(source, options);
  if (language.name) {
    file.language = language.name;
    source = source.slice(language.raw.length);
  }

  let closeIndex = source.indexOf(close);
  if (closeIndex === -1) closeIndex = source.length;
  file.matter = source.slice(0, closeIndex);

  const meaningfulMatter = file.matter.replace(/^\s*#[^\n]+/gm, '').trim();
  if (meaningfulMatter === '') {
    file.isEmpty = true;
    file.empty = file.content;
    file.data = {};
  } else {
    file.data = parseData(file.language, file.matter, options);
  }

  if (closeIndex === source.length) {
    file.content = '';
  } else {
    file.content = source.slice(closeIndex + close.length);
    if (file.content.charAt(0) === '\r') file.content = file.content.slice(1);
    if (file.content.charAt(0) === '\n') file.content = file.content.slice(1);
  }

  applyExcerpt(file, options);
  if (options.sections === true || typeof options.section === 'function') {
    if (typeof options.section === 'function' && typeof options.sections !== 'function') {
      options.sections = options.section;
    }
    parseSections(file, options);
  }
  return file;
}

function matter(input, options) {
  if (input === '') return { data: {}, content: input, excerpt: '', orig: input };

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

function stringify(file, data, suppliedOptions) {
  if (typeof file === 'string') file = matter(file, suppliedOptions);
  if (data == null && suppliedOptions == null) {
    if (isBuffer(file)) return file;
    if (typeof file === 'string') return file;
    data = file.data;
    suppliedOptions = {};
  }

  const options = normalizeOptions(suppliedOptions);
  if (data == null) {
    if (!options.data) return file;
    data = options.data;
  }

  const content = file.content;
  const language = file.language || options.language;
  const serialized = stringifyData(language, Object.assign({}, file.data, data), options).trim();
  let frontMatter = '';

  if (serialized !== '{}') {
    frontMatter = ensureNewline(options.delimiters[0])
      + ensureNewline(serialized)
      + ensureNewline(options.delimiters[1]);
  }
  if (typeof file.excerpt === 'string' && file.excerpt !== '') {
    if (content.indexOf(file.excerpt.trim()) === -1) {
      frontMatter += ensureNewline(file.excerpt) + ensureNewline(options.delimiters[1]);
    }
  }
  return frontMatter + ensureNewline(content);
}

matter.engines = engines;
matter.stringify = stringify;
matter.read = function read(filepath, options) {
  const buffer = fs.readFileSync(filepath, 'utf8');
  const file = matter(buffer, options);
  file.path = filepath;
  return file;
};
matter.test = function test(source, options) {
  const open = normalizeOptions(options).delimiters[0];
  if (isBuffer(source)) source = source.toString();
  return startsWith(source, open);
};
matter.language = function language(source, options) {
  const open = normalizeOptions(options).delimiters[0];
  if (matter.test(source, options)) source = source.slice(open.length);
  const raw = source.slice(0, source.search(/\r?\n/));
  return { raw, name: raw ? raw.trim() : '' };
};
matter.cache = {};
matter.clearCache = function clearCache() {
  matter.cache = {};
};

module.exports = matter;
