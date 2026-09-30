const {pow, PI, sqrt} = Math;
const HALF_PI = PI / 2;
const TWO_PI = PI * 2;

function makeInOut(easeIn, easeOut) {
    return function(t) {
        return t < 0.5 ? easeIn(t * 2) / 2 : easeOut(t * 2 - 1) / 2 + 0.5;
    };
}

function makeExpIn(exp) {
    return function(t) {
        return pow(t, exp);
    };
}

function makeExpOut(exp) {
    return function(t) {
        return 1 - pow(1 - t, exp);
    };
}

function makeExpInOut(exp) {
    return makeInOut(makeExpIn(exp), makeExpOut(exp));
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

const easeInSine = t => 1 - Math.cos(t * HALF_PI);
const easeOutSine = t => Math.sin(t * HALF_PI);
const easeInOutSine = t => (1 - Math.cos(t * PI)) / 2;

const easeInExpo = t => t === 0 ? 0 : pow(2, 10 * (t - 1));
const easeOutExpo = t => t === 1 ? 1 : 1 - pow(2, -10 * t);
const easeInOutExpo = t => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    return t < 0.5 ? pow(2, 20 * t - 10) / 2 : (2 - pow(2, -20 * t + 10)) / 2;
};

const easeInCirc = t => 1 - sqrt(1 - t * t);
const easeOutCirc = t => sqrt(1 - (t - 1) * (t - 1));
const easeInOutCirc = makeInOut(easeInCirc, easeOutCirc);

const easeInElastic = t => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    return -pow(2, 10 * (t - 1)) * Math.sin((t - 1.1) * 5 * PI);
};

const easeOutElastic = t => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    return pow(2, -10 * t) * Math.sin((t - 0.1) * 5 * PI) + 1;
};

const easeInOutElastic = makeInOut(easeInElastic, easeOutElastic);

