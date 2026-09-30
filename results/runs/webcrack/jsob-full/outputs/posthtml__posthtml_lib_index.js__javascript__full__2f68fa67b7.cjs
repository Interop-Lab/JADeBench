var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (_0x393aec, _0x232eee) => function _0x274660() {
  if (!_0x232eee) {
    (0, _0x393aec[__getOwnPropNames(_0x393aec)[0]])((_0x232eee = {
      exports: {}
    }).exports, _0x232eee);
  }
  return _0x232eee.exports;
};
var _0x338b93 = {
  "../work/posthtml__posthtml/package.json": function (_0x304469, _0x5cb8ac) {
    var _0x39b5c5 = {};
    _0x39b5c5.name = "posthtml";
    _0x39b5c5.version = "0.16.7";
    _0x39b5c5.description = "HTML/XML processor";
    _0x39b5c5.keywords = ["html", "xml", "postproccessor", "parser", "transform", "transformations", "manipulation", "preprocessor", "processor"];
    _0x39b5c5.main = "lib";
    _0x39b5c5.types = "types/posthtml.d.ts";
    _0x39b5c5.files = ["types", "lib"];
    _0x39b5c5.engines = {};
    _0x39b5c5.dependencies = {};
    _0x39b5c5.devDependencies = {};
    _0x39b5c5.scripts = {};
    _0x39b5c5.author = "Ivan Voischev <voischev.ivan@ya.ru>";
    _0x39b5c5.contributors = [{
      name: "Ivan Voischev",
      email: "voischev.ivan@ya.ru"
    }, {
      name: "Ivan Demidov",
      email: "scrum@list.ru"
    }];
    _0x39b5c5.homepage = "https://github.com/posthtml/posthtml";
    _0x39b5c5.repository = "https://github.com/posthtml/posthtml.git";
    _0x39b5c5.bugs = "https://github.com/posthtml/posthtml/issues";
    _0x39b5c5.license = "MIT";
    _0x39b5c5.engines.node = ">=12.0.0";
    _0x39b5c5.dependencies["posthtml-parser"] = "^0.11.0";
    _0x39b5c5.dependencies["posthtml-render"] = "^3.0.0";
    _0x39b5c5.devDependencies["@commitlint/cli"] = "^16.2.1";
    _0x39b5c5.devDependencies["@commitlint/config-angular"] = "^16.2.1";
    _0x39b5c5.devDependencies.c8 = "^7.7.3";
    _0x39b5c5.devDependencies.chai = "^4.3.4";
    _0x39b5c5.devDependencies["chai-as-promised"] = "^7.1.1";
    _0x39b5c5.devDependencies["chai-subset"] = "^1.6.0";
    _0x39b5c5.devDependencies["conventional-changelog-cli"] = "^2.1.1";
    _0x39b5c5.devDependencies.husky = "^7.0.1";
    _0x39b5c5.devDependencies["jsdoc-to-markdown"] = "^7.0.1";
    _0x39b5c5.devDependencies["lint-staged"] = "^12.3.4";
    _0x39b5c5.devDependencies.mocha = "^9.0.3";
    _0x39b5c5.devDependencies.standard = "^16.0.2";
    _0x39b5c5.scripts.prepare = "husky install";
    _0x39b5c5.scripts.version = "conventional-changelog -i changelog.md -s -r 0 && git add changelog.md";
    _0x39b5c5.scripts.test = "c8 mocha";
    _0x39b5c5.scripts["docs:api"] = "jsdoc2md lib/api.js > docs/api.md";
    _0x39b5c5.scripts["docs:core"] = "jsdoc2md lib/index.js > docs/core.md";
    _0x5cb8ac.exports = _0x39b5c5;
  }
};
var require_package = __commonJS(_0x338b93);
var require_api = __commonJS({
  "../work/posthtml__posthtml/lib/api.js"(_0xd8822a, _0x5924ad) {
    'use strict';

    function _0x4a61a0() {
      this.walk = _0x31f761;
      this.match = _0x20a2cf;
    }
    function _0x31f761(_0xc0dc1f) {
      return _0x31c447(this, _0xc0dc1f);
    }
    function _0x20a2cf(_0x5dd12d, _0x2c98e1) {
      if (Array.isArray(_0x5dd12d)) {
        return _0x31c447(this, _0x2d7143 => {
          for (var _0x39b3cc = 0; _0x39b3cc < _0x5dd12d.length; _0x39b3cc++) {
            if (_0x5618bf(_0x5dd12d[_0x39b3cc], _0x2d7143)) {
              return _0x2c98e1(_0x2d7143);
            }
          }
          return _0x2d7143;
        });
      } else {
        return _0x31c447(this, _0x5a6c4e => {
          if (_0x5618bf(_0x5dd12d, _0x5a6c4e)) {
            return _0x2c98e1(_0x5a6c4e);
          }
          return _0x5a6c4e;
        });
      }
    }
    _0x5924ad.exports = _0x4a61a0;
    _0x5924ad.exports.match = _0x20a2cf;
    _0x5924ad.exports.walk = _0x31f761;
    function _0x31c447(_0x5b2bf7, _0x267a6e) {
      if (Array.isArray(_0x5b2bf7)) {
        for (let _0x17664b = 0; _0x17664b < _0x5b2bf7.length; _0x17664b++) {
          _0x5b2bf7[_0x17664b] = _0x31c447(_0x267a6e(_0x5b2bf7[_0x17664b]), _0x267a6e);
        }
      } else if (_0x5b2bf7 && typeof _0x5b2bf7 === "object" && Object.prototype.hasOwnProperty.call(_0x5b2bf7, "content")) {
        _0x31c447(_0x5b2bf7.content, _0x267a6e);
      }
      return _0x5b2bf7;
    }
    function _0x5618bf(_0x41267b, _0x19b549) {
      if (_0x41267b instanceof RegExp) {
        if (typeof _0x19b549 === "object") {
          return false;
        }
        if (typeof _0x19b549 === "string") {
          return _0x41267b.test(_0x19b549);
        }
      }
      if (typeof _0x41267b !== typeof _0x19b549) {
        return false;
      }
      if (typeof _0x41267b !== "object" || _0x41267b === null) {
        return _0x41267b === _0x19b549;
      }
      if (Array.isArray(_0x41267b)) {
        return _0x41267b.every(_0x8d6169 => [].some.call(_0x19b549, _0x3d8a06 => _0x5618bf(_0x8d6169, _0x3d8a06)));
      }
      return Object.keys(_0x41267b).every(_0x535d9d => {
        const _0x3c6a69 = _0x19b549[_0x535d9d];
        const _0x5d38d5 = _0x41267b[_0x535d9d];
        if (typeof _0x5d38d5 === "object" && _0x5d38d5 !== null && _0x3c6a69 !== null) {
          return _0x5618bf(_0x5d38d5, _0x3c6a69);
        }
        if (typeof _0x5d38d5 === "boolean") {
          return _0x5d38d5 !== (_0x3c6a69 == null);
        }
        return _0x3c6a69 === _0x5d38d5;
      });
    }
  }
});
var pkg = require_package();
var Api = require_api();
var {
  parser
} = require("posthtml-parser");
var {
  render
} = require("posthtml-render");
var PostHTML = class {
  constructor(_0x19c6ec) {
    this.version = pkg.version;
    this.name = pkg.name;
    this.plugins = typeof _0x19c6ec === "function" ? [_0x19c6ec] : _0x19c6ec || [];
    this.source = "";
    this.messages = [];
    this.parser = parser;
    this.render = render;
    Api.call(this);
  }
  use(..._0x1dfc86) {
    this.plugins.push(..._0x1dfc86);
    return this;
  }
  process(_0x28290f, _0x184988 = {}) {
    this.options = _0x184988;
    this.source = _0x28290f;
    if (_0x184988.parser) {
      parser = this.parser = _0x184988.parser;
    }
    if (_0x184988.render) {
      render = this.render = _0x184988.render;
    }
    _0x28290f = _0x184988.skipParse ? _0x28290f || [] : parser(_0x28290f, _0x184988);
    _0x28290f = [].concat(_0x28290f);
    if (_0x184988.sync === true) {
      this.plugins.forEach((_0x463840, _0x1c7fed) => {
        _treeExtendApi(_0x28290f, this);
        let _0x59771e;
        if (_0x463840.length === 2 || isPromise(_0x59771e = _0x463840(_0x28290f))) {
          throw new Error("Can’t process contents in sync mode because of async plugin: " + _0x463840.name);
        }
        if (_0x1c7fed !== this.plugins.length - 1 && !_0x184988.skipParse) {
          _0x28290f = [].concat(_0x28290f);
        }
        _0x28290f = _0x59771e || _0x28290f;
      });
      return lazyResult(render, _0x28290f);
    }
    let _0x5a56cb = 0;
    const _0x731afc = (_0x7d48e8, _0xc7928c) => {
      _treeExtendApi(_0x7d48e8, this);
      if (this.plugins.length <= _0x5a56cb) {
        _0xc7928c(null, _0x7d48e8);
        return;
      }
      function _0x4842eb(_0x2c8a4d) {
        if (_0x2c8a4d && !_0x184988.skipParse) {
          _0x2c8a4d = [].concat(_0x2c8a4d);
        }
        return _0x731afc(_0x2c8a4d || _0x7d48e8, _0xc7928c);
      }
      const _0x505ff9 = this.plugins[_0x5a56cb++];
      if (_0x505ff9.length === 2) {
        _0x505ff9(_0x7d48e8, (_0x229b7f, _0x868218) => {
          if (_0x229b7f) {
            return _0xc7928c(_0x229b7f);
          }
          _0x4842eb(_0x868218);
        });
        return;
      }
      let _0xdf07ad = null;
      const _0xda8539 = tryCatch(() => _0x505ff9(_0x7d48e8), _0x36a544 => {
        _0xdf07ad = _0x36a544;
        return _0x36a544;
      });
      if (_0xdf07ad) {
        _0xc7928c(_0xdf07ad);
        return;
      }
      if (isPromise(_0xda8539)) {
        _0xda8539.then(_0x4842eb).catch(_0xc7928c);
        return;
      }
      _0x4842eb(_0xda8539);
    };
    return new Promise((_0x541b54, _0x281fe2) => {
      _0x731afc(_0x28290f, (_0x17d9f2, _0x439491) => {
        if (_0x17d9f2) {
          _0x281fe2(_0x17d9f2);
        } else {
          _0x541b54(lazyResult(render, _0x439491));
        }
      });
    });
  }
};
module.exports = _0x974284 => new PostHTML(_0x974284);
function _treeExtendApi(_0x4078c3, _0x35ed7d) {
  if (typeof _0x4078c3 === "object") {
    _0x4078c3 = Object.assign(_0x4078c3, _0x35ed7d);
  }
}
function isPromise(_0x32f7f5) {
  return !!_0x32f7f5 && typeof _0x32f7f5.then === "function";
}
function tryCatch(_0xcfa8d1, _0x124174) {
  try {
    return _0xcfa8d1();
  } catch (_0xa41acc) {
    _0x124174(_0xa41acc);
  }
}
function lazyResult(_0x5e83cb, _0x16cb54) {
  return {
    get html() {
      return _0x5e83cb(_0x16cb54, _0x16cb54.options);
    },
    tree: _0x16cb54,
    messages: _0x16cb54.messages
  };
}