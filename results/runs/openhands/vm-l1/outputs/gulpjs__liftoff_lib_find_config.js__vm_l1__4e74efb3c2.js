const fs = require('fs');
const path = require('path');
const fileSearch = require('findup-sync');

module.exports = function (options) {
  options = options || {};

  const configNameSearch = options.configNameSearch;
  let configPath = options.configPath;
  const searchPaths = options.searchPaths;

  if (!configPath) {
    if (!Array.isArray(searchPaths)) {
      throw new Error(
        'Please provide an array of paths to search for config in.',
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
