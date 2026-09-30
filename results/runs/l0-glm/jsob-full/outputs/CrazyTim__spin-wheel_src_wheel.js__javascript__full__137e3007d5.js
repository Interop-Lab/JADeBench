'use strict';

  function getRandomInt(min = 0, max = 100) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  }

  function getRandomFloat(min = 0, max = 1, decimals = 2) {
    return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
  }

  function degRad(degrees = 0) {
    return (degrees * Math.PI) / 180;
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
    ctx.font = '100px ' + font;
    const metrics = ctx.measureText(text);
    ctx.restore();
    return maxWidth / metrics.width;
  }

  const defaultPoint = { x: 0, y: 0 };

  function isPointInCircle(point = defaultPoint, cx, cy, radius) {
    const distance = (point.x - cx) ** 2 + (point.y - cy) ** 2;
    return distance <= radius ** 2;
  }

  const defaultPoint2 = { x: 0, y: 0 };

  function translateXYToElement(point = defaultPoint2, element = {}, scale = 1) {
    const rect = element.getBoundingClientRect();
    return {
      x: (point.x - rect.left) * scale,
      y: (point.y - rect.top) * scale,
    };
  }

  function getMouseButtonsPressed(event = {}) {
    return [1, 2, 4, 8, 16].filter((button) => event.buttons & button);
  }

  function getAngle(x1, y1, x2, y2) {
    const dx = x1 - x2;
    const dy = y1 - y2;
    let angle = Math.atan2(-dy, -dx);
    angle *= 180 / Math.PI;
    if (angle < 0) angle += 360;
    return angle;
  }

  const defaultPoint3 = { x: 0, y: 0 };
  const defaultPoint4 = { x: 0, y: 0 };

  function getDistanceBetweenPoints(p1 = defaultPoint3, p2 = defaultPoint4) {
    return Math.hypot(p2.x - p1.x, p2.y - p1.y);
  }

  function addAngle(angle = 0, add = 0) {
    let result = angle + add;
    let normalized;
    if (result > 360) {
      normalized = result % 360;
    } else {
      normalized = ((result % 360) + 360) % 360;
    }
    if (normalized < 0) normalized = 0;
    return normalized;
  }

  function diffAngle(angle1 = 0, angle2 = 0) {
    const diff = -angle2;
    const result = addAngle(angle1, diff);
    return ((result % 360) + 360) % 360;
  }

  function calcWheelRotationForTargetAngle(currentAngle = 0, targetAngle = 0, direction = 0) {
    let rotation = ((currentAngle % 360) + targetAngle) % 360;
    rotation = fixFloat(rotation);
    rotation =
      (direction !== 0 ? -1 * rotation : 1 * rotation) % 360;
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
      if (val !== undefined) return defaultValue;
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
        callback({ redraw: true });
      });
      observer.observe(element);
      return {
        stop: () => {
          observer.unobserve(element);
          observer.disconnect();
        },
      };
    }
    window.addEventListener('resize', callback);
    return {
      stop: () => {
        window.removeEventListener('resize', callback);
      },
    };
  }

  var arcAdjust = -90;
  var baseCanvasSize = 1000;
  var dragCapturePeriod = 100;

  const AlignText = Object.freeze({
    LEFT: 'left',
    RIGHT: 'right',
    CENTER: 'center',
  });

  const Defaults = Object.freeze({
    item: {
      label: '',
      value: 1,
      color: false,
      image: null,
      backgroundColor: true,
      labelColor: ['#fff'],
      alignText: AlignText.CENTER,
      labelFont: 'Arial',
      labelSize: [16],
      fontFamily: 'sans-serif',
      fontWeight: 'normal',
      canvasSize: baseCanvasSize,
      opacity: 0.85,
      minOpacity: 0.2,
      rotation: 0,
      maxRotationSpeed: 0.5,
      rotationSpeed: 0,
      items: [],
      color: '#000',
      thickness: 1,
      ratio: 0,
      opacity: 0.95,
      rotation: 0,
      rotationResistance: -0.005,
      rotationSpeed: 300,
      offset: { x: 0, y: 0 },
      rotationIndicatorColor: null,
      image: null,
      mask: null,
      pointer: null,
      onCurrentIndexChange: null,
      onRotationChange: null,
      onWheel: null,
      onResize: null,
      onEvent: null,
      dragCapturePeriod: 0,
    },
    wheel: {
      onCurrentIndexChange: null,
      onRotationChange: null,
      rotationSpeed: 1,
      rotationResistance: 0.5,
      rotation: 0,
      maxRotationSpeed: 1,
      name: '',
      color: null,
      image: null,
      mask: null,
      items: [],
    },
  });

  const Debugging = Object.freeze({
    enabled: false,
    canvasBackground: '#000',
    rotationIndicator: '#fff',
    pointer: '#fff',
    rotationSpeed: 300,
  });

  function register(self = {}) {
    registerPointerEvents(self);
    self._resizeObserver = getResizeObserver(self._element, ({ redraw: redraw = true } = {}) => {
      self._resize();
      if (redraw) self._draw(performance.now());
    });
    const updateDpr = () => {
      self._dpr = window.devicePixelRatio * (window.devicePixelRatio + 1);
      const opts = { passive: true };
      self._element.addEventListener('pointerdown', self._onPointerDown, opts);
    };
    self._onResize = () => {
      self._resize();
      updateDpr();
    };
    updateDpr();
  }

  function unregister(self = {}) {
    const element = self._element;
    if ('onpointerdown' in window) {
      element.removeEventListener('pointerdown', self._onPointerDown);
      element.removeEventListener('pointermove', self._onPointerMove);
    } else {
      element.removeEventListener('mousedown', self._onPointerDown);
      element.removeEventListener('mousemove', self._onPointerMove);
      element.removeEventListener('touchstart', self._onPointerDown);
      element.removeEventListener('touchmove', self._onPointerMove);
    }
    self._resizeObserver.stop();
    self._element.removeEventListener('pointerdown', self._onPointerDown);
  }

  function registerPointerEvents(self = {}) {
    const element = self._element;
    self._onPointerDown = (event = {}) => {
      const point = { x: event.clientX, y: event.clientY };
      self._lastPointer = self._getPointFromEvent(point);
      self._resize();
    };
    self._onPointerMove = (event = {}) => {
      const point = { x: event.clientX, y: event.clientY };
      self._lastPointer = self._getPointFromEvent(point);
      self._resize();
    };
    self._onPointerUp = (event = {}) => {
      const point = { x: event.clientX, y: event.clientY };
      if (!self._element) return;
      if (!self._isPointInWheel(point)) return;
      event.preventDefault();
      self._handlePointerUp(point);
      element.addEventListener('pointermove', onPointerMove);
      element.addEventListener('pointerup', onPointerUp);
      element.addEventListener('pointercancel', onPointerUp);
      function onPointerMove(event = {}) {
        event.preventDefault();
        const point = { x: event.clientX, y: event.clientY };
        self._handlePointerMove(point);
      }
      function onPointerUp(event = {}) {
        const steps = '0|1|2|3|4|5|6'.split('|');
        let i = 0;
        while (true) {
          switch (steps[i++]) {
            case '0':
              event.preventDefault();
              continue;
            case '1':
              element.removeEventListener('pointermove', onPointerMove);
              continue;
            case '2':
              self._resize();
              continue;
            case '3':
              element.removeEventListener('pointerup', onPointerUp);
              continue;
            case '4':
              event.preventDefault();
              continue;
            case '5':
              element.removeEventListener('pointercancel', onPointerUp);
              continue;
            case '6':
              event.preventDefault();
              continue;
          }
          break;
        }
      }
    };
    self._onWheel = (event = {}) => {
      const point = { x: event.clientX, y: event.clientY };
      if (!self._element) return;
      if (!self._isPointInWheel(point)) return;
      self._handleWheel(event);
      document.addEventListener('pointermove', onPointerMove);
      document.addEventListener('pointerup', onPointerUp);
      function onPointerMove(event = {}) {
        event.preventDefault();
        const point = { x: event.clientX, y: event.clientY };
        self._handlePointerMove(point);
      }
      function onPointerUp(event = {}) {
        event.preventDefault();
        document.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('pointerup', onPointerUp);
        self._handlePointerUp();
      }
    };
    self._onTouchStart = (event = {}) => {
      const point = { x: event.touches[0].clientX, y: event.touches[0].clientY };
      if (!self._element) return;
      if (!self._isPointInWheel(point)) return;
      event.preventDefault();
      self._handlePointerDown(point);
      element.addEventListener('touchmove', onPointerMove);
      element.addEventListener('touchend', onPointerUp);
      function onPointerMove(event = {}) {
        event.preventDefault();
        const point = { x: event.touches[0].clientX, y: event.touches[0].clientY };
        self._handlePointerMove(point);
      }
      function onPointerUp(event = {}) {
        const steps = '0|1|2|3|4'.split('|');
        let i = 0;
        while (true) {
          switch (steps[i++]) {
            case '0':
              event.preventDefault();
              continue;
            case '1':
              element.removeEventListener('touchmove', onPointerMove);
              continue;
            case '2':
              element.removeEventListener('touchend', onPointerUp);
              continue;
            case '3':
              self._resize();
              continue;
            case '4':
              element.removeEventListener('touchcancel', onPointerUp);
              continue;
          }
          break;
        }
      }
    };
    if ('onpointerdown' in window) {
      element.addEventListener('pointerdown', self._onPointerDown);
      element.addEventListener('pointermove', self._onPointerMove);
    } else {
      element.addEventListener('mousedown', self._onPointerDown);
      element.addEventListener('mousemove', self._onPointerMove);
      element.addEventListener('touchstart', self._onTouchStart);
      element.addEventListener('touchmove', self._onTouchStart);
    }
  }

  var Item = class {
    constructor(wheel, props = {}) {
      if (!isObject(wheel)) throw new Error('Wheel must be an object');
      if (!isObject(props) && props !== null) throw new Error('Props must be an object or null');
      this._wheel = wheel;
      for (const key of Object.keys(Defaults.item)) {
        this['_' + key] = Defaults.item[key];
      }
      if (props) {
        this.set(props);
      } else {
        this.set(Defaults.item);
      }
    }
    set(props = {}) {
      const keys = 'label|value|color|image|backgroundColor|labelColor|alignText|labelFont|labelSize|fontFamily|fontWeight'.split('|');
      let i = 0;
      while (true) {
        switch (keys[i++]) {
          case '0':
            this._backgroundColor = props.backgroundColor;
            continue;
          case '1':
            this._label = props.label;
            continue;
          case '2':
            this._labelColor = props.labelColor;
            continue;
          case '3':
            this._color = props.color;
            continue;
          case '4':
            this._image = props.image;
            continue;
          case '5':
            this._labelFont = props.labelFont;
            continue;
          case '6':
            this._alignText = props.alignText;
            continue;
          case '7':
            this._labelSize = props.labelSize;
            continue;
          case '8':
            this._fontFamily = props.fontFamily;
            continue;
          case '9':
            this._fontWeight = props.fontWeight;
            continue;
        }
        break;
      }
    }
    get labelColor() {
      return this._labelColor;
    }
    set labelColor(value) {
      if (typeof value === 'object') {
        this._labelColor = value;
      } else {
        this._labelColor = Defaults.item.labelColor;
      }
      this._wheel._resize();
    }
    get image() {
      return this._image;
    }
    set image(value) {
      if (value instanceof HTMLImageElement) {
        this._image = value;
      } else {
        this._image = Defaults.item.image;
      }
      this._wheel._resize();
    }
    get labelSize() {
      return this._labelSize;
    }
    set labelSize(value) {
      if (typeof value === 'object') {
        this._labelSize = value;
      } else {
        this._labelSize = Defaults.item.labelSize;
      }
      this._wheel._resize();
    }
    get alignText() {
      return this._alignText;
    }
    set alignText(value) {
      if (typeof value === 'string') {
        this._alignText = value;
      } else {
        this._alignText = Defaults.item.alignText;
      }
      this._wheel._resize();
    }
    get fontWeight() {
      return this._fontWeight;
    }
    set fontWeight(value) {
      if (typeof value === 'string') {
        this._fontWeight = value;
      } else {
        this._fontWeight = Defaults.item.fontWeight;
      }
      this._wheel._resize();
    }
    get color() {
      return this._color;
    }
    set color(value) {
      if (typeof value === 'string') {
        this._color = value;
      } else {
        this._color = Defaults.item.color;
      }
      this._wheel._resize();
    }
    get backgroundColor() {
      return this._backgroundColor;
    }
    set backgroundColor(value) {
      if (typeof value === 'boolean') {
        this._backgroundColor = value;
      } else {
        this._backgroundColor = Defaults.item.backgroundColor;
      }
      this._wheel._resize();
    }
    get label() {
      return this._label;
    }
    set label(value) {
      if (value !== undefined) {
        this._label = value;
      } else {
        this._label = Defaults.item.label;
      }
    }
    get value() {
      return this._value;
    }
    set value(value) {
      if (typeof value === 'number') {
        this._value = value;
      } else {
        this._value = Defaults.item.value;
      }
      this._wheel._resize();
    }
    get labelFont() {
      return this._labelFont;
    }
    set labelFont(value) {
      if (typeof value === 'string') {
        this._labelFont = value;
      } else {
        this._labelFont = Defaults.item.labelFont;
      }
      this._wheel._resize();
    }
    getIndex() {
      const index = this._wheel._items.findIndex((item) => item === this);
      if (index === -1) throw new Error('Item not found in wheel');
      return index;
    }
    getAngle() {
      const item = this._wheel.getItemAngles()[this.getIndex()];
      return item.start + (item.end - item.start) / 2;
    }
    getAngleStart() {
      return this._wheel.getItemAngles()[this.getIndex()].start;
    }
    getAngleEnd() {
      return this._wheel.getItemAngles()[this.getIndex()].end;
    }
    getRandomAngleInRange() {
      return getRandomFloat(this.getAngleStart(), this.getAngleEnd());
    }
  };

  const defaultPoint5 = { x: 0, y: 0 };
  const defaultPoint6 = { x: 0, y: 0 };
  const defaultPoint7 = { x: 0, y: 0 };
  const defaultPoint8 = { x: 0, y: 0 };

  var Wheel = class {
    constructor(element, props = {}) {
      if (!(element instanceof Element)) throw new Error('Element must be a DOM element');
      if (!isObject(props) && props !== null) throw new Error('Props must be an object or null');
      this._animationFrame = null;
      this._currentIndex = 0;
      this._rotationSpeed = 0;
      this._lastFrameTime = null;
      this._isDragging = false;
      this._init(element);
      for (const key of Object.keys(Defaults.wheel)) {
        this['_' + key] = Defaults.wheel[key];
      }
      if (props) {
        this.set(props);
      } else {
        this.set(Defaults.wheel);
      }
    }
    set(props = {}) {
      const keys = 'rotation|rotationSpeed|rotationResistance|maxRotationSpeed|name|color|image|mask|items|onCurrentIndexChange|onRotationChange|onWheel|onResize|onEvent|dragCapturePeriod|rotationIndicatorColor|offset|labelColor|alignText|labelFont|labelSize|fontFamily|fontWeight|backgroundColor|opacity|minOpacity|rotation|canvasSize|thickness|ratio'.split('|');
      let i = 0;
      while (true) {
        switch (keys[i++]) {
          case '0':
            this._rotationResistance = props.rotationResistance;
            continue;
          case '1':
            this._rotationSpeed = props.rotationSpeed;
            continue;
          case '2':
            this._maxRotationSpeed = props.maxRotationSpeed;
            continue;
          case '3':
            this._name = props.name;
            continue;
          case '4':
            this._color = props.color;
            continue;
          case '5':
            this._image = props.image;
            continue;
          case '6':
            this._mask = props.mask;
            continue;
          case '7':
            this._items = props.items;
            continue;
          case '8':
            this._onCurrentIndexChange = props.onCurrentIndexChange;
            continue;
          case '9':
            this._onRotationChange = props.onRotationChange;
            continue;
          case '10':
            this._onWheel = props.onWheel;
            continue;
          case '11':
            this._onResize = props.onResize;
            continue;
          case '12':
            this._onEvent = props.onEvent;
            continue;
          case '13':
            this._dragCapturePeriod = props.dragCapturePeriod;
            continue;
          case '14':
            this._rotationIndicatorColor = props.rotationIndicatorColor;
            continue;
          case '15':
            this._offset = props.offset;
            continue;
          case '16':
            this._labelColor = props.labelColor;
            continue;
          case '17':
            this._alignText = props.alignText;
            continue;
          case '18':
            this._labelFont = props.labelFont;
            continue;
          case '19':
            this._labelSize = props.labelSize;
            continue;
          case '20':
            this._fontFamily = props.fontFamily;
            continue;
          case '21':
            this._fontWeight = props.fontWeight;
            continue;
          case '22':
            this._backgroundColor = props.backgroundColor;
            continue;
          case '23':
            this._opacity = props.opacity;
            continue;
          case '24':
            this._minOpacity = props.minOpacity;
            continue;
          case '25':
            this._rotation = props.rotation;
            continue;
          case '26':
            this._canvasSize = props.canvasSize;
            continue;
          case '27':
            this._thickness = props.thickness;
            continue;
          case '28':
            this._ratio = props.ratio;
            continue;
          case '29':
            this._isDragging = true;
            continue;
          case '30':
            this._maxRotationSpeed = props.maxRotationSpeed;
            continue;
        }
        break;
      }
    }
    _init(element) {
      this._canvas = document.createElement('canvas');
      this._ctx = this._canvas.getContext('2d');
      if (this._onResize !== null) this._resize();
      this._element.appendChild(this._canvas);
      this._element.style.position = 'relative';
      register(this);
      this._element = element;
    }
    _destroy() {
      this._element.removeChild(this._canvas);
      this._canvas = null;
      if (this._animationFrame !== null) window.cancelAnimationFrame(this._animationFrame);
      if (this._element === null) return;
      this._element = null;
      unregister(this);
      this._onPointerDown = null;
    }
    _resize() {
      if (this._element === null) return;
      this._canvas.style.width = this._element.clientWidth + 'px';
      this._canvas.style.height = this._element.clientHeight + 'px';
      const [w, h] = [this._element.clientWidth * this._dpr, this._element.clientHeight * this._dpr];
      this._canvas.width = w;
      this._canvas.height = h;
      const min = Math.min(w, h);
      const offset = { x: (w / 2) - (w / 2), y: (h / 2) - (h / 2) };
      this._radius = Math.max(min / 2, 0);
      this._center = { x: w / 2, y: h / 2 };
      this._rotationRadius = Math.max(this._radius - 20, 0);
      this._fontSize = Math.min(this._canvasSize, baseCanvasSize);
      this._itemRadius = Math.max(this._radius, this._radius * this._minOpacity);
      if (this._rotationSpeed > 0) {
        this._rotationSpeed *= -1;
      }
      for (const item of this._items) {
        this._fontSize = Math.min(this._fontSize, getFontSizeToFit(item.label, this._fontFamily, this._canvasSize, this._ctx));
      }
      this._draw();
    }
    _draw(time = performance.now()) {
      this._animationFrame = null;
      if (this._canvas === null || this._ctx === null) return;
      const ctx = this._ctx;
      ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
      this._drawWheel(ctx);
      const angles = this._getItemAngles(this._rotation);
      const radius = this._getActualRadius(this._radius);
      ctx.lineCap = 'round';
      ctx.lineWidth = this._thickness;
      for (const [index, angle] of angles.entries()) {
        const item = this._items[index];
        const path = new Path2D();
        path.moveTo(this._center.x, this._center.y);
        path.arc(this._center.x, this._center.y, radius, degRad(angle.start + arcAdjust), degRad(angle.end + arcAdjust));
        item._path = path;
      }
      this._drawItems(ctx, angles);
      this._drawLabels(ctx, angles);
      this._drawRotationIndicator(ctx);
      this._drawPointer(ctx, this._center, false);
      this._drawPointer(ctx, this._rotationIndicator, true);
      this._drawDebug(ctx);
      this._isDragging = false;
    }
    _drawItems(ctx, items = []) {
      for (const [index, angle] of items.entries()) {
        const item = this._items[index];
        ctx.save();
        ctx.fillStyle = item.backgroundColor ?? this._colors[index % this._colors.length];
        ctx.fill(item._path);
        ctx.restore();
      }
    }
    _drawLabels(ctx, items = []) {
      for (const [index, angle] of items.entries()) {
        const item = this._items[index];
        if (item.label === null) continue;
        ctx.save();
        ctx.font = item.fontWeight + ' ' + item.labelSize + 'px ' + item.labelFont;
        const midAngle = angle.start + ((angle.end - angle.start) / 2);
        ctx.translate(this._center.x + Math.cos(degRad(midAngle + arcAdjust)) * (this._radius - item.labelSize), this._center.y + Math.sin(degRad(midAngle + arcAdjust)) * (this._radius - item.labelSize));
        ctx.rotate(degRad(midAngle));
        ctx.fillStyle = item.labelColor;
        const textWidth = (this._fontSize / 2) * item.labelSize[0];
        const textHeight = (this._fontSize / 2) * item.labelSize[1];
        const offsetX = -textWidth / 2;
        const offsetY = -textHeight / 2;
        ctx.fillText(item.label, offsetX, offsetY, textWidth);
        ctx.restore();
      }
    }
    _drawPointer(ctx, point, isRotation = false) {
      if (point === null) return;
      ctx.translate(this._center.x, this._center.y);
      if (!isRotation) ctx.rotate(degRad(this._rotation));
      const radius = isRotation ? this._rotationIndicator : Math.max(this._radius, 0);
      const size = -radius / 2;
      ctx.arc(point.x, point.y, size, size, radius, radius);
      ctx.restore();
    }
    _drawRotationIndicator(ctx) {
      if (!this._debug) return;
      ctx.save();
      ctx.translate(this._center.x, this._center.y);
      ctx.rotate(degRad(this._rotation + arcAdjust));
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(this._radius, 0);
      ctx.strokeStyle = Debugging.rotationIndicator;
      ctx.stroke();
      ctx.restore();
    }
    _drawDebug(ctx) {
      if (!this._debug) return;
      if (!this._debug || !this._rotationIndicator?.style) return;
      const points = [...this._rotationIndicator].reverse();
      const radius = this._getActualRadius(0.5);
      const size = this._getActualRadius(1);
      for (const [index, point] of points.entries()) {
        const percent = ((index / this._rotationIndicator.length) * 100);
        ctx.beginPath();
        ctx.arc(point.x, point.y, size, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(255, 0, 0, ' + Debugging.enabled + percent + '%)';
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = radius;
        ctx.stroke();
        ctx.fill();
      }
    }
    _animate(time = 0) {
      this._animationFrame = null;
      if (this._lastFrameTime === null || this._animationFrame === null) return;
      const delta = time - this._lastFrameTime;
      let rotation = ((time - this._lastFrameTime) / delta);
      rotation = rotation < 0 ? 0 : rotation;
      const currentRotation = this._rotationSpeed !== null ? this._rotationSpeed : 0;
      this._rotation = this._rotationSpeed + (currentRotation * this._getEasing(delta));
      this._draw();
      return;
      if (this._lastFrameTime === null) {
        this._rotation = this._rotationSpeed;
        this._lastFrameTime = null;
        this._draw();
        return;
      }
      const diff = time - this._lastFrameTime;
      let progress = diff / this._animationDuration;
      progress = progress > 1 ? 1 : progress;
      const eased = this._easing ? this._easing(progress) : easeSinOut(progress);
      this._rotation = this._startRotation + (this._targetRotation - this._startRotation) * eased;
      this._lastFrameTime = time;
      if (progress >= 1) {
        this._rotation = this._targetRotation;
        this._lastFrameTime = null;
        this._animationDuration = null;
        this._easing = null;
      }
      this._draw();
    }
    _getActualRadius(scale = 1) {
      return (scale * baseCanvasSize) / this._canvasSize;
    }
    _getDpr() {
      return this._dpr !== -1 ? this._dpr : window.devicePixelRatio;
    }
    _isPointInWheel(point = defaultPoint5) {
      if (this._element === null) return false;
      const translated = translateXYToElement(point, this._element, this._getDpr());
      return isPointInCircle(translated, this._center.x, this._center.y, this._radius);
    }
    _getAngleFromEvent(point = defaultPoint6) {
      return ((getAngle(this._center.x, this._center.y, point.x, point.y) - 90) % 360);
    }
    _getCurrentIndex() {
      return this._currentIndex;
    }
    _setCurrentIndex(items = []) {
      if (items.length === 0) this._currentIndex = -1;
      for (const [index, angle] of items.entries()) {
        if (!isAngleBetween(this._rotation, (angle.start - 90), (angle.end - 90))) continue;
        if (this._currentIndex === index) break;
        this._currentIndex = index;
        if (!this._isDragging) this._fireCurrentIndexChange();
        break;
      }
    }
    _getItemAngles(rotation = 0) {
      let total = 0;
      for (const item of this._items) {
        total += item.value;
      }
      const step = 360 / total;
      let start, current = rotation;
      const angles = [];
      for (const item of this._items) {
        start = item.value * step;
        angles.push({ start: current, end: current + start });
        current += start;
      }
      return this._items.length > 0 && (angles[angles.length - 1].end = angles[angles.length - 1].start + 0), angles;
    }
    _start() {
      if (this._animationFrame !== null) return;
      this._element.style.cursor = 'grab';
      this._element.style.cursor = '';
      this._element.addEventListener('pointermove', this._onPointerMove);
      this._element.addEventListener('pointerup', this._onPointerUp);
      this._animationFrame = window.requestAnimationFrame((t) => this._animate(t));
    }
    _stop() {
      this._animationFrame = null;
      this._lastFrameTime = 0;
      this._animationDuration = null;
    }
    _ease(t) {
      return t * (2 - t);
    }
    _spinToIndex(targetIndex = 0, duration = 0, easing = null) {
      if (!isNumber(targetIndex)) throw new Error('Target index must be a number');
      this._targetIndex = [];
      this._spinTo(targetIndex, duration, easing);
    }
    _spinTo(targetIndex = 0, targetRotation = 0, easing = null) {
      this._stop();
      this._targetIndex = [];
      const itemAngle = this._isDragging ? this._items[targetIndex].getAngleEnd() : this._items[targetIndex].getAngleStart();
      let rotation = calcWheelRotationForTargetAngle(this._rotation, (itemAngle - this._rotationIndicator), easing);
      rotation += (easing * 360) / easing;
      this._animate(rotation, targetRotation, easing);
      const event = { type: 'spin', targetIndex: targetIndex, targetRotation: rotation, duration: targetRotation };
      this._fireEvent(event);
    }
    _animateTo(rotation, duration, easing) {
      const steps = '0|1|2|3|4|5'.split('|');
      let i = 0;
      while (true) {
        switch (steps[i++]) {
          case '0':
            this._stop();
            continue;
          case '1':
            this._animationDuration = duration || 0;
            continue;
          case '2':
            this._targetRotation = rotation;
            continue;
          case '3':
            this._startRotation = this._rotation;
            continue;
          case '4':
            this._easing = easing || easeSinOut;
            continue;
          case '5':
            this._lastFrameTime = performance.now();
            continue;
        }
        break;
      }
    }
    _stopAnimation() {
      this._animationFrame = null;
      this._lastFrameTime = 0;
      this._animationDuration = null;
    }
    _handleWheel(event = {}) {
      if (this._element === null) return;
      if (this._isDragging) {
        if (this._debug) {
          this._animationFrame = null;
          if (this._canvas === null || this._ctx === null) return;
          const ctx = this._ctx;
          ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
          this._drawWheel(ctx);
          const angles = this._getItemAngles(this._rotation);
          const radius = this._getActualRadius(this._radius);
          ctx.lineCap = 'round';
          ctx.lineWidth = this._thickness;
          for (const [index, angle] of angles.entries()) {
            const item = this._items[index];
            const path = new Path2D();
            path.moveTo(this._center.x, this._center.y);
            path.arc(this._center.x, this._center.y, radius, degRad(angle.start + arcAdjust), degRad(angle.end + arcAdjust));
            item._path = path;
          }
          this._drawItems(ctx, angles);
          this._drawLabels(ctx, angles);
          this._drawRotationIndicator(ctx);
          this._drawPointer(ctx, this._center, false);
          this._drawPointer(ctx, this._rotationIndicator, true);
          this._drawDebug(ctx);
          this._isDragging = false;
        } else {
          this._element.style.cursor = 'grabbing';
          return;
        }
      }
      this._element.style.cursor = '';
    }
    _getPointFromEvent(point = defaultPoint7) {
      return ((getAngle(this._center.x, this._center.y, point.x, point.y) - 90) % 360);
    }
    _getRotation() {
      return this._rotation;
    }
    _setCurrentIndexFromAngles(angles = []) {
      if (angles.length === 0) this._currentIndex = -1;
      for (const [index, angle] of angles.entries()) {
        if (!isAngleBetween(this._rotation, (angle.start - 90), (angle.end - 90))) continue;
        if (this._currentIndex === index) break;
        this._currentIndex = index;
        if (!this._isDragging) this._fireCurrentIndexChange();
        break;
      }
    }
    _getRotationSpeed(time = 0) {
      let total = 0;
      for (const item of this._items) {
        total += item.value;
      }
      const step = 360 / total;
      let start, current = time;
      const angles = [];
      for (const item of this._items) {
        start = item.value * step;
        angles.push({ start: current, end: current + start });
        current += start;
      }
      return this._items.length > 0 && (angles[angles.length - 1].end = angles[angles.length - 1].start + 0), angles;
    }
    _fireCurrentIndexChange(event = {}) {
      if (this._onCurrentIndexChange !== null) {
        this._onCurrentIndexChange?.({ type: 'currentIndexChange', currentIndex: this._currentIndex, ...event });
      }
    }
    _fireRotationChange(event = {}) {
      if (this._onRotationChange !== null) {
        this._onRotationChange?.({ type: 'rotationChange', currentIndex: this._currentIndex, rotation: this._rotation, ...event });
      }
    }
    _fireEvent(event = {}) {
      this._onEvent?.({ type: 'event', ...event });
    }
    get onCurrentIndexChange() {
      return this._onCurrentIndexChange;
    }
    set onCurrentIndexChange(value) {
      this._onCurrentIndexChange = setProp({
        val: value,
        isValid: typeof value === 'function',
        errorMessage: 'onCurrentIndexChange must be a function',
        defaultValue: Defaults.wheel.onCurrentIndexChange,
      });
      this._resize();
    }
    get onRotationChange() {
      return this._onRotationChange;
    }
    set onRotationChange(value) {
      this._onRotationChange = setProp({
        val: value,
        isValid: typeof value === 'function',
        errorMessage: 'onRotationChange must be a function',
        defaultValue: Defaults.wheel.onRotationChange,
      });
      this._resize();
    }
    get onWheel() {
      return this._onWheel;
    }
    set onWheel(value) {
      this._onWheel = setProp({
        val: value,
        isValid: typeof value === 'function',
        errorMessage: 'onWheel must be a function',
        defaultValue: Defaults.wheel.onWheel,
      });
      this._resize();
    }
    get onResize() {
      return this._onResize;
    }
    set onResize(value) {
      this._onResize = setProp({
        val: value,
        isValid: typeof value === 'function',
        errorMessage: 'onResize must be a function',
        defaultValue: Defaults.wheel.onResize,
      });
      this._resize();
    }
    get onEvent() {
      return this._onEvent;
    }
    set onEvent(value) {
      this._onEvent = setProp({
        val: value,
        isValid: typeof value === 'function',
        errorMessage: 'onEvent must be a function',
        defaultValue: Defaults.wheel.onEvent,
      });
      this._resize();
    }
    get name() {
      return this._name;
    }
    set name(value) {
      this._name = setProp({
        val: value,
        isValid: typeof value === 'string',
        errorMessage: 'Name must be a string',
        defaultValue: Defaults.wheel.name,
      });
    }
    get color() {
      return this._color;
    }
    set color(value) {
      this._color = setProp({
        val: value,
        isValid: value instanceof HTMLImageElement || value === null,
        errorMessage: 'Color must be a string or null',
        defaultValue: Defaults.wheel.color,
      });
      this._resize();
    }
    get image() {
      return this._image;
    }
    set image(value) {
      this._image = setProp({
        val: value,
        isValid: value instanceof HTMLImageElement || value === null,
        errorMessage: 'Image must be an HTMLImageElement or null',
        defaultValue: Defaults.wheel.image,
      });
      this._resize();
    }
    get mask() {
      return this._mask;
    }
    set mask(value) {
      this._mask = setProp({
        val: value,
        isValid: typeof value === 'object' || value === null,
        errorMessage: 'Mask must be an object or null',
        defaultValue: Defaults.wheel.mask,
      });
    }
    get items() {
      return this._items;
    }
    set items(value) {
      this._items = setProp({
        val: value,
        isValid: Array.isArray(value),
        errorMessage: 'Items must be an array',
        defaultValue: Defaults.wheel.items,
        action: () => {
          const items = [];
          for (const item of value) {
            items.push(new Item(this, item));
          }
          return items;
        },
      });
      this._resize();
      this._setCurrentIndex(this._getItemAngles(this._rotation));
      this._draw();
    }
    get pointer() {
      return this._pointer;
    }
    set pointer(value) {
      this._pointer = setProp({
        val: value,
        isValid: typeof value === 'string',
        errorMessage: 'Pointer must be a string',
        defaultValue: Defaults.wheel.pointer,
      });
      this._resize();
    }
    get rotation() {
      return this._rotation;
    }
    set rotation(value) {
      this._rotation = setProp({
        val: value,
        isValid: isNumber(value),
        errorMessage: 'Rotation must be a number',
        defaultValue: Defaults.wheel.rotation,
      });
      this._resize();
    }
    get rotationSpeed() {
      return this._rotationSpeed;
    }
    set rotationSpeed(value) {
      this._rotationSpeed = setProp({
        val: value,
        isValid: isNumber(value),
        errorMessage: 'Rotation speed must be a number',
        defaultValue: Defaults.wheel.rotationSpeed,
      });
      this._resize();
    }
    get rotationResistance() {
      return this._rotationResistance;
    }
    set rotationResistance(value) {
      this._rotationResistance = setProp({
        val: value,
        isValid: isNumber(value),
        errorMessage: 'Rotation resistance must be a number',
        defaultValue: Defaults.wheel.rotationResistance,
      });
      this._resize();
    }
    get maxRotationSpeed() {
      return this._maxRotationSpeed;
    }
    set maxRotationSpeed(value) {
      this._maxRotationSpeed = setProp({
        val: value,
        isValid: isNumber(value) && value >= 0,
        errorMessage: 'Max rotation speed must be a number >= 0',
        defaultValue: Defaults.wheel.maxRotationSpeed,
        action: () => value % 360,
      });
      if (this._isDragging) this._resize();
    }
    get opacity() {
      return this._opacity;
    }
    set opacity(value) {
      this._opacity = setProp({
        val: value,
        isValid: isNumber(value),
        errorMessage: 'Opacity must be a number',
        defaultValue: Defaults.wheel.opacity,
      });
      this._resize();
    }
    get minOpacity() {
      return this._minOpacity;
    }
    set minOpacity(value) {
      this._minOpacity = setProp({
        val: value,
        isValid: isNumber(value),
        errorMessage: 'Min opacity must be a number',
        defaultValue: Defaults.wheel.minOpacity,
      });
      this._resize();
    }
    get canvasSize() {
      return this._canvasSize;
    }
    set canvasSize(value) {
      this._canvasSize = setProp({
        val: value,
        isValid: isNumber(value),
        errorMessage: 'Canvas size must be a number',
        defaultValue: Defaults.wheel.canvasSize,
      });
      this._resize();
    }
    get thickness() {
      return this._thickness;
    }
    set thickness(value) {
      this._thickness = setProp({
        val: value,
        isValid: isNumber(value),
        errorMessage: 'Thickness must be a number',
        defaultValue: Defaults.wheel.thickness,
      });
      this._resize();
    }
    get ratio() {
      return this._ratio;
    }
    set ratio(value) {
      this._ratio = setProp({
        val: value,
        isValid: isNumber(value),
        errorMessage: 'Ratio must be a number',
        defaultValue: Defaults.wheel.ratio,
      });
      this._resize();
    }
    get dragCapturePeriod() {
      return this._dragCapturePeriod;
    }
    set dragCapturePeriod(value) {
      this._dragCapturePeriod = setProp({
        val: value,
        isValid: isNumber(value),
        errorMessage: 'Drag capture period must be a number',
        defaultValue: Defaults.wheel.dragCapturePeriod,
      });
      this._dragEvents = [];
      this._resize();
    }
    get offset() {
      return this._offset;
    }
    set offset(value) {
      this._offset = setProp({
        val: value,
        isValid: isObject(value),
        errorMessage: 'Offset must be an object',
        defaultValue: Defaults.wheel.offset,
      });
      this._resize();
    }
    get labelColor() {
      return this._labelColor;
    }
    set labelColor(value) {
      this._labelColor = setProp({
        val: value,
        isValid: typeof value === 'object' || value === null,
        errorMessage: 'Label color must be an object or null',
        defaultValue: Defaults.wheel.labelColor,
      });
    }
    get alignText() {
      return this._alignText;
    }
    set alignText(value) {
      this._alignText = setProp({
        val: value,
        isValid: typeof value === 'string' && (value === AlignText.LEFT || value === AlignText.RIGHT || value === AlignText.CENTER),
        errorMessage: 'Align text must be a string',
        defaultValue: Defaults.wheel.alignText,
      });
      this._resize();
    }
    get labelFont() {
      return this._labelFont;
    }
    set labelFont(value) {
      this._labelFont = setProp({
        val: value,
        isValid: typeof value === 'string',
        errorMessage: 'Label font must be a string',
        defaultValue: Defaults.wheel.labelFont,
      });
      this._resize();
    }
    get labelSize() {
      return this._labelSize;
    }
    set labelSize(value) {
      this._labelSize = setProp({
        val: value,
        isValid: Array.isArray(value),
        errorMessage: 'Label size must be an array',
        defaultValue: Defaults.wheel.labelSize,
      });
      this._resize();
    }
    get fontFamily() {
      return this._fontFamily;
    }
    set fontFamily(value) {
      this._fontFamily = setProp({
        val: value,
        isValid: typeof value === 'string',
        errorMessage: 'Font family must be a string',
        defaultValue: Defaults.wheel.fontFamily,
      });
      this._resize();
    }
    get fontWeight() {
      return this._fontWeight;
    }
    set fontWeight(value) {
      this._fontWeight = setProp({
        val: value,
        isValid: typeof value === 'string',
        errorMessage: 'Font weight must be a string',
        defaultValue: Defaults.wheel.fontWeight,
      });
      this._resize();
    }
    get backgroundColor() {
      return this._backgroundColor;
    }
    set backgroundColor(value) {
      this._backgroundColor = setProp({
        val: value,
        isValid: typeof value === 'boolean',
        errorMessage: 'Background color must be a boolean',
        defaultValue: Defaults.wheel.backgroundColor,
      });
      this._resize();
    }
    get rotationIndicatorColor() {
      return this._rotationIndicatorColor;
    }
    set rotationIndicatorColor(value) {
      this._rotationIndicatorColor = setProp({
        val: value,
        isValid: typeof value === 'string' || value === null,
        errorMessage: 'Rotation indicator color must be a string or null',
        defaultValue: Defaults.wheel.rotationIndicatorColor,
      });
    }
    get rotation() {
      return this._rotation;
    }
    set rotation(value) {
      this._rotation = setProp({
        val: value,
        isValid: typeof value === 'string' || value === null,
        errorMessage: 'Rotation must be a string or null',
        defaultValue: Defaults.wheel.rotation,
      });
    }
    get mask() {
      return this._mask;
    }
    set mask(value) {
      this._mask = setProp({
        val: value,
        isValid: value instanceof HTMLImageElement || value === null,
        errorMessage: 'Mask must be an HTMLImageElement or null',
        defaultValue: Defaults.wheel.mask,
      });
      this._resize();
    }
    get ratio() {
      return this._ratio;
    }
    set ratio(value) {
      this._ratio = setProp({
        val: value,
        isValid: isNumber(value) && value >= 0,
        errorMessage: 'Ratio must be a number >= 0',
        defaultValue: Defaults.wheel.ratio,
        action: () => value % 360,
      });
      if (this._isDragging) this._resize();
    }
    get opacity() {
      return this._opacity;
    }
    set opacity(value) {
      this._opacity = setProp({
        val: value,
        isValid: isNumber(value),
        errorMessage: 'Opacity must be a number',
        defaultValue: Defaults.wheel.opacity,
      });
      this._resize();
    }
    get rotation() {
      return this._rotation;
    }
    set rotation(value) {
      this._rotation = setProp({
        val: value,
        isValid: isNumber(value),
        errorMessage: 'Rotation must be a number',
        defaultValue: Defaults.wheel.rotation,
      });
      this._setCurrentIndex(this._getItemAngles(this._rotation));
      this._draw();
    }
    get rotationResistance() {
      return this._rotationResistance;
    }
    set rotationResistance(value) {
      this._rotationResistance = setProp({
        val: value,
        isValid: isNumber(value),
        errorMessage: 'Rotation resistance must be a number',
        defaultValue: Defaults.wheel.rotationResistance,
      });
    }
    get maxRotationSpeed() {
      return this._maxRotationSpeed;
    }
    set maxRotationSpeed(value) {
      this._maxRotationSpeed = setProp({
        val: value,
        isValid: isNumber(value),
        errorMessage: 'Max rotation speed must be a number',
        defaultValue: Defaults.wheel.maxRotationSpeed,
      });
    }
    _handlePointerDown(point = defaultPoint8) {
      if (this._element === null) return;
      const translated = translateXYToElement(point, this._element, this._getDpr());
      this._isDragging = true;
      this._resize();
      this._dragEvents = [{ distance: 0, x: translated.x, y: translated.y, now: performance.now() }];
      this._start();
    }
    _handlePointerMove(point = defaultPoint8) {
      if (this._element === null) return;
      const translated = translateXYToElement(point, this._element, this._getDpr());
      const currentAngle = this._getAngleFromEvent(translated);
      const lastEvent = this._dragEvents[this._dragEvents.length - 1];
      const lastAngle = this._getAngleFromEvent(lastEvent);
      const diff = diffAngle(lastAngle, currentAngle);
      this._dragEvents.push({ distance: diff, x: translated.x, y: translated.y, now: performance.now() });
      if (this._isDragging && this._dragEvents.length > 1) this._stopAnimation();
      this._rotation += diff;
    }
    _handlePointerUp() {
      this._isDragging = false;
      let total = 0;
      const now = performance.now();
      for (const [index, event] of this._dragEvents.entries()) {
        if (!this._isDragEventValid(now, event)) {
          total += event.distance;
          continue;
        }
        this._currentIndex = index;
        if (this._isDragging) this._fireCurrentIndexChange();
        break;
      }
      this._stopAnimation();
      if (total === 0) return;
      this._spinTo(total / (1000 / dragCapturePeriod), 'spin');
    }
    _isDragEventValid(now = 0, event = {}) {
      return now - event.now > dragCapturePeriod;
    }
    _fireCurrentIndexChange(event = {}) {
      this._onCurrentIndexChange?.({ type: 'currentIndexChange', currentIndex: this._currentIndex, ...event });
    }
    _fireRotationChange(event = {}) {
      this._onRotationChange?.({ type: 'rotationChange', currentIndex: this._currentIndex, rotation: this._rotation, ...event });
    }
    _fireEvent(event = {}) {
      this._onEvent?.({ type: 'event', ...event });
    }
  };

  export { Wheel };
})();
