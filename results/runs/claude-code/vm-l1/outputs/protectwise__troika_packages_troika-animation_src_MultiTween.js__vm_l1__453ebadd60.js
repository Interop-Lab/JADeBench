const { PI, pow, sqrt } = Math;
const HALF_PI = PI / 2;
const TWO_PI = PI * 2;

function makeInOut(easeIn, easeOut) {
  return (position) => position < 0.5
    ? easeIn(position * 2) / 2
    : easeOut(position * 2 - 1) / 2 + 0.5;
}
function makeExpIn(exponent) { return (position) => pow(position, exponent); }
function makeExpOut(exponent) { return (position) => 1 - pow(1 - position, exponent); }
function makeExpInOut(exponent) { return makeInOut(makeExpIn(exponent), makeExpOut(exponent)); }

const linear = (position) => position;
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
const easeInSine = (position) => 1 - Math.cos(position * HALF_PI);
const easeOutSine = (position) => Math.sin(position * HALF_PI);
const easeInOutSine = (position) => (1 - Math.cos(PI * position)) / 2;
const easeInExpo = (position) => position === 0 ? 0 : pow(2, 10 * position - 10);
const easeOutExpo = (position) => position === 1 ? 1 : 1 - pow(2, -10 * position);
const easeInOutExpo = (position) => {
  if (position === 0 || position === 1) return position;
  return position < 0.5
    ? pow(2, 20 * position - 10) / 2
    : (2 - pow(2, -20 * position + 10)) / 2;
};
const easeInCirc = (position) => 1 - sqrt(1 - pow(position, 2));
const easeOutCirc = (position) => sqrt(1 - pow(position - 1, 2));
const easeInOutCirc = makeInOut(easeInCirc, easeOutCirc);
const easeInElastic = (position) => {
  if (position === 0 || position === 1) return position;
  return -pow(2, 10 * position - 10) * Math.sin((position - 1.075) * TWO_PI / 0.3);
};
const easeOutElastic = (position) => {
  if (position === 0 || position === 1) return position;
  return pow(2, -10 * position) * Math.sin((position - 0.075) * TWO_PI / 0.3) + 1;
};
const easeInOutElastic = makeInOut(easeInElastic, easeOutElastic);
const easeInBack = (position) => 2.70158 * position ** 3 - 1.70158 * position ** 2;
const easeOutBack = (position) => 1 + 2.70158 * (position - 1) ** 3 + 1.70158 * (position - 1) ** 2;
const easeInOutBack = (position) => {
  const overshoot = 1.70158 * 1.525;
  return position < 0.5
    ? (2 * position) ** 2 * ((overshoot + 1) * 2 * position - overshoot) / 2
    : ((2 * position - 2) ** 2 * ((overshoot + 1) * (2 * position - 2) + overshoot) + 2) / 2;
};
const easeOutBounce = (position) => {
  const coefficient = 7.5625;
  const divisor = 2.75;
  if (position < 1 / divisor) return coefficient * position ** 2;
  if (position < 2 / divisor) { position -= 1.5 / divisor; return coefficient * position ** 2 + 0.75; }
  if (position < 2.5 / divisor) { position -= 2.25 / divisor; return coefficient * position ** 2 + 0.9375; }
  position -= 2.625 / divisor;
  return coefficient * position ** 2 + 0.984375;
};
const easeInBounce = (position) => 1 - easeOutBounce(1 - position);
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

function number(fromValue, toValue, position) {
  return fromValue + (toValue - fromValue) * position;
}
function rgbToNumber(red, green, blue) { return red << 16 | green << 8 | blue; }

