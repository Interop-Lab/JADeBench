const arcAdjust = -90;
const baseCanvasSize = 500;
const dragCapturePeriod = 250;

const AlignText = Object.freeze({
  left: "left",
  right: "right",
  center: "center",
});

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

function getRandomInt(min = 0, max = 1) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min = 0, max = 1) {
  return Math.random() * (max - min) + min;
}

function degRad(degrees) {
  return degrees * Math.PI / 180;
}

function addAngle(angle, amount) {
  return ((angle + amount) % 360 + 360) % 360;
}

function diffAngle(a, b) {
  return (a - b + 540) % 360 - 180;
}

function isAngleBetween(angle, start, end) {
  angle = addAngle(angle, 0);
  start = addAngle(start, 0);
  end = addAngle(end, 0);

  if (start <= end) {
    return angle >= start && angle < end;
  }

  return angle >= start || angle < end;
}

function aveArray(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function setProp(target, name, value, defaultValue, validator) {
  const nextValue = value === undefined ? defaultValue : value;
  if (validator && !validator(nextValue)) {
    throw new Error(`Invalid value for ${name}`);
  }
  target[`_${name}`] = nextValue;
  return nextValue;
}

function fixFloat(value) {
  return parseFloat(Number(value).toFixed(10));
}

function easeSinOut(value) {
  return Math.sin(value * Math.PI / 2);
}

function getDistanceBetweenPoints(point1, point2) {
  return Math.hypot(point2.x - point1.x, point2.y - point1.y);
}

function getAngle(x1, y1, x2, y2) {
  return addAngle(Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI - arcAdjust, 0);
}

function isPointInCircle(point, center, radius) {
  return getDistanceBetweenPoints(point, center) <= radius;
}

function translateXYToElement(event, element) {
  const rect = element.getBoundingClientRect();
  const source = event.touches && event.touches.length
    ? event.touches[0]
    : event.changedTouches && event.changedTouches.length
      ? event.changedTouches[0]
      : event;

  return {
    x: source.clientX - rect.left,
    y: source.clientY - rect.top,
  };
}

function getMouseButtonsPressed(event) {
  if (typeof event.buttons === "number") return event.buttons;
  if (typeof event.which === "number") return event.which;
  return event.button === 0 ? 1 : 0;
}

function getFontSizeToFit(context, text, maxWidth, maxSize) {
  let low = 1;
  let high = Math.max(1, Math.floor(maxSize));
  let result = 1;

  while (low <= high) {
    const size = Math.floor((low + high) / 2);
    context.font = `${size}px sans-serif`;
    if (context.measureText(String(text)).width <= maxWidth) {
      result = size;
      low = size + 1;
    } else {
      high = size - 1;
    }
  }

  return result;
}

function calcWheelRotationForTargetAngle(
  currentRotation,
  targetAngle,
  direction = 1,
  revolutions = 0,
) {
  const current = addAngle(currentRotation, 0);
  const target = addAngle(targetAngle, 0);

  if (direction < 0) {
    return currentRotation - addAngle(current - target, 0) - revolutions * 360;
  }

  return currentRotation + addAngle(target - current, 0) + revolutions * 360;
}

let resizeObserver;

function getResizeObserver() {
  if (!resizeObserver && typeof ResizeObserver !== "undefined") {
    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const wheel = registeredWheels.get(entry.target);
        if (wheel) wheel.resize();
      }
    });
  }
  return resizeObserver;
}

const registeredWheels = new Map();

function register(wheel) {
  if (!wheel || !wheel.container) return;
  registeredWheels.set(wheel.container, wheel);
  const observer = getResizeObserver();
  if (observer) observer.observe(wheel.container);
}

function unregister(wheel) {
  if (!wheel || !wheel.container) return;
  registeredWheels.delete(wheel.container);
  const observer = getResizeObserver();
  if (observer) observer.unobserve(wheel.container);
}

function registerPointerEvents(wheel) {
  const canvas = wheel.canvas;

  canvas.addEventListener("pointerdown", wheel.dragStart);
  canvas.addEventListener("pointermove", wheel.dragMove);
  canvas.addEventListener("pointerup", wheel.dragEnd);
  canvas.addEventListener("pointercancel", wheel.dragEnd);
  canvas.addEventListener("pointerleave", wheel.dragEnd);
}

