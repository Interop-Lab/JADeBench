var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// ../work/marp-team__marpit/src/plugin.js
var require_plugin = __commonJS({
  "../work/marp-team__marpit/src/plugin.js"(exports2, module2) {
    function marpitPlugin2(plugin) {
      return function(md, ...args) {
        if (md.marpit) return plugin.call(this, md, ...args);
        throw new Error(
          "Marpit plugin has detected incompatible markdown-it instance."
        );
      };
    }
    Object.defineProperty(marpitPlugin2, "__esModule", { value: true });
    Object.defineProperty(marpitPlugin2, "default", { value: marpitPlugin2 });
    Object.defineProperty(marpitPlugin2, "marpitPlugin", { value: marpitPlugin2 });
    module2.exports = marpitPlugin2;
  }
});

// ../work/marp-team__marpit/src/markdown/comment.js
var comment_exports = {};
__export(comment_exports, {
  comment: () => comment,
  default: () => comment_default,
  markAsParsed: () => markAsParsed
});
module.exports = __toCommonJS(comment_exports);

// ../work/marp-team__marpit/src/markdown/directives/directives.js
var globals = Object.assign(/* @__PURE__ */ Object.create(null), {
  headingDivider: (value) => {
    const headings = [1, 2, 3, 4, 5, 6];
    const toInt = (v) => Array.isArray(v) || Number.isNaN(v) ? v : Number.parseInt(v, 10);
    const converted = toInt(value);
    if (Array.isArray(converted)) {
      const convertedArr = converted.map(toInt);
      return {
        headingDivider: headings.filter((v) => convertedArr.includes(v))
      };
    }
    if (value === "false") return { headingDivider: false };
    if (headings.includes(converted)) return { headingDivider: converted };
    return {};
  },
  style: (v) => ({ style: v }),
  theme: (v, marpit) => marpit.themeSet.has(v) ? { theme: v } : {},
  lang: (v) => ({ lang: v })
});
var locals = Object.assign(/* @__PURE__ */ Object.create(null), {
  backgroundColor: (v) => ({ backgroundColor: v }),
  backgroundImage: (v) => ({ backgroundImage: v }),
  backgroundPosition: (v) => ({ backgroundPosition: v }),
  backgroundRepeat: (v) => ({ backgroundRepeat: v }),
  backgroundSize: (v) => ({ backgroundSize: v }),
  class: (v) => ({ class: Array.isArray(v) ? v.join(" ") : v }),
  color: (v) => ({ color: v }),
  footer: (v) => typeof v === "string" ? { footer: v } : {},
  header: (v) => typeof v === "string" ? { header: v } : {},
  paginate: (v) => {
    const normalized = (v || "").toLowerCase();
    if (["hold", "skip"].includes(normalized)) return { paginate: normalized };
    return { paginate: normalized === "true" };
  }
});
var directives_default = [...Object.keys(globals), ...Object.keys(locals)];

// ../work/marp-team__marpit/src/markdown/directives/yaml.js
var import_js_yaml = require("js-yaml");
var createPatterns = (keys) => {
  const set = /* @__PURE__ */ new Set();
  for (const k of keys) {
    const normalized = "_?" + k.replace(/[.*+?^=!:${}()|[\]\\/]/g, "\\$&");
    set.add(normalized);
    set.add(`"${normalized}"`);
    set.add(`'${normalized}'`);
  }
  return [...set.values()];
};
var yamlSpecialChars = `["'{|>~&*`;
function parse(text) {
  try {
    const obj = (0, import_js_yaml.load)(text, { schema: import_js_yaml.FAILSAFE_SCHEMA });
    if (obj === null || typeof obj !== "object") return false;
    return obj;
  } catch {
    return false;
  }
}
function convertLoose(text, looseDirectives) {
  const keyPattern = `(?:${createPatterns(looseDirectives).join("|")})`;
  const looseMatcher = new RegExp(`^(${keyPattern}\\s*:)(.+)$`);
  let normalized = "";
  for (const line of text.split(/\r?\n/))
    normalized += `${line.replace(looseMatcher, (original, prop, value) => {
      const trimmed = value.trim();
      if (trimmed.length === 0 || yamlSpecialChars.includes(trimmed[0]))
        return original;
      const spaceLength = value.length - value.trimLeft().length;
      const spaces = value.substring(0, spaceLength);
      return `${prop}${spaces}"${trimmed.split('"').join('\\"')}"`;
    })}
`;
  return normalized.trim();
}
var yaml = (text, looseDirectives = false) => parse(
  looseDirectives ? convertLoose(text, [
    ...directives_default,
    ...Array.isArray(looseDirectives) ? looseDirectives : []
  ]) : text
);
var yaml_default = yaml;

