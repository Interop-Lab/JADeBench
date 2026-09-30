"use strict";

const yamlParser = require("js-yaml");

const supportedHeadingDividers = [1, 2, 3, 4, 5, 6];

const globalDirectives = Object.assign(Object.create(null), {
  headingDivider(value) {
    const toNumber = (input) =>
      Array.isArray(input) || Number.isNaN(input)
        ? input
        : Number.parseInt(input, 10);
    const headingDivider = toNumber(value);

    if (Array.isArray(headingDivider)) {
      const selected = headingDivider.map(toNumber);
      return {
        headingDivider: supportedHeadingDividers.filter((level) =>
          selected.includes(level),
        ),
      };
    }

    if (value === "false") return { headingDivider: false };
    if (supportedHeadingDividers.includes(headingDivider)) {
      return { headingDivider };
    }
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
  class: (className) => ({
    class: Array.isArray(className) ? className.join(" ") : className,
  }),
  color: (color) => ({ color }),
  footer: (footer) => (typeof footer === "string" ? { footer } : {}),
  header: (header) => (typeof header === "string" ? { header } : {}),
  paginate(value) {
    const normalized = (value || "").toLowerCase();
    if (["hold", "skip"].includes(normalized)) {
      return { paginate: normalized };
    }
    return { paginate: normalized === "true" };
  },
});

const directiveNames = [
  ...Object.keys(globalDirectives),
  ...Object.keys(localDirectives),
];

function createPatterns(names) {
  const patterns = new Set();
  for (const name of names) {
    const pattern = `_${name.replace(/[.*+?^=!:${}()|[\]\\/]/g, "\\$&")}?`;
    patterns.add(pattern);
    patterns.add(`"${pattern}"`);
    patterns.add(`'${pattern}'`);
  }
  return [...patterns.values()];
}

const yamlSpecialChars = "[\"'{|>~&*";

function parseYaml(source) {
  try {
    const parsed = yamlParser.load(source, {
      schema: yamlParser.FAILSAFE_SCHEMA,
    });
    if (parsed === null || typeof parsed !== "object") return false;
    return parsed;
  } catch {
    return false;
  }
}

function convertLooseYaml(source, names) {
  const directivePattern = `(?:${createPatterns(names).join("|")})`;
  const linePattern = new RegExp(`^(${directivePattern}\\s*:)(.+)$`);
  let converted = "";

  for (const line of source.split(/\r?\n/)) {
    converted += `${line.replace(
      linePattern,
      (matched, directive, rawValue) => {
        const value = rawValue.trim();
        if (value.length === 0 || yamlSpecialChars.includes(value[0])) {
          return matched;
        }

        const indentationLength =
          rawValue.length - rawValue.trimLeft().length;
        const indentation = rawValue.substring(0, indentationLength);
        return `${directive}${indentation}"${value
          .split('"')
          .join('\\"')}"`;
      },
    )}\n`;
  }

  return converted.trim();
}

function parseDirectives(source, looseYaml = false) {
  if (!looseYaml) return parseYaml(source);

  const additionalNames = Array.isArray(looseYaml) ? looseYaml : [];
  return parseYaml(
    convertLooseYaml(source, [...directiveNames, ...additionalNames]),
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

function markAsParsed(token, parsed) {
  token.meta = token.meta || {};
  token.meta.marpitCommentParsed = parsed;
}

function processComment(markdown, token, content) {
  const parsed = parseDirectives(
    content,
    Boolean(markdown.marpit.options.looseYAML),
  );

  token.meta = token.meta || {};
  token.meta.marpitParsedDirectives = parsed === false ? {} : parsed;

  for (const matcher of magicCommentMatchers) {
    if (matcher.test(content.trim())) {
      markAsParsed(token, "well-known-magic-comment");
      break;
    }
  }
}

function commentPlugin(markdown) {
  markdown.block.ruler.before(
    "html_block",
    "marpit_comment",
    (state, startLine, endLine, silent) => {
      let start = state.bMarks[startLine] + state.tShift[startLine];
      if (state.src.charCodeAt(start) !== 0x3c) return false;

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
      const token = state.push("marpit_comment", "", 0);
      token.map = [startLine, nextLine];
      token.markup = state.getLines(
        startLine,
        nextLine,
        state.blkIndent,
        true,
      );
      token.hidden = true;

      const matched = commentMatcher.exec(token.markup);
      token.content = matched ? matched[1].trim() : "";
      processComment(markdown, token, token.content);
      return true;
    },
  );

  markdown.inline.ruler.before(
    "html_inline",
    "marpit_inline_comment",
    (state, silent) => {
      const { posMax, src } = state;
      if (
        state.pos + 2 >= posMax ||
        src.charCodeAt(state.pos) !== 0x3c ||
        src.charCodeAt(state.pos + 1) !== 0x21
      ) {
        return false;
      }

      const matched = src.slice(state.pos).match(commentMatcher);
      if (!matched) return false;

      if (!silent) {
        const token = state.push("marpit_comment", "", 0);
        token.hidden = true;
        token.markup = src.slice(state.pos, state.pos + matched[0].length);
        token.content = matched[1].trim();
        processComment(markdown, token, token.content);
      }

      state.pos += matched[0].length;
      return true;
    },
  );
}

function marpitPlugin(plugin) {
  return function (markdown, ...arguments_) {
    if (markdown.marpit) {
      return plugin.call(this, markdown, ...arguments_);
    }
    throw new Error(
      "Marpit plugin has detected incompatible markdown-it instance.",
    );
  };
}

Object.defineProperty(marpitPlugin, "__esModule", { value: true });
Object.defineProperty(marpitPlugin, "default", { value: marpitPlugin });
Object.defineProperty(marpitPlugin, "marpitPlugin", { value: marpitPlugin });

const comment = marpitPlugin(commentPlugin);

Object.defineProperty(module.exports, "__esModule", { value: true });
Object.defineProperties(module.exports, {
  comment: { enumerable: true, get: () => comment },
  default: { enumerable: true, get: () => comment },
  markAsParsed: { enumerable: true, get: () => markAsParsed },
});
