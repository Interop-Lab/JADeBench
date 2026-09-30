var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (_0x161c07, _0xb7127e) => function _0x3eb819() {
  if (!_0xb7127e) {
    (0, _0x161c07[__getOwnPropNames(_0x161c07)[0]])((_0xb7127e = {
      exports: {}
    }).exports, _0xb7127e);
  }
  return _0xb7127e.exports;
};
var __export = (_0x3c61a4, _0x4d6b1a) => {
  for (var _0x15556b in _0x4d6b1a) {
    __defProp(_0x3c61a4, _0x15556b, {
      get: _0x4d6b1a[_0x15556b],
      enumerable: true
    });
  }
};
var __copyProps = (_0x5a482c, _0x55838e, _0x40464b, _0x3ea86e) => {
  if (_0x55838e && typeof _0x55838e === "object" || typeof _0x55838e === "function") {
    for (let _0x32aa98 of __getOwnPropNames(_0x55838e)) {
      if (!__hasOwnProp.call(_0x5a482c, _0x32aa98) && _0x32aa98 !== _0x40464b) {
        __defProp(_0x5a482c, _0x32aa98, {
          get: () => _0x55838e[_0x32aa98],
          enumerable: !(_0x3ea86e = __getOwnPropDesc(_0x55838e, _0x32aa98)) || _0x3ea86e.enumerable
        });
      }
    }
  }
  return _0x5a482c;
};
var __toESM = (_0x50b6ea, _0x29feaa, _0x5992b0) => {
  _0x5992b0 = _0x50b6ea != null ? __create(__getProtoOf(_0x50b6ea)) : {};
  return __copyProps(_0x29feaa || !_0x50b6ea || !_0x50b6ea.__esModule ? __defProp(_0x5992b0, "default", {
    value: _0x50b6ea,
    enumerable: true
  }) : _0x5992b0, _0x50b6ea);
};
var _0x66fea9 = {
  value: true
};
var __toCommonJS = _0x1ae4f5 => __copyProps(__defProp({}, "__esModule", _0x66fea9), _0x1ae4f5);
var require_plugin = __commonJS({
  "../work/marp-team__marpit/src/plugin.js"(_0x5adc89, _0x2beb8a) {
    function _0x137abd(_0x361bd2) {
      return function (_0x1274de, ..._0x24badf) {
        if (_0x1274de.marpit) {
          return _0x361bd2.call(this, _0x1274de, ..._0x24badf);
        }
        throw new Error("Marpit plugin has detected incompatible markdown-it instance.");
      };
    }
    Object.defineProperty(_0x137abd, "__esModule", {
      value: true
    });
    Object.defineProperty(_0x137abd, "default", {
      value: _0x137abd
    });
    Object.defineProperty(_0x137abd, "marpitPlugin", {
      value: _0x137abd
    });
    _0x2beb8a.exports = _0x137abd;
  }
});
var heading_divider_exports = {};
var _0x41095e = {
  default: () => heading_divider_default,
  headingDivider: () => headingDivider
};
__export(heading_divider_exports, _0x41095e);
module.exports = __toCommonJS(heading_divider_exports);
function split(_0x1d796a, _0x29d505, _0x10b7d0 = false) {
  const _0xaae5e = [[]];
  for (const _0x8db981 of _0x1d796a) {
    if (_0x29d505(_0x8db981)) {
      _0xaae5e.push(_0x10b7d0 ? [_0x8db981] : []);
    } else {
      _0xaae5e[_0xaae5e.length - 1].push(_0x8db981);
    }
  }
  return _0xaae5e;
}
var split_default = split;
var import_plugin = __toESM(require_plugin());
function _headingDivider(_0x4adf53) {
  const {
    marpit: _0x388ed8
  } = _0x4adf53;
  _0x4adf53.core.ruler.before("marpit_slide", "marpit_heading_divider", _0xe74496 => {
    let _0x3d99f3 = _0x388ed8.options.headingDivider;
    if (_0x388ed8.lastGlobalDirectives && Object.prototype.hasOwnProperty.call(_0x388ed8.lastGlobalDirectives, "headingDivider")) {
      _0x3d99f3 = _0x388ed8.lastGlobalDirectives.headingDivider;
    }
    if (_0xe74496.inlineMode || _0x3d99f3 === false) {
      return;
    }
    if (Number.isInteger(_0x3d99f3) && _0x3d99f3 >= 1 && _0x3d99f3 <= 6) {
      _0x3d99f3 = [...Array(_0x3d99f3).keys()].map(_0x13bb08 => _0x13bb08 + 1);
    }
    if (!Array.isArray(_0x3d99f3)) {
      return;
    }
    const _0x14b508 = _0x3d99f3.map(_0x5237bb => "h" + _0x5237bb);
    const _0x568409 = _0x2da7d9 => _0x2da7d9.type === "heading_open" && _0x14b508.includes(_0x2da7d9.tag);
    const _0x5ffb5e = [];
    for (const _0x5d0ad5 of split(_0xe74496.tokens, _0x568409, true)) {
      const [_0x197a06] = _0x5d0ad5;
      if (_0x197a06 && _0x568409(_0x197a06) && _0x5ffb5e.some(_0xa4c46d => !_0xa4c46d.hidden)) {
        const _0x451480 = new _0xe74496.Token("hr", "", 0);
        _0x451480.hidden = true;
        _0x451480.map = _0x197a06.map;
        _0x5ffb5e.push(_0x451480);
      }
      _0x5ffb5e.push(..._0x5d0ad5);
    }
    _0xe74496.tokens = _0x5ffb5e;
  });
}
var headingDivider = (0, import_plugin.default)(_headingDivider);
var heading_divider_default = headingDivider;
var _0x34141d = {
  headingDivider: headingDivider
};
if (0) {
  module.exports = _0x34141d;
}