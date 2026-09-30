var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (_0x37b743, _0x33f710) => {
  for (var _0x1a7390 in _0x33f710) {
    __defProp(_0x37b743, _0x1a7390, {
      get: _0x33f710[_0x1a7390],
      enumerable: true
    });
  }
};
var __copyProps = (_0x7e4eee, _0x4ade03, _0x11accc, _0x3efa67) => {
  if (_0x4ade03 && typeof _0x4ade03 === "object" || typeof _0x4ade03 === "function") {
    for (let _0x55c8a8 of __getOwnPropNames(_0x4ade03)) {
      if (!__hasOwnProp.call(_0x7e4eee, _0x55c8a8) && _0x55c8a8 !== _0x11accc) {
        __defProp(_0x7e4eee, _0x55c8a8, {
          get: () => _0x4ade03[_0x55c8a8],
          enumerable: !(_0x3efa67 = __getOwnPropDesc(_0x4ade03, _0x55c8a8)) || _0x3efa67.enumerable
        });
      }
    }
  }
  return _0x7e4eee;
};
var _0x294d0d = {
  value: true
};
var __toCommonJS = _0x3efdd5 => __copyProps(__defProp({}, "__esModule", _0x294d0d), _0x3efdd5);
var inline_style_exports = {};
var _0x3a06fe = {
  default: () => InlineStyle
};
__export(inline_style_exports, _0x3a06fe);
module.exports = __toCommonJS(inline_style_exports);
var import_postcss = require("postcss");
var InlineStyle = class _InlineStyle {
  constructor(_0x3a66a1) {
    this.decls = {};
    if (_0x3a66a1) {
      if (_0x3a66a1 instanceof _InlineStyle || typeof _0x3a66a1 === "string") {
        var _0x785a8e = {
          from: undefined
        };
        const _0x3975c8 = (0, import_postcss.parse)(_0x3a66a1.toString(), _0x785a8e);
        _0x3975c8.each(_0x394372 => {
          if (_0x394372.type === "decl") {
            this.decls[_0x394372.prop] = _0x394372.value;
          }
        });
      } else {
        var _0x91f8d0 = {
          ..._0x3a66a1
        };
        this.decls = _0x91f8d0;
      }
    }
  }
  delete(_0x56466a) {
    delete this.decls[_0x56466a];
    return this;
  }
  set(_0x4f57b4, _0x3dbba4) {
    this.decls[_0x4f57b4] = _0x3dbba4;
    return this;
  }
  toString() {
    let _0x9efb61 = "";
    for (const _0xe20177 of Object.keys(this.decls)) {
      let _0x27e120;
      try {
        var _0x2cd937 = {
          from: undefined
        };
        _0x27e120 = (0, import_postcss.parse)(_0xe20177 + ":" + this.decls[_0xe20177], _0x2cd937);
      } catch {}
      if (_0x27e120) {
        _0x27e120.each(_0x6f80b3 => {
          if (_0x6f80b3.type !== "decl" || _0x6f80b3.prop !== _0xe20177) {
            _0x6f80b3.remove();
          }
        });
        _0x9efb61 += _0x27e120.toString() + ";";
      }
    }
    return _0x9efb61;
  }
};