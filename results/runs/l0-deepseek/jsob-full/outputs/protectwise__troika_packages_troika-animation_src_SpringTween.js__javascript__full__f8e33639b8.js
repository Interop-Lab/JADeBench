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
  if (from && (typeof from === "object" || typeof from === "function")) {
    for (const key of __getOwnPropNames(from)) {
      if (!__hasOwnProp.call(to, key) && key !== except) {
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
    }
  }
  return to;
};
const __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

const SpringPresets = {
  default: { mass: 1, tension: 170, friction: 26 },
  gentle: { mass: 1, tension: 120, friction: 14 },
  wobbly: { mass: 1, tension: 180, friction: 12 },
  stiff: { mass: 1, tension: 210, friction: 20 },
  slow: { mass: 1, tension: 280, friction: 60 },
  molasses: { mass: 1, tension: 280, friction: 120 }
};

class AbstractTween {
  constructor() {}
  update() {}
  isComplete() {}
  setTargetValue(value) {}
}

const tensionFactor = 0.000001;
const frictionFactor = 0.001;
const DEFAULTS = SpringPresets.default;

class SpringTween extends AbstractTween {
  constructor(target, toValue, preset, onUpdate, initialVelocity = 0, minAcceleration = 0) {
    super();
    this.active = true;
    this.target = target;
    this.toValue = toValue;
    this.preset = preset;
    this.initialVelocity = initialVelocity;
    this.minAcceleration = minAcceleration;

    if (typeof preset === "string") {
      preset = SpringPresets[preset];
    }
    if (!preset) preset = DEFAULTS;

    const { mass, tension, friction } = preset;
    this.mass = typeof mass === "number" ? mass : DEFAULTS.mass;
    this.tension = (typeof tension === "number" ? tension : DEFAULTS.tension) * tensionFactor;
    this.friction = (typeof friction === "number" ? friction : DEFAULTS.friction) * frictionFactor;
    this.velocity = initialVelocity;
    this.currentValue = initialVelocity;
    this.frame = Infinity;
  }

  update(deltaTime) {
    if (deltaTime >= this.frame) {
      let { toValue, mass, tension, friction, minAcceleration } = this;
      let velocity = this.velocity || 0;
      let currentValue = this.currentValue;

      for (let frame = this.frame; frame < deltaTime; frame++) {
        const acceleration = (tension * (toValue - currentValue) - friction * velocity) / mass;
        if (Math.abs(acceleration) < minAcceleration) {
          velocity = 0;
          currentValue = toValue;
          this.frame = frame;
          break;
        } else {
          velocity += acceleration;
          currentValue += velocity;
        }
      }

      this.velocity = velocity;
      this.currentValue = currentValue;
      this.frame = deltaTime;
      this.target = currentValue;
    }
  }

  reset() {
    this.velocity = 0;
    this.currentValue = this.target;
    this.frame = 0;
  }

  isComplete() {
    return this.frame >= this.frame;
  }
}

const SpringTween_default = SpringTween;

const SpringTween_exports = {};
__export(SpringTween_exports, { default: () => SpringTween_default });
module.exports = __toCommonJS(SpringTween_exports);
