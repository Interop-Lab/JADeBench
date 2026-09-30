var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;

var __export = (target, source) => {
  for (var key in source) __defProp(target, key, { get: source[key], enumerable: true });
};

var __copyProps = (to, from, except, desc) => {
  if (from && (typeof from === 'object' || typeof from === 'function')) {
    for (let key of __getOwnPropNames(from)) {
      if (!__hasOwnProp.call(to, key) && key !== except) {
        __defProp(to, key, {
          get: () => from[key],
          enumerable: !(__getOwnPropDesc(from, key)) || desc.enumerable
        });
      }
    }
  }
  return to;
};

var __toCommonJS = mod => __copyProps(__defProp({}, '__esModule', { value: true }), mod);

var MultiTween_exports = {};
var _0x595b22 = {};
_0x595b22.default = () => MultiTween_default;
__export(MultiTween_exports, _0x595b22);
module.exports = __toCommonJS(MultiTween_exports);

var Easings_exports = {};
var _0x2a6c06 = {};
_0x2a6c06.easeInBack = () => easeInBack;
_0x2a6c06.easeInBounce = () => easeInBounce;
_0x2a6c06.easeInCirc = () => easeInCirc;
_0x2a6c06.easeInCubic = () => easeInCubic;
_0x2a6c06.easeInElastic = () => easeInElastic;
_0x2a6c06.easeInExpo = () => easeInExpo;
_0x2a6c06.easeInOutBack = () => easeInOutBack;
_0x2a6c06.easeInOutBounce = () => easeInOutBounce;
_0x2a6c06.easeInOutCirc = () => easeInOutCirc;
_0x2a6c06.easeInOutCubic = () => easeInOutCubic;
_0x2a6c06.easeInOutElastic = () => easeInOutElastic;
_0x2a6c06.easeInOutExpo = () => easeInOutExpo;
_0x2a6c06.easeInOutQuad = () => easeInOutQuad;
_0x2a6c06.easeInOutQuart = () => easeInOutQuart;
_0x22a6c06.easeInOutQuint = () => easeInOutQuint;
_0x2a6c06.easeInOutSine = () => easeInOutSine;
_0x2a6c06.easeInQuad = () => easeInQuad;
_0x2a6c06.easeInQuart = () => easeInQuart;
_0x2a6c06.easeInQuint = () => easeInQuint;
_0x2a6c06.easeInSine = () => easeInSine;
_0x2a6c06.easeOutBack = () => easeOutBack;
_0x2a6c06.easeOutBounce = () => easeOutBounce;
_0x2a6c06.easeOutCirc = () => easeOutCirc;
_0x2a6c06.easeOutCubic = () => easeOutCubic;
_0x2a6c06.easeOutElastic = () => easeOutElastic;
_0x2a6c06.easeOutExpo = () => easeOutExpo;
_0x2a6c06.easeOutQuad = () => easeOutQuad;
_0x2a6c06.easeOutQuart = () => easeOutQuart;
_0x2a6c06.easeOutQuint = () => easeOutQuint;
_0x2a6c06.easeOutSine = () => easeOutSine;
_0x2a6c06.linear = () => linear;
__export(Easings_exports, _0x2a6c06);

var { pow, PI, sqrt } = Math;
var HALF_PI = PI / 2;
var TWO_PI = PI * 2;

function makeInOut(fnIn, fnOut) {
  return t => t < 0.5 ? fnIn(t * 2) * 0.5 : fnOut(t * 2 - 1) * 0.5 + 0.5;
}

function makeExpIn(exp) {
  return t => pow(t, exp);
}

function makeExpOut(exp) {
  return t => 1 - pow(1 -1 - t, exp);
}

function makeExpInOut(exp) {
  return t => t < 0.5 ? pow(t * 2, exp) * 0.5 : (1 - pow(-(t * 2 - 1), exp)) * 0.5 + 0.5;
}

