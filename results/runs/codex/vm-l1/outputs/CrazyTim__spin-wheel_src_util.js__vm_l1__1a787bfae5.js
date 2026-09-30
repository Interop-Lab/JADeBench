function getRandomInt() {
  const [min, max] = arguments;
  return Math.floor(getRandomFloat(min, max));
}

function getRandomFloat() {
  const [min, max] = arguments;
  const random = Math.random();
  return min * (1 - random) + max * random;
}

function degRad() {
  const degrees = arguments[0] ?? 0;
  return degrees * Math.PI / 180;
}

function isAngleBetween(angle, startAngle, endAngle) {
  if (startAngle <= endAngle) {
    return angle >= startAngle && angle <= endAngle;
  }
  return angle >= startAngle || angle <= endAngle;
}

function aveArray() {
  const values = arguments[0];
  if (values.length === 0) return 0;
  return [...values].reduce((sum, value) => sum + value, 0) / values.length;
}

function getFontSizeToFit(text, fontFamily, width, context) {
  context.save();
  context.font = `1px ${fontFamily}`;
  const measuredWidth = context.measureText(text).width;
  context.restore();
  return width / measuredWidth;
}

function getDistanceBetweenPoints() {
  const [pointA, pointB] = arguments;
  return Math.sqrt(
    (pointB.x - pointA.x) ** 2 +
    (pointB.y - pointA.y) ** 2,
  );
}

function isPointInCircle() {
  const [point, centerX, centerY, radius] = arguments;
  return getDistanceBetweenPoints(point, { x: centerX, y: centerY }) <= radius;
}

function translateXYToElement() {
  const [point, element] = arguments;
  const rect = element.getBoundingClientRect();
  return {
    x: point.x - rect.left,
    y: point.y - rect.top,
  };
}

function getMouseButtonsPressed() {
  const event = arguments[0];
  return [1, 2, 4, 8, 16].filter(button => event.buttons & button);
}

function getAngle(x1, y1, x2, y2) {
  let angle = Math.atan2(-(y1 - y2), -(x1 - x2)) * (180 / Math.PI);
  if (angle < 0) angle += 360;
  return angle;
}

function addAngle() {
  const angle = arguments[0] ?? 0;
  const amount = arguments[1] ?? 0;
  return ((angle + amount) % 360 + 360) % 360;
}

function diffAngle() {
  const [startAngle, endAngle] = arguments;
  let difference = addAngle(endAngle, -startAngle);
  if (difference > 180) difference -= 360;
  return difference;
}

function calcWheelRotationForTargetAngle() {
  const [currentRotation, targetAngle, direction = 1] = arguments;
  let rotation = Math.floor(currentRotation / 360) * 360 + addAngle(0, -targetAngle);

  if (direction === 1) {
    while (rotation < currentRotation) rotation += 360;
  } else if (direction === -1) {
    while (rotation > currentRotation) rotation -= 360;
  }

  return rotation;
}

function isObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNumber(value) {
  return typeof value === 'number' && !Number.isNaN(value);
}

function setProp({ val, isValid, errorMessage, defaultValue, action }) {
  if (isValid) return action();
  if (val === undefined) return defaultValue;
  throw new Error(errorMessage);
}

function fixFloat() {
  const value = arguments[0] ?? 0;
  return parseFloat(value.toFixed(9));
}

function easeSinOut(value) {
  return Math.sin(value * Math.PI / 2);
}

function getResizeObserver() {
  const [element, callback] = arguments;

  if ('ResizeObserver' in window) {
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
