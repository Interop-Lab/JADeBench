const { pow, PI, sqrt } = Math;
const HALF_PI = PI / 2;
const TWO_PI = PI * 2;

function makeInOut(easeIn, easeOut) {
    return function(t) {
        return t < 0.5 ? easeIn(t * 2) / 2 : easeOut(t * 2 - 1) / 2 + 0.5;
    };
}

function makeExpIn(exponent) {
    return function(t) {
        return pow(t, exponent);
    };
}

function makeExpOut(exponent) {
    return function(t) {
        return 1 - pow(1 - t, exponent);
    };
}

function makeExpInOut(exponent) {
    return makeInOut(makeExpIn(exponent), makeExpOut(exponent));
}

const linear = t => t;

const easeInQuad = makeExpIn(2);
const easeOutQuad = makeExpOut(2);
const easeInOutQuad = makeExpInOut(2);

const easeInCubic = makeExpIn(3);
const easeOutCubic = makeExpOut(3);
const easeInOutCubic = makeExpInOut(3);

const easeInQuart = makeExpIn(4);
const easeOutQuart = makeExpOut(4);
const easeInOutQuart = makeExpInOut(4);

const easeInQuint = makeExpIn(5);
const easeOutQuint = makeExpOut(5);
const easeInOutQuint = makeExpInOut(5);

const easeInSine = t => 1 - cos(t * HALF_PI);
const easeOutSine = t => sin(t * HALF_PI);
const easeInOutSine = t => -(cos(PI * t) - 1) / 2;

const easeInExpo = t => t === 0 ? 0 : pow(2, 10 * (t - 1));
const easeOutExpo = t => t === 1 ? 1 : 1 - pow(2, -10 * t);
const easeInOutExpo = t => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    return t < 0.5 ? pow(2, 20 * t - 10) / 2 : (2 - pow(2, -20 * t + 10)) / 2;
};

const easeInCirc = t => 1 - sqrt(1 - t * t);
const easeOutCirc = t => sqrt(1 - pow(t - 1, 2));
const easeInOutCirc = makeInOut(easeInCirc, easeOutCirc);

const easeInElastic = t => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    return -pow(2, 10 * (t - 1)) * sin((t - 1.1) * 5 * TWO_PI);
};

const easeOutElastic = t => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    return pow(2, -10 * t) * sin((t - 0.1) * 5 * TWO_PI) + 1;
};

const easeInOutElastic = makeInOut(easeInElastic, easeOutElastic);

const easeInBack = t => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return c3 * t * t * t - c1 * t * t;
};

const easeOutBack = t => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * pow(t - 1, 3) + c1 * pow(t - 1, 2);
};

