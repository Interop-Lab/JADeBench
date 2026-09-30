'use strict';

const jsYaml = require('js-yaml');

const commentMatcher = /<!--+\s*([\s\S]*?)\s*--+>/;
const commentMatcherOpening = /^<!--/;
const commentMatcherClosing = /-->/;
const magicCommentMatchers = [
  /^prettier-ignore(-(start|end))?$/,
  /^markdownlint-((disable|enable).*|capture|restore)$/,
  /^lint (disable|enable|ignore).*$/,
];

const globals = Object.assign(Object.create(null), {
  headingDivider(value) {
    const supportedHeadings = [1, 2, 3, 4, 5, 6];
    const headingDivider = (Array.isArray(value) ? value : [value])
      .map((heading) =>
        Array.isArray(heading) || Number.isNaN(heading)
          ? heading
          : Number.parseInt(heading, 10),
      )
      .filter((heading) => supportedHeadings.includes(heading));

    return { headingDivider: value === 'false' ? false : headingDivider };
  },

  style(value) {
    return { style: value };
  },

  theme(value, marpit) {
    if (marpit.themeSet.has(value)) return { theme: value };
    return undefined;
  },

  lang(value) {
    return { lang: value };
  },
});

const locals = Object.assign(Object.create(null), {
  backgroundColor(value) {
    return { backgroundColor: value };
  },

  backgroundImage(value) {
    return { backgroundImage: value };
  },

  backgroundPosition(value) {
    return { backgroundPosition: value };
  },

  backgroundRepeat(value) {
    return { backgroundRepeat: value };
  },

  backgroundSize(value) {
    return { backgroundSize: value };
  },

  class(value) {
    return { class: Array.isArray(value) ? value.join(' ') : value };
  },

  color(value) {
    return { color: value };
  },

  footer(value) {
    if (typeof value === 'string') return { footer: value };
    return undefined;
  },

  header(value) {
    if (typeof value === 'string') return { header: value };
    return undefined;
  },

  paginate(value) {
    const normalized = value?.toLowerCase() ?? '';
    if (['hold', 'skip'].includes(normalized)) return { paginate: normalized };
    return { paginate: normalized === 'true' };
  },
});

const directives = [...Object.keys(globals), ...Object.keys(locals)];
const yamlSpecialChars = `["'{|>~&*`;

function createPatterns(directiveNames) {
  const patterns = new Set();

  for (const directiveName of directiveNames) {
    const escapedName = directiveName.replace(
      /[.*+?^=!:${}()|[\]\\/]/g,
      '\\$&',
    );
    const pattern = `${escapedName}_?`;

    patterns.add(pattern);
    patterns.add(`"${pattern}"`);
    patterns.add(`'${pattern}'`);
  }

  return [...patterns.values()];
}

function parse(source) {
  try {
    const parsed = jsYaml.load(source, { schema: jsYaml.FAILSAFE_SCHEMA });
    return typeof parsed === 'object' ? parsed : false;
  } catch {
    return false;
  }
}

function quoteLooseValue(source, key, value) {
  const trimmed = value.trim();
  if (
    trimmed.length < 1 ||
    yamlSpecialChars.includes(value.trimLeft().substring(0, 1))
  ) {
    return source;
  }

  const indentation = value.substring(
    0,
    value.length - value.trimLeft().length,
  );
  const escapedValue = trimmed.split('"').join('\\"');
  return `${key}${indentation}"${escapedValue}"`;
}

function convertLoose(source, directiveNames) {
  const directivePattern = `(?:${createPatterns(directiveNames).join('|')})`;
  const linePattern = new RegExp(`^(${directivePattern}\\s*:)(.+)$`);

  return source
    .split(/\r?\n/)
    .map((line) => line.replace(linePattern, quoteLooseValue))
    .join('\n')
    .trim();
}

function yaml(source, loose = false) {
  return parse(
    loose
      ? convertLoose(source, Array.isArray(loose) ? loose : directives)
      : source,
  );
}

function markAsParsed(token, reason) {
  token.meta ||= {};
  token.meta.marpitCommentParsed = reason;
}

function parseComment(token, content, marpit) {
  const parsed = yaml(content, marpit.options.looseYAML);
  token.meta ||= {};
  token.meta.marpitParsedDirectives = parsed === false ? {} : parsed;

  for (const matcher of magicCommentMatchers) {
    if (matcher.test(content.trim())) {
      markAsParsed(token, 'well-known-magic-comment');
    }
  }
}

function createBlockCommentRule(onComment) {
  return function blockComment(state, startLine, endLine, silent) {
    let position = state.bMarks[startLine] + state.tShift[startLine];
    if (state.src.charCodeAt(position) !== 0x3c) return false;

    let maximum = state.eMarks[startLine];
    let line = state.src.slice(position, maximum);
    if (!commentMatcherOpening.test(line)) return false;
    if (silent) return true;

    let nextLine = startLine + 1;
    while (!commentMatcherClosing.test(line)) {
      if (nextLine >= endLine || state.sCount[nextLine] < state.blkIndent) break;

      position = state.bMarks[nextLine] + state.tShift[nextLine];
      maximum = state.eMarks[nextLine];
      line = state.src.slice(position, maximum);
      nextLine += 1;
    }

    state.line = nextLine;

    const token = state.push('marpit_comment', '', 0);
    token.map = [startLine, nextLine];
    token.markup = state.getLines(startLine, nextLine, state.blkIndent, true);
    token.hidden = true;

    const match = commentMatcher.exec(token.markup);
    token.content = match ? match[1].trim() : '';
    onComment(token, token.content);
    return true;
  };
}

function createInlineCommentRule(onComment) {
  return function inlineComment(state, silent) {
    const maximum = state.posMax;
    const source = state.src;
    const position = state.pos;

    if (
      position + 2 >= maximum ||
      source.charCodeAt(position) !== 0x3c ||
      source.charCodeAt(position + 1) !== 0x21
    ) {
      return false;
    }

    const match = source.slice(position).match(commentMatcher);
    if (!match) return false;

    if (!silent) {
      const token = state.push('marpit_comment', '', 0);
      token.hidden = true;
      token.markup = source.slice(position, position + match[0].length);
      token.content = match[1].trim();
      onComment(token, token.content);
    }

    state.pos += match[0].length;
    return true;
  };
}

function commentPlugin(markdown) {
  const onComment = (token, content) =>
    parseComment(token, content, markdown.marpit);

  markdown.block.ruler.before(
    'html_block',
    'marpit_comment',
    createBlockCommentRule(onComment),
  );
  markdown.inline.ruler.before(
    'html_inline',
    'marpit_inline_comment',
    createInlineCommentRule(onComment),
  );
}

function marpitPlugin(plugin) {
  return function wrappedMarpitPlugin(...args) {
    if (!args[0].marpit) {
      throw new Error(
        'Marpit plugin has detected incompatible markdown-it instance.',
      );
    }

    return plugin.call(this, ...args);
  };
}

const comment = marpitPlugin(commentPlugin);

const exported = {};
Object.defineProperty(exported, '__esModule', { value: true });
Object.defineProperties(exported, {
  comment: { enumerable: true, get: () => comment },
  default: { enumerable: true, get: () => comment },
  markAsParsed: { enumerable: true, get: () => markAsParsed },
});
module.exports = exported;
