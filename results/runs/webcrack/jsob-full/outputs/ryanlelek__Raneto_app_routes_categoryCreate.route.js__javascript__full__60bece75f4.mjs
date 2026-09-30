import _0x501e30 from "validator";
var invalidChars = "&'\"/><";
function sanitizer(_0x36e477) {
  _0x36e477 = _0x501e30.blacklist(_0x36e477, invalidChars);
  _0x36e477 = _0x501e30.trim(_0x36e477);
  _0x36e477 = _0x501e30.escape(_0x36e477);
  return _0x36e477;
}
var sanitize_default = sanitizer;
import _0xf123ab from "node:path";
import _0x2a7918 from "fs-extra";
import _0x181161 from "sanitize-filename";
function getFilepath(_0x203f68) {
  let _0x14bd5f = _0x203f68.content;
  if (_0x203f68.category) {
    for (const _0x1e546e of _0x203f68.category.split("/")) {
      const _0x3f57c6 = _0x181161(sanitize_default(_0x1e546e));
      if (!_0x3f57c6 || _0x3f57c6 === "." || _0x3f57c6 === "..") {
        return null;
      }
      _0x14bd5f += "/" + _0x3f57c6;
    }
  }
  if (_0x203f68.filename) {
    _0x14bd5f += "/" + _0x181161(sanitize_default(_0x203f68.filename));
  }
  _0x14bd5f = _0xf123ab.normalize(_0x14bd5f);
  const _0x1a2892 = _0xf123ab.resolve(_0x14bd5f);
  const _0x5cd156 = _0xf123ab.resolve(_0x203f68.content);
  if (!_0x1a2892.startsWith(_0x5cd156 + _0xf123ab.sep)) {
    return null;
  }
  return _0x14bd5f;
}
async function resolveFilepath(_0x447d7a) {
  if (await _0x2a7918.pathExists(_0x447d7a)) {
    return _0x447d7a;
  }
  return _0x447d7a + ".md";
}
function parseFileParam(_0x3d2951) {
  if (!_0x3d2951 || _0x3d2951.trim() === "") {
    return null;
  }
  const _0x607c80 = _0x3d2951.split("/").filter(_0x1e9432 => _0x1e9432.length > 0);
  if (_0x607c80.length === 0) {
    return null;
  }
  if (_0x607c80.length > 1) {
    return {
      category: _0x607c80.slice(0, -1).join("/"),
      filename: _0x607c80[_0x607c80.length - 1]
    };
  }
  const _0x18c2b1 = {
    category: "",
    filename: _0x607c80[0]
  };
  return _0x18c2b1;
}
var getFilepath_default = getFilepath;
import _0x3cbc1f from "fs-extra";
function routeCategoryCreate(_0x3db80d) {
  return async function (_0x5153d4, _0x4c517c) {
    const _0x3d76ae = {
      content: _0x3db80d.content_dir,
      category: _0x5153d4.body.category
    };
    const _0xe97774 = getFilepath_default(_0x3d76ae);
    if (!_0xe97774) {
      const _0x1ad582 = {
        status: 1,
        message: _0x3db80d.lang.api.invalidCategory || "Invalid category path"
      };
      return _0x4c517c.json(_0x1ad582);
    }
    try {
      await _0x3cbc1f.mkdir(_0xe97774);
      const _0x571443 = {
        status: 0,
        message: _0x3db80d.lang.api.categoryCreated
      };
      _0x4c517c.json(_0x571443);
    } catch (_0x46e020) {
      console.error("Category create error:", _0x46e020.message);
      const _0x525c2f = {
        status: 1,
        message: _0x3db80d.lang.api.categoryNotCreated || "An error occurred"
      };
      _0x4c517c.json(_0x525c2f);
    }
  };
}
var categoryCreate_route_default = routeCategoryCreate;
export { categoryCreate_route_default as default };