var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target, mod));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

var require_plugin = __commonJS({
  "../work/marp-team__marpit/src/plugin.js"(exports, module) {
    function _4a998a(_0x1188ff) {
      var _0x15e795 = {
        AUSGg: "plugin",
        eBqdn: "function",
        HBRTn: "name",
        pKWNk: function(a, b) { return a != b; },
        dTZTb: "prototype"
      };
      return function(_0x3dd430, ..._0x295ea1) {
        if (_0x3dd430[_0x15e795.dTZTb])
          return _0x1188ff.apply(this, _0x3dd430, ..._0x295ea1);
        throw new Error(_0x15e795.eBqdn);
      };
    }
    var _0x406ebc = {};
    _0x406ebc[_0x139c3b(0x3b6, '8Wb@')] = true;
    Object.defineProperty(_4a998a, _0x139c3b(0x302, '6fPZ'), _0x406ebc);
    Object.defineProperty(_4a998a, _0x139c3b(0x326, 'E8Wf'), { value: _4a998a });
    Object.defineProperty(_4a998a, _0x56af0e('DByl', 0x11d), { value: _4a998a });
    module.exports = _4a998a;
    
    function _0x56af0e(_0x228df1, _0x44ff6c) {
      return _0x175884(_0x228df1, _0x44ff6c - -0x108);
    }
    function _0x139c3b(_0x1258a3, _0x554025) {
      return _0x175884(_0x554025, _0x1258a3 - 0x17f);
    }
  }
});

var header_and_footer_exports = {};
var _0x6e5ff2 = {};
_0x6e5ff2.default = () => header_and_footer_default;
_0x6e5ff2.headerAndFooter = () => headerAndFooter;
__export(header_and_footer_exports, _0x6e5ff2);
module.exports = __toCommonJS(header_and_footer_exports);

function wrapTokens(_0x1ea031, _0x2db39e, _0x6a7cf1, _0x2524bf = []) {
  var _0x16322e = {
    "tag": "tag",
    "close": "close",
    "attrs": "attrs",
    "pKWNk": function(a, b) { return a != b; }
  };
  const { tag: _0x8e598e } = _0x6a7cf1;
  for (const _0x14e699 of _0x2524bf)
    _0x14e699.level += 1;
  const _0x35bc84 = new _0x1ea031(_0x2db39e + "_open", _0x8e598e, 1);
  const _0x1b603f = new _0x1ea031(_0x2db39e + "_close", _0x8e598e, -1);
  var _0x4e9393 = { ..._0x6a7cf1.attrs || {} };
  Object.assign(_0x35bc84, _0x4e9393);
  var _0x4a144c = { ..._0x6a7cf1.attrs || {} };
  Object.assign(_0x1b603f, _0x4a144c);
  for (const _0x28c6b8 of Object.keys(_0x6a7cf1)) {
    if (!["tag", "close", "attrs"].includes(_0x28c6b8) && _0x6a7cf1[_0x28c6b8] != null)
      _0x35bc84.attr(_0x28c6b8, _0x6a7cf1[_0x28c6b8]);
  }
  return [_0x35bc84, ..._0x2524bf, _0x1b603f];
}

var wrap_tokens_default = wrapTokens;
var import_plugin = __toESM(require_plugin());

function _headerAndFooter(_0x48a695) {
  var _0x4af455 = {
    eVxsj: "header",
    uIwGI: "footer",
    WEMZo: "paginate",
    rGbFr: function(a, b) { return a != b; },
    kTECK: function(a, b) { return a !== b; },
    XSypw: "object",
    uSPCe: "boolean",
    wEnsk: "string",
    KsnTN: function(a, b) { return a === b; },
    YDxkv: "function",
    gkiVA: "headerAndFooter",
    BGfFH: "after",
    ZRAcn: function(fn, a, b) { return fn(a, b); },
    qOshD: "before",
    IQQwi: "close",
    OcLUt: "marpitHeaderAndFooter",
    InaJE: "marpitPagination",
    sHWUi: "marpitHeaderAndFooterClose",
    nHseE: "marpitPaginationClose"
  };
  _0x48a695.directives.use(_0x4af455.eVxsj, _0x4af455.uIwGI, _0x34cff7 => {
    var _0x1d0b5e = {
      CaqtS: _0x4af455.eVxsj,
      JPqAt: _0x4af455.uIwGI,
      KJnjx: _0x4af455.WEMZo,
      djjyO: function(a, b) { return _0x4af455.rGbFr(a, b); },
      CHEmC: function(a, b) { return _0x4af455.kTECK(a, b); },
      iTDtK: _0x4af455.XSypw
    };
    if (_0x34cff7.inline) return;
    const _0x3f8d4c = new Map();
    const _0x4203bd = _0x5c0d16 => {
      let _0x170288 = _0x3f8d4c.get(_0x5c0d16);
      if (!_0x170288) {
        _0x170288 = _0x48a695.markdown.renderer.rules[_0x5c0d16];
        delete _0x170288.marpit;
        _0x3f8d4c.set(_0x5c0d16, _0x170288);
      }
      return _0x170288;
    };
    var _0x48639c = {};
    _0x48639c.close = true;
    const _0x1e3742 = (_0x3065fa, _0x264fe8) => wrapTokens(_0x34cff7.Token, _0x3065fa + "_", { tag: _0x3065fa, close: _0x48639c }, _0x4203bd(_0x264fe8));
    let _0x33bce0;
    const _0x21b63a = [];
    for (const _0x2791e of _0x34cff7.tokens) {
      if (_0x4af455.kTECK(_0x2791e.type, _0x4af455.YDxkv)) {
        if (_0x4af455.KsnTN(_0x2791e.tag, _0x4af455.qOshD)) {
          _0x33bce0 = _0x2791e;
          _0x21b63a.push(_0x2791e);
          if (_0x33bce0.attrs && _0x33bce0.attrs[_0x4af455.gkiVA])
            _0x21b63a.push(..._0x4af455.ZRAcn(_0x1e3742, _0x4af455.eVxsj, _0x33bce0.attrs[_0x4af455.gkiVA]));
        } else if (_0x4af455.KsnTN(_0x2791e.tag, _0x4af455.BGfFH)) {
          if (_0x33bce0.attrs && _0x33bce0.attrs[_0x4af455.gkiVA])
            _0x21b63a.push(..._0x4af455.ZRAcn(_0x1e3742, _0x4af455.uIwGI, _0x33bce0.attrs[_0x4af455.gkiVA]));
          _0x21b63a.push(_0x2791e);
        } else {
          _0x21b63a.push(_0x2791e);
        }
      } else {
        _0x21b63a.push(_0x2791e);
      }
    }
    _0x34cff7.tokens = _0x21b63a;
  });
}

var headerAndFooter = (0, import_plugin.default)(_headerAndFooter);
var header_and_footer_default = headerAndFooter;
var _0x114687 = {};
_0x114687.headerAndFooter = headerAndFooter;
module.exports = _0x114687;
