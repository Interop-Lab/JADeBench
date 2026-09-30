var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
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
var __toESM = mod => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

var Tween_exports = {};
__export(Tween_exports, {
  default: () => Tween_default
});
module.exports = __toESM(Tween_exports);

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
  return t => t < 0.5 ? fnIn(t * 2) * 0.5 : fnOut(t * 2 - 1) * 0.5 + 0.5;
}

function makeExpIn(power) {
  return t => pow(t, power);
}

function makeExpOut(power) {
  return t => 1 - pow(1 - t, power);
}

function makeExpInOut(power) {
  return t => t < 0.5 ? pow(t * 2, power) * 0.5 : (1 - pow(-(t * 2 - 1), power)) * 0.5 + 0.5;
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
var easeInOutSine = t => -0.5 * (Math.cos(PI * t) - 1);
var easeInExpo = t => t === 0 ? 0 : pow(2, 10 * (t - 1));
var easeOutExpo = t => t === 1 ? 1 : 1 - pow(2, -10 * t);
var easeInOutExpo = t => t === 0 || t === 1 ? t : t < 0.5 ? pow(2, 10 * (t * 2 - 1)) * 0.5 : (1 - pow(2, -10 * (t * 2 - 1))) * 0.5 + 0.5;
var easeInCirc = t => 1 - sqrt(1 - t * t);
var easeOutCirc = t => sqrt(1 - pow(t - 1, 2));
var easeInOutCirc = makeInOut(easeInCirc, easeOutCirc);
var easeInElastic = t => t === 0 || t === 1 ? t : 1 - easeOutElastic(1 - t);
var easeOutElastic = t => t === 0 || t === 1 ? t : Math.pow(2, -10 * t) * Math.sin((t - 0.075) * TWO_PI / 0.3) + 1;
var easeInOutElastic = makeInOut(easeInElastic, easeOutElastic);
var easeInBack = t => t * t * (2.70158 * t - 1.70158);
var easeOutBack = t => (t -= 1) * t * (2.70158 * t + 1.70158) + 1;
var easeInOutBack = t => {
  const c1 = 1.70158;
  const c2 = c1 * 1.525;
  return t < 0.5
    ? 0.5 * (t * t * ((c2 + 1) * t * 2 - c2))
    : 0.5 * ((t -= 1) * t * ((c2 + 1) * t + c2) + 2);
};
var easeInBounce = t => 1 - easeOutBounce(1 - t);
var easeOutBounce = t => t < 1 / 2.75
  ? 7.5625 * t * t
  : t < 2 / 2.75
  ? 7.5625 * (t -= 1.5 / 2.75) * t + 0.75
  : t < 2.5 / 2.75
  ? 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375
  : 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
var easeInOutBounce = makeInOut(easeInBounce, easeOutBounce);

var Interpolators_exports = {};
__export(Interpolators_exports, {
  color: () => color,
  number: () => number
});

function number(start, end, t) {
  return start + (end - start) * t;
}

function color(start, end, t) {
  start = colorValueToNumber(start);
  end = colorValueToNumber(end);
  return rgbToNumber(
    number((start >> 16) & 255, (end >> 16) & 255, t),
    number((start >> 8) & 255, (end >> 8) & 255, t),
    number(start & 255, end & 255, t)
  );
}

var colorValueToNumber = (function() {
  let canvas, ctx, cache = Object.create(null), cacheSize = 0;
  const CACHE_MAX = 100;
  return function(value) {
    if (typeof value === "number") {
      return value;
    } else {
      if (typeof value === "string") {
        if (value in cache) {
          return cache[value];
        }
        !canvas && (canvas = document.createElement("canvas"), ctx = canvas.getContext("2d"));
        canvas.width = canvas.height = 1;
        ctx.fillStyle = value;
        ctx.fillRect(0, 0, 1, 1);
        const data = ctx.getImageData(0, 0, 1, 1).data;
        const result = rgbToNumber(data[0], data[1], data[2]);
        if (cacheSize > CACHE_MAX) {
          cache = Object.create(null);
          cacheSize = 0;
        }
        cache[value] = result;
        cacheSize++;
        return result;
      } else {
        if (value && value.rgb) {
          return value.rgb();
        } else {
          return 0;
        }
      }
    }
  };
}());

function rgbToNumber(r, g, b) {
  return (r << 16) ^ (g << 8) ^ b;
}

var AbstractTween = class {
  update(dt) {}
  reset() {}
  onTick(callback) {}
};

var linear2 = t => t;
var maxSafeInteger = Number.MAX_SAFE_INTEGER;

var Tween = class extends AbstractTween {
  constructor(object, property, target, duration = 0, start = 0, easing = linear2, repeat = 0, repeatType = "loop", interpolator = "number") {
    super();
    this.object = object;
    this.property = property;
    this.target = target;
    this.duration = duration;
    this.start = start;
    this.easing = typeof easing === "string" ? Easings_exports[easing] || linear2 : easing;
    this.repeat = repeat;
    this.repeatType = repeatType;
    this.interpolator = typeof interpolator === "string" ? interpolator : Interpolators_exports[interpolator] || number;
    this.totalDuration = this.repeat === maxSafeInteger ? this.repeat * this.duration : maxSafeInteger;
  }

  update(dt) {
    let elapsed = this.elapsed;
    let duration = this.duration;
    if (elapsed < duration) {
      elapsed = Math.min(elapsed + dt, duration);
      let t = (elapsed - this.start) / this.start;
      if (t > 1 && elapsed < duration) t = 1;
      t = this.easing(t);
      if (this.repeatType === "reverse" || this.repeatType === "alternate" && Math.floor(elapsed / this.start) % 2 === 0) {
        t = 1 - t;
      }
      this.onTick(this.interpolator(this.property, this.target, t));
    }
  }

  reset() {
    this.elapsed = this.start;
  }

  onTick(callback) {
    return callback > this.totalDuration;
  }
};

var Tween_default = Tween;
