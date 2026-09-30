function getRandomInt(...args) {
  let [minimum, maximum] = args;
  minimum = Math.ceil(minimum);
  maximum = Math.floor(maximum);
  return Math.floor(Math.random() * (maximum - minimum) + minimum);
}

function getRandomFloat(...args) {
  const [minimum, maximum, decimalPlaces = 14] = args;
  const value = Math.random() * (maximum - minimum) + minimum;
  return parseFloat(value.toFixed(decimalPlaces));
}

function degRad(...args) {
  const [degrees] = args;
  return (degrees * Math.PI) / 180;
}

function isAngleBetween(angle, startAngle, endAngle) {
  if (startAngle < endAngle) {
    return angle >= startAngle && angle < endAngle;
  }
  return angle >= startAngle || angle < endAngle;
}

function aveArray(...args) {
  const [values = []] = args;
  if (values === null || typeof values[Symbol.iterator] !== 'function') {
    throw new TypeError(`${values} is not iterable`);
  }

  const total = [...values].reduce((sum, value) => {
    if (typeof value === 'number') {
      return sum + value;
    }
    return sum + (value ? 1 : 0);
  }, 0);

  return total / values.length || 0;
}

function getFontSizeToFit(text, fontFamily, targetWidth, context) {
  context.save();
  context.font = `1px ${fontFamily}`;
  const measuredWidth = context.measureText(text).width;
  context.restore();
  return targetWidth / measuredWidth;
}

function isPointInCircle(...args) {
  const [point, centerX, centerY, radius] = args;
  return (point.x - centerX) ** 2 + (point.y - centerY) ** 2 <= radius ** 2;
}

function translateXYToElement(...args) {
  const [point, element, scale = 1] = args;
  const bounds = element.getBoundingClientRect();
  return {
    x: (point.x - bounds.left) * scale,
    y: (point.y - bounds.top) * scale,
  };
}

function getMouseButtonsPressed(...args) {
  const [event] = args;
  return [1, 2, 4, 8, 16].filter((button) => event.buttons & button);
}

function getAngle(x1, y1, x2, y2) {
  const angle = (Math.atan2(y1 - y2, x1 - x2) * 180) / Math.PI + 180;
  return angle % 360;
}

function getDistanceBetweenPoints(...args) {
  const [firstPoint, secondPoint] = args;
  return Math.hypot(
    secondPoint.x - firstPoint.x,
    secondPoint.y - firstPoint.y,
  );
}

function addAngle(...args) {
  const [angle, amount = 0] = args;
  let result = angle + amount;

  while (result < 0) {
    result += 360;
  }
  while (result >= 360) {
    result -= 360;
  }

  return result;
}

function diffAngle(...args) {
  const [fromAngle, toAngle] = args;
  const difference = addAngle(toAngle, -fromAngle);
  return difference > 180 ? difference - 180 * 2 : difference;
}

function calcWheelRotationForTargetAngle(...args) {
  const [wheelRotation, targetAngle, direction = 1] = args;
  const currentAngle = addAngle(wheelRotation);
  const targetRotation = addAngle(-targetAngle);
  let distance = (currentAngle - targetRotation + 360) % 360;

  if (direction === 1 && distance !== 0) {
    distance = 360 - distance;
  }

  return fixFloat(wheelRotation + distance * direction);
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isNumber(value) {
  return typeof value === 'number' && !Number.isNaN(value);
}

function setProp(options) {
  const {
    val,
    isValid = false,
    errorMessage = '',
    defaultValue,
    action,
  } = options;

  if (val === undefined && !isValid) {
    return defaultValue;
  }
  if (!isValid) {
    throw new Error(errorMessage);
  }
  return action ? action() : val;
}

function fixFloat(...args) {
  const [value] = args;
  return Number(value.toFixed(9));
}

function easeSinOut(value) {
  return Math.sin((value * Math.PI) / 2);
}

function getResizeObserver(...args) {
  const [element = {}, callback = () => {}] = args;

  if (window.ResizeObserver) {
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
