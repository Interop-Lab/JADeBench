const ARC_ADJUST = -90;
const BASE_CANVAS_SIZE = 500;
const DRAG_CAPTURE_PERIOD = 250;

const AlignText = Object.freeze({
  left: 'left',
  right: 'right',
  center: 'center',
});

const DEFAULT_OFFSET = { x: 0, y: 0 };

const Defaults = Object.freeze({
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
    itemLabelFontSizeMax: BASE_CANVAS_SIZE,
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
    offset: DEFAULT_OFFSET,
    onCurrentIndexChange: null,
    onRest: null,
    onSpin: null,
    overlayImage: null,
    pointerAngle: 0,
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
    weight: 1,
  },
});

const Debugging = Object.freeze({
  pointerLineColor: '#ff00ff',
  labelBoundingBoxColor: '#ff00ff',
  labelRadiusColor: '#00ff00',
  dragPointHue: 300,
});

function getRandomInt(min = 0, max = 0) {
  const low = Math.ceil(min);
  const high = Math.floor(max);
  return Math.floor(Math.random() * (high - low)) + low;
}

function getRandomFloat(min = 0, max = 0, decimals = 14) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function degRad(degrees = 0) {
  return degrees * Math.PI / 180;
}

function isAngleBetween(angle, startAngle, endAngle) {
  if (startAngle < endAngle) return startAngle <= angle && angle < endAngle;
  return startAngle <= angle || angle < endAngle;
}

function aveArray(values = []) {
  let total = 0;
  for (const value of values) total += typeof value === 'number' ? value : 1;
  return total / values.length || 0;
}

function getFontSizeToFit(text, fontFamily, width, context) {
  context.save();
  context.font = `1px ${fontFamily}`;
  const measuredWidth = context.measureText(text).width;
  context.restore();
  return width / measuredWidth;
}

function isPointInCircle(point = { x: 0, y: 0 }, centerX, centerY, radius) {
  return (point.x - centerX) ** 2 + (point.y - centerY) ** 2 <= radius ** 2;
}

function translateXYToElement(point = { x: 0, y: 0 }, element = {}, pixelRatio = 1) {
  const rect = element.getBoundingClientRect();
  return {
    x: (point.x - rect.left) * pixelRatio,
    y: (point.y - rect.top) * pixelRatio,
  };
}

function getMouseButtonsPressed(event = {}) {
  return [1, 2, 4, 8, 16].filter(button => event.buttons & button);
}

function getAngle(x1, y1, x2, y2) {
  let angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
  if (angle < 0) angle += 360;
  return angle;
}

function getDistanceBetweenPoints(pointA = { x: 0, y: 0 }, pointB = { x: 0, y: 0 }) {
  return Math.hypot(pointB.x - pointA.x, pointB.y - pointA.y);
}

function addAngle(angle = 0, delta = 0) {
  let result = (angle + delta) % 360;
  if (result < 0) result += 360;
  if (result === 360) result = 0;
  return result;
}

function diffAngle(startAngle = 0, endAngle = 0) {
  return 360 - addAngle(startAngle, 360 - endAngle);
}

function calcWheelRotationForTargetAngle(currentRotation = 0, targetAngle = 0, direction = 1) {
  let delta = fixFloat((currentRotation % 360 + targetAngle) % 360);
  delta = (direction === -1 ? 360 - delta : 360 + delta) % 360;
  return currentRotation + delta * direction;
}

function isObject(value) {
  return typeof value === 'object' && !Array.isArray(value) && value !== null;
}

function isNumber(value) {
  return typeof value === 'number' && !Number.isNaN(value);
}

function setProp({ val, isValid, errorMessage, defaultValue, action = null }) {
  if (isValid) return action ? action() : val;
  if (val === undefined) return defaultValue;
  throw new Error(errorMessage);
}

function fixFloat(value = 0) {
  return Number(value.toFixed(14));
}

function easeSinOut(value) {
  return Math.sin(value * Math.PI / 2);
}

function getResizeObserver(element = {}, handler = () => {}) {
  if (window.ResizeObserver) {
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) handler(entry);
    });
    observer.observe(element);
    return { stop: () => observer.disconnect() };
  }

  window.addEventListener('resize', handler);
  return { stop: () => window.removeEventListener('resize', handler) };
}

