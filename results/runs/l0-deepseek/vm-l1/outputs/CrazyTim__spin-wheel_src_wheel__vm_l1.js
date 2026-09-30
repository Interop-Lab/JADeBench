const globalObject = typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : void 0;
const moduleContext = globalObject.__module_context__ || (globalObject.__module_context__ = {});
if (!moduleContext.module) try { moduleContext.module = module; } catch (e) {}
if (!moduleContext.exports) try { moduleContext.exports = exports; } catch (e) {}
if (!moduleContext.require) try { moduleContext.require = require; } catch (e) {}
if (!moduleContext.__dirname) try { moduleContext.__dirname = __dirname; } catch (e) {}
if (!moduleContext.__filename) try { moduleContext.__filename = __filename; } catch (e) {}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

function degRad(deg) {
  return deg * (Math.PI / 180);
}

function isAngleBetween(angle, start, end) {
  const twoPi = Math.PI * 2;
  angle = ((angle % twoPi) + twoPi) % twoPi;
  start = ((start % twoPi) + twoPi) % twoPi;
  end = ((end % twoPi) + twoPi) % twoPi;
  if (start <= end) {
    return angle >= start && angle <= end;
  }
  return angle >= start || angle <= end;
}

function aveArray(arr) {
  if (!arr || arr.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i];
  }
  return sum / arr.length;
}

function getFontSizeToFit(text, maxWidth, font, maxFontSize) {
  let fontSize = maxFontSize || 100;
  const ctx = document.createElement('canvas').getContext('2d');
  ctx.font = `${fontSize}px ${font}`;
  while (ctx.measureText(text).width > maxWidth && fontSize > 1) {
    fontSize--;
    ctx.font = `${fontSize}px ${font}`;
  }
  return fontSize;
}

function isPointInCircle(x, y, cx, cy, radius) {
  const dx = x - cx;
  const dy = y - cy;
  return dx * dx + dy * dy <= radius * radius;
}

function translateXYToElement(x, y, element) {
  const rect = element.getBoundingClientRect();
  return {
    x: x - rect.left,
    y: y - rect.top
  };
}

