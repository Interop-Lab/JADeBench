'use strict';

const SpringPresets_default = {
  default: { mass: 1, tension: 170, friction: 26 },
  gentle: { mass: 1, tension: 120, friction: 14 },
  wobbly: { mass: 1, tension: 180, friction: 12 },
  stiff: { mass: 1, tension: 210, friction: 20 },
  slow: { mass: 1, tension: 280, friction: 60 },
  molasses: { mass: 1, tension: 280, friction: 120 }
};

class AbstractTween {
  gotoElapsedTime() {}
  gotoEnd() {}
  isDoneAtElapsedTime() {}
}

const tensionFactor = 0.000001;
const frictionFactor = 0.001;
const DEFAULTS = SpringPresets_default.default;

class SpringTween extends AbstractTween {
  constructor(callback, currentValue, toValue, preset, velocity = 0, delay = 0) {
    super();
    this.isSpring = true;
    this.callback = callback;
    this.currentValue = currentValue;
    this.toValue = toValue;
    this.velocity = velocity;
    this.delay = delay;
    if (typeof preset === 'string') preset = SpringPresets_default[preset];
    if (!preset) preset = DEFAULTS;
    const { mass, tension, friction } = preset;
    this.mass = typeof mass === 'number' ? mass : DEFAULTS.mass;
    this.tension = (typeof tension === 'number' ? tension : DEFAULTS.tension) * tensionFactor;
    this.friction = (typeof friction === 'number' ? friction : DEFAULTS.friction) * frictionFactor;
    this.minAcceleration = 1e-10;
    this.$lastTime = 0;
    this.$endTime = Infinity;
  }

  gotoElapsedTime(elapsedTime) {
    if (elapsedTime < this.delay) return;
    let lastTime = this.$lastTime || this.delay;
    let currentValue = this.currentValue;
    let velocity = this.velocity;
    for (let time = lastTime; time < elapsedTime; time++) {
      const acceleration = (this.tension * (this.toValue - currentValue) - this.friction * velocity) / this.mass;
      if (Math.abs(acceleration) < this.minAcceleration) {
        currentValue = this.toValue;
        velocity = 0;
        this.$endTime = time;
        break;
      }
      velocity += acceleration;
      currentValue += velocity;
    }
    this.currentValue = currentValue;
    this.velocity = velocity;
    this.$lastTime = elapsedTime;
    if (this.callback) this.callback(currentValue);
  }

  gotoEnd() {
    this.currentValue = this.toValue;
    this.velocity = 0;
    this.$lastTime = Infinity;
    if (this.callback) this.callback(this.currentValue);
  }

  isDoneAtElapsedTime(elapsedTime) {
    return elapsedTime >= this.$endTime;
  }
}

module.exports = { default: SpringTween };
