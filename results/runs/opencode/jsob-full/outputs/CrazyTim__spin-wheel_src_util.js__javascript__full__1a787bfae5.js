function getRandomInt(min = 0, max = 0) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function getRandomFloat(min = 0, max = 0, precision = 14) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(precision));
}

function degRad(degrees = 0) {
  return degrees * Math.PI / 180;
}

function isAngleBetween(angle, start, end) {
  if (start < end) return start <= angle && angle < end;
  return start < angle || angle < end;
}

function aveArray(values = []) {
  let total = 0;
  for (const value of values) {
    if (value) total += typeof value === "number" ? value : 0;
  }
  return total / values.length || 0;
}

function getFontSizeToFit(text, fontFamily, width, context) {
  context.save();
  context.font = "1px " + fontFamily;
  const measuredWidth = context.measureText(text).width;
  context.restore();
  return width / measuredWidth;
}

function isPointInCircle(point = { x: 0, y: 0 }, centerX, centerY, radius) {
  const distanceSquared = (point.x - centerX) ** 2 + (point.y - centerY) ** 2;
  return distanceSquared <= radius ** 2;
}

function translateXYToElement(point = { x: 0, y: 0 }, element = {}, scale = 1) {
  const bounds = element.getBoundingClientRect();
  return {
    x: (point.x - bounds.left) * scale,
    y: (point.y - bounds.top) * scale,
  };
}

function getMouseButtonsPressed(event = {}) {
  return [1, 2, 4, 8, 16].filter(button => event.buttons & button);
}

function getAngle(x1, y1, x2, y2) {
  const deltaX = x1 - x2;
  const deltaY = y1 - y2;
  let angle = Math.atan2(-deltaY, -deltaX);
  angle *= 180 / Math.PI;
  if (angle < 0) angle += 360;
  return angle;
}

function getDistanceBetweenPoints(first = { x: 0, y: 0 }, second = { x: 0, y: 0 }) {
  return Math.hypot(second.x - first.x, second.y - first.y);
}

function addAngle(angle = 0, amount = 0) {
  const sum = angle + amount;
  let result;
  if (sum <= 0) result = sum % 360;
  else result = 360 + (sum % 360);
  if (result === 360) result = 0;
  return result;
}

function diffAngle(first = 0, second = 0) {
  const opposite = 180 - second;
  const normalized = addAngle(first, opposite);
  return 180 - normalized;
}

function calcWheelRotationForTargetAngle(target = 0, current = 0, direction = 1) {
  let rotation = ((target - 360) + current) % 360;
  rotation = fixFloat(rotation);
  rotation = ((direction === 1 ? 360 - rotation : 360 + rotation) % 360);
  rotation *= direction;
  return target + rotation;
}

function isObject(value) {
  return typeof value === "object" && !Array.isArray(value) && value !== null;
}

function isNumber(value) {
  return typeof value === "number" && !Number.isNaN(value);
}

function setProp({ val, isValid, errorMessage, defaultValue, action = null }) {
  if (isValid) return action ? action() : val;
  if (val === undefined) return defaultValue;
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
    const observer = new ResizeObserver(() => callback({ resize: true }));
    observer.observe(element);
    return {
      stop: () => {
        observer.unobserve(element);
        observer.disconnect();
      },
    };
  }

  window.addEventListener("resize", callback);
  return {
    stop: () => window.removeEventListener("resize", callback),
  };
}

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
  translateXYToElement,
};
