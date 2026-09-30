/*
 * Wheel item model and the small geometry/DOM utility set bundled with it.
 * The original module also exposed these values on globalThis, so that
 * compatibility behavior is retained below. Item is the sole ESM export.
 */

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

function degRad(degrees) {
  return degrees * Math.PI / 180;
}

function addAngle(angle, amount) {
  return ((angle + amount) % 360 + 360) % 360;
}

function diffAngle(from, to) {
  let difference = addAngle(to - from, 180) - 180;
  if (difference === -180) difference = 180;
  return difference;
}

function isAngleBetween(angle, start, end) {
  if (start <= end) return angle >= start && angle <= end;
  return angle >= start || angle <= end;
}

function aveArray(values) {
  const numbers = [...values].filter(isNumber);
  return numbers.length ? numbers.reduce((sum, value) => sum + value, 0) / numbers.length : 0;
}

function getFontSizeToFit(text, fontFamily, maxWidth, context) {
  context.save();
  context.font = `1px ${fontFamily}`;
  const measuredWidth = context.measureText(text).width;
  context.restore();
  return measuredWidth ? maxWidth / measuredWidth : 0;
}

function getDistanceBetweenPoints(first, second) {
  return Math.hypot(second.x - first.x, second.y - first.y);
}

function isPointInCircle(point, center, radius) {
  return getDistanceBetweenPoints(point, center) <= radius;
}

function translateXYToElement(point, element) {
  const bounds = element.getBoundingClientRect();
  return { x: point.x - bounds.left, y: point.y - bounds.top };
}

function getMouseButtonsPressed(event) {
  const pressed = [];
  if (event.buttons & 1) pressed.push(1);
  if (event.buttons & 2) pressed.push(2);
  if (event.buttons & 4) pressed.push(3);
  if (event.buttons & 8) pressed.push(4);
  if (event.buttons & 16) pressed.push(5);
  return pressed;
}

function getAngle(x1, y1, x2, y2) {
  return addAngle(Math.atan2(y1 - y2, x1 - x2) * 180 / Math.PI, 180);
}

function calcWheelRotationForTargetAngle(currentRotation, targetAngle) {
  return currentRotation + addAngle(-targetAngle, 0);
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isNumber(value) {
  return typeof value === 'number' && !Number.isNaN(value);
}

function setProp({ val, isValid, errorMessage, defaultValue, action }) {
  if (isValid(val)) {
    action();
  } else if (typeof errorMessage === 'function') {
    throw new Error(errorMessage(val));
  } else {
    val = defaultValue;
    action();
  }
}

function fixFloat(value) {
  return Number.parseFloat(value.toFixed(9));
}

function easeSinOut(value) {
  return Math.sin(value * Math.PI / 2);
}

function getResizeObserver(callback) {
  if (typeof ResizeObserver === 'undefined') {
    return { observe() {}, unobserve() {}, disconnect() {} };
  }
  return new ResizeObserver(callback);
}

const arcAdjust = -90;
const baseCanvasSize = 500;
const dragCapturePeriod = 250;

const AlignText = Object.freeze({
  left: 'left',
  right: 'right',
  center: 'center',
});

const Defaults = Object.freeze({
  wheel: {
    borderColor: '#000',
    borderWidth: 1,
    debug: false,
    image: null,
    isInteractive: true,
    itemBackgroundColors: ['#fff'],
    itemLabelAlign: AlignText.right,
    itemLabelBaselineOffset: 0,
    itemLabelColors: ['#000'],
    itemLabelFont: 'sans-serif',
    itemLabelFontSizeMax: baseCanvasSize,
    itemLabelRadius: 0.85,
    itemLabelRadiusMax: 0.2,
    itemLabelRotation: 0,
    itemLabelStrokeColor: '#fff',
    itemLabelStrokeWidth: 0,
    items: [],
    lineColor: '#000',
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
    label: '',
    labelColor: null,
    value: null,
    weight: 1,
  },
});

const Debugging = Object.freeze({
  pointerLineColor: '#ff00ff',
  labelBoundingBoxColor: '#ff00ff',
  labelRadiusColor: '#00ff00',
  dragPointHue: 180,
});

class Item {
  constructor(wheel, props = {}) {
    if (props === null) props = {};
    if (!isObject(props)) throw new Error('props must be an Object or null');
    this._wheel = wheel;
    this.init(props);
  }

  init(props = {}) {
    this.backgroundColor = props.backgroundColor ?? Defaults.item.backgroundColor;
    this.image = props.image ?? Defaults.item.image;
    this.imageOpacity = props.imageOpacity ?? Defaults.item.imageOpacity;
    this.imageRadius = props.imageRadius ?? Defaults.item.imageRadius;
    this.imageRotation = props.imageRotation ?? Defaults.item.imageRotation;
    this.imageScale = props.imageScale ?? Defaults.item.imageScale;
    this.label = props.label ?? Defaults.item.label;
    this.labelColor = props.labelColor ?? Defaults.item.labelColor;
    this.value = props.value ?? Defaults.item.value;
    this.weight = props.weight ?? Defaults.item.weight;
  }

  get backgroundColor() { return this._backgroundColor; }
  set backgroundColor(value) {
    this._backgroundColor = typeof value === 'string' ? value : Defaults.item.backgroundColor;
    this._wheel.refresh();
  }

  get image() { return this._image; }
  set image(value) {
    const validImage = value === null
      || (typeof HTMLImageElement !== 'undefined' && value instanceof HTMLImageElement);
    this._image = validImage ? value : Defaults.item.image;
    this._wheel.refresh();
  }

  get imageOpacity() { return this._imageOpacity; }
  set imageOpacity(value) {
    this._imageOpacity = typeof value === 'number' ? value : Defaults.item.imageOpacity;
    this._wheel.refresh();
  }

  get imageRadius() { return this._imageRadius; }
  set imageRadius(value) {
    this._imageRadius = typeof value === 'number' ? value : Defaults.item.imageRadius;
    this._wheel.refresh();
  }

  get imageRotation() { return this._imageRotation; }
  set imageRotation(value) {
    this._imageRotation = typeof value === 'number' ? value : Defaults.item.imageRotation;
    this._wheel.refresh();
  }

  get imageScale() { return this._imageScale; }
  set imageScale(value) {
    this._imageScale = typeof value === 'number' ? value : Defaults.item.imageScale;
    this._wheel.refresh();
  }

  get label() { return this._label; }
  set label(value) {
    this._label = typeof value === 'string' ? value : Defaults.item.label;
    this._wheel.refresh();
  }

  get labelColor() { return this._labelColor; }
  set labelColor(value) {
    this._labelColor = typeof value === 'string' ? value : Defaults.item.labelColor;
    this._wheel.refresh();
  }

  get value() { return this._value; }
  set value(value) {
    this._value = value;
  }

  get weight() { return this._weight; }
  set weight(value) {
    this._weight = typeof value === 'number' ? value : Defaults.item.weight;
  }

  getIndex() {
    const index = this._wheel.items.indexOf(this);
    if (index < 0) throw new Error('Item not found in parent Wheel');
    return index;
  }

  getStartAngle() {
    return this._wheel.getItemAngles()[this.getIndex()].start;
  }

  getCenterAngle() {
    const angles = this._wheel.getItemAngles()[this.getIndex()];
    return aveArray([angles.start, angles.end]);
  }

  getEndAngle() {
    return this._wheel.getItemAngles()[this.getIndex()].end;
  }

  getRandomAngle() {
    return getRandomFloat(this.getStartAngle(), this.getEndAngle());
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
