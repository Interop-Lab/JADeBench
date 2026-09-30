var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (let name in all)
    __defProp(target, name, { get: all[name], enumerable: true, configurable: true });
};
var __copyProps = (to, from, except, desc) => {
  if ((from && typeof from === "object") || typeof from === "function") {
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

// src/SectionsColumn.ts
var SectionsColumn_exports = {};
__export(SectionsColumn_exports, {
  SectionsColumn: () => SectionsColumn
});
module.exports = __toCommonJS(SectionsColumn_exports);
var import_react = require("react");
function useLocalStorage() {
  const [value, setValue] = (0, import_react.useState)(null);
  const [loaded, setLoaded] = (0, import_react.useState)(false);
  (0, import_react.useEffect)(() => {
    try {
      const item = localStorage.getItem("sections");
      if (item) {
        setValue(JSON.parse(item));
      }
    } catch (e) {
      console.error(e);
    }
    setLoaded(true);
  }, []);
  const updateValue = (0, import_react.useCallback)((newValue) => {
    setValue(newValue);
    try {
      if (newValue === null) {
        localStorage.removeItem("sections");
      } else {
        localStorage.setItem("sections", JSON.stringify(newValue));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);
  return [value, updateValue, loaded];
}
var import_react2 = require("react");
var import_sortable = require("@dnd-kit/sortable");
var import_utilities = require("@dnd-kit/utilities");
var SortableItem = (0, import_react2.memo)(function SortableItem2({ id, children }) {
  const { attributes, listeners, setNodeRef, transform, transition } = (0, import_sortable.useSortable)({ id });
  const style = {
    transform: import_utilities.CSS.Transform.toString(transform),
    transition
  };
  return /* @__PURE__ */ import_react2.default.createElement("div", __spreadValues(__spreadValues({
    ref: setNodeRef,
    style
  }, attributes), listeners), children);
});
var import_react3 = require("react");
var import_react4 = require("react");
var CustomSection = ({ section, onToggle }) => {
  return /* @__PURE__ */ import_react3.default.createElement("div", {
    className: "custom-section"
  }, /* @__PURE__ */ import_react3.default.createElement("label", null, /* @__PURE__ */ import_react3.default.createElement("input", {
    type: "checkbox",
    checked: section.enabled,
    onChange: () => onToggle(section.id)
  }), section.title));
};
var CustomSection_default = CustomSection;
var SectionFilter = ({ sections, onToggle }) => {
  return /* @__PURE__ */ import_react4.default.createElement("div", {
    className: "section-filter"
  }, sections.map((section) => /* @__PURE__ */ import_react4.default.createElement(CustomSection_default, {
    key: section.id,
    section,
    onToggle
  })));
};
var SectionFilter_default = SectionFilter;
var import_core = require("@dnd-kit/core");
var import_modifiers = require("@dnd-kit/modifiers");
var import_sortable2 = require("@dnd-kit/sortable");
var import_react5 = require("react");
function kebabCaseToTitleCase(str) {
  return str.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}
var SectionsColumn = ({ sections, setSections }) => {
  const [items, setItems] = (0, import_react5.useState)(sections);
  const onDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      const newItems = (0, import_sortable2.arrayMove)(items, oldIndex, newIndex);
      setItems(newItems);
      setSections(newItems);
    }
  };
  const handleToggle = (id) => {
    const newItems = items.map((item) => item.id === id ? __spreadProps(__spreadValues({}, item), { enabled: !item.enabled }) : item);
    setItems(newItems);
    setSections(newItems);
  };
  return /* @__PURE__ */ import_react5.default.createElement(import_core.DndContext, {
    onDragEnd,
    modifiers: [import_modifiers.restrictToVerticalAxis]
  }, /* @__PURE__ */ import_react5.default.createElement(import_sortable2.SortableContext, {
    items: items.map((item) => item.id),
    strategy: import_sortable2.verticalListSortingStrategy
  }, /* @__PURE__ */ import_react5.default.createElement("div", {
    className: "sections-column"
  }, items.map((item) => /* @__PURE__ */ import_react5.default.createElement(SortableItem, {
    key: item.id,
    id: item.id
  }, /* @__PURE__ */ import_react5.default.createElement(CustomSection_default, {
    section: __spreadProps(__spreadValues({}, item), { title: kebabCaseToTitleCase(item.id) }),
    onToggle: handleToggle
  }))))));
};
0 && (module.exports = { SectionsColumn });
