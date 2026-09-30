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
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

var require_plugin = __commonJS({
  "../work/marp-team__marpit/src/plugin.js"(exports2, module2) {
    module2.exports = function plugin(md, ...args) {
      const apply = (callback) => {
        if (md.marpit) {
          callback(md.marpit);
          return;
        }
        md.core.ruler.push("marpit_plugin", (state) => {
          if (md.marpit) callback(md.marpit);
          return state;
        });
      };
      apply((marpit) => {
        marpit.customDirectives.local.directives.forEach((directive) => {
          if (directive in marpit.customDirectives.local) {
            delete marpit.customDirectives.local[directive];
          }
        });
      });
      return md;
    };
  }
});

var header_and_footer_exports = {};
__export(header_and_footer_exports, {
  default: () => header_and_footer_default,
  headerAndFooter: () => headerAndFooter
});
module.exports = __toCommonJS(header_and_footer_exports);

function wrapTokens(state, type, children) {
  const token = new state.Token(type, "", 0);
  token.content = "";
  token.children = children;
  return token;
}
var wrap_tokens_default = wrapTokens;

var import_plugin = __toESM(require_plugin());

function _headerAndFooter(md) {
  const marpit = md.marpit;
  if (!marpit) return;
  
  const { header, footer } = marpit.customDirectives.local;
  
  md.core.ruler.push("marpit_header_and_footer", (state) => {
    const { tokens } = state;
    let currentSlide = null;
    let currentSlideTokens = [];
    
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      
      if (token.type === "marpit_slide_open") {
        currentSlide = token;
        currentSlideTokens = [];
      } else if (token.type === "marpit_slide_close") {
        if (currentSlide && (header || footer)) {
          const headerTokens = header ? [wrapTokens(state, "marpit_header", [new state.Token("inline", "", 0, { content: header })])] : [];
          const footerTokens = footer ? [wrapTokens(state, "marpit_footer", [new state.Token("inline", "", 0, { content: footer })])] : [];
          
          const idx = tokens.indexOf(token);
          tokens.splice(idx, 0, ...footerTokens);
          tokens.splice(tokens.indexOf(currentSlide) + 1, 0, ...headerTokens);
        }
        currentSlide = null;
      }
    }
    
    return state;
  });
  
  return md;
}

var headerAndFooter = (0, import_plugin.default)(_headerAndFooter);
var header_and_footer_default = headerAndFooter;

0 && (module.exports = {
  headerAndFooter
});
