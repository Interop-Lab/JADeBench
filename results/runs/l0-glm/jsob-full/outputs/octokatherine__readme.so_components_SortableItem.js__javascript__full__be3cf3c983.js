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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

var SortableItem_exports = {};
var _0x50d5a3 = {};
_0x50d5a3["default"] = () => SortableItem;
__export(SortableItem_exports, _0x50d5a3);
module.exports = __toCommonJS(SortableItem_exports);

var import_react = require("react");
var import_sortable = require("@dnd-kit/sortable");
var import_utilities = require("@dnd-kit/utilities");

var SortableItem = (0, import_react.memo)(function SortableItem2(props) {
  var _0x21e4c5 = {};
  _0x21e4c5["id"] = props["id"];

  const { attributes: attributes, listeners: listeners, setNodeRef: setNodeRef, transform: transform, transition: transition } = (0, import_sortable.useSortable)(_0x21e4c5);

  const style = {
    transform: import_utilities.CSS.Transform.toString(transform),
    transition: transition
  };

  const handleClick = () => {
    localStorage.setItem("selectedWidget", props["id"]);
    props["onWidgetClick"](props["id"]);
  };

  const handleDeleteClick = (event) => {
    props["onDeleteWidget"](event, props["widget"]["id"]);
  };

  const handleSettingsClick = (event) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this widget?");
    if (confirmDelete === true) {
      props["onDeleteWidget"](event, props["widget"]["id"]);
    }
  };

  const handleKeyUp = (event) => {
    if (event["key"].toLowerCase() === "enter") {
      handleClick();
    }
  };

  return React.createElement("li", {
    ref: setNodeRef,
    style: style,
    ...attributes,
    onClick: handleClick,
    onKeyUp: handleKeyUp,
    className: "widget-item" + (props["widget"]["isDragging"] === props["widget"]["isDragging"] ? " dragging" : "")
  },
    React.createElement("button", {
      type: "button",
      className: "drag-handle",
      ...listeners
    },
      React.createElement("img", {
        className: "drag-handle-icon",
        src: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjEiLz48L3N2Zz4=",
        alt: "Drag"
      })
    ),
    React.createElement("p", null, props["widget"]["name"]),
    props["widget"]["isDragging"] === props["widget"]["isDragging"] && React.createElement(React.Fragment, null,
      React.createElement("button", {
        className: "settings-button",
        type: "button",
        "aria-label": "Settings",
        onClick: handleSettingsClick
      },
        React.createElement("img", {
          className: "settings-icon",
          src: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjEiLz48L3N2Zz4=",
          alt: "Settings"
        })
      ),
      React.createElement("button", {
        className: "delete-button",
        type: "button",
        "aria-label": "Delete",
        onClick: handleDeleteClick
      },
        React.createElement("img", {
          className: "delete-icon",
          src: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjEiLz48L3N2Zz4=",
          alt: "Delete"
        })
      )
    )
  );
});

var _0x4ca4ab = {};
_0x4ca4ab["default"] = SortableItem;
0x1013 * -0x1 + 0x9a4 + -0x1 * -0x66f && (module["exports"] = _0x4ca4ab);
