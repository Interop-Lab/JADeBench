var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;

var __export = (target, exports) => {
  for (var name in exports) {
    __defProp(target, name, {
      get: exports[name],
      enumerable: true
    });
  }
};

var __copyProps = (target, source, except, descriptor) => {
  if (source && (typeof source === "object" || typeof source === "function")) {
    for (const key of __getOwnPropNames(source)) {
      if (!__hasOwnProp.call(target, key) && key !== except) {
        __defProp(target, key, {
          get: () => source[key],
          enumerable: !(descriptor = __getOwnPropDesc(source, key)) || descriptor.enumerable
        });
      }
    }
  }
  return target;
};

var __toCommonJS = moduleValue =>
  __copyProps(__defProp({}, "__esModule", { value: true }), moduleValue);

var SpringTween_exports = {};
__export(SpringTween_exports, {
  default: () => SpringTween
});
module.exports = __toCommonJS(SpringTween_exports);

var SpringPresets = {
  default: {
    mass: 1,
    tension: 170,
    friction: 26
  },
  gentle: {
    mass: 1,
    tension: 120,
    friction: 14
  },
  wobbly: {
    mass: 1,
    tension: 180,
    friction: 12
  },
  stiff: {
    mass: 1,
    tension: 210,
    friction: 20
  },
  slow: {
    mass: 1,
    tension: 280,
    friction: 60
  },
  molasses: {
    mass: 1,
    tension: 280,
    friction: 120
  }
};

class AbstractTween {
  update(timestamp) {
  }

  reset() {
  }

  isFinished(timestamp) {
  }
}

var tensionFactor = 0.000001;
var frictionFactor = 0.001;
var DEFAULTS = SpringPresets.default;

class SpringTween extends AbstractTween {
  constructor(
    fromValue,
    toValue,
    onUpdate,
    springPreset,
    delay = 0,
    startTime = 0
  ) {
    super();

    this.isActive = true;
    this.fromValue = fromValue;
    this.currentValue = fromValue;
    this.toValue = toValue;
    this.onUpdate = onUpdate;
    this.delay = delay;
    this.startTime = startTime;

    if (typeof springPreset === "string") {
      springPreset = SpringPresets[springPreset];
    }

    if (!springPreset) {
      springPreset = DEFAULTS;
    }

    const { mass, tension, friction } = springPreset;

    this.mass = typeof mass === "number" ? mass : DEFAULTS.mass;
    this.tension = (typeof tension === "number" ? tension : DEFAULTS.tension) * tensionFactor;
    this.friction = (typeof friction === "number" ? friction : DEFAULTS.friction) * frictionFactor;
    this.minAcceleration = 1e-10;
    this.velocity = 0;
    this.lastTime = startTime;
    this.duration = Infinity;
  }

  update(timestamp) {
    if (timestamp < this.startTime) {
      return;
    }

    const {
      toValue,
      mass,
      tension,
      friction,
      minAcceleration
    } = this;

    let velocity = this.velocity || 0;
    let currentValue = this.currentValue;

    for (let time = this.lastTime; time < timestamp; time++) {
      const acceleration =
        (tension * (toValue - currentValue) - friction * velocity) / mass;

      if (Math.abs(acceleration) < minAcceleration) {
        velocity = 0;
        currentValue = toValue;
        this.duration = time;
        break;
      }

      velocity += acceleration;
      currentValue += velocity;
    }

    this.velocity = velocity;
    this.lastTime = timestamp;
    this.onUpdate(this.currentValue = currentValue);
  }

  reset() {
    this.velocity = 0;
    this.lastTime = this.startTime;
    this.onUpdate(this.currentValue = this.fromValue);
  }

  isFinished(timestamp) {
    return timestamp >= this.duration;
  }
}
