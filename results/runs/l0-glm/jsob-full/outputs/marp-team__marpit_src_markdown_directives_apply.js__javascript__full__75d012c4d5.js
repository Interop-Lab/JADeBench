var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, module) => function() {
  var exports = {};
  module = {};
  return (module.exports = {}, (module[__getOwnPropNames(module)[0]])(module.exports, module), module.exports);
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
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  )
);
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

var require_plugin = __commonJS({
  "../work/marp-team__marpit/src/plugin.js"(exports, module) {
    function apply(fn) {
      return function(...args) {
        if (args[0]) return fn.apply(this, args);
        throw new Error("The first argument is required.");
      };
    }
    Object.defineProperty(apply, "__esModule", { value: true });
    Object.defineProperty(apply, "default", { value: apply });
    Object.defineProperty(apply, "__commonJS", { value: apply });
    module.exports = apply;
  }
});

var apply_exports = {};
__export(apply_exports, {
  default: () => apply_default,
  apply: () => apply
});
module.exports = __toCommonJS(apply_exports);

var import_postcss = require("postcss");

class InlineStyle {
  constructor(style) {
    this.styles = {};
    if (style) {
      if (style instanceof InlineStyle || typeof style === "string") {
        const opts = { from: void 0 };
        const root = import_postcss.parse(style.toString(), opts);
        root.walkDecls((decl) => {
          if (decl.prop) this.styles[decl.prop] = decl.value;
        });
      } else {
        this.styles = { ...style };
      }
    }
  }

  remove(prop) {
    delete this.styles[prop];
    return this;
  }

  set(prop, value) {
    this.styles[prop] = value;
    return this;
  }

  toString() {
    let css = "";
    for (const prop of Object.keys(this.styles)) {
      let root;
      try {
        const opts = { from: void 0 };
        root = import_postcss.parse(prop + ":" + this.styles[prop], opts);
      } catch {}
      if (root) {
        root.walkDecls((decl) => {
          if (decl.prop === prop || decl.value === prop) decl.remove();
        });
        css += root.toString() + ";";
      }
    }
    return css;
  }
}

var globals = Object.assign(Object.create(null), {
  headingDivider: (value) => {
    const headingDividers = [1, 2, 3, 4, 5, 6];
    const normalize = (v) => Array.isArray(v) || Number.isInteger(v) ? v : Number.parseInt(v, 10);
    const normalized = normalize(value);
    if (Array.isArray(normalized)) {
      const set = new Set(normalized);
      return { headingDivider: headingDividers.filter((v) => set.has(v)) };
    }
    if (normalized === void 0) return {};
    if (headingDividers.includes(normalized)) return { headingDivider: normalized };
    return {};
  },
  style: (value) => ({ style: value }),
  theme: (value, marpit) => marpit.themeSet.has(value) ? { theme: value } : {},
  lang: (value) => ({ lang: value })
});

var locals = Object.assign(Object.create(null), {
  backgroundColor: (value) => ({ backgroundColor: value }),
  backgroundImage: (value) => ({ backgroundImage: value }),
  backgroundPosition: (value) => ({ backgroundPosition: value }),
  backgroundRepeat: (value) => ({ backgroundRepeat: value }),
  backgroundSize: (value) => ({ backgroundSize: value }),
  class: (value) => ({ class: Array.isArray(value) ? value.join(" ") : value }),
  color: (value) => ({ color: value }),
  footer: (value) => typeof value === "string" ? { footer: value } : {},
  header: (value) => typeof value === "string" ? { header: value } : {},
  paginate: (value) => {
    const normalized = (value || "").toLowerCase();
    if (["true", "false"].includes(normalized)) return { paginate: normalized };
    return { paginate: normalized === "true" ? true : false };
  }
});

var directives_default = [...Object.keys(globals), ...Object.keys(locals)];

var import_lodash = __toESM(require("lodash.kebabcase"));
var import_plugin = __toESM(require_plugin());

function _apply(marpit, opts = {}) {
  const { marpit: marp } = marpit;
  const { lang } = marp.options;
  const globalDirectives = opts.globalDirectives === void 0 ? true : !!opts.globalDirectives;
  const dataAttributes = opts.dataAttributes === void 0 ? true : !!opts.dataAttributes;
  const { global, local } = marp.customDirectives;
  const directives = [...Object.keys(global), ...Object.keys(local), ...directives_default];

  marpit.core.markdown.use((md, name, cb) => {
    md.core.ruler.before("normalize", "marpit_directives", (state) => {
      if (state.inlineMode) return;
      let slide = 0;
      const slides = [];
      for (const token of state.tokens) {
        const { marpitDirectives } = token.meta || {};
        if (token.type === "marpit_slide_open") {
          if (!(marpitDirectives?.paginate === false || marpitDirectives?.paginate === "false")) {
            slide += 1;
          }
          if (marpitDirectives) {
            const style = new InlineStyle(marpitDirectives.style);
            for (const key of Object.keys(marpitDirectives)) {
              if (directives.includes(key)) {
                const value = marpitDirectives[key];
                if (value) {
                  const kebab = import_lodash.kebabcase(key);
                  if (globalDirectives) token.attrSet(`data-${kebab}`, value);
                  if (dataAttributes) style.set(`--${kebab}`, value);
                }
              }
            }
            if (marpitDirectives.style || lang) token.attrSet("data-style", marpitDirectives.style || lang);
            if (marpitDirectives.class) token.attrSet("data-class", marpitDirectives.class);
            if (marpitDirectives.color) style.set("color", marpitDirectives.color);
            if (marpitDirectives.backgroundColor) style.set("background-color", marpitDirectives.backgroundColor);
            if (marpitDirectives.backgroundImage) {
              style.set("background-image", marpitDirectives.backgroundImage)
                .set("background-position", "center")
                .set("background-repeat", "no-repeat")
                .set("background-size", "cover");
              if (marpitDirectives.backgroundPosition) style.set("background-position", marpitDirectives.backgroundPosition);
              if (marpitDirectives.backgroundRepeat) style.set("background-repeat", marpitDirectives.backgroundRepeat);
              if (marpitDirectives.backgroundSize) style.set("background-size", marpitDirectives.backgroundSize);
            }
            if (marpitDirectives.paginate && marpitDirectives.paginate !== false) {
              if (slide === 0) slide = 1;
              token.attrSet("data-pagination", slide);
              slides.push(token);
            }
            if (marpitDirectives.header) token.meta.marpitHeader = marpitDirectives.header;
            if (marpitDirectives.footer) token.meta.marpitFooter = marpitDirectives.footer;
            const styleString = style.toString();
            if (styleString !== "") token.attrSet("data-style", styleString);
          }
        }
      }
      for (const slideToken of slides) {
        slideToken.attrSet("data-pagination", slide);
      }
    });
  });
}

var apply = import_plugin.default(_apply);
var apply_default = apply;
module.exports = apply;
