"use strict";

// Easing functions used by Tween when an easing is supplied by name.
const linear = value => value;
const makeIn = exponent => value => Math.pow(value, exponent);
const makeOut = exponent => value => 1 - Math.pow(1 - value, exponent);
const makeInOutExponent = exponent => value =>
  value < 0.5
    ? Math.pow(value * 2, exponent) / 2
    : (1 - Math.pow(1 - (value * 2 - 1), exponent)) / 2 + 0.5;
const makeInOut = (easeIn, easeOut) => value =>
  value < 0.5 ? easeIn(value * 2) / 2 : easeOut(value * 2 - 1) / 2 + 0.5;

const easeInQuad = makeIn(2);
const easeOutQuad = makeOut(2);
const easeInOutQuad = makeInOutExponent(2);
const easeInCubic = makeIn(3);
const easeOutCubic = makeOut(3);
const easeInOutCubic = makeInOutExponent(3);
const easeInQuart = makeIn(4);
const easeOutQuart = makeOut(4);
const easeInOutQuart = makeInOutExponent(4);
const easeInQuint = makeIn(5);
const easeOutQuint = makeOut(5);
const easeInOutQuint = makeInOutExponent(5);
const easeInSine = value => 1 - Math.cos(value * Math.PI / 2);
const easeOutSine = value => Math.sin(value * Math.PI / 2);
const easeInOutSine = value => -(Math.cos(Math.PI * value) - 1) / 2;
const easeInExpo = value => value === 0 ? 0 : Math.pow(2, 10 * (value - 1));
const easeOutExpo = value => value === 1 ? 1 : 1 - Math.pow(2, -10 * value);
const easeInOutExpo = value => {
  if (value === 0 || value === 1) return value;
  return value < 0.5
    ? Math.pow(2, 10 * (value * 2 - 1)) / 2
    : (2 - Math.pow(2, -10 * (value * 2 - 1))) / 2;
};
const easeInCirc = value => 1 - Math.sqrt(1 - value * value);
const easeOutCirc = value => Math.sqrt(1 - Math.pow(value - 1, 2));
const easeInOutCirc = makeInOut(easeInCirc, easeOutCirc);
const easeOutElastic = value => {
  if (value === 0 || value === 1) return value;
  return Math.pow(2, -10 * value) * Math.sin((value - 0.075) * Math.PI * 2 / 0.3) + 1;
};
const easeInElastic = value =>
  value === 0 || value === 1 ? value : 1 - easeOutElastic(1 - value);
const easeInOutElastic = makeInOut(easeInElastic, easeOutElastic);
const easeInBack = value => value * value * (2.70158 * value - 1.70158);
const easeOutBack = value => {
  value -= 1;
  return value * value * (2.70158 * value + 1.70158) + 1;
};
const easeInOutBack = value => {
  const overshoot = 1.70158 * 1.525;
  value *= 2;
  return value < 1
    ? 0.5 * (value * value * ((overshoot + 1) * value - overshoot))
    : 0.5 * ((value -= 2) * value * ((overshoot + 1) * value + overshoot) + 2);
};
const easeOutBounce = value => {
  if (value < 1 / 2.75) return 7.5625 * value * value;
  if (value < 2 / 2.75) return 7.5625 * (value -= 1.5 / 2.75) * value + 0.75;
  if (value < 2.5 / 2.75) return 7.5625 * (value -= 2.25 / 2.75) * value + 0.9375;
  return 7.5625 * (value -= 2.625 / 2.75) * value + 0.984375;
};
const easeInBounce = value => 1 - easeOutBounce(1 - value);
const easeInOutBounce = makeInOut(easeInBounce, easeOutBounce);

const Easings = {
  linear,
  easeInBack, easeInBounce, easeInCirc, easeInCubic, easeInElastic, easeInExpo,
  easeInQuad, easeInQuart, easeInQuint, easeInSine,
  easeOutBack, easeOutBounce, easeOutCirc, easeOutCubic, easeOutElastic,
  easeOutExpo, easeOutQuad, easeOutQuart, easeOutQuint, easeOutSine,
  easeInOutBack, easeInOutBounce, easeInOutCirc, easeInOutCubic,
  easeInOutElastic, easeInOutExpo, easeInOutQuad, easeInOutQuart,
  easeInOutQuint, easeInOutSine
};

const number = (from, to, progress) => from + (to - from) * progress;

class AbstractTween {
  gotoElapsedTime(_elapsedTime) {}
  gotoEnd() {}
  isDoneAtElapsedTime(_elapsedTime) {}
}

class Tween extends AbstractTween {
  constructor(
    callback,
    fromValue,
    toValue,
    duration = 750,
    delay = 0,
    easing = linear,
    iterations = 1,
    direction = "forward",
    interpolate = number
  ) {
    super();
    this.callback = callback;
    this.fromValue = fromValue;
    this.toValue = toValue;
    this.duration = duration;
    this.delay = delay;
    this.easing = typeof easing === "string" ? Easings[easing] || linear : easing;
    this.iterations = iterations;
    this.direction = direction;
    this.interpolate = typeof interpolate === "function" ? interpolate : number;
    this.totalElapsed = iterations < Number.MAX_SAFE_INTEGER
      ? delay + duration * iterations
      : Number.MAX_SAFE_INTEGER;
  }

  gotoElapsedTime(elapsedTime) {
    const duration = this.duration;
    const delay = this.delay;
    if (elapsedTime >= delay) {
      elapsedTime = Math.min(elapsedTime, this.totalElapsed) - delay;
      let progress = (elapsedTime % duration) / duration;
      if (progress === 0 && elapsedTime !== 0) progress = 1;
      progress = this.easing(progress);
      if (
        this.direction === "reverse" ||
        (this.direction === "alternate" && Math.floor(elapsedTime / duration) % 2 === 1)
      ) {
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

function endTimeComparator(left, right) {
  return left.totalElapsed - right.totalElapsed;
}

class MultiTween extends Tween {
  constructor(tweens, totalElapsed, delay, easing, iterations, direction) {
    if (typeof totalElapsed !== "number") {
      totalElapsed = tweens.reduce(
        (maximum, tween) => Math.max(maximum, tween.totalElapsed),
        0
      );
    }
    if (totalElapsed === Infinity) totalElapsed = Number.MAX_VALUE;

    super(null, 0, totalElapsed, totalElapsed, delay, easing, iterations, direction);

    if (tweens.length === 1) {
      this.callback = tweens[0].gotoElapsedTime.bind(tweens[0]);
    } else {
      tweens.sort(endTimeComparator);
      this.callback = this._syncTweens;
    }
    this.tweens = tweens;
  }

  _syncTweens(elapsedTime) {
    for (let index = 0, length = this.tweens.length; index < length; index++) {
      this.tweens[index].gotoElapsedTime(elapsedTime);
    }
  }
}

Object.defineProperty(exports, "__esModule", { value: true });
Object.defineProperty(exports, "default", {
  enumerable: true,
  get: () => MultiTween
});