function loadImage(source, onLoad) {
  if (!source) return null;
  if (typeof HTMLImageElement !== "undefined" && source instanceof HTMLImageElement) {
    if (source.complete && onLoad) onLoad();
    else if (onLoad) source.addEventListener("load", onLoad, { once: true });
    return source;
  }
  if (typeof Image === "undefined") return source;

  const image = new Image();
  if (onLoad) image.addEventListener("load", onLoad, { once: true });
  image.src = source;
  return image;
}

class Item {
  constructor(props = {}) {
    this._wheel = null;
    this._startAngle = 0;
    this._endAngle = 0;
    this.init(props);
  }

  init(props = {}) {
    for (const name of Object.keys(Defaults.item)) {
      this[name] = props[name] === undefined ? Defaults.item[name] : props[name];
    }
    return this;
  }

  _refresh() {
    if (this._wheel) this._wheel.refresh();
  }

  get backgroundColor() {
    return this._backgroundColor;
  }

  set backgroundColor(value) {
    this._backgroundColor = value == null ? null : String(value);
    this._refresh();
  }

  get image() {
    return this._image;
  }

  set image(value) {
    this._image = loadImage(value, () => this._refresh());
    this._refresh();
  }

  get imageOpacity() {
    return this._imageOpacity;
  }

  set imageOpacity(value) {
    this._imageOpacity = Math.max(0, Math.min(1, Number(value)));
    this._refresh();
  }

  get imageRadius() {
    return this._imageRadius;
  }

  set imageRadius(value) {
    this._imageRadius = Math.max(0, Number(value));
    this._refresh();
  }

  get imageRotation() {
    return this._imageRotation;
  }

  set imageRotation(value) {
    this._imageRotation = Number(value);
    this._refresh();
  }

  get imageScale() {
    return this._imageScale;
  }

  set imageScale(value) {
    this._imageScale = Math.max(0, Number(value));
    this._refresh();
  }

  get label() {
    return this._label;
  }

  set label(value) {
    this._label = value == null ? "" : String(value);
    this._refresh();
  }

  get labelColor() {
    return this._labelColor;
  }

  set labelColor(value) {
    this._labelColor = value == null ? null : String(value);
    this._refresh();
  }

  get value() {
    return this._value;
  }

  set value(value) {
    this._value = value;
  }

  get weight() {
    return this._weight;
  }

  set weight(value) {
    const weight = Number(value);
    this._weight = Number.isFinite(weight) && weight > 0 ? weight : 1;
    this._refresh();
  }

  getIndex() {
    return this._wheel ? this._wheel.items.indexOf(this) : -1;
  }

  getCenterAngle() {
    return addAngle((this._startAngle + this._endAngle) / 2, 0);
  }

  getStartAngle() {
    return addAngle(this._startAngle, 0);
  }

  getEndAngle() {
    return addAngle(this._endAngle, 0);
  }

  getAngleFromCenter() {
    return this._wheel
      ? diffAngle(this.getCenterAngle(), this._wheel.getCenterAngle())
      : 0;
  }
}

class Wheel {
  constructor(container) {
    if (typeof container === "string") {
      container = document.querySelector(container);
    }
    if (!(container instanceof Element)) {
      throw new Error("Wheel container must be an Element");
    }

    this.container = container;
    this.canvas = document.createElement("canvas");
    this.context = this.canvas.getContext("2d");
    this.container.appendChild(this.canvas);

    this.canvas.style.display = "block";
    this.canvas.style.width = "100%";
    this.canvas.style.height = "100%";
    this.canvas.style.touchAction = "none";

    this._currentIndex = -1;
    this._frameRequest = null;
    this._lastFrameTime = 0;
    this._rotationSpeed = 0;
    this._dragging = false;
    this._dragEvents = [];
    this._spinTo = null;
    this._resting = true;

    this.dragStart = this.dragStart.bind(this);
    this.dragMove = this.dragMove.bind(this);
    this.dragEnd = this.dragEnd.bind(this);
    this.resize = this.resize.bind(this);
    this.animateRotation = this.animateRotation.bind(this);

    this.init(arguments[1] || {});
  }