function register(wheel = {}) {
  registerPointerEvents(wheel);
  wheel._handler_onResize = getResizeObserver(wheel._canvasContainer, ({ redraw = true } = {}) => {
    wheel.resize();
    if (redraw) wheel.draw(performance.now());
  });

  const refreshDevicePixelRatioListener = () => {
    wheel._mediaQueryList = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
    wheel._mediaQueryList.addEventListener('change', wheel._handler_onDevicePixelRatioChange, { once: true });
  };
  wheel._handler_onDevicePixelRatioChange = () => {
    wheel.resize();
    refreshDevicePixelRatioListener();
  };
  refreshDevicePixelRatioListener();
}

function unregister(wheel = {}) {
  const canvas = wheel.canvas;
  if ('PointerEvent' in window) {
    canvas.removeEventListener('pointerdown', wheel._handler_onPointerDown);
    canvas.removeEventListener('pointermove', wheel._handler_onPointerMoveRefreshCursor);
  } else {
    canvas.removeEventListener('touchstart', wheel._handler_onTouchStart);
    canvas.removeEventListener('mousedown', wheel._handler_onMouseDown);
    canvas.removeEventListener('mousemove', wheel._handler_onMouseMoveRefreshCursor);
  }
  wheel._handler_onResize.stop();
  wheel._mediaQueryList.removeEventListener('change', wheel._handler_onDevicePixelRatioChange);
}

function registerPointerEvents(wheel = {}) {
  const canvas = wheel.canvas;
  const pointFromEvent = event => ({ x: event.clientX, y: event.clientY });

  wheel._handler_onPointerMoveRefreshCursor = event => {
    wheel._isCursorOverWheel = wheel.wheelHitTest(pointFromEvent(event));
    wheel.refreshCursor();
  };

  wheel._handler_onPointerDown = event => {
    const point = pointFromEvent(event);
    if (!wheel.isInteractive || !wheel.wheelHitTest(point)) return;
    event.preventDefault();
    wheel.dragStart(point);
    canvas.setPointerCapture(event.pointerId);

    const move = moveEvent => {
      moveEvent.preventDefault();
      wheel.dragMove(pointFromEvent(moveEvent));
    };
    const end = endEvent => {
      endEvent.preventDefault();
      canvas.releasePointerCapture(endEvent.pointerId);
      canvas.removeEventListener('pointermove', move);
      canvas.removeEventListener('pointerup', end);
      canvas.removeEventListener('pointercancel', end);
      canvas.removeEventListener('pointerleave', end);
      wheel.dragEnd();
    };
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);
    canvas.addEventListener('pointerleave', end);
  };

  wheel._handler_onMouseMoveRefreshCursor = event => {
    wheel._isCursorOverWheel = wheel.wheelHitTest(pointFromEvent(event));
    wheel.refreshCursor();
  };
  wheel._handler_onMouseDown = event => {
    const point = pointFromEvent(event);
    if (!wheel.isInteractive || !wheel.wheelHitTest(point)) return;
    wheel.dragStart(point);
    const move = moveEvent => {
      moveEvent.preventDefault();
      wheel.dragMove(pointFromEvent(moveEvent));
    };
    const end = endEvent => {
      endEvent.preventDefault();
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', end);
      wheel.dragEnd();
    };
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', end);
  };

  wheel._handler_onTouchStart = event => {
    const touch = event.targetTouches[0];
    const point = pointFromEvent(touch);
    if (!wheel.isInteractive || !wheel.wheelHitTest(point)) return;
    event.preventDefault();
    wheel.dragStart(point);
    const move = moveEvent => {
      moveEvent.preventDefault();
      wheel.dragMove(pointFromEvent(moveEvent.targetTouches[0]));
    };
    const end = endEvent => {
      endEvent.preventDefault();
      canvas.removeEventListener('touchmove', move);
      canvas.removeEventListener('touchend', end);
      canvas.removeEventListener('touchcancel', end);
      wheel.dragEnd();
    };
    canvas.addEventListener('touchmove', move);
    canvas.addEventListener('touchend', end);
    canvas.addEventListener('touchcancel', end);
  };

  if ('PointerEvent' in window) {
    canvas.addEventListener('pointerdown', wheel._handler_onPointerDown);
    canvas.addEventListener('pointermove', wheel._handler_onPointerMoveRefreshCursor);
  } else {
    canvas.addEventListener('touchstart', wheel._handler_onTouchStart);
    canvas.addEventListener('mousedown', wheel._handler_onMouseDown);
    canvas.addEventListener('mousemove', wheel._handler_onMouseMoveRefreshCursor);
  }
}

class Item {
  constructor(wheel, props = {}) {
    if (!isObject(wheel)) throw new Error('wheel must be an instance of Wheel');
    if (!isObject(props) && props !== null) throw new Error('props must be an Object or null');
    this._wheel = wheel;
    for (const key of Object.keys(Defaults.item)) this[`_${key}`] = Defaults.item[key];
    this.init(props || Defaults.item);
  }

