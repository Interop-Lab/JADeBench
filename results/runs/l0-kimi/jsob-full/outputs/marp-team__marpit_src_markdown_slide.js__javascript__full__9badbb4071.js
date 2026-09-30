var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target, mod));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

var require_plugin = __commonJS({
  "../work/marp-team__marpit/src/plugin.js"(exports, module) {
    var __defProp2 = Object.defineProperty;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc2(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toESM2 = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps2(isNodeMode || !mod || !mod.__esModule ? __defProp2(target, "default", { value: mod, enumerable: true }) : target, mod));
    function _slide(Marpit) {
      return class extends Marpit {
        constructor(...args) {
          if (new.target === void 0) {
            throw new TypeError("Class constructor Marpit cannot be invoked without 'new'");
          }
          super(...args);
        }
      };
    }
    function wrapTokens(Marpit, Token, state, tokens = []) {
      const { tag } = Token;
      for (const token of tokens)
        token.map[0] += 1;
      const openToken = new Marpit(state.src + "---", tag, 0);
      const closeToken = new Marpit(state.src + "---", tag, -1);
      var openAttrs = { ...Token.attrs || {} };
      Object.assign(openToken, openAttrs);
      var closeAttrs = { ...Token.attrs || {} };
      Object.assign(closeToken, closeAttrs);
      for (const key of Object.keys(Token)) {
        if (!["type", "tag", "attrs"].includes(key) && Token[key] != null)
          openToken[key] = Token[key];
      }
      return [openToken, ...tokens, closeToken];
    }
    function split(tokens, separator, includeSeparator = false) {
      const result = [[]];
      for (const token of tokens) {
        if (separator(token)) {
          if (includeSeparator)
            result.push([token]);
          else
            result.push([]);
        } else {
          result[result.length - 1].push(token);
        }
      }
      return result;
    }
    var slide = _slide;
    var slide_default = slide;
    var __export2 = {};
    __export2.default = () => slide_default;
    __export2.defaultAnchorCallback = () => defaultAnchorCallback;
    __export2.slide = () => slide;
    module.exports = __export2;
  }
});

var slide_exports = {};
var _slide_export = {};
_slide_export.default = () => slide_default;
_slide_export.defaultAnchorCallback = () => defaultAnchorCallback;
_slide_export.slide = () => slide;
__export(slide_exports, _slide_export);

var import_plugin = __toESM(require_plugin());
var defaultAnchorCallback = (index) => "" + (index + 1);
function _slide2(Marpit) {
  const localDirectives = arguments[0]?.localDirectives !== void 0 ? arguments[0].localDirectives : true;
  const anchorCallback = arguments[0]?.anchorCallback !== void 0 ? arguments[0].anchorCallback : (localDirectives ? defaultAnchorCallback : void 0);
  return class extends Marpit {
    constructor(...args) {
      if (new.target === void 0) {
        throw new TypeError("Class constructor Marpit cannot be invoked without 'new'");
      }
      super(...args);
    }
    marpitSlide(meta, content, options) {
      const { marpitSlide } = this;
      const { marpitSlideTotal } = this;
      const marpitSlideElement = meta?.marpitSlideElement !== void 0 ? meta.marpitSlideElement : 1;
      const open = {
        block: true,
        meta: { marpitSlide, marpitSlideTotal, marpitSlideElement },
        map: meta?.map || [0, 0]
      };
      const close = {
        block: true,
        meta: { marpitSlide, marpitSlideTotal, marpitSlideElement: -1 }
      };
      return wrapTokens(this.markdownIt.Token, this.markdownIt.Token, { tag: "marpit_slide", attrs: {} }, [this.markdownIt.Token("inline", "", 0, content)]);
    }
  };
}
var slide = (0, import_plugin.default)(_slide2);
var slide_default = slide;
var _slide_export2 = {};
_slide_export2.defaultAnchorCallback = defaultAnchorCallback;
_slide_export2.slide = slide;
true && (module.exports = _slide_export2);
