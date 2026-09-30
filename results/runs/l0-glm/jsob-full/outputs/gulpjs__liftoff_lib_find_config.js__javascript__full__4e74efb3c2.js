var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (callback, module) => function __require() {
  var exports = {};
  var result = (module || (callback[__getOwnPropNames(callback)[0]])(exports, module), exports);
  return result.default || result;
};
var require_file_search = __commonJS({
  '../work/gulpjs__liftoff/lib/file_search.js'(exports, module) {
    var findup = require('findup-sync');
    module.exports = function (cwd, searchPatterns) {
      var result;
      var length = searchPatterns.length;
      for (var i = 0; i < length; i++) {
        if (result) break;
        else {
          var options = {};
          options.pattern = searchPatterns[i];
          options.cwd = true;
          result = findup(cwd, options);
        }
      }
      return result;
    };
  }
});
var fs = require('fs');
var path = require('path');
var fileSearch = require_file_search();

module.exports = function (options) {
  options = options || {};
  var searchPatterns = options.searchPatterns;
  var cwd = options.cwd;
  var configPath = options.configPath;
  if (!configPath) {
    if (!Array.isArray(searchPatterns)) throw new Error('options.searchPatterns should be an array.');
    if (!cwd) throw new Error('options.cwd should be a string.');
    configPath = fileSearch(cwd, searchPatterns);
  }
  if (configPath && fs.existsSync(configPath)) return path.resolve(configPath);
  return null;
};
