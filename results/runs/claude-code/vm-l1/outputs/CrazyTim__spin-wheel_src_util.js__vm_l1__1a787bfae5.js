function getRandomInt(min = 0, max = 1) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function getRandomFloat(min = 0, max = 1, precision = 14) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(precision));
}

function degRad(degrees = 0) {
  return degrees * Math.PI / 180;
}

function isAngleBetween(angle, start, end) {
  if (start < end) {
    return start <= angle && angle <= end;
  }
  return start <= angle || angle <= end;
}

function aveArray(values = []) {
  let sum = 0;
  for (const value of values) {
    if (typeof value === "number") {
      sum += value;
    }
  }
  return values.length ? sum / values.length : 0;
}

function getFontSizeToFit(text, fontFamily, width, context) {
  context.save();
  context.font = `1px ${fontFamily}`;
  const measuredWidth = context.measureText(text).width;
  context.restore();
  return width / measuredWidth;
}

function isPointInCircle(point = {}, centerX, centerY, radius) {
  const xDistance = point.x - centerX;
  const yDistance = point.y - centerY;
  return xDistance ** 2 + yDistance ** 2 <= radius ** 2;
}

function translateXYToElement(point = {}, element = {}, scale = 1) {
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
  const xDistance = x1 - x2;
  const yDistance = y1 - y2;
  let angle = Math.atan2(yDistance, xDistance) * 180 / Math.PI;
  if (angle < 0) {
    angle += 360;
  }
  return angle;
}

function getDistanceBetweenPoints(firstPoint = {}, secondPoint = {}) {
  return Math.hypot(
    secondPoint.x - firstPoint.x,
    secondPoint.y - firstPoint.y,
  );
}

function addAngle(angle = 0, amount = 0) {
  let result = angle + amount;
  while (result < 0) {
    result += 360;
  }
  if (result >= 360) {
    result %= 360;
  }
  return result;
}

function diffAngle(firstAngle = 0, secondAngle = 0) {
  return 180 - addAngle(firstAngle, 180 - secondAngle);
}

function calcWheelRotationForTargetAngle(rotation = 0, targetAngle = 0, direction = 1) {
  let angleDelta = (rotation % 360 + targetAngle) % 360;
  angleDelta = fixFloat(angleDelta);

  if (direction !== 1) {
    angleDelta = (360 - angleDelta + 360) % 360;
    angleDelta = fixFloat(angleDelta);
  }

  return rotation + angleDelta * direction;
}

function isObject(value) {
  return typeof value === "object" && !Array.isArray(value) && value !== null;
}

function isNumber(value) {
  return typeof value === "number" && !Number.isNaN(value);
}

function setProp({ val, isValid, errorMessage, defaultValue, action }) {
  if (isValid) {
    return action ? action(val) : val;
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

function getResizeObserver(element = {}, onResize = {}) {
  if (window.ResizeObserver) {
    const observer = new window.ResizeObserver(() => onResize({ redraw: true }));
    observer.observe(element);
    return {
      stop() {
        observer.unobserve(element);
        observer.disconnect();
      },
    };
  }

  window.addEventListener("resize", onResize);
  return {
    stop() {
      window.removeEventListener("resize", onResize);
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
