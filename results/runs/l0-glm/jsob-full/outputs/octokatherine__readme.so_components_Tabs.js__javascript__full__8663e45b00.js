var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (let name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, {
          get: () => from[key],
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
        });
  }
  return to;
};
var __toCommonJS = mod => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

var Tabs_exports = {};
__export(Tabs_exports, {
  default: () => Tabs_default
});
module.exports = __toCommonJS(Tabs_exports);

var Heading = ({ children, className = "" }) => {
  return React.createElement(
    "h3",
    { className: "text-lg font-semibold text-gray-900 mb-2 " + className },
    children
  );
};

var Tab = ({ children, isActive, className = "", onClick = () => null }) => {
  return React.createElement(
    "button",
    {
      onClick,
      type: "button",
      className:
        "px-4 py-2 text-sm font-medium transition-colors duration-200 " +
        (isActive ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600 hover:text-gray-900") +
        " " +
        className
    },
    children
  );
};

var ColumnHeader = { Heading, Tab };
var ColumnHeader_default = ColumnHeader;

var TAB = {
  HEADING: "heading",
  TAB: "tab",
  COLUMN: "column"
};

var Tabs = ({ selectedTab, setSelectedTab }) => {
  return React.createElement(
    "div",
    { className: "mb-4" },
    React.createElement(
      "div",
      { className: "flex space-x-4 border-b" },
      React.createElement(
        ColumnHeader_default.Tab,
        {
          isActive: selectedTab === TAB.HEADING,
          className: "px-4 py-2",
          onClick: () => setSelectedTab(TAB.HEADING)
        },
        "Heading"
      )
    ),
    React.createElement(
      "div",
      { className: "mt-4", "aria-label": "Content" },
      React.createElement(
        ColumnHeader_default.Tab,
        {
          isActive: selectedTab === TAB.TAB,
          className: "px-4 py-2",
          onClick: () => setSelectedTab(TAB.TAB)
        },
        "Tab"
      ),
      React.createElement(
        ColumnHeader_default.Heading,
        {
          isActive: selectedTab === TAB.COLUMN,
          className: "px-4 py-2",
          onClick: () => setSelectedTab(TAB.COLUMN)
        },
        "Column"
      )
    )
  );
};

var Tabs_default = Tabs;
