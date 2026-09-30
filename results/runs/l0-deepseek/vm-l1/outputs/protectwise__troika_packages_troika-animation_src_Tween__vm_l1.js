const __defProp = Object.defineProperty;
const __getOwnPropDesc = Object.getOwnPropertyDescriptor;
const __getOwnPropNames = Object.getOwnPropertyNames;
const __hasOwnProp = Object.prototype.hasOwnProperty;
const __export = (target, all) => {
  for (const name in all) {
    __defProp(target, name, { get: all[name], enumerable: true });
  }
};
const __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (const key of __getOwnPropNames(from)) {
      if (!__hasOwnProp.call(to, key) && key !== except) {
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
    }
  }
  return to;
};
const __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

var Tween_exports = {};
__export(Tween_exports, {
  default: () => Tween_default
});

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
  return (t) => t < 0.5 ? fnIn(t * 2) / 2 : 0.5 + fnOut(t * 2 - 1) / 2;
}

function makeExpIn(power) {
  return (t) => pow(t, power);
}

function makeExpOut(power) {
  return (t) => 1 - pow(1 - t, power);
}

function makeExpInOut(power) {
  return (t) => t < 0.5 ? pow(t * 2, power) / 2 : 1 - pow(2 - t * 2, power) / 2;
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
var easeInOutSine = (t) => (1 - Math.cos(t * PI)) / 2;

var easeInExpo = (t) => t === 0 ? 0 : pow(2, 10 * (t - 1));
var easeOutExpo = (t) => t === 1 ? 1 : 1 - pow(2, -10 * t);
var easeInOutExpo = (t) => {
  if (t === 0 || t === 1) return t;
  return t < 0.5 ? pow(2, 20 * t - 10) / 2 : 1 - pow(2, 10 - 20 * t) / 2;
};

var easeInCirc = (t) => 1 - sqrt(1 - t * t);
var easeOutCirc = (t) => sqrt(1 - (t - 1) * (t - 1));
var easeInOutCirc = makeInOut(easeInCirc, easeOutCirc);

var easeInElastic = (t) => {
  if (t === 0 || t === 1) return t;
  return -pow(2, 10 * (t - 1)) * Math.sin((t - 1.1) * 5 * PI);
};
var easeOutElastic = (t) => {
  if (t === 0 || t === 1) return t;
  return pow(2, -10 * t) * Math.sin((t - 0.1) * 5 * PI) + 1;
};
var easeInOutElastic = makeInOut(easeInElastic, easeOutElastic);

var easeInBack = (t) => t * t * (2.70158 * t - 1.70158);
var easeOutBack = (t) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
var easeInOutBack = (t) => {
  const c1 = 1.70158;
  const c2 = c1 * 1.525;
  return t < 0.5
    ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
    : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
};

var easeInBounce = (t) => 1 - easeOutBounce(1 - t);
var easeOutBounce = (t) => {
  const n1 = 7.5625;
  const d1 = 2.75;
  if (t < 1 / d1) {
    return n1 * t * t;
  } else if (t < 2 / d1) {
    return n1 * (t -= 1.5 / d1) * t + 0.75;
  } else if (t < 2.5 / d1) {
    return n1 * (t -= 2.25 / d1) * t + 0.9375;
  } else {
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  }
};
var easeInOutBounce = makeInOut(easeInBounce, easeOutBounce);

var Interpolators_exports = {};
__export(Interpolators_exports, {
  color: () => color,
  number: () => number
});

function number(from, to, t) {
  return from + (to - from) * t;
}

function color(from, to, t) {
  const fromNumber = colorValueToNumber(from);
  const toNumber = colorValueToNumber(to);
  const value = number(fromNumber, toNumber, t);
  return {
    r: (value >> 16) & 0xff,
    g: (value >> 8) & 0xff,
    b: value & 0xff,
    isColor: true,
    getHex() {
      return `#${((1 << 24) + (this.r << 16) + (this.g << 8) + this.b).toString(16).slice(1)}`;
    }
  };
}

var colorValueToNumber = (function() {
  let canvas, ctx;
  let cache = Object.create(null);
  let cacheSize = 0;
  const MAX_CACHE = 2048;
  return function(value) {
    if (typeof value === "number") return value;
    else if (typeof value === "string") {
      if (value in cache) return cache[value];
      if (!canvas) {
        canvas = document.createElement("canvas");
        ctx = canvas.getContext("2d");
      }
      canvas.width = canvas.height = 1;
      ctx.fillStyle = value;
      ctx.fillRect(0, 0, 1, 1);
      const data = ctx.getImageData(0, 0, 1, 1).data;
      const result = rgbToNumber(data[0], data[1], data[2]);
      if (cacheSize > MAX_CACHE) {
        cache = Object.create(null);
        cacheSize = 0;
      }
      cache[value] = result;
      cacheSize++;
      return result;
    } else {
      return value && value.isColor ? value.getHex() : 0;
    }
  };
})();

function rgbToNumber(r, g, b) {
  return (r << 16) + (g << 8) + b;
}

var AbstractTween = class {
  gotoElapsedTime(elapsed) {}
  gotoEnd() {}
  isDoneAtElapsedTime(elapsed) {}
};

var linear2 = (t) => t;
var maxSafeInteger = 0x1fffffffffffff;

var Tween = class extends AbstractTween {
  constructor(target, from, to, duration = 750, delay = 0, easing = linear2, repeat = 1, direction = "forward", type = "number") {
    super();
    this.target = target;
    this.from = from;
    this.to = to;
    this.duration = duration;
    this.delay = delay;
    this.easing = easing;
    this.repeat = repeat;
    this.direction = direction;
    this.type = type;
    this.elapsed = 0;
    this.done = false;
  }
  gotoElapsedTime(elapsed) {
    this.elapsed = elapsed;
    this.done = elapsed >= this.duration + this.delay;
  }
  gotoEnd() {
    this.gotoElapsedTime(this.duration + this.delay);
  }
  isDoneAtElapsedTime(elapsed) {
    return elapsed >= this.duration + this.delay;
  }
};

var Tween_default = Tween;

module.exports = __toCommonJS(Tween_exports);
