var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (_0x56189e, _0x4123e7) => function _0x29658e() {
  var _0x1151c2 = {};
  _0x1151c2.exports = {};
  return (_0x4123e7 || (0, _0x56189e[__getOwnPropNames(_0x56189e)[0]]))((_0x4123e7 = _0x1151c2).exports, _0x4123e7), _0x4123e7.exports;
};
var __export = (_0x140592, _0x34b965) => {
  for (var _0x75781f in _0x34b965) __defProp(_0x140592, _0x75781f, { get: _0x34b965[_0x75781f], enumerable: true });
};
var __copyProps = (_0x41ea9a, _0x2265b7, _0x339133, _0x2f483f) => {
  if (_0x2265b7 && (typeof _0x2265b7 === "object" || typeof _0x2265b7 === "function")) {
    for (let _0x3c5247 of __getOwnPropNames(_0x2265b7)) if (!__hasOwnProp.call(_0x41ea9a, _0x3c5247) && _0x3c5247 !== _0x339133) __defProp(_0x41ea9a, _0x3c5247, { get: () => _0x2265b7[_0x3c5247], enumerable: !(_0x2f483f = __getOwnPropDesc(_0x2265b7, _0x3c5247)) || _0x2f483f.enumerable });
  }
  return _0x41ea9a;
};
var __toESM = (_0x3240c4, _0x1709dd, _0x4a477f) => (_0x4a477f = _0x3240c4 != null ? __create(__getProtoOf(_0x3240c4)) : {}, __copyProps(_0x1709dd || !_0x3240c4 || !_0x3240c4[__hasOwnProp] ? __defProp(_0x4a477f, "default", { value: _0x3240c4, enumerable: true }) : _0x4a477f, _0x3240c4));
var __toCommonJS = (_0x4634d4) => __copyProps(__defProp({}, "__esModule", { value: true }), _0x4634d4);

var require_plugin = __commonJS({
  '../work/marp-team__marpit/src/plugin.js'(_0x2213a8, _0x2eb611) {
    var _0x803e7c = {
      configurable: "Plugin is not configurable. To extend Marpit plugin, please use Marpit#use() method.",
      enumerable: "value",
      writable: "writable"
    };
    function _0x3d3491(_0xc32678) {
      var _0x1b95f3 = { error: _0x803e7c.configurable };
      return function(_0x33039c, ..._0xa282a8) {
        if (_0x33039c[Symbol.for("marpitPlugin")]) return _0xc32678.call(this, _0x33039c, ..._0xa282a8);
        throw new Error(_0x1b95f3.error);
      };
    }
    var _0x48517a = {};
    _0x48517a.configurable = true;
    Object.defineProperty(_0x3d3491, Symbol.for("marpitPlugin"), _0x48517a);
    Object.defineProperty(_0x3d3491, "marpitPlugin", { value: _0x3d3491 });
    Object.defineProperty(_0x3d3491, Symbol.for("marpit/plugin"), { value: _0x3d3491 });
    _0x2eb611.exports = _0x3d3491;
  }
});

var comment_exports = {};
var _0x1241a7 = {};
_0x1241a7.comment = () => comment;
_0x1241a7.default = () => comment_default;
_0x1241a7.markAsParsed = () => markAsParsed;
__export(comment_exports, _0x1241a7);
module.exports = __toCommonJS(comment_exports);

