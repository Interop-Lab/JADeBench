"use strict";

const jsYaml = require("js-yaml");
const markdownItFrontMatter = require("markdown-it-front-matter");

const commentMatcher = /<!--+\s*([\s\S]*?)\s*--+>/;
const magicCommentMatchers = [
  /^prettier-ignore(-(start|end))?$/,
  /^markdownlint-((disable|enable).*|capture|restore)$/,
  /^lint (disable|enable|ignore).*$/,
];

const headingLevels = [1, 2, 3, 4, 5, 6];

const globalDirectives = Object.assign(Object.create(null), {
  headingDivider(value) {
    const convert = item => {
      if (Array.isArray(item) || Number.isInteger(item)) return item;
      return Number.parseInt(item, 10);
    };

    const converted = convert(value);

    if (Array.isArray(converted)) {
      const levels = converted.map(convert);
      return {
        headingDivider: headingLevels.filter(level => levels.includes(level)),
      };
    }

    if (value === false || value === "false") {
      return { headingDivider: false };
    }

    if (headingLevels.includes(converted)) {
      return { headingDivider: converted };
    }

    return {};
  },

  style(value) {
    return { style: value };
  },

  theme(value, marpit) {
    return marpit && marpit.themeSet && marpit.themeSet.has(value)
      ? { theme: value }
      : {};
  },

  lang(value) {
    return { lang: value };
  },
});

const localDirectives = Object.assign(Object.create(null), {
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
    return { class: Array.isArray(value) ? value.join(" ") : value };
  },

  color(value) {
    return { color: value };
  },

  footer(value) {
    return typeof value === "string" ? { footer: value } : {};
  },

  header(value) {
    return typeof value === "string" ? { header: value } : {};
  },

  paginate(value) {
    const normalized = (value || "").toString().toLowerCase();

    if (["skip", "hold"].includes(normalized)) {
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
    const escaped = `_?${name.replace(
      /[.*+?^=!:${}()|[\]\\/]/g,
      "\\$&"
    )}`;

    patterns.add(escaped);
    patterns.add(`"${escaped}"`);
    patterns.add(`'${escaped}'`);
  }

  return [...patterns.values()];
}

function convertLoose(source, names) {
  const patterns = createPatterns(names);
  if (patterns.length === 0) return source.trim();

  const keyPattern = `(?:${patterns.join("|")})`;
  const matcher = new RegExp(`^(\\s*${keyPattern}\\s+)(.+?)\\s*$`);
  let converted = "";

  for (const line of source.split(/\r?\n/)) {
    converted +=
      line.replace(matcher, (match, key, rawValue) => {
        const value = rawValue.trim();

        if (
          value.length === 0 ||
          value.includes(":") ||
          "&*".includes(value[0])
        ) {
          return match;
        }

        const separator = key.endsWith(" ") ? key.slice(0, -1) : key;
        return `${separator}: "${value
          .replace(/\\/g, "\\\\")
          .replace(/"/g, '\\"')}"`;
      }) + "\n";
  }

  return converted.trim();
}

function parseYaml(source) {
  try {
    const parsed = jsYaml.load(source, {
      schema: jsYaml.JSON_SCHEMA,
    });

    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
      return false;
    }

    return parsed;
  } catch {
    return false;
  }
}

function yaml(source, loose = false) {
  const customNames = Array.isArray(loose) ? loose : [];
  const input = loose
    ? convertLoose(source, [...directiveNames, ...customNames])
    : source;

  return parseYaml(input);
}

function markAsProcessed(token, scope) {
  token.meta = token.meta || {};
  token.meta.marpitCommentProcessed = scope;
}

