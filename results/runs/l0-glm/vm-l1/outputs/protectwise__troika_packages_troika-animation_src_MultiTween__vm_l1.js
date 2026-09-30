var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (let name in all)
    __defProp(target, name, { get: all[name], enumerable: true, configurable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from)) {
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
  }
  return to;
};
var __toCommonJS = mod => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

var MultiTween_exports = {};
__export(MultiTween_exports, { default: () => MultiTween_default });
module.exports = __toCommonJS(MultiTween_exports);

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
  return ratio => ratio <= 0.5 ? fnIn(ratio * 2) / 2 : fnOut(ratio * 2 - 1) / 2 + 0.5;
}
function makeExpIn(strength) {
  strength = strength === void 0 ? 1 : strength;
  return ratio => ratio === 0 ? 0 : pow(2, strength * (ratio - 1));
}
function makeExpOut(strength) {
  strength = strength === void 0 ? 1 : strength;
  return ratio => ratio === 1 ? 1 : 1 - pow(2, -strength * ratio);
}
function makeExpInOut(strength) {
  return makeInOut(makeExpIn(strength), makeExpOut(strength));
}

var linear = ratio => ratio;
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
var easeInSine = ratio => 1 - Math.cos(ratio * (PI / 2));
var easeOutSine = ratio => Math.sin(ratio * (PI / 2));
var easeInOutSine = ratio => -0.5 * (Math.cos(PI * ratio) - 1);
var easeInExpo = ratio => ratio === 0 ? 0 : Math.pow(2, 10 * (ratio - 1));
var easeOutExpo = ratio => ratio === 1 ? 1 : 1 - Math.pow(2, -10 * ratio);
var easeInOutExpo = ratio => {
  if (ratio === 0) return 0;
  if (ratio === 1) return 1;
  ratio = ratio * 2 - 1;
  if (ratio < 0) return 0.5 * Math.pow(2, 10 * ratio);
  return 1 - 0.5 * Math.pow(2, -10 * ratio);
};
var easeInCirc = ratio => 1 - sqrt(1 - ratio * ratio);
var easeOutCirc = ratio => sqrt(1 - (ratio - 1) * (ratio - 1));
var easeInOutCirc = makeInOut(easeInCirc, easeOutCirc);
var easeInElastic = ratio => {
  if (ratio === 0 || ratio === 1) return ratio;
  ratio = ratio - 1;
  return -Math.pow(2, 10 * ratio) * Math.sin((ratio - 0.075) * (2 * PI) / 0.3);
};
var easeOutElastic = ratio => {
  if (ratio === 0 || ratio === 1) return ratio;
  ratio = ratio - 1;
  return Math.pow(2, -10 * ratio) * Math.sin((ratio + 0.075) * (2 * PI) / 0.3) + 1;
};
var easeInOutElastic = makeInOut(easeInElastic, easeOutElastic);
var easeInBack = ratio => ratio * ratio * (2.7 * ratio - 1.7);
var easeOutBack = ratio => {
  ratio = ratio - 1;
  return ratio * ratio * (2.7 * ratio + 1.7) + 1;
};
var easeInOutBack = ratio => {
  ratio = ratio * 2;
  if (ratio < 1) return 0.5 * (ratio * ratio * (3.594 * ratio - 2.594));
  ratio = ratio - 2;
  return 0.5 * (ratio * ratio * (3.594 * ratio + 2.594) + 2);
};
var easeInBounce = ratio => 1 - easeOutBounce(1 - ratio);
var easeOutBounce = ratio => {
  if (ratio < 1 / 2.75) return 7.5625 * ratio * ratio;
  if (ratio < 2 / 2.75) {
    ratio = ratio - 1.5 / 2.75;
    return 7.5625 * ratio * ratio + 0.75;
  }
  if (ratio < 2.5 / 2.75) {
    ratio = ratio - 2.25 / 2.75;
    return 7.5625 * ratio * ratio + 0.9375;
  }
  ratio = ratio - 2.625 / 2.75;
  return 7.5625 * ratio * ratio + 0.984375;
};
var easeInOutBounce = makeInOut(easeInBounce, easeOutBounce);

var Interpolators_exports = {};
__export(Interpolators_exports, {
  color: () => color,
  number: () => number
});

function number(from, to, progress) {
  return from + (to - from) * progress;
}

