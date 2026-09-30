const DEGREES_IN_CIRCLE = 360;
const ARC_ORIGIN = -90;
const BASE_CANVAS_SIZE = 500;
const DRAG_SAMPLE_LIFETIME = 250;

const DEFAULT_ITEM = Object.freeze({
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
});

const DEFAULT_WHEEL = Object.freeze({
  borderColor: "#000",
  borderWidth: 1,
  debug: false,
  image: null,
  isInteractive: true,
  itemBackgroundColors: ["#fff"],
  itemLabelAlign: "right",
  itemLabelBaselineOffset: 0,
  itemLabelColors: ["#000"],
  itemLabelFont: "sans-serif",
  itemLabelFontSizeMax: BASE_CANVAS_SIZE,
  itemLabelRadius: 0.85,
  itemLabelRadiusMax: 0.2,
  itemLabelRotation: 0,
  itemLabelStrokeColor: "#fff",
  itemLabelStrokeWidth: 0,
  items: [],
  lineColor: "#000",
  lineWidth: 1,
  offset: { x: 0, y: 0 },
  onCurrentIndexChange: null,
  onRest: null,
  onSpin: null,
  overlayImage: null,
  pixelRatio: 0,
  pointerAngle: 0,
  radius: 0.95,
  rotation: 0,
  rotationResistance: -35,
  rotationSpeedMax: 300,
});

const requestFrame = globalThis.requestAnimationFrame?.bind(globalThis)
  ?? ((callback) => setTimeout(() => callback(performance.now()), 16));
const cancelFrame = globalThis.cancelAnimationFrame?.bind(globalThis) ?? clearTimeout;

function isNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function normalizeAngle(angle) {
  return ((angle % DEGREES_IN_CIRCLE) + DEGREES_IN_CIRCLE) % DEGREES_IN_CIRCLE;
}

function signedAngleDifference(from, to) {
  return ((to - from + 540) % DEGREES_IN_CIRCLE) - 180;
}

function degreesToRadians(degrees) {
  return degrees * Math.PI / 180;
}

function easeSinOut(value) {
  return Math.sin(value * Math.PI / 2);
}

function loadImage(source, refresh) {
  if (!source || typeof Image === "undefined") return source ?? null;
  if (typeof HTMLImageElement !== "undefined" && source instanceof HTMLImageElement) return source;
  const image = new Image();
  image.onload = refresh;
  image.src = source;
  return image;
}

class WheelItem {
  constructor(wheel, properties = {}) {
    this.wheel = wheel;
    this.init(properties);
  }

  init(properties = {}) {
    Object.assign(this, DEFAULT_ITEM, properties);
    this.weight = Math.max(0, Number(this.weight) || 0);
    this.image = loadImage(this.image, () => this.wheel.refresh());
  }

  get index() {
    return this.wheel.items.indexOf(this);
  }

  get angles() {
    return this.wheel.getItemAngles(this.index);
  }

  getCenterAngle() {
    const { start, end } = this.angles;
    return start + (end - start) / 2;
  }

  getStartAngle() {
    return this.angles.start;
  }

  getEndAngle() {
    return this.angles.end;
  }

  getRandomAngle() {
    const { start, end } = this.angles;
    return start + Math.random() * (end - start);
  }
}

class Wheel {
  constructor(container, properties = {}) {
    if (typeof Element === "undefined" || !(container instanceof Element)) {
      throw new TypeError("Wheel container must be an Element");
    }

    this.container = container;
    this.canvas = document.createElement("canvas");
    this.context = this.canvas.getContext("2d");
    this.container.appendChild(this.canvas);

    this._frame = null;
    this._lastFrameTime = null;
    this._rotationSpeed = 0;
    this._currentIndex = -1;
    this._drag = null;
    this._items = [];

    for (const [name, value] of Object.entries(DEFAULT_WHEEL)) {
      this[`_${name}`] = Array.isArray(value) ? [...value]
        : value && typeof value === "object" ? { ...value }
          : value;
    }
    for (const [name, value] of Object.entries(properties)) {
      if (name !== "items" && name in DEFAULT_WHEEL) this[`_${name}`] = value;
    }
    this._image = loadImage(this._image, () => this.refresh());
    this._overlayImage = loadImage(this._overlayImage, () => this.refresh());
    this.items = properties.items ?? DEFAULT_WHEEL.items;

    this._boundDragStart = (event) => this.dragStart(event);
    this._boundDragMove = (event) => this.dragMove(event);
    this._boundDragEnd = (event) => this.dragEnd(event);
    this.canvas.addEventListener("pointerdown", this._boundDragStart);
    globalThis.addEventListener?.("pointermove", this._boundDragMove);
    globalThis.addEventListener?.("pointerup", this._boundDragEnd);
    globalThis.addEventListener?.("pointercancel", this._boundDragEnd);

    this._resizeObserver = typeof ResizeObserver === "undefined"
      ? null
      : new ResizeObserver(() => this.resize());
    this._resizeObserver?.observe(this.container);
    this.resize();
  }

