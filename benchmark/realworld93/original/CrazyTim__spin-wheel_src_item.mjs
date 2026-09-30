// ../work/CrazyTim__spin-wheel/src/util.js
function getRandomInt(min = 0, max = 0) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}
function getRandomFloat(min = 0, max = 0, round = 14) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(round));
}
function degRad(degrees = 0) {
  return degrees * Math.PI / 180;
}
function isAngleBetween(angle, arcStart, arcEnd) {
  if (arcStart < arcEnd) return arcStart <= angle && angle < arcEnd;
  return arcStart <= angle || angle < arcEnd;
}
function aveArray(array = []) {
  let sum = 0;
  for (const val of array) {
    if (val) sum += typeof val === "number" ? val : 1;
  }
  return sum / array.length || 0;
}
function getFontSizeToFit(text, fontFamily, maxWidth, canvasContext) {
  canvasContext.save();
  canvasContext.font = `1px ${fontFamily}`;
  const w = canvasContext.measureText(text).width;
  canvasContext.restore();
  return maxWidth / w;
}
function isPointInCircle(point = { x: 0, y: 0 }, cx, cy, radius) {
  const distanceSquared = (point.x - cx) ** 2 + (point.y - cy) ** 2;
  return distanceSquared <= radius ** 2;
}
function translateXYToElement(point = { x: 0, y: 0 }, element = {}, devicePixelRatio = 1) {
  const rect = element.getBoundingClientRect();
  return {
    x: (point.x - rect.left) * devicePixelRatio,
    y: (point.y - rect.top) * devicePixelRatio
  };
}
function getMouseButtonsPressed(event = {}) {
  return [1, 2, 4, 8, 16].filter((i) => event.buttons & i);
}
function getAngle(originX, originY, targetX, targetY) {
  const dx = originX - targetX;
  const dy = originY - targetY;
  let theta = Math.atan2(-dy, -dx);
  theta *= 180 / Math.PI;
  if (theta < 0) theta += 360;
  return theta;
}
function getDistanceBetweenPoints(point1 = { x: 0, y: 0 }, point2 = { x: 0, y: 0 }) {
  return Math.hypot(point2.x - point1.x, point2.y - point1.y);
}
function addAngle(a = 0, b = 0) {
  const sum = a + b;
  let result;
  if (sum > 0) {
    result = sum % 360;
  } else {
    result = 360 + sum % 360;
  }
  if (result === 360) result = 0;
  return result;
}
function diffAngle(a = 0, b = 0) {
  const offsetFrom180 = 180 - b;
  const aWithOffset = addAngle(a, offsetFrom180);
  return 180 - aWithOffset;
}
function calcWheelRotationForTargetAngle(currentRotation = 0, targetAngle = 0, direction = 1) {
  let angle = (currentRotation % 360 + targetAngle) % 360;
  angle = fixFloat(angle);
  angle = (direction === 1 ? 360 - angle : 360 + angle) % 360;
  angle *= direction;
  return currentRotation + angle;
}
function isObject(v) {
  return typeof v === "object" && !Array.isArray(v) && v !== null;
}
function isNumber(n) {
  return typeof n === "number" && !Number.isNaN(n);
}
function setProp({ val, isValid, errorMessage, defaultValue, action = null }) {
  if (isValid) {
    return action ? action() : val;
  } else if (val === void 0) {
    return defaultValue;
  }
  throw new Error(errorMessage);
}
function fixFloat(f = 0) {
  return Number(f.toFixed(9));
}
function easeSinOut(n) {
  return Math.sin(n * Math.PI / 2);
}
function getResizeObserver(element = {}, callBack = {}) {
  if (window.ResizeObserver) {
    const observer = new ResizeObserver(() => {
      callBack({ redraw: true });
    });
    observer.observe(element);
    return {
      stop: () => {
        observer.unobserve(element);
        observer.disconnect();
      }
    };
  }
  window.addEventListener("resize", callBack);
  return {
    stop: () => {
      window.removeEventListener("resize", callBack);
    }
  };
}

