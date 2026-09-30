const FULL_TURN = 360;
const FLOAT_PRECISION = 10;

function getRandomInt(min = 0, max = 0) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(min + Math.random() * (max - min));
}

function getRandomFloat(min = 0, max = 0) {
  return min + Math.random() * (max - min);
}

function degRad(degrees = 0) {
  return degrees * Math.PI / 180;
}

function addAngle(angle = 0, amount = 0) {
  return (angle + amount + FULL_TURN) % FULL_TURN;
}

function diffAngle(from = 0, to = 0) {
  const difference = addAngle(to - from);
  return difference > 180 ? difference - FULL_TURN : difference;
}

function isAngleBetween(angle, start, end) {
  angle = addAngle(angle);
  start = addAngle(start);
  end = addAngle(end);
  return start <= end
    ? angle >= start && angle <= end
    : angle >= start || angle <= end;
}

function aveArray(values = []) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function getFontSizeToFit(text, fontFamily, maxWidth, context) {
  context.save();
  context.font = `1px ${fontFamily}`;
  const measuredWidth = context.measureText(text).width;
  context.restore();
  return maxWidth / measuredWidth;
}

function getDistanceBetweenPoints(first = {}, second = {}) {
  const deltaX = (second.x || 0) - (first.x || 0);
  const deltaY = (second.y || 0) - (first.y || 0);
  return Math.hypot(deltaX, deltaY);
}

function isPointInCircle(point, centerX, centerY, radius) {
  const deltaX = point.x - centerX;
  const deltaY = point.y - centerY;
  return deltaX ** 2 + deltaY ** 2 <= radius ** 2;
}

function translateXYToElement(point, element, scale = 1) {
  const bounds = element.getBoundingClientRect();
  return {
    x: (point.x - bounds.left) / scale,
    y: (point.y - bounds.top) / scale,
  };
}

function getMouseButtonsPressed(event = {}) {
  return [1, 2, 4, 8, 16].filter(button => (event.buttons & button) !== 0);
}

function getAngle(startX, startY, endX, endY) {
  const radians = Math.atan2(endY - startY, endX - startX);
  return addAngle(radians * 180 / Math.PI);
}

function calcWheelRotationForTargetAngle(currentRotation = 0, targetAngle = 0, rotations = 0) {
  if (!rotations) return currentRotation;
  const desiredRotation = rotations * FULL_TURN - targetAngle;
  return currentRotation + diffAngle(currentRotation, desiredRotation);
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isNumber(value) {
  return typeof value === "number" && !Number.isNaN(value);
}

function setProp({
  val,
  isValid = true,
  errorMessage = "",
  defaultValue,
  action = () => undefined,
}) {
  if (!isValid) {
    if (errorMessage) throw new Error(errorMessage);
    val = defaultValue;
  }
  return action();
}

function fixFloat(value = 0) {
  return Number.parseFloat(value.toFixed(FLOAT_PRECISION));
}

function easeSinOut(value) {
  return Math.sin(value * Math.PI / 2);
}

function getResizeObserver(element, callback = () => undefined) {
  if (typeof ResizeObserver !== "undefined") {
    const observer = new ResizeObserver(callback);
    observer.observe(element);
    observer.stop = () => observer.disconnect();
    return observer;
  }

  const listener = () => callback();
  window.addEventListener("resize", listener);
  return {
    stop() {
      window.removeEventListener("resize", listener);
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