function parseCommentToken(token, marpit) {
  token.meta = token.meta || {};

  const content = typeof token.content === "string" ? token.content : "";
  const match = commentMatcher.exec(content);
  const body = match ? match[1].trim() : content.trim();

  token.meta.marpitComment = body;

  if (magicCommentMatchers.some(matcher => matcher.test(body))) {
    token.meta.marpitCommentParsed = {};
    token.meta.marpitCommentMagic = true;
    return;
  }

  const loose =
    !!(
      marpit &&
      marpit.options &&
      (marpit.options.looseYAML || marpit.options.looseYaml)
    );

  const customGlobal =
    (marpit &&
      marpit.customDirectives &&
      marpit.customDirectives.global) ||
    {};
  const customLocal =
    (marpit &&
      marpit.customDirectives &&
      marpit.customDirectives.local) ||
    {};

  const customNames = [
    ...Object.keys(customGlobal),
    ...Object.keys(customLocal),
  ];

  const parsed = yaml(body, loose ? customNames : false);
  token.meta.marpitCommentParsed = parsed === false ? {} : parsed;
}

function convertCommentTokens(tokens, marpit) {
  for (const token of tokens) {
    if (
      (token.type === "html_block" || token.type === "html_inline") &&
      typeof token.content === "string" &&
      /^\s*<!--/.test(token.content) &&
      /-->\s*$/.test(token.content)
    ) {
      token.type = "marpit_comment";
      token.tag = "";
      token.hidden = true;
      parseCommentToken(token, marpit);
    }

    if (Array.isArray(token.children)) {
      convertCommentTokens(token.children, marpit);
    }
  }
}

function commentPlugin(md) {
  if (md.__marpitCommentPlugin) return;
  Object.defineProperty(md, "__marpitCommentPlugin", {
    configurable: true,
    value: true,
  });

  md.core.ruler.push("marpit_comment", state => {
    const marpit = md.marpit || md.__marpit__ || {};
    convertCommentTokens(state.tokens, marpit);
  });
}

function applyDirectiveResult(result, handlers, marpit) {
  let output = {};

  if (!result || typeof result !== "object" || Array.isArray(result)) {
    return output;
  }

  for (const key of Object.keys(result)) {
    if (typeof handlers[key] === "function") {
      output = {
        ...output,
        ...handlers[key](result[key], marpit),
      };
    } else {
      output[key] = result[key];
    }
  }

  return output;
}

function resolveDirective(
  source,
  builtInHandlers,
  customHandlers,
  marpit,
  allowUnderscore
) {
  let found = false;
  let directives = {};

  if (!source || typeof source !== "object" || Array.isArray(source)) {
    return { found, directives };
  }

  for (const originalKey of Object.keys(source)) {
    let key = originalKey;

    if (allowUnderscore && key.startsWith("_")) {
      key = key.slice(1);
    } else if (!allowUnderscore && key.startsWith("_")) {
      continue;
    }

    if (typeof builtInHandlers[key] === "function") {
      found = true;
      directives = {
        ...directives,
        ...builtInHandlers[key](source[originalKey], marpit),
      };
      continue;
    }

    if (typeof customHandlers[key] === "function") {
      found = true;
      const customResult = customHandlers[key](source[originalKey], marpit);
      directives = {
        ...directives,
        ...applyDirectiveResult(customResult, builtInHandlers, marpit),
      };
    }
  }

  return { found, directives };
}

function isDirectiveComment(token) {
  return (
    token &&
    token.type === "marpit_comment" &&
    token.meta &&
    token.meta.marpitCommentParsed &&
    !token.meta.marpitCommentMagic
  );
}

function walkTokens(tokens, callback) {
  for (const token of tokens) {
    callback(token);
    if (Array.isArray(token.children)) walkTokens(token.children, callback);
  }
}

function isSlideOpen(token) {
  return (
    token.type === "marpit_slide_open" ||
    token.type === "slide_open" ||
    !!(
      token.meta &&
      (token.meta.marpitSlideElement === 1 ||
        token.meta.marpitSlide === "open")
    )
  );
}

