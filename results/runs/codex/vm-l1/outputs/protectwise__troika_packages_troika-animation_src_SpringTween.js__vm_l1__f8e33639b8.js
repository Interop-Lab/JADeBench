const SPRING_PRESETS = {
  default: { mass: 1, tension: 170, friction: 26 },
  gentle: { mass: 1, tension: 120, friction: 14 },
  wobbly: { mass: 1, tension: 180, friction: 12 },
  stiff: { mass: 1, tension: 210, friction: 20 },
  slow: { mass: 1, tension: 280, friction: 60 },
  molasses: { mass: 1, tension: 280, friction: 120 },
};

class AbstractTween {
  gotoElapsedTime(elapsedTime) {}
  gotoEnd() {}
  isDoneAtElapsedTime(elapsedTime) {}
}

const tensionFactor = 0.000001;
const frictionFactor = 0.001;
const DEFAULTS = SPRING_PRESETS.default;

class SpringTween extends AbstractTween {
  constructor(callback, currentValue, toValue, springConfig, velocity = 0, delay = 0) {
    super();
    const config = springConfig || DEFAULTS;
    this.isSpring = true;
    this.callback = callback;
    this.currentValue = currentValue;
    this.toValue = toValue;
    this.velocity = velocity;
    this.delay = delay;
    this.mass = typeof config.mass === 'number' ? config.mass : DEFAULTS.mass;
    this.tension = (typeof config.tension === 'number' ? config.tension : DEFAULTS.tension) * tensionFactor;
    this.friction = (typeof config.friction === 'number' ? config.friction : DEFAULTS.friction) * frictionFactor;
    this.minAcceleration = 1e-10;
    this.$lastTime = delay;
    this.$endTime = Infinity;
  }

  gotoElapsedTime(elapsedTime) {
    if (elapsedTime >= this.delay) {
      let velocity = this.velocity || 0;
      for (let time = this.$lastTime; time < elapsedTime; time++) {
        const acceleration = (
          (this.toValue - this.currentValue) * this.tension
          - velocity * this.friction
        ) / this.mass;
        if (Math.abs(acceleration) < this.minAcceleration) {
          this.currentValue = this.toValue;
          velocity = 0;
          this.$endTime = time;
          break;
        }
        velocity += acceleration;
        this.currentValue += velocity;
      }
      this.velocity = velocity;
      this.$lastTime = elapsedTime;
      this.callback(this.currentValue);
    }
  }

  gotoEnd() {
    this.currentValue = this.toValue;
    this.velocity = 0;
    this.$lastTime = this.$endTime;
    this.callback(this.currentValue);
  }

  isDoneAtElapsedTime(elapsedTime) {
    return elapsedTime >= this.$endTime;
  }
}

Object.defineProperty(exports, '__esModule', { value: true });
Object.defineProperty(exports, 'default', { enumerable: true, get: () => SpringTween });
