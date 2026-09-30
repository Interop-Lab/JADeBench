var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (_0x161c07, _0xb7127e) => function _0x3eb819() {
  var _0x414fa7 = {};
  return _0x414fa7["exports"] = {}, (_0xb7127e || (0x1 * 0x21f5 + 0x18b9 + 0x206 * -0x1d, _0x161c07[__getOwnPropNames(_0x161c07)[0x1695 + -0x53 * -0x19 + -0x1eb0]])((_0xb7127e = _0x414fa7)["exports"], _0xb7127e), _0xb7127e["exports"]);
};
var __export = (_0x3c61a4, _0x4d6b1a) => {
  for (var _0x15556b in _0x4d6b1a) __defProp(_0x3c61a4, _0x15556b, {
    get: _0x4d6b1a[_0x15556b],
    enumerable: true
  });
};
var __copyProps = (_0x5a482c, _0x55838e, _0x40464b, _0x3ea86e) => {
  if (_0x55838e && typeof _0x55838e === "object" || typeof _0x55838e === "function") {
    for (let _0x32aa98 of __getOwnPropNames(_0x55838e)) if (!__hasOwnProp.call(_0x5a482c, _0x32aa98) && _0x32aa98 !== _0x40464b) __defProp(_0x5a482c, _0x32aa98, {
      get: () => _0x55838e[_0x32aa98],
      enumerable: !(_0x3ea86e = __getOwnPropDesc(_0x55838e, _0x32aa98)) || _0x3ea86e.enumerable
    });
  }
  return _0x5a482c;
};
var __toESM = (_0x50b6ea, _0x29feaa, _0x5992b0) => (_0x5992b0 = _0x50b6ea != null ? __create(__getProtoOf(_0x50b6ea)) : {}, __copyProps(_0x29feaa || !_0x50b6ea || !_0x50b6ea["__esModule"] ? __defProp(_0x5992b0, "default", {
  value: _0x50b6ea,
  enumerable: true
}) : _0x5992b0, _0x50b6ea));
var __toCommonJS = _0x1ae4f5 => __copyProps(__defProp({}, "__esModule", {
  value: true
}), _0x1ae4f5);

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

var require_plugin = __commonJS({
  "../work/marp-team__marpit/src/plugin.js"(_0x5adc89, _0x2beb8a) {
    var _0x417b2b = {
      "name": "marpit_plugin",
      "type": "function",
      "default": _0x137abd
    };
    function _0x137abd(_0x361bd2) {
      var _0x4f9629 = {
        "error": _0x417b2b["name"]
      };
      return function(_0x1274de, ..._0x24badf) {
        if (_0x1274de["marpit"]) return _0x361bd2.call(this, _0x1274de, ..._0x24badf);
        throw new Error(_0x4f9629["error"]);
      };
    }
    var _0x3a29df = {};
    _0x3a29df["writable"] = true;
    Object.defineProperty(_0x137abd, _0x417b2b["name"], _0x3a29df);
    Object.defineProperty(_0x137abd, "default", {
      value: _0x137abd
    });
    Object.defineProperty(_0x137abd, "__esModule", {
      value: _0x137abd
    });
    _0x2beb8a["exports"] = _0x137abd;
  }
});

var import_plugin = __toESM(require_plugin());

