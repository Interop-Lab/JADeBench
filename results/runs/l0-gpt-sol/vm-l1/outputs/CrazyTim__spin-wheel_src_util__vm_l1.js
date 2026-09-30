function getRandomInt(min, max) {
  if (max === undefined) {
    max = min;
    min = 0;
  }
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min, max) {
  if (max === undefined) {
    max = min;
    min = 0;
  }
  return Math.random() * (max - min) + min;
}

function degRad(degrees) {
  return degrees * Math.PI / 180;
}

function normalizeAngle(angle) {
  angle %= 360;
  return angle < 0 ? angle + 360 : angle;
}

function isAngleBetween(angle, start, end) {
  angle = normalizeAngle(angle);
  start = normalizeAngle(start);
  end = normalizeAngle(end);

  if (start <= end) {
    return angle >= start && angle <= end;
  }
  return angle >= start || angle <= end;
}

function aveArray(values) {
  if (!values || values.length === 0) {
    return 0;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function getFontSizeToFit(text, maxWidth, fontFamily, initialSize) {
  if (typeof document === "undefined") {
    return initialSize || 16;
  }

  let canvas = getFontSizeToFit._canvas;
  if (!canvas) {
    canvas = getFontSizeToFit._canvas = document.createElement("canvas");
  }

  const context = canvas.getContext("2d");
  let size = initialSize || 100;
  const family = fontFamily || "sans-serif";

  context.font = `${size}px ${family}`;
  while (size > 1 && context.measureText(String(text)).width > maxWidth) {
    size -= 1;
    context.font = `${size}px ${family}`;
  }

  return size;
}

function isPointInCircle(point, circle, radius) {
  let x;
  let y;
  let centerX;
  let centerY;

  if (typeof point === "object") {
    x = point.x;
    y = point.y;
  } else {
    x = point;
    y = circle;
    point = arguments[2];
    circle = arguments[3];
  }

  if (typeof circle === "object") {
    centerX = circle.x;
    centerY = circle.y;
    radius = radius === undefined ? arguments[2] : radius;
  } else {
    centerX = point;
    centerY = circle;
  }

  const dx = x - centerX;
  const dy = y - centerY;
  return dx * dx + dy * dy <= radius * radius;
}

function translateXYToElement(x, y, element) {
  if (x && typeof x === "object") {
    element = y;
    y = x.y;
    x = x.x;
  }

  const rect = element.getBoundingClientRect();
  return {
    x: x - rect.left,
    y: y - rect.top
  };
}

function getMouseButtonsPressed(event) {
  const buttons = event && typeof event.buttons === "number" ? event.buttons : 0;
  const pressed = [];
  for (let button = 0; button < 8; button++) {
    if (buttons & (1 << button)) {
      pressed.push(button);
    }
  }
  return pressed;
}

function getAngle(x1, y1, x2, y2) {
  return normalizeAngle(Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI);
}

function getDistanceBetweenPoints(x1, y1, x2, y2) {
  if (typeof x1 === "object") {
    const first = x1;
    const second = y1;
    x1 = first.x;
    y1 = first.y;
    x2 = second.x;
    y2 = second.y;
  }

  return Math.hypot(x2 - x1, y2 - y1);
}

function addAngle(angle, amount) {
  return normalizeAngle(angle + amount);
}

function diffAngle(from, to) {
  let difference = normalizeAngle(to) - normalizeAngle(from);
  if (difference > 180) {
    difference -= 360;
  } else if (difference < -180) {
    difference += 360;
  }
  return difference;
}

function calcWheelRotationForTargetAngle(currentAngle, targetAngle) {
  return diffAngle(currentAngle, targetAngle);
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isNumber(value) {
  return typeof value === "number" && !Number.isNaN(value);
}

function setProp(target, property, value) {
  if (arguments.length === 1) {
    return (nextValue) => setProp(target, property, nextValue);
  }

  if (target && target.style && property in target.style) {
    target.style[property] = value;
  } else if (target != null) {
    target[property] = value;
  }

  return target;
}

function fixFloat(value, digits) {
  if (digits === undefined) {
    digits = 2;
  }
  const factor = 10 ** digits;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

function easeSinOut(value) {
  return Math.sin(value * Math.PI / 2);
}

function getResizeObserver(callback) {
  if (typeof ResizeObserver === "undefined") {
    return null;
  }
  return new ResizeObserver(callback);
}

globalThis.getResizeObserver = getResizeObserver;
globalThis.easeSinOut = easeSinOut;
globalThis.fixFloat = fixFloat;
globalThis.setProp = setProp;
globalThis.isNumber = isNumber;
globalThis.isObject = isObject;
globalThis.calcWheelRotationForTargetAngle = calcWheelRotationForTargetAngle;
globalThis.diffAngle = diffAngle;
globalThis.addAngle = addAngle;
globalThis.getDistanceBetweenPoints = getDistanceBetweenPoints;
globalThis.getAngle = getAngle;
globalThis.getMouseButtonsPressed = getMouseButtonsPressed;
globalThis.translateXYToElement = translateXYToElement;
globalThis.isPointInCircle = isPointInCircle;
globalThis.getFontSizeToFit = getFontSizeToFit;
globalThis.aveArray = aveArray;
globalThis.isAngleBetween = isAngleBetween;
globalThis.degRad = degRad;
globalThis.getRandomFloat = getRandomFloat;
globalThis.getRandomInt = getRandomInt;

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
