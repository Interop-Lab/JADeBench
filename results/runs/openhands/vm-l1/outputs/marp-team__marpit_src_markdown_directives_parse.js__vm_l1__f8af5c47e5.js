const yamlParser = require("js-yaml");
const frontMatterPlugin = require("markdown-it-front-matter");

const globalDirectives = Object.assign(Object.create(null), {
  headingDivider(value) {
    const headings = [1, 2, 3, 4, 5, 6];
    const normalize = item =>
      Array.isArray(item) || Number.isNaN(item) ? item : Number.parseInt(item, 10);
    const normalized = normalize(value);

    if (Array.isArray(normalized)) {
      const selected = normalized.map(normalize);
      return { headingDivider: headings.filter(heading => selected.includes(heading)) };
    }
    if (value === "false") return { headingDivider: false };
    if (headings.includes(normalized)) return { headingDivider: normalized };
    return {};
  },

  style: value => ({ style: value }),

  theme(value, marpit) {
    return marpit.themeSet.has(value) ? { theme: value } : {};
  },

  lang: value => ({ lang: value }),
});

const localDirectives = Object.assign(Object.create(null), {
  backgroundColor: value => ({ backgroundColor: value }),
  backgroundImage: value => ({ backgroundImage: value }),
  backgroundPosition: value => ({ backgroundPosition: value }),
  backgroundRepeat: value => ({ backgroundRepeat: value }),
  backgroundSize: value => ({ backgroundSize: value }),
  class: value => ({ class: Array.isArray(value) ? value.join(" ") : value }),
  color: value => ({ color: value }),
  footer: value => (typeof value === "string" ? { footer: value } : {}),
  header: value => (typeof value === "string" ? { header: value } : {}),

  paginate(value) {
    const normalized = (value || "").toLowerCase();
    if (["hold", "skip"].includes(normalized)) return { paginate: normalized };
    return { paginate: normalized === "true" };
  },
});

const directiveNames = [
  ...Object.keys(globalDirectives),
  ...Object.keys(localDirectives),
];

function createPatterns(directives) {
  const patterns = new Set();
  for (const directive of directives) {
    const escaped = `_?${directive.replace(/[.*+?^=!:${}()|[\]\\/]/g, "\\$&")}`;
    patterns.add(escaped);
    patterns.add(`"${escaped}"`);
    patterns.add(`'${escaped}'`);
  }
  return [...patterns.values()];
}

const yamlSpecialCharacters = "[\"'{|>~&*";

function parseYaml(text) {
  try {
    const parsed = yamlParser.load(text, { schema: yamlParser.FAILSAFE_SCHEMA });
    return parsed === null || typeof parsed !== "object" ? false : parsed;
  } catch {
    return false;
  }
}

function convertLooseYaml(text, directives) {
  const pattern = `(?:${createPatterns(directives).join("|")})`;
  const directivePattern = new RegExp(`^(${pattern}\\s*:)(.+)$`);
  let converted = "";

  for (const line of text.split(/\r?\n/)) {
    converted += `${line.replace(directivePattern, (match, key, value) => {
      const trimmed = value.trim();
      if (trimmed.length === 0 || yamlSpecialCharacters.includes(trimmed[0])) {
        return match;
      }

      const indentationLength = value.length - value.trimLeft().length;
      const indentation = value.substring(0, indentationLength);
      const escaped = trimmed.split('"').join('\\"');
      return `${key}${indentation}"${escaped}"`;
    })}\n`;
  }

  return converted.trim();
}

function yaml(text, loose = false) {
  if (!loose) return parseYaml(text);
  const extraDirectives = Array.isArray(loose) ? loose : [];
  return parseYaml(convertLooseYaml(text, [...directiveNames, ...extraDirectives]));
}

const commentMatcher = /<!--+\s*([\s\S]*?)\s*--+>/;
const commentMatcherOpening = /^<!--/;
const commentMatcherClosing = /-->/;
const magicCommentMatchers = [
  /^prettier-ignore(-(start|end))?$/,
  /^markdownlint-((disable|enable).*|capture|restore)$/,
  /^lint (disable|enable|ignore).*$/,
];

