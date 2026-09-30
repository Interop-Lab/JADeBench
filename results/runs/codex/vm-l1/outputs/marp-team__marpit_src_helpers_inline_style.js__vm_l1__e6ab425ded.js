var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all) {
    __defProp(target, name, { get: all[name], enumerable: true });
  }
};
var __copyProps = (to, from, except, desc) => {
  if (from && (typeof from === "object" || typeof from === "function")) {
    for (let key of __getOwnPropNames(from)) {
      if (!__hasOwnProp.call(to, key) && key !== except) {
        __defProp(to, key, {
          get: () => from[key],
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
        });
      }
    }
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
var InlineStyle = class {
  constructor(style) {
    this.decls = {};
    if (typeof style === "string") {
      import_postcss.parse(style, { from: void 0 }).each((decl) => {
        if (decl.type === "decl") {
          this.decls[decl.prop] = decl.value;
        }
      });
    }
  }

  delete(prop) {
    delete this.decls[prop];
    return this;
  }

  set(prop, value) {
    this.decls[prop] = value;
    return this;
  }

  toString() {
    return Object.entries(this.decls)
      .map(([prop, value]) => `${import_postcss.parse(`${prop}:${value}`, { from: void 0 }).toString()};`)
      .join("");
  }
};
