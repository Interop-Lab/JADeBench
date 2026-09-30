import _0x58f36e from "node:path";
import _0x5d3e3f from "fs-extra";
import _0x351aa3 from "moment";
var normalizeDir = _0x469094 => _0x469094.replaceAll("\\", "/");
var getSlug = (_0x3ac1ce, _0x1ae4fd) => normalizeDir(_0x3ac1ce).replaceAll(normalizeDir(_0x1ae4fd), "").trim();
async function getLastModified(_0x53310d, _0x56cd4e, _0x5b8c00) {
  if (_0x56cd4e.modified !== undefined) {
    return _0x351aa3(_0x56cd4e.modified).format(_0x53310d.datetime_format);
  }
  const _0x338a6c = _0x58f36e.resolve(_0x53310d.content_dir);
  const _0x284ec3 = [_0x338a6c];
  if (_0x53310d.theme_dir) {
    _0x284ec3.push(_0x58f36e.resolve(_0x53310d.theme_dir));
  }
  const _0x3cd696 = _0x2c571f => _0x284ec3.some(_0x1ce336 => _0x2c571f.startsWith(_0x1ce336 + _0x58f36e.sep) || _0x2c571f === _0x1ce336);
  const _0x373a9f = _0x58f36e.resolve(_0x5b8c00);
  if (!_0x3cd696(_0x373a9f)) {
    throw new Error("Access denied: file path is outside allowed directories");
  }
  const _0xba55a3 = await _0x5d3e3f.realpath(_0x373a9f);
  if (!_0x3cd696(_0xba55a3)) {
    throw new Error("Access denied: file path is outside allowed directories");
  }
  const {
    mtime: _0x52cb8b
  } = await _0x5d3e3f.lstat(_0xba55a3);
  return _0x351aa3(_0x52cb8b).format(_0x53310d.datetime_format);
}
const _0x48559a = {
  normalizeDir: normalizeDir,
  getLastModified: getLastModified,
  getSlug: getSlug
};
var utils_default = _0x48559a;
import _0x3e37bb from "node:path";
import _0x148234 from "fs-extra";
import _0xa672dd from "lodash/snakeCase.js";
import _0x422bfc from "lodash/kebabCase.js";
import _0x2e2072 from "lodash/startCase.js";
import _0x231ed1 from "lodash/trim.js";
import _0x4a04bf from "js-yaml";
var META_REGEX = /^\uFEFF?\/\*([\s\S]*?)\*\//i;
var META_REGEX_YAML = /^\uFEFF?---([\s\S]*?)---/i;
function cleanString(_0x9ed422, _0x55862d = false) {
  _0x9ed422 = _0x9ed422.replaceAll("/", " ").trim();
  if (_0x55862d) {
    return _0xa672dd(_0x9ed422);
  }
  return _0x231ed1(_0x422bfc(_0x9ed422), "-");
}
function cleanObjectStrings(_0x42627e) {
  const _0x5ae31b = {};
  for (const _0x1e6d8e in _0x42627e) {
    if (Object.hasOwn(_0x42627e, _0x1e6d8e)) {
      _0x5ae31b[cleanString(_0x1e6d8e, true)] = ("" + _0x42627e[_0x1e6d8e]).trim();
    }
  }
  return _0x5ae31b;
}
function slugToTitle(_0x4edf42) {
  _0x4edf42 = _0x4edf42.replaceAll(".md", "").trim();
  return _0x2e2072(_0x3e37bb.basename(_0x4edf42).replaceAll(/[-_]/g, " "));
}
function stripMeta(_0x7a7d4c) {
  if (META_REGEX.test(_0x7a7d4c)) {
    return _0x7a7d4c.replace(META_REGEX, "").trim();
  }
  if (META_REGEX_YAML.test(_0x7a7d4c)) {
    return _0x7a7d4c.replace(META_REGEX_YAML, "").trim();
  }
  return _0x7a7d4c.trim();
}
function processMeta(_0x160837) {
  if (META_REGEX.test(_0x160837)) {
    const _0x26206f = {};
    const _0x2eac0f = _0x160837.match(META_REGEX);
    const _0x2c988f = _0x2eac0f?.[1]?.trim() ?? "";
    if (_0x2c988f) {
      const _0x76fb5c = _0x2c988f.split("\n");
      for (const _0x15c64f of _0x76fb5c) {
        const _0x39f1da = _0x15c64f.indexOf(": ");
        if (_0x39f1da <= 0) {
          continue;
        }
        const _0x48fa86 = _0x15c64f.substring(0, _0x39f1da).trim();
        const _0x242413 = _0x15c64f.substring(_0x39f1da + 2).trim();
        if (_0x48fa86 && _0x242413) {
          _0x26206f[cleanString(_0x48fa86, true)] = _0x242413;
        }
      }
    }
    return _0x26206f;
  }
  if (META_REGEX_YAML.test(_0x160837)) {
    const _0x50a8c8 = _0x160837.match(META_REGEX_YAML);
    const _0x22e511 = _0x50a8c8?.[1]?.trim() ?? "";
    const _0x1ff339 = _0x4a04bf.load(_0x22e511);
    return cleanObjectStrings(_0x1ff339);
  }
  return {};
}
function processVars(_0x5811df, _0x2a0922) {
  if (_0x2a0922.variables && Array.isArray(_0x2a0922.variables)) {
    _0x2a0922.variables.forEach(_0x4942ff => {
      _0x5811df = _0x5811df.replaceAll(new RegExp("%" + _0x4942ff.name + "%", "g"), _0x4942ff.content);
    });
  }
  if (_0x2a0922.base_url !== undefined) {
    _0x5811df = _0x5811df.replaceAll("%base_url%", _0x2a0922.base_url);
  }
  if (_0x2a0922.image_url !== undefined) {
    _0x5811df = _0x5811df.replaceAll("%image_url%", _0x2a0922.image_url);
  }
  return _0x5811df;
}
async function extractDocument(_0xee2959, _0xee677b, _0x1803a6) {
  try {
    const _0x18420b = await _0x148234.readFile(_0xee677b, "utf8");
    const _0xb4bd89 = processMeta(_0x18420b);
    const _0x52ea21 = _0xee677b.replaceAll(_0xee2959, "").trim();
    const _0xf855c9 = _0xb4bd89.title ? _0xb4bd89.title : slugToTitle(_0x52ea21);
    const _0x554cad = _0x18420b;
    const _0x336fc4 = {
      id: _0x52ea21,
      title: _0xf855c9,
      body: _0x554cad
    };
    return _0x336fc4;
  } catch (_0x3b573d) {
    if (_0x1803a6) {
      console.log(_0x3b573d);
    }
    return null;
  }
}
const _0x3efd2b = {
  cleanString: cleanString,
  cleanObjectStrings: cleanObjectStrings,
  extractDocument: extractDocument,
  slugToTitle: slugToTitle,
  stripMeta: stripMeta,
  processMeta: processMeta,
  processVars: processVars
};
var contentProcessors_default = _0x3efd2b;
import _0x4033b6 from "node:path";
import _0x2d52c7 from "fs-extra";
import { glob } from "glob";
import _0x6478b9 from "lodash";
import _0x2056cc from "js-yaml";
var metaBool = (_0x15cc4f, _0x42e2b6) => _0x15cc4f ? _0x15cc4f === "true" : _0x42e2b6;
async function handler(_0x36e85d, _0x52f1ab) {
  _0x36e85d = _0x36e85d || "";
  const _0x4a7b62 = _0x36e85d.split(/[\\/]/).slice(0, -1).join("/");
  const _0x2adb19 = utils_default.normalizeDir(_0x4033b6.normalize(_0x52f1ab.content_dir));
  const _0x39a2d9 = await glob(_0x4033b6.join(_0x2adb19, "**", "*"));
  const _0x2fa227 = [];
  _0x2fa227.push({
    slug: ".",
    title: "",
    show_on_home: true,
    show_on_menu: true,
    is_index: true,
    active: _0x4a7b62 === "",
    class: "category-index",
    sort: 0,
    files: []
  });
  const _0x31d6b7 = await Promise.all(_0x39a2d9.map(_0x1374b5 => processFile(_0x52f1ab, _0x36e85d, _0x2adb19, _0x1374b5)));
  for (const _0x2581ef of _0x31d6b7) {
    if (_0x2581ef?.is_directory) {
      _0x2fa227.push(_0x2581ef);
    } else if (_0x2581ef?.is_directory === false) {
      const _0x3231bd = _0x4033b6.dirname(_0x2581ef.slug);
      const _0x4fc68f = _0x2fa227.find(_0x5d5c5d => _0x5d5c5d.slug === _0x3231bd);
      if (_0x4fc68f) {
        _0x4fc68f.files.push(_0x2581ef);
      } else if (_0x52f1ab.debug) {
        console.log("Content ignored", _0x2581ef.slug);
      }
    }
  }
  const _0x162431 = _0x2fa227.toSorted((_0x2677b6, _0x418a7d) => _0x2677b6.sort - _0x418a7d.sort);
  _0x162431.forEach(_0x791f89 => {
    _0x791f89.files = _0x791f89.files.toSorted((_0x2b6604, _0x3d342a) => _0x2b6604.sort - _0x3d342a.sort);
  });
  return _0x162431;
}
async function processFile(_0x2bd5d7, _0x2c9db0, _0x5ee4e1, _0x231ea) {
  const _0x1c962b = _0x4033b6.relative(_0x5ee4e1, _0x231ea);
  const _0x52250e = _0x1c962b.split("\\").join("/");
  const _0x1bec09 = await _0x2d52c7.stat(_0x231ea);
  if (_0x1bec09.isDirectory()) {
    return processDirectory(_0x2bd5d7, _0x2c9db0, _0x5ee4e1, _0x1c962b, _0x52250e);
  }
  if (_0x1bec09.isFile() && _0x4033b6.extname(_0x1c962b) === ".md") {
    return processMarkdownFile(_0x2bd5d7, _0x2c9db0, _0x5ee4e1, _0x231ea, _0x52250e);
  }
  return null;
}
async function processDirectory(_0x461649, _0x5783b0, _0x3854e1, _0x5580a9, _0x55da12) {
  const _0xeb35af = _0x4033b6.join(_0x3854e1, _0x5580a9);
  let _0x3c5b08 = false;
  try {
    const _0x40638e = await _0x2d52c7.lstat(_0x4033b6.join(_0xeb35af, "ignore"));
    _0x3c5b08 = _0x40638e.isFile();
  } catch {}
  if (_0x3c5b08) {
    if (_0x461649.debug) {
      console.log("Directory ignored", _0xeb35af);
    }
    return null;
  }
  let _0x4f4e3a = {};
  try {
    const _0x46f0fb = await _0x2d52c7.readFile(_0x4033b6.join(_0xeb35af, "meta"), "utf8");
    _0x4f4e3a = contentProcessors_default.cleanObjectStrings(_0x2056cc.load(_0x46f0fb));
  } catch (_0x482586) {
    if (_0x461649.debug) {
      console.log("No meta file for", _0xeb35af, _0x482586.message);
    }
  }
  let _0xdde8a = 0;
  if ((_0x461649.category_sort || false) && !_0x4f4e3a.sort) {
    try {
      const _0x297f0b = await _0x2d52c7.readFile(_0x4033b6.join(_0xeb35af, "sort"), "utf8");
      _0xdde8a = Number.parseInt(_0x297f0b, 10);
    } catch (_0xe38cb8) {
      if (_0x461649.debug) {
        console.log("No sort file for", _0xeb35af, _0xe38cb8.message);
      }
    }
  }
  return {
    slug: _0x55da12,
    title: _0x4f4e3a.title || _0x6478b9.startCase(_0x4033b6.basename(_0x5580a9).replaceAll(/[-_]/g, " ")),
    show_on_home: metaBool(_0x4f4e3a.show_on_home, _0x461649.show_on_home_default),
    is_index: false,
    is_directory: true,
    show_on_menu: metaBool(_0x4f4e3a.show_on_menu, _0x461649.show_on_menu_default),
    active: _0x5783b0.startsWith("/" + _0x55da12),
    class: "category-" + contentProcessors_default.cleanString(_0x55da12),
    sort: _0x4f4e3a.sort || _0xdde8a,
    description: _0x4f4e3a.description || "",
    files: []
  };
}
async function processMarkdownFile(_0x165710, _0x41d8f5, _0x2a7dba, _0x500ab5, _0x36003f) {
  const _0x554f6b = _0x165710.page_sort_meta || "";
  try {
    const _0x47b32e = await _0x2d52c7.readFile(_0x500ab5, "utf8");
    let _0x1aa84e = _0x36003f;
    let _0x4f67a0 = 0;
    if (_0x36003f.includes("index.md")) {
      _0x1aa84e = _0x1aa84e.replaceAll("index.md", "");
    }
    _0x1aa84e = _0x1aa84e.replaceAll(".md", "").trim();
    const _0x3c324a = contentProcessors_default.processMeta(_0x47b32e);
    if (_0x554f6b && _0x3c324a[_0x554f6b]) {
      _0x4f67a0 = Number.parseInt(_0x3c324a[_0x554f6b], 10);
    }
    return {
      slug: _0x1aa84e,
      title: _0x3c324a.title ? _0x3c324a.title : contentProcessors_default.slugToTitle(_0x1aa84e),
      show_on_home: metaBool(_0x3c324a.show_on_home, _0x165710.show_on_home_default),
      is_directory: false,
      show_on_menu: metaBool(_0x3c324a.show_on_menu, _0x165710.show_on_menu_default),
      active: _0x41d8f5.trim() === "/" + _0x1aa84e,
      sort: _0x4f67a0
    };
  } catch (_0x3b0f0d) {
    if (_0x165710.debug) {
      console.log(_0x3b0f0d);
    }
    return null;
  }
}
var contents_default = handler;
export { contents_default as default };