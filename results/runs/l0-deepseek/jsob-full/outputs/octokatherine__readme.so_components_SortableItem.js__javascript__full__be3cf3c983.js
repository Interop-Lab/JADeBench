const __defProp = Object.defineProperty;
const __getOwnPropDesc = Object.getOwnPropertyDescriptor;
const __getOwnPropNames = Object.getOwnPropertyNames;
const __hasOwnProp = Object.prototype.hasOwnProperty;

const __export = (target, all) => {
  for (const name in all) {
    __defProp(target, name, { get: all[name], enumerable: true });
  }
};

const __copyProps = (to, from, except, desc) => {
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

const __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

const SortableItem_exports = {};
__export(SortableItem_exports, { SortableItem: () => SortableItem });
module.exports = __toCommonJS(SortableItem_exports);

const import_react = require("react");
const import_sortable = require("@dnd-kit/sortable");
const import_utilities = require("@dnd-kit/utilities");

const SortableItem = import_react.memo(function SortableItem2(props) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    import_sortable.useSortable({ id: props.id });

  const style = {
    transform: import_utilities.CSS.Transform.toString(transform),
    transition,
  };

  const handleClick = () => {
    localStorage.setItem("selectedItemId", props.id);
    props.onSelectItem(props.id);
  };

  const handleRemove = (event) => {
    props.onRemoveItem(event, props.item.id);
  };

  const handleDuplicate = (event) => {
    if (window.confirm("Are you sure you want to duplicate this item?")) {
      props.onDuplicateItem(event, props.item.id);
    }
  };

  const handleKeyUp = (event) => {
    if (event.target.tagName.toLowerCase() === "button") {
      handleClick();
    }
  };

  return React.createElement(
    "li",
    {
      ref: setNodeRef,
      style,
      ...attributes,
      onClick: handleClick,
      onKeyUp: handleKeyUp,
      className:
        "sortable-item" +
        (props.item.id === props.selectedItemId ? " selected" : ""),
    },
    React.createElement(
      "button",
      { type: "button", className: "drag-handle", ...listeners },
      React.createElement("img", {
        className: "drag-icon",
        src: "/icons/drag.svg",
        alt: "Drag",
      })
    ),
    React.createElement("p", null, props.item.title),
    props.item.id === props.selectedItemId &&
      React.createElement(
        React.Fragment,
        null,
        React.createElement(
          "button",
          {
            className: "item-action",
            type: "button",
            "aria-label": "Duplicate",
            onClick: handleDuplicate,
          },
          React.createElement("img", {
            className: "action-icon",
            src: "/icons/duplicate.svg",
            alt: "Duplicate",
          })
        ),
        React.createElement(
          "button",
          {
            className: "item-action",
            type: "button",
            "aria-label": "Remove",
            onClick: handleRemove,
          },
          React.createElement("img", {
            className: "action-icon",
            src: "/icons/remove.svg",
            alt: "Remove",
          })
        )
      )
  );
});

module.exports = SortableItem_exports;
