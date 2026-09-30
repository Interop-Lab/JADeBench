var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (_0x52eaa5, _0x1abd67) => {
  for (var _0x38f05b in _0x1abd67)
    __defProp(_0x52eaa5, _0x38f05b, {
      get: _0x1abd67[_0x38f05b],
      enumerable: true
    });
};
var __copyProps = (_0x28a4cf, _0x559f1e, _0x2681b6, _0x2944ee) => {
  if (_0x559f1e && (typeof _0x559f1e === "object" || typeof _0x559f1e === "function")) {
    for (let _0x5d1039 of __getOwnPropNames(_0x559f1e))
      if (!__hasOwnProp.call(_0x28a4cf, _0x5d1039) && _0x5d1039 !== _0x2681b6)
        __defProp(_0x28a4cf, _0x5d1039, {
          get: () => _0x559f1e[_0x5d1039],
          enumerable: !(_0x2944ee = __getOwnPropDesc(_0x559f1e, _0x5d1039)) || _0x2944ee.enumerable
        });
  }
  return _0x28a4cf;
};
var __toCommonJS = (_0x47992b) => __copyProps(__defProp({}, "__esModule", { value: true }), _0x47992b);

var Tween_exports = {};
var _0x6ba64a = {};
_0x6ba64a.default = () => Tween_default;
__export(Tween_exports, _0x6ba64a);
module.exports = __toCommonJS(Tween_exports);

var Easings_exports = {};
var _0x3ba462 = {};
_0x3ba462.easeInBack = () => easeInBack;
_0x3ba462.easeInBounce = () => easeInBounce;
_0x3ba462.easeInCirc = () => easeInCirc;
_0x3ba462.easeInCubic = () => easeInCubic;
_0x3ba462.easeInElastic = () => easeInElastic;
_0x3ba462.easeInExpo = () => easeInExpo;
_0x3ba462.easeInOutBack = () => easeInOutBack;
_0x3ba462.easeInOutBounce = () => easeInOutBounce;
_0x3ba462.easeInOutCirc = () => easeInOutCirc;
_0x3ba462.easeInOutCubic = () => easeInOutCubic;
_0x3ba462.easeInOutElastic = () => easeInOutElastic;
_0x3ba462.easeInOutExpo = () => easeInOutExpo;
_0x3ba462.easeInOutQuad = () => easeInOutQuad;
_0x3ba462.easeInOutQuart = () => easeInOutQuart;
_0x3ba462.easeInOutQuint = () => easeInOutQuint;
_0x3ba462.easeInOutSine = () => easeInOutSine;
_0x3ba462.easeInQuad = () => easeInQuad;
_0x3ba462.easeInQuart = () => easeInQuart;
_0x3ba462.easeInQuint = () => easeInQuint;
_0x3ba462.easeInSine = () => easeInSine;
_0x3ba462.easeOutBack = () => easeOutBack;
_0x3ba462.easeOutBounce = () => easeOutBounce;
_0x3ba462.easeOutCirc = () => easeOutCirc;
_0x3ba462.easeOutCubic = () => easeOutCubic;
_0x3ba462.easeOutElastic = () => easeOutElastic;
_0x3ba462.easeOutExpo = () => easeOutExpo;
_0x3ba462.easeOutQuad = () => easeOutQuad;
_0x3ba462.easeOutQuart = () => easeOutQuart;
_0x3ba462.easeOutQuint = () => easeOutQuint;
_0x3ba462.easeOutSine = () => easeOutSine;
_0x3ba462.linear = () => linear;
__export(Easings_exports, _0x3ba462);

var { pow, PI, sqrt } = Math;
var HALF_PI = PI / 2;
var TWO_PI = PI * 2;

function makeInOut(_0xf4ad31, _0x3716a6) {
  return (_0xcdaacb) =>
    _0xcdaacb < 0.5
      ? _0xf4ad31(_0xcdaacb * 2) * 0.5
      : _0x3716a6(_0xcdaacb * 2 - 1) * 0.5 + 0.5;
}

function makeExpIn(_0xdeb0ac) {
  return (_0x471692) => pow(_0x471692, _0xdeb0ac);
}

function makeExpOut(_0x283b30) {
  return (_0x142017) => 1 - pow(1 - _0x142017, _0x283b30);
}

function makeExpInOut(_0xef85a3) {
  return (_0x88b855) =>
    _0x88b855 < 0.5
      ? pow(_0x88b855 * 2, _0xef85a3) * 0.5
      : (2 - pow(2 - _0x88b855 * 2, _0xef85a3)) * 0.5 + 0.5;
}

