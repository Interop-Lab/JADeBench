const root = globalThis;

const __defProp = Object.defineProperty;
const __getOwnPropDesc = Object.getOwnPropertyDescriptor;
const __getOwnPropNames = Object.getOwnPropertyNames;
const __hasOwnProp = Object.prototype.hasOwnProperty;

const __export = (target, definitions) => {
  for (const name in definitions) {
    __defProp(target, name, { get: definitions[name], enumerable: true });
  }
};

const __copyProps = (target, source, except, descriptor) => {
  if (source && (typeof source === "object" || typeof source === "function")) {
    for (const name of __getOwnPropNames(source)) {
      if (!__hasOwnProp.call(target, name) && name !== except) {
        __defProp(target, name, {
          get: () => source[name],
          enumerable: !(descriptor = __getOwnPropDesc(source, name)) || descriptor.enumerable,
        });
      }
    }
  }
  return target;
};

const __toCommonJS = (moduleValue) => __copyProps(
  __defProp({}, "__esModule", { value: true }),
  moduleValue,
);

const sqrt = Math.sqrt;
const PI = Math.PI;
const pow = Math.pow;
const HALF_PI = PI / 2;
const TWO_PI = PI * 2;

const linear = (position) => position;
const makeExpIn = (exponent) => (position) => pow(position, exponent);
const makeExpOut = (exponent) => (position) => 1 - pow(1 - position, exponent);
const makeInOut = (easeIn, easeOut) => (position) => position < 0.5
  ? easeIn(position * 2) / 2
  : easeOut(position * 2 - 1) / 2 + 0.5;
const makeExpInOut = (exponent) => makeInOut(makeExpIn(exponent), makeExpOut(exponent));

const easeInQuad = makeExpIn(2);
const easeOutQuad = makeExpOut(2);
const easeInOutQuad = makeExpInOut(2);
const easeInCubic = makeExpIn(3);
const easeOutCubic = makeExpOut(3);
const easeInOutCubic = makeExpInOut(3);
const easeInQuart = makeExpIn(4);
const easeOutQuart = makeExpOut(4);
const easeInOutQuart = makeExpInOut(4);
const easeInQuint = makeExpIn(5);
const easeOutQuint = makeExpOut(5);
const easeInOutQuint = makeExpInOut(5);
const easeInSine = (position) => 1 - Math.cos(position * HALF_PI);
const easeOutSine = (position) => Math.sin(position * HALF_PI);
const easeInOutSine = (position) => -(Math.cos(PI * position) - 1) / 2;
const easeInExpo = (position) => position === 0 ? 0 : pow(2, 10 * (position - 1));
const easeOutExpo = (position) => position === 1 ? 1 : 1 - pow(2, -10 * position);
const easeInOutExpo = (position) => {
  if (position === 0 || position === 1) return position;
  return position < 0.5
    ? pow(2, 10 * (2 * position - 1)) / 2
    : (2 - pow(2, -10 * (2 * position - 1))) / 2;
};
const easeInCirc = (position) => 1 - sqrt(1 - pow(position, 2));
const easeOutCirc = (position) => sqrt(1 - pow(position - 1, 2));
const easeInOutCirc = makeInOut(easeInCirc, easeOutCirc);
const easeInElastic = (position) => {
  if (position === 0 || position === 1) return position;
  return -pow(2, 10 * position - 10) * Math.sin((position * 10 - 10.75) * (TWO_PI / 3));
};
const easeOutElastic = (position) => {
  if (position === 0 || position === 1) return position;
  return pow(2, -10 * position) * Math.sin((position * 10 - 0.75) * (TWO_PI / 3)) + 1;
};
const easeInOutElastic = makeInOut(easeInElastic, easeOutElastic);
const BACK_OVERSHOOT = 1.70158;
const easeInBack = (position) => (BACK_OVERSHOOT + 1) * position ** 3 - BACK_OVERSHOOT * position ** 2;
const easeOutBack = (position) => 1 + (BACK_OVERSHOOT + 1) * (position - 1) ** 3 + BACK_OVERSHOOT * (position - 1) ** 2;
const easeInOutBack = (position) => {
  const overshoot = BACK_OVERSHOOT * 1.525;
  return position < 0.5
    ? (pow(2 * position, 2) * ((overshoot + 1) * 2 * position - overshoot)) / 2
    : (pow(2 * position - 2, 2) * ((overshoot + 1) * (position * 2 - 2) + overshoot) + 2) / 2;
};
const easeOutBounce = (position) => {
  const divisor = 2.75;
  const coefficient = 7.5625;
  if (position < 1 / divisor) return coefficient * position * position;
  if (position < 2 / divisor) {
    position -= 1.5 / divisor;
    return coefficient * position * position + 0.75;
  }
  if (position < 2.5 / divisor) {
    position -= 2.25 / divisor;
    return coefficient * position * position + 0.9375;
  }
  position -= 2.625 / divisor;
  return coefficient * position * position + 0.984375;
};
const easeInBounce = (position) => 1 - easeOutBounce(1 - position);
const easeInOutBounce = makeInOut(easeInBounce, easeOutBounce);

