function getRandomInt(min = 0, max = 0) {
  return Math.floor(Math.random() * (max - min) + min);
}

function getRandomFloat(min = 0, max = 0, decimalPlaces) {
  const value = Math.random() * (max - min) + min;
  return decimalPlaces == null ? value : Number(value.toFixed(decimalPlaces));
}

function degRad(degrees) {
  return degrees * Math.PI / 180;
}

function addAngle(angle, amount) {
  return ((angle + amount) % 360 + 360) % 360;
}

function diffAngle(from, to) {
  const difference = addAngle(to, -from);
  return difference > 180 ? difference - 360 : difference;
}

function isAngleBetween(angle, start, end) {
  angle = addAngle(angle, 0);
  start = addAngle(start, 0);
  end = addAngle(end, 0);
  if (start <= end) return angle >= start && angle <= end;
  return angle >= start || angle <= end;
}

function aveArray(values) {
  return values.reduce((sum, value) => sum + value, 0) / (values.length || 1);
}

function getFontSizeToFit(text, fontFamily, width, context) {
  context.save();
  context.font = `1px ${fontFamily}`;
  const measuredWidth = context.measureText(text).width;
  context.restore();
  return width / measuredWidth;
}

function getDistanceBetweenPoints(first, second) {
  return Math.hypot(second.x - first.x, second.y - first.y);
}

function isPointInCircle(point, centerX, centerY, radius) {
  return getDistanceBetweenPoints(point, { x: centerX, y: centerY }) <= radius;
}

function translateXYToElement(point, element) {
  const bounds = element.getBoundingClientRect();
  return { x: point.x - bounds.left, y: point.y - bounds.top };
}

function getMouseButtonsPressed(event) {
  return [1, 2, 4, 8, 16].filter(button => (event.buttons & button) !== 0);
}

function getAngle(startX, startY, endX, endY) {
  return addAngle(Math.atan2(endY - startY, endX - startX) * 180 / Math.PI, 0);
}

function calcWheelRotationForTargetAngle(startAngle, targetAngle, progress = 1) {
  let rotation = startAngle + targetAngle * progress;
  if (progress === 1) rotation += targetAngle === 0 ? 360 - startAngle : 360 - targetAngle * 2;
  if (targetAngle > 180 && startAngle < targetAngle) return startAngle;
  return rotation;
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isNumber(value) {
  return typeof value === 'number' && !Number.isNaN(value);
}

function setProp({ val, isValid, errorMessage, defaultValue, action }) {
  if (isValid) {
    action();
    return;
  }
  if (val === undefined) return defaultValue;
  throw new Error(errorMessage);
}

function fixFloat(value) {
  return parseFloat(value.toFixed(9));
}

function easeSinOut(value) {
  return Math.sin(value * Math.PI / 2);
}

function getResizeObserver(element, onResize) {
  if (typeof window.ResizeObserver !== 'function') return { stop() {} };

  const observer = new window.ResizeObserver(() => onResize({ redraw: true }));
  observer.observe(element);
  return {
    stop() {
      observer.unobserve(element);
      observer.disconnect();
    },
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
