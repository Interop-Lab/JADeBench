"use strict";

const yamlParser = require("js-yaml");
const frontMatter = require("markdown-it-front-matter");

function marpitPlugin(plugin) {
  return function wrappedPlugin(markdown) {
    return plugin.call(this, markdown);
  };
}

Object.defineProperty(marpitPlugin, "__esModule", { value: true });
Object.defineProperty(marpitPlugin, "default", { value: marpitPlugin });
Object.defineProperty(marpitPlugin, "marpitPlugin", { value: marpitPlugin });

const globalDirectives = Object.assign(Object.create(null), {
  headingDivider(value) {
    const values = (Array.isArray(value) ? value : [value])
      .map(Number.parseFloat)
      .filter(number => number > 0);

    return values.length > 0
      ? { headingDivider: values.length === 1 ? values[0] : values }
      : {};
  },
  style(value) {
    return value === undefined ? {} : { style: value };
  },
  theme(value, marpit) {
    return value && marpit.themeSet.has(value) ? { theme: value } : {};
  },
  lang(value) {
    return value === undefined ? {} : { lang: value };
  },
});

const localDirectives = Object.assign(Object.create(null), {
  backgroundColor: valueDirective("backgroundColor"),
  backgroundImage: valueDirective("backgroundImage"),
  backgroundPosition: valueDirective("backgroundPosition"),
  backgroundRepeat: valueDirective("backgroundRepeat"),
  backgroundSize: valueDirective("backgroundSize"),
  class(value) {
    return value === undefined
      ? {}
      : { class: Array.isArray(value) ? value.join(" ") : value };
  },
  color: valueDirective("color"),
  footer(value) {
    return typeof value === "string" ? { footer: value } : {};
  },
  header(value) {
    return typeof value === "string" ? { header: value } : {};
  },
  paginate(value) {
    const normalized = Array.isArray(value) ? value[0] : value;
    if (typeof normalized === "string") {
      const keyword = normalized.toLowerCase();
      if (["hold", "skip"].includes(keyword)) return { paginate: keyword };
      return { paginate: keyword === "true" };
    }
    return { paginate: Boolean(normalized) };
  },
});

const directiveNames = [
  ...Object.keys(globalDirectives),
  ...Object.keys(localDirectives),
];
const yamlSpecialChars = `["'{|>~&*`;

function valueDirective(name) {
  return value => (value === undefined ? {} : { [name]: value });
}

function createPatterns(names) {
  const escaped = names.map(name =>
    name.replace(/[.*+?^=!:${}()|[\]\\/]/g, "\\$&"),
  );
  return escaped.flatMap(name => [`_?${name}`, `"_?${name}"`, `'_?${name}'`]);
}

function parseYaml(source) {
  try {
    const parsed = yamlParser.load(source, { schema: yamlParser.FAILSAFE_SCHEMA });
    return typeof parsed === "object" && parsed !== null ? parsed : false;
  } catch {
    return false;
  }
}

function convertLoose(source, patterns) {
  const directivePattern = new RegExp(`^(${patterns.join("|")}\\s*:)(.+)$`);
  return source
    .split(/\r?\n/)
    .map(line =>
      line.replace(directivePattern, (match, key, rawValue) => {
        const value = rawValue.trim();
        if (!value || yamlSpecialChars.includes(value[0])) return match;
        return `${key} ${JSON.stringify(value)}`;
      }),
    )
    .join("\n");
}

function yaml(source, loose = false) {
  if (typeof source !== "string") return {};
  const body = source.replace(/^---\r?\n/, "");
  return parseYaml(
    loose ? convertLoose(body, createPatterns(directiveNames)) : body,
  ) || {};
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
  token.meta ||= {};
  token.meta.marpitCommentParsed = reason;
}

function createCommentToken(state, markup, content) {
  const token = state.push("marpit_comment", "", 0);
  token.hidden = true;
  token.markup = markup;
  token.content = content;
  token.meta ||= {};
  token.meta.marpitParsedDirectives = yaml(
    content,
    state.md.marpit.options.looseYAML,
  );
  if (magicCommentMatchers.some(matcher => matcher.test(content))) {
    markAsParsed(token, "well-known-magic-comment");
  }
  return token;
}

