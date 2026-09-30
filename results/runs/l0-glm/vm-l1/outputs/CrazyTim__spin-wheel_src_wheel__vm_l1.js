let globalThisRef = typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : undefined;
let context = globalThisRef['vm_0x2cea3e_a423b6'] || (globalThisRef['vm_0x2cea3e_a423b6'] = {});

(function() {
  if (!context.module) try { context.module = module; } catch(e) {}
  if (!context.exports) try { context.exports = exports; } catch(e) {}
  if (!context.require) try { context.require = require; } catch(e) {}
  if (!context.__dirname) try { context.__dirname = __dirname; } catch(e) {}
  if (!context.__filename) try { context.__filename = __filename; } catch(e) {}
}());

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

function degRad(degrees) {
  return degrees * Math.PI / 180;
}

function isAngleBetween(angle, start, end) {
  return (start <= angle && angle <= end) || (angle >= start && angle <= end);
}

function aveArray(arr) {
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i];
  }
  return sum / arr.length;
}

function getFontSizeToFit(text, font, maxWidth, ctx) {
  ctx.font = font;
  let fontSize = parseFloat(font);
  while (ctx.measureText(text).width > maxWidth && fontSize > 1) {
    fontSize -= 1;
    ctx.font = font.replace(/\d+px/, fontSize + 'px');
  }
  return fontSize;
}

function isPointInCircle(px, py, cx, cy, radius) {
  const dx = px - cx;
  const dy = py - cy;
  return (dx * dx + dy * dy) <= radius * radius;
}

function translateXYToElement(x, y, element) {
  const rect = element.getBoundingClientRect();
  return {
    x: x - rect.left,
    y: y - rect.top
  };
}

function getMouseButtonsPressed(event) {
  let buttons = [];
  if (event.buttons & 1) buttons.push('left');
  if (event.buttons & 2) buttons.push('right');
  if (event.buttons & 4) buttons.push('middle');
  if (event.buttons & 8) buttons.push('back');
  if (event.buttons & 16) buttons.push('forward');
  return buttons;
}

function getAngle(x1, y1, x2, y2) {
  return Math.atan2(y2 - y1, x2 - x1);
}