  init(props = {}) {
    for (const name of Object.keys(Defaults.wheel)) {
      this[name] = props[name] === undefined
        ? Defaults.wheel[name]
        : props[name];
    }

    this.canvas.setAttribute("role", "img");
    register(this);
    registerPointerEvents(this);
    this.resize();
    this.refresh();
    return this;
  }

  remove() {
    this.stop();
    unregister(this);
    this.canvas.removeEventListener("pointerdown", this.dragStart);
    this.canvas.removeEventListener("pointermove", this.dragMove);
    this.canvas.removeEventListener("pointerup", this.dragEnd);
    this.canvas.removeEventListener("pointercancel", this.dragEnd);
    this.canvas.removeEventListener("pointerleave", this.dragEnd);
    this.canvas.remove();
  }

  resize() {
    const rect = this.container.getBoundingClientRect();
    const ratio = this.getActualPixelRatio();
    const size = Math.max(1, Math.min(
      rect.width || baseCanvasSize,
      rect.height || rect.width || baseCanvasSize,
    ));

    this._canvasSize = size;
    this.canvas.width = Math.round(size * ratio);
    this.canvas.height = Math.round(size * ratio);
    this.canvas.style.width = `${size}px`;
    this.canvas.style.height = `${size}px`;
    this.context.setTransform(ratio, 0, 0, ratio, 0, 0);
    this.refresh();
  }

  draw() {
    const context = this.context;
    const size = this._canvasSize || baseCanvasSize;
    const center = {
      x: size / 2 + this.getScaledNumber(this.offset.x),
      y: size / 2 + this.getScaledNumber(this.offset.y),
    };
    const radius = size / 2 * this.radius;

    context.clearRect(0, 0, size, size);
    context.save();
    context.translate(center.x, center.y);
    context.rotate(degRad(this.rotation + arcAdjust));

    if (this.image) {
      context.save();
      context.beginPath();
      context.arc(0, 0, radius, 0, Math.PI * 2);
      context.clip();
      context.drawImage(this.image, -radius, -radius, radius * 2, radius * 2);
      context.restore();
    } else {
      this.drawItemBackgrounds(radius);
    }

    this.drawItemImages(radius);
    this.drawItemLabels(radius);
    this.drawItemLines(radius);
    this.drawBorder(radius);

    context.restore();

    if (this.overlayImage) {
      context.drawImage(
        this.overlayImage,
        center.x - radius,
        center.y - radius,
        radius * 2,
        radius * 2,
      );
    }

    if (this.debug) this.drawDebug(center, radius);
  }

  drawItemBackgrounds(radius) {
    const context = this.context;
    for (const [index, item] of this.items.entries()) {
      const start = degRad(item._startAngle);
      const end = degRad(item._endAngle);
      context.beginPath();
      context.moveTo(0, 0);
      context.arc(0, 0, radius, start, end);
      context.closePath();
      context.fillStyle = item.backgroundColor
        || this.itemBackgroundColors[index % this.itemBackgroundColors.length];
      context.fill();
    }
  }

  drawItemImages(radius) {
    const context = this.context;

    for (const item of this.items) {
      if (!item.image) continue;

      const angle = degRad(item.getCenterAngle());
      const distance = radius * item.imageRadius;
      const width = item.image.naturalWidth || item.image.width || radius;
      const height = item.image.naturalHeight || item.image.height || radius;
      const maxDimension = radius * item.imageScale;
      const scale = maxDimension / Math.max(width, height);

      context.save();
      context.rotate(angle);
      context.translate(distance, 0);
      context.rotate(degRad(item.imageRotation - item.getCenterAngle()));
      context.globalAlpha = item.imageOpacity;
      context.drawImage(
        item.image,
        -width * scale / 2,
        -height * scale / 2,
        width * scale,
        height * scale,
      );
      context.restore();
    }
  }

