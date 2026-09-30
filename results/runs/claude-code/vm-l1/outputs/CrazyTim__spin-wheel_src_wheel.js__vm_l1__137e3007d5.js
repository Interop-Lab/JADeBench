const ARC_ADJUST = -90;
const BASE_CANVAS_SIZE = 500;
const DRAG_CAPTURE_PERIOD = 250;

const AlignText = Object.freeze({ left: "left", right: "right", center: "center" });
const Defaults = Object.freeze({
  wheel: {
    borderColor: "#000", borderWidth: 1, debug: false, image: null,
    isInteractive: true, itemBackgroundColors: ["#fff"], itemLabelAlign: AlignText.right,
    itemLabelBaselineOffset: 0, itemLabelColors: ["#000"], itemLabelFont: "sans-serif",
    itemLabelFontSizeMax: BASE_CANVAS_SIZE, itemLabelRadius: 0.85, itemLabelRadiusMax: 0.2,
    itemLabelRotation: 0, itemLabelStrokeColor: "#fff", itemLabelStrokeWidth: 0,
    items: [], lineColor: "#000", lineWidth: 1, pixelRatio: 0, radius: 0.95,
    rotation: 0, rotationResistance: -35, rotationSpeedMax: 300,
    offset: { x: 0, y: 0 }, onCurrentIndexChange: null, onRest: null, onSpin: null,
    overlayImage: null, pointerAngle: 0,
  },
  item: {
    backgroundColor: null, image: null, imageOpacity: 1, imageRadius: 0.5,
    imageRotation: 0, imageScale: 1, label: "", labelColor: null, value: null, weight: 1,
  },
});

function isNumber(value) { return typeof value === "number" && Number.isFinite(value); }
function fixFloat(value) { return Number.parseFloat(Number(value).toFixed(9)); }
function degRad(degrees) { return degrees * Math.PI / 180; }
function addAngle(angle, amount = 0) { return (angle + amount + 360) % 360; }
function diffAngle(from, to) { return (to - from + 540) % 360 - 180; }
function isAngleBetween(angle, start, end) {
  angle = addAngle(angle); start = addAngle(start); end = addAngle(end);
  return start <= end ? angle >= start && angle <= end : angle >= start || angle <= end;
}
function randomFloat(minimum, maximum) { return Math.random() * (maximum - minimum) + minimum; }
function getAngle(x1, y1, x2, y2) {
  return addAngle(Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI - ARC_ADJUST);
}
function distance(point1, point2) { return Math.hypot(point2.x - point1.x, point2.y - point1.y); }
function easeSinOut(value) { return Math.sin(value * Math.PI / 2); }
function loadImage(source, onLoad) {
  if (!source || typeof source !== "string" || typeof Image === "undefined") return source;
  const image = new Image(); image.onload = onLoad; image.src = source; return image;
}

class Item {
  constructor(options = {}) {
    this._wheel = null;
    this._options = { ...Defaults.item };
    for (const property of Object.keys(Defaults.item)) {
      if (property in options) this[property] = options[property];
    }
  }

  _set(property, value) {
    if (property === "weight" && (!isNumber(value) || value <= 0)) {
      throw new Error("Item weight must be a positive number");
    }
    if (property === "image") value = loadImage(value, () => this._wheel?.refresh());
    this._options[property] = value;
    this._wheel?.refresh();
  }

  get backgroundColor() { return this._options.backgroundColor; }
  set backgroundColor(value) { this._set("backgroundColor", value); }
  get image() { return this._options.image; }
  set image(value) { this._set("image", value); }
  get imageOpacity() { return this._options.imageOpacity; }
  set imageOpacity(value) { this._set("imageOpacity", value); }
  get imageRadius() { return this._options.imageRadius; }
  set imageRadius(value) { this._set("imageRadius", value); }
  get imageRotation() { return this._options.imageRotation; }
  set imageRotation(value) { this._set("imageRotation", value); }
  get imageScale() { return this._options.imageScale; }
  set imageScale(value) { this._set("imageScale", value); }
  get label() { return this._options.label; }
  set label(value) { this._set("label", value == null ? "" : String(value)); }
  get labelColor() { return this._options.labelColor; }
  set labelColor(value) { this._set("labelColor", value); }
  get value() { return this._options.value; }
  set value(value) { this._set("value", value); }
  get weight() { return this._options.weight; }
  set weight(value) { this._set("weight", value); }
  getIndex() { return this._wheel ? this._wheel.items.indexOf(this) : -1; }
  getStartAngle() { return this._wheel?._itemAngles[this.getIndex()]?.start ?? 0; }
  getCenterAngle() { return this._wheel?._itemAngles[this.getIndex()]?.center ?? 0; }
  getEndAngle() { return this._wheel?._itemAngles[this.getIndex()]?.end ?? 0; }
  getRandomAngle() { return randomFloat(this.getStartAngle(), this.getEndAngle()); }
}

