var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (_0x1f1038, _0x3420a1) => {
  for (var _0x1ebf15 in _0x3420a1) {
    __defProp(_0x1f1038, _0x1ebf15, {
      get: _0x3420a1[_0x1ebf15],
      enumerable: true
    });
  }
};
var __copyProps = (_0x21c600, _0x25c754, _0x4de0c5, _0x4d320c) => {
  if (_0x25c754 && typeof _0x25c754 === "object" || typeof _0x25c754 === "function") {
    for (let _0x1e496d of __getOwnPropNames(_0x25c754)) {
      if (!__hasOwnProp.call(_0x21c600, _0x1e496d) && _0x1e496d !== _0x4de0c5) {
        __defProp(_0x21c600, _0x1e496d, {
          get: () => _0x25c754[_0x1e496d],
          enumerable: !(_0x4d320c = __getOwnPropDesc(_0x25c754, _0x1e496d)) || _0x4d320c.enumerable
        });
      }
    }
  }
  return _0x21c600;
};
var _0x2062f1 = {
  value: true
};
var __toCommonJS = _0x2986fe => __copyProps(__defProp({}, "__esModule", _0x2062f1), _0x2986fe);
var SpringTween_exports = {};
var _0x35b639 = {
  default: () => SpringTween_default
};
__export(SpringTween_exports, _0x35b639);
module.exports = __toCommonJS(SpringTween_exports);
var SpringPresets_default = {
  default: {
    mass: 1,
    tension: 170,
    friction: 26
  },
  gentle: {
    mass: 1,
    tension: 120,
    friction: 14
  },
  wobbly: {
    mass: 1,
    tension: 180,
    friction: 12
  },
  stiff: {
    mass: 1,
    tension: 210,
    friction: 20
  },
  slow: {
    mass: 1,
    tension: 280,
    friction: 60
  },
  molasses: {
    mass: 1,
    tension: 280,
    friction: 120
  }
};
var AbstractTween = class {
  gotoElapsedTime(_0x7f4968) {}
  gotoEnd() {}
  isDoneAtElapsedTime(_0x2cf285) {}
};
var tensionFactor = 0.000001;
var frictionFactor = 0.001;
var DEFAULTS = SpringPresets_default.default;
var SpringTween = class extends AbstractTween {
  constructor(_0x47957a, _0x443d6a, _0x328ed3, _0x4278de, _0x44d888 = 0, _0x85d7f5 = 0) {
    super();
    this.isSpring = true;
    this.callback = _0x47957a;
    this.currentValue = _0x443d6a;
    this.toValue = _0x328ed3;
    this.velocity = _0x44d888;
    this.delay = _0x85d7f5;
    if (typeof _0x4278de === "string") {
      _0x4278de = SpringPresets_default[_0x4278de];
    }
    if (!_0x4278de) {
      _0x4278de = DEFAULTS;
    }
    const {
      mass: _0x2a618b,
      tension: _0x1d4212,
      friction: _0xd46111
    } = _0x4278de;
    this.mass = typeof _0x2a618b === "number" ? _0x2a618b : DEFAULTS.mass;
    this.tension = (typeof _0x1d4212 === "number" ? _0x1d4212 : DEFAULTS.tension) * tensionFactor;
    this.friction = (typeof _0xd46111 === "number" ? _0xd46111 : DEFAULTS.friction) * frictionFactor;
    this.minAcceleration = 1e-10;
    this.$lastTime = _0x85d7f5;
    this.$endTime = Infinity;
  }
  gotoElapsedTime(_0x317ae8) {
    if (_0x317ae8 >= this.delay) {
      let {
        toValue: _0x513135,
        mass: _0x43328c,
        tension: _0x32db1d,
        friction: _0x4fb2ea,
        minAcceleration: _0x22baf9
      } = this;
      let _0x93f29e = this.velocity || 0;
      let _0x392c8d = this.currentValue;
      for (let _0x49e1cd = this.$lastTime; _0x49e1cd < _0x317ae8; _0x49e1cd++) {
        const _0x3e7033 = (_0x32db1d * (_0x513135 - _0x392c8d) - _0x4fb2ea * _0x93f29e) / _0x43328c;
        if (Math.abs(_0x3e7033) < _0x22baf9) {
          _0x93f29e = 0;
          _0x392c8d = _0x513135;
          this.$endTime = _0x49e1cd;
          break;
        } else {
          _0x93f29e += _0x3e7033;
          _0x392c8d += _0x93f29e;
        }
      }
      this.velocity = _0x93f29e;
      this.$lastTime = _0x317ae8;
      this.callback(this.currentValue = _0x392c8d);
    }
  }
  gotoEnd() {
    this.velocity = 0;
    this.$lastTime = this.$endTime;
    this.callback(this.currentValue = this.toValue);
  }
  isDoneAtElapsedTime(_0x4bc4b9) {
    return _0x4bc4b9 >= this.$endTime;
  }
};
var SpringTween_default = SpringTween;