"use strict";

const yamlParser = require("js-yaml");
const markdownItFrontMatter = require("markdown-it-front-matter");

const commentPattern = /<!--+\s*([\s\S]*?)\s*--+>/;
const openingCommentPattern = /^<!--/;
const closingCommentPattern = /-->/;
const magicCommentPatterns = [
  /^prettier-ignore(-(start|end))?$/,
  /^markdownlint-((disable|enable).*|capture|restore)$/,
  /^lint (disable|enable|ignore).*$/,
];

function marpitPlugin(plugin) {
  return function wrappedMarpitPlugin(markdownIt, ...parameters) {
    return plugin.call(markdownIt.marpit, markdownIt, ...parameters);
  };
}

function directive(name, convert = value => value) {
  return function convertDirective(value) {
    return { [name]: convert.call(this, value) };
  };
}

const globalDirectives = Object.assign(Object.create(null), {
  headingDivider(value) {
    const values = (Array.isArray(value) ? value : [value])
      .map(Number)
      .filter(level => Number.isInteger(level) && level >= 1 && level <= 6);
    return values.length > 0 ? { headingDivider: values } : { headingDivider: false };
  },
  style: directive("style"),
  theme(value, themeSet) {
    const themes = themeSet || this?.themeSet;
    return !themes || themes.has(value) ? { theme: value } : {};
  },
  lang: directive("lang"),
});

const localDirectives = Object.assign(Object.create(null), {
  backgroundColor: directive("backgroundColor"),
  backgroundImage: directive("backgroundImage"),
  backgroundPosition: directive("backgroundPosition"),
  backgroundRepeat: directive("backgroundRepeat"),
  backgroundSize: directive("backgroundSize"),
  class(value) {
    return { class: Array.isArray(value) ? value.join(" ") : value };
  },
  color: directive("color"),
  footer(value) {
    return typeof value === "string" ? { footer: value } : {};
  },
  header(value) {
    return typeof value === "string" ? { header: value } : {};
  },
  paginate(value) {
    if (typeof value === "string") {
      const normalized = value.toLowerCase();
      if (["hold", "skip"].includes(normalized)) return { paginate: normalized };
      return { paginate: normalized === "true" };
    }
    return { paginate: Boolean(value) };
  },
});

const directiveNames = [...Object.keys(globalDirectives), ...Object.keys(localDirectives)];

function createPatterns(names) {
  const patterns = new Set();
  for (const name of names) {
    const escaped = name.replace(/[.*+?^=!:${}()|[\]\\/]/g, "\\$&");
    patterns.add(`_?${escaped}`);
    patterns.add(`"_?${escaped}"`);
    patterns.add(`'_?${escaped}'`);
  }
  return [...patterns.values()];
}

const yamlSpecialCharacters = "[\"'{|>~&*";
const directiveLinePattern = new RegExp(
  `^(${createPatterns(directiveNames).join("|")}\\s*:)(.+)$`,
);

function parseYaml(source) {
  try {
    const parsed = yamlParser.load(source, { schema: yamlParser.FAILSAFE_SCHEMA });
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : false;
  } catch {
    return false;
  }
}

function convertLoose(source) {
  return source
    .split(/\r?\n/)
    .map(line =>
      line.replace(directiveLinePattern, (match, key, value) => {
        const trimmed = value.trim();
        if (!trimmed || !yamlSpecialCharacters.includes(trimmed[0])) return match;
        return `${key} ${JSON.stringify(trimmed)}`;
      }),
    )
    .join("\n")
    .trim();
}

function normalizeDirectives(source, themeSet) {
  let parsed = parseYaml(source);
  if (!parsed) parsed = parseYaml(convertLoose(source));
  if (!parsed) return false;

  const globals = {};
  const locals = {};
  for (const [rawName, value] of Object.entries(parsed)) {
    const name = rawName.startsWith("_") ? rawName.slice(1) : rawName;
    if (globalDirectives[name]) {
      Object.assign(globals, globalDirectives[name].call(this, value, themeSet));
    } else if (localDirectives[name]) {
      Object.assign(locals, localDirectives[name].call(this, value));
    }
  }
  return { global: globals, local: locals };
}

function markAsParsed(token, directives) {
  token.meta ||= {};
  token.meta.marpitCommentParsed = true;
  token.meta.marpitParsedDirectives = directives;
  return token;
}

function isMagicComment(content) {
  const trimmed = content.trim();
  return magicCommentPatterns.some(pattern => pattern.test(trimmed));
}

function parseCommentToken(state, startLine, endLine, silent) {
  const start = state.bMarks[startLine] + state.tShift[startLine];
  const maximum = state.eMarks[startLine];
  if (!openingCommentPattern.test(state.src.slice(start, maximum))) return false;

  let nextLine = startLine;
  let source = state.src.slice(start, maximum);
  while (!closingCommentPattern.test(source) && ++nextLine < endLine) {
    source += `\n${state.src.slice(state.bMarks[nextLine], state.eMarks[nextLine])}`;
  }

  const match = source.match(commentPattern);
  if (!match || isMagicComment(match[1])) return false;
  if (silent) return true;

  const token = state.push("marpit_comment", "", 0);
  token.block = true;
  token.content = match[1];
  token.map = [startLine, nextLine + 1];
  token.meta = {};
  state.line = nextLine + 1;
  return true;
}

function parseInlineComment(state, silent) {
  if (!openingCommentPattern.test(state.src.slice(state.pos))) return false;
  const match = state.src.slice(state.pos).match(commentPattern);
  if (!match || match.index !== 0 || isMagicComment(match[1])) return false;
  if (!silent) {
    const token = state.push("marpit_inline_comment", "", 0);
    token.content = match[1];
    token.meta = {};
  }
  state.pos += match[0].length;
  return true;
}

function commentPlugin(markdownIt) {
  markdownIt.block.ruler.before("html_block", "marpit_comment", parseCommentToken);
  markdownIt.inline.ruler.before("html_inline", "marpit_inline_comment", parseInlineComment);
}

function parseFrontMatter(markdownIt, source) {
  const parsed = normalizeDirectives.call(this, source, this?.themeSet);
  if (parsed) markdownIt.marpitDirectives = parsed;
}

function parseDirectiveTokens(state) {
  for (const token of state.tokens) {
    if (token.type !== "marpit_comment" || token.meta?.marpitCommentParsed) continue;
    const parsed = normalizeDirectives.call(this, token.content, this?.themeSet);
    if (parsed) markAsParsed(token, parsed);
  }
}

function parsePlugin(markdownIt) {
  markdownIt.use(comment);
  markdownIt.use(markdownItFrontMatter, source => parseFrontMatter.call(this, markdownIt, source));
  markdownIt.core.ruler.before("block", "marpit_directives_front_matter", () => {});
  markdownIt.core.ruler.after(
    "inline",
    "marpit_directives_global_parse",
    state => parseDirectiveTokens.call(this, state),
  );
  markdownIt.core.ruler.before(
    "marpit_slide",
    "marpit_directives_parse",
    state => parseDirectiveTokens.call(this, state),
  );
}

const comment = marpitPlugin(commentPlugin);
const parse = marpitPlugin(parsePlugin);

module.exports = { parse };
Object.defineProperty(module.exports, "default", { enumerable: true, value: parse });