function getMouseButtonsPressed(event) {
  let buttons = 0;
  if (event.buttons !== undefined) {
    buttons = event.buttons;
  } else if (event.which !== undefined) {
    buttons = event.which;
  }
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

function addAngle(angle1, angle2) {
  const twoPi = Math.PI * 2;
  let result = angle1 + angle2;
  result = ((result % twoPi) + twoPi) % twoPi;
  return result;
}

function diffAngle(angle1, angle2) {
  const twoPi = Math.PI * 2;
  let diff = angle2 - angle1;
  diff = ((diff % twoPi) + twoPi) % twoPi;
  if (diff > Math.PI) {
    diff -= twoPi;
  }
  return diff;
}

function calcWheelRotationForTargetAngle(currentRotation, targetAngle) {
  const twoPi = Math.PI * 2;
  let diff = targetAngle - currentRotation;
  diff = ((diff % twoPi) + twoPi) % twoPi;
  if (diff > Math.PI) {
    diff -= twoPi;
  }
  return currentRotation + diff;
}

function isObject(value) {
  return value !== null && typeof value === 'object';
}

function isNumber(value) {
  return typeof value === 'number' && !isNaN(value);
}

function setProp(obj, prop, value) {
  obj[prop] = value;
}

function fixFloat(value, precision) {
  const factor = Math.pow(10, precision || 0);
  return Math.round(value * factor) / factor;
}

function easeSinOut(t) {
  return Math.sin(t * Math.PI / 2);
}

function getResizeObserver() {
  return typeof ResizeObserver !== 'undefined' ? ResizeObserver : null;
}

function register(wheel) {
  if (wheel && typeof wheel.init === 'function') {
    wheel.init();
  }
}

function unregister(wheel) {
  if (wheel && typeof wheel.destroy === 'function') {
    wheel.destroy();
  }
}

function registerPointerEvents(wheel) {
  if (wheel && typeof wheel.registerPointerEvents === 'function') {
    wheel.registerPointerEvents();
  }
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
    itemLabelAlign: AlignText.center,
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
  constructor(options) {
    this.init(options);
  }

  init(options) {
    options = options || {};
    this.backgroundColor = options.backgroundColor !== undefined ? options.backgroundColor : Defaults.item.backgroundColor;
    this.image = options.image !== undefined ? options.image : Defaults.item.image;
    this.imageOpacity = options.imageOpacity !== undefined ? options.imageOpacity : Defaults.item.imageOpacity;
    this.imageRadius = options.imageRadius !== undefined ? options.imageRadius : Defaults.item.imageRadius;
    this.imageRotation = options.imageRotation !== undefined ? options.imageRotation : Defaults.item.imageRotation;
    this.imageScale = options.imageScale !== undefined ? options.imageScale : Defaults.item.imageScale;
    this.label = options.label !== undefined ? options.label : Defaults.item.label;
    this.labelColor = options.labelColor !== undefined ? options.labelColor : Defaults.item.labelColor;
    this.value = options.value !== undefined ? options.value : Defaults.item.value;
    this.weight = options.weight !== undefined ? options.weight : Defaults.item.weight;
    this.startAngle = 0;
    this.endAngle = 0;
  }

  getStartAngle() {
    return this.startAngle;
  }

  getEndAngle() {
    return this.endAngle;
  }

  getCenterAngle() {
    return (this.startAngle + this.endAngle) / 2;
  }
}

class Wheel {
  constructor(options) {
    this.init(options);
  }

  init(options) {
    options = options || {};
    this.borderColor = options.borderColor !== undefined ? options.borderColor : Defaults.wheel.borderColor;
    this.borderWidth = options.borderWidth !== undefined ? options.borderWidth : Defaults.wheel.borderWidth;
    this.debug = options.debug !== undefined ? options.debug : Defaults.wheel.debug;
    this.image = options.image !== undefined ? options.image : Defaults.wheel.image;
    this.isInteractive = options.isInteractive !== undefined ? options.isInteractive : Defaults.wheel.isInteractive;
    this.itemBackgroundColors = options.itemBackgroundColors !== undefined ? options.itemBackgroundColors : Defaults.wheel.itemBackgroundColors;
    this.itemLabelAlign = options.itemLabelAlign !== undefined ? options.itemLabelAlign : Defaults.wheel.itemLabelAlign;
    this.itemLabelBaselineOffset = options.itemLabelBaselineOffset !== undefined ? options.itemLabelBaselineOffset : Defaults.wheel.itemLabelBaselineOffset;
    this.itemLabelColors = options.itemLabelColors !== undefined ? options.itemLabelColors : Defaults.wheel.itemLabelColors;
    this.itemLabelFont = options.itemLabelFont !== undefined ? options.itemLabelFont : Defaults.wheel.itemLabelFont;
    this.itemLabelFontSizeMax = options.itemLabelFontSizeMax !== undefined ? options.itemLabelFontSizeMax : Defaults.wheel.itemLabelFontSizeMax;
    this.itemLabelRadius = options.itemLabelRadius !== undefined ? options.itemLabelRadius : Defaults.wheel.itemLabelRadius;
    this.itemLabelRadiusMax = options.itemLabelRadiusMax !== undefined ? options.itemLabelRadiusMax : Defaults.wheel.itemLabelRadiusMax;
    this.itemLabelRotation = options.itemLabelRotation !== undefined ? options.itemLabelRotation : Defaults.wheel.itemLabelRotation;
    this.itemLabelStrokeColor = options.itemLabelStrokeColor !== undefined ? options.itemLabelStrokeColor : Defaults.wheel.itemLabelStrokeColor;
    this.itemLabelStrokeWidth = options.itemLabelStrokeWidth !== undefined ? options.itemLabelStrokeWidth : Defaults.wheel.itemLabelStrokeWidth;
    this.items = options.items !== undefined ? options.items : Defaults.wheel.items;
    this.lineColor = options.lineColor !== undefined ? options.lineColor : Defaults.wheel.lineColor;
    this.lineWidth = options.lineWidth !== undefined ? options.lineWidth : Defaults.wheel.lineWidth;
    this.pixelRatio = options.pixelRatio !== undefined ? options.pixelRatio : Defaults.wheel.pixelRatio;
    this.radius = options.radius !== undefined ? options.radius : Defaults.wheel.radius;
    this.rotation = options.rotation !== undefined ? options.rotation : Defaults.wheel.rotation;
    this.rotationResistance = options.rotationResistance !== undefined ? options.rotationResistance : Defaults.wheel.rotationResistance;
    this.rotationSpeedMax = options.rotationSpeedMax !== undefined ? options.rotationSpeedMax : Defaults.wheel.rotationSpeedMax;
    this.offset = options.offset !== undefined ? options.offset : Defaults.wheel.offset;
    this.onCurrentIndexChange = options.onCurrentIndexChange !== undefined ? options.onCurrentIndexChange : Defaults.wheel.onCurrentIndexChange;
    this.onRest = options.onRest !== undefined ? options.onRest : Defaults.wheel.onRest;
    this.onSpin = options.onSpin !== undefined ? options.onSpin : Defaults.wheel.onSpin;
    this.overlayImage = options.overlayImage !== undefined ? options.overlayImage : Defaults.wheel.overlayImage;
    this.pointerAngle = options.pointerAngle !== undefined ? options.pointerAngle : Defaults.wheel.pointerAngle;
    this.currentIndex = 0;
    this.rotationSpeed = 0;
    this.isSpinning = false;
    this.isDragging = false;
    this.dragStartAngle = 0;
    this.dragStartRotation = 0;
    this.dragStartTime = 0;
    this.dragEndTime = 0;
    this.dragEndRotation = 0;
    this.dragEndSpeed = 0;
    this.dragCapturePeriod = dragCapturePeriod;
    this.canvas = null;
    this.ctx = null;
    this.resizeObserver = null;
    this.pointerEventsRegistered = false;
    this.items = this.items.map(item => item instanceof Item ? item : new Item(item));
    this.updateItemAngles();
  }

  updateItemAngles() {
    const totalWeight = this.items.reduce((sum, item) => sum + item.weight, 0);
    let currentAngle = 0;
    const twoPi = Math.PI * 2;
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      const angleSize = (item.weight / totalWeight) * twoPi;
      item.startAngle = currentAngle;
      item.endAngle = currentAngle + angleSize;
      currentAngle += angleSize;
    }
  }

  getCurrentIndex() {
    const twoPi = Math.PI * 2;
    let pointerAngle = ((this.pointerAngle - this.rotation) % twoPi + twoPi) % twoPi;
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      let start = ((item.startAngle) % twoPi + twoPi) % twoPi;
      let end = ((item.endAngle) % twoPi + twoPi) % twoPi;
      if (start <= end) {
        if (pointerAngle >= start && pointerAngle < end) {
          return i;
        }
      } else {
        if (pointerAngle >= start || pointerAngle < end) {
          return i;
        }
      }
    }
    return 0;
  }

  getItemAngles(index) {
    if (index < 0 || index >= this.items.length) return null;
    return {
      start: this.items[index].startAngle,
      end: this.items[index].endAngle
    };
  }

  getCenterAngle() {
    const twoPi = Math.PI * 2;
    let pointerAngle = ((this.pointerAngle - this.rotation) % twoPi + twoPi) % twoPi;
    return pointerAngle;
  }

  getAngleFromCenter(x, y) {
    const rect = this.canvas.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2 + this.offset.x;
    const centerY = rect.top + rect.height / 2 + this.offset.y;
    return Math.atan2(y - centerY, x - centerX);
  }

  getRotationSpeedPlusDrag() {
    return this.rotationSpeed;
  }

  getScaledNumber(value) {
    const pixelRatio = this.getActualPixelRatio();
    return value * pixelRatio;
  }

  getActualPixelRatio() {
    if (this.pixelRatio) return this.pixelRatio;
    return window.devicePixelRatio || 1;
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const pixelRatio = this.getActualPixelRatio();
    this.canvas.width = rect.width * pixelRatio;
    this.canvas.height = rect.height * pixelRatio;
    this.ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    this.draw();
  }

  draw() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const rect = this.canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const centerX = width / 2 + this.offset.x;
    const centerY = height / 2 + this.offset.y;
    const radius = Math.min(width, height) / 2 * this.radius;
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(this.rotation);
    this.drawItemBackgrounds(ctx, radius);
    this.drawItemLines(ctx, radius);
    this.drawItemImages(ctx, radius);
    this.drawItemLabels(ctx, radius);
    ctx.restore();
    if (this.overlayImage) {
      ctx.drawImage(this.overlayImage, centerX - this.overlayImage.width / 2, centerY - this.overlayImage.height / 2);
    }
    if (this.debug) {
      this.drawDebugPointerLine(ctx, centerX, centerY, radius);
      this.drawDebugDragPoints(ctx, centerX, centerY, radius);
    }
  }

  drawItemBackgrounds(ctx, radius) {
    const twoPi = Math.PI * 2;
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      const color = item.backgroundColor || this.itemBackgroundColors[i % this.itemBackgroundColors.length];
      if (color) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, item.startAngle, item.endAngle);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
      }
    }
  }

  drawItemLines(ctx, radius) {
    const twoPi = Math.PI * 2;
    ctx.strokeStyle = this.lineColor;
    ctx.lineWidth = this.lineWidth;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, twoPi);
    ctx.stroke();
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(item.startAngle) * radius, Math.sin(item.startAngle) * radius);
      ctx.stroke();
    }
  }

  drawItemImages(ctx, radius) {
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      if (item.image) {
        const angle = (item.startAngle + item.endAngle) / 2;
        const imageRadius = radius * item.imageRadius;
        const x = Math.cos(angle) * imageRadius;
        const y = Math.sin(angle) * imageRadius;
        const size = radius * item.imageScale;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(item.imageRotation);
        ctx.globalAlpha = item.imageOpacity;
        ctx.drawImage(item.image, -size / 2, -size / 2, size, size);
        ctx.restore();
      }
    }
  }

  drawItemLabels(ctx, radius) {
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      if (item.label) {
        const angle = (item.startAngle + item.endAngle) / 2;
        const labelRadius = radius * this.itemLabelRadius;
        const x = Math.cos(angle) * labelRadius;
        const y = Math.sin(angle) * labelRadius;
        const fontSize = getFontSizeToFit(item.label, radius * this.itemLabelRadiusMax, this.itemLabelFont, this.itemLabelFontSizeMax);
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle + this.itemLabelRotation);
        ctx.font = `${fontSize}px ${this.itemLabelFont}`;
        ctx.textAlign = this.itemLabelAlign;
        ctx.textBaseline = 'middle';
        ctx.fillStyle = item.labelColor || this.itemLabelColors[i % this.itemLabelColors.length];
        ctx.fillText(item.label, 0, this.itemLabelBaselineOffset);
        if (this.itemLabelStrokeWidth > 0) {
          ctx.strokeStyle = this.itemLabelStrokeColor;
          ctx.lineWidth = this.itemLabelStrokeWidth;
          ctx.strokeText(item.label, 0, this.itemLabelBaselineOffset);
        }
        ctx.restore();
      }
    }
  }

  drawDebugPointerLine(ctx, centerX, centerY, radius) {
    ctx.save();
    ctx.strokeStyle = Debugging.pointerLineColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + Math.cos(this.pointerAngle) * radius, centerY + Math.sin(this.pointerAngle) * radius);
    ctx.stroke();
    ctx.restore();
  }

  drawDebugDragPoints(ctx, centerX, centerY, radius) {
    ctx.save();
    ctx.fillStyle = `hsl(${Debugging.dragPointHue}, 100%, 50%)`;
    ctx.beginPath();
    ctx.arc(centerX + Math.cos(this.dragStartAngle) * radius, centerY + Math.sin(this.dragStartAngle) * radius, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  animateRotation() {
    if (!this.isSpinning) return;
    const now = performance.now();
    const deltaTime = (now - this.lastFrameTime) / 1000;
    this.lastFrameTime = now;
    this.rotation += this.rotationSpeed * deltaTime;
    this.rotation = ((this.rotation % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    this.rotationSpeed *= Math.pow(this.rotationResistance, deltaTime);
    if (Math.abs(this.rotationSpeed) < 0.01) {
      this.rotationSpeed = 0;
      this.isSpinning = false;
      this.raiseEvent_onRest();
    }
    this.draw();
    if (this.isSpinning) {
      requestAnimationFrame(() => this.animateRotation());
    }
  }

  spinTo(targetRotation, duration) {
    const startRotation = this.rotation;
    const startTime = performance.now();
    const diff = diffAngle(startRotation, targetRotation);
    this.isSpinning = true;
    this.raiseEvent_onSpin();
    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeSinOut(progress);
      this.rotation = startRotation + diff * easedProgress;
      this.draw();
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        this.isSpinning = false;
        this.raiseEvent_onRest();
      }
    };
    requestAnimationFrame(step);
  }

  spinToItem(index, duration) {
    const item = this.items[index];
    if (!item) return;
    const targetAngle = (item.startAngle + item.endAngle) / 2;
    const targetRotation = calcWheelRotationForTargetAngle(this.rotation, this.pointerAngle - targetAngle);
    this.spinTo(targetRotation, duration);
  }

  beginSpin(rotationSpeed) {
    this.rotationSpeed = rotationSpeed;
    this.isSpinning = true;
    this.lastFrameTime = performance.now();
    this.raiseEvent_onSpin();
    requestAnimationFrame(() => this.animateRotation());
  }

  dragStart(event) {
    if (!this.isInteractive) return;
    this.isDragging = true;
    this.dragStartTime = performance.now();
    this.dragStartAngle = this.getAngleFromCenter(event.clientX, event.clientY);
    this.dragStartRotation = this.rotation;
    this.rotationSpeed = 0;
    this.isSpinning = false;
  }

  dragMove(event) {
    if (!this.isDragging) return;
    const currentAngle = this.getAngleFromCenter(event.clientX, event.clientY);
    const angleDiff = diffAngle(this.dragStartAngle, currentAngle);
    this.rotation = this.dragStartRotation + angleDiff;
    this.dragEndTime = performance.now();
    this.dragEndAngle = currentAngle;
    this.dragEndRotation = this.rotation;
    this.draw();
  }

  dragEnd(event) {
    if (!this.isDragging) return;
    this.isDragging = false;
    const now = performance.now();
    const timeDiff = now - this.dragStartTime;
    if (timeDiff > 0) {
      const angleDiff = diffAngle(this.dragStartAngle, this.dragEndAngle);
      this.rotationSpeed = angleDiff / (timeDiff / 1000);
      this.rotationSpeed = Math.max(-this.rotationSpeedMax, Math.min(this.rotationSpeedMax, this.rotationSpeed));
      if (Math.abs(this.rotationSpeed) > 0.01) {
        this.beginSpin(this.rotationSpeed);
      }
    }
  }

  raiseEvent_onCurrentIndexChange() {
    const newIndex = this.getCurrentIndex();
    if (newIndex !== this.currentIndex) {
      this.currentIndex = newIndex;
      if (this.onCurrentIndexChange) {
        this.onCurrentIndexChange(newIndex);
      }
    }
  }

  raiseEvent_onRest() {
    this.raiseEvent_onCurrentIndexChange();
    if (this.onRest) {
      this.onRest();
    }
  }

  raiseEvent_onSpin() {
    if (this.onSpin) {
      this.onSpin();
    }
  }

  refreshCurrentIndex() {
    this.raiseEvent_onCurrentIndexChange();
  }

  refreshAriaLabel() {
    if (this.canvas) {
      this.canvas.setAttribute('aria-label', this.items[this.currentIndex]?.label || '');
    }
  }

  refreshCursor() {
    if (this.canvas) {
      this.canvas.style.cursor = this.isInteractive ? 'pointer' : 'default';
    }
  }

  wheelHitTest(x, y) {
    const rect = this.canvas.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2 + this.offset.x;
    const centerY = rect.top + rect.height / 2 + this.offset.y;
    const radius = Math.min(rect.width, rect.height) / 2 * this.radius;
    return isPointInCircle(x, y, centerX, centerY, radius);
  }

  registerPointerEvents() {
    if (this.pointerEventsRegistered) return;
    this.pointerEventsRegistered = true;
    this.canvas.addEventListener('mousedown', (e) => this.dragStart(e));
    window.addEventListener('mousemove', (e) => this.dragMove(e));
    window.addEventListener('mouseup', (e) => this.dragEnd(e));
    this.canvas.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      this.dragStart({ clientX: touch.clientX, clientY: touch.clientY });
    });
    window.addEventListener('touchmove', (e) => {
      const touch = e.touches[0];
      this.dragMove({ clientX: touch.clientX, clientY: touch.clientY });
    });
    window.addEventListener('touchend', (e) => this.dragEnd(e));
  }

  destroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    if (this.canvas) {
      this.canvas.remove();
      this.canvas = null;
    }
  }
}

