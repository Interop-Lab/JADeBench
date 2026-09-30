import _0x24212b from "validator";
var invalidChars = "&'\"/><";
function sanitizer(_0x2be520) {
  _0x2be520 = _0x24212b.blacklist(_0x2be520, invalidChars);
  _0x2be520 = _0x24212b.trim(_0x2be520);
  _0x2be520 = _0x24212b.escape(_0x2be520);
  return _0x2be520;
}
var sanitize_default = sanitizer;
import _0x29fc14 from "node:path";
import _0x42924e from "fs-extra";
import _0x2f311a from "sanitize-filename";
function getFilepath(_0x29d499) {
  let _0xfe422 = _0x29d499.content;
  if (_0x29d499.category) {
    for (const _0xcf2c13 of _0x29d499.category.split("/")) {
      const _0x2c3fbb = _0x2f311a(sanitize_default(_0xcf2c13));
      if (!_0x2c3fbb || _0x2c3fbb === "." || _0x2c3fbb === "..") {
        return null;
      }
      _0xfe422 += "/" + _0x2c3fbb;
    }
  }
  if (_0x29d499.filename) {
    _0xfe422 += "/" + _0x2f311a(sanitize_default(_0x29d499.filename));
  }
  _0xfe422 = _0x29fc14.normalize(_0xfe422);
  const _0x53b24b = _0x29fc14.resolve(_0xfe422);
  const _0x4c370f = _0x29fc14.resolve(_0x29d499.content);
  if (!_0x53b24b.startsWith(_0x4c370f + _0x29fc14.sep)) {
    return null;
  }
  return _0xfe422;
}
async function resolveFilepath(_0x5158dd) {
  if (await _0x42924e.pathExists(_0x5158dd)) {
    return _0x5158dd;
  }
  return _0x5158dd + ".md";
}
function parseFileParam(_0x279506) {
  if (!_0x279506 || _0x279506.trim() === "") {
    return null;
  }
  const _0x2bb25d = _0x279506.split("/").filter(_0x1a558d => _0x1a558d.length > 0);
  if (_0x2bb25d.length === 0) {
    return null;
  }
  if (_0x2bb25d.length > 1) {
    return {
      category: _0x2bb25d.slice(0, -1).join("/"),
      filename: _0x2bb25d[_0x2bb25d.length - 1]
    };
  }
  const _0x1ef5e3 = {
    category: "",
    filename: _0x2bb25d[0]
  };
  return _0x1ef5e3;
}
var getFilepath_default = getFilepath;
export { getFilepath_default as default, parseFileParam, resolveFilepath };