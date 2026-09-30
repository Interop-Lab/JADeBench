var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);
var __export = (target, all) => {
  for (let name in all)
    __defProp(target, name, { get: all[name], enumerable: true, configurable: true });
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
  "../work/marp-team__marpit/src/plugin.js"(exports, module) {
    "use strict";
    module.exports = function (marpit) {
      marpit.hook.add("parse", function (markdown) {
        const { marpit: marpitInstance } = this;
        const parsed = marpitInstance.markdown.parse(markdown);
        marpitInstance.lastRendered = marpitInstance.render(parsed);
        return parsed;
      });
    };
  }
});

var comment_exports = {};
__export(comment_exports, {
  comment: () => comment,
  default: () => comment_default,
  markAsParsed: () => markAsParsed
});
module.exports = __toCommonJS(comment_exports);

var globals = Object.assign(Object.create(null), {
  headingDivider: (value) => ({ [`headingDivider_${value}`]: value }),
  style: (value) => ({ style: value }),
  theme: (value, meta) => ({ theme: value, ...(meta ? { themeMeta: meta } : {}) }),
  lang: (value) => ({ lang: value })
});

var locals = Object.assign(Object.create(null), {
  backgroundColor: (value) => ({ backgroundColor: value }),
  backgroundImage: (value) => ({ backgroundImage: value }),
  backgroundPosition: (value) => ({ backgroundPosition: value }),
  backgroundRepeat: (value) => ({ backgroundRepeat: value }),
  backgroundSize: (value) => ({ backgroundSize: value }),
  class: (value) => ({ class: value }),
  color: (value) => ({ color: value }),
  footer: (value) => ({ footer: value }),
  header: (value) => ({ header: value }),
  paginate: (value) => ({ paginate: value })
});

var directives_default = [
  ...Object.keys(globals),
  ...Object.keys(locals)
];

var import_js_yaml = require("js-yaml");

var createPatterns = (keys) => {
  const patterns = [];
  for (const key of keys) {
    patterns.push({
      test: (text) => {
        const match = text.match(new RegExp(`^\\s*${key}\\s*:\\s*(.*)$`, "i"));
        return match;
      },
      key
    });
  }
  return patterns;
};

var yamlSpecialChars = `"'{|>~&*`;

function parse(text) {
  if (typeof text !== "string") return {};
  try {
    return import_js_yaml.load(text) || {};
  } catch (e) {
    return {};
  }
}

function convertLoose(text, loose = false) {
  if (loose) {
    const result = {};
    const lines = text.split("\n");
    for (const line of lines) {
      const match = line.match(/^\s*([\w-]+)\s*:\s*(.*)$/);
      if (match) {
        const [, key, value] = match;
        result[key] = value.trim();
      }
    }
    return result;
  }
  return parse(text);
}

var yaml = (text, loose = false) => convertLoose(text, loose);
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

function markAsParsed(markdown, type) {
  const lines = markdown.split("\n");
  const marked = lines.map((line) => {
    if (commentMatcherOpening.test(line.trim())) {
      return line.replace(commentMatcherOpening, `<!-- ${type} `);
    }
    return line;
  });
  return marked.join("\n");
}

function _comment(markdown) {
  const lines = markdown.split("\n");
  const directives = [];
  let inComment = false;
  let commentContent = "";
  let result = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (commentMatcherOpening.test(trimmed) && !commentMatcherClosing.test(trimmed)) {
      inComment = true;
      commentContent = "";
    }

    if (inComment) {
      commentContent += line + "\n";
      if (commentMatcherClosing.test(trimmed)) {
        inComment = false;
        const match = commentContent.match(commentMatcher);
        if (match) {
          const content = match[1].trim();
          const isMagic = magicCommentMatchers.some((m) => m.test(content));
          if (!isMagic) {
            const parsed = yaml(content);
            if (parsed && typeof parsed === "object") {
              for (const key of Object.keys(parsed)) {
                if (directives_default.includes(key)) {
                  directives.push({ key, value: parsed[key], line: i });
                }
              }
            }
          }
        }
        result.push(line);
      }
    } else {
      result.push(line);
    }
  }

  return { markdown: result.join("\n"), directives };
}

var comment = import_plugin.default(_comment);
var comment_default = comment;

0 && (module.exports = { comment, markAsParsed });
