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

// ../work/marp-team__marpit/src/markdown/heading_divider.js
var heading_divider_exports = {};
__export(heading_divider_exports, {
  default: () => heading_divider_default,
  headingDivider: () => headingDivider
});
module.exports = __toCommonJS(heading_divider_exports);

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

// ../work/marp-team__marpit/src/markdown/heading_divider.js
var import_plugin = __toESM(require_plugin());
function _headingDivider(md) {
  const { marpit } = md;
  md.core.ruler.before("marpit_slide", "marpit_heading_divider", (state) => {
    let target = marpit.options.headingDivider;
    if (marpit.lastGlobalDirectives && Object.prototype.hasOwnProperty.call(
      marpit.lastGlobalDirectives,
      "headingDivider"
    ))
      target = marpit.lastGlobalDirectives.headingDivider;
    if (state.inlineMode || target === false) return;
    if (Number.isInteger(target) && target >= 1 && target <= 6)
      target = [...Array(target).keys()].map((i) => i + 1);
    if (!Array.isArray(target)) return;
    const splitTag = target.map((i) => `h${i}`);
    const splitFunc = (t) => t.type === "heading_open" && splitTag.includes(t.tag);
    const newTokens = [];
    for (const slideTokens of split(state.tokens, splitFunc, true)) {
      const [token] = slideTokens;
      if (token && splitFunc(token) && newTokens.some((t) => !t.hidden)) {
        const hr = new state.Token("hr", "", 0);
        hr.hidden = true;
        hr.map = token.map;
        newTokens.push(hr);
      }
      newTokens.push(...slideTokens);
    }
    state.tokens = newTokens;
  });
}
var headingDivider = (0, import_plugin.default)(_headingDivider);
var heading_divider_default = headingDivider;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  headingDivider
});
