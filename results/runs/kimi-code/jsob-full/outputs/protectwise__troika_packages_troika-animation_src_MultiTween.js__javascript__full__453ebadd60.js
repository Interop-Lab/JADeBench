"use strict";

Object.defineProperty(exports, "__esModule", { value: true });

const { PI, pow, sqrt } = Math;
const HALF_PI = PI / 2;
const TWO_PI = PI * 2;

const makeInOut = (easeIn, easeOut) => value =>
  value < 0.5 ? easeIn(value * 2) / 2 : easeOut(value * 2 - 1) / 2 + 0.5;
const makePowerIn = power => value => pow(value, power);
const makePowerOut = power => value => 1 - pow(1 - value, power);
const makePowerInOut = power => makeInOut(makePowerIn(power), makePowerOut(power));

const linear = value => value;
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
const easeInSine = value => 1 - Math.cos(value * HALF_PI);
const easeOutSine = value => Math.sin(value * HALF_PI);
const easeInOutSine = value => -(Math.cos(PI * value) - 1) / 2;
const easeInExpo = value => value === 0 ? 0 : pow(2, 10 * (value - 1));
const easeOutExpo = value => value === 1 ? 1 : 1 - pow(2, -10 * value);
const easeInOutExpo = value => {
  if (value === 0 || value === 1) return value;
  return value < 0.5
    ? pow(2, 10 * (value * 2 - 1)) / 2
    : (2 - pow(2, -10 * (value * 2 - 1))) / 2;
};
const easeInCirc = value => 1 - sqrt(1 - value * value);
const easeOutCirc = value => sqrt(1 - pow(value - 1, 2));
const easeInOutCirc = makeInOut(easeInCirc, easeOutCirc);
const easeOutElastic = value =>
  value === 0 || value === 1
    ? value
    : pow(2, -10 * value) * Math.sin((value - 0.075) * TWO_PI / 0.3) + 1;
const easeInElastic = value =>
  value === 0 || value === 1 ? value : 1 - easeOutElastic(1 - value);
const easeInOutElastic = makeInOut(easeInElastic, easeOutElastic);
const BACK_OVERSHOOT = 1.70158;
const easeInBack = value => value * value * ((BACK_OVERSHOOT + 1) * value - BACK_OVERSHOOT);
const easeOutBack = value => {
  value -= 1;
  return value * value * ((BACK_OVERSHOOT + 1) * value + BACK_OVERSHOOT) + 1;
};
const easeInOutBack = value => {
  const overshoot = BACK_OVERSHOOT * 1.525;
  value *= 2;
  return value < 1
    ? 0.5 * value * value * ((overshoot + 1) * value - overshoot)
    : 0.5 * ((value -= 2) * value * ((overshoot + 1) * value + overshoot) + 2);
};
const easeOutBounce = value => {
  if (value < 1 / 2.75) return 7.5625 * value * value;
  if (value < 2 / 2.75) return 7.5625 * (value -= 1.5 / 2.75) * value + 0.75;
  if (value < 2.5 / 2.75) return 7.5625 * (value -= 2.25 / 2.75) * value + 0.9375;
  return 7.5625 * (value -= 2.625 / 2.75) * value + 0.984375;
};
const easeInBounce = value => 1 - easeOutBounce(1 - value);
const easeInOutBounce = makeInOut(easeInBounce, easeOutBounce);

const easings = {
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
  easeInBounce, easeOutBounce, easeInOutBounce
};

function interpolateNumber(fromValue, toValue, progress) {
  return fromValue + (toValue - fromValue) * progress;
}

function rgbToNumber(red, green, blue) {
  return red << 16 ^ green << 8 ^ blue;
}

const colorCache = Object.create(null);
let colorCacheSize = 0;
const COLOR_CACHE_LIMIT = 2048;
let colorCanvas;
let colorContext;

function colorValueToNumber(value) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    if (value in colorCache) return colorCache[value];
    if (!colorCanvas) {
      colorCanvas = document.createElement("canvas");
      colorContext = colorCanvas.getContext("2d");
      colorCanvas.width = colorCanvas.height = 1;
    }
    colorContext.fillStyle = value;
    colorContext.fillRect(0, 0, 1, 1);
    const pixel = colorContext.getImageData(0, 0, 1, 1).data;
    const result = rgbToNumber(pixel[0], pixel[1], pixel[2]);
    if (colorCacheSize > COLOR_CACHE_LIMIT) {
      for (const key in colorCache) delete colorCache[key];
      colorCacheSize = 0;
    }
    colorCache[value] = result;
    colorCacheSize++;
    return result;
  }
  return value && value.getHex ? value.getHex() : 0;
}

function interpolateColor(fromValue, toValue, progress) {
  const from = colorValueToNumber(fromValue);
  const to = colorValueToNumber(toValue);
  return rgbToNumber(
    interpolateNumber(from >> 16 & 255, to >> 16 & 255, progress),
    interpolateNumber(from >> 8 & 255, to >> 8 & 255, progress),
    interpolateNumber(from & 255, to & 255, progress)
  );
}

const interpolators = {
  number: interpolateNumber,
  color: interpolateColor
};

class AbstractTween {
  gotoElapsedTime(elapsedTime) {}
  gotoEnd() {}
  isDoneAtElapsedTime(elapsedTime) {}
}

const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER;

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
    interpolator = "number"
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
    this.interpolator = typeof interpolator === "function"
      ? interpolator
      : interpolators[interpolator] || interpolateNumber;
    this.totalElapsed = iterations < MAX_SAFE_INTEGER
      ? delay + duration * iterations
      : MAX_SAFE_INTEGER;
  }

  gotoElapsedTime(elapsedTime) {
    if (elapsedTime >= this.delay) {
      elapsedTime = Math.min(elapsedTime, this.totalElapsed) - this.delay;
      let progress = elapsedTime % this.duration / this.duration;
      if (progress === 0 && elapsedTime !== 0) progress = 1;
      progress = this.easing(progress);
      if (
        this.direction === "reverse" ||
        this.direction === "alternate" && Math.floor(elapsedTime / this.duration) % 2
      ) {
        progress = 1 - progress;
      }
      this.callback(this.interpolator(this.fromValue, this.toValue, progress));
    }
  }

  gotoEnd() {
    this.gotoElapsedTime(this.totalElapsed);
  }

  isDoneAtElapsedTime(elapsedTime) {
    return elapsedTime > this.totalElapsed;
  }
}

class MultiTween extends Tween {
  constructor(tweens, totalElapsed, delay, easing, iterations, direction) {
    if (typeof totalElapsed !== "number") {
      totalElapsed = tweens.reduce(
        (latestEnd, tween) => Math.max(latestEnd, tween.totalElapsed),
        0
      );
    }
    if (totalElapsed === Infinity) totalElapsed = Number.MAX_SAFE_INTEGER;

    super(null, 0, totalElapsed, totalElapsed, delay, easing, iterations, direction);

    if (tweens.length === 1) {
      this.callback = tweens[0].gotoElapsedTime.bind(tweens[0]);
    } else {
      tweens.sort(compareEndTimes);
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

function compareEndTimes(first, second) {
  return first.totalElapsed - second.totalElapsed;
}

exports.default = MultiTween;