function commentPlugin(markdown) {
  markdown.block.ruler.before(
    "html_block",
    "marpit_comment",
    (state, startLine, endLine, silent) => {
      const start = state.bMarks[startLine] + state.tShift[startLine];
      if (!commentMatcherOpening.test(state.src.slice(start))) return false;

      let nextLine = startLine;
      let end = state.eMarks[nextLine];
      while (!commentMatcherClosing.test(state.src.slice(start, end))) {
        nextLine += 1;
        if (nextLine >= endLine) return false;
        end = state.eMarks[nextLine];
      }
      if (silent) return true;

      const markup = state.src.slice(start, end);
      const match = markup.match(commentMatcher);
      if (!match) return false;
      createCommentToken(state, markup, match[1]);
      state.line = nextLine + 1;
      return true;
    },
  );

  markdown.inline.ruler.before(
    "html_inline",
    "marpit_inline_comment",
    state => {
      if (!commentMatcherOpening.test(state.src.slice(state.pos))) return false;
      const match = state.src.slice(state.pos).match(commentMatcher);
      if (!match || match.index !== 0) return false;
      createCommentToken(state, match[0], match[1]);
      state.pos += match[0].length;
      return true;
    },
  );
}

function resolveDirectives(directives, marpit, type) {
  const resolved = {};
  if (!directives || typeof directives !== "object") return resolved;

  const builtIns = type === "local" ? localDirectives : globalDirectives;
  const custom = marpit.customDirectives?.[type] ?? {};
  for (const [rawName, value] of Object.entries(directives)) {
    let handler = custom[rawName] ?? builtIns[rawName];
    if (!handler && rawName.startsWith("_")) {
      const name = rawName.slice(1);
      handler = custom[name] ?? builtIns[name];
    }
    if (handler) Object.assign(resolved, handler(value, marpit));
  }
  return resolved;
}

function markDirectiveToken(token) {
  markAsParsed(token, "directive");
}

function parsePlugin(markdown) {
  const marpit = markdown.marpit;

  markdown.core.ruler.before(
    "block",
    "marpit_directives_front_matter",
    () => {
      marpit.lastGlobalDirectives = {};
    },
  );

  markdown.use(frontMatter, frontMatterSource => {
    Object.assign(
      marpit.lastGlobalDirectives,
      resolveDirectives(
        yaml(frontMatterSource, marpit.options.looseYAML),
        marpit,
        "global",
      ),
    );
  });

  markdown.core.ruler.after(
    "inline",
    "marpit_directives_global_parse",
    state => {
      for (const token of state.tokens) {
        if (token.type !== "marpit_comment") continue;
        const resolved = resolveDirectives(
          token.meta?.marpitParsedDirectives,
          marpit,
          "global",
        );
        if (Object.keys(resolved).length > 0) {
          Object.assign(marpit.lastGlobalDirectives, resolved);
          markDirectiveToken(token);
        }
      }
    },
  );

  markdown.core.ruler.after(
    "marpit_slide",
    "marpit_directives_parse",
    state => {
      let slideDirectives;
      for (const token of state.tokens) {
        const slideElement = token.meta?.marpitSlideElement;
        if (slideElement === 1) {
          slideDirectives = token.meta.marpitDirectives = {};
        } else if (slideElement === -1) {
          slideDirectives = undefined;
          continue;
        }

        if (token.type === "marpit_comment") {
          const resolved = resolveDirectives(
            token.meta?.marpitParsedDirectives,
            marpit,
            "local",
          );
          if (Object.keys(resolved).length > 0) {
            Object.assign(slideDirectives ??= {}, resolved);
            markDirectiveToken(token);
          }
        }
      }

      for (const token of state.tokens) {
        if (token.meta?.marpitSlideElement === 1) {
          Object.assign(token.meta.marpitDirectives, marpit.lastGlobalDirectives);
        }
      }
    },
  );
}

const parse = marpitPlugin(markdown => {
  commentPlugin(markdown);
  parsePlugin(markdown);
});

module.exports = { parse };
Object.defineProperty(module.exports, "__esModule", { value: true });
Object.defineProperty(module.exports, "default", {
  enumerable: true,
  get: () => parse,
});
