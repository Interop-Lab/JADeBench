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

var Heading = ({ children, className = "" }) => {
  var props = {};
  props.className = "text-lg font-semibold text-gray-900 mb-4 " + className;
  return React.createElement("h3", props, children);
};

var Tab = ({ children, isActive, className = "", onClick = () => null }) => {
  var baseClasses = "px-4 py-2 rounded-lg font-medium transition-colors duration-200 ";
  var activeClasses = "bg-blue-600 text-white hover:bg-blue-700";
  var inactiveClasses = "bg-gray-100 text-gray-700 hover:bg-gray-200";
  
  return React.createElement("button", {
    onClick: onClick,
    type: "button",
    className: baseClasses + (isActive ? activeClasses : inactiveClasses) + " " + className
  }, children);
};

var ColumnHeader = {
  Heading: Heading,
  Tab: Tab
};
var ColumnHeader_default = ColumnHeader;

var TAB = {
  OVERVIEW: "overview",
  ANALYSIS: "analysis",
  SETTINGS: "settings"
};

var Tabs = ({ selectedTab, setSelectedTab }) => {
  return React.createElement("div", { className: "w-full" },
    React.createElement("div", { className: "border-b border-gray-200" },
      React.createElement(ColumnHeader_default.Tab, {
        isActive: selectedTab === TAB.OVERVIEW,
        className: "mr-2",
        onClick: () => setSelectedTab(TAB.OVERVIEW)
      }, "Overview")
    ),
    React.createElement("div", { className: "flex space-x-1" },
      React.createElement("nav", { className: "flex space-x-1", "aria-label": "Tabs" },
        React.createElement(ColumnHeader_default.Tab, {
          isActive: selectedTab === TAB.ANALYSIS,
          className: "mr-2",
          onClick: () => setSelectedTab(TAB.ANALYSIS)
        }, "Analysis"),
        React.createElement(ColumnHeader_default.Tab, {
          isActive: selectedTab === TAB.SETTINGS,
          className: "mr-2",
          onClick: () => setSelectedTab(TAB.SETTINGS)
        }, "Settings")
      )
    )
  );
};

var Tabs_default = Tabs;
