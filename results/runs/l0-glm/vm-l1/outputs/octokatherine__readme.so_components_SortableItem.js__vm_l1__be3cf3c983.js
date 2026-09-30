var import_react = require("react");
var import_sortable = require("@dnd-kit/sortable");
var import_utilities = require("@dnd-kit/utilities");

var SortableItem_exports = {};
__export(SortableItem_exports, {
  SortableItem: () => SortableItem
});
module.exports = __toCommonJS(SortableItem_exports);

var SortableItem = (0, import_react.memo)(function SortableItem2(props) {
  var _a, _b;
  const {
    id,
    item,
    onRemoveItem,
    renderItem
  } = props;
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
  return /* @__PURE__ */ import_react.default.createElement("div", {
    ...attributes,
    ...listeners,
    ref: setNodeRef,
    style
  }, renderItem ? renderItem(item) : (_b = (_a = props.renderItem) == null ? void 0 : _a.call(props, item)) != null ? _b : null, /* @__PURE__ */ import_react.default.createElement("button", {
    onClick: () => onRemoveItem(id)
  }, "x"));
});
0 && (module.exports = {
  SortableItem
});
