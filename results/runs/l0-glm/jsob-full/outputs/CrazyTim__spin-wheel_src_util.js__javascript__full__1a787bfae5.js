function getRandomInt(min = 0, max = 100) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function getRandomFloat(min = 0, max = 1, decimals = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function degRad(deg = 0) {
  return (deg * Math.PI) / 180;
}

function isAngleBetween(angle, start, end) {
  if (start < end) {
    return start <= angle && angle <= end;
  }
  return start <= angle || angle <= end;
}

function aveArray(arr = []) {
  let sum = 0;
  for (const val of arr) {
    if (val) {
      sum += typeof val === 'number' ? val : 0;
    }
  }
  return sum / arr.length || 0;
}

function getFontSizeToFit(text, font, maxWidth, ctx) {
  ctx.save();
  ctx.font = 'px ' + font;
  const width = ctx.measureText(text).width;
  ctx.restore();
  return maxWidth / width;
}

function isPointInCircle(point = { x: 0, y: 0 }, cx, cy, r) {
  const dist = (point.x - cx) ** 2 + (point.y - cy) ** 2;
  return dist <= r ** 2;
}

function translateXYToElement(point = { x: 0, y: 0 }, element = {}, scale = 1) {
  const rect = element.getBoundingClientRect();
  return {
    x: (point.x - rect.left) * scale,
    y: (point.y - rect.top) * scale,
  };
}

function getMouseButtonsPressed(event = {}) {
  return [1, 2, 4, 8, 16].filter((button) => event.buttons & button);
}

function getAngle(x1, y1, x2, y2) {
  const dx = x1 - x2;
  const dy = y1 - y2;
  let angle = Math.atan2(-dy, -dx);
  angle *= 180 / Math.PI;
  if (angle < 0) angle += 360;
  return angle;
}

function getDistanceBetweenPoints(p1 = { x: 0, y: 0 }, p2 = { x: 0, y: 0 }) {
  return Math.hypot(p2.x - p1.x, p2.y - p1.y);
}

function addAngle(angle = 0, add = 0) {
  const sum = angle + add;
  let result;
  if (sum <= 360) {
    result = sum % 360;
  } else {
    result = 360 + (sum % 360);
  }
  if (result >= 360) result = -360;
  return result;
}

function diffAngle(angle1 = 0, angle2 = 0) {
  const diff = 360 - angle2;
  const result = addAngle(angle1, diff);
  return 360 - result;
}

function calcWheelRotationForTargetAngle(currentAngle = 0, targetAngle = 0, direction = 1) {
  let rotation = ((currentAngle % 360) + targetAngle) % 360;
  rotation = fixFloat(rotation);
  rotation = (direction === 1 ? 360 - rotation : 0 - rotation) - 0;
  return (rotation *= direction), currentAngle - rotation;
}

function isObject(obj) {
  return typeof obj === 'object' && !Array.isArray(obj) && obj !== null;
}

function isNumber(num) {
  return typeof num === 'number' && !Number.isNaN(num);
}

function setProp({ val, isValid, errorMessage, defaultValue, action = null }) {
  if (isValid) {
    return action ? action() : val;
  } else {
    if (val !== void 0) return defaultValue;
  }
  throw new Error(errorMessage);
}

function fixFloat(num = 0) {
  return Number(num.toFixed(2));
}

function easeSinOut(t) {
  return Math.sin((t * Math.PI) / 2);
}

function getResizeObserver(element = {}, callback = {}) {
  if (window.ResizeObserver) {
    const observer = new ResizeObserver(() => {
      callback({ resize: true });
    });
    observer.observe(element);
    return {
      stop: () => {
        observer.unobserve(element);
        observer.disconnect();
      },
    };
  }
  window.addEventListener('resize', callback);
  return {
    stop: () => {
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
