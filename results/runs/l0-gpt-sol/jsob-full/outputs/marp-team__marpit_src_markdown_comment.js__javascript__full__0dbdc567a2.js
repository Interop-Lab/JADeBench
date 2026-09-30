'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const jsYaml = require('js-yaml');

const headingLevels = [1, 2, 3, 4, 5, 6];

const globals = Object.defineProperties(Object.create(null), {
  headingDivider: {
    enumerable: true,
    value(value) {
      const toLevel = level =>
        Array.isArray(level) || Number.isInteger(level)
          ? level
          : Number.parseInt(level, 10);

      const parsed = toLevel(value);

      if (Array.isArray(parsed)) {
        const levels = parsed.map(toLevel);
        return {
          headingDivider: headingLevels.filter(level => levels.includes(level)),
        };
      }

      if (value === 'false') return { headingDivider: false };
      if (headingLevels.includes(parsed)) return { headingDivider: parsed };

      return {};
    },
  },

  style: {
    enumerable: true,
    value: style => ({ style }),
  },

  theme: {
    enumerable: true,
    value: (theme, marpit) =>
      marpit.themeSet.has(theme) ? { theme } : {},
  },

  lang: {
    enumerable: true,
    value: lang => ({ lang }),
  },
});

const locals = Object.defineProperties(Object.create(null), {
  backgroundColor: {
    enumerable: true,
    value: backgroundColor => ({ backgroundColor }),
  },

  backgroundImage: {
    enumerable: true,
    value: backgroundImage => ({ backgroundImage }),
  },

  backgroundPosition: {
    enumerable: true,
    value: backgroundPosition => ({ backgroundPosition }),
  },

  backgroundRepeat: {
    enumerable: true,
    value: backgroundRepeat => ({ backgroundRepeat }),
  },

  backgroundSize: {
    enumerable: true,
    value: backgroundSize => ({ backgroundSize }),
  },

  class: {
    enumerable: true,
    value: value => ({
      class: Array.isArray(value) ? value.join(' ') : value,
    }),
  },

  color: {
    enumerable: true,
    value: color => ({ color }),
  },

  footer: {
    enumerable: true,
    value: footer => (typeof footer === 'string' ? { footer } : {}),
  },

  header: {
    enumerable: true,
    value: header => (typeof header === 'string' ? { header } : {}),
  },

  paginate: {
    enumerable: true,
    value(value) {
      const paginate = (value || '').toLowerCase();

      if (['hold', 'skip'].includes(paginate)) return { paginate };

      return { paginate: paginate === 'true' };
    },
  },
});

const directives = [...Object.keys(globals), ...Object.keys(locals)];

function createPatterns(names) {
  const patterns = new Set();

  for (const name of names) {
    const escaped = `_?${name.replace(
      /[.*+?^=!:${}()|[\]\\/]/g,
      '\\$&'
    )}`;

    patterns.add(escaped);
    patterns.add(`"${escaped}"`);
    patterns.add(`'${escaped}'`);
  }

  return [...patterns.values()];
}

const yamlSpecialChars = '-?:,[]{}#&*!|>\'"%@`';

function convertLoose(source, customDirectives) {
  const patterns = createPatterns(customDirectives).join('|');
  const matcher = new RegExp(
    `^(\\s*(?:${patterns})\\s*:\\s*)(.*)$`
  );

  let converted = '';

  for (const line of source.split(/\r?\n/)) {
    converted +=
      line.replace(matcher, (match, prefix, value) => {
        const trimmed = value.trim();

        if (
          trimmed.length === 0 ||
          yamlSpecialChars.includes(trimmed[0])
        ) {
          return match;
        }

        const leadingLength =
          value.length - value.trimStart().length;
        const leading = value.substring(0, leadingLength);

        return (
          prefix +
          leading +
          '"' +
          trimmed.split('"').join('\\"') +
          '"'
        );
      }) + '\n';
  }

  return converted.trim();
}

