'use strict';

var fs = require('fs');
var path = require('path');

function createFileSearch() {
  var cache = {};

  return function fileSearch(name, paths) {
    var result = cache[name];

    if (result) {
      return result;
    }

    paths.some(function (dir) {
      var filepath = path.join(dir, name);

      if (fs.existsSync(filepath)) {
        result = filepath;
        return true;
      }

      return false;
    });

    cache[name] = result;
    return result;
  };
}

var fileSearch = createFileSearch();

module.exports = function findConfig(options) {
  options = options || {};

  var configNameSearch = options.configNameSearch;
  var configPath = options.configPath;
  var searchPaths = options.searchPaths;

  if (!configPath) {
    if (!Array.isArray(searchPaths)) {
      throw new Error(
        'Please provide an array of paths to search for config in.'
      );
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
