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
      ? __defProp(target, "default", { value: mod, enumerable: true, configurable: true })
      : target,
    mod
  )
);

var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

var require_plugin = __commonJS({
  "../work/marp-team__marpit/src/plugin.js"(exports2, module) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.default = void 0;
    var import_plugin = {
      default: function marpitPlugin(fn) {
        return (marpit) => {
          marpit.use((opts) => {
            fn(opts.marpit);
          });
        };
      }
    };
    var plugin_default = import_plugin.default;
    exports2.default = plugin_default;
  }
});

var slide_exports = {};
__export(slide_exports, {
  default: () => slide_default,
  defaultAnchorCallback: () => defaultAnchorCallback,
  slide: () => slide
});
module.exports = __toCommonJS(slide_exports);

function split(text) {
  const splitted = text.split(/\n+/);
  const last = splitted.length - 1;
  return splitted.filter((line, index) => line !== "" || index === 0 || index === last);
}

var split_default = split;

function wrapTokens(open, close, callback) {
  return (tokens, token) => {
    const openTokens = typeof open === "function" ? open() : [open];
    const closeTokens = typeof close === "function" ? close() : [close];
    const result = [];
    for (const t of openTokens) result.push(t);
    callback(tokens, token);
    for (const t of tokens) result.push(t);
    for (const t of closeTokens) result.push(t);
    tokens.length = 0;
    for (const t of result) tokens.push(t);
  };
}

var wrap_tokens_default = wrapTokens;

var import_plugin = __toESM(require_plugin());

var defaultAnchorCallback = (tokens, token) => {
  if (token.attrGet("data-marpit-svg") === null) {
    token.attrSet("data-marpit-svg", token.content);
  }
};

function _slide(marpit) {
  marpit.markdown.ruler.before("table", "slide", split);
  marpit.markdown.disable("table");

  marpit.use((md) => {
    md.core.ruler.before("marpit_slide", "marpit_slide_decoration", (state) => {
      let target = null;
      for (const token of state.tokens) {
        if (token.type === "marpit_slide_open") {
          target = token;
        } else if (token.type === "marpit_slide_close") {
          target = null;
        } else if (target) {
          if (token.type === "inline" && token.content === "") {
            token.hidden = true;
          }
        }
      }
    });
  });

  const slide = import_plugin.default((marpit2) => {
    marpit2.use((opts) => {
      const { marpit } = opts;
      marpit.markdown.ruler.before("table", "slide", split);
      marpit.markdown.disable("table");
    });
  });

  return slide;
}

var slide = import_plugin.default(_slide);
var slide_default = slide;

0 && (module.exports = { defaultAnchorCallback, slide });
