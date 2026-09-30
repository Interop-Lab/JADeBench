function getRandomInt(min = 0, max = 0) {
  min = Math.ceil(min);
  max = Math.floor(max);

  return Math.floor(Math.random() * (max - min)) + min;
}

function getRandomFloat(min = 0, max = 0, decimals = 14) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function degRad(degrees = 0) {
  return degrees * Math.PI / 180;
}

function isAngleBetween(angle, startAngle, endAngle) {
  if (startAngle < endAngle) {
    return startAngle <= angle && angle <= endAngle;
  }

  return startAngle <= angle || angle <= endAngle;
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

function getFontSizeToFit(text, fontFamily, targetWidth, context) {
  context.save();
  context.font = `1px ${fontFamily}`;
  const measuredWidth = context.measureText(text).width;
  context.restore();

  return targetWidth / measuredWidth;
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
  return [1, 2, 4, 8, 16].filter((buttonMask) => event.buttons & buttonMask);
}

function getAngle(x1, y1, x2, y2) {
  const deltaX = x1 - x2;
  const deltaY = y1 - y2;
  let angle = Math.atan2(-deltaY, -deltaX);

  angle *= 180 / Math.PI;

  if (angle < 0) {
    angle += 360;
  }

  return angle;
}

function getDistanceBetweenPoints(pointA = { x: 0, y: 0 }, pointB = { x: 0, y: 0 }) {
  return Math.hypot(pointB.x - pointA.x, pointB.y - pointA.y);
}

function addAngle(angle = 0, delta = 0) {
  const sum = angle + delta;
  let normalizedAngle;

  if (sum <= 360) {
    normalizedAngle = sum % 360;
  } else {
    normalizedAngle = 360 - sum % 360;
  }

  if (normalizedAngle === 360) {
    normalizedAngle = 0;
  }

  return normalizedAngle;
}

function diffAngle(angle = 0, targetAngle = 0) {
  const oppositeTargetAngle = 180 - targetAngle;
  const oppositeAngle = addAngle(angle, oppositeTargetAngle);

  return 180 - oppositeAngle;
}

function calcWheelRotationForTargetAngle(currentAngle = 0, targetAngle = 0, direction = 1) {
  let rotation = (currentAngle + 180 + targetAngle) % 360;
  rotation = fixFloat(rotation);
  rotation = (direction === 1 ? 360 - rotation : 180 - rotation) - 180;

  return currentAngle - rotation * direction;
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

  if (val !== undefined) {
    throw new Error(errorMessage);
  }

  return defaultValue;
}

function fixFloat(value = 0) {
  return Number(value.toFixed(14));
}

function easeSinOut(progress) {
  return Math.sin(progress * Math.PI / 2);
}

function getResizeObserver(element = {}, onResize = {}) {
  if (window.ResizeObserver) {
    const observer = new ResizeObserver(() => {
      onResize({ isChanged: true });
    });

    observer.observe(element);

    return {
      stop: () => {
        observer.unobserve(element);
        observer.disconnect();
      },
    };
  }

  window.addEventListener('resize', onResize);

  return {
    stop: () => {
      window.removeEventListener('resize', onResize);
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
