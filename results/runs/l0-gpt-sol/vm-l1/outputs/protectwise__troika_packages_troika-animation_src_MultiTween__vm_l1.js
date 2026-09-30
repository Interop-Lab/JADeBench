const { pow, PI, sqrt } = Math;

const HALF_PI = PI / 2;
const TWO_PI = PI * 2;
const maxSafeInteger = 0x1fffffffffffff;

function makeExpIn(exponent) {
  return time => pow(time, exponent);
}

function makeExpOut(exponent) {
  return time => 1 - pow(1 - time, exponent);
}

function makeInOut(inFunction, outFunction) {
  return time => (time < 0.5
    ? inFunction(time * 2) / 2
    : outFunction((time - 0.5) * 2) / 2 + 0.5);
}

function makeExpInOut(exponent) {
  const easeIn = makeExpIn(exponent);
  const easeOut = makeExpOut(exponent);
  return makeInOut(easeIn, easeOut);
}

const linear = value => value;

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

const easeInSine = value => 1 - Math.cos(value * HALF_PI);
const easeOutSine = value => Math.sin(value * HALF_PI);
const easeInOutSine = value => -(Math.cos(PI * value) - 1) / 2;

const easeInExpo = value => (value === 0 ? 0 : pow(2, 10 * (value - 1)));
const easeOutExpo = value => (value === 1 ? 1 : 1 - pow(2, -10 * value));
const easeInOutExpo = value => {
  if (value === 0 || value === 1) return value;
  return value < 0.5
    ? pow(2, 20 * value - 10) / 2
    : (2 - pow(2, -20 * value + 10)) / 2;
};

const easeInCirc = value => 1 - sqrt(1 - value * value);
const easeOutCirc = value => sqrt(1 - (value - 1) * (value - 1));
const easeInOutCirc = makeInOut(easeInCirc, easeOutCirc);

const easeInElastic = value => {
  if (value === 0 || value === 1) return value;
  return -pow(2, 10 * (value - 1)) *
    Math.sin((value - 1.075) * TWO_PI / 0.3);
};

const easeOutElastic = value => {
  if (value === 0 || value === 1) return value;
  return pow(2, -10 * value) *
    Math.sin((value - 0.075) * TWO_PI / 0.3) + 1;
};

const easeInOutElastic = makeInOut(easeInElastic, easeOutElastic);

const easeInBack = value => {
  const constant = 1.70158;
  return (constant + 1) * value * value * value - constant * value * value;
};

const easeOutBack = value => {
  const constant = 1.70158;
  const shifted = value - 1;
  return (constant + 1) * shifted * shifted * shifted +
    constant * shifted * shifted + 1;
};

const easeInOutBack = value => {
  const constant = 1.70158 * 1.525;
  const shifted = value * 2;
  if (shifted < 1) {
    return shifted * shifted * ((constant + 1) * shifted - constant) / 2;
  }
  const adjusted = shifted - 2;
  return (adjusted * adjusted * ((constant + 1) * adjusted + constant) + 2) / 2;
};

const easeOutBounce = value => {
  if (value < 1 / 2.75) {
    return 7.5625 * value * value;
  }
  if (value < 2 / 2.75) {
    const shifted = value - 1.5 / 2.75;
    return 7.5625 * shifted * shifted + 0.75;
  }
  if (value < 2.5 / 2.75) {
    const shifted = value - 2.25 / 2.75;
    return 7.5625 * shifted * shifted + 0.9375;
  }
  const shifted = value - 2.625 / 2.75;
  return 7.5625 * shifted * shifted + 0.984375;
};

const easeInBounce = value => 1 - easeOutBounce(1 - value);
const easeInOutBounce = makeInOut(easeInBounce, easeOutBounce);

function number(start, end, amount) {
  return start + (end - start) * amount;
}

function rgbToNumber(red, green, blue) {
  return ((red & 0xff) << 16) | ((green & 0xff) << 8) | (blue & 0xff);
}