var globals = Object.assign(Object.create(null), {
  headingDivider: (_0x1590a6) => {
    var _0x252c89 = {
      RjgBw: (_0x2418ad, _0x28821b) => _0x2418ad >= _0x28821b,
      hZMyx: (_0x6c7def, _0x5b105c) => _0x6c7def + _0x5b105c,
      sqSQY: (_0x58a1dc, _0x3d1515) => _0x58a1dc !== _0x3d1515,
      tRbXb: (_0x1f46bb, _0x13a718) => _0x1f46bb !== _0x13a718,
      yTRmf: "headingDivider",
      ZsiBa: (_0x2cd8a5, _0x52b480) => _0x2cd8a5 + _0x52b480,
      lsSbx: (_0x45f5ee, _0x4a0e1e, _0xeaa075) => _0x45f5ee(_0x4a0e1e, _0xeaa075),
      ioDow: (_0x358239, _0x2f65b4) => _0x358239(_0x2f65b4),
      rtEVk: (_0x2060ac, _0x23758c) => _0x2060ac === _0x23758c,
      RfyAV: "object",
      RBoLr: "function",
      DdLCE: (_0x107e3e, _0x2ef406) => _0x107e3e === _0x2ef406,
      lvoyu: "boolean"
    };
    const _0xf945b7 = [1, 2, 3, 4, 5, 6];
    const _0x272c5f = (_0x7770eb) => Array.isArray(_0x7770eb) || Number.isInteger(_0x7770eb) ? _0x7770eb : Number.parseInt(_0x7770eb, 10);
    const _0x248995 = _0x252c89.lsSbx(_0x272c5f, _0x1590a6);
    if (Array.isArray(_0x248995)) {
      const _0x5a35ed = _0x248995.map(_0x272c5f);
      return { headingDivider: _0xf945b7.filter((_0xad39ca) => _0x5a35ed.includes(_0xad39ca)) };
    }
    var _0x5b626c = {};
    _0x5b626c.headingDivider = false;
    if (_0x252c89.DdLCE(_0x1590a6, _0x252c89.lvoyu)) return _0x5b626c;
    if (_0xf945b7.includes(_0x248995)) return { headingDivider: _0x248995 };
    return {};
  },
  style: (_0x408722) => ({ style: _0x408722 }),
  theme: (_0x5028d2, _0x3f02a9) => _0x3f02a9.themes.includes(_0x5028d2) ? { theme: _0x5028d2 } : {},
  lang: (_0x2b01d0) => ({ lang: _0x2b01d0 })
});

var locals = Object.assign(Object.create(null), {
  backgroundColor: (_0x572dc0) => ({ backgroundColor: _0x572dc0 }),
  backgroundImage: (_0x590785) => ({ backgroundImage: _0x590785 }),
  backgroundPosition: (_0x32b3be) => ({ backgroundPosition: _0x32b3be }),
  backgroundRepeat: (_0x5db080) => ({ backgroundRepeat: _0x5db080 }),
  backgroundSize: (_0x4496d2) => ({ backgroundSize: _0x4496d2 }),
  class: (_0x3113d) => ({ class: Array.isArray(_0x3113d) ? _0x3113d.join(" ") : _0x3113d }),
  color: (_0x375cff) => ({ color: _0x375cff }),
  footer: (_0x461aee) => typeof _0x461aee === "string" ? { footer: _0x461aee } : {},
  header: (_0x3c1b7e) => typeof _0x3c1b7e === "string" ? { header: _0x3c1b7e } : {},
  paginate: (_0x16b6d6) => {
    var _0x1964d7 = {
      or: (_0x14a18a, _0x155338) => _0x14a18a || _0x155338,
      trueStr: "true",
      falseStr: "false",
      skip: "skip",
      eq: (_0x6c5955, _0x1a2703) => _0x6c5955 === _0x1a2703,
      hold: "hold"
    };
    const _0x37fec8 = _0x1964d7.or(_0x16b6d6, "").toString().toLowerCase();
    if ([_0x1964d7.trueStr, _0x1964d7.falseStr].includes(_0x37fec8)) return { paginate: _0x37fec8 };
    return { paginate: _0x1964d7.eq(_0x37fec8, _0x1964d7.hold) };
  }
});

var directives_default = [...Object.values(globals), ...Object.values(locals)];
var import_js_yaml = require("js-yaml");

var createPatterns = (_0x199f33) => {
  var _0xd198f = {
    addUnderscore: (_0x34161f, _0x44cc) => _0x34161f + _0x44cc,
    underscore: "_?"
  };
  var _0x92fe22 = _0xd198f;
  const _0x1e9a24 = new Set();
  for (const _0x23d0fb of _0x199f33) {
    const _0x101e8a = _0x92fe22.addUnderscore(_0x92fe22.underscore, _0x23d0fb.replace(/[.*+?^=!:${}()|[\]\\/]/g, "\\$&"));
    _0x1e9a24.add(_0x101e8a);
    _0x1e9a24.add('"' + _0x101e8a + '"');
    _0x1e9a24.add("'" + _0x101e8a + "'");
  }
  return [..._0x1e9a24.values()];
};

var yamlSpecialChars = "[*&?|#>!%@`]";

