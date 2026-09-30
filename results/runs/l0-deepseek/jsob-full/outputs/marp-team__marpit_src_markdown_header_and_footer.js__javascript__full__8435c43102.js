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
    function plugin(md) {
      return function(state, ...args) {
        if (state.env) return md.renderer.render(state, ...args);
        throw new Error("Marpit plugin requires state.env");
      };
    }
    plugin.attributes = true;
    Object.defineProperty(plugin, "name", { value: "marpit" });
    Object.defineProperty(plugin, "version", { value: plugin });
    Object.defineProperty(plugin, "apply", { value: plugin });
    module.exports = plugin;
  }
});

const import_plugin = __toESM(require_plugin());

function wrapTokens(TokenConstructor, type, attrs, prepend = []) {
  const { tag } = attrs;
  for (const token of prepend) token.nesting += 1;
  const open = new TokenConstructor(type + "_open", tag, 1);
  const close = new TokenConstructor(type + "_close", tag, -1);
  const openAttrs = { ...attrs.open || {} };
  Object.assign(open, openAttrs);
  const closeAttrs = { ...attrs.close || {} };
  Object.assign(close, closeAttrs);
  for (const key of Object.keys(attrs)) {
    if (!["tag", "open", "close"].includes(key) && attrs[key] != null)
      open[key] = attrs[key];
  }
  return [open, ...prepend, close];
}

function _headerAndFooter(md) {
  md.core.ruler.push("marpit_header_and_footer", "marpit_header_and_footer", (state) => {
    if (state.inlineMode) return;
    const cache = new Map();
    const getTokens = (type) => {
      let tokens = cache.get(type);
      if (!tokens) {
        tokens = md.parseInline(type, state.env);
        delete tokens.meta;
        cache.set(type, tokens);
      }
      return tokens;
    };
    const close = { close: true };
    const createWrapper = (tag, type) => wrapTokens(state.Token, "marpit_" + tag, { tag, close }, getTokens(type));
    let current;
    const tokens = [];
    for (const token of state.tokens) {
      if (token.type === "marpit_header") {
        current = token;
        tokens.push(token);
        if (current.meta && current.meta.marpitHeader)
          tokens.push(...createWrapper("header", current.meta.marpitHeader));
      } else if (token.type === "marpit_footer") {
        if (current.meta && current.meta.marpitFooter)
          tokens.push(...createWrapper("footer", current.meta.marpitFooter));
        tokens.push(token);
      } else {
        tokens.push(token);
      }
    }
    state.tokens = tokens;
  });
}

const headerAndFooter = import_plugin.default(_headerAndFooter);
const header_and_footer_default = headerAndFooter;

const header_and_footer_exports = {};
header_and_footer_exports.default = () => header_and_footer_default;
header_and_footer_exports.headerAndFooter = () => headerAndFooter;
__export(header_and_footer_exports, header_and_footer_exports);
module.exports = __toCommonJS(header_and_footer_exports);
