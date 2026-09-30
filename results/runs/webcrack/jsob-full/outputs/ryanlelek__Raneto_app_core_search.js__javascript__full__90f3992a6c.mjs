import _0x5737e7 from "node:path";
import _0x45ca10 from "fs-extra";
import _0x25f05a from "lodash/snakeCase.js";
import _0x4c8470 from "lodash/kebabCase.js";
import _0x5f51ed from "lodash/startCase.js";
import _0x277334 from "lodash/trim.js";
import _0x4ca7ac from "js-yaml";
var META_REGEX = /^\uFEFF?\/\*([\s\S]*?)\*\//i;
var META_REGEX_YAML = /^\uFEFF?---([\s\S]*?)---/i;
function cleanString(_0x68f73b, _0x3b7b23 = false) {
  _0x68f73b = _0x68f73b.replaceAll("/", " ").trim();
  if (_0x3b7b23) {
    return _0x25f05a(_0x68f73b);
  }
  return _0x277334(_0x4c8470(_0x68f73b), "-");
}
function cleanObjectStrings(_0x1c709f) {
  const _0x4cd6f5 = {};
  for (const _0x28b3ff in _0x1c709f) {
    if (Object.hasOwn(_0x1c709f, _0x28b3ff)) {
      _0x4cd6f5[cleanString(_0x28b3ff, true)] = ("" + _0x1c709f[_0x28b3ff]).trim();
    }
  }
  return _0x4cd6f5;
}
function slugToTitle(_0x5c868c) {
  _0x5c868c = _0x5c868c.replaceAll(".md", "").trim();
  return _0x5f51ed(_0x5737e7.basename(_0x5c868c).replaceAll(/[-_]/g, " "));
}
function stripMeta(_0x4a4706) {
  if (META_REGEX.test(_0x4a4706)) {
    return _0x4a4706.replace(META_REGEX, "").trim();
  }
  if (META_REGEX_YAML.test(_0x4a4706)) {
    return _0x4a4706.replace(META_REGEX_YAML, "").trim();
  }
  return _0x4a4706.trim();
}
function processMeta(_0x48d718) {
  if (META_REGEX.test(_0x48d718)) {
    const _0xb38ce7 = {};
    const _0x865ead = _0x48d718.match(META_REGEX);
    const _0x602deb = _0x865ead?.[1]?.trim() ?? "";
    if (_0x602deb) {
      const _0x5daaf7 = _0x602deb.split("\n");
      for (const _0x21c43a of _0x5daaf7) {
        const _0x40ccb6 = _0x21c43a.indexOf(": ");
        if (_0x40ccb6 <= 0) {
          continue;
        }
        const _0x43381a = _0x21c43a.substring(0, _0x40ccb6).trim();
        const _0x824945 = _0x21c43a.substring(_0x40ccb6 + 2).trim();
        if (_0x43381a && _0x824945) {
          _0xb38ce7[cleanString(_0x43381a, true)] = _0x824945;
        }
      }
    }
    return _0xb38ce7;
  }
  if (META_REGEX_YAML.test(_0x48d718)) {
    const _0x3fe0d9 = _0x48d718.match(META_REGEX_YAML);
    const _0x34b9b3 = _0x3fe0d9?.[1]?.trim() ?? "";
    const _0x236fad = _0x4ca7ac.load(_0x34b9b3);
    return cleanObjectStrings(_0x236fad);
  }
  return {};
}
function processVars(_0x583430, _0x89c688) {
  if (_0x89c688.variables && Array.isArray(_0x89c688.variables)) {
    _0x89c688.variables.forEach(_0x1303aa => {
      _0x583430 = _0x583430.replaceAll(new RegExp("%" + _0x1303aa.name + "%", "g"), _0x1303aa.content);
    });
  }
  if (_0x89c688.base_url !== undefined) {
    _0x583430 = _0x583430.replaceAll("%base_url%", _0x89c688.base_url);
  }
  if (_0x89c688.image_url !== undefined) {
    _0x583430 = _0x583430.replaceAll("%image_url%", _0x89c688.image_url);
  }
  return _0x583430;
}
async function extractDocument(_0x24ea11, _0x465232, _0x116b63) {
  try {
    const _0x1841e0 = await _0x45ca10.readFile(_0x465232, "utf8");
    const _0x3d1223 = processMeta(_0x1841e0);
    const _0x2fed36 = _0x465232.replaceAll(_0x24ea11, "").trim();
    const _0xbc314a = _0x3d1223.title ? _0x3d1223.title : slugToTitle(_0x2fed36);
    const _0x1a13c4 = _0x1841e0;
    const _0x1a2afb = {
      id: _0x2fed36,
      title: _0xbc314a,
      body: _0x1a13c4
    };
    return _0x1a2afb;
  } catch (_0x35e1cf) {
    if (_0x116b63) {
      console.log(_0x35e1cf);
    }
    return null;
  }
}
const _0xd619b8 = {
  cleanString: cleanString,
  cleanObjectStrings: cleanObjectStrings,
  extractDocument: extractDocument,
  slugToTitle: slugToTitle,
  stripMeta: stripMeta,
  processMeta: processMeta,
  processVars: processVars
};
var contentProcessors_default = _0xd619b8;
import _0x5c20d9 from "node:path";
import _0x1645db from "fs-extra";
import _0x2e4bb7 from "moment";
var normalizeDir = _0x2a1bbf => _0x2a1bbf.replaceAll("\\", "/");
var getSlug = (_0x21be1c, _0x1401d8) => normalizeDir(_0x21be1c).replaceAll(normalizeDir(_0x1401d8), "").trim();
async function getLastModified(_0x91c608, _0x565a7f, _0x333f01) {
  if (_0x565a7f.modified !== undefined) {
    return _0x2e4bb7(_0x565a7f.modified).format(_0x91c608.datetime_format);
  }
  const _0x5081e0 = _0x5c20d9.resolve(_0x91c608.content_dir);
  const _0x31aa7f = [_0x5081e0];
  if (_0x91c608.theme_dir) {
    _0x31aa7f.push(_0x5c20d9.resolve(_0x91c608.theme_dir));
  }
  const _0x47e0a3 = _0x252d91 => _0x31aa7f.some(_0x17aa2a => _0x252d91.startsWith(_0x17aa2a + _0x5c20d9.sep) || _0x252d91 === _0x17aa2a);
  const _0x4bff53 = _0x5c20d9.resolve(_0x333f01);
  if (!_0x47e0a3(_0x4bff53)) {
    throw new Error("Access denied: file path is outside allowed directories");
  }
  const _0x4fc90d = await _0x1645db.realpath(_0x4bff53);
  if (!_0x47e0a3(_0x4fc90d)) {
    throw new Error("Access denied: file path is outside allowed directories");
  }
  const {
    mtime: _0x5d1409
  } = await _0x1645db.lstat(_0x4fc90d);
  return _0x2e4bb7(_0x5d1409).format(_0x91c608.datetime_format);
}
const _0x226c3d = {
  normalizeDir: normalizeDir,
  getLastModified: getLastModified,
  getSlug: getSlug
};
var utils_default = _0x226c3d;
import _0x2d1416 from "sanitize-html";
var allowedTags = _0x2d1416.defaults.allowedTags.concat(["img", "input", "del"]);
const _0x368d84 = {
  ..._0x2d1416.defaults.allowedAttributes
};
_0x368d84.img = ["src", "srcset", "alt", "title", "width", "height", "loading"];
_0x368d84.input = ["type", "checked", "disabled"];
_0x368d84.h1 = ["id"];
_0x368d84.h2 = ["id"];
_0x368d84.h3 = ["id"];
_0x368d84.h4 = ["id"];
_0x368d84.h5 = ["id"];
_0x368d84.h6 = ["id"];
_0x368d84.span = ["class"];
_0x368d84.code = ["class"];
_0x368d84.pre = ["class"];
var allowedAttributes = _0x368d84;
function sanitizeHtmlOutput(_0x15952d) {
  const _0x553d1b = {
    allowedTags: allowedTags,
    allowedAttributes: allowedAttributes
  };
  return _0x2d1416(_0x15952d, _0x553d1b);
}
var sanitizeHtmlOutput_default = sanitizeHtmlOutput;
import _0x5d0df7 from "node:path";
import _0x317783 from "fs-extra";
import _0x30b936 from "lodash/unescape.js";
import _0x533d6a from "sanitize-html";
import { marked } from "marked";
async function handler(_0x1cb85a, _0x156e7c) {
  const _0x4a3efe = utils_default.normalizeDir(_0x5d0df7.normalize(_0x156e7c.content_dir));
  try {
    const _0xb43766 = await _0x317783.readFile(_0x1cb85a, "utf8");
    let _0x10b62f = utils_default.getSlug(_0x1cb85a, _0x4a3efe);
    if (_0x10b62f.includes("index.md")) {
      _0x10b62f = _0x10b62f.replaceAll("index.md", "");
    }
    _0x10b62f = _0x10b62f.replaceAll(".md", "").trim();
    const _0x1bdc4b = contentProcessors_default.processMeta(_0xb43766);
    const _0x2eaf18 = contentProcessors_default.processVars(contentProcessors_default.stripMeta(_0xb43766), _0x156e7c);
    const _0x3abc69 = sanitizeHtmlOutput_default(marked(_0x2eaf18));
    const _0xba641a = _0x1bdc4b.title ? _0x1bdc4b.title : contentProcessors_default.slugToTitle(_0x10b62f);
    const _0x1545fd = _0x30b936(_0x533d6a(_0x3abc69, {
      allowedTags: [],
      allowedAttributes: {}
    }));
    const _0x3a793f = _0x156e7c.excerpt_length || 400;
    const _0x4a78c4 = _0x1545fd.length > _0x3a793f ? _0x1545fd.slice(0, _0x3a793f).trimEnd().replace(/\s\S+$/, "") + "..." : _0x1545fd;
    const _0x1aba3e = {
      slug: _0x10b62f,
      title: _0xba641a,
      body: _0x3abc69,
      excerpt: _0x4a78c4
    };
    return _0x1aba3e;
  } catch (_0x1d76c6) {
    if (_0x156e7c.debug) {
      console.log(_0x1d76c6);
    }
    return null;
  }
}
var page_default = handler;
import _0x19c9cb from "lunr";
import _0x514c15 from "lunr-languages/lunr.stemmer.support.js";
import _0x3e7f0a from "lunr-languages/lunr.multi.js";
import _0x774eba from "lunr-languages/tinyseg.js";
import _0x487fc2 from "lunr-languages/lunr.da.js";
import _0x5c9c83 from "lunr-languages/lunr.de.js";
import _0x2aa01c from "lunr-languages/lunr.es.js";
import _0x1a9079 from "lunr-languages/lunr.fi.js";
import _0x50dad2 from "lunr-languages/lunr.fr.js";
import _0x1b1fd0 from "lunr-languages/lunr.hu.js";
import _0x7a962 from "lunr-languages/lunr.ja.js";
import _0x59dae6 from "lunr-languages/lunr.no.js";
import _0x4730d0 from "lunr-languages/lunr.pt.js";
import _0x273d01 from "lunr-languages/lunr.ro.js";
import _0x5de257 from "lunr-languages/lunr.ru.js";
import _0x21f0c2 from "lunr-languages/lunr.sv.js";
import _0x529f1f from "lunr-languages/lunr.tr.js";
const _0x5cbe1a = {
  da: _0x487fc2,
  de: _0x5c9c83,
  es: _0x2aa01c,
  fi: _0x1a9079,
  fr: _0x50dad2,
  hu: _0x1b1fd0,
  ja: _0x7a962,
  no: _0x59dae6,
  pt: _0x4730d0,
  ro: _0x273d01,
  ru: _0x5de257,
  sv: _0x21f0c2,
  tr: _0x529f1f
};
var languageLoaders = _0x5cbe1a;
var instance = null;
var stemmers = null;
function getLunr(_0x275ea5) {
  if (instance === null) {
    instance = _0x19c9cb;
    _0x514c15(instance);
    _0x3e7f0a(instance);
    _0x774eba(instance);
    _0x275ea5.searchExtraLanguages.forEach(_0x430a69 => {
      if (languageLoaders[_0x430a69]) {
        languageLoaders[_0x430a69](instance);
      }
    });
  }
  return instance;
}
function getStemmers(_0x101d70) {
  if (stemmers === null) {
    const _0x22e193 = ["en"].concat(_0x101d70.searchExtraLanguages);
    stemmers = getLunr(_0x101d70).multiLanguage(..._0x22e193);
  }
  return stemmers;
}
const _0x30fee5 = {
  getLunr: getLunr,
  getStemmers: getStemmers
};
var lunr_default = _0x30fee5;
import _0x470f66 from "node:path";
import { glob } from "glob";
async function handler2(_0x2550a3, _0x18cd9b) {
  const _0x144dd0 = utils_default.normalizeDir(_0x470f66.normalize(_0x18cd9b.content_dir));
  const _0x28441f = await glob(_0x470f66.join(_0x144dd0, "**", "*.md"));
  const _0x2dfe4c = await Promise.all(_0x28441f.map(_0x575b6b => contentProcessors_default.extractDocument(_0x144dd0, _0x575b6b, _0x18cd9b.debug)));
  const _0x59dd12 = _0x2dfe4c.filter(_0x5295e5 => _0x5295e5 !== null);
  const _0x5887d2 = lunr_default.getLunr(_0x18cd9b);
  const _0x30b150 = _0x5887d2(function () {
    this.use(lunr_default.getStemmers(_0x18cd9b));
    this.field("title", {
      boost: 10
    });
    this.field("body");
    this.ref("id");
    _0x59dd12.forEach(_0x473eee => this.add(_0x473eee), this);
  });
  const _0x205e74 = _0x2550a3.replaceAll(/[~*+\-^:]/g, " ").replaceAll(/\s+/g, " ").trim();
  if (!_0x205e74) {
    return [];
  }
  let _0x3de4d0 = _0x30b150.search(_0x205e74);
  if (_0x3de4d0.length === 0 && _0x205e74.includes(" ")) {
    const _0x41ab36 = _0x205e74.split(/\s+/).join(" OR ");
    _0x3de4d0 = _0x30b150.search(_0x41ab36);
  }
  if (_0x3de4d0.length === 0 && _0x205e74.length > 2) {
    _0x3de4d0 = _0x30b150.search(_0x205e74 + "~1");
  }
  if (_0x3de4d0.length === 0) {
    _0x3de4d0 = _0x30b150.search(_0x205e74 + "*");
  }
  if (_0x3de4d0.length === 0) {
    const _0x575ccb = _0x205e74.split(/\s+/).filter(_0xcde79f => _0xcde79f.length > 2);
    const _0x826e4 = _0x575ccb.map(_0x508472 => _0x508472 + "~1").join(" OR ");
    if (_0x826e4) {
      _0x3de4d0 = _0x30b150.search(_0x826e4);
    }
  }
  const _0x3b301c = await Promise.all(_0x3de4d0.map(_0x3a86a9 => processSearchResult(_0x144dd0, _0x18cd9b, _0x2550a3, _0x3a86a9)));
  return _0x3b301c.filter(_0x9df7c4 => _0x9df7c4 !== null);
}
async function processSearchResult(_0x16bae5, _0x3743fa, _0x2fa267, _0x1ddfaf) {
  const _0x419a64 = _0x470f66.join(_0x16bae5, _0x1ddfaf.ref);
  const _0x3d5b53 = await page_default(_0x419a64, _0x3743fa);
  if (!_0x3d5b53) {
    return null;
  }
  const _0xc17f27 = _0x3d5b53.slug.split("/");
  _0x3d5b53.category = _0xc17f27.length > 1 ? _0xc17f27[0] : null;
  if (_0x3d5b53.excerpt) {
    const _0x409a5d = _0x2fa267.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
    _0x3d5b53.excerpt = _0x3d5b53.excerpt.replaceAll(new RegExp("(" + _0x409a5d + ")", "gim"), "<span class=\"search-query\">$1</span>");
  }
  return _0x3d5b53;
}
var search_default = handler2;
export { search_default as default };