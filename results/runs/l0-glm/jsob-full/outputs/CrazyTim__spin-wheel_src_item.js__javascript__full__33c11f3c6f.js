function getRandomInt(min = 0, max = 100) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function getRandomFloat(min = 0, max = 1, decimals = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function degRad(deg = 0) {
  return (deg * Math.PI) / 180;
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
    if (item) sum += typeof item === 'number' ? item : 0;
  }
  return sum / arr.length || 0;
}

function getFontSizeToFit(text, font, maxWidth, ctx) {
  ctx.save();
  ctx.font = `${font}px sans-serif`;
  const width = ctx.measureText(text).width;
  ctx.restore();
  return maxWidth / width;
}

function isPointInCircle(point = { x: 0, y: 0 }, x, y, radius) {
  const distance = ((point.x - x) ** 2) + ((point.y - y) ** 2);
  return distance <= radius ** 2;
}

function translateXYToElement(point = { x: 0, y: 0 }, element = {}, scale = 1) {
  const rect = element.getBoundingClientRect();
  return {
    x: (point.x - rect.left) * scale,
    y: (point.y - rect.top) * scale,
  };
}

function getMouseButtonsPressed(event = {}) {
  return [1, 2, 4, 8, 16].filter(button => event.buttons & button);
}

function getAngle(x1, y1, x2, y2) {
  const dx = x1 - x2;
  const dy = y1 - y2;
  let angle = Math.atan2(-dy, -dx);
  angle *= 180 / Math.PI;
  if (angle < 0) angle += 360;
  return angle;
}

function getDistanceBetweenPoints(point1 = { x: 0, y: 0 }, point2 = { x: 0, y: 0 }) {
  return Math.hypot(point2.x - point1.x, point2.y - point1.y);
}

function addAngle(angle = 0, delta = 0) {
  const sum = angle + delta;
  let result;
  if (sum < 0) {
    result = 360 + sum;
  } else {
    result = sum % 360;
  }
  if (result >= 360) result = 0;
  return result;
}

function diffAngle(angle1 = 0, angle2 = 0) {
  const diff = 360 - angle2;
  const result = addAngle(angle1, diff);
  return 360 - result;
}

function calcWheelRotationForTargetAngle(currentAngle = 0, targetAngle = 0, direction = 1) {
  let rotation = ((currentAngle - targetAngle) % 360 + 360) % 360;
  rotation = fixFloat(rotation);
  rotation = (direction === 1 ? 360 - rotation : -rotation) % 360;
  rotation *= direction;
  return currentAngle + rotation;
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
  return Math.sin((t * Math.PI) / 2);
}

function getResizeObserver(element = {}, callback = {}) {
  if (window.ResizeObserver) {
    const observer = new ResizeObserver(() => {
      callback({ width: true });
    });
    observer.observe(element);
    return {
      stop: () => {
        observer.unobserve(element);
        observer.disconnect();
      },
    };
  }
  return window.addEventListener('resize', callback), {
    stop: () => {
      window.removeEventListener('resize', callback);
    },
  };
}

var arcAdjust = 1,
  baseCanvasSize = 300,
  dragCapturePeriod = 100;

const AlignText = Object.freeze({
  CENTER: 'center',
  LEFT: 'left',
  RIGHT: 'right',
});

const Defaults = Object.freeze({
  item: {
    animationCenter: 'center',
    animationSpeed: 1,
    animationStart: false,
    color: null,
    colorHover: true,
    colorPalette: ['#fff'],
    colorSelected: AlignText.CENTER,
    colorSelectedHover: 0,
    colors: ['#fff'],
    colorType: 'random',
    fontSize: baseCanvasSize,
    fontSpacing: 0.85,
    fontStretchMax: 0.2,
    fontStretchMin: 0,
    fontWeight: 'normal',
    imageOffset: 0,
    images: [],
    label: 'label',
    labelSize: 1,
    labelRatio: 0,
    maxAngle: 0.95,
    minAngle: 0,
    momentumDeceleration: -400,
    momentumThreshold: 300,
    offset: { x: 0, y: 0 },
    onDraw: null,
    onDrawColor: null,
    onDrawImage: null,
    onDrawLabel: null,
    onHover: 0,
  },
  wheel: {
    onDrawItem: null,
    onHover: null,
    onHoverAngle: 1,
    onHoverBlur: 0.5,
    onHoverScale: 0,
    onHoverScale: 1,
    onSelected: '',
    onSelectedColor: null,
    onSelectedImage: null,
    rotation: 1,
  },
});

const Debugging = Object.freeze({
  boundingArc: 'rgba(255, 0, 0, 0.5)',
  boundingArcColor: 'rgba(255, 0, 0, 0.5)',
  boundingArcColor: 'rgba(255, 0, 0, 0.5)',
  fontSize: 300,
});