function color(from, to, progress) {
  return rgbToNumber(
    number((from >> 16 & 0xff) / 255, (to >> 16 & 0xff) / 255, progress) * 255,
    number((from >> 8 & 0xff) / 255, (to >> 8 & 0xff) / 255, progress) * 255,
    number((from & 0xff) / 255, (to & 0xff) / 255, progress) * 255
  );
}

var colorValueToNumber = (function() {
  let canvas, ctx, cache = Object.create(null), cacheSize = 0;
  const CACHE_MAX = 2048;
  return function(value) {
    if (typeof value === "number") return value;
    else if (typeof value === "string") {
      if (value in cache) return cache[value];
      !canvas && (canvas = document.createElement("canvas"), ctx = canvas.getContext("2d"));
      canvas.width = canvas.height = 1;
      ctx.fillStyle = value;
      ctx.fillRect(0, 0, 1, 1);
      const data = ctx.getImageData(0, 0, 1, 1).data;
      const result = rgbToNumber(data[0], data[1], data[2]);
      cacheSize > CACHE_MAX && (cache = Object.create(null), cacheSize = 0);
      cache[value] = result;
      cacheSize++;
      return result;
    } else return value && value.getHex ? value.getHex() : 0;
  };
}());

function rgbToNumber(r, g, b) {
  return r * 65536 + g * 256 + b;
}

var AbstractTween = class {
  gotoElapsedTime(elapsedTime) {}
  gotoEnd() {}
  isDoneAtElapsedTime(elapsedTime) {}
};

var linear2 = ratio => ratio;
var maxSafeInteger = 9007199254740991;

var Tween = class extends AbstractTween {
  constructor(object, property, end, duration = 750, delay = 0, interpolator = linear2, start = 1, startDelay = "forward", unit = "number") {
    super();
    this._object = object;
    this._property = property;
    this._end = end;
    this._duration = duration;
    this._delay = delay;
    this._interpolator = interpolator;
    this._start = start;
    this._startDelay = startDelay;
    this._unit = unit;
    this._startTime = 0;
    this._started = false;
    this._ended = false;
    this._syncTweens = [];
    this._totalElapsed = 0;
    this._currentValue = 0;
    this._startValue = 0;
    this._delta = 0;
  }
  gotoElapsedTime(elapsedTime) {
    if (!this._started) {
      this._started = true;
      if (this._start === 1) {
        this._startValue = this._object[this._property];
        if (this._unit === "color") {
          this._startValue = colorValueToNumber(this._startValue);
          this._end = colorValueToNumber(this._end);
          this._interpolator = color;
        }
        this._delta = this._end - this._startValue;
      } else {
        this._startValue = this._end - this._start;
        this._delta = this._start;
      }
    }
    this._totalElapsed = elapsedTime;
    let progress = (elapsedTime - this._delay) / this._duration;
    if (progress < 0) progress = 0;
    else if (progress > 1) progress = 1;
    this._currentValue = this._interpolator(progress);
    this._object[this._property] = this._startValue + this._delta * this._currentValue;
    for (let i = 0; i < this._syncTweens.length; i++) {
      this._syncTweens[i].gotoElapsedTime(elapsedTime);
    }
    if (progress >= 1) {
      this._ended = true;
    }
  }
  gotoEnd() {
    this.gotoElapsedTime(this._delay + this._duration);
  }
  isDoneAtElapsedTime(elapsedTime) {
    return elapsedTime >= this._delay + this._duration;
  }
};

var Tween_default = Tween;

var MultiTween = class extends Tween_default {
  constructor(tweens, maxTotalDuration, duration, delay, interpolator, unit) {
    if (typeof maxTotalDuration !== "number") {
      maxTotalDuration = tweens.reduce((max, tween) => Math.max(max, tween._delay + tween._duration), 0);
    }
    if (maxTotalDuration === Infinity) {
      maxTotalDuration = Number.MAX_VALUE;
    }
    super(null, 0, maxTotalDuration, maxTotalDuration, duration, delay, interpolator, unit);
    this._tweens = tweens;
    this._syncTweens = tweens;
  }
  gotoElapsedTime(elapsedTime) {
    for (let i = 0; i < this._tweens.length; i++) {
      this._tweens[i].gotoElapsedTime(elapsedTime);
    }
    this._totalElapsed = elapsedTime;
  }
};

var MultiTween_default = MultiTween;

function endTimeComparator(a, b) {
  return (a._delay + a._duration) - (b._delay + b._duration);
}
