const { pow, PI, sqrt } = Math;
const HALF_PI = PI / 2;
const TWO_PI = PI * 2;

function makeInOut(easeIn, easeOut) {
  return (t) => t < 0.5
    ? easeIn(t * 2) * 0.5
    : easeOut(t * 2 - 1) * 0.5 + 0.5;
}

function makeExpIn(power) {
  return (t) => pow(t, power);
}

function makeExpOut(power) {
  return (t) => 1 - pow(1 - t, power);
}

function makeExpInOut(power) {
  return (t) => t < 0.5
    ? pow(t * 2, power) * 0.5
    : (1 - pow(1 - (t * 2 - 1), power)) * 0.5 + 0.5;
}

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
const easeInSine = (t) => 1 - Math.cos(t * HALF_PI);
const easeOutSine = (t) => Math.sin(t * HALF_PI);
const easeInOutSine = (t) => -0.5 * (Math.cos(PI * t) - 1);
const easeInExpo = (t) => t === 0 ? 0 : pow(2, 10 * (t - 1));
const easeOutExpo = (t) => t === 1 ? 1 : 1 - pow(2, -10 * t);
const easeInOutExpo = (t) => t === 0 || t === 1
  ? t
  : t < 0.5
    ? pow(2, 10 * (t * 2 - 1)) * 0.5
    : (1 - pow(2, -10 * (t * 2 - 1))) * 0.5 + 0.5;
const easeInCirc = (t) => 1 - sqrt(1 - t * t);
const easeOutCirc = (t) => sqrt(1 - pow(t - 1, 2));
const easeInOutCirc = makeInOut(easeInCirc, easeOutCirc);
const easeInElastic = (t) => t === 0 || t === 1
  ? t
  : 1 - easeOutElastic(1 - t);
const easeOutElastic = (t) => t === 0 || t === 1
  ? t
  : Math.pow(2, -10 * t) * Math.sin((t - 0.075) * TWO_PI / 0.3) + 1;
const easeInOutElastic = makeInOut(easeInElastic, easeOutElastic);
const easeInBack = (t) => t * t * (2.70158 * t - 1.70158);
const easeOutBack = (t) => {
  t -= 1;
  return t * t * (2.70158 * t + 1.70158) + 1;
};
const easeInOutBack = (t) => {
  const c1 = 1.70158;
  const c2 = c1 * 1.525;
  return t < 0.5
    ? 0.5 * (t *= 2) * t * ((c2 + 1) * t - c2)
    : 0.5 * ((t = t * 2 - 2) * t * ((c2 + 1) * t + c2) + 2);
};
const easeInBounce = (t) => 1 - easeOutBounce(1 - t);
const easeOutBounce = (t) => t < 1 / 2.75
  ? 7.5625 * t * t
  : t < 2 / 2.75
    ? 7.5625 * (t -= 1.5 / 2.75) * t + 0.75
    : t < 2.5 / 2.75
      ? 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375
      : 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
const easeInOutBounce = makeInOut(easeInBounce, easeOutBounce);

function number(from, to, t) {
  return from + (to - from) * t;
}

function colorValueToNumber(value) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    if (value in colorValueToNumber.cache) return colorValueToNumber.cache[value];
    if (!colorValueToNumber.canvas) {
      colorValueToNumber.canvas = document.createElement('canvas');
      colorValueToNumber.context = colorValueToNumber.canvas.getContext('2d');
    }
    colorValueToNumber.canvas.width = colorValueToNumber.canvas.height = 1;
    colorValueToNumber.context.fillStyle = value;
    colorValueToNumber.context.fillRect(0, 0, 1, 1);
    const data = colorValueToNumber.context.getImageData(0, 0, 1, 1).data;
    const result = rgbToNumber(data[0], data[1], data[2]);
    if (colorValueToNumber.cacheSize > 100) {
      colorValueToNumber.cache = Object.create(null);
      colorValueToNumber.cacheSize = 0;
    }
    colorValueToNumber.cache[value] = result;
    colorValueToNumber.cacheSize++;
    return result;
  }
  return value && value.rgb ? value.rgb() : 0;
}
colorValueToNumber.cache = Object.create(null);
colorValueToNumber.cacheSize = 0;