  add(item) {
    this._items.push(new WheelItem(this, item));
    this.refresh();
    return this._items.length - 1;
  }

  remove(index = this._items.length - 1) {
    if (!Number.isInteger(index) || index < 0 || index >= this._items.length) return null;
    const [removed] = this._items.splice(index, 1);
    this.refresh();
    return removed;
  }

  resize() {
    const width = this.container.clientWidth || this.container.offsetWidth || BASE_CANVAS_SIZE;
    const height = this.container.clientHeight || this.container.offsetHeight || width;
    const size = Math.max(1, Math.min(width, height));
    const ratio = this.getActualPixelRatio();
    this.canvas.style.width = `${size}px`;
    this.canvas.style.height = `${size}px`;
    this.canvas.width = Math.round(size * ratio);
    this.canvas.height = Math.round(size * ratio);
    this._size = size;
    this._scale = size / BASE_CANVAS_SIZE;
    this.context?.setTransform(ratio, 0, 0, ratio, 0, 0);
    this.refresh();
  }

  refresh() {
    this.refreshCurrentIndex();
    this.refreshCursor();
    this.refreshAriaLabel();
    this.draw();
  }

  draw() {
    const context = this.context;
    if (!context || !this._size) return;
    context.clearRect(0, 0, this._size, this._size);
    context.save();
    context.translate(this._size / 2 + this.offset.x * this._scale, this._size / 2 + this.offset.y * this._scale);
    context.rotate(degreesToRadians(this.rotation + ARC_ORIGIN));

    this.drawItemBackgrounds(context);
    this.drawItemImages(context);
    this.drawItemLabels(context);
    this.drawItemLines(context);
    this.drawBorder(context);
    if (this.image) this.drawImage(context, this.image);
    context.restore();

    if (this.overlayImage) {
      context.save();
      context.translate(this._size / 2, this._size / 2);
      this.drawImage(context, this.overlayImage);
      context.restore();
    }
    if (this.debug) {
      this.drawDebugPointerLine(context);
      this.drawDebugDragPoints(context);
    }
  }

  get drawingRadius() {
    return this._size * this.radius / 2;
  }

  forEachItemPath(context, callback) {
    for (let index = 0; index < this.items.length; index += 1) {
      const angles = this.getItemAngles(index);
      const start = degreesToRadians(angles.start);
      const end = degreesToRadians(angles.end);
      context.beginPath();
      context.moveTo(0, 0);
      context.arc(0, 0, this.drawingRadius, start, end);
      context.closePath();
      callback(this.items[index], index, angles);
    }
  }

  drawItemBackgrounds(context) {
    this.forEachItemPath(context, (item, index) => {
      context.fillStyle = item.backgroundColor ?? this.itemBackgroundColors[index % this.itemBackgroundColors.length];
      context.fill();
    });
  }

  drawItemLines(context) {
    if (this.lineWidth <= 0) return;
    context.strokeStyle = this.lineColor;
    context.lineWidth = this.getScaledNumber(this.lineWidth);
    this.forEachItemPath(context, () => context.stroke());
  }

  drawBorder(context) {
    if (this.borderWidth <= 0) return;
    context.beginPath();
    context.arc(0, 0, this.drawingRadius, 0, Math.PI * 2);
    context.strokeStyle = this.borderColor;
    context.lineWidth = this.getScaledNumber(this.borderWidth);
    context.stroke();
  }

  drawItemImages(context) {
    for (const item of this.items) {
      if (!item.image || !item.image.complete) continue;
      const angle = item.getCenterAngle();
      context.save();
      context.rotate(degreesToRadians(angle));
      context.translate(this.drawingRadius * item.imageRadius, 0);
      context.rotate(degreesToRadians(item.imageRotation));
      context.globalAlpha = clamp(item.imageOpacity, 0, 1);
      const width = item.image.naturalWidth * item.imageScale * this._scale;
      const height = item.image.naturalHeight * item.imageScale * this._scale;
      context.drawImage(item.image, -width / 2, -height / 2, width, height);
      context.restore();
    }
  }

