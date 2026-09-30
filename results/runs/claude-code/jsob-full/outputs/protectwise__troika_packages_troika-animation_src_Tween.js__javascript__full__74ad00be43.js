"use strict";

var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, exports) => {
  for (var name in exports) {
    __defProp(target, name, { get: exports[name], enumerable: true });
  }
};
var __copyProps = (target, source, except, descriptor) => {
  if (source && (typeof source === "object" || typeof source === "function")) {
    for (let key of __getOwnPropNames(source)) {
      if (!__hasOwnProp.call(target, key) && key !== except) {
        __defProp(target, key, {
          get: () => source[key],
          enumerable: !(descriptor = __getOwnPropDesc(source, key)) || descriptor.enumerable,
        });
      }
    }
  }
  return target;
};
var __toCommonJS = (module) => __copyProps(__defProp({}, "__esModule", { value: true }), module);

var Tween_exports = {};
__export(Tween_exports, { default: () => Tween_default });
module.exports = __toCommonJS(Tween_exports);

const { pow, PI, sqrt } = Math;
const HALF_PI = PI / 2;
const TWO_PI = PI * 2;

function makeInOut(easeIn, easeOut) {
  return (progress) => progress < 0.5
    ? easeIn(progress * 2) * 0.5
    : easeOut(progress * 2 - 1) * 0.5 + 0.5;
}

function makeExpIn(exponent) {
  return (progress) => pow(progress, exponent);
}

function makeExpOut(exponent) {
  return (progress) => 1 - pow(1 - progress, exponent);
}

function makeExpInOut(exponent) {
  return (progress) => progress < 0.5
    ? pow(progress * 2, exponent) * 0.5
    : (1 - pow(1 - (progress * 2 - 1), exponent)) * 0.5 + 0.5;
}

const linear = (progress) => progress;
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
const easeInSine = (progress) => 1 - Math.cos(progress * HALF_PI);
const easeOutSine = (progress) => Math.sin(progress * HALF_PI);
const easeInOutSine = (progress) => -0.5 * (Math.cos(PI * progress) - 1);
const easeInExpo = (progress) => progress === 0 ? 0 : pow(2, 10 * (progress - 1));
const easeOutExpo = (progress) => progress === 1 ? 1 : 1 - pow(2, -10 * progress);
const easeInOutExpo = (progress) => {
  if (progress === 0 || progress === 1) return progress;
  return progress < 0.5
    ? pow(2, 10 * (progress * 2 - 1)) * 0.5
    : (2 - pow(2, -10 * (progress * 2 - 1))) * 0.5;
};
const easeInCirc = (progress) => 1 - sqrt(1 - progress * progress);
const easeOutCirc = (progress) => sqrt(1 - pow(progress - 1, 2));
const easeInOutCirc = makeInOut(easeInCirc, easeOutCirc);
const easeOutElastic = (progress) => {
  if (progress === 0 || progress === 1) return progress;
  return pow(2, -10 * progress) * Math.sin((progress - 0.075) * TWO_PI / 0.3) + 1;
};
const easeInElastic = (progress) => {
  if (progress === 0 || progress === 1) return progress;
  return 1 - easeOutElastic(1 - progress);
};
const easeInOutElastic = makeInOut(easeInElastic, easeOutElastic);
const easeInBack = (progress) => progress * progress * (2.70158 * progress - 1.70158);
const easeOutBack = (progress) => {
  progress -= 1;
  return progress * progress * (2.70158 * progress + 1.70158) + 1;
};
const easeInOutBack = (progress) => {
  const overshoot = 1.70158 * 1.525;
  progress *= 2;
  return progress < 1
    ? 0.5 * (progress * progress * ((overshoot + 1) * progress - overshoot))
    : 0.5 * ((progress -= 2) * progress * ((overshoot + 1) * progress + overshoot) + 2);
};
const easeOutBounce = (progress) => {
  if (progress < 1 / 2.75) return 7.5625 * progress * progress;
  if (progress < 2 / 2.75) return 7.5625 * (progress -= 1.5 / 2.75) * progress + 0.75;
  if (progress < 2.5 / 2.75) return 7.5625 * (progress -= 2.25 / 2.75) * progress + 0.9375;
  return 7.5625 * (progress -= 2.625 / 2.75) * progress + 0.984375;
};
const easeInBounce = (progress) => 1 - easeOutBounce(1 - progress);
const easeInOutBounce = makeInOut(easeInBounce, easeOutBounce);