// ../work/CrazyTim__spin-wheel/src/constants.js
var arcAdjust = -90;
var baseCanvasSize = 500;
var dragCapturePeriod = 250;
var AlignText = Object.freeze({
  left: "left",
  right: "right",
  center: "center"
});
var Defaults = Object.freeze({
  wheel: {
    borderColor: "#000",
    borderWidth: 1,
    debug: false,
    image: null,
    isInteractive: true,
    itemBackgroundColors: ["#fff"],
    itemLabelAlign: AlignText.right,
    itemLabelBaselineOffset: 0,
    itemLabelColors: ["#000"],
    itemLabelFont: "sans-serif",
    itemLabelFontSizeMax: baseCanvasSize,
    itemLabelRadius: 0.85,
    itemLabelRadiusMax: 0.2,
    itemLabelRotation: 0,
    itemLabelStrokeColor: "#fff",
    itemLabelStrokeWidth: 0,
    items: [],
    lineColor: "#000",
    lineWidth: 1,
    pixelRatio: 0,
    radius: 0.95,
    rotation: 0,
    rotationResistance: -35,
    rotationSpeedMax: 300,
    offset: { x: 0, y: 0 },
    onCurrentIndexChange: null,
    onRest: null,
    onSpin: null,
    overlayImage: null,
    pointerAngle: 0
  },
  item: {
    backgroundColor: null,
    image: null,
    imageOpacity: 1,
    imageRadius: 0.5,
    imageRotation: 0,
    imageScale: 1,
    label: "",
    labelColor: null,
    value: null,
    weight: 1
  }
});
var Debugging = Object.freeze({
  pointerLineColor: "#ff00ff",
  labelBoundingBoxColor: "#ff00ff",
  labelRadiusColor: "#00ff00",
  dragPointHue: 300
});

