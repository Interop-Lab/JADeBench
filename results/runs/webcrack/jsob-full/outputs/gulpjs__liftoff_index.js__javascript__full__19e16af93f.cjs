var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (_0x64f379, _0x5b8842) => function _0x5a2c49() {
  if (!_0x5b8842) {
    (0, _0x64f379[__getOwnPropNames(_0x64f379)[0]])((_0x5b8842 = {
      exports: {}
    }).exports, _0x5b8842);
  }
  return _0x5b8842.exports;
};
var require_find_cwd = __commonJS({
  "../work/gulpjs__liftoff/lib/find_cwd.js"(_0x375f3c, _0x173c71) {
    var _0x4904b5 = require("path");
    _0x173c71.exports = function (_0x2a3367) {
      if (!_0x2a3367) {
        _0x2a3367 = {};
      }
      var _0x284c78 = _0x2a3367.cwd;
      var _0x40eba0 = _0x2a3367.configPath;
      if (typeof _0x40eba0 === "string" && !_0x284c78) {
        _0x284c78 = _0x4904b5.dirname(_0x4904b5.resolve(_0x40eba0));
      }
      if (typeof _0x284c78 === "string") {
        return _0x4904b5.resolve(_0x284c78);
      }
      return process.cwd();
    };
  }
});
var require_array_find = __commonJS({
  "../work/gulpjs__liftoff/lib/array_find.js"(_0x2a7d41, _0x209679) {
    'use strict';

    function _0x18a8b1(_0x3436e2, _0x233260) {
      if (!Array.isArray(_0x3436e2)) {
        return;
      }
      var _0x7821bd = 0;
      while (_0x7821bd < _0x3436e2.length) {
        var _0x7d2103 = _0x233260(_0x3436e2[_0x7821bd]);
        if (_0x7d2103) {
          return _0x7d2103;
        }
        _0x7821bd++;
      }
    }
    _0x209679.exports = _0x18a8b1;
  }
});
var require_file_search = __commonJS({
  "../work/gulpjs__liftoff/lib/file_search.js"(_0x5aa7f2, _0x507a2a) {
    var _0x407e1e = require("findup-sync");
    _0x507a2a.exports = function (_0x41a29c, _0x5624c9) {
      var _0x5173f1;
      var _0x1f6654 = _0x5624c9.length;
      for (var _0x23e0e0 = 0; _0x23e0e0 < _0x1f6654; _0x23e0e0++) {
        if (_0x5173f1) {
          break;
        } else {
          var _0x5d0f9a = {
            cwd: _0x5624c9[_0x23e0e0],
            nocase: true
          };
          _0x5173f1 = _0x407e1e(_0x41a29c, _0x5d0f9a);
        }
      }
      return _0x5173f1;
    };
  }
});
var require_find_config = __commonJS({
  "../work/gulpjs__liftoff/lib/find_config.js"(_0x3ab6e1, _0x1c11a6) {
    var _0x38b055 = require("fs");
    var _0x9f6490 = require("path");
    var _0x121ac2 = require_file_search();
    _0x1c11a6.exports = function (_0x534f74) {
      _0x534f74 = _0x534f74 || {};
      var _0x9f2569 = _0x534f74.configNameSearch;
      var _0x28860c = _0x534f74.configPath;
      var _0x32bf84 = _0x534f74.searchPaths;
      if (!_0x28860c) {
        if (!Array.isArray(_0x32bf84)) {
          throw new Error("Please provide an array of paths to search for config in.");
        }
        if (!_0x9f2569) {
          throw new Error("Please provide a configNameSearch.");
        }
        _0x28860c = _0x121ac2(_0x9f2569, _0x32bf84);
      }
      if (_0x28860c && _0x38b055.existsSync(_0x28860c)) {
        return _0x9f6490.resolve(_0x28860c);
      }
      return null;
    };
  }
});
var require_needs_lookup = __commonJS({
  "../work/gulpjs__liftoff/lib/needs_lookup.js"(_0x5e6922, _0x3e6b60) {
    'use strict';

    var _0x455770 = require("is-plain-object").isPlainObject;
    function _0x25e65a(_0x2dc566) {
      if (typeof _0x2dc566 === "string" && _0x2dc566[0] === ".") {
        return true;
      }
      if (_0x455770(_0x2dc566)) {
        return true;
      }
      return false;
    }
    _0x3e6b60.exports = _0x25e65a;
  }
});
var require_parse_options = __commonJS({
  "../work/gulpjs__liftoff/lib/parse_options.js"(_0x38c59c, _0x42dfad) {
    var _0x3f8681 = require("extend");
    _0x42dfad.exports = function (_0x5993c7) {
      var _0x58caff = {
        extensions: {
          ".js": null,
          ".json": null
        },
        searchPaths: []
      };
      if (!_0x5993c7) {
        _0x5993c7 = {};
      }
      if (_0x5993c7.name) {
        if (!_0x5993c7.processTitle) {
          _0x5993c7.processTitle = _0x5993c7.name;
        }
        if (!_0x5993c7.configName) {
          _0x5993c7.configName = _0x5993c7.name + "file";
        }
        if (!_0x5993c7.moduleName) {
          _0x5993c7.moduleName = _0x5993c7.name;
        }
      }
      if (!_0x5993c7.processTitle) {
        throw new Error("You must specify a processTitle.");
      }
      if (!_0x5993c7.configName) {
        throw new Error("You must specify a configName.");
      }
      if (!_0x5993c7.moduleName) {
        throw new Error("You must specify a moduleName.");
      }
      return _0x3f8681(_0x58caff, _0x5993c7);
    };
  }
});
var require_silent_require = __commonJS({
  "../work/gulpjs__liftoff/lib/silent_require.js"(_0x12aa56, _0x2015be) {
    _0x2015be.exports = function (_0xeedcf) {
      try {
        return require(_0xeedcf);
      } catch (_0x3b77b8) {}
    };
  }
});
var require_build_config_name = __commonJS({
  "../work/gulpjs__liftoff/lib/build_config_name.js"(_0xb5e61d, _0x10176f) {
    _0x10176f.exports = function (_0x9660d5) {
      _0x9660d5 = _0x9660d5 || {};
      var _0x385c0d = _0x9660d5.configName;
      var _0x1acbca = _0x9660d5.extensions;
      if (!_0x385c0d) {
        throw new Error("Please specify a configName.");
      }
      if (_0x385c0d instanceof RegExp) {
        return [_0x385c0d];
      }
      if (!Array.isArray(_0x1acbca)) {
        throw new Error("Please provide an array of valid extensions.");
      }
      return _0x1acbca.map(function (_0x284cf5) {
        return _0x385c0d + _0x284cf5;
      });
    };
  }
});
var require_register_loader = __commonJS({
  "../work/gulpjs__liftoff/lib/register_loader.js"(_0x1efbc7, _0x10926b) {
    var _0x83c70e = require("rechoir");
    _0x10926b.exports = function (_0x15f1ba, _0x4b6348, _0x49cd64, _0x2ad075) {
      _0x4b6348 = _0x4b6348 || {};
      if (typeof _0x49cd64 !== "string") {
        return;
      }
      var _0x4640a5 = _0x83c70e.prepare(_0x4b6348, _0x49cd64, _0x2ad075, true);
      if (_0x4640a5 instanceof Error) {
        _0x4640a5.failures.forEach(function (_0x573944) {
          _0x15f1ba.emit("loader:failure", _0x573944.moduleName, _0x573944.error);
        });
        return;
      }
      if (!Array.isArray(_0x4640a5)) {
        return;
      }
      var _0x93795a = _0x4640a5[_0x4640a5.length - 1];
      _0x15f1ba.emit("loader:success", _0x93795a.moduleName, _0x93795a.module);
    };
  }
});
var require_get_node_flags = __commonJS({
  "../work/gulpjs__liftoff/lib/get_node_flags.js"(_0x58a1ad, _0x3aafa8) {
    function _0x5d57e6(_0x5d3e42, _0x17fa58) {
      if (typeof _0x5d3e42 === "function") {
        return _0x5d3e42.call(this, _0x17fa58);
      }
      if (Array.isArray(_0x5d3e42)) {
        return _0x5d3e42;
      }
      if (typeof _0x5d3e42 === "string") {
        return [_0x5d3e42];
      }
      return [];
    }
    function _0x50e9e7(_0x463049) {
      var _0x5293f1 = [];
      for (var _0x7d447a = 1, _0x3815f7 = _0x463049.length; _0x7d447a < _0x3815f7; _0x7d447a++) {
        var _0x2808f1 = _0x463049[_0x7d447a];
        if (!/^-/.test(_0x2808f1) || _0x2808f1 === "--") {
          break;
        }
        _0x5293f1.push(_0x2808f1);
      }
      return _0x5293f1;
    }
    var _0x36e727 = {
      arrayOrFunction: _0x5d57e6,
      fromReorderedArgv: _0x50e9e7
    };
    _0x3aafa8.exports = _0x36e727;
  }
});
var util = require("util");
var path = require("path");
var EE = require("events").EventEmitter;
var extend = require("extend");
var resolve = require("resolve");
var flaggedRespawn = require("flagged-respawn");
var isPlainObject = require("is-plain-object").isPlainObject;
var fined = require("fined");
var findCwd = require_find_cwd();
var arrayFind = require_array_find();
var findConfig = require_find_config();
var fileSearch = require_file_search();
var needsLookup = require_needs_lookup();
var parseOptions = require_parse_options();
var silentRequire = require_silent_require();
var buildConfigName = require_build_config_name();
var registerLoader = require_register_loader();
var getNodeFlags = require_get_node_flags();
function isString(_0x31af96) {
  return typeof _0x31af96 === "string";
}
function Liftoff(_0x1b06b5) {
  EE.call(this);
  extend(this, parseOptions(_0x1b06b5));
}
util.inherits(Liftoff, EE);
Liftoff.prototype.requireLocal = function (_0x4c9250, _0x21e068) {
  try {
    this.emit("preload:before", _0x4c9250);
    var _0x12a1d5 = {
      basedir: _0x21e068
    };
    var _0x57a02b = require(resolve.sync(_0x4c9250, _0x12a1d5));
    this.emit("preload:success", _0x4c9250, _0x57a02b);
    return _0x57a02b;
  } catch (_0x2ae057) {
    this.emit("preload:failure", _0x4c9250, _0x2ae057);
  }
};
Liftoff.prototype.buildEnvironment = function (_0x226950) {
  _0x226950 = _0x226950 || {};
  var _0x4c8d32 = _0x226950.preload || [];
  if (!Array.isArray(_0x4c8d32)) {
    _0x4c8d32 = [_0x4c8d32];
  }
  var _0x393e21 = this.searchPaths.slice();
  var _0x295276 = this.configName;
  var _0x36a866 = findCwd(_0x226950);
  var _0x31a93a = this.extensions;
  var _0x3fa02e = this;
  function _0x8bec2e(_0x1fb605, _0x368dca) {
    var _0x44e022 = fined(_0x1fb605, _0x368dca);
    if (!_0x44e022) {
      return null;
    }
    if (isPlainObject(_0x44e022.extension)) {
      registerLoader(_0x3fa02e, _0x44e022.extension, _0x44e022.path, _0x36a866);
    }
    return _0x44e022.path;
  }
  function _0x2405b1(_0x32cc0e, _0x40f46e) {
    if (needsLookup(_0x40f46e)) {
      var _0x1b9a31 = {
        cwd: _0x32cc0e,
        extensions: _0x31a93a
      };
      var _0x29e99b = _0x1b9a31;
      var _0x3d3172 = _0x8bec2e(_0x40f46e, _0x29e99b);
      if (!_0x3d3172) {
        var _0x2b2577;
        if (typeof _0x40f46e === "string") {
          _0x2b2577 = _0x40f46e;
        } else {
          _0x2b2577 = _0x40f46e.path || _0x40f46e.name;
        }
        var _0x1e7d69 = "Unable to locate one of your extends.";
        if (_0x2b2577) {
          _0x1e7d69 += " Looking for file: " + path.resolve(_0x32cc0e, _0x2b2577);
        }
        throw new Error(_0x1e7d69);
      }
      return _0x3d3172;
    }
    return _0x40f46e;
  }
  var _0x15b22f = {};
  function _0x443b58(_0x204719, _0x1f4872, _0x132b2f) {
    var _0x53bc4e = _0x2405b1(_0x204719, _0x1f4872);
    if (_0x15b22f[_0x53bc4e]) {
      throw new Error("We encountered a circular extend for file: " + _0x53bc4e + ". Please remove the recursive extends.");
    }
    var _0x220b15;
    try {
      _0x220b15 = require(_0x53bc4e);
    } catch (_0x378a16) {
      throw new Error("Encountered error when loading config file: " + _0x53bc4e);
    }
    if (Object.prototype.hasOwnProperty.call(_0x220b15, _0x295276)) {
      if (isString(_0x220b15[_0x295276])) {
        _0x220b15[_0x295276] = path.resolve(path.dirname(_0x53bc4e), _0x220b15[_0x295276]);
      }
    }
    _0x15b22f[_0x53bc4e] = true;
    if (_0x220b15 && _0x220b15.extends) {
      var _0x1bb6f8 = path.dirname(_0x53bc4e);
      return _0x443b58(_0x1bb6f8, _0x220b15.extends, _0x220b15);
    }
    var _0x2ff587 = extend(true, {}, _0x220b15, _0x132b2f);
    delete _0x2ff587.extends;
    return _0x2ff587;
  }
  var _0x4252c4 = [];
  if (Array.isArray(this.configFiles)) {
    _0x4252c4 = this.configFiles.map(function (_0x497c86) {
      var _0x558d63 = {
        cwd: _0x36a866,
        extensions: _0x31a93a
      };
      var _0x25decc = _0x558d63;
      return _0x8bec2e(_0x497c86, _0x25decc);
    });
  }
  var _0x5da7f5 = _0x4252c4.map(function (_0x4cd997) {
    var _0x1c8bbe = {};
    if (!_0x4cd997) {
      return _0x1c8bbe;
    }
    return _0x443b58(_0x36a866, _0x4cd997, _0x1c8bbe);
  });
  var _0x491772 = arrayFind(_0x5da7f5, function (_0x2dbc87) {
    if (Object.prototype.hasOwnProperty.call(_0x2dbc87, _0x295276)) {
      if (isString(_0x2dbc87[_0x295276])) {
        return _0x2dbc87[_0x295276];
      }
    }
  });
  var _0x3c16b1 = arrayFind(_0x5da7f5, function (_0x572874) {
    if (Object.prototype.hasOwnProperty.call(_0x572874, "preload")) {
      if (Array.isArray(_0x572874.preload)) {
        if (_0x572874.preload.every(isString)) {
          return _0x572874.preload;
        }
      }
      if (isString(_0x572874.preload)) {
        return _0x572874.preload;
      }
    }
  });
  if (_0x226950.cwd) {
    _0x393e21 = [_0x36a866];
  } else {
    _0x393e21.unshift(_0x36a866);
  }
  var _0xc10718 = buildConfigName({
    configName: _0x295276,
    extensions: Object.keys(this.extensions)
  });
  var _0x466d5c = {
    configNameSearch: _0xc10718,
    searchPaths: _0x393e21,
    configPath: _0x226950.configPath || _0x491772
  };
  var _0x44e228 = findConfig(_0x466d5c);
  var _0x1e2deb;
  if (_0x44e228) {
    _0x1e2deb = path.dirname(_0x44e228);
    if (!_0x226950.cwd) {
      _0x36a866 = _0x1e2deb;
    }
  }
  var _0x139053;
  var _0x1d8099;
  try {
    var _0x1564c0 = path.delimiter;
    var _0x59c424 = process.env.NODE_PATH ? process.env.NODE_PATH.split(_0x1564c0) : [];
    _0x139053 = resolve.sync(this.moduleName, {
      basedir: _0x1e2deb || _0x36a866,
      paths: _0x59c424
    });
    _0x1d8099 = silentRequire(fileSearch("package.json", [_0x139053]));
  } catch (_0x1adbee) {}
  if (!_0x139053 && _0x44e228) {
    var _0x5a4267 = fileSearch("package.json", [_0x1e2deb]);
    _0x1d8099 = silentRequire(_0x5a4267);
    if (_0x1d8099 && _0x1d8099.name === this.moduleName) {
      _0x139053 = path.join(path.dirname(_0x5a4267), _0x1d8099.main || "index.js");
      _0x36a866 = _0x1e2deb;
    } else {
      _0x1d8099 = {};
    }
  }
  return {
    cwd: _0x36a866,
    preload: _0x4c8d32.concat(_0x3c16b1 || []),
    completion: _0x226950.completion,
    configNameSearch: _0xc10718,
    configPath: _0x44e228,
    configBase: _0x1e2deb,
    modulePath: _0x139053,
    modulePackage: _0x1d8099 || {},
    configFiles: _0x4252c4,
    config: _0x5da7f5
  };
};
Liftoff.prototype.handleFlags = function (_0x1eb807) {
  if (typeof this.v8flags === "function") {
    this.v8flags(function (_0x7cec8f, _0x210f89) {
      if (_0x7cec8f) {
        _0x1eb807(_0x7cec8f);
      } else {
        _0x1eb807(null, _0x210f89);
      }
    });
  } else {
    process.nextTick(function () {
      _0x1eb807(null, this.v8flags);
    }.bind(this));
  }
};
Liftoff.prototype.prepare = function (_0x2a5d19, _0x1e1930) {
  if (typeof _0x1e1930 !== "function") {
    throw new Error("You must provide a callback function.");
  }
  process.title = this.processTitle;
  var _0x17375e = this.buildEnvironment(_0x2a5d19);
  _0x1e1930.call(this, _0x17375e);
};
Liftoff.prototype.execute = function (_0x3f3198, _0x315c68, _0x6b1679) {
  var _0xda3a8a = _0x3f3198.completion;
  if (_0xda3a8a && this.completions) {
    return this.completions(_0xda3a8a);
  }
  if (typeof _0x315c68 === "function") {
    _0x6b1679 = _0x315c68;
    _0x315c68 = undefined;
  }
  if (typeof _0x6b1679 !== "function") {
    throw new Error("You must provide a callback function.");
  }
  this.handleFlags(function (_0x241da7, _0x43e146) {
    if (_0x241da7) {
      throw _0x241da7;
    }
    _0x43e146 = _0x43e146 || [];
    flaggedRespawn(_0x43e146, process.argv, _0x315c68, _0x49d144.bind(this));
    function _0x49d144(_0x290a9f, _0x605d09, _0x57bc62) {
      if (_0x605d09 !== process) {
        var _0x59d6b7 = getNodeFlags.fromReorderedArgv(_0x57bc62);
        this.emit("respawn", _0x59d6b7, _0x605d09);
      }
      if (_0x290a9f) {
        preloadModules(this, _0x3f3198);
        registerLoader(this, this.extensions, _0x3f3198.configPath, _0x3f3198.cwd);
        _0x6b1679.call(this, _0x3f3198, _0x57bc62);
      }
    }
  }.bind(this));
};
function preloadModules(_0x40b13e, _0x109bd8) {
  var _0x2521b0 = _0x109bd8.cwd;
  _0x109bd8.preload.filter(toUnique).forEach(function (_0x28085b) {
    _0x40b13e.requireLocal(_0x28085b, _0x2521b0);
  });
}
function toUnique(_0x175980, _0x458146, _0x6364fb) {
  return _0x6364fb.indexOf(_0x175980) === _0x458146;
}
module.exports = Liftoff;