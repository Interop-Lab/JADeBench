const exportedModule = {};
let defaultExport;
Object.defineProperty(exportedModule, "__esModule", { value: true });
Object.defineProperty(exportedModule, "default", {
  get: () => defaultExport,
  enumerable: true,
});
module.exports = exportedModule;

const { pow, PI, sqrt } = Math;
const HALF_PI = PI / 2;
const TWO_PI = PI * 2;

function makeInOut(easeIn, easeOut) {
  return (progress) =>
    progress < 0.5
      ? easeIn(progress * 2) * 0.5
      : easeOut(progress * 2 - 1) * 0.5 + 0.5;
}

function makeExpIn(exponent) {
  return (progress) => pow(progress, exponent);
}

function makeExpOut(exponent) {
  return (progress) => 1 - pow(1 - progress, exponent);
}

function makeExpInOut(exponent) {
  return (progress) =>
    progress < 0.5
      ? pow(progress * 2, exponent) * 0.5
      : (1 - pow(1 - (progress * 2 - 1), exponent)) * 0.5 + 0.5;
}

const linear = (progress) => progress;
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
const easeInSine = (progress) => 1 - Math.cos(progress * HALF_PI);
const easeOutSine = (progress) => Math.sin(progress * HALF_PI);
const easeInOutSine = (progress) => -0.5 * (Math.cos(PI * progress) - 1);
const easeInExpo = (progress) =>
  progress === 0 ? 0 : pow(2, 10 * (progress - 1));
const easeOutExpo = (progress) =>
  progress === 1 ? 1 : 1 - pow(2, -10 * progress);
const easeInOutExpo = (progress) => {
  if (progress === 0 || progress === 1) return progress;
  return progress < 0.5
    ? pow(2, 10 * (progress * 2 - 1)) * 0.5
    : (1 - pow(2, -10 * (progress * 2 - 1))) * 0.5 + 0.5;
};
const easeInCirc = (progress) => 1 - sqrt(1 - progress * progress);
const easeOutCirc = (progress) => sqrt(1 - pow(progress - 1, 2));
const easeInOutCirc = makeInOut(easeInCirc, easeOutCirc);
const easeInElastic = (progress) =>
  progress === 0 || progress === 1
    ? progress
    : 1 - easeOutElastic(1 - progress);
const easeOutElastic = (progress) =>
  progress === 0 || progress === 1
    ? progress
    : pow(2, -10 * progress) *
        Math.sin(((progress - 0.075) * TWO_PI) / 0.3) +
      1;
const easeInOutElastic = makeInOut(easeInElastic, easeOutElastic);
const easeInBack = (progress) =>
  progress * progress * (2.70158 * progress - 1.70158);
const easeOutBack = (progress) => {
  progress -= 1;
  return progress * progress * (2.70158 * progress + 1.70158) + 1;
};
const easeInOutBack = (progress) => {
  const overshoot = 1.70158 * 1.525;
  progress *= 2;
  if (progress < 1) {
    return 0.5 * (progress * progress * ((overshoot + 1) * progress - overshoot));
  }
  progress -= 2;
  return (
    0.5 *
    (progress * progress * ((overshoot + 1) * progress + overshoot) + 2)
  );
};
const easeInBounce = (progress) => 1 - easeOutBounce(1 - progress);
const easeOutBounce = (progress) => {
  if (progress < 4 / 11) return 7.5625 * progress * progress;
  if (progress < 8 / 11) {
    progress -= 6 / 11;
    return 7.5625 * progress * progress + 0.75;
  }
  if (progress < 10 / 11) {
    progress -= 9 / 11;
    return 7.5625 * progress * progress + 0.9375;
  }
  progress -= 21 / 22;
  return 7.5625 * progress * progress + 0.984375;
};
const easeInOutBounce = makeInOut(easeInBounce, easeOutBounce);

const easings = {
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
      const pixel = context.getImageData(0, 0, 1, 1).data;
      const colorNumber = rgbToNumber(pixel[0], pixel[1], pixel[2]);

      if (cacheSize > maxCacheSize) {
        cache = Object.create(null);
        cacheSize = 0;
      }
      cache[value] = colorNumber;
      cacheSize++;
      return colorNumber;
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

const interpolators = {
  color: interpolateColor,
  number: interpolateNumber,
};

class AbstractTween {
  gotoElapsedTime(elapsedTime) {}

  gotoEnd() {}

  isDoneAtElapsedTime(elapsedTime) {}
}

const maxSafeInteger = 9007199254740991;

class Tween extends AbstractTween {
  constructor(
    callback,
    fromValue,
    toValue,
    duration = 750,
    delay = 0,
    easing = linear,
    iterations = 1,
    direction = "forward",
    interpolator = "number",
  ) {
    super();
    this.callback = callback;
    this.fromValue = fromValue;
    this.toValue = toValue;
    this.duration = duration;
    this.delay = delay;
    this.easing = typeof easing === "string" ? easings[easing] || linear : easing;
    this.iterations = iterations;
    this.direction = direction;
    this.interpolate =
      typeof interpolator === "function"
        ? interpolator
        : interpolators[interpolator] || interpolateNumber;
    this.totalElapsed =
      this.iterations < maxSafeInteger
        ? this.delay + this.duration * this.iterations
        : maxSafeInteger;
  }

  gotoElapsedTime(elapsedTime) {
    const duration = this.duration;
    const delay = this.delay;
    if (!(elapsedTime >= delay)) return;

    elapsedTime = Math.min(elapsedTime, this.totalElapsed) - delay;
    let progress = (elapsedTime % duration) / duration;
    if (progress === 0 && elapsedTime !== 0) progress = 1;
    progress = this.easing(progress);

    const shouldReverse =
      this.direction === "reverse" ||
      (this.direction === "alternate" &&
        Math.ceil(elapsedTime / duration) % 2 === 0);
    if (shouldReverse) progress = 1 - progress;

    this.callback(
      this.interpolate(this.fromValue, this.toValue, progress),
    );
  }

  gotoEnd() {
    this.gotoElapsedTime(this.totalElapsed);
  }

  isDoneAtElapsedTime(elapsedTime) {
    return elapsedTime > this.totalElapsed;
  }
}

class MultiTween extends Tween {
  constructor(tweens, duration, delay, easing, iterations, direction) {
    if (typeof duration !== "number") {
      duration = tweens.reduce(
        (longestDuration, tween) =>
          Math.max(longestDuration, tween.totalElapsed),
        0,
      );
    }
    if (duration === Infinity) duration = Number.MAX_VALUE;

    super(null, 0, duration, duration, delay, easing, iterations, direction);

    if (tweens.length === 1) {
      this.callback = tweens[0].gotoElapsedTime.bind(tweens[0]);
    } else {
      tweens.sort(compareTweenEndTimes);
      this.callback = this._syncTweens;
    }
    this.tweens = tweens;
  }

  _syncTweens(elapsedTime) {
    for (let index = 0, length = this.tweens.length; index < length; index++) {
      this.tweens[index].gotoElapsedTime(elapsedTime);
    }
  }
}

function compareTweenEndTimes(leftTween, rightTween) {
  return leftTween.totalElapsed - rightTween.totalElapsed;
}

defaultExport = MultiTween;

