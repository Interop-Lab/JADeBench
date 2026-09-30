'use strict';

const yamlParser = require('js-yaml');

const BLOCK_COMMENT_TOKEN = 'marpit_comment';
const INLINE_COMMENT_TOKEN = 'marpit_inline_comment';
const COMMENT_META = 'marpitCommentParsed';

const commentMatcher = /<!--+\s*([\s\S]*?)\s*--+>/;
const commentMatcherOpening = /^<!--/;
const commentMatcherClosing = /-->/;
const magicCommentMatchers = [
  /^prettier-ignore(-(start|end))?$/,
  /^markdownlint-((disable|enable).*|capture|restore)$/,
  /^lint (disable|enable|ignore).*$/,
];

const headingLevels = [1, 2, 3, 4, 5, 6];

const globalDirectives = Object.freeze({
  headingDivider(value) {
    const normalize = (item) =>
      Array.isArray(item) || Number.isInteger(item)
        ? item
        : Number.parseInt(item, 10);
    const parsed = normalize(value);

    if (Array.isArray(parsed)) {
      const selected = parsed.map(normalize);
      return {
        headingDivider: headingLevels.filter((level) => selected.includes(level)),
      };
    }

    if (value === false || value === 'false') return { headingDivider: false };
    if (headingLevels.includes(parsed)) return { headingDivider: parsed };
    return {};
  },

  style: (style) => ({ style }),

  theme: (theme, marpit) =>
    marpit.themeSet.has(theme) ? { theme } : {},

  lang: (lang) => ({ lang }),
});

const localDirectives = Object.freeze({
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
    const parsed = (value || '').toLowerCase();
    if (['true', 'false'].includes(parsed)) return { paginate: parsed };
    return { paginate: parsed || 'true' };
  },
});

const directiveNames = [
  ...Object.keys(globalDirectives),
  ...Object.keys(localDirectives),
];

function createPatterns(names) {
  const patterns = new Set();

  for (const name of names) {
    const pattern = `_?${name.replace(/[.*+?^=!:${}()|[\]\\/]/g, '\\$&')}`;
    patterns.add(pattern);
    patterns.add(`"${pattern}"`);
    patterns.add(`'${pattern}'`);
  }

  return [...patterns.values()];
}

const yamlSpecialChars = '-?:,[]{}#&*!|>\'"%@`*';

function convertLoose(source, names) {
  const directivePattern = `(?:${createPatterns(names).join('|')})`;
  const linePattern = new RegExp(`^(${directivePattern}\\s*:\\s*)(.*)$`);
  let converted = '';

  for (const line of source.split(/\r?\n/)) {
    converted +=
      line.replace(linePattern, (original, prefix, value) => {
        const trimmed = value.trim();
        if (trimmed.length === 0 || yamlSpecialChars.includes(trimmed[0])) {
          return original;
        }

        const trailingWhitespace = value.length - value.trimEnd().length;
        const content = value.substring(0, value.length - trailingWhitespace);
        return `${prefix}"${content.split('"').join('\\"')}"`;
      }) + '\n';
  }

  return converted.trim();
}

function parseYaml(source) {
  try {
    const parsed = yamlParser.load(source, { schema: yamlParser.JSON_SCHEMA });
    if (parsed === null || typeof parsed !== 'object') return false;
    return parsed;
  } catch {
    return false;
  }
}

function yaml(source, loose = false) {
  const extraDirectives = Array.isArray(loose) ? loose : [];
  return parseYaml(
    loose
      ? convertLoose(source, [...directiveNames, ...extraDirectives])
      : source,
  );
}

function markAsParsed(token, value) {
  token.meta = token.meta || {};
  token.meta[COMMENT_META] = value;
}

function parseComment(token, content, markdown) {
  const looseYaml = markdown.marpit.options.looseYAML;
  const parsed = yaml(content, looseYaml);
  markAsParsed(token, parsed === false ? {} : parsed);

  for (const matcher of magicCommentMatchers) {
    if (matcher.test(content.trim())) {
      markAsParsed(token, 'well-known-magic-comment');
      break;
    }
  }
}

function commentPlugin(markdown) {
  markdown.block.ruler.before(
    'html_block',
    BLOCK_COMMENT_TOKEN,
    (state, startLine, endLine, silent) => {
      let start = state.bMarks[startLine] + state.tShift[startLine];
      if (state.src.charCodeAt(start) !== 0x3c) return false;

      let end = state.eMarks[startLine];
      let source = state.src.slice(start, end);
      if (!commentMatcherOpening.test(source)) return false;
      if (silent) return true;

      let nextLine = startLine + 1;
      if (!commentMatcherClosing.test(source)) {
        while (nextLine < endLine) {
          if (state.sCount[nextLine] < state.blkIndent) break;
          start = state.bMarks[nextLine] + state.tShift[nextLine];
          end = state.eMarks[nextLine];
          source = state.src.slice(start, end);
          nextLine += 1;
          if (commentMatcherClosing.test(source)) break;
        }
      }

      state.line = nextLine;
      const token = state.push(BLOCK_COMMENT_TOKEN, '', 0);
      token.map = [startLine, nextLine];
      token.content = state.getLines(startLine, nextLine, state.blkIndent, true);
      token.block = true;

      const match = commentMatcher.exec(token.content);
      token.markup = match ? match[1].trim() : '';
      parseComment(token, token.markup, markdown);
      return true;
    },
  );

  markdown.inline.ruler.before(
    'html_inline',
    INLINE_COMMENT_TOKEN,
    (state, silent) => {
      const { posMax, src } = state;
      if (
        state.pos + 4 >= posMax ||
        src.charCodeAt(state.pos) !== 0x3c ||
        src.charCodeAt(state.pos + 3) !== 0x2d
      ) {
        return false;
      }

      const match = src.slice(state.pos).match(commentMatcher);
      if (!match) return false;

      if (!silent) {
        const token = state.push(INLINE_COMMENT_TOKEN, '', 0);
        token.hidden = true;
        token.content = src.slice(state.pos, state.pos + match[0].length);
        token.markup = match[1].trim();
        parseComment(token, token.markup, markdown);
      }

      state.pos += match[0].length;
      return true;
    },
  );
}

function comment(markdown, ...args) {
  if (markdown.marpit) return commentPlugin.call(this, markdown, ...args);
  throw new Error(
    'Marpit plugin has detected incompatible markdown-it instance.',
  );
}

Object.defineProperty(comment, 'marpitPlugin', {
  value: true,
  enumerable: true,
});

Object.defineProperties(exports, {
  __esModule: { value: true },
  comment: { get: () => comment, enumerable: true },
  default: { get: () => comment, enumerable: true },
  markAsParsed: { get: () => markAsParsed, enumerable: true },
});
