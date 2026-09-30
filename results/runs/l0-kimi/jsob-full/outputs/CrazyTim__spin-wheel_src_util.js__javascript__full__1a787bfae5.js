function getRandomInt(min = 0, max = 1) {
    const _0x130acb = {
        add: (a, b) => a + b,
        multiply: (a, b) => a * b,
        subtract: (a, b) => a - b
    };
    min = Math.ceil(min);
    max = Math.floor(max);
    return _0x130acb.add(Math.floor(_0x130acb.multiply(Math.random(), _0x130acb.subtract(max, min))), min);
}

function getRandomFloat(min = 0, max = 1, decimals = 2) {
    const _0x23022d = {
        parseFloat: (a) => parseFloat(a),
        add: (a, b) => a + b,
        multiply: (a, b) => a * b,
        subtract: (a, b) => a - b
    };
    return _0x23022d.parseFloat(_0x23022d.add(_0x23022d.multiply(Math.random(), _0x23022d.subtract(max, min)), min).toFixed(decimals));
}

function degRad(degrees = 0) {
    const _0x9c3427 = {
        divide: (a, b) => a / b,
        multiply: (a, b) => a * b
    };
    return _0x9c3427.divide(_0x9c3427.multiply(degrees, Math.PI), 180);
}

function isAngleBetween(angle, start, end) {
    const _0x173e4f = {
        lessThan: (a, b) => a < b,
        lessThanOrEqual: (a, b) => a <= b
    };
    if (_0x173e4f.lessThan(start, end)) {
        return _0x173e4f.lessThanOrEqual(start, angle) && _0x173e4f.lessThan(angle, end);
    }
    return _0x173e4f.lessThan(start, angle) || _0x173e4f.lessThanOrEqual(angle, end);
}

function aveArray(arr = []) {
    let sum = 0;
    for (const item of arr) {
        if (item) {
            sum += typeof item === 'number' ? item : 1;
        }
    }
    return sum / arr.length || 0;
}

function getFontSizeToFit(text, font, maxWidth, ctx) {
    ctx.save();
    ctx.font = '10px ' + font;
    const width = ctx.measureText(text).width;
    ctx.restore();
    return maxWidth / width;
}

function isPointInCircle(point = { x: 0, y: 0 }, cx, cy, radius) {
    const _0x1ddda8 = {
        add: (a, b) => a + b,
        power: (a, b) => a ** b,
        subtract: (a, b) => a - b,
        lessThanOrEqual: (a, b) => a <= b
    };
    const distance = _0x1ddda8.add(_0x1ddda8.power(_0x1ddda8.subtract(point.x, cx), 2), _0x1ddda8.power(_0x1ddda8.subtract(point.y, cy), 2));
    return _0x1ddda8.lessThanOrEqual(distance, _0x1ddda8.power(radius, 2));
}

function translateXYToElement(point = { x: 0, y: 0 }, element = {}, scale = 1) {
    const _0x593b31 = {
        multiply: (a, b) => a * b,
        subtract: (a, b) => a - b
    };
    const rect = element.getBoundingClientRect();
    return {
        x: _0x593b31.multiply(_0x593b31.subtract(point.x, rect.left), scale),
        y: _0x593b31.multiply(_0x593b31.subtract(point.y, rect.top), scale)
    };
}

function getMouseButtonsPressed(event = {}) {
    return [1, 2, 4, 8, 16].filter(button => event.buttons & button);
}

function getAngle(x1, y1, x2, y2) {
    const _0x104b0f = {
        subtract: (a, b) => a - b,
        divide: (a, b) => a / b,
        lessThan: (a, b) => a < b
    };
    const dx = _0x104b0f.subtract(x1, x2);
    const dy = _0x104b0f.subtract(y1, y2);
    let angle = Math.atan2(-dy, -dx);
    angle *= _0x104b0f.divide(180, Math.PI);
    if (_0x104b0f.lessThan(angle, 0)) {
        angle += 360;
    }
    return angle;
}