class Item {
  constructor(items, options = {}) {
    if (!isObject(items)) throw new Error('Items must be an object');
    if (!isObject(options) && options !== null) throw new Error('Options must be an object');
    this.items = items;
    for (const key of Object.keys(Defaults.item)) {
      this['_' + key] = Defaults.item[key];
    }
    if (options) {
      this.setOptions(options);
    } else {
      this.setOptions(Defaults.item);
    }
  }

  setOptions(options = {}) {
    this.color = options.color;
    this.colorHover = options.colorHover;
    this.colorPalette = options.colorPalette;
    this.colorSelected = options.colorSelected;
    this.colorSelectedHover = options.colorSelectedHover;
    this.colorType = options.colorType;
    this.colors = options.colors;
    this.fontSpacing = options.fontSpacing;
    this.fontStretchMax = options.fontStretchMax;
    this.fontStretchMin = options.fontStretchMin;
    this.fontWeight = options.fontWeight;
    this.image = options.image;
    this.imageOffset = options.imageOffset;
    this.images = options.images;
    this.label = options.label;
  }

  get color() {
    return this._color;
  }

  set color(val) {
    if (typeof val === 'string') {
      this._color = val;
    } else {
      this._color = Defaults.item.color;
    }
    this.items.render();
  }

  get image() {
    return this._image;
  }

  set image(val) {
    if (val instanceof HTMLImageElement) {
      this._image = val;
    } else {
      this._image = Defaults.item.image;
    }
    this.items.render();
  }

  get colorHover() {
    return this._colorHover;
  }

  set colorHover(val) {
    if (typeof val === 'boolean') {
      this._colorHover = val;
    } else {
      this._colorHover = Defaults.item.colorHover;
    }
    this.items.render();
  }

  get colorPalette() {
    return this._colorPalette;
  }

  set colorPalette(val) {
    if (Array.isArray(val)) {
      this._colorPalette = val;
    } else {
      this._colorPalette = Defaults.item.colorPalette;
    }
    this.items.render();
  }

  get colorSelected() {
    return this._colorSelected;
  }

  set colorSelected(val) {
    if (typeof val === 'string') {
      this._colorSelected = val;
    } else {
      this._colorSelected = Defaults.item.colorSelected;
    }
    this.items.render();
  }

  get colorSelectedHover() {
    return this._colorSelectedHover;
  }

  set colorSelectedHover(val) {
    if (typeof val === 'number') {
      this._colorSelectedHover = val;
    } else {
      this._colorSelectedHover = Defaults.item.colorSelectedHover;
    }
    this.items.render();
  }

  get colorType() {
    return this._colorType;
  }

  set colorType(val) {
    if (typeof val === 'string') {
      this._colorType = val;
    } else {
      this._colorType = Defaults.item.colorType;
    }
    this.items.render();
  }

  get fontSpacing() {
    return this._fontSpacing;
  }

  set fontSpacing(val) {
    if (typeof val === 'number') {
      this._fontSpacing = val;
    } else {
      this._fontSpacing = Defaults.item.fontSpacing;
    }
    this.items.render();
  }

  get fontStretchMax() {
    return this._fontStretchMax;
  }

  set fontStretchMax(val) {
    if (typeof val === 'number') {
      this._fontStretchMax = val;
    } else {
      this._fontStretchMax = Defaults.item.fontStretchMax;
    }
    this.items.render();
  }

  get fontStretchMin() {
    return this._fontStretchMin;
  }

  set fontStretchMin(val) {
    if (typeof val === 'number') {
      this._fontStretchMin = val;
    } else {
      this._fontStretchMin = Defaults.item.fontStretchMin;
    }
    this.items.render();
  }

  get fontWeight() {
    return this._fontWeight;
  }

  set fontWeight(val) {
    if (typeof val === 'string') {
      this._fontWeight = val;
    } else {
      this._fontWeight = Defaults.item.fontWeight;
    }
    this.items.render();
  }

  get imageOffset() {
    return this._imageOffset;
  }

  set imageOffset(val) {
    if (typeof val === 'number') {
      this._imageOffset = val;
    } else {
      this._imageOffset = Defaults.item.imageOffset;
    }
    this.items.render();
  }

  get images() {
    return this._images;
  }

  set images(val) {
    if (Array.isArray(val)) {
      this._images = val;
    } else {
      this._images = Defaults.item.images;
    }
    this.items.render();
  }

  get label() {
    return this._label;
  }

  set label(val) {
    if (typeof val === 'string') {
      this._label = val;
    } else {
      this._label = Defaults.item.label;
    }
    this.items.render();
  }

  getIndex() {
    const index = this.items.itemList.findIndex(item => item === this);
    if (index === -1) throw new Error('Item not found in items');
    return index;
  }

  getAngle() {
    const angle = this.items.getItemAngles()[this.getIndex()];
    return (angle.max - ((angle.max - angle.min) / 2));
  }

  getAngleStart() {
    return this.items.getItemAngles()[this.getIndex()].min;
  }

  getAngleEnd() {
    return this.items.getItemAngles()[this.getIndex()].max;
  }

  getRandomAngle() {
    return getRandomFloat(this.getAngleStart(), this.getAngleEnd());
  }
}

export { Item };