  drawItemLabels(radius) {
    const context = this.context;
    const labelRadius = radius * this.itemLabelRadius;
    const maxWidth = Math.max(1, radius * this.itemLabelRadiusMax);
    const fontSize = Math.min(
      this.getScaledNumber(this.itemLabelFontSizeMax),
      getFontSizeToFit(
        context,
        this.items.reduce(
          (longest, item) => item.label.length > longest.length ? item.label : longest,
          "",
        ),
        maxWidth,
        this.getScaledNumber(this.itemLabelFontSizeMax),
      ),
    );

    context.font = `${fontSize}px ${this.itemLabelFont}`;
    context.textBaseline = "middle";
    context.lineJoin = "round";

    for (const [index, item] of this.items.entries()) {
      if (!item.label) continue;

      const angle = degRad(item.getCenterAngle());
      context.save();
      context.rotate(angle);
      context.translate(labelRadius, this.getScaledNumber(this.itemLabelBaselineOffset));
      context.rotate(degRad(this.itemLabelRotation));

      if (this.itemLabelAlign === AlignText.left) {
        context.textAlign = "left";
      } else if (this.itemLabelAlign === AlignText.center) {
        context.textAlign = "center";
      } else {
        context.textAlign = "right";
      }

      context.fillStyle = item.labelColor
        || this.itemLabelColors[index % this.itemLabelColors.length];

      if (this.itemLabelStrokeWidth > 0) {
        context.strokeStyle = this.itemLabelStrokeColor;
        context.lineWidth = this.getScaledNumber(this.itemLabelStrokeWidth);
        context.strokeText(item.label, 0, 0, maxWidth);
      }

      context.fillText(item.label, 0, 0, maxWidth);
      context.restore();
    }
  }

  drawItemLines(radius) {
    if (this.lineWidth <= 0) return;

    const context = this.context;
    context.strokeStyle = this.lineColor;
    context.lineWidth = this.getScaledNumber(this.lineWidth);

    for (const item of this.items) {
      const angle = degRad(item._startAngle);
      context.beginPath();
      context.moveTo(0, 0);
      context.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
      context.stroke();
    }
  }

  drawBorder(radius) {
    if (this.borderWidth <= 0) return;

    const context = this.context;
    context.beginPath();
    context.arc(0, 0, radius, 0, Math.PI * 2);
    context.strokeStyle = this.borderColor;
    context.lineWidth = this.getScaledNumber(this.borderWidth);
    context.stroke();
  }

  drawDebug(center, radius) {
    const context = this.context;

    context.save();
    context.translate(center.x, center.y);
    context.rotate(degRad(this.pointerAngle + arcAdjust));
    context.strokeStyle = Debugging.pointerLineColor;
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(radius, 0);
    context.stroke();

    context.strokeStyle = Debugging.labelRadiusColor;
    context.beginPath();
    context.arc(0, 0, radius * this.itemLabelRadius, 0, Math.PI * 2);
    context.stroke();
    context.restore();

    for (let index = 0; index < this._dragEvents.length; index++) {
      const event = this._dragEvents[index];
      context.fillStyle = `hsl(${Debugging.dragPointHue + index * 15}, 100%, 50%)`;
      context.beginPath();
      context.arc(event.x, event.y, 3, 0, Math.PI * 2);
      context.fill();
    }
  }

  animateRotation(time) {
    if (!this._lastFrameTime) this._lastFrameTime = time;
    const elapsed = Math.min(100, time - this._lastFrameTime);
    this._lastFrameTime = time;

    if (this._spinTo) {
      const spin = this._spinTo;
      const progress = Math.min(1, (time - spin.startTime) / spin.duration);
      this.rotation = spin.startRotation
        + (spin.targetRotation - spin.startRotation) * easeSinOut(progress);

      if (progress >= 1) {
        this._spinTo = null;
        this._rotationSpeed = 0;
      }
    } else if (!this._dragging && this._rotationSpeed !== 0) {
      this.rotation += this._rotationSpeed * elapsed / 1000;
      const resistance = Math.abs(this.rotationResistance) * elapsed / 1000;
      this._rotationSpeed += this._rotationSpeed > 0 ? -resistance : resistance;

      if (Math.abs(this._rotationSpeed) <= resistance) {
        this._rotationSpeed = 0;
      }
    }

    this.refresh();

    if (this._dragging || this._spinTo || this._rotationSpeed !== 0) {
      this._frameRequest = requestAnimationFrame(this.animateRotation);
    } else {
      this._frameRequest = null;
      this._lastFrameTime = 0;
      if (!this._resting) {
        this._resting = true;
        this.raiseEvent_onRest();
      }
    }
  }

  getRotationSpeedPlusDrag() {
    return this._rotationSpeed;
  }

