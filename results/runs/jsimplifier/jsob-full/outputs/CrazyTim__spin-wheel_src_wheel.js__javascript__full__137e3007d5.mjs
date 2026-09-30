function getRandomInt(_0x386d29 = 0, _0x3f35fa = 0) {
  _0x386d29 = Math.ceil(_0x386d29);
  _0x3f35fa = Math.floor(_0x3f35fa);
  return Math.floor(Math.random() * (_0x3f35fa - _0x386d29)) + _0x386d29;
}
function getRandomFloat(_0x158a30 = 0, _0x2efc81 = 0, _0x16e1ca = 14) {
  return parseFloat((Math.random() * (_0x2efc81 - _0x158a30) + _0x158a30).toFixed(_0x16e1ca));
}
function degRad(_0x2a96e7 = 0) {
  return _0x2a96e7 * Math.PI / 180;
}
function isAngleBetween(_0x2a9162, _0x2b90b3, _0x138b35) {
  if (_0x2b90b3 < _0x138b35) {
    return _0x2b90b3 <= _0x2a9162 && _0x2a9162 < _0x138b35;
  }
  return _0x2b90b3 <= _0x2a9162 || _0x2a9162 < _0x138b35;
}
function aveArray(_0x3b4058 = []) {
  let _0x34c363 = 0;
  for (const _0x12baa6 of _0x3b4058) {
    if (_0x12baa6) {
      _0x34c363 += typeof _0x12baa6 === "number" ? _0x12baa6 : 1;
    }
  }
  return _0x34c363 / _0x3b4058.length || 0;
}
function getFontSizeToFit(_0x410d1a, _0x44bd41, _0x4234aa, _0x3864cc) {
  _0x3864cc.save();
  _0x3864cc.font = "1px " + _0x44bd41;
  const _0x4f6695 = _0x3864cc.measureText(_0x410d1a).width;
  _0x3864cc.restore();
  return _0x4234aa / _0x4f6695;
}
const _0x548b3f = {
  x: 0,
  y: 0
};
function isPointInCircle(_0x52958b = _0x548b3f, _0x843511, _0x28617b, _0x165057) {
  const _0x33367b = (_0x52958b.x - _0x843511) ** 2 + (_0x52958b.y - _0x28617b) ** 2;
  return _0x33367b <= _0x165057 ** 2;
}
const _0x13a702 = {
  x: 0,
  y: 0
};
function translateXYToElement(_0x366eee = _0x13a702, _0x3de411 = {}, _0x411d01 = 1) {
  const _0xbe2aa5 = _0x3de411.getBoundingClientRect();
  return {
    x: (_0x366eee.x - _0xbe2aa5.left) * _0x411d01,
    y: (_0x366eee.y - _0xbe2aa5.top) * _0x411d01
  };
}
function getMouseButtonsPressed(_0x58a7dc = {}) {
  return [1, 2, 4, 8, 16].filter(_0x1d4e40 => _0x58a7dc.buttons & _0x1d4e40);
}
function getAngle(_0x537af0, _0x494856, _0xae8bae, _0x5c387c) {
  const _0x2828fd = _0x537af0 - _0xae8bae;
  const _0x1fb602 = _0x494856 - _0x5c387c;
  let _0x499f8a = Math.atan2(-_0x1fb602, -_0x2828fd);
  _0x499f8a *= 180 / Math.PI;
  if (_0x499f8a < 0) {
    _0x499f8a += 360;
  }
  return _0x499f8a;
}
const _0x3bba9e = {
  x: 0,
  y: 0
};
const _0x35912c = {
  x: 0,
  y: 0
};
function getDistanceBetweenPoints(_0x4c60d8 = _0x3bba9e, _0x38429b = _0x35912c) {
  return Math.hypot(_0x38429b.x - _0x4c60d8.x, _0x38429b.y - _0x4c60d8.y);
}
function addAngle(_0x53a357 = 0, _0x3611be = 0) {
  const _0x25d895 = _0x53a357 + _0x3611be;
  let _0x54be6f;
  if (_0x25d895 > 0) {
    _0x54be6f = _0x25d895 % 360;
  } else {
    _0x54be6f = 360 + _0x25d895 % 360;
  }
  if (_0x54be6f === 360) {
    _0x54be6f = 0;
  }
  return _0x54be6f;
}
function diffAngle(_0x537b50 = 0, _0x43bdcf = 0) {
  const _0x161e9f = 180 - _0x43bdcf;
  const _0x40f5db = addAngle(_0x537b50, _0x161e9f);
  return 180 - _0x40f5db;
}
function calcWheelRotationForTargetAngle(_0x20369b = 0, _0x563fb1 = 0, _0x6322f3 = 1) {
  let _0x124801 = (_0x20369b % 360 + _0x563fb1) % 360;
  _0x124801 = fixFloat(_0x124801);
  _0x124801 = (_0x6322f3 === 1 ? 360 - _0x124801 : 360 + _0x124801) % 360;
  _0x124801 *= _0x6322f3;
  return _0x20369b + _0x124801;
}
function isObject(_0x2e4e67) {
  return typeof _0x2e4e67 === "object" && !Array.isArray(_0x2e4e67) && _0x2e4e67 !== null;
}
function isNumber(_0x9e4e33) {
  return typeof _0x9e4e33 === "number" && !Number.isNaN(_0x9e4e33);
}
function setProp({
  val: _0x1a3570,
  isValid: _0x332b4b,
  errorMessage: _0x3f6eb,
  defaultValue: _0x1f5553,
  action = null
}) {
  if (_0x332b4b) {
    if (action) {
      return action();
    } else {
      return _0x1a3570;
    }
  } else if (_0x1a3570 === undefined) {
    return _0x1f5553;
  }
  throw new Error(_0x3f6eb);
}
function fixFloat(_0x25dab4 = 0) {
  return Number(_0x25dab4.toFixed(9));
}
function easeSinOut(_0x15c273) {
  return Math.sin(_0x15c273 * Math.PI / 2);
}
function getResizeObserver(_0x378603 = {}, _0x13dbdd = {}) {
  if (window.ResizeObserver) {
    const _0x1363a9 = new ResizeObserver(() => {
      _0x13dbdd({
        redraw: true
      });
    });
    _0x1363a9.observe(_0x378603);
    return {
      stop: () => {
        _0x1363a9.unobserve(_0x378603);
        _0x1363a9.disconnect();
      }
    };
  }
  window.addEventListener("resize", _0x13dbdd);
  return {
    stop: () => {
      window.removeEventListener("resize", _0x13dbdd);
    }
  };
}
var arcAdjust = -90;
var baseCanvasSize = 500;
var dragCapturePeriod = 250;
var AlignText = Object.freeze({
  left: "left",
  right: "right",
  center: "center"
});
const _0x3da05c = {
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
  offset: {
    x: 0,
    y: 0
  },
  onCurrentIndexChange: null,
  onRest: null,
  onSpin: null,
  overlayImage: null,
  pointerAngle: 0
};
const _0x16b35e = {
  wheel: _0x3da05c,
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
    weight: 1
  }
};
var Defaults = Object.freeze(_0x16b35e);
var Debugging = Object.freeze({
  pointerLineColor: "#ff00ff",
  labelBoundingBoxColor: "#ff00ff",
  labelRadiusColor: "#00ff00",
  dragPointHue: 300
});
function register(_0x71a2c9 = {}) {
  registerPointerEvents(_0x71a2c9);
  _0x71a2c9._handler_onResize = getResizeObserver(_0x71a2c9._canvasContainer, ({
    redraw = true
  }) => {
    _0x71a2c9.resize();
    if (redraw) {
      _0x71a2c9.draw(performance.now());
    }
  });
  const _0x404af7 = () => {
    _0x71a2c9._mediaQueryList = window.matchMedia("(resolution: " + window.devicePixelRatio + "dppx)");
    _0x71a2c9._mediaQueryList.addEventListener("change", _0x71a2c9._handler_onDevicePixelRatioChange, {
      once: true
    });
  };
  _0x71a2c9._handler_onDevicePixelRatioChange = () => {
    _0x71a2c9.resize();
    _0x404af7();
  };
  _0x404af7();
}
function unregister(_0x1188bb = {}) {
  const _0x1ea2b2 = _0x1188bb.canvas;
  if ("PointerEvent" in window) {
    _0x1ea2b2.removeEventListener("pointerdown", _0x1188bb._handler_onPointerDown);
    _0x1ea2b2.removeEventListener("pointermove", _0x1188bb._handler_onPointerMoveRefreshCursor);
  } else {
    _0x1ea2b2.removeEventListener("touchstart", _0x1188bb._handler_onTouchStart);
    _0x1ea2b2.removeEventListener("mousedown", _0x1188bb._handler_onMouseDown);
    _0x1ea2b2.removeEventListener("mousemove", _0x1188bb._handler_onMouseMoveRefreshCursor);
  }
  _0x1188bb._handler_onResize.stop();
  _0x1188bb._mediaQueryList.removeEventListener("change", _0x1188bb._handler_onDevicePixelRatioChange);
}
function registerPointerEvents(_0x2bccaa = {}) {
  const _0x267043 = _0x2bccaa.canvas;
  _0x2bccaa._handler_onPointerMoveRefreshCursor = (_0x3eed61 = {}) => {
    const _0x177b9d = {
      x: _0x3eed61.clientX,
      y: _0x3eed61.clientY
    };
    const _0x3d964a = _0x177b9d;
    _0x2bccaa._isCursorOverWheel = _0x2bccaa.wheelHitTest(_0x3d964a);
    _0x2bccaa.refreshCursor();
  };
  _0x2bccaa._handler_onMouseMoveRefreshCursor = (_0x37aca1 = {}) => {
    const _0x158507 = {
      x: _0x37aca1.clientX,
      y: _0x37aca1.clientY
    };
    const _0x4bd95b = _0x158507;
    _0x2bccaa._isCursorOverWheel = _0x2bccaa.wheelHitTest(_0x4bd95b);
    _0x2bccaa.refreshCursor();
  };
  _0x2bccaa._handler_onPointerDown = (_0xbc5a8d = {}) => {
    const _0x5dfc5c = {
      x: _0xbc5a8d.clientX,
      y: _0xbc5a8d.clientY
    };
    const _0x362408 = _0x5dfc5c;
    if (!_0x2bccaa.isInteractive) {
      return;
    }
    if (!_0x2bccaa.wheelHitTest(_0x362408)) {
      return;
    }
    _0xbc5a8d.preventDefault();
    _0x2bccaa.dragStart(_0x362408);
    _0x267043.setPointerCapture(_0xbc5a8d.pointerId);
    _0x267043.addEventListener("pointermove", _0x7e0cfb);
    _0x267043.addEventListener("pointerup", _0x220c4a);
    _0x267043.addEventListener("pointercancel", _0x220c4a);
    _0x267043.addEventListener("pointerout", _0x220c4a);
    function _0x7e0cfb(_0x56593f = {}) {
      _0x56593f.preventDefault();
      const _0x5abec1 = {
        x: _0x56593f.clientX,
        y: _0x56593f.clientY
      };
      _0x2bccaa.dragMove(_0x5abec1);
    }
    function _0x220c4a(_0xddcd44 = {}) {
      _0xddcd44.preventDefault();
      _0x267043.releasePointerCapture(_0xddcd44.pointerId);
      _0x267043.removeEventListener("pointermove", _0x7e0cfb);
      _0x267043.removeEventListener("pointerup", _0x220c4a);
      _0x267043.removeEventListener("pointercancel", _0x220c4a);
      _0x267043.removeEventListener("pointerout", _0x220c4a);
      _0x2bccaa.dragEnd();
    }
  };
  _0x2bccaa._handler_onMouseDown = (_0x5c0bdb = {}) => {
    const _0x5a8d5d = {
      x: _0x5c0bdb.clientX,
      y: _0x5c0bdb.clientY
    };
    const _0x4a2292 = _0x5a8d5d;
    if (!_0x2bccaa.isInteractive) {
      return;
    }
    if (!_0x2bccaa.wheelHitTest(_0x4a2292)) {
      return;
    }
    _0x2bccaa.dragStart(_0x4a2292);
    document.addEventListener("mousemove", _0x3003f3);
    document.addEventListener("mouseup", _0x262a74);
    function _0x3003f3(_0x541be1 = {}) {
      _0x541be1.preventDefault();
      const _0x5265d9 = {
        x: _0x541be1.clientX,
        y: _0x541be1.clientY
      };
      _0x2bccaa.dragMove(_0x5265d9);
    }
    function _0x262a74(_0x867379 = {}) {
      _0x867379.preventDefault();
      document.removeEventListener("mousemove", _0x3003f3);
      document.removeEventListener("mouseup", _0x262a74);
      _0x2bccaa.dragEnd();
    }
  };
  _0x2bccaa._handler_onTouchStart = (_0x331aed = {}) => {
    const _0x41371f = {
      x: _0x331aed.targetTouches[0].clientX,
      y: _0x331aed.targetTouches[0].clientY
    };
    const _0x2ada77 = _0x41371f;
    if (!_0x2bccaa.isInteractive) {
      return;
    }
    if (!_0x2bccaa.wheelHitTest(_0x2ada77)) {
      return;
    }
    _0x331aed.preventDefault();
    _0x2bccaa.dragStart(_0x2ada77);
    _0x267043.addEventListener("touchmove", _0x18fa10);
    _0x267043.addEventListener("touchend", _0x4bed4c);
    _0x267043.addEventListener("touchcancel", _0x4bed4c);
    function _0x18fa10(_0x57f160 = {}) {
      _0x57f160.preventDefault();
      const _0x74f1de = {
        x: _0x57f160.targetTouches[0].clientX,
        y: _0x57f160.targetTouches[0].clientY
      };
      _0x2bccaa.dragMove(_0x74f1de);
    }
    function _0x4bed4c(_0x268218 = {}) {
      _0x268218.preventDefault();
      _0x267043.removeEventListener("touchmove", _0x18fa10);
      _0x267043.removeEventListener("touchend", _0x4bed4c);
      _0x267043.removeEventListener("touchcancel", _0x4bed4c);
      _0x2bccaa.dragEnd();
    }
  };
  if ("PointerEvent" in window) {
    _0x267043.addEventListener("pointerdown", _0x2bccaa._handler_onPointerDown);
    _0x267043.addEventListener("pointermove", _0x2bccaa._handler_onPointerMoveRefreshCursor);
  } else {
    _0x267043.addEventListener("touchstart", _0x2bccaa._handler_onTouchStart);
    _0x267043.addEventListener("mousedown", _0x2bccaa._handler_onMouseDown);
    _0x267043.addEventListener("mousemove", _0x2bccaa._handler_onMouseMoveRefreshCursor);
  }
}
var Item = class {
  constructor(_0x102b97, _0x125616 = {}) {
    if (!isObject(_0x102b97)) {
      throw new Error("wheel must be an instance of Wheel");
    }
    if (!isObject(_0x125616) && _0x125616 !== null) {
      throw new Error("props must be an Object or null");
    }
    this._wheel = _0x102b97;
    for (const _0x206296 of Object.keys(Defaults.item)) {
      this["_" + _0x206296] = Defaults.item[_0x206296];
    }
    if (_0x125616) {
      this.init(_0x125616);
    } else {
      this.init(Defaults.item);
    }
  }
  init(_0xbd3bdd = {}) {
    this.backgroundColor = _0xbd3bdd.backgroundColor;
    this.image = _0xbd3bdd.image;
    this.imageOpacity = _0xbd3bdd.imageOpacity;
    this.imageRadius = _0xbd3bdd.imageRadius;
    this.imageRotation = _0xbd3bdd.imageRotation;
    this.imageScale = _0xbd3bdd.imageScale;
    this.label = _0xbd3bdd.label;
    this.labelColor = _0xbd3bdd.labelColor;
    this.value = _0xbd3bdd.value;
    this.weight = _0xbd3bdd.weight;
  }
  get backgroundColor() {
    return this._backgroundColor;
  }
  set backgroundColor(_0x57a52f) {
    if (typeof _0x57a52f === "string") {
      this._backgroundColor = _0x57a52f;
    } else {
      this._backgroundColor = Defaults.item.backgroundColor;
    }
    this._wheel.refresh();
  }
  get image() {
    return this._image;
  }
  set image(_0x585db4) {
    if (_0x585db4 instanceof HTMLImageElement) {
      this._image = _0x585db4;
    } else {
      this._image = Defaults.item.image;
    }
    this._wheel.refresh();
  }
  get imageOpacity() {
    return this._imageOpacity;
  }
  set imageOpacity(_0x5237be) {
    if (typeof _0x5237be === "number") {
      this._imageOpacity = _0x5237be;
    } else {
      this._imageOpacity = Defaults.item.imageOpacity;
    }
    this._wheel.refresh();
  }
  get imageRadius() {
    return this._imageRadius;
  }
  set imageRadius(_0x5509fe) {
    if (typeof _0x5509fe === "number") {
      this._imageRadius = _0x5509fe;
    } else {
      this._imageRadius = Defaults.item.imageRadius;
    }
    this._wheel.refresh();
  }
  get imageRotation() {
    return this._imageRotation;
  }
  set imageRotation(_0x319e4a) {
    if (typeof _0x319e4a === "number") {
      this._imageRotation = _0x319e4a;
    } else {
      this._imageRotation = Defaults.item.imageRotation;
    }
    this._wheel.refresh();
  }
  get imageScale() {
    return this._imageScale;
  }
  set imageScale(_0x196a53) {
    if (typeof _0x196a53 === "number") {
      this._imageScale = _0x196a53;
    } else {
      this._imageScale = Defaults.item.imageScale;
    }
    this._wheel.refresh();
  }
  get label() {
    return this._label;
  }
  set label(_0x354b2e) {
    if (typeof _0x354b2e === "string") {
      this._label = _0x354b2e;
    } else {
      this._label = Defaults.item.label;
    }
    this._wheel.refresh();
  }
  get labelColor() {
    return this._labelColor;
  }
  set labelColor(_0x38775f) {
    if (typeof _0x38775f === "string") {
      this._labelColor = _0x38775f;
    } else {
      this._labelColor = Defaults.item.labelColor;
    }
    this._wheel.refresh();
  }
  get value() {
    return this._value;
  }
  set value(_0x4c6f06) {
    if (_0x4c6f06 !== undefined) {
      this._value = _0x4c6f06;
    } else {
      this._value = Defaults.item.value;
    }
  }
  get weight() {
    return this._weight;
  }
  set weight(_0xfb2a1e) {
    if (typeof _0xfb2a1e === "number") {
      this._weight = _0xfb2a1e;
    } else {
      this._weight = Defaults.item.weight;
    }
  }
  getIndex() {
    const _0x5b998d = this._wheel.items.findIndex(_0x51f0ff => _0x51f0ff === this);
    if (_0x5b998d === -1) {
      throw new Error("Item not found in parent Wheel");
    }
    return _0x5b998d;
  }
  getCenterAngle() {
    const _0x30db18 = this._wheel.getItemAngles()[this.getIndex()];
    return _0x30db18.start + (_0x30db18.end - _0x30db18.start) / 2;
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
};
const _0x149a43 = {
  x: 0,
  y: 0
};
const _0x2cd2b4 = {
  x: 0,
  y: 0
};
const _0x1ef178 = {
  x: 0,
  y: 0
};
const _0x14f7cd = {
  x: 0,
  y: 0
};
var Wheel = class {
  constructor(_0x4774e0, _0x2ac180 = {}) {
    if (!(_0x4774e0 instanceof Element)) {
      throw new Error("container must be an instance of Element");
    }
    if (!isObject(_0x2ac180) && _0x2ac180 !== null) {
      throw new Error("props must be an Object or null");
    }
    this._frameRequestId = null;
    this._rotationSpeed = 0;
    this._rotationDirection = 1;
    this._spinToTimeEnd = null;
    this._lastSpinFrameTime = null;
    this._isCursorOverWheel = false;
    this.add(_0x4774e0);
    for (const _0x58eef0 of Object.keys(Defaults.wheel)) {
      this["_" + _0x58eef0] = Defaults.wheel[_0x58eef0];
    }
    if (_0x2ac180) {
      this.init(_0x2ac180);
    } else {
      this.init(Defaults.wheel);
    }
  }
  init(_0x545619 = {}) {
    this._isInitialising = true;
    this.borderColor = _0x545619.borderColor;
    this.borderWidth = _0x545619.borderWidth;
    this.debug = _0x545619.debug;
    this.image = _0x545619.image;
    this.isInteractive = _0x545619.isInteractive;
    this.itemBackgroundColors = _0x545619.itemBackgroundColors;
    this.itemLabelAlign = _0x545619.itemLabelAlign;
    this.itemLabelBaselineOffset = _0x545619.itemLabelBaselineOffset;
    this.itemLabelColors = _0x545619.itemLabelColors;
    this.itemLabelFont = _0x545619.itemLabelFont;
    this.itemLabelFontSizeMax = _0x545619.itemLabelFontSizeMax;
    this.itemLabelRadius = _0x545619.itemLabelRadius;
    this.itemLabelRadiusMax = _0x545619.itemLabelRadiusMax;
    this.itemLabelRotation = _0x545619.itemLabelRotation;
    this.itemLabelStrokeColor = _0x545619.itemLabelStrokeColor;
    this.itemLabelStrokeWidth = _0x545619.itemLabelStrokeWidth;
    this.items = _0x545619.items;
    this.lineColor = _0x545619.lineColor;
    this.lineWidth = _0x545619.lineWidth;
    this.pixelRatio = _0x545619.pixelRatio;
    this.rotationSpeedMax = _0x545619.rotationSpeedMax;
    this.radius = _0x545619.radius;
    this.rotation = _0x545619.rotation;
    this.rotationResistance = _0x545619.rotationResistance;
    this.offset = _0x545619.offset;
    this.onCurrentIndexChange = _0x545619.onCurrentIndexChange;
    this.onRest = _0x545619.onRest;
    this.onSpin = _0x545619.onSpin;
    this.overlayImage = _0x545619.overlayImage;
    this.pointerAngle = _0x545619.pointerAngle;
  }
  add(_0x23fd9b) {
    this._canvasContainer = _0x23fd9b;
    this.canvas = document.createElement("canvas");
    this.canvas.style.display = "block";
    this._context = this.canvas.getContext("2d");
    this._canvasContainer.append(this.canvas);
    register(this);
    if (this._isInitialising === false) {
      this.resize();
    }
  }
  remove() {
    if (this.canvas === null) {
      return;
    }
    if (this._frameRequestId !== null) {
      window.cancelAnimationFrame(this._frameRequestId);
    }
    unregister(this);
    this._canvasContainer.removeChild(this.canvas);
    this._canvasContainer = null;
    this.canvas = null;
    this._context = null;
  }
  resize() {
    if (this.canvas === null) {
      return;
    }
    this.canvas.style.width = this._canvasContainer.clientWidth + "px";
    this.canvas.style.height = this._canvasContainer.clientHeight + "px";
    const [_0x1a0372, _0x2da734] = [this._canvasContainer.clientWidth * this.getActualPixelRatio(), this._canvasContainer.clientHeight * this.getActualPixelRatio()];
    this.canvas.width = _0x1a0372;
    this.canvas.height = _0x2da734;
    const _0x302003 = Math.min(_0x1a0372, _0x2da734);
    const _0x3c9eeb = {
      w: _0x302003 - _0x302003 * this._offset.x,
      h: _0x302003 - _0x302003 * this._offset.y
    };
    const _0x3d9b63 = Math.min(_0x1a0372 / _0x3c9eeb.w, _0x2da734 / _0x3c9eeb.h);
    this._size = Math.max(_0x3c9eeb.w * _0x3d9b63, _0x3c9eeb.h * _0x3d9b63);
    this._center = {
      x: _0x1a0372 / 2 + _0x1a0372 * this._offset.x,
      y: _0x2da734 / 2 + _0x2da734 * this._offset.y
    };
    this._actualRadius = this._size / 2 * this.radius;
    this._itemLabelFontSize = this.itemLabelFontSizeMax * (this._size / baseCanvasSize);
    this._labelMaxWidth = this._actualRadius * (this.itemLabelRadius - this.itemLabelRadiusMax);
    if (this.itemLabelAlign === "center") {
      this._labelMaxWidth *= 2;
    }
    for (const _0x3649f9 of this._items) {
      this._itemLabelFontSize = Math.min(this._itemLabelFontSize, getFontSizeToFit(_0x3649f9.label, this.itemLabelFont, this._labelMaxWidth, this._context));
    }
    this.refresh();
  }
  draw(_0x3eda06 = 0) {
    this._frameRequestId = null;
    if (this._context === null || this.canvas === null) {
      return;
    }
    const _0x1b6477 = this._context;
    _0x1b6477.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.animateRotation(_0x3eda06);
    const _0x34c52e = this.getItemAngles(this._rotation);
    const _0x19be08 = this.getScaledNumber(this._borderWidth);
    _0x1b6477.textBaseline = "middle";
    _0x1b6477.textAlign = this.itemLabelAlign;
    _0x1b6477.font = this._itemLabelFontSize + "px " + this.itemLabelFont;
    for (const [_0x53aa50, _0x1cf9f] of _0x34c52e.entries()) {
      const _0x50d853 = this._items[_0x53aa50];
      const _0x33cdd1 = new Path2D();
      _0x33cdd1.moveTo(this._center.x, this._center.y);
      _0x33cdd1.arc(this._center.x, this._center.y, this._actualRadius - _0x19be08 / 2, degRad(_0x1cf9f.start + arcAdjust), degRad(_0x1cf9f.end + arcAdjust));
      _0x50d853.path = _0x33cdd1;
    }
    this.drawItemBackgrounds(_0x1b6477, _0x34c52e);
    this.drawItemImages(_0x1b6477, _0x34c52e);
    this.drawItemLines(_0x1b6477, _0x34c52e);
    this.drawItemLabels(_0x1b6477, _0x34c52e);
    this.drawBorder(_0x1b6477);
    this.drawImage(_0x1b6477, this._image, false);
    this.drawImage(_0x1b6477, this._overlayImage, true);
    this.drawDebugPointerLine(_0x1b6477);
    this._isInitialising = false;
  }
  drawItemBackgrounds(_0xfd273c, _0x15d4a5 = []) {
    for (const [_0x56e199, _0x5eacc7] of _0x15d4a5.entries()) {
      const _0x4a226f = this._items[_0x56e199];
      _0xfd273c.fillStyle = _0x4a226f.backgroundColor ?? this._itemBackgroundColors[_0x56e199 % this._itemBackgroundColors.length];
      _0xfd273c.fill(_0x4a226f.path);
    }
  }
  drawItemImages(_0x5c4133, _0x19a87c = []) {
    for (const [_0x2c289a, _0x1ccd3e] of _0x19a87c.entries()) {
      const _0x59973f = this._items[_0x2c289a];
      if (_0x59973f.image === null) {
        continue;
      }
      _0x5c4133.save();
      _0x5c4133.clip(_0x59973f.path);
      const _0x58e558 = _0x1ccd3e.start + (_0x1ccd3e.end - _0x1ccd3e.start) / 2;
      _0x5c4133.translate(this._center.x + Math.cos(degRad(_0x58e558 + arcAdjust)) * (this._actualRadius * _0x59973f.imageRadius), this._center.y + Math.sin(degRad(_0x58e558 + arcAdjust)) * (this._actualRadius * _0x59973f.imageRadius));
      _0x5c4133.rotate(degRad(_0x58e558 + _0x59973f.imageRotation));
      _0x5c4133.globalAlpha = _0x59973f.imageOpacity;
      const _0x16778f = this._size / 500 * _0x59973f.image.width * _0x59973f.imageScale;
      const _0x3c4900 = this._size / 500 * _0x59973f.image.height * _0x59973f.imageScale;
      const _0x4265c2 = -_0x16778f / 2;
      const _0x8209e6 = -_0x3c4900 / 2;
      _0x5c4133.drawImage(_0x59973f.image, _0x4265c2, _0x8209e6, _0x16778f, _0x3c4900);
      _0x5c4133.restore();
    }
  }
  drawImage(_0x1baead, _0x4a816e, _0x4d3a5b = false) {
    if (_0x4a816e === null) {
      return;
    }
    _0x1baead.translate(this._center.x, this._center.y);
    if (!_0x4d3a5b) {
      _0x1baead.rotate(degRad(this._rotation));
    }
    const _0x4e0765 = _0x4d3a5b ? this._size : this._size * this.radius;
    const _0x1ebd45 = -(_0x4e0765 / 2);
    _0x1baead.drawImage(_0x4a816e, _0x1ebd45, _0x1ebd45, _0x4e0765, _0x4e0765);
    _0x1baead.resetTransform();
  }
  drawDebugPointerLine(_0x4ab19f) {
    if (!this.debug) {
      return;
    }
    _0x4ab19f.translate(this._center.x, this._center.y);
    _0x4ab19f.rotate(degRad(this._pointerAngle + arcAdjust));
    _0x4ab19f.beginPath();
    _0x4ab19f.moveTo(0, 0);
    _0x4ab19f.lineTo(this._actualRadius * 2, 0);
    _0x4ab19f.strokeStyle = Debugging.pointerLineColor;
    _0x4ab19f.lineWidth = this.getScaledNumber(2);
    _0x4ab19f.stroke();
    _0x4ab19f.resetTransform();
  }
  drawBorder(_0x384b17) {
    if (this._borderWidth <= 0) {
      return;
    }
    const _0x205f01 = this.getScaledNumber(this._borderWidth);
    const _0xed753c = this._borderColor || "transparent";
    _0x384b17.beginPath();
    _0x384b17.strokeStyle = _0xed753c;
    _0x384b17.lineWidth = _0x205f01;
    _0x384b17.arc(this._center.x, this._center.y, this._actualRadius - _0x205f01 / 2, 0, Math.PI * 2);
    _0x384b17.stroke();
    if (this.debug) {
      const _0x44ee1b = this.getScaledNumber(1);
      _0x384b17.beginPath();
      _0x384b17.strokeStyle = _0x384b17.strokeStyle = Debugging.labelRadiusColor;
      _0x384b17.lineWidth = _0x44ee1b;
      _0x384b17.arc(this._center.x, this._center.y, this._actualRadius * this.itemLabelRadius, 0, Math.PI * 2);
      _0x384b17.stroke();
      _0x384b17.beginPath();
      _0x384b17.strokeStyle = _0x384b17.strokeStyle = Debugging.labelRadiusColor;
      _0x384b17.lineWidth = _0x44ee1b;
      _0x384b17.arc(this._center.x, this._center.y, this._actualRadius * this.itemLabelRadiusMax, 0, Math.PI * 2);
      _0x384b17.stroke();
    }
  }
  drawItemLines(_0x3f60f6, _0x4533ec = []) {
    if (this._lineWidth <= 0) {
      return;
    }
    const _0x11a42b = this.getScaledNumber(this._lineWidth);
    const _0x75efae = this.getScaledNumber(this._borderWidth);
    _0x3f60f6.translate(this._center.x, this._center.y);
    for (const _0x4b28ee of _0x4533ec) {
      _0x3f60f6.rotate(degRad(_0x4b28ee.start + arcAdjust));
      _0x3f60f6.beginPath();
      _0x3f60f6.moveTo(0, 0);
      _0x3f60f6.lineTo(this._actualRadius - _0x75efae, 0);
      _0x3f60f6.strokeStyle = this.lineColor;
      _0x3f60f6.lineWidth = _0x11a42b;
      _0x3f60f6.stroke();
      _0x3f60f6.rotate(-degRad(_0x4b28ee.start + arcAdjust));
    }
    _0x3f60f6.resetTransform();
  }
  drawItemLabels(_0x12c064, _0x5c1b01 = []) {
    const _0x22c4d4 = this._itemLabelFontSize * -this.itemLabelBaselineOffset;
    const _0x52d22a = this.getScaledNumber(1);
    const _0x594792 = this.getScaledNumber(this._itemLabelStrokeWidth * 2);
    for (const [_0x11670b, _0x4800b9] of _0x5c1b01.entries()) {
      const _0x403380 = this._items[_0x11670b];
      const _0x5b712e = _0x403380.labelColor || this._itemLabelColors[_0x11670b % this._itemLabelColors.length] || "transparent";
      if (_0x403380.label.trim() === "" || _0x5b712e === "transparent") {
        continue;
      }
      _0x12c064.save();
      _0x12c064.clip(_0x403380.path);
      const _0x59d3d4 = _0x4800b9.start + (_0x4800b9.end - _0x4800b9.start) / 2;
      _0x12c064.translate(this._center.x + Math.cos(degRad(_0x59d3d4 + arcAdjust)) * (this._actualRadius * this.itemLabelRadius), this._center.y + Math.sin(degRad(_0x59d3d4 + arcAdjust)) * (this._actualRadius * this.itemLabelRadius));
      _0x12c064.rotate(degRad(_0x59d3d4 + arcAdjust));
      _0x12c064.rotate(degRad(this.itemLabelRotation));
      if (this.debug) {
        _0x12c064.save();
        let _0x4fcad1 = 0;
        if (this.itemLabelAlign === "left") {
          _0x4fcad1 = this._labelMaxWidth;
        } else if (this.itemLabelAlign === "center") {
          _0x4fcad1 = this._labelMaxWidth / 2;
        }
        _0x12c064.beginPath();
        _0x12c064.moveTo(_0x4fcad1, 0);
        _0x12c064.lineTo(-this._labelMaxWidth + _0x4fcad1, 0);
        _0x12c064.strokeStyle = Debugging.labelBoundingBoxColor;
        _0x12c064.lineWidth = _0x52d22a;
        _0x12c064.stroke();
        _0x12c064.strokeRect(_0x4fcad1, -this._itemLabelFontSize / 2, -this._labelMaxWidth, this._itemLabelFontSize);
        _0x12c064.restore();
      }
      if (this._itemLabelStrokeWidth > 0) {
        _0x12c064.lineWidth = _0x594792;
        _0x12c064.strokeStyle = this._itemLabelStrokeColor;
        _0x12c064.lineJoin = "round";
        _0x12c064.strokeText(_0x403380.label, 0, _0x22c4d4);
      }
      _0x12c064.fillStyle = _0x5b712e;
      _0x12c064.fillText(_0x403380.label, 0, _0x22c4d4);
      if (this.debug) {
        const _0x12a6d8 = this.getScaledNumber(2);
        _0x12c064.beginPath();
        _0x12c064.arc(0, 0, _0x12a6d8, 0, Math.PI * 2);
        _0x12c064.fillStyle = Debugging.labelRadiusColor;
        _0x12c064.fill();
      }
      _0x12c064.restore();
    }
  }
  drawDebugDragPoints(_0x25c7a8) {
    if (!this.debug || !((this != null ? undefined : this._dragEvents) != null ? undefined : (this != null ? undefined : this._dragEvents).length)) {
      return;
    }
    const _0x31bbed = [].concat(this._dragEvents).reverse();
    const _0x395ca5 = this.getScaledNumber(0.5);
    const _0x1ee891 = this.getScaledNumber(4);
    for (const [_0x277c20, _0x34040e] of _0x31bbed.entries()) {
      const _0x227828 = _0x277c20 / this._dragEvents.length * 100;
      _0x25c7a8.beginPath();
      _0x25c7a8.arc(_0x34040e.x, _0x34040e.y, _0x1ee891, 0, Math.PI * 2);
      _0x25c7a8.fillStyle = "hsl(" + Debugging.dragPointHue + ",100%," + _0x227828 + "%)";
      _0x25c7a8.strokeStyle = "#000";
      _0x25c7a8.lineWidth = _0x395ca5;
      _0x25c7a8.fill();
      _0x25c7a8.stroke();
    }
  }
  animateRotation(_0x3698dc = 0) {
    if (this._spinToTimeEnd !== null) {
      if (_0x3698dc >= this._spinToTimeEnd) {
        this.rotation = this._spinToEndRotation;
        this._spinToTimeEnd = null;
        this.raiseEvent_onRest();
        return;
      }
      const _0x92c9a3 = this._spinToTimeEnd - this._spinToTimeStart;
      let _0x44b3d1 = (_0x3698dc - this._spinToTimeStart) / _0x92c9a3;
      _0x44b3d1 = _0x44b3d1 < 0 ? 0 : _0x44b3d1;
      const _0x429958 = this._spinToEndRotation - this._spinToStartRotation;
      this.rotation = this._spinToStartRotation + _0x429958 * this._spinToEasingFunction(_0x44b3d1);
      this.refresh();
      return;
    }
    if (this._lastSpinFrameTime !== null) {
      const _0x3e0e6e = _0x3698dc - this._lastSpinFrameTime;
      if (_0x3e0e6e > 0) {
        this.rotation += _0x3e0e6e / 1000 * this._rotationSpeed % 360;
        this._rotationSpeed = this.getRotationSpeedPlusDrag(_0x3e0e6e);
        if (this._rotationSpeed === 0) {
          this.raiseEvent_onRest();
          this._lastSpinFrameTime = null;
        } else {
          this._lastSpinFrameTime = _0x3698dc;
        }
      }
      this.refresh();
      return;
    }
  }
  getRotationSpeedPlusDrag(_0x53bb1f = 0) {
    const _0x5c6c1b = this._rotationSpeed + this.rotationResistance * (_0x53bb1f / 1000) * this._rotationDirection;
    if (this._rotationDirection === 1 && _0x5c6c1b < 0 || this._rotationDirection === -1 && _0x5c6c1b >= 0) {
      return 0;
    }
    return _0x5c6c1b;
  }
  spin(_0x339ecd = 0) {
    if (!isNumber(_0x339ecd)) {
      throw new Error("rotationSpeed must be a number");
    }
    this._dragEvents = [];
    this.beginSpin(_0x339ecd, "spin");
  }
  spinTo(_0x7f84fe = 0, _0x18ae94 = 0, _0xfce539 = null) {
    if (!isNumber(_0x7f84fe)) {
      throw new Error("Error: rotation must be a number");
    }
    if (!isNumber(_0x18ae94)) {
      throw new Error("Error: duration must be a number");
    }
    this.stop();
    this._dragEvents = [];
    this.animate(_0x7f84fe, _0x18ae94, _0xfce539);
    const _0x5208b1 = {
      method: "spinto",
      targetRotation: _0x7f84fe,
      duration: _0x18ae94
    };
    this.raiseEvent_onSpin(_0x5208b1);
  }
  spinToItem(_0x342db9 = 0, _0x422895 = 0, _0x3bddfa = true, _0x28d1b5 = 1, _0x1db15a = 1, _0x266702 = null) {
    this.stop();
    this._dragEvents = [];
    const _0x396a75 = _0x3bddfa ? this.items[_0x342db9].getCenterAngle() : this.items[_0x342db9].getRandomAngle();
    let _0x22a050 = calcWheelRotationForTargetAngle(this.rotation, _0x396a75 - this._pointerAngle, _0x1db15a);
    _0x22a050 += _0x28d1b5 * 360 * _0x1db15a;
    this.animate(_0x22a050, _0x422895, _0x266702);
    const _0x555845 = {
      method: "spintoitem",
      targetItemIndex: _0x342db9,
      targetRotation: _0x22a050,
      duration: _0x422895
    };
    this.raiseEvent_onSpin(_0x555845);
  }
  animate(_0x11a743, _0x406d17, _0x1c426a) {
    this._spinToStartRotation = this.rotation;
    this._spinToEndRotation = _0x11a743;
    this._spinToTimeStart = performance.now();
    this._spinToTimeEnd = this._spinToTimeStart + _0x406d17;
    this._spinToEasingFunction = _0x1c426a || easeSinOut;
    this.refresh();
  }
  stop() {
    this._spinToTimeEnd = null;
    this._rotationSpeed = 0;
    this._lastSpinFrameTime = null;
  }
  getScaledNumber(_0x2bac41) {
    return _0x2bac41 / baseCanvasSize * this._size;
  }
  getActualPixelRatio() {
    if (this._pixelRatio !== 0) {
      return this._pixelRatio;
    } else {
      return window.devicePixelRatio;
    }
  }
  wheelHitTest(_0x1cc479 = _0x149a43) {
    if (this.canvas === null) {
      return false;
    }
    const _0xe4545e = translateXYToElement(_0x1cc479, this.canvas, this.getActualPixelRatio());
    return isPointInCircle(_0xe4545e, this._center.x, this._center.y, this._actualRadius);
  }
  refreshCursor() {
    if (this.canvas === null) {
      return;
    }
    if (this.isInteractive) {
      if (this.isDragging) {
        this.canvas.style.cursor = "grabbing";
        return;
      }
      if (this._isCursorOverWheel) {
        this.canvas.style.cursor = "grab";
        return;
      }
    }
    this.canvas.style.cursor = "";
  }
  getAngleFromCenter(_0x4f0836 = _0x2cd2b4) {
    return (getAngle(this._center.x, this._center.y, _0x4f0836.x, _0x4f0836.y) + 90) % 360;
  }
  getCurrentIndex() {
    return this._currentIndex;
  }
  refreshCurrentIndex(_0x33c047 = []) {
    if (this._items.length === 0) {
      this._currentIndex = -1;
    }
    for (const [_0x948840, _0x178c14] of _0x33c047.entries()) {
      if (!isAngleBetween(this._pointerAngle, _0x178c14.start % 360, _0x178c14.end % 360)) {
        continue;
      }
      if (this._currentIndex === _0x948840) {
        break;
      }
      this._currentIndex = _0x948840;
      if (!this._isInitialising) {
        this.raiseEvent_onCurrentIndexChange();
      }
      break;
    }
  }
  getItemAngles(_0x4c2f01 = 0) {
    let _0x481674 = 0;
    for (const _0x3c08ee of this.items) {
      _0x481674 += _0x3c08ee.weight;
    }
    const _0x5d8eba = 360 / _0x481674;
    let _0x44cb5e;
    let _0x441100 = _0x4c2f01;
    const _0x432c73 = [];
    for (const _0x482ef4 of this._items) {
      _0x44cb5e = _0x482ef4.weight * _0x5d8eba;
      _0x432c73.push({
        start: _0x441100,
        end: _0x441100 + _0x44cb5e
      });
      _0x441100 += _0x44cb5e;
    }
    if (this._items.length > 1) {
      _0x432c73[_0x432c73.length - 1].end = _0x432c73[0].start + 360;
    }
    return _0x432c73;
  }
  refresh() {
    if (this._frameRequestId === null) {
      this._frameRequestId = window.requestAnimationFrame(_0x4fd2a4 => this.draw(_0x4fd2a4));
    }
  }
  limitSpeed(_0x5395be = 0, _0x566ebd = 0) {
    const _0x1627bc = Math.min(_0x5395be, _0x566ebd);
    return Math.max(_0x1627bc, -_0x566ebd);
  }
  beginSpin(_0x126d3a = 0, _0x5c56b5 = "") {
    this.stop();
    this._rotationSpeed = this.limitSpeed(_0x126d3a, this._rotationSpeedMax);
    this._lastSpinFrameTime = performance.now();
    this._rotationDirection = this._rotationSpeed >= 0 ? 1 : -1;
    if (this._rotationSpeed !== 0) {
      this.raiseEvent_onSpin({
        method: _0x5c56b5,
        rotationSpeed: this._rotationSpeed,
        rotationResistance: this._rotationResistance
      });
    }
    this.refresh();
  }
  refreshAriaLabel() {
    if (this.canvas === null) {
      return;
    }
    this.canvas.setAttribute("role", "img");
    const _0x23fa8f = this.items.length >= 2 ? " The wheel has " + this.items.length + " slices." : "";
    this.canvas.setAttribute("aria-label", "An image of a spinning prize wheel." + _0x23fa8f);
  }
  get borderColor() {
    return this._borderColor;
  }
  set borderColor(_0x542f1c) {
    this._borderColor = setProp({
      val: _0x542f1c,
      isValid: typeof _0x542f1c === "string",
      errorMessage: "Wheel.borderColor must be a string",
      defaultValue: Defaults.wheel.borderColor
    });
    this.refresh();
  }
  get borderWidth() {
    return this._borderWidth;
  }
  set borderWidth(_0x37fc68) {
    this._borderWidth = setProp({
      val: _0x37fc68,
      isValid: isNumber(_0x37fc68),
      errorMessage: "Wheel.borderWidth must be a number",
      defaultValue: Defaults.wheel.borderWidth
    });
    this.refresh();
  }
  get debug() {
    return this._debug;
  }
  set debug(_0x4a5b46) {
    this._debug = setProp({
      val: _0x4a5b46,
      isValid: typeof _0x4a5b46 === "boolean",
      errorMessage: "Wheel.debug must be a boolean",
      defaultValue: Defaults.wheel.debug
    });
    this.refresh();
  }
  get image() {
    return this._image;
  }
  set image(_0x12bde3) {
    this._image = setProp({
      val: _0x12bde3,
      isValid: _0x12bde3 instanceof HTMLImageElement || _0x12bde3 === null,
      errorMessage: "Wheel.image must be a HTMLImageElement or null",
      defaultValue: Defaults.wheel.image
    });
    this.refresh();
  }
  get isInteractive() {
    return this._isInteractive;
  }
  set isInteractive(_0x3fc983) {
    this._isInteractive = setProp({
      val: _0x3fc983,
      isValid: typeof _0x3fc983 === "boolean",
      errorMessage: "Wheel.isInteractive must be a boolean",
      defaultValue: Defaults.wheel.isInteractive
    });
    this.refreshCursor();
  }
  get itemBackgroundColors() {
    return this._itemBackgroundColors;
  }
  set itemBackgroundColors(_0x1d75f6) {
    this._itemBackgroundColors = setProp({
      val: _0x1d75f6,
      isValid: Array.isArray(_0x1d75f6),
      errorMessage: "Wheel.itemBackgroundColors must be an array",
      defaultValue: Defaults.wheel.itemBackgroundColors
    });
    this.refresh();
  }
  get itemLabelAlign() {
    return this._itemLabelAlign;
  }
  set itemLabelAlign(_0x2a95af) {
    this._itemLabelAlign = setProp({
      val: _0x2a95af,
      isValid: typeof _0x2a95af === "string" && (_0x2a95af === AlignText.left || _0x2a95af === AlignText.right || _0x2a95af === AlignText.center),
      errorMessage: "Wheel.itemLabelAlign must be one of Constants.AlignText",
      defaultValue: Defaults.wheel.itemLabelAlign
    });
    this.resize();
  }
  get itemLabelBaselineOffset() {
    return this._itemLabelBaselineOffset;
  }
  set itemLabelBaselineOffset(_0x35c562) {
    this._itemLabelBaselineOffset = setProp({
      val: _0x35c562,
      isValid: isNumber(_0x35c562),
      errorMessage: "Wheel.itemLabelBaselineOffset must be a number",
      defaultValue: Defaults.wheel.itemLabelBaselineOffset
    });
    this.resize();
  }
  get itemLabelColors() {
    return this._itemLabelColors;
  }
  set itemLabelColors(_0x257739) {
    this._itemLabelColors = setProp({
      val: _0x257739,
      isValid: Array.isArray(_0x257739),
      errorMessage: "Wheel.itemLabelColors must be an array",
      defaultValue: Defaults.wheel.itemLabelColors
    });
    this.refresh();
  }
  get itemLabelFont() {
    return this._itemLabelFont;
  }
  set itemLabelFont(_0x5e3b63) {
    this._itemLabelFont = setProp({
      val: _0x5e3b63,
      isValid: typeof _0x5e3b63 === "string",
      errorMessage: "Wheel.itemLabelFont must be a string",
      defaultValue: Defaults.wheel.itemLabelFont
    });
    this.resize();
  }
  get itemLabelFontSizeMax() {
    return this._itemLabelFontSizeMax;
  }
  set itemLabelFontSizeMax(_0x368d70) {
    this._itemLabelFontSizeMax = setProp({
      val: _0x368d70,
      isValid: isNumber(_0x368d70),
      errorMessage: "Wheel.itemLabelFontSizeMax must be a number",
      defaultValue: Defaults.wheel.itemLabelFontSizeMax
    });
    this.resize();
  }
  get itemLabelRadius() {
    return this._itemLabelRadius;
  }
  set itemLabelRadius(_0x26a574) {
    this._itemLabelRadius = setProp({
      val: _0x26a574,
      isValid: isNumber(_0x26a574),
      errorMessage: "Wheel.itemLabelRadius must be a number",
      defaultValue: Defaults.wheel.itemLabelRadius
    });
    this.resize();
  }
  get itemLabelRadiusMax() {
    return this._itemLabelRadiusMax;
  }
  set itemLabelRadiusMax(_0x6b14c3) {
    this._itemLabelRadiusMax = setProp({
      val: _0x6b14c3,
      isValid: isNumber(_0x6b14c3),
      errorMessage: "Wheel.itemLabelRadiusMax must be a number",
      defaultValue: Defaults.wheel.itemLabelRadiusMax
    });
    this.resize();
  }
  get itemLabelRotation() {
    return this._itemLabelRotation;
  }
  set itemLabelRotation(_0x2d0aee) {
    this._itemLabelRotation = setProp({
      val: _0x2d0aee,
      isValid: isNumber(_0x2d0aee),
      errorMessage: "Wheel.itemLabelRotation must be a number",
      defaultValue: Defaults.wheel.itemLabelRotation
    });
    this.refresh();
  }
  get itemLabelStrokeColor() {
    return this._itemLabelStrokeColor;
  }
  set itemLabelStrokeColor(_0x37788a) {
    this._itemLabelStrokeColor = setProp({
      val: _0x37788a,
      isValid: typeof _0x37788a === "string",
      errorMessage: "Wheel.itemLabelStrokeColor must be a string",
      defaultValue: Defaults.wheel.itemLabelStrokeColor
    });
    this.refresh();
  }
  get itemLabelStrokeWidth() {
    return this._itemLabelStrokeWidth;
  }
  set itemLabelStrokeWidth(_0x7ab8e8) {
    this._itemLabelStrokeWidth = setProp({
      val: _0x7ab8e8,
      isValid: isNumber(_0x7ab8e8),
      errorMessage: "Wheel.itemLabelStrokeWidth must be a number",
      defaultValue: Defaults.wheel.itemLabelStrokeWidth
    });
    this.refresh();
  }
  get items() {
    return this._items;
  }
  set items(_0x30a712) {
    this._items = setProp({
      val: _0x30a712,
      isValid: Array.isArray(_0x30a712),
      errorMessage: "Wheel.items must be an array of Items",
      defaultValue: Defaults.wheel.items,
      action: () => {
        const _0x38cbea = [];
        for (const _0x4a790e of _0x30a712) {
          _0x38cbea.push(new Item(this, _0x4a790e));
        }
        return _0x38cbea;
      }
    });
    this.refreshAriaLabel();
    this.refreshCurrentIndex(this.getItemAngles(this._rotation));
    this.resize();
  }
  get lineColor() {
    return this._lineColor;
  }
  set lineColor(_0x46d976) {
    this._lineColor = setProp({
      val: _0x46d976,
      isValid: typeof _0x46d976 === "string",
      errorMessage: "Wheel.lineColor must be a string",
      defaultValue: Defaults.wheel.lineColor
    });
    this.refresh();
  }
  get lineWidth() {
    return this._lineWidth;
  }
  set lineWidth(_0x597516) {
    this._lineWidth = setProp({
      val: _0x597516,
      isValid: isNumber(_0x597516),
      errorMessage: "Wheel.lineWidth must be a number",
      defaultValue: Defaults.wheel.lineWidth
    });
    this.refresh();
  }
  get offset() {
    return this._offset;
  }
  set offset(_0x45f6d6) {
    this._offset = setProp({
      val: _0x45f6d6,
      isValid: isObject(_0x45f6d6),
      errorMessage: "Wheel.offset must be an object",
      defaultValue: Defaults.wheel.offset
    });
    this.resize();
  }
  get onCurrentIndexChange() {
    return this._onCurrentIndexChange;
  }
  set onCurrentIndexChange(_0x5b9827) {
    this._onCurrentIndexChange = setProp({
      val: _0x5b9827,
      isValid: typeof _0x5b9827 === "function" || _0x5b9827 === null,
      errorMessage: "Wheel.onCurrentIndexChange must be a function or null",
      defaultValue: Defaults.wheel.onCurrentIndexChange
    });
  }
  get onRest() {
    return this._onRest;
  }
  set onRest(_0x1ea94d) {
    this._onRest = setProp({
      val: _0x1ea94d,
      isValid: typeof _0x1ea94d === "function" || _0x1ea94d === null,
      errorMessage: "Wheel.onRest must be a function or null",
      defaultValue: Defaults.wheel.onRest
    });
  }
  get onSpin() {
    return this._onSpin;
  }
  set onSpin(_0x55bca6) {
    this._onSpin = setProp({
      val: _0x55bca6,
      isValid: typeof _0x55bca6 === "function" || _0x55bca6 === null,
      errorMessage: "Wheel.onSpin must be a function or null",
      defaultValue: Defaults.wheel.onSpin
    });
  }
  get overlayImage() {
    return this._overlayImage;
  }
  set overlayImage(_0x4ca01b) {
    this._overlayImage = setProp({
      val: _0x4ca01b,
      isValid: _0x4ca01b instanceof HTMLImageElement || _0x4ca01b === null,
      errorMessage: "Wheel.overlayImage must be a HTMLImageElement or null",
      defaultValue: Defaults.wheel.overlayImage
    });
    this.refresh();
  }
  get pixelRatio() {
    return this._pixelRatio;
  }
  set pixelRatio(_0x194bab) {
    this._pixelRatio = setProp({
      val: _0x194bab,
      isValid: isNumber(_0x194bab),
      errorMessage: "Wheel.pixelRatio must be a number",
      defaultValue: Defaults.wheel.pixelRatio
    });
    this._dragEvents = [];
    this.resize();
  }
  get pointerAngle() {
    return this._pointerAngle;
  }
  set pointerAngle(_0x1fa8f1) {
    this._pointerAngle = setProp({
      val: _0x1fa8f1,
      isValid: isNumber(_0x1fa8f1) && _0x1fa8f1 >= 0,
      errorMessage: "Wheel.pointerAngle must be a number between 0 and 360",
      defaultValue: Defaults.wheel.pointerAngle,
      action: () => _0x1fa8f1 % 360
    });
    if (this.debug) {
      this.refresh();
    }
  }
  get radius() {
    return this._radius;
  }
  set radius(_0x2895c8) {
    this._radius = setProp({
      val: _0x2895c8,
      isValid: isNumber(_0x2895c8),
      errorMessage: "Wheel.radius must be a number",
      defaultValue: Defaults.wheel.radius
    });
    this.resize();
  }
  get rotation() {
    return this._rotation;
  }
  set rotation(_0x118b4c) {
    this._rotation = setProp({
      val: _0x118b4c,
      isValid: isNumber(_0x118b4c),
      errorMessage: "Wheel.rotation must be a number",
      defaultValue: Defaults.wheel.rotation
    });
    this.refreshCurrentIndex(this.getItemAngles(this._rotation));
    this.refresh();
  }
  get rotationResistance() {
    return this._rotationResistance;
  }
  set rotationResistance(_0x40c528) {
    this._rotationResistance = setProp({
      val: _0x40c528,
      isValid: isNumber(_0x40c528),
      errorMessage: "Wheel.rotationResistance must be a number",
      defaultValue: Defaults.wheel.rotationResistance
    });
  }
  get rotationSpeed() {
    return this._rotationSpeed;
  }
  get rotationSpeedMax() {
    return this._rotationSpeedMax;
  }
  set rotationSpeedMax(_0x54653a) {
    this._rotationSpeedMax = setProp({
      val: _0x54653a,
      isValid: isNumber(_0x54653a) && _0x54653a >= 0,
      errorMessage: "Wheel.rotationSpeedMax must be a number >= 0",
      defaultValue: Defaults.wheel.rotationSpeedMax
    });
  }
  dragStart(_0xd4040e = _0x1ef178) {
    if (this.canvas === null) {
      return;
    }
    const _0x5e57c0 = translateXYToElement(_0xd4040e, this.canvas, this.getActualPixelRatio());
    this.isDragging = true;
    this.stop();
    this._dragEvents = [{
      distance: 0,
      x: _0x5e57c0.x,
      y: _0x5e57c0.y,
      now: performance.now()
    }];
    this.refreshCursor();
  }
  dragMove(_0x469342 = _0x14f7cd) {
    if (this.canvas === null) {
      return;
    }
    const _0x58f671 = translateXYToElement(_0x469342, this.canvas, this.getActualPixelRatio());
    const _0x188b0c = this.getAngleFromCenter(_0x58f671);
    const _0x5c6b82 = this._dragEvents[0];
    const _0x18be35 = this.getAngleFromCenter(_0x5c6b82);
    const _0x3cc9a5 = diffAngle(_0x18be35, _0x188b0c);
    this._dragEvents.unshift({
      distance: _0x3cc9a5,
      x: _0x58f671.x,
      y: _0x58f671.y,
      now: performance.now()
    });
    if (this.debug && this._dragEvents.length >= 40) {
      this._dragEvents.pop();
    }
    this.rotation += _0x3cc9a5;
  }
  dragEnd() {
    this.isDragging = false;
    let _0x2e75c1 = 0;
    const _0x35448f = performance.now();
    for (const [_0x2fd355, _0x17219d] of this._dragEvents.entries()) {
      if (!this.isDragEventTooOld(_0x35448f, _0x17219d)) {
        _0x2e75c1 += _0x17219d.distance;
        continue;
      }
      this._dragEvents.length = _0x2fd355;
      if (this.debug) {
        this.refresh();
      }
      break;
    }
    this.refreshCursor();
    if (_0x2e75c1 === 0) {
      return;
    }
    this.beginSpin(_0x2e75c1 * (1000 / dragCapturePeriod), "interact");
  }
  isDragEventTooOld(_0x1dbbfe = 0, _0x24454e = {}) {
    return _0x1dbbfe - _0x24454e.now > dragCapturePeriod;
  }
  raiseEvent_onCurrentIndexChange(_0x10a5fb = {}) {
    if ((this != null ? undefined : this.onCurrentIndexChange) != null) {
      undefined;
    } else {
      (this != null ? undefined : this.onCurrentIndexChange)((Object != null ? undefined : Object.assign) != null ? undefined : (Object != null ? undefined : Object.assign)({}, {
        type: "currentIndexChange",
        currentIndex: this._currentIndex
      }, _0x10a5fb));
    }
  }
  raiseEvent_onRest(_0x13541e = {}) {
    if ((this != null ? undefined : this.onRest) != null) {
      undefined;
    } else {
      (this != null ? undefined : this.onRest)((Object != null ? undefined : Object.assign) != null ? undefined : (Object != null ? undefined : Object.assign)({}, {
        type: "rest",
        currentIndex: this._currentIndex,
        rotation: this._rotation
      }, _0x13541e));
    }
  }
  raiseEvent_onSpin(_0x134bb3 = {}) {
    const _0x197335 = Object.assign({}, {
      type: "spin"
    }, _0x134bb3);
    if ((this != null ? undefined : this.onSpin) != null) {
      undefined;
    } else {
      (this != null ? undefined : this.onSpin)(_0x197335);
    }
  }
};
export { Wheel };