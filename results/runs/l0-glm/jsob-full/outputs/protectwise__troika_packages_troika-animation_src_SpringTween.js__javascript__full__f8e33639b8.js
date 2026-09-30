var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (let name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from)) {
      if (!__hasOwnProp.call(to, key) && key !== except) {
        __defProp(to, key, {
          get: () => from[key],
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
        });
      }
    }
  }
  return to;
};
var __toCommonJS = mod => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var SpringTween_exports = {};
var _0x35b639 = {};
_0x35b639.SpringTween = () => SpringTween_default;
__export(SpringTween_exports, _0x35b639);
module.exports = __toCommonJS(SpringTween_exports);

var SpringPresets_default = {
  default: { mass: 1, tension: 170, friction: 26 },
  gentle: { mass: 1, tension: 120, friction: 14 },
  wobbly: { mass: 1, tension: 180, friction: 12 },
  stiff: { mass: 1, tension: 210, friction: 20 },
  slow: { mass: 1, tension: 280, friction: 60 },
  molasses: { mass: 1, tension: 280, friction: 120 }
};

var AbstractTween = class {
  update(time) {}
  reset() {}
  onValueChanged(callback) {}
};

var tensionFactor = 0.000001;
var frictionFactor = 0.001;
var DEFAULTS = SpringPresets_default.default;

var SpringTween = class extends AbstractTween {
  constructor(from, to, time, config, autoStart = false, delay = 0) {
    super();
    this._active = true;
    this._from = from;
    this._currentValue = to;
    this._to = time;
    this._delay = config;
    this._onValueChanged = delay;

    if (typeof config === "string") {
      config = SpringPresets_default[config];
    }
    if (!config) config = DEFAULTS;

    const { mass, tension, friction } = config;
    this._mass = typeof mass === "number" ? mass : DEFAULTS.mass;
    this._tension = (typeof tension === "number" ? tension : DEFAULTS.tension) * tensionFactor;
    this._friction = (typeof friction === "number" ? friction : DEFAULTS.friction) * frictionFactor;
    this._minAcceleration = 1e-10;
    this._currentTime = delay;
    this._duration = Infinity;
  }

  update(time) {
    if (time === this._currentTime) return;

    let { toValue, mass, tension, friction, minAcceleration } = this;
    let velocity = this._velocity || 0;
    let position = this._currentValue;

    for (let t = this._currentTime; t < time; t++) {
      const acceleration = (tension * (toValue - position) - friction * velocity) / mass;
      if (Math.abs(acceleration) >= minAcceleration) {
        velocity += acceleration;
        position += velocity;
      } else {
        velocity = 0;
        position = toValue;
        this._duration = t;
        break;
      }
    }

    this._velocity = velocity;
    this._currentTime = time;
    this._onValueChanged(this._currentValue = position);
  }

  reset() {
    this._velocity = 0;
    this._currentTime = this._delay;
    this._onValueChanged(this._currentValue = this._from);
  }

  onValueChanged(callback) {
    return callback >= this._duration;
  }
};

var SpringTween_default = SpringTween;
