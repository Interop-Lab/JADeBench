function getRandomInt(min = 0, max = 0) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function getRandomFloat(min = 0, max = 0, decimalPlaces = 14) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimalPlaces));
}

function degRad(degrees = 0) {
  return degrees * Math.PI / 180;
}

function isAngleBetween(angle, startAngle, endAngle) {
  if (startAngle < endAngle) {
    return startAngle <= angle && angle <= endAngle;
  }
  return startAngle < angle || angle < endAngle;
}

function aveArray(values = []) {
  let total = 0;

  for (const value of values) {
    if (value) {
      total += typeof value === "number" ? value : 1;
    }
  }

  return total / values.length || 0;
}

function getFontSizeToFit(text, fontFamily, width, context) {
  context.save();
  context.font = "1px " + fontFamily;
  const measuredWidth = context.measureText(text).width;
  context.restore();
  return width / measuredWidth;
}

const defaultCirclePoint = { x: 0, y: 0 };

function isPointInCircle(
  point = defaultCirclePoint,
  centerX,
  centerY,
  radius
) {
  const distanceSquared =
    (point.x - centerX) ** 2 +
    (point.y - centerY) ** 2;

  return distanceSquared <= radius ** 2;
}

const defaultTranslationPoint = { x: 0, y: 0 };

function translateXYToElement(
  point = defaultTranslationPoint,
  element = {},
  scale = 1
) {
  const bounds = element.getBoundingClientRect();

  return {
    x: (point.x - bounds.left) * scale,
    y: (point.y - bounds.top) * scale
  };
}

function getMouseButtonsPressed(event = {}) {
  return [1, 2, 4, 8, 16].filter(button => event.buttons & button);
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

const defaultDistancePointA = { x: 0, y: 0 };
const defaultDistancePointB = { x: 0, y: 0 };

function getDistanceBetweenPoints(
  pointA = defaultDistancePointA,
  pointB = defaultDistancePointB
) {
  return Math.hypot(
    pointB.x - pointA.x,
    pointB.y - pointA.y
  );
}

function addAngle(angle = 0, amount = 0) {
  const sum = angle + amount;
  let result;

  if (sum <= 0) {
    result = sum + 360;
  } else if (sum > 360) {
    result = sum % 360;
  } else {
    result = sum;
  }

  if (result === 360) {
    result = 0;
  }

  return result;
}

function diffAngle(angleA = 0, angleB = 0) {
  const adjustment = 180 - angleB;
  const normalizedAngle = addAngle(angleA, adjustment);
  return 180 - normalizedAngle;
}

function calcWheelRotationForTargetAngle(
  currentAngle = 0,
  targetAngle = 0,
  direction = 1
) {
  let difference = ((currentAngle + 360) - targetAngle) % 360;
  difference = fixFloat(difference);

  difference = (
    direction === 1
      ? 360 - difference
      : 360 + difference
  ) % 360;

  difference *= direction;
  return currentAngle + difference;
}

function isObject(value) {
  return (
    typeof value === "object" &&
    !Array.isArray(value) &&
    value !== null
  );
}

function isNumber(value) {
  return typeof value === "number" && !Number.isNaN(value);
}

function setProp({
  val,
  isValid,
  errorMessage,
  defaultValue,
  action = null
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
  return Math.sin(value * Math.PI / 2);
}

function getResizeObserver(element = {}, callback = {}) {
  if (window.ResizeObserver) {
    const observer = new ResizeObserver(() => {
      callback({ isResize: true });
    });

    observer.observe(element);

    return {
      stop: () => {
        observer.unobserve(element);
        observer.disconnect();
      }
    };
  }

  window.addEventListener("resize", callback);

  return {
    stop: () => {
      window.removeEventListener("resize", callback);
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
