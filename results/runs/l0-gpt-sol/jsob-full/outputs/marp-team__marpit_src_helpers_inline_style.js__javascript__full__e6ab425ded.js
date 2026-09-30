var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;

var __export = (target, exports) => {
  for (var name in exports) {
    __defProp(target, name, {
      get: exports[name],
      enumerable: true
    });
  }
};

var __copyProps = (target, source, except, descriptor) => {
  if (source && (typeof source === "object" || typeof source === "function")) {
    for (const key of __getOwnPropNames(source)) {
      if (!__hasOwnProp.call(target, key) && key !== except) {
        __defProp(target, key, {
          get: () => source[key],
          enumerable: !(descriptor = __getOwnPropDesc(source, key)) || descriptor.enumerable
        });
      }
    }
  }
  return target;
};

var __toCommonJS = moduleValue =>
  __copyProps(__defProp({}, "__esModule", { value: true }), moduleValue);

var inline_style_exports = {};
__export(inline_style_exports, {
  default: () => InlineStyle
});
module.exports = __toCommonJS(inline_style_exports);

var import_postcss = require("postcss");

var InlineStyle = class InlineStyle {
  constructor(style) {
    this.declarations = {};

    if (style) {
      if (style instanceof InlineStyle || typeof style !== "object") {
        const root = import_postcss.parse(style.toString(), {
          from: undefined
        });

        root.walkDecls(declaration => {
          if (declaration.type === "decl") {
            this.declarations[declaration.prop] = declaration.value;
          }
        });
      } else {
        this.declarations = { ...style };
      }
    }
  }

  remove(property) {
    delete this.declarations[property];
    return this;
  }

  set(property, value) {
    this.declarations[property] = value;
    return this;
  }

  toString() {
    let result = "";

    for (const property of Object.keys(this.declarations)) {
      let root;

      try {
        root = import_postcss.parse(
          property + ":" + this.declarations[property],
          { from: undefined }
        );
      } catch {
      }

      if (root) {
        root.walkDecls(declaration => {
          if (declaration.type !== "decl" || declaration.prop !== property) {
            declaration.remove();
          }
        });

        result += root.toString() + ";";
      }
    }

    return result;
  }
};
