"use strict";

const DEFAULT_SPRING = {
  mass: 1,
  tension: 170,
  friction: 26,
};

const TENSION_SCALE = 0.000001;
const FRICTION_SCALE = 0.001;
const MIN_ACCELERATION = 1e-10;

class SpringTween {
  constructor(callback, fromValue, toValue, options, velocity = 0, delay = 0) {
    const spring = options || DEFAULT_SPRING;

    this.isSpring = true;
    this.callback = callback;
    this.currentValue = fromValue;
    this.toValue = toValue;
    this.velocity = velocity;
    this.delay = delay;
    this.mass = spring.mass ?? DEFAULT_SPRING.mass;
    this.tension = (spring.tension ?? DEFAULT_SPRING.tension) * TENSION_SCALE;
    this.friction = (spring.friction ?? DEFAULT_SPRING.friction) * FRICTION_SCALE;
    this.minAcceleration = MIN_ACCELERATION;
    this.$lastTime = delay;
    this.$endTime = Infinity;
  }

  gotoElapsedTime(elapsedTime) {
    if (elapsedTime < this.delay) return;

    for (let time = this.$lastTime; time < elapsedTime; time += 1) {
      const acceleration = (
        this.tension * (this.toValue - this.currentValue) -
        this.friction * this.velocity
      ) / this.mass;

      if (Math.abs(acceleration) < this.minAcceleration) {
        this.currentValue = this.toValue;
        this.velocity = 0;
        this.$endTime = time;
        break;
      }

      this.velocity += acceleration;
      this.currentValue += this.velocity;
    }

    this.$lastTime = elapsedTime;
    this.callback(this.currentValue);
  }

  gotoEnd() {
    this.currentValue = this.toValue;
    this.velocity = 0;
    this.$lastTime = this.$endTime;
    this.callback(this.currentValue);
  }

  isDoneAtElapsedTime(elapsedTime) {
    return elapsedTime === Infinity || (
      elapsedTime >= this.$endTime
    );
  }
}

Object.defineProperty(exports, "__esModule", { value: true });
Object.defineProperty(exports, "default", {
  enumerable: true,
  get: () => SpringTween,
});
