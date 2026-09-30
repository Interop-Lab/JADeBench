var __create = Object.create,
  __defProp = Object.defineProperty,
  __getOwnPropDesc = Object.getOwnPropertyDescriptor,
  __getOwnPropNames = Object.getOwnPropertyNames,
  __getProtoOf = Object.getPrototypeOf;

var __hasOwnProp = Object.prototype.hasOwnProperty,
  __commonJS = (cb, mod) =>
    function __require() {
      return (
        mod ||
          (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod),
        mod.exports
      );
    };

var __export = (target, all) => {
  for (let name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
  };

var __copyProps = (to, from, except, desc) => {
  if (from && (typeof from === "object" || typeof from === "function")) {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, {
          get: () => from[key],
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable,
        });
  }
  return to;
};

var __toESM = (mod, isNodeMode, target) =>
  (
    (target = mod != null ? __create(__getProtoOf(mod)) : {}),
    __copyProps(
      isNodeMode || !mod || !mod.__esModule
        ? __defProp(target, "default", { value: mod, enumerable: true })
        : target,
      mod
    )
  );

var __toCommonJS = (mod) =>
  __copyProps(__defProp({}, "__esModule", { value: true }), mod);

var require_plugin = __commonJS({
  "../work/marp-team__marpit/src/plugin.js"(exports, module) {
    function createPlugin(plugin) {
      const marpitPlugin = function (marpit, ...args) {
        if (marpit[Symbol.for("marpit:plugin:arguments")])
          return plugin.call(this, marpit, ...args);
        throw new Error("The passed arguments are not for Marpit plugin.");
      };

      Object.defineProperty(marpitPlugin, "name", { value: plugin.name });
      Object.defineProperty(marpitPlugin, "marpitPlugin", { value: marpitPlugin });
      Object.defineProperty(marpitPlugin, "marpitPluginFactory", { value: marpitPlugin });

      module.exports = marpitPlugin;
    }

    createPlugin.createPlugin = createPlugin;
    module.exports = createPlugin;
  },
});

var heading_divider_exports = {};
var heading_divider_default_export = {};

function split(tokens, heading, flat = false) {
  const result = [[]];

  for (const token of tokens) {
    if (heading === token) {
      result.push(flat ? [token] : []);
    } else {
      result[result.length - 1].push(token);
    }
  }

  return result;
}

var split_default = split;
var import_plugin = __toESM(require_plugin());

function _headingDivider(opts) {
  const { marpit } = opts;

  opts.marpit.markdown.use(
    (md) => {
      let headingDivider = marpit.options.headingDivider;

      if (marpit.options.globalDirectives && Object.prototype.hasOwnProperty.call(marpit.options.globalDirectives, "headingDivider")) {
        headingDivider = marpit.options.globalDirectives.headingDivider;
      }

      if (md.options.disableHtml || headingDivider === false) return;

      if (Number.isInteger(headingDivider) && headingDivider >= 1 && headingDivider <= 6) {
        headingDivider = [...Array(headingDivider).keys()].map((i) => i + 1);
      }

      if (!Array.isArray(headingDivider)) return;

      const headingLevels = headingDivider.map((h) => "h" + h);
      const isHeading = (token) => token.type === "heading_open" && headingLevels.includes(token.tag);
      const newTokens = [];

      for (const tokensChunk of split(tokens, isHeading, true)) {
        const [first] = tokensChunk;

        if (first && isHeading(first) && newTokens.some((t) => !t.hidden)) {
          const hr = new tokens.State.Token("hr", "", 0);
          hr.hidden = true;
          hr.map = first.map;
          newTokens.push(hr);
        }

        newTokens.push(...tokensChunk);
      }

      tokens = newTokens;
    }
  );
}

var headingDivider = (0, import_plugin.default)(_headingDivider);
var heading_divider_default = headingDivider;

heading_divider_default_export.default = () => heading_divider_default;
heading_divider_default_export.headingDivider = () => headingDivider;

__export(heading_divider_exports, heading_divider_default_export);

module.exports = __toCommonJS(heading_divider_exports);

var heading_divider_module_export = {};
heading_divider_module_export.headingDivider = headingDivider;
module.exports = heading_divider_module_export;