  init(props = {}) {
    for (const key of Object.keys(Defaults.item)) this[key] = props[key];
  }

  _set(name, value, isValid) {
    this[`_${name}`] = isValid ? value : Defaults.item[name];
    this._wheel.refresh();
  }

  get backgroundColor() { return this._backgroundColor; }
  set backgroundColor(value) { this._set('backgroundColor', value, typeof value === 'string'); }
  get image() { return this._image; }
  set image(value) { this._set('image', value, value instanceof HTMLImageElement || value === null); }
  get imageOpacity() { return this._imageOpacity; }
  set imageOpacity(value) { this._set('imageOpacity', value, typeof value === 'number'); }
  get imageRadius() { return this._imageRadius; }
  set imageRadius(value) { this._set('imageRadius', value, typeof value === 'number'); }
  get imageRotation() { return this._imageRotation; }
  set imageRotation(value) { this._set('imageRotation', value, typeof value === 'number'); }
  get imageScale() { return this._imageScale; }
  set imageScale(value) { this._set('imageScale', value, typeof value === 'number'); }
  get label() { return this._label; }
  set label(value) { this._set('label', value, typeof value === 'string'); }
  get labelColor() { return this._labelColor; }
  set labelColor(value) { this._set('labelColor', value, typeof value === 'string'); }
  get value() { return this._value; }
  set value(value) { this._value = value === undefined ? Defaults.item.value : value; }
  get weight() { return this._weight; }
  set weight(value) { this._set('weight', value, typeof value === 'number'); }

  getIndex() {
    const index = this._wheel.items.findIndex(item => item === this);
    if (index === -1) throw new Error('Item not found in parent Wheel');
    return index;
  }

  getCenterAngle() {
    const angles = this._wheel.getItemAngles()[this.getIndex()];
    return angles.start + (angles.end - angles.start) / 2;
  }

  getStartAngle() {
    return this._wheel.getItemAngles()[this.getIndex()].start;
  }

  getEndAngle() {
    return this._wheel.getItemAngles()[this.getIndex()].end;
  }

  getRandomAngle() {
    return getRandomFloat(this.getStartAngle(), this.getEndAngle());
  }
}

class Wheel {
  constructor(container, props = {}) {
    if (!(container instanceof Element)) throw new Error('container must be an instance of Element');
    if (!isObject(props) && props !== null) throw new Error('props must be an Object or null');

    this._frameRequestId = null;
    this._rotationSpeed = 0;
    this._rotationDirection = 1;
    this._spinToTimeEnd = null;
    this._lastSpinFrameTime = null;
    this._isCursorOverWheel = false;
    this._dragEvents = [];
    this._currentIndex = -1;

    this.add(container);
    for (const key of Object.keys(Defaults.wheel)) this[`_${key}`] = Defaults.wheel[key];
    this.init(props || Defaults.wheel);
  }

  init(props = {}) {
    this._isInitialising = true;
    for (const key of Object.keys(Defaults.wheel)) this[key] = props[key];
  }

  add(container) {
    this._canvasContainer = container;
    this.canvas = document.createElement('canvas');
    this.canvas.style.display = 'block';
    this._context = this.canvas.getContext('2d');
    this._canvasContainer.append(this.canvas);
    register(this);
    if (this._isInitialising === false) this.resize();
  }

  remove() {
    if (this.canvas === null) return;
    if (this._frameRequestId !== null) window.cancelAnimationFrame(this._frameRequestId);
    unregister(this);
    this._canvasContainer.removeChild(this.canvas);
    this._canvasContainer = null;
    this.canvas = null;
    this._context = null;
  }

  resize() {
    if (this.canvas === null) return;
    const cssWidth = this._canvasContainer.clientWidth;
    const cssHeight = this._canvasContainer.clientHeight;
    const pixelRatio = this.getActualPixelRatio();
    this.canvas.style.width = `${cssWidth}px`;
    this.canvas.style.height = `${cssHeight}px`;
    this.canvas.width = cssWidth * pixelRatio;
    this.canvas.height = cssHeight * pixelRatio;

    const width = this.canvas.width;
    const height = this.canvas.height;
    const shortestSide = Math.min(width, height);
    const available = {
      w: shortestSide - shortestSide * this._offset.x,
      h: shortestSide - shortestSide * this._offset.y,
    };
    const scale = Math.min(width / available.w, height / available.h);
    this._size = Math.max(available.w * scale, available.h * scale);
    this._center = {
      x: width / 2 + width * this._offset.x,
      y: height / 2 + height * this._offset.y,
    };
    this._actualRadius = this._size / 2 * this.radius;
    this._itemLabelFontSize = this.itemLabelFontSizeMax * (this._size / BASE_CANVAS_SIZE);
    this._labelMaxWidth = this._actualRadius * (this.itemLabelRadius - this.itemLabelRadiusMax);
    if (this.itemLabelAlign === AlignText.center) this._labelMaxWidth *= 2;
    for (const item of this._items) {
      this._itemLabelFontSize = Math.min(
        this._itemLabelFontSize,
        getFontSizeToFit(item.label, this.itemLabelFont, this._labelMaxWidth, this._context),
      );
    }
    this.refresh();
  }

