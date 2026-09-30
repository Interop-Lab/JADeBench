"use strict";

Object.defineProperty(module.exports, "__esModule", { value: true });
Object.defineProperty(module.exports, "default", {
  enumerable: true,
  get: () => InlineStyle,
});

const postcss = require("postcss");

class InlineStyle {
  constructor(style) {
    this.decls = {};

    if (!style) {
      return;
    }

    if (style instanceof InlineStyle || typeof style === "string") {
      const root = postcss.parse(style.toString(), { from: undefined });
      root.each((declaration) => {
        if (declaration.type === "decl") {
          this.decls[declaration.prop] = declaration.value;
        }
      });
      return;
    }

    this.decls = { ...style };
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
    let result = "";

    for (const property of Object.keys(this.decls)) {
      let root;
      try {
        root = postcss.parse(`${property}:${this.decls[property]}`, {
          from: undefined,
        });
      } catch {
        continue;
      }

      if (!root) {
        continue;
      }

      root.each((declaration) => {
        if (declaration.type !== "decl" || declaration.prop !== property) {
          declaration.remove();
        }
      });
      result += `${root.toString()};`;
    }

    return result;
  }
}
