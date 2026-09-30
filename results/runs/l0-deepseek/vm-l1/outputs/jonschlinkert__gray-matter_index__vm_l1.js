'use strict';

const yaml = require('js-yaml');

const engines = {
  yaml: {
    parse: yaml.safeLoad.bind(yaml),
    stringify: yaml.safeDump.bind(yaml)
  },
  json: {
    parse: JSON.parse.bind(JSON),
    stringify: function(obj, options) {
      return JSON.stringify(obj, null, options && options.indent || 2);
    }
  },
  javascript: {
    parse: function parse(str, options, wrap) {
      try {
        if (wrap !== false) {
          str = '(function() {\nreturn ' + str.trim() + ';\n}())';
        }
        return eval(str) || {};
      } catch (err) {
        if (wrap !== false && /(unexpected|identifier)/i.test(err.message)) {
          return parse(str, options, false);
        }
        throw new SyntaxError(err);
      }
    },
    stringify: function() {
      throw new Error('stringifying JavaScript is not supported');
    }
  }
};

const utils = {
  startsWith: function(str, substr) {
    return typeof str === 'string' && str.slice(0, substr.length) === substr;
  }
};

const defaults = function(options) {
  const opts = Object.assign({}, options);
  opts.delimiters = opts.delimiters || ['---', '---'];
  opts.engines = opts.engines || {};
  opts.engines.yaml = opts.engines.yaml || engines.yaml;
  opts.engines.json = opts.engines.json || engines.json;
  opts.engines.javascript = opts.engines.javascript || engines.javascript;
  return opts;
};

const engine = function(name, options) {
  const opts = defaults(options);
  const engine = opts.engines[name];
  if (typeof engine === 'undefined') {
    throw new Error('cannot find engine "' + name + '"');
  }
  return engine;
};

const stringify = function(file, data, options) {
  const opts = defaults(options);
  const delims = opts.delimiters;
  const engine = opts.engines[file.language || 'yaml'];
  const body = engine.stringify(data, opts);
  return delims[0] + (file.language ? file.language + '\n' : '\n') + body + '\n' + delims[1] + '\n' + file.content;
};

const excerpt = function(file, options) {
  const opts = defaults(options);
  const delimiter = opts.excerpt_delimiter || '---';
  const idx = file.content.indexOf(delimiter);
  if (idx !== -1) {
    file.excerpt = file.content.slice(0, idx);
    file.content = file.content.slice(idx + delimiter.length);
  }
  return file;
};

const toFile = function(file, path, options) {
  const fs = require('fs');
  fs.writeFileSync(path, stringify(file, file.data, options));
};

const parse = function(str, options) {
  const opts = defaults(options);
  const delims = opts.delimiters;
  const len = delims[0].length;
  if (!utils.startsWith(str, delims[0])) {
    return { content: str, data: {}, excerpt: '' };
  }
  str = str.slice(len);
  const lang = str.slice(0, str.indexOf('\n')).trim();
  str = str.slice(str.indexOf('\n') + 1);
  const end = str.indexOf('\n' + delims[1]);
  const dataStr = str.slice(0, end);
  const content = str.slice(end + delims[1].length + 1);
  const data = engine(lang || 'yaml', opts).parse(dataStr, opts);
  return excerpt({ content, data, language: lang || 'yaml' }, opts);
};

const fs = require('fs');
const sections = require('section-matter');

function matter(str, options) {
  const opts = defaults(options);
  const file = parse(str, opts);
  file.data = sections(file.content, opts);
  return file;
}

function parseMatter(str, options) {
  return parse(str, options);
}

matter.engines = engines;
matter.stringify = function(input, data, options) {
  if (typeof input === 'string') {
    input = matter(input, options);
  }
  return stringify(input, data, options);
};
matter.read = function(filepath, options) {
  const str = fs.readFileSync(filepath, 'utf8');
  const file = matter(str, options);
  file.path = filepath;
  return file;
};
matter.test = function(str, options) {
  return utils.startsWith(str, defaults(options).delimiters[0]);
};
matter.language = function(str, options) {
  const opts = defaults(options);
  const open = opts.delimiters[0];
  if (matter.test(str)) {
    str = str.slice(open.length);
  }
  const language = str.slice(0, str.search(/\r?\n/));
  return {
    raw: language,
    name: language ? language.trim() : ''
  };
};
matter.cache = {};
matter.clearCache = function() {
  matter.cache = {};
};

module.exports = matter;
