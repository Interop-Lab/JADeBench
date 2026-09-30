import _0x161645 from "node:path";
import _0x238a12 from "fs-extra";
import _0x2aeeb7 from "moment";
var normalizeDir = _0x2e4119 => _0x2e4119.replaceAll("\\", "/");
var getSlug = (_0x30d4c8, _0x14a1f4) => normalizeDir(_0x30d4c8).replaceAll(normalizeDir(_0x14a1f4), "").trim();
async function getLastModified(_0x59be8, _0x974c8d, _0x175de4) {
  if (_0x974c8d.modified !== undefined) {
    return _0x2aeeb7(_0x974c8d.modified).format(_0x59be8.datetime_format);
  }
  const _0x530315 = _0x161645.resolve(_0x59be8.content_dir);
  const _0xcff138 = [_0x530315];
  if (_0x59be8.theme_dir) {
    _0xcff138.push(_0x161645.resolve(_0x59be8.theme_dir));
  }
  const _0x565ba5 = _0x9cf240 => _0xcff138.some(_0x3e1451 => _0x9cf240.startsWith(_0x3e1451 + _0x161645.sep) || _0x9cf240 === _0x3e1451);
  const _0x2e2bcf = _0x161645.resolve(_0x175de4);
  if (!_0x565ba5(_0x2e2bcf)) {
    throw new Error("Access denied: file path is outside allowed directories");
  }
  const _0x548822 = await _0x238a12.realpath(_0x2e2bcf);
  if (!_0x565ba5(_0x548822)) {
    throw new Error("Access denied: file path is outside allowed directories");
  }
  const {
    mtime: _0x4de17e
  } = await _0x238a12.lstat(_0x548822);
  return _0x2aeeb7(_0x4de17e).format(_0x59be8.datetime_format);
}
const _0x5f5ef7 = {
  normalizeDir: normalizeDir,
  getLastModified: getLastModified,
  getSlug: getSlug
};
var utils_default = _0x5f5ef7;
import _0x59204c from "node:path";
import _0x5763d8 from "fs-extra";
import _0x1ef37f from "lodash/snakeCase.js";
import _0x2cc419 from "lodash/kebabCase.js";
import _0x334f24 from "lodash/startCase.js";
import _0xb15ea9 from "lodash/trim.js";
import _0x4e91ac from "js-yaml";
var META_REGEX = /^\uFEFF?\/\*([\s\S]*?)\*\//i;
var META_REGEX_YAML = /^\uFEFF?---([\s\S]*?)---/i;
function cleanString(_0x12fe77, _0x59e382 = false) {
  _0x12fe77 = _0x12fe77.replaceAll("/", " ").trim();
  if (_0x59e382) {
    return _0x1ef37f(_0x12fe77);
  }
  return _0xb15ea9(_0x2cc419(_0x12fe77), "-");
}
function cleanObjectStrings(_0x1e7b1b) {
  const _0x4c8b03 = {};
  for (const _0x211e03 in _0x1e7b1b) {
    if (Object.hasOwn(_0x1e7b1b, _0x211e03)) {
      _0x4c8b03[cleanString(_0x211e03, true)] = ("" + _0x1e7b1b[_0x211e03]).trim();
    }
  }
  return _0x4c8b03;
}
function slugToTitle(_0x2103a7) {
  _0x2103a7 = _0x2103a7.replaceAll(".md", "").trim();
  return _0x334f24(_0x59204c.basename(_0x2103a7).replaceAll(/[-_]/g, " "));
}
function stripMeta(_0x5f15e0) {
  if (META_REGEX.test(_0x5f15e0)) {
    return _0x5f15e0.replace(META_REGEX, "").trim();
  }
  if (META_REGEX_YAML.test(_0x5f15e0)) {
    return _0x5f15e0.replace(META_REGEX_YAML, "").trim();
  }
  return _0x5f15e0.trim();
}
function processMeta(_0x4079d5) {
  if (META_REGEX.test(_0x4079d5)) {
    const _0x185405 = {};
    const _0x5d8ae4 = _0x4079d5.match(META_REGEX);
    const _0x4831ef = _0x5d8ae4?.[1]?.trim() ?? "";
    if (_0x4831ef) {
      const _0x42a285 = _0x4831ef.split("\n");
      for (const _0xab4f73 of _0x42a285) {
        const _0x4c70d7 = _0xab4f73.indexOf(": ");
        if (_0x4c70d7 <= 0) {
          continue;
        }
        const _0x3e9d0f = _0xab4f73.substring(0, _0x4c70d7).trim();
        const _0x18827e = _0xab4f73.substring(_0x4c70d7 + 2).trim();
        if (_0x3e9d0f && _0x18827e) {
          _0x185405[cleanString(_0x3e9d0f, true)] = _0x18827e;
        }
      }
    }
    return _0x185405;
  }
  if (META_REGEX_YAML.test(_0x4079d5)) {
    const _0x5e04f5 = _0x4079d5.match(META_REGEX_YAML);
    const _0xd15e3a = _0x5e04f5?.[1]?.trim() ?? "";
    const _0x5ab3a8 = _0x4e91ac.load(_0xd15e3a);
    return cleanObjectStrings(_0x5ab3a8);
  }
  return {};
}
function processVars(_0x809856, _0x5066d3) {
  if (_0x5066d3.variables && Array.isArray(_0x5066d3.variables)) {
    _0x5066d3.variables.forEach(_0x424add => {
      _0x809856 = _0x809856.replaceAll(new RegExp("%" + _0x424add.name + "%", "g"), _0x424add.content);
    });
  }
  if (_0x5066d3.base_url !== undefined) {
    _0x809856 = _0x809856.replaceAll("%base_url%", _0x5066d3.base_url);
  }
  if (_0x5066d3.image_url !== undefined) {
    _0x809856 = _0x809856.replaceAll("%image_url%", _0x5066d3.image_url);
  }
  return _0x809856;
}
async function extractDocument(_0x2816b3, _0x4fa3d2, _0x307df1) {
  try {
    const _0x328910 = await _0x5763d8.readFile(_0x4fa3d2, "utf8");
    const _0x27bb93 = processMeta(_0x328910);
    const _0x31d458 = _0x4fa3d2.replaceAll(_0x2816b3, "").trim();
    const _0x435c27 = _0x27bb93.title ? _0x27bb93.title : slugToTitle(_0x31d458);
    const _0x33c19b = _0x328910;
    const _0x37c1e6 = {
      id: _0x31d458,
      title: _0x435c27,
      body: _0x33c19b
    };
    return _0x37c1e6;
  } catch (_0x1a79f3) {
    if (_0x307df1) {
      console.log(_0x1a79f3);
    }
    return null;
  }
}
const _0x1a4a4b = {
  cleanString: cleanString,
  cleanObjectStrings: cleanObjectStrings,
  extractDocument: extractDocument,
  slugToTitle: slugToTitle,
  stripMeta: stripMeta,
  processMeta: processMeta,
  processVars: processVars
};
var contentProcessors_default = _0x1a4a4b;
import _0x1cc10e from "sanitize-html";
var allowedTags = _0x1cc10e.defaults.allowedTags.concat(["img", "input", "del"]);
const _0x376b5b = {
  ..._0x1cc10e.defaults.allowedAttributes
};
_0x376b5b.img = ["src", "srcset", "alt", "title", "width", "height", "loading"];
_0x376b5b.input = ["type", "checked", "disabled"];
_0x376b5b.h1 = ["id"];
_0x376b5b.h2 = ["id"];
_0x376b5b.h3 = ["id"];
_0x376b5b.h4 = ["id"];
_0x376b5b.h5 = ["id"];
_0x376b5b.h6 = ["id"];
_0x376b5b.span = ["class"];
_0x376b5b.code = ["class"];
_0x376b5b.pre = ["class"];
var allowedAttributes = _0x376b5b;
function sanitizeHtmlOutput(_0x511f0d) {
  const _0x3f6818 = {
    allowedTags: allowedTags,
    allowedAttributes: allowedAttributes
  };
  return _0x1cc10e(_0x511f0d, _0x3f6818);
}
var sanitizeHtmlOutput_default = sanitizeHtmlOutput;
import _0x5bd6e9 from "node:path";
import _0x2dc6a7 from "fs-extra";
import _0x5d9f56 from "lodash/unescape.js";
import _0x5b2783 from "sanitize-html";
import { marked } from "marked";
async function handler(_0x34c96c, _0x3d9c84) {
  const _0x378f81 = utils_default.normalizeDir(_0x5bd6e9.normalize(_0x3d9c84.content_dir));
  try {
    const _0x47d665 = await _0x2dc6a7.readFile(_0x34c96c, "utf8");
    let _0x4ac5f2 = utils_default.getSlug(_0x34c96c, _0x378f81);
    if (_0x4ac5f2.includes("index.md")) {
      _0x4ac5f2 = _0x4ac5f2.replaceAll("index.md", "");
    }
    _0x4ac5f2 = _0x4ac5f2.replaceAll(".md", "").trim();
    const _0x251c1c = contentProcessors_default.processMeta(_0x47d665);
    const _0x2ca8f4 = contentProcessors_default.processVars(contentProcessors_default.stripMeta(_0x47d665), _0x3d9c84);
    const _0x5a2a26 = sanitizeHtmlOutput_default(marked(_0x2ca8f4));
    const _0x587c1d = _0x251c1c.title ? _0x251c1c.title : contentProcessors_default.slugToTitle(_0x4ac5f2);
    const _0x7d527 = _0x5d9f56(_0x5b2783(_0x5a2a26, {
      allowedTags: [],
      allowedAttributes: {}
    }));
    const _0x348678 = _0x3d9c84.excerpt_length || 400;
    const _0x13ad8e = _0x7d527.length > _0x348678 ? _0x7d527.slice(0, _0x348678).trimEnd().replace(/\s\S+$/, "") + "..." : _0x7d527;
    const _0x9d9ce6 = {
      slug: _0x4ac5f2,
      title: _0x587c1d,
      body: _0x5a2a26,
      excerpt: _0x13ad8e
    };
    return _0x9d9ce6;
  } catch (_0x20e75b) {
    if (_0x3d9c84.debug) {
      console.log(_0x20e75b);
    }
    return null;
  }
}
var page_default = handler;
export { page_default as default };