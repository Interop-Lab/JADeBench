const arcAdjust = -90;
const baseCanvasSize = 1000;
const dragCapturePeriod = 100;

const AlignText = Object.freeze({
  left: "left",
  center: "center",
  right: "right",
});

const Defaults = Object.freeze({
  wheel: Object.freeze({
    borderColor: "#000000",
    borderWidth: 0,
    debug: false,
    image: null,
    isInteractive: true,
    itemBackgroundColors: ["#ffffff"],
    itemLabelAlign: AlignText.right,
    itemLabelBaselineOffset: -0.07,
    itemLabelColors: ["#000000"],
    itemLabelFont: "sans-serif",
    itemLabelFontSize: 100,
    itemLabelRadius: 0.85,
    itemLabelRadiusMax: 0.2,
    itemLabelRotation: 0,
    itemLabelStrokeColor: "#ffffff",
    itemLabelStrokeWidth: 0,
    items: [],
    lineColor: "#000000",
    lineWidth: 1,
    offset: { x: 0, y: 0 },
    onCurrentIndexChange: null,
    onRest: null,
    onSpin: null,
    overlayImage: null,
    pixelRatio: 0,
    radius: 0.95,
    rotation: 0,
    rotationResistance: -35,
    rotationSpeedMax: 500,
  }),
  item: Object.freeze({
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
  }),
});

const Debugging = Object.freeze({
  pointerColor: "rgba(255, 0, 0, 0.5)",
  spinDirectionArrowColor: "rgba(0, 128, 255, 0.8)",
  spinDirectionLineColor: "rgba(0, 128, 255, 0.35)",
  spinDirectionLineWidth: 300,
});

function isObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNumber(value) {
  return typeof value === "number" && !Number.isNaN(value);
}

function setProp({
  val,
  isValid,
  errorMessage,
  defaultValue,
  action = null,
}) {
  if (isValid) return action ? action() : val;
  if (val === undefined) return defaultValue;
  throw new Error(errorMessage);
}

function fixFloat(value = 0) {
  return Number(value.toFixed(9));
}

function degRad(degrees = 0) {
  return (degrees * Math.PI) / 180;
}

function addAngle(angle = 0, amount = 0) {
  let result = angle + amount;
  result = result > 360 ? result % 360 : 360 + (result % 360);
  if (result === 360) result = 0;
  return result;
}

function diffAngle(angle1 = 0, angle2 = 0) {
  return 180 - addAngle(angle1, 180 - angle2);
}

function isAngleBetween(angle, start, end) {
  if (start < end) return start <= angle && angle < end;
  return start <= angle || angle < end;
}

function easeSinOut(value) {
  return Math.sin((value * Math.PI) / 2);
}

function getRandomFloat(min = 0, max = 0, decimalPlaces = 0) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimalPlaces));
}

function getAngle(x1, y1, x2, y2) {
  const x = x1 - x2;
  const y = y1 - y2;
  let angle = Math.atan2(-y, -x) * (180 / Math.PI);
  if (angle < 0) angle += 360;
  return angle;
}

function getDistanceBetweenPoints(point1 = { x: 0, y: 0 }, point2 = { x: 0, y: 0 }) {
  return Math.hypot(point2.x - point1.x, point2.y - point1.y);
}

function isPointInCircle(point = { x: 0, y: 0 }, centerX, centerY, radius) {
  return (
    (point.x - centerX) ** 2 + (point.y - centerY) ** 2 <= radius ** 2
  );
}

function translateXYToElement(point = { x: 0, y: 0 }, element = {}, scale = 1) {
  const bounds = element.getBoundingClientRect();
  return {
    x: (point.x - bounds.left) * scale,
    y: (point.y - bounds.top) * scale,
  };
}

function getFontSizeToFit(text, fontSize, width, context) {
  context.save();
  context.font = `${fontSize}px sans-serif`;
  const measuredWidth = context.measureText(text).width;
  context.restore();
  return width / measuredWidth;
}

function calcWheelRotationForTargetAngle(
  currentRotation = 0,
  targetAngle = 0,
  direction = 1,
) {
  let delta = fixFloat(((currentRotation % 360) + targetAngle) % 360);
  delta = ((direction === 1 ? 360 - delta : 0 - delta) % 360) * direction;
  return currentRotation + delta;
}

function getResizeObserver(element, callback) {
  if (typeof window === "undefined") return { stop() {} };

  if ("ResizeObserver" in window) {
    const observer = new ResizeObserver(() => callback({ redraw: true }));
    observer.observe(element);
    return {
      stop() {
        observer.unobserve(element);
        observer.disconnect();
      },
    };
  }

  window.addEventListener("resize", callback);
  return {
    stop() {
      window.removeEventListener("resize", callback);
    },
  };
}

