var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (_0x56189e, _0x4123e7) => function _0x29658e() {
  if (!_0x4123e7) {
    (0, _0x56189e[__getOwnPropNames(_0x56189e)[0]])((_0x4123e7 = {
      exports: {}
    }).exports, _0x4123e7);
  }
  return _0x4123e7.exports;
};
var __export = (_0x140592, _0x34b965) => {
  for (var _0x75781f in _0x34b965) {
    __defProp(_0x140592, _0x75781f, {
      get: _0x34b965[_0x75781f],
      enumerable: true
    });
  }
};
var __copyProps = (_0x41ea9a, _0x2265b7, _0x339133, _0x2f483f) => {
  if (_0x2265b7 && typeof _0x2265b7 === "object" || typeof _0x2265b7 === "function") {
    for (let _0x3c5247 of __getOwnPropNames(_0x2265b7)) {
      if (!__hasOwnProp.call(_0x41ea9a, _0x3c5247) && _0x3c5247 !== _0x339133) {
        __defProp(_0x41ea9a, _0x3c5247, {
          get: () => _0x2265b7[_0x3c5247],
          enumerable: !(_0x2f483f = __getOwnPropDesc(_0x2265b7, _0x3c5247)) || _0x2f483f.enumerable
        });
      }
    }
  }
  return _0x41ea9a;
};
var __toESM = (_0x3240c4, _0x1709dd, _0x4a477f) => {
  _0x4a477f = _0x3240c4 != null ? __create(__getProtoOf(_0x3240c4)) : {};
  return __copyProps(_0x1709dd || !_0x3240c4 || !_0x3240c4.__esModule ? __defProp(_0x4a477f, "default", {
    value: _0x3240c4,
    enumerable: true
  }) : _0x4a477f, _0x3240c4);
};
var _0x243d8a = {
  value: true
};
var __toCommonJS = _0x4634d4 => __copyProps(__defProp({}, "__esModule", _0x243d8a), _0x4634d4);
var require_plugin = __commonJS({
  "../work/marp-team__marpit/src/plugin.js"(_0x2213a8, _0x2eb611) {
    function _0x3d3491(_0xc32678) {
      return function (_0x33039c, ..._0xa282a8) {
        if (_0x33039c.marpit) {
          return _0xc32678.call(this, _0x33039c, ..._0xa282a8);
        }
        throw new Error("Marpit plugin has detected incompatible markdown-it instance.");
      };
    }
    Object.defineProperty(_0x3d3491, "__esModule", {
      value: true
    });
    Object.defineProperty(_0x3d3491, "default", {
      value: _0x3d3491
    });
    Object.defineProperty(_0x3d3491, "marpitPlugin", {
      value: _0x3d3491
    });
    _0x2eb611.exports = _0x3d3491;
  }
});
var comment_exports = {};
var _0x1241a7 = {
  comment: () => comment,
  default: () => comment_default,
  markAsParsed: () => markAsParsed
};
__export(comment_exports, _0x1241a7);
module.exports = __toCommonJS(comment_exports);
var globals = Object.assign(Object.create(null), {
  headingDivider: _0x1590a6 => {
    const _0xf945b7 = [1, 2, 3, 4, 5, 6];
    const _0x272c5f = _0x7770eb => Array.isArray(_0x7770eb) || Number.isNaN(_0x7770eb) ? _0x7770eb : Number.parseInt(_0x7770eb, 10);
    const _0x248995 = _0x272c5f(_0x1590a6);
    if (Array.isArray(_0x248995)) {
      const _0x5a35ed = _0x248995.map(_0x272c5f);
      return {
        headingDivider: _0xf945b7.filter(_0xad39ca => _0x5a35ed.includes(_0xad39ca))
      };
    }
    if (_0x1590a6 === "false") {
      return {
        headingDivider: false
      };
    }
    if (_0xf945b7.includes(_0x248995)) {
      return {
        headingDivider: _0x248995
      };
    }
    return {};
  },
  style: _0x408722 => ({
    style: _0x408722
  }),
  theme: (_0x5028d2, _0x3f02a9) => _0x3f02a9.themeSet.has(_0x5028d2) ? {
    theme: _0x5028d2
  } : {},
  lang: _0x2b01d0 => ({
    lang: _0x2b01d0
  })
});
var locals = Object.assign(Object.create(null), {
  backgroundColor: _0x572dc0 => ({
    backgroundColor: _0x572dc0
  }),
  backgroundImage: _0x590785 => ({
    backgroundImage: _0x590785
  }),
  backgroundPosition: _0x32b3be => ({
    backgroundPosition: _0x32b3be
  }),
  backgroundRepeat: _0x5db080 => ({
    backgroundRepeat: _0x5db080
  }),
  backgroundSize: _0x4496d2 => ({
    backgroundSize: _0x4496d2
  }),
  class: _0x3113d => ({
    class: Array.isArray(_0x3113d) ? _0x3113d.join(" ") : _0x3113d
  }),
  color: _0x375cff => ({
    color: _0x375cff
  }),
  footer: _0x461aee => typeof _0x461aee === "string" ? {
    footer: _0x461aee
  } : {},
  header: _0x3c1b7e => typeof _0x3c1b7e === "string" ? {
    header: _0x3c1b7e
  } : {},
  paginate: _0x16b6d6 => {
    const _0x37fec8 = (_0x16b6d6 || "").toLowerCase();
    if (["hold", "skip"].includes(_0x37fec8)) {
      return {
        paginate: _0x37fec8
      };
    }
    return {
      paginate: _0x37fec8 === "true"
    };
  }
});
var directives_default = [...Object.keys(globals), ...Object.keys(locals)];
var import_js_yaml = require("js-yaml");
var createPatterns = _0x199f33 => {
  const _0x1e9a24 = new Set();
  for (const _0x23d0fb of _0x199f33) {
    const _0x101e8a = "_?" + _0x23d0fb.replace(/[.*+?^=!:${}()|[\]\\/]/g, "\\$&");
    _0x1e9a24.add(_0x101e8a);
    _0x1e9a24.add("\"" + _0x101e8a + "\"");
    _0x1e9a24.add("'" + _0x101e8a + "'");
  }
  return [..._0x1e9a24.values()];
};
var yamlSpecialChars = "[\"'{|>~&*";
function parse(_0x56ef33) {
  try {
    const _0x229f34 = (0, import_js_yaml.load)(_0x56ef33, {
      schema: import_js_yaml.FAILSAFE_SCHEMA
    });
    if (_0x229f34 === null || typeof _0x229f34 !== "object") {
      return false;
    }
    return _0x229f34;
  } catch {
    return false;
  }
}
function convertLoose(_0x27da86, _0x3f08a1) {
  const _0x4772e4 = "(?:" + createPatterns(_0x3f08a1).join("|") + ")";
  const _0x4bce63 = new RegExp("^(" + _0x4772e4 + "\\s*:)(.+)$");
  let _0x55c7f3 = "";
  for (const _0x4a3dc4 of _0x27da86.split(/\r?\n/)) {
    _0x55c7f3 += _0x4a3dc4.replace(_0x4bce63, (_0x104b7c, _0x43079f, _0x270735) => {
      const _0x13e75f = _0x270735.trim();
      if (_0x13e75f.length === 0 || yamlSpecialChars.includes(_0x13e75f[0])) {
        return _0x104b7c;
      }
      const _0x3c5fd2 = _0x270735.length - _0x270735.trimLeft().length;
      const _0x9373aa = _0x270735.substring(0, _0x3c5fd2);
      return "" + _0x43079f + _0x9373aa + "\"" + _0x13e75f.split("\"").join("\\\"") + "\"";
    }) + "\n";
  }
  return _0x55c7f3.trim();
}
var yaml = (_0x5d94a2, _0xdf41d = false) => parse(_0xdf41d ? convertLoose(_0x5d94a2, [...directives_default, ...(Array.isArray(_0xdf41d) ? _0xdf41d : [])]) : _0x5d94a2);
var yaml_default = yaml;
var import_plugin = __toESM(require_plugin());
var commentMatcher = /<!--+\s*([\s\S]*?)\s*--+>/;
var commentMatcherOpening = /^<!--/;
var commentMatcherClosing = /-->/;
var magicCommentMatchers = [/^prettier-ignore(-(start|end))?$/, /^markdownlint-((disable|enable).*|capture|restore)$/, /^lint (disable|enable|ignore).*$/];
function markAsParsed(_0x9f50bf, _0x22a6cb) {
  _0x9f50bf.meta = _0x9f50bf.meta || {};
  _0x9f50bf.meta.marpitCommentParsed = _0x22a6cb;
}
function _comment(_0x258e68) {
  const _0x86bee0 = (_0x2254d2, _0x49e50e) => {
    const _0x3d9882 = yaml(_0x49e50e, !!_0x258e68.marpit.options.looseYAML);
    _0x2254d2.meta = _0x2254d2.meta || {};
    _0x2254d2.meta.marpitParsedDirectives = _0x3d9882 === false ? {} : _0x3d9882;
    for (const _0x4a1b0d of magicCommentMatchers) {
      if (_0x4a1b0d.test(_0x49e50e.trim())) {
        markAsParsed(_0x2254d2, "well-known-magic-comment");
        break;
      }
    }
  };
  _0x258e68.block.ruler.before("html_block", "marpit_comment", (_0x43182b, _0x5608c4, _0x2a4955, _0x24b100) => {
    let _0x146c12 = _0x43182b.bMarks[_0x5608c4] + _0x43182b.tShift[_0x5608c4];
    if (_0x43182b.src.charCodeAt(_0x146c12) !== 60) {
      return false;
    }
    let _0x2eba98 = _0x43182b.eMarks[_0x5608c4];
    let _0x2f71d7 = _0x43182b.src.slice(_0x146c12, _0x2eba98);
    if (!commentMatcherOpening.test(_0x2f71d7)) {
      return false;
    }
    if (_0x24b100) {
      return true;
    }
    let _0x3817b6 = _0x5608c4 + 1;
    if (!commentMatcherClosing.test(_0x2f71d7)) {
      while (_0x3817b6 < _0x2a4955) {
        if (_0x43182b.sCount[_0x3817b6] < _0x43182b.blkIndent) {
          break;
        }
        _0x146c12 = _0x43182b.bMarks[_0x3817b6] + _0x43182b.tShift[_0x3817b6];
        _0x2eba98 = _0x43182b.eMarks[_0x3817b6];
        _0x2f71d7 = _0x43182b.src.slice(_0x146c12, _0x2eba98);
        _0x3817b6 += 1;
        if (commentMatcherClosing.test(_0x2f71d7)) {
          break;
        }
      }
    }
    _0x43182b.line = _0x3817b6;
    const _0x4cdc78 = _0x43182b.push("marpit_comment", "", 0);
    _0x4cdc78.map = [_0x5608c4, _0x3817b6];
    _0x4cdc78.markup = _0x43182b.getLines(_0x5608c4, _0x3817b6, _0x43182b.blkIndent, true);
    _0x4cdc78.hidden = true;
    const _0x2b530a = commentMatcher.exec(_0x4cdc78.markup);
    _0x4cdc78.content = _0x2b530a ? _0x2b530a[1].trim() : "";
    _0x86bee0(_0x4cdc78, _0x4cdc78.content);
    return true;
  });
  _0x258e68.inline.ruler.before("html_inline", "marpit_inline_comment", (_0x1085e7, _0x4e3254) => {
    const {
      posMax: _0x597abc,
      src: _0x481e05
    } = _0x1085e7;
    if (_0x1085e7.pos + 2 >= _0x597abc || _0x481e05.charCodeAt(_0x1085e7.pos) !== 60 || _0x481e05.charCodeAt(_0x1085e7.pos + 1) !== 33) {
      return false;
    }
    const _0x5625c0 = _0x481e05.slice(_0x1085e7.pos).match(commentMatcher);
    if (!_0x5625c0) {
      return false;
    }
    if (!_0x4e3254) {
      const _0x43dc20 = _0x1085e7.push("marpit_comment", "", 0);
      _0x43dc20.hidden = true;
      _0x43dc20.markup = _0x481e05.slice(_0x1085e7.pos, _0x1085e7.pos + _0x5625c0[0].length);
      _0x43dc20.content = _0x5625c0[1].trim();
      _0x86bee0(_0x43dc20, _0x43dc20.content);
    }
    _0x1085e7.pos += _0x5625c0[0].length;
    return true;
  });
}
var comment = (0, import_plugin.default)(_comment);
var comment_default = comment;
var _0x8eb834 = {
  comment: comment,
  markAsParsed: markAsParsed
};
if (0) {
  module.exports = _0x8eb834;
}