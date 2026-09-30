"use strict";

const { memo } = require("react");
const { useSortable } = require("@dnd-kit/sortable");
const { CSS } = require("@dnd-kit/utilities");

const ITEM_CLASS =
  "bg-white shadow rounded-md pl-1 pr-14 py-2 flex items-center " +
  "cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 " +
  "focus:ring-offset-2 focus:ring-emerald-400 relative select-none " +
  "transition-colors ";
const FOCUSED_CLASS = "ring-2 ring-emerald-400";
const DRAG_BUTTON_CLASS =
  "p-2 -m-1 mr-1 focus:outline-none focus:ring-2 focus:ring-offset-2 " +
  "focus:ring-emerald-400";
const ACTION_BUTTON_CLASS =
  "p-2 focus:outline-none focus:ring-2 focus:ring-offset-2 " +
  "focus:ring-emerald-400 absolute";
const ICON_CLASS = "w-5 h-5";

const SortableItem = memo(function SortableItem2(props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: props.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const focusSection = () => {
    localStorage.setItem("current-focused-slug", props.id);
    props.setFocusedSectionSlug(props.id);
  };

  const handleDelete = (event) => {
    props.onDeleteSection(event, props.section.slug);
  };

  const handleReset = (event) => {
    const confirmed = window.confirm(
      "The section will be reset to default template; to continue, click OK",
    );
    if (confirmed === true) {
      props.onResetSection(event, props.section.slug);
    }
  };

  const handleKeyUp = (event) => {
    if (event.key.toLowerCase() === "enter") {
      focusSection();
    }
  };

  return React.createElement(
    "li",
    {
      ref: setNodeRef,
      style,
      ...attributes,
      onClick: focusSection,
      onKeyUp: handleKeyUp,
      className:
        ITEM_CLASS +
        (props.section.slug === props.focusedSectionSlug ? FOCUSED_CLASS : ""),
    },
    React.createElement(
      "button",
      {
        type: "button",
        className: DRAG_BUTTON_CLASS,
        ...listeners,
      },
      React.createElement("img", {
        className: ICON_CLASS,
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
            className: `${ACTION_BUTTON_CLASS} right-8`,
            type: "button",
            "aria-label": "Reset section",
            onClick: handleReset,
          },
          React.createElement("img", {
            className: ICON_CLASS,
            src: "reset.svg",
            alt: "Reset section",
          }),
        ),
        React.createElement(
          "button",
          {
            className: `${ACTION_BUTTON_CLASS} right-1`,
            type: "button",
            "aria-label": "Delete section",
            onClick: handleDelete,
          },
          React.createElement("img", {
            className: ICON_CLASS,
            src: "trash.svg",
            alt: "Delete section",
          }),
        ),
      ),
  );
});

Object.defineProperty(module.exports, "__esModule", { value: true });
Object.defineProperty(module.exports, "SortableItem", {
  enumerable: true,
  get: () => SortableItem,
});
