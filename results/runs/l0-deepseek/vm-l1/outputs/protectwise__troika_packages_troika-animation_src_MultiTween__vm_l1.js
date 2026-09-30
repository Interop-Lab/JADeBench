const globalObject = typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : typeof global !== 'undefined' ? global : typeof window !== 'undefined' ? window : void 0;
const moduleContext = globalObject['vm_0x91748b_62934a'] || (globalObject['vm_0x91748b_62934a'] = {});
(function() {
  if (!moduleContext['module']) try { moduleContext['module'] = module; } catch (_) {}
  if (!moduleContext['exports']) try { moduleContext['exports'] = exports; } catch (_) {}
  if (!moduleContext['require']) try { moduleContext['require'] = require; } catch (_) {}
  if (!moduleContext['__dirname']) try { moduleContext['__dirname'] = __dirname; } catch (_) {}
  if (!moduleContext['__filename']) try { moduleContext['__filename'] = __filename; } catch (_) {}
})();

const { pow, PI, sqrt } = Math;
const HALF_PI = PI / 2;
const TWO_PI = PI * 2;

function makeInOut(easeIn, easeOut) {
  return function(t) {
    return t < 0.5 ? easeIn(t * 2) / 2 : 0.5 + easeOut((t - 0.5) * 2) / 2;
  };
}

function makeExpIn(power) {
  return function(t) {
    return pow(t, power);
  };
}

function makeExpOut(power) {
  return function(t) {
    return 1 - pow(1 - t, power);
  };
}

function makeExpInOut(power) {
  return function(t) {
    return t < 0.5 ? pow(t * 2, power) / 2 : 1 - pow((1 - t) * 2, power) / 2;
  };
}

const linear = t => t;
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

const easeInSine = t => 1 - Math.cos(t * HALF_PI);
const easeOutSine = t => Math.sin(t * HALF_PI);
const easeInOutSine = t => (1 - Math.cos(t * PI)) / 2;

const easeInExpo = t => t === 0 ? 0 : pow(2, 10 * t - 10);
const easeOutExpo = t => t === 1 ? 1 : 1 - pow(2, -10 * t);
const easeInOutExpo = t => {
  if (t === 0) return 0;
  if (t === 1) return 1;
  return t < 0.5 ? pow(2, 20 * t - 10) / 2 : (2 - pow(2, -20 * t + 10)) / 2;
};

const easeInCirc = t => 1 - sqrt(1 - t * t);
const easeOutCirc = t => sqrt(1 - (t - 1) * (t - 1));
const easeInOutCirc = makeInOut(easeInCirc, easeOutCirc);

const easeInElastic = t => {
  if (t === 0) return 0;
  if (t === 1) return 1;
  return -pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * (2 * PI / 3));
};
const easeOutElastic = t => {
  if (t === 0) return 0;
  if (t === 1) return 1;
  return pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * PI / 3)) + 1;
};
const easeInOutElastic = makeInOut(easeInElastic, easeOutElastic);

const easeInBack = t => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return c3 * t * t * t - c1 * t * t;
};
const easeOutBack = t => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
const easeInOutBack = t => {
  const c1 = 1.70158;
  const c2 = c1 * 1.525;
  return t < 0.5
    ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
    : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
};

const easeInBounce = t => 1 - easeOutBounce(1 - t);
const easeOutBounce = t => {
  const n1 = 7.5625;
  const d1 = 2.75;
  if (t < 1 / d1) return n1 * t * t;
  if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
  if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
  return n1 * (t -= 2.625 / d1) * t + 0.984375;
};
const easeInOutBounce = makeInOut(easeInBounce, easeOutBounce);

function number(from, to, t) {
  return from + (to - from) * t;
}

function color(from, to, t) {
  const fromNumber = colorValueToNumber(from);
  const toNumber = colorValueToNumber(to);
  const value = number(fromNumber, toNumber, t);
  return '#' + Math.round(value).toString(16).padStart(6, '0');
}

const colorValueToNumber = (function() {
  let canvas, context;
  let cache = Object.create(null);
  let cacheSize = 0;
  const MAX_CACHE = 2048;
  return function(value) {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      if (value in cache) return cache[value];
      if (!canvas) {
        canvas = document.createElement('canvas');
        context = canvas.getContext('2d');
      }
      canvas.width = canvas.height = 1;
      context.fillStyle = value;
      context.fillRect(0, 0, 1, 1);
      const data = context.getImageData(0, 0, 1, 1).data;
      const result = rgbToNumber(data[0], data[1], data[2]);
      if (cacheSize > MAX_CACHE) {
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

function rgbToNumber(r, g, b) {
  return (r << 16) | (g << 8) | b;
}

class AbstractTween {
  gotoElapsedTime(_elapsed) {}
  gotoEnd() {}
  isDoneAtElapsedTime(_elapsed) {}
}

const linear2 = t => t;
const maxSafeInteger = 0x1fffffffffffff;

class Tween extends AbstractTween {
  constructor(target, from, to, duration = 750, delay = 0, easing = linear2, loops = 1, loopType = 'forward', interpolation = 'number') {
    super();
    this.target = target;
    this.from = from;
    this.to = to;
    this.duration = duration;
    this.delay = delay;
    this.easing = easing;
    this.loops = loops;
    this.loopType = loopType;
    this.interpolation = interpolation;
    this.elapsed = 0;
    this.done = false;
  }

  gotoElapsedTime(elapsed) {
    this.elapsed = elapsed;
    this.done = elapsed >= this.delay + this.duration * this.loops;
  }

  gotoEnd() {
    this.gotoElapsedTime(this.delay + this.duration * this.loops);
  }

  isDoneAtElapsedTime(elapsed) {
    return elapsed >= this.delay + this.duration * this.loops;
  }
}

class MultiTween extends Tween {
  constructor(tweens, duration, delay, easing, loops, loopType) {
    if (typeof duration !== 'number') {
      duration = tweens.reduce((max, tween) => Math.max(max, tween.totalElapsed), 0);
    }
    if (duration === Infinity) duration = Number.MAX_VALUE;
    super(null, 0, duration, duration, delay, easing, loops, loopType);
    this.tweens = tweens;
  }

  gotoElapsedTime(elapsed) {
    super.gotoElapsedTime(elapsed);
    for (const tween of this.tweens) {
      tween.gotoElapsedTime(elapsed);
    }
  }
}

function endTimeComparator(a, b) {
  return a.totalElapsed - b.totalElapsed;
}

const Easings = {
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

const Interpolators = { color, number };

module.exports = {
  Easings,
  Interpolators,
  Tween,
  MultiTween,
  AbstractTween,
  endTimeComparator,
  rgbToNumber,
  colorValueToNumber,
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
  makeInOut,
  makeExpIn,
  makeExpOut,
  makeExpInOut
};
