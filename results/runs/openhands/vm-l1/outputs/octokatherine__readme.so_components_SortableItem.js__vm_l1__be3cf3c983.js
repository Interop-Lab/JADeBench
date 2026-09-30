var SortableItem;

Object.defineProperty(module.exports, "__esModule", { value: true });
Object.defineProperty(module.exports, "SortableItem", {
  enumerable: true,
  get: () => SortableItem,
});

var React = require("react");
var sortable = require("@dnd-kit/sortable");
var sortableUtilities = require("@dnd-kit/utilities");

SortableItem = (0, React.memo)(function SortableItem2(props) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    (0, sortable.useSortable)({ id: props.id });

  const style = {
    transform: sortableUtilities.CSS.Transform.toString(transform),
    transition,
  };

  const focusSection = () => {
    localStorage.setItem("current-focused-slug", props.id);
    props.setFocusedSectionSlug(props.id);
  };

  const deleteSection = (event) => {
    props.onDeleteSection(event, props.section.slug);
  };

  const resetSection = (event) => {
    if (
      window.confirm(
        "The section will be reset to default template; to continue, click OK",
      ) === true
    ) {
      props.onResetSection(event, props.section.slug);
    }
  };

  const focusOnEnter = (event) => {
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
      onKeyUp: focusOnEnter,
      className:
        "bg-white shadow rounded-md pl-1 pr-14 py-2 flex items-center cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 relative select-none transition-colors " +
        (props.section.slug === props.focusedSectionSlug
          ? "ring-2 ring-emerald-400"
          : ""),
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
    React.createElement("p", null, props.section.name),
    props.section.slug === props.focusedSectionSlug &&
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
