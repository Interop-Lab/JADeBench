var comment;
var defaultExport;

const publicExports = {};
Object.defineProperty(publicExports, '__esModule', { value: true });
Object.defineProperties(publicExports, {
  comment: { get: () => comment, enumerable: true },
  default: { get: () => defaultExport, enumerable: true },
  markAsParsed: { get: () => markAsParsed, enumerable: true },
});
module.exports = publicExports;

const { FAILSAFE_SCHEMA, load: loadYaml } = require('js-yaml');

const INCOMPATIBLE_MARKDOWN_IT_ERROR =
  'Marpit plugin has detected incompatible markdown-it instance.';

function marpitPlugin(plugin) {
  return function (markdownIt, ...args) {
    if (markdownIt.marpit) {
      return plugin.call(this, markdownIt, ...args);
    }

    throw new Error(INCOMPATIBLE_MARKDOWN_IT_ERROR);
  };
}

const headingDividers = [1, 2, 3, 4, 5, 6];

const globals = Object.assign(Object.create(null), {
  headingDivider(value) {
    const normalize = (candidate) =>
      Array.isArray(candidate) || Number.isNaN(candidate)
        ? candidate
        : Number.parseInt(candidate, 10);
    const normalized = normalize(value);

    if (Array.isArray(normalized)) {
      const selected = normalized.map(normalize);
      return {
        headingDivider: headingDividers.filter((divider) =>
          selected.includes(divider),
        ),
      };
    }

    if (value === 'false') return { headingDivider: false };
    if (headingDividers.includes(normalized)) {
      return { headingDivider: normalized };
    }

    return {};
  },

  style: (style) => ({ style }),

  theme: (theme, markdownIt) =>
    markdownIt.marpit.themeSet.has(theme) ? { theme } : {},

  lang: (lang) => ({ lang }),
});

const locals = Object.assign(Object.create(null), {
  backgroundColor: (backgroundColor) => ({ backgroundColor }),
  backgroundImage: (backgroundImage) => ({ backgroundImage }),
  backgroundPosition: (backgroundPosition) => ({ backgroundPosition }),
  backgroundRepeat: (backgroundRepeat) => ({ backgroundRepeat }),
  backgroundSize: (backgroundSize) => ({ backgroundSize }),
  class: (className) => ({
    class: Array.isArray(className) ? className.join(' ') : className,
  }),
  color: (color) => ({ color }),
  footer: (footer) => (typeof footer === 'string' ? { footer } : {}),
  header: (header) => (typeof header === 'string' ? { header } : {}),
  paginate(value) {
    const normalized = (value || '').toLowerCase();
    if (['hold', 'skip'].includes(normalized)) return { paginate: normalized };
    return { paginate: normalized === 'true' };
  },
});

const directiveNames = [...Object.keys(globals), ...Object.keys(locals)];
const yamlSpecialChars = '["\'{|>~&*';

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

function parseYaml(source) {
  try {
    const parsed = loadYaml(source, { schema: FAILSAFE_SCHEMA });
    if (parsed === null || typeof parsed !== 'object') return false;
    return parsed;
  } catch {
    return false;
  }
}

function convertLooseYaml(source, names) {
  const namePattern = `(?:${createPatterns(names).join('|')})`;
  const directivePattern = new RegExp(`^(${namePattern}\\s*:)(.+)$`);
  let converted = '';

  for (const line of source.split(/\r?\n/)) {
    converted +=
      line.replace(directivePattern, (match, prefix, rawValue) => {
        const value = rawValue.trim();
        if (value.length === 0 || yamlSpecialChars.includes(value[0])) {
          return match;
        }

        const indentationLength = rawValue.length - rawValue.trimLeft().length;
        const indentation = rawValue.substring(0, indentationLength);
        const quotedValue = value.split('"').join('\\"');
        return `${prefix}${indentation}"${quotedValue}"`;
      }) + '\n';
  }

  return converted.trim();
}

function yaml(source, loose = false) {
  const preparedSource = loose
    ? convertLooseYaml(source, [
        ...directiveNames,
        ...(Array.isArray(loose) ? loose : []),
      ])
    : source;

  return parseYaml(preparedSource);
}

const commentMatcher = /<!--+\s*([\s\S]*?)\s*--+>/;
const commentMatcherOpening = /^<!--/;
const commentMatcherClosing = /-->/;
const magicCommentMatchers = [
  /^prettier-ignore(-(start|end))?$/,
  /^markdownlint-((disable|enable).*|capture|restore)$/,
  /^lint (disable|enable|ignore).*$/,
];

function markAsParsed(token, marker) {
  token.meta = token.meta || {};
  token.meta.marpitCommentParsed = marker;
}

function registerCommentPlugin(markdownIt) {
  const parseComment = (token, content) => {
    const parsed = yaml(
      content,
      Boolean(markdownIt.marpit.options.looseYAML),
    );

    token.meta = token.meta || {};
    token.meta.marpitParsedDirectives = parsed === false ? {} : parsed;

    for (const matcher of magicCommentMatchers) {
      if (matcher.test(content.trim())) {
        markAsParsed(token, 'well-known-magic-comment');
        break;
      }
    }
  };

  markdownIt.block.ruler.before(
    'html_block',
    'marpit_comment',
    (state, startLine, endLine, silent) => {
      let start = state.bMarks[startLine] + state.tShift[startLine];
      if (state.src.charCodeAt(start) !== 60) return false;

      let end = state.eMarks[startLine];
      let line = state.src.slice(start, end);
      if (!commentMatcherOpening.test(line)) return false;
      if (silent) return true;

      let nextLine = startLine + 1;
      if (!commentMatcherClosing.test(line)) {
        while (nextLine < endLine) {
          if (state.sCount[nextLine] < state.blkIndent) break;

          start = state.bMarks[nextLine] + state.tShift[nextLine];
          end = state.eMarks[nextLine];
          line = state.src.slice(start, end);
          nextLine += 1;

          if (commentMatcherClosing.test(line)) break;
        }
      }

      state.line = nextLine;
      const token = state.push('marpit_comment', '', 0);
      token.map = [startLine, nextLine];
      token.markup = state.getLines(startLine, nextLine, state.blkIndent, true);
      token.hidden = true;

      const match = commentMatcher.exec(token.markup);
      token.content = match ? match[1].trim() : '';
      parseComment(token, token.content);
      return true;
    },
  );

  markdownIt.inline.ruler.before(
    'html_inline',
    'marpit_inline_comment',
    (state, silent) => {
      const { posMax, src } = state;
      if (
        state.pos + 2 >= posMax ||
        src.charCodeAt(state.pos) !== 60 ||
        src.charCodeAt(state.pos + 1) !== 33
      ) {
        return false;
      }

      const match = src.slice(state.pos).match(commentMatcher);
      if (!match) return false;

      if (!silent) {
        const token = state.push('marpit_comment', '', 0);
        token.hidden = true;
        token.markup = src.slice(state.pos, state.pos + match[0].length);
        token.content = match[1].trim();
        parseComment(token, token.content);
      }

      state.pos += match[0].length;
      return true;
    },
  );
}

comment = marpitPlugin(registerCommentPlugin);
defaultExport = comment;
