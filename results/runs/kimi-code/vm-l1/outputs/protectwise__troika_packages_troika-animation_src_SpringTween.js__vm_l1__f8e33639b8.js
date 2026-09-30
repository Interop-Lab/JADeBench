'use strict';

const SPRING_PRESETS = {
  default: {mass: 1, tension: 170, friction: 26},
  gentle: {mass: 1, tension: 120, friction: 14},
  wobbly: {mass: 1, tension: 180, friction: 12},
  stiff: {mass: 1, tension: 210, friction: 20},
  slow: {mass: 1, tension: 280, friction: 60},
  molasses: {mass: 1, tension: 280, friction: 120}
};

const TENSION_FACTOR = 0.000001;
const FRICTION_FACTOR = 0.001;
const MIN_ACCELERATION = 1e-10;

function advanceTween(tween, elapsedTime, preserveInfiniteEndTime) {
  if (elapsedTime !== elapsedTime || elapsedTime < tween.delay) return;

  let currentTime = tween.$lastTime;
  let currentValue = tween.currentValue;
  let velocity = tween.velocity;
  const {toValue, mass, tension, friction, minAcceleration} = tween;

  for (; currentTime < elapsedTime; currentTime++) {
    const acceleration = (tension * (toValue - currentValue) - friction * velocity) / mass;
    if (Math.abs(acceleration) < minAcceleration) {
      currentValue = toValue;
      velocity = 0;
      tween.$endTime = preserveInfiniteEndTime ? Infinity : currentTime;
      break;
    }

    velocity += acceleration;
    currentValue += velocity;
  }

  tween.currentValue = currentValue;
  tween.velocity = velocity;
  tween.callback(currentValue);
  tween.$lastTime = elapsedTime;
}

class SpringTween {
  constructor(callback, fromValue, toValue, springConfig, initialVelocity = 0, delay = 0) {
    const config = typeof springConfig === 'string'
      ? SPRING_PRESETS[springConfig]
      : springConfig;
    const {
      mass = SPRING_PRESETS.default.mass,
      tension = SPRING_PRESETS.default.tension,
      friction = SPRING_PRESETS.default.friction
    } = config || SPRING_PRESETS.default;

    this.isSpring = true;
    this.callback = callback;
    this.currentValue = fromValue;
    this.toValue = toValue;
    this.velocity = initialVelocity;
    this.delay = delay;
    this.mass = mass;
    this.tension = tension * TENSION_FACTOR;
    this.friction = friction * FRICTION_FACTOR;
    this.minAcceleration = MIN_ACCELERATION;
    this.$lastTime = delay;
    this.$endTime = Infinity;
  }

  gotoElapsedTime(elapsedTime) {
    advanceTween(this, elapsedTime, false);
  }

  gotoEnd() {
    advanceTween(this, this.$endTime, this.$endTime === Infinity);
  }

  isDoneAtElapsedTime(elapsedTime) {
    return elapsedTime >= this.$endTime;
  }
}

module.exports = {default: SpringTween};
