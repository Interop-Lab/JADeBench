"use strict";

const yamlParser = require("js-yaml");

const globalDirectives = Object.freeze({
  headingDivider: (value) => Number(value),
  style: (value) => value,
  theme: (value) => value,
  lang: (value) => value,
});

const localDirectives = Object.freeze({
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

const directiveNames = [
  ...Object.keys(globalDirectives),
  ...Object.keys(localDirectives),
];

const yamlSpecialChars = "[\"'{|>~&*";
const commentMatcher = /<!--+\s*([\s\S]*?)\s*--+>/;
const commentMatcherOpening = /^<!--/;
const commentMatcherClosing = /-->/;
const magicCommentMatchers = [
  /^prettier-ignore(-(start|end))?$/,
  /^markdownlint-((disable|enable).*|capture|restore)$/,
  /^lint (disable|enable|ignore).*$/,
];

function createPatterns(names) {
  const alternatives = names
    .slice()
    .sort((left, right) => right.length - left.length)
    .map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");

  return {
    directive: new RegExp(`^(_?)(${alternatives})\\s*:\\s*(.*)$`),
  };
}

const directivePatterns = createPatterns(directiveNames);

function convertLoose(source, lineOffset = 0) {
  const lines = source.split(/\r?\n/);
  const converted = lines.map((line) => {
    const match = line.match(directivePatterns.directive);
    if (!match) return line;

    const [, localPrefix, name, rawValue] = match;
    let value = rawValue.trim();
    if (value && !yamlSpecialChars.includes(value[0]) && /:\s/.test(value)) {
      value = JSON.stringify(value);
    }

    return `${localPrefix}${name}: ${value}`;
  });

  return `${"\n".repeat(lineOffset)}${converted.join("\n")}`;
}

function parse(source) {
  if (typeof source !== "string") return undefined;

  const body = source.match(commentMatcher)?.[1] ?? source;
  const trimmed = body.trim();
  if (!trimmed || magicCommentMatchers.some((matcher) => matcher.test(trimmed))) {
    return undefined;
  }

  let parsed;
  try {
    parsed = yamlParser.load(convertLoose(trimmed));
  } catch {
    return undefined;
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return undefined;
  }

  const directives = {};
  for (const [rawName, rawValue] of Object.entries(parsed)) {
    const local = rawName.startsWith("_");
    const name = local ? rawName.slice(1) : rawName;
    const converters = local ? localDirectives : globalDirectives;
    const convert = converters[name];
    if (convert) directives[rawName] = convert(rawValue, true);
  }

  return Object.keys(directives).length ? directives : undefined;
}

function markAsParsed(token, parsed) {
  token.meta ||= {};
  token.meta.marpitCommentParsed = parsed;
  return token;
}

function extractComment(token) {
  if (!token || typeof token.content !== "string") return undefined;

  const content = token.content.trim();
  if (!commentMatcherOpening.test(content) || !commentMatcherClosing.test(content)) {
    return undefined;
  }

  return parse(content);
}

function commentPlugin(markdown) {
  if (!markdown?.core?.ruler) return;

  markdown.core.ruler.after("inline", "marpit_comment", (state) => {
    for (const token of state.tokens) {
      const parsed = extractComment(token);
      if (parsed) markAsParsed(token, parsed);

      if (token.children) {
        for (const child of token.children) {
          const childParsed = extractComment(child);
          if (childParsed) markAsParsed(child, childParsed);
        }
      }
    }
  });
}

const comment = commentPlugin;

Object.defineProperty(exports, "__esModule", { value: true });
Object.defineProperty(exports, "comment", {
  enumerable: true,
  get: () => comment,
});
Object.defineProperty(exports, "default", {
  enumerable: true,
  get: () => comment,
});
Object.defineProperty(exports, "markAsParsed", {
  enumerable: true,
  get: () => markAsParsed,
});
