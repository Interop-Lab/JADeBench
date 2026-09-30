// ../work/CrazyTim__spin-wheel/src/util.js
function getRandomInt(min = 0, max = 0) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}
function getRandomFloat(min = 0, max = 0, round = 14) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(round));
}
function degRad(degrees = 0) {
  return degrees * Math.PI / 180;
}
function isAngleBetween(angle, arcStart, arcEnd) {
  if (arcStart < arcEnd) return arcStart <= angle && angle < arcEnd;
  return arcStart <= angle || angle < arcEnd;
}
function aveArray(array = []) {
  let sum = 0;
  for (const val of array) {
    if (val) sum += typeof val === "number" ? val : 1;
  }
  return sum / array.length || 0;
}
function getFontSizeToFit(text, fontFamily, maxWidth, canvasContext) {
  canvasContext.save();
  canvasContext.font = `1px ${fontFamily}`;
  const w = canvasContext.measureText(text).width;
  canvasContext.restore();
  return maxWidth / w;
}
function isPointInCircle(point = { x: 0, y: 0 }, cx, cy, radius) {
  const distanceSquared = (point.x - cx) ** 2 + (point.y - cy) ** 2;
  return distanceSquared <= radius ** 2;
}
function translateXYToElement(point = { x: 0, y: 0 }, element = {}, devicePixelRatio = 1) {
  const rect = element.getBoundingClientRect();
  return {
    x: (point.x - rect.left) * devicePixelRatio,
    y: (point.y - rect.top) * devicePixelRatio
  };
}
function getMouseButtonsPressed(event = {}) {
  return [1, 2, 4, 8, 16].filter((i) => event.buttons & i);
}
function getAngle(originX, originY, targetX, targetY) {
  const dx = originX - targetX;
  const dy = originY - targetY;
  let theta = Math.atan2(-dy, -dx);
  theta *= 180 / Math.PI;
  if (theta < 0) theta += 360;
  return theta;
}
function getDistanceBetweenPoints(point1 = { x: 0, y: 0 }, point2 = { x: 0, y: 0 }) {
  return Math.hypot(point2.x - point1.x, point2.y - point1.y);
}
function addAngle(a = 0, b = 0) {
  const sum = a + b;
  let result;
  if (sum > 0) {
    result = sum % 360;
  } else {
    result = 360 + sum % 360;
  }
  if (result === 360) result = 0;
  return result;
}
function diffAngle(a = 0, b = 0) {
  const offsetFrom180 = 180 - b;
  const aWithOffset = addAngle(a, offsetFrom180);
  return 180 - aWithOffset;
}
function calcWheelRotationForTargetAngle(currentRotation = 0, targetAngle = 0, direction = 1) {
  let angle = (currentRotation % 360 + targetAngle) % 360;
  angle = fixFloat(angle);
  angle = (direction === 1 ? 360 - angle : 360 + angle) % 360;
  angle *= direction;
  return currentRotation + angle;
}
function isObject(v) {
  return typeof v === "object" && !Array.isArray(v) && v !== null;
}
function isNumber(n) {
  return typeof n === "number" && !Number.isNaN(n);
}
function setProp({ val, isValid, errorMessage, defaultValue, action = null }) {
  if (isValid) {
    return action ? action() : val;
  } else if (val === void 0) {
    return defaultValue;
  }
  throw new Error(errorMessage);
}
function fixFloat(f = 0) {
  return Number(f.toFixed(9));
}
function easeSinOut(n) {
  return Math.sin(n * Math.PI / 2);
}
function getResizeObserver(element = {}, callBack = {}) {
  if (window.ResizeObserver) {
    const observer = new ResizeObserver(() => {
      callBack({ redraw: true });
    });
    observer.observe(element);
    return {
      stop: () => {
        observer.unobserve(element);
        observer.disconnect();
      }
    };
  }
  window.addEventListener("resize", callBack);
  return {
    stop: () => {
      window.removeEventListener("resize", callBack);
    }
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
  translateXYToElement
};
