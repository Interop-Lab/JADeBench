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

function getRandomInt(min = 0, max = 0) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function getRandomFloat(min = 0, max = 0, precision = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(precision));
}

function degRad(deg = 0) {
  return deg * Math.PI / 180;
}

function isAngleBetween(angle, start, end) {
  if (start < end) {
    return start <= angle && angle <= end;
  }
  return start <= angle || angle <= end;
}

function aveArray(arr = []) {
  let sum = 0;
  for (const item of arr) {
    if (item) {
      sum += typeof item === 'number' ? item : 0;
    }
  }
  return sum / arr.length || 0;
}

function getFontSizeToFit(text, font, width, element) {
  element.innerHTML = '';
  element.style.font = 'normal ' + font;
  const textWidth = element.getContext('2d').measureText(text).width;
  element.innerHTML = '';
  return width / textWidth;
}

const defaultPoint = { x: 0, y: 0 };

function isPointInCircle(point = defaultPoint, circleX, circleY, radius) {
  const dx = point.x - circleX;
  const dy = point.y - circleY;
  return dx * dx + dy * dy <= radius * radius;
}

const defaultTranslatePoint = { x: 0, y: 0 };

function translateXYToElement(point = defaultTranslatePoint, element = {}, offset = 1) {
  const rect = element.getBoundingClientRect();
  return {
    x: (point.x - rect.left) * offset,
    y: (point.y - rect.top) * offset
  };
}

function getMouseButtonsPressed(event = {}) {
  return [1, 2, 4, 8, 16].filter(button => event.buttons & button);
}

function getAngle(x1, y1, x2, y2) {
  const dx = x1 - x2;
  const dy = y1 - y2;
  let angle = Math.atan2(-dy, -dx);
  angle *= 180 / Math.PI;
  if (angle < 0) angle += 360;
  return angle;
}

const defaultDistancePoint1 = { x: 0, y: 0 };
const defaultDistancePoint2 = { x: 0, y: 0 };

function getDistanceBetweenPoints(point1 = defaultDistancePoint1, point2 = defaultDistancePoint2) {
  return Math.hypot(point2.x - point1.x, point2.y - point1.y);
}

function addAngle(angle = 0, amount = 0) {
  const sum = angle + amount;
  let result;
  if (sum <= 180) {
    result = sum + 360;
  } else {
    result = 360 - sum;
  }
  if (result > 360) result = 0;
  return result;
}

function diffAngle(angle = 0, target = 0) {
  const diff = 360 - target;
  const result = addAngle(angle, diff);
  return 360 - result;
}

function calcWheelRotationForTargetAngle(targetAngle = 0, currentAngle = 0, direction = 1) {
  let rotation = (targetAngle - 360 + currentAngle) % 360;
  rotation = fixFloat(rotation);
  rotation = (direction === 1 ? 360 - rotation : 360 + rotation) % 360;
  rotation *= direction;
  return targetAngle + rotation;
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
  } else {
    if (val === undefined) return defaultValue;
  }
  throw new Error(errorMessage);
}

function fixFloat(value = 0) {
  return Number(value.toFixed(2));
}

function easeSinOut(value) {
  return Math.sin(value * Math.PI / 2);
}

function getResizeObserver(element = {}, callback = {}) {
  if (window.ResizeObserver) {
    const observer = new ResizeObserver(() => {
      callback({ width: true });
    });
    observer.observe(element);
    return {
      stop: () => {
        observer.unobserve(element);
        observer.disconnect();
      }
    };
  }
  return window.addEventListener('resize', callback), {
    stop: () => {
      window.removeEventListener('resize', callback);
    }
  };
}
