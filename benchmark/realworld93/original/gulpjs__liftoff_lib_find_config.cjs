var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// ../work/gulpjs__liftoff/lib/file_search.js
var require_file_search = __commonJS({
  "../work/gulpjs__liftoff/lib/file_search.js"(exports2, module2) {
    var findup = require("findup-sync");
    module2.exports = function(search, paths) {
      var path2;
      var len = paths.length;
      for (var i = 0; i < len; i++) {
        if (path2) {
          break;
        } else {
          path2 = findup(search, { cwd: paths[i], nocase: true });
        }
      }
      return path2;
    };
  }
});

// ../work/gulpjs__liftoff/lib/find_config.js
var fs = require("fs");
var path = require("path");
var fileSearch = require_file_search();
module.exports = function(opts) {
  opts = opts || {};
  var configNameSearch = opts.configNameSearch;
  var configPath = opts.configPath;
  var searchPaths = opts.searchPaths;
  if (!configPath) {
    if (!Array.isArray(searchPaths)) {
      throw new Error(
        "Please provide an array of paths to search for config in."
      );
    }
    if (!configNameSearch) {
      throw new Error("Please provide a configNameSearch.");
    }
    configPath = fileSearch(configNameSearch, searchPaths);
  }
  if (configPath && fs.existsSync(configPath)) {
    return path.resolve(configPath);
  }
  return null;
};
