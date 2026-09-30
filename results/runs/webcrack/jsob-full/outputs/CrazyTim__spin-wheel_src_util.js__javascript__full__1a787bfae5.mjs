function getRandomInt(_0x34218e = 0, _0x39791a = 0) {
  _0x34218e = Math.ceil(_0x34218e);
  _0x39791a = Math.floor(_0x39791a);
  return Math.floor(Math.random() * (_0x39791a - _0x34218e)) + _0x34218e;
}
function getRandomFloat(_0x40b825 = 0, _0xc7bd1a = 0, _0xd30979 = 14) {
  return parseFloat((Math.random() * (_0xc7bd1a - _0x40b825) + _0x40b825).toFixed(_0xd30979));
}
function degRad(_0x493bd3 = 0) {
  return _0x493bd3 * Math.PI / 180;
}
function isAngleBetween(_0x5e7a82, _0x43291a, _0x104a64) {
  if (_0x43291a < _0x104a64) {
    return _0x43291a <= _0x5e7a82 && _0x5e7a82 < _0x104a64;
  }
  return _0x43291a <= _0x5e7a82 || _0x5e7a82 < _0x104a64;
}
function aveArray(_0x153bcd = []) {
  let _0x577793 = 0;
  for (const _0x3ed07f of _0x153bcd) {
    if (_0x3ed07f) {
      _0x577793 += typeof _0x3ed07f === "number" ? _0x3ed07f : 1;
    }
  }
  return _0x577793 / _0x153bcd.length || 0;
}
function getFontSizeToFit(_0x17e01f, _0x2df7b4, _0x4bfed6, _0x69dccc) {
  _0x69dccc.save();
  _0x69dccc.font = "1px " + _0x2df7b4;
  const _0x32b683 = _0x69dccc.measureText(_0x17e01f).width;
  _0x69dccc.restore();
  return _0x4bfed6 / _0x32b683;
}
const _0x5817bb = {
  x: 0,
  y: 0
};
function isPointInCircle(_0x5f24f8 = _0x5817bb, _0x1f0917, _0x32b399, _0x57de72) {
  const _0x14a085 = (_0x5f24f8.x - _0x1f0917) ** 2 + (_0x5f24f8.y - _0x32b399) ** 2;
  return _0x14a085 <= _0x57de72 ** 2;
}
const _0x2c57fe = {
  x: 0,
  y: 0
};
function translateXYToElement(_0x4a172e = _0x2c57fe, _0xabe7d7 = {}, _0x18c89c = 1) {
  const _0x54a898 = _0xabe7d7.getBoundingClientRect();
  return {
    x: (_0x4a172e.x - _0x54a898.left) * _0x18c89c,
    y: (_0x4a172e.y - _0x54a898.top) * _0x18c89c
  };
}
function getMouseButtonsPressed(_0x1552f5 = {}) {
  return [1, 2, 4, 8, 16].filter(_0x102260 => _0x1552f5.buttons & _0x102260);
}
function getAngle(_0x550425, _0x176d7f, _0xd9a986, _0x2644fc) {
  const _0x2e77f8 = _0x550425 - _0xd9a986;
  const _0x260b71 = _0x176d7f - _0x2644fc;
  let _0x53c213 = Math.atan2(-_0x260b71, -_0x2e77f8);
  _0x53c213 *= 180 / Math.PI;
  if (_0x53c213 < 0) {
    _0x53c213 += 360;
  }
  return _0x53c213;
}
const _0x4e332e = {
  x: 0,
  y: 0
};
const _0x35aab1 = {
  x: 0,
  y: 0
};
function getDistanceBetweenPoints(_0x5bffbb = _0x4e332e, _0x34892f = _0x35aab1) {
  return Math.hypot(_0x34892f.x - _0x5bffbb.x, _0x34892f.y - _0x5bffbb.y);
}
function addAngle(_0x2a9d2d = 0, _0x259030 = 0) {
  const _0x4b27aa = _0x2a9d2d + _0x259030;
  let _0x209f83;
  if (_0x4b27aa > 0) {
    _0x209f83 = _0x4b27aa % 360;
  } else {
    _0x209f83 = 360 + _0x4b27aa % 360;
  }
  if (_0x209f83 === 360) {
    _0x209f83 = 0;
  }
  return _0x209f83;
}
function diffAngle(_0x2f76ea = 0, _0xee0e3a = 0) {
  const _0x3115a8 = 180 - _0xee0e3a;
  const _0x3c7ee9 = addAngle(_0x2f76ea, _0x3115a8);
  return 180 - _0x3c7ee9;
}
function calcWheelRotationForTargetAngle(_0x4608cd = 0, _0x5f3874 = 0, _0xd8d578 = 1) {
  let _0x27ff6b = (_0x4608cd % 360 + _0x5f3874) % 360;
  _0x27ff6b = fixFloat(_0x27ff6b);
  _0x27ff6b = (_0xd8d578 === 1 ? 360 - _0x27ff6b : 360 + _0x27ff6b) % 360;
  _0x27ff6b *= _0xd8d578;
  return _0x4608cd + _0x27ff6b;
}
function isObject(_0x445540) {
  return typeof _0x445540 === "object" && !Array.isArray(_0x445540) && _0x445540 !== null;
}
function isNumber(_0x12031b) {
  return typeof _0x12031b === "number" && !Number.isNaN(_0x12031b);
}
function setProp({
  val: _0xc15001,
  isValid: _0x39787c,
  errorMessage: _0x5c7a75,
  defaultValue: _0xfe13fc,
  action = null
}) {
  if (_0x39787c) {
    if (action) {
      return action();
    } else {
      return _0xc15001;
    }
  } else if (_0xc15001 === undefined) {
    return _0xfe13fc;
  }
  throw new Error(_0x5c7a75);
}
function fixFloat(_0x1e6db9 = 0) {
  return Number(_0x1e6db9.toFixed(9));
}
function easeSinOut(_0x4f0d35) {
  return Math.sin(_0x4f0d35 * Math.PI / 2);
}
function getResizeObserver(_0x3898be = {}, _0x2162ce = {}) {
  if (window.ResizeObserver) {
    const _0x29b228 = new ResizeObserver(() => {
      _0x2162ce({
        redraw: true
      });
    });
    _0x29b228.observe(_0x3898be);
    return {
      stop: () => {
        _0x29b228.unobserve(_0x3898be);
        _0x29b228.disconnect();
      }
    };
  }
  window.addEventListener("resize", _0x2162ce);
  return {
    stop: () => {
      window.removeEventListener("resize", _0x2162ce);
    }
  };
}
export { addAngle, aveArray, calcWheelRotationForTargetAngle, degRad, diffAngle, easeSinOut, fixFloat, getAngle, getDistanceBetweenPoints, getFontSizeToFit, getMouseButtonsPressed, getRandomFloat, getRandomInt, getResizeObserver, isAngleBetween, isNumber, isObject, isPointInCircle, setProp, translateXYToElement };