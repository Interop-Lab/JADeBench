var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;

var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

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

var __toCommonJS = (mod) => __copyProps(__create(null), mod);

var require_plugin = __commonJS({
  "../work/marp-team__marpit/src/plugin.js"(exports, module) {
    "use strict";
    module.exports = function headingDividerPlugin(headingDivider) {
      return function (marpit) {
        marpit.use(headingDivider);
      };
    };
  }
});

var heading_divider_exports = {};
__export(heading_divider_exports, {
  default: () => heading_divider_default,
  headingDivider: () => headingDivider
});
module.exports = __toCommonJS(heading_divider_exports);

function split(marpit) {
  marpit.use(headingDivider);
}

var split_default = split;

var import_plugin = __toESM(require_plugin());

function _headingDivider(marpit) {
  marpit.use(headingDivider);
}

var headingDivider = import_plugin.default(_headingDivider);
var heading_divider_default = headingDivider;

0 && (module.exports = { headingDivider });
