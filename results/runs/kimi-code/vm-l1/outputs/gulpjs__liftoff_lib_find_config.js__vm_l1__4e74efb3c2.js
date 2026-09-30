'use strict';

const fs = require('fs');
const path = require('path');
const findup = require('findup-sync');

function fileSearch(configNameSearch, searchPaths) {
  let configPath;
  const searchPathCount = searchPaths.length;

  for (let index = 0; index < searchPathCount && !configPath; index++) {
    configPath = findup(configNameSearch, {
      cwd: searchPaths[index],
      nocase: true,
    });
  }

  return configPath;
}

module.exports = function findConfig(options) {
  options = options || {};

  const configNameSearch = options.configNameSearch;
  let configPath = options.configPath;
  const searchPaths = options.searchPaths;

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
