var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true, configurable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, {
          get: () => from[key],
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
        });
  }
  return to;
};
var __toCommonJS = mod => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

var Tween_exports = {};
__export(Tween_exports, {
  default: () => Tween_default
});
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

var { pow, PI, sqrt } = Math;
var HALF_PI = PI / 2;
var TWO_PI = PI * 2;

function makeInOut(fnIn, fnOut) {
  return (t) => (t < 0.5 ? fnIn(t * 2) / 2 : (fnOut(t * 2 - 1) + 1) / 2);
}

function makeExpIn(p) {
  return (t) => pow(t, p);
}

function makeExpOut(p) {
  return (t) => 1 - pow(1 - t, p);
}

function makeExpInOut(p) {
  return (t) => (t < 0.5 ? pow(t * 2, p) / 2 : (1 - pow(1 - (t * 2 - 1), p)) / 2 + 0.5);
}

var linear = (t) => t;
var easeInQuad = makeExpIn(2);
var easeOutQuad = makeExpOut(2);
var easeInOutQuad = makeExpInOut(2);
var easeInCubic = makeExpIn(3);
var easeOutCubic = makeExpOut(3);
var easeInOutCubic = makeExpInOut(3);
var easeInQuart = makeExpIn(4);
var easeOutQuart = makeExpOut(4);
var easeInOutQuart = makeExpInOut(4);
var easeInQuint = makeExpIn(5);
var easeOutQuint = makeExpOut(5);
var easeInOutQuint = makeExpInOut(5);
var easeInSine = (t) => 1 - Math.cos(t * HALF_PI);
var easeOutSine = (t) => Math.sin(t * HALF_PI);
var easeInOutSine = (t) => -(Math.cos(PI * t) - 1) / 2;
var easeInExpo = (t) => (t === 0 ? 0 : pow(2, 10 * t - 10));
var easeOutExpo = (t) => (t === 1 ? 1 : 1 - pow(2, -10 * t));
var easeInOutExpo = (t) => (t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? pow(2, 20 * t - 10) / 2 : (2 - pow(2, -20 * t + 10)) / 2);
var easeInCirc = (t) => 1 - sqrt(1 - t * t);
var easeOutCirc = (t) => sqrt(1 - pow(t - 1, 2));
var easeInOutCirc = makeInOut(easeInCirc, easeOutCirc);
var easeInElastic = (t) => (t === 0 ? 0 : t === 1 ? 1 : -pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * TWO_PI / 3));
var easeOutElastic = (t) => (t === 0 ? 0 : t === 1 ? 1 : pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * TWO_PI / 3) + 1);
var easeInOutElastic = makeInOut(easeInElastic, easeOutElastic);
var easeInBack = (t) => 2.70158 * t * t * t - 1.70158 * t * t;
var easeOutBack = (t) => 1 + 2.70158 * pow(t - 1, 3) + 1.70158 * pow(t - 1, 2);
var easeInOutBack = (t) => (t < 0.5 ? (pow(2 * t, 2) * (3.5949095 * 2 * t - 2.5949095)) / 2 : (pow(2 * t - 2, 2) * (3.5949095 * (t * 2 - 2) + 2.5949095) + 2) / 2);
var easeInBounce = (t) => 1 - easeOutBounce(1 - t);
var easeOutBounce = (t) => (t < 1 / 2.75 ? 7.5625 * t * t : t < 2 / 2.75 ? 7.5625 * (t -= 1.5 / 2.75) * t + 0.75 : t < 2.5 / 2.75 ? 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375 : 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375);
var easeInOutBounce = makeInOut(easeInBounce, easeOutBounce);

var Interpolators_exports = {};
__export(Interpolators_exports, {
  color: () => color,
  number: () => number
});

function number(a, b, t) {
  return a + (b - a) * t;
}

function color(a, b, t) {
  return rgbToNumber(
    Math.round(number((a >> 16) & 0xff, (b >> 16) & 0xff, t)),
    Math.round(number((a >> 8) & 0xff, (b >> 8) & 0xff, t)),
    Math.round(number(a & 0xff, b & 0xff, t))
  );
}

var colorValueToNumber = (function () {
  let canvas, ctx, cache = Object.create(null), cacheCount = 0;
  const CACHE_MAX = 2048;
  return function (value) {
    if (typeof value === "number") return value;
    else if (typeof value === "string") {
      if (value in cache) return cache[value];
      !canvas && (canvas = document.createElement("canvas"), ctx = canvas.getContext("2d"));
      canvas.width = canvas.height = 1;
      ctx.fillStyle = value;
      ctx.fillRect(0, 0, 1, 1);
      const data = ctx.getImageData(0, 0, 1, 1).data;
      const num = rgbToNumber(data[0], data[1], data[2]);
      cacheCount > CACHE_MAX && (cache = Object.create(null), cacheCount = 0);
      cache[value] = num;
      cacheCount++;
      return num;
    } else return value && value.isColor ? value.getHex() : 0;
  };
})();

function rgbToNumber(r, g, b) {
  return (r << 16) | (g << 8) | b;
}

var AbstractTween = class {
  gotoElapsedTime(t) {}
  gotoEnd() {}
  isDoneAtElapsedTime(t) {}
};

var linear2 = (t) => t;
var maxSafeInteger = 9007199254740991;

var Tween = class extends AbstractTween {
  constructor(target, property, end, duration = 750, delay = 0, easing = linear2, repeat = 1, direction = "forward", interpolation = "number") {
    super();
    this.target = target;
    this.property = property;
    this.end = end;
    this.duration = duration;
    this.delay = delay;
    this.easing = easing;
    this.repeat = repeat;
    this.direction = direction;
    this.interpolation = interpolation;
    this.elapsed = 0;
    this.startTime = null;
    this.started = false;
    this.ended = false;
    this.startValue = null;
    this.currentValue = null;
    this.interpolator = interpolation === "color" ? color : number;
    this.colorValueToNumber = colorValueToNumber;
    this.maxSafeInteger = maxSafeInteger;
  }

  gotoElapsedTime(t) {
    "use strict";
    if (!this.started) {
      this.started = true;
      this.startValue = this.colorValueToNumber(this.target[this.property]);
      this.end = this.colorValueToNumber(this.end);
    }
    this.elapsed = t;
    const progress = Math.min(Math.max((t - this.delay) / this.duration, 0), 1);
    const eased = this.easing(progress);
    this.currentValue = this.interpolator(this.startValue, this.end, eased);
    this.target[this.property] = this.currentValue;
    if (progress >= 1) {
      this.ended = true;
    }
  }

  gotoEnd() {
    "use strict";
    if (!this.started) {
      this.started = true;
      this.startValue = this.colorValueToNumber(this.target[this.property]);
      this.end = this.colorValueToNumber(this.end);
    }
    this.target[this.property] = this.end;
    this.ended = true;
  }

  isDoneAtElapsedTime(t) {
    "use strict";
    return t >= this.delay + this.duration;
  }
};

var Tween_default = Tween;