moduleContext.getRandomInt = getRandomInt;
globalObject.getRandomInt = getRandomInt;
moduleContext.getRandomFloat = getRandomFloat;
globalObject.getRandomFloat = getRandomFloat;
moduleContext.degRad = degRad;
globalObject.degRad = degRad;
moduleContext.isAngleBetween = isAngleBetween;
globalObject.isAngleBetween = isAngleBetween;
moduleContext.aveArray = aveArray;
globalObject.aveArray = aveArray;
moduleContext.getFontSizeToFit = getFontSizeToFit;
globalObject.getFontSizeToFit = getFontSizeToFit;
moduleContext.isPointInCircle = isPointInCircle;
globalObject.isPointInCircle = isPointInCircle;
moduleContext.translateXYToElement = translateXYToElement;
globalObject.translateXYToElement = translateXYToElement;
moduleContext.getMouseButtonsPressed = getMouseButtonsPressed;
globalObject.getMouseButtonsPressed = getMouseButtonsPressed;
moduleContext.getAngle = getAngle;
globalObject.getAngle = getAngle;
moduleContext.getDistanceBetweenPoints = getDistanceBetweenPoints;
globalObject.getDistanceBetweenPoints = getDistanceBetweenPoints;
moduleContext.addAngle = addAngle;
globalObject.addAngle = addAngle;
moduleContext.diffAngle = diffAngle;
globalObject.diffAngle = diffAngle;
moduleContext.calcWheelRotationForTargetAngle = calcWheelRotationForTargetAngle;
globalObject.calcWheelRotationForTargetAngle = calcWheelRotationForTargetAngle;
moduleContext.isObject = isObject;
globalObject.isObject = isObject;
moduleContext.isNumber = isNumber;
globalObject.isNumber = isNumber;
moduleContext.setProp = setProp;
globalObject.setProp = setProp;
moduleContext.fixFloat = fixFloat;
globalObject.fixFloat = fixFloat;
moduleContext.easeSinOut = easeSinOut;
globalObject.easeSinOut = easeSinOut;
moduleContext.getResizeObserver = getResizeObserver;
globalObject.getResizeObserver = getResizeObserver;
moduleContext.register = register;
globalObject.register = register;
moduleContext.unregister = unregister;
globalObject.unregister = unregister;
moduleContext.registerPointerEvents = registerPointerEvents;
globalObject.registerPointerEvents = registerPointerEvents;
moduleContext.arcAdjust = arcAdjust;
globalObject.arcAdjust = arcAdjust;
moduleContext.baseCanvasSize = baseCanvasSize;
globalObject.baseCanvasSize = baseCanvasSize;
moduleContext.dragCapturePeriod = dragCapturePeriod;
globalObject.dragCapturePeriod = dragCapturePeriod;
moduleContext.AlignText = AlignText;
globalObject.AlignText = AlignText;
moduleContext.Defaults = Defaults;
globalObject.Defaults = Defaults;
moduleContext.Debugging = Debugging;
globalObject.Debugging = Debugging;
moduleContext.Item = Item;
globalObject.Item = Item;
moduleContext.Wheel = Wheel;
globalObject.Wheel = Wheel;

export { Wheel };