const easeInOutBack = t => {
    const c1 = 1.70158;
    const c2 = c1 * 1.525;
    return t < 0.5
        ? (pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
        : (pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
};

const easeInBounce = t => 1 - easeOutBounce(1 - t);

const easeOutBounce = t => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) {
        return n1 * t * t;
    } else if (t < 2 / d1) {
        return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
        return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
        return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
};

const easeInOutBounce = makeInOut(easeInBounce, easeOutBounce);

const colorValueToNumber = (function() {
    let canvas, ctx;
    const cache = Object.create(null);
    let cacheSize = 0;
    const MAX_CACHE_SIZE = 2048;

    return function(value) {
        if (typeof value === 'number') return value;
        if (typeof value === 'string') {
            if (value in cache) return cache[value];
            if (!canvas) {
                canvas = document.createElement('canvas');
                ctx = canvas.getContext('2d');
            }
            canvas.width = canvas.height = 1;
            ctx.fillStyle = value;
            ctx.fillRect(0, 0, 1, 1);
            const data = ctx.getImageData(0, 0, 1, 1).data;
            const result = rgbToNumber(data[0], data[1], data[2]);
            if (cacheSize > MAX_CACHE_SIZE) {
                for (const key in cache) delete cache[key];
                cacheSize = 0;
            }
            cache[value] = result;
            cacheSize++;
            return result;
        }
        return value && value.getHex ? value.getHex() : 0;
    };
})();

function rgbToNumber(r, g, b) {
    return (r << 16) | (g << 8) | b;
}

function number(start, end, t) {
    return start + (end - start) * t;
}

function color(start, end, t) {
    const startNum = colorValueToNumber(start);
    const endNum = colorValueToNumber(end);
    const r1 = (startNum >> 16) & 0xFF;
    const g1 = (startNum >> 8) & 0xFF;
    const b1 = startNum & 0xFF;
    const r2 = (endNum >> 16) & 0xFF;
    const g2 = (endNum >> 8) & 0xFF;
    const b2 = endNum & 0xFF;
    const r = Math.round(r1 + (r2 - r1) * t);
    const g = Math.round(g1 + (g2 - g1) * t);
    const b = Math.round(b1 + (b2 - b1) * t);
    return rgbToNumber(r, g, b);
}

const linear2 = t => t;

const maxSafeInteger = 0x1FFFFFFFFFFFFF;

class AbstractTween {
    gotoElapsedTime(elapsed) {}
    gotoEnd() {}
    isDoneAtElapsedTime(elapsed) { return false; }
}

class Tween extends AbstractTween {
    constructor(target, property, endValue, duration = 750, delay = 0, easing = linear2, repeat = 1, yoyo = 'forward', type = 'number') {
        super();
        this.target = target;
        this.property = property;
        this.startValue = target[property];
        this.endValue = endValue;
        this.duration = duration;
        this.delay = delay;
        this.easing = easing;
        this.repeat = repeat;
        this.yoyo = yoyo;
        this.type = type;
        this.elapsed = 0;
        this.direction = 1;
        this.currentRepeat = 0;
    }

    gotoElapsedTime(elapsed) {
        'use strict';
        this.elapsed = elapsed;
        const totalDuration = this.delay + this.duration;
        let progress = 0;
        
        if (elapsed <= this.delay) {
            progress = 0;
        } else if (elapsed >= totalDuration * this.repeat) {
            progress = 1;
        } else {
            const cycleElapsed = (elapsed - this.delay) % this.duration;
            progress = cycleElapsed / this.duration;
        }
        
        const easedProgress = this.easing(progress);
        const interpolator = this.type === 'color' ? color : number;
        this.target[this.property] = interpolator(this.startValue, this.endValue, easedProgress);
    }

    gotoEnd() {
        'use strict';
        this.gotoElapsedTime(this.delay + this.duration * this.repeat);
    }

    isDoneAtElapsedTime(elapsed) {
        'use strict';
        return elapsed >= this.delay + this.duration * this.repeat;
    }
}

const Tween_default = Tween;

const Easings_exports = {
    easeInBack,
    easeInBounce,
    easeInCirc,
    easeInCubic,
    easeInElastic,
    easeInExpo,
    easeInOutBack,
    easeInOutBounce,
    easeInOutCirc,
    easeInOutCubic,
    easeInOutElastic,
    easeInOutExpo,
    easeInOutQuad,
    easeInOutQuart,
    easeInOutQuint,
    easeInOutSine,
    easeInQuad,
    easeInQuart,
    easeInQuint,
    easeInSine,
    easeOutBack,
    easeOutBounce,
    easeOutCirc,
    easeOutCubic,
    easeOutElastic,
    easeOutExpo,
    easeOutQuad,
    easeOutQuart,
    easeOutQuint,
    easeOutSine,
    linear
};

const Interpolators_exports = {
    color,
    number
};

const Tween_exports = {
    default: Tween_default
};

module.exports = {
    ...Easings_exports,
    ...Interpolators_exports,
    Tween: Tween_default,
    AbstractTween,
    rgbToNumber,
    colorValueToNumber,
    maxSafeInteger,
    linear2,
    HALF_PI,
    TWO_PI,
    makeInOut,
    makeExpIn,
    makeExpOut,
    makeExpInOut
};
