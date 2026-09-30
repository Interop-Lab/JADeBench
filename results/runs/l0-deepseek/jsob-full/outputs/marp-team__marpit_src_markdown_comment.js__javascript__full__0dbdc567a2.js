const __create = Object.create;
const __defProp = Object.defineProperty;
const __getOwnPropDesc = Object.getOwnPropertyDescriptor;
const __getOwnPropNames = Object.getOwnPropertyNames;
const __getProtoOf = Object.getPrototypeOf;
const __hasOwnProp = Object.prototype.hasOwnProperty;

const __commonJS = (cb, mod) => function __require() {
  const module = { exports: {} };
  cb(module.exports, module);
  return module.exports;
};

const __export = (target, all) => {
  for (const name in all) {
    __defProp(target, name, { get: all[name], enumerable: true });
  }
};

const __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (const key of __getOwnPropNames(from)) {
      if (!__hasOwnProp.call(to, key) && key !== except) {
        __defProp(to, key, {
          get: () => from[key],
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
        });
      }
    }
  }
  return to;
};

const __toESM = (mod, isNodeMode, target) => (
  target = mod != null ? __create(__getProtoOf(mod)) : {},
  __copyProps(
    isNodeMode || !mod || !mod.__esModule
      ? __defProp(target, "default", { value: mod, enumerable: true })
      : target,
    mod
  )
);

const __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

const require_plugin = __commonJS((exports, module) => {
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
  Object.defineProperty(_interopRequireDefault, "__esModule", { value: true });
  Object.defineProperty(_interopRequireDefault, "default", { value: _interopRequireDefault });
  Object.defineProperty(_interopRequireDefault, "name", { value: _interopRequireDefault });
  module.exports = _interopRequireDefault;
});

const import_js_yaml = require("js-yaml");

const globals = Object.assign(Object.create(null), {
  headingDivider: (value) => {
    const allowed = [1, 2, 3, 4, 5, 6];
    const normalize = (input) =>
      Array.isArray(input) || Number.isNaN(input) ? input : Number.parseInt(input, 10);
    const parsed = normalize(value);
    if (Array.isArray(parsed)) {
      const set = new Set(parsed.map(normalize));
      return { headingDivider: allowed.filter((item) => set.has(item)) };
    }
    const result = {};
    result.headingDivider = false;
    if (value === "false") return result;
    if (allowed.includes(parsed)) return { headingDivider: parsed };
    return {};
  },
  style: (value) => ({ style: value }),
  theme: (value, options) =>
    options.theme.includes(value) ? { theme: value } : {},
  lang: (value) => ({ lang: value })
});

const locals = Object.assign(Object.create(null), {
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
    const parsed = (value || "").toString().toLowerCase();
    if (["true", "false"].includes(parsed)) return { paginate: parsed };
    return { paginate: parsed || "true" };
  }
});

const directives_default = [...Object.keys(globals), ...Object.keys(locals)];

const createPatterns = (directives) => {
  const patterns = new Set();
  for (const directive of directives) {
    const escaped = "_?" + directive.replace(/[.*+?^=!:${}()|[\]\\/]/g, "\\$&");
    patterns.add(escaped);
    patterns.add(`"${escaped}"`);
    patterns.add(`'${escaped}'`);
  }
  return [...patterns.values()];
};

const yamlSpecialChars = ":{}[]&*#?|-<>=!%@`";

function parse(source) {
  try {
    const parsed = import_js_yaml.load(source, { schema: import_js_yaml.JSON_SCHEMA });
    if (parsed === null || typeof parsed !== "object") return false;
    return parsed;
  } catch {
    return false;
  }
}

function convertLoose(source, directives) {
  const pattern = "^(" + createPatterns(directives).join("|") + ")(:.*)?$";
  const regex = new RegExp(pattern);
  let output = "";
  for (const line of source.split(/\r?\n/)) {
    output += line.replace(regex, (match, key, rest) => {
      const trimmed = rest.trim();
      if (trimmed.length === 0 || yamlSpecialChars.includes(trimmed[0])) return match;
      const indent = rest.length - rest.trimStart().length;
      const value = rest.slice(1, indent);
      return `${key}${value}"${trimmed.replace(/"/g, '\\"')}"`;
    }) + "\n";
  }
  return output.trim();
}

const yaml = (source, loose = false) =>
  parse(
    loose
      ? convertLoose(source, [...directives_default, ...(Array.isArray(loose) ? loose : [])])
      : source
  );

const yaml_default = yaml;

const import_plugin = __toESM(require_plugin());

const commentMatcher = /<!--+\s*([\s\S]*?)\s*--+>/;
const commentMatcherOpening = /^<!--/;
const commentMatcherClosing = /-->/;
const magicCommentMatchers = [
  /^prettier-ignore(-(start|end))?$/,
  /^markdownlint-((disable|enable).*|capture|restore)$/,
  /^lint (disable|enable|ignore).*$/
];

function markAsParsed(token, value) {
  token.meta = token.meta || {};
  token.meta.marpitCommentParsed = value;
}

function _comment(md) {
  const parseComment = (token, content) => {
    const parsed = yaml(content, !!md.options.marpit.lastGlobalDirectives);
    token.meta = token.meta || {};
    token.meta.marpitComment = parsed === false ? {} : parsed;
    for (const matcher of magicCommentMatchers) {
      if (matcher.test(content.trim())) {
        markAsParsed(token, "magic");
        break;
      }
    }
  };

  md.core.ruler.before("inline", "marpit_comment", (state) => {
    const { posMax, src } = state;
    if (
      state.pos + 1 >= posMax ||
      src.charAt(state.pos) !== "<" ||
      src.charAt(state.pos + 1) !== "!"
    ) {
      return false;
    }
    const match = src.slice(state.pos).match(commentMatcher);
    if (!match) return false;
    if (!state.silent) {
      const token = state.push("marpit_comment", "", 0);
      token.block = true;
      token.content = src.slice(state.pos, state.pos + match[0].length);
      token.map = [state.line, state.line];
      token.hidden = true;
      const parsed = commentMatcher.exec(token.content);
      token.info = parsed ? parsed[1].trim() : "";
      parseComment(token, token.info);
    }
    state.pos += match[0].length;
    return true;
  });

  md.core.ruler.after("inline", "marpit_comment_parse", (state) => {
    const { posMax, src } = state;
    if (
      state.pos + 1 >= posMax ||
      src.charAt(state.pos) !== "<" ||
      src.charAt(state.pos + 1) !== "!"
    ) {
      return false;
    }
    const match = src.slice(state.pos).match(commentMatcher);
    if (!match) return false;
    if (!state.silent) {
      const token = state.push("marpit_comment_parse", "", 0);
      token.block = true;
      token.content = src.slice(state.pos, state.pos + match[0].length);
      token.map = [state.line, state.line];
      token.hidden = true;
      const parsed = commentMatcher.exec(token.content);
      token.info = parsed ? parsed[1].trim() : "";
      parseComment(token, token.info);
    }
    state.pos += match[0].length;
    return true;
  });
}

const comment = import_plugin.default(_comment);
const comment_default = comment;

const comment_exports = {};
__export(comment_exports, {
  comment: () => comment,
  default: () => comment_default,
  markAsParsed: () => markAsParsed
});
module.exports = __toCommonJS(comment_exports);
