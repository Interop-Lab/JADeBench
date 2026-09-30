var __defProp = Object.defineProperty,
  __getOwnPropDesc = Object.getOwnPropertyDescriptor,
  __getOwnPropNames = Object.getOwnPropertyNames,
  __hasOwnProp = Object.prototype.hasOwnProperty,
  __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  },
  __copyProps = (to, from, except, desc) => {
    if (from && (typeof from === "object" || typeof from === "function")) {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, {
            get: () => from[key],
            enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
          });
    }
    return to;
  };

var __toCommonJS = mod =>
  __copyProps(__defProp({}, "__esModule", { value: true }), mod);

var Tween_exports = {};
__export(Tween_exports, { default: () => Tween_default });
module.exports = __toCommonJS(Tween_exports);

var Easings_exports = {};
__export(Easings_exports, {
  easeInBack: () => easeInBack,
  easeInBounce: () => easeInBounce,
  easeInCirc: () => easeInCirc,
  easeInCubic: () => easeInCubic,
  easeInElastic: () => easeInElastic,
  easeInExpo: () => easeInExpo,
  easeInOutBack: () => easeInOutBack,
  easeInOutBounce: () => easeInOutBounce,
  easeInOutCirc: () => easeInOutCirc,
  easeInOutCubic: () => easeInOutCubic,
  easeInOutElastic: () => easeInOutElastic,
  easeInOutExpo: () => easeInOutExpo,
  easeInOutQuad: () => easeInOutQuad,
  easeInOutQuart: () => easeInOutQuart,
  easeInOutQuint: () => easeInOutQuint,
  easeInOutSine: () => easeInOutSine,
  easeInQuad: () => easeInQuad,
  easeInQuart: () => easeInQuart,
  easeInQuint: () => easeInQuint,
  easeInSine: () => easeInSine,
  easeOutBack: () => easeOutBack,
  easeOutBounce: () => easeOutBounce,
  easeOutCirc: () => easeOutCirc,
  easeOutCubic: () => easeOutCubic,
  easeOutElastic: () => easeOutElastic,
  easeOutExpo: () => easeOutExpo,
  easeOutQuad: () => easeOutQuad,
  easeOutQuart: () => easeOutQuart,
  easeOutQuint: () => easeOutQuint,
  easeOutSine: () => easeOutSine,
  linear: () => linear
});

var { pow, PI, sqrt } = Math,
  HALF_PI = PI / 2,
  TWO_PI = PI * 2;

function makeInOut(easeIn, easeOut) {
  return t =>
    t < 0.5
      ? easeIn(t * 2) * 0.5
      : easeOut(t * 2 - 1) * 0.5 + 0.5;
}

function makeExpIn(power) {
  return t => pow(t, power);
}

function makeExpOut(power) {
  return t => 1 - pow(1 - t, power);
}

function makeExpInOut(power) {
  return t =>
    t < 0.5
      ? pow(t * 2, power) * 0.5
      : (1 - pow(2 - t * 2, power)) * 0.5 + 0.5;
}

var linear = t => t;

var easeInQuad = makeExpIn(2),
  easeOutQuad = makeExpOut(2),
  easeInOutQuad = makeExpInOut(2),
  easeInCubic = makeExpIn(3),
  easeOutCubic = makeExpOut(3),
  easeInOutCubic = makeExpInOut(3),
  easeInQuart = makeExpIn(4),
  easeOutQuart = makeExpOut(4),
  easeInOutQuart = makeExpInOut(4),
  easeInQuint = makeExpIn(5),
  easeOutQuint = makeExpOut(5),
  easeInOutQuint = makeExpInOut(5),
  easeInSine = t => 1 - Math.cos(t * HALF_PI),
  easeOutSine = t => Math.sin(t * HALF_PI),
  easeInOutSine = t => -0.5 * (Math.cos(PI * t) - 1),
  easeInExpo = t =>
    t === 0 ? 0 : pow(2, 10 * (t - 1)),
  easeOutExpo = t =>
    t === 1 ? 1 : 1 - pow(2, -10 * t),
  easeInOutExpo = t =>
    t === 0 || t === 1
      ? t
      : t < 0.5
        ? pow(2, 10 * (t * 2 - 1)) * 0.5
        : (1 - pow(2, -10 * (t * 2 - 1))) * 0.5 + 0.5,
  easeInCirc = t => 1 - sqrt(1 - t * t),
  easeOutCirc = t => sqrt(1 - pow(t - 1, 2)),
  easeInOutCirc = makeInOut(easeInCirc, easeOutCirc),
  easeInElastic = t =>
    t === 0 || t === 1
      ? t
      : 1 - easeOutElastic(1 - t),
  easeOutElastic = t =>
    t === 0 || t === 1
      ? t
      : Math.pow(2, -10 * t) *
          Math.sin((t - 0.075) * TWO_PI / 0.3) +
        1,
  easeInOutElastic = makeInOut(easeInElastic, easeOutElastic),
  easeInBack = t =>
    t * t * (2.70158 * t - 1.70158),
  easeOutBack = t =>
    (t -= 1) * t * (2.70158 * t + 1.70158) + 1,
  easeInOutBack = t => {
    const c1 = 1.70158,
      c2 = c1 * 1.525;
    return (t *= 2) < 1
      ? 0.5 * (t * t * ((c2 + 1) * t - c2))
      : 0.5 * ((t -= 2) * t * ((c2 + 1) * t + c2) + 2);
  },
  easeInBounce = t => 1 - easeOutBounce(1 - t),
  easeOutBounce = t =>
    t < 1 / 2.75
      ? 7.5625 * t * t
      : t < 2 / 2.75
        ? 7.5625 * (t -= 1.5 / 2.75) * t + 0.75
        : t < 2.5 / 2.75
          ? 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375
          : 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375,
  easeInOutBounce = makeInOut(easeInBounce, easeOutBounce);