function markAsParsed(token, reason) {
  token.meta = token.meta || {};
  token.meta.marpitCommentParsed = reason;
}

function parseCommentDirectives(token, content, state) {
  const parsed = yaml(content, Boolean(state.marpit.options.looseYAML));
  token.meta = token.meta || {};
  token.meta.marpitParsedDirectives = parsed === false ? {} : parsed;

  for (const matcher of magicCommentMatchers) {
    if (matcher.test(content.trim())) {
      markAsParsed(token, "well-known-magic-comment");
      break;
    }
  }
}

function commentBlockRule(state, startLine, endLine, silent) {
  let start = state.bMarks[startLine] + state.tShift[startLine];
  if (state.src.charCodeAt(start) !== 0x3c) return false;

  let end = state.eMarks[startLine];
  let line = state.src.slice(start, end);
  if (!commentMatcherOpening.test(line)) return false;
  if (silent) return true;

  let nextLine = startLine + 1;
  while (!commentMatcherClosing.test(line) && nextLine < endLine) {
    if (state.sCount[nextLine] < state.blkIndent) break;
    start = state.bMarks[nextLine] + state.tShift[nextLine];
    end = state.eMarks[nextLine];
    line = state.src.slice(start, end);
    nextLine += 1;
    if (commentMatcherClosing.test(line)) break;
  }

  state.line = nextLine;
  const token = state.push("marpit_comment", "", 0);
  token.map = [startLine, nextLine];
  token.markup = state.getLines(startLine, nextLine, state.blkIndent, true);
  token.hidden = true;

  const match = commentMatcher.exec(token.markup);
  token.content = match ? match[1].trim() : "";
  parseCommentDirectives(token, token.content, state);
  return true;
}

function commentInlineRule(state, silent) {
  const { posMax, src } = state;
  if (
    state.pos + 2 >= posMax ||
    src.charCodeAt(state.pos) !== 0x3c ||
    src.charCodeAt(state.pos + 1) !== 0x21
  ) {
    return false;
  }

  const match = src.slice(state.pos).match(commentMatcher);
  if (!match) return false;

  if (!silent) {
    const token = state.push("marpit_comment", "", 0);
    token.hidden = true;
    token.markup = src.slice(state.pos, state.pos + match[0].length);
    token.content = match[1].trim();
    parseCommentDirectives(token, token.content, state);
  }

  state.pos += match[0].length;
  return true;
}

function commentPlugin(markdown) {
  markdown.block.ruler.before("html_block", "marpit_comment", commentBlockRule);
  markdown.inline.ruler.before("html_inline", "marpit_inline_comment", commentInlineRule);
}

function isDirectiveComment(token) {
  return token.type === "marpit_comment" && token.meta.marpitParsedDirectives;
}

function createMarpitPlugin(plugin) {
  return function marpitPlugin(markdown, ...args) {
    if (markdown.marpit) return plugin.call(this, markdown, ...args);
    throw new Error("Marpit plugin has detected incompatible markdown-it instance.");
  };
}

const comment = createMarpitPlugin(commentPlugin);

