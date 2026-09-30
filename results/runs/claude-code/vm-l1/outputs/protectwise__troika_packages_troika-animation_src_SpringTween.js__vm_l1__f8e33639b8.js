var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all) {
    __defProp(target, name, { get: all[name], enumerable: true });
  }
};
var __copyProps = (to, from, except, desc) => {
  if ((from && typeof from === "object") || typeof from === "function") {
    for (let key of __getOwnPropNames(from)) {
      if (!__hasOwnProp.call(to, key) && key !== except) {
        __defProp(to, key, {
          get: () => from[key],
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable,
        });
      }
    }
  }
  return to;
};
var __toCommonJS = (module) =>
  __copyProps(__defProp({}, "__esModule", { value: true }), module);

var SpringTween_exports = {};
__export(SpringTween_exports, {
  default: () => SpringTween_default,
});
module.exports = __toCommonJS(SpringTween_exports);

var SpringPresets = {
  default: { mass: 1, tension: 170, friction: 26 },
  gentle: { mass: 1, tension: 120, friction: 14 },
  wobbly: { mass: 1, tension: 180, friction: 12 },
  stiff: { mass: 1, tension: 210, friction: 20 },
  slow: { mass: 1, tension: 280, friction: 60 },
  molasses: { mass: 1, tension: 280, friction: 120 },
};

class AbstractTween {
  gotoElapsedTime(elapsedTime) {}
  gotoEnd() {}
  isDoneAtElapsedTime(elapsedTime) {}
}

const tensionFactor = 0.000001;
const frictionFactor = 0.001;
const DEFAULTS = SpringPresets.default;

class SpringTween extends AbstractTween {
  constructor(callback, currentValue, toValue, spring, velocity = 0, delay = 0) {
    super();

    this.isSpring = true;
    this.callback = callback;
    this.currentValue = currentValue;
    this.toValue = toValue;
    this.velocity = velocity;
    this.delay = delay;

    const options =
      typeof spring === "string"
        ? SpringPresets[spring] || DEFAULTS
        : spring || DEFAULTS;

    this.mass = typeof options.mass === "number" ? options.mass : DEFAULTS.mass;
    this.tension =
      (typeof options.tension === "number" ? options.tension : DEFAULTS.tension) *
      tensionFactor;
    this.friction =
      (typeof options.friction === "number" ? options.friction : DEFAULTS.friction) *
      frictionFactor;
    this.minAcceleration = 1e-10;
    this.$lastTime = delay;
    this.$endTime = Infinity;
  }

  gotoElapsedTime(elapsedTime) {
    if (elapsedTime < this.delay) return;

    let acceleration;
    for (let time = this.$lastTime; time < elapsedTime; time++) {
      acceleration =
        ((this.toValue - this.currentValue) * this.tension -
          this.velocity * this.friction) /
        this.mass;
      this.velocity += acceleration;
      this.currentValue += this.velocity;
    }

    if (
      Math.abs(acceleration) < this.minAcceleration &&
      Math.abs(this.velocity) < this.minAcceleration
    ) {
      this.velocity = 0;
      this.currentValue = this.toValue;
      this.$endTime = this.$lastTime;
    }

    this.$lastTime = elapsedTime;
    this.callback(this.currentValue);
  }

  gotoEnd() {
    this.velocity = 0;
    this.currentValue = this.toValue;
    this.$lastTime = this.$endTime;
    this.callback(this.currentValue);
  }

  isDoneAtElapsedTime(elapsedTime) {
    return elapsedTime >= this.$endTime;
  }
}

var SpringTween_default = SpringTween;
