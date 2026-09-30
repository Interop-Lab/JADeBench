"use strict";

const TAB = {
  EDITOR: "editor",
  PREVIEW: "preview",
  RAW: "raw",
};

const TAB_CLASS =
  "border-transparent whitespace-nowrap px-1 border-b-2 font-medium text-sm focus:outline-none";
const ACTIVE_TAB_CLASS = "text-emerald-500";
const INACTIVE_TAB_CLASS = "text-gray-500 hover:text-gray-700";

function Tab({
  children,
  isActive,
  className = "",
  onClick = () => null,
}) {
  const stateClass = isActive ? ACTIVE_TAB_CLASS : INACTIVE_TAB_CLASS;

  return React.createElement(
    "button",
    {
      onClick,
      type: "button",
      className: `${TAB_CLASS} \n    ${stateClass} ${className}`,
    },
    children,
  );
}

function Tabs({ selectedTab, setSelectedTab }) {
  return React.createElement(
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
}

Object.defineProperty(module.exports, "__esModule", { value: true });
Object.defineProperty(module.exports, "default", {
  enumerable: true,
  get: () => Tabs,
});