  drawImage(context, image) {
    if (!image?.complete) return;
    const maxSize = this.drawingRadius * 2;
    const scale = Math.min(maxSize / image.naturalWidth, maxSize / image.naturalHeight);
    const width = image.naturalWidth * scale;
    const height = image.naturalHeight * scale;
    context.drawImage(image, -width / 2, -height / 2, width, height);
  }

  drawItemLabels(context) {
    for (let index = 0; index < this.items.length; index += 1) {
      const item = this.items[index];
      if (!item.label) continue;
      const angle = item.getCenterAngle();
      const maximumWidth = this.drawingRadius * this.itemLabelRadiusMax;
      let fontSize = Math.min(this.getScaledNumber(this.itemLabelFontSizeMax), maximumWidth || Infinity);
      context.font = `${fontSize}px ${this.itemLabelFont}`;
      const measuredWidth = context.measureText(String(item.label)).width;
      if (measuredWidth > this.drawingRadius * this.itemLabelRadius) {
        fontSize *= this.drawingRadius * this.itemLabelRadius / measuredWidth;
        context.font = `${fontSize}px ${this.itemLabelFont}`;
      }
      context.save();
      context.rotate(degreesToRadians(angle + this.itemLabelRotation));
      context.translate(this.drawingRadius * this.itemLabelRadius, this.getScaledNumber(this.itemLabelBaselineOffset));
      context.textAlign = this.itemLabelAlign;
      context.textBaseline = "middle";
      context.fillStyle = item.labelColor ?? this.itemLabelColors[index % this.itemLabelColors.length];
      if (this.itemLabelStrokeWidth > 0) {
        context.strokeStyle = this.itemLabelStrokeColor;
        context.lineWidth = this.getScaledNumber(this.itemLabelStrokeWidth);
        context.strokeText(String(item.label), 0, 0);
      }
      context.fillText(String(item.label), 0, 0);
      context.restore();
    }
  }

  drawDebugPointerLine(context) {
    context.save();
    context.translate(this._size / 2, this._size / 2);
    context.rotate(degreesToRadians(this.pointerAngle + ARC_ORIGIN));
    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(this.drawingRadius, 0);
    context.strokeStyle = "#ff00ff";
    context.stroke();
    context.restore();
  }

  drawDebugDragPoints(context) {
    if (!this.debug || !this._drag) return;
    context.save();
    context.translate(this._size / 2, this._size / 2);
    for (const [index, sample] of this._drag.samples.entries()) {
      context.beginPath();
      context.fillStyle = `hsl(${(300 + index * 12) % 360} 100% 50%)`;
      const angle = degreesToRadians(sample.angle + ARC_ORIGIN);
      context.arc(Math.cos(angle) * this.drawingRadius, Math.sin(angle) * this.drawingRadius, 3, 0, Math.PI * 2);
      context.fill();
    }
    context.restore();
  }

  spin(rotationSpeed = this.rotationSpeedMax) {
    this.stop();
    this._rotationSpeed = clamp(Number(rotationSpeed) || 0, -this.rotationSpeedMax, this.rotationSpeedMax);
    this._lastFrameTime = null;
    this.raiseEvent("onSpin", this._rotationSpeed);
    this._frame = requestFrame((time) => this.animateRotation(time));
  }

  getRotationSpeedPlusDrag() {
    if (!this._drag || this._drag.samples.length < 2) return this.rotationSpeed;
    const first = this._drag.samples[0];
    const last = this._drag.samples[this._drag.samples.length - 1];
    const seconds = (last.time - first.time) / 1000;
    return seconds > 0 ? signedAngleDifference(first.angle, last.angle) / seconds : 0;
  }

  animateRotation(time) {
    if (this._frame === null) return;
    const elapsed = this._lastFrameTime === null ? 0 : Math.min(100, time - this._lastFrameTime);
    this._lastFrameTime = time;
    this._rotation = normalizeAngle(this.rotation + this._rotationSpeed * elapsed / 1000);
    const resistance = Math.max(0, -this.rotationResistance) * elapsed / 1000;
    this._rotationSpeed = Math.sign(this._rotationSpeed) * Math.max(0, Math.abs(this._rotationSpeed) - resistance);
    this.refresh();
    if (Math.abs(this._rotationSpeed) < 0.01) {
      this.stop();
      this.raiseEvent("onRest", this.currentIndex);
    } else {
      this._frame = requestFrame((nextTime) => this.animateRotation(nextTime));
    }
  }

