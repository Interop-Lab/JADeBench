const arcAdjust = -90;
const baseCanvasSize = 500;
const dragCapturePeriod = 250;

const AlignText = Object.freeze({
  left: "left",
  right: "right",
  center: "center"
});

const Defaults = Object.freeze({
  wheel: {
    borderColor: "#fff",
    borderWidth: 1,
    debug: false,
    image: null,
    isInteractive: true,
    itemBackgroundColors: ["#000"],
    itemLabelAlign: AlignText.right,
    itemLabelBaselineOffset: 0,
    itemLabelColors: ["#fff"],
    itemLabelFont: "sans-serif",
    itemLabelFontSizeMax: 40,
    itemLabelRadius: 0.85,
    itemLabelRadiusMax: 0.2,
    itemLabelRotation: 0,
    itemLabelStrokeColor: "#000",
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

const Debugging = Object.freeze({
  pointerLineColor: "#00ff00",
  labelBoundingBoxColor: "#ff00ff",
  labelRadiusColor: "#000",
  dragPointHue: 300
});

function getRandomInt(min, max) {
  if (max === undefined) {
    max = min;
    min = 0;
  }
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min = 0, max = 1) {
  return Math.random() * (max - min) + min;
}

function degRad(degrees) {
  return degrees * Math.PI / 180;
}

function isAngleBetween(angle, startAngle, endAngle) {
  angle = ((angle % 360) + 360) % 360;
  startAngle = ((startAngle % 360) + 360) % 360;
  endAngle = ((endAngle % 360) + 360) % 360;

  if (startAngle <= endAngle) {
    return angle >= startAngle && angle <= endAngle;
  }

  return angle >= startAngle || angle <= endAngle;
}

function aveArray(values) {
  return values.length === 0
    ? 0
    : values.reduce((sum, value) => sum + value, 0) / values.length;
}

function getFontSizeToFit(text, font, maxWidth, maxFontSize) {
  if (typeof document === "undefined") {
    return maxFontSize;
  }

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  let fontSize = maxFontSize;

  while (fontSize > 0) {
    context.font = `${fontSize}px ${font}`;
    if (context.measureText(text).width <= maxWidth) {
      break;
    }
    fontSize -= 1;
  }

  return fontSize;
}

function isPointInCircle(point, center, radius) {
  const dx = point.x - center.x;
  const dy = point.y - center.y;
  return dx * dx + dy * dy <= radius * radius;
}

function translateXYToElement(x, y, element) {
  const rect = element.getBoundingClientRect();
  return {
    x: x - rect.left,
    y: y - rect.top
  };
}

function getMouseButtonsPressed(event) {
  return event.buttons;
}

function getAngle(x1, y1, x2, y2) {
  return Math.atan2(y2 - y1, x2 - x1);
}

function getDistanceBetweenPoints(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

function addAngle(angle, amount) {
  return angle + amount;
}

function diffAngle(angle1, angle2) {
  let difference = angle1 - angle2;
  while (difference > Math.PI) difference -= Math.PI * 2;
  while (difference < -Math.PI) difference += Math.PI * 2;
  return difference;
}

function calcWheelRotationForTargetAngle(currentRotation, targetAngle) {
  return targetAngle - currentRotation;
}

function isObject(value) {
  return value !== null && typeof value === "object";
}

function isNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function setProp(object, property, value) {
  object[property] = value;
  return object;
}

function fixFloat(value, decimals = 2) {
  return Number(Number(value).toFixed(decimals));
}

function easeSinOut(value) {
  return Math.sin(value * Math.PI / 2);
}

function getResizeObserver(callback) {
  if (typeof ResizeObserver === "undefined") {
    return null;
  }
  return new ResizeObserver(callback);
}

class Item {
  constructor(options = {}) {
    this.init();
    Object.assign(this, options);
  }

  init() {
    this._backgroundColor = Defaults.item.backgroundColor;
    this._image = Defaults.item.image;
    this._imageOpacity = Defaults.item.imageOpacity;
    this._imageRadius = Defaults.item.imageRadius;
    this._imageRotation = Defaults.item.imageRotation;
    this._imageScale = Defaults.item.imageScale;
    this._label = Defaults.item.label;
    this._labelColor = Defaults.item.labelColor;
    this._value = Defaults.item.value;
    this._weight = Defaults.item.weight;
    this._index = 0;
    this._startAngle = 0;
    this._endAngle = 0;
    this._centerAngle = 0;
    return this;
  }

  get backgroundColor() {
    return this._backgroundColor;
  }

  set backgroundColor(value) {
    this._backgroundColor = value;
  }

  get image() {
    return this._image;
  }

  set image(value) {
    this._image = value;
  }

  get imageOpacity() {
    return this._imageOpacity;
  }

  set imageOpacity(value) {
    this._imageOpacity = value;
  }

  get imageRadius() {
    return this._imageRadius;
  }

  set imageRadius(value) {
    this._imageRadius = value;
  }

  get imageRotation() {
    return this._imageRotation;
  }

  set imageRotation(value) {
    this._imageRotation = value;
  }

  get imageScale() {
    return this._imageScale;
  }

  set imageScale(value) {
    this._imageScale = value;
  }

  get label() {
    return this._label;
  }

  set label(value) {
    this._label = value;
  }

  get labelColor() {
    return this._labelColor;
  }

  set labelColor(value) {
    this._labelColor = value;
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
    this._weight = value;
  }

  getIndex() {
    return this._index;
  }

  getStartAngle() {
    return this._startAngle;
  }

  getEndAngle() {
    return this._endAngle;
  }

  getCenterAngle() {
    return this._centerAngle || (this._startAngle + this._endAngle) / 2;
  }
}

globalThis.getRandomInt = getRandomInt;
globalThis.getRandomFloat = getRandomFloat;
globalThis.degRad = degRad;
globalThis.isAngleBetween = isAngleBetween;
globalThis.aveArray = aveArray;
globalThis.getFontSizeToFit = getFontSizeToFit;
globalThis.isPointInCircle = isPointInCircle;
globalThis.translateXYToElement = translateXYToElement;
globalThis.getMouseButtonsPressed = getMouseButtonsPressed;
globalThis.getAngle = getAngle;
globalThis.getDistanceBetweenPoints = getDistanceBetweenPoints;
globalThis.addAngle = addAngle;
globalThis.diffAngle = diffAngle;
globalThis.calcWheelRotationForTargetAngle = calcWheelRotationForTargetAngle;
globalThis.isObject = isObject;
globalThis.isNumber = isNumber;
globalThis.setProp = setProp;
globalThis.fixFloat = fixFloat;
globalThis.easeSinOut = easeSinOut;
globalThis.getResizeObserver = getResizeObserver;
globalThis.arcAdjust = arcAdjust;
globalThis.baseCanvasSize = baseCanvasSize;
globalThis.dragCapturePeriod = dragCapturePeriod;
globalThis.AlignText = AlignText;
globalThis.Defaults = Defaults;
globalThis.Debugging = Debugging;
globalThis.Item = Item;

export { Item };
