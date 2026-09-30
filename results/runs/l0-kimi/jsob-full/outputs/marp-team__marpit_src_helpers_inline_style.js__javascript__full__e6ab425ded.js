var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && (typeof from === "object" || typeof from === "function")) {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

var inline_style_exports = {};
__export(inline_style_exports, {
  InlineStyle: () => InlineStyle
});
module.exports = __toCommonJS(inline_style_exports);

var import_postcss = require("postcss");

class InlineStyle {
  constructor(cssText) {
    this.styles = {};
    if (cssText) {
      if (cssText instanceof InlineStyle || typeof cssText === "object") {
        var _cssText = { ...cssText };
        this.styles = _cssText;
      } else {
        const options = { from: void 0 };
        const root = (0, import_postcss.parse)(cssText.toString(), options);
        root.walk((decl) => {
          if (decl.type === "decl") {
            this.styles[decl.prop] = decl.value;
          }
        });
      }
    }
  }

  remove(property) {
    delete this.styles[property];
    return this;
  }

  set(property, value) {
    this.styles[property] = value;
    return this;
  }

  toString() {
    let result = "";
    for (const property of Object.keys(this.styles)) {
      let root;
      try {
        const options = { from: void 0 };
        root = (0, import_postcss.parse)(property + ":" + this.styles[property], options);
      } catch {}
      root && root.walk((decl) => {
        if (decl.type === "decl" || decl.type === "rule") {
          decl.remove();
        }
      });
      result += root.toString() + ";";
    }
    return result;
  }
}
