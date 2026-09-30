var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// ../work/protectwise__troika/packages/troika-animation/src/SpringTween.js
var SpringTween_exports = {};
__export(SpringTween_exports, {
  default: () => SpringTween_default
});
module.exports = __toCommonJS(SpringTween_exports);

// ../work/protectwise__troika/packages/troika-animation/src/SpringPresets.js
var SpringPresets_default = {
  default: { mass: 1, tension: 170, friction: 26 },
  gentle: { mass: 1, tension: 120, friction: 14 },
  wobbly: { mass: 1, tension: 180, friction: 12 },
  stiff: { mass: 1, tension: 210, friction: 20 },
  slow: { mass: 1, tension: 280, friction: 60 },
  molasses: { mass: 1, tension: 280, friction: 120 }
};

// ../work/protectwise__troika/packages/troika-animation/src/AbstractTween.js
var AbstractTween = class {
  /**
   * @abstract
   * For a given elapsed time relative to the start of the tween, calculates the value at that time and calls the
   * `callback` function with that value. If the given time is during the `delay` period, the callback will not be
   * invoked.
   * @param {number} time
   */
  gotoElapsedTime(time) {
  }
  /**
   * @abstract
   * Like `gotoElapsedTime` but goes to the very end of the tween.
   */
  gotoEnd() {
  }
  /**
   * @abstract
   * For a given elapsed time relative to the start of the tween, determines if the tween is in its completed end state.
   * @param {number} time
   * @return {boolean}
   */
  isDoneAtElapsedTime(time) {
  }
};

// ../work/protectwise__troika/packages/troika-animation/src/SpringTween.js
var tensionFactor = 1e-6;
var frictionFactor = 1e-3;
var DEFAULTS = SpringPresets_default.default;
var SpringTween = class extends AbstractTween {
  constructor(callback, fromValue, toValue, springConfig, initialVelocity = 0, delay = 0) {
    super();
    this.isSpring = true;
    this.callback = callback;
    this.currentValue = fromValue;
    this.toValue = toValue;
    this.velocity = initialVelocity;
    this.delay = delay;
    if (typeof springConfig === "string") {
      springConfig = SpringPresets_default[springConfig];
    }
    if (!springConfig) springConfig = DEFAULTS;
    const { mass, tension, friction } = springConfig;
    this.mass = typeof mass === "number" ? mass : DEFAULTS.mass;
    this.tension = (typeof tension === "number" ? tension : DEFAULTS.tension) * tensionFactor;
    this.friction = (typeof friction === "number" ? friction : DEFAULTS.friction) * frictionFactor;
    this.minAcceleration = 1e-10;
    this.$lastTime = delay;
    this.$endTime = Infinity;
  }
  gotoElapsedTime(time) {
    if (time >= this.delay) {
      let { toValue, mass, tension, friction, minAcceleration } = this;
      let velocity = this.velocity || 0;
      let value = this.currentValue;
      for (let t = this.$lastTime; t < time; t++) {
        const acceleration = (tension * (toValue - value) - friction * velocity) / mass;
        if (Math.abs(acceleration) < minAcceleration) {
          velocity = 0;
          value = toValue;
          this.$endTime = t;
          break;
        } else {
          velocity += acceleration;
          value += velocity;
        }
      }
      this.velocity = velocity;
      this.$lastTime = time;
      this.callback(this.currentValue = value);
    }
  }
  gotoEnd() {
    this.velocity = 0;
    this.$lastTime = this.$endTime;
    this.callback(this.currentValue = this.toValue);
  }
  isDoneAtElapsedTime(time) {
    return time >= this.$endTime;
  }
};
var SpringTween_default = SpringTween;
