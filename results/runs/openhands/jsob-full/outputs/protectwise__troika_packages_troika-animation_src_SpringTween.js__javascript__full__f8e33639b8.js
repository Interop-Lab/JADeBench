const SpringPresets = {
  default: {
    mass: 1,
    tension: 170,
    friction: 26,
  },
  gentle: {
    mass: 1,
    tension: 120,
    friction: 14,
  },
  wobbly: {
    mass: 1,
    tension: 180,
    friction: 12,
  },
  stiff: {
    mass: 1,
    tension: 210,
    friction: 20,
  },
  slow: {
    mass: 1,
    tension: 280,
    friction: 60,
  },
  molasses: {
    mass: 1,
    tension: 280,
    friction: 120,
  },
};

class AbstractTween {
  gotoElapsedTime(elapsedTime) {}

  gotoEnd() {}

  isDoneAtElapsedTime(elapsedTime) {}
}

const TENSION_FACTOR = 0.000001;
const FRICTION_FACTOR = 0.001;
const DEFAULT_SPRING = SpringPresets.default;

class SpringTween extends AbstractTween {
  constructor(
    callback,
    initialValue,
    targetValue,
    springConfig,
    initialVelocity = 0,
    delay = 0,
  ) {
    super();

    this.isSpring = true;
    this.callback = callback;
    this.currentValue = initialValue;
    this.toValue = targetValue;
    this.velocity = initialVelocity;
    this.delay = delay;

    if (typeof springConfig === "string") {
      springConfig = SpringPresets[springConfig];
    }
    springConfig ||= DEFAULT_SPRING;

    const { mass, tension, friction } = springConfig;
    this.mass = typeof mass === "number" ? mass : DEFAULT_SPRING.mass;
    this.tension =
      (typeof tension === "number" ? tension : DEFAULT_SPRING.tension) *
      TENSION_FACTOR;
    this.friction =
      (typeof friction === "number" ? friction : DEFAULT_SPRING.friction) *
      FRICTION_FACTOR;
    this.minAcceleration = 1e-10;
    this.$lastTime = delay;
    this.$endTime = Infinity;
  }

  gotoElapsedTime(elapsedTime) {
    if (elapsedTime < this.delay) {
      return;
    }

    const { toValue, mass, tension, friction, minAcceleration } = this;
    let velocity = this.velocity || 0;
    let currentValue = this.currentValue;

    for (let time = this.$lastTime; time < elapsedTime; time++) {
      const acceleration =
        (tension * (toValue - currentValue) - friction * velocity) / mass;

      if (Math.abs(acceleration) < minAcceleration) {
        velocity = 0;
        currentValue = toValue;
        this.$endTime = time;
        break;
      }

      velocity += acceleration;
      currentValue += velocity;
    }

    this.velocity = velocity;
    this.$lastTime = elapsedTime;
    this.callback((this.currentValue = currentValue));
  }

  gotoEnd() {
    this.velocity = 0;
    this.$lastTime = this.$endTime;
    this.callback((this.currentValue = this.toValue));
  }

  isDoneAtElapsedTime(elapsedTime) {
    return elapsedTime >= this.$endTime;
  }
}

const exportsObject = {};
Object.defineProperty(exportsObject, "__esModule", { value: true });
Object.defineProperty(exportsObject, "default", {
  enumerable: true,
  get: () => SpringTween,
});
module.exports = exportsObject;
