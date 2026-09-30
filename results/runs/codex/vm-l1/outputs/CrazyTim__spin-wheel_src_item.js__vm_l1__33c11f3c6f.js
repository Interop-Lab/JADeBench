const root = typeof globalThis !== 'undefined'
  ? globalThis
  : typeof global !== 'undefined'
    ? global
    : typeof self !== 'undefined'
      ? self
      : window;

const shared = root.vm_0x187444_5bfb15 || (root.vm_0x187444_5bfb15 = {});

function getRandomInt(min = 0, max = 0) {
  return Math.floor(Math.random() * (max - min) + min);
}

function getRandomFloat(min = 0, max = 0) {
  return Math.random() * (max - min) + min;
}

function degRad(degrees) {
  return degrees * Math.PI / 180;
}

function addAngle(angle, amount) {
  return (angle + amount % 360 + 360) % 360;
}

function diffAngle(angle1, angle2) {
  const difference = addAngle(angle2, -angle1);
  return difference > 180 ? difference - 360 : difference;
}

function isAngleBetween(angle, start, end) {
  angle = addAngle(angle, 0);
  start = addAngle(start, 0);
  end = addAngle(end, 0);
  return start <= end
    ? angle >= start && angle <= end
    : angle >= start || angle <= end;
}

function aveArray(values) {
  let total = 0;
  for (const value of values) total += value;
  return values.length ? total / values.length : 0;
}

function getFontSizeToFit(text, fontFamily, maxWidth, context) {
  context.save();
  let fontSize = 1;
  context.font = fontSize + 'px ' + fontFamily;
  const width = context.measureText(text).width;
  context.restore();
  return fontSize * maxWidth / width;
}

function isPointInCircle(point, centerX, centerY, radius) {
  return (point.x - centerX) ** 2 + (point.y - centerY) ** 2 <= radius ** 2;
}

function translateXYToElement(point, element, scale) {
  const bounds = element.getBoundingClientRect();
  return {
    x: (point.x - bounds.left) / scale,
    y: (point.y - bounds.top) / scale,
  };
}

function getMouseButtonsPressed(event) {
  return [1, 2, 4].filter(button => event.buttons & button);
}

function getAngle(x1, y1, x2, y2) {
  return Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
}

function getDistanceBetweenPoints(point1, point2) {
  return Math.hypot(point2.x - point1.x, point2.y - point1.y);
}

