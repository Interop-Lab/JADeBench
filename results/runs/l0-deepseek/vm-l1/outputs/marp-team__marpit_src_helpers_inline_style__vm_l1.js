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
        __defProp(to, key, {
          get: () => from[key],
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
        });
      }
    }
  }
  return to;
};

const __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

var inline_style_exports = {};
__export(inline_style_exports, {
  default: () => InlineStyle
});

var import_postcss = require("postcss");

class InlineStyle {
  constructor(selector) {
    this.selector = selector;
  }

  process(rule) {
    const decls = {};
    rule.walkDecls((decl) => {
      decls[decl.prop] = decl.value;
    });
    return decls;
  }

  set(decl, value) {
    decl.value = value;
  }

  toString() {
    return this.selector;
  }
}

module.exports = __toCommonJS(inline_style_exports);
