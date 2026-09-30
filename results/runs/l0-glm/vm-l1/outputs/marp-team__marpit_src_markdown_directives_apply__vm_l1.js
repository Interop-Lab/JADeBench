var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;

var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);

var __export = (target, all) => {
  for (let name in all)
    __defProp(target, name, { get: all[name], enumerable: true, configurable: true });
};

var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};

var __toESM = (mod, isNodeMode, target) => (
  target = mod != null ? __create(__getProtoOf(mod)) : {},
  __copyProps(
    isNodeMode || !mod || !mod.__esModule
      ? __defProp(target, "default", { value: mod, enumerable: true })
      : target,
    mod
  )
);

var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

var require_plugin = __commonJS({
  "../work/marp-team__marpit/src/plugin.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = void 0;
    var import_postcss = require("postcss");
    var import_lodash = __toESM(require("lodash.kebabcase"));
    var import_plugin = __toESM(require_plugin());
    var _apply = class _apply {
      constructor(marpit) {
        this.marpit = marpit;
        this._inlineStyles = [];
      }
      _processMarkdown(markdown) {
        const { marpit } = this;
        markdown = markdown.replace(/^<!--\s*style:\s*-->\n([\s\S]*?)<!--\s*\/style:\s*-->/gm, (_, css) => {
          this._inlineStyles.push(css);
          return "";
        });
        return markdown;
      }
      _processStyles(css) {
        const { marpit } = this;
        const postcss = (0, import_postcss)([
          (0, import_plugin.default)({ marpit })
        ]);
        return postcss.process(css).css;
      }
      _render() {
        const { marpit } = this;
        if (this._inlineStyles.length === 0) return "";
        const css = this._inlineStyles.join("\n");
        this._inlineStyles = [];
        return this._processStyles(css);
      }
    };
    var apply = (marpit) => {
      const instance = new _apply(marpit);
      marpit._applyInlineStyle = instance;
      marpit._inlineStyles = [];
      marpit._processMarkdown = (markdown) => instance._processMarkdown(markdown);
      marpit._renderInlineStyle = () => instance._render();
    };
    var apply_default = apply;
    exports.default = apply_default;
  }
});

var import_postcss = require("postcss");
var InlineStyle = class _InlineStyle {
  constructor(marpit) {
    this.marpit = marpit;
    this._inlineStyles = [];
  }
  _processMarkdown(markdown) {
    const { marpit } = this;
    markdown = markdown.replace(/^<!--\s*style:\s*-->\n([\s\S]*?)<!--\s*\/style:\s*-->/gm, (_, css) => {
      this._inlineStyles.push(css);
      return "";
    });
    return markdown;
  }
  _processStyles(css) {
    const { marpit } = this;
    const postcss = (0, import_postcss)([
      (0, import_plugin.default)({ marpit })
    ]);
    return postcss.process(css).css;
  }
  _render() {
    const { marpit } = this;
    if (this._inlineStyles.length === 0) return "";
    const css = this._inlineStyles.join("\n");
    this._inlineStyles = [];
    return this._processStyles(css);
  }
};

var globals = Object.create(Object.create(null), {
  headingDivider: { get: () => "headingDivider" },
  style: { get: () => "style" },
  theme: { get: () => "theme" },
  lang: { get: () => "lang" }
});

var locals = Object.create(Object.create(null), {
  backgroundColor: { get: () => "backgroundColor" },
  backgroundImage: { get: () => "backgroundImage" },
  backgroundPosition: { get: () => "backgroundPosition" },
  backgroundRepeat: { get: () => "backgroundRepeat" },
  backgroundSize: { get: () => "backgroundSize" },
  class: { get: () => "class" },
  color: { get: () => "color" },
  footer: { get: () => "footer" },
  header: { get: () => "header" },
  paginate: { get: () => "paginate" }
});

var directives_default = [...Object.keys(globals), ...Object.keys(locals)];

var import_lodash = __toESM(require("lodash.kebabcase"));
var import_plugin = __toESM(require_plugin());

function _apply(marpit) {
  const instance = new InlineStyle(marpit);
  marpit._applyInlineStyle = instance;
  marpit._inlineStyles = [];
  marpit._processMarkdown = (markdown) => instance._processMarkdown(markdown);
  marpit._renderInlineStyle = () => instance._render();
}

var apply = (0, import_plugin.default)(_apply);
var apply_default = apply;

module.exports = __toCommonJS({ apply });
0 && (module.exports = { apply });