// ../work/marp-team__marpit/src/markdown/comment.js
var import_plugin = __toESM(require_plugin());
var commentMatcher = /<!--+\s*([\s\S]*?)\s*--+>/;
var commentMatcherOpening = /^<!--/;
var commentMatcherClosing = /-->/;
var magicCommentMatchers = [
  // Prettier
  /^prettier-ignore(-(start|end))?$/,
  // markdownlint
  /^markdownlint-((disable|enable).*|capture|restore)$/,
  // remark-lint (remark-message-control)
  /^lint (disable|enable|ignore).*$/
];
function markAsParsed(token, kind) {
  token.meta = token.meta || {};
  token.meta.marpitCommentParsed = kind;
}
function _comment(md) {
  const parse2 = (token, content) => {
    const parsed = yaml(content, !!md.marpit.options.looseYAML);
    token.meta = token.meta || {};
    token.meta.marpitParsedDirectives = parsed === false ? {} : parsed;
    for (const magicCommentMatcher of magicCommentMatchers) {
      if (magicCommentMatcher.test(content.trim())) {
        markAsParsed(token, "well-known-magic-comment");
        break;
      }
    }
  };
  md.block.ruler.before(
    "html_block",
    "marpit_comment",
    (state, startLine, endLine, silent) => {
      let pos = state.bMarks[startLine] + state.tShift[startLine];
      if (state.src.charCodeAt(pos) !== 60) return false;
      let max = state.eMarks[startLine];
      let line = state.src.slice(pos, max);
      if (!commentMatcherOpening.test(line)) return false;
      if (silent) return true;
      let nextLine = startLine + 1;
      if (!commentMatcherClosing.test(line)) {
        while (nextLine < endLine) {
          if (state.sCount[nextLine] < state.blkIndent) break;
          pos = state.bMarks[nextLine] + state.tShift[nextLine];
          max = state.eMarks[nextLine];
          line = state.src.slice(pos, max);
          nextLine += 1;
          if (commentMatcherClosing.test(line)) break;
        }
      }
      state.line = nextLine;
      const token = state.push("marpit_comment", "", 0);
      token.map = [startLine, nextLine];
      token.markup = state.getLines(startLine, nextLine, state.blkIndent, true);
      token.hidden = true;
      const matchedContent = commentMatcher.exec(token.markup);
      token.content = matchedContent ? matchedContent[1].trim() : "";
      parse2(token, token.content);
      return true;
    }
  );
  md.inline.ruler.before(
    "html_inline",
    "marpit_inline_comment",
    (state, silent) => {
      const { posMax, src } = state;
      if (state.pos + 2 >= posMax || src.charCodeAt(state.pos) !== 60 || src.charCodeAt(state.pos + 1) !== 33)
        return false;
      const match = src.slice(state.pos).match(commentMatcher);
      if (!match) return false;
      if (!silent) {
        const token = state.push("marpit_comment", "", 0);
        token.hidden = true;
        token.markup = src.slice(state.pos, state.pos + match[0].length);
        token.content = match[1].trim();
        parse2(token, token.content);
      }
      state.pos += match[0].length;
      return true;
    }
  );
}
var comment = (0, import_plugin.default)(_comment);
var comment_default = comment;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  comment,
  markAsParsed
});