  animate(targetRotation, duration = 0, easingFunction = easeSinOut) {
    this.stop();
    const startRotation = this.rotation;
    const change = targetRotation - startRotation;
    const startTime = performance.now();
    this.raiseEvent("onSpin", this._rotationSpeed);
    return new Promise((resolve) => {
      const step = (time) => {
        const progress = duration <= 0 ? 1 : clamp((time - startTime) / duration, 0, 1);
        this._rotation = startRotation + change * easingFunction(progress);
        this.refresh();
        if (progress < 1) this._frame = requestFrame(step);
        else {
          this._frame = null;
          this._rotation = normalizeAngle(this._rotation);
          this.refresh();
          this.raiseEvent("onRest", this.currentIndex);
          resolve(this.currentIndex);
        }
      };
      this._frame = requestFrame(step);
    });
  }

  spinTo(rotation, duration, easingFunction = easeSinOut) {
    return this.animate(Number(rotation) || 0, Number(duration) || 0, easingFunction);
  }

  spinToItem(index, duration, spinToCenter = true, numberOfRevolutions = 1, direction = 1, easingFunction = easeSinOut) {
    if (!this.items[index]) throw new RangeError("Invalid wheel item index");
    const itemAngle = spinToCenter ? this.items[index].getCenterAngle() : this.items[index].getRandomAngle();
    const desiredRotation = this.pointerAngle - itemAngle;
    const revolutions = Math.max(0, Number(numberOfRevolutions) || 0) * DEGREES_IN_CIRCLE;
    const delta = direction < 0
      ? -normalizeAngle(this.rotation - desiredRotation) - revolutions
      : normalizeAngle(desiredRotation - this.rotation) + revolutions;
    return this.animate(this.rotation + delta, duration, easingFunction);
  }

  stop() {
    if (this._frame !== null) cancelFrame(this._frame);
    this._frame = null;
    this._lastFrameTime = null;
    this._rotationSpeed = 0;
  }

  limitSpeed(speed) {
    return clamp(Number(speed) || 0, -this.rotationSpeedMax, this.rotationSpeedMax);
  }

  beginSpin(speed) {
    return this.spin(this.limitSpeed(speed));
  }

  getScaledNumber(value) {
    return Number(value) * (this._scale || 1);
  }

  getActualPixelRatio() {
    return this.pixelRatio > 0 ? this.pixelRatio : globalThis.devicePixelRatio || 1;
  }

  wheelHitTest(x, y) {
    const center = this._size / 2;
    return Math.hypot(x - center, y - center) <= this.drawingRadius;
  }

  getAngleFromCenter(event) {
    const rectangle = this.canvas.getBoundingClientRect();
    const x = event.clientX - rectangle.left - rectangle.width / 2;
    const y = event.clientY - rectangle.top - rectangle.height / 2;
    return normalizeAngle(Math.atan2(y, x) * 180 / Math.PI - ARC_ORIGIN);
  }

  dragStart(event) {
    if (!this.isInteractive) return;
    const rectangle = this.canvas.getBoundingClientRect();
    if (!this.wheelHitTest(event.clientX - rectangle.left, event.clientY - rectangle.top)) return;
    this.stop();
    const angle = this.getAngleFromCenter(event);
    this._drag = { angle, samples: [{ angle, time: performance.now() }] };
    this.canvas.setPointerCapture?.(event.pointerId);
    event.preventDefault?.();
  }

  dragMove(event) {
    if (!this._drag) return;
    const angle = this.getAngleFromCenter(event);
    this._rotation = normalizeAngle(this.rotation + signedAngleDifference(this._drag.angle, angle));
    this._drag.angle = angle;
    const now = performance.now();
    this._drag.samples.push({ angle: this.rotation, time: now });
    this._drag.samples = this._drag.samples.filter((sample) => now - sample.time <= DRAG_SAMPLE_LIFETIME);
    this.refresh();
  }

  dragEnd() {
    if (!this._drag) return;
    const samples = this._drag.samples;
    this._drag = null;
    if (samples.length < 2) return this.raiseEvent("onRest", this.currentIndex);
    const first = samples[0];
    const last = samples[samples.length - 1];
    const seconds = (last.time - first.time) / 1000;
    const speed = seconds > 0 ? signedAngleDifference(first.angle, last.angle) / seconds : 0;
    if (Math.abs(speed) > 1) this.spin(speed);
    else this.raiseEvent("onRest", this.currentIndex);
  }