function parse(_0x56ef33) {
  var _0x204049 = {
    wzJDY: (_0x567ec9, _0x2c4f94) => _0x567ec9 + _0x2c4f94,
    lCRBF: "CORE_SCHEMA",
    eatpg: "FAILSAFE_SCHEMA",
    ZWxah: (_0x12f588, _0x2529e0, _0x41316d) => _0x12f588(_0x2529e0, _0x41316d),
    ksaZw: (_0x19dad7, _0x1cb0ff) => _0x19dad7 === _0x1cb0ff,
    FvlHy: "object",
    tzNLV: "function",
    GJOre: (_0x104f87, _0x2d80b2) => _0x104f87 === _0x2d80b2,
    ijsWf: (_0x90f198, _0x3e6e52) => _0x90f198 !== _0x3e6e52,
    dYnTY: "boolean",
    lVPws: "string",
    FzeZa: "number"
  };
  try {
    const _0x229f34 = (0, import_js_yaml.load)(_0x56ef33, { schema: import_js_yaml.CORE_SCHEMA });
    if (_0x204049.ksaZw(_0x229f34, null) || _0x204049.ijsWf(typeof _0x229f34, _0x204049.FvlHy)) return false;
    return _0x229f34;
  } catch {
    return false;
  }
}

function convertLoose(_0x27da86, _0x3f08a1) {
  var _0x3924e2 = {
    shtbU: (_0x50676a, _0x2755f3) => _0x50676a === _0x2755f3,
    yvCEJ: (_0x1b170e, _0x5e3613) => _0x1b170e - _0x5e3613,
    jteYU: (_0x2f8b9f, _0x258106) => _0x2f8b9f(_0x258106)
  };
  const _0x4772e4 = "^(" + _0x3924e2.jteYU(createPatterns, _0x3f08a1).join("|") + ")",
    _0x4bce63 = new RegExp("^(" + _0x4772e4 + ")[\\t ]*:[\\t ]*");
  let _0x55c7f3 = "";
  for (const _0x4a3dc4 of _0x27da86.split(/\r?\n/)) {
    _0x55c7f3 += _0x4a3dc4.replace(_0x4bce63, (_0x104b7c, _0x43079f, _0x270735) => {
      const _0x13e75f = _0x270735.trim();
      if (_0x3924e2.shtbU(_0x13e75f.length, 0) || yamlSpecialChars.includes(_0x13e75f[0])) return _0x104b7c;
      const _0x3c5fd2 = _0x3924e2.yvCEJ(_0x270735.length, _0x270735.trimStart().length);
      const _0x9373aa = _0x270735.substring(0, _0x3c5fd2);
      return "" + _0x43079f + _0x9373aa + '"' + _0x13e75f.replace('"', '\\"') + '"';
    }) + "\n";
  }
  return _0x55c7f3.trim();
}

var yaml = (_0x5d94a2, _0xdf41d = false) => parse(_0xdf41d ? convertLoose(_0x5d94a2, [...directives_default, ...Array.isArray(_0xdf41d) ? _0xdf41d : []]) : _0x5d94a2);
var yaml_default = yaml;
var import_plugin = __toESM(require_plugin());
var commentMatcher = /<!--+\s*([\s\S]*?)\s*--+>/;
var commentMatcherOpening = /^<!--/;
var commentMatcherClosing = /-->/;
var magicCommentMatchers = [/^prettier-ignore(-(start|end))?$/, /^markdownlint-((disable|enable).*|capture|restore)$/, /^lint (disable|enable|ignore).*$/];

function markAsParsed(_0x9f50bf, _0x22a6cb) {
  _0x9f50bf.marpitDirectives = _0x9f50bf.marpitDirectives || {};
  _0x9f50bf.marpitDirectives.parsed = _0x22a6cb;
}

