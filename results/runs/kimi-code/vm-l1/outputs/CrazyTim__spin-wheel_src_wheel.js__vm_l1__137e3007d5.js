const arcAdjust = -90;
const baseCanvasSize = 500;
const dragCapturePeriod = 250;

const AlignText = Object.freeze({ left: "left", center: "center", right: "right" });
const Defaults = Object.freeze({
  wheel: {
    borderColor: "#000",
    borderWidth: 1,
    debug: false,
    image: null,
    isInteractive: true,
    itemBackgroundColors: ["#fff"],
    itemLabelAlign: AlignText.right,
    itemLabelBaselineOffset: 0,
    itemLabelColors: ["#000"],
    itemLabelFont: "sans-serif",
    itemLabelFontSizeMax: baseCanvasSize,
    itemLabelRadius: 0.85,
    itemLabelRadiusMax: 0.2,
    itemLabelRotation: 0,
    itemLabelStrokeColor: "#fff",
    itemLabelStrokeWidth: 0,
    items: [],
    lineColor: "#000",
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
    pointerAngle: 0,
  },
  item: {
    backgroundColor: null,
    image: null,
    imageOpacity: 1,
    imageRadius: 0.5,
    imageRotation: 0,
    imageScale: 1,
    label: "",
    labelColor: null,
    value: null,
    weight: 1,
  },
});
const Debugging = Object.freeze({
  pointerLineColor: "#ff00ff",
  labelBoundingBoxColor: "#ff00ff",
  labelRadiusColor: "#00ff00",
  dragPointHue: 300,
});

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min, max, decimalPlaces = 14) {
  const value = Math.random() * (max - min) + min;
  return Number.parseFloat(value.toFixed(decimalPlaces));
}

function degRad(degrees) {
  return degrees * Math.PI / 180;
}

function addAngle(angle, amount) {
  return ((angle + amount) % 360 + 360) % 360;
}

function diffAngle(angleA, angleB) {
  const difference = addAngle(angleB - angleA, 0);
  return difference > 180 ? difference - 360 : difference;
}

function isAngleBetween(angle, start, end) {
  const range = addAngle(end - start, 0);
  return addAngle(angle - start, 0) <= range;
}

function aveArray(values) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function getFontSizeToFit(context, text, width, maximum) {
  let size = maximum;
  while (size > 0) {
    context.font = `${size}px ${context.font.split(" ").at(-1)}`;
    if (context.measureText(text).width <= width) return size;
    size -= 1;
  }
  return 0;
}

function isPointInCircle(point, radius, center = { x: 0, y: 0 }) {
  return getDistanceBetweenPoints(point, center) < radius;
}

function translateXYToElement(x, y, element) {
  const rect = element.getBoundingClientRect();
  return { x: x - rect.left, y: y - rect.top };
}

function getMouseButtonsPressed(event) {
  return [1, 2, 4].filter(button => (event.buttons & button) !== 0);
}

function getAngle(x1, y1, x2, y2) {
  return addAngle(Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI, 0);
}

function getDistanceBetweenPoints(pointA, pointB) {
  return Math.hypot(pointB.x - pointA.x, pointB.y - pointA.y);
}

