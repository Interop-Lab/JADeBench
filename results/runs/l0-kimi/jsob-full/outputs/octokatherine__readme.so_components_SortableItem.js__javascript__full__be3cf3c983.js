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

var SortableItem_exports = {};
__export(SortableItem_exports, {
  default: () => SortableItem
});
module.exports = __toCommonJS(SortableItem_exports);

var import_react = require("react");
var import_sortable = require("@dnd-kit/sortable");
var import_utilities = require("@dnd-kit/utilities");

var SortableItem = (0, import_react.forwardRef)(function SortableItem2(props) {
  var _a = {
    id: props.id
  };
  const { attributes, listeners, setNodeRef, transform, transition } = (0, import_sortable.useSortable)(_a);
  const style = {
    transform: import_utilities.CSS.Transform.toString(transform),
    transition
  };
  const handleClick = () => {
    localStorage.setItem("selectedItemId", props.id);
    props.onSelectItem(props.id);
  };
  const handleDelete = (event) => {
    props.onDeleteItem(event, props.itemData.id);
  };
  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      handleClick();
    }
  };
  const handleKeyUp = (event) => {
    if (event.key === "Delete" || event.key === "Backspace") {
      handleClick();
    }
  };
  return React.createElement("li", {
    ref: setNodeRef,
    style,
    ...attributes,
    onClick: handleClick,
    onKeyUp: handleKeyUp,
    className: "flex items-center justify-between p-3 bg-white border rounded shadow-sm hover:bg-gray-50 transition-colors cursor-move " + (props.itemData.isSelected ? "ring-2 ring-blue-500" : "")
  }, React.createElement("div", {
    type: "button",
    className: "flex items-center gap-3 flex-1",
    ...listeners
  }, React.createElement("img", {
    className: "w-10 h-10 rounded-full object-cover",
    src: props.itemData.imageUrl,
    alt: props.itemData.name
  })), React.createElement("p", null, props.itemData.name), props.itemData.isSelected && props.onDeleteItem && React.createElement(React.Fragment, null, React.createElement("button", {
    className: "p-1 text-red-500 hover:text-red-700",
    type: "button",
    "aria-label": "Delete item",
    onClick: handleDelete
  }, React.createElement("img", {
    className: "w-5 h-5",
    src: "/icons/delete.svg",
    alt: "Delete"
  })), React.createElement("button", {
    className: "p-1 text-gray-500 hover:text-gray-700",
    type: "button",
    "aria-label": "Edit item",
    onClick: handleDelete
  }, React.createElement("img", {
    className: "w-5 h-5",
    src: "/icons/edit.svg",
    alt: "Edit"
  }))));
});

var _0x4ca4ab = {};
_0x4ca4ab.default = SortableItem;
0 && (module.exports = _0x4ca4ab);
