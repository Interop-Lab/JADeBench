const headingDivider = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // ../work/marp-team__marpit/src/plugin.js
  var plugin_exports = {};
  __export(plugin_exports, {
    default: () => plugin_default
  });

  // ../work/marp-team__marpit/src/plugin.js
  var plugin_default = class {
    constructor(markdown) {
      this.markdown = markdown;
    }
    get markdownItPlugins() {
      return [];
    }
  };

  // ../work/marp-team__marpit/src/heading_divider/heading_divider.js
  var heading_divider_exports = {};
  __export(heading_divider_exports, {
    default: () => heading_divider_default,
    headingDivider: () => headingDivider
  });

  // ../work/marp-team__marpit/src/heading_divider/heading_divider.js
  var split = (markdown, { divider }) => {
    const splitted = markdown.split(divider);
    return splitted;
  };
  var import_plugin = __toCommonJS(plugin_exports);
  var headingDivider = (0, import_plugin.default)(class extends import_plugin.default {
    constructor(markdown) {
      super(markdown);
      this.name = "headingDivider";
    }
    get markdownItPlugins() {
      return [];
    }
    split(text) {
      return split(text, { divider: this.options.divider });
    }
  });
  var heading_divider_default = headingDivider;
  return __toCommonJS(heading_divider_exports);
})();
