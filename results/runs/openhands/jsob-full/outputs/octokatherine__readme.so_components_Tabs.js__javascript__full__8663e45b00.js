const BASE_TAB_CLASS =
  "border-transparent whitespace-nowrap px-1 border-b-2 font-medium text-sm focus:outline-none \n    ";

const Heading = ({ children, className = "" }) =>
  React.createElement(
    "h3",
    { className: `${BASE_TAB_CLASS}text-emerald-500 ${className}` },
    children,
  );

const Tab = ({
  children,
  isActive,
  className = "",
  onClick = () => null,
}) =>
  React.createElement(
    "button",
    {
      onClick,
      type: "button",
      className: `${BASE_TAB_CLASS}${
        isActive ? "text-emerald-500" : "text-gray-500 hover:text-gray-700"
      } ${className}`,
    },
    children,
  );

const ColumnHeader = { Heading, Tab };

const TAB = {
  EDITOR: "editor",
  PREVIEW: "preview",
  RAW: "raw",
};

const Tabs = ({ selectedTab, setSelectedTab }) =>
  React.createElement(
    "div",
    { className: "flex" },
    React.createElement(
      "div",
      { className: "flex flex-0 pb-3" },
      React.createElement(
        ColumnHeader.Tab,
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
          ColumnHeader.Tab,
          {
            isActive: selectedTab === TAB.PREVIEW,
            className: "pb-3",
            onClick: () => setSelectedTab(TAB.PREVIEW),
          },
          "Preview",
        ),
        React.createElement(
          ColumnHeader.Tab,
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

const tabsExports = {};
Object.defineProperty(tabsExports, "__esModule", { value: true });
Object.defineProperty(tabsExports, "default", {
  enumerable: true,
  get: () => Tabs,
});
module.exports = tabsExports;
