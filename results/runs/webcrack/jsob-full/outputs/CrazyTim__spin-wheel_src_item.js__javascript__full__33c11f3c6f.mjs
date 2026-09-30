function getRandomInt(_0x29f756 = 0, _0x17fc53 = 0) {
  _0x29f756 = Math.ceil(_0x29f756);
  _0x17fc53 = Math.floor(_0x17fc53);
  return Math.floor(Math.random() * (_0x17fc53 - _0x29f756)) + _0x29f756;
}
function getRandomFloat(_0x1b1fdc = 0, _0x164cb7 = 0, _0x1495ed = 14) {
  return parseFloat((Math.random() * (_0x164cb7 - _0x1b1fdc) + _0x1b1fdc).toFixed(_0x1495ed));
}
function degRad(_0x1b4fac = 0) {
  return _0x1b4fac * Math.PI / 180;
}
function isAngleBetween(_0x50acfd, _0xd8f05a, _0x355b04) {
  if (_0xd8f05a < _0x355b04) {
    return _0xd8f05a <= _0x50acfd && _0x50acfd < _0x355b04;
  }
  return _0xd8f05a <= _0x50acfd || _0x50acfd < _0x355b04;
}
function aveArray(_0x3e929e = []) {
  let _0x5d7e10 = 0;
  for (const _0x486006 of _0x3e929e) {
    if (_0x486006) {
      _0x5d7e10 += typeof _0x486006 === "number" ? _0x486006 : 1;
    }
  }
  return _0x5d7e10 / _0x3e929e.length || 0;
}
function getFontSizeToFit(_0x487b33, _0x4e5e56, _0x4160d4, _0xc8fd94) {
  _0xc8fd94.save();
  _0xc8fd94.font = "1px " + _0x4e5e56;
  const _0x39d8a0 = _0xc8fd94.measureText(_0x487b33).width;
  _0xc8fd94.restore();
  return _0x4160d4 / _0x39d8a0;
}
const _0x14c550 = {
  x: 0,
  y: 0
};
function isPointInCircle(_0x493a2c = _0x14c550, _0x2d0fc9, _0x100e89, _0xb11322) {
  const _0x557158 = (_0x493a2c.x - _0x2d0fc9) ** 2 + (_0x493a2c.y - _0x100e89) ** 2;
  return _0x557158 <= _0xb11322 ** 2;
}
const _0x2c0801 = {
  x: 0,
  y: 0
};
function translateXYToElement(_0xcc2329 = _0x2c0801, _0x25daeb = {}, _0x5058e4 = 1) {
  const _0x17c7c1 = _0x25daeb.getBoundingClientRect();
  return {
    x: (_0xcc2329.x - _0x17c7c1.left) * _0x5058e4,
    y: (_0xcc2329.y - _0x17c7c1.top) * _0x5058e4
  };
}
function getMouseButtonsPressed(_0x405546 = {}) {
  return [1, 2, 4, 8, 16].filter(_0x3823b0 => _0x405546.buttons & _0x3823b0);
}
function getAngle(_0x4010de, _0x483915, _0x2c43d5, _0x23e5d6) {
  const _0x318390 = _0x4010de - _0x2c43d5;
  const _0x1339f0 = _0x483915 - _0x23e5d6;
  let _0x2e8d56 = Math.atan2(-_0x1339f0, -_0x318390);
  _0x2e8d56 *= 180 / Math.PI;
  if (_0x2e8d56 < 0) {
    _0x2e8d56 += 360;
  }
  return _0x2e8d56;
}
const _0x5f436c = {
  x: 0,
  y: 0
};
const _0x3b882b = {
  x: 0,
  y: 0
};
function getDistanceBetweenPoints(_0x3d4871 = _0x5f436c, _0xf89b10 = _0x3b882b) {
  return Math.hypot(_0xf89b10.x - _0x3d4871.x, _0xf89b10.y - _0x3d4871.y);
}
function addAngle(_0x2542ad = 0, _0x3c2dda = 0) {
  const _0x2f41f9 = _0x2542ad + _0x3c2dda;
  let _0x4d1bf4;
  if (_0x2f41f9 > 0) {
    _0x4d1bf4 = _0x2f41f9 % 360;
  } else {
    _0x4d1bf4 = 360 + _0x2f41f9 % 360;
  }
  if (_0x4d1bf4 === 360) {
    _0x4d1bf4 = 0;
  }
  return _0x4d1bf4;
}
function diffAngle(_0x374324 = 0, _0x23c1f1 = 0) {
  const _0x2c3923 = 180 - _0x23c1f1;
  const _0x596bad = addAngle(_0x374324, _0x2c3923);
  return 180 - _0x596bad;
}
function calcWheelRotationForTargetAngle(_0x818e0e = 0, _0x31006f = 0, _0x5b4030 = 1) {
  let _0x3be119 = (_0x818e0e % 360 + _0x31006f) % 360;
  _0x3be119 = fixFloat(_0x3be119);
  _0x3be119 = (_0x5b4030 === 1 ? 360 - _0x3be119 : 360 + _0x3be119) % 360;
  _0x3be119 *= _0x5b4030;
  return _0x818e0e + _0x3be119;
}
function isObject(_0x17e7ed) {
  return typeof _0x17e7ed === "object" && !Array.isArray(_0x17e7ed) && _0x17e7ed !== null;
}
function isNumber(_0xea4422) {
  return typeof _0xea4422 === "number" && !Number.isNaN(_0xea4422);
}
function setProp({
  val: _0x15443a,
  isValid: _0x13f3b0,
  errorMessage: _0x4664c3,
  defaultValue: _0x1fcb2b,
  action = null
}) {
  if (_0x13f3b0) {
    if (action) {
      return action();
    } else {
      return _0x15443a;
    }
  } else if (_0x15443a === undefined) {
    return _0x1fcb2b;
  }
  throw new Error(_0x4664c3);
}
function fixFloat(_0x4d6f32 = 0) {
  return Number(_0x4d6f32.toFixed(9));
}
function easeSinOut(_0x1fd46e) {
  return Math.sin(_0x1fd46e * Math.PI / 2);
}
function getResizeObserver(_0x2ccb11 = {}, _0x10e73f = {}) {
  if (window.ResizeObserver) {
    const _0x36f479 = new ResizeObserver(() => {
      _0x10e73f({
        redraw: true
      });
    });
    _0x36f479.observe(_0x2ccb11);
    return {
      stop: () => {
        _0x36f479.unobserve(_0x2ccb11);
        _0x36f479.disconnect();
      }
    };
  }
  window.addEventListener("resize", _0x10e73f);
  return {
    stop: () => {
      window.removeEventListener("resize", _0x10e73f);
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
const _0x1a568a = {
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
const _0x1428e8 = {
  wheel: _0x1a568a,
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
var Defaults = Object.freeze(_0x1428e8);
var Debugging = Object.freeze({
  pointerLineColor: "#ff00ff",
  labelBoundingBoxColor: "#ff00ff",
  labelRadiusColor: "#00ff00",
  dragPointHue: 300
});
var Item = class {
  constructor(_0x1bb1fc, _0x3c400f = {}) {
    if (!isObject(_0x1bb1fc)) {
      throw new Error("wheel must be an instance of Wheel");
    }
    if (!isObject(_0x3c400f) && _0x3c400f !== null) {
      throw new Error("props must be an Object or null");
    }
    this._wheel = _0x1bb1fc;
    for (const _0x5f42e9 of Object.keys(Defaults.item)) {
      this["_" + _0x5f42e9] = Defaults.item[_0x5f42e9];
    }
    if (_0x3c400f) {
      this.init(_0x3c400f);
    } else {
      this.init(Defaults.item);
    }
  }
  init(_0x70e385 = {}) {
    this.backgroundColor = _0x70e385.backgroundColor;
    this.image = _0x70e385.image;
    this.imageOpacity = _0x70e385.imageOpacity;
    this.imageRadius = _0x70e385.imageRadius;
    this.imageRotation = _0x70e385.imageRotation;
    this.imageScale = _0x70e385.imageScale;
    this.label = _0x70e385.label;
    this.labelColor = _0x70e385.labelColor;
    this.value = _0x70e385.value;
    this.weight = _0x70e385.weight;
  }
  get backgroundColor() {
    return this._backgroundColor;
  }
  set backgroundColor(_0x3af06a) {
    if (typeof _0x3af06a === "string") {
      this._backgroundColor = _0x3af06a;
    } else {
      this._backgroundColor = Defaults.item.backgroundColor;
    }
    this._wheel.refresh();
  }
  get image() {
    return this._image;
  }
  set image(_0x503c41) {
    if (_0x503c41 instanceof HTMLImageElement) {
      this._image = _0x503c41;
    } else {
      this._image = Defaults.item.image;
    }
    this._wheel.refresh();
  }
  get imageOpacity() {
    return this._imageOpacity;
  }
  set imageOpacity(_0x4a4f00) {
    if (typeof _0x4a4f00 === "number") {
      this._imageOpacity = _0x4a4f00;
    } else {
      this._imageOpacity = Defaults.item.imageOpacity;
    }
    this._wheel.refresh();
  }
  get imageRadius() {
    return this._imageRadius;
  }
  set imageRadius(_0x2fcdc6) {
    if (typeof _0x2fcdc6 === "number") {
      this._imageRadius = _0x2fcdc6;
    } else {
      this._imageRadius = Defaults.item.imageRadius;
    }
    this._wheel.refresh();
  }
  get imageRotation() {
    return this._imageRotation;
  }
  set imageRotation(_0x2f9dc6) {
    if (typeof _0x2f9dc6 === "number") {
      this._imageRotation = _0x2f9dc6;
    } else {
      this._imageRotation = Defaults.item.imageRotation;
    }
    this._wheel.refresh();
  }
  get imageScale() {
    return this._imageScale;
  }
  set imageScale(_0x125331) {
    if (typeof _0x125331 === "number") {
      this._imageScale = _0x125331;
    } else {
      this._imageScale = Defaults.item.imageScale;
    }
    this._wheel.refresh();
  }
  get label() {
    return this._label;
  }
  set label(_0x2c129f) {
    if (typeof _0x2c129f === "string") {
      this._label = _0x2c129f;
    } else {
      this._label = Defaults.item.label;
    }
    this._wheel.refresh();
  }
  get labelColor() {
    return this._labelColor;
  }
  set labelColor(_0x15a4a1) {
    if (typeof _0x15a4a1 === "string") {
      this._labelColor = _0x15a4a1;
    } else {
      this._labelColor = Defaults.item.labelColor;
    }
    this._wheel.refresh();
  }
  get value() {
    return this._value;
  }
  set value(_0x41c548) {
    if (_0x41c548 !== undefined) {
      this._value = _0x41c548;
    } else {
      this._value = Defaults.item.value;
    }
  }
  get weight() {
    return this._weight;
  }
  set weight(_0x5700c3) {
    if (typeof _0x5700c3 === "number") {
      this._weight = _0x5700c3;
    } else {
      this._weight = Defaults.item.weight;
    }
  }
  getIndex() {
    const _0x115518 = this._wheel.items.findIndex(_0x4be5c9 => _0x4be5c9 === this);
    if (_0x115518 === -1) {
      throw new Error("Item not found in parent Wheel");
    }
    return _0x115518;
  }
  getCenterAngle() {
    const _0x48bb52 = this._wheel.getItemAngles()[this.getIndex()];
    return _0x48bb52.start + (_0x48bb52.end - _0x48bb52.start) / 2;
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
export { Item };