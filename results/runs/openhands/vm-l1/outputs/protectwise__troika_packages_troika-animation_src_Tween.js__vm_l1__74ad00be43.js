const defineProperty = Object.defineProperty;
const getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
const getOwnPropertyNames = Object.getOwnPropertyNames;
const hasOwnProperty = Object.prototype.hasOwnProperty;

function exportGetters(target, getters) {
  for (const name in getters) {
    defineProperty(target, name, {
      get: getters[name],
      enumerable: true,
    });
  }
}

function copyProperties(target, source, excludedName, descriptor) {
  if (source && (typeof source === "object" || typeof source === "function")) {
    for (const name of getOwnPropertyNames(source)) {
      if (!hasOwnProperty.call(target, name) && name !== excludedName) {
        defineProperty(target, name, {
          get: () => source[name],
          enumerable: !(descriptor = getOwnPropertyDescriptor(source, name)) || descriptor.enumerable,
        });
      }
    }
  }
  return target;
}

function toCommonJS(moduleObject) {
  return copyProperties(
    defineProperty({}, "__esModule", { value: true }),
    moduleObject,
  );
}

const { PI, pow, sqrt } = Math;
const HALF_PI = PI / 2;
const TWO_PI = PI * 2;

function makeInOut(easeIn, easeOut) {
  return progress => progress < 0.5
    ? easeIn(progress * 2) / 2
    : easeOut(progress * 2 - 1) / 2 + 0.5;
}

function makeExpIn(exponent) {
  return progress => pow(progress, exponent);
}

function makeExpOut(exponent) {
  return progress => 1 - pow(1 - progress, exponent);
}

function makeExpInOut(exponent) {
  return progress => progress < 0.5
    ? pow(progress * 2, exponent) / 2
    : (2 - pow(2 - progress * 2, exponent)) / 2;
}

const linear = progress => progress;
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

const easeInSine = progress => 1 - Math.cos(progress * HALF_PI);
const easeOutSine = progress => Math.sin(progress * HALF_PI);
const easeInOutSine = progress => -(Math.cos(PI * progress) - 1) / 2;

const easeInExpo = progress => progress === 0
  ? 0
  : pow(2, 10 * progress - 10);

const easeOutExpo = progress => progress === 1
  ? 1
  : 1 - pow(2, -10 * progress);

const easeInOutExpo = progress => {
  if (progress === 0 || progress === 1) return progress;
  return progress < 0.5
    ? pow(2, 20 * progress - 10) / 2
    : (2 - pow(2, -20 * progress + 10)) / 2;
};

const easeInCirc = progress => 1 - sqrt(1 - pow(progress, 2));
const easeOutCirc = progress => sqrt(1 - pow(progress - 1, 2));
const easeInOutCirc = makeInOut(easeInCirc, easeOutCirc);

const easeOutElastic = progress => {
  if (progress === 0 || progress === 1) return progress;
  return pow(2, -10 * progress)
    * Math.sin((progress - 0.075) * TWO_PI / 0.3)
    + 1;
};

const easeInElastic = progress => {
  if (progress === 0 || progress === 1) return progress;
  return 1 - easeOutElastic(1 - progress);
};

const easeInOutElastic = makeInOut(easeInElastic, easeOutElastic);

const easeInBack = progress => progress * progress
  * (2.70158 * progress - 1.70158);

const easeOutBack = progress => {
  const shifted = progress - 1;
  return 1 + shifted * shifted * (2.70158 * shifted + 1.70158);
};

const easeInOutBack = progress => {
  const overshoot = 1.70158 * 1.525;
  let scaled = progress * 2;
  if (scaled < 1) {
    return scaled * scaled * ((overshoot + 1) * scaled - overshoot) / 2;
  }
  scaled -= 2;
  return (scaled * scaled * ((overshoot + 1) * scaled + overshoot) + 2) / 2;
};

const easeOutBounce = progress => {
  if (progress < 1 / 2.75) {
    return 7.5625 * progress * progress;
  }
  if (progress < 2 / 2.75) {
    const shifted = progress - 1.5 / 2.75;
    return 7.5625 * shifted * shifted + 0.75;
  }
  if (progress < 2.5 / 2.75) {
    const shifted = progress - 2.25 / 2.75;
    return 7.5625 * shifted * shifted + 0.9375;
  }
  const shifted = progress - 2.625 / 2.75;
  return 7.5625 * shifted * shifted + 0.984375;
};

