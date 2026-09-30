var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;

var __export = (target, exports) => {
  for (var name in exports) {
    __defProp(target, name, {
      get: exports[name],
      enumerable: true,
    });
  }
};

var __copyProps = (target, source, except, descriptor) => {
  if (source && (typeof source === "object" || typeof source === "function")) {
    for (let key of __getOwnPropNames(source)) {
      if (!__hasOwnProp.call(target, key) && key !== except) {
        __defProp(target, key, {
          get: () => source[key],
          enumerable:
            !(descriptor = __getOwnPropDesc(source, key)) || descriptor.enumerable,
        });
      }
    }
  }

  return target;
};

var __toCommonJS = (moduleValue) =>
  __copyProps(__defProp({}, "__esModule", { value: true }), moduleValue);

var Tabs_exports = {};
__export(Tabs_exports, {
  default: () => Tabs_default,
});
module.exports = __toCommonJS(Tabs_exports);

var baseClassName =
  "border-transparent whitespace-nowrap px-1 border-b-2 font-medium text-sm focus:outline-none";

var Heading = ({ children, className = "" }) =>
  React.createElement(
    "h3",
    {
      className: `${baseClassName} \n    text-emerald-500 ${className}`,
    },
    children,
  );

var Tab = ({ children, isActive, className = "", onClick }) =>
  React.createElement(
    "button",
    {
      onClick,
      type: "button",
      className: `${baseClassName} \n    ${
        isActive
          ? "text-emerald-500"
          : "text-gray-500 hover:text-gray-700"
      } ${className}`,
    },
    children,
  );

var ColumnHeader = { Heading, Tab };
var ColumnHeader_default = ColumnHeader;

var TAB = {
  EDITOR: "editor",
  PREVIEW: "preview",
  RAW: "raw",
};

var Tabs = ({ selectedTab, setSelectedTab }) =>
  React.createElement(
    "div",
    { className: "flex" },
    React.createElement(
      "div",
      { className: "flex flex-0 pb-3" },
      React.createElement(
        ColumnHeader_default.Tab,
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
          ColumnHeader_default.Tab,
          {
            isActive: selectedTab === TAB.PREVIEW,
            className: "pb-3",
            onClick: () => setSelectedTab(TAB.PREVIEW),
          },
          "Preview",
        ),
        React.createElement(
          ColumnHeader_default.Tab,
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

var Tabs_default = Tabs;