function getDistanceBetweenPoints(p1 = { x: 0, y: 0 }, p2 = { x: 0, y: 0 }) {
    const _0x45fa24 = {
        subtract: (a, b) => a - b
    };
    return Math.hypot(_0x45fa24.subtract(p2.x, p1.x), _0x45fa24.subtract(p2.y, p1.y));
}

function addAngle(angle1 = 0, angle2 = 0) {
    const _0x594774 = {
        add: (a, b) => a + b,
        power: (a, b) => a ** b,
        subtract: (a, b) => a - b,
        lessThanOrEqual: (a, b) => a <= b,
        greaterThan: (a, b) => a > b,
        modulo: (a, b) => a % b,
        strictEqual: (a, b) => a === b
    };
    const sum = _0x594774.add(angle1, angle2);
    let result;
    if (_0x594774.lessThanOrEqual(sum, 360)) {
        result = _0x594774.modulo(sum, 360);
    } else {
        result = _0x594774.subtract(360, _0x594774.modulo(sum, 360));
    }
    if (_0x594774.strictEqual(result, 360)) {
        result = 0;
    }
    return result;
}

function diffAngle(angle1 = 0, angle2 = 0) {
    const _0x46c499 = {
        subtract: (a, b) => a - b,
        addAngle: (a, b) => addAngle(a, b)
    };
    const diff = _0x46c499.subtract(360, angle2);
    const result = _0x46c499.addAngle(angle1, diff);
    return _0x46c499.subtract(360, result);
}

function calcWheelRotationForTargetAngle(currentAngle = 0, targetAngle = 0, direction = 1) {
    const _0x5621ab = {
        modulo: (a, b) => a % b,
        add: (a, b) => a + b,
        fixFloat: (a) => fixFloat(a),
        strictEqual: (a, b) => a === b,
        subtract: (a, b) => a - b
    };
    let rotation = _0x5621ab.modulo(_0x5621ab.add(_0x5621ab.subtract(targetAngle, currentAngle), 360), 360);
    rotation = _0x5621ab.fixFloat(rotation);
    rotation = _0x5621ab.subtract(_0x5621ab.strictEqual(direction, 1) ? _0x5621ab.subtract(360, rotation) : _0x5621ab.subtract(0, rotation), 360);
    rotation *= direction;
    return _0x5621ab.subtract(currentAngle, rotation);
}

function isObject(value) {
    return typeof value === 'object' && !Array.isArray(value) && value !== null;
}

function isNumber(value) {
    return typeof value === 'number' && !Number.isNaN(value);
}

function setProp({ val, isValid, errorMessage, defaultValue, action = null }) {
    if (isValid) {
        return action ? action() : val;
    } else {
        if (val === void 0) {
            return defaultValue;
        }
    }
    throw new Error(errorMessage);
}

function fixFloat(num = 0) {
    return Number(num.toFixed(10));
}

function easeSinOut(t) {
    const _0x1bdeed = {
        divide: (a, b) => a / b,
        multiply: (a, b) => a * b
    };
    return Math.sin(_0x1bdeed.divide(_0x1bdeed.multiply(t, Math.PI), 2));
}

function getResizeObserver(element = {}, callback = {}) {
    if (window.ResizeObserver) {
        const observer = new ResizeObserver(() => {
            const _0x10cf07 = { resized: true };
            callback(_0x10cf07);
        });
        observer.observe(element);
        return {
            stop: () => {
                observer.unobserve(element);
                observer.disconnect();
            }
        };
    }
    window.addEventListener('resize', callback);
    return {
        stop: () => {
            window.removeEventListener('resize', callback);
        }
    };
}

export {
    addAngle,
    aveArray,
    calcWheelRotationForTargetAngle,
    degRad,
    diffAngle,
    easeSinOut,
    fixFloat,
    getAngle,
    getDistanceBetweenPoints,
    getFontSizeToFit,
    getMouseButtonsPressed,
    getRandomFloat,
    getRandomInt,
    getResizeObserver,
    isAngleBetween,
    isNumber,
    isObject,
    isPointInCircle,
    setProp,
    translateXYToElement
};
