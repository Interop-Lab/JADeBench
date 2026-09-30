var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (let name in all)
    __defProp(target, name, { get: all[name], enumerable: true, configurable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, {
          get: () => from[key],
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable,
          configurable: true
        });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

var SpringTween_exports = {};
__export(SpringTween_exports, {
  default: () => SpringTween_default
});
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
  gotoElapsedTime(elapsedTime) {}
  gotoEnd() {}
  isDoneAtElapsedTime(elapsedTime) {}
};

var tensionFactor = 1e-6;
var frictionFactor = 1e-3;
var DEFAULTS = SpringPresets_default.default;

var SpringTween = class extends AbstractTween {
  constructor(object, property, start, end, duration = 0, delay = 0) {
    super();
    this._object = object;
    this._property = property;
    this._start = start;
    this._end = end;
    this._duration = duration;
    this._delay = delay;
    this._elapsed = 0;
    this._position = start;
    this._velocity = 0;
    this._config = DEFAULTS;
    this._done = false;
  }

  gotoElapsedTime(elapsedTime) {
    if (elapsedTime < this._delay) {
      this._position = this._start;
      this._velocity = 0;
      this._elapsed = elapsedTime;
      return;
    }

    const effectiveTime = elapsedTime - this._delay;
    const mass = this._config.mass;
    const tension = this._config.tension * tensionFactor;
    const friction = this._config.friction * frictionFactor;

    let position = this._start;
    let velocity = 0;
    const dt = 1 / 60;

    for (let t = 0; t < effectiveTime; t += dt) {
      const springForce = -tension * (position - this._end);
      const dampingForce = -friction * velocity;
      const acceleration = (springForce + dampingForce) / mass;
      velocity += acceleration * dt;
      position += velocity * dt;
    }

    this._position = position;
    this._velocity = velocity;
    this._elapsed = elapsedTime;
  }

  gotoEnd() {
    this._position = this._end;
    this._velocity = 0;
    this._elapsed = this._delay + this._duration;
    this._done = true;
  }

  isDoneAtElapsedTime(elapsedTime) {
    return elapsedTime >= this._delay + this._duration;
  }
};

var SpringTween_default = SpringTween;