  spin(speed = this.rotationSpeedMax) {
    this._spinTo = null;
    this._rotationSpeed = Math.max(
      -this.rotationSpeedMax,
      Math.min(this.rotationSpeedMax, Number(speed)),
    );
    this.beginSpin();
  }

  spinTo(rotation, duration = 3000) {
    this._spinTo = {
      startTime: performance.now(),
      startRotation: this.rotation,
      targetRotation: Number(rotation),
      duration: Math.max(1, Number(duration)),
    };
    this._rotationSpeed = 0;
    this.beginSpin();
  }

  spinToItem(index, duration = 3000, spinToCenter = true, revolutions = 2) {
    const item = this.items[index];
    if (!item) throw new Error(`Item ${index} does not exist`);

    const targetAngle = spinToCenter
      ? item.getCenterAngle()
      : getRandomFloat(item._startAngle, item._endAngle);

    const desiredRotation = addAngle(
      this.pointerAngle - targetAngle - arcAdjust,
      0,
    );

    this.spinTo(
      calcWheelRotationForTargetAngle(
        this.rotation,
        desiredRotation,
        1,
        revolutions,
      ),
      duration,
    );
  }

  stop() {
    this._rotationSpeed = 0;
    this._spinTo = null;
    if (this._frameRequest !== null) {
      cancelAnimationFrame(this._frameRequest);
      this._frameRequest = null;
    }
    this._lastFrameTime = 0;
    this.refresh();
  }

  getScaledNumber(value) {
    return Number(value) * (this._canvasSize || baseCanvasSize) / baseCanvasSize;
  }

  getActualPixelRatio() {
    return this.pixelRatio > 0
      ? this.pixelRatio
      : typeof window !== "undefined"
        ? window.devicePixelRatio || 1
        : 1;
  }

  getCenterAngle() {
    return addAngle(this.pointerAngle - this.rotation - arcAdjust, 0);
  }

  getItemAngles() {
    let angle = 0;
    const totalWeight = this.items.reduce((sum, item) => sum + item.weight, 0);

    for (const item of this.items) {
      item._startAngle = angle;
      angle += totalWeight ? item.weight / totalWeight * 360 : 0;
      item._endAngle = angle;
    }

    return this.items.map((item) => ({
      start: item.getStartAngle(),
      end: item.getEndAngle(),
      center: item.getCenterAngle(),
    }));
  }

  getCurrentIndex() {
    const angle = this.getCenterAngle();
    return this.items.findIndex((item) =>
      isAngleBetween(angle, item.getStartAngle(), item.getEndAngle()));
  }

  refresh() {
    if (!this.context) return;
    this.getItemAngles();
    this.refreshCurrentIndex();
    this.refreshAriaLabel();
    this.refreshCursor();
    this.draw();
  }

  refreshAriaLabel() {
    const item = this.items[this._currentIndex];
    this.canvas.setAttribute(
      "aria-label",
      item ? item.label || String(item.value ?? "") : "",
    );
  }

  refreshCurrentIndex() {
    const index = this.getCurrentIndex();
    if (index !== this._currentIndex) {
      this._currentIndex = index;
      this.raiseEvent_onCurrentIndexChange();
    }
  }

  refreshCursor() {
    this.canvas.style.cursor = this.isInteractive
      ? this._dragging
        ? "grabbing"
        : "grab"
      : "default";
  }

  beginSpin() {
    this._resting = false;
    this.raiseEvent_onSpin();
    if (this._frameRequest === null) {
      this._lastFrameTime = 0;
      this._frameRequest = requestAnimationFrame(this.animateRotation);
    }
  }

  wheelHitTest(point) {
    const size = this._canvasSize || baseCanvasSize;
    const center = {
      x: size / 2 + this.getScaledNumber(this.offset.x),
      y: size / 2 + this.getScaledNumber(this.offset.y),
    };
    return isPointInCircle(point, center, size / 2 * this.radius);
  }

  dragStart(event) {
    if (!this.isInteractive || !getMouseButtonsPressed(event)) return;

    const point = translateXYToElement(event, this.canvas);
    if (!this.wheelHitTest(point)) return;

    event.preventDefault();
    this.stop();
    this._dragging = true;
    this._resting = false;
    this._dragEvents = [{
      ...point,
      angle: this._getPointerAngle(point),
      rotation: this.rotation,
      time: performance.now(),
    }];

    if (this.canvas.setPointerCapture && event.pointerId !== undefined) {
      this.canvas.setPointerCapture(event.pointerId);
    }

    this.refreshCursor();
    this.beginSpin();
  }