  draw(now = 0) {
    this._frameRequestId = null;
    if (this._context === null || this.canvas === null) return;
    const context = this._context;
    context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.animateRotation(now);

    const angles = this.getItemAngles(this._rotation);
    const borderWidth = this.getScaledNumber(this._borderWidth);
    context.textBaseline = 'middle';
    context.textAlign = this.itemLabelAlign;
    context.font = `${this._itemLabelFontSize}px ${this.itemLabelFont}`;

    for (const [index, anglesForItem] of angles.entries()) {
      const path = new Path2D();
      path.moveTo(this._center.x, this._center.y);
      path.arc(
        this._center.x,
        this._center.y,
        this._actualRadius - borderWidth / 2,
        degRad(anglesForItem.start + ARC_ADJUST),
        degRad(anglesForItem.end + ARC_ADJUST),
      );
      this._items[index].path = path;
    }

    this.drawItemBackgrounds(context, angles);
    this.drawItemImages(context, angles);
    this.drawItemLines(context, angles);
    this.drawItemLabels(context, angles);
    this.drawBorder(context);
    this.drawImage(context, this._image, false);
    this.drawImage(context, this._overlayImage, true);
    this.drawDebugPointerLine(context);
    this._isInitialising = false;
  }

  drawItemBackgrounds(context, angles = []) {
    for (const [index] of angles.entries()) {
      const item = this._items[index];
      context.fillStyle = item.backgroundColor ?? this._itemBackgroundColors[index % this._itemBackgroundColors.length];
      context.fill(item.path);
    }
  }

  drawItemImages(context, angles = []) {
    for (const [index, itemAngles] of angles.entries()) {
      const item = this._items[index];
      if (item.image === null) continue;
      context.save();
      context.clip(item.path);
      const centerAngle = itemAngles.start + (itemAngles.end - itemAngles.start) / 2;
      const radius = this._actualRadius * item.imageRadius;
      context.translate(
        this._center.x + Math.cos(degRad(centerAngle + ARC_ADJUST)) * radius,
        this._center.y + Math.sin(degRad(centerAngle + ARC_ADJUST)) * radius,
      );
      context.rotate(degRad(centerAngle + item.imageRotation));
      context.globalAlpha = item.imageOpacity;
      const width = this._size / BASE_CANVAS_SIZE * item.image.width * item.imageScale;
      const height = this._size / BASE_CANVAS_SIZE * item.image.height * item.imageScale;
      context.drawImage(item.image, -width / 2, -height / 2, width, height);
      context.restore();
    }
  }

  drawImage(context, image, isOverlay = false) {
    if (image === null) return;
    context.translate(this._center.x, this._center.y);
    if (!isOverlay) context.rotate(degRad(this._rotation));
    const size = isOverlay ? this._size : this._size * this.radius;
    context.drawImage(image, -size / 2, -size / 2, size, size);
    context.resetTransform();
  }

  drawDebugPointerLine(context) {
    if (!this.debug) return;
    context.translate(this._center.x, this._center.y);
    context.rotate(degRad(this._pointerAngle + ARC_ADJUST));
    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(this._actualRadius, 0);
    context.strokeStyle = Debugging.pointerLineColor;
    context.lineWidth = this.getScaledNumber(1);
    context.stroke();
    context.resetTransform();
  }

  drawBorder(context) {
    if (this._borderWidth <= 0) return;
    const width = this.getScaledNumber(this._borderWidth);
    context.beginPath();
    context.strokeStyle = this._borderColor || 'transparent';
    context.lineWidth = width;
    context.arc(this._center.x, this._center.y, this._actualRadius - width / 2, 0, 2 * Math.PI);
    context.stroke();
    if (this.debug) {
      context.strokeStyle = Debugging.labelRadiusColor;
      context.lineWidth = this.getScaledNumber(1);
      for (const radius of [this.itemLabelRadius, this.itemLabelRadiusMax]) {
        context.beginPath();
        context.arc(this._center.x, this._center.y, this._actualRadius * radius, 0, 2 * Math.PI);
        context.stroke();
      }
    }
  }

