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

// ../work/marp-team__marpit/src/markdown/slide.js
var slide_exports = {};
__export(slide_exports, {
  default: () => slide_default,
  defaultAnchorCallback: () => defaultAnchorCallback,
  slide: () => slide
});
module.exports = __toCommonJS(slide_exports);

// ../work/marp-team__marpit/src/helpers/split.js
function split(arr, func, keepSplitValue = false) {
  const ret = [[]];
  for (const value of arr) {
    if (func(value)) {
      ret.push(keepSplitValue ? [value] : []);
    } else {
      ret[ret.length - 1].push(value);
    }
  }
  return ret;
}
var split_default = split;

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

// ../work/marp-team__marpit/src/markdown/slide.js
var import_plugin = __toESM(require_plugin());
var defaultAnchorCallback = (i) => `${i + 1}`;
function _slide(md, opts = {}) {
  const anchor = opts.anchor === void 0 ? true : opts.anchor;
  const anchorCallback = (() => {
    if (typeof anchor === "function") return anchor;
    if (anchor) return defaultAnchorCallback;
    return () => void 0;
  })();
  md.core.ruler.push("marpit_slide", (state) => {
    if (state.inlineMode) return;
    const splittedTokens = split(
      state.tokens,
      (t) => t.type === "hr" && t.level === 0,
      true
    );
    const { length: marpitSlideTotal } = splittedTokens;
    state.tokens = splittedTokens.reduce((arr, slideTokens, marpitSlide) => {
      const firstHr = slideTokens[0] && slideTokens[0].type === "hr" ? slideTokens[0] : void 0;
      const mapTarget = firstHr || slideTokens.find((t) => t.map);
      return [
        ...arr,
        ...wrapTokens(
          state.Token,
          "marpit_slide",
          {
            ...opts.attributes || {},
            tag: "section",
            id: anchorCallback(marpitSlide),
            open: {
              block: true,
              meta: { marpitSlide, marpitSlideTotal, marpitSlideElement: 1 },
              map: mapTarget ? mapTarget.map : [0, 1]
            },
            close: {
              block: true,
              meta: { marpitSlide, marpitSlideTotal, marpitSlideElement: -1 }
            }
          },
          slideTokens.slice(firstHr ? 1 : 0)
        )
      ];
    }, []);
  });
}
var slide = (0, import_plugin.default)(_slide);
var slide_default = slide;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  defaultAnchorCallback,
  slide
});