function isSlideClose(token) {
  return (
    token.type === "marpit_slide_close" ||
    token.type === "slide_close" ||
    !!(
      token.meta &&
      (token.meta.marpitSlideElement === -1 ||
        token.meta.marpitSlide === "close")
    )
  );
}

function attachDirectives(token, directives) {
  if (!token) return;

  token.meta = token.meta || {};
  token.meta.marpitDirectives = {
    ...(token.meta.marpitDirectives || {}),
    ...directives,
  };
}

function parsePlugin(md, options = {}) {
  const marpit = md.marpit || md.__marpit__ || {};
  const customDirectives = marpit.customDirectives || {};
  const customGlobal = customDirectives.global || {};
  const customLocal = customDirectives.local || {};

  md.use(commentPlugin);

  const frontMatterEnabled =
    options.frontMatter === undefined ? true : !!options.frontMatter;

  let frontMatterSource;
  let frontMatterDirectives;

  if (frontMatterEnabled) {
    md.use(markdownItFrontMatter, source => {
      frontMatterSource = source;
      frontMatterDirectives = yaml(
        source,
        marpit.options &&
          (marpit.options.looseYAML || marpit.options.looseYaml)
          ? [
              ...Object.keys(customGlobal),
              ...Object.keys(customLocal),
            ]
          : false
      );
    });
  }

  md.core.ruler.push("marpit_parse_directives", state => {
    if (state.inlineMode) return;

    convertCommentTokens(state.tokens, marpit);

    let globals = {};

    if (frontMatterDirectives && frontMatterDirectives !== false) {
      const resolved = resolveDirective(
        frontMatterDirectives,
        globalDirectives,
        customGlobal,
        marpit,
        false
      );
      globals = { ...globals, ...resolved.directives };
    }

    const slides = [];
    let currentSlide;
    let currentLocal = {};
    let slideGlobals = { ...globals };

    const finishSlide = () => {
      if (!currentSlide) return;

      attachDirectives(currentSlide, {
        ...slideGlobals,
        ...currentLocal,
      });

      currentSlide = undefined;
      currentLocal = {};
      slideGlobals = { ...globals };
    };

    for (const token of state.tokens) {
      if (isSlideOpen(token)) {
        finishSlide();
        currentSlide = token;
        currentLocal = {};
        slideGlobals = { ...globals };
        slides.push(token);
      }

      const processToken = candidate => {
        if (!isDirectiveComment(candidate)) return;

        const parsed = candidate.meta.marpitCommentParsed;

        const globalResult = resolveDirective(
          parsed,
          globalDirectives,
          customGlobal,
          marpit,
          false
        );

        if (globalResult.found) {
          globals = { ...globals, ...globalResult.directives };
          slideGlobals = { ...slideGlobals, ...globalResult.directives };
          markAsProcessed(candidate, "global");
        }

        const localResult = resolveDirective(
          parsed,
          localDirectives,
          customLocal,
          marpit,
          true
        );

        if (localResult.found) {
          currentLocal = {
            ...currentLocal,
            ...localResult.directives,
          };
          markAsProcessed(candidate, "local");
        }

        candidate.hidden = true;
      };

      processToken(token);

      if (Array.isArray(token.children)) {
        walkTokens(token.children, processToken);
      }

      if (isSlideClose(token)) finishSlide();
    }

    finishSlide();

    if (slides.length === 0 && state.tokens.length > 0) {
      const first = state.tokens[0];
      attachDirectives(first, {
        ...globals,
        ...currentLocal,
      });
    }

    marpit.lastGlobalDirectives = { ...globals };

    if (frontMatterSource !== undefined) {
      marpit.lastFrontMatter = frontMatterSource;
    }
  });
}

const parse = parsePlugin;

Object.defineProperty(exports, "__esModule", { value: true });
Object.defineProperty(exports, "default", {
  enumerable: true,
  get: () => parse,
});
Object.defineProperty(exports, "parse", {
  enumerable: true,
  get: () => parse,
});