  drawItemLines(context, angles = []) {
    if (this._lineWidth <= 0) return;
    context.strokeStyle = this._lineColor;
    context.lineWidth = this.getScaledNumber(this._lineWidth);
    const lineRadius = this._actualRadius - this.getScaledNumber(this._borderWidth);
    for (const itemAngles of angles) {
      const angle = degRad(itemAngles.start + ARC_ADJUST);
      context.beginPath();
      context.moveTo(this._center.x, this._center.y);
      context.lineTo(
        this._center.x + Math.cos(angle) * lineRadius,
        this._center.y + Math.sin(angle) * lineRadius,
      );
      context.stroke();
    }
  }

  drawItemLabels(context, angles = []) {
    for (const [index, itemAngles] of angles.entries()) {
      const item = this._items[index];
      const color = item.labelColor || this._itemLabelColors[index % this._itemLabelColors.length] || 'transparent';
      if (item.label.trim() === '' || color === 'transparent') continue;
      const angle = itemAngles.start + (itemAngles.end - itemAngles.start) / 2;
      const radius = this._actualRadius * this.itemLabelRadius;
      const x = this._center.x + Math.cos(degRad(angle + ARC_ADJUST)) * radius;
      const y = this._center.y + Math.sin(degRad(angle + ARC_ADJUST)) * radius;
      context.save();
      context.clip(item.path);
      context.translate(x, y);
      context.rotate(degRad(angle + ARC_ADJUST));
      context.rotate(degRad(this.itemLabelRotation));
      context.fillStyle = color;
      const baselineOffset = this._itemLabelFontSize * -this.itemLabelBaselineOffset;
      if (this.itemLabelStrokeWidth > 0) {
        context.strokeStyle = this.itemLabelStrokeColor;
        context.lineWidth = this.getScaledNumber(this.itemLabelStrokeWidth * 2);
        context.lineJoin = 'round';
        context.strokeText(item.label, 0, baselineOffset);
      }
      context.fillText(item.label, 0, baselineOffset);
      context.restore();
    }
  }

  drawDebugDragPoints(context) {
    if (!this.debug) return;
    const radius = this.getScaledNumber(4);
    const lineWidth = this.getScaledNumber(1);
    for (const [index, event] of this._dragEvents.entries()) {
      const lightness = 100 - index / Math.max(1, this._dragEvents.length) * 50;
      context.beginPath();
      context.arc(event.x, event.y, radius, 0, 2 * Math.PI);
      context.fillStyle = `hsl(${Debugging.dragPointHue},100%,${lightness}%)`;
      context.strokeStyle = '#000';
      context.lineWidth = lineWidth;
      context.fill();
      context.stroke();
    }
  }

  animateRotation(now = 0) {
    if (this._spinToTimeEnd !== null) {
      if (now >= this._spinToTimeEnd) {
        this.rotation = this._spinToEndRotation;
        this._spinToTimeEnd = null;
        this.raiseEvent_onRest();
        return;
      }
      const duration = this._spinToTimeEnd - this._spinToTimeStart;
      const progress = Math.max(0, (now - this._spinToTimeStart) / duration);
      const distance = this._spinToEndRotation - this._spinToStartRotation;
      this.rotation = this._spinToStartRotation + distance * this._spinToEasingFunction(progress);
      this.refresh();
      return;
    }

    if (this._lastSpinFrameTime !== null) {
      const elapsed = now - this._lastSpinFrameTime;
      if (elapsed > 0) {
        this.rotation += elapsed / 1000 * this._rotationSpeed % 360;
        this._rotationSpeed = this.getRotationSpeedPlusDrag(elapsed);
        if (this._rotationSpeed === 0) {
          this.raiseEvent_onRest();
          this._lastSpinFrameTime = null;
        } else {
          this._lastSpinFrameTime = now;
        }
      }
      this.refresh();
    }
  }

  getRotationSpeedPlusDrag(elapsed = 0) {
    const next = this._rotationSpeed + this.rotationResistance * (elapsed / 1000) * this._rotationDirection;
    if ((this._rotationDirection === 1 && next < 0) || (this._rotationDirection === -1 && next >= 0)) return 0;
    return next;
  }

  spin(rotationSpeed = 0) {
    if (!isNumber(rotationSpeed)) throw new Error('rotationSpeed must be a number');
    this._dragEvents = [];
    this.beginSpin(rotationSpeed, 'spin');
  }

