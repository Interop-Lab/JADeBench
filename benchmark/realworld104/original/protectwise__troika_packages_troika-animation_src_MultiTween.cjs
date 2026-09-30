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
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// ../work/protectwise__troika/packages/troika-animation/src/MultiTween.js
var MultiTween_exports = {};
__export(MultiTween_exports, {
  default: () => MultiTween_default
});
module.exports = __toCommonJS(MultiTween_exports);

// ../work/protectwise__troika/packages/troika-animation/src/Easings.js
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
function makeInOut(inFn, outFn) {
  return (t) => t < 0.5 ? inFn(t * 2) * 0.5 : outFn(t * 2 - 1) * 0.5 + 0.5;
}
function makeExpIn(exp) {
  return (t) => pow(t, exp);
}
function makeExpOut(exp) {
  return (t) => 1 - pow(1 - t, exp);
}
function makeExpInOut(exp) {
  return (t) => t < 0.5 ? pow(t * 2, exp) * 0.5 : (1 - pow(1 - (t * 2 - 1), exp)) * 0.5 + 0.5;
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
var easeInOutSine = (t) => -0.5 * (Math.cos(PI * t) - 1);
var easeInExpo = (t) => t === 0 ? 0 : pow(2, 10 * (t - 1));
var easeOutExpo = (t) => t === 1 ? 1 : 1 - pow(2, -10 * t);
var easeInOutExpo = (t) => t === 0 || t === 1 ? t : t < 0.5 ? pow(2, 10 * (t * 2 - 1)) * 0.5 : (1 - pow(2, -10 * (t * 2 - 1))) * 0.5 + 0.5;
var easeInCirc = (t) => 1 - sqrt(1 - t * t);
var easeOutCirc = (t) => sqrt(1 - pow(t - 1, 2));
var easeInOutCirc = makeInOut(easeInCirc, easeOutCirc);
var easeInElastic = (t) => t === 0 || t === 1 ? t : 1 - easeOutElastic(1 - t);
var easeOutElastic = (t) => t === 0 || t === 1 ? t : Math.pow(2, -10 * t) * Math.sin((t - 0.075) * TWO_PI / 0.3) + 1;
var easeInOutElastic = makeInOut(easeInElastic, easeOutElastic);
var easeInBack = (t) => t * t * (2.70158 * t - 1.70158);
var easeOutBack = (t) => (t -= 1) * t * (2.70158 * t + 1.70158) + 1;
var easeInOutBack = (t) => {
  const s = 1.70158 * 1.525;
  return (t *= 2) < 1 ? 0.5 * (t * t * ((s + 1) * t - s)) : 0.5 * ((t -= 2) * t * ((s + 1) * t + s) + 2);
};
var easeInBounce = (t) => 1 - easeOutBounce(1 - t);
var easeOutBounce = (t) => t < 1 / 2.75 ? 7.5625 * t * t : t < 2 / 2.75 ? 7.5625 * (t -= 1.5 / 2.75) * t + 0.75 : t < 2.5 / 2.75 ? 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375 : 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
var easeInOutBounce = makeInOut(easeInBounce, easeOutBounce);

// ../work/protectwise__troika/packages/troika-animation/src/Interpolators.js
var Interpolators_exports = {};
__export(Interpolators_exports, {
  color: () => color,
  number: () => number
});
function number(fromValue, toValue, progress) {
  return fromValue + (toValue - fromValue) * progress;
}
function color(fromValue, toValue, progress) {
  fromValue = colorValueToNumber(fromValue);
  toValue = colorValueToNumber(toValue);
  return rgbToNumber(
    number(fromValue >> 16 & 255, toValue >> 16 & 255, progress),
    number(fromValue >> 8 & 255, toValue >> 8 & 255, progress),
    number(fromValue & 255, toValue & 255, progress)
  );
}
var colorValueToNumber = /* @__PURE__ */ function() {
  let colorCanvas, colorCanvasCtx;
  let stringCache = /* @__PURE__ */ Object.create(null);
  let stringCacheSize = 0;
  const stringCacheMaxSize = 2048;
  return function(value) {
    if (typeof value === "number") {
      return value;
    } else if (typeof value === "string") {
      if (value in stringCache) {
        return stringCache[value];
      }
      if (!colorCanvas) {
        colorCanvas = document.createElement("canvas");
        colorCanvasCtx = colorCanvas.getContext("2d");
      }
      colorCanvas.width = colorCanvas.height = 1;
      colorCanvasCtx.fillStyle = value;
      colorCanvasCtx.fillRect(0, 0, 1, 1);
      const colorData = colorCanvasCtx.getImageData(0, 0, 1, 1).data;
      const result = rgbToNumber(colorData[0], colorData[1], colorData[2]);
      if (stringCacheSize > stringCacheMaxSize) {
        stringCache = /* @__PURE__ */ Object.create(null);
        stringCacheSize = 0;
      }
      stringCache[value] = result;
      stringCacheSize++;
      return result;
    } else if (value && value.isColor) {
      return value.getHex();
    } else {
      return 0;
    }
  };
}();
function rgbToNumber(r, g, b) {
  return r << 16 ^ g << 8 ^ b;
}

// ../work/protectwise__troika/packages/troika-animation/src/AbstractTween.js
var AbstractTween = class {
  /**
   * @abstract
   * For a given elapsed time relative to the start of the tween, calculates the value at that time and calls the
   * `callback` function with that value. If the given time is during the `delay` period, the callback will not be
   * invoked.
   * @param {number} time
   */
  gotoElapsedTime(time) {
  }
  /**
   * @abstract
   * Like `gotoElapsedTime` but goes to the very end of the tween.
   */
  gotoEnd() {
  }
  /**
   * @abstract
   * For a given elapsed time relative to the start of the tween, determines if the tween is in its completed end state.
   * @param {number} time
   * @return {boolean}
   */
  isDoneAtElapsedTime(time) {
  }
};

// ../work/protectwise__troika/packages/troika-animation/src/Tween.js
var linear2 = (v) => v;
var maxSafeInteger = 9007199254740991;
var Tween = class extends AbstractTween {
  constructor(callback, fromValue, toValue, duration = 750, delay = 0, easing = linear2, iterations = 1, direction = "forward", interpolate = "number") {
    super();
    this.callback = callback;
    this.fromValue = fromValue;
    this.toValue = toValue;
    this.duration = duration;
    this.delay = delay;
    this.easing = typeof easing === "string" ? Easings_exports[easing] || linear2 : easing;
    this.iterations = iterations;
    this.direction = direction;
    this.interpolate = typeof interpolate === "function" ? interpolate : Interpolators_exports[interpolate] || number;
    this.totalElapsed = this.iterations < maxSafeInteger ? this.delay + this.duration * this.iterations : maxSafeInteger;
  }
  /**
   * For a given elapsed time relative to the start of the tween, calculates the value at that time and calls the
   * `callback` function with that value. If the given time is during the `delay` period, the callback will not be
   * invoked.
   * @param {number} time
   */
  gotoElapsedTime(time) {
    let duration = this.duration;
    let delay = this.delay;
    if (time >= delay) {
      time = Math.min(time, this.totalElapsed) - delay;
      let progress = time % duration / duration;
      if (progress === 0 && time !== 0) progress = 1;
      progress = this.easing(progress);
      if (this.direction === "reverse" || this.direction === "alternate" && Math.ceil(time / duration) % 2 === 0) {
        progress = 1 - progress;
      }
      this.callback(this.interpolate(this.fromValue, this.toValue, progress));
    }
  }
  /**
   * Like `gotoElapsedTime` but goes to the very end of the tween.
   */
  gotoEnd() {
    this.gotoElapsedTime(this.totalElapsed);
  }
  /**
   * For a given elapsed time relative to the start of the tween, determines if the tween is in its completed end state.
   * @param {number} time
   * @return {boolean}
   */
  isDoneAtElapsedTime(time) {
    return time > this.totalElapsed;
  }
};
var Tween_default = Tween;

// ../work/protectwise__troika/packages/troika-animation/src/MultiTween.js
var MultiTween = class extends Tween_default {
  constructor(tweens, duration, delay, easing, iterations, direction) {
    if (typeof duration !== "number") {
      duration = tweens.reduce((dur, tween) => Math.max(dur, tween.totalElapsed), 0);
    }
    if (duration === Infinity) {
      duration = Number.MAX_VALUE;
    }
    super(null, 0, duration, duration, delay, easing, iterations, direction);
    if (tweens.length === 1) {
      this.callback = tweens[0].gotoElapsedTime.bind(tweens[0]);
    } else {
      tweens.sort(endTimeComparator);
      this.callback = this._syncTweens;
    }
    this.tweens = tweens;
  }
  _syncTweens(time) {
    for (let i = 0, len = this.tweens.length; i < len; i++) {
      this.tweens[i].gotoElapsedTime(time);
    }
  }
};
function endTimeComparator(a, b) {
  return a.totalElapsed - b.totalElapsed;
}
var MultiTween_default = MultiTween;
