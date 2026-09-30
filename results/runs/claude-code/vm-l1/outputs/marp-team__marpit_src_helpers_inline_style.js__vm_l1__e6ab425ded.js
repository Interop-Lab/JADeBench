"use strict";

const postcss = require("postcss");

class InlineStyle {
  constructor(styles) {
    this.decls = {};

    if (typeof styles === "string") {
      postcss.parse(styles).walkDecls((declaration) => {
        this.decls[declaration.prop] = declaration.value;
      });
    } else if (styles && typeof styles === "object") {
      Object.assign(this.decls, styles);
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
    return Object.entries(this.decls)
      .map(([property, value]) => {
        try {
          return `${postcss.parse(`${property}:${String(value)}`).toString()};`;
        } catch {
          return "";
        }
      })
      .join("");
  }
}

Object.defineProperty(exports, "__esModule", { value: true });
Object.defineProperty(exports, "default", {
  enumerable: true,
  get: () => InlineStyle,
});
