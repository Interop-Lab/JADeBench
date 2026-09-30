"use strict";

const {pow, PI, sqrt} = Math;

const HALF_PI = PI / 2;
const TWO_PI = PI * 2;
const MAX_SAFE_INTEGER = 9007199254740991;

function makeInOut(easeIn, easeOut) {
  return value =>
    value < 0.5
      ? easeIn(value * 2) * 0.5
      : easeOut(value * 2 - 1) * 0.5 + 0.5;
}

function makeExpIn(exponent) {
  return value => pow(value, exponent);
}

function makeExpOut(exponent) {
  return value => 1 - pow(1 - value, exponent);
}

function makeExpInOut(exponent) {
  return value =>
    value < 0.5
      ? pow(value * 2, exponent) * 0.5
      : (1 - pow(2 - value * 2, exponent)) * 0.5 + 0.5;
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
const easeInOutSine = value => -0.5 * (Math.cos(PI * value) - 1);

const easeInExpo = value => value === 0 ? 0 : pow(2, 10 * (value - 1));
const easeOutExpo = value => value === 1 ? 1 : 1 - pow(2, -10 * value);
const easeInOutExpo = value => {
  if (value === 0 || value === 1) {
    return value;
  }

  return value < 0.5
    ? pow(2, 10 * (value * 2 - 1)) * 0.5
    : (2 - pow(2, -10 * (value * 2 - 1))) * 0.5;
};

const easeInCirc = value => 1 - sqrt(1 - value * value);
const easeOutCirc = value => sqrt(1 - pow(value - 1, 2));
const easeInOutCirc = makeInOut(easeInCirc, easeOutCirc);

const easeOutElastic = value => {
  if (value === 0 || value === 1) {
    return value;
  }

  return (
    Math.pow(2, -10 * value) *
      Math.sin((value - 0.075) * TWO_PI / 0.3) +
    1
  );
};

const easeInElastic = value => {
  if (value === 0 || value === 1) {
    return value;
  }

  return 1 - easeOutElastic(1 - value);
};

const easeInOutElastic = makeInOut(easeInElastic, easeOutElastic);

const easeInBack = value =>
  value * value * (2.70158 * value - 1.70158);

const easeOutBack = value => {
  value -= 1;
  return value * value * (2.70158 * value + 1.70158) + 1;
};

const easeInOutBack = value => {
  const overshoot = 1.70158 * 1.525;
  value *= 2;

  if (value < 1) {
    return 0.5 * (
      value * value * ((overshoot + 1) * value - overshoot)
    );
  }

  value -= 2;
  return 0.5 * (
    value * value * ((overshoot + 1) * value + overshoot) + 2
  );
};

const easeOutBounce = value => {
  if (value < 1 / 2.75) {
    return 7.5625 * value * value;
  }

  if (value < 2 / 2.75) {
    value -= 1.5 / 2.75;
    return 7.5625 * value * value + 0.75;
  }

  if (value < 2.5 / 2.75) {
    value -= 2.25 / 2.75;
    return 7.5625 * value * value + 0.9375;
  }

  value -= 2.625 / 2.75;
  return 7.5625 * value * value + 0.984375;
};

const easeInBounce = value => 1 - easeOutBounce(1 - value);
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
  linear
};

function number(from, to, progress) {
  return from + (to - from) * progress;
}

function rgbToNumber(red, green, blue) {
  return (red << 16) ^ (green << 8) ^ blue;
}

const colorValueToNumber = (() => {
  let canvas;
  let context;
  let cache = Object.create(null);
  let cacheSize = 0;
  const maxCacheSize = 3072;

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

      canvas.width = canvas.height = 1;
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

    if (value && value.isColor) {
      return value.getHex();
    }

    return 0;
  };
})();

function color(from, to, progress) {
  from = colorValueToNumber(from);
  to = colorValueToNumber(to);

  return rgbToNumber(
    number((from >> 16) & 255, (to >> 16) & 255, progress),
    number((from >> 8) & 255, (to >> 8) & 255, progress),
    number(from & 255, to & 255, progress)
  );
}

const Interpolators = {
  color,
  number
};

class AbstractTween {
  update(time) {}

  finish() {}

  isFinished(time) {}
}

class Tween extends AbstractTween {
  constructor(
    callback,
    startValue,
    endValue,
    duration = 750,
    startTime = 0,
    easing = linear,
    iterations = 1,
    direction = "normal",
    interpolation = "number"
  ) {
    super();

    this.callback = callback;
    this.startValue = startValue;
    this.endValue = endValue;
    this.duration = duration;
    this.startTime = startTime;
    this.easing =
      typeof easing === "string"
        ? Easings[easing] || linear
        : easing;
    this.iterations = iterations;
    this.direction = direction;
    this.interpolator =
      typeof interpolation === "function"
        ? interpolation
        : Interpolators[interpolation] || number;

    this.endTime =
      this.iterations < MAX_SAFE_INTEGER
        ? this.startTime + this.duration * this.iterations
        : MAX_SAFE_INTEGER;
  }

  update(time) {
    const duration = this.duration;
    const startTime = this.startTime;

    if (time >= startTime) {
      const elapsed = Math.min(time, this.endTime) - startTime;
      let progress = (elapsed % duration) / duration;

      if (progress === 0 && elapsed !== 0) {
        progress = 1;
      }

      progress = this.easing(progress);

      if (
        this.direction === "reverse" ||
        (
          this.direction === "alternate" &&
          Math.floor(elapsed / duration) % 2 === 1
        )
      ) {
        progress = 1 - progress;
      }

      this.callback(
        this.interpolator(
          this.startValue,
          this.endValue,
          progress
        )
      );
    }
  }

  finish() {
    this.update(this.endTime);
  }

  isFinished(time) {
    return time > this.endTime;
  }
}

Object.defineProperty(exports, "__esModule", {
  value: true
});

Object.defineProperty(exports, "default", {
  enumerable: true,
  get: () => Tween
});

module.exports = exports;
