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

var tensionFactor = 0.000001;
var frictionFactor = 0.001;
var DEFAULTS = SpringPresets_default.default;

var SpringTween = class extends AbstractTween {
  constructor(from, to, tension, friction, initialVelocity = 0, precision = 0) {
    super();
    this.from = from;
    this.to = to;
    this.tension = tension;
    this.friction = friction;
    this.initialVelocity = initialVelocity;
    this.precision = precision;
    this.mass = 1;
    this.currentTime = 0;
    this.currentValue = from;
    this.currentVelocity = initialVelocity;
    this.isComplete = false;
  }

  gotoElapsedTime(elapsedTime) {
    if (this.isComplete) return this.currentValue;
    
    const dt = elapsedTime - this.currentTime;
    this.currentTime = elapsedTime;
    
    if (dt <= 0) return this.currentValue;
    
    const k = this.tension * tensionFactor;
    const c = this.friction * frictionFactor;
    const m = this.mass;
    
    const v0 = this.currentVelocity;
    const x0 = this.to - this.currentValue;
    
    const radicand = c * c - 4 * m * k;
    
    if (radicand > 0) {
      const r1 = (-c + Math.sqrt(radicand)) / (2 * m);
      const r2 = (-c - Math.sqrt(radicand)) / (2 * m);
      const c2 = (v0 - r1 * x0) / (r2 - r1);
      const c1 = x0 - c2;
      const displacement = c1 * Math.exp(r1 * dt) + c2 * Math.exp(r2 * dt);
      const velocity = c1 * r1 * Math.exp(r1 * dt) + c2 * r2 * Math.exp(r2 * dt);
      this.currentValue = this.to - displacement;
      this.currentVelocity = velocity;
    } else if (radicand === 0) {
      const r = -c / (2 * m);
      const c1 = x0;
      const c2 = v0 - r * x0;
      const displacement = (c1 + c2 * dt) * Math.exp(r * dt);
      const velocity = (c2 + (c1 + c2 * dt) * r) * Math.exp(r * dt);
      this.currentValue = this.to - displacement;
      this.currentVelocity = velocity;
    } else {
      const w = Math.sqrt(4 * m * k - c * c) / (2 * m);
      const a = -c / (2 * m);
      const c1 = x0;
      const c2 = (v0 - a * x0) / w;
      const displacement = Math.exp(a * dt) * (c1 * Math.cos(w * dt) + c2 * Math.sin(w * dt));
      const velocity = Math.exp(a * dt) * ((a * c1 + c2 * w) * Math.cos(w * dt) + (a * c2 - c1 * w) * Math.sin(w * dt));
      this.currentValue = this.to - displacement;
      this.currentVelocity = velocity;
    }
    
    if (Math.abs(this.to - this.currentValue) < this.precision && Math.abs(this.currentVelocity) < this.precision) {
      this.currentValue = this.to;
      this.currentVelocity = 0;
      this.isComplete = true;
    }
    
    return this.currentValue;
  }

  gotoEnd() {
    this.currentValue = this.to;
    this.currentVelocity = 0;
    this.isComplete = true;
    return this.currentValue;
  }

  isDoneAtElapsedTime(elapsedTime) {
    if (this.isComplete) return true;
    this.gotoElapsedTime(elapsedTime);
    return this.isComplete;
  }
};

var SpringTween_default = SpringTween;