function getDistanceBetweenPoints(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

function addAngle(angle, delta) {
  let result = angle + delta;
  while (result < 0) result += Math.PI * 2;
  while (result >= Math.PI * 2) result -= Math.PI * 2;
  return result;
}

function diffAngle(angle1, angle2) {
  let diff = angle2 - angle1;
  while (diff < -Math.PI) diff += Math.PI * 2;
  while (diff > Math.PI) diff -= Math.PI * 2;
  return diff;
}

function calcWheelRotationForTargetAngle(currentRotation, targetAngle, rotationSpeedMax, rotationResistance) {
  let diff = diffAngle(currentRotation, targetAngle);
  let speed = Math.min(Math.abs(diff) * 0.3, rotationSpeedMax);
  return diff > 0 ? speed : -speed;
}

function isObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNumber(value) {
  return typeof value === 'number' && !isNaN(value);
}

function setProp(obj, key, value) {
  if (isObject(obj)) {
    obj[key] = value;
  }
  return obj;
}

function fixFloat(value, precision = 2) {
  const factor = Math.pow(10, precision);
  return Math.round(value * factor) / factor;
}

function easeSinOut(t) {
  return Math.sin(t * Math.PI / 2);
}

function getResizeObserver(callback) {
  if (typeof ResizeObserver !== 'undefined') {
    return new ResizeObserver(callback);
  }
  return null;
}

function register(element, options) {
  return new Wheel(element, options);
}

function unregister(wheel) {
  if (wheel && typeof wheel.remove === 'function') {
    wheel.remove();
  }
}

function registerPointerEvents(element, callbacks) {
  let pointerDown = false;
  let pointerId = null;

  element.addEventListener('pointerdown', function(event) {
    pointerDown = true;
    pointerId = event.pointerId;
    element.setPointerCapture(event.pointerId);
    if (callbacks.onPointerDown) callbacks.onPointerDown(event);
  });

  element.addEventListener('pointermove', function(event) {
    if (pointerDown && event.pointerId === pointerId) {
      if (callbacks.onPointerMove) callbacks.onPointerMove(event);
    }
  });

  element.addEventListener('pointerup', function(event) {
    if (pointerDown && event.pointerId === pointerId) {
      pointerDown = false;
      pointerId = null;
      element.releasePointerCapture(event.pointerId);
      if (callbacks.onPointerUp) callbacks.onPointerUp(event);
    }
  });

  element.addEventListener('pointercancel', function(event) {
    if (pointerDown && event.pointerId === pointerId) {
      pointerDown = false;
      pointerId = null;
      if (callbacks.onPointerCancel) callbacks.onPointerCancel(event);
    }
  });
}

var arcAdjust = -90;
var baseCanvasSize = 500;
var dragCapturePeriod = 250;

var AlignText = Object.freeze({
  left: 'left',
  right: 'right',
  center: 'center'
});

var Defaults = Object.freeze({
  wheel: {
    borderColor: '#000',
    borderWidth: 1,
    debug: false,
    image: null,
    isInteractive: true,
    itemBackgroundColors: ['#fff'],
    itemLabelAlign: AlignText.right,
    itemLabelBaselineOffset: 0,
    itemLabelColors: ['#000'],
    itemLabelFont: 'sans-serif',
    itemLabelFontSizeMax: baseCanvasSize,
    itemLabelRadius: 0.85,
    itemLabelRadiusMax: 0.2,
    itemLabelRotation: 0,
    itemLabelStrokeColor: '#fff',
    itemLabelStrokeWidth: 0,
    items: [],
    lineColor: '#000',
    lineWidth: 1,
    pixelRatio: 0,
    radius: 0.95,
    rotation: 0,
    rotationResistance: -35,
    rotationSpeedMax: 300,
    offset: { x: 0, y: 0 },
    onCurrentIndexChange: null,
    onRest: null,
    onSpin: null,
    overlayImage: null,
    pointerAngle: 0
  },
  item: {
    backgroundColor: null,
    image: null,
    imageOpacity: 1,
    imageRadius: 0.5,
    imageRotation: 0,
    imageScale: 1,
    label: '',
    labelColor: null,
    value: null,
    weight: 1
  }
});

var Debugging = Object.freeze({
  pointerLineColor: '#ff00ff',
  labelBoundingBoxColor: '#ff00ff',
  labelRadiusColor: '#00ff00',
  dragPointHue: 300
});

class Item {
  constructor(options = {}) {
    this.init(options);
  }

  init(options = {}) {
    this.backgroundColor = options.backgroundColor ?? Defaults.item.backgroundColor;
    this.image = options.image ?? Defaults.item.image;
    this.imageOpacity = options.imageOpacity ?? Defaults.item.imageOpacity;
    this.imageRadius = options.imageRadius ?? Defaults.item.imageRadius;
    this.imageRotation = options.imageRotation ?? Defaults.item.imageRotation;
    this.imageScale = options.imageScale ?? Defaults.item.imageScale;
    this.label = options.label ?? Defaults.item.label;
    this.labelColor = options.labelColor ?? Defaults.item.labelColor;
    this.value = options.value ?? Defaults.item.value;
    this.weight = options.weight ?? Defaults.item.weight;
  }

  get backgroundColor() { return this._backgroundColor; }
  set backgroundColor(value) { this._backgroundColor = value; }

  get image() { return this._image; }
  set image(value) { this._image = value; }

  get imageOpacity() { return this._imageOpacity; }
  set imageOpacity(value) { this._imageOpacity = value; }

  get imageRadius() { return this._imageRadius; }
  set imageRadius(value) { this._imageRadius = value; }

  get imageRotation() { return this._imageRotation; }
  set imageRotation(value) { this._imageRotation = value; }

  get imageScale() { return this._imageScale; }
  set imageScale(value) { this._imageScale = value; }

  get label() { return this._label; }
  set label(value) { this._label = value; }

  get value() { return this._value; }
  set value(value) { this._value = value; }

  get weight() { return this._weight; }
  set weight(value) { this._weight = value; }

  getCenterAngle() {
    return (this.getStartAngle() + this.getEndAngle()) / 2;
  }

  getStartAngle() {
    return this._startAngle;
  }

  getEndAngle() {
    return this._endAngle;
  }

  getItemAngles() {
    return { start: this.getStartAngle(), end: this.getEndAngle(), center: this.getCenterAngle() };
  }
}

class Wheel {
  constructor(element, options = {}) {
    this.element = element;
    this.init(options);
  }

  init(options = {}) {
    const wheelDefaults = Defaults.wheel;
    this.borderColor = options.borderColor ?? wheelDefaults.borderColor;
    this.borderWidth = options.borderWidth ?? wheelDefaults.borderWidth;
    this.debug = options.debug ?? wheelDefaults.debug;
    this.image = options.image ?? wheelDefaults.image;
    this.isInteractive = options.isInteractive ?? wheelDefaults.isInteractive;
    this.itemBackgroundColors = options.itemBackgroundColors ?? wheelDefaults.itemBackgroundColors;
    this.itemLabelAlign = options.itemLabelAlign ?? wheelDefaults.itemLabelAlign;
    this.itemLabelBaselineOffset = options.itemLabelBaselineOffset ?? wheelDefaults.itemLabelBaselineOffset;
    this.itemLabelColors = options.itemLabelColors ?? wheelDefaults.itemLabelColors;
    this.itemLabelFont = options.itemLabelFont ?? wheelDefaults.itemLabelFont;
    this.itemLabelFontSizeMax = options.itemLabelFontSizeMax ?? wheelDefaults.itemLabelFontSizeMax;
    this.itemLabelRadius = options.itemLabelRadius ?? wheelDefaults.itemLabelRadius;
    this.itemLabelRadiusMax = options.itemLabelRadiusMax ?? wheelDefaults.itemLabelRadiusMax;
    this.itemLabelRotation = options.itemLabelRotation ?? wheelDefaults.itemLabelRotation;
    this.itemLabelStrokeColor = options.itemLabelStrokeColor ?? wheelDefaults.itemLabelStrokeColor;
    this.itemLabelStrokeWidth = options.itemLabelStrokeWidth ?? wheelDefaults.itemLabelStrokeWidth;
    this.items = options.items ?? wheelDefaults.items;
    this.lineColor = options.lineColor ?? wheelDefaults.lineColor;
    this.lineWidth = options.lineWidth ?? wheelDefaults.lineWidth;
    this.pixelRatio = options.pixelRatio ?? wheelDefaults.pixelRatio;
    this.radius = options.radius ?? wheelDefaults.radius;
    this.rotation = options.rotation ?? wheelDefaults.rotation;
    this.rotationResistance = options.rotationResistance ?? wheelDefaults.rotationResistance;
    this.rotationSpeedMax = options.rotationSpeedMax ?? wheelDefaults.rotationSpeedMax;
    this.offset = options.offset ?? wheelDefaults.offset;
    this.onCurrentIndexChange = options.onCurrentIndexChange ?? wheelDefaults.onCurrentIndexChange;
    this.onRest = options.onRest ?? wheelDefaults.onRest;
    this.onSpin = options.onSpin ?? wheelDefaults.onSpin;
    this.overlayImage = options.overlayImage ?? wheelDefaults.overlayImage;
    this.pointerAngle = options.pointerAngle ?? wheelDefaults.pointerAngle;

    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.element.appendChild(this.canvas);
    this.rotationSpeed = 0;
    this.currentIndex = -1;
    this.isDragging = false;
    this.dragPoints = [];

    this.resize();
    this.draw();

    if (this.isInteractive) {
      registerPointerEvents(this.canvas, {
        onPointerDown: (e) => this.dragStart(e),
        onPointerMove: (e) => this.dragMove(e),
        onPointerUp: (e) => this.dragEnd(e)
      });
    }

    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.resize());
      this.resizeObserver.observe(this.element);
    }
  }

  setItems(items) {
    this.items = items;
    this.refreshCurrentIndex();
    this.draw();
  }

  refresh() {
    this.draw();
  }

  resize() {
    const rect = this.element.getBoundingClientRect();
    const size = Math.min(rect.width, rect.height);
    const ratio = this.getActualPixelRatio();
    this.canvas.width = size * ratio;
    this.canvas.height = size * ratio;
    this.canvas.style.width = size + 'px';
    this.canvas.style.height = size + 'px';
    this.draw();
  }

  draw() {
    const ctx = this.ctx;
    const size = this.canvas.width;
    const center = { x: size / 2, y: size / 2 };
    const radius = size / 2 * this.radius;

    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.translate(center.x + this.offset.x, center.y + this.offset.y);
    ctx.rotate(degRad(this.rotation + arcAdjust));

    this.drawItemBackgrounds(ctx, radius);
    this.drawItemImages(ctx, radius);
    this.drawItemLines(ctx, radius);
    this.drawItemLabels(ctx, radius);

    ctx.restore();

    if (this.debug) {
      this.drawDebugPointerLine(ctx, center, radius);
      this.drawDebugDragPoints(ctx, center);
    }
  }

  drawItemBackgrounds(ctx, radius) {
    const items = this.items;
    if (!items.length) return;
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    let currentAngle = 0;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const angleSize = (item.weight / totalWeight) * Math.PI * 2;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angleSize;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.closePath();

      const bgColor = item.backgroundColor || this.itemBackgroundColors[i % this.itemBackgroundColors.length];
      ctx.fillStyle = bgColor || '#fff';
      ctx.fill();

      currentAngle = endAngle;
    }
  }

  drawItemImages(ctx, radius) {
    const items = this.items;
    if (!items.length) return;
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    let currentAngle = 0;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const angleSize = (item.weight / totalWeight) * Math.PI * 2;
      const centerAngle = currentAngle + angleSize / 2;
      const imgRadius = radius * item.imageRadius;

      if (item.image) {
        ctx.save();
        ctx.rotate(centerAngle);
        ctx.translate(radius * 0.7, 0);
        ctx.rotate(degRad(item.imageRotation));
        ctx.globalAlpha = item.imageOpacity;
        const imgSize = imgRadius * 2 * item.imageScale;
        try {
          ctx.drawImage(item.image, -imgSize / 2, -imgSize / 2, imgSize, imgSize);
        } catch(e) {}
        ctx.globalAlpha = 1;
        ctx.restore();
      }

      currentAngle += angleSize;
    }
  }

  drawItemLines(ctx, radius) {
    const items = this.items;
    if (!items.length) return;
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    let currentAngle = 0;
    ctx.strokeStyle = this.lineColor;
    ctx.lineWidth = this.lineWidth;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const angleSize = (item.weight / totalWeight) * Math.PI * 2;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(currentAngle) * radius, Math.sin(currentAngle) * radius);
      ctx.stroke();

      currentAngle += angleSize;
    }

    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.strokeStyle = this.borderColor;
    ctx.lineWidth = this.borderWidth;
    ctx.stroke();
  }

  drawItemLabels(ctx, radius) {
    const items = this.items;
    if (!items.length) return;
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    let currentAngle = 0;
    const labelRadius = radius * this.itemLabelRadius;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const angleSize = (item.weight / totalWeight) * Math.PI * 2;
      const centerAngle = currentAngle + angleSize / 2;

      ctx.save();
      ctx.rotate(centerAngle);
      ctx.translate(labelRadius, 0);
      ctx.rotate(degRad(this.itemLabelRotation));

      const labelColor = item.labelColor || this.itemLabelColors[i % this.itemLabelColors.length];
      ctx.fillStyle = labelColor;
      ctx.font = this.itemLabelFont;
      ctx.textAlign = this.itemLabelAlign;
      ctx.textBaseline = 'middle';

      if (this.itemLabelStrokeWidth > 0) {
        ctx.strokeStyle = this.itemLabelStrokeColor;
        ctx.lineWidth = this.itemLabelStrokeWidth;
        ctx.strokeText(item.label, 0, this.itemLabelBaselineOffset);
      }
      ctx.fillText(item.label, 0, this.itemLabelBaselineOffset);
      ctx.restore();

      currentAngle += angleSize;
    }
  }

  animateRotation() {
    if (Math.abs(this.rotationSpeed) < 0.01) {
      this.rotationSpeed = 0;
      if (this.isSpinning) {
        this.isSpinning = false;
        if (this.onRest) this.onRest();
      }
      return false;
    }

    this.rotation += this.rotationSpeed;
    this.rotationSpeed *= (1 + this.rotationResistance / 1000);

    if (Math.abs(this.rotationSpeed) > this.rotationSpeedMax) {
      this.rotationSpeed = this.rotationSpeed > 0 ? this.rotationSpeedMax : -this.rotationSpeedMax;
    }

    this.refreshCurrentIndex();
    this.draw();
    return true;
  }

  spin() {
    this.isSpinning = true;
    this.rotationSpeed = getRandomFloat(-this.rotationSpeedMax, this.rotationSpeedMax);
    if (this.onSpin) this.onSpin();
    this.animate();
  }

  animate() {
    const animate = () => {
      if (this.animateRotation()) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }

  spinTo(targetRotation, duration) {
    const startRotation = this.rotation;
    const startTime = performance.now();
    this.isSpinning = true;

    const animate = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeSinOut(progress);
      this.rotation = startRotation + (targetRotation - startRotation) * eased;
      this.refreshCurrentIndex();
      this.draw();

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.isSpinning = false;
        if (this.onRest) this.onRest();
      }
    };
    requestAnimationFrame(animate);
  }

  spinToItem(index, duration) {
    const items = this.items;
    if (!items.length || index < 0 || index >= items.length) return;
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    let targetAngle = 0;
    for (let i = 0; i < index; i++) {
      targetAngle += (items[i].weight / totalWeight) * Math.PI * 2;
    }
    targetAngle += (items[index].weight / totalWeight) * Math.PI;
    const pointerAngle = degRad(this.pointerAngle - arcAdjust);
    const targetRotation = -(targetAngle - pointerAngle);
    this.spinTo(targetRotation, duration);
  }

  getActualPixelRatio() {
    return this.pixelRatio || (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
  }

  getAngleFromCenter(x, y) {
    const rect = this.canvas.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    return getAngle(cx, cy, x, y);
  }

  getRotationSpeedPlusDrag() {
    return this.rotationSpeed;
  }

  isDragEventTooOld(event) {
    return performance.now() - event.timeStamp > dragCapturePeriod;
  }

  getCurrentIndex() {
    return this.currentIndex;
  }

  refreshCurrentIndex() {
    const newIndex = this.getIndex();
    if (newIndex !== this.currentIndex) {
      this.currentIndex = newIndex;
      this.raiseEvent_onCurrentIndexChange();
    }
  }

  getIndex() {
    const items = this.items;
    if (!items.length) return -1;
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    const pointerAngle = degRad(this.pointerAngle - arcAdjust);
    const currentAngle = addAngle(-degRad(this.rotation), pointerAngle);

    let accumulated = 0;
    for (let i = 0; i < items.length; i++) {
      const angleSize = (items[i].weight / totalWeight) * Math.PI * 2;
      if (currentAngle >= accumulated && currentAngle < accumulated + angleSize) {
        return i;
      }
      accumulated += angleSize;
    }
    return items.length - 1;
  }

  beginSpin(direction) {
    this.isSpinning = true;
    this.rotationSpeed = direction * this.rotationSpeedMax;
    if (this.onSpin) this.onSpin();
    this.animate();
  }

  wheelHitTest(x, y) {
    const rect = this.canvas.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const radius = Math.min(rect.width, rect.height) / 2 * this.radius;
    return isPointInCircle(x - rect.left, y - rect.top, cx, cy, radius);
  }

  get borderColor() { return this._borderColor; }
  set borderColor(value) { this._borderColor = value; this.draw(); }
  get borderWidth() { return this._borderWidth; }
  set borderWidth(value) { this._borderWidth = value; this.draw(); }
  get debug() { return this._debug; }
  set debug(value) { this._debug = value; this.draw(); }
  get image() { return this._image; }
  set image(value) { this._image = value; this.draw(); }
  get isInteractive() { return this._isInteractive; }
  set isInteractive(value) { this._isInteractive = value; }
  get itemBackgroundColors() { return this._itemBackgroundColors; }
  set itemBackgroundColors(value) { this._itemBackgroundColors = value; this.draw(); }
  get itemLabelAlign() { return this._itemLabelAlign; }
  set itemLabelAlign(value) { this._itemLabelAlign = value; this.draw(); }
  get itemLabelBaselineOffset() { return this._itemLabelBaselineOffset; }
  set itemLabelBaselineOffset(value) { this._itemLabelBaselineOffset = value; this.draw(); }
  get itemLabelColors() { return this._itemLabelColors; }
  set itemLabelColors(value) { this._itemLabelColors = value; this.draw(); }
  get itemLabelFont() { return this._itemLabelFont; }
  set itemLabelFont(value) { this._itemLabelFont = value; this.draw(); }
  get itemLabelFontSizeMax() { return this._itemLabelFontSizeMax; }
  set itemLabelFontSizeMax(value) { this._itemLabelFontSizeMax = value; this.draw(); }
  get itemLabelRadius() { return this._itemLabelRadius; }
  set itemLabelRadius(value) { this._itemLabelRadius = value; this.draw(); }
  get itemLabelRadiusMax() { return this._itemLabelRadiusMax; }
  set itemLabelRadiusMax(value) { this._itemLabelRadiusMax = value; this.draw(); }
  get itemLabelRotation() { return this._itemLabelRotation; }
  set itemLabelRotation(value) { this._itemLabelRotation = value; this.draw(); }
  get itemLabelStrokeColor() { return this._itemLabelStrokeColor; }
  set itemLabelStrokeColor(value) { this._itemLabelStrokeColor = value; this.draw(); }
  get itemLabelStrokeWidth() { return this._itemLabelStrokeWidth; }
  set itemLabelStrokeWidth(value) { this._itemLabelStrokeWidth = value; this.draw(); }
  get items() { return this._items; }
  set items(value) { this._items = value; this.refreshCurrentIndex(); this.draw(); }
  get lineColor() { return this._lineColor; }
  set lineColor(value) { this._lineColor = value; this.draw(); }
  get lineWidth() { return this._lineWidth; }
  set lineWidth(value) { this._lineWidth = value; this.draw(); }
  get onCurrentIndexChange() { return this._onCurrentIndexChange; }
  set onCurrentIndexChange(value) { this._onCurrentIndexChange = value; }
  get onRest() { return this._onRest; }
  set onRest(value) { this._onRest = value; }
  get onSpin() { return this._onSpin; }
  set onSpin(value) { this._onSpin = value; }
  get overlayImage() { return this._overlayImage; }
  set overlayImage(value) { this._overlayImage = value; this.draw(); }
  get pixelRatio() { return this._pixelRatio; }
  set pixelRatio(value) { this._pixelRatio = value; this.resize(); }
  get pointerAngle() { return this._pointerAngle; }
  set pointerAngle(value) { this._pointerAngle = value; this.refreshCurrentIndex(); this.draw(); }
  get radius() { return this._radius; }
  set radius(value) { this._radius = value; this.draw(); }
  get rotation() { return this._rotation; }
  set rotation(value) { this._rotation = value; this.refreshCurrentIndex(); this.draw(); }
  get rotationResistance() { return this._rotationResistance; }
  set rotationResistance(value) { this._rotationResistance = value; }
  get rotationSpeedMax() { return this._rotationSpeedMax; }
  set rotationSpeedMax(value) { this._rotationSpeedMax = value; }

  dragStart(event) {
    if (!this.isInteractive) return;
    this.isDragging = true;
    const pos = translateXYToElement(event.clientX, event.clientY, this.canvas);
    this.dragStartAngle = this.getAngleFromCenter(pos.x, pos.y);
    this.dragStartRotation = this.rotation;
    this.dragPoints = [{ x: pos.x, y: pos.y, time: performance.now() }];
  }

  dragMove(event) {
    if (!this.isDragging) return;
    const pos = translateXYToElement(event.clientX, event.clientY, this.canvas);
    const currentAngle = this.getAngleFromCenter(pos.x, pos.y);
    const angleDiff = diffAngle(this.dragStartAngle, currentAngle);
    this.rotation = this.dragStartRotation + degRad(angleDiff * 180 / Math.PI);
    this.dragPoints.push({ x: pos.x, y: pos.y, time: performance.now() });
    if (this.dragPoints.length > 10) this.dragPoints.shift();
    this.refreshCurrentIndex();
    this.draw();
  }

  dragEnd(event) {
    if (!this.isDragging) return;
    this.isDragging = false;
    if (this.dragPoints.length >= 2) {
      const recent = this.dragPoints.slice(-5);
      const first = recent[0];
      const last = recent[recent.length - 1];
      const dt = last.time - first.time;
      if (dt > 0) {
        const dx = last.x - first.x;
        const dy = last.y - first.y;
        const cx = this.canvas.clientWidth / 2;
        const cy = this.canvas.clientHeight / 2;
        const angle1 = Math.atan2(first.y - cy, first.x - cx);
        const angle2 = Math.atan2(last.y - cy, last.x - cx);
        const angularVelocity = diffAngle(angle1, angle2) / (dt / 1000);
        this.rotationSpeed = angularVelocity * 180 / Math.PI;
        if (Math.abs(this.rotationSpeed) > this.rotationSpeedMax) {
          this.rotationSpeed = this.rotationSpeed > 0 ? this.rotationSpeedMax : -this.rotationSpeedMax;
        }
        this.isSpinning = true;
        this.animate();
      }
    }
  }

  raiseEvent_onCurrentIndexChange() {
    if (this.onCurrentIndexChange) {
      this.onCurrentIndexChange(this.currentIndex);
    }
  }

  raiseEvent_onRest() {
    if (this.onRest) {
      this.onRest();
    }
  }

  raiseEvent_onSpin() {
    if (this.onSpin) {
      this.onSpin();
    }
  }

  drawDebugPointerLine(ctx, center, radius) {
    const angle = degRad(this.pointerAngle + arcAdjust);
    ctx.beginPath();
    ctx.moveTo(center.x, center.y);
    ctx.lineTo(center.x + Math.cos(angle) * radius, center.y + Math.sin(angle) * radius);
    ctx.strokeStyle = Debugging.pointerLineColor;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  drawDebugDragPoints(ctx, center) {
    for (let i = 0; i < this.dragPoints.length; i++) {
      const point = this.dragPoints[i];
      const hue = (Debugging.dragPointHue + i * 30) % 360;
      ctx.beginPath();
      ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
      ctx.fill();
    }
  }

  remove() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }
}

