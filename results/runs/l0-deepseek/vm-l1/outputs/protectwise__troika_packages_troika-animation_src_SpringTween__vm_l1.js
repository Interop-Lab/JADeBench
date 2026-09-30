const SpringPresets = {
  default: { mass: 1, tension: 170, friction: 26 },
  gentle: { mass: 1, tension: 120, friction: 14 },
  wobbly: { mass: 1, tension: 180, friction: 12 },
  stiff: { mass: 1, tension: 210, friction: 20 },
  slow: { mass: 1, tension: 280, friction: 60 },
  molasses: { mass: 1, tension: 280, friction: 120 }
};

class AbstractTween {
  gotoElapsedTime(_elapsed) {}
  gotoEnd() {}
  isDoneAtElapsedTime(_elapsed) {}
}

const tensionFactor = 0.000001;
const frictionFactor = 0.001;
const DEFAULTS = SpringPresets.default;

class SpringTween extends AbstractTween {
  constructor(startValue, endValue, preset, options = {}, startTime = 0, endTime = 0) {
    super();
    this.startValue = startValue;
    this.endValue = endValue;
    this.preset = preset;
    this.options = options;
    this.startTime = startTime;
    this.endTime = endTime;
  }

  gotoElapsedTime(elapsed) {
    const { mass, tension, friction } = this.preset;
    const t = tension * tensionFactor;
    const f = friction * frictionFactor;
    const m = mass;
    const omega = Math.sqrt(t / m);
    const zeta = f / (2 * Math.sqrt(t * m));
    const progress = elapsed / (this.endTime - this.startTime);
    const value = this.startValue + (this.endValue - this.startValue) * progress;
    return value;
  }

  gotoEnd() {
    return this.endValue;
  }

  isDoneAtElapsedTime(elapsed) {
    return elapsed >= this.endTime;
  }
}

const SpringTween_default = SpringTween;

module.exports = { default: SpringTween_default };
