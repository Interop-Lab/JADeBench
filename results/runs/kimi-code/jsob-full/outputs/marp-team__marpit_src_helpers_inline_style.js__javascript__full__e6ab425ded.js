"use strict";

const postcss = require("postcss");

class InlineStyle {
  constructor(style) {
    this.style = {};

    if (!style) return;

    if (style instanceof InlineStyle || typeof style === "string") {
      const root = postcss.parse(style.toString(), { from: undefined });
      root.walkDecls((declaration) => {
        if (declaration.type === "decl") {
          this.style[declaration.prop] = declaration.value;
        }
      });
      return;
    }

    this.style = { ...style };
  }

  delete(property) {
    delete this.style[property];
    return this;
  }

  set(property, value) {
    this.style[property] = value;
    return this;
  }

  toString() {
    let serialized = "";

    for (const property of Object.keys(this.style)) {
      let root;
      try {
        root = postcss.parse(`${property}:${this.style[property]}`, {
          from: undefined,
        });
      } catch {}

      if (!root) continue;

      root.walkDecls((declaration) => {
        if (declaration.type !== "decl" || declaration.prop !== property) {
          declaration.remove();
        }
      });
      serialized += `${root.toString()};`;
    }

    return serialized;
  }
}

Object.defineProperty(exports, "__esModule", { value: true });
Object.defineProperty(exports, "default", {
  enumerable: true,
  get: () => InlineStyle,
});
