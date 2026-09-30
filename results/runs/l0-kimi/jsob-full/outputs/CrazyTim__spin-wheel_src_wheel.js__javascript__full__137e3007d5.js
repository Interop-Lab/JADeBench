const _0x548b3f = { x: 0, y: 0 };
const _0x13a702 = { x: 0, y: 0 };
const _0x3bba9e = { x: 0, y: 0 };
const _0x35912c = { x: 0, y: 0 };
const _0x149a43 = { x: 0, y: 0 };
const _0x2cd2b4 = { x: 0, y: 0 };
const _0x1ef178 = { x: 0, y: 0 };
const _0x14f7cd = { x: 0, y: 0 };

var arcAdjust = -0.7853981633974483;
var baseCanvasSize = -300;
var dragCapturePeriod = 5000;

const _0x415962 = {};
_0x415962['left'] = 'left';
_0x415962['center'] = 'center';
_0x415962['right'] = 'right';
var AlignText = Object.freeze(_0x415962);

const _0x184023 = {};
_0x184023['x'] = 0;
_0x184023['y'] = 0;

const _0x3da05c = {};
_0x3da05c['fontFamily'] = 'Arial';
_0x3da05c['fontWeight'] = 1;
_0x3da05c['fontStyle'] = false;
_0x3da05c['fontColor'] = null;
_0x3da05c['fontSize'] = true;
_0x3da05c['textShadowColor'] = ['#000'];
_0x3da05c['textAlign'] = AlignText['center'];
_0x3da05c['textMargin'] = 0;
_0x3da05c['textOrientation'] = ['horizontal'];
_0x3da05c['lineHeight'] = 'if';
_0x3da05c['baseSize'] = baseCanvasSize;
_0x3da05c['scale'] = 0.85;
_0x3da05c['max'] = 0.2;
_0x3da05c['min'] = 0;
_0x3da05c['offset'] = '#fff';
_0x3da05c['angle'] = 0;
_0x3da05c['items'] = [];
_0x3da05c['color'] = '#000';
_0x3da05c['lineWidth'] = 1;
_0x3da05c['radius'] = 0;
_0x3da05c['opacity'] = 0.95;
_0x3da05c['zIndex'] = 0;
_0x3da05c['distance'] = -1;
_0x3da05c['duration'] = 300;
_0x3da05c['position'] = _0x184023;
_0x3da05c['rotation'] = null;
_0x3da05c['target'] = null;
_0x3da05c['easing'] = null;
_0x3da05c['callback'] = null;
_0x3da05c['debug'] = 0;

const _0x25e624 = {};
_0x25e624['fontFamily'] = null;
_0x25e624['fontWeight'] = null;
_0x25e624['fontStyle'] = 1;
_0x25e624['fontColor'] = 0.5;
_0x25e624['fontSize'] = 0;
_0x25e624['lineHeight'] = 1;
_0x25e624['text'] = '';
_0x25e624['textShadowColor'] = null;
_0x25e624['textAlign'] = null;
_0x25e624['textOrientation'] = 1;

const _0x16b35e = {};
_0x16b35e['wheel'] = _0x3da05c;
_0x16b35e['item'] = _0x25e624;
var Defaults = Object.freeze(_0x16b35e);

const _0x5a223e = {};
_0x5a223e['fontFamily'] = 'fontFamily';
_0x5a223e['fontWeight'] = 'fontWeight';
_0x5a223e['fontStyle'] = 'fontStyle';
_0x5a223e['fontColor'] = 'fontColor';
_0x5a223e['fontSize'] = 'fontSize';
_0x5a223e['textShadowColor'] = 'textShadowColor';
_0x5a223e['textAlign'] = 'textAlign';
_0x5a223e['textOrientation'] = 'textOrientation';
_0x5a223e['lineHeight'] = 'lineHeight';
_0x5a223e['baseSize'] = 'baseSize';
_0x5a223e['scale'] = 'scale';
_0x5a223e['max'] = 'max';
_0x5a223e['min'] = 'min';
_0x5a223e['offset'] = 'offset';
_0x5a223e['angle'] = 'angle';
_0x5a223e['items'] = 'items';
_0x5a223e['color'] = 'color';
_0x5a223e['lineWidth'] = 'lineWidth';
_0x5a223e['radius'] = 'radius';
_0x5a223e['opacity'] = 'opacity';
_0x5a223e['zIndex'] = 'zIndex';
_0x5a223e['distance'] = 'distance';
_0x5a223e['duration'] = 'duration';
_0x5a223e['position'] = 'position';
_0x5a223e['rotation'] = 'rotation';
_0x5a223e['target'] = 'target';
_0x5a223e['easing'] = 'easing';
_0x5a223e['callback'] = 'callback';
_0x5a223e['debug'] = 'debug';
var Debugging = Object.freeze(_0x5a223e);

