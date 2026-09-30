var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// ../work/marp-team__marpit/src/helpers/inline_style.js
var inline_style_exports = {};
__export(inline_style_exports, {
  default: () => InlineStyle
});
module.exports = __toCommonJS(inline_style_exports);
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
