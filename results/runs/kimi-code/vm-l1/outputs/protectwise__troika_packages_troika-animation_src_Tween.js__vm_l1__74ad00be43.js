"use strict";

const { PI, pow, sqrt } = Math;
const HALF_PI = PI / 2;
const TWO_PI = PI * 2;
const MAX_SAFE_INTEGER = 0x1fffffffffffff;

function makeInOut(easeIn, easeOut) {
  return value => value < 0.5
    ? easeIn(value * 2) / 2
    : easeOut(value * 2 - 1) / 2 + 0.5;
}

function makeExpIn(exponent) {
  return value => pow(value, exponent);
}

function makeExpOut(exponent) {
  return value => 1 - pow(1 - value, exponent);
}

function makeExpInOut(exponent) {
  return makeInOut(makeExpIn(exponent), makeExpOut(exponent));
}

const linear = value => value;
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
const easeInSine = value => 1 - Math.cos(value * HALF_PI);
const easeOutSine = value => Math.sin(value * HALF_PI);
const easeInOutSine = value => -(Math.cos(PI * value) - 1) / 2;
const easeInExpo = value => value === 0 ? 0 : pow(2, 10 * value - 10);
const easeOutExpo = value => value === 1 ? 1 : 1 - pow(2, -10 * value);
const easeInOutExpo = value => {
  if (value === 0 || value === 1) return value;
  return value < 0.5
    ? pow(2, 20 * value - 10) / 2
    : (2 - pow(2, -20 * value + 10)) / 2;
};
const easeInCirc = value => 1 - sqrt(1 - value * value);
const easeOutCirc = value => sqrt(1 - pow(value - 1, 2));
const easeInOutCirc = makeInOut(easeInCirc, easeOutCirc);
const easeInElastic = value => {
  if (value === 0 || value === 1) return value;
  return -pow(2, 10 * value - 10) * Math.sin((value * 10 - 10.75) * TWO_PI / 3);
};
const easeOutElastic = value => {
  if (value === 0 || value === 1) return value;
  return pow(2, -10 * value) * Math.sin((value * 10 - 0.75) * TWO_PI / 3) + 1;
};
const easeInOutElastic = makeInOut(easeInElastic, easeOutElastic);
const BACK_OVERSHOOT = 1.70158;
const easeInBack = value => (BACK_OVERSHOOT + 1) * value * value * value - BACK_OVERSHOOT * value * value;
const easeOutBack = value => 1 + (BACK_OVERSHOOT + 1) * pow(value - 1, 3) + BACK_OVERSHOOT * pow(value - 1, 2);
const easeInOutBack = value => {
  const overshoot = BACK_OVERSHOOT * 1.525;
  return value < 0.5
    ? pow(2 * value, 2) * ((overshoot + 1) * 2 * value - overshoot) / 2
    : (pow(2 * value - 2, 2) * ((overshoot + 1) * (value * 2 - 2) + overshoot) + 2) / 2;
};
const easeOutBounce = value => {
  const scale = 7.5625;
  const step = 2.75;
  if (value < 1 / step) return scale * value * value;
  if (value < 2 / step) {
    value -= 1.5 / step;
    return scale * value * value + 0.75;
  }
  if (value < 2.5 / step) {
    value -= 2.25 / step;
    return scale * value * value + 0.9375;
  }
  value -= 2.625 / step;
  return scale * value * value + 0.984375;
};
const easeInBounce = value => 1 - easeOutBounce(1 - value);
const easeInOutBounce = makeInOut(easeInBounce, easeOutBounce);

const Easings = {
  linear,
  easeInQuad,
  easeOutQuad,
  easeInOutQuad,
  easeInCubic,
  easeOutCubic,
  easeInOutCubic,
  easeInQuart,
  easeOutQuart,
  easeInOutQuart,
  easeInQuint,
  easeOutQuint,
  easeInOutQuint,
  easeInSine,
  easeOutSine,
  easeInOutSine,
  easeInExpo,
  easeOutExpo,
  easeInOutExpo,
  easeInCirc,
  easeOutCirc,
  easeInOutCirc,
  easeInElastic,
  easeOutElastic,
  easeInOutElastic,
  easeInBack,
  easeOutBack,
  easeInOutBack,
  easeInBounce,
  easeOutBounce,
  easeInOutBounce
};

function interpolateNumber(fromValue, toValue, progress) {
  return fromValue + (toValue - fromValue) * progress;
}

function rgbToNumber(red, green, blue) {
  return red << 16 ^ green << 8 ^ blue;
}

const colorValueToNumber = (() => {
  let canvas;
  let context;
  let cache = Object.create(null);
  let cacheSize = 0;
  const maxCacheSize = 2048;

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
      const number = rgbToNumber(pixel[0], pixel[1], pixel[2]);
      if (cacheSize > maxCacheSize) {
        cache = Object.create(null);
        cacheSize = 0;
      }
      cache[value] = number;
      cacheSize++;
      return number;
    }
    return value && value.isColor ? value.getHex() : 0;
  };
})();

function interpolateColor(fromValue, toValue, progress) {
  const from = colorValueToNumber(fromValue);
  const to = colorValueToNumber(toValue);
  return rgbToNumber(
    interpolateNumber(from >> 16 & 255, to >> 16 & 255, progress),
    interpolateNumber(from >> 8 & 255, to >> 8 & 255, progress),
    interpolateNumber(from & 255, to & 255, progress)
  );
}

const Interpolators = {
  number: interpolateNumber,
  color: interpolateColor
};

class AbstractTween {
  gotoElapsedTime(elapsedTime) {}
  gotoEnd() {}
  isDoneAtElapsedTime(elapsedTime) {}
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
    interpolate = "number"
  ) {
    super();
    this.callback = callback;
    this.fromValue = fromValue;
    this.toValue = toValue;
    this.duration = duration;
    this.delay = delay;
    this.easing = typeof easing === "function" ? easing : Easings[easing];
    this.iterations = iterations;
    this.direction = direction;
    this.interpolate = typeof interpolate === "function" ? interpolate : Interpolators[interpolate];
    this.totalElapsed = 0;
  }

  gotoElapsedTime(totalElapsed) {
    const elapsed = Math.min(
      this.duration * this.iterations + this.delay,
      totalElapsed
    );
    const iteration = Math.ceil((elapsed - this.delay) / this.duration);
    let progress = iteration
      ? (elapsed - this.delay) / this.duration % 1 || 1
      : 0;
    if (
      this.direction === "reverse" ||
      this.direction === "alternate" && iteration % 2 === 0
    ) {
      progress = 1 - progress;
    }

    this.callback(this.interpolate(this.fromValue, this.toValue, this.easing(progress)));
    this.totalElapsed = totalElapsed;
  }

  gotoEnd() {
    this.gotoElapsedTime(this.totalElapsed + MAX_SAFE_INTEGER);
  }

  isDoneAtElapsedTime(totalElapsed) {
    return totalElapsed - this.totalElapsed >= this.duration * this.iterations + this.delay;
  }
}

Object.defineProperty(exports, "__esModule", { value: true });
Object.defineProperty(exports, "default", { enumerable: true, get: () => Tween });
