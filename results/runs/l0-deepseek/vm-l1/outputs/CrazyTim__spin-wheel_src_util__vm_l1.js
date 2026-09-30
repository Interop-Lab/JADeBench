const getRandomInt = function(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const getRandomFloat = function(min, max) {
  return Math.random() * (max - min) + min;
};

const degRad = function(deg) {
  return deg * Math.PI / 180;
};

const isAngleBetween = function(angle, start, end) {
  angle = ((angle - start) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
  end = ((end - start) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
  return angle <= end;
};

const aveArray = function(arr) {
  if (!arr || arr.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i];
  }
  return sum / arr.length;
};

const getFontSizeToFit = function(text, maxWidth, font, startSize) {
  startSize = startSize || 100;
  let size = startSize;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.font = size + 'px ' + font;
  while (ctx.measureText(text).width > maxWidth && size > 1) {
    size--;
    ctx.font = size + 'px ' + font;
  }
  return size;
};

const isPointInCircle = function(x, y, cx, cy, r) {
  const dx = x - cx;
  const dy = y - cy;
  return dx * dx + dy * dy <= r * r;
};

const translateXYToElement = function(element, x, y) {
  const rect = element.getBoundingClientRect();
  return {
    x: x - rect.left,
    y: y - rect.top
  };
};

const getMouseButtonsPressed = function(event) {
  const buttons = [];
  if (event.buttons & 1) buttons.push('left');
  if (event.buttons & 2) buttons.push('right');
  if (event.buttons & 4) buttons.push('middle');
  return buttons;
};

const getAngle = function(x1, y1, x2, y2) {
  return Math.atan2(y2 - y1, x2 - x1);
};

const getDistanceBetweenPoints = function(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
};

const addAngle = function(angle1, angle2) {
  let result = angle1 + angle2;
  while (result > Math.PI) result -= 2 * Math.PI;
  while (result < -Math.PI) result += 2 * Math.PI;
  return result;
};

const diffAngle = function(angle1, angle2) {
  let diff = angle2 - angle1;
  while (diff > Math.PI) diff -= 2 * Math.PI;
  while (diff < -Math.PI) diff += 2 * Math.PI;
  return diff;
};

const calcWheelRotationForTargetAngle = function(currentAngle, targetAngle) {
  const diff = diffAngle(currentAngle, targetAngle);
  return currentAngle + diff;
};

const isObject = function(value) {
  return value !== null && typeof value === 'object';
};

const isNumber = function(value) {
  return typeof value === 'number' && !isNaN(value);
};

const setProp = function(obj, prop, value) {
  obj[prop] = value;
  return value;
};

const fixFloat = function(num, precision) {
  precision = precision || 2;
  const factor = Math.pow(10, precision);
  return Math.round(num * factor) / factor;
};

const easeSinOut = function(t) {
  return (1 - Math.cos(t * Math.PI)) / 2;
};

const getResizeObserver = function(callback) {
  if (typeof ResizeObserver !== 'undefined') {
    return new ResizeObserver(callback);
  }
  return null;
};

export {
  addAngle,
  aveArray,
  calcWheelRotationForTargetAngle,
  degRad,
  diffAngle,
  easeSinOut,
  fixFloat,
  getAngle,
  getDistanceBetweenPoints,
  getFontSizeToFit,
  getMouseButtonsPressed,
  getRandomFloat,
  getRandomInt,
  getResizeObserver,
  isAngleBetween,
  isNumber,
  isObject,
  isPointInCircle,
  setProp,
  translateXYToElement
};
