export class Item {
  constructor(item, options = {}) {
    if (!isObject(item)) {
      throw new Error("Item constructor requires an object");
    }
    if (!isObject(options) && options !== null) {
      throw new Error("Options must be an object");
    }
    this.item = item;
    for (const key of Object.keys(Defaults.item)) {
      this["_" + key] = Defaults.item[key];
    }
    if (options) {
      this.setOptions(options);
    } else {
      this.setOptions(Defaults.item);
    }
  }

  setOptions(options = {}) {
    const keys = "label|value|visible|enabled|selected|color|font|fontSize|fontFamily|fontWeight|textAlign|textBaseline|padding|margin|rotation|scale|opacity|zIndex|draggable|resizable|selectable|hoverable|focusable|tabIndex|ariaLabel|role|tooltip|data|id|className|style|events|callbacks|onClick|onHover|onFocus|onBlur|onDrag|onDrop|onResize|onSelect|onDeselect|onChange|onUpdate|onRender|onDestroy".split("|");
    let i = 0;
    while (true) {
      switch (keys[i++]) {
        case "0":
          this.label = options.label;
          continue;
        case "1":
          this.value = options.value;
          continue;
        case "2":
          this.visible = options.visible;
          continue;
        case "3":
          this.enabled = options.enabled;
          continue;
        case "4":
          this.selected = options.selected;
          continue;
        case "5":
          this.color = options.color;
          continue;
        case "6":
          this.font = options.font;
          continue;
        case "7":
          this.fontSize = options.fontSize;
          continue;
        case "8":
          this.fontFamily = options.fontFamily;
          continue;
        case "9":
          this.fontWeight = options.fontWeight;
          continue;
      }
      break;
    }
  }

  get label() {
    return this._label;
  }

  set label(value) {
    if (typeof value === "string") {
      this._label = value;
    } else {
      this._label = Defaults.item.label;
    }
    this.item.render();
  }

  get value() {
    return this._value;
  }

  set value(value) {
    if (value instanceof HTMLImageElement) {
      this._value = value;
    } else {
      this._value = Defaults.item.value;
    }
    this.item.render();
  }

  get visible() {
    return this._visible;
  }

  set visible(value) {
    if (typeof value === "boolean") {
      this._visible = value;
    } else {
      this._visible = Defaults.item.visible;
    }
    this.item.render();
  }

  get enabled() {
    return this._enabled;
  }

  set enabled(value) {
    if (typeof value === "boolean") {
      this._enabled = value;
    } else {
      this._enabled = Defaults.item.enabled;
    }
    this.item.render();
  }

  get selected() {
    return this._selected;
  }

  set selected(value) {
    if (typeof value === "boolean") {
      this._selected = value;
    } else {
      this._selected = Defaults.item.selected;
    }
    this.item.render();
  }

  get color() {
    return this._color;
  }

  set color(value) {
    if (typeof value === "string") {
      this._color = value;
    } else {
      this._color = Defaults.item.color;
    }
    this.item.render();
  }

  get font() {
    return this._font;
  }

  set font(value) {
    if (typeof value === "string") {
      this._font = value;
    } else {
      this._font = Defaults.item.font;
    }
    this.item.render();
  }

  get fontSize() {
    return this._fontSize;
  }

  set fontSize(value) {
    if (typeof value === "number") {
      this._fontSize = value;
    } else {
      this._fontSize = Defaults.item.fontSize;
    }
    this.item.render();
  }

  get fontFamily() {
    return this._fontFamily;
  }

  set fontFamily(value) {
    if (typeof value === "string") {
      this._fontFamily = value;
    } else {
      this._fontFamily = Defaults.item.fontFamily;
    }
    this.item.render();
  }

  get fontWeight() {
    return this._fontWeight;
  }

  set fontWeight(value) {
    if (typeof value === "number") {
      this._fontWeight = value;
    } else {
      this._fontWeight = Defaults.item.fontWeight;
    }
    this.item.render();
  }

  get textAlign() {
    return this._textAlign;
  }

  set textAlign(value) {
    if (typeof value === "string") {
      this._textAlign = value;
    } else {
      this._textAlign = Defaults.item.textAlign;
    }
    this.item.render();
  }

  get textBaseline() {
    return this._textBaseline;
  }

  set textBaseline(value) {
    if (typeof value === "string") {
      this._textBaseline = value;
    } else {
      this._textBaseline = Defaults.item.textBaseline;
    }
    this.item.render();
  }

