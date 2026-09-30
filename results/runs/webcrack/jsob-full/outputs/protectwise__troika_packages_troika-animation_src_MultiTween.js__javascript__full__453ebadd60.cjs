var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (_0x3f0d31, _0x33f78b) => {
  for (var _0x45d99a in _0x33f78b) {
    __defProp(_0x3f0d31, _0x45d99a, {
      get: _0x33f78b[_0x45d99a],
      enumerable: true
    });
  }
};
var __copyProps = (_0xae1cdd, _0x61e8f8, _0x4b960a, _0x3d4c14) => {
  if (_0x61e8f8 && typeof _0x61e8f8 === "object" || typeof _0x61e8f8 === "function") {
    for (let _0x5b1020 of __getOwnPropNames(_0x61e8f8)) {
      if (!__hasOwnProp.call(_0xae1cdd, _0x5b1020) && _0x5b1020 !== _0x4b960a) {
        __defProp(_0xae1cdd, _0x5b1020, {
          get: () => _0x61e8f8[_0x5b1020],
          enumerable: !(_0x3d4c14 = __getOwnPropDesc(_0x61e8f8, _0x5b1020)) || _0x3d4c14.enumerable
        });
      }
    }
  }
  return _0xae1cdd;
};
var _0x2f54af = {
  value: true
};
var __toCommonJS = _0x5a17ca => __copyProps(__defProp({}, "__esModule", _0x2f54af), _0x5a17ca);
var MultiTween_exports = {};
var _0x595b22 = {
  default: () => MultiTween_default
};
__export(MultiTween_exports, _0x595b22);
module.exports = __toCommonJS(MultiTween_exports);
var Easings_exports = {};
var _0x2a6c06 = {
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
__export(Easings_exports, _0x2a6c06);
var {
  pow,
  PI,
  sqrt
} = Math;
var HALF_PI = PI / 2;
var TWO_PI = PI * 2;
function makeInOut(_0x53f4c3, _0x50ab49) {
  return _0x361d18 => _0x361d18 < 0.5 ? _0x53f4c3(_0x361d18 * 2) * 0.5 : _0x50ab49(_0x361d18 * 2 - 1) * 0.5 + 0.5;
}
function makeExpIn(_0x6eb245) {
  return _0x41aa0c => pow(_0x41aa0c, _0x6eb245);
}
function makeExpOut(_0x6e956e) {
  return _0xd724b8 => 1 - pow(1 - _0xd724b8, _0x6e956e);
}
function makeExpInOut(_0x595f0b) {
  return _0x20e71e => _0x20e71e < 0.5 ? pow(_0x20e71e * 2, _0x595f0b) * 0.5 : (1 - pow(1 - (_0x20e71e * 2 - 1), _0x595f0b)) * 0.5 + 0.5;
}
var linear = _0x21d3e6 => _0x21d3e6;
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
var easeInSine = _0x26117b => 1 - Math.cos(_0x26117b * HALF_PI);
var easeOutSine = _0x13d3fa => Math.sin(_0x13d3fa * HALF_PI);
var easeInOutSine = _0xa5b8aa => (Math.cos(PI * _0xa5b8aa) - 1) * -0.5;
var easeInExpo = _0x45f8fb => _0x45f8fb === 0 ? 0 : pow(2, (_0x45f8fb - 1) * 10);
var easeOutExpo = _0x561a5f => _0x561a5f === 1 ? 1 : 1 - pow(2, _0x561a5f * -10);
var easeInOutExpo = _0x1cdb8b => _0x1cdb8b === 0 || _0x1cdb8b === 1 ? _0x1cdb8b : _0x1cdb8b < 0.5 ? pow(2, (_0x1cdb8b * 2 - 1) * 10) * 0.5 : (1 - pow(2, (_0x1cdb8b * 2 - 1) * -10)) * 0.5 + 0.5;
var easeInCirc = _0x8f58a0 => 1 - sqrt(1 - _0x8f58a0 * _0x8f58a0);
var easeOutCirc = _0xacf67d => sqrt(1 - pow(_0xacf67d - 1, 2));
var easeInOutCirc = makeInOut(easeInCirc, easeOutCirc);
var easeInElastic = _0x7b231c => _0x7b231c === 0 || _0x7b231c === 1 ? _0x7b231c : 1 - easeOutElastic(1 - _0x7b231c);
var easeOutElastic = _0xc42b00 => _0xc42b00 === 0 || _0xc42b00 === 1 ? _0xc42b00 : Math.pow(2, _0xc42b00 * -10) * Math.sin((_0xc42b00 - 0.075) * TWO_PI / 0.3) + 1;
var easeInOutElastic = makeInOut(easeInElastic, easeOutElastic);
var easeInBack = _0x3a02e4 => _0x3a02e4 * _0x3a02e4 * (_0x3a02e4 * 2.70158 - 1.70158);
var easeOutBack = _0x3bb999 => (_0x3bb999 -= 1) * _0x3bb999 * (_0x3bb999 * 2.70158 + 1.70158) + 1;
var easeInOutBack = _0xbb9f5b => {
  const _0xfeede9 = 2.5949095;
  if ((_0xbb9f5b *= 2) < 1) {
    return _0xbb9f5b * _0xbb9f5b * ((_0xfeede9 + 1) * _0xbb9f5b - _0xfeede9) * 0.5;
  } else {
    return ((_0xbb9f5b -= 2) * _0xbb9f5b * ((_0xfeede9 + 1) * _0xbb9f5b + _0xfeede9) + 2) * 0.5;
  }
};
var easeInBounce = _0x12e3ba => 1 - easeOutBounce(1 - _0x12e3ba);
var easeOutBounce = _0x17d9bd => _0x17d9bd < 1 / 2.75 ? _0x17d9bd * 7.5625 * _0x17d9bd : _0x17d9bd < 2 / 2.75 ? (_0x17d9bd -= 1.5 / 2.75) * 7.5625 * _0x17d9bd + 0.75 : _0x17d9bd < 2.5 / 2.75 ? (_0x17d9bd -= 2.25 / 2.75) * 7.5625 * _0x17d9bd + 0.9375 : (_0x17d9bd -= 2.625 / 2.75) * 7.5625 * _0x17d9bd + 0.984375;
var easeInOutBounce = makeInOut(easeInBounce, easeOutBounce);
var Interpolators_exports = {};
var _0x5965f6 = {
  color: () => color,
  number: () => number
};
__export(Interpolators_exports, _0x5965f6);
function number(_0x587a62, _0x38ca12, _0x826d71) {
  return _0x587a62 + (_0x38ca12 - _0x587a62) * _0x826d71;
}
function color(_0x373fc9, _0x1664a3, _0x2087e6) {
  _0x373fc9 = colorValueToNumber(_0x373fc9);
  _0x1664a3 = colorValueToNumber(_0x1664a3);
  return rgbToNumber(number(_0x373fc9 >> 16 & 255, _0x1664a3 >> 16 & 255, _0x2087e6), number(_0x373fc9 >> 8 & 255, _0x1664a3 >> 8 & 255, _0x2087e6), number(_0x373fc9 & 255, _0x1664a3 & 255, _0x2087e6));
}
var colorValueToNumber = function () {
  let _0x5dca20;
  let _0x28339e;
  let _0x3bfbf = Object.create(null);
  let _0x5c3158 = 0;
  const _0x51c373 = 2048;
  return function (_0x26a618) {
    if (typeof _0x26a618 === "number") {
      return _0x26a618;
    } else if (typeof _0x26a618 === "string") {
      if (_0x26a618 in _0x3bfbf) {
        return _0x3bfbf[_0x26a618];
      }
      if (!_0x5dca20) {
        _0x5dca20 = document.createElement("canvas");
        _0x28339e = _0x5dca20.getContext("2d");
      }
      _0x5dca20.width = _0x5dca20.height = 1;
      _0x28339e.fillStyle = _0x26a618;
      _0x28339e.fillRect(0, 0, 1, 1);
      const _0x5e1c6e = _0x28339e.getImageData(0, 0, 1, 1).data;
      const _0x301834 = rgbToNumber(_0x5e1c6e[0], _0x5e1c6e[1], _0x5e1c6e[2]);
      if (_0x5c3158 > _0x51c373) {
        _0x3bfbf = Object.create(null);
        _0x5c3158 = 0;
      }
      _0x3bfbf[_0x26a618] = _0x301834;
      _0x5c3158++;
      return _0x301834;
    } else if (_0x26a618 && _0x26a618.isColor) {
      return _0x26a618.getHex();
    } else {
      return 0;
    }
  };
}();
function rgbToNumber(_0x5e3535, _0x4ea748, _0x303756) {
  return _0x5e3535 << 16 ^ _0x4ea748 << 8 ^ _0x303756;
}
var AbstractTween = class {
  gotoElapsedTime(_0x5f1863) {}
  gotoEnd() {}
  isDoneAtElapsedTime(_0x8f4305) {}
};
var linear2 = _0x13edbc => _0x13edbc;
var maxSafeInteger = 9007199254740991;
var Tween = class extends AbstractTween {
  constructor(_0x27ec49, _0x15be4d, _0x4a319e, _0xc4cbd2 = 750, _0x6a8029 = 0, _0x1e575c = linear2, _0x452b28 = 1, _0x497c9e = "forward", _0x48ab70 = "number") {
    super();
    this.callback = _0x27ec49;
    this.fromValue = _0x15be4d;
    this.toValue = _0x4a319e;
    this.duration = _0xc4cbd2;
    this.delay = _0x6a8029;
    this.easing = typeof _0x1e575c === "string" ? Easings_exports[_0x1e575c] || linear2 : _0x1e575c;
    this.iterations = _0x452b28;
    this.direction = _0x497c9e;
    this.interpolate = typeof _0x48ab70 === "function" ? _0x48ab70 : Interpolators_exports[_0x48ab70] || number;
    this.totalElapsed = this.iterations < maxSafeInteger ? this.delay + this.duration * this.iterations : maxSafeInteger;
  }
  gotoElapsedTime(_0x37e708) {
    let _0x5e6472 = this.duration;
    let _0x1c8c85 = this.delay;
    if (_0x37e708 >= _0x1c8c85) {
      _0x37e708 = Math.min(_0x37e708, this.totalElapsed) - _0x1c8c85;
      let _0x2bbe18 = _0x37e708 % _0x5e6472 / _0x5e6472;
      if (_0x2bbe18 === 0 && _0x37e708 !== 0) {
        _0x2bbe18 = 1;
      }
      _0x2bbe18 = this.easing(_0x2bbe18);
      if (this.direction === "reverse" || this.direction === "alternate" && Math.ceil(_0x37e708 / _0x5e6472) % 2 === 0) {
        _0x2bbe18 = 1 - _0x2bbe18;
      }
      this.callback(this.interpolate(this.fromValue, this.toValue, _0x2bbe18));
    }
  }
  gotoEnd() {
    this.gotoElapsedTime(this.totalElapsed);
  }
  isDoneAtElapsedTime(_0x35443d) {
    return _0x35443d > this.totalElapsed;
  }
};
var Tween_default = Tween;
var MultiTween = class extends Tween_default {
  constructor(_0x390d62, _0x3b1949, _0x393dff, _0x9f62a9, _0x166dea, _0x1c225d) {
    if (typeof _0x3b1949 !== "number") {
      _0x3b1949 = _0x390d62.reduce((_0x550ef5, _0x40d56f) => Math.max(_0x550ef5, _0x40d56f.totalElapsed), 0);
    }
    if (_0x3b1949 === Infinity) {
      _0x3b1949 = Number.MAX_VALUE;
    }
    super(null, 0, _0x3b1949, _0x3b1949, _0x393dff, _0x9f62a9, _0x166dea, _0x1c225d);
    if (_0x390d62.length === 1) {
      this.callback = _0x390d62[0].gotoElapsedTime.bind(_0x390d62[0]);
    } else {
      _0x390d62.sort(endTimeComparator);
      this.callback = this._syncTweens;
    }
    this.tweens = _0x390d62;
  }
  _syncTweens(_0x5a8044) {
    for (let _0x15416d = 0, _0x29b19d = this.tweens.length; _0x15416d < _0x29b19d; _0x15416d++) {
      this.tweens[_0x15416d].gotoElapsedTime(_0x5a8044);
    }
  }
};
function endTimeComparator(_0x2522de, _0x5ae6a7) {
  return _0x2522de.totalElapsed - _0x5ae6a7.totalElapsed;
}
var MultiTween_default = MultiTween;