function directivesPlugin(markdown, options = {}) {
  const marpit = markdown.marpit;
  let frontMatter = {};

  const applyDirectiveMap = (values, handlers) => {
    let result = {};
    for (const key of Object.keys(values)) {
      if (handlers[key]) {
        result = { ...result, ...handlers[key](values[key], marpit) };
      } else {
        result[key] = values[key];
      }
    }
    return result;
  };

  const useFrontMatter =
    options.frontMatter === undefined ? true : Boolean(options.frontMatter);

  function resetFrontMatter(state) {
    frontMatter = {};
    if (!state.inlineMode) marpit.lastGlobalDirectives = {};
  }

  function readFrontMatter(content) {
    frontMatter.text = content;
    const loose = marpit.options.looseYAML
      ? [
          ...Object.keys(marpit.customDirectives.global),
          ...Object.keys(marpit.customDirectives.local),
        ]
      : false;
    const parsed = yaml(content, loose);
    if (parsed !== false) frontMatter.yaml = parsed;
  }

  function parseGlobalDirectives(state) {
    if (state.inlineMode) return;

    let current = {};
    const apply = values => {
      let parsed = false;
      for (const key of Object.keys(values)) {
        if (globalDirectives[key]) {
          parsed = true;
          current = {
            ...current,
            ...globalDirectives[key](values[key], marpit),
          };
        } else if (marpit.customDirectives.global[key]) {
          parsed = true;
          current = {
            ...current,
            ...applyDirectiveMap(
              marpit.customDirectives.global[key](values[key], marpit),
              globalDirectives,
            ),
          };
        }
      }
      return parsed;
    };

    if (frontMatter.yaml) apply(frontMatter.yaml);

    for (const token of state.tokens) {
      if (isDirectiveComment(token) && apply(token.meta.marpitParsedDirectives)) {
        markAsParsed(token, "directive");
        continue;
      }
      if (token.type !== "inline") continue;
      for (const child of token.children) {
        if (isDirectiveComment(child) && apply(child.meta.marpitParsedDirectives)) {
          markAsParsed(child, "directive");
        }
      }
    }

    marpit.lastGlobalDirectives = { ...current };
  }

  function parseLocalDirectives(state) {
    if (state.inlineMode) return;

    const slides = [];
    const current = { slide: undefined, local: {}, spot: {} };

    const apply = values => {
      let parsed = false;
      for (const key of Object.keys(values)) {
        if (localDirectives[key]) {
          parsed = true;
          current.local = {
            ...current.local,
            ...localDirectives[key](values[key], marpit),
          };
        } else if (marpit.customDirectives.local[key]) {
          parsed = true;
          current.local = {
            ...current.local,
            ...applyDirectiveMap(
              marpit.customDirectives.local[key](values[key], marpit),
              localDirectives,
            ),
          };
        }

        if (!key.startsWith("_")) continue;
        const spotKey = key.slice(1);
        if (localDirectives[spotKey]) {
          parsed = true;
          current.spot = {
            ...current.spot,
            ...localDirectives[spotKey](values[key], marpit),
          };
        } else if (marpit.customDirectives.local[spotKey]) {
          parsed = true;
          current.spot = {
            ...current.spot,
            ...applyDirectiveMap(
              marpit.customDirectives.local[spotKey](values[key], marpit),
              localDirectives,
            ),
          };
        }
      }
      return parsed;
    };

    if (frontMatter.yaml) apply(frontMatter.yaml);

    for (const token of state.tokens) {
      if (token.meta && token.meta.marpitSlideElement === 1) {
        token.meta.marpitDirectives = {};
        slides.push(token);
        current.slide = token;
        continue;
      }

      if (token.meta && token.meta.marpitSlideElement === -1) {
        current.slide.meta.marpitDirectives = {
          ...current.slide.meta.marpitDirectives,
          ...current.local,
          ...current.spot,
        };
        current.spot = {};
        continue;
      }

      if (isDirectiveComment(token) && apply(token.meta.marpitParsedDirectives)) {
        markAsParsed(token, "directive");
        continue;
      }
      if (token.type !== "inline") continue;
      for (const child of token.children) {
        if (isDirectiveComment(child) && apply(child.meta.marpitParsedDirectives)) {
          markAsParsed(child, "directive");
        }
      }
    }

    for (const slide of slides) {
      slide.meta.marpitDirectives = {
        ...slide.meta.marpitDirectives,
        ...marpit.lastGlobalDirectives,
      };
    }
  }

  if (useFrontMatter) {
    markdown.core.ruler.before(
      "block",
      "marpit_directives_front_matter",
      resetFrontMatter,
    );
    markdown.use(frontMatterPlugin, readFrontMatter);
  }

  markdown.core.ruler.after(
    "inline",
    "marpit_directives_global_parse",
    parseGlobalDirectives,
  );
  markdown.core.ruler.after(
    "marpit_slide",
    "marpit_directives_parse",
    parseLocalDirectives,
  );
}

const parse = createMarpitPlugin(directivesPlugin);

const exported = {};
Object.defineProperty(exported, "__esModule", { value: true });
Object.defineProperty(exported, "default", {
  enumerable: true,
  get: () => parse,
});
Object.defineProperty(exported, "parse", {
  enumerable: true,
  get: () => parse,
});
module.exports = exported;