function calcWheelRotationForTargetAngle(targetAngle, currentRotation, direction = 0) {
  if (direction === 1) return fixFloat(360 - currentRotation);
  return fixFloat(targetAngle + (targetAngle + currentRotation) * direction);
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isNumber(value) {
  return typeof value === "number" && !Number.isNaN(value);
}

function fixFloat(value) {
  return Number.parseFloat(value.toFixed(9));
}

function easeSinOut(value) {
  return Math.sin(value * Math.PI / 2);
}

function getResizeObserver(callback) {
  return typeof ResizeObserver === "undefined" ? null : new ResizeObserver(callback);
}

function setProp(target, property, value, fallback, onChange) {
  const next = value === undefined ? fallback : value;
  if (target[property] !== next) {
    target[property] = next;
    onChange?.();
  }
  return target[property];
}

function register(target, type, listener, options) {
  target?.addEventListener?.(type, listener, options);
}

function unregister(target, type, listener, options) {
  target?.removeEventListener?.(type, listener, options);
}

function registerPointerEvents(wheel) {
  const canvas = wheel.canvas;
  register(canvas, "pointerdown", wheel.dragStart);
  register(canvas, "pointermove", wheel.dragMove);
  register(canvas, "pointerup", wheel.dragEnd);
  register(canvas, "pointercancel", wheel.dragEnd);
  register(canvas, "pointerleave", wheel.dragEnd);
}

class Item {
  constructor(properties = {}) {
    this._wheel = null;
    this.init(properties);
  }

  init(properties = {}) {
    for (const [name, fallback] of Object.entries(Defaults.item)) {
      this[`_${name}`] = properties[name] ?? fallback;
    }
    return this;
  }

  _set(name, value) {
    this[`_${name}`] = value;
    this._wheel?.refresh();
  }

  get backgroundColor() { return this._backgroundColor; }
  set backgroundColor(value) { this._set("backgroundColor", value); }
  get image() { return this._image; }
  set image(value) { this._set("image", value); }
  get imageOpacity() { return this._imageOpacity; }
  set imageOpacity(value) { this._set("imageOpacity", value); }
  get imageRadius() { return this._imageRadius; }
  set imageRadius(value) { this._set("imageRadius", value); }
  get imageRotation() { return this._imageRotation; }
  set imageRotation(value) { this._set("imageRotation", value); }
  get imageScale() { return this._imageScale; }
  set imageScale(value) { this._set("imageScale", value); }
  get label() { return this._label; }
  set label(value) { this._set("label", value); }
  get labelColor() { return this._labelColor; }
  set labelColor(value) { this._set("labelColor", value); }
  get value() { return this._value; }
  set value(value) { this._set("value", value); }
  get weight() { return this._weight; }
  set weight(value) { this._set("weight", value); }

  getIndex() {
    return this._wheel ? this._wheel.items.indexOf(this) : -1;
  }

  getCenterAngle() {
    const angles = this._wheel?.getItemAngles()[this.getIndex()];
    return angles ? addAngle((angles.start + angles.end) / 2, 0) : 0;
  }

  getStartAngle() {
    return this._wheel?.getItemAngles()[this.getIndex()]?.start ?? 0;
  }

  getEndAngle() {
    return this._wheel?.getItemAngles()[this.getIndex()]?.end ?? 0;
  }

  getRandomAngle() {
    return getRandomFloat(this.getStartAngle(), this.getEndAngle());
  }
}

class Wheel {
  constructor(container, properties = {}) {
    if (typeof Element !== "undefined" && !(container instanceof Element)) {
      throw new Error("container must be an instance of Element");
    }
    this.container = container;
    this.canvas = this.container?.tagName === "CANVAS"
      ? this.container
      : typeof document === "undefined" ? null : document.createElement("canvas");
    if (this.container && this.canvas !== this.container) this.container.appendChild(this.canvas);
    this.ctx = this.canvas?.getContext?.("2d") ?? null;
    this._frame = null;
    this._rotationSpeed = 0;
    this._currentIndex = -1;
    this._dragging = false;
    this._dragPoints = [];
    this._lastFrameTime = 0;
    this.dragStart = this.dragStart.bind(this);
    this.dragMove = this.dragMove.bind(this);
    this.dragEnd = this.dragEnd.bind(this);
    this.init(properties);
  }

  init(properties = {}) {
    for (const [name, fallback] of Object.entries(Defaults.wheel)) {
      if (name === "items") continue;
      const value = properties[name] ?? (isObject(fallback) ? { ...fallback } : fallback);
      this[`_${name}`] = value;
    }
    this.items = properties.items ?? Defaults.wheel.items;
    this.resize();
    registerPointerEvents(this);
    this._resizeObserver = getResizeObserver(() => this.resize());
    this._resizeObserver?.observe(this.container ?? this.canvas);
    this.refresh();
    return this;
  }

  add(item) {
    const instance = item instanceof Item ? item : new Item(item);
    instance._wheel = this;
    this._items.push(instance);
    this.refresh();
    return instance;
  }

  remove(itemOrIndex = this._items.length - 1) {
    const index = typeof itemOrIndex === "number" ? itemOrIndex : this._items.indexOf(itemOrIndex);
    if (index < 0 || index >= this._items.length) return null;
    const [item] = this._items.splice(index, 1);
    item._wheel = null;
    this.refresh();
    return item;
  }

  resize() {
    if (!this.canvas) return;
    const bounds = (this.container ?? this.canvas).getBoundingClientRect?.();
    const size = Math.max(1, Math.min(bounds?.width || baseCanvasSize, bounds?.height || bounds?.width || baseCanvasSize));
    const ratio = this.getActualPixelRatio();
    this.canvas.width = size * ratio;
    this.canvas.height = size * ratio;
    this.canvas.style.width = `${size}px`;
    this.canvas.style.height = `${size}px`;
    this._canvasSize = size;
    this.ctx?.setTransform(ratio, 0, 0, ratio, 0, 0);
    this.refresh();
  }

  draw() {
    const context = this.ctx;
    if (!context) return;
    const size = this._canvasSize || baseCanvasSize;
    context.clearRect(0, 0, size, size);
    context.save();
    context.translate(size / 2 + this.offset.x * size / 2, size / 2 + this.offset.y * size / 2);
    context.rotate(degRad(this.rotation + arcAdjust));
    this.drawItemBackgrounds(context);
    this.drawItemImages(context);
    this.drawItemLines(context);
    this.drawItemLabels(context);
    this.drawBorder(context);
    if (this.image) this.drawImage(this.image, context);
    if (this.debug) {
      this.drawDebugPointerLine(context);
      this.drawDebugDragPoints(context);
    }
    context.restore();
    if (this.overlayImage) this.drawImage(this.overlayImage, context);
  }

  drawItemBackgrounds(context) {
    const radius = this.getScaledNumber(this.radius);
    for (const [index, angles] of this.getItemAngles().entries()) {
      context.beginPath();
      context.moveTo(0, 0);
      context.arc(0, 0, radius, degRad(angles.start), degRad(angles.end));
      context.closePath();
      context.fillStyle = this.items[index].backgroundColor ?? this.itemBackgroundColors[index % this.itemBackgroundColors.length];
      context.fill();
    }
  }

  drawItemImages(context) {
    for (const item of this.items) {
      if (!item.image) continue;
      context.save();
      context.rotate(degRad(item.getCenterAngle()));
      context.globalAlpha = item.imageOpacity;
      const size = this.getScaledNumber(item.imageRadius * item.imageScale);
      context.rotate(degRad(item.imageRotation));
      context.drawImage(item.image, this.getScaledNumber(item.imageRadius) - size / 2, -size / 2, size, size);
      context.restore();
    }
  }

  drawImage(image, context = this.ctx) {
    if (!image || !context) return;
    const size = this._canvasSize || baseCanvasSize;
    context.drawImage(image, 0, 0, size, size);
  }

  drawDebugPointerLine(context) {
    context.save();
    context.rotate(degRad(this.pointerAngle - this.rotation - arcAdjust));
    context.strokeStyle = Debugging.pointerLineColor;
    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(this.getScaledNumber(this.radius), 0);
    context.stroke();
    context.restore();
  }

  drawBorder(context) {
    context.beginPath();
    context.arc(0, 0, this.getScaledNumber(this.radius), 0, Math.PI * 2);
    context.strokeStyle = this.borderColor;
    context.lineWidth = this.getScaledNumber(this.borderWidth / baseCanvasSize);
    context.stroke();
  }

  drawItemLines(context) {
    const radius = this.getScaledNumber(this.radius);
    context.strokeStyle = this.lineColor;
    context.lineWidth = this.getScaledNumber(this.lineWidth / baseCanvasSize);
    for (const { start } of this.getItemAngles()) {
      context.beginPath();
      context.moveTo(0, 0);
      context.lineTo(Math.cos(degRad(start)) * radius, Math.sin(degRad(start)) * radius);
      context.stroke();
    }
  }

  drawItemLabels(context) {
    const radius = this.getScaledNumber(this.radius * this.itemLabelRadius);
    for (const [index, item] of this.items.entries()) {
      if (!item.label) continue;
      const angle = item.getCenterAngle();
      context.save();
      context.rotate(degRad(angle + this.itemLabelRotation));
      context.textAlign = this.itemLabelAlign;
      context.textBaseline = "middle";
      context.fillStyle = item.labelColor ?? this.itemLabelColors[index % this.itemLabelColors.length];
      context.strokeStyle = this.itemLabelStrokeColor;
      context.lineWidth = this.getScaledNumber(this.itemLabelStrokeWidth / baseCanvasSize);
      const maximum = this.getScaledNumber(this.itemLabelFontSizeMax / baseCanvasSize);
      const available = this.getScaledNumber(this.itemLabelRadiusMax);
      const fontSize = getFontSizeToFit(context, String(item.label), available, maximum);
      context.font = `${fontSize}px ${this.itemLabelFont}`;
      const y = this.getScaledNumber(this.itemLabelBaselineOffset / baseCanvasSize);
      if (this.itemLabelStrokeWidth) context.strokeText(String(item.label), radius, y);
      context.fillText(String(item.label), radius, y);
      context.restore();
    }
  }

  drawDebugDragPoints(context) {
    for (const [index, point] of this._dragPoints.entries()) {
      context.fillStyle = `hsl(${(Debugging.dragPointHue + index * 20) % 360} 100% 50%)`;
      context.beginPath();
      context.arc(point.x - this._canvasSize / 2, point.y - this._canvasSize / 2, 3, 0, Math.PI * 2);
      context.fill();
    }
  }

  animateRotation(time) {
    if (!this._lastFrameTime) this._lastFrameTime = time;
    const elapsed = Math.min((time - this._lastFrameTime) / 1000, 0.1);
    this._lastFrameTime = time;
    this.rotation += this._rotationSpeed * elapsed;
    if (!this._dragging) this._rotationSpeed = Math.max(0, this._rotationSpeed + this.rotationResistance * elapsed);
    this.limitSpeed();
    this.refreshCurrentIndex();
    this.draw();
    if (Math.abs(this._rotationSpeed) < 0.01 && !this._dragging) {
      this.stop();
      this.raiseEvent_onRest();
      return;
    }
    this._frame = requestAnimationFrame(value => this.animateRotation(value));
  }

  getRotationSpeedPlusDrag() {
    return this._rotationSpeed;
  }

  spin(speed = this.rotationSpeedMax) {
    this.beginSpin();
    this._rotationSpeed = speed;
    this.limitSpeed();
    this.raiseEvent_onSpin();
    return this;
  }

  spinTo(rotation, duration = 0, easing = easeSinOut) {
    this.stop();
    if (!duration) {
      this.rotation = rotation;
      this.refresh();
      this.raiseEvent_onRest();
      return this;
    }
    const start = this.rotation;
    const started = performance.now();
    this.beginSpin();
    const tick = now => {
      const progress = Math.min((now - started) / duration, 1);
      this.rotation = start + (rotation - start) * easing(progress);
      this.refresh();
      if (progress < 1) this._frame = requestAnimationFrame(tick);
      else { this._frame = null; this.raiseEvent_onRest(); }
    };
    this._frame = requestAnimationFrame(tick);
    this.raiseEvent_onSpin();
    return this;
  }

  spinToItem(index, duration = 0, spinToCenter = true, revolutions = 1, direction = 1, easing = easeSinOut) {
    const item = this.items[index];
    if (!item) throw new RangeError(`No wheel item exists at index ${index}`);
    const target = spinToCenter ? item.getCenterAngle() : item.getRandomAngle();
    const rotation = calcWheelRotationForTargetAngle(
      this.pointerAngle - target,
      addAngle(this.rotation, 0),
      direction,
    );
    return this.spinTo(rotation + Math.max(0, revolutions) * 360 * Math.sign(direction || 1), duration, easing);
  }

  animate(rotation, duration, easing) {
    return this.spinTo(rotation, duration, easing);
  }

  stop() {
    if (this._frame !== null && typeof cancelAnimationFrame === "function") cancelAnimationFrame(this._frame);
    this._frame = null;
    this._rotationSpeed = 0;
    this._lastFrameTime = 0;
    return this;
  }

  getScaledNumber(value) {
    return value * (this._canvasSize || baseCanvasSize) / 2;
  }

  getActualPixelRatio() {
    return this.pixelRatio || globalThis.devicePixelRatio || 1;
  }

  wheelHitTest(event) {
    if (!this.canvas || !event) return false;
    const point = translateXYToElement(event.clientX, event.clientY, this.canvas);
    const center = { x: this._canvasSize / 2, y: this._canvasSize / 2 };
    return isPointInCircle(point, this.getScaledNumber(this.radius), center);
  }

  refreshCursor() {
    if (this.canvas) this.canvas.style.cursor = this.isInteractive && !this._dragging ? "grab" : this._dragging ? "grabbing" : "default";
  }

  getAngleFromCenter(event) {
    const point = translateXYToElement(event.clientX, event.clientY, this.canvas);
    return getAngle(this._canvasSize / 2, this._canvasSize / 2, point.x, point.y);
  }

  getCurrentIndex() {
    if (!this.items.length) return -1;
    const angle = addAngle(this.pointerAngle - this.rotation - arcAdjust, 0);
    return this.getItemAngles().findIndex(({ start, end }) => isAngleBetween(angle, start, end));
  }

  refreshCurrentIndex() {
    const index = this.getCurrentIndex();
    if (index !== this._currentIndex) {
      this._currentIndex = index;
      this.raiseEvent_onCurrentIndexChange();
    }
    return index;
  }

  getItemAngles() {
    const total = this.items.reduce((sum, item) => sum + Math.max(0, Number(item.weight) || 0), 0);
    if (!total) return this.items.map(() => ({ start: 0, end: 0 }));
    let start = 0;
    return this.items.map(item => {
      const end = start + Math.max(0, Number(item.weight) || 0) / total * 360;
      const angles = { start, end };
      start = end;
      return angles;
    });
  }

  refresh() {
    this.refreshCurrentIndex();
    this.refreshCursor();
    this.refreshAriaLabel();
    this.draw();
    return this;
  }

  limitSpeed() {
    this._rotationSpeed = Math.max(-this.rotationSpeedMax, Math.min(this.rotationSpeedMax, this._rotationSpeed));
  }

  beginSpin() {
    if (this._frame === null && typeof requestAnimationFrame === "function") {
      this._lastFrameTime = 0;
      this._frame = requestAnimationFrame(time => this.animateRotation(time));
    }
  }

  refreshAriaLabel() {
    if (!this.canvas) return;
    this.canvas.setAttribute("role", "img");
    const labels = this.items.map(item => item.label).filter(Boolean).join(", ");
    this.canvas.setAttribute("aria-label", labels ? `Wheel: ${labels}` : "Wheel");
  }

  dragStart(event) {
    if (!this.isInteractive || !this.wheelHitTest(event)) return;
    event.preventDefault?.();
    this.stop();
    this._dragging = true;
    this._dragAngle = this.getAngleFromCenter(event);
    this._dragPoints = [{ angle: this._dragAngle, time: performance.now(), ...translateXYToElement(event.clientX, event.clientY, this.canvas) }];
    this.canvas?.setPointerCapture?.(event.pointerId);
    this.refreshCursor();
  }

  dragMove(event) {
    if (!this._dragging) return;
    event.preventDefault?.();
    const angle = this.getAngleFromCenter(event);
    this.rotation += diffAngle(this._dragAngle, angle);
    this._dragAngle = angle;
    const point = { angle, time: performance.now(), ...translateXYToElement(event.clientX, event.clientY, this.canvas) };
    this._dragPoints.push(point);
    this._dragPoints = this._dragPoints.filter(value => point.time - value.time <= dragCapturePeriod);
    this.refresh();
  }

  dragEnd(event) {
    if (!this._dragging) return;
    this._dragging = false;
    this.canvas?.releasePointerCapture?.(event?.pointerId);
    if (this._dragPoints.length > 1) {
      const first = this._dragPoints[0];
      const last = this._dragPoints.at(-1);
      this._rotationSpeed = diffAngle(first.angle, last.angle) / ((last.time - first.time) / 1000 || 1);
      this.limitSpeed();
      if (!this.isDragEventTooOld()) this.beginSpin();
    }
    this.refreshCursor();
  }

  isDragEventTooOld() {
    return !this._dragPoints.length || performance.now() - this._dragPoints.at(-1).time > dragCapturePeriod;
  }

  raiseEvent_onCurrentIndexChange() {
    this.onCurrentIndexChange?.({ currentIndex: this._currentIndex, wheel: this });
  }

  raiseEvent_onRest() {
    this.onRest?.({ currentIndex: this.getCurrentIndex(), wheel: this });
  }

  raiseEvent_onSpin() {
    this.onSpin?.({ currentIndex: this.getCurrentIndex(), wheel: this });
  }

  _set(name, value, refresh = true) {
    this[`_${name}`] = value;
    if (refresh) this.refresh();
  }

  get borderColor() { return this._borderColor; }
  set borderColor(value) { this._set("borderColor", value); }
  get borderWidth() { return this._borderWidth; }
  set borderWidth(value) { this._set("borderWidth", value); }
  get debug() { return this._debug; }
  set debug(value) { this._set("debug", Boolean(value)); }
  get image() { return this._image; }
  set image(value) { this._set("image", value); }
  get isInteractive() { return this._isInteractive; }
  set isInteractive(value) { this._set("isInteractive", Boolean(value)); }
  get itemBackgroundColors() { return this._itemBackgroundColors; }
  set itemBackgroundColors(value) { this._set("itemBackgroundColors", value); }
  get itemLabelAlign() { return this._itemLabelAlign; }
  set itemLabelAlign(value) { this._set("itemLabelAlign", value); }
  get itemLabelBaselineOffset() { return this._itemLabelBaselineOffset; }
  set itemLabelBaselineOffset(value) { this._set("itemLabelBaselineOffset", value); }
  get itemLabelColors() { return this._itemLabelColors; }
  set itemLabelColors(value) { this._set("itemLabelColors", value); }
  get itemLabelFont() { return this._itemLabelFont; }
  set itemLabelFont(value) { this._set("itemLabelFont", value); }
  get itemLabelFontSizeMax() { return this._itemLabelFontSizeMax; }
  set itemLabelFontSizeMax(value) { this._set("itemLabelFontSizeMax", value); }
  get itemLabelRadius() { return this._itemLabelRadius; }
  set itemLabelRadius(value) { this._set("itemLabelRadius", value); }
  get itemLabelRadiusMax() { return this._itemLabelRadiusMax; }
  set itemLabelRadiusMax(value) { this._set("itemLabelRadiusMax", value); }
  get itemLabelRotation() { return this._itemLabelRotation; }
  set itemLabelRotation(value) { this._set("itemLabelRotation", value); }
  get itemLabelStrokeColor() { return this._itemLabelStrokeColor; }
  set itemLabelStrokeColor(value) { this._set("itemLabelStrokeColor", value); }
  get itemLabelStrokeWidth() { return this._itemLabelStrokeWidth; }
  set itemLabelStrokeWidth(value) { this._set("itemLabelStrokeWidth", value); }
  get items() { return this._items; }
  set items(value) {
    for (const item of this._items ?? []) item._wheel = null;
    this._items = (value ?? []).map(item => item instanceof Item ? item : new Item(item));
    for (const item of this._items) item._wheel = this;
    this.refresh();
  }
  get lineColor() { return this._lineColor; }
  set lineColor(value) { this._set("lineColor", value); }
  get lineWidth() { return this._lineWidth; }
  set lineWidth(value) { this._set("lineWidth", value); }
  get offset() { return this._offset; }
  set offset(value) { this._set("offset", { ...Defaults.wheel.offset, ...value }); }
  get onCurrentIndexChange() { return this._onCurrentIndexChange; }
  set onCurrentIndexChange(value) { this._set("onCurrentIndexChange", value, false); }
  get onRest() { return this._onRest; }
  set onRest(value) { this._set("onRest", value, false); }
  get onSpin() { return this._onSpin; }
  set onSpin(value) { this._set("onSpin", value, false); }
  get overlayImage() { return this._overlayImage; }
  set overlayImage(value) { this._set("overlayImage", value); }
  get pixelRatio() { return this._pixelRatio; }
  set pixelRatio(value) { this._set("pixelRatio", value); this.resize(); }
  get pointerAngle() { return this._pointerAngle; }
  set pointerAngle(value) { this._set("pointerAngle", addAngle(value, 0)); }
  get radius() { return this._radius; }
  set radius(value) { this._set("radius", value); }
  get rotation() { return this._rotation; }
  set rotation(value) { this._set("rotation", fixFloat(value), false); }
  get rotationResistance() { return this._rotationResistance; }
  set rotationResistance(value) { this._set("rotationResistance", value, false); }
  get rotationSpeed() { return this._rotationSpeed; }
  get rotationSpeedMax() { return this._rotationSpeedMax; }
  set rotationSpeedMax(value) { this._set("rotationSpeedMax", Math.abs(value), false); }
}

Object.assign(globalThis, {
  AlignText,
  Defaults,
  Debugging,
  Item,
  Wheel,
  arcAdjust,
  baseCanvasSize,
  dragCapturePeriod,
  getRandomInt,
  getRandomFloat,
  degRad,
  isAngleBetween,
  aveArray,
  getFontSizeToFit,
  isPointInCircle,
  translateXYToElement,
  getMouseButtonsPressed,
  getAngle,
  getDistanceBetweenPoints,
  addAngle,
  diffAngle,
  calcWheelRotationForTargetAngle,
  isObject,
  isNumber,
  setProp,
  fixFloat,
  easeSinOut,
  getResizeObserver,
  register,
  unregister,
  registerPointerEvents,
});

export { Wheel };
