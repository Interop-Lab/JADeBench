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

var Tabs_exports = {};
__export(Tabs_exports, {
  default: () => Tabs_default
});
module.exports = __toCommonJS(Tabs_exports);

var Heading = () => {};
var Tab = () => {};
var ColumnHeader = { Heading, Tab };
var ColumnHeader_default = ColumnHeader;
var TAB = { EDITOR: "editor", PREVIEW: "preview", RAW: "raw" };
var Tabs = () => {};
var Tabs_default = Tabs;
