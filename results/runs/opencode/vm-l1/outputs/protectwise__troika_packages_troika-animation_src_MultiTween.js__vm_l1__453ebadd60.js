"use strict";

const { pow, sqrt, PI } = Math;
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
  return makeInOut(makeExpIn(exponent), makeExpOut(exponent));
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

const easeInExpo = progress => progress === 0 ? 0 : pow(2, 10 * progress - 10);
const easeOutExpo = progress => progress === 1 ? 1 : 1 - pow(2, -10 * progress);
const easeInOutExpo = progress => {
  if (progress === 0 || progress === 1) return progress;
  return progress < 0.5
    ? pow(2, 20 * progress - 10) / 2
    : (2 - pow(2, -20 * progress + 10)) / 2;
};

const easeInCirc = progress => 1 - sqrt(1 - progress * progress);
const easeOutCirc = progress => sqrt(1 - pow(progress - 1, 2));
const easeInOutCirc = makeInOut(easeInCirc, easeOutCirc);

const easeInElastic = progress => {
  if (progress === 0 || progress === 1) return progress;
  return -pow(2, 10 * progress - 10) * Math.sin((progress * 10 - 10.75) * TWO_PI / 3);
};
const easeOutElastic = progress => {
  if (progress === 0 || progress === 1) return progress;
  return pow(2, -10 * progress) * Math.sin((progress * 10 - 0.75) * TWO_PI / 3) + 1;
};
const easeInOutElastic = makeInOut(easeInElastic, easeOutElastic);

const BACK_OVERSHOOT = 1.70158;
const easeInBack = progress => (BACK_OVERSHOOT + 1) * progress ** 3 - BACK_OVERSHOOT * progress ** 2;
const easeOutBack = progress => 1 + (BACK_OVERSHOOT + 1) * (progress - 1) ** 3 + BACK_OVERSHOOT * (progress - 1) ** 2;
const easeInOutBack = progress => {
  const overshoot = BACK_OVERSHOOT * 1.525;
  return progress < 0.5
    ? (pow(2 * progress, 2) * ((overshoot + 1) * 2 * progress - overshoot)) / 2
    : (pow(2 * progress - 2, 2) * ((overshoot + 1) * (progress * 2 - 2) + overshoot) + 2) / 2;
};

const easeOutBounce = progress => {
  const divisor = 2.75;
  const scale = 7.5625;
  if (progress < 1 / divisor) return scale * progress * progress;
  if (progress < 2 / divisor) return scale * (progress -= 1.5 / divisor) * progress + 0.75;
  if (progress < 2.5 / divisor) return scale * (progress -= 2.25 / divisor) * progress + 0.9375;
  return scale * (progress -= 2.625 / divisor) * progress + 0.984375;
};
const easeInBounce = progress => 1 - easeOutBounce(1 - progress);
const easeInOutBounce = makeInOut(easeInBounce, easeOutBounce);

const Easings = {
  linear,
  easeInQuad, easeOutQuad, easeInOutQuad,
  easeInCubic, easeOutCubic, easeInOutCubic,
  easeInQuart, easeOutQuart, easeInOutQuart,
  easeInQuint, easeOutQuint, easeInOutQuint,
  easeInSine, easeOutSine, easeInOutSine,
  easeInExpo, easeOutExpo, easeInOutExpo,
  easeInCirc, easeOutCirc, easeInOutCirc,
  easeInElastic, easeOutElastic, easeInOutElastic,
  easeInBack, easeOutBack, easeInOutBack,
  easeInBounce, easeOutBounce, easeInOutBounce,
};

function interpolateNumber(fromValue, toValue, progress) {
  return fromValue + (toValue - fromValue) * progress;
}

function rgbToNumber(red, green, blue) {
  return (red << 16) | (green << 8) | blue;
}

const colorValueToNumber = (() => {
  let canvas;
  let context;
  let cache = Object.create(null);
  let cacheSize = 0;
  const maximumCacheSize = 2048;

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
      const pixels = context.getImageData(0, 0, 1, 1).data;
      const color = rgbToNumber(pixels[0], pixels[1], pixels[2]);
      if (cacheSize > maximumCacheSize) {
        cache = Object.create(null);
        cacheSize = 0;
      }
      cache[value] = color;
      cacheSize++;
      return color;
    }
    return value && value.isColor ? value.getHex() : 0;
  };
})();

function interpolateColor(fromValue, toValue, progress) {
  const from = colorValueToNumber(fromValue);
  const to = colorValueToNumber(toValue);
  const red = Math.floor(interpolateNumber(from >> 16 & 255, to >> 16 & 255, progress));
  const green = Math.floor(interpolateNumber(from >> 8 & 255, to >> 8 & 255, progress));
  const blue = Math.floor(interpolateNumber(from & 255, to & 255, progress));
  return rgbToNumber(red, green, blue);
}

const Interpolators = {
  number: interpolateNumber,
  color: interpolateColor,
};

class AbstractTween {
  gotoElapsedTime(_elapsedTime) {}
  gotoEnd() {}
  isDoneAtElapsedTime(_elapsedTime) {}
}

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
    interpolate = "number",
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
    this.interpolate = typeof interpolate === "function" ? interpolate : Interpolators[interpolate];
    this.totalElapsed = delay + duration * iterations;
  }

  gotoElapsedTime(elapsedTime) {
    if (elapsedTime < this.delay) return;

    const activeTime = Math.min(elapsedTime - this.delay, this.duration * this.iterations);
    let iteration = Math.min(Math.floor(activeTime / this.duration), this.iterations - 1);
    let progress = activeTime === this.duration * this.iterations
      ? 1
      : (activeTime % this.duration) / this.duration;

    if (this.direction === "reverse" ||
        (this.direction === "alternate" && Math.ceil(activeTime / this.duration) % 2 === 0)) {
      progress = 1 - progress;
    }

    const value = this.interpolate(this.fromValue, this.toValue, this.easing(progress));
    if (this.callback) this.callback(value);
    else this._syncTweens(value);
  }

  gotoEnd() {
    return this.gotoElapsedTime(this.totalElapsed);
  }

  isDoneAtElapsedTime(elapsedTime) {
    return elapsedTime > this.totalElapsed;
  }
}

function endTimeComparator(left, right) {
  return left.totalElapsed - right.totalElapsed;
}

class MultiTween extends Tween {
  constructor(tweens, duration, delay = 0, easing = linear, iterations = 1, direction = "forward") {
    if (typeof duration !== "number") {
      duration = tweens.reduce((maximum, tween) => Math.max(maximum, tween.totalElapsed), 0);
    }
    if (duration === Infinity) duration = Number.MAX_VALUE;
    super(null, 0, duration, duration, delay, easing, iterations, direction);
    this.tweens = tweens;
  }

  _syncTweens(elapsedTime) {
    for (const tween of this.tweens) {
      tween.gotoElapsedTime(elapsedTime);
    }
  }
}

Object.defineProperty(exports, "__esModule", { value: true });
Object.defineProperty(exports, "default", { enumerable: true, get: () => MultiTween });
