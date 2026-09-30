"use strict";

var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;

var __export = (target, all) => {
  for (var name in all) {
    __defProp(target, name, {
      get: all[name],
      enumerable: true
    });
  }
};

var __copyProps = (to, from, except, desc) => {
  if (from && (typeof from === "object" || typeof from === "function")) {
    for (const key of __getOwnPropNames(from)) {
      if (!__hasOwnProp.call(to, key) && key !== except) {
        __defProp(to, key, {
          get: () => from[key],
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
        });
      }
    }
  }
  return to;
};

var __toCommonJS = mod =>
  __copyProps(__defProp({}, "__esModule", { value: true }), mod);

var Tween_exports = {};
__export(Tween_exports, {
  default: () => Tween
});
module.exports = __toCommonJS(Tween_exports);

const { pow, PI, sqrt } = Math;
const HALF_PI = PI / 2;
const TWO_PI = PI * 2;

function makeInOut(easeIn, easeOut) {
  return value =>
    value < 0.5
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
  if (value === 0 || value === 1) {
    return value;
  }
  return value < 0.5
    ? pow(2, 20 * value - 10) / 2
    : (2 - pow(2, -20 * value + 10)) / 2;
};

const easeInCirc = value => 1 - sqrt(1 - value * value);
const easeOutCirc = value => sqrt(1 - pow(value - 1, 2));
const easeInOutCirc = makeInOut(easeInCirc, easeOutCirc);

const easeInElastic = value => {
  if (value === 0 || value === 1) {
    return value;
  }
  return -pow(2, 10 * value - 10) *
    Math.sin((value * 10 - 10.75) * TWO_PI / 3);
};

const easeOutElastic = value => {
  if (value === 0 || value === 1) {
    return value;
  }
  return pow(2, -10 * value) *
    Math.sin((value * 10 - 0.75) * TWO_PI / 3) + 1;
};

const easeInOutElastic = makeInOut(easeInElastic, easeOutElastic);

const BACK_OVERSHOOT = 1.70158;
const BACK_IN_OUT_OVERSHOOT = BACK_OVERSHOOT * 1.525;

const easeInBack = value =>
  (BACK_OVERSHOOT + 1) * value * value * value -
  BACK_OVERSHOOT * value * value;

const easeOutBack = value =>
  1 +
  (BACK_OVERSHOOT + 1) * pow(value - 1, 3) +
  BACK_OVERSHOOT * pow(value - 1, 2);

const easeInOutBack = value =>
  value < 0.5
    ? pow(2 * value, 2) *
      ((BACK_IN_OUT_OVERSHOOT + 1) * 2 * value -
        BACK_IN_OUT_OVERSHOOT) / 2
    : (pow(2 * value - 2, 2) *
      ((BACK_IN_OUT_OVERSHOOT + 1) * (value * 2 - 2) +
        BACK_IN_OUT_OVERSHOOT) + 2) / 2;

const easeOutBounce = value => {
  const n1 = 7.5625;
  const d1 = 2.75;

  if (value < 1 / d1) {
    return n1 * value * value;
  }
  if (value < 2 / d1) {
    value -= 1.5 / d1;
    return n1 * value * value + 0.75;
  }
  if (value < 2.5 / d1) {
    value -= 2.25 / d1;
    return n1 * value * value + 0.9375;
  }

  value -= 2.625 / d1;
  return n1 * value * value + 0.984375;
};

const easeInBounce = value => 1 - easeOutBounce(1 - value);
const easeInOutBounce = makeInOut(easeInBounce, easeOutBounce);

function number(from, to, progress) {
  return from + (to - from) * progress;
}

function rgbToNumber(red, green, blue) {
  return (red << 16) | (green << 8) | blue;
}