function parseYaml(source) {
  try {
    const parsed = jsYaml.load(source, {
      schema: jsYaml.FAILSAFE_SCHEMA,
    });

    if (parsed === null || typeof parsed !== 'object') return false;

    return parsed;
  } catch {
    return false;
  }
}

function yaml(source, loose = false) {
  return parseYaml(
    loose
      ? convertLoose(source, [
          ...directives,
          ...(Array.isArray(loose) ? loose : []),
        ])
      : source
  );
}

const commentMatcher = /<!--+\s*([\s\S]*?)\s*--+>/;
const commentMatcherOpening = /^<!--/;
const commentMatcherClosing = /-->/;

const magicCommentMatchers = [
  /^prettier-ignore(-(start|end))?$/,
  /^markdownlint-((disable|enable).*|capture|restore)$/,
  /^lint (disable|enable|ignore).*$/,
];

function markAsParsed(token, parsedBy) {
  token.meta = token.meta || {};
  token.meta.marpitCommentParsed = parsedBy;
}

function parseComment(md, token, content) {
  const parsed = yaml(
    content,
    !!md.marpit.options.looseYAML
  );

  token.meta = token.meta || {};
  token.meta.marpitDirectives = parsed === false ? {} : parsed;

  for (const matcher of magicCommentMatchers) {
    if (matcher.test(content.trim())) {
      markAsParsed(token, 'magic');
      break;
    }
  }
}

function commentPlugin(md) {
  md.block.ruler.before(
    'html_block',
    'marpit_comment',
    (state, startLine, endLine, silent) => {
      let start =
        state.bMarks[startLine] + state.tShift[startLine];

      if (state.src.charCodeAt(start) !== 0x3c) return false;

      let end = state.eMarks[startLine];
      let source = state.src.slice(start, end);

      if (!commentMatcherOpening.test(source)) return false;
      if (silent) return true;

      let nextLine = startLine + 1;

      if (!commentMatcherClosing.test(source)) {
        while (nextLine < endLine) {
          if (state.sCount[nextLine] < state.blkIndent) break;

          start =
            state.bMarks[nextLine] + state.tShift[nextLine];
          end = state.eMarks[nextLine];
          source = state.src.slice(start, end);
          nextLine += 1;

          if (commentMatcherClosing.test(source)) break;
        }
      }

      state.line = nextLine;

      const token = state.push('marpit_comment', '', 0);
      token.map = [startLine, nextLine];
      token.content = state.getLines(
        startLine,
        nextLine,
        state.blkIndent,
        true
      );
      token.block = true;

      const match = commentMatcher.exec(token.content);
      token.content = match ? match[1].trim() : '';

      parseComment(md, token, token.content);
      return true;
    }
  );

  md.inline.ruler.before(
    'html_inline',
    'marpit_comment',
    (state, silent) => {
      const { posMax, src } = state;

      if (
        state.pos + 4 > posMax ||
        src.charCodeAt(state.pos) !== 0x3c ||
        src.charCodeAt(state.pos + 1) !== 0x21
      ) {
        return false;
      }

      const match = src.slice(state.pos).match(commentMatcher);
      if (!match) return false;

      if (!silent) {
        const token = state.push('marpit_comment', '', 0);
        token.hidden = true;
        token.markup = src.slice(
          state.pos,
          state.pos + match[0].length
        );
        token.content = match[1].trim();

        parseComment(md, token, token.content);
      }

      state.pos += match[0].length;
      return true;
    }
  );
}

function plugin(pluginFunction) {
  return function marpitPlugin(markdown, ...parameters) {
    if (markdown.marpit) {
      return pluginFunction.call(
        this,
        markdown,
        ...parameters
      );
    }

    throw new Error('Marpit plugin is required.');
  };
}

const comment = plugin(commentPlugin);

Object.defineProperties(exports, {
  comment: {
    enumerable: true,
    get: () => comment,
  },

  default: {
    enumerable: true,
    get: () => comment,
  },

  markAsParsed: {
    enumerable: true,
    get: () => markAsParsed,
  },
});