function colorValueToNumber(value) {
  if (typeof value === "number") return value;

  if (typeof value === "string") {
    if (typeof document !== "undefined") {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = canvas.height = 1;
      context.fillStyle = value;
      context.fillRect(0, 0, 1, 1);
      const data = context.getImageData(0, 0, 1, 1).data;
      return rgbToNumber(data[0], data[1], data[2]);
    }

    if (value[0] === "#") {
      const hex = value.slice(1);
      if (hex.length === 3) {
        return parseInt(
          hex.split("").map(component => component + component).join(""),
          16
        );
      }
      return parseInt(hex, 16);
    }
  }

  if (value && typeof value.getHex === "function") {
    return value.getHex();
  }

  return 0;
}

function color(start, end, amount) {
  const from = colorValueToNumber(start);
  const to = colorValueToNumber(end);

  const red = Math.round(number((from >> 16) & 0xff, (to >> 16) & 0xff, amount));
  const green = Math.round(number((from >> 8) & 0xff, (to >> 8) & 0xff, amount));
  const blue = Math.round(number(from & 0xff, to & 0xff, amount));

  return rgbToNumber(red, green, blue);
}

class AbstractTween {
  gotoElapsedTime() {}
  gotoEnd() {}
  isDoneAtElapsedTime() {}
}

const linear2 = value => value;

class Tween extends AbstractTween {
  constructor(
    startValue,
    endValue,
    duration,
    delay = 750,
    elapsedTime = 0,
    interpolator = linear2,
    weight = 1,
    name = "forward",
    valueType = "number"
  ) {
    super();
    this.startValue = startValue;
    this.endValue = endValue;
    this.duration = duration;
    this.delay = delay;
    this.elapsedTime = elapsedTime;
    this.interpolator = interpolator;
    this.weight = weight;
    this.name = name;
    this.valueType = valueType;
    this.value = startValue;
    this.done = false;
  }

  gotoElapsedTime(elapsedTime) {
    this.elapsedTime = elapsedTime;

    if (elapsedTime <= this.delay) {
      this.value = this.startValue;
      this.done = false;
      return this.value;
    }

    const progress = this.duration <= this.delay
      ? 1
      : Math.min(1, Math.max(0, (elapsedTime - this.delay) / (this.duration - this.delay)));

    this.value = this.interpolator(this.startValue, this.endValue, progress);
    this.done = progress >= 1;
    return this.value;
  }

  gotoEnd() {
    this.elapsedTime = this.duration;
    this.value = this.endValue;
    this.done = true;
    return this.value;
  }

  isDoneAtElapsedTime(elapsedTime) {
    return elapsedTime >= this.duration;
  }
}

class MultiTween extends Tween {
  constructor(tweens, duration, interpolator, weight, name, valueType) {
    if (typeof duration !== "number") {
      duration = tweens.reduce(
        (total, tween) => Math.max(total, tween.duration),
        0
      );
    }

    if (duration === Infinity) {
      duration = Number.MAX_VALUE;
    }

    super(null, 0, duration, duration, 0, interpolator, weight, name, valueType);
    this.tweens = tweens;
  }

  gotoElapsedTime(elapsedTime) {
    this.elapsedTime = elapsedTime;

    for (const tween of this.tweens) {
      if (tween && typeof tween.gotoElapsedTime === "function") {
        tween.gotoElapsedTime(elapsedTime);
      }
    }

    this.done = this.isDoneAtElapsedTime(elapsedTime);
    return this.tweens;
  }

  gotoEnd() {
    for (const tween of this.tweens) {
      if (tween && typeof tween.gotoEnd === "function") {
        tween.gotoEnd();
      }
    }

    this.elapsedTime = this.duration;
    this.done = true;
    return this.tweens;
  }

  isDoneAtElapsedTime(elapsedTime) {
    return this.tweens.every(tween =>
      !tween || typeof tween.isDoneAtElapsedTime !== "function" ||
      tween.isDoneAtElapsedTime(elapsedTime)
    );
  }
}

const Tween_default = Tween;
const MultiTween_default = MultiTween;

module.exports = {
  default: MultiTween_default
};
