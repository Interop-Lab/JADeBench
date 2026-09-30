function getRandomInt(min = 0, max = 0) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function getRandomFloat(min = 0, max = 0, decimals = 14) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function degRad(degrees = 0) {
  return degrees * Math.PI / 180;
}

function isAngleBetween(angle, start, end) {
  if (start < end) {
    return start <= angle && angle < end;
  }
  return start <= angle || angle < end;
}

function aveArray(values = []) {
  let sum = 0;
  for (const value of values) {
    if (value) {
      sum += typeof value === 'number' ? value : 0;
    }
  }
  return sum / values.length || 0;
}

function getFontSizeToFit(text, fontFamily, width, context) {
  context.save();
  context.font = `1px ${fontFamily}`;
  const measuredWidth = context.measureText(text).width;
  context.restore();
  return width / measuredWidth;
}

function isPointInCircle(point = { x: 0, y: 0 }, centerX, centerY, radius) {
  const distanceX = point.x - centerX;
  const distanceY = point.y - centerY;
  return distanceX ** 2 + distanceY ** 2 <= radius ** 2;
}

function translateXYToElement(point = { x: 0, y: 0 }, element = {}, scale = 1) {
  const rect = element.getBoundingClientRect();
  return {
    x: (point.x - rect.left) * scale,
    y: (point.y - rect.top) * scale,
  };
}

function getMouseButtonsPressed(event = {}) {
  return [1, 2, 4, 8, 16].filter((button) => event.buttons & button);
}

function getAngle(x1, y1, x2, y2) {
  const distanceX = x1 - x2;
  const distanceY = y1 - y2;
  let angle = Math.atan2(-distanceY, -distanceX) * 180 / Math.PI;
  if (angle < 0) {
    angle += 360;
  }
  return angle;
}

function getDistanceBetweenPoints(point1 = { x: 0, y: 0 }, point2 = { x: 0, y: 0 }) {
  return Math.hypot(point2.x - point1.x, point2.y - point1.y);
}

function addAngle(angle = 0, amount = 0) {
  const sum = angle + amount;
  let result;
  if (sum > 0) {
    result = sum % 360;
  } else {
    result = 360 + sum % 360;
  }
  if (result === 360) {
    result = 0;
  }
  return result;
}

function diffAngle(angle1 = 0, angle2 = 0) {
  const normalizedDifference = addAngle(angle1, 180 - angle2);
  return 180 - normalizedDifference;
}

function calcWheelRotationForTargetAngle(currentRotation = 0, targetAngle = 0, direction = 1) {
  let rotationOffset = (currentRotation % 360 + targetAngle) % 360;
  rotationOffset = fixFloat(rotationOffset);
  rotationOffset = (direction === 1 ? 360 - rotationOffset : 360 + rotationOffset) % 360;
  rotationOffset *= direction;
  return currentRotation + rotationOffset;
}

function isObject(value) {
  return typeof value === 'object' && !Array.isArray(value) && value !== null;
}

function isNumber(value) {
  return typeof value === 'number' && !Number.isNaN(value);
}

function setProp({ val, isValid, errorMessage, defaultValue, action = null }) {
  if (isValid) {
    return action ? action() : val;
  }
  if (val === undefined) {
    return defaultValue;
  }
  throw new Error(errorMessage);
}

function fixFloat(value = 0) {
  return Number(value.toFixed(9));
}

function easeSinOut(value) {
  return Math.sin(value * Math.PI / 2);
}

function getResizeObserver(element = {}, callback = {}) {
  if (window.ResizeObserver) {
    const observer = new ResizeObserver(() => callback({ redraw: true }));
    observer.observe(element);
    return {
      stop() {
        observer.unobserve(element);
        observer.disconnect();
      },
    };
  }

  window.addEventListener('resize', callback);
  return {
    stop() {
      window.removeEventListener('resize', callback);
    },
  };
}

var arcAdjust = -90;
var baseCanvasSize = 500;
var dragCapturePeriod = 250;

var AlignText = Object.freeze({
  left: 'left',
  right: 'right',
  center: 'center',
});

var Defaults = Object.freeze({
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
    itemLabelFontSizeMax: 500,
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

var Debugging = Object.freeze({
  pointerLineColor: '#ff00ff',
  labelBoundingBoxColor: '#ff00ff',
  labelRadiusColor: '#00ff00',
  dragPointHue: 300,
});

class Item {
  constructor(wheel, props = {}) {
    if (!isObject(wheel)) {
      throw new Error('wheel must be an instance of Wheel');
    }
    if (!isObject(props) && props !== null) {
      throw new Error('props must be an Object or null');
    }

    this._wheel = wheel;
    for (const property of Object.keys(Defaults.item)) {
      this[`_${property}`] = Defaults.item[property];
    }

    this.init(props || Defaults.item);
  }

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

  get backgroundColor() {
    return this._backgroundColor;
  }

  set backgroundColor(value) {
    this._backgroundColor = typeof value === 'string' ? value : Defaults.item.backgroundColor;
    this._wheel.refresh();
  }

  get image() {
    return this._image;
  }

  set image(value) {
    this._image = value instanceof HTMLImageElement ? value : Defaults.item.image;
    this._wheel.refresh();
  }

  get imageOpacity() {
    return this._imageOpacity;
  }

  set imageOpacity(value) {
    this._imageOpacity = typeof value === 'number' ? value : Defaults.item.imageOpacity;
    this._wheel.refresh();
  }

  get imageRadius() {
    return this._imageRadius;
  }

  set imageRadius(value) {
    this._imageRadius = typeof value === 'number' ? value : Defaults.item.imageRadius;
    this._wheel.refresh();
  }

  get imageRotation() {
    return this._imageRotation;
  }

  set imageRotation(value) {
    this._imageRotation = typeof value === 'number' ? value : Defaults.item.imageRotation;
    this._wheel.refresh();
  }

  get imageScale() {
    return this._imageScale;
  }

  set imageScale(value) {
    this._imageScale = typeof value === 'number' ? value : Defaults.item.imageScale;
    this._wheel.refresh();
  }

  get label() {
    return this._label;
  }

  set label(value) {
    this._label = typeof value === 'string' ? value : Defaults.item.label;
    this._wheel.refresh();
  }

  get labelColor() {
    return this._labelColor;
  }

  set labelColor(value) {
    this._labelColor = typeof value === 'string' ? value : Defaults.item.labelColor;
    this._wheel.refresh();
  }

  get value() {
    return this._value;
  }

  set value(value) {
    this._value = value !== undefined ? value : Defaults.item.value;
  }

  get weight() {
    return this._weight;
  }

  set weight(value) {
    this._weight = typeof value === 'number' ? value : Defaults.item.weight;
  }

  getIndex() {
    const index = this._wheel.items.findIndex((item) => item === this);
    if (index === -1) {
      throw new Error('Item not found in parent Wheel');
    }
    return index;
  }

  getCenterAngle() {
    const angles = this._wheel.getItemAngles()[this.getIndex()];
    return angles.start + (angles.end - angles.start) / 2;
  }

  getStartAngle() {
    return this._wheel.getItemAngles()[this.getIndex()].start;
  }

  getEndAngle() {
    return this._wheel.getItemAngles()[this.getIndex()].end;
  }

  getRandomAngle() {
    return getRandomFloat(this.getStartAngle(), this.getEndAngle());
  }
}

export { Item };