function calcWheelRotationForTargetAngle(rotation, targetAngle, direction) {
  return rotation + addAngle(rotation, targetAngle) * direction;
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isNumber(value) {
  return typeof value === 'number' && !Number.isNaN(value);
}

function setProp({ val, isValid, errorMessage, defaultValue, action }) {
  action();
}

function fixFloat(value) {
  return Number(value.toFixed(9));
}

function easeSinOut(value) {
  return Math.sin(value * Math.PI / 2);
}

function getResizeObserver(...args) {
  const ResizeObserverClass = ResizeObserver || WebKitResizeObserver;
  return new ResizeObserverClass(...args);
}

const arcAdjust = -90;
const baseCanvasSize = 500;
const dragCapturePeriod = 250;
const AlignText = Object.freeze({ left: 'left', right: 'right', center: 'center' });
const Defaults = Object.freeze({
  wheel: {
    borderColor: '#000', borderWidth: 1, debug: false, image: null,
    isInteractive: true, itemBackgroundColors: ['#fff'],
    itemLabelAlign: AlignText.right, itemLabelBaselineOffset: 0,
    itemLabelColors: ['#000'], itemLabelFont: 'sans-serif',
    itemLabelFontSizeMax: baseCanvasSize, itemLabelRadius: 0.85,
    itemLabelRadiusMax: 0.2, itemLabelRotation: 0,
    itemLabelStrokeColor: '#fff', itemLabelStrokeWidth: 0, items: [],
    lineColor: '#000', lineWidth: 1, pixelRatio: 0, radius: 0.95,
    rotation: 0, rotationResistance: -35, rotationSpeedMax: 300,
    offset: { x: 0, y: 0 }, onCurrentIndexChange: null, onRest: null,
    onSpin: null, overlayImage: null, pointerAngle: 0,
  },
  item: {
    backgroundColor: null, image: null, imageOpacity: 1, imageRadius: 0.5,
    imageRotation: 0, imageScale: 1, label: '', labelColor: null,
    value: null, weight: 1,
  },
});
const Debugging = Object.freeze({
  pointerLineColor: '#ff00ff',
  labelBoundingBoxColor: '#ff00ff',
  labelRadiusColor: '#00ff00',
  dragPointHue: 300,
});

class Item {
  constructor(wheel) {
    if (!shared.Wheel || !(wheel instanceof shared.Wheel)) {
      throw new Error('wheel must be an instance of Wheel');
    }
    this._wheel = wheel;
    this.init();
  }

  init() {
    for (const [property, value] of Object.entries(Defaults.item)) this[property] = value;
  }

  get backgroundColor() { return this._backgroundColor; }
  set backgroundColor(value) {
    this._backgroundColor = typeof value === 'string' ? value : null;
    this._wheel.refresh();
  }

  get image() { return this._image; }
  set image(value) {
    this._image = value instanceof HTMLImageElement ? value : null;
    this._wheel.refresh();
  }

  get imageOpacity() { return this._imageOpacity; }
  set imageOpacity(value) {
    this._imageOpacity = typeof value === 'number' ? value : 1;
    this._wheel.refresh();
  }

  get imageRadius() { return this._imageRadius; }
  set imageRadius(value) {
    this._imageRadius = isNumber(value) ? value : 0.5;
    this._wheel.refresh();
  }

  get imageRotation() { return this._imageRotation; }
  set imageRotation(value) {
    this._imageRotation = isNumber(value) ? value : 0;
    this._wheel.refresh();
  }

  get imageScale() { return this._imageScale; }
  set imageScale(value) {
    this._imageScale = isNumber(value) ? value : 1;
    this._wheel.refresh();
  }

  get label() { return this._label; }
  set label(value) {
    this._label = typeof value === 'string' ? value : '';
    this._wheel.refresh();
  }

  get labelColor() { return this._labelColor; }
  set labelColor(value) {
    this._labelColor = typeof value === 'string' ? value : null;
    this._wheel.refresh();
  }

  get value() { return this._value; }
  set value(value) { this._value = value === undefined ? null : value; }

  get weight() { return this._weight; }
  set weight(value) { this._weight = isNumber(value) ? value : 1; }

  getIndex() {
    const index = this._wheel.items.indexOf(this);
    if (index < 0) throw new Error('Item not found in parent Wheel');
    return index;
  }

  getCenterAngle() {
    const angles = this._wheel.getItemAngles()[this.getIndex()];
    return (angles.start + angles.end) / 2;
  }

  getStartAngle() {
    return this._wheel.getItemAngles()[this.getIndex()].start;
  }

  getEndAngle() {
    return this._wheel.getItemAngles()[this.getIndex()].end;
  }

  getRandomAngle() {
    const angles = this._wheel.getItemAngles()[this.getIndex()];
    return getRandomFloat(angles.start, angles.end);
  }
}

Object.assign(shared, {
  getRandomInt, getRandomFloat, degRad, isAngleBetween, aveArray,
  getFontSizeToFit, isPointInCircle, translateXYToElement,
  getMouseButtonsPressed, getAngle, getDistanceBetweenPoints, addAngle,
  diffAngle, calcWheelRotationForTargetAngle, isObject, isNumber, setProp,
  fixFloat, easeSinOut, getResizeObserver, arcAdjust, baseCanvasSize,
  dragCapturePeriod, AlignText, Defaults, Debugging, Item,
});
Object.assign(root, shared);

export { Item };
