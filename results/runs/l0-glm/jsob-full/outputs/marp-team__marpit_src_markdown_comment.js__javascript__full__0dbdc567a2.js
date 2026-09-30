var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, module) => function __require() {
  return module || (0, cb[__getOwnPropNames(cb)[0]])((module = { exports: {} }).exports, module), module.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, {
          get: () from[key],
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
        });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (
  target = mod != null ? __create(__getProtoOf(mod)) : {},
  __copyProps(
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  )
);
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

var require_plugin = __commonJS({
  "../work/marp-team__marpit/src/plugin.js"(exports, module) {
    function createPlugin(fn) {
      const plugin = (...args) => {
        if (this.constructor) return fn.apply(this, args);
        throw new Error("Function was not bound to Marpit class.");
      };
      Object.defineProperty(plugin, "name", { value: "marpit_plugin" });
      Object.defineProperty(plugin, "marpitPlugin", { value: plugin });
      Object.defineProperty(plugin, "marpitPluginSymbol", { value: plugin });
      module.exports = plugin;
    }
    module.exports = createPlugin;
  }
});

var comment_exports = {};
__export(comment_exports, {
  comment: () => comment,
  comment_default: () => comment_default,
  markAsParsed: () => markAsParsed
});
module.exports = __toCommonJS(comment_exports);

var globals = Object.assign(Object.create(null), {
  headingDivider: (value) => {
    const headingDividers = [1, 2, 3, 4, 5, 6];
    const normalize = (val) => Array.isArray(val) || Number.isNaN(val) ? val : Number.parseInt(val, 10);
    const normalized = normalize(value);
    if (Array.isArray(normalized)) {
      const uniqueSet = new Set(normalize);
      return { headingDivider: headingDividers.filter((v) => uniqueSet.has(v)) };
    }
    var result = {};
    result.headingDivider = false;
    if (normalized === false) return result;
    if (headingDividers.includes(normalized)) return { headingDivider: normalized };
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
    const normalized = (value || "").toLowerCase();
    if (["true", "false"].includes(normalized)) return { paginate: normalized };
    return { paginate: normalized === "hold" ? "hold" : "true" };
  }
});

var directives_default = [...Object.keys(globals), ...Object.keys(locals)];

var import_js_yaml = require("js-yaml");

var createPatterns = (keys) => {
  const set = new Set();
  for (const key of keys) {
    const escaped = "_?" + key.replace(/[.*+?^=!:${}()|[\]\\]/g, "\\$&");
    set.add(escaped);
    set.add('"' + escaped + '"');
    set.add("'" + escaped + "'");
  }
  return [...set.values()];
};

var yamlSpecialChars = "#*";

function parse(yamlText) {
  try {
    const parsed = import_js_yaml.load(yamlText, { schema: import_js_yaml.FAILSAFE_SCHEMA });
    if (parsed === null || typeof parsed === "undefined") return false;
    return parsed;
  } catch {
    return false;
  }
}

function convertLoose(text, keys) {
  const patternStr = "(" + createPatterns(keys).join("|") + ")";
  const looseMatcher = new RegExp("^(" + patternStr + ")(\\s*:.*?)$");
  let converted = "";
  for (const line of text.split(/\r?\n/)) {
    converted += line.replace(looseMatcher, (match, key, value) => {
      const trimmed = value.trim();
      if (trimmed.length < 2 || yamlSpecialChars.includes(trimmed[0])) return match;
      const colonIndex = value.indexOf(value.trim());
      const rest = value.slice(colonIndex, value.trim().length);
      return "" + key + rest + '"' + trimmed.split('"').join('\\"') + '"';
    }) + "\n";
  }
  return converted.trim();
}

var yaml = (text, loose = false) => parse(loose ? convertLoose(text, [...directives_default, ...Array.isArray(loose) ? loose : []]) : text);
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

function markAsParsed(state, type) {
  state.tokens = state.tokens || {};
  state.tokens._marpitComment = type;
}

function _comment(marpit) {
  const parseComment = (state, content) => {
    const parsed = yaml(content, !!marpit.options.looseYAML);
    state.tokens = state.tokens || {};
    state.tokens._marpitComment = parsed === false ? {} : parsed;
    for (const matcher of magicCommentMatchers) {
      if (matcher.test(content.trim())) {
        markAsParsed(state, "magic-comment");
        break;
      }
    }
  };

  marpit.core.ruler.before("inline", "marpit_comment", (state, silent) => {
    const { posMax, src } = state;
    if (src.charCodeAt(state.pos) !== 60 || src.charCodeAt(state.pos + 1) !== 33) return false;
    let pos = state.pos;
    let end = state.posMax;
    let match = src.slice(pos, end);
    if (!commentMatcherOpening.test(match)) return false;
    if (silent) return true;
    pos += 4;
    if (!commentMatcherClosing.test(match)) {
      while (pos < end) {
        if (src.charCodeAt(pos) === src.charCodeAt(pos + 1)) break;
        pos += 1;
        match = src.slice(pos, end);
        if (commentMatcherClosing.test(match)) break;
      }
    }
    state.pos = pos;
    const token = state.push("marpit_comment", "", 0);
    token.map = [state.pos, pos];
    token.content = src.slice(state.pos, pos, state.src.length, true);
    token.hidden = true;
    const matched = commentMatcher.exec(token.content);
    token.content = matched ? matched[1].trim() : "";
    parseComment(token, token.content);
    return true;
  });

  marpit.core.ruler.after("marpit_comment", "marpit_comment_parse", (state, silent) => {
    const { posMax, src } = state;
    if (src.charCodeAt(state.pos) !== 60 || src.charCodeAt(state.pos + 1) !== 33) return false;
    const match = src.slice(state.pos).match(commentMatcher);
    if (!match) return false;
    if (!silent) {
      const token = state.push("marpit_comment", "", 0);
      token.hidden = true;
      token.content = src.slice(state.pos, match[0].length);
      token.content = match[1].trim();
      parseComment(token, token.content);
    }
    state.pos += match[0].length;
    return true;
  });
}

var comment = (0, import_plugin.default)(_comment);
var comment_default = comment;

var _0x8eb834 = {};
_0x8eb834.comment = comment;
_0x8eb834.markAsParsed = markAsParsed;
if (0) module.exports = _0x8eb834;
