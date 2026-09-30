'use strict';

const fs = require('fs');
const yaml = require('js-yaml');

const defaults = {
  delimiters: ['---', ';;;'],
  language: 'yaml',
  engines: {},
  excerpt: false,
  excerpt_separator: '---',
  data: {},
  excerpt_separator: '---'
};

function merge(target, source) {
  const result = Object.assign({}, target);
  if (!source || typeof source !== 'object') return result;

  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = merge(result[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }

  return result;
}

function getOptions(options) {
  options = options || {};
  const result = merge(defaults, options);

  if (typeof result.delimiters === 'string') {
    result.delimiters = [result.delimiters, result.delimiters];
  } else if (!Array.isArray(result.delimiters)) {
    result.delimiters = defaults.delimiters.slice();
  }

  return result;
}

function getEngine(language, options) {
  const engines = merge({
    yaml: {
      parse(value) {
        if (!value || !value.trim()) return {};
        return typeof yaml.safeLoad === 'function'
          ? yaml.safeLoad(value) || {}
          : yaml.load(value) || {};
      },
      stringify(value) {
        return typeof yaml.safeDump === 'function'
          ? yaml.safeDump(value)
          : yaml.dump(value);
      }
    },
    json: {
      parse: JSON.parse,
      stringify(value) {
        return JSON.stringify(value, null, 2);
      }
    },
    javascript: {
      parse(value, options, wrap) {
        let source = String(value);
        if (wrap !== false) {
          source = '(function() {\nreturn ' + source.trim() + '\n}());';
        }

        try {
          return eval(source) || {};
        } catch (err) {
          if (wrap !== false && /unexpected|identifier/i.test(err.message)) {
            return this.parse(value, options, false);
          }
          throw new SyntaxError(err);
        }
      },
      stringify() {
        return '';
      }
    }
  }, options.engines || {});

  return engines[language] || engines.yaml;
}

function parseFrontMatter(input, options) {
  const delimiters = options.delimiters;
  const open = delimiters[0];
  const close = delimiters[1] || open;
  const start = input.indexOf(open);

  if (start !== 0) {
    return {
      language: '',
      raw: '',
      data: {},
      content: input,
      frontMatter: '',
      empty: true,
      isEmpty: true
    };
  }

  const firstLineEnd = input.indexOf('\n');
  if (firstLineEnd === -1) {
    return {
      language: '',
      raw: '',
      data: {},
      content: input,
      frontMatter: '',
      empty: true,
      isEmpty: true
    };
  }

  const firstLine = input.slice(0, firstLineEnd).replace(/\r$/, '');
  if (firstLine !== open) {
    return {
      language: '',
      raw: '',
      data: {},
      content: input,
      frontMatter: '',
      empty: true,
      isEmpty: true
    };
  }

  const closingPattern = new RegExp(
    '(?:^|\\n)' + escapeRegExp(close) + '(?:\\r?\\n|$)'
  );
  const rest = input.slice(firstLineEnd + 1);
  const match = closingPattern.exec(rest);

  if (!match) {
    return {
      language: '',
      raw: '',
      data: {},
      content: input,
      frontMatter: '',
      empty: true,
      isEmpty: true
    };
  }

  const bodyStart = match.index + (match[0][0] === '\n' ? 1 : 0);
  const raw = rest.slice(0, bodyStart);
  const content = rest.slice(bodyStart + match[0].length - (match[0].endsWith('\n') ? 1 : 0));
  const language = detectLanguage(raw, options);
  const engine = getEngine(language, options);
  const data = engine.parse(raw, options);

  return {
    language,
    raw,
    data: data && typeof data === 'object' ? data : {},
    content,
    frontMatter: raw,
    empty: !raw.trim(),
    isEmpty: !raw.trim()
  };
}

function detectLanguage(raw, options) {
  const configured = options.language;
  if (configured) return configured;

  const firstLine = raw.split(/\r?\n/, 1)[0].trim();
  return firstLine || 'yaml';
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractExcerpt(content, options) {
  const separator = options.excerpt_separator;
  if (!separator) return '';

  const index = content.indexOf(separator);
  if (index === -1) return '';

  return content.slice(0, index).trim();
}

function matter(input, options) {
  const opts = getOptions(options);
  const source = String(input == null ? '' : input);
  const parsed = parseFrontMatter(source, opts);

  const file = {
    data: parsed.data,
    content: parsed.content,
    excerpt: opts.excerpt ? extractExcerpt(parsed.content, opts) : '',
    empty: parsed.empty,
    isEmpty: parsed.isEmpty,
    language: parsed.language,
    frontMatter: parsed.frontMatter,
    orig: source
  };

  return file;
}

matter.stringify = function stringify(input, data, options) {
  const opts = getOptions(options);

  if (typeof input !== 'string') {
    options = data;
    data = input;
    input = '';
  }

  const language = opts.language || 'yaml';
  const engine = getEngine(language, opts);
  const delimiter = Array.isArray(opts.delimiters)
    ? opts.delimiters[0]
    : opts.delimiters;

  const value = data == null ? {} : data;
  const frontMatter = engine.stringify(value, opts);
  const content = input == null ? '' : String(input);

  return delimiter + '\n' + frontMatter + delimiter + '\n' + content;
};

matter.read = function read(filepath, options) {
  const opts = getOptions(options);
  const encoding = opts.encoding || 'utf8';
  const source = fs.readFileSync(filepath, encoding);
  const file = matter(source, opts);
  file.path = filepath;
  return file;
};

matter.test = function test(input, options) {
  const opts = getOptions(options);
  const source = String(input == null ? '' : input);
  return source.indexOf(opts.delimiters[0]) === 0;
};

matter.language = function language(input, options) {
  const opts = getOptions(options);
  let source = String(input == null ? '' : input);

  if (matter.test(source, opts)) {
    source = source.slice(opts.delimiters[0].length);
  }

  const line = source.slice(0, source.search(/\r?\n|$/)).trim();
  return {
    raw: line,
    name: line ? line.toLowerCase() : ''
  };
};

matter.engines = {
  yaml: getEngine('yaml', defaults),
  json: getEngine('json', defaults),
  javascript: getEngine('javascript', defaults)
};

matter.clearCache = function clearCache() {
  return matter;
};

module.exports = matter;
