var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (_0x34a752, _0x3b79f2) => function _0x4d3ee3() {
  if (!_0x3b79f2) {
    (0, _0x34a752[__getOwnPropNames(_0x34a752)[0]])((_0x3b79f2 = {
      exports: {}
    }).exports, _0x3b79f2);
  }
  return _0x3b79f2.exports;
};
var __export = (_0x527cca, _0x15c636) => {
  for (var _0x3b71cb in _0x15c636) {
    __defProp(_0x527cca, _0x3b71cb, {
      get: _0x15c636[_0x3b71cb],
      enumerable: true
    });
  }
};
var __copyProps = (_0x3aec2e, _0x5507dd, _0x4e0135, _0x4177fc) => {
  if (_0x5507dd && typeof _0x5507dd === "object" || typeof _0x5507dd === "function") {
    for (let _0x1424ac of __getOwnPropNames(_0x5507dd)) {
      if (!__hasOwnProp.call(_0x3aec2e, _0x1424ac) && _0x1424ac !== _0x4e0135) {
        __defProp(_0x3aec2e, _0x1424ac, {
          get: () => _0x5507dd[_0x1424ac],
          enumerable: !(_0x4177fc = __getOwnPropDesc(_0x5507dd, _0x1424ac)) || _0x4177fc.enumerable
        });
      }
    }
  }
  return _0x3aec2e;
};
var __toESM = (_0x26e24e, _0xa7f7db, _0x4df84e) => {
  _0x4df84e = _0x26e24e != null ? __create(__getProtoOf(_0x26e24e)) : {};
  return __copyProps(_0xa7f7db || !_0x26e24e || !_0x26e24e.__esModule ? __defProp(_0x4df84e, "default", {
    value: _0x26e24e,
    enumerable: true
  }) : _0x4df84e, _0x26e24e);
};
var _0x2e6a33 = {
  value: true
};
var __toCommonJS = _0x16471c => __copyProps(__defProp({}, "__esModule", _0x2e6a33), _0x16471c);
var require_plugin = __commonJS({
  "../work/marp-team__marpit/src/plugin.js"(_0x4af9f7, _0x4aeedc) {
    function _0x4a998a(_0x1188ff) {
      return function (_0x3dd430, ..._0x295ea1) {
        if (_0x3dd430.marpit) {
          return _0x1188ff.call(this, _0x3dd430, ..._0x295ea1);
        }
        throw new Error("Marpit plugin has detected incompatible markdown-it instance.");
      };
    }
    Object.defineProperty(_0x4a998a, "__esModule", {
      value: true
    });
    Object.defineProperty(_0x4a998a, "default", {
      value: _0x4a998a
    });
    Object.defineProperty(_0x4a998a, "marpitPlugin", {
      value: _0x4a998a
    });
    _0x4aeedc.exports = _0x4a998a;
  }
});
var header_and_footer_exports = {};
var _0x6e5ff2 = {
  default: () => header_and_footer_default,
  headerAndFooter: () => headerAndFooter
};
__export(header_and_footer_exports, _0x6e5ff2);
module.exports = __toCommonJS(header_and_footer_exports);
function wrapTokens(_0x1ea031, _0x2db39e, _0x6a7cf1, _0x2524bf = []) {
  const {
    tag: _0x8e598e
  } = _0x6a7cf1;
  for (const _0x14e699 of _0x2524bf) {
    _0x14e699.level += 1;
  }
  const _0x35bc84 = new _0x1ea031(_0x2db39e + "_open", _0x8e598e, 1);
  const _0x1b603f = new _0x1ea031(_0x2db39e + "_close", _0x8e598e, -1);
  var _0x4e9393 = {
    ...(_0x6a7cf1.open || {})
  };
  Object.assign(_0x35bc84, _0x4e9393);
  var _0x4a144c = {
    ...(_0x6a7cf1.close || {})
  };
  Object.assign(_0x1b603f, _0x4a144c);
  for (const _0x28c6b8 of Object.keys(_0x6a7cf1)) {
    if (!["open", "close", "tag"].includes(_0x28c6b8) && _0x6a7cf1[_0x28c6b8] != null) {
      _0x35bc84.attrSet(_0x28c6b8, _0x6a7cf1[_0x28c6b8]);
    }
  }
  return [_0x35bc84, ..._0x2524bf, _0x1b603f];
}
var wrap_tokens_default = wrapTokens;
var import_plugin = __toESM(require_plugin());
function _headerAndFooter(_0x48a695) {
  _0x48a695.core.ruler.after("marpit_directives_apply", "marpit_header_and_footer", _0x34cff7 => {
    if (_0x34cff7.inlineMode) {
      return;
    }
    const _0x3f8d4c = new Map();
    const _0x4203bd = _0x5c0d16 => {
      let _0x170288 = _0x3f8d4c.get(_0x5c0d16);
      if (!_0x170288) {
        _0x170288 = _0x48a695.parseInline(_0x5c0d16, _0x34cff7.env);
        delete _0x170288.map;
        _0x3f8d4c.set(_0x5c0d16, _0x170288);
      }
      return _0x170288;
    };
    var _0x48639c = {
      block: true
    };
    const _0x1e3742 = (_0x3065fa, _0x264fe8) => wrapTokens(_0x34cff7.Token, "marpit_" + _0x3065fa, {
      tag: _0x3065fa,
      close: _0x48639c
    }, _0x4203bd(_0x264fe8));
    let _0x33bce0;
    const _0x21b63a = [];
    for (const _0x2791e of _0x34cff7.tokens) {
      if (_0x2791e.type === "marpit_slide_open") {
        _0x33bce0 = _0x2791e;
        _0x21b63a.push(_0x2791e);
        if (_0x33bce0.meta && _0x33bce0.meta.marpitHeader) {
          _0x21b63a.push(..._0x1e3742("header", _0x33bce0.meta.marpitHeader));
        }
      } else if (_0x2791e.type === "marpit_slide_close") {
        if (_0x33bce0.meta && _0x33bce0.meta.marpitFooter) {
          _0x21b63a.push(..._0x1e3742("footer", _0x33bce0.meta.marpitFooter));
        }
        _0x21b63a.push(_0x2791e);
      } else {
        _0x21b63a.push(_0x2791e);
      }
    }
    _0x34cff7.tokens = _0x21b63a;
  });
}
var headerAndFooter = (0, import_plugin.default)(_headerAndFooter);
var header_and_footer_default = headerAndFooter;
var _0x114687 = {
  headerAndFooter: headerAndFooter
};
if (0) {
  module.exports = _0x114687;
}