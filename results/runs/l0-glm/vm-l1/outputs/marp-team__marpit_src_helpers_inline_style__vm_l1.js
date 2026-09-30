"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, source) => {
  for (var key in source)
    if (__hasOwnProp.call(source, key) && !__hasOwnProp.call(target, key))
      __defProp(target, key, { get: () => source[key], enumerable: true, configurable: true });
};
var __toCommonJS = (mod) => __defProp({}, "__esModule", { value: true }) && mod;
var inline_style_exports = {};
__export(inline_style_exports, {
  default: () => inline_style_default
});
module.exports = __toCommonJS(inline_style_exports);
var import_postcss = require("postcss");
var inline_style_default = class InlineStyle {
  constructor(text) {
    this.styles = {};
    if (text) {
      this.set(text);
    }
  }
  set(text) {
    var self = this;
    import_postcss.parse(text).each(function(node) {
      if (node.type === "decl") {
        self.styles[node.prop] = node.value;
      }
    });
    return this;
  }
  toString() {
    var arr = [];
    for (var prop in this.styles) {
      arr.push(prop + ":" + this.styles[prop]);
    }
    return arr.join(";");
  }
  valueOf() {
    return this.toString();
  }
};