  spinTo(rotation = 0, duration = 0, easing = null) {
    if (!isNumber(rotation)) throw new Error('Error: rotation must be a number');
    if (!isNumber(duration)) throw new Error('Error: duration must be a number');
    this.stop();
    this._dragEvents = [];
    this.animate(rotation, duration, easing);
    this.raiseEvent_onSpin({ method: 'spinto', targetRotation: rotation, duration });
  }

  spinToItem(itemIndex = 0, duration = 0, spinToCenter = true, revolutions = 1, direction = 1, easing = null) {
    this.stop();
    this._dragEvents = [];
    const item = this.items[itemIndex];
    const targetAngle = spinToCenter ? item.getCenterAngle() : item.getRandomAngle();
    let targetRotation = calcWheelRotationForTargetAngle(this.rotation, targetAngle - this._pointerAngle, direction);
    targetRotation += direction * 360 * revolutions;
    this.animate(targetRotation, duration, easing);
    this.raiseEvent_onSpin({ method: 'spintoitem', targetItemIndex: itemIndex, targetRotation, duration });
  }

  animate(targetRotation, duration, easing) {
    this._spinToStartRotation = this.rotation;
    this._spinToEndRotation = targetRotation;
    this._spinToTimeStart = performance.now();
    this._spinToTimeEnd = this._spinToTimeStart + duration;
    this._spinToEasingFunction = easing || easeSinOut;
    this.refresh();
  }

  stop() {
    this._spinToTimeEnd = null;
    this._rotationSpeed = 0;
    this._lastSpinFrameTime = null;
  }

  getScaledNumber(value) {
    return value / BASE_CANVAS_SIZE * this._size;
  }

  getActualPixelRatio() {
    return this._pixelRatio || window.devicePixelRatio || 1;
  }

  wheelHitTest(point = DEFAULT_OFFSET) {
    if (this.canvas === null) return false;
    const translated = translateXYToElement(point, this.canvas, this.getActualPixelRatio());
    return isPointInCircle(translated, this._center.x, this._center.y, this._actualRadius);
  }

  refreshCursor() {
    if (this.canvas === null) return;
    this.canvas.style.cursor = this.isInteractive && this._isCursorOverWheel ? 'grab' : '';
    if (this.isDragging) this.canvas.style.cursor = 'grabbing';
  }

  getAngleFromCenter(point = DEFAULT_OFFSET) {
    return (getAngle(this._center.x, this._center.y, point.x, point.y) + 90) % 360;
  }

  getCurrentIndex() {
    return this._currentIndex;
  }

  refreshCurrentIndex(angles = []) {
    if (this._items.length === 0) this._currentIndex = -1;
    for (const [index, itemAngles] of angles.entries()) {
      if (!isAngleBetween(this._pointerAngle, itemAngles.start % 360, itemAngles.end % 360)) continue;
      if (this._currentIndex === index) break;
      this._currentIndex = index;
      if (!this._isInitialising) this.raiseEvent_onCurrentIndexChange();
      break;
    }
  }

  getItemAngles(startAngle = 0) {
    let totalWeight = 0;
    for (const item of this.items) totalWeight += item.weight;
    const degreesPerWeight = 360 / totalWeight;
    let start = startAngle;
    const angles = [];
    for (const item of this._items) {
      const arc = item.weight * degreesPerWeight;
      angles.push({ start, end: start + arc });
      start += arc;
    }
    if (this._items.length > 0) angles[angles.length - 1].end = angles[0].start + 360;
    return angles;
  }

  refresh() {
    if (this._frameRequestId === null) {
      this._frameRequestId = window.requestAnimationFrame(now => this.draw(now));
    }
  }

  limitSpeed(speed = 0, max = 0) {
    return Math.max(Math.min(speed, max), -max);
  }

  beginSpin(rotationSpeed = 0, method = '') {
    this._rotationSpeed = this.limitSpeed(rotationSpeed, this.rotationSpeedMax);
    this._lastSpinFrameTime = performance.now();
    this._rotationDirection = this._rotationSpeed >= 0 ? 1 : -1;
    this.raiseEvent_onSpin({ method, rotationSpeed: this._rotationSpeed });
    this.refresh();
  }

  refreshAriaLabel() {
    if (this.canvas === null) return;
    this.canvas.setAttribute('role', 'img');
    this.canvas.setAttribute('aria-label', this.items.map(item => item.label).filter(Boolean).join(', '));
  }