  isDragEventTooOld(sample, now = performance.now()) {
    return now - sample.time > DRAG_SAMPLE_LIFETIME;
  }

  getCurrentIndex() {
    if (!this.items.length) return -1;
    const angle = normalizeAngle(this.pointerAngle - this.rotation);
    for (let index = 0; index < this.items.length; index += 1) {
      const { start, end } = this.getItemAngles(index);
      if (angle >= start && angle < end) return index;
    }
    return this.items.length - 1;
  }

  refreshCurrentIndex() {
    const index = this.getCurrentIndex();
    if (index === this._currentIndex) return;
    this._currentIndex = index;
    this.raiseEvent("onCurrentIndexChange", index);
  }

  getItemAngles(index) {
    const totalWeight = this.items.reduce((sum, item) => sum + item.weight, 0);
    if (!this.items[index] || totalWeight <= 0) return { start: 0, end: 0 };
    let start = 0;
    for (let itemIndex = 0; itemIndex < index; itemIndex += 1) {
      start += this.items[itemIndex].weight / totalWeight * DEGREES_IN_CIRCLE;
    }
    return { start, end: start + this.items[index].weight / totalWeight * DEGREES_IN_CIRCLE };
  }

  refreshCursor() {
    if (!this.canvas) return;
    this.canvas.style.cursor = this.isInteractive ? (this._drag ? "grabbing" : "grab") : "default";
  }

  refreshAriaLabel() {
    this.canvas.setAttribute("role", "img");
    const selected = this.items[this.currentIndex];
    this.canvas.setAttribute("aria-label", selected?.label ? String(selected.label) : "Wheel");
  }

  raiseEvent(name, value) {
    const callback = this[name];
    if (typeof callback === "function") callback(value);
  }

  raiseEvent_onCurrentIndexChange() { this.raiseEvent("onCurrentIndexChange", this.currentIndex); }
  raiseEvent_onRest() { this.raiseEvent("onRest", this.currentIndex); }
  raiseEvent_onSpin() { this.raiseEvent("onSpin", this.rotationSpeed); }

  get currentIndex() { return this._currentIndex; }
  get rotationSpeed() { return this._rotationSpeed; }
}

const redrawProperties = [
  "borderColor", "borderWidth", "debug", "isInteractive", "itemLabelAlign",
  "itemLabelBaselineOffset", "itemLabelFont", "itemLabelFontSizeMax", "itemLabelRadius",
  "itemLabelRadiusMax", "itemLabelRotation", "itemLabelStrokeColor", "itemLabelStrokeWidth",
  "lineColor", "lineWidth", "pointerAngle", "radius", "rotation",
];

for (const name of redrawProperties) {
  Object.defineProperty(Wheel.prototype, name, {
    get() { return this[`_${name}`]; },
    set(value) { this[`_${name}`] = value; if (this.canvas) this.refresh(); },
  });
}

for (const name of ["itemBackgroundColors", "itemLabelColors"]) {
  Object.defineProperty(Wheel.prototype, name, {
    get() { return this[`_${name}`]; },
    set(value) {
      if (!Array.isArray(value) || value.length === 0) throw new TypeError(`${name} must be a non-empty array`);
      this[`_${name}`] = [...value];
      if (this.canvas) this.refresh();
    },
  });
}

for (const name of ["image", "overlayImage"]) {
  Object.defineProperty(Wheel.prototype, name, {
    get() { return this[`_${name}`]; },
    set(value) { this[`_${name}`] = loadImage(value, () => this.refresh()); if (this.canvas) this.refresh(); },
  });
}

for (const name of ["offset", "pixelRatio"]) {
  Object.defineProperty(Wheel.prototype, name, {
    get() { return this[`_${name}`]; },
    set(value) { this[`_${name}`] = value; if (this.canvas) this.resize(); },
  });
}

for (const name of ["rotationResistance", "rotationSpeedMax", "onCurrentIndexChange", "onRest", "onSpin"]) {
  Object.defineProperty(Wheel.prototype, name, {
    get() { return this[`_${name}`]; },
    set(value) { this[`_${name}`] = value; },
  });
}

Object.defineProperty(Wheel.prototype, "items", {
  get() { return this._items; },
  set(items) {
    if (!Array.isArray(items)) throw new TypeError("items must be an array");
    this._items = items.map((item) => item instanceof WheelItem ? item : new WheelItem(this, item));
    for (const item of this._items) item.wheel = this;
    if (this.canvas) this.refresh();
  },
});

globalThis.Wheel = Wheel;

export { Wheel };
