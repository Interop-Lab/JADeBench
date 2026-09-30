"use strict";

const postcss = require("postcss");

class InlineStyle {
  constructor(style) {
    this.decls = {};

    if (style instanceof InlineStyle) {
      style = style.toString();
    }

    if (typeof style === "string") {
      postcss.parse(style, { from: undefined }).each((node) => {
        if (node.type === "decl") {
          this.decls[node.prop] = node.value;
        }
      });
    } else if (style != null) {
      Object.keys(style).forEach((property) => {
        this.decls[property] = style[property];
      });
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
    let css = "";

    Object.keys(this.decls).forEach((property) => {
      postcss
        .parse(`${property}:${this.decls[property]}`, { from: undefined })
        .each((node) => {
          css += `${node.toString()};`;
        });
    });

    return css;
  }
}

Object.defineProperty(exports, "__esModule", { value: true });
exports.default = InlineStyle;