  dragStart(point = DEFAULT_OFFSET) {
    if (this.canvas === null) return;
    const translated = translateXYToElement(point, this.canvas, this.getActualPixelRatio());
    this.isDragging = true;
    this.stop();
    this._dragEvents = [{ distance: 0, x: translated.x, y: translated.y, now: performance.now() }];
    this.refreshCursor();
  }

  dragMove(point = DEFAULT_OFFSET) {
    if (this.canvas === null) return;
    const translated = translateXYToElement(point, this.canvas, this.getActualPixelRatio());
    const angle = this.getAngleFromCenter(translated);
    const previous = this._dragEvents[0];
    const previousAngle = this.getAngleFromCenter(previous);
    const distance = diffAngle(previousAngle, angle);
    this._dragEvents.unshift({ distance, x: translated.x, y: translated.y, now: performance.now() });
    if (this.debug && this._dragEvents.length >= 40) this._dragEvents.pop();
    this.rotation += distance;
  }

  dragEnd() {
    this.isDragging = false;
    let distance = 0;
    const now = performance.now();
    for (const [index, event] of this._dragEvents.entries()) {
      if (!this.isDragEventTooOld(now, event)) {
        distance += event.distance;
        continue;
      }
      this._dragEvents.length = index;
      if (this.debug) this.refresh();
      break;
    }
    this.refreshCursor();
    if (distance === 0) return;
    this.beginSpin(distance * (1000 / DRAG_CAPTURE_PERIOD), 'interact');
  }

  isDragEventTooOld(now = 0, event = {}) {
    return now - event.now > DRAG_CAPTURE_PERIOD;
  }

  raiseEvent_onCurrentIndexChange(extra = {}) {
    this.onCurrentIndexChange?.({ type: 'currentIndexChange', currentIndex: this._currentIndex, ...extra });
  }

  raiseEvent_onRest(extra = {}) {
    this.onRest?.({ type: 'rest', currentIndex: this._currentIndex, rotation: this._rotation, ...extra });
  }

  raiseEvent_onSpin(extra = {}) {
    this.onSpin?.({ type: 'spin', ...extra });
  }

  _set(name, value, isValid, message, refresh = 'refresh', action = null) {
    this[`_${name}`] = setProp({ val: value, isValid, errorMessage: message, defaultValue: Defaults.wheel[name], action });
    if (refresh) this[refresh]();
  }

