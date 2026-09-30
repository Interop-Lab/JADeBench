"use strict";

// Easing functions used by Tween when an easing is supplied by name.
const makeInOut = (easeIn, easeOut) => (t) =>
  t < 0.5 ? easeIn(t * 2) * 0.5 : easeOut(t * 2 - 1) * 0.5 + 0.5;
const makeExpIn = (power) => (t) => Math.pow(t, power);
const makeExpOut = (power) => (t) => 1 - Math.pow(1 - t, power);
const makeExpInOut = (power) => (t) =>
  t < 0.5
    ? Math.pow(t * 2, power) * 0.5
    : (1 - Math.pow(1 - (t * 2 - 1), power)) * 0.5 + 0.5;

const linear = (t) => t;
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

const easeInSine = (t) => 1 - Math.cos(t * Math.PI / 2);
const easeOutSine = (t) => Math.sin(t * Math.PI / 2);
const easeInOutSine = (t) => -(Math.cos(Math.PI * t) - 1) / 2;

const easeInExpo = (t) => t === 0 ? 0 : Math.pow(2, 10 * (t - 1));
const easeOutExpo = (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
const easeInOutExpo = (t) => {
  if (t === 0 || t === 1) return t;
  return t < 0.5
    ? Math.pow(2, 10 * (t * 2 - 1)) / 2
    : (2 - Math.pow(2, -10 * (t * 2 - 1))) / 2;
};

const easeInCirc = (t) => 1 - Math.sqrt(1 - t * t);
const easeOutCirc = (t) => Math.sqrt(1 - Math.pow(t - 1, 2));
const easeInOutCirc = makeInOut(easeInCirc, easeOutCirc);

const easeOutElastic = (t) => {
  if (t === 0 || t === 1) return t;
  return Math.pow(2, -10 * t) *
    Math.sin((t - 0.075) * (Math.PI * 2) / 0.3) + 1;
};
const easeInElastic = (t) =>
  t === 0 || t === 1 ? t : 1 - easeOutElastic(1 - t);
const easeInOutElastic = makeInOut(easeInElastic, easeOutElastic);

const easeInBack = (t) => t * t * (2.70158 * t - 1.70158);
const easeOutBack = (t) => {
  t -= 1;
  return t * t * (2.70158 * t + 1.70158) + 1;
};
const easeInOutBack = (t) => {
  const overshoot = 1.70158 * 1.525;
  t *= 2;
  return t < 1
    ? 0.5 * (t * t * ((overshoot + 1) * t - overshoot))
    : 0.5 * ((t -= 2) * t * ((overshoot + 1) * t + overshoot) + 2);
};

const easeOutBounce = (t) => {
  if (t < 1 / 2.75) return 7.5625 * t * t;
  if (t < 2 / 2.75) return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
  if (t < 2.5 / 2.75) return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
  return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
};
const easeInBounce = (t) => 1 - easeOutBounce(1 - t);
const easeInOutBounce = makeInOut(easeInBounce, easeOutBounce);

const Easings = {
  easeInBack, easeInBounce, easeInCirc, easeInCubic, easeInElastic, easeInExpo,
  easeInOutBack, easeInOutBounce, easeInOutCirc, easeInOutCubic,
  easeInOutElastic, easeInOutExpo, easeInOutQuad, easeInOutQuart,
  easeInOutQuint, easeInOutSine, easeInQuad, easeInQuart, easeInQuint,
  easeInSine, easeOutBack, easeOutBounce, easeOutCirc, easeOutCubic,
  easeOutElastic, easeOutExpo, easeOutQuad, easeOutQuart, easeOutQuint,
  easeOutSine, linear,
};

function number(from, to, progress) {
  return from + (to - from) * progress;
}

function rgbToNumber(red, green, blue) {
  return (red << 16) ^ (green << 8) ^ blue;
}

// CSS color strings are resolved with a one-pixel canvas, matching the source.
const colorValueToNumber = (() => {
  let canvas;
  let context;
  let cache = Object.create(null);
  let cacheSize = 0;
  const MAX_CACHE_SIZE = 1024;

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
      const result = rgbToNumber(pixel[0], pixel[1], pixel[2]);
      if (cacheSize > MAX_CACHE_SIZE) {
        cache = Object.create(null);
        cacheSize = 0;
      }
      cache[value] = result;
      cacheSize++;
      return result;
    }
    if (value && value.toNumber) return value.toNumber();
    return 0;
  };
})();

function color(from, to, progress) {
  from = colorValueToNumber(from);
  to = colorValueToNumber(to);
  return rgbToNumber(
    number((from >> 16) & 255, (to >> 16) & 255, progress),
    number((from >> 8) & 255, (to >> 8) & 255, progress),
    number(from & 255, to & 255, progress),
  );
}

const Interpolators = { color, number };

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
    this.easing = typeof easing === "string" ? Easings[easing] || linear : easing;
    this.iterations = iterations;
    this.direction = direction;
    this.interpolate = typeof interpolate === "function"
      ? interpolate
      : Interpolators[interpolate] || number;
    this.totalElapsed = iterations < Number.MAX_SAFE_INTEGER
      ? delay + duration * iterations
      : Number.MAX_SAFE_INTEGER;
  }

  gotoElapsedTime(elapsedTime) {
    const delay = this.delay;
    if (elapsedTime < delay) return;
    elapsedTime = Math.min(elapsedTime, this.totalElapsed) - delay;
    let progress = Math.max(elapsedTime, 0) % this.duration / this.duration;
    if (progress === 0 && elapsedTime > 0) progress = 1;
    progress = this.easing(progress);
    if (
      this.direction === "reverse" ||
      (this.direction === "alternate" && Math.ceil(elapsedTime / this.duration) % 2 === 0)
    ) {
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

Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Tween;
