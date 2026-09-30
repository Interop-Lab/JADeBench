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

// ../work/octokatherine__readme.so/components/Tabs.js
var Tabs_exports = {};
__export(Tabs_exports, {
  default: () => Tabs_default
});
module.exports = __toCommonJS(Tabs_exports);

// ../work/octokatherine__readme.so/components/ColumnHeader.js
var Heading = ({ children, className = "" }) => {
  return /* @__PURE__ */ React.createElement(
    "h3",
    {
      className: `border-transparent whitespace-nowrap px-1 border-b-2 font-medium text-sm focus:outline-none 
    text-emerald-500 ${className}`
    },
    children
  );
};
var Tab = ({ children, isActive, className = "", onClick = () => null }) => {
  return /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick,
      type: "button",
      className: `border-transparent whitespace-nowrap px-1 border-b-2 font-medium text-sm focus:outline-none 
    ${isActive ? "text-emerald-500" : "text-gray-500 hover:text-gray-700"} ${className}`
    },
    children
  );
};
var ColumnHeader = {
  Heading,
  Tab
};
var ColumnHeader_default = ColumnHeader;

// ../work/octokatherine__readme.so/utils/constants.js
var TAB = {
  EDITOR: "editor",
  PREVIEW: "preview",
  RAW: "raw"
};

// ../work/octokatherine__readme.so/components/Tabs.js
var Tabs = ({ selectedTab, setSelectedTab }) => {
  return /* @__PURE__ */ React.createElement("div", { className: "flex" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-0 pb-3" }, /* @__PURE__ */ React.createElement(
    ColumnHeader_default.Tab,
    {
      isActive: selectedTab === TAB.EDITOR,
      className: "flex-1",
      onClick: () => setSelectedTab(TAB.EDITOR)
    },
    "Editor"
  )), /* @__PURE__ */ React.createElement("div", { className: "flex flex-1 justify-end border-b border-gray-200" }, /* @__PURE__ */ React.createElement("nav", { className: "-mb-px flex space-x-8", "aria-label": "Tabs" }, /* @__PURE__ */ React.createElement(
    ColumnHeader_default.Tab,
    {
      isActive: selectedTab === TAB.PREVIEW,
      className: "pb-3",
      onClick: () => setSelectedTab(TAB.PREVIEW)
    },
    "Preview"
  ), /* @__PURE__ */ React.createElement(
    ColumnHeader_default.Tab,
    {
      isActive: selectedTab === TAB.RAW,
      className: "pb-3",
      onClick: () => setSelectedTab(TAB.RAW)
    },
    "Raw"
  ))));
};
var Tabs_default = Tabs;
