const { memo } = require("react");
const { useSortable } = require("@dnd-kit/sortable");
const { CSS } = require("@dnd-kit/utilities");

const FOCUSED_SECTION_STORAGE_KEY = "current-focused-slug";
const RESET_CONFIRMATION_MESSAGE =
  "The section will be reset to default template; to continue, click OK";

const SortableItem = memo(function SortableItem2(props) {
  const {
    id,
    section,
    focusedSectionSlug,
    setFocusedSectionSlug,
    onResetSection,
    onDeleteSection,
  } = props;

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const focusSection = () => {
    localStorage.setItem(FOCUSED_SECTION_STORAGE_KEY, id);
    setFocusedSectionSlug(id);
  };

  const handleDelete = (event) => {
    onDeleteSection(event, section.slug);
  };

  const handleReset = (event) => {
    const confirmed = window.confirm(RESET_CONFIRMATION_MESSAGE);
    if (confirmed === true) {
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
    "bg-white shadow rounded-md pl-1 pr-14 py-2 flex items-center " +
    "cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 " +
    "focus:ring-offset-2 focus:ring-emerald-400 relative select-none " +
    `transition-colors ${isFocused ? "ring-2 ring-emerald-400" : ""}`;

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
    React.createElement("p", null, section.name),
    isFocused &&
      React.createElement(
        React.Fragment,
        null,
        React.createElement(
          "button",
          {
            className:
              "p-2 focus:outline-none focus:ring-2 focus:ring-offset-2 " +
              "focus:ring-emerald-400 absolute right-8",
            type: "button",
            "aria-label": "Reset section",
            onClick: handleReset,
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
              "p-2 focus:outline-none focus:ring-2 focus:ring-offset-2 " +
              "focus:ring-emerald-400 absolute right-1",
            type: "button",
            "aria-label": "Delete section",
            onClick: handleDelete,
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

const exported = {};
Object.defineProperty(exported, "__esModule", { value: true });
Object.defineProperty(exported, "SortableItem", {
  enumerable: true,
  get: () => SortableItem,
});
module.exports = exported;
