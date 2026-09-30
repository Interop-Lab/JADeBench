function getRandomInt(min = 0, max = 100) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

function getRandomFloat(min = 0, max = 100, decimals = 2) {
    return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function degRad(deg = 0) {
    return deg * Math.PI / 180;
}

function isAngleBetween(angle, start, end) {
    if (start < end) {
        return start <= angle && angle < end;
    }
    return start <= angle || angle < end;
}

function aveArray(arr = []) {
    let sum = 0;
    for (const item of arr) {
        if (item) {
            sum += typeof item === 'number' ? item : 0;
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

const origin = { x: 0, y: 0 };

function isPointInCircle(point = origin, cx, cy, r) {
    const dist = Math.pow(point.x - cx, 2) + Math.pow(point.y - cy, 2);
    return dist <= Math.pow(r, 2);
}

const zeroPoint = { x: 0, y: 0 };

function translateXYToElement(point = zeroPoint, element = {}, scale = 100) {
    const rect = element.getBoundingClientRect();
    return {
        x: (point.x - rect.left) / scale,
        y: (point.y - rect.top) / scale
    };
}

function getMouseButtonsPressed(e = {}) {
    return [1, 2, 4, 8, 16].filter(btn => e.buttons & btn);
}

function getAngle(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    let angle = Math.atan2(-dy, -dx);
    angle *= 180 / Math.PI;
    if (angle < 0) angle += 360;
    return angle;
}

const pointA = { x: 0, y: 0 };
const pointB = { x: 0, y: 0 };

function getDistanceBetweenPoints(p1 = pointA, p2 = pointB) {
    return Math.hypot(p2.x - p1.x, p2.y - p1.y);
}

function addAngle(a = 0, b = 0) {
    const sum = a + b;
    let result;
    if (sum >= 360) {
        result = sum % 360;
    } else {
        result = 360 - (360 - sum) % 360;
    }
    if (result === 360) result = 0;
    return result;
}

function diffAngle(a = 0, b = 0) {
    const c = 360 - b;
    const d = addAngle(a, c);
    return 360 - d;
}

function calcWheelRotationForTargetAngle(current = 0, target = 0, sensitivity = 1) {
    let diff = (target - current + 360) % 360;
    diff = fixFloat(diff);
    diff = sensitivity < 0 ? 360 - diff : diff;
    diff *= sensitivity;
    return current + diff;
}

function isObject(obj) {
    return typeof obj === 'object' && !Array.isArray(obj) && obj !== null;
}

function isNumber(num) {
    return typeof num === 'number' && !Number.isNaN(num);
}

function setProp({ val, isValid, errorMessage, defaultValue, action = null }) {
    if (isValid) {
        return action ? action() : val;
    } else {
        if (val === undefined) return defaultValue;
    }
    throw new Error(errorMessage);
}

function fixFloat(num = 0) {
    return Number(num.toFixed(2));
}

function easeSinOut(t) {
    return Math.sin(t * Math.PI / 2);
}

function getResizeObserver(element = {}, callback = {}) {
    if (window.ResizeObserver) {
        const observer = new ResizeObserver(() => {
            callback({ resized: true });
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

var arcAdjust = -1;
var baseCanvasSize = 100;
var dragCapturePeriod = 100;

const AlignText = Object.freeze({
    LEFT: 'left',
    CENTER: 'center',
    RIGHT: 'right'
});

const zero = { x: 0, y: 0 };

const Defaults = Object.freeze({
    item: {
        name: 'Item',
        description: '',
        id: 1,
        visible: false,
        parent: null,
        draggable: true,
        dragAnchors: ['center'],
        alignText: AlignText.LEFT,
        rotation: 0,
        scale: ['center'],
        font: 'sans-serif',
        fontSize: baseCanvasSize,
        fontScale: 0.85,
        fontLineHeightMax: 0.2,
        fontLineHeightMin: 0,
        fontColor: '#000',
        fontStrokeWidth: 0,
        children: [],
        image: '',
        width: 1,
        height: 1,
        opacity: 0.95,
        zIndex: 0,
        wheelSensitivity: -1,
        wheelMax: 300,
        wheelMin: 0,
        position: zero,
        resizeObserver: null,
        wheelHandler: null,
        dragHandler: null,
        mouseDownHandler: null,
        mouseUpHandler: null,
        lastDragTime: 0
    },
    debug: {
        showDebugInfo: null,
        debugElement: null,
        debugScale: 1,
        debugOpacity: 0.5,
        debugX: 0,
        debugY: 0,
        debugVisible: 1,
        debugText: '',
        debugColor: null,
        debugBackground: null,
        debugBorder: 1
    }
});

const Debugging = Object.freeze({
    showDebugInfo: 'debug',
    showDebugInfoVerbose: 'verbose',
    hideDebugInfo: 'hide',
    debugElement: null,
    debugMax: 300
});

class Item {
    constructor(data, options = {}) {
        if (!isObject(data)) {
            throw new Error('Item data must be an object');
        }
        if (!isObject(options) && options !== null) {
            throw new Error('Item options must be an object or null');
        }
        this._data = data;
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
        this._name = options.name;
        this._description = options.description;
        this._id = options.id;
        this._visible = options.visible;
        this._parent = options.parent;
        this._draggable = options.draggable;
        this._dragAnchors = options.dragAnchors;
        this._alignText = options.alignText;
        this._rotation = options.rotation;
        this._scale = options.scale;
        this._font = options.font;
        this._fontSize = options.fontSize;
        this._fontScale = options.fontScale;
        this._fontLineHeightMax = options.fontLineHeightMax;
        this._fontLineHeightMin = options.fontLineHeightMin;
        this._fontColor = options.fontColor;
        this._fontStrokeWidth = options.fontStrokeWidth;
        this._children = options.children;
        this._image = options.image;
        this._width = options.width;
        this._height = options.height;
        this._opacity = options.opacity;
        this._zIndex = options.zIndex;
        this._wheelSensitivity = options.wheelSensitivity;
        this._wheelMax = options.wheelMax;
        this._wheelMin = options.wheelMin;
        this._position = options.position;
        this._resizeObserver = options.resizeObserver;
        this._wheelHandler = options.wheelHandler;
        this._dragHandler = options.dragHandler;
        this._mouseDownHandler = options.mouseDownHandler;
        this._mouseUpHandler = options.mouseUpHandler;
        this._lastDragTime = options.lastDragTime;
    }

    get name() {
        return this._name;
    }

    set name(value) {
        if (typeof value === 'string') {
            this._name = value;
        } else {
            this._name = Defaults.item.name;
        }
        this._update();
    }

    get description() {
        return this._description;
    }

    set description(value) {
        if (value instanceof HTMLImageElement) {
            this._description = value;
        } else {
            this._description = Defaults.item.description;
        }
        this._update();
    }

    get dragAnchors() {
        return this._dragAnchors;
    }

    set dragAnchors(value) {
        if (typeof value === 'object') {
            this._dragAnchors = value;
        } else {
            this._dragAnchors = Defaults.item.dragAnchors;
        }
        this._update();
    }

    get scale() {
        return this._scale;
    }

    set scale(value) {
        if (typeof value === 'object') {
            this._scale = value;
        } else {
            this._scale = Defaults.item.scale;
        }
        this._update();
    }

    get font() {
        return this._font;
    }

    set font(value) {
        if (typeof value === 'string') {
            this._font = value;
        } else {
            this._font = Defaults.item.font;
        }
        this._update();
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
        this._update();
    }

    get fontScale() {
        return this._fontScale;
    }

    set fontScale(value) {
        if (typeof value === 'number') {
            this._fontScale = value;
        } else {
            this._fontScale = Defaults.item.fontScale;
        }
        this._update();
    }

    get fontLineHeightMax() {
        return this._fontLineHeightMax;
    }

    set fontLineHeightMax(value) {
        if (typeof value === 'number') {
            this._fontLineHeightMax = value;
        } else {
            this._fontLineHeightMax = Defaults.item.fontLineHeightMax;
        }
        this._update();
    }

    get fontLineHeightMin() {
        return this._fontLineHeightMin;
    }

    set fontLineHeightMin(value) {
        if (typeof value === 'number') {
            this._fontLineHeightMin = value;
        } else {
            this._fontLineHeightMin = Defaults.item.fontLineHeightMin;
        }
        this._update();
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
        this._update();
    }

    get fontStrokeWidth() {
        return this._fontStrokeWidth;
    }

    set fontStrokeWidth(value) {
        if (typeof value === 'number') {
            this._fontStrokeWidth = value;
        } else {
            this._fontStrokeWidth = Defaults.item.fontStrokeWidth;
        }
        this._update();
    }

    get visible() {
        return this._visible;
    }

    set visible(value) {
        if (value === undefined) {
            this._visible = value;
        } else {
            if (typeof value === 'boolean') {
                this._visible = value;
            } else {
                this._visible = Defaults.item.visible;
            }
        }
    }

    get opacity() {
        return this._opacity;
    }

    set opacity(value) {
        if (typeof value === 'number') {
            this._opacity = value;
        } else {
            this._opacity = Defaults.item.opacity;
        }
    }

    get zIndex() {
        return this._zIndex;
    }

    set zIndex(value) {
        if (typeof value === 'number') {
            this._zIndex = value;
        } else {
            this._zIndex = Defaults.item.zIndex;
        }
    }

    get wheelSensitivity() {
        return this._wheelSensitivity;
    }

    set wheelSensitivity(value) {
        if (typeof value === 'number') {
            this._wheelSensitivity = value;
        } else {
            this._wheelSensitivity = Defaults.item.wheelSensitivity;
        }
    }

    get wheelMax() {
        return this._wheelMax;
    }

    set wheelMax(value) {
        if (typeof value === 'number') {
            this._wheelMax = value;
        } else {
            this._wheelMax = Defaults.item.wheelMax;
        }
    }

    get wheelMin() {
        return this._wheelMin;
    }

    set wheelMin(value) {
        if (typeof value === 'number') {
            this._wheelMin = value;
        } else {
            this._wheelMin = Defaults.item.wheelMin;
        }
    }

    get position() {
        return this._position;
    }

    set position(value) {
        if (typeof value === 'object') {
            this._position = value;
        } else {
            this._position = Defaults.item.position;
        }
    }

    get resizeObserver() {
        return this._resizeObserver;
    }

    set resizeObserver(value) {
        if (typeof value === 'object') {
            this._resizeObserver = value;
        } else {
            this._resizeObserver = Defaults.item.resizeObserver;
        }
    }

    get wheelHandler() {
        return this._wheelHandler;
    }

    set wheelHandler(value) {
        if (typeof value === 'function') {
            this._wheelHandler = value;
        } else {
            this._wheelHandler = Defaults.item.wheelHandler;
        }
    }

    _update() {
        const index = this._data.items.indexOf(this);
        if (index === -1) {
            throw new Error('Item not found in data items array');
        }
        return index;
    }

    getAbsolutePosition() {
        const parent = this._data.items[this.parent()];
        return parent ? parent.position.x + this.position.x / parent.scale.x : this.position.x;
    }

    getAbsoluteScale() {
        const parent = this._data.items[this.parent()];
        return parent ? parent.scale.x * this.scale.x : this.scale.x;
    }

    getRandomRotation() {
        return getRandomFloat(this.wheelMin, this.wheelMax);
    }
}

export { Item };