var linear = (_0xf51735) => _0xf51735;

var easeInQuad = makeExpIn(2);
var easeOutQuad = makeExpOut(2);
var easeInOutQuad = makeExpInOut(2);
var easeInCubic = makeExpIn(3);
var easeOutCubic = makeExpOut(3);
var easeInOutCubic = makeExpInOut(3);
var easeInQuart = makeExpIn(4);
var easeOutQuart = makeExpOut(4);
var easeInOutQuart = makeExpInOut(4);
var easeInQuint = makeExpIn(5);
var easeOutQuint = makeExpOut(5);
var easeInOutQuint = makeExpInOut(5);

var easeInSine = (_0x377c3e) => 1 - Math.cos(_0x377c3e * HALF_PI);
var easeOutSine = (_0x1d82b7) => Math.sin(_0x1d82b7 * HALF_PI);
var easeInOutSine = (_0x4d958d) => -0.5 * (Math.cos(PI * _0x4d958d) - 1);

var easeInExpo = (_0x93ab42) =>
  _0x93ab42 === 0 ? 0 : pow(2, 10 * (_0x93ab42 - 1));
var easeOutExpo = (_0x2262a3) =>
  _0x2262a3 === 1 ? 1 : 1 - pow(2, -10 * _0x2262a3);

var easeInOutExpo = (_0x541a41) =>
  _0x541a41 === 0 || _0x541a41 === 1
    ? _0x541a41
    : _0x541a41 < 0.5
    ? pow(2, 20 * (_0x541a41 * 2 - 1)) * 0.5
    : (2 - pow(2, -20 * (_0x541a41 * 2 - 1))) * 0.5 + 0.5;

var easeInCirc = (_0x5a9297) => 1 - sqrt(1 - _0x5a9297 * _0x5a9297);
var easeOutCirc = (_0x382e16) => sqrt(1 - pow(_0x382e16 - 1, 2));
var easeInOutCirc = makeInOut(easeInCirc, easeOutCirc);

var easeOutElastic = (_0x14b1d6) =>
  _0x14b1d6 === 0 || _0x14b1d6 === 1
    ? _0x14b1d6
    : Math.pow(2, -10 * _0x14b1d6) *
        Math.sin((_0x14b1d6 - 0.075) * TWO_PI / 0.3) +
      1;
var easeInElastic = (_0x20e8bf) =>
  _0x20e8bf === 0 || _0x20e8bf === 1
    ? _0x20e8bf
    : 1 - easeOutElastic(1 - _0x20e8bf);
var easeInOutElastic = makeInOut(easeInElastic, easeOutElastic);

var easeInBack = (_0x54dcc5) =>
  _0x54dcc5 * _0x54dcc5 * (2.70158 * _0x54dcc5 - 1.70158);
var easeOutBack = (_0x5732b0) =>
  (_0x5732b0 -= 1) * _0x5732b0 * (2.70158 * _0x5732b0 + 1.70158) + 1;
var easeInOutBack = (_0x348e34) => {
  const _0x41baba = 1.70158 * 1.525;
  return _0x348e34 *= 2, _0x348e34 < 1
    ? 0.5 * (_0x348e34 * _0x348e34 * ((_0x41baba + 1) * _0x348e34 - _0x41baba))
    : 0.5 * ((_0x348e34 -= 2) * _0x348e34 * ((_0x41baba + 1) * _0x348e34 + _0x41baba) + 2);
};

var easeOutBounce = (_0x48b8e2) =>
  _0x48b8e2 < 1 / 2.75
    ? 7.5625 * _0x48b8e2 * _0x48b8e2
    : _0x48b8e2 < 2 / 2.75
    ? 7.5625 * (_0x48b8e2 -= 1.5 / 2.75) * _0x48b8e2 + 0.75
    : _0x48b8e2 < 2.5 / 2.75
    ? 7.5625 * (_0x48b8e2 -= 2.25 / 2.75) * _0x48b8e2 + 0.9375
    : 7.5625 * (_0x48b8e2 -= 2.625 / 2.75) * _0x48b8e2 + 0.984375;
var easeInBounce = (_0x356de9) => 1 - easeOutBounce(1 - _0x356de9);
var easeInOutBounce = makeInOut(easeInBounce, easeOutBounce);

var Interpolators_exports = {};
var _0xe4c098 = {};
_0xe4c098.color = () => color;
_0xe4c098.number = () => number;
__export(Interpolators_exports, _0xe4c098);

function number(_0x334ec1, _0x566492, _0x1248d2) {
  return _0x334ec1 + (_0x566492 - _0x334ec1) * _0x1248d2;
}

