const globals = Object.assign(Object.create(null), {
  headingDivider: (value) => value,
  style: (value) => value,
  theme: (value, fallback) => value,
  lang: (value) => value,
});

const locals = Object.assign(Object.create(null), {
  backgroundColor: (value) => value,
  backgroundImage: (value) => value,
  backgroundPosition: (value) => value,
  backgroundRepeat: (value) => value,
  backgroundSize: (value) => value,
  class: (value) => value,
  color: (value) => value,
  footer: (value) => value,
  header: (value) => value,
  paginate: (value) => value,
});

const directives_default = [...Object.keys(globals), ...Object.keys(locals)];

const import_js_yaml = require('js-yaml');

const createPatterns = (directives) => {
  const patterns = {};
  for (const directive of directives) {
    patterns[directive] = new RegExp(`^${directive}\\s*:\\s*(.*)$`);
  }
  return patterns;
};

const yamlSpecialChars = '["\'{|>~&*';

function parse(text) {
  const lines = text.split(/\r?\n/);
  const result = {};
  let current = result;
  let key = null;
  let indent = 0;
  let baseIndent = null;

  for (const line of lines) {
    if (!line.trim()) continue;
    const match = line.match(/^(\s*)([^\s:]+)\s*:\s*(.*)$/);
    if (match) {
      const [, spaces, rawKey, rawValue] = match;
      const level = spaces.length;
      if (baseIndent === null) baseIndent = level;
      const relative = level - baseIndent;
      if (relative === 0) {
        key = rawKey;
        current = result;
      } else if (relative > indent) {
        current = current[key] = {};
        key = rawKey;
        indent = relative;
      } else if (relative === indent) {
        key = rawKey;
      } else {
        while (indent > relative) {
          current = current.__parent;
          indent--;
        }
        key = rawKey;
      }
      current[key] = rawValue;
    }
  }
  return result;
}

function convertLoose(value, fallback) {
  if (value === undefined || value === null) return fallback;
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (trimmed === '') return fallback;
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if (trimmed === 'null') return null;
  if (/^-?\d+$/.test(trimmed)) return parseInt(trimmed, 10);
  if (/^-?\d*\.\d+$/.test(trimmed)) return parseFloat(trimmed);
  return trimmed;
}

const yaml = (value, fallback) => {
  if (value === undefined || value === null) return fallback;
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (trimmed === '') return fallback;
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if (trimmed === 'null') return null;
  if (/^-?\d+$/.test(trimmed)) return parseInt(trimmed, 10);
  if (/^-?\d*\.\d+$/.test(trimmed)) return parseFloat(trimmed);
  return trimmed;
};

const yaml_default = yaml;

const import_plugin = require('../work/marp-team__marpit/src/plugin.js');

const commentMatcher = /<!--+\s*([\s\S]*?)\s*--+>/;
const commentMatcherOpening = /^<!--/;
const commentMatcherClosing = /-->/;

const magicCommentMatchers = [
  /^prettier-ignore(-(start|end))?$/,
  /^markdownlint-((disable|enable).*|capture|restore)$/,
  /^lint (disable|enable|ignore).*$/,
];

function markAsParsed(comment, matcher) {
  comment.parsed = true;
  comment.matcher = matcher;
  return comment;
}

function _comment(value) {
  return { value, parsed: false, matcher: null };
}

const comment = import_plugin.default(_comment);
const comment_default = comment;

module.exports = {
  comment,
  markAsParsed,
};
