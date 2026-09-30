const __create = Object.create;
const __defProp = Object.defineProperty;
const __getOwnPropDesc = Object.getOwnPropertyDescriptor;
const __getOwnPropNames = Object.getOwnPropertyNames;
const __getProtoOf = Object.getPrototypeOf;
const __hasOwnProp = Object.prototype.hasOwnProperty;

const __commonJS = (cb, mod) => function __require() {
  const module = {};
  (mod || (0, cb[__getOwnPropNames(cb)[0]]))((mod = module), module);
  return module.exports;
};

const __export = (target, all) => {
  for (const name in all) {
    __defProp(target, name, { get: all[name], enumerable: true });
  }
};

const __copyProps = (to, from, except, desc) => {
  if (from && (typeof from === "object" || typeof from === "function")) {
    for (const key of __getOwnPropNames(from)) {
      if (!__hasOwnProp.call(to, key) && key !== except) {
        __defProp(to, key, {
          get: () => from[key],
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable,
        });
      }
    }
  }
  return to;
};

const __toESM = (mod, isNodeMode, target) => (
  target = mod != null ? __create(__getProtoOf(mod)) : {},
  __copyProps(
    isNodeMode || !mod || !mod.__esModule
      ? __defProp(target, "default", { value: mod, enumerable: true })
      : target,
    mod
  )
);

const __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

const require_plugin = __commonJS({
  "../work/marp-team__marpit/src/plugin.js"(exports, module) {
    const messages = {
      "0": "Marpit plugin requires a function or object with a `name` property.",
      "1": "name",
      "2": "plugin",
      "3": "Marpit plugin requires a function or object.",
    };

    function plugin(instance) {
      const message = { "0": messages["0"] };
      return function (target, ...args) {
        if (target[plugin.name]) {
          return instance[plugin.name](this, target, ...args);
        }
        throw new Error(message["0"]);
      };
    }

    Object.defineProperty(plugin, messages["1"], { value: true });
    Object.defineProperty(plugin, messages["2"], { value: plugin });
    Object.defineProperty(plugin, messages["3"], { value: plugin });
    module.exports = plugin;
  },
});

const heading_divider_exports = {};
__export(heading_divider_exports, {
  default: () => heading_divider_default,
  headingDivider: () => headingDivider,
});
module.exports = __toCommonJS(heading_divider_exports);

function split(input, predicate, keepSeparator = false) {
  const result = [[]];
  for (const item of input) {
    if (predicate(item)) {
      result.push(keepSeparator ? [item] : []);
    } else {
      result[result.length - 1].push(item);
    }
  }
  return result;
}

const split_default = split;
const import_plugin = __toESM(require_plugin());

function _headingDivider(marpit) {
  const { marpit: instance } = marpit;
  marpit.themeSet.meta.register("heading-divider", "Heading Divider", (meta) => {
    let headingDivider = instance.themeSet.meta.headingDivider;
    if (
      instance.themeSet.meta.headingDivider &&
      Object.prototype.hasOwnProperty.call(
        instance.themeSet.meta.headingDivider,
        "default"
      )
    ) {
      headingDivider = instance.themeSet.meta.headingDivider.default;
    }

    if (meta.inherit || headingDivider === false) return;

    if (
      Number.isInteger(headingDivider) &&
      headingDivider >= 1 &&
      headingDivider <= 6
    ) {
      headingDivider = [...Array(headingDivider).keys()].map((i) => i + 1);
    }

    if (!Array.isArray(headingDivider)) return;

    const headingLevels = headingDivider.map((level) => "h" + level);
    const isHeading = (token) =>
      token.type === "heading_open" && headingLevels.includes(token.tag);

    const newTokens = [];
    for (const group of split(meta.tokens, isHeading, true)) {
      const [first] = group;
      if (first && isHeading(first) && newTokens.some((token) => !token.hidden)) {
        const hr = new meta.constructor("hr", "", 0);
        hr.hidden = true;
        hr.meta = first.meta;
        newTokens.push(hr);
      }
      newTokens.push(...group);
    }
    meta.tokens = newTokens;
  });
}

const headingDivider = (0, import_plugin.default)(_headingDivider);
const heading_divider_default = headingDivider;

module.exports = { headingDivider };
