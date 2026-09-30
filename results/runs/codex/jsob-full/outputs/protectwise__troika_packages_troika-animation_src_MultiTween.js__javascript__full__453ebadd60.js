'use strict';

function number(from, to, progress) {
  return from + (to - from) * progress;
}

function linear(progress) {
  return progress;
}

class AbstractTween {
  gotoElapsedTime(_elapsedTime) {}
  gotoEnd() {}
  isDoneAtElapsedTime(_elapsedTime) {}
}

class Tween extends AbstractTween {
  constructor(
    callback,
    fromValue,
    toValue,
    duration = 1000,
    delay = 0,
    easing = linear,
    iterations = 1,
    direction = 'forward',
    interpolate = number,
  ) {
    super();
    this.callback = callback;
    this.fromValue = fromValue;
    this.toValue = toValue;
    this.duration = duration;
    this.delay = delay;
    this.easing = easing;
    this.iterations = iterations;
    this.direction = direction;
    this.interpolate = interpolate;
    this.totalElapsed = iterations === Infinity
      ? Number.MAX_SAFE_INTEGER
      : delay + duration * iterations;
  }

  gotoElapsedTime(elapsedTime) {
    if (elapsedTime < this.delay) return;

    const animationTime = Math.min(elapsedTime - this.delay, this.duration * this.iterations);
    let iteration = animationTime === 0 ? 0 : Math.ceil(animationTime / this.duration) - 1;
    iteration = Math.min(iteration, this.iterations - 1);
    let progress = this.duration === 0 ? 1 : (animationTime - iteration * this.duration) / this.duration;

    if (animationTime === 0 && this.direction === 'alternate') progress = 1;
    if (this.direction === 'reverse' || (this.direction === 'alternate' && iteration % 2 === 1)) {
      progress = 1 - progress;
    }

    const value = this.interpolate(this.fromValue, this.toValue, this.easing(progress));
    if (this.callback) this.callback(value);
  }

  gotoEnd() {
    this.gotoElapsedTime(this.totalElapsed);
  }

  isDoneAtElapsedTime(elapsedTime) {
    return elapsedTime > this.totalElapsed;
  }
}

class MultiTween extends Tween {
  constructor(tweens, duration, delay, easing, iterations, direction) {
    if (typeof duration === 'undefined') {
      duration = tweens.reduce((maximum, tween) => Math.max(maximum, tween.endTime), 0);
    }
    if (duration === Infinity) duration = Number.MAX_VALUE;

    super(null, 0, duration, duration, delay, easing, iterations, direction);

    if (tweens.length === 1) {
      this.callback = tweens[0].gotoElapsedTime.bind(tweens[0]);
    } else {
      this.callback = this._syncTweens;
    }
    this.tweens = tweens;
  }

  _syncTweens(elapsedTime) {
    for (let index = 0, length = this.tweens.length; index < length; index++) {
      this.tweens[index].gotoElapsedTime(elapsedTime);
    }
  }
}

function endTimeComparator(left, right) {
  return left.endTime - right.endTime;
}

const exported = {};
Object.defineProperty(exported, '__esModule', { value: true });
Object.defineProperty(exported, 'default', {
  get: () => MultiTween,
  enumerable: true,
});
module.exports = exported;