  dragMove(event) {
    if (!this._dragging) return;
    event.preventDefault();

    const point = translateXYToElement(event, this.canvas);
    const now = performance.now();
    const previous = this._dragEvents[this._dragEvents.length - 1];
    const angle = this._getPointerAngle(point);

    this.rotation += diffAngle(angle, previous.angle);
    this._dragEvents.push({
      ...point,
      angle,
      rotation: this.rotation,
      time: now,
    });

    this._dragEvents = this._dragEvents.filter(
      (entry) => now - entry.time <= dragCapturePeriod,
    );

    this.refresh();
  }

  dragEnd(event) {
    if (!this._dragging) return;
    event.preventDefault();

    const now = performance.now();
    const events = this._dragEvents.filter(
      (entry) => now - entry.time <= dragCapturePeriod,
    );

    if (events.length > 1) {
      const first = events[0];
      const last = events[events.length - 1];
      const elapsed = Math.max(1, last.time - first.time);
      this._rotationSpeed = Math.max(
        -this.rotationSpeedMax,
        Math.min(
          this.rotationSpeedMax,
          (last.rotation - first.rotation) / elapsed * 1000,
        ),
      );
    }

    this._dragging = false;
    this._dragEvents = [];
    this.refreshCursor();

    if (this._rotationSpeed !== 0) {
      this.beginSpin();
    } else {
      this._resting = true;
      this.raiseEvent_onRest();
    }
  }

  _getPointerAngle(point) {
    const size = this._canvasSize || baseCanvasSize;
    return getAngle(
      size / 2 + this.getScaledNumber(this.offset.x),
      size / 2 + this.getScaledNumber(this.offset.y),
      point.x,
      point.y,
    );
  }

  raiseEvent_onCurrentIndexChange() {
    if (typeof this.onCurrentIndexChange === "function") {
      this.onCurrentIndexChange({
        currentIndex: this._currentIndex,
        wheel: this,
      });
    }
  }

  raiseEvent_onRest() {
    if (typeof this.onRest === "function") {
      this.onRest({
        currentIndex: this._currentIndex,
        wheel: this,
      });
    }
  }

  raiseEvent_onSpin() {
    if (typeof this.onSpin === "function") {
      this.onSpin({
        currentIndex: this._currentIndex,
        wheel: this,
      });
    }
  }

  get borderColor() {
    return this._borderColor;
  }

  set borderColor(value) {
    this._borderColor = String(value);
    this.refresh();
  }

  get borderWidth() {
    return this._borderWidth;
  }

  set borderWidth(value) {
    this._borderWidth = Math.max(0, Number(value));
    this.refresh();
  }

  get debug() {
    return this._debug;
  }

  set debug(value) {
    this._debug = Boolean(value);
    this.refresh();
  }

  get image() {
    return this._image;
  }

  set image(value) {
    this._image = loadImage(value, () => this.refresh());
    this.refresh();
  }

  get isInteractive() {
    return this._isInteractive;
  }

  set isInteractive(value) {
    this._isInteractive = Boolean(value);
    this.refreshCursor();
  }

  get itemBackgroundColors() {
    return this._itemBackgroundColors;
  }

  set itemBackgroundColors(value) {
    this._itemBackgroundColors = Array.isArray(value) && value.length
      ? value.map(String)
      : [...Defaults.wheel.itemBackgroundColors];
    this.refresh();
  }

  get itemLabelAlign() {
    return this._itemLabelAlign;
  }

  set itemLabelAlign(value) {
    this._itemLabelAlign = Object.values(AlignText).includes(value)
      ? value
      : Defaults.wheel.itemLabelAlign;
    this.refresh();
  }

  get itemLabelBaselineOffset() {
    return this._itemLabelBaselineOffset;
  }

  set itemLabelBaselineOffset(value) {
    this._itemLabelBaselineOffset = Number(value);
    this.refresh();
  }

  get itemLabelColors() {
    return this._itemLabelColors;
  }

