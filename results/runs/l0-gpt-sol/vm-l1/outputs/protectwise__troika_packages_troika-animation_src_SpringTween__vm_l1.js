"use strict";

var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;

var __export = (target, all) => {
  for (var name in all) {
    __defProp(target, name, {
      get: all[name],
      enumerable: true
    });
  }
};

var __copyProps = (to, from, except, descriptor) => {
  if (from && (typeof from === "object" || typeof from === "function")) {
    for (var key of __getOwnPropNames(from)) {
      if (!__hasOwnProp.call(to, key) && key !== except) {
        __defProp(to, key, {
          get: () => from[key],
          enumerable: !(descriptor = __getOwnPropDesc(from, key)) || descriptor.enumerable
        });
      }
    }
  }
  return to;
};

var __toCommonJS = moduleValue =>
  __copyProps(__defProp({}, "__esModule", {value: true}), moduleValue);

var SpringTween_exports = {};
__export(SpringTween_exports, {
  default: () => SpringTween_default
});
module.exports = __toCommonJS(SpringTween_exports);

var SpringPresets = {
  default: {mass: 1, tension: 170, friction: 26},
  gentle: {mass: 1, tension: 120, friction: 14},
  wobbly: {mass: 1, tension: 180, friction: 12},
  stiff: {mass: 1, tension: 210, friction: 20},
  slow: {mass: 1, tension: 280, friction: 60},
  molasses: {mass: 1, tension: 280, friction: 120}
};

class AbstractTween {
  gotoElapsedTime(time) {
  }

  gotoEnd() {
  }

  interpolate(value) {
  }
}

var tensionFactor = 0.000001;
var frictionFactor = 0.001;
var DEFAULTS = SpringPresets.default;

class SpringTween extends AbstractTween {
  constructor(from, to, callback, config, initialVelocity = 0, initialTime = 0) {
    super();

    config = config || DEFAULTS;

    this.from = from;
    this.to = to;
    this.callback = callback;
    this.mass = config.mass;
    this.tension = config.tension * tensionFactor;
    this.friction = config.friction * frictionFactor;
    this.initialVelocity = initialVelocity;
    this.initialTime = initialTime;
    this.position = from;
    this.velocity = initialVelocity;
    this.lastTime = initialTime;
  }

  gotoElapsedTime(elapsedTime) {
    if (elapsedTime < this.lastTime) {
      this.position = this.from;
      this.velocity = this.initialVelocity;
      this.lastTime = this.initialTime;
    }

    let remaining = elapsedTime - this.lastTime;

    while (remaining > 0) {
      const deltaTime = Math.min(remaining, 1);
      const springForce = -this.tension * (this.position - this.to);
      const dampingForce = -this.friction * this.velocity;
      const acceleration = (springForce + dampingForce) / this.mass;

      this.velocity += acceleration * deltaTime;
      this.position += this.velocity * deltaTime;
      remaining -= deltaTime;
    }

    this.lastTime = elapsedTime;
    this.interpolate(this.position);
  }

  isDoneAtElapsedTime(elapsedTime) {
    this.gotoElapsedTime(elapsedTime);
    return Math.abs(this.velocity) < 0.0001 &&
      Math.abs(this.to - this.position) < 0.0001;
  }

  interpolate(value) {
    this.callback(value);
  }
}

var SpringTween_default = SpringTween;