const easeInBounce = progress => 1 - easeOutBounce(1 - progress);
const easeInOutBounce = makeInOut(easeInBounce, easeOutBounce);

const Easings = {
  easeInBack,
  easeInBounce,
  easeInCirc,
  easeInCubic,
  easeInElastic,
  easeInExpo,
  easeInOutBack,
  easeInOutBounce,
  easeInOutCirc,
  easeInOutCubic,
  easeInOutElastic,
  easeInOutExpo,
  easeInOutQuad,
  easeInOutQuart,
  easeInOutQuint,
  easeInOutSine,
  easeInQuad,
  easeInQuart,
  easeInQuint,
  easeInSine,
  easeOutBack,
  easeOutBounce,
  easeOutCirc,
  easeOutCubic,
  easeOutElastic,
  easeOutExpo,
  easeOutQuad,
  easeOutQuart,
  easeOutQuint,
  easeOutSine,
  linear,
};

function interpolateNumber(fromValue, toValue, progress) {
  return fromValue + (toValue - fromValue) * progress;
}

function rgbToNumber(red, green, blue) {
  return (red << 16) ^ (green << 8) ^ blue;
}

const colorValueToNumber = (() => {
  let canvas;
  let context;
  let cache = Object.create(null);
  let cacheSize = 0;
  const maxCacheSize = 0x800;

  return value => {
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
      const pixel = context.getImageData(0, 0, 1, 1).data;
      const numericColor = rgbToNumber(pixel[0], pixel[1], pixel[2]);

      if (cacheSize > maxCacheSize) {
        cache = Object.create(null);
        cacheSize = 0;
      }
      cache[value] = numericColor;
      cacheSize += 1;
      return numericColor;
    }

    return value && value.isColor ? value.getHex() : 0;
  };
})();

function interpolateColor(fromValue, toValue, progress) {
  const fromColor = colorValueToNumber(fromValue);
  const toColor = colorValueToNumber(toValue);

  return rgbToNumber(
    interpolateNumber((fromColor >> 16) & 255, (toColor >> 16) & 255, progress),
    interpolateNumber((fromColor >> 8) & 255, (toColor >> 8) & 255, progress),
    interpolateNumber(fromColor & 255, toColor & 255, progress),
  );
}

const Interpolators = {
  color: interpolateColor,
  number: interpolateNumber,
};

class AbstractTween {
  gotoElapsedTime(elapsedTime) {}
  gotoEnd() {}
  isDoneAtElapsedTime(elapsedTime) {}
}

const maxSafeInteger = 0x1fffffffffffff;
const linearTween = progress => progress;

class Tween extends AbstractTween {
  constructor(
    callback,
    fromValue,
    toValue,
    duration = 750,
    delay = 0,
    easing = linearTween,
    iterations = 1,
    direction = "forward",
    interpolate = "number",
  ) {
    super();
    this.callback = callback;
    this.fromValue = fromValue;
    this.toValue = toValue;
    this.duration = duration;
    this.delay = delay;
    this.easing = typeof easing === "string"
      ? Easings[easing] || linearTween
      : easing;
    this.iterations = iterations;
    this.direction = direction;
    this.interpolate = typeof interpolate === "function"
      ? interpolate
      : Interpolators[interpolate] || Interpolators.number;
    this.totalElapsed = iterations < maxSafeInteger
      ? delay + duration * iterations
      : maxSafeInteger;
  }

  gotoElapsedTime(elapsedTime) {
    const { duration, delay } = this;
    if (elapsedTime < delay) return;

    elapsedTime = Math.min(elapsedTime, this.totalElapsed) - delay;
    let progress = (elapsedTime % duration) / duration;
    if (progress === 0 && elapsedTime !== 0) progress = 1;
    progress = this.easing(progress);

    if (
      this.direction === "reverse"
      || (
        this.direction === "alternate"
        && Math.ceil(elapsedTime / duration) % 2 === 0
      )
    ) {
      progress = 1 - progress;
    }

    this.callback(this.interpolate(this.fromValue, this.toValue, progress));
  }

  gotoEnd() {
    this.gotoElapsedTime(this.totalElapsed);
  }

  isDoneAtElapsedTime(elapsedTime) {
    return elapsedTime > this.totalElapsed;
  }
}

const TweenModule = {};
exportGetters(TweenModule, { default: () => Tween });
module.exports = toCommonJS(TweenModule);
