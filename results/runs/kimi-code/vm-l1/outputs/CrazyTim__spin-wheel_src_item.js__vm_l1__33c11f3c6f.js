const arcAdjust = -90;
const baseCanvasSize = 500;
const dragCapturePeriod = 250;

function getRandomInt(min = 0, max = 1) {
  return Math.floor(getRandomFloat(min, max + 1));
}

function getRandomFloat(min = 0, max = 1) {
  return Math.random() * (max - min) + min;
}

function degRad(degrees) {
  return (degrees * Math.PI) / 180;
}

function normalizeAngle(angle) {
  return ((angle % 360) + 360) % 360;
}

function isAngleBetween(angle, start, end) {
  angle = normalizeAngle(angle);
  start = normalizeAngle(start);
  end = normalizeAngle(end);
  return start <= end ? angle >= start && angle <= end : angle >= start || angle <= end;
}

function aveArray(values) {
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function getFontSizeToFit(context, text, maxWidth, maxFontSize) {
  let fontSize = maxFontSize;
  const fontFamily = context.font.replace(/^\S+\s+/, "");
  while (fontSize > 0) {
    context.font = `${fontSize}px ${fontFamily}`;
    if (context.measureText(text).width <= maxWidth) return fontSize;
    fontSize--;
  }
  return 0;
}

function isPointInCircle(point, center, radius) {
  return getDistanceBetweenPoints(point.x, point.y, center.x, center.y) <= radius;
}

function translateXYToElement(event, element) {
  const bounds = element.getBoundingClientRect();
  return {
    x: event.clientX - bounds.left,
    y: event.clientY - bounds.top,
  };
}

function getMouseButtonsPressed(event) {
  return event.buttons ?? (event.which ? 1 : 0);
}

function getAngle(x1, y1, x2, y2) {
  return normalizeAngle((Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI);
}

function getDistanceBetweenPoints(x1, y1, x2, y2) {
  return Math.hypot(x2 - x1, y2 - y1);
}

function addAngle(angle, amount) {
  return normalizeAngle(angle + amount);
}

function diffAngle(angle, reference) {
  return normalizeAngle(reference - angle);
}

function calcWheelRotationForTargetAngle(currentRotation, direction, targetAngle) {
  const fullRotations = direction * 35;
  const targetRotation = currentRotation + fullRotations * 360;
  return fixFloat(targetRotation + diffAngle(targetRotation, targetAngle));
}

function isObject(value) {
  return value !== null && typeof value === "object";
}

function isNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function setProp({ val, validate, defaultValue }) {
  return validate(val) ? val : defaultValue;
}

function fixFloat(value) {
  return Number.parseFloat(Number(value).toPrecision(14));
}

function easeSinOut(value) {
  return Math.sin((value * Math.PI) / 2);
}

function getResizeObserver(callback) {
  return typeof ResizeObserver === "undefined" ? null : new ResizeObserver(callback);
}

const AlignText = Object.freeze({
  left: "left",
  right: "right",
  center: "center",
});

const Defaults = Object.freeze({
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
    pointerAngle: 0,
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
    weight: 1,
  },
});

const Debugging = Object.freeze({
  pointerLineColor: "#ff00ff",
  labelBoundingBoxColor: "#ff00ff",
  labelRadiusColor: "#00ff00",
  dragPointHue: 300,
});

class Item {
  constructor(properties = {}) {
    this._wheel = null;
    this.init(properties);
  }

  init(properties) {
    this.backgroundColor = properties.backgroundColor;
    this.image = properties.image;
    this.imageOpacity = properties.imageOpacity;
    this.imageRadius = properties.imageRadius;
    this.imageRotation = properties.imageRotation;
    this.imageScale = properties.imageScale;
    this.label = properties.label;
    this.labelColor = properties.labelColor;
    this.value = properties.value;
    this.weight = properties.weight;
  }

  get backgroundColor() {
    return this._backgroundColor;
  }

  set backgroundColor(value) {
    this._backgroundColor = typeof value === "string" ? value : Defaults.item.backgroundColor;
    this._wheel?.refresh();
  }

  get image() {
    return this._image;
  }

  set image(value) {
    this._image = typeof HTMLImageElement !== "undefined" && value instanceof HTMLImageElement ? value : Defaults.item.image;
    this._wheel?.refresh();
  }

  get imageOpacity() {
    return this._imageOpacity;
  }

  set imageOpacity(value) {
    this._imageOpacity = isNumber(value) ? value : Defaults.item.imageOpacity;
    this._wheel?.refresh();
  }

  get imageRadius() {
    return this._imageRadius;
  }

  set imageRadius(value) {
    this._imageRadius = isNumber(value) ? value : Defaults.item.imageRadius;
    this._wheel?.refresh();
  }

  get imageRotation() {
    return this._imageRotation;
  }

  set imageRotation(value) {
    this._imageRotation = isNumber(value) ? value : Defaults.item.imageRotation;
    this._wheel?.refresh();
  }

  get imageScale() {
    return this._imageScale;
  }

  set imageScale(value) {
    this._imageScale = isNumber(value) ? value : Defaults.item.imageScale;
    this._wheel?.refresh();
  }

  get label() {
    return this._label;
  }

  set label(value) {
    this._label = typeof value === "string" ? value : Defaults.item.label;
    this._wheel?.refresh();
  }

  get labelColor() {
    return this._labelColor;
  }

  set labelColor(value) {
    this._labelColor = typeof value === "string" ? value : Defaults.item.labelColor;
    this._wheel?.refresh();
  }

  get value() {
    return this._value;
  }

  set value(value) {
    this._value = value;
  }

  get weight() {
    return this._weight;
  }

  set weight(value) {
    this._weight = isNumber(value) ? value : Defaults.item.weight;
  }

  getIndex() {
    return this._wheel?.items?.indexOf(this) ?? -1;
  }

  getCenterAngle() {
    const { start, end } = this._getAngles();
    return (start + end) / 2;
  }

  getStartAngle() {
    return this._getAngles().start;
  }

  getEndAngle() {
    return this._getAngles().end;
  }

  getRandomAngle() {
    return getRandomFloat(this.getStartAngle(), this.getEndAngle());
  }

  _getAngles() {
    return this._wheel.getItemAngles()[this.getIndex()];
  }
}

Object.assign(globalThis, {
  getRandomInt,
  getRandomFloat,
  degRad,
  isAngleBetween,
  aveArray,
  getFontSizeToFit,
  isPointInCircle,
  translateXYToElement,
  getMouseButtonsPressed,
  getAngle,
  getDistanceBetweenPoints,
  addAngle,
  diffAngle,
  calcWheelRotationForTargetAngle,
  isObject,
  isNumber,
  setProp,
  fixFloat,
  easeSinOut,
  getResizeObserver,
  arcAdjust,
  baseCanvasSize,
  dragCapturePeriod,
  AlignText,
  Defaults,
  Debugging,
  Item,
});

export { Item };