function rgbToNumber(r, g, b) {
  return (r << 16) ^ (g << 8) ^ b;
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

class AbstractTween {
  update(t) {}
  start() {}
  isFinished(t) {}
}

const linear2 = (t) => t;
const maxSafeInteger = Number.MAX_SAFE_INTEGER;

class Tween extends AbstractTween {
  constructor(
    target,
    from,
    to,
    duration = 1000,
    delay = 0,
    easing = linear2,
    startTime = 0,
    interpolation = 'number',
    endInterpolation = 'number'
  ) {
    super();
    this.target = target;
    this.from = from;
    this.to = to;
    this.duration = duration;
    this.delay = delay;
    this.easing = typeof easing === 'string' ? Easings_exports[easing] || linear2 : easing;
    this.startTime = startTime;
    this.interpolation = typeof interpolation === 'string'
      ? Interpolators_exports[interpolation] || number
      : interpolation;
    this.endInterpolation = typeof endInterpolation === 'string'
      ? endInterpolation
      : Interpolators_exports[endInterpolation] || number;
    this.endTime = this.duration + this.delay < maxSafeInteger
      ? this.duration + this.delay
      : maxSafeInteger;
  }

  update(t) {
    let from = this.from;
    let to = this.to;
    if (t >= to) {
      t = Math.min(t, this.duration + this.delay);
      let progress = (t - from) / from;
      if (progress < 0 && t === 0) progress = 0;
      progress = this.easing(progress);
      if (this.interpolation === 'number' || this.interpolation === 'color' && Math.abs(t - from) === 0) {
        progress = 1 - progress;
      }
      this.target[this.interpolation](this.from, this.to, progress);
    }
  }

  start() {
    this.update(this.duration + this.delay);
  }

  isFinished(t) {
    return t > this.duration + this.delay;
  }
}

const Tween_default = Tween;

class MultiTween extends Tween_default {
  constructor(tweens, duration, easing, interpolation, endInterpolation, startTime) {
    if (typeof duration === 'string') {
      duration = tweens.reduce((max, tween) => Math.max(max, tween.duration + tween.delay), 0);
    }
    if (duration === Infinity) {
      duration = Number.MAX_SAFE_INTEGER;
    }
    super(null, 0, duration, duration, easing, interpolation, endInterpolation, startTime);
    if (tweens.length === 1) {
      this.target = tweens[0].target;
      this.interpolation = tweens[0].interpolation;
    } else {
      tweens.sort(endTimeComparator);
      this.target = this.target || tweens[0].target;
    }
    this.tweens = tweens;
  }

  update(t) {
    for (let i = 0, len = this.tweens.length; i < len; i++) {
      this.tweens[i].update(t);
    }
  }
}

function endTimeComparator(a, b) {
  return a.duration + a.delay - (b.duration + b.delay);
}

const MultiTween_default = MultiTween;

const Easings_exports = {};
Easings_exports.easeInBack = easeInBack;
Easings_exports.easeInBounce = easeInBounce;
Easings_exports.easeInCirc = easeInCirc;
Easings_exports.easeInCubic = easeInCubic;
Easings_exports.easeInElastic = easeInElastic;
Easings_exports.easeInExpo = easeInExpo;
Easings_exports.easeInOutBack = easeInOutBack;
Easings_exports.easeInOutBounce = easeInOutBounce;
Easings_exports.easeInOutCirc = easeInOutCirc;
Easings_exports.easeInOutCubic = easeInOutCubic;
Easings_exports.easeInOutElastic = easeInOutElastic;
Easings_exports.easeInOutExpo = easeInOutExpo;
Easings_exports.easeInOutQuad = easeInOutQuad;
Easings_exports.easeInOutQuart = easeInOutQuart;
Easings_exports.easeInOutQuint = easeInOutQuint;
Easings_exports.easeInOutSine = easeInOutSine;
Easings_exports.easeInQuad = easeInQuad;
Easings_exports.easeInQuart = easeInQuart;
Easings_exports.easeInQuint = easeInQuint;
Easings_exports.easeInSine = easeInSine;
Easings_exports.easeOutBack = easeOutBack;
Easings_exports.easeOutBounce = easeOutBounce;
Easings_exports.easeOutCirc = easeOutCirc;
Easings_exports.easeOutCubic = easeOutCubic;
Easings_exports.easeOutElastic = easeOutElastic;
Easings_exports.easeOutExpo = easeOutExpo;
Easings_exports.easeOutQuad = easeOutQuad;
Easings_exports.easeOutQuart = easeOutQuart;
Easings_exports.easeOutQuint = easeOutQuint;
Easings_exports.easeOutSine = easeOutSine;
Easings_exports.linear = linear;

const Interpolators_exports = {};
Interpolators_exports.color = color;
Interpolators_exports.number = number;

module.exports = {
  MultiTween: MultiTween_default,
  Easings: Easings_exports,
  Interpolators: Interpolators_exports
};