  get borderColor() { return this._borderColor; }
  set borderColor(value) { this._set('borderColor', value, typeof value === 'string', 'Wheel.borderColor must be a string'); }
  get borderWidth() { return this._borderWidth; }
  set borderWidth(value) { this._set('borderWidth', value, isNumber(value), 'Wheel.borderWidth must be a number'); }
  get debug() { return this._debug; }
  set debug(value) { this._set('debug', value, typeof value === 'boolean', 'Wheel.debug must be a boolean'); }
  get image() { return this._image; }
  set image(value) { this._set('image', value, value instanceof HTMLImageElement || value === null, 'Wheel.image must be a HTMLImageElement or null'); }
  get isInteractive() { return this._isInteractive; }
  set isInteractive(value) { this._set('isInteractive', value, typeof value === 'boolean', 'Wheel.isInteractive must be a boolean', 'refreshCursor'); }
  get itemBackgroundColors() { return this._itemBackgroundColors; }
  set itemBackgroundColors(value) { this._set('itemBackgroundColors', value, Array.isArray(value), 'Wheel.itemBackgroundColors must be an array'); }
  get itemLabelAlign() { return this._itemLabelAlign; }
  set itemLabelAlign(value) { this._set('itemLabelAlign', value, Object.values(AlignText).includes(value), 'Wheel.itemLabelAlign must be one of Constants.AlignText', 'resize'); }
  get itemLabelBaselineOffset() { return this._itemLabelBaselineOffset; }
  set itemLabelBaselineOffset(value) { this._set('itemLabelBaselineOffset', value, isNumber(value), 'Wheel.itemLabelBaselineOffset must be a number', 'resize'); }
  get itemLabelColors() { return this._itemLabelColors; }
  set itemLabelColors(value) { this._set('itemLabelColors', value, Array.isArray(value), 'Wheel.itemLabelColors must be an array'); }
  get itemLabelFont() { return this._itemLabelFont; }
  set itemLabelFont(value) { this._set('itemLabelFont', value, typeof value === 'string', 'Wheel.itemLabelFont must be a string', 'resize'); }
  get itemLabelFontSizeMax() { return this._itemLabelFontSizeMax; }
  set itemLabelFontSizeMax(value) { this._set('itemLabelFontSizeMax', value, isNumber(value), 'Wheel.itemLabelFontSizeMax must be a number', 'resize'); }
  get itemLabelRadius() { return this._itemLabelRadius; }
  set itemLabelRadius(value) { this._set('itemLabelRadius', value, isNumber(value), 'Wheel.itemLabelRadius must be a number', 'resize'); }
  get itemLabelRadiusMax() { return this._itemLabelRadiusMax; }
  set itemLabelRadiusMax(value) { this._set('itemLabelRadiusMax', value, isNumber(value), 'Wheel.itemLabelRadiusMax must be a number', 'resize'); }
  get itemLabelRotation() { return this._itemLabelRotation; }
  set itemLabelRotation(value) { this._set('itemLabelRotation', value, isNumber(value), 'Wheel.itemLabelRotation must be a number'); }
  get itemLabelStrokeColor() { return this._itemLabelStrokeColor; }
  set itemLabelStrokeColor(value) { this._set('itemLabelStrokeColor', value, typeof value === 'string', 'Wheel.itemLabelStrokeColor must be a string'); }
  get itemLabelStrokeWidth() { return this._itemLabelStrokeWidth; }
  set itemLabelStrokeWidth(value) { this._set('itemLabelStrokeWidth', value, isNumber(value), 'Wheel.itemLabelStrokeWidth must be a number'); }
  get items() { return this._items; }
  set items(value) {
    const items = setProp({
      val: value,
      isValid: Array.isArray(value),
      errorMessage: 'Wheel.items must be an array of Items',
      defaultValue: Defaults.wheel.items,
      action: () => value.map(item => new Item(this, item)),
    });
    this._items = items;
    this.refreshAriaLabel();
    this.refreshCurrentIndex(this.getItemAngles(this._rotation));
    this.resize();
  }
  get lineColor() { return this._lineColor; }
  set lineColor(value) { this._set('lineColor', value, typeof value === 'string', 'Wheel.lineColor must be a string'); }
  get lineWidth() { return this._lineWidth; }
  set lineWidth(value) { this._set('lineWidth', value, isNumber(value), 'Wheel.lineWidth must be a number'); }
  get offset() { return this._offset; }
  set offset(value) { this._set('offset', value, isObject(value), 'Wheel.offset must be an object', 'resize'); }
  get onCurrentIndexChange() { return this._onCurrentIndexChange; }
  set onCurrentIndexChange(value) { this._set('onCurrentIndexChange', value, typeof value === 'function' || value === null, 'Wheel.onCurrentIndexChange must be a function or null', null); }
  get onRest() { return this._onRest; }
  set onRest(value) { this._set('onRest', value, typeof value === 'function' || value === null, 'Wheel.onRest must be a function or null', null); }
  get onSpin() { return this._onSpin; }
  set onSpin(value) { this._set('onSpin', value, typeof value === 'function' || value === null, 'Wheel.onSpin must be a function or null', null); }
  get overlayImage() { return this._overlayImage; }
  set overlayImage(value) { this._set('overlayImage', value, value instanceof HTMLImageElement || value === null, 'Wheel.overlayImage must be a HTMLImageElement or null'); }
  get pixelRatio() { return this._pixelRatio; }
  set pixelRatio(value) { this._dragEvents = []; this._set('pixelRatio', value, isNumber(value), 'Wheel.pixelRatio must be a number', 'resize'); }
  get pointerAngle() { return this._pointerAngle; }
  set pointerAngle(value) { this._set('pointerAngle', value, isNumber(value) && value >= 0, 'Wheel.pointerAngle must be a number between 0 and 360', this.debug ? 'refresh' : null, () => value % 360); }
  get radius() { return this._radius; }
  set radius(value) { this._set('radius', value, isNumber(value), 'Wheel.radius must be a number', 'resize'); }
  get rotation() { return this._rotation; }
  set rotation(value) {
    this._set('rotation', value, isNumber(value), 'Wheel.rotation must be a number', null);
    this.refreshCurrentIndex(this.getItemAngles(this._rotation));
    this.refresh();
  }
  get rotationResistance() { return this._rotationResistance; }
  set rotationResistance(value) { this._set('rotationResistance', value, isNumber(value), 'Wheel.rotationResistance must be a number', null); }
  get rotationSpeed() { return this._rotationSpeed; }
  get rotationSpeedMax() { return this._rotationSpeedMax; }
  set rotationSpeedMax(value) { this._set('rotationSpeedMax', value, isNumber(value) && value >= 0, 'Wheel.rotationSpeedMax must be a number >= 0', null); }
}

export { Wheel };
