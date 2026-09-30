const FULL_CIRCLE = 360;

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
  return (angle + amount + FULL_CIRCLE) % FULL_CIRCLE;
}

function diffAngle(angle, reference) {
  return (angle - reference + 540) % FULL_CIRCLE - 180;
}

function isAngleBetween(angle, start, end) {
  return addAngle(angle, -start) <= addAngle(end, -start);
}

function aveArray(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function getDistanceBetweenPoints(first, second) {
  return Math.hypot(second.x - first.x, second.y - first.y);
}

function isPointInCircle(point, center, radius) {
  return getDistanceBetweenPoints(point, center) <= radius;
}

function getAngle(first, second) {
  return addAngle(Math.atan2(second.y - first.y, second.x - first.x) * 180 / Math.PI, 90);
}

function getMouseButtonsPressed(event) {
  if (typeof event.buttons === 'number') return event.buttons;
  return event.which ? 1 << (event.which - 1) : 0;
}

function translateXYToElement(point, element) {
  const bounds = element.getBoundingClientRect();
  return { x: point.x - bounds.left, y: point.y - bounds.top };
}

function calcWheelRotationForTargetAngle(targetAngle, pointerAngle, currentRotation = 0) {
  return currentRotation + diffAngle(pointerAngle, addAngle(targetAngle, currentRotation));
}

function isObject(value) {
  return value !== null && typeof value === 'object';
}

function isNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

function setProp(target, property, value, validator) {
  if (validator && !validator(value)) throw new TypeError(`Invalid value for ${property}`);
  target[property] = value;
  return value;
}

function fixFloat(value) {
  return Number.parseFloat(value.toFixed(10));
}

function easeSinOut(value) {
  return Math.sin(value * Math.PI / 2);
}

function getResizeObserver() {
  return typeof globalThis.ResizeObserver === 'function' ? globalThis.ResizeObserver : null;
}

function getFontSizeToFit(context, text, width, maximumSize) {
  for (let size = maximumSize; size > 0; size--) {
    context.font = `${size}px sans-serif`;
    if (context.measureText(text).width <= width) return size;
  }
  return 0;
}

const arcAdjust = -90;
const baseCanvasSize = 500;
const dragCapturePeriod = 250;
const AlignText = Object.freeze({ left: 'left', right: 'right', center: 'center' });
const Defaults = Object.freeze({
  wheel: {
    borderColor: '#000', borderWidth: 1, debug: false, image: null, isInteractive: true,
    itemBackgroundColors: ['#fff'], itemLabelAlign: AlignText.right,
    itemLabelBaselineOffset: 0, itemLabelColors: ['#000'], itemLabelFont: 'sans-serif',
    itemLabelFontSizeMax: baseCanvasSize, itemLabelRadius: 0.85, itemLabelRadiusMax: 0.2,
    itemLabelRotation: 0, itemLabelStrokeColor: '#fff', itemLabelStrokeWidth: 0,
    items: [], lineColor: '#000', lineWidth: 1, pixelRatio: 0, radius: 0.95,
    rotation: 0, rotationResistance: -35, rotationSpeedMax: 300, offset: { x: 0, y: 0 },
    onCurrentIndexChange: null, onRest: null, onSpin: null, overlayImage: null, pointerAngle: 0,
  },
  item: {
    backgroundColor: null, image: null, imageOpacity: 1, imageRadius: 0.5,
    imageRotation: 0, imageScale: 1, label: '', labelColor: null, value: null, weight: 1,
  },
});
const Debugging = Object.freeze({
  pointerLineColor: '#ff00ff',
  labelBoundingBoxColor: '#ff00ff',
  labelRadiusColor: '#00ff00',
  dragPointHue: 300,
});

const isNullableString = value => value === null || typeof value === 'string';
const isImage = value => value === null ||
  (typeof globalThis.HTMLImageElement === 'function' && value instanceof globalThis.HTMLImageElement);

function getItemArcSize(item) {
  const items = item._wheel && item._wheel.items;
  if (!items || item.getIndex() < 0) return 0;
  const totalWeight = items.reduce((sum, candidate) => sum + candidate.weight, 0);
  return FULL_CIRCLE * item.weight / totalWeight;
}

class Item {
  constructor(properties = {}) {
    this._wheel = null;
    this._backgroundColor = null;
    this._image = null;
    this._imageOpacity = 1;
    this._imageRadius = 0.5;
    this._imageRotation = 0;
    this._imageScale = 1;
    this._label = '';
    this._labelColor = null;
    this._value = null;
    this._weight = 1;
    this.init(properties);
  }

  init(properties = {}) {
    Object.assign(this, Defaults.item, properties);
    return this;
  }

  get backgroundColor() { return this._backgroundColor; }
  set backgroundColor(value) { setProp(this, '_backgroundColor', value, isNullableString); }
  get image() { return this._image; }
  set image(value) { setProp(this, '_image', value, isImage); }
  get imageOpacity() { return this._imageOpacity; }
  set imageOpacity(value) {
    setProp(this, '_imageOpacity', value, candidate => isNumber(candidate) && candidate >= 0 && candidate <= 1);
  }
  get imageRadius() { return this._imageRadius; }
  set imageRadius(value) {
    setProp(this, '_imageRadius', value, candidate => isNumber(candidate) && candidate >= 0 && candidate <= 1);
  }
  get imageRotation() { return this._imageRotation; }
  set imageRotation(value) { setProp(this, '_imageRotation', value, isNumber); }
  get imageScale() { return this._imageScale; }
  set imageScale(value) {
    setProp(this, '_imageScale', value, candidate => isNumber(candidate) && candidate >= 0);
  }
  get label() { return this._label; }
  set label(value) { setProp(this, '_label', value, candidate => typeof candidate === 'string'); }
  get labelColor() { return this._labelColor; }
  set labelColor(value) { setProp(this, '_labelColor', value, isNullableString); }
  get value() { return this._value; }
  set value(value) { this._value = value; }
  get weight() { return this._weight; }
  set weight(value) { setProp(this, '_weight', value, candidate => isNumber(candidate) && candidate > 0); }

  getIndex() {
    return this._wheel && Array.isArray(this._wheel.items) ? this._wheel.items.indexOf(this) : -1;
  }

  getStartAngle() {
    const items = this._wheel && this._wheel.items;
    const index = this.getIndex();
    if (!items || index < 0) return 0;
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    const precedingWeight = items.slice(0, index).reduce((sum, item) => sum + item.weight, 0);
    return FULL_CIRCLE * precedingWeight / totalWeight;
  }

  getCenterAngle() { return addAngle(this.getStartAngle(), getItemArcSize(this) / 2); }
  getEndAngle() { return addAngle(this.getStartAngle(), getItemArcSize(this)); }
  getRandomAngle() { return addAngle(this.getStartAngle(), getRandomFloat(0, getItemArcSize(this))); }
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
