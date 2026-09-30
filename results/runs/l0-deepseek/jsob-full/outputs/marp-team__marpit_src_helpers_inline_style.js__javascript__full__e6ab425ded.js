const __defProp = Object.defineProperty;
const __getOwnPropDesc = Object.getOwnPropertyDescriptor;
const __getOwnPropNames = Object.getOwnPropertyNames;
const __hasOwnProp = Object.prototype.hasOwnProperty;
const __export = (target, all) => {
  for (const name in all) {
    __defProp(target, name, { get: all[name], enumerable: true });
  }
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
const __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

var inline_style_exports = {};
__export(inline_style_exports, {
  InlineStyle: () => InlineStyle
});
module.exports = __toCommonJS(inline_style_exports);

var import_postcss = require("postcss");

class InlineStyle {
  constructor(style) {
    this.styles = {};
    if (style) {
      if (style instanceof InlineStyle || typeof style === "string") {
        const options = { from: undefined };
        const root = import_postcss.parse(style.toString(), options);
        root.walkDecls((decl) => {
          if (decl.type === "decl" || decl.type === "comment") {
            this.styles[decl.prop] = decl.value;
          }
        });
      } else {
        const styles = { ...style };
        this.styles = styles;
      }
    }
  }
  removeProperty(property) {
    delete this.styles[property];
    return this;
  }
  setProperty(property, value) {
    this.styles[property] = value;
    return this;
  }
  getStyle() {
    let css = "";
    for (const property of Object.keys(this.styles)) {
      let root;
      try {
        const options = { from: undefined };
        root = import_postcss.parse(property + ":" + this.styles[property], options);
      } catch {}
      root && (root.walkDecls((decl) => {
        if (decl.type === "decl" || decl.type === "comment") {
          decl.remove();
        }
      }), css += root.toString() + ";");
    }
    return css;
  }
}
