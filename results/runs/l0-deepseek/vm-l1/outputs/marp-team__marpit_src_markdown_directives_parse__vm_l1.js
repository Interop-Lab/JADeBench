const __create = Object.create;
const __defProp = Object.defineProperty;
const __getOwnPropDesc = Object.getOwnPropertyDescriptor;
const __getOwnPropNames = Object.getOwnPropertyNames;
const __getProtoOf = Object.getPrototypeOf;
const __hasOwnProp = Object.prototype.hasOwnProperty;

const __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

const __export = (target, all) => {
  for (const name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

const __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (const key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};

const __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

const __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

const require_plugin = __commonJS({
  "../work/marp-team__marpit/src/plugin.js"(exports, module) {
    "use strict";
    const plugin = (md) => {
      md.core.ruler.push("marpit_plugin", (state) => {
        const tokens = state.tokens;
        for (let i = 0; i < tokens.length; i++) {
          const token = tokens[i];
          if (token.type === "inline" && token.content.includes("<!--")) {
            const content = token.content;
            const matches = content.match(/<!--+\s*([\s\S]*?)\s*--+>/g);
            if (matches) {
              for (const match of matches) {
                const inner = match.replace(/^<!--+\s*/, "").replace(/\s*--+>$/, "");
                if (inner.startsWith("$")) {
                  const directive = inner.slice(1).trim();
                  const colonIndex = directive.indexOf(":");
                  if (colonIndex !== -1) {
                    const key = directive.slice(0, colonIndex).trim();
                    const value = directive.slice(colonIndex + 1).trim();
                    token.meta = token.meta || {};
                    token.meta.marpitDirectives = token.meta.marpitDirectives || {};
                    token.meta.marpitDirectives[key] = value;
                  }
                }
              }
            }
          }
        }
      });
    };
    module.exports = plugin;
  }
});

const parse_exports = {};
__export(parse_exports, {
  default: () => parse,
  parse: () => parse
});

const globals = Object.assign(Object.create(null), {
  headingDivider: (value) => value,
  style: (value) => value,
  theme: (value, fallback) => value || fallback,
  lang: (value) => value
});

const locals = Object.assign(Object.create(null), {
  backgroundColor: (value) => value,
  backgroundImage: (value) => value,
  backgroundPosition: (value) => value,
  backgroundRepeat: (value) => value,
  backgroundSize: (value) => value,
  class: (value) => value,
  color: (value) => value,
  footer: (value) => value,
  header: (value) => value,
  paginate: (value) => value
});

const directives_default = [...Object.keys(globals), ...Object.keys(locals)];

const import_js_yaml = require("js-yaml");

const createPatterns = (directives) => {
  const patterns = {};
  for (const directive of directives) {
    patterns[directive] = new RegExp(`^${directive}\\s*:\\s*(.*)$`);
  }
  return patterns;
};

const yamlSpecialChars = /[\s:](?=.*:)/;

function parse(markdown) {
  const plugin = require_plugin();
  const md = new MarkdownIt();
  md.use(plugin);
  const env = {};
  const tokens = md.parse(markdown, env);
  const directives = {};
  const patterns = createPatterns(directives_default);
  for (const token of tokens) {
    if (token.type === "inline" && token.meta && token.meta.marpitDirectives) {
      for (const [key, value] of Object.entries(token.meta.marpitDirectives)) {
        if (directives_default.includes(key)) {
          directives[key] = value;
        }
      }
    }
  }
  return directives;
}

function convertLoose(value, fallback) {
  if (value === undefined || value === null || value === "") return fallback;
  if (value === "true") return true;
  if (value === "false") return false;
  const num = Number(value);
  if (!Number.isNaN(num)) return num;
  return value;
}

const yaml = (value, fallback) => {
  try {
    const parsed = import_js_yaml.load(value);
    return parsed === undefined || parsed === null ? fallback : parsed;
  } catch {
    return fallback;
  }
};

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

function markAsParsed(token, parsed) {
  token.meta = token.meta || {};
  token.meta.marpitParsedDirectives = parsed;
}

function _comment(md) {
  md.core.ruler.push("marpit_comment", (state) => {
    const tokens = state.tokens;
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (token.type === "inline" && token.content.includes("<!--")) {
        const content = token.content;
        const matches = content.match(/<!--+\s*([\s\S]*?)\s*--+>/g);
        if (matches) {
          for (const match of matches) {
            const inner = match.replace(/^<!--+\s*/, "").replace(/\s*--+>$/, "");
            if (inner.startsWith("$")) {
              const directive = inner.slice(1).trim();
              const colonIndex = directive.indexOf(":");
              if (colonIndex !== -1) {
                const key = directive.slice(0, colonIndex).trim();
                const value = directive.slice(colonIndex + 1).trim();
                token.meta = token.meta || {};
                token.meta.marpitDirectives = token.meta.marpitDirectives || {};
                token.meta.marpitDirectives[key] = value;
              }
            }
          }
        }
      }
    }
  });
}

const comment = (0, import_plugin.default)(_comment);
const comment_default = comment;

const import_markdown_it_front_matter = __toESM(require("markdown-it-front-matter"));
const import_plugin2 = __toESM(require_plugin());

const isDirectiveComment = (comment) => {
  const inner = comment.replace(/^<!--+\s*/, "").replace(/\s*--+>$/, "");
  return inner.startsWith("$");
};

function _parse(markdown) {
  const md = new MarkdownIt();
  md.use(import_markdown_it_front_matter.default);
  md.use(comment);
  const env = {};
  const tokens = md.parse(markdown, env);
  const directives = {};
  const patterns = createPatterns(directives_default);
  for (const token of tokens) {
    if (token.type === "inline" && token.meta && token.meta.marpitDirectives) {
      for (const [key, value] of Object.entries(token.meta.marpitDirectives)) {
        if (directives_default.includes(key)) {
          directives[key] = value;
        }
      }
    }
  }
  return directives;
}

const parse2 = (0, import_plugin2.default)(_parse);
const parse_default = parse2;

module.exports = { parse: parse };