// ../work/CrazyTim__spin-wheel/src/item.js
var Item = class {
  constructor(wheel, props = {}) {
    if (!isObject(wheel)) throw new Error("wheel must be an instance of Wheel");
    if (!isObject(props) && props !== null) throw new Error("props must be an Object or null");
    this._wheel = wheel;
    for (const i of Object.keys(Defaults.item)) {
      this["_" + i] = Defaults.item[i];
    }
    if (props) {
      this.init(props);
    } else {
      this.init(Defaults.item);
    }
  }
  /**
   * Initialise all properties.
   */
  init(props = {}) {
    this.backgroundColor = props.backgroundColor;
    this.image = props.image;
    this.imageOpacity = props.imageOpacity;
    this.imageRadius = props.imageRadius;
    this.imageRotation = props.imageRotation;
    this.imageScale = props.imageScale;
    this.label = props.label;
    this.labelColor = props.labelColor;
    this.value = props.value;
    this.weight = props.weight;
  }
  /**
   * The [CSS color](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value) of the item's background.
   * When `null`, the color will fall back to `Wheel.itemBackgroundColors`.
   * Example: `'#fff'`.
   */
  get backgroundColor() {
    return this._backgroundColor;
  }
  set backgroundColor(val) {
    if (typeof val === "string") {
      this._backgroundColor = val;
    } else {
      this._backgroundColor = Defaults.item.backgroundColor;
    }
    this._wheel.refresh();
  }
  /**
   * The image (HTMLImageElement) to draw on the item.
   * Any part of the image that extends outside the item will be clipped.
   * The image will be drawn over the top of `Item.backgroundColor`.
   */
  get image() {
    return this._image;
  }
  set image(val) {
    if (val instanceof HTMLImageElement) {
      this._image = val;
    } else {
      this._image = Defaults.item.image;
    }
    this._wheel.refresh();
  }
  /**
   * The opacity (as a percent) of `Item.image`.
   * Useful if you want to fade the image to make the item's label stand out.
   */
  get imageOpacity() {
    return this._imageOpacity;
  }
  set imageOpacity(val) {
    if (typeof val === "number") {
      this._imageOpacity = val;
    } else {
      this._imageOpacity = Defaults.item.imageOpacity;
    }
    this._wheel.refresh();
  }
  /**
   * The point along the wheel's radius (as a percent, starting from the center) to draw the center of `Item.image`.
   */
  get imageRadius() {
    return this._imageRadius;
  }
  set imageRadius(val) {
    if (typeof val === "number") {
      this._imageRadius = val;
    } else {
      this._imageRadius = Defaults.item.imageRadius;
    }
    this._wheel.refresh();
  }
  /**
   * The rotation (angle in degrees) of `Item.image`.
   */
  get imageRotation() {
    return this._imageRotation;
  }
  set imageRotation(val) {
    if (typeof val === "number") {
      this._imageRotation = val;
    } else {
      this._imageRotation = Defaults.item.imageRotation;
    }
    this._wheel.refresh();
  }
  /**
   * The scale (size as a percent) of `Item.image`.
   */
  get imageScale() {
    return this._imageScale;
  }
  set imageScale(val) {
    if (typeof val === "number") {
      this._imageScale = val;
    } else {
      this._imageScale = Defaults.item.imageScale;
    }
    this._wheel.refresh();
  }
  /**
   * The text that will be drawn on the item.
   */
  get label() {
    return this._label;
  }
  set label(val) {
    if (typeof val === "string") {
      this._label = val;
    } else {
      this._label = Defaults.item.label;
    }
    this._wheel.refresh();
  }
  /**
   * The [CSS color](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value) of the item's label.
   * When `null`, the color will fall back to `Wheel.itemLabelColors`.
   * Example: `'#000'`.
   */
  get labelColor() {
    return this._labelColor;
  }
  set labelColor(val) {
    if (typeof val === "string") {
      this._labelColor = val;
    } else {
      this._labelColor = Defaults.item.labelColor;
    }
    this._wheel.refresh();
  }
  /**
   * Some value that has meaning to your application.
   * For example, a reference to the object representing the item on the wheel, or a database id.
   */
  get value() {
    return this._value;
  }
  set value(val) {
    if (val !== void 0) {
      this._value = val;
    } else {
      this._value = Defaults.item.value;
    }
  }
  /**
   * The proportional size of the item relative to other items on the wheel.
   * For example, if you have 2 items where `item[0]` has a weight of `1` and `item[1]` has a weight of `2`,
   * then `item[0]` will take up 1/3 of the space on the wheel.
   */
  get weight() {
    return this._weight;
  }
  set weight(val) {
    if (typeof val === "number") {
      this._weight = val;
    } else {
      this._weight = Defaults.item.weight;
    }
  }
  /**
   * Get the 0-based index of this item.
   */
  getIndex() {
    const index = this._wheel.items.findIndex((i) => i === this);
    if (index === -1) throw new Error("Item not found in parent Wheel");
    return index;
  }
  /**
   * Get the angle (in degrees) that this item ends at (exclusive), ignoring the current `rotation` of the wheel.
   */
  getCenterAngle() {
    const angle = this._wheel.getItemAngles()[this.getIndex()];
    return angle.start + (angle.end - angle.start) / 2;
  }
  /**
   * Get the angle (in degrees) that this item starts at (inclusive), ignoring the current `rotation` of the wheel.
   */
  getStartAngle() {
    return this._wheel.getItemAngles()[this.getIndex()].start;
  }
  /**
   * Get the angle (in degrees) that this item ends at (inclusive), ignoring the current `rotation` of the wheel.
   */
  getEndAngle() {
    return this._wheel.getItemAngles()[this.getIndex()].end;
  }
  /**
   * Return a random angle (in degrees) between this item's start angle (inclusive) and end angle (inclusive).
   */
  getRandomAngle() {
    return getRandomFloat(this.getStartAngle(), this.getEndAngle());
  }
};
export {
  Item
};
