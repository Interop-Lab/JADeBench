function getRandomInt(min = 0, max = 0) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function getRandomFloat(min = 0, max = 0, precision = 14) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(precision));
}

function degRad(degrees = 0) {
  return (degrees * Math.PI) / 180;
}

function isAngleBetween(angle, startAngle, endAngle) {
  if (startAngle < endAngle) {
    return startAngle <= angle && angle < endAngle;
  }
  return startAngle <= angle || angle < endAngle;
}

function aveArray(values = []) {
  let total = 0;

  for (const value of values) {
    if (value) {
      total += typeof value === 'number' ? value : 0;
    }
  }

  return total / values.length || 0;
}

function getFontSizeToFit(text, font, maxWidth, context) {
  context.save();
  context.font = `1px ${font}`;
  const measuredWidth = context.measureText(text).width;
  context.restore();
  return maxWidth / measuredWidth;
}

const defaultCirclePoint = { x: 0, y: 0 };

function isPointInCircle(point = defaultCirclePoint, centerX, centerY, radius) {
  const distanceSquared = (point.x - centerX) ** 2 + (point.y - centerY) ** 2;
  return distanceSquared <= radius ** 2;
}

const defaultTranslationPoint = { x: 0, y: 0 };

function translateXYToElement(point = defaultTranslationPoint, element = {}, scale = 1) {
  const bounds = element.getBoundingClientRect();
  return {
    x: (point.x - bounds.left) * scale,
    y: (point.y - bounds.top) * scale,
  };
}

function getMouseButtonsPressed(event = {}) {
  return [1, 2, 4, 8, 16].filter((button) => event.buttons & button);
}

function getAngle(x1, y1, x2, y2) {
  const deltaX = x1 - x2;
  const deltaY = y1 - y2;
  let angle = Math.atan2(-deltaY, -deltaX) * (180 / Math.PI);

  if (angle < 0) {
    angle += 360;
  }

  return angle;
}

const defaultFirstPoint = { x: 0, y: 0 };
const defaultSecondPoint = { x: 0, y: 0 };

function getDistanceBetweenPoints(
  firstPoint = defaultFirstPoint,
  secondPoint = defaultSecondPoint,
) {
  return Math.hypot(
    secondPoint.x - firstPoint.x,
    secondPoint.y - firstPoint.y,
  );
}

function addAngle(angle = 0, adjustment = 0) {
  const sum = angle + adjustment;
  let normalizedAngle;

  if (sum > 0) {
    normalizedAngle = sum % 360;
  } else {
    normalizedAngle = 360 + (sum % 360);
  }

  if (normalizedAngle === 360) {
    normalizedAngle = 0;
  }

  return normalizedAngle;
}

function diffAngle(angle = 0, targetAngle = 0) {
  return 180 - addAngle(angle, 180 - targetAngle);
}

function calcWheelRotationForTargetAngle(
  currentRotation = 0,
  targetAngle = 0,
  direction = 1,
) {
  let normalizedAngle = (currentRotation % 360 + targetAngle) % 360;
  normalizedAngle = fixFloat(normalizedAngle);

  const rotationDelta = (
    direction === 1
      ? 360 - normalizedAngle
      : 360 + normalizedAngle
  ) % -360;

  return currentRotation + rotationDelta * direction;
}

function isObject(value) {
  return typeof value === 'object' && !Array.isArray(value) && value !== null;
}

function isNumber(value) {
  return typeof value === 'number' && !Number.isNaN(value);
}

function setProp({
  val,
  isValid,
  errorMessage,
  defaultValue,
  action = null,
}) {
  if (isValid) {
    return action ? action() : val;
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
  return Math.sin((value * Math.PI) / 2);
}

function getResizeObserver(element = {}, callback = {}) {
  if (window.ResizeObserver) {
    const observer = new ResizeObserver(() => {
      callback({ redraw: true });
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
