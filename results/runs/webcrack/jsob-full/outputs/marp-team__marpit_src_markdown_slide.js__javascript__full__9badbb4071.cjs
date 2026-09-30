var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (_0xa6ee53, _0x1f7b7b) => function _0x173ae6() {
  if (!_0x1f7b7b) {
    (0, _0xa6ee53[__getOwnPropNames(_0xa6ee53)[0]])((_0x1f7b7b = {
      exports: {}
    }).exports, _0x1f7b7b);
  }
  return _0x1f7b7b.exports;
};
var __export = (_0x6bd34e, _0x430b8a) => {
  for (var _0x597c39 in _0x430b8a) {
    __defProp(_0x6bd34e, _0x597c39, {
      get: _0x430b8a[_0x597c39],
      enumerable: true
    });
  }
};
var __copyProps = (_0x223d63, _0x17f815, _0x5b533e, _0x59480c) => {
  if (_0x17f815 && typeof _0x17f815 === "object" || typeof _0x17f815 === "function") {
    for (let _0x1dc887 of __getOwnPropNames(_0x17f815)) {
      if (!__hasOwnProp.call(_0x223d63, _0x1dc887) && _0x1dc887 !== _0x5b533e) {
        __defProp(_0x223d63, _0x1dc887, {
          get: () => _0x17f815[_0x1dc887],
          enumerable: !(_0x59480c = __getOwnPropDesc(_0x17f815, _0x1dc887)) || _0x59480c.enumerable
        });
      }
    }
  }
  return _0x223d63;
};
var __toESM = (_0x30402, _0x19e8af, _0x435f3b) => {
  _0x435f3b = _0x30402 != null ? __create(__getProtoOf(_0x30402)) : {};
  return __copyProps(_0x19e8af || !_0x30402 || !_0x30402.__esModule ? __defProp(_0x435f3b, "default", {
    value: _0x30402,
    enumerable: true
  }) : _0x435f3b, _0x30402);
};
var _0x35f409 = {
  value: true
};
var __toCommonJS = _0x2089b7 => __copyProps(__defProp({}, "__esModule", _0x35f409), _0x2089b7);
var require_plugin = __commonJS({
  "../work/marp-team__marpit/src/plugin.js"(_0x548e53, _0x181b5f) {
    function _0x5a0d1e(_0x4855b2) {
      return function (_0x132f35, ..._0x57c7b9) {
        if (_0x132f35.marpit) {
          return _0x4855b2.call(this, _0x132f35, ..._0x57c7b9);
        }
        throw new Error("Marpit plugin has detected incompatible markdown-it instance.");
      };
    }
    Object.defineProperty(_0x5a0d1e, "__esModule", {
      value: true
    });
    Object.defineProperty(_0x5a0d1e, "default", {
      value: _0x5a0d1e
    });
    Object.defineProperty(_0x5a0d1e, "marpitPlugin", {
      value: _0x5a0d1e
    });
    _0x181b5f.exports = _0x5a0d1e;
  }
});
var slide_exports = {};
var _0x48af5f = {
  default: () => slide_default,
  defaultAnchorCallback: () => defaultAnchorCallback,
  slide: () => slide
};
__export(slide_exports, _0x48af5f);
module.exports = __toCommonJS(slide_exports);
function split(_0x2fb5bb, _0xa41f35, _0x38500b = false) {
  const _0x49d23a = [[]];
  for (const _0x173fde of _0x2fb5bb) {
    if (_0xa41f35(_0x173fde)) {
      _0x49d23a.push(_0x38500b ? [_0x173fde] : []);
    } else {
      _0x49d23a[_0x49d23a.length - 1].push(_0x173fde);
    }
  }
  return _0x49d23a;
}
var split_default = split;
function wrapTokens(_0x5d238e, _0x1fba1d, _0x3ce21b, _0x1fd04b = []) {
  const {
    tag: _0x12ef16
  } = _0x3ce21b;
  for (const _0x3e6593 of _0x1fd04b) {
    _0x3e6593.level += 1;
  }
  const _0x463af9 = new _0x5d238e(_0x1fba1d + "_open", _0x12ef16, 1);
  const _0x483854 = new _0x5d238e(_0x1fba1d + "_close", _0x12ef16, -1);
  var _0x4c1771 = {
    ...(_0x3ce21b.open || {})
  };
  Object.assign(_0x463af9, _0x4c1771);
  var _0x1fa798 = {
    ...(_0x3ce21b.close || {})
  };
  Object.assign(_0x483854, _0x1fa798);
  for (const _0x1312b9 of Object.keys(_0x3ce21b)) {
    if (!["open", "close", "tag"].includes(_0x1312b9) && _0x3ce21b[_0x1312b9] != null) {
      _0x463af9.attrSet(_0x1312b9, _0x3ce21b[_0x1312b9]);
    }
  }
  return [_0x463af9, ..._0x1fd04b, _0x483854];
}
var wrap_tokens_default = wrapTokens;
var import_plugin = __toESM(require_plugin());
var defaultAnchorCallback = _0x136d86 => "" + (_0x136d86 + 1);
function _slide(_0x13404c, _0x1a5644 = {}) {
  const _0x2ab952 = _0x1a5644.anchor === undefined ? true : _0x1a5644.anchor;
  const _0x38d274 = (() => {
    if (typeof _0x2ab952 === "function") {
      return _0x2ab952;
    }
    if (_0x2ab952) {
      return defaultAnchorCallback;
    }
    return () => undefined;
  })();
  _0x13404c.core.ruler.push("marpit_slide", _0x29a08a => {
    if (_0x29a08a.inlineMode) {
      return;
    }
    const _0x1f66d4 = split(_0x29a08a.tokens, _0x2e0a8f => _0x2e0a8f.type === "hr" && _0x2e0a8f.level === 0, true);
    const {
      length: _0x14beb6
    } = _0x1f66d4;
    _0x29a08a.tokens = _0x1f66d4.reduce((_0xf046cb, _0x5f5141, _0x46be9e) => {
      const _0x2b74af = _0x5f5141[0] && _0x5f5141[0].type === "hr" ? _0x5f5141[0] : undefined;
      const _0x579e7a = _0x2b74af || _0x5f5141.find(_0x260fcc => _0x260fcc.map);
      return [..._0xf046cb, ...wrapTokens(_0x29a08a.Token, "marpit_slide", {
        ...(_0x1a5644.attributes || {}),
        tag: "section",
        id: _0x38d274(_0x46be9e),
        open: {
          block: true,
          meta: {
            marpitSlide: _0x46be9e,
            marpitSlideTotal: _0x14beb6,
            marpitSlideElement: 1
          },
          map: _0x579e7a ? _0x579e7a.map : [0, 1]
        },
        close: {
          block: true,
          meta: {
            marpitSlide: _0x46be9e,
            marpitSlideTotal: _0x14beb6,
            marpitSlideElement: -1
          }
        }
      }, _0x5f5141.slice(_0x2b74af ? 1 : 0))];
    }, []);
  });
}
var slide = (0, import_plugin.default)(_slide);
var slide_default = slide;
var _0x241a7a = {
  defaultAnchorCallback: defaultAnchorCallback,
  slide: slide
};
if (0) {
  module.exports = _0x241a7a;
}