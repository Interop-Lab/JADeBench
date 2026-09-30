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

// ../work/marp-team__marpit/src/markdown/directives/apply.js
var apply_exports = {};
__export(apply_exports, {
  apply: () => apply,
  default: () => apply_default
});
module.exports = __toCommonJS(apply_exports);

// ../work/marp-team__marpit/src/helpers/inline_style.js
var import_postcss = require("postcss");
var InlineStyle = class _InlineStyle {
  /**
   * Create an InlineStyle instance.
   *
   * @function constructor
   * @param {Object|String|InlineStyle} [initialDecls] The initial declarations.
   */
  constructor(initialDecls) {
    this.decls = {};
    if (initialDecls) {
      if (initialDecls instanceof _InlineStyle || typeof initialDecls === "string") {
        const root = (0, import_postcss.parse)(initialDecls.toString(), { from: void 0 });
        root.each((node) => {
          if (node.type === "decl") this.decls[node.prop] = node.value;
        });
      } else {
        this.decls = { ...initialDecls };
      }
    }
  }
  /**
   * Delete declaration.
   *
   * @param {string} prop A property name of declaration.
   * @returns {InlineStyle} Returns myself for chaining methods.
   */
  delete(prop) {
    delete this.decls[prop];
    return this;
  }
  /**
   * Set declaration.
   *
   * @param {string} prop A property name of declaration.
   * @param {string} value A value of declaration.
   * @returns {InlineStyle} Returns myself for chaining methods.
   */
  set(prop, value) {
    this.decls[prop] = value;
    return this;
  }
  /**
   * Build a string of declarations for the inline style.
   *
   * The unexpected declarations will strip to prevent a style injection.
   */
  toString() {
    let built = "";
    for (const prop of Object.keys(this.decls)) {
      let parsed;
      try {
        parsed = (0, import_postcss.parse)(`${prop}:${this.decls[prop]}`, { from: void 0 });
      } catch {
      }
      if (parsed) {
        parsed.each((node) => {
          if (node.type !== "decl" || node.prop !== prop) node.remove();
        });
        built += `${parsed.toString()};`;
      }
    }
    return built;
  }
};

// ../work/marp-team__marpit/src/markdown/directives/directives.js
var globals = Object.assign(/* @__PURE__ */ Object.create(null), {
  headingDivider: (value) => {
    const headings = [1, 2, 3, 4, 5, 6];
    const toInt = (v) => Array.isArray(v) || Number.isNaN(v) ? v : Number.parseInt(v, 10);
    const converted = toInt(value);
    if (Array.isArray(converted)) {
      const convertedArr = converted.map(toInt);
      return {
        headingDivider: headings.filter((v) => convertedArr.includes(v))
      };
    }
    if (value === "false") return { headingDivider: false };
    if (headings.includes(converted)) return { headingDivider: converted };
    return {};
  },
  style: (v) => ({ style: v }),
  theme: (v, marpit) => marpit.themeSet.has(v) ? { theme: v } : {},
  lang: (v) => ({ lang: v })
});
var locals = Object.assign(/* @__PURE__ */ Object.create(null), {
  backgroundColor: (v) => ({ backgroundColor: v }),
  backgroundImage: (v) => ({ backgroundImage: v }),
  backgroundPosition: (v) => ({ backgroundPosition: v }),
  backgroundRepeat: (v) => ({ backgroundRepeat: v }),
  backgroundSize: (v) => ({ backgroundSize: v }),
  class: (v) => ({ class: Array.isArray(v) ? v.join(" ") : v }),
  color: (v) => ({ color: v }),
  footer: (v) => typeof v === "string" ? { footer: v } : {},
  header: (v) => typeof v === "string" ? { header: v } : {},
  paginate: (v) => {
    const normalized = (v || "").toLowerCase();
    if (["hold", "skip"].includes(normalized)) return { paginate: normalized };
    return { paginate: normalized === "true" };
  }
});
var directives_default = [...Object.keys(globals), ...Object.keys(locals)];

// ../work/marp-team__marpit/src/markdown/directives/apply.js
var import_lodash = __toESM(require("lodash.kebabcase"));
var import_plugin = __toESM(require_plugin());
function _apply(md, opts = {}) {
  const { marpit } = md;
  const { lang } = marpit.options;
  const dataset = opts.dataset === void 0 ? true : !!opts.dataset;
  const css = opts.css === void 0 ? true : !!opts.css;
  const { global, local } = marpit.customDirectives;
  const directives = [
    ...Object.keys(global),
    ...Object.keys(local),
    ...directives_default
  ];
  md.core.ruler.after(
    "marpit_directives_parse",
    "marpit_directives_apply",
    (state) => {
      if (state.inlineMode) return;
      let pageNumber = 0;
      const tokensForPaginationTotal = [];
      for (const token of state.tokens) {
        const { marpitDirectives } = token.meta || {};
        if (token.type === "marpit_slide_open") {
          if (!(marpitDirectives?.paginate === "skip" || marpitDirectives?.paginate === "hold")) {
            pageNumber += 1;
          }
        }
        if (marpitDirectives) {
          const style = new InlineStyle(token.attrGet("style"));
          for (const dir of Object.keys(marpitDirectives)) {
            if (directives.includes(dir)) {
              const value = marpitDirectives[dir];
              if (value) {
                const kebabCaseDir = (0, import_lodash.default)(dir);
                if (dataset) token.attrSet(`data-${kebabCaseDir}`, value);
                if (css) style.set(`--${kebabCaseDir}`, value);
              }
            }
          }
          if (marpitDirectives.lang || lang)
            token.attrSet("lang", marpitDirectives.lang || lang);
          if (marpitDirectives.class)
            token.attrJoin("class", marpitDirectives.class);
          if (marpitDirectives.color) style.set("color", marpitDirectives.color);
          if (marpitDirectives.backgroundColor)
            style.set("background-color", marpitDirectives.backgroundColor).set("background-image", "none");
          if (marpitDirectives.backgroundImage) {
            style.set("background-image", marpitDirectives.backgroundImage).set("background-position", "center").set("background-repeat", "no-repeat").set("background-size", "cover");
            if (marpitDirectives.backgroundPosition)
              style.set(
                "background-position",
                marpitDirectives.backgroundPosition
              );
            if (marpitDirectives.backgroundRepeat)
              style.set("background-repeat", marpitDirectives.backgroundRepeat);
            if (marpitDirectives.backgroundSize)
              style.set("background-size", marpitDirectives.backgroundSize);
          }
          if (marpitDirectives.paginate && marpitDirectives.paginate !== "skip") {
            if (pageNumber <= 0) pageNumber = 1;
            token.attrSet("data-marpit-pagination", pageNumber);
            tokensForPaginationTotal.push(token);
          }
          if (marpitDirectives.header)
            token.meta.marpitHeader = marpitDirectives.header;
          if (marpitDirectives.footer)
            token.meta.marpitFooter = marpitDirectives.footer;
          const styleStr = style.toString();
          if (styleStr !== "") token.attrSet("style", styleStr);
        }
      }
      for (const token of tokensForPaginationTotal) {
        token.attrSet("data-marpit-pagination-total", pageNumber);
      }
    }
  );
}
var apply = (0, import_plugin.default)(_apply);
var apply_default = apply;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  apply
});