  get padding() {
    return this._padding;
  }

  set padding(value) {
    if (typeof value === "number") {
      this._padding = value;
    } else {
      this._padding = Defaults.item.padding;
    }
    this.item.render();
  }

  get margin() {
    return this._margin;
  }

  set margin(value) {
    if (typeof value === "number") {
      this._margin = value;
    } else {
      this._margin = Defaults.item.margin;
    }
    this.item.render();
  }

  get rotation() {
    return this._rotation;
  }

  set rotation(value) {
    if (typeof value === "number") {
      this._rotation = value;
    } else {
      this._rotation = Defaults.item.rotation;
    }
    this.item.render();
  }

  get scale() {
    return this._scale;
  }

  set scale(value) {
    if (typeof value === "number") {
      this._scale = value;
    } else {
      this._scale = Defaults.item.scale;
    }
    this.item.render();
  }

  get opacity() {
    return this._opacity;
  }

  set opacity(value) {
    if (typeof value === "number") {
      this._opacity = value;
    } else {
      this._opacity = Defaults.item.opacity;
    }
    this.item.render();
  }

  get zIndex() {
    return this._zIndex;
  }

  set zIndex(value) {
    if (typeof value === "number") {
      this._zIndex = value;
    } else {
      this._zIndex = Defaults.item.zIndex;
    }
    this.item.render();
  }

  get draggable() {
    return this._draggable;
  }

  set draggable(value) {
    if (typeof value === "boolean") {
      this._draggable = value;
    } else {
      this._draggable = Defaults.item.draggable;
    }
    this.item.render();
  }

  get resizable() {
    return this._resizable;
  }

  set resizable(value) {
    if (typeof value === "boolean") {
      this._resizable = value;
    } else {
      this._resizable = Defaults.item.resizable;
    }
    this.item.render();
  }

  get selectable() {
    return this._selectable;
  }

  set selectable(value) {
    if (typeof value === "boolean") {
      this._selectable = value;
    } else {
      this._selectable = Defaults.item.selectable;
    }
    this.item.render();
  }

  get hoverable() {
    return this._hoverable;
  }

  set hoverable(value) {
    if (typeof value === "boolean") {
      this._hoverable = value;
    } else {
      this._hoverable = Defaults.item.hoverable;
    }
    this.item.render();
  }

  get focusable() {
    return this._focusable;
  }

  set focusable(value) {
    if (typeof value === "boolean") {
      this._focusable = value;
    } else {
      this._focusable = Defaults.item.focusable;
    }
    this.item.render();
  }

  get tabIndex() {
    return this._tabIndex;
  }

  set tabIndex(value) {
    if (typeof value === "number") {
      this._tabIndex = value;
    } else {
      this._tabIndex = Defaults.item.tabIndex;
    }
    this.item.render();
  }

  get ariaLabel() {
    return this._ariaLabel;
  }

  set ariaLabel(value) {
    if (typeof value === "string") {
      this._ariaLabel = value;
    } else {
      this._ariaLabel = Defaults.item.ariaLabel;
    }
    this.item.render();
  }

  get role() {
    return this._role;
  }

  set role(value) {
    if (typeof value === "string") {
      this._role = value;
    } else {
      this._role = Defaults.item.role;
    }
    this.item.render();
  }

  get tooltip() {
    return this._tooltip;
  }

  set tooltip(value) {
    if (typeof value === "string") {
      this._tooltip = value;
    } else {
      this._tooltip = Defaults.item.tooltip;
    }
    this.item.render();
  }

  get data() {
    return this._data;
  }

  set data(value) {
    if (typeof value === "object") {
      this._data = value;
    } else {
      this._data = Defaults.item.data;
    }
    this.item.render();
  }

  get id() {
    return this._id;
  }

  set id(value) {
    if (typeof value === "string") {
      this._id = value;
    } else {
      this._id = Defaults.item.id;
    }
    this.item.render();
  }

  get className() {
    return this._className;
  }

  set className(value) {
    if (typeof value === "string") {
      this._className = value;
    } else {
      this._className = Defaults.item.className;
    }
    this.item.render();
  }

  get style() {
    return this._style;
  }

  set style(value) {
    if (typeof value === "object") {
      this._style = value;
    } else {
      this._style = Defaults.item.style;
    }
    this.item.render();
  }

  get events() {
    return this._events;
  }

  set events(value) {
    if (typeof value === "object") {
      this._events = value;
    } else {
      this._events = Defaults.item.events;
    }
    this.item.render();
  }

