'use strict';

class AbstractTween {
  gotoElapsedTime(elapsedTime) {}
  gotoEnd() {}
  isDoneAtElapsedTime(elapsedTime) {}
}

const interpolators = {
  number(fromValue, toValue, progress) {
    return fromValue + (toValue - fromValue) * progress;
  },

  color(fromValue, toValue, progress) {
    const fromRed = (fromValue >> 16) & 255;
    const fromGreen = (fromValue >> 8) & 255;
    const fromBlue = fromValue & 255;
    const toRed = (toValue >> 16) & 255;
    const toGreen = (toValue >> 8) & 255;
    const toBlue = toValue & 255;
    return rgbToNumber(
      fromRed + (toRed - fromRed) * progress,
      fromGreen + (toGreen - fromGreen) * progress,
      fromBlue + (toBlue - fromBlue) * progress
    );
  }
};

function rgbToNumber(red, green, blue) {
  return (red << 16) | (green << 8) | blue;
}

const linear = progress => progress;
const maxSafeInteger = 0x1fffffffffffff;

class Tween extends AbstractTween {
  constructor(
    callback,
    fromValue,
    toValue,
    duration = 750,
    delay = 0,
    easing = linear,
    iterations = 1,
    direction = 'forward',
    interpolate = 'number'
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
    this.interpolate = typeof interpolate === 'function'
      ? interpolate
      : interpolators[interpolate] || interpolators.number;
    this.totalElapsed = iterations === Infinity
      ? maxSafeInteger
      : delay + duration * iterations;
  }

  gotoElapsedTime(elapsedTime) {
    if (elapsedTime < this.delay) return;

    const activeElapsed = elapsedTime - this.delay;
    const completedIterations = Math.floor(activeElapsed / this.duration);
    const atIterationEnd = activeElapsed > 0 && activeElapsed % this.duration === 0;
    const atOrPastEnd = elapsedTime >= this.totalElapsed;
    let progress = atOrPastEnd || atIterationEnd
      ? 1
      : (activeElapsed % this.duration) / this.duration;
    let reverse = this.direction === 'reverse';

    if (this.direction === 'alternate') {
      const currentIteration = completedIterations - (atIterationEnd ? 1 : 0);
      reverse = activeElapsed === 0 || currentIteration % 2 === 1;
    }

    progress = this.easing(progress);
    if (reverse) progress = 1 - progress;
    this.callback(this.interpolate(this.fromValue, this.toValue, progress));
  }

  gotoEnd() {
    this.gotoElapsedTime(this.totalElapsed);
  }

  isDoneAtElapsedTime(elapsedTime) {
    return elapsedTime > this.totalElapsed;
  }
}

class MultiTween extends Tween {
  constructor(tweens, duration, easing, iterations, direction, interpolate) {
    if (typeof duration !== 'number') {
      duration = tweens.reduce(
        (latestEnd, tween) => Math.max(latestEnd, tween.totalElapsed),
        0
      );
    }
    if (duration === Infinity) duration = Number.MAX_VALUE;

    super(null, 0, duration, duration, 0, easing, iterations, direction, interpolate);
    this.callback = this._syncTweens;
    this.tweens = tweens.sort(endTimeComparator);
  }

  _syncTweens(elapsedTime) {
    for (const tween of this.tweens) {
      tween.gotoElapsedTime(elapsedTime);
    }
  }
}

function endTimeComparator(first, second) {
  return first.totalElapsed - second.totalElapsed;
}

Object.defineProperty(exports, '__esModule', { value: true });
Object.defineProperty(exports, 'default', {
  enumerable: true,
  get: () => MultiTween
});
