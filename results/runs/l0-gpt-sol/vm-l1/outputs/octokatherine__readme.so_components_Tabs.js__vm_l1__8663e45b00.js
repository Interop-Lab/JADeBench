var Tabs_exports = {};
Object.defineProperty(Tabs_exports, "__esModule", { value: true });
Object.defineProperty(Tabs_exports, "default", {
  enumerable: true,
  get: function () {
    return Tabs;
  }
});
module.exports = Tabs_exports;

var TAB = {
  EDITOR: "editor",
  PREVIEW: "preview",
  RAW: "raw"
};

function Heading(props) {
  return React.createElement(
    "div",
    { className: "tabs-heading" },
    props.children
  );
}

function Tab(props) {
  return React.createElement(
    "button",
    {
      type: "button",
      className: props.active ? "tab active" : "tab",
      onClick: props.onClick
    },
    props.children
  );
}

var ColumnHeader = {
  Heading: Heading,
  Tab: Tab
};

function Tabs(props) {
  var activeTab =
    props.tab !== undefined
      ? props.tab
      : props.activeTab !== undefined
        ? props.activeTab
        : props.selectedTab;

  var selectTab =
    props.setTab ||
    props.setActiveTab ||
    props.onTabChange ||
    props.onChange ||
    props.onSelect;

  function select(value) {
    return function () {
      if (selectTab) {
        selectTab(value);
      }
    };
  }

  return React.createElement(
    ColumnHeader.Heading,
    null,
    React.createElement(
      ColumnHeader.Tab,
      {
        active: activeTab === TAB.EDITOR,
        onClick: select(TAB.EDITOR)
      },
      "Editor"
    ),
    React.createElement(
      ColumnHeader.Tab,
      {
        active: activeTab === TAB.PREVIEW,
        onClick: select(TAB.PREVIEW)
      },
      "Preview"
    ),
    React.createElement(
      ColumnHeader.Tab,
      {
        active: activeTab === TAB.RAW,
        onClick: select(TAB.RAW)
      },
      "Raw"
    )
  );
}
