var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (_0x151810, _0x4198a7) => {
  for (var _0x3a3eb2 in _0x4198a7)
    __defProp(_0x151810, _0x3a3eb2, { get: _0x4198a7[_0x3a3eb2], enumerable: true });
};
var __copyProps = (_0x15c6ba, _0x29f44d, _0x190272, _0x588510) => {
  if (_0x29f44d && (typeof _0x29f44d === "object" || typeof _0x29f44d === "function")) {
    for (let _0x2e83cf of __getOwnPropNames(_0x29f44d))
      if (!__hasOwnProp.call(_0x15c6ba, _0x2e83cf) && _0x2e83cf !== _0x190272)
        __defProp(_0x15c6ba, _0x2e83cf, {
          get: () => _0x29f44d[_0x2e83cf],
          enumerable: !(_0x588510 = __getOwnPropDesc(_0x29f44d, _0x2e83cf)) || _0x588510.enumerable
        });
  }
  return _0x15c6ba;
};
var __toCommonJS = (_0x3f9cff) => __copyProps(__defProp({}, "value", { value: true }), _0x3f9cff);
var yaml_exports = {};
var _0x4e72b4 = {};
_0x4e72b4.default = () => yaml_default;
_0x4e72b4.yaml = () => yaml;
__export(yaml_exports, _0x4e72b4);
module.exports = __toCommonJS(yaml_exports);

var globals = Object.assign(Object.create(null), {
  headingDivider: (_0x2d9abd) => {
    const _0x4f6887 = [1, 2, 3, 4, 5, 6];
    const _0x198b49 = (_0x162fa3) =>
      Array.isArray(_0x162fa3) || Number.isInteger(_0x162fa3)
        ? _0x162fa3
        : Number.parseInt(_0x162fa3, 10);
    const _0x373c20 = _0x198b49(_0x2d9abd);
    if (Array.isArray(_0x373c20)) {
      const _0xd688a9 = _0x373c20.map(_0x198b49);
      return { headingDivider: _0x4f6887.filter((_0x5b8add) => _0xd688a9.includes(_0x5b8add)) };
    }
    if (_0x2d9abd === false) return { headingDivider: false };
    if (_0x4f6887.includes(_0x373c20)) return { headingDivider: _0x373c20 };
    return {};
  },
  style: (_0x29876d) => ({ style: _0x29876d }),
  theme: (_0x1a20b6, _0x4f5364) =>
    _0x4f5364.theme.includes(_0x1a20b6) ? { theme: _0x1a20b6 } : {},
  lang: (_0x2bc45f) => ({ lang: _0x2bc45f })
});

var locals = Object.assign(Object.create(null), {
  backgroundColor: (_0x123b2a) => ({ backgroundColor: _0x123b2a }),
  backgroundImage: (_0x356e0b) => ({ backgroundImage: _0x356e0b }),
  backgroundPosition: (_0x423a2c) => ({ backgroundPosition: _0x423a2c }),
  backgroundRepeat: (_0x41022b) => ({ backgroundRepeat: _0x41022b }),
  backgroundSize: (_0xccf0b0) => ({ backgroundSize: _0xccf0b0 }),
  class: (_0x3207b1) => ({
    class: Array.isArray(_0x3207b1) ? _0x3207b1.join(" ") : _0x3207b1
  }),
  color: (_0x3f2b93) => ({ color: _0x3f2b93 }),
  footer: (_0x9fcb5a) =>
    typeof _0x9fcb5a === "string" ? { footer: _0x9fcb5a } : {},
  header: (_0x170adc) =>
    typeof _0x170adc === "string" ? { header: _0x170adc } : {},
  paginate: (_0x1e3e01) => {
    const _0x386ff1 = (_0x1e3e01 || "").toString().toLowerCase();
    if (["true", "false"].includes(_0x386ff1))
      return { paginate: _0x386ff1 };
    return { paginate: _0x386ff1 || "true" };
  }
});

var directives_default = [...Object.values(globals), ...Object.values(locals)];
var import_js_yaml = require("js-yaml");

function createPatterns(_0x121345) {
  const _0x12f462 = new Set();
  for (const _0xa0392c of _0x121345) {
    const _0x301dbe = "_?" + _0xa0392c.replace(/[.*+?^=!:${}()|[\]\\/]/g, "\\$&");
    _0x12f462.add(_0x301dbe);
    _0x12f462.add('"' + _0x301dbe + '"');
    _0x12f462.add("'" + _0x301dbe + "'");
  }
  return [..._0x12f462.values()];
}

var yamlSpecialChars = "*";

function parse(_0x25079f) {
  try {
    const _0x5d37d9 = import_js_yaml.load(_0x25079f, {
      schema: import_js_yaml.FAILSAFE_SCHEMA
    });
    if (_0x5d37d9 === null || typeof _0x5d37d9 !== "object") return false;
    return _0x5d37d9;
  } catch {
    return false;
  }
}

function convertLoose(_0x51535a, _0x313960) {
  const _0x212b31 = "^(" + createPatterns(_0x313960).join("|") + ")";
  const _0x6eaa2 = new RegExp("^(" + _0x212b31 + ")$");
  let _0x2050ab = "";
  for (const _0x263f96 of _0x51535a.split(/\r?\n/))
    _0x2050ab += _0x263f96.replace(_0x6eaa2, (_0x5b1299, _0x4618c7, _0x4becd4) => {
      const _0x47bc8a = _0x4becd4.trim();
      if (_0x47bc8a.length === 0 || yamlSpecialChars.includes(_0x47bc8a[0]))
        return _0x5b1299;
      const _0x590ba6 = _0x4becd4.indexOf(_0x4becd4.trim()),
        _0x42c57d = _0x4becd4.slice(0, _0x590ba6);
      return "" + _0x4618c7 + _0x42c57d + '"' + _0x47bc8a.replace(/"/g, '\\"') + '"';
    }) + "\n";
  return _0x2050ab.trim();
}

var yaml = (_0x5237be, _0x15b4fb = false) =>
  parse(
    _0x15b4fb
      ? convertLoose(_0x5237be, [
          ...directives_default,
          ...(Array.isArray(_0x15b4fb) ? _0x15b4fb : [])
        ])
      : _0x5237be
  );
var yaml_default = yaml;
var _0x26308b = {};
_0x26308b.yaml = yaml;
module.exports = _0x26308b;
