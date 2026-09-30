var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// ../work/octokatherine__readme.so/components/SortableItem.js
var SortableItem_exports = {};
__export(SortableItem_exports, {
  SortableItem: () => SortableItem
});
module.exports = __toCommonJS(SortableItem_exports);
var import_react = require("react");
var import_sortable = require("@dnd-kit/sortable");
var import_utilities = require("@dnd-kit/utilities");
var SortableItem = (0, import_react.memo)(function SortableItem2(props) {
  const { attributes, listeners, setNodeRef, transform, transition } = (0, import_sortable.useSortable)({ id: props.id });
  const style = {
    transform: import_utilities.CSS.Transform.toString(transform),
    transition
  };
  const onClickSection = () => {
    localStorage.setItem("current-focused-slug", props.id);
    props.setFocusedSectionSlug(props.id);
  };
  const onClickTrash = (e) => {
    props.onDeleteSection(e, props.section.slug);
  };
  const onClickReset = (e) => {
    const sectionResetConfirmed = window.confirm(
      "The section will be reset to default template; to continue, click OK"
    );
    if (sectionResetConfirmed === true) {
      props.onResetSection(e, props.section.slug);
    }
  };
  const onKeyUp = (e) => {
    if (e.key.toLowerCase() === "enter") {
      onClickSection();
    }
  };
  return /* @__PURE__ */ React.createElement(
    "li",
    {
      ref: setNodeRef,
      style,
      ...attributes,
      onClick: onClickSection,
      onKeyUp,
      className: `bg-white shadow rounded-md pl-1 pr-14 py-2 flex items-center cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 relative select-none transition-colors ${props.section.slug === props.focusedSectionSlug ? "ring-2 ring-emerald-400" : ""}`
    },
    /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: "p-2 -m-1 mr-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400",
        ...listeners
      },
      /* @__PURE__ */ React.createElement("img", { className: "w-5 h-5", src: "drag.svg", alt: "Drag to reorder" })
    ),
    /* @__PURE__ */ React.createElement("p", null, props.section.name),
    props.section.slug === props.focusedSectionSlug && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
      "button",
      {
        className: "p-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 absolute right-8",
        type: "button",
        "aria-label": "Reset section",
        onClick: onClickReset
      },
      /* @__PURE__ */ React.createElement("img", { className: "w-auto h-5", src: "reset.svg", alt: "Reset section" })
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        className: "p-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 absolute right-1",
        type: "button",
        "aria-label": "Delete section",
        onClick: onClickTrash
      },
      /* @__PURE__ */ React.createElement("img", { className: "w-auto h-5", src: "trash.svg", alt: "Delete section" })
    ))
  );
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  SortableItem
});
