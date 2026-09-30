var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;

var __export = (target, all) => {
  for (var name in all) {
    __defProp(target, name, {
      get: all[name],
      enumerable: true
    });
  }
};

var __copyProps = (to, from, except, desc) => {
  if (from && (typeof from === "object" || typeof from === "function")) {
    for (var key of __getOwnPropNames(from)) {
      if (!__hasOwnProp.call(to, key) && key !== except) {
        __defProp(to, key, {
          get: () => from[key],
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
        });
      }
    }
  }
  return to;
};

var __toCommonJS = mod =>
  __copyProps(__defProp({}, "__esModule", { value: true }), mod);

var SortableItem_exports = {};
__export(SortableItem_exports, {
  SortableItem: () => SortableItem
});
module.exports = __toCommonJS(SortableItem_exports);

var import_react = require("react");
var import_sortable = require("@dnd-kit/sortable");
var import_utilities = require("@dnd-kit/utilities");

var SortableItem = (0, import_react.memo)(function SortableItem2({
  id,
  children
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = (0, import_sortable.useSortable)({ id });

  const style = {
    transform: import_utilities.CSS.Transform.toString(transform),
    transition
  };

  return React.createElement(
    "div",
    {
      ref: setNodeRef,
      style,
      ...attributes,
      ...listeners
    },
    children
  );
});
