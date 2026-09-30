var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;

var __export = (target, exports) => {
  for (var name in exports) {
    __defProp(target, name, {
      get: exports[name],
      enumerable: true,
    });
  }
};

var __copyProps = (target, source, except, descriptor) => {
  if (source && (typeof source === "object" || typeof source === "function")) {
    for (let key of __getOwnPropNames(source)) {
      if (!__hasOwnProp.call(target, key) && key !== except) {
        __defProp(target, key, {
          get: () => source[key],
          enumerable:
            !(descriptor = __getOwnPropDesc(source, key)) || descriptor.enumerable,
        });
      }
    }
  }
  return target;
};

var __toCommonJS = (moduleValue) =>
  __copyProps(__defProp({}, "__esModule", { value: true }), moduleValue);

var inlineStyleExports = {};
__export(inlineStyleExports, {
  default: () => InlineStyle,
});
module.exports = __toCommonJS(inlineStyleExports);

var postcss = require("postcss");

var InlineStyle = class _InlineStyle {
  constructor(style) {
    this.decls = {};

    if (typeof style === "string") {
      postcss.parse(style, { from: undefined }).each((node) => {
        if (node.type === "decl") {
          this.decls[node.prop] = node.value;
        }
      });
    } else {
      this.decls = { ...style };
    }
  }

  delete(property) {
    delete this.decls[property];
    return this;
  }

  set(property, value) {
    this.decls[property] = value;
    return this;
  }

  toString() {
    let style = "";

    Object.keys(this.decls).forEach((property) => {
      const root = postcss.parse(`${property}:${this.decls[property]}`, {
        from: undefined,
      });

      root.each((node) => {
        if (node.type !== "decl" || node.prop !== property) {
          node.remove();
        }
      });

      style += `${root.toString()};`;
    });

    return style;
  }
};
