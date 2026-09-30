var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (_0x52eaa5, _0x1abd67) => {
  for (var _0x38f05b in _0x1abd67) {
    __defProp(_0x52eaa5, _0x38f05b, {
      get: _0x1abd67[_0x38f05b],
      enumerable: true
    });
  }
};
var __copyProps = (_0x28a4cf, _0x559f1e, _0x2681b6, _0x2944ee) => {
  if (_0x559f1e && typeof _0x559f1e === "object" || typeof _0x559f1e === "function") {
    for (let _0x5d1039 of __getOwnPropNames(_0x559f1e)) {
      if (!__hasOwnProp.call(_0x28a4cf, _0x5d1039) && _0x5d1039 !== _0x2681b6) {
        __defProp(_0x28a4cf, _0x5d1039, {
          get: () => _0x559f1e[_0x5d1039],
          enumerable: !(_0x2944ee = __getOwnPropDesc(_0x559f1e, _0x5d1039)) || _0x2944ee.enumerable
        });
      }
    }
  }
  return _0x28a4cf;
};
var _0x5ee127 = {
  value: true
};
var __toCommonJS = _0x47992b => __copyProps(__defProp({}, "__esModule", _0x5ee127), _0x47992b);
var Tween_exports = {};
var _0x6ba64a = {
  default: () => Tween_default
};
__export(Tween_exports, _0x6ba64a);
module.exports = __toCommonJS(Tween_exports);
var Easings_exports = {};
var _0x3ba462 = {
  easeInBack: () => easeInBack,
  easeInBounce: () => easeInBounce,
  easeInCirc: () => easeInCirc,
  easeInCubic: () => easeInCubic,
  easeInElastic: () => easeInElastic,
  easeInExpo: () => easeInExpo,
  easeInOutBack: () => easeInOutBack,
  easeInOutBounce: () => easeInOutBounce,
  easeInOutCirc: () => easeInOutCirc,
  easeInOutCubic: () => easeInOutCubic,
  easeInOutElastic: () => easeInOutElastic,
  easeInOutExpo: () => easeInOutExpo,
  easeInOutQuad: () => easeInOutQuad,
  easeInOutQuart: () => easeInOutQuart,
  easeInOutQuint: () => easeInOutQuint,
  easeInOutSine: () => easeInOutSine,
  easeInQuad: () => easeInQuad,
  easeInQuart: () => easeInQuart,
  easeInQuint: () => easeInQuint,
  easeInSine: () => easeInSine,
  easeOutBack: () => easeOutBack,
  easeOutBounce: () => easeOutBounce,
  easeOutCirc: () => easeOutCirc,
  easeOutCubic: () => easeOutCubic,
  easeOutElastic: () => easeOutElastic,
  easeOutExpo: () => easeOutExpo,
  easeOutQuad: () => easeOutQuad,
  easeOutQuart: () => easeOutQuart,
  easeOutQuint: () => easeOutQuint,
  easeOutSine: () => easeOutSine,
  linear: () => linear
};
__export(Easings_exports, _0x3ba462);
var {
  pow,
  PI,
  sqrt
} = Math;
var HALF_PI = PI / 2;
var TWO_PI = PI * 2;
function makeInOut(_0xf4ad31, _0x3716a6) {
  return _0xcdaacb => _0xcdaacb < 0.5 ? _0xf4ad31(_0xcdaacb * 2) * 0.5 : _0x3716a6(_0xcdaacb * 2 - 1) * 0.5 + 0.5;
}
function makeExpIn(_0xdeb0ac) {
  return _0x471692 => pow(_0x471692, _0xdeb0ac);
}
function makeExpOut(_0x283b30) {
  return _0x142017 => 1 - pow(1 - _0x142017, _0x283b30);
}
function makeExpInOut(_0xef85a3) {
  return _0x88b855 => _0x88b855 < 0.5 ? pow(_0x88b855 * 2, _0xef85a3) * 0.5 : (1 - pow(1 - (_0x88b855 * 2 - 1), _0xef85a3)) * 0.5 + 0.5;
}
var linear = _0xf51735 => _0xf51735;
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
var easeInSine = _0x377c3e => 1 - Math.cos(_0x377c3e * HALF_PI);
var easeOutSine = _0x1d82b7 => Math.sin(_0x1d82b7 * HALF_PI);
var easeInOutSine = _0x4d958d => (Math.cos(PI * _0x4d958d) - 1) * -0.5;
var easeInExpo = _0x93ab42 => _0x93ab42 === 0 ? 0 : pow(2, (_0x93ab42 - 1) * 10);
var easeOutExpo = _0x2262a3 => _0x2262a3 === 1 ? 1 : 1 - pow(2, _0x2262a3 * -10);
var easeInOutExpo = _0x541a41 => _0x541a41 === 0 || _0x541a41 === 1 ? _0x541a41 : _0x541a41 < 0.5 ? pow(2, (_0x541a41 * 2 - 1) * 10) * 0.5 : (1 - pow(2, (_0x541a41 * 2 - 1) * -10)) * 0.5 + 0.5;
var easeInCirc = _0x5a9297 => 1 - sqrt(1 - _0x5a9297 * _0x5a9297);
var easeOutCirc = _0x382e16 => sqrt(1 - pow(_0x382e16 - 1, 2));
var easeInOutCirc = makeInOut(easeInCirc, easeOutCirc);
var easeInElastic = _0x20e8bf => _0x20e8bf === 0 || _0x20e8bf === 1 ? _0x20e8bf : 1 - easeOutElastic(1 - _0x20e8bf);
var easeOutElastic = _0x14b1d6 => _0x14b1d6 === 0 || _0x14b1d6 === 1 ? _0x14b1d6 : Math.pow(2, _0x14b1d6 * -10) * Math.sin((_0x14b1d6 - 0.075) * TWO_PI / 0.3) + 1;
var easeInOutElastic = makeInOut(easeInElastic, easeOutElastic);
var easeInBack = _0x54dcc5 => _0x54dcc5 * _0x54dcc5 * (_0x54dcc5 * 2.70158 - 1.70158);
var easeOutBack = _0x5732b0 => (_0x5732b0 -= 1) * _0x5732b0 * (_0x5732b0 * 2.70158 + 1.70158) + 1;
var easeInOutBack = _0x348e34 => {
  const _0x41baba = 2.5949095;
  if ((_0x348e34 *= 2) < 1) {
    return _0x348e34 * _0x348e34 * ((_0x41baba + 1) * _0x348e34 - _0x41baba) * 0.5;
  } else {
    return ((_0x348e34 -= 2) * _0x348e34 * ((_0x41baba + 1) * _0x348e34 + _0x41baba) + 2) * 0.5;
  }
};
var easeInBounce = _0x356de9 => 1 - easeOutBounce(1 - _0x356de9);
var easeOutBounce = _0x48b8e2 => _0x48b8e2 < 1 / 2.75 ? _0x48b8e2 * 7.5625 * _0x48b8e2 : _0x48b8e2 < 2 / 2.75 ? (_0x48b8e2 -= 1.5 / 2.75) * 7.5625 * _0x48b8e2 + 0.75 : _0x48b8e2 < 2.5 / 2.75 ? (_0x48b8e2 -= 2.25 / 2.75) * 7.5625 * _0x48b8e2 + 0.9375 : (_0x48b8e2 -= 2.625 / 2.75) * 7.5625 * _0x48b8e2 + 0.984375;
var easeInOutBounce = makeInOut(easeInBounce, easeOutBounce);
var Interpolators_exports = {};
var _0xe4c098 = {
  color: () => color,
  number: () => number
};
__export(Interpolators_exports, _0xe4c098);
function number(_0x334ec1, _0x566492, _0x1248d2) {
  return _0x334ec1 + (_0x566492 - _0x334ec1) * _0x1248d2;
}
function color(_0x83309e, _0x43d63d, _0x5e8ec8) {
  _0x83309e = colorValueToNumber(_0x83309e);
  _0x43d63d = colorValueToNumber(_0x43d63d);
  return rgbToNumber(number(_0x83309e >> 16 & 255, _0x43d63d >> 16 & 255, _0x5e8ec8), number(_0x83309e >> 8 & 255, _0x43d63d >> 8 & 255, _0x5e8ec8), number(_0x83309e & 255, _0x43d63d & 255, _0x5e8ec8));
}
var colorValueToNumber = function () {
  let _0xd555a3;
  let _0x24bdeb;
  let _0x47a47e = Object.create(null);
  let _0xdf23f8 = 0;
  const _0x54cb8d = 2048;
  return function (_0x2c7de5) {
    if (typeof _0x2c7de5 === "number") {
      return _0x2c7de5;
    } else if (typeof _0x2c7de5 === "string") {
      if (_0x2c7de5 in _0x47a47e) {
        return _0x47a47e[_0x2c7de5];
      }
      if (!_0xd555a3) {
        _0xd555a3 = document.createElement("canvas");
        _0x24bdeb = _0xd555a3.getContext("2d");
      }
      _0xd555a3.width = _0xd555a3.height = 1;
      _0x24bdeb.fillStyle = _0x2c7de5;
      _0x24bdeb.fillRect(0, 0, 1, 1);
      const _0x1df6c4 = _0x24bdeb.getImageData(0, 0, 1, 1).data;
      const _0x12e2ca = rgbToNumber(_0x1df6c4[0], _0x1df6c4[1], _0x1df6c4[2]);
      if (_0xdf23f8 > _0x54cb8d) {
        _0x47a47e = Object.create(null);
        _0xdf23f8 = 0;
      }
      _0x47a47e[_0x2c7de5] = _0x12e2ca;
      _0xdf23f8++;
      return _0x12e2ca;
    } else if (_0x2c7de5 && _0x2c7de5.isColor) {
      return _0x2c7de5.getHex();
    } else {
      return 0;
    }
  };
}();
function rgbToNumber(_0x307b26, _0x3e239f, _0x145513) {
  return _0x307b26 << 16 ^ _0x3e239f << 8 ^ _0x145513;
}
var AbstractTween = class {
  gotoElapsedTime(_0x50d3bf) {}
  gotoEnd() {}
  isDoneAtElapsedTime(_0x5e0380) {}
};
var linear2 = _0x514463 => _0x514463;
var maxSafeInteger = 9007199254740991;
var Tween = class extends AbstractTween {
  constructor(_0x3d8995, _0x212ec8, _0xe5c244, _0x145335 = 750, _0x16b8c3 = 0, _0x67cfa3 = linear2, _0x34aa05 = 1, _0x58a232 = "forward", _0x15a1a1 = "number") {
    super();
    this.callback = _0x3d8995;
    this.fromValue = _0x212ec8;
    this.toValue = _0xe5c244;
    this.duration = _0x145335;
    this.delay = _0x16b8c3;
    this.easing = typeof _0x67cfa3 === "string" ? Easings_exports[_0x67cfa3] || linear2 : _0x67cfa3;
    this.iterations = _0x34aa05;
    this.direction = _0x58a232;
    this.interpolate = typeof _0x15a1a1 === "function" ? _0x15a1a1 : Interpolators_exports[_0x15a1a1] || number;
    this.totalElapsed = this.iterations < maxSafeInteger ? this.delay + this.duration * this.iterations : maxSafeInteger;
  }
  gotoElapsedTime(_0x5d1416) {
    let _0x5d0938 = this.duration;
    let _0xe25e58 = this.delay;
    if (_0x5d1416 >= _0xe25e58) {
      _0x5d1416 = Math.min(_0x5d1416, this.totalElapsed) - _0xe25e58;
      let _0x34afb7 = _0x5d1416 % _0x5d0938 / _0x5d0938;
      if (_0x34afb7 === 0 && _0x5d1416 !== 0) {
        _0x34afb7 = 1;
      }
      _0x34afb7 = this.easing(_0x34afb7);
      if (this.direction === "reverse" || this.direction === "alternate" && Math.ceil(_0x5d1416 / _0x5d0938) % 2 === 0) {
        _0x34afb7 = 1 - _0x34afb7;
      }
      this.callback(this.interpolate(this.fromValue, this.toValue, _0x34afb7));
    }
  }
  gotoEnd() {
    this.gotoElapsedTime(this.totalElapsed);
  }
  isDoneAtElapsedTime(_0x33e658) {
    return _0x33e658 > this.totalElapsed;
  }
};
var Tween_default = Tween;