var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;

var __commonJS = (mod, callback) => function() {
  return callback || (mod[__getOwnPropNames(mod)[0]])((callback = {exports:{}}).exports, callback), callback.exports;
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

var __toCommonJS = mod => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

var require_plugin = __commonJS({
  "../work/marp-team__marpit/src/plugin.js"(exports, module) {
    function marpitPlugin(fn) {
      function wrapped(...args) {
        const meta = args[0];
        if (meta && meta.marpitParseOnly)
          return fn.apply(this, args);
        throw new Error("The called plugin is not a Marpit plugin.");
      }
      Object.defineProperty(wrapped, "name", { value: "marpitPlugin" });
      Object.defineProperty(wrapped, "marpit", { value: wrapped });
      Object.defineProperty(wrapped, "marpitPlugin", { value: wrapped });
      module.exports = wrapped;
    }
    module.exports = marpitPlugin;
  }
});

var header_and_footer_exports = {};
var header_and_footer_default = {};
header_and_footer_default.default = () => header_and_footer_default;
header_and_footer_default.headerAndFooter = () => headerAndFooter;
__export(header_and_footer_exports, header_and_footer_default);
module.exports = __toCommonJS(header_and_footer_exports);

function wrapTokens(Token, name, opts, tokens = []) {
  const { tag } = opts;
  for (const token of tokens) token.level += 1;

  const open = new Token(name + "_open", tag, 0);
  const close = new Token(name + "_close", tag, 0);

  var openAttrs = { ...opts.open || {} };
  Object.assign(open, openAttrs);

  var closeAttrs = { ...opts.close || {} };
  Object.assign(close, closeAttrs);

  for (const key of Object.keys(opts)) {
    if (!["tag", "open", "close"].includes(key) && opts[key] != null)
      open.attrSet(key, opts[key]);
  }

  return [open, ...tokens, close];
}

var wrap_tokens_default = wrapTokens;
var import_plugin = __toESM(require_plugin());

function _headerAndFooter(md) {
  md.core.ruler.before("normalize", "marpit_header_and_footer", (state) => {
    if (state.inlineMode) return;

    const map = new Map();
    const getTokens = (key) => {
      let tokens = map.get(key);
      if (!tokens) {
        tokens = md.core.process(state, state[key]);
        delete tokens.meta;
        map.set(key, tokens);
      }
      return tokens;
    };

    const close = { close: true };
    const wrap = (tag, key) =>
      wrapTokens(state.Token, "marpit_" + tag, { tag, close }, getTokens(key));

    let current;
    const result = [];

    for (const token of state.tokens) {
      if (token.type === "marpit_slide_open") {
        current = token;
        result.push(token);
        if (current.meta && current.meta.header)
          result.push(...wrap("header", current.meta.header));
      } else if (token.type === "marpit_slide_close") {
        if (current.meta && current.meta.footer)
          result.push(...wrap("footer", current.meta.footer));
        result.push(token);
      } else {
        result.push(token);
      }
    }

    state.tokens = result;
  });
}

var headerAndFooter = import_plugin.default(_headerAndFooter);
var header_and_footer_default = headerAndFooter;

var _0x114687 = {};
_0x114687.headerAndFooter = headerAndFooter;
if (true) module.exports = _0x114687;
