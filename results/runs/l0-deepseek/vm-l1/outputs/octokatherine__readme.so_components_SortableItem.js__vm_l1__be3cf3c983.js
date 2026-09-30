const SortableItem_exports = {};

__export(SortableItem_exports, {
  SortableItem: () => SortableItem
});

module.exports = __toCommonJS(SortableItem_exports);

var import_react = require("react");
var import_sortable = require("@dnd-kit/sortable");
var import_utilities = require("@dnd-kit/utilities");

var SortableItem = (0, import_react.memo)(function SortableItem2(props) {
  const {
    id,
    index,
    handle = true,
    disabled = false,
    style,
    children,
    ...rest
  } = props;

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
    isSorting,
    isOver,
    isOverContainer
  } = (0, import_sortable.useSortable)({
    id,
    disabled
  });

  const inlineStyles = {
    transform: import_sortable.CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
    zIndex: isDragging ? 1000 : undefined,
    ...style
  };

  return (0, import_react.jsx)("div", {
    ref: setNodeRef,
    style: inlineStyles,
    ...attributes,
    ...listeners,
    children: children({
      attributes,
      listeners,
      setNodeRef,
      setActivatorNodeRef,
      transform,
      transition,
      isDragging,
      isSorting,
      isOver,
      isOverContainer,
      handle
    })
  });
});
