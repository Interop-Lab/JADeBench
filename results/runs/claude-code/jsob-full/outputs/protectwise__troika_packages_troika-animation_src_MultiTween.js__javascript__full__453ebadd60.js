"use strict";

const { PI, pow, sqrt } = Math;
const HALF_PI = PI / 2;
const TWO_PI = PI * 2;

function makeInOut(easeIn, easeOut) {
  return (progress) =>
    progress < 0.5
      ? easeIn(progress * 2) * 0.5
      : easeOut(progress * 2 - 1) * 0.5 + 0.5;
}

function makePowerIn(power) {
  return (progress) => pow(progress, power);
}

function makePowerOut(power) {
  return (progress) => 1 - pow(1 - progress, power);
}

function makePowerInOut(power) {
  return (progress) =>
    progress < 0.5
      ? pow(progress * 2, power) * 0.5
      : (1 - pow(1 - (progress * 2 - 1), power)) * 0.5 + 0.5;
}

const linear = (progress) => progress;
const easeInQuad = makePowerIn(2);
const easeOutQuad = makePowerOut(2);
const easeInOutQuad = makePowerInOut(2);
const easeInCubic = makePowerIn(3);
const easeOutCubic = makePowerOut(3);
const easeInOutCubic = makePowerInOut(3);
const easeInQuart = makePowerIn(4);
const easeOutQuart = makePowerOut(4);
const easeInOutQuart = makePowerInOut(4);
const easeInQuint = makePowerIn(5);
const easeOutQuint = makePowerOut(5);
const easeInOutQuint = makePowerInOut(5);
const easeInSine = (progress) => 1 - Math.cos(progress * HALF_PI);
const easeOutSine = (progress) => Math.sin(progress * HALF_PI);
const easeInOutSine = (progress) => -(Math.cos(PI * progress) - 1) / 2;
const easeInExpo = (progress) => (progress === 0 ? 0 : pow(2, 10 * (progress - 1)));
const easeOutExpo = (progress) => (progress === 1 ? 1 : 1 - pow(2, -10 * progress));
const easeInOutExpo = (progress) => {
  if (progress === 0 || progress === 1) return progress;
  return progress < 0.5
    ? pow(2, 10 * (progress * 2 - 1)) / 2
    : (2 - pow(2, -10 * (progress * 2 - 1))) / 2;
};
const easeInCirc = (progress) => 1 - sqrt(1 - progress * progress);
const easeOutCirc = (progress) => sqrt(1 - pow(progress - 1, 2));
const easeInOutCirc = makeInOut(easeInCirc, easeOutCirc);
const easeOutElastic = (progress) => {
  if (progress === 0 || progress === 1) return progress;
  return pow(2, -10 * progress) * Math.sin(((progress - 0.075) * TWO_PI) / 0.3) + 1;
};
const easeInElastic = (progress) =>
  progress === 0 || progress === 1 ? progress : 1 - easeOutElastic(1 - progress);
const easeInOutElastic = makeInOut(easeInElastic, easeOutElastic);
const easeInBack = (progress) => progress * progress * (2.70158 * progress - 1.70158);
const easeOutBack = (progress) =>
  --progress * progress * (2.70158 * progress + 1.70158) + 1;
const easeInOutBack = (progress) => {
  const overshoot = 1.70158 * 1.525;
  progress *= 2;
  if (progress < 1) {
    return 0.5 * (progress * progress * ((overshoot + 1) * progress - overshoot));
  }
  progress -= 2;
  return 0.5 * (progress * progress * ((overshoot + 1) * progress + overshoot) + 2);
};
const easeOutBounce = (progress) => {
  if (progress < 1 / 2.75) return 7.5625 * progress * progress;
  if (progress < 2 / 2.75) {
    progress -= 1.5 / 2.75;
    return 7.5625 * progress * progress + 0.75;
  }
  if (progress < 2.5 / 2.75) {
    progress -= 2.25 / 2.75;
    return 7.5625 * progress * progress + 0.9375;
  }
  progress -= 2.625 / 2.75;
  return 7.5625 * progress * progress + 0.984375;
};
const easeInBounce = (progress) => 1 - easeOutBounce(1 - progress);
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

function interpolateNumber(start, end, progress) {
  return start + (end - start) * progress;
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
    return value && value.isColor ? value.getHex() : 0;
  };
})();

function interpolateColor(start, end, progress) {
  start = colorValueToNumber(start);
  end = colorValueToNumber(end);
  return rgbToNumber(
    interpolateNumber((start >> 16) & 255, (end >> 16) & 255, progress),
    interpolateNumber((start >> 8) & 255, (end >> 8) & 255, progress),
    interpolateNumber(start & 255, end & 255, progress),
  );
}

const Interpolators = {
  color: interpolateColor,
  number: interpolateNumber,
};

class AbstractTween {
  gotoElapsedTime() {}
  gotoEnd() {}
  isDoneAtElapsedTime() {}
}

const maxSafeInteger = Number.MAX_SAFE_INTEGER;

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
    interpolation = "number",
  ) {
    super();
    this.callback = callback;
    this.fromValue = fromValue;
    this.toValue = toValue;
    this.duration = duration;
    this.delay = delay;
    this.easing = typeof easing === "string" ? Easings[easing] || linear : easing;
    this.iterations = iterations;
    this.direction = direction;
    this.interpolate =
      typeof interpolation === "function"
        ? interpolation
        : Interpolators[interpolation] || interpolateNumber;
    this.totalElapsed =
      iterations < maxSafeInteger ? delay + duration * iterations : maxSafeInteger;
  }

  gotoElapsedTime(elapsedTime) {
    const delay = this.delay;
    const duration = this.duration;
    if (elapsedTime >= delay) {
      elapsedTime = Math.min(elapsedTime, this.totalElapsed) - delay;
      let progress = (elapsedTime / duration) % 1;
      if (progress === 0 && elapsedTime !== 0) progress = 1;
      progress = this.easing(progress);
      if (
        this.direction === "reverse" ||
        (this.direction === "alternate" && Math.ceil(elapsedTime / duration) % 2 === 0)
      ) {
        progress = 1 - progress;
      }
      this.callback(this.interpolate(this.fromValue, this.toValue, progress));
    }
  }

  gotoEnd() {
    this.callback(this.toValue);
  }

  isDoneAtElapsedTime(elapsedTime) {
    return elapsedTime > this.totalElapsed;
  }
}

function compareEndTime(first, second) {
  return first.totalElapsed - second.totalElapsed;
}

class MultiTween extends Tween {
  constructor(tweens, duration, delay, easing, iterations, direction) {
    if (typeof duration !== "number") {
      duration = tweens.reduce(
        (maximum, tween) => Math.max(maximum, tween.totalElapsed),
        0,
      );
    }
    if (duration === Infinity) duration = Number.MAX_SAFE_INTEGER;
    super(null, 0, duration, duration, delay, easing, iterations, direction);
    if (tweens.length === 1) {
      this.callback = tweens[0].gotoElapsedTime.bind(tweens[0]);
    } else {
      tweens.sort(compareEndTime);
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

Object.defineProperty(exports, "__esModule", { value: true });
Object.defineProperty(exports, "default", {
  enumerable: true,
  get: () => MultiTween,
});
