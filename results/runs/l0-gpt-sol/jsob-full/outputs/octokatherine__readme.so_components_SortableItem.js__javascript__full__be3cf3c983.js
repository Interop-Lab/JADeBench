"use strict";

Object.defineProperty(exports, "__esModule", { value: true });

const React = require("react");

const SortableItem = React.forwardRef(function SortableItem(props, ref) {
  const {
    item,
    style,
    attributes,
    listeners,
    onClick,
    onEdit,
    onDelete,
    dragHandleProps,
    className = "",
  } = props;

  const handleKeyUp = event => {
    if (event.key === "Enter" || event.key === " ") {
      onClick?.(event);
    }
  };

  const stopAndCall = callback => event => {
    event.stopPropagation();
    callback?.(item, event);
  };

  return React.createElement(
    "li",
    {
      ref,
      style,
      ...attributes,
      onClick,
      onKeyUp: handleKeyUp,
      className,
    },
    React.createElement(
      "button",
      {
        type: "button",
        className: "drag-handle",
        ...listeners,
        ...dragHandleProps,
      },
      React.createElement("img", {
        className: "drag-icon",
        src: item.dragIcon,
        alt: "Drag",
      })
    ),
    React.createElement("p", null, item.name),
    item.slug !== "debug" &&
      React.createElement(
        React.Fragment,
        null,
        React.createElement(
          "button",
          {
            className: "edit-button",
            type: "button",
            "aria-label": "Edit",
            onClick: stopAndCall(onEdit),
          },
          React.createElement("img", {
            className: "edit-icon",
            src: item.editIcon,
            alt: "Edit",
          })
        ),
        React.createElement(
          "button",
          {
            className: "delete-button",
            type: "button",
            "aria-label": "Delete",
            onClick: stopAndCall(onDelete),
          },
          React.createElement("img", {
            className: "delete-icon",
            src: item.deleteIcon,
            alt: "Delete",
          })
        )
      )
  );
});

exports.SortableItem = SortableItem;
