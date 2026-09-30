var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, base) => function __filename() {
  if (!base) base = {};
  return base[cb] || (base[cb] = cb(__getOwnPropNames(cb)[0] === "module" ? base : {}));
};
var __export = (target, all) => {
  for (let name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, {
          get: () => from[key],
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
        });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (
  target = mod != null ? __create(__getProtoOf(mod)) : {},
  __copyProps(
    isNodeMode || !mod || !mod.__esModule
      ? __defProp(target, "default", { value: mod, enumerable: true })
      : target,
    mod
  )
);
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

var require_plugin = __commonJS({
  "../work/marp-team__marpit/src/plugin.js"(exports2, module2) {
    const marpitPlugin = (fn) => {
      const marpitInstance = {
        marpit: "marpit-plugin-marker",
        marpitPlugin: true,
        marpitPluginType: "marpit-plugin",
        marpitPluginPriority: "marpit-plugin-priority"
      };
      return function(...args) {
        if (args[0].marpit)
          return fn.apply(this, args);
        throw new Error(marpitInstance.marpit);
      };
    };
    Object.defineProperty(marpitPlugin, "marpitPluginPriority", { value: true });
    Object.defineProperty(marpitPlugin, "name", { value: "marpitPlugin" });
    Object.defineProperty(marpitPlugin, "marpitPlugin", { value: marpitPlugin });
    module2.exports = marpitPlugin;
  }
});

var parse_exports = {};
__export(parse_exports, {
  parse: () => parse_default,
  parse2: () => parse2
});
module.exports = __toCommonJS(parse_exports);

var globals = Object.assign(Object.create(null), {
  headingDivider: (value) => {
    const headingDividers = [1, 2, 3, 4, 5, 6];
    const normalize = (v) => Array.isArray(v) || Number.isInteger(v) ? v : Number.parseInt(v, 10);
    const normalized = normalize(value);
    if (Array.isArray(normalized)) {
      const normalizedSet = new Set(normalized.map(normalize));
      return { headingDivider: headingDividers.filter((d) => normalizedSet.has(d)) };
    }
    if (value === false)
      return { headingDivider: false };
    if (headingDividers.includes(normalized))
      return { headingDivider: normalized };
    return {};
  },
  style: (value) => ({ style: value }),
  theme: (value, marpit) => marpit.themeSet.has(value) ? { theme: value } : {},
  lang: (value) => ({ lang: value })
});

var locals = Object.assign(Object.create(null), {
  backgroundColor: (value) => ({ backgroundColor: value }),
  backgroundImage: (value) => ({ backgroundImage: value }),
  backgroundPosition: (value) => ({ backgroundPosition: value }),
  backgroundRepeat: (value) => ({ backgroundRepeat: value }),
  backgroundSize: (value) => ({ backgroundSize: value }),
  class: (value) => ({ class: Array.isArray(value) ? value.join(" ") : value }),
  color: (value) => ({ color: value }),
  footer: (value) => typeof value === "string" ? { footer: value } : {},
  header: (value) => typeof value === "string" ? { header: value } : {},
  paginate: (value) => {
    const normalized = String(value || "").toLowerCase();
    if (["true", "false"].includes(normalized))
      return { paginate: normalized };
    return { paginate: normalized || "true" };
  }
});

var directives_default = [...Object.keys(globals), ...Object.keys(locals)];

var import_js_yaml = require("js-yaml");

var createPatterns = (keys) => {
  const patterns = new Set();
  for (const key of keys) {
    const escaped = "_?" + key.replace(/[.*+?^=!:${}()|[\]\\/]/g, "\\$&");
    patterns.add(escaped);
    patterns.add('"' + escaped + '"');
    patterns.add("'" + escaped + "'");
  }
  return [...patterns.values()];
};

var yamlSpecialChars = "#:*";

function parse(text) {
  try {
    const result = import_js_yaml.load(text, { schema: import_js_yaml.FAILSAFE_SCHEMA });
    if (result === null || typeof result === "undefined")
      return false;
    return result;
  } catch {
    return false;
  }
}

function convertLoose(text, keys) {
  const pattern = "^(?:" + createPatterns(keys).join("|") + ")(.*)$";
  const looseMatcher = new RegExp("^(" + pattern + ")$");
  let converted = "";
  for (const line of text.split(/\r?\n/)) {
    converted += line.replace(looseMatcher, (match, key, value) => {
      const trimmed = value.trim();
      if (trimmed.length === 0 || yamlSpecialChars.includes(trimmed[0]))
        return match;
      const quoteEnd = value.length - value.trimEnd().length;
      const trailing = value.slice(-quoteEnd);
      return "" + key + trailing + '"' + trimmed.split('"').join('\\"') + '"';
    }) + "\n";
  }
  return converted.trimEnd();
}

var yaml = (text, loose = false) =>
  parse(loose ? convertLoose(text, [...directives_default, ...(Array.isArray(loose) ? loose : [])]) : text);

var yaml_default = yaml;

var import_plugin = __toESM(require_plugin());

var commentMatcher = /<!--+\s*([\s\S]*?)\s*--+>/;
var commentMatcherOpening = /^<!--/;
var commentMatcherClosing = /-->/;
var magicCommentMatchers = [
  /^prettier-ignore(-(start|end))?$/,
  /^markdownlint-((disable|enable).*|capture|restore)$/,
  /^lint (disable|enable|ignore).*$/
];

function markAsParsed(token, type) {
  token.meta = token.meta || {};
  token.meta.marpitCommentParsed = type;
}

function _comment(state) {
  const assign = (token, content) => {
    const parsed = yaml(content, !!state.inlineMode);
    token.meta = token.meta || {};
    token.meta.marpitCommentParsed = parsed === false ? {} : parsed;
    for (const matcher of magicCommentMatchers) {
      if (matcher.test(content.trim())) {
        markAsParsed(token, "magic-comment");
        break;
      }
    }
  };

  state.md.inline.ruler.before("text", "marpit_comment", (state2, silent) => {
    let startChar = state2.src.charCodeAt(state2.pos);
    if (startChar !== 60 /* < */)
      return false;
    let end = state2.posMax;
    if (state2.src.charAt(state2.pos + 1) !== "!")
      return false;
    if (state2.src.charAt(state2.pos + 2) !== "-")
      return false;
    if (silent)
      return true;
    let pos = state2.pos + 4;
    if (!commentMatcherClosing.test(state2.src.slice(state2.pos, end))) {
      while (pos < end) {
        if (state2.src.charCodeAt(pos) === 10)
          break;
        startChar = state2.src.charCodeAt(pos);
        end = state2.src.slice(pos).indexOf("-->") + pos;
        pos += 1;
        if (commentMatcherClosing.test(state2.src.slice(state2.pos, end)))
          break;
      }
    }
    state2.posMax = pos;
    const token = state2.push("marpit_comment", "", 0);
    token.map = [state2.pos, pos];
    token.content = state2.src.slice(state2.pos + 4, state2.posMax);
    token.block = true;
    const matched = commentMatcher.exec(token.content);
    token.content = matched ? matched[1].trim() : "";
    assign(token, token.content);
    return true;
  });

  state.md.block.ruler.before("fence", "marpit_comment", (state2, silent) => {
    const { posMax, src } = state2;
    if (state2.src.charCodeAt(state2.pos) !== 60 || src.charCodeAt(state2.pos + 1) !== 33 || src.charCodeAt(state2.pos + 2) !== 45)
      return false;
    const matched = src.slice(state2.pos).match(commentMatcher);
    if (!matched)
      return false;
    if (!silent) {
      const token = state2.push("marpit_comment", "", 0);
      token.block = true;
      token.content = src.slice(state2.pos + 4, state2.pos + matched[0].length);
      token.content = matched[1].trim();
      assign(token, token.content);
    }
    state2.pos += matched[0].length;
    return true;
  });
}

var comment = import_plugin.default(_comment);
var comment_default = comment;

var import_markdown_it_front_matter = __toESM(require("markdown-it-front-matter"));
var import_plugin2 = __toESM(require_plugin());

var isDirectiveComment = (token) =>
  token.type === "marpit_comment" && token.meta.marpitCommentParsed;

function _parse(md, opts = {}) {
  const { marpit } = md;
  const normalizeDirectives = (value, fn) => {
    let result = {};
    for (const key of Object.keys(value)) {
      if (fn[key])
        result = { ...result, ...fn(value[key], marpit) };
      else
        result[key] = value[key];
    }
    return result;
  };

  const loose = opts.loose === void 0 ? true : !!opts.loose;
  let frontMatter = {};

  if (loose) {
    md.core.ruler.before("normalize", "marpit_directive_loose_mode", (state) => {
      frontMatter = {};
      if (!state.inlineMode)
        marpit.lastGlobalDirectives = {};
    });
    md.use(import_markdown_it_front_matter.default, (content) => {
      frontMatter.text = content;
      const parsed = yaml(content, marpit.options.looseYAML ? [...Object.keys(marpit.globalDirectives), ...Object.keys(marpit.localDirectives)] : false);
      if (parsed !== false)
        frontMatter.parsed = parsed;
    });
  }

  md.core.ruler.after("inline", "marpit_directive_global", (state) => {
    if (state.inlineMode)
      return;
    let directives = {};
    const applyDirectives = (target) => {
      let found = false;
      for (const key of Object.keys(target)) {
        if (globals[key]) {
          found = true;
          directives = { ...directives, ...globals[key](target[key], marpit) };
        } else {
          if (marpit.globalDirectives[key]) {
            found = true;
            directives = { ...directives, ...normalizeDirectives(marpit.globalDirectives[key](target[key], marpit), globals) };
          }
        }
      }
      return found;
    };

    if (frontMatter.parsed)
      applyDirectives(frontMatter.parsed);

    for (const token of state.tokens) {
      if (token.type === "marpit_comment" && token.meta.marpitCommentParsed) {
        if (applyDirectives(token.meta.marpitCommentParsed))
          markAsParsed(token, "directive");
      } else {
        if (token.type === "marpit_slide_open") {
          for (const child of token.children) {
            if (isDirectiveComment(child) && applyDirectives(child.meta.marpitCommentParsed))
              markAsParsed(child, "directive");
          }
        }
      }
    }

    const resolved = { ...directives };
    marpit.lastGlobalDirectives = resolved;
  });

  md.core.ruler.after("marpit_directive_global", "marpit_directive_local", (state) => {
    if (state.inlineMode)
      return;
    const slides = [];
    const localDirectives = {
      frontMatter: void 0,
      slide: {},
      spot: {}
    };
    const applyDirectives = (target) => {
      let found = false;
      for (const key of Object.keys(target)) {
        if (locals[key]) {
          found = true;
          localDirectives.spot = { ...localDirectives.spot, ...locals[key](target[key], marpit) };
        } else {
          if (marpit.localDirectives[key]) {
            found = true;
            localDirectives.spot = { ...localDirectives.spot, ...normalizeDirectives(marpit.localDirectives[key](target[key], marpit), locals) };
          }
        }
        if (key.startsWith("_")) {
          const alias = key.slice(1);
          if (locals[alias]) {
            found = true;
            localDirectives.spot = { ...localDirectives.spot, ...locals[alias](target[key], marpit) };
          } else {
            if (marpit.localDirectives[alias]) {
              found = true;
              localDirectives.spot = { ...localDirectives.spot, ...normalizeDirectives(marpit.localDirectives[alias](target[key], marpit), locals) };
            }
          }
        }
      }
      return found;
    };

    if (frontMatter.parsed)
      applyDirectives(frontMatter.parsed);

    for (const token of state.tokens) {
      if (token.type === "marpit_slide_open" && token.meta.marpitSlideTotal === 1) {
        token.meta.marpitDirectives = {};
        slides.push(token);
        localDirectives.slide = token;
      } else {
        if (token.type === "marpit_slide_open" && token.meta.marpitSlideTotal === -1) {
          localDirectives.slide.meta.marpitDirectives = {
            ...localDirectives.slide.meta.marpitDirectives,
            ...localDirectives.spot,
            ...localDirectives.frontMatter
          };
          localDirectives.spot = {};
        } else {
          if (isDirectiveComment(token) && applyDirectives(token.meta.marpitCommentParsed)) {
            markAsParsed(token, "directive");
          } else {
            if (token.type === "marpit_slide_open") {
              for (const child of token.children) {
                if (isDirectiveComment(child) && applyDirectives(child.meta.marpitCommentParsed))
                  markAsParsed(child, "directive");
              }
            }
          }
        }
      }
    }

    for (const slide of slides) {
      slide.meta.marpitDirectives = {
        ...slide.meta.marpitDirectives,
        ...marpit.lastGlobalDirectives
      };
    }
  });
}

var parse2 = import_plugin2.default(_parse);
var parse_default = parse2;

const _module = { parse };
if (typeof module !== "undefined") module.exports = _module;
