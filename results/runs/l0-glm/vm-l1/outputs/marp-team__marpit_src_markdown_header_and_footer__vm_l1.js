var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;

var __commonJS = (cb, module) => () => (module || (module = { exports: {} }), cb(module, module.exports), module.exports);

var __export = (target, all) => {
  for (let name in all)
    __defProp(target, name, { get: all[name], enumerable: true, configurable: true });
};

var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === 'object' || typeof from === 'function') {
    for (let key of __getOwnPropNames(from)) {
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

var __toESM = (mod, isNodeMode, target) => (
  target = mod != null ? __create(__getProtoOf(mod)) : {},
  __copyProps(
    isNodeMode || !mod || !mod.__esModule
      ? __defProp(target, 'default', { value: mod, enumerable: true })
      : target,
    mod
  )
);

var __toCommonJS = mod => __copyProps(__defProp({}, '__esModule', { value: true }), mod);

var require_plugin = __commonJS({
  '../work/marp-team__marpit/src/plugin.js'(exports, module) {
    function marpitPlugin(fn) {
      const plugin = (marpit) => {
        const marpitInstance = marpit;
        return fn(marpitInstance);
      };
      return plugin;
    }
    module.exports = marpitPlugin;
  }
});

var import_plugin = __toESM(require_plugin());

var header_and_footer_exports = {};
__export(header_and_footer_exports, {
  default: () => header_and_footer_default,
  headerAndFooter: () => headerAndFooter
});

function wrapTokens(tokens, left, right) {
  return [...left, ...tokens, ...right];
}

var wrap_tokens_default = wrapTokens;

function _headerAndFooter(marpit) {
  const { marpitInlineMarkdown2HTML } = marpit;

  marpit.headerAndFooter = function (opts = {}) {
    const header = opts.header || '';
    const footer = opts.footer || '';

    marpit.use((md) => {
      md.core.ruler.before('normalize', 'marpitHeaderAndFooter', (state) => {
        if (state.inlineMode) return;

        const headerHTML = marpitInlineMarkdown2HTML(header);
        const footerHTML = marpitInlineMarkdown2HTML(footer);

        if (headerHTML || footerHTML) {
          const headerTokens = headerHTML
            ? wrapTokens(
                [],
                [
                  {
                    type: 'marpit_header',
                    content: headerHTML,
                    block: true,
                    meta: { marpitHeaderAndFooter: 'header' }
                  }
                ],
                []
              )
            : [];

          const footerTokens = footerHTML
            ? wrapTokens(
                [],
                [
                  {
                    type: 'marpit_footer',
                    content: footerHTML,
                    block: true,
                    meta: { marpitHeaderAndFooter: 'footer' }
                  }
                ],
                []
              )
            : [];

          state.tokens = [...headerTokens, ...state.tokens, ...footerTokens];
        }
      });
    });
  };
}

var headerAndFooter = (0, import_plugin.default)(_headerAndFooter);
var header_and_footer_default = headerAndFooter;

module.exports = __toCommonJS(header_and_footer_exports);
0 && (module.exports = { headerAndFooter });
