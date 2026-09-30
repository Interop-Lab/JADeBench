"use strict";

const { PI, pow, sqrt } = Math;
const HALF_PI = PI / 2;
const TWO_PI = PI * 2;

function makeInOut(easeIn, easeOut = easeIn) {
  return progress => progress < 0.5
    ? easeIn(progress * 2) / 2
    : easeOut(progress * 2 - 1) / 2 + 0.5;
}

function makeExpIn(power) {
  return progress => pow(progress, power);
}

function makeExpOut(power) {
  return progress => 1 - pow(1 - progress, power);
}

function makeExpInOut(power) {
  return makeInOut(makeExpIn(power), makeExpOut(power));
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

const EASE_IN_ELASTIC_PERIOD = TWO_PI / 3;
const easeInElastic = progress => {
  if (progress === 0 || progress === 1) return progress;
  return -pow(2, 10 * progress - 10)
    * Math.sin((progress * 10 - 10.75) * EASE_IN_ELASTIC_PERIOD);
};
const easeOutElastic = progress => {
  if (progress === 0 || progress === 1) return progress;
  return pow(2, -10 * progress)
    * Math.sin((progress * 10 - 0.75) * EASE_IN_ELASTIC_PERIOD) + 1;
};
const easeInOutElastic = makeInOut(easeInElastic, easeOutElastic);

const BACK_OVERSHOOT = 1.70158;
const BACK_OVERSHOOT_PLUS_ONE = BACK_OVERSHOOT + 1;
const easeInBack = progress => BACK_OVERSHOOT_PLUS_ONE * progress * progress * progress
  - BACK_OVERSHOOT * progress * progress;
const easeOutBack = progress => 1
  + BACK_OVERSHOOT_PLUS_ONE * pow(progress - 1, 3)
  + BACK_OVERSHOOT * pow(progress - 1, 2);
const easeInOutBack = progress => {
  const scaledOvershoot = BACK_OVERSHOOT * 1.525;
  return progress < 0.5
    ? pow(2 * progress, 2) * ((scaledOvershoot + 1) * 2 * progress - scaledOvershoot) / 2
    : (pow(2 * progress - 2, 2)
      * ((scaledOvershoot + 1) * (progress * 2 - 2) + scaledOvershoot) + 2) / 2;
};

const BOUNCE_COEFFICIENT = 7.5625;
const BOUNCE_DIVISOR = 2.75;
const easeOutBounce = progress => {
  if (progress < 1 / BOUNCE_DIVISOR) {
    return BOUNCE_COEFFICIENT * progress * progress;
  }
  if (progress < 2 / BOUNCE_DIVISOR) {
    const shifted = progress - 1.5 / BOUNCE_DIVISOR;
    return BOUNCE_COEFFICIENT * shifted * shifted + 0.75;
  }
  if (progress < 2.5 / BOUNCE_DIVISOR) {
    const shifted = progress - 2.25 / BOUNCE_DIVISOR;
    return BOUNCE_COEFFICIENT * shifted * shifted + 0.9375;
  }
  const shifted = progress - 2.625 / BOUNCE_DIVISOR;
  return BOUNCE_COEFFICIENT * shifted * shifted + 0.984375;
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
  return red << 16 | green << 8 | blue;
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
  const fromColor = colorValueToNumber(fromValue);
  const toColor = colorValueToNumber(toValue);
  const red = (fromColor >> 16) + ((toColor >> 16) - (fromColor >> 16)) * progress;
  const green = (fromColor >> 8 & 0xff)
    + ((toColor >> 8 & 0xff) - (fromColor >> 8 & 0xff)) * progress;
  const blue = (fromColor & 0xff) + ((toColor & 0xff) - (fromColor & 0xff)) * progress;
  return red << 16 | green << 8 | blue;
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
const tweenLinear = progress => progress;

class Tween extends AbstractTween {
  constructor(
    callback,
    fromValue,
    toValue,
    duration = 750,
    delay = 0,
    easing = tweenLinear,
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
    this.easing = easing;
    this.iterations = iterations;
    this.direction = direction;
    this.interpolate = typeof interpolation === "function"
      ? interpolation
      : Interpolators[interpolation];
    this.totalElapsed = iterations === Infinity
      ? maxSafeInteger
      : Math.ceil(duration * iterations) + delay;
  }

  gotoElapsedTime(elapsedTime) {
    if (elapsedTime < this.delay) return;

    const activeDuration = this.duration * this.iterations;
    const elapsedInTween = Math.min(elapsedTime - this.delay, activeDuration);
    const iteration = Math.ceil(elapsedInTween / this.duration);
    let progress = elapsedInTween % this.duration / this.duration;
    if (elapsedInTween > 0 && progress === 0) progress = 1;

    let fromValue = this.fromValue;
    let toValue = this.toValue;
    if (
      this.direction === "reverse"
      || this.direction === "alternate" && iteration % 2 === 0
    ) {
      [fromValue, toValue] = [toValue, fromValue];
    }

    const easedProgress = this.easing(progress);
    this.callback(this.interpolate(fromValue, toValue, easedProgress));
  }

  gotoEnd() {
    this.gotoElapsedTime(this.totalElapsed);
  }

  isDoneAtElapsedTime(elapsedTime) {
    return elapsedTime > this.totalElapsed;
  }
}

function endTimeComparator(left, right) {
  return left.totalElapsed - right.totalElapsed;
}

class MultiTween extends Tween {
  constructor(tweens, duration, delay, easing, iterations, direction) {
    if (typeof duration !== "number") {
      duration = tweens.reduce(
        (maximum, tween) => Math.max(maximum, tween.totalElapsed),
        0,
      );
    }
    if (duration === Infinity) duration = Number.MAX_VALUE;

    super(null, 0, duration, duration, delay, easing, iterations, direction);
    this.tweens = tweens.sort(endTimeComparator);
    this.callback = this._syncTweens.bind(this);
  }

  _syncTweens(elapsedTime) {
    for (const tween of this.tweens) {
      tween.gotoElapsedTime(elapsedTime);
    }
  }
}

const exportsObject = {};
Object.defineProperty(exportsObject, "__esModule", { value: true });
Object.defineProperty(exportsObject, "default", {
  enumerable: true,
  get: () => MultiTween,
});
module.exports = exportsObject;
