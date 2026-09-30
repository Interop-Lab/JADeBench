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

// ../work/marp-team__marpit/src/markdown/header_and_footer.js
var header_and_footer_exports = {};
__export(header_and_footer_exports, {
  default: () => header_and_footer_default,
  headerAndFooter: () => headerAndFooter
});
module.exports = __toCommonJS(header_and_footer_exports);

// ../work/marp-team__marpit/src/helpers/wrap_tokens.js
function wrapTokens(Token, type, container, tokens = []) {
  const { tag } = container;
  for (const t of tokens) t.level += 1;
  const open = new Token(`${type}_open`, tag, 1);
  const close = new Token(`${type}_close`, tag, -1);
  Object.assign(open, { ...container.open || {} });
  Object.assign(close, { ...container.close || {} });
  for (const attr of Object.keys(container)) {
    if (!["open", "close", "tag"].includes(attr) && container[attr] != null)
      open.attrSet(attr, container[attr]);
  }
  return [open, ...tokens, close];
}
var wrap_tokens_default = wrapTokens;

// ../work/marp-team__marpit/src/markdown/header_and_footer.js
var import_plugin = __toESM(require_plugin());
function _headerAndFooter(md) {
  md.core.ruler.after(
    "marpit_directives_apply",
    "marpit_header_and_footer",
    (state) => {
      if (state.inlineMode) return;
      const parsedInlines = /* @__PURE__ */ new Map();
      const getParsed = (markdown) => {
        let parsed = parsedInlines.get(markdown);
        if (!parsed) {
          parsed = md.parseInline(markdown, state.env);
          delete parsed.map;
          parsedInlines.set(markdown, parsed);
        }
        return parsed;
      };
      const createMarginalTokens = (tag, markdown) => wrapTokens(
        state.Token,
        `marpit_${tag}`,
        { tag, close: { block: true } },
        getParsed(markdown)
      );
      let current;
      const newTokens = [];
      for (const token of state.tokens) {
        if (token.type === "marpit_slide_open") {
          current = token;
          newTokens.push(token);
          if (current.meta && current.meta.marpitHeader)
            newTokens.push(
              ...createMarginalTokens("header", current.meta.marpitHeader)
            );
        } else if (token.type === "marpit_slide_close") {
          if (current.meta && current.meta.marpitFooter)
            newTokens.push(
              ...createMarginalTokens("footer", current.meta.marpitFooter)
            );
          newTokens.push(token);
        } else {
          newTokens.push(token);
        }
      }
      state.tokens = newTokens;
    }
  );
}
var headerAndFooter = (0, import_plugin.default)(_headerAndFooter);
var header_and_footer_default = headerAndFooter;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  headerAndFooter
});
