import _0x5a5339 from "node:path";
import _0x5bfda8 from "fs-extra";
import _0x20457c from "lodash/snakeCase.js";
import _0x2fac4a from "lodash/kebabCase.js";
import _0x5f221c from "lodash/startCase.js";
import _0x1f8a61 from "lodash/trim.js";
import _0x242ff4 from "js-yaml";
var META_REGEX = /^\uFEFF?\/\*([\s\S]*?)\*\//i;
var META_REGEX_YAML = /^\uFEFF?---([\s\S]*?)---/i;
function cleanString(_0x267539, _0x54a048 = false) {
  _0x267539 = _0x267539.replaceAll("/", " ").trim();
  if (_0x54a048) {
    return _0x20457c(_0x267539);
  }
  return _0x1f8a61(_0x2fac4a(_0x267539), "-");
}
function cleanObjectStrings(_0x23775b) {
  const _0x47f1b6 = {};
  for (const _0x1564c6 in _0x23775b) {
    if (Object.hasOwn(_0x23775b, _0x1564c6)) {
      _0x47f1b6[cleanString(_0x1564c6, true)] = ("" + _0x23775b[_0x1564c6]).trim();
    }
  }
  return _0x47f1b6;
}
function slugToTitle(_0x2fb406) {
  _0x2fb406 = _0x2fb406.replaceAll(".md", "").trim();
  return _0x5f221c(_0x5a5339.basename(_0x2fb406).replaceAll(/[-_]/g, " "));
}
function stripMeta(_0x3168ab) {
  if (META_REGEX.test(_0x3168ab)) {
    return _0x3168ab.replace(META_REGEX, "").trim();
  }
  if (META_REGEX_YAML.test(_0x3168ab)) {
    return _0x3168ab.replace(META_REGEX_YAML, "").trim();
  }
  return _0x3168ab.trim();
}
function processMeta(_0x2c2adb) {
  if (META_REGEX.test(_0x2c2adb)) {
    const _0x2bbbc3 = {};
    const _0xe1e9ce = _0x2c2adb.match(META_REGEX);
    const _0x5d3348 = _0xe1e9ce?.[1]?.trim() ?? "";
    if (_0x5d3348) {
      const _0x205314 = _0x5d3348.split("\n");
      for (const _0x35b07b of _0x205314) {
        const _0x25cbc = _0x35b07b.indexOf(": ");
        if (_0x25cbc <= 0) {
          continue;
        }
        const _0x3517e2 = _0x35b07b.substring(0, _0x25cbc).trim();
        const _0x290d61 = _0x35b07b.substring(_0x25cbc + 2).trim();
        if (_0x3517e2 && _0x290d61) {
          _0x2bbbc3[cleanString(_0x3517e2, true)] = _0x290d61;
        }
      }
    }
    return _0x2bbbc3;
  }
  if (META_REGEX_YAML.test(_0x2c2adb)) {
    const _0x28601b = _0x2c2adb.match(META_REGEX_YAML);
    const _0xaf252e = _0x28601b?.[1]?.trim() ?? "";
    const _0x3c42a6 = _0x242ff4.load(_0xaf252e);
    return cleanObjectStrings(_0x3c42a6);
  }
  return {};
}
function processVars(_0x4984e5, _0x4f3f44) {
  if (_0x4f3f44.variables && Array.isArray(_0x4f3f44.variables)) {
    _0x4f3f44.variables.forEach(_0x5ef3b9 => {
      _0x4984e5 = _0x4984e5.replaceAll(new RegExp("%" + _0x5ef3b9.name + "%", "g"), _0x5ef3b9.content);
    });
  }
  if (_0x4f3f44.base_url !== undefined) {
    _0x4984e5 = _0x4984e5.replaceAll("%base_url%", _0x4f3f44.base_url);
  }
  if (_0x4f3f44.image_url !== undefined) {
    _0x4984e5 = _0x4984e5.replaceAll("%image_url%", _0x4f3f44.image_url);
  }
  return _0x4984e5;
}
async function extractDocument(_0x35e3fe, _0x49b1d6, _0x56fe62) {
  try {
    const _0x385129 = await _0x5bfda8.readFile(_0x49b1d6, "utf8");
    const _0x524c90 = processMeta(_0x385129);
    const _0x563baf = _0x49b1d6.replaceAll(_0x35e3fe, "").trim();
    const _0x333f4f = _0x524c90.title ? _0x524c90.title : slugToTitle(_0x563baf);
    const _0x72f0d6 = _0x385129;
    const _0x29bd95 = {
      id: _0x563baf,
      title: _0x333f4f,
      body: _0x72f0d6
    };
    return _0x29bd95;
  } catch (_0xef9dc9) {
    if (_0x56fe62) {
      console.log(_0xef9dc9);
    }
    return null;
  }
}
const _0x1c1675 = {
  cleanString: cleanString,
  cleanObjectStrings: cleanObjectStrings,
  extractDocument: extractDocument,
  slugToTitle: slugToTitle,
  stripMeta: stripMeta,
  processMeta: processMeta,
  processVars: processVars
};
var contentProcessors_default = _0x1c1675;
export { contentProcessors_default as default };