class Wheel {
  constructor(containerOrOptions, options = {}) {
    if (containerOrOptions && typeof containerOrOptions === "object" && !containerOrOptions.appendChild) {
      options = containerOrOptions; containerOrOptions = options.container;
    }
    this._container = typeof containerOrOptions === "string"
      ? document.querySelector(containerOrOptions) : containerOrOptions;
    if (!this._container) throw new Error("Wheel container was not found");

    this._options = { ...Defaults.wheel, offset: { ...Defaults.wheel.offset } };
    this._items = []; this._itemAngles = []; this._currentIndex = -1;
    this._rotationSpeed = 0; this._animationFrame = null; this._dragEvents = [];
    this._dragging = false;
    this._canvas = document.createElement("canvas");
    this._canvas.setAttribute("role", "img");
    this._canvas.style.display = "block";
    this._context = this._canvas.getContext("2d");
    this._container.appendChild(this._canvas);

    for (const property of Object.keys(Defaults.wheel)) {
      if (property in options) this[property] = options[property];
    }
    this.registerPointerEvents();
    if (typeof ResizeObserver !== "undefined") {
      this._resizeObserver = new ResizeObserver(() => this.resize());
      this._resizeObserver.observe(this._container);
    }
    this.resize();
  }

  add(options) {
    const item = options instanceof Item ? options : new Item(options);
    item._wheel = this; this._items.push(item); this.refresh(); return item;
  }

  remove() {
    this.stop(); this._resizeObserver?.disconnect(); this.unregisterPointerEvents(); this._canvas.remove();
  }

  resize() {
    const width = this._container.clientWidth || BASE_CANVAS_SIZE;
    const height = this._container.clientHeight || width;
    const ratio = this.getActualPixelRatio();
    this._canvas.width = Math.round(width * ratio); this._canvas.height = Math.round(height * ratio);
    this._canvas.style.width = `${width}px`; this._canvas.style.height = `${height}px`;
    this._context.setTransform(ratio, 0, 0, ratio, 0, 0);
    this._width = width; this._height = height;
    this._center = { x: width / 2 + this.offset.x * width / 2, y: height / 2 + this.offset.y * height / 2 };
    this._wheelRadius = Math.min(width, height) / 2 * this.radius;
    this.refresh();
  }

  refresh() { this.getItemAngles(); this.refreshCurrentIndex(); this.refreshAriaLabel(); this.draw(); }

  draw() {
    const context = this._context;
    context.clearRect(0, 0, this._width, this._height);
    context.save(); context.translate(this._center.x, this._center.y);
    context.rotate(degRad(this.rotation + ARC_ADJUST));
    this.drawItemBackgrounds(context); this.drawItemImages(context);
    this.drawItemLines(context); this.drawItemLabels(context); this.drawBorder(context);
    context.restore();
    if (this.overlayImage?.complete) this.drawImage(context, this.overlayImage);
  }

  drawItemBackgrounds(context) {
    this.items.forEach((item, index) => {
      const angles = this._itemAngles[index];
      context.beginPath(); context.moveTo(0, 0);
      context.arc(0, 0, this._wheelRadius, degRad(angles.start), degRad(angles.end));
      context.closePath();
      context.fillStyle = item.backgroundColor ?? this.itemBackgroundColors[index % this.itemBackgroundColors.length];
      context.fill();
    });
  }

  drawItemLines(context) {
    if (this.lineWidth <= 0) return;
    context.strokeStyle = this.lineColor; context.lineWidth = this.getScaledNumber(this.lineWidth);
    for (const angles of this._itemAngles) {
      context.beginPath(); context.moveTo(0, 0);
      context.lineTo(Math.cos(degRad(angles.start)) * this._wheelRadius, Math.sin(degRad(angles.start)) * this._wheelRadius);
      context.stroke();
    }
  }

  drawBorder(context) {
    if (this.borderWidth <= 0) return;
    context.beginPath(); context.arc(0, 0, this._wheelRadius, 0, Math.PI * 2);
    context.strokeStyle = this.borderColor; context.lineWidth = this.getScaledNumber(this.borderWidth); context.stroke();
  }

