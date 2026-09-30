var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

var require_file_search = __commonJS({
  "../work/gulpjs__liftoff/lib/file_search.js"(exports, module) {
    var fs = require("fs");
    var path = require("path");
    module.exports = function(opts) {
      opts = opts || {};
      var configNameSearch = opts.configNameSearch;
      var configPath = opts.configPath;
      var searchPaths = opts.searchPaths;
      if (!configPath) {
        if (!Array.isArray(searchPaths)) {
          throw new Error("Please provide an array of paths to search for config in.");
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
  }
});

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
      throw new Error("Please provide an array of paths to search for config in.");
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