const Easings = {
  easeInBack, easeInBounce, easeInCirc, easeInCubic, easeInElastic, easeInExpo,
  easeInOutBack, easeInOutBounce, easeInOutCirc, easeInOutCubic,
  easeInOutElastic, easeInOutExpo, easeInOutQuad, easeInOutQuart,
  easeInOutQuint, easeInOutSine, easeInQuad, easeInQuart, easeInQuint,
  easeInSine, easeOutBack, easeOutBounce, easeOutCirc, easeOutCubic,
  easeOutElastic, easeOutExpo, easeOutQuad, easeOutQuart, easeOutQuint,
  easeOutSine, linear,
};

function interpolateNumber(start, end, progress) {
  return start + (end - start) * progress;
}

function rgbToNumber(red, green, blue) {
  return (red << 16) ^ (green << 8) ^ blue;
}

const colorCacheLimit = 2048;
let colorCanvas;
let colorContext;
let colorCache = Object.create(null);
let colorCacheSize = 0;

function colorValueToNumber(value) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    if (value in colorCache) return colorCache[value];
    if (!colorCanvas) {
      colorCanvas = document.createElement("canvas");
      colorContext = colorCanvas.getContext("2d");
    }
    colorCanvas.width = colorCanvas.height = 1;
    colorContext.fillStyle = value;
    colorContext.fillRect(0, 0, 1, 1);
    const pixels = colorContext.getImageData(0, 0, 1, 1).data;
    const result = rgbToNumber(pixels[0], pixels[1], pixels[2]);
    if (colorCacheSize > colorCacheLimit) {
      colorCache = Object.create(null);
      colorCacheSize = 0;
    }
    colorCache[value] = result;
    colorCacheSize++;
    return result;
  }
  if (value && value.isColor) return value.getHex();
  return 0;
}

function interpolateColor(start, end, progress) {
  start = colorValueToNumber(start);
  end = colorValueToNumber(end);
  return rgbToNumber(
    interpolateNumber((start >> 16) & 255, (end >> 16) & 255, progress),
    interpolateNumber((start >> 8) & 255, (end >> 8) & 255, progress),
    interpolateNumber(start & 255, end & 255, progress),
  );
}

const Interpolators = { color: interpolateColor, number: interpolateNumber };

class AbstractTween {
  gotoElapsedTime(_elapsedTime) {}
  gotoEnd() {}
  isDoneAtElapsedTime(_elapsedTime) {}
}

const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER;

class Tween extends AbstractTween {
  constructor(callback, fromValue, toValue, duration = 750, delay = 0, easing = linear, iterations = 1, direction = "forward", interpolate = "number") {
    super();
    this.callback = callback;
    this.fromValue = fromValue;
    this.toValue = toValue;
    this.duration = duration;
    this.delay = delay;
    this.easing = typeof easing === "string" ? Easings[easing] || linear : easing;
    this.iterations = iterations;
    this.direction = direction;
    this.interpolate = typeof interpolate === "function"
      ? interpolate
      : Interpolators[interpolate] || interpolateNumber;
    this.totalElapsed = iterations < MAX_SAFE_INTEGER
      ? delay + duration * iterations
      : MAX_SAFE_INTEGER;
  }

  gotoElapsedTime(elapsedTime) {
    const delay = this.delay;
    const duration = this.duration;
    if (elapsedTime >= delay) {
      elapsedTime = Math.min(elapsedTime, this.totalElapsed) - delay;
      let progress = (elapsedTime % duration) / duration;
      if (progress === 0 && elapsedTime > 0) progress = 1;
      progress = this.easing(progress);
      if (this.direction === "reverse" ||
          (this.direction === "alternate" && Math.ceil(elapsedTime / duration) % 2 === 0)) {
        progress = 1 - progress;
      }
      this.callback(this.interpolate(this.fromValue, this.toValue, progress));
    }
  }

  gotoEnd() {
    this.gotoElapsedTime(this.totalElapsed);
  }

  isDoneAtElapsedTime(elapsedTime) {
    return elapsedTime > this.totalElapsed;
  }
}

var Tween_default = Tween;
