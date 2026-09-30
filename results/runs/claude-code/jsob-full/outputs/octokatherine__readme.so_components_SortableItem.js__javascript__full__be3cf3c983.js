const React = require("react");
const { useSortable } = require("@dnd-kit/sortable");
const { CSS } = require("@dnd-kit/utilities");

const SortableItem = React.memo(function SortableItem({
  id,
  section,
  focusedSectionSlug,
  setFocusedSectionSlug,
  onResetSection,
  onDeleteSection,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const focusSection = () => {
    localStorage.setItem("current-focused-slug", id);
    setFocusedSectionSlug(id);
  };

  const deleteSection = (event) => {
    onDeleteSection(event, section.slug);
  };

  const resetSection = (event) => {
    const confirmed = window.confirm(
      "The section will be reset to default template; to continue, click OK",
    );

    if (confirmed) {
      onResetSection(event, section.slug);
    }
  };

  const handleKeyUp = (event) => {
    if (event.key.toLowerCase() === "enter") {
      focusSection();
    }
  };

  const isFocused = section.slug === focusedSectionSlug;
  const itemClassName =
    "bg-white shadow rounded-md pl-1 pr-14 py-2 flex items-center cursor-pointer " +
    "hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 " +
    "focus:ring-emerald-400 relative select-none transition-colors " +
    (isFocused ? "ring-2 ring-emerald-400" : "");

  return React.createElement(
    "li",
    {
      ref: setNodeRef,
      style,
      ...attributes,
      onClick: focusSection,
      onKeyUp: handleKeyUp,
      className: itemClassName,
    },
    React.createElement(
      "button",
      {
        type: "button",
        className:
          "p-2 -m-1 mr-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400",
        ...listeners,
      },
      React.createElement("img", {
        className: "w-5 h-5",
        src: "drag.svg",
        alt: "Drag to reorder",
      }),
    ),
    React.createElement("p", null, section.name),
    isFocused &&
      React.createElement(
        React.Fragment,
        null,
        React.createElement(
          "button",
          {
            className:
              "p-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 absolute right-8",
            type: "button",
            "aria-label": "Reset section",
            onClick: resetSection,
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
            className:
              "p-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 absolute right-1",
            type: "button",
            "aria-label": "Delete section",
            onClick: deleteSection,
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

Object.defineProperty(exports, "__esModule", { value: true });
Object.defineProperty(exports, "SortableItem", {
  enumerable: true,
  get: () => SortableItem,
});