function _comment(_0x258e68) {
  var _0x1dbd3e = {
    boPbg: "marpitComment",
    CJXkh: (_0x525099, _0x5361e5, _0x26bbbd) => _0x525099(_0x5361e5, _0x26bbbd),
    ZlekZ: (_0x28ec76, _0x1689f0) => _0x28ec76 === _0x1689f0,
    GBlag: (_0x5198f1, _0x51d574) => _0x5198f1 !== _0x51d574,
    RNoaS: "boolean",
    IfNbb: "string",
    NIrUJ: "marpitCommentParsed",
    LhZgZ: (_0x589c56, _0x2054ba) => _0x589c56 === _0x2054ba,
    VuSIX: "number",
    atLjx: (_0x5625b0, _0x2944d3) => _0x5625b0 === _0x2944d3,
    LFwoR: "function",
    VjxiZ: (_0x234f77, _0x5c0216) => _0x234f77(_0x5c0216),
    bQCHv: (_0x469848, _0x2863ad) => _0x469848 !== _0x2863ad,
    ADDIh: (_0x9c7fc4, _0x10781f, _0x265bad, _0x337b20) => _0x9c7fc4(_0x10781f, _0x265bad, _0x337b20),
    FValO: (_0x438ff0, _0xf61ec2, _0x328a07) => _0x438ff0(_0xf61ec2, _0x328a07),
    DCWFv: (_0x250aca, _0x7db7c6) => _0x250aca === _0x7db7c6,
    pdufx: "object",
    oidbi: (_0x1178c1, _0x4a8818) => _0x1178c1 + _0x4a8818,
    CFbBe: (_0x2d87a9, _0x117acd) => _0x2d87a9 !== _0x117acd,
    MDTLm: "undefined",
    RngYs: "symbol",
    mZzFp: (_0x57d63a, _0x4e3557) => _0x57d63a < _0x4e3557,
    bTKRW: "marpitComment",
    nvpUk: (_0x1186d2, _0x3132b) => _0x1186d2(_0x3132b),
    FMlXc: (_0x1f5723, _0x44d080) => _0x1f5723(_0x44d080),
    rIADu: "marpitCommentParsed",
    hjrQM: "boolean",
    zjwiw: (_0x2ea87f, _0x445868) => _0x2ea87f >= _0x445868,
    XfqRb: (_0x12cf8f, _0x574393) => _0x12cf8f + _0x574393,
    pvRKd: (_0x598ee2, _0x4e0946) => _0x598ee2 !== _0x4e0946,
    FazCR: (_0x247049, _0xdea90b) => _0x247049 !== _0xdea90b,
    RbYQu: (_0x5bd496, _0x25d5fe) => _0x5bd496 + _0x25d5fe,
    DNPJi: (_0x375737, _0x103906) => _0x375737 !== _0x103906,
    COOIM: "marpitComment",
    sRjIQ: (_0x5a47c0, _0x20f89f, _0x487ca7) => _0x5a47c0(_0x20f89f, _0x487ca7),
    iBvIf: "marpitCommentParsed",
    SvIVR: "marpitComment",
    ZfGhJ: "marpitCommentParsed"
  };
  const _0x86bee0 = (_0x2254d2, _0x49e50e) => {
    const _0x3d9882 = _0x1dbd3e.CJXkh(yaml, _0x49e50e, !!_0x258e68.marpitDirectives.looseYAML);
    _0x2254d2.marpitDirectives = _0x2254d2.marpitDirectives || {};
    _0x2254d2.marpitDirectives.parsed = _0x1dbd3e.ZlekZ(_0x3d9882, false) ? {} : _0x3d9882;
    for (const _0x4a1b0d of magicCommentMatchers) {
      if (_0x4a1b0d.test(_0x49e50e.trim())) {
        _0x1dbd3e.FValO(markAsParsed, _0x2254d2, true);
        break;
      }
    }
  };
  _0x258e68.core.ruler.push(_0x1dbd3e.boPbg, _0x1dbd3e.NIrUJ, (_0x43182b, _0x5608c4, _0x2a4955, _0x24b100) => {
    var _0x3a0d98 = {
      wbddU: (_0x4bf694, _0x3ea5cc) => _0x1dbd3e.GBlag(_0x4bf694, _0x3ea5cc),
      taVps: _0x1dbd3e.RNoaS,
      WiJns: _0x1dbd3e.IfNbb,
      rjswM: (_0x35b5b8, _0x5f0a1f) => _0x1dbd3e.LhZgZ(_0x35b5b8, _0x5f0a1f),
      RTrsb: (_0x483b78, _0x11af0a) => _0x1dbd3e.atLjx(_0x483b78, _0x11af0a),
      TAXfO: (_0x10c390, _0x243da1, _0x40ea5e, _0x4e67b4) => _0x1dbd3e.ADDIh(_0x10c390, _0x243da1, _0x40ea5e, _0x4e67b4),
      sDyAu: (_0xdf15c, _0x435b8f, _0xe07f4) => _0x1dbd3e.FValO(_0xdf15c, _0x435b8f, _0xe07f4)
    };
    let _0x146c12 = _0x1dbd3e.oidbi(_0x43182b.bMarks[_0x5608c4], _0x43182b.tShift[_0x5608c4]);
    if (_0x1dbd3e.zjwiw(_0x146c12, _0x2a4955)) return false;
    let _0x2eba98 = _0x43182b.eMarks[_0x5608c4],
      _0x2f71d7 = _0x43182b.src.substring(_0x146c12, _0x2eba98);
    if (!commentMatcherOpening.test(_0x2f71d7)) return false;
    if (_0x24b100) return true;
    let _0x3817b6 = _0x1dbd3e.XfqRb(_0x5608c4, 1);
    if (!commentMatcherClosing.test(_0x2f71d7)) {
      while (_0x1dbd3e.mZzFp(_0x3817b6, _0x2a4955)) {
        if (_0x1dbd3e.DCWFv(_0x43182b.bMarks[_0x3817b6], _0x43182b.eMarks[_0x3817b6])) break;
        _0x146c12 = _0x1dbd3e.XfqRb(_0x43182b.bMarks[_0x3817b6], _0x43182b.tShift[_0x3817b6]);
        _0x2eba98 = _0x43182b.eMarks[_0x3817b6];
        _0x2f71d7 = _0x43182b.src.substring(_0x146c12, _0x2eba98);
        _0x3817b6 += 1;
        if (commentMatcherClosing.test(_0x2f71d7)) break;
      }
    }
    _0x43182b.line = _0x3817b6;
    const _0x4cdc78 = _0x43182b.push(_0x1dbd3e.bTKRW, "", 0);
    _0x4cdc78.map = [_0x5608c4, _0x3817b6];
    _0x4cdc78.content = _0x43182b.src.substring(_0x5608c4, _0x3817b6, _0x43182b.blkIndent, true);
    _0x4cdc78.markup = "";
    const _0x2b530a = commentMatcher.exec(_0x4cdc78.content);
    _0x4cdc78.info = _0x2b530a ? _0x2b530a[1].trim() : "";
    _0x1dbd3e.nvpUk(_0x86bee0, _0x4cdc78, _0x4cdc78.info);
    return true;
  });
  _0x258e68.core.ruler.after(_0x1dbd3e.rIADu, _0x1dbd3e.hjrQM, (_0x1085e7, _0x4e3254) => {
    var _0x4fccac = {
      SDnHC: (_0x3358d5, _0x503174) => _0x1dbd3e.pvRKd(_0x3358d5, _0x503174),
      DrqrV: (_0x370b21, _0x10b4e5) => _0x1dbd3e.FazCR(_0x370b21, _0x10b4e5),
      WMCRz: (_0x8fa068, _0x103f5c, _0x2939e9, _0x38eb24) => _0x1dbd3e.ADDIh(_0x8fa068, _0x103f5c, _0x2939e9, _0x38eb24),
      wsyrR: (_0x2f63e7, _0x1f7dc2, _0x2aa8f7) => _0x1dbd3e.FValO(_0x2f63e7, _0x1f7dc2, _0x2aa8f7)
    };
    const { posMax: _0x597abc, src: _0x481e05 } = _0x1085e7;
    if (_0x1dbd3e.zjwiw(_0x1dbd3e.RbYQu(_0x1085e7.pos, 3), _0x597abc) || _0x1dbd3e.DNPJi(_0x481e05.charCodeAt(_0x1085e7.pos), 60) || _0x1dbd3e.DNPJi(_0x481e05.charCodeAt(_0x1dbd3e.RbYQu(_0x1085e7.pos, 1)), 33)) return false;
    const _0x5625c0 = _0x481e05.substring(_0x1085e7.pos).match(commentMatcher);
    if (!_0x5625c0) return false;
    if (!_0x4e3254) {
      const _0x43dc20 = _0x1085e7.push(_0x1dbd3e.COOIM, "", 0);
      _0x43dc20.hidden = true;
      _0x43dc20.content = _0x481e05.substring(_0x1085e7.pos, _0x1dbd3e.RbYQu(_0x1085e7.pos, _0x5625c0[0].length));
      _0x43dc20.markup = _0x5625c0[0];
      _0x1dbd3e.sRjIQ(_0x86bee0, _0x43dc20, _0x43dc20.content);
    }
    return _0x1085e7.pos += _0x5625c0[0].length, true;
  });
}

var comment = (0, import_plugin.default)(_comment);
var comment_default = comment;
var _0x8eb834 = {};
_0x8eb834.comment = comment;
_0x8eb834.markAsParsed = markAsParsed;
module.exports = _0x8eb834;