  drawItemLabels(context) {
    context.textBaseline = "middle"; context.textAlign = this.itemLabelAlign;
    this.items.forEach((item, index) => {
      if (!item.label) return;
      context.save(); context.rotate(degRad(this._itemAngles[index].center));
      context.translate(this._wheelRadius * this.itemLabelRadius, 0);
      context.rotate(degRad(this.itemLabelRotation));
      context.fillStyle = item.labelColor ?? this.itemLabelColors[index % this.itemLabelColors.length];
      context.font = `${Math.min(this.itemLabelFontSizeMax, this._wheelRadius * this.itemLabelRadiusMax)}px ${this.itemLabelFont}`;
      if (this.itemLabelStrokeWidth > 0) {
        context.lineWidth = this.itemLabelStrokeWidth; context.strokeStyle = this.itemLabelStrokeColor;
        context.strokeText(item.label, 0, this.itemLabelBaselineOffset);
      }
      context.fillText(item.label, 0, this.itemLabelBaselineOffset); context.restore();
    });
  }

  drawItemImages(context) {
    this.items.forEach((item, index) => {
      if (!item.image?.complete) return;
      const width = item.image.width * item.imageScale, height = item.image.height * item.imageScale;
      context.save(); context.rotate(degRad(this._itemAngles[index].center));
      context.translate(this._wheelRadius * item.imageRadius, 0); context.rotate(degRad(item.imageRotation));
      context.globalAlpha = item.imageOpacity; context.drawImage(item.image, -width / 2, -height / 2, width, height);
      context.restore();
    });
  }

  drawImage(context, image) {
    const scale = Math.min(this._width / image.width, this._height / image.height);
    const width = image.width * scale, height = image.height * scale;
    context.drawImage(image, (this._width - width) / 2, (this._height - height) / 2, width, height);
  }

  getItemAngles() {
    const total = this.items.reduce((sum, item) => sum + item.weight, 0); let angle = 0;
    this._itemAngles = this.items.map(item => {
      const size = total ? item.weight / total * 360 : 0;
      const result = { start: angle, center: angle + size / 2, end: angle + size };
      angle += size; return result;
    });
    return this._itemAngles;
  }

  getCurrentIndex() {
    const angle = addAngle(this.pointerAngle - this.rotation - ARC_ADJUST);
    return this._itemAngles.findIndex(item => isAngleBetween(angle, item.start, item.end));
  }

  refreshCurrentIndex() {
    const index = this.getCurrentIndex();
    if (index !== this._currentIndex) { this._currentIndex = index; this.raiseEvent_onCurrentIndexChange(); }
  }

  refreshAriaLabel() { this._canvas.setAttribute("aria-label", this.items[this._currentIndex]?.label || "Wheel"); }
  getScaledNumber(value) { return value * Math.min(this._width, this._height) / BASE_CANVAS_SIZE; }
  getActualPixelRatio() { return this.pixelRatio || globalThis.devicePixelRatio || 1; }
  limitSpeed(speed) { return Math.max(-this.rotationSpeedMax, Math.min(this.rotationSpeedMax, speed)); }

  spin(speed = this.rotationSpeedMax) {
    this.stop(); this._rotationSpeed = this.limitSpeed(speed); this.raiseEvent_onSpin();
    let previous = performance.now();
    const frame = now => {
      const seconds = Math.min(100, now - previous) / 1000; previous = now;
      this.rotation += this._rotationSpeed * seconds;
      const resistance = Math.max(0, -this.rotationResistance) * seconds;
      this._rotationSpeed = Math.sign(this._rotationSpeed) * Math.max(0, Math.abs(this._rotationSpeed) - resistance);
      if (this._rotationSpeed) this._animationFrame = requestAnimationFrame(frame);
      else { this._animationFrame = null; this.raiseEvent_onRest(); }
    };
    this._animationFrame = requestAnimationFrame(frame);
  }

  spinTo(rotation, duration = 0, easing = easeSinOut) { return this.animate(this.rotation, rotation, duration, easing); }

  spinToItem(index, duration = 0, center = true, revolutions = 1, direction = 1, easing = easeSinOut) {
    const item = this.items[index]; if (!item) throw new Error(`Item ${index} does not exist`);
    const angle = center ? item.getCenterAngle() : item.getRandomAngle();
    let target = this.rotation + diffAngle(this.rotation, this.pointerAngle - angle - ARC_ADJUST);
    target += Math.sign(direction || 1) * 360 * Math.max(0, revolutions);
    return this.animate(this.rotation, target, duration, easing);
  }

  animate(start, end, duration = 0, easing = easeSinOut) {
    this.stop(); this.raiseEvent_onSpin();
    if (duration <= 0) { this.rotation = end; this.raiseEvent_onRest(); return Promise.resolve(); }
    return new Promise(resolve => {
      const started = performance.now();
      const frame = now => {
        const progress = Math.min(1, (now - started) / duration);
        this.rotation = start + (end - start) * easing(progress);
        if (progress < 1) this._animationFrame = requestAnimationFrame(frame);
        else { this._animationFrame = null; this.raiseEvent_onRest(); resolve(); }
      };
      this._animationFrame = requestAnimationFrame(frame);
    });
  }

