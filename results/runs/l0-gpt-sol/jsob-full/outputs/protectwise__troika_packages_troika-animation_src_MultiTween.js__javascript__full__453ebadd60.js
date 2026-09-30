var __defProp = Object.defineProperty;

var { pow, PI, sqrt } = Math;
var HALF_PI = PI / 2;
var TWO_PI = PI * 2;

function makeInOut(easeIn, easeOut) {
  return (value) =>
    value < 0.5
      ? easeIn(value * 2) * 0.5
      : easeOut(value * 2 - 1) * 0.5 + 0.5;
}

function makeExpIn(exponent) {
  return (value) => pow(value, exponent);
}

function makeExpOut(exponent) {
  return (value) => 1 - pow(1 - value, exponent);
}

function makeExpInOut(exponent) {
  return (value) =>
    value < 0.5
      ? pow(value * 2, exponent) * 0.5
      : (1 - pow(1 - (value * 2 - 1), exponent)) * 0.5 + 0.5;
}

var linear = (value) => value;

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

var easeInSine = (value) => 1 - Math.cos(value * HALF_PI);
var easeOutSine = (value) => Math.sin(value * HALF_PI);
var easeInOutSine = (value) => -0.5 * (Math.cos(PI * value) - 1);

var easeInExpo = (value) =>
  value === 0 ? 0 : pow(2, 10 * (value - 1));

var easeOutExpo = (value) =>
  value === 1 ? 1 : 1 - pow(2, -10 * value);

var easeInOutExpo = (value) => {
  if (value === 0 || value === 1) return value;
  if (value < 0.5) return pow(2, 10 * (value * 2 - 1)) * 0.5;
  return (1 - pow(2, -10 * (value * 2 - 1))) * 0.5 + 0.5;
};

var easeInCirc = (value) => 1 - sqrt(1 - value * value);
var easeOutCirc = (value) => sqrt(1 - pow(value - 1, 2));
var easeInOutCirc = makeInOut(easeInCirc, easeOutCirc);

var easeInElastic = (value) =>
  value === 0 || value === 1 ? value : 1 - easeOutElastic(1 - value);

var easeOutElastic = (value) =>
  value === 0 || value === 1
    ? value
    : pow(2, -10 * value) *
        Math.sin(((value - 0.075) * TWO_PI) / 0.3) +
      1;

var easeInOutElastic = makeInOut(easeInElastic, easeOutElastic);

var easeInBack = (value) =>
  value * value * ((1.70158 + 1) * value - 1.70158);

var easeOutBack = (value) => {
  value -= 1;
  return value * value * ((1.70158 + 1) * value + 1.70158) + 1;
};

var easeInOutBack = (value) => {
  var amount = 1.70158 * 1.525;
  value *= 2;

  if (value < 1) {
    return 0.5 * (value * value * ((amount + 1) * value - amount));
  }

  value -= 2;
  return 0.5 * (value * value * ((amount + 1) * value + amount) + 2);
};

var easeInBounce = (value) => 1 - easeOutBounce(1 - value);

var easeOutBounce = (value) => {
  if (value < 1 / 2.75) {
    return 7.5625 * value * value;
  }

  if (value < 2 / 2.75) {
    value -= 1.5 / 2.75;
    return 7.5625 * value * value + 0.75;
  }

  if (value < 2.5 / 2.75) {
    value -= 2.25 / 2.75;
    return 7.5625 * value * value + 0.9375;
  }

  value -= 2.625 / 2.75;
  return 7.5625 * value * value + 0.984375;
};

var easeInOutBounce = makeInOut(easeInBounce, easeOutBounce);

var Easings = {
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
  linear
};

function number(from, to, progress) {
  return from + (to - from) * progress;
}

function rgbToNumber(red, green, blue) {
  return (red << 16) ^ (green << 8) ^ blue;
}

var colorValueToNumber = (() => {
  var canvas;
  var context;
  var cache = Object.create(null);
  var cacheSize = 0;
  var maximumCacheSize = 2048;

  return function (value) {
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

      var data = context.getImageData(0, 0, 1, 1).data;
      var result = rgbToNumber(data[0], data[1], data[2]);

      if (cacheSize > maximumCacheSize) {
        cache = Object.create(null);
        cacheSize = 0;
      }

      cache[value] = result;
      cacheSize++;
      return result;
    }

    return value && value.toNumber ? value.toNumber() : 0;
  };
})();

function color(from, to, progress) {
  from = colorValueToNumber(from);
  to = colorValueToNumber(to);

  return rgbToNumber(
    number((from >> 16) & 255, (to >> 16) & 255, progress),
    number((from >> 8) & 255, (to >> 8) & 255, progress),
    number(from & 255, to & 255, progress)
  );
}

var Interpolators = {
  color,
  number
};

class AbstractTween {
  update(time) {}
  reset() {}
  isFinished(time) {}
}

var maxSafeInteger = Number.MAX_SAFE_INTEGER;

class Tween extends AbstractTween {
  constructor(
    callback,
    fromValue,
    toValue,
    duration = 750,
    delay = 0,
    easing = linear,
    iterations = 1,
    direction = "normal",
    interpolator = "number"
  ) {
    super();

    this.callback = callback;
    this.fromValue = fromValue;
    this.toValue = toValue;
    this.duration = duration;
    this.delay = delay;
    this.easing =
      typeof easing === "string" ? Easings[easing] || linear : easing;
    this.iterations = iterations;
    this.direction = direction;
    this.interpolator =
      typeof interpolator === "function"
        ? interpolator
        : Interpolators[interpolator] || number;

    this.endTime =
      this.iterations < maxSafeInteger
        ? this.delay + this.duration * this.iterations
        : maxSafeInteger;
  }

  update(time) {
    var duration = this.duration;
    var delay = this.delay;

    if (time >= delay) {
      time = Math.min(time, this.endTime) - delay;

      var progress = (time % duration) / duration;
      if (progress === 0 && time !== 0) progress = 1;

      progress = this.easing(progress);

      if (
        this.direction === "reverse" ||
        (this.direction !== "normal" &&
          (Math.ceil(time / duration) - 1) % 2 === 0)
      ) {
        progress = 1 - progress;
      }

      this.callback(
        this.interpolator(this.fromValue, this.toValue, progress)
      );
    }
  }

  reset() {
    this.callback(this.interpolator(this.fromValue, this.toValue, 0));
  }

  isFinished(time) {
    return time > this.endTime;
  }
}

function endTimeComparator(first, second) {
  return first.endTime - second.endTime;
}

class MultiTween extends Tween {
  constructor(tweens, duration, delay, easing, iterations, direction) {
    if (typeof duration === "undefined") {
      duration = tweens.reduce(
        (maximum, tween) => Math.max(maximum, tween.endTime),
        0
      );
    }

    if (duration === Infinity) {
      duration = Number.MAX_SAFE_INTEGER;
    }

    super(
      null,
      0,
      duration,
      duration,
      delay,
      easing,
      iterations,
      direction
    );

    if (tweens.length === 1) {
      this.callback = tweens[0].update.bind(tweens[0]);
    } else {
      tweens.sort(endTimeComparator);
      this.callback = this.updateTweens;
    }

    this.tweens = tweens;
  }

  updateTweens(time) {
    for (let index = 0, length = this.tweens.length; index < length; index++) {
      this.tweens[index].update(time);
    }
  }
}

var MultiTween_exports = {};
__defProp(MultiTween_exports, "__esModule", { value: true });
__defProp(MultiTween_exports, "default", {
  get: () => MultiTween,
  enumerable: true
});
module.exports = MultiTween_exports;