  set itemLabelColors(value) {
    this._itemLabelColors = Array.isArray(value) && value.length
      ? value.map(String)
      : [...Defaults.wheel.itemLabelColors];
    this.refresh();
  }

  get itemLabelFont() {
    return this._itemLabelFont;
  }

  set itemLabelFont(value) {
    this._itemLabelFont = String(value);
    this.refresh();
  }

  get itemLabelFontSizeMax() {
    return this._itemLabelFontSizeMax;
  }

  set itemLabelFontSizeMax(value) {
    this._itemLabelFontSizeMax = Math.max(1, Number(value));
    this.refresh();
  }

  get itemLabelRadius() {
    return this._itemLabelRadius;
  }

  set itemLabelRadius(value) {
    this._itemLabelRadius = Number(value);
    this.refresh();
  }

  get itemLabelRadiusMax() {
    return this._itemLabelRadiusMax;
  }

  set itemLabelRadiusMax(value) {
    this._itemLabelRadiusMax = Math.max(0, Number(value));
    this.refresh();
  }

  get itemLabelRotation() {
    return this._itemLabelRotation;
  }

  set itemLabelRotation(value) {
    this._itemLabelRotation = Number(value);
    this.refresh();
  }

  get itemLabelStrokeColor() {
    return this._itemLabelStrokeColor;
  }

  set itemLabelStrokeColor(value) {
    this._itemLabelStrokeColor = String(value);
    this.refresh();
  }

  get itemLabelStrokeWidth() {
    return this._itemLabelStrokeWidth;
  }

  set itemLabelStrokeWidth(value) {
    this._itemLabelStrokeWidth = Math.max(0, Number(value));
    this.refresh();
  }

  get items() {
    return this._items;
  }

  set items(value) {
    const items = Array.isArray(value) ? value : [];
    this._items = items.map((item) => {
      const result = item instanceof Item ? item : new Item(item);
      result._wheel = this;
      return result;
    });
    this.getItemAngles();
    this.refresh();
  }

  get lineColor() {
    return this._lineColor;
  }

  set lineColor(value) {
    this._lineColor = String(value);
    this.refresh();
  }

  get lineWidth() {
    return this._lineWidth;
  }

  set lineWidth(value) {
    this._lineWidth = Math.max(0, Number(value));
    this.refresh();
  }

  get offset() {
    return this._offset;
  }

  set offset(value) {
    this._offset = isObject(value)
      ? { x: Number(value.x) || 0, y: Number(value.y) || 0 }
      : { ...Defaults.wheel.offset };
    this.refresh();
  }

  get onCurrentIndexChange() {
    return this._onCurrentIndexChange;
  }

  set onCurrentIndexChange(value) {
    this._onCurrentIndexChange = typeof value === "function" ? value : null;
  }

  get onRest() {
    return this._onRest;
  }

  set onRest(value) {
    this._onRest = typeof value === "function" ? value : null;
  }

  get onSpin() {
    return this._onSpin;
  }

  set onSpin(value) {
    this._onSpin = typeof value === "function" ? value : null;
  }

  get overlayImage() {
    return this._overlayImage;
  }

  set overlayImage(value) {
    this._overlayImage = loadImage(value, () => this.refresh());
    this.refresh();
  }

  get pixelRatio() {
    return this._pixelRatio;
  }

  set pixelRatio(value) {
    this._pixelRatio = Math.max(0, Number(value));
  }

  get pointerAngle() {
    return this._pointerAngle;
  }

  set pointerAngle(value) {
    this._pointerAngle = addAngle(Number(value), 0);
    this.refresh();
  }

  get radius() {
    return this._radius;
  }

  set radius(value) {
    this._radius = Math.max(0, Number(value));
    this.refresh();
  }

  get rotation() {
    return this._rotation;
  }

  set rotation(value) {
    this._rotation = fixFloat(Number(value));
    this.refreshCurrentIndex();
  }

  get rotationResistance() {
    return this._rotationResistance;
  }

  set rotationResistance(value) {
    this._rotationResistance = Number(value);
  }

  get rotationSpeed() {
    return this._rotationSpeed;
  }

  get rotationSpeedMax() {
    return this._rotationSpeedMax;
  }

  set rotationSpeedMax(value) {
    this._rotationSpeedMax = Math.max(0, Number(value));
  }
}

export { Wheel };