const colorValueToNumber = (() => {
  let canvas;
  let context;
  let cache = Object.create(null);
  let cacheSize = 0;
  const maxCacheSize = 2048;

  return value => {
    if (typeof value === "number") {
      return value;
    }

    if (typeof value === "string") {
      if (value in cache) {
        return cache[value];
      }

      if (!canvas) {
        canvas = document.createElement("canvas");
        context = canvas.getContext("2d");
      }

      canvas.width = 1;
      canvas.height = 1;
      context.fillStyle = value;
      context.fillRect(0, 0, 1, 1);

      const data = context.getImageData(0, 0, 1, 1).data;
      const result = rgbToNumber(data[0], data[1], data[2]);

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

function color(from, to, progress) {
  from = colorValueToNumber(from);
  to = colorValueToNumber(to);

  const fromRed = from >> 16 & 255;
  const fromGreen = from >> 8 & 255;
  const fromBlue = from & 255;
  const toRed = to >> 16 & 255;
  const toGreen = to >> 8 & 255;
  const toBlue = to & 255;

  return rgbToNumber(
    Math.round(number(fromRed, toRed, progress)),
    Math.round(number(fromGreen, toGreen, progress)),
    Math.round(number(fromBlue, toBlue, progress))
  );
}

class AbstractTween {
  gotoElapsedTime(elapsedTime) {
  }

  gotoEnd() {
  }

  isDoneAtElapsedTime(elapsedTime) {
  }
}

const interpolators = {
  number,
  color
};

const maxSafeInteger = 0x1fffffffffffff;

class Tween extends AbstractTween {
  constructor(
    from,
    to,
    startTime,
    duration = 750,
    delay = 0,
    easing = linear,
    iterations = 1,
    direction = "forward",
    interpolation = "number"
  ) {
    super();

    this.from = from;
    this.to = to;
    this.startTime = startTime;
    this.duration = duration;
    this.delay = delay;
    this.easing = easing;
    this.iterations = iterations;
    this.direction = direction;
    this.interpolation = typeof interpolation === "function"
      ? interpolation
      : interpolators[interpolation] || number;

    this.value = from;
    this.elapsedTime = 0;
  }

  gotoElapsedTime(elapsedTime) {
    this.elapsedTime = elapsedTime;

    const localTime = elapsedTime - this.startTime - this.delay;
    if (localTime <= 0) {
      this.value = this.interpolation(
        this.from,
        this.to,
        this._isReversedIteration(0) ? 1 : 0
      );
      return this.value;
    }

    if (this.duration <= 0) {
      this.value = this._finalValue();
      return this.value;
    }

    const finiteIterations = Number.isFinite(this.iterations);
    const totalDuration = this.duration * this.iterations;

    if (finiteIterations && localTime >= totalDuration) {
      this.value = this._finalValue();
      return this.value;
    }

    const iteration = Math.floor(localTime / this.duration);
    let progress = (localTime % this.duration) / this.duration;

    if (this._isReversedIteration(iteration)) {
      progress = 1 - progress;
    }

    this.value = this.interpolation(
      this.from,
      this.to,
      this.easing(progress)
    );
    return this.value;
  }

  gotoEnd() {
    return this.gotoElapsedTime(maxSafeInteger);
  }

  isDoneAtElapsedTime(elapsedTime) {
    if (!Number.isFinite(this.iterations)) {
      return false;
    }

    return elapsedTime >=
      this.startTime + this.delay + this.duration * this.iterations;
  }

  _isReversedIteration(iteration) {
    switch (this.direction) {
      case "reverse":
        return true;
      case "alternate":
        return iteration % 2 === 1;
      case "alternate-reverse":
        return iteration % 2 === 0;
      default:
        return false;
    }
  }

  _finalValue() {
    const lastIteration = Math.max(0, Math.ceil(this.iterations) - 1);
    const progress = this._isReversedIteration(lastIteration) ? 0 : 1;
    return this.interpolation(this.from, this.to, this.easing(progress));
  }
}

var Tween_default = Tween;