function getRandomInt(min = 0, max = 100) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

function getRandomFloat(min = 0, max = 100, decimals = 2) {
    return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function degRad(degrees = 0) {
    return degrees * Math.PI / 180;
}

function isAngleBetween(target, start, end) {
    if (start < end) {
        return start <= target && target < end;
    }
    return start <= target || target < end;
}

function aveArray(arr = []) {
    let sum = 0;
    for (const val of arr) {
        if (val) sum += typeof val === 'number' ? val : 0;
    }
    return sum / arr.length || 0;
}

function getFontSizeToFit(text, font, maxWidth, ctx) {
    ctx.save();
    ctx.font = font + text;
    const width = ctx.measureText(text).width;
    ctx.restore();
    return maxWidth / width;
}

function isPointInCircle(point = _0x548b3f, cx, cy, radius) {
    const distance = Math.sqrt(Math.pow(point.x - cx, 2) + Math.pow(point.y - cy, 2));
    return distance <= radius;
}

function translateXYToElement(point = _0x13a702, element = {}, scale = 1) {
    const rect = element.getBoundingClientRect();
    return {
        x: (point.x - rect.left) / scale,
        y: (point.y - rect.top) / scale
    };
}

function getMouseButtonsPressed(event = {}) {
    return [1, 2, 4, 8, 16].filter(button => event.buttons & button);
}

function getAngle(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    let angle = Math.atan2(-dy, -dx);
    angle *= 180 / Math.PI;
    if (angle < 0) angle += 360;
    return angle;
}

function getDistanceBetweenPoints(p1 = _0x3bba9e, p2 = _0x35912c) {
    return Math.hypot(p2.x - p1.x, p2.y - p1.y);
}

function addAngle(angle1 = 0, angle2 = 0) {
    let result = angle1 + angle2;
    if (result >= 360) result = result % 360;
    if (result < 0) result = 360 + (result % 360);
    if (result === 360) result = 0;
    return result;
}

function diffAngle(angle1 = 0, angle2 = 0) {
    const diff = angle2 - angle1;
    const result = addAngle(angle1, diff);
    return 360 - result;
}

function calcWheelRotationForTargetAngle(currentAngle = 0, targetAngle = 0, direction = 1) {
    let rotation = ((targetAngle - currentAngle) % 360 + 360) % 360;
    rotation = fixFloat(rotation);
    rotation = direction < 0 ? 360 - rotation : rotation;
    rotation *= direction;
    return currentAngle + rotation;
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
        if (val === void 0) return defaultValue;
    }
    throw new Error(errorMessage);
}

function fixFloat(num = 0) {
    return Number(num.toFixed(2));
}

function easeSinOut(t) {
    return Math.sin((t * Math.PI) / 2);
}

