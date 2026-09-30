const runtimeGlobal =
  typeof globalThis !== 'undefined'
    ? globalThis
    : typeof global !== 'undefined'
      ? global
      : typeof self !== 'undefined'
        ? self
        : window;

function getRandomInt(...args) {
  let [min, max] = args;
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}

function getRandomFloat(...args) {
  const [min, max] = args;
  return parseFloat((Math.random() * (max - min) + min).toFixed(30));
}

function degRad(...args) {
  const [degrees] = args;
  return degrees * (Math.PI / 180);
}

function isAngleBetween(angle, startAngle, endAngle) {
  if (startAngle < endAngle) {
    return angle >= startAngle && angle < endAngle;
  }
  return angle >= startAngle || angle < endAngle;
}

function aveArray(...args) {
  const [values] = args;
  if (values.length === 0) return 0;
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function getFontSizeToFit(text, fontFamily, maxWidth, context) {
  context.save();
  context.font = `1px ${fontFamily}`;
  const measuredWidth = context.measureText(text).width;
  context.restore();
  return maxWidth / measuredWidth;
}

function isPointInCircle(...args) {
  const [point, centerX, centerY, radius] = args;
  return Math.hypot(point.x - centerX, point.y - centerY) <= radius;
}

function translateXYToElement(...args) {
  const [point, element] = args;
  const bounds = element.getBoundingClientRect();
  return {
    x: point.x - bounds.left,
    y: point.y - bounds.top,
  };
}

function getMouseButtonsPressed(...args) {
  const [event] = args;
  return [1, 2, 4, 8, 16].filter((button) => event.buttons & button);
}

function getAngle(originX, originY, targetX, targetY) {
  const angle = Math.atan2(targetY - originY, targetX - originX) * (180 / Math.PI);
  return angle < 0 ? angle + 360 : angle;
}

function getDistanceBetweenPoints(...args) {
  const [firstPoint, secondPoint] = args;
  return Math.hypot(
    secondPoint.x - firstPoint.x,
    secondPoint.y - firstPoint.y,
  );
}

function addAngle(...args) {
  const [angle, amount] = args;
  return ((angle + amount) % 360 + 360) % 360;
}

function diffAngle(...args) {
  const [firstAngle, secondAngle] = args;
  const difference = addAngle(secondAngle - firstAngle + 180, 0) - 180;
  return difference === -180 ? 180 : difference;
}

function calcWheelRotationForTargetAngle(...args) {
  const [currentRotation, targetAngle, direction] = args;
  const angle = addAngle(currentRotation, targetAngle);
  const directedAngle = direction === 1 ? addAngle(-angle, 0) : angle;
  return fixFloat(currentRotation + directedAngle * direction);
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isNumber(value) {
  return typeof value === 'number' && !Number.isNaN(value);
}

function setProp({ val, isValid, errorMessage, defaultValue, action }) {
  if (val === undefined) return defaultValue;
  if (!isValid) throw new Error(errorMessage);
  return action();
}

function fixFloat(...args) {
  const [value] = args;
  return Number(value.toFixed(9));
}

function easeSinOut(value) {
  return Math.sin(value * (Math.PI / 2));
}

function getResizeObserver(...args) {
  const [element, onResize] = args;
  const browserWindow = runtimeGlobal.window ?? runtimeGlobal;

  if (typeof browserWindow.ResizeObserver === 'function') {
    const observer = new browserWindow.ResizeObserver(() => {
      onResize({ redraw: true });
    });
    observer.observe(element);

    return {
      stop() {
        observer.unobserve(element);
        observer.disconnect();
      },
    };
  }

  browserWindow.addEventListener('resize', onResize);
  return {
    stop() {
      browserWindow.removeEventListener('resize', onResize);
    },
  };
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
  dragPointHue: 300,
});

class Item {
  constructor(wheel, props = null) {
    if (!isObject(wheel)) {
      throw new Error('wheel must be an instance of Wheel');
    }
    if (props !== null && !isObject(props)) {
      throw new Error('props must be an Object or null');
    }

    this._wheel = wheel;
    this.init(props);
  }

  init(props = null) {
    const values = props ?? {};
    for (const property of Object.keys(Defaults.item)) {
      this[property] = property in values
        ? values[property]
        : Defaults.item[property];
    }
  }

  get backgroundColor() {
    return this._backgroundColor;
  }

  set backgroundColor(value) {
    this._backgroundColor = typeof value === 'string'
      ? value
      : Defaults.item.backgroundColor;
    this._wheel.refresh();
  }

  get image() {
    return this._image;
  }

  set image(value) {
    const ImageElement = runtimeGlobal.HTMLImageElement;
    this._image =
      typeof ImageElement === 'function' && value instanceof ImageElement
        ? value
        : Defaults.item.image;
    this._wheel.refresh();
  }

  get imageOpacity() {
    return this._imageOpacity;
  }

  set imageOpacity(value) {
    this._imageOpacity = isNumber(value)
      ? value
      : Defaults.item.imageOpacity;
    this._wheel.refresh();
  }

  get imageRadius() {
    return this._imageRadius;
  }

  set imageRadius(value) {
    this._imageRadius = isNumber(value)
      ? value
      : Defaults.item.imageRadius;
    this._wheel.refresh();
  }

  get imageRotation() {
    return this._imageRotation;
  }

  set imageRotation(value) {
    this._imageRotation = isNumber(value)
      ? value
      : Defaults.item.imageRotation;
    this._wheel.refresh();
  }

  get imageScale() {
    return this._imageScale;
  }

  set imageScale(value) {
    this._imageScale = isNumber(value)
      ? value
      : Defaults.item.imageScale;
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
    this._labelColor = typeof value === 'string'
      ? value
      : Defaults.item.labelColor;
    this._wheel.refresh();
  }

  get value() {
    return this._value;
  }

  set value(value) {
    this._value = value === undefined ? Defaults.item.value : value;
  }

  get weight() {
    return this._weight;
  }

  set weight(value) {
    this._weight = isNumber(value) ? value : Defaults.item.weight;
  }

  getIndex() {
    const index = this._wheel.items.findIndex((item) => item === this);
    if (index === -1) throw new Error('Item not found in parent Wheel');
    return index;
  }

  getCenterAngle() {
    const { start, end } = this._wheel.getItemAngles()[this.getIndex()];
    return (start + end) / 2;
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

const publicGlobals = {
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
};

Object.assign(runtimeGlobal, publicGlobals);

export { Item };
