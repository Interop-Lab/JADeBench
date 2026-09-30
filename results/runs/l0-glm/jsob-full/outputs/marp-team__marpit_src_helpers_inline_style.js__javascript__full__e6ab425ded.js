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
        __defProp(to, key, {
          get: () => from[key],
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
        });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

var inline_style_exports = {};
__export(inline_style_exports, {
  default: () => InlineStyle
});
module.exports = __toCommonJS(inline_style_exports);

var import_postcss = require("postcss");

var InlineStyle = class _InlineStyle {
  constructor(declarations) {
    this.declarations = {};
    if (declarations) {
      if (declarations instanceof _InlineStyle || typeof declarations === "string") {
        const options = { from: void 0 };
        const root = import_postcss.parse(declarations.toString(), options);
        root.walkDecls((decl) => {
          if (decl.type === "decl") {
            this.declarations[decl.prop] = decl.value;
          }
        });
      } else {
        var copy = { ...declarations };
        this.declarations = copy;
      }
    }
  }

  remove(prop) {
    delete this.declarations[prop];
    return this;
  }

  set(prop, value) {
    this.declarations[prop] = value;
    return this;
  }

  get() {
    let css = "";
    for (const prop of Object.keys(this.declarations)) {
      let parsed;
      try {
        var options = { from: void 0 };
        parsed = import_postcss.parse(prop + ":" + this.declarations[prop], options);
      } catch {}
      if (parsed) {
        parsed.walkDecls((decl) => {
          if (decl.type === "decl" || decl.prop === prop) {
            decl.remove();
          }
        });
        css += parsed.toString() + ";";
      }
    }
    return css;
  }
};
