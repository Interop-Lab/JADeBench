const {pow, PI, sqrt} = Math;

const HALF_PI = PI / 2;
const TWO_PI = PI * 2;
const MAX_SAFE_INTEGER = 9007199254740991;

function makeInOut(easeIn, easeOut) {
  return progress => progress < 0.5
    ? easeIn(progress * 2) * 0.5
    : easeOut(progress * 2 - 1) * 0.5 + 0.5;
}

function makeExpIn(power) {
  return progress => pow(progress, power);
}

function makeExpOut(power) {
  return progress => 1 - pow(1 - progress, power);
}

function makeExpInOut(power) {
  return progress => progress < 0.5
    ? pow(progress * 2, power) * 0.5
    : (1 - pow(1 - (progress * 2 - 1), power)) * 0.5 + 0.5;
}

const linear = progress => progress;
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
const easeInSine = progress => 1 - Math.cos(progress * HALF_PI);
const easeOutSine = progress => Math.sin(progress * HALF_PI);
const easeInOutSine = progress => -0.5 * (Math.cos(PI * progress) - 1);
const easeInExpo = progress => progress === 0
  ? 0
  : pow(2, 10 * (progress - 1));
const easeOutExpo = progress => progress === 1
  ? 1
  : 1 - pow(2, -10 * progress);
const easeInOutExpo = progress => {
  if (progress === 0 || progress === 1) return progress;
  return progress < 0.5
    ? pow(2, 10 * (progress * 2 - 1)) * 0.5
    : (1 - pow(2, -10 * (progress * 2 - 1))) * 0.5 + 0.5;
};
const easeInCirc = progress => 1 - sqrt(1 - progress * progress);
const easeOutCirc = progress => sqrt(1 - pow(progress - 1, 2));
const easeInOutCirc = makeInOut(easeInCirc, easeOutCirc);
const easeInElastic = progress => progress === 0 || progress === 1
  ? progress
  : 1 - easeOutElastic(1 - progress);
const easeOutElastic = progress => progress === 0 || progress === 1
  ? progress
  : Math.pow(2, -10 * progress) * Math.sin((progress - 0.075) * TWO_PI / 0.3) + 1;
const easeInOutElastic = makeInOut(easeInElastic, easeOutElastic);
const easeInBack = progress => progress * progress * (2.70158 * progress - 1.70158);
const easeOutBack = progress => {
  progress -= 1;
  return progress * progress * (2.70158 * progress + 1.70158) + 1;
};
const easeInOutBack = progress => {
  const overshoot = 2.5949095;
  progress *= 2;
  if (progress < 1) {
    return 0.5 * progress * progress * ((overshoot + 1) * progress - overshoot);
  }
  progress -= 2;
  return 0.5 * (progress * progress * ((overshoot + 1) * progress + overshoot) + 2);
};
const easeInBounce = progress => 1 - easeOutBounce(1 - progress);
const easeOutBounce = progress => {
  if (progress < 0.36363636363636365) {
    return 7.5625 * progress * progress;
  }
  if (progress < 0.7272727272727273) {
    progress -= 0.5454545454545454;
    return 7.5625 * progress * progress + 0.75;
  }
  if (progress < 0.9090909090909091) {
    progress -= 0.8181818181818182;
    return 7.5625 * progress * progress + 0.9375;
  }
  progress -= 0.9545454545454546;
  return 7.5625 * progress * progress + 0.984375;
};
const easeInOutBounce = makeInOut(easeInBounce, easeOutBounce);

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
  linear,
};

function interpolateNumber(from, to, progress) {
  return from + (to - from) * progress;
}

function rgbToNumber(red, green, blue) {
  return (red << 16) ^ (green << 8) ^ blue;
}

const colorValueToNumber = (() => {
  let canvas;
  let context;
  const cache = Object.create(null);

  return value => {
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
      const pixel = context.getImageData(0, 0, 1, 1).data;
      const color = rgbToNumber(pixel[0], pixel[1], pixel[2]);
      cache[value] = color;
      return color;
    }

    if (value && value.isColor) return value.getHex();
    return 0;
  };
})();

function interpolateColor(from, to, progress) {
  const fromColor = colorValueToNumber(from);
  const toColor = colorValueToNumber(to);
  return rgbToNumber(
    interpolateNumber((fromColor >> 16) & 255, (toColor >> 16) & 255, progress),
    interpolateNumber((fromColor >> 8) & 255, (toColor >> 8) & 255, progress),
    interpolateNumber(fromColor & 255, toColor & 255, progress),
  );
}

const Interpolators = {
  color: interpolateColor,
  number: interpolateNumber,
};
const defaultEasing = progress => progress;

class AbstractTween {
  gotoElapsedTime(elapsedTime) {}
  gotoEnd() {}
  isDoneAtElapsedTime(elapsedTime) {}
}

class Tween extends AbstractTween {
  constructor(
    callback,
    fromValue,
    toValue,
    duration = 750,
    delay = 0,
    easing = defaultEasing,
    iterations = 1,
    direction = 'forward',
    interpolator = 'number',
  ) {
    super();
    this.callback = callback;
    this.fromValue = fromValue;
    this.toValue = toValue;
    this.duration = duration;
    this.delay = delay;
    this.easing = typeof easing === 'string' ? Easings[easing] || defaultEasing : easing;
    this.iterations = iterations;
    this.direction = direction;
    this.interpolate = typeof interpolator === 'function'
      ? interpolator
      : Interpolators[interpolator] || interpolateNumber;
    this.totalElapsed = iterations < MAX_SAFE_INTEGER
      ? delay + duration * iterations
      : MAX_SAFE_INTEGER;
  }

  gotoElapsedTime(elapsedTime) {
    const duration = this.duration;
    const delay = this.delay;
    if (elapsedTime < delay) return;

    elapsedTime = Math.min(elapsedTime, this.totalElapsed) - delay;
    let progress = (elapsedTime % duration) / duration;
    if (progress === 0 && elapsedTime !== 0) progress = 1;

    progress = this.easing(progress);
    const shouldReverse = this.direction === 'reverse' ||
      (this.direction === 'alternate' && Math.ceil(elapsedTime / duration) % 2 === 0);
    if (shouldReverse) progress = 1 - progress;

    this.callback(this.interpolate(this.fromValue, this.toValue, progress));
  }

  gotoEnd() {
    this.gotoElapsedTime(this.totalElapsed);
  }

  isDoneAtElapsedTime(elapsedTime) {
    return elapsedTime > this.totalElapsed;
  }
}

const tweenExports = {};
Object.defineProperty(tweenExports, '__esModule', {value: true});
Object.defineProperty(tweenExports, 'default', {
  enumerable: true,
  get: () => Tween,
});
module.exports = tweenExports;