function color(_0x83309e, _0x43d63d, _0x5e8ec8) {
  _0x83309e = colorValueToNumber(_0x83309e);
  _0x43d63d = colorValueToNumber(_0x43d63d);
  return rgbToNumber(
    number((_0x83309e >> 16) & 255, (_0x43d63d >> 16) & 255, _0x5e8ec8),
    number((_0x83309e >> 8) & 255, (_0x43d63d >> 8) & 255, _0x5e8ec8),
    number(_0x83309e & 255, _0x43d63d & 255, _0x5e8ec8)
  );
}

var colorValueToNumber = (function () {
  let _0xd555a3, _0x24bdeb, _0x47a47e = Object.create(null), _0xdf23f8 = 0;
  const _0x54cb8d = 5000;
  return function (_0x2c7de5) {
    if (typeof _0x2c7de5 === "number") {
      return _0x2c7de5;
    } else if (typeof _0x2c7de5 === "string") {
      if (_0x2c7de5 in _0x47a47e) return _0x47a47e[_0x2c7de5];
      !_0xd555a3 &&
        ((_0xd555a3 = document.createElement("canvas")),
        (_0x24bdeb = _0xd555a3.getContext("2d")));
      _0xd555a3.width = _0xd555a3.height = 1;
      _0x24bdeb.fillStyle = _0x2c7de5;
      _0x24bdeb.fillRect(0, 0, 1, 1);
      const _0x1df6c4 = _0x24bdeb.getImageData(0, 0, 1, 1).data;
      const _0x12e2ca = rgbToNumber(_0x1df6c4[0], _0x1df6c4[1], _0x1df6c4[2]);
      if (_0xdf23f8 >= _0x54cb8d) {
        _0x47a47e = Object.create(null);
        _0xdf23f8 = 0;
      }
      return (_0x47a47e[_0x2c7de5] = _0x12e2ca), _0xdf23f8++, _0x12e2ca;
    } else {
      if (_0x2c7de5 && _0x2c7de5.valueOf) {
        return _0x2c7de5.valueOf();
      } else {
        return 0;
      }
    }
  };
})();

function rgbToNumber(_0x307b26, _0x3e239f, _0x145513) {
  return ((_0x307b26 << 16) ^ (_0x3e239f << 8)) ^ _0x145513;
}

var AbstractTween = class {
  onUpdate(_0x50d3bf) {}
  update() {}
  isComplete(_0x5e0380) {}
};

var linear2 = (_0x514463) => _0x514463;
var maxSafeInteger = 9007199254740991;

var Tween = class extends AbstractTween {
  constructor(
    _0x3d8995,
    _0x212ec8,
    _0xe5c244,
    _0x145335 = 0,
    _0x16b8c3 = -1,
    _0x67cfa3 = linear2,
    _0x34aa05 = 0,
    _0x58a232 = "number",
    _0x15a1a1 = "number"
  ) {
    super();
    this.easing =
      typeof _0x67cfa3 === "string"
        ? Easings_exports[_0x67cfa3] || linear2
        : _0x67cfa3;
    this.repeat = _0x16b8c3;
    this.repeatDelay = _0x34aa05;
    this.target = _0x3d8995;
    this.to = _0xe5c244;
    this.interpolator =
      typeof _0x15a1a1 === "function"
        ? _0x15a1a1
        : Interpolators_exports[_0x15a1a1] || number;
    this.duration = _0x145335;
    this.from = _0x212ec8;
    this.iterations =
      this.repeat !== maxSafeInteger
        ? this.repeat + 1
        : maxSafeInteger;
  }

  update(_0x5d1416) {
    let _0x5d0938 = this.from, _0xe25e58 = this.to;
    if (_0x5d1416 < _0xe25e58) {
      _0x5d1416 = Math.min(Math.max(_0x5d1416, this.repeatDelay), _0xe25e58);
      let _0x34afb7 = (_0x5d1416 - _0x5d0938) / _0x5d0938;
      if (_0x34afb7 >= 0 && _0x5d1416 > 0) _0x34afb7 = 0;
      _0x34afb7 = this.easing(_0x34afb7);
      if (
        this.from === "number" ||
        (this.from === "number" &&
          Math.floor((_0x5d1416 - _0x5d0938) / 1) % 2 === 0)
      ) {
        _0x34afb7 = 1 - _0x34afb7;
      }
      this.onUpdate(this.interpolator(this.from, this.to, _0x34afb7));
    }
  }

  start() {
    this.onUpdate(this.from);
  }

  isComplete(_0x33e658) {
    return _0x33e658 > this.from + this.to;
  }
};

var Tween_default = Tween;
