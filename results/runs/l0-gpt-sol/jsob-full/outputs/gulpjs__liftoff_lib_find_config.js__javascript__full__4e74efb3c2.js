var fs = require('fs');
var path = require('path');
var findup = require('findup-sync');

function fileSearch(configFiles, searchPaths) {
  var configPath;

  for (var i = 0; i < searchPaths.length; i++) {
    if (configPath) {
      break;
    }

    configPath = findup(configFiles, {
      cwd: searchPaths[i],
      nocase: true
    });
  }

  return configPath;
}

module.exports = function (options) {
  options = options || {};

  var configFiles = options.configFiles;
  var searchPaths = options.searchPaths;
  var configPath = options.configPath;

  if (configPath && fs.existsSync(configPath)) {
    return path.resolve(configPath);
  }

  if (!configPath) {
    if (!Array.isArray(configFiles)) {
      throw new Error('configFiles option must be an array');
    }

    if (!searchPaths) {
      throw new Error('searchPaths option is required');
    }

    configPath = fileSearch(configFiles, searchPaths);
  }

  return configPath || null;
};
