"use strict";

var SortableItem;

var sortableItemExports = {};
Object.defineProperty(sortableItemExports, "__esModule", { value: true });
Object.defineProperty(sortableItemExports, "SortableItem", {
  enumerable: true,
  get: function () {
    return SortableItem;
  },
});
module.exports = sortableItemExports;

var react = require("react");
var sortable = require("@dnd-kit/sortable");
var utilities = require("@dnd-kit/utilities");

var itemClassName =
  "bg-white shadow rounded-md pl-1 pr-14 py-2 flex items-center " +
  "cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 " +
  "focus:ring-offset-2 focus:ring-emerald-400 relative select-none " +
  "transition-colors ";
var focusedItemClassName = "ring-2 ring-emerald-400";
var controlClassName =
  "p-2 focus:outline-none focus:ring-2 focus:ring-offset-2 " +
  "focus:ring-emerald-400 absolute";

SortableItem = (0, react.memo)(function SortableItemComponent(props) {
  var sortableItem = (0, sortable.useSortable)({ id: props.id });
  var attributes = sortableItem.attributes;
  var listeners = sortableItem.listeners;
  var setNodeRef = sortableItem.setNodeRef;
  var transform = sortableItem.transform;
  var transition = sortableItem.transition;

  var style = {
    transform: utilities.CSS.Transform.toString(transform),
    transition: transition,
  };

  return React.createElement(
    "li",
    {
      ref: setNodeRef,
      style: style,
      ...attributes,
      className:
        itemClassName +
        (props.section.slug === props.focusedSectionSlug
          ? focusedItemClassName
          : ""),
    },
    React.createElement(
      "button",
      {
        type: "button",
        className:
          "p-2 -m-1 mr-1 focus:outline-none focus:ring-2 " +
          "focus:ring-offset-2 focus:ring-emerald-400",
        ...listeners,
      },
      React.createElement("img", {
        className: "w-5 h-5",
        src: "drag.svg",
        alt: "Drag to reorder",
      }),
    ),
    React.createElement("p", null, props.section.name),
    props.section.slug === props.focusedSectionSlug &&
      React.createElement(
        React.Fragment,
        null,
        React.createElement(
          "button",
          {
            className: controlClassName + " right-8",
            type: "button",
            "aria-label": "Reset section",
          },
          React.createElement("img", {
            className: "w-auto h-5",
            src: "reset.svg",
            alt: "Reset section",
          }),
        ),
        React.createElement(
          "button",
          {
            className: controlClassName + " right-1",
            type: "button",
            "aria-label": "Delete section",
          },
          React.createElement("img", {
            className: "w-auto h-5",
            src: "trash.svg",
            alt: "Delete section",
          }),
        ),
      ),
  );
});