  stop() {
    if (this._animationFrame !== null) cancelAnimationFrame(this._animationFrame);
    this._animationFrame = null; this._rotationSpeed = 0;
  }

  pointFromEvent(event) {
    const bounds = this._canvas.getBoundingClientRect();
    return { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
  }
  getAngleFromCenter(event) {
    const point = this.pointFromEvent(event); return getAngle(this._center.x, this._center.y, point.x, point.y);
  }
  wheelHitTest(event) { return distance(this.pointFromEvent(event), this._center) <= this._wheelRadius; }
  refreshCursor() { this._canvas.style.cursor = this.isInteractive ? "grab" : "default"; }

  registerPointerEvents() {
    this._pointerDown = event => this.dragStart(event);
    this._pointerMove = event => this.dragMove(event);
    this._pointerUp = event => this.dragEnd(event);
    this._canvas.addEventListener("pointerdown", this._pointerDown);
    globalThis.addEventListener?.("pointermove", this._pointerMove);
    globalThis.addEventListener?.("pointerup", this._pointerUp); this.refreshCursor();
  }
  unregisterPointerEvents() {
    this._canvas.removeEventListener("pointerdown", this._pointerDown);
    globalThis.removeEventListener?.("pointermove", this._pointerMove);
    globalThis.removeEventListener?.("pointerup", this._pointerUp);
  }
  dragStart(event) {
    if (!this.isInteractive || !this.wheelHitTest(event)) return;
    event.preventDefault(); this.stop(); this._dragging = true;
    this._dragEvents = [{ angle: this.getAngleFromCenter(event), time: performance.now() }];
    this._canvas.setPointerCapture?.(event.pointerId); this._canvas.style.cursor = "grabbing";
  }
  dragMove(event) {
    if (!this._dragging) return; event.preventDefault();
    const now = performance.now(), angle = this.getAngleFromCenter(event);
    this.rotation += diffAngle(this._dragEvents.at(-1).angle, angle);
    this._dragEvents.push({ angle, time: now });
    this._dragEvents = this._dragEvents.filter(item => now - item.time <= DRAG_CAPTURE_PERIOD);
  }
  dragEnd(event) {
    if (!this._dragging) return; this._dragging = false;
    this._canvas.releasePointerCapture?.(event.pointerId); this.refreshCursor();
    if (this._dragEvents.length > 1) {
      const first = this._dragEvents[0], last = this._dragEvents.at(-1);
      const speed = this.limitSpeed(diffAngle(first.angle, last.angle) / Math.max(1, last.time - first.time) * 1000);
      if (Math.abs(speed) > 0.01) { this.spin(speed); return; }
    }
    this.raiseEvent_onRest();
  }

  raiseEvent_onCurrentIndexChange() { this.onCurrentIndexChange?.({ currentIndex: this._currentIndex }); }
  raiseEvent_onRest() { this.onRest?.({ currentIndex: this._currentIndex, rotation: this.rotation }); }
  raiseEvent_onSpin() { this.onSpin?.({ rotation: this.rotation }); }

  _set(property, value) {
    if (property === "items") {
      this._items = (value || []).map(item => {
        const result = item instanceof Item ? item : new Item(item); result._wheel = this; return result;
      });
    } else if (["image", "overlayImage"].includes(property)) {
      this._options[property] = loadImage(value, () => this.refresh());
    } else if (property === "offset") this._options.offset = { ...Defaults.wheel.offset, ...value };
    else this._options[property] = value;
    if (this._canvas) {
      if (property === "isInteractive") this.refreshCursor();
      if (["offset", "radius", "pixelRatio"].includes(property)) this.resize(); else this.refresh();
    }
  }
}

for (const property of Object.keys(Defaults.wheel)) {
  if (property === "items" || Object.getOwnPropertyDescriptor(Wheel.prototype, property)) continue;
  Object.defineProperty(Wheel.prototype, property, {
    get() { return this._options[property]; },
    set(value) {
      if (property === "rotation") value = fixFloat(value);
      if (property === "pointerAngle") value = addAngle(value);
      if (property === "rotationSpeedMax") value = Math.abs(value);
      this._set(property, value);
    },
  });
}
Object.defineProperty(Wheel.prototype, "items", {
  get() { return this._items; }, set(value) { this._set("items", value); },
});
Object.defineProperty(Wheel.prototype, "rotationSpeed", { get() { return this._rotationSpeed; } });

globalThis.Wheel = Wheel;
export { Wheel };
