'use strict';

const fs = require('fs');
const path = require('path');

function findFile(filename, searchPaths) {
  const matches = [];

  searchPaths.forEach(function checkSearchPath(searchPath) {
    const candidate = path.join(searchPath, filename);
    if (fs.existsSync(candidate)) {
      matches.push(candidate);
    }
  });

  return matches.length ? matches[0] : null;
}

module.exports = function resolveConfig(options) {
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

    configPath = findFile(configNameSearch, searchPaths);
  }

  if (configPath && fs.existsSync(configPath)) {
    return path.resolve(configPath);
  }

  return null;
};
