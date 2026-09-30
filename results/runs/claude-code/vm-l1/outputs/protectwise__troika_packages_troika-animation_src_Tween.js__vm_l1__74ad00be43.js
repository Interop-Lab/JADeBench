const { PI, pow, sqrt } = Math;

const HALF_PI = PI / 2;
const TWO_PI = PI * 2;

function makeInOut(easeIn, easeOut) {
  return (progress) =>
    progress < 0.5
      ? easeIn(progress * 2) / 2
      : easeOut(progress * 2 - 1) / 2 + 0.5;
}

function makeExpIn(exponent) {
  return (progress) => pow(progress, exponent);
}

function makeExpOut(exponent) {
  return (progress) => 1 - pow(1 - progress, exponent);
}

function makeExpInOut(exponent) {
  return makeInOut(makeExpIn(exponent), makeExpOut(exponent));
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
const easeInOutSine = (progress) => -(Math.cos(PI * progress) - 1) / 2;

const easeInExpo = (progress) =>
  progress === 0 ? 0 : pow(2, 10 * progress - 10);
const easeOutExpo = (progress) =>
  progress === 1 ? 1 : 1 - pow(2, -10 * progress);
const easeInOutExpo = (progress) => {
  if (progress === 0 || progress === 1) return progress;
  return progress < 0.5
    ? pow(2, 20 * progress - 10) / 2
    : (2 - pow(2, -20 * progress + 10)) / 2;
};

const easeInCirc = (progress) => 1 - sqrt(1 - pow(progress, 2));
const easeOutCirc = (progress) => sqrt(1 - pow(progress - 1, 2));
const easeInOutCirc = makeInOut(easeInCirc, easeOutCirc);

const ELASTIC_PERIOD = TWO_PI / 3;
const easeInElastic = (progress) => {
  if (progress === 0 || progress === 1) return progress;
  return (
    -pow(2, 10 * progress - 10) *
    Math.sin((progress * 10 - 10.75) * ELASTIC_PERIOD)
  );
};
const easeOutElastic = (progress) => {
  if (progress === 0 || progress === 1) return progress;
  return (
    pow(2, -10 * progress) * Math.sin((progress * 10 - 0.75) * ELASTIC_PERIOD) +
    1
  );
};
const easeInOutElastic = makeInOut(easeInElastic, easeOutElastic);

const BACK_OVERSHOOT = 1.70158;
const easeInBack = (progress) =>
  (BACK_OVERSHOOT + 1) * progress * progress * progress -
  BACK_OVERSHOOT * progress * progress;
const easeOutBack = (progress) => {
  const offset = progress - 1;
  return (
    1 +
    (BACK_OVERSHOOT + 1) * offset * offset * offset +
    BACK_OVERSHOOT * offset * offset
  );
};
const easeInOutBack = (progress) => {
  const overshoot = BACK_OVERSHOOT * 1.525;
  return progress < 0.5
    ? (pow(2 * progress, 2) * ((overshoot + 1) * 2 * progress - overshoot)) / 2
    : (pow(2 * progress - 2, 2) *
        ((overshoot + 1) * (progress * 2 - 2) + overshoot) +
        2) /
        2;
};

const BOUNCE_SCALE = 7.5625;
const BOUNCE_DIVISOR = 2.75;
const easeOutBounce = (progress) => {
  if (progress < 1 / BOUNCE_DIVISOR) {
    return BOUNCE_SCALE * progress * progress;
  }
  if (progress < 2 / BOUNCE_DIVISOR) {
    const offset = progress - 1.5 / BOUNCE_DIVISOR;
    return BOUNCE_SCALE * offset * offset + 0.75;
  }
  if (progress < 2.5 / BOUNCE_DIVISOR) {
    const offset = progress - 2.25 / BOUNCE_DIVISOR;
    return BOUNCE_SCALE * offset * offset + 0.9375;
  }
  const offset = progress - 2.625 / BOUNCE_DIVISOR;
  return BOUNCE_SCALE * offset * offset + 0.984375;
};
const easeInBounce = (progress) => 1 - easeOutBounce(1 - progress);
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

function number(fromValue, toValue, progress) {
  return fromValue + (toValue - fromValue) * progress;
}

function rgbToNumber(red, green, blue) {
  return red * 0x10000 + green * 0x100 + blue;
}

const colorValueToNumber = (() => {
  let canvas;
  let context;
  let cache = Object.create(null);
  let cacheSize = 0;
  const maximumCacheSize = 2048;

  return (value) => {
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
      const [red, green, blue] = context.getImageData(0, 0, 1, 1).data;
      const numericColor = rgbToNumber(red, green, blue);

      if (cacheSize > maximumCacheSize) {
        cache = Object.create(null);
        cacheSize = 0;
      }
      cache[value] = numericColor;
      cacheSize++;
      return numericColor;
    }

    return value && value.isColor ? value.getHex() : 0;
  };
})();

function color(fromValue, toValue, progress) {
  const fromColor = colorValueToNumber(fromValue);
  const toColor = colorValueToNumber(toValue);
  return rgbToNumber(
    number((fromColor >> 16) & 255, (toColor >> 16) & 255, progress),
    number((fromColor >> 8) & 255, (toColor >> 8) & 255, progress),
    number(fromColor & 255, toColor & 255, progress),
  );
}

const Interpolators = { color, number };
const maxSafeInteger = 0x1fffffffffffff;

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
    easing = linear,
    iterations = 1,
    direction = "forward",
    interpolation = "number",
  ) {
    super();
    this.callback = callback;
    this.fromValue = fromValue;
    this.toValue = toValue;
    this.duration = duration;
    this.delay = delay;
    this.easing = easing;
    this.iterations = iterations;
    this.direction = direction;
    this.interpolate = Interpolators[interpolation];
    this.totalElapsed =
      iterations === Infinity ? maxSafeInteger : delay + duration * iterations;
  }

  gotoElapsedTime(elapsedTime) {
    if (elapsedTime < this.delay) return;

    const activeElapsed = elapsedTime - this.delay;
    const completedIteration = Math.ceil(activeElapsed / this.duration) - 1;
    let progress = (activeElapsed % this.duration) / this.duration;

    if (activeElapsed >= this.duration * this.iterations) {
      progress = 1;
    } else if (progress === 0 && activeElapsed !== 0) {
      progress = 1;
    }

    if (
      this.direction === "reverse" ||
      (this.direction === "alternate" && completedIteration % 2 !== 0)
    ) {
      progress = 1 - progress;
    }

    const easedProgress = this.easing(progress);
    this.callback(
      this.interpolate(this.fromValue, this.toValue, easedProgress),
    );
  }

  gotoEnd() {
    this.gotoElapsedTime(this.totalElapsed);
  }

  isDoneAtElapsedTime(elapsedTime) {
    return elapsedTime > this.totalElapsed;
  }
}

Object.defineProperty(module.exports, "__esModule", { value: true });
Object.defineProperty(module.exports, "default", {
  enumerable: true,
  get: () => Tween,
});