  get callbacks() {
    return this._callbacks;
  }

  set callbacks(value) {
    if (typeof value === "object") {
      this._callbacks = value;
    } else {
      this._callbacks = Defaults.item.callbacks;
    }
    this.item.render();
  }

  get onClick() {
    return this._onClick;
  }

  set onClick(value) {
    if (typeof value === "function") {
      this._onClick = value;
    } else {
      this._onClick = Defaults.item.onClick;
    }
    this.item.render();
  }

  get onHover() {
    return this._onHover;
  }

  set onHover(value) {
    if (typeof value === "function") {
      this._onHover = value;
    } else {
      this._onHover = Defaults.item.onHover;
    }
    this.item.render();
  }

  get onFocus() {
    return this._onFocus;
  }

  set onFocus(value) {
    if (typeof value === "function") {
      this._onFocus = value;
    } else {
      this._onFocus = Defaults.item.onFocus;
    }
    this.item.render();
  }

  get onBlur() {
    return this._onBlur;
  }

  set onBlur(value) {
    if (typeof value === "function") {
      this._onBlur = value;
    } else {
      this._onBlur = Defaults.item.onBlur;
    }
    this.item.render();
  }

  get onDrag() {
    return this._onDrag;
  }

  set onDrag(value) {
    if (typeof value === "function") {
      this._onDrag = value;
    } else {
      this._onDrag = Defaults.item.onDrag;
    }
    this.item.render();
  }

  get onDrop() {
    return this._onDrop;
  }

  set onDrop(value) {
    if (typeof value === "function") {
      this._onDrop = value;
    } else {
      this._onDrop = Defaults.item.onDrop;
    }
    this.item.render();
  }

  get onResize() {
    return this._onResize;
  }

  set onResize(value) {
    if (typeof value === "function") {
      this._onResize = value;
    } else {
      this._onResize = Defaults.item.onResize;
    }
    this.item.render();
  }

  get onSelect() {
    return this._onSelect;
  }

  set onSelect(value) {
    if (typeof value === "function") {
      this._onSelect = value;
    } else {
      this._onSelect = Defaults.item.onSelect;
    }
    this.item.render();
  }

  get onDeselect() {
    return this._onDeselect;
  }

  set onDeselect(value) {
    if (typeof value === "function") {
      this._onDeselect = value;
    } else {
      this._onDeselect = Defaults.item.onDeselect;
    }
    this.item.render();
  }

  get onChange() {
    return this._onChange;
  }

  set onChange(value) {
    if (typeof value === "function") {
      this._onChange = value;
    } else {
      this._onChange = Defaults.item.onChange;
    }
    this.item.render();
  }

  get onUpdate() {
    return this._onUpdate;
  }

  set onUpdate(value) {
    if (typeof value === "function") {
      this._onUpdate = value;
    } else {
      this._onUpdate = Defaults.item.onUpdate;
    }
    this.item.render();
  }

  get onRender() {
    return this._onRender;
  }

  set onRender(value) {
    if (typeof value === "function") {
      this._onRender = value;
    } else {
      this._onRender = Defaults.item.onRender;
    }
    this.item.render();
  }

  get onDestroy() {
    return this._onDestroy;
  }

  set onDestroy(value) {
    if (typeof value === "function") {
      this._onDestroy = value;
    } else {
      this._onDestroy = Defaults.item.onDestroy;
    }
    this.item.render();
  }

  getIndex() {
    const index = this.item.items.findIndex(item => item === this);
    if (index === -1) {
      throw new Error("Item not found in parent");
    }
    return index;
  }

  getWidth() {
    const bounds = this.item.getBoundingClientRect();
    return bounds.width;
  }

  getHeight() {
    const bounds = this.item.getBoundingClientRect();
    return bounds.height;
  }

  getSize() {
    const bounds = this.item.getBoundingClientRect();
    return {
      width: bounds.width,
      height: bounds.height
    };
  }

  getPosition() {
    const bounds = this.item.getBoundingClientRect();
    return {
      x: bounds.left,
      y: bounds.top
    };
  }

  getCenter() {
    const bounds = this.item.getBoundingClientRect();
    return {
      x: bounds.left + bounds.width / 2,
      y: bounds.top + bounds.height / 2
    };
  }

  getRandomPosition() {
    return getRandomFloat(this.getMinX(), this.getMaxX(), this.getMinY(), this.getMaxY());
  }
}