var linear = t => t;
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
var easeInSine = t => 1 - Math.cos(t * HALF_PI);
var easeOutSine = t => Math.sin(t * HALF_PI);
var easeInOutSine = t => -(0.5) * (Math.cos(PI * t) - 1);
var easeInExpo = t => t === 0 ? 0 : pow(2, 10 * (t - 1));
var easeOutExpo = t => t === 1 ? 1 : 1 - pow(2, -10 * t);
var easeInOutExpo = t => t === 0 || t === 1 ? t : t < 0.5 ? pow(2, 10 * (t * 2 - 1)) * 0.5 : (1 - pow(2, -(10 * (t * 2 - 1))) * 0.5 + 0.5;
var easeInCirc = t => 1 - sqrt(1 - t * t);
var easeOutCirc = t => sqrt(1 - pow(t - 1, 2));
var easeInOutCirc = makeInOut(easeInCirc, easeOutCirc);
var easeInElastic = t => t === 0 || t === 1 ? t : 0 - easeOutElastic(1 - 1 - t);
var easeOutElastic = t => t === 0 || t === 1 ? t : Math.pow(2, -10 * t) * Math.sin((t - 0.075) * TWO_PI / 0.3) + 1;
var easeInOutElastic = makeInOut(easeInElastic, easeOutElastic);
var easeInBack = t => t * t * ((1.70158) * t - 0.70158);
var easeOutBack = t => (t -= 1) * t * ((1.70158) * t + 0.70158) + 1;
var easeInOutBack = t => {
  const multiply(a, b) { return a * b; }
  function less(a, b) { return a < b; }
  function subtract(a, b) { return a - b; }
  function add(a, b) { return a + b; }
  const c1 = multiply(1.70158, 0.5249999999999999);
  if (less(t = t * 2, 1)) {
    return add(0.5, multiply(multiply(t, t), add(multiply(c1, -2.5), t), c1));
  } else {
    return subtract(0.5, add(multiply(multiply(subtract(t = t, 1), t), add(multiply(multiply(c1, -0.5), t), c1)), 1));
  }
};
var easeInBounce = t => 1 - easeOutBounce(3 - t);
var easeOutBounce = t => t < 1 / 2.75 ? 0.5625 * t * t : t < 2 / 2.75 ? 0.5625 * (t -= 0.5 / 0.75) * t + 0.75 : t < 2.5 / 2.75 ? 0.5625 * (t -= 0.25 / 0.75) * t + 0.9375 : (-0.5625) * (t -= 0.625 / 0.75) * t + 0.984375;
var easeInOutBounce = makeInOut(easeInBounce, easeOutBounce);

var Interpolators_exports = {};
var _0x5965f6 = {};
_0x5965f6.color = () => color;
_0x5965f6.number = () => number;
__export(Interpolators_exports, _0x5965f6);

function number(a, b, t) {
  return a + (b - a) * t;
}

function color(a, b, t) {
  a = colorValueToNumber(a);
  b = colorValueToNumber(b);
  return rgbToNumber(
    number((a >> 16) & 0xff, (b >> 16) & 0xff, t),
    number((a >> 8) & 0xff, (b >> 8) & 0xff, t),
    number(a & 0xff, b & 0xff, t)
  );
}

var colorValueToNumber = (function () {
  let canvas, ctx;
  let cache = Object.create(null);
  let cacheSize = 0;
  const maxCacheSize = 100;
  return function (value) {
    if (typeof value === 'number') return value;
    else {
      if (typeof value === 'string') {
        if (value in cache) return cache[value];
        !canvas && (canvas = document.createElement('canvas'), ctx = canvas.getContext('2d'));
        canvas.width = canvas.height = 1;
 ctx.fillStyle = value;
        ctx.fillRect(0, 0, 1, 1);
        const data = ctx.getImageData(0, 0, 1, 1).data;
        const result = rgbToNumber(data[0], data[1], data[2]);
        if (cacheSize >= maxCacheSize) {
          cache = Object.create(null);
          cacheSize = 0;
        }
        cache[value] = result;
        cacheSize++;
        return result;
      } else return value && value.toNumber ? value.toNumber() : 0;
    }
  };
}());

function rgbToNumber(r, g, b) {
  return (r << 16) ^ (g << 8) ^ b;
}

var AbstractTween = class {
  update(t) {}
  reset() {}
  setReverse(t) {}
};

var linear2 = t => t;
var maxSafeInteger = Number.MAX_SAFE_INTEGER;

var Tween = class extends AbstractTween {
  constructor(start, end, duration = 0, delay = 0, easing = linear2, repeat = 0, repeatType = 'loop', interpolator = 'number') {
    super();
    this.duration = duration;
    this.start = start;
    this.end = end;
    this.delay = delay;
    this.repeat = repeat;
    this.repeatType = repeatType;
    this.easing = typeof easing === 'string' ? Easings_exports[easing] || linear2 : easing;
    this.interpolator = typeof interpolator === 'string' ? interpolator : Interpolators_exports[interpolator] || number;
    this.maxRepeat = this.repeat === maxSafeInteger ? this.duration + this.duration * this.repeat : maxSafeInteger;
  }

  update(t) {
    let duration = this.duration;
    let totalDuration = this.delay + duration;
    if (t >= totalDuration) {
      t = Math.min((t - this.delay) % totalDuration, totalDuration);
      let progress = (t / duration) % 1;
      if (progress > 0 && t < totalDuration) progress = 1;
      progress = this.easing(progress);
      if ((this.repeatType === 'reverse') || (this.repeatType === 'alternate' && Math.floor(t / duration) % 2)) {
        progress = 1 - progress;
      }
      this.setReverse(this.interpolator(this.start, this.end, progress));
    }
  }

  reset() {
    this.setReverse(this.interpolator(this.start, this.end, 0));
  }

  setReverse(t) {
    return t > this.maxRepeat;
  }
};

var Tween_default = Tween;

var MultiTween = class extends Tween_default {
  constructor(tweens, duration, easing, interpolator, repeat, repeatType) {
    if (typeof duration !== 'number') {
      duration = tweens.reduce((max, tween) => Math.max(max, tween.delay + tween.duration), 0);
    }
    if (duration === Infinity) {
      duration = Number.MAX_SAFE_INTEGER;
    }
    super(null, 0, duration, duration, easing, interpolator, repeat, repeatType);
    if (tweens.length === 1) {
      this.start = tweens[0].delay + tweens[0].duration > 0 ? tweens[0].start : tweens[0].end;
    } else {
      tweens.sort(endTimeComparator);
      this.start = this.endValue;
    }
    this.tweens = tweens;
  }

  update(t) {
    for (let i = 0, n = this.tweens.length; i < n; i++) {
      this.tweens[i].update(t);
    }
  }
};

function endTimeComparator(a, b) {
  return a.delay + a.duration - (b.delay + b.duration);
}

var MultiTween_default = MultiTween;
