'use strict';

const { load, JSON_SCHEMA } = require('js-yaml');

const COMMENT_PATTERN = /<!--+\s*([\s\S]*?)\s*--+>/;
const COMMENT_OPENING_PATTERN = /^<!--/;
const COMMENT_CLOSING_PATTERN = /-->/;
const MAGIC_COMMENT_PATTERNS = [
  /^prettier-ignore(-(start|end))?$/,
  /^markdownlint-((disable|enable).*|capture|restore)$/,
  /^lint (disable|enable|ignore).*$/,
];

const globalDirectives = Object.assign(Object.create(null), {
  headingDivider(value) {
    const allowedLevels = [1, 2, 3, 4, 5, 6];
    const normalize = (level) =>
      Array.isArray(level) || Number.isInteger(level)
        ? level
        : Number.parseInt(level, 10);
    const normalized = normalize(value);

    if (Array.isArray(normalized)) {
      const selected = normalized.map(normalize);
      return {
        headingDivider: allowedLevels.filter((level) => selected.includes(level)),
      };
    }
    if (value === false) return { headingDivider: false };
    if (allowedLevels.includes(normalized)) return { headingDivider: normalized };
    return {};
  },
  style: (style) => ({ style }),
  theme: (theme, marpit) =>
    marpit.themeSet.has(theme) ? { theme } : {},
  lang: (lang) => ({ lang }),
});

const localDirectives = Object.assign(Object.create(null), {
  backgroundColor: (backgroundColor) => ({ backgroundColor }),
  backgroundImage: (backgroundImage) => ({ backgroundImage }),
  backgroundPosition: (backgroundPosition) => ({ backgroundPosition }),
  backgroundRepeat: (backgroundRepeat) => ({ backgroundRepeat }),
  backgroundSize: (backgroundSize) => ({ backgroundSize }),
  class: (value) => ({ class: Array.isArray(value) ? value.join(' ') : value }),
  color: (color) => ({ color }),
  footer: (footer) => (typeof footer === 'string' ? { footer } : {}),
  header: (header) => (typeof header === 'string' ? { header } : {}),
  paginate(value) {
    const normalized = (value || '').toString().toLowerCase();
    return {
      paginate: ['true', 'false'].includes(normalized)
        ? normalized
        : Boolean(normalized),
    };
  },
});

const directiveNames = [
  ...Object.keys(globalDirectives),
  ...Object.keys(localDirectives),
];
const YAML_SPECIAL_CHARACTERS = `"'{|>~&*`;

function createDirectivePatterns(names) {
  const patterns = new Set();
  for (const name of names) {
    const escaped = `_?${name.replace(/[.*+?^=!:${}()|[\]\\/]/g, '\\$&')}`;
    patterns.add(escaped);
    patterns.add(`"${escaped}"`);
    patterns.add(`'${escaped}'`);
  }
  return [...patterns.values()];
}

function parseYaml(source) {
  try {
    const parsed = load(source, { schema: JSON_SCHEMA });
    return parsed === null || typeof parsed !== 'object' ? false : parsed;
  } catch {
    return false;
  }
}

function convertLooseYaml(source, names) {
  const directivePattern = `(${createDirectivePatterns(names).join('|')})`;
  const linePattern = new RegExp(`^(${directivePattern}:\\s*)(.*)$`);
  let converted = '';

  for (const line of source.split(/\r?\n/)) {
    converted += line.replace(linePattern, (match, prefix, _name, value) => {
      const trimmed = value.trim();
      if (trimmed.length === 0 || YAML_SPECIAL_CHARACTERS.includes(trimmed[0])) {
        return match;
      }
      const leadingWhitespace = value.length - value.trimStart().length;
      const indentation = value.substring(0, leadingWhitespace);
      return `${prefix}${indentation}"${trimmed.replace(/"/g, '\\"')}"`;
    }) + '\n';
  }
  return converted.trim();
}

function yaml(source, loose = false) {
  const extraDirectives = Array.isArray(loose) ? loose : [];
  return parseYaml(
    loose
      ? convertLooseYaml(source, [...directiveNames, ...extraDirectives])
      : source,
  );
}

function markAsParsed(token, parsed) {
  token.meta = token.meta || {};
  token.meta.marpitCommentParsed = parsed;
}

function applyCommentMetadata(token, content, marpit) {
  const parsed = yaml(content, Boolean(marpit.options.looseYAML));
  token.meta = token.meta || {};
  token.meta.marpitComment = parsed || {};

  for (const pattern of MAGIC_COMMENT_PATTERNS) {
    if (pattern.test(content.trim())) {
      markAsParsed(token, true);
      break;
    }
  }
}

function commentPlugin(md) {
  if (!md.marpit) {
    throw new Error('Marpit plugin has detected incompatible markdown-it instance.');
  }

  md.block.ruler.before(
    'html_block',
    'marpit_comment',
    (state, startLine, endLine, silent) => {
      let start = state.bMarks[startLine] + state.tShift[startLine];
      if (state.src.charCodeAt(start) !== 0x3c) return false;

      let line = startLine;
      let lineEnd = state.eMarks[line];
      let text = state.src.slice(start, lineEnd);
      if (!COMMENT_OPENING_PATTERN.test(text)) return false;
      if (silent) return true;

      while (!COMMENT_CLOSING_PATTERN.test(text)) {
        line += 1;
        if (line >= endLine) break;
        if (state.sCount[line] < state.blkIndent) break;
        start = state.bMarks[line] + state.tShift[line];
        lineEnd = state.eMarks[line];
        text = state.src.slice(start, lineEnd);
      }

      state.line = line + 1;
      const token = state.push('marpit_comment', '', 0);
      token.map = [startLine, state.line];
      token.content = state.getLines(startLine, state.line, state.blkIndent, true);
      token.hidden = true;
      const match = COMMENT_PATTERN.exec(token.content);
      token.info = match ? match[1].trim() : '';
      applyCommentMetadata(token, token.info, md.marpit);
      return true;
    },
  );

  md.inline.ruler.before(
    'html_inline',
    'marpit_inline_comment',
    (state, silent) => {
      const { posMax, src } = state;
      if (
        state.pos + 4 >= posMax ||
        src.charCodeAt(state.pos) !== 0x3c ||
        src.charCodeAt(state.pos + 1) !== 0x21
      ) {
        return false;
      }

      const match = src.slice(state.pos).match(COMMENT_PATTERN);
      if (!match) return false;

      if (!silent) {
        const token = state.push('marpit_inline_comment', '', 0);
        token.hidden = true;
        token.content = src.slice(state.pos, state.pos + match[0].length);
        token.info = match[1].trim();
        applyCommentMetadata(token, token.info, md.marpit);
      }
      state.pos += match[0].length;
      return true;
    },
  );
}

function plugin(pluginFunction) {
  const wrapped = function marpitPlugin(md, ...args) {
    if (md.marpit) return pluginFunction.call(this, md, ...args);
    throw new Error('Marpit plugin has detected incompatible markdown-it instance.');
  };
  Object.defineProperty(wrapped, 'name', { value: pluginFunction.name });
  Object.defineProperty(wrapped, 'marpitPlugin', { value: wrapped });
  Object.defineProperty(wrapped, 'plugin', { value: wrapped });
  return wrapped;
}

const comment = plugin(commentPlugin);

module.exports = {
  comment,
  default: comment,
  markAsParsed,
};
