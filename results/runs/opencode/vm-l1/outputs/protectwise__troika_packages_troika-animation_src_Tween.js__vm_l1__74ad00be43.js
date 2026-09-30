"use strict";

const { PI, pow, sqrt } = Math;
const HALF_PI = PI / 2;
const TWO_PI = PI * 2;

function makeInOut(easeIn, easeOut) {
  return (amount) =>
    amount < 0.5
      ? easeIn(amount * 2) / 2
      : easeOut(amount * 2 - 1) / 2 + 0.5;
}

function makeExpIn(exponent) {
  return (amount) => pow(amount, exponent);
}

function makeExpOut(exponent) {
  return (amount) => 1 - pow(1 - amount, exponent);
}

function makeExpInOut(exponent) {
  return makeInOut(makeExpIn(exponent), makeExpOut(exponent));
}

const linear = (amount) => amount;
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
const easeInSine = (amount) => 1 - Math.cos(amount * HALF_PI);
const easeOutSine = (amount) => Math.sin(amount * HALF_PI);
const easeInOutSine = (amount) => -(Math.cos(PI * amount) - 1) / 2;
const easeInExpo = (amount) => (amount === 0 ? 0 : pow(2, 10 * amount - 10));
const easeOutExpo = (amount) => (amount === 1 ? 1 : 1 - pow(2, -10 * amount));
const easeInOutExpo = makeInOut(easeInExpo, easeOutExpo);
const easeInCirc = (amount) => 1 - sqrt(1 - amount * amount);
const easeOutCirc = (amount) => sqrt(1 - pow(amount - 1, 2));
const easeInOutCirc = makeInOut(easeInCirc, easeOutCirc);

const ELASTIC_PERIOD = TWO_PI / 3;
const easeInElastic = (amount) => {
  if (amount === 0 || amount === 1) return amount;
  return -pow(2, 10 * amount - 10) * Math.sin((amount * 10 - 10.75) * ELASTIC_PERIOD);
};
const easeOutElastic = (amount) => {
  if (amount === 0 || amount === 1) return amount;
  return pow(2, -10 * amount) * Math.sin((amount * 10 - 0.75) * ELASTIC_PERIOD) + 1;
};
const easeInOutElastic = makeInOut(easeInElastic, easeOutElastic);

const BACK_OVERSHOOT = 1.70158;
const easeInBack = (amount) =>
  (BACK_OVERSHOOT + 1) * amount * amount * amount -
  BACK_OVERSHOOT * amount * amount;
const easeOutBack = (amount) => {
  const shifted = amount - 1;
  return 1 + (BACK_OVERSHOOT + 1) * shifted ** 3 + BACK_OVERSHOOT * shifted ** 2;
};
const easeInOutBack = (amount) => {
  const overshoot = BACK_OVERSHOOT * 1.525;
  if (amount < 0.5) {
    const doubled = amount * 2;
    return (doubled * doubled * ((overshoot + 1) * doubled - overshoot)) / 2;
  }
  const shifted = amount * 2 - 2;
  return (shifted * shifted * ((overshoot + 1) * shifted + overshoot) + 2) / 2;
};

const easeOutBounce = (amount) => {
  const scale = 7.5625;
  const section = 2.75;
  if (amount < 1 / section) return scale * amount * amount;
  if (amount < 2 / section) {
    amount -= 1.5 / section;
    return scale * amount * amount + 0.75;
  }
  if (amount < 2.5 / section) {
    amount -= 2.25 / section;
    return scale * amount * amount + 0.9375;
  }
  amount -= 2.625 / section;
  return scale * amount * amount + 0.984375;
};
const easeInBounce = (amount) => 1 - easeOutBounce(1 - amount);
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
  easeInOutBounce,
};

function number(from, to, amount) {
  return from + (to - from) * amount;
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
      const [red, green, blue] = context.getImageData(0, 0, 1, 1).data;
      const result = rgbToNumber(red, green, blue);
      if (cacheSize > maximumCacheSize) {
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

function color(from, to, amount) {
  from = colorValueToNumber(from);
  to = colorValueToNumber(to);
  return rgbToNumber(
    number((from >> 16) & 255, (to >> 16) & 255, amount),
    number((from >> 8) & 255, (to >> 8) & 255, amount),
    number(from & 255, to & 255, amount),
  );
}

const Interpolators = { color, number };

class AbstractTween {
  gotoElapsedTime(_elapsedTime) {}
  gotoEnd() {}
  isDoneAtElapsedTime(_elapsedTime) {}
}

const maxSafeInteger = 0x1fffffffffffff;

class Tween extends AbstractTween {
  constructor(
    object,
    property,
    endValue,
    duration = 750,
    delay = 0,
    easing = linear,
    repeat = 1,
    direction = "forward",
    interpolator = "number",
  ) {
    super();
    this.object = object;
    this.property = property;
    this.startValue = object[property];
    this.endValue = endValue;
    this.duration = duration;
    this.delay = delay;
    this.easing = easing;
    this.repeat = repeat === Infinity ? maxSafeInteger : repeat;
    this.direction = direction;
    this.interpolate =
      typeof interpolator === "function" ? interpolator : Interpolators[interpolator];
  }

  gotoElapsedTime(elapsedTime) {
    const activeTime = Math.max(0, elapsedTime - this.delay);
    const iteration = Math.min(Math.floor(activeTime / this.duration), this.repeat - 1);
    let amount = this.duration === 0 ? 1 : (activeTime % this.duration) / this.duration;

    if (activeTime >= this.duration * this.repeat) amount = 1;
    const backwards =
      this.direction === "backward" ||
      this.direction === "reverse" ||
      (this.direction === "alternate" && iteration % 2 === 1);
    if (backwards) amount = 1 - amount;

    this.object[this.property] = this.interpolate(
      this.startValue,
      this.endValue,
      this.easing(amount),
    );
    return this.object[this.property];
  }

  gotoEnd() {
    return this.gotoElapsedTime(this.delay + this.duration * this.repeat);
  }

  isDoneAtElapsedTime(elapsedTime) {
    return elapsedTime >= this.delay + this.duration * this.repeat;
  }
}

Object.defineProperty(exports, "__esModule", { value: true });
Object.defineProperty(exports, "default", { enumerable: true, get: () => Tween });
