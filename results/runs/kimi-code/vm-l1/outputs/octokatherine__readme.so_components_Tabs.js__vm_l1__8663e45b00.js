var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;

var __export = (target, all) => {
  for (var name in all) {
    __defProp(target, name, { get: all[name], enumerable: true });
  }
};

var __copyProps = (to, from, except, desc) => {
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

var __toCommonJS = (module) =>
  __copyProps(__defProp({}, "__esModule", { value: true }), module);

Object.assign(globalThis, {
  __defProp,
  __getOwnPropDesc,
  __getOwnPropNames,
  __hasOwnProp,
  __export,
  __copyProps,
  __toCommonJS,
});

var Tabs_exports = {};
globalThis.Tabs_exports = Tabs_exports;
__export(Tabs_exports, {
  default: () => Tabs_default,
});
module.exports = __toCommonJS(Tabs_exports);

const TAB_CLASS =
  "border-transparent whitespace-nowrap px-1 border-b-2 font-medium text-sm focus:outline-none";

var Heading = ({ children, className = "" }) =>
  React.createElement(
    "h3",
    {
      className: `${TAB_CLASS} \n    text-emerald-500 ${className}`,
    },
    children,
  );
globalThis.Heading = Heading;

var Tab = ({ children, isActive, className = "", onClick = () => {} }) =>
  React.createElement(
    "button",
    {
      onClick,
      type: "button",
      className: `${TAB_CLASS} \n    ${
        isActive
          ? "text-emerald-500"
          : "text-gray-500 hover:text-gray-700"
      } ${className}`,
    },
    children,
  );
globalThis.Tab = Tab;

var ColumnHeader = { Heading, Tab };
globalThis.ColumnHeader = ColumnHeader;

var ColumnHeader_default = ColumnHeader;
globalThis.ColumnHeader_default = ColumnHeader_default;

var TAB = {
  EDITOR: "editor",
  PREVIEW: "preview",
  RAW: "raw",
};
globalThis.TAB = TAB;

var Tabs = ({ selectedTab, setSelectedTab }) =>
  React.createElement(
    "div",
    { className: "flex" },
    React.createElement(
      "div",
      { className: "flex flex-0 pb-3" },
      React.createElement(
        Tab,
        {
          isActive: selectedTab === TAB.EDITOR,
          className: "flex-1",
          onClick: () => setSelectedTab(TAB.EDITOR),
        },
        "Editor",
      ),
    ),
    React.createElement(
      "div",
      { className: "flex flex-1 justify-end border-b border-gray-200" },
      React.createElement(
        "nav",
        { className: "-mb-px flex space-x-8", "aria-label": "Tabs" },
        React.createElement(
          Tab,
          {
            isActive: selectedTab === TAB.PREVIEW,
            className: "pb-3",
            onClick: () => setSelectedTab(TAB.PREVIEW),
          },
          "Preview",
        ),
        React.createElement(
          Tab,
          {
            isActive: selectedTab === TAB.RAW,
            className: "pb-3",
            onClick: () => setSelectedTab(TAB.RAW),
          },
          "Raw",
        ),
      ),
    ),
  );
globalThis.Tabs = Tabs;

var Tabs_default = Tabs;
globalThis.Tabs_default = Tabs_default;
