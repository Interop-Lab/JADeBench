"use strict";

const postcss = require("postcss");

class InlineStyle {
  constructor(style) {
    this.decls = {};

    if (!style) return;

    if (style instanceof InlineStyle || typeof style === "string") {
      const root = postcss.parse(style.toString(), { from: undefined });
      root.walkDecls((declaration) => {
        if (declaration.type === "decl") {
          this.decls[declaration.prop] = declaration.value;
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
    let result = "";

    for (const property of Object.keys(this.decls)) {
      let root;
      try {
        root = postcss.parse(`${property}:${this.decls[property]}`, {
          from: undefined,
        });
      } catch {
        // Invalid individual declarations are omitted.
      }

      if (root) {
        root.walkDecls((declaration) => {
          if (declaration.type !== "decl" || declaration.prop !== property) {
            declaration.remove();
          }
        });
        result += `${root.toString()};`;
      }
    }

    return result;
  }
}

Object.defineProperty(exports, "__esModule", { value: true });
Object.defineProperty(exports, "default", {
  enumerable: true,
  get: () => InlineStyle,
});
