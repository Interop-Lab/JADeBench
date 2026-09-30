"use strict";

const maxSafeInteger = 0x1fffffffffffff;

const linear = progress => progress;

const makeExpIn = exponent => progress => Math.pow(progress, exponent);
const makeExpOut = exponent => progress => 1 - Math.pow(1 - progress, exponent);
const makeInOut = (easeIn, easeOut) => progress =>
  progress < 0.5 ? easeIn(progress * 2) / 2 : easeOut(progress * 2 - 1) / 2 + 0.5;
const makeExpInOut = exponent => makeInOut(makeExpIn(exponent), makeExpOut(exponent));

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

const HALF_PI = Math.PI / 2;
const TWO_PI = Math.PI * 2;
const easeInSine = progress => 1 - Math.cos(progress * HALF_PI);
const easeOutSine = progress => Math.sin(progress * HALF_PI);
const easeInOutSine = progress => -(Math.cos(Math.PI * progress) - 1) / 2;

const easeInExpo = progress => progress === 0 ? 0 : Math.pow(2, 10 * progress - 10);
const easeOutExpo = progress => progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
const easeInOutExpo = progress => {
  if (progress === 0 || progress === 1) return progress;
  return progress < 0.5
    ? Math.pow(2, 20 * progress - 10) / 2
    : (2 - Math.pow(2, -20 * progress + 10)) / 2;
};

const easeInCirc = progress => 1 - Math.sqrt(1 - progress ** 2);
const easeOutCirc = progress => Math.sqrt(1 - (progress - 1) ** 2);
const easeInOutCirc = progress => progress < 0.5
  ? (1 - Math.sqrt(1 - (2 * progress) ** 2)) / 2
  : (Math.sqrt(1 - (-2 * progress + 2) ** 2) + 1) / 2;

const easeInElastic = progress => {
  if (progress === 0 || progress === 1) return progress;
  return -Math.pow(2, 10 * progress - 10) * Math.sin((progress * 10 - 10.75) * TWO_PI / 3);
};
const easeOutElastic = progress => {
  if (progress === 0 || progress === 1) return progress;
  return Math.pow(2, -10 * progress) * Math.sin((progress * 10 - 0.75) * TWO_PI / 3) + 1;
};
const easeInOutElastic = makeInOut(easeInElastic, easeOutElastic);

const BACK_OVERSHOOT = 1.70158;
const easeInBack = progress => progress * progress * ((BACK_OVERSHOOT + 1) * progress - BACK_OVERSHOOT);
const easeOutBack = progress => {
  progress--;
  return progress * progress * ((BACK_OVERSHOOT + 1) * progress + BACK_OVERSHOOT) + 1;
};
const easeInOutBack = progress => {
  const overshoot = BACK_OVERSHOOT * 1.525;
  return progress < 0.5
    ? (2 * progress) ** 2 * ((overshoot + 1) * 2 * progress - overshoot) / 2
    : ((2 * progress - 2) ** 2 * ((overshoot + 1) * (progress * 2 - 2) + overshoot) + 2) / 2;
};

const easeOutBounce = progress => {
  const scale = 7.5625;
  const segment = 2.75;
  if (progress < 1 / segment) return scale * progress * progress;
  if (progress < 2 / segment) {
    progress -= 1.5 / segment;
    return scale * progress * progress + 0.75;
  }
  if (progress < 2.5 / segment) {
    progress -= 2.25 / segment;
    return scale * progress * progress + 0.9375;
  }
  progress -= 2.625 / segment;
  return scale * progress * progress + 0.984375;
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

const number = (fromValue, toValue, progress) => fromValue + (toValue - fromValue) * progress;
const rgbToNumber = (red, green, blue) => red << 16 ^ green << 8 ^ blue;

let colorCanvas;
let colorContext;
let colorCache = Object.create(null);
let colorCacheSize = 0;
const COLOR_CACHE_LIMIT = 0x800;

function colorValueToNumber(value) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    if (value in colorCache) return colorCache[value];
    if (!colorCanvas) {
      colorCanvas = document.createElement("canvas");
      colorContext = colorCanvas.getContext("2d");
    }
    colorCanvas.width = colorCanvas.height = 1;
    colorContext.fillStyle = value;
    colorContext.fillRect(0, 0, 1, 1);
    const pixels = colorContext.getImageData(0, 0, 1, 1).data;
    const result = rgbToNumber(pixels[0], pixels[1], pixels[2]);
    if (colorCacheSize > COLOR_CACHE_LIMIT) {
      colorCache = Object.create(null);
      colorCacheSize = 0;
    }
    colorCache[value] = result;
    colorCacheSize++;
    return result;
  }
  return value && value.isColor ? value.getHex() : 0;
}

function color(fromValue, toValue, progress) {
  fromValue = colorValueToNumber(fromValue);
  toValue = colorValueToNumber(toValue);
  return rgbToNumber(
    number(fromValue >> 16 & 0xff, toValue >> 16 & 0xff, progress),
    number(fromValue >> 8 & 0xff, toValue >> 8 & 0xff, progress),
    number(fromValue & 0xff, toValue & 0xff, progress),
  );
}

const Interpolators = { color, number };
const linear2 = progress => progress;

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
    easing = linear2,
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
    this.easing = typeof easing === "string" ? Easings[easing] || linear2 : easing;
    this.iterations = iterations;
    this.direction = direction;
    this.interpolate = typeof interpolate === "function"
      ? interpolate
      : Interpolators[interpolate] || number;
    this.totalElapsed = iterations === Infinity
      ? maxSafeInteger
      : delay + duration * iterations;
  }

  gotoElapsedTime(elapsedTime) {
    if (!(elapsedTime >= this.delay)) return;

    const elapsed = Math.min(elapsedTime - this.delay, this.duration * this.iterations);
    const iteration = Math.ceil(elapsed / this.duration);
    let iterationElapsed = elapsed % this.duration;
    if (iterationElapsed === 0 && elapsed !== 0) iterationElapsed = this.duration;
    let progress = this.easing(iterationElapsed / this.duration);

    if (this.direction === "reverse" || this.direction === "alternate" && iteration % 2 === 0) {
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

function endTimeComparator(left, right) {
  return left.totalElapsed - right.totalElapsed;
}

class MultiTween extends Tween {
  constructor(tweens, totalElapsed, delay, easing, iterations, direction) {
    if (typeof totalElapsed !== "number") {
      totalElapsed = tweens.reduce(
        (largestElapsed, tween) => Math.max(largestElapsed, tween.totalElapsed),
        0,
      );
    }
    if (totalElapsed === Infinity) totalElapsed = Number.MAX_VALUE;
    super(null, 0, totalElapsed, totalElapsed, delay, easing, iterations, direction);
    this.callback = this._syncTweens;
    this.tweens = tweens.sort(endTimeComparator);
  }

  _syncTweens(elapsedTime) {
    for (const tween of this.tweens) tween.gotoElapsedTime(elapsedTime);
  }
}

Object.defineProperty(exports, "__esModule", { value: true });
Object.defineProperty(exports, "default", {
  enumerable: true,
  get: () => MultiTween,
});