class Item {
  constructor(wheel, props = {}) {
    if (!isObject(wheel)) throw new Error("wheel must be an object");
    if (!isObject(props) && props !== null) {
      throw new Error("item properties must be an object");
    }

    this._wheel = wheel;

    for (const key of Object.keys(Defaults.item)) {
      this[`_${key}`] = Defaults.item[key];
    }

    this._path = null;
    this.set(props || Defaults.item);
  }

  set(props = {}) {
    for (const key of Object.keys(Defaults.item)) {
      if (key in props) this[key] = props[key];
    }
  }

  get index() {
    const index = this._wheel.items.indexOf(this);
    if (index === -1) throw new Error("Item is not part of the wheel");
    return index;
  }

  get angle() {
    const range = this._wheel._getItemAngles()[this.index];
    return range.start + (range.end - range.start) / 2;
  }

  get angleStart() {
    return this._wheel._getItemAngles()[this.index].start;
  }

  get angleEnd() {
    return this._wheel._getItemAngles()[this.index].end;
  }

  get randomAngle() {
    return getRandomFloat(this.angleStart, this.angleEnd);
  }

  get backgroundColor() {
    return this._backgroundColor;
  }

  set backgroundColor(value) {
    this._backgroundColor =
      typeof value === "string" ? value : Defaults.item.backgroundColor;
    this._wheel?.draw();
  }

  get image() {
    return this._image;
  }

  set image(value) {
    this._image =
      typeof HTMLImageElement !== "undefined" &&
      value instanceof HTMLImageElement
        ? value
        : Defaults.item.image;

    if (this._image) {
      this._image.addEventListener("load", () => this._wheel?.draw(), {
        once: true,
      });
    }

    this._wheel?.draw();
  }

  get imageOpacity() {
    return this._imageOpacity;
  }

  set imageOpacity(value) {
    this._imageOpacity =
      typeof value === "number" ? value : Defaults.item.imageOpacity;
    this._wheel?.draw();
  }

  get imageRadius() {
    return this._imageRadius;
  }

  set imageRadius(value) {
    this._imageRadius =
      typeof value === "number" ? value : Defaults.item.imageRadius;
    this._wheel?.draw();
  }

  get imageRotation() {
    return this._imageRotation;
  }

  set imageRotation(value) {
    this._imageRotation =
      typeof value === "number" ? value : Defaults.item.imageRotation;
    this._wheel?.draw();
  }

  get imageScale() {
    return this._imageScale;
  }

  set imageScale(value) {
    this._imageScale =
      typeof value === "number" ? value : Defaults.item.imageScale;
    this._wheel?.draw();
  }

  get label() {
    return this._label;
  }

  set label(value) {
    this._label = value !== undefined ? value : Defaults.item.label;
  }

  get labelColor() {
    return this._labelColor;
  }

  set labelColor(value) {
    this._labelColor =
      typeof value === "string" ? value : Defaults.item.labelColor;
    this._wheel?.draw();
  }

  get value() {
    return this._value;
  }

  set value(value) {
    this._value = value !== undefined ? value : Defaults.item.value;
  }

  get weight() {
    return this._weight;
  }

  set weight(value) {
    this._weight =
      typeof value === "number" ? value : Defaults.item.weight;
    this._wheel?.resize();
  }
}

class Wheel {
  constructor(container, props = {}) {
    if (
      typeof Element === "undefined" ||
      !(container instanceof Element)
    ) {
      throw new Error("container must be an Element");
    }

    if (!isObject(props) && props !== null) {
      throw new Error("wheel properties must be an object");
    }

    this._container = container;
    this._canvas = null;
    this._ctx = null;
    this._resizeObserver = null;
    this._animationFrame = null;
    this._dragging = false;
    this._dragEvents = [];
    this._currentIndex = -1;
    this._rotationSpeed = 0;
    this._rotationDirection = 1;
    this._spinStartTime = null;
    this._spinStartRotation = 0;
    this._spinTargetRotation = 0;
    this._spinDuration = 0;
    this._spinEasing = easeSinOut;
    this._isSpinTo = false;
    this._isRemoved = false;

    for (const key of Object.keys(Defaults.wheel)) {
      this[`_${key}`] = Defaults.wheel[key];
    }

    this.init(container);
    this.set(props || Defaults.wheel);
  }