const Easings_exports = {};
__export(Easings_exports, {
  easeInBack: () => easeInBack,
  easeInBounce: () => easeInBounce,
  easeInCirc: () => easeInCirc,
  easeInCubic: () => easeInCubic,
  easeInElastic: () => easeInElastic,
  easeInExpo: () => easeInExpo,
  easeInOutBack: () => easeInOutBack,
  easeInOutBounce: () => easeInOutBounce,
  easeInOutCirc: () => easeInOutCirc,
  easeInOutCubic: () => easeInOutCubic,
  easeInOutElastic: () => easeInOutElastic,
  easeInOutExpo: () => easeInOutExpo,
  easeInOutQuad: () => easeInOutQuad,
  easeInOutQuart: () => easeInOutQuart,
  easeInOutQuint: () => easeInOutQuint,
  easeInOutSine: () => easeInOutSine,
  easeInQuad: () => easeInQuad,
  easeInQuart: () => easeInQuart,
  easeInQuint: () => easeInQuint,
  easeInSine: () => easeInSine,
  easeOutBack: () => easeOutBack,
  easeOutBounce: () => easeOutBounce,
  easeOutCirc: () => easeOutCirc,
  easeOutCubic: () => easeOutCubic,
  easeOutElastic: () => easeOutElastic,
  easeOutExpo: () => easeOutExpo,
  easeOutQuad: () => easeOutQuad,
  easeOutQuart: () => easeOutQuart,
  easeOutQuint: () => easeOutQuint,
  easeOutSine: () => easeOutSine,
  linear: () => linear,
});

function number(fromValue, toValue, position) {
  return fromValue + (toValue - fromValue) * position;
}

function rgbToNumber(red, green, blue) {
  return (red << 16) | (green << 8) | blue;
}

function color(fromValue, toValue, position) {
  const fromRed = fromValue >> 16 & 255;
  const fromGreen = fromValue >> 8 & 255;
  const fromBlue = fromValue & 255;
  const toRed = toValue >> 16 & 255;
  const toGreen = toValue >> 8 & 255;
  const toBlue = toValue & 255;
  return rgbToNumber(
    number(fromRed, toRed, position),
    number(fromGreen, toGreen, position),
    number(fromBlue, toBlue, position),
  );
}

const Interpolators_exports = {};
__export(Interpolators_exports, { color: () => color, number: () => number });

const colorValueToNumber = (() => {
  let canvas;
  let context;
  let cache = Object.create(null);
  let cacheSize = 0;
  const maxCacheSize = 2048;
  return (value) => {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      if (value in cache) return cache[value];
      if (!canvas) {
        canvas = document.createElement("canvas");
        context = canvas.getContext("2d");
      }
      canvas.width = canvas.height = 1;
      context.fillStyle = value;
      context.fillRect(0, 0, 1, 1);
      const pixels = context.getImageData(0, 0, 1, 1).data;
      const result = rgbToNumber(pixels[0], pixels[1], pixels[2]);
      if (cacheSize > maxCacheSize) {
        cache = Object.create(null);
        cacheSize = 0;
      }
      cache[value] = result;
      cacheSize++;
      return result;
    }
    return value && value.toNumber ? value.toNumber() : 0;
  };
})();

class AbstractTween {
  gotoElapsedTime(elapsedTime) {}
  gotoEnd() {}
  isDoneAtElapsedTime(elapsedTime) {}
}

const linear2 = (position) => position;
const maxSafeInteger = 0x1fffffffffffff;

class Tween extends AbstractTween {
  constructor(
    callback,
    fromValue,
    toValue,
    duration = 750,
    delay = 0,
    easing = linear2,
    iterations = 1,
    direction = "forward",
    valueType = "number",
  ) {
    super();
    this.callback = callback;
    this.fromValue = fromValue;
    this.toValue = toValue;
    this.duration = duration;
    this.delay = delay;
    this.easing = easing;
    this.iterations = iterations;
    this.direction = direction;
    this.interpolate = typeof valueType === "function" ? valueType : Interpolators_exports[valueType];
    this.totalElapsed = iterations === Infinity ? maxSafeInteger : delay + duration * iterations;
  }

  gotoElapsedTime(elapsedTime) {
    if (elapsedTime < this.delay || Number.isNaN(elapsedTime)) return;
    const activeTime = Math.min(elapsedTime - this.delay, this.totalElapsed - this.delay);
    const iteration = Math.ceil(activeTime / this.duration);
    const remainder = activeTime % this.duration;
    let position = activeTime === 0 && this.duration !== 0
      ? 0
      : remainder === 0 ? 1 : remainder / this.duration;
    const reverse = this.direction === "reverse"
      || (this.direction === "alternate" && iteration % 2 === 0);
    let easedPosition = this.easing(position);
    if (reverse) easedPosition = 1 - easedPosition;
    this.callback(this.interpolate(this.fromValue, this.toValue, easedPosition));
  }

  gotoEnd() {
    this.gotoElapsedTime(this.totalElapsed);
  }

  isDoneAtElapsedTime(elapsedTime) {
    return elapsedTime >= this.totalElapsed;
  }
}

const Tween_default = Tween;
const Tween_exports = {};
__export(Tween_exports, { default: () => Tween_default });

const globals = {
  __defProp, __getOwnPropDesc, __getOwnPropNames, __hasOwnProp, __export, __copyProps, __toCommonJS,
  Tween_exports, Easings_exports, sqrt, PI, pow, HALF_PI, TWO_PI,
  linear, makeInOut, makeExpIn, makeExpOut, makeExpInOut,
  easeInQuad, easeOutQuad, easeInOutQuad, easeInCubic, easeOutCubic, easeInOutCubic,
  easeInQuart, easeOutQuart, easeInOutQuart, easeInQuint, easeOutQuint, easeInOutQuint,
  easeInSine, easeOutSine, easeInOutSine, easeInExpo, easeOutExpo, easeInOutExpo,
  easeInCirc, easeOutCirc, easeInOutCirc, easeInElastic, easeOutElastic, easeInOutElastic,
  easeInBack, easeOutBack, easeInOutBack, easeInBounce, easeOutBounce, easeInOutBounce,
  Interpolators_exports, number, color, colorValueToNumber, rgbToNumber,
  AbstractTween, linear2, maxSafeInteger, Tween, Tween_default,
};
Object.assign(root, globals);

module.exports = __toCommonJS(Tween_exports);
