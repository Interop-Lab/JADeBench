var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (_0x5b74b5, _0x5bc541) => function _0x355255() {
  if (!_0x5bc541) {
    (0, _0x5b74b5[__getOwnPropNames(_0x5b74b5)[0]])((_0x5bc541 = {
      exports: {}
    }).exports, _0x5bc541);
  }
  return _0x5bc541.exports;
};
var __export = (_0x230eb5, _0x215709) => {
  for (var _0x67c133 in _0x215709) {
    __defProp(_0x230eb5, _0x67c133, {
      get: _0x215709[_0x67c133],
      enumerable: true
    });
  }
};
var __copyProps = (_0x4eb6f0, _0x542977, _0x518d6f, _0x17d3c3) => {
  if (_0x542977 && typeof _0x542977 === "object" || typeof _0x542977 === "function") {
    for (let _0x53e1e3 of __getOwnPropNames(_0x542977)) {
      if (!__hasOwnProp.call(_0x4eb6f0, _0x53e1e3) && _0x53e1e3 !== _0x518d6f) {
        __defProp(_0x4eb6f0, _0x53e1e3, {
          get: () => _0x542977[_0x53e1e3],
          enumerable: !(_0x17d3c3 = __getOwnPropDesc(_0x542977, _0x53e1e3)) || _0x17d3c3.enumerable
        });
      }
    }
  }
  return _0x4eb6f0;
};
var __toESM = (_0x212d27, _0x2d355b, _0x490051) => {
  _0x490051 = _0x212d27 != null ? __create(__getProtoOf(_0x212d27)) : {};
  return __copyProps(_0x2d355b || !_0x212d27 || !_0x212d27.__esModule ? __defProp(_0x490051, "default", {
    value: _0x212d27,
    enumerable: true
  }) : _0x490051, _0x212d27);
};
const _0x81b523 = {
  value: true
};
var __toCommonJS = _0x5aa846 => __copyProps(__defProp({}, "__esModule", _0x81b523), _0x5aa846);
var require_plugin = __commonJS({
  "../work/marp-team__marpit/src/plugin.js"(_0x329251, _0x49d9a5) {
    function _0xf9fce7(_0x31ad6e) {
      return function (_0x594870, ..._0x398ba8) {
        if (_0x594870.marpit) {
          return _0x31ad6e.call(this, _0x594870, ..._0x398ba8);
        }
        throw new Error("Marpit plugin has detected incompatible markdown-it instance.");
      };
    }
    Object.defineProperty(_0xf9fce7, "__esModule", {
      value: true
    });
    Object.defineProperty(_0xf9fce7, "default", {
      value: _0xf9fce7
    });
    Object.defineProperty(_0xf9fce7, "marpitPlugin", {
      value: _0xf9fce7
    });
    _0x49d9a5.exports = _0xf9fce7;
  }
});
var parse_exports = {};
const _0x1161e0 = {
  default: () => parse_default,
  parse: () => parse2
};
__export(parse_exports, _0x1161e0);
module.exports = __toCommonJS(parse_exports);
var globals = Object.assign(Object.create(null), {
  headingDivider: _0x4a256 => {
    const _0x14595b = [1, 2, 3, 4, 5, 6];
    const _0x20849f = _0x39a7c6 => Array.isArray(_0x39a7c6) || Number.isNaN(_0x39a7c6) ? _0x39a7c6 : Number.parseInt(_0x39a7c6, 10);
    const _0x3e4b5d = _0x20849f(_0x4a256);
    if (Array.isArray(_0x3e4b5d)) {
      const _0x435a96 = _0x3e4b5d.map(_0x20849f);
      return {
        headingDivider: _0x14595b.filter(_0xd59502 => _0x435a96.includes(_0xd59502))
      };
    }
    if (_0x4a256 === "false") {
      return {
        headingDivider: false
      };
    }
    if (_0x14595b.includes(_0x3e4b5d)) {
      return {
        headingDivider: _0x3e4b5d
      };
    }
    return {};
  },
  style: _0xab7295 => ({
    style: _0xab7295
  }),
  theme: (_0x417e46, _0x2b7e8d) => _0x2b7e8d.themeSet.has(_0x417e46) ? {
    theme: _0x417e46
  } : {},
  lang: _0x51685d => ({
    lang: _0x51685d
  })
});
var locals = Object.assign(Object.create(null), {
  backgroundColor: _0x5ea01f => ({
    backgroundColor: _0x5ea01f
  }),
  backgroundImage: _0x186e69 => ({
    backgroundImage: _0x186e69
  }),
  backgroundPosition: _0x465d70 => ({
    backgroundPosition: _0x465d70
  }),
  backgroundRepeat: _0xf06337 => ({
    backgroundRepeat: _0xf06337
  }),
  backgroundSize: _0x146448 => ({
    backgroundSize: _0x146448
  }),
  class: _0x135ab1 => ({
    class: Array.isArray(_0x135ab1) ? _0x135ab1.join(" ") : _0x135ab1
  }),
  color: _0x3d1065 => ({
    color: _0x3d1065
  }),
  footer: _0x102b7b => typeof _0x102b7b === "string" ? {
    footer: _0x102b7b
  } : {},
  header: _0x1f56e3 => typeof _0x1f56e3 === "string" ? {
    header: _0x1f56e3
  } : {},
  paginate: _0xf09229 => {
    const _0xcd4c9f = (_0xf09229 || "").toLowerCase();
    if (["hold", "skip"].includes(_0xcd4c9f)) {
      return {
        paginate: _0xcd4c9f
      };
    }
    return {
      paginate: _0xcd4c9f === "true"
    };
  }
});
var directives_default = [...Object.keys(globals), ...Object.keys(locals)];
var import_js_yaml = require("js-yaml");
var createPatterns = _0x436b47 => {
  const _0x362f5b = new Set();
  for (const _0x207338 of _0x436b47) {
    const _0x38915e = "_?" + _0x207338.replace(/[.*+?^=!:${}()|[\]\\/]/g, "\\$&");
    _0x362f5b.add(_0x38915e);
    _0x362f5b.add("\"" + _0x38915e + "\"");
    _0x362f5b.add("'" + _0x38915e + "'");
  }
  return [..._0x362f5b.values()];
};
var yamlSpecialChars = "[\"'{|>~&*";
function parse(_0xfc7b94) {
  try {
    const _0x5de67f = (0, import_js_yaml.load)(_0xfc7b94, {
      schema: import_js_yaml.FAILSAFE_SCHEMA
    });
    if (_0x5de67f === null || typeof _0x5de67f !== "object") {
      return false;
    }
    return _0x5de67f;
  } catch {
    return false;
  }
}
function convertLoose(_0x4265e2, _0x51a656) {
  const _0x267aa4 = "(?:" + createPatterns(_0x51a656).join("|") + ")";
  const _0x3b96a2 = new RegExp("^(" + _0x267aa4 + "\\s*:)(.+)$");
  let _0x172a61 = "";
  for (const _0x318e2f of _0x4265e2.split(/\r?\n/)) {
    _0x172a61 += _0x318e2f.replace(_0x3b96a2, (_0x440652, _0x1b9ea4, _0x21cbb8) => {
      const _0x439f27 = _0x21cbb8.trim();
      if (_0x439f27.length === 0 || yamlSpecialChars.includes(_0x439f27[0])) {
        return _0x440652;
      }
      const _0x29e8ab = _0x21cbb8.length - _0x21cbb8.trimLeft().length;
      const _0x23be64 = _0x21cbb8.substring(0, _0x29e8ab);
      return "" + _0x1b9ea4 + _0x23be64 + "\"" + _0x439f27.split("\"").join("\\\"") + "\"";
    }) + "\n";
  }
  return _0x172a61.trim();
}
var yaml = (_0x201cdd, _0xf02dc4 = false) => parse(_0xf02dc4 ? convertLoose(_0x201cdd, [...directives_default, ...(Array.isArray(_0xf02dc4) ? _0xf02dc4 : [])]) : _0x201cdd);
var yaml_default = yaml;
var import_plugin = __toESM(require_plugin());
var commentMatcher = /<!--+\s*([\s\S]*?)\s*--+>/;
var commentMatcherOpening = /^<!--/;
var commentMatcherClosing = /-->/;
var magicCommentMatchers = [/^prettier-ignore(-(start|end))?$/, /^markdownlint-((disable|enable).*|capture|restore)$/, /^lint (disable|enable|ignore).*$/];
function markAsParsed(_0x18c646, _0x255257) {
  _0x18c646.meta = _0x18c646.meta || {};
  _0x18c646.meta.marpitCommentParsed = _0x255257;
}
function _comment(_0x3125e0) {
  const _0x5de620 = (_0x2756a9, _0x561eac) => {
    const _0x99536b = yaml(_0x561eac, !!_0x3125e0.marpit.options.looseYAML);
    _0x2756a9.meta = _0x2756a9.meta || {};
    _0x2756a9.meta.marpitParsedDirectives = _0x99536b === false ? {} : _0x99536b;
    for (const _0x41965c of magicCommentMatchers) {
      if (_0x41965c.test(_0x561eac.trim())) {
        markAsParsed(_0x2756a9, "well-known-magic-comment");
        break;
      }
    }
  };
  _0x3125e0.block.ruler.before("html_block", "marpit_comment", (_0x1226e5, _0x34440d, _0x3fc075, _0x5d23c2) => {
    let _0x2d7fe9 = _0x1226e5.bMarks[_0x34440d] + _0x1226e5.tShift[_0x34440d];
    if (_0x1226e5.src.charCodeAt(_0x2d7fe9) !== 60) {
      return false;
    }
    let _0x23fbbc = _0x1226e5.eMarks[_0x34440d];
    let _0x153966 = _0x1226e5.src.slice(_0x2d7fe9, _0x23fbbc);
    if (!commentMatcherOpening.test(_0x153966)) {
      return false;
    }
    if (_0x5d23c2) {
      return true;
    }
    let _0x5bda8d = _0x34440d + 1;
    if (!commentMatcherClosing.test(_0x153966)) {
      while (_0x5bda8d < _0x3fc075) {
        if (_0x1226e5.sCount[_0x5bda8d] < _0x1226e5.blkIndent) {
          break;
        }
        _0x2d7fe9 = _0x1226e5.bMarks[_0x5bda8d] + _0x1226e5.tShift[_0x5bda8d];
        _0x23fbbc = _0x1226e5.eMarks[_0x5bda8d];
        _0x153966 = _0x1226e5.src.slice(_0x2d7fe9, _0x23fbbc);
        _0x5bda8d += 1;
        if (commentMatcherClosing.test(_0x153966)) {
          break;
        }
      }
    }
    _0x1226e5.line = _0x5bda8d;
    const _0x185e34 = _0x1226e5.push("marpit_comment", "", 0);
    _0x185e34.map = [_0x34440d, _0x5bda8d];
    _0x185e34.markup = _0x1226e5.getLines(_0x34440d, _0x5bda8d, _0x1226e5.blkIndent, true);
    _0x185e34.hidden = true;
    const _0x2bafe2 = commentMatcher.exec(_0x185e34.markup);
    _0x185e34.content = _0x2bafe2 ? _0x2bafe2[1].trim() : "";
    _0x5de620(_0x185e34, _0x185e34.content);
    return true;
  });
  _0x3125e0.inline.ruler.before("html_inline", "marpit_inline_comment", (_0x2d241f, _0x5c078d) => {
    const {
      posMax: _0x21e756,
      src: _0x35fe2c
    } = _0x2d241f;
    if (_0x2d241f.pos + 2 >= _0x21e756 || _0x35fe2c.charCodeAt(_0x2d241f.pos) !== 60 || _0x35fe2c.charCodeAt(_0x2d241f.pos + 1) !== 33) {
      return false;
    }
    const _0x6c6ff0 = _0x35fe2c.slice(_0x2d241f.pos).match(commentMatcher);
    if (!_0x6c6ff0) {
      return false;
    }
    if (!_0x5c078d) {
      const _0x402288 = _0x2d241f.push("marpit_comment", "", 0);
      _0x402288.hidden = true;
      _0x402288.markup = _0x35fe2c.slice(_0x2d241f.pos, _0x2d241f.pos + _0x6c6ff0[0].length);
      _0x402288.content = _0x6c6ff0[1].trim();
      _0x5de620(_0x402288, _0x402288.content);
    }
    _0x2d241f.pos += _0x6c6ff0[0].length;
    return true;
  });
}
var comment = (0, import_plugin.default)(_comment);
var comment_default = comment;
var import_markdown_it_front_matter = __toESM(require("markdown-it-front-matter"));
var import_plugin2 = __toESM(require_plugin());
var isDirectiveComment = _0x42829e => _0x42829e.type === "marpit_comment" && _0x42829e.meta.marpitParsedDirectives;
function _parse(_0x49b43b, _0x4f20f0 = {}) {
  const {
    marpit: _0x3526fb
  } = _0x49b43b;
  const _0x15c65d = (_0xe251b7, _0x8da6ff) => {
    let _0x3efdd8 = {};
    for (const _0x120968 of Object.keys(_0xe251b7)) {
      if (_0x8da6ff[_0x120968]) {
        _0x3efdd8 = {
          ..._0x3efdd8,
          ..._0x8da6ff[_0x120968](_0xe251b7[_0x120968], _0x3526fb)
        };
      } else {
        _0x3efdd8[_0x120968] = _0xe251b7[_0x120968];
      }
    }
    return _0x3efdd8;
  };
  const _0x2d3964 = _0x4f20f0.frontMatter === undefined ? true : !!_0x4f20f0.frontMatter;
  let _0x217204 = {};
  if (_0x2d3964) {
    _0x49b43b.core.ruler.before("block", "marpit_directives_front_matter", _0x4a4486 => {
      _0x217204 = {};
      if (!_0x4a4486.inlineMode) {
        _0x3526fb.lastGlobalDirectives = {};
      }
    });
    _0x49b43b.use(import_markdown_it_front_matter.default, _0x143b25 => {
      _0x217204.text = _0x143b25;
      const _0x421fc = yaml(_0x143b25, _0x3526fb.options.looseYAML ? [...Object.keys(_0x3526fb.customDirectives.global), ...Object.keys(_0x3526fb.customDirectives.local)] : false);
      if (_0x421fc !== false) {
        _0x217204.yaml = _0x421fc;
      }
    });
  }
  _0x49b43b.core.ruler.after("inline", "marpit_directives_global_parse", _0x2ac6c6 => {
    if (_0x2ac6c6.inlineMode) {
      return;
    }
    let _0x3d0054 = {};
    const _0x2e0360 = _0x570fe8 => {
      let _0x247f9d = false;
      for (const _0x13a781 of Object.keys(_0x570fe8)) {
        if (globals[_0x13a781]) {
          _0x247f9d = true;
          _0x3d0054 = {
            ..._0x3d0054,
            ...globals[_0x13a781](_0x570fe8[_0x13a781], _0x3526fb)
          };
        } else if (_0x3526fb.customDirectives.global[_0x13a781]) {
          _0x247f9d = true;
          _0x3d0054 = {
            ..._0x3d0054,
            ..._0x15c65d(_0x3526fb.customDirectives.global[_0x13a781](_0x570fe8[_0x13a781], _0x3526fb), globals)
          };
        }
      }
      return _0x247f9d;
    };
    if (_0x217204.yaml) {
      _0x2e0360(_0x217204.yaml);
    }
    for (const _0x473a68 of _0x2ac6c6.tokens) {
      if (isDirectiveComment(_0x473a68) && _0x2e0360(_0x473a68.meta.marpitParsedDirectives)) {
        markAsParsed(_0x473a68, "directive");
      } else if (_0x473a68.type === "inline") {
        for (const _0x26d6b9 of _0x473a68.children) {
          if (isDirectiveComment(_0x26d6b9) && _0x2e0360(_0x26d6b9.meta.marpitParsedDirectives)) {
            markAsParsed(_0x26d6b9, "directive");
          }
        }
      }
    }
    const _0xa1ab8f = {
      ..._0x3d0054
    };
    _0x3526fb.lastGlobalDirectives = _0xa1ab8f;
  });
  _0x49b43b.core.ruler.after("marpit_slide", "marpit_directives_parse", _0x57c786 => {
    if (_0x57c786.inlineMode) {
      return;
    }
    const _0x108a3c = [];
    const _0x4bac7b = {
      slide: undefined,
      local: {},
      spot: {}
    };
    const _0x2ae88a = _0x4bac7b;
    const _0x45e7eb = _0x52e286 => {
      let _0x540a07 = false;
      for (const _0x5cbb87 of Object.keys(_0x52e286)) {
        if (locals[_0x5cbb87]) {
          _0x540a07 = true;
          _0x2ae88a.local = {
            ..._0x2ae88a.local,
            ...locals[_0x5cbb87](_0x52e286[_0x5cbb87], _0x3526fb)
          };
        } else if (_0x3526fb.customDirectives.local[_0x5cbb87]) {
          _0x540a07 = true;
          _0x2ae88a.local = {
            ..._0x2ae88a.local,
            ..._0x15c65d(_0x3526fb.customDirectives.local[_0x5cbb87](_0x52e286[_0x5cbb87], _0x3526fb), locals)
          };
        }
        if (_0x5cbb87.startsWith("_")) {
          const _0x1c216c = _0x5cbb87.slice(1);
          if (locals[_0x1c216c]) {
            _0x540a07 = true;
            _0x2ae88a.spot = {
              ..._0x2ae88a.spot,
              ...locals[_0x1c216c](_0x52e286[_0x5cbb87], _0x3526fb)
            };
          } else if (_0x3526fb.customDirectives.local[_0x1c216c]) {
            _0x540a07 = true;
            _0x2ae88a.spot = {
              ..._0x2ae88a.spot,
              ..._0x15c65d(_0x3526fb.customDirectives.local[_0x1c216c](_0x52e286[_0x5cbb87], _0x3526fb), locals)
            };
          }
        }
      }
      return _0x540a07;
    };
    if (_0x217204.yaml) {
      _0x45e7eb(_0x217204.yaml);
    }
    for (const _0x5e8a06 of _0x57c786.tokens) {
      if (_0x5e8a06.meta && _0x5e8a06.meta.marpitSlideElement === 1) {
        _0x5e8a06.meta.marpitDirectives = {};
        _0x108a3c.push(_0x5e8a06);
        _0x2ae88a.slide = _0x5e8a06;
      } else if (_0x5e8a06.meta && _0x5e8a06.meta.marpitSlideElement === -1) {
        _0x2ae88a.slide.meta.marpitDirectives = {
          ..._0x2ae88a.slide.meta.marpitDirectives,
          ..._0x2ae88a.local,
          ..._0x2ae88a.spot
        };
        _0x2ae88a.spot = {};
      } else if (isDirectiveComment(_0x5e8a06) && _0x45e7eb(_0x5e8a06.meta.marpitParsedDirectives)) {
        markAsParsed(_0x5e8a06, "directive");
      } else if (_0x5e8a06.type === "inline") {
        for (const _0x36c53f of _0x5e8a06.children) {
          if (isDirectiveComment(_0x36c53f) && _0x45e7eb(_0x36c53f.meta.marpitParsedDirectives)) {
            markAsParsed(_0x36c53f, "directive");
          }
        }
      }
    }
    for (const _0x2322ae of _0x108a3c) {
      _0x2322ae.meta.marpitDirectives = {
        ..._0x2322ae.meta.marpitDirectives,
        ..._0x3526fb.lastGlobalDirectives
      };
    }
  });
}
var parse2 = (0, import_plugin2.default)(_parse);
var parse_default = parse2;
const _0x4133a0 = {
  parse: parse
};
if (0) {
  module.exports = _0x4133a0;
}