var Interpolators_exports = {};
__export(Interpolators_exports, {
  color: () => color,
  number: () => number
});

function number(from, to, t) {
  return from + (to - from) * t;
}

function color(from, to, t) {
  from = colorValueToNumber(from);
  to = colorValueToNumber(to);
  return rgbToNumber(
    number((from >> 16) & 0xff, (to >> 16) & 0xff, t),
    number((from >> 8) & 0xff, (to >> 8) & 0xff, t),
    number(from & 0xff, to & 0xff, t)
  );
}

var colorValueToNumber = (function () {
  let canvas, context, cache = Object.create(null), cacheSize = 0;
  const MAX_CACHE_SIZE = 200;

  return function (value) {
    if (typeof value === "number") {
      return value;
    } else if (typeof value === "string") {
      if (value in cache) return cache[value];

      if (!canvas) {
        canvas = document.createElement("canvas");
        context = canvas.getContext("2d");
      }

      canvas.width = canvas.height = 1;
      context.fillStyle = value;
      context.fillRect(0, 0, 1, 1);

      const data = context.getImageData(0, 0, 1, 1).data;
      const result = rgbToNumber(data[0], data[1], data[2]);

      if (cacheSize >= MAX_CACHE_SIZE) {
        cache = Object.create(null);
        cacheSize = 0;
      }

      cache[value] = result;
      cacheSize++;
      return result;
    } else if (value && value.toString) {
      return value.toString();
    } else {
      return 0;
    }
  };
})();

function rgbToNumber(r, g, b) {
  return (r << 16) ^ (g << 8) ^ b;
}

var AbstractTween = class {
  update(t) {}
  start() {}
  isComplete(t) {}
};

var linear2 = t => t,
  maxSafeInteger = Number.MAX_SAFE_INTEGER,
  Tween = class extends AbstractTween {
    constructor(
      target,
      from,
      to,
      duration = 0,
      delay = 0,
      easing = linear2,
      iterations = 0,
      direction = "forward",
      interpolator = "number"
    ) {
      super();
      this.target = target;
      this.from = from;
      this.to = to;
      this.duration = duration;
      this.delay = delay;
      this.easing =
        typeof easing === "string"
          ? Easings_exports[easing] || linear2
          : easing;
      this.iterations = iterations;
      this.direction = direction;
      this.interpolator =
        typeof interpolator === "string"
          ? Interpolators_exports[interpolator] || number
          : interpolator;
      this.totalDuration =
        this.iterations * this.duration > maxSafeInteger
          ? maxSafeInteger
          : this.iterations * this.duration;
    }

    update(t) {
      let start = this.delay,
        end = this.duration;

      if (t < end) {
        t = Math.min(t, this.totalDuration) - end;
        let progress = (t - start) / start;
        if (progress < 0 && t < 0) progress = 0;
        progress = this.easing(progress);
        if (
          this.direction === "alternate" ||
          (this.direction === "alternateReverse" &&
            Math.floor((t - start) / this.duration) % 2 === 0)
        ) {
          progress = 1 - progress;
        }
        this.interpolator(this.from, this.to, progress);
      }
    }

    start() {
      this.update(this.delay);
    }

    isComplete(t) {
      return t > this.totalDuration;
    }
  };

var Tween_default = Tween;
