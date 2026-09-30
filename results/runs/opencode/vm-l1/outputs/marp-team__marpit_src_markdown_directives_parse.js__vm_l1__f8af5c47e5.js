"use strict";

const yamlParser = require("js-yaml");
const frontMatter = require("markdown-it-front-matter");

const HTML_COMMENT = /<!--+\s*([\s\S]*?)\s*--+>/;
const HTML_COMMENT_OPEN = /^<!--/;
const HTML_COMMENT_CLOSE = /-->/;
const MAGIC_COMMENTS = [
  /^prettier-ignore(-(start|end))?$/,
  /^markdownlint-((disable|enable).*|capture|restore)$/,
  /^lint (disable|enable|ignore).*$/,
];

const globalDirectives = Object.assign(Object.create(null), {
  headingDivider(value) {
    const divider = Number.parseInt(value, 10);
    return Number.isNaN(divider) ? {} : { headingDivider: divider };
  },
  style(value) {
    return { style: value };
  },
  theme(value, marpit) {
    if (!marpit.themeSet.has(value)) return {};
    return { theme: value };
  },
  lang(value) {
    return { lang: value };
  },
});

const localDirectives = Object.assign(Object.create(null), {
  backgroundColor: (value) => ({ backgroundColor: value }),
  backgroundImage: (value) => ({ backgroundImage: value }),
  backgroundPosition: (value) => ({ backgroundPosition: value }),
  backgroundRepeat: (value) => ({ backgroundRepeat: value }),
  backgroundSize: (value) => ({ backgroundSize: value }),
  class: (value) => ({ class: value }),
  color: (value) => ({ color: value }),
  footer: (value) => ({ footer: value }),
  header: (value) => ({ header: value }),
  paginate(value) {
    return { paginate: value === true || value === "true" };
  },
});

const directiveNames = [
  ...Object.keys(globalDirectives),
  ...Object.keys(localDirectives),
];

function createLooseKeyPatterns(names) {
  return names.flatMap((name) => [
    `_?${name}`,
    `"_?${name}"`,
    `'_?${name}'`,
  ]);
}

const looseKeyPatterns = createLooseKeyPatterns(directiveNames);
const yamlSpecialCharacters = "[\"'{|>~&*";

function parseYaml(source) {
  try {
    const value = yamlParser.load(source, { schema: yamlParser.FAILSAFE_SCHEMA });
    return value && typeof value === "object" && !Array.isArray(value)
      ? value
      : false;
  } catch (_) {
    return false;
  }
}

function convertLooseYaml(source) {
  let converted = source;

  for (const pattern of looseKeyPatterns) {
    const expression = new RegExp(`(^|\\n)([ \\t]*)(${pattern})([ \\t]*):`, "g");
    converted = converted.replace(expression, "$1$2$3: |");
  }

  return converted;
}

function parseDirectives(source, loose = false) {
  if (typeof source !== "string" || source.trim() === "") return false;
  return parseYaml(loose ? convertLooseYaml(source) : source);
}

function markCommentParsed(token, value) {
  token.meta ||= {};
  token.meta.marpitCommentParsed = value;
}

function commentPlugin(marpit) {
  return (markdown) => {
    markdown.core.ruler.after("inline", "marpit_directives_comments", (state) => {
      for (const token of state.tokens) {
        if (token.type !== "html_block" && token.type !== "inline") continue;

        const children = token.children || [token];
        for (const child of children) {
          if (child.type !== "html_block" && child.type !== "html_inline") continue;
          const match = child.content.match(HTML_COMMENT);
          if (!match) continue;

          const body = match[1].trim();
          const magic = MAGIC_COMMENTS.some((pattern) => pattern.test(body));
          markCommentParsed(child, !magic);
        }
      }
    });
  };
}

function isDirectiveComment(token) {
  return Boolean(
    token &&
      token.meta &&
      token.meta.marpitCommentParsed &&
      (token.type === "html_block" || token.type === "html_inline") &&
      HTML_COMMENT_OPEN.test(token.content) &&
      HTML_COMMENT_CLOSE.test(token.content),
  );
}

function applyDirectiveValues(values, converters, marpit, localScope = false) {
  const output = {};
  if (!values) return output;

  for (const [rawName, value] of Object.entries(values)) {
    const local = rawName.startsWith("_");
    const name = local ? rawName.slice(1) : rawName;
    const converter = converters[name];
    if (converter && Boolean(local) === localScope) {
      Object.assign(output, converter(value, marpit));
    }
  }
  return output;
}

function parsePlugin(markdown) {
  const marpit = this;
  const customDirectives = marpit.customDirectives || {};
  const globals = Object.assign(
    Object.create(null),
    globalDirectives,
    customDirectives.global,
  );
  const locals = Object.assign(
    Object.create(null),
    localDirectives,
    customDirectives.local,
  );
  const looseYaml = Boolean(marpit.options && marpit.options.looseYAML);

  markdown.marpit ||= {};
  markdown.core.ruler.before("block", "marpit_directives_front_matter", (state) => {
    state.env ||= {};
    state.env.marpit ||= {};
    state.env.marpit.frontMatter = markdown.marpit.frontMatter;
  });

  markdown.use(frontMatter, (source) => {
    markdown.marpit.frontMatter = parseDirectives(source, looseYaml) || {};
  });

  markdown.core.ruler.after("inline", "marpit_directives_global_parse", (state) => {
    const directives = {
      ...applyDirectiveValues(markdown.marpit.frontMatter, globals, marpit),
    };

    for (const token of state.tokens) {
      const candidates = token.children || [token];
      for (const candidate of candidates) {
        if (!isDirectiveComment(candidate)) continue;
        const match = candidate.content.match(HTML_COMMENT);
        Object.assign(
          directives,
          applyDirectiveValues(parseDirectives(match[1], looseYaml), globals, marpit),
        );
      }
    }

    state.env ||= {};
    state.env.marpit ||= {};
    state.env.marpit.directives ||= {};
    Object.assign(state.env.marpit.directives, directives);
  });

  markdown.core.ruler.after("marpit_slide", "marpit_directives_parse", (state) => {
    for (const token of state.tokens) {
      if (token.type !== "marpit_slide_open") continue;
      const directives = {};
      const source = token.meta && token.meta.marpitDirectives;
      Object.assign(directives, applyDirectiveValues(source, locals, marpit, true));
      token.meta ||= {};
      token.meta.marpitDirectives = directives;
    }
  });
}

function asMarpitPlugin(callback) {
  return function plugin(markdown) {
    return callback.call(markdown.marpit, markdown);
  };
}

const parse = asMarpitPlugin(parsePlugin);

Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = parse;
exports.default = parse;
