var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (_0x5e77c3, _0x4feef6) => function _0xb7c090() {
  if (!_0x4feef6) {
    (0, _0x5e77c3[__getOwnPropNames(_0x5e77c3)[0]])((_0x4feef6 = {
      exports: {}
    }).exports, _0x4feef6);
  }
  return _0x4feef6.exports;
};
var __export = (_0x3277da, _0x4896c4) => {
  for (var _0x5c641f in _0x4896c4) {
    __defProp(_0x3277da, _0x5c641f, {
      get: _0x4896c4[_0x5c641f],
      enumerable: true
    });
  }
};
var __copyProps = (_0x21894f, _0x355129, _0x5d22dc, _0x42e8da) => {
  if (_0x355129 && typeof _0x355129 === "object" || typeof _0x355129 === "function") {
    for (let _0xfbe4ac of __getOwnPropNames(_0x355129)) {
      if (!__hasOwnProp.call(_0x21894f, _0xfbe4ac) && _0xfbe4ac !== _0x5d22dc) {
        __defProp(_0x21894f, _0xfbe4ac, {
          get: () => _0x355129[_0xfbe4ac],
          enumerable: !(_0x42e8da = __getOwnPropDesc(_0x355129, _0xfbe4ac)) || _0x42e8da.enumerable
        });
      }
    }
  }
  return _0x21894f;
};
var __toESM = (_0x1308c1, _0xc249c8, _0x2c126c) => {
  _0x2c126c = _0x1308c1 != null ? __create(__getProtoOf(_0x1308c1)) : {};
  return __copyProps(_0xc249c8 || !_0x1308c1 || !_0x1308c1.__esModule ? __defProp(_0x2c126c, "default", {
    value: _0x1308c1,
    enumerable: true
  }) : _0x2c126c, _0x1308c1);
};
var _0x5aa0ea = {
  value: true
};
var __toCommonJS = _0x237f36 => __copyProps(__defProp({}, "__esModule", _0x5aa0ea), _0x237f36);
var require_plugin = __commonJS({
  "../work/marp-team__marpit/src/plugin.js"(_0xdd02a9, _0x192e2) {
    function _0x263d8d(_0x21bfe7) {
      return function (_0x21020d, ..._0x249348) {
        if (_0x21020d.marpit) {
          return _0x21bfe7.call(this, _0x21020d, ..._0x249348);
        }
        throw new Error("Marpit plugin has detected incompatible markdown-it instance.");
      };
    }
    Object.defineProperty(_0x263d8d, "__esModule", {
      value: true
    });
    Object.defineProperty(_0x263d8d, "default", {
      value: _0x263d8d
    });
    Object.defineProperty(_0x263d8d, "marpitPlugin", {
      value: _0x263d8d
    });
    _0x192e2.exports = _0x263d8d;
  }
});
var apply_exports = {};
var _0x84972c = {
  apply: () => apply,
  default: () => apply_default
};
__export(apply_exports, _0x84972c);
module.exports = __toCommonJS(apply_exports);
var import_postcss = require("postcss");
var InlineStyle = class _InlineStyle {
  constructor(_0x373b68) {
    this.decls = {};
    if (_0x373b68) {
      if (_0x373b68 instanceof _InlineStyle || typeof _0x373b68 === "string") {
        var _0x208b32 = {
          from: undefined
        };
        const _0x3149ba = (0, import_postcss.parse)(_0x373b68.toString(), _0x208b32);
        _0x3149ba.each(_0x4ae0ce => {
          if (_0x4ae0ce.type === "decl") {
            this.decls[_0x4ae0ce.prop] = _0x4ae0ce.value;
          }
        });
      } else {
        var _0x4c2a06 = {
          ..._0x373b68
        };
        this.decls = _0x4c2a06;
      }
    }
  }
  delete(_0x322bd1) {
    delete this.decls[_0x322bd1];
    return this;
  }
  set(_0x5bc01a, _0x1c18aa) {
    this.decls[_0x5bc01a] = _0x1c18aa;
    return this;
  }
  toString() {
    let _0x3c6ed3 = "";
    for (const _0x41f4fd of Object.keys(this.decls)) {
      let _0x5ba512;
      try {
        var _0x35656f = {
          from: undefined
        };
        _0x5ba512 = (0, import_postcss.parse)(_0x41f4fd + ":" + this.decls[_0x41f4fd], _0x35656f);
      } catch {}
      if (_0x5ba512) {
        _0x5ba512.each(_0x2ebf41 => {
          if (_0x2ebf41.type !== "decl" || _0x2ebf41.prop !== _0x41f4fd) {
            _0x2ebf41.remove();
          }
        });
        _0x3c6ed3 += _0x5ba512.toString() + ";";
      }
    }
    return _0x3c6ed3;
  }
};
var globals = Object.assign(Object.create(null), {
  headingDivider: _0x30c81e => {
    const _0x23895c = [1, 2, 3, 4, 5, 6];
    const _0xdc5a4 = _0x7e21 => Array.isArray(_0x7e21) || Number.isNaN(_0x7e21) ? _0x7e21 : Number.parseInt(_0x7e21, 10);
    const _0x4a52f8 = _0xdc5a4(_0x30c81e);
    if (Array.isArray(_0x4a52f8)) {
      const _0x644f7 = _0x4a52f8.map(_0xdc5a4);
      return {
        headingDivider: _0x23895c.filter(_0x5b1af3 => _0x644f7.includes(_0x5b1af3))
      };
    }
    if (_0x30c81e === "false") {
      return {
        headingDivider: false
      };
    }
    if (_0x23895c.includes(_0x4a52f8)) {
      return {
        headingDivider: _0x4a52f8
      };
    }
    return {};
  },
  style: _0x476018 => ({
    style: _0x476018
  }),
  theme: (_0x404010, _0xfbfde0) => _0xfbfde0.themeSet.has(_0x404010) ? {
    theme: _0x404010
  } : {},
  lang: _0x5ee36a => ({
    lang: _0x5ee36a
  })
});
var locals = Object.assign(Object.create(null), {
  backgroundColor: _0x11424b => ({
    backgroundColor: _0x11424b
  }),
  backgroundImage: _0x19f71e => ({
    backgroundImage: _0x19f71e
  }),
  backgroundPosition: _0x5c82c5 => ({
    backgroundPosition: _0x5c82c5
  }),
  backgroundRepeat: _0x2225ba => ({
    backgroundRepeat: _0x2225ba
  }),
  backgroundSize: _0x301b04 => ({
    backgroundSize: _0x301b04
  }),
  class: _0xde7bce => ({
    class: Array.isArray(_0xde7bce) ? _0xde7bce.join(" ") : _0xde7bce
  }),
  color: _0x5667d6 => ({
    color: _0x5667d6
  }),
  footer: _0x2803ed => typeof _0x2803ed === "string" ? {
    footer: _0x2803ed
  } : {},
  header: _0x4a5672 => typeof _0x4a5672 === "string" ? {
    header: _0x4a5672
  } : {},
  paginate: _0x358daa => {
    const _0x5606b9 = (_0x358daa || "").toLowerCase();
    if (["hold", "skip"].includes(_0x5606b9)) {
      return {
        paginate: _0x5606b9
      };
    }
    return {
      paginate: _0x5606b9 === "true"
    };
  }
});
var directives_default = [...Object.keys(globals), ...Object.keys(locals)];
var import_lodash = __toESM(require("lodash.kebabcase"));
var import_plugin = __toESM(require_plugin());
function _apply(_0x5485cc, _0x5e29ca = {}) {
  const {
    marpit: _0x3db714
  } = _0x5485cc;
  const {
    lang: _0x14fe0f
  } = _0x3db714.options;
  const _0x35f168 = _0x5e29ca.dataset === undefined ? true : !!_0x5e29ca.dataset;
  const _0x3dac16 = _0x5e29ca.css === undefined ? true : !!_0x5e29ca.css;
  const {
    global: _0x283688,
    local: _0x143670
  } = _0x3db714.customDirectives;
  const _0x38005d = [...Object.keys(_0x283688), ...Object.keys(_0x143670), ...directives_default];
  _0x5485cc.core.ruler.after("marpit_directives_parse", "marpit_directives_apply", _0x54b3b1 => {
    if (_0x54b3b1.inlineMode) {
      return;
    }
    let _0x2f2852 = 0;
    const _0x49b40b = [];
    for (const _0x55c681 of _0x54b3b1.tokens) {
      const {
        marpitDirectives: _0x14e0af
      } = _0x55c681.meta || {};
      if (_0x55c681.type === "marpit_slide_open") {
        if (_0x14e0af?.paginate !== "skip" && _0x14e0af?.paginate !== "hold") {
          _0x2f2852 += 1;
        }
      }
      if (_0x14e0af) {
        const _0x2b7f78 = new InlineStyle(_0x55c681.attrGet("style"));
        for (const _0x4b1eed of Object.keys(_0x14e0af)) {
          if (_0x38005d.includes(_0x4b1eed)) {
            const _0x289c6e = _0x14e0af[_0x4b1eed];
            if (_0x289c6e) {
              const _0xa70211 = (0, import_lodash.default)(_0x4b1eed);
              if (_0x35f168) {
                _0x55c681.attrSet("data-" + _0xa70211, _0x289c6e);
              }
              if (_0x3dac16) {
                _0x2b7f78.set("--" + _0xa70211, _0x289c6e);
              }
            }
          }
        }
        if (_0x14e0af.lang || _0x14fe0f) {
          _0x55c681.attrSet("lang", _0x14e0af.lang || _0x14fe0f);
        }
        if (_0x14e0af.class) {
          _0x55c681.attrJoin("class", _0x14e0af.class);
        }
        if (_0x14e0af.color) {
          _0x2b7f78.set("color", _0x14e0af.color);
        }
        if (_0x14e0af.backgroundColor) {
          _0x2b7f78.set("background-color", _0x14e0af.backgroundColor).set("background-image", "none");
        }
        if (_0x14e0af.backgroundImage) {
          _0x2b7f78.set("background-image", _0x14e0af.backgroundImage).set("background-position", "center").set("background-repeat", "no-repeat").set("background-size", "cover");
          if (_0x14e0af.backgroundPosition) {
            _0x2b7f78.set("background-position", _0x14e0af.backgroundPosition);
          }
          if (_0x14e0af.backgroundRepeat) {
            _0x2b7f78.set("background-repeat", _0x14e0af.backgroundRepeat);
          }
          if (_0x14e0af.backgroundSize) {
            _0x2b7f78.set("background-size", _0x14e0af.backgroundSize);
          }
        }
        if (_0x14e0af.paginate && _0x14e0af.paginate !== "skip") {
          if (_0x2f2852 <= 0) {
            _0x2f2852 = 1;
          }
          _0x55c681.attrSet("data-marpit-pagination", _0x2f2852);
          _0x49b40b.push(_0x55c681);
        }
        if (_0x14e0af.header) {
          _0x55c681.meta.marpitHeader = _0x14e0af.header;
        }
        if (_0x14e0af.footer) {
          _0x55c681.meta.marpitFooter = _0x14e0af.footer;
        }
        const _0x1beb33 = _0x2b7f78.toString();
        if (_0x1beb33 !== "") {
          _0x55c681.attrSet("style", _0x1beb33);
        }
      }
    }
    for (const _0x2202b4 of _0x49b40b) {
      _0x2202b4.attrSet("data-marpit-pagination-total", _0x2f2852);
    }
  });
}
var apply = (0, import_plugin.default)(_apply);
var apply_default = apply;
var _0x187252 = {
  apply: apply
};
if (0) {
  module.exports = _0x187252;
}