function getResizeObserver(element = {}, callback = {}) {
    if (window.ResizeObserver) {
        const observer = new ResizeObserver(() => {
            callback({ redraw: true });
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

function register(wheel = {}) {
    wheel._resizeObserver = getResizeObserver(wheel._canvas, ({ redraw = true }) => {
        wheel.resize();
        if (redraw) wheel.draw(performance.now());
    });

    const init = () => {
        wheel._canvas = document.createElement('canvas');
        wheel._ctx = wheel._canvas.getContext('2d');
        const options = { passive: true };
        wheel._canvas.addEventListener('pointerdown', wheel._onPointerDown, options);
    };

    wheel._init = () => {
        wheel.resize();
        init();
    };

    init();
}

function unregister(wheel = {}) {
    const canvas = wheel._canvas;
    if (canvas) {
        canvas.removeEventListener('pointerdown', wheel._onPointerDown);
        canvas.removeEventListener('pointermove', wheel._onPointerMove);
        canvas.removeEventListener('pointerup', wheel._onPointerUp);
    }
    wheel._resizeObserver?.stop();
}

function registerPointerEvents(wheel = {}) {
    const canvas = wheel._canvas;

    wheel._onPointerDown = (event = {}) => {
        const point = { x: event.clientX, y: event.clientY };
        wheel._lastPointerPosition = wheel._getPointerPosition(point);
        wheel._startDrag(point);
        canvas.setPointerCapture(event.pointerId);
        canvas.addEventListener('pointermove', wheel._onPointerMove);
        canvas.addEventListener('pointerup', wheel._onPointerUp);
    };

    wheel._onPointerMove = (event = {}) => {
        event.preventDefault();
        const point = { x: event.clientX, y: event.clientY };
        if (!wheel._isDragging) return;
        wheel._updateDrag(point);
    };

    wheel._onPointerUp = (event = {}) => {
        event.preventDefault();
        canvas.releasePointerCapture(event.pointerId);
        canvas.removeEventListener('pointermove', wheel._onPointerMove);
        canvas.removeEventListener('pointerup', wheel._onPointerUp);
        wheel._endDrag();
    };

    wheel._onTouchStart = (event = {}) => {
        const point = { x: event.touches[0].clientX, y: event.touches[0].clientY };
        wheel._lastPointerPosition = wheel._getPointerPosition(point);
        wheel._startDrag(point);
    };

    wheel._onTouchMove = (event = {}) => {
        event.preventDefault();
        const point = { x: event.touches[0].clientX, y: event.touches[0].clientY };
        if (!wheel._isDragging) return;
        wheel._updateDrag(point);
    };

    wheel._onTouchEnd = (event = {}) => {
        event.preventDefault();
        document.removeEventListener('touchmove', wheel._onTouchMove);
        document.removeEventListener('touchend', wheel._onTouchEnd);
        wheel._endDrag();
    };

    if ('ontouchstart' in window) {
        canvas.addEventListener('touchstart', wheel._onTouchStart);
        canvas.addEventListener('touchmove', wheel._onTouchMove);
        canvas.addEventListener('touchend', wheel._onTouchEnd);
    } else {
        canvas.addEventListener('pointerdown', wheel._onPointerDown);
    }
}

class Item {
    constructor(wheel, options = {}) {
        if (!isObject(wheel)) throw new Error('Wheel is required');
        if (!isObject(options) && options !== null) throw new Error('Options must be an object');

        this._wheel = wheel;
        for (const key of Object.keys(Defaults.item)) {
            this['_' + key] = Defaults.item[key];
        }
        if (options) {
            this.set(options);
        } else {
            this.set(Defaults.item);
        }
    }

    set(options = {}) {
        this._fontFamily = options.fontFamily;
        this._fontWeight = options.fontWeight;
        this._fontStyle = options.fontStyle;
        this._fontColor = options.fontColor;
        this._fontSize = options.fontSize;
        this._textShadowColor = options.textShadowColor;
        this._textAlign = options.textAlign;
        this._textOrientation = options.textOrientation;
        this._lineHeight = options.lineHeight;
        this._text = options.text;
    }

    get fontFamily() {
        return this._fontFamily;
    }

    set fontFamily(value) {
        if (typeof value === 'string') {
            this._fontFamily = value;
        } else {
            this._fontFamily = Defaults.item.fontFamily;
        }
        this._wheel.draw();
    }

    get fontWeight() {
        return this._fontWeight;
    }

    set fontWeight(value) {
        if (typeof value === 'number') {
            this._fontWeight = value;
        } else {
            this._fontWeight = Defaults.item.fontWeight;
        }
        this._wheel.draw();
    }

    get fontStyle() {
        return this._fontStyle;
    }

    set fontStyle(value) {
        if (typeof value === 'boolean') {
            this._fontStyle = value;
        } else {
            this._fontStyle = Defaults.item.fontStyle;
        }
        this._wheel.draw();
    }

    get fontColor() {
        return this._fontColor;
    }

    set fontColor(value) {
        if (typeof value === 'string') {
            this._fontColor = value;
        } else {
            this._fontColor = Defaults.item.fontColor;
        }
        this._wheel.draw();
    }

    get fontSize() {
        return this._fontSize;
    }

    set fontSize(value) {
        if (typeof value === 'number') {
            this._fontSize = value;
        } else {
            this._fontSize = Defaults.item.fontSize;
        }
        this._wheel.draw();
    }

    get textShadowColor() {
        return this._textShadowColor;
    }

    set textShadowColor(value) {
        if (Array.isArray(value)) {
            this._textShadowColor = value;
        } else {
            this._textShadowColor = Defaults.item.textShadowColor;
        }
        this._wheel.draw();
    }

    get textAlign() {
        return this._textAlign;
    }

    set textAlign(value) {
        if (typeof value === 'string') {
            this._textAlign = value;
        } else {
            this._textAlign = Defaults.item.textAlign;
        }
        this._wheel.draw();
    }

    get textOrientation() {
        return this._textOrientation;
    }

    set textOrientation(value) {
        if (typeof value === 'number') {
            this._textOrientation = value;
        } else {
            this._textOrientation = Defaults.item.textOrientation;
        }
        this._wheel.draw();
    }

    get lineHeight() {
        return this._lineHeight;
    }

    set lineHeight(value) {
        if (typeof value === 'number') {
            this._lineHeight = value;
        } else {
            this._lineHeight = Defaults.item.lineHeight;
        }
        this._wheel.draw();
    }

    get text() {
        return this._text;
    }

    set text(value) {
        if (typeof value === 'string') {
            this._text = value;
        } else {
            this._text = Defaults.item.text;
        }
        this._wheel.draw();
    }

    getIndex() {
        const index = this._wheel._items.findIndex(item => item === this);
        if (index === -1) throw new Error('Item not found in wheel');
        return index;
    }

    getCenterAngle() {
        const angles = this._wheel._getItemAngles();
        const index = this.getIndex();
        return (angles[index].start + angles[index].end) / 2;
    }

    getStartAngle() {
        const angles = this._wheel._getItemAngles();
        return angles[this.getIndex()].start;
    }

    getEndAngle() {
        const angles = this._wheel._getItemAngles();
        return angles[this.getIndex()].end;
    }

    getRandomAngle() {
        return getRandomFloat(this.getStartAngle(), this.getEndAngle());
    }
}

class Wheel {
    constructor(element, options = {}) {
        if (!(element instanceof Element)) throw new Error('Element is required');
        if (!isObject(options) && options !== null) throw new Error('Options must be an object');

        this._canvas = null;
        this._ctx = null;
        this._resizeObserver = null;
        this._isDragging = false;
        this._lastPointerPosition = null;
        this._dragHistory = [];
        this._rotation = 0;
        this._targetRotation = null;
        this._animationStartTime = null;
        this._animationDuration = null;
        this._easingFunction = null;
        this._onPointerDown = null;
        this._onPointerMove = null;
        this._onPointerUp = null;
        this._onTouchStart = null;
        this._onTouchMove = null;
        this._onTouchEnd = null;

        this._init(element);

        for (const key of Object.keys(Defaults.wheel)) {
            this['_' + key] = Defaults.wheel[key];
        }

        if (options) {
            this.set(options);
        } else {
            this.set(Defaults.wheel);
        }
    }

    _init(element) {
        this._element = element;
        register(this);
    }

    set(options = {}) {
        this._fontFamily = options.fontFamily;
        this._fontWeight = options.fontWeight;
        this._fontStyle = options.fontStyle;
        this._fontColor = options.fontColor;
        this._fontSize = options.fontSize;
        this._textShadowColor = options.textShadowColor;
        this._textAlign = options.textAlign;
        this._textOrientation = options.textOrientation;
        this._lineHeight = options.lineHeight;
        this._baseSize = options.baseSize;
        this._scale = options.scale;
        this._max = options.max;
        this._min = options.min;
        this._offset = options.offset;
        this._angle = options.angle;
        this._items = options.items;
        this._color = options.color;
        this._lineWidth = options.lineWidth;
        this._radius = options.radius;
        this._opacity = options.opacity;
        this._zIndex = options.zIndex;
        this._distance = options.distance;
        this._duration = options.duration;
        this._position = options.position;
        this._rotation = options.rotation;
        this._target = options.target;
        this._easing = options.easing;
        this._callback = options.callback;
        this._debug = options.debug;
    }

    _createCanvas(element) {
        this._canvas = document.createElement('canvas');
        this._ctx = this._canvas.getContext('2d');
        this._canvas.style.width = '100%';
        this._canvas.style.height = '100%';
        element.appendChild(this._canvas);
        register(this);
    }

    destroy() {
        this._resizeObserver?.stop();
        this._canvas = null;
        this._ctx = null;
        unregister(this);
    }

    resize() {
        if (!this._canvas) return;

        const rect = this._element.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        this._canvas.width = rect.width * dpr;
        this._canvas.height = rect.height * dpr;

        this._canvas.style.width = rect.width + 'px';
        this._canvas.style.height = rect.height + 'px';

        const [width, height] = [this._canvas.width, this._canvas.height];
        const min = Math.min(width, height);
        const offset = {
            w: (min - this._position.x) / 2,
            h: (min - this._position.y) / 2
        };
        const scale = Math.min(offset.w, offset.h) / (min / 2);

        this._scale = scale;
        this._offset = {
            x: (width / 2) - (width - this._position.x) / 2,
            y: (height / 2) - (height - this._position.y) / 2
        };

        this._radius = Math.min(this._baseSize, this._scale * baseCanvasSize);
        this._fontSize = this._radius / (this._items.length || 1);

        for (const item of this._items) {
            this._fontSize = Math.min(this._fontSize, getFontSizeToFit(item.text, this._fontFamily + ' ' + this._fontWeight, this._radius * 2, this._ctx));
        }

        this.draw();
    }

    draw(now = performance.now()) {
        if (!this._ctx) return;

        const ctx = this._ctx;
        ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
        ctx.save();
        ctx.translate(this._offset.x, this._offset.y);
        ctx.rotate(degRad(this._rotation + arcAdjust));

        const angles = this._getItemAngles();
        this._drawItems(ctx, angles);
        this._drawPointer(ctx);
        this._drawCenter(ctx, this._image, false);
        this._drawCenter(ctx, this._overlay, true);
        this._drawDebug(ctx);

        ctx.restore();
    }

    _drawItems(ctx, angles = []) {
        for (const [index, angle] of angles.entries()) {
            const item = this._items[index];
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, this._radius, degRad(angle.start + arcAdjust), degRad(angle.end + arcAdjust));
            ctx.closePath();
            ctx.fillStyle = item.color || this._color;
            ctx.fill();
            ctx.strokeStyle = this._color;
            ctx.lineWidth = this._lineWidth;
            ctx.stroke();
        }
    }

    _drawPointer(ctx) {
        if (!this._pointer) return;
        ctx.save();
        ctx.rotate(degRad(-this._rotation - arcAdjust));
        ctx.fillStyle = this._pointerColor;
        ctx.beginPath();
        ctx.moveTo(0, -this._radius);
        ctx.lineTo(-10, -this._radius - 20);
        ctx.lineTo(10, -this._radius - 20);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    _drawCenter(ctx, image, isOverlay) {
        if (!image) return;
        ctx.save();
        ctx.rotate(degRad(-this._rotation - arcAdjust));
        const size = isOverlay ? this._overlayScale * this._radius : this._radius;
        ctx.drawImage(image, -size / 2, -size / 2, size, size);
        ctx.restore();
    }

    _drawDebug(ctx) {
        if (!this._debug) return;
        ctx.save();
        ctx.rotate(degRad(-this._rotation - arcAdjust));
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, this._radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }

    _getItemAngles(totalAngle = 360) {
        const items = this._items;
        if (items.length === 0) return [];
        const weightSum = items.reduce((sum, item) => sum + (item.weight || 1), 0);
        let currentAngle = 0;
        const angles = [];
        for (const item of items) {
            const weight = item.weight || 1;
            const angle = (weight / weightSum) * totalAngle;
            angles.push({ start: currentAngle, end: currentAngle + angle });
            currentAngle += angle;
        }
        if (this._distance === -1) {
            angles[angles.length - 1].end = 360;
        }
        return angles;
    }

    _getPointerPosition(point = _0x149a43) {
        if (!this._canvas) return null;
        return translateXYToElement(point, this._canvas, this._scale);
    }

    _isPointInWheel(point = _0x1ef178) {
        if (!this._canvas || !this._ctx?.getContext) return false;
        const pos = translateXYToElement(point, this._canvas, this._scale);
        return isPointInCircle(pos, this._position.x, this._position.y, this._radius);
    }

    _startDrag(point = _0x14f7cd) {
        this._isDragging = true;
        this._dragHistory = [];
        this._addToDragHistory(point);
        this._stopAnimation();
    }

    _updateDrag(point) {
        if (!this._isDragging) return;
        const lastPos = this._dragHistory[this._dragHistory.length - 1];
        const currentAngle = this._getAngleFromPoint(lastPos);
        const newAngle = this._getAngleFromPoint(point);
        const diff = diffAngle(currentAngle, newAngle);
        this._dragHistory.push({ distance: diff, x: point.x, y: point.y, now: performance.now() });
        if (this._dragHistory.length > 10) {
            this._dragHistory.shift();
        }
        this._rotation += diff;
    }

    _endDrag() {
        this._isDragging = false;
        let velocity = 0;
        for (let i = 1; i < this._dragHistory.length; i++) {
            velocity += this._dragHistory[i].distance;
        }
        velocity /= this._dragHistory.length;
        this.spin(velocity);
    }

    _addToDragHistory(point) {
        this._dragHistory.push({ distance: 0, x: point.x, y: point.y, now: performance.now() });
    }

    _getAngleFromPoint(point) {
        return (getAngle(this._position.x, this._position.y, point.x, point.y) - arcAdjust + 360) % 360;
    }

    _stopAnimation() {
        this._targetRotation = null;
        this._animationStartTime = null;
        this._animationDuration = null;
        this._easingFunction = null;
    }

    _isAnimating() {
        return this._targetRotation !== null;
    }

    spin(velocity = 10) {
        this._stopAnimation();
        const direction = velocity >= 0 ? 1 : -1;
        const rotation = Math.abs(velocity) * 10;
        this._animateTo(this._rotation + rotation * direction, Math.abs(velocity) * 100, easeSinOut);
    }

    _animateTo(targetRotation, duration, easing) {
        this._targetRotation = targetRotation;
        this._animationStartTime = performance.now();
        this._animationDuration = duration;
        this._easingFunction = easing;
        this._animate();
    }

    _animate() {
        if (this._targetRotation === null) return;
        const now = performance.now();
        const elapsed = now - this._animationStartTime;
        const progress = Math.min(elapsed / this._animationDuration, 1);
        const eased = this._easingFunction(progress);
        this._rotation = this._rotation + (this._targetRotation - this._rotation) * eased;
        this.draw(now);
        if (progress < 1) {
            requestAnimationFrame(() => this._animate());
        } else {
            this._stopAnimation();
            this._onSpinEnd();
        }
    }

    _onSpinEnd() {
        const angles = this._getItemAngles();
        const pointerAngle = (360 - this._rotation) % 360;
        for (let i = 0; i < angles.length; i++) {
            if (isAngleBetween(pointerAngle, angles[i].start, angles[i].end)) {
                this._currentIndex = i;
                if (this._callback) this._callback();
                break;
            }
        }
    }

    get currentIndex() {
        return this._currentIndex;
    }

    set currentIndex(value) {
        this._currentIndex = setProp({
            val: value,
            isValid: typeof value === 'number',
            errorMessage: 'Invalid currentIndex',
            defaultValue: Defaults.wheel.currentIndex
        });
        this.draw();
    }

    get rotation() {
        return this._rotation;
    }

    set rotation(value) {
        this._rotation = setProp({
            val: value,
            isValid: typeof value === 'number',
            errorMessage: 'Invalid rotation',
            defaultValue: Defaults.wheel.rotation,
            action: () => value % 360
        });
        if (this._canvas) this.draw();
    }

    get fontFamily() {
        return this._fontFamily;
    }

    set fontFamily(value) {
        this._fontFamily = setProp({
            val: value,
            isValid: typeof value === 'string',
            errorMessage: 'Invalid fontFamily',
            defaultValue: Defaults.wheel.fontFamily
        });
        this.draw();
    }

    get fontWeight() {
        return this._fontWeight;
    }

    set fontWeight(value) {
        this._fontWeight = setProp({
            val: value,
            isValid: typeof value === 'number',
            errorMessage: 'Invalid fontWeight',
            defaultValue: Defaults.wheel.fontWeight
        });
        this.draw();
    }

    get fontStyle() {
        return this._fontStyle;
    }

    set fontStyle(value) {
        this._fontStyle = setProp({
            val: value,
            isValid: typeof value === 'boolean',
            errorMessage: 'Invalid fontStyle',
            defaultValue: Defaults.wheel.fontStyle
        });
        this.draw();
    }

    get fontColor() {
        return this._fontColor;
    }

    set fontColor(value) {
        this._fontColor = setProp({
            val: value,
            isValid: typeof value === 'string',
            errorMessage: 'Invalid fontColor',
            defaultValue: Defaults.wheel.fontColor
        });
        this.draw();
    }

    get fontSize() {
        return this._fontSize;
    }

    set fontSize(value) {
        this._fontSize = setProp({
            val: value,
            isValid: typeof value === 'boolean',
            errorMessage: 'Invalid fontSize',
            defaultValue: Defaults.wheel.fontSize
        });
        this.draw();
    }

    get textShadowColor() {
        return this._textShadowColor;
    }

    set textShadowColor(value) {
        this._textShadowColor = setProp({
            val: value,
            isValid: Array.isArray(value),
            errorMessage: 'Invalid textShadowColor',
            defaultValue: Defaults.wheel.textShadowColor
        });
        this.draw();
    }

    get textAlign() {
        return this._textAlign;
    }

    set textAlign(value) {
        this._textAlign = setProp({
            val: value,
            isValid: typeof value === 'string' && (value === AlignText.left || value === AlignText.center || value === AlignText.right),
            errorMessage: 'Invalid textAlign',
            defaultValue: Defaults.wheel.textAlign
        });
        this.draw();
    }

    get textOrientation() {
        return this._textOrientation;
    }

    set textOrientation(value) {
        this._textOrientation = setProp({
            val: value,
            isValid: Array.isArray(value),
            errorMessage: 'Invalid textOrientation',
            defaultValue: Defaults.wheel.textOrientation
        });
        this.draw();
    }

    get lineHeight() {
        return this._lineHeight;
    }

    set lineHeight(value) {
        this._lineHeight = setProp({
            val: value,
            isValid: typeof value === 'string',
            errorMessage: 'Invalid lineHeight',
            defaultValue: Defaults.wheel.lineHeight
        });
        this.draw();
    }

    get baseSize() {
        return this._baseSize;
    }

    set baseSize(value) {
        this._baseSize = setProp({
            val: value,
            isValid: typeof value === 'number',
            errorMessage: 'Invalid baseSize',
            defaultValue: Defaults.wheel.baseSize
        });
        this.resize();
    }

    get scale() {
        return this._scale;
    }

    set scale(value) {
        this._scale = setProp({
            val: value,
            isValid: typeof value === 'number',
            errorMessage: 'Invalid scale',
            defaultValue: Defaults.wheel.scale
        });
        this.resize();
    }

    get max() {
        return this._max;
    }

    set max(value) {
        this._max = setProp({
            val: value,
            isValid: typeof value === 'number',
            errorMessage: 'Invalid max',
            defaultValue: Defaults.wheel.max
        });
        this.draw();
    }

    get min() {
        return this._min;
    }

    set min(value) {
        this._min = setProp({
            val: value,
            isValid: typeof value === 'number',
            errorMessage: 'Invalid min',
            defaultValue: Defaults.wheel.min
        });
        this.draw();
    }

    get offset() {
        return this._offset;
    }

    set offset(value) {
        this._offset = setProp({
            val: value,
            isValid: typeof value === 'string',
            errorMessage: 'Invalid offset',
            defaultValue: Defaults.wheel.offset
        });
        this.draw();
    }

    get angle() {
        return this._angle;
    }

    set angle(value) {
        this._angle = setProp({
            val: value,
            isValid: typeof value === 'number',
            errorMessage: 'Invalid angle',
            defaultValue: Defaults.wheel.angle
        });
        this.draw();
    }

    get items() {
        return this._items;
    }

    set items(value) {
        this._items = setProp({
            val: value,
            isValid: Array.isArray(value),
            errorMessage: 'Invalid items',
            defaultValue: Defaults.wheel.items,
            action: () => {
                const newItems = [];
                for (const item of value) {
                    newItems.push(new Item(this, item));
                }
                return newItems;
            }
        });
        this.resize();
        this.draw(this._rotation);
    }

    get color() {
        return this._color;
    }

    set color(value) {
        this._color = setProp({
            val: value,
            isValid: typeof value === 'string',
            errorMessage: 'Invalid color',
            defaultValue: Defaults.wheel.color
        });
        this.draw();
    }

    get lineWidth() {
        return this._lineWidth;
    }

    set lineWidth(value) {
        this._lineWidth = setProp({
            val: value,
            isValid: typeof value === 'number',
            errorMessage: 'Invalid lineWidth',
            defaultValue: Defaults.wheel.lineWidth
        });
        this.draw();
    }

    get radius() {
        return this._radius;
    }

    set radius(value) {
        this._radius = setProp({
            val: value,
            isValid: typeof value === 'number',
            errorMessage: 'Invalid radius',
            defaultValue: Defaults.wheel.radius
        });
        this.draw();
    }

    get opacity() {
        return this._opacity;
    }

    set opacity(value) {
        this._opacity = setProp({
            val: value,
            isValid: typeof value === 'number',
            errorMessage: 'Invalid opacity',
            defaultValue: Defaults.wheel.opacity
        });
        this.draw();
    }

    get zIndex() {
        return this._zIndex;
    }

    set zIndex(value) {
        this._zIndex = setProp({
            val: value,
            isValid: typeof value === 'number',
            errorMessage: 'Invalid zIndex',
            defaultValue: Defaults.wheel.zIndex
        });
        this.draw();
    }

    get distance() {
        return this._distance;
    }

    set distance(value) {
        this._distance = setProp({
            val: value,
            isValid: typeof value === 'number',
            errorMessage: 'Invalid distance',
            defaultValue: Defaults.wheel.distance
        });
        this.draw();
    }

    get duration() {
        return this._duration;
    }

    set duration(value) {
        this._duration = setProp({
            val: value,
            isValid: typeof value === 'number',
            errorMessage: 'Invalid duration',
            defaultValue: Defaults.wheel.duration
        });
    }

    get position() {
        return this._position;
    }

    set position(value) {
        this._position = setProp({
            val: value,
            isValid: isObject(value),
            errorMessage: 'Invalid position',
            defaultValue: Defaults.wheel.position
        });
        this.resize();
    }

    get rotation() {
        return this._rotation;
    }

    set rotation(value) {
        this._rotation = setProp({
            val: value,
            isValid: typeof value === 'number',
            errorMessage: 'Invalid rotation',
            defaultValue: Defaults.wheel.rotation
        });
        this.draw();
    }

    get target() {
        return this._target;
    }

    set target(value) {
        this._target = setProp({
            val: value,
            isValid: typeof value === 'number' || value === null,
            errorMessage: 'Invalid target',
            defaultValue: Defaults.wheel.target
        });
    }

    get easing() {
        return this._easing;
    }

    set easing(value) {
        this._easing = setProp({
            val: value,
            isValid: typeof value === 'function' || value === null,
            errorMessage: 'Invalid easing',
            defaultValue: Defaults.wheel.easing
        });
    }

    get callback() {
        return this._callback;
    }

    set callback(value) {
        this._callback = setProp({
            val: value,
            isValid: typeof value === 'function' || value === null,
            errorMessage: 'Invalid callback',
            defaultValue: Defaults.wheel.callback
        });
    }

    get debug() {
        return this._debug;
    }

    set debug(value) {
        this._debug = setProp({
            val: value,
            isValid: typeof value === 'boolean',
            errorMessage: 'Invalid debug',
            defaultValue: Defaults.wheel.debug
        });
        this.draw();
    }

    get image() {
        return this._image;
    }

    set image(value) {
        this._image = setProp({
            val: value,
            isValid: value instanceof HTMLImageElement || value === null,
            errorMessage: 'Invalid image',
            defaultValue: Defaults.wheel.image
        });
        this.draw();
    }

    get overlay() {
        return this._overlay;
    }

    set overlay(value) {
        this._overlay = setProp({
            val: value,
            isValid: value instanceof HTMLImageElement || value === null,
            errorMessage: 'Invalid overlay',
            defaultValue: Defaults.wheel.overlay
        });
        this.draw();
    }

    get pointer() {
        return this._pointer;
    }

    set pointer(value) {
        this._pointer = setProp({
            val: value,
            isValid: typeof value === 'boolean',
            errorMessage: 'Invalid pointer',
            defaultValue: Defaults.wheel.pointer
        });
        this.draw();
    }

    get pointerColor() {
        return this._pointerColor;
    }

    set pointerColor(value) {
        this._pointerColor = setProp({
            val: value,
            isValid: typeof value === 'string',
            errorMessage: 'Invalid pointerColor',
            defaultValue: Defaults.wheel.pointerColor
        });
        this.draw();
    }

    get overlayScale() {
        return this._overlayScale;
    }

    set overlayScale(value) {
        this._overlayScale = setProp({
            val: value,
            isValid: typeof value === 'number',
            errorMessage: 'Invalid overlayScale',
            defaultValue: Defaults.wheel.overlayScale
        });
        this.draw();
    }

    get border() {
        return this._border;
    }

    set border(value) {
        this._border = setProp({
            val: value,
            isValid: typeof value === 'number',
            errorMessage: 'Invalid border',
            defaultValue: Defaults.wheel.border
        });
        this.draw();
    }

    get borderColor() {
        return this._borderColor;
    }

    set borderColor(value) {
        this._borderColor = setProp({
            val: value,
            isValid: typeof value === 'string',
            errorMessage: 'Invalid borderColor',
            defaultValue: Defaults.wheel.borderColor
        });
        this.draw();
    }

    get shadow() {
        return this._shadow;
    }

    set shadow(value) {
        this._shadow = setProp({
            val: value,
            isValid: typeof value === 'boolean',
            errorMessage: 'Invalid shadow',
            defaultValue: Defaults.wheel.shadow
        });
        this.draw();
    }

    get shadowColor() {
        return this._shadowColor;
    }

    set shadowColor(value) {
        this._shadowColor = setProp({
            val: value,
            isValid: typeof value === 'string',
            errorMessage: 'Invalid shadowColor',
            defaultValue: Defaults.wheel.shadowColor
        });
        this.draw();
    }

    get shadowBlur() {
        return this._shadowBlur;
    }

    set shadowBlur(value) {
        this._shadowBlur = setProp({
            val: value,
            isValid: typeof value === 'number',
            errorMessage: 'Invalid shadowBlur',
            defaultValue: Defaults.wheel.shadowBlur
        });
        this.draw();
    }

    get shadowOffsetX() {
        return this._shadowOffsetX;
    }

    set shadowOffsetX(value) {
        this._shadowOffsetX = setProp({
            val: value,
            isValid: typeof value === 'number',
            errorMessage: 'Invalid shadowOffsetX',
            defaultValue: Defaults.wheel.shadowOffsetX
        });
        this.draw();
    }

    get shadowOffsetY() {
        return this._shadowOffsetY;
    }

    set shadowOffsetY(value) {
        this._shadowOffsetY = setProp({
            val: value,
            isValid: typeof value === 'number',
            errorMessage: 'Invalid shadowOffsetY',
            defaultValue: Defaults.wheel.shadowOffsetY
        });
        this.draw();
    }

    _emit(event = {}) {
        this._callback?.({ type: 'spin', currentIndex: this._currentIndex, rotation: this._rotation, ...event });
    }

    _emitStart(event = {}) {
        this._callback?.({ type: 'spinStart', currentIndex: this._currentIndex, ...event });
    }

    _emitEnd(event = {}) {
        this._callback?.({ type: 'spinEnd', currentIndex: this._currentIndex, rotation: this._rotation, ...event });
    }
}

export { Wheel };