const easeInBack = t => t * t * (2.70158 * t - 1.70158);
const easeOutBack = t => 1 + (t - 1) * (t - 1) * (2.70158 * (t - 1) + 1.70158);
const easeInOutBack = t => {
    const c1 = 1.70158;
    const c2 = c1 * 1.525;
    return t < 0.5 
        ? (pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
        : (pow(2 * t - 2, 2) * ((c2 + 1) * (2 * t - 2) + c2) + 2) / 2;
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
            const num = rgbToNumber(data[0], data[1], data[2]);
            if (cacheSize > MAX_CACHE_SIZE) {
                for (const key in cache) delete cache[key];
                cacheSize = 0;
            }
            cache[value] = num;
            cacheSize++;
            return num;
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
    const s = colorValueToNumber(start);
    const e = colorValueToNumber(end);
    const sr = (s >> 16) & 0xFF;
    const sg = (s >> 8) & 0xFF;
    const sb = s & 0xFF;
    const er = (e >> 16) & 0xFF;
    const eg = (e >> 8) & 0xFF;
    const eb = e & 0xFF;
    const r = Math.round(sr + (er - sr) * t);
    const g = Math.round(sg + (eg - sg) * t);
    const b = Math.round(sb + (eb - sb) * t);
    return rgbToNumber(r, g, b);
}

class AbstractTween {
    gotoElapsedTime(elapsedTime) {}
    gotoEnd() {}
    isDoneAtElapsedTime(elapsedTime) { return false; }
}

const linear2 = t => t;
const maxSafeInteger = 0x1FFFFFFFFFFFFF;

class Tween extends AbstractTween {
    constructor(target, startValue, endValue, duration = 750, startTime = 0, easing = linear2, repeat = 1, yoyo = false, onComplete = null) {
        super();
        this.target = target;
        this.startValue = startValue;
        this.endValue = endValue;
        this.duration = duration;
        this.startTime = startTime;
        this.easing = easing;
        this.repeat = repeat;
        this.yoyo = yoyo;
        this.onComplete = onComplete;
        this._currentValue = startValue;
    }
    
    gotoElapsedTime(elapsedTime) {
        const localTime = elapsedTime - this.startTime;
        if (localTime < 0) {
            this._currentValue = this.startValue;
            return;
        }
        const totalDuration = this.duration * this.repeat;
        if (localTime >= totalDuration) {
            this._currentValue = this.yoyo && this.repeat % 2 === 0 ? this.startValue : this.endValue;
            if (this.onComplete) this.onComplete();
            return;
        }
        const cycleTime = localTime % this.duration;
        const cycle = Math.floor(localTime / this.duration);
        const t = cycleTime / this.duration;
        const easedT = this.easing(this.yoyo && cycle % 2 === 1 ? 1 - t : t);
        this._currentValue = typeof this.startValue === 'number' && typeof this.endValue === 'number'
            ? number(this.startValue, this.endValue, easedT)
            : color(this.startValue, this.endValue, easedT);
    }
    
    gotoEnd() {
        this._currentValue = this.yoyo && this.repeat % 2 === 0 ? this.startValue : this.endValue;
    }
    
    isDoneAtElapsedTime(elapsedTime) {
        return elapsedTime >= this.startTime + this.duration * this.repeat;
    }
    
    get currentValue() {
        return this._currentValue;
    }
}

class MultiTween extends Tween {
    constructor(tweens, duration, startTime, easing, repeat, yoyo) {
        if (typeof duration !== 'number') {
            duration = tweens.reduce((max, t) => Math.max(max, t.startTime + t.duration * t.repeat), 0);
        }
        if (duration === Infinity) duration = Number.MAX_VALUE;
        super(null, 0, duration, duration, startTime, easing, repeat, yoyo);
        this.tweens = tweens;
        this._syncTweens = [];
    }
    
    gotoElapsedTime(elapsedTime) {
        this._syncTweens = this.tweens.filter(t => !t.isDoneAtElapsedTime(elapsedTime));
        for (const tween of this._syncTweens) {
            tween.gotoElapsedTime(elapsedTime);
        }
    }
}

function endTimeComparator(a, b) {
    const endA = a.startTime + a.duration * a.repeat;
    const endB = b.startTime + b.duration * b.repeat;
    return endA - endB;
}

const Easings_exports = {
    easeInBack, easeInBounce, easeInCirc, easeInCubic, easeInElastic, easeInExpo,
    easeInOutBack, easeInOutBounce, easeInOutCirc, easeInOutCubic, easeInOutElastic,
    easeInOutExpo, easeInOutQuad, easeInOutQuart, easeInOutQuint, easeInOutSine,
    easeInQuad, easeInQuart, easeInQuint, easeInSine, easeOutBack, easeOutBounce,
    easeOutCirc, easeOutCubic, easeOutElastic, easeOutExpo, easeOutQuad, easeOutQuart,
    easeOutQuint, easeOutSine, linear
};

const Interpolators_exports = {
    color,
    number
};

const __defProp = Object.defineProperty;
const __getOwnPropDesc = Object.getOwnPropertyDescriptor;
const __getOwnPropNames = Object.getOwnPropertyNames;
const __hasOwnProp = Object.prototype.hasOwnProperty;

const __export = (target, all) => {
    for (const name in all) __defProp(target, name, { get: all[name], enumerable: true });
};

const __copyProps = (to, from, except, desc) => {
    if (from && typeof from === 'object' || typeof from === 'function') {
        for (const key of __getOwnPropNames(from)) {
            if (!__hasOwnProp.call(to, key) && key !== except) {
                __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
            }
        }
    }
    return to;
};

const __toCommonJS = (mod) => __copyProps(__defProp({}, '__esModule', { value: true }), mod);

const MultiTween_exports = {};
__export(MultiTween_exports, {
    default: () => MultiTween
});
module.exports = __toCommonJS(MultiTween_exports);

const Easings_exports_commonjs = {};
__export(Easings_exports_commonjs, Easings_exports);

const Interpolators_exports_commonjs = {};
__export(Interpolators_exports_commonjs, Interpolators_exports);

globalThis.makeInOut = makeInOut;
globalThis.makeExpIn = makeExpIn;
globalThis.makeExpOut = makeExpOut;
globalThis.makeExpInOut = makeExpInOut;
globalThis.number = number;
globalThis.color = color;
globalThis.rgbToNumber = rgbToNumber;
globalThis.endTimeComparator = endTimeComparator;
globalThis.sqrt = sqrt;
globalThis.PI = PI;
globalThis.pow = pow;
globalThis.HALF_PI = HALF_PI;
globalThis.TWO_PI = TWO_PI;
globalThis.linear = linear;
globalThis.easeInQuad = easeInQuad;
globalThis.easeOutQuad = easeOutQuad;
globalThis.easeInOutQuad = easeInOutQuad;
globalThis.easeInCubic = easeInCubic;
globalThis.easeOutCubic = easeOutCubic;
globalThis.easeInOutCubic = easeInOutCubic;
globalThis.easeInQuart = easeInQuart;
globalThis.easeOutQuart = easeOutQuart;
globalThis.easeInOutQuart = easeInOutQuart;
globalThis.easeInQuint = easeInQuint;
globalThis.easeOutQuint = easeOutQuint;
globalThis.easeInOutQuint = easeInOutQuint;
globalThis.easeInSine = easeInSine;
globalThis.easeOutSine = easeOutSine;
globalThis.easeInOutSine = easeInOutSine;
globalThis.easeInExpo = easeInExpo;
globalThis.easeOutExpo = easeOutExpo;
globalThis.easeInOutExpo = easeInOutExpo;
globalThis.easeInCirc = easeInCirc;
globalThis.easeOutCirc = easeOutCirc;
globalThis.easeInOutCirc = easeInOutCirc;
globalThis.easeInElastic = easeInElastic;
globalThis.easeOutElastic = easeOutElastic;
globalThis.easeInOutElastic = easeInOutElastic;
globalThis.easeInBack = easeInBack;
globalThis.easeOutBack = easeOutBack;
globalThis.easeInOutBack = easeInOutBack;
globalThis.easeInBounce = easeInBounce;
globalThis.easeOutBounce = easeOutBounce;
globalThis.easeInOutBounce = easeInOutBounce;
globalThis.colorValueToNumber = colorValueToNumber;
globalThis.AbstractTween = AbstractTween;
globalThis.linear2 = linear2;
globalThis.maxSafeInteger = maxSafeInteger;
globalThis.Tween = Tween;
globalThis.Tween_default = Tween;
globalThis.MultiTween = MultiTween;
globalThis.MultiTween_default = MultiTween;