let colorCanvas;
let colorContext;
let colorCache = Object.create(null);
let colorCacheSize = 0;
const COLOR_CACHE_LIMIT = 2048;
function colorValueToNumber(value) {
  if (typeof value === "number") return value;
  if (typeof value !== "string") return value && value.valueOf ? value.valueOf() : 0;
  if (value in colorCache) return colorCache[value];
  if (!colorCanvas) {
    colorCanvas = document.createElement("canvas");
    colorContext = colorCanvas.getContext("2d");
  }
  colorCanvas.width = colorCanvas.height = 1;
  colorContext.fillStyle = value;
  colorContext.fillRect(0, 0, 1, 1);
  const pixel = colorContext.getImageData(0, 0, 1, 1).data;
  const numericValue = rgbToNumber(pixel[0], pixel[1], pixel[2]);
  if (colorCacheSize > COLOR_CACHE_LIMIT) {
    colorCache = Object.create(null);
    colorCacheSize = 0;
  }
  colorCache[value] = numericValue;
  colorCacheSize++;
  return numericValue;
}
function color(fromValue, toValue, position) {
  const from = colorValueToNumber(fromValue);
  const to = colorValueToNumber(toValue);
  const red = number(from >> 16 & 255, to >> 16 & 255, position);
  const green = number(from >> 8 & 255, to >> 8 & 255, position);
  const blue = number(from & 255, to & 255, position);
  return rgbToNumber(red, green, blue);
}
const Interpolators = { color, number };
const maxSafeInteger = 0x1fffffffffffff;

class AbstractTween {
  gotoElapsedTime(elapsedTime) {}
  gotoEnd() {}
  isDoneAtElapsedTime(elapsedTime) {}
}
class Tween extends AbstractTween {
  constructor(callback, fromValue, toValue, duration = 750, delay = 0,
    easing = linear, iterations = 1, direction = "forward", interpolate = "number") {
    super();
    this.callback = callback;
    this.fromValue = fromValue;
    this.toValue = toValue;
    this.duration = duration;
    this.delay = delay;
    this.easing = typeof easing === "string" ? Easings[easing] : easing;
    this.iterations = iterations;
    this.direction = direction;
    this.interpolate = typeof interpolate === "function" ? interpolate : Interpolators[interpolate];
    this.totalElapsed = iterations === Infinity ? maxSafeInteger : delay + duration * iterations;
  }
  gotoElapsedTime(elapsedTime) {
    const activeTime = Math.min(Math.max(elapsedTime - this.delay, 0), this.totalElapsed - this.delay);
    const iteration = Math.ceil(activeTime / this.duration) || 1;
    let position = activeTime === 0 ? 0 : (activeTime - (iteration - 1) * this.duration) / this.duration;
    if (this.direction === "reverse" || (this.direction === "alternate" && iteration % 2 === 0)) {
      position = 1 - position;
    }
    const value = this.interpolate(this.fromValue, this.toValue, this.easing(position));
    if (this.callback) this.callback(value);
  }
  gotoEnd() { this.gotoElapsedTime(this.totalElapsed); }
  isDoneAtElapsedTime(elapsedTime) { return elapsedTime >= this.totalElapsed; }
}
function endTimeComparator(left, right) { return left.totalElapsed - right.totalElapsed; }
class MultiTween extends Tween {
  constructor(tweens, totalElapsed, delay, easing, iterations, direction) {
    if (typeof totalElapsed !== "number") {
      totalElapsed = tweens.reduce((maximum, tween) => Math.max(maximum, tween.totalElapsed), 0);
    }
    if (totalElapsed === Infinity) totalElapsed = Number.MAX_VALUE;
    super(null, 0, totalElapsed, totalElapsed, delay, easing, iterations, direction);
    this.tweens = tweens.sort(endTimeComparator);
    this.callback = this._syncTweens.bind(this);
  }
  _syncTweens(elapsedTime) {
    for (const tween of this.tweens) tween.gotoElapsedTime(elapsedTime);
  }
}

const MultiTweenExports = {};
Object.defineProperty(MultiTweenExports, "__esModule", { value: true });
Object.defineProperty(MultiTweenExports, "default", { enumerable: true, get: () => MultiTween });
module.exports = MultiTweenExports;