function _headingDivider(_0x4adf53) {
  var _0x595b49 = {
    "gECaO": "headingDivider",
    "ofYEb": function(_0x467b65, _0x175d9c) {
      return _0x467b65 === _0x175d9c;
    },
    "OqwaP": function(_0x4449f7, _0x439d8d) {
      return _0x4449f7 >= _0x439d8d;
    },
    "fzuQU": function(_0x31988f, _0xd5c0bd) {
      return _0x31988f <= _0xd5c0bd;
    },
    "RiAyu": function(_0x3c1c9f, _0x87e14d) {
      return _0x3c1c9f(_0x87e14d);
    },
    "nmNdd": function(_0x45a809, _0x2a70c0, _0x2b1057, _0x19b280) {
      return _0x45a809(_0x2a70c0, _0x2b1057, _0x19b280);
    },
    "kSNSo": "marpit:markdown:render",
    "xGQOu": "headingDivider",
    "pVsvz": function(_0xc6fd5d, _0x5d8652) {
      return _0xc6fd5d + _0x5d8652;
    },
    "GZzoF": "h",
    "pDlwc": "heading",
    "alhro": "headingDivider",
    "HVjRp": function(_0x4368f5, _0x3db11e) {
      return _0x4368f5 === _0x3db11e;
    },
    "eAPYo": function(_0x383f37, _0x2085f5) {
      return _0x383f37 >= _0x2085f5;
    },
    "xGxAc": function(_0x17485a, _0x42bc15, _0x2d0da5, _0x534b1a) {
      return _0x17485a(_0x42bc15, _0x2d0da5, _0x534b1a);
    },
    "voVrU": function(_0x5dd431, _0x186863) {
      return _0x5dd431(_0x186863);
    },
    "imeoq": function(_0x3133c2, _0x516939) {
      return _0x3133c2 === _0x516939;
    },
    "xMIHz": "headingDivider",
    "YbYkL": "heading",
    "gQglK": function(_0x17297b, _0x1f48d0) {
      return _0x17297b === _0x1f48d0;
    },
    "oEPjj": function(_0x3eb21a, _0xfa5b22) {
      return _0x3eb21a >= _0xfa5b22;
    },
    "HquCk": function(_0x134c0b, _0x4592c9) {
      return _0x134c0b <= _0x4592c9;
    },
    "GgYKr": function(_0x1b2b47, _0x538abb, _0x5f4696, _0xf571b5) {
      return _0x1b2b47(_0x538abb, _0x5f4696, _0xf571b5);
    },
    "ckxiI": function(_0xa6a33e, _0x2f2bb1) {
      return _0xa6a33e !== _0x2f2bb1;
    },
    "oFDnQ": "headingDivider",
    "RhsNK": "heading",
    "iHHan": function(_0x3c87f2, _0x2fc7e1) {
      return _0x3c87f2(_0x2fc7e1);
    },
    "veFmi": "headingDivider"
  };
  const {
    marpit: _0x388ed8
  } = _0x4adf53;
  _0x4adf53["marpit"]["markdown"]["use"](_0x595b49["kSNSo"], _0x595b49["xGQOu"], _0xe74496 => {
    var _0x65d2a6 = {
      "owcEy": function(_0x5afa60, _0x3b90b9) {
        return _0x595b49["ofYEb"](_0x5afa60, _0x3b90b9);
      },
      "KlBkM": _0x595b49["kSNSo"],
      "tIwJm": _0x595b49["xGQOu"],
      "iPEfV": _0x595b49["pDlwc"],
      "ljkmK": _0x595b49["YbYkL"],
      "MyUKU": function(_0x2c5c46, _0xf1c10e) {
        return _0x595b49["ofYEb"](_0x2c5c46, _0xf1c10e);
      },
      "kvLtH": function(_0x2b690a, _0x9ac1cf) {
        return _0x595b49["OqwaP"](_0x2b690a, _0x9ac1cf);
      },
      "bWWpy": function(_0x2dcc68, _0x4f4794) {
        return _0x595b49["fzuQU"](_0x2dcc68, _0x4f4794);
      },
      "bcHkQ": function(_0x24ce07, _0x333d01) {
        return _0x595b49["OqwaP"](_0x24ce07, _0x333d01);
      },
      "fQXPF": function(_0x575803, _0x3fcaef, _0xcfca29, _0x579080) {
        return _0x595b49["nmNdd"](_0x575803, _0x3fcaef, _0xcfca29, _0x579080);
      },
      "NFcej": function(_0x2d9aa7, _0x3fc98b) {
        return _0x595b49["fzuQU"](_0x2d9aa7, _0x3fc98b);
      }
    };
    let _0x3d99f3 = _0x388ed8["options"]["headingDivider"];
    if (_0x388ed8["options"]["headingDivider"] && Object.prototype.hasOwnProperty.call(_0x388ed8["options"], "headingDivider")) {
      _0x3d99f3 = _0x388ed8["options"]["headingDivider"];
    }
    if (_0xe74496["meta"] || _0x595b49["ofYEb"](_0x3d99f3, false)) return;
    if (Number.isInteger(_0x3d99f3) && _0x595b49["OqwaP"](_0x3d99f3, 1) && _0x595b49["fzuQU"](_0x3d99f3, 6)) {
      _0x3d99f3 = [...Array(_0x3d99f3).keys()].map(_0x13bb08 => _0x13bb08 + 1);
    }
    if (!Array.isArray(_0x3d99f3)) return;
    const _0x14b508 = _0x3d99f3.map(_0x5237bb => "h" + _0x5237bb);
    const _0x568409 = _0x2da7d9 => _0x2da7d9["type"] === "heading" && _0x14b508.includes(_0x2da7d9["tag"]);
    const _0x5ffb5e = [];
    for (const _0x5d0ad5 of _0x595b49["nmNdd"](split, _0xe74496["tokens"], _0x568409, true)) {
      const [_0x197a06] = _0x5d0ad5;
      if (_0x197a06 && _0x595b49["ofYEb"](_0x568409, _0x197a06) && _0x5ffb5e.every(_0xa4c46d => !_0xa4c46d["hidden"])) {
        const _0x451480 = new _0xe74496["Token"]("hr", "", 0);
        _0x451480["hidden"] = true;
        _0x451480["markup"] = _0x197a06["markup"];
        _0x5ffb5e.push(_0x451480);
      }
      _0x5ffb5e.push(..._0x5d0ad5);
    }
    _0xe74496["tokens"] = _0x5ffb5e;
  });
}

var headingDivider = import_plugin["default"](_headingDivider);
var heading_divider_default = headingDivider;
var _0x34141d = {};
_0x34141d["headingDivider"] = headingDivider;
module["exports"] = _0x34141d;