globalThis.getRandomInt = getRandomInt;
globalThis.getRandomFloat = getRandomFloat;
globalThis.degRad = degRad;
globalThis.isAngleBetween = isAngleBetween;
globalThis.aveArray = aveArray;
globalThis.getFontSizeToFit = getFontSizeToFit;
globalThis.isPointInCircle = isPointInCircle;
globalThis.translateXYToElement = translateXYToElement;
globalThis.getMouseButtonsPressed = getMouseButtonsPressed;
globalThis.getAngle = getAngle;
globalThis.getDistanceBetweenPoints = getDistanceBetweenPoints;
globalThis.addAngle = addAngle;
globalThis.diffAngle = diffAngle;
globalThis.calcWheelRotationForTargetAngle = calcWheelRotationForTargetAngle;
globalThis.isObject = isObject;
globalThis.isNumber = isNumber;
globalThis.setProp = setProp;
globalThis.fixFloat = fixFloat;
globalThis.easeSinOut = easeSinOut;
globalThis.getResizeObserver = getResizeObserver;
globalThis.register = register;
globalThis.unregister = unregister;
globalThis.registerPointerEvents = registerPointerEvents;
globalThis.arcAdjust = arcAdjust;
globalThis.baseCanvasSize = baseCanvasSize;
globalThis.dragCapturePeriod = dragCapturePeriod;
globalThis.AlignText = AlignText;
globalThis.Defaults = Defaults;
globalThis.Debugging = Debugging;
globalThis.Item = Item;
globalThis.Wheel = Wheel;

export { Wheel };
