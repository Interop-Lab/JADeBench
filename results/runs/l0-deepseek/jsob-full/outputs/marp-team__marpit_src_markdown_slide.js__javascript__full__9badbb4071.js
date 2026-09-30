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
  for (const name in all) __defProp(target, name, { get: all[name], enumerable: true });
};

const __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (const key of __getOwnPropNames(from)) {
      if (!__hasOwnProp.call(to, key) && key !== except) {
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
    }
  }
  return to;
};

const __toESM = (mod, isNodeMode, target) => (
  target = mod != null ? __create(__getProtoOf(mod)) : {},
  __copyProps(
    isNodeMode || !mod || !mod.__esModule
      ? __defProp(target, "default", { value: mod, enumerable: true })
      : target,
    mod
  )
);

const __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

const require_plugin = __commonJS({
  "../work/marp-team__marpit/src/plugin.js"(exports, module) {
    function plugin(md) {
      if (md.inline) return md.inline.apply(this, arguments);
      throw new Error("Marpit plugin requires inline renderer");
    }
    Object.defineProperty(plugin, "__esModule", { value: true });
    Object.defineProperty(plugin, "default", { value: plugin });
    Object.defineProperty(plugin, "plugin", { value: plugin });
    module.exports = plugin;
  }
});

const import_plugin = __toESM(require_plugin());

function split(array, separator, includeSeparator = false) {
  const result = [[]];
  for (const item of array) {
    if (separator === item) {
      result.push(includeSeparator ? [item] : []);
    } else {
      result[result.length - 1].push(item);
    }
  }
  return result;
}

const split_default = split;

function wrapTokens(Token, renderer, options, additionalTokens = []) {
  const { tag } = options;
  for (const token of additionalTokens) token.nesting += 1;
  const openToken = new Token(renderer + "_open", tag, 1);
  const closeToken = new Token(renderer + "_close", tag, -1);
  const openAttrs = { ...options.open || {} };
  Object.assign(openToken, openAttrs);
  const closeAttrs = { ...options.close || {} };
  Object.assign(closeToken, closeAttrs);
  for (const key of Object.keys(options)) {
    if (!["open", "close", "tag"].includes(key) && options[key] != null) {
      openToken[key] = options[key];
    }
  }
  return [openToken, ...additionalTokens, closeToken];
}

const wrap_tokens_default = wrapTokens;

const defaultAnchorCallback = (index) => "" + (index + 1);

function _slide(md, opts = {}) {
  const anchor = opts.anchor === undefined ? true : opts.anchor;
  const anchorCallback = (() => {
    if (typeof anchor === "function") return anchor;
    if (anchor) return defaultAnchorCallback;
    return () => void 0;
  })();

  md.core.ruler.push("marpit_slide", (state) => {
    if (state.inlineMode) return;
    const slides = split(state.tokens, (token) => token.type === "hr" && token.meta && token.meta.marpitSlide === -1, true);
    const { length: slideCount } = slides;
    state.tokens = slides.flatMap((tokens, slideIndex) => {
      const firstHr = tokens[0] && tokens[0].type === "hr" ? tokens[0] : undefined;
      const mapTarget = firstHr || tokens.find((token) => token.map);
      return [
        ...tokens,
        ...wrapTokens(state.Token, state.md, {
          ...opts.attributes || {},
          tag: "section",
          id: anchorCallback(slideIndex),
          open: {
            block: true,
            meta: {
              marpitSlide: slideIndex,
              marpitSlideTotal: slideCount,
              marpitSlideElement: 1
            },
            map: mapTarget ? mapTarget.map : [0, 1]
          },
          close: {
            block: true,
            meta: {
              marpitSlide: slideIndex,
              marpitSlideTotal: slideCount,
              marpitSlideElement: -1
            }
          }
        }, tokens.slice(firstHr ? 1 : 0))
      ];
    }, []);
  });
}

const slide = import_plugin.default(_slide);
const slide_default = slide;

const slide_exports = {};
__export(slide_exports, {
  default: () => slide_default,
  defaultAnchorCallback: () => defaultAnchorCallback,
  slide: () => slide
});

module.exports = __toCommonJS(slide_exports);
