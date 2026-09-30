function getRandomInt(minimum = 0, maximum = 1) {
  const lower = Math.ceil(minimum);
  const upper = Math.floor(maximum);
  return Math.floor(Math.random() * (upper - lower)) + lower;
}

function getRandomFloat(minimum = 0, maximum = 1, precision = 2) {
  return Number((Math.random() * (maximum - minimum) + minimum).toFixed(precision));
}

function degRad(degrees = 0) {
  return (degrees * Math.PI) / 180;
}

function isAngleBetween(angle, startAngle, endAngle) {
  if (startAngle <= endAngle) return angle >= startAngle && angle <= endAngle;
  return angle >= startAngle || angle <= endAngle;
}

function aveArray(values = []) {
  return values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length;
}

function getFontSizeToFit(text, maximumWidth, font = 'sans-serif', maximumSize = 100) {
  if (typeof document === 'undefined') return maximumSize;
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  let size = maximumSize;
  context.font = `${size}px ${font}`;
  while (size > 0 && context.measureText(text).width > maximumWidth) {
    size -= 1;
    context.font = `${size}px ${font}`;
  }
  return size;
}

function isPointInCircle(point, circle) {
  const dx = point.x - circle.x;
  const dy = point.y - circle.y;
  return dx * dx + dy * dy <= circle.radius * circle.radius;
}

function translateXYToElement(x, y, element) {
  const bounds = element.getBoundingClientRect();
  return { x: x - bounds.left, y: y - bounds.top };
}

function getMouseButtonsPressed(event) {
  return event.buttons;
}

function getAngle(firstPoint, secondPoint) {
  return Math.atan2(secondPoint.y - firstPoint.y, secondPoint.x - firstPoint.x);
}

function getDistanceBetweenPoints(firstPoint, secondPoint) {
  return Math.hypot(secondPoint.x - firstPoint.x, secondPoint.y - firstPoint.y);
}

function addAngle(angle, amount) {
  return (angle + amount) % (Math.PI * 2);
}

function diffAngle(firstAngle, secondAngle) {
  return Math.atan2(Math.sin(secondAngle - firstAngle), Math.cos(secondAngle - firstAngle));
}

function calcWheelRotationForTargetAngle(currentAngle, targetAngle, resistance = 1) {
  return diffAngle(currentAngle, targetAngle) * resistance;
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

function setProp(target, property, value) {
  if (value !== undefined) target[property] = value;
  return target;
}

function fixFloat(value, decimalPlaces = 2) {
  return Number(value.toFixed(decimalPlaces));
}

function easeSinOut(progress) {
  return Math.sin((progress * Math.PI) / 2);
}

function getResizeObserver(callback) {
  if (typeof ResizeObserver === 'undefined') return null;
  return new ResizeObserver(callback);
}

const defaultOptions = {
  borderColor: '#000',
  borderWidth: 1,
  debug: false,
  image: null,
  interactive: true,
  itemBackgroundColors: ['#fff'],
  itemLabelAlign: 'right',
  itemLabelBaseline: 'middle',
  itemLabelColors: ['#000'],
  itemLabelFont: 'sans-serif',
  itemLabelFontSizeMax: 20,
  itemLabelRadius: 0,
  itemLabelRadiusMax: 1,
  itemLabelRotation: 0,
  itemLabelStrokeColor: '#fff',
  itemLabelStrokeWidth: 0,
  items: [],
  lineColor: '#000',
  lineWidth: 1,
  pixelRatio: 1,
  radius: 1,
  rotation: 0,
};

class Item {
  constructor(value, options = {}) {
    if (!isObject(value)) throw new Error('Item value must be an object');
    if (!isObject(options)) throw new Error('Item options must be an object');
    this.value = value;
    this.options = { ...defaultOptions, ...options };
    this.items = this.options.items;
    this.index = this.items.indexOf(this);
  }

  getIndex() {
    return this.items.indexOf(this);
  }

  getCenterAngle() {
    const start = this.getStartAngle();
    const end = this.getEndAngle();
    return start + diffAngle(start, end) / 2;
  }

  getStartAngle() {
    return this.options.rotation;
  }

  getEndAngle() {
    return this.options.rotation + Math.PI * 2;
  }

  getRandomAngle() {
    return getRandomFloat(this.getStartAngle(), this.getEndAngle());
  }
}

export { Item };