  init(container) {
    this._container = container;
    this._canvas = document.createElement("canvas");
    this._ctx = this._canvas.getContext("2d");
    this._canvas.style.display = "block";
    this._canvas.style.width = "100%";
    this._canvas.style.height = "100%";
    this._container.appendChild(this._canvas);

    this._onPointerDown = this._handlePointerDown.bind(this);
    this._onPointerMove = this._handlePointerMove.bind(this);
    this._onPointerUp = this._handlePointerUp.bind(this);

    this._canvas.addEventListener("pointerdown", this._onPointerDown);
    this._canvas.addEventListener("touchstart", this._onPointerDown, {
      passive: false,
    });

    this._resizeObserver = getResizeObserver(this._container, () => {
      this.resize();
      this.draw(performance.now());
    });

    this.resize();
  }

  remove() {
    if (this._isRemoved) return;

    this.stop();
    this._resizeObserver?.stop();

    this._canvas?.removeEventListener("pointerdown", this._onPointerDown);
    this._canvas?.removeEventListener("touchstart", this._onPointerDown);

    if (typeof document !== "undefined") {
      document.removeEventListener("pointermove", this._onPointerMove);
      document.removeEventListener("pointerup", this._onPointerUp);
      document.removeEventListener("pointercancel", this._onPointerUp);
      document.removeEventListener("touchmove", this._onPointerMove);
      document.removeEventListener("touchend", this._onPointerUp);
      document.removeEventListener("touchcancel", this._onPointerUp);
    }

    this._canvas?.remove();
    this._canvas = null;
    this._ctx = null;
    this._isRemoved = true;
  }

  set(props = {}) {
    for (const key of Object.keys(Defaults.wheel)) {
      if (key in props) this[key] = props[key];
    }
  }

  resize() {
    if (!this._canvas || !this._ctx) return;

    const width = this._container.clientWidth;
    const height = this._container.clientHeight;
    const ratio =
      this._pixelRatio > 0
        ? this._pixelRatio
        : typeof window !== "undefined"
          ? window.devicePixelRatio || 1
          : 1;

    this._canvas.width = Math.max(1, Math.round(width * ratio));
    this._canvas.height = Math.max(1, Math.round(height * ratio));
    this._canvas.style.width = `${width}px`;
    this._canvas.style.height = `${height}px`;

    this._pixelScale = Math.min(
      this._canvas.width / baseCanvasSize,
      this._canvas.height / baseCanvasSize,
    );

    const diameter = Math.min(this._canvas.width, this._canvas.height);
    this._center = {
      x:
        this._canvas.width / 2 +
        (this._canvas.width * this._offset.x) / 2,
      y:
        this._canvas.height / 2 +
        (this._canvas.height * this._offset.y) / 2,
    };
    this._actualRadius = (diameter / 2) * this._radius;
    this._labelRadius = this._actualRadius * this._itemLabelRadius;
    this._labelMaxWidth =
      this._actualRadius *
      Math.max(0, this._itemLabelRadius - this._itemLabelRadiusMax);
    this._actualFontSize =
      this._itemLabelFontSize * this._pixelScale;

    this.draw();
  }

  draw(timestamp = 0) {
    this._animationFrame = null;
    if (!this._ctx || !this._canvas) return;

    if (this._spinStartTime !== null) this._updateAnimation(timestamp);

    const ctx = this._ctx;
    ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);

    const angles = this._getItemAngles();
    this._createItemPaths(angles);

    ctx.save();
    ctx.translate(this._center.x, this._center.y);
    ctx.rotate(degRad(this._rotation));

    this._drawItemBackgrounds(ctx, angles);
    this._drawItemImages(ctx, angles);
    this._drawItemLabels(ctx, angles);
    this._drawLines(ctx, angles);

    ctx.restore();

    this._drawImage(ctx, this._image, false);
    this._drawImage(ctx, this._overlayImage, true);

    if (this._debug) this._drawDebug(ctx);

    this._updateCurrentIndex(angles);

