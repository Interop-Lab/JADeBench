'use strict';

const fs = require('fs');
const yaml = require('js-yaml');
const parseYaml = typeof yaml.safeLoad === 'function'
  ? value => {
      try { return yaml.safeLoad(value); } catch (error) {
        if (!/removed in js-yaml 4/.test(error.message)) throw error;
        return yaml.load(value);
      }
    }
  : yaml.load.bind(yaml);
const stringifyYaml = (yaml.safeDump || yaml.dump).bind(yaml);

const engines = {
  yaml: { parse: parseYaml, stringify: stringifyYaml },
  json: { parse: JSON.parse.bind(JSON), stringify: (value, options) => JSON.stringify(value, null, 2) },
  javascript: {
    parse(value, options, fallback) {
      try {
        const source = fallback === false ? value : `(function() { return ${value}; }())`;
        return eval(source) || {};
      } catch (error) {
        if (fallback !== false && /unexpected|identifier/i.test(error.message)) return engines.javascript.parse(value, options, false);
        throw new SyntaxError(error);
      }
    },
    stringify() { return ''; }
  }
};

const cache = {};
const defaultOptions = { delimiters: ['---', '---'], language: 'yaml', engines };

function defaults(options) {
  if (typeof options === 'string') options = { language: options };
  options = options || {};
  return {
    ...defaultOptions,
    ...options,
    delimiters: options.delimiters || defaultOptions.delimiters,
    language: options.language || defaultOptions.language,
    engines: { ...engines, ...(options.engines || {}) }
  };
}

function parse(input, options) {
  const settings = defaults(options);
  const delimiters = settings.delimiters;
  const text = Buffer.isBuffer(input) ? input.toString() : String(input);
  const result = { data: {}, content: text, excerpt: '', orig: input };
  const open = delimiters[0];
  const close = delimiters[1] || open;
  if (!text.startsWith(open)) return result;
  const headerEnd = text.indexOf('\n', open.length);
  if (headerEnd < 0) return result;
  const closeAt = text.indexOf(`\n${close}`, headerEnd);
  if (closeAt < 0) return result;
  const closeEnd = text.indexOf('\n', closeAt + close.length + 1);
  const bodyEnd = closeEnd < 0 ? text.length : closeEnd + 1;
  const front = text.slice(headerEnd + 1, closeAt);
  const body = text.slice(bodyEnd);
  const engine = settings.engines[settings.language] || settings.engines.yaml;
  result.data = engine.parse(front, settings) || {};
  result.content = body;
  result.empty = front.trim() === '';
  const excerptMarker = settings.excerpt || 'excerpt';
  const marker = new RegExp(`<!--\\s*${excerptMarker}\\s*-->`);
  const markerMatch = body.match(marker);
  result.excerpt = markerMatch ? body.slice(0, markerMatch.index).trim() : '';
  if (!result.excerpt && settings.excerpt_separator) {
    const separator = body.indexOf(settings.excerpt_separator);
    if (separator >= 0) result.excerpt = body.slice(0, separator).trim();
  }
  return result;
}

function stringify(value, options, data) {
  if (typeof value === 'string') value = matter(value, data);
  const settings = defaults(data);
  const language = settings.language;
  const engine = settings.engines[language] || settings.engines.yaml;
  const front = engine.stringify(value.data || {}, options);
  const delimiters = settings.delimiters;
  return `${delimiters[0]}\n${front.trim()}\n${delimiters[1]}\n${value.content || ''}`;
}

function matter(input, options) {
  if (typeof input === 'object' && !Buffer.isBuffer(input)) return input;
  return parse(input, options);
}

matter.engines = engines;
matter.stringify = stringify;
matter.read = function read(file, options) {
  const parsed = matter(fs.readFileSync(file, 'utf8'), options);
  parsed.path = file;
  return parsed;
};
matter.test = function test(input, options) {
  return String(input).startsWith(defaults(options).delimiters[0]);
};
matter.language = function language(input, options) {
  const settings = defaults(options);
  let value = String(input);
  if (matter.test(value, options)) value = value.slice(settings.delimiters[0].length);
  const raw = value.slice(0, value.search(/\r?\n/));
  return { raw, name: raw.trim() };
};
matter.cache = cache;
matter.clearCache = function clearCache() { matter.cache = {}; };

module.exports = matter;
