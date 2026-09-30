var fs = require('fs');
var path = require('path');

var fileSearch = (function() {
  function fileSearch(configNameSearch, searchPaths) {
    if (!Array.isArray(searchPaths)) {
      throw new Error('Please provide an array of paths to search for config in.');
    }
    if (!configNameSearch) {
      throw new Error('Please provide a configNameSearch.');
    }

    for (var i = 0; i < searchPaths.length; i++) {
      var currentSearchPath = searchPaths[i];
      for (var j = 0; j < configNameSearch.length; j++) {
        var configName = configNameSearch[j];
        var configPath = path.resolve(currentSearchPath, configName);
        if (fs.existsSync(configPath)) {
          return configPath;
        }
      }
    }
    return null;
  }
  return fileSearch;
})();

module.exports = function(options) {
  options = options || {};
  var configNameSearch = options.configNameSearch;
  var configPath = options.configPath;
  var searchPaths = options.searchPaths;

  if (!configPath) {
    if (!Array.isArray(searchPaths)) {
      throw new Error('Please provide an array of paths to search for config in.');
    }
    if (!configNameSearch) {
      throw new Error('Please provide a configNameSearch.');
    }
    configPath = fileSearch(configNameSearch, searchPaths);
  }

  if (configPath && fs.existsSync(configPath)) {
    return path.resolve(configPath);
  }

  return null;
};