    if (this._spinStartTime !== null && !this._animationFrame) {
      this._animationFrame = requestAnimationFrame((time) => this.draw(time));
    }
  }

  _drawItemBackgrounds(ctx, angles) {
    for (const [index, angle] of angles.entries()) {
      const item = this._items[index];
      ctx.beginPath();
      ctx.moveTo(this._center.x - this._center.x, this._center.y - this._center.y);
      ctx.arc(
        0,
        0,
        this._actualRadius,
        degRad(angle.start + arcAdjust),
        degRad(angle.end + arcAdjust),
      );
      ctx.closePath();
      ctx.fillStyle =
        item.backgroundColor ??
        this._itemBackgroundColors[
          index % this._itemBackgroundColors.length
        ];
      ctx.fill();
    }
  }

  _drawLines(ctx, angles) {
    if (this._lineWidth <= 0) return;

    ctx.save();
    ctx.strokeStyle = this._lineColor;
    ctx.lineWidth = this._lineWidth * this._pixelScale;

    for (const angle of angles) {
      ctx.beginPath();
      ctx.rotate(degRad(angle.start + arcAdjust));
      ctx.moveTo(0, 0);
      ctx.lineTo(this._actualRadius, 0);
      ctx.stroke();
      ctx.rotate(-degRad(angle.start + arcAdjust));
    }

    if (this._borderWidth > 0) {
      ctx.beginPath();
      ctx.arc(0, 0, this._actualRadius, 0, Math.PI * 2);
      ctx.strokeStyle = this._borderColor;
      ctx.lineWidth = this._borderWidth * this._pixelScale;
      ctx.stroke();
    }

    ctx.restore();
  }

  _drawItemLabels(ctx, angles) {
    for (const [index, angle] of angles.entries()) {
      const item = this._items[index];
      const text = String(item.label ?? "");
      if (!text) continue;

      const centerAngle = angle.start + (angle.end - angle.start) / 2;

      ctx.save();
      ctx.rotate(degRad(centerAngle + arcAdjust));
      ctx.translate(this._labelRadius, 0);
      ctx.rotate(degRad(this._itemLabelRotation));

      let fontSize = this._actualFontSize;
      ctx.font = `${fontSize}px ${this._itemLabelFont}`;

      const availableWidth = Math.max(
        1,
        this._actualRadius - this._labelRadius,
      );
      const measured = ctx.measureText(text).width;
      if (measured > availableWidth) {
        fontSize *= availableWidth / measured;
        ctx.font = `${fontSize}px ${this._itemLabelFont}`;
      }

      ctx.textAlign = this._itemLabelAlign;
      ctx.textBaseline = "middle";
      ctx.fillStyle =
        item.labelColor ??
        this._itemLabelColors[index % this._itemLabelColors.length];

      const y = fontSize * this._itemLabelBaselineOffset;

      if (this._itemLabelStrokeWidth > 0) {
        ctx.lineWidth = this._itemLabelStrokeWidth * this._pixelScale;
        ctx.strokeStyle = this._itemLabelStrokeColor;
        ctx.strokeText(text, 0, y, availableWidth);
      }

      ctx.fillText(text, 0, y, availableWidth);
      ctx.restore();
    }
  }

  _drawItemImages(ctx, angles) {
    for (const [index, angle] of angles.entries()) {
      const item = this._items[index];
      const image = item.image;
      if (!image || !image.complete || !image.naturalWidth) continue;

      const centerAngle = angle.start + (angle.end - angle.start) / 2;
      const radius = this._actualRadius * item.imageRadius;
      const size =
        Math.min(this._actualRadius, this._actualRadius * item.imageScale) *
        0.5;

      ctx.save();
      ctx.rotate(degRad(centerAngle + arcAdjust));
      ctx.translate(radius, 0);
      ctx.rotate(degRad(item.imageRotation));
      ctx.globalAlpha = item.imageOpacity;
      ctx.drawImage(image, -size / 2, -size / 2, size, size);
      ctx.restore();
    }
  }

  _drawImage(ctx, image, overlay) {
    if (!image || !image.complete || !image.naturalWidth) return;

    const size = overlay
      ? this._actualRadius * 2
      : Math.min(this._canvas.width, this._canvas.height);

    ctx.save();
    ctx.translate(this._center.x, this._center.y);
    if (!overlay) ctx.rotate(degRad(this._rotation));
    ctx.drawImage(image, -size / 2, -size / 2, size, size);
    ctx.restore();
  }

  _drawDebug(ctx) {
    ctx.save();
    ctx.translate(this._center.x, this._center.y);
    ctx.rotate(degRad(this._pointerAngle + arcAdjust));

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(this._actualRadius, 0);
    ctx.strokeStyle = Debugging.pointerColor;
    ctx.lineWidth = Math.max(1, this._pixelScale);
    ctx.stroke();

    ctx.restore();
  }

  _createItemPaths(angles) {
    if (typeof Path2D === "undefined") return;

    for (const [index, angle] of angles.entries()) {
      const path = new Path2D();
      path.moveTo(this._center.x, this._center.y);
      path.arc(
        this._center.x,
        this._center.y,
        this._actualRadius,
        degRad(angle.start + this._rotation + arcAdjust),
        degRad(angle.end + this._rotation + arcAdjust),
      );
      path.closePath();
      this._items[index]._path = path;
    }
  }

  _getItemAngles(startAngle = 0) {
    let totalWeight = 0;
    for (const item of this._items) totalWeight += item.weight;

    const degreesPerWeight = 360 / totalWeight;
    let angle = startAngle;
    const ranges = [];

    for (const item of this._items) {
      const size = item.weight * degreesPerWeight;
      ranges.push({ start: angle, end: angle + size });
      angle += size;
    }

    if (ranges.length) ranges[ranges.length - 1].end = startAngle + 360;
    return ranges;
  }

  _updateCurrentIndex(angles = this._getItemAngles()) {
    if (!angles.length) {
      this._currentIndex = -1;
      return;
    }

    const wheelAngle = addAngle(this._pointerAngle, -this._rotation);
    let index = -1;

    for (const [itemIndex, range] of angles.entries()) {
      if (
        isAngleBetween(
          wheelAngle,
          addAngle(range.start, 0),
          addAngle(range.end, 0),
        )
      ) {
        index = itemIndex;
        break;
      }
    }

    if (index !== this._currentIndex) {
      this._currentIndex = index;
      this._onCurrentIndexChange?.({
        type: "currentIndexChange",
        currentIndex: index,
      });
    }
  }

  _updateAnimation(now) {
    if (this._isSpinTo) {
      const elapsed = now - this._spinStartTime;
      if (elapsed >= this._spinDuration) {
        this._rotation = this._spinTargetRotation;
        this._finishSpin();
        return;
      }

      const progress = elapsed / this._spinDuration;
      this._rotation =
        this._spinStartRotation +
        (this._spinTargetRotation - this._spinStartRotation) *
          this._spinEasing(progress);
      return;
    }

    if (this._spinStartTime === null) return;

    const elapsed = Math.max(0, now - this._spinStartTime) / 1000;
    this._spinStartTime = now;

    this._rotation += this._rotationSpeed * elapsed;

    const resistance = Math.abs(this._rotationResistance) * elapsed;
    if (this._rotationSpeed > 0) {
      this._rotationSpeed = Math.max(0, this._rotationSpeed - resistance);
    } else {
      this._rotationSpeed = Math.min(0, this._rotationSpeed + resistance);
    }

    if (this._rotationSpeed === 0) this._finishSpin();
  }

  _finishSpin() {
    this._spinStartTime = null;
    this._rotationSpeed = 0;
    this._isSpinTo = false;
    this._animationFrame = null;
    this._updateCurrentIndex();
    this._onRest?.({
      type: "rest",
      currentIndex: this._currentIndex,
      rotation: this._rotation,
    });
  }

  spin(speed = 0) {
    if (!isNumber(speed)) throw new Error("speed must be a number");

    this.stop();
    this._rotationSpeed = Math.max(
      -this._rotationSpeedMax,
      Math.min(this._rotationSpeedMax, speed),
    );
    this._spinStartTime = performance.now();
    this._isSpinTo = false;

    this._onSpin?.({
      type: "spin",
      method: "spin",
      rotationSpeed: this._rotationSpeed,
      rotationResistance: this._rotationResistance,
    });

    this._requestDraw();
  }

  spinTo(rotation = 0, duration = 0, easingFunction = null) {
    if (!isNumber(rotation)) throw new Error("rotation must be a number");
    if (!isNumber(duration)) throw new Error("duration must be a number");

    this.stop();

    this._spinStartRotation = this._rotation;
    this._spinTargetRotation = rotation;
    this._spinDuration = Math.max(0, duration);
    this._spinEasing = easingFunction || easeSinOut;
    this._spinStartTime = performance.now();
    this._isSpinTo = true;

    this._onSpin?.({
      type: "spin",
      method: "spinTo",
      targetRotation: rotation,
      duration,
    });

    this._requestDraw();
  }

  spinToItem(
    itemIndex = 0,
    duration = 0,
    spinToCenter = true,
    numberOfRevolutions = 1,
    direction = 1,
    easingFunction = null,
  ) {
    this.stop();

    const angles = this._getItemAngles();
    const item = angles[itemIndex];
    if (!item) throw new Error("itemIndex is out of range");

    const targetAngle = spinToCenter
      ? item.start + (item.end - item.start) / 2
      : getRandomFloat(item.start, item.end);

    let targetRotation = calcWheelRotationForTargetAngle(
      this._rotation,
      targetAngle - this._pointerAngle,
      direction,
    );

    targetRotation += numberOfRevolutions * 360 * direction;
    this.spinTo(targetRotation, duration, easingFunction);

    this._onSpin?.({
      type: "spin",
      method: "spinToItem",
      itemIndex,
      targetRotation,
      duration,
    });
  }

  stop() {
    if (
      this._animationFrame !== null &&
      typeof cancelAnimationFrame === "function"
    ) {
      cancelAnimationFrame(this._animationFrame);
    }

    this._animationFrame = null;
    this._spinStartTime = null;
    this._rotationSpeed = 0;
    this._isSpinTo = false;
  }

  _requestDraw() {
    if (this._animationFrame !== null || !this._ctx) return;
    this._animationFrame = requestAnimationFrame((time) => this.draw(time));
  }

  _eventPoint(event) {
    const source = event.touches?.[0] ?? event.changedTouches?.[0] ?? event;
    return { x: source.clientX, y: source.clientY };
  }

  _handlePointerDown(event) {
    if (!this._isInteractive || !this._canvas) return;

    const point = this._eventPoint(event);
    if (!this.isPointInside(point)) return;

    event.preventDefault?.();
    this.stop();

    const translated = translateXYToElement(
      point,
      this._canvas,
      this._canvas.width / this._canvas.clientWidth,
    );

    this._dragging = true;
    this._dragEvents = [
      {
        distance: 0,
        x: translated.x,
        y: translated.y,
        now: performance.now(),
      },
    ];

    document.addEventListener("pointermove", this._onPointerMove);
    document.addEventListener("pointerup", this._onPointerUp);
    document.addEventListener("pointercancel", this._onPointerUp);
    document.addEventListener("touchmove", this._onPointerMove, {
      passive: false,
    });
    document.addEventListener("touchend", this._onPointerUp);
    document.addEventListener("touchcancel", this._onPointerUp);
  }

  _handlePointerMove(event) {
    if (!this._dragging || !this._canvas) return;

    event.preventDefault?.();

    const point = translateXYToElement(
      this._eventPoint(event),
      this._canvas,
      this._canvas.width / this._canvas.clientWidth,
    );

    const previous = this._dragEvents[this._dragEvents.length - 1];
    const previousAngle = this.getAngleFromCenter(previous);
    const currentAngle = this.getAngleFromCenter(point);
    const distance = diffAngle(previousAngle, currentAngle);

    this._dragEvents.push({
      distance,
      x: point.x,
      y: point.y,
      now: performance.now(),
    });

    while (
      this._dragEvents.length > 2 &&
      performance.now() - this._dragEvents[0].now > dragCapturePeriod
    ) {
      this._dragEvents.shift();
    }

    this._rotation += distance;
    this.draw();
  }

  _handlePointerUp(event) {
    if (!this._dragging) return;

    event.preventDefault?.();
    this._dragging = false;

    document.removeEventListener("pointermove", this._onPointerMove);
    document.removeEventListener("pointerup", this._onPointerUp);
    document.removeEventListener("pointercancel", this._onPointerUp);
    document.removeEventListener("touchmove", this._onPointerMove);
    document.removeEventListener("touchend", this._onPointerUp);
    document.removeEventListener("touchcancel", this._onPointerUp);

    const now = performance.now();
    let distance = 0;
    let firstTime = now;

    for (const entry of this._dragEvents) {
      if (now - entry.now <= dragCapturePeriod) {
        distance += entry.distance;
        firstTime = Math.min(firstTime, entry.now);
      }
    }

    this._dragEvents = [];
    this.draw();

    const elapsed = now - firstTime;
    if (elapsed <= 0 || distance === 0) return;

    this.spin((distance * 1000) / elapsed, "drag");
  }

  isPointInside(point = { x: 0, y: 0 }) {
    if (!this._canvas) return false;

    const translated = translateXYToElement(
      point,
      this._canvas,
      this._canvas.width / this._canvas.clientWidth,
    );

    return isPointInCircle(
      translated,
      this._center.x,
      this._center.y,
      this._actualRadius,
    );
  }

  getAngleFromCenter(point = { x: 0, y: 0 }) {
    return addAngle(
      getAngle(this._center.x, this._center.y, point.x, point.y),
      -270,
    );
  }

  getCurrentIndex() {
    return this._currentIndex;
  }

  getCurrentItem() {
    return this._items[this._currentIndex];
  }

  get rotation() {
    return this._rotation;
  }

  set rotation(value) {
    this._rotation = setProp({
      val: value,
      isValid: isNumber(value),
      errorMessage: "rotation must be a number",
      defaultValue: Defaults.wheel.rotation,
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
      errorMessage: "items must be an array",
      defaultValue: Defaults.wheel.items,
      action: () => value.map((item) => new Item(this, item)),
    });
    this.resize();
    this._updateCurrentIndex(this._getItemAngles());
    this.draw();
  }

  get borderColor() {
    return this._borderColor;
  }

  set borderColor(value) {
    this._borderColor =
      typeof value === "string" ? value : Defaults.wheel.borderColor;
    this.draw();
  }

  get borderWidth() {
    return this._borderWidth;
  }

  set borderWidth(value) {
    this._borderWidth =
      isNumber(value) && value >= 0 ? value : Defaults.wheel.borderWidth;
    this.draw();
  }

  get debug() {
    return this._debug;
  }

  set debug(value) {
    this._debug =
      typeof value === "boolean" ? value : Defaults.wheel.debug;
    this.draw();
  }

  get image() {
    return this._image;
  }

  set image(value) {
    this._image = setProp({
      val: value,
      isValid:
        value === null ||
        (typeof HTMLImageElement !== "undefined" &&
          value instanceof HTMLImageElement),
      errorMessage: "image must be an HTMLImageElement or null",
      defaultValue: Defaults.wheel.image,
    });
    this._watchImage(this._image);
    this.draw();
  }

  get isInteractive() {
    return this._isInteractive;
  }

  set isInteractive(value) {
    this._isInteractive = setProp({
      val: value,
      isValid: typeof value === "boolean",
      errorMessage: "isInteractive must be a boolean",
      defaultValue: Defaults.wheel.isInteractive,
    });
  }

  get itemBackgroundColors() {
    return this._itemBackgroundColors;
  }

  set itemBackgroundColors(value) {
    this._itemBackgroundColors = setProp({
      val: value,
      isValid: Array.isArray(value),
      errorMessage: "itemBackgroundColors must be an array",
      defaultValue: Defaults.wheel.itemBackgroundColors,
    });
    this.draw();
  }

  get itemLabelAlign() {
    return this._itemLabelAlign;
  }

  set itemLabelAlign(value) {
    this._itemLabelAlign = setProp({
      val: value,
      isValid:
        typeof value === "string" &&
        Object.values(AlignText).includes(value),
      errorMessage: "itemLabelAlign must be left, center, or right",
      defaultValue: Defaults.wheel.itemLabelAlign,
    });
    this.draw();
  }

  get itemLabelBaselineOffset() {
    return this._itemLabelBaselineOffset;
  }

  set itemLabelBaselineOffset(value) {
    this._itemLabelBaselineOffset = setProp({
      val: value,
      isValid: isNumber(value),
      errorMessage: "itemLabelBaselineOffset must be a number",
      defaultValue: Defaults.wheel.itemLabelBaselineOffset,
    });
    this.draw();
  }

  get itemLabelColors() {
    return this._itemLabelColors;
  }

  set itemLabelColors(value) {
    this._itemLabelColors = setProp({
      val: value,
      isValid: Array.isArray(value),
      errorMessage: "itemLabelColors must be an array",
      defaultValue: Defaults.wheel.itemLabelColors,
    });
    this.draw();
  }

  get itemLabelFont() {
    return this._itemLabelFont;
  }

  set itemLabelFont(value) {
    this._itemLabelFont = setProp({
      val: value,
      isValid: typeof value === "string",
      errorMessage: "itemLabelFont must be a string",
      defaultValue: Defaults.wheel.itemLabelFont,
    });
    this.resize();
  }

  get itemLabelFontSize() {
    return this._itemLabelFontSize;
  }

  set itemLabelFontSize(value) {
    this._itemLabelFontSize = setProp({
      val: value,
      isValid: isNumber(value),
      errorMessage: "itemLabelFontSize must be a number",
      defaultValue: Defaults.wheel.itemLabelFontSize,
    });
    this.resize();
  }

  get itemLabelRadius() {
    return this._itemLabelRadius;
  }

  set itemLabelRadius(value) {
    this._itemLabelRadius = setProp({
      val: value,
      isValid: isNumber(value),
      errorMessage: "itemLabelRadius must be a number",
      defaultValue: Defaults.wheel.itemLabelRadius,
    });
    this.resize();
  }

  get itemLabelRadiusMax() {
    return this._itemLabelRadiusMax;
  }

  set itemLabelRadiusMax(value) {
    this._itemLabelRadiusMax = setProp({
      val: value,
      isValid: isNumber(value),
      errorMessage: "itemLabelRadiusMax must be a number",
      defaultValue: Defaults.wheel.itemLabelRadiusMax,
    });
    this.resize();
  }

  get itemLabelRotation() {
    return this._itemLabelRotation;
  }

  set itemLabelRotation(value) {
    this._itemLabelRotation = setProp({
      val: value,
      isValid: isNumber(value),
      errorMessage: "itemLabelRotation must be a number",
      defaultValue: Defaults.wheel.itemLabelRotation,
    });
    this.draw();
  }

  get itemLabelStrokeColor() {
    return this._itemLabelStrokeColor;
  }

  set itemLabelStrokeColor(value) {
    this._itemLabelStrokeColor = setProp({
      val: value,
      isValid: typeof value === "string",
      errorMessage: "itemLabelStrokeColor must be a string",
      defaultValue: Defaults.wheel.itemLabelStrokeColor,
    });
    this.draw();
  }

  get itemLabelStrokeWidth() {
    return this._itemLabelStrokeWidth;
  }

  set itemLabelStrokeWidth(value) {
    this._itemLabelStrokeWidth = setProp({
      val: value,
      isValid: isNumber(value),
      errorMessage: "itemLabelStrokeWidth must be a number",
      defaultValue: Defaults.wheel.itemLabelStrokeWidth,
    });
    this.draw();
  }

  get lineColor() {
    return this._lineColor;
  }

  set lineColor(value) {
    this._lineColor = setProp({
      val: value,
      isValid: typeof value === "string",
      errorMessage: "lineColor must be a string",
      defaultValue: Defaults.wheel.lineColor,
    });
    this.draw();
  }

  get lineWidth() {
    return this._lineWidth;
  }

  set lineWidth(value) {
    this._lineWidth = setProp({
      val: value,
      isValid: isNumber(value),
      errorMessage: "lineWidth must be a number",
      defaultValue: Defaults.wheel.lineWidth,
    });
    this.draw();
  }

  get offset() {
    return this._offset;
  }

  set offset(value) {
    this._offset = setProp({
      val: value,
      isValid: isObject(value),
      errorMessage: "offset must be an object",
      defaultValue: Defaults.wheel.offset,
    });
    this.resize();
  }

  get onCurrentIndexChange() {
    return this._onCurrentIndexChange;
  }

  set onCurrentIndexChange(value) {
    this._onCurrentIndexChange = setProp({
      val: value,
      isValid: typeof value === "function" || value === null,
      errorMessage: "onCurrentIndexChange must be a function or null",
      defaultValue: Defaults.wheel.onCurrentIndexChange,
    });
  }

  get onRest() {
    return this._onRest;
  }

  set onRest(value) {
    this._onRest = setProp({
      val: value,
      isValid: typeof value === "function" || value === null,
      errorMessage: "onRest must be a function or null",
      defaultValue: Defaults.wheel.onRest,
    });
  }

  get onSpin() {
    return this._onSpin;
  }

  set onSpin(value) {
    this._onSpin = setProp({
      val: value,
      isValid: typeof value === "function" || value === null,
      errorMessage: "onSpin must be a function or null",
      defaultValue: Defaults.wheel.onSpin,
    });
  }

  get overlayImage() {
    return this._overlayImage;
  }

  set overlayImage(value) {
    this._overlayImage = setProp({
      val: value,
      isValid:
        value === null ||
        (typeof HTMLImageElement !== "undefined" &&
          value instanceof HTMLImageElement),
      errorMessage: "overlayImage must be an HTMLImageElement or null",
      defaultValue: Defaults.wheel.overlayImage,
    });
    this._watchImage(this._overlayImage);
    this.draw();
  }

  get pixelRatio() {
    return this._pixelRatio;
  }

  set pixelRatio(value) {
    this._pixelRatio = setProp({
      val: value,
      isValid: isNumber(value),
      errorMessage: "pixelRatio must be a number",
      defaultValue: Defaults.wheel.pixelRatio,
    });
    this.resize();
  }

  get pointerAngle() {
    return this._pointerAngle;
  }

  set pointerAngle(value) {
    this._pointerAngle = setProp({
      val: value,
      isValid: isNumber(value),
      errorMessage: "pointerAngle must be a number",
      defaultValue: Defaults.wheel.pointerAngle,
      action: () => value % 360,
    });
    if (this._ctx) this.draw();
  }

  get radius() {
    return this._radius;
  }

  set radius(value) {
    this._radius = setProp({
      val: value,
      isValid: isNumber(value),
      errorMessage: "radius must be a number",
      defaultValue: Defaults.wheel.radius,
    });
    this.resize();
  }

  get rotationResistance() {
    return this._rotationResistance;
  }

  set rotationResistance(value) {
    this._rotationResistance = setProp({
      val: value,
      isValid: isNumber(value),
      errorMessage: "rotationResistance must be a number",
      defaultValue: Defaults.wheel.rotationResistance,
    });
  }

  get rotationSpeedMax() {
    return this._rotationSpeedMax;
  }

  set rotationSpeedMax(value) {
    this._rotationSpeedMax = setProp({
      val: value,
      isValid: isNumber(value) && value >= 0,
      errorMessage: "rotationSpeedMax must be a non-negative number",
      defaultValue: Defaults.wheel.rotationSpeedMax,
    });
  }

  get actualRadius() {
    return this._actualRadius;
  }

  get currentIndex() {
    return this._currentIndex;
  }

  _watchImage(image) {
    if (!image) return;
    image.addEventListener("load", () => this.draw(), { once: true });
  }
}

export { Wheel };
